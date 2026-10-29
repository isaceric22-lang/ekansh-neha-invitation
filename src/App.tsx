import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import IosAppFolder from "./IosAppFolder";
import LockScreen from "./LockScreen";
import UnlockCeremony from "./UnlockCeremony";
import { MusicProvider } from "./music";
import { MediaProvider } from "./custom-media";
import BootScreen from "./boot/BootScreen";

const LOCK_TRANSITION = { duration: 0.85, ease: [0.32, 0.72, 0, 1] } as const;

// Lock-screen layers are `fixed` inside the transformed #root, so they span the
// phone frame — measure its height, not the window's (which differs on desktop).
const frameHeight = () =>
  document.getElementById("root")?.getBoundingClientRect().height ??
  window.innerHeight;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  /** The Ganesha blessing that plays the first time the lock screen opens. */
  const [ceremony, setCeremony] = useState(false);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setCeremony(true);
  }, []);
  /** Shared y for the lock-screen layer. 0 = covering; -innerHeight = hidden above. */
  const y = useMotionValue(0);

  // Snap to the target whenever isLocked changes (e.g. drag crossed threshold).
  useEffect(() => {
    const target = isLocked ? 0 : -frameHeight();
    const controls = animate(y, target, LOCK_TRANSITION);
    return () => controls.stop();
  }, [isLocked, y]);

  return (
    <MediaProvider>
      <MusicProvider>
        {/* The home screen sits behind the lock screen and settles from a slight
            zoom as the lock lifts — the same depth cue iOS uses on unlock. */}
        <motion.div
          className="fixed inset-0"
          initial={false}
          animate={{ scale: isLocked ? 1.035 : 1, opacity: isLocked ? 0.7 : 1 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <IosAppFolder />
        </motion.div>
        {/* <NotificationsStack /> */}

        {/* Always-mounted lock-screen layer. Drag-up to unlock when locked. */}
        <motion.div
          className="fixed inset-0 z-[20000] touch-none"
          style={{ y, pointerEvents: isLocked ? "auto" : "none" }}
          drag={isLocked ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.6, bottom: 0 }}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.y < -120 || info.velocity.y < -500) {
              unlock();
            }
          }}
        >
          <LockScreen y={y} onUnlock={unlock} />
        </motion.div>

        {/* Top-edge handle: pan to pull the lock screen down in real-time. */}
        {!isLocked && (
          <motion.div
            className="fixed top-0 inset-x-0 h-11 z-[20001] touch-none"
            onPan={(_, info) => {
              const h = frameHeight();
              const delta = Math.max(0, Math.min(h, info.offset.y));
              y.set(-h + delta);
            }}
            onPanEnd={(_, info) => {
              const h = frameHeight();
              const past = info.offset.y > h * 0.25 || info.velocity.y > 500;
              if (past) setIsLocked(true);
              else animate(y, -h, LOCK_TRANSITION);
            }}
          />
        )}

        {/* Ganesha is invoked as the invitation opens. */}
        <AnimatePresence>
          {ceremony && <UnlockCeremony key="ceremony" onDone={() => setCeremony(false)} />}
        </AnimatePresence>

        {/* Boot screen on top; fades out once critical assets finish loading. */}
        <AnimatePresence>
          {booting && (
            <BootScreen key="boot" onFinished={() => setBooting(false)} />
          )}
        </AnimatePresence>
      </MusicProvider>
    </MediaProvider>
  );
}
