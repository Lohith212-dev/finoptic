/* ============================================================
   Finoptic — onboarding, empty states, fresh states
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  This one loads AFTER screens.js, which is what lets it do
   three different things to what is already there: add a screen to S, wrap the
   screens already in it (see §5), and reuse screens.js's openModal() rather
   than growing a second dialog implementation (§3).

   Four separate problems live in this file, and they are deliberately not one
   problem:

     1. EMPTY  — a card that has no rows to draw, for one of five named causes.
     2. GREETING — the first thirty seconds, for someone who has never seen the
                 product and has not asked a question yet.
     3. ONBOARDING — the ordered chain of connections that takes a workspace
                 from "connected" to a real screen, told as a THREE-CHAPTER
                 FLOW rather than as one page (see the note at the head of §4).
     4. FRESH  — a screen whose plumbing is connected and whose history is not.
                 The structure is intact; only the figures are missing.  This is
                 NOT the same as empty, and blanking it would say the wrong
                 thing.

   S.sources tells this story backwards — "how a dollar becomes a decision",
   for a workspace where every feed is already in.  S.onboarding is the same
   chain told forwards, to someone who has connected nothing yet.
   ============================================================ */

/* ============================================================
   1. The state family — one shell, five causes
   ------------------------------------------------------------
   The old empty state was a bold line and a sentence, and it was used for
   exactly one cause (a filter that selects nothing) while quietly standing in
   for four others.  Those four are genuinely different problems with different
   fixes, so they are different states — but they share one shell, because a
   reader should recognise "there is nothing here" before they read why.

   What differs is a Micro cause label and the actions.  NOT an icon and NOT a
   coloured edge: the Brand Guide bans an icon in an empty state outright, and
   role-carried-by-label is the same decision the briefing band already made.
   Nothing here is chatty; a state names the cause, the consequence and the fix,
   in that order, and stops.

   An empty state must never look like a zero — so no state renders a figure,
   and where a slot has to hold one it holds an em dash in --ink-4.
   ============================================================ */
const STATE_CAUSE = {
  filtered:'Filtered to nothing',
  nosource:'Source not connected',
  detail:'Detail missing',
  fresh:'No history yet',
  denied:'Not yours to complete'
};

/* The fixes offered by a `filtered` state are computed from the LIVE filter
   state, not written into the copy.  The old text told every reader to "widen
   the period, or clear a filter in the bar above" whether or not either was
   actually set — advice that is wrong half the time reads as boilerplate, and
   a reader stops reading the next one. */
function stateFixes(){
  const acts = [];
  const live = typeof liveFilters==='function' ? liveFilters() : [];
  if(live.length)
    acts.push({t:'Clear '+live.length+' filter'+(live.length===1?'':'s'), act:'clear'});
  if(typeof F!=='undefined' && typeof PERIODS!=='undefined' && F.period!==PERIODS[0][0])
    acts.push({t:'Widen to the full year', act:'period'});
  return acts;
}

const STATES = {
  /* kind    — one of STATE_CAUSE.  Defaults to `filtered`, because that is what
                every existing call site means.
     title   — the consequence, in the reader's terms.
     body    — why, and what to do about it.
     step    — an onboarding step number; adds the route to it.
     actions — overrides the computed fixes.  [{t, act}], [{t, go}] or
               [{t, connect}]. */
  empty({kind='filtered',title,body,step,actions}){
    const acts = actions ? actions.slice() : (kind==='filtered' ? stateFixes() : []);
    /* IT ANSWERS THE QUESTION WHERE IT WAS ASKED.  This used to be "Open step
       0N", which navigated to Getting started — so a reader who wanted to know
       why the Cloud screen was blank lost the Cloud screen to find out, and had
       to find their way back.  "A button that says 'See how to connect'.  When
       that button is clicked a side pane should open up which should have
       properly formatted text details as to how to implement that connection."
       A pane is right for this and a modal is not: the card that prompted the
       question stays visible beside it, which is what makes the instructions
       legible as being about THAT card.  The deep link is still there, at the
       foot of the pane, for a reader who wants the whole chain. */
    if(step) acts.push({t:'See how to connect', connect:step});
    /* A filtered state with nothing to widen and nothing to clear is not a
       filter problem at all — saying "clear a filter" when none is set sends
       the reader looking for a control that isn't there. */
    const txt = (kind==='filtered' && !acts.length)
      ? 'No filter is set, so this is the loaded dataset itself — it carries no rows for this view.'
      : body;
    return `<div class="empty state" data-state="${kind}">
      <span class="state-cause">${STATE_CAUSE[kind]||STATE_CAUSE.filtered}</span>
      <b>${title}</b>
      <p>${txt}</p>
      ${acts.length?`<div class="state-act">${acts.map(a=>
        `<button class="btn sm${a.connect?' pri':''}" type="button" ${a.connect
            ? `data-connect="${a.connect}"`
            : a.go
            ? `data-go="${a.go}"${a.step?` data-onb-jump="${a.step}"`:''}`
            : `data-state-act="${a.act}"`}
          >${a.t}</button>`).join('')}</div>`:''}
    </div>`;
  },

  /* An inline stand-in for a MISSING FIELD, as opposed to a missing row — the
     cell case of `detail`.  A table row that exists but has no owner should say
     so in the owner column, rather than printing an empty cell, which reads as
     a rendering fault, or "Unknown", which reads as a value. */
  missing(what, step){
    return `<span class="state-cell" title="${what} — filled by onboarding step 0${step||3}"
      >— <em>${what}</em></span>`;
  }
};

/* ============================================================
   2. The setup chain, and what each link buys
   ------------------------------------------------------------
   The order is a real dependency, not a preference, and it is worth stating
   why it is not the obvious one:

   · Budget is SECOND, not last.  The reconciliation strip is an equation, and
     it is on every screen.  Without a plan, every screen in the product reads
     "spend − — = —".  A budget is also the cheapest step in the list — one
     export from the accounting system — so putting it late buys nothing.
   · Tags come before owners, because an owner is attached to a tagged resource,
     not to a raw billing line.  Mapping owners first produces a directory that
     nothing points at.
   · Contracts are LAST because nothing else depends on them.  They are the one
     step a workspace can run without and still answer most questions — which is
     precisely why that step can be skipped, and says so.

   `proves` is the share of the reconciliation each step accounts for; the five
   sum to 100.  It is the honest form of "what does this buy me": not a screen
   count, but how much of the one number the product promises can be stood up.

   `how` is the instructions, and it exists because of where it is READ.  Chapter
   02 of Getting started describes each step to somebody planning a rollout — who
   it belongs to, what it costs, what stays dark without it.  A card on the Cloud
   screen that has nothing to draw is read by somebody who wants that card to
   work, now, and "usually platform engineering, half a day" does not tell them
   what to do next.  So each step carries the actual procedure, and the connect
   pane (§3b) is where it is shown.  Deliberately provider-shaped rather than
   generic: "create a read-only IAM role" is a thing you can go and do, and
   "configure your data source" is not.
   ============================================================ */
