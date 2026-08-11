/* ============================================================
   Finoptic — core: formatting, the filter engine, deriveView(), the reconciliation guard
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  index.html loads them as

     data/registry.js -> the four scenario-*.js -> logo.js -> icons.js ->
     brands.js -> core.js -> components.js -> charts.js -> tooltip.js ->
     people.js -> catalog.js -> screens.js -> screens-account.js ->
     screens-input.js -> screens-onboarding.js -> motion.js -> shell.js

   The screens-*.js files register themselves into the global S after the
   original seventeen; motion.js must precede shell.js because shell.js calls
   MOTION from go() and at boot.

   Nothing here runs at load time except in shell.js, which boots the app at its
   foot — so a function defined in one file may freely call one defined in a
   later file, as long as the call happens during a render.
   ============================================================ */

/* ============================================================
   Finoptic — product-concept mock-up.
   Presentation follows planning/design-language/finoptic-design-language.md;
   §-references below point at the rule being implemented.

   DATA.  Nothing here is hardcoded any more.  The dataset arrives from
   data/scenario-*.js (see data/SCHEMA.md), one of which is active at a time;
   the selector in the top bar swaps between them and every screen re-renders
   from the new numbers.  A real .json file can also be loaded through the
   profile menu — FileReader is the only route that works from a file:// origin.

   All $ in thousands.  Fiscal year and reporting date come from the dataset.
   ============================================================ */

/* RAW is the loaded dataset exactly as authored.  D is the *view* — RAW after
   the active filters have been applied.  Screens only ever read D, so a filter
   change is a re-render, not a special case inside every screen. */
let RAW = null, D = null;

const sum = a => a.reduce((x,y)=>(x||0)+(y||0),0);
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- formatting ---------- */
const money = v => v==null?'—':(Math.abs(v)>=1000 ? '$'+(v/1000).toFixed(2)+'M' : '$'+Math.round(v)+'K');
const moneyK = v => '$'+(Math.round(v*10)/10).toLocaleString('en-US')+'K';
const dollars = v => '$'+v.toLocaleString('en-US');
const pct = (v,dp=1) => v.toFixed(dp)+'%';
const signed = v => (v>=0?'+':'−')+money(Math.abs(v));
const share = (v,t) => t?(v/t*100).toFixed(1)+'%':'—';
/* Title Case for a heading built from DATA rather than written in the source —
   a dataset's `resources.unit` becomes a column header, and a status name becomes a
   KPI label.  Every heading written as a literal was rewritten at source instead,
   because a runtime pass over all of them would be work done on every render to
   produce a string that never changes.

   The rule is "capitalise every word", per the instruction, and the exception that
   does the real work is that A WORD WITH AN UPPERCASE LETTER AFTER ITS FIRST
   CHARACTER IS LEFT ALONE — which is what protects SaaS, EC2, GB, MoM and every
   brand name without a word list.  Hyphen and slash are word boundaries. */
const titleCase = s => String(s).split(/([\s\-\/–—]+)/).map((w,i)=>{
  if(i % 2) return w;                                  /* the separator itself   */
  if(!/[a-z]/.test(w)) return w;                       /* AWS, YTD, 1M, ·        */
  if(/[A-Z]/.test(w.slice(1))) return w;               /* SaaS, MoM, GenAI       */
  return w.replace(/^([^A-Za-z]*)([a-z])/, (m,p,c)=>p+c.toUpperCase());
}).join('');

/* Dates in the dataset are written the way a report writes them ("28 Sep 2026")
   because they are read far more often than they are computed with.  These two
   turn them back into arithmetic when a screen needs "how many days out". */
const MONTHS3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const parseDate = s => {
  const p = String(s||'').trim().split(/\s+/);
  const m = MONTHS3.indexOf(p[1]);
  return (p.length===3 && m>=0) ? new Date(+p[2], m, +p[0]) : null;
};
const daysOut = s => {
  const d = parseDate(s), now = parseDate(D.meta.asOf);
  return (d && now) ? Math.round((d-now)/86400000) : null;
};
/* Contracts renewing inside 90 days — the window procurement actually acts in. */
const renew90 = rows => rows.filter(r=>{ const d = daysOut(r.renew); return d!==null && d>=0 && d<=90; });

