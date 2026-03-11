# AdWing Technical Architecture & Workflow

## 1. Tech Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: Next.js 15 (App Router) + Tailwind CSS       │
├─────────────────────────────────────────────────────────┤
│  API Layer: Next.js API Routes (REST)                   │
├─────────────────────────────────────────────────────────┤
│  Agent Orchestration: LangGraph.js (state machine +     │
│  conditional routing)                                   │
├─────────────────────────────────────────────────────────┤
│  Agent Framework: LangChain.js + Anthropic Claude       │
│  (Sonnet for generation / Haiku for evaluation)         │
├─────────────────────────────────────────────────────────┤
│  Job Queue: BullMQ (Redis-backed background tasks)      │
├─────────────────────────────────────────────────────────┤
│  Data Layer: PostgreSQL (Prisma ORM) + Redis            │
├─────────────────────────────────────────────────────────┤
│  External Integrations: Shopify API / Meta API /        │
│  Google Ads API / Stripe (billing) / Resend (email)     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Agent Pipeline Architecture (Core)

The core of the project is **4 AI agent crews**, orchestrated by LangGraph.js into a stateful processing pipeline:

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│ Intelligence │ ──> │  Creative    │ ──> │    Strategy       │ ──> │  Execution   │
│    Crew      │     │    Crew      │     │      Crew         │     │    Crew      │
│              │     │              │     │                   │     │  (Phase 3)   │
│ - Account    │     │ - Copywriter │     │ - Budget          │     │ - Campaign   │
│   Analyst    │     │ - Evaluator  │     │   Optimizer       │     │   Builder    │
│ - Market     │     │  (reflexion) │     │ - Strategy        │     │ - Perf       │
│   Scanner    │     │              │     │   Reporter        │     │   Monitor    │
└──────────────┘     └──────────────┘     └───────────────────┘     └──────────────┘
```

### Crew Responsibilities

| Crew | Input | Output | Model |
|------|-------|--------|-------|
| **Intelligence** | Shopify data + ad account data | Health score + competitor insights | Sonnet |
| **Creative** | Intelligence output + brand voice | 10+ scored ad copy variants | Sonnet (generation) / Haiku (evaluation) |
| **Strategy** | Intelligence + Creative outputs | Budget allocation plan + strategy report | Sonnet |
| **Execution** | Approved strategy + creatives | Live campaigns | Phase 3 implementation |

### Shared State Mechanism

All agents communicate via **LangGraph shared state** defined in `src/agents/state.ts`:

```typescript
AdWingState = {
  userId, storeId, planTier,       // Input context
  productCatalog, salesData,       // Store data
  accountHealth,                   // Written by Intelligence Crew
  competitorInsight,               // Written by Intelligence Crew
  adCopyBatch, creativeIterations, // Written by Creative Crew
  budgetRecommendation,            // Written by Strategy Crew
  strategyReport,                  // Written by Strategy Crew
  errors, currentCrew              // Pipeline control
}
```

Each crew **reads** upstream data from the state and **writes** its own output, making it immediately available to downstream crews.

---

## 3. Key Design Patterns

### 1. Reflexion Loop

The Creative Crew uses an **LLM-as-a-Judge** pattern to ensure output quality:

```
Copywriter (Sonnet) ──> Evaluator (Haiku) ──> Score < 6.5?
                                                  │
                                        Yes: Return to Copywriter (max 3 iterations)
                                        No:  Pass through to Strategy Crew
```

### 2. Conditional Routing (Tier-based)

LangGraph conditional edges skip nodes based on the user's subscription tier:

- **Starter ($49)**: Skips competitor scan and strategy report
- **Growth ($99)**: Full pipeline
- **Scale ($199)**: Full pipeline + real-time reports

### 3. Human-in-the-Loop (HITL)

AI only **proposes** — it never auto-executes. Users preview every ad copy and budget change in the Dashboard and **manually approve** before anything is deployed to ad platforms.

---

## 4. Data Flow & Workflows

### User Onboarding (5 minutes to value)

```
Sign up ──> Connect Shopify (OAuth) ──> Connect Meta ad account (OAuth)
  ──> Intelligence Crew runs initial audit (2-5 min)
  ──> Dashboard shows Health Score + first recommendations
