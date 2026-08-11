/* ============================================================
   Finoptic — charts: every plot, drawn as plain SVG (§6)
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  index.html loads them as

     data/registry.js -> the four scenario-*.js -> logo.js -> icons.js ->
     brands.js -> core.js -> components.js -> charts.js -> tooltip.js ->
     people.js -> catalog.js -> screens.js -> screens-account.js ->
     screens-input.js -> screens-onboarding.js -> motion.js -> shell.js

   The screens-*.js files register themselves into the global S after the
   original seventeen; motion.js must precede shell.js because shell.js calls
   MOTION from go() and at boot.

   Nothing here runs at load time except in shell.js, which boots the app at its
   foot — so a function defined in one file may freely call one defined in a
   later file, as long as the call happens during a render.
   ============================================================ */

/* ============================================================
   Charts — plain SVG (§6)
   ============================================================ */
/* The categorical spectrum (§6), not a grey ramp.  Slot 1 is --accent, so the
   promoted series follows the brand; slots 2–8 are fixed hues that deliberately
   avoid green/amber/red (status colour is reserved, §0.5). */
const RAMP = ['--c1','--c2','--c3','--c4','--c5','--c6','--c7','--c8'];
/* Neutral, for a comparison baseline or an "all other" rollup — never a key. */
const NEUTRAL = '--g5';

/* Colour follows the entity (§2): a vendor, cloud provider, product or AI
   model keeps one fixed colour everywhere colour is the key.  Products in
   particular now get distinct slots wherever they are listed — they used to
   share one hue because bar lists were single-colour by rule. */
const ENTITY = {
  /* cloud providers */
  'AWS':'--c1', 'Amazon Web Services':'--c1',
  'Microsoft Azure':'--c2', 'Azure':'--c2', 'Google Cloud':'--c4',
  /* products */
  'Product Alpha':'--c1', 'Product Beta':'--c2', 'Product Gamma':'--c3',
  'Product Delta':'--c4', 'Product Epsilon':'--c5',
  'Shared services':'--c6', 'Shared platform':'--c6', 'Internal productivity':'--c7',
  'Internal IT':'--c7',
  /* AI providers and models */
  'OpenAI':'--c1', 'Microsoft 365 Copilot':'--c2', 'Anthropic':'--c3',
  'Google Gemini':'--c4', 'Azure OpenAI':'--c5', 'Perplexity':'--c6',
  'GitHub Copilot':'--c7',
  'All other vendors':'--c-other'
};
/* Entity -> colour.  Rollup rows carry their own count ("All other vendors (26)")
   and that count changes with the dataset, so they are matched by shape rather
   than listed — a rollup is never a colour key, it takes the neutral (§6). */
const ec = k => ENTITY[k] || (/^All other/.test(k||'') ? '--c-other' : null);

/* Unique gradient / pattern ids — several charts share one page. */
let gradUid = 0;
/* A diagonal-hatch <pattern>, the SVG twin of the CSS --hatch utility.  This is
   the reference set's signature texture (§6): it separates series without
   spending a second colour, which also makes it colour-blind safe. */
function hatchDef(colorVar,kind){
  const id = 'hx'+(++gradUid);
  const tpl = (typeof HATCH!=='undefined' && HATCH[kind||'template']) || null;
  if(!tpl) return {id:null,def:''};
  return {id, def: tpl.replace(/\{ID\}/g,id).replace(/\{COLOR\}/g,colorVar).replace(/\{OPACITY\}/g,'.5')};
}

/* ---------- hover / focus targets (see tooltip.js) ----------
   Every plot here was inert: a 1.75px stroke and a 2.4px dot are not things a
   pointer can find, so the charts read as pictures of data rather than as data.
   The target is the whole COLUMN, full plot height — anywhere in a month
   answers for that month — and it is emitted LAST so it sits over the paint.

   A chart's only job is to say WHAT is under the cursor; CHARTTIP owns how that
   reads.  `marks` are the crosshair and point dots for the answering column,
   and they ride inside the same <g> so the highlight is pure CSS with no
   per-frame JS and no state that can fall out of step with the panel.

   `fx-still` is motion.js's opt-out, and it is load-bearing rather than
   cosmetic: its entrance animation grows every <rect> in a plot from scaleY(0),
   so for the first half-second the area a hover is tested against would not be
   the area it looks like.  motion.js also infers "paints nothing" from computed
   style, but a band is fill:--ink at fill-opacity 0 — painted, just invisible —
   so it has to say so itself. */
const ctCol = (x,y,w,h,payload,marks='') =>
  `<g class="ct-col"><rect class="ct-band fx-still" x="${x}" y="${y}" width="${w}" height="${h}" ${CHARTTIP.attrs(payload)}/>${marks}</g>`;
const ctGuide = (x,y1,y2) => `<line class="ct-mk ct-guide" x1="${x}" x2="${x}" y1="${y1}" y2="${y2}"/>`;
const ctDot = (x,y,c) =>
  `<circle class="ct-mk" cx="${x}" cy="${y}" r="4" fill="var(--surface)" stroke="var(${c})" stroke-width="2"/>`;
/* An outline rather than a dot, where the mark for "this one" is a bar. */
const ctRing = (x,y,w,h) =>
  `<rect class="ct-mk fx-still" x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="3"
     fill="none" stroke="var(--ink)" stroke-opacity=".32" stroke-width="1.5"/>`;

