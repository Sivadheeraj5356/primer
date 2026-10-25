// Turns (skill, difficulty rung) into concrete activities.

import { CVC_WORDS, LETTER_SOUNDS, SENTENCES, SIGHT_WORDS, STORIES, WORD_FAMILIES } from '../content/reading'
import { WARMUP_STROKES } from '../content/tracing'

export type Activity =
  | { kind: 'sound-pick'; skillId: string; difficulty: number; target: string; options: string[] }
  | { kind: 'word-build'; skillId: string; difficulty: number; word: string; emoji: string; tiles: string[] }
  | { kind: 'family-pick'; skillId: string; difficulty: number; family: string; options: string[]; answer: string }
  | { kind: 'sight-pick'; skillId: string; difficulty: number; word: string; options: string[] }
  | { kind: 'sentence-read'; skillId: string; difficulty: number; text: string; emoji: string; question: string; options: [string, string]; answer: 0 | 1 }
  | { kind: 'story-read'; skillId: string; difficulty: number; storyId: string }
  | { kind: 'trace'; skillId: string; difficulty: number; mode: 'shape' | 'letter' | 'word'; content: string; label: string }
  | { kind: 'count'; skillId: string; difficulty: number; count: number; emoji: string; options: number[] }
  | { kind: 'compare'; skillId: string; difficulty: number; a: number; b: number; emojiA: string; emojiB: string; ask: 'more' | 'fewer' }
  | { kind: 'add-sub'; skillId: string; difficulty: number; a: number; b: number; op: '+' | '-'; options: number[] }
  | { kind: 'bonds'; skillId: string; difficulty: number; total: number; part: number; options: number[] }

const rnd = (n: number) => Math.floor(Math.random() * n)
const pick = <T,>(arr: T[]): T => arr[rnd(arr.length)]
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

function numberOptions(answer: number, spread: number, min = 0): number[] {
  const set = new Set<number>([answer])
  let guard = 0
  while (set.size < 3 && guard++ < 50) {
    const cand = answer + (rnd(spread * 2 + 1) - spread)
    if (cand >= min && cand !== answer) set.add(cand)
  }
  return shuffle([...set])
}

const COUNT_EMOJIS = ['🍎', '⭐', '🐤', '🌸', '🐠', '🎈', '🍪', '🦋', '🚗', '🐸']

export function makeActivity(skillId: string, difficulty: number): Activity {
  switch (skillId) {
    case 'r-letter-sounds': {
      // Higher rungs draw from a bigger, more confusable letter pool.
      const poolSize = difficulty === 1 ? 6 : difficulty === 2 ? 15 : LETTER_SOUNDS.length
      const pool = LETTER_SOUNDS.slice(0, poolSize)
      const target = pick(pool)
      const options = shuffle([target.letter, ...shuffle(pool.filter((l) => l.letter !== target.letter)).slice(0, 2).map((l) => l.letter)])
      return { kind: 'sound-pick', skillId, difficulty, target: target.letter, options }
    }
    case 'r-cvc-words': {
      const vowels = difficulty === 1 ? ['a'] : difficulty === 2 ? ['a', 'e', 'i'] : ['a', 'e', 'i', 'o', 'u']
      const pool = CVC_WORDS.filter((w) => vowels.includes(w.vowel))
      const target = pick(pool)
      return { kind: 'word-build', skillId, difficulty, word: target.word, emoji: target.emoji, tiles: shuffle(target.word.split('')) }
    }
    case 'r-word-families': {
      const fam = pick(WORD_FAMILIES)
      const answer = pick(fam.words)
      const outsiders = WORD_FAMILIES.filter((f) => f.family !== fam.family).flatMap((f) => f.words)
      const options = shuffle([answer, ...shuffle(outsiders).slice(0, 2)])
      return { kind: 'family-pick', skillId, difficulty, family: fam.family, options, answer }
    }
    case 'r-sight-words': {
      const word = pick(SIGHT_WORDS)
      const options = shuffle([word, ...shuffle(SIGHT_WORDS.filter((w) => w !== word)).slice(0, 2)])
      return { kind: 'sight-pick', skillId, difficulty, word, options }
    }
    case 'r-sentences': {
      const s = pick(SENTENCES)
      return { kind: 'sentence-read', skillId, difficulty, text: s.text, emoji: s.emoji, question: s.question, options: s.options, answer: s.answer }
    }
    case 'r-stories':
      return { kind: 'story-read', skillId, difficulty, storyId: pick(STORIES).id }

    case 'w-strokes': {
      const shape = WARMUP_STROKES[Math.min(rnd(WARMUP_STROKES.length), WARMUP_STROKES.length - 1)]
      return { kind: 'trace', skillId, difficulty, mode: 'shape', content: shape.id, label: shape.label }
    }
    case 'w-uppercase': {
      const letters = difficulty === 1 ? 'ABCDEFGHI' : difficulty === 2 ? 'JKLMNOPQRS' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const ch = letters[rnd(letters.length)]
      return { kind: 'trace', skillId, difficulty, mode: 'letter', content: ch, label: `Big letter ${ch}` }
    }
    case 'w-lowercase': {
      const letters = difficulty === 1 ? 'abcdefghi' : difficulty === 2 ? 'jklmnopqrs' : 'abcdefghijklmnopqrstuvwxyz'
      const ch = letters[rnd(letters.length)]
      return { kind: 'trace', skillId, difficulty, mode: 'letter', content: ch, label: `Small letter ${ch}` }
    }
    case 'w-words': {
      const target = pick(CVC_WORDS)
      return { kind: 'trace', skillId, difficulty, mode: 'word', content: target.word, label: `Write "${target.word}"` }
    }

    case 'n-count-10': {
      const max = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 10
      const count = 1 + rnd(max)
      return { kind: 'count', skillId, difficulty, count, emoji: pick(COUNT_EMOJIS), options: numberOptions(count, 2, 1) }
    }
    case 'n-count-20': {
      const count = 10 + rnd(11)
      return { kind: 'count', skillId, difficulty, count, emoji: pick(COUNT_EMOJIS), options: numberOptions(count, 3, 1) }
    }
    case 'n-compare': {
      let a = 1 + rnd(9)
      let b = 1 + rnd(9)
      if (a === b) b = a === 9 ? a - 2 : a + 1
      return { kind: 'compare', skillId, difficulty, a, b, emojiA: pick(COUNT_EMOJIS), emojiB: pick(COUNT_EMOJIS), ask: Math.random() < 0.5 ? 'more' : 'fewer' }
    }
    case 'n-add-10': {
      const maxSum = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10
      const a = 1 + rnd(maxSum - 1)
      const b = 1 + rnd(maxSum - a)
      return { kind: 'add-sub', skillId, difficulty, a, b, op: '+', options: numberOptions(a + b, 2) }
    }
    case 'n-sub-10': {
      const max = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10
      const a = 2 + rnd(max - 1)
      const b = 1 + rnd(a - 1)
      return { kind: 'add-sub', skillId, difficulty, a, b, op: '-', options: numberOptions(a - b, 2) }
    }
    case 'n-number-bonds': {
      const total = difficulty === 1 ? 5 : 10
      const part = rnd(total + 1)
      return { kind: 'bonds', skillId, difficulty, total, part, options: numberOptions(total - part, 2) }
    }
    default:
      throw new Error(`no activity generator for skill ${skillId}`)
  }
}
