/* ============================================================
   Finoptic — tablekit: the sort-and-filter control every COLUMN carries
   ------------------------------------------------------------
   Loaded immediately after components.js, which builds the markup this drives.
   Plain <script>, not a module, so everything here is a shared global — but only
   the four delegated listeners at the foot run at load time, and they attach to
   `document`, which always exists.

   WHERE THE CONTROL LIVES, AND WHY IT MOVED TWICE.  Round 7 made every column
   header a sort button and gave each table a find box; round 8 replaced both
   with a single table-level "Sort & filter" popover holding a sort list and a
   set of per-column value lists behind a second pane.  That collapsed two
   controls into one, which was the ask — but it put the control for a column
   somewhere other than the column, so finding "filter this one" meant opening a
   menu, reading a list of column names, and choosing the name of the column you
   were already pointing at.  Round 9: "I need a unified sort and filter for each
   column."  So the control is ON the header now, one per column, and it holds
   everything that column can do — sort ascending, sort descending, and its own
   multi-select filter — in one flat menu with no second level.

   THE HEADER IS THE BUTTON, and it costs no layout width.  An icon added to
   every <th> would widen every table by ~18px per column, and the stylesheet's
   own notes record that nine tables were one bad decision away from a
   horizontal scrollbar at 1200px.  So the button is a transparent overlay on the
   cell (inset:0) and the only ink is a small mark at the right edge, which
   appears on hover and stays lit while that column is sorted or filtered.  A
   header that is inert until you touch it looks exactly like the header it
   replaced.

   WHY IT READS THE RENDERED CELLS.  Carried over unchanged, and it is the
   decision everything else here follows from: about forty call sites across the
   screens build tables out of arrays of pre-formatted HTML strings.  Threading a
   comparator, a filter key and a value vocabulary through all forty would be
   forty edits and forty chances to disagree with what the cell actually says.
   Reading the cell means every table gets sorting, multi-column filtering and
   value lists at once, and none of them can drift from what is on screen.  The
   cost is that this file has to know that "$1.62M" is bigger than "$980K", that
   a real minus sign is not a hyphen, that "12 Jun 2026" follows "3 Feb 2026",
   and that severity and the optimisation pipeline are progressions rather than
   alphabets.

   STATE RESETS ON RE-RENDER, deliberately.  A screen is rebuilt wholesale on
   every filter or dataset change, so per-table state is held in a WeakMap keyed
   by the .tbl element and simply falls away with it.  That is also why every
   listener here is delegated on `document`: anything bound to an element inside
   #screen would be bound to an element that no longer exists.
   ============================================================ */

/* ---- thresholds ---- */
/* TWO rows, not four.  The old threshold suppressed the control on short tables
   on the argument that neither sorting nor filtering does anything a reader
   cannot do by eye — true, and beside the point once the control lives on the
   header: "some tables still lack this sort and filter entirely."  A board where
   the same affordance is present on one card and absent on the next teaches the
   reader that it is unreliable, which costs more than the two rows it saves.
   One row is the floor because a single row has no order to put itself in. */
const TBL_TOOLS_MIN = 2;
/* Past this many distinct values a checklist is a search problem, not a
   checklist — and the "contains" box at the top of the menu is the search. */
const TK_LIST_MAX = 40;
/* Past this many characters the values are sentences rather than labels.  This
   is what keeps a column of opportunity names ("Rightsize 14 over-provisioned
   EC2 instances") out of the value lists: ticking one sentence is just a slower
   way of typing part of it.  Such a column still sorts, and still filters
   through its own contains box. */
const TK_LABEL_MAX = 28;
/* Below this many options the find box inside a column's menu is chrome. */
const TK_FIND_MIN = 8;
/* Quartile bands need enough rows to mean anything; under this a column of
   figures falls back to a plain list of its values. */
const TK_BAND_MIN_ROWS = 6;
const TK_BANDS = 4;

/* Severity, effort/confidence and the optimisation pipeline are ORDERED
   vocabularies, not alphabets — "Approved" before "Identified" is not an
   ordering anyone asked for.  A rank hit also tells the classifier below that
   the column is a vocabulary rather than a measurement, which is why bands never
   land on it. */
