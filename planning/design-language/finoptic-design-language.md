# Finoptic Brand Guide

**Status:** Locked v4.6 — 11 August 2026. Supersedes v4.5 and every version before it. This is the one-stop visual-design reference for every screen, every session, every agent working on Finoptic's look. If it's not written here, it isn't decided yet — don't infer a rule from a screenshot or from trakit's own docs.
**Phase:** [`../02-design-language.md`](../02-design-language.md) · **Navigator:** [`../00-overview.md`](../00-overview.md) · **History/decisions timeline:** `../../status.md` (this file states current rules only, not how we got here)
**Reference material:** [`reference/inspiration/reference-commentary.md`](reference/inspiration/reference-commentary.md) — **read this with the guide, not after it.** It is Lohith's own reading of the dashboards he chose, and its eleven-point "extracted DNA" list is the brief v3.0 was built against, and v3.1 trimmed it back where v3.0 over-applied it. Treat it as authoritative for Finoptic, with **two deliberate divergences, both of them the same shape — a reference move Lohith rejected on sight once he saw it applied**: DNA point 6 asks for dimmed decimals on big money figures (§1), and DNA point 2's hatched *icon fills* (Aeros) were built in v3.0 and disliked (§3). In both cases the later instruction wins. The rest of [`reference/`](reference/) is trakit's own design docs, copied here as precedent. Finoptic shares trakit's typefaces and, since v2.0, its elevation and sidebar patterns by deliberate choice; that material is inspiration to weigh, not a spec to copy.

Two things still open: the name "Finoptic" is pending a trademark/domain check (`../01-branding-and-naming.md`), and the positioning line below is a first draft.

**Positioning (draft):** *Finoptic gives you clear, precise visibility into everything your company spends on technology — so you always know where the money is going, and what to do about it.*

---

## What v4.6 changed, and why

*Three rules, and **two of them reverse a v4.5 rule written the same afternoon**. That is
worth stating rather than burying: v4.5's reasoning was sound in isolation and wrong
once it was on the screen, which is the same failure mode v4.5 itself diagnosed in
v4.4. **Read this table before v4.5's.***

| # | Rule | Why, and what it reverses |
|---|---|---|
| 19.1 | **A SPARKLINE IS DRAWN IN `--c1`, THE THEME'S OWN FIRST DATA SLOT.** 🚫 Still never a status colour — never green up, never red down. | REVERSES **18.3's** "grey, never accent". *"They are all grey, irrelevant to whatever theme colour we selected."* Correct, and the grey rule was a misreading of §0.3: that budget governs full-strength accent **chrome** — one pill, one button — and a sparkline is **DATA INK**, which has worn the `--c1…--c8` spectrum on every donut, bar and line chart since v3.0. `--c1` is `--accent` under the default and Blue palettes and `--g1` under Mono, so it themes by construction. The fault the grey rule guarded against was a line turning green when it rose and red when it fell; **one colour on all sixty cannot signal anything**, so that fault is unreachable from here. Area fill stays faint (.22 → 0) and the end dot stays `--ink` — a dot in the line's own colour disappears into the line. |
| 19.2 | **EVERY LINE THROUGH DATA IN THE PRODUCT TAKES THE SAME CURVE — monotone cubic (Fritsch–Carlson), never Catmull-Rom or a cardinal spline.** Sparkline, trend chart, forecast baseline and both edges of the confidence band. 🚫 No smoothing that can overshoot a point. 🚫 No two line treatments in one product. | *"What are your views on making them smooth and curved instead of these sharp lines?"* — yes, but only the kind that cannot lie. An ordinary smoothing spline bulges past a local peak, and on a 76px plot with **no axis to check it against** that bulge reads as a value. Monotone interpolation zeroes the tangent at each turn and clamps it elsewhere, so every high and low in the drawing is a month in the data.

**It applies to the FULL-SIZE plots too, and that is the point of the rule.** A curved sparkline above a sharp-cornered trend chart is two line treatments in one product, and on the finance screen it was literally the same series — `trend.actual` — drawn two different shapes 400px apart. Straightness is not the honest option it looks like: a straight segment between two months asserts a path through mid-month just as confidently as a curve does, and nobody believes spend rose linearly through August either. Both are interpolations; the only question is whether one can invent an EXTREME, and monotone cannot. The dots stay exactly where they were, so the chart still separates a month from the line between two of them. `test-metrics.js` walks every Bezier control point on all **184 interpolated lines — 1,430 segments** — rather than trusting it: swap the tangent rule for the naive one and **84 overshoots** appear. |
| 19.3 | **A FOOTNOTE OUT OF A PANE BELONGS TO A SURFACE, OR IT DOES NOT EXIST.** The ink band gets one; the tile grid does not. | REVERSES **18.5's** second footnote. *"It kind of feels like it is floating mid-air."* — and the reason is structural, not stylistic: the band is ONE surface, so a footer inside it is part of an object, where four separate cards give a control below them nothing to belong to. Its own white bar was tried and only made a fifth object out of the least important thing in the pane. **The asymmetry that leaves is earned**: a footnote is for a pane you read to the END and finish far from the tabs — three columns of prose — not for four figures scanned in a second with the tab control still in view. |

---

## What v4.5 changed, and why

*The second half of the same review, and the version that has to be read against
v4.4 rather than after it: **four of its six rules reverse something v4.4 locked the
same week.** That is not churn. v4.4 answered each request literally and two of the
literal answers made a new problem — a sparkline drawn so that it hides the movement
it was asked to show, and a "screens with one tile lose the tab" rule that fixed the
count by breaking the layout.*

*The rule worth internalising is **18.1**. Round 14 removed the duplication as asked,
left five screens holding one tile, and dropped the tab control on those five so a
two-tab region would not have a one-card pane. Locally correct; globally wrong —
"users remember the previous screen layout, and a sudden change in presentation does
not help them." **The count and the shape are two problems**, and paying for one with
the other is not a fix. **v4.6 reverses two of the six rules below — read its table first, then this one.***

| # | Rule | Why, and what it reverses |
|---|---|---|
| 18.1 | **THE SUMMARY REGION HAS ONE SHAPE ON EVERY SCREEN: a headline, two tabs, and a Metrics pane of EXACTLY FOUR TILES.** 🚫 No flat variant. 🚫 No screen with three tiles or five. A screen that cannot field four honest tiles is a screen whose tiles need rethinking, not a screen that gets a different layout. | REVERSES **17.5** outright, `.sum-flat` and all. *"The number of tiles varies widely; some pages contain only one, and in those cases Key Insights and the Metrics are displayed one below the other instead of as a tabbed view, which results in poor UI/UX."* Four is what makes the row exactly full — five left a widow alone on a second row, which was the same complaint from the other end. `sources` gained a region for the first time: with no tiles at all `placeSummary()` returned early and its band rendered raw in the flow, which is the same inconsistency one step further on. Enforced by `test-metrics.js` and `test-panel.js` on 16 screens × 6 datasets. One exemption, NAMED in the harness rather than skipped: a workspace with no products renders the empty state, because four tiles over nothing would be four em dashes. |
| 18.2 | **A SPARKLINE DRAWS THE MONTHS, NOT THE RUNNING TOTAL — and its axis is the series' own range, not zero.** Guard: a series whose spread is under **12% of its mean** draws flat rather than being stretched to fill the box. | REVERSES **17.4's** `cumulative`. A running total of positive months can only ascend, so two thirds of the board drew the same near-straight diagonal, and a shape identical on sixty tiles carries no information. It also was never what was asked for: *"show MONTH-ON-MONTH trends"* is a request for the movement between months, and accumulating is precisely the transform that hides it. v4.4's objection — that a line ending at $9K sits oddly under a figure of $96K — is answered rather than ignored: a sparkline has no axis and never claimed its last point equals the figure, and this one answers a hover with the month and its value. **A shape nobody can read is a worse trade than a scale nobody stated.** |
| 18.3 | **THE SPARKLINE IS DRAWN HEAVY: 76×32px, 2.6px stroke, 2.6px end dot — and still GREY.** It may shrink beside a wide figure; it may not push one out of the tile. | *"They are currently very small and barely noticeable; they should be thicker and more prominent."* The reference dashboard sent with that note draws its lines in that product's own blue, and that is the one part of it Finoptic cannot copy — §0.3 gives a board screen one full-strength accent object and the period pill holds it. **Weight is the honest way to make a grey line carry**, and it keeps the line from ever reading as a status signal. Width grew least of the three because width is the dimension the tile cannot spare; height and stroke are free. |
| 18.4 | **A TILE'S BYLINE IS TWO ROWS: the measurements, divided by a middot; then the qualifier, on its own line.** The divider is an `::after` on the item before it, never a separate element. | *"In all the tiles we have multiple byline items that are not actually separated — they only differ in font weight and colour."* The middot is the divider the product already uses between a noun and its qualifier ("Persona · ITFM", "Security Spend · Aug–Jun"), so the byline reads in the same idiom as the headline above it. **The break matters as much as the divider**: one row of three wrapped at a different point on every tile, which left the middot hanging at the end of a line looking like a typo. Two short rows of like with like cannot wrap. The `::after` is why — a divider that was its own flex item could wrap to the front of the second line and open it with a dot. |
| 18.5 | **METRICS IS THE PANE THE READER LANDS ON, and each pane ends with a footnote into the other.** "View KPIs" inside the ink band; "View Key Insights" as a full-width cell of the tile grid. Both carry `data-sum-tab` — the footnote and the tab are one control with two presentations. | REVERSES **round 11's** *"the default view should be the key-insight view, the black tile view"*, and it is the same argument arriving from the other side. The SME's position is that reading the numbers is the reader's job; the counter-argument that kept the band — no board pack hands over figures without commentary — never required it to go FIRST. **Landing on the figures and offering the commentary one control away concedes the order without conceding the feature.** The canvas footnote is a hairline rather than a fill: under four quiet white tiles a filled bar would be the heaviest object in the pane and it is the least important one. |
| 18.6 | **ONE POINTER PER AUTHORED BAND COLUMN. Only the derived column may carry two, and only because its two are two different findings.** | REVERSES **17.6's** "at most two per column" and its two-sentences-from-one-probe rule. *"It is still too emphatic and the content is excessive. Since we haven't been able to shorten it effectively, please try again."* A list of two sentences is a paragraph with a bullet in the middle of it. Every probe sentence was rewritten so the **finding stands alone** and the implication is a second sentence that can be dropped without loss. The panel is still INK, still bleeding accent, still lifted — the surface has never been the lever and is not now; what came off is type (12.5→12), padding (13/14→10/11), the corner glow (20%→13%) and, most of all, the fact that the band is no longer what opens (18.5). |

---

## What v4.4 changed, and why

*The first round about the BOARD since v4.1, and the first from the dashboard SME
rather than from Lohith. It is the mirror image of v4.1: that version collapsed the
KPI tiles and the insight band into one tabbed region to save space, and this one
asks what is inside the tabs. The answer, on the Executive Dashboard, was that **six
of the eight Metrics tiles restated a lane of the reconciliation strip 200px above
them** — and the same 75% repetition held on six four-tile screens where it was
simply less visible.*

*The cause is **14.6**, which is why this is a reversal rather than a bug fix: that
rule built each screen's counterfoil FROM that screen's own KPI tiles, deliberately,
so the two could never drift — "225 of 225 stats equal their tile". The guarantee we
engineered is precisely what he read as waste. **v4.5 reverses four of the eight rules
below — read its table first, then this one.***

| # | Rule | Why, and what it reverses |
|---|---|---|
| 17.1 | **NO KPI TILE MAY RESTATE A LANE OF THE RECONCILIATION STRIP ON ITS OWN SCREEN.** Same printed figure or same label, either one is a repeat. A COMPLEMENT is not — `Unallocated $87K` beside `Allocated 94.6%` are two figures answering two questions; `Variance +$120K` beside `Budget Variance +8.0%` was one figure in two units under one name. | REVERSES **14.6's verification**, though not its reasoning: *"the KPIs displayed there are duplicated in the reconciliation bar. Repeating the same information adds no value."* The stats are still PASSED IN by the screen from its own locals, which is what 14.6 was protecting — but there is no longer a tile to check them against, so the drift guard is now the dataset invariants rather than a duplicate on the same screen. **93 tiles became 47.** Enforced by `test-metrics.js`; `test-ledger.js` asserts the inverse, 450/450. |
| 17.2 | **THE STRIP IS NOT THE PLACE THIS GETS FIXED.** Six lanes, unchanged, on every screen. Every change is on the tile side. | The strip is the one component on all twenty screens and the thing the product's whole claim rests on — "the numbers reconcile". Fixing an overlap by editing the shared component would have moved the problem into the place with the widest blast radius, and the reviewer's complaint was never that the strip was wrong. |
| 17.3 | **EVERY FIGURE IN THE PRODUCT READS THE SAME WAY: the PERIOD value, with a YTD byline beneath it.** The byline takes `.ledger-sub`'s exact treatment — full ink at 500 against the foot's grey. 🚫 No tile label may contain "YTD" as a claim about a figure that moves with the period pill. | *"The reconciliation bar shows YTD values where possible, while the matrix tab shows varied numbers for the same KPIs, which is inconsistent."* Half of that was a real BUG: `Total Technology Spend · YTD`, `YTD Budget`, `Actual · YTD` and `Variance · YTD` rendered the period-scoped figure under a YTD label, so narrowing to a quarter left the word YTD over three months. When the period is the full year the byline restates the figure, and that is correct rather than redundant — it is what the strip has always done, and a byline that appears and disappears with a filter is worse than one briefly identical. |
| 17.4 | **A KPI TILE CARRIES ITS OWN TREND, INLINE AND GREY.** 64×22px, right of the figure, drawing ONLY the months the figure was computed from, answering a hover through the same `CHARTTIP` as every other plot. 🚫 Never accent, never a status colour. 🚫 No sparkline on a structural count. | *"Instead of only showing selected months, show month-on-month trends for each KPI tile, in a small area rather than a full-size graph."* **Inline rather than full-bleed** is what let it land on every tile at once: a band under the figure costs ~35px, and 47 tiles of that is a board a third longer. **Grey** because the accent budget on a board screen is one object and the period pill holds it (§0.3) — sixty tiny charts in green and red would be sixty status signals, the fault that took the icon tiles' colour away in v3.3. A first version drew all twelve months with the unselected ones dimmed, for context, and it was wrong in the one way this feature cannot afford: a year of movement above a quarter's number. |
| 17.5 | **A SCREEN WHOSE TILES WERE ALL ITS OWN COUNTERFOIL LOSES THE TAB CONTROL.** `.sum-flat`: tiles and band stacked, no switch, no "View KPIs" footnote. Keyed on the tile COUNT, never a list of screen names. | Extends **14.3's** own principle — "a two-tab control with one empty tab is worse than no control" — to the case it did not anticipate, a Metrics pane holding a single card. Five screens take it: `allocation`, `forecast`, `anomalies`, `itsm`, `alerts`. Keyed on the count so the rule maintains itself: give one of them a second honest tile and its tabs return without an edit. The band still sits BELOW the tiles there (13.4) — the tabbed version satisfies that by hiding a pane, the flat one by ordering them. |
| 17.6 | **THE INSIGHT BAND IS POINTERS, NOT PROSE — at most two per column, as a real `<ul>`.** It stays the one INK panel on the screen, with its accent bleed and its lift. Type steps to 12.5px, padding to 13/14, and it loses about a third of its height. | The SME's position was that insights are the user's job and no other dashboard does this. That is true of **BI tools** and false of **management reporting** — no board pack or month-end review hands over figures without commentary — so the function stays and the FORM changes: *"I would like it to visually get a lesser weight, but I don't want to change it too much. I would still want it to be an ink panel, but the content should be pointers of text, a maximum of two pointers each."* A paragraph reads heavy because it is a block of text, not because of its colour, which is why the weight came off the type and not off the surface. The derived cell splits by rule — two probes give a sentence each, one probe gives both of its — because four sentences under two bullets is the paragraph this rule removed wearing a disguise. |
| 17.7 | **A FIGURE THAT DOES NOT MOVE WHEN THE DATA DOES IS NOT A FIGURE.** No hardcoded ratio, no delta against a period the schema does not hold. | Not asked for, found while pruning, and the same class of defect as the duplication: `Math.round(D.ytdActual * 0.694)` gave every scenario an identical 69.4% commitment ratio; `94.2%` forecast accuracy was hardcoded on two screens; eight YoY/QoQ deltas measured against a prior year the schema has never had (open item 9); `Cost Per Transaction` was the literal string `$0.024`. The first two became `meta.committed` and `meta.forecastAcc` with monthly series behind them. The rest were **deleted rather than apportioned** — a figure the board cannot defend is worse than one fewer tile. |
| 17.8 | **A SPARKLINE NEEDS AN AUTHORED SERIES, AND A FLOW IS NOT A STOCK.** `monthly` in the schema: a flow sums to its total, a stock ends at it (invariant 19). `zero` is twelve `null`, never twelve zeroes. | Getting the two backwards does not throw — it silently prints a figure eleven times too large, which is why they are separate lists in `core.js` rather than inferred. Eleven series across six datasets were **generated from the totals they must reconcile against** rather than hand-authored, because 66 arrays that each have to balance is 66 chances to be quietly $3K light. And a tile whose figure is a structural count — `Environments`, `Vendors`, `Active Contracts` — gets NO sparkline: there is no honest twelve-month history of how many environments existed, and authoring one would be the invented number this whole guide exists to prevent. |

---

## What v4.3 changed, and why