/* How urgent a renewal actually is.  Date alone is not enough: a $16K contract
   at 88% utilisation renewing in 64 days is not the same problem as a $640K one,
   and a badly under-used contract deserves attention whatever its date. */
function renewalPriority(days,v,total){
  const big = total ? v.contract/total >= 0.15 : false;
  if(days<=30) return 'Critical';
  if(days<=90 && (big || v.util<70)) return 'High';
  if(days<=90 || v.util<70) return 'Medium';
  return 'Low';
}

/* Decimals are NOT dimmed (Brand Guide v2.0, still true at v3.0).  v1.1 greyed
   the cents on hero money figures — "$1.62M" with ".62" stepped back to
   --ink-3.  On review it read as a rendering fault rather than a refinement.
   A figure is one number in one colour.  Note this is the single point where
   the reference commentary is deliberately not followed: its DNA point 6 asks
   for dimmed decimals, citing Loud and Salezy.  The later instruction wins. */

/* ============================================================
   Filters (§7) — a real engine, not decoration
   ------------------------------------------------------------
   Two rules make this honest:

   1. A screen only shows the dimensions its own data actually carries.  That
      is what keeps the bar to ONE row — nine universal chips were both a lie
      (most did nothing on most screens) and three rows tall.

   2. Where a filter can be applied by selecting rows, it is: opportunities,
      anomalies, alerts, vendors, applications, products, providers all carry
      their dimension, so the subset is exact and the totals are re-summed from
      it.  Where a breakdown does not carry the dimension (cloud services do
      not record which product bought them), it is scaled by the selected
      slice's share and the card is marked "estimated" rather than quietly
      presenting a scaled number as a measured one.
   ============================================================ */

/* Month index sets. Index 11 (July) is forecast in every scenario, so no
   period includes it. */
const PERIODS = [
  ['Full year · Aug–Jun', [0,1,2,3,4,5,6,7,8,9,10]],
  ['H1 · Aug–Jan',        [0,1,2,3,4,5]],
  ['H2 · Feb–Jun',        [6,7,8,9,10]],
  ['Last quarter · Apr–Jun',[8,9,10]],
  ['Last month · Jun',    [10]]
];

const DIMS = {
  period:  {label:'Period',      icon:'calendar', vals:()=>PERIODS.map(p=>p[0])},
  category:{label:'Category',    icon:'tag',      vals:()=>RAW.categories.map(c=>c.k)},
  product: {label:'Product',     icon:'product',  vals:()=>RAW.products.map(p=>p.k)},
  provider:{label:'Provider',    icon:'cloud',    vals:()=>RAW.cloud.providers.map(p=>p.k)},
  env:     {label:'Environment', icon:'layers',   vals:()=>RAW.cloud.envs.map(e=>e.k)},
  vendor:  {label:'Vendor',      icon:'proc',     vals:()=>RAW.vendors.map(v=>v.k)}
};

/* Which dimensions each screen responds to.  Anything not listed is not
   offered — an unusable chip is worse than an absent one. */
const SCREEN_DIMS = {
  overview:['period','category','product'],
  itfm:['period','product','category'],
  cloud:['period','provider','env','product'],
  ai:['period','product'],
  saas:['period','vendor'],
  finance:['period','category'],
  /* Procurement gained `period` with the rest of the period work.  Its figures
     always moved with it — Total vendor spend goes $1.62M → $475K on Last quarter —
     but the control that moved them was not on the screen, so the reader had no way
     to know which span the numbers were for.  That is the fault the emphasis was
     asked for in the first place, in its worst form: not under-weighted, absent.
     `optimize` and `alerts` still have no period chip, and that is correct: the
     backlog and the open-alert feed are forward-looking lists, deriveView() does not
     scope either by month, and a control that changed nothing on the screen it sits
     on would be worse than no control. */
  proc:['period','vendor','category'],
  product:['period','product'],
  optimize:['category','product'],
  allocation:['period','product'],
  forecast:['period','category'],
  anomalies:['period','provider','product'],
  security:['period','product'],
  itsm:['period','product'],
  alerts:['product'],
  /* Screens that are ABOUT the platform rather than about the money.  Listed
     with an empty array rather than left out, so the filter row says nothing
     applies on purpose rather than by omission — and each says why in its own
     words, because "this screen describes the platform itself" is true of the
     data model and merely confusing on a list of colleagues. */
  sources:[],
  onboarding:[],
  team:[],
  add:[]
};
const NO_FILTER_NOTE = {
  sources:'This screen describes the platform itself — no filters apply.',
  onboarding:'Setup is the same for the whole workspace — no filters apply.',
  team:'People are not a slice of the spend — no filters apply.',
  add:'You are creating a row, not reading one — no filters apply.'
};

