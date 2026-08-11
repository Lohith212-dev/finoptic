# Per-Element Reference Guide — LLM Cost Tracker Redesign

**Document:** Reference / inspiration index (design-language package)
**Version:** 1.0
**Last Updated:** 2026-07-12
**Audience:** Product owner + design/dev
**Companion to:** [`../design-direction.md`](../design-direction.md) · [`../../product-spec/02-screen-and-state-inventory.md`](../../product-spec/02-screen-and-state-inventory.md)

> **Why this document exists.** Text descriptions of "good" aren't enough to redesign a dense
> data app — you need to *see* the exact element and know *what to notice*. Since screenshots
> can't be embedded here, every element below has **2–4 curated links** where you can look at
> the real thing, plus a short **"What to notice / what to steal"** written specifically for a
> dense LLM-cost dashboard in **both light and dark themes**.

### How to use this (read once)

- **Free + live, screenshot-ready:** **Tremor Blocks** ([blocks.tremor.so](https://blocks.tremor.so/)) and
  **shadcn/ui** ([ui.shadcn.com](https://ui.shadcn.com/blocks)) render *interactive* components you can toggle
  light/dark and screenshot immediately. These are the closest to our actual stack (shadcn base, Recharts
  charts, Tremor is the canonical dense-dashboard kit). **Start here for every element.**
- **Curated real-product galleries:** **Mobbin** ([mobbin.com](https://mobbin.com/browse/web/screens)) and
  **Refero** ([refero.design](https://refero.design/search)) show shipped screens from real apps. Mobbin's
  **glossary** pages (`mobbin.com/glossary/<element>`) are per-element, with "best practices + variants +
  examples" — perfect for "where to look, what to notice." Mobbin needs a Pro account for full browsing;
  Refero and the glossary intros are largely open.
- **Peer products (see the pattern in context):** Helicone, Langfuse, LiteLLM, Datadog Cloud Cost, Vercel,
  Stripe, Ramp — our closest domain peers. Some dashboards sit behind auth; where they do, the Mobbin/Refero
  capture of that same product is linked instead.
- **Crozaint fit reminder for every element:** brand blue `#146EF5` is **reserved** (chrome + the "Total"
  series only, never a category colour); prefer **hairline borders over shadows**; **sharp/2px + optional
  slant** corners (evaluate live in the switcher — slant is a one-hero-moment accent, not a per-cell
  treatment); **`tabular-nums`** on every figure; **Phosphor** icons; keep the **red "missing-cost" pill**
  and **distinguish empty from zero**.

---

## 1. Sidebar / primary nav

*(collapsible; grouped sections; icons; identity + notifications at bottom)*

**Links**
- **shadcn/ui — Sidebar component** (our exact base; collapsible rail, grouped `SidebarGroup`s, header/footer slots): https://ui.shadcn.com/docs/components/sidebar
- **Mobbin glossary — Sidebar** (best practices + real variants): https://mobbin.com/glossary/sidebar
- **Linear web screens** (the gold standard for a dim, grouped, icon-led product sidebar): https://mobbin.com/explore/screens/0fd9e21f-1222-4074-a683-762db55d93bb
- **Vercel team dashboard** (project switcher + nav treatment): https://mobbin.com/explore/screens/21c95be5-2cea-40d2-b8a5-db050aaa263e

**What to notice / steal**
- The sidebar is **dimmer than content** (lower-contrast text + a hairline right border, no shadow) so data stays the hero — matches our "hairlines not shadows" rule.
- Watch the **collapse behaviour**: expanded (label + icon) → mini icon-rail (icon only, tooltip on hover) → the *active* item stays legible in both. Our spec wants a three-state sidebar (240–256 / 56–64 / off-canvas).
- **Grouping** with tiny caps section labels ("Analytics", "Settings") — map to our Overview/By App/By Model/Events vs Pricing/Settings split.
- The **bottom cluster**: identity avatar + email + a notifications/what's-new affordance. Our header shows no identity today — steal this pattern and move identity here.
- Active-item treatment: Linear uses a **subtle tinted fill**, not a saturated bar. Our current `bg-brand-600 text-white` is loud; consider a `brand-50`/`brand-950` tint + left accent so brand blue stays "reserved."

---

## 2. Top bar / command menu

*(breadcrumbs, global search / ⌘K)*

**Links**
- **Mobbin glossary — Command Palette** (120+ studied patterns, variants): https://mobbin.com/glossary/command-palette
- **Linear command menu** (the reference ⌘K: scoped actions, recent, keyboard hints): https://mobbin.com/explore/screens/663ce897-cc91-4f2c-b9e8-15b2822846ab
- **cmdk (Paco Coursey)** — the live library Linear/Vercel-style palettes are built on; screenshot the demo in both themes: https://cmdk.paco.me/
- **Untitled UI — command menu components** (many finished layouts side by side): https://www.untitledui.com/components/command-menus

**What to notice / steal**
- **Breadcrumb + context on the left, actions on the right.** Our current header is right-aligned only with no page context — add a breadcrumb (`Overview` / `By App › Acme`) and the date-range summary so the user always knows *where* and *when*.
- ⌘K should **navigate AND filter**: "go to Events", "set range: last 30 days", "filter model: Opus". For a dense app this beats hunting through the UI.
- Notice the **keyboard-hint chips** (`↵`, `⌘K`, `esc`) — cheap polish that signals "power tool."
- Keep the top bar **thin and hairline-bordered**; don't let it compete with KPI cards.

---

## 3. KPI / stat card

*(big number + delta% vs prior + sparkline)*

**Links**
- **Tremor — KPI Cards blocks** (exactly big-number + delta badge + spark; toggle dark; this is the closest-to-spec reference): https://blocks.tremor.so/blocks/kpi-cards
- **Stripe web dashboard** (the canonical "big metric + % vs prior period" fintech tile): https://mobbin.com/explore/screens/d4ed06ce-1cde-43ca-89a4-49551cced134
- **Vercel analytics dashboard** (compact metric row above a chart): https://mobbin.com/explore/screens/d327779b-97f3-4a2a-b0d2-751cbaba7d9d
- **Mobbin glossary — Card** (grouping/hierarchy fundamentals): https://mobbin.com/glossary/card

**What to notice / steal**
- The **hierarchy**: tiny caps label → hero number (our 28/600, `tabular-nums`) → delta% vs prior + optional sparkline. Steal the Stripe **delta pill** (green up / red down, with an arrow) — but reserve red/green strictly for status, never as category colour.
- Deltas need a **direction-aware meaning**: for *cost*, "up" is usually bad — consider neutral-tinted deltas or an explicit "+12% vs last 7d" caption rather than a green/red good/bad implication.
- Sparkline uses the **brand blue "Total" series**, hairline-thin, no axis — a trend hint, not a chart.
- Our 6-tile grid (Total Spend, Calls, In/Out Tokens, Avg Cost/Call, Missing Pricing) maps 1:1 to Tremor's KPI grid. **Make "Missing Pricing" a first-class alert tile** (red border + "Needs attention" badge) — the pros (Datadog "cost unavailable") validate this.
- Compact-number formatting: `$1.2M`, `3.4M` on tiles; full precision in tables.

---

## 4. Line / area chart

*(time series, tooltips, compare-period)*

**Links**
- **shadcn/ui — Charts** (Recharts-based, our exact rendering stack; area/line variants, theme-aware): https://ui.shadcn.com/charts
- **Tremor — Chart Compositions** (300+ dense time-series blocks with legends/tooltips): https://blocks.tremor.so/blocks/chart-compositions
- **Langfuse cost dashboard** (LLM cost-over-time done by a direct peer): https://langfuse.com/docs/observability/features/token-and-cost-tracking
- **Datadog Cloud Cost Management** (spend trend + anomaly framing): https://www.datadoghq.com/product/cloud-cost-management/

**What to notice / steal**
- **Ghost "prior period" line**: a dimmed/dashed second series so "this month vs last" reads instantly (our design-direction §4 wants this). Notice how shadcn/Tremor dim the comparison series rather than giving it a second bright colour.
- **Tooltip design**: a single hovered timestamp shows *all* series with fixed entity colours + `tabular-nums` values, sorted desc. This is where our "colour follows the entity" registry pays off.
- Area fills should be **low-opacity gradients of the blue "Total"**, not saturated — keeps hairline/dense feel.
- Watch **axis restraint**: few gridlines (hairline), abbreviated `$` ticks, no chart-junk. Fixed-height responsive wrapper.

---

## 5. Bar chart & ranked bar-list

*(click-to-filter)*

**Links**
- **Tremor — Bar list / bar chart blocks** (ranked horizontal bar-list with inline values — the "By App / By Model" pattern): https://blocks.tremor.so/blocks/chart-compositions
- **Vercel analytics — Top Pages bar-list** (label + value + subtle track, click to drill): https://mobbin.com/explore/screens/d327779b-97f3-4a2a-b0d2-751cbaba7d9d
- **Helicone — top models / cost breakdown** (same domain: ranked models by cost): https://www.helicone.ai/
- **shadcn/ui — Charts (bar, stacked bar)** (stacked "cost by model over time"): https://ui.shadcn.com/charts

**What to notice / steal**
- The **ranked bar-list** (label · thin bar · right-aligned value) is more scannable than a chart-then-table split — our design-direction §4 recommends replacing the current split with this for By-App/By-Model.
- **Click-to-filter**: clicking a bar should cross-filter the page (and update the URL). Notice the hover/selected state on the row, not just the bar.
- **Stacked bar "cost by model over time"** is the single strongest "where is spend going" view (OpenAI/Datadog style) — use fixed model colours (Opus=orange, Sonnet=cyan, Haiku=violet, Fable=rose per our palette).
- Right-align numeric values with `tabular-nums`; cap categories at 6–8 and roll the rest into a neutral-grey "Other."

---

## 6. Donut / pie

*(legend + category colours)*

**Links**
- **shadcn/ui — Pie / donut charts** (Recharts donut with centre-label, theme-aware): https://ui.shadcn.com/charts
- **Tremor — Donut chart** (donut + side legend + `tabular-nums` values): https://npm.tremor.so/docs/chart-elements/donut-chart
- **Datadog cost breakdown (pie by category)**: https://www.datadoghq.com/product/cloud-cost-management/
- **Mobbin — explore web UI elements** (browse real donut/pie legends in context): https://mobbin.com/explore/web/ui-elements

**What to notice / steal**
- Prefer a **donut with a centre total** ("$12.4k total") over a plain pie — the hole earns its keep by holding the sum.
- **Legend as a mini-table**: swatch · model name · value · %, right-aligned numbers. This is where fixed entity colours matter — the swatch must match the chart slice *and* the data-table swatch.
- Our four fixed model colours (orange/cyan/violet/rose) are mutually distinct, so a **4-model donut is always safe**; beyond that, cap + "Other" grey.
- On narrow screens the legend **drops below** the donut (design-direction §3). Check the colour-blind safety in dark mode — our Spectrum palette is the cross-theme default for this reason.

---

## 7. Data table

*(dense, sortable, sticky header, row actions, empty state)*

**Links**
- **shadcn/ui — Data Table** (sorting, sticky header, row actions menu, pagination — our base): https://ui.shadcn.com/docs/components/data-table
- **Mobbin glossary — Table** (density variants, sticky columns, best practices): https://mobbin.com/glossary/table
- **Linear web screens** (dense rows, quiet hairlines, inline row hover actions): https://mobbin.com/explore/screens/0fd9e21f-1222-4074-a683-762db55d93bb
- **Refero — search "table / dashboard"** (dozens of shipped dense tables to compare): https://refero.design/search

**What to notice / steal**
- **Density dial**: our spec wants 40 dense / 32 compact / 48 comfortable row heights. Notice how Linear keeps rows tight but readable via a small type size + generous line-height, not cramped padding.
- **Sticky header + sticky first column** for wide numeric breakdowns; horizontal scroll for the rest (Events log). Right-align all numeric columns with `tabular-nums`; left-align text.
- **Row actions**: reveal on hover (Edit / Activate / Delete) as an icon cluster or `⋯` menu — don't show all actions on every row all the time (our Settings: Apps table).
- **Empty vs loading vs zero**: give each a *distinct* row treatment ("Loading…" skeleton, "No usage in this range" empty message, and real zeros). This is a named gap in our spec (empty and zero look identical today).
- Keep the **red "missing" pill** for `cost_usd = null` — a first-class cell state, not a blank.

---

## 8. Filter bar

*(date range + dropdown filters)*

**Links**
- **Tremor — Filterbar block** (date range + faceted dropdowns + clear-all, exactly our need): https://blocks.tremor.so/blocks/filterbar
- **Mobbin glossary — Date Picker** (single date + range variants): https://mobbin.com/glossary/date-picker
- **Datadog explorer filter bar** (dense faceted filtering over cost data): https://www.datadoghq.com/product/cloud-cost-management/
- **Linear filter menu** (add-filter chips that stack, each removable): https://mobbin.com/explore/screens/0fd9e21f-1222-4074-a683-762db55d93bb

**What to notice / steal**
- **One unified filter bar per data view** with a **date-range preset menu** (Last 7d / 30d / MTD / custom) + **CSV export** on the right — design-direction §4 wants this on every view.
- **Replace our free-text Events filters with dropdowns** fed by `/apps` and `/pricing/models` (typing an exact app_id UUID is a known pain point). Notice how Tremor/Linear use searchable dropdowns (combobox) for this.
- **Active filters as removable chips** so the current query is always visible; "Clear all" resets. Changing a filter resets pagination to page 1 (our existing behaviour — keep it, but show it).
- Controls at **36px default height** (32px compact), hairline borders, brand-blue focus ring.

---

## 9. Toggle / switch · segmented control · tabs

**Links**
- **Mobbin glossary — Switch**: https://mobbin.com/glossary/switch
- **Mobbin glossary — Segmented Control**: https://mobbin.com/glossary/segmented-control
- **Mobbin glossary — Tabs / Tab Bar**: https://mobbin.com/glossary/tab-bar
- **shadcn/ui — Tabs & Switch components** (our base states; screenshot dark/light): https://ui.shadcn.com/docs/components/tabs

**What to notice / steal**
- **Choose the right control for the job:** *switch* = a setting that takes effect immediately (dark-mode, app active/inactive); *segmented control* = 2–4 mutually exclusive views of the *same* data (e.g. Cost / Tokens / Calls toggle on a chart); *tabs* = distinct sub-sections.
- Segmented control is ideal for our **theme-switcher** dials (Density: Comfortable/Compact; Palette: Spectrum/Tonal) and for switching a chart's metric without reloading.
- Notice the **selected pill** in a segmented control uses a subtle raised/tinted fill on a hairline track — a clean spot to preview our **sharp vs slight-radius** corner decision.
- Keep the active tab indicator to a **2px brand underline** (brand blue is allowed as chrome here), not a filled tab.

---

## 10. Dropdown / select · combobox

**Links**
- **Mobbin glossary — Select**: https://mobbin.com/glossary/select
- **shadcn/ui — Combobox** (searchable select, built on cmdk — our base for filter dropdowns): https://ui.shadcn.com/docs/components/combobox
- **Linear assignee / label picker** (fast, keyboard-first combobox with avatars/colours): https://mobbin.com/explore/screens/663ce897-cc91-4f2c-b9e8-15b2822846ab
- **Refero — search "select / dropdown"**: https://refero.design/search

**What to notice / steal**
- For Events filters and the Pricing "Model" field, use a **combobox (type-to-search + pick)** instead of free text — prevents the "typo creates a new model" problem noted in our Pricing spec.
- Notice how good comboboxes show a **colour swatch/avatar next to each option** — reuse our fixed model/app colour registry so the picker matches chart + table.
- Keyboard support (arrow keys, type-ahead, `enter`) and a visible **empty/no-match state** ("No models found").
- Menu surface: hairline border + soft elevation in dark mode (real elevation ladder, not inverted colours).

---

## 11. Input field / form

**Links**
- **shadcn/ui — Form** (label + control + description + inline error, RHF+Zod; our base): https://ui.shadcn.com/docs/components/form
- **Mobbin — web search fields / text inputs**: https://mobbin.com/explore/web/ui-elements/search-bar
- **Stripe forms** (the fintech reference for numeric/money inputs, validation, helper text): https://mobbin.com/explore/screens/d4ed06ce-1cde-43ca-89a4-49551cced134
- **Refero — search "form"**: https://refero.design/search

**What to notice / steal**
- Our Pricing and Register-App forms are money/token heavy — notice **prefix/suffix affordances** (`$` prefix, `/1M` suffix), `inputmode="decimal"`, and `tabular-nums` in the field.
- **Inline validation** under the field (not just a red banner at the top like today's Login) with a clear success/submitting state.
- 40px form-control height (design-direction §3), hairline border, brand-blue focus ring, generous label (13/500).
- **Empty helper text** that teaches ("Prices are append-only — adding a row supersedes the old price from the effective date") reduces support load.

---

## 12. Modal / dialog

*(incl. destructive-confirm)*

**Links**
- **Mobbin glossary — Dialog**: https://mobbin.com/glossary/dialog
- **shadcn/ui — Alert Dialog** (the destructive-confirm primitive, focus-trapped): https://ui.shadcn.com/docs/components/alert-dialog
- **GitHub "Delete repository" confirm** (the type-to-confirm gold standard for irreversible actions) — see it captured on Refero: https://refero.design/search
- **Mobbin glossary — Drawer** (side-sheet alternative for detail/edit): https://mobbin.com/glossary/drawer

**What to notice / steal**
- Our spec flags **"Delete app is immediate — no confirmation" as High priority (U4)**. Steal the **type-to-confirm** pattern (type the app name to enable a red "Delete" button) for irreversible deletes; a plain "Are you sure?" is fine for reversible ones.
- Destructive button is the **only** red element in the dialog; the cancel is neutral and is the **default/escape** action.
- **Focus trap + `esc` to close + backdrop `bg-black/50`** — our existing API-Key modal (M1) lacks a focus trap; fix it here.
- For the **API-key reveal** modal, notice good "copy secret" dialogs: monospace-ish `tabular` block, a Copy button with a **"Copied!" confirmation** (our M1 is missing this), and a one-time red warning.

---

## 13. Toast / notification

**Links**
- **Sonner (Emil Kowalski)** — the toast library shadcn ships; screenshot success/error/loading/promise toasts in both themes: https://sonner.emilkowal.ski/
- **shadcn/ui — Sonner** (our base wiring): https://ui.shadcn.com/docs/components/sonner
- **Mobbin glossary — Banner** (persistent in-page notice vs transient toast): https://mobbin.com/glossary/banner
- **Mobbin — web notification screens**: https://mobbin.com/explore/web/screens/notifications

**What to notice / steal**
- Our spec calls out **U6: success is silent, errors are inline only.** Add a toast system: success (app deactivated, pricing added, key copied), error (with retry), and loading→success promise toasts.
- **Toast vs banner:** transient toast for action results; a **persistent banner** for system state ("Anthropic reconciliation not configured" / "N events missing pricing") that shouldn't auto-dismiss.
- Notice Sonner's **stacking, swipe-to-dismiss, and a single accent per type** — status colours only (green/amber/red), never category colours.
- Bottom-right placement, hairline border, `tabular-nums` in any count ("12 events updated").

---

## 14. Empty state & teaching / first-run state

**Links**
- **Mobbin glossary — Empty State** (best practices + action-in-empty-state variants): https://mobbin.com/glossary/empty-state
- **Mobbin — web empty-state screens** (browse dozens of real ones): https://mobbin.com/explore/web/screens/empty-state
- **Linear / Vercel first-run** (product-led onboarding, "connect your first…" states): https://mobbin.com/explore/screens/0fd9e21f-1222-4074-a683-762db55d93bb
- **Helicone / LiteLLM "send your first request" onboarding** (same domain: how to teach the ingest step): https://docs.litellm.ai/docs/proxy/ui

**What to notice / steal**
- **Distinguish empty from zero** (our named gap): "No usage in this range" (with a "widen range" action) is *not* the same as a real `$0.00`. Give empty states an icon + one sentence + one primary action.
- **First-run / teaching state:** Settings: Apps and Pricing start empty for a new admin — steal the "register your first app → here's your key → send your first event" flow. A tiny code snippet (the `POST /v1/ingest` curl with `X-Tracker-Key`) in the empty state turns a dead page into onboarding.
- Notice the **restraint**: one Phosphor icon (outline weight), muted text, a single brand-blue CTA — not a giant illustration (we have no brand imagery, and dense apps shouldn't fake it).

---

## 15. Pagination

**Links**
- **Mobbin glossary — Pagination**: https://mobbin.com/glossary/pagination
- **shadcn/ui — Pagination component** (our base; prev/next + page numbers): https://ui.shadcn.com/docs/components/pagination
- **Tremor — table pagination blocks** (footer with "rows per page" + range): https://blocks.tremor.so/blocks/chart-compositions
- **Mobbin — web stepper / page-control elements**: https://mobbin.com/explore/web/ui-elements/stepper

**What to notice / steal**
- Our Events log is page-size 50 with "Page X of Y (N events)". Steal the **footer pattern**: `Showing 1–50 of 1,240` + prev/next + optional page-size selector, all `tabular-nums`.
- **Disabled edges** (Prev on page 1, Next on last) must be visibly disabled, not just non-functional (our current behaviour — keep, make obvious).
- For very large logs, consider **cursor/"load more"** or keyset pagination over deep page numbers — but numbered pages are fine at our scale; don't over-build.
- Keep the control set compact and hairline-bordered; it lives at the bottom of a dense table and shouldn't shout.

---

## Quick source map (which resource is best for what)

| Need | Best first stop |
|---|---|
| Our exact components, live, theme-toggle, free | **shadcn/ui** ([blocks](https://ui.shadcn.com/blocks) · [charts](https://ui.shadcn.com/charts)) |
| Dense-dashboard blocks (KPI, filterbar, charts), free | **Tremor Blocks** ([blocks.tremor.so](https://blocks.tremor.so/)) |
| Per-element "what to notice" + real variants | **Mobbin glossary** ([mobbin.com/glossary](https://mobbin.com/glossary)) |
| Shipped real-product screens, searchable | **Refero** ([refero.design](https://refero.design/search)) · **Mobbin** ([browse](https://mobbin.com/browse/web/screens)) |
| Whole SaaS analytics dashboards | **SaaSFrame** ([analytics](https://www.saasframe.io/categories/analytics) · [dashboard](https://www.saasframe.io/categories/dashboard)) |
| Domain peers (LLM cost) | **Helicone** ([helicone.ai](https://www.helicone.ai/)) · **Langfuse** ([dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards)) · **LiteLLM** ([UI docs](https://docs.litellm.ai/docs/proxy/ui)) |
| Cost-management framing | **Datadog Cloud Cost** ([product](https://www.datadoghq.com/product/cloud-cost-management/)) · **Vercel spend** ([docs](https://vercel.com/docs/spend-management)) |
| Fintech density / delta-vs-prior tiles | **Stripe / Ramp** (via [Mobbin Stripe](https://mobbin.com/explore/screens/d4ed06ce-1cde-43ca-89a4-49551cced134) · [Ramp reporting](https://ramp.com/reporting)) |

*Note: Mobbin's full library requires a Pro account; glossary intros, Refero, Tremor, and shadcn are openly viewable and screenshot-ready.*
</content>
</invoke>
