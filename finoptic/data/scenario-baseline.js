FINOPTIC.scenario(
{
  "id": "baseline",
  "label": "Baseline — 8% over budget",
  "blurb": "Northwind Systems, 50 people: technology spend is <b>$1.62M</b> year to date against a <b>$1.50M</b> plan — <b>8%</b> over, with <b>$214K</b> of identified savings not yet taken.",
  "tone": "warn",
  "meta": {
    "asOf": "28 Jul 2026",
    "fy": "FY26",
    "months": [
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul"
    ],
    "closed": 11,
    "employees": 50,
    "customers": 148,
    "vendors": 34,
    "transactions": 42.6,
    "apiRequests": 214,
    "company": "Northwind Systems",
    "revenue": 6150,
    "unexpected": 16,
    "forecastAcc": 94.2,
    "committed": 1124
  },
  "ytdActual": 1620,
  "ytdBudget": 1500,
  "fyBudget": 1640,
  "fyForecast": 1780,
  "identified": 214,
  "realized": 96,
  "unallocated": 87,
  "trend": {
    "actual": [
      128,
      134,
      141,
      147,
      139,
      152,
      146,
      158,
      151,
      162,
      162,
      null
    ],
    "budget": [
      128,
      130,
      132,
      134,
      136,
      138,
      140,
      142,
      142,
      138,
      140,
      140
    ],
    "forecast": [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      162,
      160
    ]
  },
  "monthly": {
    "realized": [
      8,
      8,
      9,
      9,
      9,
      9,
      8,
      10,
      9,
      9,
      8,
      null
    ],
    "revenue": [
      474,
      483,
      565,
      551,
      525,
      610,
      530,
      584,
      568,
      656,
      604,
      null
    ],
    "anomalyImpact": [
      1,
      1,
      1,
      1,
      1,
      2,
      1,
      2,
      1,
      2,
      3,
      null
    ],
    "security": [
      16,
      17,
      18,
      17,
      16,
      18,
      17,
      20,
      18,
      20,
      20,
      null
    ],
    "ingestGB": [
      150,
      158,
      167,
      161,
      150,
      178,
      157,
      175,
      168,
      193,
      183,
      null
    ],
    "forecastAcc": [
      84.2,
      86.5,
      86.9,
      87.1,
      89.3,
      89.6,
      91.2,
      91.6,
      93.1,
      92.8,
      94.2,
      null
    ],
    "committed": [
      938,
      957,
      964,
      996,
      1009,
      1030,
      1055,
      1061,
      1094,
      1115,
      1124,
      null
    ],
    "licences": [
      461,
      465,
      472,
      475,
      484,
      489,
      501,
      508,
      517,
      519,
      527,
      null
    ],
    "licencesActive": [
      342,
      344,
      349,
      357,
      359,
      361,
      371,
      369,
      375,
      384,
      385,
      null
    ],
    "contractValue": [
      1250,
      1276,
      1304,
      1332,
      1362,
      1375,
      1391,
      1428,
      1432,
      1483,
      1492,
      null
    ],
    "aiSavings": [
      13,
      18,
      23,
      28,
      33,
      38,
      43,
      48,
      54,
      58,
      63,
      null
    ]
  },
  "categories": [
    {
      "k": "Cloud infrastructure",
      "v": 645,
      "g": "--c1",
      "m": [
        51,
        54,
        56,
        59,
        54,
        61,
        56,
        62,
        59,
        66,
        67,
        null
      ]
    },
    {
      "k": "SaaS & licences",
      "v": 291,
      "g": "--c2",
      "m": [
        25,
        25,
        27,
        27,
        27,
        27,
        28,
        28,
        28,
        25,
        24,
        null
      ]
    },
    {
      "k": "AI & LLM",
      "v": 218,
      "g": "--c3",
      "m": [
        13,
        14,
        15,
        17,
        16,
        19,
        18,
        21,
        20,
        32,
        33,
        null
      ]
    },
    {
      "k": "Security",
      "v": 197,
      "g": "--c4",
      "m": [
        17,
        17,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        17,
        16,
        null
      ]
    },
    {
      "k": "Observability",
      "v": 99,
      "g": "--c5",
      "m": [
        8,
        9,
        9,
        9,
        9,
        10,
        9,
        11,
        9,
        8,
        8,
        null
      ]
    },
    {
      "k": "Other technology",
      "v": 66,
      "g": "--c6",
      "m": [
        5,
        6,
        7,
        8,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        null
      ]
    },
    {
      "k": "ITSM",
      "v": 57,
      "g": "--c7",
      "m": [
        5,
        5,
        5,
        5,
        5,
        6,
        5,
        6,
        5,
        5,
        5,
        null
      ]
    },
    {
      "k": "Device management",
      "v": 47,
      "g": "--c8",
      "m": [
        4,
        4,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        4,
        4,
        null
      ]
    }
  ],
  "cloud": {
    "total": 645,
    "providers": [
      {
        "k": "AWS",
        "v": 297,
        "m": [
          24,
          25,
          26,
          27,
          25,
          28,
          26,
          29,
          27,
          30,
          30,
          null
        ]
      },
      {
        "k": "Microsoft Azure",
        "v": 230,
        "m": [
          18,
          19,
          20,
          21,
          19,
          22,
          20,
          22,
          21,
          24,
          24,
          null
        ]
      },
      {
        "k": "Google Cloud",
        "v": 118,
        "m": [
          9,
          10,
          10,
          11,
          10,
          11,
          10,
          11,
          11,
          12,
          13,
          null
        ]
      }
    ],
    "services": [
      {
        "k": "Compute",
        "v": 214
      },
      {
        "k": "Database",
        "v": 121
      },
      {
        "k": "Storage",
        "v": 88
      },
      {
        "k": "Kubernetes",
        "v": 79
      },
      {
        "k": "Networking",
        "v": 54
      },
      {
        "k": "AI services",
        "v": 33
      },
      {
        "k": "Serverless",
        "v": 31
      },
      {
        "k": "Monitoring",
        "v": 25
      }
    ],
    "envs": [
      {
        "k": "Production",
        "v": 402
      },
      {
        "k": "Development",
        "v": 118
      },
      {
        "k": "Testing",
        "v": 61
      },
      {
        "k": "Staging",
        "v": 42
      },
      {
        "k": "Sandbox",
        "v": 22
      }
    ],
    "coverage": 58,
    "coverageTarget": 85
  },
  "ai": {
    "total": 218,
    "sub": 134,
    "api": 84,
    "providers": [
      {
        "k": "OpenAI",
        "v": 64,
        "sub": 38,
        "api": 26
      },
      {
        "k": "Anthropic",
        "v": 43,
        "sub": 22,
        "api": 21
      },
      {
        "k": "Microsoft 365 Copilot",
        "v": 39,
        "sub": 39,
        "api": 0
      },
      {
        "k": "Azure OpenAI",
        "v": 32,
        "sub": 0,
        "api": 32
      },
      {
        "k": "Google Gemini",
        "v": 20,
        "sub": 15,
        "api": 5
      },
      {
        "k": "Perplexity",
        "v": 12,
        "sub": 12,
        "api": 0
      },
      {
        "k": "GitHub Copilot",
        "v": 8,
        "sub": 8,
        "api": 0
      }
    ],
    "tokens": {
      "input": 1420,
      "output": 214,
      "cached": 486,
      "requests": 6.2,
      "avgPerReq": 264,
      "per1M": 51.4,
      "perReq": 0.0135
    },
    "byProduct": [
      {
        "k": "Product Alpha",
        "v": 61
      },
      {
        "k": "Product Beta",
        "v": 54
      },
      {
        "k": "Product Gamma",
        "v": 38
      },
      {
        "k": "Product Delta",
        "v": 19
      },
      {
        "k": "Internal productivity",
        "v": 46
      }
    ],
    "models": [
      {
        "m": "GPT-4.1 (Azure)",
        "p": "Azure OpenAI",
        "req": "1.62M",
        "tok": "380M",
        "cost": 26,
        "avg": 0.016,
        "use": "Gamma classification pipeline"
      },
      {
        "m": "GPT-5",
        "p": "OpenAI",
        "req": "0.71M",
        "tok": "270M",
        "cost": 26,
        "avg": 0.0366,
        "use": "Alpha reasoning agent"
      },
      {
        "m": "Claude Sonnet 4.6",
        "p": "Anthropic",
        "req": "2.41M",
        "tok": "560M",
        "cost": 12,
        "avg": 0.005,
        "use": "Beta document extraction"
      },
      {
        "m": "Claude Opus 4.5",
        "p": "Anthropic",
        "req": "0.14M",
        "tok": "90M",
        "cost": 6,
        "avg": 0.0429,
        "use": "Escalated support triage"
      },
      {
        "m": "GPT-5 mini",
        "p": "Azure OpenAI",
        "req": "0.13M",
        "tok": "44M",
        "cost": 6,
        "avg": 0.0462,
        "use": "Internal ops automation"
      },
      {
        "m": "Gemini 2.5 Pro",
        "p": "Google",
        "req": "0.31M",
        "tok": "160M",
        "cost": 5,
        "avg": 0.0161,
        "use": "Delta multimodal prototype"
      },
      {
        "m": "Claude Haiku 4.5",
        "p": "Anthropic",
        "req": "0.88M",
        "tok": "130M",
        "cost": 3,
        "avg": 0.0034,
        "use": "Log summarisation"
      }
    ],
    "m": [
      13,
      14,
      15,
      17,
      16,
      19,
      18,
      21,
      20,
      32,
      33,
      null
    ]
  },
  "security": [
    {
      "k": "Microsoft Sentinel",
      "v": 78
    },
    {
      "k": "Defender / endpoint",
      "v": 41
    },
    {
      "k": "Microsoft Purview",
      "v": 34
    },
    {
      "k": "Entra ID P2",
      "v": 26
    },
    {
      "k": "DLP add-ons",
      "v": 18
    }
  ],
  "secMeta": {
    "ingestGB": 1840,
    "perGB": 42.4,
    "licUtil": 88,
    "ingestDelta": 38,
    "sources": [
      {
        "src": "Application container logs",
        "prod": "Product Beta",
        "gb": 1080,
        "cost": 4.2,
        "delta": 62,
        "verdict": "Debug logging left on in the Beta payment service since 14 Jun",
        "flag": true
      },
      {
        "src": "Entra ID sign-in logs",
        "prod": "Shared services",
        "gb": 268,
        "cost": 1,
        "delta": 4,
        "verdict": "Required for audit"
      },
      {
        "src": "Azure activity log",
        "prod": "Product Alpha",
        "gb": 196,
        "cost": 0.8,
        "delta": 6,
        "verdict": "Normal growth"
      },
      {
        "src": "Firewall and WAF",
        "prod": "Shared services",
        "gb": 148,
        "cost": 0.6,
        "delta": 3,
        "verdict": "Required"
      },
      {
        "src": "Defender endpoint events",
        "prod": "Shared services",
        "gb": 92,
        "cost": 0.3,
        "delta": 2,
        "verdict": "Required for audit"
      },
      {
        "src": "Kubernetes audit log",
        "prod": "Product Gamma",
        "gb": 56,
        "cost": 0.2,
        "delta": 5,
        "verdict": "Normal growth"
      }
    ]
  },
  "obs": [
    {
      "k": "Logs",
      "v": 44
    },
    {
      "k": "Metrics",
      "v": 29
    },
    {
      "k": "Traces",
      "v": 17
    },
    {
      "k": "Retention & storage",
      "v": 9
    }
  ],
  "obsMeta": {
    "logGB": 2410,
    "metricSeries": "4.8M",
    "traceSpans": "1.2B",
    "perGB": 18.3
  },
  "obsByProduct": [
    {
      "k": "Product Alpha",
      "v": 26,
      "share": 26,
      "traffic": 38
    },
    {
      "k": "Product Beta",
      "v": 24,
      "share": 24,
      "traffic": 29
    },
    {
      "k": "Product Gamma",
      "v": 31,
      "share": 31,
      "traffic": 12
    },
    {
      "k": "Product Delta",
      "v": 8,
      "share": 8,
      "traffic": 6
    },
    {
      "k": "Shared platform",
      "v": 10,
      "share": 11,
      "traffic": 15
    }
  ],
  "itsm": {
    "total": 57,
    "tickets": 3180,
    "incidents": 412,
    "changes": 286,
    "perTicket": 17.9,
    "perIncident": 64,
    "perChange": 41,
    "volume": [
      268,
      272,
      281,
      296,
      254,
      312,
      289,
      318,
      301,
      294,
      295,
      null
    ],
    "byProduct": [
      {
        "k": "Product Alpha",
        "t": 1104,
        "inc": 34,
        "cost": 8.4
      },
      {
        "k": "Product Beta",
        "t": 892,
        "inc": 118,
        "cost": 6.9
      },
      {
        "k": "Product Gamma",
        "t": 641,
        "inc": 96,
        "cost": 4.8
      },
      {
        "k": "Product Delta",
        "t": 288,
        "inc": 41,
        "cost": 2.1
      },
      {
        "k": "Internal IT",
        "t": 255,
        "inc": 123,
        "cost": 1.9
      }
    ]
  },
  "products": [
    {
      "k": "Product Alpha",
      "v": 468,
      "rev": 3100,
      "cloud": 241,
      "ai": 61,
      "saas": 88,
      "other": 78,
      "sec": 36,
      "shared": 42,
      "bu": "Engineering",
      "cust": 74,
      "budget": 430,
      "m": [
        34,
        36,
        39,
        42,
        38,
        44,
        42,
        46,
        44,
        50,
        53,
        null
      ]
    },
    {
      "k": "Product Beta",
      "v": 351,
      "rev": 1850,
      "cloud": 186,
      "ai": 54,
      "saas": 61,
      "other": 50,
      "sec": 21,
      "shared": 29,
      "bu": "Engineering",
      "cust": 42,
      "budget": 344,
      "m": [
        29,
        30,
        31,
        32,
        31,
        33,
        32,
        33,
        33,
        34,
        33,
        null
      ]
    },
    {
      "k": "Product Gamma",
      "v": 289,
      "rev": 920,
      "cloud": 142,
      "ai": 38,
      "saas": 54,
      "other": 55,
      "sec": 20,
      "shared": 35,
      "bu": "Product",
      "cust": 24,
      "budget": 262,
      "m": [
        24,
        25,
        26,
        26,
        25,
        27,
        26,
        28,
        27,
        28,
        27,
        null
      ]
    },
    {
      "k": "Product Delta",
      "v": 176,
      "rev": 280,
      "cloud": 76,
      "ai": 19,
      "saas": 41,
      "other": 40,
      "sec": 15,
      "shared": 25,
      "bu": "Product",
      "cust": 8,
      "budget": 198,
      "m": [
        14,
        15,
        15,
        16,
        15,
        17,
        16,
        18,
        16,
        17,
        17,
        null
      ]
    },
    {
      "k": "Shared services",
      "v": 336,
      "rev": 0,
      "cloud": 0,
      "ai": 46,
      "saas": 47,
      "other": 243,
      "sec": 66,
      "shared": 177,
      "bu": "Security / IT",
      "cust": 0,
      "budget": 266,
      "m": [
        27,
        28,
        30,
        31,
        30,
        31,
        30,
        33,
        31,
        33,
        32,
        null
      ]
    }
  ],
  "depts": [
    {
      "k": "Engineering",
      "v": 812,
      "budget": 760
    },
    {
      "k": "Product",
      "v": 214,
      "budget": 205
    },
    {
      "k": "Security / IT",
      "v": 248,
      "budget": 230
    },
    {
      "k": "Sales",
      "v": 96,
      "budget": 104
    },
    {
      "k": "Operations",
      "v": 72,
      "budget": 70
    },
    {
      "k": "Marketing",
      "v": 58,
      "budget": 62
    },
    {
      "k": "Finance",
      "v": 31,
      "budget": 34
    },
    {
      "k": "HR",
      "v": 22,
      "budget": 24
    },
    {
      "k": "Unallocated",
      "v": 67,
      "budget": 11
    }
  ],
  "vendors": [
    {
      "k": "Microsoft",
      "brand": "microsoft",
      "cat": "Cloud · Productivity · Security",
      "v": 575,
      "contract": 640,
      "start": "01 Sep 2024",
      "renew": "28 Sep 2026",
      "util": 84,
      "owner": "Rohit",
      "risk": "Medium"
    },
    {
      "k": "Amazon Web Services",
      "brand": "aws",
      "cat": "Cloud infrastructure",
      "v": 297,
      "contract": 340,
      "start": "01 Apr 2025",
      "renew": "31 Mar 2027",
      "util": 91,
      "owner": "Sujeev",
      "risk": "Low"
    },
    {
      "k": "Google Cloud",
      "brand": "googlecloud",
      "cat": "Cloud infrastructure",
      "v": 118,
      "contract": 130,
      "start": "01 Jan 2026",
      "renew": "31 Dec 2026",
      "util": 78,
      "owner": "Sujeev",
      "risk": "Low"
    },
    {
      "k": "Grafana Labs",
      "brand": "grafana",
      "cat": "Observability",
      "v": 99,
      "contract": 110,
      "start": "25 Aug 2025",
      "renew": "25 Aug 2026",
      "util": 72,
      "owner": "Nidhish",
      "risk": "High"
    },
    {
      "k": "OpenAI",
      "brand": "openai",
      "cat": "AI / LLM",
      "v": 64,
      "contract": 72,
      "start": "01 Feb 2026",
      "renew": "31 Jan 2027",
      "util": 81,
      "owner": "Kezia",
      "risk": "Medium"
    },
    {
      "k": "Atlassian",
      "brand": "atlassian",
      "cat": "ITSM · Collaboration",
      "v": 57,
      "contract": 64,
      "start": "01 Nov 2025",
      "renew": "31 Oct 2026",
      "util": 69,
      "owner": "Irfan",
      "risk": "Medium"
    },
    {
      "k": "GitHub",
      "brand": "github",
      "cat": "Developer platform",
      "v": 47,
      "contract": 52,
      "start": "01 Jun 2026",
      "renew": "31 May 2027",
      "util": 76,
      "owner": "Sujeev",
      "risk": "Low"
    },
    {
      "k": "Anthropic",
      "brand": "anthropic",
      "cat": "AI / LLM",
      "v": 43,
      "contract": 56,
      "start": "15 Mar 2026",
      "renew": "14 Mar 2027",
      "util": 54,
      "owner": "Kezia",
      "risk": "High"
    },
    {
      "k": "Figma",
      "brand": "figma",
      "cat": "Design",
      "v": 14,
      "contract": 16,
      "start": "01 Oct 2025",
      "renew": "30 Sep 2026",
      "util": 88,
      "owner": "Daniel",
      "risk": "Low"
    },
    {
      "k": "Perplexity",
      "brand": "perplexity",
      "cat": "AI / LLM",
      "v": 12,
      "contract": 12,
      "start": "01 May 2026",
      "renew": "30 Apr 2027",
      "util": 47,
      "owner": "Kezia",
      "risk": "Medium"
    }
  ],
  "saas": [
    {
      "app": "Microsoft 365 E5",
      "vendor": "Microsoft",
      "brand": "microsoft",
      "cat": "Productivity",
      "lic": 52,
      "active": 40,
      "cost": 11.4,
      "renew": "28 Sep 2026",
      "owner": "Rohit"
    },
    {
      "app": "GitHub Enterprise",
      "vendor": "GitHub",
      "brand": "github",
      "cat": "Developer",
      "lic": 38,
      "active": 29,
      "cost": 3.9,
      "renew": "31 May 2027",
      "owner": "Sujeev"
    },
    {
      "app": "Jira + Confluence",
      "vendor": "Atlassian",
      "brand": "atlassian",
      "cat": "ITSM",
      "lic": 50,
      "active": 44,
      "cost": 3.4,
      "renew": "31 Oct 2026",
      "owner": "Irfan"
    },
    {
      "app": "Grafana Cloud Pro",
      "vendor": "Grafana Labs",
      "brand": "grafana",
      "cat": "Observability",
      "lic": 24,
      "active": 17,
      "cost": 8.3,
      "renew": "25 Aug 2026",
      "owner": "Nidhish"
    },
    {
      "app": "ChatGPT Business",
      "vendor": "OpenAI",
      "brand": "openai",
      "cat": "AI",
      "lic": 42,
      "active": 34,
      "cost": 3.2,
      "renew": "31 Jan 2027",
      "owner": "Kezia"
    },
    {
      "app": "Claude Enterprise",
      "vendor": "Anthropic",
      "brand": "anthropic",
      "cat": "AI",
      "lic": 35,
      "active": 19,
      "cost": 1.9,
      "renew": "14 Mar 2027",
      "owner": "Kezia"
    },
    {
      "app": "Microsoft 365 Copilot",
      "vendor": "Microsoft",
      "brand": "microsoft",
      "cat": "AI",
      "lic": 44,
      "active": 37,
      "cost": 3.3,
      "renew": "28 Sep 2026",
      "owner": "Rohit"
    },
    {
      "app": "Gemini Advanced",
      "vendor": "Google",
      "brand": "google",
      "cat": "AI",
      "lic": 26,
      "active": 12,
      "cost": 1.3,
      "renew": "31 Dec 2026",
      "owner": "Kezia"
    },
    {
      "app": "Perplexity Enterprise",
      "vendor": "Perplexity",
      "brand": "perplexity",
      "cat": "AI",
      "lic": 22,
      "active": 10,
      "cost": 1,
      "renew": "30 Apr 2027",
      "owner": "Kezia"
    },
    {
      "app": "Power BI Premium",
      "vendor": "Microsoft",
      "brand": "microsoft",
      "cat": "Analytics",
      "lic": 12,
      "active": 7,
      "cost": 2.8,
      "renew": "28 Sep 2026",
      "owner": "Erin"
    },
    {
      "app": "Intune + Autopilot",
      "vendor": "Microsoft",
      "brand": "microsoft",
      "cat": "Device mgmt",
      "lic": 50,
      "active": 50,
      "cost": 1.8,
      "renew": "28 Sep 2026",
      "owner": "Rohit"
    },
    {
      "app": "Figma Organisation",
      "vendor": "Figma",
      "brand": "figma",
      "cat": "Design",
      "lic": 14,
      "active": 12,
      "cost": 1.3,
      "renew": "30 Sep 2026",
      "owner": "Daniel"
    },
    {
      "app": "Miro Business",
      "vendor": "Miro",
      "brand": "miro",
      "cat": "Whiteboard",
      "lic": 30,
      "active": 11,
      "cost": 0.6,
      "renew": "12 Nov 2026",
      "owner": "Daniel"
    },
    {
      "app": "Lucidchart Team",
      "vendor": "Lucid",
      "brand": "lucid",
      "cat": "Whiteboard",
      "lic": 18,
      "active": 6,
      "cost": 0.4,
      "renew": "03 Feb 2027",
      "owner": "Irfan"
    },
    {
      "app": "1Password Business",
      "vendor": "AgileBits",
      "brand": "onepassword",
      "cat": "Security",
      "lic": 50,
      "active": 48,
      "cost": 0.4,
      "renew": "19 Jan 2027",
      "owner": "Rohit"
    },
    {
      "app": "Zoom Business",
      "vendor": "Zoom",
      "brand": "zoom",
      "cat": "Comms",
      "lic": 20,
      "active": 9,
      "cost": 0.5,
      "renew": "07 Dec 2026",
      "owner": "Irfan"
    }
  ],
  "opps": [
    {
      "o": "Terminate 3 idle EC2 instances — Alpha production",
      "cat": "Cloud",
      "spend": 65,
      "s": 34,
      "eff": "Low",
      "conf": "High",
      "owner": "Sujeev",
      "st": "Approved",
      "due": "12 Aug 2026"
    },
    {
      "o": "Consolidate overlapping GenAI seats (18 employees on 3+ tools)",
      "cat": "AI",
      "spend": 99,
      "s": 28,
      "eff": "Medium",
      "conf": "High",
      "owner": "Kezia",
      "st": "Under review",
      "due": "30 Aug 2026"
    },
    {
      "o": "Rightsize 11 oversized Azure VMs — Beta",
      "cat": "Cloud",
      "spend": 54,
      "s": 21,
      "eff": "Medium",
      "conf": "High",
      "owner": "Sujeev",
      "st": "In progress",
      "due": "21 Aug 2026"
    },
    {
      "o": "Raise AWS Savings Plan coverage from 58% to 85%",
      "cat": "Cloud",
      "spend": 28,
      "s": 15,
      "eff": "Low",
      "conf": "High",
      "owner": "Erin",
      "st": "Approved",
      "due": "05 Aug 2026"
    },
    {
      "o": "Renegotiate Microsoft EA volume tier at renewal",
      "cat": "Contract",
      "spend": 150,
      "s": 15,
      "eff": "High",
      "conf": "Medium",
      "owner": "Rohit",
      "st": "In progress",
      "due": "28 Sep 2026"
    },
    {
      "o": "Reclaim 12 inactive Microsoft 365 E5 seats",
      "cat": "SaaS",
      "spend": 26,
      "s": 14,
      "eff": "Low",
      "conf": "High",
      "owner": "Rohit",
      "st": "Identified",
      "due": "15 Aug 2026"
    },
    {
      "o": "Reduce Claude Enterprise by 12 seats (54% utilised)",
      "cat": "Licence",
      "spend": 21,
      "s": 13,
      "eff": "Low",
      "conf": "Medium",
      "owner": "Kezia",
      "st": "Under review",
      "due": "14 Sep 2026"
    },
    {
      "o": "Drop high-cardinality labels on Gamma metrics",
      "cat": "Observability",
      "spend": 35,
      "s": 12,
      "eff": "Medium",
      "conf": "High",
      "owner": "Nidhish",
      "st": "In progress",
      "due": "18 Aug 2026"
    },
    {
      "o": "Retire duplicate diagramming tools (Miro + Lucidchart)",
      "cat": "SaaS",
      "spend": 19,
      "s": 11,
      "eff": "Low",
      "conf": "High",
      "owner": "Daniel",
      "st": "Identified",
      "due": "12 Nov 2026"
    },
    {
      "o": "Downgrade Power BI Premium capacity",
      "cat": "SaaS",
      "spend": 15,
      "s": 9,
      "eff": "Low",
      "conf": "Medium",
      "owner": "Erin",
      "st": "Identified",
      "due": "01 Sep 2026"
    },
    {
      "o": "Move GitHub Enterprise to Team for 9 non-dev users",
      "cat": "Licence",
      "spend": 18,
      "s": 9,
      "eff": "Low",
      "conf": "High",
      "owner": "Sujeev",
      "st": "Approved",
      "due": "26 Aug 2026"
    },
    {
      "o": "Route Gamma classification to a smaller model",
      "cat": "AI",
      "spend": 35,
      "s": 9,
      "eff": "Medium",
      "conf": "Medium",
      "owner": "Nidhish",
      "st": "Under review",
      "due": "09 Sep 2026"
    },
    {
      "o": "Delete unattached disks and stale snapshots",
      "cat": "Cloud",
      "spend": 14,
      "s": 8,
      "eff": "Low",
      "conf": "High",
      "owner": "Sujeev",
      "st": "In progress",
      "due": "04 Aug 2026"
    },
    {
      "o": "Move Atlassian to a two-year commitment",
      "cat": "Contract",
      "spend": 21,
      "s": 6,
      "eff": "Medium",
      "conf": "Medium",
      "owner": "Irfan",
      "st": "Identified",
      "due": "31 Oct 2026"
    },
    {
      "o": "Cut non-production log retention from 90 to 30 days",
      "cat": "Observability",
      "spend": 12,
      "s": 6,
      "eff": "Low",
      "conf": "High",
      "owner": "Nidhish",
      "st": "Approved",
      "due": "11 Aug 2026"
    },
    {
      "o": "Enable prompt caching on the Beta extraction pipeline",
      "cat": "AI",
      "spend": 16,
      "s": 4,
      "eff": "Medium",
      "conf": "High",
      "owner": "Kezia",
      "st": "Implemented",
      "due": "02 Jul 2026"
    }
  ],
  "anomalies": [
    {
      "d": "24 Jun 2026",
      "prov": "AWS",
      "prod": "Product Alpha",
      "svc": "EC2 — compute",
      "exp": 22.1,
      "act": 31.4,
      "sev": "Critical",
      "owner": "Sujeev",
      "st": "Investigating",
      "why": "Alpha compute rose 42% after three additional production instances were deployed on 18 June. All three average below 12% CPU utilisation and none carry a product tag."
    },
    {
      "d": "19 Jun 2026",
      "prov": "Azure",
      "prod": "Product Beta",
      "svc": "Azure OpenAI",
      "exp": 4.2,
      "act": 6.1,
      "sev": "High",
      "owner": "Kezia",
      "st": "Fix deployed",
      "why": "Token consumption rose 46%. A retry loop in the embedding job re-sent 214K requests without caching. Caching was enabled on 27 June."
    },
    {
      "d": "16 Jun 2026",
      "prov": "Microsoft",
      "prod": "Product Beta",
      "svc": "Sentinel ingestion",
      "exp": 6.4,
      "act": 8.8,
      "sev": "High",
      "owner": "Rohit",
      "st": "Investigating",
      "why": "Ingestion rose 38%, driven by verbose debug logging left on in Beta application containers after the 9 June release."
    },
    {
      "d": "11 Jun 2026",
      "prov": "Google Cloud",
      "prod": "Product Gamma",
      "svc": "Cloud NAT — egress",
      "exp": 1.1,
      "act": 2.4,
      "sev": "High",
      "owner": "Nidhish",
      "st": "Root cause found",
      "why": "Cross-region egress doubled after the analytics service moved to us-central1 while its data store stayed in europe-west1."
    },
    {
      "d": "05 Jun 2026",
      "prov": "Atlassian",
      "prod": "Shared services",
      "svc": "Jira licences",
      "exp": 2.8,
      "act": 3.4,
      "sev": "Medium",
      "owner": "Irfan",
      "st": "Resolved",
      "why": "14 seats were auto-provisioned by the directory sync rule when contractors were added to the engineering group."
    },
    {
      "d": "28 May 2026",
      "prov": "AWS",
      "prod": "Product Delta",
      "svc": "S3 — storage",
      "exp": 0.9,
      "act": 1.6,
      "sev": "Medium",
      "owner": "Sujeev",
      "st": "Resolved",
      "why": "Delta prototype buckets had no lifecycle policy; 14TB of intermediate build artefacts accumulated over four months."
    }
  ],
  "alerts": [
    {
      "sev": "Critical",
      "t": "AWS spend exceeded monthly forecast by 17%",
      "impact": 4.6,
      "save": 34,
      "prod": "Product Alpha",
      "owner": "Sujeev",
      "act": "Terminate 3 idle production instances"
    },
    {
      "sev": "High",
      "t": "Azure OpenAI token consumption up 46%",
      "impact": 1.9,
      "save": 9,
      "prod": "Product Beta",
      "owner": "Kezia",
      "act": "Confirm caching is live on the embedding job"
    },
    {
      "sev": "High",
      "t": "Sentinel log ingestion up 38%",
      "impact": 2.4,
      "save": 4.8,
      "prod": "Product Beta",
      "owner": "Rohit",
      "act": "Turn off debug logging in Beta containers"
    },
    {
      "sev": "High",
      "t": "Grafana Cloud renewal in 28 days at 72% utilisation",
      "impact": 0,
      "save": 12,
      "prod": "Shared services",
      "owner": "Nidhish",
      "act": "Open renewal negotiation this week"
    },
    {
      "sev": "Medium",
      "t": "12 Microsoft 365 E5 licences inactive for 45+ days",
      "impact": 1,
      "save": 14,
      "prod": "Shared services",
      "owner": "Rohit",
      "act": "Reclaim seats before the 28 Sep renewal"
    },
    {
      "sev": "Medium",
      "t": "8 employees hold ChatGPT, Claude and Gemini seats",
      "impact": 0.7,
      "save": 28,
      "prod": "Shared services",
      "owner": "Kezia",
      "act": "Assign one primary tool per role"
    },
    {
      "sev": "Low",
      "t": "3 unattached cloud disks detected",
      "impact": 0.3,
      "save": 8,
      "prod": "Product Gamma",
      "owner": "Sujeev",
      "act": "Delete after 7-day grace period"
    }
  ],
  "variance": [
    {
      "k": "YTD budget",
      "v": 1500,
      "type": "base"
    },
    {
      "k": "Cloud growth",
      "v": 64,
      "type": "up"
    },
    {
      "k": "AI adoption",
      "v": 38,
      "type": "up"
    },
    {
      "k": "Alpha launch",
      "v": 26,
      "type": "up"
    },
    {
      "k": "New SaaS",
      "v": 21,
      "type": "up"
    },
    {
      "k": "Security expansion",
      "v": 19,
      "type": "up"
    },
    {
      "k": "Unplanned infra",
      "v": 14,
      "type": "up"
    },
    {
      "k": "SaaS optimisation",
      "v": -34,
      "type": "down"
    },
    {
      "k": "Reserved capacity",
      "v": -28,
      "type": "down"
    },
    {
      "k": "YTD actual",
      "v": 1620,
      "type": "total"
    }
  ],
  "scenarios": [
    {
      "k": "Optimisation",
      "v": 1690,
      "d": "Full optimisation backlog delivered by October"
    },
    {
      "k": "Baseline",
      "v": 1780,
      "d": "Current run-rate, committed renewals only"
    },
    {
      "k": "Growth",
      "v": 1860,
      "d": "Two new products enter production; headcount 58"
    },
    {
      "k": "Aggressive growth",
      "v": 1940,
      "d": "Growth plan plus unconstrained AI experimentation"
    }
  ],
  "drivers": [
    {
      "k": "AI usage",
      "v": 22
    },
    {
      "k": "Cloud workloads",
      "v": 14
    },
    {
      "k": "Employee count",
      "v": 8
    },
    {
      "k": "SaaS optimisation",
      "v": -7
    },
    {
      "k": "Reserved capacity",
      "v": -11
    }
  ],
  "tagging": [
    {
      "k": "Product tag missing",
      "res": 62,
      "v": 41
    },
    {
      "k": "Owner tag missing",
      "res": 38,
      "v": 22
    },
    {
      "k": "Cost centre missing",
      "res": 24,
      "v": 15
    },
    {
      "k": "Environment tag missing",
      "res": 17,
      "v": 9
    }
  ],
  "savingsByCat": [
    {
      "k": "Cloud",
      "v": 78
    },
    {
      "k": "AI",
      "v": 41
    },
    {
      "k": "SaaS",
      "v": 34
    },
    {
      "k": "Licence",
      "v": 22
    },
    {
      "k": "Contract",
      "v": 21
    },
    {
      "k": "Observability",
      "v": 18
    }
  ],
  "sources": [
    [
      "AWS Cost & Usage Report",
      "Cloud",
      "Daily",
      "Healthy"
    ],
    [
      "Azure Cost Management",
      "Cloud",
      "Daily",
      "Healthy"
    ],
    [
      "Google Cloud Billing",
      "Cloud",
      "Daily",
      "Healthy"
    ],
    [
      "Microsoft 365 admin",
      "SaaS",
      "Daily",
      "Healthy"
    ],
    [
      "Microsoft Purview",
      "Security",
      "Hourly",
      "Healthy"
    ],
    [
      "Microsoft Sentinel",
      "Security",
      "Hourly",
      "Healthy"
    ],
    [
      "AI provider APIs",
      "AI",
      "Daily",
      "1 degraded"
    ],
    [
      "Jira",
      "ITSM",
      "Hourly",
      "Healthy"
    ],
    [
      "Grafana Cloud",
      "Observability",
      "Hourly",
      "Healthy"
    ],
    [
      "SaaS vendor portals",
      "SaaS",
      "Monthly",
      "3 manual"
    ],
    [
      "HR directory",
      "People",
      "Daily",
      "Healthy"
    ],
    [
      "Finance / ERP",
      "Finance",
      "Monthly",
      "Healthy"
    ]
  ],
  "resources": {
    "path": [
      "Total technology",
      "Cloud",
      "AWS",
      "Product Alpha",
      "Production",
      "Compute",
      "EC2"
    ],
    "unit": "EC2 instance family",
    "rows": [
      {
        "family": "r6i.4xlarge",
        "count": 3,
        "cpu": 11,
        "prev": 2.1,
        "cur": 3.9,
        "verdict": "Terminate — idle since 18 Jun",
        "flag": true
      },
      {
        "family": "m6i.2xlarge",
        "count": 8,
        "cpu": 58,
        "prev": 2.4,
        "cur": 2.5,
        "verdict": "Healthy"
      },
      {
        "family": "c6i.4xlarge",
        "count": 4,
        "cpu": 44,
        "prev": 1.9,
        "cur": 2,
        "verdict": "Move to a 1-year commitment"
      },
      {
        "family": "m6i.large",
        "count": 16,
        "cpu": 31,
        "prev": 1.1,
        "cur": 1.2,
        "verdict": "Rightsize to m7i.large"
      },
      {
        "family": "t3.medium",
        "count": 12,
        "cpu": 24,
        "prev": 0.4,
        "cur": 0.4,
        "verdict": "Healthy"
      }
    ]
  },
  "resource": {
    "name": "alpha-prod-api-07",
    "id": "i-0a94c3f2e81bd7c40",
    "owner": "Sujeev",
    "product": "Product Alpha",
    "env": "Production",
    "cc": "ENG-1140",
    "cur": 1.3,
    "prev": 0.7,
    "util": 11,
    "rec": "Terminate — replaced by autoscaling group on 18 Jun",
    "save": 0.94,
    "groupSave": 34
  },
  "insights": {
    "overview": {
      "what": "Technology spend is <b>$1.62M</b> year to date against a <b>$1.50M</b> phased budget — <b>8.0%</b> over, or <b>$120K</b>.",
      "why": "Six upward drivers add <b>$182K</b>, led by cloud growth at <b>$64K</b> and AI adoption at <b>$38K</b>. Reserved capacity and SaaS clean-up have given <b>$62K</b> back.",
      "do": "Approve the four items already marked <b>Approved</b> in the optimisation backlog. All four are Low effort and High confidence, and none needs new budget.",
      "doValue": "$64K",
      "doLabel": "approve now"
    },
    "itfm": {
      "what": "Spend is <b>$32.4K</b> per employee and <b>$10.9K</b> per customer across 11 closed months.",
      "why": "Headcount has been flat at 50 while cloud and AI run-rates rose, so the per-employee figure is being pushed up by consumption rather than by hiring.",
      "do": "Land the four <b>In progress</b> items before July closes to hold the exit run-rate at <b>$162K</b> a month.",
      "doValue": "$56K",
      "doLabel": "in flight"
    },
    "cloud": {
      "what": "Cloud infrastructure is <b>$645K</b> — <b>39.8%</b> of all technology spend, with AWS at <b>$297K</b>.",
      "why": "Compute alone is <b>$214K</b> and production carries <b>$402K</b>. Savings Plan coverage sits at <b>58%</b> against an <b>85%</b> target, so growth is landing on on-demand rates.",
      "do": "Raise commitment coverage to 85% and terminate the three idle Alpha production instances.",
      "doValue": "$49K",
      "doLabel": "cloud actions"
    },
    "ai": {
      "what": "AI and LLM spend is <b>$218K</b> — <b>$134K</b> of seats and <b>$84K</b> of API usage.",
      "why": "API cost rose from <b>$20K</b> in April to <b>$33K</b> in June after the Alpha reasoning agent went live, and 18 employees hold three or more GenAI seats.",
      "do": "Consolidate the duplicate GenAI seats and route Gamma classification to a smaller model.",
      "doValue": "$37K",
      "doLabel": "AI actions"
    },
    "saas": {
      "what": "SaaS and licences are <b>$291K</b> across 16 tracked applications and <b>34</b> vendors.",
      "why": "Utilisation is the problem, not price: Lucidchart is at <b>33%</b> of purchased seats, Miro at <b>37%</b> and Claude Enterprise at <b>54%</b>.",
      "do": "Reclaim the 12 dormant Microsoft 365 E5 seats and retire one of the two diagramming tools.",
      "doValue": "$25K",
      "doLabel": "licence actions"
    },
    "finance": {
      "what": "The full-year forecast is <b>$1.78M</b> against a <b>$1.64M</b> budget — a <b>$140K</b> overrun if nothing changes.",
      "why": "Eleven closed months are <b>$120K</b> over phasing, and July is forecast at <b>$160K</b> against a <b>$140K</b> plan.",
      "do": "Re-phase the remaining FY26 budget and book the identified backlog into the FY27 plan.",
      "doValue": "$140K",
      "doLabel": "forecast gap"
    },
    "proc": {
      "what": "Ten tracked vendors account for <b>$1.33M</b> of spend, with Microsoft alone at <b>$575K</b>.",
      "why": "Three renewals fall inside 90 days — Grafana Labs on 25 August, Microsoft on 28 September and Atlassian on 31 October — and Grafana is only <b>72%</b> utilised.",
      "do": "Open the Grafana renewal this week and take the Microsoft EA volume tier into negotiation.",
      "doValue": "$27K",
      "doLabel": "at renewal"
    },
    "product": {
      "what": "Product Alpha carries <b>$468K</b> of spend on <b>$3.1M</b> of revenue — <b>15.1%</b> of revenue.",
      "why": "Delta is the outlier: <b>$176K</b> of spend on <b>$280K</b> of revenue, and it is the only revenue-generating product inside its own budget.",
      "do": "Decide the future of Delta before the next quarter — its spend is <b>63%</b> of the revenue it earns.",
      "doValue": "$176K",
      "doLabel": "Delta spend"
    },
    "optimize": {
      "what": "The backlog holds <b>$214K</b> of identified savings; <b>$96K</b> has been realised.",
      "why": "Conversion is <b>45%</b>. Four items worth <b>$64K</b> are approved but unstarted, and the largest — three idle EC2 instances — has been open since 24 June.",
      "do": "Clear the four approved items first; every one of them is Low effort with High confidence.",
      "doValue": "$64K",
      "doLabel": "approved, unstarted"
    },
    "allocation": {
      "what": "<b>$87K</b> of spend — <b>5.4%</b> of the total — cannot be attributed from tags alone.",
      "why": "Missing product tags account for <b>$41K</b> across 62 resources; owner tags are missing on 38 more.",
      "do": "Tag the 62 resources missing a product tag; that alone lifts allocation coverage to <b>97.2%</b>.",
      "doValue": "$41K",
      "doLabel": "untagged spend"
    },
    "forecast": {
      "what": "The baseline forecast closes FY26 at <b>$1.78M</b>; full delivery of the backlog closes it at <b>$1.69M</b>.",
      "why": "AI usage adds <b>22%</b> to the run-rate and cloud workloads <b>14%</b>; reserved capacity and SaaS clean-up take <b>18%</b> back.",
      "do": "Commit to the optimisation scenario and set FY27 planning from the <b>$1.69M</b> exit run-rate.",
      "doValue": "$90K",
      "doLabel": "forecast delta"
    },
    "anomalies": {
      "what": "Six anomalies were detected in the last eight weeks, together <b>$16.2K</b> above expected.",
      "why": "The one Critical item — Alpha EC2 compute at <b>$31.4K</b> against <b>$22.1K</b> expected — is three untagged production instances deployed on 18 June, all under 12% CPU.",
      "do": "Terminate the three instances and make the product tag mandatory in the deployment pipeline.",
      "doValue": "$9.3K",
      "doLabel": "monthly overrun"
    },
    "security": {
      "what": "Security tooling is <b>$197K</b>, of which Sentinel ingestion is <b>$78K</b> at <b>$42.40</b> per GB.",
      "why": "Ingestion rose <b>38%</b> after debug logging was left on in Beta containers following the 9 June release. Licence utilisation is healthy at <b>88%</b>.",
      "do": "Turn off debug logging in the Beta containers and set an ingestion cap per workspace.",
      "doValue": "$4.8K",
      "doLabel": "ingestion saving"
    },
    "obs": {
      "what": "Observability is <b>$99K</b> for <b>2,410 GB</b> of logs, <b>4.8M</b> metric series and <b>1.2B</b> trace spans.",
      "why": "Gamma generates <b>31%</b> of observability cost on <b>12%</b> of traffic. The cause is high-cardinality metric labels, not volume.",
      "do": "Drop the high-cardinality labels on Gamma metrics and cut non-production retention to 30 days.",
      "doValue": "$18K",
      "doLabel": "observability actions"
    },
    "itsm": {
      "what": "ITSM is <b>$57K</b> for <b>3,180</b> tickets, <b>412</b> incidents and <b>286</b> changes — <b>$17.90</b> a ticket.",
      "why": "Internal IT raises only <b>255</b> tickets but <b>123</b> incidents, the worst incident ratio of any area.",
      "do": "Move Atlassian to a two-year commitment and fix the directory sync rule that auto-provisioned 14 seats.",
      "doValue": "$6K",
      "doLabel": "at renewal"
    },
    "alerts": {
      "what": "Seven alerts are open: one Critical, three High, two Medium and one Low.",
      "why": "Together they carry <b>$10.9K</b> of in-month impact and <b>$110K</b> of addressable saving.",
      "do": "Clear the Critical AWS alert first — it is <b>$4.6K</b> a month and <b>$34K</b> a year.",
      "doValue": "$34K",
      "doLabel": "top alert"
    },
    "sources": {
      "what": "Twelve source systems feed the model: three cloud billing exports, two SaaS consoles, two security consoles, and one each for AI, ITSM, observability, people and finance.",
      "why": "Cloud, SaaS and security are read directly. AI usage arrives from provider APIs, so token detail is only as fresh as the last poll and carries no product tag.",
      "do": "Add the AI gateway as a thirteenth source so token spend is attributed at source rather than by rule.",
      "doValue": "$87K",
      "doLabel": "would become attributable"
    }
  }
}
);
