/* Verifies round-19 fixes:
   1. pinned context bar is now static (outside .finn-thread), never overlaps
      turn content at any scroll position
   2. "Or browse all questions" / "Or browse all 24 questions" buttons removed
      entirely, and no dead click-handler errors result
   Also re-checks everything from round 18 still holds. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' + path.resolve(__dirname, '../finoptic/index.html').replace(/\\/g, '/') + '?nofx';
const OUT = path.resolve(__dirname, 'shots');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); finnOpen('greet'); });
  await new Promise(r => setTimeout(r, 400));

  // 2. Browse-all buttons gone from the greeting.
  const greetBtn = await page.evaluate(() => !!document.querySelector('[data-finn-act="all"]'));
  console.log('[greeting: browse-all button present?]', greetBtn, greetBtn ? 'FAIL' : 'PASS (removed)');

  const qids = await page.evaluate(() => FINN_CATS.flatMap(c => c.qs).slice(0, 4).map(q => q.id));
  for (const qid of qids) {
    await page.evaluate((id) => finnAsk(id), qid);
    await new Promise(r => setTimeout(r, 2200));
  }

  const followupBtn = await page.evaluate(() => !!document.querySelector('#finn-next [data-finn-act="all"]'));
  console.log('[followups: browse-all button present?]', followupBtn, followupBtn ? 'FAIL' : 'PASS (removed)');

  // 1. Structural: exactly one ctx bar, living in #finn-ctx-top, none inside .finn-thread.
  const counts = await page.evaluate(() => ({
    top: document.querySelectorAll('#finn-ctx-top .finn-ctx').length,
    insideThread: document.querySelectorAll('#finn-body .finn-ctx').length,
  }));
  console.log('[ctx bar location]', JSON.stringify(counts), counts.top === 1 && counts.insideThread === 0 ? 'PASS' : 'CHECK');

  // Overlap check: at several scroll positions, the ctx bar's rect must never
  // intersect any .finn-turn's rect (it lives outside .finn-thread, so this
  // should be geometrically guaranteed, but verify against real layout).
  const overlapReport = await page.evaluate(() => {
    const thread = document.getElementById('finn-body');
    const ctx = document.getElementById('finn-ctx-top');
    const positions = [0, thread.scrollHeight * 0.3, thread.scrollHeight * 0.6, thread.scrollHeight];
    return positions.map(p => {
      thread.scrollTop = p;
      const ctxR = ctx.getBoundingClientRect();
      const turns = [...document.querySelectorAll('.finn-turn')];
      const overlapping = turns.some(t => {
        const r = t.getBoundingClientRect();
        return !(r.bottom < ctxR.top || r.top > ctxR.bottom);
      });
      return { scrollTop: thread.scrollTop, ctxTop: ctxR.top, ctxBottom: ctxR.bottom, overlapsATurn: overlapping };
    });
  });
  console.log('[overlap check]', JSON.stringify(overlapReport));
  const anyOverlap = overlapReport.some(r => r.overlapsATurn);
  console.log(anyOverlap ? 'FAIL (ctx bar overlaps turn content)' : 'PASS (never overlaps)');
  await page.screenshot({ path: path.join(OUT, 'r19-ctx-top-scrolled.png') });

  // Re-check round-18 items briefly.
  const animScope = await page.evaluate(() => {
    document.getElementById('finn').className = 'finn finn-scope idle';
    const turns = [...document.querySelectorAll('.finn-turn')];
    return turns.map((t, i) => ({
      i, isLast: i === turns.length - 1,
      anim: getComputedStyle(t.querySelector('.finn-say-o .finn-mark .creature')).animationName,
    }));
  });
  console.log('[animation scope]', JSON.stringify(animScope));

  const align = await page.evaluate(() => {
    const bar = document.getElementById('finn-bar').getBoundingClientRect();
    const mode = document.querySelector('.finn-mode').getBoundingClientRect();
    return Math.abs(bar.left - mode.left) < 1;
  });
  console.log('[brief/full still aligned]', align ? 'PASS' : 'FAIL');

  console.log('--- errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
