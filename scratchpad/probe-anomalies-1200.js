/* Which element makes the anomalies screen overflow the page at 1200px, and is it
   anything round 14 touched?  Reports the widest offenders, plus the same
   measurement with the round-14 additions (the summary panel and the sparklines)
   removed, so "was this here before" is answered rather than assumed. */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U = 'file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({executablePath:CHROME, headless:true,
                                    args:['--allow-file-access-from-files']});
  const p = await b.newPage();
  await p.setViewport({width:1200, height:1000});
  await p.goto(U + '?nofx', {waitUntil:'load'});
  await wait(700);

  for(const collapsed of [false, true]){
    await p.evaluate(c => {
      go('overview');
      document.documentElement.setAttribute('data-ledger', c ? 'min' : '');
    }, collapsed);
    await wait(150);
    await p.evaluate(() => go('anomalies'));
    await wait(300);
    const r = await p.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const over = [];
      document.querySelectorAll('#screen *').forEach(el => {
        const b = el.getBoundingClientRect();
        if(b.right > cw + 1 || el.scrollWidth > el.clientWidth + 1){
          over.push({
            sel: el.tagName.toLowerCase() + (el.className && typeof el.className==='string'
                  ? '.' + el.className.trim().split(/\s+/).slice(0,3).join('.') : ''),
            right: Math.round(b.right), w: Math.round(b.width),
            scroll: el.scrollWidth, client: el.clientWidth
          });
        }
      });
      return {cw, page: document.documentElement.scrollWidth, over: over.slice(0,8),
              sparks: document.querySelectorAll('#screen .kpi-spark').length,
              sum: !!document.querySelector('#screen .sum')};
    });
    console.log(`\ncollapsed=${collapsed}  client=${r.cw}  page=${r.page}  ` +
                `(overflow ${r.page - r.cw}px)  sparklines=${r.sparks}  panel=${r.sum}`);
    r.over.forEach(o => console.log(`   ${o.sel}  right=${o.right} w=${o.w} scroll=${o.scroll}/${o.client}`));
    if(!r.over.length) console.log('   (nothing inside #screen exceeds the viewport)');
  }
  await b.close();
})();
