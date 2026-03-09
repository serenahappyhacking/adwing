import { sonnet } from "../llm";
import { CompetitorInsightSchema } from "@/types";
import type { AdWingStateType } from "../state";

/**
 * Market Scanner Agent
 * Scans competitor ads and market trends to surface intelligence.
 */
export async function marketScannerNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { productCatalog, accountHealth } = state;

  const niche = productCatalog.length > 0
    ? [...new Set(productCatalog.map((p) => p.productType).filter(Boolean))].join(", ")
    : "general e-commerce";

  const topProducts = productCatalog
    .slice(0, 5)
    .map((p) => p.title)
    .join(", ");

  const prompt = `You are a competitive intelligence analyst for D2C advertising. Analyze the competitive landscape for a Shopify store.

## Store Context
- Niche/Categories: ${niche}
- Top Products: ${topProducts || "Not available"}
- Account Health Score: ${accountHealth?.overallScore ?? "Not assessed yet"}
- Current Opportunities: ${accountHealth?.opportunities?.join("; ") ?? "None identified"}

## Your Task
Based on your knowledge of D2C advertising best practices and common patterns in the ${niche} niche, provide:

1. **Competitor Analysis**: Identify 3-5 likely competitor profiles with their typical ad strategies
   - Common hooks they use
   - Ad formats that work in this niche
   - Estimated spend levels

2. **Trend Analysis**: What's working NOW in this niche?
   - Current trending ad formats
   - Hook patterns that convert
   - Audience targeting strategies

3. **Gap Analysis**: Opportunities that competitors commonly miss

Return ONLY valid JSON matching the schema. No markdown.`;

  const response = await sonnet.invoke([
    { role: "system", content: "You are a competitive intelligence analyst. Always respond with valid JSON." },
    { role: "user", content: prompt },
  ]);

  try {
    const content = typeof response.content === "string"
      ? response.content
      : response.content.map((c) => ("text" in c ? c.text : "")).join("");

    const parsed = JSON.parse(content);
    const competitorInsight = CompetitorInsightSchema.parse(parsed);

    return { competitorInsight, currentCrew: "intelligence" };
  } catch (error) {
    return {
      errors: [`Market Scanner failed: ${error}`],
      competitorInsight: {
        competitors: [],
        trends: [],
        gaps: ["Unable to analyze — connect more data sources"],
      },
      currentCrew: "intelligence",
    };
  }
}
