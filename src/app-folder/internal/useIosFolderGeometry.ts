import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { LayoutRect, Rect } from "../geometry";

export const APP_ICON_ATTR = "data-app-icon";

/**
 * The app frame (#root) acts as the containing block for the app's
 * `position: fixed` layers on desktop, so an origin handed to the modal must
 * be relative to the frame, not the viewport. On mobile the frame fills the
 * screen (offset 0), so this is a no-op.
 */
function frameOffset(): { x: number; y: number } {
  if (typeof document === "undefined") return { x: 0, y: 0 };
  const r = document.getElementById("root")?.getBoundingClientRect();
  return r ? { x: r.left, y: r.top } : { x: 0, y: 0 };
}

type Point = { x: number; y: number };

export type FolderGeometry = {
  miniGridRef: RefObject<HTMLDivElement | null>;
  registerItem: (key: string) => (el: HTMLDivElement | null) => void;

  center: Point | null;
  itemRects: Readonly<Record<string, LayoutRect>>;

  measureCenterNow: () => Point | null;
  measureAppOriginNow: (key: string) => Rect | null;

  reset: () => void;
};

export function useIosFolderGeometry(opts: {
  items: readonly { key: string }[];
  active: boolean;
}): FolderGeometry {
  const { items, active } = opts;

  const miniGridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const refRegistry = useRef(
    new Map<string, (el: HTMLDivElement | null) => void>()
  );

  const [center, setCenter] = useState<Point | null>(null);
  const [itemRects, setItemRects] = useState<Record<string, LayoutRect>>({});

  const registerItem = useCallback((key: string) => {
    let cb = refRegistry.current.get(key);
    if (!cb) {
      cb = (el: HTMLDivElement | null) => {
        itemRefs.current[key] = el;
      };
      refRegistry.current.set(key, cb);
    }
    return cb;
  }, []);

  const measureCenterNow = useCallback((): Point | null => {
    const rect = miniGridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const point = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setCenter(point);
    return point;
  }, []);

  const measureAppOriginNow = useCallback((key: string): Rect | null => {
    const el = itemRefs.current?.[key];
    const iconEl = el?.querySelector(
      `[${APP_ICON_ATTR}="${key}"]`
    ) as HTMLElement | null;
    const target = iconEl ?? el;
    if (!target) return null;
    const r = target.getBoundingClientRect();
    const off = frameOffset();
    return {
      x: r.left - off.x + r.width / 2,
      y: r.top - off.y + r.height / 2,
      w: r.width,
      h: r.height,
    };
  }, []);

  const reset = useCallback(() => {
    setCenter(null);
    setItemRects({});
  }, []);

  useLayoutEffect(() => {
    if (!active || !center) return;
    const rects: Record<string, LayoutRect> = {};
    for (const item of items) {
      const el = itemRefs.current?.[item.key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      rects[item.key] = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    }
    setItemRects(rects);
  }, [active, center, items]);

  return {
    miniGridRef,
    registerItem,
    center,
    itemRects,
    measureCenterNow,
    measureAppOriginNow,
    reset,
  };
}
