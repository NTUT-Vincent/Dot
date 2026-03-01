import type { DotLLMClient } from "./types";
import type { ChatMessage } from "../core/types";

/**
 * Creates a `DotLLMClient` backed by any custom LLM API.
 *
 * Pass a `generate` callback that receives the array of `ChatMessage`s and
 * returns the raw JSON text for the dashboard spec.  This lets you call
 * OpenAI, Anthropic, Ollama, or any other LLM without having to implement
 * the full `DotLLMClient` interface by hand.
 *
 * @example
 * ```ts
 * import { createCustomClient } from "dot";
 *
 * const llmClient = createCustomClient(async (messages) => {
 *   const res = await fetch("/api/ai/dashboard", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ messages }),
 *   });
 *   const { jsonText } = await res.json();
 *   return jsonText;
 * });
 * ```
 *
 * @param generate  A function that receives the chat messages and returns the
 *                  raw dashboard-spec JSON string produced by your LLM.
 */
export function createCustomClient(
  generate: (messages: ChatMessage[]) => Promise<string>
): DotLLMClient {
  return {
    async generateDashboard({ messages }) {
      const jsonText = await generate(messages);
      return { jsonText };
    },
  };
}
