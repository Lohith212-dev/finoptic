/* ============================================================
   Finoptic — people: the human avatar, and the initials orb behind it
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  This file sits after charts.js and before screens.js, so
   any screen may call avatarHTML()/personCell() during a render.

   Nothing here runs at load time.  It reads no dataset and touches no DOM, so
   it is safe wherever it is loaded from.

   WHAT THIS IS FOR.  Every owner column in the mock-up is a bare string today —
   "Sujeev" in a cell, nine rows down a table.  A name is not a face, and a
   board that is meant to say "someone owns this" reads better when the someone
   is visible.  Photos are the goal; the orb is what stands in until the client
   supplies them, and — because a real deployment will always have someone who
   never uploaded one — permanently for the rest.

   THE ORB IS NOT A BRAND MARK AND NOT A CHART KEY.  Those two already exist and
   already mean something (§5, §6):
     · .bm / .bm-l — 17px, 3px corners, a VENDOR.  .bm-l is literally an initial
       on a tinted square, which is one careless decision away from this.
     · .swatch — 9px, 2px corners, saturated: "this row is that colour in the
       chart above."
   The orb is therefore the one ROUND token in the system.  Every other token
   here is a square with a named radius (--r-tile 9 / --r-chip 6 / brand 3 /
   swatch 2), so roundness alone says "person" with no legend needed.  The
   obvious alternative was a rounded square matching .avatar in the sidebar; it
   loses because at 20px in a table, a rounded square beside a 17px brand mark
   reads as the same kind of object — and the vendor table puts the two in
   adjacent columns.  .avatar keeps its square corners and its accent gradient:
   it is the signed-in user in a piece of chrome, not a row in a table.

   AND IT IS QUIET.  A saturated disc with white initials is the industry default
   and it is wrong here: the SaaS table is sixteen rows, and sixteen saturated
   discs down a column would out-shout every figure beside them — the "collection
   of boxes" fault in a new costume.  The orb takes the wash/ink pairing the
   guide already uses for badges (§2): the hue at low strength behind, the same
   hue driven down toward --ink for the letters.  Text is read, so text takes the
   ink step.  That is also what keeps two characters legible at 20px.
   ============================================================ */

/* The tone set deliberately SKIPS --c1.  Slot 1 is the accent, and the accent is
   rationed to chrome, one primary action, one hero tile and the lead series
   (§2) — spending it on whoever happens to hash to slot 0 would put brand
   colour on an arbitrary person.  Status hues are excluded for the same reason
   they are excluded from the spectrum: a person is not an alert. */
const PERSON_TONES = ['--c2','--c3','--c4','--c5','--c6','--c7','--c8'];

/* djb2, and it is the FALLBACK, not the rule — see PERSON_TONE below.  What
   matters is that it is computed from the name and never from position in a
   list, so a person unknown to the roster is still the same colour in the
   anomaly table, the alert feed and the vendor list.  Math.random() and an
   incrementing counter were the two alternatives; both give a person a
   different colour on every render. */
function personTone(name){
  let h = 5381;
  for(let i=0;i<name.length;i++) h = ((h<<5) + h + name.charCodeAt(i)) >>> 0;
  return PERSON_TONES[h % PERSON_TONES.length];
}

/* The dataset writes people short-form — "Sujeev", "Rohit" — so the
   usual "first letter of first word + first letter of last word" already lands
   on the right two characters without special-casing the initial-plus-dot.
   A single-token name ("Menon") takes two letters rather than one, because one
   letter in a 22px circle looks like a placeholder that failed to fill in. */
