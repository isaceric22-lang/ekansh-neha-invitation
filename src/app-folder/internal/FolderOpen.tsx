import { motion } from "framer-motion";
import type { RenderPlan } from "../core/renderPlan";
import { OpenItem } from "./OpenItem";

export function FolderOpen({
  title,
  plan,
  registerItem,
  onItemClick,
  onBackdropClick,
}: {
  title?: string;
  plan: RenderPlan;
  registerItem: (key: string) => (el: HTMLDivElement | null) => void;
  onItemClick: (key: string) => void;
  onBackdropClick: () => void;
}) {
  return (
    <motion.div
      key="open"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
      onClick={onBackdropClick}
    >
      <motion.div className="absolute inset-0" {...plan.shell.backdrop} />
      <div className="relative flex flex-col items-start gap-4 w-full">
        {title ? (
          <motion.div
            className="text-3xl font-bold text-white pl-8"
            {...plan.shell.title}
          >
            {title}
          </motion.div>
        ) : null}
        <motion.div
          className="relative w-full max-w-[calc(100%-2rem)] mx-auto rounded-[2rem] p-6 bg-white/20 border border-white/20 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
          {...plan.shell.grid}
        >
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 justify-items-center">
            {plan.items.map((item) => (
              <OpenItem
                key={item.reactKey}
                item={item}
                registerRef={registerItem(item.key)}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