/* MULTI-SELECT.  Every dimension except period now holds an ARRAY of chosen
   values, empty meaning "All": "some should allow multiple selections.  For
   example, users need to be able to choose multiple categories and multiple
   products."  Period stays single — a period is one span of time by definition,
   and two disjoint periods summed into one figure would be a different product —
   but it gains a custom range instead (see CUSTOM_PERIOD below). */
const MULTI = ['category','product','provider','env','vendor'];
const F = {period:PERIODS[0][0], range:null, category:[], product:[], provider:[], env:[], vendor:[]};
const sel  = d => F[d] || [];
const has  = d => sel(d).length > 0;
/* "Everything except the one thing I picked" is a real question, so a selection
   of every available value is treated as no selection at all rather than as a
   filter that happens to exclude nothing. */
const allOf = d => DIMS[d] ? DIMS[d].vals() : [];

/* A custom range is a period like any other; the difference is that its months
   are computed from two dates rather than looked up.  Deliberately NOT a row in
   PERIODS: PERIODS is the fixed menu, and this one is authored on the spot. */
const CUSTOM_PERIOD = 'Custom range';
/* The first day of fiscal month `i`, worked back from the last month in the
   dataset — the fiscal year is Aug–Jul, so index 0 is in the PREVIOUS calendar
   year and cannot be assumed from asOf alone. */
function fyMonthStart(i, src){
  const M = src || RAW;
  const end = parseDate(M.meta.asOf) || new Date(2026,6,1);
  const last = M.meta.months.length - 1;
  const endM = MONTHS3.indexOf(M.meta.months[last]);
  return new Date(end.getFullYear(), endM - (last - i), 1);
}
const fyMonthEnd = (i,src) => {
  const s = fyMonthStart(i,src); return new Date(s.getFullYear(), s.getMonth()+1, 0);
};
/* The window a custom range may be drawn from: the closed months only.  Index 11
   is forecast in every scenario, and a range that quietly pulled a forecast month
   into an "actual" total would break the reconciliation the whole product is
   built on. */
/* `?? 11`, NOT `|| 11`.  A workspace on day one declares closed:0, and `||`
   treats that as "not stated" — so the one dataset that has closed no months was
   being told it had closed eleven, and every range control offered a year of
   months it had no figures for. */
const closedCount = src => {
  const m = (src||RAW).meta;
  const c = (m.closed === undefined || m.closed === null) ? 11 : m.closed;
  return Math.min(c, (m.months||[]).length);
};
/* "This workspace has not measured anything yet."  One closed month is the line,
   because every figure the product reports is a closed-month figure — before
   that there is nothing to be right or wrong about.  It is what tells an empty
   card whether it is empty because of a filter or because nothing has arrived,
   and those want opposite advice. */
const workspaceEmpty = src => closedCount(src) === 0;
/* Whole months, and the UI says so.  The dataset carries one figure per month, so
   a range ending on the 12th cannot be honoured to the day without inventing a
   daily curve — and inventing one on a screen whose entire claim is
   reconciliation would be the worst kind of polish. */
function rangeMonths(r){
  if(!r || !r.from || !r.to) return PERIODS[0][1];
  const from = new Date(r.from+'T00:00:00'), to = new Date(r.to+'T00:00:00');
  const out = [];
  for(let i=0;i<closedCount();i++)
    if(fyMonthStart(i) <= to && fyMonthEnd(i) >= from) out.push(i);
  return out.length ? out : PERIODS[0][1];
}
const monthsOf = label => label===CUSTOM_PERIOD
  ? rangeMonths(F.range)
  : (PERIODS.find(p=>p[0]===label) || PERIODS[0])[1];

