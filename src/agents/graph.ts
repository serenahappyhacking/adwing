import { StateGraph, END } from "@langchain/langgraph";
import { AdWingState, type AdWingStateType } from "./state";
import { accountAnalystNode } from "./intelligence/account-analyst";
import { marketScannerNode } from "./intelligence/market-scanner";
import { copywriterNode } from "./creative/copywriter";
import { evaluatorNode } from "./creative/evaluator";
import { budgetOptimizerNode } from "./strategy/budget-optimizer";
import { strategyReporterNode } from "./strategy/strategy-reporter";

/**
 * Route after evaluator: reflexion loop or continue to strategy.
 */
function routeAfterEvaluator(state: AdWingStateType): string {
  if (state.currentCrew === "creative_reflexion") {
    return "copywriter"; // Go back for another iteration
  }
  return "budget_optimizer"; // Proceed to strategy
}

/**
 * Route after intelligence: skip competitor scan for Starter tier.
 */
function routeAfterAccountAnalyst(state: AdWingStateType): string {
  if (state.planTier === "STARTER") {
    return "copywriter"; // Skip competitor scan
  }
  return "market_scanner";
}

/**
 * Route after budget optimizer: skip strategy report for Starter tier.
 */
function routeAfterBudgetOptimizer(state: AdWingStateType): string {
  if (state.planTier === "STARTER") {
    return END;
  }
  return "strategy_reporter";
}

/**
 * Build the main AdWing multi-agent graph.
 *
 * Pipeline: Intelligence -> Creative (with reflexion) -> Strategy
 *
 *   account_analyst -> [market_scanner] -> copywriter <-> evaluator -> budget_optimizer -> [strategy_reporter]
 */
export function buildAdWingGraph() {
  const graph = new StateGraph(AdWingState)
    // ─── Intelligence Crew ─────────────────────────────────────────
    .addNode("account_analyst", accountAnalystNode)
    .addNode("market_scanner", marketScannerNode)
    // ─── Creative Crew ─────────────────────────────────────────────
    .addNode("copywriter", copywriterNode)
    .addNode("evaluator", evaluatorNode)
    // ─── Strategy Crew ─────────────────────────────────────────────
    .addNode("budget_optimizer", budgetOptimizerNode)
    .addNode("strategy_reporter", strategyReporterNode)

    // ─── Edges ─────────────────────────────────────────────────────
    .addEdge("__start__", "account_analyst")
    .addConditionalEdges("account_analyst", routeAfterAccountAnalyst, [
      "market_scanner",
      "copywriter",
    ])
    .addEdge("market_scanner", "copywriter")
    .addEdge("copywriter", "evaluator")
    .addConditionalEdges("evaluator", routeAfterEvaluator, [
      "copywriter",
      "budget_optimizer",
    ])
    .addConditionalEdges("budget_optimizer", routeAfterBudgetOptimizer, [
      "strategy_reporter",
      END,
    ])
    .addEdge("strategy_reporter", END);

  return graph.compile();
}

/**
 * Build a lightweight graph for just the Intelligence crew.
 */
export function buildIntelligenceGraph() {
  const graph = new StateGraph(AdWingState)
    .addNode("account_analyst", accountAnalystNode)
    .addNode("market_scanner", marketScannerNode)
    .addEdge("__start__", "account_analyst")
    .addEdge("account_analyst", "market_scanner")
    .addEdge("market_scanner", END);

  return graph.compile();
}

/**
 * Build a lightweight graph for just the Creative crew (with reflexion).
 */
export function buildCreativeGraph() {
  const graph = new StateGraph(AdWingState)
    .addNode("copywriter", copywriterNode)
    .addNode("evaluator", evaluatorNode)
    .addEdge("__start__", "copywriter")
    .addEdge("copywriter", "evaluator")
    .addConditionalEdges("evaluator", routeAfterEvaluator, [
      "copywriter",
      END,
    ])

  return graph.compile();
}

/**
 * Build a lightweight graph for just the Strategy crew.
 */
export function buildStrategyGraph() {
  const graph = new StateGraph(AdWingState)
    .addNode("budget_optimizer", budgetOptimizerNode)
    .addNode("strategy_reporter", strategyReporterNode)
    .addEdge("__start__", "budget_optimizer")
    .addEdge("budget_optimizer", "strategy_reporter")
    .addEdge("strategy_reporter", END);

  return graph.compile();
}
