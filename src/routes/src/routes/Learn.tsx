import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { Link, useParams } from 'react-router-dom'
import { useLearner } from '../components/LearnerContext'
import { TutorBar } from '../components/TutorBar'
import { ProgressRing } from '../components/ProgressRing'
import { getSkillState, isMastered, isUnlocked, MASTERED_AT, pickNext } from '../engine/mastery'
import { DOMAIN_ICON, DOMAIN_LABEL, skillsOf, type Domain } from '../engine/skills'

export function Learn() {
  const { domain } = useParams<{ domain: string }>()
  const d = (domain ?? 'reading') as Domain
  const { learner } = useLearner()
  const skills = skillsOf(d)
  const next = pickNext(learner, d)

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="3">
        <Text style={{ fontSize: 34 }}>{DOMAIN_ICON[d]}</Text>
        <Box mb="1">
          <Text size="2" weight="bold" style={{ color: '#e26d38', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 12 }}>
            {d === 'reading' ? 'Station I: Word Meadow' : d === 'writing' ? 'Station II: Quill Grove' : 'Station III: Counting Brook'}
          </Text>
          <Heading size="7" style={{ fontFamily: 'Literata, serif', color: '#1b381e' }}>
            {d === 'reading' ? 'Reading Meadow' : d === 'writing' ? 'Writing Grove' : 'Numbers Stream'}
          </Heading>
        </Box>
      </Flex>

      <TutorBar
        text={next ? next.reason : 'You have finished everything here for now. Amazing!'}
        say={next ? next.reason : undefined}
      />

      <Flex gap="3" wrap="wrap">
        <Button size="4" asChild>
          <Link to={`/play/${d}`} style={{ textDecoration: 'none' }}>Start today's practice</Link>
        </Button>
        <Button size="4" variant="soft" asChild>
          <Link to="/" style={{ textDecoration: 'none' }}>Back home</Link>
        </Button>
      </Flex>

      <Card mt="2">
        <Flex direction="column" gap="1">
          <Heading size="4" mb="2">Skill path</Heading>
          {skills.map((s, i) => {
            const st = getSkillState(learner, s.id)
            const unlocked = isUnlocked(learner, s)
            const mastered = isMastered(learner, s.id)
            return (
              <Box key={s.id}>
                {i > 0 && <div className="skill-connector" style={{ marginLeft: 27 }} />}
                <Flex align="center" gap="4" py="2">
                  <ProgressRing value={st.mastery} label={`${s.title} mastery`} />
                  <Box style={{ flex: 1 }}>
                    <Flex align="center" gap="2">
                      <Text weight="bold" size="3">{s.title}</Text>
                      {mastered && <Text className="star">★</Text>}
                      {!unlocked && <Text size="1" color="gray">🔒 unlocks as earlier skills grow</Text>}
                    </Flex>
                    <Text size="2" color="gray">{s.blurb}</Text>
                    {unlocked && st.mastery >= MASTERED_AT && (
                      <Text size="1" style={{ color: '#1f5c45' }}>Mastered - Primer will bring it back for review.</Text>
                    )}
                  </Box>
                  {unlocked && (
                    <Button variant="soft" asChild>
                      <Link to={`/play/${d}?skill=${s.id}`} style={{ textDecoration: 'none' }}>Practice</Link>
                    </Button>
                  )}
                </Flex>
              </Box>
            )
          })}
        </Flex>
      </Card>
    </Flex>
  )
            }
