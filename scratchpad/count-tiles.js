/* Round 15 contract: every board screen renders EXACTLY FOUR KPI tiles, in one
   tabbed summary region, on every dataset.  Four is what makes the grid a single
   full row; tabbed is what makes the region the same shape everywhere.
   Pass a screen id as argv[2] to dump that screen's tiles instead. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

const SCREENS = ['overview','itfm','cloud','ai','saas','finance','proc','product',
  'optimize','allocation','forecast','anomalies','security','itsm','alerts','sources'];
const SETS = ['baseline','ai-crisis','optimised','scaleup','fresh','zero'];
const ONLY = process.argv[2];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle0' });

  if (ONLY) {
    const r = await page.evaluate(s => {
      document.documentElement.setAttribute('data-sum', 'metrics');
      go(s);
      return [...document.querySelectorAll('.kpi')].map(el => ({
        k: el.querySelector('.kpi-k').textContent.trim(),
        v: el.querySelector('.kpi-v').textContent.trim(),
        f: el.querySelector('.kpi-f') ? el.querySelector('.kpi-f').textContent.replace(/\s+/g, ' ').trim() : '',
        spark: !!el.querySelector('.kpi-spark')
      }));
    }, ONLY);
    r.forEach(t => console.log(`  ${t.spark ? '~' : ' '} ${t.k}  =  ${t.v}\n        ${t.f}`));
    await browser.close();
    return;
  }

  let bad = 0, checked = 0;
  for (const set of SETS) {
    await page.evaluate(s => { loadScenario(s); refresh(); }, set);
    const rows = [];
    for (const id of SCREENS) {
      const r = await page.evaluate(s => {
        go(s);
        const sum = document.querySelector('.sum');
        return {
          tiles: document.querySelectorAll('.kpi').length,
          sum: !!sum,
          tabs: document.querySelectorAll('.sum-tab').length,
          flat: !!document.querySelector('.sum-flat'),
          out: !!document.querySelector('.sum-more-canvas'),
          band: !!document.querySelector('.briefing')
        };
      }, id);
      checked++;
      const ok = r.tiles === 4 && r.sum && r.tabs === 2 && !r.flat && r.out && r.band;
      if (!ok) { bad++; rows.push(`    ${id}: ${r.tiles} tiles, sum=${r.sum}, tabs=${r.tabs}, flat=${r.flat}, out=${r.out}, band=${r.band}`); }
    }
    console.log(`${set.padEnd(10)} ${rows.length ? 'FAIL' : 'ok'}`);
    rows.forEach(x => console.log(x));
  }
  console.log(`\n${checked} screen renders · ${bad} not four-tiles-and-tabbed`);
  if (errs.length) console.log('JS ERRORS:\n' + [...new Set(errs)].join('\n'));
  else console.log('no js errors');
  await browser.close();
})();
