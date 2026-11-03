import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type ActiveApp = { app: AppDef; origin: ModalOrigin };

type State = {
  phase: Phase;
  /** The app that is on screen (or shrinking away during "closing"). */
  active: ActiveApp | null;
  /** A tap that arrived while the previous app was still closing. */
  queued: ActiveApp | null;
};

type Action =
  | { type: "open"; active: ActiveApp }
  | { type: "replace"; app: AppDef }
  | { type: "opened" }
  | { type: "close" }
  | { type: "exited" };

const INITIAL: State = { phase: "closed", active: null, queued: null };

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      if (state.phase === "closed") {
        return { phase: "opening", active: action.active, queued: null };
      }
      // iOS lets you tap another icon while one app is collapsing. Remember it
      // and launch once the exit animation has handed the screen back.
      if (state.phase === "closing") {
        return { ...state, queued: action.active };
      }
      return state;
    case "replace":
      // A link inside an open app can hand the screen to another app. Keep the
      // current origin so the replacement still lands back on the same icon.
      return state.active &&
        (state.phase === "opening" || state.phase === "open")
        ? {
            ...state,
            phase: "open",
            active: { ...state.active, app: action.app },
            queued: null,
          }
        : state;
    case "opened":
      return state.phase === "opening" ? { ...state, phase: "open" } : state;
    case "close":
      // Closing is accepted while the open spring is still running, so a fast
      // tap on the close button is never swallowed.
      return state.phase === "opening" || state.phase === "open"
        ? { ...state, phase: "closing" }
        : state;
    case "exited":
      if (state.phase !== "closing") return state;
      return state.queued
        ? { phase: "opening", active: state.queued, queued: null }
        : INITIAL;
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

  // Event handlers need the phase as of the last commit, not the phase from
  // the render that happened to create the callback.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Announce an app opening exactly once, including one that was queued while
  // the previous app was still closing.
  const announcedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!state.active) return;
    if (state.phase !== "opening" && state.phase !== "open") return;
    const key = state.active.app.key;
    if (announcedKey.current === key) return;
    announcedKey.current = key;
    state.active.app.onOpen?.();
  }, [state.phase, state.active]);

  useEffect(() => {
    if (state.phase === "closing") announcedKey.current = null;
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "opening") return;
    return env.schedule(() => dispatch({ type: "opened" }), appOpenDelayMs);
  }, [state.phase, appOpenDelayMs, env]);

  useEffect(
    () => env.subscribeViewport(() => setViewport(env.readViewport())),
    [env]
  );

  const open = useCallback((app: AppDef, origin: ModalOrigin) => {
    const current = stateRef.current;
    if (current.phase === "opening" || current.phase === "open") {
      if (current.active?.app.key === app.key) return;
      current.active?.app.onClose?.();
      // Replace in place: a link in Notes should open the invitation without
      // closing the whole phone UI.
      dispatch({ type: "replace", app });
      return;
    }
    dispatch({ type: "open", active: { app, origin } });
  }, []);

  const close = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== "opening" && current.phase !== "open") return;
    current.active?.app.onClose?.();
    dispatch({ type: "close" });
  }, []);

  const onExitComplete = useCallback(() => dispatch({ type: "exited" }), []);

  // The frame disappears as soon as closing starts so AnimatePresence can run
  // the exit animation from wherever the card currently is. The active app (and
  // its origin) is retained until the exit completes, so `openKey` does not
  // flicker and a queued launch still knows where it came from.
  const present =
    state.active !== null &&
    (state.phase === "opening" || state.phase === "open");
  const frame =
    present && state.active
      ? buildModalFrame(
          {
            key: state.active.app.key,
            iconSrc: state.active.app.iconSrc,
            content: state.active.app.render(),
            chrome: buildChrome(state.active.app),
            hideIcon: state.active.app.hideIcon,
          },
          state.active.origin,
          viewport,
          spring,
          // The app content crossfades in once the shell has landed, and fades
          // out while the card shrinks back onto its icon.
          state.phase === "open"
        )
      : null;

  return (
    <AppNavContext.Provider
      value={{ openKey: state.active?.app.key ?? null, open, close, env }}
    >
      {children}
      <AnimatePresence onExitComplete={onExitComplete}>
        {frame && <AppModal key="app-modal" frame={frame} onClose={close} />}
      </AnimatePresence>
    </AppNavContext.Provider>
  );
}
