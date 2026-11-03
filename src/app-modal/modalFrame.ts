import type { ReactNode } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";

export type MotionProps = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition?: Transition;
};

/** The icon rect the modal expands from (viewport coords, center anchored). */
export type ModalOrigin = { x: number; y: number; w: number; h: number };

/** Per-caller chrome — the animation core is shared, the chrome is not. */
export type ModalChrome = {
  /** Header title; omit for full-page apps that bring their own chrome. */
  title?: string;
  closeButton: "header-right" | "floating-left" | "none";
  /** Reserve header clearance (pt-[72px]) + page padding for title layouts. */
  bodyPadding: boolean;
  zIndex: number;
  /** Backplate color revealed during expand. Defaults to white. */
  background?: string;
};

export type ModalPayload = {
  key: string;
  iconSrc: string;
  content: ReactNode;
  chrome: ModalChrome;
  /** Skip the landing-icon morph; the shell still expands from the origin. */
  hideIcon?: boolean;
};

export type ModalFrame = {
  key: string;
  iconSrc: string;
  content: ReactNode;
  chrome: ModalChrome;
  appReady: boolean;
  shell: MotionProps;
  backplate: MotionProps;
  iconCrossfade: MotionProps;
  header: MotionProps;
  body: MotionProps;
};

export const DEFAULT_MODAL_SPRING: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9,
};

const ICON_CROSSFADE_ENTER: Transition = { duration: 0.18, ease: "easeOut" };
const ICON_CROSSFADE_EXIT: Transition = {
  duration: 0.12,
  delay: 0.22,
  ease: "easeOut",
};
const HEADER_EXIT: Transition = { duration: 0.28, ease: "easeOut" };
const BACKPLATE_EXIT: Transition = { duration: 0.5, ease: "easeOut" };
const CONTENT_ENTER: Transition = { duration: 0.18, ease: "easeOut" };
const CONTENT_EXIT: Transition = { duration: 0.22, ease: "easeOut" };

const MODAL_BACKPLATE: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: BACKPLATE_EXIT },
};

const MODAL_ICON_CROSSFADE: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  exit: { opacity: 1, transition: ICON_CROSSFADE_EXIT },
  transition: ICON_CROSSFADE_ENTER,
};

// Landing icon suppressed (e.g. opening from a widget): never paint the icon.
const MODAL_ICON_HIDDEN: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 0 },
  exit: { opacity: 0 },
};

const MODAL_HEADER: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: HEADER_EXIT },
};

function modalShell(
  origin: ModalOrigin,
  viewport: { w: number; h: number },
  modalSpring: Transition
): MotionProps {
  const collapsed = {
    top: origin.y - origin.h / 2,
    left: origin.x - origin.w / 2,
    width: origin.w,
    height: origin.h,
    borderRadius: 14,
    opacity: 1,
  };
  return {
    initial: collapsed,
    animate: {
      top: 0,
      left: 0,
      width: viewport.w,
      height: viewport.h,
      borderRadius: 0,
      opacity: 1,
    },
    exit: collapsed,
    transition: modalSpring,
  };
}

function modalBody(appReady: boolean): MotionProps {
  return {
    initial: { opacity: 0 },
    animate: { opacity: appReady ? 1 : 0 },
    exit: { opacity: 0, transition: CONTENT_EXIT },
    transition: CONTENT_ENTER,
  };
}

export function buildModalFrame(
  payload: ModalPayload,
  origin: ModalOrigin,
  viewport: { w: number; h: number },
  modalSpring: Transition,
  appReady: boolean
): ModalFrame {
  return {
    key: payload.key,
    iconSrc: payload.iconSrc,
    content: payload.content,
    chrome: payload.chrome,
    appReady,
    shell: modalShell(origin, viewport, modalSpring),
    backplate: MODAL_BACKPLATE,
    iconCrossfade: payload.hideIcon ? MODAL_ICON_HIDDEN : MODAL_ICON_CROSSFADE,
    header: MODAL_HEADER,
    body: modalBody(appReady),
  };
}
