import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plant, ClockCounterClockwise, LockSimple, Plus, ArrowRight, BookOpenText, GithubLogo } from '@phosphor-icons/react'
import { heroPeekImage } from '../assets/hero-peek'
import { bedtimeImage } from '../assets/bedtime'
import { logoImage } from '../assets/storybook'
import './landing.css'

const TAGLINE = 'Practice that starts where your child is. It notices what your child practices, strengthens what is weak, and returns to old skills before they fade.'

const BENEFITS = [
  { Icon: Eye, t: 'It notices', d: 'Every answer is logged against one of sixteen skills, with whether a hint was needed. No timers and no streaks.' },
  { Icon: Plant, t: 'It steps back, then forward', d: 'A wrong answer drops one rung so footing returns. Two first try successes climb it again.' },
  { Icon: ClockCounterClockwise, t: 'It brings skills back', d: 'Three days after a skill is mastered, it returns for one short review while new skills unlock.' },
  { Icon: LockSimple, t: 'It stays on the device', d: 'Progress lives in this browser. There are no accounts and no AI service behind the tutor.' },
]

const STEPS = [
  { n: 'Step 1', t: 'Choose a pathway', d: 'Reading, writing or numbers. Each is a short ladder of skills that unlock in order.' },
  { n: 'Step 2', t: 'Answer small questions', d: 'The owl tutor asks one gentle question at a time, with hints and a voice if your browser supports it.' },
  { n: 'Step 3', t: 'Check the parent view', d: 'See which skills are new, growing or mastered, and what is due for review.' },
]

const FAQ = [
  ['Does Primer use AI?', 'The learning app for children does not. Every adaptation rule is ordinary code that you can read in the source, and nothing a child does is sent to a model. The separate Teacher and parent toolkit does use AI (Google Gemini) to write worksheets, quizzes and similar material from what an adult types.'],
  ['Where is my child’s progress stored?', 'In this browser’s local storage, on this device only. Clearing site data erases it. There are no accounts, and Primer has no server that receives progress.'],
  ['Does it actually improve learning?', 'We have not tested that. Primer is a working prototype built on common practice ideas such as small steps and spaced review. It makes no claim about learning outcomes.'],
  ['What can my child learn here?', 'Sixteen skills in three pathways: reading, writing and numbers. Reading runs from letter sounds to little stories. Writing starts with strokes and ends with first words. Numbers cover counting, comparing, adding and taking away.'],
  ['Does it cost anything?', 'No. It is open source and free to use. There are no ads and no purchases.'],
  ['Does it talk?', 'If your browser supports speech synthesis, the tutor can read aloud. You can mute it from the app header.'],
  ['Can I see how it decides what comes next?', 'Yes. The full source is on GitHub, including the engine folder that holds the mastery, difficulty and review logic.'],
  ['Which devices work?', 'Any modern browser on a phone, tablet or computer. Tracing works best with touch or a stylus.'],
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp-rv')
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function Tagline() {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const words = Array.from(ref.current?.querySelectorAll('.w') ?? [])
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      // a word turns on once it crosses a line 80 percent down the viewport
      if (e.isIntersecting || e.boundingClientRect.top < 0) e.target.classList.add('on')
      else e.target.classList.remove('on')
    }), { rootMargin: '0px 0px -20% 0px', threshold: 0 })
    words.forEach((w, i) => { (w as HTMLElement).style.transitionDelay = `${(i % 6) * 40}ms`; io.observe(w) })
    return () => io.disconnect()
  }, [])
  return <p ref={ref}>{TAGLINE.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}</p>
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <div className="lp-nav">
        <div className="lp-pill-nav">
          <Link to="/" className="lp-brand" onClick={close}><img src={logoImage} alt="" />Primer</Link>
          <nav className="lp-links" aria-label="Main">
            <a href="/#how">How it works</a>
            <Link to="/toolkit">Toolkit</Link>
            <a href="/#faq">FAQ</a>
            <a href="https://github.com/Sivadheeraj5356/primer" target="_blank" rel="noreferrer">Source</a>
          </nav>
          <Link to="/app" className="lp-btn sm">Open the app</Link>
          <button className="lp-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
        </div>
      </div>
      <div className={`lp-overlay${open ? ' open' : ''}`} aria-hidden={!open}>
        <a href="/#how" onClick={close} tabIndex={open ? 0 : -1}>How it works</a>
        <Link to="/toolkit" onClick={close} tabIndex={open ? 0 : -1}>Toolkit</Link>
        <a href="/#faq" onClick={close} tabIndex={open ? 0 : -1}>FAQ</a>
        <a href="https://github.com/Sivadheeraj5356/primer" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Source</a>
        <Link to="/app" onClick={close} tabIndex={open ? 0 : -1}>Open the app</Link>
      </div>
    </>
  )
}

