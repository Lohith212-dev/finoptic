/* Verifies: default palette is blue, Finn's mark/favicon re-tint with the
   palette, and the open chat surface is a true full-page layout (no radius,
   no shadow, edge-to-edge) in both 'open' and 'full' states. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Default palette should be blue (fresh localStorage in a new profile dir).
  const defaultPalette = await page.evaluate(() => document.documentElement.getAttribute('data-palette'));
  console.log('[default palette]', defaultPalette);

  // 2. Favicon href should carry the blue hex.
  const faviconHref = await page.evaluate(() => document.getElementById('app-favicon').href);
  console.log('[favicon]', /146EF5/i.test(faviconHref) ? 'blue OK' : 'MISMATCH: ' + faviconHref.slice(0, 120));

  // 3. Open Finn, check the mark actually resolves var(--accent) to the live accent colour.
  await page.evaluate(() => { go('overview'); finnOpen('greet'); });
  await new Promise(r => setTimeout(r, 400));
  const markFillOpen = await page.evaluate(() => {
    const path = document.querySelector('.finn-orb .finn-mark .limb path, .finn-orb .finn-mark path[fill]');
    return path ? getComputedStyle(path).fill : null;
  });
  console.log('[finn mark fill, blue theme]', markFillOpen); // expect rgb(20, 110, 245) == #146EF5

  // 4. Full-page layout check: surface should span the full viewport, no radius/shadow.
  const layoutOpen = await page.evaluate(() => {
    const s = document.getElementById('finn-surface');
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return { top: r.top, left: r.left, right: window.innerWidth - r.right, width: r.width, winW: window.innerWidth, radius: cs.borderRadius, shadow: cs.boxShadow };
  });
  console.log('[layout: open]', JSON.stringify(layoutOpen));
  await page.screenshot({ path: path.join(OUT, 'verify-finn-fullpage-open.png') });

  // 5. Toggle to "full" (maximise) and re-check — should be identical full-bleed treatment.
  await page.evaluate(() => { document.querySelector('[data-finn-act="full"]').click(); });
  await new Promise(r => setTimeout(r, 300));
  const layoutFull = await page.evaluate(() => {
    const s = document.getElementById('finn-surface');
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return { top: r.top, left: r.left, right: window.innerWidth - r.right, width: r.width, radius: cs.borderRadius, shadow: cs.boxShadow, attr: document.documentElement.getAttribute('data-finn') };
  });
  console.log('[layout: full]', JSON.stringify(layoutFull));
  await page.screenshot({ path: path.join(OUT, 'verify-finn-fullpage-full.png') });

  // 6. Switch palette to orange mid-session and confirm the mark + favicon follow.
  await page.evaluate(() => {
    const sel = document.getElementById('palette-switch');
    sel.value = 'orange';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 200));
  const afterOrange = await page.evaluate(() => {
    const path = document.querySelector('.finn-orb .finn-mark path[fill]');
    return {
      markFill: path ? getComputedStyle(path).fill : null,
      favicon: document.getElementById('app-favicon').href.match(/fill="%23([0-9A-Fa-f]{6})"/)[1],
    };
  });
  console.log('[after switching to orange]', JSON.stringify(afterOrange)); // expect rgb(255,86,0) and FF5600
  await page.screenshot({ path: path.join(OUT, 'verify-finn-orange.png') });

  console.log('--- console/page errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
