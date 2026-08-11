/* ============================================================
   Finoptic — account: the sign-in screen and team / access management
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  This one loads after screens.js, so `S` already exists and
   already holds the seventeen originals — it adds two entries to that object
   rather than creating it.

     S.team    — the roster, and ONE side pane that both adds and edits members.
     S.signin  — full-bleed, no sidebar, composed from trakit's LoginPage.

   NOTHING HERE IS WIRED TO ANYTHING.  No invite is sent, no account is created,
   no credential is collected or kept: the sign-in button is a route to the
   Executive Dashboard and adding a member writes a URL into this tab.  The team
   screen still says so once, under its table.  The SIGN-IN screen no longer
   does: a grey panel explaining that the product is a mock-up was sitting under
   the primary button, and it was cut on sight — "I know it is a mockup, but I
   don't want users to see it."  Truthfulness lives in the toasts and on the
   team screen, not on the front door.
   ============================================================ */

/* ============================================================
   Access levels
   ------------------------------------------------------------
   Three, because the question a client asks about an invite is "what can this
   person break?", and three answers is as many as anyone holds in their head.
   They are a LADDER — each level is the one below it plus one power — which is
   what lets the badge be a value ramp rather than three unrelated hues
   (parts/account.css).  An access level is a category, not a status, so it may
   not borrow the reserved green/amber/red (§2).
   ============================================================ */
const ACCESS_LEVELS = [
  {k:'admin',  label:'Admin',
   can:'Invites people, connects source systems, edits budgets and the allocation rules.',
   scope:'Every department, every screen.'},
  {k:'editor', label:'Editor',
   can:'Works the numbers — owns savings opportunities, moves them through the pipeline, re-tags spend.',
   scope:'Their own department. Reads the rest.'},
  {k:'viewer', label:'Viewer',
   can:'Reads and exports. Changes nothing.',
   scope:'Their own department.'}
];
const accessLevel = k => ACCESS_LEVELS.find(a=>a.k===k) || ACCESS_LEVELS[2];

/* ---- department → default view ----------------------------------------------
   ONE question, not two.  The form used to ask for a department AND for the
   view the person lands on, with a hand-override on the second: "we ask for
   both… only the department should be selected; the default view should be
   determined automatically."  The department is now the sole input and the view
   is DERIVED — and, just as importantly, DISPLAYED, so the rule is visible on
   the form instead of hidden behind it.  A field you can see the answer to is
   worth more than a field you have to fill.

   This REVERSES the role rule (R7.21: an admin answers for the whole estate, so
   an admin landed on ITFM whatever their department).  Do not reinstate it —
   two inputs feeding one output is exactly what made a second field look
   necessary, and an admin who runs Finance still opens on Finance.

   Departments come from the dataset (`depts`), so this table is keyed on the
   names the data actually uses.  Anything unlisted falls to Finance, the one
   lens every department has a stake in. */
const DEPT_VIEW = {
  'Engineering':'itfm', 'Security / IT':'itfm',
  'Product':'biz',      'Sales':'biz',
  'Finance':'finance',
  'Operations':'proc',  'Marketing':'proc', 'HR':'proc'
};
/* Returns null rather than a guess when there is no department yet — the pane
   shows the derivation waiting for its input rather than pretending to a
   default it has not earned. */
const defaultViewFor = dept => dept ? (DEPT_VIEW[dept] || 'finance') : null;
const viewLabel = v => (PERSONA[v] && PERSONA[v].label) || '—';
const viewShort = v => (PERSONA[v] && PERSONA[v].short) || '—';

/* ============================================================
   The roster
   ------------------------------------------------------------
   Derived from the dataset, not invented beside it: the people in this table are
   the ones the data already holds accountable for something — they own a savings
   opportunity, an alert or a vendor contract.  A hardcoded staff list would
   contradict the numbers the moment a different scenario loaded, which is the
   fault the data layer exists to prevent.

   THIS IS THE ONE SCREEN THAT READS `RAW` RATHER THAN `D`, deliberately.  Who
   belongs to the workspace is not a slice of the spend: setting a vendor filter
   on the procurement screen and then opening this one must not delete people
   from the organisation.  Every figure here is a headcount rather than money, so
   nothing on it is a narrowed number wearing an unnarrowed one's authority.
   ============================================================ */

/* An opportunity's category is the best evidence the dataset carries of which
   department a person sits in — you own cloud waste because you run the cloud. */
const CAT_DEPT = {
  'Cloud':'Engineering', 'Observability':'Engineering',
  'AI':'Product',
  'SaaS':'Operations',   'Licence':'Operations', 'Other':'Operations',
  'Contract':'Finance',
  'Security':'Security / IT', 'ITSM':'Security / IT', 'Device':'Security / IT'
};

/* A stable per-name integer, so "last active" is the same every render and after
   every re-render.  A column that reshuffled on each click would read as live
   data, which is exactly what it is not. */
