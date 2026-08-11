# Scenario dataset schema

Each file in this folder is one **scenario** — a complete, self-consistent picture of a company's
technology spend. The mock-up loads one at a time; the selector in the top bar switches between them.

## Why these are `.js` and not `.json`

The mock-up has to open by double-click from a `file://` path. Browsers block `fetch()` and `XHR`
against local files from that origin, so a genuine `.json` file **cannot** be read by the page.
Each file is therefore a one-line wrapper around a pure-JSON payload:

```js
FINOPTIC.scenario({ …JSON… });
```

Everything inside the braces is valid JSON — no functions, no comments, no trailing commas, no
`undefined`. Lift it out and it parses. The **Export → dataset (JSON)** button writes exactly that
payload, and the **Load JSON…** picker reads it back through `FileReader`, so real `.json` round-trips.

## Invariants — these must hold or the mock-up's reconciliation guard logs an error

1. `sum(trend.actual, ignoring null)` == `ytdActual`
2. `sum(categories[].v)` == `ytdActual`
3. For every category: `sum(c.m)` == `c.v`, and `c.m.length` == 12 (index 11 is `null` — July is forecast)
4. `sum(categories[].m[i])` == `trend.actual[i]` for every month `i`
5. `sum(products[].v)` == `ytdActual`; `sum(p.m)` == `p.v`; `p.cloud + p.ai + p.saas + p.other` == `p.v`
6. `sum(cloud.providers[].v)` == `cloud.total` == the `Cloud infrastructure` category's `v`
7. `sum(cloud.providers[].m[i])` == the cloud category's `m[i]`
8. `sum(cloud.services[].v)` == `sum(cloud.envs[].v)` == `cloud.total`
9. `sum(ai.providers[].v)` == `ai.total` == the `AI & LLM` category's `v`; `ai.sub + ai.api` == `ai.total`
10. `sum(opps[].s)` == `identified`
11. `sum(savingsByCat[].v)` == `identified`
12. `sum(depts[].v)` == `ytdActual`
13. `sum(tagging[].v)` == `unallocated`
14. `variance[]` walks from `ytdBudget` to `ytdActual`: first entry `type:"base"` with `v == ytdBudget`,
    last `type:"total"` with `v == ytdActual`, and the signed middle steps sum to the difference.
15. For every product: `sec + shared` == `other`, and `bu` is one of the `depts` keys
16. `sum(secMeta.sources[].gb)` == `secMeta.ingestGB`, and every `prod` is a `products` key
17. `sources` has 12 entries, each a 4-tuple `[system, feeds, cadence, status]`
18. `resources.rows` has 5 entries and `resources.path` ends at the unit those rows describe
19. Every series in `monthly` has 12 slots, and **a flow sums to its total while a stock ends at it** —
    see "The `monthly` block" below for which is which and why the two cannot share one rule.

Invariants 1–16 and 19 are **arithmetic** and hold for every dataset including the empty one — `0 − 0 = 0`
reconciles. Invariants 17–18 and every row count in the Shape section below (eight categories, ten
vendors, sixteen applications, six log sources, nine departments) are **conventions of a mature
workspace**, not arithmetic: they describe how much a fully-connected customer has, and a workspace
that has less of it has fewer rows. See "Row counts are a convention" below.

## Workspace age: `fresh` and `zero`

Four of the six datasets describe a *mature* workspace — eleven closed months, every feed in, a full
vendor register. Two describe one that is not, and the difference between those two is the point:

| | `scenario-fresh.js` | `scenario-zero.js` |
|---|---|---|
| Story | Marlowe Bioworks. Real, and young: the feeds went live ten weeks ago. | Ashcombe Retail. Day one: the workspace exists and nothing is connected. |
| `meta.closed` | `2` — Aug and Sep have closed | `0` — nothing has closed |
| Totals | Small but real (`ytdActual` 63, i.e. $63K) | Every total is `0` |
| Budget | Loaded. `ytdBudget` 66, `variance` walks 66 → 63 | Not loaded. `ytdBudget` 0, `variance` walks 0 → 0 |
| `trend.actual` | Two numbers, then ten `null` | Twelve `null` |
| `trend.budget` | Twelve numbers | Twelve `null` — a plan that does not exist is not a plan of zero |
| `anomalies` | `[]` — there is no baseline to deviate from yet | `[]` — nothing is being watched |
| Most arrays | Short: 3 products, 2 cloud providers, 6 vendors, 6 applications, 3 opportunities | Empty |
| `sources` | 12, seven `Healthy` and five not yet in | 12, all `Not connected` |
| What it proves | Every screen still *works* on eight weeks of data | The empty-state family, on a screen that has nothing |

