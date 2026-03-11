import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdWingStateType } from "../state";

// Mock the LLM module before importing the evaluator
vi.mock("../llm", () => ({
  haiku: {
    invoke: vi.fn(),
  },
  sonnet: {
    invoke: vi.fn(),
  },
  extractTextContent: (response: { content: unknown }) => {
    if (typeof response.content === "string") return response.content;
    return (response.content as Array<{ text?: string }>)
      .map((b) => ("text" in b ? b.text : ""))
      .join("");
  },
}));

import { evaluatorNode } from "../creative/evaluator";
import { haiku } from "../llm";

const mockedHaiku = vi.mocked(haiku);

function makeState(overrides: Partial<AdWingStateType> = {}): AdWingStateType {
  return {
    userId: "user-1",
    storeId: undefined,
    adAccountIds: [],
    planTier: "GROWTH",
    productCatalog: [],
    salesData: [],
    accountHealth: null,
    competitorInsight: null,
    adCopyBatch: {
      variants: [
        {
          headline: "Test Ad",
          primaryText: "Buy now",
          cta: "Shop Now",
          hook: "Amazing deal",
          format: "SINGLE_IMAGE",
          language: "en",
        },
      ],
      generationReason: "Test",
    },
    creativeIterations: 0,
    budgetRecommendation: null,
    strategyReport: null,
    approvedActions: [],
    executionResults: [],
    errors: [],
    currentCrew: "creative",
    ...overrides,
  };
}

describe("evaluatorNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns creative_reflexion when score is below threshold (6.5)", async () => {
    mockedHaiku.invoke.mockResolvedValue({
      content: JSON.stringify([{ index: 0, score: 4.0, feedback: "Weak hook" }]),
    } as never);

    const result = await evaluatorNode(makeState({ creativeIterations: 0 }));
    expect(result.currentCrew).toBe("creative_reflexion");
  });

  it("passes through when score is above threshold", async () => {
    mockedHaiku.invoke.mockResolvedValue({
      content: JSON.stringify([{ index: 0, score: 8.0, feedback: "Great copy" }]),
    } as never);

    const result = await evaluatorNode(makeState({ creativeIterations: 0 }));
    expect(result.currentCrew).toBe("creative");
    expect(result.adCopyBatch?.variants[0].qualityScore).toBe(8.0);
  });

  it("forces pass when MAX_ITERATIONS (3) reached even with low score", async () => {
    mockedHaiku.invoke.mockResolvedValue({
      content: JSON.stringify([{ index: 0, score: 3.0, feedback: "Still weak" }]),
    } as never);

    const result = await evaluatorNode(makeState({ creativeIterations: 3 }));
    // Should NOT be creative_reflexion — max iterations forces pass
    expect(result.currentCrew).toBe("creative");
  });

  it("returns error when no ad copy batch exists", async () => {
    const result = await evaluatorNode(makeState({ adCopyBatch: null }));
    expect(result.errors).toContain("Evaluator: No ad copy to evaluate");
  });

  it("handles LLM returning invalid JSON gracefully", async () => {
    mockedHaiku.invoke.mockResolvedValue({
      content: "This is not JSON at all",
    } as never);

    const result = await evaluatorNode(makeState());
    expect(result.errors?.[0]).toMatch(/Evaluator failed/);
    expect(result.currentCrew).toBe("creative");
  });
});
