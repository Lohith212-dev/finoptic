/* Finn's motion system — the acceptance checklist from
   planning/design-language/finn/finn-implementation-guide.md §8, as assertions.

   The guide's own framing is that six versions were burned learning its nine hard
   constraints, and that violating one is a regression "even if the result looks fine
   to you". That is exactly the class of bug a screenshot cannot catch, so this
   harness measures the things the constraints are actually about: whether the hub
   moves, whether limb thickness changes, whether the arms lead the legs, whether
   anything rotates, and whether every instance of the mark moves in lockstep.

   The strongest check in here is the FIRST one: the app's `<g class="creature">` is
   compared byte-for-byte against the prototype's. The whole guide rests on the
   geometry being untouched — nested rotate() wrappers included, since the legs
   telescope about the local origin of those frames — and a diff is the only way to
   know an editor, a formatter or an optimiser has not quietly helped.

   Run:  node test-finn-motion.js        (needs puppeteer-core + a Chrome binary) */
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME = 'C:/Users/lohit/.cache/puppeteer/chrome/win64-142.0.7444.175/chrome-win64/chrome.exe';
const ROOT = 'C:/Users/lohit/Desktop/crozaint/04-code/finoptic';
const URL  = 'file:///' + ROOT + '/finoptic/index.html';
const PROTO = 'file:///' + ROOT + '/planning/design-language/finn/finn-motion-v8.html';
const wait = ms => new Promise(r => setTimeout(r, ms));

/* MEASURE THE COMPOSER'S MARK, NOT THE FIRST ONE IN THE DOM. The first is the
   surface header's, and the surface is `display:none` while the conversation is
   closed — so its rects are all zero and, more subtly, `getComputedStyle().transform`
   returns the BASE value rather than the animated one, because a hidden element runs
   no animation. `animation-name` still resolves on a hidden element, which is why the
   per-state checks below can query freely and only the measurements need this. */
const V = '#finn .finn-bar-m ';

/* A CSS matrix as its six numbers. `a` is x-scale, `d` is y-scale, `b`/`c` are the
   shear/rotation terms — which is what makes "no rotation" and "thickness constant"
   directly measurable rather than a matter of opinion. */
const M = t => {
  const m = /matrix\(([^)]+)\)/.exec(t || '');
  if(!m) return null;
  const n = m[1].split(',').map(Number);
  return {a:n[0], b:n[1], c:n[2], d:n[3], e:n[4], f:n[5]};
};

/* A 16-bit mono PCM WAV, 3s at 16kHz: two tones well apart plus a silent gap each
   second, so the spectrum genuinely differs ACROSS the bars rather than lighting one
   bin, and so they have something to fall back from. Hand-rolled because the header
   is 44 bytes and pulling a dependency in for that would have to argue with the
   mock-up's own no-dependencies rule. Generated rather than committed: a binary
   fixture in a project with no build step is one nobody can regenerate. */
function wavTone(){
  const rate = 16000, secs = 3, n = rate * secs;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for(let i = 0; i < n; i++){
    const t = i / rate;
    const v = (t % 1) > 0.82 ? 0
      : 0.42 * Math.sin(2 * Math.PI * 320 * t) + 0.34 * Math.sin(2 * Math.PI * 900 * t);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 26000))), 44 + i * 2);
  }
  return buf;
}

