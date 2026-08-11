# LLM Tracker — App Design Language (DESIGN.md)

**Status:** Locked v1.2 — by-looking decisions 2026-07-12; refined **2026-07-13** per Lohith's
reviews: slant *inside* the icon (solid glyph + visible hatch + **thin** outline), boxy chips (no
pills), a **gradient outline that travels all around** the box, brighter Spectrum, **Anthropic's own
model colours (pixel-sampled)**, provider brand marks, **all headings at one weight (700)**, toasts
top-right, sidebar tree reworked (per-item rounded elbows connecting to the parent), and the app
**brand locked = “trakit” by Crozaint** (three-slash mark + `trak`·`it` wordmark, brand blue,
no Crozaint glyph in the lockup). The source of truth for the frontend redesign.
**Owner:** Lohith (design). **Audience:** designers + coding agents building the UI.
**Relationship to other docs:**
- `design-direction.md` + `research/01–05` = the *research* that led here. Where they disagree with this file, **this file wins.**
- `references/inspiration/reference-commentary.md` = the *why* behind the visual choices (Lohith's reading of the reference dashboards).
- `kitchen-sink.html` = the *living implementation* of this file — every token and component here is shown there.
- Crozaint brand system (`…/Website/DESIGN.md`) = the parent identity. We **keep brand blue and the slant DNA**, but the app is a dense data product, so it diverges on type, density, corners, elevation and colour-as-gradient.

---

## 0. Design principles — the north star

The old kitchen-sink read as *"AI-generated"*: flat hairline boxes, solid fills, a uniform
grid, all-caps labels. Every reference Lohith chose does the opposite. Five principles fix it:

1. **The number is the hero.** The biggest, most confident thing on any card is the statistic.
   Charts are quiet, bespoke supporting graphics — never the loudest element.
2. **The slant lives in the texture, not the corner.** We moved away from slanted corners, so
   the Crozaint slant survives as **diagonal hatch fills** on icons, bars and chart areas.
   This is the app's fingerprint.
3. **Gradients carry the data; shadows carry the structure.** Data surfaces (chart fills, bars,
   the hero card, the primary button) use gradients. Cards lift off the canvas with **soft
   shadows**, not 1px outlines.
4. **Promote one thing per view.** One coloured hero card, one highlighted bar, one promoted
   donut wedge. Everything else stays neutral so the eye knows where to go.
5. **Give it air.** The calm and the craft come from whitespace and generous rhythm, not from
   packing more in. "Comfortable" means genuinely roomy.

> If a screen looks flat, boxy, evenly-grey, or shouty-with-caps — it's wrong. Add texture,
> elevation, gradient on the data, and air; make the number the hero; promote one thing.

---

## 1. Typography

### Fonts
- **Voice font — Mona Sans.** Used for **everything that is words**: headlines (H1–H6),
  body, labels, table text, captions, buttons. Mona Sans is a modern variable grotesk with a
  real slashed-zero — it carries the whole UI. *(This replaces Space Grotesk as the headline
  font — Space Grotesk read as too quirky for headlines and body.)*
- **Numeral display font — Space Grotesk.** Used **only for large numbers**: the KPI/metric
  hero figures, big totals, the donut centre total, large chart value tags. Lohith keeps it
  purely for its distinctive large numerals. **Never** for headings, body, or table figures.
- **No monospace, ever.** Align numbers with `tabular-nums`, never a mono face.

### Type scale — **Large** (locked)

| Role | Size / weight | Font |
|---|---|---|
| Metric — KPI hero number | 42 / 600 | **Space Grotesk** |
| H1 — page title | 36 / 700 | Mona Sans |
| H2 — section | 30 / 700 | Mona Sans |
| H3 — card title | 24 / **700** | Mona Sans |
| H4 | 21 / **700** | Mona Sans |
| H5 | 18 / **700** | Mona Sans |
| H6 — small heading | 14 / **700** | Mona Sans |
| Body | 15 / 400 | Mona Sans |
| Body-sm | 14 / 400 | Mona Sans |
| Caption | 12 / 400 | Mona Sans |
| Micro | 11 / 500 | Mona Sans |

Line-height ≈ 1.2 for headings/metrics, ≈ **1.6 for body** (breathable). Heading tracking
≈ −0.01em. **Every heading H1–H6 shares ONE weight = 700** (Lohith: all headlines the same
thickness). Watch out: heading *spans* (`.t-h1`, a `<span>` not an `<h1>`) do **not** inherit the
`h1..h6` rule — set their weight explicitly or they fall back to body 400. Table **column headers**
are a label role (not a headline) and stay 600.

### Hard rules
- **NEVER all-caps.** No `text-transform: uppercase` on *anything* — not headlines, not
  eyebrows, not table headers, not KPI labels, not micro text. All-caps is banned. Differentiate
  small labels by **weight + size + muted colour** (and at most a hair of letter-spacing,
  ~0.02em), in **sentence case**. *(This is a standing rule Lohith set — see review-log.)*
- **Slashed zero — where the font supports it.** The intent: slashed `0` on big figures and on
  ID/key strings (`0`-vs-`O` clarity); plain `0` in tables/labels/captions.
  **Verified finding (2026-07-12): Space Grotesk has NO slashed-zero glyph** — requesting
  `font-variant-numeric: slashed-zero` on it does nothing (this is why the old KPI cards showed
  a plain zero). **Mona Sans does slash.** So:
  - **Settled (2026-07-12):** Lohith accepts this — we do **not** force a slash where the font
    lacks the glyph. **Hero numbers stay Space Grotesk with its plain zero** (at hero size it's
    unambiguous — no adjacent `O`).
  - **The slash lives on Mona Sans figures and ID/key strings**, where `0`-vs-`O` actually
    matters (`.idnum`).
- **Dimmed decimals on big money.** On hero numbers, render the cents in a muted colour:
  `$12,428`**`.55`** — the dollars are `--text-primary`, the `.55` is `--text-muted`. (Loud,
  Salezy.) Applies to the hero metric only, not table cells.
- **tabular-nums everywhere numbers align**; money right-aligned; full precision in tables
  (cost 4 dp, tokens grouped `1,234,567`); compact in KPIs/charts (`$1.2M`).

---

## 2. Colour & gradients

### Roles
- **Brand Blue `#146EF5`** (dark-mode `#3B86F7`) — reserved for UI chrome + the **primary /
  "Total"** series. Not a category colour.
- **Warm ember `#EA580C`** — the single rationed warm accent (doubles as Spectrum slot 2 /
  Opus). Use it for *one* highlight per view, alert emphasis, or the promoted element — the
  blue-plus-one-warm logic from Aeros/Vaulto.
- **Categorical palette "Spectrum" (locked, brightened 2026-07-12)** — Lohith found violet,
  brown and fuchsia too dark; they're lifted to brighter shades. Light + dark:
  - Light: `#146EF5 · #EA580C · #0EA5C4 · #8B5CF6 · #EC4899 · #6366F1 · #C08457 · #D946EF`
  - Dark: `#3B86F7 · #F97316 · #22C3DB · #A78BFA · #F472B6 · #818CF8 · #D0996B · #E879F9`
  - Cap at 6–8 categories; roll the rest into neutral grey (`#7887A0` / `#8B95A7`).
- **Fixed model registry = Anthropic's OWN model-family colours** (Lohith: "use the exact same
  colours Anthropic uses"). Colour follows the entity across card → chart → legend → table swatch,
  and — because these are brand colours — **stays identical in light and dark**:
  - **Fable = `#6DA7EC`** (sky blue) · **Opus = `#F09978`** (coral) · **Sonnet = `#F0EEE6`** (warm
    cream) · **Haiku = `#BCD1CA`** (sage). **Pixel-sampled from Anthropic's own model cards
    (2026-07-13)** — these are exact, not estimates.
  - Each has a paired readable ink for text-on-colour. Light swatches (cream, sage) always carry
    a hairline ring so they stay visible on white; the model-card icon is dark slate `#141413`.
- **Provider brand colours + marks** — every provider we track carries its own logo mark and
  brand colour so a model's origin reads at a glance (tables, filters, model picker). Marks are
  inline SVG (simple-icons / LobeHub), recoloured via `currentColor`:
  Anthropic `#D97757` · OpenAI (mono → `--text-primary`) · Google Gemini `#4285F4` ·
  Meta/Llama `#0866FF` · Mistral `#FA520F` · xAI/Grok (mono → `--text-primary`).
- **Status is reserved** — success green / warning amber / danger red are **never** category
  colours, so a category never looks like an alert.

### Gradients (the new default for data surfaces)
Solids read as "flat / templated." Gradients read as "crafted." Rules for *where* gradients go:

- **YES — on the data and the hero:**
  - **Area fills**: the series colour at the top fading to transparent at the baseline.
  - **Bars**: a subtle vertical gradient, brighter at the top.
  - **The hero card** ("Total spend"): a soft brand-blue gradient wash + a whisper of grain.
  - **The primary button**: a brand-blue gradient (top lighter → bottom deeper).
  - **Progress / gauge arcs**: a gradient along the arc.
- **NO — keep flat:** body text, ordinary card backgrounds (these get a *barely-there* vertical
  sheen at most), table rows, borders. Gradients everywhere = garish; gradients on the data +
  one hero + the primary CTA = crafted.

Token sketch (see kitchen-sink for the live values):
```css
--grad-brand:      linear-gradient(145deg, #3B86F7, #146EF5);
--grad-brand-soft: linear-gradient(160deg, rgba(20,110,245,.14), rgba(20,110,245,.02));
/* area fill: <linearGradient> stop-0 = series @ 0.35α, stop-1 = series @ 0α */
/* bar fill:  <linearGradient> stop-0 = series lighter, stop-1 = series */
```

---

## 3. Surfaces, elevation & corners

### Shadows, not outlines
Cards lift off the canvas with **soft, layered shadows** — we no longer draw a 1px box around
everything. Elevation ladder:

| Token | Use | Light | Dark |
|---|---|---|---|
| `--shadow-1` | resting card | `0 1px 2px rgba(12,17,22,.04), 0 4px 10px rgba(12,17,22,.04)` — **kept faint on purpose** (every card sits on the grey `#fafafa` canvas, where a heavy shadow reads as a smudge) | `0 1px 2px rgba(0,0,0,.4), 0 6px 20px rgba(0,0,0,.35)` |
| `--shadow-2` | raised / hover | bigger, softer version of `-1` | + slightly stronger |
| `--shadow-float` | modal / menu / toast | `0 12px 40px rgba(12,17,22,.18)` | `0 16px 48px rgba(0,0,0,.6)` |

> **Match the shadow to what's behind it.** `--shadow-1` is faint because it always lands on the
> grey canvas. Shadows on a **white/opaque surface or floating over content** (`--shadow-2` raised,
> `--shadow-float` modal/menu) stay stronger — they read cleanly on white and don't muddy. Dark mode
> is unchanged: the canvas is near-black, not grey, so there is no smudge problem and the lift comes
> from the surface-vs-canvas step + the top highlight (below).

- **Dark mode**: surfaces are a step lighter than the canvas *and* carry a faint **top inner
  highlight** (a 1px lighter top edge) so they look lit from above (Vaulto/Aeros). Shadows are
  subtle in dark mode; the lift comes mostly from the surface-vs-canvas step + the top highlight.
- **Borders survive only as separators** — table row dividers, the line under a section header,
  the sidebar edge. Those are hairlines and are fine. What's banned is the **outline-around-a-box**
  look for cards.

### Corners — two-tier rounded (locked; slant retired from corners)
The slant is retired as a *corner* treatment (it now lives in the hatch texture, §5). Corners
are simply **rounded, at two radii** so cards and controls read as clearly different sizes of
the same family:

| Token | Value | Applies to |
|---|---|---|
| `--r-surface` | **16px** | cards, panels, modals, chart cards, the hero card, large tiles |
| `--r-control` | **10px** | buttons, inputs, selects, icon buttons, segmented control, toggle, avatar, menu items |
| `--r-chip` | **6px** | status chips, badges, deltas, model tags, category swatches — all chips |
| `--r-bar` | **5px** | progress / breakdown bars |

*Why two tiers:* at a single "larger" radius the buttons looked neither rounded nor sharp.
Cards get the **larger** radius (16px); buttons get a **smaller, deliberate** radius (10px) —
clearly rounded, clearly not a pill, clearly not the 4px near-sharp we rejected.

### No pills anywhere (Lohith)
**Nothing is fully rounded (`9999px`).** Chips, badges, status pills, deltas and tags are **boxy**
(`--r-chip`, 6px). The toggle/segmented control and the avatar are rounded **squares**
(`--r-control`). The only round things left are genuinely circular graphics (donut/gauge arcs).
If a chip looks like a lozenge, it's wrong.

### Gradient outlines (for emphasis states)
When an element needs an outline for emphasis (e.g. the "missing pricing" alert tile), use a
**gradient border that travels all the way around the box**, not a flat 1px line. The border is the
emphasis colour (danger) tinted all around (~24%), with a **bright highlight segment that rotates the
perimeter** so the tile reads as alive/attention-grabbing. Recipe: a masked border ring (`padding` +
`mask-composite: exclude`) filled with a `conic-gradient(from var(--angle), …)`, animating `--angle`
0→360deg via `@property` (respect `prefers-reduced-motion` with a static all-around fallback). This
makes even an emphasis outline feel crafted and draws the eye without a harsh flat ring.

### Card finish
- Ordinary card: surface colour + `--shadow-1` + `--r-surface` + an optional *barely-there*
  vertical sheen. No outline.
- **Hero card**: `--grad-brand-soft` wash + a faint diagonal-hatch or grain texture at very low
  opacity (Vaulto's "pixelation") + `--shadow-2`.

---

## 4. Spacing & density — breathable "Comfortable" (locked)

"Comfortable" is the default and it must feel **roomy** — the old spacing felt claustrophobic.
Bumped tokens:

| Token | Comfortable (default) | Compact |
|---|---|---|
| `--pad-card` | **24px** | 16px |
| `--gap` (section) | **32px** | 20px |
| `--grid-gap` | **20px** | 14px |
| `--row-h` (table row) | **52px** | 40px |
| `--control-h` | **42px** | 36px |

- Base rhythm 4px; body line-height 1.6.
- Content is **fluid full-width** (optional 1600px cap on ultrawide), never a centred 1200px column.
- Tap targets ≥ 44px on mobile.

---

## 5. Iconography — Phosphor + the hatched-icon signature

- **Base set: Phosphor**, one signature weight (Regular) for functional UI icons; Fill for
  emphasis and active states.
- **The signature move — the hatch goes on the ICON, not the box (corrected 2026-07-12).**
  For featured icons (KPIs, empty states, plan card, the app mark's siblings), the icon itself is:
  1. **outlined** (a crisp Phosphor Regular stroke), over
  2. a **very faint solid fill** (~15% of the icon colour), with
  3. a **thin 45° slant pattern** inside the shape.
  It sits on a **plain, soft-wash tile** — the tile box is *never* hatched. This is the Aeros look
  (outlined heart/fan/leaf with a faint striped fill) and it's where the Crozaint slant now lives.
  > **Do NOT** put the hatch on the tile background; **do NOT** use hatch-stripes-only with a
  > transparent fill (barely-there); **do NOT** make the outline bold (Lohith: keep it thin).
  > Faint fill **+** VISIBLE thin slant **+** THIN outline, together.
- **Use SOLID-bodied glyphs only.** The hatch only reads on a glyph that has a solid silhouette to
  fill. It **fails** on outline-only glyphs (e.g. line-chart → use a **solid bar-chart** instead) and
  is muddy on fine glyphs (e.g. ÷ → use a **solid calculator**). A knockout glyph like the warning
  triangle is fine *because* the thin outline redraws the "!" on top of the hatch.
- **Recipe (implemented in kitchen-sink):** stack two glyphs of the same icon — a **Fill** glyph
  masked to `background-color: colour@18%` + `repeating-linear-gradient(45deg, colour 0 2px, transparent 2px 5px)`
  via `background-clip:text`, and a **Regular** (thin, NOT bold) glyph on top for the outline. (The
  kitchen-sink assembles this from a single authored `<i>` in JS.) Graceful fallback: a solid tinted glyph.
- Plain (un-tiled, un-hatched) Phosphor icons are right for dense/inline controls (buttons, table
  actions, sidebar item tiles, toolbar) — the hatched icon is for *featured* icons only.
- **Provider marks** (Anthropic, OpenAI, Gemini, Meta, Mistral, xAI) are their real brand logos as
  inline SVG, recoloured via `currentColor` — kept plain (no hatch), since they're identity, not ours.
- **Model-family icons** on the coloured cards are plain **dark line icons** (Anthropic's own style):
  Fable = brain, Opus = graph/node, Sonnet = pen-nib, Haiku = bird.

---

## 6. Data visualization — bespoke, textured, number-first

**Philosophy:** charts are supporting graphics. They are **hand-built** (inline SVG), use
**gradient fills** and **hatch/pattern textures**, and always let the number win. Every chart
**promotes one element** (this-period line, highlighted bar, primary wedge) and mutes the rest.

### Everyday charts (use these by default)
- **Line / area** — smooth curve, **gradient area fill** (series → transparent), an end-point
  dot, and a **dashed "prior-period" ghost line** for compare. (Aeros, Airzone.)
- **Bar** — bars drawn as **muted hatch fills**, with **one solid gradient highlighted bar** +
  a floating value tag on the point of interest. (Rexora, Salezy, Loud, AI-fashion.)
- **Donut** — gradient strokes, one promoted wedge, **centre total in Space Grotesk**; 4-model
  donut uses the fixed registry so colours are always distinct.
- **Ranked bar-list** — gradient fills, click-to-filter; the top row can carry the label in white.

### Texture for differentiation (CVD-safe)
Use **hatch / dash / dot patterns** in addition to colour to separate series — never rely on
colour alone (Airzone, Financia, AI-fashion). This doubles as the brand texture.

### Extended vocabulary — reach for only when a data point calls for it
Radial **gauge** (Salezy/Cryptek), **rose/nightingale** & **radar** (Rabbit), **Sankey** flow &
**dot-matrix heatmap** (Vaulto, Financia, Loud). Documented so we have range; not for daily views.

---

## 7. Components

- **KPI hero card** — the primary metric gets a **coloured/gradient hero card** (§3), with:
  label (sentence case) → **hero number** (Space Grotesk, slashed zero, **dimmed decimals**) →
  delta vs prior period → sparkline (brand-blue "Total"). A small **hatch-tile icon** top-right.
- **KPI tiles** — the secondary metrics are neutral cards (no gradient), same anatomy, smaller.
  Prefer an **asymmetric row** (§8) over six identical tiles.
- **Status chips** — **boxy** (`--r-chip`, never a pill), semantic colour + wash: `Completed`/success
  = green, `Pending` = amber, `Failed`/`Canceled` = red, neutral = grey. Used in tables and lists.
  (Orbix, Hynex, Salezy.)
- **Model tag** — a swatch dot + model name on a neutral boxy chip (works for the light Anthropic
  colours too), not a solid-colour lozenge.
- **"Missing pricing" chip** — first-class red **boxy** chip on rows with no cost; keep "empty ≠ zero"
  distinct in states. The KPI-level "missing pricing" alert tile uses the **gradient outline** (§3),
  not a flat red ring.
- **Tables** — sentence-case headers (no caps), hairline row dividers (no zebra), right-aligned
  `tabular-nums` figures, model colour swatch from the registry, coloured status chips, roomy
  `--row-h`. A unified filter + CSV-export toolbar sits above every data view.
- **Buttons** — primary = **brand gradient**, `--r-control`; secondary = surface + subtle
  border; ghost = text-only; danger = red. `--control-h` tall. Info-affordances: a small (ℹ)
  icon next to labels that need explaining (matches decision #4).
- **Forms** — 42px controls, `--r-control`, focus ring in brand blue, inline error state in red
  with a helper line.
- **Feedback** — modal (type-the-app-name to confirm destructive delete), **toasts anchored
  top-right** (Lohith) sliding down-in, and distinct **empty / error / teaching** states.

---

## 8. Layout & navigation

- **Tree-rail sidebar (Hynex) — reworked 2026-07-12.** The anatomy, top → bottom:
  - **Brand lockup** (see §11) + a collapse chevron, over a hairline.
  - **Command search** row (`⌘K`).
  - **Grouped sections** (*Overview / Insights / Settings*). Each group header is a small
    **sentence-case** label (never caps) with a **collapse caret** on the right.
  - **Tree rail:** a single **continuous vertical trunk** that connects up to the **parent group
    header**, and **every item hangs off it with its own ROUNDED elbow** curving from the trunk into a
    short horizontal that meets the item (not straight ticks, not only the last item). The trunk stops
    at the last item. Each item = a **small rounded icon tile** (neutral) + label; item icons are
    **plain** (not the hatched signature) — the hatch is for featured icons only. *(CSS: per-item
    `::before` with `border-left` + `border-bottom` + `border-bottom-left-radius`, each starting at the
    previous item's centre so the verticals stack into one trunk; first item extends up to the header.)*
  - **Active item:** a filled, accent-wash rounded rectangle with a **soft accent glow** and its
    icon tile flipped to the **brand gradient** (white icon) — the Hynex "lit" active state.
  - **Bottom:** a small **plan card** (e.g. *Free plan · upgrade*), then **identity + sign-out**.
  - Collapse chevron → **mini icon-rail** (~72px, active item = brand-gradient tile) → mobile
    off-canvas drawer. Page context / breadcrumbs live in the content, not a separate top bar.
- **Asymmetric hero blocking (Loud).** Lead a dashboard with **one big number + a free-flowing
  breakdown**, not a rigid uniform grid. Vary block widths to build hierarchy; promote one card.
- **One coloured hero card** among neutral cards per view (AI-fashion, Cryptek).
- **Command bar** (⌘K) in the chrome (Vaulto, Linear).
- Fluid full-width content; per-table responsive behaviour; charts in fixed-height responsive
  wrappers with legends dropping below on narrow screens.

---

## 9. Reference DNA → where it's used

Each reference and the decision it feeds is documented in
**`references/inspiration/reference-commentary.md`**. Quick map:

| Reference | Feeds |
|---|---|
| **Aeros** | hatch-fill icons (§5), textured/gradient plots + number-first (§6), one-blue-one-warm (§2), soft elevation (§3) |
| **Vaulto** | tree sidebar + command bar (§8), dark-mode ladder + hero grain (§3), plot vocabulary (§6) |
| **Rabbit** | extended chart vocabulary (§6) |
| **AI-fashion / Airzone / Cryptek** | hierarchy via one coloured card + pattern-fill bars (§6, §8) |
| **Financia** | dot-matrix + gradient hatch-bars (§6) |
| **Flowmail / Hynex** | breathable + tree-rail grouped sidebar (§4, §8) |
| **iCare / Loud** | panel composition + asymmetric hero + dimmed decimals (§7, §8) |
| **Orbix** | coloured status chips in tables (§7) |
| **Rexora / Salezy** | highlighted single bar + bold KPI hierarchy + gauge + info-icon (§6, §7) |

---

## 10. Hard-rules checklist (for quick agent reference)

- ✅ Mona Sans for all words; Space Grotesk **only** for large numbers.
- ✅ Type scale = Large; body line-height 1.6. **ALL headings share one weight = 700** (Lohith: every
  headline the same thickness). Specimen spans must set weight explicitly — they don't inherit `h1..h6`.
- 🚫 **No all-caps anywhere.** Sentence case + weight/size/colour for hierarchy.
- ✅ Slashed zero settled: Mona Sans figures + ID strings slash; Space Grotesk hero numbers keep a
  plain zero (SG has no glyph — not forced). Plain `0` in tables/labels.
- ✅ Dimmed decimals on hero money numbers.
- ✅ Gradients on data + hero + primary button; flat elsewhere.
- ✅ Soft shadows for card elevation; hairlines only as separators; **no card outlines**. Emphasis
  outlines are a **gradient that travels ALL AROUND the box** (a danger-tinted ring with a bright
  highlight that rotates the perimeter — animated), never a flat ring.
- 🚫 **No pills anywhere.** Corners: 16px surfaces / 10px controls (+ toggle, avatar) / **6px boxy chips** / 5px bars.
- ✅ Comfortable spacing = roomy (24px card padding, 52px rows, 42px controls, 32px section gap).
- ✅ Slant = the **icon** signature: a **solid glyph** whose fill is replaced by a visible 45° hatch,
  with a **THIN (regular-weight) outline** on top — never bold, never on the tile box, never on
  outline-only glyphs. Plus bars & chart fills; also for CVD-safe series.
- ✅ Toasts anchor **top-right**.
- ✅ Promote one element per view; charts support, numbers lead.
- ✅ Brand blue = chrome + Total; **brightened** Spectrum for categories; status reserved.
- ✅ Model registry = **Anthropic's own colours, pixel-sampled**: Fable `#6DA7EC` · Opus `#F09978` ·
  Sonnet `#F0EEE6` · Haiku `#BCD1CA`. Providers carry real brand marks + colours.
- ✅ App brand = **trakit** by Crozaint (§11) — three-slash mark + `trak`·`it` wordmark (blue on the slashes and `it`), "by Crozaint" text only (no Crozaint glyph).

---

## 11. Branding — app identity: **trakit** by Crozaint (LOCKED)

The app has its **own** brand (Crozaint is the parent company). **Name = trakit** — set lowercase,
one word. See `decisions.md` #001 for the locked decision record.

### Logo system
- **App mark:** **three ascending diagonal slashes** in brand blue — the Crozaint **slant made
  literal**, growing left→right like a rising trend. This is the standalone mark: favicon,
  collapsed/mini sidebar, avatar. Asset: `brand/trakit-mark.svg`.
- **Wordmark:** **`trak`** in ink + **`it`** in brand blue, read as one word — **trakit**. The blue
  `it` matches the slashes exactly, so word and mark read as one system. Asset: `brand/trakit-logo.svg`
  (the full lockup: mark + wordmark).
- **Colour:** blue lives on the **slashes** and the **`it`**; `trak` is ink. The blue is the locked
  **brand blue `#146EF5`** (dark-mode `#3B86F7`). In-app, `trak` uses `--text-primary` and the blue
  parts use `--accent`, so the lockup flips correctly between light and dark. (The standalone SVG
  assets are the light-mode canonical: `trak` black, blue `#146EF5`.)
- **Endorsement:** **“by Crozaint”** muted 11px, **as text only**. **Do NOT use the Crozaint logo
  glyph in the lockup** — Lohith found it "too much." (Official Crozaint assets live in
  `references/brand/` for reference, but are not used in-app.)
- **The literal slant** shows up in three places now: (a) the mark's three slashes, (b) the in-icon
  hatch (§5), and (c) chart/bar textures — while the app *surfaces* stay rounded.

> Realized live in `kitchen-sink.html` (top bar + sidebar) and in the `AppMark`/`BrandLockup`
> React primitives. Asset source of truth: `brand/trakit-logo.svg` + `brand/trakit-mark.svg`.
