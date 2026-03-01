import type { DotLLMClient } from "./types";

/**
 * Minimal structural types for the Gemini SDK so that `createGeminiClient`
 * works without a hard dependency on `@google/generative-ai`.
 * Pass a real `GoogleGenerativeAI` instance and the types will match at runtime.
 */
export interface GeminiGenerativeModel {
  startChat(options: {
    history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
  }): {
    sendMessage(msg: string): Promise<{ response: { text(): string } }>;
  };
}

export interface GoogleGenerativeAILike {
  getGenerativeModel(options: {
    model: string;
    systemInstruction?: string;
  }): GeminiGenerativeModel;
}

/**
 * Creates a `DotLLMClient` backed by the Google Gemini API.
 *
 * @example
 * ```ts
 * import { GoogleGenerativeAI } from "@google/generative-ai";
 * import { createGeminiClient } from "dot";
 *
 * const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 * const llmClient = createGeminiClient(genAI, { model: "gemini-1.5-flash" });
 * ```
 *
 * @param genAI  A `GoogleGenerativeAI` instance (from `@google/generative-ai`).
 * @param options.model  Gemini model name. Defaults to `"gemini-1.5-flash"`.
 */
export function createGeminiClient(
  genAI: GoogleGenerativeAILike,
  options: { model?: string } = {}
): DotLLMClient {
  const modelName = options.model ?? "gemini-1.5-flash";

  return {
    async generateDashboard({ messages }) {
      // Separate the system instruction from the conversational messages.
      const systemMsg = messages.find((m) => m.role === "system");
      const chatMessages = messages.filter((m) => m.role !== "system");

      // The last message is the new user request; everything before it is history.
      const lastMessage = chatMessages[chatMessages.length - 1];
      const history = chatMessages.slice(0, -1);

      // Gemini uses "user" / "model" instead of "user" / "assistant".
      const geminiHistory = history.map((m) => ({
        role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
        parts: [{ text: m.content }],
      }));

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemMsg?.content,
      });

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(lastMessage.content);
      return { jsonText: result.response.text() };
    },
  };
}
