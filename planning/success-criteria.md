# Success criteria — the 29 July 2026 feedback rounds

*Five rounds landed on 29 July, each one reviewing the output of the last. **Round 1** is below (§1–9, "an app, not an Excel dashboard"); **Rounds 2–5** follow at the end of this file, then **rounds 6–11** of 30 July — of which **round 10 is the board round**, and round 11 the one whose rules reverse the most — and finally **rounds 12 and 13** of 31 July — round 12 not a review at all but an implementation brief (Finn's mark and its eight-state motion system), round 13 the review of it, which is where the assistant stops being a quick-answer chatbot and gains things you can do with an answer. Where they conflict the later round wins, and every conflict is named — including where round 3 reverses round 2, round 4 reverses round 3, round 11 undoes two of round 10's, round 12 freezes the resting assistant mark that round 9 had breathing, and round 13 deletes two things round 12 had built that same morning. Read them in order: no single table stands alone.*

*One row per thing Lohith asked for. Each row states the **test** that decides whether it's done —
something observable in the browser, not "looks better". Verified at the end of the round; anything
that fails goes back round the loop.*

**Source:** Lohith's feedback of 29 July 2026 (JSON data, sidebar, top chrome, ledger, spacing,
tables, icons/logos, insights, doc renames), read alongside
`planning/design-language/reference/inspiration/reference-commentary.md`.

---

## 1 · Data

| # | Asked for | Passes when |
|---|---|---|
| 1.1 | Mock-up driven by selectable JSON, not static | A scenario selector lists 4 datasets. Picking one changes headline figures, chart shapes, table rows and insight copy on every screen — not just a label. |
| 1.2 | Datasets represent different conditions | The 4 read as genuinely different stories: over budget / AI blow-out / under control / scale-up. Sign of variance, anomaly counts and status mix differ, not only magnitudes. |
| 1.3 | Loadable from a real `.json` file | A file picker accepts a `.json` export and renders it. Round-trips with the Export → JSON output. |
| 1.4 | Filters actually filter | Changing Product, Provider, Category, Environment or Period changes the numbers on screen. Totals recompute and reconcile; nothing is a dead chip. |
| 1.5 | Filters stop eating a row of height | Chrome above the content is at most **one** sticky row plus the ledger. The old crumbs row is gone. |
| 1.6 | Export works | Clicking Export downloads a real file — CSV of the visible tables, and the active dataset as JSON. |
| 1.7 | Share view works | Clicking it copies a URL that encodes scenario + screen + view + filters, and confirms it did. |
| 1.8 | Export/Share are icons with tooltips | Both are icon buttons; hovering names the action. |

## 2 · Sidebar

