import { ChatAnthropic } from "@langchain/anthropic";
import type { AIMessage } from "@langchain/core/messages";

let _sonnet: ChatAnthropic | null = null;
let _haiku: ChatAnthropic | null = null;

/** Sonnet for generation tasks — best quality-to-cost ratio */
export const sonnet = new Proxy({} as ChatAnthropic, {
  get(_, prop) {
    if (!_sonnet) {
      _sonnet = new ChatAnthropic({
        model: "claude-sonnet-4-20250514",
        temperature: 0.7,
        maxTokens: 4096,
      });
    }
    return (_sonnet as unknown as Record<string, unknown>)[prop as string];
  },
});

/** Haiku for evaluation & lightweight tasks — fast and cheap */
export const haiku = new Proxy({} as ChatAnthropic, {
  get(_, prop) {
    if (!_haiku) {
      _haiku = new ChatAnthropic({
        model: "claude-haiku-4-5-20251001",
        temperature: 0.3,
        maxTokens: 2048,
      });
    }
    return (_haiku as unknown as Record<string, unknown>)[prop as string];
  },
});

/**
 * Extract text content from a LangChain AIMessage response.
 * Handles both string content and structured content block arrays.
 */
export function extractTextContent(response: AIMessage): string {
  if (typeof response.content === "string") {
    return response.content;
  }
  return response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("");
}
