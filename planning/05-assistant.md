# Phase 5 — Finn, the assistant

**Status:** Built, 30 July 2026 · mark and motion rebuilt 31 July · **Spec:** Brand Guide **§12** (v3.9) + **15.1–15.9** (v4.2, the mark and its motion) + **16.1–16.8** (v4.3, progress, actions, dictation) · **Code:** `finoptic/assistant.js`, `assistant-content.js`, `finn-logo.js`, `styles.css` §12, markup in `index.html`
**Motion source of truth:** [`design-language/finn/`](design-language/finn/) — `finn-implementation-guide.md` and the verified `finn-motion-v8.html` prototype. Geometry and timings are copied from it, never re-derived.
**Navigator:** [`00-overview.md`](00-overview.md)

A conversational layer over the existing board. It answers **24 pre-written questions** across four categories, in two answer styles, with the board's own charts and brand marks — and it is honest about what it cannot answer.

It is **not** connected to a model. Nothing in it calls a provider, and nothing in it says it is a demo.

**This phase was reviewed twice in build and rebuilt substantially both times.** The rejected first version is recorded in §09, because most of what is right about the current one is the reason something in it was wrong.

---

## 01 — The shape of it

| State | What it is |
|---|---|
| **Resting** | One composer, horizontally **centred** near the bottom edge, **cycling** what you could ask it, with the mark **completely still** beside it — this is the `docked` state (§02b). A short white veil lifts it off the board. |
| **Focused** | Three suggestions **rise out of the composer's own top edge**, staggered. The veil grows taller and denser to ground them. The surface stays closed — focusing is not asking. |
| **Conversation** | Asking opens a surface at **~82% of the viewport**, centred, on a white veil that ghosts and desaturates the board. The thread caps its own measure inside it. |
| **Full screen** | A maximise control takes the surface to the full viewport. |

The composer is **one element in both states** — free in the middle of the screen at rest, welded to the surface's bottom edge when open — so opening reads as it growing rather than as one thing replacing another.

Reference: Intercom's Fin composer, which Lohith brought as the model for the resting state and the suggestions.

---

## 02 — The name and the mark

**Finn.** A real given name, one syllable so it never competes with "Finoptic" in a sentence, and it is the wordmark's ink half plus one letter — a visible tie rather than an explained one. The header reads `Finn` / `Finoptic assistant`, so the name never has to carry the word "assistant" itself.

**Never give Finn a pronoun in product copy.** Every string works as name + verb (`Finn is drafting`, `Ask Finn`), so there is no reason to gender it, and a demo that says "he" invites a question nobody wants on a client call.

**The mark is a creature.** Two black square eyes with asymmetric rounded corners, an orange horizontal bar that is both arms and the central hub, two orange legs splaying from under it. Hand-drawn, and the wobble in it is intentional.

It replaced a mark that was **two of the parent Finoptic mark's four blades**, cropped so they read as an opening speech mark and coloured from CSS. That mark was correct about one thing — Finn is part of Finoptic — and wrong about the more important one: it said "this is a piece of the logo" where the whole point of the layer is that it is a *colleague*. A face is how you say that, and it is also what gives the motion below something to be expressive with. **The parent pinwheel is untouched** — the sidebar lockup, `logo.js` and the favicon are exactly as they were.

*Rejected:* Optic, Iris, Aperture — none reads as a person, which was the brief.

---

## 02b — The motion: eight states, and nine things not to do

**Source of truth:** [`design-language/finn/finn-motion-v8.html`](design-language/finn/finn-motion-v8.html), the verified prototype, with [`finn-implementation-guide.md`](design-language/finn/finn-implementation-guide.md) beside it. Six versions of that prototype were burned arriving at v8. **Nothing here was re-derived** — the geometry and every timing are copied, and `scratchpad/test-finn-motion.js` diffs the mark in the app byte-for-byte against the prototype's to keep it that way. Brand Guide **15.1–15.9**.

One state is live at a time, as a class on `#finn` (which carries `.finn-scope`). Finn is drawn in three places — the surface header, each answer's byline, the composer — and all three animate off that one class, so they can never fall out of step. **Every state is bound to a real lifecycle event, never to a timer**, which is the rule the whole system exists to keep: the mark cannot say something Finn is not doing.

