import type { DotData } from "./types";

export interface FieldProfile {
  key: string;
  type: string;
  rowCount?: number;
  min?: number;
  max?: number;
  avg?: number;
  topCategories?: Array<{ value: string; count: number }>;
  sampleValues?: unknown[];
}

export interface DataProfile {
  fields: FieldProfile[];
  sampledRows?: Array<Record<string, unknown>>;
  note?: string;
}

function profileArray(arr: unknown[]): Partial<FieldProfile> {
  if (arr.length === 0) return { rowCount: 0 };
  const nums = arr.filter(v => typeof v === "number") as number[];
  if (nums.length > 0 && nums.length === arr.length) {
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      rowCount: arr.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: sum / nums.length,
    };
  }
  // categorical
  const counts: Record<string, number> = {};
  for (const v of arr) {
    const k = String(v);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => ({ value, count }));
  return { rowCount: arr.length, topCategories };
}

export function profile(data: DotData, sampled = false): DataProfile {
  const fields: FieldProfile[] = [];
  let sampledRows: Array<Record<string, unknown>> | undefined;

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      const fp: FieldProfile = { key, type: "array", ...profileArray(value) };
      fields.push(fp);
      // If array of objects, profile sub-fields and sample rows
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        sampledRows = value.slice(0, 3) as Array<Record<string, unknown>>;
      }
    } else {
      fields.push({ key, type: typeof value, sampleValues: [value] });
    }
  }

  return {
    fields,
    sampledRows,
    note: sampled ? "data is sampled, not full dataset" : undefined,
  };
}
