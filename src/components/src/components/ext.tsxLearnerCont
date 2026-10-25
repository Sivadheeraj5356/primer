import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { LearnerState } from '../engine/mastery'
import { DEMO_LEARNER, getActiveLearnerName, listLearners, loadLearner, saveLearner, setActiveLearner } from '../engine/storage'

interface LearnerCtx {
  learner: LearnerState
  learners: string[]
  switchLearner: (name: string) => void
  update: (fn: (l: LearnerState) => void) => void
}

const Ctx = createContext<LearnerCtx | null>(null)

export function LearnerProvider({ children }: { children: ReactNode }) {
  const initial = getActiveLearnerName() ?? DEMO_LEARNER
  const [learner, setLearner] = useState<LearnerState>(() => loadLearner(initial))
  const [learners, setLearners] = useState<string[]>(() => {
    const l = listLearners()
    return l.includes(initial) ? l : [...l, initial]
  })

  const switchLearner = useCallback((name: string) => {
    setActiveLearner(name)
    setLearner(loadLearner(name))
    setLearners(listLearners())
  }, [])

  const update = useCallback((fn: (l: LearnerState) => void) => {
    setLearner((prev) => {
      const next: LearnerState = JSON.parse(JSON.stringify(prev))
      fn(next)
      saveLearner(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ learner, learners, switchLearner, update }), [learner, learners, switchLearner, update])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLearner(): LearnerCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLearner outside provider')
  return v
}