| State | Motion | What actually triggers it |
|---|---|---|
| `docked` | **Frozen.** No breath, no drift, no blink. | The conversation is closed. |
| `alert` | One pulse, once, then refreezes. | A workspace with open alerts is loaded while Finn is closed. Docked's only exception. |
| `summon` | Springs up from its own centre → `idle`. | `finnOpen()` — clicking the mark. |
| `idle` | Slow shallow breath + a randomised blink every 3.8–7.2s. | Open, nothing happening. |
| `listening` | Grown to 1.06 and **held**. | Typing in the composer; 1.1s debounce back out. |
| `thinking` | The rays — see below. | From the opening beat to the last reasoning step. |
| `speaking` | Quick shallow pulse. | While the answer's words are landing. |
| `settle` | One overshoot → `idle`. The full stop. | The stream ending, or being skipped. |

**Thinking is a radiation, and the hub never moves.** All four limbs telescope along their own length — thickness constant — in and out of a hub that has no animation at all; arms first, legs one beat behind, everything springing back out past rest. The hub's stillness is the anchor of the whole thing. Five numbers are tunable (`--think-tempo`, `--think-depth`, `--think-stagger`, `--eye-depth`, `--eye-dip`) and nothing else is.

*Rejected, each having "looked fine" at the time:* a pinwheel⇄creature **morph** (glitchy), **per-limb stagger** beyond the paired leg lag (shaking), one **uniform whole-creature scale** instead of per-limb telescoping (generic), **continuous rotation** of anything (a spinner says the product is struggling), and animating **the hub**.

**Two reversals worth knowing.** `docked` being frozen **undoes 12.1**, which had the resting mark breathing — a blade-shaped token can fidget harmlessly, a creature with eyes reads as a toy, and the audience is a board. What still animates at rest is the cycling line in the composer, which is what "it keeps animating" was really about. And the mark now carries **literal** `#FF5600` and black rather than taking `--accent` from CSS, which puts it in the same family as `brands.js`'s vendor marks: it stays orange under the Blue and Mono presenter presets, because recolouring a face is not a palette operation.

**One deliberate absence.** `summon` does not play when you ask straight from the resting composer: `finnOpen()` and `finnRun()` run in one synchronous task, so it is replaced by `thinking` inside the same frame. That is right — Finn appeared and got immediately to work, and the surface has its own entrance. It plays on its own trigger, opening Finn without a question.

**The mark is drawn at 30px**, from one variable, with the byline gutter derived from the tile. That is the whole of what made the motion noticeable — at the 19px the old cropped-blade token used, an idle breath of 1.03 is 0.6 of a pixel. No geometry and no timing was touched to get there; display size is the one thing the brief leaves open.

---

## 02c — Progress: one state, one representation

**Brand Guide 16.1–16.3.** The thinking indicator used to be three bouncing dots, and they were deleted: *"there are dancing dots followed by a thinking animation in the mascot itself. This creates redundant representations of the same state."* The mark's four limbs already say *working*, in the same 40px, better. The general rule fell out of it — **the moment two things in this layer animate the same fact, one of them is the wrong one.**

What replaced them is a **sentence in the byline**, and the second attempt at that is the one that shipped. The first put it on its own row, which printed `Finn` and then `Finn is thinking` beneath it — right information, said twice: *"Currently it is just a repetition. The Finn branding already exists, and each in-progress message should appear beside it as a continuation."* So the name is stated once and the status runs on from it:

| | |
|---|---|
| `Finn` **is thinking** | the opening beat, 900ms with no step yet — a sentence needs longer on screen than a dot did |
| `Finn` **is about to answer** | 620ms after the last reasoning step. Without it the log collapsed and the first words arrived in the same frame, the one jump cut in the sequence |
| `Finn` | cleared. The answer is its own status now |

The words shimmer through a swept gradient rather than pulsing their opacity — a blinking sentence is harder to read than a still one — and **one dancing box** sits at the end of the line, where it was asked for, squashing as it lands. One, not three: three beside a creature already gathering its limbs is the same duplication over again.

---

## 02d — What you can do with an answer

**Brand Guide 16.4–16.6.** There was nothing: the answer landed and that was the end of it. *"Other options, such as copying the message or additional details, are also missing… liking a message, unliking a reply. Since none of these features are present, the corresponding flows should be implemented."*

