import { useEffect, useState } from 'react'

/** null while unknown, false when the server has AI switched off. */
export function useAIStatus(): boolean | null {
  const [on, setOn] = useState<boolean | null>(null)
  useEffect(() => {
    fetch('/api/ai/status').then((r) => r.json()).then((d) => setOn(!!d.enabled)).catch(() => setOn(false))
  }, [])
  return on
}

export interface Attachment { mime: string; data: string; name: string }

export async function callAI(body: unknown): Promise<any> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 110000)
  try {
    const res = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal })
    let data: any = null
    try { data = await res.json() } catch { /* fallthrough */ }
    if (!res.ok || !data) throw new Error(data?.error || 'Something went wrong. Please try again.')
    return data
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('That took too long. Please try again.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export function readAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    if (file.size > 3 * 1024 * 1024) return reject(new Error('File is too large. Use one under 3 MB.'))
    if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type)) return reject(new Error('Use a PNG, JPG, WEBP or PDF file.'))
    const r = new FileReader()
    r.onload = () => resolve({ mime: file.type, data: String(r.result).split(',')[1] || '', name: file.name })
    r.onerror = () => reject(new Error('Could not read the file.'))
    r.readAsDataURL(file)
  })
}

const KEY = 'primer.toolkit.v1'
export interface Saved { topics: { tool: string; label: string; inputs: Record<string, unknown> }[]; history: { tool: string; title: string; at: number; data: unknown }[] }
export function loadSaved(): Saved {
  try { const v = JSON.parse(localStorage.getItem(KEY) || ''); return { topics: v.topics || [], history: v.history || [] } } catch { return { topics: [], history: [] } }
}
export function saveSaved(s: Saved) {
  try { localStorage.setItem(KEY, JSON.stringify({ topics: s.topics.slice(0, 20), history: s.history.slice(0, 12) })) } catch { /* quota */ }
}
export function pushHistory(tool: string, title: string, data: unknown) {
  const s = loadSaved()
  s.history.unshift({ tool, title, at: Date.now(), data })
  saveSaved(s)
}
export function saveTopic(tool: string, label: string, inputs: Record<string, unknown>) {
  const s = loadSaved()
  if (!s.topics.some((t) => t.tool === tool && t.label === label)) s.topics.unshift({ tool, label, inputs })
  saveSaved(s)
}

/* ---------- Local class roster (stays in this browser only) ---------- */
export interface Student { id: string; label: string; grade: string; strengths: string; growth: string; comment: string }
const RKEY = 'primer.roster.v1'
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')
export function cleanStudents(v: unknown): Student[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 60).map((s: any, i) => ({
    id: cap(s?.id, 40) || `s${Date.now()}${i}`,
    label: cap(s?.label, 24), grade: cap(s?.grade, 3), strengths: cap(s?.strengths, 600), growth: cap(s?.growth, 600), comment: cap(s?.comment, 4000),
  })).filter((s) => s.label.trim())
}
export function loadRoster(): Student[] {
  try { return cleanStudents(JSON.parse(localStorage.getItem(RKEY) || '[]')) } catch { return [] }
}
export function saveRoster(r: Student[]) {
  try { localStorage.setItem(RKEY, JSON.stringify(cleanStudents(r))) } catch { /* quota */ }
}

/* ---------- Backup: export and import ---------- */
export const BACKUP_APP = 'primer-toolkit-backup'
export function buildBackup() {
  return { app: BACKUP_APP, version: 1, exportedAt: new Date().toISOString(), saved: loadSaved(), roster: loadRoster() }
}
function plain(v: unknown, depth = 0): unknown {
  if (depth > 8) return null
  if (typeof v === 'string') return v.slice(0, 20000)
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'boolean' || v === null) return v
  if (Array.isArray(v)) return v.slice(0, 200).map((x) => plain(x, depth + 1))
  if (typeof v === 'object') {
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(v as object).slice(0, 60)) { if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue; o[k] = plain((v as any)[k], depth + 1) }
    return o
  }
  return null
}
/** Parses an untrusted backup file as data only. Throws a readable error when it is not a valid backup. */
export function parseBackup(text: string, toolIds: string[]): { saved: Saved; roster: Student[] } {
  if (text.length > 1_500_000) throw new Error('That file is too large to be a Primer backup.')
  let j: any
  try { j = JSON.parse(text) } catch { throw new Error('That file is not a valid backup (it is not JSON).') }
  if (!j || j.app !== BACKUP_APP || j.version !== 1) throw new Error('That file is not a Primer toolkit backup.')
  const topics = (Array.isArray(j.saved?.topics) ? j.saved.topics : []).slice(0, 20)
    .filter((t: any) => toolIds.includes(t?.tool) && typeof t?.label === 'string')
    .map((t: any) => ({ tool: t.tool, label: cap(t.label, 200), inputs: (plain(t.inputs) as Record<string, unknown>) || {} }))
  const history = (Array.isArray(j.saved?.history) ? j.saved.history : []).slice(0, 12)
    .filter((h: any) => toolIds.includes(h?.tool) && typeof h?.title === 'string')
    .map((h: any) => ({ tool: h.tool, title: cap(h.title, 200), at: typeof h.at === 'number' ? h.at : Date.now(), data: plain(h.data) }))
  return { saved: { topics, history }, roster: cleanStudents(j.roster) }
}
export function downloadJSON(name: string, obj: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
