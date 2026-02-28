import type { ChatMessage, DashboardSpec } from "../core/types";

export interface DotLLMClient {
  generateDashboard(input: {
    messages: Array<ChatMessage>;
    dashboardSchema: object;
    constraints: {
      maxWidgets: number;
      maxRows: number;
      jsonOnly: true;
    };
  }): Promise<{ jsonText: string }>;
}
