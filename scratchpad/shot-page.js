const pup = require('puppeteer-core'), path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const U = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');
(async () => {
  const b = await pup.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await p.goto(U, { waitUntil: 'networkidle0' });
  for (const job of (process.argv[2] || 'overview:auto').split(',')) {
    const [sc, accent] = job.split(':');
    await p.evaluate((s, a) => {
      if (a && a !== 'auto') document.documentElement.setAttribute('data-palette', a);
      document.documentElement.setAttribute('data-sum', 'metrics');
      go(s);
    }, sc, accent);
    await new Promise(r => setTimeout(r, 300));
    await p.screenshot({ path: path.join(OUT, `r16-${sc}-${accent || 'auto'}.png`) });
    console.log(`${sc}/${accent}`);
  }
  await b.close();
})();
