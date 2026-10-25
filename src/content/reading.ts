// Early-reading content. Word lists follow a standard phonics progression:
// short-vowel CVC words first, then word families, then high-frequency sight
// words, then decodable sentences and stories. Every story here is original,
// written for this project, and fully decodable at its level.

export interface LetterSound {
  letter: string
  word: string // example word
  emoji: string
}

// Ordered introduction sequence (common in phonics programs: high-utility
// letters first so real words arrive early).
export const LETTER_SOUNDS: LetterSound[] = [
  { letter: 's', word: 'sun', emoji: '☀️' },
  { letter: 'a', word: 'apple', emoji: '🍎' },
  { letter: 't', word: 'tiger', emoji: '🐯' },
  { letter: 'p', word: 'pig', emoji: '🐷' },
  { letter: 'i', word: 'igloo', emoji: '🧊' },
  { letter: 'n', word: 'nest', emoji: '🪹' },
  { letter: 'm', word: 'moon', emoji: '🌙' },
  { letter: 'd', word: 'dog', emoji: '🐶' },
  { letter: 'g', word: 'goat', emoji: '🐐' },
  { letter: 'o', word: 'octopus', emoji: '🐙' },
  { letter: 'c', word: 'cat', emoji: '🐱' },
  { letter: 'k', word: 'kite', emoji: '🪁' },
  { letter: 'e', word: 'egg', emoji: '🥚' },
  { letter: 'h', word: 'hat', emoji: '🎩' },
  { letter: 'r', word: 'rabbit', emoji: '🐰' },
  { letter: 'u', word: 'umbrella', emoji: '☂️' },
  { letter: 'b', word: 'ball', emoji: '⚽' },
  { letter: 'f', word: 'fish', emoji: '🐟' },
  { letter: 'l', word: 'lion', emoji: '🦁' },
  { letter: 'j', word: 'jam', emoji: '🍓' },
  { letter: 'w', word: 'web', emoji: '🕸️' },
  { letter: 'v', word: 'van', emoji: '🚐' },
  { letter: 'y', word: 'yo-yo', emoji: '🪀' },
  { letter: 'z', word: 'zebra', emoji: '🦓' },
  { letter: 'x', word: 'box', emoji: '📦' },
  { letter: 'q', word: 'queen', emoji: '👑' },
]

export interface CvcWord {
  word: string
  emoji: string
  vowel: 'a' | 'e' | 'i' | 'o' | 'u'
}

export const CVC_WORDS: CvcWord[] = [
  { word: 'cat', emoji: '🐱', vowel: 'a' }, { word: 'hat', emoji: '🎩', vowel: 'a' },
  { word: 'bat', emoji: '🦇', vowel: 'a' }, { word: 'map', emoji: '🗺️', vowel: 'a' },
  { word: 'jam', emoji: '🍓', vowel: 'a' }, { word: 'van', emoji: '🚐', vowel: 'a' },
  { word: 'hen', emoji: '🐔', vowel: 'e' }, { word: 'web', emoji: '🕸️', vowel: 'e' },
  { word: 'bed', emoji: '🛏️', vowel: 'e' }, { word: 'ten', emoji: '🔟', vowel: 'e' },
  { word: 'pig', emoji: '🐷', vowel: 'i' }, { word: 'fish', emoji: '🐟', vowel: 'i' },
  { word: 'six', emoji: '6️⃣', vowel: 'i' }, { word: 'milk', emoji: '🥛', vowel: 'i' },
  { word: 'dog', emoji: '🐶', vowel: 'o' }, { word: 'fox', emoji: '🦊', vowel: 'o' },
  { word: 'box', emoji: '📦', vowel: 'o' }, { word: 'pot', emoji: '🍲', vowel: 'o' },
  { word: 'sun', emoji: '☀️', vowel: 'u' }, { word: 'bus', emoji: '🚌', vowel: 'u' },
  { word: 'cup', emoji: '🥤', vowel: 'u' }, { word: 'bug', emoji: '🐞', vowel: 'u' },
]

