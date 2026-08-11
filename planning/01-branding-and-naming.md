# Phase 1 — Branding & naming

**Status:** In progress · **Depends on:** nothing · **Blocks:** Phase 2 (design language)
**Navigator:** [`00-overview.md`](00-overview.md)

## Goal

Decide what this product is actually called and what it stands for — before any visual system gets built around the current name.

## Why this is phase 1

It's a decision, not a build phase, so it doesn't need to consume real time — but it's the one thing that's cheap to change now and expensive to change later. The color story, any logo mark, and even the tone of the insight copy written in phase 2/3 will get built around whatever name is chosen here. Rename after the visual system exists and all of that gets redone.

## The problem as stated

"Meridian" doesn't align with the product's purpose. Worth separating two possible reasons, since they lead to different fixes:

- **The concept doesn't fit** — a meridian (a line of longitude, a fixed reference line you measure position against) doesn't evoke financial control at all.
- **The associations feel off**, even if the underlying concept is defensible — a meridian actually maps reasonably well to this product's core mechanic (a single reference line everything else reconciles against), but "Meridian" as a word may read as generic, or already overused as a SaaS name, or just not evocative of money/control/urgency.

Worth deciding which of these it is before brainstorming replacements — if it's the second, the fix might be a different word carrying the same reference-line idea rather than abandoning the idea entirely.

## Decisions to make

1. **Final name.**
2. **One-line positioning statement** — the sentence that goes under the name everywhere (nav bar, deck, this doc). Should be usable as-is in the PRD's opening line.
3. **Relationship to Crozaint, the parent company.** Does this product carry a visible "by Crozaint" endorsement (the way the LLM-tracker product "trakit" does — see [`02-design-language.md`](02-design-language.md) for that reference), or does it stand fully independent with no visible parent-brand tie? This isn't cosmetic — it determines whether phase 2 should deliberately share visual DNA with Crozaint's other products or deliberately not.

## Not in scope here

Logo design, color palette, typography — all of that is phase 2, once the name is settled.

---

## Candidate names — round 1 (29 July 2026)

Brief driving this round: the name needs to read as finance / money control / agency, and "Meridian" is considered an overused app name.

### What a quick collision check turned up

Before proposing names, it's worth knowing how crowded this specific territory is. A quick web check (not a formal trademark search — see caveat below) on the most obvious finance/ledger/control-metaphor candidates found nearly all of them already in use, several by direct or adjacent competitors:

| Candidate | Finding |
|---|---|
| Plumb | Collides phonetically with **Plum**, a well-known personal-finance/savings app |
| Ledgerline | Already an existing accounting/inventory SaaS product (ledgerline.app) |
| Outlay | Already an existing expense-tracking app + a company (Outlay ApS) |
| Keel | Already a live UK fintech infrastructure company (Banking-as-a-Service), recently out of stealth |
| Spendcraft | Already a real spend-classification/analytics platform for finance & procurement teams — a direct competitor |
| Ledgerpoint | Already taken, multiple times over (ledgerpoint.us, ledgerpoint.io, ledgerpointai.com) |
| Costline | Already an existing LLM-spend-intelligence product — adjacent competitor |
| Rho | Already a well-funded, well-known corporate spend/banking fintech |
| Fulcrum | No direct hit in the finance/spend space (used elsewhere, e.g. field-data-collection software) — the one relatively clear option found this round |

**The takeaway matters more than any one name here:** the literal finance-vocabulary territory (ledger / spend / cost / tally + line / point / craft / base) is saturated — largely by well-funded, fairly well-known competitors, not just SEO squatters. That's not a coincidence; it's the obvious naming territory for this category, so everyone converges on it. This reframes the original complaint about "Meridian" — the issue isn't just that one word, it's that almost anything drawn straight from finance vocabulary is likely already spoken for.

### Recommended strategy going forward

Lean away from literal finance/ledger words and toward a **short, distinctive word from an adjacent domain** (or an invented one), with the "finance / money-control / agency" meaning carried by the **positioning line**, not the name itself. This is the pattern behind the category's actual winners — Ramp, Brex, Mercury, Rho (ironically, Rho itself is exactly this: an abstract, short, non-financial word) — none of those names mean "corporate spend" on their own; the tagline does that work.

