import { describe, it, expect } from "vitest";
import {
  AccountHealthSchema,
  CompetitorInsightSchema,
  AdCopyVariantSchema,
  AdCopyBatchSchema,
  BudgetRecommendationSchema,
  StrategyReportSchema,
} from "../index";

describe("AccountHealthSchema", () => {
  const validData = {
    overallScore: 72,
    spendEfficiency: 68,
    creativePerformance: 75,
    audienceQuality: 70,
    topCampaigns: [
      { id: "c1", name: "Summer Sale", roas: 3.2, spend: 500, status: "active" },
    ],
    wastedSpend: 1200,
    opportunities: ["Scale Google Shopping"],
    alerts: [
      { type: "roas_drop", severity: "high", message: "ROAS dropped 20%" },
    ],
  };

  it("parses valid account health data", () => {
    const result = AccountHealthSchema.parse(validData);
    expect(result.overallScore).toBe(72);
    expect(result.topCampaigns).toHaveLength(1);
  });

  it("rejects score out of range", () => {
    expect(() =>
      AccountHealthSchema.parse({ ...validData, overallScore: 150 })
    ).toThrow();
  });

  it("rejects invalid alert type", () => {
    expect(() =>
      AccountHealthSchema.parse({
        ...validData,
        alerts: [{ type: "invalid_type", severity: "high", message: "test" }],
      })
    ).toThrow();
  });
});

describe("CompetitorInsightSchema", () => {
  const validData = {
    competitors: [
      { name: "Rival Co", adCount: 25, topHooks: ["Save 50%"], formats: ["SINGLE_IMAGE"] },
    ],
    trends: [
      { trend: "UGC videos", relevance: "high", examples: ["example1"] },
    ],
    gaps: ["No Spanish-language ads"],
  };

  it("parses valid competitor insight", () => {
    const result = CompetitorInsightSchema.parse(validData);
    expect(result.competitors).toHaveLength(1);
    expect(result.gaps).toHaveLength(1);
  });

  it("rejects invalid relevance enum", () => {
    expect(() =>
      CompetitorInsightSchema.parse({
        ...validData,
        trends: [{ trend: "test", relevance: "invalid", examples: [] }],
      })
    ).toThrow();
  });
});

describe("AdCopyVariantSchema", () => {
  it("parses a valid ad copy variant", () => {
    const result = AdCopyVariantSchema.parse({
      headline: "Transform Your Skin",
      primaryText: "Clinically proven formula",
      cta: "Shop Now",
      hook: "What if it actually worked?",
      format: "SINGLE_IMAGE",
    });
    expect(result.headline).toBe("Transform Your Skin");
    expect(result.language).toBe("en"); // default
  });

  it("rejects invalid format enum", () => {
    expect(() =>
      AdCopyVariantSchema.parse({
        headline: "Test",
        primaryText: "Test",
        cta: "Buy",
        hook: "Hey",
        format: "INVALID_FORMAT",
      })
    ).toThrow();
  });

  it("accepts optional qualityScore within range", () => {
    const result = AdCopyVariantSchema.parse({
      headline: "Test",
      primaryText: "Test",
      cta: "Buy",
      hook: "Hey",
      format: "VIDEO",
      qualityScore: 8.5,
    });
    expect(result.qualityScore).toBe(8.5);
  });

  it("rejects qualityScore > 10", () => {
    expect(() =>
      AdCopyVariantSchema.parse({
        headline: "Test",
        primaryText: "Test",
        cta: "Buy",
        hook: "Hey",
        format: "VIDEO",
        qualityScore: 11,
      })
    ).toThrow();
  });
});

describe("AdCopyBatchSchema", () => {
  it("parses a valid batch with variants", () => {
    const result = AdCopyBatchSchema.parse({
      variants: [
        {
          headline: "Test",
          primaryText: "Body",
          cta: "Shop Now",
          hook: "Hook",
          format: "CAROUSEL",
        },
      ],
      generationReason: "Weekly refresh",
    });
    expect(result.variants).toHaveLength(1);
    expect(result.generationReason).toBe("Weekly refresh");
  });
});

describe("BudgetRecommendationSchema", () => {
  it("parses valid budget allocation", () => {
    const result = BudgetRecommendationSchema.parse({
      allocations: [
        {
          platform: "META",
          campaignName: "Prospecting",
          currentBudget: 500,
          recommendedBudget: 350,
          reason: "CPA increasing",
          expectedImpact: "Reduce waste by $150",
        },
      ],
      totalBudget: 1000,
      projectedRoas: 3.5,
    });
    expect(result.allocations).toHaveLength(1);
    expect(result.projectedRoas).toBe(3.5);
  });

  it("rejects invalid platform enum", () => {
    expect(() =>
      BudgetRecommendationSchema.parse({
        allocations: [
          {
            platform: "SNAPCHAT",
            campaignName: "Test",
            currentBudget: 100,
            recommendedBudget: 100,
            reason: "test",
            expectedImpact: "none",
          },
        ],
        totalBudget: 100,
        projectedRoas: 1,
      })
    ).toThrow();
  });
});

describe("StrategyReportSchema", () => {
  it("parses a valid strategy report", () => {
    const result = StrategyReportSchema.parse({
      healthScore: 72,
      summary: "Account performing well with room for optimization.",
      keyMetrics: {
        totalSpend: 12450,
        totalRevenue: 38900,
        overallRoas: 3.12,
        totalConversions: 508,
      },
      recommendations: [
        {
          priority: "high",
          category: "budget",
          title: "Shift to Google Shopping",
          description: "Google Shopping has 2x ROAS vs Meta prospecting",
          expectedImpact: "15-20% ROAS improvement",
        },
      ],
      testSuggestions: [
        {
          name: "UGC vs Studio",
          hypothesis: "UGC outperforms by 20% CTR",
          variant: "UGC-style video",
          expectedLift: "20%",
          priority: 8,
        },
      ],
    });
    expect(result.healthScore).toBe(72);
    expect(result.recommendations).toHaveLength(1);
  });

  it("rejects priority out of range in test suggestions", () => {
    expect(() =>
      StrategyReportSchema.parse({
        healthScore: 50,
        summary: "Test",
        keyMetrics: { totalSpend: 0, totalRevenue: 0, overallRoas: 0, totalConversions: 0 },
        recommendations: [],
        testSuggestions: [
          { name: "T", hypothesis: "H", variant: "V", expectedLift: "5%", priority: 15 },
        ],
      })
    ).toThrow();
  });
});
