/* Verifies round-18 fixes:
   1. default open = floating panel; full-screen button = true full page
   2. only header/composer/last-turn marks animate, older turns freeze
   3. context chips pinned once (sticky), not repeated per turn
   4. suggestion labels reworded to sound optional
   5. sources render as inline clickable text, not chips, and are clickable
   6. Brief/Full toggle caps/centres under the composer bar
*/
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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { go('overview'); });

  // 1. Default open should be a floating panel, not full page.
  await page.evaluate(() => { finnOpen('greet'); });
  await new Promise(r => setTimeout(r, 400));
  const openLayout = await page.evaluate(() => {
    const s = document.getElementById('finn-surface');
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return { width: r.width, winW: window.innerWidth, radius: cs.borderRadius, shadow: cs.boxShadow !== 'none', attr: document.documentElement.getAttribute('data-finn') };
  });
  console.log('[1a: default open]', JSON.stringify(openLayout), openLayout.width < openLayout.winW && openLayout.radius !== '0px' && openLayout.shadow ? 'PASS (floating)' : 'FAIL');
  await page.screenshot({ path: path.join(OUT, 'r18-open-floating.png') });

  await page.evaluate(() => { document.querySelector('[data-finn-act="full"]').click(); });
  await new Promise(r => setTimeout(r, 300));
  const fullLayout = await page.evaluate(() => {
    const s = document.getElementById('finn-surface');
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return { width: r.width, winW: window.innerWidth, radius: cs.borderRadius, shadow: cs.boxShadow !== 'none' };
  });
  console.log('[1b: maximise]', JSON.stringify(fullLayout), fullLayout.width === fullLayout.winW && fullLayout.radius === '0px' && !fullLayout.shadow ? 'PASS (full page)' : 'FAIL');
  await page.screenshot({ path: path.join(OUT, 'r18-full-screen.png') });
  await page.evaluate(() => { document.querySelector('[data-finn-act="full"]').click(); }); // back to open

  // 2/3. Ask two questions, then inspect turn structure + animation scoping.
  const qids = await page.evaluate(() => FINN_CATS.flatMap(c => c.qs).slice(0, 2).map(q => q.id));
  for (const qid of qids) {
    await page.evaluate((id) => finnAsk(id), qid);
    await new Promise(r => setTimeout(r, 2200)); // let the streamed answer land
  }
  const turnCount = await page.evaluate(() => document.querySelectorAll('.finn-turn').length);
  console.log('[turns created]', turnCount);

  const ctxCounts = await page.evaluate(() => ({
    pinned: document.querySelectorAll('.finn-ctx-pinned').length,
    perTurn: document.querySelectorAll('.finn-turn .finn-ctx').length,
  }));
  console.log('[3: context chips]', JSON.stringify(ctxCounts), ctxCounts.pinned === 1 && ctxCounts.perTurn === 0 ? 'PASS (pinned once, no per-turn repeat)' : 'CHECK');

  await page.evaluate(() => { document.documentElement.className; /* noop */ });
  // Force a global state and check which marks actually carry an animation-name.
  const animScope = await page.evaluate(() => {
    document.getElementById('finn').classList.remove('docked','idle','listening','thinking','speaking','settle','summon','alert');
    document.getElementById('finn').classList.add('idle');
    const turns = [...document.querySelectorAll('.finn-turn')];
    const anims = turns.map((t, i) => {
      const el = t.querySelector('.finn-say-o .finn-mark .creature');
      return { i, isLast: i === turns.length - 1, anim: el ? getComputedStyle(el).animationName : null };
    });
    const header = getComputedStyle(document.querySelector('.finn-orb .finn-mark .creature')).animationName;
    return { anims, header };
  });
  console.log('[2: animation scope, idle]', JSON.stringify(animScope));
  const onlyLastAnimates = animScope.anims.every(a => a.isLast ? a.anim !== 'none' : a.anim === 'none');
  console.log(onlyLastAnimates && animScope.header !== 'none' ? 'PASS (only last turn + header animate)' : 'FAIL');

  // 5. Sources should render as a <p class="fa-srcs"> with inline <button class="fa-src"> links, no chip boxes.
  const srcInfo = await page.evaluate(() => {
    const p = document.querySelector('.fa-srcs');
    if (!p) return null;
    const btn = p.querySelector('.fa-src');
    return { text: p.textContent.trim(), tag: btn && btn.tagName, bg: btn && getComputedStyle(btn).backgroundColor, underline: btn && getComputedStyle(btn).textDecorationLine };
  });
  console.log('[5: sources]', JSON.stringify(srcInfo));
  if (srcInfo) {
    await page.evaluate(() => document.querySelector('.fa-src').click());
    await new Promise(r => setTimeout(r, 150));
    const toastText = await page.evaluate(() => { const t = document.querySelector('.toast-item'); return t ? t.textContent : null; });
    console.log('[5b: source click toast]', toastText);
  }

  // 4. Suggestion labels.
  const labels = await page.evaluate(() => ({
    followupsLabel: document.querySelector('#finn-next .finn-next-l') ? document.querySelector('#finn-next .finn-next-l').textContent : null,
    followupsBtn: document.querySelector('#finn-next [data-finn-act="all"]') ? document.querySelector('#finn-next [data-finn-act="all"]').textContent : null,
  }));
  console.log('[4: labels]', JSON.stringify(labels));

  // 6. Brief/Full toggle alignment vs the bar, in the floating (open) panel.
  const align = await page.evaluate(() => {
    const bar = document.getElementById('finn-bar').getBoundingClientRect();
    const mode = document.querySelector('.finn-mode').getBoundingClientRect();
    return { barLeft: bar.left, modeLeft: mode.left, barWidth: bar.width, modeWidth: mode.width };
  });
  console.log('[6: brief/full alignment]', JSON.stringify(align), Math.abs(align.barLeft - align.modeLeft) < 1 ? 'PASS (aligned)' : 'CHECK');
  await page.screenshot({ path: path.join(OUT, 'r18-thread-final.png'), fullPage: false });

  console.log('--- errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
