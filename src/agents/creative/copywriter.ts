import { sonnet } from "../llm";
import { AdCopyBatchSchema } from "@/types";
import type { AdWingStateType } from "../state";

/**
 * Copywriter Agent
 * Generates ad copy variants based on intelligence data and brand context.
 */
export async function copywriterNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { productCatalog, accountHealth, competitorInsight, adCopyBatch, creativeIterations } = state;

  // Build product context
  const products = productCatalog.slice(0, 10).map((p) => ({
    title: p.title,
    price: `$${p.price}`,
    type: p.productType,
    description: p.description?.slice(0, 200),
  }));

  // Build intelligence context
  const topHooks = competitorInsight?.competitors
    ?.flatMap((c) => c.topHooks)
    .slice(0, 10) ?? [];

  const trends = competitorInsight?.trends
    ?.map((t) => `${t.trend} (${t.relevance} relevance)`)
    .slice(0, 5) ?? [];

  const opportunities = accountHealth?.opportunities?.slice(0, 5) ?? [];

  // If this is a reflexion iteration, include previous feedback
  const previousAttempt = creativeIterations > 0 && adCopyBatch
    ? `\n## Previous Attempt (scored below threshold — improve these areas)
${adCopyBatch.variants.map((v) => `- "${v.headline}" (score: ${v.qualityScore}/10)`).join("\n")}
Focus on: stronger hooks, clearer value props, more emotional resonance.`
    : "";

  const prompt = `You are a world-class D2C advertising copywriter specializing in Shopify brands. Generate high-converting ad copy.

## Products to Advertise
${JSON.stringify(products, null, 2)}

## Competitive Intelligence
- Hooks working in this niche: ${topHooks.join("; ") || "N/A"}
- Current trends: ${trends.join("; ") || "N/A"}
- Untapped opportunities: ${opportunities.join("; ") || "N/A"}
${previousAttempt}

## Requirements
Generate 10 ad copy variants. For each:
1. **Headline**: Punchy, under 40 chars. Pattern-interrupt or curiosity-driven.
2. **Primary Text**: 2-4 sentences. Lead with benefit/pain point, social proof if relevant.
3. **Description**: Optional one-liner for link description.
4. **CTA**: Clear call-to-action (Shop Now, Get Yours, Learn More, etc.)
5. **Hook**: The first 3-5 words that stop the scroll.
6. **Format**: Best ad format for this copy (SINGLE_IMAGE, CAROUSEL, VIDEO, COLLECTION)
7. **Hypothesis**: What this variant is testing.
8. **Target Audience**: Who this is for.

Mix approaches: emotional, rational, urgency, social proof, curiosity, story-driven.

Return ONLY valid JSON with a "variants" array and "generationReason" string. No markdown.`;

  const response = await sonnet.invoke([
    {
      role: "system",
      content: "You are an expert D2C copywriter. Write compelling, conversion-focused ad copy. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    const content = typeof response.content === "string"
      ? response.content
      : response.content.map((c) => ("text" in c ? c.text : "")).join("");

    const parsed = JSON.parse(content);
    const batch = AdCopyBatchSchema.parse(parsed);

    return {
      adCopyBatch: batch,
      creativeIterations: creativeIterations + 1,
      currentCrew: "creative",
    };
  } catch (error) {
    return {
      errors: [`Copywriter failed: ${error}`],
      currentCrew: "creative",
    };
  }
}
