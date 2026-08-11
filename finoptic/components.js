/* ============================================================
   Finoptic — components: KPI tiles, cards, the briefing band, badges, tables, legends
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
   Components — small functions that return HTML strings
   ============================================================ */
/* Icon-tile inference (§7).  Every KPI carries a glyph now.  Rather than
   hand-tagging ~130 call sites across 17 screens, the tile is inferred from the
   tile's own label — the labels are already descriptive, so the mapping is
   stable, and any call can override with `ic:` / `tone:`. */
const KPI_ICON = [
  /* FIRST MATCH WINS, so this reads most-specific-first.  It was ordered by
     rough theme before, which meant a broad pattern near the top swallowed whole
     screens: /forecast/ took all four tiles on the forecasting screen (including
     "Forecast accuracy", which measures a forecast rather than being one), and
     /renewal|contract|vendor/ took five of eight on procurement.  A board where
     five figures wear the same glyph is the "everything is the same" fault in a
     different costume, so the audit that matters is DISTINCT icons per screen,
     not whether every tile has one. */
  [/anomal/i,                        'anomalies','neg'],
  [/alert/i,                         'alerts',   'neg'],
  [/unalloc|untag/i,                 'tag',      'warn'],
  [/unused|idle|inactive|overlap/i,  'box',      'warn'],
  [/below \d/i,                      'gauge',    'warn'],
  [/variance/i,                      'scale',    'warn'],
  [/realis|realiz/i,                 'check',    'pos'],
  [/saving|optimis|optimiz|potential/i,'savings','pos'],
  /* accuracy before forecast, uncommitted before committed, coverage before
     commitment — each of these pairs would otherwise collapse into one glyph */
  [/accuracy|confidence/i,           'gauge',    'info'],
  [/next month/i,                    'calendar', 'info'],
  [/next quarter/i,                  'trendup',  'info'],
  [/forecast|year-end/i,             'forecast', 'info'],
  [/allocated spend/i,               'check',    'info'],
  [/coverage/i,                      'target',   'info'],
  [/uncommitted/i,                   'box',      'n'],
  [/committed|commitment/i,          'check',    'info'],
  [/budget/i,                        'wallet',   'info'],
  [/allocat/i,                       'target',   'info'],
  [/tagging|complian/i,              'gauge',    'info'],
  [/renewal/i,                       'calendar', 'n'],
  [/contract value|under management/i,'wallet',   'n'],
  [/contract/i,                      'saas',     'n'],
  [/negotiat|opportunit/i,           'target',   'n'],
  [/vendor/i,                        'proc',     'n'],
  [/purchased/i,                     'box',      'n'],
  [/active licen/i,                  'check',    'n'],
  [/per employee|employee|headcount/i,'users',   'n'],
  [/per customer|customer/i,         'users',    'n'],
  [/utilisation|utilization/i,       'gauge',    'n'],
  [/SaaS|application|subscription/i, 'saas',     'n'],
  [/seat|licence|licens/i,           'users',    'n'],
  [/ticket/i,                        'itsm',     'n'],
  [/incident/i,                      'alerts',   'n'],
  [/change/i,                        'box',      'n'],
  [/token|request|per 1m/i,          'ai',       'n'],
  [/per gb/i,                        'scale',    'n'],
  [/log volume|^logs/i,              'obs',      'n'],
  [/metric series|cardinal/i,        'itfm',     'n'],
  [/trace|span/i,                    'allocation','n'],
  [/retention/i,                     'box',      'n'],
  [/volume|data|GB/i,            'obs',      'n'],
  [/mean time|time to|oldest/i,      'calendar', 'n'],
  [/platform/i,                      'saas',     'n'],
  [/security/i,                      'security', 'n'],
  [/environment/i,                   'layers',   'n'],
  [/per product|per cost object/i,   'product',  'n'],
  [/cloud/i,                         'cloud',    'n'],
  [/AI|GenAI/i,                  'ai',       'n'],
  [/per transaction|transaction/i,   'itfm',     'n'],
  [/revenue|margin/i,                'finance',  'n'],
  [/month|growth|trend|MoM|QoQ/i,    'trendup',  'n'],
  [/spend|cost|total/i,              'money',    'n']
];
/* No tile, no tone.  The glyph used to sit on a tinted rounded square coloured by
   the KPI's status — a green square for a saving, amber for an overspend.  That
   made the icon a second status signal competing with the delta underneath it,
   and eight tinted squares across a KPI row put more colour on the board than the
   one hero card was supposed to own: "I would like all icons to be gray, without
   background boxes."  The glyph is now a plain grey mark that says WHAT the figure
   measures and nothing about whether it is good news.
   `tone` is still accepted and ignored, because ~130 call sites pass it. */
function kpiTile(label,ic,tone){
  /* A KPI that stands for a VENDOR wears the vendor's own mark instead of a
     glyph, and keeps its name as the label: "the cards, like the stat cards,
     represent AWS, Microsoft Azure, Google Cloud… we already have the
     appropriate brand icons, but the cards should also include the service name
     so they can be used in various contexts and viewed consistently."
     The three provider tiles on the cloud screen were all wearing the same
     generic cloud glyph, so three cards about three different companies were
     identical above the figure.
     This beats any `ic:` the call site passes, because a caller asking for
     'cloud' on a card headed "AWS" is asking for the best glyph available, and
     now there is a better one.  It only fires on an EXACT vendor name — brandKey
     is a lookup, not a substring test — so "Microsoft 365 seats" stays a glyph.
     A mark is not an icon: it carries its own literal hexes and must never take
     .ic, which would recolour it to currentColor (§5). */
  if(typeof hasBrand==='function' && hasBrand(label))
    return `<span class="kpi-ic kpi-bm">${brandMark(label)}</span>`;
  if(!ic){ const hit = KPI_ICON.find(r=>r[0].test(label)); ic = hit?hit[1]:'money'; }
  return `<span class="kpi-ic">${icon(ic)}</span>`;
}

/* KPI tile (§7): icon tile, label, figure, footer.  `hero` marks the one tile
   per screen that is "what this screen is about" — a real accent card, brand
   gradient with a hatched sheen, not a neutral tile with an accent edge. */
/* A ZERO ON AN UNMEASURED WORKSPACE IS A LIE, and it is the loudest one the
   product can tell: "$0K" is a measurement that says the company spent nothing,
   where the truth is that nobody has looked yet.  On a workspace with no closed
   month every tile was rendering one — eight of them across the Executive
   overview, including "Growth over the half year +-100.0%", which is what
   dividing by a zero baseline produces.
   So a figure that is exactly zero on a workspace that has closed no months
   becomes the em dash the empty states already use, and the tile says what it is
   waiting for.  Guarded on workspaceEmpty() rather than on the value alone,
   because a genuine zero — no anomalies open, nothing unallocated — is a real
   and useful measurement everywhere else.
   Matched on the RENDERED string rather than a raw number for the same reason
   tablekit reads cells: these come from ~130 call sites through a dozen
   formatters, and the formatted text is the only thing they all agree on. */
