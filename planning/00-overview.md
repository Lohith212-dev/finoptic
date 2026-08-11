# Finoptic mock-up — phase plan (navigator)

**Status:** Phases 1 and 2 done · Phase 3 is the active one · Updated 29 July 2026
**Related:** [`../finoptic-prd.md`](../finoptic-prd.md) — the product concept this mock-up demonstrates · [`../CLAUDE.md`](../CLAUDE.md) — standing project context · [`../status.md`](../status.md) — current status

This folder breaks "evolve the mock-up into something worth showing" into four independent phases, one document each. Each phase document is self-contained — you can hand any one of them to someone and they don't need to read the others first, though the order below reflects real dependencies.

## The four phases, in agreed order

| # | Phase | Goal | Doc |
|---|---|---|---|
| 1 | Branding & naming | Decide what this product is called and stands for | [`01-branding-and-naming.md`](01-branding-and-naming.md) |
| 2 | Design language | A real visual identity + clean markup, built around the chosen name | [`02-design-language.md`](02-design-language.md) |
| 3 | Experience & engagement | Interaction polish on top of the clean visual system | [`03-experience-and-engagement.md`](03-experience-and-engagement.md) |
| 4 | Usability & insights | Once the mock-up is clean, layer in "so what should I do" insights | [`04-usability-and-insights.md`](04-usability-and-insights.md) |

*(This supersedes the earlier draft order, which put usability second. See "Why this order" below.)*

## Why this order

- **Branding first, even though it's barely "work."** It's a decision, not a build phase — cheap to make now, expensive later, since the visual system in phase 2 gets built around whatever name lands here.
- **Design language second, ahead of usability.** The call here is to clean up the existing markup and establish the real visual system completely before adding new content on top of it — rather than writing insight cards into today's ad-hoc markup and then having to restyle them anyway once the visual rebuild happens. For a mock-up that's real HTML/CSS (not an abstract design doc), that ordering avoids styling the same content twice.
  - **One coordination point this creates:** phase 2 needs to design the *shape* of an insight/callout component (spacing, hierarchy, how it sits next to a chart or table) even though the actual insight copy isn't written until phase 4. Otherwise phase 3's interaction polish gets applied to a layout that phase 4 still reshapes. See the note in [`02-design-language.md`](02-design-language.md).
- **Experience third.** Motion and interaction polish sit on top of a clean, stable visual system — applying it before the system is clean means redoing it.
- **Usability last.** Once the mock-up's markup and visual system are genuinely clean, add the "so what should I do" content into a system built to hold it, rather than into whatever the current ad-hoc markup happens to look like.

## Before Friday (31 July) — where this actually landed

This section originally listed a handful of low-effort wins on the assumption that no phase would finish in two days. It went further than that: **phases 1 and 2 are both done**, and the 29 July feedback round also delivered the cross-cutting data work and a good part of phase 4. What's left before the call:

- **Branding:** the name is chosen (Finoptic) and applied everywhere, but the trademark/domain check is still outstanding. If it isn't back by Friday, decide deliberately whether to present as "Finoptic" anyway or flag on the call that the name is being cleared — don't let an unresolved check read as indecision.
- **Design language:** done, Brand Guide locked at **v3.4** and applied across all 17 screens. Nothing required here.
- **Experience (phase 3):** not started, and now the highest-value remaining work. One deliberate moment — a transition on the `View:` switch, or motion on the briefing band — goes further than scattered polish.
- **Usability (phase 4):** the "What / Why / Do" briefing band is on every screen and its copy is per-dataset, so the headline claim is already visible. What's left is per-screen depth, not the missing pattern.

See [`../status.md`](../status.md) for the current snapshot and [`success-criteria.md`](success-criteria.md) for what the 29 July round was measured against.

## Data approach (cross-cutting)

**Done, 29 July 2026.** The dataset is no longer hardcoded. Four scenarios ship in `finoptic/data/` and are switched from a selector in the top bar; a real `.json` file also loads through an `<input type="file">` + `FileReader` (not `fetch`, which browsers block for local files opened by double-click). Each screen's "What / Why / Do" copy comes from the loaded dataset's own `insights` block, so it changes with the scenario rather than being written into the code. The shape and its reconciliation invariants are in [`../finoptic/data/SCHEMA.md`](../finoptic/data/SCHEMA.md).

## Design language reference material

[`design-language/`](design-language/) holds the working spec and reference material for phase 2 — including copied reference screenshots and commentary from the sibling `llm-tracker` ("trakit") project, kept as inspiration/precedent, not as a spec to import wholesale. See [`design-language/README.md`](design-language/README.md).

## Beyond these four phases

Once the mock-up itself is where you want it, the remaining step is turning it into a real, working product — real sign-in, real data connections, alert delivery, and filters and export running against live data rather than a loaded dataset. That's a different kind of effort (engineering integrations, not mock-up refinement) and isn't tracked as a phase here; see [`../finoptic-prd.md`](../finoptic-prd.md) sections **06 (Built vs. still needed)** and **07 (Open questions)**.
