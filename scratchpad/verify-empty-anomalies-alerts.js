const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle0' });
  for (const scen of ['zero', 'fresh', 'ai-crisis', 'optimised', 'scaleup', 'baseline']) {
    for (const screen of ['anomalies', 'alerts', 'overview']) {
      await page.evaluate((s, sc) => { loadScenario(s); refresh(); go(sc); }, scen, screen);
      await new Promise(r => setTimeout(r, 150));
    }
  }
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS across all scenarios on anomalies/alerts/overview');
  await browser.close();
})();
