import { useMemo, useRef, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ActivityView } from '../components/activities'
import { useLearner } from '../components/LearnerContext'
import { recordOutcome, pickNext, getSkillState } from '../engine/mastery'
import { makeActivity, type Activity } from '../engine/session'
import { DOMAIN_LABEL, skillById, type Domain } from '../engine/skills'
import { speak } from '../engine/speech'

const SESSION_LENGTH = 6

export function Play() {
  const { domain } = useParams<{ domain: string }>()
  const d = (domain ?? 'reading') as Domain
  const [search] = useSearchParams()
  const forcedSkill = search.get('skill')
  const { learner, update } = useLearner()

  const startedAt = useRef(Date.now())
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [recentSkills, setRecentSkills] = useState<string[]>([])
  const [results, setResults] = useState<{ skillId: string; correct: boolean }[]>([])
  const [done, setDone] = useState(false)

  const activity: Activity | null = useMemo(() => {
    if (done) return null
    let skillId: string
    let level: number
    if (forcedSkill) {
      skillId = forcedSkill
      level = getSkillState(learner, forcedSkill).level
    } else {
      // Avoid the same skill three times in a row for variety.
      let pick = pickNext(learner, d)
      if (pick && recentSkills.length >= 2 && recentSkills.slice(-2).every((s) => s === pick!.skill.id)) {
        pick = null
      }
      if (!pick) {
        const all = pickNext(learner, d)
        if (!all) return null
        pick = all
      }
      skillId = pick.skill.id
      level = getSkillState(learner, skillId).level
    }
    const act = makeActivity(skillId, level)
    // Test/demo hook: pin a specific warm-up shape via ?shape=<id>
    const shapeParam = search.get('shape')
    if (act.kind === 'trace' && act.mode === 'shape' && shapeParam) {
      return { ...act, content: shapeParam, label: shapeParam.replace(/-/g, ' ') }
    }
    return act
    // index drives regeneration after each outcome
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done, d, forcedSkill])

  const finishSession = (finalResults: { skillId: string; correct: boolean }[], finalStars: number) => {
    setDone(true)
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    update((l) => {
      l.sessions.push({
        at: Date.now(),
        domain: d,
        activities: finalResults.length,
        correct: finalResults.filter((r) => r.correct).length,
        minutes,
      })
    })
    speak(`Practice complete! You earned ${finalStars} stars today.`)
  }

  const handleDone = (correct: boolean, firstTry: boolean) => {
    if (!activity) return
    const earned = correct ? (firstTry ? 2 : 1) : 0
    const newStars = stars + earned
    setStars(newStars)
    const newResults = [...results, { skillId: activity.skillId, correct }]
    setResults(newResults)
    setRecentSkills([...recentSkills, activity.skillId])
    update((l) => {
      recordOutcome(l, activity.skillId, { correct, difficulty: activity.difficulty, firstTry })
      l.totalStars += earned
    })
    const nextIndex = index + 1
    if (nextIndex >= SESSION_LENGTH) finishSession(newResults, newStars)
    else setIndex(nextIndex)
  }

  if (done) {
    const correctCount = results.filter((r) => r.correct).length
    const improved = [...new Set(results.filter((r) => r.correct).map((r) => skillById(r.skillId).title))]
    return (
      <Flex direction="column" align="center" gap="4" py="6">
        <span className="material-symbols-outlined pop" style={{ fontSize: 56, color: '#e26d38' }}>celebration</span>
        <Heading size="7" style={{ letterSpacing: '-0.02em' }}>Practice complete!</Heading>
        <Card style={{ width: '100%', maxWidth: 480 }}>
          <Flex direction="column" gap="3" align="center" py="2">
            <Flex gap="1">
              {Array.from({ length: SESSION_LENGTH * 2 }, (_, i) => (
                <span key={i} className={`star ${i < stars ? '' : 'dim'}`}>★</span>
              ))}
            </Flex>
            <Text size="3">{correctCount} of {results.length} activities correct</Text>
            {improved.length > 0 && (
              <Text size="2" color="gray" align="center">
                Practiced: {improved.join(', ')}
              </Text>
            )}
            <Text size="2" color="gray">Total stars: {learner.totalStars}</Text>
          </Flex>
        </Card>
        <Flex gap="3">
          <Button size="3" onClick={() => { setIndex(0); setStars(0); setResults([]); setRecentSkills([]); setDone(false); startedAt.current = Date.now() }}>
            Practice again
          </Button>
          <Button size="3" variant="soft" asChild><Link to={`/learn/${d}`} style={{ textDecoration: 'none' }}>Back to {DOMAIN_LABEL[d]}</Link></Button>
        </Flex>
      </Flex>
    )
  }

  if (!activity) {
    return (
      <Flex direction="column" gap="3">
        <Heading size="6">Nothing to practice here yet.</Heading>
        <Button asChild variant="soft"><Link to={`/learn/${d}`} style={{ textDecoration: 'none' }}>Back to {DOMAIN_LABEL[d]}</Link></Button>
      </Flex>
    )
  }

  const PATH_META: Record<Domain, { name: string; sub: string }> = {
    reading: { name: 'Reading Meadow', sub: 'Phonics, Letter Sounds & Tales' },
    writing: { name: 'Writing Grove', sub: 'Tracing & Letter Crafting' },
    numbers: { name: 'Numbers Stream', sub: 'Counting & Nature Patterns' },
  }
  return (
    <Flex direction="column" gap="2" style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <Box mb="2">
        <Text size="2" weight="bold" style={{ color: '#e26d38', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 12 }}>
          {PATH_META[d].sub}
        </Text>
        <Heading size="6" style={{ fontFamily: 'Literata, serif', color: '#1b381e', letterSpacing: '-0.01em' }}>
          {PATH_META[d].name}
        </Heading>
      </Box>
      <Flex justify="between" align="center" mb="2">
        <Flex gap="1" align="center">
          {Array.from({ length: SESSION_LENGTH }, (_, i) => (
            <span
              key={i}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < index ? '#1f5c45' : i === index ? '#c96a1e' : '#e4dcc8',
              }}
            />
          ))}
        </Flex>
        <Flex gap="2" align="center">
          <span className="star">★</span>
          <Text weight="bold">{stars}</Text>
        </Flex>
      </Flex>
      <Box className="paper" p="4">
        <ActivityView key={`${activity.skillId}-${index}`} activity={activity} onDone={handleDone} />
      </Box>
    </Flex>
  )
      }
