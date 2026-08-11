/* ============================================================
   Finoptic — screens-input: "Add a record", the one manual-entry screen
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  index.html loads this after screens.js, which is where the
   `S` registry it writes into is declared, and before shell.js, which boots.

   ONE SCREEN, NOT SIX.  The brief floated a central form with progressive
   disclosure, and the alternative — one screen per record type — lost on two
   counts.  It would have put six rows into a sidebar the last feedback round
   already called overloaded, and five of the six would be identical in shape:
   pick a thing, price it, own it, colour it.  The thing you are adding is a
   FIELD, not a destination.  So the first question on this screen is "what are
   you adding", and everything below it is that answer's form.

   A FORM, NOT A BOARD.  The first build of this screen opened with the company's
   $1.62M reconciliation equation, four KPI tiles (one of them "Colour slots in
   use"), a six-card chooser and two empty panels — about 900px of analysis above
   a form: "users come to this screen to add a record, not to analyze anything.
   Showing too many details creates mental overload."  What is left is the three
   things a person on this screen actually needs: what they are adding, the fields
   for it, and the row it would create.  Concretely, and none of these should come
   back without a reason:
     · NO head().  It emits the controls row, the ledger strip and the briefing
       band; addHead() below emits the title and nothing else.  A filter bar on a
       record that does not exist yet is a control with nothing to narrow, and the
       company's spend equation above one typed row is the wrong subject.
     · NO KPI ROW.  Four figures about the dataset, on the one screen that is not
       about the dataset.  The only one worth keeping — how many rows you have
       staged — is now the staged section's own count, and only once there is one.
     · THE CHOOSER COLLAPSES.  Six option cards are a question; once it is
       answered they become one line plus "Change".
     · IDENTITY AND COLOUR FOLD AWAY.  The form picks both itself and shows what
       it picked on one line (see identityFold), so every control R7.24 and R7.25
       asked for is still there and still explained — one click in, not in the
       reader's face before they have typed a vendor name.
     · THE PREVIEW STAYS, AND STAYS QUIET.  It is the whole product concept — the
       row, in the destination table's own columns, with the figures the user did
       not type.  It is a line of grey text until there is something to show.

   WHAT IT DOES NOT DO, DELIBERATELY.  A staged record does NOT enter RAW or D.
   It could — nothing stops us pushing a row into `RAW.saas` — but the moment a
   record carries money, adding it breaks data/SCHEMA.md's invariants: a product
   breaks #5 (`sum(products[].v) == ytdActual`), a cost centre breaks #12, a
   cloud service breaks #8, and `reconcile()` in core.js would log drift on the
   next render.  Adding the row but not the totals is worse than not adding it,
   because principle 0.1 is that everything reconciles.  In the real product the
   ingest pipeline re-derives every total from the bill; in a mock-up the honest
   move is to show the row, show the arithmetic it implies, leave the ledger
   alone — and SAY so on screen rather than let a client infer it.

   Two things a staged record DOES change, because neither touches a number: its
   colour is written into `ENTITY` (charts.js) and its brand key into
   `VENDOR_BRAND` (components.js), so "colour follows the entity" (§2) is a
   promise this screen keeps rather than describes.

   EVENTS ARE DELEGATED ON `document`.  The grid is rebuilt wholesale on every
   keystroke, so anything bound to an element inside it would be bound to an
   element that no longer exists.  Form state lives in `ADD` below, outside the
   DOM, for the same reason.
   ============================================================ */

/* ---- session state ------------------------------------------------------
   Outside the DOM on purpose: renderAdd() throws the markup away and rebuilds
   it, so the DOM cannot be where the answers live.  Nothing is persisted — no
   localStorage — because a demo that remembers a half-filled form from
   yesterday looks broken on open, which is the same reasoning that keeps
   `shutGroups` in memory only. */
const ADD = {
  type: null,      /* one of ADD_TYPES[].id */
  picking: true,   /* is the "what are you adding" chooser expanded? */
  ident: false,    /* is the identity-and-colour fold open? */
  f: {},           /* field key -> value, as typed */
  custom: {},      /* field key -> true while the user types a value the catalogue does not list */
  colour: null,    /* an explicit --cN override; null means "use the auto pick" */
  icon: null,      /* a data: URI the user supplied for an entity with no official mark */
  staged: []       /* records staged this session, newest last */
};

/* This screen carries no filter dimensions and no controls row at all — you are
   describing a record that does not exist yet, so there is nothing to narrow and
   nothing to export.  `SCREEN_DIMS.add` and `NO_FILTER_NOTE.add` are still
   declared in core.js and are now unreachable; leaving them costs nothing and
   they are the right answer the day this screen grows a controls row again. */

/* ============================================================
   The six things a user can add
   ------------------------------------------------------------
   Each maps to a list data/SCHEMA.md already defines, and between them they
   cover every way money enters this estate: you buy seats (subscription), you
   consume infrastructure (cloud service), you consume tokens (model), you sign
   for a period (contract), or you create something for spend to be charged TO
   (product, cost centre).  Anything outside those five shapes is a spend
   record, and a spend record arrives from a bill, not from a form.
   ============================================================ */
/* `noun` exists because lower-casing the label is not the same as having one:
   "Add this llm model" is what `label.toLowerCase()` produces, and an acronym
   that has been de-capitalised reads as a typo. */
const ADD_TYPES = [
  {id:'saas',     ic:'saas',       label:'Subscription',   noun:'subscription',
   sub:'Software bought by the seat',
   lands:'SaaS & licences → Application inventory', screen:'saas'},
  {id:'cloud',    ic:'cloud',      label:'Cloud service',  noun:'cloud service',
   sub:'A service line on a cloud account',
   lands:'Cloud → Spend by service', screen:'cloud'},
  {id:'model',    ic:'ai',         label:'LLM model',      noun:'model',
   sub:'A model billed by tokens or by seat',
   lands:'AI → Model comparison', screen:'ai'},
  {id:'contract', ic:'proc',       label:'Vendor contract',noun:'contract',
   sub:'A commitment with a renewal date',
   lands:'Procurement → Renewal calendar', screen:'proc'},
  {id:'product',  ic:'product',    label:'Product',        noun:'product',
   sub:'A cost object spend is charged to',
   lands:'Products → Product profit and loss', screen:'product'},
  {id:'cc',       ic:'allocation', label:'Cost centre',    noun:'cost centre',
   sub:'A department that owns a budget',
   lands:'Cost allocation → Spend by department', screen:'allocation'}
];
const addType = () => ADD_TYPES.find(t=>t.id===ADD.type) || null;

/* ============================================================
   The form, as three revealed steps per type
   ------------------------------------------------------------
   `req` marks a field that gates the next step.  `when` hides a field until an
   earlier answer makes it relevant — that is disclosure happening WITHIN a step
   rather than only between them, and it is why the model form asks for requests
   and tokens on a metered model but seats on a subscription one.  `src` names a
   list in CATALOG; two of them (aiModels, cloudServices) resolve against an
   earlier answer, which is what stops the picker offering Vertex AI on an AWS
   account.
   ============================================================ */
