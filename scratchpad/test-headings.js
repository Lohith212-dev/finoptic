/* Title-case audit, at RENDER time rather than in the source — the only place that
   catches a heading built from a template ("Staged this session · 4"). */
const puppeteer=require('puppeteer-core');
const CHROME='C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U='file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCR=['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
  'allocation','forecast','anomalies','alerts','security','itsm','sources','team','add','onboarding'];
const DS=['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--allow-file-access-from-files']});
  const p=await b.newPage(); await p.setViewport({width:1600,height:1000});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
  await p.goto(U+'?nofx',{waitUntil:'load'}); await wait(700);

  const bad=[]; let n=0;
  for(const d of DS){
    await p.evaluate(id=>{loadScenario(id);refresh();}, d);
    for(const s of SCR){
      const r=await p.evaluate(sc=>{
        go(sc);
        const out=[];
        /* Every heading surface in the product.  .csub/.hint/.card-note/.brief p are
           deliberately excluded: sub-lines, caption chips and footers are sentences,
           not headings, and were never in scope. */
        const SEL='#screen h1, #screen .card-h h3, #screen .kpi-k, #screen thead th .th-t,'
                 +' #screen thead th > span.th-t, #screen .pane-sh, #screen .mdl-sh,'
                 +' #screen .add-q, #screen .state-h, #navgroups .navitem .lbl,'
                 +' .navgroup > button > span, #screen .es-h';  /* "Viewing as" is a label the user specified verbatim */
        document.querySelectorAll(SEL).forEach(e=>{
          const t=(e.textContent||'').replace(/\u00a0/g,' ').trim();
          if(!t) return;
          out.push(t);
        });
        return out;
      }, s);
      r.forEach(t=>{
        n++;
        /* A word is a failure if it starts lowercase.  Skip pure-symbol tokens and
           anything with an internal capital (SaaS, MoM), which is the same rule the
           sweep itself used. */
        const words=t.split(/[\s\-\/–—]+/).filter(w=>/[A-Za-z]/.test(w));
        const low=words.filter(w=>/^[a-z]/.test(w));
        if(low.length) bad.push(`${d}/${s}  "${t}"  ->  lowercase: ${low.join(', ')}`);
      });
    }
  }
  console.log(`checked ${n} rendered headings`);
  const u=[...new Set(bad.map(x=>x.replace(/^[a-z-]+\//,'')))];
  console.log(bad.length ? 'LOWERCASE FOUND:\n  '+u.join('\n  ') : 'every rendered heading is Title Case');
  console.log(errs.length?'ERRORS:\n'+[...new Set(errs)].join('\n'):'no js errors');
  await b.close();
})();
