/* Descending-order audit.  For every table and every ranked list on every screen,
   under every dataset: is the primary numeric run actually descending? */
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

  const bad=[]; let tables=0, lists=0, donuts=0;
  for(const d of DS){
    await p.evaluate(id=>{loadScenario(id);refresh();}, d);
    for(const s of SCR){
      const r = await p.evaluate(sc=>{
        go(sc);
        const txt=n=>((n&&n.textContent)||'').replace(/\u00a0/g,' ').trim();
        const num=t=>{ const m=t.replace(/,/g,'').replace(/\u2212/g,'-')
            .match(/^([-+(]?)\$\s*(\d+(?:\.\d+)?)\s*([KMB])?\)?$/i);
          if(!m) return null; let v=parseFloat(m[2]); if(m[1]==='-'||m[1]==='(') v=-v;
          const s=(m[3]||'').toUpperCase(); return v*(s==='K'?1e3:s==='M'?1e6:s==='B'?1e9:1); };
        const out={tables:[],lists:[],donuts:[]};
        /* tables: for each right-aligned currency column, is it descending? */
        document.querySelectorAll('#screen .tbl').forEach(tb=>{
          const title=(tb.closest('.card')?.querySelector('h3')?.textContent)||'?';
          const ths=[...tb.querySelectorAll('thead th')].map(txt);
          const rows=[...tb.querySelectorAll('tbody tr:not(.total)')];
          if(rows.length<3) return;
          let bestI=-1,bestMass=0,seq=null;
          ths.forEach((h,i)=>{
            const cells=rows.map(tr=>txt(tr.children[i]));
            const ns=cells.map(num);
            if(ns.filter(x=>x!=null).length < Math.ceil(cells.length*0.7)) return;
            const mass=ns.reduce((a,x)=>a+Math.abs(x||0),0);
            if(mass>bestMass){bestMass=mass;bestI=i;seq=ns;}
          });
          if(bestI<0) return;
          /* Three tables pass order:'keep' — one Value column over unlike units, or
             a pipeline in sequence.  Not sorting them is the correct behaviour. */
          if(/^(Unit|Token) Economics$|^Enrichment Rules$/i.test(title.trim())) return;
          const asc=seq.some((v,i)=>i&&v!=null&&seq[i-1]!=null&&v>seq[i-1]+0.5);
          out.tables.push({title,col:ths[bestI],desc:!asc,n:rows.length});
        });
        /* hbars / rowList: the .v figure per row */
        document.querySelectorAll('#screen .card .rows').forEach(rs=>{
          const title=(rs.closest('.card')?.querySelector('h3')?.textContent)||'?';
          /* Skip the rolled-up remainder row: `tail:true` pins "All other vendors
             (26)" to the bottom on purpose, so it is legitimately allowed to be
             larger than the row above it. */
          const keep=[...rs.querySelectorAll(':scope > .row')]
            .filter(r=>!/^All other /.test(txt(r.querySelector('.t'))||''));
          const vs=keep.map(r=>{ const v=r.querySelector('.v'); if(!v) return null;
              return num((v.firstChild&&v.firstChild.textContent||txt(v)).trim()); });
          const clean=vs.filter(x=>x!=null);
          if(clean.length<3 || clean.length!==vs.length) return;
          /* A row carrying a SEVERITY badge is ranked severity-first and money
             second — burying a Critical under a larger High would be the wrong
             list, and the alert feed's own sub-line says as much.  So the money
             check applies WITHIN each severity band, not across the whole list. */
          const bands={};
          keep.forEach((r,i)=>{ const b=txt(r.querySelector('.badge'))||'_';
            (bands[b]=bands[b]||[]).push(vs[i]); });
          const asc=Object.values(bands).some(g=>g.some((v,i)=>i&&v>g[i-1]+0.5));
          out.lists.push({title,desc:!asc,n:clean.length,
            bands:Object.keys(bands).length>1?Object.keys(bands).length:0});
        });
        /* donut vs its legend: same order, and descending */
        document.querySelectorAll('#screen .card').forEach(c=>{
          const dn=c.querySelector('.ct-donut'), lg=c.querySelector('.legend');
          if(!dn||!lg) return;
          const title=c.querySelector('h3')?.textContent||'?';
          /* CHARTTIP.attrs() writes ONE data-ct holding the whole payload as JSON —
             there is no data-ct-t.  Reading a non-existent attribute gave an array
             of nulls, which never equals the legend's names, so every donut on
             every screen "failed".
             `.ct-key` FIRST, `.ct-slice` as the fallback.  The two-ring donut
             (charts.js pieRing) draws a provider ring the legend keys to AND a
             service ring it does not — 27 paths, all of them .ct-slice — so the
             plain selector read a 3-row legend against 27 slices and failed a
             chart that was correctly ordered.  Marking the keyed ring keeps this
             check honest on both shapes instead of having to exempt one. */
          const keyed=dn.querySelectorAll('.ct-key');
          const slices=[...(keyed.length?keyed:dn.querySelectorAll('.ct-slice'))].map(s=>{
            try{ return JSON.parse(s.getAttribute('data-ct')).t; }catch(e){ return null; } });
          const keys=[...lg.querySelectorAll('.lg-n')].map(txt);
          const vals=[...lg.querySelectorAll('div > b:first-of-type')].map(e=>num(txt(e)));
          const asc=vals.some((v,i)=>i&&v!=null&&vals[i-1]!=null&&v>vals[i-1]+0.5);
          out.donuts.push({title,match:JSON.stringify(slices)===JSON.stringify(keys),desc:!asc});
        });
        return out;
      }, s);
      const tag=d+'/'+s;
      r.tables.forEach(t=>{ tables++; if(!t.desc) bad.push(`${tag} TABLE "${t.title}" not descending on "${t.col}" (${t.n} rows)`); });
      r.lists.forEach(t=>{ lists++; if(!t.desc) bad.push(`${tag} LIST "${t.title}" not descending (${t.n} rows)`); });
      r.donuts.forEach(t=>{ donuts++;
        if(!t.match) bad.push(`${tag} DONUT "${t.title}" slices disagree with legend`);
        if(!t.desc) bad.push(`${tag} DONUT "${t.title}" legend not descending`); });
    }
  }
  console.log(`checked ${tables} tables, ${lists} ranked lists, ${donuts} donut+legend pairs`);
  console.log(bad.length ? 'FAIL:\n  '+[...new Set(bad)].join('\n  ') : 'all descending');
  console.log(errs.length?'ERRORS:\n'+[...new Set(errs)].join('\n'):'no js errors');
  await b.close();
})();
