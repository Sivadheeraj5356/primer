import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLearner } from '../components/LearnerContext'
import { domainProgress, isMastered, pickNext } from '../engine/mastery'
import { skillsOf, type Domain } from '../engine/skills'
import { speak } from '../engine/speech'
import { DEMO_LEARNER } from '../engine/storage'
import { barnabyOwlImage, owlCountedStarsImage, readingMeadowImage, writingGroveImage, numbersStreamImage } from '../assets/storybook'

const PATHS: {
  id: Domain; name: string; station: string; sub: string; desc: string; img: string; plate: string
}[] = [
  {
    id: 'reading', name: 'Reading Meadow', station: 'Station I: Word Meadow', plate: 'Bookplate No. 12',
    sub: 'Phonics, Letter Sounds & Tales', img: readingMeadowImage,
    desc: 'Listen to the soft rustle of letters and practice blending cozy sounds into words and tales.',
  },
  {
    id: 'writing', name: 'Writing Grove', station: 'Station II: Quill Grove', plate: 'Bookplate No. 27',
    sub: 'Tracing & Letter Crafting', img: writingGroveImage,
    desc: 'Follow the guide strokes with a finger or pencil and watch plain lines grow into letters.',
  },
  {
    id: 'numbers', name: 'Numbers Stream', station: 'Station III: Counting Brook', plate: 'Bookplate No. 41',
    sub: 'Counting & Nature Patterns', img: numbersStreamImage,
    desc: 'Count the pebbles in the brook, then add and take away as the current carries numbers along.',
  },
]

const RIDDLE = {
  verseA: 'The night owl heard a gentle sound in the tree. It was the',
  verseB: 'blowing softly.',
  answer: 'Wind',
  stamps: [
    { word: 'Wind', gloss: '/wind/ - soft breeze' },
    { word: 'Rock', gloss: '/rok/ - river pebble' },
    { word: 'Cart', gloss: '/kart/ - market wagon' },
  ],
}

function activeDaysThisWeek(sessions: { at: number }[]): boolean[] {
  const days = Array(7).fill(false) as boolean[]
  const now = new Date()
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  for (const s of sessions) {
    const d = Math.floor((s.at - monday.getTime()) / 86400000)
    if (d >= 0 && d < 7) days[d] = true
  }
  return days
}