*A review of v4.2, within the hour. **Two of these six reverse something v4.2 itself
had just built** — the thinking dots are deleted and the status line that replaced
them is folded into the byline — and the other four exist because the layer had no
answer to *"what can I do with this?"*: **"I want this experience to be truly
delightful and rewarding, not just a quick-answer chatbot. If we don't make the
experience enjoyable and beneficial, the feature will have failed."* Read this table
before v4.2's.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 16.1 | **ONE STATE, ONE REPRESENTATION.** No progress indicator may say the same thing the mark is already saying. | REVERSES the three bouncing dots outright: *"there are dancing dots followed by a thinking animation in the mascot itself. This creates redundant representations of the same state."* The mark's four limbs telescoping into its hub (15.5) already say *working*, in the same 40px, better. The dots are deleted, not hidden — and this generalises: the moment two things in this layer animate the same fact, one of them is the wrong one. |
| 16.2 | **THE BYLINE IS THE PROGRESS LINE.** The name is stated once and the status runs on from it — `Finn` `is thinking`, then `is about to answer`, on one row, clearing when the answer starts. 🚫 Never a status line under a name label. | REVERSES the status line v4.2 put on its own row, which printed `Finn` and then `Finn is thinking` directly beneath it: *"Currently it is just a repetition. The Finn branding already exists, and each in-progress message should appear beside it as a continuation."* What the sentence adds over the mark is WHICH thing is happening — information the mark cannot carry — so it earns its place only by not repeating the name. The words shimmer via a gradient swept through the text, not an opacity pulse, because a blinking sentence is harder to read than a still one; and the sweep range is **100%→0%**, since any `background-position` outside that slides the image off the box and `background-clip:text` does not fall back to a colour — it vanishes. |
| 16.3 | **The dancing box goes at the END of that line.** One box, keeping time, squashing as it lands. 🚫 Not three of them. | *"If you want a dancing box, add it at the end of this line."* One box is a metronome for the sentence; three beside a creature already gathering its limbs is 16.1 all over again. It squashes on landing because a box that only moves up and down is a lift. |
| 16.4 | **EVERY ANSWER CARRIES AN ACTION BAR** — Copy · Show the working · Good answer · Needs work — and **every control in it acts**. Quiet: no accent, no fills, one hairline above it. The **last** answer's bar is always visible; earlier ones sit back at 34% until hovered. | *"Other options, such as copying the message or additional details, are also missing… liking a message, unliking a reply. Since none of these features are present, the corresponding flows should be implemented."* There was nothing: the answer landed and that was the end of it. The accent budget here is still one and still the send button (12.1), so this row is ink and grey — these are things you MAY do with an answer, not the answer. A bar that only appears on hover is one most readers never learn exists; a bar always on every message in a long thread is six rows of noise. The last one is the one you are looking at. |
| 16.5 | **Copy means PLAIN TEXT** — every block in its text form, the working numbered, and a table as **tab-separated rows** so it pastes into a spreadsheet as columns. Two clipboard routes and an admission if both fail. | The reader is pasting this into an email or a board pack. Copying the rendered markup, or a table as one long line, is a Copy button that technically copied something. The double route is the same reason `shareView()` has one: `navigator.clipboard` is refused outright on some `file://` origins, and a Copy that silently fails is worse than one that says it could not. |
| 16.6 | **A verdict is STORED, REVERSIBLE, and a downvote ASKS WHY** — three real reasons, and the acknowledgement says what it does about *that* reason. Thumbs-down fills with `--warn-ink`, not `--neg`. | A thumbs-up that stores nothing is the inert control §0.7 forbids, wearing the friendliest possible mask. Reversible because a rating you cannot take back is a rating people stop giving. The reason matters more than the rating — a downvote that swallows it took your opinion and did nothing with it — and "thanks for your feedback" is the polite form of doing nothing, so each reason gets an answer that is true of *this* product. Warn rather than negative ink because it is feedback, not a failure. |
| 16.7 | **Dictation is a REAL meter and nothing is typed until you stop talking.** Bars scaled every frame from an `AnalyserNode` on the actual microphone stream, replacing the cycling placeholder; `interimResults` off, so one final transcript lands at the end of the utterance; the mark holds `listening` throughout. | *"I want the audio form animation to occur when the user is speaking, and transcription should happen only after the user finishes speaking."* The word "real" is load-bearing and it is the same rule that governs the microphone existing at all: an animation that plays whether or not anything is being heard is the rejected canned-waveform version wearing better clothes. Interim results typed a half-heard guess into the box and rewrote it word by word, which reads as the product mis-hearing you. Two consequences worth knowing: the meter is started AFTER recognition and fails silently, because if two consumers of one device is ever a problem, dictation is the one that must win; and the `AudioContext` is explicitly `resume()`d — one born suspended reads back nothing but zeros, which is fifteen flat bars over a live microphone. |
| 16.8 | **The mark's drawn size is ONE variable, and it is generous** — 30px across all three instances, tiles at 34px, and the byline gutter derived from the tile rather than repeated. | *"Ensure that the thinking animation, or any other animations or motions, are more noticeable."* At the 19px the old cropped-blade token was drawn at, an idle breath of 1.03 is 0.6 of a pixel and the whole eight-state system is invisible. Nothing in 15.2–15.7 was touched to achieve this — the geometry and every timing are still the prototype's; the mark is simply drawn big enough to be seen. Four rules indent against the gutter, so it is computed from the tile: they used to drift. |

---

## What v4.2 changed, and why

*31 July 2026. **Finn gets a face**, and an eight-state motion system to wear it. This
is the only round in the guide's history whose source is a spec written OUTSIDE it:
`finn/finn-implementation-guide.md` and the verified prototype beside it,
`finn/finn-motion-v8.html`, which the guide now treats as the source of truth for the
mark's geometry and every timing in its motion. Six versions of that prototype were
burned learning the nine constraints in 15.4–15.9; the guide's job here is to stop them
being relearned. **One rule reverses v3.9 outright** — 15.3 freezes the resting mark
that 12.1 had breathing. Read this table before v4.1's.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 15.1 | **FINN'S MARK IS A CREATURE, not a crop of the Finoptic logo.** Two black square eyes with deliberately asymmetric rounded corners, an orange horizontal bar that is simultaneously both arms and the central hub, and two orange legs splaying from under that hub. `viewBox="0 0 112 97"`, brand orange `#FF5600`, black eyes. | REVERSES v3.9's mark, which was **two of the parent mark's four blades** cropped so they read as an opening speech mark, coloured from CSS. That mark said "this is part of the logo"; the assistant needed to say "this is a colleague", and a face is how. The parent four-blade pinwheel is **untouched** — the sidebar lockup, `logo.js` and the favicon are all exactly as they were, and nothing in this round may reach them. |
| 15.2 | **The mark's geometry is CLOSED.** Path data, the baked `translate(…)` offsets, the leg rotations **115.023° / 64.977°**, and the weld origins — **47px / 65px at y 42.2** for the arms, the **local origin (0,0)** of the pre-rotated frames for the legs — are final and pixel-verified. 🚫 **Never run it through SVGO or any optimiser**, and never let a formatter collapse the nested `<g>` wrappers. | The hand-drawn wobble is intentional and load-bearing. The legs telescope about the local origin of the frames they are drawn inside, so a collapsed group or a flattened `rotate()` breaks the motion **while the resting silhouette still looks perfectly correct** — the worst class of regression, invisible until somebody asks a question. `test-finn-motion.js` diffs the app's `<g class="creature">` byte-for-byte against the prototype's, which is the only check that catches it. |
| 15.3 | **DOCKED IS FROZEN. Stillness is a rule, not an omission.** While the conversation is closed the mark does not breathe, drift, or blink. Its single exception is `alert`: **one** pulse, once, then it refreezes itself. | REVERSES **12.1**, which had the resting mark breathing on the reasoning that a static logo in a box is the corner pod again. A blade-shaped token could fidget harmlessly; a creature with eyes cannot — it reads as a toy, and the audience is a board. What still animates at rest is the **cycling line in the composer**, which is what 12.1's "it keeps animating" was really about: an input already asking you something. A creature that holds perfectly still until you speak to it is composed. |
| 15.4 | **EIGHT states, exactly one live at a time, as a class on a scope element** (`#finn`, which carries `.finn-scope`) — `docked` · `alert` · `summon` · `idle` · `listening` · `thinking` · `speaking` · `settle`. Every instance of the mark inside the scope animates off that one class. 🚫 No per-instance state. | Finn is drawn in three places — the surface header, each answer's byline, the composer — and they must move in lockstep or the layer reads as three different marks. Each state is bound to a **real** lifecycle event, never to a timer: typing sets `listening` (1.1s debounce out), send sets `thinking`, the first streamed word sets `speaking`, the last one sets `settle`. The mark can therefore never disagree with what Finn is doing. **`settle` is never skipped** — it is the full stop, and it plays even when an answer arrives with no thinking to show or fails to derive. 🚫 No error animation; `settle` IS the graceful stop. |
| 15.5 | **THINKING IS A RADIATION, and THE HUB HAS NO ANIMATION AT ALL.** All four limbs telescope along their own length — `scale(depth, 1)` about their own weld — thickness constant, in and out of a hub that never moves. Arms first, legs **one beat** behind, everything springing back out past rest before settling. | The hub's stillness is the anchor of the entire system; if a refactor animates it, that is a bug, not a variation. Length-only is what makes it read as rays rather than as a logo being squashed. Four rejected alternatives, all of which "looked fine": a pinwheel⇄creature **morph** (read as glitchy), **per-limb stagger** beyond the paired leg lag (read as shaking), one **uniform whole-creature scale** instead of per-limb telescoping (generic), and **continuous rotation** of anything — a spinner says the product is struggling. |
| 15.6 | **The eyes are never fully still during body motion, and never fully co-scaling with it.** A randomised blink — 3.8–7.2s interval, 110ms — plus a small dip toward the hub during `thinking`. Blinks are suppressed in `docked` and in `thinking`. | Frozen eyes over a moving body read as dead; eyes that scale with the limbs read as generic. The dip is the only motion they get during thinking, because a blink on top of it reads as a twitch. Randomised rather than periodic so it never becomes a metronome. |
| 15.7 | **FIVE numbers are tunable and nothing else is** — `--think-tempo` 1.7s, `--think-depth` .45, `--think-stagger` .22s, `--eye-depth` .93, `--eye-dip` 1.4px — in one labelled block in styles.css §12, with their comments. | Everything else in the system is closed: geometry, weld points, the other seven states, and the auto-return timings, which are **two halves of one number** with the CSS animation lengths (`alert` 0.9s/950ms, `summon` 0.65s/700ms, `settle` 0.7s/750ms). Change one half and you must change the other. |
| 15.8 | **The mark carries its own literal fills and is never recoloured.** `#FF5600` and black, in the artwork. 🚫 Never given `.ic`. | This moves Finn's mark out of the *glyph* family and into the **brand-mark** family §5 already defines for `brands.js` — artwork that carries its own colour. The consequence, accepted: under the Blue and Monochrome accent presets the mark stays orange. Those presets are presenter controls and the mark is an identity, not a tint; recolouring a face is not a palette operation. |
| 15.9 | **`prefers-reduced-motion` kills the whole system, and the mark still renders correctly.** `?nofx` does the same in JS by pinning the scope to `docked`. | §9.1's rule applied to a layer that now has eight moving states: the finished state is the mark drawn correctly and the answer on screen, and every state above is decoration over it. The blink is **stopped in JS**, not styled out, because a class being added and removed on a timer is not something a media query can reach. |

---

## What v4.1 changed, and why

*A review of v4.0, the same night, and **two of these undo v4.0's own rules**: the
accent-tinted period pill went to the full gradient, and the accent it spends was
paid for by DELETING the hero KPI tile rather than by widening the budget. Three
more revert v4.0 outright. Read this table before v4.0's; where they disagree, this
one wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 14.1 | **THERE IS NO HERO KPI TILE.** Every tile on a screen is identical — same white surface, same figure size, same grey glyph. | REVERSES the hero card, which has been in §7 since v2.0 and survived every round since: *"remove the current primary emphasis, which is an orange gradient background applied to one KPI card. All KPI cards should now look identical."* `kpi()` still ACCEPTS `hero:true` and ignores it, because about twenty screens each mark one tile — one place decides, not twenty. What the hero bought (one figure saying what the screen is about) the summary panel's headline now carries. |
| 14.2 | **The PERIOD pill wears the brand gradient** — `--grad-accent`, the hatch overlay, white type, and **no outline of any kind**. Solid `--accent-strong` on a custom range. | REVERSES 13.3's tinted wash, from the round before: *"I would like it to have the same gradient background as the primary Stat card… I don't want any outline."* This and 14.1 are ONE decision: the gradient is available precisely because the hero tile gave it up, so the board still spends full-strength accent exactly once per screen (§0.3). Separating them would put two gradients on a screen or none. |
| 14.3 | **The KPI tiles and the insight band are ONE TABBED REGION**, between the reconciliation strip and the charts. Headline left, two tabs right, on one row: **Key Insights** (the ink band, default) and **Metrics** (the tiles). State lives on `<html data-sum>`, so it survives a filter change. | *"Collapse the KPI tiles and summary into one tabbed view with two tabs… the default view should be the key-insight view, the black tile view."* Assembled by MOVING the nodes `head()` and the screen already produced (`placeSummary()`), for the reason `placeBriefing()` did: `head()` composing the page head in one place is what keeps twenty screens consistent. It degrades rather than half-builds — a screen with tiles but no band keeps its tiles in the grid, because a two-tab control with one empty tab is worse than no control. |
| 14.4 | **The headline and the tabs are CHROME, not a card.** `.sum` has no surface of its own; each pane is its own object. | REVERSES the first build of 14.3, inside the same round: *"I want the heading and the tab switcher outside these panes, with the actual cards placed in their grouped-state pane."* A header inside the card becomes part of the thing it labels, and it forced the KPI tiles to sit inside a card as well — a box in a box (§3). With no surface here, the ink band is the one ink panel it always was and the tiles are ordinary cards. |
| 14.5 | **The insight pane carries a footnote out of itself** — a textual `View KPIs ›` strip at the foot of the ink band, spanning its three columns. | *"Add a footnote-style textual button labeled 'View KPIs' that switches to the metrics view."* It carries the same `data-sum-tab` attribute the tabs do, so the footnote and the tab are one control with two presentations — which is also why the switch handler matches on the attribute's VALUE rather than on node identity. No fill, no accent: it is a way out of what you are reading, not a second call to action beside the Do column's own button. |
| 14.6 | **THE COUNTERFOIL IS PER-SCREEN, and it survives collapsing WITH its labels and its sub-lines.** Two or three stats, chosen for the screen, passed in by the screen. Collapsed, each stat is two lines: label and value on the first, sub on the second. | *"In the collapsed view we have only the equation on the left, and the entire right side is empty."* It used to be the same three figures on all sixteen screens, so procurement carried the executive overview's counterfoil. **Passed in, not looked up**: nearly every stat mirrors a KPI tile computed from a local in the renderer's own scope, so a registry would have had to recompute it and the two copies would drift silently. Passing means the strip and the tile are one expression — verified, **225 of 225 stats equal their tile**. Two lines rather than one because label + value + sub inline is ~300px a stat and three of those plus the equation do not fit at 1280; the sub is always narrower than the pair above it, so stacking costs a line of height and nothing in width. |
| 14.7 | **Collapsed, the ticket keeps its SEAM and its two halves sit at opposite ends of it.** Same punched gradient as the expanded seam, without the notches. | *"They are too close to the equation… each grouped separately, placed at opposite ends, with a vertical separator between them, as in the expanded state."* The seam carries `margin-left:auto`, so it is the element that absorbs the free width — which puts the equation hard left and the counterfoil hard right without either having to grow. The notches come off because a 13px bite either side of a 47px strip eats a quarter of its height. Below 1400 the equation drops its trailing `+8.0% over plan`: it is the one duplicated figure on the strip, and the ~110px it frees is what lets three stats hold to the width where the whole strip wraps anyway. |
| 14.8 | **The assistant's veil fades on TWO AXES: a linear gradient down, a mask across.** | REVERSES 12.8's single radial. *"It stops short of zero transparency, creating a harsh edge at the end… a harsh white edge also appears at the top."* The cause was geometric, not a wrong stop: the ellipse was centred at y=116% with a 148% radius, so its topmost point sat above the element and the box clipped the gradient at ~25% opacity. A vertical linear gradient cannot have that fault — its last stop IS the top edge. The sideways fade moved to a mask sized in the element's own width, so it also finishes inside the box. A mask applies to pseudo-elements too, which is why the accent layer only declares its own vertical ramp. |
| 14.9 | **The lens switch is back in the sidebar rail**, as the same `View:` split control it was before v4.0. 🚫 No `Dynamic Overview` row. | REVERSES 13.6 entirely: *"revert the persona dropdown change and move it back into the sidebar as it was before"*, then *"there is no longer any use of dynamic overview. Just remove that item."* The row existed only to give the rail a second visible overview while the switch was away on the page head; with the switch back directly beneath it, the row named the destination the line under it already named — the duplication this group has been trimmed for twice before. |
| 14.10 | **The Observability screen is deleted.** The Spend group runs Cloud → AI → SaaS & Licences → **ITSM** → Security. | Observability remains a spend **category**, a vendor category, a GL account and a column on the ITSM board — the company still spends on it; it no longer has a screen of its own. `D.obs*` stays in the schema and is still rescaled, because a dataset describes the estate rather than the list of screens that happen to exist. A stale `#obs` link falls back to the overview rather than erroring. |

---

## What v4.0 changed, and why

*A board review, the same evening as v3.9 — the first round since v2.0 that is about
the BOARD rather than about one component. **Six of these seven reverse a rule that
was locked, and three of them reverse rules stated as absolutes** ("sentence case
always", "the set state fills with `--ink`, not the accent", "the band sits directly
under the page title"). Read this table before v3.9's; where they disagree, this one
wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 13.1 | **EVERY HEADING IS TITLE CASE, and every word in it is capitalised** — page titles, card headers, KPI tile labels, table column headers, section headings, nav rows, empty-state titles, menu headings. Not AP style: `Spend By Vendor`, `Where Operations And Cost Meet`, `Cost Per Employee`. | REVERSES §1's *"Sentence case always"* outright, on instruction: *"Each heading should have every word capitalized… Apply this to every heading in the app."* Small words are capitalised too, because the instruction says every word and does not exempt any. §1's separate ban on `text-transform: uppercase` is **untouched and still absolute** — this is cased text, not a transform, and the two are different rules. What is NOT a heading, and stays in sentence case: card `sub:` lines, `hint:` chips, `note:` footers, the insight band's prose, form field labels, and the assistant's answer headlines, which are sentences. |
| 13.2 | **Title Case survives acronyms by rule, not by word list.** A word with an uppercase letter anywhere after its first character is left exactly alone. | `SaaS`, `AI`, `YTD`, `ITSM`, `SIEM`, `GB`, `EC2`, `MoM`, `GenAI`, `GitHub` and every brand name are protected without a list that would drift. Hyphen and slash are word boundaries, so `multi-cloud` → `Multi-Cloud` and `cost / req` → `Cost / Req`. Headings written as literals were rewritten at source; the two built from data go through `titleCase()` in `core.js`. |
| 13.3 | **The PERIOD filter is permanently accent-tinted, and it is the only filter that is.** Accent wash, accent-strong 700 value, accent glyph — and solid accent when a custom range is set. | REVERSES §7's *"the set state fills with `--ink`, not the accent, because filters are navigation, not a brand moment"* — for one dimension only. *"The period filter is the most important because the entire dashboard updates based on the selected period… Currently it lacks visual emphasis."* Period is not a narrowing of the board, it is the board's SUBJECT: every figure on every screen is a figure for a span of months, and it is the one dimension with no unset state to be quiet in. **Tinted, not solid**, because the one full-strength accent object on a board screen is its hero KPI tile (§0.3) and two at the top of the page would compete. Every other filter still fills with `--ink`. |
| 13.4 | **The insight band sits BELOW the KPI tiles**, still above the first chart. | REVERSES v3.1's rule (§7, and v2.0's table row 8) that it sits *"directly under the page title, above the first card"* — which was itself the fix for it being a footnote. *"On some screens the Reconciliation bar, insights, and KPI tiles convey essentially the same information."* Three columns of prose between the equation and the first figure meant reading the conclusion before seeing anything it was drawn from. Below the tiles it lands where the question "so what?" actually forms. It must **not** move below the charts — that is the footnote position v3.1 rescued it from. |
| 13.5 | **The band's first cell is DERIVED, and its job is to say what the tiles and the strip cannot.** Labelled `What You Might Miss`. Five shape probes — concentration, timing, run-rate, fastest mover, tail — plus a feed-coverage probe and four screen-specific ones, each scored 0–100 for how notable it is; the best prints, and a second only if it scores ≥25. | REVERSES the authored `insights[screen].what`, which on most screens was the reconciliation strip written out in words. A level is visible — it is what a tile is. A variance is visible — it is what the strip is. What nothing on a board of totals can show is SHAPE: how concentrated the spend is, whether the gap opened gradually or last month, which line is moving fastest, how much of the total is too small to have a row. Scores are **normalised** because unnormalised ones cannot be compared — concentration reported 79 and run-rate reported 10 for two equally readable findings, so concentration won on all seventeen screens. Falls back to the authored `what` when nothing scores, so an unmeasured workspace degrades rather than blanks. |
| 13.6 | **"Viewing as" is a control on the SCREEN, in the page head's right slot** — where the `Persona · …` tag sits on every other screen. The sidebar rail holds no controls at all; it holds a **Dynamic Overview** row instead, which is an alias resolving to the active lens's home. | REVERSES v3.5's `View:` split control in the rail. *"The 'Viewing as' filter is currently misplaced — we want the filter to appear directly on the view itself."* One button, not the rail's split control: there the name had to be clickable because it was the only route TO the view; here you are already on it. Only the four lens homes get it — every other screen keeps its flat `Persona · …` **label**, because turning a label into a control that navigated you away from the screen you just opened would be a trap. The value is INK, not accent: this is navigation, and 13.3 already spent the board's second accent. |
| 13.7 | **Every ranked plot, list and table is ordered DESCENDING**, and the sort happens inside the drawing function, not at the call site. `tail: true` pins a rolled-up remainder to the bottom. A table sorts on the currency column with the largest absolute total. | *"Any plot, table, or numeric display should be ordered in descending order."* Sorting at the point of drawing means all ~40 call sites obey at once and a dataset loaded from a file at runtime cannot break it. **Three positional rules were tried and each broke a real table**: first right-aligned column ranked chargeback by cloud spend; last ranked the renewal calendar by utilisation; any-numeric scrambled a Value column holding nine unlike units. "Largest currency total" lands on the total column wherever one exists. Genuine exceptions carry `order:'keep'` and there are three: two tables listing unlike measures down one column, and one whose rows are a pipeline in sequence. Time series and waterfalls are never sorted — "descending" there would run the year backwards. Where a list is severity-ranked, money descends **within** each severity band. |