const seatBilled = f => /seat/i.test(f.bill||'');
const ADD_STEPS = {
  saas: [
    {h:'Identify the subscription', f:[
      {k:'vendor', label:'Vendor',      kind:'pick', src:'vendors',       req:true, hint:'Whoever sends the invoice'},
      {k:'app',    label:'Application', kind:'text', req:true,            hint:'The name as it reads on the invoice'},
      {k:'cat',    label:'Category',    kind:'pick', src:'appCategories', req:true}
    ]},
    {h:'Commercials', f:[
      {k:'lic',    label:'Licences purchased',     kind:'num',   req:true},
      {k:'active', label:'Licences in active use', kind:'num',   req:true, hint:'Signed in within the last 30 days'},
      {k:'cost',   label:'Monthly cost',           kind:'money', req:true, hint:'In $K, the way every figure in Technomics is held'},
      {k:'term',   label:'Term',                   kind:'pick',  src:'terms', req:true},
      {k:'renew',  label:'Renews on',              kind:'date',  req:true}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner',  label:'Owner',      kind:'pick', src:'owners',   req:true, hint:'A record with no owner is how spend becomes unallocated'},
      {k:'charge', label:'Charged to', kind:'pick', src:'products', req:true}
    ]}
  ],
  cloud: [
    {h:'Identify the service', f:[
      {k:'provider',label:'Cloud provider', kind:'pick', src:'cloudProviders', req:true},
      {k:'service', label:'Service',        kind:'pick', src:'cloudServices',  req:true, hint:'Only this provider’s own catalogue is offered'},
      {k:'env',     label:'Environment',    kind:'pick', src:'environments',   req:true}
    ]},
    {h:'Commercials', f:[
      {k:'account', label:'Account',      kind:'text',  req:true},
      {k:'cost',    label:'Monthly cost', kind:'money', req:true, hint:'In $K'},
      {k:'term',    label:'Commitment',   kind:'pick',  src:'terms', req:true},
      {k:'charge',  label:'Charged to',   kind:'pick',  src:'products', req:true}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner',   label:'Owner', kind:'pick', src:'owners', req:true}
    ]}
  ],
  model: [
    {h:'Identify the model', f:[
      {k:'provider',label:'Provider',    kind:'pick', src:'aiProviders', req:true},
      {k:'model',   label:'Model',       kind:'pick', src:'aiModels',    req:true, hint:'Not listed? Add it from the foot of the menu'},
      {k:'use',     label:'Primary use', kind:'text', req:true,          hint:'What it runs — this is the column procurement reads'}
    ]},
    {h:'How it is metered', f:[
      {k:'bill',   label:'Billing basis',         kind:'pick',  src:'billing', req:true},
      {k:'cost',   label:'Monthly cost',          kind:'money', req:true, hint:'In $K'},
      {k:'lic',    label:'Licences purchased',    kind:'num',   req:true, when:seatBilled},
      {k:'active', label:'Licences in active use',kind:'num',   req:true, when:seatBilled},
      {k:'reqs',   label:'Requests per month',    kind:'text',  req:true, when:f=>!seatBilled(f), hint:'e.g. 0.71M'},
      {k:'tok',    label:'Tokens per month',      kind:'text',  req:true, when:f=>!seatBilled(f), hint:'e.g. 270M'}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner',  label:'Owner',      kind:'pick', src:'owners',   req:true},
      {k:'charge', label:'Charged to', kind:'pick', src:'products', req:true}
    ]}
  ],
  contract: [
    {h:'Identify the contract', f:[
      {k:'vendor', label:'Vendor',        kind:'pick', src:'vendors', req:true},
      {k:'scope',  label:'Scope',         kind:'text', req:true, hint:'What the agreement covers, e.g. “Cloud · Productivity · Security”'},
      {k:'cat',    label:'Cost category', kind:'pick', src:'costCategories', req:true}
    ]},
    {h:'Commercials', f:[
      {k:'value', label:'Annual contract value', kind:'money', req:true, hint:'In $K'},
      {k:'start', label:'Starts on',   kind:'date', req:true},
      {k:'renew', label:'Renews on',   kind:'date', req:true},
      {k:'term',  label:'Term',        kind:'pick', src:'terms', req:true},
      {k:'util',  label:'Utilisation', kind:'num',  req:true, hint:'Percent of what was bought that is actually used'},
      {k:'risk',  label:'Vendor risk', kind:'pick', src:'risk', req:true}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner', label:'Owner', kind:'pick', src:'owners', req:true}
    ]}
  ],
  product: [
    {h:'Identify the product', f:[
      {k:'name', label:'Product name',  kind:'text', req:true},
      {k:'bu',   label:'Business unit', kind:'pick', src:'costCentres', req:true, hint:'The unit the chargeback lands on'}
    ]},
    {h:'Plan', f:[
      {k:'budget', label:'Annual technology budget', kind:'money', req:true, hint:'In $K'},
      {k:'rev',    label:'Annual revenue',           kind:'money', hint:'Leave blank for an internal product'},
      {k:'cust',   label:'Customers',                kind:'num'}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner', label:'Owner', kind:'pick', src:'owners', req:true}
    ]}
  ],
  cc: [
    {h:'Identify the cost centre', f:[
      {k:'name', label:'Cost centre name', kind:'text', req:true},
      {k:'code', label:'Code',             kind:'text', req:true, hint:'e.g. ENG-1140 — this is the tag a resource has to carry'}
    ]},
    {h:'Plan', f:[
      {k:'budget', label:'Annual technology budget', kind:'money', req:true, hint:'In $K'},
      {k:'parent', label:'Rolls up to',              kind:'pick',  src:'costCentres'}
    ]},
    {h:'Ownership and identity', f:[
      {k:'owner', label:'Owner', kind:'pick', src:'owners', req:true}
    ]}
  ]
};

/* ============================================================
   Identity: a brand mark, an uploaded icon, or an initials orb
   ------------------------------------------------------------
   Three kinds of leading graphic can appear beside a name here, and they are
   different objects (§5):
     · a BRAND MARK — real artwork from BRANDS, carrying its own literal hexes.
       Never given `.ic`, which forces `fill:none; stroke:currentColor` and would
       erase a multi-colour logo outright.
     · an UPLOADED ICON — artwork the user supplied for an entity we ship no mark
       for.  An <img> on a data: URI, because a file:// page has nowhere to put
       a file.
     · an INITIALS ORB — the fallback, and the non-human sibling of the person
       avatar being built in people.js.  The convention that separates them is
       SHAPE, not size or colour: A PERSON IS A CIRCLE, AN ENTITY IS A ROUNDED
       SQUARE.  It sits in the same 17px lane as `.bm` so names stay on one x,
       and it carries two letters, which is what stops it reading as an entity
       swatch — `swatch()` is a 9px block of flat colour and nothing else.

   The orb's tone is the entity's REGISTERED colour where it has one, and a
   deterministic hash of its name where it does not.  Either way the same entity
   is the same colour in every list it appears in, which is the whole of §2.
   ============================================================ */
const addHash = s => {
  let h = 0, t = String(s);
  for(let i=0;i<t.length;i++) h = (h*31 + t.charCodeAt(i)) & 0x7fffffff;
  return h;
};
/* Two letters, from two words where there are two.  A one-word name takes its
   first two letters rather than a single initial: "Datadog" as a lone D beside
   "DeepSeek" as a lone D is a fallback that has stopped identifying anything. */
function addInitials(name){
  const w = String(name||'?').split(/[\s\-_/&·.]+/).filter(x=>/[A-Za-z0-9]/.test(x));
  if(w.length>1 && /[A-Za-z]{2}/.test(w[1])) return (w[0][0]+w[1][0]).toUpperCase();
  return (w[0]||'?').slice(0,2).toUpperCase();
}
const addSlotClass = v => 's' + (String(v||'--c1').replace('--c','') || '1');
const orbSlot = name => ec(name) || RAMP[addHash(name) % RAMP.length];
const orbHTML = name =>
  `<span class="mark-orb ${addSlotClass(orbSlot(name))}" aria-hidden="true">${addInitials(name)}</span>`;
/* A mark straight from BRANDS by key, for a catalogue name brandKey() cannot
   resolve — "Amazon Bedrock" is AWS's and "Google Gemini" is Google's, and
   neither is a vendor row in any dataset. */
const brandSvg = key => (key && typeof BRANDS!=='undefined' && BRANDS[key])
  ? `<svg class="bm" viewBox="0 0 24 24" aria-hidden="true">${BRANDS[key]}</svg>` : '';