const TK_RANK = {
  'critical':4,'high':3,'medium':2,'low':1,
  'identified':1,'under review':2,'approved':3,'in progress':4,'implemented':5,
  'healthy':3,'degraded':2,'manual':1
};

/* ---- reading a cell ----
   Text as a READER sees it, which is not the same as textContent.  Two things
   are stripped, for two different reasons:

   [aria-hidden="true"] — an avatar puts the initials "SM" in the DOM immediately
   before the name, so a raw read sorted S. Menon under "SM" and would have
   offered "SMS. Menon" as a filter value.  Everything decorative is already
   marked hidden for screen readers, and that is exactly the set a filter does
   not want either.

   .sub — the secondary line is context, not identity.  A SaaS row is
   `<b>Slack</b><span class="sub">Slack · Collaboration</span>`, and a value list
   offering "SlackSlack · Collaboration" is offering the row, not the value.  It
   falls back to the whole cell when the sub-line is all there is, so an
   "Unassigned" owner still has a value to tick.

   This is NOT shell.js's cellText(): that one feeds the CSV export, where a
   faithful concatenation of everything visible is the right answer.  Here the
   answer wanted is the shortest text that identifies the row's value. */
function tkFlat(n){
  if(n.nodeType === 3) return n.nodeValue;
  let out = '';
  n.childNodes.forEach(c=>{
    const s = tkFlat(c);
    /* A space between element children, because the DOM has no whitespace
       between adjacent spans and "CC-1042" + "Cloud" must not become one word. */
    if(c.nodeType === 1 && out && !/\s$/.test(out) && !/^\s/.test(s)) out += ' ';
    out += s;
  });
  return out;
}
const tkTidy = s => String(s).replace(/ /g,' ').replace(/\s+/g,' ').trim();
function tkText(node){
  if(!node) return '';
  const c = node.cloneNode(true);
  c.querySelectorAll('[aria-hidden="true"]').forEach(n=>n.remove());
  /* The header's own control is inside the cell it labels, so it has to come out
     before the label is read — otherwise every column would be called
     "Sort and filter <name>". */
  c.querySelectorAll('.th-mk').forEach(n=>n.remove());
  const lean = c.cloneNode(true);
  lean.querySelectorAll('.sub').forEach(n=>n.remove());
  const short = tkTidy(tkFlat(lean));
  return short || tkTidy(tkFlat(c));
}
/* A column's contains box searches that column's cell AS READ, sub-lines and
   all — you should be able to find a SaaS row by its category even though the
   category is never a value in the Application column. */
function tkCellFull(td){
  if(!td) return '';
  const c = td.cloneNode(true);
  c.querySelectorAll('[aria-hidden="true"]').forEach(n=>n.remove());
  return tkTidy(tkFlat(c)).toLowerCase();
}

/* A cell's sortable key, and — the part the old sortKey() never had to answer —
   what KIND of thing the cell is, which is what decides whether its column
   offers a list of values, a set of bands, or neither, and how its two sort
   directions are worded. */
function tkKey(t){
  if(!t || t === '—') return {kind:'blank', n:-Infinity, s:''};
  const rank = TK_RANK[t.toLowerCase()];
  if(rank !== undefined) return {kind:'rank', n:rank, s:t};
  const d = typeof parseDate === 'function' ? parseDate(t) : null;
  if(d) return {kind:'date', n:d.getTime(), s:t};
  /* $1.62M / $980K / +43% / 2,340 / −$40K / 1.8 days.  The sign is read off the
     leading character rather than left to parseFloat, because these figures are
     formatted with a real minus sign (U+2212), which parseFloat stops dead on.
     ANCHORED, both ends.  An unanchored match meant any cell that merely
     CONTAINED a digit counted as a number, so "Terminate 3 idle EC2 instances"
     sorted as 3 and its column came back in no order at all. */
  const cleaned = t.replace(/,/g,'').replace(/−/g,'-');
  const m = cleaned.match(
    /^([-+(]?)\$?\s*(\d+(?:\.\d+)?)\s*([KMB])?\s*(?:%|days?|hrs?|hours?|months?|mo|[KMGTP]B|seats?)?\)?$/i);
  if(m){
    let v = parseFloat(m[2]);
    if(m[1] === '-' || m[1] === '(') v = -v;
    const suf = (m[3]||'').toUpperCase();
    v *= suf === 'K' ? 1e3 : suf === 'M' ? 1e6 : suf === 'B' ? 1e9 : 1;
    return {kind:'num', n:v, s:t};
  }
  return {kind:'text', n:null, s:t};
}

