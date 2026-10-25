import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Grid, Text } from '@radix-ui/themes'
import type { Activity } from '../engine/session'
import { speak, speakLetterSound } from '../engine/speech'
import { STORIES } from '../content/reading'
import { TutorBar } from './TutorBar'
import { Trace } from './Trace'

type Done = (correct: boolean, firstTry: boolean) => void

const PRAISE = ['Yes!', 'You got it!', 'Well done!', 'That is right!', 'Lovely work!']
const NUDGE = ['Not quite - have another go.', 'Almost. Try again.', 'Good try. One more look.']
const pickLine = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

function useOptions() {
  const [used, setUsed] = useState<string | null>(null)
  const [wrong, setWrong] = useState<string[]>([])
  const [hinted, setHinted] = useState(false)
  return { used, setUsed, wrong, setWrong, hinted, setHinted }
}

export function ActivityView({ activity, onDone }: { activity: Activity; onDone: Done }) {
  switch (activity.kind) {
    case 'sound-pick': return <SoundPick a={activity} onDone={onDone} />
    case 'word-build': return <WordBuild a={activity} onDone={onDone} />
    case 'family-pick': return <FamilyPick a={activity} onDone={onDone} />
    case 'sight-pick': return <SightPick a={activity} onDone={onDone} />
    case 'sentence-read': return <SentenceRead a={activity} onDone={onDone} />
    case 'story-read': return <StoryRead a={activity} onDone={onDone} />
    case 'trace': return <Trace a={activity} onDone={onDone} />
    case 'count': return <CountIt a={activity} onDone={onDone} />
    case 'compare': return <Compare a={activity} onDone={onDone} />
    case 'add-sub': return <AddSub a={activity} onDone={onDone} />
    case 'bonds': return <Bonds a={activity} onDone={onDone} />
  }
}

