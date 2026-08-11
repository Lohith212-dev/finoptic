# Phase 3 — Experience & engagement

**Status:** Not started · **Depends on:** Phase 2 (design language) should be stable first · **Note:** Phase 4 (usability) runs after this and may add insight content to screens this phase already touched — see the caveat below
**Navigator:** [`00-overview.md`](00-overview.md)

## Goal

Make five minutes of clicking around Finoptic feel like using a cared-for product, not flipping through static screens. Right now the mock-up is neither engaging nor enjoyable — this phase is the fix for that specifically.

## Why this is third, and one risk that comes with it

Interaction polish is cheapest to add once the visual system (Phase 2) is settled — animating a transition on a layout that's about to be restyled is wasted work. Doing this before Phase 4 (usability), though, carries its own risk the other direction: if Phase 2 reserved a proper slot for insight/callout content (as it's supposed to), this phase can safely animate the stable parts — chrome, nav, drill-down, persona switch — without redoing that work once Phase 4 fills the insight slot in. If Phase 2 skipped that step, expect some rework here once Phase 4 lands.

**Practical guidance:** favor motion on structural, already-stable elements (breadcrumb drill-down, persona-switch transition, nav interactions) over motion tied to the exact content inside a screen's main panel, since that panel is what Phase 4 still touches.

## Action items

1. **Real transitions on drill-down.** The mock-up's breadcrumb "drill" path (technology → cloud → provider → product → environment → service → instance) currently jump-cuts between levels — a real transition would make the drill-down feel like *navigating into* something rather than swapping a static page.
2. **A persona-switch transition.** Changing "Viewing as…" currently swaps the home screen instantly; a brief, deliberate transition would sell the idea that the mock-up is reorienting itself around a different role, not just reloading.
3. **Meaningful empty/loading states.** Worth explicitly distinguishing "no data in this range" from a real `$0`, and "not yet synced" from "confirmed zero spend" — the same distinction the LLM-tracker design research flagged for itself as a named gap. Finoptic has a direct equivalent in its "unallocated spend" and per-screen filtered views.
4. **A guided walkthrough / "story mode" for demo contexts.** A pre-set sequence that clicks through a scripted path would let you run the Friday-style demo without hunting for the right screen live — this can be built now and simply point at richer content once Phase 4 lands.
5. **Respect `prefers-reduced-motion`** throughout — every transition above needs a static fallback.

## Not in scope here

Deciding what insight content says (Phase 4) or the visual system itself (Phase 2, already decided by the time this phase starts).
