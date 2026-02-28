import React from "react";

interface DotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function DotButton({ onClick, isOpen }: DotButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close AI panel" : "Open AI panel"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        transition: "background 0.2s",
      }}
    >
      {isOpen ? "✕" : "✦"}
    </button>
  );
}
