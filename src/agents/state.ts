import { Annotation } from "@langchain/langgraph";
import type {
  AccountHealth,
  CompetitorInsight,
  AdCopyBatch,
  BudgetRecommendation,
  StrategyReport,
} from "@/types";

/**
 * Shared state for the AdWing multi-agent pipeline.
 *
 * Built with LangGraph's Annotation API. Each field is a typed "channel" that
 * agents read from and write to. Channels use reducers to control how updates
 * merge — most use "last write wins" (`(_, next) => next`), while `errors` and
 * `executionResults` use append reducers (`(prev, next) => [...prev, ...next]`)
 * to accumulate values from multiple agents.
 *
 * Data flows unidirectionally through the pipeline:
 *   Input Context → Intelligence Crew → Creative Crew → Strategy Crew
 * Each crew reads upstream data and writes its own output channels.
 */
export const AdWingState = Annotation.Root({
  // ─── Input Context ───────────────────────────────────────────────────
  userId: Annotation<string>,
  storeId: Annotation<string | undefined>,
  adAccountIds: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  planTier: Annotation<"STARTER" | "GROWTH" | "SCALE">({
    reducer: (_, next) => next,
    default: () => "STARTER",
  }),

  // ─── Store Data ──────────────────────────────────────────────────────
  productCatalog: Annotation<
    Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      productType: string;
      tags: string[];
      imageUrl?: string;
    }>
  >({
    reducer: (_, next) => next,
    default: () => [],
  }),

  salesData: Annotation<
    Array<{
      productId: string;
      revenue: number;
      orders: number;
      period: string;
    }>
  >({
    reducer: (_, next) => next,
    default: () => [],
  }),

  // ─── Intelligence Crew Output ────────────────────────────────────────
  accountHealth: Annotation<AccountHealth | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  competitorInsight: Annotation<CompetitorInsight | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // ─── Creative Crew Output ───────────────────────────────────────────
  adCopyBatch: Annotation<AdCopyBatch | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  creativeIterations: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  // ─── Strategy Crew Output ──────────────────────────────────────────
  budgetRecommendation: Annotation<BudgetRecommendation | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  strategyReport: Annotation<StrategyReport | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // ─── Execution State ───────────────────────────────────────────────
  approvedActions: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  executionResults: Annotation<
    Array<{
      action: string;
      status: "success" | "failed";
      details: string;
    }>
  >({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  // ─── Pipeline Control ─────────────────────────────────────────────
  errors: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  currentCrew: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "intelligence",
  }),
});

export type AdWingStateType = typeof AdWingState.State;
