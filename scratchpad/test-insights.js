const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','security','itsm','alerts','sources'];
const DS=['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:940});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);
  const BAD=/\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|\$-|−\$0K\b/;
  let bad=[], noProbe=[];
  for(const d of DS){
    await p.evaluate(id=>{loadScenario(id);refresh();}, d);
    for(const s of SCR){
      const r=await p.evaluate(sc=>{ go(sc);
        const band=document.querySelector('.briefing');
        if(!band) return {none:true};
        const grid=document.querySelector('#screen > .grid');
        const kids=grid?[...grid.children]:[];
        const bi=kids.indexOf(band);
        let lastKpi=-1; kids.forEach((k,i)=>{if(k.classList.contains('kpi'))lastKpi=i;});
        const firstNonKpi=kids.findIndex(k=>!k.classList.contains('kpi')&&k!==band);
        return {inGrid:band.classList.contains('in-grid'), bi,
          kpisBefore:kids.slice(0,bi).filter(k=>k.classList.contains('kpi')).length,
          kpisAfter:kids.slice(bi+1).filter(k=>k.classList.contains('kpi')).length,
          label:band.querySelector('.brief-h b').textContent,
          /* Round 14: the cells are LISTS of at most two pointers, not paragraphs.
             The derived text this harness owns is the first cell's pointers joined,
             which is the same string the old `.brief p` held before it was split. */
          txt:[...band.querySelectorAll('.brief .brief-p > li')].map(li=>li.textContent).join(' '),
          pts:[...band.querySelectorAll('.brief')].map(c=>c.querySelectorAll('.brief-p > li').length)};
      }, s);
      if(r.none) continue;
      const tag=d+'/'+s;
      if(BAD.test(r.txt)) bad.push(tag+' BADTEXT: '+r.txt);
      /* Placement moved to test-panel.js when the band went into the tabbed
         summary panel. This harness owns the DERIVED TEXT only — asserting the old
         in-grid position here passed vacuously once the class went away, which is
         worse than not asserting it. */
      if(r.label!=='What You Might Miss') noProbe.push(tag+' ['+r.label+']');
      if(d==='baseline') console.log('  '+s.padEnd(11)+' | '+r.txt);
    }
  }
  console.log('\nfell back to authored (no probe scored): '+(noProbe.length?noProbe.join(', '):'none'));
  console.log(bad.length?'\nFAIL:\n  '+bad.join('\n  '):'\nplacement + text OK');
  console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'no js errors');
  await b.close();
})();
