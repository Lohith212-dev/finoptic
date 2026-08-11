/* OBSOLETE — kept as a record, not run.
   =====================================
   This harness measured the SEAM inside the reconciliation strip: the boundary
   between the `.ledger-eq` equation block and the `.ledger-stats` counterfoil, and
   the `.ledger-perf` perforation drawn on it.

   Rule 14.6 deleted the thing it tests.  The strip became six equal lanes — "there
   is no operator between any of them any more, and no seam splitting the row into
   two groups; dropping both is what makes 'equally important' true rather than just
   stated."  Neither `.ledger-eq` nor `.ledger-perf` exists anywhere in `finoptic/`
   any more, so every assertion below either throws on a null or would pass
   vacuously, and a harness that passes vacuously is worse than one that is gone.

   It is retired rather than deleted because the seam is a decision that was made,
   reversed, and could be proposed again — this is the evidence of what was checked
   while it existed.  What survives of its coverage lives in test-ledger-collapsed.js
   and test-widths.js: six lanes, one row, labels and subs present, nothing
   overflowing, at every width.

   Round 14 found it dead; it did not kill it. */
if(!process.env.RUN_OBSOLETE){
  console.log('test-seam.js is OBSOLETE — the strip seam it measures was removed by rule 14.6.');
  console.log('Coverage moved to test-ledger-collapsed.js and test-widths.js.');
  console.log('Set RUN_OBSOLETE=1 to run it anyway (it will throw on .ledger-eq).');
  process.exit(0);
}
const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);
  /* Sign-in is the landing screen now, and it deliberately carries no chrome —
     no ledger toggle, no filters, no Finn. Every harness that touches those has
     to step onto the board first. */
  await p.evaluate(()=>go('overview')); await wait(200);
  await p.click('#ledger-toggle'); await wait(400);
  const bad=[];
  for(const sc of SCR){
    const m=await p.evaluate(x=>{ go(x);
      const l=document.querySelector('#screen .ledger');
      const eq=document.querySelector('#screen .ledger-eq').getBoundingClientRect();
      const pf=document.querySelector('#screen .ledger-perf');
      const st=document.querySelector('#screen .ledger-stats').getBoundingClientRect();
      const lb=l.getBoundingClientRect();
      const pr=pf.getBoundingClientRect();
      return {s:x, seamVisible:pf.offsetWidth>0 && getComputedStyle(pf).display!=='none',
        seamH:Math.round(pr.height), stripH:Math.round(lb.height),
        eqGap:Math.round(pr.left-eq.right), statGap:Math.round(st.left-pr.right),
        eqFromLeft:Math.round(eq.left-lb.left), statToRight:Math.round(lb.right-st.right)};
    }, sc);
    if(!m.seamVisible) bad.push(m.s+': no seam');
    if(m.eqGap<10) bad.push(m.s+': equation only '+m.eqGap+'px from the seam');
    if(m.statGap<10) bad.push(m.s+': stats only '+m.statGap+'px from the seam');
    if(m.seamH < m.stripH-4) bad.push(m.s+': seam '+m.seamH+' does not span the '+m.stripH+'px strip');
    if(sc==='overview'||sc==='itsm') console.log('  '+JSON.stringify(m));
  }
  console.log(bad.length?'FAIL:\n  '+bad.join('\n  '):'seam present, halves at opposite ends, on all 16');
  await p.evaluate(()=>go('overview')); await wait(250);
  await p.screenshot({path:__dirname+'/shots/u5-seam.png',clip:{x:300,y:130,width:1130,height:70}});
  await p.setViewport({width:1280,height:1000}); await wait(250);
  await p.screenshot({path:__dirname+'/shots/u5-seam-1280.png',clip:{x:300,y:130,width:970,height:70}});
  await b.close();
})();