/* The one entry point: whatever we have for this name, best first. */
function markFor(name, key, dataUri){
  if(dataUri) return `<img class="mark-img" src="${dataUri}" alt="">`;
  return brandSvg(key) || (hasBrand(name) ? brandMark(name) : orbHTML(name));
}

/* ---- what the catalogue knows about a name ---- */
const catVendor    = k => CATALOG.vendors.find(v=>v.k===k) || null;
const catAiProv    = k => CATALOG.aiProviders.find(v=>v.k===k) || null;
const catCloudProv = k => CATALOG.cloudProviders.find(v=>v.k===k) || null;
/* Catalogue first, because it covers names no dataset carries. */
function addBrandKey(name){
  const e = catVendor(name) || catAiProv(name) || catCloudProv(name);
  return (e && e.brand) || brandKey(name) || null;
}
/* The name a record is IDENTIFIED by, which is not always its own name: a
   subscription is fronted by its vendor, a model by its provider, a cloud
   service by its cloud. */
function addFace(){
  const f = ADD.f;
  switch(ADD.type){
    case 'saas':     return f.vendor   || '';
    case 'cloud':    return f.provider || '';
    case 'model':    return f.provider || '';
    case 'contract': return f.vendor   || '';
    case 'product':  return f.name     || '';
    case 'cc':       return f.name     || '';
    default:         return '';
  }
}
const addFaceMark = () => {
  const n = addFace();
  return n ? markFor(n, addBrandKey(n), ADD.icon) : '';
};

/* ============================================================
   Colour assignment (§2)
   ------------------------------------------------------------
   Colour follows the entity, so a record that will ever be a KEY in a chart has
   to be given a slot at the moment it is created — not picked positionally by
   whichever list happens to draw it first, which is what `RAMP[idx%8]` does for
   anything unregistered.

   Not every record mints one, and saying which is part of this screen's job:
     · a PRODUCT always does — it is a key in the donut, the P&L and chargeback
     · a VENDOR or an AI PROVIDER does, but only if it is new to `ENTITY`
     · a CLOUD SERVICE does not: the provider is the key and the service line is
       a breakdown of it, so giving "Cloud Run" its own hue would put a second
       colour inside Google Cloud's slice
     · a COST CENTRE does not: departments are charged spend, they are not a
       series — nothing charts on them
   ============================================================ */
function mintsColour(){
  const f = ADD.f;
  if(ADD.type==='product') return true;
  if(ADD.type==='saas' || ADD.type==='contract') return !!f.vendor && !ec(f.vendor);
  if(ADD.type==='model') return !!f.provider && !ec(f.provider);
  return false;
}
/* Which slots the registry has already spent, and on what.  Shown rather than
   hidden: "why is my new product orange as well" is a question a client will
   ask, and the answer belongs on the swatch. */
function slotOwners(){
  const owners = {};
  Object.keys(ENTITY).forEach(k=>{
    const v = ENTITY[k];
    if(/^--c[1-8]$/.test(v)) (owners[v] = owners[v] || []).push(k);
  });
  return owners;
}
/* First free slot, then a deterministic wrap once all eight are spent — the
   same name must always land on the same colour, or a reload would recolour it. */
function autoSlot(name){
  const owners = slotOwners();
  return RAMP.find(c=>!owners[c]) || RAMP[addHash(name) % RAMP.length];
}
const chosenSlot = () => ADD.colour || autoSlot(addFace() || 'x');

/* ============================================================
   Small helpers
   ============================================================ */
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,
  c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const filled = v => v!=null && String(v).trim()!=='';
/* <input type="date"> speaks ISO; every date in the datasets and on every screen
   is written "28 Sep 2026", and daysOut() parses that shape and no other. */
const dateLabel = v => {
  const p = String(v||'').split('-');
  return (p.length===3 && MONTHS3[+p[1]-1]) ? (+p[2])+' '+MONTHS3[+p[1]-1]+' '+p[0] : (v||'');
};
const numOf = v => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g,'')); return isNaN(n)?0:n; };

/* There is no empty-state component on this screen any more.  Three of them ran
   down the old layout — a boxed "Nothing chosen yet", a boxed "No record yet" and
   a boxed "Nothing staged yet" — and an empty state is an answer to "this card
   had nothing to show", which is the wrong question on a form nobody has started.
   A form that has not been started looks like a form. */

const addSteps = () => ADD_STEPS[ADD.type] || [];
const stepFields = step => step.f.filter(f=>!f.when || f.when(ADD.f));
const stepDone = step => stepFields(step).every(f=>!f.req || filled(ADD.f[f.k]));
const stepOpen = i => addSteps().slice(0,i).every(stepDone);
const formDone = () => !!ADD.type && addSteps().every(stepDone);
function fieldSpec(k){
  let hit = null;
  addSteps().forEach(s=>s.f.forEach(f=>{ if(f.k===k) hit = f; }));
  return hit;
}
/* Two labels are worth changing with the answer above them: AWS sells accounts,
   Azure subscriptions and Google projects, and a form that asks for an "account
   ID" under a Google project was written by someone who has not seen a bill. */
function fieldLabel(f){
  if(f.k==='account'){
    const p = catCloudProv(ADD.f.provider);
    if(p) return p.noun.charAt(0).toUpperCase()+p.noun.slice(1)+' ID';
  }
  return f.label;
}
function fieldHint(f){
  if(f.k==='account'){
    const p = catCloudProv(ADD.f.provider);
    if(p) return p.idHint;
  }
  return f.hint || '';
}

/* ============================================================
   Option lists
   ------------------------------------------------------------
   Two narrow against an earlier answer, and two grow with the session: a
   product staged a minute ago is immediately available to charge a subscription
   to, which is the point of having one screen rather than six.
   Each option is {v, mark, sub}.
   ============================================================ */
function pickOptions(key){
  const spec = fieldSpec(key) || {};
  const f = ADD.f;
  switch(spec.src){
    case 'vendors': {
      const extra = ADD.staged.filter(r=>r.type==='contract' && !catVendor(r.f.vendor))
        .map(r=>({k:r.f.vendor, brand:null, cat:r.f.cat}));
      return CATALOG.vendors.concat(extra).map(v=>
        ({v:v.k, mark:markFor(v.k, v.brand||brandKey(v.k)), sub:v.cat}));
    }
    case 'aiProviders':
      return CATALOG.aiProviders.map(p=>
        ({v:p.k, mark:markFor(p.k, p.brand), sub:p.models.length+' models and plans'}));
    case 'cloudProviders':
      return CATALOG.cloudProviders.map(p=>
        ({v:p.k, mark:markFor(p.k, p.brand), sub:p.services.length+' services in the catalogue'}));
    case 'aiModels': {
      const p = catAiProv(f.provider);
      if(!p) return [];
      return p.models.map(m=>({v:m.m, mark:markFor(p.k, p.brand),
        sub:m.bill==='seat'?'Bought by the seat':'Metered by tokens'}));
    }
    case 'cloudServices': {
      const p = catCloudProv(f.provider);
      if(!p) return [];
      return p.services.map(s=>({v:s.k, mark:markFor(p.k, p.brand), sub:'Rolls up into '+s.line}));
    }
    case 'products': {
      const extra = ADD.staged.filter(r=>r.type==='product').map(r=>r.f.name);
      return CATALOG.products.concat(extra).map(k=>({v:k, mark:'', sub:''}));
    }
    default:
      return (CATALOG[spec.src] || []).map(k=>({v:k, mark:'', sub:''}));
  }
}
/* Only these three get an "add one that is not listed" escape.  A term or an
   environment that is not in the list is a data-model change, not a typo — a
   free-text environment would silently create a sixth `cloud.envs` key. */
const CUSTOM_OK = {vendor:'vendor', provider:'provider', model:'model'};

