import { useState, useEffect, useRef, useCallback } from "react";
import type { DotData } from "../../core/types";
import { sanitize } from "../../core/sanitize";

interface UseDotDataOptions {
  debounceMs?: number;
}

export function useDotData(
  selector: () => DotData,
  options: UseDotDataOptions = {}
): DotData {
  const { debounceMs = 400 } = options;
  const [data, setData] = useState<DotData>(() => sanitize(selector()) as DotData);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const update = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setData(sanitize(selectorRef.current()) as DotData);
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    update();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [update]);

  return data;
}
