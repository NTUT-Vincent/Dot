import { createCustomClient } from "../src/llm/custom";
import type { ChatMessage } from "../src/core/types";

const validDashboardJson = JSON.stringify({
  version: "0.1",
  title: "Custom Test",
  widgets: [{ type: "markdown", content: "Hello" }],
});

describe("createCustomClient", () => {
  it("returns a DotLLMClient with generateDashboard", () => {
    const client = createCustomClient(async () => validDashboardJson);
    expect(typeof client.generateDashboard).toBe("function");
  });

  it("calls the generate callback with the provided messages", async () => {
    const generate = jest.fn().mockResolvedValue(validDashboardJson);
    const client = createCustomClient(generate);

    const messages: ChatMessage[] = [
      { role: "system", content: "You are a dashboard generator." },
      { role: "user", content: "Show me a dashboard." },
    ];

    await client.generateDashboard({
      messages,
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(generate).toHaveBeenCalledWith(messages);
  });

  it("returns the jsonText produced by the generate callback", async () => {
    const client = createCustomClient(async () => validDashboardJson);

    const result = await client.generateDashboard({
      messages: [{ role: "user", content: "Show me data." }],
      dashboardSchema: {},
      constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
    });

    expect(result.jsonText).toBe(validDashboardJson);
  });

  it("propagates errors thrown by the generate callback", async () => {
    const client = createCustomClient(async () => {
      throw new Error("API error");
    });

    await expect(
      client.generateDashboard({
        messages: [{ role: "user", content: "Show me data." }],
        dashboardSchema: {},
        constraints: { maxWidgets: 6, maxRows: 200, jsonOnly: true },
      })
    ).rejects.toThrow("API error");
  });
});