| Control | What it actually does |
|---|---|
| **Copy** | Real plain text — every block in its text form, the working numbered, the feeds named, and a table as **tab-separated rows** so it pastes into a spreadsheet as columns. Two clipboard routes, because the API is refused outright on some `file://` origins, and an admission if both fail. |
| **Show the working** | **Per message**, not the global Brief/Full switch — somebody wants the derivation for *this* answer without changing how the next six are written. |
| **Good answer** | Stored on the turn, persisted with the chat, and **reversible** — a rating you cannot take back is a rating people stop giving. |
| **Needs work** | Stored, and it **asks why**: three real reasons, then an acknowledgement specific to the one chosen. The figures one points at the working; too-much-detail points at Brief; not-what-I-asked points at rephrasing. |

The bar is ink and grey with a hairline above it — the accent budget in this layer is one and it is still the send button. The **last** answer's bar is always visible and earlier ones sit back until hovered: a bar that only appears on hover is one most readers never discover, and a bar always on in a six-turn thread is six rows of noise.

The verdict and its reason persist with the *question*, not with the rendered answer. They are what the reader said, so unlike the figures they are still true when the chat is reopened against a different dataset.

---

## 02e — Dictation: a real meter, and nothing typed until you stop

**Brand Guide 16.7.** *"While using voice input, I want the audio form animation to occur when the user is speaking, and transcription should happen only after the user finishes speaking."*

Fifteen bars, scaled every frame from an **`AnalyserNode` on the actual microphone stream**. That word is load-bearing and it is the same rule that governs the microphone existing at all (§08): a CSS keyframe would have looked identical and would have been the canned-waveform version this feature was already rejected for once. The harness proves it by handing Chrome a real WAV as its capture device and failing unless the bars take more than four distinct heights.

`interimResults` is **off** and `continuous` stays false, so one final transcript lands at the end of the utterance — the old behaviour typed a half-heard guess into the box and rewrote it word by word, which reads as the product mis-hearing you. The meter takes the cycling placeholder's place, so the input *becomes* a listening surface; `onspeechend` stops the bars and the label becomes `Transcribing…`; and the mark holds `listening` throughout with no debounce, because the state ends when the microphone does.

Two things that cost real debugging: the meter is started **after** recognition and fails silently, because if two consumers of one device is ever a problem then dictation is the one that must win. And the `AudioContext` is explicitly **resumed** — one born suspended reads back nothing but zeros, which is fifteen flat bars over a live microphone, and the mic click is two promises away by the time the context exists.

---

## 03 — Typography: two faces, and that is final

A third face was chosen against a live eight-serif comparison (Fraunces, headlines + chrome, default size), built, and **removed on sight** — *"I didn't like the serif font… just stick to the brand fonts."* `finn-font.css` is deleted and §1 is back to Mona Sans + Space Grotesk.

What differentiates Finn from the board now is **register, not family**: 14.5px on 1.62 at a capped measure, against the board's 13/1.45 at full card width. And the separate complaint — *"the hierarchy within the text formatting is not at all coming through"* — is fixed by making four levels visibly four, rather than by adding a fifth face:

| Level | |
|---|---|
| Headline | 18 / 700, −0.022em |
| Body | 14.5 / 1.62, capped at 64ch |
| Section | 12.5 / 700, **over a hairline**, with 20px above it |
| Micro | 11.5 / 1.55, muted |

Figures stay Space Grotesk. For the record, had a serif been kept the costs were: Instrument Serif +28KB (single weight), Fraunces +48KB, Lora +50KB, Crimson Pro +63KB, Source Serif 4 +67KB, Literata +68KB, Newsreader +76KB, Georgia free but OS-dependent.

---

## 04 — Brief and Full are about the answer

The first version made the toggle resize the panel. It doesn't any more — *"my thinking behind having brief and full is the way the chatbot replies."*

- **Brief** — the headline, the answer in a sentence or two, one plot, the sources.
- **Full** — the same, plus **`How I worked this out`**: the numbered derivation, with the real arithmetic, on a tinted panel. Plus the supporting tables and secondary charts.

