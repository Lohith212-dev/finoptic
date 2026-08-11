/* Round 15 recon: how many KPI tiles does each screen actually render, and what
   are their labels?  Static grep undercounts — optimize builds tiles with .map()
   and cloud pads its provider row — so this asks the DOM. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

const SCREENS = ['overview','itfm','cloud','ai','saas','finance','proc','product',
  'optimize','allocation','forecast','anomalies','security','itsm','alerts','sources'];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  for (const id of SCREENS) {
    const r = await page.evaluate(s => {
      go(s);
      const tiles = [...document.querySelectorAll('.kpi')].map(el => ({
        k: el.querySelector('.kpi-k') ? el.querySelector('.kpi-k').textContent.trim() : '?',
        v: el.querySelector('.kpi-v') ? el.querySelector('.kpi-v').textContent.trim() : '',
        spark: !!el.querySelector('.kpi-spark')
      }));
      const stats = [...document.querySelectorAll('.ledger-cell,.lg-cell,.ledger .cell')].map(
        e => e.textContent.replace(/\s+/g, ' ').trim());
      return {
        tiles,
        flat: !!document.querySelector('.sum-flat'),
        hasSum: !!document.querySelector('.sum'),
        stats
      };
    }, id);
    console.log(`\n${id}  (${r.tiles.length} tiles${r.flat ? ', FLAT' : r.hasSum ? ', tabbed' : ', NO SUMMARY'})`);
    r.tiles.forEach(t => console.log(`    ${t.spark ? '~' : ' '} ${t.k}  =  ${t.v}`));
  }
  await browser.close();
})();