```

### Weekly Strategy Cycle

```
Monday:    Intelligence Crew scans (account performance + competitor activity)
Tuesday:   Creative Crew generates fresh ad variants (10+ variants)
Wednesday: Strategy Crew produces weekly recommendation report
Thursday:  User reviews and approves/modifies/rejects each suggestion
Friday:    Approved changes queued for execution, deployed to ad platforms
All week:  Real-time monitoring, anomaly alerts (email/Slack)
Sunday:    Weekly performance summary delivered
```

### API Call Chain

```
User clicks "Run" ──> /api/agents/pipeline (POST)
  │
  ├── Create AgentRun record (status: RUNNING)
  ├── Load store data, products, ad accounts from database
  ├── Build LangGraph graph and invoke graph.invoke()
  │     │
  │     ├── account_analyst (calls Claude Sonnet)
  │     ├── market_scanner (calls Claude Sonnet)
  │     ├── copywriter (calls Claude Sonnet)
  │     ├── evaluator (calls Claude Haiku) ── may loop
  │     ├── budget_optimizer (calls Claude Sonnet)
  │     └── strategy_reporter (calls Claude Sonnet)
  │
  ├── Save generated ad copies to AdCopy table
  ├── Save strategy report to StrategyReport table
  ├── Update store health score
  └── Update AgentRun record (status: COMPLETED)
```

---

## 5. Database Schema

```
User ──┬── Store ──── Product
       ├── AdAccount ── Campaign ── CampaignMetrics
       ├── AgentRun ──── AdCopy
       ├── Subscription
       └── StrategyReport

CompetitorAd (standalone table for competitor ad data)
```

Key relationships:

- A user can have multiple stores and ad accounts
- Each agent run (AgentRun) records input, output, duration, token usage, and cost
- Generated ad copies (AdCopy) are linked to their AgentRun; once approved, they link to a Campaign

---

## 6. Background Task Architecture

```
BullMQ Worker Process (runs independently)
  ├── intelligence queue ── concurrency 5
  ├── creative queue     ── concurrency 5
  ├── strategy queue     ── concurrency 5
  └── full-pipeline queue ── concurrency 3
