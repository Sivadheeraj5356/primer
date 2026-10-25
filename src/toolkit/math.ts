import type { WS, Q } from './types'

// ---------- Local step-by-step solver (no AI) ----------
type Node =
  | { t: 'n'; v: number }
  | { t: 'x' }
  | { t: 'p'; c: Node }
  | { t: 'neg'; c: Node }
  | { t: 'b'; op: '+' | '-' | '*' | '/' | '^'; l: Node; r: Node }

function tokenize(src: string): string[] {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '').toLowerCase()
  const out: string[] = []
  const re = /(\d+\.?\d*|\.\d+|[()+\-*/^x])/g
  let m: RegExpExecArray | null
  let pos = 0
  while ((m = re.exec(s))) {
    if (m.index !== pos) throw new Error('bad')
    pos = re.lastIndex
    const tk = m[0]
    const prev = out[out.length - 1]
    if (prev && (/^[\d.]/.test(prev) || prev === ')' || prev === 'x') && (/^[\d.]/.test(tk) || tk === '(' || tk === 'x')) out.push('*')
    out.push(tk)
  }
  if (pos !== s.length) throw new Error('bad')
  return out
}

function parse(tokens: string[]): Node {
  let i = 0
  const peek = () => tokens[i]
  const next = () => tokens[i++]
  function expr(): Node {
    let l = term()
    while (peek() === '+' || peek() === '-') { const op = next() as '+' | '-'; l = { t: 'b', op, l, r: term() } }
    return l
  }
  function term(): Node {
    let l = pow()
    while (peek() === '*' || peek() === '/') { const op = next() as '*' | '/'; l = { t: 'b', op, l, r: pow() } }
    return l
  }
  function pow(): Node {
    const l = unary()
    if (peek() === '^') { next(); return { t: 'b', op: '^', l, r: pow() } }
    return l
  }
  function unary(): Node {
    if (peek() === '-') { next(); const c = unary(); return c.t === 'n' ? { t: 'n', v: -c.v } : { t: 'neg', c } }
    if (peek() === '+') { next(); return unary() }
    return atom()
  }
  function atom(): Node {
    const tk = next()
    if (tk === undefined) throw new Error('bad')
    if (tk === '(') { const c = expr(); if (next() !== ')') throw new Error('bad'); return { t: 'p', c } }
    if (tk === 'x') return { t: 'x' }
    if (/^[\d.]/.test(tk)) return { t: 'n', v: parseFloat(tk) }
    throw new Error('bad')
  }
  const n = expr()
  if (i !== tokens.length) throw new Error('bad')
  return n
}

const fmt = (v: number) => String(Math.round(v * 1e6) / 1e6)
function show(n: Node, top = true): string {
  switch (n.t) {
    case 'n': return fmt(n.v)
    case 'x': return 'x'
    case 'p': return `(${show(n.c)})`
    case 'neg': return `-${show(n.c, false)}`
    case 'b': {
      const s = `${show(n.l, false)} ${n.op === '*' ? '×' : n.op === '/' ? '÷' : n.op} ${show(n.r, false)}`
      return top ? s : s
    }
  }
}
function applyOp(op: string, a: number, b: number): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '*') return a * b
  if (op === '/') { if (b === 0) throw new Error('div0'); return a / b }
  return Math.pow(a, b)
}
function evalAt(n: Node, x: number): number {
  switch (n.t) {
    case 'n': return n.v
    case 'x': return x
    case 'p': return evalAt(n.c, x)
    case 'neg': return -evalAt(n.c, x)
    case 'b': return applyOp(n.op, evalAt(n.l, x), evalAt(n.r, x))
  }
}
function hasX(n: Node): boolean {
  return n.t === 'x' ? true : n.t === 'n' ? false : n.t === 'b' ? hasX(n.l) || hasX(n.r) : hasX(n.c)
}
// one reduction: returns [newNode, changed]
function reduce(n: Node): [Node, boolean] {
  switch (n.t) {
    case 'n': case 'x': return [n, false]
    case 'p': {
      if (n.c.t === 'n') return [n.c, true]
      const [c, ch] = reduce(n.c); return [c.t === 'n' ? c : { t: 'p', c }, ch]
    }
    case 'neg': {
      if (n.c.t === 'n') return [{ t: 'n', v: -n.c.v }, true]
      const [c, ch] = reduce(n.c); return [{ t: 'neg', c }, ch]
    }
    case 'b': {
      const [l, cl] = reduce(n.l)
      if (cl) return [{ ...n, l }, true]
      const [r, cr] = reduce(n.r)
      if (cr) return [{ ...n, r }, true]
      if (n.l.t === 'n' && n.r.t === 'n') return [{ t: 'n', v: applyOp(n.op, n.l.v, n.r.v) }, true]
      return [n, false]
    }
  }
}

