const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); });
  await new Promise(r => setTimeout(r, 200));
  await page.click('.nav-collapse, [data-nav-toggle], .brand .iconbtn').catch(() => {});
  // Fall back: set the attribute directly if no obvious toggle button matched
  await page.evaluate(() => document.documentElement.setAttribute('data-nav', 'mini'));
  await new Promise(r => setTimeout(r, 200));
  const nav = await page.$('.nav');
  if (nav) await nav.screenshot({ path: path.join(OUT, 'verify-mini-rail.png') });
  await browser.close();
})();