const ZERO_FIG = /^[+−-]?\$?0(\.0+)?[KMB]?(%| seats?| days?)?$/;
/* ---- round 14: the YTD byline and the inline sparkline ----
   `ytd` is the standing year-to-date figure, PASSED IN by the screen exactly the way
   the reconciliation strip's counterfoil is (14.6) and for the same reason: nearly
   every one of these mirrors a figure computed from a local in the renderer's own
   scope, and a second copy computed here would drift the first time a formula
   changed.  It is the fix for the inconsistency the round opened on — "the strip
   shows YTD where possible while the tiles show varied numbers for the same KPIs."
   Now every figure in the product reads the same way: the PERIOD value, with the YTD
   figure under it.

   When the period pill is at its default the two are the same number, and printing
   it twice is correct rather than a bug — it is what the strip has always done
   (see ledgerStrip), and the alternative is a byline that appears and disappears
   depending on a filter, which is worse than one that is briefly redundant.

   `spark` is a monthly series from D.monthly (or any series the screen already
   holds, like a category's `m`).  It is DROPPED, not drawn flat, when the figure is
   blank: a line along the axis of an unmeasured workspace is the same lie the
   em dash exists to prevent. */
const kpi = ({k,v,foot,delta,dir,hero,ic,tone,ytd,spark,sparkOpts}) => {
  const blank = typeof workspaceEmpty==='function' && workspaceEmpty()
                && ZERO_FIG.test(String(v).replace(/<[^>]*>/g,'').trim());
  if(blank){ v = '<span class="state-dash">—</span>'; delta = ''; foot = foot || 'Waiting on the first close'; ytd = ''; spark = null; }
  const sk = (!blank && spark && typeof sparkline==='function')
    ? sparkline(spark, Object.assign({name:k, labels:(typeof D!=='undefined'&&D.meta?D.meta.months:[])}, sparkOpts||{}))
    : '';
  /* `hero` is accepted and DELIBERATELY IGNORED.  Every tile is identical now —
     "remove the current primary emphasis… all KPI cards should now look identical"
     — and about twenty screens each mark one tile `hero:true`.  Dropping the class
     here rather than editing twenty call sites means there is one place that
     decides, and the argument is the same one that keeps `ic:` and `tone:` in this
     signature after icons stopped being per-card. */
  return `
  <div class="kpi${blank?' kpi-wait':''}">
    <div class="kpi-top">${kpiTile(k,ic,hero?'':tone)}<span class="kpi-k">${k}</span></div>
    ${/* The figure and its trend share one row.  The sparkline sits to the RIGHT of
          the number and is pushed there by the row rather than positioned, so a
          tile with no honest series — a structural count like Environments or
          Active Contracts (SCHEMA.md, "What deliberately has NO series") — is
          simply a figure on its own and needs no second layout. */''}
    <div class="kpi-fig"><span class="kpi-v">${v}</span>${sk?`<span class="kpi-spark">${sk}</span>`:''}</div>
    ${/* ---- round 15: the byline is TWO ROWS, and the figures in the first are
          divided ----
          "In all the tiles we have multiple byline items that are not actually
          separated — they only differ in font weight and colour.  What if we
          separate them with a dot or a vertical pipe?"

          Right, and the fix is a divider AND a break, because the three things that
          used to run together are not the same kind of thing.  `ytd` and `delta` are
          MEASUREMENTS — a standing figure and a movement — so they share a row and
          take the middot between them.  `foot` is the qualifier that says what the
          tile is counting, so it takes its own row and needs no divider at all.

          The break also fixes what a divider alone could not.  One row of all three
          wrapped at a different point on every tile, which left the middot hanging
          at the end of a line looking like a typo; two short rows of like with like
          cannot wrap, so the divider only ever appears between two figures.  Each
          row is emitted only if it has content, so a tile with no delta is one line
          shorter rather than one line emptier. */''}
    ${ytd||delta?`<div class="kpi-f">${ytd?`<span class="kpi-ytd">${ytd}</span>`:''}${delta?`<span class="delta ${dir||'flat'}">${delta}</span>`:''}</div>`:''}
    ${foot?`<div class="kpi-f kpi-note">${foot}</div>`:''}
  </div>`;
};

/* v3.0 inferred an icon tile for every card title from the title text, so all
   ~60 cards got a glyph without 60 call sites naming one.  The inference worked;
   the idea did not — "you have placed icons everywhere… as well as in tables,
   table headers, and chart cards.  I do not need those."  Icons are now KPI-only
   (see kpiTile), so CARD_ICON and cardTile are gone.  The `ic:` and `tone:`
   arguments still passed by a few screens are simply ignored, which is why they
   are still accepted below rather than removed from 60 call sites.  */
/* Card (§7).  Title is 16/700 with an optional grey sub-line and an icon tile,
   then --card-h-gap of real space before the first row.  The old header was
   15/700 with 12px, which is why a headline did not read as one.
   `est` marks a card whose figures were scaled rather than measured. */
const card = ({title,sub,hint,body,note,span=6,pad=true,ic,tone,est}) => `
  <div class="card c${span}">
    ${title?`<div class="card-h">
      <hgroup><h3>${title}</h3>${sub?`<span class="csub">${sub}</span>`:''}</hgroup>
      ${est&&D.estimated?`<span class="unfiltered">estimated</span>`
        :hint?`<span class="hint">${hint}</span>`:''}
    </div>`:''}
    ${pad?`<div class="card-b">${body}</div>`:body}
    ${note?`<div class="card-note">${note}</div>`:''}
  </div>`;

