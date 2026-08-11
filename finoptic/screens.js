/* ============================================================
   Finoptic — screens: head(), the controls row, and the 17 screen renderers
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
   Screens
   ============================================================ */
/* The controls row: filters on the left, the "as of" line and the two actions on
   the right.  It used to be a bar in the SHELL, above the content — which meant
   the first thing on any screen was a row of dropdowns and the screen's own
   headline came second.  It lives inside the screen now, below the title.
   Folding these controls into the headline row itself was the other option and
   was rejected as too crowded; they get their own row.
   Emitted per render, so the buttons are re-created every time — which is why
   Export and Share are handled by the delegated click listener rather than by a
   listener bound once at boot, and why the icons are inlined here rather than
   left to fillChrome(). */
const controlsRow = () => `<div class="controls">
  <div class="filters" id="filters"></div>
  <div class="controls-actions">
    <span class="asof" id="asof"></span>
    <span class="vsep" aria-hidden="true"></span>
    <button class="iconbtn tip" id="btn-export"
            data-tip="Export this view — CSV and JSON" aria-label="Export this view">${icon('export')}</button>
    <button class="iconbtn tip" id="btn-share"
            data-tip="Copy a link to this view" aria-label="Copy a link to this view">${icon('share')}</button>
  </div>
</div>`;

/* head() emits four things, in this order, which IS the fix to "the headline of
   each screen should be the first element visible":
     1. the page title — the first thing on the screen, setting the context
     2. the controls row, which pins to the top on scroll
     3. the reconciliation strip, which pins under the controls row
     4. the What/Why/Do insight band
   All four come from one function, so the order is right on all 17 screens
   without 17 separate edits.  The active screen is read from `current`, which
   go() sets before calling the renderer. */
/* The page head's right slot is a LABEL again, on every screen.
   The lens switch lived here for one round and went back to the sidebar rail it
   came from — "revert the persona dropdown change and move it back into the
   sidebar as it was before."  So `viewAs()` is gone and `renderNav()` owns the
   control again; what is left here is the flat `Persona · …` tag, which is what
   every other screen already had. */
/* `stats` is the reconciliation ticket's counterfoil, PASSED IN by the screen.
   Almost every one of those figures also appears as a KPI tile a few lines below,
   computed from a local in this renderer's own scope — so passing the same
   expression is what stops the strip and the tile from drifting apart.  Two or
   three entries, each `[label, value, sub, tone]`; omit it and the strip falls back
   to the estate-level three (see ledgerStrip). */
const head = (h1,p,tag,stats) => `<div class="pagehead"><div><h1>${h1}</h1><p>${p}</p></div>${
  tag?`<div class="persona-tag">${tag}</div>`:''}</div>`
  + controlsRow() + ledgerStrip(stats) + briefing(current);
const S = {};

/* ---------- 1. Executive Dashboard ---------- */
S.overview = () => {
  const prods = D.products.map(p=>({k:p.k,v:p.v}));
  /* Vendors come from the dataset now, with the long tail rolled into one
     neutral row — the list used to be hardcoded, so it contradicted the totals
     the moment a filter or a different scenario was applied. */
  const top = D.vendors.slice(0,8);
  const tail = D.ytdActual - sum(top.map(v=>v.v));
  /* `tail` pins this row to the bottom of the ranked list rather than letting it
     sort by value — see ranked() in charts.js.  It is a remainder, not a vendor. */
  const provs = top.concat(tail>0
    ? [{k:'All other vendors ('+Math.max(0,(D.meta.vendors||0)-top.length)+')',v:tail,tail:true}] : []);
  const lowEff = D.opps.filter(o=>o.eff==='Low');
  const oppSpendTotal = sum(D.opps.map(o=>o.spend));
  /* ---- round 14: four tiles, none of which restates a lane of the strip above ----
     Six of the eight tiles here WERE the strip, 200px lower and in a different unit:
     Actual, Budget, Variance, Forecast Year-End, Identified Savings and Unallocated
     all appear in ledgerStrip() on this screen.  "Repeating the same information
     adds no value."  What is left answers four different questions — an outcome, a
     unit cost, a proportion and a risk — and each carries the YTD byline and the
     month-on-month line the strip cannot show. */
  const Y = ytdView(), M = D.monthly||{};
  const emp = Math.max(1,D.meta.employees);
  const cpe = v => '$'+(v/emp).toFixed(1)+'K';
  const pctOf = (a,b) => b ? a/b*100 : 0;
  const techPct = pctOf(D.ytdActual, D.meta.revenue);
  /* A RATIO series, so it is a level rather than a running total: technology as a
     share of the revenue it supported IN each month.  Accumulating this one would
     draw a line to 300% — the trap `cumulative` exists to make explicit. */
  const revSeries = (D.trend.actual||[]).map((v,i)=>{
    const r = M.revenue && M.revenue[i];
    return (v==null || !r) ? null : pctOf(v,r);
  });
  return head('Executive Dashboard','Turn hidden tech waste into self-healing predictable business value.',
    (D.meta.company?D.meta.company+' · ':'')+D.meta.fy+' · '+D.meta.employees+' people')
  + `<div class="grid">
  ${kpi({k:'Realised Savings',v:money(D.realized),
    ytd:money(Y.realized)+' YTD',
    delta:(D.identified?Math.round(D.realized/D.identified*100):0)+'% of identified',dir:'gup',
    foot:'Banked so far this year',
    spark:M.realized,sparkOpts:{cumulative:true}})}
  ${kpi({k:'Cost Per Employee',v:cpe(D.ytdActual),
    ytd:cpe(Y.ytdActual)+' YTD',
    foot:D.meta.employees+' employees',
    spark:D.trend.actual,sparkOpts:{cumulative:true,fmt:cpe}})}
  ${kpi({k:'Technology As % Of Revenue',v:techPct.toFixed(1)+'%',
    ytd:pctOf(Y.ytdActual,Y.meta.revenue).toFixed(1)+'% YTD',
    delta:'target under 18%',dir:techPct<18?'gup':'up',
    foot:money(D.meta.revenue)+' revenue supported',
    spark:revSeries,sparkOpts:{fmt:v=>v.toFixed(1)+'%'}})}
  ${kpi({k:'Unexpected Spend',v:money(D.meta.unexpected),
    ytd:money(Y.meta.unexpected)+' YTD',
    delta:D.anomalies.length+(D.anomalies.length===1?' anomaly open':' anomalies open'),dir:D.meta.unexpected>0?'up':'flat',
    foot:'Above the expected run rate',
    spark:M.anomalyImpact,sparkOpts:{cumulative:true}})}

  ${card({span:8,title:'Technology Spend Trend',sub:'Actual against the phased plan, with the year-end projection',ic:'trendup',body:lineChart([
    {name:'Actual',values:D.trend.actual,color:'--c1',dots:true,area:true},
    {name:'Budget',values:D.trend.budget,color:NEUTRAL},
    {name:'Forecast',values:D.trend.forecast,color:'--c3',dash:true}
  ],D.meta.months),note:D.insights&&D.insights.overview?D.insights.overview.trendNote||'The gap between the line and the plan is the whole story of this year.':''})}

  ${card({span:4,title:'Spend Mix',ic:'tag',
    tabs:[['category','Category'],['provider','Cloud Provider']],
    body:tabPanes([
      ['category',donut(D.categories,{label:'YTD total'})+legend(D.categories,D.ytdActual)],
      ['provider',donut(D.cloud.providers,{label:'Cloud YTD'})+legend(D.cloud.providers,D.cloud.total)]
    ])})}

  ${card({span:4,title:'Spend By Vendor',sub:'Top 8, with the tail rolled up',ic:'proc',body:hbars(provs,{noun:'vendors'}),pad:false})}
  ${card({span:4,title:'Spend By Product',sub:'Including allocated shared cost',ic:'product',body:hbars(prods,{noun:'products'}),pad:false})}
  ${/* The sub-line is a figure, so it obeys the same rule the tiles and the
        strip do: on a workspace that has closed nothing there is no total to
        state, and "$0K identified" would be the last zero left standing. */''}
  ${card({span:4,title:'Savings By Source',sub:workspaceEmpty()?'':money(D.identified)+' identified',ic:'savings',tone:'pos',body:hbars(D.savingsByCat,{noun:'sources'}),pad:false})}

  ${/* order:'keep' -- the underlying opps[] rows are already authored descending
        by `s`, which is what "ranked by annual value" promises.  Adding a Spend
        column would otherwise steal the table's default sort: tableOrder() picks
        the largest-total CURRENCY column, and spend is always larger than the
        saving that comes out of it (SCHEMA.md invariant 20). */''}
  ${card({span:12,title:'Savings Opportunities',sub:'The backlog, ranked by annual value',ic:'savings',tone:'pos',pad:false,body:table(
    [{t:'Service'},{t:'Category'},{t:'Service Owner'},{t:'Effort'},{t:'Confidence'},{t:'Status'},
     {t:'Spend',r:true},{t:'Annual Saving Opportunity',r:true}],
    D.opps.slice(0,7).map(o=>[`<b>${o.o}</b>`,o.cat,personName(o.owner),o.eff,o.conf,stBadge(o.st),
      moneyK(o.spend),`<b>${moneyK(o.s)}</b><span class="sub"> · ${share(o.s,o.spend)}</span>`]),
    ['Full backlog · '+D.opps.length+' opportunities','','','','','',moneyK(oppSpendTotal),
     money(D.identified)+' · '+share(D.identified,oppSpendTotal)],
    {order:'keep'}),
    note:lowEff.length?`<b>${lowEff.length} of ${D.opps.length}</b> are low-effort. Clearing just those returns <b>${moneyK(sum(lowEff.map(o=>o.s)))}</b> without an engineering sprint.`:''})}

  </div>`;
};

/* ---------- 2. ITFM ---------- */
S.itfm = () => {
  /* The compute drill, the chargeback table and the unit-economics table all
     read from the dataset now.  They were the last three tables holding figures
     that stayed put when you switched scenario — internally consistent, but they
     visibly disagreed with the ledger the moment the numbers changed under them. */
  const R = D.resources || {path:[],unit:'Resource',rows:[]};
  const drill = R.path;
  const resTot = {count:sum(R.rows.map(r=>r.count)), prev:sum(R.rows.map(r=>r.prev)), cur:sum(R.rows.map(r=>r.cur))};
  const flagged = R.rows.find(r=>r.flag);
  const chargeback = D.products.map(p=>({
    bu:p.bu||'Unassigned', k:p.k,
    cells:[p.cloud, p.saas, p.ai, p.sec!=null?p.sec:0, p.shared!=null?p.shared:p.other],
    total:p.v
  }));
  const cbCol = i => sum(chargeback.map(r=>r.cells[i]));
  const cbTotal = sum(chargeback.map(r=>r.total));
  const alloc = D.ytdActual - D.unallocated;
  const Y = ytdView();
  return head('IT Financial Management','Cost transparency, allocation and unit economics for the whole technology estate.','Persona · ITFM',
    [['Unallocated Spend',money(D.unallocated),money(Y.unallocated)+' YTD','warn'],
     ['Optimisation Potential',money(D.identified),money(Y.identified)+' YTD','pos'],
     ['Realised Savings',money(D.realized),money(Y.realized)+' YTD','pos']])
  + `<div class="grid">
  ${/* Four tiles removed — Total IT Spend, Unallocated Spend, Optimisation Potential
        and Realised Savings are four of this screen's six strip lanes verbatim.
        Allocated Spend STAYS, and the line it sits on is worth stating: a
        COMPLEMENT is not a repeat.  `Unallocated $87K` and `Allocated 94.6%` are
        two different figures answering two different questions, where
        `Variance +$120K` and `Budget Variance +8.0%` were one figure in two units
        under the same name.  The rule the harness enforces is the same distinction:
        a tile fails on an identical figure or an identical label, not on being
        related to one.
        Forecast Accuracy stops being a hardcoded 94.2% here and reads
        meta.forecastAcc, so it finally moves with the scenario. */''}
  ${kpi({k:'Allocated Spend',v:share(D.ytdActual-D.unallocated,D.ytdActual),delta:'target 98%',dir:'flat',
    ytd:share(Y.ytdActual-Y.unallocated,Y.ytdActual)+' YTD',
    foot:money(D.ytdActual-D.unallocated)+' traced to an owner'})}
  ${kpi({k:'Forecast Accuracy',v:(D.meta.forecastAcc||0).toFixed(1)+'%',
    ytd:(Y.meta.forecastAcc||0).toFixed(1)+'% YTD',
    foot:'Rolling, against each month’s close',
    spark:(D.monthly||{}).forecastAcc,sparkOpts:{fmt:v=>v.toFixed(1)+'%',zero:false}})}
  ${kpi({k:'Cost Per Employee',v:'$'+(D.ytdActual/Math.max(1,D.meta.employees)).toFixed(1)+'K',
    ytd:'$'+(Y.ytdActual/Math.max(1,Y.meta.employees)).toFixed(1)+'K YTD',
    foot:D.meta.employees+' employees',
    spark:D.trend.actual,sparkOpts:{cumulative:true,fmt:v=>'$'+(v/Math.max(1,D.meta.employees)).toFixed(1)+'K'}})}
  ${kpi({k:'Cost Per Product',v:'$'+Math.round(sum(D.products.map(p=>p.v))/Math.max(1,D.products.length))+'K',
    ytd:'$'+Math.round(sum(Y.products.map(p=>p.v))/Math.max(1,Y.products.length))+'K YTD',
    foot:'Average of '+D.products.length+' cost objects',
    spark:D.trend.actual,sparkOpts:{cumulative:true,fmt:v=>'$'+Math.round(v/Math.max(1,D.products.length))+'K'}})}

  ${card({span:12,title:'Cost Breakdown',sub:'Drilled to the level where a decision gets made',body:`
    ${/* TEXT, not buttons — the last clickable-but-inert control in the mock-up,
          and it goes the same way the anomalies breadcrumb went.
          The difference from that one is worth recording: this path is authored
          per dataset and TRUTHFULLY describes the rows beneath it, so it was
          only inert rather than also wrong.  It still cannot be made to drill.
          The dataset holds one flat family list at the leaf and nothing at the
          levels above it: "Total technology" and "Cloud" have breakdowns
          elsewhere, "AWS" and "Product Alpha" have none at this grain, and
          "Compute" is the service the leaf already sits in.  A control where
          three of seven segments do something is worse than one where none do —
          it reads as broken rather than as a label.
          Filtering the board from each level was the other option and loses for
          the same reason: this screen offers period, product and category, so a
          provider or an environment segment would silently do nothing. */''}
    ${drill.length?`<div class="trail">${drill.map((d,i,ar)=>
      `${i?'<span class="trail-sep" aria-hidden="true">/</span>':''}<span${i===ar.length-1?' class="on"':''}>${d}</span>`).join('')}</div>`
      :/* An empty workspace has no drill to describe, and an empty .trail is a
          padded div holding nothing. */''}
    <div style="margin-top:14px">${table(
      [{t:titleCase(R.unit)},{t:'Instances',r:true},{t:'Avg CPU',r:true},{t:'Previous Month',r:true},{t:'Current Month',r:true},{t:'Change',r:true},{t:'Recommendation'}],
      R.rows.map(r=>{
        const ch = r.prev?(r.cur-r.prev)/r.prev*100:0;
        return [`<span class="id">${r.family}</span>`,String(r.count),
          `<span class="delta ${r.cpu<15?'gdown':'flat'}">${r.cpu}%</span>`,
          moneyK(r.prev),moneyK(r.cur),
          `<span class="delta ${ch>0?'up':ch<0?'down':'flat'}">${ch>0?'+':ch<0?'−':''}${Math.abs(ch).toFixed(1)}%</span>`,
          r.flag?`<b>${r.verdict}</b>`:`<span class="sub">${r.verdict}</span>`];
      }),
      [`Total · ${resTot.count} instances`,String(resTot.count),'—',moneyK(resTot.prev),moneyK(resTot.cur),
       `<span class="delta ${resTot.cur>resTot.prev?'up':'down'}">${resTot.prev?(resTot.cur>=resTot.prev?'+':'−')+Math.abs((resTot.cur-resTot.prev)/resTot.prev*100).toFixed(1)+'%':'—'}</span>`,''])}</div>`,
    note:flagged?`One row carries the story: <b>${flagged.family}</b> — ${flagged.count} at ${flagged.cpu}% average CPU costing <b>${moneyK(flagged.cur)} a month</b>. ${flagged.verdict}.`
      :'No row in this group is a candidate for action — utilisation is healthy across the family.'})}

  ${/* Column names matter here: the fifth column is the product-attributable
       share of Security, which is deliberately LESS than the Security category —
       central security tooling isn't chargeable to a product. The sixth is
       everything else in the estate (observability, ITSM, device management,
       other technology), so it is "Other tech", not "Shared". */''}
  ${card({span:12,title:'Showback And Chargeback',sub:'Every cost object, charged to the unit that owns it',pad:false,body:table(
    [{t:'Business Unit'},{t:'Product'},{t:'Cloud',r:true},{t:'SaaS',r:true},{t:'AI',r:true},{t:'Security',r:true},{t:'Other Tech',r:true},{t:'Chargeback Total',r:true}],
    chargeback.map(r=>[r.bu,`<div class="ent">${swatch(r.k)}<b>${r.k}</b></div>`,
      ...r.cells.map(v=>v?moneyK(v):'—'),`<b>${moneyK(r.total)}</b>`]),
    ['Allocated',chargeback.length+' cost objects',...[0,1,2,3,4].map(i=>moneyK(cbCol(i))),moneyK(cbTotal)]),
    note:(()=>{ const secCat = (D.categories.find(c=>/^Security/.test(c.k))||{v:0}).v;
      const central = secCat - cbCol(3);
      return `Allocated <b>${money(alloc)}</b> of <b>${money(D.ytdActual)}</b>; the remaining <b>${money(D.unallocated)}</b> cannot be charged back until tagging is fixed.`
        + (central>0?` The Security column is the product-attributable share — the other <b>${moneyK(central)}</b> is central tooling that no single product should carry.`:'');
    })()})}

  ${card({span:6,title:'Unit Economics',sub:'What a unit of the business costs to serve',pad:false,body:table(
    [{t:'Metric'},{t:'Basis'},{t:'Value',r:true},{t:'Vs Last Quarter',r:true}],
    (()=>{ const M = D.meta, per = (n,d) => d?n/d:0;
      /* A metric whose denominator the dataset doesn't carry is dropped, not
         shown with a guessed basis — "say what a number is" (§0.7). */
      const rows = [
        ['Cost per employee', M.employees, M.employees+' employees', '$'+per(D.ytdActual,M.employees).toFixed(1)+'K', 6.1],
        ['Cost per customer', M.customers, M.customers+' customers', '$'+per(D.ytdActual,M.customers).toFixed(1)+'K', -3.2],
        ['Cost per transaction', M.transactions, M.transactions+'M transactions', '$'+per(D.ytdActual*1000,M.transactions*1e6).toFixed(3), -8.1],
        ['Cost per API request', M.apiRequests, M.apiRequests+'M requests', '$'+per(D.ytdActual*1000,M.apiRequests*1e6).toFixed(4), -11.4],
        ['Cost per AI request', D.ai.tokens.requests, D.ai.tokens.requests+'M requests', '$'+D.ai.tokens.perReq.toFixed(4), 18.9],
        ['Cost per support ticket', D.itsm.tickets, D.itsm.tickets.toLocaleString()+' tickets', '$'+D.itsm.perTicket.toFixed(2), 4.2],
        ['Infra cost per product', D.products.length, D.products.length+' cost objects',
         '$'+Math.round(per(sum(D.products.map(p=>p.cloud)),D.products.filter(p=>p.cloud>0).length))+'K', 7.7]
      ].filter(r=>r[1]);
      return rows.map(r=>[r[0],`<span class="sub">${r[2]}</span>`,r[3],
        `<span class="delta ${r[4]>0?'up':'down'}">${r[4]>0?'+':'−'}${Math.abs(r[4])}%</span>`]);
    })(),
    /* order:'keep' — the Value column holds $32.4K, $17.90 and $0.0135, which are
       three different units in one column.  Ranking them descending would present
       cost per employee as larger than cost per API request, which is not a
       comparison anyone can make. */
    null, {order:'keep'}),
    note:'Per-transaction cost is falling while total spend rises — the platform is getting <b>more efficient per unit</b>, just used far more.'})}

  ${card({span:6,title:'Spend By Department',hint:'Actual vs budget',pad:false,body:table(
    [{t:'Department'},{t:'Budget',r:true},{t:'Actual',r:true},{t:'Variance',r:true},{t:'Utilisation',r:true}],
    D.depts.map(d=>[d.k,moneyK(d.budget),moneyK(d.v),
      `<span class="delta ${d.v>d.budget?'up':'down'}">${d.v>=d.budget?'+':'−'}${moneyK(Math.abs(d.v-d.budget))}</span>`,
      utilCell(Math.round(d.v/d.budget*100))]),
    ['Total',moneyK(sum(D.depts.map(d=>d.budget))),moneyK(sum(D.depts.map(d=>d.v))),
     `<span class="delta ${sum(D.depts.map(d=>d.v))>sum(D.depts.map(d=>d.budget))?'up':'down'}">${signed(sum(D.depts.map(d=>d.v))-sum(D.depts.map(d=>d.budget)))}</span>`,''])})}

  </div>`;
};

