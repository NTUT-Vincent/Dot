import { profile } from "../src/core/profile";

describe("profile", () => {
  it("gives min/max/avg for numeric arrays", () => {
    const result = profile({ nums: [1, 2, 3, 4, 5] });
    const field = result.fields.find(f => f.key === "nums")!;
    expect(field.min).toBe(1);
    expect(field.max).toBe(5);
    expect(field.avg).toBe(3);
    expect(field.rowCount).toBe(5);
  });

  it("gives top categories for string arrays", () => {
    const result = profile({ cats: ["a", "b", "a", "c", "a", "b"] });
    const field = result.fields.find(f => f.key === "cats")!;
    expect(field.topCategories).toBeDefined();
    const top = field.topCategories!;
    expect(top[0].value).toBe("a");
    expect(top[0].count).toBe(3);
  });

  it("samples rows for object arrays", () => {
    const rows = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Carol" },
      { id: 4, name: "Dave" },
    ];
    const result = profile({ users: rows });
    expect(result.sampledRows).toBeDefined();
    expect(result.sampledRows!.length).toBeLessThanOrEqual(3);
  });

  it("adds note when sampled=true", () => {
    const result = profile({ x: [1, 2] }, true);
    expect(result.note).toBe("data is sampled, not full dataset");
  });

  it("does not add note when sampled=false", () => {
    const result = profile({ x: [1, 2] }, false);
    expect(result.note).toBeUndefined();
  });

  it("profiles scalar fields with sampleValues", () => {
    const result = profile({ count: 42, name: "test" });
    const countField = result.fields.find(f => f.key === "count")!;
    expect(countField.type).toBe("number");
    expect(countField.sampleValues).toEqual([42]);
  });

  it("handles empty arrays", () => {
    const result = profile({ empty: [] });
    const field = result.fields.find(f => f.key === "empty")!;
    expect(field.rowCount).toBe(0);
  });
});
