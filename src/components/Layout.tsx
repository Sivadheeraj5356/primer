import { Box, Container, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { Link, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { isSpeechEnabled, setSpeechEnabled, speak } from '../engine/speech'
import { LearnerProvider, useLearner } from './LearnerContext'
import { logoImage } from '../assets/storybook'

function Header() {
  const { learner } = useLearner()
  const [sound, setSound] = useState(isSpeechEnabled())
  return (
    <Box className="no-print" style={{ borderBottom: '1px solid #e4dcc8', background: '#fffdf7' }}>
      <Container size="3" px={{ initial: '5', sm: '6' }}>
        <Flex align="center" justify="between" py="3">
          <Flex align="center" gap="3" asChild>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src={logoImage} alt="Primer" style={{ height: 30, width: 'auto', borderRadius: 6, display: 'block' }} />
              <Text size="4" weight="bold" style={{ letterSpacing: '-0.02em', fontFamily: 'Literata, serif', color: '#1b381e' }}>Primer</Text>
            </Link>
          </Flex>
          <Flex align="center" gap="4">
            <Box display={{ initial: 'none', sm: 'block' }}>
              <Link to="/app" style={{ textDecoration: 'none' }}>
                <Text size="2" weight="medium" style={{ color: '#1f5c45' }}>My Learning World</Text>
              </Link>
            </Box>
            <Box display={{ initial: 'none', sm: 'block' }}><Text size="2" color="gray">Learning as <Text weight="bold" style={{ color: '#1f5c45' }}>{learner.name}</Text></Text></Box>
            <Tooltip content={sound ? 'Mute Primer’s voice' : 'Unmute Primer’s voice'}>
              <IconButton variant="soft" onClick={() => { const on = !sound; setSound(on); setSpeechEnabled(on); if (on) speak('Hello!') }} aria-label="toggle voice">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{sound ? 'volume_up' : 'volume_off'}</span>
              </IconButton>
            </Tooltip>
            <Link to="/parents" style={{ textDecoration: 'none' }}>
              <Text size="2" weight="medium" style={{ color: '#1f5c45' }}>For parents</Text>
            </Link>
            <Link to="/toolkit" style={{ textDecoration: 'none' }}>
              <Text size="2" weight="medium" style={{ color: '#1f5c45' }}>Toolkit</Text>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

function Footer() {
  return (
    <Box className="no-print" mt="8" py="5" style={{ borderTop: '1px solid #e4dcc8' }}>
      <Container size="3" px={{ initial: '5', sm: '6' }}>
        <Flex justify="between" align="center" wrap="wrap" gap="2">
          <Text size="1" color="gray">
            Primer is an early prototype. The learning app stores progress only in this browser, with no accounts and no AI. The toolkit for adults uses AI.
          </Text>
          <Text size="1" color="gray">Inspired by Neal Stephenson’s <i>The Diamond Age</i>.</Text>
        </Flex>
      </Container>
    </Box>
  )
}

export function Layout() {
  return (
    <LearnerProvider>
      <Flex direction="column" style={{ minHeight: '100vh' }}>
        <Header />
        <Box style={{ flex: 1 }}>
          <Container size="3" px={{ initial: '5', sm: '6' }} py="5">
            <Outlet />
          </Container>
        </Box>
        <Footer />
      </Flex>
    </LearnerProvider>
  )
}
