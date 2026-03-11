# AdWing 整体技术架构与工作流

## 一、技术栈总览

```
┌─────────────────────────────────────────────────────────┐
│  前端层：Next.js 15 (App Router) + Tailwind CSS         │
├─────────────────────────────────────────────────────────┤
│  API 层：Next.js API Routes (REST)                      │
├─────────────────────────────────────────────────────────┤
│  智能体编排层：LangGraph.js（状态机 + 条件路由）          │
├─────────────────────────────────────────────────────────┤
│  智能体框架层：LangChain.js + Anthropic Claude           │
│  （Sonnet 生成 / Haiku 评估）                            │
├─────────────────────────────────────────────────────────┤
│  任务队列层：BullMQ（Redis 驱动的后台任务）               │
├─────────────────────────────────────────────────────────┤
│  数据层：PostgreSQL (Prisma ORM) + Redis                 │
├─────────────────────────────────────────────────────────┤
│  外部集成：Shopify API / Meta API / Google Ads API       │
│            Stripe（计费）/ Resend（邮件）                 │
└─────────────────────────────────────────────────────────┘
```

---

## 二、多智能体管道架构（核心）

项目的核心是 **4 个 AI 智能体团队（Crew）**，通过 LangGraph.js 编排成一条有状态的处理管道：

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│  情报团队     │ ──> │  创意团队     │ ──> │  策略团队          │ ──> │  执行团队     │
│ Intelligence │     │  Creative    │     │  Strategy         │     │  Execution   │
│              │     │              │     │                   │     │  (Phase 3)   │
│ - 账户分析师  │     │ - 文案撰写   │     │ - 预算优化器       │     │ - 投放部署   │
│ - 市场扫描器  │     │ - 评估器     │     │ - 策略报告器       │     │ - 实时监控   │
│              │     │  (反思循环)   │     │                   │     │              │
└──────────────┘     └──────────────┘     └───────────────────┘     └──────────────┘
```

### 各团队职责

| 团队 | 输入 | 输出 | 使用的模型 |
|------|------|------|-----------|
| **情报团队** | Shopify 数据 + 广告账户数据 | 健康评分 + 竞品洞察 | Sonnet |
| **创意团队** | 情报输出 + 品牌调性 | 10+ 条评分后的广告文案 | Sonnet 生成 / Haiku 评估 |
| **策略团队** | 情报 + 创意输出 | 预算分配方案 + 策略报告 | Sonnet |
| **执行团队** | 经审批的策略 + 创意素材 | 上线的广告活动 | Phase 3 实现 |

### 共享状态机制

所有智能体通过 `src/agents/state.ts` 定义的 **LangGraph 共享状态** 进行通信：

```typescript
AdWingState = {
  userId, storeId, planTier,       // 输入上下文
  productCatalog, salesData,       // 店铺数据
  accountHealth,                   // 情报团队写入
  competitorInsight,               // 情报团队写入
  adCopyBatch, creativeIterations, // 创意团队写入
  budgetRecommendation,            // 策略团队写入
  strategyReport,                  // 策略团队写入
  errors, currentCrew              // 管道控制
}
```

每个团队从状态中**读取**上游数据，并**写入**自己的输出，下游团队即可使用。

---

## 三、关键设计模式

### 1. 反思循环（Reflexion Loop）

创意团队采用 **LLM-as-a-Judge** 模式保证输出质量：

```
文案撰写器（Sonnet）──> 评估器（Haiku）──> 评分 < 6.5？
                                              │
                                    是：返回文案撰写器重写（最多 3 轮）
                                    否：输出通过，进入策略团队
```

### 2. 条件路由（按套餐分层）

LangGraph 的条件边根据用户套餐跳过部分节点：

- **Starter（$49）**：跳过竞品扫描、跳过策略报告
- **Growth（$99）**：完整管道
- **Scale（$199）**：完整管道 + 实时报告

### 3. 人在回路（HITL）

AI 只**提议**，不自动执行。用户在 Dashboard 中预览每条广告文案、每个预算调整，**手动审批**后才会部署到广告平台。

---

## 四、数据流与工作流

### 用户入驻流程（5 分钟）

```
注册 ──> 连接 Shopify（OAuth）──> 连接 Meta 广告账户（OAuth）
  ──> 情报团队自动运行初始审计（2-5 分钟）
  ──> Dashboard 展示健康评分 + 首批建议