---

## What v3.9 changed, and why

*The same evening as v3.8, reviewing it in use. **Every rule here reverses one of
v3.8's**, which is what a review round is for — and three of them were reversed twice
within the round. Read this table before v3.8's; where they disagree, this one wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 12.1 | **The assistant is CENTRED, and its resting state is a composer that animates** — one bar in the middle of the bottom edge, cycling what you could ask, with the mark breathing beside it. | REVERSES v3.8's bottom-right pod outright. *"Everything is within that small quad area."* A corner is where you put a thing you expect to be ignored, and a pod with a logo in it says "there is a chatbot here" where an input already asking you something says "ask me". Base: Intercom's Fin composer, which the reader brought as the reference. |
| 12.2 | **Asking opens a surface at ~82% of the viewport**, centred, on a veil. A maximise control takes it to full screen. | REVERSES v3.8's 420px panel. A conversation needs a reading measure, and 420px is a phone column on a 1440px screen. The thread caps its own measure inside the surface, because prose set across 1080px is no better than prose set across 420. |
| 12.3 | **PLOTS AND TABLES ARE INLINE**, each on its own tinted panel with a titled header. | REVERSES **12.4 as first built in this very round**: a Claude-style artifact pane was built, and taken back out on sight — *"it is not making sense, make them inline."* Splitting the sentence from the chart it is about makes the reader look in two places for one answer. What the pane was actually providing was **presence**, and a tinted panel with a hairline header gives a plot that inline — which is also the answer to *"the plots should have a texture so they stand out."* |
| 12.4 | **Brief and Full change the ANSWER, not the window.** Brief gives the answer; Full adds `How I worked this out` — the numbered derivation, with the real arithmetic. | REVERSES v3.8's 12.4, where the toggle resized the panel. *"In actuality my thinking behind having brief and full is the way the chatbot replies."* Resizing a window is not a thing a reader asked for, and it made the control about layout when it is about depth. |
| 12.5 | **The greeting says something it already knows.** Time of day, then a derived sentence about this workspace, then THREE suggestions that rise out of the composer's own top edge. The full catalogue is one link away. | REVERSES v3.8's opening on 24 questions in four accordions. *"It should give the vibes of an intelligent human… rather than just dumping a bunch of questions to select from. That is never the use case."* A colleague who has read the numbers opens with the headline, not with a list of what you are allowed to ask. |
| 12.6 | **Thinking ACCUMULATES.** Three dots first, then each reasoning step lands under the last and types itself, the live one pulsing and the settled ones ticked — and the steps are the SAME derivation Full prints as its working. | REVERSES v3.8's single line swapping text on a timer, which is a spinner with words. *"Even the thinking didn't feel like it's actually thinking."* Tying the log to the working is what stops it being theatre: it cannot show reasoning the answer does not contain. |
| 12.7 | **No third typeface.** Hierarchy inside an answer comes from size, weight, space and a hairline: 18/700 headline · 14.5/1.62 body · 12.5/700 section over a rule · 11.5 micro. | REVERSES v3.8's 1.1 and removes Fraunces and `finn-font.css` with it. *"I didn't like the serif font… just stick to the brand fonts."* §1 is back to two faces, and the hierarchy complaint — *"the hierarchy within the text formatting is not at all coming through"* — is fixed by making the four levels visibly four rather than by adding a fifth face. |
| 12.8 | **The veil has THREE states and lives at z-index 20.** Short and soft at rest; **taller, denser and ACCENT-TINTED while the suggestions are up** *(the tint added in v4.0)*; gone once the surface opens and the scrim takes over. It is elliptical, so it fades out horizontally before either edge. The tint is a second layer whose OPACITY cross-fades, not a recoloured `background` — a gradient's own colour stops do not animate, so swapping them would snap from white to orange while the height eased. It is a considered break of 12.1's budget of one: that budget rations accent OBJECTS, and this is ground — no text, no border, no edge, gone the moment the surface opens. | New, and it took three passes. A white→transparent veil rather than a dark scrim, because the board is a warm canvas carrying charts and an ink band and a white surface over that *"mixes with the background."* z-index **20** specifically: above the board's cards, **below the sidebar's own z-30**, so the nav — including the profile row at its foot — is never washed out, while Finn's scrim at 69 still dims it once the conversation opens. |
| 12.9 | **A flex row blockifies its inline children.** Any flex container whose text can contain `<b>` wraps that text in ONE span. | Found in the working list: `.fa-work li` is a flex row with an 11px gap, so every `<b>` around a figure became its own flex item and the gap opened on both sides of every bold word. Two children, one gap. This is a class of bug, not an instance — it applies to every flex row in §12 that carries prose. |

---

## What v3.8 changed, and why

*30 July 2026, the evening of the same day. One new thing — **§12, the assistant layer (Finn)** —
and it needed three rules that the guide had previously stated in a way that only made sense for
screens. Read this table before the ones beneath it; where they disagree, this one wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 1.1 | **A THIRD typeface exists, and its scope is one component.** Fraunces sets Finn's name, its answer headlines and its section headings. Body prose inside Finn stays **Mona Sans**, and Space Grotesk keeps every figure. | AMENDS §1's "two typefaces", which was written as a closed set. The scope is the whole point: the reach is *headlines and chrome*, chosen against a live eight-face comparison, and a serif at 13px over a 420px column was rejected in that same comparison. Self-hosted base64 in a **separate generated `finn-font.css`**, because `fonts.css` is generated from the two brand faces and appending a third by hand is how a generated file stops being regenerable. |
| 12.1 | **An overlay LAYER has its own accent budget of one.** At rest that is the pod; open, the pod is gone and the send button inherits it. | §0.3 rations the accent to one hero per SCREEN, and a layer that floats over every screen has no screen to belong to. Without this the pod, the send button and the mode toggle would be three accent moments on top of a screen that already spent its one. The mode toggle therefore fills with **`--ink`**, exactly as a set filter chip does — choosing an answer length is navigation, not a brand moment. |
| 12.2 | **The assistant panel is WHITE.** The user's own message is the `--surface-3` step, never a dark bubble. | A dark chat panel is the default look for the genre and it is wrong here: the briefing band is *the* one ink panel on a screen (§7), and that is the entire basis of "differentiate an insight by surface **value**, not another hue". A second ink surface floating over the board would demote the band to one of two. |
| 12.3 | **The assistant is a layer, not a pane and not a modal:** no scrim, no scroll lock, no focus trap. Only its × and Escape close it. | The pane exists to take the screen away while you read a procedure. An assistant beside a dashboard exists to be read *with* it — and if an outside click dismissed it you could never look at the number the answer referred to. It mounts on `<body>`, so the thread survives navigation. |
| 12.4 | **Full mode WIDENS the panel** (420px → 720px), because one control should carry one intent. | A Full answer may hold a 3-column table, and a 3-column table at 420px is exactly the horizontal-scrollbar fault §6 spends a rule on. Splitting length and width into two controls would have made the reader fix the layout themselves. |
| 12.5 | **A past chat pins its RESOLUTION, and stores its questions rather than its answers.** Reopening re-derives against the live dataset, and says so when the dataset has changed since. | A history list ordered by question is a list of things you asked; pinned by resolution it is a list of things you *decided*. Storing rendered answers would blow a `file://` origin's storage quota, and — the real reason — a transcript that silently renumbers itself is worse than one that admits it re-read the figures. |
| 12.6 | **Every answer names the feeds it read**, and says so unprompted when one of them is not healthy. | The highest-credibility row in the set for one line of markup: it makes an answer auditable rather than oracular. It is derived from `sources`' own status column, so `baseline`'s degraded AI feed caveats every AI answer without anyone authoring it. |
| 12.7 | **Voice is real dictation or no button at all.** `SpeechRecognition` where the browser has it; nothing where it does not. | The rejected alternative was a microphone that plays a waveform and then fills the box with a scripted question — precisely what 7.17 forbids, and it would have been the one dishonest control in the product. A key shipped inside a `file://` page is also a published key, so nothing here calls a provider. A missing button is honest; a lying one is not (§0.7). |
| 12.8 | **The assistant obeys 7.17 and 7.20 like any card.** A question outside what the data supports gets an admitted miss plus three real questions, never an invented answer; an unmeasured workspace reaches the same `emptyState()` family and its **See how to connect**. | Both come free from reusing `charts.js` and `components.js` rather than drawing new plots — which is also why every answer carries real vendor marks. A chatbot is the easiest place in a product to fabricate confidently, so the miss state is a rule rather than a fallback. |

---

## What v3.7 changed, and why