/* ============================================================
   Where a record would land
   ------------------------------------------------------------
   The point of the screen: not "saved", but "here is the row, here is the table
   it belongs to, and here is what its money does to the category it joins."
   Every figure below is derived from D — the same filtered view every other
   screen reads — so the arithmetic is the mock-up's own rather than a second
   set of numbers written for this page.
   ============================================================ */
const catValue = re => (D.categories.find(c=>re.test(c.k)) || {v:0}).v;

/* AN UNANSWERED CELL IS AN EM DASH, NOT A ZERO AND NOT A DEFAULT.  The panel
   builds as you answer, which means for most of a session part of it is
   unanswered — and it used to fill those cells in for you: `$0K` for a cost
   nobody had typed, `0%` utilisation, and "Vendor risk: Low", which is a
   judgement the form invented.  A panel headed "exactly as it would appear"
   cannot say something the record does not (§0.7 — say what a number is).
   `.sub` rather than a bare dash, so it reads as absent rather than as a value. */
const DASH = '<span class="sub">—</span>';
const dashUnless = (v, render) => filled(v) ? render(String(v)) : DASH;

function addLanding(){
  const f = ADD.f, T = addType();
  if(!T) return null;
  const mark = addFaceMark();
  const monthly = numOf(f.cost), annual = Math.round(monthly*12*10)/10;
  const util = (n,d) => d ? Math.round(n/d*100) : 0;
  const priced = filled(f.cost);

  switch(ADD.type){
    case 'saas': {
      const cat = catValue(/^SaaS/);
      const seats = filled(f.lic) && filled(f.active);
      return {screen:'saas', card:'Application inventory',
        cols:[{t:'Application'},{t:'Purchased',r:true},{t:'Active',r:true},{t:'Utilisation',r:true},
              {t:'Monthly',r:true},{t:'Annualised',r:true},{t:'Renews'},{t:'Owner'}],
        row:[`<div class="ent">${mark}<div class="namecell"><b>${esc(f.app)}</b><span class="sub">${esc(f.vendor)} · ${esc(f.cat)}</span></div></div>`,
             dashUnless(f.lic, esc), dashUnless(f.active, esc),
             seats ? utilCell(util(numOf(f.active),numOf(f.lic))) : DASH,
             dashUnless(f.cost, ()=>moneyK(monthly)), dashUnless(f.cost, ()=>moneyK(annual)),
             dashUnless(f.renew, v=>`<span class="id">${esc(dateLabel(v))}</span>`),
             dashUnless(f.owner, esc)],
        effect:[
          ['Annualised commitment', priced ? money(annual) : '—'],
          ['Annualised, against SaaS & licences booked',
            priced ? share(annual,cat)+' of '+money(cat) : 'Needs a monthly cost'],
          ['Idle seats at these numbers',
            seats ? Math.max(0,numOf(f.lic)-numOf(f.active))+' of '+esc(f.lic) : 'Needs both licence counts']
        ]};
    }
    case 'cloud': {
      const p = catCloudProv(f.provider) || {services:[]};
      const line = (p.services.find(s=>s.k===f.service) || {line:'—'}).line;
      const cat = catValue(/^Cloud/);
      return {screen:'cloud', card:'Spend by service',
        cols:[{t:'Service'},{t:'Provider'},{t:'Environment'},{t:'Rolls Up Into'},
              {t:'Monthly',r:true},{t:'Annualised',r:true},{t:'Charged To'}],
        row:[`<b>${esc(f.service)}</b>`, `<div class="ent">${mark}<span>${esc(f.provider)}</span></div>`,
             esc(f.env), esc(line),
             dashUnless(f.cost, ()=>moneyK(monthly)), dashUnless(f.cost, ()=>moneyK(annual)),
             dashUnless(f.charge, esc)],
        effect:[
          ['Annualised run rate', priced ? money(annual) : '—'],
          ['Annualised, against cloud infrastructure booked',
            priced ? share(annual,cat)+' of '+money(cat) : 'Needs a monthly cost'],
          ['Service line it joins', line+' — one of the eight the cloud screen already breaks down']
        ]};
    }
    case 'model': {
      const cat = catValue(/^AI/);
      const seats = seatBilled(f);
      const perReq = (!seats && numOf(f.reqs)) ? monthly*1000/(numOf(f.reqs)*1e6) : null;
      return {screen:'ai', card:'Model comparison',
        cols:[{t:'Model'},{t:'Provider'},{t:'Requests',r:true},{t:'Tokens',r:true},
              {t:'Cost',r:true},{t:'Cost / Req',r:true},{t:'Primary Use'}],
        row:[`<b>${esc(f.model)}</b>`, `<div class="ent">${mark}<span>${esc(f.provider)}</span></div>`,
             seats ? DASH : dashUnless(f.reqs, esc), seats ? DASH : dashUnless(f.tok, esc),
             dashUnless(f.cost, ()=>moneyK(monthly)),
             perReq!=null?'$'+perReq.toFixed(4):DASH, `<span class="sub">${esc(f.use)}</span>`],
        effect:[
          ['Annualised run rate', priced ? money(annual) : '—'],
          ['Annualised, against AI & LLM booked',
            priced ? share(annual,cat)+' of '+money(cat) : 'Needs a monthly cost'],
          /* seatBilled() reads the billing basis, so before that field is
             answered "not seats" is an assumption rather than a reading. */
          ['Half of AI spend it joins', !filled(f.bill) ? 'Set by the billing basis'
            : seats ? 'Subscriptions — seats, not tokens'
            : 'API and tokens — consumption, not seats']
        ]};
    }
    case 'contract': {
      const value = numOf(f.value), u = numOf(f.util);
      const book = sum(D.vendors.map(v=>v.contract));
      const d = daysOut(dateLabel(f.renew));
      return {screen:'proc', card:'Renewal calendar',
        cols:[{t:'Vendor'},{t:'Category'},{t:'Renewal Date'},{t:'Days Out',r:true},
              {t:'Contract Value',r:true},{t:'Utilisation',r:true},{t:'Risk'}],
        row:[`<div class="ent">${mark}<b>${esc(f.vendor)}</b></div>`, esc(f.cat),
             dashUnless(f.renew, v=>`<span class="id">${esc(dateLabel(v))}</span>`),
             d==null?DASH:String(d),
             dashUnless(f.value, ()=>moneyK(value)),
             dashUnless(f.util, ()=>utilCell(u)),
             dashUnless(f.risk, riskBadge)],
        effect:[
          ['Contract value under management',
            filled(f.value) ? money(book)+' → '+money(book+value) : money(book)+' today'],
          ['Renewal window', d==null?'—'
            : d<0 ? Math.abs(d)+' days ago — already lapsed'
            : d<=90 ? d+' days out — inside the window procurement acts in'
            : d+' days out'],
          ['Negotiating position', !filled(f.util) ? 'Needs a utilisation figure'
            : u<75 ? 'Under-used at '+u+'% — true down before signing'
            : 'Healthy at '+u+'% — renew on current terms']
        ]};
    }
    case 'product': {
      const budget = numOf(f.budget), rev = numOf(f.rev);
      const avg = D.products.length ? Math.round(sum(D.products.map(p=>p.budget))/D.products.length) : 0;
      return {screen:'product', card:'Product profit and loss',
        cols:[{t:'Product'},{t:'Business Unit'},{t:'Revenue',r:true},{t:'Tech Budget',r:true},
              {t:'Customers',r:true},{t:'Tech % Of Revenue',r:true},{t:'Owner'}],
        row:[`<div class="ent">${mark}<b>${esc(f.name)}</b></div>`, esc(f.bu),
             rev?money(rev):DASH, dashUnless(f.budget, ()=>money(budget)),
             dashUnless(f.cust, esc),
             (rev && filled(f.budget)) ? pct(budget/rev*100) : DASH,
             dashUnless(f.owner, esc)],
        effect:[
          ['Against the average product budget', money(avg)+' across '+D.products.length+' cost objects'],
          ['Chargeback lands on', (esc(f.bu)||'—')+' — the showback table gains a row under it'],
          ['Spend booked so far', 'None — a product carries cost only once a bill is tagged to it']
        ]};
    }
    case 'cc': {
      const budget = numOf(f.budget);
      const book = sum(D.depts.map(d=>d.budget));
      return {screen:'allocation', card:'Allocation by department and product',
        cols:[{t:'Cost Centre'},{t:'Code'},{t:'Rolls Up To'},{t:'Budget',r:true},{t:'Owner'}],
        row:[`<div class="ent">${mark}<b>${esc(f.name)}</b></div>`, `<span class="id">${esc(f.code)}</span>`,
             dashUnless(f.parent, esc), dashUnless(f.budget, ()=>money(budget)),
             dashUnless(f.owner, esc)],
        effect:[
          ['Departmental budget on file',
            filled(f.budget) ? money(book)+' → '+money(book+budget) : money(book)+' today'],
          ['Tag a resource has to carry', (esc(f.code)||'—')+' — untagged spend is '+money(D.unallocated)+' today'],
          ['Spend booked so far', 'None — a cost centre carries cost only once a resource is tagged to it']
        ]};
    }
  }
  return null;
}

