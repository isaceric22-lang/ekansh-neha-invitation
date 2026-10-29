import { useCallback, useContext } from "react";
import { AppNavContext } from "./context";
import type { AppDef } from "./types";

/**
 * Imperative launcher for sources that aren't a single icon (e.g. a widget
 * with several tappable rows): pick the `AppDef` at click time and pass the
 * element the modal should expand from.
 */
export function useAppOpener() {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppOpener must be used within <AppNavProvider>");

  return useCallback(
    (app: AppDef, origin: HTMLElement) => ctx.open(app, ctx.env.measure(origin)),
    [ctx]
  );
}
