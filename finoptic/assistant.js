/* =============================================================================
   Finn — the assistant. Behaviour.
   Markup: index.html (static) · Look: styles.css §12 · Answers: assistant-content.js

   CENTRED, NOT CORNERED. This file replaces a bottom-right pod-and-panel, and the
   three faults that version had are the three things it is built around:

   1. EVERYTHING WAS IN A 420px QUADRANT. A conversation, a chart and a table all
      competed for one narrow column. Now: the resting state is a composer in the
      middle of the bottom edge, and asking opens a surface at ~82% of the
      viewport, with the thread capped to a reading measure inside it. Plots are
      INLINE, each on its own tinted panel. A Claude-style artifact pane was built
      here first and taken back out: splitting the sentence from the chart it is
      about makes the reader look in two places for one answer.
   2. IT OPENED ON A MENU. Twenty-four questions in four accordions is a form, not
      a colleague — "that is never the use case". Finn now opens by saying
      something it already knows about this workspace, and offers THREE suggestions
      that rise out of the composer's own top edge. The full catalogue is one link
      away, for a presenter who needs to find a question fast.
   3. THINKING DIDN'T READ AS THINKING. One line swapping text on a timer is a
      spinner with words. Steps now ACCUMULATE — three dots first, then each step
      lands under the last and streams its own text, the live one pulsing and the
      settled ones ticked — and the reasoning shown is the SAME reasoning Full mode
      prints as its working, so it cannot be theatre.

   BRIEF AND FULL ARE ABOUT THE ANSWER, NOT THE WINDOW. The old toggle resized the
   panel, which nobody asked for. Brief gives the answer; Full adds `How I worked
   this out` — the numbered derivation, with the real arithmetic. Nothing resizes.

   FINN HAS A FACE. The mark is no longer two of the parent logo's blades — it is a
   creature (finn-logo.js), and it runs an EIGHT-STATE motion system wired to this
   file's real lifecycle rather than to a timer: see the MOTION section below. The
   rule that section exists to enforce is that the mark can never disagree with what
   Finn is actually doing.

   STILL TRUE, and each is a rule rather than a preference: the accent budget is
   ONE and it is the send button; no message may say this is a mock-up (7.17), so
   a question outside the data gets an admitted miss and three real alternatives;
   the microphone is real dictation or absent; and every answer names the feeds it
   read.
   ========================================================================== */

/* ---- reduced motion -----------------------------------------------------
   The same two switches MOTION honours. Finn's finished state is the whole answer
   on screen — the dots, the steps and the streaming are decoration over it and
   never the only route to it (§9.1). */
const FINN_STILL = /[?&]nofx\b/.test(location.search)
  || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---- storage ------------------------------------------------------------
   Wrapped exactly as shell.js wraps the palette: some browsers refuse
   localStorage on a file:// origin, and a demo must not die on that. A refusal
   means history is session-only, which nobody watching will notice. */
const FINN_KEY = 'finoptic-finn-chats';
const FINN_MAX_CHATS = 12;
const finnStore = {
  get(){ try{ return JSON.parse(localStorage.getItem(FINN_KEY) || '[]'); }catch(e){ return []; } },
  set(v){ try{ localStorage.setItem(FINN_KEY, JSON.stringify(v)); }catch(e){ /* session only */ } }
};

/* ---- state -------------------------------------------------------------- */
const FN = {
  open:  false,
  full:  false,
  mode:  'brief',        // brief | full — the ANSWER's style, never the window's size
  view:  'greet',        // greet | thread | history | all
  chat:  null,
  chats: [],
  busy:  false,
  stop:  null,
  phTimer: null,
  phIdx: 0
};

/* =============================================================================
   MOTION — Finn's eight states
   Look: the motion block at the foot of styles.css §12. Geometry: finn-logo.js.
   Reference: planning/design-language/finn/finn-motion-v8.html and the guide beside it.

   Finn has a face now — two eyes, an orange hub, four limbs — and a face that never
   moves is a mask. ONE state is live at a time, as a class on `#finn` (which carries
   `finn-scope`), so every instance of the mark inside it — the surface header, each
   answer's byline, the composer — animates in lockstep off a single class swap.
   Nothing holds per-instance state, and that is the whole reason the scope sits on
   the container rather than on each mark.

   WHAT DRIVES WHAT. The rule this table exists to enforce is that the mark can never
   disagree with what Finn is actually doing — no state is decorative, and none is
   fired on a timer that is not the real one:

     docked      the conversation is closed. FROZEN, blink included.
     alert       finnAlert(), when a workspace with open alerts is loaded while
                 Finn is closed. Docked's one exception; refreezes itself.
     summon      finnOpen()
     idle        the auto-return out of summon and settle
     listening   an `input` on the composer, with a 1.1s debounce back out
     thinking    finnRun(), from the first of the three dots to the last step
     speaking    finnStream(), while the answer's words are landing
     settle      finnStreamEnd() and finnSkip(). The full stop, and it is never
                 skipped — including when there was no thinking to show at all.

   THE AUTO-RETURNS BELOW MATCH THE ANIMATION LENGTHS IN styles.css §12 exactly.
   They are two halves of one number: change one and you must change the other.

   No dev control ships for exercising these. They are plain globals, so
   `finnState('thinking')` in the console is the whole harness.
   ========================================================================== */
const FINN_STATES = ['docked','alert','summon','idle','listening','thinking','speaking','settle'];
const FINN_AUTO   = {alert:['docked', 950], summon:['idle', 700], settle:['idle', 750]};
const FNM = {state:'docked', auto:null, blink:null, blinkOff:null, typing:null};

function finnState(s){
  /* FINN_STILL covers `?nofx`, which is a query string and therefore invisible to
     CSS; the `prefers-reduced-motion` rule in §12 covers the OS switch on its own.
     Either way the scope keeps the `docked` it shipped in, so the mark still
     renders — it just never moves. */
  if(FINN_STILL || FNM.state === s) return;
  const el = document.getElementById('finn');
  if(!el) return;
  FINN_STATES.forEach(x => el.classList.remove(x));
  el.classList.add(s);
  FNM.state = s;
  clearTimeout(FNM.auto); FNM.auto = null;
  const a = FINN_AUTO[s];
  /* Guarded on still BEING in the state that set the timer. Asking from the resting
     composer runs summon → thinking inside 700ms, and unguarded, summon's own
     auto-return would then drop Finn to idle in the middle of thinking. */
  if(a) FNM.auto = setTimeout(() => { if(FNM.state === s) finnState(a[0]); }, a[1]);
}

/* THE BLINK. Randomised 3.8–7.2s so it never reads as a metronome, 110ms long, and
   suppressed in two states: `docked`, where stillness is the rule, and `thinking`,
   where the eyes already have their own dip and a blink on top of it reads as a
   twitch. One chain for the whole scope, started once — a mark that did not exist
   when the chain started still blinks with the rest, because the eyes are looked up
   at blink time rather than held. */
function finnBlink(){
  if(FINN_STILL) return;
  FNM.blink = setTimeout(() => {
    if(FNM.state !== 'docked' && FNM.state !== 'thinking'){
      const eyes = document.querySelectorAll('#finn .eyeI');
      eyes.forEach(e => e.classList.add('blink'));
      FNM.blinkOff = setTimeout(() =>
        eyes.forEach(e => e.classList.remove('blink')), 110);
    }
    finnBlink();
  }, 3800 + Math.random() * 3400);
}
/* Nothing unmounts in a single-page mock-up, so nothing calls this today. It exists
   so both timers have one owner, and so a port of this file into a framework has an
   unmount hook to call rather than needing one invented. */
function finnBlinkStop(){
  clearTimeout(FNM.blink); clearTimeout(FNM.blinkOff);
  FNM.blink = FNM.blinkOff = null;
}

/* Typing at Finn. Allowed out of `docked` as well as `idle`, because the composer is
   live while the conversation is closed and someone typing into it is precisely the
   moment to lean in. NOT allowed out of thinking or speaking, where it would
   interrupt work already in flight. It returns to whichever resting state is true —
   idle if the conversation is open, docked if it is not. */
function finnTyping(){
  if(FINN_STILL) return;
  if(FNM.state !== 'docked' && FNM.state !== 'idle' && FNM.state !== 'listening') return;
  finnState('listening');
  clearTimeout(FNM.typing);
  FNM.typing = setTimeout(() => {
    if(FNM.state === 'listening') finnState(FN.open ? 'idle' : 'docked');
  }, 1100);
}

