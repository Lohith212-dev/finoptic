/* Every screen × every dataset: no JS error, no NaN/undefined leaking into the DOM,
   no horizontal overflow, and the shell still boots. */
const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources','team','add','onboarding','signin'];
const DS=['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
const BAD=/\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|mock-?up/i;
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1280,height:960});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);
  const bad=[]; let n=0;
  for(const d of DS){
    await p.evaluate(id=>{loadScenario(id);refresh();}, d);
    for(const s of SCR){
      const r=await p.evaluate(sc=>{ go(sc);
        return {txt:document.getElementById('screen').innerText,
                ow:document.documentElement.scrollWidth,
                cw:document.documentElement.clientWidth,
                h1:!!document.querySelector('#screen h1, #screen .add-q')};}, s);
      n++;
      const tag=d+'/'+s;
      const m=r.txt.match(BAD);
      if(m) bad.push(tag+' bad text: '+m[0]);
      if(r.ow > r.cw+1) bad.push(tag+' overflows: '+r.ow+' > '+r.cw);
      if(!r.h1 && s!=='signin') bad.push(tag+' no heading');
    }
  }
  /* filters still work after all of this */
  const f=await p.evaluate(()=>{loadScenario('baseline');refresh();go('overview');
    F.category=['Cloud infrastructure'];refresh();
    const a=document.querySelector('.kpi-v').textContent;
    F.category=[];F.period=PERIODS[4][0];refresh();
    const c=document.querySelector('.kpi-v').textContent;
    const chip=document.querySelector('.chip.primary');
    return {a,c,primary:!!chip,cls:chip?chip.className.trim():''};});
  console.log(`${n} screen renders`);
  console.log('filters:', JSON.stringify(f));
  console.log(bad.length ? 'FAIL:\n  '+[...new Set(bad)].join('\n  ') : 'all clean');
  console.log(errs.length?'ERRORS:\n'+[...new Set(errs)].join('\n'):'no js errors');
  await b.close();
})();