const activeDims = () => (SCREEN_DIMS[current]||[]).filter(d=>DIMS[d]);
/* Only filters the current screen can honour count as "on" — a Vendor filter
   left set while you look at the cloud screen must not claim to be shaping it. */
const liveFilters = () => activeDims().filter(d=>d!=='period' && has(d));

/* Sum an entity's monthly series over the selected months. */
const inPeriod = (m,mo) => m ? sum(mo.map(i=>m[i]||0)) : 0;
/* The LATEST reading inside the selected months, which is what a stock narrows to.
   A stock is a level — licences held, contract value under management, forecast
   accuracy — so the figure for Aug–Oct is October's reading, not August plus
   September plus October.  Summing one is how "1,350 licences" becomes "14,000":
   see SCHEMA.md, "A flow sums to its total; a stock ends at it". */
const latestIn = (m,mo) => {
  if(!m) return 0;
  for(let i=mo.length-1;i>=0;i--){ const v = m[mo[i]]; if(v!==null && v!==undefined) return v; }
  return 0;
};
/* Which of the `monthly` series is which.  Kept here rather than inferred, because
   the two are indistinguishable from the numbers alone — both are twelve rising
   figures — and guessing wrong is silent. */
const MONTHLY_FLOW  = ['realized','revenue','anomalyImpact','security','ingestGB'];
const MONTHLY_STOCK = ['forecastAcc','committed','licences','licencesActive','contractValue','aiSavings'];
/* Rescale a flat breakdown that has no monthly detail. */
const rescale = (arr,factor,key='v') => arr.map(x=>{
  const y = Object.assign({},x); y[key] = Math.round(x[key]*factor*10)/10; return y;
});
/* Add several monthly series together, keeping null where EVERY contributor is
   null.  Multi-select made this necessary: with one category selected the trend
   line was simply that category's own series, but with three it has to be their
   sum — and a month that is null in all three is "not reported yet", which must
   stay a gap in the line rather than becoming a zero and drawing a cliff. */
function sumSeries(list, fallback){
  const series = list.filter(Array.isArray);
  if(!series.length) return fallback;
  return series[0].map((_,i)=>{
    const vals = series.map(s=>s[i]).filter(v=>v!==null && v!==undefined);
    return vals.length ? sum(vals) : null;
  });
}

