import { haiku } from "../llm";
import type { AdWingStateType } from "../state";

const QUALITY_THRESHOLD = 6.5;
const MAX_ITERATIONS = 3;

/**
 * Evaluator Agent (Reflexion)
 * Scores ad copy quality using LLM-as-a-judge pattern.
 * Returns copy to Copywriter if below threshold.
 */
export async function evaluatorNode(
  state: AdWingStateType
): Promise<Partial<AdWingStateType>> {
  const { adCopyBatch, creativeIterations } = state;

  if (!adCopyBatch || adCopyBatch.variants.length === 0) {
    return { errors: ["Evaluator: No ad copy to evaluate"] };
  }

  const prompt = `You are an expert ad copy evaluator. Score each ad variant on a scale of 0-10.

## Scoring Criteria
- **Hook Power** (0-10): Does the first line stop the scroll?
- **Value Clarity** (0-10): Is the benefit immediately clear?
- **Emotional Resonance** (0-10): Does it connect emotionally?
- **CTA Strength** (0-10): Is the call-to-action compelling?
- **Uniqueness** (0-10): Does it stand out from typical ads?

## Ad Variants to Evaluate
${adCopyBatch.variants.map((v, i) => `
### Variant ${i + 1}
- Headline: ${v.headline}
- Hook: ${v.hook}
- Primary Text: ${v.primaryText}
- CTA: ${v.cta}
- Format: ${v.format}
`).join("\n")}

For each variant, provide an overall score (average of criteria, 0-10).

Return ONLY a JSON array of objects: [{"index": 0, "score": 7.5, "feedback": "..."}]
No markdown, no explanation.`;

  const response = await haiku.invoke([
    {
      role: "system",
      content: "You are an advertising quality evaluator. Always respond with valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  try {
    const content = typeof response.content === "string"
      ? response.content
      : response.content.map((c) => ("text" in c ? c.text : "")).join("");

    const scores: Array<{ index: number; score: number; feedback: string }> =
      JSON.parse(content);

    // Apply scores to variants
    const scoredVariants = adCopyBatch.variants.map((variant, i) => {
      const scoreEntry = scores.find((s) => s.index === i);
      return {
        ...variant,
        qualityScore: scoreEntry?.score ?? 5,
      };
    });

    const avgScore =
      scoredVariants.reduce((sum, v) => sum + (v.qualityScore ?? 0), 0) /
      scoredVariants.length;

    const updatedBatch = { ...adCopyBatch, variants: scoredVariants };

    // Reflexion: if below threshold and haven't exceeded max iterations, go back to copywriter
    if (avgScore < QUALITY_THRESHOLD && creativeIterations < MAX_ITERATIONS) {
      return {
        adCopyBatch: updatedBatch,
        currentCrew: "creative_reflexion",
      };
    }

    // Filter to only variants above threshold
    const approvedVariants = scoredVariants.filter(
      (v) => (v.qualityScore ?? 0) >= QUALITY_THRESHOLD - 1
    );

    return {
      adCopyBatch: {
        ...updatedBatch,
        variants: approvedVariants.length > 0 ? approvedVariants : scoredVariants,
      },
      currentCrew: "creative",
    };
  } catch (error) {
    return {
      errors: [`Evaluator failed: ${error}`],
      currentCrew: "creative",
    };
  }
}