The two are not degrees of the same thing. **Fresh is a rendering test** — small numbers, a mostly
empty year, charts that must still draw. **Zero is an empty-state test** — the arrays are empty so
that `table()`, `donut()`, `hbars()` and `lineChart()` fall through to `STATES.empty()` rather than
drawing a row of noughts. A zero-VALUED row is worse than an absent one: a chart of eight bars all
at `$0K` reads as a measurement, and the whole point of the state family is that nothing must not
look like zero.

### Row counts are a convention, and these two datasets are where that shows

`fresh` and `zero` deliberately break the counts under Shape. Nothing in `core.js` enforces them:

* `categories` — 8 in fresh, **0** in zero. `g` is still `--c1`…`--cN` in list order.
* `products` — 3 in fresh (Alpha, Beta, Shared services), 0 in zero. The last one is still
  `Shared services` with `rev: 0` where any exist.
* `vendors` / `saas` / `depts` / `opps` / `savingsByCat` / `cloud.services` / `cloud.envs` /
  `secMeta.sources` / `resources.rows` — short in fresh, empty in zero.
* `savingsByCat` carries **only the categories the `opps` actually use** (three in fresh), because a
  savings category at `v: 0` renders as a zero-width bar rather than as an absence.
* `sources` stays at 12 in **both**, because those rows are the catalogue of what Finoptic can read
  rather than evidence that anything is landing — and `shell.js` prints "12 sources" in the as-of
  line when the array is empty anyway, so emptying it would make that line lie.

### Fields that cannot be emptied

These are not values, they are the shape a renderer indexes into, so they are present-and-zero in
`zero` rather than absent:

* `ai.tokens.{requests,perReq,per1M,avgPerReq,…}` and `itsm.{tickets,perTicket,perIncident,perChange}`
  — the ITFM unit-economics table calls `.toFixed()` / `.toLocaleString()` on these *before* it drops
  the row for having no denominator.
* `obsMeta.{logGB,perGB}`, `secMeta.{ingestGB,perGB,licUtil,ingestDelta}` — rendered directly.
  `obsMeta.metricSeries` / `traceSpans` are strings and hold an em dash, never `"0"`.
* `variance` — kept as the two zero anchors (`base` 0, `total` 0) rather than emptied, because
  `waterfall()` takes `Math.max` of the steps and an empty list gives `-Infinity`, which reaches the
  axis labels as text. `0 − 0 = 0` is a real equation and satisfies invariant 14.
* `resource` may be `null` (both of these set it), and `resources` may carry an empty `rows`.

### `meta.closed: 0`

`closed` is the number of months of actuals, so an empty workspace reports `0` and `trend.actual` is
all `null`. Three call sites in the mock-up assume it is at least 1 — `charts.js` `bandChart()`
(`new Array(closed-1)`), `charts.js` `stackedBars()` (labels come from
`meta.months.slice(0, meta.closed)`, and `Math.max()` of no columns is `-Infinity`), and the custom
range calendar (`meta.months[closedCount()-1]`). Guarding those is a change to those files, not to
the datasets: `closed: 0` is the true value and inventing a closed month to route around it would
put a measurement where there is none.

### Fiscal year and `meta.asOf`

`core.js` `fyMonthStart()` derives the fiscal year from `asOf.getFullYear()`, which is only right
when `asOf` falls in the same calendar year as the LAST month in `meta.months`. Both of these
datasets are early in their fiscal year — `09 Oct 2026` and `03 Aug 2026` against an Aug→Jul FY27 —
so the custom-range calendar offers their month window one year early. Everything else, including
`daysOut()` and the renewal windows, reads `asOf` directly and is correct.

## The `monthly` block

Twelve-month series for the figures that had none. They exist so a KPI tile can show **how a number
got where it is** beside the number itself (Brand Guide §7) — before this, the only monthly series in
the schema were `trend`, `categories[].m`, `cloud.providers[].m`, `ai.m`, `products[].m` and
`itsm.volume`, which between them covered about a third of the tiles on the board.

Same conventions as every other series here: **12 slots, index 11 is `null`** because July is
forecast, and a month that has not closed is `null` rather than `0`.

### A flow sums to its total; a stock ends at it

This is the one thing to get right, and it is why invariant 19 cannot be a single rule. Some of these
series are **flows** — a quantity that happens *during* a month, where the year to date is the sum of
the months. Others are **stocks** — a level measured *at* a month end, where the year-to-date figure
is simply the latest reading and summing them would produce a number that means nothing.