**Decision (29 July 2026):** see both directions side by side before narrowing, rather than committing to one lane upfront. Round 2 below does that.

## Candidate names — round 2: both directions side by side (29 July 2026)

### Adjacent-metaphor real words

| Candidate | Why it fits | Collision check |
|---|---|---|
| **Fulcrum** | The point everything pivots/leverages against — control and agency, not just money | No direct hit in the finance/spend space (used elsewhere, e.g. field-data-collection software). Cleanest of the real-word options so far. |
| **Datum** | The literal surveying term for a fixed reference point/surface everything else is measured against — same underlying concept as "meridian" (a fixed reference line), just reframed via measurement/data instead of geography. Doubles as a pun on "a datum" = a piece of data. | Some hits, but from smaller/unrelated-corner companies (an IT staffing group, a payments-platform vendor) — not a dominant, well-known direct competitor. Worth a closer look, not a hard pass. |
| **Ballast** | Stability under load — a financial-control metaphor without being literal finance vocabulary | Closer collision: "Ballast Financial" (outsourced accounting for startups) and a GRC/risk-software product both use it. Riskier than the two above. |

### Invented / coined words

| Candidate | Why it fits | Collision check |
|---|---|---|
| **Verolan** | Clean, calm, professional sound; no dictionary meaning to carry or fight against — the "finance/control" meaning would come entirely from positioning | No existing company or product found under this name. |
| **Kestrix** | Evokes precision and speed (echo of "kestrel," a fast, precise falcon) without literal finance vocabulary | Already used by a funded UK climate-tech startup (building energy-efficiency SaaS) — different industry, so legal collision risk is lower than a same-market hit, but it's not a clean, unclaimed word either. |

**Reminder:** none of this substitutes for a real trademark and domain-availability check (USPTO/relevant registry + domain registrars) once you're close to a final pick — the searches above are a fast sanity check, not legal clearance.

### Where this leaves us

**Fulcrum**, **Datum**, and **Verolan** are the three worth reacting to first — each is clean or close to clean, and each fits from a different angle (leverage/control, measurement/reference, or a blank slate carried by positioning). Let me know which direction feels right, or if none of these land and you'd like another round.

**Update (29 July 2026):** none of round 2 landed. New direction from the user: **finance personified as a name** — a coined word rooted in "Fin," styled like a given name or a friendly brand-character name (their examples: "finopz," "finatoz"), not a literal accounting word.

## Candidate names — round 3: "Fin" personified (29 July 2026)

### What the collision check found

This turned out to be the single most crowded naming pattern checked so far — more so than the literal ledger/spend vocabulary in round 1. "Fin + word" is the default first move for fintech founders, so most natural-sounding combinations are already claimed, several by well-funded companies:

