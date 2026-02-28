import type { DashboardSpec, WidgetSpec } from "./types";

function isWidgetSpec(w: unknown): w is WidgetSpec {
  if (typeof w !== "object" || w === null) return false;
  const widget = w as Record<string, unknown>;
  const type = widget.type;

  if (type === "kpi") {
    return typeof widget.title === "string" && Array.isArray(widget.items);
  }
  if (type === "table") {
    return typeof widget.title === "string" && Array.isArray(widget.columns) && Array.isArray(widget.rows);
  }
  if (type === "bar" || type === "line") {
    return (
      typeof widget.title === "string" &&
      typeof widget.xKey === "string" &&
      typeof widget.yKey === "string" &&
      Array.isArray(widget.data)
    );
  }
  if (type === "markdown") {
    return typeof widget.content === "string";
  }
  return false;
}

export function validateDashboardSpec(obj: unknown): obj is DashboardSpec {
  if (typeof obj !== "object" || obj === null) return false;
  const spec = obj as Record<string, unknown>;
  if (spec.version !== "0.1") return false;
  if (!Array.isArray(spec.widgets)) return false;
  if (!spec.widgets.every(isWidgetSpec)) return false;
  if (spec.layout !== undefined) {
    const layout = spec.layout as Record<string, unknown>;
    if (layout.columns !== 1 && layout.columns !== 2) return false;
  }
  return true;
}

export function parseDashboardSpec(jsonText: string): DashboardSpec | null {
  try {
    // Extract JSON from possible markdown code blocks
    const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = match ? match[1] : jsonText;
    const parsed = JSON.parse(raw.trim());
    if (validateDashboardSpec(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
