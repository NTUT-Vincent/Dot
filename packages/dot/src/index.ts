export { Dot } from "./react/Dot";
export { DotProvider } from "./react/DotProvider";
export { useDotData } from "./react/hooks/useDotData";
export { useDataDescription } from "./react/hooks/useDataDescription";
export type { DotLLMClient } from "./llm/types";
export { createGeminiClient } from "./llm/gemini";
export type { GoogleGenerativeAILike } from "./llm/gemini";
export type {
  DashboardSpec,
  WidgetSpec,
  KPIWidgetSpec,
  TableWidgetSpec,
  BarChartWidgetSpec,
  LineChartWidgetSpec,
  MarkdownWidgetSpec,
  DotOptions,
  ChatMessage,
  DotData,
} from "./core/types";