/* DOCKED'S ONE EXCEPTION: one pulse, once, and it refreezes itself. A tap on the
   shoulder rather than a badge — it says nothing, so it cannot claim something that
   did not happen (7.17). Called from shell.js on a dataset switch, which is the one
   moment in the mock-up when a workspace's open alerts genuinely become new. */
function finnAlert(){
  if(FN.open || FNM.state !== 'docked') return;
  finnState('alert');
}

/* =============================================================================
   ORIGIN — the screen a question was asked from
   ========================================================================== */

/* The same expression exportView() uses for its CSV scope line, so the scope Finn
   records against a question and the scope a CSV of that screen reports are the
   same string. */
function finnScope(){
  try{
    return liveFilters().map(d => DIMS[d].label + '=' + sel(d).join('/'))
      .concat([F.period === CUSTOM_PERIOD ? 'Custom · ' + rangeSummary(F.range) : F.period])
      .join(' · ');
  }catch(e){ return ''; }
}

function finnOrigin(){
  const id = (typeof current !== 'undefined') ? current : 'overview';
  return {
    id,
    title:  (typeof TITLES !== 'undefined' && TITLES[id]) || id,
    scope:  finnScope(),
    ds:     (typeof RAW !== 'undefined' && RAW) ? RAW.id : '',
    dsLabel:(typeof RAW !== 'undefined' && RAW) ? RAW.label : ''
  };
}

/* Which category fits the screen you asked from — DERIVED, not mapped. Finn's four
   categories are the four PERSONA lenses under different names.
   The ordering is load-bearing: `overview` appears in FINANCE's focus list, so a
   focus-first lookup opened Finance on the Executive Dashboard — the cold-start
   screen — and every demo would have started on the wrong category. The lens the
   reader actually chose outranks membership in a list. */
const FINN_PERSONA_CAT = {itfm:'itfm', finance:'finance', proc:'proc', biz:'product'};
function finnCatFor(screenId){
  if(typeof PERSONA === 'undefined') return null;
  const home = Object.keys(PERSONA).find(k => PERSONA[k].home === screenId);
  if(home) return FINN_PERSONA_CAT[home];
  if(typeof persona !== 'undefined' && FINN_PERSONA_CAT[persona]) return FINN_PERSONA_CAT[persona];
  const foc = Object.keys(PERSONA).find(k => (PERSONA[k].focus || []).includes(screenId));
  return foc ? FINN_PERSONA_CAT[foc] : null;
}
const finnCat = id => FINN_CATS.find(c => c.id === id) || FINN_CATS[0];

/* =============================================================================
   BLOCKS — one renderer, and plots are part of the conversation
   Everything an answer can contain is below, and nothing else is. Charts and
   tables render inline on a tinted panel rather than in a side pane; see the
   note on the chart case for why the pane came back out.
   ========================================================================== */
function finnBlock(b){
  switch(b.t){
    case 'h':   return `<h3 class="fa-h">${b.v}</h3>`;
    case 'p':   return `<p class="fa-p">${b.v}</p>`;
    case 'sh':  return `<h4 class="fa-sh">${b.v}</h4>`;
    case 'fig': return `<div class="fa-fig"><span class="fa-fig-k">${b.k}</span>`
                     + `<span class="fa-fig-v">${b.v}</span>`
                     + `${b.foot ? `<span class="fa-fig-f">${b.foot}</span>` : ''}</div>`;
    case 'bul': return `<ul class="fa-bul">${b.v.map(x => `<li>${x}</li>`).join('')}</ul>`;
    /* The step text is wrapped in ONE span on purpose. `.fa-work li` is a flex row
       (number badge, then text), and a flex container BLOCKIFIES every inline child
       into its own flex item — so each <b> round a figure became an item and the
       row's 11px gap opened up on both sides of every bold word. Two children, one
       gap. */
    case 'work':return `<h4 class="fa-sh">How I Worked This Out</h4>`
                     + `<div class="fa-work"><ol>${
                         b.v.map(x => `<li><span>${x}</span></li>`).join('')}</ol></div>`;
    case 'do':  return `<div class="fa-do"><p class="fa-do-h">`
                     + `<span class="fa-do-v">${b.v}</span>`
                     + `<span class="fa-do-l">${b.lab}</span></p>`
                     + `<p class="fa-p">${b.p}</p></div>`;
    case 'note':return `<p class="fa-note">${b.v}</p>`;
    case 'srcs':return b.v && b.v.length
                     ? `<div class="fa-srcs"><span class="fa-srcs-l">Read from</span>`
                       + b.v.map(s => `<span class="fa-src">${s}</span>`).join('') + `</div>`
                     : '';
    /* A plot is drawn INLINE, on its own tinted panel with a titled header.
       A Claude-style side pane was built for these and taken back out: splitting the
       sentence from the chart it is about makes the reader look in two places for
       one answer. The panel is what keeps a plot reading as a distinct object. */
    case 'chart': case 'table':
      return `<figure class="fa-plot">
        <figcaption class="fa-plot-h"><b>${b.title || (b.t === 'table' ? 'Table' : 'Chart')}</b>
          ${b.sub ? `<span>${b.sub}</span>` : ''}</figcaption>
        <div class="fa-plot-b">${b.t === 'table'
          ? `<div class="tbl-wrap">${table(b.cols, b.rows)}</div>` : b.v}</div></figure>`;
  }
  return '';
}

const finnRenderBlocks = blocks => blocks.map(finnBlock).join('');

/* An answer, safely. A derive() reads a dozen fields off D, and one bad dataset
   should cost its own answer rather than the whole surface — the same reasoning
   bandChart() guards `closed < 1` with. */
function finnAnswer(q, mode){
  try{
    return {blocks:q.ans(mode) || []};
  }catch(err){
    console.error('Finn: ' + q.id + ' failed to derive', err);
    return {blocks:[{t:'p', v:'I could not put that answer together from the data that is '
      + 'connected. Nothing is wrong with your question — try another one, or ask me again '
      + 'once the feed has landed.'}]};
  }
}

/* =============================================================================
   VIEWS
   ========================================================================== */

/* ---- the greeting -------------------------------------------------------
   It says something it already knows. That is the whole difference between this
   and the menu it replaces: a colleague who has read the numbers opens with the
   headline, not with a list of what you are allowed to ask. Derived, so it
   re-narrates per dataset and is never wrong about the workspace. */
function finnOpener(){
  const n = (typeof closedCount === 'function') ? closedCount() : 0;
  const co = (D.meta && D.meta.company) || 'this workspace';
  if(!n) return `I have <b>${co}</b> set up, but no month has closed yet — so there is `
    + `nothing measured for me to read. Ask me anything and I will tell you what it needs.`;
  const v = D.ytdActual - D.ytdBudget;
  const cat = [...(D.categories || [])].sort((a, b) => b.v - a.v)[0];
  return `I have been through <b>${co}</b>'s <b>${n}</b> closed `
    + `${n === 1 ? 'month' : 'months'}. Spend is <b>${money(D.ytdActual)}</b>`
    + (D.ytdBudget ? `, <b>${pct(Math.abs(v / D.ytdBudget * 100))}</b> `
        + `${v > 0 ? 'over' : 'under'} plan` : '')
    + (cat ? `, and <b>${cat.k}</b> is the biggest line at <b>${moneyK(cat.v)}</b>` : '')
    + `. What do you want to look at?`;
}

function finnGreetHTML(){
  const o = finnOrigin();
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `
  <div class="finn-greet">
    <p class="finn-hi">${tod}, Lohith.</p>
    <p class="finn-lede">${finnOpener()}</p>
    <p class="finn-from">You asked from <b>${o.title}</b>${o.scope ? ` · ${o.scope}` : ''}
      · <b>${o.dsLabel}</b></p>
  </div>
  <div class="finn-next">
    <p class="finn-next-l">Try one of these</p>
    ${finnSuggestions(3).map(q =>
      `<button class="finn-chip" type="button" data-finn-ask="${q.id}">${q.q}</button>`).join('')}
    <div style="width:100%; margin-top:8px">
      <button class="btn sm ghost" type="button" data-finn-act="all">Browse all 24 questions</button>
    </div>
  </div>`;
}

/* The full catalogue — kept, demoted. A presenter needs to find a question fast;
   it is just not how anyone starts a conversation. Category headers carry the only
   glyphs, exactly as the sidebar's group headers do (§8). */