export function Foot() {
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <span>A working prototype. Artwork generated with Google Stitch.</span>
        <nav aria-label="Footer">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/parents">For parents</Link>
          <Link to="/toolkit">Toolkit</Link>
          <a href="https://github.com/Sivadheeraj5356/primer" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}

export function Landing() {
  useReveal()
  useEffect(() => { document.title = 'Primer: a patient tutor for young learners' }, [])
  return (
    <div className="lp">
      <a className="lp-skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <section className="lp-hero">
          <div className="lp-wrap">
            <span className="lp-eyebrow"><BookOpenText size={16} weight="bold" aria-hidden />Open source learning prototype</span>
            <h1>A storybook that <span>adapts</span> to the child holding it</h1>
            <p className="lp-sub">Primer practices reading, writing and numbers with a young learner, strengthens what is weak, and brings old skills back before they fade.</p>
            <div className="lp-cta">
              <Link to="/app" className="lp-btn lg">Open the learning app <ArrowRight size={18} weight="bold" aria-hidden /></Link>
              <a href="#how" className="lp-btn lg ghost">See how it works</a>
            </div>
            <p className="lp-proof">Sixteen skills. Free. Runs in your browser with no account.</p>
            <figure className="lp-shot lp-rv" style={{ margin: '64px auto 0' }}>
              <img src={heroPeekImage} alt="The Primer learning home with its three storybook pathways: reading, writing and numbers" />
              <figcaption>The learning home, waiting at /app</figcaption>
            </figure>
          </div>
        </section>

        <section className="lp-sec" id="why">
          <div className="lp-wrap">
            <span className="lp-label lp-rv">The problem</span>
            <h2 className="lp-rv">A worksheet moves at one speed. A child does not.</h2>
            <div className="lp-problem">
              <div className="lp-panel lp-rv">
                <h3>One pace for everyone</h3>
                <p>Fixed lessons rush the child who needs another go and bore the child who is ready. Skills learned once are rarely revisited.</p>
              </div>
              <div className="lp-panel dark lp-rv">
                <h3>A pace that follows the child</h3>
                <p>Primer keeps a mastery estimate for each skill, so the next question is chosen from what the child has actually tried and how it went.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-sec" style={{ paddingTop: 0 }}>
          <div className="lp-wrap">
            <span className="lp-label lp-rv">What it does</span>
            <h2 className="lp-rv">Four quiet habits</h2>
            <div className="lp-grid">
              {BENEFITS.map(({ Icon, t, d }) => (
                <article className="lp-card lp-rv" key={t}>
                  <div className="lp-ico"><Icon size={24} weight="bold" aria-hidden /></div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-sec" id="how" style={{ paddingTop: 0 }}>
          <div className="lp-wrap">
            <span className="lp-label lp-rv">How it works</span>
            <h2 className="lp-rv">Three steps, then repeat</h2>
            <div className="lp-steps">
              {STEPS.map((s) => (
                <div className="lp-step lp-rv" key={s.n}><b>{s.n}</b><h3>{s.t}</h3><p>{s.d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-sec" style={{ paddingTop: 0 }}>
          <div className="lp-wrap">
            <span className="lp-label lp-rv">What is inside</span>
            <h2 className="lp-rv">The prototype, in numbers</h2>
            <p className="lp-lede lp-rv">These are counts of what the app contains today. They are not learning results.</p>
            <div className="lp-stats">
              {[['16', 'skills across three pathways'], ['3', 'days until a mastered skill returns for review'], ['2', 'first try successes to climb a rung'], ['0', 'accounts or trackers']].map(([n, l]) => (
                <div className="lp-stat lp-rv" key={l}><b>{n}</b><span>{l}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-tag" aria-label="Tagline">
          <div className="lp-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}><Tagline /></div>
        </section>

        <section className="lp-sec" id="faq">
          <div className="lp-wrap">
            <span className="lp-label lp-rv">Questions</span>
            <h2 className="lp-rv">Answers, plainly</h2>
            <div className="lp-faq">
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}<Plus size={20} weight="bold" aria-hidden /></summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-wrap">
            <h2 className="lp-rv">Begin their story</h2>
            <p className="lp-lede lp-rv">Free to try. Nothing to install, nothing to sign up for.</p>
            <div className="lp-cta lp-rv">
              <Link to="/app" className="lp-btn lg">Open the learning app <ArrowRight size={18} weight="bold" aria-hidden /></Link>
              <a className="lp-btn lg ghost" href="https://github.com/Sivadheeraj5356/primer" target="_blank" rel="noreferrer"><GithubLogo size={18} weight="bold" aria-hidden />Read the source</a>
            </div>
            <img className="lp-rv" src={bedtimeImage} alt="A storybook resting beside an oil lantern on a wooden nightstand" />
          </div>
        </section>
      </main>
      <Foot />
    </div>
  )
}
