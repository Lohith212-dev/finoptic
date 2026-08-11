/* How much room does a KPI tile actually have for a bigger sparkline?
   Reports, per screen, the tile inner width and the widest rendered figure. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const SCREENS = ['overview','itfm','cloud','ai','saas','finance','proc','product',
  'optimize','allocation','forecast','anomalies','security','itsm','alerts'];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  for (const W of [1280, 1440, 1680]) {
    await page.setViewport({ width: W, height: 1000 });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    let worst = { slack: 1e9 };
    for (const id of SCREENS) {
      const r = await page.evaluate(s => {
        document.documentElement.setAttribute('data-sum', 'metrics');
        go(s);
        const out = [];
        document.querySelectorAll('.kpi').forEach(el => {
          const fig = el.querySelector('.kpi-fig'), v = el.querySelector('.kpi-v');
          const sp = el.querySelector('.kpi-spark');
          if (!fig || !v) return;
          out.push({
            k: el.querySelector('.kpi-k').textContent.trim(),
            box: Math.round(fig.getBoundingClientRect().width),
            num: Math.round(v.getBoundingClientRect().width),
            spark: sp ? Math.round(sp.getBoundingClientRect().width) : 0
          });
        });
        return out;
      }, id);
      r.forEach(t => {
        const slack = t.box - t.num - 10 - t.spark;   // room left over beside a 64px plot
        if (slack < worst.slack) worst = { slack, W, id, ...t };
      });
    }
    console.log(`${W}px  tightest: ${worst.id} "${worst.k}" box ${worst.box} · figure ${worst.num} · plot ${worst.spark} · slack ${worst.slack}px`);
  }
  await browser.close();
})();
