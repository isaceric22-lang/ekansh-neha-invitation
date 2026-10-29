import type { ReactNode } from "react";
import type { ChromeOverride } from "../app-nav/types";

export type FolderEntry = {
  key: string;
  iconSrc: string;
  label: string;
  /** Tap opens this external URL in a new tab instead of an in-app screen. */
  href?: string;
};

export type FolderAppEntry = FolderEntry & {
  app: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  /** Escape hatch: override the auto-generated framer-motion layoutId. */
  layoutId?: string;
  /** Backplate color revealed during expand. Defaults to white. */
  background?: string;
  /** 99% case: omit. Apps that bring their own chrome set this (e.g. "none"). */
  chrome?: Partial<ChromeOverride>;
};

export type FolderChild = FolderEntry | FolderAppEntry;

export function isAppEntry(child: FolderChild): child is FolderAppEntry {
  return "app" in child && (child as FolderAppEntry).app !== undefined;
}