const acctHash = n => { let h = 0; for(let i=0;i<n.length;i++) h = (h*31 + n.charCodeAt(i)) >>> 0; return h; };
const acctLastActive = n => { const d = acctHash(n) % 12;
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago'; };
/* The workspace the shell's profile row already names, so a generated address
   matches the one signed in ("lohith.s@crozaint.com"). */
const ACCT_DOMAIN = 'crozaint.com';
const acctEmail = n => n.toLowerCase().replace(/[^a-z]+/g,'.').replace(/^\.|\.$/g,'') + '@' + ACCT_DOMAIN;
const acctInitials = n => ((n||'').replace(/[^A-Za-z ]/g,'').trim().split(/\s+/)
  .filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()) || '?';

/* ---- what this tab remembers ------------------------------------------------
   Members added on this screen, and every edit made to ANY member — including
   the ones derived from the dataset.  Both live in this tab only; see the note
   under the members table.

   ONE overlay for every kind of change, keyed by a row id rather than by name,
   because a name is now editable and a key that can be rewritten is not a key.
   The previous version kept a separate `ACCESS_SET` map for role changes and
   mutated the invited rows in place for everything else, which was two ways to
   change one row — and the reason "Manage" could only ever change the role. */
let MEMBER_SEQ = 0;
const ADDED = [];
const MEMBER_EDIT = {};

/* people.js's roster is what EVERY avatar in the mock-up reads, so a photo
   attached here is written THERE rather than drawn specially in this one table:
   the same face then follows the person into the owner column on every other
   screen, which is the honest outcome.

   `missing` has to be cleared as well as `photo` set, and that second line is
   the half of the avatar bug that is not obvious: avatarHTML() returns the
   initials orb and never looks at `photo` once avatarMiss() has recorded that
   both avatars/<slug>.jpg and .png 404'd — which for anyone invited in this tab
   is always, because they have no file in that folder and never will. */
function acctPublishPhoto(name, photo){
  if(typeof person !== 'function' || !photo) return;
  const p = person(name);
  if(p.photo === photo && !p.missing) return;
  p.photo = photo;
  p.missing = false;
}

/* A roster row, after the tab's edits are laid over whatever it was derived
   from.  `view` is recomputed here and stored nowhere, so there is exactly one
   answer to "where does this person land" and it is always the current
   department's. */
function acctRow(base){
  const m = Object.assign({}, base, MEMBER_EDIT[base.id] || {});
  m.view = defaultViewFor(m.dept);
  acctPublishPhoto(m.name, m.photo);
  return m;
}

function teamRoster(){
  const by = {};
  const owns = (n,cat,v) => {
    const p = (by[n] = by[n] || {name:n, weight:0, cats:{}});
    p.weight += v; p.cats[cat] = (p.cats[cat]||0) + v;
  };
  (RAW.opps||[]).forEach(o=>{ if(o.owner) owns(o.owner, o.cat, o.s||0); });
  /* An alert or a contract is accountability too, weighted well below a savings
     figure so the ladder below is decided by owned VALUE first. */
  (RAW.alerts||[]).forEach(a=>{ if(a.owner) owns(a.owner, 'Cloud', 2); });
  (RAW.vendors||[]).forEach(v=>{ if(v.owner) owns(v.owner, 'Contract', 4); });

  const depts = acctDepts();
  const fallbackDept = depts[0] || 'Engineering';
  const people = Object.keys(by).map(k=>by[k]).sort((a,b)=>b.weight - a.weight);

  const roster = people.map((p,i)=>{
    /* Department = where the biggest share of what they own sits. */
    const top = Object.keys(p.cats).sort((a,b)=>p.cats[b]-p.cats[a])[0];
    const dept = depts.indexOf(CAT_DEPT[top]) >= 0 ? CAT_DEPT[top] : fallbackDept;
    /* Level follows how much of the estate a person answers for, so it
       re-narrates with the scenario instead of being a second hardcoded list:
       the two carrying the most administer the workspace, the next three change
       what they own, the rest read. */
    const level = i < 2 ? 'admin' : i < 5 ? 'editor' : 'viewer';
    /* The id is the DERIVED identity and never changes, so renaming someone in
       the pane does not orphan their own edit. */
    return acctRow({id:'d:'+p.name, name:p.name, email:acctEmail(p.name), dept, level,
                    last:acctLastActive(p.name), status:'Active'});
  });

  /* The person reading the screen belongs in the table.  Name, address and
     workspace are the ones the profile row already shows; the department is
     whichever carries the most spend, so it re-derives with the dataset instead
     of being pinned to a literal. */
  const biggest = (RAW.depts||[]).filter(d=>d.k !== 'Unallocated')
    .slice().sort((a,b)=>b.v - a.v)[0];
  const me = 'Lohith S', meDept = (biggest && biggest.k) || fallbackDept;
  roster.unshift(acctRow({id:'d:'+me, name:me, email:'lohith.s@' + ACCT_DOMAIN,
                          dept:meDept, level:'admin', last:'Today', status:'Active', you:true}));

  return roster.concat(ADDED.map(acctRow));
}
const acctDepts = () => (RAW.depts||[]).map(d=>d.k).filter(k=>k !== 'Unallocated');
const acctFind = id => teamRoster().find(m=>m.id === id) || null;

/* people.js owns the avatar; this screen only ever calls into it.  Guarded
   because that file is another workstream's, and a missing face must not take
   the roster down with it. */
const acctAvatar = (name,size) =>
  typeof avatarHTML === 'function' ? avatarHTML(name,size) : '';

/* ============================================================
   The member pane — one editor, two flows
   ------------------------------------------------------------
   "An 'Add new member' option should open a right-hand side pane where all
   details can be entered.  Likewise, clicking Manage should open the same
   sidebar with pre-filled information, allowing edits directly there."

   ONE component for both, because they are the same object in two states: an
   empty member and an existing one.  Two components would have been two places
   to add a field to, and the old screen is the argument — its invite form
   collected five things and its Manage menu could change one of them.

   NOT the modal in screens.js.  That is a centred dialog sized to its content,
   and it is right for the alert playbook: a thing you read once and dismiss.
   An editor is a place you stay in beside the table you are editing, which is
   why it is a full-height pane pinned to the right edge and why the table stays
   visible next to it.

   PORTALLED TO <body>, for the reason written above openDimMenu() in shell.js:
   an ancestor with overflow on one axis clips on both, and a panel appended
   inside a card was invisible for a whole feedback round.  Out here nothing can
   clip it, and `position:fixed` cannot be re-parented by a card that later
   gains a transform.  The rest is the dialog contract the modal already sets —
   focus trap, Escape, click-outside needing both mousedown and click on the
   scrim, a scroll lock that hands the scrollbar's width back as padding, and
   focus returned to the control that opened it.
   ============================================================ */
const PANE = {mode:'add', id:null, base:null, d:null, link:null};
let paneEl = null, paneReturn = null;
const PANE_FOCUS = 'button:not([disabled]),[href],select,input,textarea,[tabindex]:not([tabindex="-1"])';

/* The photo is seeded from people.js's roster when the row has none of its own,
   because a derived member's face is a FILE in avatars/ keyed on their name —
   and renaming them would otherwise silently drop it, the slug no longer
   matching anything in the folder.  Carrying the resolved path into the draft
   means the face follows the new name instead. */
const acctDraft = row => {
  if(!row) return {name:'', email:'', dept:null, level:null, photo:null};
  const known = typeof person === 'function' ? person(row.name).photo : null;
  return {name:row.name, email:row.email, dept:row.dept, level:row.level,
          photo:row.photo || known || null};
};

/* How far down the pane the reader has got.  Progressive disclosure runs off
   ONE rule — a section opens when everything above it is answered — which is
   also why editing is not a wizard: an existing member has every answer
   already, so all three sections are open the moment the pane appears.  Two
   code paths would have been the alternative, and would have drifted. */
const acctNameOK  = d => !!String(d.name||'').trim();
const acctEmailOK = d => /.+@.+\..+/.test(String(d.email||'').trim());
const acctReach   = () => !(acctNameOK(PANE.d) && acctEmailOK(PANE.d)) ? 1 : (PANE.d.dept ? 3 : 2);
const acctReady   = () => acctReach() === 3 && !!PANE.d.level;
/* Said in the footer beside the disabled action, because a button that is grey
   for a reason you cannot see is a button that looks broken. */
const acctNextHint = () => acctReach() === 1
    ? 'Add a name and a work email to carry on.'
  : acctReach() === 2
    ? 'Choose a department — it decides which view they open on.'
  : !PANE.d.level ? 'Choose what they are allowed to change.' : '';

/* ---- the photo ----
   A real local file, read as a data URI.  FileReader is the only route that
   works from a file:// origin — the same reason the dataset loader uses it —
   and a data URI rather than an object URL because the pane is re-rendered
   around this value and an object URL would have to be revoked by hand. */
let acctPhotoInput = null;
function acctPickPhoto(){
  if(!acctPhotoInput){
    acctPhotoInput = document.createElement('input');
    acctPhotoInput.type = 'file';
    acctPhotoInput.accept = 'image/*';
    acctPhotoInput.hidden = true;
    document.body.appendChild(acctPhotoInput);
    acctPhotoInput.addEventListener('change', ()=>{
      const f = acctPhotoInput.files[0];
      acctPhotoInput.value = '';
      if(!f || !PANE.d) return;
      const r = new FileReader();
      r.onload = ()=>{ PANE.d.photo = r.result; acctPaneRender('[data-acct="photo"]'); };
      r.readAsDataURL(f);
    });
  }
  acctPhotoInput.click();
}

/* ---- the department picker ----
   Shaped exactly like a filter pill, because it IS the same interaction: a
   hairline chip reading `Label · value`, an ink fill once set, and a value list
   portalled to <body> as position:fixed so no ancestor's overflow can clip it.
   It cannot reuse openDimMenu(): that writes into F and re-renders the whole
   screen, and a member's department is not a filter on the numbers. */
const acctChip = (key,label,val,placeholder) => `<button class="chip ${val?'set':''}"
    type="button" data-acct="${key}"><em>${label}</em><b>${val || placeholder}</b>
    <span class="caret">${icon('caret',true)}</span></button>`;

function acctOpenMenu(anchor,key,opts,onPick){
  const m = document.createElement('div');
  /* .menu.vals, so the shell's own closeMenus() removes it and its scroll and
     resize handlers close it: one popover lifecycle in the mock-up, not two. */
  m.className = 'menu vals acct';
  m.dataset.acctFor = key;
  m.innerHTML = opts.map(o => o.sep
    ? '<div class="menu-sep"></div>'
    : `<button class="menu-opt ${o.on?'on':''}" type="button" data-acct-val="${attrEsc(o.v)}">${o.label}</button>`
  ).join('');
  m.addEventListener('click', e=>{
    const o = e.target.closest('[data-acct-val]');
    if(!o) return;
    closeMenus();
    onPick(o.dataset.acctVal);
  });
  document.body.appendChild(m);
  /* Measured after insertion: a fixed element's own height is what decides
     whether it can hang below its anchor or has to flip above it. */
  const r = anchor.getBoundingClientRect(), h = m.offsetHeight, w = m.offsetWidth;
  const below = r.bottom + 6, flip = below + h > window.innerHeight - 8;
  m.style.top  = (flip ? Math.max(8, r.top - h - 6) : below) + 'px';
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
}
/* shell.js's document click handler runs AFTER this file's — it is registered
   later on the same node — and ends by closing every open popover.  Its own
   filter pills escape that sweep by returning early, which is a path only a
   DIMS-backed dimension takes.  So a menu opened from here has to open on the
   next tick, after the sweep, or it is removed by the click that asked for it. */
function acctMenuLater(anchor,key,opts,onPick){
  const open = document.querySelector('.menu.vals.acct');
  if(open && open.dataset.acctFor === key) return;   /* the sweep closes it */
  setTimeout(()=>acctOpenMenu(anchor,key,opts,onPick), 0);
}

/* ---- the invite link ----
   Kept from the previous version of this screen because it is the one part of
   the flow that works end to end: the link carries the new member's DERIVED
   view as `v`, which is the parameter restore() already reads for the persona
   switch, so following it genuinely lands them in the view their department
   answers for rather than describing one.  It is now the result of adding a
   member inside the pane, rather than a card taking up half the screen. */
function acctInviteLink(d){
  const p = new URLSearchParams();
  p.set('v', defaultViewFor(d.dept));
  p.set('lvl', d.level);
  p.set('to', String(d.email).trim());
  return location.href.split('#')[0] + '#signin?' + p.toString();
}
/* mailto: is the one "send" that genuinely works from a file:// page — it hands
   the message to the reader's own mail client, which is honest in a way that a
   fake "Invitation sent" confirmation would not be. */
function acctMailto(d, link){
  /* The whole name, not the first token: a dataset may write people "S. Menon",
     and a first-name greeting would open the mail with "S.,". */
  const body = [
    String(d.name).trim() + ',',
    '',
    'You have been given ' + accessLevel(d.level).label + ' access to the Crozaint '
      + 'workspace in Finoptic, opening on the ' + viewLabel(defaultViewFor(d.dept)) + ' view.',
    '',
    link,
    '',
    '— Sent from Finoptic, by Crozaint. If you were not expecting this, you can ignore it.'
  ].join('\n');
  return 'mailto:' + encodeURIComponent(String(d.email).trim())
    + '?subject=' + encodeURIComponent('You have been invited to Finoptic')
    + '&body=' + encodeURIComponent(body);
}

/* ---- the pane's own markup ---- */
function acctPaneFace(){
  const d = PANE.d;
  if(d.photo) return `<img class="pane-face" src="${d.photo}" alt="">`;
  /* people.js's no-person circle is deliberately EMPTY, and an empty circle
     beside "Add a photo" reads as a photo that failed to load — so an unnamed
     draft gets a question mark instead of nothing. */
  return acctNameOK(d)
    ? `<span class="pane-face orb">${acctAvatar(d.name,'xl')}</span>`
    : `<span class="pane-face fb">${acctInitials(d.name)}</span>`;
}

function acctPaneForm(){
  const d = PANE.d, view = defaultViewFor(d.dept);
  return `
  <section class="pane-step" data-step="1">
    <h4 class="pane-sh"><span class="pane-n">1</span>Who they are</h4>
    <div class="pane-face-row">
      ${acctPaneFace()}
      <div class="pane-face-c">
        <div class="pane-face-btns">
          <button class="btn sm" type="button" data-acct="photo">${
            d.photo ? 'Replace photo' : 'Add a photo'}</button>
          ${d.photo ? '<button class="btn sm" type="button" data-acct="photo-clear">Remove</button>' : ''}
        </div>
        <p class="pane-hint">Optional. It rides beside their name in the members
           table; until there is one, their initials do.</p>
      </div>
    </div>
    <label class="fld"><span>Full name</span>
      <input class="inp" type="text" autocomplete="off" data-pane-f="name"
             placeholder="Priya Raghavan" value="${attrEsc(d.name)}"></label>
    <label class="fld"><span>Work email</span>
      <input class="inp" type="email" autocomplete="off" data-pane-f="email"
             placeholder="priya.raghavan@${ACCT_DOMAIN}" value="${attrEsc(d.email)}"></label>
  </section>

  <section class="pane-step" data-step="2">
    <h4 class="pane-sh"><span class="pane-n">2</span>Which department</h4>
    <div class="pane-picks">${acctChip('dept','Department', d.dept, 'Choose')}</div>
    ${/* The derived view, SHOWN rather than asked for.  This line is the whole
          answer to "we ask for both": one input, one visible consequence. */''}
    <div class="pane-derive ${view?'on':''}">
      <span>Opens on</span>
      <b>${view ? viewLabel(view) : 'Follows the department'}</b>
      <em>${view
        ? d.dept + ' answers for that view, so it is where they start.'
        : 'Pick a department and this fills itself in — it is not a separate choice.'}</em>
    </div>
  </section>

  <section class="pane-step" data-step="3">
    <h4 class="pane-sh"><span class="pane-n">3</span>What they can change</h4>
    <div class="pane-roles">
      ${ACCESS_LEVELS.map(a=>`
        <button class="pane-role ${d.level===a.k?'on':''}" type="button"
                data-acct="role" data-role="${a.k}">
          <b>${a.label}</b><span>${a.can}</span><em>${a.scope}</em>
        </button>`).join('')}
    </div>
  </section>`;
}

/* The result of ADDING someone: the link, and the two things you can honestly
   do with it from a page with no server behind it. */
function acctPaneDone(){
  const d = PANE.d, view = defaultViewFor(d.dept);
  return `<div class="pane-done">
    <div class="pane-done-h">
      ${d.photo ? `<img class="pane-face sm" src="${d.photo}" alt="">`
                : `<span class="pane-face sm orb">${acctAvatar(d.name,'lg')}</span>`}
      <div class="namecell"><b>${attrEsc(String(d.name).trim())} is on the list</b>
        <span class="sub">${attrEsc(String(d.email).trim())} · ${attrEsc(d.dept)} ·
          ${accessLevel(d.level).label} · opens on ${viewLabel(view)}</span></div>
    </div>
    <div class="fld"><span>Invite link</span>
      <div class="pane-link">${attrEsc(PANE.link)}</div></div>
    <div class="pane-acts">
      <button class="btn" type="button" data-acct="copy">Copy link</button>
      <a class="btn" href="${acctMailto(d, PANE.link)}">Email the invite</a>
      <button class="btn" type="button" data-acct="another">Add another</button>
    </div>
    <p class="pane-note">The link opens Finoptic on the ${viewLabel(view)} view. Nothing has been
       sent yet — copy it, or use Email the invite to send it to
       ${attrEsc(String(d.name).trim())}.</p>
  </div>`;
}

function acctPaneHTML(){
  const add = PANE.mode === 'add', done = !!PANE.link;
  const title = done ? 'Member added' : add ? 'Add a new member' : 'Edit member';
  const sub = done ? 'Nothing was emailed — the link is yours to hand over.'
    : add ? 'They appear in the table as soon as you add them.'
    : attrEsc(PANE.base ? PANE.base.email : '');
  const revoke = !add && PANE.base && PANE.base.status === 'Invited';
  return `<header class="pane-h">
      <div class="pane-t"><b>${title}</b><span class="sub">${sub}</span></div>
      <button class="iconbtn pane-x" type="button" data-acct="pane-close"
              aria-label="Close"><span aria-hidden="true">×</span></button>
    </header>
    <div class="pane-b">${done ? acctPaneDone() : acctPaneForm()}</div>
    ${done ? `<footer class="pane-f">
      <button class="btn pri" type="button" data-acct="pane-close">Done</button>
    </footer>` : `<footer class="pane-f">
      <button class="btn pri" type="button" data-acct="pane-save"
              ${acctReady()?'':'disabled'}>${add ? 'Add member' : 'Save changes'}</button>
      ${revoke ? '<button class="btn pane-danger" type="button" data-acct="revoke">Revoke invite</button>' : ''}
      <p class="pane-next">${acctNextHint()}</p>
    </footer>`}`;
}

/* Repaints the pane's own markup.  Used for everything that is NOT typing — a
   picked department, a chosen level, a loaded photo — because each of those
   changes something the reader is not looking at.  Typing goes through
   acctPaneSync() instead: rewriting the markup under a caret loses focus
   mid-word, which is the bug this split exists to avoid.
   The body's scroll offset is put back by hand, or picking a department three
   sections down would throw the reader to the top of the pane. */
function acctPaneRender(focusSel){
  const box = paneEl && paneEl.querySelector('.pane');
  if(!box) return;
  const prev = box.querySelector('.pane-b');
  const y = prev ? prev.scrollTop : 0;
  box.innerHTML = acctPaneHTML();
  const body = box.querySelector('.pane-b');
  if(body) body.scrollTop = y;
  acctPaneSync();
  const back = focusSel && box.querySelector(focusSel);
  (back || box).focus();
}

/* The cheap half: no markup is rewritten, so this is safe to run on every
   keystroke.  A section that is not reachable yet is display:none rather than
   dimmed — it has to leave the tab order too, or Tab walks into fields the
   reader has not been offered.

   `paneOpenAt` is how far the reader had got LAST time, and it is what decides
   which sections play the reveal: the ones that were not reachable and now are.
   Tracked across renders rather than read off the DOM, because a section that
   has just been rewritten by acctPaneRender() has no memory of having been
   locked a moment ago — which is why picking a department used to unlock the
   level options with no movement at all.  It also means an EDIT pane, which
   opens with everything answered, does not animate all three sections in: the
   pane's own entrance is doing that. */
let paneOpenAt = 1;
function acctPaneSync(){
  const box = paneEl && paneEl.querySelector('.pane');
  if(!box || PANE.link) return;
  const open = acctReach();
  box.querySelectorAll('.pane-step').forEach(s=>{
    const n = +s.dataset.step;
    s.classList.toggle('locked', n > open);
    if(n > paneOpenAt && n <= open){
      s.classList.add('reveal');
      setTimeout(()=>s.classList.remove('reveal'), 400);
    }
  });
  paneOpenAt = open;
  const go = box.querySelector('[data-acct="pane-save"]');
  if(go) go.disabled = !acctReady();
  const hint = box.querySelector('.pane-next');
  if(hint) hint.textContent = acctNextHint();
}

function acctPaneClose(silent){
  if(!paneEl) return;
  paneEl.remove(); paneEl = null;
  document.documentElement.classList.remove('pane-open');
  /* Focus goes back where it came from, not to <body> — otherwise the next Tab
     starts again at the top of the sidebar. */
  if(!silent && paneReturn && document.contains(paneReturn)) paneReturn.focus();
  paneReturn = null;
}

function acctPaneOpen(mode, row, trigger){
  acctPaneClose(true);
  PANE.mode = mode;
  PANE.id = row ? row.id : null;
  PANE.base = row || null;
  PANE.d = acctDraft(row);
  PANE.link = null;
  /* Seeded from the draft, so the first sync has nothing to reveal — see the
     note above acctPaneSync(). */
  paneOpenAt = acctReach();

  const scrim = document.createElement('div');
  scrim.className = 'pane-scrim';
  scrim.innerHTML = `<aside class="pane" role="dialog" aria-modal="true" tabindex="-1"
    aria-label="${mode==='add' ? 'Add a new member' : 'Edit ' + attrEsc(row.name)}"></aside>`;
  /* Only a click that both STARTS and ends on the scrim closes it, so a text
     selection dragged out of the pane does not dismiss what you were editing. */
  let downOnScrim = false;
  scrim.addEventListener('mousedown', e=>{ downOnScrim = e.target===scrim; });
  scrim.addEventListener('click', e=>{ if(e.target===scrim && downOnScrim) acctPaneClose(); });
  scrim.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      /* A department menu is a layer above the pane: one Escape closes one
         layer, which is the rule the shell's own handler already states. */
      if(document.querySelector('.menu.vals.acct')){ e.stopPropagation(); closeMenus(); return; }
      e.stopPropagation(); acctPaneClose(); return;
    }
    if(e.key!=='Tab') return;
    const f = [].slice.call(scrim.querySelectorAll(PANE_FOCUS)).filter(n=>n.offsetParent!==null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1], at = document.activeElement;
    /* The pane itself holds focus on open and is not in that list, so the trap
       has to catch "focus is on the container" as well as the two ends. */
    if(f.indexOf(at)<0){ e.preventDefault(); (e.shiftKey?last:first).focus(); }
    else if(e.shiftKey && at===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && at===last){ e.preventDefault(); first.focus(); }
  });
  /* Locking the page costs it its scrollbar, which widens the board behind the
     pane by ~15px and makes the whole thing jump as it opens.  The width the
     scrollbar was taking is handed straight back as padding, so nothing moves.
     Its own class rather than the modal's `mdl-open`: two dialog lifecycles
     sharing one lock means whichever closes first unlocks the other's page. */
  document.documentElement.style.setProperty('--sbw',
    (window.innerWidth - document.documentElement.clientWidth) + 'px');
  document.documentElement.classList.add('pane-open');
  document.body.appendChild(scrim);
  paneEl = scrim; paneReturn = trigger || null;
  acctPaneRender();
}

