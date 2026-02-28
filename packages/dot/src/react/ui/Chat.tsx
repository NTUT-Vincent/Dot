import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../../core/types";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function Chat({ messages, onSend, isLoading }: ChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.filter(m => m.role !== "system").map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            background: msg.role === "user" ? "#2563eb" : "#f3f4f6",
            color: msg.role === "user" ? "#fff" : "#111",
            padding: "8px 12px",
            borderRadius: 12,
            maxWidth: "80%",
            fontSize: 14,
            whiteSpace: "pre-wrap",
          }}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", color: "#6b7280", fontSize: 14 }}>
            Generating dashboard…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", borderTop: "1px solid #e5e7eb", padding: 8, gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your data…"
          disabled={isLoading}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none" }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
