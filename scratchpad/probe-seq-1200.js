/* Reproduce test-ledger-collapsed's PAGEOVER by walking its exact screen order at
   1200px with the strip collapsed, and name the element that sticks out. */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U = 'file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
const SCR = ['overview','itfm','cloud','ai','saas','finance','proc','product','optimize',
             'allocation','forecast','anomalies','alerts','security','itsm','sources'];
(async () => {
  const b = await puppeteer.launch({executablePath:CHROME, headless:true,
                                    args:['--allow-file-access-from-files']});
  const p = await b.newPage();
  await p.setViewport({width:1200, height:1000});
  await p.goto(U + '?nofx', {waitUntil:'load'});
  await wait(600);
  await p.evaluate(() => go('overview'));
  await wait(200);
  await p.click('#ledger-toggle');
  await wait(300);

  for(const sc of SCR){
    /* Measured in the SAME evaluate as go(), exactly as the harness does — the
       settle time is the variable being tested. */
    const now = await p.evaluate(x => {
      go(x);
      const de = document.documentElement, cw = de.clientWidth, wide = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if(r.right > cw + 1)
          wide.push(el.tagName.toLowerCase() +
            (typeof el.className === 'string' && el.className.trim()
              ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : '') +
            '@' + Math.round(r.right));
      });
      return {over: de.scrollWidth > cw + 1, sw: de.scrollWidth, cw,
              wide: [...new Set(wide)].slice(0,5)};
    }, sc);
    await wait(250);
    const settled = await p.evaluate(() => {
      const de = document.documentElement;
      return {over: de.scrollWidth > de.clientWidth + 1, sw: de.scrollWidth, cw: de.clientWidth};
    });
    if(now.over || settled.over)
      console.log(sc.padEnd(11),
        'immediate', now.over ? now.sw + '>' + now.cw : 'ok',
        '| settled', settled.over ? settled.sw + '>' + settled.cw : 'ok',
        JSON.stringify(now.wide));
  }
  await b.close();
})();