/* Everything on this screen has to agree with everything else on it: adding a
   member moves "People with access", "Departments covered" and "Pending
   invites" as well as adding a row.  So a change re-renders the whole screen
   through the shell's own refresh(), rather than patching one panel and leaving
   four counts contradicting it — the principle the reconciliation strip exists
   for applies to a headcount too.  The pane survives it untouched: it lives on
   <body>, not inside #screen.
   go() scrolls to the top on a navigation but not on a refresh, so the reader's
   place in the table is kept; the offset is saved anyway because the scroll lock
   can clamp it while the pane is open. */
function acctRerender(){
  const y = window.scrollY;
  refresh();
  window.scrollTo(0, y);
}

/* ============================================================
   Screen — team & access
   ============================================================ */
const accessBadge = k => badge(accessLevel(k).label, 'lvl-' + k);

/* This screen does NOT call head().  head() emits the controls row and the
   reconciliation strip along with the title, and both of those are about money:
   a spend − budget = variance equation over a list of PEOPLE reconciles
   nothing, and Export writes a CSV of figures this screen does not have.  "The
   reconciliation bar and the download-and-share options are confusing."
   Leaving the controls row out is safe rather than an error because
   renderFilters() returns early when the screen emitted no #filters slot — the
   same guard sign-in has relied on since it was built. */
