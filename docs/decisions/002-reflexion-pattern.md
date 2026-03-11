# ADR 002: Reflexion Pattern for Creative Quality Control

## Status
Accepted

## Context
The Creative Crew generates 10+ ad copy variants per run. LLM-generated ad copy varies widely in quality. We need a mechanism to ensure output meets a minimum quality bar before passing to the Strategy Crew.

### Options Considered
1. **Single-pass generation** — Generate once, hope for the best
2. **Temperature sampling** — Generate multiple batches, pick the best
3. **Reflexion (LLM-as-Judge)** — Separate evaluator scores output, loops back if below threshold

## Decision
Reflexion pattern with LLM-as-Judge: Copywriter (Sonnet) generates → Evaluator (Haiku) scores → loop back if below threshold, up to 3 iterations.

## Rationale

### Quality Gate
Without evaluation, ~30-40% of generated variants are mediocre (based on manual review). The reflexion loop catches these and gives the Copywriter specific feedback to improve on the next iteration.

### Cost Efficiency
Using Haiku (~10x cheaper per token than Sonnet) for evaluation means the quality gate adds minimal cost. Evaluation is a simpler task than generation — it doesn't require the full capability of a frontier model.

### Bounded Iterations
`MAX_ITERATIONS = 3` prevents infinite loops. If quality hasn't improved after 3 attempts, we accept the best available output. This bounds both latency and cost.

## Configuration
- `QUALITY_THRESHOLD = 6.5` (0-10 scale) — minimum average score to pass
- `MAX_ITERATIONS = 3` — maximum Copywriter ↔ Evaluator cycles

## Consequences
- These thresholds are educated guesses — should be calibrated against human evaluations
- Adds 1-2 additional LLM calls per run (Haiku evaluation + possible Sonnet re-generation)
- The Evaluator's scoring criteria may not perfectly align with actual ad performance