export const WORD_FAMILIES: { family: string; words: string[] }[] = [
  { family: '-at', words: ['cat', 'hat', 'bat', 'mat', 'sat'] },
  { family: '-an', words: ['can', 'fan', 'man', 'ran', 'van'] },
  { family: '-ig', words: ['big', 'dig', 'fig', 'pig', 'wig'] },
  { family: '-og', words: ['dog', 'fog', 'hog', 'jog', 'log'] },
  { family: '-un', words: ['bun', 'fun', 'run', 'sun'] },
  { family: '-et', words: ['jet', 'net', 'pet', 'wet'] },
]

// High-frequency words that don't decode cleanly with early phonics.
export const SIGHT_WORDS: string[] = [
  'the', 'and', 'a', 'to', 'said', 'you', 'was', 'is', 'he', 'she',
  'we', 'my', 'of', 'they', 'are',
]

export interface DecodableSentence {
  text: string
  emoji: string
  question: string
  options: [string, string]
  answer: 0 | 1
}

export const SENTENCES: DecodableSentence[] = [
  { text: 'The cat sat on the mat.', emoji: '🐱', question: 'Where did the cat sit?', options: ['On the mat', 'On the bus'], answer: 0 },
  { text: 'A big red bus can go fast.', emoji: '🚌', question: 'What can go fast?', options: ['A bus', 'A bug'], answer: 0 },
  { text: 'The hen is in the pen.', emoji: '🐔', question: 'Where is the hen?', options: ['In the pen', 'In the sun'], answer: 0 },
  { text: 'Sam has a red cup.', emoji: '🥤', question: 'What does Sam have?', options: ['A cup', 'A cap'], answer: 0 },
  { text: 'The dog ran to the log.', emoji: '🐶', question: 'What ran?', options: ['The dog', 'The log'], answer: 0 },
  { text: 'A fox is in the box.', emoji: '🦊', question: 'Where is the fox?', options: ['In the box', 'On the bus'], answer: 0 },
  { text: 'The sun is up in the sky.', emoji: '☀️', question: 'What is up?', options: ['The sun', 'The van'], answer: 0 },
  { text: 'The pig is big and pink.', emoji: '🐷', question: 'What is the pig like?', options: ['Big and pink', 'Small and wet'], answer: 0 },
]

export interface Story {
  id: string
  title: string
  // Short paragraphs of decodable text.
  paragraphs: string[]
  questions: { question: string; options: [string, string]; answer: 0 | 1 }[]
}

export const STORIES: Story[] = [
  {
    id: 'the-lost-hat',
    title: 'The Lost Hat',
    paragraphs: [
      'Sam had a red hat. He loved his red hat.',
      'One day the wind came. Whoosh! The hat was gone.',
      'Sam ran and ran. He saw the hat on a big hen. The hen sat on the hat.',
      '"That is my hat," said Sam. The hen got up. Sam got his hat back. He was glad.',
    ],
    questions: [
      { question: 'What did Sam lose?', options: ['His hat', 'His hen'], answer: 0 },
      { question: 'Where was the hat?', options: ['On a hen', 'On a bus'], answer: 0 },
    ],
  },
  {
    id: 'a-fox-in-a-box',
    title: 'A Fox in a Box',
    paragraphs: [
      'Dot has a big box. She put the box in the sun.',
      'A little fox ran past. Hop! The fox got in the box.',
      '"Come out, little fox," said Dot. But the fox did not get out. It was napping.',
      'Dot got a pot and a pan. Bang, bang! The fox sat up and ran off. Dot was sad. Then she was glad. The box was a bed for a fox, just for a bit.',
    ],
    questions: [
      { question: 'Who got in the box?', options: ['A fox', 'A dog'], answer: 0 },
      { question: 'What did Dot bang?', options: ['A pot and a pan', 'A bus and a van'], answer: 0 },
    ],
  },
  {
    id: 'the-big-dig',
    title: 'The Big Dig',
    paragraphs: [
      'Pip the pig likes to dig. He digs in the mud.',
      'One day Pip dug and dug. He dug up a tin can. He dug up an old map!',
      'The map led to a hill. Pip ran up the hill and dug.',
      'In the mud was a red gem. "It is fun to dig," said Pip. And it was.',
    ],
    questions: [
      { question: 'What does Pip like to do?', options: ['Dig', 'Run'], answer: 0 },
      { question: 'What did Pip find on the hill?', options: ['A gem', 'A jam pot'], answer: 0 },
    ],
  },
]