/* ---- per-table state ----
   Keyed by the .tbl element, so it is collected with the element the next render
   throws away.  `rows` is the PRISTINE order, which is what lets "Original
   order" exist: the source order is usually a ranking (the backlog is sorted by
   annual value) and losing it to a sort you cannot undo is a real loss.

   `q` is a MAP now, not one string.  It was a single "any column contains" box
   belonging to the table-level menu; with the control on each header the search
   belongs to the column it is opened from, which also means two of them AND
   together like every other pair of column conditions. */
const TK = new WeakMap();
function tkState(wrap){
  let st = TK.get(wrap);
  if(st) return st;
  const tbody = wrap.querySelector('tbody');
  const rows = [...tbody.querySelectorAll('tr:not(.total)')];
  st = {
    wrap, tbody, rows,
    idx: new Map(rows.map((tr,i)=>[tr,i])),
    total: tbody.querySelector('tr.total'),
    ths: [...wrap.querySelectorAll('thead th')],
    cols: null, sort: null, sel: {}, q: {}, open: null
  };
  TK.set(wrap, st);
  return st;
}

/* ---- what a column offers ----
   A distinct-value list is right for a column of statuses and useless for a
   column where every value is unique.  Four tests, applied to the rendered
   cells, in this order:

     1. all cells are a RANK word  -> value list, in rank order, not alphabetical
     2. all cells are figures or dates, and there are enough of them
                                   -> four quartile BANDS, labelled with real
                                      values off the boundary rows
     3. few enough distinct values, and short enough to be labels
                                   -> value list
     4. otherwise                  -> no checklist; the column still sorts, and
                                      its own contains box covers it

   Test 4 is the one that matters most: it is what stops a column of sentences
   from becoming a checklist of sentences. */
function tkCols(st){
  if(st.cols) return st.cols;
  st.cols = st.ths.map((th,i)=>{
    const label = tkText(th) || ('Column ' + (i+1));
    const texts = st.rows.map(tr=>tkText(tr.children[i]));
    const full  = st.rows.map(tr=>tkCellFull(tr.children[i]));
    const keys = texts.map(tkKey);
    const kinds = new Set(keys.map(k=>k.kind).filter(k=>k !== 'blank'));
    const counts = new Map();
    texts.forEach(t=>{ const v = t || '—'; counts.set(v, (counts.get(v)||0) + 1); });
    const vals = [...counts.keys()];
    const one = kinds.size === 1;
    const quant = one && (kinds.has('num') || kinds.has('date'));
    const ranky = one && kinds.has('rank');
    /* The single kind, where there is one — it is what words the two sort
       directions.  Mixed columns are treated as text, which is what comparing
       them actually does. */
    const kind = one ? [...kinds][0] : 'text';
    const col = {label, keys, texts, full, quant, kind, mode:'none', list:null, bands:null,
                 dir: (one && kinds.has('num')) ? -1 : 1};
    if(quant && vals.length >= TK_BANDS && st.rows.length >= TK_BAND_MIN_ROWS){
      col.bands = tkBands(keys);
      if(col.bands) col.mode = 'band';
    }
    if(col.mode === 'none' && vals.length >= 2 && vals.length <= TK_LIST_MAX
       && Math.max(...vals.map(v=>v.length)) <= TK_LABEL_MAX){
      col.list = vals.map(v=>({v, n:counts.get(v)}));
      col.list.sort((a,b)=>{
        if(ranky) return (TK_RANK[a.v.toLowerCase()]||0) - (TK_RANK[b.v.toLowerCase()]||0);
        if(quant) return tkKey(a.v).n - tkKey(b.v).n;
        return a.v.localeCompare(b.v, 'en', {numeric:true});
      });
      col.mode = 'list';
    }
    return col;
  });
  return st.cols;
}
/* Quartiles, cut on the sorted values and LABELLED WITH REAL CELL TEXT off the
   boundary rows — "≥ $1.2M", not "top 25%".  Two reasons: the boundary is then
   a number the reader has already seen in the column, and it costs no
   formatter, so the same code labels money, percentages, counts and dates.
   Deliberately not "quarter": in a finance product Q means the fiscal quarter.
   Boundaries that collide are dropped, so a column of four values that happen to
   be three distinct numbers yields three bands rather than an empty one. */
