import type { DotData } from "./types";
import { profile } from "./profile";

export interface SizeGuardOptions {
  maxBytes: number;
  maxRows: number;
}

export interface SizeGuardResult {
  data: DotData;
  wasSampled: boolean;
  dataProfile?: ReturnType<typeof profile>;
}

function sampleArray<T>(arr: T[], maxRows: number): T[] {
  if (arr.length <= maxRows) return arr;
  const headCount = Math.floor(maxRows / 2);
  const head = arr.slice(0, headCount);
  const remaining = arr.slice(headCount);
  const randomCount = maxRows - headCount;
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  return [...head, ...shuffled.slice(0, randomCount)];
}

export function sizeGuard(
  data: DotData,
  options: SizeGuardOptions
): SizeGuardResult {
  const { maxBytes, maxRows } = options;
  let wasSampled = false;

  // Sample arrays
  const guarded: DotData = { ...data };
  for (const [key, value] of Object.entries(guarded)) {
    if (Array.isArray(value) && value.length > maxRows) {
      guarded[key] = sampleArray(value, maxRows);
      wasSampled = true;
    }
  }

  // Check byte size
  const serialized = JSON.stringify(guarded);
  if (serialized.length > maxBytes) {
    // Return data profile summary instead
    const dataProfile = profile(guarded, true);
    return { data: {}, wasSampled: true, dataProfile };
  }

  return { data: guarded, wasSampled, dataProfile: wasSampled ? profile(guarded, true) : undefined };
}
