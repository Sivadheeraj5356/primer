# Design tools evaluation (verified 2026-10-25)

The project brief listed nine design tools to use. We verified each one's
actual free access against its live site/pricing page, used the ones that are
genuinely usable at $0 for this project's needs, and recorded the limits of
the rest instead of pretending all nine were used.

| Tool | Free access (verified) | Used? |
| --- | --- | --- |
| ASCII Magic (ascii-magic.com) | Core editor + core styles free forever, **no account, no watermark, no export limit** (their pricing page) | **Yes** - ASCII logo art in the README generated with ASCII Magic's own free library |
| EasyUI (easyui.site) | Free browsable/copyable React component showcase | Reviewed for component ideas; our stack already standardizes on Radix Themes, so no components were pulled in (mixing two component systems would hurt coherence) |
| Relume (relume.io) | "Free forever - no card needed" (pricing page) | Account-gated; evaluated, not used for generation |
| Magic Patterns (magicpatterns.com) | Free tier with monthly AI credits (pricing page) | Account-gated; evaluated, not used |
| Banani (banani.co) | $0/mo plan, 12 monthly credits (pricing page) | Account-gated; evaluated, not used |
| Visily (visily.ai) | $0 Starter, 300 AI credits/month (pricing page) | Account-gated; evaluated, not used |
| Stitch (stitch.withgoogle.com) | Free via Google Labs, requires Google sign-in (Google Labs page) | Account-gated; evaluated, not used |
| UX Pilot (uxpilot.ai) | Free tier exists per its plans page; static fetch could not confirm exact limits | Evaluated, not used |
| Recraft (recraft.ai) | Free plan exists, **but free-plan images are owned by Recraft and not licensed for commercial/repo use** (pricing page FAQ) | Excluded: license incompatible with shipping assets in a public repo |

## What actually shaped the design

The interface was designed directly around the product: flat colors (cream
paper, deep forest green, one warm orange accent), Radix Themes components,
Sora for UI type, and Andika - a typeface designed for beginning readers -
for everything a child reads. AI-generated mockups would have been thrown
away anyway: for a product this young, the component system and the reading
typeface are the design decisions that matter.

We will happily revisit Banani/Magic Patterns/Stitch mockups with a free
account if we want fresh art direction for v2 screens.

## Asset storage note (Oct 25, 2026)

All artwork ships as base64 TypeScript modules under `src/assets/` so a text-only
publishing route reconstructs the full experience. The original JPG exports from
Stitch are retained in the private source backups shared with the project owner
(not in the public repo); the modules above are the canonical in-repo form.
