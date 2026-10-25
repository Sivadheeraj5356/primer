import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TOOLS, CHATS, type Field, type ToolSpec, type Audience } from '../../shared/toolkit'
import { callAI, useAIStatus, loadSaved, pushHistory, readAttachment, saveSaved, saveTopic, type Attachment } from './api'
import { LIBRARY } from './library'
import { makeDrill, solveLocally, type Op } from './math'
import type { WS } from './types'
import { ChatView, CardsView, ConceptMapView, DocView, GradeView, MathView, MindMapView, Notice, QuizView, RubricView, WorksheetView } from './render'
import './toolkit.css'

const AUDIENCES: ('All' | Audience)[] = ['All', 'Teachers', 'Students', 'Parents', 'Home tutors']

const SUBJECT_WORDS: [RegExp, string][] = [
  [/math|fraction|decimal|algebra|geometry|addition|subtraction|multipl|divis|number/i, 'Maths'],
  [/science|water cycle|plant|animal|light|force|energy|photosynth|solar|body/i, 'Science'],
  [/english|noun|verb|grammar|pronoun|tense|comprehension|punctuation|essay/i, 'English'],
  [/evs|environment/i, 'EVS'],
  [/history|geography|civics|social/i, 'Social Studies'],
  [/hindi/i, 'Hindi'],
  [/computer|coding|program/i, 'Computer Science'],
]

