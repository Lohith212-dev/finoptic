const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT, 'verify-rest-blue.png') });

  await page.evaluate(() => {
    const sel = document.getElementById('palette-switch');
    sel.value = 'mono'; sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => { finnOpen('greet'); });
  await new Promise(r => setTimeout(r, 300));
  const monoFill = await page.evaluate(() => getComputedStyle(document.querySelector('.finn-orb .finn-mark path[fill]')).fill);
  console.log('[mono mark fill]', monoFill);
  await page.screenshot({ path: path.join(OUT, 'verify-mono-fullpage.png') });
  console.log(errors.length ? errors.join('\n') : 'no errors');
  await browser.close();
})();
