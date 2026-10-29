import { AnimatePresence, MotionConfig } from "framer-motion";
import type { FolderChild } from "./app-folder/types";
import {
  useIosFolder,
  type IosFolderMotion,
} from "./app-folder/internal/useIosFolder";
import { FolderClosed } from "./app-folder/internal/FolderClosed";
import { FolderOpen } from "./app-folder/internal/FolderOpen";

export type {
  FolderEntry,
  FolderAppEntry,
  FolderChild,
} from "./app-folder/types";

export type AppFolderMotion = IosFolderMotion;

export type AppFolderProps = {
  title?: string;
  items: FolderChild[];
  motion?: AppFolderMotion;
};

export default function AppFolder({ title, items, motion }: AppFolderProps) {
  const folder = useIosFolder(items, motion);
  const { plan } = folder;

  return (
    <MotionConfig transition={plan.shell.transition}>
      <AnimatePresence
        initial={false}
        onExitComplete={folder.onShellExitComplete}
      >
        {plan.isOpen ? (
          <FolderOpen
            key="open"
            title={title}
            plan={plan}
            registerItem={folder.registerItem}
            onItemClick={folder.openApp}
            onBackdropClick={folder.closeFolder}
          />
        ) : (
          <FolderClosed
            key="closed"
            title={title}
            plan={plan}
            miniGridRef={folder.miniGridRef}
            onOpen={folder.openFolder}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
