const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources','team','add','onboarding'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);
  console.log('default tab:', await p.evaluate(()=>document.documentElement.getAttribute('data-sum')||'(unset -> metrics)'));
  const bad=[];
  for(const s of SCR){
    const r=await p.evaluate(sc=>{ go(sc);
      const sum=document.querySelector('#screen > .sum');
      const looseKpi=document.querySelectorAll('#screen > .grid > .kpi').length;
      const looseBand=!!document.querySelector('#screen > .briefing');
      if(!sum) return {none:true, looseKpi, looseBand};
      const h=sum.querySelector('.sum-h');
      /* Round 15: `.sum-flat` is GONE — every screen with a band and tiles is
         tabbed, and every board screen authors exactly four tiles.  The flag is
         still read so this harness FAILS rather than skips if the variant ever
         comes back; round 14 shipped it as a fix for one-tile screens, and the
         SME's answer was that a layout that changes between screens is worse than
         the thing it was fixing. */
      const flat=sum.classList.contains('sum-flat');
      /* Compare the HEADLINE to the tabs, not the header box: .sum-h carries
         asymmetric bottom padding, so its box centre is not its content's. */
      const hb=h.querySelector('h2').getBoundingClientRect();
      const tabsEl=sum.querySelector('.sum-tabs');
      const tb=tabsEl?tabsEl.getBoundingClientRect():null;
      const insV=sum.querySelector('[data-sum-pane="insights"]').offsetHeight>0;
      const metV=sum.querySelector('[data-sum-pane="metrics"]').offsetHeight>0;
      return {head:h.querySelector('h2').textContent, tabs:[...sum.querySelectorAll('.sum-tab')].map(x=>x.textContent),
        flat,
        sameRow:flat?true:Math.abs((hb.top+hb.height/2)-(tb.top+tb.height/2))<3,
        band:!!sum.querySelector('.briefing'), tiles:sum.querySelectorAll('.kpi').length,
        more:!!sum.querySelector('.sum-more'), moreInBand:!!sum.querySelector('.briefing > .sum-more'),
        moreOnCanvas:!!sum.querySelector('.sum-kpis > .sum-more-canvas'),
        insV, metV, looseKpi, looseBand};
    }, s);
    if(r.none){ if(r.looseKpi&&r.looseBand) bad.push(s+': no panel but had both parts'); 
      console.log('  '+s.padEnd(11)+' no panel (tiles '+r.looseKpi+', band '+r.looseBand+')'); continue; }
    if(!r.sameRow) bad.push(s+': tabs not on the headline row');
    if(!r.band) bad.push(s+': band not inside the panel');
    if(!r.tiles) bad.push(s+': no tiles inside the panel');
    if(r.looseKpi||r.looseBand) bad.push(s+': parts left outside the panel');
    /* ---- round 15: ONE SHAPE, and METRICS FIRST ----
       Every panel is tabbed and carries exactly four tiles.  The pane the reader
       LANDS on is Metrics, which reverses round 11 and is asserted here in the
       direction it now runs: metrics visible, insights not.
       ROUND 16: exactly ONE footnote, inside the band.  The matching one on the
       Metrics pane was deleted — four separate cards give a control below them
       nothing to belong to, so it floated however it was styled — and the assertion
       is inverted rather than dropped so it cannot come back by accident. */
    if(r.flat)         bad.push(s+': the flat panel variant is back — it was deleted in round 15');
    if(r.tabs.length!==2) bad.push(s+': expected 2 tabs, found '+r.tabs.length);
    if(r.tiles!==4)    bad.push(s+': '+r.tiles+' tiles — every board screen carries exactly four');
    if(!r.moreInBand)  bad.push(s+': View KPIs footnote not inside the band');
    if(r.moreOnCanvas) bad.push(s+': the floating View Key Insights footnote is back');
    if(r.insV||!r.metV) bad.push(s+': default pane wrong — Metrics leads now (ins '+r.insV+' met '+r.metV+')');
    console.log('  '+s.padEnd(11)+' "'+r.head+'"  tabs '+JSON.stringify(r.tabs)+'  tiles '+r.tiles);
  }
  // switching, and persistence across a filter change
  await p.evaluate(()=>go('overview')); await wait(200);
  await p.click('[data-sum-tab="metrics"]'); await wait(250);
  console.log('after switch:', JSON.stringify(await p.evaluate(()=>({attr:document.documentElement.getAttribute('data-sum'),
    metVisible:document.querySelector('[data-sum-pane="metrics"]').offsetHeight>0,
    insVisible:document.querySelector('[data-sum-pane="insights"]').offsetHeight>0}))));
  await p.evaluate(()=>{F.category=['Cloud infrastructure'];refresh();}); await wait(250);
  console.log('after filter:', JSON.stringify(await p.evaluate(()=>({attr:document.documentElement.getAttribute('data-sum'),
    metVisible:document.querySelector('[data-sum-pane="metrics"]').offsetHeight>0,
    tabOn:document.querySelector('.sum-tab.on').textContent}))));
  console.log(bad.length?'FAIL:\n  '+bad.join('\n  '):'panel OK on every screen');
  console.log(errs.length?'ERRORS: '+[...new Set(errs)].join(' | '):'no js errors');
  await b.close();
})();
