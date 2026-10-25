import { TOOLS, CHATS, buildPrompt, GEN_PREAMBLE } from '../shared/toolkit'

interface Env { ASSETS: { fetch(r: Request): Promise<Response> }; GEMINI_API_KEY?: string; BUDGET?: any }

// Global daily cap on Gemini calls, shared by every visitor. Fails closed.
const DAILY_CALL_CAP = 100
export class Budget {
  state: any
  constructor(state: any) { this.state = state }
  async fetch(): Promise<Response> {
    const day = new Date().toISOString().slice(0, 10)
    let rec: { day: string; n: number } = (await this.state.storage.get('d')) || { day, n: 0 }
    if (rec.day !== day) rec = { day, n: 0 }
    if (rec.n >= DAILY_CALL_CAP) return new Response('cap', { status: 429 })
    rec.n++
    await this.state.storage.put('d', rec)
    return new Response('ok')
  }
}
async function spend(env: Env): Promise<boolean> {
  try {
    if (!env.BUDGET) return false
    const r = await env.BUDGET.get(env.BUDGET.idFromName('global')).fetch('https://budget/spend')
    return r.status === 200
  } catch { return false }
}

const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']
const MIME_OK = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const hits = new Map<string, number[]>()

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}

function limited(ip: string): boolean {
  const now = Date.now()
  const win = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  win.push(now)
  hits.set(ip, win)
  if (hits.size > 2000) hits.clear()
  return win.length > 25
}

async function gemini(env: Env, system: string, contents: unknown[], asJson: boolean): Promise<string> {
  let lastErr = 'AI service is busy'
  for (const model of MODELS) {
    if (!(await spend(env))) throw new Error('The daily AI limit for this site has been reached. Please try again tomorrow.')
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY || '' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, ...(asJson ? { responseMimeType: 'application/json' } : {}) },
      }),
    })
    if (res.ok) {
      const data: any = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || ''
      if (text) return text
      lastErr = 'Empty response'
      continue
    }
    lastErr = `model ${res.status}`
    if (![429, 500, 503, 404].includes(res.status)) break
  }
  throw new Error(lastErr)
}

function attachmentPart(att: any) {
  if (!att) return null
  if (typeof att.data !== 'string' || !MIME_OK.includes(att.mime)) throw new Error('Unsupported attachment type.')
  if (att.data.length > 4_000_000) throw new Error('Attachment is too large (max about 3 MB).')
  const sig: Record<string, string> = { 'image/png': 'iVBOR', 'image/jpeg': '/9j/', 'image/webp': 'UklGR', 'application/pdf': 'JVBER' }
  if (!/^[A-Za-z0-9+/=]+$/.test(att.data) || !att.data.startsWith(sig[att.mime])) throw new Error('The file does not look like a real ' + att.mime.split('/')[1].toUpperCase() + '.')
  return { inlineData: { mimeType: att.mime, data: att.data } }
}

async function handleAI(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!env.GEMINI_API_KEY) return json({ error: 'AI is not configured on this deployment.' }, 503)
  const ip = req.headers.get('cf-connecting-ip') || 'unknown'
  if (limited(ip)) return json({ error: 'Too many requests. Please wait a few minutes.' }, 429)
  const raw = await req.text()
  if (raw.length > 5_000_000) return json({ error: 'Request too large' }, 413)
  let body: any
  try { body = JSON.parse(raw) } catch { return json({ error: 'Bad request' }, 400) }

  try {
    if (body.mode === 'chat') {
      const chat = CHATS[String(body.tool)]
      if (!chat) return json({ error: 'Unknown tool' }, 400)
      const hist = Array.isArray(body.messages) ? body.messages.slice(-12) : []
      const contents = hist.map((m: any, i: number) => {
        const parts: any[] = [{ text: String(m.text || '').slice(0, 4000) }]
        if (m.role === 'user' && i === hist.length - 1) { const a = attachmentPart(body.attachment); if (a) parts.push(a) }
        return { role: m.role === 'model' ? 'model' : 'user', parts }
      })
      if (!contents.length || contents[contents.length - 1].role !== 'user') return json({ error: 'No message' }, 400)
      const text = await gemini(env, `${GEN_PREAMBLE}\n${chat.system}`, contents, false)
      return json({ text })
    }
    const spec = TOOLS.find((t) => t.id === body.tool)
    if (!spec) return json({ error: 'Unknown tool' }, 400)
    const parts: any[] = [{ text: buildPrompt(spec, body.inputs || {}) }]
    if (spec.upload) { const a = attachmentPart(body.attachment); if (a) parts.push(a) }
    const text = await gemini(env, GEN_PREAMBLE, [{ role: 'user', parts }], true)
    let data: unknown
    try { data = JSON.parse(text.replace(/^```json\s*|```\s*$/g, '')) } catch { return json({ error: 'The AI returned something unreadable. Try again.' }, 502) }
    return json({ data })
  } catch (e: any) {
    return json({ error: e?.message === 'AI service is busy' || /^model/.test(e?.message || '') ? 'The AI service is busy right now. Please try again in a minute.' : e?.message || 'Failed' }, 502)
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/api/ai/status') return json({ enabled: !!env.GEMINI_API_KEY && !!env.BUDGET })
    if (url.pathname === '/api/ai') return handleAI(req, env)
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404)
    return env.ASSETS.fetch(req)
  },
}
