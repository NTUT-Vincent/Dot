import type { DotData, DashboardSpec } from "./types";
import type { DataProfile } from "./profile";
import type { ChatMessage } from "./types";
import { DASHBOARD_SCHEMA } from "./catalog";

export function buildSystemPrompt(
  appDescription: string,
  descriptions: string[]
): string {
  const descSection = descriptions.length > 0
    ? `\n\nData field descriptions:\n${descriptions.join("\n")}`
    : "";
  return `You are an AI dashboard generator for: ${appDescription}.${descSection}

Generate a dashboard spec as valid JSON conforming to the schema.
Output ONLY valid JSON. No markdown, no explanation.
All widgets must use only the allowed types: kpi, table, bar, line, markdown.`;
}

export function buildUserPrompt(
  data: DotData | Record<string, unknown>,
  dataProfile?: DataProfile
): string {
  if (dataProfile && Object.keys(data).length === 0) {
    return `Data profile (data was too large, using summary):\n${JSON.stringify(dataProfile, null, 2)}\n\nGenerate a dashboard based on this data profile.`;
  }
  return `Current visible data:\n${JSON.stringify(data, null, 2)}\n\nGenerate a dashboard spec as JSON.`;
}

export function buildMessages(
  appDescription: string,
  descriptions: string[],
  data: DotData | Record<string, unknown>,
  dataProfile?: DataProfile,
  conversationHistory: ChatMessage[] = []
): ChatMessage[] {
  const systemPrompt = buildSystemPrompt(appDescription, descriptions);
  const userPrompt = buildUserPrompt(data, dataProfile);
  return [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userPrompt },
  ];
}

export { DASHBOARD_SCHEMA };
