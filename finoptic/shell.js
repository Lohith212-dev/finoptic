/* ============================================================
   Finoptic — shell: icons, sidebar, filters, the reconciliation strip, routing, boot
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
   Navigation, filters, chrome, routing
   ============================================================ */
/* ---- icons (§5) -------------------------------------------------------------
   The set itself is in icons.js: the real Heroicons 24px SOLID set, fetched from
   tailwindlabs/heroicons, one file per glyph, path data untouched.  It used to be
   ~40 hand-drawn stroke glyphs defined right here.  They were consistent with
   each other and with nothing else, and at the 14px they are mostly used at they
   read as sketched: "the current icons do not look great; please fix them."
   Inline rather than an icon font because the mock-up opens by double-click from
   a file:// path with no network, so a CDN webfont is not an option.
   Vendor logos are NOT icons and are not here — they carry their own literal
   colours, so they live in brands.js as BRANDS and render via brandMark(). */
const icon = (name,sm) => ICONS[name]
  ? `<svg class="ic${sm?' sm':''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>` : '';
/* The four group glyphs — the ONLY icons in the sidebar now that the items
   beneath them are plain text. */
const groupIcon = name => (typeof GROUP_ICONS_SOLID!=='undefined' && GROUP_ICONS_SOLID[name])
  ? `<svg class="ic gi" viewBox="0 0 24 24" aria-hidden="true">${GROUP_ICONS_SOLID[name]}</svg>`
  : `<span class="gi"></span>`;
/* Fills the static data-icon / data-logo placeholders in index.html, so a glyph
   and the logo artwork each live in exactly one place. */
function fillChrome(root=document){
  root.querySelectorAll('[data-icon]').forEach(n=>{
    n.innerHTML = icon(n.dataset.icon, n.dataset.size==='sm');
  });
  root.querySelectorAll('[data-logo]').forEach(n=>{
    n.innerHTML = (typeof LOGO!=='undefined' && LOGO[n.dataset.logo]) || '';
  });
}

/* Sidebar structure.  The Overview group holds ONE screen and the View line.
   It used to hold five: Executive Dashboard, then IT financial management,
   Finance, Procurement and Products — the same four names the View dropdown
   directly above them already listed, so the group was the dropdown written out
   twice.  The four are reachable only through the dropdown now, which is what it
   is for: those screens ARE the four lenses.

   A `Dynamic Overview` row was tried here for one round, as an alias resolving to
   the active lens's home.  It existed only to give the rail a second visible
   overview while the lens switch was away on the page head; with the switch back
   in the rail directly below, the row was naming the same destination the line
   under it already names, which is the duplication this group has been trimmed
   for twice before.  Removed.
   Items carry no icon; the group header does. */
const NAV = [
  ['Overview',[['overview','Executive Dashboard']]],
  /* Observability was removed outright, and ITSM moved up to fourth: the group
     now runs from the two biggest lines (cloud, AI) through the two that are
     bought per seat and per ticket, and ends on security. */
  ['Spend',[['cloud','Cloud'],['ai','AI'],['saas','SaaS & Licences'],
            ['itsm','ITSM'],['security','Security']]],
  ['Manage',[['forecast','Budgets & Forecasts'],['allocation','Cost Allocation'],
             ['optimize','Optimisation'],['anomalies','Anomalies'],
             ['alerts','Alerts'],['add','Add A Record'],['team','Team & Access']]],
  /* Getting started sits ABOVE Data model: they are the same chain in opposite
     directions.  Data model explains how a dollar becomes a decision once every
     feed is in; Getting started is that chain told forwards, to a workspace
     where none of them are. */
  ['Reference',[['onboarding','Getting Started'],['sources','Data Model']]]
];

/* The four views, and the screen each one opens on.  `label` is what the View
   dropdown shows; these four screens have no nav row of their own. */
/* `blurb` exists for the View picker's option list.  A bare list of four nouns
   made the reader guess what "Products" would show them; one line of what the
   lens is FOR is the difference between a dropdown and a menu. */
const PERSONA = {
  itfm:{home:'itfm', label:'IT Financial Management', short:'ITFM', focus:['itfm','cloud','ai','allocation','optimize','forecast'],
        blurb:'Unit economics, cloud and AI cost, allocation'},
  finance:{home:'finance', label:'Finance', short:'Finance', focus:['finance','forecast','allocation','anomalies','overview'],
        blurb:'Budget, variance, forecast and accruals'},
  proc:{home:'proc', label:'Procurement', short:'Procurement', focus:['proc','saas','ai','optimize'],
        blurb:'Vendors, contracts, renewals and licences'},
  biz:{home:'product', label:'Products', short:'Products', focus:['product','ai','cloud','alerts'],
        blurb:'Cost per product, per customer, and margin'}
};

/* Screen → title.  The four persona screens are not in NAV any more, so their
   titles come from PERSONA — Export and the state URL both need them. */
const TITLES = {};
NAV.forEach(g=>g[1].forEach(i=>TITLES[i[0]]=i[1]));
Object.keys(PERSONA).forEach(k=>{ TITLES[PERSONA[k].home] = PERSONA[k].label; });
/* A persona screen belongs to Overview, because that is where its View line is —
   which is what keeps the Overview group marked as active while you are on one. */
const groupOf = id => (NAV.find(g=>g[1].some(i=>i[0]===id))||['Overview'])[0];
const personaOf = id => Object.keys(PERSONA).find(k=>PERSONA[k].home===id) || null;

let current = 'overview', persona = 'itfm';
/* Which groups are folded.  EVERYTHING EXCEPT OVERVIEW starts folded: the
   Executive Dashboard is the default screen, so Overview is the only group whose
   contents you are already looking at, and the other three are places you might
   go rather than places you are.  A sidebar that opens with all seventeen items
   showing spends its whole height telling you about screens you did not ask for.
   Overview also has to be the open one because the `View:` line lives on its
   rail — folding it would hide the persona switch behind a click.
   In memory only: a demo shouldn't remember a folded group from an earlier
   session and look broken on open. */
const shutGroups = new Set(NAV.map(g=>g[0]).filter(n=>n!=='Overview'));

/* Sidebar (§8) — grouped tree rail.  Each group is an icon + a sentence-case
   header, larger than its own items, with a collapse caret; the items hang off a
   single faint trunk by rounded elbows (the elbows are CSS, per-item ::before).

   Items are TEXT.  Every one of them used to carry its own glyph as well as the
   group carrying one, which is seventeen icons plus four in a 276px column:
   "everything currently has an icon, which creates visual overload."

   THE `View:` LINE IS BACK, and it sits third in the Overview group, under the two
   rows it governs.  It moved onto the page head for one round and came straight
   back — "revert the persona dropdown change and move it back into the sidebar as
   it was before" — so it is the same SPLIT control it was before that: the name
   opens the lens's home, the caret opens the picker.  That split is not decoration;
   a single button that only opened a menu was the original complaint ("the view
   itself should be clickable"), and making the whole control navigate instead would
   remove the only way to switch.  Large target for the common act, its own target
   for the rare one.

   It is also the ONLY thing in the rail that can show you are on one of the four
   lens screens, since those four have no row of their own — which is why it lights
   with the active wash via personaOf() rather than by an id match. */
function renderNav(){
  const p = PERSONA[persona];
  const viewLine = `<div class="navitem viewline${personaOf(current)?' on':''}">
    <em>View</em>
    <span class="viewpick">
      <button type="button" class="viewpick-go" data-go-view
              title="Open ${p.label}"><b>${p.label}</b></button>
      <button type="button" class="viewpick-more" data-view-menu
              aria-haspopup="listbox" aria-expanded="false"
              title="Switch view" aria-label="Switch view">${icon('caret',true)}</button>
    </span></div>`;
  document.getElementById('navgroups').innerHTML = NAV.map(g=>{
    const items = g[1].map(i=>{
      const on = i[0]===current, focus = p.focus.includes(i[0]);
      return `<button class="navitem${on?' on':''}" data-go="${i[0]}" title="${i[1]}">
        <span class="lbl">${i[1]}</span>${
        focus&&!on?'<span class="focusdot" title="Relevant to this view"></span>':''}</button>`;
    });
    if(g[0]==='Overview') items.push(viewLine);
    const active = groupOf(current)===g[0] || (g[0]==='Overview' && personaOf(current));
    return `<div class="navgroup${shutGroups.has(g[0])?' shut':''}${active?' active':''}">
      <button type="button" data-group="${g[0]}" aria-expanded="${!shutGroups.has(g[0])}" title="${g[0]}">
        ${groupIcon(g[0])}<span>${g[0]}</span><span class="caret">${icon('caret',true)}</span>
      </button>
      <div class="rail">${items.join('')}</div>
    </div>`;
  }).join('');
}

/* ---- filters (§7) ----
   Only the dimensions the current screen can honour are rendered, which is what
   holds the bar to one row.  Each pill is a real dropdown over the values in
   the ACTIVE dataset, so switching scenario changes the options too. */
function renderFilters(){
  const dims = activeDims();
  const wrap = document.getElementById('filters');
  /* A screen may emit no controls row at all — sign-in is the whole window, with
     no filters to offer and no "as of" line to carry. */
  if(!wrap) return;
  if(!dims.length){
    wrap.innerHTML = `<span class="asof">${NO_FILTER_NOTE[current]
      || 'No filters apply on this screen.'}</span>`;
  } else {
    wrap.innerHTML = dims.map(d=>{
      const vals = sel(d), set = d!=='period' && vals.length>0;
      /* "Cloud infrastructure +2" rather than "3 selected".  A count alone makes
         you open the menu to find out what you picked, which defeats the pill. */
      const text = d==='period' ? shortPeriod(F.period)
        : !set ? 'All'
        : vals.length===1 ? vals[0]
        : vals[0]+' +'+(vals.length-1);
      /* PERIOD IS THE PRIMARY CONTROL and is always dressed as one: "the period
         filter is the most important because the entire dashboard updates based
         on the selected period, and users need to be aware of this.  Currently it
         lacks visual emphasis."  It is also the only dimension that can never be
         cleared — every figure on every screen is a figure FOR a span of months —
         so unlike the others it has no unset state to be quiet in, and dressing
         it permanently is honest rather than shouty. */
      return `<span class="chipwrap">
        <button class="chip ${d==='period'
            ? 'primary'+(F.period===CUSTOM_PERIOD||F.period===MONTH_RANGE?' custom':'') : ''} ${set?'set':''}" data-dim="${d}"
                aria-haspopup="listbox" aria-expanded="false">
          ${icon(DIMS[d].icon,true)}
          ${/* The dimension name is dropped when the value already starts with
                it, or the Product pill reads "Product Product Beta". */''}
          ${String(text).indexOf(DIMS[d].label)===0?'':`<em>${DIMS[d].label}</em>`}<b>${text}</b>
          ${set?'<span class="x" data-clear="'+d+'" role="button" aria-label="Clear '+DIMS[d].label+'">×</span>'
               :'<span class="caret">'+icon('caret',true)+'</span>'}
        </button></span>`;
    }).join('') + (liveFilters().length
      ? `<button class="filter-clear" id="clear-filters">Clear ${liveFilters().length}</button>` : '');
  }
  const est = D.estimated ? ' · filtered' : '';
  document.getElementById('asof').textContent = `As of ${D.meta.asOf}${est}`;
}
/* The pill shows the month name as-is for a single month; the full-year
   default and a custom range both resolve to the span they cover. */
