/* Finn regression. 24 questions × 2 answer styles × 6 datasets, plus every flow
   that is not a question: the resting composer, the suggestions that rise from it,
   the artifact pane, the thinking log, history and its pinned resolution, origin
   context, free-text matching, the honest miss, Escape ordering and the sheet.
   Run with ?nofx so FINN_STILL is true — answers paint immediately, which makes
   this deterministic. A separate pass with motion ON checks thinking + streaming. */
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const URL = 'file:///C:/Users/lohit/Desktop/crozaint/04-code/finoptic/finoptic/index.html';
const BAD = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({executablePath:CHROME, headless:true,
    args:['--allow-file-access-from-files', '--window-size=1440,940']});
  const page = await browser.newPage();
  await page.setViewport({width:1440, height:940});

  const errs = [];
  page.on('console', m => { if(m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));

  await page.goto(URL + '?nofx', {waitUntil:'load'});
  /* SIGN-IN IS THE LANDING SCREEN, and it carries no chrome at all — the whole of
     Finn is hidden there, deliberately. Every assertion below is about the
     assistant, so the harness steps onto the board first. Without this the
     resting-composer checks fail on a hidden element and read as regressions in
     Finn rather than as the landing screen having changed. */
  await page.evaluate(()=>go('overview'));
  await wait(900);

  const fail = [], warn = [];
  const T = (c, label) => { if(!c) fail.push(label); };

  /* ---- 1. resting state: a centred composer, not a corner pod ---- */
  T(await page.$('#finn-dock') !== null, 'dock not rendered');
  T(await page.$('#finn-pod') === null, 'the old corner pod should be gone');
  const rest = await page.evaluate(() => {
    const d = document.getElementById('finn-dock').getBoundingClientRect();
    const s = getComputedStyle(document.getElementById('finn-surface'));
    return {cx:Math.round(d.left + d.width / 2), vw:window.innerWidth,
            surface:s.display, ph:document.getElementById('finn-ph').textContent,
            mode:getComputedStyle(document.querySelector('.finn-mode')).display,
            state:document.documentElement.getAttribute('data-finn')};
  });
  T(Math.abs(rest.cx - rest.vw / 2) < 24, `composer should be centred (centre ${rest.cx} of ${rest.vw})`);
  T(rest.surface === 'none', 'surface should be closed at rest');
  T(rest.ph.length > 6, 'resting composer should show a cycling question');
  T(rest.mode === 'none', 'the answer-style toggle should be hidden at rest');
  T(rest.state === null, 'no data-finn state at rest');
  /* The mark is the creature now, not two of the parent logo's blades. Its geometry,
     its eight motion states and the nine constraints they must not break are the
     subject of test-finn-motion.js; all this needs to know is that it is there. */
  T(await page.$$eval('[data-finn-mark] .finn-mark .creature', n => n.length >= 1),
    'Finn mark missing');

  /* no serif anywhere in Finn */
  const fonts = await page.evaluate(() => {
    const el = document.getElementById('finn-ph');
    return getComputedStyle(el).fontFamily;
  });
  T(/Mona Sans/i.test(fonts) && !/Fraunces|serif/i.test(fonts.replace(/sans-serif/gi, '')),
    'Finn should use the brand sans only, got: ' + fonts);

  /* ---- 2. focusing the composer raises three suggestions ---- */
  await page.focus('#finn-ask');
  await wait(520);   // let the veil's grow+fade transition settle before measuring
  const sugg = await page.evaluate(() => ({
    n:document.querySelectorAll('#finn-sugg button').length,
    on:document.getElementById('finn-sugg').classList.contains('on'),
    surface:getComputedStyle(document.getElementById('finn-surface')).display
  }));
  T(sugg.n === 3, 'expected 3 suggestions on focus, got ' + sugg.n);
  T(sugg.on, 'suggestion tray not shown');
  T(sugg.surface === 'none', 'focusing must NOT open the surface — only asking does');

  /* The veil grows to cover the risen suggestions, then gets out of the way when
     the surface opens and the scrim takes over. */
  const vh = await page.evaluate(() => {
    const v = document.getElementById('finn-veil'), cs = getComputedStyle(v);
    return {h:parseInt(cs.height, 10), op:+cs.opacity,
            focus:document.documentElement.hasAttribute('data-finn-focus')};
  });
  T(vh.focus, 'data-finn-focus should be set while the suggestions are up');
  T(vh.h > 300, 'the veil should grow behind the suggestions, got ' + vh.h + 'px');
  T(vh.op > .97, 'the veil should intensify with the suggestions, opacity ' + vh.op);
  const suggTop = await page.evaluate(() =>
    Math.round(document.querySelector('#finn-sugg button').getBoundingClientRect().top));
  const veilTop = await page.evaluate(() =>
    Math.round(document.getElementById('finn-veil').getBoundingClientRect().top));
  T(veilTop <= suggTop, `the veil must reach above the top suggestion (veil ${veilTop}, chip ${suggTop})`);

  /* ---- 3. the mark opens the surface, and the greeting is DERIVED ---- */
  await page.click('.finn-bar-m');
  await wait(300);
  const greet = await page.evaluate(() => ({
    state:document.documentElement.getAttribute('data-finn'),
    text:document.getElementById('finn-body').textContent,
    scrim:getComputedStyle(document.getElementById('finn-scrim')).visibility,
    w:Math.round(document.getElementById('finn-surface').getBoundingClientRect().width),
    vw:window.innerWidth,
    cats:document.querySelectorAll('.finn-cat').length
  }));
  T(greet.state === 'open', 'surface did not open from the mark');
  T(/Good (morning|afternoon|evening)/.test(greet.text), 'greeting missing');
  T(/Northwind Systems/.test(greet.text), 'greeting should name the workspace it has read');
  T(/\$1\.62M/.test(greet.text), 'greeting should carry a real figure it derived');
  T(!/Here is what you can ask about/.test(greet.text),
    'the greeting must NOT be a question catalogue any more');
  T(greet.cats === 0, 'greeting should not render the 4 accordions');
  T(greet.scrim === 'visible', 'scrim should be up while the surface is open');
  T(greet.w > greet.vw * 0.7, `surface should be ~80% of the viewport (got ${greet.w} of ${greet.vw})`);

  /* ---- 4. every question, every style, every dataset ---- */
  const datasets = await page.evaluate(() => FINOPTIC.list.map(s => s.id));
  const qids = await page.evaluate(() => Object.keys(FINN_Q));
  console.log('datasets:', datasets.join(', '));
  console.log('questions:', qids.length);

  let checked = 0, noWork = 0;
  for(const ds of datasets){
    await page.evaluate(id => { loadScenario(id); refresh(); }, ds);
    await wait(260);
    const wsEmpty = await page.evaluate(() => workspaceEmpty());

    for(const mode of ['brief','full']){
      await page.evaluate(m => { FN.mode = m; }, mode);
      for(const qid of qids){
        const before = errs.length;
        const r = await page.evaluate(qid => {
          FN.chat = null; FN.view = 'greet';
          finnAsk(qid);
          const host = document.querySelector('.finn-a');
          const t = FN.chat.turns[0];
          return {html:host ? host.innerHTML.length : 0,
                  text:host ? host.textContent : '',
                  work:(t.blocks || []).some(b => b.t === 'work'),
                  steps:(t.steps || []).length,
                  plotBlocks:(t.blocks || []).filter(b => b.t === 'chart' || b.t === 'table').length,
                  panels:host ? host.querySelectorAll('.fa-plot').length : 0,
                  titled:host ? host.querySelectorAll('.fa-plot > .fa-plot-h > b').length : 0};
        }, qid);
        checked++;
        if(errs.length > before)
          fail.push(`${ds}/${mode}/${qid}: ${errs.slice(before).join(' | ').slice(0,150)}`);
        if(r.html === 0) fail.push(`${ds}/${mode}/${qid}: rendered nothing`);
        if(BAD.test(r.text))
          fail.push(`${ds}/${mode}/${qid}: bad token "${(r.text.match(BAD)||[''])[0]}" near "${
            r.text.slice(Math.max(0,r.text.search(BAD)-45), r.text.search(BAD)+45).replace(/\s+/g,' ')}"`);
        /* Full must show its working; Brief must not. */
        if(mode === 'full' && !r.work) noWork++;
        if(mode === 'brief' && r.work) fail.push(`${ds}/${mode}/${qid}: Brief must not print the working`);
        /* Plots are INLINE, one titled panel per chart or table block. */
        if(r.panels !== r.plotBlocks)
          fail.push(`${ds}/${mode}/${qid}: ${r.plotBlocks} plot blocks but ${r.panels} panels`);
        if(r.titled !== r.panels)
          fail.push(`${ds}/${mode}/${qid}: ${r.panels - r.titled} plot panel(s) with no title`);
        if(!wsEmpty && !r.steps) warn.push(`${ds}/${mode}/${qid}: no reasoning steps`);
        if(wsEmpty && /\$\d/.test(r.text) && !/\$0/.test(r.text))
          fail.push(`${ds}/${mode}/${qid}: printed a figure on an EMPTY workspace`);
      }
    }
  }
  console.log('answers checked:', checked);
  if(noWork) warn.push(`${noWork} Full answers had no working block`);

  /* ---- 5. plots render INLINE, titled, and inside the reading column ---- */
  await page.evaluate(() => { loadScenario('baseline'); refresh(); });
  await wait(260);
  const plot = await page.evaluate(() => {
    FN.chat = null; FN.mode = 'brief';
    finnAsk('cloud-where');
    const f = document.querySelector('.fa-plot');
    /* Measure a SCALING chart, not the donut: donut() emits a fixed-width, centred
       svg by design, so its width says nothing about the column it sits in. */
    FN.chat = null; finnAsk('trend');
    const svg = document.querySelector('.fa-plot svg:not(.ct-donut)');
    const thread = document.getElementById('finn-body');
    return {panel:!!f, pane:!!document.getElementById('finn-art'),
            title:f ? f.querySelector('.fa-plot-h b').textContent : '',
            svgW:svg ? Math.round(svg.getBoundingClientRect().width) : 0,
            tinted:f ? getComputedStyle(f).backgroundColor : '',
            colW:Math.round(document.querySelector('.finn-turn').getBoundingClientRect().width),
            surfaceW:Math.round(document.getElementById('finn-surface').getBoundingClientRect().width)};
  });
  T(plot.panel, 'no inline plot panel rendered');
  T(!plot.pane, 'the artifact pane should be gone from the markup');
  T(/Cloud spend by provider|Monthly spend/.test(plot.title), 'plot panel title wrong: ' + plot.title);
  T(plot.svgW > 480, 'inline chart too narrow: ' + plot.svgW + 'px');
  T(plot.tinted !== 'rgba(0, 0, 0, 0)', 'the plot panel should sit on a tinted surface');
  T(plot.colW < plot.surfaceW - 60,
    `the thread should cap its measure (column ${plot.colW} vs surface ${plot.surfaceW})`);

  /* ---- 5b. the veil: behind the chat, and not eating the board ---- */
  const veil = await page.evaluate(() => {
    const v = document.getElementById('finn-veil');
    const nav = document.querySelector('.nav');
    return {h:getComputedStyle(v).height,
            vz:+getComputedStyle(v).zIndex, navz:+getComputedStyle(nav).zIndex,
            scrimz:+getComputedStyle(document.getElementById('finn-scrim')).zIndex,
            dockPos:getComputedStyle(document.getElementById('finn-dock')).position,
            surfPos:getComputedStyle(document.getElementById('finn-surface')).position};
  });
  /* Positioned children are what put the composer back ON TOP of its own veil: an
     absolutely-positioned ::before paints above every STATIC sibling. */
  T(veil.dockPos !== 'static', 'the dock must be positioned, or it paints behind the veil');
  T(veil.surfPos !== 'static', 'the surface must be positioned, or it paints behind the veil');
  T(parseInt(veil.h, 10) <= 180, 'the resting veil should be short, got ' + veil.h);
  /* The sidebar must sit ABOVE the resting veil — its profile row was being washed
     out — while Finn's own scrim still dims the nav once the surface opens. */
  T(veil.vz < veil.navz, `the nav (z ${veil.navz}) must be above the veil (z ${veil.vz})`);
  T(veil.scrimz > veil.navz, `Finn's scrim (z ${veil.scrimz}) must still dim the nav (z ${veil.navz})`);

  /* ---- 6. Brief/Full changes the ANSWER, not the window ---- */
  const wBrief = await page.$eval('#finn-surface', el => Math.round(el.getBoundingClientRect().width));
  const briefHas = await page.evaluate(() => !!document.querySelector('.fa-work'));
  await page.evaluate(() => finnSetMode('full'));
  await wait(250);
  const full = await page.evaluate(() => ({
    w:Math.round(document.getElementById('finn-surface').getBoundingClientRect().width),
    work:!!document.querySelector('.fa-work'),
    steps:document.querySelectorAll('.fa-work li').length
  }));
  T(!briefHas, 'Brief should not show the working');
  T(full.work, 'Full should show the working');
  T(full.steps >= 3, 'the working should be a real numbered derivation, got ' + full.steps);
  /* A flex container blockifies inline children, so a <b> inside a flex <li> becomes
     its own flex item and the row gap opens around every bold figure. */
  const wb = await page.evaluate(() => {
    const el = document.querySelector('.fa-work li b');
    return el ? getComputedStyle(el).display : 'none';
  });
  T(wb === 'inline', 'bold figures inside the working must stay inline, got display:' + wb);
  T(full.w === wBrief, `the window must NOT resize with the mode (${wBrief} -> ${full.w})`);

  /* ---- 7. origin context, and the thread surviving navigation ---- */
  await page.evaluate(() => { go('cloud'); });
  await wait(320);
  const ctx = await page.evaluate(() => {
    FN.chat = null; FN.mode = 'brief';
    finnAsk('cloud-where');
    return {ctx:(document.querySelector('.finn-ctx') || {}).textContent || '',
            state:document.documentElement.getAttribute('data-finn')};
  });
  T(/Cloud/.test(ctx.ctx), 'origin context does not name the screen: ' + ctx.ctx);
  T(/Baseline/.test(ctx.ctx), 'origin context should name the dataset');
  await page.evaluate(() => { go('finance'); });
  await wait(320);
  T(await page.evaluate(() => document.documentElement.getAttribute('data-finn') === 'open'),
    'surface closed on navigation');
  T(await page.$eval('.finn-a', el => el.innerHTML.length > 0), 'thread lost on navigation');

  /* ---- 8. full screen ---- */
  await page.evaluate(() => finnFull(true));
  await wait(300);
  const fs = await page.evaluate(() => ({
    state:document.documentElement.getAttribute('data-finn'),
    w:Math.round(document.getElementById('finn-surface').getBoundingClientRect().width),
    vw:window.innerWidth
  }));
  T(fs.state === 'full', 'full-screen state not set');
  T(fs.w > fs.vw * 0.93, `full screen should fill the width (${fs.w} of ${fs.vw})`);
  await page.evaluate(() => finnFull(false));
  await wait(250);

  /* ---- 9. the send button, and free text ---- */
  await page.evaluate(() => { FN.chat = null; FN.view = 'greet'; finnRender(); });
  await wait(120);
  T(await page.$eval('.finn-send', el => el.disabled), 'send should be disabled on an empty box');
  await page.focus('#finn-ask');
  await page.type('#finn-ask', 'which vendors account for most of our spend');
  await wait(160);
  T(await page.$eval('.finn-send', el => !el.disabled), 'send should enable once text is typed');
  T(await page.$eval('.finn-send', el => /gradient/.test(getComputedStyle(el).backgroundImage)),
    'send should carry the accent gradient — the layer’s one accent moment');
  await page.click('.finn-send');
  await wait(350);
  const sent = await page.evaluate(() => ({
    head:(document.querySelector('.fa-h') || {}).textContent || '',
    box:document.getElementById('finn-ask').value,
    off:document.querySelector('.finn-send').disabled}));
  T(/Microsoft/.test(sent.head), 'send did not answer the typed question: ' + sent.head);
  T(sent.box === '' && sent.off === true, 'composer not cleared / send not re-disabled');

  /* a question the data cannot answer must NOT match, and must admit it */
  const miss = await page.evaluate(() => {
    FN.chat = null;
    const q = finnMatch('what is the cost per metric ton produced at each plant');
    if(q) return {matched:q.id};
    finnNoMatch('what is the cost per metric ton produced at each plant');
    return {matched:null, text:document.querySelector('.finn-a').textContent,
            near:document.querySelectorAll('.finn-nearby button').length};
  });
  T(miss.matched === null, 'a question with no data should NOT match: ' + miss.matched);
  T(/do not have a reliable answer/.test(miss.text || ''), 'no-match state missing');
  T(miss.near === 3, 'the miss should offer 3 real questions, got ' + miss.near);
  T(!/mock|demo|prototype|placeholder/i.test(miss.text || ''),
    'no-match copy must not say it is a mock-up');

  /* ---- 10. history, pinned resolution, reopening ---- */
  await page.evaluate(() => {
    FN.chat = null; FN.mode = 'full';
    finnAsk('cut'); finnAsk('vendor-spend');
  });
  await wait(320);
  const hist = await page.evaluate(() => {
    FN.view = 'history'; finnRender();
    const c = document.querySelector('.finn-hist-c');
    return {n:document.querySelectorAll('.finn-hist-c').length,
            res:c ? (c.querySelector('.finn-hist-r') || {}).textContent : '',
            first:c ? c.firstElementChild.className : '',
            btn:c ? (c.querySelector('[data-finn-open]') || {}).textContent : '',
            scroll:document.getElementById('finn-body').scrollTop};
  });
  T(hist.n >= 1, 'no chat in history');
  T(/View the complete chat/.test(hist.btn), 'missing "View the complete chat"');
  T(/\$/.test(hist.res), 'resolution is not a money line: ' + hist.res);
  T(/finn-hist-r/.test(hist.first), 'the resolution must be the FIRST element in the card');
  T(hist.scroll === 0, 'history should start at the top');

  const re = await page.evaluate(() => {
    document.querySelector('[data-finn-open]').click();
    return {turns:document.querySelectorAll('.finn-turn').length};
  });
  T(re.turns === 2, 'reopened chat should have 2 turns, got ' + re.turns);

  const stale = await page.evaluate(() => {
    FN.chats[0]._live = null;
    loadScenario('optimised'); refresh();
    FN.view = 'history'; finnRender();
    document.querySelector('[data-finn-open]').click();
    return !!document.querySelector('.finn-stale');
  });
  T(stale, 'reopening a chat on a different dataset did not flag it');

  /* ---- 11. nothing anywhere claims to be a mock-up ---- */
  await page.evaluate(() => { loadScenario('baseline'); refresh(); });
  await wait(260);
  const claims = await page.evaluate(() => {
    const out = [];
    FN.mode = 'full';
    Object.keys(FINN_Q).forEach(id => {
      FN.chat = null; finnAsk(id);
      const t = document.querySelector('.finn-a').textContent;
      if(/\bmock[- ]?up\b|\bdemo\b|\bprototype\b|\bplaceholder\b|\bsample data\b|\bfake\b/i.test(t))
        out.push(id);
    });
    return out;
  });
  T(claims.length === 0, 'answers claiming to be a mock-up: ' + claims.join(', '));

  /* ---- 12. Escape: pane first, then the surface ---- */
  await page.evaluate(() => { FN.chat = null; FN.mode = 'brief'; finnAsk('cat-split'); });
  await wait(300);
  await page.keyboard.press('Escape');
  await wait(220);
  T(await page.evaluate(() => document.documentElement.getAttribute('data-finn') === null),
    'second Escape should close the surface');
  T(await page.$eval('#finn-dock', el => getComputedStyle(el).display !== 'none'),
    'the composer should come back');

  /* ---- 13. motion ON: the thinking log accumulates, then streams ---- */
  const p2 = await browser.newPage();
  const errs2 = [];
  p2.on('console', m => { if(m.type() === 'error') errs2.push(m.text()); });
  p2.on('pageerror', e => errs2.push(e.message));
  await p2.setViewport({width:1440, height:940});
  await p2.goto(URL, {waitUntil:'load'});
  await wait(1400);
  /* Onto the board, for the same reason the first page does it: sign-in hides the
     whole assistant. Done BEFORE the welcome check, because the welcome now waits for
     the board rather than firing at load — on the sign-in screen there is nothing to
     dismiss yet, and the dialog would then open underneath the rest of this pass. */
  await p2.evaluate(()=>go('overview'));
  await wait(900);
  const hadWelcome = await p2.evaluate(() =>
    !!document.querySelector('.mdl-scrim, .scrim, [role="dialog"]'));
  if(hadWelcome){ await p2.keyboard.press('Escape'); await wait(400); }
  console.log('motion-on pass: welcome dialog after reaching the board =', hadWelcome);

  /* the resting placeholder actually cycles */
  const ph1 = await p2.$eval('#finn-ph', el => el.textContent);
  await wait(4200);
  const ph2 = await p2.$eval('#finn-ph', el => el.textContent);
  T(ph1 !== ph2, 'the resting composer should cycle its question (stayed "' + ph1 + '")');

  await p2.evaluate(() => finnAsk('over-budget'));
  await wait(900);
  const mid = await p2.evaluate(() => ({
    /* The three bouncing dots were deleted in round 12 — they said "working" a
       second time, in the same 40px the mark's own thinking animation occupies.
       The indicator is now the BYLINE itself: `Finn` then `is thinking`, one
       sentence, so the name is not printed twice. */
    status:((document.querySelector('.finn-say') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
    steps:document.querySelectorAll('.finn-step').length,
    next:document.querySelectorAll('#finn-next .finn-chip').length,
    bold:(document.querySelector('.finn-step') || {}).innerHTML || '',
    busy:FN.busy}));
  T(/^Finn is (thinking|about to answer)$/.test(mid.status) || mid.steps > 0,
    'no thinking indicator while working, byline read "' + mid.status + '"');
  T((mid.status.match(/Finn/g) || []).length <= 1,
    'the byline says "Finn" twice: "' + mid.status + '"');
  T(await p2.$('.finn-dots') === null,
    'the dancing dots are back — they duplicate the mark\'s own thinking motion');
  T(mid.next === 0, 'follow-up questions must not appear while Finn is still working');
  T(!/&lt;b&gt;|<b>&lt;/.test(mid.bold) && !/\\u003cb\\u003e/.test(mid.bold),
    'reasoning steps are printing their markup as text');
  await wait(2600);
  const mid2 = await p2.evaluate(() => ({
    steps:document.querySelectorAll('.finn-step').length,
    done:document.querySelectorAll('.finn-step.done').length}));
  T(mid2.steps >= 2, 'reasoning steps should ACCUMULATE, saw ' + mid2.steps);
  T(mid2.done >= 1, 'settled steps should be marked done');
  /* Round 12 lengthened the sequence by ~1s: the opening beat went 520→900ms because
     a sentence needs longer on screen than a dot, and a 620ms `Finn is about to
     answer` beat was added before the stream so the log's collapse and the first
     words stop landing in the same frame. */
  await wait(9600);
  const done = await p2.evaluate(() => ({
    busy:FN.busy,
    thought:(document.querySelector('.finn-thought') || {}).textContent || '',
    len:(document.querySelector('.finn-a') || {}).textContent.length || 0}));
  T(done.busy === false, 'stream never finished');
  T(/Thought for [\d.]+s · \d+ steps/.test(done.thought),
    'thought log did not collapse: ' + done.thought);
  T(done.len > 100, 'answer did not land');
  if(errs2.length) fail.push('motion-on errors: ' + errs2.slice(0,3).join(' | '));

  /* ---- 14. narrow ---- */
  await p2.setViewport({width:430, height:820});
  await wait(400);
  const sheet = await p2.evaluate(() => {
    const s = document.getElementById('finn-surface').getBoundingClientRect();
    return {w:Math.round(s.width), vw:window.innerWidth,
            overflow:document.documentElement.scrollWidth > window.innerWidth + 1};
  });
  T(sheet.w >= sheet.vw - 30, `surface should fill 430px (got ${sheet.w} of ${sheet.vw})`);
  T(!sheet.overflow, 'page scrolls sideways at 430px with Finn open');

  await browser.close();

  console.log('\n' + '='.repeat(66));
  if(warn.length){ console.log('WARNINGS (' + warn.length + ')');
    warn.slice(0,10).forEach(w => console.log('  ~ ' + w)); }
  if(fail.length){
    console.log('FAILURES (' + fail.length + ')');
    fail.slice(0,30).forEach(f => console.log('  x ' + f));
    process.exitCode = 1;
  } else console.log('PASS — ' + checked + ' answers, ' + datasets.length + ' datasets, 0 errors');
  const other = errs.filter(e => !fail.some(f => f.includes(e.slice(0,40))));
  if(other.length){ console.log('\nunattributed console output:');
    [...new Set(other)].slice(0,6).forEach(e => console.log('  ! ' + e.slice(0,170))); }
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