function tkBands(keys){
  const pts = keys.filter(k=>Number.isFinite(k.n) && k.kind !== 'blank')
    .map(k=>({n:k.n, s:k.s})).sort((a,b)=>a.n - b.n);
  if(pts.length < TK_BANDS) return null;
  const cuts = [];
  for(let b = 1; b < TK_BANDS; b++){
    const p = pts[Math.round(b * pts.length / TK_BANDS)];
    if(p && (!cuts.length || cuts[cuts.length-1].n < p.n)) cuts.push(p);
  }
  if(!cuts.length) return null;
  const bands = [];
  for(let i = cuts.length - 1; i >= 0; i--){
    const lo = cuts[i], hi = cuts[i+1];
    bands.push({lo:lo.n, hi:hi ? hi.n : Infinity,
                label: hi ? lo.s + ' – ' + hi.s : '≥ ' + lo.s});
  }
  bands.push({lo:-Infinity, hi:cuts[0].n, label:'< ' + cuts[0].s});
  bands.forEach(b=>{ b.n = pts.filter(p=>p.n >= b.lo && p.n < b.hi).length; });
  return bands;
}

/* ---- what is currently on ----
   A selection of EVERY value says the same thing as no selection at all, so it
   does not count towards the badge and does not stand the total row down.  The
   ticks are still kept, because un-ticking one value from "all of them" is a
   normal way to reach a filter and silently emptying the list under the cursor
   is not. */
function tkColOn(st, i){
  if(st.q[i]) return true;
  const s = st.sel[i];
  if(!s || !s.size) return false;
  const c = tkCols(st)[i];
  const total = c.mode === 'band' ? c.bands.length : (c.list ? c.list.length : 0);
  return s.size < total;
}
const tkCount = st => tkCols(st).reduce((a,c,i)=>a + (tkColOn(st,i) ? 1 : 0), 0);
const tkAny = st => tkCount(st) > 0 || !!st.sort;

function tkPass(st, r){
  const cols = tkCols(st);
  for(let i = 0; i < cols.length; i++){
    if(!tkColOn(st, i)) continue;
    const c = cols[i];
    /* Every active column has to agree — "multiple rows and multiple columns",
       which is an AND across columns and an OR within one.  A column's contains
       box and its ticks are themselves ANDed: both were set deliberately. */
    if(st.q[i] && !c.full[r].includes(st.q[i])) return false;
    const on = st.sel[i];
    if(!on || !on.size) continue;
    const total = c.mode === 'band' ? c.bands.length : (c.list ? c.list.length : 0);
    if(on.size >= total) continue;
    if(c.mode === 'band'){
      const n = c.keys[r].n;
      if(![...on].some(k=>{ const b = c.bands[+k]; return b && n >= b.lo && n < b.hi; })) return false;
    } else if(!on.has(c.texts[r] || '—')) return false;
  }
  return true;
}

