const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); finnOpen('greet'); });
  await new Promise(r => setTimeout(r, 400));

  const qids = await page.evaluate(() => FINN_CATS.flatMap(c => c.qs).slice(0, 4).map(q => q.id));
  for (const qid of qids) {
    await page.evaluate((id) => finnAsk(id), qid);
    await new Promise(r => setTimeout(r, 2200));
  }

  const rect = r => ({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom });

  const atTop = await page.evaluate((rectFn) => {
    const el = document.querySelector('.finn-ctx-pinned');
    const thread = document.getElementById('finn-body');
    thread.scrollTop = 0;
    const r = el.getBoundingClientRect();
    const threadR = thread.getBoundingClientRect();
    return { elTop: r.top, elLeft: r.left, elWidth: r.width, threadTop: threadR.top, threadLeft: threadR.left };
  });
  console.log('[scrollTop=0]', JSON.stringify(atTop));
  await page.screenshot({ path: path.join(OUT, 'sticky-debug-top.png') });

  const atMid = await page.evaluate(() => {
    const el = document.querySelector('.finn-ctx-pinned');
    const thread = document.getElementById('finn-body');
    thread.scrollTop = thread.scrollHeight / 2;
    const r = el.getBoundingClientRect();
    return { elTop: r.top, scrollTop: thread.scrollTop };
  });
  console.log('[scrollTop=mid]', JSON.stringify(atMid));
  await page.screenshot({ path: path.join(OUT, 'sticky-debug-mid.png') });

  const atBottom = await page.evaluate(() => {
    const el = document.querySelector('.finn-ctx-pinned');
    const thread = document.getElementById('finn-body');
    thread.scrollTop = thread.scrollHeight;
    const r = el.getBoundingClientRect();
    return { elTop: r.top, scrollTop: thread.scrollTop, scrollHeight: thread.scrollHeight };
  });
  console.log('[scrollTop=max]', JSON.stringify(atBottom));
  await page.screenshot({ path: path.join(OUT, 'sticky-debug-bottom.png') });

  await browser.close();
})();