/* ============================================================================
   "WHAT YOU MIGHT MISS" — the first cell of the band, derived rather than authored
   ============================================================================
   The band's first cell used to be the authored `insights[screen].what`, and on
   most screens that sentence was the reconciliation strip written out in words:
   "Technology spend is $1.62M against a $1.50M phased budget — 8.0% over, or
   $120K."  Every one of those five figures is already in the equation directly
   above it and in the KPI tiles directly below it.  "On some screens the
   Reconciliation bar, insights, and KPI tiles convey essentially the same
   information… provide information that is not readily apparent from the KPI
   tiles or the Reconciliation bar."

   So this cell now earns its place by carrying facts that are true of the data but
   are NOT VISIBLE ANYWHERE ELSE ON THE SCREEN.  A level is visible — it is what a
   tile is.  A variance is visible — it is what the strip is.  What no tile and no
   equation can show is shape: how concentrated the spend is, whether the gap
   opened gradually or last month, which line is moving fastest, and how much of
   the total is too small to have its own row but large enough to matter together.

   Five probes, each of which either finds something or returns null:

     concentration  how few rows carry most of the money
     timing         what share of the variance landed in the last three months
     runrate        the latest closed month against the year's own average
     mover          the fastest-growing line, from the per-month series
     tail           rows individually immaterial, collectively not

   Each returns a SCORE as well as a sentence, and only notable things score: a
   concentration probe on an evenly-spread list scores 0 and stays quiet rather
   than reporting "the top three are 38%", which is a fact about nothing.  The two
   highest scorers are printed.  If nothing scores — a workspace with no closed
   month, a filter that emptied the screen — the authored `what` is used instead,
   so the cell degrades to what it said before rather than to blank.

   Derived from D, so all six datasets narrate themselves and none of it can
   contradict the board it sits in — the same contract Finn's answers hold to. */

/* What each screen is ABOUT: the ranked list its own cards are built from, the
   total that list adds to, and what to call a row.  Keyed by screen id, because
   "the biggest line" means a category on the overview and a vendor in
   procurement, and a probe that did not know the difference would tell the
   procurement screen about cloud infrastructure.

   `series` is the screen's OWN monthly total, so the run-rate probe talks about
   the thing the screen is about — an ITSM band reporting the estate's spend curve
   would be the exact redundancy this cell exists to remove.  `sNoun`/`sFmt` name
   and format it, because ITSM's series counts tickets and everything else's
   counts dollars. */
const missMonthly = rows => {
  const out = [];
  (rows||[]).forEach(r=>{ (r.m||[]).forEach((v,i)=>{
    if(v==null) return; out[i] = (out[i]||0) + v; }); });
  return out;
};
const MISS_SUBJECT = {
  overview:   () => ({items:D.categories, total:D.ytdActual, one:'category', many:'categories',
                      series:D.trend.actual, deal:true}),
  itfm:       () => ({items:D.depts.filter(d=>!/unalloc/i.test(d.k)), total:sum(D.depts.map(d=>d.v)),
                      one:'department', many:'departments',
                      series:D.trend.actual, movers:D.categories, moverOne:'category'}),
  cloud:      () => ({items:D.cloud.services, total:D.cloud.total, one:'service', many:'cloud services',
                      series:missMonthly(D.cloud.providers),
                      movers:D.cloud.providers, moverOne:'provider', deal:true}),
  ai:         () => ({items:D.ai.providers, total:D.ai.total, one:'provider', many:'AI providers',
                      series:D.ai.m, sNoun:'AI spend', deal:true}),
  saas:       () => ({items:D.saas.map(s=>({k:s.app, v:s.cost*12})), total:sum(D.saas.map(s=>s.cost*12)),
                      one:'application', many:'applications', deal:true}),
  finance:    () => ({items:D.depts.filter(d=>!/unalloc/i.test(d.k)), total:sum(D.depts.map(d=>d.v)),
                      one:'department', many:'departments',
                      series:D.trend.actual, movers:D.categories, moverOne:'category'}),
  proc:       () => ({items:D.vendors, total:sum(D.vendors.map(v=>v.v)), one:'vendor', many:'vendors',
                      universe:D.meta.vendors, deal:true}),
  product:    () => ({items:D.products.filter(p=>p.rev), total:sum(D.products.filter(p=>p.rev).map(p=>p.v)),
                      one:'product', many:'products', movers:D.products, moverOne:'product'}),
  optimize:   () => ({items:D.opps.map(o=>({k:o.o, v:o.s})), total:D.identified,
                      one:'opportunity', many:'opportunities'}),
  allocation: () => ({items:D.tagging, total:D.unallocated, one:'missing tag', many:'tag gaps',
                      series:D.trend.actual}),
  forecast:   () => ({items:D.categories, total:D.ytdActual, one:'category', many:'categories',
                      series:D.trend.actual, movers:D.categories, moverOne:'category'}),
  security:   () => ({items:D.security, total:sum(D.security.map(s=>s.v)), one:'platform', many:'platforms'}),
  itsm:       () => ({items:D.itsm.byProduct.map(p=>({k:p.k, v:p.cost})), total:D.itsm.total,
                      one:'product', many:'products',
                      series:D.itsm.volume, sNoun:'ticket volume', sFmt:'count'}),
  anomalies:  () => ({items:(D.anomalies||[]).map(a=>({k:a.svc, v:a.act-a.exp})),
                      total:sum((D.anomalies||[]).map(a=>a.act-a.exp)), one:'anomaly', many:'anomalies'}),
  alerts:     () => ({items:(D.alerts||[]).map(a=>({k:a.t, v:a.save})),
                      total:sum((D.alerts||[]).map(a=>a.save)), one:'alert', many:'alerts'}),
  /* The data-model screen is about the FEEDS, not about money at all — so it gets
     no ranked subject and leans on the coverage probe, which is the only one that
     is actually about this screen's own subject. */
  sources:    () => null
};
/* A screen with no entry gets the estate, which is always true of it. */
const missSubject = id => {
  try{
    const f = MISS_SUBJECT[id] === undefined ? MISS_SUBJECT.overview : MISS_SUBJECT[id];
    const s = f && f();
    if(!s) return null;
    s.items = (s.items||[]).filter(i=>i && i.v > 0);
    return s.items.length && s.total > 0 ? s : null;
  }catch(e){ return null; }
};

/* The closed slice of a monthly series.  A series is 12 long and tail-padded with
   null past `closed`, and sum() already treats null as 0 — which is right for a
   total and wrong for an average, so every probe here slices first. */
const missClosed = a => (a||[]).slice(0, closedCount()).filter(v=>v!=null);
const missPct = (a,b) => b ? (a-b)/Math.abs(b)*100 : 0;
const missNum = n => (n>=0?'+':'−') + Math.abs(Math.round(n)) + '%';

/* Scores are NORMALISED to roughly 0–100 — "how notable is this", not "how big is
   the number it happens to be measured in".  Without that the probes could not be
   compared: an unnormalised concentration probe reports 79 and an unnormalised
   run-rate probe reports 10 for two findings that are equally worth reading, so
   concentration won on all seventeen screens and the band said the same shape of
   thing everywhere.  Each probe maps its own threshold to 0 and a genuinely
   remarkable reading to 100. */
const missScore = (v, floor, ceil) =>
  Math.max(0, Math.min(100, (v-floor)/(ceil-floor)*100));