/* ---- applying it to the DOM ---- */
function tkApply(st){
  const cols = tkCols(st);
  let shown = 0;
  st.rows.forEach((tr,r)=>{ const ok = tkPass(st, r); tr.hidden = !ok; if(ok) shown++; });

  const order = st.sort ? [...st.rows].sort((a,b)=>{
    const c = cols[st.sort.col], A = c.keys[st.idx.get(a)], B = c.keys[st.idx.get(b)];
    if(A.n !== null && B.n !== null) return (A.n - B.n) * st.sort.dir;
    return A.s.localeCompare(B.s, 'en', {numeric:true}) * st.sort.dir;
  }) : st.rows;
  order.forEach(tr=>st.tbody.appendChild(tr));
  /* The total row is a summary of the table, not a member of it: never sorted
     into the middle, and stood down entirely while a filter is on, because a
     total of rows you can no longer see quietly contradicts what is on screen. */
  const n = tkCount(st);
  if(st.total){ st.tbody.appendChild(st.total); st.total.hidden = n > 0; }

  /* The header carries its own state, which is the point of moving the control
     onto it: a reader should be able to see WHICH column is sorted and WHICH is
     filtered without opening anything. */
  st.ths.forEach((th,i)=>{
    const sorted = st.sort && st.sort.col === i;
    if(sorted) th.setAttribute('aria-sort', st.sort.dir === 1 ? 'ascending' : 'descending');
    else th.removeAttribute('aria-sort');
    th.classList.toggle('tk-sorted', !!sorted);
    th.classList.toggle('tk-desc', !!sorted && st.sort.dir === -1);
    th.classList.toggle('tk-filtered', tkColOn(st, i));
  });

  st.wrap.classList.toggle('tk-on', tkAny(st));
  /* The status line names whichever condition is on.  A sort is a real change to
     what the reader is looking at — the backlog's source order IS a ranking — so
     "Clear all" appearing with nothing beside it would leave them guessing what
     there was to clear. */
  const cnt = st.wrap.querySelector('[data-tk-count]');
  if(cnt) cnt.textContent = n
    ? shown + ' of ' + st.rows.length + ' rows'
    : (st.sort ? 'Sorted by ' + cols[st.sort.col].label : '');

  /* An honest empty state: a filter combination can legitimately select nothing,
     and "nothing" must not look like "zero". */
  const none = st.wrap.querySelector('.tbl-none'), gone = n > 0 && shown === 0;
  if(none) none.hidden = !gone;
  const scroll = st.wrap.querySelector('.tbl-scroll');
  if(scroll) scroll.hidden = gone;
}

function tkReset(st){ st.sort = null; st.sel = {}; st.q = {}; }

/* ---- the menu ----
   PORTALLED TO <body> and positioned by shell.js's own placeMenu(), for exactly
   the reason the note above openDimMenu() gives: a popover appended inside its
   own control is clipped by the first ancestor with a non-visible overflow, and
   .tbl-scroll — an ancestor of every header — is overflow-x:auto, which promotes
   the other axis to auto alongside it.  A menu opened in there would be cut away
   on both axes.  Out on <body> nothing can clip it, and reusing placeMenu means
   there is one rule for how a floating thing finds its anchor rather than two
   that can drift.

   It is NOT given the .vals class the filter pills use.  That class is how
   shell.js's repositionMenus() recognises a pill menu, and it resolves the
   anchor by dimension — it would find none for a table and close this one on the
   first scroll event.

   ONE LEVEL, no panes.  The previous version had a main list and a per-column
   sub-pane with a back button; a menu that belongs to one column has nothing to
   drill into. */
const tkEsc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* The four wordings the brief names, chosen by what the column holds: "sort
   ascending, sort descending, sort A to Z, sort Z to A depending on the column's
   content".  The second line says what that means in this column's own terms,
   because "ascending" on a column of money and "ascending" on a column of dates
   are different promises. */
function tkSortWords(c){
  if(c.kind === 'num')  return ['Sort ascending','Sort descending','smallest first','largest first'];
  if(c.kind === 'date') return ['Sort ascending','Sort descending','oldest first','newest first'];
  if(c.kind === 'rank') return ['Sort ascending','Sort descending','lowest first','highest first'];
  return ['Sort A to Z','Sort Z to A','first to last','last to first'];
}

function tkOpts(c){
  return c.mode === 'band'
    ? c.bands.map((b,k)=>({key:String(k), label:b.label, n:b.n}))
    : (c.list || []).map(v=>({key:v.v, label:v.v, n:v.n}));
}

/* Three 14px line glyphs, drawn here rather than pulled from icons.js: those are
   Heroicons at 24px solid, and a solid glyph shrunk to 14px inside a menu row is
   a blob.  Same reasoning as the header marks in styles.css. */
const TK_ICON = {
  up:   '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M8 3 4.5 6.5M8 3l3.5 3.5"/></svg>',
  down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M8 13l3.5-3.5M8 13 4.5 9.5"/></svg>',
  undo: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 3v2.6h2.6"/></svg>'
};

