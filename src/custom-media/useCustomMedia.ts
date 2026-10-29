import { useContext } from "react";
import { MediaContext } from "./context";
import type { MediaContextValue } from "./context";

export function useCustomMedia(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useCustomMedia must be used within <MediaProvider>");
  return ctx;
}