/* ---------- 3. Multi-cloud ---------- */
S.cloud = () => {
  /* Provider tiles, the stack and the resource list are all derived from
     D.cloud.providers rather than hardcoded, so a Provider filter genuinely
     narrows this screen instead of leaving three tiles contradicting the total. */
  const p = D.cloud.providers;
  const mo = D.meta.months.slice(0,D.meta.closed);
  const byProduct = D.products.filter(x=>x.cloud>0).map(x=>({k:x.k,v:x.cloud}));
  /* DERIVED FROM THE BACKLOG, not written here.  This was five hardcoded rows —
     the last table in the mock-up that did not follow the dataset — and the two
     workspaces built to be difficult are what made that indefensible: an empty
     workspace with no spend, no vendors and no opportunities was still reporting
     "Savings potential $78K", a figure worth 390% of its own cloud line, sitting
     in a row of em dashes.  A number that survives having its data taken away is
     not a number, it is a picture of one.
     D.opps is the same backlog the Optimisation hub ranks, filtered to the cloud
     line.  Two of the old columns go with the hardcoding — "Provider" and
     "Current monthly" are not in the schema, and inventing them per row is how
     the first version got here.  What the schema does carry, and the old table
     did not show, is the target date, which is the more useful column anyway:
     an opportunity with an owner and no date is a wish. */
  const optRows = D.opps.filter(o=>/cloud/i.test(o.cat));
  const optSav = sum(optRows.map(o=>o.s));
  const Y = ytdView();
  const YoptSav = sum(Y.opps.filter(o=>/cloud/i.test(o.cat)).map(o=>o.s));
  return head('Multi-Cloud Cost Management','Every cloud provider on one ledger — by service, environment and product.','Persona · ITFM',
    [['Commitment Coverage',D.cloud.coverage+'%','target '+D.cloud.coverageTarget+'%'],
     ['Forecast Year-End',moneyK(Math.round(D.cloud.total/Math.max(1,D.meta.closed)*12)),'at the current run-rate'],
     ['Savings Potential',moneyK(optSav),moneyK(YoptSav)+' YTD','pos']])
  + `<div class="grid">
  ${/* Commitment Coverage, Forecast Year-End and Savings Potential are removed —
        they are this screen's own three counterfoil stats, verbatim.  The provider
        tiles stay and are the best case for this feature on the board: each one
        already had a real monthly series in the dataset and was reporting it as a
        "latest $30K / month" footnote, which is one point of a twelve-point line. */''}
  ${kpi({k:'Total Cloud Spend',v:money(D.cloud.total),delta:share(D.cloud.total,D.ytdActual)+' of technology spend',dir:'flat',
    ytd:money(Y.cloud.total)+' YTD',foot:'Across '+p.length+' provider'+(p.length===1?'':'s'),
    spark:sumSeries(p.map(x=>x.m),null),sparkOpts:{cumulative:true}})}
  ${p.slice(0,3).map(x=>{
    const Yp = (Y.cloud.providers||[]).find(z=>z.k===x.k);
    return kpi({k:x.k,ic:'cloud',v:moneyK(x.v),
      delta:share(x.v,D.cloud.total)+' of cloud',dir:'flat',
      ytd:Yp?moneyK(Yp.v)+' YTD':'',
      spark:x.m,sparkOpts:{cumulative:true}});
  }).join('')}
  ${p.length<3?new Array(3-p.length).fill(kpi({k:'Providers In Scope',v:String(p.length),ic:'cloud',foot:'narrowed by the Provider filter'})).join(''):''}
  ${/* ROUND 15: `Environments` was the fifth tile, and the fifth tile is what put a
        widow on a second row — "when there are five tiles, the entire second row is
        empty, leaving only the fifth tile in that row."  It was also the weakest of
        the five: a structural count with no honest twelve-month history behind it,
        so it was the one tile in the row that could carry neither a trend nor a YTD
        byline.  The environment split is not lost — the By Environment donut two
        cards below is the whole of it, ranked and sized, which is more than a count
        of five ever said. */''}

  ${card({span:8,title:'Cloud Spend By Provider',sub:'Monthly, stacked',ic:'cloud',est:true,
    body:stackedBars(mo,p.map(x=>({name:x.k,values:x.m||[],color:ec(x.k)||'--c1'}))),
    note:p.length>1?'The stack is the whole cloud bill month by month — a provider\'s share is its band, not a separate chart.'
      :'One provider in scope. Clear the Provider filter to compare the estate.'})}
  ${card({span:4,title:'By Environment',ic:'layers',est:true,body:donut(D.cloud.envs,{label:'Cloud YTD'})+legend(D.cloud.envs,D.cloud.total)})}

  ${card({span:6,title:'By Service',ic:'obs',est:true,pad:false,body:hbars(D.cloud.services,{noun:'services'})})}
  ${card({span:6,title:'By Product',ic:'product',pad:false,body:hbars(byProduct,{noun:'products'}),
    note:'Cloud by product sums to <b>'+moneyK(sum(byProduct.map(x=>x.v)))+'</b> — every dollar traced to a product after allocation.'})}

  ${card({span:12,title:'Optimisation Opportunities',sub:'The cloud line of the savings backlog',ic:'savings',tone:'pos',pad:false,body:table(
    [{t:'Opportunity'},{t:'Effort'},{t:'Confidence'},{t:'Owner'},{t:'Target Date'},{t:'Status'},{t:'Annual Saving',r:true}],
    optRows.map(o=>[`<b>${o.o}</b>`,o.eff,o.conf,personName(o.owner),
      `<span class="id">${o.due}</span>`,stBadge(o.st),moneyK(o.s)]),
    optRows.length?[optRows.length+' opportunit'+(optRows.length===1?'y':'ies'),'','','','','',`<b>${moneyK(optSav)}</b>`]:null),
    note:optRows.length
      ? '<b>'+moneyK(optSav)+' a year</b> across '+optRows.length+' cloud opportunit'
        +(optRows.length===1?'y':'ies')+' — the same rows the Optimisation hub ranks against every other category.'
      : ''})}

  </div>`;
};

/* ---------- 4. AI FinOps ---------- */
S.ai = () => {
  const a=D.ai, mo=D.meta.months.slice(0,D.meta.closed);
  const mSeries = (a.m||[]).filter(v=>v!==null&&v!==undefined);
  const latest = mSeries[mSeries.length-1]||0, prev = mSeries[mSeries.length-2]||latest;
  const aiSave = sum(D.savingsByCat.filter(s=>/AI|Licence/i.test(s.k)).map(s=>s.v));
  const seats = sum(D.saas.filter(s=>s.cat==='AI').map(s=>s.lic));
  const active = sum(D.saas.filter(s=>s.cat==='AI').map(s=>s.active));
  /* Hoisted out of the KPI tile below so the counterfoil can state the same figure
     without recomputing it — the strip and the tile are one expression. */
  const aiIdle = sum(D.saas.filter(s=>s.cat==='AI').map(s=>(s.lic-s.active)/Math.max(1,s.lic)*s.cost*12));
  const Y = ytdView();
  return head('AI Cost Management','Seats and tokens in one view — who is paying for which model, and what it returns.','Persona · ITFM',
    [['Subscriptions',moneyK(a.sub),moneyK(Y.ai.sub)+' YTD'],
     ['API And Tokens',moneyK(a.api),moneyK(Y.ai.api)+' YTD'],
     ['Unused AI Licences',(seats-active)+' seats',moneyK(aiIdle)+' annual exposure','warn']])
  + `<div class="grid">
  ${/* Subscriptions, API And Tokens and Unused AI Licences are removed: all three
        are this screen's counterfoil.  "This Month" keeps its place because it is
        the one figure here that is NOT a year-to-date total — and it is now the
        tile whose sparkline explains it, since the line it sits on is the same
        series the figure is the last point of. */''}
  ${kpi({k:'Total AI Spend',v:money(a.total),delta:share(a.total,D.ytdActual)+' of technology spend',dir:'flat',
    ytd:money(Y.ai.total)+' YTD',foot:'Seats and tokens together',
    spark:a.m,sparkOpts:{cumulative:true}})}
  ${kpi({k:'This Month',v:moneyK(latest),delta:(latest>=prev?'+':'−')+Math.abs((latest-prev)/Math.max(1,prev)*100).toFixed(1)+'% MoM',dir:latest>=prev?'up':'down',
    ytd:money(Y.ai.total)+' YTD',foot:D.meta.months[mSeries.length-1],
    spark:a.m})}
  ${kpi({k:'AI Spend Per Employee',v:'$'+(a.total/Math.max(1,D.meta.employees)).toFixed(2)+'K',
    ytd:'$'+(Y.ai.total/Math.max(1,Y.meta.employees)).toFixed(2)+'K YTD',
    foot:D.meta.employees+' employees',
    spark:a.m,sparkOpts:{cumulative:true,fmt:v=>'$'+(v/Math.max(1,D.meta.employees)).toFixed(2)+'K'}})}
  ${/* ROUND 15: `Growth Over The Half Year` was the fifth tile and is the one the
        sparkline made redundant.  It printed +106.3% with "$16K → $33K" under it —
        a start point, an end point and the ratio between them, which is three ways
        of describing the shape that the line beside "This Month" now draws in full,
        month by month, on the same series.  A tile whose whole content is two
        points of a line drawn directly above it is the duplication round 14 was
        about, arriving from a new direction. */''}
  ${kpi({k:'Potential AI Savings',v:moneyK(aiSave),delta:share(aiSave,a.total)+' of AI spend',dir:'gup',
    ytd:moneyK(sum(Y.savingsByCat.filter(s=>/AI|Licence/i.test(s.k)).map(s=>s.v)))+' YTD',
    foot:'Seat and model consolidation',
    spark:(D.monthly||{}).aiSavings})}

  ${card({span:8,title:'AI Spend Trend',hint:'Subscription vs consumption',body:stackedBars(mo,[
    {name:'Subscriptions (seats)',values:[9,9,10,11,11,12,12,13,13,17,17],color:'--c3'},
    {name:'API / tokens',values:[4,5,5,6,5,7,6,8,7,15,16],color:'--c1'}
  ]),note:'Seat cost grows in steps as licences are bought. Token cost grows continuously — and doubled in May when Gamma\'s pipeline went live.'})}
  ${card({span:4,title:'Spend By Provider',body:donut(a.providers,{label:'AI YTD'})+legend(a.providers,a.total)})}

  ${card({span:5,title:'Token Economics',pad:false,body:table(
    [{t:'Measure'},{t:'Value',r:true}],
    [['Input tokens','1.42B'],['Output tokens','214M'],['Cached tokens','486M'],['Requests','6.2M'],
     ['Average tokens per request','264'],['Blended cost per 1M tokens','$51.40'],['Cost per request','$0.0135'],
     ['Cached share of input','34.2%'],['Requests returning no usable output','214K · 3.5%']],
    /* order:'keep' — as with Unit economics, one Value column over nine unlike
       measures: token counts, a request count, two per-unit prices and a share. */
    null, {order:'keep'}),
    note:'Caching already absorbs a third of input tokens. Every extra point of cache hit rate is roughly <b>$0.6K</b> a month.'})}
  ${card({span:7,title:'Model Comparison',sub:'Year to date',pad:false,body:table(
    /* Short numeric headers: this is a seven-column table in a half-width card,
       and "Requests YTD" / "Cost / request" each held their column open wider
       than the figure under it needed.  "YTD" moved to the card's sub-line. */
    [{t:'Model'},{t:'Provider'},{t:'Requests',r:true},{t:'Tokens',r:true},{t:'Cost',r:true},{t:'Cost / Req',r:true},{t:'Primary Use'}],
    a.models.map(m=>[`<b>${m.m}</b>`,`<div class="ent">${brandMark(m.p)}<span>${m.p}</span></div>`,
      m.req,m.tok,moneyK(m.cost),'$'+m.avg.toFixed(4),`<span class="sub">${m.use}</span>`]),
    ['7 models in production','','6.20M','1.63B',moneyK(84),'$0.0135',''])})}

  ${card({span:4,title:'AI Cost By Product',pad:false,body:hbars(a.byProduct,{noun:'products'})})}
  ${card({span:8,title:'Optimisation',pad:false,body:`<div class="rows">
    ${[['AI tool consolidation','18 employees hold seats on three or more GenAI tools',28,'Assign one primary tool per role'],
       ['Model routing','1.62M Gamma classification calls run on a frontier model',9,'Route to a small model; keep escalation path'],
       ['Prompt caching','Beta extraction pipeline re-sends the same 8K-token context',4,'Enable caching on the system prompt'],
       ['Unused subscriptions','Claude Enterprise 54% utilised, Gemini 46%, Perplexity 45%',13,'True down at renewal'],
       ['Low-value requests','214K retry-loop calls in June returned no output',2,'Add retry ceiling and dead-letter queue']]
      .sort((a,b)=>b[2]-a[2])
      .map(r=>`<div class="row"><div class="grow"><div class="t">${r[0]}</div><div class="d">${r[1]} — ${r[3]}</div></div>
      <div class="v">${moneyK(r[2])}<div class="d" style="font-weight:400">annual</div></div></div>`).join('')}</div>`,
    note:'Consolidation alone is <b>$28,400</b> a year and needs no engineering work — only a licence policy.'})}

  </div>`;
};