function lineChart(series, labels, o={}){
  /* Taller by default than v3.1's 210.  Grid rows square off at the tallest card
     in the row, so a chart drawn short leaves a visible void under itself in a
     card sized by its neighbour. */
  const W=o.w||680, H=o.h||244, L=44, R=12, Tp=12, B=24;
  const all = series.flatMap(s=>s.values).filter(v=>v!==null&&v!==undefined);
  if(!all.length) return emptyState('No data in this period','Widen the period filter to see a trend.');
  const max = o.max || Math.ceil(Math.max(...all)*1.12/10)*10, min=0;
  const x = i => L + i*((W-L-R)/(labels.length-1));
  const y = v => Tp + (H-Tp-B)*(1-(v-min)/(max-min));
  const ticks=[0,.25,.5,.75,1].map(t=>min+(max-min)*t);
  /* Gradient area fill (§6): series colour at 28% under the line, fading to
     nothing at the baseline.  28 rather than 35 because slot 1 is a warm hue —
     orange at 35% over a tall plot area stops being a fill and becomes the
     subject. */
  let defs='';
  series.forEach(s=>{
    if(!s.area) return;
    s.grad = 'fill'+(++gradUid);
    defs+=`<linearGradient id="${s.grad}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(${s.color});stop-opacity:.28"/>
      <stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`;
  });
  /* Painted in three passes so the hairline grid still reads through the fill. */
  let areas='', g='';
  series.forEach(s=>{
    if(!s.area) return;
    const pts = s.values.map((v,i)=>v===null||v===undefined?null:[x(i),y(v)]).filter(Boolean);
    if(pts.length<2) return;
    const d = smoothPath(pts);
    areas+=`<path d="${d} L${pts[pts.length-1][0]} ${y(0)} L${pts[0][0]} ${y(0)} Z" fill="url(#${s.grad})"/>`;
  });
  ticks.forEach(t=>{g+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}"/>
    <text class="axis" x="${L-8}" y="${y(t)+3}" text-anchor="end">${o.fmt?o.fmt(t):'$'+Math.round(t)+'K'}</text>`});
  labels.forEach((l,i)=>{g+=`<text class="axis" x="${x(i)}" y="${H-8}" text-anchor="middle">${l}</text>`});
  series.forEach(s=>{
    const pts = s.values.map((v,i)=>v===null||v===undefined?null:[x(i),y(v)]).filter(Boolean);
    if(!pts.length) return;
    /* ROUND 16: the same curve as the sparklines — see smoothPath().  The dots stay
       exactly where they were, so the chart still says which point is a month and
       which part is the line between two of them. */
    const d = smoothPath(pts);
    g+=`<path d="${d}" fill="none" stroke="var(${s.color})" stroke-width="${s.w||1.75}" ${s.dash?`stroke-dasharray="4 3"`:''} stroke-linejoin="round"/>`;
    if(s.dots) pts.forEach(p=>g+=`<circle cx="${p[0]}" cy="${p[1]}" r="2.4" fill="var(--surface)" stroke="var(${s.color})" stroke-width="1.5"/>`);
  });
  /* One band per x-index, half a step either side of the point.  A trend chart
     with three lines is the case that most needed this: reading "actual against
     plan against forecast for March" off three crossing strokes was guesswork,
     and the panel lists all three against one label. */
  const step = (W-L-R)/Math.max(1,labels.length-1);
  let hit='';
  labels.forEach((l,i)=>{
    const rows = series.map(s=>{
      const v = s.values[i];
      return (v===null||v===undefined) ? null
        : {n:s.name, v:(o.fmt?String(o.fmt(v)):moneyK(v)), c:s.color};
    }).filter(Boolean);
    if(!rows.length) return;
    const bx = Math.max(L, x(i)-step/2), bw = Math.min(W-R, x(i)+step/2) - bx;
    const marks = ctGuide(x(i),Tp,H-B) + series.map(s=>{
      const v = s.values[i];
      return (v===null||v===undefined) ? '' : ctDot(x(i),y(v),s.color);
    }).join('');
    hit += ctCol(bx,Tp,bw,H-Tp-B,{t:l,r:rows},marks);
  });
  return `<svg viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${areas}${g}${hit}</svg>
  <div class="legend">${series.map(s=>`<div><i style="background:var(${s.color});${s.dash?'height:2px;border-radius:0':''}"></i>${s.name}</div>`).join('')}</div>`;
}

/* ---- monotone cubic interpolation (Fritsch-Carlson, 1980) ----
   Turns a run of points into a smooth SVG path that never overshoots them.

   The naive smoothing everyone reaches for first — Catmull-Rom, or a cardinal spline
   at some tension — sets each point's tangent from its two NEIGHBOURS, which means a
   local peak gets a tangent that carries the curve past it.  On a chart with a y-axis
   that reads as a soft drawing; on a 76px sparkline with no axis at all it reads as a
   value, and the value is invented.  Fritsch-Carlson adds one step: where the
   secants either side of a point differ in sign the tangent is ZEROED (that point is
   a genuine turn), and otherwise the tangent is clamped to three times the smaller
   secant.  The result is guaranteed monotone between consecutive points, so every
   high and low the eye finds is a month the dataset actually holds.

   Emitted as cubic beziers with the control points at a third of the interval, which
   is the standard Hermite-to-Bezier conversion for evenly spaced x. */
function smoothPath(xy){
  const n = xy.length;
  if(n < 2) return '';
  if(n === 2) return `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)} L${xy[1][0].toFixed(1)} ${xy[1][1].toFixed(1)}`;
  /* Secants first, then tangents clamped against them. */
  const dx = [], dy = [], sec = [];
  for(let i=0;i<n-1;i++){
    dx[i] = xy[i+1][0] - xy[i][0];
    dy[i] = xy[i+1][1] - xy[i][1];
    sec[i] = dx[i] ? dy[i]/dx[i] : 0;
  }
  const m = new Array(n);
  m[0] = sec[0];
  m[n-1] = sec[n-2];
  for(let i=1;i<n-1;i++){
    /* A sign change means i is a peak or a trough: a flat tangent is what stops the
       curve carrying past it. */
    m[i] = (sec[i-1]*sec[i] <= 0) ? 0 : (sec[i-1]+sec[i])/2;
  }
  for(let i=0;i<n-1;i++){
    if(sec[i] === 0){ m[i] = 0; m[i+1] = 0; continue; }
    const a = m[i]/sec[i], b = m[i+1]/sec[i], h = Math.hypot(a,b);
    if(h > 3){ m[i] = 3*a/h*sec[i]; m[i+1] = 3*b/h*sec[i]; }
  }
  let d = `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`;
  for(let i=0;i<n-1;i++){
    const t = dx[i]/3;
    d += ` C${(xy[i][0]+t).toFixed(1)} ${(xy[i][1]+m[i]*t).toFixed(1)}`
       + ` ${(xy[i+1][0]-t).toFixed(1)} ${(xy[i+1][1]-m[i+1]*t).toFixed(1)}`
       + ` ${xy[i+1][0].toFixed(1)} ${xy[i+1][1].toFixed(1)}`;
  }
  return d;
}

/* ---- the KPI sparkline (§7, round 14) ----
   "Instead of only showing selected months, show month-on-month trends for each KPI
   tile, in a small area rather than a full-size graph."

   INLINE, beside the figure rather than under it, so a tile costs no more height
   than it did — which is what let the trend land on every tile at once instead of
   on the four that could afford the room.

   IT DRAWS ONLY THE MONTHS THE FIGURE WAS COMPUTED FROM.  deriveView() masks every
   monthly series to the active period, so narrowing to Q1 leaves three points here
   and a figure summed from the same three.  A first version drew all twelve with the
   unselected ones dimmed, for context; it was wrong in the one way this feature
   cannot afford — the tile then showed a year of movement above a quarter's number,
   which is the exact complaint that started this round.

   GREY, NOT ACCENT.  The accent budget on a board screen is one object and the
   period pill holds it (§0.3), and a rising line in green or a falling one in red
   would make sixty tiny charts into sixty status signals — the fault that took the
   icon tiles' colour away in v3.3.

   `cumulative` USED to accumulate a flow before drawing it — see round 15 below,
   which reverses that.  It is still accepted, and now ignored, because ~20 call
   sites pass it and the flow/stock distinction it names is still real everywhere
   else (SCHEMA.md, core.js). */
/* ---- round 15: DRAWN HEAVIER, AND DRAWN MONTH BY MONTH ----
   "The sparklines are currently very small and barely noticeable.  I would like
   them to appear more visually weighted — thicker and more prominent."

   Three numbers moved and one deliberately did not.  The box went 64x22 to 76x32,
   the stroke 1.4 to 2.6 and the end dot 1.9 to 2.6; the COLOUR is unchanged.  The
   dashboard the request came with draws its lines in that product's own blue, and
   that is the one part of it we cannot copy — the accent budget on a board screen
   is a single object and the period pill holds it (§0.3), so four blue lines per
   screen would be the loudest thing on the board and would say nothing.  Weight is
   the honest way to make a grey line carry: at 2.6px #A2AAB8 reads from across a
   room, and it still cannot be mistaken for a status signal.

   Width grew least because width is the dimension the tile cannot spare — at
   1280px the tightest figure leaves ~18px of slack beside the plot.  Height is
   free (the row is as tall as the figure) and stroke is free, which is why the
   prominence comes from those two.

   THE CUMULATIVE LINE IS GONE, WHICH REVERSES ROUND 14.  Making the stroke heavier
   is what made the real fault visible: a running total of positive months can only
   ever ascend, so two thirds of the board was drawing the same near-straight
   diagonal, and a shape that is identical on sixty tiles carries no information at
   all.  Worse, it was not what was asked for either time — "show MONTH-ON-MONTH
   trends for each KPI tile" is a request for the movement between months, and a
   cumulative curve is precisely the transform that hides it.

   Round 14's argument for accumulating was that a tile reading "Realised Savings
   $96K" is a year-to-date total, so a line ending at $9K sits oddly beside it.  That
   is a real objection and it is answered rather than ignored: a sparkline has no
   axis and never claimed its last point equals the figure — that is the convention
   everywhere the form is used — and this one answers a hover with the month and its
   own value, so the reader who wonders is one pointer-move from the truth.  A shape
   nobody can read is a worse trade than a scale nobody stated.

   THE AXIS NO LONGER STARTS AT ZERO, for the same reason.  Monthly spend wobbles
   around its own mean, and anchoring the floor at zero compresses that wobble into a
   flat line near the top of the box.  The range is now the series' own, with one
   guard: a series whose whole spread is under 12% of its mean is drawn FLAT rather
   than stretched to fill the box, so a steady month is not amplified into drama.
   Pass `zero:true` to force the old behaviour; nothing does yet. */
/* ---- round 16: CURVED, AND IN THE THEME COLOUR ----
   "They feel a bit like sharp corners, and they are all grey irrelevant to whatever
   theme colour we selected."

   COLOUR.  The line is `--c1` now, which IS `--accent` under the default and Blue
   presets and `--g1` under Mono, so it follows the theme by construction rather than
   by a second lookup.  This reverses 18.3's "grey, never accent", and the reversal is
   the correct reading of the rule rather than an exception to it: §0.3 governs
   full-strength accent CHROME — one pill, one button — and this is DATA INK, which
   has worn the `--c1…--c8` spectrum on every donut, bar and line chart in the product
   since v3.0.  The fault the grey rule was actually protecting against was a line
   turning GREEN when it rose and RED when it fell, which would make sixty tiny plots
   into sixty status signals.  One colour for all of them cannot signal anything, so
   that fault is not reachable from here.  The area fill stays faint (.22 → 0) so four
   tiles do not become four coloured blocks, and the end dot stays `--ink`: it marks
   the latest reading, and a dot in the line's own colour disappears into the line.

   CURVE.  Monotone cubic (Fritsch–Carlson), NOT a Catmull-Rom or a cardinal spline.
   That choice is the whole of the honesty argument: an ordinary smoothing spline
   OVERSHOOTS between points, so a series running 30 → 44 → 41 bulges above 44 and the
   plot shows a month that did not happen.  Monotone interpolation clamps each
   tangent to the neighbouring slopes, so the curve can never rise above a local
   maximum or fall below a local minimum — every peak in the drawing is a month in the
   data.  It is worth the twenty lines precisely because this is the one chart in the
   product with no axis to check it against. */
function sparkline(values, o={}){
  if(!Array.isArray(values)) return '';
  const W = o.w||76, H = o.h||32, P = 3.5;
  /* Index is kept with the value so a hover can name the right month after the
     nulls are dropped. */
  let pts = values.map((v,i)=>({v,i})).filter(p=>p.v!==null && p.v!==undefined && !Number.isNaN(p.v));
  if(!pts.length) return '';
  const vals = pts.map(p=>p.v);
  let hi = Math.max(...vals), lo = Math.min(...vals, o.zero===true?0:Math.min(...vals));
  /* The flatness guard.  Without it a series running 30.1, 30.4, 30.2 fills the box
     top to bottom and reads as violent movement; with it, the same series draws as
     the flat line it is.  Measured against the MEAN rather than a fixed dollar
     amount, because these tiles carry $K, percentages, seat counts and gigabytes. */
  const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
  const floor = Math.abs(mean)*0.12;
  if(hi-lo < floor){ const mid=(hi+lo)/2; hi = mid+floor/2; lo = mid-floor/2; }
  /* A flat series still has to draw ON the tile rather than through its edge, so a
     zero range parks the line halfway up instead of dividing by nothing. */
  const span = (hi-lo) || 1;
  const x = n => pts.length<2 ? W/2 : P + n*((W-P*2)/(pts.length-1));
  const y = v => hi===lo ? H/2 : P + (H-P*2)*(1-(v-lo)/span);
  const xy = pts.map((p,n)=>[x(n), y(p.v)]);
  const col = o.color || '--c1';

  /* One point is a reading, not a trend: it gets the end dot and no stroke, which
     is what a ten-week-old workspace on a one-month period shows. */
  let g = '';
  if(xy.length>1){
    const d = smoothPath(xy);
    if(o.area!==false){
      const id = 'sk'+(++gradUid);
      g += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(${col});stop-opacity:.22"/>
        <stop offset="1" style="stop-color:var(${col});stop-opacity:0"/></linearGradient></defs>`
        + `<path d="${d} L${xy[xy.length-1][0].toFixed(1)} ${H} L${xy[0][0].toFixed(1)} ${H} Z" fill="url(#${id})"/>`;
    }
    g += `<path d="${d}" fill="none" stroke="var(${col})" stroke-width="2.6"
            stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  const last = xy[xy.length-1];
  g += `<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.6" fill="var(--ink)"/>`;

  /* Answers a hover like every other plot (§6) — which is what earns a 64px line
     the right to be on the board at all.  At ~5px a month it reads as a shape; the
     readout is where the values are, so the shape never has to be guessed at. */
  const labels = o.labels || [];
  const fmt = o.fmt || (v=>moneyK(v));
  const step = pts.length<2 ? W : (W-P*2)/(pts.length-1);
  let hit = '';
  pts.forEach((p,n)=>{
    const bx = Math.max(0, x(n)-step/2), bw = Math.min(W, x(n)+step/2) - bx;
    hit += ctCol(bx, 0, bw, H,
      {t:(labels[p.i]||('Month '+(p.i+1))), r:[{n:o.name||'Value', v:String(fmt(p.v)), c:col}]},
      ctDot(x(n), y(p.v), col));
  });
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${(o.name||'Trend')}, ${pts.length} months">${g}${hit}</svg>`;
}

