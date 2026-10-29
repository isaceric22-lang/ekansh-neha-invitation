import type { ModalOrigin } from "../app-modal/modalFrame";

/**
 * The single seam where this module touches the environment (DOM / window /
 * timers). Production wires `realEnv`; tests pass a fake to drive the full
 * open → opened → close → closed lifecycle deterministically.
 */
export type AppNavEnv = {
  /** Live element → center-anchored origin rect the modal expands from. */
  measure: (el: HTMLElement) => ModalOrigin;
  readViewport: () => { w: number; h: number };
  /** Subscribe to viewport changes; returns an unsubscribe. */
  subscribeViewport: (cb: () => void) => () => void;
  /** Schedule `cb` after `ms`; returns a cancel handle. */
  schedule: (cb: () => void, ms: number) => () => void;
};

/**
 * The app frame (#root). On desktop it's clamped to an iPhone-sized box and
 * acts as the containing block for the app's `position: fixed` layers, so all
 * modal coordinates must be measured relative to it — not the viewport.
 */
const frameRect = () =>
  typeof document === "undefined"
    ? null
    : document.getElementById("root")?.getBoundingClientRect() ?? null;

export const realEnv: AppNavEnv = {
  measure: (el) => {
    const r = el.getBoundingClientRect();
    const f = frameRect();
    const ox = f?.left ?? 0;
    const oy = f?.top ?? 0;
    return {
      x: r.left - ox + r.width / 2,
      y: r.top - oy + r.height / 2,
      w: r.width,
      h: r.height,
    };
  },
  readViewport: () => {
    if (typeof window === "undefined") return { w: 0, h: 0 };
    const f = frameRect();
    return f
      ? { w: f.width, h: f.height }
      : { w: window.innerWidth, h: window.innerHeight };
  },
  subscribeViewport: (cb) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  },
  schedule: (cb, ms) => {
    const id = setTimeout(cb, ms);
    return () => clearTimeout(id);
  },
};
