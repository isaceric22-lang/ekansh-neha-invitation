import { useEffect, useState } from "react";
import { CRITICAL_ASSETS } from "./assets";

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    // Resolve on both load and error: a missing asset must not stall boot.
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

type Preload = { progress: number; ready: boolean };

/**
 * Preloads the critical lock/home assets and the web fonts, reporting a 0..1
 * progress. `ready` flips true once every step settles. Each loaded asset and
 * the font set count as one unit of progress.
 */
export function usePreloadAssets(): Preload {
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fontStep = "fonts" in document ? 1 : 0;
    const tick = () => {
      if (!cancelled) setLoaded((n) => n + 1);
    };

    const jobs: Promise<void>[] = CRITICAL_ASSETS.map((src) =>
      preloadImage(src).then(tick),
    );
    if (fontStep) {
      jobs.push(document.fonts.ready.then(() => tick()));
    }

    Promise.all(jobs).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
    // CRITICAL_ASSETS is a module constant — run once.
  }, []);

  const total = CRITICAL_ASSETS.length + ("fonts" in document ? 1 : 0);
  return { progress: total === 0 ? 1 : loaded / total, ready };
}