/* ---------- 5. SaaS & licences ---------- */
S.saas = () => {
  const rows = D.saas.map(s=>{
    const u=Math.round(s.active/s.lic*100);
    return [`<div class="ent">${brandMark(s.vendor)}<div class="namecell"><b>${s.app}</b><span class="sub">${s.vendor} · ${s.cat}</span></div></div>`,
      s.lic, s.active, utilCell(u), moneyK(s.cost), moneyK(s.cost*12), `<span class="id">${s.renew}</span>`, personName(s.owner)];
  });
  const totLic=D.saas.reduce((a,s)=>a+s.lic,0), totAct=D.saas.reduce((a,s)=>a+s.active,0),
        totCost=D.saas.reduce((a,s)=>a+s.cost,0);
  const saasCat = D.categories.find(c=>/SaaS/i.test(c.k)) || {v:0};
  const saasSave = sum(D.savingsByCat.filter(s=>/SaaS|Licence/i.test(s.k)).map(s=>s.v));
  const idle = sum(D.saas.map(s=>(s.lic-s.active)/Math.max(1,s.lic)*s.cost*12));
  /* Hoisted for the counterfoil, same reason as aiIdle on the AI screen. */
  const lowUse = D.saas.filter(s=>s.active/Math.max(1,s.lic)<0.5).length;
  const Y = ytdView();
  const YsaasSave = sum(Y.savingsByCat.filter(s=>/SaaS|Licence/i.test(s.k)).map(s=>s.v));
  return head('SaaS And Licence Management','Every subscription, who actually uses it, and what renews next.','Persona · Procurement + ITFM',
    [['Unused Licences',String(totLic-totAct),moneyK(Math.round(idle))+' annual exposure','warn'],
     ['Below 50% Used',lowUse+' apps','true-down candidates','warn'],
     ['Potential Savings',moneyK(saasSave),moneyK(YsaasSave)+' YTD','pos']])
  + `<div class="grid">
  ${/* Unused Licences, Below 50% Used and Potential Savings are removed — the
        counterfoil above already carries all three, with the same annual-exposure
        sub-lines.  Licences Purchased and Active Licences keep their tiles and gain
        the series they never had: a seat count is a STOCK, so its line is the level
        held each month rather than a running total (SCHEMA.md). */''}
  ${kpi({k:'SaaS And Licence Spend',v:money(saasCat.v),delta:share(saasCat.v,D.ytdActual)+' of technology spend',dir:'flat',
    ytd:money((Y.categories.find(c=>/SaaS/i.test(c.k))||{v:0}).v)+' YTD',foot:'Excludes cloud',
    spark:saasCat.m,sparkOpts:{cumulative:true}})}
  ${kpi({k:'Applications',v:D.saas.length+' tracked',foot:D.meta.vendors+' vendors in total'})}
  ${/* ROUND 15: `Licences Purchased` is FOLDED INTO this tile rather than deleted.
        The two were the fifth and fourth tiles and they are one measurement read two
        ways — the denominator and the numerator of the utilisation figure this tile
        already prints.  A separate card for the denominator is what left a widow on
        the second row, and "385 · 73% utilised · of 527 purchased" says everything
        both tiles said in one line.  The purchased series goes with it; the active
        one stays, because it is the seat count that moves for a reason. */''}
  ${kpi({k:'Active Licences',v:String(totAct),delta:Math.round(totAct/Math.max(1,totLic)*100)+'% utilised',dir:'gdown',
    foot:'Of '+totLic+' purchased, seen in the last 30 days',
    spark:(D.monthly||{}).licencesActive,sparkOpts:{fmt:v=>Math.round(v)+' seats',zero:false}})}
  ${kpi({k:'Renewals In 90 Days',v:renew90(D.saas).length+' contracts',delta:moneyK(Math.round(sum(renew90(D.saas).map(s=>s.cost*12))))+' annualised',dir:'up',
    foot:'Windows to renegotiate'})}

  ${card({span:12,title:'Application Inventory',sub:'Sorted by monthly cost',pad:false,body:table(
    [{t:'Application'},{t:'Purchased',r:true},{t:'Active',r:true},{t:'Utilisation',r:true},{t:'Monthly',r:true},{t:'Annualised',r:true},{t:'Renews'},{t:'Owner'}],
    rows, [D.saas.length+' applications',String(totLic),String(totAct),Math.round(totAct/Math.max(1,totLic)*100)+'%',moneyK(totCost),moneyK(totCost*12),'',''] ),
    note:'Five applications sit below 50% utilisation: <b>Lucidchart, Miro, Perplexity, Zoom and Gemini Advanced</b> — 116 seats bought, 48 in use. Two of them do the same job.'})}

  ${card({span:6,title:'Licence Optimisation',pad:false,body:rowList(
    [['12 inactive Microsoft 365 E5 seats','No sign-in for 45+ days',14],
     ['Miro and Lucidchart overlap','48 seats, 17 active, same job',11],
     ['Claude Enterprise at 54%','35 seats purchased, 19 active',13],
     ['GitHub Enterprise for 9 non-developers','Team plan covers their usage',9],
     ['Power BI Premium capacity','7 of 12 seats used, P1 over-provisioned',9],
     ['Zoom Business at 45%','Teams is the standard for internal calls',5]]
      /* Ranked here rather than in rowList(), which takes rendered HTML strings and
         so has no value to rank by.  This is the one hand-built ranked list left in
         the screens — everything else reaches rowList() through hbars(), which
         sorts (see ranked() in charts.js). */
      .sort((a,b)=>b[2]-a[2])
      .map(r=>`<div class="row"><div class="grow"><div class="t">${r[0]}</div><div class="d">${r[1]}</div></div>
      <div class="v">${moneyK(r[2])}</div></div>`), 'opportunities')})}
  ${card({span:6,title:'Utilisation Distribution',hint:'Seats by band',body:`
    <div class="rows bleed">
    ${[['90–100% utilised','2 applications',100,98,'good'],['70–89%','7 applications',264,213,'good'],
       ['50–69%','2 applications',47,26,'warn'],['Below 50%','5 applications',116,48,'bad']]
      .map(r=>`<div class="row"><div class="grow"><div class="t">${r[0]}</div>
      <div class="d">${r[1]} · ${r[2]} purchased · ${r[3]} active · <b style="color:var(--ink-2)">${r[2]-r[3]} idle</b></div>
      <div style="margin-top:6px">${meter(r[3]/r[2]*100,r[4])}</div></div>
      <div class="v">${r[2]}<div class="d" style="font-weight:400">seats</div></div></div>`).join('')}</div>`,
    note:'The bottom band is <b>116 seats purchased, 68 idle</b> — almost all of it AI tooling bought in the January–March rush.'})}

  </div>`;
};
/* ---------- 6. Finance ---------- */
S.finance = () => {
  const vr = D.ytdActual - D.ytdBudget;
  /* AUTHORED, not a constant.  This was `Math.round(D.ytdActual * 0.694)`, which
     made every scenario report the same 69.4% commitment ratio however differently
     it bought — the optimised workspace and the one in crisis had identical
     contract cover.  It is `meta.committed` now, with a monthly series behind it. */
  const committed = D.meta.committed||0, pipeline = D.identified - D.realized;
  const Y = ytdView();
  const Ycommitted = Y.meta.committed||0, Ypipeline = Y.identified - Y.realized;
  return head('Finance','Budget, actuals, forecast and the story behind the variance.','Persona · Finance',
    [['Uncommitted Spend',money(D.ytdActual-committed),money(Y.ytdActual-Ycommitted)+' YTD'],
     ['Savings Realised',money(D.realized),money(Y.realized)+' YTD','pos'],
     ['Savings Pipeline',money(pipeline),money(Ypipeline)+' YTD','pos']])
  + `<div class="grid">
  ${/* Five tiles removed.  `Actual · YTD` and `Variance · YTD` were the strip's own
        first and third lanes — and they were also MISLABELLED: both rendered the
        period-scoped figure under a "· YTD" heading, so narrowing to a quarter left
        the word YTD sitting over three months.  That mislabelling is what made the
        strip and the tiles look like they disagreed.  Uncommitted Spend, Savings
        Realised and Savings Pipeline are this screen's counterfoil verbatim. */''}
  ${kpi({k:'Technology Budget · Full Year',v:money(D.fyBudget),foot:'Approved plan, '+D.meta.fy})}
  ${kpi({k:'Forecast · Year-End',v:money(D.fyForecast),delta:signed(D.fyForecast-D.fyBudget),dir:D.fyForecast>D.fyBudget?'up':'gup',
    ytd:money(Y.fyForecast)+' YTD',foot:'At the current run-rate',
    spark:D.trend.actual,sparkOpts:{cumulative:true}})}
  ${kpi({k:'Committed Spend',v:money(committed),delta:share(committed,D.ytdActual)+' of total',dir:'flat',
    ytd:money(Ycommitted)+' YTD',foot:'Contracts and commitments',
    spark:(D.monthly||{}).committed,sparkOpts:{zero:false}})}
  ${/* ROUND 15: the fourth tile.  Three was the count that left this screen's row
        short, and the figure that was missing from it is the plainest question a
        finance reader asks of an approved plan — how much of it is gone.  It is
        measured against the FULL-YEAR budget rather than the phased year-to-date
        one, which is what makes it a different question from the strip's Variance
        lane: that lane says whether spend is ahead of the plan's own schedule, this
        says how much of the year's money is left whatever the schedule said. */''}
  ${kpi({k:'Full-Year Budget Used',v:share(D.ytdActual,D.fyBudget),
    ytd:share(Y.ytdActual,Y.fyBudget)+' YTD',foot:D.meta.closed+' of 12 months closed',
    spark:D.trend.actual,sparkOpts:{cumulative:true,fmt:v=>share(v,D.fyBudget)}})}

  ${card({span:12,title:'Budget Versus Actual And Forecast',hint:'Monthly, $K',body:lineChart([
    {name:'Budget',values:D.trend.budget,color:NEUTRAL},
    {name:'Actual',values:D.trend.actual,color:'--c1',dots:true,area:true},
    {name:'Forecast',values:D.trend.forecast,color:'--c3',dash:true}
  ],D.meta.months,{w:1080,h:250}),
    /* w matches this span-12 card's real pixel width: an SVG viewBox scales its
       own text, so a 680-wide box in a 1100px card would render the 9.5px axis
       labels at ~15px and break the type scale (§1). */
    note:'The plan was flat at roughly <b>$137K</b> a month. Actual has been above it in eight of eleven months and the gap widens after January.'})}

  ${card({span:7,title:'Variance Analysis',sub:'How the plan became the actual, step by step',/* Taller than the default: this card sits beside a nine-row table, and the
       grid squares the two off. */
    /* Taller than the default because this card is squared off against a nine-row
       table, but NOT drawn to fill it: the axis is zero-based again, so height
       beyond this goes into the empty middle between the anchors and the steps
       rather than into the bars.  Slack at the foot of the card is the better
       trade. */
    body:waterfall(D.variance,{h:430}),
    note:(()=>{const up=D.variance.filter(s=>s.type==='up'),dn=D.variance.filter(s=>s.type==='down');
      return `${up.length} driver${up.length===1?'':'s'} add <b>${moneyK(sum(up.map(s=>s.v)))}</b>; ${dn.length} programme${dn.length===1?'':'s'} return <b>${moneyK(Math.abs(sum(dn.map(s=>s.v))))}</b>. Net <b>${signed(vr)}</b>.`;})()})}
  ${/* Cost centres are the departments with a code attached — derived, so the
       column totals agree with the ledger under any dataset or filter. */''}
  ${card({span:5,title:'Variance By Cost Centre',pad:false,body:table(
    [{t:'Cost Centre'},{t:'Owner'},{t:'Budget',r:true},{t:'Actual',r:true},{t:'Variance',r:true}],
    D.depts.map(d=>{
      const cc = CC[d.k] || ['—','Unassigned'], vv = d.v - d.budget;
      /* Code above name, not "CODE · Name" on one line: as a single string this
         was the widest cell in the table and it set the table's minimum width. */
      return [`<div class="namecell"><span class="id">${cc[0]}</span><span class="sub">${d.k}</span></div>`,
        personName(cc[1]),moneyK(d.budget),moneyK(d.v),
        `<span class="delta ${vv>0?'up':vv<0?'down':'flat'}">${vv===0?'—':signed(vv)}</span>`];
    }),
    ['Total','',moneyK(sum(D.depts.map(d=>d.budget))),moneyK(sum(D.depts.map(d=>d.v))),
     `<span class="delta ${vr>0?'up':'down'}">${signed(sum(D.depts.map(d=>d.v))-sum(D.depts.map(d=>d.budget)))}</span>`]),
    note:'The largest unfavourable variance with no owner is <b>Unallocated</b> — a finance problem before it is an engineering one.'})}

  ${/* The accounting view is derived from the live category split, with the GL
       account and treatment looked up per category — it used to restate the
       baseline's eight numbers, so it disagreed with itself the moment the
       dataset or a filter changed. */''}
  ${card({span:12,title:'Accounting View',sub:'Ready for journal entry',pad:false,body:table(
    [{t:'Category'},{t:'GL Account'},{t:'Treatment'},{t:'YTD Actual',r:true},{t:'YTD Budget',r:true},{t:'Variance',r:true},{t:'Accrual Required',r:true}],
    D.categories.map(c=>{
      const gl = GL[c.k] || ['6490 · Other IT','Opex'];
      /* The plan is phased flat, so a category's share of budget is its share
         of actual less the variance it caused — close enough for a mock-up and
         it always sums to the real total. */
      const bud = Math.round(c.v * D.ytdBudget / Math.max(1,D.ytdActual));
      const vv = c.v - bud;
      return [`<div class="ent"><i class="swatch" style="background:var(${c.g||'--c1'})"></i><span>${c.k}</span></div>`,
        `<span class="id">${gl[0]}</span>`,`<span class="sub">${gl[1]}</span>`,moneyK(c.v),moneyK(bud),
        `<span class="delta ${vv>0?'up':vv<0?'down':'flat'}">${vv===0?'—':signed(vv)}</span>`,
        gl[1].indexOf('consumption')>=0||gl[1].indexOf('mixed')>=0?moneyK(Math.round(c.v*0.064)):'—'];
    }),
    ['Total','','',moneyK(D.ytdActual),moneyK(D.ytdBudget),
     `<span class="delta ${vr>0?'up':'down'}">${signed(vr)}</span>`,
     moneyK(Math.round(sum(D.categories.filter(c=>{const g=GL[c.k]||['','Opex'];
       return g[1].indexOf('consumption')>=0||g[1].indexOf('mixed')>=0;}).map(c=>c.v))*0.064))])})}
  </div>`;
};
/* Cost-centre code and owner per department — reference data, like GL below. */
const CC = {
  'Engineering':['ENG-1140','Sujeev'], 'Product':['PRD-3050','Kezia'],
  'Security / IT':['SEC-2010','Rohit'], 'Sales':['GTM-4020','Irfan'],
  'Operations':['OPS-4500','Erin'], 'Marketing':['GTM-4060','Irfan'],
  'Finance':['CORP-5000','Erin'], 'HR':['CORP-5200','Erin'],
  'Unallocated':['—','Unassigned']
};
/* GL account and accounting treatment per spend category — reference data, so
   it is a lookup rather than part of the dataset. */
const GL = {
  'Cloud infrastructure':['6410 · Hosting','Opex, consumption'],
  'SaaS & licences':['6420 · Software','Opex, prepaid amortised'],
  'AI & LLM':['6425 · AI services','Opex, mixed'],
  'Security':['6430 · Security tooling','Opex, consumption'],
  'Observability':['6435 · Monitoring','Opex, consumption'],
  'ITSM':['6440 · Service mgmt','Opex, prepaid amortised'],
  'Device management':['6450 · Endpoint','Opex + amortised hardware'],
  'Other technology':['6490 · Other IT','Opex']
};