Nothing resizes when the style changes, and switching re-renders the last answer **in place** rather than appending a second copy of the same question.

---

## 05 — Thinking that is not theatre

Three dots first — a beat of nothing, which is what makes the first step read as considered rather than canned. Then each reasoning step **lands under the last and types itself**, the live one carrying a pulsing dot and the settled ones a green tick. Then the whole log collapses to `Thought for 2.4s · 5 steps`, still clickable.

The load-bearing part: **the steps are the same derivation Full prints as its working.** One `work()` per question serves both. It cannot show reasoning the answer does not contain, and neither can drift from the other.

*"Even the thinking didn't feel like it's actually thinking"* was about the version before: one line swapping text on a timer, which is a spinner with words.

---

## 06 — Why the answers are derived, not written

Each of the 24 questions is a `derive(D)` function returning typed blocks, plus a `work()` returning its derivation. It is not prose with figures typed into it.

- All six shipped datasets re-narrate for free, including `fresh` and `zero`.
- An answer **cannot contradict the board**, because it reads the same `D`.
- Finance's next-year ask reuses `ASK` / `DRIVER_NOTE` and the annualisation factor from `screens.js` **by reference**, so Finn and the forecasting screen agree to the dollar.

**Every chart is an existing chart.** `donut`, `hbars`, `lineChart`, `stackedBars`, `waterfall`, `bandChart` — with their hover readouts, hatched stacks, `--c1…--c8` colours, entity registry, zero-based axes and real vendor marks via `entityMark()`. Tables go through `table()`, so tablekit's per-column sort and filter work with no extra wiring, and `hbars` brings the five-row clip and its "Show all". Nothing new was drawn.

**Plots render inline**, each on a `--surface-3` panel with a titled header. That panel is what makes a plot read as a distinct object in the conversation, and it is the answer to *"the plots should have a texture so they stand out."*

**Two questions were reworded, because the data could not support them as asked:**

- *"Where is our budget increasing year over year?"* → **"Where is spend growing, and what's driving it?"** There is no prior year anywhere in the schema, and `drivers[].v` is a **percentage contribution**, not dollars. The answer states points and says outright that nothing in it is a YoY comparison.
- *"What is driving AI spend?"* appeared in both Procurement and Products on identical data. The Products slot became **"Which product's AI usage is growing fastest?"** off `ai.byProduct`, and it says plainly that it ranks consumption rather than a growth rate.

---

## 07 — Voice: real dictation or no button

1. **A key inside a `file://` page is a published key.** So nothing calls a provider — Grok or otherwise. Provider choice belongs to the real build.
2. **The mock-up assumes no network at all** — it is why fonts are base64 and datasets are `.js` wrappers.
3. Where the browser has `SpeechRecognition`, Finn shows a microphone and dictates for real. Where it does not, **there is no microphone**. A refused permission is reported in a toast rather than swallowed.

**The rejected alternative was a mic that plays a waveform and then fills the box with a scripted question** — exactly what rule 7.17 forbids, and it would have been the one dishonest control in the product. *Verified present in Chrome 142 on this machine.*

---

## 08 — Chat history, and the veil

**History.** The **resolution is pinned at the top of each card**, above the question that produced it: the money-and-verb line the chat ended on. A list ordered by question is a list of what you asked; pinned by resolution it is a list of what you **decided**. One control: **View the complete chat**.

Storage is `localStorage`, wrapped in `try/catch` exactly as `shell.js` wraps the palette, because some browsers refuse it on a `file://` origin. Capped at 12. **What persists is the questions, not the answers** — ids, the screen and scope each was asked from, the dataset, and the frozen resolution string. Reopening **re-derives against the dataset you are on now**, and raises an amber band if that dataset has changed since. A transcript that renumbers itself in silence is worse than one that admits it re-read.

**The veil** took three passes and its z-index is the interesting part. It is **white→transparent, not a dark scrim**, because the board is a warm canvas carrying charts and an ink band, and a white surface over that *"mixes with the background."* Three states — short and soft at rest, **taller and denser while the suggestions are up**, gone once the surface opens and the scrim takes over. It sits at **z-index 20**: above the board's cards, **below the sidebar's own z-30**, so the nav and its profile row are never washed out, while Finn's scrim at 69 still dims them once the conversation opens. It is elliptical, so it fades out horizontally before either edge — a full-width band reads as a footer.

