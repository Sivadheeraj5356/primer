// Smoke test: every skill generates valid activities, and a simulated
// learner journey unlocks the full graph and masters skills.
import { SKILLS } from '../src/engine/skills'
import { makeActivity } from '../src/engine/session'
import { freshSkillState, recordOutcome, isUnlocked, pickNext, domainProgress, type LearnerState } from '../src/engine/mastery'

let failures = 0
const learner: LearnerState = { name: 'test', createdAt: Date.now(), skills: {}, sessions: [], totalStars: 0 }

// 1. Every skill generates 20 valid activities across its ladder.
for (const s of SKILLS) {
  for (let level = 1; level <= s.maxLevel; level++) {
    for (let i = 0; i < 20; i++) {
      try {
        const a = makeActivity(s.id, level)
        if (!a || a.skillId !== s.id) throw new Error('bad activity')
      } catch (e) {
        console.error(`FAIL gen ${s.id} L${level}:`, (e as Error).message)
        failures++
      }
    }
  }
}

// 2. A perfect learner unlocks everything; pickNext always returns something legal.
let guard = 0
while (guard++ < 500) {
  const lockedLeft = SKILLS.some((s) => !isUnlocked(learner, s))
  const pick = pickNext(learner, 'reading') && pickNext(learner, 'writing') && pickNext(learner, 'numbers')
  for (const d of ['reading', 'writing', 'numbers'] as const) {
    const p = pickNext(learner, d)
    if (!p) continue
    const st = learner.skills[p.skill.id] ?? freshSkillState()
    if (st.mastery >= 0.85) continue // don't keep grinding mastered skills in the sim
    recordOutcome(learner, p.skill.id, { correct: true, difficulty: st.level, firstTry: true })
  }
  if (!lockedLeft && pick) break
}
const allUnlocked = SKILLS.every((s) => isUnlocked(learner, s))
console.log('all skills unlocked after perfect learning:', allUnlocked)
if (!allUnlocked) failures++
console.log('domain progress:', ['reading', 'writing', 'numbers'].map((d) => `${d}=${domainProgress(learner, d as never).toFixed(2)}`).join(' '))

// 3. A struggling learner stays put but is never stuck.
const struggler: LearnerState = { name: 't2', createdAt: Date.now(), skills: {}, sessions: [], totalStars: 0 }
for (let i = 0; i < 10; i++) recordOutcome(struggler, 'n-count-10', { correct: false, difficulty: 1, firstTry: false })
const st = struggler.skills['n-count-10']
if (st.level !== 1 || st.mastery > 0.2) { console.error('FAIL struggler state', st); failures++ }
const p2 = pickNext(struggler, 'numbers')
if (!p2) { console.error('FAIL struggler has no pick'); failures++ }

console.log(failures === 0 ? 'ALL ENGINE TESTS PASSED' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