const acctHead = (h1,p,tag) => `<div class="pagehead"><div><h1>${h1}</h1><p>${p}</p></div>${
  tag?`<div class="persona-tag">${tag}</div>`:''}</div>`;

function acctMembersTable(rows){
  const cols = [{t:'Member'},{t:'Department'},{t:'Access'},{t:'Opens On'},
                {t:'Last Active'},{t:'Status'},{t:'',r:true}];
  /* The add control is a row BELOW the table element rather than a <tr> inside
     it.  Every table in the mock-up sorts and filters on its RENDERED cells
     (components.js), so an action row would be sorted into the middle of the
     list by the next click on a column header and hidden outright by the find
     box.  It still reads as the table's last row: full width, one hairline
     above it, and its label starting on the same x as the Member column. */
  return `<div class="acct-tbl">
    ${table(cols, rows.map(m=>[
      `<div class="acct-mem">${acctAvatar(m.name,'sm')}<div class="namecell">
         <b>${attrEsc(m.name)}${m.you ? ' <span class="acct-you">you</span>' : ''}</b>
         <span class="sub">${attrEsc(m.email)}</span></div></div>`,
      attrEsc(m.dept),
      accessBadge(m.level),
      viewShort(m.view),
      m.status === 'Invited' ? '<span class="sub">Invite not accepted</span>' : m.last,
      badge(m.status, m.status === 'Invited' ? 'med' : 'ok'),
      `<button class="btn sm" type="button" data-acct="member"
               data-id="${attrEsc(m.id)}">Manage</button>`
    ]))}
    <button class="acct-add" type="button" data-acct="add">
      <span class="acct-add-i" aria-hidden="true">+</span>
      <span class="acct-add-t"><b>Add new member</b>
        <em>Name, email, department and what they are allowed to change</em></span>
    </button>
  </div>`;
}