---

## 09 — What was built and thrown away

Recorded because the current design is mostly the answer to these.

| Built | Why it went |
|---|---|
| A **bottom-right pod and a 420px panel** | *"Everything is within that small quad area."* A corner is where you put a thing you expect to be ignored, and a conversation, a chart and a table all competed for one narrow column. |
| A **right-hand rail**, mirroring the nav | Superseded before it shipped, by the Intercom reference: centred reads as the product talking to you; a rail reads as a tool docked beside it. |
| A **Claude-style artifact pane** for plots | Built, then *"it is not making sense, make them inline."* Splitting the sentence from the chart it is about makes the reader look in two places for one answer. What the pane was really providing was presence — a tinted panel gives that inline. |
| **Fraunces**, a third typeface | §03. |
| **Brief/Full resizing the panel** | §04. |
| A **24-question accordion** as the opening screen | *"That is never the use case."* |
| A **thinking line that swapped text on a timer** | §05. |

---

## 10 — What was verified

`scratchpad/test-finn.js` (puppeteer-core against the cached Chrome):

- **288 answers** — 24 questions × 2 styles × 6 datasets — **zero console or page errors**, and no `NaN`, `undefined`, `Infinity` or `[object Object]` in any rendered answer.
- The composer is centred; the surface is closed at rest; focusing raises exactly 3 suggestions and does **not** open the surface.
- The greeting names the workspace and carries a real derived figure, and does **not** render the catalogue.
- **Full prints the working and Brief does not**, and the surface width is **identical** in both.
- One titled inline panel per chart or table; a scaling chart is >480px wide; the thread caps its measure below the surface width; **no artifact pane in the markup**.
- The veil: grows past 300px on focus, reaches above the top suggestion, is ≤180px at rest, and its z-index is **below the nav's** while the scrim's is **above** it.
- Bold figures inside the working stay `display:inline` — the flex-blockify regression.
- Origin context names the screen, scope and dataset; the thread survives navigation; full screen fills the width.
- History: resolution is the first element in the card, reopening restores two turns, a changed dataset raises the stale band, and the list starts at the top.
- Free text matches a real question; a plant/metric-ton question **does not** match, and the miss offers three real alternatives without claiming to be a mock-up.
- No answer anywhere contains "mock-up", "demo", "prototype", "placeholder", "sample data" or "fake".
- Escape closes, and only when no table popover, filter menu, pane or modal is open.
- Motion-on: the dots appear, steps **accumulate** and settle, follow-ups do **not** appear while Finn is working, the log collapses, and the resting placeholder genuinely cycles.
- At 430px the surface fills the width and the page does not scroll sideways.

**Incidental find, fixed:** `styles.css` had an **orphaned declaration block** — four declarations with no selector, almost certainly collateral from the round-7 sweep that removed the thirteen "this is a mock-up" strings. It styled nothing (the browser discarded it and recovered), which is why 441 regression renders never caught it. Removed; the sheet is now brace-balanced, which makes that a usable check.

---

## 11 — Open items

1. **`ASK` / `ASK_WHY` live in `screens.js`**, so Finance's next-year answer does not re-narrate per scenario. Move them into the dataset.
2. **No prior year in the schema**, so nothing can answer a genuine year-over-year question. The two `+41% YoY` / `+11.2% YoY` strings on the AI and Security screens remain hardcoded and unrelated to any data.
3. **The 24 questions are a catalogue, not a language.** Free text matches by token overlap and refuses when ambiguous. A real implementation replaces the matcher, not the answers.
4. **Not in the standing regression yet** — `scratchpad/regress.js` covers 21 screens × 6 datasets × 3 palettes; Finn has its own harness. They should merge.
5. **Manufacturing questions remain unanswerable.** The original CIO brief asked about plants, metric tons, batches, production lines and manufacturing orders; the dataset is a software company's. Nine of those twelve need `plants` / `production` / `prior` in the schema. Deferred deliberately, and Finn refuses them rather than inventing.
6. **The suggestion chips are boxy, not pills.** The Intercom reference is fully round; §3 says nothing in Finoptic is. Flagged as the one deliberate divergence from the reference that prompted the layout.
