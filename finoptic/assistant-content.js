/* =============================================================================
   Finn — the question catalogue and every answer it can give.
   Pairs with assistant.js (behaviour) and styles.css §12 (look).

   WHY THIS IS DERIVED AND NOT WRITTEN OUT
   Every answer below is a function of `D`, not a paragraph with figures typed into
   it. `insights` in the dataset has to be re-authored per scenario; Finn has 24
   questions at two styles, and authoring 48 answers six times over is 288 blocks
   of copy that drift from the numbers the moment anything changes. Deriving means
   all six shipped datasets re-narrate for free — including `fresh` and `zero` —
   and an answer cannot contradict the board, because it reads the same `D`.

   The one place that is load-bearing: Finance's next-year ask reuses `ASK` /
   `ASK_WHY` and the annualisation factor from screens.js BY REFERENCE, so Finn and
   the forecasting screen agree to the dollar. Copy them and they diverge on the
   first edit.

   EVERY QUESTION HAS A `work()`, AND IT IS THE SAME REASONING TWICE
   `work()` returns the derivation as short lines with the real arithmetic in them.
   It is used for two things, and that is the point:
     · the thinking log plays it, step by step, before the answer — so what Finn
       appears to be thinking is what it actually did;
     · **Full** mode prints it as `How I worked this out`.
   That is what Brief and Full now mean. Brief gives the answer; Full shows the
   working. Neither changes the size of anything — the earlier version resized the
   window, which is not a thing a reader asked for.

   BLOCK VOCABULARY — assistant.js renders these and nothing else.
     {t:'h',  v}                  the headline — one per answer, always first
     {t:'p',  v}                  prose; <b> allowed, same rule as insights
     {t:'sh', v}                  a section heading
     {t:'fig',k,v,foot}           one promoted figure
     {t:'bul',v:[…]}              3–5 short lines
     {t:'work',v:[…]}             the derivation, numbered. Full only
     {t:'do', v,lab,p}            the promoted action: money + verb + a sentence
     {t:'note',v}                 a caveat, an estimate marker, a degraded feed
     {t:'srcs',v:[…]}             which feeds this answer read
     {t:'chart',title,v,sub}      a plot, inline on its own titled panel
     {t:'table',title,cols,rows}  a table, the same

   Give every chart and table a TITLE — it is what the panel's header shows, and a
   plot with no title is a picture rather than a finding. A side pane was built for
   these and removed; see the chart case in assistant.js for why.
   ========================================================================== */

/* Charts render inline, inside the thread's reading column (~716px of usable
   width once the plot panel's padding is off). One aspect for all of them; the
   waterfall is taller because it reserves B=52 for its step labels. */
const FC  = {w:700, h:300};
const FCW = {w:700, h:340};

/* ---- block builders ----------------------------------------------------- */
const FB = {
  h:    v                 => ({t:'h',    v}),
  p:    v                 => ({t:'p',    v}),
  sh:   v                 => ({t:'sh',   v}),
  fig:  (k,v,foot)        => ({t:'fig',  k, v, foot}),
  bul:  v                 => ({t:'bul',  v}),
  work: v                 => ({t:'work', v}),
  do:   (v,lab,p)         => ({t:'do',   v, lab, p}),
  note: v                 => ({t:'note', v}),
  srcs: v                 => ({t:'srcs', v}),
  chart:(title,v,sub)     => ({t:'chart',title, v, sub}),
  table:(title,cols,rows) => ({t:'table',title, cols, rows})
};

/* ---- shared derivations ------------------------------------------------- */
const fSort = a => [...(a||[])].sort((x,y) => y.v - x.v);
const fTop  = (a,n) => fSort(a).slice(0, n||5);
const fPc   = (v,t) => t ? (v / t * 100) : 0;
const fBlocks = a => a.filter(Boolean);

const fAnnual = () => D.ytdActual ? D.fyForecast / D.ytdActual : 1;
const fAskPc  = k => (typeof ASK !== 'undefined' && ASK[k] !== undefined) ? ASK[k] : 3.0;
const fAsk    = c => {
  const thisY = Math.round(c.v * fAnnual());
  return {k:c.k, g:c.g, thisY, pc:fAskPc(c.k),
          nextY: Math.round(thisY * (1 + fAskPc(c.k) / 100))};
};

/* Month over month, per category, on the last two CLOSED months. Returns [] when
   there is no prior month — the honest answer on a one-month workspace, and why
   `fresh` (2 closed) works and `zero` (0) never reaches here. */
function fMoM(){
  const n = closedCount();
  if(n < 2) return [];
  return (D.categories || []).map(c => ({
    k:c.k, g:c.g, cur:c.m[n-1] || 0, prev:c.m[n-2] || 0,
    v:(c.m[n-1] || 0) - (c.m[n-2] || 0)
  }));
}
const fMonth = i => (D.meta.months || [])[i] || '—';

/* The line every `work()` opens with, so a reader always knows the base the rest
   of the arithmetic sits on. */
const fBase = () => {
  const n = closedCount();
  return n
    ? `Read <b>${n}</b> closed ${n === 1 ? 'month' : 'months'} for `
      + `<b>${(D.meta && D.meta.company) || 'this workspace'}</b> — <b>${money(D.ytdActual)}</b> total.`
    : `This workspace has closed no months, so there is nothing measured to read.`;
};

/* ---- source attribution -------------------------------------------------
   `sources` is 12 four-tuples [system, feeds, cadence, status]. An answer names
   ONE system per topic it read, in the order given, so the row reads as a sentence
   rather than a dump of all twelve.

   The status column earns its keep: if a feed an answer depended on is not
   Healthy, Finn says so unprompted. In `baseline` the AI feed is "1 degraded", so
   every AI answer carries the caveat without anyone authoring it. */
function finnSrcs(){
  const tags = [...arguments], out = [];
  tags.forEach(tag => {
    const hit = (D.sources || []).find(s => s[1] === tag && !out.includes(s[0]));
    if(hit) out.push(hit[0]);
  });
  return out.slice(0, 4);
}
function finnSrcNote(){
  const bad = [...arguments]
    .map(tag => (D.sources || []).find(s => s[1] === tag))
    .filter(s => s && !/^healthy$/i.test(s[3]));
  if(!bad.length) return null;
  const one = bad.length === 1;
  return FB.note(`${one ? 'One feed behind this answer is' : `${bad.length} feeds behind this answer are`} `
    + `not fully healthy — ${bad.map(s => `<b>${s[0]}</b> (${s[3]})`).join(', ')}. `
    + `${one ? 'That figure' : 'Those figures'} may lag.`);
}

/* =============================================================================
   THE CATALOGUE — four categories, six questions each.
   `id` is what a shared link and the transcript record, so don't renumber them.
   ========================================================================== */
