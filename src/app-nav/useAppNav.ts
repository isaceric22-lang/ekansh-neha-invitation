import { useContext } from "react";
import { AppNavContext } from "./context";
import type { AppNavApi } from "./types";

export function useAppNav(): AppNavApi {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppNav must be used within <AppNavProvider>");
  return { openKey: ctx.openKey, open: ctx.open, close: ctx.close };
}