S.team = () => {
  /* TITLES is built from NAV, and sign-in is not in it — the state URL and the
     document title both read from there.  Set here rather than at load time
     because shell.js, which declares TITLES, loads after this file. */
  if(!TITLES.team) TITLES.team = 'Team & Access';
  if(!TITLES.signin) TITLES.signin = 'Sign in';

  const rows = teamRoster();
  const admins = rows.filter(m=>m.level === 'admin').length;
  const pending = rows.filter(m=>m.status === 'Invited').length;
  const depts = new Set(rows.map(m=>m.dept));
  const views = new Set(rows.map(m=>m.view));
  return acctHead('Team & Access',
    'Who can open Finoptic, what each of them is allowed to change, and which view they land on when they sign in.',
    (D.meta.company ? D.meta.company + ' · ' : '') + 'Crozaint workspace')
  + `<div class="grid">
  ${kpi({k:'People With Access',v:String(rows.length),hero:true,ic:'users',
         foot:'Across ' + depts.size + ' department' + (depts.size===1?'':'s')})}
  ${kpi({k:'Departments Covered',v:String(depts.size),ic:'layers',
         foot:'Of ' + acctDepts().length + ' in the cost model'})}
  ${kpi({k:'Admins',v:String(admins),ic:'security',
         foot:'Can invite, connect sources and edit budgets'})}
  ${kpi({k:'Pending Invites',v:String(pending),ic:'calendar',
         foot:pending ? 'Link generated, not yet accepted' : 'Nothing outstanding'})}

  ${card({span:12, title:'Members', pad:false,
    sub:rows.length + ' people · ' + (views.size === 4 ? 'all four views' : views.size + ' of the four views')
       + ' in use · the access level decides what someone can change, their department '
       + 'decides where they start',
    body:`<div class="acct-slot" id="team-members">${acctMembersTable(rows)}</div>`,
    note:'Membership is derived from the loaded dataset — the people it holds '
       + 'accountable for a saving, an alert or a contract. Members added or edited on '
       + 'this screen are held in this browser tab only: <b>no message is sent and no '
       + 'account exists.</b>'})}
  </div>`;
};

