import { motion, useTransform, type MotionValue } from "framer-motion";
import { Clock } from "../components/Clock";
import { MusicWidget } from "../components/MusicWidget";
import { WEDDING } from "./invitation/data";

interface LockScreenProps {
  y: MotionValue<number>;
  onUnlock: () => void;
}

export default function LockScreen({ y, onUnlock }: LockScreenProps) {
  const radius = useTransform(y, [-150, 0], [48, 0], { clamp: true });

  return (
    <motion.div
      style={{
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        backgroundImage: "url('/wallpaper-lock.jpg')",
      }}
      onClick={onUnlock}
      className="relative w-full h-full font-sans bg-cover bg-center bg-no-repeat overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative h-full flex flex-col justify-between items-center pt-16 pb-12">
        <div className="pointer-events-none flex flex-col items-center">
          <Clock />
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/75">
            {WEDDING.dateLong}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/50">
            {WEDDING.ceremony}
          </p>
        </div>

        <div className="flex flex-col items-center gap-7">
          <MusicWidget onPlay={() => setTimeout(onUnlock, 660)} />

          <div className="flex flex-col items-center gap-1.5 text-white/65">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
              <path
                d="M12 9l3-3.5L12 2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.24em]">
              Swipe up to open
            </span>
          </div>

          <div className="flex items-center gap-[180px]">
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Flashlight"
              className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-xl grid place-items-center"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
            >
              <img src="/icons/lock-flashlight.svg" alt="" className="w-[10px] h-[24px]" />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Camera"
              className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-xl grid place-items-center"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
            >
              <img src="/icons/lock-camera.svg" alt="" className="w-[20px] h-[16px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/20" />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-white" />
    </motion.div>
  );
}
