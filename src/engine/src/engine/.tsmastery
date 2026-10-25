// The adaptivity engine. Deliberately simple and inspectable: a deterministic
// mastery model, not a language model. Every decision it makes can be explained
// to a parent in one sentence.

import { SKILLS, skillById, type Domain, type Skill } from './skills'

export interface SkillState {
  mastery: number // 0..1, exponential moving average of recent performance
  attempts: number
  correct: number
  level: number // current rung on the skill's difficulty ladder (1..maxLevel)
  lastPracticed: number | null // epoch ms
}

export interface LearnerState {
  name: string
  createdAt: number
  skills: Record<string, SkillState>
  sessions: SessionRecord[]
  totalStars: number
}

export interface SessionRecord {
  at: number
  domain: Domain
  activities: number
  correct: number
  minutes: number
}

export const UNLOCK_AT = 0.55 // mastery needed for a prerequisite to unlock the next skill
export const MASTERED_AT = 0.85
const EWMA_ALPHA = 0.35
const REVIEW_AFTER_MS = 3 * 24 * 60 * 60 * 1000 // mastered skills come back for review

export function freshSkillState(): SkillState {
  return { mastery: 0, attempts: 0, correct: 0, level: 1, lastPracticed: null }
}

export function getSkillState(learner: LearnerState, skillId: string): SkillState {
  return learner.skills[skillId] ?? freshSkillState()
}

export function isUnlocked(learner: LearnerState, skill: Skill): boolean {
  return skill.prerequisites.every(
    (p) => getSkillState(learner, p).mastery >= UNLOCK_AT,
  )
}

export function isMastered(learner: LearnerState, skillId: string): boolean {
  return getSkillState(learner, skillId).mastery >= MASTERED_AT
}

// Record one activity outcome. `difficulty` is the rung the activity ran at,
// `firstTry` says whether the learner answered without using a hint.
export function recordOutcome(
  learner: LearnerState,
  skillId: string,
  outcome: { correct: boolean; difficulty: number; firstTry: boolean },
): void {
  const skill = skillById(skillId)
  const prev = getSkillState(learner, skillId)
  // An answer on a harder rung counts for more; hints soften the gain.
  const weight = Math.min(1, 0.6 + 0.2 * outcome.difficulty) * (outcome.firstTry ? 1 : 0.7)
  const signal = outcome.correct ? weight : 0
  const mastery = prev.attempts === 0
    ? signal
    : prev.mastery + EWMA_ALPHA * (signal - prev.mastery)
  const clamped = Math.max(0, Math.min(1, mastery))

  // Move the difficulty ladder: two first-try successes climb a rung,
  // a struggle on the current rung steps down so the learner re-finds footing.
  let level = prev.level
  if (outcome.correct && outcome.firstTry && outcome.difficulty >= level && level < skill.maxLevel) {
    level += 1
  } else if (!outcome.correct && outcome.difficulty <= level && level > 1) {
    level -= 1
  }

  learner.skills[skillId] = {
    mastery: clamped,
    attempts: prev.attempts + 1,
    correct: prev.correct + (outcome.correct ? 1 : 0),
    level,
    lastPracticed: Date.now(),
  }
}

export interface NextPick {
  skill: Skill
  reason: string
  kind: 'grow' | 'review'
}

// Choose what to practice next inside a domain.
// Priority: (1) a mastered skill due for spaced review, (2) the weakest
// unlocked skill that is not yet mastered.
export function pickNext(learner: LearnerState, domain: Domain): NextPick | null {
  const now = Date.now()
  const candidates = SKILLS.filter((s) => s.domain === domain && isUnlocked(learner, s))
  if (candidates.length === 0) return null

  const dueReview = candidates
    .filter((s) => {
      const st = getSkillState(learner, s.id)
      return (
        st.mastery >= MASTERED_AT &&
        st.lastPracticed !== null &&
        now - st.lastPracticed > REVIEW_AFTER_MS
      )
    })
    .sort((a, b) => (getSkillState(learner, a.id).lastPracticed ?? 0) - (getSkillState(learner, b.id).lastPracticed ?? 0))
  if (dueReview.length > 0) {
    return { skill: dueReview[0], reason: `A quick review of ${dueReview[0].title} so it stays strong.`, kind: 'review' }
  }

  const growing = candidates.filter((s) => !isMastered(learner, s.id))
  if (growing.length === 0) {
    // Everything mastered and nothing due: stretch on the deepest skill.
    const last = candidates[candidates.length - 1]
    return { skill: last, reason: `Stretching further in ${last.title}.`, kind: 'grow' }
  }
  growing.sort((a, b) => getSkillState(learner, a.id).mastery - getSkillState(learner, b.id).mastery)
  const weakest = growing[0]
  const st = getSkillState(learner, weakest.id)
  const reason = st.attempts === 0
    ? `${weakest.title} just unlocked - ready for a first try.`
    : `${weakest.title} needs the most practice right now.`
  return { skill: weakest, reason, kind: 'grow' }
}

// Domain-level progress for dashboards: mean mastery over the domain's skills.
export function domainProgress(learner: LearnerState, domain: Domain): number {
  const skills = SKILLS.filter((s) => s.domain === domain)
  const sum = skills.reduce((acc, s) => acc + getSkillState(learner, s.id).mastery, 0)
  return skills.length === 0 ? 0 : sum / skills.length
}
