import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdWingStateType } from "../state";

vi.mock("../llm", () => ({
  sonnet: {
    invoke: vi.fn(),
  },
  haiku: {
    invoke: vi.fn(),
  },
  extractTextContent: (response: { content: unknown }) => {
    if (typeof response.content === "string") return response.content;
    return (response.content as Array<{ text?: string }>)
      .map((b) => ("text" in b ? b.text : ""))
      .join("");
  },
}));

import { copywriterNode } from "../creative/copywriter";
import { sonnet } from "../llm";

const mockedSonnet = vi.mocked(sonnet);

function makeState(overrides: Partial<AdWingStateType> = {}): AdWingStateType {
  return {
    userId: "user-1",
    storeId: undefined,
    adAccountIds: [],
    planTier: "GROWTH",
    productCatalog: [
      {
        id: "p1",
        title: "Hydrating Serum",
        description: "A lightweight hydrating serum",
        price: 39,
        productType: "Skincare",
        tags: ["serum", "hydrating"],
      },
    ],
    salesData: [],
    accountHealth: null,
    competitorInsight: null,
    adCopyBatch: null,
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

describe("copywriterNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid LLM JSON response into AdCopyBatch", async () => {
    const mockResponse = {
      variants: [
        {
          headline: "Transform Your Skin",
          primaryText: "Our serum works in 7 days",
          cta: "Shop Now",
          hook: "What if skincare actually worked?",
          format: "SINGLE_IMAGE",
        },
      ],
      generationReason: "Initial generation",
    };

    mockedSonnet.invoke.mockResolvedValue({
      content: JSON.stringify(mockResponse),
    } as never);

    const result = await copywriterNode(makeState());
    expect(result.adCopyBatch).toBeDefined();
    expect(result.adCopyBatch?.variants).toHaveLength(1);
    expect(result.adCopyBatch?.variants[0].headline).toBe("Transform Your Skin");
    expect(result.creativeIterations).toBe(1);
  });

  it("increments creativeIterations on each call", async () => {
    mockedSonnet.invoke.mockResolvedValue({
      content: JSON.stringify({
        variants: [
          {
            headline: "V2",
            primaryText: "Improved",
            cta: "Buy",
            hook: "Better hook",
            format: "VIDEO",
          },
        ],
        generationReason: "Reflexion iteration",
      }),
    } as never);

    const result = await copywriterNode(makeState({ creativeIterations: 1 }));
    expect(result.creativeIterations).toBe(2);
  });

  it("returns error when LLM returns invalid JSON", async () => {
    mockedSonnet.invoke.mockResolvedValue({
      content: "Not valid JSON!!!",
    } as never);

    const result = await copywriterNode(makeState());
    expect(result.errors?.[0]).toMatch(/Copywriter failed/);
  });
});
