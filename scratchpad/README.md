# scratchpad — build and test scripts

Not part of the mock-up. Nothing in `finoptic/` loads anything from here; these are
the scripts that generate or verify it. Safe to delete, at the cost of having to
rewrite them.

| File | What it does |
|---|---|
| `test-finn.js` | The assistant's regression harness: 24 questions × 2 modes × 6 datasets, plus history, the pinned resolution, origin context, free-text matching, the honest miss, Escape ordering, streaming with motion on, and the 430px sheet. Also asserts no answer anywhere claims to be a mock-up. |
| `test-screens.js` | The broad sweep: 21 screens × 6 datasets. No page or console error, no `NaN`/`undefined`/`Infinity`/`[object Object]` in any rendered DOM, no message claiming the product is a mock-up, no horizontal overflow at 1280, a heading on every screen, and the filters still narrowing after all of it. **Run this one first** — it is the cheapest thing that catches a broken render. |
| `test-order.js` | The descending-order audit (Brand Guide 13.7). Every table's largest-total currency column, every ranked list's `.v` figure, and every donut against its own legend, on every screen in every dataset. Knows about the three `order:'keep'` tables, about `tail:true` remainders, and that a severity-ranked list descends *within* each band. |
| `test-headings.js` | The Title Case audit (13.1). Reads every heading surface out of the rendered DOM — which is the only place that catches a heading built from a template — and fails on any word starting lowercase. Deliberately excludes sub-lines, hint chips, notes and band prose: those are sentences. "Viewing as" is exempt because the user specified that label verbatim. |
| `test-insights.js` | The insight band (13.4–13.5): that it lands below the KPI tiles and above the charts on every screen, that its derived first cell carries no bad text, and which screens fall back to the authored `what` because nothing scored. Prints every band's text for the baseline dataset, which is the fastest way to see whether a new probe reads well. |
| `test-panel.js` | The tabbed summary region (14.3–14.5): one panel per board screen, headline and tabs on the same row, `Key Insights` default, the band and the leading KPI tiles both inside it, the `View KPIs ›` footnote present, and the tab surviving a filter change. Also asserts the two screens that correctly get NO panel. |
| `test-ledger.js` | The reconciliation counterfoil (14.6). Per-screen stats on 16 screens × 6 datasets, and — the check that matters — every stat compared **value for value against the KPI tile of the same name**. The strip and the tile are one expression; if they diverge, one was recomputed. Expect `225/225`. |
| `test-seam.js` | The collapsed ticket's seam (14.7): present, spanning the strip's full height, with the equation and the counterfoil at opposite ends of it. |
| `test-widths.js` | The strip at 1600 / 1440 / 1400 / 1360 / 1280 / 1240 / 1200, collapsed and expanded, on all 16 screens: no overlap between the equation and the counterfoil, no wrapped stat row, no page overflow. This is the harness that catches the failure mode the seam introduced — the equation's tail running over the first stat once the seam took the free width. |
| `test-finn-motion.js` | **Finn's mark, its eight motion states, its progress line, its answer actions and its dictation meter** — the acceptance checklist from `planning/design-language/finn/finn-implementation-guide.md` §8, plus round 13. It writes its own `finn-mic-tone.wav` on each run and hands it to Chrome as the fake capture device, because `--use-fake-device-for-media-stream` alone gives you a **silent** microphone and silence is indistinguishable from a broken analyser. Generated rather than committed: a binary fixture in a project with no build step is one nobody can regenerate. Also asserts the byline reads `Finn is thinking` with "Finn" appearing at most once, that `.finn-dots` never returns, and that all four message actions really act. The strongest check in it is the first: the app's `<g class="creature">` is diffed **byte-for-byte** against the prototype's, because the whole motion system rests on that geometry being untouched and an optimiser or a formatter would break the animation while leaving the resting silhouette looking right. Then the nine hard constraints, measured rather than read — the hub's rect pixel-identical through a full thinking cycle, every limb matrix with `d = 1` and `b = c = 0` (length-only telescoping), no rotation in any state, the arms mirrored and the legs lagging by 0.22s, all instances in lockstep, the blink timed, reduce-motion and `?nofx` both silent. Expect `PASS — mark byte-identical, 8 states, 9 constraints, round trip clean`. |
| `build-type-preview.js` | Generated `finn-type-preview.html`, the eight-serif comparison the Fraunces decision was made against. Spent; kept as the record of what was compared. |
| `finn-type-preview.html` | That comparison. Open by double-click. Eight faces, three serif-reach settings, three sizes, all fonts embedded so it works offline. |

