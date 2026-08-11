/* ============================================================
   Finoptic — tooltip: the one hover/focus readout every plot shares
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  index.html loads them as

     data/registry.js -> the four scenario-*.js -> logo.js -> icons.js ->
     brands.js -> core.js -> components.js -> charts.js -> tooltip.js ->
     screens.js -> shell.js

   Nothing here runs at load time except the delegated listeners at the foot,
   which is why charts.js — loaded BEFORE this file — may call CHARTTIP.attrs():
   it only ever calls it during a render.

   ------------------------------------------------------------
   WHY THIS IS ITS OWN COMPONENT, AND WHY IT LOOKS LIKE THIS

   ONE element, portalled to <body> as position:fixed.  Not per-chart, not
   parented to the card.  This is the same lesson openDimMenu() in shell.js
   already paid for: a popover parented inside the content is at the mercy of
   every ancestor's overflow, and .card-b / .tbl-scroll / .filters all set one.
   A tooltip clipped to its card is the "the filters are not working" bug in a
   second costume — out on <body> nothing can cut it away.

   A WHITE SURFACE, NOT THE USUAL DARK TOOLTIP.  The Brand Guide reserves ink as
   a surface VALUE: "every panel on a Finoptic screen is white; this one is ink"
   is what makes the briefing band read as an instruction rather than as another
   stat card (v3.2 change #6).  This readout is a panel — a header, a figure and
   several ruled rows — so in ink it would be a second briefing band floating
   over a chart, and the band's meaning is exactly its exclusivity.  It takes the
   popover-menu treatment instead (§7): --surface, a hairline, --r-surface and
   --shadow-float, which is the token the guide assigns to menus and toasts.
   The one-line .tip on icon buttons stays ink because it is a chip-sized LABEL,
   not a panel.

   PAYLOAD, not markup.  A chart describes what is under the cursor; this file
   decides how that reads.  charts.js therefore never emits tooltip HTML — it
   calls CHARTTIP.attrs(payload) and splats the result onto a hit target.

     { t: 'Mar',                  header (x label, or an entity name)
       c: '--c2',                 colour key beside the header
       v: '$612.4K',              headline figure (share charts)
       d: '37.8% of $1.62M',      sub-line under the figure
       r: [ {n,v,c,d} … ],        one row per series: name, value, colour, share
       f: {n:'Total', v:'$312K'}  footer, over a hairline
     }

   Every field is optional; a multi-series plot uses `r`, a share chart uses
   `v`/`d`, and the flow diagram uses `t`/`d` alone.
   ============================================================ */