const MISS_PROBES = [
  /* How few rows carry most of the money.  Nothing on the screen states this: the
     donut shows the shape and the tiles show levels, but neither says "three". */
  function concentration(s){
    if(!s) return null;
    const universe = s.universe || s.items.length;
    /* Under six rows, "three of them are 80%" is arithmetic rather than a
       finding — and it is where the grammar used to fall over ("the other 1"). */
    if(universe < 6 || s.items.length < 4) return null;
    const v = s.items.map(i=>i.v).sort((a,b)=>b-a);
    const top = v[0]+v[1]+v[2], sh = top/s.total*100;
    if(sh < 50) return null;
    return {score:missScore(sh, 50, 92),
      html:`Three of ${universe} ${s.many} are <b>${sh.toFixed(0)}%</b> of it. `
         + `Everything below them is rounding`
         + `${s.deal ? ', so this is three conversations, not thirty' : ''}.`};
  },

  /* WHEN the variance accrued.  The strip gives one number for eleven months; a
     gap that opened entirely in the last quarter and a gap that has been there
     since August are the same number and completely different problems. */
  function timing(s){
    const A = missClosed(D.trend&&D.trend.actual), B = missClosed(D.trend&&D.trend.budget);
    const n = Math.min(A.length, B.length);
    if(n < 6) return null;
    const gaps = A.slice(0,n).map((a,i)=>a-B[i]);
    const tot = sum(gaps);
    if(Math.abs(tot) < 1) return null;
    const k = Math.min(3, n-1), sh = sum(gaps.slice(n-k))/tot*100;
    if(sh < 55 || sh > 400) return null;
    const M = D.meta.months;
    return {score:missScore(Math.min(sh,160), 55, 130),
      html:`<b>${sh.toFixed(0)}%</b> of the ${money(Math.abs(tot))} `
         + `${tot>0?'overrun':'underspend'} landed in ${M[n-k]}–${M[n-1]}. `
         + `A recent break, not a level the year has carried.`};
  },

  /* The latest closed month against the year's own average, and what that pace
     annualises to.  A YTD total hides its own slope completely, and the annualised
     figure is arrived at differently from the forecast tile — so where the two
     disagree, that disagreement is itself the finding. */
  function runrate(s){
    const A = missClosed(s && s.series);
    if(A.length < 4) return null;
    const last = A[A.length-1], avg = sum(A)/A.length, p = missPct(last, avg);
    if(Math.abs(p) < 6) return null;
    const count = s.sFmt === 'count';
    const f = v => count ? Math.round(v).toLocaleString('en-US') : money(v);
    const M = D.meta.months;
    return {score:missScore(Math.abs(p), 6, 34),
      html:`${M[A.length-1]} closed <b>${missNum(p)}</b> against the year's own `
         + `${f(avg)} average${s.sNoun ? ' of ' + s.sNoun : ''}. `
         + `Held twelve months, that pace is <b>${f(last*12)}</b>.`};
  },

  /* The fastest mover, from the per-month series each row carries.  First third
     of the closed year against the last third, so one spiky month cannot win it.
     Compared against the whole subject's own growth, because "AI is up 102%" is
     only a finding if the estate is not. */
  function mover(s){
    const rows = (s && (s.movers || s.items)) || [];
    const cand = rows.filter(r=>Array.isArray(r.m) && missClosed(r.m).length >= 6);
    if(cand.length < 2) return null;
    const rate = r => {
      const m = missClosed(r.m), t = Math.max(2, Math.floor(m.length/3));
      const early = sum(m.slice(0,t))/t, late = sum(m.slice(-t))/t;
      return {r, p:missPct(late, early), early, late};
    };
    const all = cand.map(rate).sort((a,b)=>b.p-a.p);
    const win = all[0];
    const est = missPct(sum(all.map(x=>x.late)), sum(all.map(x=>x.early)));
    if(win.p < 12 || win.p - est < 8) return null;
    const noun = s.moverOne || s.one;
    return {score:missScore(win.p - est, 8, 80),
      html:`<b>${win.r.k}</b> is the fastest-moving ${noun} — <b>${missNum(win.p)}</b> `
         + `against ${missNum(est)} for the estate. `
         + `That is what sets next year's base, not the biggest line.`};
  },

  /* Rows individually immaterial, collectively not.  Every list on the board is
     clipped to five and ranked, so the tail is the part of the total that is
     structurally invisible — you would have to open "Show all" and add up. */
  function tail(s){
    if(!s || s.items.length < 7) return null;
    const v = s.items.map(i=>i.v).sort((a,b)=>b-a);
    const cut = s.total*0.05, small = v.filter(x=>x < cut);
    if(small.length < 3) return null;
    const t = sum(small);
    if(t < v[1]) return null;
    return {score:missScore(t/s.total*100, 8, 40),
      html:`${small.length} ${s.many} under ${money(cut)} each are `
         + `<b>${money(t)}</b> together. `
         + `More than the second-largest line, and none big enough to get reviewed.`};
  },

  /* WHAT THE FIGURES ARE BUILT FROM.  Not a fact about spend at all, which is
     exactly why it belongs: a board of confident numbers standing on seven of
     twelve feeds is the one thing that changes how you should read every other
     figure on the screen, and there is nowhere else it appears.  Scored by how
     much of the picture is missing, so a fully-connected workspace never sees it
     and a day-ten workspace leads with it. */
  function coverage(s){
    const src = D.sources || [];
    if(src.length < 4) return null;
    const bad = src.filter(r=>!/^healthy$/i.test(String(r[3]||'Healthy')));
    if(!bad.length) return null;
    const off = bad.filter(r=>/not connected|pending|manual/i.test(String(r[3])));
    return {score:missScore(bad.length/src.length*100, 8, 55),
      html:`<b>${bad.length} of ${src.length}</b> feeds are not clean`
         + `${off.length ? ` and ${off.length===1?'one is':off.length+' are'} not `
                         + `connected at all` : ''}. Every figure above is the part `
         + `of the estate that reports itself.`};
  }
];

/* ---- the four screens whose real finding is domain-specific ----
   The six probes above are shape probes, and shape needs rows: a screen ranking
   three security platforms or five products has nothing for them to find, so all
   four of these used to fall through to the coverage note and four screens carried
   the same sentence.  Each of these reads the second measure its own screen
   already holds — revenue, traffic, ticket counts, ingestion volume — and states
   the RATIO, which is the one thing a board of totals structurally cannot show.
   Scored on the same 0–100 scale as the shape probes so they compete on merit
   rather than by being special-cased into first place. */
