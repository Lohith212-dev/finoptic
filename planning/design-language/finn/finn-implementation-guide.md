# Finn — Chatbot Branding & Motion Implementation Guide

**For:** Claude Code, working in the Finoptic app codebase
**Attached alongside this doc:** `finn-motion-v8.html` — the verified reference prototype. It is the single source of truth for all markup, CSS, and timing. Copy from it; never re-derive.
**Owner:** Lohith (Product Designer)

---

## 1. Objective

Replace the existing chatbot's avatar/branding with **Finn** and wire up its eight-state motion system to the real chat lifecycle. The prototype already contains the final, verified mark geometry and animations. Your job is **integration, not design**. Any change to path data, weld points, timings, or motion models is out of scope and must not happen.

## 2. What Finn is (context)

Finn is the assistant identity inside Finoptic (FinOps dashboards, cloud-spend analytics). Audience is C-suite: motion must be composed, never toy-like, but clearly alive. Brand orange `#FF5600`, black eyes. The mark is a hand-drawn creature: two black square eyes (asymmetric rounded corners — intentional), an orange horizontal bar (arms + central hub), two orange legs splaying from under the hub. The hand-drawn wobble is intentional and load-bearing; treat every coordinate as final.

## 3. Source-of-truth assets (extract from `finn-motion-v8.html`)

