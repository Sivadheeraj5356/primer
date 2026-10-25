# Primer

```
   \rlrrlrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrlrrrr\   
 trrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrx 
rrsrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrsrr
rsrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrsr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrlxxxxxxxxxxxxxxxxxxxxlrrrrrrrrrrrrr
rrrrrrrrrrrrlo3yyyyyyyyyyyyyyyyyy3olrrrrrrrrrrrr
rrrrrrrrrrrrxmQQQQQQQQQQQQQQQQQQQQmxrrrrrrrrrrrr
rrrrrrrrrrrrcz6pppppppppppppppppp6zcrrrrrrrrrrrr
rrrrrrrrrrrrl}[[[[[[[[[[[[[[[[[[[[}lrrrrrrrrrrrr
rrrrrrrrrrrrxFMBBBBBBBBBBBBBBBBBBM5xrrrrrrrrrrrr
rrrrrrrrrrrrl}[[[[[[[[[[[[[[1tttae?clrrrrrrrrrrr
rrrrrrrrrrrrcjq666666666666qz}oLnnuz!rrrrrrrrrrr
rrrrrrrrrrrrxwAkkkkkkkkkkkkAqf3333333Lsrrrrrrrrr
rrrrrrrrrrrrrllllllllllllllIyyyyyyyyy3?lrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrlr7y333333y7rrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrl}ajuuja}lrrrrrrrrrr
rsrrrrrrrrrrrrrrrrrrrrrrrrrrrllllllllrrrrrrrrrsr
rrsrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrsrr
 xrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrx 
   \rrrrlrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\   
```

*Logo art rendered with [ASCII Magic](https://www.ascii-magic.com/)'s free engine - see `docs/design-tools.md`.*

An adaptive tutor for young children: reading, writing, and arithmetic at the
quality of a devoted private tutor - and the first stone on a much longer road.

In Neal Stephenson's *The Diamond Age*, a girl is given an interactive book
that adapts to her completely: it teaches her to read, then to reason, and
grows as she grows. We're a long way from that book. But the first step - a
patient, adaptive tutor for early reading, writing and arithmetic - is
buildable today. This repository is that first step, running as a real,
working prototype.

**Live demo:** (link will appear here when the first preview is approved)

## Routes

- `/` - public landing page (storybook introduction, links into the app)
- `/app` - the learning home ("My Learning World") with the three pathways
- `/learn/:domain` - skill trail map for reading, writing or numbers
- `/play/:domain` - an adaptive practice session
- `/parents` - parent dashboard

The app uses real path routes (no hash routing). `npm run dev` and
`npm run preview` serve the SPA fallback automatically. For static hosts
without rewrite rules (such as GitHub Pages), `public/404.html` plus the
small restore script in `index.html` keep deep links like `/app` working.

## What works today

- **Reading** - letter sounds, CVC words, word families, sight words,
  decodable sentences, and three original decodable stories with
  comprehension questions.
- **Writing** - warm-up strokes, then uppercase, lowercase and first words,
  traced on a canvas with real coverage feedback (not "any scribble passes").
- **Numbers** - counting to 20, comparing groups, addition and subtraction
  with visual blocks, and number bonds to 10.
- **A deterministic mastery engine** - every skill has a mastery score
  (an exponential moving average of recent answers), a difficulty ladder
  that climbs on first-try success and steps down on struggle, spaced
  review of mastered skills, and prerequisite-based unlocking. Every
  decision the engine makes can be explained in one sentence. No black box.
- **Primer the tutor** - a calm owl who speaks instructions and encouragement
  through the browser's built-in speech engine, and who offers a hint
  instead of an answer when a child is stuck.
- **A parent dashboard** - per-skill mastery, unlock status, session
  history, and one-click deletion of everything stored on the device.

## Honest boundaries

This is a prototype, and it says so inside the app:

- The adaptivity is a transparent, rule-based mastery engine - not a large
  language model pretending to be one. LLM-generated stories and dialogue
  are on the roadmap, behind a server-side proxy, never with keys in this
  repository or in the browser.
- Everything runs locally in the browser (localStorage). There are no
  accounts, no servers, no analytics, no uploads. Voice is synthesized on
  the device by the Web Speech API; no audio is recorded.
- The demo learner *Nell* is fictional. Do not enter a real child's full
  name or personal details. A children's product at production scale needs
  serious privacy review (COPPA and friends); this prototype deliberately
  sidesteps the problem by collecting nothing.
- No educational-efficacy claims are made. The phonics progression and
  arithmetic ladders follow common early-learning sequences, but "tutor
  quality" is the ambition, not a measured result.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # static build in dist/ - deployable anywhere static
npm run typecheck  # strict TypeScript
npx tsx scripts/engine-test.ts   # engine smoke tests
```

Any static host works (the app uses hash routing, so no rewrites needed).

## How adaptivity works (the short version)

1. Every skill keeps a mastery score from 0 to 1. Each answer nudges it:
   correct answers pull up, wrong answers pull down, harder rungs and
   first-try answers count more, hints count less.
2. Each skill has a difficulty ladder. Two clean successes climb a rung;
   struggling on the current rung steps down one.
3. A skill unlocks when its prerequisites reach 55% mastery. At 85% it is
   mastered - and the engine brings it back for spaced review after a few
   days so it stays strong.
4. Each session, Primer picks either a mastered skill due for review or the
   weakest unlocked skill, and says why in plain language.

See `src/engine/mastery.ts` - it fits on one screen, on purpose.

## Design

Flat colors, no gradients: warm cream paper, deep forest green ink, one
warm orange accent. Sora for the interface, Andika (a typeface designed for
beginning readers) for everything a child reads. Component library: Radix
Themes. `docs/design-tools.md` records which AI design tools were evaluated
for this project, what their free tiers actually allow, and which were used.

## Roadmap

- Server-side LLM story generation tuned to the learner's world (key held
  server-side only; the static app stays keyless)
- Real recorded phonics audio instead of synthesized approximations
- Stroke-order guidance for handwriting, not just shape coverage
- Multiple device sync via an opt-in parent account
- The long road: a tutor that knows a child for years

## License

MIT. The name and spirit nod to *The Diamond Age* by Neal Stephenson; all
code, stories and content in this repository are original work.
