export function sanitize(data: unknown, seen = new Set<object>()): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === "function") return undefined;
  if (typeof data === "symbol") return undefined;
  if (typeof data === "bigint") return data.toString();
  if (data instanceof Date) return data.toISOString();
  if (data instanceof Map) {
    const obj: Record<string, unknown> = {};
    data.forEach((v, k) => { obj[String(k)] = sanitize(v, seen); });
    return obj;
  }
  if (data instanceof Set) {
    return Array.from(data).map(v => sanitize(v, seen));
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item, seen));
  }
  if (typeof data === "object") {
    // Check if it's a React element - skip it (works for both plain and class instances)
    if (typeof (data as Record<string, unknown>).$$typeof !== "undefined") return undefined;
    if (seen.has(data as object)) return "[Circular]";
    seen.add(data as object);
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const sanitized = sanitize(value, seen);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    }
    seen.delete(data as object);
    return result;
  }
  return data;
}