| Candidate checked | Finding |
|---|---|
| Finn | Multiple existing fintech apps (FINN — financial-health app for Southeast Asia's underbanked; a European car-subscription "FINN") |
| Finley | **Finley Technologies** — a Y Combinator- and Bain Capital-backed debt-capital-management software company. A direct, well-funded enterprise-finance-software competitor. |
| Finora | An Estonian banking group with its own ECB banking licence, plus unrelated treasury/loan-servicing software also using the name |
| Finaro | A payments company acquired by Shift4 for $575M |
| Finto | A Y Combinator-backed AI accounting startup for enterprise finance teams — very close to Meridian's own space |
| Finastra | One of the largest financial-software companies in the world — the whole "Fin-astra/-ora/-aro" phonetic neighborhood is worth avoiding |
| Finnrick / Finrick | Used by an unrelated health/wellness analytics company — different industry, lower legal risk, but not distinctive |

### What came back clean

| Candidate | Personified feel | Collision check |
|---|---|---|
| **Finlow** | Reads like a surname (Winslow, Marlow) — and doubles as a nod to cash *flow* | No existing company or product found |
| **Finelle** | Reads like a given name (Estelle, Michelle, Danielle) — warm, approachable | No existing company or product found |
| **Findra** | Reads like a given name (Kendra, Sandra) | No existing company or product found |
| **Finnard** | Reads like a given name (Bernard, Leonard) — a more neutral/masculine-leaning option alongside the two above | No existing company or product found |

**One thing worth naming directly:** a personified "Fin-" name reads warm and approachable — the pattern real consumer-finance apps use well (Cleo, Albert, Dave, Emma all do exactly this). Meridian's actual buyers are enterprise (an IT finance lead, a finance team, procurement, product leaders), not individual consumers — worth a quick gut-check on whether "Finelle" or "Findra" read as credible to that audience, or as slightly more consumer-coded than the room expects. Not a reason to drop the direction, just something to sanity-check before committing.

Reminder stands: none of round 3 has had a real trademark/domain check either — these are the ones worth taking to that step.

---

## Decision: Finoptic (29 July 2026)

**Chosen name: Finoptic** — "Fin" + "optic," landing outside all three brainstormed rounds. This is a stronger fit than anything in rounds 1–3: it's not just personified/pleasant-sounding, it's semantically load-bearing — "optic" (vision, clarity, focus) paired with "Fin" directly encodes the product's actual value proposition (financial *visibility* — seeing where the money goes) rather than just sounding good. Genuinely the strongest candidate discussed so far.

### Collision check — one real finding to act on

**"Finoptic Capital Services" already exists** (`finoptic.in`) — an operating financial-services company, apparently India-based, using "Finoptic" as its brand. Unlike round 3's clean options, this is a real, same-broad-industry hit, not a different-industry coincidence. It doesn't mean the name is dead — trademark risk depends on jurisdiction, registration status, and how close "capital services" is to "enterprise tech-spend software" in the eyes of a trademark examiner or court — but it's the one thing that must go through a real check before this is locked, not just a nice-to-have. No other software product or app turned up under the name in this check.

**Recommended next step:** before treating "Finoptic" as final, get an actual trademark/domain-availability check done (the jurisdiction(s) Crozaint operates in + `.com`/relevant TLD availability), specifically because of the `finoptic.in` hit — this is a different situation from rounds 1–3, where the reminder was routine due diligence rather than a known conflict to resolve.

### Logo review

Reviewed `finoptic-logo/finoptic-logo.png` and `.svg`.

**What's working:**
- The wordmark split — "Fin" in black, "optic" in accent blue — is a clean, legible, proven pattern (the sibling `llm-tracker` project's own "trak"/"it" wordmark uses the same device: split-color a compound name at the seam to make both halves and the brand register at once).
- Simple, flat, scales well — no fine detail that will break at favicon size.

**What I'd reconsider before calling this final:**
- **The accent blue (`#3B82F6`) is Tailwind's literal default `blue-500`.** It's probably the single most common "SaaS blue" in current software — the default you get before making any color decision at all in a huge fraction of Tailwind/shadcn-based products. Given design language (avoiding a generic, templated look) was your #1 complaint about the *old* look, locking the new brand's only accent color to the most default blue available would undercut that goal from day one. This is exactly the kind of decision Phase 2 exists to make deliberately.
- **The icon mark** (four blue blade shapes radiating from a center point) reads as an aperture/pinwheel — a reasonable nod to "optic," but that specific four-blade radiating shape is a common stock-icon motif (camera aperture / shutter icons look very similar in most icon libraries). Worth a distinctiveness pass so it reads as *this* brand's mark rather than a generic "vision/focus" icon grabbed off a shelf.

**Recommendation:** proceed with **Finoptic** as the name, conditional on the trademark/domain check above. Treat this logo as a strong first draft — the wordmark structure is worth keeping, but hand the color and the icon mark to Phase 2 (design language) for a deliberate pass rather than locking them today. The rename itself is **done** — every visible string, the PRD (`finoptic-prd.md`), the mock-up and the planning docs read "Finoptic". Only the trademark/domain clearance is still outstanding.

