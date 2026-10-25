import { Box, Button, Card, Flex, Grid, Heading, Separator, Table, Text } from '@radix-ui/themes'
import { useLearner } from '../components/LearnerContext'
import { ProgressRing } from '../components/ProgressRing'
import { domainProgress, getSkillState, isUnlocked } from '../engine/mastery'
import { DOMAIN_LABEL, SKILLS, type Domain } from '../engine/skills'
import { resetLearner } from '../engine/storage'

const DOMAINS: Domain[] = ['reading', 'writing', 'numbers']

export function Parents() {
  const { learner, switchLearner } = useLearner()
  const sessions = [...learner.sessions].reverse().slice(0, 10)

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Box mb="1">
          <Text size="2" weight="bold" style={{ color: '#e26d38', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 12 }}>Parent &amp; Teacher Portal</Text>
          <Heading size="7" style={{ fontFamily: 'Literata, serif', color: '#1b381e' }}>For parents</Heading>
        </Box>
        <Text size="3" color="gray" as="p" mt="1" style={{ maxWidth: 620 }}>
          What Primer is doing with {learner.name}, and why. The engine is deterministic:
          every choice below comes from recorded answers on this device, never from a black box.
        </Text>
      </Box>

      <Grid columns={{ initial: '1', sm: '3' }} gap="4">
        {DOMAINS.map((d) => (
          <Card key={d}>
            <Flex direction="column" gap="2" align="center" py="1">
              <ProgressRing value={domainProgress(learner, d)} size={72} />
              <Text weight="bold">{DOMAIN_LABEL[d]}</Text>
              <Text size="1" color="gray">overall progress</Text>
            </Flex>
          </Card>
        ))}
      </Grid>

      <Card>
        <Heading size="4" mb="3">Skill by skill</Heading>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Domain</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Mastery</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Correct</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {SKILLS.map((s) => {
              const st = getSkillState(learner, s.id)
              const unlocked = isUnlocked(learner, s)
              return (
                <Table.Row key={s.id}>
                  <Table.Cell>{s.title}</Table.Cell>
                  <Table.Cell>{DOMAIN_LABEL[s.domain]}</Table.Cell>
                  <Table.Cell>{!unlocked ? 'Locked' : st.mastery >= 0.85 ? 'Mastered' : st.attempts > 0 ? 'Practicing' : 'Ready'}</Table.Cell>
                  <Table.Cell style={{ minWidth: 120 }}>
                    <div className="mastery-bar"><div style={{ width: `${Math.round(st.mastery * 100)}%` }} /></div>
                  </Table.Cell>
                  <Table.Cell>{st.attempts > 0 ? `${st.correct}/${st.attempts}` : '-'}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Card>

      <Card>
        <Heading size="4" mb="3">Recent sessions</Heading>
        {sessions.length === 0 ? (
          <Text size="2" color="gray">No practice sessions yet.</Text>
        ) : (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Area</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Activities</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Correct</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sessions.map((s, i) => (
                <Table.Row key={i}>
                  <Table.Cell>{new Date(s.at).toLocaleString()}</Table.Cell>
                  <Table.Cell>{DOMAIN_LABEL[s.domain]}</Table.Cell>
                  <Table.Cell>{s.activities}</Table.Cell>
                  <Table.Cell>{s.correct}/{s.activities}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Card>

      <Card>
        <Flex direction="column" gap="2">
          <Heading size="4">Privacy</Heading>
          <Text size="2" color="gray" style={{ maxWidth: 640 }}>
            Primer keeps progress in this browser's local storage. There is no account, no Primer server,
            no analytics and no advertising. Voice uses the browser's built-in speech engine - no audio is
            recorded by Primer, though your browser or OS may route speech synthesis through its own service.
            Fonts load from Google Fonts' CDN. Do not enter a real child's full name or personal details;
            a first name or nickname is enough.
          </Text>
          <Separator size="4" />
          <Flex gap="3" align="center">
            <Button
              variant="soft"
              color="red"
              onClick={() => {
                if (window.confirm(`Delete all of ${learner.name}'s progress on this device?`)) {
                  resetLearner(learner.name)
                  switchLearner(learner.name)
                }
              }}
            >
              Delete {learner.name}'s local data
            </Button>
            <Text size="1" color="gray">Removes every stored trace of this learner from this browser.</Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}
