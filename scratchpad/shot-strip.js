const pup = require('puppeteer-core'), path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const U = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');
(async () => {
  const b = await pup.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  const W = +(process.argv[3] || 1200);
  await p.setViewport({ width: W, height: 900, deviceScaleFactor: 2 });
  await p.goto(U, { waitUntil: 'networkidle0' });
  for (const sc of (process.argv[2] || 'itsm,alerts').split(',')) {
    await p.evaluate(s => go(s), sc);
    await new Promise(r => setTimeout(r, 200));
    const el = await p.$('.ledger');
    await el.screenshot({ path: path.join(OUT, `r15-strip-${sc}-${W}.png`) });
    console.log(`${sc} @${W}`);
  }
  await b.close();
})();