*The same day as v3.6, reviewing it. Four of these reverse a v3.6 rule outright — 6.2, 9.6, and
the two that follow from "no message may tell the reader this is a mock-up". Read this table before
the ones beneath it; where they disagree, this one wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 6.2 | **One sort-and-filter control per COLUMN, and the control IS the header** — a ghost button wrapping the label and a caret, always visible, sized to its own text. Both sort directions named outright and worded by content (`Sort ascending / descending` for figures and dates, `Sort A to Z / Z to A` for text), plus that column's multi-select and its own contains box. | REVERSES v3.6's single table-level popover: that control held everything, but away from the column it acted on, so narrowing one meant picking its name out of a list of column names. It also reverses **two attempts made inside this round**, both of which failed on where the hover state lives. A mark revealed on hover in the cell's corner crossed from the right of a text column to the LEFT of a right-aligned one along a single header row, and hidden-until-touched is not an affordance. A full-cell overlay button then put the wash on the whole `<th>` — and a `<th>` is as tall as the tallest header in its row, so beside a two-line header a one-line label sat jammed at the top of a 44px band. A button sized to its own contents can have neither fault. Base: shadcn/ui's data table, which `reference/element-references.md` §7 names for exactly this. `thead th` is `vertical-align:bottom`, so short and wrapped headers share one line above the divider. |
| 6.4 | **The column popover is built from the reference vocabulary, not from the filter pills' rows.** 12px radius, layered shadow, 30px icon-led rows, real checkboxes, a search field rather than a bare input, and a keyboard hint at the foot. | It was reusing `.menu-opt`, which carries a 9px colour-swatch slot on every row and three grey type levels in one narrow panel, with CSS-triangle arrows. Beside a current product that reads as a 2015 select menu. Sources, each buying one thing: §7's shadcn data table (radius, gutter, row height), §8's Linear filter menu (icon-led rows, real search, the `Esc to close` hint), DNA 4 “soft elevation, not hairline boxes”, DNA 10 “give it air”. The tick may be accent-filled — §0.3 rations the accent to one hero card per SCREEN, and a popover is not on the board. |
| 6.3 | **A table row is the height of a row.** Slack pools below the table, inside the card. | REVERSES the `height:100%` that let rows share out an equal-height grid row. Table layout distributes slack in proportion to content, so a two-row table beside a nine-row one came out at 61/51/61/51/60px — ragged, for no reason a reader could see. Uniform boxes come from the five-row clip and "Show all" (§7), never from stretching content. The same now applies to a chart legend's rows. |
| 7.17 | **No message anywhere may tell the reader this is a mock-up.** | Thirteen strings did — in toasts, dialog footnotes, card notes, the invite email and the greeting. Two rules replace them: never claim something happened that did not ("Nothing was sent" stays; the sentence explaining why it was not sent goes), and where the disclaimer WAS the whole message, say what a real product would say at that moment. This reverses v3.6's 9.6 in spirit: honesty about absent media was the right instinct in a document and the wrong one in a demo. |
| 9.6 | **A video placeholder is a drawn poster over a real video.** The whole frame is the button; clicking opens the film in a dialog. | REVERSES v3.6's "Placeholder chip and Not recorded yet". The poster stays — it is inline SVG of the product's own layout and cannot fail to load from a `file://` path, where a remote thumbnail would leave a broken frame. What goes is the four separate pieces of copy whose only job was to apologise for an absent recording. |
| 8.6 | **The pinned strip's `top` is MEASURED, never a constant.** `--stuck-h` is written from the controls row's own rect. | The strip pinned at `--controls-h` (48px, the row's RESTING height) while the pinned row stands 62px tall, so it came to rest 14px under an opaque bar that outranks it — and those 14px were painted over on every scroll. A second constant would have been right today and drifted on the next change to a chip, a font or a breakpoint. |
| 8.7 | **A control that cannot act is not shown.** The strip's chevron disappears while pinned-and-collapsed. | Scrolling past the pin auto-collapses on every tick, so expanding from there wins for one frame and the next scroll event undoes it. A chevron that visibly refuses is worse than no chevron. It returns the moment the strip is a card again. |
| 8.8 | **Expanding the sidebar and choosing from it are two separate acts.** A group icon in the collapsed rail opens the rail and its group, and navigates nowhere. | It used to also go to that group's first screen, on the reasoning that expanding to a list you must then click is a wasted step. In use it is the opposite: clicking "Spend" to see what is under Spend threw the reader off whatever they were reading onto Cloud, a destination they never asked for. |
| 7.18 | **The reconciliation equation reads as one statement.** Terms group left on a fixed rhythm; the free width falls between the equation and the counterfoil. | `space-between` gave each term the widest possible berth — at 1440 that is ~180px between `$63K` and the minus sign acting on it. Arithmetic is read in one sweep. |
| 7.19 | **The ticket's perforation is a seam, not a rule.** 1px at 13% ink on a 3-on-5 dash, with 13px notches. | At 1.5px and 26% it read as a heavy dotted divider slicing the strip in two — the one thing a perforation must not look like. It is meant to be noticed second, after the arithmetic. |
| 7.20 | **An unmeasured workspace shows em dashes and a way in, never zeroes.** Every card whose source is not connected dims its header, names the cause, and carries **See how to connect** — which opens a side pane with the actual procedure. | `$0K − $0K = +$0K, +0.0% on plan` is the product's loudest component stating that the company spent nothing and is exactly on plan, when the truth is that nobody has looked yet. A figure that survives having its data taken away is not a figure. The pane is a pane and not a dialog so the card that prompted the question stays visible beside the answer. |
| 10.2 | **The setup walkthrough is re-derived when the workspace changes.** | It opened with step 01 marked done in every dataset — right where figures are landing, and flatly wrong on a workspace that has closed nothing. Two things describing one workspace have to agree. |
| 7.21 | **The alert feed is a grid with named tracks.** What happened, who owns it, what to do, the money, the control. | The second cell used to run the product, an avatar, an owner and the recommended action together on one middot-separated sub-line — five item types with no fixed positions, so nothing lined up down the feed. |
| 7.22 | **The greeting is a welcome, not a specification.** Time of day and the reader's name, one sentence on what the product is for, the walkthrough as the hero, three orientation lines, two real choices. | Seven text blocks in one column, explaining the product's own construction, to a reader who has not formed a question yet. A greeting is the worst possible place for a spec. |

---

## What v3.6 changed, and why

*The same day as v3.5, reviewing it. Two of these reverse a v3.5 rule outright, which is the point
of a review round — read this table before the ones beneath it.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 8.4 | **Pinned is a different state, not the resting one held in place.** `<html data-stuck>`: both bars bleed full-width, the gap between them becomes padding on the opaque bar above, and the strip loses its radius, its lift and its ticket notches. | A ticket lies on the page; a header is welded to the window. Notches are canvas-coloured circles — pinned, they passed over moving content and read as holes punched in the board. |
| 8.5 | **The strip collapses when it pins, and RESERVES the height it gives up.** | Not reserving it flickers: the shorter document clamps the scroll, the clamp un-pins the bar, un-pinning expands it. A dead band suppresses that but has to be wider than the height removed, which strands the bar collapsed while it is visibly pinned to nothing. It frees room in the VIEWPORT — the document never needed shortening. |
| 6.2 | **One `Sort & filter` control per table, and column headers are inert.** Multi-select within a column, AND across columns. | Clickable headers plus a separate find box is two controls for one job, and neither could express "these two categories, and only the top quartile". Columns are classified from their own cells — rank words get value lists in rank order, figures and dates get quartile bands, sentence columns get no checklist at all, because a list of forty opportunity titles is not a filter. |
| 7.11 | **A person is ONE given name, and it is exactly their photo's filename.** | Welding a supplied first name onto a surname the dataset had invented put an invented identity on a real person's face. A name is now whatever the file is called, so the roster, the folder and the data cannot drift. Stock portraits take a name that matches what the artwork depicts, and are recorded as stock in `avatars/README.md`. |
| 7.12 | **A photograph gets the same pale accent ground an initials orb has** — including the signed-in tile in the sidebar. | The supplied portraits are transparent cutouts: with no disc behind them a head floated loose in a table cell. This REVERSES v3.5's "the signed-in avatar is the one avatar allowed to wear the accent" — a solid orange square pulled the eye off the navigation under it. The accent goes back to one hero card per screen (§0.3). |
| 7.13 | **A filter chip's outline is a 7% inset hairline**, firming up only under the pointer; the ink-filled state has none. | Five bordered chips across the top of a board designed around boxes you are not meant to notice is that fault in miniature. |
| 7.14 | **A screen about people, or about creating a row, carries no reconciliation strip and no Export/Share.** | The strip is the company's spend equation. Above a list of colleagues, or above one record being typed, it is answering a question nobody on that screen asked. |
| 7.15 | **Ask for the input; DERIVE the rest, and show the derivation.** Department is asked; the default view is derived and displayed. | This reverses R7.21's admin→ITFM role branch. Two inputs feeding one output is what made a second field look necessary — and a field you can see the answer to is worth more than a field you have to fill. |
| 7.16 | **A form must not invent answers.** An unanswered cell is an em dash, and a consequence line says what it still needs. | The Add preview was filling blanks with `$0K`, `0%` and `Vendor risk: Low` — judgements the form made up, on the one screen whose job is to show what a record would become. |
| 9.4 | **Toasts stack at the top right**, each with its own timer and a draining bar. | Bottom-right is where a toast goes when nobody has asked where the reader is looking — the action they just took was at the top. One reused element also meant a second confirmation inside four seconds overwrote the first. Removed on a TIMER, not `animationend`: reduced-motion kills the animation and that event never fires. |
| 9.5 | **An onboarding screen is a flow, not a page.** Three chapters, one on screen at a time, one accent button per chapter. | Everything at once, with no clear direction, is the same wall the de-boxing rounds were about — in content rather than in surfaces. |
| 9.6 | **A placeholder for absent media is DESIGNED, and says it is absent.** | An empty `<video>` 404s; a grey box reads as broken. The poster is an inline-SVG drawing of the product's own layout, with a Placeholder chip and "Not recorded yet". |
| 10.1 | **Two of the six datasets exist to be difficult.** `fresh` is ten weeks old; `zero` has empty lists, not zero values. | Zero-valued lists would draw a donut of eight `$0K` slices, which reads as a measurement — the exact fault the empty-state family exists to prevent. Between them they found four screens that crashed and five that printed NaN on an empty workspace; every one was a latent bug the four mature datasets could never reach. |

---

## What v3.5 changed, and why

*30 July 2026. The round that took the mock-up from a board you look at to one you can operate: motion, hover, multi-select, sorting, and five areas that did not exist at all (account, data entry, onboarding, empty/fresh states, the alert playbook). Read this table before the six beneath it — where they disagree, this one wins.*

| # | Rule | Why, and what it reverses |
|---|---|---|
| 5.1 | **A KPI glyph is grey, on nothing.** No tile, no tinted wash, no status tone. | Third treatment here, and the two it replaces were both deliberate: v3.0 hatched the tile (rejected on sight), v3.1 kept a solid tile tinted by the figure's status. Tinting made the icon a *second* status signal arguing with the delta directly beneath it, and eight tinted squares put more colour on the board than the one hero card is meant to own. **Do not reinstate `.tile` on a KPI.** |
| 5.2 | **A KPI standing for a vendor wears the vendor's mark, and keeps its name.** | Reverses the v3.4-era note that "a KPI tile must not use a vendor logo" — three cards about three different companies were identical above the figure. Fires on an *exact* vendor name only. A mark keeps its own literal hexes and must still never take `.ic` (§5). |
| 7.1 | **The reconciliation strip is a ticket.** Semicircular notches punched into the top and bottom edges at a dashed perforation, equation spread across the main body, stats on the counterfoil at the corner. | A shape that is not a rectangle is the cheapest way to say "this is a different kind of object" on a strip that appears on every screen, without spending an accent moment. The perforation is a real element between the two halves, not a background painted at a fixed percentage — the equation flexes. |
| 7.2 | **Inside the equation, nothing is grey.** Labels, operators and sub-lines take `--ink`; the counterfoil keeps its greys. | The `--ink-3`/`--ink-4` steps are right for supporting text everywhere else and wrong here: they made the strip's primary entity look like a caption wrapped round three figures. The contrast between the two halves is now what ranks them. |
| 7.3 | **Every dimension except period is multi-select.** Checkboxes, a live count, "All *x*" to reset, a find box past eight options, and the menu **stays open** across picks. Selecting every value collapses to "All". | A filter that claims to be filtering while excluding nothing makes the "estimated" marks and the Clear count both lie. |
| 7.4 | **Period is single, and gains a custom range.** A calendar clamped to the *closed* months of the fiscal year, resolving to **whole months**, printing what it resolved to before you apply. | A period is one span of time; two disjoint periods summed into one figure would be a different product. Whole months because the dataset carries one figure per month — interpolating a daily curve on a screen whose whole claim is reconciliation would be the most convincing lie in the mock-up. |
| 7.5 | **Every table sorts; every table past six rows filters.** Both read the *rendered cells*. | ~40 call sites across the screens build tables from pre-formatted strings; threading a comparator through all of them is 40 chances to disagree with what the cell actually says. The cost is that sorting has to understand text — `$1.62M` beats `$980K`, Critical outranks High, and the optimisation pipeline sorts along itself rather than alphabetically. |
| 7.6 | **A table's outer cells take the card's padding.** Inner cells stay at 10px. | So a full-bleed table's first column starts on the same x as the card title. Only the outer cells, because ~20px per table is affordable and 20px per column is not — nine tables were one bad decision from a horizontal scrollbar at 1200px. |
| 7.7 | **A person is a round token.** Photo when there is one, initials orb when there is not, tone registered per person. | Every other identity token in the system is a square — vendor mark 3px, chart swatch 2px, badge 6px — so roundness alone means "person" without a legend. A quiet wash with ink initials, not a saturated disc: sixteen saturated discs down a table out-shout the figures. |
| 7.8 | **A modal is portalled to `<body>`**, with a focus trap, Escape, click-outside requiring both mousedown and click on the scrim, scroll lock with scrollbar compensation, and focus returned to its trigger. | The mock-up's first modal, so it sets the pattern. Portalled for the same reason the filter menus are: an ancestor with overflow on one axis clips on both, which cost a whole feedback round. |
| 7.9 | **An alert carries one control, and it opens a plan.** Assign / snooze / dismiss live in the dialog, not on the row. | Three extra buttons across eight rows turns a feed into a wall of controls and the alert stops being the thing you read. |
| 7.10 | **"Nothing to show" has a cause, and the cause decides the copy.** Filtered-to-nothing / source not connected / detail missing / no history yet / role-limited. | One visual shell, five causes. The old single state told everyone to "widen the period or clear a filter" whether or not either was set. |
| 8.1 | **The sidebar opens at every width.** Below 1180px it floats over the board on a scrim, keeping the mini rail's width in the layout. | It was hard-forced collapsed below 1180 *and* its expand control was hidden there, so a tablet user could see four group icons and reach none of the seventeen screens. Widening in place was rejected — 276px of nav out of ~1000px leaves a board too narrow to read, and every card would reflow twice per toggle. |
| 8.2 | **A screen may declare `chrome: 'bare'`** and the shell is removed, not covered. | Sign-in is the only one. Painting a fixed layer over the sidebar left it in the tab order and depended on nothing in the shell ever gaining a `transform`. |
| 8.3 | **Nothing pins at phone width, and both rows wrap.** | The controls row and the strip were single-line flex rows that never wrapped, so at 430px the board was 84px wider than the window on every screen. They wrap rather than scroll: `overflow-x:auto` on `.filters` is what made the filter menus invisible for a whole round, and that is not a trap worth re-laying. |
| 9.1 | **Motion is optional, and its finished state is its natural state.** Every hidden state lives inside a keyframe reached with `animation-fill-mode: backwards`. | An interrupted animation must not be able to leave anything invisible. A demo may look unfinished; it may never look broken. |
| 9.2 | **Nothing animates on a filter change.** Entrances play on navigation only. | You change a filter to compare numbers. Replaying the board there is noise. |
| 9.3 | **Two preloaders.** A bespoke cold-start splash assembling the logo's four ribbons, and a skeleton of the layout on a screen switch. `prefers-reduced-motion` and `?nofx` both land on the finished state. | The splash is the first thing the client sees, and the only place in the mock-up where a flourish is wanted. |
| 6.1 | **Every plot answers a hover.** One shared readout portalled to `<body>`, full-height hit bands rather than the mark itself, keyboard-reachable. | A 1.75px line and a 2.4px dot are not hoverable. The panel is **white**, not a dark tooltip — ink is reserved as a surface value for the briefing band (§7), and a multi-row ink panel over a chart would read as a second one. |

---

## What v3.4 changed, and why

One change, and it is structural rather than cosmetic: **there is no chrome bar above the content any
more.** The shell holds the sidebar and the screen, nothing else.

Every version up to v3.3 kept a bar in the shell for the filters, the "as of" line and the Export /
Share buttons. v3.2 had already moved the reconciliation strip out of the shell and into the screen to
get the heading above it — but the bar was still there, so the first thing on any screen was still a
row of dropdowns: **"the headline of each screen should be the first element visible."**

| # | v3.3 required | v3.4 requires | Why it changed |
|---|---|---|---|
| 1 | Filters, "as of" and the two actions in a `.topbar` in the shell, above the content | **A `.controls` row INSIDE the screen**, emitted by `head()` between the page title and the reconciliation strip (§8) | The headline has to come first, and folding the controls into the headline row was the alternative — rejected as too crowded. So they get their own row, below it |
| 2 | Every nav group open on load | **Only Overview open; Spend, Manage and Reference start folded** (§8) | A sidebar that opens with all seventeen items showing spends its height on screens you did not ask for. Overview is the group you are actually in, because the Executive overview is now the default screen |
| 3 | A cold start opened on the default view's home screen (IT financial management) | **A cold start opens on the Executive overview** (§8) | Landing on a persona screen chosen by a dropdown nobody had touched was the wrong first impression, and it left the one open nav group being a group you were not in. A shared link still wins |
| 4 | A group icon in the collapsed rail expanded the sidebar and opened that group | **It also navigates to that group's first screen** (§8) | Expanding to a list you then have to click again is a wasted step, and in the mini rail the group icon is the only affordance there is |

**It still pins, and nothing is lost.** `.controls` is `position: sticky; top: 0` and the strip pins
under it at `--controls-h`; the heading scrolls away behind them. Pinned chrome is 138px expanded,
95px with the strip collapsed — the same as before, but the reading order now starts with the name
of the screen.

Two consequences a future session needs to know, because both are easy to break:

- **`.controls` needs its opaque `--paper` background.** It is the backdrop the shell bar used to
  provide; without it the page head scrolls straight through the pinned row.
- **Export and Share are DELEGATED, not bound.** They live inside the screen now and are replaced on
  every render, so a listener attached once at boot would be attached to a button that no longer
  exists. Same reason their icons are inlined in the template rather than left to `fillChrome()`.

---

## What v3.3 changed, and why

v3.2 got the principle right — boxes present, not loud — and then didn't go far enough on the
dial, and solved the dead-space problem the wrong way. Four changes.

| # | v3.2 required | v3.3 requires | Why it changed |
|---|---|---|---|
| 1 | `--shadow-0` as two layers (1px + 2px/4px) | **One 1px hairline-shadow at 3.5% ink** | "The shadow remains strong because we have a grey background and are using shadows for the boxes on top of it, creating excessive separation." A grey canvas plus a lift is separation twice over. The paper/white step does the work; the shadow only stops a card dissolving |
| 2 | A cool blue-grey canvas, `#F1F4F8`, from the same family as `--ink` and `--line` | **A warm light grey, `#F8F7F4`**, with `--surface-2`, `--surface-3` and the hairlines warmed to match | "The app looks dull due to the grey backdrop. Please use a slightly warmer, lighter shade of grey to make it feel brighter." A warm neutral also sits better under an orange accent. The canvas must stay a visible step off white — with the shadow reduced, that step is now the ONLY thing separating a card from the page |
| 3 | Content STRETCHED to fill a card: row lists distributed their rows, tables ran to `height:100%` | **Row lists clip to five with a `Show all N` control** (§7). Rows keep their natural height | **Reverses v3.2 #3.** "The heights of the boxes should be uniform, but this does not require the content to fill each box — we can display the top five items and provide a Show All button that expands the box." Stretching made two lists side by side read at different rhythms; it was solving the wrong problem. **Uniform box heights need the lists to be the same LENGTH, not the rows to be the same height.** Tables keep `height:100%`, which is invisible |
| 4 | No favicon; title without the house name | **A favicon generated from the real mark**, inline as a data URI, plus the Crozaint suffix on the title and a description meta | The tab was showing a browser default. The four thin blades vanish at 16px, so the icon is the mark knocked out in white on a rounded accent square, which reads on a light or a dark tab bar. Inline rather than a file, for the same reason the fonts are embedded: `file://`, no server |

---

## What v3.2 changed, and why

v3.1 over-corrected. It read the "collection of boxes" complaint as *remove boxes*, when what was
actually wrong was that the boxes were too **loud**. Taking them away produced the opposite fault:
**"we removed many elements, for example in the overview. It now feels like floating elements, which
feels off."**

The correction, in one sentence: **the references all keep their boxes; what they don't do is let you
notice them.** *"Even though all of the boxes are present, the background and shadows are so light
that the boxes are not very evident. As a result, even when the boxes are used, the UI looks overly
clean."* That is the target, and it is a question of contrast, not of presence.

| # | v3.1 required | v3.2 requires | Why it changed |
|---|---|---|---|
| 1 | The KPI row unboxed — bare figures on the paper, hairline column rules | **Boxed again, and nearly invisible** (§7): white on a canvas one step further off white, `--shadow-0` of two very short layers, no border | **Reverses v3.1 #5.** Without a surface under them the figures had nothing to belong to and the row stopped reading as a row. The box is the container; the fix was never to delete it, it was to stop it shouting |
| 2 | `.grid` `align-items: start`, so a card sizes to its content | **`stretch`** — every box in a row squares off at the same height (§8) | **Reverses v3.1's consequence-change.** Widths vary by design; heights must not: "variable heights cause a lot of irregularity." Regularity is what makes a board read as laid out rather than assembled |
| 3 | *(nothing — the dead white that equal heights create was the reason v3.1 abandoned them)* | **Content fills its card.** A row list that is a card's whole body distributes its rows; a table does the same via `height:100%`; a chart's legend sinks to the bottom edge (§7) | This is what pays for #2. A five-row list beside a nine-row one used to leave ~200px of white, and **dead white inside a box is what makes the box conspicuous** — so the two complaints have one answer |
| 4 | The reconciliation strip on a plain white surface | **A pale accent wash, left to right, and the equation at 30/700** (§7) | On white it read as just another card, and it is the one component on every screen. The wash says "this is the product's own ledger, not one of this screen's panels" — and it spends no real accent moment, so the hero KPI still owns that |
| 5 | The strip's collapse chevron spaced off the stats | **`margin-left: auto` on the chevron itself** | Collapsed, the stats are hidden — and they were the only thing pushing the chevron right, so it slid in behind the equation and landed mid-strip: "the drawbar arrow moves to the middle of the bar instead of staying where it was" |
| 6 | The insight band as three bare columns on the paper | **One ink panel, three columns inside it** (§7) | Third attempt, and the reason is worth keeping: an insight is not a stat and not a chart, and both previous treatments made it look like one. **Differentiate by surface VALUE, not another hue** — every panel on a Finoptic screen is white; this one is ink |
| 7 | `thead th` `white-space: nowrap`; 12px cell padding; nowrap entity names | **Headers wrap, cells are 10px, secondary entity names wrap** (§6) | Each of the three set a floor under a table's own minimum width, and together they put a horizontal scrollbar under **nine** tables at 1200px — one of them flagged directly. A header on two lines is tidier than a scrollbar |
| 8 | `.kpi.hero` padding stated after the column-rule reset | **Hero padding matches every other tile (18px)** | v3.1's `.grid > .kpi:nth-child(4n+1)` out-specified `.kpi.hero` and zeroed its left padding, so the hero's icon and figure sat flush against the card edge **on every screen** — a specificity accident, not a design choice |

Also changed: default chart heights went up (`lineChart` and `stackedBars` 210→244, `bandChart`
230→268, `waterfall` 230→252), because a chart drawn short leaves a visible void in a card sized by
its neighbour.

**What is deliberately NOT fixed.** A chart SVG is fixed-aspect, so it cannot grow to fill a card
whose height comes from a taller neighbour — and the gap *widens* as the window narrows, because the
chart shrinks with the card width while a table beside it grows taller as its text wraps. The
finance waterfall is the worst case: ~110px of slack at 1440 and ~309px at 1200. Drawing it taller
was tried and looked worse — a zero-based waterfall whose anchors are $1.5M and whose steps are
$30-60K turns extra height into empty middle and its steps into slivers. The real fix is a
non-zero baseline on that one chart, which is a data-viz decision rather than a layout one.

---

## What v3.1 changed, and why

v3.0 was reviewed on 29 July 2026, the same day it shipped. The verdict was that it had gone too far in one direction: **"the app looks like a collection of boxes — whenever I see a box, it feels cluttered"**, and **"I feel that you have overused icons; you have placed icons everywhere."** Nine things changed. Most of them **reverse a v3.0 rule**; those are marked, and reinstating them is a regression, not a preference.

The pattern worth naming, because it will recur: v3.0 applied each reference move *everywhere it could*, on a consistency argument. Consistency was the wrong axis. **A texture that reads as material on a chart reads as dirt behind a 14px glyph, and an icon that helps on a KPI figure is noise on a card title that is already a label.**

| # | v3.0 required | v3.1 requires | Why it changed |
|---|---|---|---|
| 1 | Icon tiles hatched — the wash textured rather than flat | **Solid tiles, solid glyphs** (§3, §5). Hatch survives on chart data and the one hero card only | **Reverses v3.0 #6, in part.** At the 26px a tile is actually used at, stripes behind a 14px glyph read as dirt on the tile. The slant stays where the shape is big enough for a stripe to be a stripe |
| 2 | Hand-drawn single-weight **stroke** glyphs, defined inline in `app.js` | **The real Heroicons 24px SOLID set**, in its own `finoptic/icons.js` (§5). `.ic` fills rather than strokes | The hand-drawn set was consistent with itself and with nothing else, and read as sketched at the size it is mostly used at. A solid shape holds together at 14px |
| 3 | An icon tile on **every** KPI tile *and every card header*, inferred from the label | **KPI tiles only.** No icon on a card header, in a table, in a table header, in a status chip, in an empty state, or in the briefing band (§5, §7) | A card title is already a label; a glyph in front of it is a second label for the same thing. An icon on everything is the same as an icon on nothing |
| 4 | `KPI_ICON` ordered loosely by theme | **Ordered most-specific-first, and audited on DISTINCT icons per screen** (§7) | A broad pattern near the top swallowed whole screens: `/forecast/` took all four tiles on the forecasting screen, and the renewal/contract/vendor pattern took five of eight on procurement. Five figures wearing one glyph is the "everything is the same" fault in a different costume |
| 5 | Eight lifted KPI cards opening every screen | **The KPI row is not boxed** (§7): figures bare on the paper, divided by hairline column rules, with exactly one filled hero card as the anchor | The Loud reference's top row is one big number plus a free-flowing breakdown, not six identical tiles — DNA points 5 and 7. Eight surfaces with eight shadows were the boxes that read loudest, precisely because they are the emptiest |
| 6 | The briefing band as three lifted cards, each with a 3px role-coloured leading edge | **One rule-divided band on the paper** (§7). No surface, no shadow, **no left accent edges**, no icons — the label carries the role | A box inside a row of boxes, and an accent spent on an ornament. Both were named directly: "the inner row, which also contains three boxes… and the left border, our accent on these tiles, looks unattractive" |
| 7 | The reconciliation strip in the shell above the content; two labelled groups; four stats | **Inside the screen, below the page title, sticky under the top bar. No group labels, three stats, equation at 28px, and collapsible** (§7) | The headline was the third thing on the screen. And the strip's own labels were telling the reader what an equation is, in a row with no room for it: "the equation is a primary entity that is not very visible… unnecessary and crowd the already crowded row" |
| 8 | Every nav item carried its own glyph; the group header was set in the 9.5px Micro role | **Group headers carry the only icons in the sidebar, at 13.5/700 — larger than their own 12.5/500 items** (§8) | Seventeen item glyphs plus four group glyphs in a 276px column is the overload the collapsed rail already had, moved into the expanded one. And a header set in Micro was *smaller* than the items hanging off it, inverting the hierarchy it existed to establish |
| 9 | The four persona screens listed as nav rows **and** in the `View:` dropdown; the dataset picker in the top bar | **One row is the only route to those four screens** (§8) — the `View:` line in v3.1, `Dynamic Overview` since v4.0; the dataset picker joins the accent switcher under "Demo controls" in the profile menu (§10) | The same four names, twice, two clicks apart. And a dataset picker sitting beside the user's filters reads as a developer control in a user's toolbar |

Also changed as consequences: cards dropped to `--shadow-0` and lost their inner gradient; `.grid` is `align-items:start`, so a card sizes to its content instead of inheriting the tallest card's height in its row; the donut legend became a real grid (§6); the sidebar lockup is now **composed** from the mark plus a cropped wordmark rather than used whole (§11); and the `--gap`, `--accent-wash`, `--hatch`, `--hatch-dense` and `.tile.lg` tokens were deleted as dead.

**Two bugs the round exposed, worth knowing as failure modes rather than as history.** A filter narrowed `cloud.total` and `ai.total` but left their own breakdowns at whole-company figures, so a donut legend measured each slice against a total it was no longer part of and printed **216.1%** — hence the standing check that no share may exceed 100%. And `restore()` only ever *set* a filter from the URL, never cleared one, so following a shared link that carried fewer filters kept the old ones: **a shared link describes the whole view or it describes none of it.**

---

## What v3.0 changed, and why

v2.0 was reviewed against the reference commentary on 29 July 2026 and read as *correct but flat* — Lohith's brief for the round was headed **"an app, not an Excel dashboard"**, meaning the screens read as a spreadsheet rather than as a designed product. Ten things changed. Some of them **reverse a v2.0 rule**; those are marked, and reinstating them is a regression, not a preference. The full list of what was asked for, with the test that decided each one, is in [`../success-criteria.md`](../success-criteria.md).

| # | v2.0 required | v3.0 requires | Why it changed |
|---|---|---|---|
| 1 | The dataset hardcoded in `app.js` | **A data layer** — four scenario datasets registered from `finoptic/data/`, switched from a selector in the top bar, plus a real `.json` file loaded via `FileReader` and written back out by Export (§10) | A mock-up that can only tell one story can't answer "what would this look like for us?" on a client call. Filters, insight copy and every chart now follow the loaded numbers |
| 2 | Filter chips as decoration | **Filters that filter** (§7) — six dimensions, and each screen offers only the dimensions its own data carries | A dead chip is worse than an absent one. Restricting each screen to its own dimensions is also what keeps the bar to a single row |
| 3 | Breadcrumb row + filter row + ledger + page head stacked above the content | **One sticky row plus the ledger.** The breadcrumb is deleted outright; the page head moved into the scrolling content (§8) | The chrome ate about a fifth of a laptop viewport before a single number appeared, and the breadcrumb was not clickable |
| 4 | Seven ledger cells run together in one flat row with two small floating operators | **Two labelled groups** (§7): the equation on its own tinted sub-surface with sized, optically-centred operators, and a divided four-stat "Position" group. Group labels are a narrow left-hand column, not a row above | The equation did not read as an equation and the stats looked welded onto the end of it. Labels above would have cost the strip ~24px on every screen |
| 5 | `--grid-gap` 14 · `--pad-card` 16 · `--row-h` 40 · card title 15/700 with a 12px gap | **`--grid-gap` 22 · `--pad-card` 20 · `--row-h` 46 · card title 16/700 with a named `--card-h-gap` of 18px** (§4) | At the old density adjacent cards read as one table and a card title did not read as a headline. *Softens principle 4 — density is still a feature, but not at the cost of the whole board reading as a spreadsheet* |
| 6 | *"No hatch or dot texture anywhere"* | **Diagonal hatch is the signature fill** (§3, §6) — icon tiles, the hero card, bar meters, secondary chart series | **Reverses v2.0.** It is the commentary's DNA point 2, present in six of the chosen references, and it is how the Crozaint slant survives after slanted corners were dropped. It also separates stacked series without spending a second colour |
| 7 | Icons on functional chrome only; KPI tiles and card headers were bare text | **An icon tile on every KPI tile and card header** (§7), inferred from the label, plus **brand marks** for vendors and entity swatches for products (§5) | Bare labels on a dense numeric board are what made it read as a spreadsheet. Consistency matters more than any individual glyph: a board where some cards have an icon and some don't reads worse than one where none do |
| 8 | Insight/callout cards reserved as three quiet slots at the **foot** of each screen | **A briefing band** — What / Why / Do, with the Do card carrying its money figure and an action (§7). *Position later revised: v3.1 put it directly under the page title; **v4.0 moved it below the KPI tiles** (13.4).* | The product's whole claim is that it tells you what to do. At the foot of a screen, at caption weight, that claim was a footnote |
| 9 | Every table row highlighted on hover | **No hover on read-only rows.** Interactive tables opt in with `.tbl-live` (§6) | A hover highlight on an inert row promises an interaction that isn't there |
| 10 | Pipeline status chips tinted arbitrarily — Approved in amber | **A progression:** Identified grey → Under review amber → **Approved green** → In progress blue → Implemented green + tick (§7) | Amber on the one state that means "cleared to go" reads as a warning. Severity keeps its own ramp — a severity is not a step |

Also changed as consequences: the accent switcher moved out of the nav into the profile menu (§8), the collapsed rail shows group icons rather than every item icon (§8), and the persona switch became a `View:` line item inside the Overview group (§8) — *which v4.0 then moved onto the screen itself, leaving a `Dynamic Overview` row in its place (13.6)*.

---

## What v2.0 changed, and why

v1.1 was reviewed side-by-side against trakit on 29 July 2026 and read as unfinished — "a wireframe, not a product." Four of its rules were the cause and are now reversed. **Don't reinstate them.** Each entry says what v1.1 required, what v2.0 requires, and the reason.

| # | v1.1 required | v2.0 requires | Why it changed |
|---|---|---|---|
| 1 | Hairlines as the primary separator; a 1px border drawn around every card; shadows "rare" | **Elevation.** Cards have no outline — surface + `--shadow-1` + `--r-surface`. Hairlines survive only as *separators* | A 1px `#E4E9F0` border on a `#FAFAFA` canvas renders unevenly at fractional device pixel ratios — edges look broken, not precise. Boxing every card also flattens hierarchy: nothing can sit above anything else |
| 2 | Dimmed decimals on hero money figures (`$1.62M` with `.62` in `--ink-3`) | **No dimming.** A figure is one number in one colour | It reads as a rendering fault, not a refinement, and on the ledger strip it made equal-weight cells look unequally weighted — which breaks principle 1 (everything reconciles) |
| 3 | Status colours `--pos #15734A` / `--warn #8A5D06` / `--neg #A82F1C` "already correct" | **Bright status, three steps per role** — mark / ink / wash (§2) | Those values are desaturated near-browns. Good/bad/warning has to be readable at a glance across a dense financial screen |
| 4 | Charts keyed to a monochrome grey ramp `--g1…--g8`; no categorical palette | **A categorical spectrum `--c1…--c8` whose first slot is `--accent`** (§6) | Every plot stayed grey no matter which accent was selected — the palette switcher changed the chrome and nothing else. A monochrome ramp also can't carry 8 categories legibly |

Also changed, as consequences of the above: corners softened one step (§3), the hero KPI became a real accent card rather than a tile with an accent edge (§7), and the sidebar became a tree rail (§8).

---

## 0. Principles

1. **Everything reconciles.** The ledger strip's numbers must always agree with every other view of the same data — no visual treatment should make one number look more "official" than another within it.
2. **Precision, then polish.** Get the number, the grid and the alignment right first — but a correct screen that looks unfinished still fails. Depth comes from elevation and one deliberate colour moment, not from drawing lines around things.
3. **The accent is rationed.** One accent colour, spent deliberately — chrome, the logo, one primary action, the active nav item, the primary data series, and **exactly one full-strength accent object per board screen: the PERIOD FILTER PILL** *(v4.1)*. That slot used to belong to a hero KPI tile; the tile was deleted and the pill inherited its gradient, which is why 14.1 and 14.2 are one decision (§7, 14.1–14.2). The assistant's **focus veil** is the one further accent moment, and it is ground rather than an object — no text, no border, no edge, present only while the composer holds focus.
4. **Density is a feature — but calm comes from whitespace.** Finoptic holds a lot of financial detail legibly, and air is not free. But v3.0 established the floor: at the old spacing (§4) adjacent cards read as one continuous table, which cost more in comprehension than it bought in rows. Fit real information on screen; don't crowd it.
5. **Status is never brand.** Green/amber/red mean good/warning/critical, full stop — never the accent, never a category colour.
6. **Texture is Finoptic's own voice.** Diagonal hatch (§3) carries the Crozaint slant now that slanted corners are gone. It is a material, not a decoration: it goes where a surface should read as drawn rather than templated, and nowhere else.
7. **Say what a number is.** A figure that had to be scaled rather than measured is labelled "estimated" (§7); a control that does nothing is removed rather than left in place.

---

## 1. Typography

**Two typefaces, shared with the sibling `trakit` product by deliberate choice — not a coincidence, a decision to keep type consistent across Crozaint's products while colour and density stay distinct per product.**

- **Mona Sans** — every word: headings, body, labels, table cells, buttons, captions. Variable font, weights 200–900.
- **Space Grotesk** — reserved *only* for hero/metric numbers (the ledger strip, KPI figures, donut centre totals). Never for headings, body, or table figures.
- **TWO faces, and that is final** *(v3.9)*. A third — Fraunces, scoped to the assistant — was chosen against a live eight-serif comparison, built, and **removed on sight**: *"I didn't like the serif font… just stick to the brand fonts."* `finn-font.css` is deleted. The assistant differentiates itself by *register* instead — 14.5/1.62 body on a capped measure against the board's 13/1.45 — and its heading hierarchy comes from size, weight, space and a hairline (§12).
- **No monospace font anywhere, for anything.** Not labels, not table headers, not IDs. Align numbers with `font-variant-numeric: tabular-nums` on Mona Sans or Space Grotesk instead.
- **Loading:** self-hosted. `fonts.css` is **generated** — the woff2 files are embedded as base64, because Chrome refuses ordinary font-file loads from a `file://` page. Don't hand-edit it. System fallback: `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

### Type scale

Sized to Finoptic's density (13px body baseline), not trakit's roomier scale.

| Role | Size / weight | Font |
|---|---|---|
| Metric — hero KPI figure | 29 / 600 | Space Grotesk |
| Metric — ledger equation cell | 23 / 600 | Space Grotesk |
| Metric — standard KPI tile | 22 / 600 | Space Grotesk |
| Metric — briefing "Do" figure | 22 / 600 | Space Grotesk |
| H1 — page title | 21 / 700 | Mona Sans |
| Metric — ledger "Position" stat | 18 / 600 | Space Grotesk |
| H2 — section header | 17 / 700 | Mona Sans |
| Metric — donut centre total | 16 / 600 | Space Grotesk |
| **H3 — card title** | **16 / 700** | Mona Sans |
| Body-lg — briefing copy | 13.5 / 400 | Mona Sans |
| H4 | 13 / 700 | Mona Sans |
| Body | 13 / 400 | Mona Sans |
| Briefing role label | 12.5 / 700 | Mona Sans |
| Nav item | 12.5 / 500 | Mona Sans |
| H5 | 12 / 700 | Mona Sans |
| Body-sm | 12 / 400 | Mona Sans |
| H6 — small heading / eyebrow | 11 / 700 | Mona Sans |
| Caption | 11 / 400 | Mona Sans |
| Micro — table headers, filter chips, ledger cell labels, ledger group labels, KPI labels, briefing role header | 9.5 / 500 | Mona Sans |

The card title moved from 15 to **16 / 700** in v3.0 and gained `--card-h-gap` (§4) beneath it. At 15/700 twelve pixels above its first row, a card title did not read as a headline — it read as the first line of the content. Body-lg exists only for briefing copy: the band has to compete with the KPI row rather than apologise to it (§7).

- **All headings (H1–H6) share one weight, 700** — differentiate levels by size only, never by mixing weights.
- Line-height: ~1.15–1.2 on headings and metrics; 1.45 on body.
- Letter-spacing: −0.01em to −0.02em on headings and metrics; default (0) elsewhere.
- **No `text-transform: uppercase` anywhere** — not H6, not eyebrows, not table headers. This is absolute and v4.0 did not touch it: differentiate small labels by size/weight/muted colour only.
- **HEADINGS ARE TITLE CASE, every word** *(v4.0, replacing "sentence case always")* — page titles, card headers, KPI labels, column headers, section headings, nav rows, empty states, menu headings. Not AP style: `Spend By Vendor`, not `Spend by Vendor`. Everything that is NOT a heading stays sentence case — `sub:` lines, `hint:` chips, `note:` footers, the insight band's prose, field labels, and the assistant's answer headlines, which are sentences. A word carrying an uppercase letter after its first character is left alone, which is what protects SaaS/AI/YTD/EC2/MoM without a word list; `titleCase()` in `core.js` does the two headings built from data. See 13.1–13.2.
- **Slashed zero:** Mona Sans has a slashed-zero glyph; Space Grotesk does not. Enable `font-variant-numeric: slashed-zero` on Mona Sans figures and ID/key strings where `0`/`O` confusion matters; leave Space Grotesk metrics with a plain zero (forcing the feature there does nothing — no glyph to switch to).
- **A figure is one number in one colour.** No dimmed decimals, no split weight inside a figure, no colouring part of a number. Status colour applies to a whole figure or none of it. *(Reverses v1.1 — see the change table.)*
  - **This is the one place the reference commentary is deliberately not followed.** Its DNA point 6 asks for dimmed decimals on big money figures, citing Loud and Salezy. v1.1 implemented exactly that; Lohith called it *"unacceptable"* and it was removed. The later, explicit instruction wins. Flagged here rather than silently re-litigated, so a future session reading the commentary alone doesn't reintroduce it.
- The one exception to "one colour" is the **hero KPI on the accent card**, where the whole figure goes white.

---

## 2. Colour

### Accent — swappable via `--accent` / `--accent-strong` / `--accent-bg`

| Preset | Accent | Strong | Tint |
|---|---|---|---|
| **Orange (chosen)** | `#FF5600` | `#CC4300` | `#FFEEE3` |
| Blue (comparison) | `#146EF5` | `#0E57C6` | `#E9F1FE` |
| Monochrome (safety net) | `--ink` | `--g2` | `--surface-2` |

Switch live via the **profile menu's** "Accent" control (§8) — it used to sit in the nav, where it read as a developer control — or hand-set `data-palette` on `<html>` for a locked build. `--grad-accent` (`148deg`, accent → accent-strong) is the gradient used on the hero KPI tile, the primary button, and the sidebar avatar. Two derived tokens support the hatch and the bar lists: `--accent-soft` (62% accent on white) and `--accent-wash` (8%).

### Neutrals

`--paper #F7F8FA` · `--surface #FFFFFF` · `--surface-2 #EDF1F7` (sunken/hover) · `--surface-3 #F4F7FB` (a tinted sub-surface — the ledger equation group, the promoted briefing card, a `.tbl-live` row on hover) · `--ink #0B1220` → `--ink-2 #5B6675` → `--ink-3 #8B95A5` → `--ink-4 #AEB7C4` · `--line #E4E9F0` · `--line-2 #CFD8E3`.

### Status — bright marks, deep inks, light washes

Three tokens per role, because brightness and legibility pull in opposite directions at 11px:

| Role | Mark (fills, meters, bars, chart series, icons) | Ink (badge text, delta text, small type) | Wash (badge background) |
|---|---|---|---|
| Good | `--pos #16A34A` | `--pos-ink #15803D` | `--pos-bg #E7F6EC` |
| Critical | `--neg #DC2626` | `--neg-ink #C81E1E` | `--neg-bg #FDEAEA` |
| Warning | `--warn #F59E0B` | `--warn-ink #B45309` | `--warn-bg #FCF1DA` |
| Informational | `--info #2563EB` | `--info-ink #1D4ED8` | `--info-bg #E9F1FE` |

- **Rule:** anything a reader *reads* takes the `-ink` step; anything they *see as colour* takes the mark. Large metrics (≥21px) may use the mark directly — except **amber**, whose mark is unreadable as text at any size, so amber text is always `--warn-ink`.
- Status is reserved: never a category colour, never doubled as the brand.

### Categorical spectrum — `--c1 … --c8`

`--c1: var(--accent)` · `--c2 #146EF5` · `--c3 #0EA5C4` · `--c4 #8B5CF6` · `--c5 #EC4899` · `--c6 #6366F1` · `--c7 #C08457` · `--c8 #D946EF` · rollup `--c-other #7887A0`.

- **Slot 1 is the accent on purpose.** The primary / "actual" / "total" series is a brand moment, so switching the accent recolours the lead line, the lead donut slice and the ranked bars in every chart.
- Slots 2–8 deliberately contain **no green, amber or red** — a category must never read as an alert.
- Cap a view at 8 keys; roll the tail into `--c-other`.
- The **blue** preset moves the ember `#EA580C` into slot 2, because slot 1 has taken the blue. The **monochrome** preset maps `--c1…--c8` onto the neutral ramp `--g1…--g8` — it is the one intentionally monochrome option.
- `--g1…--g8` survive for genuinely neutral marks only: a comparison baseline, a ghost/prior-period line, an "all other" rollup. Never a category key.

### Colour follows the entity

Every vendor, cloud provider, product and AI model gets one fixed spectrum slot, identical in its card, chart series, legend swatch and table cell. The registry lives in `ENTITY` at the top of `app.js` — add there, not inline at a call site.

### Known tensions (documented, not bugs)

- The orange accent and `--neg` are both warm reds. Never place a plain accent-coloured element directly next to a `--neg` badge with nothing labelling which is which.
- In the **blue** preset, `--info` and the accent are both blue, so an informational badge can momentarily read as brand. Orange is the chosen accent, so this only affects the comparison preset.
- White on `--accent` at small sizes is below WCAG AA. The hero KPI card therefore never puts text below **11px/600** on the gradient, and its label runs at full white.

---

## 3. Surfaces, elevation, corners, texture

### Elevation, not outlines

**Cards carry no border.** Surface colour + `--shadow-1` + `--r-surface`, plus a barely-there vertical sheen (`#FFFFFF` → `#FDFDFE`). *(Reverses v1.1 — see the change table.)*

| Token | Use | Value |
|---|---|---|
| `--shadow-1` | resting card, KPI tile, ledger strip, sidebar | `0 1px 2px rgba(11,18,32,.04), 0 4px 10px rgba(11,18,32,.045)` |
| `--shadow-2` | raised / hover | `0 2px 4px rgba(11,18,32,.06), 0 14px 34px rgba(11,18,32,.10)` |
| `--shadow-float` | menus, modals, toasts | `0 18px 48px rgba(11,18,32,.18), 0 4px 10px rgba(11,18,32,.10)` |
| `--shadow-accent` | the hero KPI card only | `0 10px 26px color-mix(in srgb, var(--accent) 28%, transparent)` |

`--shadow-1` is kept faint deliberately: every card lands on the grey `--paper` canvas, where a heavier shadow reads as a smudge rather than a lift.

### Where hairlines still belong

Hairlines are **separators**, not enclosures. Legitimate: table row dividers and header rules, the band above a `.card-note`, dividers between ledger cells, the rules between sidebar groups, the sidebar's own outer edge (it is tall enough that a shadow alone leaves its edge ambiguous), and strokes inside an SVG diagram. Illegitimate: a box drawn around a card, KPI tile, insight or chip group.

### Corners

One step softer than v1.1, because a 10px card read as a table cell. Still tighter than trakit's 16px — Finoptic is a denser instrument.

`--r-surface: 14px` (cards, panels, modals, the ledger strip, the sidebar) · `--r-control: 10px` (buttons, inputs, selects, nav items, icon buttons) · `--r-tile: 9px` (icon tiles, the avatar) · `--r-chip: 6px` (chips, badges, tags — never a pill) · `--r-bar: 4px` (progress and breakdown bars).

**No pills anywhere.** Nothing is `border-radius: 9999px`. The only round things are genuinely circular graphics: donut arcs, the persona focus dot, a status dot inside a chip.

### Hatch texture — the signature fill

*(New in v3.0; **scope cut back hard in v3.1.**)* Fine 45° stripes inside an otherwise plain shape. This is the commentary's DNA point 2 — present in Aeros, Financia, Airzone, AI-fashion, Rexora and Salezy — and it is **how the Crozaint slant survives now that slanted corners have been dropped: the slant migrated from the corner into the fill.** Hatch is a material, not an ornament.

**It belongs on the DATA, and on one card.** v3.0 also hatched every icon tile, following Aeros literally, and that was rejected on sight: *"you have used a hatched pattern for the icon boxes, which I dislike."* The lesson generalises — **a stripe needs a shape big enough to read as a stripe.** On a bar, a chart area or a full-bleed hero card it is material; behind a 14px glyph on a 26px tile it is dirt.

**Mechanics — two implementations of one texture, and they must stay visually identical.**

| Where | How |
|---|---|
| CSS | **One utility survives:** `--hatch-light`, a 1px stripe on a 9px pitch in `rgba(255,255,255,.07)`, for the white sheen on the single hero card per screen. Applied on an `::before` at `inset: 0`, never as the element's own background. *(`--hatch` and `--hatch-dense` were deleted in v3.1 with the icon tiles they existed for.)* |
| SVG (chart series) | `HATCH` in `finoptic/brands.js` — `<pattern>` templates (`template` 5px / `dense` 3px / `wide` 8px) with `{ID}`, `{COLOR}` and `{OPACITY}` placeholders. Drop the filled template into a `<defs>` and reference it as `fill="url(#id)"` over the shape's own gradient fill. Colour goes through `var(--cN)`, so a hatched series tracks the live accent |

**Colour:** hatch never introduces a new hue. In SVG, set `{COLOR}` to the series' own `--cN`; on a saturated surface use `--hatch-light`, because the same stripe reads far stronger over a fill than over a wash.

**Allowed:** the hero KPI card (at `--hatch-light` only), utilisation/breakdown bar meters, and the second and subsequent series of a stacked chart (§6).

**Not allowed:** 🚫 **icon tiles** — the v3.1 reversal, and the one most likely to creep back in. Also table cells or rows, text of any size, badges and chips, card surfaces at large, the sidebar avatar, the primary chart series (it carries the gradient instead), and any area small enough that the stripes read as noise or large enough that they shimmer against the pixel grid.

---

## 4. Spacing & density

Every number here went up in v3.0. The old set was tight enough that adjacent cards read as one continuous table, which is what "claustrophobic" and "an Excel dashboard" meant.

| Token | Value | Was (v2.0) |
|---|---|---|
| `--pad-card` | **20px** | 16px |
| `--grid-gap` | **22px** | 14px |
| **`--card-h-gap`** | **18px** | *(didn't exist — was a literal 12px)* |
| `--row-h` (table row) | **46px** | 40px |
| `--control-h` | 34px | 34px |
| `--nav` (sidebar width) | 276px — the narrowest that fits "IT financial management" beside its icon and its "home" tag | 274px |
| `--nav` collapsed | 76px — the mini group rail (§8) | 72px |

**`--card-h-gap` is named, not inlined, on purpose.** It is the single measurement Lohith flagged: the space between a card's title and the first row of its content. It is used in three places that must stay in step — `.card-b`'s top padding, the `margin-top` of a table or row-list sitting directly under a header, and (negated) the `.bleed` utility that lets a full-bleed list sit flush to the card edges. Change it in one place and all three move together; hardcode 18px anywhere and they drift.

Base rhythm 4px. Content stays fluid full-width inside a `1600px`-capped shell. Tap targets ≥44px on mobile regardless of desktop density.

---

## 5. Iconography & brand marks

Three distinct things live here and must not be confused: **glyphs** (`.ic`), **brand marks** (`.bm`), and **icon tiles** (`.tile`).

### Glyphs — `.ic`

- **The real Heroicons 24px SOLID set** — heroicons.com, by Tailwind Labs — fetched file by file, path data untouched. *(v3.1. v3.0 used ~40 hand-drawn single-weight stroke glyphs; they were consistent with each other and with nothing else, and at the 14px they are mostly used at they read as sketched. A solid shape holds together small, and it is what makes a tile look finished rather than drawn.)*
- **Inline SVG, not an icon font.** The set lives in `ICONS` in its own **`finoptic/icons.js`**, on a 24px grid, `fill: currentColor`, `stroke: none`; 18px rendered (14px via `.ic.sm`, 20px via `.ic.lg`). A CDN webfont is not an option — the mock-up must open from a `file://` path with no network. Add a glyph by fetching it from the Heroicons repo and stripping its hardcoded `fill`; **keep `fill-rule`/`clip-rule`**, because several solid glyphs lose their knockouts without them. Reference a glyph by name; never paste a second copy of a path into markup.
- **Nav-group glyphs** are `GROUP_ICONS_SOLID` in the same `icons.js`, one per sidebar section, from the same Heroicons set. They matter more than their size suggests: they are **the only icons in the sidebar** (§8), and in the collapsed rail a group glyph is the *only* thing representing its section.
- The logo mark (§11) is Finoptic's one distinctive mark — reserve it for brand moments (sidebar, empty states, a loading indicator), not as a general icon.

### Brand marks — `.bm`, a separate class from icons

Vendor logos are **identity, not iconography**, and they are a different class of object from a glyph.

- They live in `BRANDS` in `finoptic/brands.js` — **17 genuine official marks**, on a 24px grid, rendered at 17px. Geometry comes from **Simple Icons** (the canonical open-source collection) with each brand's official hex; where a mark is genuinely multi-colour and made of exact primitives — Microsoft, Google, Google Cloud, Figma, Miro, Zoom — the true multi-colour artwork is used instead, because at 17px colour carries most of the recognition. *(v3.1. v3.0 used 16 hand-drawn "simplified geometric stand-ins": "I think you did not use the correct ones and instead created them yourself.")*
- **AWS is the known weak one.** AWS publishes no standalone symbol — its logo *is* the wordmark plus the smile — so it goes soft at 17px. Using the real lockup is still the right call over inventing a symbol.
- A vendor with no artwork falls back to `.bm-l`, a lettermark tile. **That fallback is for TABLES only,** where every row genuinely is a vendor and an initial is an honest placeholder. In a list or a legend, use `entityMark()`: it renders the mark where there is one and the entity swatch where there is not, inside a fixed 17px `.bm-slot` so names stay on one x. Otherwise "Logs", "Metrics", "Traces" and "All other vendors" render as tidy little L / M / T / A lettermarks, as though they were companies.
- **Every shape carries its own literal brand hex** as explicit `fill`/`stroke` presentation attributes, never inherited.
- **A brand mark must never take the `.ic` class.** `.ic` forces `fill: none; stroke: currentColor`, which would erase a multi-colour logo outright. This is the single most likely way to break one, so it is a rule rather than a note.
- No gradients, no filters, no external references inside a mark — the mock-up opens from a `file://` path, so everything is inline geometry. A mark authored on a larger native viewBox is wrapped in a `<g transform>` to normalise it to `0 0 24 24`.
- A vendor's *product* takes the vendor's mark: Microsoft Sentinel, Microsoft Purview, Entra ID P2 and Defender all carry Microsoft's. Register these in `STATIC_BRAND`, which is also how a name that only ever appears inside a chart series gets a mark.
- Where colour identifies an *internal* entity rather than a vendor (a product, an environment), use the entity swatch instead: a 9px `--r-chip`-cornered square in the entity's registered spectrum slot (§2). A table is not exempt from "colour follows the entity."

### Icon tiles — `.tile`

The bridge between a glyph and the board: a solid glyph centred on a **solid tinted square** (`--r-tile`, 30px; `.sm` 26px).

**Tiles appear on KPI figures and NOWHERE else.** This is the v3.1 rule that matters most, because v3.0's rule was the opposite: it inferred a tile for every card header too, on the argument that a board where some cards have an icon and some don't reads worse than one where none do. That argument was wrong here — *"you have placed icons everywhere, even in insights where they make no sense, as well as in tables, table headers, and chart cards. I do not need those. I want icons only within the start cards."* A card title is already a label; a glyph in front of it is a second label for the same thing.

**The wash is flat.** v3.0 hatched it, chasing Aeros' "icons with character"; see §3 for why that came back off.

- Tone variants `.pos` / `.neg` / `.warn` / `.info` / `.n` set the wash, the glyph's ink and `--hatch-c` together. **The tile is the one place status colour is allowed to be bright at small size**, because the glyph is a shape, not text (§2).
- On the hero KPI card the tile inverts to a translucent white wash.
- How the glyph is chosen without hand-tagging every call site — and the audit that keeps the choice honest — is in §7.

### Where an icon is still allowed outside a KPI tile

Only on a **control**: the sidebar's group headers and collapse chevron, the top bar's Export / Share buttons, the profile menu's rows, the reconciliation strip's collapse chevron, and the toast's confirmation tick. These are affordances, not decoration — an icon-only control has to say what it does. Everything else on a screen is text, a figure, a brand mark or an entity swatch.

---

## 6. Data visualization

### Every chart is zero-based, including the waterfall

**A broken axis was built for the variance waterfall and reverted on sight.** Worth recording, because
the reasoning for it is genuinely good and someone will propose it again.

The problem is real: a variance walk opens at ~$1.5M and closes at ~$1.62M through steps of $30–90K,
so zero-based the two anchors fill the plot and each step between them is a sliver. Starting the axis
below the walk made the steps legible and lifted them from a few percent of the plot to 81–93%.

It was reverted anyway, and the reason generalises: **a bar chart whose bars do not start at zero has
to be read carefully rather than glanced at.** Breaking the axis turns two totals into truncated
columns, and no amount of marking the break — a labelled floor, a break glyph on each anchor — removes
the moment of interpretation it demands. On a screen a client reads in a minute, glanceable and honest
beats legible and qualified.

So: **zero-based, and the cost is accepted.** The anchors dominate, the steps are small, and the card
carries slack because extra height goes into the empty middle rather than into the bars. If this comes
up again, it is a decision that has been made twice, not an oversight.

### The donut legend is a table, so it is laid out as one### The donut legend is a table, so it is laid out as one

*(v3.1.)* Two legend shapes, and they are different things. A **series key** under a line or bar chart wraps inline — order does not matter. The **breakdown beside a donut** is every slice, its figure and its share: that is a table, so it is a real grid, one column per field — colour key · brand mark · name · value · share — with each row as `display: contents` so the columns align down the list.

v3.0 built it as one flex row per item with the value pushed right by `margin-left: auto`, so **each value started wherever that row's name happened to end.** Down seven provider names that reads as broken alignment, and it is what *"the data below the pie chart tables is not correct — the alignment is mismatched"* was pointing at.

**The mark column exists only when something in the list has a mark**, so a legend of plain labels carries no empty gutter; a row without one gets an empty cell rather than an invented lettermark (§5). Where the slices are vendors, cloud providers or AI providers, **the legend carries both the coloured square and the logo** — the square is the key back to the chart, the logo is recognition. v3.0 showed only the square, which is the second half of the same flagged fault: *"there are places, such as the spend by provider chart, where the brand logo should have been used but wasn't."*

- **Colour comes from the spectrum (§2), never from a grey ramp.** The promoted series takes `--c1` (= the accent); a neutral comparison line takes `--g4`/`--g5`.
- **Line / area:** gradient area fill on the promoted series — series colour at **28%** at the top fading to transparent at the baseline. (28, not trakit's 35: slot 1 is a warm hue here, and orange at 35% over a tall plot stops being a fill and becomes the subject.) End-point dots on the actual series; a **dashed ghost line** for a prior-period or forecast comparison.
- **Bars:** a subtle vertical gradient, a shade lighter at the top (`color-mix(… 74%, #fff)` → the series colour). Flat fills read as templated.
- **Stacked series — hatch, not a second hue.** In a stack, every series after the first takes a diagonal hatch `<pattern>` (§3) painted over its own gradient fill. This is deliberately a **colour-blind-safe** separation: the stack still reads apart with no colour vision at all, in greyscale print, and in the monochrome palette preset — none of which a hue-only stack survives. It is also the commentary's Airzone note ("texture as a CVD-safe way to tell series apart") and it spends no extra spectrum slot. Alternate: odd-indexed series hatched, even-indexed plain, so no two adjacent bands share a treatment.
- **Ranked bar lists:** one hue, gradienting from `--accent-soft` at the origin to `--accent` at each bar's own tip, with `--hatch-light` over the fill. Where every row is a registered entity (§2) the bar takes the entity's own colour instead, and a brand mark or swatch leads the row label. `o.highlight` promotes one row a step deeper (accent → accent-strong) *and drops its hatch* — the promoted bar is the solid one, per Rexora and Salezy. No grey bar lists.
- **Waterfall:** neutral ink anchors (opening/closing), full-brightness status colour on the steps between them — never dimmed with opacity, the steps are the whole point.
- **Confidence bands:** the promoted series' hue at ~14% alpha, not a grey wash — the band belongs to the line it brackets.
- **Donut/pie:** centre total in Space Grotesk; legend as a mini-table (swatch · name · value · %) drawing swatch colours from the same expression the slices use, so a slice and its legend entry cannot drift apart.
- **Meters / utilisation bars:** a `--surface-2` track, the fill from a bright status mark, hatched, value right-aligned in `tabular-nums`.
- **Tables never get gradient, texture, or accent-coloured rows** — hairline dividers, right-aligned `tabular-nums`, a status chip where relevant, a brand mark or entity swatch where colour is the key. That's the full vocabulary for a data row. Hatch is explicitly not part of it (§3).
- **No hover state on a read-only table.** *(Reverses v2.0, which highlighted every row.)* A hover highlight on an inert row promises a click that isn't there. A table that genuinely drills opts in with `.tbl-live`, which restores `cursor: pointer` and a `--surface-3` row hover.
- **An empty result is a designed state, not a blank card.** A filter combination can legitimately select nothing; charts return a titled empty state that names the fix ("Widen the period filter to see a trend"), never an axis with no data on it.
- **Say when a number was scaled.** A chart or card whose figures were apportioned rather than measured under the current filters carries the "estimated" marker (§7) — the alternative is presenting a derived number with the authority of a measured one.

---

## 7. Components

### Reconciliation ledger strip

Its own component, not a KPI card. One lifted surface (`--r-surface`, `--shadow-1`), and **the equation is the strip** — everything else on it is subordinate to that.

**It renders inside the screen, below the page title and below the controls row, and pins from there.** `position: sticky; top: --controls-h`. v3.0 put it in the shell above the content, which made it permanent but also put it above the headline, so the screen's own title was the second or third thing you read. Now the title sets the context, and the strip sticks under the controls row the moment you scroll past it. Emitted by `head()`, which is what guarantees the order on all 17 screens.

1. **The equation** — `Spend − Budget = Variance`, figures at **28px**, with **operators sized up (21px) and optically centred on the figures, not on the cell** — the Micro label above each figure would otherwise push the operator visibly low. Operators appear only where the arithmetic is real.
2. **Three position stats**, right-aligned, hairline-divided, at 15px — deliberately most of a step down from the equation.

**No group labels.** v3.0 headed the two halves "Budget reconciliation" and "Position", in a narrow left-hand column. Both were dead weight in a row with no room for it — a label over an equation is telling the reader what an equation is, and "Forecast year-end" says what it is without a heading over it. **And three stats, not four:** "Realised" folded into the savings cell's sub-line, where it belongs, because it is a share of that figure rather than a peer of it.

**It collapses.** Persistent chrome has to be dismissible, so a chevron on the right toggles `data-ledger="min"` on `<html>` — which is also why the state survives every re-render without being tracked in JS. **Collapsed it does not disappear:** it keeps the equation on one 41px line, with the terms named inline where the stacked labels were, because a reconciliation figure you cannot see is the thing this strip exists to prevent.

Each cell is a Micro label, a Space Grotesk figure, and an optional 10.5px sub-line. Only reserved status colour distinguishes a figure, and amber always takes `--warn-ink` (§2).

### KPI tiles

**NOT CARDS.** This is v3.1's single biggest de-boxing move. Eight lifted surfaces opened every screen, and they were the boxes that read loudest *because they are the emptiest*: a label, a figure, a footnote, and a lot of edge. The Loud reference does the opposite — one big number, then a free-flowing breakdown ruled off beside it, no boxes at all (DNA 5 and 7).

So: **figures sit bare on the paper, a hairline column rule separates one from the next, and exactly one tile per screen is a real card.** The rule is drawn with `.kpi + .kpi` and reset at every fourth child, so a wrapped row does not open with a rule hanging off nothing, and never against the filled hero.

Anatomy: **an icon tile, then the label, then the figure, then an optional delta + footnote.**

- **Every tile carries a glyph, and this is the only place on a screen that does** (§5). "YTD budget" and "Budget variance" as bare text is what made the board read as a spreadsheet, and those two were named specifically.
- **The glyph is inferred from the tile's own label**, via an ordered pattern list (`KPI_ICON` in `app.js`) that also sets the tone. The labels are already descriptive, so the mapping is stable, and any call site can override with `ic:` / `tone:`. This is a deliberate choice over hand-tagging ~130 call sites across 17 screens.
- **Order is load-bearing, and the test is DISTINCT icons per screen.** v3.0 ordered the list loosely by theme, and a broad pattern near the top ate whole screens: `/forecast/` took all four tiles on the forecasting screen (including "Forecast accuracy", which measures a forecast rather than being one) and the renewal/contract/vendor pattern took five of eight on procurement. **Five figures wearing the same glyph is the "everything is the same" fault in a different costume.** The list is now most-specific-first, and the standing check is that no 8-tile screen falls below 5 distinct glyphs and no tile repeats more than 3 times. The one accepted exception is the cloud screen, where three provider tiles share the cloud glyph because they *are* three clouds — and a KPI tile must not use a brand logo (§5).
- **Exactly one hero per screen**: the accent gradient card, `--hatch-light` over the gradient so the one coloured card reads as material rather than a flat swatch, white ink, `--shadow-accent`, figure at 29px, label at 11px/600 white, and the icon tile inverted to a translucent white wash. A delta inside the hero becomes a white chip on a translucent wash (status colour would vanish into the gradient). *(v1.1 marked the hero with a 2px accent left edge, which was indistinguishable at a glance.)*

### Card header

The flagged fault was that a card title did not read as a headline and sat almost on top of its first row. Anatomy, left to right: **title (16/700) with an optional 11.5px grey sub-line · a right-aligned hint or the "estimated" marker.** Then `--card-h-gap` (§4) of real space before the first row of content.

- 🚫 **No icon.** v3.0 inferred a tile for all ~60 card titles via a `CARD_ICON` table; both are gone (§5). The `ic:` / `tone:` arguments a few screens still pass are accepted and ignored, so that removing them is not a 60-site edit.
- The **"estimated" marker** replaces the hint when the current filters forced the card's figures to be apportioned rather than selected. A scaled number presented as a measured one is the failure this exists to prevent (principle 7).
- A card can end in a note band welded to its bottom edge, over a hairline — **on the card's own surface, not a `--surface-2` fill.** A filled band is another edge, and a filled one at that.
- **Cards are `--shadow-0` and flat white**, not `--shadow-1` with an inner gradient. A card holding a chart or a table genuinely needs to be a region; it does not need to announce itself as an object, and a dozen of them announcing themselves is what "a collection of boxes" meant.
- **`.grid` is `align-items: start`.** Stretched, every card in a row took the tallest card's height, so a five-row list beside a nine-row list carried ~150px of empty white — and an empty box reads as a box far louder than a full one.

### The briefing band — the insight pattern

*(Replaces v2.0's three quiet callouts at the foot of each screen. **Re-cut in v3.1 from three cards into one band.**)* **What / Why / Do, BELOW the KPI tiles and above the first chart** *(v4.0; v3.1 had it directly under the page title)*. The product's whole claim is that it tells you what to do; at the bottom of a screen at caption weight, that claim was a footnote — so it competes with the KPI row rather than apologising to it. It moved DOWN one position because three columns of prose between the reconciliation equation and the first figure meant reading the conclusion before seeing anything it was drawn from. It must never move below the charts: that is the footnote position v3.1 rescued it from. `placeBriefing()` in `shell.js` does the move, once per render, so `head()` stays the single place the page head is composed.

**The first cell is DERIVED, not authored, and is labelled `What You Might Miss`.** Its job is to carry what a level and a variance cannot: concentration, when the variance accrued, the latest month against the year's own pace, the fastest-moving line, the size of the tail, and how many feeds the whole board is standing on. Probes are scored 0–100 for notability; the best prints and a second only if it scores 25 or more; if nothing scores, the authored `what` is used instead. See 13.5.

- **One region of the paper, ruled top and bottom, its three parts divided by column rules.** No surface, no shadow, no radius. v3.0 made each of the three a lifted card with a 3px role-coloured leading edge, which put a box inside a row of boxes and spent an accent on an ornament: *"the inner row, which also contains three boxes… and the left border, our accent on these tiles, looks unattractive."*
- 🚫 **No icons, no role edges.** Role is carried by the label, which is what a label is for.
- Each column: an 11.5/700 role label, then Body-lg copy (13.5px, line-height 1.5) with `<b>` on the figures that matter.
- **The Do column is the promoted one**: **its money figure in Space Grotesk at 22px in `--pos-ink`** — the band's single coloured moment — plus a short qualifier and a real action button. Money plus a verb is what makes it an instruction rather than an observation.
- **Copy comes from the dataset**, one `insights` block per screen (`what` / `why` / `do` / `doValue` / `doLabel`), so switching scenario re-narrates every screen. A screen with no entry renders no band rather than a generic one.
- Below 1320px it goes two-up with Do spanning both columns — and Do swaps its column rule for a horizontal one, because a full-width row with a left rule and a 26px indent reads as a mistake. Below 920px it stacks entirely, on horizontal rules.
- The old treatment survives as `.insight` for **in-card** use only — the per-anomaly "Explained" blocks — and its 3px left status edge went the same way as the band's. It is a hairline above and a role-coloured Micro label now, and it is not a screen-level pattern.

### Status chips

Boxy (`--r-chip`), never a pill: `-bg` wash behind `-ink` text, optionally led by a 6px dot or a glyph. Severity keeps its own ramp — critical = neg, high = warn, medium = info, low = grey — because **a severity is not a step.**

**The optimisation pipeline is a progression, and its chips must read as one:**

| State | Tone | Means |
|---|---|---|
| Identified | neutral grey | nothing has happened yet |
| Under review | amber | waiting on a decision |
| **Approved** | **green** | decision made, cleared to go |
| In progress | blue | being worked |
| Implemented | green | banked |

*(v2.0 put Approved in amber, which reads as a warning about the one state that means "go." Amber belongs to the state that is actually waiting on someone.)*

🚫 **No glyph in a chip.** v3.0 gave Implemented a tick; it went with the rest of the in-table icons (§5). Green plus the word "Implemented" is not ambiguous. The same five stages *do* appear as icon tiles on the optimisation screen's KPI row, via `ST_ICON`, because that is a KPI row — and there "Under review" takes the scales rather than a check-badge, which is what "Approved" looks like.

### The rest

- **Buttons** — primary: `--grad-accent`, white text, `--r-control`, one per screen. Secondary: surface + hairline + a 1px shadow. Ghost: text-only. Destructive: `--neg`. An icon may lead the label at 14px (`.ic.sm`). `.btn.sm` for in-card actions.
- **Filters** — real dropdowns, not decoration. **The value list is portalled to `<body>` as `position: fixed`, anchored to the pill's on-screen rect.** This is not a nicety: parented to the pill it was invisible, because the filter row was `overflow-x: auto` and CSS promotes the other axis to `auto` alongside it, so a 300px menu opened inside a 34px-tall clipping box. The pills responded to every click; the menu was being cut away. Anything that moves a pill (scroll, resize) closes the menu rather than stranding it. A hairline chip per dimension showing `Label · value`, with the dimension name dropped when the value already starts with it (or the Product pill reads "Product Product Beta"); the "set" state fills with `--ink`, not the accent, because filters are navigation, not a brand moment, and carries an `×` to clear. **ONE EXCEPTION, added in v4.0: the PERIOD pill is permanently accent-tinted** — accent wash, accent-strong 700 value, accent glyph, going solid accent when a custom range is set. Period is the board's subject rather than a narrowing of it, it is the only dimension with no unset state to be quiet in, and it had been reading as the least of four equals. Tinted rather than solid so it does not compete with the screen's one hero tile. See 13.3. **A screen only offers the dimensions its own data carries** — that restriction is what holds the bar to one row, and an unusable chip is worse than an absent one. A "Clear *n*" link appears once anything is set.
- **Popover menu** — one component for the profile menu and every filter dropdown: `--shadow-float`, never a bordered box, with a Micro header row and `--accent-bg` on the selected option.
- **Icon-only controls carry a CSS tooltip** (`.tip` + `data-tip`) and an `aria-label`. Export and Share are icon buttons, so hovering has to name the action.
- **Toast** — Export and Share are real actions now, so they confirm. Silence after a click reads as a broken button; the toast also writes to a live region.

---

## 8. Layout & navigation

### Sidebar — a floating tree rail

*(Replaces v1.1's flat grouped list. The list was legible but visually inert, and the solid-accent active row shouted on every screen.)* Anatomy, top → bottom:

1. **Floating card:** inset 12px from the shell edges, `--r-surface`, `--shadow-1`, a hairline outer edge, and a barely-there vertical gradient (`--sidebar-grad`).
2. **Brand lockup, COMPOSED not used whole** (§11): the **mark** in its own column on the left, and a second column beside it holding the **wordmark stacked directly above the byline "By Crozaint.com"**, sharing a left edge. Plus a **collapse chevron**. *(v3.1. Used whole, the lockup put the mark and the wordmark on one baseline and left the byline to start under the MARK, so "finoptic" and "By Crozaint.com" sat in two different lanes and the block read as three unrelated things.)* All three pieces are the **real SVG artwork** from `finoptic-logo/`, injected from the generated `finoptic/logo.js`, never text set in a substitute face. One hairline under the whole block.
3. **Grouped sections** (Overview / Spend / Manage / Reference). Each group header is a group glyph (§5) plus a sentence-case label plus a **collapse caret**; groups are separated by hairlines.
   - **The header is 13.5/700 — LARGER than its own 12.5/500 items.** v3.0 set it in the 9.5px Micro role, i.e. smaller than the items hanging off it, which inverted the hierarchy the header existed to establish.
   - **The group glyph is the only icon in the sidebar.** v3.0 gave all seventeen items their own glyph as well: *"everything currently has an icon, which creates visual overload."* An icon marks a section; a section's contents are text. The glyph is also all that represents the section in the collapsed rail.
5. **Tree rail:** one continuous faint trunk per group, with **every item hanging off it by its own rounded elbow** (per-item `::before`: `border-left` + `border-bottom` + `border-bottom-left-radius`; the first item's elbow extends up to the group header). The trunk is **never highlighted — not even under the active item.** Because each elbow is positioned off a *fixed* previous-item height, **every nav item must be exactly one line** — labels are `nowrap` + ellipsis. A wrapped label breaks the trunk.
5. **Item:** 🚫 **no icon** — a 12.5/500 text label, 33px tall, `--r-control`. Hover = `--surface-2`. **Active = a soft left→right accent gradient wash** (20% → 8%) with `--accent-strong` text. No solid fill, no glow, no icon tile.
6. **THE RAIL HOLDS NO CONTROLS** *(v4.0)*. It holds rows that go somewhere, and the Overview group holds two of them: `Executive Overview` and **`Dynamic Overview`**. The second is an ALIAS, not a screen — `go()` resolves it to whichever of the four lens homes the active lens points at — which is what lets one row stand for four screens without the group listing all four, the duplication v3.1 deleted. It is lit by `personaOf(current)` rather than by an id match, because the screen you land on is the lens's home and never `dynamic` itself, and it carries the active lens's short name on its right as a quiet label: size, weight and `--ink-4`, never a chip, because a bordered pill in the rail would read as the thing you press to change it.

   *History, because three shapes were tried and the reasoning for each still applies: v2.0 gave the persona switch a block of its own labelled "Viewing as". v3.0 demoted it to a `View:` line but LEFT the four screens listed as rows in the same group — the same four names twice, two clicks apart. v3.1 deleted the rows. v3.5 made the line a SPLIT control, because a single button that only opened a menu could not open the view it named. **v4.0 removed it from the rail entirely** and put the switch on the screen it governs (§7, "Viewing as") — the split control's reasoning does not survive the move: there the name had to navigate because the rail was the only route to the view, and on the view itself there is nowhere to go.*
8. **Persona overlay:** the persona's landing screen is tagged `home`; its other focus screens carry a small 55%-opacity accent dot.
9. **Footer: the profile row and its menu.** The row is avatar (`--grad-accent`, hatched with `--hatch-light`) + name + workspace + a caret that rotates when open, over a hairline, with an unread dot on the avatar. It opens a `--shadow-float` menu upward holding **everything about "me, and how I'm looking at this"**: notifications with a count and sign out, then a **"Demo controls"** group holding the **dataset picker** (with the scenario's tone dot), the **accent switcher**, and "Load a dataset (JSON)…" (§10). The menu is 300px, wider than the rail it hangs off, because a dataset name is a sentence and at the nav's own width the select truncated it.

**Fold state: only Overview opens.** Spend, Manage and Reference start folded, and `shutGroups` is
seeded that way rather than empty. Two reasons, and both matter: a sidebar that opens with all
seventeen items showing spends its whole height describing screens the user did not ask for; and
**Overview is the group you are actually in**, because a cold start opens on the Executive overview.
Overview is also the group you are already looking at on the default screen
behind a click — it has to be the open one.

Three rules keep that state coherent:

- **Arriving at a screen unfolds its group.** You cannot be inside a folded group — from the nav, a
  shared link or the lens switch. For the four persona screens `groupOf()` answers Overview, which is
  where their Dynamic Overview row is.
- **Only a real navigation unfolds, never a re-render.** `refresh()` calls `go(current)`, so
  unfolding unconditionally would re-open a group the user had just folded every time they touched a
  filter.
- **A group icon in the collapsed rail navigates**, as well as expanding the sidebar and opening the
  group — it goes to that group's first screen. Expanding to a list you then have to click again is
  a wasted step, and in the mini rail that icon is the only affordance there is.

The group list scrolls when it must; **the scrollbar is hidden and the last 18px fade out** via a mask instead — a visible scrollbar beside a floating card reads as a defect, a fade reads as "there is more below."

**Collapsed state — a 76px group rail, not an icon board.** `data-nav="mini"` on `<html>`. **One icon per *group*, not per item: four, not seventeen.** Seventeen glyphs in a 76px column read as an icon board with no structure; four read as sections you can aim at. Clicking a group icon expands the rail and opens that group. The group containing the current screen carries the active state (`--accent-bg` tile), since no individual item is visible to carry it. Group hairlines are retained; the expand chevron sits at the top and exists **only** in this state. The footer collapses to the avatar alone — notifications and sign-out are inside the menu, which opens sideways here because a 240px menu cannot hang off a 76px rail. Below 1180px the CSS forces the mini rail regardless of the toggle.

### The rest

- **No bar above the content at all** (v3.4). `--controls-h`, 48px, sits inside the screen. *(v2.0 stacked a breadcrumb row, a filter row, the ledger and the page head: about a fifth of a laptop viewport before a single number appeared.)* It holds the filter chips on the left and, on the right, the "as of" line and the Export / Share icon buttons. **The dataset picker is not here** — it moved to the profile menu, because a demo control beside the user's own filters reads as a developer control in a user's toolbar.
- **The page title is the FIRST thing on a screen**, then the controls row, then the reconciliation strip, then the insight band — all four emitted by `head()`, which is what makes the order true on all 17 screens. A screen has to say what it is before it says a number, or offers a dropdown.
- **There is no breadcrumb.** It was deleted, not restyled: it was not clickable and led nowhere. Don't reintroduce one without making it navigate.
- **The page head lives in the scrolling content**, not in the sticky chrome, so it scrolls away. It emits the briefing band (§7) directly beneath itself — that adjacency is the pattern, not a coincidence of markup.
- **The controls row is opaque `--paper`**, with no bottom hairline and no blur. A row that fades to transparent at its own bottom edge was fine when nothing pinned beneath it — the reconciliation strip does, and bled through. It is also what stops the page head showing through as it scrolls away.
- **One accent moment per screen:** the hero KPI card. It matters more now than it did, because it is the only *boxed* thing in the KPI row (§7) — which is exactly what makes it read as promoted rather than merely different.
- Content stays fluid full-width inside the `1600px`-capped shell.

---

## 9. Motion

Full spec is Phase 3's job (`../03-experience-and-engagement.md`); the constraints this guide sets: transitions ~150–200ms, snappy not languid (nav items, buttons, chips and rows already run at 150ms); motion communicates state changes (drill-down, persona switch, nav collapse), never brand; `prefers-reduced-motion` always has a static fallback (already respected globally).

---

## 10. Delivery, and the data layer

- **HTML + separate linked CSS and JS files in the same folder** (`finoptic/index.html`, `styles.css`, `app.js`, `brands.js`, generated `logo.js` and `fonts.css`, plus `data/`) — no build step, no framework, no bundler. Load order is fixed: `data/registry.js` → the scenario files → `logo.js` → `brands.js` → `app.js`.
- Must still open by double-click (`file://`). Relative `<link>`/`<script src>` work fine there; **`fetch()`/XHR of local files does not.** This one constraint explains four decisions: fonts are base64-embedded (§1), icons and brand marks are inline SVG (§5), the datasets are `.js` wrappers rather than `.json` files, and a user-supplied `.json` has to arrive through `FileReader`.
- The palette-switcher pattern stays — don't hardcode the final accent choice in a way that removes the ability to swap it.
- Static markup carries `data-icon` / `data-logo` placeholders that `app.js` fills from `ICONS` and `LOGO`, so a glyph and the logo artwork each live in exactly one place.

### The data layer

**Nothing on screen is hardcoded data.** `RAW` is the loaded dataset exactly as authored; `D` is `RAW` after the active filters. **Screens only ever read `D`**, so a filter change is a re-render rather than a special case inside every screen. The contract — shape, field meanings and 14 reconciliation invariants — is `finoptic/data/SCHEMA.md`, and `app.js` logs an error if a loaded dataset breaks them.

Each dataset is a one-line `FINOPTIC.scenario({ …pure JSON… })` wrapper: everything inside the braces is valid JSON, so it can be lifted out and parsed. Four ship — `baseline`, `ai-crisis`, `optimised`, `scaleup` — and they are written to read as genuinely different *stories*, not the same story at different magnitudes: the sign of the variance, the anomaly count and the status mix all differ. Per-screen insight copy (§7) travels in the dataset, so switching one re-narrates the whole mock-up.

### The scenario selector, and the other demo controls

- **The scenario selector sits in the top bar, not in a menu.** It is a demo control, but a first-class one — a JSON-driven mock-up whose dataset switch is hidden has given away its whole point. A hairline control with a tone dot (`ok` / `warn` / `crit`, from the dataset's own `tone`) and the custom two-triangle caret.
- **Load a real `.json`** from the profile menu → an `<input type="file">` + `FileReader`. Re-importing the same `id` replaces the previous copy rather than duplicating it.
- **Export** writes CSV of every table visible on the current screen — headed with dataset, filter scope and as-of date — *and* the active dataset as JSON, in the exact shape the picker reads back. The round trip is real, and it has to stay real.
- **Share** copies a URL encoding dataset + screen + view + filters. The clipboard API can be refused on a `file://` origin, so it falls back twice and then shows the link for manual copying.
- **Demo controls that mutate the view belong in one of two places only:** the top bar if changing them is the point of the demo (scenario, filters), or the profile menu if they are about the viewer rather than the data (accent, dataset loading). Not loose in the nav.

---

## 11. Logo & brand mark

- Assets: `../../finoptic-logo/finoptic-logo.svg` and `.png` — four-blade aperture/pinwheel icon + "Fin"/"optic" wordmark.
- **The mock-up uses the real artwork, not a substitute.** `finoptic/logo.js` is **generated** from that SVG and holds three entries: `lock` (the full lockup), **`word` (the wordmark alone, cropped to its own ink at `viewBox="111.46 14.56 300.87 72.96"`, 13px tall)** and `mark` (the mark alone, 29px). Don't hand-edit it — regenerate it from the artwork. The wordmark is outlined paths, so the letterforms are exactly the logo's rather than the nearest available face.
- **The sidebar lockup is composed from `mark` + `word`, not `lock`** (§8). `lock` is kept for any context that wants the lockup on one baseline. `word` is sized by **height, not width** — it is cropped to its ink, so a fixed height sets the cap height and the width follows.
- Colour comes from two classes inside the artwork: `.lw-ink` takes `--ink` ("Fin") and `.lw-accent` takes `--accent` ("optic" and the mark), so the lockup follows the palette switcher. Deliberate while the accent is still being compared live; once the accent is locked, hardcode the colours instead.
- Reserve the mark for brand moments — sidebar, empty states, a loading indicator. It is not a general-purpose icon (§5).

---

## Hard-rules checklist

**Type**
- ✅ Mona Sans for everything textual; Space Grotesk **only** for hero/metric numbers.
- 🚫 **No third typeface.** One was built for the assistant and removed; hierarchy inside an answer comes from size, weight, space and a hairline (§1, §12).
- 🚫 No monospace font anywhere.
- 🚫 No `text-transform: uppercase` anywhere. **Still absolute** — v4.0 changed heading CASE, not this.
- ✅ **Every heading is Title Case, every word capitalised** — pages, cards, KPI labels, column headers, section headings, nav rows, empty states, menus. 🚫 Not AP style, and 🚫 not sentence case, which this replaced. Sentences stay sentences: `sub:`, `hint:`, `note:`, band prose, field labels, the assistant's answer headlines (§1, 13.1–13.2).
- ✅ **A word with an uppercase letter after its first character is left alone** — that rule, not a word list, is what protects SaaS/AI/YTD/EC2/MoM. Headings built from data go through `titleCase()`.
- ✅ All headings (H1–H6) share weight 700; differentiate by size only.
- ✅ `tabular-nums` on every aligned number; slashed zero on Mona Sans figures/IDs only (Space Grotesk has no slashed-zero glyph).
- 🚫 **No dimmed decimals** — a figure is one number in one colour. *This overrides the reference commentary's DNA point 6, deliberately.*
- ✅ Card title is **16 / 700**, with `--card-h-gap` beneath it.

**Colour, surface, texture**
- ✅ **Elevation, not outlines:** a card has no border — `--shadow-0` + `--r-surface`, flat white, no inner gradient. Hairlines only as genuine separators.
- ✅ **Boxes are PRESENT and nearly invisible.** Every panel and every KPI figure sits on a surface; the canvas is one step off white and the shadow is two very short layers. Deleting the box is not the way to make a board calm — quietening it is.
- 🚫 **No 3px role edge on anything.** The briefing band's and `.insight`'s leading accent bars are gone; role is carried by the label.
- ✅ **Every box in a grid row squares off at the same height** (`align-items: stretch`). Widths vary; heights do not.
- ✅ **A row list clips to five, with a `Show all N` control.** Uniform box heights need the lists to be the same LENGTH, not the rows stretched to the same height. Opening one grows its whole grid row — the boxes stay uniform, they just get taller together.
- ✅ **The shadow is one 1px hairline at 3.5%.** A card in the grid does not float. Real floating (nav, popovers, the reconciliation strip) uses `--shadow-1`.
- ✅ **The neutrals are WARM.** `--paper` #F8F7F4, and `--surface-2` / `--surface-3` / the hairlines warmed with it — a cool patch on a warm page reads as a mistake.
- ✅ Corners 14px surfaces / 10px controls / 9px tiles / 6px chips / 4px bars. Never a pill.
- ✅ **Status is a three-token role** (mark / ink / wash). Small text takes the ink; amber text *always* takes the ink. The icon tile is the one exception where a bright mark is allowed small.
- ✅ Status colours are reserved — never brand, never a category.
- ✅ **Hatch goes on the DATA and on one card** — bar meters, secondary chart series, and the hero card at `--hatch-light`. Never a new hue.
- 🚫 **Never hatch an icon tile** (the v3.1 reversal), a table cell or row, text, a chip, a card surface at large, or the primary chart series.
- ✅ Accent is rationed: chrome, logo, one primary action, active nav item, the primary series, the Do card in the briefing band, and — since v4.1, carrying the full gradient the deleted hero tile used to wear — **the period filter pill** (§0.3, 14.1–14.2). The assistant's focus veil is the one further accent moment, and it is ground.

**Data**
- ✅ **Charts use `--c1…--c8`, and `--c1` is the accent.** Grey ramp only for baselines, ghosts and rollups.
- ✅ In a stack, series after the first are **hatched, not re-hued** — it is the colour-blind-safe separation and it spends no spectrum slot.
- ✅ Colour follows the entity: same slot in card, chart, legend and table. Register it in `ENTITY`, never inline.
- 🚫 **No hover state on a read-only table row.** Interactive tables opt in with `.tbl-live`.
- ✅ An apportioned figure is marked **"estimated"**; an empty filter result gets a designed empty state.

**Icons and marks**
- ✅ Glyphs are the real **Heroicons 24px SOLID** set, from `ICONS` / `GROUP_ICONS_SOLID` in `finoptic/icons.js` — never an icon font, never a duplicated path, never hand-drawn. `.ic` fills; it does not stroke.
- ✅ **An icon tile belongs on a KPI figure and nowhere else.**
- 🚫 **No icon** on a card header, in a table, in a table header, in a status chip, in an empty state, or in the briefing band. Outside a KPI tile, an icon appears only on a **control** (§5).
- ✅ **`KPI_ICON` is ordered most-specific-first**, and the test is distinct glyphs per screen — no 8-tile screen below 5, no glyph more than 3 times.
- ✅ Brand marks are the **real official artwork** (Simple Icons geometry, official hexes; true multi-colour where the mark is). Never hand-drawn stand-ins.
- ✅ In a list or legend use `entityMark()`, so a non-vendor row gets a swatch in a fixed-width slot instead of an invented lettermark. `.bm-l` is for tables only.
- 🚫 **A brand mark (`.bm`) must never take `.ic`** — `.ic` forces `fill:none; stroke:currentColor` and would erase a multi-colour logo. Brand marks keep their own literal hexes.
- ✅ The logo comes from generated `logo.js`; don't hand-edit it and don't set the wordmark in a substitute face.

**Layout, components, delivery**
- ✅ **The page title is the first thing on a screen** — then the controls row, then the reconciliation strip, then the KPI tiles, then the insight band. `head()` is still the single place the page head is composed; `placeBriefing()` moves the band one position down after the render (§7, 13.4).
- 🚫 **No chrome bar in the shell.** The shell is the sidebar and the screen. Filters, "as of" and Export / Share are a `.controls` row inside the screen, sticky at top 0, with an opaque `--paper` background — and their handlers are delegated, because the row is rebuilt on every render.
- ✅ Reconciliation strip carries a **pale accent wash** and its chevron owns `margin-left:auto`, so it stays on the right edge when the strip collapses.
- ✅ Reconciliation strip: **the equation is the strip** — 28px figures, sized optically-centred operators, three subordinate stats, 🚫 **no group labels**. Sticky under the top bar, and **collapsible** (collapsed it keeps the equation on one line). Never a KPI hero card.
- ✅ **The KPI row is not boxed** — bare figures, hairline column rules, exactly one filled hero card.
- ✅ **The insight band is ONE INK PANEL**, **in the summary region's Key Insights pane, above the first chart**, never at the foot of a screen; three columns inside it, no icons, no role edges, and its Do column carries a money figure and an action. It is the only non-white panel on a screen, and that is the whole point — differentiate an insight by surface **value**, not by another hue.
- ✅ **The band's first cell is DERIVED and says what the tiles and the strip cannot** — shape, timing, pace, the fastest mover, the tail, the feed coverage. Labelled `What You Might Miss`, scored for notability, falling back to the authored `what` when nothing scores. 🚫 It must never restate the reconciliation equation in words: that was the redundancy it was built to remove (§7, 13.5).
- ✅ A donut legend is a **grid**, not flex-with-`margin-left:auto`, and carries brand marks where the slices are vendors.
- ✅ Pipeline chips read as a progression, and **Approved is green.** No glyph inside a chip.
- ✅ **One sticky row plus the ledger** above the content. 🚫 No breadcrumb.
- ✅ **Tree-rail sidebar**, one line per item, trunk never highlighted, active item = accent wash (not a solid fill).
- ✅ **The group header is the only icon in the sidebar, and it is LARGER than its items** (13.5/700 vs 12.5/500). Items are plain text.
- ✅ **The `View:` split control in the Overview rail is the only route to the four persona screens** — they have no rows of their own. The name opens the active lens, the caret switches it. 🚫 Not in the page head, and 🚫 no `Dynamic Overview` row: both were built in v4.0 and reverted (§8, 14.8).
- ✅ **Collapsed rail shows four group icons, not seventeen item icons** — and clicking one expands the sidebar, opens that group AND goes to its first screen.
- ✅ **Only Overview is open on load.** A real navigation unfolds the group it lands in; a re-render never does. A cold start opens on the Executive overview, which is what makes Overview the group you are in.
- ✅ The sidebar lockup is **composed**: mark in one column, wordmark stacked above the byline in the next.
- ✅ **A filter's value menu is portalled to `<body>` as `position: fixed`.** Parented to its pill, an ancestor's `overflow` clips it and the filter looks dead.
- ✅ Demo controls live in the profile menu under "Demo controls" (dataset, accent, JSON loading) — never in the top bar beside the user's filters, never loose in the nav.
- ✅ **A table must fit its card.** Headers wrap, cells are 10px (6px on the leading edge of a numeric column), secondary entity names wrap, and a code-plus-name cell stacks rather than running on one line. Anything that cannot wrap sets a floor under the table's minimum width and produces a horizontal scrollbar.
- ✅ **The 5/7 split goes full-width at 1300px**, well before the rest of the grid does: it is the narrowest asymmetric pair, and a five-column card at that width cannot hold a five-column table however tightly it is set. It was 1250 until the cost-centre table's owner column gained an avatar and needed ~22px it did not have at 1280.
- 🚫 **No broken axes.** Every chart is zero-based, the waterfall included. Breaking it was built and reverted: a bar that does not start at zero has to be read rather than glanced at (§6).
- ✅ **No share may exceed 100%.** If one does, a total narrowed under a filter and its own breakdown did not (§10).
- ✅ **A shared link describes the whole view or none of it** — `restore()` sets every filter from the URL, including to nothing.
- ✅ Screens read `D`, never `RAW`; a dataset must satisfy `data/SCHEMA.md`'s invariants.
- ✅ HTML + linked CSS/JS files, no build step, still double-click-runnable — and no `fetch()` of a local file.
- ✅ **A KPI glyph is grey, on nothing** — no tile, no wash, no status tone (§5). Two boxed treatments have been rejected; do not build a third.
- ✅ **A KPI standing for a vendor wears the vendor's mark and keeps its name** — exact name match only, and never with `.ic` (§5).
- ✅ **The reconciliation strip is a ticket**: notches at a dashed perforation, equation spread across the body, stats on the counterfoil. Inside the equation nothing is grey (§7).
- ✅ **Every dimension except period is multi-select**, and selecting all of them collapses back to "All" — a filter that excludes nothing must not claim to be filtering (§7).
- ✅ **The period pill wears `--grad-accent` with the hatch overlay and NO OUTLINE**, and it is the only filter that is anything but `--ink` when set (§7, 14.2).
- 🚫 **No hero KPI tile.** Every tile on a screen is identical; `hero:true` is accepted and ignored so one place decides rather than twenty (§7, 14.1).
- ✅ **The KPI tiles and the insight band share one tabbed region, and it has ONE SHAPE ON EVERY SCREEN** — headline and tabs on the CANVAS above both panes, **`Metrics` default**, **exactly four tiles**, and **one** footnote — `View KPIs ›` inside the ink band, because a footnote needs a surface to belong to. 🚫 Not one card wrapping both — that was built and taken out (§7, 14.3–14.5). 🚫 **No flat variant, no three-tile screen and no five-tile screen** (§7, 18.1, 18.5). 🚫 **No second footnote under the tiles** — four separate cards give it nothing to sit inside and it floats however it is styled (§7, 19.3).
- ✅ **The reconciliation counterfoil is per-screen and survives collapsing.** Its stats are PASSED IN by the screen, never recomputed in the strip (§7, 14.6). 🚫 **But no KPI tile on that screen may restate one of its lanes** — same figure or same label. A complement is fine; the same number twice is not (§7, 17.1).
- ✅ **Every figure is the PERIOD value with a YTD byline under it** — strip lane and KPI tile alike, the byline in `.ledger-sub`'s treatment. 🚫 **No tile label may say "YTD" over a figure that moves with the period pill** (§7, 17.3). ✅ **A tile's byline is two rows** — the measurements divided by a middot, then the qualifier on its own line, the divider an `::after` on the item before it so it can never open a wrapped line (§7, 18.4).
- ✅ **A KPI tile carries its trend INLINE, HEAVY and IN `--c1`** — 76×32px at a 2.6px stroke, right of the figure, only the months the figure was computed from, answering a hover. It draws **the months themselves, never a running total**, on **the series' own range rather than from zero**, with a flat draw below 12% spread, and it is **smoothed with MONOTONE CUBIC interpolation so it can never overshoot into a month that did not happen**. 🚫 Never a status colour — §0.3's accent budget governs CHROME, and this is data ink — and 🚫 **never on a structural count** (`Vendors`, `Active Contracts`, `Applications`), because there is no honest history of those (§7, 19.1, 19.2, 18.2, 17.8).
- ✅ **The insight band is ONE POINTER per authored column, as a real `<ul>`** — only the derived first column may carry two, and only because its two are two different findings. It stays the one INK panel. 🚫 Not paragraphs, and 🚫 never two sentences of the same finding (§7, 18.6).
- 🚫 **No hardcoded ratio, and no delta against a period the schema does not hold.** A figure that does not move when the data does is deleted, not apportioned (§7, 17.7).
- ✅ **A screen only offers period if its own content responds to it.** `optimize` and `alerts` have no period pill because `deriveView()` does not scope a backlog or an open-alert feed by month, and a control that changed nothing would be worse than none (§7).
- ✅ **EVERY RANKED PLOT, LIST AND TABLE IS DESCENDING**, sorted inside the drawing function so all ~40 call sites obey at once and a runtime-loaded dataset cannot break it. A table sorts on the currency column with the **largest absolute total** — three positional rules were tried and each broke a real table. 🚫 Never sort a time series or a waterfall. Exceptions carry `order:'keep'` and there are exactly three (§6, 13.7).
- ✅ **`tail: true` pins a rolled-up remainder to the bottom** of a ranked list — "All other vendors (26)" is a remainder, not a vendor, and must not sort above the eighth one (§6).
- ✅ **A donut and its legend run the identical comparator.** They are handed the same array by the same call site, so sorting one alone silently mislabels every slice (§6).
- ✅ **Where a list is severity-ranked, money descends WITHIN each band** — burying a Critical under a larger High is the wrong list, and the sort key must be the figure the reader reaches first (§6, 13.7).
- 🚫 **No fake precision on a monthly dataset.** The custom range resolves to WHOLE MONTHS and says so. Interpolating a daily curve would be the most convincing lie in the mock-up (§7).
- ✅ **Every table sorts; every table past six rows filters** — both reading the rendered cells, so all ~40 get it at once (§7).
- ✅ **A table's outer cells take the card's padding**, so its text edge lines up with the card title. Inner cells stay at 10px (§7).
- ✅ **A person is a circle; an entity is a rounded square.** That distinction is the only legend either token gets (§7).
- ✅ **A modal is portalled to `<body>`** with a focus trap, Escape, scrim click, scroll lock and focus return (§7).
- ✅ **"Nothing to show" states its cause** — filtered / not connected / detail missing / no history / not your role — and the filtered one computes its own fix from the live filters (§7).
- ✅ **The sidebar opens at every width**; below 1180px it floats over the board on a scrim and the mini rail keeps its place in the layout (§8).
- ✅ **Nothing pins at phone width, and both header rows wrap.** They wrap rather than scroll — `overflow-x` on `.filters` is the bug that made the filter menus invisible for a whole round (§8).
- ✅ **Motion's finished state is its natural state**: hidden states live only inside keyframes reached with `animation-fill-mode: backwards`, so an interrupted animation cannot strand anything invisible (§9).
- 🚫 **Nothing animates on a filter change.** Entrances play on navigation only (§9).
- ✅ **Every plot answers a hover**, through a full-height hit band rather than the mark itself, in a WHITE panel — ink is reserved for the briefing band (§6).
- ✅ **Pinned is its own state** — full-bleed, no radius, no lift, no notches — and the strip collapses while RESERVING its height, so the document never changes length (§8).
- ✅ **One Sort & filter control per table**; headers are inert. Multi-select within a column, AND across columns (§6).
- 🚫 **No invented identity on a real face.** A person is one given name, and it is their photo's filename; stock portraits are recorded as stock (§7).
- ✅ **A photograph takes the same pale accent ground an orb does**, the sidebar tile included. The accent stays rationed to one hero card (§0.3, §7).
- 🚫 **No reconciliation strip on a screen about people or about creating a row** (§7).
- 🚫 **A form never invents an answer.** Unanswered is an em dash (§7).
- ✅ **Toasts stack top-right**, on a timer rather than animationend (§9).
- ✅ **Onboarding is a flow**, one chapter on screen at a time, one accent button per chapter (§9).
- ✅ **The assistant is CENTRED**: a composer in the middle of the bottom edge at rest, a surface at ~82% of the viewport when asked, full screen on request. 🚫 Never a corner pod (§12).
- ✅ **Its resting composer animates** — it cycles what you could ask, and clicking it raises three suggestions out of its own top edge (§12). 🚫 **But the MARK does not** — see the next block.

**Finn's mark and its motion** *(v4.2 — the source of truth is `reference`'s sibling folder `finn/`: the implementation guide and the verified `finn-motion-v8.html` prototype)*
- ✅ **Finn's mark is a CREATURE** — two black eyes, an orange hub that is also the arms, two legs. 🚫 Not a crop of the Finoptic pinwheel any more (15.1), and 🚫 nothing in Finn may touch the parent mark.
- 🚫 **Never re-draw, re-round, re-format or SVGO the mark.** Path data, the baked transforms, the **115.023° / 64.977°** leg rotations and the weld origins (**47/65 at y 42.2**; leg local **(0,0)**) are closed. The nested `<g>` wrappers are load-bearing — collapsing one breaks the motion while the resting silhouette still looks right (15.2).
- ✅ **DOCKED IS FROZEN** — no breath, no drift, no blink while the conversation is closed. 🚫 The v3.9 breathing mark is not to be reinstated (15.3). One `alert` pulse is docked's only exception.
- ✅ **Eight states, one at a time, on the scope element**, each bound to a real lifecycle event; every instance of the mark moves in lockstep. 🚫 No per-instance state (15.4).
- ✅ **`settle` is never skipped** — it plays even when there was no thinking to show, and it is the graceful stop for a failure too. 🚫 No error animation (15.4).
- 🚫 **THE HUB NEVER ANIMATES.** Its stillness is the anchor of the whole system (15.5).
- ✅ **All four limbs telescope length-only** about their own weld, arms leading legs by one beat. 🚫 No uniform whole-creature scale, 🚫 no per-limb stagger beyond the paired leg lag, 🚫 no pinwheel⇄creature morph, 🚫 **no continuous rotation of anything** — each was built and rejected (15.5).
- ✅ **The eyes blink, randomised 3.8–7.2s at 110ms**, and dip during thinking. 🚫 Never frozen during body motion, 🚫 never co-scaling with the limbs (15.6).
- ✅ **Only the five `--think-*` / `--eye-*` numbers are tunable**, in one labelled block. The auto-return timers and the CSS animation lengths are two halves of one number (15.7).
- ✅ **The mark carries its own literal `#FF5600` and black.** 🚫 Never `.ic`, never recoloured — it is a brand mark (§5), so it stays orange under the Blue and Mono presets by design (15.8).
- ✅ **Reduce-motion and `?nofx` stop everything and the mark still renders.** The blink is stopped in JS, because a class on a timer is out of a media query's reach (15.9).
- ✅ **The mark is drawn at 30px** in all three instances, from one variable, with the byline gutter derived from the tile. 🚫 Not small enough that its own motion cannot be seen (16.8).

**The assistant's progress, actions and dictation** *(v4.3)*
- ✅ **ONE STATE, ONE REPRESENTATION.** 🚫 No indicator may animate a fact the mark is already animating — that is what deleted the three bouncing dots (16.1).
- ✅ **The byline IS the progress line**: `Finn` `is thinking` → `is about to answer`, one row, name stated once, cleared when the answer starts. 🚫 Never a status line beneath a name label (16.2).
- ✅ **The status text shimmers via a gradient swept through it**, range **100%→0%** — outside that the image leaves the box and `background-clip:text` makes the words vanish rather than fall back (16.2).
- ✅ **One dancing box, at the end of that line**, squashing as it lands. 🚫 Not three (16.3).
- ✅ **Every answer carries an action bar and every control in it acts** — Copy · Show the working · Good answer · Needs work. Ink and grey, hairline above, last answer's bar always visible and earlier ones faded back. 🚫 No accent in it (16.4).
- ✅ **Copy is plain text**, tables tab-separated, two clipboard routes and an admission if both fail (16.5).
- ✅ **A verdict is stored and reversible, and a downvote asks why** — three real reasons, and the acknowledgement is specific to the reason. 🚫 Never "thanks for your feedback" (16.6).
- ✅ **`Show the working` is PER MESSAGE** and must not move the global Brief/Full switch (16.4).
- ✅ **Dictation's waveform is driven by a real `AnalyserNode`**, the `AudioContext` is resumed, the meter starts after recognition and fails silently, and **`interimResults` is off** so the transcript lands only once speech ends. 🚫 No keyframe waveform — it is the canned-microphone rejection in better clothes (16.7).
- ✅ **Plots and tables are INLINE**, each on a tinted panel with a titled header. 🚫 No artifact side pane — it was built and removed (§12).
- ✅ **Brief and Full change the ANSWER, not the window.** Full adds the numbered working; nothing resizes (§12).
- ✅ **Thinking accumulates**, and its steps ARE the working Full prints — so the log cannot show reasoning the answer does not contain (§12).
- ✅ **The veil is white→transparent, has three states, and sits at z-index 20** — above the board, **below the sidebar**, gone once the scrim takes over (§12).
- ✅ **The assistant greets with something it already knows** about this workspace. 🚫 It never opens on a catalogue of questions (§12).
- ✅ **A flex row wraps prose in one span** — a flex container blockifies inline children, so an unwrapped `<b>` becomes its own flex item and the row gap opens around it (§12).
- ✅ **A stored chat pins its resolution and keeps its questions, not its answers** — reopening re-derives and flags a changed dataset (§12).
- ✅ **Every answer names the feeds it read**, and flags one that is not healthy (§12).
- 🚫 **No simulated microphone.** Real `SpeechRecognition` or no button — a mic that fills the box with a scripted question claims something that did not happen (§12, 7.17).
- ✅ **The assistant reuses `charts.js` and `components.js`** — no new plot types, real vendor marks, and the empty-state family with its **See how to connect** comes free (§12).