/* ---------- 7. Procurement ---------- */
S.proc = () => {
  /* The renewal calendar is the vendor list sorted by how close its date is —
     it used to be a separate hardcoded array, which meant it disagreed with the
     vendor table underneath it. */
  const renewals = D.vendors.map(v=>({v, d:daysOut(v.renew)}))
    .filter(r=>r.d!==null && r.d>=0 && r.d<=180)
    .sort((a,b)=>a.d-b.d);
  const soon = renew90(D.vendors);
  const contractTotal = sum(D.vendors.map(v=>v.contract));
  const weak = D.vendors.filter(v=>v.util<75);
  const contractSave = sum(D.savingsByCat.filter(s=>/Contract/i.test(s.k)).map(s=>s.v));
  const consolSave = sum(D.savingsByCat.filter(s=>/Licence|SaaS/i.test(s.k)).map(s=>s.v));
  const first = renewals[0];
  const Y = ytdView();
  const YcontractSave = sum(Y.savingsByCat.filter(s=>/Contract/i.test(s.k)).map(s=>s.v));
  const YconsolSave = sum(Y.savingsByCat.filter(s=>/Licence|SaaS/i.test(s.k)).map(s=>s.v));
  return head('Procurement','Vendors, contracts and the negotiating position on each one.','Persona · Procurement',
    [['Negotiation Opportunities',weak.length+' vendors','utilisation below 75%','warn'],
     ['Potential Contract Savings',moneyK(contractSave),moneyK(YcontractSave)+' YTD','pos'],
     ['Consolidation Savings',moneyK(consolSave),moneyK(YconsolSave)+' YTD','pos']])
  + `<div class="grid">
  ${/* `Total Vendor Spend` was `money(D.ytdActual)` — the strip's Actual lane, with a
        different label on it.  The other three removals are the counterfoil.
        What is left is mostly STRUCTURAL COUNTS, so this screen carries one
        sparkline rather than four: a vendor register does not have a twelve-month
        history of how many vendors it contained, and drawing one would be the
        invented number this whole round is about. */''}
  ${kpi({k:'Vendors',v:String(D.meta.vendors),foot:'Top '+D.vendors.length+' = '+share(sum(D.vendors.map(v=>v.v)),D.ytdActual)+' of spend'})}
  ${kpi({k:'Active Contracts',v:String(D.vendors.length),foot:'Tracked with a renewal date'})}
  ${kpi({k:'Renewals In 90 Days',v:String(soon.length),delta:moneyK(sum(soon.map(v=>v.contract)))+' contract value',dir:'up',foot:'Next 90 days'})}
  ${kpi({k:'Contract Value Under Management',v:money(contractTotal),foot:'Committed across '+D.vendors.length+' contracts',
    ytd:money(sum(Y.vendors.map(v=>v.contract)))+' YTD',
    spark:(D.monthly||{}).contractValue,sparkOpts:{zero:false}})}

  ${card({span:12,title:'Renewal Calendar',sub:'Everything falling due in the next 180 days',pad:false,body:table(
    [{t:'Vendor'},{t:'Category'},{t:'Renewal Date'},{t:'Days Out',r:true},{t:'Contract Value',r:true},{t:'Utilisation',r:true},{t:'Priority'},{t:'Position'}],
    renewals.map(({v,d})=>[`<div class="ent">${brandMark(v.k)}<b>${v.k}</b></div>`,
      `<span class="sub">${v.cat}</span>`,`<span class="id">${v.renew}</span>`,String(d),moneyK(v.contract),utilCell(v.util),
      sevBadge(renewalPriority(d,v,contractTotal)),
      `<span class="sub">${v.util<60?'True down before signing':v.util<80?'Negotiate on utilisation':'Renew as is, seek volume tier'}</span>`]),
    null),
    note:first?`<b>${first.v.k} renews in ${first.d} days at ${first.v.util}% utilisation.</b> Open the conversation this week or the leverage disappears.`
      :'Nothing renews in the next 180 days — the negotiating work is all in utilisation, not dates.'})}

  ${card({span:12,title:'Vendor Spend',hint:'Top 10',pad:false,body:table(
    [{t:'Vendor'},{t:'Category'},{t:'YTD Spend',r:true},{t:'Contract Value',r:true},{t:'Start'},{t:'Renewal'},{t:'Utilisation',r:true},{t:'Owner'},{t:'Risk'}],
    D.vendors.map(v=>[`<div class="ent">${brandMark(v.k)}<b>${v.k}</b></div>`,`<span class="sub">${v.cat}</span>`,moneyK(v.v),moneyK(v.contract),
      `<span class="id">${v.start}</span>`,`<span class="id">${v.renew}</span>`,utilCell(v.util),personName(v.owner),riskBadge(v.risk)]),
    ['Top 10 vendors','',moneyK(1326),moneyK(1492),'','','82% of spend','','']),
    note:'Risk here means <b>renewal risk</b>: high spend, low utilisation, or a date close enough that switching is no longer realistic.'})}

  ${card({span:6,title:'Procurement Opportunities',pad:false,body:`<div class="rows">
    ${[['Microsoft EA volume tier','Combined Azure, M365 and security spend qualifies for the next tier',15],
       ['Atlassian two-year commitment','Trades flexibility for a 12% discount',6],
       ['Consolidate AI vendors from 6 to 3','Coverage overlaps on 18 employees',28],
       ['Retire duplicate whiteboard tools','Miro and Lucidchart, 48 seats, 17 active',11],
       ['AWS Savings Plan coverage 58% → 85%','$141K of compute is still on-demand',15]]
      .sort((a,b)=>b[2]-a[2])
      .map(r=>`<div class="row"><div class="grow"><div class="t">${r[0]}</div><div class="d">${r[1]}</div></div>
      <div class="v">${moneyK(r[2])}</div></div>`).join('')}</div>`})}
  ${card({span:6,title:'Alerts',pad:false,body:`<div class="rows">
    ${[['Critical','Microsoft Enterprise Agreement expires in 62 days','$640K contract value, 84% utilised'],
       ['High','Grafana renewal due in 28 days','72% utilised — true down 7 seats first'],
       ['High','Claude Enterprise utilisation only 54%','35 seats purchased, 19 active'],
       ['Medium','Perplexity Enterprise at 47%','22 seats, renewal 30 Apr 2027 — no action until Q1'],
       ['Medium','Miro at 37%','Overlaps Lucidchart; retire one before 12 Nov']]
      .map(r=>`<div class="row">${sevBadge(r[0])}<div class="grow"><div class="t">${r[1]}</div><div class="d">${r[2]}</div></div></div>`).join('')}</div>`})}
  </div>`;
};

/* ---------- 8. Business / product ---------- */
S.product = () => {
  const P = D.products.filter(p=>p.rev>0);
  /* "My product" is whichever the Product filter selects, and the first
     revenue-earning one otherwise — the hero tile used to name Alpha and
     restate its numbers, so it contradicted the table under any other slice. */
  const me = (has('product') && D.products.find(p=>p.k===sel('product')[0])) || P[0] || D.products[0];
  /* Every fallback in that chain still lands on undefined when there are no
     products at all, and the next line reads me.k. */
  if(!me) return head('Product Technology Cost','What each product costs to run, and what that does to its margin.','Persona · Business / Product')
    + `<div class="grid">${card({span:12,body:emptyState('No Products Yet',
        'Product technology cost needs at least one product carrying spend. Tag a resource to a product, or load a dataset that has one.')})}</div>`;
  const rev = sum(P.map(p=>p.rev)), techTot = sum(P.map(p=>p.v));
  /* The counterfoil describes the SELECTED product, like the tiles do — which is
     why it is built here, after `me` is resolved, and why the early return above
     passes none: there is no product to describe. */
  const Y = ytdView();
  const Ym = Y.products.find(p=>p.k===me.k) || me;
  const meStats = [['Cloud',moneyK(me.cloud),moneyK(Ym.cloud)+' YTD'],
    ['AI',moneyK(me.ai),moneyK(Ym.ai)+' YTD'],
    ['Cost Per Customer',me.cust?'$'+(me.v/me.cust).toFixed(2)+'K':'—',me.cust+' customers']];
  const worst = P.slice().sort((a,b)=>(b.v/b.rev)-(a.v/a.rev))[0];
  return head('Product Technology Cost','What each product costs to run, and what that does to its margin.','Persona · Business / Product',meStats)
  + `<div class="grid">
  ${/* Cloud, AI and Cost Per Customer are removed — this screen's counterfoil is
        per-PRODUCT and carries exactly those three, so the tiles restated it.
        `Cost Per Transaction` goes too, for a different reason: it was the literal
        string '$0.024' with a '−9.1% QoQ' delta beside it, and the schema records
        transactions for the estate rather than per product, so there is nothing to
        derive it from.  A figure that does not move when the data does is the
        problem this round exists to fix; deleting it beats keeping a number the
        board cannot defend. */''}
  ${kpi({k:me.k+' · Technology Cost',v:money(me.v),delta:signed(me.v-me.budget)+' vs budget',dir:me.v>me.budget?'up':'gup',
    ytd:money(Ym.v)+' YTD',foot:'Selected product',
    spark:me.m,sparkOpts:{cumulative:true}})}
  ${/* "Product Budget", not "Budget".  The strip's second lane is the ESTATE's
        budget and this is one product's, so two lanes apart carried the same word
        over two different numbers — the ambiguity the round is about, in its
        smallest form. */''}
  ${kpi({k:'Product Budget',v:money(me.budget),ytd:money(Ym.budget)+' YTD',foot:'Phased, '+D.meta.closed+' months'})}
  ${kpi({k:'Shared Technology Allocated',v:moneyK(Math.round(me.other*0.46)),
    ytd:moneyK(Math.round(Ym.other*0.46))+' YTD',foot:'By headcount'})}
  ${kpi({k:'Technology As % Of Revenue',v:me.rev?pct(me.v/me.rev*100):'—',delta:'target under 18%',dir:me.rev&&me.v/me.rev<0.18?'gup':'gdown',
    ytd:Ym.rev?pct(Ym.v/Ym.rev*100)+' YTD':'',foot:moneyK(me.rev)+' revenue'})}

  ${card({span:12,title:'Product Profit And Loss',sub:'Technology cost only',pad:false,body:table(
    [{t:'Product'},{t:'Revenue',r:true},{t:'Cloud',r:true},{t:'AI',r:true},{t:'SaaS',r:true},{t:'Other Tech',r:true},{t:'Total Tech',r:true},{t:'Gross Margin',r:true},{t:'Tech % Of Revenue',r:true}],
    P.map(p=>[`<div class="ent">${swatch(p.k)}<b>${p.k}</b></div>`,money(p.rev),moneyK(p.cloud),moneyK(p.ai),moneyK(p.saas),moneyK(p.other),
      `<b>${moneyK(p.v)}</b>`,pct((p.rev-p.v)/p.rev*100),
      `<span class="delta ${p.v/p.rev>0.25?'up':'down'}">${pct(p.v/p.rev*100)}</span>`]),
    [P.length+(P.length===1?' product':' products'),money(rev),moneyK(sum(P.map(p=>p.cloud))),moneyK(sum(P.map(p=>p.ai))),
     moneyK(sum(P.map(p=>p.saas))),moneyK(sum(P.map(p=>p.other))),`<b>${moneyK(techTot)}</b>`,
     rev?pct((rev-techTot)/rev*100):'—',rev?pct(techTot/rev*100):'—']),
    note:worst?`<b>${worst.k}</b> spends ${pct(worst.v/worst.rev*100)} of its revenue on technology. That can be normal for a young product, but it needs a date on which it stops being normal.`:''})}

  ${card({span:8,title:'Technology Cost By Product',sub:'Monthly, stacked — each product in its own colour',
    body:stackedBars(D.meta.months.slice(0,D.meta.closed),
      D.products.filter(p=>p.m).map(p=>({name:p.k,values:p.m,color:ec(p.k)||'--c1'}))),
    note:'Every product carries the same colour here that it carries in the table above and the swatches below.'})}
  ${card({span:4,title:'Cost Per Customer',pad:false,body:P.length?`<div class="rows">
    ${(()=>{ const cpc = P.filter(p=>p.cust>0).map(p=>p.v/p.cust); const hi = Math.max(...cpc,1);
      return P.filter(p=>p.cust>0).sort((a,b)=>b.v/b.cust - a.v/a.cust).map(p=>{ const v = p.v/p.cust;
        return `<div class="row"><div class="grow"><div class="t">${swatch(p.k)}<span>${p.k}</span></div>
      <div class="d">${p.cust} customers · ${money(p.rev)} revenue</div>
      <div class="bar"><i class="hatched" style="width:${v/hi*100}%;background:var(${ec(p.k)||'--c1'})"></i></div></div>
      <div class="v">$${v.toFixed(2)}K</div></div>`; }).join(''); })()}</div>`
    :emptyState('No Revenue-Earning Product In Scope','Clear the Product filter, or pick one that carries revenue.'),
    note:(()=>{ const cpc = P.filter(p=>p.cust>0).map(p=>p.v/p.cust);
      if(cpc.length<2) return '';
      const lo=Math.min(...cpc), hi=Math.max(...cpc);
      return `Cost per customer ranges from <b>$${lo.toFixed(1)}K</b> to <b>$${hi.toFixed(1)}K</b> — a ${(hi/lo).toFixed(1)}× spread that pricing does not currently reflect.`;})()})}

  </div>`;
};

/* ---------- 9. Optimisation hub ---------- */
S.optimize = () => {
  const byStatus = ['Identified','Under review','Approved','In progress','Implemented'];
  const counts = byStatus.map(s=>({k:s,v:D.opps.filter(o=>o.st===s).reduce((a,o)=>a+o.s,0)}));
  /* Hoisted out of the tile IIFE below so the counterfoil shares the expression. */
  const ap = D.opps.filter(o=>o.st==='Approved'), le = D.opps.filter(o=>o.eff==='Low');
  const Y = ytdView();
  const Yap = Y.opps.filter(o=>o.st==='Approved');
  /* CIO pick, not specified: what is on the table, what is WAITING ON A DECISION
     already taken, and what has actually been banked.  The middle one is the reason
     to pin anything here — it is the only figure on the screen naming work the
     reader has already approved and nobody has done. */
  return head('Optimisation Hub','One backlog for every saving, with an owner and a date on each line.','Persona · ITFM',
    [['Identified Savings',money(D.identified),money(Y.identified)+' YTD','pos'],
     ['Approved, Not Yet Done',moneyK(sum(ap.map(o=>o.s))),moneyK(sum(Yap.map(o=>o.s)))+' YTD','warn'],
     ['Realised Savings',money(D.realized),money(Y.realized)+' YTD','pos']])
  + `<div class="grid">
  ${/* Total Identified Savings and Realised Savings are removed — they are this
        screen's counterfoil verbatim, along with Approved, Not Yet Done.  The
        hardcoded '13.2% of technology spend' and '16 opportunities' went with them;
        both were strings that stayed put across all six datasets.

        THE PIPELINE ROW NOW STARTS AT `Under review`.  It used to run
        Identified → Under review → Approved → In progress, and the first and third
        of those are lanes on the strip directly above with the same figure in them:
        "Identified $214K" twice, 200px apart, is the complaint this round opened
        on.  What is left is the part of the pipeline the strip does NOT state —
        the two stages that are in flight — which is also the more useful cut: a
        stage nobody has decided on and a stage somebody is working. */''}
  ${kpi({k:'Low-Effort Savings',v:moneyK(sum(le.map(o=>o.s))),delta:le.length+' item'+(le.length===1?'':'s'),dir:'gup',foot:'No engineering sprint needed'})}
  ${['Under review','In progress'].map(s=>{
    const n = D.opps.filter(o=>o.st===s).length;
    return kpi({k:titleCase(s),ic:ST_ICON[s][0],tone:ST_ICON[s][1],
      v:moneyK((counts.find(c=>c.k===s)||{v:0}).v),
      foot:n+' item'+(n===1?'':'s')});
  }).join('')}
  ${/* ROUND 15: the fourth tile.  The other three cut the backlog by EFFORT and by
        STAGE; this one cuts it by how much the owner believes the number, which is
        the cut a finance reader needs before quoting any of it.  `conf` is authored
        per opportunity in the dataset, so this is a filter over real rows rather
        than a confidence factor invented here. */''}
  ${(()=>{ const hc = D.opps.filter(o=>/^high$/i.test(o.conf||''));
    return kpi({k:'High-Confidence Savings',ic:'target',v:moneyK(sum(hc.map(o=>o.s))),
      delta:hc.length+' item'+(hc.length===1?'':'s'),dir:'gup',
      foot:'Rated high by the owner'}); })()}

  ${card({span:12,title:'Optimisation Backlog',sub:'Every opportunity, with an owner and a date',pad:false,body:table(
    [{t:'Opportunity'},{t:'Category'},{t:'Effort'},{t:'Confidence'},{t:'Owner'},{t:'Target Date'},{t:'Status'},{t:'Annual Saving',r:true}],
    D.opps.map(o=>[`<b>${o.o}</b>`,o.cat,o.eff,o.conf,personName(o.owner),`<span class="id">${o.due}</span>`,stBadge(o.st),moneyK(o.s)]),
    [D.opps.length+' opportunities','','','','','','',money(D.identified)]),
    note:'Every line has one owner and one date. Anything without both is not an opportunity, it is an observation.'})}

  ${card({span:6,title:'Savings By Category',pad:false,body:hbars(D.savingsByCat,{noun:'categories'})})}
  ${/* Quarterly conversion is split out of the dataset's own identified/realised
       totals with a fixed maturity curve — an opportunity found in Q4 has had
       no time to land, which is the whole point of the card. */''}
  ${card({span:6,title:'Realised Versus Identified',sub:'By the quarter the saving was found',body:`
    <div class="rows bleed">
    ${(()=>{ const idW=[.22,.26,.29,.23], rlW=[.44,.32,.20,.04];
      const qs=[['Q1 · first quarter'],['Q2 · second quarter'],['Q3 · third quarter'],['Q4 · fourth quarter']];
      const rows = qs.map((q,i)=>({k:q[0], id:Math.round(D.identified*idW[i]), rl:Math.round(D.realized*rlW[i]/ (rlW.reduce((a,b)=>a+b,0)) )}));
      const hi = Math.max(...rows.map(r=>r.id))||1;
      return rows.map(r=>{ const c = r.id?Math.round(Math.min(100,r.rl/r.id*100)):0;
        return `<div class="row"><div class="grow"><div class="t"><span>${r.k}</span></div>
      <div class="d">Identified ${moneyK(r.id)} · realised ${moneyK(r.rl)} · ${c}% conversion</div>
      <div class="bar stack">
        <i style="width:${r.id/hi*100}%;background:color-mix(in srgb,var(--pos) 24%,#fff)"></i>
        <i class="hatched" style="width:${r.rl/hi*100}%;background:var(--pos)"></i>
      </div></div><div class="v">${c}%</div></div>`; }).join(''); })()}</div>`,
    note:'Conversion falls the closer an opportunity is to today — recent items simply have not had time to land. The second quarter\'s figure is the honest steady state.'})}
  </div>`;
};