/* ============================================================
   Markup
   ============================================================ */
/* A record's own one-line name, for the preview and the staged list. */
function addTitle(){
  const f = ADD.f;
  switch(ADD.type){
    case 'saas':     return f.app     || '';
    case 'cloud':    return f.service || '';
    case 'model':    return f.model   || '';
    case 'contract': return f.vendor  || '';
    case 'product':  return f.name    || '';
    case 'cc':       return f.name    || '';
    default:         return '';
  }
}

/* The type chooser.  A glyph leads each option and there is NO `.tile` behind
   it: a tile belongs to a KPI figure and nowhere else (§5), but these are
   CONTROLS, which is the one place outside a KPI row an icon is still allowed.
   Six labelled text boxes were the alternative; they scanned worse and told a
   client nothing about what the product actually tracks.

   The third line each option used to carry — the table the record lands in — has
   gone.  Six destinations read before you have chosen anything is six answers to
   a question you have not asked, and the preview states the destination of the
   one type you did choose, in full, a moment later. */
const typeChooser = () => `<div class="add-types">${ADD_TYPES.map(t=>`
  <button class="add-type${t.id===ADD.type?' on':''}" type="button" data-addtype="${t.id}">
    <span class="at-h">${icon(t.ic)}<b>${t.label}</b></span>
    <span class="at-s">${t.sub}</span>
  </button>`).join('')}</div>`;

/* Once the question is answered it stops being a question.  Six option cards
   left standing under a half-filled form is the screen still asking something it
   already knows, and they were the single largest block on it — 260px at 1440.
   Collapsed, they are one line, and "Change" puts them back. */
const chosenLine = () => {
  const T = addType();
  return `<div class="add-chosen">
    ${icon(T.ic)}<b>${T.label}</b><span>${T.sub}</span>
    <button class="add-link" type="button" data-addchange>Change</button>
  </div>`;
};

function fieldHTML(f){
  const v = ADD.f[f.k];
  const hint = fieldHint(f);
  const label = `<label for="add-${f.k}">${fieldLabel(f)}${f.req?'':' <em>optional</em>'}</label>`;
  let control;
  if(f.kind==='pick' && !ADD.custom[f.k]){
    const dep = (f.src==='aiModels' || f.src==='cloudServices') ? 'provider' : null;
    /* `blank`, not `empty`: `.empty` is the empty-state component in styles.css
       (a centred column with 40px of padding), and a button wearing it laid its
       own label out as one. */
    if(dep && !filled(ADD.f[dep])){
      control = `<button class="pickbtn blank" type="button" id="add-${f.k}" disabled
        ><span class="pb-t">Choose a provider first</span></button>`;
    } else {
      const cur = pickOptions(f.k).find(o=>o.v===v);
      control = `<button class="pickbtn${filled(v)?'':' blank'}" type="button" id="add-${f.k}"
        data-pick="${f.k}" aria-haspopup="listbox" aria-expanded="false"
        >${cur&&cur.mark?cur.mark:''}<span class="pb-t">${filled(v)?esc(v):'Choose '+fieldLabel(f).toLowerCase()}</span
        ><span class="caret">${icon('caret',true)}</span></button>`;
    }
  } else if(f.kind==='date'){
    control = `<input type="date" id="add-${f.k}" data-field="${f.k}" value="${esc(v)}">`;
  } else {
    /* Numbers are text inputs with a decimal inputmode, NOT type="number".  A
       number input reports value:"" for a valid intermediate state like "1." —
       so the grid would rebuild with an empty value and eat the character the
       user had just typed.  numOf() parses what is typed; the spinners were not
       wanted anyway. */
    const numeric = f.kind==='num' || f.kind==='money';
    control = `<input type="text" id="add-${f.k}" data-field="${f.k}" value="${esc(v)}"
      ${numeric?'inputmode="decimal" class="num-in"':''} autocomplete="off"
      placeholder="${numeric?'0':esc(fieldLabel(f))}">`;
  }
  const back = (f.kind==='pick' && ADD.custom[f.k])
    ? `<button class="add-link" type="button" data-pick-list="${f.k}">Choose from the catalogue instead</button>` : '';
  return `<div class="add-field${(f.kind==='money'||f.kind==='num'||f.kind==='date')?' narrow':''}">
    ${label}${control}
    ${hint||back?`<span class="add-hint">${hint}${hint&&back?' · ':''}${back}</span>`:''}
  </div>`;
}

/* Identity and colour — the body of the fold below, never rendered on its own.
   This is the part a reader has to be TOLD about: why the record shows a logo or
   two letters, and why its colour is the one it is.  A form that silently assigns
   a hue is how two products end up sharing one. */
function identityBlock(){
  const name = addFace();
  if(!filled(name)) return '';
  const key = addBrandKey(name);
  const owners = slotOwners();
  const slot = chosenSlot();
  const taken = owners[slot] || [];
  const registered = ec(name);
  const why = ADD.type==='cloud'
      ? 'A service line is a breakdown of its provider, not a key of its own — it takes ' + esc(name) + '’s colour.'
    : ADD.type==='cc'
      ? 'Charts key on products, vendors and providers. A cost centre is charged spend; it is not a series, so it takes no slot.'
    : ADD.type==='model'
      ? 'A model inherits its provider’s slot — ' + esc(name) + ' is the key in the AI donut, not the model.'
      : 'Already registered to slot ' + String(registered||'').replace('--c','') + '.';

  return `<div class="add-ident">
    <div class="add-ident-face">
      <span class="add-ident-mark">${markFor(name, key, ADD.icon)}</span>
      <div>
        <b>${esc(name)}</b>
        <span>${ADD.icon ? 'Using the icon you supplied'
          : key ? 'Official mark, one of the 17 bundled in brands.js'
          : 'No official mark is bundled — showing its initials'}</span>
      </div>
      ${key ? '' : `<div class="add-ident-act">
        <button class="btn sm" type="button" id="add-icon">${ADD.icon?'Replace icon':'Upload an icon'}</button>
        ${ADD.icon?'<button class="add-link" type="button" id="add-icon-clear">Back to initials</button>':''}
      </div>`}
    </div>
    ${mintsColour() ? `<div class="add-ident-col">
      <span class="add-ident-k">Colour</span>
      <div class="add-slots">${RAMP.map(c=>`
        <button class="add-slot ${addSlotClass(c)}${c===slot?' on':''}${owners[c]?' used':''}" type="button"
          data-slot="${c}" title="${owners[c]?'In use by '+esc(owners[c].join(', ')):'Free'}"
          aria-label="Colour slot ${c.replace('--c','')}"></button>`).join('')}
        ${/* "First free slot" stops being true once all eight are spent, and a
              note that has quietly become a lie is worse than no note. */''}
        <span class="add-slot-note">${ADD.colour ? 'Chosen'
          : RAMP.some(c=>!owners[c]) ? 'Auto — the first free slot'
          : 'Auto — all eight are spent, so this one follows the name'}</span>
      </div>
      ${taken.length?`<span class="add-slot-warn">Slot ${slot.replace('--c','')} already belongs to ${esc(taken.join(', '))}. Two entities in one colour is what the registry exists to prevent.</span>`:''}
    </div>` : `<div class="add-ident-col">
      <span class="add-ident-k">Colour</span>
      <span class="add-ident-inherit">${registered?`<i class="add-slot ${addSlotClass(registered)} tiny"></i>`:''}${why}</span>
    </div>`}
  </div>`;
}