const shortPeriod = v => v===CUSTOM_PERIOD
  ? (F.range ? rangeSummary(F.range) : 'Custom')
  : v===MONTH_RANGE ? spanLabel(F.span)
  : v===FULL_YEAR_PERIOD ? monthSpanLabel(fullYearMonths())
  : v;
/* What a custom range actually resolved to.  Months, not dates, because months
   are what it resolved to — see rangeMonths(). */
function rangeSummary(r){
  const ms = rangeMonths(r);
  return ms.length ? monthSpanLabel(ms) : 'Custom';
}

/* ---- the reconciliation strip (§7) ----
   SIX EQUAL LANES — Spend, Budget, Variance, Forecast Year-End, Identified
   Savings, Unallocated — each named by its own label, none ranked above the
   rest.  It used to read as an equation, Spend − Budget = Variance at 28px
   with three smaller stats beside it, but that made three of the six numbers
   the point and the other three a footnote, and the business does not read
   them that way: "treat all six as equally important."  There is no operator
   between any of them any more, and no seam splitting the row into two
   groups — dropping both is what makes "equally important" true rather than
   just stated.

   Returned as a string, not written into a slot in the shell, because head()
   emits it — that is what puts the page title above it (see head()).
   The collapse state lives on <html data-ledger>, so it survives every
   re-render without being tracked here. */
const ledgerMin = () => document.documentElement.getAttribute('data-ledger')==='min';
const ledgerTip = () => ledgerMin()
  ? 'Show the full reconciliation bar' : 'Hide the reconciliation bar';

/* The four tones a lane can take.  Amber is the one status role whose bright
   mark is unreadable as text at any size, so `warn` takes the deeper ink step
   (§2); `neg` is the only one that uses the bright mark, because a variance
   figure is the one place on the strip where red IS the message. */
const LEDGER_TONE = {
  pos:'color:var(--pos-ink)', warn:'color:var(--warn-ink)',
  neg:'color:var(--neg)',     '':''
};

function ledgerStrip(stats){
  /* A WORKSPACE THAT HAS CLOSED NOTHING GETS THE EM-DASH STRIP, not a row of
     zeroes.  Six "$0K"s is the strip stating, in the product's loudest
     component and on every screen, that the company spent nothing and is
     exactly on plan — where the truth is that no month has closed and none of
     the six figures exist yet.  freshLedger() is the same component with the
     figures it cannot know shown as dashes; it was written for the day-one
     preview and this is the same day.  The KPI tiles took the same treatment in
     kpi(), so the strip and the board beneath it agree. */
  if(typeof workspaceEmpty==='function' && workspaceEmpty() && typeof freshLedger==='function')
    return freshLedger(null,stats);
  const varAmt = D.ytdActual - D.ytdBudget;
  /* The standing year-to-date figures, unaffected by whatever narrower span the
     Period pill currently shows — see ytdView() in core.js.  Every lane's
     sub-line is this SAME figure restated with "YTD" rather than a bespoke
     caption, so the six read as one family; where D's own figure already IS
     the full year (the pill's default), the two numbers are identical, which
     is correct rather than a bug. */
  const Y = ytdView();
  const yVarAmt = Y.ytdActual - Y.ytdBudget;
  const cell = (k,v,sub,style='') => `<div class="ledger-cell">
    <span class="ledger-k">${k}</span>
    <span class="ledger-v" style="${style}">${v}</span>
    ${sub?`<span class="ledger-sub">${sub}</span>`:''}</div>`;

  return `<div class="ledger">
    <div class="ledger-stats">
      ${cell('Actual',money(D.ytdActual), money(Y.ytdActual)+' YTD')}
      ${cell('Budget',money(D.ytdBudget), money(Y.ytdBudget)+' YTD')}
      ${cell('Variance',(varAmt>=0?'+':'−')+money(Math.abs(varAmt)),
        (yVarAmt>=0?'+':'−')+money(Math.abs(yVarAmt))+' YTD',
        varAmt>0?'color:var(--neg)':varAmt<0?'color:var(--pos)':'')}
      ${/* PER-SCREEN.  It used to be the same three figures on all sixteen
            screens, which meant the procurement board carried the Executive
            Dashboard's stats.  They are PASSED IN by the screen rather than
            looked up here, and that is the decision worth defending.  Almost
            every one of them mirrors a KPI tile on the same screen — Uncommitted
            Spend, Consolidation Savings, Cost Per Ticket — and those tiles are
            computed from locals in the renderer's own scope (`committed`,
            `consolSave`, `me`, `secTotal`).  A registry here would have had to
            recompute all of it, and the two copies would drift the first time a
            formula changed; there is no way to notice that drift except by
            reading both.  Passing them means the strip and the tile are the SAME
            expression evaluated once, and a harness can assert they still match.
            Screens that pass nothing keep the estate-level three. */''}
      ${(stats && stats.length ? stats : [
        ['Forecast Year-End', money(D.fyForecast), signed(D.fyForecast-D.fyBudget)+' vs budget'],
        ['Identified Savings', money(D.identified), money(Y.identified)+' YTD', 'pos'],
        ['Unallocated', money(D.unallocated), money(Y.unallocated)+' YTD', 'warn']
      ]).map(([k,v,sub,tone])=>cell(k,v,sub,LEDGER_TONE[tone]||'')).join('')}
    </div>
    <button class="iconbtn ledger-toggle tip tip-up" id="ledger-toggle"
            data-tip="${ledgerTip()}" aria-label="${ledgerTip()}">${icon('caret')}</button>
  </div>`;
}

/* ---- toast (§7) — Export and Share are real actions, so they confirm. ---- */
/* Top RIGHT, and a stack.  It was one reused element pinned bottom-right, which
   had two faults: a second confirmation inside four seconds overwrote the first
   without either being read, and the bottom-right corner is the one place on a
   long screen a reader is not looking — the action they just took was at the top.
   "The current toast messages feel dead and lack liveliness."
   Each toast is its own element with its own timer, so three actions produce
   three cards that clear independently, and each carries a draining bar so the
   time left is visible rather than guessed at.
   Dismissible, because a toast that covers the Export button it is confirming
   should not have to be waited out. */
const TOAST_MS = 4200;
function toast(title,sub,tone){
  const wrap = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast-item' + (tone?' '+tone:'');
  t.innerHTML = `<span class="toast-ic">${icon(tone==='warn'?'alerts':'check')}</span>`
    + `<div class="toast-t"><b>${title}</b>${sub?`<span>${sub}</span>`:''}</div>`
    + `<button class="toast-x" type="button" aria-label="Dismiss">&times;</button>`
    + `<i class="toast-bar" style="animation-duration:${TOAST_MS}ms"></i>`;
  wrap.appendChild(t);
  document.getElementById('live').textContent = title + (sub?'. '+sub:'');
  /* Oldest first: a stack that grows without limit will eventually cover the
     board, and the newest message is the one being read. */
  while(wrap.children.length > 3) dropToast(wrap.firstElementChild);
  const timer = setTimeout(()=>dropToast(t), TOAST_MS);
  t.addEventListener('click', e=>{
    if(!e.target.closest('.toast-x')) return;
    clearTimeout(timer); dropToast(t);
  });
}
/* Removed on a TIMER, not on animationend.  Under prefers-reduced-motion the
   stylesheet kills every animation outright, so animationend never fires and a
   toast waiting for it would stay on screen for ever. */
function dropToast(t){
  if(!t || t.dataset.going) return;
  t.dataset.going = '1';
  t.classList.add('going');
  setTimeout(()=>t.remove(), 260);
}

/* ---- export (§7) ----
   Was a dead button.  Now writes two real files: every table visible on the
   screen as CSV, and the active dataset as JSON — the same shape the "Load a
   dataset" picker reads back, so the round trip is real. */