/* ---------- 10. Cost allocation ---------- */
S.allocation = () => {
  const alloc = D.ytdActual - D.unallocated;
  const cov = D.ytdActual ? alloc/D.ytdActual*100 : 0;
  const res = sum(D.tagging.map(t=>t.res));
  const topTag = D.tagging.slice().sort((a,b)=>b.v-a.v)[0] || {k:'—',res:0,v:0};
  /* Coverage per dimension is the product dimension's figure moved by a fixed
     per-dimension offset — the dataset records one coverage number, and the
     point of the card is which dimension is weakest, not the third decimal. */
  const dims = [['Product',0,'Sujeev · platform team'],['Department',1.3,'Sujeev · platform team'],
    ['Cost centre',-0.7,'Erin · finance'],['Environment',3.1,'Sujeev · platform team'],
    ['Application',-4.4,'Nidhish · product engineering'],['Owner',-1.9,'Rohit · IT']];
  const weakest = dims.slice().sort((a,b)=>a[1]-b[1])[0];
  const Y = ytdView();
  /* CIO pick, not specified: how much of the bill can be defended in a chargeback
     conversation, how much cannot, and whether the tagging that decides it is
     improving.  Coverage is the number the whole screen exists to move. */
  return head('Cost Allocation','How much of the bill can be traced to something that owns it.','Persona · ITFM',
    [['Allocation Coverage',cov.toFixed(1)+'%','target 98%'],
     ['Unallocated Spend',money(D.unallocated),money(Y.unallocated)+' YTD','warn'],
     ['Tagging Compliance',(cov-3.3).toFixed(1)+'%','+4.2 pts QoQ']])
  + `<div class="grid">
  ${/* Coverage, Unallocated and Tagging Compliance are this screen's counterfoil,
        so all three tiles go and the screen keeps no Metrics tab.
        NOT touched: the strip's own `Tagging Compliance` is still `cov - 3.3` with
        a `+4.2 pts QoQ` sub-line, and the schema holds no prior quarter to compute
        that from.  The strip was ruled out of scope for this round, so it is
        recorded here rather than quietly fixed. */''}
  ${kpi({k:'Allocated Spend',v:money(alloc),ytd:money(Y.ytdActual-Y.unallocated)+' YTD',
    foot:'Of '+money(D.ytdActual)+' total',
    spark:D.trend.actual,sparkOpts:{cumulative:true,fmt:v=>moneyK(Math.round(v*(alloc/Math.max(1,D.ytdActual))))}})}
  ${/* ROUND 15: three more, all read straight off rows the dataset already carries.
        Coverage is a percentage and the strip owns it; what a percentage cannot tell
        you is WHO the traceable money belongs to, WHICH missing tag is costing the
        most, and HOW MANY things have to be touched to fix it — which is the
        difference between a compliance number and a work order. */''}
  ${(()=>{ const owners = D.depts.filter(d=>d.k!=='Unallocated').slice().sort((a,b)=>b.v-a.v);
    const top = owners[0];
    return kpi({k:'Largest Cost Owner',ic:'users',v:top?moneyK(top.v):'—',
      delta:top&&alloc?share(top.v,alloc)+' of allocated':'',dir:'flat',
      foot:top?top.k:'No department carries a charge yet'}); })()}
  ${kpi({k:'Largest Tag Gap',ic:'tag',v:D.tagging.length?moneyK(topTag.v):'—',
    delta:D.tagging.length&&D.unallocated?share(topTag.v,D.unallocated)+' of the gap':'',dir:'up',
    foot:D.tagging.length?topTag.k:'Nothing is missing a tag'})}
  ${/* A STRUCTURAL COUNT — no series and no YTD byline (SCHEMA.md, "What
        deliberately has NO series").  It is also the only figure on the screen
        measured in work rather than money, which is why it earns a tile. */''}
  ${kpi({k:'Untagged Resources',ic:'box',v:res.toLocaleString(),
    foot:D.tagging.length?'Across '+D.tagging.length+' kinds of missing tag':'Nothing is missing a tag'})}

  ${card({span:5,title:'Why Spend Is Unallocated',sub:'By the tag that is missing',pad:false,body:table(
    [{t:'Missing Tag'},{t:'Resources',r:true},{t:'Spend',r:true},{t:'Share Of Gap',r:true}],
    D.tagging.map(t=>[t.k,String(t.res),moneyK(t.v),share(t.v,D.unallocated)]),
    ['Total',String(res),moneyK(D.unallocated),'100%']),
    note:`Only these <b>${res}</b> resources are missing a tag that blocks allocation. A policy on the <b>${topTag.res}</b> missing a ${topTag.k.replace(/ missing$/,'').toLowerCase()} recovers <b>${share(topTag.v,D.unallocated)}</b> of the gap.`})}
  ${card({span:7,title:'Allocation By Dimension',sub:'Where the traceability actually breaks',pad:false,body:table(
    [{t:'Dimension'},{t:'Allocated',r:true},{t:'Unallocated',r:true},{t:'Coverage',r:true},{t:'Owner Of The Gap'}],
    dims.map(r=>{
      const c = Math.min(99.9,Math.max(50,cov+r[1])), a = Math.round(D.ytdActual*c/100);
      return [r[0],moneyK(a),moneyK(D.ytdActual-a),
        `<span class="delta ${c>95?'gup':'gdown'}">${c.toFixed(1)}%</span>`,personName(r[2])];
    }),
    null),
    note:`<b>${weakest[0]}</b> is the weakest dimension at <b>${Math.max(50,cov+weakest[1]).toFixed(1)}%</b> — which is why per-${weakest[0].toLowerCase()} unit cost is still an estimate.`})}

  ${/* Derived from D.depts and a headcount split, so the columns add up to the
       ledger's total under any dataset — the hardcoded version did not. */''}
  ${card({span:12,title:'Allocation By Department And Product',sub:'Shared cost spread by headcount',pad:false,body:table(
    [{t:'Department'},{t:'Direct Spend',r:true},{t:'Shared Allocated',r:true},{t:'Total',r:true},{t:'Headcount',r:true},{t:'Per Employee',r:true},{t:'Coverage',r:true}],
    (()=>{ const real = D.depts.filter(d=>d.k!=='Unallocated');
      const wsum = sum(real.map(d=>HEAD[d.k]||1));
      return D.depts.map(d=>{
        if(d.k==='Unallocated') return [d.k,moneyK(d.v),'—',`<b>${moneyK(d.v)}</b>`,'—','—','<span class="badge crit">No owner</span>'];
        const hc = Math.max(1,Math.round(D.meta.employees*(HEAD[d.k]||1)/wsum));
        const sh = Math.round(d.v*0.145), direct = d.v - sh;
        return [d.k,moneyK(direct),moneyK(sh),`<b>${moneyK(d.v)}</b>`,String(hc),
          '$'+(d.v/hc).toFixed(1)+'K',utilCell(Math.min(100,Math.round(cov+(d.k==='Engineering'?2.5:1))))];
      });
    })(),
    ['Total',moneyK(Math.round(sum(D.depts.map(d=>d.v))*0.855)),moneyK(Math.round(sum(D.depts.filter(d=>d.k!=='Unallocated').map(d=>d.v))*0.145)),
     `<b>${moneyK(sum(D.depts.map(d=>d.v)))}</b>`,String(D.meta.employees),
     '$'+(D.ytdActual/Math.max(1,D.meta.employees)).toFixed(1)+'K',cov.toFixed(1)+'%'])})}
  </div>`;
};
/* Relative headcount weight per department — reference data, used to split the
   dataset's single employee count across the departments it reports. */
const HEAD = {'Engineering':22,'Security / IT':4,'Product':6,'Sales':7,
  'Operations':5,'Marketing':3,'Finance':2,'HR':1};

/* ---------- 11. Forecasting ---------- */
S.forecast = () => {
  const runRate = D.meta.closed ? D.ytdActual/D.meta.closed : 0;
  const nextQ = Math.round(runRate*3*1.041);
  /* CIO pick, not specified: where the year lands, what the next quarter costs, and
     how much the first two deserve to be believed.  Forecast accuracy earns its
     place precisely because it qualifies everything else on the screen. */
  return head('Budget And Forecasting','Where this lands by year-end, under four sets of assumptions.','Persona · Finance + ITFM',
    [['Forecast Year-End',money(D.fyForecast),signed(D.fyForecast-D.fyBudget)+' vs budget'],
     ['Next Quarter',moneyK(nextQ),'+4.1% vs the last three months'],
     /* Was the literal string '94.2%' — the last of round 14's hardcoded figures,
        left standing because the strip was ruled out of scope that round.  The
        schema has carried `meta.forecastAcc` since, and the ITFM screen's tile has
        been reading it, so the strip and that tile disagreed on every dataset but
        the baseline. */
     ['Forecast Accuracy',(D.meta.forecastAcc||0).toFixed(1)+'%','rolling 3-month','pos']])
  + `<div class="grid">
  ${/* Baseline Year-End Forecast, Next Quarter and Forecast Accuracy are this
        screen's counterfoil.  Next Month survives because it is the one figure here
        that looks FORWARD by one step rather than restating the year-end position,
        and its line is the run-rate it is extrapolated from. */''}
  ${kpi({k:'Next Month',v:moneyK(Math.round(runRate*1.02)),delta:'At the current run-rate',dir:'flat',
    foot:'Projected, not closed',
    spark:D.trend.actual})}
  ${/* ROUND 15: three more.  The strip says where the year lands and how much that
        estimate deserves to be believed; these say what is left to spend, how many
        of the four sets of assumptions survive the approved plan, and which single
        assumption is doing the most damage.  All three are read off `fyBudget`,
        `scenarios` and `drivers` — rows the screen already draws below. */''}
  ${kpi({k:'Budget Remaining',ic:'wallet',v:money(D.fyBudget-D.ytdActual),
    delta:D.fyBudget>D.ytdActual?share(D.fyBudget-D.ytdActual,D.fyBudget)+' of the plan':'Plan exhausted',
    dir:D.fyBudget>D.ytdActual?'gup':'up',
    foot:'Of '+money(D.fyBudget)+' approved'})}
  ${(()=>{ const inb = D.scenarios.filter(s=>s.v<=D.fyBudget);
    return kpi({k:'Scenarios Within Budget',ic:'scale',
      v:inb.length+' of '+D.scenarios.length,
      delta:inb.length?inb[0].k:'None land inside the plan',dir:inb.length?'gup':'up',
      foot:'Sets of assumptions tested'}); })()}
  ${(()=>{ const dr = D.drivers.slice().sort((a,b)=>Math.abs(b.v)-Math.abs(a.v))[0];
    const eff = dr ? Math.round(D.fyForecast*dr.v/100*0.22) : 0;
    return kpi({k:'Largest Forecast Driver',ic:'trendup',v:dr?signed(eff):'—',
      delta:dr?(dr.v>0?'+':'')+dr.v+'% assumed':'',dir:eff>0?'up':'gup',
      foot:dr?dr.k:'No driver is moving the year-end number'}); })()}

  ${card({span:8,title:'Forecast With Confidence Range',hint:'Actual to June, projected to October',body:bandChart({}),
    note:'The range widens from <b>±4%</b> in July to <b>±14%</b> by October, almost entirely because AI consumption is not under a commitment.'})}
  ${card({span:4,title:'Scenarios',sub:'Four sets of assumptions',pad:false,body:`<div class="rows">
    ${(()=>{ const lo=Math.min(...D.scenarios.map(s=>s.v)), hi=Math.max(...D.scenarios.map(s=>s.v));
      return D.scenarios.slice().sort((a,b)=>b.v-a.v).map(s=>`<div class="row"><div class="grow"><div class="t"><span>${s.k}</span></div><div class="d">${s.d}</div>
      <div class="bar"><i class="hatched" style="width:${hi>lo?(s.v-lo)/(hi-lo)*88+12:60}%;background:var(--${s.v<=D.fyBudget?'pos':s.v<=D.fyForecast?'warn':'neg'})"></i></div></div>
      <div class="v">${money(s.v)}<div class="d" style="font-weight:400">${signed(s.v-D.fyBudget)}</div></div></div>`).join(''); })()}</div>`,
    note:(()=>{ const inb=D.scenarios.filter(s=>s.v<=D.fyBudget);
      return inb.length?`${inb.length===1?'Only the <b>'+inb[0].k+'</b> scenario lands':'<b>'+inb.length+'</b> scenarios land'} inside the approved <b>${money(D.fyBudget)}</b> budget.`
        :`<b>No scenario</b> lands inside the approved <b>${money(D.fyBudget)}</b> budget. The plan needs re-basing, not just tighter delivery.`;})()})}

  ${card({span:6,title:'Forecast Drivers',sub:'What moves the year-end number',pad:false,body:table(
    [{t:'Driver'},{t:'Assumption'},{t:'Change',r:true},{t:'Effect On Year-End',r:true}],
    D.drivers.map(d=>{
      const eff = Math.round(D.fyForecast*d.v/100*0.22);
      return [`<b>${d.k}</b>`,`<span class="sub">${DRIVER_NOTE[d.k]||'Follows the current trend'}</span>`,
        `<span class="delta ${d.v>0?'up':'down'}">${d.v>0?'+':''}${d.v}%</span>`,
        `<span class="delta ${eff>0?'up':'down'}">${signed(eff)}</span>`];
    }),
    ['Net effect','','',`<span class="delta ${sum(D.drivers.map(d=>d.v))>0?'up':'down'}">${signed(Math.round(D.fyForecast*sum(D.drivers.map(d=>d.v))/100*0.22))}</span>`])})}
  ${/* Column headers kept short on purpose: this is a half-width card, and a
       header long enough to set the table's own minimum width ("This year,
       actual + forecast") is what put a horizontal scrollbar under it.  The
       context moved to the card's sub-line, where it has room. */''}
  ${card({span:6,title:'Budget Request · Next Fiscal Year',sub:'This year is actual plus forecast; next year is the ask',pad:false,body:table(
    [{t:'Category'},{t:'This Year',r:true},{t:'Next Year',r:true},{t:'Change',r:true},{t:'Rationale'}],
    (()=>{ const f = D.ytdActual?D.fyForecast/D.ytdActual:1;
      return D.categories.map(c=>{
        const thisY = Math.round(c.v*f), pc = ASK[c.k]!==undefined?ASK[c.k]:3.0;
        return [`<div class="ent"><i class="swatch" style="background:var(${c.g||'--c1'})"></i><span>${c.k}</span></div>`,
          moneyK(thisY),moneyK(Math.round(thisY*(1+pc/100))),
          `<span class="delta ${pc>0?'up':'down'}">${pc>0?'+':''}${pc.toFixed(1)}%</span>`,
          `<span class="sub">${ASK_WHY[c.k]||'Follows the estate'}</span>`];
      }); })(),
    (()=>{ const f = D.ytdActual?D.fyForecast/D.ytdActual:1;
      const ask = sum(D.categories.map(c=>Math.round(c.v*f*(1+((ASK[c.k]!==undefined?ASK[c.k]:3.0)/100)))));
      return ['Total',money(D.fyForecast),money(ask),
        `<span class="delta ${ask>D.fyForecast?'up':'down'}">${(ask/D.fyForecast*100-100).toFixed(1)}%</span>`,''];})()),
    note:'The overall ask is modest, but <b>AI</b> carries most of it and everything else is roughly flat. That is the conversation to have.'})}
  </div>`;
};
/* Assumption text, next-year ask and its rationale, per driver and category —
   reference copy that belongs to the narrative, not to the dataset. */
const DRIVER_NOTE = {
  'AI usage':'Token volume follows the recent trend',
  'Cloud workloads':'New production services land next quarter',
  'Employee count':'Hiring plan as approved',
  'SaaS optimisation':'Seat reclamation completes next month',
  'Reserved capacity':'Commitment coverage reaches target'
};
const ASK = {'Cloud infrastructure':6.6,'SaaS & licences':-6.9,'AI & LLM':35.5,'Security':7.9,
  'Observability':-5.6,'ITSM':3.2,'Device management':11.5,'Other technology':2.8};
const ASK_WHY = {'Cloud infrastructure':'Growth net of commitment savings',
  'SaaS & licences':'Seat reclamation and consolidation','AI & LLM':'Product AI features shipping',
  'Security':'Ingestion volume grows with the estate','Observability':'Cardinality and retention work',
  'ITSM':'Headcount','Device management':'New starters and the refresh cycle','Other technology':'—'};

/* ---------- 12. Anomalies ---------- */
/* What "status" means for the reader, since a chip on its own does not say
   whether anything is expected to happen next.  Reference copy that belongs to
   the narrative rather than to the dataset, like DRIVER_NOTE above. */
const ANOM_NEXT = {
  'Investigating':'Root cause is not confirmed yet — {owner} owns it and is expected to explain it before the next close.',
  'Root cause found':'The cause is confirmed but nothing is live yet; the change is with {owner}.',
  'Fix deployed':'The fix is live. {owner} confirms the run rate has settled over two billing days before this closes.',
  'Resolved':'Closed. Spend is back inside the expected band, and the figure above is what the overrun cost while it ran.'
};
const anomNext = a => (ANOM_NEXT[a.st] || 'Owned by {owner}.').replace(/\{owner\}/g, a.owner);

/* One anomaly, as a row that opens.
   PROGRESSIVE DISCLOSURE, and the split is deliberate: collapsed, a row answers
   only "which of these matters, and by how much" — severity, what and where, the
   money above expectation, the size of the miss.  Everything that EXPLAINS or
   ASSIGNS it — the plain-English cause, the owner, the status and what happens
   next — is behind the click, because none of it helps you choose which row to
   read first.
   Built as a `.row` inside rowList() rather than as its own widget, so the
   five-item clip and its "Show all" control are the ones already used by every
   other list in the mock-up rather than a second expansion idiom. */