```

Used for scheduled tasks (weekly strategy cycle) and async execution to avoid blocking HTTP requests.

---

## 7. Frontend Architecture

```
/                      ── Marketing landing page (features + pricing + CTA)
/auth/signin           ── Sign-in page (Shopify OAuth + email)
/onboarding            ── Onboarding flow (connect store → connect ads → initial audit)
/dashboard             ── Overview (health score + quick stats + agent runner)
/dashboard/creative    ── Ad copy generation and review
/dashboard/competitors ── Competitor intelligence display
/dashboard/strategy    ── Strategy report + budget reallocation + A/B test matrix
/dashboard/campaigns   ── Campaign management
/dashboard/settings    ── Account connections + subscription + agent configuration
```

---

## Summary

AdWing's architecture is built around one core idea: **replace the full workflow of a human media buyer with a multi-agent pipeline**. Each agent crew maps to a core capability of a media buyer (analysis, creative, strategy, execution), connected through a LangGraph state machine to ensure data flows in order between crews. Quality and user control are maintained through the reflexion loop and human-in-the-loop approval gates.

---

## 8. Competitive Landscape: Honest Market Analysis (March 2026)

> Based on deep research of 20+ ad automation products in the US/European market.

### The Hard Truth

AdWing's proposed combination of "end-to-end multi-agent + cross-platform unified strategy + deep Shopify integration" is **not a market white space**. Multiple companies are already doing similar things, some with mature products and established user bases.

### Tier 1: Direct Competitors (Threat Level: Very High)

#### 1. Madgicx — The Closest Rival

- Already using **"Agentic AI"** brand positioning
- Native Shopify app with AI Marketer (account audit), AI Ad Generator (creative), AI Bidding (bid optimization)
- Covers Meta, Google, TikTok + cross-channel reporting
- Pricing from $99/month, scales with ad spend
- **Key fact:** Madgicx already covers most of what AdWing aims to do, with an established user base

#### 2. AdScale — Direct Shopify Ecosystem Competitor

- Shopify App Store **4.7 stars, 454 reviews**
- AI creative generation (video + image + copy) + cross-channel (Meta + Google) budget optimization
- Deep Shopify integration: product catalog sync, auto-updates ads on product changes
- Pricing **$99-$197/month** — nearly identical to AdWing
- Also offers email & SMS marketing features

#### 3. Zocket — Multi-AI Module + Four-Platform Coverage

- Separate AI modules: Generative AI (creative), Targeting AI (audience), Optimizer AI (optimization)
- Covers **Meta + Google + TikTok + Snapchat** — one more platform than AdWing
- Native Shopify app
- SMB-friendly pricing

#### 4. Shopify Itself — The Biggest Structural Threat

- January 2026 Winter '26 "Renaissance Edition" launched
- **Built-in unified campaign management**: upload assets → Shopify AI generates hundreds of ad variants → formatted for Instagram Reels, TikTok, Google Display
- Unmatched distribution advantage (4.6M+ active stores, zero CAC)
- Features are still expanding

### Tier 2: Strong Competitors (Threat Level: Medium)

| Competitor | End-to-End | Cross-Platform | AI Creative | Shopify Native | Pricing | Notes |
|-----------|:---:|:---:|:---:|:---:|-------|-------|
| **Smartly.io** | Yes | Yes | Yes | No | $5,000+/mo | Enterprise, manages $5B+ annual ad spend, 918 employees |
| **Albert AI** | Yes | Yes | Partial | No | Enterprise | Truly autonomous ad AI, acquired by Zoomd |
| **Pixis AI** | Yes | Yes | Yes | No | Enterprise | **$210M+ raised**, 447 employees |
| **AdCreative.ai** | No | No | Yes (core) | Partial | $40+/mo | Creative-only, but mature quality scoring |
| **Amanda AI** | Partial | Yes | Partial | Yes | SMB | Shopify native, Google + Meta + Bing |
| **AdAmigo.ai** | Partial | No | Yes | No | $99-$299/mo | Meta-only, voice/text command control |

### Tier 3: Adjacent Products (Partial Overlap)

| Competitor | Positioning | Relationship to AdWing |
|-----------|------------|----------------------|
| **Triple Whale** | Shopify attribution analytics, AI assistant "Moby", 50,000+ brands | Competes with Intelligence Crew |
| **Northbeam** | Cross-platform attribution | Competes with Intelligence Crew |
| **Birch (formerly Revealbot)** | Rule-based automation, $49-$99/mo | Automation but not AI-native |
| **Adzooma** | PPC management + AI opportunity engine, $49-$139/mo | No creative generation, no Shopify |
| **Skai / Marin** | Enterprise omnichannel | Entirely different market tier |

### Full Comparison Matrix

| Capability | Madgicx | AdScale | Zocket | Smartly | Shopify Built-in | **AdWing** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| End-to-end pipeline | Yes | Partial | Yes | Yes | Partial (expanding) | Yes |
| Cross-platform budget | Yes | Yes | Yes | Yes | Partial | Yes |
| Multi-agent/Agentic AI | Yes (branding) | No | Effectively yes | No | No | Yes (architecture) |
| Shopify native | Yes | Yes | Yes | No | **IS Shopify** | Yes |
| AI creative + scoring | Yes | Yes | Yes | Yes | Yes | Yes |
| SMB pricing | $99+ | $99-$197 | SMB | $5,000+ | Built-in | $99 |
| TikTok support | Yes | No | Yes | Yes | Yes | Yes |

---

## 9. Repositioning: Where AdWing's Real Differentiation Lies

### Strategic Thinking After Facing Reality

"Multi-agent architecture" is **not a selling point** for end users. Users don't care whether the backend uses LangGraph or traditional ML — they care whether ROAS improves. Madgicx already uses "agentic" as marketing language without necessarily having a true multi-agent system. Technical architecture alone is not a moat.

So how does AdWing win in this crowded market?

### Differentiation Strategy 1: AI Reasoning Quality (Must Be Proven with Data)

**Competitor status quo:** Madgicx, AdScale, and Zocket use traditional ML models + rule engines under the hood. Their "AI" is mostly statistical optimization, not true reasoning.

**AdWing's opportunity:** A multi-agent system based on Claude Sonnet/Haiku can do genuine **semantic understanding and reasoning** — understanding product value propositions, analyzing competitor copy strategies, generating insightful strategy reports. Rule engines cannot do this.

**However:** This advantage must be proven with A/B test data. "Our AI is smarter" is not a credible marketing claim. "Merchants using AdWing see an average 23% ROAS improvement" is.

### Differentiation Strategy 2: Advisor Experience vs. Tool Experience

**Competitor status quo:** Madgicx and AdScale are "here's a bunch of features and dashboards, figure it out yourself." Users still need to understand advertising to use these tools effectively.

**AdWing's opportunity:** Be an **AI media buyer**, not an **ad management tool**.

```
Competitor experience:
  Log in → See a bunch of dashboards → Figure out what to do → Manually execute