function download(name,text,type){
  const url = URL.createObjectURL(new Blob([text],{type}));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
const csvCell = s => {
  /* Whitespace is COLLAPSED, not just trimmed.  These cells are built from
     template literals whose own source indentation reaches the DOM as real
     newlines, and a newline inside a field forces CSV quoting — so a single cell
     arrived in Excel as three lines of a quoted block. */
  const v = String(s).replace(/<[^>]*>/g,'')
    .replace(/ /g,' ').replace(/\s+/g,' ').trim();
  return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
};
/* Text as a READER sees it.  A raw textContent read was fine while a cell held a
   string; it stopped being fine once cells started holding components.  An
   avatar puts the initials "SM" in the DOM immediately before the name, so the
   owner column exported "SMS. Menon", and the middots separating an anomaly's
   provider, product and date arrived as data.  Everything decorative is already
   marked aria-hidden for screen readers — which is exactly the set a spreadsheet
   does not want either. */
function cellText(node){
  const c = node.cloneNode(true);
  c.querySelectorAll('[aria-hidden="true"]').forEach(n=>n.remove());
  return c.textContent;
}
/* A row list is not a table, so its "columns" have to be inferred.  A disclosure
   row keeps its summary inside the button that opens it; a plain row keeps it in
   its own children, where a control (Resolve) is a control and not a column. */
function rowCells(r){
  const head = r.querySelector(':scope > button[aria-expanded]');
  const src = head || r;
  return [...src.children]
    .filter(n => !(n.tagName === 'BUTTON' && n !== head))
    .map(n => csvCell(cellText(n)));
}
function exportView(){
  const tables = [...document.querySelectorAll('#screen table')];
  const scope = liveFilters().map(d=>DIMS[d].label+'='+sel(d).join('/'))
    .concat([F.period===CUSTOM_PERIOD ? 'Custom · '+rangeSummary(F.range)
      : F.period===MONTH_RANGE ? spanLabel(F.span)+' · '+monthSpanLabel(spanMonths(F.span))
      : F.period===FULL_YEAR_PERIOD ? 'Full year · '+monthSpanLabel(fullYearMonths())
      : F.period]).join(' · ');
  let csv = ['Technomics — '+TITLES[current], 'Dataset,'+RAW.label, 'Scope,'+csvCell(scope),
             'Generated as of,'+D.meta.asOf, ''].join('\n')+'\n';
  tables.forEach((t,i)=>{
    const heading = t.closest('.card')?.querySelector('.card-h h3')?.textContent || ('Table '+(i+1));
    csv += heading+'\n';
    csv += [...t.querySelectorAll('tr')]
      .map(tr=>[...tr.children].map(td=>csvCell(cellText(td))).join(',')).join('\n')+'\n\n';
  });
  /* Row lists are data too.  Export only ever walked <table>s, so once the
     anomalies screen replaced its ten-column table with disclosure rows its CSV
     carried a heading and nothing else — and the alerts feed, which has never
     been a table, had been exporting nothing since the day the button was
     wired.  A row whose direct child is a button is a disclosure row, and that
     button holds the summary line. */
  const lists = [...document.querySelectorAll('#screen .rows')];
  lists.forEach((l,i)=>{
    const heading = l.closest('.card')?.querySelector('.card-h h3')?.textContent || ('List '+(i+1));
    csv += heading+'\n';
    csv += [...l.querySelectorAll(':scope > .row')]
      .map(r=>rowCells(r).join(',')).join('\n')+'\n\n';
  });
  const stamp = D.meta.asOf.replace(/ /g,'-');
  /* BOM.  The file is UTF-8 and says so in its MIME type, but Excel ignores that
     for CSV and decodes as the system codepage — so every em dash in a screen
     title or an opportunity name arrived as "â€"" and every middot as "Â·".
     A leading U+FEFF is the only thing Excel reads as "this is UTF-8", and it is
     harmless to every other consumer. */
  download(`technomics-${current}-${RAW.id}-${stamp}.csv`, '﻿'+csv, 'text/csv;charset=utf-8');
  download(`technomics-dataset-${RAW.id}.json`, JSON.stringify(RAW,null,2), 'application/json');
  const blocks = tables.length + lists.length;
  toast('Exported '+blocks+' block'+(blocks===1?'':'s'),
        'CSV of this screen, plus the full dataset as JSON.');
}

/* ---- share (§7) ----
   Also a dead button before.  Builds a URL that restores everything that makes
   this view what it is — dataset, screen, view, filters — and copies it.  The
   clipboard API can be refused on a file:// origin, so there are two fallbacks
   and, failing both, the link is shown for manual copying. */
function stateUrl(){
  const p = new URLSearchParams();
  p.set('s',RAW.id); p.set('v',persona);
  /* Multi-select values ride as a comma-joined list.  None of the dataset's
     category, product, provider, environment or vendor names contains a comma,
     which is what makes the cheap encoding safe rather than merely convenient —
     if one ever does, this has to become a repeated key. */
  MULTI.forEach(k=>{ if(has(k)) p.set(k, sel(k).join(',')); });
  if(F.period!==FULL_YEAR_PERIOD) p.set('period', F.period);
  if(F.period===CUSTOM_PERIOD && F.range) p.set('range', F.range.from+'~'+F.range.to);
  if(F.period===MONTH_RANGE && F.span) p.set('span', F.span.from+'~'+F.span.to);
  return location.href.split('#')[0] + '#' + current + '?' + p.toString();
}
function shareView(){
  const url = stateUrl();
  const done = () => toast('Link copied',
    'Restores this dataset, screen, view and '+(liveFilters().length||'no')+' filter'+(liveFilters().length===1?'':'s')+'.');
  const manual = () => toast('Copy this link', url);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(done).catch(()=>legacyCopy(url)?done():manual());
  } else { legacyCopy(url)?done():manual(); }
}
function legacyCopy(text){
  try{
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }catch(e){ return false; }
}

/* ---- scenario loading (§10) ---- */
function loadScenario(id,keepFilters){
  const s = FINOPTIC.list.find(x=>x.id===id) || FINOPTIC.list[0];
  RAW = clone(s);
  RAW.scenarios = RAW.scenarios || [];
  reconcile();
  /* Vendor → brand-mark lookup, rebuilt per dataset (§5). */
  VENDOR_BRAND = {};
  (RAW.vendors||[]).forEach(v=>{ if(v.brand) VENDOR_BRAND[v.k]=v.brand; });
  (RAW.saas||[]).forEach(a=>{ if(a.brand) VENDOR_BRAND[a.vendor]=a.brand; });
  /* The setup walkthrough belongs to the WORKSPACE, so it is re-derived when the
     workspace changes.  It used to open with step 01 marked done in every
     dataset, which is right for a workspace with figures in it — the feeds are
     visibly landing — and flatly wrong for one that has closed nothing: the
     empty workspace showed eight em dashes under a walkthrough claiming its cost
     feed was connected, and the connect pane opened on "Done".  Two things
     describing one workspace have to agree. */
  if(typeof onbSyncToDataset==='function') onbSyncToDataset();
  if(!keepFilters){ MULTI.forEach(k=>F[k]=[]); F.period = FULL_YEAR_PERIOD; F.range = null; F.span = null; }
  /* The tone dot now rides on the profile menu's dataset row rather than on a
     pill in the top bar. */
  const pick = document.getElementById('scenario-pick');
  pick.className = 'menu-row ' + (RAW.tone||'');
  const sel = document.getElementById('scenario');
  sel.innerHTML = FINOPTIC.list.map(x=>
    `<option value="${x.id}"${x.id===RAW.id?' selected':''}>${x.label}</option>`).join('');
  document.getElementById('notif-count').textContent = String((RAW.alerts||[]).length);
}

/* ---- render ---- */
/* ---- the insight band's position (§7) ----
   "Immediately after the filter rows appear the Reconciliation bar, followed by
   the insights bar and the KPI tiles… move the key insights below the KPI tiles."

   Done by MOVING THE NODE rather than by changing what head() emits, and that is
   the decision worth defending.  head() emitting all four parts of the page head
   in one place is what keeps the order right on twenty screens without twenty
   edits — the note above it says so — and it cannot emit the band after the tiles,
   because the tiles are the first children of a grid each screen builds itself.
   The alternatives were: pass the band into every screen (twenty call sites, and
   twenty chances for one to put it somewhere else), or split it out of head() and
   have each grid open with it (same cost).  One generic move, applied once per
   render, keeps head() authoritative and costs one function.

   It runs BEFORE MOTION.afterScreen, so the band is already in the grid when the
   entrance animation counts children and therefore animates in sequence with the
   tiles rather than ahead of them.

   The leading RUN of KPI tiles is what it inserts after — not "the first
   non-KPI", because two screens open with a card and then show tiles further
   down, and the band belongs under the tiles that answer the headline, not
   halfway down the board. */
/* What the summary panel is ABOUT, per screen.  Short noun phrases rather than the
   page title, because the title is 30px above it and repeating it would waste the
   one line the panel gets.  The active period joins it on screens that offer the
   period pill — which is most of them, and is the same emphasis the pill itself
   just gained: the reader should not have to hunt for which months these numbers
   are.  Screens with no period pill get the noun alone rather than a span they
   cannot change. */
const SUM_SUBJECT = {
  overview:'Technology Spend',        itfm:'The Technology Estate',
  cloud:'Cloud Spend',               ai:'AI Spend',
  saas:'Subscriptions And Licences', finance:'Budget And Variance',
  proc:'Vendors And Contracts',      product:'Cost Per Product',
  optimize:'The Savings Backlog',    allocation:'Traceable Spend',
  forecast:'The Year-End Position',  anomalies:'Unexpected Movement',
  alerts:'Open Decisions',           security:'Security Spend',
  itsm:'Service Desk Economics',     sources:'The Data Behind The Numbers'
};
function summaryHead(){
  const n = SUM_SUBJECT[current] || TITLES[current] || 'This Screen';
  return activeDims().includes('period') ? n + ' · ' + shortPeriod(F.period) : n;
}

/* Which tab is showing.  On <html>, like data-ledger, so it survives every
   re-render without being tracked here.
   ---- round 15: IT DEFAULTS TO METRICS ----
   "I would like the Metrics tab to be the default tab.  With Metrics as the
   default, we should have a 'View Key Insights' button, similar to the existing
   'View KPIs' button in the Key Insights block."

   This REVERSES round 11's "the default view should be the key-insight view, the
   black tile view", and it is the same argument arriving from the other side.  The
   band is what the SME says a dashboard should not open with — his position is that
   reading the numbers is the reader's job — and the counter-argument that kept the
   band (a board pack does not hand over figures without commentary) never required
   it to go FIRST.  Landing on the figures and offering the commentary one control
   away concedes the order without conceding the feature, which is the whole of the
   disagreement worth conceding.

   The default is a fallback on the attribute rather than a written value, so the
   reader's own last choice still wins for the rest of the session. */
const SUM_TABS = [['metrics','Metrics'],['insights','Key Insights']];
const sumTab = () => document.documentElement.getAttribute('data-sum') || 'metrics';

/* ---- the summary panel (§7) ----
   "Collapse the KPI tiles and summary into one tabbed view with two tabs… the tabs
   should be in the same row, and the default view should be the key-insight view."

   THE HEADER IS CHROME, NOT A CARD.  The headline and the tab switcher sit on the
   canvas above both panes, and each pane is its own surface — "I want the heading
   and the tab switcher outside these panes, with the actual cards placed in their
   grouped-state pane."  A first version wrapped the whole thing in one white card
   with the ink band flush inside it, which made the header part of the object it was
   labelling; pulling it out means the tabs read as a control over two surfaces
   rather than as a title bar belonging to one.  It also lets the KPI tiles go back
   to being ordinary cards on the canvas in their own pane, which is what they are.

   The insight pane carries a footnote link out of itself: "add a footnote-style
   textual button labeled 'View KPIs' that switches to the metrics view."  It is the
   only route between the two that does not require finding the tabs, and it sits
   where the reader finishes reading.

   Built by MOVING the two nodes head() and the screen already produced, for the
   same reason placeBriefing() did before it: head() composing the page head in one
   place is what keeps twenty screens consistent, and the KPI tiles are the first
   children of a grid each screen builds itself.  One generic assembly costs one
   function; the alternative is twenty call sites that can each disagree.

   It runs BEFORE MOTION.afterScreen, so the panel is in the DOM when the entrance
   animation indexes boxes.

   Degrades rather than half-builds.  A screen with tiles but no insight band — the
   account and data-entry screens, which use their own head functions — keeps its
   tiles in the grid untouched, because a two-tab control with one empty tab is
   worse than no control. */
