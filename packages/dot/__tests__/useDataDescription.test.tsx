import React from "react";
import { renderHook } from "@testing-library/react";
import { useDataDescription } from "../src/react/hooks/useDataDescription";
import { DotContext } from "../src/react/DotProvider";
import type { DotContextValue } from "../src/react/DotProvider";

function makeCtx(overrides: Partial<DotContextValue> = {}): DotContextValue {
  return {
    appDescription: "test",
    llmClient: null,
    options: { maxBytes: 200_000, maxRows: 200, maxWidgets: 6, model: { jsonOnly: true } },
    descriptions: [],
    addDescription: jest.fn(),
    removeDescription: jest.fn(),
    ...overrides,
  };
}

describe("useDataDescription", () => {
  it("calls addDescription on mount", () => {
    const ctx = makeCtx();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DotContext.Provider value={ctx}>{children}</DotContext.Provider>
    );
    renderHook(() => useDataDescription("users: list of user objects"), { wrapper });
    expect(ctx.addDescription).toHaveBeenCalledWith("users: list of user objects");
  });

  it("calls removeDescription on unmount", () => {
    const ctx = makeCtx();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DotContext.Provider value={ctx}>{children}</DotContext.Provider>
    );
    const { unmount } = renderHook(() => useDataDescription("users: list of user objects"), { wrapper });
    unmount();
    expect(ctx.removeDescription).toHaveBeenCalledWith("users: list of user objects");
  });

  it("updates description when it changes", () => {
    const ctx = makeCtx();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DotContext.Provider value={ctx}>{children}</DotContext.Provider>
    );
    const { rerender } = renderHook(
      ({ desc }: { desc: string }) => useDataDescription(desc),
      { wrapper, initialProps: { desc: "old description" } }
    );
    expect(ctx.addDescription).toHaveBeenCalledWith("old description");

    rerender({ desc: "new description" });
    expect(ctx.removeDescription).toHaveBeenCalledWith("old description");
    expect(ctx.addDescription).toHaveBeenCalledWith("new description");
  });
});
