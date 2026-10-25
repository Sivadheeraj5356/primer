// Speech via the browser's built-in Web Speech API. Audio is generated on the
// device by the OS/browser speech engine; no recordings or audio ever leave
// the device. If the browser has no speech engine, Primer falls back to text.

let enabled = true

export function setSpeechEnabled(on: boolean): void {
  enabled = on
  if (!on && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function isSpeechEnabled(): boolean {
  return enabled && 'speechSynthesis' in window
}

export function speak(text: string, opts?: { rate?: number; pitch?: number }): void {
  if (!enabled || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = opts?.rate ?? 0.9
  u.pitch = opts?.pitch ?? 1.1
  window.speechSynthesis.speak(u)
}

// Say a letter's phonics sound, e.g. "b" -> "buh". Approximation only:
// real phonics audio is future work (see README roadmap).
const PHONEME_HINTS: Record<string, string> = {
  b: 'buh', c: 'kuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh', j: 'juh',
  k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', p: 'puh', r: 'rrr', s: 'sss',
  t: 'tuh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
  a: 'a (as in apple)', e: 'e (as in egg)', i: 'i (as in igloo)',
  o: 'o (as in octopus)', u: 'u (as in umbrella)',
}

export function speakLetterSound(letter: string): void {
  const hint = PHONEME_HINTS[letter.toLowerCase()]
  speak(hint ?? letter)
}