Getting this backwards does not throw; it silently prints a figure that is eleven times too large.

| Series | Kind | Reconciles as | Trends the tile |
|---|---|---|---|
| `realized` | flow | `sum(m)` == `realized` | Realised Savings |
| `revenue` | flow | `sum(m)` == `meta.revenue` | Technology As % Of Revenue |
| `anomalyImpact` | flow | `sum(m)` == `meta.unexpected` | Unexpected Spend |
| `security` | flow | `sum(m)` == the `Security` category's `v` | Total Security Spend, Security Cost Per Employee, Security Cost Per Product |
| `ingestGB` | flow | `sum(m)` == `secMeta.ingestGB` | Data Volume, Cost Per GB Ingested |
| `forecastAcc` | stock | last non-null == `meta.forecastAcc` | Forecast Accuracy |
| `committed` | stock | last non-null == `meta.committed` | Committed Spend |
| `licences` | stock | last non-null == `sum(saas[].lic)` | Licences Purchased |
| `licencesActive` | stock | last non-null == `sum(saas[].active)` | Active Licences |
| `contractValue` | stock | last non-null == `sum(vendors[].contract)` | Contract Value Under Management |
| `aiSavings` | stock | last non-null == the AI screen's savings figure | Potential AI Savings |

`forecastAcc` is a **percentage**, the only non-currency series in the block. It also retires a
hardcoded string: the ITFM screen printed `94.2%` with nothing behind it, so the figure did not move
when you switched scenario. It is `meta.forecastAcc` now and it re-narrates like everything else.

### Three new `meta` fields

`revenue`, `unexpected`, `forecastAcc` and `committed` — the totals these series reconcile against.
`committed` is the fourth because it was not a field at all: the Finance screen computed it as
`Math.round(D.ytdActual * 0.694)`, a magic constant that made "Committed Spend" a fixed 69.4% of
whatever the estate happened to spend, in every scenario. It is authored per dataset now.

`meta.revenue` must equal `sum(products[].rev)`, which is where the Product screen already gets it;
`meta.unexpected` must equal `sum(anomalies[].act − anomalies[].exp)`, so an empty anomaly list means
`0` rather than an absent field.

### What deliberately has NO series

A tile whose figure is a **structural count** does not get one, and this is a rule rather than an
omission: `Environments` (5), `Providers In Scope` (3), `Applications`, `Vendors`, `Active Contracts`,
`Renewals In 90 Days`. There is no honest twelve-month history of how many environments existed —
the dataset records what the estate *is*, not a census of it each month, and authoring one would be
inventing the one kind of number this schema exists to prevent. Those tiles render without a
sparkline, which the inline placement makes free: the slot beside the figure is simply empty.

### `fresh` and `zero`

The same rule the rest of the schema follows. In `fresh`, two closed months then ten `null`. In
`zero`, **twelve `null`** — never twelve zeroes. A flat line along the axis is a measurement saying
the company earned no revenue and banked no savings; `null` says nobody has looked yet, which is the
truth, and `kpi()` drops the sparkline entirely rather than drawing an empty frame.

## Shape