const MISS_LOCAL = {
  /* Technology cost as a share of the revenue it supports.  Every tile on the
     product screen is a cost and every one of them is bigger for the bigger
     product; intensity is the figure that reorders the list. */
  product(){
    const ps = (D.products||[]).filter(p=>p.rev>0 && p.v>0);
    if(ps.length < 2) return null;
    const r = ps.map(p=>({k:p.k, i:p.v/p.rev*100})).sort((a,b)=>b.i-a.i);
    const hi = r[0], lo = r[r.length-1];
    if(hi.i < lo.i*1.6) return null;
    return {score:missScore(hi.i/Math.max(.1,lo.i), 1.6, 6),
      html:`<b>${hi.k}</b> spends <b>${hi.i.toFixed(1)}%</b> of revenue on technology `
         + `against ${lo.k}'s ${lo.i.toFixed(1)}% — <b>${(hi.i/Math.max(.1,lo.i)).toFixed(1)}×</b>. `
         + `Cost ranks them one way; cost per dollar earned ranks them another.`};
  },
  /* One log source usually IS the SIEM bill, and its month-on-month move is the
     part nobody looks at until the invoice arrives. */
  security(){
    const src = (D.secMeta&&D.secMeta.sources)||[];
    if(src.length < 3) return null;
    const gb = sum(src.map(r=>r.gb));
    if(!gb) return null;
    const top = [...src].sort((a,b)=>b.gb-a.gb)[0];
    const sh = top.gb/gb*100;
    if(sh < 25) return null;
    const mv = Number(top.delta)||0;
    return {score:missScore(sh, 25, 62) * (Math.abs(mv)>15?1:.6),
      html:`<b>${top.src}</b> is <b>${sh.toFixed(0)}%</b> of SIEM ingestion`
         + `${mv ? `, ${missNum(mv)} this month` : ''}. Licence cost `
         + `follows volume, so one ${top.prod||'product'} setting moves the whole bill.`};
  },
  /* What the untagged remainder does to every per-unit figure on the board.  The
     tile says "$87K unallocated"; what it cannot say is that the figure makes every
     cost-per-thing on the screen a floor rather than a total. */
  allocation(){
    const u = D.unallocated, tot = D.ytdActual;
    if(!u || !tot) return null;
    const sh = u/tot*100, res = sum((D.tagging||[]).map(t=>t.res));
    return {score:missScore(sh, 1.5, 12),
      html:`<b>${money(u)}</b> — ${sh.toFixed(1)}% — has no owner`
         + `${res?`, across ${res} resources`:''}. `
         + `Every cost-per-thing on the board is a floor, not a total.`};
  },
  /* The board's freshest number is only as fresh as its slowest input, and the
     cadence column is the only place that is written down. */
  sources(){
    const src = D.sources || [];
    if(src.length < 4) return null;
    const slow = src.filter(r=>!/daily|hourly|real/i.test(String(r[2]||'Daily')));
    if(!slow.length) return null;
    return {score:missScore(slow.length/src.length*100, 6, 50),
      html:`<b>${slow.length}</b> of ${src.length} feeds do not land daily `
         + `— ${[...new Set(slow.map(r=>String(r[2]).toLowerCase()))].slice(0,2).join(' and ')}. `
         + `Today's figure is as old as the slowest input behind it.`};
  },
  /* A ticket and an incident cost wildly different amounts, and the incident RATE
     is what decides which. */
  itsm(){
    const I = D.itsm||{};
    if(!I.tickets || !I.incidents || !I.perTicket || !I.perIncident) return null;
    const rate = I.incidents/I.tickets*100, mult = I.perIncident/I.perTicket;
    if(mult < 1.6) return null;
    return {score:missScore(mult, 1.6, 6),
      html:`<b>${rate.toFixed(1)}%</b> of tickets are incidents, and each costs `
         + `<b>${mult.toFixed(1)}×</b> more. `
         + `The volume is in tickets; the money is not.`};
  }
};

/* Two POINTERS, best first — round 14 turned the band's prose into a short list:
   "instead of paragraphs of content I would want it to be pointers of text, a
   maximum of two pointers each."  Two because one is thin against a three-column
   band and three overflows the cell at this measure — and because the pairing that
   almost always wins is one fact about SHAPE and one about MOVEMENT, which is
   exactly the pair a level and a variance cannot give you.
   Returns an ARRAY now rather than a joined string, because the cell renders a list;
   briefing() is its only caller. */
function missedHTML(id){
  if(workspaceEmpty()) return null;
  const s = missSubject(id);
  const run = p => { try{ return p(s); }catch(e){ return null; } };
  const found = MISS_PROBES.concat(MISS_LOCAL[id] ? [MISS_LOCAL[id]] : [])
    .map(run).filter(Boolean).sort((a,b)=>b.score-a.score);
  if(!found.length) return null;
  /* The best finding always prints.  A SECOND one only earns the space if it is
     itself notable — without this floor the lowest-scoring probe that happened to
     fire became the second sentence on nine screens, and a cell that says the same
     thing everywhere is the fault this whole file exists to fix, one rung down. */
  const keep = found.slice(0, found[1] && found[1].score >= 25 ? 2 : 1);
  return keep.map(f=>f.html);
}

/* Authored prose -> pointers.  The `why` and `do` strings in the datasets are
   already written as one or two sentences, so the split is a rendering change
   rather than a content rewrite — which is what makes it work across all six
   datasets and seventeen screens at once instead of ~200 hand-edited strings.

   Splits on a full stop followed by a capital, so a decimal (`8.0%`), a currency
   figure (`$1.62M`) and an abbreviation inside a sentence all survive: those have
   no space after the stop.  Capped at two, and a third sentence is DROPPED rather
   than folded into the second — a pointer that runs to three lines is the paragraph
   this round removed, wearing a bullet. */
/* ---- round 15: ONE, not two ----
   "The Key Insights block is still too emphatic and the content is excessive.  I
   need it shortened.  Since we haven't been able to shorten it effectively, please
   try again."

   `max` defaults to 1 now.  Round 14 turned three paragraphs into three lists of up
   to two and that was the wrong unit of reduction — a list of two sentences is a
   paragraph with a bullet in the middle of it.  What the band is for is the one
   thing per column worth carrying out of the room, so each authored column prints
   its FIRST sentence and drops the rest.

   Nothing is lost that the screen does not already hold: `why` and `do` are authored
   per dataset and their opening sentence is the finding, with the remainder being
   elaboration that the cards below the band state in full.  The derived column is
   the exception and passes 2, because its two pointers are two DIFFERENT findings
   rather than one finding continued. */
function points(text, max=1){
  if(!text) return [];
  return String(text).split(/(?<=\.)\s+(?=[A-Z<])/)
    .map(s=>s.trim()).filter(Boolean).slice(0,max);
}

