import { useState, type ReactNode } from 'react'

/** Small safe Markdown renderer. It builds React elements only: raw HTML in the text is shown as plain text. */
function safeHref(u: string): string | null {
  try { const x = new URL(u.trim()); return ['https:', 'http:', 'mailto:'].includes(x.protocol) ? x.href : null } catch { return null }
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0], k = `${key}-${i++}`
    if (m[1]) out.push(<code key={k} className="md-code">{t.slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={k}>{t.slice(2, -2)}</strong>)
    else if (m[3]) out.push(<em key={k}>{t.slice(1, -1)}</em>)
    else {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!
      const h = safeHref(mm[2])
      out.push(h ? <a key={k} href={h} target="_blank" rel="noopener noreferrer nofollow">{mm[1]}</a> : <span key={k}>{mm[1]}</span>)
    }
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code) } catch {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') } catch { /* ignore */ } ta.remove()
    }
    setDone(true); setTimeout(() => setDone(false), 1500)
  }
  return (
    <div className="md-block">
      <div className="md-head"><span>{lang || 'code'}</span><button type="button" className="md-copy" onClick={copy}>{done ? 'Copied' : 'Copy'}</button></div>
      <pre className="md-pre" tabIndex={0}><code>{code}</code></pre>
    </div>
  )
}

export function Markdown({ text }: { text: string }) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
  const out: ReactNode[] = []
  let i = 0, k = 0
  while (i < lines.length) {
    const ln = lines[i]
    const fence = /^\s*```\s*([\w+#.-]*)\s*$/.exec(ln)
    if (fence) {
      const indent = (/^(\s*)/.exec(ln) || ['', ''])[1].length
      const buf: string[] = []; i++
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i].slice(Math.min(indent, (/^(\s*)/.exec(lines[i]) || ['', ''])[1].length))); i++ }
      i++
      out.push(<CodeBlock key={k++} code={buf.join('\n')} lang={fence[1]} />)
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(ln)
    if (h) { out.push(<p key={k++} className="md-h">{inline(h[2], `h${k}`)}</p>); i++; continue }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(ln)) {
      const ordered = /^\s*\d/.test(ln); const items: string[] = []
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, '')); i++ }
      const lis = items.map((t, j) => <li key={j}>{inline(t, `l${k}-${j}`)}</li>)
      out.push(ordered ? <ol key={k++}>{lis}</ol> : <ul key={k++}>{lis}</ul>)
      continue
    }
    if (!ln.trim()) { i++; continue }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^(#{1,4})\s+/.test(lines[i]) && !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) { para.push(lines[i]); i++ }
    out.push(<p key={k++}>{para.map((p, j) => <span key={j}>{j > 0 && <br />}{inline(p, `p${k}-${j}`)}</span>)}</p>)
  }
  return <div className="md">{out}</div>
}
