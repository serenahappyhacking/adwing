import { ChatAnthropic } from "@langchain/anthropic";

/** Sonnet for generation tasks — best quality-to-cost ratio */
export const sonnet = new ChatAnthropic({
  model: "claude-sonnet-4-20250514",
  temperature: 0.7,
  maxTokens: 4096,
});

/** Haiku for evaluation & lightweight tasks — fast and cheap */
export const haiku = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0.3,
  maxTokens: 2048,
});