/* The identity block, folded.  Neither half of it is a decision most people make:
   the mark is a lookup and the slot is auto-picked, so a form that puts both in
   front of a reader is asking them to review an answer it already has.  Folded
   rather than deleted or moved off-screen — the header line carries the mark and
   the chosen swatch, so "what will this look like in a chart" is answered without
   opening anything, and the eight slots, the override warning and the icon upload
   (R7.24, R7.25) are all one click in.

   ADD.ident, not a <details>: renderAdd() throws the markup away on every
   keystroke, so an open <details> would snap shut mid-word. */
function identityFold(){
  const name = addFace();
  if(!filled(name)) return '';
  const slot = mintsColour() ? chosenSlot() : ec(name);
  return `<div class="add-fold${ADD.ident?' open':''}">
    <button class="add-fold-h" type="button" data-addident aria-expanded="${ADD.ident?'true':'false'}">
      <span class="add-fold-k">Identity and colour</span>
      <span class="add-fold-v">${markFor(name, addBrandKey(name), ADD.icon)}<span>${esc(name)}</span>${
        slot?`<i class="add-slot ${addSlotClass(slot)} tiny"></i>`:''}</span>
      <span class="caret">${icon('caret',true)}</span>
    </button>
    ${ADD.ident?identityBlock():''}
  </div>`;
}

/* ONE panel for the whole form.  The old layout spent four boxes on it — a
   chooser card, a Details card, a "What will be created" card and a KPI row above
   all three — and four boxes is four places for the eye to start on a screen with
   exactly one job. */
function formPanel(){
  const T = addType();
  const choosing = !ADD.type || ADD.picking;
  return `<div class="card add-panel">
    <div class="add-block">
      <h2 class="add-q">What Are You Adding?</h2>
      ${choosing ? typeChooser() : chosenLine()}
    </div>
    ${ADD.type ? `<div class="add-block">
      ${stepsBlock()}
      ${identityFold()}
      <div class="add-foot">
        <button class="btn pri" type="button" id="add-submit"${formDone()?'':' disabled'}
          >Add this ${T.noun}</button>
        <button class="add-link" type="button" id="add-reset">Start again</button>
      </div>
    </div>` : ''}
    <div class="card-note">Records you add are held in this session until the next sync, so you can
      review the rows before they go to the ledger.</div>
  </div>`;
}

function stepsBlock(){
  const steps = addSteps();
  return `<div class="add-steps">${steps.map((s,i)=>{
    const n = '0'+(i+1);
    /* A locked step is a heading and a count.  It used to carry a sentence
       naming the step above it by title — which is the step you are looking
       straight at, so it was explaining the obvious in the place with least room
       for it. */
    if(!stepOpen(i)){
      const cnt = stepFields(s).length;
      return `<section class="add-step lock">
        <div class="add-step-h"><span class="add-step-n">${n}</span><h4>${s.h}</h4>
          <span class="add-step-cnt">${cnt} field${cnt===1?'':'s'}</span></div>
      </section>`;
    }
    const done = stepDone(s);
    return `<section class="add-step${done?' done':''}">
      <div class="add-step-h"><span class="add-step-n">${n}</span><h4>${s.h}</h4>${
        done?'<span class="add-step-ok">Complete</span>':''}</div>
      <div class="add-fields">${stepFields(s).map(fieldHTML).join('')}</div>
    </section>`;
  }).join('')}</div>`;
}

/* TITLES is built in shell.js from NAV, which loads after this file, so it is
   read lazily and never at load time. */
const titleOf = id => (typeof TITLES!=='undefined' && TITLES[id]) || id;

/* The preview, beside the form.  This is the one thing on the screen that is not
   a form control and it earns its place: it shows the row in the DESTINATION
   TABLE'S OWN COLUMNS, including the cells nobody typed — utilisation, the
   annualised figure, cost per request, days to renewal — which is the difference
   between a form and a product.

   TRANSPOSED, one column label per line, rather than laid out as the horizontal
   table it will become.  A `table()` of eight columns in a 356px lane is a
   horizontal scrollbar and a set of sort headers on a single row; turned on its
   side it is a readable list, and it is the same cells in the same order.

   Quiet until there is something to show: a line of grey text before a type is
   chosen, another while the record is still being identified, and only then a
   panel.  An empty card here — which is what the old "What will be created" was
   for most of the session — is a box announcing that it has nothing in it. */
function previewSide(){
  const T = addType();
  if(!T) return `<p class="add-prev-wait">Pick what you are adding, and the row Technomics
    would create appears here — in the columns of the table it lands in, as you type.</p>`;
  const L = stepOpen(1) ? addLanding() : null;
  if(!L) return `<p class="add-prev-wait">Identify the ${T.noun} and the row it would create
    appears here, in the columns of the table it lands in.</p>`;
  return `<div class="card add-prev">
    <div class="card-h"><hgroup><h3>The Row This Creates</h3>
      <span class="csub">Exactly as it would appear on ${titleOf(L.screen)} → ${L.card}</span></hgroup></div>
    <div class="add-prev-b">${L.cols.map((c,i)=>`
      <div class="add-prev-cell${c.r?' r':''}"><span>${c.t}</span><div>${L.row[i]}</div></div>`).join('')}
    </div>
    <div class="add-prev-eff">${L.effect.map(e=>
      `<div><span>${e[0]}</span><b>${e[1]}</b></div>`).join('')}</div>
    ${/* "Open AI" reads as OpenAI, which on this screen of all screens is the
          wrong word to accidentally write — hence "the ... screen" around it. */''}
    <div class="add-prev-act">
      <button class="btn sm" type="button" data-go="${L.screen}">Open the ${titleOf(L.screen)} screen</button>
    </div>
    <div class="card-note">Every figure here is derived from the loaded dataset, so it moves when
      you switch scenario. <b>None of it is written back.</b></div>
  </div>`;
}

/* Nothing at all until something is staged.  The old screen opened with this
   table headed, carded and empty, on a form nobody had started — a promise of
   work you have not done yet, taking a full card's height to make it. */
function stagedSection(){
  if(!ADD.staged.length) return '';
  const rows = ADD.staged.map((r,i)=>{
    const T = ADD_TYPES.find(t=>t.id===r.type) || {label:r.type, lands:'—'};
    return [
      `<div class="ent">${r.mark}<div class="namecell"><b>${esc(r.title)}</b><span class="sub">${T.label}</span></div></div>`,
      T.lands,
      r.annual ? money(r.annual) : '—',
      r.slot ? `<div class="ent"><i class="add-slot ${addSlotClass(r.slot)} tiny"></i><span class="sub">slot ${r.slot.replace('--c','')}</span></div>`
             : '<span class="sub">inherited</span>',
      `<button class="add-link" type="button" data-unstage="${i}">Remove</button>`
    ];
  });
  return `<div class="add-staged">${card({span:12,
    title:'Staged This Session · '+rows.length,
    sub:'Held in this browser tab only — a reload clears it', pad:false,
    body:table([{t:'Record'},{t:'Where It Would Land'},{t:'Annualised',r:true},{t:'Colour'},{t:''}], rows),
    note:'The ledger has not moved, and that is correct. A row with no bill behind it would break the invariants in <b>data/SCHEMA.md</b> that make every screen agree — so Technomics shows the record and leaves the ledger to the numbers it can prove.'})}</div>`;
}