function placeSummary(){
  const host = document.getElementById('screen');
  const grid = host && host.querySelector(':scope > .grid');
  const band = host && host.querySelector(':scope > .briefing');
  if(!grid || !band) return;
  const lead = [];
  for(const el of grid.children){
    if(!el.classList.contains('kpi')) break;
    lead.push(el);
  }
  if(!lead.length) return;

  /* ---- round 15: THE REGION HAS ONE SHAPE, ON EVERY SCREEN ----
     Round 14 gave five screens a flat variant — tiles and band stacked, no switch —
     because those screens were left with a single KPI tile and a two-tab control
     whose Metrics pane holds one card is the "one empty tab" fault 14.3 refused.
     It solved the wrong half of the problem: "some pages contain only one tile, and
     in those cases Key Insights and the Metrics are displayed one below the other
     instead of as a tabbed view.  Users remember the previous screen layout, and a
     sudden change in presentation does not help them."

     Both halves are fixed at the layer each belongs to.  The SHAPE is fixed here —
     the flat branch is gone and every screen with a band and tiles is tabbed.  The
     COUNT is fixed in screens.js, where every board screen now authors exactly four
     tiles, so one row of four is the only Metrics pane that exists and no screen can
     leave a widow in a second row.  Neither fix works alone: a tab control over one
     tile is what 14.3 refused, and four tiles under an inconsistent shape is still
     an inconsistent shape.

     test-panel.js asserts both, which is what stops a future screen from quietly
     re-introducing either. */
  const tab = sumTab();
  const wrap = document.createElement('section');
  wrap.className = 'sum';
  wrap.innerHTML = `<div class="sum-h">
      <h2>${summaryHead()}</h2>
      <div class="sum-tabs" role="tablist" aria-label="Summary view">${
        SUM_TABS.map(([k,label])=>`<button type="button" class="sum-tab${k===tab?' on':''}"
          role="tab" aria-selected="${k===tab}" data-sum-tab="${k}">${label}</button>`).join('')}
      </div>
    </div>
    <div class="sum-pane" data-sum-pane="insights" role="tabpanel"></div>
    <div class="sum-pane" data-sum-pane="metrics" role="tabpanel"><div class="sum-kpis"></div></div>`;
  grid.parentNode.insertBefore(wrap, grid);
  wrap.querySelector('[data-sum-pane="insights"]').appendChild(band);
  const met = wrap.querySelector('.sum-kpis');
  lead.forEach(el=>met.appendChild(el));
  /* ---- ONE footnote, and only where a surface can hold it ----
     The band ends with a way out of itself, spanning its three columns INSIDE the ink
     panel, so it reads as the band's own footer rather than as a button parked
     underneath it.  It carries `data-sum-tab`, which is all the switch handler below
     matches on — so the footnote and the tab are the same control twice.

     ROUND 16 REMOVED THE MATCHING ONE ON THE METRICS PANE.  It was built in round 15
     for symmetry — "with Metrics as the default we should have a View Key Insights
     button" — and symmetry was the wrong instinct: "it kind of feels like it is
     floating mid-air."  Exactly right, and the reason is structural rather than
     stylistic.  The band is one SURFACE, so a footer inside it is part of an object.
     The tile grid is four SEPARATE cards on the canvas, so a control below them
     belongs to nothing and floats however it is styled — giving it its own white bar
     was tried and only made a fifth object out of the least important thing in the
     pane.

     The asymmetry that leaves is earned rather than tolerated.  A footnote out of a
     pane is for a pane you read to the END and finish somewhere far from the tabs;
     that is the band, three columns of prose deep.  The Metrics pane is four figures
     you scan in a second with the tab control still in view above them, so the exit
     it needs is the one already there. */
  band.insertAdjacentHTML('beforeend',
    `<button type="button" class="sum-more" data-sum-tab="metrics">View KPIs
       <span aria-hidden="true">›</span></button>`);
}

/* The tabs. Delegated on document, because the panel is rebuilt on every render —
   a listener bound to the buttons would be attached to nodes the next filter change
   throws away. Writing the attribute is all it takes; CSS shows the pane. */
document.addEventListener('click', e=>{
  const t = e.target.closest('[data-sum-tab]');
  if(!t) return;
  const k = t.dataset.sumTab;
  document.documentElement.setAttribute('data-sum', k);
  /* Matched on the VALUE, not on identity, because the clicked element is not always
     one of the tabs — the "View KPIs" footnote carries the same attribute, and
     comparing nodes would have switched the pane while leaving both tabs unlit. */
  const box = t.closest('.sum');
  if(box) box.querySelectorAll('.sum-tab').forEach(b=>{
    const on = b.dataset.sumTab === k;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
  });
});

/* A card's own tabs (components.js, card({tabs:…})) — the same delegated
   pattern as .sum-tab just above, scoped to the one card rather than the
   document, since a board can carry more than one tabbed card at once and
   each needs its own active key. */
document.addEventListener('click', e=>{
  const t = e.target.closest('[data-card-tab]');
  if(!t) return;
  const box = t.closest('.card');
  if(!box) return;
  const k = t.dataset.cardTab;
  box.setAttribute('data-active', k);
  box.querySelectorAll('.card-tab').forEach(b=>{
    const on = b.dataset.cardTab === k;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
  });
  box.querySelectorAll('[data-pane]').forEach(p=>{ p.hidden = p.dataset.pane !== k; });
});

function go(id,push=true){
  if(!S[id]) id='overview';
  /* Only a real navigation unfolds a group, not a re-render.  refresh() calls
     go(current), so unfolding unconditionally would re-open a group the user had
     just folded every time they touched a filter. */
  const moved = id !== current;
  current = id;
  /* A screen may declare that it wants no shell around it.  Only sign-in does —
     it is the screen you have not yet entered the product from, so a sidebar
     full of screens you cannot open would be a lie.  Declared on the renderer
     itself (`S.signin.chrome = 'bare'`) so a screen owns the decision rather
     than the shell keeping a list of exceptions. */
  document.documentElement.setAttribute('data-chrome', (S[id] && S[id].chrome) || 'full');
  /* You cannot be inside a folded group: arriving at a screen — from the nav, a
     shared link or the View switch — reveals where you are.  For the four persona
     screens groupOf() answers Overview, which is where their View line is. */
  if(moved) shutGroups.delete(groupOf(id));
  /* Landing on a persona screen — from a shared link, or from the View
     dropdown — IS switching view, so the dropdown must follow.  It is the only
     thing in the sidebar that can show you are there. */
  const pv = personaOf(id);
  if(pv) persona = pv;
  D = deriveView();
  /* Motion is OPTIONAL and lives in motion.js.  These three calls are the whole
     contract: the shell does not know what an animation is, and the mock-up must
     still render correctly if motion.js is missing or has been switched off for
     prefers-reduced-motion. */
  if(window.MOTION) MOTION.beforeScreen(id, moved);
  /* head() emits the ledger strip, so it renders with the screen rather than
     into a slot in the shell — which is how the page title got above it. */
  document.getElementById('screen').innerHTML = S[id]();
  placeSummary();
  renderNav(); renderFilters();
  /* The controls row is re-created on every render, so the observer has to be
     re-pointed at the new element rather than left watching a detached one. */
  watchStick();
  if(window.MOTION) MOTION.afterScreen(id, moved);
  /* Only a real navigation returns you to the top.  A filter change re-renders
     the same screen, and jumping to the top there both loses your place and —
     because the scroll listener closes popovers — slams shut the multi-select
     menu you are in the middle of using. */
  if(moved) window.scrollTo({top:0,behavior:'instant'});
  if(push){
    const h = stateUrl().split('#')[1];
    if(location.hash.slice(1)!==h) history.replaceState(null,'','#'+h);
  }
}
/* A filter or scenario change is just a re-render of the same screen. */
const refresh = () => go(current);

/* ---- popover plumbing ---- */
/* Only the things that OPEN one of these menus get their aria-expanded reset.
   It used to reset every `[aria-expanded="true"]` in the document with a
   data-group exemption bolted on, which is a blocklist — so the moment a screen
   grew a disclosure button of its own (an anomaly card, a form section) this
   silently told the world it had collapsed while it sat there open, and the next
   click on it inverted.  A list of the triggers this function is actually
   responsible for cannot go wrong that way. */
const MENU_TRIGGERS = '.chip[data-dim], [data-view-menu], [data-pick], #profile-btn';
function closeMenus(except){
  document.querySelectorAll('.menu').forEach(m=>{ if(m!==except) m.hidden = true; });
  document.querySelectorAll(MENU_TRIGGERS).forEach(b=>b.setAttribute('aria-expanded','false'));
  document.querySelectorAll('.menu.vals').forEach(m=>m.remove());
  /* The pending first half of a month range dies with the grid it was picked in.
     Surviving the close would mean a click on March today extending a range from
     a January clicked ten minutes ago — a selection the reader never saw the
     start of, made out of two clicks separated by everything in between.
     Because the first click never writes to F, abandoning a half-finished pick
     this way leaves the applied period exactly as it was, which is what every
     picker the research looked at does. */
  periodAnchor = null; periodHover = null;
}
/* A filter pill's value list is built on demand from the ACTIVE dataset, so it
   can never offer a value the loaded scenario doesn't contain.
   PORTALLED TO <body>, position:fixed, anchored to the pill's on-screen rect.
   Appended to the pill it was invisible: .filters was overflow-x:auto, and CSS
   promotes the other axis to auto alongside it, so the row clipped its own
   children on both axes and a 300px-tall menu opened inside a 34px-tall
   clipping box.  The pills responded to every click; the menu was being cut
   away — which is exactly the "the filters are not working, and they are not
   clickable" symptom.  Out here nothing can clip it. */