function finnAllHTML(){
  return `<p class="finn-sect">Everything I can answer</p>
    <div class="finn-all">
      ${FINN_CATS.map(c => `
        <div>
          <h4 class="finn-cat-h2">${icon(c.ic, false)}${c.k}<span>${c.blurb}</span></h4>
          <div class="finn-qs">
            ${c.qs.map(q => `<button class="finn-q" type="button" data-finn-ask="${q.id}">${q.q}</button>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

/* ---- one turn -----------------------------------------------------------
   THE BYLINE IS THE STATUS LINE. It used to be `Finn` on one row and then
   `Finn is thinking` on the next: *"Currently it is just a repetition. The Finn
   branding already exists, and each in-progress message should appear beside it
   as a continuation."* So the name is stated once and the progress runs on from
   it — `Finn is thinking`, one line, reading as a sentence rather than as a label
   followed by a caption. The dancing box sits at the end of that line, which is
   where it was asked for, and it is the only thing in here that repeats.

   Then the ACTION BAR under each answer, which was missing entirely. Copy, the
   working, and a verdict. Every one of them does something real — a chatbot is the
   easiest place in a product to build a row of controls that only look like
   controls, and §0.7 forbids exactly that. */
function finnTurnHTML(t, i){
  const o = t.origin;
  return `<article class="finn-turn" data-finn-turn="${i}">
    <div class="finn-ctx">
      <span class="finn-ctx-s">${o.title}</span>
      ${o.scope ? `<span class="finn-ctx-f">${o.scope}</span>` : ''}
      <span class="finn-ctx-d">${o.dsLabel}</span>
    </div>
    <div class="finn-u-w">
      <div class="finn-u">${t.q}</div>
      <button class="finn-u-c tip tip-up" type="button" data-finn-copy="q${i}"
              data-tip="Copy" aria-label="Copy your question">${icon('copy', true)}</button>
    </div>
    <div class="finn-say">
      <span class="finn-say-o">${FINN_MARK}</span><b>Finn</b>
      <span class="finn-stat" data-finn-stat="${i}" role="status" aria-live="polite"></span>
    </div>
    <div class="finn-think" data-finn-think="${i}"></div>
    <div class="finn-a" data-finn-a="${i}"></div>
    <div class="finn-acts" data-finn-acts="${i}"></div>
  </article>`;
}

function finnThreadHTML(){
  const c = FN.chat;
  if(!c || !c.turns.length) return finnGreetHTML();
  return `${c.stale ? `<p class="finn-stale">This chat was asked on <b>${c.origin.dsLabel}</b>.
      You are now on <b>${RAW.label}</b>, so the figures below have been re-read from the
      dataset you are on.</p>` : ''}
    ${c.turns.map(finnTurnHTML).join('')}
    <div class="finn-next" id="finn-next"></div>`;
}

/* ---- history ------------------------------------------------------------ */
function finnResLine(res){
  if(!res) return `<p class="finn-hist-r none">No action came out of this chat.</p>`;
  if(res.v) return `<p class="finn-hist-r"><span class="v">${res.v}</span>
    <span class="l">${res.lab}</span></p>`;
  return `<p class="finn-hist-r"><span class="h">${res.h}</span></p>`;
}
function finnAgo(ms){
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if(s < 60) return 'just now';
  const m = Math.round(s / 60); if(m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
  const h = Math.round(m / 60); if(h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
  const d = Math.round(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
}
function finnHistoryHTML(){
  if(!FN.chats.length)
    return `<div class="finn-greet"><p class="finn-hi">No earlier chats.</p>
      <p class="finn-lede">Everything you ask is kept here, with what you decided pinned to
      the top of each one.</p></div>`;
  return `<p class="finn-sect">Earlier chats</p>
    <div class="finn-hist">
      ${FN.chats.map((c, i) => `
        <div class="finn-hist-c">
          ${finnResLine(c.res)}
          <p class="finn-hist-q">${c.turns[0] ? c.turns[0].q : 'Empty chat'}</p>
          <p class="finn-hist-m">${c.turns.length} ${c.turns.length === 1 ? 'question' : 'questions'}
            · from <b>${c.origin.title}</b> · ${finnAgo(c.at)}</p>
          <button class="btn sm ghost" type="button" data-finn-open="${i}">View the complete chat</button>
        </div>`).join('')}
    </div>`;
}

/* =============================================================================
   RENDER
   ========================================================================== */
function finnRender(){
  const body = document.getElementById('finn-body');
  if(!body) return;
  body.innerHTML = FN.view === 'history' ? finnHistoryHTML()
                 : FN.view === 'all'     ? finnAllHTML()
                 : FN.view === 'thread'  ? finnThreadHTML()
                 : finnGreetHTML();

  if(FN.view === 'thread' && FN.chat){
    FN.chat.turns.forEach((t, i) => { if(t.painted) finnPaintDone(i, t); });
    /* Only once the LAST answer has actually landed. finnRender() runs before the
       thinking log starts, so painting these unconditionally offered three
       follow-up questions while Finn was still working out the first one. */
    const last = FN.chat.turns[FN.chat.turns.length - 1];
    if(last && last.painted) finnFollowups();
    body.scrollTop = body.scrollHeight;
  } else {
    /* The greeting, the catalogue and the history list start at the TOP. Without
       this they inherit the thread's scroll position, so opening history after a
       long answer landed you mid-list with its heading above the fold. */
    body.scrollTop = 0;
  }
  finnSyncMode();
}

function finnPaintDone(i, t){
  const think = document.querySelector(`[data-finn-think="${i}"]`);
  const host  = document.querySelector(`[data-finn-a="${i}"]`);
  finnSay(i, '');
  if(think) think.innerHTML = t.steps && t.steps.length
    ? `<button class="finn-thought" type="button" data-finn-thought="${i}"
        >Thought for ${((t.ms || 1600) / 1000).toFixed(1)}s · ${t.steps.length} steps</button>`
    : '';
  if(host) host.innerHTML = finnRenderBlocks(t.blocks);
  finnPaintActs(i, t);
}

/* =============================================================================
   WHAT YOU CAN DO WITH AN ANSWER
   Four flows, and the reason this section exists is that there were none: the
   answer landed and that was the end of it. *"Other options, such as copying the
   message or additional details, are also missing… liking a message, unliking a
   reply."*

   Every one of them acts. A row of controls that only look like controls is the
   inert-control failure §0.7 names, and an assistant panel is the easiest place in
   a product to build one — a thumbs-up that stores nothing, a Copy that copies the
   markup, a `More` that expands nothing.

     Copy            real plain text of the whole answer, headings, figures, bullets,
                     the working and the feeds — tables as TSV so they paste into a
                     spreadsheet as columns. Two clipboard routes, because the API
                     can be refused on a file:// origin.
     The working     PER-MESSAGE, not the global Brief/Full switch. Somebody wants
                     the derivation for THIS answer without changing how the next
                     six are written.
     Good answer /   a stored verdict, persisted with the chat. Thumbs-down opens
     Needs work      one row asking WHY, with three real reasons — because a
                     downvote that swallows the reason is a control that took your
                     opinion and did nothing with it.
   ========================================================================== */

/* Plain text, and it has to be plain: the reader is pasting this into an email or a
   board pack. Every block type has a text form here — a `fig` keeps its label, the
   working keeps its numbering, and a table becomes tab-separated rows so a
   spreadsheet splits it into columns rather than one long line. */
function finnPlain(t){
  const strip = s => String(s == null ? '' : s)
    .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
    .replace(/[ \t]+/g, ' ').trim();
  const out = [`Q: ${strip(t.q)}`, ''];
  (t.blocks || []).forEach(b => {
    switch(b.t){
      case 'h':   out.push(strip(b.v), ''); break;
      case 'sh':  out.push(strip(b.v)); break;
      case 'p': case 'note': out.push(strip(b.v), ''); break;
      case 'fig': out.push(`${strip(b.k)}: ${strip(b.v)}`
                    + (b.foot ? ` (${strip(b.foot)})` : '')); break;
      case 'bul': (b.v || []).forEach(x => out.push('· ' + strip(x))); out.push(''); break;
      case 'work': out.push('How I worked this out');
                   (b.v || []).forEach((x, k) => out.push(`${k + 1}. ${strip(x)}`));
                   out.push(''); break;
      case 'do':  out.push(`${strip(b.v)} — ${strip(b.lab)}`, strip(b.p), ''); break;
      case 'srcs': if(b.v && b.v.length) out.push('Read from: ' + b.v.map(strip).join(', '));
                   break;
      case 'chart': out.push(`[chart] ${strip(b.title || '')}`
                      + (b.sub ? ` — ${strip(b.sub)}` : '')); break;
      /* Tabs, not spaces. A table pasted as columns is the difference between this
         being useful in a spreadsheet and being a paragraph. */
      case 'table':
        out.push(`${strip(b.title || 'Table')}`);
        out.push((b.cols || []).map(c => strip(c.k || c.label || c)).join('\t'));
        (b.rows || []).forEach(r => out.push(
          (Array.isArray(r) ? r : (r.c || [])).map(strip).join('\t')));
        out.push(''); break;
    }
  });
  out.push(`— Finn · ${strip(t.origin && t.origin.title)} · ${strip(t.origin && t.origin.dsLabel)}`);
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* Two routes and a confession, exactly as shareView() does it — `navigator.clipboard`
   is refused outright on some file:// origins, and a Copy button that silently fails
   is worse than one that tells you it could not. */
function finnCopy(text, btn){
  const ok = () => {
    if(!btn) return;
    btn.classList.add('done');
    const l = btn.querySelector('span');
    const was = l && l.textContent;
    if(l) l.textContent = 'Copied';
    setTimeout(() => { btn.classList.remove('done'); if(l && was) l.textContent = was; }, 1700);
  };
  const no = () => toast('Could not copy',
    'Your browser refused the clipboard on this page. Select the answer and copy it.', 'warn');
  const legacy = () => (typeof legacyCopy === 'function' && legacyCopy(text)) ? ok() : no();
  if(navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(text).then(ok).catch(legacy);
  else legacy();
}

const FINN_WHY = ['Not what I asked', 'The figures look wrong', 'Too much detail'];

function finnActsHTML(i, t){
  const v = t.vote || '';
  /* No working to show on an admitted miss — there was no derivation, and a button
     that expands nothing is the thing this whole section exists not to build. */
  const work = t.qid ? `<button class="finn-act" type="button" data-finn-work="${i}"
        aria-pressed="${t.mode === 'full'}">${icon('worklist', true)}<span>${
        t.mode === 'full' ? 'Hide the working' : 'Show the working'}</span></button>` : '';
  return `<div class="finn-act-r">
      <button class="finn-act" type="button" data-finn-copy="${i}"
        >${icon('copy', true)}<span>Copy</span></button>
      ${work}
      <span class="finn-act-gap"></span>
      <button class="finn-act sq tip tip-up${v === 'up' ? ' on' : ''}" type="button"
        data-finn-vote="up:${i}" aria-pressed="${v === 'up'}"
        data-tip="Good answer" aria-label="Good answer">${icon('thumbup', true)}</button>
      <button class="finn-act sq tip tip-up${v === 'down' ? ' on down' : ''}" type="button"
        data-finn-vote="down:${i}" aria-pressed="${v === 'down'}"
        data-tip="Needs work" aria-label="Needs work">${icon('thumbdown', true)}</button>
    </div>
    ${v === 'down' && !t.why ? `<div class="finn-why">
      <span>What was wrong?</span>
      ${FINN_WHY.map((w, k) => `<button type="button" data-finn-why="${k}:${i}">${w}</button>`).join('')}
    </div>` : ''}
    ${t.why ? `<p class="finn-ack">${icon('check', true)}<span>Noted — <b
      >${t.why.toLowerCase()}</b>. ${t.why === FINN_WHY[1]
        ? `every figure in this answer is read live from the feeds behind the workspace,
           and <b>Show the working</b> names which ones and the arithmetic between them.`
        : t.why === FINN_WHY[2]
          ? `<b>Brief</b> gives the answer on its own — the working stays one click away
             rather than in front of you.`
          : `try one of the questions below, or ask again in your own words; I match on
             what you type rather than guessing.`}</span></p>` : ''}`;
}

function finnPaintActs(i, t){
  const host = document.querySelector(`[data-finn-acts="${i}"]`);
  if(host) host.innerHTML = finnActsHTML(i, t);
}

/* Per-message, and that is the point of it existing beside a global Brief/Full:
   this answer's derivation, without changing how the next six are written. */
function finnTurnWork(i){
  const t = FN.chat && FN.chat.turns[i];
  if(!t || !t.qid) return;
  const m = t.mode === 'full' ? 'brief' : 'full';
  const a = finnAnswer(FINN_Q[t.qid], m);
  t.mode = m; t.blocks = a.blocks;
  const host = document.querySelector(`[data-finn-a="${i}"]`);
  if(host) host.innerHTML = finnRenderBlocks(t.blocks);
  finnPaintActs(i, t);
  finnCommit();
}

function finnVote(i, v){
  const t = FN.chat && FN.chat.turns[i];
  if(!t) return;
  /* Clicking the same verdict again takes it back. A rating you cannot undo is a
     rating people stop giving. */
  t.vote = t.vote === v ? '' : v;
  if(t.vote !== 'down') t.why = '';
  finnPaintActs(i, t);
  finnCommit();
  if(t.vote === 'up') toast('Thanks', 'Marked as a good answer.');
}

function finnWhy(i, k){
  const t = FN.chat && FN.chat.turns[i];
  if(!t) return;
  t.why = FINN_WHY[k] || '';
  finnPaintActs(i, t);
  finnCommit();
}

/* Follow-ups are only ever REAL questions from the catalogue, from the same
   category, not yet asked in this chat. A suggestion that leads nowhere is the
   inert control §0.7 forbids, and a chatbot is the easiest place to build a wall
   of them. */
function finnSuggestions(n, exclude){
  const asked = exclude || (FN.chat ? FN.chat.turns.map(t => t.qid) : []);
  const c = finnCat(FN.lastCat || finnCatFor(finnOrigin().id) || 'itfm');
  const own = c.qs.filter(q => !asked.includes(q.id));
  if(own.length >= n) return own.slice(0, n);
  const rest = FINN_CATS.flatMap(x => x.qs).filter(q => !asked.includes(q.id) && !own.includes(q));
  return own.concat(rest).slice(0, n);
}

function finnFollowups(){
  const host = document.getElementById('finn-next');
  if(!host || !FN.chat) return;
  const more = finnSuggestions(3);
  host.innerHTML = (more.length
      ? `<p class="finn-next-l">Next</p>` + more.map(q =>
          `<button class="finn-chip" type="button" data-finn-ask="${q.id}">${q.q}</button>`).join('')
      : '')
    + `<div style="width:100%; margin-top:8px">
         <button class="btn sm ghost" type="button" data-finn-act="all">All questions</button>
       </div>`;
}

/* =============================================================================
   OPEN / CLOSE / FULL SCREEN
   ========================================================================== */
function finnOpen(view){
  FN.open = true;
  if(view) FN.view = view;
  else if(!FN.chat) FN.view = 'greet';
  document.documentElement.setAttribute('data-finn', FN.full ? 'full' : 'open');
  finnState('summon');
  finnSugg(false);
  finnPhStop();
  finnRender();
  const ask = document.getElementById('finn-ask');
  if(ask && window.innerWidth > 900) ask.focus();
}
function finnClose(){
  finnSkip();
  FN.open = false;
  document.documentElement.removeAttribute('data-finn');
  finnSugg(false);
  finnPhStart();
  /* LAST, so it wins over the `settle` finnSkip() may just have set — closing is
     not a full stop to be animated, it is a return to stillness. */
  finnState('docked');
}
function finnFull(on){
  FN.full = on === undefined ? !FN.full : !!on;
  if(FN.open) document.documentElement.setAttribute('data-finn', FN.full ? 'full' : 'open');
  const b = document.querySelector('[data-finn-act="full"]');
  if(b){
    b.dataset.icon = FN.full ? 'minimise' : 'maximise';
    b.dataset.tip  = FN.full ? 'Exit full screen' : 'Full screen';
    b.setAttribute('aria-label', b.dataset.tip);
    if(typeof fillChrome === 'function') fillChrome(b.parentElement);
  }
}

/* =============================================================================
   THE RESTING COMPOSER — suggestions, and the line that cycles
   ========================================================================== */
/* `data-finn-focus` is what grows the veil. Three states, not two: at rest it only
   has to lift the composer off the board, but once three suggestions have risen out
   of it there is a much taller stack of floating things needing a ground, so the
   veil gets taller and denser for exactly as long as they are up. */
function finnSugg(on){
  const host = document.getElementById('finn-sugg');
  if(!host) return;
  if(!on){
    host.classList.remove('on'); host.innerHTML = '';
    document.documentElement.removeAttribute('data-finn-focus');
    return;
  }
  host.innerHTML = finnSuggestions(3, []).map(q =>
    `<button type="button" data-finn-ask="${q.id}">${q.q}</button>`).join('');
  host.classList.add('on');
  document.documentElement.setAttribute('data-finn-focus', '');
}

/* "By default it just keeps animating." A composer that is already asking you
   something invites a sentence; a logo in a box does not. Cycles only while the
   box is empty and unfocused, and never under reduced motion. */
const FINN_PH_MS = 3400;
function finnPhText(){
  const all = FINN_CATS.flatMap(c => c.qs);
  return all.length ? all[FN.phIdx % all.length].q : 'Ask about your technology spend…';
}
function finnPhStart(){
  const el = document.getElementById('finn-ph');
  if(!el) return;
  el.textContent = FINN_STILL ? 'Ask about your technology spend…' : finnPhText();
  if(FINN_STILL) return;
  finnPhStop();
  FN.phTimer = setInterval(() => {
    const ask = document.getElementById('finn-ask');
    if(FN.open || (ask && (ask.value || '').trim()) || document.activeElement === ask) return;
    FN.phIdx++;
    el.classList.add('swap');
    setTimeout(() => { el.textContent = finnPhText(); }, 190);
    setTimeout(() => el.classList.remove('swap'), 440);
  }, FINN_PH_MS);
}
function finnPhStop(){ if(FN.phTimer){ clearInterval(FN.phTimer); FN.phTimer = null; } }
function finnPhSync(){
  const el = document.getElementById('finn-ph'), ask = document.getElementById('finn-ask');
  if(!el || !ask) return;
  const typing = !!(ask.value || '').trim();
  el.style.display = typing ? 'none' : '';
  if(!typing && (FN.open || document.activeElement === ask))
    el.textContent = 'Ask anything about your technology spend…';
}

/* =============================================================================
   ASKING
   ========================================================================== */
function finnNewChat(){
  FN.chat = {id:'c' + Date.now(), at:Date.now(), origin:finnOrigin(), turns:[], res:null};
  return FN.chat;
}

function finnAsk(qid, typed){
  if(FN.busy) return;
  const q = FINN_Q[qid];
  if(!q){ finnNoMatch(typed); return; }
  FN.lastCat = q.cat.id;
  if(!FN.chat) finnNewChat();
  FN.view = 'thread';
  if(!FN.open) finnOpen('thread');

  const a = finnAnswer(q, FN.mode);
  let steps = [];
  try{ steps = q.work() || []; }catch(e){ steps = []; }
  const turn = {qid, q:q.q, mode:FN.mode, origin:finnOrigin(),
                blocks:a.blocks, steps, ms:0, painted:false};
  FN.chat.turns.push(turn);

  finnRender();
  const i = FN.chat.turns.length - 1;
  finnRun(i, turn);
}

/* The one honest answer to a question that is not in the catalogue. It must not
   invent one (7.17 — no message may claim something that did not happen), and it
   must not say "I am a demo" either. What a real product says at this moment is
   that it cannot stand behind an answer, and here is what it can answer. */
function finnNoMatch(typed){
  if(!FN.chat) finnNewChat();
  FN.view = 'thread';
  if(!FN.open) finnOpen('thread');
  const near = finnNear(typed);
  const blocks = [{t:'p', v:'I do not have a reliable answer for that from the feeds that are '
      + 'connected, so I would rather not give you one.'}];
  if(near.length) blocks.push({t:'p', v:'These are close, and I can answer them now:'});
  const turn = {qid:null, q:typed, origin:finnOrigin(), mode:FN.mode, steps:[], ms:0,
                painted:false, blocks, near};
  FN.chat.turns.push(turn);
  finnRender();
  finnRun(FN.chat.turns.length - 1, turn);
}

/* ---- free text ----------------------------------------------------------
   Token overlap against each question plus its category. Deliberately
   conservative: a wrong confident match is worse than an admitted miss, because
   the miss offers three real questions and the wrong match answers something
   nobody asked. */
const FINN_STOP = new Set(['the','a','an','is','are','our','we','us','my','of','in','on','for',
  'to','and','or','what','which','how','much','many','where','do','does','did','can','you','me',
  'i','it','that','this','show','tell','give','about','from','by','at','be','been','with','most',
  'per','was','were','have','has']);
const finnToks = s => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/).filter(w => w.length > 2 && !FINN_STOP.has(w));
function finnScoreQ(toks, q, cat){
  const hay = new Set(finnToks(q.q + ' ' + cat.k + ' ' + cat.blurb));
  let s = 0;
  toks.forEach(t => {
    if(hay.has(t)) s += 2;
    else if([...hay].some(h => h.startsWith(t) || t.startsWith(h))) s += 1;
  });
  return s;
}
function finnRank(typed){
  const toks = finnToks(typed);
  if(!toks.length) return [];
  const out = [];
  FINN_CATS.forEach(c => c.qs.forEach(q => out.push({q, s:finnScoreQ(toks, q, c)})));
  return out.filter(x => x.s > 0).sort((a, b) => b.s - a.s);
}
function finnMatch(typed){
  const r = finnRank(typed);
  /* Needs a real signal AND a clear winner — two questions scoring the same is
     ambiguity, and ambiguity goes to the miss state. */
  if(!r.length || r[0].s < 4) return null;
  if(r[1] && r[1].s === r[0].s) return null;
  return r[0].q;
}
const finnNear = typed => finnRank(typed).slice(0, 3).map(x => x.q);

/* =============================================================================
   THINKING, then STREAMING
   ========================================================================== */
function finnRun(i, turn){
  const think = document.querySelector(`[data-finn-think="${i}"]`);
  const host  = document.querySelector(`[data-finn-a="${i}"]`);
  if(!host) return;

  if(FINN_STILL || !turn.steps.length){
    turn.ms = 900; turn.painted = true;
    finnPaintDone(i, turn);
    /* Nothing to think about out loud — the answer is already on screen. So the mark
       takes its full stop rather than miming work that did not happen, and `settle`
       is what a graceful stop looks like whether the answer landed or failed to
       derive. No error animation exists, deliberately. */
    finnState('settle');
    finnAfter(turn, i);
    return;
  }

  FN.busy = true;
  document.documentElement.setAttribute('data-finn-busy', '');
  finnState('thinking');
  const t0 = Date.now();

  /* A BEAT OF NOTHING FIRST, and it is now a SENTENCE rather than three bouncing
     dots. The dots were deleted on sight: *"there are dancing dots followed by a
     thinking animation in the mascot itself. This creates redundant
     representations of the same state."* The mark's limbs telescoping into its hub
     already say "working", in the same 40px of screen, better. What a sentence adds
     that the mark cannot is WHICH thing is happening — and the beat got longer with
     it, because a line you are meant to read needs longer on screen than a dot you
     are meant to glance at. */
  finnSay(i, 'is thinking');
  FN.stop = setTimeout(() => {
    think.insertAdjacentHTML('beforeend', `<div class="finn-steps"></div>`);
    const list = think.querySelector('.finn-steps');
    let s = 0;

    const nextStep = () => {
      if(!FN.busy) return;
      if(s >= turn.steps.length){
        turn.ms = Date.now() - t0;
        /* One more beat, with the status line saying what is about to happen. The
           reasoning is finished and the answer is not on screen yet; without this
           the log collapsed and the first words appeared in the same frame, which
           is the one moment in the sequence that used to read as a jump cut. */
        finnSay(i, 'is about to answer');
        FN.stop = setTimeout(() => {
          if(!FN.busy) return;
          finnPaintThought(i, turn);
          finnStream(host, turn, i);
        }, 620);
        return;
      }
      const row = document.createElement('div');
      row.className = 'finn-step on';
      row.innerHTML = `<span class="finn-step-m"></span><span></span>`;
      list.appendChild(row);
      finnScroll();
      /* Each step types itself. A step that appears whole is a log line; one that
         writes itself is a thought. */
      /* Tokenised, not sliced by character: a reasoning line carries <b> around its
         figures, and slicing mid-tag printed the tag as text. Tokens keep every tag
         whole, and innerHTML auto-closes a dangling <b>, so each frame is valid. */
      const text = turn.steps[s], span = row.lastElementChild;
      const toks = text.match(/(<[^>]+>|[^<\s]+|\s+)/g) || [text];
      let k = 0;
      const type = () => {
        if(!FN.busy) return;
        let n = 0;
        while(k < toks.length && n < 2){ if(/\S/.test(toks[k])) n++; k++; }
        span.innerHTML = toks.slice(0, k).join('');
        if(k < toks.length){ FN.stop = setTimeout(type, 34); return; }
        span.innerHTML = text;
        FN.stop = setTimeout(() => {
          row.classList.remove('on'); row.classList.add('done');
          s++;
          FN.stop = setTimeout(nextStep, 190 + Math.round(Math.random() * 220));
        }, 240 + Math.round(Math.random() * 200));
      };
      type();
    };
    nextStep();
  }, 900);
}

/* The status, written into the BYLINE beside Finn's name rather than onto a line of
   its own. The words are swapped inside their own span and the hopping box is left
   untouched, so the box does not restart its dance and the shimmer does not restart
   its sweep every time the sentence changes — a restart reads as two different
   lines rather than as one line saying something new.

   `aria-live` sits on the wrapper in the markup, because this is the only thing
   announcing progress now and it has to be announced where it is read. */
function finnSay(i, text){
  const el = document.querySelector(`[data-finn-stat="${i}"]`);
  if(!el) return;
  if(!text){ el.innerHTML = ''; el.classList.remove('on'); return; }
  let t = el.querySelector('.finn-stat-t');
  if(!t){
    el.innerHTML = `<span class="finn-stat-t"></span><i class="finn-hop" aria-hidden="true"></i>`;
    t = el.querySelector('.finn-stat-t');
    el.classList.add('on');
  }
  t.textContent = text;
}

function finnPaintThought(i, turn){
  const think = document.querySelector(`[data-finn-think="${i}"]`);
  if(think) think.innerHTML = `<button class="finn-thought" type="button" data-finn-thought="${i}"
    >Thought for ${(turn.ms / 1000).toFixed(1)}s · ${turn.steps.length} steps</button>`;
}

/* Word-chunked, not character-by-character. A per-character typewriter at 14.5px
   reads as a fake terminal; a per-word reveal reads as writing. Prose streams; an
   artifact chip, the working and a figure land as whole units.

   Tokenising keeps <b> tags whole and lets innerHTML re-close them each frame:
   an unclosed <b> is auto-closed by the parser, so every intermediate state is
   valid and the final state is exactly the rendered block. */
function finnStream(host, turn, turnIdx){
  /* The first words are about to land, so the mark stops working and starts talking,
     and the byline stops narrating — the answer itself is the status now. */
  finnState('speaking');
  finnSay(turnIdx, '');
  const parts = turn.blocks.map(b => ({b, html:finnBlock(b)})).filter(p => p.html);

  host.innerHTML = '';
  let pi = 0;

  const nextPart = () => {
    if(!FN.busy || pi >= parts.length) return finnStreamEnd(host, turn, turnIdx);
    const p = parts[pi++];
    const wrap = document.createElement('div');
    wrap.className = 'fa-in';
    host.appendChild(wrap);

    if(!(p.b.t === 'h' || p.b.t === 'p' || p.b.t === 'do')){
      wrap.innerHTML = p.html;
      wrap.classList.add('shown');
      finnScroll();
      FN.stop = setTimeout(nextPart, 150);
      return;
    }
    const toks = p.html.match(/(<[^>]+>|[^<\s]+|\s+)/g) || [p.html];
    let k = 0;
    const step = () => {
      if(!FN.busy){ wrap.innerHTML = p.html; return finnStreamEnd(host, turn, turnIdx); }
      let n = 0;
      while(k < toks.length && n < 3){ if(/\S/.test(toks[k])) n++; k++; }
      wrap.innerHTML = toks.slice(0, k).join('');
      wrap.classList.add('shown');
      finnScroll();
      FN.stop = setTimeout(k < toks.length ? step : nextPart, k < toks.length ? 26 : 110);
    };
    step();
  };
  nextPart();
}

function finnStreamEnd(host, turn, turnIdx){
  clearTimeout(FN.stop); FN.stop = null;
  host.innerHTML = finnRenderBlocks(turn.blocks);
  finnSay(turnIdx, '');
  finnPaintActs(turnIdx, turn);
  turn.painted = true;
  FN.busy = false;
  document.documentElement.removeAttribute('data-finn-busy');
  /* The full stop. It auto-returns to idle 750ms later; going straight to idle here
     instead is the one shortcut that makes the whole sequence read as unfinished. */
  finnState('settle');
  finnAfter(turn, turnIdx);
}

/* What happens once an answer has landed: the first artifact opens the pane, so a
   chart is on screen without the reader hunting for it. */
function finnAfter(turn, turnIdx){
  finnFollowups();
  if(turn.near && turn.near.length){
    const host = document.querySelector(`[data-finn-a="${turnIdx}"]`);
    if(host) host.insertAdjacentHTML('beforeend',
      `<div class="finn-nearby">` + turn.near.map(q =>
        `<button type="button" data-finn-ask="${q.id}">${q.q}</button>`).join('') + `</div>`);
  }
  finnCommit();
  finnScroll(true);
}

function finnScroll(force){
  const body = document.getElementById('finn-body');
  if(!body) return;
  /* Only follow the answer down if the reader has not scrolled up to re-read
     something. Yanking the viewport away from what someone is reading is the one
     thing a streaming panel must not do. */
  if(force || body.scrollHeight - body.scrollTop - body.clientHeight < 140)
    body.scrollTop = body.scrollHeight;
}

/* Skip: a click in the thread or any key finishes the answer immediately. A demo
   gets watched by someone who has already read the sentence. */
function finnSkip(){
  if(!FN.busy) return;
  FN.busy = false;
  clearTimeout(FN.stop); FN.stop = null;
  document.documentElement.removeAttribute('data-finn-busy');
  /* Skipped is still finished, so it gets the same full stop a completed stream does.
     finnClose() overrides it a line later when the skip came from closing. */
  finnState('settle');
  const i = FN.chat ? FN.chat.turns.length - 1 : -1;
  const t = i >= 0 && FN.chat.turns[i];
  if(t){
    t.ms = t.ms || 1400;
    finnSay(i, '');
    if(t.steps && t.steps.length) finnPaintThought(i, t);
    const host = document.querySelector(`[data-finn-a="${i}"]`);
    if(host) host.innerHTML = finnRenderBlocks(t.blocks);
    finnPaintActs(i, t);
    t.painted = true;
    finnAfter(t, i);
  }
}

/* =============================================================================
   MODE — Brief / Full. The ANSWER's style, never the window's size.
   Brief gives the answer. Full adds `How I worked this out` — the same reasoning
   the thinking log played, as a numbered derivation. Switching re-renders the last
   answer in place rather than appending a second copy of the same question.
   ========================================================================== */
const FINN_MODE_NOTE = {brief:'Straight to the answer', full:'Shows how I got there'};
function finnSyncMode(){
  document.querySelectorAll('[data-finn-mode]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.finnMode === FN.mode)));
  const n = document.getElementById('finn-mode-n');
  if(n) n.textContent = FINN_MODE_NOTE[FN.mode];
}
function finnSetMode(m){
  if(FN.mode === m) return;
  FN.mode = m;
  finnSyncMode();
  if(FN.view !== 'thread' || !FN.chat || !FN.chat.turns.length) return;
  const i = FN.chat.turns.length - 1, t = FN.chat.turns[i];
  if(!t.qid) return;
  const a = finnAnswer(FINN_Q[t.qid], m);
  t.mode = m; t.blocks = a.blocks;
  const host = document.querySelector(`[data-finn-a="${i}"]`);
  if(host) host.innerHTML = finnRenderBlocks(t.blocks);
  finnCommit();
}

/* =============================================================================
   HISTORY
   ========================================================================== */
function finnResolve(chat){
  for(let i = chat.turns.length - 1; i >= 0; i--){
    const d = (chat.turns[i].blocks || []).find(b => b.t === 'do');
    if(d) return {v:d.v, lab:d.lab};
  }
  for(let i = chat.turns.length - 1; i >= 0; i--){
    const h = (chat.turns[i].blocks || []).find(b => b.t === 'h');
    if(h) return {h:h.v};
  }
  return null;
}

/* WHAT PERSISTS, AND WHY IT IS NOT THE ANSWER.
   A stored chat keeps its question ids, the screen and scope each was asked from,
   the dataset, and the frozen resolution line. It does NOT keep rendered answers:
   one Full answer with charts is tens of KB and twelve would exceed a file://
   origin's quota — and, the real reason, an answer re-read later has to be
   re-derived against the dataset you are on NOW. If that is a different dataset
   the thread says so rather than quietly showing figures from a scenario you have
   left. A transcript that renumbers itself in silence is worse than one that
   admits it re-read. */
function finnCommit(){
  const c = FN.chat;
  if(!c || !c.turns.length) return;
  c.res = finnResolve(c);
  /* The verdict and its reason persist with the question, not with the rendered
     answer — they are what the READER said, so unlike the figures they are still
     true when the chat is reopened against a different dataset. */
  const light = {id:c.id, at:c.at, origin:c.origin, res:c.res,
    turns:c.turns.map(t => ({qid:t.qid, q:t.q, mode:t.mode, origin:t.origin,
                             vote:t.vote || '', why:t.why || ''}))};
  FN.chats = [light, ...FN.chats.filter(x => x.id !== c.id)].slice(0, FINN_MAX_CHATS);
  const live = FN.chats.find(x => x.id === c.id);
  if(live) live._live = c;
  finnStore.set(FN.chats.map(x => ({...x, _live:undefined})));
}

function finnOpenChat(i){
  const rec = FN.chats[i];
  if(!rec) return;
  if(rec._live) FN.chat = rec._live;
  else {
    FN.chat = {id:rec.id, at:rec.at, origin:rec.origin, res:rec.res, turns:[],
      stale: rec.origin.ds && typeof RAW !== 'undefined' && RAW && rec.origin.ds !== RAW.id};
    rec.turns.forEach(t => {
      const q = t.qid && FINN_Q[t.qid];
      const a = q ? finnAnswer(q, t.mode || 'brief') : {blocks:[], arts:[]};
      FN.chat.turns.push({qid:t.qid, q:t.q, mode:t.mode || 'brief', origin:t.origin,
        blocks:a.blocks, steps:[], ms:900, painted:true,
        vote:t.vote || '', why:t.why || ''});
    });
    rec._live = FN.chat;
  }
  FN.view = 'thread';
  finnRender();
}

/* =============================================================================
   VOICE — real dictation or no button
   A key inside a file:// page is a published key, and the mock-up assumes no
   network at all, so nothing here calls a provider. What DOES exist with no key
   and no server is the browser's own SpeechRecognition, so Finn uses it where it
   is available and shows no microphone where it is not.

   The rejected alternative was a mic that plays a waveform and then fills the box
   with a scripted question. That is exactly what 7.17 forbids, and it would be the
   one dishonest control in the product. A missing button is honest (§0.7).
   ========================================================================== */
/* ---- the meter ----------------------------------------------------------
   A REAL waveform, and that word is doing work. The bars are scaled every frame
   from an AnalyserNode on the actual microphone stream — they move because the room
   is loud. A CSS keyframe here would have been indistinguishable to look at and
   would have been the rejected version of this whole feature wearing better
   clothes: an animation that plays whether or not anything is being heard is a
   control that claims something that did not happen.

   It is also OPTIONAL, in the strict sense. `getUserMedia` can be refused, or the
   device can be busy, and if that happens dictation itself must still work — so the
   meter is started after recognition, never before, and its failure is silent. What
   reports a refusal is recognition's own `onerror`, which is the thing the reader
   actually asked for.

   fftSize 128 gives 64 bins; only the first ~34 carry speech at 48kHz, so the
   bars map across those rather than across a spectrum three-quarters of which is
   permanently flat. */
const FINN_MIC = {want:false, stream:null, ac:null, an:null, raf:0, bars:null, data:null};

function finnWaveSay(t){
  const el = document.querySelector('.finn-wave-l');
  if(el) el.textContent = t;
}

function finnMeterStart(){
  const wrap = document.getElementById('finn-wave');
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!wrap || !AC || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  FINN_MIC.bars = [...wrap.querySelectorAll('i')];
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
    /* The permission prompt is asynchronous, and the click that opened the
       microphone may already have closed it again by the time this settles. */
    if(!FINN_MIC.want){ stream.getTracks().forEach(t => t.stop()); return; }
    FINN_MIC.stream = stream;
    FINN_MIC.ac = new AC();
    /* AN AudioContext IS BORN SUSPENDED unless it can see a user gesture, and a
       suspended one reads back nothing but zeros — a meter of fifteen flat bars
       over a live microphone. The mic click IS a gesture, but it is two promises
       back by the time we get here, so this is not belt-and-braces: without the
       resume() the bars were measurably dead. */
    if(FINN_MIC.ac.state === 'suspended' && FINN_MIC.ac.resume) FINN_MIC.ac.resume();
    FINN_MIC.an = FINN_MIC.ac.createAnalyser();
    FINN_MIC.an.fftSize = 128;
    FINN_MIC.an.smoothingTimeConstant = 0.6;
    FINN_MIC.ac.createMediaStreamSource(stream).connect(FINN_MIC.an);
    FINN_MIC.data = new Uint8Array(FINN_MIC.an.frequencyBinCount);
    const draw = () => {
      if(!FINN_MIC.an) return;
      FINN_MIC.an.getByteFrequencyData(FINN_MIC.data);
      const bars = FINN_MIC.bars, n = bars.length, span = 34;
      for(let k = 0; k < n; k++){
        const from = 1 + Math.floor(k / n * span);
        const to   = Math.max(1 + Math.floor((k + 1) / n * span), from + 1);
        let peak = 0;
        for(let j = from; j < to; j++) if(FINN_MIC.data[j] > peak) peak = FINN_MIC.data[j];
        /* A FLOOR and a GAMMA, both for the same reason: at conversational level a
           linear amplitude barely leaves the baseline, and a bar at zero reads as a
           dead control rather than as a live microphone in a quiet room. */
        bars[k].style.transform =
          'scaleY(' + (0.12 + Math.pow(peak / 255, 0.72) * 0.88).toFixed(3) + ')';
      }
      FINN_MIC.raf = requestAnimationFrame(draw);
    };
    draw();
  }).catch(() => { /* meter unavailable; dictation carries on without it */ });
}

function finnMeterStop(){
  if(FINN_MIC.raf) cancelAnimationFrame(FINN_MIC.raf);
  FINN_MIC.raf = 0; FINN_MIC.an = null; FINN_MIC.data = null;
  if(FINN_MIC.stream){ FINN_MIC.stream.getTracks().forEach(t => t.stop()); FINN_MIC.stream = null; }
  if(FINN_MIC.ac){ try{ FINN_MIC.ac.close(); }catch(e){} FINN_MIC.ac = null; }
  (FINN_MIC.bars || []).forEach(b => { b.style.transform = ''; });
}

function finnVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const host = document.getElementById('finn-in-a');
  const btn0 = host && host.querySelector('.finn-mic');
  /* The button ships hidden in the markup and is revealed here, rather than being
     built here — icon() lives in shell.js, which has not loaded yet, and calling
     it at boot threw and took the rest of finnBoot() with it. */
  if(!SR || !btn0) return;
  btn0.hidden = false;
  let rec = null;

  const stop = () => {
    FINN_MIC.want = false;
    finnMeterStop();
    document.documentElement.removeAttribute('data-finn-mic');
    const b = host.querySelector('.finn-mic');
    if(b) b.classList.remove('live');
    b && b.setAttribute('aria-label', 'Dictate a question');
    finnWaveSay('Listening…');
    rec = null;
    /* Back to whichever resting state is actually true. */
    if(FNM.state === 'listening') finnState(FN.open ? 'idle' : 'docked');
  };

  host.addEventListener('click', e => {
    if(!e.target.closest('[data-finn-act="mic"]')) return;
    const btn = host.querySelector('.finn-mic'), ask = document.getElementById('finn-ask');
    if(rec){ rec.stop(); return; }
    try{ rec = new SR(); }catch(err){ rec = null; return; }
    /* interimResults OFF. *"Transcription should happen only after the user
       finishes speaking."* With `continuous:false` as well, Chrome fires one
       `onresult` carrying the whole final transcript at the end of the utterance —
       so the box stays empty and the meter does the talking until the sentence is
       finished. The old behaviour typed a half-heard guess into the box and then
       rewrote it word by word, which reads as the product mis-hearing you. */
    rec.lang = 'en-GB'; rec.interimResults = false; rec.continuous = false;

    FINN_MIC.want = true;
    btn.classList.add('live');
    btn.setAttribute('aria-label', 'Stop dictating');
    document.documentElement.setAttribute('data-finn-mic', '');
    finnWaveSay('Listening…');
    /* Dictating IS the reader talking to Finn, so Finn leans in and HOLDS — no
       debounce, because the state ends when the microphone does. Any typing timer
       still pending would otherwise drop it back out mid-sentence. */
    clearTimeout(FNM.typing);
    finnState('listening');

    rec.onresult = ev => {
      let s = '';
      for(let i = 0; i < ev.results.length; i++) s += ev.results[i][0].transcript;
      s = s.trim();
      if(!s) return;
      /* Appended, not assigned: dictating after typing half a question should
         finish the sentence rather than delete it. */
      const had = (ask.value || '').trim();
      ask.value = had ? had + ' ' + s : s;
      finnGrow();
    };
    /* The moment the reader stops talking. The bars have nothing left to show and
       the transcript has not arrived yet, so the label says which of the two is
       happening rather than leaving a flat meter to be read as a failure. */
    rec.onspeechend = () => { finnMeterStop(); finnWaveSay('Transcribing…'); };
    /* A refused microphone is reported, not swallowed: a control that appears to
       do nothing is the same failure as one that does nothing. */
    rec.onerror = ev => {
      const err = ev.error;
      stop();
      if(err === 'not-allowed' || err === 'service-not-allowed')
        toast('Microphone blocked', 'Your browser refused access on this page.', 'warn');
      else if(err === 'audio-capture')
        toast('No microphone found', 'Nothing is available to record from on this device.', 'warn');
    };
    rec.onend = stop;
    rec.start();
    /* AFTER start(), deliberately. If two consumers of one device is going to be a
       problem, recognition is the one that must win. */
    finnMeterStart();
  });
}

/* =============================================================================
   WIRING
   ========================================================================== */
function finnGrow(){
  const el = document.getElementById('finn-ask');
  if(!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(132, el.scrollHeight) + 'px';
  const send = document.querySelector('.finn-send');
  if(send) send.disabled = !(el.value || '').trim();
  finnPhSync();
}

function finnSend(){
  const ask = document.getElementById('finn-ask');
  const v = (ask.value || '').trim();
  if(!v || FN.busy) return;
  ask.value = ''; finnGrow();
  const q = finnMatch(v);
  if(q) finnAsk(q.id, v); else finnNoMatch(v);
}

function finnKey(e){
  if(e.key !== 'Escape') return;
  /* LAST in the Escape chain, by inspection rather than by registration order —
     tablekit's popover, a filter or profile menu, the connect pane and the modal
     each own Escape while they are up. Registration order would have put Finn
     first, since this file loads before shell.js. */
  if(document.querySelector('.menu.tblmenu:not([hidden])')) return;
  if(document.querySelector('.menu:not([hidden])')) return;
  if(document.documentElement.classList.contains('pane-open')) return;
  if(typeof MODAL !== 'undefined' && MODAL) return;
  if(!FN.open) return;
  e.stopPropagation();
  finnClose();
}

function finnBoot(){
  if(typeof FINN_MARK === 'undefined' || typeof FINN_CATS === 'undefined'){
    console.error('Finn: finn-logo.js and assistant-content.js must load before assistant.js');
    return;
  }
  /* The mark is artwork, so it cannot be a data-icon slot — finn-logo.js is loaded
     by the time this runs, which is why these are filled here and the glyphs are
     left to fillChrome() at shell boot. */
  document.querySelectorAll('[data-finn-mark]').forEach(n => { n.innerHTML = FINN_MARK; });
  FN.chats = finnStore.get();

  const finn = document.getElementById('finn');
  const scrim = document.getElementById('finn-scrim');

  finn.addEventListener('click', e => {
    const act = e.target.closest('[data-finn-act]');
    if(act){
      switch(act.dataset.finnAct){
        case 'close':     finnClose(); return;
        case 'full':      finnFull(); return;
        case 'new':       finnSkip(); FN.chat = null; FN.view = 'greet';
                          finnRender(); return;
        case 'history':   finnSkip(); FN.view = 'history'; finnRender(); return;
        case 'all':       finnSkip(); FN.view = 'all'; finnRender(); return;
        case 'send':      finnSend(); return;
        case 'mic':       return;
      }
    }
    const ask = e.target.closest('[data-finn-ask]');
    if(ask){ finnAsk(ask.dataset.finnAsk); return; }

    const open = e.target.closest('[data-finn-open]');
    if(open){ finnOpenChat(+open.dataset.finnOpen); return; }

    const mode = e.target.closest('[data-finn-mode]');
    if(mode){ finnSetMode(mode.dataset.finnMode); return; }

    /* ---- what you can do with an answer ----
       `q3` copies the reader's own question, `3` copies Finn's answer to it — one
       attribute rather than two, because both are "copy the thing this button is
       attached to" and the turn index is the only variable. */
    const cp = e.target.closest('[data-finn-copy]');
    if(cp){
      const raw = cp.dataset.finnCopy, isQ = raw[0] === 'q';
      const t = FN.chat && FN.chat.turns[+(isQ ? raw.slice(1) : raw)];
      if(t) finnCopy(isQ ? t.q : finnPlain(t), cp);
      return;
    }
    const wk = e.target.closest('[data-finn-work]');
    if(wk){ finnTurnWork(+wk.dataset.finnWork); return; }

    const vt = e.target.closest('[data-finn-vote]');
    if(vt){ const [v, i] = vt.dataset.finnVote.split(':'); finnVote(+i, v); return; }

    const wy = e.target.closest('[data-finn-why]');
    if(wy){ const [k, i] = wy.dataset.finnWhy.split(':'); finnWhy(+i, +k); return; }

    const th = e.target.closest('[data-finn-thought]');
    if(th){
      const t = FN.chat && FN.chat.turns[+th.dataset.finnThought];
      if(!t) return;
      const on = th.classList.toggle('open');
      th.textContent = on ? t.steps.join('  ·  ')
        : `Thought for ${((t.ms || 1400) / 1000).toFixed(1)}s · ${t.steps.length} steps`;
      return;
    }
    /* The mark in the composer is Finn's identity, so it opens Finn — which is
       also the only way in when there is no question yet to open it with. */
    if(e.target.closest('.finn-bar-m')){ finnOpen(FN.chat ? 'thread' : 'greet'); return; }
    /* Anything else in the thread while an answer is streaming means "I have read
       it, get on with it". */
    if(FN.busy && e.target.closest('.finn-thread')) finnSkip();
  });

  /* Clicking the resting composer raises the suggestions. */
  const ask = document.getElementById('finn-ask');
  ask.addEventListener('focus', () => { if(!FN.open) finnSugg(true); finnPhSync(); });
  /* Two jobs on one event, kept separate: finnGrow() is the textarea's height and the
     send button's enabled state, finnTyping() is the mark leaning in. finnGrow() is
     also called from finnSend() and from dictation, neither of which is typing. */
  ask.addEventListener('input', () => { finnGrow(); finnTyping(); });
  ask.addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); finnSend(); }
  });

  /* Scrim dismiss needs BOTH mousedown and click on the scrim, so a selection
     dragged out of the surface does not close what you were reading (§7.8). */
  let downOnScrim = false;
  scrim.addEventListener('mousedown', e => { downOnScrim = e.target === scrim; });
  scrim.addEventListener('click', e => { if(e.target === scrim && downOnScrim) finnClose(); });
  /* A click anywhere else on the board closes the suggestions, but never the
     surface — the surface has a scrim for that. */
  document.addEventListener('click', e => {
    if(!FN.open && !e.target.closest('#finn')) finnSugg(false);
  });

  document.addEventListener('keydown', finnKey);
  /* The resting composer first, the optional extra last: nothing that can be
     absent should be able to stop the thing that is always there from starting. */
  finnGrow();
  finnPhStart();
  finnVoice();
  /* The eyes. Started once, and it does nothing until Finn leaves `docked`. */
  finnBlink();
}

/* Scripts sit at the foot of <body>, so the static markup above exists here. No
   VIEW renders until something opens Finn, because every answer reads `D` and `D`
   does not exist until shell.js boots at the end of the load order. */
finnBoot();
