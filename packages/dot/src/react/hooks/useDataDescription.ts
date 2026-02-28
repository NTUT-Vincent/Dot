import { useContext, useEffect } from "react";
import { DotContext } from "../DotProvider";

export function useDataDescription(description: string): void {
  const ctx = useContext(DotContext);
  useEffect(() => {
    ctx.addDescription(description);
    return () => ctx.removeDescription(description);
  }, [description, ctx]);
}
