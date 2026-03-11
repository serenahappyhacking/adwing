import type { AccountHealth, CompetitorInsight, AdCopyBatch, BudgetRecommendation, StrategyReport } from "./index";

/** Response from POST /api/agents/intelligence */
export interface IntelligenceResponse {
  runId: string;
  demo: boolean;
  accountHealth: AccountHealth;
  competitorInsight: CompetitorInsight;
}

/** Response from POST /api/agents/creative */
export interface CreativeResponse {
  runId: string;
  demo: boolean;
  adCopyBatch: AdCopyBatch;
}

/** Response from POST /api/agents/strategy */
export interface StrategyResponse {
  runId: string;
  demo: boolean;
  budgetRecommendation: BudgetRecommendation;
  strategyReport: StrategyReport;
}

/** Response from POST /api/agents/pipeline */
export interface PipelineResponse {
  runId: string;
  demo: boolean;
  accountHealth: AccountHealth;
  competitorInsight: CompetitorInsight;
  adCopyBatch: AdCopyBatch;
  budgetRecommendation: BudgetRecommendation;
  strategyReport: StrategyReport;
}

/** Union of all agent API responses */
export type AgentResponse =
  | IntelligenceResponse
  | CreativeResponse
  | StrategyResponse
  | PipelineResponse;

/** Error response from agent APIs */
export interface AgentErrorResponse {
  error: string;
  runId?: string;
}
