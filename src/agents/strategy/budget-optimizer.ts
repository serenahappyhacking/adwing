import { sonnet } from "../llm";
import { BudgetRecommendationSchema } from "@/types";
import type { AdWingStateType } from "../state";

/**
 * Budget Optimizer Agent
 * Recommends budget allocation across platforms and campaigns.
 */
export async function budgetOptimizerNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { accountHealth, competitorInsight, adCopyBatch } = state;

  const prompt = `You are a D2C advertising budget strategist. Create optimal budget allocation recommendations.

## Account Performance
${accountHealth ? JSON.stringify({
  healthScore: accountHealth.overallScore,
  spendEfficiency: accountHealth.spendEfficiency,
  topCampaigns: accountHealth.topCampaigns,
  wastedSpend: accountHealth.wastedSpend,
  opportunities: accountHealth.opportunities,
}, null, 2) : "No account data available."}

## Market Intelligence
${competitorInsight ? JSON.stringify({
  competitorCount: competitorInsight.competitors.length,
  topTrends: competitorInsight.trends.slice(0, 3),
  gaps: competitorInsight.gaps,
}, null, 2) : "No competitive data available."}

## New Creative Available
${adCopyBatch ? `${adCopyBatch.variants.length} new ad variants ready for deployment.` : "No new creatives."}

## Your Task
Recommend budget allocations that maximize ROAS:
1. Allocations per platform/campaign with current vs. recommended budget
2. Clear reasoning for each change
3. Expected impact of the reallocation
4. Total budget and projected ROAS

Principles:
- Shift budget FROM low-performing campaigns TO high-performers
- Reserve 15-20% of budget for testing new creatives
- Never recommend more than 30% budget increase per campaign per week
- Include a "test budget" line item for new ad variants

Return ONLY valid JSON. No markdown.`;

  const response = await sonnet.invoke([
    {
      role: "system",
      content: "You are a budget optimization specialist. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    const content = typeof response.content === "string"
      ? response.content
      : response.content.map((c) => ("text" in c ? c.text : "")).join("");

    const parsed = JSON.parse(content);
    const budgetRecommendation = BudgetRecommendationSchema.parse(parsed);

    return { budgetRecommendation, currentCrew: "strategy" };
  } catch (error) {
    return {
      errors: [`Budget Optimizer failed: ${error}`],
      currentCrew: "strategy",
    };
  }
}
