import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dot } from "../src/react/Dot";
import { DotProvider, DotContext } from "../src/react/DotProvider";
import type { DotContextValue } from "../src/react/DotProvider";
import type { DotLLMClient } from "../src/llm/types";

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockLLMClient: DotLLMClient = {
  generateDashboard: jest.fn().mockResolvedValue({
    jsonText: JSON.stringify({
      version: "0.1",
      title: "Test Dashboard",
      widgets: [{ type: "markdown", content: "Hello world" }],
    }),
  }),
};

function renderDot(data = {}) {
  return render(
    <DotProvider appDescription="Test App" llmClient={mockLLMClient}>
      <Dot data={data} />
    </DotProvider>
  );
}

describe("Dot component", () => {
  it("renders the DotButton", () => {
    renderDot();
    expect(screen.getByRole("button", { name: /open ai panel/i })).toBeInTheDocument();
  });

  it("shows panel when button is clicked", () => {
    renderDot();
    fireEvent.click(screen.getByRole("button", { name: /open ai panel/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("hides panel when button is clicked again", () => {
    renderDot();
    const btn = screen.getByRole("button", { name: /open ai panel/i });
    fireEvent.click(btn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close ai panel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("panel contains chat and dashboard sections", () => {
    renderDot();
    fireEvent.click(screen.getByRole("button", { name: /open ai panel/i }));
    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows send button inside the chat input area", () => {
    renderDot();
    fireEvent.click(screen.getByRole("button", { name: /open ai panel/i }));
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });
});

describe("DotProvider", () => {
  it("provides default context values", () => {
    const contextValues: { descriptions: string[] } = { descriptions: [] };
    function Consumer() {
      const ctx = React.useContext(DotContext) as DotContextValue;
      contextValues.descriptions = ctx.descriptions;
      return null;
    }
    render(
      <DotProvider appDescription="Test" llmClient={mockLLMClient}>
        <Consumer />
      </DotProvider>
    );
    expect(contextValues.descriptions).toEqual([]);
  });
});
