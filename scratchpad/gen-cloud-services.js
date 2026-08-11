/* Spend Mix rework — generate a per-provider service breakdown for every scenario.
   The dataset only ever recorded service spend (Compute, Database, Storage...)
   aggregated across ALL cloud providers at once (cloud.services). The new nested
   donut on the Cloud Provider tab needs to know how much of AWS specifically is
   Compute vs. Database vs. Storage, separately from Azure and Google Cloud — a
   split the dataset never measured, so this authors one rather than hand-typing
   3 providers x 8 services x 6 datasets = 144 numbers that must each reconcile.

   Each provider gets an authored, realistic-looking WEIGHT PROFILE (AWS
   compute-heavy, Azure database-heavy from its SQL heritage, Google Cloud
   AI/data-heavy) applied to that provider's own already-authored `v` — the same
   kind of authored constant `committedRatio` is in gen-monthly.js. The row always
   reconciles exactly: sum(provider.services[].v) === provider.v.

   Run:  node scratchpad/gen-cloud-services.js --check   (verify, write nothing)
         node scratchpad/gen-cloud-services.js           (write the datasets) */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'finoptic', 'data');
const FILES = ['scenario-baseline.js', 'scenario-ai-crisis.js', 'scenario-optimised.js',
               'scenario-scaleup.js', 'scenario-fresh.js', 'scenario-zero.js'];

const WRAP_HEAD = 'FINOPTIC.scenario(\n';
const WRAP_TAIL = '\n);\n';

function load(file){
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const open = raw.indexOf('{');
  const close = raw.lastIndexOf('}');
  return { raw, json: raw.slice(open, close + 1) };
}
const ser = payload => WRAP_HEAD + JSON.stringify(payload, null, 2) + WRAP_TAIL;

/* Relative share of each provider's OWN spend, not of the grand total — applied
   to whatever `v` that provider already carries in a given scenario, so a
   provider's split scales with it automatically as scenarios differ. */
const PROFILE = {
  'AWS':             {Compute:.42, Storage:.14, Database:.12, Kubernetes:.13, Networking:.08, 'AI services':.05, Serverless:.04, Monitoring:.02},
  'Microsoft Azure': {Compute:.28, Database:.24, Storage:.16, Networking:.10, Kubernetes:.08, 'AI services':.08, Serverless:.03, Monitoring:.03},
  'Google Cloud':    {Compute:.24, 'AI services':.26, Database:.14, Storage:.14, Networking:.08, Kubernetes:.08, Serverless:.04, Monitoring:.02}
};

/* Rounds each share, then lands the rounding remainder on the LARGEST share —
   the same "one place carries the odd dollar" rule flow() uses in gen-monthly.js
   — so sum(out) === provider.v exactly. Zero-value shares are dropped: a $0
   slice is worse than an absent one (SCHEMA.md, "a zero-valued row is worse
   than an absent one"). */
function splitProvider(provider, serviceKeys){
  const profile = PROFILE[provider.k];
  if(!profile) return null;
  const weights = serviceKeys.map(k => profile[k] || 0);
  const wsum = weights.reduce((a,b)=>a+b, 0) || 1;
  const vals = weights.map(w => Math.round(provider.v * w / wsum));
  const diff = provider.v - vals.reduce((a,b)=>a+b, 0);
  if(diff){
    let bi = 0;
    for(let i=1;i<vals.length;i++) if(vals[i]>vals[bi]) bi=i;
    vals[bi] += diff;
  }
  return serviceKeys.map((k,i)=>({k, v:vals[i]})).filter(s=>s.v!==0);
}

const CHECK = process.argv.includes('--check');
let failures = 0;

for(const file of FILES){
  const { raw, json } = load(file);
  const payload = JSON.parse(json);

  if(ser(payload) !== raw){
    console.log(`  ${file}: round-trip is NOT byte-identical — refusing to rewrite.`);
    failures++; continue;
  }

  const providers = (payload.cloud && payload.cloud.providers) || [];
  const serviceKeys = ((payload.cloud && payload.cloud.services) || []).map(s=>s.k);

  if(!providers.length || !serviceKeys.length){
    console.log(`  ${file.padEnd(24)} no providers/services — nothing to split`);
    continue;
  }

  let ok = true;
  providers.forEach(p=>{
    const services = splitProvider(p, serviceKeys);
    if(!services){ console.log(`  ${file}: no profile authored for provider "${p.k}"`); ok=false; return; }
    const got = services.reduce((a,s)=>a+s.v,0);
    if(got !== p.v){ console.log(`  ${file}: ${p.k} services sum to ${got}, expected ${p.v}`); ok=false; return; }
    p.services = services;
  });
  if(!ok){ failures++; continue; }

  if(!CHECK) fs.writeFileSync(path.join(DIR, file), ser(payload));
  console.log(`  ${file.padEnd(24)} ` + providers.map(p=>p.k+' '+(p.services||[]).length+' svc').join('  |  '));
}

console.log(failures ? `\n${failures} problem(s).` : `\nAll provider service splits reconcile.${CHECK ? ' (check only, nothing written)' : ''}`);
process.exit(failures ? 1 : 0);