const ONB_STEPS = [
  {n:1, k:'Cost feeds',
   what:'Cloud billing exports, AI provider statements, and the SaaS, security and monitoring bills — landing daily, on their own.',
   turns:'the six spend screens, and the Spend side of the reconciliation.',
   from:['Cloud','AI','SaaS','Security','Observability','ITSM'],
   proves:40, provesWhat:'the Spend term of the equation',
   dark:'Without it there is no spend to report, so every screen in the product is a structure with no figures in it.',
   who:'Whoever holds the cloud and vendor accounts — usually platform engineering.',
   effort:'A read-only role per provider. Half a day, once.',
   how:['In AWS, create a read-only IAM role for the billing account and enable the Cost and Usage Report to S3.',
        'In Azure, grant Cost Management Reader on the billing scope and turn on the daily cost export.',
        'In Google Cloud, enable BigQuery billing export and grant the BigQuery Data Viewer role on that dataset.',
        'For AI, SaaS, security and monitoring, add each provider from Sources and paste its API key or usage export URL.',
        'Leave it a full day. The first import backfills up to twelve months, then it lands every morning on its own.'],
   role:null},

  {n:2, k:'Budget and plan',
   what:'The approved plan by month, category and department. Normally one export from the accounting system, loaded once a year and amended as it changes.',
   turns:'budget, variance and forecast — and the equation on every screen.',
   from:['Finance'],
   proves:25, provesWhat:'the Budget and Variance terms',
   dark:'Spend with no plan beside it is a number, not a position. Nothing can be called over or under.',
   who:'Finance. It is their plan, and they are the ones who restate it.',
   effort:'One export, re-sent whenever the plan is re-cut.',
   how:['Ask Finance for the approved technology plan by month, category and department \u2014 one row per combination.',
        'Save it as CSV with a month column in any date format, and a figure column in whole currency.',
        'Load it from Add a record \u2192 Budget line, or hand the file to whoever holds the workspace.',
        'Check the reconciliation strip: spend \u2212 budget = variance should stop showing an em dash on every screen.',
        'Re-send it whenever the plan is re-cut. Finoptic keeps every version and reports against the current one.'],
   role:'Finance'},

  {n:3, k:'Products and tags',
   what:'The rule that turns a resource tag into a product, plus the project mapping for anything that has no tag to read.',
   turns:'everything per-product: unit cost, cost allocation, showback.',
   from:['Cloud','ITSM'],
   proves:15, provesWhat:'the split of spend across products',
   dark:'Untagged cost is not lost, it is unattributable. It lands in Unallocated, and no team can be asked about it.',
   who:'Platform engineering, with a product owner to settle the edge cases.',
   effort:'The longest step. The rule takes an hour; agreeing the product list takes longer.',
   how:['Agree the product list first. This is the slow part, and every rule below depends on it.',
        'Decide which resource tag carries the product \u2014 most estates already have one, often `service` or `app`.',
        'Map each tag value to a product in Cost allocation. Anything unmapped lands in Unallocated, visibly.',
        'For resources with no tag, add a fallback rule by account, subscription or project.',
        'Backfill runs over the history you already have, so per-product figures appear for past months too.'],
   role:null},

  {n:4, k:'Owners and cost centres',
   what:'Who to ask, and whose budget it lands in — the HR directory for people, and the department mapping for cost centres.',
   turns:'chargeback, alert routing, and an owner on every anomaly.',
   from:['People'],
   proves:12, provesWhat:'the department and cost-centre split',
   dark:'An alert with no owner is noise. It is seen, agreed with, and left.',
   who:'IT, for the directory. Finance, for the cost-centre list.',
   effort:'A directory connection and one mapping table.',
   how:['Connect the HR or identity directory \u2014 Entra ID, Okta or a CSV of name, email and department.',
        'Map each department to a cost centre. Finance owns this list; it is usually already written down.',
        'Set an owner per product, so an anomaly on that product has somebody to route to.',
        'Choose who receives which severity. Critical goes to the owner; the rest can go to a shared queue.',
        'Alerts and anomalies start naming a person from the next run rather than saying Unassigned.'],
   role:null},

  {n:5, k:'Vendors and contracts',
   what:'Contract value, renewal date, seats purchased and who signed. None of this is in a billing feed — it comes from the contracts themselves.',
   turns:'procurement, licence utilisation, and renewal warnings.',
   from:['SaaS'],
   proves:8, provesWhat:'purchased-against-used, and the renewal calendar',
   dark:'Billing says what was charged. It does not say what was agreed, when it renews, or whether it is being used.',
   who:'Procurement, or whoever holds the signed copies.',
   effort:'Manual, and the only step here that stays manual. Skippable.',
   how:['Collect the signed contracts. There is no feed for this \u2014 it is the one step that stays manual.',
        'For each vendor record contract value, term, renewal date, notice period and who signed.',
        'For seat-based tools add seats purchased, so purchased-against-used becomes a number rather than a guess.',
        'Add them from Add a record \u2192 Contract, or load them together as CSV.',
        'Renewal warnings begin at 90 days out, so anything renewing sooner is worth entering first.'],
   role:null}
];

/* Which steps each screen genuinely needs before its figures mean anything.
   Reference data about the PLATFORM, so it lives here rather than in a dataset
   — the same call the flow diagram and the eight enrichment rules made.
   Insertion order is the table's order, and it follows the sidebar. */
const ONB_NEEDS = {
  overview:[1,2], itfm:[1,3], finance:[1,2], proc:[1,5], product:[1,3],
  cloud:[1], ai:[1], saas:[1,5], security:[1], itsm:[1],
  forecast:[1,2], allocation:[3,4], optimize:[1,3], anomalies:[1,4],
  alerts:[1,4], sources:[]
};

/* Walkthrough state.  In memory only.

   `st` opens with step 01 already done rather than at zero: "the plumbing is
   connected, the history is not" is the state the fresh screens demonstrate
   (§5), and the two have to agree or the walkthrough contradicts the preview it
   offers.
   `chap` is which of the three chapters is on screen — the whole point of the
   rebuild, see §4.  `sel` is which setup step is open inside chapter 2; zero is
   legal and means "all five collapsed".  `ready` unfolds the readiness table. */
let ONB = {st:{1:'done',2:'todo',3:'todo',4:'todo',5:'todo'}, sel:2, chap:1, ready:false};

/* Re-derived whenever a dataset loads, because the walkthrough describes THAT
   workspace's setup and a stale one contradicts the board beside it.  The only
   thing that can be read off a dataset honestly is step 01: a workspace with a
   closed month is visibly receiving cost data, and one with none is not.  The
   other four are agreements and mappings that leave no trace in the numbers, so
   they open as outstanding and the reader marks them.
   The CHAPTER is deliberately kept: switching workspaces mid-tour should not
   throw you back to chapter one. */
function onbSyncToDataset(){
  const feeds = (typeof workspaceEmpty==='function' && workspaceEmpty()) ? 'todo' : 'done';
  ONB = {st:{1:feeds,2:'todo',3:'todo',4:'todo',5:'todo'},
         sel: feeds==='done' ? 2 : 1, chap: ONB ? ONB.chap : 1, ready:false};
}

const onbStep  = n => ONB_STEPS.find(s=>s.n===+n) || ONB_STEPS[0];
const onbDone  = n => ONB.st[n]==='done';
const onbCount = v => Object.keys(ONB.st).filter(k=>ONB.st[k]===v).length;
const onbRecon = () => sum(ONB_STEPS.filter(s=>onbDone(s.n)).map(s=>s.proves));
/* The step a reader should be looking at next: the first that is neither done
   nor deliberately skipped.  Used both to open the accordion after a Connect
   and to word the "next action" band, so the two can never disagree. */
const onbNext = () => ONB_STEPS.find(s=>ONB.st[s.n]==='todo');

/* A screen is live when every step it needs is done, partial when some are.
   A screen that needs nothing — the data model, and this one — is always live,
   because it describes the platform rather than the customer. */
function onbReady(id){
  const need = ONB_NEEDS[id] || [];
  const met = need.filter(onbDone).length;
  return (!need.length || met===need.length) ? 'live' : met ? 'part' : 'wait';
}
const ONB_READY_BADGE = {live:['Live','ok'], part:['Partial','high'], wait:['Waiting','n']};
const onbLive = () => Object.keys(ONB_NEEDS).filter(id=>onbReady(id)==='live').length;

/* Three tones, on the pipeline's own logic (§7): grey is "nothing has happened
   yet", amber is "waiting on someone", green is "done".  Skipped takes amber
   rather than a second grey, because a skipped step is a gap somebody accepted
   and still pays for — it is not the same as one nobody has reached. */
const onbStatusBadge = s => {
  const st = ONB.st[s.n];
  if(st==='done')    return badge('Connected','ok');
  if(st==='skipped') return badge('Skipped','high');
  return badge(s.role ? 'With '+s.role : 'Not connected','n');
};