function tkMenuHTML(st, i){
  const c = tkCols(st)[i], on = st.sel[i] || new Set(), opts = tkOpts(c);
  const w = tkSortWords(c);
  const sorted = st.sort && st.sort.col === i;
  const up = sorted && st.sort.dir === 1;
  const dn = sorted && st.sort.dir === -1;
  const anyOn = tkColOn(st, i) || sorted;
  /* A column with no checklist still gets a contains box — that is the whole
     provision for the sentence columns test 4 excludes, and without it those
     columns would sort and nothing else. */
  const findable = opts.length >= TK_FIND_MIN || !opts.length;
  /* ROW, not two lines.  The column's name and its Clear sit on one line at
     micro weight, because the reader already knows which column they opened —
     they clicked its header — so this is a confirmation, not a title. */
  return `<div class="tk-h">
      <span class="tk-t">${tkEsc(c.label)}</span>
      ${anyOn ? `<button class="tk-clear" type="button" data-tk-clearcol>Reset</button>` : ''}
    </div>
    <div class="tk-grp">
      <button class="tk-row${up ? ' on' : ''}" type="button" data-tk-dir="1"
        ><i class="tk-i">${TK_ICON.up}</i><span class="tk-n">${w[0]}</span
        ><span class="tk-c">${w[2]}</span></button>
      <button class="tk-row${dn ? ' on' : ''}" type="button" data-tk-dir="-1"
        ><i class="tk-i">${TK_ICON.down}</i><span class="tk-n">${w[1]}</span
        ><span class="tk-c">${w[3]}</span></button>
      ${sorted ? `<button class="tk-row" type="button" data-tk-dir="0"
        ><i class="tk-i">${TK_ICON.undo}</i><span class="tk-n">Original order</span></button>` : ''}
    </div>
    ${(findable || opts.length) ? `<div class="tk-sec">Filter${
      on.size ? `<span class="tk-badge">${on.size}</span>` : ''}</div>` : ''}
    ${findable ? `<label class="tk-find">${icon('filter',true)}
      <input type="search" data-tk-find placeholder="Contains…"
             aria-label="Show only rows where ${tkEsc(c.label)} contains"></label>` : ''}
    ${opts.length ? `<div class="tk-grp tk-list">
      <button class="tk-row tk-opt${on.size ? '' : ' on'}" type="button" data-tk-all
        ><span class="tk-box" aria-hidden="true"></span
        ><span class="tk-n">${c.mode === 'band' ? 'Any value' : 'All values'}</span
        ><span class="tk-c">${st.rows.length}</span></button>
      ${opts.map(o=>`<button class="tk-row tk-opt${on.has(o.key) ? ' on' : ''}" type="button"
          data-tk-v="${tkEsc(o.key)}" role="option" aria-selected="${on.has(o.key)}"
          ><span class="tk-box" aria-hidden="true"></span
          ><span class="tk-n">${tkEsc(o.label)}</span><span class="tk-c">${o.n}</span></button>`).join('')}
      </div>` : (findable ? `<p class="tk-hint">Every row in this column says something
        different, so there is nothing to tick — the box above is the way to narrow it.</p>` : '')}
    <div class="tk-f"><kbd>Esc</kbd> to close</div>`;
}

function tkDraw(m, st){
  m.innerHTML = tkMenuHTML(st, st.open);
  /* Set, not interpolated: the query never has to be HTML-escaped, and a value
     assigned after insertion cannot be lost to a stray quote in it. */
  const q = m.querySelector('[data-tk-find]');
  if(q) q.value = st.q[st.open] || '';
  const th = tkAnchor(m);
  if(th) placeMenu(m, th);
}
/* A value toggle repaints in place rather than redrawing.  Redrawing would
   destroy the find box the user is typing into and drop the scroll position of a
   thirty-value list on every tick — the same reason syncMulti() exists for the
   filter pills. */