/* ============================================================
   The screen
   ============================================================ */
/* NOT head().  head() emits the controls row, the reconciliation strip and the
   briefing band — a filter bar for a record that does not exist yet, the
   company's whole spend equation above one typed row, and a What/Why/Do briefing
   about a screen that is not reporting anything.  This emits the title and stops.

   Omitting the controls row is safe and was checked rather than assumed:
   renderFilters() in shell.js returns on `if(!wrap) return` before it touches
   #asof, and Export / Share are delegated on document, so their absence is a
   click that matches nothing rather than a listener bound to null. */
const addHead = () => `<div class="pagehead add-head"><div>
  <h1>Add A Record</h1>
  <p>Choose what you are adding, answer only the fields it needs, and see the row it
     would create before anything is committed.</p>
</div></div>`;

S.add = () => {
  /* Until this screen has a row in NAV, shell.js's TITLES map has no entry for
     it and Export would head its CSV "Finoptic — undefined".  Set once, here,
     because at load time TITLES is still in its temporal dead zone. */
  if(typeof TITLES!=='undefined' && !TITLES.add) TITLES.add = 'Add a record';
  return addHead() + `<div class="add-page" id="add-grid">${addBody()}</div>`;
};

/* Deliberately NOT `.grid`.  The 12-column board is what every reporting screen
   uses and what makes one read as a board; this is a form beside its preview, so
   it is two columns that stack, and the id stays `add-grid` because renderAdd()
   and every keystroke path already point at it. */
function addBody(){
  return `<div class="add-cols">
    <div class="add-col">${formPanel()}</div>
    <aside class="add-side">${previewSide()}</aside>
  </div>
  ${stagedSection()}`;
}

/* Re-render only the body, never the whole screen.  go() scrolls to the top and
   rebuilds the nav and the filter row, which is right for a navigation and
   completely wrong for a keystroke — the page would jump to the top on every
   character typed.  Focus and the caret are carried across by hand, because
   replacing innerHTML destroys the element holding them. */
function renderAdd(){
  const host = document.getElementById('add-grid');
  if(!host) return;
  const a = document.activeElement;
  const key = (a && a.dataset) ? a.dataset.field : null;
  let pos = null;
  try{ pos = (a && a.selectionStart!=null) ? a.selectionStart : null; }catch(e){ pos = null; }
  host.innerHTML = addBody();
  if(!key) return;
  const n = host.querySelector('[data-field="'+key+'"]');
  if(!n) return;
  n.focus();
  if(pos!=null && n.setSelectionRange){ try{ n.setSelectionRange(pos,pos); }catch(e){} }
}

/* ============================================================
   The picker — a listbox that can show a logo, which <select> cannot
   ------------------------------------------------------------
   PORTALLED TO <body>, position:fixed, anchored to the trigger's on-screen
   rect — the same construction as openDimMenu() in shell.js, and for the same
   reason: `.card` is `overflow:hidden`, so a menu parented to a control inside
   one is clipped away while the control still responds to every click.  That
   exact bug cost a whole feedback round ("the filters are not working, and they
   are not clickable"); it is not being rediscovered here.

   It keeps the `.menu.vals` classes so every DISMISSAL path already written in
   shell.js applies to it for free — outside click, Escape, scroll and resize
   all close it, and none of that code is duplicated here.
   ============================================================ */
function pickList(key, opts, q){
  const s = String(q||'').trim().toLowerCase();
  const hit = s ? opts.filter(o=>(o.v+' '+(o.sub||'')).toLowerCase().indexOf(s)>=0) : opts;
  if(!hit.length) return `<div class="pick-none">Nothing matches “${esc(q)}”.</div>`;
  const cur = ADD.f[key];
  return hit.map(o=>`<button class="menu-opt pick-opt${o.v===cur?' on':''}" type="button"
    data-pick-val="${esc(o.v)}">${o.mark||''}<span class="po-n">${esc(o.v)}</span>${
    o.sub?`<span class="po-s">${esc(o.sub)}</span>`:''}</button>`).join('');
}
function openPick(anchor, key){
  const opts = pickOptions(key);
  const spec = fieldSpec(key) || {};
  const m = document.createElement('div');
  m.className = 'menu vals pickmenu';
  m.dataset.forPick = key;
  m.innerHTML =
    (opts.length>10 ? `<input class="pick-q" type="text" autocomplete="off"
        placeholder="Search ${esc(String(spec.label||'').toLowerCase())}…">` : '')
    + `<div class="pick-list">${pickList(key,opts,'')}</div>`
    + (CUSTOM_OK[key] ? `<div class="menu-sep"></div>
        <button class="menu-opt pick-new" type="button" data-pick-new="${key}"
          >Add a ${CUSTOM_OK[key]} that is not listed…</button>` : '');
  m.addEventListener('input', e=>{
    if(!e.target.classList.contains('pick-q')) return;
    m.querySelector('.pick-list').innerHTML = pickList(key,opts,e.target.value);
  });
  m.addEventListener('click', e=>{
    const nw = e.target.closest('[data-pick-new]');
    if(nw){
      ADD.custom[key] = true; setAddField(key,'');
      closeMenus(); renderAdd();
      const n = document.getElementById('add-'+key); if(n) n.focus();
      return;
    }
    const o = e.target.closest('[data-pick-val]');
    if(!o) return;
    setAddField(key, o.dataset.pickVal);
    closeMenus(); renderAdd();
  });
  document.body.appendChild(m);
  placePick(m, anchor.getBoundingClientRect());
  const q = m.querySelector('.pick-q'); if(q) q.focus();
}
/* Measured after insertion: a fixed element's own height is what decides whether
   it can hang below the trigger or has to flip above it. */
function placePick(m, r){
  m.style.minWidth = Math.max(250, r.width) + 'px';
  const h = m.offsetHeight, w = m.offsetWidth;
  const below = r.bottom + 6, flip = below + h > window.innerHeight - 8;
  m.style.top  = (flip ? Math.max(8, r.top - h - 6) : below) + 'px';
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
}
/* A fixed menu does not travel with the control it belongs to, so a page scroll
   has to move it.  shell.js's `repositionMenus` does exactly that for the FIRST
   `.menu.vals` on the page — but it finds the anchor by `data-for-dim`, i.e. by
   filter pill, and a picker has no pill.  Finding none it CLOSES the menu, which
   is how a picker opened near the foot of a long form was dismissed by the very
   scroll that brought it into view.

   Handled here rather than there because the anchor lookup is this file's to
   know.  Registered before shell.js's listener — capture listeners on one node
   fire in registration order, and index.html loads this file first — so the
   event is answered and stopped before `repositionMenus` can act on it. */
function repositionPick(e){
  const m = document.querySelector('.pickmenu');
  if(!m) return;
  const t = e && e.target;
  /* Scrolling the option list is not the control moving. */
  if(t && t.nodeType===1 && t.closest && t.closest('.pickmenu')){ e.stopImmediatePropagation(); return; }
  const anchor = document.querySelector('[data-pick="'+m.dataset.forPick+'"]');
  const r = anchor && anchor.getBoundingClientRect();
  /* Scrolled past its own control, the menu would be stranded over unrelated
     content — that is the one case where closing is right. */
  if(!r || r.bottom < 0 || r.top > window.innerHeight){ closeMenus(); return; }
  placePick(m, r);
  if(e) e.stopImmediatePropagation();
}
window.addEventListener('scroll', repositionPick, true);
window.addEventListener('resize', repositionPick);

