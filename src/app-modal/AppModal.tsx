import { motion } from "framer-motion";
import { X } from "lucide-react";
import GlassSurface from "@/components/GlassSurface";
import type { ModalFrame } from "./modalFrame";

const BACK_TINT = "rgba(44,44,46,0.45)";

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppModal({
  frame,
  onClose,
}: {
  frame: ModalFrame;
  onClose: () => void;
}) {
  const { chrome } = frame;
  const showHeader = chrome.title !== undefined || chrome.closeButton === "header-right";

  return (
    <motion.div
      key={`app-${frame.key}`}
      className="fixed overflow-hidden shadow-2xl"
      style={{ zIndex: chrome.zIndex }}
      {...frame.shell}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: chrome.background ?? "#ffffff" }}
        {...frame.backplate}
      />
      <motion.img
        src={frame.iconSrc}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        {...frame.iconCrossfade}
      />

      {showHeader && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-30 px-4 pt-[18px]"
          {...frame.header}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-[34px] leading-[41px] font-bold text-white tracking-tight truncate">
              {chrome.title}
            </div>
            {chrome.closeButton === "header-right" && (
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 shrink-0 rounded-full bg-white/30 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/40"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {chrome.closeButton === "floating-left" && (
        <motion.button
          type="button"
          onClick={onClose}
          className="absolute z-30 transition-transform active:scale-[0.97]"
          style={{ top: "var(--safe-top)", left: 14, width: 51, height: 51 }}
          aria-label="Close"
          {...frame.header}
        >
          <div className="relative h-full w-full">
            <GlassSurface
              width={51}
              height={51}
              borderRadius={25.5}
              backgroundOpacity={0.04}
              className="absolute inset-0"
            />
            <div
              className="absolute inset-0"
              style={{ borderRadius: 25.5, background: BACK_TINT }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <CloseIcon />
            </div>
          </div>
        </motion.button>
      )}

      <motion.div
        className={
          "absolute inset-0 overflow-auto" +
          (chrome.bodyPadding ? " pt-[72px] pb-6 px-4" : "")
        }
        {...frame.body}
      >
        {frame.appReady && frame.content}
      </motion.div>
    </motion.div>
  );
}
