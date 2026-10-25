// Local-only persistence. Everything lives in this browser's localStorage.
// There are no accounts and no server: a prototype for one device at a time.

import type { LearnerState, SessionRecord } from './mastery'
import type { Domain } from './skills'

const KEY = 'primer.learners.v1'
const ACTIVE_KEY = 'primer.active.v1'

// Demo learner so the product is explorable without entering any real
// child's information. All names shipped with Primer are fictional.
export const DEMO_LEARNER = 'Nell'

function loadAll(): Record<string, LearnerState> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, LearnerState>) : {}
  } catch {
    return {}
  }
}

function saveAll(all: Record<string, LearnerState>): void {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function listLearners(): string[] {
  return Object.keys(loadAll())
}

export function loadLearner(name: string): LearnerState {
  const all = loadAll()
  if (!all[name]) {
    all[name] = { name, createdAt: Date.now(), skills: {}, sessions: [], totalStars: 0 }
    saveAll(all)
  }
  return all[name]
}

export function saveLearner(learner: LearnerState): void {
  const all = loadAll()
  all[learner.name] = learner
  saveAll(all)
}

export function addSession(learner: LearnerState, rec: SessionRecord): void {
  learner.sessions.push(rec)
  saveLearner(learner)
}

export function setActiveLearner(name: string): void {
  localStorage.setItem(ACTIVE_KEY, name)
}

export function getActiveLearnerName(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function resetLearner(name: string): void {
  const all = loadAll()
  delete all[name]
  saveAll(all)
}
