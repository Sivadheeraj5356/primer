export interface Q {
  type: 'mcq' | 'fill' | 'short' | 'tf' | 'match'
  q: string
  options?: string[]
  pairs?: { left: string; right: string }[]
  answer?: string
  explanation?: string
}
export interface WS {
  title: string
  instructions?: string
  questions: Q[]
  funFact?: string
  brainTeaser?: { q: string; a: string }
}
