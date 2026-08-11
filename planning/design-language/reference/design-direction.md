# App Design Direction — consolidated research

**Status:** Research complete → basis for the app `DESIGN.md`
**Date:** 2026-07-12
**Sources (full detail):**
[research/01 typography](./research/01-typography-and-type-scale.md) ·
[research/02 data-viz colour](./research/02-data-viz-color-system.md) ·
[research/03 layout & density](./research/03-layout-density-responsiveness.md) ·
[research/04 reference teardown](./research/04-reference-dashboard-teardown.md)

> **The goal:** keep Crozaint's identity (brand blue + sharp corners + hairlines +
> one rationed accent) but re-tune everything else for a **dense data app**, not a
> marketing website. Below is the recommended "starter kit." Where two good options
> exist, we wire **both into the theme-switcher** so we choose by looking, live.

> **⚠️ Updated 2026-07-12 (supersedes parts below):** **Fonts** — headline **Space Grotesk** (decided); body chosen on the kitchen-sink from a shortlist (Geist · Hanken Grotesk · Mona Sans · Instrument Sans · Inter · Satoshi); IBM Plex Sans + Bricolage Grotesque dropped. See §1 (updated). **Corners** — now a **theme-switcher option**: **default sharp + slanted** (Crozaint signature), with **4px** and a **larger** radius to preview (this replaces the "drop slant on data surfaces" note in §6). **Components** — full **shadcn/ui** swap. **Icons** — **Phosphor**. Authoritative decisions: [`../WIP.md`](../WIP.md) and [`../review-log.md`](../review-log.md).

---

## 1. Typography

