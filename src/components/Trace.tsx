import { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Text } from '@radix-ui/themes'
import type { Activity } from '../engine/session'
import { speak } from '../engine/speech'
import { TutorBar } from './TutorBar'
import { WARMUP_STROKES } from '../content/tracing'

const SIZE = 360 // css pixels, square
const HIT_RADIUS = 18
const PASS_COVERAGE = 0.72
const STRAY_RADIUS = 30 // px (css): ink farther than this from the guide counts as stray
const MAX_STRAY_RATIO = 0.15

type TraceActivity = Extract<Activity, { kind: 'trace' }>

// Render the guide (shape path or glyph) onto an offscreen canvas and return
// the set of sampled target points the child's stroke should pass near.
function sampleTargets(a: TraceActivity, px: number): { points: [number, number][]; draw: (ctx: CanvasRenderingContext2D) => void } {
  const off = document.createElement('canvas')
  off.width = px; off.height = px
  const ctx = off.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'

  if (a.mode === 'shape') {
    const shape = WARMUP_STROKES.find((s) => s.id === a.content)!
    const path = new Path2D(shape.path)
    ctx.lineWidth = 22
    ctx.lineCap = 'round'
    ctx.save()
    ctx.scale(px / 100, px / 100)
    ctx.stroke(path)
    ctx.restore()
  } else {
    const fontSize = a.mode === 'letter' ? px * 0.72 : px * 0.4
    ctx.font = `${fontSize}px Andika, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(a.content, px / 2, px / 2 + fontSize * 0.06)
  }

  const img = ctx.getImageData(0, 0, px, px).data
  const points: [number, number][] = []
  for (let y = 0; y < px; y += 5) {
    for (let x = 0; x < px; x += 5) {
      if (img[(y * px + x) * 4 + 3] > 100) points.push([x, y])
    }
  }

  const draw = (c: CanvasRenderingContext2D) => {
    c.save()
    c.globalAlpha = 0.16
    if (a.mode === 'shape') {
      const shape = WARMUP_STROKES.find((s) => s.id === a.content)!
      c.strokeStyle = '#232a26'
      c.lineWidth = 22
      c.lineCap = 'round'
      c.save()
      c.scale(px / 100, px / 100)
      c.stroke(new Path2D(shape.path))
      c.restore()
    } else {
      const fontSize = a.mode === 'letter' ? px * 0.72 : px * 0.4
      c.fillStyle = '#232a26'
      c.font = `${fontSize}px Andika, sans-serif`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText(a.content, px / 2, px / 2 + fontSize * 0.06)
    }
    c.restore()
  }
  return { points, draw }
}

export function Trace({ a, onDone }: { a: TraceActivity; onDone: (correct: boolean, firstTry: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetsRef = useRef<[number, number][]>([])
  const hitRef = useRef<Set<number>>(new Set())
  const strokesRef = useRef(0)
  const strayRef = useRef(0)
  const drawingRef = useRef(false)
  const lastRef = useRef<[number, number] | null>(null)
  const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1
  const px = SIZE * dpr

  const [attempts, setAttempts] = useState(0)
  const [coverage, setCoverage] = useState(0)
  const [finished, setFinished] = useState(false)

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, px, px)
    const { draw } = sampleTargets(a, px)
    draw(ctx)
    // Start dot for shapes: where the path begins.
    if (a.mode === 'shape') {
      const shape = WARMUP_STROKES.find((s) => s.id === a.content)!
      const m = shape.path.match(/M\s*([\d.]+)\s*([\d.]+)/)
      if (m) {
        ctx.fillStyle = '#c96a1e'
        ctx.beginPath()
        ctx.arc((parseFloat(m[1]) / 100) * px, (parseFloat(m[2]) / 100) * px, 10 * dpr, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = px
    canvas.height = px
    const { points } = sampleTargets(a, px)
    targetsRef.current = points
    hitRef.current = new Set()
    redraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.content, a.mode])

  const toCanvas = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return [((e.clientX - rect.left) / rect.width) * px, ((e.clientY - rect.top) / rect.height) * px]
  }

  const markHits = (x: number, y: number) => {
    const r = HIT_RADIUS * dpr
    const r2 = r * r
    const strayR = STRAY_RADIUS * dpr
    const strayR2 = strayR * strayR
    let nearest2 = Infinity
    targetsRef.current.forEach(([tx, ty], i) => {
      const dx = tx - x, dy = ty - y
      const d2 = dx * dx + dy * dy
      if (d2 <= r2) hitRef.current.add(i)
      if (d2 < nearest2) nearest2 = d2
    })
    strokesRef.current += 1
    if (nearest2 > strayR2) strayRef.current += 1
  }

  const strokeTo = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.strokeStyle = '#1f5c45'
    ctx.lineWidth = 14 * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const [lx, ly] = lastRef.current ?? [x, y]
    ctx.moveTo(lx, ly)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastRef.current = [x, y]
    markHits(x, y)
    setCoverage(hitRef.current.size / Math.max(1, targetsRef.current.length))
  }

  const check = () => {
    const cov = hitRef.current.size / Math.max(1, targetsRef.current.length)
    const strayRatio = strayRef.current / Math.max(1, strokesRef.current)
    if (cov >= PASS_COVERAGE && strayRatio <= MAX_STRAY_RATIO) {
      setFinished(true)
      speak('Beautiful writing!')
      setTimeout(() => onDone(true, attempts === 0), 800)
    } else if (strayRatio > MAX_STRAY_RATIO) {
      setAttempts(attempts + 1)
      speak('Lovely energy! Try to keep your pen on the grey lines. Tap Clear and go slowly.')
    } else {
      setAttempts(attempts + 1)
      speak('Good start! Cover a little more of the lines, then tap Done again.')
    }
  }

  const clear = () => {
    hitRef.current = new Set()
    strokesRef.current = 0
    strayRef.current = 0
    setCoverage(0)
    redraw()
  }

  return (
    <Box>
      <TutorBar text={`Trace this: ${a.label}. Stay on the grey lines, then tap Done.`} say="" />
      <Flex direction="column" align="center" gap="3">
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          style={{ width: 'min(100%, 360px)', height: 'auto', aspectRatio: '1 / 1' }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId)
            drawingRef.current = true
            const [x, y] = toCanvas(e)
            lastRef.current = [x, y]
            markHits(x, y)
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current) return
            const [x, y] = toCanvas(e)
            strokeTo(x, y)
          }}
          onPointerUp={() => { drawingRef.current = false; lastRef.current = null }}
          onPointerLeave={() => { drawingRef.current = false; lastRef.current = null }}
        />
        <div className="mastery-bar" style={{ width: 'min(100%, 360px)' }}>
          <div style={{ width: `${Math.round(coverage * 100)}%` }} />
        </div>
        <Flex gap="3">
          <Button variant="soft" onClick={clear} disabled={finished}>Clear</Button>
          <Button size="3" onClick={check} disabled={finished}>Done</Button>
        </Flex>
        <Text size="1" color="gray">This checks how much of the guide you covered - it is not a handwriting assessment. Cover {Math.round(PASS_COVERAGE * 100)}% and stay on the lines.</Text>
      </Flex>
    </Box>
  )
    }