function deriveView(){
  const V = clone(RAW);
  const mo = monthsOf(F.period);
  const fullYear = mo.length === 11;
  V.estimated = false;            /* set when any figure had to be scaled */
  V.scope = [];                   /* human-readable description of the slice */

  /* ---- 1. period.  Every monthly series is summed over the selection, so
     these figures are exact, not scaled. ---- */
  if(!fullYear){
    const keep = i => mo.includes(i);
    const mask = a => a.map((v,i)=>keep(i)?v:null);
    V.trend.actual = mask(RAW.trend.actual);
    V.trend.budget = mask(RAW.trend.budget);
    V.ytdActual = inPeriod(RAW.trend.actual,mo);
    V.ytdBudget = inPeriod(RAW.trend.budget,mo);
    V.categories = RAW.categories.map(c=>Object.assign({},c,{v:inPeriod(c.m,mo),m:mask(c.m)}));
    V.products   = RAW.products.map(p=>{
      const v = inPeriod(p.m,mo), f = p.v?v/p.v:0;
      return Object.assign({},p,{v, m:mask(p.m),
        cloud:Math.round(p.cloud*f), ai:Math.round(p.ai*f),
        saas:Math.round(p.saas*f), other:Math.round(p.other*f),
        rev:Math.round(p.rev*f), budget:Math.round(p.budget*f)});
    });
    V.cloud.providers = RAW.cloud.providers.map(p=>
      Object.assign({},p,{v:inPeriod(p.m,mo),m:mask(p.m)}));
    V.cloud.total = sum(V.cloud.providers.map(p=>p.v));
    V.ai.total = inPeriod(RAW.ai.m,mo);
    V.ai.m = mask(RAW.ai.m);
    const aif = RAW.ai.total?V.ai.total/RAW.ai.total:0;
    V.ai.sub = Math.round(RAW.ai.sub*aif); V.ai.api = V.ai.total - V.ai.sub;
    V.itsm.volume = mask(RAW.itsm.volume);
    /* ---- the `monthly` block (round 14) ----
       These are EXACT under a period filter rather than apportioned, which is the
       whole reason they were authored: the figures they carry — realised savings,
       revenue, unexpected spend, committed spend, licences — used to be estate
       totals that sat still while the period pill moved, so a KPI tile could report
       a full year's savings above a chart showing one quarter.
       A flow re-sums over the selection; a stock takes the selection's last
       reading.  V.monthly keeps the masked series so the sparkline on the tile
       draws the same months the figure was computed from. */
    if(RAW.monthly){
      V.monthly = {};
      MONTHLY_FLOW.forEach(k=>{ if(RAW.monthly[k]) V.monthly[k] = mask(RAW.monthly[k]); });
      MONTHLY_STOCK.forEach(k=>{ if(RAW.monthly[k]) V.monthly[k] = mask(RAW.monthly[k]); });
      if(RAW.monthly.realized)      V.realized          = inPeriod(RAW.monthly.realized,mo);
      if(RAW.monthly.revenue)       V.meta.revenue      = inPeriod(RAW.monthly.revenue,mo);
      if(RAW.monthly.anomalyImpact) V.meta.unexpected   = inPeriod(RAW.monthly.anomalyImpact,mo);
      if(RAW.monthly.forecastAcc)   V.meta.forecastAcc  = latestIn(RAW.monthly.forecastAcc,mo);
      if(RAW.monthly.committed)     V.meta.committed    = latestIn(RAW.monthly.committed,mo);
    }
    /* Breakdowns with no monthly detail get scaled by the period's share. */
    const f = RAW.ytdActual?V.ytdActual/RAW.ytdActual:0;
    ['security','obs','savingsByCat','tagging'].forEach(k=>V[k]=rescale(RAW[k],f));
    /* `obs` is still rescaled and still in the schema even though the
       Observability SCREEN is gone: D.obsByProduct feeds the ITSM board's
       observability column, and a dataset is a description of the estate rather
       than a list of the screens that happen to exist. */
    V.depts = rescale(rescale(RAW.depts,f),f===0?0:1,'budget')
      .map(d=>Object.assign({},d,{budget:Math.round(d.budget*f)}));
    V.cloud.services = rescale(RAW.cloud.services,RAW.cloud.total?V.cloud.total/RAW.cloud.total:0);
    V.cloud.envs     = rescale(RAW.cloud.envs,    RAW.cloud.total?V.cloud.total/RAW.cloud.total:0);
    V.ai.byProduct   = rescale(RAW.ai.byProduct,aif);
    V.unallocated = Math.round(RAW.unallocated*f);
    V.estimated = true;
    V.scope.push(F.period);
  }

  /* ---- 2. dimension filters.  Row-level subsets are exact; the aggregates
     they imply are re-summed from the subset. ---- */
  const only = (arr,key,val) => arr.filter(r=>r[key]===val);
  /* Whenever a filter narrows the spend, the PLAN has to narrow with it.  The
     ledger strip is an equation — leaving ytdBudget at the whole-company figure
     while ytdActual is one category's made it read "$218K − $1.50M = −$1.28M",
     which is not a variance, it is a category compared to a company. */
  const narrow = actualAfter => {
    const f = V.ytdActual ? actualAfter/V.ytdActual : 0;
    V.ytdBudget = Math.round(V.ytdBudget*f);
    V.ytdActual = actualAfter;
    V.unallocated = Math.round(V.unallocated*f);
    V.fyForecast = Math.round(V.fyForecast*f);
    V.fyBudget   = Math.round(V.fyBudget*f);
    /* The `monthly` series come down with the spend, APPORTIONED rather than
       measured — a category does not record the revenue it supported or the
       licences it holds, so this is the same estimate `security` and `tagging`
       already take, and it sets the same `estimated` flag that makes a card say so.
       Exception: `committed` and `contractValue` are stocks about the estate's
       contracts rather than about this slice, but leaving them whole while spend
       narrowed produced "Committed spend $1.12M" beside "Actual $218K" — a
       commitment four times the spend it is meant to be part of. */
    if(V.monthly){
      const cut = s => Array.isArray(s) ? s.map(v=>v===null?null:Math.round(v*f*10)/10) : s;
      MONTHLY_FLOW.forEach(k=>{ if(V.monthly[k]) V.monthly[k] = cut(V.monthly[k]); });
      ['committed','licences','licencesActive','contractValue','aiSavings']
        .forEach(k=>{ if(V.monthly[k]) V.monthly[k] = cut(V.monthly[k]); });
      V.realized        = Math.round(V.realized*f);
      V.meta.revenue    = Math.round(V.meta.revenue*f);
      V.meta.unexpected = Math.round(V.meta.unexpected*f);
      V.meta.committed  = Math.round(V.meta.committed*f);
      /* forecastAcc is NOT scaled.  It is a percentage — a 94.2% forecast on a
         quarter of the estate is still 94.2%, and multiplying it by the spend
         share would report 23.5%, which reads as a broken forecast rather than as
         a narrower one. */
    }
    V.estimated = true;
  };

  if(has('category')){
    const keep = new Set(sel('category'));
    const cs = V.categories.filter(x=>keep.has(x.k));
    if(cs.length){
      V.categories = cs;
      narrow(sum(cs.map(c=>c.v)));
      V.trend.actual = sumSeries(cs.map(c=>c.m), V.trend.actual);
      const oppCats = new Set(sel('category').map(mapCatToOppCat));
      V.opps = V.opps.filter(o=>oppCats.has(o.cat));
      V.savingsByCat = V.savingsByCat.filter(s=>oppCats.has(s.k));
      V.scope.push(...sel('category'));
    }
  }
  if(has('product')){
    const keep = new Set(sel('product'));
    const ps = V.products.filter(x=>keep.has(x.k));
    if(ps.length){
      V.products = ps;
      const pv = sum(ps.map(p=>p.v));
      /* A product records its own budget, so this one narrowing is measured
         rather than apportioned. */
      narrow(pv);
      const pb = sum(ps.map(p=>p.budget||0));
      V.ytdBudget = pb || V.ytdBudget;
      V.trend.actual = sumSeries(ps.map(p=>p.m), V.trend.actual);
      /* Each selected product's own mix is recorded, so this breakdown stays
         measured however many are chosen. */
      const pCloud = sum(ps.map(p=>p.cloud)), pAi = sum(ps.map(p=>p.ai)),
            pSaas  = sum(ps.map(p=>p.saas)),  pOther = sum(ps.map(p=>p.other));
      V.categories = V.categories.map(c=>{
        const v = c.k.indexOf('Cloud')===0 ? pCloud
                : c.k.indexOf('AI')===0    ? pAi
                : c.k.indexOf('SaaS')===0  ? pSaas
                : Math.round(pOther * (c.v / Math.max(1,othersTotal(V.categories))));
        return Object.assign({},c,{v});
      }).filter(c=>c.v>0);
      /* Cloud and AI narrow to what THIS product spends — so EVERY breakdown of
         them has to come down with the total.  Leaving services and environments
         at whole-company figures while cloud.total became one product's share
         measured each slice against a total it was no longer part of, and the
         donut legends read 216.1% and 118.5%.  Apportioned rather than measured,
         because a cloud service does not record which product bought it, which
         is why these cards carry "estimated". */
      const cf = sumProv(V.cloud.providers) ? pCloud/sumProv(V.cloud.providers) : 0;
      V.cloud.total     = pCloud;
      V.cloud.providers = rescale(V.cloud.providers,cf);
      V.cloud.services  = rescale(V.cloud.services,cf);
      V.cloud.envs      = rescale(V.cloud.envs,cf);
      const aiSum = sum(V.ai.providers.map(x=>x.v));
      const af = aiSum ? pAi/aiSum : 0;
      V.ai.total     = pAi;
      V.ai.providers = rescale(V.ai.providers,af);
      V.ai.sub       = Math.round(V.ai.sub*af);
      V.ai.api       = pAi - V.ai.sub;
      V.ai.byProduct = RAW.ai.byProduct.filter(x=>keep.has(x.k));
      V.obsByProduct = RAW.obsByProduct.filter(x=>keep.has(x.k));
      V.itsm.byProduct = RAW.itsm.byProduct.filter(x=>keep.has(x.k));
      V.anomalies = V.anomalies.filter(a=>keep.has(a.prod));
      V.alerts = V.alerts.filter(a=>keep.has(a.prod));
      V.estimated = true;
      V.scope.push(...sel('product'));
    }
  }
  if(has('provider')){
    const keep = new Set(sel('provider'));
    const ps = V.cloud.providers.filter(x=>keep.has(x.k));
    if(ps.length){
      narrow(narrowCloudTo(V,sum(ps.map(p=>p.v)),'providers',ps));
      V.anomalies = V.anomalies.filter(a=>sel('provider').some(k=>providerMatches(a.prov,k)));
      V.scope.push(...sel('provider'));
    }
  }
  if(has('env')){
    const keep = new Set(sel('env'));
    const es = V.cloud.envs.filter(x=>keep.has(x.k));
    if(es.length){ narrow(narrowCloudTo(V,sum(es.map(e=>e.v)),'envs',es)); V.scope.push(...sel('env')); }
  }
  if(has('vendor')){
    const keep = new Set(sel('vendor'));
    const vs = V.vendors.filter(x=>keep.has(x.k));
    if(vs.length){
      V.vendors = vs;
      V.saas = V.saas.filter(a=>keep.has(a.vendor));
      /* A vendor's spend is recorded but not its split across categories, so the
         breakdown is apportioned and the strip narrows to the vendors' total. */
      const vv = sum(vs.map(v=>v.v));
      const f = V.ytdActual ? vv/V.ytdActual : 0;
      V.categories = rescale(V.categories,f).filter(c=>c.v>0);
      V.cloud.total = Math.round(V.cloud.total*f);
      V.cloud.providers = rescale(V.cloud.providers,f);
      V.cloud.services  = rescale(V.cloud.services,f);
      V.cloud.envs      = rescale(V.cloud.envs,f);
      narrow(vv);
      V.scope.push(...sel('vendor'));
    }
  }

  /* ---- 3. re-derive the totals that hang off filtered row sets ---- */
  V.identified = sum(V.opps.map(o=>o.s));
  V.realized   = Math.min(V.realized, V.identified);
  V.cloud.providers.forEach(p=>{ if(p.v<0) p.v=0; });
  return V;
}
/* A second view, alongside D, with Period reset to the full fiscal year and
   every other filter left exactly as selected.  It is what the reconciliation
   strip's "$X YTD" companion figures read from: D's own figure may be scoped
   to whatever narrower span the Period pill shows, and this is the standing
   year-to-date number beside it regardless of that span.  Pure and read-only —
   F is restored before this returns — so a screen can call it as often as it
   needs without another render depending on the order calls happen in. */