```

### 每周策略周期

```
周一：情报团队扫描（账户表现 + 竞品动态）
周二：创意团队生成新广告文案（10+ 变体）
周三：策略团队生成周度建议报告
周四：用户在 Dashboard 审批/修改/拒绝每条建议
周五：已批准的操作排队执行，部署到广告平台
全周：实时监控，异常告警（邮件/Slack）
周日：发送周度绩效总结
```

### API 调用链路

```
用户点击 "Run" ──> /api/agents/pipeline (POST)
  │
  ├── 创建 AgentRun 记录（状态：RUNNING）
  ├── 从数据库加载店铺数据、产品、广告账户
  ├── 构建 LangGraph 图并调用 graph.invoke()
  │     │
  │     ├── account_analyst（调用 Claude Sonnet）
  │     ├── market_scanner（调用 Claude Sonnet）
  │     ├── copywriter（调用 Claude Sonnet）
  │     ├── evaluator（调用 Claude Haiku）── 可能循环
  │     ├── budget_optimizer（调用 Claude Sonnet）
  │     └── strategy_reporter（调用 Claude Sonnet）
  │
  ├── 将生成的广告文案写入 AdCopy 表
  ├── 将策略报告写入 StrategyReport 表
  ├── 更新店铺健康评分
  └── 更新 AgentRun 记录（状态：COMPLETED）
```

---

## 五、数据库架构

```
User ──┬── Store ──── Product
       ├── AdAccount ── Campaign ── CampaignMetrics
       ├── AgentRun ──── AdCopy
       ├── Subscription
       └── StrategyReport

CompetitorAd（竞品广告数据，独立表）
```

核心关系：

- 一个用户可以有多个店铺和广告账户
- 每次智能体运行（AgentRun）记录输入、输出、耗时、Token 用量和成本
- 生成的广告文案（AdCopy）关联到 AgentRun，审批后关联到 Campaign

---

## 六、后台任务架构

```
BullMQ Worker 进程（独立运行）
  ├── intelligence 队列 ── 并发 5
  ├── creative 队列     ── 并发 5
  ├── strategy 队列     ── 并发 5
  └── full-pipeline 队列 ── 并发 3