/* ---- the briefing band (§7) ----
   What / Why / Do, emitted by head() — but no longer directly under the page
   title.  head() renders it into the flow and go() then moves it BELOW the KPI
   tiles (see placeBriefing() in shell.js): "move the key insights below the KPI
   tiles."  The order it was in put three columns of prose between the equation
   and the first figure, so you read the conclusion before you had seen anything
   it was drawn from; below the tiles it lands where the question "so what?"
   actually forms.  It stays ABOVE the charts, so it is still the second thing on
   the screen and not a footnote — which is the fault that moved it up here in the
   first place, and which must not be reintroduced.

   The first cell is DERIVED now, not authored — see missedHTML() above. */
function briefing(id){
  const b = (D.insights||{})[id];
  if(!b) return '';
  const missed = missedHTML(id);
  /* No icon and no coloured edge — the label does the work.  Three tinted icon
     tiles and three 3px role bars on a band of running prose was ornament on
     ornament: "you have placed icons everywhere, even in insights where they
     make no sense". */
  /* A LIST, not a paragraph (round 14).  Each cell carries at most two pointers, and
     the markup is a real <ul> rather than paragraphs with a bullet glyph typed in
     front, so a screen reader hears a list of two and the second pointer wraps
     against the first's text rather than under its marker. */
  const list = items => `<ul class="brief-p">${
    items.filter(Boolean).map(t=>`<li>${t}</li>`).join('')}</ul>`;
  const cell = (role,label,items) =>
    `<div class="brief ${role}">
       <div class="brief-h"><b>${label}</b></div>
       ${list(items)}
     </div>`;
  /* Each probe writes a finding AND its implication, as two sentences — "Three of 8
     categories are 71% of it. Everything below them is rounding, so this is three
     conversations, not thirty."

     ROUND 15: the FINDING only, always.  Round 14 printed both sentences whenever a
     single probe fired, which is how a cell meant to hold pointers ended up holding
     a paragraph again on every screen where only one probe had something to say.
     Now each finding contributes exactly one sentence and at most two findings
     print, so this cell is one or two lines and never more — and the implications
     were rewritten as second sentences that the first does not depend on, so
     dropping them costs the reader nothing they cannot see on the screen itself. */
  const whatPts = !missed ? null : missed.map(h=>points(h)[0]);
  return `<div class="briefing">
    ${whatPts ? cell('what','What You Might Miss',whatPts)
              : cell('what','What Is Happening',points(b.what))}
    ${cell('why','Why It Is Happening',points(b.why))}
    <div class="brief do">
      <div class="brief-h"><b>What To Do</b></div>
      ${list(points(b.do))}
      ${b.doValue?`<div class="brief-cta"><b>${b.doValue}</b>
        <span>${b.doLabel||'available if actioned'}</span>
        <button class="btn sm" data-go="optimize">Open backlog</button></div>`:''}
    </div>
  </div>`;
}

const badge = (label,tone,ic) => `<span class="badge ${tone}">${ic?icon(ic,true):''}${label}</span>`;
const sevBadge = s => badge(s, s==='Critical'?'crit':s==='High'?'high':s==='Medium'?'med':'low');
/* The optimisation pipeline is a PROGRESSION, so its chips read as one:
   nothing-yet → needs a decision → cleared → being worked → banked.
   v2.0 put Approved in amber, which reads as a warning about the one state
   that means "go".  Approved is green.
   The tick that used to sit in the Implemented chip is gone with the rest of the
   in-table icons: green plus the word "Implemented" is not ambiguous. */
const ST_TONE = {
  'Identified':'st-identified', 'Under review':'st-review',
  'Approved':'st-approved', 'In progress':'st-progress', 'Implemented':'st-done'
};
const stBadge = s => badge(s, ST_TONE[s] || 'n');
/* The same five stages as icon tiles, for the pipeline KPI row (§7). */
/* "Under review" takes the scales rather than the check-badge: a badge with a
   tick in it is what "Approved" looks like, and the two sat side by side. */
const ST_ICON = {
  'Identified':['tag','n'], 'Under review':['scale','warn'], 'Approved':['check','pos'],
  'In progress':['forecast','info'], 'Implemented':['savings','pos']
};
const riskBadge = s => badge(s, s==='High'?'crit':s==='Medium'?'high':'ok');

/* A row list, clipped to five with a control that opens the rest (§7).
   Uniform box heights do not require the content to STRETCH, they require the
   lists to be the same length -- so a nine-row list and a five-row list beside
   each other both show five, and the taller one offers the remainder:
   "we can display the top five items and provide a Show All button that expands
   the box to reveal more.  This approach maintains uniformity."
   Opening one grows its whole grid row, which is the honest behaviour -- the
   boxes stay uniform, they just get taller together.
   `noun` only names the thing in the button, so it can be plural and plain. */
const ROW_CLIP = 5;
function rowList(rows, noun='rows'){
  const clip = rows.length > ROW_CLIP;
  return `<div class="rows${clip?' clip':''}">${rows.join('')}${clip
    ? `<button class="rows-more" type="button" data-total="${rows.length}" data-noun="${noun}"
        >Show all ${rows.length} ${noun}</button>` : ''}</div>`;
}

const meter = (p,tone='') => `<div class="meter ${tone}"><i style="width:${Math.max(0,Math.min(100,p))}%"></i></div>`;
const utilCell = p => `<div class="util">${meter(p, p<60?'bad':p<80?'warn':'good')}<span class="meter-val">${p}%</span></div>`;

/* Data table (§6): hairline dividers, right-aligned tabular figures, a status
   chip where relevant.  No row hover — these rows are not clickable, and a
   highlight on an inert row promises an interaction that is not there.  Where a
   table IS interactive it opts in with .tbl-live.

   ONE SORT-AND-FILTER CONTROL PER COLUMN, on the column's own header: "I need a
   unified sort and filter for each column… sort ascending, sort descending, sort
   A to Z, sort Z to A depending on the column's content, and the filters as
   well."  The previous round's single table-level popover held all of that, but
   it held it somewhere other than the column — so narrowing one column meant
   opening a menu and picking that column's name out of a list of column names.
   This function emits the header controls and the shell of the popover's home;
   everything they do — the sort wording, the multi-select, the value lists, the
   bands — lives in tablekit.js, which is delegated on `document` because a
   screen is re-rendered wholesale on every filter change.

   Both still work on the RENDERED cells rather than on the source data, which is
   the one design decision here worth defending.  A table is built from arrays of
   pre-formatted HTML strings by about forty call sites across the screens;
   threading a comparator, a filter key and a value vocabulary through all of them
   would have meant forty edits and forty chances to disagree with what the cell
   actually says.  Reading the cell means every table gets it at once and none of
   them can drift — the cost is that tablekit.js has to know that "$1.62M" is
   bigger than "$980K" and that Critical outranks High.

   THE HEADER IS THE CONTROL, and it costs no layout width.  The button is a
   transparent overlay on the whole cell and the only ink is a mark at its right
   edge, which shows on hover and stays lit while that column is sorted or
   filtered.  An icon that occupied real space in every header would widen every
   table by ~18px per column, and the notes above `thead th` in styles.css record
   that nine tables were one bad decision from a horizontal scrollbar at 1200px.
   `data-col` and `aria-sort` stay exactly as they were. */
