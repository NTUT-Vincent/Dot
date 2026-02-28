import { sanitize } from "../src/core/sanitize";

describe("sanitize", () => {
  it("removes functions", () => {
    const result = sanitize({ fn: () => {}, value: 42 });
    expect(result).toEqual({ value: 42 });
  });

  it("converts Date to ISO string", () => {
    const d = new Date("2024-01-01T00:00:00.000Z");
    expect(sanitize(d)).toBe("2024-01-01T00:00:00.000Z");
  });

  it("handles circular references", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    const result = sanitize(obj) as Record<string, unknown>;
    expect(result.a).toBe(1);
    expect(result.self).toBe("[Circular]");
  });

  it("converts Map to plain object", () => {
    const map = new Map<string, unknown>([["key1", "val1"], ["key2", 2]]);
    expect(sanitize(map)).toEqual({ key1: "val1", key2: 2 });
  });

  it("converts Set to array", () => {
    const set = new Set([1, 2, 3]);
    expect(sanitize(set)).toEqual([1, 2, 3]);
  });

  it("removes React elements ($$typeof)", () => {
    const reactLike = { $$typeof: Symbol.for("react.element"), type: "div", props: {} };
    expect(sanitize(reactLike)).toBeUndefined();
  });

  it("passes null through", () => {
    expect(sanitize(null)).toBeNull();
  });

  it("passes undefined through", () => {
    expect(sanitize(undefined)).toBeUndefined();
  });

  it("converts bigint to string", () => {
    expect(sanitize(BigInt("9007199254740993"))).toBe("9007199254740993");
  });

  it("removes symbol values", () => {
    const result = sanitize({ s: Symbol("test"), n: 1 });
    expect(result).toEqual({ n: 1 });
  });

  it("handles nested arrays", () => {
    expect(sanitize([1, [2, 3]])).toEqual([1, [2, 3]]);
  });
});