/* ---- writing a field ----
   Some answers carry a sensible default for a later one.  Filling them in is
   the difference between a form that knows its own catalogue and one that makes
   you retype what it already knows — and every one of them stays overridable. */
function setAddField(key, val){
  ADD.f[key] = val;
  if(key==='vendor'){
    /* A catalogue vendor's `cat` is a `saas[].cat` value, so it may only
       pre-fill the SUBSCRIPTION form's category.  A contract's category comes
       from `categories[].k`, a different vocabulary — pre-filling it put
       "Analytics" into a field whose own list does not contain it, and the
       control then showed a value no option matched. */
    const v = ADD.type==='saas' ? catVendor(val) : null;
    if(v && !filled(ADD.f.cat)) ADD.f.cat = v.cat;
    ADD.colour = null;                 /* a different vendor is a different colour question */
    ADD.icon = null;
  }
  if(key==='provider'){
    /* The service and model lists hang off the provider, so a stale answer from
       the previous one would survive as a value the new catalogue cannot show. */
    ADD.f.service = ''; ADD.f.model = ''; ADD.f.bill = '';
    ADD.custom.model = false;
    ADD.colour = null; ADD.icon = null;
  }
  if(key==='model'){
    const p = catAiProv(ADD.f.provider);
    const m = p && p.models.find(x=>x.m===val);
    if(m) ADD.f.bill = m.bill==='seat' ? 'Per seat · monthly' : 'Per token or request';
  }
  if(key==='name') ADD.colour = null;
}

/* ---- staging ---- */
function stageRecord(){
  const L = addLanding(), T = addType();
  if(!L || !T) return;
  const face = addFace(), key = addBrandKey(face);
  const slot = mintsColour() ? chosenSlot() : null;
  /* The two registrations that DO happen, because neither is a number: colour
     follows the entity (§2), and a mark follows its vendor.  Session-only, like
     everything else on this screen. */
  if(slot) ENTITY[face] = slot;
  if(key && typeof VENDOR_BRAND!=='undefined') VENDOR_BRAND[face] = key;

  ADD.staged.push({
    type: ADD.type,
    title: addTitle() || face,
    mark: markFor(face, key, ADD.icon),
    annual: ADD.type==='contract' ? numOf(ADD.f.value)
          : (ADD.type==='product' || ADD.type==='cc') ? numOf(ADD.f.budget)
          : Math.round(numOf(ADD.f.cost)*12*10)/10,
    slot: slot,
    f: Object.assign({}, ADD.f)
  });
  toast('Staged for the next sync',
        'The row is in this session and joins the ledger at the next close.');
  resetAdd(ADD.type);
}
function resetAdd(keepType){
  ADD.f = {}; ADD.custom = {}; ADD.colour = null; ADD.icon = null;
  ADD.type = keepType || null;
  /* The fold reopens closed on a fresh record: it was opened to inspect ONE
     entity's colour, and leaving it open over the next one's would be showing a
     detail the reader asked about once. */
  ADD.ident = false;
}

/* ---- the icon a user supplies ----
   An <input type="file"> read through FileReader is the only route that works
   from a file:// origin — the same constraint that makes "Load a dataset
   (JSON)" a file picker rather than a fetch().  The result is a data: URI held
   in memory, because there is nowhere to put a file: no server, no store, and
   half a megabyte inside the page is already generous for a 17px mark. */
const ADD_ICON_MAX = 512 * 1024;
function addIconInput(){
  let i = document.getElementById('add-icon-file');
  if(i) return i;
  i = document.createElement('input');
  i.type = 'file'; i.id = 'add-icon-file'; i.hidden = true;
  i.accept = 'image/png,image/svg+xml,image/jpeg,image/webp';
  document.body.appendChild(i);
  i.addEventListener('change', e=>{
    const file = e.target.files[0];
    e.target.value = '';
    if(!file) return;
    if(file.size > ADD_ICON_MAX){
      toast('That file is too large','Keep it under 512 KB — the image has to live inside this page, and there is nowhere else to put it.');
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      ADD.icon = r.result; renderAdd();
      toast('Icon attached', file.name+' — held in this tab only, like everything else on this screen.');
    };
    r.onerror = () => toast('Could not read that file','Try a PNG or an SVG.');
    r.readAsDataURL(file);
  });
  return i;
}

/* ============================================================
   Delegated events
   ------------------------------------------------------------
   All on `document`, all guarded on being the current screen.  Nothing is bound
   to an element inside the screen: renderAdd() replaces every one of them.
   ============================================================ */
const onAddScreen = () => current==='add';

/* `[data-pick]` is now one of shell.js's MENU_TRIGGERS, so closeMenus() resets a
   picker trigger's aria-expanded on every dismissal path — outside click, Escape,
   scroll, resize.  The local clearPickAria() that used to shadow that work is
   gone; two things resetting one attribute is one of them being wrong later. */

document.addEventListener('click', e=>{
  if(!onAddScreen()) return;

  /* The picker trigger, and the one place propagation is stopped.
     shell.js's own document listener ends with "if this click was not inside a
     .menu, close every menu" — which would close this one in the same tick it
     opened, because the trigger is not inside a menu.  None of shell's other
     branches match a pick button, so the click is genuinely handled here and
     nowhere else, and closeMenus() is called explicitly first so nothing is
     lost by stopping it.  The alternative — deferring the open by a tick — was
     rejected as a race dressed up as a fix. */
  const trigger = e.target.closest('[data-pick]');
  if(trigger){
    e.stopImmediatePropagation();
    const key = trigger.dataset.pick;
    const mine = document.querySelector('.pickmenu[data-for-pick="'+key+'"]');
    closeMenus();
    if(!mine){ trigger.setAttribute('aria-expanded','true'); openPick(trigger, key); }
    return;
  }

  const t = e.target.closest('[data-addtype]');
  if(t){
    /* Re-picking the type you already had is a cancelled change of mind, not a
       new record — resetting there would punish opening the chooser to look. */
    if(t.dataset.addtype!==ADD.type) resetAdd(t.dataset.addtype);
    ADD.picking = false;
    renderAdd(); return;
  }
  if(e.target.closest('[data-addchange]')){ ADD.picking = true; renderAdd(); return; }
  if(e.target.closest('[data-addident]')){ ADD.ident = !ADD.ident; renderAdd(); return; }

  const back = e.target.closest('[data-pick-list]');
  if(back){ const k = back.dataset.pickList; ADD.custom[k] = false; setAddField(k,''); renderAdd(); return; }

  const slot = e.target.closest('[data-slot]');
  if(slot){ ADD.colour = slot.dataset.slot; renderAdd(); return; }

  const un = e.target.closest('[data-unstage]');
  if(un){ ADD.staged.splice(+un.dataset.unstage,1); renderAdd(); return; }

  if(e.target.closest('#add-icon')){ addIconInput().click(); return; }
  if(e.target.closest('#add-icon-clear')){ ADD.icon = null; renderAdd(); return; }
  if(e.target.closest('#add-submit')){ if(formDone()) stageRecord(); renderAdd(); return; }
  if(e.target.closest('#add-reset')){ resetAdd(ADD.type); renderAdd(); return; }
});

/* Typing.  The value is written on every keystroke because a gate can turn on
   mid-word, and the body is rebuilt so the preview follows the answer rather
   than lagging a field behind it.  renderAdd() carries the caret across; go() is
   deliberately not used, or the page would scroll to the top on every
   character. */
document.addEventListener('input', e=>{
  if(!onAddScreen()) return;
  const n = e.target.closest('[data-field]');
  if(!n) return;
  setAddField(n.dataset.field, n.value);
  renderAdd();
});
document.addEventListener('change', e=>{
  if(!onAddScreen()) return;
  const n = e.target.closest('[data-field]');
  if(!n) return;
  setAddField(n.dataset.field, n.value);
  renderAdd();
});
