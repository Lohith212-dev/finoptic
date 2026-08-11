const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage();
  const bad=[];
  for(const W of [1600,1440,1400,1360,1280,1240,1200]){
    await p.setViewport({width:W,height:1000});
    await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(550);
    await p.evaluate(()=>go('overview')); await wait(200);
      /* Sign-in is the landing screen and carries no chrome — no ledger toggle,
         no filters, no Finn — so step onto the board before touching any of it. */
    for(const min of [true,false]){
      if(min){ await p.click('#ledger-toggle'); await wait(300); }
      else { await p.click('#ledger-toggle'); await wait(300); }
      const hits=[];
      for(const sc of SCR){
        const m=await p.evaluate(x=>{ go(x);
          const l=document.querySelector('#screen .ledger');
          /* .ledger-eq is gone — 14.6 made the strip six equal lanes with no
             operator and no seam, so there is no equation BLOCK to measure against
             the counterfoil.  This harness threw on the null box from that round
             until round 14 repaired it; what it still usefully covers is that the
             six lanes stay on one row and nothing overflows at each width. */
          const eq=document.querySelector('#screen .ledger-stats').getBoundingClientRect();
          const st=document.querySelector('#screen .ledger-stats').getBoundingClientRect();
          const tops=new Set([...document.querySelectorAll('#screen .ledger-stats .ledger-cell')]
            .map(c=>Math.round(c.getBoundingClientRect().top)));
          return {gap:Math.round(st.left-eq.right), rows:tops.size,
            wrapped:Math.round(st.top)!==Math.round(eq.top),
            page:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};}, sc);
        /* The equation-to-counterfoil GAP is not measured any more and cannot be:
           14.6 removed the seam that split the strip into two groups, so there is
           one row of six equal lanes and no boundary to keep clear.  Row count and
           page overflow below are what that check was really protecting. */
        if(m.rows>1) hits.push(sc+' stats-wrap');
        if(m.page) hits.push(sc+' PAGEOVER');
      }
      console.log(W+(min?' collapsed':' expanded ')+': '+(hits.length?'OVERLAP -> '+hits.join(', '):'clear'));
      if(hits.length) bad.push(W+(min?'/collapsed':'/expanded'));
    }
  }
  console.log(bad.length?'\nFAIL at: '+bad.join(', '):'\nno overlap at any width, either state');
  await b.close();
})();
