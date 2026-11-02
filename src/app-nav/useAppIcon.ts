import { useCallback, useContext, useRef } from "react";
import { AppNavContext } from "./context";
import type { AppDef, AppIconProps } from "./types";

/**
 * Common case: a tappable home/dock icon that springs into its app and hides
 * itself while open. Measurement, payload, and lifecycle are handled by the
 * provider; the caller just spreads `onClick` and `img`.
 */
export function useAppIcon(app: AppDef): AppIconProps {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppIcon must be used within <AppNavProvider>");

  const ref = useRef<HTMLImageElement | null>(null);

  const onClick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    ctx.open(app, ctx.env.measure(el));
  }, [app, ctx]);

  // The icon stays visible: the modal lands exactly on it, so hiding it left a
  // hole in the dock or grid that only filled in after the collapse finished.
  return { onClick, img: { ref, style: { visibility: "visible" } } };
}
