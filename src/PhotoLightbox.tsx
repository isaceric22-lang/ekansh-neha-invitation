import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";

export interface LightboxPhoto {
  id: string;
  url: string;
  kind?: "image" | "video";
}

// iOS-style spring used for paging + dismiss snap-back.
const SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } as const;

interface Props {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
}

// A single video slide: only the page currently on screen plays.
function VideoSlide({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      controls
      playsInline
      className="max-h-full max-w-full select-none object-contain"
    />
  );
}

export default function PhotoLightbox({ photos, index, onClose }: Props) {
  const [page, setPage] = useState(index);
  // Track the lightbox frame size — it's `fixed` inside the transformed #root,
  // so it spans the phone frame (440px on desktop), not `window.innerWidth`.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });

  // Horizontal track offset (paging) + vertical drag offset (swipe-to-dismiss).
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Background dims out as the photo is dragged down.
  const bgOpacity = useTransform(y, [0, 280], [1, 0]);
  const imgScale = useTransform(y, [0, 280], [1, 0.85]);

  // Whether the in-flight gesture is locked to a vertical (dismiss) drag.
  const draggingDown = useRef(false);
  // Snap to the opening page instantly on first measure; spring thereafter.
  const aligned = useRef(false);
  // Track offset (`x`) where the current pan started, so fast consecutive
  // swipes follow the finger from mid-flight instead of snapping to -page*w.
  const startX = useRef(0);
  // Handle to the active paging animation, so a new gesture can stop it.
  const xAnim = useRef<ReturnType<typeof animate> | null>(null);
  // Set when a swipe drives the page change — the spring is already started in
  // `handleDragEnd` (with finger velocity), so the page effect must not restart it.
  const pagedByDrag = useRef(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Keep the track aligned to the current page when page/width changes.
  useEffect(() => {
    if (!w) return;
    if (!aligned.current) {
      x.set(-page * w);
      aligned.current = true;
      return;
    }
    // Swipe already started the spring with momentum; don't restart it flat.
    if (pagedByDrag.current) {
      pagedByDrag.current = false;
      return;
    }
    const controls = animate(x, -page * w, SPRING);
    xAnim.current = controls;
    return controls.stop;
  }, [page, w, x]);

  const goTo = useCallback(
    (next: number) => setPage(Math.max(0, Math.min(photos.length - 1, next))),
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goTo(page + 1);
      else if (e.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, goTo, onClose]);

  const handleDragStart = (_: unknown, info: PanInfo) => {
    // Stop any in-flight paging spring and pin tracking to its current offset,
    // so a fast follow-up swipe doesn't fight the animation or jump.
    xAnim.current?.stop();
    startX.current = x.get();
    // Lock to vertical dismiss only when the gesture starts clearly downward.
    draggingDown.current =
      Math.abs(info.delta.y) > Math.abs(info.delta.x) && info.delta.y > 0;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (draggingDown.current) {
      y.set(Math.max(0, info.offset.y));
    } else {
      // Follow the finger from where the pan started; rubber-band at the ends.
      let next = startX.current + info.offset.x;
      const min = -(photos.length - 1) * w;
      if (next > 0) next *= 0.35;
      else if (next < min) next = min + (next - min) * 0.35;
      x.set(next);
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (draggingDown.current) {
      if (info.offset.y > 140 || info.velocity.y > 700) {
        animate(y, h, { duration: 0.25 });
        onClose();
      } else {
        animate(y, 0, SPRING);
      }
      draggingDown.current = false;
      return;
    }
    const threshold = w * 0.22;
    let next = page;
    if (info.offset.x < -threshold || info.velocity.x < -500) next = page + 1;
    else if (info.offset.x > threshold || info.velocity.x > 500) next = page - 1;
    const clamped = Math.max(0, Math.min(photos.length - 1, next));
    // Start the spring immediately and carry the finger's velocity into it, so
    // fast consecutive swipes flow continuously instead of restarting flat.
    pagedByDrag.current = clamped !== page;
    xAnim.current = animate(x, -clamped * w, {
      ...SPRING,
      velocity: info.velocity.x,
    });
    if (clamped !== page) setPage(clamped);
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      style={{ opacity: bgOpacity }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Paged track of all photos. */}
      <motion.div
        className="flex h-full"
        style={{ x, y, width: photos.length * w, touchAction: "none" }}
        onPanStart={handleDragStart}
        onPan={handleDrag}
        onPanEnd={handleDragEnd}
      >
        {photos.map((p, i) => (
          <div
            key={p.id}
            className="flex h-full items-center justify-center"
            style={{ width: w }}
          >
            {p.kind === "video" ? (
              <motion.div
                className="flex h-full w-full items-center justify-center"
                style={{ scale: i === page ? imgScale : 1 }}
              >
                <VideoSlide src={p.url} active={i === page} />
              </motion.div>
            ) : (
              <motion.img
                src={p.url}
                alt=""
                draggable={false}
                className="max-h-full max-w-full select-none object-contain"
                style={{ scale: i === page ? imgScale : 1 }}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Close button + counter, fade with the background. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4"
        style={{ paddingTop: "calc(var(--safe-top) + 12px)", opacity: bgOpacity }}
      >
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-xl transition-transform hover:bg-white/40 active:scale-[0.97]"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur-md">
          {page + 1} / {photos.length}
        </span>
      </motion.div>
    </motion.div>
  );
}

export { AnimatePresence };
