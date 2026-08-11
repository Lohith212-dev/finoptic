# Phase 4 — Usability & insights

**Status:** Not started · **Depends on:** Phases 1–3 (name, clean design language, and experience layer should all be in place first)
**Navigator:** [`00-overview.md`](00-overview.md)

## Goal

Every screen should answer **"so what should I do"** before it answers **"what are the numbers."** Right now the mock-up is data-rich but insight-poor — it displays numbers well but doesn't consistently tell you what they mean or what to do about them.

## Why this is last

The deliberate call here: clean up the mock-up and its markup completely first (Phases 2 and 3), and only then add and refine the insight content on top of an already-clean system. Writing insight cards into today's ad-hoc markup and then having to restyle or restructure them once the visual rebuild happens would mean touching the same content twice; adding them once into a system already built to hold them (Phase 2 reserves the slot — see [`02-design-language.md`](02-design-language.md)) avoids that.

## Current state

The mock-up already has narrative **"What / Why / Do"** insight cards on some screens (the Overview screen and a few others) — three short lines per card that tie a number to a cause and a recommended action. The pattern exists; it just isn't consistent, prominent, or present on all 17 screens.

## Action items

1. **Inventory** which of the 17 screens currently have an insight/narrative element and which are number-only (tables and charts with no "so what" attached).
2. **Extend the What/Why/Do pattern** (or a refined version of it) to every screen that's missing one, using the component slot Phase 2 reserved for it.
3. **Decide the "so what" hierarchy per screen** — what's the one decision or action this specific screen should provoke? (E.g., the vendor/renewals screen should provoke a negotiating decision; the anomalies screen should provoke an investigation or a shrug.)
4. **Make insight text computed, not hardcoded.** If the mock-up moves to a swappable, JSON-driven dataset (see [`00-overview.md`](00-overview.md) — Data approach), the insight sentences need to be generated from whatever numbers are actually loaded. A hardcoded insight sentence next to numbers that changed when you swapped in a different demo scenario will read as fake the moment someone notices the mismatch.

## Not in scope here

The visual system itself, or the shape of the insight component — both already decided by Phase 2. This phase writes the content and the per-screen decision logic, not the styling.
