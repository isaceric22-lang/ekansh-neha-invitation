import { useCallback, useEffect, useReducer, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { AppModal } from "../app-modal/AppModal";
import {
  buildModalFrame,
  DEFAULT_MODAL_SPRING,
  type ModalChrome,
  type ModalOrigin,
} from "../app-modal/modalFrame";
import { AppNavContext } from "./context";
import { realEnv, type AppNavEnv } from "./env";
import type { AppDef, AppNavMotion } from "./types";

/** Single foreground app layer; below the lock screen (z-[20000] in App.tsx). */
const APP_MODAL_Z = 15000;
const DEFAULT_APP_OPEN_DELAY_MS = 100;

type Phase = "closed" | "opening" | "open" | "closing";

type State = { phase: Phase; app: AppDef | null; origin: ModalOrigin | null };

type Action =
  | { type: "open"; app: AppDef; origin: ModalOrigin }
  | { type: "opened" }
  | { type: "close" }
  | { type: "closed" };

const INITIAL: State = { phase: "closed", app: null, origin: null };

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return state.phase === "closed"
        ? { phase: "opening", app: action.app, origin: action.origin }
        : state;
    case "opened":
      return state.phase === "opening" ? { ...state, phase: "open" } : state;
    case "close":
      return state.phase === "open" ? { ...state, phase: "closing" } : state;
    case "closed":
      return state.phase === "closing" ? INITIAL : state;
  }
}

function buildChrome(app: AppDef): ModalChrome {
  const c = app.chrome ?? {};
  return {
    title: c.title,
    closeButton: c.closeButton ?? "floating-left",
    bodyPadding: c.bodyPadding ?? false,
    zIndex: APP_MODAL_Z,
    background: app.background,
  };
}

export type AppNavProviderProps = {
  children: ReactNode;
  motion?: AppNavMotion;
  /** Test seam; defaults to real DOM/window/timers. */
  env?: AppNavEnv;
};

export function AppNavProvider({
  children,
  motion,
  env = realEnv,
}: AppNavProviderProps) {
  const spring = motion?.spring ?? DEFAULT_MODAL_SPRING;
  const appOpenDelayMs = motion?.appOpenDelayMs ?? DEFAULT_APP_OPEN_DELAY_MS;

  const [state, dispatch] = useReducer(reduce, INITIAL);
  const [viewport, setViewport] = useState(() => env.readViewport());

  useEffect(() => {
    if (state.phase !== "opening") return;
    return env.schedule(() => dispatch({ type: "opened" }), appOpenDelayMs);
  }, [state.phase, appOpenDelayMs, env]);

  useEffect(
    () => env.subscribeViewport(() => setViewport(env.readViewport())),
    [env]
  );

  const open = useCallback((app: AppDef, origin: ModalOrigin) => {
    dispatch({ type: "open", app, origin });
    app.onOpen?.();
  }, []);

  const close = useCallback(() => {
    if (state.phase !== "open") return;
    state.app?.onClose?.();
    dispatch({ type: "close" });
  }, [state.phase, state.app]);

  const onExitComplete = useCallback(() => dispatch({ type: "closed" }), []);

  const mounted = state.phase === "opening" || state.phase === "open";
  const frame =
    mounted && state.app && state.origin
      ? buildModalFrame(
          {
            key: state.app.key,
            iconSrc: state.app.iconSrc,
            content: state.app.render(),
            chrome: buildChrome(state.app),
            hideIcon: state.app.hideIcon,
          },
          state.origin,
          viewport,
          spring,
          state.phase === "open"
        )
      : null;

  return (
    <AppNavContext.Provider
      value={{ openKey: state.app?.key ?? null, open, close, env }}
    >
      {children}
      <AnimatePresence onExitComplete={onExitComplete}>
        {frame && (
          <AppModal key={`app-${frame.key}`} frame={frame} onClose={close} />
        )}
      </AnimatePresence>
    </AppNavContext.Provider>
  );
}
