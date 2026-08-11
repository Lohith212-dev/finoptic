/* Ad hoc verification for the Savings Opportunities table changes (Spend column,
   Annual Saving Opportunity rename+percentage, Service/Service Owner renames,
   avatar removal) and the Team & access table's avatar removal. Screenshots plus
   console/page errors, so this can be checked without touching the Playwright
   MCP browser another session may have locked. */
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
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.evaluate(() => { go('overview'); });
  await new Promise(r => setTimeout(r, 300));
  const tableHTML = await page.evaluate(() => {
    const h3 = [...document.querySelectorAll('h3')].find(e => /Savings Opportunities/.test(e.textContent));
    const card = h3 && h3.closest('.card');
    if (card) card.setAttribute('data-shot', 'opps');
    const tbl = card && card.querySelector('table');
    return tbl ? tbl.outerHTML : null;
  });
  const oppsCard = await page.$('[data-shot="opps"]');
  if (oppsCard) await oppsCard.screenshot({ path: path.join(OUT, 'verify-savings-opps.png') });
  console.log('--- Savings Opportunities table HTML ---');
  console.log(tableHTML || 'NOT FOUND');

  await page.evaluate(() => { go('team'); });
  await new Promise(r => setTimeout(r, 300));
  const teamHTML = await page.evaluate(() => {
    const t = document.querySelector('.acct-tbl');
    if (t) t.setAttribute('data-shot', 'team');
    const tbl = t && t.querySelector('table');
    return tbl ? tbl.outerHTML.slice(0, 2000) : null;
  });
  const teamCard = await page.$('[data-shot="team"]');
  if (teamCard) await teamCard.screenshot({ path: path.join(OUT, 'verify-team-table.png') });
  console.log('--- Team table HTML (truncated) ---');
  console.log(teamHTML || 'NOT FOUND');

  console.log('--- Console/page errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