export interface LocalSolution { steps: string[]; answer: string; check: string }

export function solveLocally(problem: string): LocalSolution | null {
  const p = problem.trim()
  if (!p) return null
  try {
    const pct = p.match(/^(\d+\.?\d*)\s*%\s*(?:of)\s*(\d+\.?\d*)$/i)
    if (pct) {
      const a = parseFloat(pct[1]), b = parseFloat(pct[2])
      const r = (a / 100) * b
      return { steps: [`${a}% means ${a} out of 100, so ${a} ÷ 100 = ${fmt(a / 100)}`, `${fmt(a / 100)} × ${b} = ${fmt(r)}`], answer: fmt(r), check: `${fmt(r)} is ${a}% of ${b}.` }
    }
    const eqParts = p.replace(/\s/g, '').split('=')
    if (eqParts.length === 2 && /x/i.test(p)) {
      const L = parse(tokenize(eqParts[0])), R = parse(tokenize(eqParts[1]))
      const f = (x: number) => evalAt(L, x) - evalAt(R, x)
      const f0 = f(0), f1 = f(1), f2 = f(2)
      const a = f1 - f0
      if (Math.abs(f2 - f1 - a) > 1e-9 || Math.abs(a) < 1e-12) return null
      const x = -f0 / a
      const steps = [
        `Write it as: ${show(L)} = ${show(R)}`,
        `Gather the x terms on one side and plain numbers on the other. Net x amount: ${fmt(a)}x`,
        `Net number to move across: ${fmt(-f0)}  (so ${fmt(a)}x = ${fmt(-f0)})`,
        `Divide both sides by ${fmt(a)}: x = ${fmt(-f0)} ÷ ${fmt(a)} = ${fmt(x)}`,
      ]
      const l = evalAt(L, x), r = evalAt(R, x)
      return { steps, answer: `x = ${fmt(x)}`, check: `Put x = ${fmt(x)} back in: left side ${fmt(l)}, right side ${fmt(r)}. ${Math.abs(l - r) < 1e-9 ? 'They match.' : ''}` }
    }
    if (eqParts.length !== 1) return null
    let node = parse(tokenize(p))
    if (hasX(node)) return null
    const steps: string[] = [`Start: ${show(node)}`]
    for (let guard = 0; guard < 60; guard++) {
      const [nn, ch] = reduce(node)
      if (!ch) break
      node = nn
      steps.push(`= ${show(node)}`)
    }
    if (node.t !== 'n') return null
    if (steps.length === 1) steps.push('It is already a single number.')
    steps.splice(1, 0, 'Work in order: brackets first, then powers, then × and ÷ from left to right, then + and − from left to right.')
    return { steps, answer: fmt(node.v), check: 'The last line is the answer. Estimate roughly to see that it is sensible.' }
  } catch {
    return null
  }
}

// ---------- Maths practice drills (no AI) ----------
export type Op = 'Addition' | 'Subtraction' | 'Multiplication' | 'Division' | 'Mixed'
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

export function makeDrill(grade: number, op: Op, count: number): WS {
  const g = Math.max(1, Math.min(10, grade))
  const max = g <= 1 ? 10 : g === 2 ? 50 : g === 3 ? 200 : g === 4 ? 1000 : g === 5 ? 5000 : 20000
  const tmax = g <= 3 ? 10 : g <= 5 ? 12 : 20
  const ops: Op[] = ['Addition', 'Subtraction', 'Multiplication', 'Division']
  const qs: Q[] = []
  for (let i = 0; i < count; i++) {
    const o = op === 'Mixed' ? ops[rnd(0, g <= 2 ? 1 : 3)] : op
    let text = '', ans = 0
    if (o === 'Addition') { const a = rnd(1, max), b = rnd(1, max); text = `${a} + ${b} =`; ans = a + b }
    else if (o === 'Subtraction') { const a = rnd(1, max), b = rnd(1, a); text = `${a} − ${b} =`; ans = a - b }
    else if (o === 'Multiplication') { const a = rnd(2, tmax), b = rnd(2, g >= 5 ? 99 : tmax); text = `${a} × ${b} =`; ans = a * b }
    else { const b = rnd(2, tmax), q = rnd(2, g >= 5 ? 99 : tmax); text = `${b * q} ÷ ${b} =`; ans = q }
    qs.push({ type: 'short', q: `${text} ______`, answer: String(ans) })
  }
  return {
    title: `Grade ${g} ${op} practice`,
    instructions: 'Work out each answer. Show your working on the side.',
    questions: qs,
    funFact: 'Zero was used as a number in India more than 1,300 years ago.',
    brainTeaser: { q: 'I am an odd number. Take away one letter and I become even. What number am I?', a: 'Seven (take away the s and it becomes even).' },
  }
}