function anomalyRow(a,i){
  const over = a.act - a.exp, varp = a.exp ? over/a.exp*100 : 0;
  const id = 'anom-d-'+i;
  return `<div class="row anom">
    <button class="anom-h" type="button" aria-expanded="false" aria-controls="${id}">
      <span class="anom-sev">${sevBadge(a.sev)}</span>
      <span class="anom-name">
        <b>${a.svc}</b>
        <span class="anom-where">${brandMark(a.prov)}<span>${a.prov}</span>
          <i aria-hidden="true">·</i>${swatch(a.prod)}<span>${a.prod}</span>
          <i aria-hidden="true">·</i><span>${a.d}</span></span>
      </span>
      <span class="anom-fig">
        <span class="anom-num delta ${over>=0?'up':'down'}">${over>=0?'+':'−'}${moneyK(Math.abs(over))}</span>
        <span class="anom-lab">${varp>=0?'+':'−'}${Math.abs(Math.round(varp))}% above expected</span>
      </span>
      <span class="anom-st">${badge(a.st,a.st==='Resolved'?'ok':a.st==='Fix deployed'?'med':'high')}</span>
      <span class="anom-caret" aria-hidden="true">${icon('caret')}</span>
    </button>
    <div class="anom-d" id="${id}" hidden>
      <p class="anom-why">${a.why}</p>
      <dl class="anom-facts">
        <div><dt>Provider</dt><dd><span class="ent">${brandMark(a.prov)}<span>${a.prov}</span></span></dd></div>
        <div><dt>Product</dt><dd><span class="ent">${swatch(a.prod)}<span>${a.prod}</span></span></dd></div>
        <div><dt>Detected</dt><dd><span class="id">${a.d}</span></dd></div>
        <div><dt>Owner</dt><dd>${personCell(a.owner,'sm')}</dd></div>
        <div><dt>Expected</dt><dd>${moneyK(a.exp)}</dd></div>
        <div><dt>Actual</dt><dd><b>${moneyK(a.act)}</b></dd></div>
      </dl>
      <p class="anom-next"><b>What happens next</b> ${anomNext(a)}</p>
    </div>
  </div>`;
}

/* The row grid's own column labels (styles.css, .anom-cols) — collapsed, the
   list used to say "which matters and by how much" with no word saying what
   the numbers WERE, which read as missing headers next to every table on the
   other screens. aria-hidden: the real label for a reader (and for a screen
   reader) is .anom-lab on the row itself; this is a visual header only, not a
   second copy of that text. */
const anomCols = () => `<div class="anom-cols" aria-hidden="true">
  <span></span>
  <span>Anomaly</span>
  <span class="anom-cols-fig">Impact</span>
  <span class="anom-cols-st">Status</span>
  <span></span>
</div>`;

/* Severity band first, and inside a band the biggest miss first.  The datasets
   author their anomalies severity-first already but say nothing about the order
   WITHIN a band, so two Mediums arrived in whatever order they were written —
   which is how the optimised scenario put a $0.8K miss above a $1.3K one under
   a heading that claimed to be ordered.  Sorting on the screen rather than
   asking every dataset to re-sort keeps the ordering rule in one place. */
const SEV_RANK = {Critical:0, High:1, Medium:2, Low:3};
const bySeverityThenMiss = (x,y) =>
  (SEV_RANK[x.sev]!=null?SEV_RANK[x.sev]:9) - (SEV_RANK[y.sev]!=null?SEV_RANK[y.sev]:9)
  || (y.act-y.exp) - (x.act-x.exp);

S.anomalies = () => {
  const A = D.anomalies.slice().sort(bySeverityThenMiss);
  const crit = A.filter(a=>a.sev==='Critical').length, high = A.filter(a=>a.sev==='High').length;
  const expd = sum(A.map(a=>a.exp)), actd = sum(A.map(a=>a.act));
  const closed = A.filter(a=>a.st==='Resolved'||a.st==='Fix deployed').length;
  const worst = A.slice().sort((x,y)=>(y.act-y.exp)-(x.act-x.exp))[0];
  const Y = ytdView();
  const YA = Y.anomalies.slice().sort(bySeverityThenMiss);
  const Yexpd = sum(YA.map(a=>a.exp)), Yactd = sum(YA.map(a=>a.act));

  /* The drill sample is ONE instance, and the dataset says which product and
     environment it belongs to.  Under a Product or Provider filter that record
     can fall outside the view, and showing it anyway would put an unfiltered row
     under a filtered heading — so the card says "not in this selection" instead.
     resources.path[2] is the provider the drill was authored under; it is real
     dataset text, not an assumption about which cloud this is.
     The test reads the FILTERED VIEW, not `F`.  Asking F directly meant knowing
     the shape of a selection, and that shape changed underneath this screen once
     the dimensions went multi-select — a single value became an array and the
     comparison silently stopped matching anything.  "Is this product still in
     D.products" is the same question and cannot go stale. */
  const R = D.resources || {path:[]}, res = D.resource || null;
  const drillProv = (R.path && R.path[2]) || null;
  const resIn = !!res
    && (D.products||[]).some(p=>p.k===res.product)
    && (!drillProv || (D.cloud.providers||[]).some(p=>providerMatches(drillProv,p.k)));
  /* Which anomaly the instance belongs to is MATCHED on the product it carries,
     not asserted.  The card used to be captioned "Drilled from the AWS anomaly"
     on every dataset, including the two where the record on file is a different
     product entirely. */
  const linked = res && (A.find(a=>a.prod===res.product && /compute|ec2|instance|node|gpu|vm|eks/i.test(a.svc))
                      || A.find(a=>a.prod===res.product)) || null;
  const resChange = res && res.prev ? (res.cur-res.prev)/res.prev*100 : 0;
  /* The lineage is built from the RESOURCE's own fields below the provider, not
     from a fixed string.  It used to read "… / AWS / Product Alpha / Production /
     Compute / EC2 / <name>" on every dataset, which contradicted the record it
     was sitting above in two of the four scenarios (optimised's instance is
     Product Gamma / Development, scaleup's is Product Epsilon).
     It is TEXT, not buttons.  Nothing above the leaf exists as a level in the
     dataset — there is one instance and one family list, not a tree — so a
     clickable parent could only ever drill into figures apportioned on the spot,
     and a control that cannot deliver what it promises is the fault this
     replaces rather than a lesser version of it. */
  const trail = res ? (R.path||['Total technology','Cloud']).slice(0,3)
    .concat([res.product,res.env,res.name]) : [];

  /* CIO pick, not specified: the money that is unexplained, how many open items it
     is spread across, and how fast the team closes one.  Spend first — a count of
     anomalies is an operations metric, the dollars are the decision. */
  return head('Cost Anomaly Detection','Unexpected movement, with a plain-language explanation attached.','Persona · ITFM',
    [['Unexpected Spend',moneyK(Math.round((actd-expd)*10)/10),moneyK(Math.round((Yactd-Yexpd)*10)/10)+' YTD','neg'],
     ['Open Anomalies',String(A.length),crit+' critical, '+high+' high','warn'],
     ['Mean Time To Explain','1.8 days','−0.6 days','pos']])
  + `<div class="grid">
  ${/* Open Anomalies, Unexpected Spend and Mean Time To Explain are this screen's
        counterfoil — including the '1.8 days' one, which is a literal string in
        both places and so at least agreed with itself. */''}
  ${kpi({k:'Resolved This Month',v:closed+' of '+A.length,delta:share(closed,A.length)+' closed',dir:'gup',
    foot:'Explained and closed off'})}
  ${/* ROUND 15: three more.  The strip totals the money and counts the queue; these
        name the single worst item, say how old the queue's oldest open item is, and
        say how far the problem has spread.  The age is DERIVED from `anomalies[].d`,
        the detection date each row already carries, measured against the dataset's
        own as-of date rather than the wall clock — the strip's own "1.8 days" sits
        two rows above and is still a literal string, which is the comparison worth
        having in front of you when the strip is next in scope. */''}
  ${(()=>{ const w = A.slice().sort((x,y)=>(y.act-y.exp)-(x.act-x.exp))[0];
    return kpi({k:'Largest Single Anomaly',ic:'anomalies',v:w?moneyK(Math.round((w.act-w.exp)*10)/10):'—',
      delta:w?w.sev:'',dir:'up',
      foot:w?w.svc+' · '+w.prod:'Nothing is above its expected value'}); })()}
  ${(()=>{ /* The SAME open/closed test as `closed` above, so the two tiles cannot
              disagree about which rows are still open. */
    const open = A.filter(a=>!(a.st==='Resolved'||a.st==='Fix deployed'));
    const aged = open.map(a=>({a,d:daysOut(a.d)})).filter(x=>x.d!==null)
      .map(x=>({a:x.a,d:Math.max(0,-x.d)})).sort((x,y)=>y.d-x.d)[0];
    return kpi({k:'Oldest Open Anomaly',ic:'calendar',
      v:aged?aged.d+' day'+(aged.d===1?'':'s'):'—',
      delta:aged?aged.a.st:'',dir:'up',
      foot:aged?aged.a.svc+' · detected '+aged.a.d:'Nothing is still open'}); })()}
  ${(()=>{ const prods = [...new Set(A.map(a=>a.prod))];
    return kpi({k:'Products Affected',ic:'product',v:String(prods.length),
      foot:prods.length?prods.slice(0,2).join(', ')+(prods.length>2?' and '+(prods.length-2)+' more':'')
                       :'No product is carrying an anomaly'}); })()}

  ${/* ONE component, where there used to be a ten-column table AND four
       half-width cards repeating its first four rows: "the anomalies screen
       currently looks chaotic, with both tables and cards.  The cards contain a
       mix of various forms, creating visual clutter rather than clarity."
       Losing the table also loses the horizontal scrollbar ten columns put under
       this screen at 1200px. */''}
  ${card({span:12,title:'Detected Anomalies',
    sub:'Most severe first, then by the size of the miss. Open one for the cause, the owner and what happens next.',pad:false,
    body:A.length ? anomCols()+rowList(A.map(anomalyRow),'anomalies')
      : emptyState('No Anomalies Match These Filters','Widen the period, or clear a filter in the row above. Nothing detected is not the same as nothing spent.'),
    note:worst?`<b>${worst.svc} on ${worst.prod}</b> is the largest single gap — <b>${moneyK(worst.act-worst.exp)}</b> above expectation in one month, ${worst.st.toLowerCase()} with <b>${worst.owner}</b>.`
      :'Nothing in this slice moved far enough from its expected value to be flagged.'})}

  ${card({span:12,title:'Resource Detail',
    sub:linked?'The single instance under the '+linked.svc+' anomaly on '+linked.prod
       :'The single instance at the bottom of the largest cloud anomaly',pad:false,
    body:!resIn
      ? emptyState('No Instance-Level Record In This Selection',
          res?`The record this dataset carries is <b>${res.name}</b> on ${res.product} · ${res.env}, which the active filter excludes. Clear it to see the drill.`
             :'This dataset carries no instance-level record.')
      : `<div class="trail">${trail.map((t,i,ar)=>
          `${i?'<span class="trail-sep" aria-hidden="true">/</span>':''}<span${i===ar.length-1?' class="on"':''}>${t}</span>`).join('')}</div>`
        + table([{t:'Field'},{t:'Value'},{t:'Field'},{t:'Value'}],[
      ['Resource name',`<span class="id">${res.name}</span>`,'Current month',`<b>${moneyK(res.cur)}</b>`],
      ['Resource ID',`<span class="id">${res.id}</span>`,'Previous month',moneyK(res.prev)],
      ['Owner',personName(res.owner),'Change',
        `<span class="delta ${resChange>0?'up':resChange<0?'down':'flat'}">${resChange>0?'+':resChange<0?'−':''}${Math.abs(resChange).toFixed(1)}%</span>`],
      ['Product',res.product,'Average CPU',`<span class="delta ${res.util<30?'gdown':'flat'}">${res.util}%</span>`],
      ['Environment',res.env,'Recommendation',`<b>${res.rec}</b>`],
      ['Cost centre',`<span class="id">${res.cc}</span>`,'Potential saving',`<b>${moneyK(res.save)}</b> / month`]
    ]),
    note:resIn?`One instance, one owner, one decision — worth <b>${moneyK(res.save)} a month</b> on its own. The whole group comes to <b>${moneyK(res.groupSave)} a year</b>.`:''})}
  </div>`;
};

/* ---------- 13. Security ---------- */
S.security = () => {
  const secTotal = sum(D.security.map(s=>s.v)), M = D.secMeta;
  const Ysec = ytdView();
  return head('Security Cost','What protection costs, and which product is driving the ingestion bill.','Persona · ITFM + Security',
    [['Licence Utilisation',M.licUtil+'%',(100-M.licUtil)+'% of seats unused','warn'],
     ['Largest Platform Line',D.security.length?moneyK(D.security[0].v):'—',D.security.length?D.security[0].k:''],
     ['Optimisation Potential',moneyK(Math.round(secTotal*0.024*10)/10),'per month','pos']])
  + `<div class="grid">
  ${/* Largest Platform Line, Licence Utilisation and Optimisation Potential are the
        counterfoil.  The `+11.2% YoY` and `+22% QoQ` deltas go with them: the schema
        holds no prior year and no prior quarter, so both were strings unrelated to
        any data — the same class of figure as Finance's 69.4%.  What replaces them
        is a real line drawn from `monthly.security` and `monthly.ingestGB`. */''}
  ${kpi({k:'Total Security Spend',v:money(secTotal),delta:share(secTotal,D.ytdActual)+' of technology spend',dir:'flat',
    ytd:money(sum(Ysec.security.map(s=>s.v)))+' YTD',foot:D.security.length+' platform'+(D.security.length===1?'':'s'),
    spark:(D.monthly||{}).security,sparkOpts:{cumulative:true}})}
  ${kpi({k:'Security Cost Per Employee',v:'$'+(secTotal/Math.max(1,D.meta.employees)).toFixed(2)+'K',
    ytd:'$'+(sum(Ysec.security.map(s=>s.v))/Math.max(1,Ysec.meta.employees)).toFixed(2)+'K YTD',
    foot:D.meta.employees+' employees',
    spark:(D.monthly||{}).security,sparkOpts:{cumulative:true,fmt:v=>'$'+(v/Math.max(1,D.meta.employees)).toFixed(2)+'K'}})}
  ${kpi({k:'Cost Per GB Ingested',v:'$'+M.perGB.toFixed(2),foot:'Blended across every log source'})}
  ${/* ROUND 15: `Security Cost Per Product` was the fifth tile and is the one this
        screen could least defend.  It was `secTotal / prods` — the whole security
        bill divided by a count, with no allocation behind it — printed on a screen
        whose own subtitle is "which product is driving the ingestion bill".  A flat
        average per product denies exactly the thing the screen exists to show, and
        the Ingestion By Log Source table below it names the real per-product split.
        Same class of figure as Finance's 69.4% commitment constant, deleted in 14:
        arithmetic that looks like a measurement. */''}
  ${kpi({k:'Data Volume',v:M.ingestGB.toLocaleString()+' GB',foot:'Into the SIEM, year to date',
    ytd:(Ysec.secMeta.ingestGB||0).toLocaleString()+' GB YTD',
    spark:(D.monthly||{}).ingestGB,sparkOpts:{cumulative:true,fmt:v=>Math.round(v).toLocaleString()+' GB'}})}

  ${card({span:5,title:'Security Spend By Platform',body:donut(D.security,{label:'Security YTD'})+legend(D.security,secTotal)})}
  ${(()=>{ const src = M.sources||[], hot = src.find(s=>s.flag);
    return card({span:7,title:'Ingestion By Log Source',sub:'Where the SIEM volume actually comes from',pad:false,body:table(
    [{t:'Log Source'},{t:'Product'},{t:'Volume GB',r:true},{t:'Monthly Cost',r:true},{t:'Change',r:true},{t:'Verdict'}],
    src.map(s=>[s.src,`<div class="ent">${swatch(s.prod)}<span>${s.prod}</span></div>`,
      s.gb.toLocaleString(),moneyK(s.cost),
      `<span class="delta ${s.delta>20?'up':s.delta<0?'down':'flat'}">${s.delta>0?'+':s.delta<0?'−':''}${Math.abs(s.delta)}%</span>`,
      s.flag?`<b>${s.verdict}</b>`:`<span class="sub">${s.verdict}</span>`]),
    ['Total','',sum(src.map(s=>s.gb)).toLocaleString(),moneyK(sum(src.map(s=>s.cost))),
     `<span class="delta ${M.ingestDelta>0?'up':'down'}">${M.ingestDelta>0?'+':'−'}${Math.abs(M.ingestDelta)}%</span>`,'']),
    note:hot?`<b>${hot.src}</b> on ${hot.prod} is the line to act on — ${hot.gb.toLocaleString()} GB at <b>${moneyK(hot.cost)} a month</b>, up ${hot.delta}%. ${hot.verdict}.`
      :'No single source is misbehaving — volume growth is tracking the estate.'}); })()}

  </div>`;
};