function stackedBars(labels, series, o={}){
  const W=o.w||680,H=o.h||244,L=44,R=12,Tp=12,B=24;
  const totals = labels.map((_,i)=>series.reduce((s,x)=>s+(x.values[i]||0),0));
  /* `!totals.length` first.  Math.max() of NOTHING is -Infinity, which is
     truthy, so a series with no columns at all sailed past this guard and
     drew an axis labelled $-InfinityK. */
  if(!totals.length || !Math.max(...totals))
    return emptyState('No data in this period','Widen the period filter.');
  const max = Math.ceil(Math.max(...totals)*1.12/10)*10;
  const bw = (W-L-R)/labels.length*0.62;
  const cx = i => L + (i+0.5)*((W-L-R)/labels.length);
  const y = v => Tp+(H-Tp-B)*(1-v/max);
  /* Bars carry a vertical gradient — a shade lighter at the top — and the
     series after the first is hatched over its own colour, so the stack reads
     apart even in the mono palette or in print (§6). */
  let defs='';
  series.forEach((s,si)=>{
    s.grad='bar'+(++gradUid);
    defs+=`<linearGradient id="${s.grad}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:color-mix(in srgb, var(${s.color}) 74%, #fff)"/>
      <stop offset="1" style="stop-color:var(${s.color})"/></linearGradient>`;
    if(si%2===1){ const h = hatchDef(s.color,'template'); s.hatch = h.id; defs += h.def; }
  });
  let g='';
  [0,.25,.5,.75,1].forEach(t=>{const v=max*t;g+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="axis" x="${L-8}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}K</text>`});
  labels.forEach((l,i)=>{
    let acc=0;
    series.forEach(s=>{
      const v=s.values[i]||0; const h=(H-Tp-B)*v/max;
      if(v){
        g+=`<rect x="${cx(i)-bw/2}" y="${y(acc+v)}" width="${bw}" height="${h}" fill="url(#${s.grad})"/>`;
        if(s.hatch) g+=`<rect x="${cx(i)-bw/2}" y="${y(acc+v)}" width="${bw}" height="${h}" fill="url(#${s.hatch})"/>`;
      }
      acc+=v;
    });
    g+=`<text class="axis" x="${cx(i)}" y="${H-8}" text-anchor="middle">${l}</text>`;
  });
  /* A band's share of its own month is the thing a stack is actually asked —
     "how much of March was Azure" — and it cannot be read off the plot at all,
     so every row carries it and the footer carries the column total. */
  const colw = (W-L-R)/labels.length;
  let hit='';
  labels.forEach((l,i)=>{
    const tot = totals[i];
    if(!tot) return;
    const rows = series.map(s=>{
      const v = s.values[i]||0;
      return v ? {n:s.name, v:moneyK(v), c:s.color, d:share(v,tot)} : null;
    }).filter(Boolean);
    if(!rows.length) return;
    hit += ctCol(L+i*colw, Tp, colw, H-Tp-B,
      {t:l, r:rows, f:{n:'Total', v:moneyK(tot)}},
      ctRing(cx(i)-bw/2, y(tot), bw, (H-Tp-B)*tot/max));
  });
  return `<svg viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${g}${hit}</svg>
  <div class="legend">${series.map(s=>`<div><i style="background:var(${s.color})"></i>${s.name}</div>`).join('')}</div>`;
}

/* ---- RANKED ORDER (§6) ----
   "Any plot, table, or numeric display should be ordered in descending order… if a
   tile shows spend by vendor, the entities within it should be listed from highest
   to lowest."

   Applied HERE, inside the three functions that draw ranked things, rather than at
   the ~40 call sites that feed them.  Two reasons, and they are the same two that
   put the table's sorting on the rendered cells: forty edits are forty chances for
   one list to be left in whatever order its dataset happened to hold, and a dataset
   loaded from a file at runtime cannot be edited at a call site at all.  Sorting at
   the point of drawing means every ranked list in the product obeys the rule, and a
   scenario author cannot break it by accident.

   `tail:true` pins a row to the bottom.  One list — the overview's vendors — ends
   in a rolled-up "All other vendors (26)" row, and that row is a REMAINDER rather
   than a rank: if the tail happened to outweigh the eighth vendor it would sort
   above it and the list would read as though "all other vendors" were a vendor.

   STABLE, because Array.prototype.sort is only guaranteed stable for the comparator
   returning 0 — equal values keep their authored order, which is what stops two
   $0K rows from swapping places between renders of the same screen.

   NOT applied to lineChart, stackedBars, bandChart or waterfall: those four are
   ordered by time or by the steps of an equation, and "descending" there would mean
   running the year backwards or reordering the terms of a sum. */
const ranked = items => (items||[]).slice().sort((a,b)=>
  (a.tail?1:0) - (b.tail?1:0) || (b.v||0) - (a.v||0));

/* Donut (§6): centre total in the hero-number face, legend as a mini-table. */
function donut(items,o={}){
  /* Ranked, so the biggest slice starts at twelve o'clock and the ring reads
     clockwise by size.  The legend beside it runs the identical comparator (see
     legend() in components.js) — if only one of the two sorted, the third row of
     the key would name the fourth slice of the ring. */
  items = ranked(items);
  const total = items.reduce((s,i)=>s+i.v,0);
  if(!total) return emptyState('Nothing to break down','No spend falls inside the current filters.');
  const S=o.size||168, r=S/2-4, ir=o.ir||r*0.62, cx=S/2, cy=S/2;
  let a=-Math.PI/2, g='';
  items.forEach((it,idx)=>{
    const sw = it.v/total*Math.PI*2, b=a+sw;
    const p = (rad,ang)=>[cx+rad*Math.cos(ang), cy+rad*Math.sin(ang)];
    const [x1,y1]=p(r,a),[x2,y2]=p(r,b),[x3,y3]=p(ir,b),[x4,y4]=p(ir,a);
    const col = it.g||ec(it.k)||RAMP[idx%8];
    /* The slice is its own hit target — a ring segment is already generous, so
       there is nothing to gain from an invisible wedge on top of it, and one
       fewer node per slice keeps the legend and the plot reading as one thing.
       Share charts answer "what is this, how much, what fraction". */
    g+=`<path class="ct-slice" d="M${x1} ${y1} A${r} ${r} 0 ${sw>Math.PI?1:0} 1 ${x2} ${y2} L${x3} ${y3} A${ir} ${ir} 0 ${sw>Math.PI?1:0} 0 ${x4} ${y4} Z"
      fill="var(${col})" stroke="var(--surface)" stroke-width="1.5"
      ${CHARTTIP.attrs({t:it.k, c:col, v:moneyK(it.v),
        d:share(it.v,total)+' of '+money(total)+' '+(o.label||'total')})}/>`;
    a=b;
  });
  g+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" class="donut-total">${money(total)}</text>
      <text x="${cx}" y="${cy+11}" text-anchor="middle" class="axis">${o.label||'YTD'}</text>`;
  return `<svg class="ct-donut" viewBox="0 0 ${S} ${S}" style="width:${S}px;margin:0 auto">${g}</svg>`;
}

/* Horizontal breakdown bars.
   Where every row names a known entity — products, cloud providers, vendors —
   the list takes the ENTITY colours and shows a brand mark or a swatch, because
   colour follows the entity (§2).  Products used to share one hue here, which
   is exactly the "everything is the same colour" fault.  Where rows are plain
   labels (services, savings sources) the list stays single-hue and gradients
   from soft accent to full accent, with `o.highlight` promoting one row. */
function hbars(items,o={}){
  if(!items.length) return emptyState('Nothing to rank','No rows fall inside the current filters.');
  /* Highest first.  This is the list the instruction names by example, and it is
     also the list `o.highlight` indexes into — so the sort has to happen before the
     index is read, which is why it is the first statement in the function and not
     folded into the map below. */
  items = ranked(items);
  const max = Math.max(...items.map(i=>i.v)) || 1;
  const total = items.reduce((s,i)=>s+i.v,0);
  const entityMode = o.entity!==false && items.every(i=>i.g||ec(i.k));
  const marks = o.marks!==false && items.some(i=>hasBrand(i.k));
  const fill = (i,idx) =>
    (i.g||ec(i.k)) && entityMode ? `background:var(${i.g||ec(i.k)})`
      : o.highlight===idx
        ? `background:linear-gradient(90deg,var(--accent),var(--accent-strong))`
        : `background:linear-gradient(90deg,var(--accent-soft),var(--accent))`;
  /* The whole ROW is the hit target, not the bar inside it — an 8px bar clipped
     to a fraction of the track is the narrowest thing on the screen, and a row
     whose name is ellipsised is exactly the row you want a readout for.  Rank is
     the one fact the list shows implicitly and never states. */
  const tip = (i,idx) => CHARTTIP.attrs({
    t:i.k, c:((i.g||ec(i.k)) && entityMode) ? (i.g||ec(i.k)) : '--accent',
    v:moneyK(i.v), d:share(i.v,total)+' of '+money(total),
    f:{n:'Rank', v:(idx+1)+' of '+items.length}
  });
  return rowList(items.map((i,idx)=>`
    <div class="row" ${tip(i,idx)}>
      <div class="grow">
        <div class="t">${marks?entityMark(i.k):(entityMode?swatch(i.k):'')}<span>${i.k}</span></div>
        <div class="bar"><i class="${o.highlight===idx?'':'hatched'}" style="width:${i.v/max*100}%;${fill(i,idx)}"></i></div>
      </div>
      <div class="v">${moneyK(i.v)}<div class="d" style="font-weight:400">${share(i.v,total)}</div></div>
    </div>`), o.noun || 'rows');
}

function waterfall(steps,o={}){
  const W=o.w||680,H=o.h||252,L=48,R=12,Tp=14,B=52;
  let run=0; const pts=[];
  steps.forEach(s=>{
    if(s.type==='base'){pts.push({k:s.k,from:0,to:s.v,type:'base'});run=s.v;}
    else if(s.type==='total'){pts.push({k:s.k,from:0,to:s.v,type:'total'});}
    else {pts.push({k:s.k,from:run,to:run+s.v,type:s.type,delta:s.v});run+=s.v;}
  });
  /* ZERO-BASED, like every other chart here.
     A broken axis was built for this chart and reverted on sight: when a variance
     walk opens at ~$1.5M and closes at ~$1.62M, starting the axis below the walk
     does make each $30-90K step legible — but it also turns two totals into
     truncated columns, and a bar chart whose bars do not start at zero has to be
     read carefully rather than glanced at.  On a screen a client reads in a
     minute, glanceable and honest beats legible and qualified.
     The cost is accepted and known: the anchors dominate, the steps are small,
     and the card carries some slack because extra height goes into the empty
     middle rather than into the bars.  Don't reintroduce the break without
     asking — it has been tried. */
  /* A walk of zeros has a maximum of zero, and every y() below divides by
     it — NaN coordinates draw nothing at all, so the card came out blank
     rather than saying it had nothing to show. */
  const peak = pts.length ? Math.max(...pts.map(p=>Math.max(p.from,p.to))) : 0;
  if(peak <= 0) return emptyState('Nothing to reconcile yet',
    'A variance walk needs a closed month on both sides of it.');
  const max = Math.ceil(peak*1.06/50)*50;
  const bw=(W-L-R)/pts.length*0.6, cx=i=>L+(i+0.5)*((W-L-R)/pts.length);
  const y=v=>Tp+(H-Tp-B)*(1-v/max);
  let g='';
  [0,.5,1].forEach(t=>{const v=max*t;g+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="axis" x="${L-8}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}K</text>`});
  pts.forEach((p,i)=>{
    const top=y(Math.max(p.from,p.to)), h=Math.max(2,Math.abs(y(p.to)-y(p.from)));
    /* Anchors (opening, closing) stay neutral ink so the coloured steps between
       them are what the eye follows; the steps run at full status brightness. */
    const fill = p.type==='base'||p.type==='total'?'var(--g2)':p.type==='up'?'var(--neg)':'var(--pos)';
    g+=`<rect x="${cx(i)-bw/2}" y="${top}" width="${bw}" height="${h}" rx="2" fill="${fill}"/>`;
    if(i<pts.length-1) g+=`<line x1="${cx(i)+bw/2}" x2="${cx(i+1)-bw/2}" y1="${y(p.to)}" y2="${y(p.to)}" stroke="var(--line-2)" stroke-dasharray="2 2"/>`;
    const lab = p.type==='up'||p.type==='down'?(p.delta>0?'+':'−')+Math.abs(p.delta):Math.round(p.to);
    g+=`<text class="axis strong" x="${cx(i)}" y="${top-5}" text-anchor="middle">${lab}</text>`;
    const words=p.k.split(' ');
    g+=`<text class="axis" x="${cx(i)}" y="${H-B+16}" text-anchor="middle">${words[0]}</text>`;
    if(words[1]) g+=`<text class="axis" x="${cx(i)}" y="${H-B+27}" text-anchor="middle">${words.slice(1).join(' ')}</text>`;
  });
  /* The zero-based axis is the reason this chart needs a readout most: the
     anchors dominate and every step between them is a sliver, so the number the
     step is worth is legible in the panel long before it is legible in the bar.
     The band runs the full height INCLUDING the two label lines, because on a
     walk the label is what you aim at. */
  const colw=(W-L-R)/pts.length;
  let hit='';
  pts.forEach((p,i)=>{
    const top=y(Math.max(p.from,p.to)), h=Math.max(2,Math.abs(y(p.to)-y(p.from)));
    const rows = (p.type==='base'||p.type==='total')
      ? [{n:'Total', v:money(p.to), c:'--g2'}]
      : [{n:p.delta>0?'Adds':'Returns', v:signed(p.delta), c:p.type==='up'?'--neg':'--pos'},
         {n:'Running total', v:money(p.to)}];
    hit += ctCol(L+i*colw, Tp, colw, H-Tp, {t:p.k, r:rows}, ctRing(cx(i)-bw/2, top, bw, h));
  });
  return `<svg viewBox="0 0 ${W} ${H}">${g}${hit}</svg>`;
}

