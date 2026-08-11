/* Screenshot the summary region (and optionally the whole screen) for eyeballing. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

const jobs = (process.argv[2] || 'security:metrics,itsm:insights,alerts:metrics,overview:metrics').split(',');
const W = +(process.argv[3] || 1440);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 1100, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  for (const j of jobs) {
    const [id, tab] = j.split(':');
    await page.evaluate((s, t) => { document.documentElement.setAttribute('data-sum', t || 'metrics'); go(s); }, id, tab);
    await new Promise(r => setTimeout(r, 250));
    const el = await page.$('.sum');
    if (!el) { console.log(`${j}: no .sum`); continue; }
    const f = path.join(OUT, `r15-${id}-${tab}.png`);
    await el.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
})();
