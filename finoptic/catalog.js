/* ============================================================
   Finoptic — catalog: the seed lists the "Add a record" screen offers
   ------------------------------------------------------------
   Part of the mock-up's script set.  These files are plain <script> tags, not
   modules: every top-level binding is a shared global, so LOAD ORDER IS THE
   DEPENDENCY GRAPH.  index.html loads this between charts.js and screens.js;
   screens-input.js reads CATALOG at render time, not at load time.

   PLAIN DATA, NO FUNCTIONS — the same contract brands.js keeps.  Everything
   here is a literal, so the whole file can be read as "what a user is allowed to
   pick from" without following any code.  The logic that turns a pick into a
   staged row lives in screens-input.js.

   Three rules govern what may go in here, and they are why the lists look the
   way they do rather than being longer:

   1. EVERY OPTION HAS TO LAND SOMEWHERE REAL.  A cloud service carries `line`,
      one of the eight keys in `cloud.services`; a SaaS app carries a `cat` from
      the vocabulary `saas[].cat` already uses; a cost centre is one of the
      `depts` keys.  An option that maps to nothing would produce a row the rest
      of the mock-up cannot show, which is the "say what a number is" failure in
      a new place (Brand Guide §0.7, data/SCHEMA.md).
   2. `brand` IS A BRANDS KEY OR null, AND null IS A FEATURE.  Only 17 marks
      exist.  Meta, Mistral, xAI, DeepSeek, Cohere, Datadog and the rest carry
      null deliberately: they are what proves the initials-orb fallback, and a
      hand-drawn stand-in for a logo we do not have is the exact fault v3.1
      caught ("I think you did not use the correct ones and instead created them
      yourself").  Never invent a `brand` key to fill a gap.
   3. NAMES ARE THE REAL ONES, AT THE MOCK-UP'S OWN DATE.  The fiscal year runs
      to July 2026 and `meta.asOf` is 28 Jul 2026, so the model list is what a
      buyer would actually be choosing between then — not a historical set.
      Where a scenario dataset already names a model (GPT-5, GPT-5 mini,
      GPT-4.1 (Azure), Claude Sonnet 4.6, Claude Opus 4.5, Claude Haiku 4.5,
      Gemini 2.5 Pro), that exact string is in this list, so the AI screen's
      "Model comparison" table and this picker cannot drift apart.
   ============================================================ */