```jsonc
{
  "id": "baseline",                    // filename-safe, unique
  "label": "Baseline — over budget",   // shown in the scenario selector
  "blurb": "One sentence a presenter can read aloud.",
  "tone": "warn",                      // ok | warn | crit — tints the selector dot

  "meta": {
    "asOf": "28 Jul 2026",
    "fy": "FY26",
    "months": ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"],
    "closed": 11,                      // months of actuals; the rest are forecast
    "employees": 50, "customers": 148, "vendors": 34,
    // Denominators for the unit-economics table. Both in MILLIONS.
    "transactions": 42.6, "apiRequests": 214,
    // Totals the `monthly` block reconciles against. revenue == sum(products[].rev);
    // unexpected == sum(anomalies[].act - anomalies[].exp); forecastAcc is a percentage.
    "revenue": 8400, "unexpected": 42, "forecastAcc": 94.2,
    "committed": 1180,
    "company": "Northwind Systems"     // the fictional client this scenario describes
  },

  "ytdActual": 1620, "ytdBudget": 1500, "fyBudget": 1640, "fyForecast": 1780,
  "identified": 214, "realized": 96, "unallocated": 87,

  "trend": {
    "actual":   [128,134,141,147,139,152,146,158,151,162,162,null],
    "budget":   [128,130,132,134,136,138,140,142,142,138,140,140],
    "forecast": [null,null,null,null,null,null,null,null,null,null,162,160]
  },

  // Twelve-month series behind the KPI tiles. See "The `monthly` block" above —
  // the first five are FLOWS and sum to their total, the rest are STOCKS and end at it.
  "monthly": {
    "realized":      [4,6,7,8,7,9,9,10,11,12,13,null],
    "revenue":       [640,672,690,705,688,720,712,745,730,760,338,null],
    "anomalyImpact": [2,3,4,3,5,4,3,5,4,5,4,null],
    "security":      [12,13,13,14,13,15,14,16,15,16,17,null],
    "ingestGB":      [138,145,152,158,149,163,157,171,164,176,167,null],
    "forecastAcc":   [88.1,89.4,90.2,90.8,91.5,92.0,92.4,93.1,93.5,93.9,94.2,null],
    "committed":     [980,1010,1044,1068,1090,1112,1130,1148,1160,1172,1180,null],
    "licences":      [1180,1204,1228,1246,1262,1280,1298,1310,1324,1338,1350,null],
    "licencesActive":[1010,1028,1044,1058,1066,1082,1094,1102,1112,1120,1128,null],
    "contractValue": [1620,1668,1712,1748,1780,1812,1840,1866,1888,1906,1920,null],
    "aiSavings":     [8,10,12,14,16,19,22,26,30,34,38,null]
  },

  // 8 categories exactly, in descending v. g is the chart slot.
  "categories": [
    { "k":"Cloud infrastructure","v":645,"g":"--c1",
      "m":[51,53,56,58,55,60,58,63,60,65,66,null] }
  ],

  "cloud": {
    "total": 645,
    "providers": [ { "k":"AWS","v":297,"m":[24,25,26,27,25,28,26,29,27,30,30,null] } ],
    "services":  [ { "k":"Compute","v":214 } ],   // 8 entries
    "envs":      [ { "k":"Production","v":402 } ], // 5 entries
    "coverage": 58, "coverageTarget": 85
  },

  "ai": {
    "total":218, "sub":134, "api":84,
    "m":[13,14,15,17,16,19,18,21,20,32,33,null],
    "providers":[ { "k":"OpenAI","v":64,"sub":38,"api":26 } ],
    "tokens":{ "input":1420,"output":214,"cached":486,"requests":6.2,
               "avgPerReq":264,"per1M":51.4,"perReq":0.0135 },
    "byProduct":[ { "k":"Product Alpha","v":61 } ],
    "models":[ { "m":"GPT-5","p":"OpenAI","req":"0.71M","tok":"270M",
                 "cost":26,"avg":0.0366,"use":"Alpha reasoning agent" } ]
  },

  "security":[{ "k":"Microsoft Sentinel","v":78 }],
  // sources: 6 log sources feeding the SIEM. sum(gb) == ingestGB. prod must be a
  // `products` key. delta is the % change this month. One row should carry the
  // story (a misconfiguration), the rest are "Required" or normal growth.
  "secMeta":{ "ingestGB":1840,"perGB":42.4,"licUtil":88,"ingestDelta":38,
              "sources":[ { "src":"Application containers","prod":"Product Beta",
                            "gb":612,"cost":3.1,"delta":38,
                            "verdict":"Debug logging left on","flag":true } ] },
  "obs":[{ "k":"Logs","v":44 }],
  "obsMeta":{ "logGB":2410,"metricSeries":"4.8M","traceSpans":"1.2B","perGB":18.3 },
  "obsByProduct":[{ "k":"Product Alpha","v":26,"share":26,"traffic":38 }],
  "itsm":{ "total":57,"tickets":3180,"incidents":412,"changes":286,
           "perTicket":17.9,"perIncident":64,"perChange":41,
           "volume":[268,272,281,296,254,312,289,318,301,294,295,null],
           "byProduct":[{ "k":"Product Alpha","t":1104,"inc":34,"cost":8.4 }] },

  // 5 entries: Alpha, Beta, Gamma, Delta, Shared services (rev 0 for Shared).
  // bu = the business unit charged for it, used by the showback/chargeback table;
  // it must be one of the `depts` keys.
  // sec + shared split `other` for that same table: sec + shared == other.
  "products":[ { "k":"Product Alpha","v":468,"rev":3100,"cloud":241,"ai":61,
                 "saas":88,"other":78,"sec":42,"shared":36,
                 "bu":"Engineering","cust":74,"budget":430,
                 "m":[34,36,39,42,38,44,42,46,44,50,53,null] } ],

  "depts":[{ "k":"Engineering","v":812,"budget":760 }],   // 9, last is Unallocated

  // 10 vendors. brand keys the inline SVG mark; use one of the keys listed at
  // the bottom of this file, or omit for a lettermark fallback.
  "vendors":[ { "k":"Microsoft","brand":"microsoft","cat":"Cloud · Productivity · Security",
                "v":575,"contract":640,"start":"01 Sep 2024","renew":"28 Sep 2026",
                "util":84,"owner":"R. Kadavan","risk":"Medium" } ],

  "saas":[ { "app":"Microsoft 365 E5","vendor":"Microsoft","brand":"microsoft",
             "cat":"Productivity","lic":52,"active":40,"cost":11.4,
             "renew":"28 Sep 2026","owner":"R. Kadavan" } ],   // 16 rows

  // st is one of: Identified | Under review | Approved | In progress | Implemented
  "opps":[ { "o":"Terminate 3 idle EC2 instances — Alpha production","cat":"Cloud",
             "s":34,"eff":"Low","conf":"High","owner":"S. Menon",
             "st":"Approved","due":"12 Aug 2026" } ],

  "anomalies":[ { "d":"24 Jun 2026","prov":"AWS","prod":"Product Alpha","svc":"EC2 — compute",
                  "exp":22.1,"act":31.4,"sev":"Critical","owner":"S. Menon",
                  "st":"Investigating","why":"Two or three sentences of plain English." } ],

  "alerts":[ { "sev":"Critical","t":"…","impact":4.6,"save":34,
               "prod":"Product Alpha","owner":"S. Menon","act":"…" } ],

  "variance":[ { "k":"YTD budget","v":1500,"type":"base" },
               { "k":"Cloud growth","v":64,"type":"up" },
               { "k":"SaaS optimisation","v":-34,"type":"down" },
               { "k":"YTD actual","v":1620,"type":"total" } ],

  "scenarios":[ { "k":"Baseline","v":1780,"d":"Current run-rate, committed renewals only" } ],
  "drivers":[ { "k":"AI usage","v":22 } ],
  "tagging":[ { "k":"Product tag missing","res":62,"v":41 } ],   // 4 entries
  "savingsByCat":[ { "k":"Cloud","v":78 } ],                     // 6 entries
  // 12 four-tuples: [system, what it feeds, cadence, status].
  // status is free text; "Healthy" renders green, anything containing
  // "degraded" renders amber, anything else neutral.
  "sources":[ ["AWS Cost & Usage Report","Cloud","Daily","Healthy"] ],

  // The compute drill on the ITFM screen — 5 instance families under the
  // largest cloud provider. cur/prev are monthly $K. `verdict` is the
  // recommendation; set `flag` on the one row that carries the story.
  "resources":{
    "path":["Total technology","Cloud","AWS","Product Alpha","Production","Compute","EC2"],
    "unit":"EC2 instance family",
    "rows":[ { "family":"r6i.4xlarge","count":3,"cpu":11,"prev":2.1,"cur":3.9,
               "verdict":"Terminate — idle since 18 Jun","flag":true } ]
  },

  "resource":{ "name":"alpha-prod-api-07","id":"i-0a94c3f2e81bd7c40","owner":"S. Menon",
               "product":"Product Alpha","env":"Production","cc":"ENG-1140",
               "cur":1.3,"prev":0.7,"util":11,
               "rec":"Terminate — replaced by autoscaling group on 18 Jun",
               "save":0.94,"groupSave":34 },

  // Per-screen headline copy. Every scenario must supply all three tones for
  // each screen it wants narrated; a screen with no entry falls back to generic.
  "insights":{
    "overview":{
      "what":"Technology spend is <b>$1.62M</b> year to date against a <b>$1.50M</b> phased budget.",
      "why":"Six drivers add <b>$182K</b> of upward pressure…",
      "do":"Approve the four <b>Approved</b> backlog items…",
      "doValue":"$64K", "doLabel":"approve now"
    }
  }
}
```

`insights` keys, one per screen: `overview itfm cloud ai saas finance proc product optimize
allocation forecast anomalies security obs itsm alerts sources`.

Inline `<b>` is allowed in `blurb`, `insights.*` and `anomalies[].why`. No other HTML anywhere.

## Brand mark keys available

`microsoft aws googlecloud grafana openai anthropic atlassian github figma perplexity miro lucid
onepassword zoom google azure` — anything else falls back to a lettermark tile.
