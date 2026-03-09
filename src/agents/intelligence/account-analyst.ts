import { sonnet } from "../llm";
import { AccountHealthSchema } from "@/types";
import type { AdWingStateType } from "../state";

/**
 * Account Analyst Agent
 * Analyzes ad account data and Shopify store data to produce a performance baseline.
 */
export async function accountAnalystNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { productCatalog, salesData, adAccountIds } = state;

  // Build context from available data
  const productSummary = productCatalog
    .slice(0, 20)
    .map((p) => `- ${p.title} ($${p.price}) [${p.productType}] tags: ${p.tags.join(", ")}`)
    .join("\n");

  const salesSummary = salesData
    .slice(0, 50)
    .map((s) => `- Product ${s.productId}: $${s.revenue} revenue, ${s.orders} orders (${s.period})`)
    .join("\n");

  const prompt = `You are an expert digital advertising analyst. Analyze the following Shopify store and ad account data to produce a comprehensive account health assessment.

## Store Products (top 20)
${productSummary || "No product data available yet."}

## Recent Sales Data
${salesSummary || "No sales data available yet."}

## Connected Ad Accounts
${adAccountIds.length} ad account(s) connected.

## Your Task
Produce a JSON account health assessment with:
1. Overall health score (0-100)
2. Spend efficiency score (0-100)
3. Creative performance score (0-100)
4. Audience quality score (0-100)
5. Top performing campaigns (if data available)
6. Estimated wasted spend
7. Key opportunities for improvement
8. Active alerts (spend spikes, ROAS drops, audience fatigue)

If limited data is available, provide initial estimates based on store profile and note that more data is needed.

Return ONLY valid JSON matching the schema. No markdown, no explanation.`;

  const response = await sonnet.invoke([
    { role: "system", content: "You are an advertising data analyst. Always respond with valid JSON." },
    { role: "user", content: prompt },
  ]);

  try {
    const content = typeof response.content === "string"
      ? response.content
      : response.content.map((c) => ("text" in c ? c.text : "")).join("");

    const parsed = JSON.parse(content);
    const accountHealth = AccountHealthSchema.parse(parsed);

    return {
      accountHealth,
      currentCrew: "intelligence",
    };
  } catch (error) {
    return {
      errors: [`Account Analyst failed to parse response: ${error}`],
      accountHealth: {
        overallScore: 50,
        spendEfficiency: 50,
        creativePerformance: 50,
        audienceQuality: 50,
        topCampaigns: [],
        wastedSpend: 0,
        opportunities: ["Connect ad accounts to get detailed analysis"],
        alerts: [],
      },
      currentCrew: "intelligence",
    };
  }
}
