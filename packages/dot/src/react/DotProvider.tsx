import React, { createContext, useContext, useCallback, useState } from "react";
import type { DotOptions } from "../core/types";
import type { DotLLMClient } from "../llm/types";

export interface DotContextValue {
  appDescription: string;
  llmClient: DotLLMClient | null;
  options: Required<DotOptions>;
  descriptions: string[];
  addDescription: (desc: string) => void;
  removeDescription: (desc: string) => void;
}

const defaultOptions: Required<DotOptions> = {
  maxBytes: 200_000,
  maxRows: 200,
  maxWidgets: 6,
  model: { jsonOnly: true },
};

export const DotContext = createContext<DotContextValue>({
  appDescription: "",
  llmClient: null,
  options: defaultOptions,
  descriptions: [],
  addDescription: () => {},
  removeDescription: () => {},
});

export interface DotProviderProps {
  appDescription: string;
  llmClient: DotLLMClient;
  options?: Partial<DotOptions>;
  children: React.ReactNode;
}

export function DotProvider({ appDescription, llmClient, options, children }: DotProviderProps) {
  const [descriptions, setDescriptions] = useState<string[]>([]);

  const addDescription = useCallback((desc: string) => {
    setDescriptions(prev => prev.includes(desc) ? prev : [...prev, desc]);
  }, []);

  const removeDescription = useCallback((desc: string) => {
    setDescriptions(prev => prev.filter(d => d !== desc));
  }, []);

  const mergedOptions: Required<DotOptions> = { ...defaultOptions, ...options };

  return (
    <DotContext.Provider value={{ appDescription, llmClient, options: mergedOptions, descriptions, addDescription, removeDescription }}>
      {children}
    </DotContext.Provider>
  );
}

export function useDotContext() {
  return useContext(DotContext);
}
