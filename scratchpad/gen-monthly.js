/* Round 14 — generate the `monthly` block for every scenario.
   Written as a generator rather than hand-authored because 11 series x 6 datasets is 66
   arrays that must each reconcile exactly (SCHEMA.md invariant 19), and a hand-typed
   array that is $3K light fails silently: the tile prints a figure nobody cross-checks.
   Here every series is BUILT from the total it has to hit, so it cannot disagree.

   Run:  node scratchpad/gen-monthly.js --check   (verify round-trip, write nothing)
         node scratchpad/gen-monthly.js           (write the datasets) */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'finoptic', 'data');
const FILES = ['scenario-baseline.js', 'scenario-ai-crisis.js', 'scenario-optimised.js',
               'scenario-scaleup.js', 'scenario-fresh.js', 'scenario-zero.js'];

const WRAP_HEAD = 'FINOPTIC.scenario(\n';
const WRAP_TAIL = '\n);\n';

function load(file){
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const open = raw.indexOf('{');
  const close = raw.lastIndexOf('}');
  return { raw, json: raw.slice(open, close + 1) };
}

const ser = payload => WRAP_HEAD + JSON.stringify(payload, null, 2) + WRAP_TAIL;

const sum = a => a.reduce((x, y) => x + (y || 0), 0);

/* ---- series builders ------------------------------------------------------
   A FLOW is spread across the closed months and sums to its total exactly; a STOCK
   ramps up to its total and ENDS on it. Getting these two backwards is the failure
   SCHEMA.md warns about, so they are separate functions rather than one with a flag. */

/* Deterministic wobble, so eleven series do not all trace the same curve. No
   Math.random() anywhere: a dataset that reshuffles itself on every regeneration
   cannot be diffed, and these files are checked in. */
function wobble(seed, i){
  const n = Math.sin((seed * 37.7) + (i * 12.9898)) * 43758.5453;
  return (n - Math.floor(n)) - 0.5;            /* -0.5 .. +0.5 */
}
const seedOf = name => name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

/* FLOW: shaped after the estate's own actual-spend curve where there is one, so a
   revenue or savings line moves with the year rather than against it, then corrected
   so the integers sum to the target exactly. */
function flow(total, closed, shape, seed){
  const out = new Array(12).fill(null);
  if(!closed || !total) return closed ? out.fill(0, 0, closed) : out;
  const base = [];
  for(let i = 0; i < closed; i++){
    const s = (shape && shape[i] != null) ? shape[i] : 1;
    base.push(Math.max(0.0001, s * (1 + wobble(seed, i) * 0.12)));
  }
  const norm = sum(base);
  const vals = base.map(v => Math.max(0, Math.round(total * v / norm)));
  /* The rounding remainder lands on the last closed month rather than being smeared,
     so `sum(m) == total` is exact and one month carries the odd dollar. */
  vals[closed - 1] += total - sum(vals);
  for(let i = 0; i < closed; i++) out[i] = vals[i];
  return out;
}

/* STOCK: a level that ramps to `total` and ends exactly on it. `from` is where the
   year opened, as a fraction of where it closed. */
function stock(total, closed, from, seed, decimals){
  const out = new Array(12).fill(null);
  if(!closed) return out;
  if(!total){ for(let i = 0; i < closed; i++) out[i] = 0; return out; }
  const round = v => decimals ? Math.round(v * 10) / 10 : Math.round(v);
  for(let i = 0; i < closed; i++){
    const t = closed === 1 ? 1 : i / (closed - 1);
    const v = total * (from + (1 - from) * t) * (1 + wobble(seed, i) * 0.02);
    out[i] = round(v);
  }
  out[closed - 1] = round(total);              /* ends ON the figure, never near it */
  return out;
}

/* ---- the eleven series, each tied to a figure the dataset already carries ---- */
function build(p){
  const closed = p.meta.closed || 0;
  const actual = p.trend && p.trend.actual ? p.trend.actual : [];
  const cat = re => (p.categories || []).find(c => re.test(c.k));
  const secCat = cat(/^Security/);

  const revenue    = sum((p.products || []).map(x => x.rev || 0));
  const unexpected = Math.round(sum((p.anomalies || []).map(a => (a.act || 0) - (a.exp || 0))));
  const licences   = sum((p.saas || []).map(s => s.lic || 0));
  const active     = sum((p.saas || []).map(s => s.active || 0));
  const contracts  = sum((p.vendors || []).map(v => v.contract || 0));
  const aiSavings  = sum((p.savingsByCat || []).filter(s => /AI|Licence/i.test(s.k)).map(s => s.v || 0));
  const secTotal   = secCat ? secCat.v : 0;
  const ingest     = (p.secMeta && p.secMeta.ingestGB) || 0;

  /* Committed spend was `Math.round(D.ytdActual * 0.694)` in screens.js — a magic
     constant, so every scenario reported the same 69.4% commitment ratio however
     differently it bought. Authored per dataset now, seeded from that old ratio for
     baseline and moved where the scenario's story says it should be. */
  const committedRatio = { baseline: .694, 'ai-crisis': .61, optimised: .78, scaleup: .58,
                           fresh: .42, zero: 0 }[p.id];
  const committed = Math.round((p.ytdActual || 0) * (committedRatio == null ? .694 : committedRatio));

  /* Forecast accuracy: the ITFM screen hardcoded 94.2% in every scenario. Each one now
     says something true about itself — a workspace in crisis forecasts worse, an
     optimised one better, and a ten-week-old workspace has barely enough history to
     forecast at all. `null` where there is nothing to be accurate about. */
  const accTarget = { baseline: 94.2, 'ai-crisis': 86.4, optimised: 96.1, scaleup: 89.7,
                      fresh: 71.3, zero: 0 }[p.id];

  const S = (name, fn) => fn(seedOf(name));

  return {
    meta: { revenue, unexpected, forecastAcc: accTarget || 0, committed },
    monthly: {
      realized:       S('realized',       s => flow(p.realized || 0, closed, actual, s)),
      revenue:        S('revenue',        s => flow(revenue,         closed, actual, s)),
      anomalyImpact:  S('anomalyImpact',  s => flow(unexpected,      closed, actual, s)),
      security:       S('security',       s => flow(secTotal,        closed, actual, s)),
      ingestGB:       S('ingestGB',       s => flow(ingest,          closed, actual, s)),
      forecastAcc:    S('forecastAcc',    s => stock(accTarget || 0, closed, .90, s, true)),
      committed:      S('committed',      s => stock(committed,      closed, .83, s)),
      licences:       S('licences',       s => stock(licences,       closed, .87, s)),
      licencesActive: S('licencesActive', s => stock(active,         closed, .89, s)),
      contractValue:  S('contractValue',  s => stock(contracts,      closed, .84, s)),
      aiSavings:      S('aiSavings',      s => stock(aiSavings,      closed, .21, s))
    }
  };
}

