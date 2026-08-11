/* ============================================================
   Finoptic — motion: the cold-start veil, the screen-switch skeleton,
   and the entrance the content plays when it arrives (§9)
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  This one loads after logo.js (it needs LOGO.mark) and
   immediately before shell.js, which is what calls into it.

   THE CONTRACT, and it is deliberately small.  shell.js's go() calls three
   methods and knows nothing else about animation:

     MOTION.beforeScreen(id, moved)   before the screen HTML is written
     MOTION.afterScreen(id, moved)    after it is in the DOM
     MOTION.boot()                    once, at the foot of shell.js

   `moved` is true for a real navigation and false for a re-render caused by a
   filter or a dataset change, and that distinction is the whole reason the flag
   exists: SOMEONE CHANGING A FILTER IS COMPARING TWO NUMBERS.  Replaying an
   entrance under them is noise over the one moment the board has to hold still,
   so a re-render gets no skeleton and no entrance.

   Everything here is optional.  Delete this file and the mock-up renders
   exactly as it does now — every animation is defined so that its END state is
   the natural state (see the two rules at the top of parts/motion.css), so a
   screen is correct whether its entrance ran, was cancelled halfway by a second
   navigation, or never started at all.
   ============================================================ */
(function(){

  /* Reduced motion is handled HERE, not only in CSS.  styles.css already kills
     every animation and transition globally, which is the right answer for the
     content and the wrong one for an overlay whose only exit is a fade — it
     would be raised and never lowered.  So in this mode neither overlay is ever
     built, and the class that drives the entrance is never applied.

     ?nofx in the URL does the same thing on demand.  Two reasons it earns its
     line: a screenshot harness otherwise has to wait out a veil and an entrance
     to see a settled screen, and it cannot tell "still arriving" from "broken";
     and on the day, a machine that cannot composite this smoothly is better
     shown a board that simply appears.  A query string survives the hash the
     shared-link state lives in, so the two do not collide. */
  const reduced = /[?&]nofx\b/.test(location.search)
    || !!(window.matchMedia
       && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const screenEl = document.getElementById('screen');

  /* ---- timings ----
     The veil is the one flourish in the mock-up and it runs before anyone can
     do anything, so it is budgeted rather than composed: 770ms for the four
     ribbons to converge, the wordmark resolving under them by ~980ms, a short
     beat to read it, and the lift starting at 1060ms.  Gone by ~1.36s.
     The skeleton is the opposite problem.  The render is synchronous and
     instant, so its beat is honest theatre — long enough to register as
     "computing", short enough that navigation does not feel slower than it is.
     170ms is about the floor at which a fade is perceived as a state change
     rather than as a flicker. */
  const BOOT_HOLD = 1060, BOOT_FADE = 300;
  const SKEL_HOLD = 170,  SKEL_FADE = 170;
  /* The board starts rising as the veil starts lifting, not after it — the two
     overlapping is what makes a navigation read as one movement. */
  const SKEL_LEAD = 150;

  /* Past about ten steps a stagger stops reading as a sequence and starts
     reading as lag, and the widest screens run to fourteen boxes. */
  const CAP_BOX = 10, CAP_ROW = 4, CAP_COL = 14;
  /* The longest any entrance can run: the last box starts at CAP_BOX steps and
     the slowest thing inside it, a line drawing itself, takes 120 + 780ms.
     Rounded up, because this only decides when the screen stops being marked as
     arriving — being late here costs nothing, being early cuts an animation. */
  const SETTLE = CAP_BOX * 34 + 1000;

  let veil = null, veilAt = 0, booted = false, bootActive = false;
  let skel = null, skelFade = 0, skelGone = 0, settle = 0;

  /* ============================================================
     The veil
     ============================================================ */
  /* Raised at load time, not from boot(): this script is a plain tag at the
     foot of <body>, so it runs before the first render and the veil is up
     before the dashboard has ever been painted.  Built from boot() instead, the
     client's first frame would be a flash of the board. */
  function raiseVeil(){
    if(reduced || typeof LOGO === 'undefined' || !LOGO.mark) return;
    const v = document.createElement('div');
    v.className = 'fx-boot';
    v.setAttribute('aria-hidden','true');
    v.innerHTML =
      '<div class="fx-boot-lock">'
      + '<div class="fx-boot-mark">' + LOGO.mark + '</div>'
      + '<div class="fx-boot-word">' + (LOGO.word||'') + '</div>'
      + '<div class="fx-boot-sub">By Crozaint.com</div>'
      + '</div>';
    document.body.appendChild(v);
    veil = v;
    veilAt = performance.now();
    bootActive = true;
  }

  function boot(){
    if(booted) return;
    booted = true;
    if(reduced) return;
    if(!veil){ enter(0); return; }
    /* Measured from when the veil went up rather than from now, so the ribbons
       get their full run whether boot() is reached in one millisecond or fifty
       — the wall-clock length of the preloader is the thing that was budgeted,
       not the length of the wait after it. */
    const wait = Math.max(0, BOOT_HOLD - (performance.now() - veilAt));
    setTimeout(function(){
      if(veil) veil.classList.add('out');
      bootActive = false;
      enter(0);
    }, wait);
    setTimeout(function(){
      if(veil){ veil.remove(); veil = null; }
    }, wait + BOOT_FADE);
  }

  /* ============================================================
     The skeleton
     ============================================================ */
  /* A skeleton of the layout that is about to appear — head, controls, ledger,
     a KPI row, two cards — rather than a spinner, because every screen here has
     that shape and a shape is information a spinner does not carry. */
  const SKEL_HTML =
      '<div class="sk-line sk-h1"></div>'
    + '<div class="sk-line sk-p"></div>'
    + '<div class="sk-controls">'
    +   '<div class="sk-line sk-chip"></div><div class="sk-line sk-chip"></div>'
    +   '<div class="sk-line sk-chip"></div><div class="sk-line sk-asof"></div>'
    + '</div>'
    + '<div class="sk sk-ledger"></div>'
    + '<div class="sk sk-band"></div>'
    + '<div class="sk-kpis">' + new Array(9).join('<div class="sk sk-kpi"></div>') + '</div>'
    + '<div class="sk-cards"><div class="sk sk-card"></div><div class="sk sk-card"></div></div>';

  /* Appended to <body> as position:fixed and sized to the content column, NOT
     inserted into #screen.  The shell overwrites #screen.innerHTML in the same
     synchronous task as the beforeScreen call, so anything put in there is gone
     before a frame is ever painted.  The rect is read off the OLD screen, which
     is still in the DOM at this point. */
  function showSkeleton(){
    clearSkeleton();
    const r = screenEl.getBoundingClientRect();
    if(!r.width) return;
    const cs = getComputedStyle(screenEl);
    const s = document.createElement('div');
    s.className = 'fx-skel';
    s.setAttribute('aria-hidden','true');
    s.style.left = r.left + 'px';
    s.style.width = r.width + 'px';
    /* Padding copied from .content rather than restated, so the skeleton's
       blocks stay on the same left edge as the real ones if that padding is
       ever retuned. */
    s.style.paddingLeft = cs.paddingLeft;
    s.style.paddingRight = cs.paddingRight;
    s.style.paddingTop = cs.paddingTop;
    s.innerHTML = SKEL_HTML;
    document.body.appendChild(s);
    skel = s;
  }

  /* Torn down by node removal, never left parked at opacity:0 — an invisible
     overlay across the content column would sit on top of every chart and eat
     the hover a tooltip needs. */
  function clearSkeleton(){
    clearTimeout(skelFade); clearTimeout(skelGone);
    if(skel){ skel.remove(); skel = null; }
  }

  /* ============================================================
     The entrance
     ============================================================ */
  /* The stagger is a custom property rather than a wall of nth-child rules
     because the grids run from three to fourteen children and a card is only
     sometimes preceded by eight KPI tiles — there is no fixed position to write
     a rule against.  Indexed in document order across ALL grids on the screen,
     not per grid: restarting the count at a second grid halfway down the page
     makes the boxes below it arrive before the ones above them. */
  function stamp(){
    let i = 0;
    /* `.sum` joins the box list because it IS a box now — the tiles and the band
       it swallowed used to be indexed here individually, and without it the panel
       would arrive with no stagger index while everything below it counted from
       zero, so the charts would enter ahead of the summary above them. */
    screenEl.querySelectorAll('.sum, .grid > *').forEach(function(c){
      c.style.setProperty('--fx-i', Math.min(CAP_BOX, i++));
    });
    screenEl.querySelectorAll('.rows').forEach(function(list){
      let j = 0;
      list.querySelectorAll(':scope > .row').forEach(function(row){
        row.style.setProperty('--fx-j', Math.min(CAP_ROW, j++));
      });
    });
    /* A chart is classified by what it drew, so nothing has to be tagged at a
       call site: a plot has gridlines, a donut has its centre total, and
       flowDiagram's stage boxes have neither — which is what keeps them out of
       the bar animation, where a 60px box growing out from under its own label
       looked like a fault. */
    screenEl.querySelectorAll('svg').forEach(function(sv){
      if(sv.querySelector('.gridline')) markPlot(sv);
      else if(sv.querySelector('.donut-total')) sv.classList.add('fx-donut');
    });
  }

  /* Bars rise column by column so a chart reads left to right instead of all at
     once.  The column comes from each rect's own x, NOT from its DOM index: a
     stacked bar emits one rect per series per column plus a second on top of it
     for the hatch overlay, so index order is not x order.
     Rects that paint nothing are marked and left alone — a chart tooltip lays
     invisible full-height hit targets over its plot, and scaling one of those
     means that for half a second the area a hover is tested against is not the
     area it looks like.  Detected by what it renders as rather than by class,
     because the class belongs to another file.
     Read in one pass and written in the next: interleaving getComputedStyle
     with a style write forces a recalculation per rect. */
  function markPlot(sv){
    sv.classList.add('fx-plot');
    const rects = [].slice.call(sv.querySelectorAll('rect'));
    if(!rects.length) return;
    const xOf = r => Math.round(parseFloat(r.getAttribute('x')) || 0);
    const read = rects.map(function(r){
      const cs = getComputedStyle(r);
      return {r:r, x:xOf(r), still: +cs.opacity < .02
        || cs.fill === 'none' || cs.fill === 'rgba(0, 0, 0, 0)'};
    });
    /* Opted-out rects are excluded from the COLUMN INDEX, not just from the
       animation.  tooltip.js lays an invisible full-height hit band over every
       column, and counting those as columns doubled every bar's stagger step and
       pushed the tail of a twelve-column chart past CAP_COL, so the last bars
       arrived together instead of in sequence. */
    const xs = read.filter(o=>!o.still).map(o=>o.x)
      .filter((v,i,a) => a.indexOf(v) === i).sort((a,b) => a-b);
    read.forEach(function(o){
      if(o.still){ o.r.classList.add('fx-still'); return; }
      o.r.style.setProperty('--fx-k', Math.min(CAP_COL, xs.indexOf(o.x)));
    });
  }

  /* Stamped BEFORE the class goes on.  Changing an animation-delay after an
     animation has started does not restart it, it re-measures the same start
     time — so a delay written a tick late is a delay that never happens.
     The class is then taken off again once everything has landed.  Left on, any
     element inserted into the screen LATER would match the entrance rules and
     play them — a chart tooltip's crosshair would arrive half a second after
     the pointer it belongs to.  Removing it is free: every animation here ends
     at the natural state, so there is nothing to hold. */
  function enter(t0){
    stamp();
    screenEl.style.setProperty('--fx-t0', t0 + 'ms');
    screenEl.classList.add('fx-in');
    clearTimeout(settle);
    settle = setTimeout(function(){
      screenEl.classList.remove('fx-in');
    }, t0 + SETTLE);
  }

  /* ============================================================
     The contract
     ============================================================ */
  window.MOTION = {
    beforeScreen: function(id, moved){
      if(reduced) return;
      /* Stripped before the swap rather than after it.  Left on, the new nodes
         of a FILTER re-render would match the entrance rules the moment they
         were inserted and animate in as though they were a new screen. */
      screenEl.classList.remove('fx-in');
      /* Unconditional, so a filter change landing mid-fade takes the skeleton
         with it instead of leaving it to finish over the new numbers. */
      clearSkeleton();
      /* Suppressed while the veil is up: a shared link opens on a screen other
         than the default, which makes the first render a "real" navigation —
         and a skeleton nobody can see, followed by an entrance that has played
         itself out by the time the veil lifts, is how a cold start ends up
         looking exactly as dead as the complaint that started this. */
      if(moved && !bootActive) showSkeleton();
    },

    afterScreen: function(id, moved){
      if(reduced || bootActive || !moved) return;
      if(skel){
        skelFade = setTimeout(function(){ if(skel) skel.classList.add('out'); }, SKEL_HOLD);
        skelGone = setTimeout(clearSkeleton, SKEL_HOLD + SKEL_FADE);
      }
      enter(skel ? SKEL_LEAD : 0);
    },

    boot: boot
  };

  raiseVeil();
  /* The veil goes up before anything has rendered, so it has to come down even
     if shell.js never reaches its boot() call — a thrown dataset, a reverted
     edit.  A splash screen that never lifts is the one failure a demo cannot
     survive.  Zero delay, not a long timeout: shell.js is a parser-blocking tag
     right after this one, so its own boot() always wins the race and this only
     fires when there was no call to lose to. */
  setTimeout(boot, 0);

})();
