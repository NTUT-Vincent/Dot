import React from "react";
import type { ChatMessage, DashboardSpec } from "../../core/types";
import { Chat } from "./Chat";
import { Dashboard } from "./Dashboard";

interface DotPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
  dashboardSpec: DashboardSpec | null;
  error?: string;
}

export function DotPanel({ isOpen, messages, onSend, isLoading, dashboardSpec, error }: DotPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Dashboard Panel"
      style={{
        position: "fixed",
        bottom: 90,
        right: 24,
        width: "min(900px, calc(100vw - 48px))",
        height: "min(600px, calc(100vh - 120px))",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        display: "flex",
        overflow: "hidden",
        zIndex: 9998,
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Chat panel */}
      <div style={{ width: "40%", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14, color: "#111827" }}>
          Chat
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Chat messages={messages} onSend={onSend} isLoading={isLoading} />
        </div>
      </div>
      {/* Dashboard panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14, color: "#111827" }}>
          Dashboard
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Dashboard spec={dashboardSpec} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