/* ---- verification: the same arithmetic the reconciliation guard will run ---- */
const FLOWS  = ['realized', 'revenue', 'anomalyImpact', 'security', 'ingestGB'];
const STOCKS = ['forecastAcc', 'committed', 'licences', 'licencesActive', 'contractValue', 'aiSavings'];

function verify(p, built, file){
  const errs = [];
  const closed = p.meta.closed || 0;
  const targets = {
    realized: p.realized || 0,
    revenue: built.meta.revenue,
    anomalyImpact: built.meta.unexpected,
    security: (() => { const c = (p.categories || []).find(x => /^Security/.test(x.k)); return c ? c.v : 0; })(),
    ingestGB: (p.secMeta && p.secMeta.ingestGB) || 0,
    forecastAcc: built.meta.forecastAcc,
    committed: built.meta.committed,
    licences: sum((p.saas || []).map(s => s.lic || 0)),
    licencesActive: sum((p.saas || []).map(s => s.active || 0)),
    contractValue: sum((p.vendors || []).map(v => v.contract || 0)),
    aiSavings: sum((p.savingsByCat || []).filter(s => /AI|Licence/i.test(s.k)).map(s => s.v || 0))
  };
  for(const [k, m] of Object.entries(built.monthly)){
    if(m.length !== 12) errs.push(`${k}: length ${m.length}, expected 12`);
    const filled = m.filter(v => v !== null).length;
    if(filled !== closed) errs.push(`${k}: ${filled} filled slots, expected ${closed}`);
    if(!closed) continue;
    if(FLOWS.includes(k)){
      const got = sum(m);
      if(Math.abs(got - targets[k]) > 0.001) errs.push(`${k}: FLOW sums to ${got}, expected ${targets[k]}`);
    }else{
      const last = m[closed - 1];
      if(Math.abs(last - targets[k]) > 0.051) errs.push(`${k}: STOCK ends at ${last}, expected ${targets[k]}`);
    }
    if(m.some(v => v !== null && (Number.isNaN(v) || !Number.isFinite(v))))
      errs.push(`${k}: contains NaN or Infinity`);
  }
  if(errs.length) console.log(`\n  ${file}\n` + errs.map(e => `    FAIL ${e}`).join('\n'));
  return errs.length;
}

/* ---- run ---- */
const CHECK = process.argv.includes('--check');
let failures = 0;

for(const file of FILES){
  const { raw, json } = load(file);
  const payload = JSON.parse(json);

  /* Round-trip guard. These files were generated with JSON.stringify(x, null, 2), so
     re-serialising an UNTOUCHED payload must reproduce the file byte for byte. If it
     does not, this script would reformat 4,000 lines to add 11, and the real diff
     would be impossible to review — so it refuses rather than writing. */
  if(ser(payload) !== raw){
    console.log(`  ${file}: round-trip is NOT byte-identical — refusing to rewrite.`);
    failures++;
    continue;
  }

  const built = build(payload);
  failures += verify(payload, built, file);

  if(!CHECK){
    Object.assign(payload.meta, built.meta);
    /* Inserted directly after `trend`, so the block sits with the other series rather
       than at the end of the file where nothing else time-based lives. */
    const rebuilt = {};
    for(const [k, v] of Object.entries(payload)){
      rebuilt[k] = v;
      if(k === 'trend') rebuilt.monthly = built.monthly;
    }
    if(!rebuilt.monthly) rebuilt.monthly = built.monthly;
    fs.writeFileSync(path.join(DIR, file), ser(rebuilt));
  }

  const m = built.monthly;
  console.log(`  ${file.padEnd(24)} closed=${String(payload.meta.closed).padStart(2)}  ` +
    `revenue=${built.meta.revenue}  unexpected=${built.meta.unexpected}  ` +
    `acc=${built.meta.forecastAcc}  committed=${built.meta.committed}  ` +
    `realized[${m.realized.filter(v => v !== null).length}]`);
}

console.log(failures ? `\n${failures} problem(s).` : `\nAll series reconcile.${CHECK ? ' (check only, nothing written)' : ''}`);
process.exit(failures ? 1 : 0);
