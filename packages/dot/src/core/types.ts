// Widget specs
export type KPIWidgetSpec = {
  type: "kpi";
  title: string;
  items: Array<{ label: string; value: string | number; unit?: string }>;
};

export type TableWidgetSpec = {
  type: "table";
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string | number | boolean | null>>;
  maxRows?: number;
};

export type BarChartWidgetSpec = {
  type: "bar";
  title: string;
  xKey: string;
  yKey: string;
  data: Array<Record<string, string | number>>;
};

export type LineChartWidgetSpec = {
  type: "line";
  title: string;
  xKey: string;
  yKey: string;
  data: Array<Record<string, string | number>>;
};

export type MarkdownWidgetSpec = {
  type: "markdown";
  title?: string;
  content: string;
};

export type WidgetSpec =
  | KPIWidgetSpec
  | TableWidgetSpec
  | BarChartWidgetSpec
  | LineChartWidgetSpec
  | MarkdownWidgetSpec;

export type DashboardSpec = {
  version: "0.1";
  title?: string;
  layout?: { columns: 1 | 2; gap?: "sm" | "md" | "lg" };
  widgets: WidgetSpec[];
};

export type DotOptions = {
  maxBytes?: number;
  maxRows?: number;
  maxWidgets?: number;
  model?: { jsonOnly: true };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DotData = Record<string, unknown>;