function ytdView(){
  const p = F.period, r = F.range;
  F.period = PERIODS[0][0]; F.range = null;
  const V = deriveView();
  F.period = p; F.range = r;
  return V;
}
/* Category names in `categories` and in `opps[].cat` use different vocabularies
   ("SaaS & licences" vs "SaaS"), so the crossover is declared rather than
   guessed at with a substring test. */
const CAT_TO_OPP = {'Cloud infrastructure':'Cloud','SaaS & licences':'SaaS','AI & LLM':'AI',
  'Security':'Security','Observability':'Observability','ITSM':'ITSM',
  'Device management':'Device','Other technology':'Other'};
const mapCatToOppCat = c => CAT_TO_OPP[c] || c;
const othersTotal = cats => sum(cats.filter(c=>
  c.k.indexOf('Cloud')!==0 && c.k.indexOf('AI')!==0 && c.k.indexOf('SaaS')!==0).map(c=>c.v));
const sumProv = ps => sum(ps.map(p=>p.v));

/* Narrowing to one provider or one environment shrinks the cloud line, and the
   cloud line is part of the company total — so the Cloud category and every
   headline that hangs off it come down with it.  Leaving the strip at the
   whole-company figure while the screen showed one provider made the two
   contradict each other.  `keyed` is the cloud sub-list being reduced to a
   single row; the other one is apportioned, so the card carries "estimated". */