/* ============================================================
   3. The greeting, and the video placeholder
   ------------------------------------------------------------
   WHY A DIALOG AT ALL.  The mock-up's first frame is a board of eighteen
   figures about a company the reader has never heard of.  Everything needed to
   read it exists — but it is spread over seventeen screens, and nothing on the
   first one says "here is what you are looking at".  A greeting is the cheapest
   place to say it, and it is the only element in the product that can hold the
   reader's attention before they have formed a question.

   WHEN IT FIRES, and the three suppressions, because a dialog that fires when
   it is not wanted is worse than no dialog:
     · once per browser session, remembered in sessionStorage where that is
       available and in a module-level flag where it is not (a file:// origin is
       opaque, and Chrome may refuse the storage outright — so the flag is the
       contract and storage is the upgrade);
     · never under ?nofx, which is already the mock-up's "show me the settled
       board" switch for the screenshot harness and for a machine that cannot
       composite the cold-start veil;
     · never when the hash named a screen.  A cold start lands on the Executive
       overview; anything else means a shared link chose the screen, and the
       person following it asked for that view, not for an introduction.
   It waits for motion.js's veil to leave rather than racing it on a timer — the
   veil's own timings are budgeted in that file and are not this file's to know.

   HOW IT IS DISMISSED.  Escape, the ×, a click on the scrim, or either footer
   button — all four are openModal()'s contract, which is why this reuses it
   (§7.8) rather than growing a second dialog with its own focus trap.
   HOW IT COMES BACK.  "Replay the welcome" sits in chapter 1 of Getting
   started, permanently, so the one-shot is a convenience rather than a
   one-time-only event.
   ============================================================ */
let WELCOME_SEEN = false;
const WELCOME_KEY = 'finoptic.welcome';

function welcomeSeen(){
  if(WELCOME_SEEN) return true;
  try { return sessionStorage.getItem(WELCOME_KEY)==='1'; } catch(e){ return false; }
}
function markWelcomeSeen(){
  WELCOME_SEEN = true;
  try { sessionStorage.setItem(WELCOME_KEY,'1'); } catch(e){ /* opaque origin */ }
}

/* ---- the walkthrough ----
   THE POSTER IS DRAWN, THE VIDEO IS REAL.  The poster below is inline SVG of the
   product's own layout — sidebar, ticket strip, KPI row, trend and donut — and it
   stays, because it is the one image on this page that cannot fail to load: the
   mock-up opens from a file:// path and a remote thumbnail would leave a broken
   frame on a machine with no network.  Clicking it opens the walkthrough in a
   modal.

   Everything that used to hedge around the frame is gone.  It carried a
   "Placeholder" chip, a play control reading "Not recorded yet", a four-item
   caption listing what the walkthrough WOULD cover, and a note under the card
   explaining that no file was attached — four separate pieces of copy whose only
   job was to apologise for the absence of a video.  There is a video now, and the
   product does not narrate its own construction to the person using it. */
/* The embed.  youtube-nocookie, and every parameter that adds furniture turned
   off: no related-video grid at the end (rel=0), no in-player branding
   (modestbranding=1), and playsinline so a small viewport does not hand the
   video to the OS player and lose the modal underneath it.  autoplay is on
   because the frame was already clicked — the click IS the play button. */
const ONB_VIDEO = 'Y-c_xw9bHFw';
const onbEmbed = () =>
  `<iframe class="onb-embed" src="https://www.youtube-nocookie.com/embed/${ONB_VIDEO}`
  + `?autoplay=1&rel=0&modestbranding=1&playsinline=1"`
  + ` title="Finoptic — product walkthrough" frameborder="0" allowfullscreen`
  + ` allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
const ONB_POSTER = `<svg class="onb-poster" viewBox="0 0 640 360" role="img"
  aria-label="A still of the Executive Dashboard — the sidebar, the reconciliation strip, a row of figures, a spend trend and a category donut">
  <rect class="p-nav" x="14" y="14" width="92" height="332" rx="10"/>
  <circle class="p-mark" cx="34" cy="36" r="8"/>
  <rect class="p-navk" x="48" y="31" width="42" height="9" rx="4"/>
  ${[70,96,122,148,174,200].map((y,i)=>
    `<rect class="p-navi${i===1?' on':''}" x="26" y="${y}" width="${i%2?58:66}" height="8" rx="4"/>`).join('')}
  <rect class="p-h1" x="124" y="24" width="176" height="15" rx="5"/>
  <rect class="p-line" x="124" y="49" width="298" height="8" rx="4"/>
  <rect class="p-strip" x="124" y="72" width="502" height="56" rx="9"/>
  <rect class="p-fig" x="142" y="88" width="70" height="14" rx="4"/>
  <rect class="p-sub" x="142" y="109" width="46" height="7" rx="3"/>
  <rect class="p-op" x="232" y="94" width="15" height="4" rx="2"/>
  <rect class="p-fig" x="266" y="88" width="70" height="14" rx="4"/>
  <rect class="p-sub" x="266" y="109" width="46" height="7" rx="3"/>
  <rect class="p-op" x="356" y="91" width="15" height="4" rx="2"/>
  <rect class="p-op" x="356" y="101" width="15" height="4" rx="2"/>
  <rect class="p-fig" x="390" y="88" width="70" height="14" rx="4"/>
  <rect class="p-sub" x="390" y="109" width="46" height="7" rx="3"/>
  <rect class="p-perf" x="486" y="80" width="2" height="40" rx="1"/>
  <rect class="p-sub" x="506" y="90" width="48" height="10" rx="4"/>
  <rect class="p-sub" x="566" y="90" width="48" height="10" rx="4"/>
  ${[124,254,384,514].map((x,i)=>
    `<rect class="p-kpi${i?'':' hero'}" x="${x}" y="142" width="112" height="58" rx="9"/>`).join('')}
  <rect class="p-card" x="124" y="214" width="330" height="132" rx="9"/>
  <polyline class="p-plan" points="146,320 190,313 234,315 278,304 322,308 366,297 410,291 434,288"/>
  <polyline class="p-plot" points="146,324 190,303 234,309 278,276 322,288 366,254 410,242 434,230"/>
  <rect class="p-card" x="470" y="214" width="156" height="132" rx="9"/>
  <circle class="p-ring" cx="548" cy="284" r="34"/>
  <circle class="p-ring on" cx="548" cy="284" r="34"/>
