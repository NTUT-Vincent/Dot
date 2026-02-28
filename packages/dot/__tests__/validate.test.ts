import { validateDashboardSpec, parseDashboardSpec } from "../src/core/validate";

const validSpec = {
  version: "0.1",
  widgets: [
    {
      type: "kpi",
      title: "Summary",
      items: [{ label: "Count", value: 42 }],
    },
  ],
};

describe("validateDashboardSpec", () => {
  it("validates a valid dashboard spec", () => {
    expect(validateDashboardSpec(validSpec)).toBe(true);
  });

  it("fails when version is missing", () => {
    const bad = { widgets: [] };
    expect(validateDashboardSpec(bad)).toBe(false);
  });

  it("fails when version is wrong", () => {
    const bad = { version: "1.0", widgets: [] };
    expect(validateDashboardSpec(bad)).toBe(false);
  });

  it("fails when widgets is missing", () => {
    const bad = { version: "0.1" };
    expect(validateDashboardSpec(bad)).toBe(false);
  });

  it("fails with invalid widget type", () => {
    const bad = {
      version: "0.1",
      widgets: [{ type: "unknown", title: "test" }],
    };
    expect(validateDashboardSpec(bad)).toBe(false);
  });

  it("fails when layout.columns is invalid", () => {
    const bad = {
      version: "0.1",
      widgets: [],
      layout: { columns: 3 },
    };
    expect(validateDashboardSpec(bad)).toBe(false);
  });

  it("passes with valid layout", () => {
    const good = {
      version: "0.1",
      widgets: [],
      layout: { columns: 2 },
    };
    expect(validateDashboardSpec(good)).toBe(true);
  });

  it("validates table widget", () => {
    const spec = {
      version: "0.1",
      widgets: [{ type: "table", title: "T", columns: [{ key: "a", label: "A" }], rows: [] }],
    };
    expect(validateDashboardSpec(spec)).toBe(true);
  });

  it("validates bar/line chart widgets", () => {
    const spec = {
      version: "0.1",
      widgets: [{ type: "bar", title: "Chart", xKey: "x", yKey: "y", data: [] }],
    };
    expect(validateDashboardSpec(spec)).toBe(true);
  });

  it("validates markdown widget", () => {
    const spec = {
      version: "0.1",
      widgets: [{ type: "markdown", content: "Hello" }],
    };
    expect(validateDashboardSpec(spec)).toBe(true);
  });
});

describe("parseDashboardSpec", () => {
  it("parses valid JSON", () => {
    const result = parseDashboardSpec(JSON.stringify(validSpec));
    expect(result).not.toBeNull();
    expect(result!.version).toBe("0.1");
  });

  it("parses JSON from markdown code block", () => {
    const json = `\`\`\`json\n${JSON.stringify(validSpec)}\n\`\`\``;
    const result = parseDashboardSpec(json);
    expect(result).not.toBeNull();
    expect(result!.version).toBe("0.1");
  });

  it("parses JSON from unlabeled code block", () => {
    const json = `\`\`\`\n${JSON.stringify(validSpec)}\n\`\`\``;
    const result = parseDashboardSpec(json);
    expect(result).not.toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseDashboardSpec("not json at all")).toBeNull();
  });

  it("returns null for valid JSON that fails validation", () => {
    expect(parseDashboardSpec('{"version":"2.0","widgets":[]}')).toBeNull();
  });
});
