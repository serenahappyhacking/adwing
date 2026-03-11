# ADR 001: LangGraph.js Over CrewAI / Simple Chains

## Status
Accepted

## Context
We need an orchestration framework for a multi-agent advertising pipeline with 6 agents organized into 3 crews. The agents have genuine interdependencies: conditional routing based on subscription tier, and a cyclic reflexion loop between Copywriter and Evaluator.

### Options Considered
1. **CrewAI** — Python-first, sequential/hierarchical crew patterns
2. **LangChain Sequential Chain** — Simple linear chains
3. **LangGraph.js** — State machine with conditional edges and cycles

## Decision
LangGraph.js.

## Rationale

### 1. Cyclic Graphs
The Creative Crew uses a reflexion pattern: Copywriter → Evaluator → (if score < threshold) → back to Copywriter. This is a cycle — it cannot be represented as a DAG. LangGraph natively supports cycles via conditional edges. CrewAI's hierarchical mode and LangChain chains cannot express this without workarounds.

### 2. Conditional Routing
Different subscription tiers skip different nodes:
- STARTER: skips Market Scanner and Strategy Reporter
- GROWTH/SCALE: full pipeline

LangGraph's `addConditionalEdges` makes this a first-class concept. In a sequential chain, you'd need manual if/else logic breaking the chain abstraction.

### 3. TypeScript Type Safety
LangGraph.js with the `Annotation` API provides full TypeScript typing for shared state channels. Each agent's input/output is type-checked at compile time. CrewAI is Python-only; the JS port is immature.

### 4. Shared State with Reducers
LangGraph's `Annotation.Root` with per-channel reducers gives precise control over how agent outputs merge. `errors` uses an append reducer while `accountHealth` uses last-write-wins. This is more explicit than passing data through function arguments.

## Consequences
- LangGraph is a relatively new library — API may change
- Debugging graph execution requires understanding the state machine model
- Testing routing functions is straightforward since they're pure functions of state
