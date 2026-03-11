import { sonnet, extractTextContent } from "../llm";
import { StrategyReportSchema } from "@/types";
import type { AdWingStateType } from "../state";

/**
 * Strategy Reporter Agent
 * Synthesizes all intelligence into a weekly strategy report.
 */
export async function strategyReporterNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { accountHealth, competitorInsight, adCopyBatch, budgetRecommendation } = state;

  const prompt = `You are a senior advertising strategist. Produce a comprehensive weekly strategy report.

## Intelligence Summary
### Account Health
${accountHealth ? JSON.stringify(accountHealth, null, 2) : "No data"}

### Competitive Landscape
${competitorInsight ? JSON.stringify(competitorInsight, null, 2) : "No data"}

### New Creative
${adCopyBatch ? `${adCopyBatch.variants.length} variants generated. Top scores: ${adCopyBatch.variants.slice(0, 3).map(v => v.qualityScore).join(", ")}` : "No creatives"}

### Budget Recommendations
${budgetRecommendation ? JSON.stringify(budgetRecommendation, null, 2) : "No budget data"}

## Your Task
Create a strategy report with:
1. **Health Score** (0-100): Overall account health
2. **Summary**: 2-3 sentence executive summary
3. **Key Metrics**: totalSpend, totalRevenue, overallRoas, totalConversions
4. **Recommendations**: Prioritized list (high/medium/low) with categories (budget, creative, audience, campaign_structure)
5. **Test Suggestions**: A/B tests to run, with hypotheses and expected lift

Each recommendation should have:
- Priority level
- Category
- Clear title
- Actionable description
- Expected impact

Return ONLY valid JSON. No markdown.`;

  const response = await sonnet.invoke([
    {
      role: "system",
      content: "You are a senior advertising strategist. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    const content = extractTextContent(response);

    const parsed = JSON.parse(content);
    const strategyReport = StrategyReportSchema.parse(parsed);

    return { strategyReport, currentCrew: "strategy" };
  } catch (error) {
    return {
      errors: [`Strategy Reporter failed: ${error}`],
      currentCrew: "strategy",
    };
  }
}
