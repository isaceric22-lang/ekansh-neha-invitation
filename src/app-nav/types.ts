import type { ReactNode, RefObject } from "react";
import type { Transition } from "framer-motion";
import type { ModalOrigin } from "../app-modal/modalFrame";

/** The only chrome knobs a caller may set. `zIndex` is owned by the module. */
export type ChromeOverride = {
  title: string;
  closeButton: "header-right" | "floating-left" | "none";
  bodyPadding: boolean;
};

/** Identity + closed icon + how the open app renders. */
export type AppDef = {
  key: string;
  iconSrc: string;
  /** Lazy: built when opened. */
  render: () => ReactNode;
  /** 99% case: omit. */
  chrome?: Partial<ChromeOverride>;
  background?: string;
  /** Skip the landing-icon morph (e.g. opening from a widget, not an icon). */
  hideIcon?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export type AppNavMotion = Partial<{
  spring: Transition;
  appOpenDelayMs: number;
}>;

export type AppNavApi = {
  /** Key of the app mounted or animating out; null when nothing is open. */
  openKey: string | null;
  /** Escape hatch: caller measures its own origin (e.g. a CSS-transformed grid). */
  open: (app: AppDef, origin: ModalOrigin) => void;
  close: () => void;
};

export type AppIconProps = {
  onClick: () => void;
  img: {
    ref: RefObject<HTMLImageElement | null>;
    style: { visibility: "hidden" | "visible" };
  };
};
