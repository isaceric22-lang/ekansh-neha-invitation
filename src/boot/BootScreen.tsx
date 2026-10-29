import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePreloadAssets } from "./usePreloadAssets";

const IOS_EASE = [0.4, 0, 0.2, 1] as const;
// Keep the boot screen up at least this long so the fill reads as motion even
// when assets are already cached — matches the brief glow of a real iPhone boot.
const MIN_VISIBLE_MS = 700;

/** Apple-style boot screen: black field, Apple mark, thin filling progress bar. */
export default function BootScreen({ onFinished }: { onFinished: () => void }) {
  const { ready } = usePreloadAssets();
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const elapsed = performance.now() - (mountedAt.current ?? performance.now());
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const id = setTimeout(onFinished, wait);
    return () => clearTimeout(id);
  }, [ready, onFinished]);

  return (
    <motion.div
      className="fixed inset-0 z-[30000] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: IOS_EASE }}
    >
      {/* Apple mark */}
      <svg
        viewBox="0 0 814 1000"
        aria-label="Apple"
        className="h-[88px] w-auto fill-white"
      >
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
      </svg>
    </motion.div>
  );
}
