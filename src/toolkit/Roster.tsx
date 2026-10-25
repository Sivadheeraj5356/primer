import { useState } from 'react'
import { Link } from 'react-router-dom'
import { callAI, loadRoster, saveRoster, useAIStatus, type Student } from './api'
import { Notice } from './render'

const SAMPLES: Student[] = [
  { id: 'sample-a', label: 'Sample A', grade: '4', strengths: 'Reads fluently. Helps classmates. Neat handwriting.', growth: 'Needs more practice with times tables.', comment: '' },
  { id: 'sample-b', label: 'Sample B', grade: '4', strengths: 'Curious in science. Asks good questions.', growth: 'Finishing written work on time.', comment: '' },
  { id: 'sample-c', label: 'Sample C', grade: '4', strengths: 'Kind and careful. Strong at drawing diagrams.', growth: 'Speaking up in group talks.', comment: '' },
]
const TONES = ['Warm and encouraging', 'Balanced', 'Formal']
const looksFullName = (s: string) => /^\s*\S{3,}\s+\S{3,}/.test(s)

export function RosterPage() {
  const ai = useAIStatus()
  const [list, setList] = useState<Student[]>(loadRoster())
  const [label, setLabel] = useState('')
  const [subject, setSubject] = useState('English')
  const [tone, setTone] = useState(TONES[0])
  const [open, setOpen] = useState<string | null>(null)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const commit = (n: Student[]) => { setList(n); saveRoster(n) }
  const upd = (id: string, p: Partial<Student>) => commit(list.map((s) => (s.id === id ? { ...s, ...p } : s)))
  const add = () => { const l = label.trim(); if (!l) return; commit([...list, { id: `s${Date.now()}`, label: l, grade: '', strengths: '', growth: '', comment: '' }]); setLabel('') }
  const payload = (s: Student) => ({ name: 'the student', grade: s.grade || '4', subject, strengths: s.strengths, growth: s.growth, tone, language: 'English' })
  const draft = async (s: Student) => {
    if (!agree || busy || ai === false || !(s.strengths.trim() || s.growth.trim())) return
    setBusy(true); setErr('')
    try {
      const r = await callAI({ tool: 'report', inputs: payload(s) })
      const secs: { heading: string; body?: string; bullets?: string[] }[] = r.data?.sections || []
      const text = secs.map((x) => `${x.heading}\n${x.body || ''}${(x.bullets || []).map((b) => `\n- ${b}`).join('')}`).join('\n\n')
      upd(s.id, { comment: text.slice(0, 4000) })
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back no-print">← All tools</Link>
      <h1 className="tk-h1 no-print">Class roster and report comments</h1>
      <p className="tk-lead no-print">Keep a small class list and draft a comment for each student from your notes. The list lives only in this browser. Use the backup buttons on the toolkit page to move it to another device.</p>
      <Notice>Use initials or a nickname, not full names. Do not put a school, address or photo here. Nothing is sent anywhere until you press "Draft comment" and agree below. Even then, the student's label is never sent, only the grade, subject, tone and the notes you typed.</Notice>
      <div className="tk-card tk-form no-print">
        <div className="tk-bar">
          <input className="tk-grow" value={label} maxLength={24} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Initials or nickname, e.g. A.K." aria-label="Student initials or nickname" />
          <button className="tk-btn" onClick={add} disabled={!label.trim() || list.length >= 60}>Add student</button>
          {list.length === 0 && <button className="tk-btn ghost" onClick={() => commit(SAMPLES)}>Try 3 made-up sample students</button>}
          {list.length > 0 && <button className="tk-btn ghost" onClick={() => { if (confirm('Remove every student from this browser?')) commit([]) }}>Clear roster</button>}
        </div>
        {looksFullName(label) && <p className="tk-err" role="alert">That looks like a full name. Please use initials or a nickname.</p>}
        <div className="tk-bar">
          <label>Subject <input value={subject} maxLength={40} onChange={(e) => setSubject(e.target.value)} /></label>
          <label>Tone <select value={tone} onChange={(e) => setTone(e.target.value)}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></label>
        </div>
        {ai === false && <p role="status" className="tk-off">AI is switched off on this site right now, so comments cannot be drafted. You can still keep notes and write comments by hand.</p>}
        <label className="tk-consent" hidden={ai === false}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I understand that when I press "Draft comment", the grade, subject, tone, strengths and areas to grow I typed for that student are sent to Google's Gemini AI service, without the student's label. On the free tier Google may use it to improve its products. I have removed names and personal details from those notes.</span>
        </label>
        {err && <p role="alert" className="tk-err">{err}</p>}
      </div>
      {list.length === 0 && <p className="tk-sub no-print">No students yet. Add one above, or try the made-up samples.</p>}
      {list.map((s) => (
        <div key={s.id} className="tk-card">
          <div className="tk-bar no-print">
            <strong className="tk-grow">{s.label}</strong>
            <button className="tk-btn ghost" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? 'Close' : 'Edit notes'}</button>
            <button className="tk-btn ghost" onClick={() => commit(list.filter((x) => x.id !== s.id))}>Remove</button>
          </div>
          <h2 className="tk-h2 print-only-title" style={{ display: 'none' }}>{s.label}</h2>
          {open === s.id && (
            <div className="tk-form no-print">
              <label>Grade (1 to 10) <input value={s.grade} maxLength={2} inputMode="numeric" onChange={(e) => upd(s.id, { grade: e.target.value.replace(/\D/g, '') })} /></label>
              <label>Strengths <textarea rows={2} value={s.strengths} maxLength={600} onChange={(e) => upd(s.id, { strengths: e.target.value })} /></label>
              <label>Areas to grow <textarea rows={2} value={s.growth} maxLength={600} onChange={(e) => upd(s.id, { growth: e.target.value })} /></label>
              <details className="tk-sub"><summary>Exactly what would be sent</summary><pre className="tk-pre">{JSON.stringify(payload(s), null, 2)}</pre></details>
              <div className="tk-bar"><button className="tk-btn" onClick={() => draft(s)} disabled={busy || !agree || ai === false || !(s.strengths.trim() || s.growth.trim())}>{busy ? 'Drafting…' : 'Draft comment'}</button></div>
            </div>
          )}
          <label className="no-print">Comment (you can edit it)
            <textarea rows={6} value={s.comment} maxLength={4000} onChange={(e) => upd(s.id, { comment: e.target.value })} placeholder="Write by hand or draft with AI. Teacher review needed before sharing." />
          </label>
          {s.comment && <p className="tk-sub no-print">AI drafts are not checked for accuracy. Read and edit before sharing.</p>}
        </div>
      ))}
    </div>
  )
}