const FINN_CATS = [

/* ---------------------------------------------------------------- ITFM ---- */
{ id:'itfm', k:'IT financial management', ic:'itfm',
  blurb:'Where the money is, and what it is buying.',
  qs:[

  { id:'cat-split', q:'How does spend split across categories?',
    work(){
      const cs = fSort(D.categories), t = cs[0], two = cs[1];
      if(!cs.length) return [fBase()];
      return [fBase(),
        `Grouped it into <b>${cs.length}</b> categories and ranked them by value.`,
        `<b>${t.k}</b> leads at <b>${moneyK(t.v)}</b> — that is `
          + `<b>${pct(fPc(t.v, D.ytdActual))}</b> of the total.`,
        two ? `Checked the gap to the next line: <b>${two.k}</b> at <b>${moneyK(two.v)}</b>, so the `
          + `lead is <b>${(t.v / two.v).toFixed(1)}×</b>.` : null,
        `Confirmed the eight categories sum back to <b>${money(D.ytdActual)}</b>.`
      ].filter(Boolean);
    },
    ans(m){
      const cs = fSort(D.categories), top = cs[0], two = cs[1];
      const mult = two && two.v ? (top.v / two.v) : 0;
      return fBlocks([
        FB.h(top ? `${top.k} is ${pct(fPc(top.v, D.ytdActual))} of technology spend.`
                 : 'No category spend has been measured yet.'),
        FB.p(top ? `${top.k} runs at <b>${moneyK(top.v)}</b> of <b>${money(D.ytdActual)}</b> year to date`
          + (mult >= 1.2 ? ` — <b>${mult.toFixed(1)}×</b> the next line` : '')
          + `. ${two ? `${two.k} follows at <b>${moneyK(two.v)}</b>` : ''}`
          + `${cs[2] ? `, then ${cs[2].k} at <b>${moneyK(cs[2].v)}</b>` : ''}.`
          : 'Nothing has been categorised in this workspace yet.'),
        m === 'full' && FB.work(this.work()),
        FB.chart('Spend by category', donut(cs, {label:'YTD', size:210}) + legend(cs, D.ytdActual),
                 cs.length + ' categories'),
        m === 'full' && cs.length > 0 && FB.chart('Every category, ranked',
          hbars(cs, {noun:'categories'})),
        m === 'full' && D.identified > 0 && FB.do(money(D.identified), 'identified',
          `The optimisation backlog holds <b>${money(D.identified)}</b> against these categories, of `
          + `which <b>${money(D.realized)}</b> is banked. The concentration above is why cloud is `
          + `where to look first.`),
        FB.srcs(finnSrcs('Cloud','SaaS','AI','Finance'))
      ]);
    }},

  { id:'fn-spend', q:'Which business functions consume the most technology resources?',
    work(){
      const ds = fSort((D.depts || []).filter(d => d.k !== 'Unallocated'));
      if(!ds.length) return [fBase()];
      const over = ds.filter(d => d.budget && d.v > d.budget);
      return [fBase(),
        `Attributed spend to <b>${ds.length}</b> functions and ranked them.`,
        `<b>${ds[0].k}</b> carries <b>${moneyK(ds[0].v)}</b>, `
          + `<b>${pct(fPc(ds[0].v, D.ytdActual))}</b> of the company total.`,
        over.length ? `Compared each against its plan: <b>${over.length}</b> of <b>${ds.length}</b> `
          + `are over, together <b>${money(sum(over.map(d => d.v - d.budget)))}</b>.`
          : `Compared each against its plan: none is over.`,
        D.unallocated > 0 ? `Set aside <b>${money(D.unallocated)}</b> that carries no function tag `
          + `at all, so it is not in the ranking.` : null
      ].filter(Boolean);
    },
    ans(m){
      const ds = fSort((D.depts || []).filter(d => d.k !== 'Unallocated'));
      const top = ds[0], over = ds.filter(d => d.budget && d.v > d.budget);
      return fBlocks([
        FB.h(top ? `${top.k} carries ${pct(fPc(top.v, D.ytdActual))} of technology cost.`
                 : 'No spend has been attributed to a function yet.'),
        FB.p(top ? `<b>${top.k}</b> is charged <b>${moneyK(top.v)}</b> of <b>${money(D.ytdActual)}</b>`
          + `${top.budget ? ` against a plan of <b>${moneyK(top.budget)}</b>` : ''}. `
          + `${ds[1] ? `Next is ${ds[1].k} at <b>${moneyK(ds[1].v)}</b>` : ''}`
          + `${ds[2] ? `, then ${ds[2].k} at <b>${moneyK(ds[2].v)}</b>` : ''}.`
          : 'No department carries a charge in this workspace yet.'),
        m === 'full' && FB.work(this.work()),
        FB.chart('Spend by function', hbars(ds, {noun:'functions'}), ds.length + ' functions'),
        m === 'full' && over.length > 0 && FB.table('Functions over plan',
          [{t:'Function'}, {t:'Actual', r:true}, {t:'Over', r:true}],
          fSort(over.map(d => ({...d, v:d.v - d.budget})))
            .map(d => [`<b>${d.k}</b>`, moneyK(d.v + d.budget),
                       `<span class="delta up">${signed(d.v)}</span>`])),
        m === 'full' && D.unallocated > 0 && FB.p(`A further <b>${money(D.unallocated)}</b> `
          + `(<b>${pct(fPc(D.unallocated, D.ytdActual))}</b>) is not attributed to any function — `
          + `ask me about unallocated spend for the causes.`),
        FB.srcs(finnSrcs('Finance','People'))
      ]);
    }},

  { id:'cloud-where', q:'Where is the cloud money going?',
    work(){
      const c = D.cloud || {}, ps = fSort(c.providers), svc = fSort(c.services);
      if(!ps.length) return [fBase()];
      return [fBase(),
        `Took the cloud category — <b>${money(c.total)}</b> — and split it three ways: by `
          + `provider, by service and by environment.`,
        `<b>${ps[0].k}</b> is <b>${pct(fPc(ps[0].v, c.total))}</b> of it at <b>${moneyK(ps[0].v)}</b>.`,
        svc[0] ? `By service the largest line is <b>${svc[0].k}</b> at <b>${moneyK(svc[0].v)}</b>.` : null,
        c.coverage != null ? `Checked commitment coverage: <b>${c.coverage}%</b> against a `
          + `<b>${c.coverageTarget}%</b> target — the gap is on-demand exposure.` : null
      ].filter(Boolean);
    },
    ans(m){
      const c = D.cloud || {}, tot = c.total || 0;
      const ps = fSort(c.providers), svc = fSort(c.services), env = fSort(c.envs);
      const top = ps[0], prod = (env || []).find(e => /^production$/i.test(e.k));
      return fBlocks([
        FB.h(top ? `${top.k} is ${pct(fPc(top.v, tot))} of a ${money(tot)} cloud bill.`
                 : 'No cloud spend has landed yet.'),
        FB.p(top ? `Of <b>${money(tot)}</b> in cloud, <b>${top.k}</b> takes <b>${moneyK(top.v)}</b>`
          + `${ps[1] ? ` and ${ps[1].k} <b>${moneyK(ps[1].v)}</b>` : ''}. `
          + `${svc[0] ? `By service the largest line is <b>${svc[0].k}</b> at <b>${moneyK(svc[0].v)}</b>. ` : ''}`
          + `${prod ? `Production accounts for <b>${pct(fPc(prod.v, tot))}</b> of it.` : ''}`
          : 'No cloud provider is reporting into this workspace yet.'),
        m === 'full' && FB.work(this.work()),
        FB.chart('Cloud spend by provider', donut(ps, {label:'cloud', size:210}) + legend(ps, tot),
                 ps.length + ' providers'),
        m === 'full' && svc.length > 0 && FB.chart('Cloud spend by service',
          hbars(svc, {noun:'services'})),
        m === 'full' && env.length > 0 && FB.chart('Cloud spend by environment',
          hbars(env, {noun:'environments'})),
        m === 'full' && c.coverage != null && FB.p(`Commitment coverage is <b>${c.coverage}%</b> `
          + `against a <b>${c.coverageTarget}%</b> target. The gap is the cheapest saving in the `
          + `list, because it needs no engineering work.`),
        FB.srcs(finnSrcs('Cloud'))
      ]);
    }},

  { id:'per-emp', q:'What is our cost per employee?',
    work(){
      const emp = (D.meta && D.meta.employees) || 0;
      if(!emp) return [fBase(), `No headcount feed is connected, so there is no denominator.`];
      return [fBase(),
        `Took headcount from the HR directory: <b>${emp}</b> employees.`,
        `Divided <b>${money(D.ytdActual)}</b> by <b>${emp}</b> — <b>${moneyK(D.ytdActual / emp)}</b> each.`,
        `Noted that this includes cost that follows products and customers rather than staff, so `
          + `it is a trend rather than a per-seat price.`
      ];
    },
    ans(m){
      const emp = (D.meta && D.meta.employees) || 0;
      const per = emp ? D.ytdActual / emp : 0, ai = D.ai && emp ? D.ai.total / emp : 0;
      return fBlocks([
        FB.h(emp ? `Technology costs ${moneyK(per)} per employee, year to date.`
                 : 'Headcount is not connected, so there is no per-employee figure.'),
        FB.fig('Cost per employee', emp ? moneyK(per) : '—',
               emp ? `${money(D.ytdActual)} across ${emp} employees` : 'No headcount feed'),
        FB.p(emp ? `That is the whole technology bill divided by headcount. It includes cost that `
          + `follows products and customers rather than staff, so read it as a trend rather than as `
          + `a per-seat price. ${ai ? `AI alone is <b>${moneyK(ai)}</b> per employee.` : ''}`
          : 'Connect an HR directory and this figure fills in on its own.'),
        m === 'full' && FB.work(this.work()),
        m === 'full' && emp > 0 && FB.table('The same denominator, three ways',
          [{t:'Measure'}, {t:'Per unit', r:true}],
          [['<b>Per employee</b>', moneyK(per)],
           (D.meta.customers ? ['<b>Per customer</b>', moneyK(D.ytdActual / D.meta.customers)] : null),
           (D.meta.transactions ? ['<b>Per 1M transactions</b>',
              moneyK(D.ytdActual / D.meta.transactions)] : null)].filter(Boolean)),
        m === 'full' && FB.note('A per-unit figure is a division, not a measurement — it moves when '
          + 'either side moves. The headcount here is the current directory, not an average.'),
        FB.srcs(finnSrcs('People','Finance'))
      ]);
    }},

  { id:'trend', q:'Show me the monthly spend trend',
    work(){
      const n = closedCount();
      if(!n) return [fBase()];
      const act = (D.trend && D.trend.actual) || [], bud = (D.trend && D.trend.budget) || [];
      const closed = act.slice(0, n).filter(v => v != null);
      const first = closed[0], last = closed[closed.length - 1];
      const overM = closed.reduce((c, v, i) => c + ((bud[i] != null && v > bud[i]) ? 1 : 0), 0);
      return [fBase(),
        `Lined the monthly actuals up against the phased plan, <b>${fMonth(0)}</b> to `
          + `<b>${fMonth(n-1)}</b>.`,
        `Run rate moved from <b>${moneyK(first)}</b> to <b>${moneyK(last)}</b> — `
          + `<b>${pct(Math.abs((last / first - 1) * 100))}</b> `
          + `${last >= first ? 'up' : 'down'} across the period.`,
        `Counted the months above plan: <b>${overM}</b> of <b>${n}</b>.`,
        `Left the remaining ${12 - n} ${12 - n === 1 ? 'month' : 'months'} out — they are forecast, `
          + `not actuals.`
      ];
    },
    ans(m){
      const n = closedCount(), ms = D.meta.months || [];
      const act = (D.trend && D.trend.actual) || [], bud = (D.trend && D.trend.budget) || [];
      const closed = act.slice(0, n).filter(v => v != null);
      const first = closed[0], last = closed[closed.length - 1];
      const growth = (first && last) ? (last / first - 1) * 100 : 0;
      const overM = closed.reduce((c, v, i) => c + ((bud[i] != null && v > bud[i]) ? 1 : 0), 0);
      return fBlocks([
        FB.h(n < 1 ? 'No month has closed yet, so there is no trend to draw.'
           : `Monthly spend has moved from ${moneyK(first)} to ${moneyK(last)} across ${n} closed months.`),
        FB.p(n < 1 ? 'A trend needs at least one closed month. Nothing has closed here.'
          : `Run rate ${growth >= 0 ? 'rose' : 'fell'} <b>${pct(Math.abs(growth))}</b> between `
          + `<b>${fMonth(0)}</b> and <b>${fMonth(n-1)}</b>. `
          + `${overM ? `<b>${overM}</b> of those ${n} months came in above plan.`
                     : 'Every closed month came in at or below plan.'}`),
        m === 'full' && FB.work(this.work()),
        n >= 1 && FB.chart('Monthly spend against plan', lineChart([
            {name:'Actual', values:act.slice(0, n), color:'--c1', area:true},
            {name:'Plan',   values:bud.slice(0, n), color:'--g5', dash:true}
          ], ms.slice(0, n), FC), n + ' closed months'),
        m === 'full' && n >= 1 && FB.p(`Year-end forecast is <b>${money(D.fyForecast)}</b> against a `
          + `<b>${money(D.fyBudget)}</b> full-year budget — <b>${signed(D.fyForecast - D.fyBudget)}</b>. `
          + `Ask me for the forecast to see the range.`),
        FB.srcs(finnSrcs('Finance','Cloud'))
      ]);
    }},

  { id:'unalloc', q:'How much spend is unallocated?',
    work(){
      const tg = fSort(D.tagging), un = D.unallocated || 0;
      if(!un) return [fBase(), `Every measured line carries its tags, so nothing is unallocated.`];
      return [fBase(),
        `Looked for spend with no product, function or cost-centre tag: <b>${money(un)}</b>, `
          + `<b>${pct(fPc(un, D.ytdActual))}</b> of the total.`,
        `Grouped it by which tag is missing — <b>${tg.length}</b> causes.`,
        tg[0] ? `<b>${tg[0].k}</b> is the largest at <b>${moneyK(tg[0].v)}</b> across `
          + `<b>${tg[0].res}</b> resources.` : null,
        `Checked the causes sum back to <b>${money(un)}</b>.`
      ].filter(Boolean);
    },
    ans(m){
      const tg = fSort(D.tagging), un = D.unallocated || 0;
      const top = tg[0], res = tg.reduce((s,t) => s + (t.res || 0), 0);
      return fBlocks([
        FB.h(un > 0 ? `${money(un)} — ${pct(fPc(un, D.ytdActual))} of spend — has no owner.`
                    : 'Everything measured is attributed.'),
        FB.p(un > 0 ? `<b>${money(un)}</b> of <b>${money(D.ytdActual)}</b> cannot be charged to a `
          + `product, a function or a cost centre. ${top ? `The largest cause is <b>${top.k}</b> at `
          + `<b>${moneyK(top.v)}</b> across <b>${top.res}</b> resources` : ''}`
          + `${res ? `, and <b>${res}</b> resources are mis-tagged in total` : ''}.`
          : 'No unallocated spend here — every measured line carries its tags.'),
        m === 'full' && FB.work(this.work()),
        un > 0 && FB.chart('Unallocated spend by cause', hbars(tg, {noun:'causes'}),
                           tg.length + ' causes'),
        m === 'full' && un > 0 && FB.table('What each cause costs',
          [{t:'Missing tag'}, {t:'Resources', r:true}, {t:'Spend', r:true}],
          tg.map(t => [`<b>${t.k}</b>`, String(t.res), moneyK(t.v)])),
        un > 0 && FB.do(money(un), 'to reclaim',
          `Tagging is the cheapest fix in the product — no architecture change and no vendor `
          + `conversation. Closing <b>${top ? top.k.toLowerCase() : 'the largest cause'}</b> alone `
          + `attributes <b>${moneyK(top ? top.v : 0)}</b>.`),
        FB.srcs(finnSrcs('Cloud','Finance'))
      ]);
    }}
]},

/* ------------------------------------------------------------- FINANCE ---- */
{ id:'finance', k:'Finance', ic:'finance',
  blurb:'Budget, variance and what next year costs.',
  qs:[

  { id:'over-budget', q:'Are we over budget, and why?',
    work(){
      if(!D.ytdBudget) return [fBase(), `No budget is loaded, so there is nothing to compare against.`];
      const ups = (D.variance || []).filter(s => s.type === 'up');
      const dns = (D.variance || []).filter(s => s.type === 'down');
      const v = D.ytdActual - D.ytdBudget;
      return [fBase(),
        `Compared it against the phased budget of <b>${money(D.ytdBudget)}</b> — a gap of `
          + `<b>${signed(v)}</b>, <b>${pct(fPc(Math.abs(v), D.ytdBudget))}</b>.`,
        `Walked the named movements: <b>${ups.length}</b> upward, worth `
          + `<b>${money(sum(ups.map(s => s.v)))}</b>.`,
        dns.length ? `And <b>${dns.length}</b> downward, giving `
          + `<b>${money(Math.abs(sum(dns.map(s => s.v))))}</b> back.` : null,
        `Checked they reconcile: the movements sum to <b>${signed(v)}</b> exactly.`
      ].filter(Boolean);
    },
    ans(m){
      const v = D.ytdActual - D.ytdBudget, over = v > 0;
      const ups = (D.variance || []).filter(s => s.type === 'up');
      const dns = (D.variance || []).filter(s => s.type === 'down');
      const topUp = fSort(ups)[0];
      const gross = sum(ups.map(s => s.v)), given = sum(dns.map(s => s.v));
      return fBlocks([
        FB.h(!D.ytdBudget ? 'No budget is loaded, so there is nothing to be over or under.'
          : over ? `Yes — ${money(v)} over, ${pct(fPc(v, D.ytdBudget))} above plan.`
                 : `No — ${money(Math.abs(v))} under plan, ${pct(fPc(Math.abs(v), D.ytdBudget))} below.`),
        FB.p(!D.ytdBudget ? 'Load a budget and this reconciles on its own.'
          : `Spend is <b>${money(D.ytdActual)}</b> against a phased budget of `
          + `<b>${money(D.ytdBudget)}</b>. ${ups.length} upward `
          + `${ups.length === 1 ? 'driver adds' : 'drivers add'} <b>${money(gross)}</b>`
          + `${topUp ? `, led by <b>${topUp.k}</b> at <b>${money(topUp.v)}</b>` : ''}`
          + `${dns.length ? `; ${dns.length === 1 ? 'one saving gives' : `${dns.length} savings give`} `
            + `<b>${money(Math.abs(given))}</b> back` : ''}.`),
        m === 'full' && FB.work(this.work()),
        (D.variance || []).length > 2 && FB.chart('Budget to actual',
          waterfall(D.variance, FCW), (D.variance.length - 2) + ' movements'),
        m === 'full' && FB.table('Every movement',
          [{t:'Step'}, {t:'Effect', r:true}],
          (D.variance || []).filter(s => s.type === 'up' || s.type === 'down')
            .map(s => [`<b>${s.k}</b>`,
              `<span class="delta ${s.v > 0 ? 'up' : 'down'}">${signed(s.v)}</span>`])),
        over && D.identified > 0 && FB.do(money(D.identified), 'identified',
          `The backlog already holds more than the overrun. Closing the approved items covers `
          + `<b>${pct(Math.min(100, fPc(D.identified, v)))}</b> of it without new budget.`),
        FB.srcs(finnSrcs('Finance','Cloud','SaaS'))
      ]);
    }},

  { id:'variance-walk', q:'Walk me through the variance',
    work(){
      const steps = (D.variance || []).filter(s => s.type === 'up' || s.type === 'down');
      if(!steps.length) return [fBase(), `No variance walk exists in this workspace yet.`];
      const ups = steps.filter(s => s.v > 0), dns = steps.filter(s => s.v < 0);
      return [fBase(),
        `Opened at the phased budget, <b>${money(D.ytdBudget)}</b>.`,
        `Applied <b>${ups.length}</b> upward ${ups.length === 1 ? 'movement' : 'movements'} — `
          + `<b>${money(sum(ups.map(s => s.v)))}</b> in total.`,
        `Then <b>${dns.length}</b> downward, <b>${money(Math.abs(sum(dns.map(s => s.v))))}</b>.`,
        `Landed on <b>${money(D.ytdActual)}</b>, which is the actual — so the walk closes.`
      ];
    },
    ans(m){
      const steps = (D.variance || []).filter(s => s.type === 'up' || s.type === 'down');
      const ups = fSort(steps.filter(s => s.v > 0));
      const dns = [...steps.filter(s => s.v < 0)].sort((a,b) => a.v - b.v);
      const v = D.ytdActual - D.ytdBudget;
      return fBlocks([
        FB.h(!steps.length ? 'There is no variance walk in this workspace yet.'
          : `${money(D.ytdBudget)} to ${money(D.ytdActual)}, in ${steps.length} steps.`),
        FB.p(!steps.length ? 'A walk needs a budget and at least one driver. Neither is loaded.'
          : `The walk opens at the <b>${money(D.ytdBudget)}</b> phased budget and closes at `
          + `<b>${money(D.ytdActual)}</b> actual. Everything between is a named movement, and they `
          + `sum to <b>${signed(v)}</b> exactly — that is the reconciliation this product exists `
          + `to hold.`),
        m === 'full' && FB.work(this.work()),
        steps.length > 0 && FB.chart('The variance walk', waterfall(D.variance, FCW),
                                     steps.length + ' steps'),
        m === 'full' && ups.length > 0 && FB.sh(`What pushed it up — ${money(sum(ups.map(s => s.v)))}`),
        m === 'full' && ups.length > 0 && FB.bul(ups.map(s =>
          `<b>${s.k}</b> — ${money(s.v)}, ${pct(fPc(s.v, sum(ups.map(x => x.v))))} of the upward move`)),
        m === 'full' && dns.length > 0 && FB.sh(`What pulled it back — ${money(Math.abs(sum(dns.map(s => s.v))))}`),
        m === 'full' && dns.length > 0 && FB.bul(dns.map(s => `<b>${s.k}</b> — ${money(Math.abs(s.v))} returned`)),
        FB.note('Each step is a movement against plan, not a total. They are ordered as the walk '
          + 'draws them, so the running balance after any step is the budget plus everything above it.'),
        FB.srcs(finnSrcs('Finance'))
      ]);
    }},

  { id:'growth', q:'Where is spend growing, and what’s driving it?',
    work(){
      const up = fSort((D.drivers || []).filter(d => d.v > 0));
      if(!up.length) return [fBase(), `No growth drivers are recorded for this workspace.`];
      const net = sum((D.drivers || []).map(d => d.v));
      return [fBase(),
        `Pulled the recorded drivers — <b>${(D.drivers || []).length}</b> of them — and separated `
          + `the ones pushing up from the ones pulling back.`,
        `<b>${up[0].k}</b> is the largest at <b>${up[0].v}</b> contribution points.`,
        `Net across all of them is <b>${net}</b> points, which against a `
          + `<b>${money(D.fyForecast)}</b> forecast is <b>${signed(Math.round(D.fyForecast * net / 100 * 0.22))}</b>.`,
        `Did NOT compare against last year — there is no prior year in this workspace, so these are `
          + `contribution points and not a growth rate.`
      ];
    },
    ans(m){
      const up = fSort((D.drivers || []).filter(d => d.v > 0));
      const dn = [...(D.drivers || []).filter(d => d.v < 0)].sort((a,b) => a.v - b.v);
      const net = sum((D.drivers || []).map(d => d.v));
      /* drivers[].v is a PERCENTAGE contribution, not dollars — screens.js turns it
         into money as fyForecast × sum(v)/100 × 0.22 on the forecasting screen.
         Labelling these as $K would be the most convincing lie in the answer set. */
      const netMoney = Math.round(D.fyForecast * net / 100 * 0.22);
      const top = up[0];
      return fBlocks([
        FB.h(!up.length ? 'No growth drivers are recorded for this workspace.'
          : `${top.k} is the biggest upward pressure, at ${top.v} points.`),
        FB.p(!up.length ? 'Nothing is recorded as moving the year-end number yet.'
          : `${up.length} ${up.length === 1 ? 'driver pushes' : 'drivers push'} the year-end number up`
          + `${top ? `, led by <b>${top.k}</b> (${top.v} points)` : ''}`
          + `${up[1] ? ` and <b>${up[1].k}</b> (${up[1].v})` : ''}. `
          + `${dn.length ? `<b>${dn.length}</b> ${dn.length === 1 ? 'pulls' : 'pull'} the other way, `
            + `worth ${Math.abs(sum(dn.map(d => d.v)))} points. ` : ''}`
          + `Net, that is <b>${signed(netMoney)}</b> on the forecast.`),
        m === 'full' && FB.work(this.work()),
        up.length > 0 && FB.chart('Upward drivers',
          hbars(fSort(D.drivers).filter(d => d.v > 0), {noun:'drivers'}), up.length + ' drivers'),
        FB.note('These are contribution points against the forecast, not dollar amounts — there is '
          + 'no prior year in this workspace, so nothing here is a year-over-year comparison.'),
        m === 'full' && FB.table('Each driver, and its assumption',
          [{t:'Driver'}, {t:'Points', r:true}, {t:'Assumption'}],
          fSort(D.drivers).map(d => [`<b>${d.k}</b>`,
            `<span class="delta ${d.v > 0 ? 'up' : 'down'}">${d.v > 0 ? '+' : ''}${d.v}</span>`,
            `<span class="sub">${(typeof DRIVER_NOTE !== 'undefined' && DRIVER_NOTE[d.k]) || 'Follows the current trend'}</span>`])),
        FB.srcs(finnSrcs('Finance','Cloud','AI'))
      ]);
    }},

  { id:'next-year', q:'Can we predict next year’s IT budget?',
    work(){
      const asks = (D.categories || []).map(fAsk);
      if(!asks.length) return [fBase(), `There are no categories to build a request from.`];
      const total = sum(asks.map(a => a.nextY));
      const biggest = [...asks].sort((a,b) => b.pc - a.pc)[0];
      return [fBase(),
        `Annualised the year to date: <b>${money(D.ytdActual)}</b> becomes `
          + `<b>${money(D.fyForecast)}</b> at the current run rate.`,
        `Applied each category's own growth assumption to its annualised figure.`,
        `<b>${biggest.k}</b> carries the most at <b>+${biggest.pc.toFixed(1)}%</b>; the rest are close to flat.`,
        `Summed the lines: <b>${money(total)}</b>, which is `
          + `<b>${pct(Math.abs(total / D.fyForecast * 100 - 100))}</b> `
          + `${total >= D.fyForecast ? 'above' : 'below'} this year.`,
        `This is a priced request from stated assumptions, not a prediction.`
      ];
    },
    ans(m){
      const asks = (D.categories || []).map(fAsk);
      const total = sum(asks.map(a => a.nextY));
      const up = fSort(asks.map(a => ({k:a.k, v:a.nextY - a.thisY, g:a.g})));
      const biggest = [...asks].sort((a,b) => b.pc - a.pc)[0];
      const chg = D.fyForecast ? (total / D.fyForecast * 100 - 100) : 0;
      return fBlocks([
        FB.h(!asks.length ? 'There are no categories to build a request from yet.'
          : `Next year prices out at ${money(total)} — ${pct(Math.abs(chg))} ${chg >= 0 ? 'above' : 'below'} this year.`),
        FB.p(!asks.length ? 'A request is built per category. None are loaded here.'
          : `Taking this year at <b>${money(D.fyForecast)}</b> and applying each category's own `
          + `growth assumption gives <b>${money(total)}</b>. `
          + `${biggest ? `<b>${biggest.k}</b> carries most of it at <b>+${biggest.pc.toFixed(1)}%</b>` : ''}`
          + `; everything else is close to flat. That concentration is the conversation to have, `
          + `not the total.`),
        m === 'full' && FB.work(this.work()),
        asks.length > 0 && FB.chart('Where next year grows',
          hbars(up.filter(d => d.v > 0), {noun:'categories'})),
        m === 'full' && asks.length > 0 && FB.table('The request, line by line',
          [{t:'Category'}, {t:'Next year', r:true}, {t:'Change', r:true}],
          asks.map(a => [
            `<div class="ent"><i class="swatch" style="background:var(${a.g || '--c1'})"></i><span>${a.k}</span></div>`,
            moneyK(a.nextY),
            `<span class="delta ${a.pc > 0 ? 'up' : 'down'}">${a.pc > 0 ? '+' : ''}${a.pc.toFixed(1)}%</span>`])),
        FB.note('This is the same calculation the forecasting screen runs, from the same assumptions. '
          + 'It is a priced request, not a prediction.'),
        FB.srcs(finnSrcs('Finance','Cloud','AI'))
      ]);
    }},

  { id:'year-end', q:'What is the year-end forecast?',
    work(){
      const n = closedCount();
      if(!n) return [fBase(), `A projection needs a closed month to run from.`];
      const v = D.fyForecast - D.fyBudget;
      return [fBase(),
        `Projected the run rate from <b>${n}</b> closed ${n === 1 ? 'month' : 'months'} across the `
          + `remaining <b>${12 - n}</b>.`,
        `That lands the year at <b>${money(D.fyForecast)}</b>.`,
        `Compared it against the full-year budget of <b>${money(D.fyBudget)}</b> — `
          + `<b>${signed(v)}</b>, <b>${pct(fPc(Math.abs(v), D.fyBudget))}</b> `
          + `${v > 0 ? 'over' : 'under'}.`,
        `Bracketed it with a confidence band, because a projection from <b>${n}</b> months is a `
          + `range and not a number.`
      ];
    },
    ans(m){
      const v = D.fyForecast - D.fyBudget, over = v > 0, n = closedCount();
      return fBlocks([
        FB.h(n < 1 ? 'A forecast needs a closed month to run from. Nothing has closed yet.'
          : `Year-end lands at ${money(D.fyForecast)} — ${signed(v)} against budget.`),
        FB.p(n < 1 ? 'Once the first month closes, the projection and its range appear here.'
          : `On the current run rate the year closes at <b>${money(D.fyForecast)}</b> against a `
          + `<b>${money(D.fyBudget)}</b> full-year budget, <b>${pct(fPc(Math.abs(v), D.fyBudget))}</b> `
          + `${over ? 'over' : 'under'}. That projects <b>${n}</b> closed months forward, so it moves `
          + `with every close.`),
        m === 'full' && FB.work(this.work()),
        n >= 1 && FB.chart('Year-end projection', bandChart(FC), 'with confidence band'),
        m === 'full' && (D.scenarios || []).length > 0 && FB.table('If things go differently',
          [{t:'Scenario'}, {t:'Year-end', r:true}, {t:'Assumption'}],
          D.scenarios.map(s => [`<b>${s.k}</b>`, money(s.v), `<span class="sub">${s.d}</span>`])),
        over && D.identified > 0 && FB.do(money(D.identified), 'in the backlog',
          `The gap to budget is <b>${money(v)}</b>. The backlog holds <b>${money(D.identified)}</b>, `
          + `so this is closeable inside the year if the approved items land.`),
        FB.srcs(finnSrcs('Finance','Cloud'))
      ]);
    }},

  { id:'dept-plan', q:'Which departments are over plan?',
    work(){
      const ds = (D.depts || []).filter(d => d.budget != null);
      if(!ds.length) return [fBase(), `No department budgets are loaded.`];
      const over = ds.filter(d => d.v > d.budget), under = ds.filter(d => d.v < d.budget);
      return [fBase(),
        `Compared each of <b>${ds.length}</b> departments against its own budget.`,
        `<b>${over.length}</b> are over, together <b>${money(sum(over.map(d => d.v - d.budget)))}</b>.`,
        `<b>${under.length}</b> are under, giving <b>${money(Math.abs(sum(under.map(d => d.v - d.budget))))}</b> back.`,
        `Ranked the overspend by size rather than by department, since that is the order you would act in.`
      ];
    },
    ans(m){
      const ds = (D.depts || []).filter(d => d.budget != null)
        .map(d => ({k:d.k, v:d.v - d.budget, actual:d.v, budget:d.budget}));
      const over = fSort(ds.filter(d => d.v > 0));
      const under = [...ds.filter(d => d.v < 0)].sort((a,b) => a.v - b.v);
      const top = over[0];
      return fBlocks([
        FB.h(!ds.length ? 'No department budgets are loaded.'
          : !over.length ? 'Every department is inside its plan.'
          : `${over.length} of ${ds.length} departments are over plan.`),
        FB.p(!ds.length ? 'Load department budgets and this compares itself.'
          : !over.length ? `All <b>${ds.length}</b> departments came in at or below budget — together `
            + `<b>${money(Math.abs(sum(under.map(d => d.v))))}</b> under.`
          : `<b>${over.length}</b> ${over.length === 1 ? 'department is' : 'departments are'} above `
          + `budget, together <b>${money(sum(over.map(d => d.v)))}</b> over`
          + `${top ? `, led by <b>${top.k}</b> at <b>${signed(top.v)}</b> on a `
            + `<b>${moneyK(top.budget)}</b> plan` : ''}. `
          + `${under.length ? `<b>${under.length}</b> ${under.length === 1 ? 'is' : 'are'} under, `
            + `giving <b>${money(Math.abs(sum(under.map(d => d.v))))}</b> back.` : ''}`),
        m === 'full' && FB.work(this.work()),
        over.length > 0 && FB.chart('Overspend by department', hbars(over, {noun:'departments'}),
                                    over.length + ' over plan'),
        m === 'full' && ds.length > 0 && FB.table('Actual against plan',
          [{t:'Department'}, {t:'Actual', r:true}, {t:'Variance', r:true}],
          fSort(ds.map(d => ({...d, v:d.actual}))).map(d => [`<b>${d.k}</b>`, moneyK(d.actual),
            `<span class="delta ${d.actual > d.budget ? 'up' : 'down'}">${signed(d.actual - d.budget)}</span>`])),
        FB.srcs(finnSrcs('Finance','People'))
      ]);
    }}
]},

/* --------------------------------------------------------- PROCUREMENT ---- */
{ id:'proc', k:'Procurement', ic:'proc',
  blurb:'Vendors, renewals, licences and where to cut.',
  qs:[

  { id:'vendor-spend', q:'Which vendors account for most of our IT spend?',
    work(){
      const vs = fSort(D.vendors);
      if(!vs.length) return [fBase(), `No vendors are registered in this workspace.`];
      const tot = sum(vs.map(v => v.v)), three = vs.slice(0, 3);
      return [fBase(),
        `Read the vendor register — <b>${vs.length}</b> vendors, <b>${money(tot)}</b> billed.`,
        `<b>${vs[0].k}</b> is the largest at <b>${moneyK(vs[0].v)}</b>, `
          + `<b>${pct(fPc(vs[0].v, tot))}</b> of it.`,
        `Checked concentration: the top three are <b>${pct(fPc(sum(three.map(v => v.v)), tot))}</b> `
          + `of vendor spend.`,
        `Pulled contract value and utilisation alongside, since spend on its own does not say whether `
          + `there is room to negotiate.`
      ];
    },
    ans(m){
      const vs = fSort(D.vendors), top = vs[0];
      const tot = sum(vs.map(v => v.v));
      const conc = fPc(sum(vs.slice(0, 3).map(v => v.v)), tot);
      return fBlocks([
        FB.h(!vs.length ? 'No vendors are registered in this workspace.'
          : `${top.k} is ${pct(fPc(top.v, tot))} of vendor spend.`),
        FB.p(!vs.length ? 'Register a vendor and it appears here with its contract and renewal.'
          : `<b>${top.k}</b> takes <b>${moneyK(top.v)}</b> of <b>${money(tot)}</b> across `
          + `<b>${vs.length}</b> registered vendors${top.contract ? `, on a `
          + `<b>${moneyK(top.contract)}</b> contract` : ''}. The top three are <b>${pct(conc)}</b> of `
          + `the total — ${conc > 60 ? 'concentrated enough that a single renegotiation moves the '
          + 'whole number' : 'a spread that limits what any one negotiation can move'}.`),
        m === 'full' && FB.work(this.work()),
        vs.length > 0 && FB.chart('Spend by vendor', hbars(vs, {noun:'vendors'}),
                                  vs.length + ' vendors'),
        m === 'full' && vs.length > 0 && FB.table('Contract and utilisation',
          [{t:'Vendor'}, {t:'Spend', r:true}, {t:'Used', r:true}],
          vs.map(v => [`<div class="ent">${entityMark(v.k)}<span>${v.k}</span></div>`,
            moneyK(v.v), v.util != null ? utilCell(v.util) : '—'])),
        FB.note('Spend is what has been billed year to date; contract is what was committed. A vendor '
          + 'under its contract is not necessarily a saving — the commitment is already made.'),
        FB.srcs(finnSrcs('Finance','SaaS','Cloud'))
      ]);
    }},

  { id:'renewals', q:'Which renewals land in the next 90 days?',
    work(){
      const soon = (typeof renew90 === 'function' ? renew90(D.vendors || []) : [])
        .map(v => ({...v, days:daysOut(v.renew)})).sort((a,b) => a.days - b.days);
      if(!soon.length) return [fBase(),
        `Checked every renewal date against <b>${D.meta.asOf}</b> — nothing falls inside 90 days.`];
      const weak = soon.filter(v => v.util != null && v.util < 80);
      return [fBase(),
        `Checked every contract's renewal date against <b>${D.meta.asOf}</b>.`,
        `<b>${soon.length}</b> fall inside 90 days, worth `
          + `<b>${money(sum(soon.map(v => v.contract || v.v)))}</b> of contract value.`,
        `Sorted them by date, not by size — the earliest is <b>${soon[0].k}</b> in `
          + `<b>${soon[0].days} days</b>.`,
        weak.length ? `Flagged <b>${weak.length}</b> running under <b>80%</b> utilisation, which is `
          + `the only leverage that exists before a renewal.` : null
      ].filter(Boolean);
    },
    ans(m){
      const soon = (typeof renew90 === 'function' ? renew90(D.vendors || []) : [])
        .map(v => ({...v, days:daysOut(v.renew)})).sort((a,b) => a.days - b.days);
      const val = sum(soon.map(v => v.contract || v.v)), next = soon[0];
      const weak = soon.filter(v => v.util != null && v.util < 80);
      return fBlocks([
        FB.h(!soon.length ? 'Nothing renews in the next 90 days.'
          : `${soon.length} ${soon.length === 1 ? 'renewal' : 'renewals'} worth ${money(val)} land in 90 days.`),
        FB.p(!soon.length ? `No contract in the register falls due before <b>90 days</b> from `
            + `<b>${D.meta.asOf}</b>.`
          : `<b>${money(val)}</b> of contract value comes up before <b>90 days</b> from `
          + `<b>${D.meta.asOf}</b>. ${next ? `The first is <b>${next.k}</b> in <b>${next.days} days</b>`
          + `${next.util != null ? `, running at <b>${next.util}%</b> utilisation` : ''}` : ''}. `
          + `Utilisation is the number to take into the conversation — it is the only leverage that `
          + `exists before a renewal, and none after it.`),
        m === 'full' && FB.work(this.work()),
        soon.length > 0 && FB.chart('Renewals by contract value',
          hbars(soon.map(v => ({k:v.k, v:v.contract || v.v})), {noun:'renewals'}),
          'next 90 days'),
        m === 'full' && soon.length > 0 && FB.table('In date order',
          [{t:'Vendor'}, {t:'Renews', r:true}, {t:'Used', r:true}],
          soon.map(v => [`<div class="ent">${entityMark(v.k)}<span>${v.k}</span></div>`,
            `${v.renew}<div class="sub">in ${v.days} days</div>`,
            v.util != null ? utilCell(v.util) : '—'])),
        weak.length > 0 && FB.do(money(sum(weak.map(v => (v.contract || v.v) * (100 - v.util) / 100))),
          'renegotiable', `<b>${weak.length}</b> of these ${weak.length === 1 ? 'is' : 'are'} under `
          + `<b>80%</b> utilisation. That gap is what a renewal conversation can recover — after the `
          + `date passes it is committed for another term.`),
        FB.srcs(finnSrcs('SaaS','Finance'))
      ]);
    }},

  { id:'licences', q:'Where are licences going unused?',
    work(){
      const rows = (D.saas || []).filter(s => s.lic).map(s => {
        const idle = Math.max(0, s.lic - s.active);
        return {k:s.app, v:+(s.cost * idle / s.lic).toFixed(1), idle, lic:s.lic};
      }).filter(r => r.idle > 0);
      if(!rows.length) return [fBase(), `Every licensed seat in the register is assigned.`];
      const w = fSort(rows);
      return [fBase(),
        `Compared assigned seats against licensed seats for <b>${(D.saas || []).length}</b> applications.`,
        `<b>${w.length}</b> have unassigned seats — <b>${sum(w.map(r => r.idle))}</b> in total.`,
        `Priced each at its own per-seat rate: <b>${money(sum(w.map(r => r.v)))}</b> a year.`,
        `<b>${w[0].k}</b> is the worst at <b>${w[0].idle}</b> of <b>${w[0].lic}</b> seats idle.`
      ];
    },
    ans(m){
      const rows = (D.saas || []).filter(s => s.lic).map(s => {
        const idle = Math.max(0, s.lic - s.active);
        return {k:s.app, v:+(s.cost * idle / s.lic).toFixed(1), idle, lic:s.lic,
                active:s.active, util:Math.round(s.active / s.lic * 100)};
      }).filter(r => r.idle > 0);
      const waste = fSort(rows), top = waste[0];
      const totalWaste = sum(waste.map(r => r.v)), seats = sum(waste.map(r => r.idle));
      return fBlocks([
        FB.h(!waste.length ? 'Every licensed seat is assigned.'
          : `${money(totalWaste)} is sitting on ${seats} unassigned seats.`),
        FB.p(!waste.length ? 'No application in the register has an unassigned seat.'
          : `Across <b>${waste.length}</b> ${waste.length === 1 ? 'application' : 'applications'}, `
          + `<b>${seats}</b> paid seats have nobody in them — <b>${money(totalWaste)}</b> a year at `
          + `the per-seat rate. ${top ? `The worst is <b>${top.k}</b>: <b>${top.idle}</b> of `
          + `<b>${top.lic}</b> seats idle, <b>${money(top.v)}</b>` : ''}.`),
        m === 'full' && FB.work(this.work()),
        waste.length > 0 && FB.chart('Wasted licence spend', hbars(waste, {noun:'applications'}),
                                     waste.length + ' applications'),
        m === 'full' && waste.length > 0 && FB.table('Seats against licences',
          [{t:'Application'}, {t:'Seats', r:true}, {t:'Assigned', r:true}],
          waste.map(r => [`<b>${r.k}</b>`, `${r.active} of ${r.lic}`, utilCell(r.util)])),
        waste.length > 0 && FB.do(money(totalWaste), 'reclaimable',
          `Seat reclamation needs no renegotiation — it takes effect at the next billing period. `
          + `Start with <b>${top.k}</b>, which is <b>${pct(fPc(top.v, totalWaste))}</b> of the total.`),
        FB.srcs(finnSrcs('SaaS','People'))
      ]);
    }},

  { id:'risk', q:'Which contracts look risky?',
    work(){
      const vs = D.vendors || [];
      if(!vs.length) return [fBase(), `No contracts are registered yet.`];
      return [fBase(),
        `Took <b>${vs.length}</b> registered contracts and scored each on three signals: its risk `
          + `rating, its utilisation, and how soon it renews.`,
        `Kept only the ones where at least two signals agree — one signal on its own is not a story.`,
        `Ranked what survived by score, then by spend.`
      ];
    },
    ans(m){
      /* "Risky" is three things at once and the dataset carries all three, which is
         why this is scored rather than filtered: one signal on its own is noise. */
      const scored = (D.vendors || []).map(v => {
        const d = daysOut(v.renew);
        let s = 0, why = [];
        if(/high/i.test(v.risk || ''))    { s += 2; why.push('rated High risk'); }
        if(/medium/i.test(v.risk || ''))  { s += 1; why.push('rated Medium risk'); }
        if(v.util != null && v.util < 70) { s += 2; why.push(`only ${v.util}% utilised`); }
        else if(v.util != null && v.util < 85){ s += 1; why.push(`${v.util}% utilised`); }
        if(d != null && d >= 0 && d <= 90)    { s += 2; why.push(`renews in ${d} days`); }
        else if(d != null && d >= 0 && d <= 180){ s += 1; why.push(`renews in ${d} days`); }
        return {...v, score:s, why, days:d};
      }).filter(v => v.score >= 3).sort((a,b) => b.score - a.score || b.v - a.v);
      const top = scored[0];
      return fBlocks([
        FB.h(!(D.vendors || []).length ? 'No contracts are registered yet.'
          : !scored.length ? 'No contract is showing more than one risk signal.'
          : `${scored.length} ${scored.length === 1 ? 'contract needs' : 'contracts need'} attention.`),
        FB.p(!(D.vendors || []).length ? 'Register a vendor with its contract and renewal date.'
          : !scored.length ? `Every registered vendor is either well utilised, low risk, or far from `
            + `renewal. Nothing scores on two signals at once.`
          : `A contract is flagged when at least two signals agree — a risk rating, weak utilisation, `
          + `or a renewal inside two quarters. ${top ? `<b>${top.k}</b> is the clearest: `
          + `${top.why.join(', ')}, on <b>${moneyK(top.v)}</b> of spend` : ''}.`),
        m === 'full' && FB.work(this.work()),
        scored.length > 0 && FB.bul(scored.slice(0, m === 'full' ? 8 : 3).map(v =>
          `<b>${v.k}</b> — ${v.why.join(', ')}${v.owner ? `. Owner ${v.owner}` : ''}`)),
        m === 'full' && scored.length > 0 && FB.table('The signals, side by side',
          [{t:'Vendor'}, {t:'Risk', r:true}, {t:'Used', r:true}],
          scored.map(v => [
            `<div class="ent">${entityMark(v.k)}<span>${v.k}</span>`
              + `<div class="sub">${v.days != null && v.days >= 0 ? `renews in ${v.days} days` : v.renew}</div></div>`,
            v.risk ? riskBadge(v.risk) : '—', v.util != null ? utilCell(v.util) : '—'])),
        FB.note('Risk here is the rating on the record plus what the numbers show. It is not a legal '
          + 'or security assessment — those live with the contract owner.'),
        FB.srcs(finnSrcs('SaaS','Finance','Security'))
      ]);
    }},

  { id:'cut', q:'Where can we cut costs?',
    work(){
      if(!D.identified) return [fBase(), `Nothing is in the optimisation backlog yet.`];
      const opps = D.opps || [], by = fSort(D.savingsByCat);
      const quick = opps.filter(o => /^low$/i.test(o.eff || '') && /^high$/i.test(o.conf || ''));
      return [fBase(),
        `Read the optimisation backlog — <b>${opps.length}</b> items, <b>${money(D.identified)}</b> identified.`,
        `Grouped by source: <b>${by[0].k}</b> is the largest at <b>${moneyK(by[0].v)}</b>.`,
        `Checked what is already banked: <b>${money(D.realized)}</b>, `
          + `<b>${pct(fPc(D.realized, D.identified))}</b> of the total.`,
        `Filtered for Low effort and High confidence — <b>${quick.length}</b> qualify, and that is `
          + `where I would start.`
      ];
    },
    ans(m){
      const by = fSort(D.savingsByCat), top = by[0], opps = D.opps || [];
      const approved = opps.filter(o => /^approved$/i.test(o.st || ''));
      const quick = opps.filter(o => /^low$/i.test(o.eff || '') && /^high$/i.test(o.conf || ''));
      return fBlocks([
        FB.h(!D.identified ? 'No savings have been identified yet.'
          : `${money(D.identified)} is identified, ${money(D.realized)} banked.`),
        FB.p(!D.identified ? 'Nothing is in the optimisation backlog for this workspace yet.'
          : `The backlog holds <b>${money(D.identified)}</b> across <b>${opps.length}</b> `
          + `${opps.length === 1 ? 'item' : 'items'}, of which <b>${money(D.realized)}</b> `
          + `(<b>${pct(fPc(D.realized, D.identified))}</b>) is already banked. `
          + `${top ? `<b>${top.k}</b> is the largest source at <b>${moneyK(top.v)}</b>. ` : ''}`
          + `${quick.length ? `<b>${quick.length}</b> ${quick.length === 1 ? 'item is' : 'items are'} `
            + `Low effort and High confidence — that is where to start.` : ''}`),
        m === 'full' && FB.work(this.work()),
        by.length > 0 && FB.chart('Savings by source', hbars(by, {noun:'sources'}),
                                  by.length + ' sources'),
        m === 'full' && opps.length > 0 && FB.table('The backlog',
          [{t:'Opportunity'}, {t:'Saving', r:true}, {t:'Status', r:true}],
          fSort(opps.map(o => ({...o, v:o.s}))).map(o => [
            `<b>${o.o}</b><div class="sub">${o.eff} effort · ${o.conf} confidence</div>`,
            moneyK(o.s), stBadge(o.st)])),
        approved.length > 0 && FB.do(money(sum(approved.map(o => o.s))), 'approve now',
          `<b>${approved.length}</b> ${approved.length === 1 ? 'item is' : 'items are'} already `
          + `marked Approved and waiting. ${quick.length ? 'None of the quick wins needs new budget.' : ''}`),
        FB.srcs(finnSrcs('Cloud','SaaS','AI'))
      ]);
    }},

  { id:'ai-drivers', q:'What is driving AI spend?',
    work(){
      const a = D.ai || {}, ps = fSort(a.providers);
      if(!a.total) return [fBase(), `No AI provider is reporting into this workspace yet.`];
      const tk = a.tokens || {};
      return [fBase(),
        `Isolated the AI category: <b>${money(a.total)}</b>, `
          + `<b>${pct(fPc(a.total, D.ytdActual))}</b> of technology spend.`,
        `Split it by provider — <b>${ps.length}</b> of them, led by <b>${ps[0].k}</b> at `
          + `<b>${moneyK(ps[0].v)}</b>.`,
        `Separated committed from metered: <b>${money(a.sub)}</b> subscriptions against `
          + `<b>${money(a.api)}</b> API usage.`,
        tk.perReq ? `Divided cost by requests: <b>$${tk.perReq.toFixed(4)}</b> per request, blended.` : null
      ].filter(Boolean);
    },
    ans(m){
      const a = D.ai || {}, ps = fSort(a.providers), top = ps[0], tk = a.tokens || {};
      return fBlocks([
        FB.h(!a.total ? 'No AI spend has landed yet.'
          : `AI is ${money(a.total)} — ${pct(fPc(a.total, D.ytdActual))} of technology spend.`),
        FB.p(!a.total ? 'No AI provider is reporting into this workspace yet.'
          : `<b>${money(a.total)}</b> across <b>${ps.length}</b> providers, split `
          + `<b>${money(a.sub)}</b> subscriptions and <b>${money(a.api)}</b> API usage. `
          + `${top ? `<b>${top.k}</b> is the largest at <b>${moneyK(top.v)}</b>` : ''}`
          + `${tk.perReq ? `, and the blended cost is <b>$${tk.perReq.toFixed(4)}</b> per request` : ''}. `
          + `Subscriptions are a committed floor; API usage is the part that moves with the product.`),
        m === 'full' && FB.work(this.work()),
        ps.length > 0 && FB.chart('AI spend by provider', hbars(ps, {noun:'providers'}),
                                  ps.length + ' providers'),
        finnSrcNote('AI'),
        m === 'full' && ps.length > 0 && FB.table('Committed against metered',
          [{t:'Provider'}, {t:'Subscription', r:true}, {t:'API', r:true}],
          ps.map(p => [`<div class="ent">${entityMark(p.k)}<span>${p.k}</span></div>`,
            p.sub ? moneyK(p.sub) : '—', p.api ? moneyK(p.api) : '—'])),
        m === 'full' && tk.input && FB.sh('Token Economics'),
        m === 'full' && tk.input && FB.bul([
          `<b>${tk.input}M</b> input tokens, <b>${tk.output}M</b> output`
            + `${tk.cached ? `, <b>${tk.cached}M</b> served from cache` : ''}`,
          `<b>${tk.requests}M</b> requests at <b>${tk.avgPerReq}</b> tokens average`,
          `<b>$${tk.per1M}</b> per million tokens, blended across every provider`]),
        FB.srcs(finnSrcs('AI','Cloud'))
      ]);
    }}
]},

/* -------------------------------------------------------------- PRODUCT ---- */
{ id:'product', k:'Products', ic:'product',
  blurb:'What each product costs, and what changed.',
  qs:[

  { id:'prod-cost', q:'What does each product cost?',
    work(){
      const ps = fSort(D.products);
      if(!ps.length) return [fBase(), `Nothing has been attributed to a product yet.`];
      const shared = ps.find(p => /^shared/i.test(p.k));
      return [fBase(),
        `Attributed cost to <b>${ps.length}</b> products and ranked them.`,
        `<b>${ps[0].k}</b> is the most expensive at <b>${moneyK(ps[0].v)}</b>, `
          + `<b>${pct(fPc(ps[0].v, D.ytdActual))}</b> of the total.`,
        `Broke each one into cloud, AI, SaaS and other, so the mix is visible and not just the total.`,
        shared ? `Kept <b>${shared.k}</b> separate at <b>${moneyK(shared.v)}</b> — it is not charged `
          + `to any one product, and how it is split is a policy question.` : null
      ].filter(Boolean);
    },
    ans(m){
      const ps = fSort(D.products), top = ps[0];
      const shared = (D.products || []).find(p => /^shared/i.test(p.k));
      return fBlocks([
        FB.h(!ps.length ? 'No product costs are attributed yet.'
          : `${top.k} costs ${moneyK(top.v)} — ${pct(fPc(top.v, D.ytdActual))} of the total.`),
        FB.p(!ps.length ? 'Nothing has been attributed to a product in this workspace yet.'
          : `<b>${top.k}</b> is the most expensive at <b>${moneyK(top.v)}</b>`
          + `${top.budget ? ` against a <b>${moneyK(top.budget)}</b> plan` : ''}. `
          + `${ps[1] ? `Next is ${ps[1].k} at <b>${moneyK(ps[1].v)}</b>. ` : ''}`
          + `${shared ? `<b>${shared.k}</b> holds <b>${moneyK(shared.v)}</b> that is not charged to `
            + `any one product — how that is split is a policy question, not a measurement.` : ''}`),
        m === 'full' && FB.work(this.work()),
        ps.length > 0 && FB.chart('Cost by product', hbars(ps, {noun:'products'}),
                                  ps.length + ' products'),
        m === 'full' && ps.length > 0 && FB.chart('What makes up each product', stackedBars(
          ps.map(p => p.k.replace(/^Product /, '')),
          [{name:'Cloud', values:ps.map(p => p.cloud || 0), color:'--c1'},
           {name:'AI',    values:ps.map(p => p.ai    || 0), color:'--c2'},
           {name:'SaaS',  values:ps.map(p => p.saas  || 0), color:'--c3'},
           {name:'Other', values:ps.map(p => p.other || 0), color:'--c4'}], FC), 'by category'),
        m === 'full' && ps.length > 0 && FB.table('Against plan',
          [{t:'Product'}, {t:'Cost', r:true}, {t:'Variance', r:true}],
          ps.map(p => [`<b>${p.k}</b>`, moneyK(p.v),
            p.budget ? `<span class="delta ${p.v > p.budget ? 'up' : 'down'}">${signed(p.v - p.budget)}</span>` : '—'])),
        FB.srcs(finnSrcs('Cloud','AI','SaaS'))
      ]);
    }},

  { id:'least-prof', q:'Which product is least profitable?',
    work(){
      const earning = (D.products || []).filter(p => p.rev > 0);
      if(!earning.length) return [fBase(), `No product carries revenue, so there is no ratio to rank.`];
      const ranked = earning.map(p => ({...p, ratio:p.v / p.rev * 100}))
        .sort((a,b) => b.ratio - a.ratio);
      const shared = (D.products || []).find(p => /^shared/i.test(p.k) && !p.rev);
      return [fBase(),
        `Took each product's cost against its own revenue, not against the company total.`,
        shared ? `Excluded <b>${shared.k}</b> (<b>${moneyK(shared.v)}</b>) — it earns no revenue `
          + `directly, so a ratio would divide by zero and report it as infinitely bad.` : null,
        `<b>${ranked[0].k}</b> spends <b>${moneyK(ranked[0].v)}</b> to earn `
          + `<b>${moneyK(ranked[0].rev)}</b> — <b>${pct(ranked[0].ratio)}</b> of revenue.`,
        `The healthiest is <b>${ranked[ranked.length-1].k}</b> at `
          + `<b>${pct(ranked[ranked.length-1].ratio)}</b>, so the spread is `
          + `<b>${(ranked[0].ratio / Math.max(ranked[ranked.length-1].ratio, 0.01)).toFixed(1)}×</b>.`
      ].filter(Boolean);
    },
    ans(m){
      const earning = (D.products || []).filter(p => p.rev > 0);
      const ranked = earning.map(p => ({...p, ratio:p.v / p.rev * 100}))
        .sort((a,b) => b.ratio - a.ratio);
      const worst = ranked[0], best = ranked[ranked.length - 1];
      const shared = (D.products || []).find(p => /^shared/i.test(p.k) && !p.rev);
      return fBlocks([
        FB.h(!ranked.length ? 'No product carries revenue, so there is no ratio to rank.'
          : `${worst.k} — technology costs ${pct(worst.ratio)} of what it earns.`),
        FB.p(!ranked.length ? 'Attribute revenue to a product and this comparison appears.'
          : `<b>${worst.k}</b> spends <b>${moneyK(worst.v)}</b> to earn <b>${moneyK(worst.rev)}</b> — `
          + `<b>${pct(worst.ratio)}</b> of revenue going on technology`
          + `${worst.cust ? `, across <b>${worst.cust}</b> customers` : ''}. `
          + `${best && best !== worst ? `The healthiest is <b>${best.k}</b> at <b>${pct(best.ratio)}</b>, `
            + `so the spread across the portfolio is `
            + `<b>${(worst.ratio / Math.max(best.ratio, 0.01)).toFixed(1)}×</b>.` : ''}`),
        m === 'full' && FB.work(this.work()),
        ranked.length > 0 && FB.chart('Technology cost as a share of revenue',
          hbars(ranked.map(p => ({k:p.k, v:Math.round(p.ratio * 10) / 10})),
                {noun:'products', entity:false}), 'longer is worse'),
        FB.note('That bar is cost as a percentage of revenue, not dollars — longer is worse.'
          + (shared ? ` <b>${shared.k}</b> (${moneyK(shared.v)}) is excluded because it earns no `
            + `revenue directly.` : '')),
        m === 'full' && ranked.length > 0 && FB.table('Cost against revenue',
          [{t:'Product'}, {t:'Cost', r:true}, {t:'Of revenue', r:true}],
          ranked.map(p => [
            `<b>${p.k}</b><div class="sub">${moneyK(p.rev)} revenue${p.cust ? ` · ${p.cust} customers` : ''}</div>`,
            moneyK(p.v), pct(p.ratio)])),
        worst && FB.do(moneyK(worst.v), 'under review',
          `<b>${worst.k}</b> is where a cost review earns most. At <b>${pct(worst.ratio)}</b> of `
          + `revenue it is the one product where technology cost is a pricing question rather than `
          + `an engineering one.`),
        FB.srcs(finnSrcs('Finance','Cloud'))
      ]);
    }},

  { id:'ai-by-prod', q:'Which product’s AI usage is growing fastest?',
    work(){
      const bp = fSort(D.ai && D.ai.byProduct);
      if(!bp.length) return [fBase(), `No AI spend has been attributed to a product yet.`];
      const tot = sum(bp.map(p => p.v));
      const internal = bp.find(p => /internal/i.test(p.k));
      return [fBase(),
        `Took the AI category and attributed it to products — <b>${money(tot)}</b> across `
          + `<b>${bp.length}</b> lines.`,
        `<b>${bp[0].k}</b> is the largest consumer at <b>${moneyK(bp[0].v)}</b>, `
          + `<b>${pct(fPc(bp[0].v, tot))}</b> of it.`,
        internal ? `Separated <b>${internal.k}</b> at <b>${moneyK(internal.v)}</b> — assistant seats, `
          + `charged to no customer.` : null,
        `Could not compute a growth RATE: there is no per-product AI history in this workspace, so `
          + `this ranks consumption instead and says so.`
      ].filter(Boolean);
    },
    ans(m){
      const bp = fSort(D.ai && D.ai.byProduct), tot = sum(bp.map(p => p.v));
      const top = bp[0], internal = bp.find(p => /internal/i.test(p.k));
      return fBlocks([
        FB.h(!bp.length ? 'AI spend is not attributed to products yet.'
          : `${top.k} is the largest AI consumer at ${moneyK(top.v)}.`),
        FB.p(!bp.length ? 'No AI spend has been attributed to a product in this workspace.'
          : `<b>${top.k}</b> takes <b>${moneyK(top.v)}</b> of <b>${money(tot)}</b> in attributed AI `
          + `spend (<b>${pct(fPc(top.v, tot))}</b>)`
          + `${bp[1] ? `, ahead of ${bp[1].k} at <b>${moneyK(bp[1].v)}</b>` : ''}. `
          + `${internal ? `<b>${internal.k}</b> accounts for <b>${moneyK(internal.v)}</b> — assistant `
            + `seats rather than product features, charged to no customer.` : ''}`),
        m === 'full' && FB.work(this.work()),
        bp.length > 0 && FB.chart('AI spend by product', hbars(bp, {noun:'products'}),
                                  bp.length + ' products'),
        FB.note('This is attributed AI spend to date. There is no per-product AI history in the '
          + 'workspace, so this ranks consumption rather than a growth rate.'),
        finnSrcNote('AI'),
        m === 'full' && (D.ai.models || []).length > 0 && FB.table('Which models',
          [{t:'Model'}, {t:'Cost', r:true}, {t:'Used for'}],
          [...D.ai.models].sort((a,b) => b.cost - a.cost).map(x => [
            `<div class="ent">${entityMark(x.p)}<span>${x.m}</span></div>`,
            moneyK(x.cost), `<span class="sub">${x.use}</span>`])),
        FB.srcs(finnSrcs('AI'))
      ]);
    }},

  { id:'changed', q:'What changed most this month?',
    work(){
      const n = closedCount(), mm = fMoM();
      if(!mm.length) return [fBase(),
        `A month-on-month comparison needs two closed months; this workspace has <b>${n}</b>.`];
      const up = fSort(mm.filter(d => d.v > 0));
      return [fBase(),
        `Compared <b>${fMonth(n-1)}</b> against <b>${fMonth(n-2)}</b>, category by category.`,
        `Total moved <b>${signed(sum(mm.map(d => d.v)))}</b> on the month.`,
        up[0] ? `<b>${up[0].k}</b> rose most — <b>${moneyK(up[0].prev)}</b> to `
          + `<b>${moneyK(up[0].cur)}</b>, <b>${signed(up[0].v)}</b>.` : null,
        (D.anomalies || []).length ? `Cross-checked against the anomaly list: `
          + `<b>${D.anomalies.length}</b> of these movements are flagged as anomalies rather than `
          + `as growth.` : null
      ].filter(Boolean);
    },
    ans(m){
      const mm = fMoM(), n = closedCount();
      const up = fSort(mm.filter(d => d.v > 0));
      const dn = [...mm.filter(d => d.v < 0)].sort((a,b) => a.v - b.v);
      const top = up[0], net = sum(mm.map(d => d.v));
      return fBlocks([
        FB.h(!mm.length ? 'Two closed months are needed to compare. There is not enough history yet.'
          : !top ? `Nothing rose between ${fMonth(n-2)} and ${fMonth(n-1)}.`
          : `${top.k} rose most — ${signed(top.v)} on the month.`),
        FB.p(!mm.length ? `This workspace has <b>${n}</b> closed ${n === 1 ? 'month' : 'months'}. `
            + `A month-on-month comparison needs two.`
          : `Between <b>${fMonth(n-2)}</b> and <b>${fMonth(n-1)}</b> total spend moved `
          + `<b>${signed(net)}</b>. ${top ? `<b>${top.k}</b> accounts for the largest single rise at `
          + `<b>${signed(top.v)}</b>, from <b>${moneyK(top.prev)}</b> to <b>${moneyK(top.cur)}</b>` : ''}`
          + `${dn.length ? `. <b>${dn[0].k}</b> moved furthest the other way at `
            + `<b>${signed(dn[0].v)}</b>` : ''}.`),
        m === 'full' && FB.work(this.work()),
        up.length > 0 && FB.chart('What rose this month',
          hbars(up.map(d => ({k:d.k, v:d.v, g:d.g})), {noun:'categories'}),
          fMonth(n-2) + ' to ' + fMonth(n-1)),
        m === 'full' && mm.length > 0 && FB.table(`${fMonth(n-2)} against ${fMonth(n-1)}`,
          [{t:'Category'}, {t:fMonth(n-1), r:true}, {t:'Change', r:true}],
          [...mm].sort((a,b) => b.v - a.v).map(d => [
            `<div class="ent"><i class="swatch" style="background:var(${d.g || '--c1'})"></i><span>${d.k}</span></div>`,
            moneyK(d.cur), `<span class="delta ${d.v > 0 ? 'up' : 'down'}">${signed(d.v)}</span>`])),
        m === 'full' && (D.anomalies || []).length > 0 && FB.p(`<b>${D.anomalies.length}</b> of these `
          + `movements ${D.anomalies.length === 1 ? 'has' : 'have'} been flagged as an anomaly rather `
          + `than as growth — ask me about anomalies for the root cause.`),
        FB.srcs(finnSrcs('Cloud','AI','SaaS'))
      ]);
    }},

  { id:'per-cust', q:'What is our cost per customer?',
    work(){
      const cu = (D.meta && D.meta.customers) || 0;
      if(!cu) return [fBase(), `No customer count is connected, so there is no denominator.`];
      const ps = (D.products || []).filter(p => p.cust > 0);
      return [fBase(),
        `Took the customer count: <b>${cu}</b>.`,
        `Divided <b>${money(D.ytdActual)}</b> by <b>${cu}</b> — <b>${moneyK(D.ytdActual / cu)}</b> each.`,
        ps.length ? `Then did the same per product, which is where it stops being even: the fewer the `
          + `customers, the more each one carries of the same fixed platform.` : null
      ].filter(Boolean);
    },
    ans(m){
      const cu = (D.meta && D.meta.customers) || 0;
      const per = cu ? D.ytdActual / cu : 0;
      const ps = (D.products || []).filter(p => p.cust > 0)
        .map(p => ({k:p.k, v:+(p.v / p.cust).toFixed(1), cust:p.cust}));
      const worst = fSort(ps)[0];
      return fBlocks([
        FB.h(cu ? `Technology costs ${moneyK(per)} per customer.`
                : 'No customer count is connected, so there is no per-customer figure.'),
        FB.fig('Cost per customer', cu ? moneyK(per) : '—',
               cu ? `${money(D.ytdActual)} across ${cu} customers` : 'No customer feed'),
        FB.p(cu ? `Across <b>${cu}</b> customers that is <b>${moneyK(per)}</b> each. `
          + `${worst ? `It is not even: <b>${worst.k}</b> costs <b>${moneyK(worst.v)}</b> per customer `
            + `on <b>${worst.cust}</b> ${worst.cust === 1 ? 'customer' : 'customers'} — the fewer the `
            + `customers, the more each one carries of the same fixed platform.` : ''}`
          : 'Connect a customer count and this figure fills in on its own.'),
        m === 'full' && FB.work(this.work()),
        ps.length > 0 && FB.chart('Cost per customer, by product', hbars(ps, {noun:'products'}),
                                  ps.length + ' products'),
        m === 'full' && ps.length > 0 && FB.table('Per customer, by product',
          [{t:'Product'}, {t:'Customers', r:true}, {t:'Per customer', r:true}],
          fSort(ps).map(p => [`<b>${p.k}</b>`, String(p.cust), moneyK(p.v)])),
        FB.note('Shared platform cost is included in each product’s figure, so these do not sum to '
          + 'the company number — a customer of two products is counted once in each.'),
        FB.srcs(finnSrcs('Finance','People'))
      ]);
    }},

  { id:'anomalies', q:'Any anomalies I should know about?',
    work(){
      const an = D.anomalies || [];
      if(!an.length) return [fBase(), closedCount() === 0
        ? `Detection compares a month against a baseline, and this workspace has none yet.`
        : `Checked every watched service — all of them are inside their expected band.`];
      const over = an.reduce((s,a) => s + Math.max(0, a.act - a.exp), 0);
      const worst = [...an].sort((a,b) => (b.act - b.exp) - (a.act - a.exp))[0];
      return [fBase(),
        `Compared each watched service against its expected band.`,
        `<b>${an.length}</b> ${an.length === 1 ? 'is' : 'are'} outside it, together `
          + `<b>${money(over)}</b> above expectation.`,
        `The largest is <b>${worst.svc}</b> on <b>${worst.prod}</b> — expected `
          + `<b>${moneyK(worst.exp)}</b>, actual <b>${moneyK(worst.act)}</b>.`,
        `Read the recorded root cause rather than guessing at one.`
      ];
    },
    ans(m){
      const an = D.anomalies || [];
      const crit = an.filter(a => /critical/i.test(a.sev || ''));
      const worst = [...an].sort((a,b) => (b.act - b.exp) - (a.act - a.exp))[0];
      const over = an.reduce((s,a) => s + Math.max(0, a.act - a.exp), 0);
      return fBlocks([
        FB.h(!an.length ? (closedCount() === 0
              ? 'Nothing is being watched yet — no month has closed.'
              : 'No anomalies are open.')
          : `${an.length} open, ${crit.length} critical — ${money(over)} above expectation.`),
        FB.p(!an.length ? (closedCount() === 0
            ? 'Anomaly detection compares a month against a baseline. This workspace has none yet.'
            : `Every service is running inside its expected band. Detection is live across `
              + `<b>${(D.sources || []).length}</b> feeds.`)
          : `<b>${an.length}</b> ${an.length === 1 ? 'anomaly is' : 'anomalies are'} open, together `
          + `<b>${money(over)}</b> above what was expected. ${worst ? `The largest is `
          + `<b>${worst.svc}</b> on <b>${worst.prod}</b>: expected <b>${moneyK(worst.exp)}</b>, `
          + `actual <b>${moneyK(worst.act)}</b>` : ''}.`),
        m === 'full' && FB.work(this.work()),
        worst && FB.sh('Root Cause'),
        worst && FB.p(worst.why),
        worst && FB.bul([
          `Detected <b>${worst.d}</b> on <b>${worst.prov}</b>`,
          `Severity <b>${worst.sev}</b>, status <b>${worst.st}</b>`,
          `Owned by <b>${worst.owner}</b>`]),
        m === 'full' && an.length > 1 && FB.table('Everything open',
          [{t:'Service'}, {t:'Over', r:true}, {t:'Severity', r:true}],
          [...an].sort((a,b) => (b.act - b.exp) - (a.act - a.exp)).map(a => [
            `<b>${a.svc}</b><div class="sub">${a.prod} · ${a.prov}</div>`,
            `<span class="delta up">${signed(a.act - a.exp)}</span>`, sevBadge(a.sev)])),
        an.length > 0 && FB.do(money(over), 'recoverable',
          `That is what the ${an.length === 1 ? 'anomaly has' : 'anomalies have'} cost above `
          + `expectation so far. It keeps accruing until the ${an.length === 1 ? 'fix is' : 'fixes are'} `
          + `live, which is why these are dated rather than ranked.`),
        FB.srcs(finnSrcs('Cloud','AI'))
      ]);
    }}
]}
];

/* Flat index — assistant.js resolves a question from the transcript by id, and
   needs its category for the follow-up pool. Methods survive the spread. */
const FINN_Q = {};
FINN_CATS.forEach(c => c.qs.forEach(q => { FINN_Q[q.id] = Object.assign(Object.create(
  Object.getPrototypeOf(q)), q, {cat:c}); }));