function narrowCloudTo(V,value,keyed,rows){
  const before = V.cloud.total, f = before?value/before:0;
  V.cloud[keyed] = rows;
  V.cloud.total = value;
  V.cloud.services = rescale(V.cloud.services,f);
  ['providers','envs'].filter(k=>k!==keyed).forEach(k=>V.cloud[k]=rescale(V.cloud[k],f));
  const drop = before - value;
  V.categories = V.categories.map(c=>
    c.k.indexOf('Cloud')===0 ? Object.assign({},c,{v:Math.max(0,c.v-drop)}) : c);
  V.estimated = true;
  return sum(V.categories.map(c=>c.v));
}
/* Anomaly rows say "AWS"/"Azure"/"Google Cloud"; the provider list says
   "AWS"/"Microsoft Azure"/"Google Cloud". */
const providerMatches = (a,b) => a===b || b.indexOf(a)>=0 || a.indexOf(b)>=0;

/* ---- consistency guard: logged, not thrown — a bad dataset should be
   diagnosable in the console without taking the demo down. ---- */
function reconcile(){
  const t = {
    scenario:RAW.id,
    ytdVsTrend:[RAW.ytdActual, sum(RAW.trend.actual.filter(v=>v!==null))],
    ytdVsCats:[RAW.ytdActual, sum(RAW.categories.map(c=>c.v))],
    ytdVsProducts:[RAW.ytdActual, sum(RAW.products.map(p=>p.v))],
    cloud:[RAW.cloud.total, sumProv(RAW.cloud.providers)],
    ai:[RAW.ai.total, RAW.ai.sub+RAW.ai.api],
    identified:[RAW.identified, sum(RAW.opps.map(o=>o.s))]
  };
  /* Invariant 19 — the `monthly` block.  Checked here rather than trusted, because
     these series arrive from a JSON file a user can load at runtime, and the two
     kinds fail differently: a flow that does not sum leaves a tile disagreeing with
     the sparkline beside it, while a stock that was authored as a flow reports
     eleven times the licences the company owns.  Only the closed months are read —
     a null tail is the schema working, not drift. */
  if(RAW.monthly){
    const closed = (RAW.meta && RAW.meta.closed) || 0;
    const secCat = (RAW.categories||[]).find(c=>/^Security/.test(c.k));
    const flowTargets = {
      realized:RAW.realized, revenue:RAW.meta.revenue, anomalyImpact:RAW.meta.unexpected,
      security:secCat?secCat.v:0, ingestGB:(RAW.secMeta&&RAW.secMeta.ingestGB)||0
    };
    const stockTargets = {
      forecastAcc:RAW.meta.forecastAcc, committed:RAW.meta.committed,
      licences:sum((RAW.saas||[]).map(s=>s.lic||0)),
      licencesActive:sum((RAW.saas||[]).map(s=>s.active||0)),
      contractValue:sum((RAW.vendors||[]).map(v=>v.contract||0)),
      aiSavings:sum((RAW.savingsByCat||[]).filter(s=>/AI|Licence/i.test(s.k)).map(s=>s.v||0))
    };
    Object.keys(flowTargets).forEach(k=>{
      const m = RAW.monthly[k]; if(!m) return;
      t['monthly.'+k] = [flowTargets[k], sum(m.filter(v=>v!==null))];
    });
    Object.keys(stockTargets).forEach(k=>{
      const m = RAW.monthly[k]; if(!m || !closed) return;
      t['monthly.'+k] = [stockTargets[k], m[closed-1]];
    });
  }
  const bad = Object.keys(t).filter(k=>Array.isArray(t[k]) && Math.abs(t[k][0]-t[k][1])>1);
  if(bad.length) console.warn('reconciliation drift in "'+RAW.id+'":',bad.map(k=>k+' '+t[k]).join(' · '));
  else console.log('reconciliation ok ·',RAW.id);
}