function openDimMenu(chip,dim){
  const m = document.createElement('div');
  m.className = 'menu vals dimmenu' + (dim==='period'?' periodmenu':' multimenu');
  m.dataset.forDim = dim;
  m.innerHTML = dim==='period' ? periodMenuHTML() : multiMenuHTML(dim);
  m.addEventListener('click', e=>{
    /* PERIOD IS TWO CLICKS, START THEN END, and nothing is applied until the
       second one lands.  A period is still one span of time — picking a second
       month is never an addition, it completes the span the first one opened.

       THE FIRST CLICK CHANGES NOTHING BUT THE MENU, and that is the point.  An
       earlier version applied the first month immediately, on the reasoning that
       someone who wanted March alone should get it without a second click — but
       that makes the board jump to a one-month view the reader did not ask for,
       halfway through asking for something else, and it quietly contradicts the
       readout above the grid that is at that moment saying "End: pick a month".
       The single-month case is the reader's own: "if a user wants to select only
       one month, they can click the same month for both the start and end." */
    if(dim==='period'){
      if(e.target.closest('[data-custom]')){ openRangeMenu(chip); return; }
      const o = e.target.closest('[data-val]'); if(!o) return;
      const i = +o.dataset.idx;
      /* FIRST CLICK: anchor only.  F is untouched, so the board keeps showing
         whatever period was already applied — but periodPainted() now returns the
         anchor instead of that period, so the grid shows one selection rather
         than the old range plus a new pick. */
      if(periodAnchor==null){ periodAnchor = i; periodHover = null; periodPaint(m); return; }
      F.range = null;
      if(periodAnchor===i){ F.period = o.dataset.val; F.span = null; }
      else { F.period = MONTH_RANGE; F.span = {from:periodAnchor, to:i}; }
      const set = F.span, n = set ? spanMonths(set).length : 1;
      closeMenus(); refresh();
      toast('Date range set', (set ? spanLabel(set) : o.dataset.val)
        +' — '+n+' month'+(n===1?'':'s')+' of closed data.');
      return;
    }
    /* Everything else is multi-select and STAYS OPEN.  Closing after each pick
       would make choosing three products three round trips through the pill,
       which is the whole thing multi-select exists to avoid. */
    if(e.target.closest('[data-all]')){ F[dim] = []; syncMulti(m,dim); refresh(); return; }
    const o = e.target.closest('[data-val]'); if(!o) return;
    const v = o.dataset.val, cur = sel(dim);
    F[dim] = cur.includes(v) ? cur.filter(x=>x!==v) : cur.concat([v]);
    /* Selecting every value says the same thing as selecting none, and an
       "everything" filter that still reads as filtered would make the Clear
       count and the cards' "estimated" marks both lie. */
    if(F[dim].length === allOf(dim).length) F[dim] = [];
    syncMulti(m,dim); refresh();
  });
  m.addEventListener('input', e=>{
    if(!e.target.matches('[data-opt-find]')) return;
    const q = e.target.value.trim().toLowerCase();
    m.querySelectorAll('.menu-opt[data-val]').forEach(b=>{
      b.hidden = !!q && !b.dataset.val.toLowerCase().includes(q);
    });
  });
  /* HOVER PREVIEW, period only.  Delegated on the menu rather than bound per
     cell, so it survives a repaint, and cleared on mouseleave of the GRID rather
     than of each cell — leaving one cell for the next is not leaving the grid,
     and clearing per cell would flicker the band on every crossing.
     `periodHover` is only read while an anchor is pending (periodPainted), so
     these listeners cost nothing before the first click. */
  if(dim==='period'){
    m.addEventListener('mouseover', e=>{
      const o = e.target.closest('.mo:not([disabled])');
      if(!o || periodAnchor==null) return;
      const i = +o.dataset.idx;
      if(i===periodHover) return;
      periodHover = i; periodPaint(m);
    });
    const grid = m.querySelector('.mo-grid');
    if(grid) grid.addEventListener('mouseleave', ()=>{
      if(periodAnchor==null || periodHover==null) return;
      periodHover = null; periodPaint(m);
    });
  }
  document.body.appendChild(m);
  chip.setAttribute('aria-expanded','true');
  placeMenu(m, chip);
  /* The grid renders bare and is painted once it is in the document — one code
     path for the first paint, every hover and every click. */
  if(dim==='period') periodPaint(m);
  const find = m.querySelector('[data-opt-find]'); if(find) find.focus();
}
/* Repaints the menu's own state after a toggle.  The menu lives on <body>, so a
   re-render of the screen leaves it standing — which is what lets it stay open
   across a refresh, and also why its tick marks have to be updated by hand. */
function syncMulti(m,dim){
  const on = sel(dim);
  m.querySelectorAll('.menu-opt[data-val]').forEach(b=>{
    b.classList.toggle('on', on.includes(b.dataset.val));
    b.setAttribute('aria-selected', String(on.includes(b.dataset.val)));
  });
  const all = m.querySelector('[data-all]');
  if(all) all.classList.toggle('on', on.length===0);
  const n = m.querySelector('[data-opt-count]');
  if(n) n.textContent = on.length ? on.length+' of '+allOf(dim).length : 'All';
}
const OPT_FIND_MIN = 8;
function multiMenuHTML(dim){
  const vals = allOf(dim), on = sel(dim);
  return `<div class="menu-h opt-h"><span>${DIMS[dim].label}</span>
      <span data-opt-count>${on.length?on.length+' of '+vals.length:'All'}</span></div>
    ${vals.length>=OPT_FIND_MIN?`<label class="opt-find">${icon('filter',true)}
      <input type="search" data-opt-find placeholder="Find a ${DIMS[dim].label.toLowerCase()}"
             aria-label="Find a ${DIMS[dim].label.toLowerCase()}"></label>`:''}
    <button class="menu-opt opt-all ${on.length?'':'on'}" type="button" data-all
      >All ${DIMS[dim].label.toLowerCase()}s</button>
    <div class="menu-sep"></div>
    ${vals.map(v=>`<button class="menu-opt opt-multi ${on.includes(v)?'on':''}"
        type="button" data-val="${v}" role="option" aria-selected="${on.includes(v)}">
        <span class="tick" aria-hidden="true"></span>
        ${ec(v)?`<i style="background:var(${ec(v)})"></i>`:''}
        <span class="opt-n">${v}</span></button>`).join('')}`;
}
/* ---- THE DATE RANGE PICKER: a 4x3 grid of months (§7) ----
   Jan-Dec in three rows of four, endpoints filled solid, the months between them
   carrying a pale band that joins them into one bar.  Drawn to a supplied
   reference — "the current UX is unclear; could we redesign it to match the
   shared screenshot, showing how a date range is selected?"

   IT REPLACES A TWELVE-ROW LIST, and the list was the problem rather than the
   labels on it.  A vertical list of months is a list of ALTERNATIVES: it looks
   exactly like the Category and Product menus beside it, where one row is one
   choice, so nothing about it suggested that two clicks meant something
   different from one.  It also could not show a range: a highlighted run in a
   scrolling list, with a month or two below the fold, reads as several separate
   selections.  A grid can show the span as one shape, which is the whole point.

   TWO CLICKS ARE STATED, NOT IMPLIED — "please make sure the user understands
   that they need to make two selections, for the start and for the end."  So the
   grid sits under a Start -> End readout with the field awaiting the next click
   outlined, which turns "two selections" into something visible rather than
   something to be inferred, and the hint spells out the single-month case ("they
   can click the same month for both the start and end").
   A month past the dataset's closed window stays present but disabled — hiding
   it would reflow the grid every time the scenario changes, and the custom-range
   calendar already sets that precedent (SCHEMA.md: a picker that reaches a month
   the data cannot answer for is offering a query with no honest result).

   ---- ROUND 21b, AFTER READING WHAT OTHER PICKERS DO ----
   "It is glitchy and… not the right UX.  We need to research how other companies
   handle it."  The bug reported was real: with Jan-Mar applied, clicking a fourth
   month painted the OLD range and the new pick at the same time, so the grid
   showed two selections at once and read as an accumulating multi-select.  Three
   things came out of the research and all three are here.

   1. THERE IS ONE PAINTED RANGE, NEVER TWO.  Adobe's react-aria is explicit in
      `useRangeCalendarState` — `highlightedRange = anchorDate ? makeRange(anchor,
      focused) : value && makeRange(value.start, value.end)` — so the moment an
      anchor exists the committed range stops being drawn.  Ignite UI states the
      rule in prose: "if a range is already selected, clicking any other date
      will start a new range selection."  periodPainted() below is that one
      expression, and it is the only thing any cell state is derived from.
   2. THE APPLIED FILTER SURVIVES THE FIRST CLICK.  Every reference
      implementation leaves the committed value alone until the second click
      lands — only the HIGHLIGHT clears.  So a half-finished pick cannot leave
      the board showing a period nobody asked for, and abandoning the menu
      (Escape, or clicking away) leaves the previous range exactly as it was.
      This is the one place the reported proposal needed a correction: clear the
      paint, keep the filter.
   3. HOVER PREVIEW IS NOT A FLOURISH, IT IS THE FIX.  It is what makes the
      second step feel deliberate instead of broken — with an anchor set and no
      preview, the grid just looks like it forgot the range it had.  So the band
      follows the pointer between the anchor and the hovered month, and the
      Start/End fields fill in with it.
   Also from the research, and uncontested: endpoints picked backwards SWAP
   rather than restart (Ant Design ships `order`, default true; react-aria's
   makeRange does the same) — spanEnds() takes min/max, so this was already true;
   and the same month twice IS a one-month range rather than an error.

   ONE FINDING IS NOT IMPLEMENTED, DELIBERATELY.  Analytics and finance products
   overwhelmingly put a range behind an explicit Apply — GA4, Looker Studio, AWS
   Cost Explorer, NetSuite — because there a range change re-queries something
   expensive.  Nothing here is expensive, and every other pill in this bar
   applies live (multiMenuHTML's menu stays open and calls refresh() on each
   toggle), so an Apply on this one control alone would make the period the odd
   one out in its own filter bar.  Worth revisiting if the real product's
   period change ever costs a round trip.

   `periodAnchor` is the pending first click and `periodHover` the month under
   the pointer.  Both live only as long as the menu is open — closeMenus() clears
   them — so a range is always two clicks made in one visit to the grid. */
let periodAnchor = null, periodHover = null;
/* THE ONE RANGE THAT IS PAINTED, as fiscal-month indexes, low first.  A pending
   anchor wins over the committed selection; with no anchor it falls back to
   whatever is applied (a span, a single month, or nothing).  Everything else in
   this menu — cell fills, the two fields, the hint, the live region — reads this
   and nothing else, which is what makes "two selections at once" unrepresentable
   rather than merely unlikely. */
function periodPainted(){
  if(periodAnchor!=null){
    const b = periodHover!=null ? periodHover : periodAnchor;
    const x = PERIODS[periodAnchor][1][0], y = PERIODS[b][1][0];
    return [Math.min(x,y), Math.max(x,y)];
  }
  if(F.period===MONTH_RANGE && F.span) return spanEnds(F.span);
  const one = PERIODS.find(p=>p[0]===F.period);
  return one ? [one[1][0], one[1][0]] : [-1,-1];
}
/* Repaints in place rather than re-rendering the menu.  Hover has to repaint on
   every mouseover, and rebuilding innerHTML under the pointer would replace the
   element the pointer is over — which drops the very mouseleave that clears the
   preview and leaves a band frozen on the grid. */
function periodPaint(m){
  const [lo,hi] = periodPainted();
  const part = fi => lo>=0 && fi>=lo && fi<=hi;
  const cells = [...m.querySelectorAll('.mo')];
  cells.forEach((b,i)=>{
    const fi = PERIODS[i][1][0], col = i%4;
    const end = part(fi) && (fi===lo || fi===hi);
    const mid = part(fi) && !end;
    b.classList.toggle('on', end);
    b.classList.toggle('in', mid);
    /* The band is square where the run continues into the next cell and rounded
       where it stops, so each row's stretch reads as one bar. */
    b.classList.toggle('rl', mid && (col===0 || !part(PERIODS[i-1][1][0])));
    b.classList.toggle('rr', mid && (col===3 || !part(PERIODS[i+1][1][0])));
    b.setAttribute('aria-selected', String(part(fi)));
  });
  /* The fields show the ORDERED pair, so hovering backwards off the anchor reads
     as the range it will actually apply rather than as start-after-end. */
  const pending = periodAnchor!=null, previewing = pending && periodHover!=null;
  const sTxt = lo>=0 ? FY_MONTH_NAME[lo] : '';
  const eTxt = (pending && !previewing) ? '' : (hi>=0 ? FY_MONTH_NAME[hi] : '');
  const fld = (key,val,now) => {
    const el = m.querySelector('[data-mo-fld="'+key+'"]');
    if(!el) return;
    el.classList.toggle('mo-now', !!now);
    el.classList.toggle('mo-none', !val);
    el.querySelector('b').textContent = val || 'Pick a month';
  };
  fld('start', sTxt, !pending);
  fld('end', eTxt, pending);
  /* The hint does NOT name the anchor month.  It used to end "…the same month
     again for February alone", which contradicted the fields the moment the
     preview ran backwards off the anchor: hovering August from a February anchor
     shows Start August / End February, because that is the order the range will
     apply in, and a hint naming February as the start disagreed with the box
     directly above it. */
  const hint = m.querySelector('[data-mo-hint]');
  if(hint) hint.textContent = pending
    ? 'Now pick the month it ends on — or the same month again for a single month.'
    : 'Pick two months: the start, then the end. The same month twice selects that month alone.';
  /* Announced, because the range is communicated by fill colour across twelve
     cells and none of that reaches a screen reader.  APG has no range-calendar
     pattern, so this is the Grid pattern's aria-selected plus a polite live
     region naming the span. */
  const live = m.querySelector('[data-mo-live]');
  if(live) live.textContent = lo<0 ? ''
    : (pending && !previewing) ? PERIODS[periodAnchor][0]+' selected as the start month'
    : monthSpanLabel(rangeOfFiscal(lo,hi));
}
/* The closed months between two fiscal indexes — the same set spanMonths() would
   resolve, expressed from the pair the menu is painting rather than from a click
   pair it does not have yet. */