function tkPaint(m, st){
  const on = st.sel[st.open] || new Set();
  const opts = m.querySelectorAll('.tk-opt[data-tk-v]');
  opts.forEach(b=>{
    const yes = on.has(b.dataset.tkV);
    b.classList.toggle('on', yes);
    b.setAttribute('aria-selected', String(yes));
  });
  const all = m.querySelector('[data-tk-all]');
  if(all) all.classList.toggle('on', !on.size);
  const sec = m.querySelector('.tk-sec');
  if(sec) sec.innerHTML = 'Filter' + (on.size ? `<span class="tk-badge">${on.size}</span>` : '');
  /* Reset is created and destroyed rather than hidden: it only exists while
     there is something to reset, so the header row has no gap holding a place
     for a control that is not there. */
  const h = m.querySelector('.tk-h'), live = tkColOn(st, st.open) || (st.sort && st.sort.col === st.open);
  const clr = m.querySelector('[data-tk-clearcol]');
  if(live && !clr && h)
    h.insertAdjacentHTML('beforeend',
      '<button class="tk-clear" type="button" data-tk-clearcol>Reset</button>');
  else if(!live && clr) clr.remove();
}

function tkMenu(){ return document.querySelector('.menu.tblmenu'); }
function tkAnchor(m){
  const wrap = document.querySelector('.tbl[data-tbl="' + m.dataset.tkFor + '"]');
  return wrap ? wrap.querySelectorAll('thead th')[+m.dataset.tkCol] : null;
}
function tkClose(){
  const m = tkMenu();
  if(m) m.remove();
  document.querySelectorAll('.th-b[aria-expanded="true"]')
    .forEach(b=>b.setAttribute('aria-expanded','false'));
}
function tkOpen(btn){
  const wrap = btn.closest('.tbl'), st = tkState(wrap);
  st.open = +btn.dataset.tkCol;
  const m = document.createElement('div');
  m.className = 'menu tblmenu';
  m.dataset.tkFor = wrap.dataset.tbl;
  m.dataset.tkCol = String(st.open);
  document.body.appendChild(m);
  btn.setAttribute('aria-expanded','true');
  tkDraw(m, st);
}
/* The menu belongs to a table that a re-render replaces, so a stale one has to
   go.  The id is the test: tblUid climbs on every render, so the id a menu was
   opened against cannot survive into the next one.  Run a tick late because the
   re-render happens inside the very click being handled. */
function tkSweep(){
  const m = tkMenu();
  if(!m) return;
  if(m.hidden || !document.querySelector('.tbl[data-tbl="' + m.dataset.tkFor + '"]')) tkClose();
}
function tkFor(m){
  const wrap = document.querySelector('.tbl[data-tbl="' + m.dataset.tkFor + '"]');
  return wrap ? tkState(wrap) : null;
}
/* A fixed menu does not travel with the header it hangs off, so it is
   re-anchored whenever that header could have moved — and closed if the table
   went away underneath it.  Scrolling the menu's own list is not the header
   moving.  shell.js's repositionMenus() only ever looks at .menu.vals, so this
   is not a duplicate of it. */
function tkReanchor(e){
  const m = tkMenu();
  if(!m) return;
  if(e && e.target && e.target.nodeType === 1 && m.contains(e.target)) return;
  const th = tkAnchor(m);
  th ? placeMenu(m, th) : tkClose();
}
window.addEventListener('scroll', tkReanchor, true);
window.addEventListener('resize', tkReanchor);

