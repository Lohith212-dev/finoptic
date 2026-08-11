/* Verifies: anomalies header+merged column, alert feed avatar removal, bottom
   padding clearing Finn's composer, and the sidebar profile chip/size bump. */
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

  // 1. Anomalies -- baseline (has the widest real +118% case) and ai-crisis (widest overall, +137%)
  for (const scen of ['baseline', 'ai-crisis']) {
    await page.evaluate((s) => { loadScenario(s); refresh(); go('anomalies'); }, scen);
    await new Promise(r => setTimeout(r, 300));
    const overflow = await page.evaluate(() => {
      const figs = [...document.querySelectorAll('.anom-fig')];
      return figs.map(f => ({
        text: f.querySelector('.anom-lab')?.textContent,
        overflowing: f.scrollWidth > f.clientWidth + 1
      })).filter(x => x.overflowing);
    });
    console.log(`[anomalies:${scen}] overflowing figs:`, JSON.stringify(overflow));
    const card = await page.evaluateHandle(() => {
      const h3 = [...document.querySelectorAll('h3')].find(e => /Detected Anomalies/.test(e.textContent));
      const c = h3.closest('.card'); c.setAttribute('data-shot', 'anom-' + Date.now());
      return c;
    });
    await card.asElement().screenshot({ path: path.join(OUT, `verify-anomalies-${scen}.png`) });
  }

  // 2. Alerts -- avatar gone from Alert Feed
  await page.evaluate(() => { loadScenario('baseline'); refresh(); go('alerts'); });
  await new Promise(r => setTimeout(r, 300));
  const alertAvatarCount = await page.evaluate(() => document.querySelectorAll('.alert-who .pav').length);
  console.log('[alerts] avatar elements in .alert-who:', alertAvatarCount);
  const alertCard = await page.$('#screen .card:has(h3)');
  await page.evaluate(() => {
    const h3 = [...document.querySelectorAll('h3')].find(e => /Alert Feed/.test(e.textContent));
    h3.closest('.card').setAttribute('data-shot', 'alerts');
  });
  const alertsCardEl = await page.$('[data-shot="alerts"]');
  if (alertsCardEl) await alertsCardEl.screenshot({ path: path.join(OUT, 'verify-alerts-feed.png') });

  // 3. Bottom padding -- scroll to the very bottom, screenshot the viewport
  await page.evaluate(() => { go('overview'); });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 200));
  const clearance = await page.evaluate(() => {
    const dock = document.querySelector('.finn-dock');
    const cards = [...document.querySelectorAll('.card')];
    const last = cards[cards.length - 1];
    const dockRect = dock.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    return { dockTop: dockRect.top, lastCardBottom: lastRect.bottom, clears: lastRect.bottom <= dockRect.top };
  });
  console.log('[bottom-padding] ', JSON.stringify(clearance));
  await page.screenshot({ path: path.join(OUT, 'verify-bottom-padding.png') });

  // 4. Sidebar profile
  await page.evaluate(() => window.scrollTo(0, 0));
  const profileHTML = await page.evaluate(() => document.getElementById('profile-btn').outerHTML);
  console.log('[profile] markup:', profileHTML);
  const profileEl = await page.$('#profile-btn');
  await profileEl.screenshot({ path: path.join(OUT, 'verify-profile.png') });

  console.log('--- errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
