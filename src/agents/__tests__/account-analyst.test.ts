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

import { accountAnalystNode } from "../intelligence/account-analyst";
import { sonnet } from "../llm";

const mockedSonnet = vi.mocked(sonnet);

function makeState(overrides: Partial<AdWingStateType> = {}): AdWingStateType {
  return {
    userId: "user-1",
    storeId: "store-1",
    adAccountIds: ["ad-1"],
    planTier: "GROWTH",
    productCatalog: [
      {
        id: "p1",
        title: "Moisturizer",
        description: "Daily moisturizer",
        price: 29,
        productType: "Skincare",
        tags: ["moisturizer"],
      },
    ],
    salesData: [
      { productId: "p1", revenue: 5000, orders: 200, period: "2026-02" },
    ],
    accountHealth: null,
    competitorInsight: null,
    adCopyBatch: null,
    creativeIterations: 0,
    budgetRecommendation: null,
    strategyReport: null,
    approvedActions: [],
    executionResults: [],
    errors: [],
    currentCrew: "intelligence",
    ...overrides,
  };
}

describe("accountAnalystNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid LLM response into AccountHealth", async () => {
    const mockHealth = {
      overallScore: 72,
      spendEfficiency: 68,
      creativePerformance: 75,
      audienceQuality: 70,
      topCampaigns: [],
      wastedSpend: 500,
      opportunities: ["Scale Google Shopping"],
      alerts: [],
    };

    mockedSonnet.invoke.mockResolvedValue({
      content: JSON.stringify(mockHealth),
    } as never);

    const result = await accountAnalystNode(makeState());
    expect(result.accountHealth).toBeDefined();
    expect(result.accountHealth?.overallScore).toBe(72);
    expect(result.currentCrew).toBe("intelligence");
  });

  it("returns fallback data when LLM returns invalid JSON", async () => {
    mockedSonnet.invoke.mockResolvedValue({
      content: "Sorry, I cannot process this request.",
    } as never);

    const result = await accountAnalystNode(makeState());
    // Should return fallback with score 50
    expect(result.accountHealth?.overallScore).toBe(50);
    expect(result.errors?.[0]).toMatch(/Account Analyst failed/);
  });

  it("includes fallback opportunity message", async () => {
    mockedSonnet.invoke.mockResolvedValue({
      content: "{invalid",
    } as never);

    const result = await accountAnalystNode(makeState());
    expect(result.accountHealth?.opportunities).toContain(
      "Connect ad accounts to get detailed analysis"
    );
  });
});