/* ============================================================
   Screen — sign in
   ------------------------------------------------------------
   Composition from trakit's LoginPage: the form on the left under the brand
   lockup, one full-height accent panel on the right carrying the watermark, the
   claim and the questions the product answers.  The identity is Finoptic's — the
   real artwork from logo.js, Mona Sans + Space Grotesk, the accent palette.

   It does NOT call head().  head() emits the page title, the controls row, the
   reconciliation strip and the briefing band; a sign-in screen has no filters to
   offer and no reconciliation to show.  `S.signin.chrome = 'bare'` makes go()
   remove the shell rather than paint over it.

   NO <form>, and no credential goes anywhere.  A real form on a file:// page
   reloads it on Enter and drops the hash-encoded state with it; the button is a
   route (`data-go`) rather than a submit, so the shell's delegated router — the
   same one every nav item uses — is what carries it.
   ============================================================ */
const acctLogo = k => (typeof LOGO !== 'undefined' && LOGO[k]) || '';

/* The questions Finoptic answers, taken from the PRD's own list of what a company
   cannot answer quickly today.  Three rows, drifting in alternate directions and
   running off both edges of the panel: a clipped row reads as part of something
   larger, which is the move the reference makes. */
const ASK_ROWS = [
  ['Are we on budget this month?','What is driving the cloud bill up?',
   'Which licences is nobody using?','Whose budget does this sit under?'],
  ['What renews before we can renegotiate?','Why did that cost jump last week?',
   'Where do we land at year end?','Which vendor is worth a conversation?'],
  ['What does each product cost to run?','How much spend is still untagged?',
   'What have we actually banked?','What does one AI request cost us?']
];

