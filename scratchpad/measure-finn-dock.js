const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); });
  await new Promise(r => setTimeout(r, 300));
  const info = await page.evaluate(() => {
    const dock = document.querySelector('.finn-dock');
    const finn = document.querySelector('.finn');
    const content = document.querySelector('.content');
    const cs = getComputedStyle(content);
    const dockRect = dock ? dock.getBoundingClientRect() : null;
    return {
      viewportH: window.innerHeight,
      dockRect: dockRect ? { top: dockRect.top, bottom: dockRect.bottom, height: dockRect.height } : null,
      gapBelowDock: dockRect ? window.innerHeight - dockRect.bottom : null,
      finnPadding: finn ? getComputedStyle(finn).padding : null,
      contentPaddingBottom: cs.paddingBottom,
      contentClass: content.className
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
