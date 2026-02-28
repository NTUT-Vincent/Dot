import { sizeGuard } from "../src/core/sizeGuard";

describe("sizeGuard", () => {
  it("passes small data through unchanged", () => {
    const data = { items: [1, 2, 3], name: "test" };
    const result = sizeGuard(data, { maxBytes: 100_000, maxRows: 200 });
    expect(result.wasSampled).toBe(false);
    expect(result.data).toEqual(data);
    expect(result.dataProfile).toBeUndefined();
  });

  it("samples arrays over maxRows", () => {
    const items = Array.from({ length: 300 }, (_, i) => ({ id: i }));
    const result = sizeGuard({ items }, { maxBytes: 10_000_000, maxRows: 100 });
    expect(result.wasSampled).toBe(true);
    expect((result.data.items as unknown[]).length).toBe(100);
    expect(result.dataProfile).toBeDefined();
  });

  it("returns dataProfile when payload exceeds maxBytes", () => {
    const bigString = "x".repeat(1000);
    const items = Array.from({ length: 10 }, () => ({ value: bigString }));
    const result = sizeGuard({ items }, { maxBytes: 100, maxRows: 200 });
    expect(result.wasSampled).toBe(true);
    expect(result.data).toEqual({});
    expect(result.dataProfile).toBeDefined();
    expect(result.dataProfile!.fields.length).toBeGreaterThan(0);
  });

  it("preserves non-array data when within limits", () => {
    const data = { count: 5, label: "hello" };
    const result = sizeGuard(data, { maxBytes: 100_000, maxRows: 200 });
    expect(result.data.count).toBe(5);
    expect(result.data.label).toBe("hello");
  });
});
