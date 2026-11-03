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
  /** Still frame shown until the video decodes its first frame. */
  poster?: string;
}

// iOS-style spring used for paging + dismiss snap-back.
const SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } as const;

interface Props {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const iconButton =
  "grid h-9 w-9 place-items-center rounded-full text-white/90 transition-transform active:scale-90";

/* SF-Symbol-ish glyphs for the player bar. */
const SpeakerIcon = ({ muted }: { muted: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor" />
    {muted ? (
      <path d="M16 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    ) : (
      <>
        <path d="M15.4 9a4.2 4.2 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 6.6a7.6 7.6 0 0 1 0 10.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const AirPlayIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4.5 16.5h-1A1.5 1.5 0 0 1 2 15V6a1.5 1.5 0 0 1 1.5-1.5h17A1.5 1.5 0 0 1 22 6v9a1.5 1.5 0 0 1-1.5 1.5h-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 13.5 15.8 19H8.2L12 13.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const PiPIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
    <rect x="12" y="11.5" width="7" height="5.6" rx="1.2" fill="currentColor" />
  </svg>
);

const ExpandIcon = ({ shrink }: { shrink: boolean }) =>
  shrink ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 4v5H4M15 20v-5h5M20 9h-5V4M4 15h5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

/**
 * One video slide with the iOS player's chrome: tap to show/hide, a centre
 * play/pause, an elapsed/remaining scrubber and the mute / AirPlay / PiP /
 * fullscreen row. The native `controls` attribute is gone on purpose — it brings
 * the desktop skin, which is what looked wrong inside the phone.
 */
function VideoSlide({
  src,
  poster,
  active,
}: {
  src: string;
  poster?: string;
  active: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  // Chrome hides itself a couple of seconds into playback, like the real player.
  useEffect(() => {
    clearHideTimer();
    if (!playing || !chrome) return;
    hideTimer.current = window.setTimeout(() => setChrome(false), 2600);
    return clearHideTimer;
  }, [playing, chrome]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      setChrome(true);
      void video.play().catch(() => {
        // Autoplay with sound can be refused; the centre control still works.
      });
    } else {
      video.pause();
      setChrome(true);
    }
  }, [active]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
    setChrome(true);
  }, []);

  const seekTo = (fraction: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(fraction, 0), 1) * video.duration;
    setTime(video.currentTime);
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setExpanded(false);
      } else {
        await el.requestFullscreen();
        setExpanded(true);
      }
    } catch {
      // Fullscreen can be refused inside an embedded frame; the icon stays put.
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      // PiP needs user activation and browser support.
    }
  };

  const progress = duration ? Math.min(time / duration, 1) : 0;

  return (
    <div ref={wrapRef} className="relative flex h-full w-full items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        muted={muted}
        onClick={() => setChrome((v) => !v)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        className="max-h-full max-w-full select-none object-contain"
      />

      {/* Centre play / pause, only while the chrome is up. */}
      <AnimatePresence>
        {chrome && (
          <motion.button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="absolute grid h-[68px] w-[68px] place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
            style={{ border: "1px solid rgba(255,255,255,0.28)" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.16 }}
          >
            {playing ? (
              <svg width="22" height="24" viewBox="0 0 18 20" fill="currentColor" aria-hidden>
                <rect x="1" y="0" width="5" height="20" rx="1.6" />
                <rect x="12" y="0" width="5" height="20" rx="1.6" />
              </svg>
            ) : (
              <svg width="22" height="24" viewBox="0 0 12 13" fill="currentColor" aria-hidden>
                <path d="M11.4 5.6a1 1 0 0 1 0 1.8l-9.6 5.4A1 1 0 0 1 .3 12V1a1 1 0 0 1 1.5-.9l9.6 5.5Z" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom transport bar. */}
      <AnimatePresence>
        {chrome && (
          <motion.div
            className="absolute inset-x-0 bottom-0 px-4 pb-4"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-2">
              <span className="w-[38px] shrink-0 text-[11px] font-medium tabular-nums text-white/85">
                {formatTime(time)}
              </span>
              <div className="relative flex-1 py-2">
                <div className="h-[4px] w-full overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={progress}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Seek"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <span className="w-[38px] shrink-0 text-right text-[11px] font-medium tabular-nums text-white/85">
                -{formatTime(Math.max(duration - time, 0))}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                className={iconButton}
              >
                <SpeakerIcon muted={muted} />
              </button>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="AirPlay" className={iconButton}>
                  <AirPlayIcon />
                </button>
                <button type="button" onClick={togglePiP} aria-label="Picture in Picture" className={iconButton}>
                  <PiPIcon />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={expanded ? "Exit full screen" : "Full screen"}
                  className={iconButton}
                >
                  <ExpandIcon shrink={expanded} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
                <VideoSlide src={p.url} poster={p.poster} active={i === page} />
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
