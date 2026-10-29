import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  type RefObject,
} from "react";
import type { Transition } from "framer-motion";
import type { FolderChild } from "../types";
import { isAppEntry } from "../types";
import { INITIAL_STATE, reduce } from "../core/phaseMachine";
import {
  buildRenderPlan,
  DEFAULT_FOLDER_SPRING,
  type RenderPlan,
} from "../core/renderPlan";
import { useAppNav } from "../../app-nav";
import { useIosFolderGeometry } from "./useIosFolderGeometry";
import { openMaps } from "@/lib/maps";

export type IosFolderMotion = Partial<{
  folderSpring: Transition;
}>;

export type IosFolderApi = {
  plan: RenderPlan;
  registerItem: (key: string) => (el: HTMLDivElement | null) => void;
  miniGridRef: RefObject<HTMLDivElement | null>;
  openFolder: () => void;
  closeFolder: () => void;
  openApp: (key: string) => void;
  onShellExitComplete: () => void;
};

export function useIosFolder(
  items: FolderChild[],
  motion?: IosFolderMotion
): IosFolderApi {
  const folderSpring = motion?.folderSpring ?? DEFAULT_FOLDER_SPRING;

  const folderId = useId();
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE);

  const isOpen = state.phase !== "idle";
  const geo = useIosFolderGeometry({ items, active: isOpen });
  const nav = useAppNav();

  useEffect(() => {
    for (const { iconSrc } of items) {
      const img = new Image();
      img.src = iconSrc;
    }
  }, [items]);

  const plan = useMemo(
    () =>
      buildRenderPlan({
        items,
        folderId,
        state,
        rects: geo.itemRects,
        center: geo.center,
        hiddenKey: nav.openKey,
        motion: { folderSpring },
      }),
    [
      items,
      folderId,
      state,
      geo.itemRects,
      geo.center,
      nav.openKey,
      folderSpring,
    ]
  );

  const openFolder = useCallback(() => {
    geo.measureCenterNow();
    dispatch({ type: "openFolder" });
  }, [geo]);

  const openApp = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key);
      if (!item) return;
      if (item.href) {
        openMaps(item.href);
        dispatch({ type: "closeFolder" });
        return;
      }
      if (!isAppEntry(item)) return;
      const origin = geo.measureAppOriginNow(key);
      if (!origin) return;
      // Folder origins are synthetic (CSS-transformed mini-grid), so we measure
      // ourselves and use the escape hatch rather than useAppIcon.
      nav.open(
        {
          key,
          iconSrc: item.iconSrc,
          render: () => item.app,
          background: item.background,
          chrome: item.chrome,
          onOpen: item.onOpen,
          onClose: item.onClose,
        },
        origin
      );
    },
    [items, geo, nav]
  );

  const closeFolder = useCallback(() => dispatch({ type: "closeFolder" }), []);

  const onShellExitComplete = useCallback(() => {
    if (!isOpen) geo.reset();
  }, [isOpen, geo]);

  return {
    plan,
    registerItem: geo.registerItem,
    miniGridRef: geo.miniGridRef,
    openFolder,
    closeFolder,
    openApp,
    onShellExitComplete,
  };
}