## Running the harness

`test-finn.js` needs `puppeteer-core` and a Chrome binary. **The mock-up itself still has
no dependencies and that must stay true** — anything installed for the harnesses lives in
`scratchpad/node_modules`, nothing in `finoptic/` loads a line of it, and deleting the
folder costs one `npm i`.

```
npm init -y && npm i puppeteer-core@23
node test-finn.js
```

**Pin the major version.** puppeteer-core 24+ is ESM-only and needs Node ≥ 20.19; every
harness here is CommonJS and uses `require()`, so a bare `npm i puppeteer-core` on Node
20.15 fails with `ERR_REQUIRE_ESM` before a single browser opens.

**`build-finn-logo.js` used to be in this folder and it was deleted on purpose** (round 12).
It generated `finoptic/finn-logo.js` from the parent Finoptic logo artwork, back when Finn's
mark was two of that mark's four blades. Finn's mark is now its
own hand-drawn creature, copied verbatim from a verified prototype and explicitly
never-to-be-re-derived — so a script whose only function was to regenerate it from the
logo was a script whose only function was to destroy it. Don't rewrite it.

The `CHROME` constant at the top points at puppeteer's own cached Chrome
(`~/.cache/puppeteer/chrome/…`). Any Chrome or Chromium binary works — an
installed `chrome.exe` is fine. Expected output:

```
PASS — 288 answers, 6 datasets, 0 errors
```

Two things worth knowing before editing it, both of which cost real debugging time:

* **`loadScenario(id)` alone does not switch the view.** It sets `RAW`; `go()` is
  what assigns `D`. Always `loadScenario(id); refresh();` — otherwise every answer
  derives from the previous dataset while `closedCount()` reports the new one, and
  the whole per-dataset pass silently tests nothing.
* **A cold start with motion on plays the splash and then the welcome dialog**,
  which covers the pod. Dismiss it before clicking, or the click lands on the
  scrim and the panel is created hidden — every DOM assertion still passes, so the
  failure looks like a layout bug rather than a missed click.

## The four board harnesses

`test-screens.js`, `test-order.js`, `test-headings.js` and `test-insights.js` came out
of round 10 and take the same `puppeteer-core` + Chrome setup `test-finn.js` needs.
Expected output:

```
126 screen renders / all clean / no js errors
checked 105 tables, 63 ranked lists, 25 donut+legend pairs / all descending
checked 4503 rendered headings / every rendered heading is Title Case
placement + text OK
```

Three things about them cost real debugging time and are worth knowing before editing:

* **`loadScenario(id)` alone does not switch the view** — the same trap `test-finn.js`
  documents below. All four call `loadScenario(id); refresh();`.
* **A test can be wrong about the product.** Two of these reported failures that were
  the product behaving correctly: `CHARTTIP.attrs()` writes one `data-ct` holding a JSON
  payload, not the `data-ct-t` the first draft read, so every donut "failed"; and the
  alert feed is severity-ranked, so a Critical row is *allowed* to be smaller than a
  High one. Check what the product intends before changing the product.
* **A deliberate exception needs to be in the harness**, not just in a comment. The
  three `order:'keep'` tables and the `tail:true` remainder rows are named in
  `test-order.js`; if you add a fourth exception and do not name it there, the audit
  will fail on it and the next reader will "fix" it back.