/* THE MARQUEE.  The rows were static — three flex rows nudged sideways by hard
   negative margins, which read as a marquee stopped dead, and there was no
   keyframe behind them anywhere in the mock-up.

   A loop is seamless only if the track can be translated by exactly one copy of
   its content, so each row is drawn THREE times inside one track and the track
   slides by exactly a third of itself.  Three copies rather than two because two
   is not enough to cover the panel at the far end of the travel: one copy is
   roughly 750px and the panel is wider than that at 1440.
   The gap between chips is a MARGIN on the chip and not `gap` on the track —
   a flex gap is not part of a child's width, so a track of gapped copies is
   3S + 2g wide and no fraction of it lands on the seam.
   Everything else — the speeds, the two directions, the offset each row starts
   at — is in parts/account.css, next to the reasoning for it. */
const askRow = (qs,i) => `<div class="ask-row r${i}">
    <div class="ask-track">${[0,1,2].map(c=>
      `<div class="ask-set"${c ? ' aria-hidden="true"' : ''}>${
        qs.map(q=>`<span class="signin-ask">${q}</span>`).join('')}</div>`).join('')}
    </div>
  </div>`;

/* ?nofx is the kill switch motion.js already reads, and a marquee has no
   finished state to settle into — so it honours the same switch rather than
   being the one thing still moving on a board that was told to hold still.
   prefers-reduced-motion is handled in CSS, where it also un-clips the rows. */
const acctStill = () => /[?&]nofx\b/.test(location.search);

/* An invite link carries the level and the view it was issued with, so the screen
   it opens can name what was granted rather than showing a bare form. */
function acctInviteContext(){
  const p = new URLSearchParams(location.hash.split('?')[1] || '');
  const lvl = p.get('lvl'), to = p.get('to'), v = p.get('v');
  if(!lvl || !ACCESS_LEVELS.some(a=>a.k === lvl)) return null;
  return {lvl, to, view: PERSONA[v] ? v : 'itfm'};
}

