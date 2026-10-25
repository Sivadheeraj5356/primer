import { useMemo, useRef, useState, type ReactNode } from 'react'
import { callAI, useAIStatus, readAttachment, type Attachment } from './api'
import type { Q, WS } from './types'
import { CHATS } from '../../shared/toolkit'

export function PrintButton({ label = 'Print or save as PDF' }: { label?: string }) {
  return <button className="tk-btn ghost no-print" onClick={() => window.print()}>{label}</button>
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed || 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const LETTERS = 'ABCDEFGH'

// ---------------- Worksheet ----------------
export function WorksheetView({ ws, onChange }: { ws: WS; onChange?: (w: WS) => void }) {
  const [edit, setEdit] = useState(false)
  const [size, setSize] = useState<'A4' | 'Letter'>('A4')
  const [school, setSchool] = useState('')
  const [logo, setLogo] = useState('')
  const [key, setKey] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const seeds = useMemo(() => ws.questions.map((_, i) => i + 7), [ws.questions.length])

  const upd = (i: number, patch: Partial<Q>) => onChange?.({ ...ws, questions: ws.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) })
  const del = (i: number) => onChange?.({ ...ws, questions: ws.questions.filter((_, k) => k !== i) })

  const pickLogo = (f?: File) => {
    if (!f || !f.type.startsWith('image/') || f.size > 1024 * 1024) return
    const r = new FileReader()
    r.onload = () => setLogo(String(r.result))
    r.readAsDataURL(f)
  }

  return (
    <div>
      <style>{`@media print { @page { size: ${size === 'A4' ? 'A4' : 'letter'}; margin: 14mm; } }`}</style>
      <div className="tk-bar no-print">
        <label className="tk-inline">Page
          <select value={size} onChange={(e) => setSize(e.target.value as 'A4' | 'Letter')}><option>A4</option><option>Letter</option></select>
        </label>
        <label className="tk-inline">School name
          <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Optional" />
        </label>
        <button className="tk-btn ghost" onClick={() => fileRef.current?.click()}>{logo ? 'Change logo' : 'Add logo'}</button>
        {logo && <button className="tk-btn ghost" onClick={() => setLogo('')}>Remove logo</button>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickLogo(e.target.files?.[0])} />
        <label className="tk-inline"><input type="checkbox" checked={key} onChange={(e) => setKey(e.target.checked)} /> Answer key page</label>
        {onChange && <button className="tk-btn ghost" onClick={() => setEdit(!edit)}>{edit ? 'Done editing' : 'Edit questions'}</button>}
        <PrintButton />
      </div>

      <div className="tk-sheet print-root">
        <div className="tk-sheet-head">
          {logo && <img src={logo} alt="" className="tk-logo" />}
          <div style={{ flex: 1 }}>
            {school && <div className="tk-school">{school}</div>}
            <h2 className="tk-title" dir="auto">{ws.title}</h2>
          </div>
        </div>
        <div className="tk-nameline"><span>Name: ______________________</span><span>Date: ____________</span><span>Score: ______ / {ws.questions.length}</span></div>
        {ws.instructions && <p className="tk-instr">{ws.instructions}</p>}
        <ol className="tk-qs">
          {ws.questions.map((q, i) => (
            <li key={i} dir="auto">
              {edit ? (
                <div className="tk-edit">
                  <textarea value={q.q} onChange={(e) => upd(i, { q: e.target.value })} rows={2} />
                  {q.type === 'mcq' && q.options?.map((o, k) => (
                    <input key={k} value={o} onChange={(e) => { const opts = [...(q.options || [])]; const wasAns = q.answer === opts[k]; opts[k] = e.target.value; upd(i, { options: opts, ...(wasAns ? { answer: e.target.value } : {}) }) }} />
                  ))}
                  {q.type !== 'match' && <input value={q.answer || ''} onChange={(e) => upd(i, { answer: e.target.value })} placeholder="Answer" />}
                  <button className="tk-btn ghost" onClick={() => del(i)}>Remove question</button>
                </div>
              ) : (
                <QuestionBody q={q} seed={seeds[i] || i + 3} />
              )}
            </li>
          ))}
        </ol>
        {ws.funFact && <div className="tk-callout"><b>Fun fact:</b> {ws.funFact}</div>}
        {ws.brainTeaser && <div className="tk-callout"><b>Brain teaser:</b> {ws.brainTeaser.q}<div className="tk-line">Answer: _____________________</div></div>}

        {key && (
          <div className="tk-key">
            <h3>Answer key: {ws.title}</h3>
            <ol>
              {ws.questions.map((q, i) => (
                <li key={i}>
                  {q.type === 'match'
                    ? q.pairs?.map((p) => `${p.left} → ${p.right}`).join('; ')
                    : <>{q.answer}{q.explanation ? <span className="tk-expl"> - {q.explanation}</span> : null}</>}
                </li>
              ))}
            </ol>
            {ws.brainTeaser && <p><b>Brain teaser:</b> {ws.brainTeaser.a}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionBody({ q, seed }: { q: Q; seed: number }) {
  const rights = useMemo(() => shuffle(q.pairs?.map((p) => p.right) || [], seed), [q.pairs, seed])
  return (
    <div className="tk-q" dir="auto">
      <div>{q.q}</div>
      {q.type === 'mcq' && <ol type="A" className="tk-opts">{q.options?.map((o, k) => <li key={k}>{o}</li>)}</ol>}
      {q.type === 'tf' && <div className="tk-opts-inline">True / False</div>}
      {q.type === 'short' && <div className="tk-line">_______________________________________________</div>}
      {q.type === 'match' && q.pairs && (
        <div className="tk-match">
          <div>{q.pairs.map((p, k) => <div key={k}>{k + 1}. {p.left}</div>)}</div>
          <div>{rights.map((r, k) => <div key={k}>{LETTERS[k]}. {r}</div>)}</div>
        </div>
      )}
    </div>
  )
}

// ---------------- Quiz ----------------
export interface QuizData { title: string; questions: { q: string; options: string[]; answerIndex: number; explanation?: string }[] }
export function QuizView({ data }: { data: QuizData }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => data.questions.map(() => null))
  const [done, setDone] = useState(false)
  const score = picked.filter((p, i) => p === data.questions[i].answerIndex).length
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.title}</h2>
      {data.questions.map((q, i) => (
        <div key={i} className="tk-quizq" dir="auto">
          <div><b>{i + 1}.</b> {q.q}</div>
          <div className="tk-choices">
            {q.options.map((o, k) => {
              const chosen = picked[i] === k
              const cls = done ? (k === q.answerIndex ? 'ok' : chosen ? 'bad' : '') : chosen ? 'sel' : ''
              return <button key={k} disabled={done} className={`tk-choice ${cls}`} onClick={() => setPicked((pp) => pp.map((p, j) => (j === i ? k : p)))}>{LETTERS[k]}. {o}</button>
            })}
          </div>
          {done && q.explanation && <div className="tk-expl">{q.explanation}</div>}
        </div>
      ))}
      <div className="tk-bar no-print">
        {!done
          ? <button className="tk-btn" disabled={picked.some((p) => p === null)} onClick={() => setDone(true)}>Check answers</button>
          : <><strong>Score: {score} / {data.questions.length}</strong><button className="tk-btn ghost" onClick={() => { setPicked(data.questions.map(() => null)); setDone(false) }}>Try again</button></>}
        <PrintButton />
      </div>
    </div>
  )
}

// ---------------- Doc ----------------
export interface DocData { title: string; sections: { heading: string; body?: string; bullets?: string[] }[] }
export function DocView({ data }: { data: DocData }) {
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.title}</h2>
      {data.sections?.map((s, i) => (
        <section key={i} className="tk-sec" dir="auto">
          <h3>{s.heading}</h3>
          {s.body && s.body.split(/\n\s*\n/).map((p, k) => <p key={k}>{p}</p>)}
          {s.bullets && s.bullets.length > 0 && <ul>{s.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul>}
        </section>
      ))}
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Rubric ----------------
export interface RubricData { title: string; levels: string[]; rows: { criterion: string; descriptors: string[] }[] }
export function RubricView({ data }: { data: RubricData }) {
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.title}</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="tk-table">
          <thead><tr><th>Criterion</th>{data.levels.map((l, i) => <th key={i}>{l} ({data.levels.length - i})</th>)}</tr></thead>
          <tbody>{data.rows.map((r, i) => <tr key={i}><th>{r.criterion}</th>{data.levels.map((_, k) => <td key={k}>{r.descriptors[k]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Mind map ----------------
interface MM { title: string; children?: MM[] }
export function MindMapView({ data }: { data: { topic: string; branches: MM[] } }) {
  const NODE_W = 170, GAP_X = 210, ROW = 46
  let leaf = 0
  const nodes: { x: number; y: number; t: string; d: number }[] = []
  const links: [number, number, number, number][] = []
  function place(n: MM, d: number): { y: number; i: number } {
    const kids = (n.children || []).map((k) => place(k, d + 1))
    const y = kids.length ? (kids[0].y + kids[kids.length - 1].y) / 2 : leaf++ * ROW
    const x = d * GAP_X
    const i = nodes.push({ x, y, t: n.title, d }) - 1
    kids.forEach((k) => links.push([x + NODE_W, y, nodes[k.i].x, k.y]))
    return { y, i }
  }
  const root: MM = { title: data.topic, children: data.branches }
  place(root, 0)
  const h = Math.max(leaf, 1) * ROW + 20
  const maxD = Math.max(...nodes.map((n) => n.d))
  const w = maxD * GAP_X + NODE_W + 20
  const colors = ['#1b3b1e', '#2f6a53', '#e26d38', '#8a5a2b']
  const wrap = (s: string) => (s.length <= 22 ? [s] : [s.slice(0, s.lastIndexOf(' ', 22) > 8 ? s.lastIndexOf(' ', 22) : 22), s.slice(s.lastIndexOf(' ', 22) > 8 ? s.lastIndexOf(' ', 22) + 1 : 22)])
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.topic}</h2>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} width={Math.max(w, 600)} role="img" aria-label={`Mind map of ${data.topic}`} style={{ maxWidth: '100%', height: 'auto' }}>
          {links.map((l, i) => <path key={i} d={`M${l[0]} ${l[1] + 18} C${l[0] + 30} ${l[1] + 18} ${l[2] - 30} ${l[3] + 18} ${l[2]} ${l[3] + 18}`} fill="none" stroke="#b9ae92" strokeWidth="1.5" />)}
          {nodes.map((n, i) => {
            const lines = wrap(n.t)
            return (
              <g key={i}>
                <rect x={n.x} y={n.y} width={NODE_W} height={36} rx={10} fill={n.d === 0 ? colors[0] : '#fffdf7'} stroke={colors[Math.min(n.d, 3)]} strokeWidth="1.5" />
                {lines.map((ln, k) => <text key={k} x={n.x + NODE_W / 2} y={n.y + (lines.length === 1 ? 22 : 15 + k * 13)} textAnchor="middle" fontSize="12" fill={n.d === 0 ? '#f5efeb' : '#232a26'}>{ln}</text>)}
              </g>
            )
          })}
        </svg>
      </div>
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Concept map ----------------
export function ConceptMapView({ data }: { data: { topic: string; nodes: { id: string; label: string }[]; links: { from: string; to: string; label: string }[] } }) {
  const W = 720, H = 560, cx = W / 2, cy = H / 2, R = 210
  const pos: Record<string, { x: number; y: number }> = {}
  // Order nodes breadth first from the most connected one so linked concepts sit next to each other.
  const deg: Record<string, number> = {}
  data.links.forEach((l) => { deg[l.from] = (deg[l.from] || 0) + 1; deg[l.to] = (deg[l.to] || 0) + 1 })
  const ids = data.nodes.map((n) => n.id)
  const order: string[] = []
  const queue = [[...ids].sort((a, b) => (deg[b] || 0) - (deg[a] || 0))[0]]
  while (order.length < ids.length) {
    if (!queue.length) queue.push(ids.find((i) => !order.includes(i))!)
    const cur = queue.shift()!
    if (!cur || order.includes(cur)) continue
    order.push(cur)
    data.links.forEach((l) => { const o = l.from === cur ? l.to : l.to === cur ? l.from : null; if (o && !order.includes(o) && ids.includes(o)) queue.push(o) })
  }
  const labelSpots: { x: number; y: number }[] = []
  order.forEach((id, i) => { const a = (i / order.length) * Math.PI * 2 - Math.PI / 2; pos[id] = { x: cx + R * 1.2 * Math.cos(a), y: cy + R * 0.95 * Math.sin(a) } })
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.topic}</h2>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Concept map of ${data.topic}`} style={{ maxWidth: '100%', height: 'auto' }}>
          <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a7f63" /></marker></defs>
          {data.links.map((l, i) => {
            const a = pos[l.from], b = pos[l.to]
            if (!a || !b) return null
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1
            const dup = data.links.filter((m) => (m.from === l.from && m.to === l.to) || (m.from === l.to && m.to === l.from)).length > 1
            const off = dup ? (l.from < l.to ? 22 : -22) : ((i % 3) - 1) * 10
            const nx = -dy / len, ny = dx / len
            const sx = a.x + (dx / len) * 52 + nx * off * 0.5, sy = a.y + (dy / len) * 22 + ny * off * 0.5
            const ex = b.x - (dx / len) * 56 + nx * off * 0.5, ey = b.y - (dy / len) * 26 + ny * off * 0.5
            const mx = (sx + ex) / 2 + nx * off, my = (sy + ey) / 2 + ny * off
            const t = 0.5
            let lx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex
            let ly = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey - 3
            for (let k = 0; k < 12 && labelSpots.some((q) => Math.abs(q.x - lx) < 70 && Math.abs(q.y - ly) < 13); k++) ly += 14
            labelSpots.push({ x: lx, y: ly })
            return (
              <g key={i}>
                <path d={`M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}`} fill="none" stroke="#8a7f63" strokeWidth="1.4" markerEnd="url(#arr)" />
                <text x={lx} y={ly} textAnchor="middle" fontSize="11" fill="#b4501f" stroke="#fffdf7" strokeWidth="3" paintOrder="stroke">{l.label}</text>
              </g>
            )
          })}
          {data.nodes.map((n) => (
            <g key={n.id}>
              <ellipse cx={pos[n.id].x} cy={pos[n.id].y} rx={56} ry={24} fill="#fffdf7" stroke="#1b3b1e" strokeWidth="1.5" />
              <text x={pos[n.id].x} y={pos[n.id].y + 4} textAnchor="middle" fontSize="12" fill="#232a26">{n.label.length > 18 ? n.label.slice(0, 17) + '…' : n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <ul className="tk-props">{data.links.map((l, i) => { const a = data.nodes.find((n) => n.id === l.from), b = data.nodes.find((n) => n.id === l.to); return a && b ? <li key={i}>{a.label} <em>{l.label}</em> {b.label}</li> : null })}</ul>
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Cards + games ----------------
export interface CardsData { title: string; items: { front: string; back: string }[] }
export function CardsView({ data, mode }: { data: CardsData; mode?: 'vocab' | 'teasers' | 'facts' | 'pairs' }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [game, setGame] = useState<'none' | 'match' | 'scramble'>(mode === 'pairs' ? 'match' : 'none')
  const gameable = mode === 'vocab' || mode === 'pairs'
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">{data.title}</h2>
      {gameable && (
        <div className="tk-bar no-print">
          <button className={`tk-btn ${game === 'none' ? '' : 'ghost'}`} onClick={() => setGame('none')}>Flashcards</button>
          <button className={`tk-btn ${game === 'match' ? '' : 'ghost'}`} onClick={() => setGame('match')}>Memory match</button>
          <button className={`tk-btn ${game === 'scramble' ? '' : 'ghost'}`} onClick={() => setGame('scramble')}>Word scramble</button>
        </div>
      )}
      {game === 'match' && gameable ? <MemoryGame items={data.items} />
        : game === 'scramble' && gameable ? <ScrambleGame items={data.items} />
        : (
          <div className="tk-cards">
            {data.items.map((c, i) => (
              <button key={i} className={`tk-flash ${open[i] ? 'open' : ''}`} onClick={() => setOpen({ ...open, [i]: !open[i] })} aria-expanded={!!open[i]}>
                <span className="tk-flash-front">{c.front}</span>
                {open[i] ? <span className="tk-flash-back">{c.back}</span> : <span className="tk-hint no-print">Tap to reveal</span>}
              </button>
            ))}
          </div>
        )}
      <div className="tk-bar no-print"><PrintButton label="Print cards" /></div>
    </div>
  )
}

function MemoryGame({ items }: { items: { front: string; back: string }[] }) {
  const [round, setRound] = useState(1)
  const tiles = useMemo(() => shuffle(items.flatMap((c, i) => [{ id: i, t: c.front }, { id: i, t: c.back }]).map((t, k) => ({ ...t, k })), round * 13 + items.length), [items, round])
  const [flipped, setFlipped] = useState<number[]>([])
  const [found, setFound] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const tap = (k: number) => {
    if (flipped.length === 2 || flipped.includes(k) || found.includes(tiles[k].id)) return
    const nf = [...flipped, k]
    setFlipped(nf)
    if (nf.length === 2) {
      setMoves(moves + 1)
      if (tiles[nf[0]].id === tiles[nf[1]].id) { setFound([...found, tiles[nf[0]].id]); setFlipped([]) }
      else setTimeout(() => setFlipped([]), 900)
    }
  }
  const won = found.length === items.length
  return (
    <div className="no-print">
      <p className="tk-sub">Match each term with its meaning. Moves: {moves}. Pairs found: {found.length} of {items.length}.</p>
      <div className="tk-memory">
        {tiles.map((t, k) => {
          const up = flipped.includes(k) || found.includes(t.id)
          return <button key={t.k} className={`tk-tile ${up ? 'up' : ''} ${found.includes(t.id) ? 'done' : ''}`} onClick={() => tap(k)} aria-label={up ? t.t : 'Hidden card'}>{up ? t.t : '?'}</button>
        })}
      </div>
      {won && <p><strong>All matched in {moves} moves.</strong> <button className="tk-btn" onClick={() => { setRound(round + 1); setFlipped([]); setFound([]); setMoves(0) }}>Play again</button></p>}
    </div>
  )
}

function ScrambleGame({ items }: { items: { front: string; back: string }[] }) {
  const words = useMemo(() => items.filter((c) => /^[\p{L}]{3,14}$/u.test(c.front.trim())), [items])
  const [i, setI] = useState(0)
  const [guess, setGuess] = useState('')
  const [state, setState] = useState<'' | 'ok' | 'no'>('')
  const [score, setScore] = useState(0)
  const scr = useMemo(() => {
    if (!words[i]) return ''
    const w = words[i].front.trim()
    for (let n = 1; n < 20; n++) { const s = shuffle([...w], i * 31 + n).join(''); if (s.toLowerCase() !== w.toLowerCase()) return s }
    return w
  }, [words, i])
  if (!words.length) return <p className="tk-sub">These items are not single words, so scramble does not fit. Try Memory match.</p>
  if (i >= words.length) return <p className="no-print"><strong>Finished: {score} of {words.length}.</strong> <button className="tk-btn" onClick={() => { setI(0); setScore(0); setGuess(''); setState('') }}>Play again</button></p>
  const check = () => {
    const ok = guess.trim().toLowerCase() === words[i].front.trim().toLowerCase()
    setState(ok ? 'ok' : 'no')
    if (ok) { setScore(score + 1); setTimeout(() => { setI(i + 1); setGuess(''); setState('') }, 700) }
  }
  return (
    <div className="no-print">
      <p className="tk-sub">Word {i + 1} of {words.length}</p>
      <div className="tk-scr">{scr.split('').map((c, k) => <span key={k}>{c}</span>)}</div>
      <p className="tk-sub">Clue: {words[i].back}</p>
      <div className="tk-bar">
        <input value={guess} onChange={(e) => { setGuess(e.target.value); setState('') }} onKeyDown={(e) => e.key === 'Enter' && check()} aria-label="Your answer" />
        <button className="tk-btn" onClick={check}>Check</button>
        <button className="tk-btn ghost" onClick={() => { setI(i + 1); setGuess(''); setState('') }}>Skip</button>
      </div>
      {state === 'ok' && <p>Correct.</p>}
      {state === 'no' && <p>Not quite. Try again or skip.</p>}
    </div>
  )
}

// ---------------- Grade ----------------
export interface GradeData { score: number; max: number; summary: string; strengths: string[]; improvements: string[]; criteria: { name: string; score: number; max: number; comment: string }[] }
export function GradeView({ data }: { data: GradeData }) {
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">Suggested mark: {data.score} / {data.max}</h2>
      <p className="tk-sub no-print">AI suggestion. Review it before sharing with a student.</p>
      <p>{data.summary}</p>
      <table className="tk-table">
        <thead><tr><th>Part</th><th>Marks</th><th>Comment</th></tr></thead>
        <tbody>{data.criteria?.map((c, i) => <tr key={i}><th>{c.name}</th><td>{c.score} / {c.max}</td><td>{c.comment}</td></tr>)}</tbody>
      </table>
      <div className="tk-two">
        <div><h3>Strengths</h3><ul>{data.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        <div><h3>To improve</h3><ul>{data.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      </div>
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Maths ----------------
export function MathView({ data }: { data: { steps: string[]; answer: string; check: string; local?: boolean } }) {
  return (
    <div className="tk-card print-root">
      <h2 className="tk-title">Solution</h2>
      <p className="tk-sub no-print">{data.local ? 'Solved on your device with fixed rules. Nothing was sent anywhere.' : 'Written by AI. Check the working before you trust it.'}</p>
      <ol className="tk-steps">{data.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      <p className="tk-answer">Answer: <strong>{data.answer}</strong></p>
      <p className="tk-sub">{data.check}</p>
      <div className="tk-bar no-print"><PrintButton /></div>
    </div>
  )
}

// ---------------- Chat ----------------
export function ChatView({ toolId }: { toolId: string }) {
  const cfg = CHATS[toolId]
  const [msgs, setMsgs] = useState<{ role: 'user' | 'model'; text: string }[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [att, setAtt] = useState<Attachment | null>(null)
  const [agree, setAgree] = useState(false)
  const ai = useAIStatus()
  const fileRef = useRef<HTMLInputElement>(null)
  const send = async () => {
    const t = text.trim()
    if (!t || busy || !agree || ai === false) return
    const next = [...msgs, { role: 'user' as const, text: t }]
    setMsgs(next); setText(''); setBusy(true); setErr('')
    try {
      const r = await callAI({ mode: 'chat', tool: toolId, messages: next, attachment: att ? { mime: att.mime, data: att.data } : undefined })
      setMsgs([...next, { role: 'model', text: r.text }])
      setAtt(null)
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <div className="tk-card">
      <div className="tk-chat" aria-live="polite">
        {msgs.length === 0 && <p className="tk-sub">{cfg.blurb}</p>}
        {msgs.map((m, i) => <div key={i} className={`tk-msg ${m.role}`}>{m.text}</div>)}
        {busy && <div className="tk-msg model">Thinking…</div>}
      </div>
      {err && <p role="alert" className="tk-err">{err}</p>}
      {ai === false && <p role="status" className="tk-off">AI is switched off on this site right now, so chat cannot reply yet.</p>}
      <label className="tk-consent" hidden={ai === false}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I understand that what I type{cfg.upload ? ' and any photo or PDF I attach' : ''} will be sent to Google's Gemini AI service when I press Send. On the free tier Google may use it to improve its products. I will not include a child's name, school, photo or other personal details.</span>
      </label>
      <div className="tk-chatbox">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={cfg.placeholder} rows={2} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
        <div className="tk-bar">
          {cfg.upload && <>
            <button className="tk-btn ghost" onClick={() => fileRef.current?.click()}>{att ? att.name : 'Attach photo or PDF'}</button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" hidden onChange={async (e) => { try { const f = e.target.files?.[0]; if (f) setAtt(await readAttachment(f)) } catch (x: any) { setErr(x.message) } }} />
          </>}
          <button className="tk-btn" onClick={send} disabled={busy || !text.trim() || !agree || ai === false}>Send</button>
          {msgs.length > 0 && <button className="tk-btn ghost" onClick={() => setMsgs([])}>New chat</button>}
        </div>
      </div>
    </div>
  )
}

export function Notice({ children }: { children: ReactNode }) { return <p className="tk-notice no-print">{children}</p> }