```

用于定时任务（每周策略周期）和异步执行，避免阻塞 HTTP 请求。

---

## 七、前端架构

```
/                      ── 营销落地页（功能介绍 + 定价 + CTA）
/auth/signin           ── 登录页（Shopify OAuth + 邮箱）
/onboarding            ── 入驻引导（连接店铺 → 连接广告 → 初始审计）
/dashboard             ── 总览（健康评分 + 快速统计 + 智能体运行器）
/dashboard/creative    ── 广告文案生成与审核
/dashboard/competitors ── 竞品情报展示
/dashboard/strategy    ── 策略报告 + 预算重分配 + A/B 测试矩阵
/dashboard/campaigns   ── 广告活动管理
/dashboard/settings    ── 账户连接 + 订阅 + 智能体配置
```

---

## 总结

AdWing 的架构核心思想是：**用多智能体管道替代人工媒体买手的完整工作流**。每个智能体团队对应媒体买手的一个核心能力（分析、创意、策略、执行），通过 LangGraph 状态机串联，确保数据在团队之间有序流转，同时通过反思循环和人在回路保证输出质量和用户控制权。

---

## 八、竞品格局：诚实的市场分析（2026 年 3 月）

> 以下基于对美国/欧洲市场 20+ 个广告自动化产品的深度调研。

### 残酷的现实

AdWing 提出的"端到端多智能体 + 跨平台统一策略 + Shopify 深度集成"组合，**并非市场空白**。多家公司已经在做相似的事情，且部分已经有成熟产品和用户基础。

### 第一梯队：直接竞品（威胁等级：极高）

#### 1. Madgicx — 最像 AdWing 的对手

- 已经在使用 **"Agentic AI"** 品牌定位
- Shopify 原生应用，拥有 AI Marketer（账户审计）、AI Ad Generator（创意生成）、AI Bidding（出价优化）
- 覆盖 Meta、Google、TikTok + 跨渠道报告
- 定价 $99/月起，按广告花费扩展
- **关键事实：** Madgicx 已经覆盖了 AdWing 想做的大部分功能，且有成熟用户群

#### 2. AdScale — Shopify 生态直接竞品

- Shopify 应用商店 **4.7 星，454 条评价**
- AI 创意生成（视频 + 图片 + 文案）+ 跨渠道（Meta + Google）预算优化
- 深度 Shopify 集成：产品目录同步、产品变化自动更新广告
- 定价 **$99-$197/月** — 与 AdWing 几乎完全重叠
- 还提供邮件 & SMS 营销功能

#### 3. Zocket — 多 AI 模块 + 四平台覆盖

- 分离的 AI 模块：Generative AI（创意）、Targeting AI（受众）、Optimizer AI（优化）
- 覆盖 **Meta + Google + TikTok + Snapchat** — 比 AdWing 还多一个平台
- Shopify 原生应用
- SMB 友好定价

#### 4. Shopify 自身 — 最大的结构性威胁

- 2026 年 1 月 Winter '26 "Renaissance Edition" 发布
- **内置统一广告管理**：上传素材 → Shopify AI 自动生成数百个广告变体 → 格式化为 Instagram Reels、TikTok、Google Display
- 分发优势无可匹敌（4.6M+ 活跃商店，零获客成本）
- 功能还在持续扩展中

### 第二梯队：强竞品（威胁等级：中等）

| 竞品 | 端到端 | 跨平台预算 | AI 创意 | Shopify 原生 | 定价 | 备注 |
|------|:---:|:---:|:---:|:---:|------|------|
| **Smartly.io** | 有 | 有 | 有 | 无 | $5,000+/月 | 企业级，管理 $50 亿+年广告支出，918 人团队 |
| **Albert AI** | 有 | 有 | 部分 | 无 | 企业级 | 真正的自主投放 AI，已被 Zoomd 收购 |
| **Pixis AI** | 有 | 有 | 有 | 无 | 企业级 | 融资 **$2.1 亿**，447 人团队 |
| **AdCreative.ai** | 无 | 无 | 有（核心） | 部分 | $40+/月 | 只做创意，但创意评分功能成熟 |
| **Amanda AI** | 部分 | 有 | 部分 | 有 | SMB | Shopify 原生，Google + Meta + Bing |
| **AdAmigo.ai** | 部分 | 无 | 有 | 无 | $99-$299/月 | Meta 专注，语音/文字指令控制 |

### 第三梯队：相邻产品（部分重叠）

| 竞品 | 定位 | 与 AdWing 关系 |
|------|------|---------------|
| **Triple Whale** | Shopify 归因分析，AI 助手 "Moby"，50,000+ 品牌 | 与情报团队竞争 |
| **Northbeam** | 跨平台归因 | 与情报团队竞争 |
| **Birch (原 Revealbot)** | 规则引擎自动化，$49-$99/月 | 自动化但非 AI 原生 |
| **Adzooma** | PPC 管理 + AI 机会引擎，$49-$139/月 | 无创意生成，无 Shopify |
| **Skai / Marin** | 企业级全渠道 | 完全不同的市场层级 |

### 全景对比矩阵

| 能力 | Madgicx | AdScale | Zocket | Smartly | Shopify 内置 | **AdWing** |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| 端到端管道 | 有 | 部分 | 有 | 有 | 部分（扩展中） | 有 |
| 跨平台预算优化 | 有 | 有 | 有 | 有 | 部分 | 有 |
| 多智能体/Agentic AI | 有（品牌层面） | 无 | 实质上有 | 无 | 无 | 有（架构层面） |
| Shopify 原生 | 有 | 有 | 有 | 无 | **是 Shopify** | 有 |
| AI 创意 + 质量评分 | 有 | 有 | 有 | 有 | 有 | 有 |
| SMB 定价 | $99+ | $99-$197 | SMB | $5,000+ | 内置 | $99 |
| TikTok 支持 | 有 | 无 | 有 | 有 | 有 | 有 |

---

## 九、重新定位：AdWing 真正的差异化在哪里？

### 承认现实后的战略思考

"多智能体架构"对终端用户来说**不是卖点**。用户不关心后端用了 LangGraph 还是传统 ML，他们只关心 ROAS 有没有提升。Madgicx 已经在用 "agentic" 做营销语言了，技术架构本身不构成护城河。

那 AdWing 在这个拥挤的市场中靠什么赢？

### 差异化策略 1：AI 推理质量（需要用数据证明）

**竞品现状：** Madgicx、AdScale、Zocket 底层用的是传统 ML 模型 + 规则引擎。它们说的"AI"更多是统计优化，不是真正的推理。

**AdWing 的机会：** 基于 Claude Sonnet/Haiku 的多智能体系统可以做真正的**语义理解和推理**——理解产品卖点、分析竞品文案策略、生成有洞察力的策略报告。这不是规则引擎能做的。

**但是：** 这个优势必须用 A/B 测试数据证明。"我们的 AI 更聪明"不是一个可信的营销话术，"使用 AdWing 的商家平均 ROAS 提升 23%"才是。

### 差异化策略 2：顾问式体验 vs 工具式体验

**竞品现状：** Madgicx、AdScale 都是"给你一堆功能和仪表盘，自己用"。用户仍然需要理解广告投放才能用好这些工具。

**AdWing 的机会：** 做成**AI 媒体买手**而不是**广告管理工具**。

```
竞品体验：
  登录 → 看一堆仪表盘 → 自己判断该做什么 → 手动操作