S.signin = () => {
  const inv = acctInviteContext();
  /* An invited person lands where their department put them — which is the
     whole "the view follows the department" rule, demonstrated end to end.
     Anyone else lands on the Executive Dashboard, the one screen that belongs to
     no view. */
  const dest = inv ? PERSONA[inv.view].home : 'overview';
  return `<div class="signin">
    <div class="signin-form">
      ${/* Composed, not LOGO.lock: the mark holds its own column and the
            wordmark stacks above the byline in a second one, exactly as the
            sidebar does it.  It does NOT reuse .brand-col — that class is
            display:none below 1180px and in the mini rail. */''}
      <div class="signin-brand">
        ${acctLogo('mark')}
        <div class="signin-brand-c">${acctLogo('word')}<div class="brand-sub">By Crozaint.com</div></div>
      </div>

      <div class="signin-mid">
        <div class="signin-box">
          <h1>Sign In</h1>
          <p class="signin-lead">Open the workspace and pick up where the numbers left off.</p>

          ${inv ? `<div class="signin-invite">
            <b>You have been invited to the Crozaint workspace.</b>
            <span>${accessLevel(inv.lvl).label} access${inv.to ? ' · ' + attrEsc(inv.to) : ''} ·
              opens on ${viewLabel(inv.view)}</span></div>` : ''}

          <label class="fld"><span>Email</span>
            <input class="inp" type="email" autocomplete="off"
                   placeholder="${inv && inv.to ? attrEsc(inv.to) : 'you@' + ACCT_DOMAIN}"></label>
          <label class="fld"><span>Password</span>
            <input class="inp" type="password" autocomplete="off" placeholder="Your password"></label>

          <div class="signin-row">
            <label class="signin-keep"><input type="checkbox" checked><span>Keep me signed in</span></label>
            <span class="signin-forgot">Invite-only — an admin resets a password</span>
          </div>

          <button class="btn pri signin-go" type="button" data-go="${dest}">Sign in</button>

          ${/* The "concept mock-up: nothing is sent, no account exists, no
                password is checked" panel used to sit here.  Deleted on
                instruction — the reader knows what they are being shown, and a
                disclaimer under the primary button is the first thing they
                read on the product's front door. */''}
          <p class="signin-alt">No account? Access is by invite — ask your workspace admin.</p>
        </div>
      </div>

      <p class="signin-foot">Finoptic · by Crozaint · invite-only workspace</p>
    </div>

    <div class="signin-hero">
      <section class="signin-panel">
        <span class="signin-wm" aria-hidden="true">${acctLogo('mark')}</span>
        <div class="signin-pitch">
          <h2>Every technology dollar, in one place.</h2>
          <p>Cloud, AI, software, security and support, reconciled into one set of numbers
             everyone can trust — so the questions that used to need a spreadsheet take a
             glance.</p>
        </div>
        <div class="signin-asks${acctStill() ? ' still' : ''}">
          ${ASK_ROWS.map(askRow).join('')}
        </div>
        <p class="signin-panel-foot">One reconciled ledger, from the first invoice you connect.</p>
      </section>
    </div>
  </div>`;
};
/* Declares that this screen wants no shell around it; go() reads it and stamps
   data-chrome on <html>, and styles.css takes the sidebar out of the layout
   entirely rather than painting over it. */
S.signin.chrome = 'bare';

/* ============================================================
   Delegated handlers
   ------------------------------------------------------------
   On `document`, because the screen is re-rendered wholesale and the pane is
   rewritten on every change — a listener bound to a button would be bound to a
   button that no longer exists a moment later.  Every control carries
   `data-acct`, so one closest() is both the dispatch and the guard that keeps
   all of this off the other nineteen screens.
   ============================================================ */
document.addEventListener('click', e=>{
  const hit = e.target.closest('[data-acct]');
  if(!hit) return;

  switch(hit.dataset.acct){
    case 'add':        acctPaneOpen('add', null, hit); return;
    case 'pane-close': acctPaneClose(); return;

    case 'member': {
      const m = acctFind(hit.dataset.id);
      if(m) acctPaneOpen('edit', m, hit);
      return;
    }

    case 'photo':       acctPickPhoto(); return;
    case 'photo-clear': PANE.d.photo = null; acctPaneRender('[data-acct="photo"]'); return;

    case 'role':
      PANE.d.level = hit.dataset.role;
      acctPaneRender('[data-role="' + hit.dataset.role + '"]');
      return;

    case 'dept':
      acctMenuLater(hit, 'dept', acctDepts().map(d=>({v:d, label:d, on:PANE.d.dept === d})), v=>{
        PANE.d.dept = v;
        acctPaneRender('[data-acct="dept"]');
      });
      return;

    case 'pane-save': {
      if(!acctReady()) return;
      const d = PANE.d, name = String(d.name).trim(), email = String(d.email).trim();
      if(PANE.mode === 'add'){
        const id = 'a:' + (++MEMBER_SEQ);
        ADDED.push({id, name, email, dept:d.dept, level:d.level, photo:d.photo,
                    last:'—', status:'Invited'});
        /* The photo travels WITH the row and is published into people.js's
           roster by acctRow() — which is the fix to "when I add an avatar while
           the invite is pending, the avatar does not appear in the table".  It
           used to live only on the in-progress form object and was dropped on
           the way into the list. */
        PANE.link = acctInviteLink(d);
        acctRerender();
        acctPaneRender();
        /* No toast here, unlike the edit branch: the pane has just replaced
           itself with the confirmation, so a toast would say the same thing a
           second time — over the top of the panel that is already saying it. */
      } else {
        MEMBER_EDIT[PANE.id] = {name, email, dept:d.dept, level:d.level, photo:d.photo};
        acctPaneClose();
        acctRerender();
        toast(name + ' updated', 'The change takes effect the next time they sign in.');
      }
      return;
    }

    case 'revoke': {
      const id = PANE.id, i = ADDED.findIndex(x=>x.id === id);
      if(i >= 0) ADDED.splice(i,1);
      delete MEMBER_EDIT[id];
      acctPaneClose();
      acctRerender();
      toast('Invite revoked', 'Removed from this tab. Nothing had been sent.');
      return;
    }

    case 'another':
      acctPaneOpen('add', null, paneReturn);
      return;

    case 'copy': {
      const url = PANE.link, view = defaultViewFor(PANE.d.dept);
      const done = ()=>toast('Invite link copied',
        'It opens Finoptic on the ' + viewLabel(view) + ' view.');
      const manual = ()=>toast('Copy this link', url);
      /* The same three-step fallback as shareView(): the clipboard API can be
         refused outright on a file:// origin, so a real copy has to survive
         being told no. */
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done).catch(()=>legacyCopy(url) ? done() : manual());
      } else { legacyCopy(url) ? done() : manual(); }
      return;
    }
  }
});

/* Typing must NOT repaint the pane — the input would lose focus mid-word — so
   the value is mirrored into the draft and only the cheap sync runs: it opens
   the next section, enables the action and rewrites the hint beside it. */
document.addEventListener('input', e=>{
  const f = e.target.closest('[data-pane-f]');
  if(!f || !PANE.d) return;
  PANE.d[f.dataset.paneF] = f.value;
  acctPaneSync();
});