/* ---- delegated on document, because #screen is replaced wholesale ---- */
document.addEventListener('click', e=>{
  const open = e.target.closest('.th-b[data-tk-col]');
  if(open){
    const m = tkMenu();
    const mine = m && m.dataset.tkFor === open.closest('.tbl').dataset.tbl
                   && m.dataset.tkCol === open.dataset.tkCol;
    /* shell.js owns the filter pills and the profile menu; opening this one
       closes those, so only one popover is ever up. */
    closeMenus(); tkClose();
    if(!mine) tkOpen(open);
    /* STOPPED HERE, immediately.  shell.js's document click handler ends with
       "if the click was not inside a .menu, close every menu" — and the header
       that opens this one is, correctly, not inside a menu.  Its listener was
       registered first (shell.js loads last) so it would run next and hide the
       menu on the click that opened it.  The alternative — registering these
       listeners from a DOMContentLoaded callback so they land after shell's — was
       rejected: it makes the load order in index.html stop describing the file,
       and a listener that only works if it is attached late is a trap. */
    e.stopImmediatePropagation();
    return;
  }
  const tools = e.target.closest('.tbl-tools [data-tk-clear], .tbl-none [data-tk-clear]');
  if(tools){
    const st = tkState(tools.closest('.tbl'));
    tkReset(st); tkClose(); tkApply(st);
    e.stopImmediatePropagation();
    return;
  }
  const m = e.target.closest('.menu.tblmenu');
  if(!m){ if(tkMenu()) tkClose(); setTimeout(tkSweep, 0); return; }
  const st = tkFor(m);
  if(!st){ tkClose(); return; }

  /* Per-column, alongside the table's own Clear, for the same reason a filter
     pill has its own × as well as a Clear for all of them: undoing one condition
     should not cost you the other three. */
  if(e.target.closest('[data-tk-clearcol]')){
    st.sel[st.open] = new Set(); delete st.q[st.open];
    if(st.sort && st.sort.col === st.open) st.sort = null;
    tkDraw(m, st); tkApply(st); return;
  }
  const dir = e.target.closest('[data-tk-dir]');
  if(dir){
    /* Both directions are offered outright rather than as one button that
       reverses on a second press.  The old control had to be economical — a pair
       of arrows per row would have been thirty hit targets on a ten-column table
       — but a menu that belongs to ONE column can afford to name both, and
       naming them is what lets the wording follow the content. */
    const d = +dir.dataset.tkDir;
    st.sort = d ? {col:st.open, dir:d} : null;
    tkDraw(m, st); tkApply(st);
    return;
  }
  if(e.target.closest('[data-tk-all]')){ st.sel[st.open] = new Set(); tkPaint(m, st); tkApply(st); return; }
  const v = e.target.closest('[data-tk-v]');
  if(v){
    /* Multi-select, and the menu STAYS OPEN.  Closing after each pick would make
       choosing three categories three round trips through the header, which is
       the whole thing multi-select exists to avoid. */
    const s = st.sel[st.open] || (st.sel[st.open] = new Set());
    s.has(v.dataset.tkV) ? s.delete(v.dataset.tkV) : s.add(v.dataset.tkV);
    tkPaint(m, st); tkApply(st);
  }
});
/* A re-render is always the tail of some click or select change, and it happens
   after this file's handlers have run — so the stale-menu check has to wait a
   tick for it. */
document.addEventListener('change', ()=>setTimeout(tkSweep, 0));
/* …except a route change, which arrives as neither: the back button and a
   pasted share link both re-render the board without a click anywhere. */
window.addEventListener('hashchange', ()=>setTimeout(tkSweep, 0));

document.addEventListener('input', e=>{
  const m = e.target.closest('.menu.tblmenu');
  if(!m) return;
  const st = tkFor(m);
  if(!st || !e.target.matches('[data-tk-find]')) return;
  const q = e.target.value.trim().toLowerCase();
  if(q) st.q[st.open] = q; else delete st.q[st.open];
  tkApply(st);
  /* The list of ticks narrows with the box, so typing is a way to reach a value
     as well as a filter in its own right. */
  m.querySelectorAll('.tk-opt[data-tk-v]').forEach(b=>{
    b.hidden = !!q && !b.textContent.toLowerCase().includes(q);
  });
  /* Only the two affected controls are repainted: redrawing the menu would take
     the focus out of the box being typed into on the first keystroke. */
  const h = m.querySelector('.tk-h'), live = tkColOn(st, st.open) || (st.sort && st.sort.col === st.open);
  const clr = m.querySelector('[data-tk-clearcol]');
  if(live && !clr && h)
    h.insertAdjacentHTML('beforeend',
      '<button class="tk-clear" type="button" data-tk-clearcol>Reset</button>');
  else if(!live && clr) clr.remove();
});

document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape' || !tkMenu()) return;
  /* shell.js's own rule is that one Escape dismisses one layer; this popover is
     the top one, so it takes the key and shell's handler — which would otherwise
     go on to collapse the sidebar — does not see it. */
  tkClose();
  e.stopImmediatePropagation();
});
