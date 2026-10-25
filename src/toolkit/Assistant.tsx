import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHATS } from '../../shared/toolkit'
import { ChatView } from './render'

export function AssistantPage() {
  const [mode, setMode] = useState<keyof typeof CHATS>('homework')
  return (
    <div className="tk">
      <Link to="/toolkit" className="tk-back no-print">← All tools</Link>
      <h1 className="tk-h1">AI assistant</h1>
      <p className="tk-lead">One chat window with three helpers. Pick a helper first. Switching helper starts a new conversation.</p>
      <div className="tk-chips" role="tablist" aria-label="Assistant helper">
        {Object.entries(CHATS).map(([id, c]) => (
          <button key={id} role="tab" aria-selected={mode === id} className={`tk-chip${mode === id ? ' on' : ''}`} onClick={() => setMode(id as keyof typeof CHATS)}>{c.title}</button>
        ))}
      </div>
      <h2 className="tk-h2">{CHATS[mode].title}</h2>
      <ChatView key={mode} toolId={mode} />
    </div>
  )
}
