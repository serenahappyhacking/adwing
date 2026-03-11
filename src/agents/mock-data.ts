/**
 * Mock data for demo mode — used when ANTHROPIC_API_KEY is not configured.
 */

export const mockAccountHealth = {
  overallScore: 72,
  scores: {
    budgetEfficiency: 68,
    audienceTargeting: 75,
    creativeQuality: 70,
    conversionRate: 74,
  },
  alerts: [
    {
      severity: "warning" as const,
      message: "CPA increased 23% week-over-week on Meta campaigns",
      metric: "CPA",
      change: "+23%",
    },
    {
      severity: "info" as const,
      message: "Google Shopping ROAS trending upward (+12%)",
      metric: "ROAS",
      change: "+12%",
    },
    {
      severity: "critical" as const,
      message: "Facebook ad frequency exceeding 3.5 — creative fatigue risk",
      metric: "Frequency",
      change: "3.5x",
    },
  ],
  recommendations: [
    "Refresh top-of-funnel creatives to combat frequency fatigue",
    "Shift 15% of Meta budget to Google Shopping (higher ROAS)",
    "Test lookalike audiences based on recent purchasers",
  ],
};

export const mockCompetitorInsight = {
  competitors: [
    {
      name: "Competitor A — GlowSkin Co.",
      adCount: 47,
      platforms: ["Meta", "Google"],
      topHook: "Your skin deserves better than chemicals",
      estimatedSpend: "$15K-25K/mo",
    },
    {
      name: "Competitor B — PureBeauty",
      adCount: 32,
      platforms: ["Meta", "TikTok"],
      topHook: "The 30-second routine that changed everything",
      estimatedSpend: "$8K-15K/mo",
    },
  ],
  trends: [
    { trend: "UGC-style video ads dominating in your niche", momentum: "rising" },
    { trend: "Before/after comparison formats performing well", momentum: "stable" },
    { trend: "Long-form educational content gaining traction", momentum: "rising" },
  ],
  gaps: [
    "No competitors actively targeting 45+ demographic",
    "Limited Spanish-language ad coverage in your category",
    "Sustainability messaging underutilized in competitor ads",
  ],
};

export const mockAdCopyBatch = {
  variants: [
    {
      headline: "Transform Your Skin in 7 Days",
      primaryText:
        "Tired of products that promise everything and deliver nothing? Our clinically-proven formula uses 3 active ingredients that work synergistically to restore your natural glow. Join 50,000+ happy customers.",
      description: "Clinically proven. Dermatologist recommended. 30-day money-back guarantee.",
      cta: "SHOP_NOW",
      hook: "What if your skincare actually worked?",
      format: "single_image",
      language: "en",
      qualityScore: 8.2,
      hypothesis: "Specificity (7 days) + social proof (50K customers) drives urgency",
      targetAudience: "Women 25-44, skincare enthusiasts, frustrated with current routine",
    },
    {
      headline: "The Last Moisturizer You'll Ever Buy",
      primaryText:
        "We spent 2 years perfecting one product so you don't have to buy ten. Ultra-hydrating, non-greasy, and packed with vitamin C + hyaluronic acid. Your simplified routine starts here.",
      description: "Free shipping on orders over $50. Subscribe & save 20%.",
      cta: "LEARN_MORE",
      hook: "Simplify your 10-step routine to just one",
      format: "carousel",
      language: "en",
      qualityScore: 7.8,
      hypothesis: "Simplification appeal + ingredient transparency builds trust",
      targetAudience: "Women 30-50, busy professionals, value convenience",
    },
    {
      headline: "Your Dermatologist's Secret",
      primaryText:
        "9 out of 10 dermatologists recommend ingredients in our formula. But we made it affordable. Premium skincare shouldn't cost premium prices. Try it risk-free for 30 days.",
      description: "As seen in Vogue, Allure, and Women's Health.",
      cta: "SHOP_NOW",
      hook: "Why do dermatologists keep recommending this?",
      format: "single_image",
      language: "en",
      qualityScore: 7.5,
      hypothesis: "Authority bias (dermatologist) + affordability removes purchase barriers",
      targetAudience: "Women 28-45, health-conscious, research-driven buyers",
    },
    {
      headline: "Stop Wasting Money on Skincare",
      primaryText:
        "The average woman spends $3,756/year on skincare. Most of it doesn't work. Our single-product system replaces 5 products for $39/month. Backed by 847 five-star reviews.",
      description: "Subscribe today and get your first month 50% off.",
      cta: "SIGN_UP",
      hook: "You're spending $3,756/year on skincare that doesn't work",
      format: "video",
      language: "en",
      qualityScore: 8.5,
      hypothesis: "Pain point (wasted money) + specific numbers drive action",
      targetAudience: "Women 25-40, budget-conscious, skeptical of beauty industry",
    },
    {
      headline: "Real Results. Real People.",
      primaryText:
        "Don't take our word for it. See what 50,000+ customers are saying about their skin transformation. Swipe to see their before & after photos (with permission). Your glow-up is next.",
      description: "Join our community. Tag #MyGlowStory for a chance to be featured.",
      cta: "SHOP_NOW",
      hook: "50,000 women can't be wrong",
      format: "carousel",
      language: "en",
      qualityScore: 7.2,
      hypothesis: "UGC social proof + community belonging drives conversions",
      targetAudience: "Women 22-35, social media active, community-oriented",
    },
  ],
};

export const mockStrategyReport = {
  healthScore: 72,
  keyMetrics: {
    totalSpend: 12450,
    totalRevenue: 38900,
    overallRoas: 3.12,
    avgCpa: 24.5,
    avgCtr: 2.8,
  },
  recommendations: [
    {
      priority: "high",
      action: "Pause underperforming Meta ad sets with CPA > $35",
      expectedImpact: "Reduce wasted spend by ~$2,100/month",
      effort: "low",
    },
    {
      priority: "high",
      action: "Scale Google Shopping campaigns — ROAS 4.2x vs 2.1x on Meta",
      expectedImpact: "Increase overall ROAS by 15-20%",
      effort: "medium",
    },
    {
      priority: "medium",
      action: "Launch retargeting campaign for cart abandoners (currently no retargeting)",
      expectedImpact: "Recover 8-12% of abandoned carts",
      effort: "medium",
    },
    {
      priority: "low",
      action: "Test TikTok ads for top-of-funnel awareness in 18-25 demographic",
      expectedImpact: "Expand addressable audience by ~30%",
      effort: "high",
    },
  ],
  testSuggestions: [
    {
      test: "UGC vs Studio creative on Meta",
      hypothesis: "UGC will outperform studio by 20%+ on CTR",
      duration: "14 days",
      budget: "$500",
    },
    {
      test: "Price anchoring in ad copy ($79 crossed out → $39)",
      hypothesis: "Anchoring increases conversion rate by 10-15%",
      duration: "7 days",
      budget: "$300",
    },
  ],
};

export const mockBudgetRecommendation = {
  totalBudget: 12450,
  allocations: [
    { platform: "Google Shopping", currentPct: 30, recommendedPct: 45, reason: "Highest ROAS (4.2x)" },
    { platform: "Meta — Prospecting", currentPct: 40, recommendedPct: 25, reason: "CPA trending up, reduce exposure" },
    { platform: "Meta — Retargeting", currentPct: 0, recommendedPct: 15, reason: "New: recover abandoned carts" },
    { platform: "Google Search Brand", currentPct: 20, recommendedPct: 10, reason: "Maintain brand presence, low growth" },
    { platform: "TikTok — Test", currentPct: 0, recommendedPct: 5, reason: "New: test younger demographic" },
  ],
};
