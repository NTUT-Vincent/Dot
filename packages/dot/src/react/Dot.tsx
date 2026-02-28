import React, { useState, useCallback, useRef } from "react";
import type { DotData, ChatMessage, DashboardSpec } from "../core/types";
import { sanitize } from "../core/sanitize";
import { sizeGuard } from "../core/sizeGuard";
import { buildMessages, DASHBOARD_SCHEMA } from "../core/prompt";
import { parseDashboardSpec } from "../core/validate";
import { useDotContext } from "./DotProvider";
import { DotButton } from "./ui/DotButton";
import { DotPanel } from "./ui/DotPanel";

interface DotProps {
  data: DotData;
}

const MAX_RETRIES = 2;

export function Dot({ data }: DotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dashboardSpec, setDashboardSpec] = useState<DashboardSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { appDescription, llmClient, options, descriptions } = useDotContext();

  const dataRef = useRef(data);
  dataRef.current = data;

  const snapshotData = useCallback(() => {
    const sanitized = sanitize(dataRef.current) as DotData;
    const { data: guarded, dataProfile } = sizeGuard(sanitized, {
      maxBytes: options.maxBytes,
      maxRows: options.maxRows,
    });
    return { guarded, dataProfile };
  }, [options.maxBytes, options.maxRows]);

  const generateDashboard = useCallback(async (userMessage: string) => {
    if (!llmClient) {
      setError("No LLM client provided.");
      return;
    }
    setIsLoading(true);
    setError(undefined);

    const { guarded, dataProfile } = snapshotData();
    const newUserMsg: ChatMessage = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);

    const conversationHistory = messages.concat(newUserMsg);
    const builtMessages = buildMessages(appDescription, descriptions, guarded, dataProfile, conversationHistory);

    let spec: DashboardSpec | null = null;
    let lastError = "";

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await llmClient.generateDashboard({
          messages: builtMessages,
          dashboardSchema: DASHBOARD_SCHEMA,
          constraints: {
            maxWidgets: options.maxWidgets,
            maxRows: options.maxRows,
            jsonOnly: true,
          },
        });
        spec = parseDashboardSpec(result.jsonText);
        if (spec) break;
        lastError = "Invalid dashboard spec returned by LLM.";
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown error";
      }
    }

    if (spec) {
      // Limit widgets
      if (spec.widgets.length > options.maxWidgets) {
        spec = { ...spec, widgets: spec.widgets.slice(0, options.maxWidgets) };
      }
      setDashboardSpec(spec);
      setMessages(prev => [...prev, { role: "assistant", content: `Dashboard generated: ${spec!.title ?? "Untitled"}` }]);
    } else {
      setError(`Failed to generate dashboard: ${lastError}`);
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I couldn't generate a valid dashboard. ${lastError}` }]);
    }

    setIsLoading(false);
  }, [llmClient, messages, appDescription, descriptions, options, snapshotData]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <>
      <DotButton onClick={handleToggle} isOpen={isOpen} />
      <DotPanel
        isOpen={isOpen}
        messages={messages}
        onSend={generateDashboard}
        isLoading={isLoading}
        dashboardSpec={dashboardSpec}
        error={error}
      />
    </>
  );
}
