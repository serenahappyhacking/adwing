# ADR 003: Dual-Model Strategy (Sonnet + Haiku)

## Status
Accepted

## Context
The pipeline has 6 agent nodes making LLM calls. Not all tasks require the same model capability. We need to balance output quality against token cost and latency.

## Decision
Use two Claude models with distinct roles:
- **Claude Sonnet** (`temperature: 0.7`): All generation tasks — account analysis, market scanning, copywriting, budget optimization, strategy reporting
- **Claude Haiku** (`temperature: 0.3`): Evaluation only — scoring ad copy quality

## Rationale

### Cost Analysis
Approximate per-run token usage (single pipeline execution):

| Agent | Model | Input ~tokens | Output ~tokens |
|-------|-------|--------------|----------------|
| Account Analyst | Sonnet | 2,000 | 1,500 |
| Market Scanner | Sonnet | 1,500 | 2,000 |
| Copywriter | Sonnet | 2,500 | 3,000 |
| **Evaluator** | **Haiku** | **2,000** | **1,000** |
| Budget Optimizer | Sonnet | 3,000 | 1,500 |
| Strategy Reporter | Sonnet | 4,000 | 2,000 |

Using Haiku for evaluation saves ~10x on that node's cost. With reflexion (up to 3 evaluation calls per run), this adds up meaningfully.

### Temperature Choice
- **Sonnet at 0.7**: Generation tasks benefit from creativity and variation. Higher temperature produces more diverse ad copy and more nuanced strategy recommendations.
- **Haiku at 0.3**: Evaluation should be consistent and deterministic. Lower temperature reduces variance in quality scores between identical inputs.

### Why Not Haiku for All Lightweight Tasks?
We considered using Haiku for Account Analyst and Budget Optimizer (which are more analytical than creative). However, these tasks require nuanced reasoning about business strategy that Haiku handles less reliably. The cost difference is small compared to the quality risk.

## Consequences
- Model updates (new Sonnet/Haiku versions) require updating `src/agents/llm.ts`
- If Claude introduces a mid-tier model, some agents could be migrated for cost savings
- The dual-model approach makes the codebase slightly more complex than a single-model setup
