import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect, type ReactNode } from 'react'
import { Nav, Foot } from './Landing'
import './landing.css'

function Shell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} | Primer` }, [title])
  return (
    <div className="lp">
      <Nav />
      <main className="lp-wrap lp-page">
        <Link className="back" to="/"><ArrowLeft size={18} weight="bold" aria-hidden />Back to Primer</Link>
        <h1>{title}</h1>
        {children}
      </main>
      <Foot />
    </div>
  )
}

export function Privacy() {
  return (
    <Shell title="Privacy">
      <p>Primer has no accounts and no server that receives your child’s progress. Progress, the learner’s first name and settings are saved in this browser’s local storage on this device. Clearing site data removes them.</p>
      <h2>What leaves your device</h2>
      <p>Your browser requests fonts from Google Fonts when a page loads, which shares your IP address with Google. The site is served by Cloudflare, which keeps standard request logs. Primer adds no analytics, advertising or tracking code.</p>
      <h2>Teacher and parent toolkit</h2>
      <p>The toolkit under /toolkit is separate from the child learning app. When an adult uses an AI tool there, the text they type and any photo or PDF they attach are sent through this site’s server to Google’s Gemini service, which writes the result. On the free Gemini tier Google may use that content to improve its products, so please do not enter a child’s full name, school, contact details or other personal information. Results are not stored on a Primer server. Saved topics and recent results are kept only in this browser. Maths problems that are plain arithmetic or simple equations are solved on your device and are not sent anywhere. The child learning app never calls the AI service.</p>
      <h2>Voice</h2>
      <p>Read aloud uses your browser’s built in speech synthesis. Primer does not record audio.</p>
      <h2>Questions</h2>
      <p>Open an issue on the GitHub repository for this project.</p>
    </Shell>
  )
}

export function Terms() {
  return (
    <Shell title="Terms">
      <p>Primer is an open source prototype provided as is, without warranty. It is a practice tool and not a replacement for a teacher or for professional advice.</p>
      <h2>No learning claims</h2>
      <p>We have not measured learning outcomes. Please supervise young children while they use any screen.</p>
      <h2>Your data</h2>
      <p>Progress stays in your browser. You are responsible for the device it is stored on. See the privacy page for details.</p>
      <h2>Source and licence</h2>
      <p>The code is published on GitHub under the licence in the repository. Artwork was generated with Google Stitch.</p>
    </Shell>
  )
}

export function NotFound() {
  return (
    <Shell title="That page is not in the book">
      <p>The address you followed does not match a page. Head back to the start, or open the learning app.</p>
      <p><Link to="/app" style={{ fontWeight: 700 }}>Open the learning app</Link></p>
    </Shell>
  )
}
