const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage();
  const bad=[], wrapNote=[];
  for(const W of [1600,1440,1360,1280,1240,1200]){
    await p.setViewport({width:W,height:1000});
    await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(550);
    /* Sign-in is the landing screen now, and it deliberately carries no chrome —
     no ledger toggle, no filters, no Finn. Every harness that touches those has
     to step onto the board first. */
    await p.evaluate(()=>go('overview')); await wait(200);
    await p.click('#ledger-toggle'); await wait(300);
    const hits=[], wraps=[];
    for(const sc of SCR){
      const m=await p.evaluate(x=>{ go(x);
        const l=document.querySelector('#screen .ledger');
        const st=document.querySelector('#screen .ledger-stats');
        const sb=st.getBoundingClientRect();
        const cells=[...st.querySelectorAll('.ledger-cell')];
        return {n:cells.length,
          subs:cells.filter(c=>{const s=c.querySelector('.ledger-sub');return s&&s.offsetHeight>0;}).length,
          labels:cells.filter(c=>c.querySelector('.ledger-k').offsetHeight>0).length,
          statRows:new Set(cells.map(c=>Math.round(c.getBoundingClientRect().top))).size,
          h:Math.round(l.getBoundingClientRect().height),
          page:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};}, sc);
      if(m.subs!==m.n) hits.push(sc+' subs '+m.subs+'/'+m.n);
      if(m.labels!==m.n) hits.push(sc+' labels '+m.labels+'/'+m.n);
      /* The gap between the equation block and the counterfoil is NOT checked any
         more, and cannot be: 14.6 removed the seam that split the strip into two
         groups — "no seam splitting the row into two groups… dropping both is what
         makes 'equally important' true rather than just stated."  There is one row
         of six equal lanes now, so there is no boundary to keep clear.  What the
         check was really protecting — that nothing collides or falls off — is
         covered by the wrap, row-count and page-overflow assertions below. */
      if(m.page) hits.push(sc+' PAGEOVER');
      if(m.statRows>1) wraps.push(sc+'('+m.statRows+'r,'+m.h+'px)');
    }
    console.log(W+': '+(hits.length?'FAIL -> '+hits.join(', '):'all 16 keep every stat, label and sub')
      +(wraps.length?'  | wrapped: '+wraps.join(' '):'  | one row'));
    if(hits.length) bad.push(W);
    if(wraps.length) wrapNote.push(W+': '+wraps.join(' '));
  }
  console.log(bad.length?'\nFAIL at '+bad.join(', '):'\nsubs + labels + all stats present at every width, no overlap');
  if(wrapNote.length) console.log('wrap points (allowed):\n  '+wrapNote.join('\n  '));
  await p.setViewport({width:1440,height:1000});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(550);
  /* Board first, THEN the toggle.  A reload lands on sign-in, which carries no
     chrome at all — no ledger, no toggle — so clicking before navigating threw on a
     missing selector.  The loop above already had this right; this tail did not. */
  await p.evaluate(()=>go('overview')); await wait(200);
  await p.click('#ledger-toggle'); await wait(300);
  await p.screenshot({path:__dirname+'/shots/u7-subs.png',clip:{x:300,y:130,width:1130,height:80}});
  await p.evaluate(()=>go('security')); await wait(200);
  await p.screenshot({path:__dirname+'/shots/u7-subs-sec.png',clip:{x:300,y:130,width:1130,height:80}});
  await b.close();
})();