function personInitials(name){
  const parts = String(name).replace(/[^\p{L}\p{N}\s]/gu,' ').trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return '?';
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

/* Filename-safe, and stable: this is the contract with the avatars/ folder, so
   changing it orphans every photo the client has already dropped in. */
function personSlug(name){
  return String(name).toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

/* Names that occupy an owner column but are NOT a person.  "Unassigned" is the
   owner of the Unallocated cost centre, and giving it a face would be the one
   place this component actively lies — the whole point of that row is that
   nobody owns it. */
const NON_PERSON = /^(unassigned|unallocated|none|n\/?a|tbd|—|-|\?)$/i;
const isPerson = name => !!name && !NON_PERSON.test(String(name).trim());

/* The roster.  Seeded with the seven owners that appear across all four
   scenarios (scan of vendors[].owner, saas[].owner, opps[].owner,
   anomalies[].owner, alerts[].owner and resource.owner), so an account or
   invite screen can ENUMERATE people rather than waiting for one to be
   rendered.  Anyone the datasets add later is folded in on first use by
   person(), so a new name never renders wrong — it just is not listed until
   something asks for it.

   `photo` is normally absent: the path is derived from the slug, and the folder
   is the source of truth.  Set it only to point a person at a file that is not
   <slug>.jpg.  `missing` is written by avatarMiss() and is not authored — see
   the note above it. */
const PEOPLE = {};
function registerPerson(name, tone, photo){
  const n = String(name).trim();
  return (PEOPLE[n] = {
    name: n,
    initials: personInitials(n),
    slug: personSlug(n),
    tone: tone || personTone(n),
    photo: photo || null,
    missing: false
  });
}

/* The tone is REGISTERED, not derived, for the seven people the datasets
   actually contain — the same call ENTITY makes for vendors and products (§2:
   "add there, not inline at a call site").  A hash was tried first and it is
   still the fallback, but seven names hashing into seven slots is not a
   permutation: Daniel and Rohit landed on --c2 together, and two owners
   with the same colour in the same table is the one thing this component exists
   to avoid.  Assigning them is honest — this is a fixed cast, not open input. */
const PERSON_TONE = {
  'Erin':'--c2', 'Kezia':'--c3', 'Irfan':'--c4', 'Daniel':'--c5',
  'Nidhish':'--c6', 'Rohit':'--c7', 'Sujeev':'--c8'
};
/* Every name here is a SINGLE GIVEN NAME, matching its photo file exactly, and
   no photo carries a surname the artwork never had.  The datasets originally
   wrote owners short-form ("S. Menon", "A. Iyer"); when real portraits arrived,
   those were first extended into full names by welding the supplied first name
   onto the invented surname, which put an invented identity on a real person's
   face.  Struck.  A name is now whatever the file is called, so the roster,
   the folder and the data cannot drift apart — and no explicit photo path is
   needed, because every slug resolves to its own file. */
Object.keys(PERSON_TONE).forEach(n => registerPerson(n, PERSON_TONE[n]));

const person = name => PEOPLE[String(name||'').trim()] || registerPerson(name||'?');
/* Alphabetical, so an invite or account list does not depend on insertion order. */
const people = () => Object.values(PEOPLE).sort((a,b)=>a.name.localeCompare(b.name));

/* 20 / 24 / 30 / 38 / 56px — the pixel values live in people.css, next to the
   reasoning for them.  xs and sm are both sized against the tables, which are
   the dense case; 20px is the floor at which two characters are still read
   rather than seen. */
const AVATAR_SIZES = ['xs','sm','md','lg','xl'];
const avatarSize = s => AVATAR_SIZES.indexOf(s) >= 0 ? s : 'sm';

/* Photo over orb, orb revealed by failure — NOT by a probe.
   The folder ships empty, so "the file is missing" is the normal case, and it
   has to cost nothing: no broken-image glyph, no reflow, and no pile of console
   noise that buries a real error.  Three approaches were considered:
     · new Image() to test each file first — that is the same load either way,
       and the table cannot be written until it resolves.
     · a hand-kept manifest of which photos exist — a second thing to keep in
       step with the folder, and wrong the moment someone drops a file in.
     · this: the orb is always laid out, the <img> is absolutely positioned over
       it, and onerror deletes the <img>.  Nothing shifts because the orb was
       already occupying the box, and a deleted element cannot draw a broken icon.
   .jpg is tried first and .png second — the client will send whatever their HR
   system exports, and supporting both costs one attribute.

   THE ANSWER IS REMEMBERED, which is the part that is not obvious.  A screen is
   re-rendered on every filter change, nav click and dataset switch, and one
   person appears on a dozen rows; without the memo, a photo-less owner
   re-requests two files per row per render and Chrome logs ERR_FILE_NOT_FOUND
   for each — hundreds of red lines with the mock-up working perfectly, which is
   exactly the noise that hides a real error during a demo.  So BOTH outcomes are
   written back to the roster on the first attempt: `missing` when neither
   extension resolves, and the winning path in `photo` when one does — otherwise
   a person whose photo is a .png would log a failed .jpg on every render
   forever.  From the second render on, a resolved person costs one cache hit and
   an absent one costs nothing.  A reload picks up a photo added since.

   The handlers call named globals rather than inlining their bodies because
   these functions return HTML strings that screens insert with innerHTML: a
   <script> in an innerHTML payload never runs, but an inline handler on an
   inserted element does — and a function name is easier to read in the markup
   than a statement list. */
function avatarMiss(img){
  const alt = img.getAttribute('data-alt');
  if(alt){ img.removeAttribute('data-alt'); img.src = alt; return; }
  const p = PEOPLE[img.getAttribute('data-p')];
  if(p) p.missing = true;
  img.remove();
}
function avatarHit(img){
  const p = PEOPLE[img.getAttribute('data-p')];
  if(p) p.photo = img.getAttribute('src');
}

/* Names reach this from a dataset the presenter can swap for their own JSON, so
   they are escaped rather than trusted — a stray quote in an owner field would
   otherwise break out of the title attribute. */
const pavAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;')
  .replace(/</g,'&lt;').replace(/>/g,'&gt;');

function avatarHTML(name, size){
  const sz = avatarSize(size);
  /* An owner column that says "Unassigned" gets the same circle at neutral with
     no letters, so the column still lines up on one x — the same bargain
     .bm-slot makes for a row with no brand mark. */
  if(!isPerson(name)) return `<span class="pav pav-${sz} pav-none" aria-hidden="true"></span>`;
  const p = person(name);
  const orb = `<span class="pav pav-${sz}" style="--pav-tone:var(${p.tone})" title="${pavAttr(p.name)}">`
    + `<span class="pav-o" aria-hidden="true">${pavAttr(p.initials)}</span>`;
  if(p.missing) return orb + `</span>`;
  /* .png FIRST, .jpg second.  It was the other way round on the reasoning that
     an HR export is usually a JPEG — but the photos that actually shipped are
     transparent cutouts, which only PNG can carry, so every avatar was spending
     a guaranteed 404 on the first attempt before finding the file that exists.
     A client sending JPEGs still works; they just pay the extra request instead. */
  const png = p.photo || `avatars/${p.slug}.png`;
  const jpg = p.photo ? '' : `avatars/${p.slug}.jpg`;
  /* alt="" and not the name: the name is already in the cell beside it, and a
     second copy is a screen reader reading every owner twice. */
  return orb
    + `<img class="pav-i" src="${pavAttr(png)}"${jpg?` data-alt="${pavAttr(jpg)}"`:''}`
    + ` data-p="${pavAttr(p.name)}" alt=""`
    + ` onerror="avatarMiss(this)" onload="avatarHit(this)">`
    + `</span>`;
}

/* What a table cell actually needs: the avatar and the name on one baseline,
   as a single inline-flex so it cannot be split across two lines in a narrow
   column.  Defaults to xs because every current call site is a table.

   A few owner strings in screens.js carry a qualifier — "Sujeev · platform
   team".  Splitting on the middot here rather than at the call site keeps the
   avatar keyed to the person alone; hashing the whole string would give the same
   human two different tones in two different tables. */
function personCell(name, size){
  const raw = String(name == null ? '' : name).trim();
  const sz = avatarSize(size || 'xs');
  if(!raw) return `<span class="pcell">${avatarHTML('', sz)}<span class="sub">—</span></span>`;
  const [who, ...rest] = raw.split('·').map(s=>s.trim());
  /* "Unassigned" still gets the empty disc, so its NAME starts on the same x as
     every owner above it.  The alternative — plain text, no disc — slides that
     one row left by 27px, which is the fault .bm-slot exists to fix for rows
     with no brand mark. */
  if(!isPerson(who)) return `<span class="pcell">${avatarHTML(who, sz)}<span class="sub">${pavAttr(raw)}</span></span>`;
  return `<span class="pcell">${avatarHTML(who, sz)}`
    + `<span class="pcell-n">${pavAttr(who)}`
    + `${rest.length?`<span class="sub"> · ${pavAttr(rest.join(' · '))}</span>`:''}</span>`
    + `</span>`;
}

/* The same name text personCell() prints, with no avatar at all — for table
   columns that name a role rather than show a person ("Owner", "Service Owner",
   "Owner Of The Gap", the Field/Value detail grid), where a column of repeated
   discs was judged to add weight without adding information. Splits on the same
   middot personCell() does, so "Sujeev · platform team" still reads as one name
   with a qualifier rather than two. */
function personName(name){
  const raw = String(name == null ? '' : name).trim();
  if(!raw) return `<span class="sub">—</span>`;
  const [who, ...rest] = raw.split('·').map(s=>s.trim());
  if(!isPerson(who)) return `<span class="sub">${pavAttr(raw)}</span>`;
  return `<span class="pcell-n">${pavAttr(who)}`
    + `${rest.length?`<span class="sub"> · ${pavAttr(rest.join(' · '))}</span>`:''}</span>`;
}

/* Avatar, name and a second line — for an account list, an invite row or a
   member picker, where the row is tall enough to carry two lines and the size
   is md or bigger. */
function personRow(name, sub, size){
  const raw = String(name || '').trim();
  return `<span class="pcell pcell-stack">${avatarHTML(raw, avatarSize(size || 'md'))}`
    + `<span class="namecell"><b>${pavAttr(raw)}</b>${sub?`<span class="sub">${sub}</span>`:''}</span>`
    + `</span>`;
}

/* A row of overlapping orbs — "these four people own this".  Kept here rather
   than in a screen because the overlap offset has to agree with the size token,
   and that pairing lives in people.css. */
function avatarStack(names, size, max){
  const sz = avatarSize(size);
  const list = (names||[]).filter(isPerson);
  const shown = list.slice(0, max || 4);
  const extra = list.length - shown.length;
  return `<span class="pstack pstack-${sz}">`
    + shown.map(n=>avatarHTML(n,sz)).join('')
    + (extra>0?`<span class="pav pav-${sz} pav-more">+${extra}</span>`:'')
    + `</span>`;
}
