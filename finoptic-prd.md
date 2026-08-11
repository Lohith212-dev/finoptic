# Finoptic — Product Requirements Document

*A plain-English plan for a tool that shows a company where its technology money goes — and what to do about it.*

**Status:** Draft · **Based on:** a clickable mock-up, no working product yet · **Prepared:** 29 July 2026 · **Audience:** anyone, no background needed

> **In one sentence:** Finoptic is a dashboard that pulls together everything a company spends on technology — cloud hosting, AI tools, software subscriptions, security tools, and more — into one place, with one set of numbers everyone can trust, so people can spot overspending, find savings, and plan ahead without waiting for a spreadsheet from someone else.

## Contents

- [00 — The problem](#00--the-problem)
- [01 — What Finoptic is](#01--what-finoptic-is)
- [02 — Who it's for](#02--who-its-for)
- [03 — A day in the life](#03--a-day-in-the-life)
- [04 — What the mock-up shows](#04--what-the-mock-up-shows)
- [05 — What it keeps track of](#05--what-it-keeps-track-of)
- [06 — Built vs. still needed](#06--built-vs-still-needed)
- [07 — Open questions](#07--open-questions)
- [08 — What success looks like](#08--what-success-looks-like)

---

## 00 — The problem

*Why a company would need this at all*

Every company that uses cloud computing, AI tools, and business software ends up with technology bills scattered across a dozen different places: cloud provider invoices, AI vendor statements, software subscription renewals, security tool contracts, and more. Each of these lives in a different system, often owned by a different team.

Because of that, simple questions become hard to answer quickly:

- Are we on budget this month, or heading for an overrun?
- Which team or product is actually driving the cloud bill up?
- Are we paying for software licenses nobody is using?
- Is a contract about to renew that we should renegotiate first?
- Did something just cost a lot more than usual — and why?

Today, answering these means chasing down several people and reconciling numbers that don't always match, because each team is looking at a different export at a different point in time.

## 01 — What Finoptic is

*The core idea in plain terms*

Finoptic is a single dashboard that becomes the one place everyone looks at technology spending. The most important design rule behind it is simple: **wherever you look, the numbers should always add up the same way.** If the summary page says the company spent a certain amount this year, every other page — the cloud page, the finance page, the product-cost page — has to agree with that number. Nothing is allowed to quietly drift out of sync.

On top of that shared set of numbers, Finoptic shows different people different views depending on what they care about — without anyone needing to build their own spreadsheet to get there.

## 02 — Who it's for

*Four kinds of people, one shared dashboard*

| Role | Who they are | What they need |
|---|---|---|
| **The person who owns technology costs** | Responsible for the overall technology budget across cloud, AI, and software. | The complete cost breakdown by service and by team. Lands on a home screen built around cloud, AI, and savings. |
| **Finance / accounting** | Cares whether spend matches the approved budget and how it should be recorded in the company's books. | Budget-vs-actual, forecasts, and department cost splits. Lands on a home screen built around budgets and variance. |
| **Procurement / vendor management** | Manages vendor contracts and wants to know what's renewing, and whether the company is over- or under-buying. | Contract renewal dates and how much of each purchase is actually used. Lands on a home screen built around vendors and renewals. |
| **A business or product leader** | Runs a specific product or business line and wants to know what technology costs relative to what that product earns. | Cost per product, compared against that product's revenue and customers. Lands on a home screen built around their own product's numbers. |

In the mock-up, switching between these four roles is a single dropdown ("Viewing as…") that changes the home screen and highlights the pages most relevant to that role — everyone still has access to every page, just a different starting point.

## 03 — A day in the life

*How someone would actually use it*

1. **Sign in and choose a view.** The person picks which of the four roles best matches what they need today.
2. **Land on a tailored home screen.** Instead of a generic front page, they start on the summary most relevant to their role.
3. **Check the always-visible summary strip.** No matter which page they're on, a thin strip at the top always shows: spend so far this year, budget so far this year, the gap between them, the year-end forecast, savings found, savings actually delivered, and any spend that hasn't been assigned to a team yet.
4. **Narrow things down.** A row of filters lets them focus on a date range, a cloud provider, a department, a product, an app, an environment, a cost center, a vendor, or a spending category.
5. **Drill into a category.** From a broad number, they can step down into specifics — for example, from "total cloud spend" down to one cloud provider, down to one product, down to one specific server that's costing more than it should.
6. **Investigate anything unusual.** If spending spiked somewhere, Finoptic flags it and explains why in plain language (for example: "cost rose because three extra servers were added"), rather than just showing a number that jumped.
7. **Review ways to save money.** A running list of savings opportunities shows the potential dollar amount, how much effort each would take, who owns it, and its current status — from newly identified through to done.
8. **Stay ahead of renewals.** Upcoming contract renewals are surfaced ahead of time, along with a suggested negotiating position based on how much of the contract is actually being used.
9. **Share what they found.** They export the page or share a link to the exact view they were looking at, so a colleague sees precisely the same thing.

## 04 — What the mock-up shows

*Every screen, grouped by what it's for*

### Summary pages — one per role

| Page | What it answers |
|---|---|
| Company-wide summary *(executive overview)* | Are we on budget overall, and what are the biggest things to know right now? |
| Cost owner's view *(IT financial management)* | What is the full technology cost picture, broken down and explained? |
| Finance's view | Does spend match the budget we approved, department by department? |
| Procurement's view | What are we buying, from whom, and is it a good deal? |
| Product-by-product costs | What does each product cost to run, compared to what it earns? |

### Where the money goes — spend by category

| Page | What it answers |
|---|---|
| Cloud services | How much are we spending with providers like AWS, Azure, or Google Cloud, and on what — servers, storage, databases? |
| AI tools | How much are we spending on AI providers (for example OpenAI or Anthropic), and roughly what does each AI request cost us? |
| Software subscriptions *(SaaS & licences)* | Which apps are we paying for, and are we paying for more seats than people are using? |
| Security tools | What are we spending on security and identity-protection software? |
| Monitoring tools *(observability)* | What are we spending to keep an eye on system health and performance? |
| IT help-desk costs *(ITSM)* | What does it cost us, per support ticket or per incident, to keep things running? |

### Staying in control — planning and action

| Page | What it answers |
|---|---|
| Budgets & predictions | Given how things are trending, where will we land by year-end, under a few different scenarios? |
| Who owns what spend *(cost allocation)* | Whose budget should this cost sit under, and how much spend is still unassigned? |
| Ideas to save money *(optimisation hub)* | What are all the ways we could cut cost, who's responsible for each, and how far along are they? |
| Unusual spending alerts *(anomalies)* | What looks abnormal this week, and in plain language, why did it happen? |
| All alerts in one place | Across every category, what needs someone's attention or a decision right now? |

### Behind the scenes — reference only

| Page | What it answers |
|---|---|
| Where the numbers come from *(data model / sources)* | Which systems feed Finoptic its numbers, and how fresh is that data? |

## 05 — What it keeps track of

*The information behind every page*

None of the pages above mean anything without underlying data. Here's the information Finoptic needs to hold, described plainly:

- **Spend records** — Every dollar spent, when it was spent, on what, and which team or product it belongs to.
- **Budgets** — How much each category and department is allowed to spend, by month and for the full year.
- **Vendors and contracts** — Who the company buys technology from, how much each contract is worth, when it renews, and how much of what was purchased is actually being used.
- **Software subscriptions** — Which applications are in use, how many licenses were bought versus how many people actually log in.
- **Savings ideas** — A running list of cost-cutting opportunities, each with an estimated dollar value, an owner, and a status.
- **Alerts and unusual activity** — Anything flagged as out of the ordinary, with a plain-language reason and how serious it is.
- **Teams, products, and cost centers** — The org structure needed to divide shared spend up sensibly, and to know who to ask about it.
- **Connected systems** — The list of outside systems Finoptic needs to pull real numbers from — for example, cloud providers, AI providers, the accounting system, the ticketing system, and the HR system — plus how often each one syncs.

## 06 — Built vs. still needed

*Being honest about where things stand today*

What exists right now is a clickable mock-up: every screen described above is designed and can be clicked through, but it runs on made-up example numbers, not real company data. Nothing is connected to a real system yet. Turning it into a real product means building the parts underneath.

**Already designed**

- Every page listed above, laid out and looking finished
- The four role-based views and their tailored home screens
- The always-visible summary strip that ties every page together
- The filter bar, drill-down path, and alert/savings-list layouts

**Still needs building**

- Real sign-in, and rules for who is allowed to see what
- Actual connections to cloud, AI, accounting, and other source systems
- Filters that genuinely narrow down the numbers shown
- A working export and a working "share this view" link
- A real way to deliver alerts (email, chat, or similar) and to track savings-idea status changes over time

## 07 — Open questions

*Decisions that need an answer before, or during, building*

- **Data first:** which of the connected systems should be wired up first — cloud bills, AI vendor bills, or the accounting system?
- **Sign-in:** should people log in with the company's existing account system, or something separate?
- **Who sees what:** should a product leader be able to see costs for other products, or only their own? Should everyone see AI vendor pricing, or is that sensitive?
- **Alerts:** where should alerts actually show up — email, a chat tool, both, or only inside Finoptic itself?
- **Freshness:** how often does the data need to refresh — daily, hourly, closer to real time?
- **Sharing:** when someone exports a page, what format do they need — a PDF, a spreadsheet, or both?
- **Ownership of the numbers:** if a department disagrees with how a shared cost was split, who has the final say?

## 08 — What success looks like

*How we'll know Finoptic is working*

- Anyone can answer "are we on budget?" by looking at one screen, without asking finance.
- Overspending gets noticed within days of happening, not discovered weeks later when the quarter closes.
- No contract renewal catches procurement by surprise.
- The savings-ideas list turns into savings that actually happen, not just a list that grows.
- IT, finance, procurement, and product leaders all look at the same numbers — and agree they're correct.

---

*Basis for this document — a clickable mock-up (one self-contained HTML file, no backend, no real data connections) that lays out the intended screens, roles, and data for Finoptic. This PRD describes the product that mock-up implies, translated out of technical language, plus the gaps that remain before it could be a real, working tool.*