(async () => {
  /* §10d, the dictation meter, needs a microphone with something ON it. Chrome's
     `--use-fake-device-for-media-stream` gives you a device but recent builds make it
     SILENT, which is indistinguishable from a broken analyser — fifteen bars at the
     floor either way. So the harness writes a real WAV and hands it to Chrome with
     `--use-file-for-fake-audio-capture`: two tones plus a gap, so the bars have both
     something to follow and something to fall back from. Generated rather than
     committed, because a binary fixture in a repo with no build step is a fixture
     nobody can regenerate. */
  /* ABSOLUTE. Chrome resolves this flag against its own working directory, not the
     harness's, and a relative path is silently ignored — which looks exactly like a
     broken analyser. */
  const TONE = require('path').resolve('finn-mic-tone.wav');
  fs.writeFileSync(TONE, wavTone());
  const browser = await puppeteer.launch({executablePath:CHROME, headless:true,
    args:['--allow-file-access-from-files', '--window-size=1440,940',
          '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
          '--use-file-for-fake-audio-capture=' + TONE]});
  const fail = [], note = [];
  const T = (c, label) => { if(!c) fail.push(label); };

  const page = await browser.newPage();
  await page.setViewport({width:1440, height:940});
  const errs = [];
  page.on('console', m => { if(m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));

  await page.goto(URL, {waitUntil:'load'});
  await wait(1200);
  /* Sign-in carries no chrome and hides the whole of Finn, so `display:none` would
     stop every animation and every measurement below. Onto the board first — the
     same first move test-finn.js makes, for the same reason. */
  await page.evaluate(() => go('overview'));
  await wait(900);
  const welcome = await page.evaluate(() =>
    !!document.querySelector('.mdl-scrim, .scrim, [role="dialog"]'));
  if(welcome){ await page.keyboard.press('Escape'); await wait(400); }

  /* ---- 1. the geometry is the prototype's, byte for byte ------------------ */
  const proto = await browser.newPage();
  await proto.goto(PROTO, {waitUntil:'load'});
  const protoG = await proto.evaluate(() =>
    document.querySelector('svg.finn > g.creature').outerHTML);
  await proto.close();

  const appG = await page.evaluate(() =>
    document.querySelector('.finn-mark > g.creature').outerHTML);
  T(appG === protoG, 'the mark is NOT byte-identical to the prototype (see the diff printed below)');
  if(appG !== protoG){
    fs.writeFileSync('finn-mark-app.txt', appG);
    fs.writeFileSync('finn-mark-proto.txt', protoG);
    note.push('wrote finn-mark-app.txt / finn-mark-proto.txt for diffing');
  }

  /* The structure the motion depends on, named part by part so a failure says which
     piece went. The two rotate() wrappers are the ones an optimiser eats. */
  const shape = await page.evaluate(() => {
    const s = document.querySelector('.finn-mark');
    const rots = [...s.querySelectorAll('g[transform]')]
      .map(g => g.getAttribute('transform')).filter(t => /rotate/.test(t));
    return {
      vb:s.getAttribute('viewBox'),
      limbs:s.querySelectorAll('.limb').length,
      arms:s.querySelectorAll('.armL, .armR').length,
      legs:s.querySelectorAll('.legRay').length,
      hub:s.querySelectorAll(':scope > .creature > path').length,
      eyeOrbs:s.querySelectorAll('.eyeOrb').length,
      eyes:s.querySelectorAll('.eyeI').length,
      rots,
      /* legs must still be WRAPPED by the rotated frames, not siblings of them */
      nested:[...s.querySelectorAll('.legRay')].every(l =>
        /rotate/.test((l.parentElement.getAttribute('transform') || ''))),
      fills:[...s.querySelectorAll('path')].map(p => p.getAttribute('fill'))
    };
  });
  T(shape.vb === '0 0 112 97', 'viewBox changed: ' + shape.vb);
  T(shape.limbs === 4, 'expected 4 limbs, got ' + shape.limbs);
  T(shape.arms === 2, 'expected armL + armR, got ' + shape.arms);
  T(shape.legs === 2, 'expected 2 legRay groups, got ' + shape.legs);
  T(shape.hub === 1, 'the hub should be the one un-grouped path in the creature, got ' + shape.hub);
  T(shape.eyeOrbs === 2 && shape.eyes === 2, 'the eyes lost a wrapper layer');
  T(shape.nested, 'a legRay is no longer inside its rotate() frame — the leg motion is broken');
  T(/rotate\(115\.023\)/.test(shape.rots.join(' ')) && /rotate\(64\.977\)/.test(shape.rots.join(' ')),
    'the leg rotation angles changed: ' + shape.rots.join(' | '));
  T(shape.fills.filter(f => f === '#FF5600').length === 5,
    'expected 5 orange paths (2 arms, hub, 2 legs), got ' + shape.fills.filter(f => f === '#FF5600').length);
  T(shape.fills.filter(f => f === 'black').length === 2, 'the eyes are not black');

  /* ---- 2. one scope, three instances, no per-instance state --------------- */
  const scope = await page.evaluate(() => {
    const el = document.getElementById('finn');
    return {isScope:el.classList.contains('finn-scope'),
            state:[...el.classList].find(c => ['docked','alert','summon','idle','listening',
              'thinking','speaking','settle'].includes(c)),
            marks:document.querySelectorAll('#finn .finn-mark').length,
            outside:document.querySelectorAll('.finn-mark:not(#finn .finn-mark)').length};
  });
  T(scope.isScope, '#finn does not carry finn-scope');
  T(scope.state === 'docked', 'Finn should ship docked, got ' + scope.state);
  T(scope.marks >= 2, 'expected the header + composer marks at least, got ' + scope.marks);
  T(scope.outside === 0, scope.outside + ' mark(s) render OUTSIDE the scope and will never animate');

  /* ---- 3. docked is FROZEN (constraint 8) -------------------------------- */
  const frozen = await page.evaluate(() => {
    const names = sel => [...document.querySelectorAll('#finn ' + sel)]
      .map(e => getComputedStyle(e).animationName);
    return {creature:names('.creature'), limb:names('.limb'), eye:names('.eyeOrb'),
            blinking:document.querySelectorAll('#finn .eyeI.blink').length};
  });
  T([...frozen.creature, ...frozen.limb, ...frozen.eye].every(n => n === 'none'),
    'docked is animating something: ' + [...new Set([...frozen.creature, ...frozen.limb, ...frozen.eye])].join(','));
  T(frozen.blinking === 0, 'docked must not blink');
  /* and it must actually still be drawn, at its own 112:97 ratio */
  const drawn = await page.evaluate(v => {
    const r = document.querySelector(v + '.finn-mark').getBoundingClientRect();
    const ink = document.querySelector(v + '.creature').getBoundingClientRect();
    return {w:r.width, h:r.height, ink:Math.round(ink.width)};
  }, V);
  T(drawn.w > 8 && drawn.h > 8, 'the docked mark does not render: ' + JSON.stringify(drawn));
  T(Math.abs(drawn.w / drawn.h - 112 / 97) < 0.04,
    `the mark is letterboxed or squashed: ${drawn.w.toFixed(1)}×${drawn.h.toFixed(1)}`);
  T(drawn.ink > 10, 'the creature draws almost no ink: ' + drawn.ink + 'px wide');
  note.push(`composer mark ${drawn.w.toFixed(1)}×${drawn.h.toFixed(1)}px, creature ink ${drawn.ink}px wide`);

  /* ---- 4. every state drives what it should, and only that --------------- */
  const EXPECT = {
    idle:      {creature:'finn-breath',  limb:'none', eye:'none'},
    listening: {creature:'none',         limb:'none', eye:'none'},
    thinking:  {creature:'none',         limb:'finn-ray', eye:'finn-eyelife'},
    speaking:  {creature:'finn-speak',   limb:'none', eye:'none'},
    settle:    {creature:'finn-settle',  limb:'none', eye:'none'},
    alert:     {creature:'finn-alertp',  limb:'none', eye:'none'},
    summon:    {creature:'finn-sum',     limb:'none', eye:'none'}
  };
  for(const [state, want] of Object.entries(EXPECT)){
    const got = await page.evaluate(s => {
      /* Set the class directly rather than through finnState(), so the one-shot
         states can be measured before their auto-return fires. */
      const el = document.getElementById('finn');
      ['docked','alert','summon','idle','listening','thinking','speaking','settle']
        .forEach(x => el.classList.remove(x));
      el.classList.add(s);
      const one = sel => getComputedStyle(document.querySelector('#finn ' + sel)).animationName;
      return {creature:one('.creature'), limb:one('.limb'), eye:one('.eyeOrb'),
              hub:getComputedStyle(document.querySelector('#finn .creature > path')).animationName};
    }, state);
    T(got.creature === want.creature, `${state}: creature animation ${got.creature}, want ${want.creature}`);
    T(got.limb === want.limb, `${state}: limb animation ${got.limb}, want ${want.limb}`);
    T(got.eye === want.eye, `${state}: eyeOrb animation ${got.eye}, want ${want.eye}`);
    /* CONSTRAINT 6, checked in every state, because a refactor animating the hub is
       the failure the guide calls out by name. */
    T(got.hub === 'none', `${state}: THE HUB IS ANIMATING (${got.hub}) — constraint 6`);
  }

  /* ---- 5. thinking, measured (constraints 1, 3, 5, 6) -------------------- */
  await page.evaluate(() => {
    const el = document.getElementById('finn');
    el.className = 'finn finn-scope thinking';
  });
  await wait(700);   /* let any inherited .creature transition finish first */

  const delays = await page.evaluate(v => {
    const cs = s => getComputedStyle(document.querySelector(v + s));
    return {armL:cs('.armL').animationDelay, armR:cs('.armR').animationDelay,
            leg:cs('.legRay').animationDelay, tempo:cs('.limb').animationDuration,
            origins:{armL:cs('.armL').transformOrigin, armR:cs('.armR').transformOrigin,
                     leg:cs('.legRay').transformOrigin}};
  }, V);
  T(delays.armL === '0s' && delays.armR === '0s', 'the arms should not be staggered');
  T(delays.leg === '0.22s', 'the legs should lag by --think-stagger 0.22s, got ' + delays.leg);
  T(delays.tempo === '1.7s', '--think-tempo should be 1.7s, got ' + delays.tempo);
  T(/^47px 42\.2px/.test(delays.origins.armL), 'armL weld moved: ' + delays.origins.armL);
  T(/^65px 42\.2px/.test(delays.origins.armR), 'armR weld moved: ' + delays.origins.armR);
  T(/^0px 0px/.test(delays.origins.leg), 'the leg weld is no longer its local apex: ' + delays.origins.leg);

  /* Sample the live matrices through more than one full cycle. */
  const samples = [];
  for(let i = 0; i < 26; i++){
    samples.push(await page.evaluate(v => {
      const g = s => getComputedStyle(document.querySelector(v + s)).transform;
      const hub = document.querySelector(v + '.creature > path').getBoundingClientRect();
      return {armL:g('.armL'), armR:g('.armR'), leg:g('.legRay'),
              hub:[Math.round(hub.x * 100) / 100, Math.round(hub.y * 100) / 100,
                   Math.round(hub.width * 100) / 100, Math.round(hub.height * 100) / 100]};
    }, V));
    await wait(150);
  }
  const mats = samples.map(s => ({armL:M(s.armL), armR:M(s.armR), leg:M(s.leg)}))
                      .filter(s => s.armL && s.armR && s.leg);
  T(mats.length > 20, 'could not read the limb transforms as matrices');

  /* CONSTRAINT 5 — length only. `a` is the only term that may move: d stays 1 so the
     limb never gets thicker or thinner, b/c stay 0 so it never rotates or shears. */
  const thick = mats.filter(m => ['armL','armR','leg'].some(k =>
    Math.abs(m[k].d - 1) > 0.001 || Math.abs(m[k].b) > 0.001 || Math.abs(m[k].c) > 0.001));
  T(thick.length === 0,
    `limbs are not telescoping length-only in ${thick.length} of ${mats.length} samples ` +
    `(first bad: ${JSON.stringify(thick[0] || {})}) — constraint 5`);

  /* It must actually MOVE, and reach roughly --think-depth. */
  const aVals = mats.flatMap(m => [m.armL.a, m.armR.a, m.leg.a]);
  const lo = Math.min(...aVals), hi = Math.max(...aVals);
  T(hi > 0.97, 'the limbs never return to rest length, max ' + hi.toFixed(3));
  T(lo < 0.6, 'the limbs barely retract — max gather ' + lo.toFixed(3) + ', --think-depth is .45');

  /* Left/right always mirror: same animation, no delay between them. */
  const skew = Math.max(...mats.map(m => Math.abs(m.armL.a - m.armR.a)));
  T(skew < 0.02, 'the arms are out of step with each other by ' + skew.toFixed(3));

  /* Arms LEAD legs: over the run, the legs' gather lags the arms'. */
  const lag = mats.filter(m => Math.abs(m.armL.a - m.leg.a) > 0.02).length;
  T(lag > 3, 'the legs are not lagging the arms at all — the ripple is gone');

  /* CONSTRAINT 6, measured rather than read off the CSS: the hub does not move. */
  const hubs = new Set(samples.map(s => s.hub.join('|')));
  T(hubs.size === 1, `the hub MOVED during thinking (${hubs.size} distinct rects) — constraint 6`);

  /* ---- 6. nothing rotates, in any state (constraint 4) ------------------- */
  const rotated = [];
  for(const s of ['idle','listening','thinking','speaking','settle','alert','summon']){
    await page.evaluate(x => { document.getElementById('finn').className = 'finn finn-scope ' + x; }, s);
    for(let i = 0; i < 6; i++){
      const r = await page.evaluate(v => {
        const out = [];
        document.querySelectorAll(v + '.creature, ' + v + '.limb, ' + v + '.eyeOrb')
          .forEach(e => out.push(getComputedStyle(e).transform));
        return out;
      }, V);
      r.forEach(t => { const m = M(t); if(m && (Math.abs(m.b) > 0.001 || Math.abs(m.c) > 0.001)) rotated.push(s); });
      await wait(120);
    }
  }
  T(rotated.length === 0, 'something ROTATES in state(s) ' + [...new Set(rotated)].join(', ') + ' — constraint 4');

  /* ---- 7. all instances in lockstep (acceptance 6) ----------------------- */
  await page.evaluate(() => { FN.chat = null; FN.mode = 'brief'; finnAsk('over-budget'); });
  await wait(1400);
  const lock = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#finn .creature')];
    const l = [...document.querySelectorAll('#finn .limb')];
    return {marks:document.querySelectorAll('#finn .finn-mark').length,
            creature:[...new Set(c.map(e => getComputedStyle(e).animationName))],
            limb:[...new Set(l.map(e => getComputedStyle(e).animationName))]};
  });
  T(lock.marks >= 3, 'the answer byline should have added a third mark, got ' + lock.marks);
  T(lock.creature.length === 1 && lock.limb.length === 1,
    'the marks are NOT in lockstep: ' + JSON.stringify(lock));

  /* ---- 8a. opening Finn plays summon, then hands over to idle ------------- */
  await page.evaluate(() => { finnSkip(); finnClose(); FN.chat = null; });
  await wait(900);
  const opened = await page.evaluate(async () => {
    const el = document.getElementById('finn');
    const at = () => ['docked','alert','summon','idle','listening','thinking','speaking','settle']
      .find(x => el.classList.contains(x));
    const before = at();
    document.querySelector('.finn-bar-m').click();
    const on = at();
    await new Promise(r => setTimeout(r, 900));
    return {before, on, after:at()};
  });
  T(opened.before === 'docked', 'should have been docked before opening: ' + opened.before);
  T(opened.on === 'summon', 'clicking the mark did not summon: ' + opened.on);
  T(opened.after === 'idle', 'summon should hand over to idle, got ' + opened.after);

  /* ---- 8b. the full round trip, no state skipped (acceptance 4) ----------- */
  /* SUMMON IS NOT IN THIS SEQUENCE, and that is correct rather than a gap. Asking
     straight from the resting composer runs finnOpen() and finnRun() in ONE
     synchronous task, so summon is set and replaced by thinking inside the same
     frame — it never paints. Which is the right behaviour: Finn appeared and got
     immediately to work, and the surface has its own entrance. 8a above is where
     summon is actually asserted, on its own trigger. */
  await page.evaluate(() => { finnSkip(); finnClose(); FN.chat = null; });
  await wait(900);
  const seen = await page.evaluate(async () => {
    const el = document.getElementById('finn');
    const STATES = ['docked','alert','summon','idle','listening','thinking','speaking','settle'];
    const log = [];
    const at = () => STATES.find(x => el.classList.contains(x));
    /* Recorded synchronously, before any interaction. The interval's first tick is
       25ms away, and focus + input are synchronous, so `docked` would otherwise never
       appear in the log and the trip would look as though it started mid-flight. */
    log.push(at());
    const tick = setInterval(() => {
      const s = at();
      if(s && log[log.length - 1] !== s) log.push(s);
    }, 25);
    const nap = ms => new Promise(r => setTimeout(r, ms));

    const ask = document.getElementById('finn-ask');
    ask.focus();
    /* A real `input` event, so it goes through the listener the product uses. */
    /* The string test-finn.js already proves matches a real question — a free-text
       MISS has no reasoning steps, so it would legitimately skip thinking and this
       check would fail for the wrong reason. */
    ask.value = 'which vendors account for most of our spend';
    ask.dispatchEvent(new Event('input', {bubbles:true}));
    await nap(400);
    finnSend();
    await nap(16000);
    clearInterval(tick);
    return log;
  });
  const order = seen.join(' → ');
  T(seen[0] === 'docked', 'the round trip should start docked: ' + order);
  T(seen.includes('listening'), 'typing did not put Finn in listening: ' + order);
  T(seen.includes('thinking'), 'no thinking state during the request: ' + order);
  T(seen.includes('speaking'), 'no speaking state while the answer streamed: ' + order);
  T(seen.includes('settle'), 'the stream ended without a settle — the full stop was skipped: ' + order);
  T(seen[seen.length - 1] === 'idle', 'the trip should come home to idle, ended on ' + seen[seen.length - 1]);
  T(seen.indexOf('thinking') < seen.indexOf('speaking')
    && seen.indexOf('speaking') < seen.indexOf('settle'), 'states out of order: ' + order);
  note.push('round trip: ' + order);

  /* ---- 9. the auto-returns match the animation lengths ------------------- */
  const autos = await page.evaluate(async () => {
    const el = document.getElementById('finn'), out = {};
    const nap = ms => new Promise(r => setTimeout(r, ms));
    const cur = () => ['docked','alert','summon','idle','listening','thinking','speaking','settle']
      .find(x => el.classList.contains(x));
    /* durations declared in styles.css, read back off the element */
    const dur = s => { el.className = 'finn finn-scope ' + s;
      return getComputedStyle(document.querySelector('#finn .creature')).animationDuration; };
    out.css = {alert:dur('alert'), summon:dur('summon'), settle:dur('settle')};
    finnClose(); await nap(200);
    finnAlert(); out.alertSet = cur(); await nap(1150); out.alertBack = cur();
    finnOpen('greet'); out.summonSet = cur(); await nap(900); out.summonBack = cur();
    finnState('settle'); out.settleSet = cur(); await nap(950); out.settleBack = cur();
    return out;
  });
  T(autos.css.alert === '0.9s' && autos.css.summon === '0.65s' && autos.css.settle === '0.7s',
    'a state animation length changed: ' + JSON.stringify(autos.css));
  T(autos.alertSet === 'alert' && autos.alertBack === 'docked',
    `alert should pulse once and refreeze (${autos.alertSet} → ${autos.alertBack})`);
  T(autos.summonSet === 'summon' && autos.summonBack === 'idle',
    `summon should hand over to idle (${autos.summonSet} → ${autos.summonBack})`);
  T(autos.settleSet === 'settle' && autos.settleBack === 'idle',
    `settle should hand over to idle (${autos.settleSet} → ${autos.settleBack})`);

  /* alert must NOT fire while the conversation is open, and not out of any state
     other than docked — it is docked's exception, not a general-purpose pulse. */
  const guard = await page.evaluate(() => {
    finnOpen('greet'); finnState('idle'); finnAlert();
    const open = document.getElementById('finn').classList.contains('alert');
    finnClose(); finnState('idle'); finnAlert();
    const notDocked = document.getElementById('finn').classList.contains('alert');
    finnClose();
    return {open, notDocked};
  });
  T(!guard.open, 'alert fired while the conversation was open');
  T(!guard.notDocked, 'alert fired out of a state other than docked');

  /* ---- 10. the blink (constraint 7) -------------------------------------- */
  const blink = await page.evaluate(async () => {
    finnClose(); finnOpen('greet'); finnState('idle');
    let saw = 0, len = 0, t0 = 0;
    const t = setInterval(() => {
      const on = document.querySelectorAll('#finn .eyeI.blink').length;
      if(on && !t0){ t0 = Date.now(); saw++; }
      if(!on && t0){ len = Date.now() - t0; t0 = 0; }
    }, 15);
    await new Promise(r => setTimeout(r, 9000));
    clearInterval(t);
    const sy = getComputedStyle(document.querySelector('#finn .eyeI')).transform;
    return {saw, len, sy};
  });
  T(blink.saw >= 1, 'no blink in 9s of idle — the interval tops out at 7.2s');
  T(blink.len > 60 && blink.len < 240, 'the blink should be ~110ms, measured ' + blink.len + 'ms');
  note.push('blinks in 9s of idle: ' + blink.saw + ' (' + blink.len + 'ms)');

  /* suppressed in thinking */
  const noBlink = await page.evaluate(async () => {
    finnState('thinking');
    let saw = 0;
    const t = setInterval(() => { saw += document.querySelectorAll('#finn .eyeI.blink').length ? 1 : 0; }, 15);
    await new Promise(r => setTimeout(r, 8500));
    clearInterval(t);
    return saw;
  });
  T(noBlink === 0, 'the eyes blinked during thinking — constraint 7');

  /* ---- 10b. the byline IS the status: one "Finn", not two ----------------
     *"Currently it is just a repetition. The Finn branding already exists, and each
     in-progress message should appear beside it as a continuation."* So what is
     checked is the WHOLE BYLINE ROW's text: it has to read as one sentence, and the
     word "Finn" may appear in it exactly once. */
  const say = await page.evaluate(async () => {
    finnClose(); FN.chat = null; FN.mode = 'brief';
    const line = () => ((document.querySelector('.finn-say') || {}).textContent || '')
      .replace(/\s+/g, ' ').trim();
    const seen = [];
    const t = setInterval(() => {
      const v = line();
      if(v && seen[seen.length - 1] !== v) seen.push(v);
    }, 40);
    finnAsk('over-budget');
    await new Promise(r => setTimeout(r, 700));
    const st = document.querySelector('.finn-stat-t');
    const early = {dots:!!document.querySelector('.finn-dots'),
                   steps:document.querySelectorAll('.finn-step').length,
                   line:line(),
                   /* inside the byline row, not on a line of its own */
                   inSay:!!document.querySelector('.finn-say .finn-stat-t'),
                   /* the dancing box, at the END of that line */
                   hopLast:(() => { const s = document.querySelector('.finn-stat');
                     return !!s && !!s.lastElementChild
                            && s.lastElementChild.classList.contains('finn-hop'); })(),
                   hopAnim:document.querySelector('.finn-hop')
                     ? getComputedStyle(document.querySelector('.finn-hop')).animationName : '',
                   /* the shimmer must be a swept gradient, not an opacity blink */
                   anim:st ? getComputedStyle(st).animationName : ''};
    await new Promise(r => setTimeout(r, 15500));
    clearInterval(t);
    return {early, seen, still:!!document.querySelector('.finn-stat-t'),
            done:line(), thought:(document.querySelector('.finn-thought') || {}).textContent || ''};
  });
  T(say.early.dots === false, 'the dancing dots are back — they duplicate the mark\'s own motion');
  T(say.early.steps === 0, 'the opening beat should be a beat: no step yet at 700ms');
  T(say.early.line === 'Finn is thinking',
    'the byline should read "Finn is thinking", got "' + say.early.line + '"');
  T(say.early.inSay, 'the status is not inside the byline row — it is a second line again');
  T(say.early.hopLast, 'the dancing box should be the LAST thing on that line');
  T(say.early.hopAnim === 'finn-hop', 'the box is not dancing: ' + say.early.hopAnim);
  T(say.early.anim === 'finn-shim', 'the status text lost its shimmer: ' + say.early.anim);
  T(say.seen.includes('Finn is thinking') && say.seen.includes('Finn is about to answer'),
    'both status phases should appear, saw: ' + say.seen.join(' | '));
  T(say.seen.indexOf('Finn is thinking') < say.seen.indexOf('Finn is about to answer'),
    'status phases out of order: ' + say.seen.join(' | '));
  T(say.seen.every(v => (v.match(/Finn/g) || []).length <= 1),
    'the byline printed "Finn" twice: ' + say.seen.join(' | '));
  T(!say.still && say.done === 'Finn',
    'the status should clear once the answer has landed, byline reads "' + say.done + '"');
  T(/Thought for/.test(say.thought), 'the thought log did not collapse: ' + say.thought);
  note.push('byline: ' + say.seen.join(' → '));

  /* ---- 10b2. what you can do with the answer ------------------------------
     Every control here has to ACT — a row of controls that only look like controls
     is the failure this whole section was added to avoid. */
  const acts = await page.evaluate(async () => {
    const q = s => document.querySelector(s);
    const bar = () => q('.finn-turn:last-of-type .finn-act-r');
    const labels = () => [...document.querySelectorAll('.finn-turn:last-of-type .finn-act')]
      .map(b => (b.textContent || '').trim() || b.getAttribute('aria-label'));
    const out = {present:!!bar(), labels:labels()};

    /* copy — the real clipboard is not readable here, so what is checked is the TEXT
       the button would put on it: plain, no markup, and carrying the answer. */
    const t0 = FN.chat.turns[FN.chat.turns.length - 1];
    const plain = finnPlain(t0);
    out.plain = {len:plain.length, tags:/<[a-z/]/i.test(plain), q:/^Q: /.test(plain),
                 ents:/&(amp|nbsp|lt|gt|#\d+);/.test(plain), sig:/— Finn ·/.test(plain)};

    /* the working — per message, and it must not move the global switch */
    const i = FN.chat.turns.length - 1;
    const modeBefore = FN.mode, workBefore = !!q('.finn-turn:last-of-type .fa-work');
    q(`[data-finn-work="${i}"]`).click();
    await new Promise(r => setTimeout(r, 140));
    out.work = {before:workBefore, after:!!q('.finn-turn:last-of-type .fa-work'),
                globalUnmoved:FN.mode === modeBefore,
                label:(q(`[data-finn-work="${i}"]`).textContent || '').trim()};
    q(`[data-finn-work="${i}"]`).click();          /* and back */
    await new Promise(r => setTimeout(r, 140));
    out.work.toggledBack = !q('.finn-turn:last-of-type .fa-work');

    /* like, then un-like */
    q(`[data-finn-vote="up:${i}"]`).click();
    await new Promise(r => setTimeout(r, 120));
    out.up = {stored:FN.chat.turns[i].vote,
              lit:q(`[data-finn-vote="up:${i}"]`).classList.contains('on'),
              pressed:q(`[data-finn-vote="up:${i}"]`).getAttribute('aria-pressed')};
    q(`[data-finn-vote="up:${i}"]`).click();
    await new Promise(r => setTimeout(r, 120));
    out.undo = FN.chat.turns[i].vote;

    /* unlike — and it must ASK why, then acknowledge with something specific */
    q(`[data-finn-vote="down:${i}"]`).click();
    await new Promise(r => setTimeout(r, 160));
    out.down = {stored:FN.chat.turns[i].vote, asks:document.querySelectorAll('.finn-why button').length};
    if(out.down.asks){
      document.querySelectorAll('.finn-why button')[1].click();
      await new Promise(r => setTimeout(r, 160));
    }
    out.ack = {why:FN.chat.turns[i].why, text:(q('.finn-ack') || {}).textContent || '',
               gone:!q('.finn-why')};

    /* it survives a re-render, and it survives being reopened from history */
    finnRender();
    await new Promise(r => setTimeout(r, 160));
    out.rerender = {lit:!!q(`[data-finn-vote="down:${i}"]`)
                       && q(`[data-finn-vote="down:${i}"]`).classList.contains('on'),
                    ack:!!q('.finn-ack')};
    finnCommit();
    out.persisted = (FN.chats[0].turns[i] || {}).vote;
    return out;
  });
  T(acts.present, 'no action bar under the answer');
  T(acts.labels.length === 4, 'expected 4 actions, got ' + JSON.stringify(acts.labels));
  T(acts.plain.len > 200 && acts.plain.q && acts.plain.sig,
    'the copy text is not a usable plain-text answer: ' + JSON.stringify(acts.plain));
  T(!acts.plain.tags && !acts.plain.ents,
    'the copy text still carries markup or entities — it would paste as HTML soup');
  T(!acts.work.before && acts.work.after,
    'Show the working did not expand the derivation: ' + JSON.stringify(acts.work));
  T(acts.work.globalUnmoved, 'the per-message working moved the GLOBAL Brief/Full switch');
  T(/Hide the working/.test(acts.work.label), 'the button did not become its own opposite');
  T(acts.work.toggledBack, 'the working would not collapse again');
  T(acts.up.stored === 'up' && acts.up.lit && acts.up.pressed === 'true',
    'liking an answer did not register: ' + JSON.stringify(acts.up));
  T(acts.undo === '', 'a like could not be taken back, vote is now "' + acts.undo + '"');
  T(acts.down.stored === 'down', 'unliking an answer did not register');
  T(acts.down.asks === 3, 'a downvote should ask why, with 3 real reasons, got ' + acts.down.asks);
  T(acts.ack.why === 'The figures look wrong' && acts.ack.gone,
    'the reason was not recorded: ' + JSON.stringify(acts.ack));
  T(/figures look wrong/i.test(acts.ack.text) && acts.ack.text.length > 60,
    'the acknowledgement is generic — it should say what it does about THAT reason');
  T(acts.rerender.lit && acts.rerender.ack, 'the verdict was lost on re-render');
  T(acts.persisted === 'down', 'the verdict was not persisted with the chat');
  note.push('actions: ' + acts.labels.join(' · '));

  /* ---- 10c. the mark is big enough for its own motion to read ------------- */
  const big = await page.evaluate(v => {
    const one = s => { const e = document.querySelector(s);
      if(!e) return 0; const r = e.getBoundingClientRect(); return Math.round(r.width); };
    return {bar:one(v + '.finn-mark'), orb:one('.finn-orb .finn-mark'),
            say:one('.finn-say-o .finn-mark'),
            /* the byline gutter must follow the tile, or the answer unindents */
            tile:one('.finn-say-o'),
            pad:parseInt(getComputedStyle(document.querySelector('.finn-a')).paddingLeft, 10)};
  }, V);
  T(big.bar >= 28 && big.orb >= 28 && big.say >= 28,
    'a mark is too small for its motion to read: ' + JSON.stringify(big));
  T(Math.abs(big.pad - (big.tile + 8)) <= 1,
    `the answer indent (${big.pad}) should be the byline tile (${big.tile}) plus the 8px gap`);
  note.push(`marks: composer ${big.bar}px · header ${big.orb}px · byline ${big.say}px, indent ${big.pad}px`);

  /* ---- 10d. dictation: a REAL meter, and nothing typed until you stop ------
     The point of this section is the word "real". A CSS keyframe would look the
     same and would be the one dishonest control in the product, so what is checked
     is that the bars FOLLOW the signal: driven from a synthetic audio device, they
     must take differing heights across the spectrum and must go back to nothing
     when the stream is torn down. */
  await page.evaluate(() => { finnSkip(); finnClose(); });
  await wait(600);
  const wave = await page.evaluate(async () => {
    const wrap = document.getElementById('finn-wave');
    const bars = [...wrap.querySelectorAll('i')];
    const before = getComputedStyle(wrap).display;
    document.documentElement.setAttribute('data-finn-mic', '');
    const shown = {wave:getComputedStyle(wrap).display,
                   ph:getComputedStyle(document.getElementById('finn-ph')).display};
    /* `want` is what the mic click sets, and finnMeterStart() correctly throws the
       stream away without it — the permission prompt is async, and the click that
       opened the microphone may have closed it again by the time it resolves. */
    FINN_MIC.want = true;
    finnMeterStart();
    await new Promise(r => setTimeout(r, 1400));
    /* Sampled over time as well as across the bars: a peak that only ever appears in
       one frame is still a peak the analyser found. */
    const scales = [];
    let driven = 0;
    for(let k = 0; k < 24; k++){
      driven = Math.max(driven, bars.filter(b => b.style.transform).length);
      bars.forEach(b => { const m = /scaleY\(([\d.]+)\)/.exec(b.style.transform || '');
        if(m) scales.push(+m[1]); });
      await new Promise(r => requestAnimationFrame(r));
    }
    FINN_MIC.want = false;
    finnMeterStop();
    document.documentElement.removeAttribute('data-finn-mic');
    await new Promise(r => setTimeout(r, 120));
    return {before, shown, n:bars.length, driven,
            samples:scales.length, distinct:new Set(scales.map(x => x.toFixed(3))).size,
            max:scales.length ? Math.max(...scales) : 0,
            cleared:bars.every(b => !b.style.transform),
            stream:!!FINN_MIC.stream, ac:!!FINN_MIC.ac, raf:FINN_MIC.raf};
  });
  T(wave.before === 'none', 'the waveform should be hidden when the mic is not live');
  T(wave.shown.wave === 'flex', 'data-finn-mic did not reveal the waveform');
  T(wave.shown.ph === 'none', 'the cycling placeholder must give way to the waveform');
  T(wave.driven === wave.n, `only ${wave.driven} of ${wave.n} bars are being driven`);
  T(wave.distinct > 4,
    `the bars are not following the signal — ${wave.distinct} distinct height(s) over ` +
    `${wave.samples} samples, which is what a CSS keyframe would look like`);
  T(wave.max > 0.25, 'the meter read near-silence from a real tone, peak ' + wave.max);
  T(wave.cleared, 'the bars did not reset when the meter stopped');
  T(!wave.stream && !wave.ac && !wave.raf,
    'the meter leaked: ' + JSON.stringify({stream:wave.stream, ac:wave.ac, raf:wave.raf}));
  note.push(`meter: ${wave.n} bars, ${wave.distinct} distinct heights, peak ${wave.max}`);

  /* The click path. `webkitSpeechRecognition` exists in headless Chrome and
     `start()` succeeds locally before failing on the network, so the setup is
     observable synchronously even though no transcript can ever arrive here. */
  const mic = await page.evaluate(() => {
    const btn = document.querySelector('.finn-mic');
    if(!btn || btn.hidden) return {absent:true};
    btn.click();
    return {absent:false, live:btn.classList.contains('live'),
            attr:document.documentElement.hasAttribute('data-finn-mic'),
            state:['docked','alert','summon','idle','listening','thinking','speaking','settle']
                    .find(x => document.getElementById('finn').classList.contains(x)),
            label:btn.getAttribute('aria-label'),
            box:document.getElementById('finn-ask').value};
  });
  if(mic.absent) note.push('mic button absent in this browser — dictation path not exercised');
  else {
    T(mic.live, 'the mic button should show it is recording');
    T(mic.attr, 'clicking the mic did not put the composer into its listening state');
    T(mic.state === 'listening', 'dictating should make Finn lean in, state was ' + mic.state);
    T(/[Ss]top/.test(mic.label || ''), 'the live mic should say it stops, not that it starts');
    T(mic.box === '', 'nothing may be written to the box before the reader has finished speaking');
  }
  await page.evaluate(() => {
    /* leave it as it was found, whatever the recognition service decided to do */
    finnMeterStop(); document.documentElement.removeAttribute('data-finn-mic');
  });
  await wait(400);

  /* Config that cannot be exercised without a live speech service, asserted at the
     source instead — labelled as such rather than dressed up as a runtime check. */
  const src = fs.readFileSync(ROOT + '/finoptic/assistant.js', 'utf8');
  T(/rec\.interimResults\s*=\s*false/.test(src),
    'SOURCE: interimResults must be false — the transcript arrives only once speech ends');
  T(/rec\.continuous\s*=\s*false/.test(src), 'SOURCE: continuous must stay false');
  T(/rec\.onspeechend\s*=/.test(src),
    'SOURCE: no onspeechend — the meter has to stop when the reader does');
  T(/getByteFrequencyData/.test(src),
    'SOURCE: the waveform must be driven by an AnalyserNode, never by a keyframe');

  /* CONSTRAINT 8, from the other side: closing must refreeze, not leave a state
     running behind a closed conversation. */
  const closed = await page.evaluate(async () => {
    finnOpen('greet'); finnState('idle');
    await new Promise(r => setTimeout(r, 200));
    finnClose();
    await new Promise(r => setTimeout(r, 300));
    const el = document.getElementById('finn');
    return {state:['docked','alert','summon','idle','listening','thinking','speaking','settle']
              .find(x => el.classList.contains(x)),
            anim:[...document.querySelectorAll('#finn .finn-mark .creature')]
              .map(e => getComputedStyle(e).animationName)};
  });
  T(closed.state === 'docked', 'closing did not refreeze: ' + closed.state);
  T(closed.anim.every(a => a === 'none'), 'still animating after close: ' + closed.anim.join(','));

  T(errs.length === 0, 'console/page errors: ' + errs.slice(0, 3).join(' | '));
  await page.close();

  /* ---- 11. reduced motion, and ?nofx (constraint 9) ---------------------- */
  const rm = await browser.newPage();
  await rm.setViewport({width:1440, height:940});
  await rm.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}]);
  await rm.goto(URL, {waitUntil:'load'});
  await wait(900);
  await rm.evaluate(() => go('overview'));
  await wait(700);
  const still = await rm.evaluate(v => {
    /* force every state on in turn; none of them may animate anything */
    const el = document.getElementById('finn'), bad = [];
    ['idle','listening','thinking','speaking','settle','alert','summon'].forEach(s => {
      el.className = 'finn finn-scope ' + s;
      document.querySelectorAll('#finn .finn-mark *').forEach(e => {
        const cs = getComputedStyle(e);
        if(cs.animationName !== 'none') bad.push(s + ':' + cs.animationName);
        if(cs.transitionDuration !== '0s') bad.push(s + ':transition ' + cs.transitionDuration);
      });
    });
    const r = document.querySelector(v + '.finn-mark').getBoundingClientRect();
    return {bad:[...new Set(bad)], w:Math.round(r.width), h:Math.round(r.height)};
  }, V);
  T(still.bad.length === 0, 'reduce-motion still animates: ' + still.bad.slice(0, 4).join(', '));
  T(still.w > 8 && still.h > 8, 'the mark does not render under reduce-motion');

  /* The progress line and the action bar are OUTSIDE the mark, so `.finn-mark *` does
     not reach them and they need checking separately.

     Under reduce-motion there is NO progress to narrate: FINN_STILL makes the answer
     paint at once, so no thinking log and no status line are ever built. That is the
     product being right, not a gap — the status exists to say what is happening during
     a wait there no longer is. So this forces one onto the page anyway and checks the
     safety net, because the failure mode is severe and silent: with its sweep frozen,
     `background-clip:text` leaves the letters clipped to a transparent fill and the
     sentence is not two-tone, it is GONE. */
  const rmUI = await rm.evaluate(async () => {
    finnOpen('greet'); FN.chat = null; FN.mode = 'brief';
    finnAsk('over-budget');
    await new Promise(r => setTimeout(r, 500));
    const instant = {stat:!!document.querySelector('.finn-stat-t'),
                     steps:document.querySelectorAll('.finn-step').length,
                     landed:(document.querySelector('.finn-a') || {}).textContent.length || 0,
                     bars:[...document.querySelectorAll('.finn-act-r')]
                            .map(e => +getComputedStyle(e).opacity)};
    finnSay(FN.chat.turns.length - 1, 'is thinking');
    await new Promise(r => setTimeout(r, 60));
    const t = document.querySelector('.finn-stat-t'), h = document.querySelector('.finn-hop');
    const cs = t && getComputedStyle(t);
    return {instant, text:t ? t.textContent : '', anim:cs ? cs.animationName : '',
            fill:cs ? (cs.webkitTextFillColor || cs.color) : '',
            hop:h ? getComputedStyle(h).animationName : ''};
  });
  T(!rmUI.instant.stat && rmUI.instant.steps === 0 && rmUI.instant.landed > 100,
    'reduce-motion should land the answer at once, with nothing to narrate: '
      + JSON.stringify(rmUI.instant));
  T(rmUI.instant.bars.every(o => o === 1),
    'an action bar is stranded mid-fade under reduce-motion: ' + JSON.stringify(rmUI.instant.bars));
  T(rmUI.text === 'is thinking', 'the status line could not be built at all');
  T(rmUI.anim === 'none' && rmUI.hop === 'none',
    'the status shimmer / dancing box still animate under reduce-motion');
  T(!/transparent|rgba\(0, 0, 0, 0\)/.test(rmUI.fill),
    'the status text keeps a transparent fill with its sweep frozen — it would be INVISIBLE: '
      + rmUI.fill);
  await rm.close();

  const nofx = await browser.newPage();
  await nofx.setViewport({width:1440, height:940});
  await nofx.goto(URL + '?nofx', {waitUntil:'load'});
  await wait(700);
  const nf = await nofx.evaluate(async () => {
    go('overview');
    await new Promise(r => setTimeout(r, 500));
    finnOpen('greet');
    finnState('thinking');
    return [...document.getElementById('finn').classList].join(' ');
  });
  T(/docked/.test(nf) && !/thinking/.test(nf), '?nofx should pin the mark docked, got "' + nf + '"');
  await nofx.close();

  await browser.close();
  console.log('\n' + '='.repeat(66));
  note.forEach(n => console.log('  · ' + n));
  if(fail.length){
    console.log('FAILURES (' + fail.length + ')');
    fail.forEach(f => console.log('  x ' + f));
    process.exitCode = 1;
  } else console.log('PASS — mark byte-identical, 8 states, 9 constraints, round trip clean');
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