const rangeOfFiscal = (lo,hi) => {
  const out = [];
  for(let i=lo;i<=hi;i++) if(i < closedCount()) out.push(i);
  return out;
};
function periodMenuHTML(){
  /* Cells only — no state.  periodPaint() sets every class and every label, so
     there is exactly one place that decides what the grid looks like. */
  const fld = key => `<div class="mo-fld" data-mo-fld="${key}">
      <span class="mo-lbl">${key==='start'?'Start':'End'}</span><b></b></div>`;
  return `<div class="menu-h">${DIMS.period.label}</div>
    <div class="mo-head">${fld('start')}
      <span class="mo-arrow" aria-hidden="true">→</span>
      ${fld('end')}</div>
    <div class="mo-hint" data-mo-hint></div>
    <div class="mo-grid" role="listbox" aria-label="Months">`
    + PERIODS.map((p,i)=>{
        const closed = p[1][0] < closedCount();
        return `<button class="mo" type="button" role="option" aria-selected="false"
            data-val="${p[0]}" data-idx="${i}"
            ${closed?'':' disabled title="Not closed yet"'}
          >${p[0].slice(0,3)}</button>`;
      }).join('')
    + `</div>
       ${/* WHY THAT MONTH IS GREY.  The reported example was "I then click another
             month, say July" — and July is exactly the month every dataset has
             not closed, so the click did nothing and the only explanation was a
             `title` tooltip that needs a hover and a pause to find.  A dimmed
             cell with no reason reads as a dead control.  Named from the data, so
             it follows the scenario: a ten-week-old workspace greys out ten
             months and says so. */''}
       ${unclosedNote()}
       <div class="mo-live sr-only" data-mo-live aria-live="polite"></div>
       <div class="menu-sep"></div>
       <button class="menu-opt opt-custom ${F.period===CUSTOM_PERIOD?'on':''}" type="button" data-custom>
         ${icon('calendar',true)}<span class="opt-n">Custom range…</span></button>`;
}
/* The months the grid is showing but cannot answer for, as a span rather than a
   list — "Sep–Jul not closed yet" beats eleven comma-separated names. */
function unclosedNote(){
  const open = [];
  for(let i=closedCount(); i<PERIODS.length; i++) open.push(i);
  if(!open.length) return '';
  const M = RAW.meta.months;
  const names = open.map(fi=>M[fi]).filter(Boolean);
  if(!names.length) return '';
  const span = names.length===1 ? names[0] : names[0]+'–'+names[names.length-1];
  return `<div class="mo-note">${span} not closed yet</div>`;
}

/* ---- the custom range calendar (§7) ----
   Two month grids, prev/next, click a start then an end.

   Clamped to the CLOSED months of the fiscal year, and it says so.  A picker
   that let you reach March 2024 on a dataset beginning in August 2025 would be
   offering a query the data cannot answer, and one that reached into the
   forecast month would fold a projection into an "actual" total — on a screen
   whose entire claim is that the numbers reconcile.
   It also resolves to WHOLE MONTHS and prints what it resolved to, because the
   dataset carries one figure per month.  Interpolating a daily curve to honour
   "the 12th to the 27th" would be the most convincing lie in the mock-up. */
let calFrom = null, calTo = null, calCursor = null;
function openRangeMenu(anchor){
  closeMenus();
  const lo = fyMonthStart(0), hi = fyMonthEnd(closedCount()-1);
  calFrom = F.range ? new Date(F.range.from+'T00:00:00') : null;
  calTo   = F.range ? new Date(F.range.to+'T00:00:00')   : null;
  const seed = calFrom || hi;
  calCursor = new Date(seed.getFullYear(), seed.getMonth(), 1);
  /* Two grids are drawn at once, so the cursor never sits on the final month or
     the right-hand grid would fall outside the window. */
  const lastCursor = new Date(hi.getFullYear(), hi.getMonth()-1, 1);
  if(calCursor > lastCursor) calCursor = lastCursor;
  if(calCursor < new Date(lo.getFullYear(), lo.getMonth(), 1))
    calCursor = new Date(lo.getFullYear(), lo.getMonth(), 1);
  const m = document.createElement('div');
  m.className = 'menu vals calmenu';
  m.dataset.forDim = '__range';
  document.body.appendChild(m);
  drawCal(m, lo, hi);
  m.addEventListener('click', e=>{
    const step = e.target.closest('[data-cal-step]');
    if(step){
      calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth()+ +step.dataset.calStep, 1);
      drawCal(m, lo, hi); return;
    }
    const day = e.target.closest('[data-day]:not([disabled])');
    if(day){
      const d = new Date(day.dataset.day+'T00:00:00');
      /* A second click always ENDS the range unless it lands before the start,
         in which case the user is plainly restarting rather than picking
         backwards. */
      if(!calFrom || calTo || d < calFrom){ calFrom = d; calTo = null; }
      else calTo = d;
      drawCal(m, lo, hi); return;
    }
    if(e.target.closest('[data-cal-cancel]')){ closeMenus(); return; }
    if(e.target.closest('[data-cal-apply]:not([disabled])')){
      F.period = CUSTOM_PERIOD;
      F.range = {from:isoDay(calFrom), to:isoDay(calTo||calFrom)};
      closeMenus(); refresh();
      toast('Date range set', rangeSummary(F.range)+' — whole months, because the dataset is monthly.');
    }
  });
  placeMenu(m, anchor);
}
const isoDay = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')
  +'-'+String(d.getDate()).padStart(2,'0');
/* Monday-first: this is a UK-English product — "licences", "optimisation". */
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];
function drawCal(m, lo, hi){
  const grid = base => {
    const first = new Date(base.getFullYear(), base.getMonth(), 1);
    const days = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
    const lead = (first.getDay()+6)%7;
    let cells = '';
    for(let i=0;i<lead;i++) cells += `<span class="cal-d pad"></span>`;
    for(let dn=1;dn<=days;dn++){
      const d = new Date(base.getFullYear(), base.getMonth(), dn);
      const out = d < lo || d > hi;
      const isEnd = (calFrom && +d===+calFrom) || (calTo && +d===+calTo);
      const between = calFrom && calTo && d>calFrom && d<calTo;
      cells += `<button class="cal-d${isEnd?' end':''}${between?' mid':''}" type="button"
        data-day="${isoDay(d)}"${out?' disabled':''}>${dn}</button>`;
    }
    return `<div class="cal-m">
      <div class="cal-mh">${MONTHS3[base.getMonth()]} ${base.getFullYear()}</div>
      <div class="cal-dow">${DOW.map(x=>`<span>${x}</span>`).join('')}</div>
      <div class="cal-g">${cells}</div></div>`;
  };
  const next = new Date(calCursor.getFullYear(), calCursor.getMonth()+1, 1);
  const canBack = calCursor > new Date(lo.getFullYear(), lo.getMonth(), 1);
  const canFwd  = next < new Date(hi.getFullYear(), hi.getMonth(), 1);
  const resolved = calFrom
    ? rangeSummary({from:isoDay(calFrom), to:isoDay(calTo||calFrom)}) : null;
  m.innerHTML = `
    <div class="cal-h">
      <button class="iconbtn cal-nav back" type="button" data-cal-step="-1"${canBack?'':' disabled'}
              aria-label="Previous month">${icon('caret')}</button>
      <span>Custom range</span>
      <button class="iconbtn cal-nav fwd" type="button" data-cal-step="1"${canFwd?'':' disabled'}
              aria-label="Next month">${icon('caret')}</button>
    </div>
    <div class="cal-body">${grid(calCursor)}${grid(next)}</div>
    <div class="cal-f">
      <span class="cal-note">${resolved
        ? `Resolves to <b>${resolved}</b> · whole months`
        : (closedCount() > 0
            ? `Pick a start, then an end · ${RAW.meta.months[0]}–${RAW.meta.months[closedCount()-1]} available`
            : `No month has closed yet, so there is no range to draw from.`)}</span>
      <span class="cal-acts">
        <button class="btn sm" type="button" data-cal-cancel>Cancel</button>
        <button class="btn sm pri" type="button" data-cal-apply${calFrom?'':' disabled'}>Apply</button>
      </span>
    </div>`;
}
/* Anchors a portalled fixed menu under the control it belongs to.  Measured
   AFTER insertion, because a fixed element's own height is what decides whether
   it can hang below its anchor or has to flip above it. */
function placeMenu(m, anchor){
  const r = anchor.getBoundingClientRect(), h = m.offsetHeight, w = m.offsetWidth;
  const below = r.bottom + 6, flip = below + h > window.innerHeight - 8;
  m.style.top  = (flip ? Math.max(8, r.top - h - 6) : below) + 'px';
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
}

/* The lens picker's list.  A portalled popover on <body> rather than a child of
   its button, for the reason it always was: it hangs off a control inside
   `.navgroups`, which scrolls and therefore clips.  A native <select> could never
   have been styled to match the board either.  Every row navigates, including the
   row you are already on — that is the whole point of replacing the <select>. */
