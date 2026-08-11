# Design-language folder — what's here

**Phase:** [`../02-design-language.md`](../02-design-language.md) · **Navigator:** [`../00-overview.md`](../00-overview.md)

## Two kinds of files in here

- **[`finoptic-design-language.md`](finoptic-design-language.md) is Finoptic's own spec — the Brand Guide, now locked at **v3.4** and applied across all 17 screens. It began as an assessment of what to reuse from trakit's design language and what not to; it has long since become the standalone source of truth. Update it here when a decision changes, and read its six "What changed, and why" tables before touching visuals, newest first — they record rules that were deliberately reversed and must not be reinstated. Note that v3.3 reverses part of v3.2, which reversed parts of v3.1, which reversed parts of v3.0: the guide is the only place that record exists, so read the tables in order rather than assuming the newest one stands alone.
- **`reference/` is copied material from a sibling project.** Mostly read-only precedent — **with one exception**: `reference/inspiration/reference-commentary.md` and its screenshots are Lohith's own reading of the dashboards he chose, and v3.0 was built against the 11-point "extracted DNA" list at the end of it — which v3.1 then trimmed back where applying it everywhere produced clutter. That file is authoritative for Finoptic. The rest of `reference/` is not.

## What's in `reference/`

Copied from `llm-tracker/LLM-TRACKER/documentation/design-language/` — the design system for a different Crozaint product, an LLM usage/cost tracker internally branded **"trakit."** That project has a real engineering stack (React, shadcn/ui, Recharts) and a locked design spec built from reading ~13 real dashboard products.

| File | What it is |
|---|---|
| `reference/DESIGN.md` | Trakit's locked design-language spec (typography, color, elevation, spacing, iconography, components, layout, branding) |
| `reference/design-direction.md` | The earlier research phase that led to `DESIGN.md` |
| `reference/element-references.md` | Per-UI-element links to live examples (shadcn/ui, Tremor, Mobbin, etc.) with notes on what to steal |
| `reference/inspiration/reference-commentary.md` | **Authoritative for Finoptic, not just precedent.** Lohith's own notes on ~13 reference dashboards (Aeros, Vaulto, Rabbit, AI-fashion, Airzone, Cryptek, Financia, Flowmail, Hynex, iCare, Loud, Orbix, Rexora, Salezy) — what he liked in each and which design decision it fed, ending in the 11-point "extracted DNA" that Brand Guide v3.0 implements and v3.1 tempers. **Two deliberate divergences, both the same shape — a reference move Lohith rejected once he saw it applied:** DNA point 6 asks for dimmed decimals, and DNA point 2's hatched *icon fills* were built in v3.0 and disliked (hatch now lives on chart data only) |
| `reference/inspiration/*` (images) | The actual screenshots the commentary above refers to |
| `reference/brand/` | Crozaint's parent-company logo assets (light/dark), relevant to the Phase 1 question of whether Finoptic visually signals "part of the Crozaint family" |

**Why it's here at all:** these files are the direct answer to "could reusing trakit's design language interfere with Finoptic's tasks" — the reasoning in `finoptic-design-language.md` cites specific sections of this material. Keeping the source alongside the reasoning means the citations stay checkable as both projects evolve.

**What's deliberately not copied:** trakit's own logo/mark assets (`brand/trakit-*.svg` in the source project — that's trakit's identity, not a template for Finoptic's), its `kitchen-sink.html` living implementation, and the deeper `research/01–05` notes that `design-direction.md` already distills. If you need any of those, they're at `llm-tracker/LLM-TRACKER/documentation/design-language/` directly.

**This reference material won't stay in sync with the source project.** If `llm-tracker`'s design language changes later, these copies won't update automatically — re-copy if a future decision needs the current version.
