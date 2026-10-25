import { useEffect } from 'react'
import { Box, Flex, IconButton, Text } from '@radix-ui/themes'
import { speak } from '../engine/speech'
import { barnabyAvatarImage } from '../assets/storybook'

// Primer's voice: one calm instruction or piece of feedback at a time.
export function TutorBar({ text, say }: { text: string; say?: string }) {
  useEffect(() => {
    if (say !== undefined) speak(say)
    else speak(text)
  }, [text, say])
  return (
    <Flex align="center" gap="3" className="paper" p="3" mb="4">
      <img src={barnabyAvatarImage} alt="Barnaby the owl tutor"
        style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '2px solid #e4dcc8' }} />
      <Text size="3" className="learning-text" style={{ flex: 1 }}>{text}</Text>
      <IconButton variant="soft" aria-label="hear it again" onClick={() => speak(say ?? text)}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>volume_up</span></IconButton>
    </Flex>
  )
}