function openViewMenu(anchor){
  const m = document.createElement('div');
  m.className = 'menu vals viewmenu';
  m.dataset.forDim = '__view';
  m.innerHTML = `<div class="menu-h">Viewing As</div>` + Object.keys(PERSONA).map(k=>{
    const v = PERSONA[k];
    return `<button class="menu-opt vp ${k===persona?'on':''}" type="button" data-persona="${k}">
      <span class="vp-t"><b>${v.label}</b><em>${v.blurb}</em></span></button>`;
  }).join('');
  m.addEventListener('click', e=>{
    const o = e.target.closest('[data-persona]'); if(!o) return;
    persona = o.dataset.persona;
    closeMenus();
    /* Leaves the overlay rail open on a narrow screen: you have just changed the
       lens, and the next thing you do is pick a screen through it. */
    go(PERSONA[persona].home);
  });
  document.body.appendChild(m);
  anchor.setAttribute('aria-expanded','true');
  placeMenu(m, anchor);
}
/* A fixed menu does not travel with the pill it belongs to, so it is re-anchored
   whenever the pill could have moved.
   It used to CLOSE instead, which was fine while every menu shut on its first
   click.  Multi-select broke that: narrowing a filter makes the page shorter, the
   browser clamps the scroll position, that fires a scroll event — and the menu
   you were still choosing from vanished on your second tick. */
function repositionMenus(e){
  const m = document.querySelector('.menu.vals');
  if(!m) return;
  /* Scrolling the menu's own option list is not the pill moving. */
  if(e && e.target && e.target.nodeType===1 && m.contains(e.target)) return;
  const dim = m.dataset.forDim;
  const anchor = dim==='__view' ? document.querySelector('[data-view-menu]')
    : document.querySelector('.chip[data-dim="'+(dim==='__range'?'period':dim)+'"]');
  anchor ? placeMenu(m, anchor) : closeMenus();
}
window.addEventListener('scroll', repositionMenus, true);
window.addEventListener('resize', repositionMenus);

document.addEventListener('click', e=>{
  /* a filter pill's clear "×" must not also open the menu */
  const clear = e.target.closest('[data-clear]');
  if(clear){ F[clear.dataset.clear]=[]; closeMenus(); refresh(); return; }
  if(e.target.closest('#clear-filters')){
    MULTI.forEach(k=>F[k]=[]); refresh(); return;
  }
  /* The name half of the split control. Leaves the overlay rail open on a narrow
     screen — you have just changed lens, and the next thing you do is pick a
     screen through it. */
  if(e.target.closest('[data-go-view]')){
    closeMenus();
    if(navOpen()) setNav('mini');
    go(PERSONA[persona].home);
    return;
  }
  const viewBtn = e.target.closest('[data-view-menu]');
  if(viewBtn){
    const mine = document.querySelector('.menu.vals[data-for-dim="__view"]');
    closeMenus(); if(!mine) openViewMenu(viewBtn);
    return;
  }
  const dimChip = e.target.closest('[data-dim]');
  if(dimChip){
    /* The open menu lives on <body>, not inside the pill, so "is mine already
       open?" is answered by the dimension it was built for. */
    const dim = dimChip.dataset.dim;
    const mine = document.querySelector('.menu.vals[data-for-dim="'+dim+'"]');
    closeMenus(); if(!mine) openDimMenu(dimChip, dim);
    return;
  }
  /* The reconciliation strip is permanent chrome, so it has to be dismissible. */
  if(e.target.closest('#ledger-toggle')){ toggleLedger(); return; }
  /* Delegated, not bound: both buttons live inside the screen now and are
     replaced on every render, so a listener attached at boot would be attached
     to a button that no longer exists. */
  if(e.target.closest('#btn-export')){ exportView(); return; }
  if(e.target.closest('#btn-share')){ shareView(); return; }
  /* Open or re-clip a five-item list.  State is per-element and lives on the
     class, so it resets on navigation -- a card that was left open on one screen
     should not decide the height of a grid row on the next. */
  const more = e.target.closest('.rows-more');
  if(more){
    const list = more.parentElement, open = !list.classList.contains('clip');
    list.classList.toggle('clip', open);
    more.textContent = open
      ? `Show all ${more.dataset.total} ${more.dataset.noun}`
      : `Show fewer`;
    return;
  }
  const nav = e.target.closest('[data-go]');
  if(nav){
    closeMenus();
    /* Picking a screen from the floating rail dismisses it — you asked for a
       screen, not for the menu.  Scoped to the sidebar because `data-go` is also
       how the briefing band's "Open backlog" button navigates, and that one is
       not in a menu that needs closing. */
    if(navOpen() && nav.closest('.nav')) setNav('mini');
    go(nav.dataset.go); return;
  }
  const group = e.target.closest('[data-group]');
  if(group){
    const g = group.dataset.group;
    /* In the collapsed rail a group icon is the only affordance there is, so it
       expands the sidebar and opens that group rather than folding it.

       EXPANDING IS ALL IT DOES.  It used to navigate as well — expand, open the
       group, and go to its first screen — on the reasoning that expanding to a
       list you then have to click again is a wasted step.  In use it is the
       opposite: clicking "Spend" to see what is under Spend also threw the
       reader off whatever screen they were reading and onto Cloud, which is a
       destination they never asked for and cannot undo without knowing where
       they were.  "The sidebar should expand only when the user clicks an item."
       So opening the drawer and choosing from it are two separate acts, and the
       cheap one no longer has the expensive one welded to it. */
    if(isMini()){
      setNav('full'); shutGroups.delete(g); renderNav();
      return;
    }
    shutGroups.has(g) ? shutGroups.delete(g) : shutGroups.add(g);
    renderNav(); return;
  }
  const prof = e.target.closest('#profile-btn');
  if(prof){
    const m = document.getElementById('profile-menu');
    const willOpen = m.hidden;
    closeMenus(); m.hidden = !willOpen;
    prof.setAttribute('aria-expanded', String(willOpen));
    return;
  }
  /* composedPath(), not closest().  A menu that redraws itself in its own click
     handler — the calendar does this on every day you pick, the multi-select on
     every value you tick — has already replaced the clicked node by the time the
     event reaches here, and closest() on a detached node walks an orphaned tree
     and answers "not in a menu".  The menu then closed itself on the click that
     was operating it.  composedPath() is captured when the event is dispatched,
     so it still describes where the click actually happened. */
  const path = e.composedPath ? e.composedPath() : [e.target];
  const inMenu = path.some(n=>n && n.classList && n.classList.contains('menu'));
  if(!inMenu) closeMenus();
});
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  /* One Escape dismisses one layer: a popover first, then the floating rail. */
  if(document.querySelector('.menu.vals') ||
     !document.getElementById('profile-menu').hidden){ closeMenus(); return; }
  if(navOpen()) setNav('mini');
});

/* Collapsing the reconciliation strip (§7).  The state lives on <html>, not in a
   variable, so it survives every re-render for free — and collapsed still keeps
   the equation on one line rather than hiding it, because a reconciliation figure
   you cannot see is the thing this strip exists to prevent. */
function setLedger(mode){
  if(mode==='min') document.documentElement.setAttribute('data-ledger','min');
  else document.documentElement.removeAttribute('data-ledger');
  const b = document.getElementById('ledger-toggle');
  if(b){ b.dataset.tip = ledgerTip(); b.setAttribute('aria-label', ledgerTip()); }
}
/* What the reader last asked for, as distinct from what scrolling is currently
   imposing.  Without the two being separate, auto-collapsing on scroll would
   silently overwrite a deliberate choice and the strip would never come back. */
let ledgerPref = 'full';
function toggleLedger(){
  ledgerPref = ledgerMin() ? 'full' : 'min';
  setLedger(ledgerPref);
}

/* ---- the pinned state (§8) ----
   Two bars pin at the top of a long screen, and pinned they were wrong in three
   ways at once: a 14px transparent band sat between them with the board sliding
   through it, the strip kept the rounded corners and lift of a card that is
   floating on the page rather than welded to the top of the window, and its
   ticket notches — circles the colour of the canvas — passed over moving content
   and read as holes punched in the board.
   So the pinned state is a different state, not the resting one held in place.
   <html data-stuck> is what says so; the CSS does the rest.

   And the strip COLLAPSES when it pins.  Full height it costs 90px of a scrolled
   screen to restate figures the reader has already passed; collapsed it keeps
   the equation, which is the one thing it exists to keep in view.  The reader's
   own choice still wins: expand it while pinned and it stays expanded.

   THE COLLAPSE MUST NOT CHANGE THE DOCUMENT'S HEIGHT, and the first version did,
   which made it flicker the whole way down a screen.  The loop: collapsing
   removed ~43px of document height, the browser clamped the scroll position to
   the shorter page, the shorter page un-pinned the bar, un-pinning expanded it,
   the document grew again — and it oscillated for as long as you kept scrolling.

   A wide dead band suppresses the flicker but is the wrong fix: it has to be
   wider than the height being removed, which pushed "expand again" down into the
   top ten pixels of the page and left the bar collapsed while it was visibly not
   pinned to anything.

   So the height is RESERVED instead.  Collapsing swaps the height it gives up
   into the margin below it, the document stays exactly as long as it was, and
   nothing can feed back into the scroll position — which lets both transitions
   sit tight against the pin where they belong.  The bar frees room in the
   VIEWPORT, which is the point; it was never the document that needed shortening.
   It still refuses to collapse on a screen barely taller than the viewport,
   where there is no scrolling to make room for.

   Measured from the PAGE HEAD, not from the controls row: the head is never
   sticky, so its position in the document is the one thing here that does not
   move when everything else does.

   Driven by a scroll listener rather than an IntersectionObserver, which is
   what the first version used.  An observer answers "is it pinned" and cannot
   express "is it pinned AND have we passed the point where changing our mind is
   safe" — the second question is the whole fix. */
let stickRaf = 0;
function stickTick(){
  stickRaf = 0;
  const html = document.documentElement;
  const ctl = document.querySelector('.controls');
  const head = document.querySelector('#screen > .pagehead');
  /* Cleared, not left alone.  A screen that emits no controls row — sign-in, and
     the ones that compose their own head — has nothing to pin, and a data-stuck
     left over from the previous screen would apply the pinned treatment to a
     page that is pinned to nothing. */
  if(!ctl || !head){
    html.removeAttribute('data-stuck');
    setLedger(ledgerPref);
    return;
  }
  const y = window.scrollY;
  /* Where the controls row starts pinning: the foot of the page head plus its
     6px margin.  Recomputed each tick and self-correcting, which matters because
     a filter change can reflow the head without a navigation. */
  const pin = head.getBoundingClientRect().bottom + y + 6;

  /* data-stuck flips exactly at the pin, and may: the pinned treatment swaps
     14px of margin for 14px of padding, so it changes no height and cannot feed
     back into the scroll position. */
  html.toggleAttribute('data-stuck', y > pin);

  /* WHERE THE STRIP COMES TO REST, measured off the bar it rests under.
     The strip's `top` was the constant --controls-h, which is the row's RESTING
     height — pinned, the row is height:auto plus 12/18 of padding and stands
     14px taller, so the strip parked that far underneath it and the opaque bar
     (z-index 18 against its 12) painted over its top edge.  A second constant
     would have fixed today's numbers and drifted again on the next change to a
     chip, a font size or a breakpoint, so the row is measured instead and the
     stylesheet reads the answer.
     Setting a custom property cannot reflow anything by itself, and the value
     it feeds — a sticky `top` — changes where the strip stops, never how tall
     the document is.  So this is safe to do inside the scroll handler; nothing
     here can feed back into the scroll position the way the collapse once did. */
  html.style.setProperty('--stuck-h', Math.round(ctl.getBoundingClientRect().height) + 'px');

  const roomy = html.scrollHeight - window.innerHeight > 260;
  const min = ledgerMin();
  if(!min && roomy && y > pin + 8)   collapseLedger();
  else if(min && y < pin - 8)        expandLedger();
  else if(min && !roomy)             expandLedger();
}
/* Measured rather than assumed: the strip's collapsed and expanded heights both
   depend on the figures in it, the palette and the window width, so a constant
   here would be wrong on the first screen that disagreed with it. */