const CHARTTIP = (function(){

  const esc = s => String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  /* ---------- the element ---------- */
  let el = null,          /* the single portalled node, built on first use     */
      zone = null,        /* the hit target currently answering                */
      suppressed = null,  /* the zone Escape dismissed, until focus moves on   */
      tw = 0, th = 0,     /* cached size — measuring on every mousemove thrashes layout */
      raf = 0, queued = null;

  function node(){
    if(el) return el;
    el = document.createElement('div');
    el.className = 'ct';
    /* Decorative for assistive tech: the same content is on the hit target's
       own aria-label (see label()), and announcing it twice is worse than
       announcing it once. */
    el.setAttribute('aria-hidden','true');
    document.body.appendChild(el);
    return el;
  }

  /* ---------- content ---------- */
  /* A vendor slice or series shows its real mark.  brandMark() carries the
     brand's own literal hexes, so it must never be given .ic — which is also
     why this asks hasBrand() first rather than falling back to a lettermark:
     "Logs", "Retention & storage" and "All other vendors" are not companies. */
  const mark = n => (typeof hasBrand==='function' && hasBrand(n)) ? brandMark(n) : '';
  /* Always emitted, even with no colour, so the grid columns line up down the
     list the way the donut legend's do. */
  const key = c => `<i${c?` style="background:var(${esc(c)})"`:' class="ct-none"'}></i>`;

  function html(p){
    const rows  = p.r || [];
    const marks = rows.some(r=>mark(r.n));
    const pcts  = rows.some(r=>r.d);
    let h = '';
    if(p.t) h += `<div class="ct-h">${p.c?key(p.c):''}${mark(p.t)}<span class="ct-t">${esc(p.t)}</span></div>`;
    if(p.v) h += `<div class="ct-v">${esc(p.v)}</div>`;
    if(p.d) h += `<div class="ct-d">${esc(p.d)}</div>`;
    if(rows.length) h += `<div class="ct-rows${marks?' marks':''}${pcts?' pcts':''}">${rows.map(r=>
      `<div>${key(r.c)}${marks?(mark(r.n)||'<span></span>'):''}<span class="ct-n">${esc(r.n)}</span>`
      + `<b>${esc(r.v)}</b>${pcts?`<b class="ct-p">${esc(r.d||'')}</b>`:''}</div>`).join('')}</div>`;
    if(p.f) h += `<div class="ct-f"><span>${esc(p.f.n)}</span><b>${esc(p.f.v)}</b></div>`;
    return h;
  }

  /* Flat text of the same payload, for the hit target's accessible name. */
  function label(p){
    const bits = [];
    if(p.t) bits.push(p.t);
    if(p.v) bits.push(p.v);
    if(p.d) bits.push(p.d);
    (p.r||[]).forEach(r=>bits.push(r.n+' '+r.v+(r.d?' ('+r.d+')':'')));
    if(p.f) bits.push(p.f.n+' '+p.f.v);
    return bits.join(', ');
  }

  /* ---------- placement ---------- */
  /* Deliberately the same shape as openDimMenu() in shell.js: hang below the
     anchor, flip above when the panel's own height would take it past the fold,
     clamp horizontally.  The clamp is also what guarantees the mock-up never
     grows a horizontal scrollbar because of a tooltip near the right edge. */
  function place(x,y){
    const n = node();
    const below = y + 18, flip = below + th > window.innerHeight - 8;
    n.style.top  = (flip ? Math.max(8, y - th - 18) : below) + 'px';
    n.style.left = Math.max(8, Math.min(x + 14, window.innerWidth - tw - 8)) + 'px';
  }

  /* The column wash and the point markers are CSS, driven off the group — so
     they cost no per-frame JS and cannot fall out of step with the panel. */
  const lit = z => (z.closest && z.closest('.ct-col')) || z;

  function show(z,x,y){
    if(z === suppressed) return;
    let p; try{ p = JSON.parse(z.dataset.ct); }catch(e){ return; }
    const n = node();
    if(z !== zone){
      if(zone) lit(zone).classList.remove('ct-on');
      n.innerHTML = html(p);
      /* Measured once per zone, not once per mousemove. */
      tw = n.offsetWidth; th = n.offsetHeight;
      zone = z;
      lit(z).classList.add('ct-on');
    }
    place(x,y);
    n.classList.add('on');
  }

  function hide(){
    if(zone) lit(zone).classList.remove('ct-on');
    zone = null;
    if(el) el.classList.remove('on');
  }

  /* ---------- events ----------
     ALL DELEGATED, on document.  Every chart is redrawn wholesale on a filter
     change, a scenario swap or a screen change, so a listener bound to an SVG
     node is a listener bound to a node that is about to be discarded. */
  document.addEventListener('mousemove', e=>{
    const z = e.target.closest ? e.target.closest('[data-ct]') : null;
    if(!z){ suppressed = null; if(zone) hide(); return; }
    queued = {z, x:e.clientX, y:e.clientY};
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = 0; if(queued) show(queued.z,queued.x,queued.y); });
  });

  /* Keyboard: a hit target is focusable, so the same readout arrives on Tab.
     Anchored to the target's own rect rather than to a cursor there isn't. */
  document.addEventListener('focusin', e=>{
    const z = e.target.closest ? e.target.closest('[data-ct]') : null;
    suppressed = null;
    if(!z){ hide(); return; }
    const r = z.getBoundingClientRect();
    show(z, r.left + Math.min(r.width/2, 140), r.bottom - 6);
  });
  document.addEventListener('focusout', ()=>{ suppressed = null; hide(); });
  document.addEventListener('keydown', e=>{
    /* Escape has to stick, or Tab-ing through a plot would re-open the panel the
       user just dismissed on the very next keystroke. */
    if(e.key==='Escape' && zone){ suppressed = zone; hide(); }
  });

  /* A fixed panel does not travel with the chart it belongs to. */
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);

  /* Screen change.  shell.js replaces #screen's innerHTML wholesale, which would
     otherwise strand the panel over a chart that no longer exists.  Watched
     rather than called from go(), so the shell keeps knowing nothing about this
     file — same contract motion.js has. */
  const screenEl = document.getElementById('screen');
  if(screenEl && window.MutationObserver)
    new MutationObserver(hide).observe(screenEl,{childList:true});

  return {
    /* The whole surface charts.js needs: hand it a payload, splat the result
       onto the hit target's tag. */
    attrs: p => `data-ct="${esc(JSON.stringify(p))}" tabindex="0" aria-label="${esc(label(p))}"`,
    hide
  };
})();