AdWing 体验：
  登录 → 收到一份像人工媒体买手写的周报 →
  "本周建议：1. 把 Meta 预算从 Campaign A 转移 $200 到 Campaign B，
   原因是 A 的 ROAS 连续 3 周下降。2. 新增 3 条测试文案，
   针对竞品 X 上周大量投放的'限时折扣'类型做差异化。"
  → 用户点"批准" → 完成
```

**核心差异：** 用户不需要是广告专家。AdWing 把决策降维到"同意/不同意"。

### 差异化策略 3：竞品情报→创意生成闭环

**竞品现状：** 大多数工具的竞品分析和创意生成是**完全割裂**的。Pathmatics 做竞品监控，AdCreative.ai 做创意生成，但两者之间没有数据流通。

**AdWing 的机会：** 情报团队扫描到"竞品 X 本周大量投放 UGC 风格短视频广告，hook 是'我试了 30 天'"→ 创意团队自动生成针对性的差异化文案 → 策略团队建议在同一受众群测试。

**这个闭环在现有产品中确实少见。**

### 差异化策略 4：定价楔子

**市场断层：**

```
免费/内置层 ──────── 空白地带 ──────── 企业层
Shopify 内置        ???              Smartly ($5K+)
Adzooma 免费版                       Pixis (企业定制)
                                     Albert (企业定制)
          ↑
    Madgicx $99
    AdScale $99-$197
    AdWing $99  ← 在这里竞争
```

$99 价位已经有 Madgicx 和 AdScale。AdWing 需要在**同样的价格下提供明显更好的体验**才能赢。价格本身不是差异化。

### 建议的新定位声明

> **旧定位（不再成立）：** "No product provides an integrated, AI-native advertising strategist for sub-$50K/month D2C sellers."
>
> **新定位：** "AdWing is your AI media buyer — not another ad management dashboard. While tools like AdScale and Madgicx give you controls to fly the plane yourself, AdWing is the autopilot that tells you where to fly, writes the flight plan, and only asks you to confirm before takeoff."

### 致胜路径：不是功能竞争，是体验竞争

```
短期（0-6 个月）：
  → 用"AI 媒体买手"定位切入，不是"广告管理工具"
  → 竞品情报→创意闭环作为核心卖点
  → 找 20 个种子用户，积累 ROAS 提升数据

中期（6-12 个月）：
  → 用真实数据证明 AI 推理质量 > 传统 ML
  → 构建品类知识库（跨用户数据沉淀）
  → Shopify App Store 上线，靠口碑增长

长期（12+ 个月）：
  → 数据飞轮形成壁垒
  → 品类专家模型（美妆、时尚、保健品各有专精）
  → 从工具进化为平台
```

### 最终结论

AdWing 的竞争环境比最初设想的要激烈得多。**功能层面没有护城河**——Madgicx、AdScale、Zocket 已经覆盖了大部分能力。

真正的机会在于**体验层面的差异化**：
1. **顾问式体验**（AI 媒体买手 vs 工具仪表盘）
2. **情报→创意闭环**（竞品洞察直接驱动文案生成）
3. **可证明的 AI 推理优势**（用 ROAS 数据说话，不是用技术架构说话）

一句话：**不要卖技术架构，要卖结果。不要做更好的工具，要做更好的媒体买手。**