const CATALOG = {

  /* ---- AI providers and their models ------------------------------------
     `bill` decides the second half of the form: 'token' asks for requests and a
     consumption rate, 'seat' asks for licences purchased and licences active.
     A provider can carry both — OpenAI sells ChatGPT seats and GPT API calls,
     and a FinOps tool that cannot tell those two apart is the reason the AI
     screen splits "Subscriptions" from "API and tokens" in the first place. */
  aiProviders: [
    {k:'OpenAI', brand:'openai', models:[
      {m:'GPT-5.1',                    bill:'token'},
      {m:'GPT-5.1 mini',               bill:'token'},
      {m:'GPT-5',                      bill:'token'},
      {m:'GPT-5 mini',                 bill:'token'},
      {m:'GPT-5 nano',                 bill:'token'},
      {m:'GPT-4.1',                    bill:'token'},
      {m:'GPT-4.1 mini',               bill:'token'},
      {m:'o4-mini',                    bill:'token'},
      {m:'text-embedding-3-large',     bill:'token'},
      {m:'ChatGPT Business',           bill:'seat'},
      {m:'ChatGPT Enterprise',         bill:'seat'}
    ]},
    {k:'Anthropic', brand:'anthropic', models:[
      {m:'Claude Opus 4.5',            bill:'token'},
      {m:'Claude Sonnet 4.6',          bill:'token'},
      {m:'Claude Sonnet 4.5',          bill:'token'},
      {m:'Claude Haiku 4.5',           bill:'token'},
      {m:'Claude Opus 4.1',            bill:'token'},
      {m:'Claude Team',                bill:'seat'},
      {m:'Claude Enterprise',          bill:'seat'}
    ]},
    {k:'Google Gemini', brand:'google', models:[
      {m:'Gemini 3 Pro',               bill:'token'},
      {m:'Gemini 2.5 Pro',             bill:'token'},
      {m:'Gemini 2.5 Flash',           bill:'token'},
      {m:'Gemini 2.5 Flash-Lite',      bill:'token'},
      {m:'Gemma 3',                    bill:'token'},
      {m:'Gemini Advanced',            bill:'seat'},
      {m:'Gemini for Workspace',       bill:'seat'}
    ]},
    /* Azure OpenAI is its own provider line, not a Microsoft sub-heading: it is
       billed on the Azure agreement, lands in the Azure commitment, and the
       datasets already treat it as a seventh AI provider with its own colour. */
    {k:'Azure OpenAI', brand:'azure', models:[
      {m:'GPT-5 (Azure)',              bill:'token'},
      {m:'GPT-5 mini (Azure)',         bill:'token'},
      {m:'GPT-4.1 (Azure)',            bill:'token'},
      {m:'GPT-4.1 mini (Azure)',       bill:'token'},
      {m:'o4-mini (Azure)',            bill:'token'},
      {m:'text-embedding-3-large (Azure)', bill:'token'}
    ]},
    {k:'Amazon Bedrock', brand:'aws', models:[
      {m:'Nova Pro',                   bill:'token'},
      {m:'Nova Lite',                  bill:'token'},
      {m:'Nova Micro',                 bill:'token'},
      {m:'Claude Sonnet 4.5 (Bedrock)',bill:'token'},
      {m:'Llama 4 Maverick (Bedrock)', bill:'token'},
      {m:'Titan Text Embeddings v2',   bill:'token'}
    ]},
    {k:'Microsoft 365 Copilot', brand:'microsoft', models:[
      {m:'Microsoft 365 Copilot',      bill:'seat'},
      {m:'Copilot Chat',               bill:'seat'},
      {m:'Copilot Studio',             bill:'seat'}
    ]},
    {k:'GitHub Copilot', brand:'github', models:[
      {m:'GitHub Copilot Business',    bill:'seat'},
      {m:'GitHub Copilot Enterprise',  bill:'seat'}
    ]},
    {k:'Perplexity', brand:'perplexity', models:[
      {m:'Sonar',                      bill:'token'},
      {m:'Sonar Pro',                  bill:'token'},
      {m:'Sonar Reasoning Pro',        bill:'token'},
      {m:'Perplexity Enterprise',      bill:'seat'}
    ]},
    /* From here down there is no official mark in BRANDS, so every one of these
       renders as an initials orb — in the picker, in the summary and in the
       staged row.  They are in the list precisely because a real estate has
       vendors nobody has artwork for. */
    {k:'Meta', brand:null, models:[
      {m:'Llama 4 Maverick',           bill:'token'},
      {m:'Llama 4 Scout',              bill:'token'},
      {m:'Llama 3.3 70B',              bill:'token'},
      {m:'Llama 3.1 405B',             bill:'token'}
    ]},
    {k:'Mistral AI', brand:null, models:[
      {m:'Mistral Large 3',            bill:'token'},
      {m:'Mistral Medium 3',           bill:'token'},
      {m:'Mistral Small 3.2',          bill:'token'},
      {m:'Magistral Medium',           bill:'token'},
      {m:'Codestral',                  bill:'token'}
    ]},
    {k:'xAI', brand:null, models:[
      {m:'Grok 4',                     bill:'token'},
      {m:'Grok 4 Fast',                bill:'token'},
      {m:'Grok 3',                     bill:'token'},
      {m:'Grok 3 mini',                bill:'token'}
    ]},
    {k:'DeepSeek', brand:null, models:[
      {m:'DeepSeek-V3.2',              bill:'token'},
      {m:'DeepSeek-R1',                bill:'token'}
    ]},
    {k:'Cohere', brand:null, models:[
      {m:'Command A',                  bill:'token'},
      {m:'Command R+',                 bill:'token'},
      {m:'Embed 4',                    bill:'token'},
      {m:'Rerank 3.5',                 bill:'token'}
    ]},
    {k:'Cursor', brand:null, models:[
      {m:'Cursor Business',            bill:'seat'},
      {m:'Cursor Enterprise',          bill:'seat'}
    ]}
  ],

  /* ---- cloud providers and their service catalogue ----------------------
     Three providers, because `cloud.providers` is three in every scenario and a
     fourth would leave the provider donut with a slice that has no history.
     `noun` and `idHint` change the account field's label per provider — AWS
     sells accounts, Azure subscriptions, Google projects, and a procurement
     person told to type an "account ID" into a Google project field rightly
     concludes the form was written by someone who has not seen a bill.
     Every service carries `line`: one of the eight keys in `cloud.services`, so
     an added service falls inside the breakdown the cloud screen already draws
     instead of inventing a ninth slice. */
  cloudProviders: [
    {k:'AWS', brand:'aws', noun:'account', idHint:'Twelve digits, from the billing console', services:[
      {k:'EC2 — compute',              line:'Compute'},
      {k:'ECS / Fargate',              line:'Compute'},
      {k:'Lambda',                     line:'Serverless'},
      {k:'Step Functions',             line:'Serverless'},
      {k:'S3',                         line:'Storage'},
      {k:'EBS volumes',                line:'Storage'},
      {k:'RDS',                        line:'Database'},
      {k:'Aurora',                     line:'Database'},
      {k:'DynamoDB',                   line:'Database'},
      {k:'ElastiCache',                line:'Database'},
      {k:'Redshift',                   line:'Database'},
      {k:'EKS',                        line:'Kubernetes'},
      {k:'CloudFront',                 line:'Networking'},
      {k:'VPC / NAT gateways',         line:'Networking'},
      {k:'Route 53',                   line:'Networking'},
      {k:'Bedrock',                    line:'AI services'},
      {k:'SageMaker',                  line:'AI services'},
      {k:'CloudWatch',                 line:'Monitoring'}
    ]},
    {k:'Microsoft Azure', brand:'azure', noun:'subscription', idHint:'The GUID, not the display name', services:[
      {k:'Virtual Machines',           line:'Compute'},
      {k:'App Service',                line:'Compute'},
      {k:'Azure Functions',            line:'Serverless'},
      {k:'Blob Storage',               line:'Storage'},
      {k:'Managed Disks',              line:'Storage'},
      {k:'Azure SQL Database',         line:'Database'},
      {k:'Cosmos DB',                  line:'Database'},
      {k:'Cache for Redis',            line:'Database'},
      {k:'Synapse Analytics',          line:'Database'},
      {k:'Azure Kubernetes Service',   line:'Kubernetes'},
      {k:'Front Door / CDN',           line:'Networking'},
      {k:'Virtual Network gateways',   line:'Networking'},
      {k:'Azure OpenAI Service',       line:'AI services'},
      {k:'Azure Machine Learning',     line:'AI services'},
      {k:'Azure Monitor',              line:'Monitoring'}
    ]},
    {k:'Google Cloud', brand:'googlecloud', noun:'project', idHint:'The project ID, not the project number', services:[
      {k:'Compute Engine',             line:'Compute'},
      {k:'Cloud Run',                  line:'Serverless'},
      {k:'Cloud Functions',            line:'Serverless'},
      {k:'Cloud Storage',              line:'Storage'},
      {k:'Persistent Disk',            line:'Storage'},
      {k:'Cloud SQL',                  line:'Database'},
      {k:'Spanner',                    line:'Database'},
      {k:'Firestore',                  line:'Database'},
      {k:'BigQuery',                   line:'Database'},
      {k:'Memorystore',                line:'Database'},
      {k:'Google Kubernetes Engine',   line:'Kubernetes'},
      {k:'Cloud CDN',                  line:'Networking'},
      {k:'Cloud Load Balancing',       line:'Networking'},
      {k:'Vertex AI',                  line:'AI services'},
      {k:'Cloud Logging / Monitoring', line:'Monitoring'}
    ]}
  ],

  /* ---- vendors -----------------------------------------------------------
     Seeded from the 17 marks in brands.js and from every vendor the four
     scenarios name, then extended with the software an estate this size
     genuinely runs.  `cat` uses the same vocabulary as `saas[].cat`, so the
     picked category is one the SaaS screen already groups by.
     The unbranded half of this list is not padding: `meta.vendors` is 34 while
     `vendors[]` holds ten, so the tail a user would actually be adding from is
     exactly the part with no artwork. */
  vendors: [
    {k:'Microsoft',           brand:'microsoft',   cat:'Productivity'},
    {k:'Amazon Web Services', brand:'aws',         cat:'Developer'},
    {k:'Google Cloud',        brand:'googlecloud', cat:'Developer'},
    {k:'Google',              brand:'google',      cat:'Productivity'},
    {k:'OpenAI',              brand:'openai',      cat:'AI'},
    {k:'Anthropic',           brand:'anthropic',   cat:'AI'},
    {k:'Perplexity',          brand:'perplexity',  cat:'AI'},
    {k:'GitHub',              brand:'github',      cat:'Developer'},
    {k:'Atlassian',           brand:'atlassian',   cat:'ITSM'},
    {k:'Grafana Labs',        brand:'grafana',     cat:'Observability'},
    {k:'Figma',               brand:'figma',       cat:'Design'},
    {k:'Miro',                brand:'miro',        cat:'Whiteboard'},
    {k:'Lucid',               brand:'lucid',       cat:'Whiteboard'},
    {k:'AgileBits',           brand:'onepassword', cat:'Security'},
    {k:'Zoom',                brand:'zoom',        cat:'Comms'},
    {k:'Snowflake',           brand:'snowflake',   cat:'Analytics'},
    /* No official mark exists for these — they render as initials orbs. */
    {k:'Datadog',             brand:null,          cat:'Observability'},
    {k:'Elastic',             brand:null,          cat:'Observability'},
    {k:'Sentry',              brand:null,          cat:'Observability'},
    {k:'PagerDuty',           brand:null,          cat:'ITSM'},
    {k:'ServiceNow',          brand:null,          cat:'ITSM'},
    {k:'Slack',               brand:null,          cat:'Comms'},
    {k:'Twilio',              brand:null,          cat:'Comms'},
    {k:'Notion',              brand:null,          cat:'Productivity'},
    {k:'Asana',               brand:null,          cat:'Productivity'},
    {k:'Salesforce',          brand:null,          cat:'Productivity'},
    {k:'Workday',             brand:null,          cat:'Productivity'},
    {k:'DocuSign',            brand:null,          cat:'Productivity'},
    {k:'Linear',              brand:null,          cat:'Developer'},
    {k:'JetBrains',           brand:null,          cat:'Developer'},
    {k:'Postman',             brand:null,          cat:'Developer'},
    {k:'HashiCorp',           brand:null,          cat:'Developer'},
    {k:'Vercel',              brand:null,          cat:'Developer'},
    {k:'Cloudflare',          brand:null,          cat:'Developer'},
    {k:'Docker',              brand:null,          cat:'Developer'},
    {k:'Snyk',                brand:null,          cat:'Security'},
    {k:'CrowdStrike',         brand:null,          cat:'Security'},
    {k:'Okta',                brand:null,          cat:'Security'},
    {k:'Zscaler',             brand:null,          cat:'Security'},
    {k:'Databricks',          brand:null,          cat:'Analytics'},
    {k:'Stripe',              brand:null,          cat:'Analytics'}
  ],

  /* ---- the classification vocabularies ---------------------------------
     Each of these is lifted verbatim from the shipped datasets rather than
     written fresh, so a staged row sorts into an existing group instead of
     opening a new one with a count of 1. */

  /* saas[].cat */
  appCategories: ['Productivity','Developer','ITSM','Observability','AI','Analytics',
                  'Device mgmt','Design','Whiteboard','Security','Comms'],

  /* categories[].k — the eight the ledger reconciles against */
  costCategories: ['Cloud infrastructure','SaaS & licences','AI & LLM','Security',
                   'Observability','ITSM','Device management','Other technology'],

  /* cloud.services[].k — the eight lines a cloud service rolls up into */
  serviceLines: ['Compute','Database','Storage','Kubernetes','Networking',
                 'AI services','Serverless','Monitoring'],

  /* cloud.envs[].k */
  environments: ['Production','Development','Testing','Staging','Sandbox'],

  /* depts[].k, less "Unallocated" — that row is the ABSENCE of a cost centre,
     so offering it as one to charge a new record to would be a contradiction. */
  costCentres: ['Engineering','Product','Security / IT','Sales','Operations',
                'Marketing','Finance','HR'],

  /* products[].k — what a subscription or a service can be charged to. */
  products: ['Product Alpha','Product Beta','Product Gamma','Product Delta','Shared services'],

  /* The people who already own rows in the datasets.  A record with no owner is
     how spend becomes unallocated, so this field is required on every type. */
  owners: ['R. Kadavan','S. Menon','N. Rao','G. Prasad','I. Sheikh','L. Kumar','A. Iyer'],

  /* How the thing is bought.  Commitment terms sit beside subscription terms
     because both answer the same procurement question — what are we locked
     into, and until when. */
  terms: ['Monthly · rolling','Annual · paid up front','Annual · paid monthly',
          '2-year term','3-year term','Consumption · pay as you go',
          '1-year committed use','3-year committed use','1-year reserved',
          '3-year reserved','Savings plan · 1 year','Enterprise agreement'],

  /* What the meter actually counts.  This is the field that decides whether an
     AI row belongs in `ai.sub` or `ai.api`, and whether utilisation means seats
     used or capacity used. */
  billing: ['Per seat · monthly','Per seat · annual','Per token or request',
            'Per GB ingested','Per hour','Flat platform fee'],

  /* vendors[].risk */
  risk: ['Low','Medium','High']
};