</svg>`;

/* `sm` is the greeting's copy of the same frame.  One function rather than two
   markups, so the poster the greeting shows and the poster the screen shows can
   never drift apart.
   THE WHOLE FRAME IS THE BUTTON, not a control sitting on top of one.  A poster
   with a separate play widget over it gives a reader two things to aim at for
   one outcome, and the widget was carrying a second line of text that had to say
   something — which is how "Not recorded yet" got there.  The disc is now
   decoration on a button the size of the image. */
function onbFrame(sm){
  return `<button class="onb-frame${sm?' sm':''}" type="button" data-onb-play
          aria-haspopup="dialog" aria-label="Play the product walkthrough">
    ${ONB_POSTER}
    <span class="onb-play-d" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5 19 12 8.6 19Z"/></svg></span>
  </button>`;
}

/* How to move around, for someone who has never opened this.  It earns its
   place over more setup detail for one reason: this is a product CONCEPT shown
   to a client, and the thing they cannot work out on their own is the shape of
   the product, not the shape of a rollout. */
const ONB_TOUR = [
  ['The sidebar is four groups',
   'Overview, Spend, Manage and Reference. Only the group you are in is open — clicking another opens it and closes yours.'],
  ['Every screen is built the same way',
   'its headline first, then the filters, then the reconciliation strip. Both of those pin to the top as you scroll.'],
  ['The dark band under the headline is the answer',
   'What is happening, why it is happening, and what to do — with the money on the line, rather than left in a chart to be read out.'],
  ['The View dropdown changes who is asking',
   'IT financial management, Finance, Procurement or Products. The same data, a different first screen and different filters.'],
  ['Your name, bottom left, holds the workspace settings',
   'switch between the workspaces you have access to, change the accent colour, or load a dataset of your own.']
];

/* Morning / afternoon / evening, off the reader's own clock.  It is the cheapest
   possible signal that something on the other side of the screen knows when it is
   — and it is honest, which the rest of a greeting's warmth usually is not: this
   is the one thing about the reader the product genuinely does know. */
function onbGreetHour(){
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/* WHAT THIS IS, AND WHY IT WAS REBUILT.  The first version was a title, a
   paragraph, a video, a sub-heading, three numbered items each with their own
   paragraph, and a closing note — seven text blocks stacked in one column: "it
   doesn't feel welcoming; it looks like a block of text slapped together."

   The rebuild is not a restyle.  What changed is what the dialog is FOR.  It used
   to explain the product's construction to the reader — here is the equation,
   here is what is wired up, here is where the demo controls are.  A greeting is
   the one moment the reader has no question yet, which makes it the worst
   possible place for a specification and the best place for a welcome.

   So: their name and the time of day, one sentence on what the product is for,
   the walkthrough as the hero rather than as an illustration halfway down, and
   three short lines that are ORIENTATION rather than instruction.  Two ways out,
   both of them a real choice a person would make.  Nothing numbered, nothing
   sub-headed, and no paragraph longer than two lines. */
function onbWelcome(trigger){
  markWelcomeSeen();
  /* Read off the profile row rather than held in a constant here.  That row is
     the one place the signed-in name is authored (index.html), and a second copy
     in this file would be a name that greets you as somebody else the day the
     first one changes. */
  const nameEl = document.querySelector('#profile-btn .who b');
  const who = nameEl ? nameEl.textContent.trim().split(/\s+/)[0] : '';
  const co = (D.meta && D.meta.company) ? D.meta.company : 'your company';
  openModal(`
    <div class="wel">
      <button class="iconbtn mdl-x" type="button" data-mdl-close aria-label="Close">
        <span aria-hidden="true">&times;</span></button>
      <div class="wel-t">
        <p class="wel-hi">${onbGreetHour()}${who?', '+who:''}</p>
        <h2>Every technology dollar ${co} spends,<br>in one place.</h2>
        ${/* Shorter, on instruction — "reduce the amount of text".  What went was the
             LIST of domains: six nouns naming what the product covers, on a screen
             whose sidebar names all six anyway.  What stayed is the only sentence
             here that says something a reader could not guess. */''}
        <p class="wel-lead">Every line set against the plan it was supposed to cost,
          with the decision that needs making at the top of each screen.</p>
      </div>
      <div class="wel-v">${onbFrame(true)}
        <span class="wel-vt">Two minutes on how it works</span></div>
      <ul class="wel-pts">
        ${/* One line each, and no screen COUNT.  It said "Seventeen" while there were
             twenty-one, and twenty-one while there were twenty — a number maintained by
             hand in a sentence nobody re-reads is a number that will be wrong at the
             moment it is read aloud.  The point was never the count; it is that the
             equation holds everywhere, which is true whatever the count. */''}
        <li><b>Start anywhere</b><span>Spend <b>−</b> budget <b>=</b> variance, on
          every screen.</span></li>
        <li><b>Every number has a next step</b><span>Each headline says what happened,
          why, and what to do.</span></li>
        <li><b>Nothing to set up first</b><span>The tour is under Reference, whenever
          you want it.</span></li>
      </ul>
      <div class="wel-f">
        <button class="btn pri" type="button" data-onb-dismiss>Take me to the board</button>
        <button class="btn" type="button" data-onb-tour>Show me around first</button>
      </div>
    </div>`, 'Welcome to Finoptic', trigger);
}

/* ============================================================
   3b. "See how to connect" — the instructions, beside the card that asked
   ------------------------------------------------------------
   Opened from any empty state whose cause is a missing connection, and from the
   Sources screen.  It is a RIGHT-HAND PANE rather than a dialog for one reason:
   the card that prompted the question stays on screen next to it, so the
   instructions read as being about that card.  A modal would cover the board and
   turn "why is this blank" into a context switch.

   IT REUSES THE ACCOUNT PANE'S CLOTHES, NOT ITS CODE.  Team & access already has
   a pane, and every visual rule for one — the width, the scrim, the sticky
   header, the footer band, the entrance — lives in styles.css under `.pane`.
   Sharing that stylesheet section means there is one kind of pane in the product
   rather than two that drift.  Sharing the LIFECYCLE would have meant making
   acctPaneOpen() generic, and that function is welded to a member draft:
   acctDraft, acctReady, acctReach and the three-step reveal are all about
   validating a person.  So this keeps its own thirty lines and its own state.

   The two cannot both be open — they exist on different screens — but opening
   either closes the other outright, because they share `html.pane-open`, and two
   owners of one scroll lock is how a page ends up permanently unscrollable.
   ============================================================ */
let cpEl = null, cpReturn = null;
const CP_FOCUS = 'button:not([disabled]),[href],select,input,textarea,[tabindex]:not([tabindex="-1"])';

function connectPaneClose(silent){
  if(!cpEl) return;
  cpEl.remove(); cpEl = null;
  document.documentElement.classList.remove('pane-open');
  if(!silent && cpReturn && document.contains(cpReturn)) cpReturn.focus();
  cpReturn = null;
}

function connectPaneHTML(s){
  const dependents = Object.keys(ONB_NEEDS).filter(id=>(ONB_NEEDS[id]||[]).indexOf(s.n)>=0);
  const title = id => (typeof TITLES!=='undefined' && TITLES[id]) || id;
  const feeds = (D.sources||[]).filter(r=>s.from.indexOf(r[1])>=0);
  const done = onbDone(s.n);
  return `<header class="pane-h">
      <div class="pane-t"><b>${s.k}</b><span class="sub">Step 0${s.n} of 5${
        done ? ' · connected' : ''}</span></div>
      <button class="iconbtn pane-x" type="button" data-connect-close
              aria-label="Close"><span aria-hidden="true">×</span></button>
    </header>
    <div class="pane-b">
      <p class="cp-lead">${s.what}</p>

      <section class="cp-sec">
        <h4 class="pane-sh">How To Connect It</h4>
        <ol class="cp-how">${(s.how||[]).map(h=>`<li>${h}</li>`).join('')}</ol>
      </section>

      <section class="cp-sec">
        <h4 class="pane-sh">What It Turns On</h4>
        <p class="cp-p">${s.turns}</p>
        ${dependents.length?`<div class="cp-chips">${dependents.map(id=>
          `<span class="cp-chip${onbReady(id)==='live'?' on':''}">${title(id)}</span>`).join('')}</div>`:''}
        ${/* The cost of NOT doing it, kept next to what doing it buys — the two
              are the same sentence from opposite ends, and a reader deciding
              whether this is worth an afternoon needs both. */''}
        <p class="cp-dark">${s.dark}</p>
      </section>

      <section class="cp-sec">
        <h4 class="pane-sh">Where It Comes From</h4>
        ${feeds.length
          ? `<ul class="cp-feeds">${feeds.map(r=>
              `<li><b>${r[0]}</b><span>${String(r[2]||'Daily').toLowerCase()}</span></li>`).join('')}</ul>`
          : `<p class="cp-p">A mapping rule rather than a feed — nothing new to connect.</p>`}
        <dl class="cp-facts">
          <div><dt>Who normally does it</dt><dd>${s.who}</dd></div>
          <div><dt>What it takes</dt><dd>${s.effort}</dd></div>
          <div><dt>Worth</dt><dd>${s.proves}% of the reconciliation — ${s.provesWhat}</dd></div>
        </dl>
      </section>
    </div>
    <footer class="pane-f">
      ${done
        ? `<button class="btn pri" type="button" data-connect-close>Done</button>`
        : `<button class="btn pri" type="button" data-onb-do="${s.n}"
             >${s.role ? 'Request from '+s.role : 'Mark as connected'}</button>`}
      <button class="btn" type="button" data-go="onboarding" data-onb-jump="${s.n}"
              data-connect-close>All five steps</button>
    </footer>`;
}

function connectPaneOpen(n, trigger){
  connectPaneClose(true);
  /* The other pane in the product owns the same scroll lock, so it goes first.
     They live on different screens and cannot legitimately overlap, but a guard
     that costs one line is cheaper than a page that will not scroll. */
  if(typeof acctPaneClose==='function') acctPaneClose(true);
  const s = onbStep(n);
  const scrim = document.createElement('div');
  scrim.className = 'pane-scrim';
  scrim.innerHTML = `<aside class="pane" role="dialog" aria-modal="true" tabindex="-1"
    aria-label="How to connect: ${attrEsc(s.k)}">${connectPaneHTML(s)}</aside>`;
  /* Only a click that both STARTS and ends on the scrim closes it, so a text
     selection dragged out of the pane does not dismiss what you were reading. */
  let downOnScrim = false;
  scrim.addEventListener('mousedown', e=>{ downOnScrim = e.target===scrim; });
  scrim.addEventListener('click', e=>{ if(e.target===scrim && downOnScrim) connectPaneClose(); });
  scrim.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ e.stopPropagation(); connectPaneClose(); return; }
    if(e.key!=='Tab') return;
    const f = [].slice.call(scrim.querySelectorAll(CP_FOCUS)).filter(x=>x.offsetParent!==null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1], at = document.activeElement;
    if(f.indexOf(at)<0){ e.preventDefault(); (e.shiftKey?last:first).focus(); }
    else if(e.shiftKey && at===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && at===last){ e.preventDefault(); first.focus(); }
  });
  document.documentElement.style.setProperty('--sbw',
    (window.innerWidth - document.documentElement.clientWidth) + 'px');
  document.documentElement.classList.add('pane-open');
  document.body.appendChild(scrim);
  cpEl = scrim; cpReturn = trigger || null;
  scrim.querySelector('.pane').focus();
}

/* ============================================================
   4. Getting started — a flow, not a page
   ------------------------------------------------------------
   WHAT CHANGED, AND WHY.  Everything below used to be on screen at once: four
   KPIs, a progress meter, five setup steps each with two paragraphs and two
   buttons, a detail panel for the selected one, a seventeen-row readiness table
   and a preview button.  Every piece was defensible and together they were a
   wall — "overwhelming users with no clear direction".  Nothing has been
   deleted; it has been SEQUENCED.

   THREE CHAPTERS, not one wizard and not one checklist, because the content is
   three different kinds of thing and only the middle one is a list of tasks:

     01  See what it does   — the walkthrough placeholder and how to move around.
                              Nothing to set up; this is the chapter a client on
                              a call actually needs.
     02  Connect your data  — the five steps, ONE OPEN AT A TIME.  The open one
                              carries everything the old detail panel held; the
                              other four are a line each.
     03  See what it turns on — what is live now, the readiness table folded
                              behind a control, and the day-one preview.

   A single five-page wizard was the obvious alternative and was rejected: it
   would put the day-one preview — the most persuasive thing here — five clicks
   from the top, and it would make the orientation content feel like a form.

   The rail at the top is clickable, so this is a route rather than a corridor:
   a reader who wants the preview can have it in one click.  Exactly one primary
   button is on screen at any time, and it always names what happens next.
   ============================================================ */
const ONB_CHAPS = [
  {n:1, k:'See what it does',
   lead:'Start here — what Finoptic is for, and how to find your way around. Nothing on this page needs setting up.'},
  {n:2, k:'Connect your data',
   lead:'Five connections, in the order a rollout actually makes them. Open one at a time: each says what it turns on, and what stays dark until it is done.'},
  {n:3, k:'See what it turns on',
   lead:'What this workspace could answer right now — and what the Executive Dashboard looks like on a workspace that is two days old.'}
];

/* The rail's third line per chapter is LIVE state, not a static caption: it is
   what the four KPI tiles used to say, in the place a reader is already looking
   to find out where they are. */
function onbRailLine(n){
  const done = onbCount('done'), skipped = onbCount('skipped');
  if(n===1) return 'A walkthrough and five pointers';
  if(n===2) return done+' of 5 connected'+(skipped?' · '+skipped+' skipped':'');
  return onbLive()+' of '+Object.keys(ONB_NEEDS).length+' screens live · '+onbRecon()+'% reconciled';
}

function onbRail(){
  const done = onbCount('done'), skipped = onbCount('skipped');
  return `<nav class="onb-rail" aria-label="Getting started, in three chapters">
    ${ONB_CHAPS.map(c=>{
      const now = c.n===ONB.chap;
      /* Only chapter 02 can be "done", because it is the only one with a
         completion condition.  Ticking 01 because someone scrolled past it
         would be the progress bar lying about what it measures. */
      const finished = c.n===2 && done+skipped===5;
      return `<button class="onb-chap${now?' now':''}${finished?' done':''}" type="button"
        data-onb-chap="${c.n}"${now?' aria-current="step"':''}>
        <span class="onb-chap-n">0${c.n}</span>
        <span class="onb-chap-t"><b>${c.k}</b><em>${onbRailLine(c.n)}</em></span>
      </button>`;
    }).join('')}
  </nav>`;
}

/* The forward action, in a band of its own under the content.  It is a separate
   element rather than a button inside the last card because a reader who has
   finished reading a card is looking BELOW it, and because the sentence beside
   it — what the next chapter is — is the whole point of a flow.  The last
   chapter's action leaves the flow rather than looping it.

   ONE ACCENT BUTTON PER CHAPTER, and it is not always this one.  Chapter 2's
   real action is Connect inside the open step and chapter 3's is the day-one
   preview; making "next chapter" accent as well would put two orange buttons on
   screen arguing about which one the reader came for.  So this goes primary
   only where the chapter has no action of its own — chapter 1 always, and
   chapter 2 when every step is collapsed and there is nothing to connect. */
function onbNav(){
  const prev = ONB_CHAPS[ONB.chap-2], next = ONB_CHAPS[ONB.chap];
  const nx = onbNext();
  const pri = ONB.chap===1 || (ONB.chap===2 && !ONB.sel) ? ' pri' : '';
  const say = ONB.chap===1
      ? 'Then: the five connections a rollout makes, in dependency order.'
    : ONB.chap===2
      ? (nx ? 'Next up is step 0'+nx.n+' · '+nx.k+'. You can also skip ahead and see what is already live.'
            : 'Every step is answered — see what that turns on.')
      : 'That is the whole tour. The board is where the work happens.';
  return `<div class="onb-nav">
    ${prev?`<button class="btn" type="button" data-onb-chap="${prev.n}">Back</button>`:''}
    <p class="onb-nav-t">${say}</p>
    ${next
      ? `<button class="btn${pri}" type="button" data-onb-chap="${next.n}">0${next.n} · ${next.k}</button>`
      : `<button class="btn" type="button" data-go="overview">Open the Executive Dashboard</button>`}
  </div>`;
}

/* ---- chapter 01 ----
   THE VIDEO AND ONE COLUMN OF TEXT.  It used to be the video, a four-item caption
   under the video listing what the walkthrough would cover, a five-item tour
   list beside it, and a note under the card — four text groups around one image:
   "the video tile currently contains too many text groups, making the UI
   component overloaded.  It should display only the video and a single column of
   text."  The caption is gone outright (it described a video that now plays) and
   the note with it.  What is left is the thing a first-time reader actually
   needs: watch this, and here is how to move around while you do. */
function onbChapterOne(){
  return card({span:12, title:'What Finoptic Does',
    sub:'Two minutes on the product, and five pointers on the screen in front of you',
    body:`<div class="onb-intro">
      ${onbFrame()}
      <ol class="onb-tour">
        <li class="onb-tour-h"><span>How to move around</span></li>
        ${ONB_TOUR.map(t=>`<li><b>${t[0]}</b><span>${t[1]}</span></li>`).join('')}
      </ol>
    </div>`,
    note:`New to the workspace? <button class="onb-skip" type="button" data-onb-welcome>Replay the welcome</button>`});
}

/* ---- chapter 02 ---- */
/* A step is a disclosure row, on the same idiom the anomalies feed already
   uses: the header is the button, the panel is its sibling rather than its
   child, so a click on Connect inside the panel cannot also be read as a click
   on the header that would collapse it. */
function onbStepRow(s){
  const open = s.n===ONB.sel;
  return `<div class="row onb-step ${ONB.st[s.n]}${open?' sel':''}">
    <button class="onb-head" type="button" data-onb-step="${s.n}"
            aria-expanded="${open}" aria-controls="onb-p${s.n}">
      <span class="onb-n">0${s.n}</span>
      <span class="grow">
        <span class="t">${s.k}${onbStatusBadge(s)}</span>
        <span class="d onb-unlock"><em>Turns on</em> ${s.turns}</span>
      </span>
      <span class="onb-caret" aria-hidden="true">${icon('caret')}</span>
    </button>
    ${open?onbStepPanel(s):''}
  </div>`;
}

function onbStepPanel(s){
  const feeds = (D.sources||[]).filter(r=>s.from.indexOf(r[1])>=0);
  const title = id => (typeof TITLES!=='undefined' && TITLES[id]) || id;
  const dependents = Object.keys(ONB_NEEDS).filter(id=>(ONB_NEEDS[id]||[]).indexOf(s.n)>=0);
  return `<div class="onb-panel" id="onb-p${s.n}">
    ${s.role && !onbDone(s.n)
      ? STATES.empty({kind:'denied',title:'This One Is '+s.role+'&rsquo;s to complete',
          body:'The plan lives in the accounting system, and the workspace records '+s.role
            +' as its owner. You can see the step and chase it; you cannot fill it in from here.'})
      : ''}
    <p class="onb-what">${s.what}</p>
    <div class="onb-defs">
      ${/* Full width and laid out as a wrapping row, not a column: step 01
            draws ten feeds, and as a list in one grid column it made the panel
            twice as tall as the other four steps' with two empty columns
            beside it. */''}
      <div class="onb-def wide"><span>Where it comes from</span>${
        feeds.length
          ? `<ul class="onb-feeds">${feeds.map(r=>
              `<li><b>${r[0]}</b> · ${String(r[2]||'Daily').toLowerCase()}</li>`).join('')}</ul>`
          : '<p>A mapping rule rather than a feed — nothing new to connect.</p>'}</div>
      <div class="onb-def"><span>Who normally does it</span><p>${s.who}</p></div>
      <div class="onb-def"><span>What it costs to do</span><p>${s.effort}</p></div>
      <div class="onb-def"><span>Screens that depend on it</span>
        <p>${dependents.map(title).join(' · ')||'None'}</p></div>
      <div class="onb-def wide"><span>What stays dark until it is done</span><p>${s.dark}</p></div>
    </div>
    <div class="onb-do">
      <p class="onb-worth">Worth <b>${s.proves}%</b> of the reconciliation — ${s.provesWhat}.</p>
      <div class="onb-acts">
        ${onbDone(s.n)
          ? `<button class="onb-skip" type="button" data-onb-undo="${s.n}">Disconnect</button>`
          : `<button class="btn pri sm" type="button" data-onb-do="${s.n}"
               >${s.role?'Request from '+s.role:'Connect'}</button>`
            + (ONB.st[s.n]==='skipped' ? ''
              : `<button class="onb-skip" type="button" data-onb-skip="${s.n}">Skip for now</button>`)}
      </div>
    </div>
  </div>`;
}

function onbChapterTwo(){
  const done = onbCount('done'), recon = onbRecon();
  return card({span:12, title:'What Finoptic Needs, In Order',
    sub:'Each step is independent to do and dependent to use — a later one cannot make an earlier one true',
    pad:false,
    body:`<div class="onb-prog">${meter(done/5*100,done===5?'good':'')}
      <b>${recon}% of the reconciliation</b></div>`
      + rowList(ONB_STEPS.map(onbStepRow),'steps'),
    note:`<b>Connect</b> marks a step as done and turns on the screens that depend on it.
      <button class="onb-skip" type="button" data-onb-reset>Reset the walkthrough</button>`});
}

/* ---- chapter 03 ---- */
function onbChapterThree(){
  const ids = Object.keys(ONB_NEEDS), live = onbLive(), recon = onbRecon();
  /* Outstanding means `todo`, not "not done".  A skipped step is not waiting on
     anybody — counting it here would tell a reader to go and do something they
     have already decided not to do. */
  const left = ONB_STEPS.filter(s=>ONB.st[s.n]==='todo');
  const skipped = onbCount('skipped');
  const title = id => (typeof TITLES!=='undefined' && TITLES[id]) || id;
  const fig = (label,v,foot) => `<div><span>${label}</span><b>${v}</b><em>${foot}</em></div>`;

  return card({span:12, title:'Where This Workspace Stands',
    sub:'What the connections made so far are enough to answer',
    body:`<div class="onb-figs">
      ${fig('Screens live', live+' of '+ids.length,'Every step they need is in')}
      ${fig('Reconciliation coverage', recon+'%','Of the ledger equation these feeds can prove')}
      ${fig('Steps left', String(left.length),
        left.length ? left.map(s=>'0'+s.n).join(' · ')+' still open'
          : skipped ? skipped+' skipped, nothing waiting' : 'Nothing outstanding')}
    </div>
    <p class="onb-say">${left.length
      ? 'The screens still waiting are not broken — they are built, and every figure on them names the step that fills it. That is worth seeing before the steps are done rather than after.'
      : 'Every step is answered, so every screen in the workspace would carry a real figure. The preview below is the other end of the same story: what this looked like on day one.'}</p>`,
    note:`<b>${live} of ${ids.length}</b> screens would show a real figure right now.
      <button class="btn pri sm" type="button" data-fresh="on">See the Executive Dashboard on day one</button>`})

  + card({span:12, title:'Screen Readiness',
    sub:'Every screen in this workspace, and the steps standing between it and a real number',
    pad:false,
    body:(ONB.ready
      ? table(
          [{t:'Screen'},{t:'Group'},{t:'Waiting On'},{t:'Status'}],
          ids.map(id=>{
            const need = (ONB_NEEDS[id]||[]).filter(n=>!onbDone(n));
            const r = ONB_READY_BADGE[onbReady(id)];
            const grp = (typeof personaOf==='function' && personaOf(id)) ? 'View'
                      : (typeof groupOf==='function' ? groupOf(id) : '—');
            return [`<b>${title(id)}</b>`, `<span class="sub">${grp}</span>`,
              need.length
                ? `<span class="sub">${need.map(n=>'0'+n+' '+onbStep(n).k).join(' · ')}</span>`
                : '<span class="sub">Nothing</span>',
              badge(r[0],r[1])];
          }),
          null)
      : `<p class="onb-lead">${live} live, ${ids.length-live} still waiting on a step. The breakdown is a
          row per screen — useful when you are planning a rollout, and noise when you are not.</p>`)
      /* Its own class, not .rows-more: shell.js binds that one to the five-row
         clip and would toggle a `clip` class on this card's body and rewrite the
         button's text out from under it. */
      + `<button class="onb-more" type="button" data-onb-ready>${
          ONB.ready?'Hide the breakdown':'Show all '+ids.length+' screens'}</button>`});
}

/* ---- the screen ---- */
S.onboarding = () => {
  /* Export and the state URL both read TITLES, which shell.js builds from NAV.
     Registering the title here as well means this screen names itself correctly
     when it is reached by a link before it has a nav row of its own. */
  if(typeof TITLES!=='undefined' && !TITLES.onboarding) TITLES.onboarding = 'Getting Started';

  const chap = ONB_CHAPS[ONB.chap-1] || ONB_CHAPS[0];
  const body = ONB.chap===2 ? onbChapterTwo() : ONB.chap===3 ? onbChapterThree() : onbChapterOne();

  /* NO CONTROLS ROW AND NO RECONCILIATION STRIP.  This screen used to carry both:
     the strip in its fresh form (em dashes, with a sub-line naming the step that
     would fill each term) on the argument that the product's one permanent
     component should be on every screen and that a page of em dashes IS the
     argument for finishing the setup.  It reads as clutter instead — "what is the
     point of having a reconciliation bar and the download-share options, or that
     row for that matter?  Those are not relevant for getting started."
     And they are not.  Every control in that row acts on a dataset: the filters
     narrow rows this screen does not show, Export writes a CSV of tables this
     screen does not have, and Share copies a link to a view with no state in it.
     A row of five controls that cannot do anything is worse than no row — it is
     the same fault as the inert breadcrumb, in a wider format.  The strip goes
     with it: an equation whose three terms are all em dashes is a component
     performing its own absence.
     The day-one PREVIEW keeps both, and should — it is the Executive Dashboard,
     and the whole point of it is that the real screen's furniture is already
     there and empty. */
  return pageHead('Getting Started', chap.lead,
      (D.meta.company?D.meta.company+' · ':'')+'new workspace')
  + onbRail()
  + `<div class="grid">${body}</div>`
  + onbNav();
};

/* ============================================================
   5. Fresh state — day one, plumbing in, no history
   ------------------------------------------------------------
   A fresh screen is NOT an empty one, and the difference is the whole point of
   this section.  Empty means "there is nothing to show you here".  Fresh means
   "everything you will see is already built; it has not filled yet" — so the
   structure stays visible and each slot says which step fills it.  Blanking the
   screen would throw away the only thing it can currently offer, which is an
   accurate picture of what it is about to become.

   MECHANISM.  Not a second copy of the overview — a copy would drift the moment
   anyone edited the real one.  A flag, plus a wrap around the screen renderers
   that already exist.  The wrap runs at load, over whatever is in S at that
   point (the seventeen originals plus anything registered before this file), so
   a screen added AFTER this one would not clear the flag on arrival.
   ============================================================ */
let FRESH = false;

/* The page head that head() would emit, minus the ledger and the briefing band,
   which both screens in this file supply themselves. */
const pageHead = (h1,p,tag) => `<div class="pagehead"><div><h1>${h1}</h1><p>${p}</p></div>${
  tag?`<div class="persona-tag">${tag}</div>`:''}</div>`;

/* The reconciliation strip with the figures it cannot yet know.  Same markup and
   same component as the real one — including the collapse chevron, which still
   works — because the argument this strip makes is structural: the equation is
   the product's promise, and on day one none of its three terms exists.  Em
   dashes in --ink-4, never $0: a zero is a measurement.

   The FIGURES never change; only the sub-lines do, because "why not yet" is the
   only thing that moves as a workspace is connected.  The onboarding screen
   passes sub-lines derived from its own walkthrough state, so the strip cannot
   still say "plan not loaded" on a screen where the plan step reads Connected.
   The day-one preview passes none and keeps the defaults, because it is a fixed
   moment rather than a live state. */
const FRESH_SUBS = {spend:'no month closed yet', budget:'plan not loaded',
  variance:'needs both terms', forecast:'needs one closed month',
  savings:'needs 30 days of usage', unalloc:'needs product tags'};

function freshLedger(subs,stats){
  const s = Object.assign({}, FRESH_SUBS, subs||{});
  const cell = (k,v,sub) => `<div class="ledger-cell">
    <span class="ledger-k">${k}</span>
    <span class="ledger-v dash">${v}</span>
    <span class="ledger-sub">${sub}</span></div>`;
  const tip = typeof ledgerTip==='function' ? ledgerTip() : 'Hide the reconciliation bar';
  /* Mirrored from ledgerStrip() in shell.js: six equal lanes, dashed because
     none of the six figures exist on day one.  If the two ever disagree again,
     the strip is the tell — it is the one component on all of them.

     ROUND 14 — IT TAKES THE SCREEN'S OWN COUNTERFOIL LABELS.  It used to print the
     estate-level six on every screen, which meant an unmeasured workspace showed
     "Forecast year-end" on the Finance board while the loaded workspace showed
     "Uncommitted Spend" there — and, worse, the Finance screen's own
     `Forecast · Year-End` tile then sat under a strip lane of the same name.  The
     labels come from the same `stats` the loaded strip is passed, so the empty
     state is the loaded state with its figures removed, which is all it ever
     claimed to be.  Only the labels are taken: the sub-lines here say why a figure
     is missing, and the loaded strip's YTD sub-lines would be a lie about a
     workspace that has closed nothing.

     The last three labels were also SENTENCE CASE — "Forecast year-end",
     "Identified savings" — which is a straight 13.1 violation (every heading is
     Title Case, every word) that survived because it only renders on two of the
     six datasets. */
  const tail = (stats && stats.length ? stats : [
    ['Forecast Year-End',null,null],['Identified Savings',null,null],['Unallocated',null,null]
  ]).slice(0,3);
  const tailSubs = [s.forecast, s.savings, s.unalloc];
  return `<div class="ledger fresh">
    <div class="ledger-stats">
      ${cell('Actual','—',s.spend)}
      ${cell('Budget','—',s.budget)}
      ${cell('Variance','—',s.variance)}
      ${tail.map((r,i)=>cell(r[0],'—',tailSubs[i])).join('')}
    </div>
    <button class="iconbtn ledger-toggle tip tip-up" id="ledger-toggle"
            data-tip="${tip}" aria-label="${tip}">${icon('caret')}</button>
  </div>`;
}

/* The Executive Dashboard as a two-day-old workspace sees it.  Every card the
   real screen carries is present, with its real title and sub-line, and each one
   names the cause of its own blankness — which is why this screen is also where
   three of the five states in §1 appear in the place they belong, rather than in
   a gallery nobody would ever open.
   The eight KPI figures are em dashes and the hero is still the hero: a board
   whose promoted figure is the missing one is exactly what day one looks like,
   and promoting a different tile would misrepresent the screen. */
function freshOverview(){
  const dash = '<span class="state-dash">—</span>';
  const k = (label,foot,hero) => kpi({k:label,v:dash,foot,hero});
  return `<div class="pagehead">
    <div><h1>Executive Dashboard</h1>
    <p>Day one of a new workspace: the cost feeds started landing two days ago and nothing else is
       connected. Every figure below says which step fills it.</p></div>
    <div class="onb-preview"><span>Day-one preview</span>
      <button class="btn sm" type="button" data-fresh="off">Exit preview</button></div>
  </div>`
  + controlsRow() + freshLedger()
  + `<div class="briefing">
    <div class="brief what"><div class="brief-h"><b>What is happening</b></div>
      <p>Cost data has been arriving for <b>two days</b>. No month has closed and no plan has been
         loaded, so nothing on this screen can be reconciled yet.</p></div>
    <div class="brief why"><div class="brief-h"><b>Why it is happening</b></div>
      <p>Finoptic reports closed months against an approved plan. This workspace has neither — the
         first close is <b>26 days</b> away, and the budget is still with Finance.</p></div>
    <div class="brief do"><div class="brief-h"><b>What to do</b></div>
      <p>Load the budget and map product tags <b>now</b>, while the first month fills. Both are
         one-off, and both are what turn the figures on this screen from an em dash into a number.</p>
      <div class="brief-cta"><b>4 steps</b><span>left to connect</span>
        <button class="btn sm" data-go="onboarding" data-onb-jump="2">Open Getting started</button></div></div>
  </div>`
  + `<div class="grid">
  ${k('Total technology spend · YTD','First close in 26 days',true)}
  ${k('YTD budget','Step 02 · plan not loaded')}
  ${k('Budget variance','Needs spend and budget')}
  ${k('Forecast year-end','Needs one closed month')}
  ${k('Identified savings','Needs 30 days of usage')}
  ${k('Realised savings','Nothing actioned yet')}
  ${k('Cost per employee','Needs one closed month')}
  ${k('Unallocated spend','Step 03 · product tags not mapped')}

  ${card({span:8,title:'Technology Spend Trend',
    sub:'Actual against the phased plan, with the year-end projection',
    body:STATES.empty({kind:'fresh',title:'A Trend Needs A Closed Month',
      body:'Two days of cost lines have landed. The first point on this chart appears when the month closes; the plan line appears when the budget is loaded.'}),
    note:'The axis, the plan line and the forecast split are all already here. Only the months are missing.'})}

  ${card({span:4,title:'Spend By Category',
    body:STATES.empty({kind:'fresh',title:'Categories Fill On The First Close',
      body:'Categories are derived from the feeds themselves, so nothing has to be configured for this card. It needs a whole month to divide.'})})}

  ${card({span:4,title:'Spend By Vendor',sub:'Top 8, with the tail rolled up',
    body:STATES.empty({kind:'nosource',step:5,title:'The Vendor Register Is Not Loaded',
      body:'Billing says what was charged. It does not say which contract the charge falls under, when it renews, or who signed it — that is step 05.'})})}

  ${card({span:4,title:'Spend By Product',sub:'Including allocated shared cost',
    body:STATES.empty({kind:'detail',step:3,title:'Cost Lines Are Arriving Without A Product',
      body:'Rows are landing normally; the product tag on them is empty, so every dollar so far sits in Unallocated. Step 03 maps resource tags to products and backfills them.'})})}

  ${card({span:4,title:'Savings By Source',
    body:STATES.empty({kind:'fresh',title:'Nothing Has Been Compared Yet',
      body:'A saving is usage measured against what was bought. Both sides need about 30 days before the difference means anything.'})})}

  ${card({span:12,title:'Savings Opportunities',sub:'The backlog, ranked by annual value',
    body:STATES.empty({kind:'fresh',title:'The Backlog Fills After The First Pass',
      body:'Idle resources, unused licences and over-provisioned instances are all found by looking backwards. The first pass runs at 30 days — 28 to go.'}),
    note:'This table, its ranking and its status pipeline are all built. It is waiting for something to put in them.'})}
  </div>`;
}

/* Scope the preview to the one screen it was written for.  Wrapping every
   renderer rather than only S.overview is what makes leaving the preview end it
   — otherwise a click on Cloud would show a fully populated screen while the
   workspace was supposedly two days old, which is the contradiction the preview
   exists to avoid. */
(function scopeFresh(){
  Object.keys(S).forEach(id=>{
    const real = S[id];
    const wrapped = function(){
      if(!FRESH) return real.apply(this,arguments);
      if(id==='overview') return freshOverview();
      FRESH = false;
      return real.apply(this,arguments);
    };
    /* A renderer can carry declarations of its own — S.signin.chrome = 'bare' is
       one — and a wrapper that only forwards the CALL silently drops them.  That
       cost the sign-in screen its chrome-less layout: it rendered inside the
       shell, sidebar and all, and nothing errored. */
    Object.assign(wrapped, real);
    S[id] = wrapped;
  });
})();

/* ============================================================
   6. Events
   ------------------------------------------------------------
   Delegated on document, never bound: every screen re-renders wholesale, so a
   listener attached to one of these buttons would be attached to an element that
   no longer exists after the first click.  This listener is registered before
   shell.js's, so it runs first — which only matters for the `data-fresh`
   toggles, where FRESH has to be set before go() renders, and for `data-onb-jump`,
   which has to set the chapter before shell.js's `data-go` navigates.
   Every branch is guarded by its own attribute, so nothing here fires on the
   seventeen screens that know nothing about it.

   ORDER MATTERS ONCE, and only once: the step controls are tested before the
   step HEADER, because Connect and Skip sit inside the open panel and the panel
   is a sibling of the header rather than a child of it — but a stray future
   nesting change would otherwise turn every Connect into a collapse.
   ============================================================ */
document.addEventListener('click', e=>{
  const fresh = e.target.closest('[data-fresh]');
  if(fresh){
    FRESH = fresh.dataset.fresh==='on';
    go('overview');
    if(FRESH) toast('Day-one preview',
      'The Executive Dashboard as a new workspace sees it. Leaving this screen ends the preview.');
    return;
  }
  /* Set before shell.js's [data-go] handler navigates, so a card that says
     "step 03 fills this" lands on step 03 open rather than on chapter 1. */
  const jump = e.target.closest('[data-onb-jump]');
  if(jump){ ONB.chap = 2; ONB.sel = +jump.dataset.onbJump; }

  /* ---- the connect pane (§3b) ----
     Tested BEFORE the close, and both before anything else, because the pane's
     own footer carries a [data-go] that shell.js would otherwise handle while
     the pane was still open — leaving a pane hanging over a screen it no longer
     describes. */
  const cpClose = e.target.closest('[data-connect-close]');
  if(cpClose){ connectPaneClose(); /* falls through: the footer's own [data-go] still navigates */ }
  const cp = e.target.closest('[data-connect]');
  if(cp){ connectPaneOpen(+cp.dataset.connect, cp); return; }

  /* The two recoverable fixes a `filtered` state can offer.  They mirror the
     filter bar's own controls rather than reaching into it, because the state
     can be rendered on a screen whose bar does not carry that dimension. */
  const act = e.target.closest('[data-state-act]');
  if(act){
    if(act.dataset.stateAct==='clear')
      ['category','product','provider','env','vendor'].forEach(x=>F[x]=null);
    if(act.dataset.stateAct==='period') F.period = PERIODS[0][0];
    refresh(); return;
  }

  /* ---- the greeting ---- */
  const rewatch = e.target.closest('[data-onb-welcome]');
  if(rewatch){ onbWelcome(rewatch); return; }
  if(e.target.closest('[data-onb-dismiss]')){ closeModal(); return; }
  if(e.target.closest('[data-onb-tour]')){
    closeModal(); ONB.chap = 1; go('onboarding'); return;
  }
  /* The walkthrough, in the dialog every other overlay in the product uses.
     Playing it INLINE was the alternative — swap the poster for the iframe in
     place — and it loses twice: the frame is 330px tall in a half-width card,
     which is a poor size to watch anything at, and an iframe left in the page
     keeps playing while the reader scrolls away from it.  A modal is the right
     size, and closing it removes the iframe from the document, which is also the
     only reliable way to stop YouTube's player without talking to its API. */
  const play = e.target.closest('[data-onb-play]');
  if(play){
    openModal(`<div class="mdl-video">${onbEmbed()}
      <button class="iconbtn mdl-x" type="button" data-mdl-close aria-label="Close">
        <span aria-hidden="true">&times;</span></button></div>`,
      'Finoptic — product walkthrough', play);
    return;
  }

  /* ---- the flow ---- */
  const chapBtn = e.target.closest('[data-onb-chap]');
  if(chapBtn){
    ONB.chap = +chapBtn.dataset.onbChap;
    refresh();
    /* A chapter change is a navigation in everything but the URL, and the next
       chapter starts above the fold only if the reader is taken back to it. */
    window.scrollTo({top:0,behavior:'instant'});
    return;
  }
  if(e.target.closest('[data-onb-ready]')){ ONB.ready = !ONB.ready; refresh(); return; }
  if(e.target.closest('[data-onb-reset]')){
    ONB = {st:{1:'todo',2:'todo',3:'todo',4:'todo',5:'todo'}, sel:1, chap:2, ready:ONB.ready};
    refresh(); return;
  }
  const doIt = e.target.closest('[data-onb-do]');
  if(doIt){
    const s = onbStep(doIt.dataset.onbDo);
    ONB.st[s.n] = 'done';
    /* Opens the next OUTSTANDING step rather than staying on the one just
       answered.  "One thing at a time" is only a flow if the next thing arrives
       on its own; leaving the answered step open makes the reader hunt. */
    const nx = onbNext(); ONB.sel = nx ? nx.n : 0;
    /* From the connect pane the button is the last thing in the pane, so the
       pane's job is finished — and leaving it open over a board that has just
       re-rendered behind it would hide the very cards it turned on. */
    connectPaneClose(true);
    refresh();
    toast(s.role ? 'Requested from '+s.role : 'Connected '+s.k.toLowerCase(),
      s.role ? 'They will be asked for it. The step opens as soon as it lands.'
             : 'The screens that depend on it are live. '+s.turns.charAt(0).toUpperCase()+s.turns.slice(1));
    return;
  }
  const undo = e.target.closest('[data-onb-undo]');
  if(undo){
    const n = onbStep(undo.dataset.onbUndo).n;
    ONB.st[n] = 'todo'; ONB.sel = n; refresh(); return;
  }
  const skip = e.target.closest('[data-onb-skip]');
  if(skip){
    const s = onbStep(skip.dataset.onbSkip);
    ONB.st[s.n] = 'skipped';
    const nx = onbNext(); ONB.sel = nx ? nx.n : 0;
    refresh();
    toast('Skipped '+s.k.toLowerCase(), s.dark, 'warn');
    return;
  }
  const hdr = e.target.closest('[data-onb-step]');
  /* Toggles rather than only opening: a reader who has read a step should be
     able to shut it and see the five-line list again. */
  if(hdr){
    const n = +hdr.dataset.onbStep;
    ONB.sel = ONB.sel===n ? 0 : n;
    refresh(); return;
  }
});

/* ---- the one-shot greeting ----
   Armed at load rather than called from a boot hook, because this file has no
   hook into shell.js's boot and does not need one: the timeout resolves after
   shell.js — a parser-blocking tag below this one — has finished booting.
   It polls for motion.js's veil rather than sleeping for its duration; that
   file owns those timings and restating them here is how the two drift. */
(function armWelcome(){
  if(/[?&]nofx\b/.test(location.search)) return;
  let tries = 0;
  const tick = () => {
    if(++tries > 300) return;                      /* generous, because it now waits
                                                      out a sign-in as well */
    if(document.querySelector('.fx-boot')) return setTimeout(tick,120);
    if(welcomeSeen() || MODAL || FRESH) return;
    /* A cold start now lands on SIGN-IN, so the welcome WAITS for the board rather
       than giving up on not finding it — it used to return here, which after the
       landing screen changed meant it never fired at all.  Anything other than
       those two means a shared link chose the screen, and its reader asked for that
       view rather than for an introduction to the product. */
    if(current==='signin') return setTimeout(tick,200);
    if(current!=='overview') return;
    onbWelcome(null);
  };
  /* Never called synchronously.  shell.js declares `current` with `let`, so
     reading it from this file's top-level — which runs first — is a temporal
     dead zone throw, not an `undefined`, and `typeof` does not save you from
     that.  The first tick is scheduled instead, by which time shell.js has run. */
  setTimeout(tick,140);
})();
