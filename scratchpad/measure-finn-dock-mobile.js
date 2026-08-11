const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  for (const w of [1440, 900, 700, 430]) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 2 });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => { go('overview'); });
    await new Promise(r => setTimeout(r, 250));
    const info = await page.evaluate(() => {
      const dock = document.querySelector('.finn-dock');
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      return dockRect ? { height: dockRect.height, gapBelow: window.innerHeight - dockRect.bottom } : null;
    });
    console.log('width', w, JSON.stringify(info));
  }
  await browser.close();
})();
