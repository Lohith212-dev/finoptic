/* Exactly which part of which lane overflows at 1200px. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 900 });
  await p.goto(URL, { waitUntil: 'networkidle0' });
  for (const s of ['anomalies', 'itsm', 'alerts', 'security']) {
    const r = await p.evaluate(id => {
      go(id);
      return [...document.querySelectorAll('.ledger-cell')].map(c => {
        const q = k => c.querySelector(k);
        const m = el => el ? { t: el.textContent.trim(), w: Math.round(el.getBoundingClientRect().width), sw: el.scrollWidth } : null;
        return { cell: Math.round(c.getBoundingClientRect().width), csw: c.scrollWidth,
                 lab: m(q('.ledger-k')), val: m(q('.ledger-v')), sub: m(q('.ledger-sub')) };
      });
    }, s);
    console.log('\n' + s);
    r.forEach(c => {
      const over = c.csw > c.cell + 1 ? `  << CELL OVER by ${c.csw - c.cell}` : '';
      console.log(`  cell ${c.cell}/${c.csw}${over}`);
      ['lab', 'val', 'sub'].forEach(k => { const x = c[k]; if (!x) return;
        console.log(`      ${k}: "${x.t}" ${x.w}/${x.sw}${x.sw > x.w + 1 ? '  << OVER by ' + (x.sw - x.w) : ''}`); });
    });
  }
  await b.close();
})();