export function Home() {
  const { learner, learners, switchLearner } = useLearner()
  const [newName, setNewName] = useState('')
  const [picked, setPicked] = useState<string | null>(null)

  const data = useMemo(() => {
    const perDomain = PATHS.map((p) => {
      const skills = skillsOf(p.id)
      const mastered = skills.filter((s) => isMastered(learner, s.id)).length
      return { ...p, total: skills.length, mastered, progress: domainProgress(learner, p.id), next: pickNext(learner, p.id) }
    })
    const recommended = perDomain.reduce((a, b) => (a.progress <= b.progress ? a : b))
    return { perDomain, recommended }
  }, [learner])

  const week = useMemo(() => activeDaysThisWeek(learner.sessions), [learner.sessions])
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const minutesToday = learner.sessions
    .filter((s) => new Date(s.at).toDateString() === new Date().toDateString())
    .reduce((n, s) => n + s.minutes, 0)
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${learner.name}!`
  const barnabyLine = `The meadow dew has settled, and the library trees have fresh stories tucked inside their bark. Which quiet path calls to you first today?`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <div className="sb-strip">
        <div className="sb-chapter">
          <span className="sb-dot" />
          <span><strong>Early learners</strong> &nbsp;•&nbsp; {learner.name}'s journey &nbsp;•&nbsp; The Whispering Meadow</span>
        </div>
        <span>{minutesToday > 0 ? `Today: ${Math.round(minutesToday)} minute${Math.round(minutesToday) === 1 ? '' : 's'} of discovery so far` : 'A fresh page waits for today'}</span>
      </div>

      <section className="sb-hero">
        <div className="sb-plate">
          <div className="plate-head"><span>Plate No. 03</span><span>Sanctuary Tutor</span></div>
          <img src={barnabyOwlImage} alt="Barnaby the Owl perched on storybooks" />
          <div className="plate-cap">
            <div className="name">Barnaby of the Glen</div>
            <div className="role">Chief Guide for Early Readers &amp; Wanderers</div>
          </div>
        </div>
        <div>
          <span className="sb-eyebrow">Reading hour</span>
          <div className="sb-greeting" style={{ marginTop: 10 }}>
            <h1>{greeting}</h1>
            <p>"{barnabyLine}"</p>
          </div>
          <div className="sb-hero-actions">
            <button className="sb-btn-primary" type="button" onClick={() => speak(`${greeting} ${barnabyLine}`)}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>volume_up</span>
              Read to me, Barnaby
            </button>
            <Link className="sb-btn-ghost" to={`/play/${data.recommended.id}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>auto_stories</span>
              Continue in {data.recommended.name}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="sb-section-head">
          <div>
            <span className="sb-eyebrow">Wander &amp; learn</span>
            <h2>Three Storybook Pathways</h2>
            <p>Each trail offers gentle chapters, tactile exercises, and hand-inked stamps.</p>
          </div>
          <span style={{ fontSize: 13, color: '#6b6f6a' }}>
            Recommended next: <strong>{data.recommended.name}</strong>
          </span>
        </div>
        <div className="sb-rail">
          {data.perDomain.map((p, i) => (
            <div key={p.id} style={{ display: 'contents' }}>
              {i > 0 && <div className="rail-line" />}
              <div className="rail-stop">
                <span className="sb-dot" style={{ background: p.mastered > 0 ? '#e26d38' : '#e4dcc8' }} />
                {p.station}
              </div>
            </div>
          ))}
        </div>
        <div className="sb-paths">
          {data.perDomain.map((p) => (
            <article className="sb-path" key={p.id}>
              {p.id === data.recommended.id && <div className="path-top"><span className="sb-focus">Active focus</span></div>}
              <div className="frame">
                <img src={p.img} alt={`${p.name} storybook scene`} />
                <span className="plate-no">{p.plate}</span>
              </div>
              <div>
                <div className="sub">{p.sub}</div>
                <h3>{p.name}</h3>
                <p className="desc">{p.desc}</p>
              </div>
              <div className="sb-stamps">
                <div className="sb-milestones">
                  {Array.from({ length: p.total }).map((_, i) => (
                    <span key={i} className={`sb-mile${i < p.mastered ? ' done' : ''}`} />
                  ))}
                </div>
                <span>{p.mastered} of {p.total} skills stamped</span>
              </div>
              <div className="actions">
                <Link className="sb-btn-primary" style={{ padding: '10px 16px', fontSize: 14 }} to={`/play/${p.id}`}>
                  Open today's story
                </Link>
                <Link className="sb-btn-ghost" style={{ padding: '10px 14px', fontSize: 14 }} to={`/learn/${p.id}`}>
                  Trail map
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sb-riddle">
        <div>
          <span className="sb-eyebrow">Morning word riddle</span>
          <h3>The Willow's Missing Word</h3>
          <p className="verse">
            "{RIDDLE.verseA} <strong style={{ color: '#e26d38' }}>_ _ _ _</strong> {RIDDLE.verseB}"
          </p>
          <p style={{ fontSize: 12.5, color: '#737970' }}>Touch the story stamp that completes the verse:</p>
        </div>
        <div className="sb-stamp-row">
          {RIDDLE.stamps.map((s, i) => (
            <button
              key={s.word}
              type="button"
              className={`sb-stamp${picked ? (s.word === RIDDLE.answer ? ' picked-right' : picked === s.word ? ' picked-wrong' : '') : ''}`}
              onClick={() => { setPicked(s.word); if (s.word === RIDDLE.answer) speak('Wind! That is the word the willow was missing.') }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#c9ecc6' : '#f3ede9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Literata, serif', fontWeight: 600, color: '#1b381e' }}>{i + 1}</span>
                {picked && s.word === RIDDLE.answer && <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c7d52' }}>check_circle</span>}
              </div>
              <div className="w">{s.word}</div>
              <div className="gloss">{s.gloss}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="sb-section-head">
          <div>
            <span className="sb-eyebrow">{learner.name}'s keepsake chest</span>
            <h2>Bookshelf &amp; Hand-Stamped Badges</h2>
          </div>
        </div>
        <div className="sb-keeps">
          <div className="sb-book">
            <img src={owlCountedStarsImage} alt="The Owl Who Counted Stars storybook cover" />
            <div className="t">The Owl Who Counted Stars <span style={{ fontFamily: 'Nunito Sans', fontSize: 10, fontWeight: 700, color: '#e26d38', background: '#ffdbce', borderRadius: 5, padding: '2px 7px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Artwork preview</span></div>
            <div className="s">Generated cover art from the design study - story content is not part of the prototype</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="sb-ribbon">
              <h4>Gentle Habit Ribbon</h4>
              <p>{learner.sessions.length === 0 ? 'No practice sessions yet - the ribbon fills in as real sessions are completed.' : `${learner.sessions.length} practice session${learner.sessions.length === 1 ? '' : 's'} so far. This week:`}</p>
              <div className="sb-week">
                {dayLabels.map((d, i) => (
                  <div key={i} className={`sb-day${week[i] ? ' on' : ''}`}>
                    <div className="bubble">{week[i] ? '★' : ''}</div>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(27,59,30,.08)', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div><div style={{ fontFamily: 'Literata, serif', fontSize: 26, color: '#1b381e' }}>{learner.totalStars}</div><div style={{ fontSize: 12.5, color: '#737970' }}>stars earned</div></div>
              <div><div style={{ fontFamily: 'Literata, serif', fontSize: 26, color: '#1b381e' }}>{data.perDomain.reduce((n, p) => n + p.mastered, 0)}</div><div style={{ fontSize: 12.5, color: '#737970' }}>skills stamped</div></div>
              <div><div style={{ fontFamily: 'Literata, serif', fontSize: 26, color: '#1b381e' }}>{Math.round(learner.sessions.reduce((n, s) => n + s.minutes, 0))}</div><div style={{ fontSize: 12.5, color: '#737970' }}>minutes of practice</div></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#f8f2ee', borderRadius: 16, padding: 22 }}>
        <div className="sb-section-head" style={{ marginBottom: 12 }}>
          <div>
            <span className="sb-eyebrow">Who is reading today?</span>
            <h2 style={{ fontSize: 22 }}>Choose a learner</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {learners.map((name) => (
            <button key={name} type="button" className={name === learner.name ? 'sb-btn-primary' : 'sb-btn-ghost'} style={{ padding: '8px 16px', fontSize: 14 }} onClick={() => switchLearner(name)}>
              {name}{name === DEMO_LEARNER ? ' (demo)' : ''}
            </button>
          ))}
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add a first name"
            style={{ border: '1px solid #e4dcc8', borderRadius: 10, padding: '9px 12px', font: '600 14px Nunito Sans', background: '#fff' }}
          />
          <button type="button" className="sb-btn-ghost" style={{ padding: '8px 16px', fontSize: 14 }} disabled={!newName.trim()}
            onClick={() => { switchLearner(newName.trim()); setNewName('') }}>
            Add learner
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: '#737970', marginTop: 14, marginBottom: 0 }}>
          Progress is stored only in this browser - no account, no AI backend. The demo learner {DEMO_LEARNER} is fictional.
        </p>
      </section>
    </div>
  )
}