function SoundPick({ a, onDone }: { a: Extract<Activity, { kind: 'sound-pick' }>; onDone: Done }) {
  const { used, setUsed, wrong, setWrong, hinted, setHinted } = useOptions()
  useEffect(() => { speakLetterSound(a.target) }, [a.target])
  const choose = (opt: string) => {
    if (used) return
    if (opt === a.target) {
      setUsed(opt); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0 && !hinted), 700)
    } else {
      setWrong([...wrong, opt]); speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text="Listen to the sound, then tap its letter." say="" />
      <Flex justify="center" mb="4" gap="3">
        <Button size="4" onClick={() => speakLetterSound(a.target)}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>volume_up</span> Hear the sound</Button>
        {!hinted && (
          <Button size="4" variant="soft" onClick={() => { setHinted(true); speak(`It makes the sound at the start of a word. Listen again.`); speakLetterSound(a.target) }}>
            Give me a hint
          </Button>
        )}
      </Flex>
      <Flex gap="3" justify="center" wrap="wrap">
        {a.options.map((o) => (
          <button
            key={o}
            className={`answer-card ${used === o ? 'correct' : ''} ${wrong.includes(o) ? 'wrong' : ''}`}
            style={{ fontSize: 48, minWidth: 96 }}
            disabled={wrong.includes(o) || !!used}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </Flex>
    </Box>
  )
}

function WordBuild({ a, onDone }: { a: Extract<Activity, { kind: 'word-build' }>; onDone: Done }) {
  const [placed, setPlaced] = useState<string[]>([])
  const [available, setAvailable] = useState<string[]>(a.tiles)
  const [mistakes, setMistakes] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => { speak(a.word) }, [a.word])

  const place = (tile: string, idx: number) => {
    if (done) return
    const expected = a.word[placed.length]
    if (tile === expected) {
      const next = [...placed, tile]
      setPlaced(next)
      setAvailable(available.filter((_, i) => i !== idx))
      speak(tile)
      if (next.length === a.word.length) {
        setDone(true)
        speak(`${a.word}! ${pickLine(PRAISE)}`)
        setTimeout(() => onDone(true, mistakes === 0 && !hinted), 1100)
      }
    } else {
      setMistakes(mistakes + 1)
      speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text="Build the word. Tap the letters in order." say="" />
      <Flex direction="column" align="center" gap="4">
        <Text className="big-emoji" aria-hidden>{a.emoji}</Text>
        <Button size="3" variant="soft" onClick={() => speak(a.word)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>volume_up</span> Hear the word</Button>
        <Flex gap="2">
          {a.word.split('').map((_, i) => (
            <div key={i} className="tile-slot">{placed[i] ?? ''}</div>
          ))}
        </Flex>
        <Flex gap="2" wrap="wrap" justify="center">
          {available.map((t, i) => (
            <button key={`${t}-${i}`} className="tile" onClick={() => place(t, i)}>{t}</button>
          ))}
        </Flex>
        {!hinted && !done && (
          <Button variant="soft" onClick={() => { setHinted(true); speak(`The first letter is ${a.word[0]}`) }}>
            Give me a hint
          </Button>
        )}
      </Flex>
    </Box>
  )
}

function FamilyPick({ a, onDone }: { a: Extract<Activity, { kind: 'family-pick' }>; onDone: Done }) {
  const { used, setUsed, wrong, setWrong } = useOptions()
  useEffect(() => { speak(`Which word belongs to the ${a.family} family?`) }, [a.family])
  const choose = (opt: string) => {
    if (used) return
    if (opt === a.answer) {
      setUsed(opt); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0), 700)
    } else {
      setWrong([...wrong, opt]); speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text={`Which word lives in the "${a.family}" family?`} say="" />
      <Flex gap="3" justify="center" wrap="wrap">
        {a.options.map((o) => (
          <button
            key={o}
            className={`answer-card ${used === o ? 'correct' : ''} ${wrong.includes(o) ? 'wrong' : ''}`}
            disabled={wrong.includes(o) || !!used}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </Flex>
    </Box>
  )
}

function SightPick({ a, onDone }: { a: Extract<Activity, { kind: 'sight-pick' }>; onDone: Done }) {
  const { used, setUsed, wrong, setWrong } = useOptions()
  useEffect(() => { speak(`Find the word ${a.word}. ${a.word}.`) }, [a.word])
  const choose = (opt: string) => {
    if (used) return
    if (opt === a.word) {
      setUsed(opt); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0), 700)
    } else {
      setWrong([...wrong, opt]); speak(opt); speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text={`Find the word "${a.word}".`} say="" />
      <Flex gap="3" justify="center" wrap="wrap">
        {a.options.map((o) => (
          <button
            key={o}
            className={`answer-card ${used === o ? 'correct' : ''} ${wrong.includes(o) ? 'wrong' : ''}`}
            disabled={wrong.includes(o) || !!used}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </Flex>
    </Box>
  )
}

function SentenceRead({ a, onDone }: { a: Extract<Activity, { kind: 'sentence-read' }>; onDone: Done }) {
  const [stage, setStage] = useState<'read' | 'answer'>('read')
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongOnce, setWrongOnce] = useState(false)
  return (
    <Box>
      <TutorBar
        text={stage === 'read' ? 'Read the sentence, tapping any word to hear it.' : a.question}
        say={stage === 'read' ? 'Read the sentence. Tap a word to hear it.' : a.question}
      />
      <Flex direction="column" align="center" gap="4">
        <Text className="big-emoji" aria-hidden>{a.emoji}</Text>
        <Flex gap="2" wrap="wrap" justify="center">
          {a.text.replace(/[.!?]$/, '').split(' ').map((w, i) => (
            <button key={i} className="tile" style={{ minWidth: 0, padding: '0 14px' }} onClick={() => speak(w)}>{w}</button>
          ))}
        </Flex>
        {stage === 'read' ? (
          <Button size="4" onClick={() => { setStage('answer'); speak(a.question) }}>I read it</Button>
        ) : (
          <Flex gap="3" wrap="wrap" justify="center">
            {a.options.map((o, i) => (
              <button
                key={o}
                className={`answer-card ${picked === i && i === a.answer ? 'correct' : ''} ${picked === i && i !== a.answer ? 'wrong' : ''}`}
                style={{ fontSize: 24 }}
                disabled={picked !== null}
                onClick={() => {
                  if (i === a.answer) {
                    setPicked(i); speak(pickLine(PRAISE))
                    setTimeout(() => onDone(true, !wrongOnce), 700)
                  } else {
                    setPicked(i); setWrongOnce(true); speak(pickLine(NUDGE))
                    setTimeout(() => setPicked(null), 900)
                  }
                }}
              >
                {o}
              </button>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

function StoryRead({ a, onDone }: { a: Extract<Activity, { kind: 'story-read' }>; onDone: Done }) {
  const story = STORIES.find((s) => s.id === a.storyId)!
  const [page, setPage] = useState(0)
  const [q, setQ] = useState(0)
  const [wrongOnce, setWrongOnce] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const inQuestions = page >= story.paragraphs.length

  useEffect(() => {
    if (!inQuestions) speak(story.paragraphs[page])
    else speak(story.questions[q].question)
  }, [page, q, inQuestions, story])

  return (
    <Box>
      <TutorBar
        text={inQuestions ? story.questions[q].question : story.title}
        say=""
      />
      <Flex direction="column" gap="4" align="center">
        {!inQuestions ? (
          <>
            <Box className="paper" p="5" style={{ maxWidth: 560 }}>
              <Text size="5" className="learning-text" style={{ lineHeight: 1.8 }}>{story.paragraphs[page]}</Text>
            </Box>
            <Flex gap="3">
              <Button variant="soft" disabled={page === 0} onClick={() => setPage(page - 1)}>Back</Button>
              <Button size="3" onClick={() => setPage(page + 1)}>
                {page === story.paragraphs.length - 1 ? 'Answer questions' : 'Next page'}
              </Button>
            </Flex>
            <Text size="1" color="gray">Page {page + 1} of {story.paragraphs.length}</Text>
          </>
        ) : (
          <Flex gap="3" wrap="wrap" justify="center">
            {story.questions[q].options.map((o, i) => (
              <button
                key={o}
                className={`answer-card ${picked === i && i === story.questions[q].answer ? 'correct' : ''} ${picked === i && i !== story.questions[q].answer ? 'wrong' : ''}`}
                style={{ fontSize: 24 }}
                disabled={picked !== null}
                onClick={() => {
                  if (i === story.questions[q].answer) {
                    setPicked(i); speak(pickLine(PRAISE))
                    setTimeout(() => {
                      setPicked(null)
                      if (q + 1 < story.questions.length) setQ(q + 1)
                      else onDone(true, !wrongOnce)
                    }, 700)
                  } else {
                    setPicked(i); setWrongOnce(true); speak(pickLine(NUDGE))
                    setTimeout(() => setPicked(null), 900)
                  }
                }}
              >
                {o}
              </button>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

function CountIt({ a, onDone }: { a: Extract<Activity, { kind: 'count' }>; onDone: Done }) {
  const [used, setUsed] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const grid = useMemo(() => Array.from({ length: a.count }, (_, i) => i), [a.count])
  const choose = (n: number) => {
    if (used !== null) return
    if (n === a.count) {
      setUsed(n); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0), 700)
    } else {
      setWrong([...wrong, n]); speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text="How many do you see? Count them, then tap the number." say="" />
      <Grid columns={a.count > 12 ? '7' : '5'} gap="2" mb="4" style={{ maxWidth: 420, margin: '0 auto' }}>
        {grid.map((i) => <Text key={i} style={{ fontSize: 36, textAlign: 'center' }}>{a.emoji}</Text>)}
      </Grid>
      <Flex gap="3" justify="center">
        {a.options.map((n) => (
          <button
            key={n}
            className={`answer-card ${used === n ? 'correct' : ''} ${wrong.includes(n) ? 'wrong' : ''}`}
            disabled={wrong.includes(n) || used !== null}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </Flex>
    </Box>
  )
}

function Compare({ a, onDone }: { a: Extract<Activity, { kind: 'compare' }>; onDone: Done }) {
  const [picked, setPicked] = useState<'a' | 'b' | null>(null)
  const [wrongOnce, setWrongOnce] = useState(false)
  const correctSide = (a.ask === 'more' ? a.a > a.b : a.a < a.b) ? 'a' : 'b'
  const Group = ({ n, emoji, side }: { n: number; emoji: string; side: 'a' | 'b' }) => (
    <button
      className={`answer-card ${picked === side && side === correctSide ? 'correct' : ''} ${picked === side && side !== correctSide ? 'wrong' : ''}`}
      style={{ minWidth: 140, fontSize: 22 }}
      disabled={picked !== null}
      onClick={() => {
        if (side === correctSide) {
          setPicked(side); speak(pickLine(PRAISE))
          setTimeout(() => onDone(true, !wrongOnce), 700)
        } else {
          setPicked(side); setWrongOnce(true); speak(pickLine(NUDGE))
          setTimeout(() => setPicked(null), 900)
        }
      }}
    >
      <Flex direction="column" align="center" gap="1">
        <Flex wrap="wrap" justify="center" style={{ maxWidth: 120 }}>
          {Array.from({ length: n }, (_, i) => <span key={i} style={{ fontSize: 24 }}>{emoji}</span>)}
        </Flex>
      </Flex>
    </button>
  )
  return (
    <Box>
      <TutorBar text={`Tap the group that has ${a.ask}.`} say="" />
      <Flex gap="5" justify="center" align="center">
        <Group n={a.a} emoji={a.emojiA} side="a" />
        <Group n={a.b} emoji={a.emojiB} side="b" />
      </Flex>
    </Box>
  )
}

function AddSub({ a, onDone }: { a: Extract<Activity, { kind: 'add-sub' }>; onDone: Done }) {
  const [used, setUsed] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const answer = a.op === '+' ? a.a + a.b : a.a - a.b
  const choose = (n: number) => {
    if (used !== null) return
    if (n === answer) {
      setUsed(n); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0), 700)
    } else {
      setWrong([...wrong, n]); speak(pickLine(NUDGE))
    }
  }
  const Block = ({ n, shade }: { n: number; shade: string }) => (
    <Flex gap="1" wrap="wrap" style={{ maxWidth: 200, justifyContent: 'center' }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ width: 26, height: 26, borderRadius: 6, background: shade, display: 'inline-block' }} />
      ))}
    </Flex>
  )
  return (
    <Box>
      <TutorBar text={a.op === '+' ? 'Put the groups together. How many in all?' : 'Take some away. How many are left?'} say="" />
      <Flex direction="column" align="center" gap="3" mb="4">
        <Flex align="center" gap="4" wrap="wrap" justify="center">
          <Block n={a.a} shade="#1f5c45" />
          <Text size="6" weight="bold">{a.op}</Text>
          <Block n={a.b} shade="#c96a1e" />
          <Text size="6" weight="bold">=</Text>
          <Text size="6" weight="bold">?</Text>
        </Flex>
        <Text size="5" className="learning-text">{a.a} {a.op} {a.b} = ?</Text>
      </Flex>
      <Flex gap="3" justify="center">
        {a.options.map((n) => (
          <button
            key={n}
            className={`answer-card ${used === n ? 'correct' : ''} ${wrong.includes(n) ? 'wrong' : ''}`}
            disabled={wrong.includes(n) || used !== null}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </Flex>
    </Box>
  )
}

function Bonds({ a, onDone }: { a: Extract<Activity, { kind: 'bonds' }>; onDone: Done }) {
  const [used, setUsed] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const answer = a.total - a.part
  const choose = (n: number) => {
    if (used !== null) return
    if (n === answer) {
      setUsed(n); speak(pickLine(PRAISE))
      setTimeout(() => onDone(true, wrong.length === 0), 700)
    } else {
      setWrong([...wrong, n]); speak(pickLine(NUDGE))
    }
  }
  return (
    <Box>
      <TutorBar text={`${a.part} and what make ${a.total}?`} say="" />
      <Flex justify="center" gap="1" mb="4" wrap="wrap">
        {Array.from({ length: a.total }, (_, i) => (
          <span key={i} style={{ width: 30, height: 30, borderRadius: 6, background: i < a.part ? '#1f5c45' : '#e7e0cd', border: i < a.part ? 'none' : '2px dashed #c4b998' }} />
        ))}
      </Flex>
      <Flex gap="3" justify="center">
        {a.options.map((n) => (
          <button
            key={n}
            className={`answer-card ${used === n ? 'correct' : ''} ${wrong.includes(n) ? 'wrong' : ''}`}
            disabled={wrong.includes(n) || used !== null}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </Flex>
    </Box>
  )
}
