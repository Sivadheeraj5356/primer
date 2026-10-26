import { SKILLS } from '../src/engine/skills'
import { makeActivity } from '../src/engine/session'
import { recordOutcome, pickNext, isMastered, isUnlocked, getSkillState, type LearnerState, UNLOCK_AT } from '../src/engine/mastery'
let seed = 7; const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
const profiles: [string, (lvl: number) => { p: number; hint: number }][] = [
  ['strong (95%, no hints)', () => ({ p: 0.95, hint: 0 })],
  ['good (80%, 20% hints)', () => ({ p: 0.8, hint: 0.2 })],
  ['average (65%, 30% hints)', () => ({ p: 0.65, hint: 0.3 })],
  ['struggling (40%, 50% hints)', () => ({ p: 0.4, hint: 0.5 })],
  ['harder-hurts (95% at L1, -20pts per level)', (l) => ({ p: Math.max(0.1, 1.15 - 0.2 * l), hint: 0.1 })],
]
for (const [name, f] of profiles) {
  const L: LearnerState = { name, createdAt: 0, skills: {}, sessions: [], totalStars: 0 }
  let n = 0, switches = 0, lastLevel: Record<string, number> = {}
  const doms = ['reading', 'writing', 'numbers'] as const
  while (n < 3000 && !SKILLS.every((s) => isMastered(L, s.id))) {
    for (const d of doms) {
      const pk = pickNext(L, d); if (!pk) continue
      const st = getSkillState(L, pk.skill.id)
      const act = makeActivity(pk.skill.id, st.level)
      const { p, hint } = f(st.level)
      const correct = rand() < p, firstTry = correct && rand() >= hint
      recordOutcome(L, pk.skill.id, { correct, difficulty: act.difficulty, firstTry })
      const nl = getSkillState(L, pk.skill.id).level; if (lastLevel[pk.skill.id] !== undefined && lastLevel[pk.skill.id] !== nl) switches++; lastLevel[pk.skill.id] = nl
      n++
    }
  }
  const mastered = SKILLS.filter((s) => isMastered(L, s.id)).length
  const unlocked = SKILLS.filter((s) => isUnlocked(L, s)).length
  console.log(`${name}: activities=${n} mastered=${mastered}/${SKILLS.length} unlocked=${unlocked} levelChanges=${switches} (${(switches / n).toFixed(2)}/activity)`)
}
// Which skills actually change content with difficulty?
const sig = (a: any) => JSON.stringify({ ...a, options: undefined, tiles: undefined, target: undefined, word: undefined, count: undefined, a: undefined, b: undefined, emoji: undefined, emojiA: undefined, emojiB: undefined, ask: undefined, part: undefined, answer: undefined, family: undefined, storyId: undefined, text: undefined, question: undefined, content: undefined, label: undefined })
console.log('\nSkills whose content depends on difficulty level:')
for (const s of SKILLS) {
  const stats = [1, 2, 3].filter((l) => l <= s.maxLevel).map((l) => {
    const xs = Array.from({ length: 200 }, () => makeActivity(s.id, l) as any)
    const nums = xs.flatMap((x) => [x.count, x.a, x.b, x.total].filter((v) => typeof v === 'number'))
    const keys = new Set(xs.map((x) => x.target ?? x.word ?? x.content ?? x.family ?? x.storyId ?? x.text ?? ''))
    return `L${l}: pool=${keys.size} maxNum=${nums.length ? Math.max(...nums) : '-'}`
  })
  const varies = new Set(stats.map((x) => x.slice(3))).size > 1
  console.log(`${varies ? 'ADAPTS ' : 'FLAT   '} ${s.id.padEnd(16)} ${stats.join(' | ')}`)
}