function collapseLedger(){
  const led = document.querySelector('.ledger');
  if(!led) { setLedger('min'); return; }
  const full = led.getBoundingClientRect().height;
  setLedger('min');
  const gap = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--grid-gap')) || 22;
  led.style.marginBottom = (gap + full - led.getBoundingClientRect().height) + 'px';
}
function expandLedger(){
  const led = document.querySelector('.ledger');
  if(led) led.style.marginBottom = '';
  setLedger(ledgerPref);
}
const stickCheck = () => { if(!stickRaf) stickRaf = requestAnimationFrame(stickTick); };
window.addEventListener('scroll', stickCheck, {passive:true});
window.addEventListener('resize', stickCheck);
function watchStick(){ stickTick(); }

/* ---- Sidebar states (§8) ----
   Three, not two, and which two are reachable depends on the width:

     full     the 276px rail, in the layout          (wide only)
     mini     the 76px icon rail, in the layout      (both)
     open     the full rail FLOATING over the board  (narrow only)

   The third state exists because the mock-up had a real hole: below 1180px the
   stylesheet hard-forces the mini rail, and the expand control was itself hidden
   there — so on a tablet the seventeen screen names could not be reached at all.
   "It can be expanded and collapsed only in a wider desktop view.  When switching
   to a tablet view, it appears only in a collapsed state, preventing users from
   accessing the sub-items."
   Widening the column in place was the obvious fix and is wrong: 276px of nav out
   of 1000px leaves a board too narrow to read, and every card would reflow twice
   per toggle.  Floating it leaves the mini rail's 76px in the layout, so opening
   and closing the sidebar moves nothing underneath it.

   The attribute carries only the DEVIATION from each width's default, which is
   what lets a window resize be harmless: unset means "whatever this width does
   normally", and the stylesheet's own media query supplies that. */
const NARROW = () => window.matchMedia('(max-width:1180px)').matches;
const navOpen = () => document.documentElement.getAttribute('data-nav')==='open';
/* "Is the rail currently showing icons only" — which is what the group-header
   click needs to know, and it is a question about what is on screen, not about
   which attribute is set. */
const isMini = () => !navOpen() &&
  (document.documentElement.getAttribute('data-nav')==='mini' || NARROW());
function setNav(mode){
  const h = document.documentElement;
  if(mode==='full') NARROW() ? h.setAttribute('data-nav','open') : h.removeAttribute('data-nav');
  else              NARROW() ? h.removeAttribute('data-nav')     : h.setAttribute('data-nav','mini');
}
document.getElementById('nav-collapse').addEventListener('click', ()=>setNav('mini'));
document.getElementById('nav-expand').addEventListener('click', ()=>setNav('full'));
document.getElementById('nav-scrim').addEventListener('click', ()=>setNav('mini'));
/* Crossing the breakpoint with the overlay open would leave a floating panel
   stranded over a layout that has room for it inline. */
window.addEventListener('resize', ()=>{ if(navOpen() && !NARROW()) setNav('mini'); });

document.addEventListener('change', e=>{
  if(e.target.id==='scenario'){
    loadScenario(e.target.value); refresh(); toast('Loaded '+RAW.label, RAW.blurb);
    finnNudge();
  }
});

/* FINN'S ONE PULSE.  Finn is frozen while the conversation is closed — that is the
   `docked` state, and stillness there is a rule rather than an omission (see the
   motion block at the foot of styles.css §12).  Its single exception is `alert`: one
   pulse, once, when something has arrived worth a glance.
   Loading a workspace is the one moment in the mock-up when that is genuinely true,
   so it is the only place this fires, and only when the workspace being loaded
   actually has open alerts.  A pulse over an empty alert feed would be the inert
   control §0.7 forbids, dressed up as motion. */
function finnNudge(){
  if(!(RAW.alerts||[]).length) return;
  if(typeof finnAlert === 'function') finnAlert();
}

document.getElementById('menu-notif').addEventListener('click', ()=>{ closeMenus(); go('alerts'); });
document.getElementById('menu-signout').addEventListener('click', ()=>{
  closeMenus(); go('signin');
  toast('Signed out','See you next time.');
});
/* Loading a real .json file.  fetch() of a local file is blocked from a file://
   origin, so FileReader is the only route that works when the mock-up is opened
   by double-click.  See data/SCHEMA.md. */
document.getElementById('menu-load').addEventListener('click', ()=>{
  closeMenus(); document.getElementById('json-file').click();
});
document.getElementById('json-file').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      const payload = JSON.parse(r.result);
      if(!payload.id || !payload.categories) throw new Error('not a Technomics dataset');
      loadScenario(FINOPTIC.adopt(payload));
      refresh();
      toast('Loaded '+(payload.label||payload.id), f.name+' · '+(payload.blurb||''));
      finnNudge();
    }catch(err){
      toast('Could not read that file', err.message+' — see data/SCHEMA.md for the expected shape.');
    }
    e.target.value = '';
  };
  r.readAsText(f);
});

/* Accent palette switcher — demo-only, and now inside the profile menu rather
   than sitting in the nav looking like a developer control.  Swaps the whole
   brand accent by setting data-palette on <html>; see the [data-palette] blocks
   in styles.css.  Storage is wrapped: some browsers refuse localStorage on a
   file:// origin, and losing persistence must not take the switcher down.
   Default is Blue, not the CSS :root's own Orange — round 17 changed which
   preset a fresh workspace opens on; Orange is still there in the list, just no
   longer first-run. */
(function(){
  const sel = document.getElementById('palette-switch');
  const store = {
    get(){ try{ return localStorage.getItem('finoptic-palette'); }catch(e){ return null; } },
    set(v){ try{ localStorage.setItem('finoptic-palette', v); }catch(e){ /* session only */ } }
  };
  const saved = store.get() || 'blue';
  document.documentElement.setAttribute('data-palette', saved);
  sel.value = saved;
  paintFavicon(saved);
  sel.addEventListener('change', e=>{
    document.documentElement.setAttribute('data-palette', e.target.value);
    store.set(e.target.value);
    paintFavicon(e.target.value);
  });
})();

/* The tab favicon is a static data URI (index.html) — it can't read var(--accent)
   the way everything else does, so without this it would be the one element
   left orange after switching palettes. Re-paints just the background rect's
   fill; the white glyph on top never changes. Hex values mirror the --accent
   each preset sets in styles.css (§ palette presets) — kept in sync by hand
   since a data URI has no access to computed CSS. */
function paintFavicon(palette){
  const hex = {orange:'FF5600', blue:'146EF5', mono:'0B1220'}[palette] || '146EF5';
  const link = document.getElementById('app-favicon');
  if(!link) return;
  link.href = link.href.replace(/fill="%23[0-9A-Fa-f]{6}"\/><g/, `fill="%23${hex}"/><g`);
}

/* ---- boot ----
   A shared link carries the whole view in its hash, so it is restored before
   the first render rather than being navigated to afterwards. */
function restore(){
  const raw = location.hash.slice(1);
  const [screen,qs] = raw.split('?');
  const p = new URLSearchParams(qs||'');
  const sid = p.get('s');
  loadScenario(sid && FINOPTIC.list.some(x=>x.id===sid) ? sid : FINOPTIC.list[0].id, true);
  if(p.get('v') && PERSONA[p.get('v')]) persona = p.get('v');
  /* Every filter is SET from the link, including to nothing.  This used to only
     assign when the parameter was present, so following a link with no product
     filter from a page that had one kept the old one — the URL and the screen
     then disagreed, and the leaked filter narrowed figures nobody had asked to
     narrow.  A shared link describes the whole view or it describes none of it. */
  MULTI.forEach(k=>{
    const v = p.get(k);
    F[k] = v ? v.split(',').filter(Boolean) : [];
  });
  F.period = p.get('period') || FULL_YEAR_PERIOD;
  const r = p.get('range');
  F.range = (F.period===CUSTOM_PERIOD && r && r.includes('~'))
    ? {from:r.split('~')[0], to:r.split('~')[1]} : null;
  /* Two list positions, and both have to survive the round trip as NUMBERS —
     `+` not parseInt-by-accident, because "0~4" carries a legitimate index 0
     (January) and a string "0" would sail through a truthiness check and then
     index PERIODS as undefined. */
  const sp = p.get('span');
  F.span = null;
  if(F.period===MONTH_RANGE && sp && sp.includes('~')){
    const a = +sp.split('~')[0], b = +sp.split('~')[1];
    if(Number.isInteger(a) && Number.isInteger(b)
       && a>=0 && b>=0 && a<PERIODS.length && b<PERIODS.length) F.span = {from:a, to:b};
  }
  /* A custom period with no range restored is a period that means nothing, so it
     falls back rather than silently resolving to the full year under a chip that
     still says "Custom".  Same for a month range with no span. */
  if(F.period===CUSTOM_PERIOD && !F.range) F.period = FULL_YEAR_PERIOD;
  if(F.period===MONTH_RANGE && !F.span) F.period = FULL_YEAR_PERIOD;
  /* WITH NO LINK TO RESTORE, OPEN ON SIGN-IN.  It is the product's front door, so
     it is the product's home page, and a demo that starts there tells the story in
     the order a customer would meet it.
     Two earlier defaults and why they went: the active view's home screen, which
     meant a cold start landed on IT financial management — a persona screen chosen
     by a dropdown nobody had touched; and then the Executive Dashboard, which is
     still the first screen you see after signing in and is still what makes the
     sidebar's fold state coherent (Overview is the only group that opens — see
     shutGroups).  Sign-in simply comes before it.
     A shared link still wins — `screen` comes from the hash — so every URL in
     circulation opens on the board it names rather than on a login. */
  return screen || 'signin';
}
fillChrome();
const start = restore();
go(start, false);
/* Hands the cold-start preloader its cue.  motion.js raises the veil at load,
   before anything has rendered; it is lowered from HERE, once the first screen is
   in the DOM, so what the veil lifts off is a finished board rather than a blank
   one.  Optional like the rest of MOTION — motion.js arms its own failsafe
   timer, because a splash screen that never lifts is the single failure a demo
   cannot survive. */
if(window.MOTION) MOTION.boot();
/* Restores state from a link pasted while the page is already open. */
window.addEventListener('hashchange', ()=>{ const id = restore(); go(id,false); });
