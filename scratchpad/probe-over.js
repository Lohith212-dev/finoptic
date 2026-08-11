/* Replicate test-widths exactly for the one failing case and name the culprit. */
const pup = require('puppeteer-core'), path = require('path');
const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const U = 'file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await pup.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 1000 });
  await p.goto(U + '?nofx', { waitUntil: 'load' }); await wait(550);
  await p.evaluate(() => go('overview')); await wait(200);
  await p.click('#ledger-toggle'); await wait(300);
  for (const sc of ['anomalies', 'itsm', 'alerts', 'overview']) {
    const m = await p.evaluate(x => {
      go(x);
      const cw = document.documentElement.clientWidth;
      const over = [];
      document.querySelectorAll('body *').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.width && r.right > cw + 1)
          over.push((e.tagName + '.' + (e.className || '')).slice(0, 60) + '  r=' + Math.round(r.right) + ' w=' + Math.round(r.width));
      });
      return { doc: document.documentElement.scrollWidth, cw, sum: document.documentElement.getAttribute('data-sum'),
        over: over.slice(0, 6) };
    }, sc);
    console.log(sc, JSON.stringify(m, null, 1));
  }
  await b.close();
})();