**Headline font — DECIDED: Space Grotesk** (Lohith's pick; likes its numerals). Distinctive and techy/precise without being loud.

**Body font — decide on the kitchen-sink** from a sleek / modern / readable shortlist (each judged on real numbers for tabular alignment): **Geist · Hanken Grotesk · Mona Sans · Instrument Sans · Inter · Satoshi.** *(Dropped: IBM Plex Sans and Bricolage Grotesque — too much character / not right for a dense app.)*

**Hard rules:**
- **No monospace fonts — ever (non-negotiable).** Align numbers with `tabular-nums`, never a mono face.
- **Slashed zero — large numbers only.** Use the slashed zero on **big figures** (KPI / metric hero numbers, large totals) where it reads better; keep a **plain `0` at small sizes** (tables, labels, captions). Apply `font-feature-settings: "zero"` (the `zero` variant) **only** to the large-number styles — not globally. Reference: the Vaulto screenshot in `references/inspiration/`.

**Two type scales** — a switcher dimension (**Standard** / **Large**), named hierarchically (H1–H6 + body), with a separate **Metric** size for the hero KPI number. "Large" bumps only headings + metrics ~1.5×; body stays readable. *(A smaller scale was considered and dropped as unnecessary.)*

| Role | Standard | Large (~1.5× headings) |
|---|---|---|
| Metric — KPI hero number | 28 / 600 | 42 / 600 |
| H1 — page title | 24 / 700 | 36 / 700 |
| H2 | 20 / 700 | 30 / 700 |
| H3 | 16 / 600 | 24 / 600 |
| H4 | 14 / 600 | 21 / 600 |
| H5 | 13 / 600 | 18 / 600 |
| H6 — eyebrow / table header | 12 / 600 caps | 14 / 600 caps |
| Body | 14 / 400 | 15 / 400 |
| Body-sm | 13 / 400 | 14 / 400 |
| Caption | 12 / 400 | 12 / 400 |
| Micro | 11 / 500 | 11 / 500 |

Line-height ≈ 1.2 for headings/metrics, ≈ 1.5 for body. Space Grotesk carries headings; the chosen body font carries everything else.

**Money/tokens:** `tabular-nums`, right-aligned; full precision in tables (cost 4 dp, tokens grouped `1,234,567`); compact in KPIs/charts (`$1.2M`, `3.4M`); keep the red "missing" pill for no-cost rows.

## 2. Data-visualization colour

- **Brand blue `#146EF5` is a reserved role** — used for UI chrome and the **primary/"Total"** series, *not* as a category colour.
- **Categorical palette "Spectrum" (8 slots), colour-blind-checked with real tooling, light + dark:**
  - Light: `#146EF5 · #EA580C · #0891B2 · #5B21B6 · #EC4899 · #4F46E5 · #92400E · #C026D3`
  - Dark: `#3B86F7 · #EA580C · #0891B2 · #7C3AED · #EC4899 · #6366F1 · #BE7A4A · #C026D3`
- **Consistent pairing (your requirement):** a small registry maps each entity (app/model) to a fixed slot, so it keeps the **same colour across chart → legend → table swatch**. Colour follows the entity, not its rank.
- **Fixed model colours:** Opus = Orange · Sonnet = Cyan · Haiku = Violet · Fable = Rose (four mutually-distinct slots → a 4-model donut is always safe).
- **"Other" bucket:** cap at 6–8 categories, roll the rest into a neutral grey (`#64748B` light / `#8B95A7` dark).
- **Status stays reserved:** success/warning/danger green/amber/red are never used as category colours (so a category never looks like an alert). Category palette deliberately avoids greens, ambers/gold, and true reds.
- **Sequential & diverging ramps** exist for intensity/deltas (blue ramp; neutral blue↔orange diverging with a grey middle).
- **Alternate palette "Tonal"** (for the switcher) is stronger in light mode but weaker in dark → **Spectrum is the cross-theme default.**
- Ready-to-use CSS variables + Recharts wiring are in the note (replaces the hard-coded colour arrays in the current charts).

## 3. Density, layout & responsiveness

- **About half the website's spacing:** 4px base / 8px rhythm; largest routine gap 32px (not 80–120); card padding 16px; grid gaps 12–16px.
- **Control heights are the density dial:** 36px default, 32px compact, 40px forms — bumped to **≥44px tap targets on mobile**. Table rows: 40 dense / 32 compact / 48 comfortable.
- **Sidebar becomes three-state:** expanded 240–256px (desktop) → mini icon-rail 56–64px (tablet) → off-canvas drawer ~280px with hamburger (mobile). Content is **fluid full-width** (optional 1600px cap on ultrawide) — **not** a centred 1200px column.
- **Tables adapt per table:** horizontal-scroll + sticky first column for the numeric breakdowns; stacked cards for Settings: Apps; column-priority + row-expand for the wide Events log.
- **Charts:** fixed-height wrappers, responsive; legends drop below the donut on narrow screens.
- **Breakpoints:** Tailwind defaults (640/768/1024/1280/1536), mobile-first.
- **Crozaint look survives density** via sharp 2px corners, hairline borders (not shadows), and the single blue accent — same colour tokens in both themes.

## 4. Patterns worth adopting (from the teardown)

- **Stripe-style KPI card:** big number + **delta % vs. prior period** + inline sparkline (turns static tiles into trend signals).
- **Ghost "prior period" line** on the spend chart for instant comparison (answers your #18.4 "compare this month vs last").
- **Ranked horizontal bar-lists with click-to-filter** for By-App / By-Model (better than today's chart-then-table split).
- **Stacked-bar "cost by model over time"** (OpenAI-style) — the strongest single "where is spend going" view.
- **One unified top filter bar + CSV export** on every data view.
- **Sidebar:** per-item icons, a collapse toggle, dimmer-than-content treatment; real dark-mode elevation ladder (not inverted colours).
- **Keep our missing-cost / missing-pricing flags** — the pros (Datadog "cost unavailable", Langfuse status colours) validate them; make them first-class, and finally **distinguish "empty" from "zero."**

---

## 5. Theme-switcher plan

Structure the design as **swappable token sets** so a dropdown repaints the whole app live:

| Switchable | Options |
|---|---|
| UI font | Satoshi (A, default) · Inter (B) |
| Category palette | Spectrum (default) · Tonal |
| Density | Comfortable · Compact |
| Light / Dark | (independent toggle) |

We pick final defaults by **comparing on the real app**, not on paper.

## 6. Open choices (most become switcher toggles, not upfront picks)

- **UI font default** — recommend Satoshi (A); Inter (B) available to compare.
- **Category palette default** — recommend Spectrum.
- **Slant signature on data surfaces** — recommend **dropping it on tiles/tables** (it becomes visual noise across hundreds of cells) and reserving it for one hero moment (e.g. the Login card).
- **Density default** — recommend Comfortable, with Compact in the switcher.
- **Events on mobile** — recommend column-priority + row-expand.
- **Ultrawide cap** — recommend an optional 1600px max.

---

## 7. Next

After the decisions sheet is approved: turn this into the app **`DESIGN.md`** (tokens + rationale), stand up the **theme-switcher**, then build in layers (scaffolding → components → screens).
