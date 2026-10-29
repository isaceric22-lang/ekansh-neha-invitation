import { motion } from "framer-motion";
import type { RefObject } from "react";
import type { RenderPlan } from "../core/renderPlan";
import { Tile } from "./Tile";

export function FolderClosed({
  title,
  plan,
  miniGridRef,
  onOpen,
}: {
  title?: string;
  plan: RenderPlan;
  miniGridRef: RefObject<HTMLDivElement | null>;
  onOpen: () => void;
}) {
  return (
    <motion.div
      key="closed"
      className="flex flex-col items-center gap-3 select-none cursor-pointer"
      onClick={onOpen}
      {...plan.shell.closed}
    >
      <div className="relative rounded-[26px] p-3 bg-white/35 border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="grid grid-cols-[repeat(2,60px)] grid-rows-[repeat(2,60px)] gap-3">
          {plan.largeItems.map((item) => (
            <Tile key={item.key} iconSrc={item.iconSrc} label={item.label} />
          ))}
          <div
            ref={miniGridRef}
            className="grid grid-cols-[repeat(2,27px)] grid-rows-[repeat(2,27px)] gap-[6px] cursor-pointer transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-95"
          >
            {plan.miniItems.map((item) => (
              <div className="relative aspect-square" key={item.key}>
                <Tile
                  layoutId={item.layoutId}
                  iconSrc={item.iconSrc}
                  label={item.label}
                />
                {item.layoutId ? (
                  <motion.div
                    layoutId={`label-${item.layoutId}`}
                    className="absolute left-1/2 top-full -translate-x-1/2 mt-2 text-sm font-medium text-white pointer-events-none whitespace-nowrap"
                    style={{ opacity: 0 }}
                    aria-hidden="true"
                  >
                    {item.label}
                  </motion.div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      {title ? (
        <div className="text-[0.95rem] leading-none font-medium text-white">
          {title}
        </div>
      ) : null}
    </motion.div>
  );
}
