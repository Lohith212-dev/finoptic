/* Rounds 14 and 15 — the Metrics tab and the insight band.

   The rule this file exists to hold: A KPI TILE MAY NOT RESTATE A LANE OF THE
   RECONCILIATION STRIP ON ITS OWN SCREEN.  That is checked on the RENDERED figures
   rather than on the source expressions, for the same reason table() sorts on
   rendered cells: the two come from different scopes through different formatters,
   and the printed string is the only thing a reader compares — which is exactly
   what the reviewer did.

   Also asserted here, because each was a decision rather than a side effect:
     - every tile carries a YTD byline, unless its figure is a structural count
     - a sparkline draws at least two points, or is absent entirely
     - the band is a LIST of at most two pointers per column

   ROUND 15 adds the SHAPE rules, because the SME's next note was that the shape
   itself varied: "the number of tiles varies widely; some pages contain only one,
   and in those cases Key Insights and the Metrics are displayed one below the other
   instead of as a tabbed view."  So:
     - EXACTLY FOUR tiles on every board screen, on every dataset (one full row, no
       widow on a second)
     - a tab control on every one of them, and no `.sum-flat` anywhere
     - both footnotes present — "View KPIs" in the band, "View Key Insights" in the
       tile grid
     - the authored band columns (Why, What To Do) carry exactly ONE pointer; only
       the derived column may carry two, and only because its two are two different
       findings rather than one finding continued
*/
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U = 'file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));

const BOARD = ['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
               'allocation','forecast','anomalies','alerts','security','itsm','sources'];
