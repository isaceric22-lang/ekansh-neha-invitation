import { motion } from "framer-motion";
import type { ItemFrame } from "../core/renderPlan";
import { Tile } from "./Tile";
import { APP_ICON_ATTR } from "./useIosFolderGeometry";

export function OpenItem({
  item,
  registerRef,
  onItemClick,
}: {
  item: ItemFrame;
  registerRef: (el: HTMLDivElement | null) => void;
  onItemClick: (key: string) => void;
}) {
  return (
    <motion.div
      data-folder-item={item.key}
      className={
        "flex flex-col items-center" +
        (item.tappable ? " cursor-pointer" : " cursor-default")
      }
      aria-disabled={item.tappable ? undefined : true}
      onClick={(e) => {
        e.stopPropagation();
        if (item.tappable) onItemClick(item.key);
      }}
      ref={registerRef}
      {...item.motion}
    >
      <div
        {...{ [APP_ICON_ATTR]: item.key }}
        className="w-[4.25rem] h-[4.25rem]"
        style={{ visibility: item.hidden ? "hidden" : "visible" }}
      >
        <Tile
          layoutId={item.layoutId}
          iconSrc={item.iconSrc}
          label={item.label}
        />
      </div>
      {item.layoutId ? (
        <motion.div
          layoutId={`label-${item.layoutId}`}
          className="mt-2 text-sm font-medium text-white whitespace-nowrap"
        >
          {item.label}
        </motion.div>
      ) : (
        <div className="mt-2 text-sm font-medium text-white whitespace-nowrap">
          {item.label}
        </div>
      )}
    </motion.div>
  );
}
