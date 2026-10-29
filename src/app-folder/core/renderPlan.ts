import type { Transition } from "framer-motion";
import type { FolderAppEntry, FolderChild } from "../types";
import { isAppEntry } from "../types";
import type { LayoutRect, Offset } from "../geometry";
import type { FolderState } from "./phaseMachine";
import { selectors } from "./phaseMachine";
import type { MotionProps } from "../../app-modal/modalFrame";

export type { MotionProps } from "../../app-modal/modalFrame";

export const DEFAULT_FOLDER_SPRING: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 22,
};

export type MotionConfig = {
  folderSpring: Transition;
};

export type RenderPlanInput = {
  items: readonly FolderChild[];
  folderId: string;
  state: FolderState;
  rects: Readonly<Record<string, LayoutRect>>;
  center: { x: number; y: number } | null;
  /** Key of the item whose modal is mounted/animating — hidden in the grid. */
  hiddenKey: string | null;
  motion: MotionConfig;
};

export type ItemFrame = {
  key: string;
  iconSrc: string;
  label: string;
  layoutId: string | undefined;
  hasSharedElement: boolean;
  tappable: boolean;
  hidden: boolean;
  motion: MotionProps;
  reactKey: string;
};

export type RenderPlan = {
  isOpen: boolean;
  items: readonly ItemFrame[];
  largeItems: readonly ItemFrame[];
  miniItems: readonly ItemFrame[];
  layoutIdFor: (key: string) => string | undefined;
  shell: {
    backdrop: MotionProps;
    title: MotionProps;
    grid: MotionProps;
    closed: MotionProps;
    transition: Transition;
  };
};

const LARGE_END = 3;
const MINI_GRID_START = 3;
const MINI_GRID_END = 6;
const MINI_END = 7;

const STAGGER_ENTER_BASE = -0.025;
const STAGGER_ENTER_STEP = 0.025;
const STAGGER_EXIT_BASE = -0.095;
const STAGGER_EXIT_STEP = 0.025;

const BACKDROP_TRANSITION: Transition = { duration: 0.25, ease: "easeOut" };
const GRID_TRANSITION: Transition = { duration: 0.2 };
const TITLE_ENTER: Transition = { type: "spring", stiffness: 200, damping: 19 };
const TITLE_EXIT: Transition = { type: "spring", stiffness: 300, damping: 22 };

const BACKDROP: MotionProps = {
  initial: { backdropFilter: "blur(0px)" },
  animate: { backdropFilter: "blur(24px)" },
  exit: { backdropFilter: "blur(0px)", transition: BACKDROP_TRANSITION },
  transition: BACKDROP_TRANSITION,
};

const TITLE: MotionProps = {
  initial: { opacity: 0, y: 30, x: 10, scale: 0.8 },
  animate: { opacity: 1, y: 0, x: 0, scale: 1 },
  exit: { opacity: 0, y: 30, x: 10, scale: 0.8, transition: TITLE_EXIT },
  transition: TITLE_ENTER,
};

const GRID: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: GRID_TRANSITION },
  transition: GRID_TRANSITION,
};

function computeOffset(
  rect: LayoutRect,
  center: { x: number; y: number }
): Offset {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return { x: center.x - cx, y: center.y - cy };
}

function computeStagger(
  nonLayoutIdx: number,
  totalNonLayout: number
): { enter: number; exit: number } {
  return {
    enter: STAGGER_ENTER_BASE + nonLayoutIdx * STAGGER_ENTER_STEP,
    exit:
      STAGGER_EXIT_BASE +
      (totalNonLayout - 1 - nonLayoutIdx) * STAGGER_EXIT_STEP,
  };
}

type LayoutPlan = {
  inMiniGrid: (key: string) => boolean;
  layoutIdFor: (key: string) => string | undefined;
  nonLayoutIdxOf: (key: string) => number | null;
  totalNonLayout: number;
  appsByKey: ReadonlyMap<string, FolderAppEntry>;
};

