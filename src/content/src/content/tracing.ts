// Warm-up strokes for the writing domain's first skill. Simple shapes first,
// letters later (letters are rendered from the font at practice time, so all
// 52 letterforms work without hand-authored path data).

export interface StrokeShape {
  id: string
  label: string
  // A path in a 100x100 box, rendered as the guide the child traces over.
  path: string
  hint: string
}

export const WARMUP_STROKES: StrokeShape[] = [
  { id: 'line-down', label: 'Straight down', path: 'M 50 15 L 50 85', hint: 'Start at the dot, pull straight down.' },
  { id: 'line-across', label: 'Across', path: 'M 15 50 L 85 50', hint: 'Start at the dot, go across.' },
  { id: 'hill', label: 'A hill', path: 'M 15 80 Q 50 10 85 80', hint: 'Up the hill and down again.' },
  { id: 'valley', label: 'A valley', path: 'M 15 20 Q 50 90 85 20', hint: 'Slide down and climb back up.' },
  { id: 'circle', label: 'A circle', path: 'M 50 15 A 35 35 0 1 1 49.9 15', hint: 'Around and back to the start.' },
  { id: 'wave', label: 'A wave', path: 'M 10 50 Q 30 20 50 50 Q 70 80 90 50', hint: 'Up and down, like the sea.' },
  { id: 'zigzag', label: 'A zigzag', path: 'M 10 25 L 35 75 L 60 25 L 85 75', hint: 'Sharp corners, like lightning.' },
  { id: 'loop', label: 'A loop', path: 'M 50 85 L 50 15 A 18 18 0 1 1 50 51', hint: 'Up, then loop around.' },
]