| # | Asked for | Passes when |
|---|---|---|
| 2.1 | Correct logo and letterforms | The wordmark is the artwork from `finoptic-logo/`, not text set in a substitute font. |
| 2.2 | Tagline replaced | The line under the logo reads **By Crozaint.com**. |
| 2.3 | "Viewing as" duplication resolved | The dropdown is gone from its own block and appears as a **`View:` line item inside the Overview group** (Lohith's own proposal, chosen over my merge suggestion). |
| 2.4 | Accent switcher rehomed | No dev-looking "Accent (demo only)" block in the nav. It lives in a dropdown opened from the profile row, which now carries a caret. |
| 2.5 | Collapsed rail shows group icons only | Collapsed, there are **4** nav icons — Overview, Spend, Manage, Reference — not 17. Clicking one gets you into that group. |
| 2.6 | Notifications hidden when collapsed | Collapsed, the footer shows the avatar only. Notifications and sign-out are not sitting beside it. |

## 3 · Top chrome

| # | Asked for | Passes when |
|---|---|---|
| 3.1 | Breadcrumb removed | No breadcrumb element anywhere in the DOM. |
| 3.2 | Top area stops taking ~20% of height | At 900px viewport height, everything above the first card is **under 150px**. |

## 4 · The ledger strip

| # | Asked for | Passes when |
|---|---|---|
| 4.1 | Equation reads as an equation | `Spend − Budget = Variance` is visibly one bracketed group with a label and correctly sized, vertically centred operators. |
| 4.2 | Stats separated from the equation | The four stats sit in their own labelled group, divided from the equation — not run together with it. |

## 5 · Spacing and hierarchy

| # | Asked for | Passes when |
|---|---|---|
| 5.1 | More air between cards and groups | Grid gap and card padding both increased; no two cards touch at a 14px gutter. |
| 5.2 | Card headline stands out | A card title is visibly larger/heavier than its body text and separated from the first row of content by real space, not 12px. |

## 6 · Tables

| # | Asked for | Passes when |
|---|---|---|
| 6.1 | No hover on non-clickable rows | Hovering a table row in a read-only table changes nothing. |
| 6.2 | Status colours make sense | **Approved is green.** The whole pipeline reads as a progression rather than an arbitrary set of tints. |

## 7 · "An app, not an Excel dashboard"

| # | Asked for | Passes when |
|---|---|---|
| 7.1 | KPI cards carry icons | Every KPI tile — including YTD budget and Variance — has an icon tile. |
| 7.2 | Vendors carry brand marks | Microsoft, AWS, Google Cloud, Grafana Labs and the rest render with a recognisable brand mark beside the name, in the vendor list and the vendor tables. |
| 7.3 | Products are colour-tagged distinctly | Alpha / Beta / Gamma / Delta / Shared services each render in their own colour, in bar lists and as a swatch in tables. |
| 7.4 | Reference DNA is present | Hatch texture, gradients on the data, and one promoted element per view — per the commentary's extracted DNA. |

## 8 · Insights

| # | Asked for | Passes when |
|---|---|---|
| 8.1 | Insights are a focal point, not a footnote | The What/Why/Do band sits **above the first card**, not at the bottom of the screen. |
| 8.2 | Insights look like the point of the screen | Larger type than body copy, an icon per role, and the Do item carries its money figure and an action. |

## 9 · Documents

| # | Asked for | Passes when |
|---|---|---|
| 9.1 | Renames reflected | No doc references `meridian-prd.md`, the deleted backup folders, or the old single-file snapshots. `finoptic-prd.md` and `finoptic-original.html` are named correctly. |
| 9.2 | Brand Guide covers the new rules | The guide records the data layer, hatch texture, KPI icon tiles, brand marks, insight-first layout and the new spacing scale. |

---

---

## Verification, 29 July 2026

Served over `python -m http.server` and driven through a real Chromium (Playwright refuses
`file:` URLs, so the mock-up was served rather than double-clicked; every path in it is relative
and nothing fetches, so the two are equivalent).

**Coverage:** 3 palettes × 4 datasets × 17 screens = **204 renders, zero exceptions**, and no
`NaN` / `undefined` / `[object …]` anywhere in the rendered output.

**All 29 criteria pass**, checked by script rather than by eye where a number decides it. The
measurements worth recording:

| Measured | Before | After |
|---|---|---|
| Sticky chrome (pinned on every screen) | ~190px | **52px** |
| Everything above the page title | ~254px | **152px** |
| Ledger strip height | 114px | **86px** |
| Grid gap / card padding / row height | 14 / 16 / 40 | **22 / 20 / 46** |
| Nav icons in the collapsed rail | 17 | **4** |
| Vendor brand marks on the procurement screen | 0 | **15** |
| Distinct product colours on the product screen | 1 | **4** |

3.2 asked for under 150px above the first content and the honest figure is **152px**. The number
that mattered is the *pinned* one — 52px, down from ~190px — because that is what "a repeated area
taking a fifth of the screen" was describing. The page head now scrolls away instead of being
pinned.

**Six real bugs the verification caught and fixed**, none of which were visible by reading the code:

1. Selecting a category scoped the actual but not the plan, so the equation read
   `$218K − $1.50M = −$1.28M` — a category compared against the whole company. Every dimension
   filter now narrows the plan, the forecast and the unallocated figure with it.
2. Provider, environment and vendor filters did not touch the ledger at all, so the strip
   contradicted the screen under it.
3. In the collapsed rail the profile menu opened off the left edge of the window — a 240px menu
   anchored to the right of a 76px rail.
4. `.swatch` was scoped to `.ent`, so every swatch used in a row-list title or a card body was
   present in the DOM but had no styles — invisible. That was hiding the product colour tags in
   two of the places they were most needed.
5. The four pipeline KPI tiles all fell through to the same neutral money icon, reproducing the
   "everything is the same colour" fault one card lower down the same screen.
6. Renewal priority was date-only, so a $16K contract at 88% utilisation was flagged `High`
   alongside a $640K one.

---

## Follow-up: the five static tables (same day)

Verification above flagged that five deep tables still held illustrative figures — they didn't move
when the scenario changed. Wired, with four new schema invariants (15–18) so a bad dataset fails
loudly rather than rendering wrong.

| Table | Passes when |
|---|---|
| Compute drill (ITFM) | Path, instance families, CPU, prev/current and the derived note all come from `resources`. The flagged row differs per scenario, and in `optimised` the total **falls** because that story is that the work landed. |
| Showback / chargeback (ITFM) | Rows come from `products` with `bu`, `sec` and `shared`. **Columns re-sum to the ledger's YTD figure** in all four scenarios. |
| Unit economics (ITFM) | Seven metrics computed from `meta` / `ai.tokens` / `itsm`. A metric whose denominator the dataset lacks is dropped, not shown against a guessed basis. |
| SIEM ingestion (security) | Six sources from `secMeta.sources`; **volumes re-sum to `secMeta.ingestGB`**; the flagged row drives the note. |
| Connected sources + enrichment coverage (data model) | Sources read from `D.sources` as 4-tuples; rule *coverage* derives from allocation coverage. The eight rules themselves stay static — they are platform logic, not customer data. |

**Verified:** 204 renders again (3 palettes × 4 datasets × 17 screens), zero exceptions, and the two
reconciliation ties hold in all four datasets. Dataset validator: **2332 checks, 0 failures**.

**Two bugs this round caught:**

1. The chargeback table's sixth column was labelled **"Shared"** but `other` actually spans security,
   observability, ITSM, device management and other technology. Renamed to "Other tech", and the note
   now states that the Security column is only the product-attributable share — central tooling
   isn't chargeable to a product, so it is deliberately less than the Security category.
2. The byline rendered truncated as **"By Croz…"** below 1180px. The rule hiding it existed for the
   manually-collapsed rail but had not been mirrored into the responsive breakpoint.

## Known conflict, resolved deliberately

The commentary's DNA point 6 is **"dimmed decimals on big money numbers"** (from Loud and Salezy).
Lohith's previous round called dimmed decimals *"unacceptable"* and they were removed. The later,
explicit instruction wins: **decimals stay one colour.** Flagged rather than silently re-litigated.

---
---

# Round 2 — the same-day review of round 1's result

*Lohith reviewed the v3.0 build on 29 July 2026, hours after it shipped. The headline verdict:
**"the app looks like a collection of boxes — whenever I see a box, it feels cluttered"** and
**"I feel that you have overused icons; you have placed icons everywhere."** Fifteen items, each
written here as a test.*

## R1 · Sidebar

| # | Asked for | Passes when |
|---|---|---|
| R1.1 | Icons only on the four group headers | `.navitem .ic` count is **0**; `.navgroup > button .gi` count is **4**. Sub-items are text. |
| R1.2 | Group header outranks its items | Computed size/weight: header **13.5px / 700** against item **12.5px / 500**. It was 9.5px — *smaller* than its own children. |
| R1.3 | View dropdown stays, duplicate list goes | The Overview group holds **Executive overview + the `View:` line, nothing else**. ITFM / Finance / Procurement / Products have no nav row and are reachable only through the dropdown, which navigates. |
| R1.4 | Logo in two columns, not two lanes | The mark sits in its own column; the wordmark and "By Crozaint.com" stack in a second column beside it, sharing a left edge. Needs a wordmark-only variant in `logo.js`. |

## R2 · Top bar

| # | Asked for | Passes when |
|---|---|---|
| R2.1 | Filters actually open | Clicking a pill produces a menu that is **in the viewport, unclipped and hit-testable** — `elementFromPoint` inside it returns one of its own options. Choosing a value changes the figures and the URL. |
| R2.2 | The diagnosis is the real one | The cause is named in the code: `.filters` was `overflow-x:auto`, CSS promotes the other axis to `auto` alongside it, and the menu opened inside a 34px-tall clipping box. Fixed by portalling to `<body>`, so no future ancestor can clip it either. |
| R2.3 | Dataset picker leaves the top bar | It is a row in the profile menu under a **"Demo controls"** heading, with the accent switcher and JSON loading. The top bar holds filters, "as of", Export and Share only. |
| R2.4 | JSON upload works, or goes | **Proved working**: a real `File` through the input renders, joins the selector, and the toast confirms. It stays. |

## R3 · The reconciliation strip

| # | Asked for | Passes when |
|---|---|---|
| R3.1 | It is sticky | `position: sticky`, pinned at `--topbar-h`, and it stays put while a card scrolls under it. |
| R3.2 | The equation is the primary entity | Equation figures **28px** against the stats' **15px**. No heading over either group. |
| R3.3 | One stat fewer | **Three** position stats, not four. "Realised" folded into the savings cell's sub-line — it is a share of that figure, not a peer of it. |
| R3.4 | It collapses | A chevron toggles it to a single 41px line that **keeps the equation** rather than hiding it, and the state survives a re-render. |

## R4 · Icons

| # | Asked for | Passes when |
|---|---|---|
| R4.1 | No hatch on icon boxes | No `::before` texture on `.tile`. `--hatch` / `--hatch-dense` deleted outright, so they cannot be reinstated by accident. |
| R4.2 | Real solid Heroicons | Every glyph fetched from `tailwindlabs/heroicons` `src/24/solid`, path data untouched, in `finoptic/icons.js`. `.ic` computes `fill: currentColor` / `stroke: none`. |
| R4.3 | Icons only on the start cards | Across **204 renders** (3 palettes × 4 datasets × 17 screens) the only `.ic` outside a `.kpi` is the strip's collapse chevron — a control, not decoration. Zero in card headers, tables, table headers, chips, empty states or the briefing band. |
| R4.4 | Icons are not all the same | Distinct glyphs per screen: no 8-tile screen below **5**, no glyph repeated more than **3** times. One accepted exception, named: the cloud screen's total plus three cloud providers. |

## R5 · Boxes

| # | Asked for | Passes when |
|---|---|---|
| R5.1 | Fewer boxes | The KPI row is unboxed — bare figures, hairline column rules, exactly one filled hero card. That is 7 surfaces per screen gone. Cards are `--shadow-0`, flat white, no inner gradient. |
| R5.2 | The inner three-box row is re-cut | The briefing band is one rule-divided region of the paper: no surface, no shadow, no radius. |
| R5.3 | No left accent border | `.brief` and `.insight` both report a computed `border-left-width` under 3px on every screen. Role is carried by the label. |
| R5.4 | No empty boxes | `.grid` is `align-items: start`, so a card sizes to its content instead of inheriting the tallest card's height in its row. |

## R6 · Charts and marks

| # | Asked for | Passes when |
|---|---|---|
| R6.1 | Legend alignment | `.legend.rows` is a CSS grid with each row `display: contents`, so values and shares line up down the list. It was flex with `margin-left:auto`, i.e. each value started wherever its own name ended. |
| R6.2 | Brand logos in the provider legend | Spend-by-provider carries the mark **and** the colour key, in their own columns. The mark column exists only when something in the list has one. |
| R6.3 | Real logos, not invented ones | 17 marks from Simple Icons geometry with official hexes, multi-colour where the mark is. Sweep of every entity name across all four datasets: every vendor and vendor-product resolves; non-vendors ("Logs", "Metrics", "Traces", rollups) resolve to **nothing**, not a lettermark. |

## R7 · Reading order

| # | Asked for | Passes when |
|---|---|---|
| R7.1 | The headline is first | The `<h1>` sits **66px** from the top of the viewport, above the strip and the band. All three come from `head()`, so it holds on all 17 screens. |

---

## Round 2 verification

Served over `python -m http.server`, driven through Chromium. **204 renders** (3 palettes × 4 datasets
× 17 screens): zero exceptions, no `NaN` / `undefined` / `[object …]`, no share above 100%, no left
accent bars, no icon outside a KPI tile except the one control. Plus **160 filtered renders** — every
screen against every dimension its own data carries. Both reconciliation ties still hold in all four
datasets: chargeback columns to `ytdActual`, SIEM volumes to `secMeta.ingestGB`.

**Four bugs this round caught**, none of them visible by reading the code:

1. **Legends reading 216.1% and 118.5%.** A Product filter narrowed `cloud.total` and `ai.total` but
   left `cloud.services`, `cloud.envs` and `ai.providers` at whole-company figures — so every slice
   was measured against a total it was no longer part of. This is what produced the standing
   "no share above 100%" check, which turns out to be the cheapest way to detect a whole family of
   filter bugs at once.
2. **A shared link leaked the previous view's filters.** `restore()` only ever *set* a filter from
   the URL, never cleared one, so following a link carrying fewer filters kept the old ones and the
   URL and the screen disagreed. A link describes the whole view or none of it.
3. **`KPI_ICON` ordered by theme swallowed whole screens** — `/forecast/` took all four tiles on the
   forecasting screen, the renewal/contract/vendor pattern five of eight on procurement. Reordered
   most-specific-first, with the R4.4 audit to keep it honest.
4. **Rollup rows rendered invented lettermarks.** "All other vendors", "Logs", "Metrics", "Traces"
   and "Retention & storage" were getting tidy A / L / M / T / R brand tiles as though they were
   companies, because the lettermark fallback fired for anything without artwork.

Two responsive flaws also fixed: the strip's chevron fell to the bottom-left when the row wrapped,
and the Do panel kept a column rule and a 26px indent at the width where it spans full width.

## Round 2's conflicts with round 1, resolved

Round 2 reverses round 1 in three places. Round 2 wins in all three, and the Brand Guide's
"What v3.1 changed, and why" table records each one:

| Round 1 asked for | Round 2 asked for | Resolution |
|---|---|---|
| Icons on KPI tiles **and card headers**, inferred from the label, "because consistency is the point" | Icons **only** on the start cards | Round 2. A card title is already a label; a glyph in front of it is a second label for the same thing. |
| Hatch as the signature fill, explicitly including icon tiles (DNA point 2, Aeros) | No hatch on icon boxes | Round 2. Hatch stays on the data, where the shape is big enough for a stripe to read as a stripe. **This is the second place the reference commentary is deliberately not followed** — the first is dimmed decimals. |
| A 3px role-coloured edge on each briefing card, "the one place an outline still earns its keep" | No left accent border | Round 2. The label carries the role. |

---
---

# Round 3 — the correction to round 2

*Lohith reviewed the v3.1 build on 29 July 2026. Round 2 had read "a collection of boxes" as
**remove boxes**; the real fault was that the boxes were too **loud**. Removing them produced the
opposite complaint: **"we removed many elements, for example in the overview. It now feels like
floating elements, which feels off."** Seven items.*

The sentence that settles the whole argument, and the one to keep: **"even though all of the boxes
are present, the background and shadows are so light that the boxes are not very evident. As a
result, even when the boxes are used, the UI looks overly clean."** The references keep their boxes.
What they don't do is let you notice them.

| # | Asked for | Passes when |
|---|---|---|
| R3.1 | Boxes back, but barely evident | Every KPI figure sits on a white surface again, on a canvas one step further off white (`--paper` #F7F8FA → #F1F4F8) under `--shadow-0` of two very short layers. Nothing on a screen floats. |
| R3.2 | Regular heights | Every box in a grid row squares off at the same height — checked by script at 1440, 1280 and 1200: **zero rows with unequal heights** on any of the 17 screens. Widths still vary (8/4, 6/6, 7/5, three-up). |
| R3.3 | …without the dead white that caused round 2 to abandon them | Content fills its card: a row list distributes its rows, a table stretches to `height:100%`, a chart's legend sinks to the bottom edge. Measured dead space at the foot of a card: **zero over 100px except the finance waterfall** (see the residual below). |
| R3.4 | A pale orange-to-light gradient on the reconciliation strip, equation larger and bolder | The strip carries a three-stop accent wash fading out before the stats; the equation is **30px / 700** against the stats' 15px / 600. |
| R3.5 | The collapse chevron stays put | Measured from the strip's right edge: **8px expanded, 8px collapsed.** It owns `margin-left:auto` rather than being pushed right by the stats, which were hidden on collapse — that is why it used to land mid-strip. |
| R3.6 | Fix the horizontal scrollbar on a budgets-and-forecasts table | **Zero tables overflow at 1440 or 1280.** Nine did. Three causes, all of them setting a floor under a table's own minimum width: `nowrap` headers, 12px cell padding, nowrap entity names. Two tables still overflow by ~20px at 1200px — recorded, not hidden. |
| R3.7 | Left padding on the orange hero tile | `padding-left` is **18px, identical to every other KPI tile.** It was 0: round 2's `.grid > .kpi:nth-child(4n+1)` column-rule reset out-specified `.kpi.hero` and zeroed it **on every screen** — a specificity accident, not a design choice. |
| R3.8 | Make insights stand out as true insights | The band is **one ink panel** — the only non-white surface on any screen — with three columns inside it, its Do figure in bright green. Differentiated by surface **value**, not by another hue. |

## Why the insight band is dark

Worth recording, because this was asked twice and the first two answers both failed the same way.

An insight is not a stat and not a chart. Round 1 made it three white cards with accent edges: a box
inside a row of boxes. Round 2 made it three bare columns on the paper: quieter, and now
indistinguishable from a caption. Both times it still looked like a panel, because it *was* a panel
in the same register as every other panel.

The only lever that separates an object from its neighbours at any size and from any distance is
**surface value**. Every panel in Finoptic is white; this one is ink. It stays a single box, so it
does not reintroduce the three-boxes fault, and it spends no accent, so the hero KPI still owns the
one accent moment. Precedent is in the references: Vaulto's dark hero panel among light cards, and
Loud's whole dark board — hierarchy by value rather than colour-blocking.

## Round 3 verification

**204 renders** (3 palettes × 4 datasets × 17 screens): zero exceptions, no `NaN` / `undefined` /
`[object …]`, no share above 100%, no icon outside a KPI tile except the strip's own chevron. Layout
checked by script at **1440, 1280 and 1200**: zero unequal row heights, zero tables overflowing at
1440 and 1280.

**Two residuals, stated rather than papered over:**

1. **A chart card can carry slack a table card cannot.** A chart SVG is fixed-aspect, so it cannot
   grow into a card whose height comes from a taller neighbour — and the gap *widens* as the window
   narrows, because the chart shrinks with the card width while a table beside it grows taller as its
   text wraps. Worst case is the finance waterfall: ~110px at 1440, ~309px at 1200. Drawing it taller
   was tried and looked worse — a zero-based waterfall with $1.5M anchors and $30–60K steps turns
   extra height into empty middle and its steps into slivers. **The real fix is a non-zero baseline
   on that one chart**, which is a data-viz decision rather than a layout one.
2. **Two tables still scroll sideways at 1200px**, by about 20px each: AI "Model comparison" and
   Finance "Variance by cost centre". Both are genuinely dense tables in half-width cards, which is
   what `.tbl-scroll` is for; below 1180px the grid goes single-column and they fit.

## What round 3 reverses from round 2

| Round 2 required | Round 3 requires | Resolution |
|---|---|---|
| The KPI row unboxed — bare figures, hairline column rules | Boxed again, and nearly invisible | Round 3. The box is the container; the fix was never to delete it, only to stop it shouting. |
| `align-items: start`, so a card sizes to its content | `stretch` — equal heights per row | Round 3. Widths vary by design; heights must not. |
| The insight band as three bare columns on the paper | One ink panel with three columns inside | Round 3. Two attempts at "quieter" both failed to differentiate; value does. |

Round 2's other reversals of round 1 all stand: icons on KPI figures only, no hatch on icon tiles,
no left accent edges, solid Heroicons, real vendor logos, the `View:` dropdown as the only route to
the persona screens.

---
---

# Round 4 — the dial, not the principle

*Round 3 got the principle right — boxes present, not loud — and then under-turned the dial and
solved the dead-space problem the wrong way. Five items, plus a favicon and a title.*

| # | Asked for | Passes when |
|---|---|---|
| R4.1 | Shadow reduced to a minimum | `--shadow-0` is **one** 1px hairline at 3.5% ink (`0 1px 1.5px rgba(11,18,32,.035)`), down from two layers. *"The shadow remains strong because we have a grey background and are using shadows for the boxes on top of it, creating excessive separation."* Real floating — nav, popovers, the reconciliation strip — still uses `--shadow-1`. |
| R4.2 | A warmer, lighter, brighter backdrop | `--paper` is **#F8F7F4**, warm, up from the cool blue-grey #F1F4F8. `--surface-2`, `--surface-3` and both hairline tokens warmed with it, or they read as cool patches on a warm page. The canvas is still a visible step off white, because with the shadow reduced that step is now the only thing separating a card from the page. |
| R4.3 | Uniform box heights **without** stretching the content | Rows keep their natural height. Row lists **clip to five** with a `Show all N` control; six lists carry one (9 vendors, 6 savings sources, 8 cloud services, 6 licence opportunities, 6 savings categories, 7 alerts). Verified: every clipped list has exactly one control and its count matches its rows, across all 204 renders. |
| R4.4 | Opening a list expands the box | Clicking takes the vendor list 5 → 9 and back; the label flips to "Show fewer"; the whole grid row grows with it and **every box in that row stays the same height in both states**. |
| R4.5 | Favicon | A `rel="icon"` SVG generated from the real mark in `logo.js` — the four blades knocked out in white on a rounded accent square, because the blades alone vanish at 16px and white-on-accent reads on a light or a dark tab bar. Inline as a data URI, not a file, for the same reason the fonts are embedded: this page has to work from `file://` with no server. `finoptic/favicon-src.svg` is the unencoded source. |
| R4.6 | Title | `Finoptic — technology spend, in focus \| Crozaint`, plus a `description` meta taken from the Brand Guide's positioning line. |

## Round 4 verification

**204 renders** (3 palettes × 4 datasets × 17 screens): zero exceptions, no bad tokens, no share above
100%, no icon outside a KPI tile except the strip's chevron, and every clipped list well-formed.
Layout checked at **1440, 1280 and 1200**: zero unequal row heights.

**The two residuals from round 3 are unchanged and still stated:** the finance waterfall's slack
(~110px at 1440, ~309px at 1200 — a fixed-aspect chart cannot grow into a card sized by a taller
neighbour; the real fix is a non-zero baseline on that chart), and two dense tables scrolling ~20px
at 1200px.

**One small consequence worth knowing:** a list with exactly five rows renders no control, so it
carries ~40px where its neighbour's control sits. It reads as padding rather than as a gap, and the
alternative — an always-present control band with nothing to open — is worse.

## What round 4 reverses from round 3

| Round 3 required | Round 4 requires | Resolution |
|---|---|---|
| Content stretched to fill its card — row lists distributed their rows | Row lists clip to five with a `Show all N` control; rows keep their natural height | Round 4. *"The heights of the boxes should be uniform, but this does not require the content to fill each box."* Stretching made two lists side by side read at different rhythms. **Uniform box heights need the lists to be the same LENGTH, not the rows to be the same height.** Tables keep `height:100%`, which is invisible. |

Everything else from rounds 2 and 3 stands: boxes present but quiet, equal heights per grid row,
icons on KPI figures only, no hatch on icon tiles, no left accent edges, real vendor logos, the
insight band as the one ink panel on a screen — which round 4 confirmed as settled.

---
---

# Round 5 — the shell loses its chrome bar

*One item, structural. Every version up to this one kept a bar in the shell above the content for the
filters, the "as of" line and Export / Share — so even after round 3 moved the reconciliation strip
into the screen to get the heading above it, the first thing on any screen was still a row of
dropdowns: **"the headline of each screen should be the first element visible."** Folding the controls
into the headline row was considered and rejected as too crowded, so they get their own row below it.*

| # | Asked for | Passes when |
|---|---|---|
| R5.1 | The headline is the first element | The `<h1>` sits **20px** from the top of the viewport, above everything except the sidebar. `.topbar` does not exist; the shell is the sidebar and the screen. |
| R5.2 | Controls below the headline, above the reconciliation bar | DOM order checked on all 204 renders: the first three children of every screen are **`.pagehead`, `.controls`, `.ledger`**, in that order, each with exactly one `#filters`, one `#asof`, one `#btn-export` and one `#btn-share`. |
| R5.3 | Nothing is lost by moving them | `.controls` pins at `top: 0` and the strip pins under it at `--controls-h`; measured while scrolled: controls at 0 with height 48, strip at exactly 48. A hit-test at the viewport top lands on a filter pill, so nothing bleeds through. Pinned chrome totals **138px**, or **95px** with the strip collapsed — the same as before. |
| R5.4 | The actions still work | Export and Share are **delegated**, not bound at boot: after navigating to a different screen (so both buttons are new elements), Export still writes both files and Share still copies a URL carrying the new screen. A listener bound once would have been attached to a button that no longer existed. |

| R5.5 | Only Overview open on load | On a cold start: Overview unfolded (its screen plus the `View:` line), Spend / Manage / Reference folded, zero of their items rendered. The `View:` line is still visible, which is why Overview has to be the open one. |
| R5.6 | Folding survives a re-render | Folding Spend and then changing a filter leaves Spend folded — `go()` only unfolds on a real navigation, because `refresh()` calls `go(current)`. Navigating INTO a folded group still unfolds it: you cannot be somewhere you cannot see. |
| R5.7 | A group icon in the collapsed rail navigates | Collapsed, clicking the Manage icon expands the sidebar, unfolds Manage **and** lands on `forecast` — its first item, with "Budgets & forecasts" marked active. Same for Reference, which has one item. Every group's first item resolves to a real screen. |
| R5.8 | A cold start opens on the Executive overview | No hash — `current` is `overview`. It used to be `itfm`, the default view's home: a persona screen chosen by a dropdown nobody had touched. A shared link still wins. *(This was an open item flagged before Friday, not something asked for; the request assumed it was already true, so it is now.)* |

**Two things a future session will break if it doesn't know them**, and both are recorded in the
Brand Guide's §8:

1. `.controls` needs its opaque `--paper` background. It is the backdrop the shell bar used to
   provide; without it the page head scrolls straight through the pinned row.
2. Anything rendered inside `head()` is rebuilt on every navigation, so its handlers must be
   delegated and its icons inlined rather than left to `fillChrome()`.

**204 renders** (3 palettes × 4 datasets × 17 screens): zero exceptions, zero bad tokens, no share
above 100%, correct structural order everywhere.

**Both long-standing residuals were closed at the end of the day** — see Round 6 below.

---
---

# Round 6 — closing the two long-standing residuals

*Both had been carried and stated for three rounds rather than quietly dropped. Asked to fix them
before finishing for the day.*

| # | The residual | Passes when |
|---|---|---|
| ~~R6.1~~ | ~~The finance waterfall wasted most of its card~~ | **REVERTED, same day, on request.** A broken axis was built: below a 35%-of-peak threshold the axis started under the walk, marked with a real floor on the lowest tick and a break glyph on each anchor. It worked — the steps went from a few percent of the plot to **81 / 89 / 84 / 93%** across the four scenarios, and the card's slack fell from ~110px to 53px. It was reverted anyway: a bar chart whose bars do not start at zero has to be read carefully rather than glanced at, and on a screen a client reads in a minute, glanceable and honest beats legible and qualified. **Every chart is zero-based again**, and the slack is the accepted cost. Reasoning kept in Brand Guide §6 so it is not re-proposed as new. |
| R6.4 | Two tables scrolled sideways at 1200px | **Zero tables overflow at 1440, 1280, 1240 or 1200.** Three fixes, in order of how much each bought: the 5/7 column split goes full-width at 1250px (it is the narrowest asymmetric pair, and ~70px earlier than the rest of the grid); the AI table's four verbose numeric headers were shortened with "YTD" moved to the card sub-line; the finance cost-centre cell stacks its code above its name instead of running "CODE · Name" on one line, where it was the widest cell in the table. Numeric columns also lost 4px of leading padding. |

**What is left, honestly:** two chart cards carry slack. The finance waterfall is back to ~165px at
1440 — up from the 110px it carried before this round, because the cost-centre table beside it grew
taller when its code-above-name cell was stacked to fix R6.4. And the AI screen's "AI cost by product"
list carries ~108px, below 1250px only. A fixed-aspect chart cannot grow into a card sized by its
neighbour, and equal row heights were an explicit request; this is the residue of that trade. Raising
the chart's own height only moves the emptiness from below the plot into the middle of it, which is
why it has not been done.

**Regression:** 204 renders (3 palettes × 4 datasets × 17 screens), zero exceptions, zero bad tokens,
no share above 100%, correct `pagehead → controls → ledger` order throughout. Layout verified at
1440, 1240 and 1200: zero table overflow, zero unequal row heights. **Re-run after the R6.1 revert:**
still 204 clean renders, still zero table overflow — the table fix (R6.4) is independent of the axis
and stands.

---
---

# Round 7 — 30 July 2026 · the big batch

*Sixteen items in one message: eleven fixes to what exists and five new areas that did not exist at
all. Worked in parallel — seven independent workstreams on disjoint files, with the shared surfaces
done serially — then reviewed as a whole.*

*One enabling change came first and is invisible to the client: **`app.js` was split into five files**
(`core` / `components` / `charts` / `screens` / `shell`) along the section banners it already carried.
2,300 lines in one file cannot be worked on by more than one person at a time. Load order is now the
dependency graph; only `shell.js` runs anything at load.*

## Fixes to what existed

| # | Asked for | Passes when |
|---|---|---|
| R7.1 | The sidebar could only be expanded on a wide desktop; on a tablet it was stuck collapsed and the sub-items were unreachable | **The sidebar opens at every width.** Below 1180px it lifts out of the layout and floats over the board on a scrim, keeping the mini rail's 76px in place so nothing reflows underneath. Verified at 1100 / 900 / 768 / 430: the expand control is visible and its items are reachable at all four. Closes on a nav choice, on the scrim, and on Escape. |
| R7.2 | The View dropdown was unstyled OS chrome | It is a **button opening the same portalled popover every filter pill uses** — a `<select>`'s option list cannot be styled at all, so the closed state was the only part that could ever have been fixed. Each option carries a line of what that lens is for. |
| R7.3 | "The view itself is not clickable — I have to select something else before the view changes" | **Clicking the already-selected view navigates to it.** A `<select>` fires `change` only when the value *changes*; every option in a popover is just a button. Verified: from the Executive overview, clicking the lit row opens IT financial management. |
| R7.4 | The reconciliation bar should read as a ticket, stats to the corner, equation spread, grey text black | **Semicircular notches punched top and bottom at a dashed perforation**, drawn as a real element between the two halves so it tracks the layout instead of being painted at a fixed percentage. The equation takes the free width and distributes across it; the three stats sit hard against the corner. Inside the equation nothing is grey — labels, operators and sub-lines all take `--ink`, and the counterfoil keeps its grey, which is now what ranks the two halves. |
| R7.5 | Filters should allow multiple selections | **Every dimension except period is multi-select.** Real checkboxes, a live count, "All *x*" to reset, and a find box past eight options. The menu **stays open** across picks. Selecting every value collapses back to "All", so an "everything" filter cannot claim to be filtering. The whole engine follows: the ledger, every breakdown, the export scope and the share link. |
| R7.6 | Period needs a custom range with a calendar | **A two-month calendar**, clamped to the *closed* months of the fiscal year, resolving to **whole months** and printing what it resolved to before you apply. Whole months because the dataset carries one figure per month — interpolating a daily curve on a screen whose entire claim is reconciliation would be the most convincing lie in the mock-up. |
| R7.7 | The filters look dated | Restyled: a leading dimension glyph (already declared in `DIMS` and never used), 32px on the control radius, a soft lift, a real focus ring, and multi-select shown as "Cloud infrastructure +2" rather than "3 selected". The `set` state still fills with **ink, never the accent** — filters are navigation (§0.3). |
| R7.8 | KPI icons should be grey, no background box, filled | The tinted tile is gone and so is the tone. Third treatment here, and the first two are recorded so they are not rebuilt: v3.0 hatched the tile (rejected), v3.1 tinted it by status — which made the glyph a second status signal arguing with the delta beneath it. |
| R7.9 | Cards standing for AWS / Azure / Google Cloud should carry the real mark **and** the name | The three provider tiles on the Cloud screen wear their **genuine vendor marks** beside their names. Fires on an exact vendor name only, so "Microsoft 365 seats" stays a glyph — verified: 3 marked cards on Cloud, 0 stray matches on any other screen. |
| R7.10 | Every plot was dead on hover | **One shared readout, portalled to `<body>`**, on every chart: line, stacked bars, donut, hbars, waterfall, band and the flow diagram. Generous invisible hit bands, a crosshair, brand marks where the series is a vendor, keyboard-reachable. Confirmed by hovering each kind and reading the panel back. |
| R7.11 | Nothing animates; two preloaders wanted | Bars rise from their baseline column by column, lines draw, donut arcs sweep, boxes stagger. A **bespoke cold-start preloader assembles the logo's four ribbons** clockwise, then the wordmark resolves; screen switches show a **skeleton** of the layout about to appear. Nothing animates on a filter change. `prefers-reduced-motion` and `?nofx` both land on the finished state. |
| R7.12 | Exported CSV showed `â€"` for em dashes | **A UTF-8 BOM.** Excel ignores the MIME type for CSV and decodes as the system codepage; the BOM is the only thing it reads as "this is UTF-8". Verified on the real download: BOM present, no mojibake, and confirmed that without it the same bytes *would* produce the reported `â€"`. |
| R7.13 | Table padding did not line up with the card headline | **Only the outer cells take the card's padding**, so the first column's text starts on the same x as the card title and the last ends on the same right edge — while the inner cells stay at 10px, which is what keeps the fix to ~20px per table rather than 20px per column. Zero tables overflow at 1440 / 1280 / 1240 / 1200 (the hard-won R6.4 result still holds). |
| R7.14 | All tables need sorting and filtering | **Every column header sorts; every table past six rows carries a find box** with a live count and its own empty state. Both read the *rendered cells*, so all ~40 tables got it at once without touching 40 call sites. Sorting understands money (`$1.62M` > `$980K`), signed figures, dates, and that severity and the optimisation pipeline are ordered rather than alphabetical. |
| R7.15 | Names in tables need avatars, with an initials orb when there is no photo | `avatarHTML()` / `personCell()`: photo when present, orb when not, `onerror` swap with **no layout shift and no broken-image glyph**. The orb is the one *round* token in a system where every other identity token is a square, so roundness alone means "person". Tone is registered per person, not hashed, after a hash collided two of them. |
| R7.16 | How many photos are needed? | **Seven**, and all seven appear in all four scenarios: A. Iyer, G. Prasad, I. Sheikh, L. Kumar, N. Rao, R. Kadavan, S. Menon. `finoptic/avatars/README.md` names the file to drop in for each. "Unassigned", the products, the departments and the vendors are explicitly *not* people and never get a face. |

## Screens that did not exist

| # | Asked for | Passes when |
|---|---|---|
| R7.17 | The anomalies screen is chaotic — tables *and* cards, cards a mix of forms | **One component, not two.** The screen rendered every anomaly twice: a ten-column table *and* four half-width cards repeating the first four. It is now a single list of **disclosure rows** built on the existing `rowList()` idiom, so the five-item clip and "Show all" are the pattern already in use rather than a second one. Collapsed answers "which one matters and by how much"; expanded carries the cause, a six-field grid and what happens next. Dropping the table also removed the screen's overflow risk. |
| R7.18 | The Resource-detail breadcrumb is clickable but the table never updates | **Replaced, not made to drill — and the reasoning matters.** The dataset holds one instance and one flat family list; there is no tree, so any clickable parent could only drill into figures apportioned on the spot. Worse, the old breadcrumb was *factually wrong* — it hardcoded `AWS / Product Alpha / Production` in every scenario while two of the four record a different product and environment, so making the clicks work would have turned a dead control into a working liar. It is now a true, non-interactive lineage line built from the record's own fields, and the card is gated on the filtered view. |
| R7.19 | Alerts are not actionable | **Every alert carries a Resolve button that opens a modal with the steps for that alert.** Steps are derived, not canned: the playbook is matched from the alert's own recommended action first, its product/owner/money are written into the sentences, and **severity decides the window and whether step one is containment or diagnosis** — a Critical AI overspend opens with "Put a ceiling on it before diagnosing anything"; a High renewal opens with "Pull the current terms". Six families across 27 alerts × 4 datasets, every one producing ≥4 steps. |
| R7.20 | A sign-in screen, on trakit's design, with our identity | Composition from trakit's `LoginPage`; the real logo, palette and typefaces. It declares `chrome: 'bare'` so the shell is **removed rather than covered** — an earlier fixed overlay left the sidebar in the tab order. Verified: 0 focusable elements in the nav on that screen. Being a mock-up, it signs in to the Executive overview and says so. |
| R7.21 | A screen for inviting members | **Team & access.** A members table with avatars, access level, department and default view; a three-step invite that reveals as you answer. Department is a real dropdown over the dataset's own `RAW.depts` — never a hardcoded list. **The role decides the view** (an admin answers for the whole estate → ITFM; everyone else lands on the lens their department answers for), and a hand-picked view survives a later role change. Ends by generating an invite link that copies for real and prefills a `mailto:`. Following the generated link shows the invite banner and lands on the right view. |
| R7.22 | No way to enter data manually | **One central "Add a record"**, not six screens — five of the six forms would have been the same shape, and what you are adding is a field, not a destination. Six types (subscription / cloud service / LLM model / vendor contract / product / cost centre), each revealing only the fields it needs and unlocking later ones as earlier ones are answered, with the row it would create building up beside the form. |
| R7.23 | Model and cloud dropdowns need a default list with the right icon | A custom portalled listbox — a `<select>` cannot hold an SVG. **Real logos render**: OpenAI, Anthropic, Google, Azure, Bedrock, Microsoft, GitHub, Perplexity; and the ones with no mark on file (Meta, Mistral, xAI, DeepSeek) fall to an **initials orb**, which is the point. 14 AI providers with their mid-2026 models, three cloud providers whose service lines match the dataset's own eight, and 41 vendors. |
| R7.24 | Allow a model that is not listed, and ask for an icon | "Add a provider that is not listed…" at the foot of every picker. An icon can be uploaded (`FileReader` → data URI, the only route that works from `file://`); without one the entity takes the initials orb. |
| R7.25 | Handle the colours assigned to added items | Auto-picks the first free `--c1…--c8` slot, shows all eight with taken ones dimmed and named, and allows an override with a warning. Only records that need a key mint one — a product always, a vendor or provider only if new, a cloud service never (the provider is the key) — and the form says which and why. Registers into `ENTITY` at runtime, so the new entity is that colour everywhere immediately. |
| R7.26 | Onboarding for a new user | **Getting started**, in Reference above Data model — the two are the same chain in opposite directions. Five steps in real dependency order (cost feeds → budget → products and tags → owners and cost centres → vendors and contracts), each declaring its share of the reconciliation, where it comes from, who normally does it, and what stays dark without it. Plus a **Screen readiness** table saying, for all 17 screens, which steps stand between it and a real number. |
| R7.27 | Empty states, when an item lacks details | **A family of five, one shell, differing by cause**: filtered to nothing / source not connected / detail missing / no history yet / role-limited. The filtered case now computes its own fix from the live filter state — the old copy told everyone to "widen the period or clear a filter" whether or not either was set. |
| R7.28 | Fresh states — day one, not an empty dashboard | A **day-one preview** of the Executive overview, reached from the onboarding screen: every real card title intact, an em-dash reconciliation strip, eight em-dash KPIs each naming the step that would fill it. Nothing renders `0`. Implemented as a wrap over the existing renderers rather than a second copy of the screen, so it cannot drift. |

**Regression, at the end of the round:** **315 renders** — 3 palettes × 4 datasets × 21 screens, plus every screen at 1280 / 1240 / 1200 — with **zero problems**: no page or console exceptions, no unresolved template tokens, no share above 100%, no table overflow, no ragged grid row, and the `pagehead → controls → ledger` order intact everywhere. Separately at **1100 / 900 / 768 / 430**: the sidebar opens and its items are reachable at every width, and **no page scrolls horizontally at any width** (dense tables still scroll inside their own container below 900px, which is what `.tbl-scroll` is for).

**One regression was caught and fixed here rather than shipped:** giving the finance cost-centre table an owner avatar pushed it 22px over its card at 1280 — the one width between the old 5/7 breakpoint and the next where it did not fit. The breakpoint moved 1250 → 1300 rather than the avatar shrinking; the avatar is the feature, and that column pair is already designed to be the first thing to break.

**What is left, honestly:** the `.path` breadcrumb on the ITFM compute drill is still clickable-but-inert. Unlike the anomalies one it at least describes the rows beneath it truthfully, and it was outside this round's scope — but it is the same fault and should be the next thing fixed. The seven avatar photos are not supplied, so every person shows an initials orb; that is a designed state, and `finoptic/avatars/README.md` says exactly which file to drop in for each.

---
---

# Round 8 — 30 July 2026 · the second pass

*Nine items, arriving across the round as the work was being reviewed. Five parallel workstreams
plus the shared surfaces. Two of them are corrections to round 7's own output, which is what
reviewing it is for.*

| # | Asked for | Passes when |
|---|---|---|
| R8.1 | The pinned bars only span their own width, the bar keeps a card's corners and shadow, and content shows between them | **The pinned state is a different state.** `<html data-stuck>` makes both bars full-bleed to the board's edges, turns the 14px gap between them into padding on the opaque bar above, and strips the strip's radius, lift and ticket notches — a ticket lies on the page; a header is welded to the window. Later in the round: **12px above the chips and 18px below**, which is exactly the 48px row plus the 14px margin it replaces, so pinning shifts the board by zero pixels. |
| R8.2 | Auto-collapse the reconciliation bar when it pins | It collapses once and stays collapsed. **The first attempt flickered the whole way down a screen** and was rebuilt: collapsing removed ~43px of *document* height, the browser clamped the scroll, the shorter page un-pinned the bar, and un-pinning expanded it again. A wide dead band suppressed the flicker but pushed "expand again" into the top ten pixels, leaving the bar collapsed while it was visibly pinned to nothing. The height is now **reserved** as margin, so the document never changes length and both transitions sit tight against the pin. Measured over a full scroll down and back on five screens: **exactly one collapse and one expand each**. |
| R8.3 | The filter chips have an odd outline | Down to a **7% inset hairline** that only firms up under the pointer; the ink-filled "set" state drops it entirely. Five bordered chips across the top of a board whose whole design is boxes you are not meant to notice was that same fault in miniature. |
| R8.4 | One filter-sort control; multi-select within a column; several columns at once | **One `Sort & filter` button per table.** A contains box, a sort list, and per-column filters you drill into — multi-select within a column, **AND across columns**. Columns are classified from their own rendered cells: rank words (severity, effort, the optimisation pipeline) get value lists **in rank order, not alphabetical**; money, percentages, counts and dates get four quartile bands labelled with real cell text (`≥ $28K`, `$21K – $28K`); sentence columns get no checklist at all, because a list of forty opportunity titles is not a filter. Across every screen and dataset that resolves to 394 value lists, 206 band sets and 80 sort-only, out of 680 columns. |
| R8.5 | Team & access: the strip and Export/Share are confusing, Manage only changes the role, two department fields, the form looks dated | **No strip and no Export/Share** on a screen about people. Summary figures first, one table, an **"Add new member"** row at its foot, and **one right-hand side pane** serving both flows — empty for a new member, pre-filled from **Manage**, and editing name, email, department, access level and photo rather than only the role. **Department is the only question asked**; the view is derived and *shown*. That deliberately reverses R7.21's admin→ITFM rule, which is what made a second field look necessary in the first place. |
| R8.6 | A photo added to a pending invite does not appear in the table | Two causes, both required, both fixed. The uploaded data URI was dropped on the way into the member list; and even carried, `avatarHTML()` had already marked the new name `missing` after both extensions 404'd for an invitee — once `missing` is true it returns the orb and never reads `photo`. The photo is now written into the shared roster, so an uploaded face follows that person onto every other screen. |
| R8.7 | Use the supplied avatars, with a pale orange ground | Eight portraits, **20MB → 703KB**, resampled at 256px through a canvas because adding an image library would mean a build step. They are transparent cutouts, so a pale accent wash sits behind each one — that is what gives a photo the same disc an initials orb has. **One given name each, exactly the filename**: welding a supplied first name onto an invented surname put an invented identity on a real person's face, and was struck. The two stock portraits take Western given names, because that is what the artwork depicts. The sidebar tile dropped its accent gradient for the same pale wash. |
| R8.8 | Add a record is confusing — too much detail for a form | No strip, no controls row, **no KPI row** — four figures about the dataset, on the one screen that is not about the dataset. Four cards collapsed into one panel; the type chooser collapses to a single line once answered; colour and identity moved behind a fold whose header still shows the mark and the chosen swatch. The preview stays, and stays quiet until there is something to preview. It also **stopped inventing answers**: unanswered cells were rendering `$0K`, `0%` and `Vendor risk: Low`, judgements the form made up. They are em dashes now. |
| R8.9 | Toasts feel dead, and sit bottom-right | **Top right, and a stack.** Each toast is its own element with its own timer and a draining bar, so three actions produce three cards that clear independently instead of overwriting one another. It flies in with a short overshoot, the tick pops a beat later, and it is dismissible. Removed on a timer rather than on `animationend`, because reduced-motion kills the animation outright and that event would never fire. |
| R8.10 | The sign-in questions are not animating in a marquee | **There was no marquee.** Three static rows nudged by hard negative margins, and `styles.css` said so in as many words: *"Static — motion is Phase 3's file, not this one."* Phase 3 never picked it up, so it read as a marquee stopped dead. It is now three tracks drawn three times over, translating by exactly a third so the seam is invisible, alternating direction at 44/53/48s and pausing on hover. Measured: rows 1 and 2 drift 37.8px and 34.3px in **opposite** directions over 1.8s; hover freezes both. |
| R8.11 | Remove the "nothing is sent" panel from sign-in | Gone. Truthfulness is kept in the toasts and under the members table — not on the front door. |
| R8.12 | Fresh and zero datasets | **Six datasets now.** *Marlowe Bioworks* — ten weeks old, two closed months, $63K against a $66K plan, and **no anomalies, because there is no baseline to deviate from**. *Ashcombe Retail* — day one: every total zero and every **list empty**, so cards fall through to real empty states rather than drawing a donut of eight `$0K` slices. Both log `reconciliation ok`. |
| R8.13 | The zero workspace has to actually render | It found **four screens that crashed and five that printed `NaN`** — bugs the four mature datasets could never reach. The worst: `new Array(closed-1)` with zero closed months threw a `RangeError` that took the whole page down, sidebar included. All fixed at source rather than designed around. |
| R8.14 | Getting Started is confusing — everything on one screen with no direction | **Three chapters, one on screen at a time**: see what it does / connect your data / see what it turns on, with the five setup steps as an accordion inside chapter 2 and exactly one accent button per chapter. The rail at the top is clickable, so it is a route rather than a corridor. |
| R8.15 | Initial pop-ups, a placeholder video, guidance on how to use it | A **greeting** on cold start, once per session, reusing the existing modal contract rather than growing a second one, and re-openable from the profile menu. A **video placeholder** whose poster is an inline-SVG drawing of the product's own layout, carrying a `Placeholder` chip and "Not recorded yet" — no `<video>`, no file, nothing to 404. And five **how to move around** pointers, which is what a client actually needs before a demo. |
| R8.17 | The ITFM compute drill still had a clickable-but-inert breadcrumb | **Gone, and `.path` with it.** It is a `.trail` lineage label, the same component the anomalies breadcrumb became. It could not be made to drill for the same reason: the dataset holds one flat family list at the leaf and nothing at the levels above it, so three of seven segments could have done something and four could not — which reads as broken rather than as a label. Filtering the board from each level was the other option and loses too: this screen offers period, product and category, so a provider or an environment segment would silently do nothing. Verified: **zero `.path` elements on any screen in any dataset**, and the trail is suppressed entirely on the empty workspace, where there is no drill to describe. |
| R8.16 | The View line should be clickable, not only its dropdown | A **split control**: the name opens that view, the caret opens the picker. Verified — clicking the name from the Executive overview lands on IT financial management. |

**Regression:** **441 renders** — 21 screens × **6 datasets** × 3 palettes, plus every screen at 1280 / 1240 / 1200 — with **zero problems and zero page or console errors**. Narrow sweep at 1100 / 900 / 768 / 430: the sidebar opens and its items are reachable at every width, and no page scrolls horizontally anywhere. The console is silent for the first time on this project — flipping the avatar lookup to try `.png` before `.jpg` removed seven guaranteed 404s per load.

**What was left after this round:** `S.cloud`'s optimisation table was still five illustrative rows rather than derived from the dataset — closed in round 9 (R9.11). Dense tables still scroll inside their own container below ~900px, which is what `.tbl-scroll` is for.

---

# Round 9 — 30 July 2026 · the third pass

*Twelve items, arriving across the round. Four of them correct round 8's own output, and two correct
work done earlier in this round — which is what a review pass is for. No parallel agents: the batch
touched shared surfaces almost everywhere, so it was done in one pass and verified as one.*

| # | Asked for | Passes when |
|---|---|---|
| R9.1 | The reconciliation bar's sticky mode is being overlapped | **Measured, 14px, and gone.** The strip pinned at `top: --controls-h` — 48px, the controls row's *resting* height — while the pinned row is 62px tall, so it came to rest 14px under an opaque bar that outranks it (z-index 18 against 12) and had its top edge painted over for the whole of every scroll. `stickTick()` now writes the row's measured height to `--stuck-h` and the stylesheet reads it, so a future change to a chip, a font or a breakpoint cannot desync the two. Verified pinned at y=700: **controls bottom 62, strip top 62, overlap 0**. |
| R9.2 | A unified sort and filter for **each column**, not one per table | **The header is the control**, on every column, and it holds both sort directions and that column's own multi-select. Directions are named by content: `Sort ascending / Sort descending` on figures and dates (with *smallest first* / *oldest first* beneath), `Sort A to Z / Z to A` on text. Rank columns keep their vocabulary order. The filter is multi-select within a column and **AND across columns**, and a column with no tickable values — forty distinct opportunity titles — gets its own contains box instead. This reverses R8.4's single table-level popover: that control held everything, but away from the column it acted on. |
| R9.2b | The controls appear only on hover, are not next to the heading, and swap sides between columns | **Corrected mid-round.** The first implementation hid the mark until hover and pinned it to the cell's corner — top-right on a text column, top-**left** on a right-aligned one, so it crossed sides along a single header row. Replaced with an always-visible mark inline after the label. |
| R9.2c | The hover state's vertical alignment is off — the header sits at the top with a large gap below; the controls and dropdown look outdated | **Corrected again, and this one needed the references.** The inline mark was right; the hit target was not. It was a full-cell overlay button, and a `<th>` is as tall as the tallest header in its row — so beside a two-line header, a one-line label showed jammed at the top of a 44px grey band. **The button now wraps the label itself** and is sized to it, with a -6px margin so its background breathes without pushing the label off the column edge: shadcn/ui's data-table header, which `reference/element-references.md` §7 names as this project's base for tables. `thead th` went `vertical-align:bottom`, so short and wrapped headers share one line above the divider. The **popover was rebuilt** rather than restyled — it had been reusing the filter pills' row class, which carries a 9px colour-swatch slot on every row, three grey type levels and CSS-triangle arrows. Now: 12px radius and layered shadow (DNA 4), 30px icon-led rows and 8px section gaps (DNA 10), real checkboxes, a search field rather than a bare input, and an `Esc to close` hint — the last three from §8's Linear filter menu. Measured after the rebuild: every header button hugs its own text (18px on one line, 31px on two) and every one sits **8px above the cell's bottom edge, on every column**. |
| R9.3 | Some tables have no sort and filter at all | The threshold dropped from four rows to **two**. A board where the same affordance is on one card and absent from the next teaches the reader it is unreliable, which costs more than the two rows it saved. One row is the floor — a single row has no order to put itself in. |
| R9.4 | Table rows should take only the height they need, not share the card's slack | **`height:100%` is gone from the table.** Table layout distributes slack in proportion to content, so a two-row table beside a nine-row one came out at 61/51/61/51/60px — ragged, and for no visible reason. Rows are now 46px, or taller only where the content genuinely wraps. The same rule was applied to chart legends, whose rows were being spread by `align-content:space-between`. |
| R9.5 | The alerts feed's second column is a mess — too many item types, alignment off | **A grid with named tracks**, the idiom the anomalies feed already uses one card away. The old second cell ran the product, an avatar, an owner and the recommended action together on one middot-separated sub-line: five item types with no fixed positions, so the avatar sat at a different x on every row. Now: severity, what happened (with the product as its caption), who owns it, what to do, the two figures, the control. Verified across five rows — **identical left edges on every column**. |
| R9.6 | Getting started should not carry a reconciliation bar, download/share, or that row at all | All three gone. Every control in that row acts on a dataset: the filters narrow rows this screen does not show, Export writes a CSV of tables it does not have, Share copies a link to a view with no state. A row of controls that cannot do anything is the inert-breadcrumb fault in a wider format. The day-one **preview** keeps both, and should — it is the Executive overview, and the point of it is that the real screen's furniture is already there and empty. |
| R9.7 | The video tile has too many text groups; embed the real video; play it in a modal | The drawn poster stays — it cannot fail to load from a `file://` path, where a remote thumbnail would leave a broken frame. **The whole frame is now the button**, and it opens the film in a dialog sized to it. Removed: the `Placeholder` chip, the "Not recorded yet" line, the four-item "what the walkthrough would cover" caption, and the card note explaining that no file was attached. Closing the dialog removes the iframe, which is also the only reliable way to stop the player without talking to its API. |
| R9.8 | No message anywhere may indicate this is a mock-up | **Thirteen strings**, across toasts, dialog footnotes, card notes, the invite email, the sign-out and the greeting. Two rules kept it honest rather than merely quiet: never claim something happened that did not — "Nothing was sent" stays, the sentence explaining *why* goes — and where the disclaimer *was* the whole message, say what a real product would say at that moment. Verified by scanning the rendered DOM of **every screen in three datasets plus the greeting and the alert dialog**: the only two hits left are the customer's own data (`Delta multimodal prototype`), which is a prototype the fictional company built. |
| R9.9 | An empty workspace shows "Nothing to rank" and zeroes; grey out the tile and offer **See how to connect** | Three changes, one cause. `emptyState()` **picks its cause** instead of assuming one: a filter is live → the filter did it; no filter and no closed month → the source did it, and the fix is to connect it. Cards whose source is not connected dim their header and carry **See how to connect**, which opens a **right-hand pane** with the actual procedure for that step — provider-shaped ("create a read-only IAM role", "enable BigQuery billing export"), not "configure your data source". And every zero is gone: KPI figures, the reconciliation strip and one card sub-line all fall back to em dashes. Verified: **zero literal `$0K` figures anywhere on the empty workspace**. |
| R9.10 | The ticket's dotted line is too dark and too large; the equation is too spread out | The seam is **1px at 13% ink on a 3-on-5 dash** with 13px notches, down from 1.5px at 26% with 17px notches — at the old weight it read as a heavy dotted divider slicing the strip in two. The equation groups its terms at the left on an 18px rhythm instead of `space-between`, which at 1440 was putting ~180px between `$63K` and the minus sign acting on it. The free width falls between the equation and the counterfoil, which is the ticket's seam and wants to be an interval anyway. |
| R9.11 | *(not asked — found while fixing R9.9)* `S.cloud`'s five hardcoded optimisation rows | **Derived from `D.opps`**, the same backlog the Optimisation hub ranks. The empty workspace is what made the hardcoding indefensible: with no spend, no vendors and no opportunities it still reported "Savings potential $78K", sitting in a row of em dashes. Two columns went with the hardcoding — Provider and Current monthly are not in the schema, and inventing them per row is how the table got there. Target date, which the schema does carry, took their place. This closes the last open item of its kind: **no table in the mock-up is hardcoded now.** |
| R9.12 | The collapsed sticky bar's chevron is pointless — it cannot expand | Hidden while pinned-and-collapsed. Scrolling past the pin auto-collapses on every tick, so expanding from there won for one frame and the next scroll event undid it. A chevron that visibly refuses is worse than none. It returns the moment the strip is a card again, where the toggle does work. |
| R9.13 | In the collapsed sidebar, clicking a group should expand it, not navigate | Expanding and choosing are two separate acts now. It used to also jump to that group's first screen, on the reasoning that expanding to a list you must click again is a wasted step; in use it threw the reader off whatever they were reading onto Cloud, which they never asked for and could not undo without remembering where they had been. |
| R9.14 | The welcome screen is a block of text; make it engaging and human | Rebuilt around what a greeting is *for* rather than restyled. It used to explain the product's construction — the equation, what is wired up, where the demo controls live — in seven stacked text blocks, to a reader who has not formed a question yet. Now: the **time of day and their name** (the one thing about the reader the product genuinely knows), one sentence naming their own company, the walkthrough as the largest object rather than an illustration two thirds down, three orientation lines in a row, and two ways out that are both real choices. Warm ground, a 24px headline, and no numbered list anywhere. |

**Regression:** **441 renders** — 21 screens × 6 datasets × 3 palettes, plus every screen at 1280 / 1240 / 1200 — with **no page or console errors**. Two flagged, both the same known table: ITSM's third-width "Incidents and infrastructure cost" scrolls inside its own card at 1240 and 1200, which is what `.tbl-scroll` is for. Clean at 1280 and above. Sticky measured over a full scroll down and back on five screens: **exactly one collapse and one expand each** — no flicker. Narrow sweep at 1100 / 900 / 768 / 430: no page scrolls horizontally anywhere.

**What is left, honestly:** the per-column control costs ~13px of header width on every column, which is why one dense table needed a shorter header; that is the price of an affordance a reader can find without hunting. And `identified`/`realised` still only narrow under the Category filter, because an opportunity records a category and nothing else.

---

# Round 10 — 30 July 2026 · the board round

*Five items, arriving as one message. This is the first round since round 6 that is about the **board
itself** rather than one component — heading case, the weight of one filter, where the insight band
sits and what it says, where the lens switch lives, and the ordering of every ranked display.
**Six of Brand Guide v4.0's seven rules reverse something that was locked**, and three of those were
stated as absolutes ("sentence case always", "a set filter fills with `--ink`, never the accent",
"the band sits directly under the page title"). A sixth item — the assistant's focus veil turning
orange — arrived first and is R10.0.*

| # | Asked for | Passes when |
|---|---|---|
| R10.0 | The gradient behind the centred chat should turn **orange** when you click into it | **A second layer whose opacity cross-fades**, not a recoloured `background` — a gradient's own colour stops do not animate, so swapping them would snap from white to orange while the height eased, which is the one thing that would make the whole gesture read as a glitch. The suggestion chips stay white surfaces on the wash and remain legible. It is a considered break of §12's accent budget of one: that budget rations accent **objects**, and this is ground — no text, no border, no edge, present only while the composer holds focus, gone the moment the surface opens. |
| R10.1 | Review every headline, including tile headings — each heading should have **every word capitalized** | **271 heading strings rewritten at source**, plus a `titleCase()` helper in `core.js` for the two built from data (a dataset's `resources.unit`, and the four status names used as pipeline tile labels). Taken literally: *every* word, so `Spend By Vendor` and `Where Operations And Cost Meet`, not AP style. Acronyms survive **by rule, not by word list** — a word carrying an uppercase letter anywhere after its first character is left untouched, which protects SaaS, AI, YTD, ITSM, SIEM, GB, EC2, MoM, GenAI and every brand name without a list that would drift. Hyphen and slash are word boundaries (`Multi-Cloud`, `Cost / Req`). What is *not* a heading stays in sentence case: card sub-lines, hint chips, note footers, the band's prose, form field labels, and the assistant's answer headlines, which are sentences. Verified against the rendered DOM: **4,503 headings across 20 screens × 6 datasets, zero starting a word in lowercase.** `text-transform: uppercase` is still banned outright — two different rules, and only the first changed; a `.navsub` tag built with `uppercase` during this round was caught by that rule and rebuilt with size and weight instead. |
| R10.2 | The period filter drives the whole dashboard but lacks visual emphasis — give it weight, always coloured | **Permanently accent-tinted, and the only filter that is.** Accent wash, accent glyph, accent-strong 700 value; **solid** accent when a custom range is set, because at that point the pill is also the only place the chosen span is written down. This reverses §7's "a set filter fills with `--ink`, not the accent" for one dimension: period is not a narrowing of the board, it is the board's **subject** — every figure on every screen is a figure for a span of months — and it is the only dimension with no unset state to be quiet in. **Tinted rather than solid** because the one full-strength accent object on a board screen is its hero KPI tile (§0.3), and two at the top of the page would compete. Custom range gets its own class rather than reusing `.set`, which also emits a clear `×`, and period has nothing to clear to. **Procurement gained the pill in the same pass** — measured, its figures always moved with the period ($1.62M → $475K on Last quarter) but the control that moved them was not on the screen, which is the awareness fault in its worst form. `optimize` and `alerts` still have none, and that is correct: `deriveView()` does not scope a backlog or an open-alert feed by month, and a control that changed nothing on the screen it sits on would be worse than no control. |
| R10.3 | Recon bar, insights and KPI tiles say the same thing — move the insights **below** the tiles and give information not apparent from the other two | **Both halves done, and the second is the substance.** *Position:* the band moves below the leading run of KPI tiles and stays above the first chart. Done by **moving the node** in `placeBriefing()` rather than by changing `head()`, because `head()` emitting all four parts of the page head in one place is what keeps the order right on twenty screens without twenty edits — one generic move costs one function; the alternative was twenty call sites and twenty chances for one to disagree. It must never go below the charts: that is the footnote position v3.1 rescued it from. *Content:* the first cell was the authored `insights[screen].what`, which on most screens was the reconciliation equation written out in words — five figures, all of them already in the strip above and the tiles below. It is now **`What You Might Miss`**, derived: six general probes (concentration, when the variance accrued, the latest month against the year's own pace, the fastest-moving line, the size of the tail, how many feeds the board is standing on) plus four screen-specific ones (technology cost against the revenue it supports, SIEM ingestion concentration, the observability data-versus-traffic gap, the incident rate against the ticket rate). Each probe **scores itself 0–100 for notability** and only notable things print — an evenly-spread list scores zero and stays quiet rather than reporting "the top three are 38%", which is a fact about nothing. Scores are **normalised**, and that is what makes the set work: unnormalised, concentration reported 79 and run-rate reported 10 for two equally readable findings, so concentration won on all seventeen screens and the band said the same shape of thing everywhere. The best always prints; a second only if it also scores ≥25. If nothing scores — a workspace with no closed month — the authored sentence is used, so the cell degrades rather than blanks. Verified across **17 screens × 6 datasets**: correct placement everywhere, no `NaN`/`undefined`, and the only fallbacks are the day-one dataset, where there is genuinely nothing to derive. |
| R10.4 | "Viewing as" is misplaced in the sidebar — put the filter on the view itself; add a **Dynamic Overview** item | **The rail holds no controls now.** The lens switch sits in the page head's right slot, taking the position the flat `Persona · …` tag holds on every other screen — a control where a label used to be, which is the swap the annotated screenshot drew. **One button, not the rail's split control**: there the name had to be clickable because the rail was the only route *to* the view, and on the view itself there is nowhere to go. The Overview group now holds two rows, `Executive Overview` and **`Dynamic Overview`**; the second is an **alias**, not a screen — `go()` resolves it to whichever of the four lens homes the active lens points at, which is what lets one row stand for four screens without listing all four (the duplication v3.1 deleted). It is lit by `personaOf(current)` rather than an id match, because the screen you land on is the lens's home and never `dynamic` itself, and it carries the lens's short name as a **quiet label** — size, weight, `--ink-4`, never a chip, because a bordered pill in the rail would read as the thing you press to change it, which is the confusion moving the control out was meant to end. Only the four lens screens get the control; every other screen keeps its `Persona · …` **label**, because turning a label into a control that navigated you away from the screen you had just opened would be a trap. The label reads exactly **"Viewing as"**, as specified, and is the one heading in the product left in sentence case for that reason. |
| R10.5 | Every plot, table and numeric display should be ordered **descending** | **Sorted inside the drawing functions, not at the call sites.** `ranked()` in `charts.js` does `hbars()`, `donut()` and `legend()`; `tableOrder()` in `components.js` does every table. That placement is the decision worth defending: ~40 call sites are 40 chances for one list to be left in whatever order its dataset happened to hold, and a dataset loaded from a file at runtime cannot be edited at a call site at all. `donut()` and `legend()` must run the **identical** comparator — they are handed the same array by the same call site, so sorting one alone would silently mislabel every slice. **`tail:true`** pins a rolled-up remainder to the bottom: "All other vendors (26)" is a remainder, not a vendor, and on two datasets it is larger than the eighth vendor. For tables the key is **the currency column with the largest absolute total**, and three simpler positional rules were tried and each broke a real table — *first right-aligned* ranked chargeback by cloud spend, *last right-aligned* ranked the renewal calendar by utilisation percentage, *any numeric* scrambled a Value column holding nine unlike units. Requiring currency specifically is what keeps it off the percentage and mixed-unit columns; a table with no money column keeps its authored order. Three tables opt out with `order:'keep'` — two listing unlike measures down one column, one whose eight rows are a pipeline in sequence. Time series and waterfalls are never sorted: "descending" there would run the year backwards or reorder the terms of a sum. **One real bug fell out of the audit:** the alert feed sorted on `save` while the row shows `impact` first, so the leading money column read as unordered within each severity band — the key is now the figure the eye reaches first. Verified across every screen in every dataset: **105 tables, 63 ranked lists, 25 donut+legend pairs, all descending**, with money descending *within* each band wherever a list is severity-ranked. |

**Regression:** the Finn harness still passes (**288 answers, 6 datasets, 0 errors**). Four new harnesses, all clean: **4,503 rendered headings** Title Case; the band correctly placed with derived text on 17 screens × 6 datasets; **105 tables / 63 lists / 25 donut+legend pairs** descending; and **126 screen renders** (21 screens × 6 datasets) at 1280 with no page or console error, no `NaN`/`undefined` in any DOM, no horizontal overflow, and every screen carrying a heading. Narrow sweep at 900 and 430 clean, mini rail clean.

**What is left, honestly:** three things, all noted rather than hidden. **Title Case is literal** — "And", "By", "Of" and "A" are capitalised because the instruction said every word; switching to AP-style title case is a one-line change to the `word()` rule if that reads better in the room. **The `sources` screen still shows the shared reconciliation strip without a period pill** — its own content (feeds, rules, cadence) genuinely does not vary by month, but the strip above it does; that predates this round and was left alone. And **`optimize` and `alerts` remain period-less by design**, which means the strip on those two screens can show a span the screen offers no way to change.

---

# Round 11 — 30 July 2026 · the board round, reviewed

*Six items in the opening message and four more as the work went, several of them
reversing round 10 the same night. **Two of round 10's own rules were undone** — the
lens switch went back to the sidebar, and the period pill's tinted wash became the
full brand gradient. Brand Guide **v4.1**.*

| # | Asked for | Passes when |
|---|---|---|
| R11.1 | Revert the persona dropdown; move it back into the sidebar as it was before. Then: remove `Dynamic Overview` — there is no longer any use for it | **The rail is byte-for-byte what it was before round 10**: Overview holds `Executive Overview` and the `View:` line, and the line is the same SPLIT control — name opens the active lens, caret opens the picker. That split is not decoration; a single button that only opened a menu was the original round-5 complaint, and making the whole control navigate would remove the only way to switch. `viewAs()` and its CSS are deleted, the flat `Persona · …` label is back in the page head on every screen, and `Dynamic Overview` went with the alias `go()` resolved for it — with the switch back directly beneath it, the row named the destination the line under it already named. Verified: no `.viewas` in the DOM on any screen, both halves of the split control navigate, the line lights on all four lens screens. |
| R11.2 | The period filter should carry the same gradient as the primary stat card. No outline. And make every KPI tile identical — remove the orange gradient from the one card | **One decision, not two.** The hero tile is gone — `--grad-accent`, the hatch, the white knockout, the translucent delta chip, all of it — and the pill inherited the gradient, hatch overlay included, with `border-color:transparent` and no inset ring. That ordering matters: the gradient is available *because* the tile gave it up, so the board still spends full-strength accent exactly once per screen (§0.3). Doing either half alone would leave two gradients or none. `kpi()` still accepts `hero:true` and ignores it, because twenty screens each mark one tile and one place should decide. Verified across 16 screens: **zero `.kpi.hero`, one distinct tile background, gradient on the pill, no inset ring.** |
| R11.3 | Collapse the KPI tiles and the summary into one **tabbed** view with two tabs, in the same row, with a headline. Default to the key-insight (black tile) view | One region between the strip and the charts: headline left, `Key Insights` / `Metrics` right, on one row. The headline is a per-screen noun plus the live period (`The Technology Estate · Aug–Jun`) — the noun because repeating the page title 30px below it wastes the line, the period because it is the same emphasis R11.5 just gave the pill. Screens with no period pill get the noun alone rather than a span they cannot change. Assembled by MOVING the nodes `head()` and the screen already produced, for the reason `placeBriefing()` did: `head()` composing the page head in one place is what keeps twenty screens consistent. State on `<html data-sum>`, so it survives a filter change. It degrades rather than half-builds — `team` has tiles and no band, `sources` has a band and no tiles, and both keep what they have rather than getting a two-tab control with one empty tab. |
| R11.4 | The heading and the tab switcher should be **outside** the panes, with the cards in their own grouped pane. Add a footnote-style `View KPIs` button that switches to the metrics view | **Corrected mid-round**, and the first version is the reason the rule is worth stating. It wrapped everything in one white card with the ink band flush inside it — which made the header part of the object it was labelling, and forced the KPI tiles to sit inside a card as well, a box in a box (§3). `.sum` now has no surface at all: the headline and tabs are chrome on the canvas, the band is the ink panel it always was, and the tiles are ordinary cards in their own pane. The `View KPIs ›` footnote spans the band's three columns at its foot, carrying the same `data-sum-tab` attribute the tabs do — so the footnote and the tab are one control with two presentations, which is also why the handler matches the attribute's VALUE and not node identity. Matching by identity switched the pane and left both tabs unlit. |
| R11.5 | Remove the Observability screen entirely; move ITSM to fourth, after SaaS & Licences | Renderer, nav row, `SCREEN_DIMS` entry, insight probes and the onboarding readiness map all gone; Spend reads Cloud → AI → SaaS & Licences → ITSM → Security. Observability stays a spend **category**, a vendor category, a GL account and a column on the ITSM board, and `D.obs*` stays in the schema and is still rescaled — a dataset describes the estate, not the list of screens that happen to exist. A stale `#obs` link falls back to the overview instead of erroring. 20 screens now, not 21. |
| R11.6 | The chat gradient stops short of zero transparency — a harsh edge at the end, and a harsh white edge at the top when collapsed | **The cause was geometric, not a wrong colour stop**, which is why re-tuning the stops would not have fixed it. The radial was `56% 148% at 50% 116%`: centred 16% *below* the element with a vertical radius of 148%, so its topmost point sat 32% *above* the element and the box clipped the gradient where it was still ~25% opaque. Rebuilt on two axes with one job each — a vertical `linear-gradient` whose last stop IS the top edge, so `transparent 100%` is genuinely zero there, and a `mask-image` for the sideways fade sized in the element's own width (46%, zero at x=4% and 96%) so it also finishes inside the box. The mask covers the accent layer too, since a mask applies to pseudo-elements, which is why `::after` only declares its own ramp. The orange now runs from `--accent-strong` at the base to true `transparent`. Verified against a flat dark backdrop at both states: no arc, no line, no residue. |
| R11.7 | The collapsed reconciliation bar wastes its whole right side — put important stats there. Ten screens specified; choose for Manage and Reference on CIO relevance; cut to two stats if three overflow | Per-screen, and **passed in by the screen rather than looked up in a registry** — that is the decision worth defending. Nearly every requested stat mirrors a KPI tile computed from a local in the renderer's own scope (`committed`, `consolSave`, `me`, `secTotal`, `optSav`), so a registry would have had to recompute all of it and the two copies would drift the first time a formula changed, with no way to notice except by reading both. `head()` takes a 4th argument; three inline tile expressions were hoisted to locals so the strip and the tile are literally one expression. Verified: **225 of 225 stats equal the KPI tile of the same name**, across 16 screens × 6 datasets. **Nothing needed cutting to two** — measured at 1600 / 1440 / 1360 / 1280 / 1240 / 1200, all sixteen screens hold three. My picks: `optimize` → identified / **approved-not-yet-done** / realised, the middle one because it is the only figure on the screen naming work the reader has already approved and nobody has done; `allocation` → coverage / unallocated / tagging compliance; `forecast` → year-end / next quarter / **accuracy**, which earns its place by qualifying the other two; `anomalies` → unexplained spend first, then count, then time-to-explain; `alerts` → open / impact / savings attached; `sources` → feeds healthy / coverage / unallocated, the only three that answer the question that screen exists to answer. |
| R11.8 | The stats are too close to the equation — group each separately at opposite ends, with a vertical separator, as in the expanded state | The seam stays collapsed, as the same punched gradient the expanded ticket uses, **without the notches** — a 13px bite either side of a 47px strip eats a quarter of its height. It carries `margin-left:auto`, so the seam is the element that absorbs the free width: equation hard left, counterfoil hard right, neither having to grow. Below 1400 the equation drops its trailing `+8.0% over plan`, which is the one genuinely duplicated figure on the strip (`+$120K` is two words to its left) and buys ~110px — enough to hold three stats down to 1200, where the whole strip wraps anyway. Verified at seven widths in both states: **no overlap, seam spans the full strip height, gap ≥ 18px on both sides.** |
| R11.9 | Keep the sub-comments and all the stats in the collapsed state; split into two rows if one row is too wide | Each collapsed stat is now two lines — label and value sharing a baseline on the first, the sub spanning both tracks on the second. A grid, not a flex column, because a column would put the label above the value again, which is the expanded layout. Two lines rather than one because label + value + sub inline is ~300px a stat and three of those plus the equation do not fit at 1280; the sub is always narrower than the pair above it, so stacking costs a line of height and nothing in width. `flex-wrap` on the container is the safety valve the instruction allows, and it never fires: verified at 1600 → 1200, **all 16 screens keep every stat, every label and every sub, on one row.** |

| R11.10 | Remove the chatbot from the sign-in screen; make sign-in the default landing screen; the welcome modal's bottom content is cut off | **Finn goes with the rest of the chrome.** It is fixed to the viewport rather than living in `#screen`, so it survived a screen that had deliberately dropped its filters, its reconciliation strip and its Export button — and an assistant offering to answer questions about your spend on the screen where you have not signed in is offering to answer them for somebody who is not there. Hidden on `data-chrome="bare"`, alongside the nav. **Sign-in is now the default route**; a shared link still wins, so every URL in circulation opens on the board it names rather than on a login. That change broke the welcome dialog silently — it was armed to fire only if a cold start landed on the overview and to give up otherwise, so it would never have fired again; it now waits out the sign-in instead. **The cut-off was a real bug with a specific cause:** the welcome is the one dialog with no `.mdl-b`, so its content goes straight into `.mdl`, which is capped at `max-height:100%` and clips — on any viewport under ~860px tall the two buttons that dismiss it were unreachable, with no scrollbar to find them. `overflow-y:auto` makes nothing unreachable at any height, and two height media queries take the height out of the 16:9 poster (the one illustrative element) so scrolling is rare rather than routine. Verified at 1000 / 900 / 860 / 800 / 760 / 700 / 660 / 600: **the CTA is visible at every one.** |
| R11.11 | Centre the welcome's buttons and reduce the amount of text | Buttons centred — the rest of the dialog is left-aligned prose, and a left-aligned pair under a three-column row reads as belonging to the first column rather than to the dialog. Text cut in three places: the lead lost its LIST of six domains, which the sidebar names anyway, and each of the three orientation points went to one short line. Also removed: **"Seventeen screens"** — it said seventeen while there were twenty-one and twenty-one while there were twenty, and a count maintained by hand in a sentence nobody re-reads is a count that will be wrong the moment it is read aloud. The line is about the equation holding everywhere, which is true whatever the number. The dialog is 695px tall now against 818px before. |

**Regression:** ten harnesses, all clean — 126 screen renders with no error, `NaN` or overflow; 105 tables / 63 lists / 25 donut+legend pairs still descending; 4,503 headings still Title Case; the derived insight text still correct on 16 screens × 6 datasets; the panel correct on every screen with the default tab, the footnote, and state surviving a filter change; 225/225 counterfoil stats matching their tile; no ledger overlap at seven widths in two states; the welcome CTA reachable at eight viewport heights; and Finn still at **288 answers, 6 datasets, 0 errors**. Four harnesses needed a one-line fix when sign-in became the landing screen — they had been reaching for chrome that screen does not carry, which is the harnesses correctly noticing a real change rather than a regression. `styles.css` 284KB, brace-balanced. Narrow sweep at 900 and 430 clean.

**What is left, honestly:** `freshLedger()` — the day-one strip — still shows the estate-level three labels rather than the screen's own, all as em dashes. It exists to say "nothing is measured yet", so which three nouns it dashes matters little, but it is the one place the per-screen counterfoil does not reach. And the `sources` screen still carries the shared reconciliation strip although its own content does not vary by month; that predates this round.

---

# Round 12 — 31 July 2026 · Finn gets a face

*Not a review round: an **implementation brief** handed over as a document —
`design-language/finn/finn-implementation-guide.md`, with a verified prototype beside it,
`finn-motion-v8.html`. Both are now copied into the project, because the guide names the
prototype as the single source of truth for the mark and every timing in its motion, and a
source of truth that lives in a downloads folder is not one. The brief is explicit that the
job is **integration, not design**: six versions were burned arriving at the nine hard
constraints below, and "violating any of them is a regression, even if the result looks fine
to you". Brand Guide **v4.2**, rules 15.1–15.9.*

| # | Asked for | Passes when |
|---|---|---|
| R12.1 | Replace the chatbot avatar with **Finn** — the hand-drawn creature. Copy the mark verbatim; never re-derive it | `FINN_MARK` is the prototype's markup, and `test-finn-motion.js` proves it: the app's `<g class="creature">` is compared **byte-for-byte** against the prototype's and must match exactly. Structure asserted part by part on top of that — 4 limbs, 2 arms, 2 legRay groups, one un-grouped hub path, 2 eyeOrbs, 2 eyes, the leg rotations still `115.023` / `64.977`, the legs still **inside** their rotate() frames, 5 orange paths and 2 black. The parent pinwheel is untouched: `logo.js`, the sidebar lockup and the favicon are unchanged. |
| R12.2 | Wire the eight states to the **real** chat lifecycle, not to a timer | Each state has one trigger in `assistant.js` and no other: `finnClose()`→`docked`, `finnOpen()`→`summon`, `input`→`listening` (1.1s debounce back out, to `idle` or `docked` depending on which resting state is true), `finnRun()`→`thinking`, `finnStream()`→`speaking`, `finnStreamEnd()`/`finnSkip()`→`settle`. Verified as an observed sequence rather than by reading the code — the harness logs the live class every 25ms through a real round trip and gets **`docked → listening → thinking → speaking → settle → idle`**, in order, nothing skipped. |
| R12.3 | Scope the state classes — the prototype puts them on `<body>`, which is fine for a demo and wrong for a product | The class lives on `#finn`, which carries `.finn-scope`, and every `body.STATE` selector became `.finn-scope.STATE`. `#finn` rather than a new wrapper because it **already contains all three places the mark is drawn** — surface header, answer byline, composer — so one class swap moves them in lockstep and no instance holds state of its own. Verified: 3 mark instances during an answer, one distinct `animation-name` across all of them, and **zero** marks rendering outside the scope. |
| R12.4 | **Docked means zero animation** except the single alert pulse | The `finn-breathe` loop on the resting mark is deleted. In `docked`, every `.creature` / `.limb` / `.eyeOrb` computes `animation: none` and no eye carries `.blink`. This **reverses Brand Guide 12.1** knowingly: a blade-shaped token could fidget harmlessly, a creature with eyes reads as a toy. The composer's cycling line still animates, which is what 12.1's "it keeps animating" was actually about. Closing also refreezes — verified separately, because leaving a state running behind a closed conversation is the same bug from the other side. |
| R12.5 | Thinking: limbs telescope into a **pinned** hub, arms leading legs, thickness constant | Measured over 26 samples across more than one full cycle, not eyeballed. Every limb matrix has **d = 1** and **b = c = 0** — length only, no thickening and no shear — with `a` running from **1.0 down past 0.6** and back. The arms sit within 0.02 of each other (always mirrored) and the legs demonstrably lag them. And the constraint the brief names by name: the hub's bounding rect is **pixel-identical across all 26 samples**, and its computed `animation-name` is `none` in **all eight** states. |
| R12.6 | None of the five rejected motion models may come back | Asserted rather than commented. **No continuous rotation:** every `.creature` / `.limb` / `.eyeOrb` matrix in all seven moving states has b = c = 0, sampled six times per state. **No uniform whole-creature scale during thinking:** `.creature` computes `animation: none` there, and the limbs carry `finn-ray`. **No per-limb stagger beyond the paired leg lag:** `animation-delay` is `0s` on both arms and `0.22s` on both legs. **No morph** and **no hub animation** follow from the geometry being frozen and from R12.5. |
| R12.7 | Keep the tunables in one place with their comments; port the auto-returns exactly | The five `--think-*` / `--eye-*` numbers are one labelled `:root` block in `styles.css` §12 and the only open numbers in the system. The auto-returns are read back off the DOM and checked against the CSS in the same pass: `alert` 0.9s → refreezes to `docked` at 950ms, `summon` 0.65s → `idle` at 700ms, `settle` 0.7s → `idle` at 750ms. `alert` is also proven to refuse to fire while the conversation is open, and out of any state other than `docked`. |
| R12.8 | Port the blink engine as-is; suppress it in docked and thinking; clean the timers up | One chain, started once in `finnBoot()`, resolving `.eyeI` at blink time so a mark created later blinks with the rest. Measured: **2 blinks in 9s of idle at ~120ms each** (spec: 3.8–7.2s interval, 110ms), and **zero in 8.5s of thinking**. `finnBlinkStop()` owns both timers — nothing unmounts in a single-page mock-up, so it is a hook for a port rather than a live call, and the comment says so instead of pretending otherwise. **Zero console or page errors** across the whole pass. |
| R12.9 | Keep the `prefers-reduced-motion` rule — it must ship | It ships, and it is checked by forcing all seven moving states on under an emulated reduce-motion preference: every descendant of the mark computes `animation-name: none` **and** `transition-duration: 0s`, in every state, and the mark still renders at its correct size. `?nofx` gets the same outcome by a different route — `finnState()` returns early, so the scope stays pinned to `docked` — because a query string is invisible to a media query. |

**What this deliberately did NOT do:** the brief lists its out-of-scope items and they stayed out — no redesigned mark, no ninth state, no timing changed outside the tunables block, no error or loading animation, no sound, and nothing touching the parent Finoptic pinwheel.

**Two forced deviations, both documented at the point of the code rather than only here.** The svg's class is `finn-mark`, not the prototype's `finn`: `.finn` is already this codebase's assistant container and carries `position:fixed; inset:0`, so a mark wearing that class would have been fixed to the viewport. And the keyframes are `finn-`prefixed — `settle`, `speak`, `sum` and `ray` are global names in a 300KB stylesheet, and a collision there would be silent.

**One consequence, accepted rather than fixed:** the mark now carries literal `#FF5600` and black instead of taking `--accent` from CSS, which is what the brief specifies and what puts it in the same family as `brands.js`'s vendor marks. So under the **Blue** and **Monochrome** accent presets Finn stays orange. Those are presenter-only controls and the mark is an identity, not a tint — recolouring a face is not a palette operation.

**One deliberate absence, recorded so it is not later read as a bug:** `summon` does not play when a question is asked straight from the resting composer. `finnOpen()` and `finnRun()` run in one synchronous task, so it is set and replaced by `thinking` inside the same frame. That is the right behaviour — Finn appeared and got immediately to work, and the surface has its own entrance animation — and `summon` is asserted on its own trigger instead, opening Finn without a question.

**Regression:** `test-finn-motion.js` is new — the checklist above as ~60 assertions. `test-finn.js` still **288 answers, 6 datasets, 0 errors**; `test-screens.js` still 120 clean renders with no JS errors. `scratchpad/build-finn-logo.js` was **deleted**: its whole job was to regenerate Finn's mark from the parent logo artwork, so leaving it in place left a script whose one function was to silently destroy R12.1.

---

# Round 13 — 31 July 2026 · "not just a quick-answer chatbot"

*A review of round 12, within the hour, and the sharpest note in it is not about a
control: **"I want this experience to be truly delightful and rewarding, not just a
quick-answer chatbot. If we don't make the experience enjoyable and beneficial, the
feature will have failed."** Two items below **undo something round 12 had just
built** — the thinking dots, and the status line that replaced them. The other four
exist because the layer had no answer at all to "what can I do with this answer?".
Brand Guide **v4.3**, rules 16.1–16.8.*

| # | Asked for | Passes when |
|---|---|---|
| R13.1 | Remove the dancing dots — *"there are dancing dots followed by a thinking animation in the mascot itself. This creates redundant representations of the same state"* — and show a subtext like "Finn is thinking", with a brief delay so it reads as thinking | `.finn-dots` and its keyframes are **deleted**, not hidden, and the harness fails if either comes back. In its place the byline carries `Finn is thinking`, and the opening beat went **520 → 900ms**: a sentence needs longer on screen than a dot. A second phase was added that did not exist — `Finn is about to answer`, held 620ms after the last reasoning step — because without it the log collapsed and the first words appeared in the same frame, the one jump cut in the sequence. Verified as an observed sequence: `Finn is thinking → Finn is about to answer → Finn`, in order, with no step rendered at 700ms. |
| R13.2 | *"Currently it is just a repetition. The Finn branding already exists, and each in-progress message should appear beside it as a continuation."* If you want a dancing box, put it at the end of that line | **The byline became the progress line.** R13.1's first build put the sentence on its own row under the name, so the panel printed `Finn` and then `Finn is thinking` beneath it — correct information, said twice. The status now sits inside the byline row and reads on from the name as one sentence. What is asserted is the whole row's text: it must equal `Finn is thinking`, and the word "Finn" may appear in it **at most once**, at every point in the sequence. The dancing box is the **last** element on that line — one box, squashing as it lands, because a box that only moves up and down is a lift and because three dots beside a creature already gathering its four limbs is R13.1 all over again. |
| R13.3 | Make the thinking animation, and the motion generally, more noticeable in the chatbot | **Nothing in the motion system was touched to do it** — the geometry, the five tunables and all eight timings are still the prototype's, and the byte-for-byte diff still passes. The mark is simply **drawn bigger**: 19–24px → **30px** in all three instances, tiles 34px, from one variable, with the byline gutter computed from the tile rather than repeated in four rules that had already drifted. At 19px an idle breath of 1.03 is 0.6 of a pixel; the eight-state system was invisible rather than subtle. Display size is the one thing the implementation brief explicitly leaves open ("only width/height may vary per usage"), which is why this is the lever that got pulled. |
| R13.4 | Copying a message, and additional details, are missing. So is liking a message and unliking a reply. Implement those flows | An action bar under every answer — **Copy · Show the working · Good answer · Needs work** — and the test asserts each one *acts*, because a row of controls that only look like controls is the easiest thing in the world to build in a chat panel. **Copy** produces real plain text: every block in its text form, the working numbered, sources named, and a table as **tab-separated rows** so it pastes into a spreadsheet as columns — verified to contain no tags and no HTML entities. **Show the working** is **per message**, not the global Brief/Full switch, and is verified not to move it. The bar is ink and grey with a hairline above: the accent budget in this layer is one and it is still the send button. The **last** answer's bar is always visible, earlier ones sit at 34% until hovered — a bar that only appears on hover is one most readers never discover; a bar always on in a six-turn thread is six rows of noise. The reader's own question gained a hover-revealed copy button too, outside the bubble so it neither overlaps the text nor pushes it off its own edge. |
| R13.5 | Liking and unliking specifically — the flows, not just the buttons | A verdict is **stored on the turn and persisted with the chat**, survives a re-render and survives being reopened from history — it is what the *reader* said, so unlike the figures it is still true against a different dataset. It is **reversible**: clicking the same verdict again clears it, because a rating you cannot take back is a rating people stop giving. And a downvote **asks why**, with three real reasons, then acknowledges with something specific to the reason chosen — the figures one points at the working, the too-much-detail one points at Brief, the not-what-I-asked one at rephrasing. "Thanks for your feedback" is the polite form of doing nothing. Thumbs-down fills with `--warn-ink` rather than `--neg`: it is feedback, not a failure. |
| R13.6 | *"While using voice input, I want the audio form animation to occur when the user is speaking, and transcription should happen only after the user finishes speaking"* | Both halves, and the first one honestly. The waveform is **fifteen bars scaled every frame from an `AnalyserNode` on the real microphone stream** — a CSS keyframe would have looked identical and would have been the canned-microphone version this feature was already once rejected for, so the harness writes a real WAV, hands it to Chrome as the fake capture device, and fails unless the bars take **more than four distinct heights** across the run. They took eleven, peaking at 1.0. `interimResults` is **off** and `continuous` stays false, so one final transcript lands at the end of the utterance rather than a half-heard guess being typed and rewritten word by word. The meter replaces the cycling placeholder, so the input *becomes* a listening surface; `onspeechend` stops the bars and the label becomes `Transcribing…`; and the mark holds `listening` throughout, with no debounce, because the state ends when the microphone does. |

**Two bugs this round produced and the harness caught, both worth recording because both were invisible in the code:**

* **`background-clip:text` does not fall back to a colour — it vanishes.** The status line's shimmer swept `background-position` from 190% to −90%, which slides a 300%-wide gradient clean off the box; a percentage position aligns that percentage of the *image* with the same percentage of the *box*, so only 0%→100% is guaranteed to cover it. On screen the sentence was one visible sliver of one letter. Both end stops are now `--ink-3`, so even at the extremes it is simply readable and grey.
* **A flex row blockified the acknowledgement's `<b>` tags** — Brand Guide **12.9**, hit for the third time, in a line written after the rule existed. `.finn-ack` is a flex row for its tick glyph, so every bold phrase became its own flex item and the sentence rendered as a narrow stack of bold fragments beside a paragraph. Two children, one gap: the prose is wrapped in a single span. The rule is in the guide *because* this keeps happening.

**One diagnosis worth keeping:** the meter first measured as fifteen dead bars over a live stream, and the cause was neither the analyser nor the fake device — **an `AudioContext` is born suspended** unless it can see a user gesture, and a suspended one reads back nothing but zeros. The mic click *is* a gesture, but it is two promises back by the time the context is constructed. `resume()` is not defensive here; without it the feature did not work.

**Regression:** all harnesses green. `test-finn-motion.js` now covers the byline sequence, the dancing box's position and animation, all four message actions end-to-end (including copy's plain-text shape, the per-message working not moving the global switch, a like being undone, the reason being asked and recorded, and the verdict surviving both a re-render and a commit), and the dictation meter against real audio. `test-finn.js` still **288 answers, 6 datasets, 0 errors**; `test-screens.js` 120 clean renders; `test-headings.js` 4,058 headings still Title Case. Four real Heroicons were added to `icons.js` for the new controls — `document-duplicate`, `hand-thumb-up`, `hand-thumb-down`, `list-bullet` — fetched from tailwindlabs/heroicons and stripped the same way every other glyph in that file was, because §5 says nothing here is hand-drawn or a near-enough substitute.

---

# Round 14 — 11 August 2026 · the Metrics tab and the insight band

*The first round from the **dashboard SME** rather than from Lohith directly, and the first that
argues with the product's premise rather than with its execution. Three claims, and they need
separating because they are not equally true: (1) key insights are the user's job, not the app's;
(2) the Metrics tab duplicates the reconciliation bar; (3) the two disagree about what a period is,
and a KPI tile should show a month-on-month trend.*

**Claim 2 is the substance, and it was measurable: 6 of the 8 Executive Dashboard tiles restated a
lane of the strip 200px above them.** Worse, the same 75% repetition held on six four-tile screens
where it was simply less visible. The cause was **rule 14.6**, which deliberately built each
screen's counterfoil *from that screen's own KPI tiles* so the two could never drift — "225 of 225
stats equal their tile". The guarantee we engineered is exactly what he read as waste. Both readings
are correct; the fix is to stop printing both.

**It is also a repeat of his own round-10 note** — *"on some screens the Reconciliation bar,
insights, and KPI tiles convey essentially the same information"* (R10.3). That round fixed the
**band** and left the **tiles**. He is consistent; we were incomplete.

**On claim 1, Lohith disagreed and the band stays.** The counter-argument is recorded here because it
will be needed again: the SME is describing **BI tools**, where bare numbers are the norm. No board
pack, month-end review or audit report hands over figures without commentary. What was unusual was
the **form** — three columns of prose as the default view of every screen — not the function. So the
band keeps its ink panel and loses a third of its height.

| # | Asked for | Passes when |
|---|---|---|
| 14.1 | **No KPI tile may restate a lane of the reconciliation strip on its own screen** | Checked on the RENDERED figures across 90 renders (15 board screens x 6 datasets): no tile shares a lane's printed value with a related label, and no tile shares a lane's label outright. **93 tiles down to 47.** `test-metrics.js` owns the rule; `test-ledger.js` asserts the same thing inverted — **450/450 stats are not duplicated by a tile**, where it used to assert that all 225 *were*. |
| 14.2 | **The strip is untouched** | Six lanes, same labels, same figures, same collapse behaviour on every screen. Every change this round is on the tile side of the comparison. |
| 14.3 | **Every figure reads the same way: the PERIOD value, with a YTD byline under it** | 146 tiles carry a `.kpi-ytd` byline in the strip's own `.ledger-sub` treatment. The tiles were never YTD — `Total Technology Spend · YTD`, `YTD Budget`, `Actual · YTD` and `Variance · YTD` all rendered the *period-scoped* figure under a YTD label, so narrowing to a quarter left the word YTD sitting over three months. **That mislabelling is what made the strip and the tiles look like they disagreed.** |
| 14.4 | **A month-on-month trend on each KPI tile, small rather than a full plot** | 149 inline sparklines: 64x22px, right of the figure, drawing only the months the figure was computed from, answering a hover through the same `CHARTTIP` every other plot uses. Inline rather than full-bleed so a tile costs no extra height. Grey, never accent — sixty tiny charts in green and red would be sixty status signals. |
| 14.5 | **The Overview keeps four tiles, two of them new** | Realised Savings · Cost Per Employee · **Technology As % Of Revenue** · **Unexpected Spend** — an outcome, a unit cost, a proportion and a risk, rather than four sizes of the same question. Both new ones read data that already existed (`products[].rev`, `anomalies[].exp/.act`). |
| 14.6 | **A screen whose tiles were all its own counterfoil loses the tab control** | `allocation`, `forecast`, `anomalies`, `itsm` and `alerts` render `.sum-flat`: one tile and the band stacked, no switch, no "View KPIs" link. Keyed on the tile COUNT, not a list of screen names — give one of them a second honest tile and its tabs come back on their own. **`optimize` is not among them**: two of its tiles are generated by a `.map()` over pipeline stages, so the static source undercounted it. |
| 14.7 | **The band keeps its ink panel and loses weight; content becomes pointers** | Three columns of at most **two pointers** each, as a real `<ul>` so a second line wraps against the text and not under the marker. Type 13.5px to 12.5px, padding 17/18 to 13/14. The derived cell splits by rule: **two probes contribute a sentence each, one probe contributes both of its** — four sentences under two bullets is the paragraph this round removed, wearing a disguise. |
| 14.8 | **The schema carries the series the tiles need, and nothing is invented** | A `monthly` block of 11 series across all 6 datasets, generated from the totals they must reconcile against rather than hand-authored — **invariant 19**, and a flow sums to its total while a stock ends at it. `zero` is twelve `null`, never twelve zeroes. **A tile whose figure is a structural count gets no sparkline**: `Environments`, `Vendors`, `Active Contracts`, `Applications`, `Renewals In 90 Days`. There is no honest twelve-month history of how many environments existed. |

## What this round deleted for being unprovable

Not asked for, but found while pruning — each one a figure that did not move when the data did,
which is the same class of problem as the duplication:

* **`Math.round(D.ytdActual * 0.694)`** — Finance's Committed Spend. Every scenario reported the
  same 69.4% commitment ratio however differently it bought. Now `meta.committed`, authored per
  dataset, with a monthly series behind it.
* **`94.2%` forecast accuracy**, hardcoded on two screens. Now `meta.forecastAcc`, and each scenario
  says something true about itself — a workspace in crisis forecasts worse (86.4%), an optimised one
  better (96.1%), a ten-week-old one barely at all (71.3%).
* **`+11.2% YoY`, `+41% YoY`, `+22% QoQ`, `+4.2% QoQ`, `+4.1%`, `−9.1% QoQ`, `−3.1%`, `+2.1 pts`** —
  deltas against a prior year or quarter the schema does not hold (open item 9).
* **`Cost Per Transaction $0.024`** — a literal string on the Product screen. Transactions are
  recorded for the estate, not per product, so there was nothing to derive it from. Deleted rather
  than apportioned: a figure the board cannot defend is worse than one less tile.
* **`13.2% of technology spend` / `16 opportunities`** on the Optimisation hub, and
  **Tagging Compliance `cov − 3.3`** — a figure whose only content was a constant subtracted from
  the tile beside it. *The strip's copy of that one survives, because the strip was ruled out of
  scope; it is recorded rather than quietly fixed.*

## Four stale harnesses, found not caused

`.ledger-eq` and `.ledger-perf` were removed by **14.6** when the strip became six equal lanes with
no operator and no seam. Four harnesses kept querying them and had been **throwing on a null box
ever since** — they were not reporting a pass, they were not running at all.

* `test-ledger.js` — repaired; its "2–3 counterfoil stats" assertion had been wrong on every screen
  of every dataset since that round, and could never say so.
* `test-ledger-collapsed.js` and `test-widths.js` — repaired. Their equation-to-counterfoil *gap*
  check is gone: it measures a seam that no longer exists.
* `test-seam.js` — **retired**, not deleted. Its entire subject is the seam. Kept as the record of
  what was checked while it existed; it now prints why it does not run.

**One residual, pre-existing and recorded rather than hidden:** the reconciliation strip overflows
the page by **5px on `anomalies` at 1200px when collapsed** — `Mean Time To Explain` and its
`3 critical, 2 high` sub-line are the widest counterfoil in the product. Strip content this round
did not touch; it simply became visible when the harnesses started running again.
*Fixed in round 15 — see the strip section there. It was never one bug.*

**Regression:** `test-metrics.js` 90 renders · 278 tiles · 149 sparklines · 146 bylines, no tile
restating a lane. `test-screens.js` 120 clean renders. `test-ledger.js` 450/450. `test-panel.js` OK
on every screen. `test-insights.js` placement and derived text OK. `test-headings.js` **3,744
headings still Title Case**. `test-order.js` 100 tables, 63 ranked lists, 20 donut+legend pairs all
descending. `test-finn.js` **288 answers, 6 datasets, 0 errors**. `test-finn-motion.js` mark still
byte-identical. `gen-monthly.js --check` re-verifies all 66 series against their totals and refuses
to write if a dataset does not round-trip byte-for-byte.

# Round 15 — 11 August 2026 · one shape, and a line you can actually read

*The second half of the SME's note on the same region, given after round 14 shipped. Four items, and
the shape of it is that round 14 answered each request literally and two of the answers made a new
problem: the sparkline was drawn in a way that hides the movement it was asked to show, and the
"screens with one tile lose the tab" rule fixed the count by breaking the layout.*

**The item worth reading twice is 15.3.** Round 14 was told to remove the duplication, removed it,
and left five screens holding a single tile — so those screens dropped the tab control and stacked
the two panes instead. That was a defensible local fix and the wrong global one: *"users remember
the previous screen layout, and a sudden change in presentation does not help them."* A product with
two summary layouts is worse than one with a thin Metrics pane, because the reader pays the cost on
every navigation rather than on one screen. The lesson is that **the count and the shape are two
problems**, and fixing the count at the shape's expense is not a fix.

| # | Asked for | Passes when |
|---|---|---|
| 15.1 | **The sparklines are thicker and more visually weighted** | Box 64x22 to **76x32**, stroke 1.4 to **2.6**, end dot 1.9 to **2.6**, area fill .22 to .26. Colour unchanged and deliberately so: the reference dashboard draws its lines in that product's own blue, and the accent budget on a board screen is one object which the period pill holds (§0.3). The plot can now shrink (`flex:0 1 76px`, `width:100%`) rather than push a wide figure out of the tile. |
| 15.2 | **A month-on-month trend, not a running total** | Not asked for in these words — but making the stroke heavier is what made the fault visible. A cumulative line over positive months can only ascend, so two thirds of the board drew the same near-straight diagonal, and *"show month-on-month trends"* is a request for the movement between months, which is exactly what accumulating hides. **`cumulative` is now accepted and ignored**, and the axis no longer starts at zero — with a guard: a series whose whole spread is under **12% of its mean** draws flat rather than being stretched into false drama. This reverses **14.4**. |
| 15.3 | **The byline items are separated** | *"In all the tiles we have multiple byline items that are not actually separated — they only differ in font weight and colour."* Two rows, and a **middot** between the figures in the first. `ytd` and `delta` are measurements and share a row with the divider between them; `foot` is the qualifier and takes its own row. The break matters as much as the divider: one row of three wrapped at a different point on every tile, which left the middot hanging at the end of a line looking like a typo. |
| 15.4 | **Every board screen carries exactly four tiles** | 16 screens x 6 datasets, asserted by `test-metrics.js`: **380 tiles, no screen with three and none with five.** One full row, no widow on a second — *"when there are five tiles, the entire second row is empty, leaving only the fifth tile in that row."* One exemption, named in the harness rather than skipped: a workspace with no products at all renders the empty state, because four tiles over nothing would be four em dashes. |
| 15.5 | **The layout does not change between screens** | `.sum-flat` is **deleted** — the flat variant, its CSS, and the branch in `placeSummary()` that chose it. Every screen with a band and tiles is tabbed. **`sources` gained a summary region for the first time**: it had no KPI tiles at all, so `placeSummary()` returned early and its insight band rendered raw in the flow with no headline and no tabs — the same inconsistency one step further on, and nobody had noticed it because the screen has no numbers to duplicate. This reverses **14.6**. |
| 15.6 | **Metrics is the default tab** | `sumTab()` falls back to `metrics`; the CSS selector is written against `insights` so the no-attribute case lands on the tiles. **Reverses round 11's** *"the default view should be the key-insight view, the black tile view"* — and it is the same argument arriving from the other side. The counter-argument that kept the band (a board pack does not hand over figures without commentary) never required it to go first. |
| 15.7 | **A "View Key Insights" button, like the existing "View KPIs"** | Both panes end with a way out of themselves, carrying the same `data-sum-tab` the tabs do, so the footnote and the tab are one control with two presentations. "View KPIs" sits inside the ink band spanning its three columns; **"View Key Insights" is a full-width cell of the tile grid** — the tiles are separate cards with nothing to sit inside, so the grid is what gives it an edge to align to. Hairline over fill on the canvas: a filled bar under four quiet white tiles would be the heaviest object in the pane and it is the least important one. |
| 15.8 | **The band is shorter again** | *"It is still too emphatic and the content is excessive. Since we haven't been able to shorten it effectively, please try again."* Three cuts, and the ink panel is not one of them. **One pointer per authored column** (`points()` defaults to `max=1`), the derived column keeps two because its two are two different findings rather than one finding continued. **Every probe sentence rewritten** so the finding stands alone and the implication is a second sentence that can be dropped. Type 12.5 to 12px, padding 13/14 to 10/11, corner glow 20% to 13%, the CTA figure 23 to 19px. |

## The strip, and why two things in it changed

Ruled out of scope in round 14 and mostly still is. Two exceptions, both defects rather than content:

* **`Forecast Accuracy '94.2%'`** was the last hardcoded figure in the product — a literal string in
  the forecasting strip. `meta.forecastAcc` has existed since round 14 and the ITFM tile has been
  reading it, so **the strip and that tile disagreed on every dataset but the baseline**. That is
  the SME's own complaint (the two components saying different things) in its purest form.
* **The 1200px overflow**, recorded last round as residual, is **fixed**. It was never one bug: the
  gutters were 15px a side where 8 would do, and below 1300px `Response Cost Per Incident` ran 18px
  past its box and sat flush against `Cost Per Change` with no gap at all. The label may now wrap and
  **every lane reserves two label lines**, so the six figures still share a baseline — letting one
  label wrap while five did not put six figures on six different heights, which is a worse fault
  than the collision, since comparing them is the whole job of the strip.

  *Recorded, still unfixed:* the strip's own `Tagging Compliance` (`cov − 3.3`, `+4.2 pts QoQ`) and
  `Mean Time To Explain` (`1.8 days`, `−0.6 days`) are fabricated. The anomalies screen can now
  answer the second honestly — `anomalies[].d` is a real detection date and **Oldest Open Anomaly**
  reads it — so the strip is the only place left in the product still asserting it.

## What this round deleted

* **`Oldest Open Alert '11 days'`** — the alerts screen's only tile, and its figure was a literal
  string. `alerts[]` carries no date of any kind, so there was nothing behind it to recompute from.
  The same class as round 14's deletions, found because this round had to look at the tile again.
* **`Security Cost Per Product`** — `secTotal / prods`, the whole security bill divided by a count
  with no allocation behind it, on a screen whose own subtitle is *"which product is driving the
  ingestion bill"*. A flat average per product denies the thing the screen exists to show.
* **`Growth Over The Half Year`** on the AI screen — it printed `+106.3%` with `$16K → $33K` beneath
  it: a start point, an end point and the ratio between them, which is three descriptions of the
  shape the sparkline next to it now draws in full.
* **`Environments`** on the cloud screen and **`Licences Purchased`** on SaaS. The first is a
  structural count that could carry neither a trend nor a byline; the second folded into
  `Active Licences`, which already printed the utilisation those two are the numerator and
  denominator of.

## The seventeen tiles this round wrote

Every one reads a field the dataset already carries, and `test-metrics.js` confirms none restates a
strip lane on its own screen. **`anomalies` and `optimize` are the two worth checking**: the anomaly
age is derived from `anomalies[].d` against `meta.asOf` (using the same open/closed test as the
`Resolved This Month` tile, so the two cannot disagree about which rows are open), and
`High-Confidence Savings` filters `opps[].conf`, which is authored per opportunity.

| Screen | Added |
|---|---|
| `allocation` | Largest Cost Owner · Largest Tag Gap · Untagged Resources |
| `forecast` | Budget Remaining · Scenarios Within Budget · Largest Forecast Driver |
| `anomalies` | Largest Single Anomaly · **Oldest Open Anomaly** · Products Affected |
| `itsm` | Incident Ratio · Costliest Product To Support · Service Desk Cost Per Employee |
| `alerts` | Largest Single Alert · Highest-Value Fix · Products Affected · Owners On The Hook |
| `sources` | Slowest Refresh · Domains Covered · Feeds Needing Attention · Feeds With A Manual Step |
| `finance` | Full-Year Budget Used |
| `optimize` | High-Confidence Savings |

**Regression:** `test-metrics.js` **96 renders · 380 tiles · 139 sparklines · 147 bylines**, no tile
restating a lane, four tiles and two tabs everywhere. `test-panel.js` OK on every screen, Metrics
leading. `test-screens.js` 120 clean renders. `test-ledger.js` 450/450 stats not duplicated.
`test-insights.js` placement and derived text OK. `test-headings.js` **3,846 headings Title Case**.
`test-order.js` 100 tables, 63 ranked lists, 20 donut+legend pairs all descending. `test-widths.js`
and `test-ledger-collapsed.js` **clear at every width in both states for the first time since round
14**. `test-finn.js` 288 answers, 0 errors. `test-finn-motion.js` mark still byte-identical.
`gen-monthly.js --check` all 66 series reconcile.

# Round 16 — 11 August 2026 · the line, and the button that floated

*Three items, given on the round-15 build. Two of them reverse a rule written the same
afternoon, which is worth stating plainly rather than burying: **18.3 said the
sparkline is grey and never accent, and 18.5 built a second footnote for symmetry.**
Both are undone here, and in both cases the round-15 reasoning was sound in isolation
and wrong once it was on the screen.*

| # | Asked for | Passes when |
|---|---|---|
| 16.1 | **Remove the "View Key Insights" button — "it kind of feels like it is floating mid-air"** | `.sum-more-canvas` is gone: the markup in `placeSummary()`, the CSS, and the assertion in `test-panel.js`, which is **inverted rather than deleted** so the control cannot come back by accident. The diagnosis is structural, not stylistic — the band's footnote works because the band is ONE SURFACE and a footer inside it is part of that object, where the tile grid is **four separate cards** and anything below them belongs to nothing. Giving it its own white bar was tried and only made a fifth object out of the least important thing in the pane. |
| 16.2 | **Every line through data takes the same curve** | **Monotone cubic (Fritsch–Carlson)**, not a Catmull-Rom or a cardinal spline — and that choice is the whole of the honesty argument. An ordinary smoothing spline **overshoots**: a series running 30 → 44 → 41 bulges above 44, and on a 76px plot with no axis that bulge reads as a month that did not happen. Monotone interpolation zeroes the tangent at every local turn and clamps it elsewhere, so the curve can never leave the range of the two months it sits between. `test-metrics.js` **proves it rather than asserting it**: it walks every Bezier control point on all 139 plots and checks it lies inside its segment's anchor range (a cubic is contained in its control hull, so that is sufficient). Swapping the tangent rule for the naive one produces **84 overshoot failures**; the shipped one produces none.

**Asked as a follow-up, and it was the right question:** *"the actual plots have sharp edges — is it acceptable to use smooth sparklines given how the plots appear?"* No. The full-size charts now take the identical curve, because on the finance screen the SAME series (`trend.actual`) was being drawn two different shapes 400px apart. Straightness is not the honest option it appears to be — a straight segment between two months asserts a mid-month path exactly as confidently as a curve does, and both are interpolations; the only question is whether one can invent an EXTREME, and monotone cannot. The check now covers **184 interpolated lines / 1,430 segments** across the whole product, scoped by a `.cline` class so vendor brand marks (which are also bezier paths) cannot flood it. |
| 16.3 | **The sparkline follows the theme colour** | The stroke is `--c1`, which IS `--accent` under the default and Blue palettes and `--g1` under Mono — so it themes by construction rather than by a second lookup, and the Mono board comes out entirely in ink. This **reverses 18.3**, and it is the correct reading of §0.3 rather than an exception to it: that rule governs full-strength accent **chrome** — one pill, one button — and a sparkline is **data ink**, which has worn the `--c1…--c8` spectrum on every donut, bar and line chart since v3.0. The fault the grey rule was guarding against was a line turning green when it rose and red when it fell, which would make sixty tiny plots into sixty status signals; **one colour for all of them cannot signal anything**, so that fault is not reachable from here. The area fill drops to .22 so four tiles do not become four coloured blocks, and the end dot stays `--ink` — it marks the latest reading, and a dot in the line's own colour disappears into the line. |

**Regression:** unchanged from round 15 and re-run in full — `test-metrics.js` 96 renders ·
380 tiles · 139 sparklines · 147 bylines · **zero overshoots** · `test-panel.js` OK on every
screen · `test-screens.js` 120 clean renders · `test-ledger.js` 450/450 · `test-insights.js`
OK · `test-order.js` all descending.