1. **The mark markup** — every `<svg class="finn">…</svg>` block in the file is identical (they were machine-generated from one template). Copy one verbatim into a shared component (e.g., `<FinnMark size={24}/>` / a partial / whatever the codebase's component idiom is). Only `width`/`height` may vary per usage; the `viewBox="0 0 112 97"` and everything inside `<g class="creature">` must be byte-identical everywhere Finn appears.
2. **The motion CSS** — the block between `/* ============ FINN MOTION SYSTEM v8 ============ */` and the `prefers-reduced-motion` rule, plus the `--spring` custom property from `:root`. Copy verbatim, then apply the scoping change in §5.
3. **The tunables** — the labeled `THINKING` variables block (`--think-tempo`, `--think-depth`, `--think-stagger`, `--eye-depth`, `--eye-dip`). Keep them as CSS custom properties in one place, with their comments. These are the only numbers the design team is allowed to tune later.
4. **The blink engine** — the `scheduleBlink` function in the prototype's script (randomized 3.8–7.2 s interval, 110 ms blink, suppressed in `docked` and `thinking`). Port it as-is into the chat component's lifecycle (start on mount, clear timers on unmount).

## 4. The eight states and how to wire them to the real chat

The prototype uses a state machine of exactly these states — one active at a time:

| State | Motion | Trigger in the real app |
|---|---|---|
| `docked` | Completely frozen | Finn's avatar is embedded in a dashboard surface and the chat panel is closed. Stillness is a rule, not an omission. |
| `alert` | One pulse, once (~0.95 s), then auto-return to `docked` | An unread message / proactive insight arrives while docked. This is docked's only exception. |
| `summon` | Springs up from center (~0.7 s), then auto → `idle` | Chat panel opens / Finn first appears. |
| `idle` | Slow small breath + randomized blinks | Default whenever chat is open and nothing else is happening. |
| `listening` | Grown 1.06 and held, eyes steady | User is typing in the chat input. In the prototype: `input` events set it, and a 1.1 s inactivity timer returns to `idle`. Reuse that debounce. |
| `thinking` | The rays: limbs telescope into the pinned hub and spring back out, arms then legs | Request in flight: from message-send until the first response token arrives. |
| `speaking` | Quick shallow pulse | While response tokens are streaming into the bubble. |
| `settle` | One overshoot (~0.75 s), then auto → `idle` | Stream complete. This is the "full stop" — do not skip it and jump straight to idle. |

The auto-return timeouts for `alert`, `summon`, and `settle` are in the prototype's `setState` function — port those durations exactly (they match the animation lengths).

Real-lifecycle mapping notes:

- If the backend responds so fast that `thinking` would last under ~600 ms, still let it show briefly rather than flashing — a minimum-display of one gather (~800 ms) is acceptable; do not add new animation to compensate.
- If a request errors out, go `thinking → settle → idle` (settle is the graceful stop). Do not invent an error animation.
- Every rendered instance of the mark (header avatar, message-row avatars, any dock icon) mirrors the current state automatically because states are class-driven — see §5. Do not implement per-instance state.

## 5. One required adaptation: scope the state classes

The prototype puts state classes on `<body>` (fine for a demo, wrong for a product). In the app:

- Wrap the chat feature in a root element, e.g. `<div class="finn-scope">…</div>`, and put the state class there instead.
- In the copied CSS, replace every `body.STATE` selector prefix with `.finn-scope.STATE` (eight states — a mechanical find-and-replace). Nothing else in the selectors changes.
- If Finn also appears docked in dashboards *outside* the chat panel, that instance sits in its own `.finn-scope docked` wrapper and only ever receives `docked` ↔ `alert`.

This is the only structural deviation from the prototype you are authorized to make.

## 6. Hard constraints — the failure log, distilled

Six versions were burned learning these. Violating any of them is a regression, even if the result "looks fine" to you:

1. **Never alter the mark's path data, baked transforms, rotation angles (115.023° / 64.977°), or weld origins (47/65 at y 42.2 for arms; local 0,0 apex for legs).** The resting silhouette is pixel-verified against the approved original.
2. **Never reintroduce a pinwheel⇄creature morph.** Rejected — read as glitchy.
3. **No per-limb stagger beyond the existing paired leg lag** (`--think-stagger` on `.legRay` only). Independent per-limb delays read as shaking.
4. **No continuous rotation, ever.** A spinner reads as "the product is struggling."
5. **No mixed scaling models.** All four limbs use the same length-only telescoping (`scale(depth, 1)` about their own weld). Do not "simplify" to a uniform whole-creature scale — that exact simplification was rejected as generic.
6. **The hub gets no thinking animation.** Its stillness is the anchor of the whole motion. If a refactor accidentally animates it, that's a bug.
7. **Eyes**: blink engine + the small `eyelife` dip during thinking only. Never fully frozen during body motion (reads creepy), never fully co-scaling with the limbs (reads generic).
8. **Docked means zero animation** except the single `alert` pulse.
9. Keep the `prefers-reduced-motion` rule — it must ship.

## 7. Technical notes that will save you debugging time

- The motion relies on `transform-box: view-box` with pixel `transform-origin` values, and on `transform-box: fill-box` for the eyes. These are supported in all evergreen browsers; do not "fix" them into wrapper-div transforms.
- The legs live inside pre-rotated `<g>` wrappers; the animated `.legRay` group scales about its local origin `(0,0)`, which is the leg's apex by construction. If a sanitizer, SVGO pass, or JSX conversion strips or collapses those nested groups or the `rotate(…)` wrappers, the motion breaks. **Exclude the Finn SVG from any SVG optimization pipeline.**
- If converting the markup to JSX: `class` → `className`, keep attribute strings otherwise untouched, and confirm the output DOM matches the prototype's node-for-node.
- CSS custom properties are used inside `@keyframes` (`var(--think-depth)` etc.) — supported everywhere the app targets, but if the build pipeline runs an aggressive CSS minifier, verify the keyframes survive intact.
- State transitions rely on the `.limb`/`.eyeOrb`/`.creature` `transition` rules to spring smoothly when a state class is swapped mid-animation. Don't remove them as "unused."

## 8. Acceptance checklist (run before calling it done)

1. Rest render of the in-app mark is visually identical to the prototype's idle mark at the same size (screenshot-diff if tooling allows).
2. Trigger each of the eight states manually (add a temporary dev control if needed, then remove it) and compare against the prototype side by side.
3. During `thinking`: hub visibly does not move; arm/leg thickness does not change; arms lead, legs follow; limbs overshoot slightly on release; left and right always mirror each other.
4. Full chat round-trip: type (→ listening) → send (→ thinking) → stream (→ speaking) → done (→ settle → idle). No state gets skipped, no flash of unstyled/unanimated mark.
5. `docked` instance in a dashboard: frozen; incoming insight pulses once and refreezes.
6. All mark instances (header, message rows, dock) animate in lockstep.
7. OS-level reduce-motion enabled → all animation off, mark still renders correctly.
8. No console errors from the blink timers on mount/unmount (timers must be cleaned up).

## 9. Out of scope

Redesigning the mark, adding states, changing timings outside the tunables block, error/loading animations beyond the eight states, sound, and anything touching the parent Finoptic pinwheel mark.