function bandChart(o){
  const W=o.w||680,H=o.h||268,L=48,R=14,Tp=14,B=24;
  const labels=D.meta.months.concat(['Aug','Sep','Oct']);
  const closed=D.meta.closed;
  const act=D.trend.actual.slice(0,closed).concat(new Array(15-closed).fill(null));
  const last=D.trend.actual.filter(v=>v!==null).slice(-1)[0]||0;
  /* new Array(-1) throws RangeError, and an exception here killed the whole
     render — sidebar and all — rather than one card.  A forecast needs a
     closed month to project from, so say so instead. */
  if(closed < 1) return emptyState('No forecast yet',
    'A projection needs at least one closed month to run from.');
  const pad=n=>new Array(closed-1).fill(null).concat(n);
  const base=pad([last,Math.round(last*.99),Math.round(last*1.01),Math.round(last*1.04),Math.round(last*1.06)]);
  const up  =pad([last,Math.round(last*1.04),Math.round(last*1.09),Math.round(last*1.14),Math.round(last*1.19)]);
  const dn  =pad([last,Math.round(last*.94),Math.round(last*.93),Math.round(last*.91),Math.round(last*.90)]);
  const max = Math.ceil(Math.max(...up.filter(v=>v!==null),...act.filter(v=>v!==null))*1.15/20)*20;
  const x=i=>L+i*((W-L-R)/(labels.length-1)), y=v=>Tp+(H-Tp-B)*(1-v/max);
  let g='';
  [0,.25,.5,.75,1].forEach(t=>{const v=max*t;g+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/>
    <text class="axis" x="${L-8}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}K</text>`});
  labels.forEach((l,i)=>g+=`<text class="axis" x="${x(i)}" y="${H-8}" text-anchor="middle">${l}</text>`);
  const seg=arr=>arr.map((v,i)=>v===null||v===undefined?null:[x(i),y(v)]).filter(Boolean);
  const U=seg(up),Dn=seg(dn);
  /* The confidence band is the accent at low alpha — it belongs to the actual
     series it brackets, so it takes that series' hue rather than a grey. */
  /* Both edges take the same curve as the lines they bracket (round 16) — a
     straight-edged band around two curved strokes would pinch away from them at
     every turn.  The lower edge is drawn in reverse and its leading `M` becomes an
     `L`, which is what joins the two edges into one closed region. */
  if(U.length&&Dn.length)
    g+=`<path d="${smoothPath(U)} ${smoothPath(Dn.slice().reverse()).replace(/^M/,'L')} Z" fill="var(--c1)" opacity=".14"/>`;
  /* Dashed ghost line for the comparison series, neutral against the actual. */
  const line=(arr,col,dash)=>{const s=seg(arr);if(!s.length)return;
    g+=`<path d="${smoothPath(s)}" fill="none" stroke="var(${col})" stroke-width="1.75" ${dash?'stroke-dasharray="4 3"':''}/>`};
  line(base,'--g4',true); line(act,'--c1',false);
  g+=`<line x1="${x(closed-1)}" x2="${x(closed-1)}" y1="${Tp}" y2="${H-B}" stroke="var(--line-2)"/>
      <text class="axis" x="${x(closed-1)+5}" y="${Tp+9}">forecast →</text>`;
  /* The band's width IS the message on this chart ("±4% in July, ±14% by
     October"), and a shaded region has no readable edge — so the column states
     the two bounds as a figure rather than leaving them to be eyeballed. */
  const step=(W-L-R)/Math.max(1,labels.length-1);
  let hit='';
  labels.forEach((l,i)=>{
    const rows=[];
    if(act[i]!==null&&act[i]!==undefined) rows.push({n:'Actual',v:moneyK(act[i]),c:'--c1'});
    if(base[i]!==null&&base[i]!==undefined) rows.push({n:'Baseline forecast',v:moneyK(base[i]),c:'--g4'});
    if(up[i]!==null&&up[i]!==undefined&&dn[i]!==null&&dn[i]!==undefined)
      rows.push({n:'Range',v:moneyK(dn[i])+' – '+moneyK(up[i])});
    if(!rows.length) return;
    const bx=Math.max(L,x(i)-step/2), bw=Math.min(W-R,x(i)+step/2)-bx;
    const marks = ctGuide(x(i),Tp,H-B)
      + (act[i]!==null&&act[i]!==undefined?ctDot(x(i),y(act[i]),'--c1'):'')
      + (base[i]!==null&&base[i]!==undefined?ctDot(x(i),y(base[i]),'--g4'):'');
    hit += ctCol(bx,Tp,bw,H-Tp-B,{t:l,r:rows},marks);
  });
  return `<svg viewBox="0 0 ${W} ${H}">${g}${hit}</svg>
  <div class="legend"><div><i style="background:var(--c1)"></i>Actual</div>
  <div><i style="background:var(--g4);height:2px;border-radius:0"></i>Baseline forecast</div>
  <div><i style="background:var(--c1);opacity:.25"></i>Upper / lower range</div></div>`;
}

function flowDiagram(){
  const stages=[['Technology data sources','12 systems'],['FinOps data platform','Normalise & ingest'],
                ['Allocation & enrichment','Tags, owners, rates'],['Analytics','Trend, unit cost, variance'],
                ['Optimisation','Backlog & savings'],['Persona dashboards','4 audiences']];
  const W=980,H=132,bw=140,gap=(W-stages.length*bw)/(stages.length-1);
  let g='', hit='';
  stages.forEach((s,i)=>{
    const x=i*(bw+gap);
    g+=`<rect x="${x}" y="34" width="${bw}" height="60" rx="6" fill="var(--surface)" stroke="var(--line-2)"/>
        <text class="axis" x="${x+bw/2}" y="52" text-anchor="middle">0${i+1}</text>`;
    const words=s[0].split(' '); const l1=words.slice(0,2).join(' '), l2=words.slice(2).join(' ');
    g+=`<text x="${x+bw/2}" y="70" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--ink)">${l1}</text>
        <text x="${x+bw/2}" y="83" text-anchor="middle" style="font-size:10px;fill:var(--ink-2)">${l2||s[1]}</text>`;
    if(i<stages.length-1) g+=`<path d="M${x+bw+4} 64 L${x+bw+gap-6} 64" stroke="var(--line-2)" stroke-width="1"/>
        <path d="M${x+bw+gap-10} 60.5 L${x+bw+gap-5} 64 L${x+bw+gap-10} 67.5" fill="var(--ink-4)"/>`;
    /* Not a plot, so this gets a readout for one specific reason: a stage whose
       name runs to three words spends the box's second line on the rest of the
       name, and its description ("Tags, owners, rates") is dropped entirely.
       Hovering is where that sentence went. */
    hit+=`<g class="ct-col"><rect class="ct-band fx-still" x="${x}" y="34" width="${bw}" height="60" rx="6"
       ${CHARTTIP.attrs({t:s[0], d:s[1]})}/></g>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}">${g}${hit}</svg>`;
}