/* ---------- 14. ITSM ---------- */
S.itsm = () => {
  const I = D.itsm;
  return head('ITSM Financial Insights','Service-desk operations joined to the cost of running the services behind them.','Persona · ITFM',
    [['Cost Per Ticket','$'+I.perTicket.toFixed(2),I.tickets.toLocaleString()+' tickets'],
     ['Response Cost Per Incident','$'+I.perIncident,I.incidents+' incidents'],
     ['Cost Per Change','$'+I.perChange,I.changes+' changes']])
  + `<div class="grid">
  ${/* Cost Per Ticket, Response Cost Per Incident and Cost Per Change are this
        screen's counterfoil, all three of them.  The `+4.2% QoQ` on the first went
        with it — there is no prior quarter in the schema. */''}
  ${kpi({k:'Total ITSM Cost',v:money(I.total),delta:share(I.total,D.ytdActual)+' of technology spend',dir:'flat',
    foot:I.tickets.toLocaleString()+' tickets handled',
    spark:I.volume,sparkOpts:{fmt:v=>Math.round(v).toLocaleString()+' tickets',zero:false}})}
  ${/* ROUND 15: three more.  All three lanes of the strip are unit costs — per
        ticket, per incident, per change — so what is missing from this screen is
        every question that is not "what does one of them cost".  The mix (how much
        of the queue is an incident rather than a request), the concentration (which
        product the money actually goes to) and the scale against headcount are the
        three, and `byProduct` already carries the second. */''}
  ${kpi({k:'Incident Ratio',ic:'alerts',v:share(I.incidents,I.tickets),
    delta:I.incidents.toLocaleString()+' of '+I.tickets.toLocaleString(),dir:'up',
    foot:'Unplanned work, not requests'})}
  ${(()=>{ const top = (I.byProduct||[]).slice().sort((a,b)=>b.cost-a.cost)[0];
    return kpi({k:'Costliest Product To Support',ic:'product',v:top?moneyK(top.cost):'—',
      delta:top&&I.total?share(top.cost,I.total)+' of service desk cost':'',dir:'flat',
      foot:top?top.k:'No product is carrying a ticket'}); })()}
  ${kpi({k:'Service Desk Cost Per Employee',ic:'users',
    v:'$'+(I.total/Math.max(1,D.meta.employees)).toFixed(2)+'K',
    foot:D.meta.employees+' employees supported'})}

  ${card({span:8,title:'Ticket Volume',sub:'Monthly, against a flat cost per ticket',body:lineChart([
    {name:'Tickets',values:I.volume,color:'--c1',dots:true,area:true}
  ],D.meta.months,{fmt:v=>Math.round(v)}),
    note:'Volume is flat while cost per ticket rises — the cost increase is licence and tooling, not workload.'})}
  ${card({span:4,title:'Incidents And Infrastructure Cost',pad:false,body:table(
    /* "Cost", not "Response cost".  Four columns in a third-width card, and each
       header now carries its own sort control — the two-word label was the one
       that tipped this table into a scrollbar below 1280.  The card is titled
       "Incidents and infrastructure cost", so the column has all the context it
       needs from the header above it. */
    [{t:'Product'},{t:'Tickets',r:true},{t:'Incidents',r:true},{t:'Cost',r:true}],
    I.byProduct.map(p=>[`<div class="ent">${swatch(p.k)}<span>${p.k}</span></div>`,p.t.toLocaleString(),String(p.inc),moneyK(p.cost)]),
    ['Total',sum(I.byProduct.map(p=>p.t)).toLocaleString(),String(sum(I.byProduct.map(p=>p.inc))),moneyK(sum(I.byProduct.map(p=>p.cost)))]),
    note:(()=>{const b=I.byProduct.slice().sort((x,y)=>y.cost-x.cost)[0];
      return b?`<b>${b.k}</b> had ${b.inc} incidents this year; the infrastructure cost of responding to them was <b>${moneyK(b.cost)}</b>.`:'';})()})}

  ${card({span:12,title:'Where Operations And Cost Meet',pad:false,body:table(
    [{t:'Product'},{t:'Incidents',r:true},{t:'Tickets',r:true},{t:'Observability Data',r:true},{t:'Technology Cost',r:true},{t:'Reading'}],
    I.byProduct.map(p=>{
      const prod = D.products.find(x=>x.k===p.k), o = D.obsByProduct.find(x=>x.k===p.k);
      const rate = p.t?p.inc/p.t*100:0;
      return [`<div class="ent">${swatch(p.k)}<b>${p.k}</b></div>`,String(p.inc),p.t.toLocaleString(),
        o?o.share+'%':'—',prod?moneyK(prod.v):'—',
        `<span class="sub">${rate>12?'High incident rate for its ticket volume — instability, not capacity'
          :rate>7?'Incident rate in line with volume':'Low incident rate — well run'}</span>`];
    }),
    null),
    note:(()=>{const w=I.byProduct.slice().sort((a,b)=>(b.inc/Math.max(1,b.t))-(a.inc/Math.max(1,a.t)))[0];
      return w?`<b>${w.k}</b> is the one to act on: the highest incidents-per-ticket ratio in the estate. Adding capacity would not fix it.`:'';})()})}
  </div>`;
};

/* ---------- 15. Alerts ---------- */
/* ---- the remediation playbooks ----
   "We display many alerts, but none are actionable… presenting alerts without
   any way to act on them is a significant failure."  So every row opens the
   steps for THAT alert, and the steps are derived rather than canned:

     · the family is matched from the alert's own RECOMMENDED ACTION first and
       its title second — the action is what the steps are actually about, and
       matching the title first sent "Terminate 7 idle instances" to the
       contract playbook because its headline mentions commitment coverage;
     · the alert's product, owner, money and the recommendation already on file
       are written into the sentences, so the plan names real things;
     · severity decides the window AND whether step one is containment or
       diagnosis, which is what makes a Critical AI overspend and a Medium
       licence tidy-up read as different problems rather than one template.

   Reference copy, like DRIVER_NOTE — it belongs to the narrative, not to the
   dataset, and no dataset has to supply it. */
const ALERT_FAMILY = [
  /* most specific first; a seat problem is a licence problem even when the word
     "renewal" is in the same sentence */
  [/licen[cs]e|seat|E5|inactive|reclaim|consolidat|duplicat/i,           'licence'],
  [/renewal|commit|reserved|savings plan|coverage|negotiat|unsigned|discount|tier|contract|pricing|\bsign\b/i, 'contract'],
  [/ingest|logging|logs|debug|sentinel|metric|label|cardinal|retention|observab|trace/i, 'telemetry'],
  [/token|prompt|\bmodel\b|GenAI|LLM|OpenAI|Anthropic|Gemini|Claude|ChatGPT|inference|reasoning|embedding/i, 'ai'],
  [/idle|unattached|disk|instance|node pool|EKS|rightsize|terminate|GPU|vCore|capacity|pool|fleet|scal/i, 'cloud']
];
const alertFamily = a => {
  const hit = t => (ALERT_FAMILY.find(r=>r[0].test(t))||[])[1];
  return hit(a.act||'') || hit(a.t||'') || 'general';
};
/* How soon, in the language a finance or platform owner would use. */
const SEV_WINDOW = {Critical:'Today, before the next billing day',
  High:'This week', Medium:'Before the next renewal or close', Low:'Next housekeeping pass'};

/* Each playbook returns four steps, or five when the severity is Critical — the
   extra one is always containment, and always first. */
const PLAYBOOK = {
  ai: a => [
    a.sev==='Critical' && {t:'Put a ceiling on it before diagnosing anything',
      d:`Set a hard token budget on the ${a.prod} workload today. The fix underneath this can take a week; the run rate cannot wait that long at ${moneyK(a.impact)} a month above plan.`},
    {t:'Separate volume from model choice',
      d:`Open AI &amp; LLM cost and split the rise into requests versus cost per request. More calls and a more expensive model look identical on the invoice and have completely different fixes.`},
    {t:a.act, d:`This is the recommendation already on file against this alert, owned by ${a.owner}. Carried through, it is worth <b>${moneyK(a.save)} a year</b>.`},
    {t:'Re-baseline the forecast once it is live',
      d:`Update the ${a.prod} forecast so next month's variance measures the new normal rather than re-reporting this incident.`},
    {t:'Confirm over two billing days',
      d:'Provider usage records lag consumption by up to 48 hours, so a single quiet day is not evidence the change worked.'}
  ],
  cloud: a => [
    a.sev==='Critical' && {t:'Stop the capacity growing today',
      d:`Freeze scaling on the ${a.prod} resources named in this alert before anything else. ${moneyK(a.impact)} a month is already committed and an unbounded pool adds to it every hour.`},
    {t:'Prove it is really idle',
      d:'Check a full week of utilisation, not a weekend, and confirm nothing is attached — a quiet batch window is not the same as dead capacity.'},
    {t:a.act, d:`The recommendation on file, owned by ${a.owner}. It is worth <b>${moneyK(a.save)} a year</b> once it lands.`},
    {t:'Tag whatever survives',
      d:`Anything kept needs a product and an owner tag, or it comes back as unallocated spend next month and this alert repeats.`},
    {t:'Re-check at the next close',
      d:`Compare ${a.prod} against its plan after one full billing cycle to confirm the line actually came down.`}
  ],
  contract: a => [
    a.sev==='Critical' && {t:'Confirm the date before anything else',
      d:'A renewal that lapses re-signs itself at list price. Get written confirmation of the decision deadline today, and put a holding note to the vendor if it is inside a week.'},
    {t:'Pull the current terms',
      d:`Get the signed agreement for ${a.prod} — term, notice period, uplift clause and what the committed volume actually is. Negotiating without the notice period is negotiating blind.`},
    {t:'Price the alternative',
      d:`Put the measured usage against list, the current commitment and one tier below it. ${moneyK(a.save)} a year is the difference on the table here.`},
    {t:a.act, d:`The recommendation on file, owned by ${a.owner}. ${SEV_WINDOW[a.sev]||'Soon'} is the window this alert is asking for.`},
    {t:'Book the decision, not the reminder',
      d:'Put a dated decision in the calendar with the approver on it. A reminder without an approver is how a renewal auto-renews.'}
  ],
  /* Two shapes hide under "licence", and calling both of them dormant is wrong:
     seats nobody has signed into, and seats several tools are duplicating for
     the same person.  The diagnosis step differs; the rest does not. */
  licence: a => {
    const overlap = /hold|duplicat|overlap|three or more|primary tool|consolidat/i.test((a.t||'')+' '+(a.act||''));
    return [
      a.sev==='Critical' && {t:'Freeze new provisioning today',
        d:`Suspend automatic seat assignment on ${a.prod} while this is worked, or the count grows underneath the clean-up.`},
      overlap
        ? {t:'Decide which tool is primary for each role',
           d:`Ask the ${a.prod} owners which of the overlapping tools each role actually works in. Taking away the one somebody lives in is how a savings programme loses its mandate.`}
        : {t:'Confirm the accounts are genuinely dormant',
           d:'Check last sign-in against leave, secondments and service accounts. Reclaiming a seat from someone on sabbatical costs more than it saves.'},
      {t:overlap?'Retire the duplicates, not the tool':'Give notice, then reclaim',
        d:`Tell the holders and their managers, give a week to object, then remove. ${a.owner} owns the list.`},
      {t:a.act, d:`The recommendation on file. Cleared in full it returns <b>${moneyK(a.save)} a year</b>.`},
      {t:'Close the tap that opened it',
        d:'Fix the provisioning rule or group membership that created the seats. Reclaiming without that just schedules the same alert for next quarter.'}
    ];
  },
  telemetry: a => [
    a.sev==='Critical' && {t:'Cap the ingestion rate today',
      d:`Put a daily volume cap on the ${a.prod} feed. It costs you sampling on a noisy signal; not capping it costs ${moneyK(a.impact)} a month.`},
    {t:'Find the source, not the total',
      d:'Break the volume down by source, then by log level. Growth of this shape is almost always one emitter, not the estate.'},
    {t:a.act, d:`The recommendation on file, owned by ${a.owner}. It is worth <b>${moneyK(a.save)} a year</b>.`},
    {t:'Set a retention that matches the question',
      d:'Debug detail rarely earns 90 days. Decide the window each signal is actually queried over and set it deliberately.'},
    {t:'Re-measure after a full week',
      d:`Volume is weekly-seasonal, so confirm against the same weekday before calling ${a.prod} fixed.`}
  ],
  general: a => [
    a.sev==='Critical' && {t:'Contain it first',
      d:`Put a limit on whatever is moving on ${a.prod} today, then diagnose. ${moneyK(a.impact)} a month is accruing while this is investigated.`},
    {t:'Confirm the number',
      d:`Check the figure against the source system before acting on it — an alert that turns out to be a re-billing or a late invoice costs credibility that the real ones need.`},
    {t:a.act, d:`The recommendation on file, owned by ${a.owner}. It is worth <b>${moneyK(a.save)} a year</b>.`},
    {t:'Give it a date and an approver',
      d:`${SEV_WINDOW[a.sev]||'Soon'} — with ${a.owner} accountable for it, not the queue.`},
    {t:'Re-check at the next close',
      d:'Confirm the line moved. An action nobody verified is indistinguishable from one nobody took.'}
  ]
};
const alertSteps = a => (PLAYBOOK[alertFamily(a)]||PLAYBOOK.general)(a).filter(Boolean);
/* Why this alert is worth someone's afternoon, in one line. */
const alertStake = a => a.impact
  ? `Running at <b>${moneyK(a.impact)} a month</b> above plan; the fix on file is worth <b>${moneyK(a.save)} a year</b>.`
  : `No overspend yet — this is <b>${moneyK(a.save)} a year</b> that stays available only while the window is open.`;

/* Only used for attribute values, where the alert title becomes an aria-label.
   The dataset's own copy is trusted HTML everywhere else in the mock-up. */
const attrEsc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

/* One row carries ONE control.  Assign / snooze / dismiss live in the dialog
   instead: at three extra controls a row, eight rows, the feed became a wall of
   buttons and the thing you were meant to read stopped being the alert.

   COLUMNS, not a paragraph.  The second cell used to be one flex column holding
   a title with a sub-line under it, and that sub-line ran three unrelated things
   together on a single middot-separated line: the product, an avatar and a name,
   and the recommended action in bold.  Three item types with no fixed positions
   between them means nothing lines up down the feed — the avatar sat at a
   different x on every row, and the action started wherever that row's owner
   name happened to end: "the alerts feed looks messed up, especially the second
   column, because there are too many item types and the alignment is off."

   So the row is a GRID with named tracks, the same idiom the anomalies feed
   already uses one card away, and the three things become three columns that
   line up down the list: what happened, who owns it, what to do.  Nothing was
   dropped — the product joins the title as its context line, which is where a
   scope belongs, and the two figures and the control keep the widths they had.
   The grid is declared once in CSS rather than per row, so every row agrees by
   construction rather than by each one coming out the same length. */
const alertRow = (a,i) => `<div class="row alertrow">
  <span class="alert-sev">${sevBadge(a.sev)}</span>
  <span class="alert-what"><span class="t">${a.t}</span><span class="d">${a.prod}</span></span>
  <span class="alert-who">${personName(a.owner)}</span>
  <span class="alert-act">${a.act}</span>
  <span class="alert-fig"><span class="v">${a.impact?moneyK(a.impact):'—'}</span><span class="alert-lab">impact / mo</span></span>
  <span class="alert-fig good"><span class="v">${moneyK(a.save)}</span><span class="alert-lab">saving / yr</span></span>
  <button class="btn sm alert-do" type="button" data-alert="${i}" aria-haspopup="dialog"
          aria-label="Resolve: ${attrEsc(a.t)}">Resolve</button>
</div>`;

/* The feed's own order, parked where the delegated click handler can reach it.
   The rows are SORTED for display, so a row's index is an index into this list
   and not into D.alerts — indexing the unsorted one would open the plan for a
   different alert than the one whose button was pressed. */
let ALERT_VIEW = [];

S.alerts = () => {
  /* Severity first — the feed says so — then, inside a band, descending on IMPACT.
     It used to tie-break on `save`, and a row shows both: impact/mo on the left,
     saving/yr on the right.  Sorting on the second while the reader scans the
     first made the leading money column look unordered — the exact fault the
     descending-order rule is about.  The key is now the figure the eye reaches
     first, with saving still breaking a tie behind it. */
  const A = ALERT_VIEW = D.alerts.slice().sort((x,y)=>
    (SEV_RANK[x.sev]!=null?SEV_RANK[x.sev]:9) - (SEV_RANK[y.sev]!=null?SEV_RANK[y.sev]:9)
    || (y.impact||0) - (x.impact||0)
    || (y.save||0) - (x.save||0));
  const crit = A.filter(a=>a.sev==='Critical').length, high = A.filter(a=>a.sev==='High').length;
  /* CIO pick, not specified: how many decisions are open, what they are costing
     this month, and what clearing them returns.  Impact before savings — the cost
     of doing nothing is what makes the list urgent. */
  return head('Alerts','Everything that needs a decision, with the money attached to it.','All views',
    [['Open Alerts',String(A.length),crit+' critical, '+high+' high','neg'],
     ['Financial Impact This Month',moneyK(Math.round(sum(A.map(a=>a.impact))*10)/10),'above forecast','neg'],
     ['Savings Attached',moneyK(Math.round(sum(A.map(a=>a.save))*10)/10),'if all actioned','pos']])
  + `<div class="grid">
  ${/* Open Alerts, Financial Impact This Month and Savings Attached are this
        screen's counterfoil.

        ROUND 15: `Oldest Open Alert` — the tile that used to be here alone — is
        DELETED, not kept and joined.  Its figure was the literal string '11 days'
        and `alerts[]` carries no date of any kind, so there was nothing behind it to
        recompute from; it is the last of the class of figure round 14 removed, found
        because this round had to look at the tile again.  (The anomalies screen CAN
        answer the same question and now does, because `anomalies[].d` is real.)

        The four that replace it take the strip's three totals apart: the worst
        single line, the best single fix, how far the problem has spread and how many
        people it lands on.  A total tells you whether to care; these tell you where
        to start. */''}
  ${(()=>{ const w = A.slice().sort((x,y)=>(y.impact||0)-(x.impact||0))[0];
    return kpi({k:'Largest Single Alert',ic:'alerts',v:w?moneyK(w.impact):'—',
      delta:w?w.sev:'',dir:'up',foot:w?w.prod:'Nothing is open'}); })()}
  ${(()=>{ const b = A.slice().sort((x,y)=>(y.save||0)-(x.save||0))[0];
    return kpi({k:'Highest-Value Fix',ic:'savings',v:b?moneyK(b.save):'—',
      delta:b?'A year, if actioned':'',dir:'gup',foot:b?b.prod:'Nothing to action'}); })()}
  ${(()=>{ const prods = [...new Set(A.map(a=>a.prod).filter(Boolean))];
    return kpi({k:'Products Affected',ic:'product',v:String(prods.length),
      foot:prods.length?prods.slice(0,2).join(', ')+(prods.length>2?' and '+(prods.length-2)+' more':'')
                       :'No product has an open alert'}); })()}
  ${(()=>{ const owners = [...new Set(A.map(a=>a.owner).filter(Boolean))];
    return kpi({k:'Owners On The Hook',ic:'users',v:String(owners.length),
      foot:owners.length?'Every alert names one':'Nobody is waiting on a decision'}); })()}

  ${card({span:12,title:'Alert Feed',sub:'Severity first, then by the money on the table. Every row opens the steps that clear it.',pad:false,
    body:A.length ? rowList(A.map(alertRow),'alerts')
      : emptyState('No Alerts Match These Filters','Clear the Product filter to see the whole feed. An empty feed here means nothing was selected, not that nothing is open.'),
    note:A.length?`Every row names an owner and a recommended action — an alert carrying neither is noise, not information. Clearing all <b>${A.length}</b> returns <b>${moneyK(Math.round(sum(A.map(a=>a.save))*10)/10)} a year</b>.`
      :''})}
  </div>`;
};

