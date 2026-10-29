import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WEDDING } from "./invitation/data";

const GOLD = "#EBCB8B";
const CREAM = "#FFF7E8";
const SF =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

/** Apple's standard sheet curve — fast out, long settle. */
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * The unlock beat, built like an iOS transition rather than a splash screen:
 * the lock screen lifts away, the home screen settles from a slight zoom, and
 * Lord Ganesha is invoked in a single glass "live activity" card that springs
 * in, holds for a breath, then dissolves with the dimmer.
 */
export default function UnlockCeremony({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Long enough to actually read the blessing and the names.
    // Long enough to actually read the blessing and the names.
    const leaveAt = window.setTimeout(() => setLeaving(true), reduceMotion ? 1200 : 3300);
    const finishAt = window.setTimeout(onDone, reduceMotion ? 1700 : 4000);
    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(finishAt);
    };
  }, [onDone, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[20050]"
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.55 : 0.2, ease: EASE }}
      role="status"
      aria-label="Invoking Lord Ganesha"
    >
      <style>{`
        @keyframes unlock-pop {
          from { transform: scale(0.9); }
          to   { transform: scale(1); }
        }
        @keyframes unlock-rise {
          from { transform: translateY(18px); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* iOS-style dimmer: the home screen stays visible behind frosted glass. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 38%, rgba(36,9,21,0.28) 0%, rgba(14,4,9,0.55) 100%)",
          backdropFilter: "blur(16px) saturate(1.15)",
          WebkitBackdropFilter: "blur(16px) saturate(1.15)",
        }}
      />

      {/* A few slow gold motes, the only ornament on the glass. */}
      {!reduceMotion &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${14 + ((i * 31) % 72)}%`,
              top: `${24 + ((i * 17) % 58)}%`,
              width: i % 3 === 0 ? 4 : 2.5,
              height: i % 3 === 0 ? 4 : 2.5,
              background: i % 2 ? GOLD : "#F6C56B",
              filter: "blur(0.4px)",
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: [0, 0.75, 0], y: -34 }}
            transition={{
              duration: 2.2 + (i % 4) * 0.35,
              delay: 0.1 + i * 0.09,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

      <div className="relative flex h-full flex-col items-center justify-center px-6 pb-10">
        {/* ── Ganesha medallion ─────────────────────────────────────────── */}
        <motion.div
          className="relative grid place-items-center"
          initial={false}
          animate={
            leaving ? { scale: 1.06, opacity: 0, y: -14 } : { scale: 1, opacity: 1, y: 0 }
          }
          transition={{ duration: leaving ? 0.45 : 0, ease: EASE }}
          style={{
            animation: reduceMotion ? undefined : "unlock-pop 0.9s cubic-bezier(0.22,0.9,0.28,1)",
          }}
        >
          {/* Warm halo */}
          <div
            className="pointer-events-none absolute h-[250px] w-[250px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(235,203,139,0.34) 0%, rgba(235,203,139,0.10) 46%, transparent 70%)",
            }}
          />

          {/* Thin rotating gold arc, like an Activity ring */}
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute h-[206px] w-[206px] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(235,203,139,0.05) 60deg, #F4DDAE 150deg, transparent 190deg)",
                padding: 1.4,
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* The portrait, lit like a physical enamel badge */}
          <div
            className="relative h-[176px] w-[176px] overflow-hidden rounded-full"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,247,232,0.35), 0 0 0 7px rgba(235,203,139,0.10), 0 22px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <img
              src="/ganesha.jpg"
              alt="Lord Ganesha"
              className="h-full w-full object-cover"
              draggable={false}
            />
            {/* Bottom glow + top light, so the circle reads as glass, not a cutout */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 118%, rgba(255,214,138,0.42) 0%, transparent 56%), radial-gradient(circle at 32% 12%, rgba(255,255,255,0.22) 0%, transparent 42%)",
                boxShadow: "inset 0 -14px 30px rgba(24,6,14,0.35)",
              }}
            />
            {/* Specular sweep across the enamel */}
            {!reduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-y-[-40%] w-[45%]"
                style={{
                  background:
                    "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.32) 50%, transparent 100%)",
                  filter: "blur(6px)",
                }}
                initial={{ x: -140, opacity: 0 }}
                animate={{ x: 200, opacity: [0, 0.9, 0] }}
                transition={{ duration: 1.1, delay: 0.35, ease: "easeInOut" }}
              />
            )}
          </div>
        </motion.div>

        {/* ── Glass blessing card ───────────────────────────────────────── */}
        <motion.div
          className="relative mt-8 w-full max-w-[312px] overflow-hidden rounded-[26px] px-6 pb-5 pt-5 text-center"
          initial={false}
          animate={leaving ? { opacity: 0, y: -8, scale: 1.02 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: leaving ? 0.45 : 0, ease: EASE, delay: leaving ? 0 : 0.15 }}
          style={{
            animation: reduceMotion ? undefined : "unlock-rise 0.8s cubic-bezier(0.22,0.9,0.28,1) 0.1s both",
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.09) 52%, rgba(255,255,255,0.14) 100%)",
            border: "0.7px solid rgba(255,255,255,0.34)",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.08)",
            backdropFilter: "blur(30px) saturate(1.5)",
            WebkitBackdropFilter: "blur(30px) saturate(1.5)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)",
            }}
          />

          <p
            className="text-[9.5px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD, fontFamily: SF }}
          >
            Shree Ganeshaya Namah
          </p>

          <p
            className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.022em]"
            style={{ color: CREAM, fontFamily: SF }}
          >
            {WEDDING.names}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2.5">
            <span
              className="h-px w-6"
              style={{ background: "linear-gradient(to right, transparent, rgba(235,203,139,0.8))" }}
            />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ color: "rgba(255,247,232,0.78)", fontFamily: SF }}
            >
              {WEDDING.ceremony}
            </span>
            <span
              className="h-px w-6"
              style={{ background: "linear-gradient(to left, transparent, rgba(235,203,139,0.8))" }}
            />
          </div>

          <p
            className="mt-2.5 text-[11.5px] tracking-[0.01em]"
            style={{ color: "rgba(255,247,232,0.55)", fontFamily: SF }}
          >
            {WEDDING.dateLong}
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
