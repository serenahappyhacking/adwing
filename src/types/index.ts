import { z } from "zod";

// ─── Agent State Schemas ─────────────────────────────────────────────────────

export const AccountHealthSchema = z.object({
  overallScore: z.number().min(0).max(100),
  spendEfficiency: z.number().min(0).max(100),
  creativePerformance: z.number().min(0).max(100),
  audienceQuality: z.number().min(0).max(100),
  topCampaigns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      roas: z.number(),
      spend: z.number(),
      status: z.string(),
    })
  ),
  wastedSpend: z.number(),
  opportunities: z.array(z.string()),
  alerts: z.array(
    z.object({
      type: z.enum(["spend_spike", "roas_drop", "audience_fatigue", "budget_cap"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      message: z.string(),
      campaignId: z.string().optional(),
    })
  ),
});

export const CompetitorInsightSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      adCount: z.number(),
      topHooks: z.array(z.string()),
      formats: z.array(z.string()),
      estimatedSpend: z.string().optional(),
      landingPageUrl: z.string().optional(),
    })
  ),
  trends: z.array(
    z.object({
      trend: z.string(),
      relevance: z.enum(["high", "medium", "low"]),
      examples: z.array(z.string()),
    })
  ),
  gaps: z.array(z.string()),
});

export const AdCopyVariantSchema = z.object({
  headline: z.string(),
  primaryText: z.string(),
  description: z.string().optional(),
  cta: z.string(),
  hook: z.string(),
  format: z.enum(["SINGLE_IMAGE", "CAROUSEL", "VIDEO", "COLLECTION"]),
  language: z.string().default("en"),
  qualityScore: z.number().min(0).max(10).optional(),
  hypothesis: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const AdCopyBatchSchema = z.object({
  variants: z.array(AdCopyVariantSchema),
  brandVoiceNotes: z.string().optional(),
  generationReason: z.string(),
});

export const BudgetRecommendationSchema = z.object({
  allocations: z.array(
    z.object({
      platform: z.enum(["META", "GOOGLE", "TIKTOK"]),
      campaignId: z.string().optional(),
      campaignName: z.string(),
      currentBudget: z.number(),
      recommendedBudget: z.number(),
      reason: z.string(),
      expectedImpact: z.string(),
    })
  ),
  totalBudget: z.number(),
  projectedRoas: z.number(),
});

export const StrategyReportSchema = z.object({
  healthScore: z.number(),
  summary: z.string(),
  keyMetrics: z.object({
    totalSpend: z.number(),
    totalRevenue: z.number(),
    overallRoas: z.number(),
    totalConversions: z.number(),
  }),
  recommendations: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      category: z.enum(["budget", "creative", "audience", "campaign_structure"]),
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
    })
  ),
  testSuggestions: z.array(
    z.object({
      name: z.string(),
      hypothesis: z.string(),
      variant: z.string(),
      expectedLift: z.string(),
      priority: z.number().min(1).max(10),
    })
  ),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type AccountHealth = z.infer<typeof AccountHealthSchema>;
export type CompetitorInsight = z.infer<typeof CompetitorInsightSchema>;
export type AdCopyVariant = z.infer<typeof AdCopyVariantSchema>;
export type AdCopyBatch = z.infer<typeof AdCopyBatchSchema>;
export type BudgetRecommendation = z.infer<typeof BudgetRecommendationSchema>;
export type StrategyReport = z.infer<typeof StrategyReportSchema>;

// ─── NextAuth type augmentation ──────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
