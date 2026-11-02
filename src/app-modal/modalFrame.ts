import type { CSSProperties, ReactNode } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";

export type MotionProps = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition?: Transition;
};

/** The icon rect the modal expands from (frame coords, center anchored). */
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
  shell: MotionProps;
  /** The shell is a full-size layer; only its transform changes. */
  shellStyle: CSSProperties;
  backplate: MotionProps;
  iconCrossfade: MotionProps;
  header: MotionProps;
  body: MotionProps;
};

// A spring this size settles like the system's app-open transition: quick
// departure, a soft landing, and just enough give to feel physical. It is
// deliberately close to critical damping so the card never bounces past the
// phone edges.
export const DEFAULT_MODAL_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 32,
  mass: 0.9,
};

// The landing icon fades quickly: held any longer it reads as a stretched
// icon smeared across the expanding window.
const ICON_CROSSFADE_ENTER: Transition = { duration: 0.12, ease: "easeOut" };
const CONTENT_ENTER: Transition = { duration: 0.2, ease: "easeOut" };

// The backplate holds its colour all the way out. Fading it early left a bare
// white card collapsing into the icon, which read as the app never being there.
const MODAL_BACKPLATE: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

// The icon is only a landing mask for the expand. On the way out the real home
// icon is already underneath the collapsing card, so this layer must stay
// transparent or it paints a second, ghost icon at the end of the close.
const MODAL_ICON_CROSSFADE: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  exit: { opacity: 0 },
  transition: ICON_CROSSFADE_ENTER,
};

// Landing icon suppressed (e.g. opening from a widget): never paint the icon.
const MODAL_ICON_HIDDEN: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 0 },
  exit: { opacity: 0 },
};

// Keep the header mounted through the close. Fading it out early made the app
// look like it had already been dismissed while the card was still shrinking.
const MODAL_HEADER: MotionProps = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

function modalShell(
  origin: ModalOrigin,
  viewport: { w: number; h: number },
  modalSpring: Transition
): { motion: MotionProps; style: CSSProperties } {
  const vw = Math.max(viewport.w, 1);
  const vh = Math.max(viewport.h, 1);

  // Work entirely in transforms: the card is always laid out at full screen
  // size and the compositor scales/translates it down onto the icon. Animating
  // top/left/width/height instead reflowed every app screen on every frame,
  // which is what made the close feel like it was glitching.
  const scaleX = Math.max(origin.w, 1) / vw;
  const scaleY = Math.max(origin.h, 1) / vh;

  // Compensate for the scale so the visual corner radius at the origin matches
  // the icon's mask instead of turning into a tiny square. This works out to
  // ~22.5% of the frame width, independent of the icon size.
  const iconRadius = Math.round(vw * 0.225);

  const collapsed = {
    x: origin.x - origin.w / 2,
    y: origin.y - origin.h / 2,
    scaleX,
    scaleY,
    borderRadius: iconRadius,
    opacity: 1,
  };

  return {
    motion: {
      initial: collapsed,
      animate: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        borderRadius: 0,
        opacity: 1,
      },
      exit: collapsed,
      transition: modalSpring,
    },
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: vw,
      height: vh,
      transformOrigin: "0 0",
      backfaceVisibility: "hidden",
      willChange: "transform, border-radius",
      contain: "layout paint size",
    },
  };
}

// The app paints for the whole morph, in both directions: it fades up as the
// shell expands and stays visible while the shell shrinks back onto the icon.
function modalBody(): MotionProps {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: CONTENT_ENTER,
  };
}

export function buildModalFrame(
  payload: ModalPayload,
  origin: ModalOrigin,
  viewport: { w: number; h: number },
  modalSpring: Transition
): ModalFrame {
  const shell = modalShell(origin, viewport, modalSpring);
  return {
    key: payload.key,
    iconSrc: payload.iconSrc,
    content: payload.content,
    chrome: payload.chrome,
    shell: shell.motion,
    shellStyle: shell.style,
    backplate: MODAL_BACKPLATE,
    iconCrossfade: payload.hideIcon ? MODAL_ICON_HIDDEN : MODAL_ICON_CROSSFADE,
    header: MODAL_HEADER,
    body: modalBody(),
  };
}