export function parseQuick(text: string): { tool: string; inputs: Record<string, unknown> } {
  const t = text.trim()
  const inputs: Record<string, unknown> = {}
  const g = t.match(/(?:grade|class|std|standard)\s*(\d{1,2})/i) || t.match(/\b(\d{1,2})(?:st|nd|rd|th)\s*(?:grade|class|std)/i)
  if (g && +g[1] >= 1 && +g[1] <= 10) inputs.grade = g[1]
  const types: string[] = []
  if (/\bmcqs?\b|multiple choice/i.test(t)) types.push('MCQ')
  if (/fill|blank/i.test(t)) types.push('Fill in the blanks')
  if (/short answer/i.test(t)) types.push('Short answer')
  if (/true.{0,4}false|\btf\b/i.test(t)) types.push('True or False')
  if (/match/i.test(t)) types.push('Match the following')
  if (types.length) inputs.types = types
  const c = t.match(/(?:\+|with|of|make|create|generate)?\s*(\d{1,2})\s*(?:mcqs?|questions?|qs?|problems?|fill|true|short|match)/i)
  if (c && +c[1] >= 1 && +c[1] <= 40) inputs.count = +c[1]
  const d = t.match(/\b(easy|medium|hard)\b/i)
  if (d) inputs.difficulty = d[1][0].toUpperCase() + d[1].slice(1).toLowerCase()
  const tp = t.match(/\b(?:on|about|for)\s+(?:the\s+)?([a-z][\w\s,'-]{2,60}?)\s*$/i)
  if (tp) inputs.topic = tp[1].replace(/\b(worksheet|quiz)\b/i, '').trim()
  const subj = SUBJECT_WORDS.find(([re]) => re.test(String(inputs.topic || t)))
  if (subj) inputs.subject = subj[1]
  const tool = /quiz/i.test(t) ? 'quiz' : /lesson/i.test(t) ? 'lesson' : /mind\s*map/i.test(t) ? 'mindmap' : /story/i.test(t) ? 'story' : 'worksheet'
  if (tool === 'quiz' && inputs.count == null) inputs.count = 8
  return { tool, inputs }
}

export function ToolkitHub() {
  const nav = useNavigate()
  const ai = useAIStatus()
  const [aud, setAud] = useState<'All' | Audience>('All')
  const [q, setQ] = useState('')
  const [saved, setSaved] = useState(loadSaved())
  const list = TOOLS.filter((t) => aud === 'All' || t.audience.includes(aud))
  const chats = Object.entries(CHATS).filter(([, c]) => aud === 'All' || c.audience.includes(aud))
  const go = () => { if (!q.trim()) return; const p = parseQuick(q); nav(`/toolkit/${p.tool}`, { state: { prefill: p.inputs, auto: false } }) }
  return (
    <div className="tk">
      <h1 className="tk-h1">Teacher and parent toolkit</h1>
      <p className="tk-lead">Worksheets, quizzes, lesson plans and study helpers for grades 1 to 10. Primer's learning app for young children stays separate and does not use AI. These tools do: what you type is sent to Google's Gemini service to write the result.</p>

      {ai === false && <p role="status" className="tk-off">AI is switched off on this site right now. The AI tools below cannot create anything yet. Worksheet library, maths practice sheets and the plain maths solver still work.</p>}
      <div className="tk-card">
        <h2 className="tk-h2">Quick create</h2>
        <p className="tk-sub">Try "Grade 4 + 10 MCQs on Water Cycle". It fills the Worksheet Maker for you to check.</p>
        <div className="tk-bar">
          <input className="tk-grow" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="Grade 4 + 10 MCQs on Water Cycle" aria-label="Quick create prompt" />
          <button className="tk-btn" onClick={go}>Set it up</button>
        </div>
        <div className="tk-bar">
          <Link className="tk-btn ghost" to="/toolkit/library">Browse library</Link>
          <Link className="tk-btn ghost" to="/toolkit/drills">Maths practice sheets (no AI)</Link>
        </div>
      </div>

      {(saved.topics.length > 0 || saved.history.length > 0) && (
        <div className="tk-card">
          <h2 className="tk-h2">Your saved topics and recent work</h2>
          <p className="tk-sub">Stored only in this browser.</p>
          {saved.topics.length > 0 && <div className="tk-chips">{saved.topics.map((t, i) => <Link key={i} className="tk-chip" to={`/toolkit/${t.tool}`} state={{ prefill: t.inputs }}>{t.label}</Link>)}</div>}
          {saved.history.length > 0 && <ul className="tk-hist">{saved.history.map((h, i) => <li key={i}><Link to={`/toolkit/${h.tool}`} state={{ result: h.data }}>{h.title}</Link> <span className="tk-sub">{new Date(h.at).toLocaleString()}</span></li>)}</ul>}
          <button className="tk-btn ghost" onClick={() => { saveSaved({ topics: [], history: [] }); setSaved({ topics: [], history: [] }) }}>Clear saved items</button>
        </div>
      )}

      <div className="tk-tabs" role="tablist">{AUDIENCES.map((a) => <button key={a} role="tab" aria-selected={aud === a} className={`tk-tab ${aud === a ? 'on' : ''}`} onClick={() => setAud(a)}>{a === 'All' ? 'All tools' : `For ${a.toLowerCase()}`}</button>)}</div>
      <div className="tk-grid">
        {list.map((t) => <Link key={t.id} className="tk-tool" to={`/toolkit/${t.id}`}><h3>{t.title}</h3><p>{t.blurb}</p></Link>)}
        {chats.map(([id, c]) => <Link key={id} className="tk-tool" to={`/toolkit/${id}`}><h3>{c.title}</h3><p>{c.blurb}</p></Link>)}
        <Link className="tk-tool" to="/toolkit/library"><h3>Worksheet Library</h3><p>Ready made worksheets, filtered by country, curriculum, subject and grade. No AI needed.</p></Link>
        <Link className="tk-tool" to="/toolkit/drills"><h3>Maths Practice Sheets</h3><p>Fresh addition, subtraction, times tables and division sheets for any grade. Made on your device.</p></Link>
      </div>
      <p className="tk-sub">Boards and curricula are named so the AI can aim at them. Check each result against your own syllabus before you use it.</p>
    </div>
  )
}

export function Consent({ checked, onChange, attach }: { checked: boolean; onChange: (b: boolean) => void; attach: boolean }) {
  return (
    <label className="tk-consent">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>I understand that what I type{attach ? ' and any photo or PDF I attach' : ''} will be sent to Google's Gemini AI service when I press the button. On the free tier Google may use it to improve its products. I will not include a child's name, school, photo or other personal details.</span>
    </label>
  )
}

function initial(fields: Field[], prefill?: Record<string, unknown>) {
  const v: Record<string, unknown> = {}
  for (const f of fields) v[f.key] = prefill?.[f.key] ?? f.default ?? (f.type === 'checks' ? [] : '')
  return v
}

export function ToolPage() {
  const { tool = '' } = useParams()
  if (CHATS[tool]) return <ChatPage id={tool} />
  const spec = TOOLS.find((t) => t.id === tool)
  if (!spec) return <div className="tk"><h1 className="tk-h1">Tool not found</h1><Link to="/toolkit">Back to the toolkit</Link></div>
  return <SpecPage key={spec.id} spec={spec} />
}

function ChatPage({ id }: { id: string }) {
  const c = CHATS[id]
  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back no-print">← All tools</Link>
      <h1 className="tk-h1">{c.title}</h1>
      <ChatView toolId={id} />
    </div>
  )
}

function SpecPage({ spec }: { spec: ToolSpec }) {
  const loc = useLocation()
  const st = (loc.state || {}) as { prefill?: Record<string, unknown>; result?: any }
  const [vals, setVals] = useState<Record<string, unknown>>(() => initial(spec.fields, st.prefill))
  const [att, setAtt] = useState<Attachment | null>(null)
  const [result, setResult] = useState<any>(st.result ?? null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [local, setLocal] = useState(false)
  const [agree, setAgree] = useState(false)
  const ai = useAIStatus()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const set = (k: string, v: unknown) => setVals((p) => ({ ...p, [k]: v }))
  const mainText = String(vals.topic ?? vals.task ?? vals.question ?? vals.problem ?? vals.idea ?? vals.theme ?? vals.name ?? '').trim()
  const localMath = spec.kind === 'mathsolver' && !att && !!solveLocally(String(vals.problem || ''))
  const needConsent = !localMath
  const canRun = (!needConsent || (agree && ai !== false)) && (mainText.length > 1 || String(vals.source || '').trim().length > 20 || !!att || (spec.id === 'grader' && String(vals.answer || '').trim().length > 1))

  const run = async () => {
    setErr(''); setSavedMsg(''); setLocal(false)
    if (spec.kind === 'mathsolver') {
      const sol = solveLocally(String(vals.problem || ''))
      if (sol && !att) { setResult({ ...sol }); setLocal(true); return }
    }
    setBusy(true); setResult(null)
    try {
      const r = await callAI({ tool: spec.id, inputs: vals, attachment: att ? { mime: att.mime, data: att.data } : undefined })
      setResult(r.data)
      const title = r.data?.title || r.data?.topic || spec.title
      pushHistory(spec.id, `${spec.title}: ${title}`, r.data)
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  const view = useMemo(() => {
    if (!result) return null
    try {
      switch (spec.kind) {
        case 'worksheet': return <WorksheetView ws={result as WS} onChange={setResult} />
        case 'quiz': return <QuizView data={result} />
        case 'doc': return <DocView data={result} />
        case 'rubric': return <RubricView data={result} />
        case 'mindmap': return <MindMapView data={result} />
        case 'conceptmap': return <ConceptMapView data={result} />
        case 'cards': return <CardsView data={result} mode={spec.cardMode} />
        case 'grade': return <GradeView data={result} />
        case 'mathsolver': return <MathView data={{ ...result, local }} />
      }
    } catch { return <p className="tk-err">That result could not be shown. Try again.</p> }
    return null
  }, [result, spec, local])

  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back no-print">← All tools</Link>
      <h1 className="tk-h1 no-print">{spec.title}</h1>
      <p className="tk-lead no-print">{spec.blurb}</p>
      <form className="tk-card tk-form no-print" onSubmit={(e) => { e.preventDefault(); if (canRun && !busy) run() }}>
        <div className="tk-fields">
          {spec.fields.map((f) => (
            <label key={f.key} className={`tk-field ${f.type === 'textarea' || f.type === 'checks' ? 'wide' : ''}`}>
              <span>{f.label}</span>
              {f.type === 'select' && <select value={String(vals[f.key])} onChange={(e) => set(f.key, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>}
              {f.type === 'text' && <input value={String(vals[f.key] ?? '')} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} maxLength={300} />}
              {f.type === 'number' && <input type="number" min={1} max={40} value={String(vals[f.key] ?? '')} onChange={(e) => set(f.key, Math.max(1, Math.min(40, +e.target.value || 1)))} />}
              {f.type === 'textarea' && <textarea rows={4} value={String(vals[f.key] ?? '')} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} maxLength={6000} />}
              {f.type === 'checks' && (
                <span className="tk-checks">{f.options!.map((o) => { const arr = (vals[f.key] as string[]) || []; return <span key={o} className="tk-check"><input type="checkbox" checked={arr.includes(o)} onChange={(e) => set(f.key, e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))} /> {o}</span> })}</span>
              )}
            </label>
          ))}
        </div>
        {ai === false && !localMath && <p role="status" className="tk-off">AI is switched off on this site right now, so this tool cannot create anything yet. The worksheet library, maths practice sheets and the maths solver for plain arithmetic and simple equations still work.</p>}
        {!localMath && ai !== false && <Consent checked={agree} onChange={setAgree} attach={!!spec.upload} />}
        {spec.upload && (
          <div className="tk-upload">
            <label className="tk-btn ghost">{att ? `Attached: ${att.name}` : 'Attach photo, image or PDF (optional)'}
              <input type="file" hidden accept="image/png,image/jpeg,image/webp,application/pdf" onChange={async (e) => { try { const f = e.target.files?.[0]; if (f) { setAtt(await readAttachment(f)); setErr('') } } catch (x: any) { setErr(x.message) } }} />
            </label>
            {att && <button type="button" className="tk-btn ghost" onClick={() => setAtt(null)}>Remove</button>}
          </div>
        )}
        <div className="tk-bar">
          <button className="tk-btn" type="submit" disabled={!canRun || busy}>{busy ? 'Working… this can take up to a minute' : result ? 'Make another' : 'Create'}</button>
          {mainText && <button type="button" className="tk-btn ghost" onClick={() => { saveTopic(spec.id, `${spec.title}: ${mainText}`, vals); setSavedMsg('Topic saved in this browser.') }}>Save this topic</button>}
          {savedMsg && <span className="tk-sub">{savedMsg}</span>}
        </div>
        {spec.kind === 'mathsolver' && <p className="tk-sub">Plain arithmetic, percentages and simple equations are solved on your device and are never sent anywhere.</p>}
        {err && <p role="alert" className="tk-err">{err}</p>}
      </form>
      {busy && <div className="tk-card no-print" aria-live="polite"><p>Writing it now…</p></div>}
      {view && !local && <Notice>AI-generated draft. A teacher must check every fact, answer and relationship before it is used with students. Not curriculum-verified.</Notice>}
      {view}
    </div>
  )
}

export function LibraryPage() {
  const [country, setCountry] = useState('All')
  const [cur, setCur] = useState('All')
  const [subj, setSubj] = useState('All')
  const [grade, setGrade] = useState('All')
  const [open, setOpen] = useState<string | null>(null)
  const uniq = (f: (i: (typeof LIBRARY)[number]) => string) => ['All', ...Array.from(new Set(LIBRARY.map(f)))]
  const items = LIBRARY.filter((i) => (country === 'All' || i.country === country) && (cur === 'All' || i.curriculum === cur) && (subj === 'All' || i.subject === subj) && (grade === 'All' || String(i.grade) === grade))
  const sel = LIBRARY.find((i) => i.id === open)
  if (sel) return (
    <div className="tk">
      <button className="tk-back tk-linkbtn no-print" onClick={() => setOpen(null)}>← Back to library</button>
      <WorksheetView ws={sel.ws} />
    </div>
  )
  const Sel = ({ label, v, set, opts }: { label: string; v: string; set: (s: string) => void; opts: string[] }) => <label className="tk-inline">{label}<select value={v} onChange={(e) => set(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>
  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back">← All tools</Link>
      <h1 className="tk-h1">Worksheet library</h1>
      <p className="tk-lead">Ready made sets you can open, print and answer. They are written by hand for this library, not generated, so they work offline. Need another topic? Use the Worksheet Maker.</p>
      <div className="tk-bar">
        <Sel label="Country" v={country} set={setCountry} opts={uniq((i) => i.country)} />
        <Sel label="Curriculum" v={cur} set={setCur} opts={uniq((i) => i.curriculum)} />
        <Sel label="Subject" v={subj} set={setSubj} opts={uniq((i) => i.subject)} />
        <Sel label="Grade" v={grade} set={setGrade} opts={uniq((i) => String(i.grade))} />
      </div>
      <div className="tk-grid">
        {items.map((i) => (
          <button key={i.id} className="tk-tool" onClick={() => setOpen(i.id)}>
            <span className="tk-sub">{i.country} · {i.curriculum}{i.tag ? ` · ${i.tag}` : ''}</span>
            <h3>{i.ws.title}</h3>
            <p>{i.subject} · {i.minutes} · {i.ws.questions.length} questions</p>
          </button>
        ))}
        {items.length === 0 && <p>No worksheets match these filters.</p>}
      </div>
    </div>
  )
}

export function DrillsPage() {
  const [grade, setGrade] = useState(2)
  const [op, setOp] = useState<Op>('Addition')
  const [n, setN] = useState(20)
  const [ws, setWs] = useState<WS>(() => makeDrill(2, 'Addition', 20))
  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back no-print">← All tools</Link>
      <h1 className="tk-h1 no-print">Maths practice sheets</h1>
      <p className="tk-lead no-print">Fresh numbers every time, made on your device with fixed rules. No AI and nothing is sent anywhere.</p>
      <div className="tk-card tk-bar no-print">
        <label className="tk-inline">Grade<select value={grade} onChange={(e) => setGrade(+e.target.value)}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => <option key={g}>{g}</option>)}</select></label>
        <label className="tk-inline">Type<select value={op} onChange={(e) => setOp(e.target.value as Op)}>{['Addition', 'Subtraction', 'Multiplication', 'Division', 'Mixed'].map((o) => <option key={o}>{o}</option>)}</select></label>
        <label className="tk-inline">Questions<input type="number" min={5} max={40} value={n} onChange={(e) => setN(Math.max(5, Math.min(40, +e.target.value || 5)))} /></label>
        <button className="tk-btn" onClick={() => setWs(makeDrill(grade, op, n))}>Make a new sheet</button>
      </div>
      <WorksheetView ws={ws} />
    </div>
  )
              }