let tblUid = 0;
/* A header may be given HTML ("This year,<br>actual"), and an aria-label may not
   contain any.  Tags out, entities escaped, quotes last so the attribute cannot
   be broken out of. */
const thLabel = t => String(t).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()
  .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/* ---- a table's DEFAULT ORDER (§6) ----
   "The same applies to tables."  Every table opens sorted highest-first on its own
   money column, without forty call sites having to say so.

   Which column?  The one whose cells are CURRENCY and whose absolute total is the
   largest.  Three simpler rules were tried on paper and each broke a real table:

     · first right-aligned column — chargeback's first is `Cloud`, so a table whose
       whole point is the chargeback total would have ranked by cloud spend.
     · last right-aligned column — the renewal calendar's last is `Utilisation`, and
       a renewals list ordered by utilisation percentage is ordered by nothing.
     · any numeric column — token economics measures nine different things in one
       `Value` column (1.42B tokens, 264, $51.40, 34.2%); sorting that is nonsense.

   "Largest currency total" lands on the total column wherever one exists, because a
   total is by definition bigger than its parts, and lands on the one money column
   when there is only one.  Requiring CURRENCY specifically is what keeps it away
   from the mixed-unit and percentage columns: a table with no money column is left
   in the order its screen authored, which is nearly always already meaningful.

   `o.order:'keep'` opts out, and three tables use it — the two that list unlike
   measures down one column, and the one whose rows are a pipeline in sequence.

   Reads the RENDERED cells through tkKey(), the same parser the header sort control
   uses.  That is deliberate and it is the same argument as tablekit's: the cell is
   the only thing that cannot disagree with itself, and it means the default order
   and the order you get from clicking the header are computed by one function.
   tkKey() lives in tablekit.js, which loads after this file — fine, because this
   runs during a render, and guarded anyway so the table still draws if it is not
   there.  totalRow is a separate argument and is appended after the sort, so it
   cannot be dragged up into the body. */
