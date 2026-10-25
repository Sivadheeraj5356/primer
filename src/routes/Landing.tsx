import { Link } from 'react-router-dom'
import { heroPeekImage } from '../assets/hero-peek'
import { bedtimeImage } from '../assets/bedtime'
import { logoImage } from '../assets/storybook'

const VIGNETTES = [
  {
    plate: 'PLATE 02', tag: 'PHONICS & TALES',
    caption: 'A reading lesson with the owl tutor',
    sub: 'Short decodable sentences and original stories, each followed by one gentle question.',
    body: (
      <div className="lp-vignette-chat">
        <div className="lp-chat-row">
          <span className="lp-chat-owl"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>account_circle</span></span>
          <p>"The cat sat on the mat." 🐱<br /><b>Barnaby asks:</b> Where did the cat sit?</p>
        </div>
        <div className="lp-chips"><span>On the mat</span><span>On the bus</span></div>
      </div>
    ),
  },
  {
    plate: 'PLATE 03', tag: 'LETTER CRAFTING',
    caption: 'Tactile letter tracing practice',
    sub: 'Warm-up strokes first, then any letter of the alphabet rendered as a tracing guide.',
    body: (
      <div className="lp-vignette-trace">
        <div className="lp-trace-letter">W</div>
        <div className="lp-trace-caption">Follow the guide with a finger</div>
        <div className="lp-chat-progress"><span className="on" /><span className="on" /><span /><span /></div>
      </div>
    ),
  },
  {
    plate: 'PLATE 04', tag: 'NATURALIST MATH',
    caption: 'Counting with things you can see',
    sub: 'Counting, comparing, adding and taking away - small groups first, always with things a child can point at.',
    body: (
      <div className="lp-vignette-count">
        <div className="lp-count-animals">🐟 🐟 🐟 🐟 🐟</div>
        <p>How many fish swim in the stream?</p>
        <div className="lp-chips"><span>4</span><span>5</span></div>
      </div>
    ),
  },
]

const BEATS = [
  {
    n: 'BEAT 01', icon: 'visibility', tag: 'Observation without judgment',
    title: 'The book notices what your child practices',
    text: 'Every answer is recorded against one of sixteen skills - which letter sounds, words and number facts your child has tried, how often each was right, and whether a hint was needed. No timers, no streaks.',
  },
  {
    n: 'BEAT 02', icon: 'eco', tag: 'Warm reinforcement',
    title: 'It gently strengthens what is weak',
    text: 'Each skill climbs a ladder of small steps. When an answer goes wrong on the current rung, the ladder steps down so the learner re-finds footing; two first-try successes climb a rung again. Practice follows a per-skill mastery estimate, not a fixed script.',
  },
  {
    n: 'BEAT 03', icon: 'history', tag: 'Enduring mastery',
    title: 'It brings old skills back before they fade',
    text: 'Three days after a skill is mastered, it quietly returns for one short review, so old learning stays alive while new skills unlock.',
  },
]

export function Landing() {
  return (
    <div className="landing-page">
      <div className="lp-ribbon">An open-source learning prototype, inspired by The Diamond Age</div>
      <header className="landing-header">
        <div className="landing-header-inner">
          <span className="landing-brand">
            <img src={logoImage} alt="Primer" />
            <span>Primer</span>
          </span>
          <nav className="landing-nav">
            <a href="#experience">Experience</a>
            <a href="#adapt">How it adapts</a>
            <a href="https://github.com/Sivadheeraj5356/primer" target="_blank" rel="noreferrer">Source</a>
            <Link className="lp-pill" to="/app">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_stories</span>
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="lp-hero">
          <span className="lp-eyebrow">A young reader's companion</span>
          <h1>A storybook that <em>adapts</em> to the child <em>holding it</em>.</h1>
          <p className="lp-sub">Primer watches what a young learner practices, strengthens what is weak, and brings old skills back before they fade.</p>
          <div className="lp-cta-row">
            <Link className="lp-pill lg" to="/app">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_stories</span>
              Open the app
            </Link>
            <a className="lp-textlink" href="#experience">See how it works →</a>
          </div>
          <div className="lp-peek">
            <div className="lp-peek-head">
              <span>Plate No. 01 - The Learning Sanctuary</span>
              <span className="lp-badge">Prototype preview</span>
            </div>
            <div className="lp-peek-frame">
              <img src={heroPeekImage} alt="Preview of the Primer learning home with its three storybook pathways" />
            </div>
            <div className="lp-peek-foot">A look inside the learning home waiting at /app</div>
          </div>
        </section>

        <section id="experience" className="lp-chapter">
          <span className="lp-eyebrow">Chapter I</span>
          <h2>Inside the experience</h2>
          <p className="lp-chapter-sub">Three framed book-plate vignettes of real, quiet learning moments - designed to nurture attention, not rush through points.</p>
          <div className="lp-vignettes">
            {VIGNETTES.map((v) => (
              <article className="lp-vignette" key={v.plate}>
                <div className="lp-vignette-head"><span>{v.plate}</span><span>{v.tag}</span></div>
                <div className="lp-vignette-body">{v.body}</div>
                <h3>{v.caption}</h3>
                <p>{v.sub}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="adapt" className="lp-chapter">
          <span className="lp-eyebrow">Chapter II</span>
          <h2>Watch it adapt</h2>
          <p className="lp-chapter-sub">A calm, respectful companion that learns how your child learns. No stress, no screens demanding streaks, no overwhelming dashboards - every adaptation rule is ordinary, inspectable code: deterministic, not an AI tutor.</p>
          <div className="lp-beats">
            {BEATS.map((b) => (
              <article className="lp-beat" key={b.n}>
                <div className="lp-beat-icon"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>{b.icon}</span></div>
                <div className="lp-beat-main">
                  <span className="lp-beat-n">{b.n}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
                <span className="lp-beat-tag">{b.tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-chapter lp-closing">
          <span className="lp-eyebrow">Chapter III</span>
          <h2>Begin their story</h2>
          <p className="lp-chapter-sub">A tranquil learning sanctuary, ready whenever quiet reading time begins.</p>
          <div className="lp-closing-card">
            <img src={bedtimeImage} alt="A storybook resting beside an oil lantern on a wooden nightstand" />
            <div className="lp-closing-foot">
              <div>
                <b>The chapter closes at twilight.</b>
                <p>The meadow rests, ready for tomorrow's quiet discoveries.</p>
              </div>
              <Link className="lp-pill" to="/app">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_stories</span>
                Open the app
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>A working prototype. Progress stays in the browser - no accounts, no AI backend. Artwork generated with Google Stitch.</span>
        <span>Primer Project · Designed for young wanderers</span>
      </footer>
    </div>
  )
}