/* ---------- 16. Data sources ---------- */
/* CIO pick, not specified.  This screen is not about money at all, so the
   counterfoil answers the only question it can: can the board above be trusted?
   Feeds first, then the two figures that say what the feeds bought — how much of
   the bill is traceable, and how much is not. */
S.sources = () => head('Data Model','Every system behind every number in this platform.','Reference',
    [['Feeds Healthy',D.sources.filter(r=>/^healthy$/i.test(String(r[3]||'Healthy'))).length+' of '+D.sources.length,
      'automated and current','pos'],
     ['Allocation Coverage',share(D.ytdActual-D.unallocated,D.ytdActual),'traceable to an owner'],
     ['Unallocated Spend',money(D.unallocated),'no product or owner tag','warn']])
  + `<div class="grid">
  ${/* ROUND 15: this screen had NO KPI tiles at all, which made it the third
        layout in a product that is meant to have one — placeSummary() needs a
        leading run of tiles to build the region, so with none it returned early and
        the insight band rendered raw in the flow, with no headline and no tab
        control above it.  "Users remember the previous screen layout, and a sudden
        change in presentation does not help them" is about a screen going from
        tabbed to stacked; going from tabbed to neither is the same fault further on.

        Four tiles that answer the only question a lineage screen owes the board:
        can the numbers above be trusted.  Every one is read off the `sources`
        tuples the table below already prints — nothing here is invented to fill a
        row, which is the trap this whole exercise has to avoid.  No sparklines and
        no YTD bylines: a feed catalogue has no monthly history (SCHEMA.md, "What
        deliberately has NO series"). */''}
  ${/* The slowest cadence, not a count of the fastest.  "Daily feeds: 6 of 12" was
        the first version and it lied by omission — four of the other six are HOURLY,
        so the figure read as a shortfall where the truth was the opposite.  What a
        reader of a lineage screen actually needs is the ceiling: the board is only
        as fresh as its laggard, whatever the other eleven do. */''}
  ${(()=>{ const RANK = {hourly:1,daily:2,weekly:3,monthly:4,quarterly:5};
    const rk = r => RANK[String(r[2]||'Daily').toLowerCase()] || 3;
    const slow = D.sources.length ? Math.max(...D.sources.map(rk)) : 0;
    const on = D.sources.filter(r=>rk(r)===slow);
    return kpi({k:'Slowest Refresh',ic:'calendar',v:on.length?on[0][2]:'—',
      delta:on.length?on.length+' system'+(on.length===1?'':'s'):'',dir:'flat',
      foot:on.length?'The board is only as fresh as this':'Nothing is feeding the model yet'}); })()}
  ${(()=>{ const doms = [...new Set(D.sources.map(r=>r[1]).filter(Boolean))];
    return kpi({k:'Domains Covered',ic:'layers',v:String(doms.length),
      foot:doms.length?doms.slice(0,3).join(' · ')+(doms.length>3?' and '+(doms.length-3)+' more':'')
                      :'Nothing is feeding the model yet'}); })()}
  ${/* NOT the arithmetic complement of the strip's "Feeds Healthy 7 of 12" — the
        strip counts, this NAMES.  Which system is the thing you can act on, and it
        is the only place on the screen outside a twelve-row table that says it. */''}
  ${(()=>{ const bad = D.sources.filter(r=>!/^healthy$/i.test(String(r[3]||'Healthy')));
    return kpi({k:'Feeds Needing Attention',ic:'alerts',v:String(bad.length),
      delta:bad.length?bad[0][3]:'',dir:bad.length?'up':'gup',
      foot:bad.length?bad[0][0]:'Every feed is current'}); })()}
  ${(()=>{ const man = D.sources.filter(r=>/manual|upload|csv/i.test(String(r[2]||'')+' '+String(r[3]||'')));
    return kpi({k:'Feeds With A Manual Step',ic:'tag',v:String(man.length),
      foot:man.length?man.map(r=>r[0]).slice(0,2).join(', ')
                     :'Nothing on this board is keyed by hand'}); })()}

  ${card({span:12,title:'How A Dollar Becomes A Decision',body:flowDiagram(),
    note:'Cost data is meaningless until it carries a product, an owner and a cost centre. <b>Stage 03 is where the value is created</b> — everything after it is presentation.'})}

  ${(()=>{ const bad = D.sources.filter(r=>r[3]!=='Healthy');
    return card({span:6,title:'Connected Sources',sub:D.sources.length+' systems feeding the platform',pad:false,body:table(
    [{t:'Source System'},{t:'Feeds'},{t:'Cadence'},{t:'Status'}],
    D.sources.map(r=>[`<b>${r[0]}</b>`,`<span class="sub">${r[1]}</span>`,r[2]||'Daily',
      badge(r[3]||'Healthy',r[3]==='Healthy'||!r[3]?'ok':/degraded/i.test(r[3])?'high':'med')]),
    null),
    note:bad.length?`<b>${bad.length} of ${D.sources.length}</b> feeds are not fully automated — ${bad.map(r=>r[0]).join(', ')}. That is where the reconciliation gap comes from.`
      :'Every feed is healthy and automated, so the reconciliation gap is not a data-collection problem.'}); })()}
  ${/* The eight rules are the platform's own logic, so they are reference data.
       Their COVERAGE is the customer's, so it moves with the dataset: each rule
       sits at the allocation coverage plus a fixed per-rule offset, and the four
       deterministic rules are always 100% because they compute rather than match. */''}
  ${card({span:6,title:'Enrichment Rules',sub:'How a raw cost line becomes an allocated one',pad:false,body:table(
    [{t:'Rule'},{t:'Applies To'},{t:'Coverage',r:true}],
    (()=>{ const cov = D.ytdActual ? (D.ytdActual-D.unallocated)/D.ytdActual*100 : 0;
      return [['Product tag from resource tag','All cloud resources',0],
        ['Product from Jira project mapping','Application costs',-4.4],
        ['Owner from HR directory','All resources',-1.9],
        ['Cost centre from department mapping','All spend',-0.7],
        ['Shared cost split by headcount','Shared services',null],
        ['Amortise annual prepayments monthly','SaaS contracts',null],
        ['Blend commitment discounts into unit rate','Cloud compute',null],
        ['Attribute AI tokens to calling application','AI API spend',-7.2]
      ].map(r=>[`<b>${r[0]}</b>`,`<span class="sub">${r[1]}</span>`,
        utilCell(r[2]===null?100:Math.round(Math.min(99,Math.max(50,cov+r[2]))))]);
    })(),
    /* order:'keep' — these eight rules run in this order, each operating on what
       the last one left.  Sorted by coverage they would all still be true and
       would no longer describe a pipeline. */
    null, {order:'keep'}),
    note:'Any number in this platform can be traced back to one of these eight rules. When a figure looks wrong, the rule is usually the reason.'})}
  </div>`;

/* ============================================================
   Interaction — the two things on these screens that are not just a re-render
   ------------------------------------------------------------
   This is the one place in screens.js that runs at load time, and it is
   deliberate.  Both screens are rewritten wholesale on every filter, dataset and
   navigation change, so anything bound to an element inside them would be bound
   to an element that no longer exists a moment later — the same reason Export
   and Share are delegated in shell.js.  Listening on `document` and asking
   "did this click land on one of mine?" survives every re-render for free, and
   the selectors below only exist on the anomalies and alerts screens, so they
   need no further guard on `current`.
   ============================================================ */

/* ---- the resolution dialog (§7) ----
   The first modal in the mock-up, so it sets the pattern.

   PORTALLED TO <body>, exactly like the filter menus in shell.js and for the
   same reason: a popover appended inside its own screen was invisible for a
   whole feedback round, because an ancestor with overflow on one axis clips on
   both, and the symptom read as "the control does nothing".  Out on <body>
   nothing can clip it, whatever the card it was opened from is doing.

   The rest is the standard dialog contract — aria-modal, a focus trap, Escape,
   click-outside, a scroll lock, and focus handed back to the button that opened
   it — written out rather than delegated to <dialog>, because showModal()'s
   ::backdrop and its focus behaviour are harder to keep consistent with the rest
   of this mock-up's chrome than these lines are to read. */
let MODAL = null, modalReturn = null;
const MODAL_FOCUS = 'button:not([disabled]),[href],select,input,textarea,[tabindex]:not([tabindex="-1"])';

function closeModal(){
  if(!MODAL) return;
  MODAL.remove(); MODAL = null;
  document.documentElement.classList.remove('mdl-open');
  /* Focus goes back where it came from, not to <body> — otherwise the next Tab
     starts again at the top of the sidebar. */
  if(modalReturn && document.contains(modalReturn)) modalReturn.focus();
  modalReturn = null;
}

function openModal(inner,label,trigger){
  closeModal();
  const scrim = document.createElement('div');
  scrim.className = 'mdl-scrim';
  scrim.innerHTML = `<div class="mdl" role="dialog" aria-modal="true" tabindex="-1"
    aria-label="${attrEsc(label)}">${inner}</div>`;
  /* Only a click that both STARTS and ends on the scrim closes it, so a text
     selection dragged out of the dialog does not dismiss what you were reading. */
  let downOnScrim = false;
  scrim.addEventListener('mousedown', e=>{ downOnScrim = e.target===scrim; });
  scrim.addEventListener('click', e=>{ if(e.target===scrim && downOnScrim) closeModal(); });
  scrim.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ e.stopPropagation(); closeModal(); return; }
    if(e.key!=='Tab') return;
    const f = [].slice.call(scrim.querySelectorAll(MODAL_FOCUS)).filter(n=>n.offsetParent!==null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1], at = document.activeElement;
    /* The dialog box itself holds focus on open and is not in that list, so the
       trap has to catch "focus is on the container" as well as the two ends. */
    if(f.indexOf(at)<0){ e.preventDefault(); (e.shiftKey?last:first).focus(); }
    else if(e.shiftKey && at===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && at===last){ e.preventDefault(); first.focus(); }
  });
  /* Locking the page costs it its scrollbar, which widens the board behind the
     dialog by ~15px and makes the whole thing jump as it opens.  The width the
     scrollbar was taking is handed straight back as padding, so nothing moves. */
  document.documentElement.style.setProperty('--sbw',
    (window.innerWidth - document.documentElement.clientWidth) + 'px');
  document.documentElement.classList.add('mdl-open');
  document.body.appendChild(scrim);
  MODAL = scrim; modalReturn = trigger || null;
  scrim.querySelector('.mdl').focus();
}

/* The steps for ONE alert.  Everything in here is derived from that alert — see
   the playbooks above — so a Critical AI overspend and a Medium licence tidy-up
   do not open the same dialog with a different heading on it. */
function openAlertModal(a,trigger){
  const steps = alertSteps(a);
  openModal(`
    <div class="mdl-h">
      <div class="mdl-tags">${sevBadge(a.sev)}<span class="mdl-meta">${a.prod} · ${personCell(a.owner,'sm')}</span></div>
      <h2>${a.t}</h2>
      <button class="iconbtn mdl-x" type="button" data-mdl-close aria-label="Close">
        <span aria-hidden="true">×</span></button>
    </div>
    <div class="mdl-b">
      <p class="mdl-stake">${alertStake(a)}</p>
      <div class="mdl-figs">
        <div><span>Impact</span><b>${a.impact?moneyK(a.impact)+' / mo':'None yet'}</b></div>
        <div><span>Saving if actioned</span><b class="good">${moneyK(a.save)} / yr</b></div>
        <div><span>Act by</span><b>${SEV_WINDOW[a.sev]||'Soon'}</b></div>
      </div>
      <h3 class="mdl-sh">How This Gets Cleared</h3>
      <ol class="mdl-steps">${steps.map(s=>`<li><b>${s.t}</b><p>${s.d}</p></li>`).join('')}</ol>
      <p class="mdl-honest">These steps are the standing guidance for this class of alert. Assign it
        to change the owner, snooze it to bring it back when the window matters, or dismiss it once
        the line has moved.</p>
    </div>
    <div class="mdl-f">
      <button class="btn sm" type="button" data-mdl-act="assign">Assign to ${a.owner}</button>
      <button class="btn sm" type="button" data-mdl-act="snooze">Snooze 7 days</button>
      <button class="btn sm" type="button" data-mdl-act="dismiss">Dismiss</button>
      <button class="btn pri sm" type="button" data-mdl-act="done">Mark as resolved</button>
    </div>`, 'Resolve: '+a.t, trigger);
  /* Prefixed, and not `data-alert`.  The row's button carries data-alert, the
     delegated handler below looks for the nearest one, and a bare `data-alert`
     here made the whole dialog an ancestor match — so every click inside it was
     read as "open the alert numbered NaN" and the footer buttons did nothing. */
  MODAL.dataset.mdlTitle = a.t;
  MODAL.dataset.mdlOwner = a.owner;
}

/* Seven days on from the workspace's own as-of date, not from the wall clock.
   Every other date in the product is anchored to D.meta.asOf — a confirmation
   that jumped to today's real date would be the one line on the screen
   disagreeing with the dataset it belongs to. */
function snoozeUntil(){
  const base = (typeof parseDate==='function' && parseDate(D.meta.asOf)) || new Date();
  const d = new Date(base.getTime() + 7*864e5);
  return d.getDate() + ' ' + MONTHS3[d.getMonth()] + ' ' + d.getFullYear();
}

/* Each confirmation says what the action DID, in the product's own terms.  They
   used to end with "this is a concept mock-up" instead, which is a fact about
   the artefact rather than about the alert the reader just acted on. */
const MDL_ACT = {
  assign:  m => ['Assigned to '+m.dataset.mdlOwner, 'They will see it at the top of their feed.'],
  snooze:  m => ['Snoozed for 7 days', 'It returns to the feed on '+snoozeUntil()+'.'],
  dismiss: m => ['Alert dismissed', 'It will not return unless the line moves again.'],
  done:    m => ['Marked as resolved', m.dataset.mdlTitle]
};

document.addEventListener('click', e=>{
  /* Open or close one anomaly.  The state lives on the element, so it resets on
     the next render — an anomaly left open under one filter should not decide
     the height of the card under the next.
     The CLASS is the state and `aria-expanded` follows it, rather than the other
     way round.  Reading state back out of an attribute that shared chrome also
     writes is exactly how this broke while it was being built: closeMenus() was
     clearing every `[aria-expanded="true"]` in the document, so an open row read
     as collapsed and the next click on it inverted.  shell.js now scopes that
     reset to its own MENU_TRIGGERS, but state only this handler owns is still
     the right shape. */
  const ah = e.target.closest('.anom-h');
  if(ah){
    const row = ah.closest('.row'), open = row.classList.contains('open');
    row.classList.toggle('open', !open);
    ah.setAttribute('aria-expanded', String(!open));
    const panel = document.getElementById(ah.getAttribute('aria-controls'));
    if(panel) panel.hidden = open;
    return;
  }
  const ab = e.target.closest('button[data-alert]');
  if(ab){
    /* Indexed into the LIVE, SORTED view rather than carrying the alert's own
       data in the attribute: ALERT_VIEW is rebuilt by the same render that wrote
       this button, so the index cannot point at a stale — or a differently
       ordered — row. */
    const a = ALERT_VIEW[+ab.dataset.alert];
    if(a) openAlertModal(a, ab);
    return;
  }
  if(e.target.closest('[data-mdl-close]')){ closeModal(); return; }
  const act = e.target.closest('[data-mdl-act]');
  if(act && MODAL){
    const msg = (MDL_ACT[act.dataset.mdlAct]||MDL_ACT.done)(MODAL);
    closeModal(); toast(msg[0], msg[1]);
  }
});
/* shell.js also listens for Escape, to close its menus.  This one is registered
   first (screens.js loads before shell.js) and stops the event only while a
   dialog is actually open, so the two never fight over one keypress. */
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && MODAL){ e.stopPropagation(); closeModal(); }
});