function planLayout(
  items: readonly FolderChild[],
  folderId: string
): LayoutPlan {
  const idxByKey = new Map<string, number>();
  items.forEach((it, i) => idxByKey.set(it.key, i));

  const appsByKey = new Map<string, FolderAppEntry>();
  for (const it of items) if (isAppEntry(it)) appsByKey.set(it.key, it);

  const inMiniGrid = (key: string) => {
    const idx = idxByKey.get(key);
    return idx !== undefined && idx >= MINI_GRID_START && idx <= MINI_GRID_END;
  };

  const layoutIdFor = (key: string): string | undefined => {
    const idx = idxByKey.get(key);
    if (idx === undefined) return undefined;
    const entry = items[idx];
    const override = isAppEntry(entry) ? entry.layoutId : undefined;
    if (override) return override;
    if (inMiniGrid(key)) return `${folderId}:${key}`;
    return undefined;
  };

  const nonLayoutIdxByKey = new Map<string, number>();
  for (const it of items) {
    if (!inMiniGrid(it.key))
      nonLayoutIdxByKey.set(it.key, nonLayoutIdxByKey.size);
  }

  return {
    inMiniGrid,
    layoutIdFor,
    nonLayoutIdxOf: (key) => nonLayoutIdxByKey.get(key) ?? null,
    totalNonLayout: nonLayoutIdxByKey.size,
    appsByKey,
  };
}

function itemMotion(
  hasSharedElement: boolean,
  rect: LayoutRect | null,
  center: { x: number; y: number } | null,
  nonLayoutIdx: number | null,
  totalNonLayout: number,
  folderSpring: Transition
): MotionProps {
  if (hasSharedElement) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: folderSpring,
    };
  }

  const offsetsReady = rect !== null && center !== null;
  const offset: Offset = offsetsReady
    ? computeOffset(rect, center)
    : { x: 0, y: 0 };
  const stagger =
    offsetsReady && nonLayoutIdx !== null
      ? computeStagger(nonLayoutIdx, totalNonLayout)
      : { enter: 0, exit: 0 };

  return {
    initial: offsetsReady
      ? { opacity: 0, scale: 0.2, x: offset.x, y: offset.y }
      : { opacity: 0 },
    animate: offsetsReady
      ? { opacity: 1, scale: 1, x: 0, y: 0 }
      : { opacity: 0 },
    exit: {
      opacity: 0,
      scale: 0.2,
      x: offset.x,
      y: offset.y,
      transition: {
        ...folderSpring,
        delay: stagger.exit,
        opacity: { delay: 0.05 },
      },
    },
    transition: { ...folderSpring, delay: stagger.enter } as Transition,
  };
}

function closedShell(folderSpring: Transition): MotionProps {
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: folderSpring,
  };
}

export function buildRenderPlan(input: RenderPlanInput): RenderPlan {
  const { items, folderId, state, rects, center, hiddenKey, motion } = input;
  const plan = planLayout(items, folderId);
  const isOpen = selectors.isShellOpen(state);

  const offsetsReady =
    center !== null &&
    items.length > 0 &&
    items.every((it) => plan.inMiniGrid(it.key) || rects[it.key] != null);

  const itemFrames: ItemFrame[] = items.map((item) => {
    const hasSharedElement = plan.inMiniGrid(item.key);
    const rect = rects[item.key] ?? null;
    const nonLayoutIdx = hasSharedElement
      ? null
      : plan.nonLayoutIdxOf(item.key);
    return {
      key: item.key,
      iconSrc: item.iconSrc,
      label: item.label,
      layoutId: plan.layoutIdFor(item.key),
      hasSharedElement,
      tappable: plan.appsByKey.has(item.key) || item.href != null,
      hidden: hiddenKey === item.key,
      motion: itemMotion(
        hasSharedElement,
        rect,
        center,
        nonLayoutIdx,
        plan.totalNonLayout,
        motion.folderSpring
      ),
      reactKey: hasSharedElement
        ? item.key
        : `${item.key}-${offsetsReady ? "ready" : "wait"}`,
    };
  });

  return {
    isOpen,
    items: itemFrames,
    largeItems: itemFrames.slice(0, LARGE_END),
    miniItems: itemFrames.slice(LARGE_END, MINI_END),
    layoutIdFor: plan.layoutIdFor,
    shell: {
      backdrop: BACKDROP,
      title: TITLE,
      grid: GRID,
      closed: closedShell(motion.folderSpring),
      transition: { ...motion.folderSpring, bounce: 0 } as Transition,
    },
  };
}