AdWing experience:
  Log in → Receive a weekly brief like a human media buyer would write →
  "This week's recommendations: 1. Shift $200 from Meta Campaign A to
   Campaign B — A's ROAS has declined for 3 consecutive weeks. 2. Launch
   3 new test creatives targeting the 'limited-time discount' angle that
   competitor X has been pushing heavily this week."
  → User clicks "Approve" → Done
```

**Core difference:** The user doesn't need to be an advertising expert. AdWing reduces decisions to "agree / disagree."

### Differentiation Strategy 3: Intelligence → Creative Closed Loop

**Competitor status quo:** Most tools keep competitor analysis and creative generation **completely separate**. Pathmatics does competitive monitoring, AdCreative.ai does creative generation, but there is no data flow between them.

**AdWing's opportunity:** Intelligence Crew detects "Competitor X is heavily running UGC-style short-form video ads this week with the hook 'I tried it for 30 days'" → Creative Crew automatically generates differentiated copy in response → Strategy Crew recommends testing against the same audience segments.

**This closed loop is genuinely rare among existing products.**

### Differentiation Strategy 4: Pricing Wedge

**Market gap:**

```
Free/Built-in tier ──────── Gap ──────── Enterprise tier
Shopify built-in            ???          Smartly ($5K+)
Adzooma free tier                        Pixis (custom)
                                         Albert (custom)
          ↑
    Madgicx $99
    AdScale $99-$197
    AdWing $99  ← Competing here
```

The $99 price point already has Madgicx and AdScale. AdWing needs to deliver a **noticeably better experience at the same price** to win. Price itself is not a differentiator.

### Proposed New Positioning Statement

> **Old positioning (no longer defensible):** "No product provides an integrated, AI-native advertising strategist for sub-$50K/month D2C sellers."
>
> **New positioning:** "AdWing is your AI media buyer — not another ad management dashboard. While tools like AdScale and Madgicx give you controls to fly the plane yourself, AdWing is the autopilot that tells you where to fly, writes the flight plan, and only asks you to confirm before takeoff."

### Path to Victory: Not Feature Competition, but Experience Competition

```
Short-term (0-6 months):
  → Position as "AI media buyer", NOT "ad management tool"
  → Intelligence-to-creative closed loop as core selling point
  → Get 20 seed users, accumulate ROAS improvement data

Mid-term (6-12 months):
  → Use real data to prove AI reasoning quality > traditional ML
  → Build category knowledge base (cross-user data accumulation)
  → Shopify App Store launch, grow through word-of-mouth

Long-term (12+ months):
  → Data flywheel forms a real moat
  → Category-specific expert models (beauty, fashion, supplements each specialized)
  → Evolve from tool to platform
```

### Final Conclusion

AdWing's competitive environment is significantly more crowded than originally assumed. **There is no moat at the feature level** — Madgicx, AdScale, and Zocket already cover most of the same capabilities.

The real opportunity lies in **experience-level differentiation**:
1. **Advisor experience** (AI media buyer vs. tool dashboard)
2. **Intelligence → Creative closed loop** (competitor insights directly driving copy generation)
3. **Provable AI reasoning advantage** (speak with ROAS data, not technical architecture)

One sentence: **Don't sell the architecture, sell the results. Don't build a better tool, build a better media buyer.**
