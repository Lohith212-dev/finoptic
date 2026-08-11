/* The reconciliation strip: six per-screen lanes, all labelled and valued, still
   readable collapsed, and — since round 14 — NOT duplicated by a KPI tile on the
   same screen.

   That last check used to be its exact opposite: a stat had to EQUAL the tile of the
   same name, which proved the two renderings of one expression had not drifted. The
   reviewer read that guarantee as waste — "the KPIs displayed there are duplicated
   in the reconciliation bar" — and he was right that it was the same number twice.
   The tiles went; the assertion inverted with them. See the block at the check
   itself for what that costs. */
const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources'];
const DS=['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
/* Stats with no tile of the same name, and why that is correct. */
/* A stat may be labelled more tightly than its tile — the counterfoil has far less
   room than a card. The VALUE must still match, so these are checked through an
   alias rather than skipped. */
const ALIAS={
  'Unallocated':'Unallocated Spend',
  'Below 50% Used':'Applications Below 50% Used',
  'Identified Savings':'Total Identified Savings',
  'Forecast Year-End':'Baseline Year-End Forecast'
};
/* The data-model screen genuinely has no KPI tiles to compare against. */
const NO_TILE_SCREEN={sources:1};
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);

  const bad=[], drift=[]; let checked=0, matched=0;
  for(const d of DS){
    await p.evaluate(id=>{loadScenario(id);refresh();}, d);
    for(const s of SCR){
      const r=await p.evaluate(sc=>{ go(sc);
        const t=n=>(n?n.textContent:'').replace(/\u00a0/g,' ').trim();
        const cells=[...document.querySelectorAll('#screen .ledger-stats .ledger-cell')]
          .map(c=>({k:t(c.querySelector('.ledger-k')), v:t(c.querySelector('.ledger-v'))}));
        /* every KPI tile on the screen, by label */
        const tiles={};
        document.querySelectorAll('#screen .kpi').forEach(k=>{
          tiles[t(k.querySelector('.kpi-k'))]=t(k.querySelector('.kpi-v'));
        });
        const strip=document.querySelector('#screen .ledger');
        return {cells, tiles, fresh:strip?strip.classList.contains('fresh'):null};
      }, s);
      const tag=d+'/'+s;
      if(!r.cells.length){ bad.push(tag+': no counterfoil stats'); continue; }
      /* SIX lanes, not two or three.  This assertion predates 14.6: the strip used
         to be a `.ledger-eq` group of three figures plus a `.ledger-stats`
         counterfoil of two or three, and this counted the counterfoil.  When the
         strip became six equal lanes with no operator and no seam, all six moved
         into `.ledger-stats` and the check has been reporting 6-where-it-wanted-3
         on every screen of every dataset ever since — it just could not say so,
         because it threw on the missing `.ledger-eq` before reaching this line. */
      if(r.cells.length!==6) bad.push(tag+': '+r.cells.length+' lanes (want 6)');
      r.cells.forEach(c=>{
        if(!c.k) bad.push(tag+': a stat has no label');
        if(!c.v) bad.push(tag+': "'+c.k+'" has no value');
        if(/NaN|undefined|Infinity/.test(c.v+c.k)) bad.push(tag+': bad text in "'+c.k+'" = '+c.v);
        if(r.fresh) return;                     /* the day-one strip is all em dashes */
        if(NO_TILE_SCREEN[s]) return;
        checked++;
        /* ---- INVERTED IN ROUND 14, deliberately ----
           This used to assert that every strip stat EQUALS a KPI tile — "225 of 225"
           — because the stats are passed in from the renderer's own locals and
           matching the tile proved the two copies had not drifted.

           That guarantee is exactly what the reviewer read as waste: "the KPIs
           displayed there are duplicated in the reconciliation bar; repeating the
           same information adds no value."  The tiles that were the second copy are
           gone, so a stat matching a tile is now the DEFECT rather than the proof.

           What is lost with it is real and worth stating: the strip's figures no
           longer have a second computation to be checked against, because there is
           only one of each now.  One copy cannot drift from itself, but it also
           cannot be cross-examined — the arithmetic behind these six lanes is
           checked by the dataset invariants (SCHEMA.md) rather than by a duplicate
           on the same screen.  test-metrics.js owns the no-repeat rule. */
        const key = (c.k in r.tiles) ? c.k : (ALIAS[c.k] in r.tiles ? ALIAS[c.k] : null);
        if(key && r.tiles[key]===c.v)
          drift.push(tag+': "'+c.k+'" is STILL duplicated by tile ['+key+'] = '+c.v);
        else matched++;
      });
      if(d==='baseline') console.log('  '+s.padEnd(11)+' '+r.cells.map(c=>c.k+' '+c.v).join('  |  '));
    }
  }
  /* collapsed: the stats must still be on screen, and nothing may overflow.
     Driven through the REAL toggle, not by writing the attribute — and asserting
     flexDirection, because "labels visible on one row" is also true of the expanded
     state, so the first version of this check passed without ever collapsing. */
  await p.evaluate(()=>{loadScenario('baseline');refresh();go('security');});
  await wait(250);
  await p.click('#ledger-toggle'); await wait(400);
  const col=await p.evaluate(()=>{
    const st=document.querySelector('#screen .ledger-stats');
    /* There is no .ledger-eq any more: the strip became SIX EQUAL LANES with no
       operator and no seam (14.6 / "treat all six as equally important"), and this
       harness kept querying the element that change deleted — so it threw on a null
       box rather than reporting anything. The overlap it was guarding against is
       now between the first lane and the last, which is what is measured instead. */
    const cellsAll=[...st.querySelectorAll('.ledger-cell')];
    const eq={getBoundingClientRect:()=>cellsAll[0].getBoundingClientRect()};
    const l=document.querySelector('#screen .ledger');
    return {statsVisible:st.offsetHeight>0, labelVisible:st.querySelector('.ledger-k').offsetHeight>0,
      collapsed:document.documentElement.getAttribute('data-ledger')==='min',
      cellDisplay:getComputedStyle(st.querySelector('.ledger-cell')).display,
      subShown:st.querySelector('.ledger-sub').offsetHeight>0,
      /* label and value share a BASELINE, not a box top — different font sizes, so
         their tops legitimately differ. What must be true is that the sub sits on a
         line BELOW the value, and the label beside it rather than above it. */
      subBelowValue:(()=>{ const c=st.querySelector('.ledger-cell');
        const v=c.querySelector('.ledger-v').getBoundingClientRect();
        const sb=c.querySelector('.ledger-sub').getBoundingClientRect();
        return sb.top >= v.bottom - 3; })(),
      labelBesideValue:(()=>{ const c=st.querySelector('.ledger-cell');
        const k=c.querySelector('.ledger-k').getBoundingClientRect();
        const v=c.querySelector('.ledger-v').getBoundingClientRect();
        return k.right <= v.left + 1; })(),
      rows:new Set([...st.querySelectorAll('.ledger-cell')].map(c=>Math.round(c.getBoundingClientRect().top))).size,
      overflow:l.scrollWidth>l.clientWidth+1, ledgerH:Math.round(l.getBoundingClientRect().height),
      eqRight:Math.round(eq.getBoundingClientRect().right), statsLeft:Math.round(st.getBoundingClientRect().left),
      lanes:cellsAll.length};
  });
  console.log('\ncollapsed:', JSON.stringify(col));
  if(!col.collapsed) bad.push('collapsed: the toggle did not collapse it');
  /* The collapsed cell is a two-line GRID — label and value sharing a baseline on
     the first line, the sub spanning both tracks on the second (14.6).  An earlier
     version of this harness asserted a one-line flex row with the sub hidden,
     which was the design before the sub-lines were asked back in. */
  if(col.cellDisplay!=='grid') bad.push('collapsed: cell is '+col.cellDisplay+', expected grid');
  if(!col.subShown) bad.push('collapsed: stat sub-lines are hidden');
  if(!col.subBelowValue) bad.push('collapsed: sub is not on the line below the value');
  if(!col.labelBesideValue) bad.push('collapsed: label is not beside the value');
  if(col.ledgerH>66) bad.push('collapsed: ledger is '+col.ledgerH+'px, expected two lines');
  if(!col.statsVisible) bad.push('collapsed: stats hidden');
  if(!col.labelVisible) bad.push('collapsed: stat labels hidden');
  if(col.rows>1) bad.push('collapsed: stats wrapped to '+col.rows+' rows');
  if(col.overflow) bad.push('collapsed: ledger overflows');
  if(col.lanes!==6) bad.push('collapsed: '+col.lanes+' lanes, expected 6');
  console.log(`tile cross-check: ${matched}/${checked} stats are NOT duplicated by a tile`);
  console.log(drift.length?'DRIFT:\n  '+[...new Set(drift)].join('\n  '):'no drift between strip and tiles');
  console.log(bad.length?'FAIL:\n  '+[...new Set(bad)].join('\n  '):'counterfoil OK');
  console.log(errs.length?'ERRORS: '+[...new Set(errs)].join(' | '):'no js errors');
  await b.close();
})();
