# Phase 2 — Design language

**Status:** Not started · **Depends on:** Phase 1 (name/positioning) · **Blocks:** Phase 3 (experience) and Phase 4 (usability content gets built into whatever this phase produces)
**Navigator:** [`00-overview.md`](00-overview.md)

## Goal

Clean up the mock-up's markup and establish a real visual identity for Finoptic — palette, type, iconography, motion basics, and a proper component system — built around the chosen name. Usability content (Phase 4) gets added into this system afterward, so it needs to be built to hold content that doesn't exist yet.

## The one thing this phase must not skip

Even though the actual insight/callout copy is written in Phase 4, this phase needs to design the *shape* of that component now — spacing, hierarchy, how it sits next to a chart or table — not just restyle the numbers-only screens as they exist today. If this phase only cleans up what's currently on screen and doesn't reserve a slot for insight content, Phase 3's interaction polish will get applied to a layout that Phase 4 then reshapes, and some of that polish gets redone.

## Working spec and reference material

The full write-up — what to reuse from the sibling `llm-tracker` ("trakit") project's design language, what needs adapting, and where it would actively work against Finoptic's tasks — lives in **[`design-language/finoptic-design-language.md`](design-language/finoptic-design-language.md)**, alongside the copied reference screenshots and commentary in `design-language/reference/`. That folder is the living document for this phase; update it as decisions get made rather than duplicating content back into this file.

## Action items — all closed

**This phase is done.** The Brand Guide is locked at **v3.4** and applied across all 17 screens, after five review rounds on 29 July 2026 — each one a review of the previous round's own output. Every item below is settled; the guide is where the detail lives, and it is what to update if any of these decisions changes.

1. ~~Decide Finoptic's own accent color~~ — **`#FF5600`**, a swappable token. The supporting palette is closed too: neutrals, the three-token status ramp (mark / ink / wash) and the `--c1…--c8` chart spectrum whose first slot *is* the accent.
2. ~~Choose a type pairing~~ — Mona Sans for words, Space Grotesk reserved for hero and metric numbers. No monospace anywhere.
3. ~~Boxy, non-pill chip styling for every status/severity field~~ — done, and the optimisation pipeline chips read as a progression with **Approved green**.
4. ~~Decide which chart types get gradient/texture treatment~~ — gradients on area fills and bars; diagonal hatch on secondary stacked series, icon tiles, the hero card and bar meters. Dense tables stay flat, and v2.0's "elevation, not outlines" means hairlines survive only as separators.
5. ~~Design the reconciliation ledger strip~~ — two labelled groups: a real equation with sized operators, and a divided four-stat group. Explicitly not a KPI-hero pattern.
6. ~~Adapt the sidebar nav for 17 items across 4 groups plus the persona overlay~~ — tree rail with per-group trunks, the persona demoted to a `View:` line item inside Overview, and a collapsed rail showing the four group icons rather than all seventeen.
7. ~~Reserve and shape the insight/callout component slot for Phase 4~~ — became the **briefing band**, which sits above the first card rather than at the foot of the screen, and whose copy comes from the loaded dataset.

## Not in scope here

Motion and interaction polish (Phase 3, not started). Phase 4's per-screen insight depth — though the briefing band and per-dataset copy have already delivered its headline claim.
