// The skill graph. Skills are ordered inside each domain; a skill unlocks when
// every prerequisite reaches the UNLOCK_AT mastery threshold.

export type Domain = 'reading' | 'writing' | 'numbers'

export interface Skill {
  id: string
  domain: Domain
  title: string
  blurb: string
  prerequisites: string[]
  // Difficulty ladder height for this skill (1..3 difficulty steps).
  maxLevel: number
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  reading: 'Reading',
  writing: 'Writing',
  numbers: 'Numbers',
}

export const DOMAIN_ICON: Record<Domain, string> = {
  reading: '📖',
  writing: '✏️',
  numbers: '🔢',
}

export const SKILLS: Skill[] = [
  // --- Reading: phonics ladder -> words -> sentences -> stories
  { id: 'r-letter-sounds', domain: 'reading', title: 'Letter sounds', blurb: 'Hear a sound, find its letter.', prerequisites: [], maxLevel: 3 },
  { id: 'r-cvc-words', domain: 'reading', title: 'First words', blurb: 'Blend sounds into short words like cat and sun.', prerequisites: ['r-letter-sounds'], maxLevel: 3 },
  { id: 'r-word-families', domain: 'reading', title: 'Word families', blurb: 'Words that rhyme, like cat, hat, mat.', prerequisites: ['r-cvc-words'], maxLevel: 2 },
  { id: 'r-sight-words', domain: 'reading', title: 'Sight words', blurb: 'Words we know by sight: the, and, said.', prerequisites: ['r-cvc-words'], maxLevel: 2 },
  { id: 'r-sentences', domain: 'reading', title: 'Sentences', blurb: 'Read short sentences and answer about them.', prerequisites: ['r-cvc-words', 'r-sight-words'], maxLevel: 2 },
  { id: 'r-stories', domain: 'reading', title: 'Little stories', blurb: 'Read a little story and talk about it.', prerequisites: ['r-sentences'], maxLevel: 2 },

  // --- Writing: tracing -> letters -> writing words
  { id: 'w-strokes', domain: 'writing', title: 'First strokes', blurb: 'Warm-up lines and curves for little hands.', prerequisites: [], maxLevel: 2 },
  { id: 'w-uppercase', domain: 'writing', title: 'Big letters', blurb: 'Trace and write A, B, C.', prerequisites: ['w-strokes'], maxLevel: 3 },
  { id: 'w-lowercase', domain: 'writing', title: 'Small letters', blurb: 'Trace and write a, b, c.', prerequisites: ['w-uppercase'], maxLevel: 3 },
  { id: 'w-words', domain: 'writing', title: 'Writing words', blurb: 'Write your first words.', prerequisites: ['w-lowercase'], maxLevel: 2 },

  // --- Numbers: counting -> comparing -> adding -> subtracting
  { id: 'n-count-10', domain: 'numbers', title: 'Count to 10', blurb: 'Count things you can see.', prerequisites: [], maxLevel: 3 },
  { id: 'n-count-20', domain: 'numbers', title: 'Count to 20', blurb: 'Bigger groups to count.', prerequisites: ['n-count-10'], maxLevel: 2 },
  { id: 'n-compare', domain: 'numbers', title: 'More or less', blurb: 'Which group has more?', prerequisites: ['n-count-10'], maxLevel: 2 },
  { id: 'n-add-10', domain: 'numbers', title: 'Adding', blurb: 'Put groups together: 2 and 3 make 5.', prerequisites: ['n-count-10'], maxLevel: 3 },
  { id: 'n-sub-10', domain: 'numbers', title: 'Taking away', blurb: 'How many are left?', prerequisites: ['n-add-10'], maxLevel: 3 },
  { id: 'n-number-bonds', domain: 'numbers', title: 'Number bonds', blurb: 'Pairs that make 10, like 6 and 4.', prerequisites: ['n-add-10'], maxLevel: 2 },
]

export function skillById(id: string): Skill {
  const s = SKILLS.find((s) => s.id === id)
  if (!s) throw new Error(`unknown skill ${id}`)
  return s
}

export function skillsOf(domain: Domain): Skill[] {
  return SKILLS.filter((s) => s.domain === domain)
}
