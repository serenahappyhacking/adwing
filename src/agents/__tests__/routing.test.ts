import { describe, it, expect, vi } from "vitest";
import type { AdWingStateType } from "../state";

// Mock the LLM module to avoid Anthropic API key requirement at import time
vi.mock("../llm", () => ({
  sonnet: { invoke: vi.fn() },
  haiku: { invoke: vi.fn() },
  extractTextContent: vi.fn(),
}));

import {
  routeAfterEvaluator,
  routeAfterAccountAnalyst,
  routeAfterBudgetOptimizer,
} from "../graph";

function makeState(overrides: Partial<AdWingStateType>): AdWingStateType {
  return {
    userId: "user-1",
    storeId: undefined,
    adAccountIds: [],
    planTier: "GROWTH",
    productCatalog: [],
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
    currentCrew: "intelligence",
    ...overrides,
  };
}

describe("routeAfterEvaluator", () => {
  it("routes back to copywriter when in creative_reflexion", () => {
    const state = makeState({ currentCrew: "creative_reflexion" });
    expect(routeAfterEvaluator(state)).toBe("copywriter");
  });

  it("routes to budget_optimizer when not in reflexion", () => {
    const state = makeState({ currentCrew: "creative" });
    expect(routeAfterEvaluator(state)).toBe("budget_optimizer");
  });
});

describe("routeAfterAccountAnalyst", () => {
  it("skips market_scanner for STARTER tier", () => {
    const state = makeState({ planTier: "STARTER" });
    expect(routeAfterAccountAnalyst(state)).toBe("copywriter");
  });

  it("goes to market_scanner for GROWTH tier", () => {
    const state = makeState({ planTier: "GROWTH" });
    expect(routeAfterAccountAnalyst(state)).toBe("market_scanner");
  });

  it("goes to market_scanner for SCALE tier", () => {
    const state = makeState({ planTier: "SCALE" });
    expect(routeAfterAccountAnalyst(state)).toBe("market_scanner");
  });
});

describe("routeAfterBudgetOptimizer", () => {
  it("skips strategy_reporter for STARTER tier (goes to END)", () => {
    const state = makeState({ planTier: "STARTER" });
    expect(routeAfterBudgetOptimizer(state)).toBe("__end__");
  });

  it("goes to strategy_reporter for GROWTH tier", () => {
    const state = makeState({ planTier: "GROWTH" });
    expect(routeAfterBudgetOptimizer(state)).toBe("strategy_reporter");
  });

  it("goes to strategy_reporter for SCALE tier", () => {
    const state = makeState({ planTier: "SCALE" });
    expect(routeAfterBudgetOptimizer(state)).toBe("strategy_reporter");
  });
});
