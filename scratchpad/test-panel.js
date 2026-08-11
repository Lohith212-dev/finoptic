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
  console.log('default tab:', await p.evaluate(()=>document.documentElement.getAttribute('data-sum')||'(unset -> insights)'));
  const bad=[];
  for(const s of SCR){
    const r=await p.evaluate(sc=>{ go(sc);
      const sum=document.querySelector('#screen > .sum');
      const looseKpi=document.querySelectorAll('#screen > .grid > .kpi').length;
      const looseBand=!!document.querySelector('#screen > .briefing');
      if(!sum) return {none:true, looseKpi, looseBand};
      const h=sum.querySelector('.sum-h');
      /* Round 14: a screen whose tiles were all its own strip lanes keeps ONE tile
         and gets no switch — `.sum-flat`, both panes stacked.  There is no
         `.sum-tabs` to measure there, so the same-row assertion is skipped rather
         than crashing on a null box: the rule it enforces is about a control this
         screen deliberately does not have. */
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
        insV, metV, looseKpi, looseBand};
    }, s);
    if(r.none){ if(r.looseKpi&&r.looseBand) bad.push(s+': no panel but had both parts'); 
      console.log('  '+s.padEnd(11)+' no panel (tiles '+r.looseKpi+', band '+r.looseBand+')'); continue; }
    if(!r.sameRow) bad.push(s+': tabs not on the headline row');
    if(!r.band) bad.push(s+': band not inside the panel');
    if(!r.tiles) bad.push(s+': no tiles inside the panel');
    if(r.looseKpi||r.looseBand) bad.push(s+': parts left outside the panel');
    /* Round 14 splits these three assertions by panel kind.  A FLAT panel has one
       tile, no tabs and no "View KPIs" link — there is nowhere for that link to go,
       since both panes are already on screen — and both panes are visible at once,
       which is the whole point of it.  Asserting the tabbed rules there would fail
       a screen for correctly not having a control. */
    if(r.flat){
      if(r.tabs.length) bad.push(s+': flat panel still has tabs');
      if(r.more)        bad.push(s+': flat panel still offers View KPIs');
      if(!r.insV||!r.metV) bad.push(s+': flat panel should show both panes (ins '+r.insV+' met '+r.metV+')');
      if(r.tiles > 1)   bad.push(s+': flat panel has '+r.tiles+' tiles — it should have earned its tabs back');
    }else{
      if(!r.moreInBand) bad.push(s+': View KPIs footnote not inside the band');
      if(!r.insV||r.metV) bad.push(s+': default pane wrong (ins '+r.insV+' met '+r.metV+')');
    }
    console.log('  '+s.padEnd(11)+(r.flat?' [flat]':'       ')+' "'+r.head+'"  tabs '+JSON.stringify(r.tabs)+'  tiles '+r.tiles);
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