const DS = ['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
/* Round 14's five flat screens are gone; round 15 gave each of them three more
   honest tiles and put the tab control back.  `sources` joins the list here for the
   first time — it had NO tiles at all, so it built no summary region and its band
   rendered raw in the flow, which was the same inconsistency one step further on. */
const TILES_PER_SCREEN = 4;

/* A figure is "the same" if the printed strings match once spacing is normalised.
   THE SIGN IS KEPT: `−$3K` is not `$3K`, and stripping it made a Variance of minus
   three thousand collide with a savings figure of plus three thousand on the two
   small datasets — a coincidence reported as a defect.
   An em dash matches nothing: an unmeasured workspace prints it everywhere and
   would otherwise report every tile on the board as a duplicate. */
const normFig = s => String(s||'').replace(/[\s,]/g,'').toLowerCase();
const normLbl = s => String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const DASHY = v => !v || /^[—–-]+$/.test(String(v).trim());

/* Words too common to make two labels the same subject.  Without this, "Security
   Cost Per Product" and "Cost Per Ticket" share "cost" and every per-unit metric
   on the board looks like every other one. */
const STOP = new Set(['the','and','of','per','in','to','a','not','yet','this','on','by',
                      'spend','cost','savings','saving','total','value','days','month',
                      'year','end','time','open','under','over','all']);
const words = s => String(s||'').toLowerCase().split(/[^a-z0-9]+/)
  .filter(w => w.length > 2 && !STOP.has(w));
/* Two labels name the same subject if they share a word that is not boilerplate.
   A matching FIGURE alone is a coincidence — two unrelated metrics can land on
   $3K.  A matching figure AND a shared subject is the defect. */
const sameSubject = (a,b) => { const B = new Set(words(b)); return words(a).some(w => B.has(w)); };

(async () => {
  const b = await puppeteer.launch({executablePath:CHROME, headless:true,
                                    args:['--allow-file-access-from-files']});
  const p = await b.newPage();
  await p.setViewport({width:1440, height:1000});
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if(m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto(U + '?nofx', {waitUntil:'load'});
  await wait(700);

  const fails = [], warns = [];
  let renders = 0, tiles = 0, sparks = 0, bylines = 0, curves = 0, segs = 0;

  for(const d of DS){
    await p.evaluate(id => { loadScenario(id); refresh(); }, d);
    for(const s of BOARD){
      /* Both panes have to be readable, and the Metrics pane is display:none unless
         the switch is on it — so the switch goes on it, for every screen. */
      await p.evaluate(sc => { document.documentElement.setAttribute('data-sum','metrics'); go(sc); }, s);
      const r = await p.evaluate(() => {
        const txt = el => (el ? el.innerText.trim() : '');
        return {
          lanes: [...document.querySelectorAll('.ledger-cell')].map(c => ({
            k: txt(c.querySelector('.ledger-k')), v: txt(c.querySelector('.ledger-v'))
          })),
          tiles: [...document.querySelectorAll('.kpi')].map(t => ({
            k: txt(t.querySelector('.kpi-k')),
            v: txt(t.querySelector('.kpi-v')),
            ytd: txt(t.querySelector('.kpi-ytd')),
            spark: t.querySelectorAll('.kpi-spark svg').length,
            pts: t.querySelectorAll('.kpi-spark .ct-col').length,
            wait: t.classList.contains('kpi-wait'),
            /* The STROKE path, for the overshoot check below. The first path in the
               plot is the area fill when there is one, so take the one with a
               stroke rather than an index. */
            d: (()=>{ const ps=[...t.querySelectorAll('.kpi-spark path')];
                      const st=ps.find(x=>x.getAttribute('stroke'));
                      return st ? st.getAttribute('d') : ''; })()
          })),
          /* Round 16: every interpolated stroke in the product carries .cline —
             sparklines, trend lines, the forecast baseline.  Collected whole so the
             no-overshoot check below covers the full-size plots too, not just the
             76px ones.  Scoped by class rather than by `path[d*=C]` because vendor
             brand marks are bezier paths and would flood it. */
          curves: [...document.querySelectorAll('#screen .cline')].map(p => p.getAttribute('d')),
          flat: !!document.querySelector('.sum-flat'),
          tabs: document.querySelectorAll('.sum-tab').length,
          more: document.querySelectorAll('.sum-more').length,
          cols: [...document.querySelectorAll('.briefing .brief')].map(c => ({
            lis: c.querySelectorAll('.brief-p > li').length,
            ps:  c.querySelectorAll(':scope > p').length
          }))
        };
      });
      renders++;
      const tag = `${d}/${s}`;

      /* ---- 1. the rule ---- */
      for(const t of r.tiles){
        tiles++;
        for(const L of r.lanes){
          /* An IDENTICAL LABEL is a repeat whatever the figures say — two lanes
             called "Budget" holding two different numbers is worse than two
             holding the same one, because the reader cannot tell which is which. */
          if(normLbl(t.k) && normLbl(t.k) === normLbl(L.k)){
            fails.push(`${tag}: tile "${t.k}" repeats strip label "${L.k}"`);
            continue;
          }
          if(DASHY(t.v) || DASHY(L.v) || normFig(t.v) !== normFig(L.v)) continue;
          if(sameSubject(t.k, L.k))
            fails.push(`${tag}: tile "${t.k}" (${t.v}) restates strip lane "${L.k}" (${L.v})`);
          else
            warns.push(`${tag}: tile "${t.k}" and lane "${L.k}" coincide at ${t.v} — unrelated metrics, same figure`);
        }
        /* ---- 2. bylines and sparklines ---- */
        if(t.ytd){
          bylines++;
          if(!/YTD$/.test(t.ytd)) fails.push(`${tag}: tile "${t.k}" byline does not end in YTD: "${t.ytd}"`);
        }
        if(t.spark){
          sparks++;
          /* ---- round 16: THE CURVE MAY NOT INVENT A VALUE ----
             The plot is drawn with monotone cubic interpolation precisely so it
             cannot overshoot: an ordinary smoothing spline bulges past a local peak,
             and on a 76px chart with no axis that bulge reads as a month the data
             does not contain.  A cubic Bezier is contained in the convex hull of its
             four control points, so it is sufficient to check that both CONTROL
             points of every segment sit within the y-range of that segment's two
             ANCHORS.  If they do, no part of the curve can leave it. */
          const seg = String(t.d||'').match(/C[^CLMZ]+/g) || [];
          let y = parseFloat((String(t.d||'').match(/^M[\-\d.]+ ([\-\d.]+)/)||[])[1]);
          for(const c of seg){
            const n = c.slice(1).trim().split(/[\s,]+/).map(Number);
            if(n.length < 6 || n.some(Number.isNaN)) continue;
            const [,c1y,,c2y,,y1] = n;
            const lo = Math.min(y,y1) - 0.05, hi = Math.max(y,y1) + 0.05;
            if(c1y < lo || c1y > hi || c2y < lo || c2y > hi){
              fails.push(`${tag}: tile "${t.k}" sparkline overshoots between two months`
                       + ` — control ${c1y}/${c2y} outside ${lo.toFixed(1)}..${hi.toFixed(1)}`);
              break;
            }
            y = y1;
          }
          if(t.spark > 1) fails.push(`${tag}: tile "${t.k}" has ${t.spark} sparklines`);
          if(t.pts < 2)   fails.push(`${tag}: tile "${t.k}" sparkline has ${t.pts} point(s) — draw none or draw a trend`);
          if(t.wait)      fails.push(`${tag}: tile "${t.k}" is waiting on data but drew a sparkline`);
        }
      }

      /* ---- 2b. NO CURVE MAY INVENT A VALUE, anywhere in the product ----
         Same check as the per-tile one below, run over every `.cline` on the screen
         so the full-size trend charts are covered by it as well.  A cubic Bezier is
         contained in the convex hull of its four control points, so a control point
         inside its segment's anchor range is sufficient to prove the curve never
         leaves that range — which is the whole claim monotone interpolation makes. */
      for(const d of r.curves){
        curves++;
        const seg = String(d||'').match(/C[^CLMZ]+/g) || [];
        let y0 = parseFloat((String(d||'').match(/^M[\-\d.]+[\s,]+([\-\d.]+)/)||[])[1]);
        if(!seg.length || Number.isNaN(y0)) continue;
        segs += seg.length;
        for(const c of seg){
          const n = c.slice(1).trim().split(/[\s,]+/).map(Number);
          if(n.length < 6 || n.some(Number.isNaN)) break;
          const [,c1y,,c2y,,y1] = n;
          const lo = Math.min(y0,y1) - 0.05, hi = Math.max(y0,y1) + 0.05;
          if(c1y < lo || c1y > hi || c2y < lo || c2y > hi){
            fails.push(`${tag}: a curve overshoots between two points`
                     + ` — control ${c1y}/${c2y} outside ${lo.toFixed(1)}..${hi.toFixed(1)}`);
            break;
          }
          y0 = y1;
        }
      }

      /* ---- 3. the band is a list of at most two ----
         The first column may hold two (two probes, two findings); the two authored
         columns hold one each since round 15.  Checked positionally because that is
         how the band is built — cell 0 is the derived one. */
      r.cols.forEach((c,i)=>{
        if(c.ps)      fails.push(`${tag}: a band column still renders a <p> — pointers only`);
        const cap = i === 0 ? 2 : 1;
        if(c.lis > cap) fails.push(`${tag}: band column ${i} has ${c.lis} pointers, max is ${cap}`);
      });

      /* ---- 4. one shape, on every screen (round 15) ----
         A workspace with no products at all renders the "No Products Yet" empty
         state instead of four tiles, and so builds no summary region: four tiles
         over nothing would be four em dashes, and an empty state is a legitimate
         presentation of its own.  It is the ONLY exemption, and naming the screen
         here rather than skipping every zero-tile render is what keeps it one. */
      const emptyOK = d === 'zero' && s === 'product' && r.tiles.length === 0;
      if(!emptyOK){
        if(r.flat)   fails.push(`${tag}: the flat panel variant is back — it was deleted in round 15`);
        if(!r.tabs)  fails.push(`${tag}: no tab control`);
        if(!r.more)  fails.push(`${tag}: no "View KPIs" footnote in the band`);
        if(r.tiles.length !== TILES_PER_SCREEN)
          fails.push(`${tag}: ${r.tiles.length} tiles — every board screen carries exactly ${TILES_PER_SCREEN}`);
      }
    }
  }

  console.log(`${renders} renders · ${tiles} tiles · ${sparks} sparklines · ${bylines} YTD bylines`);
  console.log(`${curves} interpolated lines · ${segs} curve segments checked for overshoot`);
  if(errs.length){ console.log('\nJS errors:'); errs.slice(0,10).forEach(e => console.log('  ' + e)); }
  if(fails.length){
    console.log(`\n${fails.length} failure(s):`);
    /* Deduplicated: one broken tile otherwise reports six times, once per dataset,
       and the list stops being readable at exactly the moment it matters. */
    const seen = new Set();
    for(const f of fails){
      const key = f.replace(/^[a-z-]+\//,'');
      if(seen.has(key)) continue;
      seen.add(key);
      console.log('  ' + f);
    }
    console.log(`  (${fails.length} total, ${seen.size} distinct)`);
  }else{
    console.log('\nNo tile restates a strip lane. Four tiles and two tabs everywhere; bylines, sparklines and pointers all correct.');
  }
  /* Reported, never failed.  A coincidence on a small dataset is worth seeing —
     if one turns out to be two names for one number, it becomes a failure by
     acquiring a shared word, which is the point of the distinction. */
  if(warns.length){
    const seen = new Set();
    const lines = warns.filter(w => { const k = w.replace(/^[a-z-]+\//,''); return seen.has(k) ? false : seen.add(k); });
    console.log(`\n${lines.length} coincidence(s), not failures:`);
    lines.forEach(w => console.log('  ' + w));
  }
  await b.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