const TBL_CASH = /^[-+(−]?\s*\$/;
function tableOrder(cols, rows){
  if(typeof tkKey !== 'function' || rows.length < 3) return rows;
  const text = c => String(c).replace(/<[^>]*>/g,'').replace(/ /g,' ').trim();
  let best = -1, bestMass = 0;
  cols.forEach((c,i)=>{
    if(!c.r) return;                       /* money is right-aligned, by convention */
    const cells = rows.map(r=>text(r[i]));
    const cash = cells.filter(t=>TBL_CASH.test(t));
    if(cash.length < Math.ceil(cells.length*0.7)) return;
    const mass = sum(cells.map(t=>{ const k = tkKey(t); return k.kind==='num'?Math.abs(k.n):0; }));
    if(mass > bestMass){ bestMass = mass; best = i; }
  });
  if(best < 0) return rows;
  const key = r => { const k = tkKey(text(r[best])); return k.kind==='num' ? k.n : -Infinity; };
  return rows.map((r,i)=>({r,i,k:key(r)}))
    .sort((a,b)=> b.k - a.k || a.i - b.i)   /* stable: equal figures keep their order */
    .map(x=>x.r);
}

const table = (cols, rows, totalRow, o={}) => {
  if(rows.length===0)
    return emptyState('No Rows Match These Filters','Widen the period, or clear a filter in the bar above.');
  if(o.order !== 'keep') rows = tableOrder(cols, rows);
  const id = 'tb'+(++tblUid);
  /* Suppressed under TBL_TOOLS_MIN rows — see the note on the constant in
     tablekit.js for why the threshold moved from four to two. */
  const live = rows.length >= TBL_TOOLS_MIN;
  /* THE BUTTON CONTAINS THE LABEL — the shadcn/ui data-table header, which
     `reference/element-references.md` §7 names as this project's base for tables.
     Two earlier shapes were tried and both failed on the same point, which is
     where the hover state lives:

       · absolute mark in the cell's corner — moved from the right of a text
         column to the LEFT of a right-aligned one, and was hidden until hover.
       · full-cell overlay button — the wash then filled the whole <th>, and a
         <th> is as tall as the tallest header in its row.  Next to a header that
         wraps to two lines, a one-line header showed its label jammed at the top
         of a 44px grey band: "the header sits very close to the top, leaving a
         large gap at the bottom."

     A button sized to its own contents cannot have either fault.  The negative
     margin lets its hover background breathe 6px past the text without shifting
     the label off the column's own edge, which is the trick shadcn uses. */
  const head = cols.map((c,i)=>
    `<th class="${c.r?'r':''}" data-col="${i}">${live
      ? `<button class="th-b" type="button" data-tk-col="${i}"
                 aria-haspopup="true" aria-expanded="false"
                 aria-label="Sort and filter: ${thLabel(c.t)}"
           ><span class="th-t">${c.t}</span><i class="th-mk" aria-hidden="true"></i></button>`
      : `<span class="th-t">${c.t}</span>`}</th>`).join('');
  const body = rows.map(r=>`<tr>${r.map((c,i)=>
    `<td class="${cols[i].r?'r':''} ${cols[i].id?'id':''}">${c}</td>`).join('')}</tr>`).join('');
  /* A STATUS LINE, not a control.  It used to hold the "Sort & filter" button
     and reserved that button's height above every table whether or not anything
     was on.  With the control on the headers this row has nothing to offer until
     a condition exists, so it collapses to nothing and appears — carrying the
     row count and one Clear for the whole table — only once something is set. */
  const tools = live ? `<div class="tbl-tools">
      <span class="tbl-count" data-tk-count></span>
      <button class="tbl-clear" type="button" data-tk-clear>Clear all</button>
    </div>` : '';
  return `<div class="tbl" data-tbl="${id}">${tools}
    <div class="tbl-scroll"><table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}
    ${totalRow?`<tr class="total">${totalRow.map((c,i)=>`<td class="${cols[i].r?'r':''}">${c}</td>`).join('')}</tr>`:''}
    </tbody></table></div>
    <div class="tbl-none" hidden>Nothing in this table matches those conditions.
      <button class="btn sm" type="button" data-tk-clear>Clear the table filters</button>
    </div>
  </div>`;
};

/* A filter combination can legitimately select nothing.  "Nothing" must not
   look like "zero" (§7). */
/* Delegates to the state family in screens-onboarding.js, which knows the
   DIFFERENCE between the several ways a card can have nothing to show — filtered
   to nothing, source not connected, field missing, no history yet, not your role
   — and can offer the fix for each.  The signature is unchanged on purpose, so
   table() and the four chart builders that call this are untouched, and the
   guard keeps the mock-up rendering if that file is ever absent.

   IT PICKS THE CAUSE RATHER THAN ASSUMING ONE.  Every one of the ~40 call sites
   says `emptyState('Nothing To Rank', …)` and means "this card has no rows"; the
   old routing turned all of them into `filtered`, which is only true when a
   filter is set.  On a workspace that has closed no months it was false on every
   card at once: eight screens of "Nothing to rank" and "No data in this period"
   with no filter anywhere near them and no way forward — "when a certain thing is
   not connected, shouldn't we just gray out the tile and show them a quick option
   to show them how that should be connected?"
   So: a filter is live -> the filter did it, and the fix is to widen it.  No
   filter is live and nothing has closed -> the source did it, and the fix is to
   connect it.  The step is the first one THIS screen needs that is not done, so
   the card points at the thing standing between it and a figure rather than at
   the setup chain in general. */
function emptyState(title,body){
  if(typeof STATES==='undefined')
    return `<div class="empty"><b>${title}</b><p>${body}</p></div>`;
  const live = typeof liveFilters==='function' ? liveFilters().length : 0;
  if(live || typeof workspaceEmpty!=='function' || !workspaceEmpty())
    return STATES.empty({kind:'filtered',title,body});
  return STATES.empty({kind:'nosource', step:firstUnmetStep(), title,
    body:'No month has closed in this workspace yet, so there is nothing for this card to '
       + 'measure. It fills on its own once the feed behind it is connected and a first '
       + 'month closes.'});
}
/* Which connection this screen is actually waiting on.  ONB_NEEDS lists the
   steps a screen needs before its figures mean anything; the first unmet one is
   the next thing to do.  Falls back to the cost feeds, which every screen needs
   and which is step one for exactly that reason. */
function firstUnmetStep(){
  if(typeof ONB_NEEDS==='undefined' || typeof onbDone!=='function') return 1;
  const need = ONB_NEEDS[typeof current!=='undefined' ? current : ''] || [];
  return need.find(n=>!onbDone(n)) || need[0] || 1;
}

/* Entity cell (§2) — brand mark or colour swatch beside the name, so a row in
   a table is the same colour as its slice in the chart.  Colour follows the
   entity; a table is not exempt from that. */
const brandMark = name => {
  const key = brandKey(name);
  if(key && typeof BRANDS!=='undefined' && BRANDS[key])
    return `<svg class="bm" viewBox="0 0 24 24" aria-hidden="true">${BRANDS[key]}</svg>`;
  return `<span class="bm-l" aria-hidden="true">${(name||'?').replace(/[^A-Za-z]/g,'').slice(0,1).toUpperCase()}</span>`;
};
/* Use in a LIST or a LEGEND, where the rows are not all vendors.  The lettermark
   fallback above is right in a vendor table — every row there is a vendor, and an
   initial is an honest placeholder for one we have no artwork for.  In a mixed
   list it invents brands: "Logs", "Metrics", "Traces", "Retention & storage" and
   "All other vendors (26)" are not companies, and were rendering as tidy little
   L / M / T / R / A lettermark tiles as though they were. */
const entityMark = name => hasBrand(name)
  ? brandMark(name)
  : `<span class="bm-slot">${swatch(name)}</span>`;
const swatch = name => {
  const c = ec(name);
  return c?`<i class="swatch" style="background:var(${c})"></i>`:'';
};
/* Vendor name → brand-mark key.  Rebuilt from the active dataset (vendors and
   applications both declare `brand`), with a static table for the names that
   only ever appear inside a chart series or a hand-written row. */
const STATIC_BRAND = {
  'AWS':'aws','Amazon Web Services':'aws','Azure':'azure','Microsoft Azure':'azure',
  'Microsoft':'microsoft','Google Cloud':'googlecloud','Google':'google',
  'Grafana Labs':'grafana','Grafana':'grafana','OpenAI':'openai','Anthropic':'anthropic',
  'Atlassian':'atlassian','GitHub':'github','Figma':'figma','Perplexity':'perplexity',
  'Miro':'miro','Lucid':'lucid','AgileBits':'onepassword','Zoom':'zoom',
  'Azure OpenAI':'azure','Microsoft 365 Copilot':'microsoft','GitHub Copilot':'github',
  'Google Gemini':'google','Snowflake':'snowflake',
  /* Security and identity PRODUCTS, which appear by product name rather than by
     vendor name — they are Microsoft's, so they carry Microsoft's mark.  Without
     these four the security screen was the one place a recognisable vendor line
     rendered as a bare label. */
  'Microsoft Sentinel':'microsoft','Microsoft Purview':'microsoft',
  'Entra ID P2':'microsoft','Defender / endpoint':'microsoft'
};
let VENDOR_BRAND = {};
const brandKey = name => VENDOR_BRAND[name] || STATIC_BRAND[name] || null;
const hasBrand = name => !!(brandKey(name) && typeof BRANDS!=='undefined' && BRANDS[brandKey(name)]);

/* Donut legend (§6) — a real table: colour key · brand mark · name · value · %.
   Two faults were flagged here, both visible in the AI "Spend by provider" card.

   1. ALIGNMENT.  Every cell is a grid column now, so the figures line up down
      the list.  It used to be one flex row per item with the value pushed right
      by margin-left:auto, i.e. each value started wherever that row's name
      happened to end — ragged down seven rows of provider names.
   2. BRAND MARKS.  The slices in that card are OpenAI, Anthropic, Microsoft,
      Google… and the legend showed a coloured square and the name, no logo:
      "there are places, such as the spend by provider chart, where the brand
      logo should have been used but wasn't."  It carries both now — the square
      is the key back to the chart, the mark is recognition — and the mark column
      only exists when something in the list actually has one, so a legend of
      plain labels does not carry an empty gutter. */
const legend = (items,total,rows=true) => {
  /* The SAME comparator the donut uses (ranked(), charts.js).  Both are handed the
     same array by the same call site, so they only agree if they sort identically —
     sorting one of them alone would silently mislabel every slice. */
  items = ranked(items);
  const marks = rows && items.some(i=>hasBrand(i.k));
  return `<div class="legend ${rows?'rows':''}${marks?' marks':''}">${items.map((i,idx)=>`
    <div><i style="background:var(${i.g||ec(i.k)||RAMP[idx%8]})"></i>${
    marks?(hasBrand(i.k)?brandMark(i.k):'<span></span>'):''}<span class="lg-n">${i.k}</span><b>${moneyK(i.v)}</b>
    <b class="pct">${share(i.v,total)}</b></div>`).join('')}</div>`;
};
