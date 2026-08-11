# Starter prompt — apply the Finoptic Brand Guide to the mock-up

> **Spent — historical record, do not run.** This prompt was executed on 29 July 2026 and the work it
> asks for is done. It is kept only to show what the Brand Guide rollout was asked to do. Two of the
> files it names no longer exist: the single `meridian-finops-mockups.html` was split into
> `finoptic/index.html` + `styles.css` + `app.js` (with `logo.js`, `brands.js` and `data/`), and the
> pre-rollout snapshot it tells you to take is now the one kept at `finoptic-original.html`. The
> Brand Guide itself has since moved on six times, to v2.0, v3.0, v3.1, v3.2, v3.3 and then v3.4.

Copy everything below the line into a fresh session (or hand it to an agent) rooted at `C:\Users\lohit\Desktop\crozaint\04-code\meridian`. It's written to need no other context from prior conversations.

---

Finoptic is a product-concept mock-up that demonstrates a technology-spend monitoring dashboard to a client (not a real product yet). Today it's a single HTML file, `meridian-finops-mockups.html` — no backend, no build step, opens by double-click. Read `CLAUDE.md` first for full project orientation.

**Your task:** apply the full visual language specified in `planning/design-language/finoptic-design-language.md` (the Brand Guide, sections 0–11 + the hard-rules checklist at the end) across the entire mock-up. Right now only the sidebar brand mark, the accent-color tokens, and two active-states (nav item, primary button) reflect the new brand; the other ~17 screens, their tables, charts, KPI cards, and chips still use the pre-rebrand look and the old typography.

**Work through the guide section by section** (§1 typography → §2 color → §3 surfaces/corners → §4 spacing/density → §5 iconography → §6 data-viz → §7 components → §8 layout/nav) rather than screen-by-screen — most of it is token and shared-component work that then applies everywhere at once.

**Split the file up while you're in there.** The single-HTML-file constraint is gone (§10) — restructure into `index.html` + `styles.css` + `app.js` (or similar) linked with relative paths in the same folder. Still no build tooling, no framework, still must open by double-click.

**Before you start:** copy `meridian-finops-mockups.html` to a timestamped backup file in the same folder. There's no git repo here, so that copy is the only rollback path.

**Hard constraints, don't violate these:**
- Typography is Mona Sans (everything textual) + Space Grotesk (hero/metric numbers only) — **no monospace font anywhere**, including the breadcrumb, table headers, and filter chips that currently use one. See §1's implementation note about repointing (or renaming) the existing `--mono` token.
- Keep every existing interactive behavior working: the persona switcher, the accent-color switcher (`data-palette`, three options — orange/blue/mono — all still need to work), hash-based screen routing, filter chips, breadcrumb drill-down.
- **Don't touch screen content, copy, or the underlying dataset** (the `D` object and per-screen `S.*` render functions' actual text/numbers). This pass is presentation only — Phase 4 (`planning/04-usability-and-insights.md`) owns content, not you.
- **Don't touch motion/transitions** beyond what's already there (`prefers-reduced-motion` handling). That's Phase 3 (`planning/03-experience-and-engagement.md`) — out of scope here.
- The brand guide already explains, inline, everywhere it diverges from the copied trakit reference material in `planning/design-language/reference/` (tree-rail sidebar, hatch texture, roomy density, "one hero number" KPI treatment — all deliberately not what Finoptic does). The brand guide is the source of truth; trakit's own `DESIGN.md` is precedent only, don't follow it where the two disagree.
- The reconciliation ledger strip (§7) stays a dense, equal-weight row — never a KPI hero card.
- The accent color stays rationed (§0, §3) — never on table rows, never washed across chart backgrounds, never used for anything semantic (status/severity) that already has a reserved color.

**When you're done:**
1. Open the file in a browser and click through all four persona views and a representative sample of screens (at least one from each nav group) to confirm nothing is visually broken.
2. Test the accent switcher still swaps all three palettes correctly across whatever you touched.
3. Update `status.md` per the policy described in `CLAUDE.md` (refresh it, don't just append — remove anything it says that's no longer true). The Brand Guide itself is a reference doc, not a changelog — don't add a history section to it.

If anything in the brand guide is ambiguous or doesn't fit a specific screen well, flag it rather than guessing — this is a client-facing demo two days from a Friday call, so a visible, deliberate placeholder beats a silent wrong guess.
