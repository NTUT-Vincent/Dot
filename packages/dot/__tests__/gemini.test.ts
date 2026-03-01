import { createGeminiClient } from "../src/llm/gemini";
import type { GoogleGenerativeAILike } from "../src/llm/gemini";

function makeGenAI(responseText: string): {
  genAI: GoogleGenerativeAILike;
  sendMessage: jest.Mock;
  getGenerativeModel: jest.Mock;
} {
  const sendMessage = jest.fn().mockResolvedValue({
    response: { text: () => responseText },
  });
  const startChat = jest.fn().mockReturnValue({ sendMessage });
  const getGenerativeModel = jest.fn().mockReturnValue({ startChat });
  const genAI: GoogleGenerativeAILike = { getGenerativeModel };
  return { genAI, sendMessage, getGenerativeModel };
}

const validDashboardJson = JSON.stringify({
  version: "0.1",
  title: "Test",
  widgets: [{ type: "markdown", content: "Hello" }],
});

describe("createGeminiClient", () => {
  it("returns a DotLLMClient with generateDashboard", () => {
    const { genAI } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);
    expect(typeof client.generateDashboard).toBe("function");
  });

  it("uses the default model name when none is provided", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [
        { role: "system", content: "You are a dashboard generator." },
        { role: "user", content: "Show me a dashboard." },
      ],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-1.5-flash" })
    );
  });

  it("uses a custom model name when provided", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI, { model: "gemini-1.5-pro" });

    await client.generateDashboard({
      messages: [{ role: "user", content: "Show me sales data." }],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-1.5-pro" })
    );
  });

  it("passes the system message as systemInstruction", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Show me a dashboard." },
      ],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ systemInstruction: "You are a helpful assistant." })
    );
  });

  it("does not include the system message in the chat history", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [
        { role: "system", content: "System prompt." },
        { role: "user", content: "Hello." },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "Show me a chart." },
      ],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    const modelInstance = getGenerativeModel.mock.results[0].value;
    expect(modelInstance.startChat).toHaveBeenCalledWith(
      expect.objectContaining({
        history: expect.not.arrayContaining([
          expect.objectContaining({ role: "system" }),
        ]),
      })
    );
  });

  it("converts 'assistant' role to 'model' for Gemini history", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [
        { role: "user", content: "First question." },
        { role: "assistant", content: "First answer." },
        { role: "user", content: "Second question." },
      ],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    const modelInstance = getGenerativeModel.mock.results[0].value;
    expect(modelInstance.startChat).toHaveBeenCalledWith({
      history: [
        { role: "user", parts: [{ text: "First question." }] },
        { role: "model", parts: [{ text: "First answer." }] },
      ],
    });
  });

  it("sends the last user message via sendMessage", async () => {
    const { genAI, getGenerativeModel, sendMessage } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [
        { role: "system", content: "System." },
        { role: "user", content: "Generate a dashboard now." },
      ],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(sendMessage).toHaveBeenCalledWith("Generate a dashboard now.");
  });

  it("returns jsonText from the Gemini response", async () => {
    const { genAI } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    const result = await client.generateDashboard({
      messages: [{ role: "user", content: "Show me a dashboard." }],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(result.jsonText).toBe(validDashboardJson);
  });

  it("works with no system message", async () => {
    const { genAI, getGenerativeModel } = makeGenAI(validDashboardJson);
    const client = createGeminiClient(genAI);

    await client.generateDashboard({
      messages: [{ role: "user", content: "Show me data." }],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ systemInstruction: undefined })
    );
  });
});
