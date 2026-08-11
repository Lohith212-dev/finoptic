const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';

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

  const diag = await page.evaluate(() => {
    const el = document.querySelector('.finn-ctx-pinned');
    const thread = document.getElementById('finn-body');
    const cs = getComputedStyle(el);
    // walk ancestors to find any transform/filter/will-change/contain that would
    // create a new containing block and break position:sticky
    const chain = [];
    let node = el.parentElement;
    while (node) {
      const s = getComputedStyle(node);
      chain.push({
        tag: node.tagName, id: node.id, cls: node.className,
        overflow: s.overflow, overflowY: s.overflowY, transform: s.transform,
        willChange: s.willChange, filter: s.filter, contain: s.contain,
      });
      if (node.id === 'finn') break;
      node = node.parentElement;
    }
    const before = el.getBoundingClientRect();
    thread.scrollTop = 0;
    const atTop = el.getBoundingClientRect();
    thread.scrollTop = thread.scrollHeight;
    const atBottom = el.getBoundingClientRect();
    return {
      position: cs.position, top: cs.top, zIndex: cs.zIndex,
      threadScrollHeight: thread.scrollHeight, threadClientHeight: thread.clientHeight,
      before, atTop, atBottom, chain,
    };
  });
  console.log(JSON.stringify(diag, null, 2));
  await browser.close();
})();
