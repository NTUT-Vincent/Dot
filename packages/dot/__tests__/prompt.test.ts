import { buildSystemPrompt, buildUserPrompt, buildMessages } from "../src/core/prompt";

describe("buildSystemPrompt", () => {
  it("includes appDescription", () => {
    const result = buildSystemPrompt("My App", []);
    expect(result).toContain("My App");
  });

  it("includes descriptions when provided", () => {
    const result = buildSystemPrompt("My App", ["field1: user IDs", "field2: prices"]);
    expect(result).toContain("field1: user IDs");
    expect(result).toContain("field2: prices");
  });

  it("does not include description section when empty", () => {
    const result = buildSystemPrompt("My App", []);
    expect(result).not.toContain("Data field descriptions:");
  });
});

describe("buildUserPrompt", () => {
  it("includes data as JSON", () => {
    const data = { count: 5, items: ["a", "b"] };
    const result = buildUserPrompt(data);
    expect(result).toContain('"count": 5');
    expect(result).toContain('"items"');
  });

  it("uses profile summary when data is empty and profile provided", () => {
    const dataProfile = {
      fields: [{ key: "count", type: "number", sampleValues: [5] }],
    };
    const result = buildUserPrompt({}, dataProfile);
    expect(result).toContain("Data profile");
    expect(result).toContain("too large");
  });
});

describe("buildMessages", () => {
  it("starts with system message", () => {
    const msgs = buildMessages("App", [], { count: 1 });
    expect(msgs[0].role).toBe("system");
  });

  it("ends with user message", () => {
    const msgs = buildMessages("App", [], { count: 1 });
    expect(msgs[msgs.length - 1].role).toBe("user");
  });

  it("includes conversation history in middle", () => {
    const history = [
      { role: "user" as const, content: "hello" },
      { role: "assistant" as const, content: "hi" },
    ];
    const msgs = buildMessages("App", [], { count: 1 }, undefined, history);
    expect(msgs[1].content).toBe("hello");
    expect(msgs[2].content).toBe("hi");
  });

  it("has correct structure: system, history..., user", () => {
    const msgs = buildMessages("App", [], { x: 1 });
    expect(msgs.length).toBe(2);
    expect(msgs[0].role).toBe("system");
    expect(msgs[1].role).toBe("user");
  });
});
