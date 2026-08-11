# Reference commentary — what we're taking from each dashboard

**By:** Lohith (design lead) · **Captured:** 2026-07-12
**Why this file exists:** the screenshots in this folder are the *look* we're aiming for.
This file is the *reading* of them — Lohith's notes on what he liked in each, plus the
concrete design decision each one feeds. It is the bridge between the images and
**`../../DESIGN.md`** (the app's visual-language spec). Agents doing UI work should read
this alongside `DESIGN.md`.

> **The one-line thesis.** In every reference Lohith chose, **the numbers are the hero and
> the charts are bespoke, textured supporting graphics** — not generic library charts.
> The shared "voice" is three moves repeated everywhere: **hatched / striped ("slanted")
> fills**, **gradients on the data**, and **soft elevation (shadows) instead of hairline
> outlines**. That hatch texture is also how we keep the **Crozaint slant** alive after
> moving away from slanted *corners* — the slant migrates from the corners into the icon
> fills and chart textures.

---

## ★ Top references

### Aeros — `aeros/` (Lohith's spelling: "Arrows") — the strongest reference
Files: `dashboard.webp`, `icons.webp`, `plots.webp`, `plots2.webp`, `plots3.webp`, `stat-tiles.webp`, `colors-fonts.webp`, `timeline.webp`

**Lohith:** *"The biggest things I liked are here. Its icons and charts have a distinct
voice. The app is clean, and the supporting graphics — especially the bespoke plots — are
striking. The plots are supporting components, yet the statistics stand out clearly. The
icons have character, with slanted fills, reinforcing the brand voice. The plots are custom
and meticulously crafted; they support the storytelling, while the fonts and stats are the
primary focus. A strong reference for our design."*

**What's actually on screen:**
- **Icons with diagonal-hatch fills** (`icons.webp`): the droplet, heart, thermometer and
  fan icons are line icons whose interior is filled with fine diagonal stripes. This is the
  "slanted fill / character" Lohith means. It is *the* signature move.
- **Numbers as hero**: `28°C`, `63.5%`, `86` rendered in a large, light-weight, elegant
  numeral. The stat is the loudest thing on the tile; the chart under it is quiet.
- **Bespoke plots** (`plots*.webp`): gradient-filled area sparklines, thin candlestick-style
  bars that fade blue→warm, a radial dial with hatch ticks and a warm glow indicator, and
  bar charts whose bars are **hatch-filled** rather than solid.
- **Palette** (`colors-fonts.webp`): one **blue** (Oxygen Blue `#3B72ED`) + one **warm coral**
  (Warm Ether `#F18D74`) against near-black carbon. Blue is the system colour; coral is the
  one rationed accent / alert.
- **Soft elevation**: cards sit on the near-black canvas via a barely-there lift, not a 1px box.

**Feeds → DESIGN.md:** hatched-fill icon tiles (§5), gradient + hatch chart fills and the
"numbers are hero, plots support" philosophy (§6), one-blue-one-warm accent logic (§2),
shadow elevation over outlines (§3).

### Vaulto — `vaulto.png` — stats, dark mode & the side panel
**Lohith:** *"Their dashboard uses multiple cards with a subtle pixelation pattern that
conveys brand identity. Small graphs are embedded in the cards, the plots are bespoke and
use gradients to highlight the statistics. This informs the look of the stats, dark mode and
side panel. Study it in detail."*

**What's on screen:**
- **Grouped, icon-led sidebar** with section headers (General / Tools / Insights / Other),
  a command/search bar up top, and an upgrade card pinned at the bottom.
- **Hero number** `$12,420.22` with a green `↑ +24%` delta and a sub-line of context.
- **Subtle noise / pixelation texture** on the currency cards — a whisper of grain that reads
  as "material," not flat colour. This is the brand-identity texture Lohith calls out.
- **Bespoke plots**: a two-line chart (white + red) on a faint grid, a bar chart with **one
  red highlighted bar**, a **Sankey** flow for asset mix, and a **dot-matrix heatmap** for net
  cashflow. A whole plot vocabulary, all custom.
- Orange as the single rationed accent (Add Funds).

**Feeds → DESIGN.md:** the tree-rail grouped sidebar + command bar (§8), dark-mode surface
ladder (§3), faint card texture on the hero card (§3), gradient plots and the
one-highlighted-element idea (§6), KPI hero pattern (§7).

---

## Plot vocabulary

### Rabbit — `rabbet/` — the plot-type library
Files: `dashboard.png`, `project.png`, `tables-chips-plots.png` (+ `-2…-5`)

**Lohith:** *"For various plot types, see Rabbit — many plot styles, chips and tables. Use it
when we need a new plot type."*

**On screen:** nightingale/rose chart, radar/spider chart, dual-line area chart, budget-vs-
actuals with a highlighted column, gradient KPI cards, and dense financial tables with
red/green variance colouring and status chips. Lime-green accent on near-black.

**Feeds → DESIGN.md §6:** this is our **"extended chart vocabulary" menu** — rose, radar,
variance table, etc. Reach for these only when a specific data point calls for it; the daily
views stay line / bar / donut / bar-list.

---

## Hierarchy through emphasis, not colour-blocking

### AI-fashion — `ai-fashion.png`
**Lohith:** *"Hierarchy rather than colour-blocking: a colored card immediately draws
attention, and its bar plot uses patterns for differentiation."*
**On screen:** a mostly-white board with **one purple gradient hero card** that grabs the eye;
bar charts drawn with **fine vertical-line patterns** instead of solid fills; a gradient line
with a ruler-tick baseline.
**Feeds:** the **one colored/gradient hero card among neutral cards** rule (§8) and
**pattern-filled bars** for differentiation (§6).

### Airzone — `airzone.webp` (Lohith: "AIR zone")
**Lohith:** *"Does the same — patterns within bar plots. Spacing is clean."*
**On screen:** bars built from stacked dashes/ticks, an area chart with a blue gradient fill +
a **dashed gold ghost line** + tooltip, radial mini-gauges on a world map, a dotted line chart.
**Feeds:** hatch/dash **texture as a CVD-safe way to tell series apart** (§6); the dashed
**prior-period ghost line** we already planned is validated here.

### Cryptek — `cryptech.png` (Lohith: "Cryptek")
**Lohith:** *"Cards and row plots, with a modern, clean bar chart."*
**On screen:** **colored highlight KPI cards** — the BTC tile is filled lime, the ETH tile is
filled blue, the rest stay white — each with a mini sparkline; a clean soft-topped bar chart;
a table with green/red deltas + 7-day sparklines; a red→green semicircle **gauge** (Fear/Greed).
**Feeds:** **colour a KPI tile to promote it** (§7); clean bar chart + gauge (§6).

---

## Special-purpose plots

### Financia — `financia.jpg`
**Lohith:** *"In the financial domain I liked the dot-matrix plot. Use it only if a data point
calls for it."*
**On screen:** a row of **gradient hatch-bar sparklines** (one colour ramp per category), a
tri-segment budget bar (Unused / Used / Reserved), and an **income figure drawn as a
dot-matrix** (brightness-varying dots). Lime action buttons on near-black.
**Feeds → DESIGN.md §6:** dot-matrix is in the **extended vocabulary** — special use only.
The per-category gradient hatch-bars reinforce the texture language.

---

## Sidebar & navigation

### Flowmail — `flowmail.png`
**Lohith:** *"You can see the sidebar layout; we want something similar."*
**On screen:** a clean, **roomy light sidebar** — icon-led items, generous spacing, profile card
pinned bottom; a top bar with search + a gradient "Get AI Insight" button; KPI cards with tiny
green/red delta pills; a donut with one promoted wedge; status chips (Active / Scheduled /
Completed).
**Feeds:** the **breathable, grouped, icon-led sidebar** and the overall "give it air" density
(§4, §8). This is the antidote to "claustrophobic."

### Hynex — `hynex.png` — the tree sidebar
**Lohith:** *"Well-executed plots, and I especially like its tree structure — we should
incorporate a similar tree in our side panel."*
**On screen:** the sidebar groups (Main / Features / Tools) render items connected by a **left
vertical rail with short connector ticks** — a literal tree. Collapse chevron top-right.
Multi-colour segmented progress bar; gradient glow line chart; pill status chips.
**Feeds → DESIGN.md §8:** the **tree-rail grouped sidebar** is our nav model — grouped
sections, a connector rail, collapse to a mini icon-rail.

---

## Layout & panel composition

### iCare — `icare.png`
**Lohith:** *"Shows how various panels combine."*
**On screen:** KPI cards with **colored icon tiles** + sparklines; a two-line chart with a
tooltip; a **stacked bar** chart; two tables (appointments, doctors) with avatars and
green/red status dots. A calm, legible light layout.
**Feeds:** colored icon tiles on KPIs (§7), how to sit several panel types on one board (§8).

### Loud — `loud.jpg` — asymmetric blocking
**Lohith:** *"Asymmetric card-blocking, with a free-flowing top area that enhances
hierarchy."*
**On screen:** a big `Total revenue $16,957.00` on the left (**decimals dimmed** to grey),
then a free-flowing 3-part breakdown (solid bar → hatch bar → faded bar) across the top —
**not** a rigid uniform grid. Below: three equal cards (line + dashed ghost, a purple **dot
heatmap**, a chip'd transaction list).
**Feeds → DESIGN.md §7/§8:** **dimmed decimals** on big numbers; an **asymmetric hero row**
(one big number + a free-flowing breakdown) instead of six identical tiles.

---

## Tables & chips

### Orbix — `orbix.png`
**Lohith:** *"Shows how to represent data points in a table, using colored chips — I'd like
that in our tables."*
**On screen:** a transactions table with **colored status chips** (Completed = green,
Canceled = red, Pending Review = amber), row logos, and a clean
Data-Views / Filters / Date / Keywords / Amount / Export toolbar. Gradient-mesh stat cards up top.
**Feeds → DESIGN.md §7:** **colored status chips in tables** (semantic: green/amber/red) and
the unified filter/export toolbar.

---

## Hierarchy & clean plots

### Rexora — `rexora.jpg`
**Lohith:** *"Illustrates hierarchy usage."*
**On screen:** big bold KPI numbers with up/down deltas + a "View Details" link + a corner
icon; a bar chart of **muted hatched bars with one solid orange highlighted bar** and a
floating value tag; a top-products list with thumbnails; a price-tagged country map. Strong,
confident type hierarchy.
**Feeds:** **hatched bars + one highlighted bar** (§6); bold KPI hierarchy (§7).

### Salezy — `salezy.jpg` (Lohith: "Salesy")
**Lohith:** *"Clean plots."*
**On screen:** grouped sidebar (Main Menu / Tools) with colored tool icons + a message badge;
KPI cards with a colored icon, a green delta, **an info (ℹ) icon**, and a "from last month"
line; a bar chart of hatched bars with **one solid blue highlighted bar** + tag; **decimals
dimmed** on the big number (`$5,567`.`00`); a blue segmented **radial gauge** (70.8%); a table
with Pending/Completed chips.
**Feeds:** confirms **dimmed decimals** (§7), **highlighted single bar** (§6), the **info-icon
on KPI labels** (matches decision #4), radial gauge (§6), grouped icon sidebar (§8).

---

## The extracted DNA (what all of this becomes)

1. **Numbers are the hero; plots are quiet, bespoke, textured support.** — everyone
2. **Slant lives in the texture, not the corner** — diagonal **hatch fills** on icons, bars,
   and chart areas. — Aeros, Financia, Airzone, AI-fashion, Rexora, Salezy
3. **Gradients on the data** — area fills that fade to transparent, brighter-topped bars,
   gradient hero cards & primary buttons. — Aeros, Vaulto, Rabbit, AI-fashion, Cryptek
4. **Soft elevation, not hairline boxes** — layered shadows + a faint top highlight in dark
   mode; a whisper of grain on the hero card. — Vaulto, Aeros
5. **Promote one thing per view** — one colored/gradient hero card; one highlighted bar; one
   promoted donut wedge. — AI-fashion, Cryptek, Rexora, Salezy, Loud, Flowmail
6. **Dimmed decimals** on big money numbers (`$12,428`.`55`). — Loud, Salezy
7. **Asymmetric hero row** — a big number + a free-flowing breakdown beats six identical
   tiles. — Loud, AI-fashion
8. **Tree-rail, grouped, icon-led, breathable sidebar** — collapses to a mini rail. — Hynex,
   Vaulto, Flowmail, Salezy
9. **Colored status chips in tables** (green / amber / red, semantic only). — Orbix, Hynex,
   Salezy, iCare
10. **Give it air** — generous padding and row height; the calm comes from whitespace. —
    Flowmail, iCare, Airzone
11. **An extended plot vocabulary on tap** — rose, radar, gauge, Sankey, heatmap, dot-matrix —
    used only when a data point calls for it. — Rabbit, Vaulto, Financia, Airzone, Salezy

Full implementation of each point lives in **`../../DESIGN.md`**.
