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
