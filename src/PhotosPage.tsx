import { useMemo, useState, type ReactNode } from "react";
import Masonry from "@/components/Masonry";
import GlassSurface from "@/components/GlassSurface";
import PhotoLightbox, { AnimatePresence } from "./PhotoLightbox";
import { useCustomMedia } from "./custom-media";
import { WEDDING } from "./invitation/data";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

// iOS active accent for the selected tab (Figma rgb 0,0.75,0.91).
const ACCENT = "#00C0E8";

// Dark liquid glass tint sat over GlassSurface so the chrome reads dark
// regardless of the OS color scheme (Figma fill: gray ~0.2 + white 0.24).
const DARK_TINT = "rgba(44,44,46,0.45)";
// Brighter chip for the active tab (Figma white 0.5).
const ACTIVE_TINT = "rgba(255,255,255,0.22)";

// GlassSurface needs a fixed size; we stack a dark tint + content on top so it
// matches the design's dark glass and the OS-theme-dependent base doesn't show.
function Glass({
  w,
  h,
  radius,
  tint = DARK_TINT,
  className = "",
  children,
}: {
  w: number;
  h: number;
  radius: number;
  tint?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: w, height: h }}>
      <GlassSurface
        width={w}
        height={h}
        borderRadius={radius}
        backgroundOpacity={0.04}
        className="absolute inset-0"
      />
      <div className="absolute inset-0" style={{ borderRadius: radius, background: tint }} />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// Filter: three rounded lines tapering left-aligned (Figma 19/13/7 × 2px).
function FilterIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
      <rect x="0" y="0" width="19" height="2" rx="1" fill="white" />
      <rect x="3" y="5" width="13" height="2" rx="1" fill="white" />
      <rect x="6" y="10" width="7" height="2" rx="1" fill="white" />
    </svg>
  );
}

// House silhouette with a door notch (evenodd cutout).
function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 0L17 6.8V18H0V6.8L8.5 0ZM6.4 18V11.2C6.4 10.86 6.67 10.6 7 10.6H10C10.33 10.6 10.6 10.86 10.6 11.2V18H6.4Z"
        fill={color}
      />
    </svg>
  );
}

// Stacked photos (Figma "Collection" = two overlapping rounded cards).
function CollectionIcon() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
      <rect x="4" y="0" width="13" height="13" rx="2.5" stroke="white" strokeWidth="1.6" />
      <rect x="1" y="3.5" width="13" height="13" rx="2.5" fill="white" />
    </svg>
  );
}

// Magnifying glass (Figma circle + handle).
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2" />
      <line x1="14.2" y1="14.2" x2="20" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Stock photography from Pexels (see CREDITS.md) — deliberately no real couple
// photos and no faces: lehengas, chooda, mehndi, marigolds, diyas and the safa.
// Height is a masonry hint, not the real pixel height.
const WEDDING_PHOTOS: { file: string; height: number; video?: boolean }[] = [
  { file: "01.jpg", height: 560 },
  { file: "02.jpg", height: 330 },
  { file: "03.jpg", height: 560 },
  { file: "04.jpg", height: 440 },
  { file: "hands.mp4", height: 250, video: true },
  { file: "05.jpg", height: 330 },
  { file: "06.jpg", height: 440 },
  { file: "07.jpg", height: 330 },
  { file: "08.jpg", height: 300 },
  { file: "mehndi.mp4", height: 560, video: true },
  { file: "09.jpg", height: 300 },
  { file: "10.jpg", height: 560 },
  { file: "11.jpg", height: 330 },
  { file: "12.jpg", height: 330 },
  { file: "diyas.mp4", height: 560, video: true },
  { file: "13.jpg", height: 300 },
  { file: "14.jpg", height: 560 },
];

type AlbumItem = {
  id: string;
  img: string;
  url: string;
  height: number;
  kind?: "image" | "video";
};

export default function PhotosPage() {
  const { photos: uploadedPhotos, photoUrls } = useCustomMedia();

  const items = useMemo<AlbumItem[]>(() => {
    const uploaded = uploadedPhotos
      .map((photo) => ({
        id: photo.id,
        img: photoUrls[photo.id] ?? "",
        url: photoUrls[photo.id] ?? "",
        height: 900,
        kind: photo.kind,
      }))
      .filter((item) => item.img);

    if (uploaded.length) return uploaded;

    return WEDDING_PHOTOS.map(({ file, height, video }) =>
      video
        ? {
            id: file,
            img: `/videos/${file}`,
            url: `/videos/${file}`,
            poster: `/videos/${file.replace(/\.mp4$/, ".jpg")}`,
            height,
            kind: "video" as const,
          }
        : {
            id: file,
            img: `/photos/${file}`,
            url: `/photos/${file}`,
            height,
            kind: "image" as const,
          }
    );
  }, [uploadedPhotos, photoUrls]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox = (id: string) =>
    setLightboxIndex(items.findIndex((it) => it.id === id));

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
      style={{ fontFamily: SF_STACK }}
    >
      {/* Scrollable photo grid — runs under the floating chrome. */}
      <div className="h-full w-full overflow-y-auto">
        <Masonry
          items={items}
          blurToFocus
          scaleOnHover={false}
          colorShiftOnHover={false}
          onItemClick={openLightbox}
        />
      </div>

      {/* Top: dark scrim + progressive blur for header legibility. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[150px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[120px] backdrop-blur-md"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 35%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        }}
      />

      {/* Bottom: dark scrim + progressive blur for nav legibility. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[150px]"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[120px] backdrop-blur-md"
        style={{
          WebkitMaskImage: "linear-gradient(to top, black 35%, transparent 100%)",
          maskImage: "linear-gradient(to top, black 35%, transparent 100%)",
        }}
      />

      {/* Header */}
      <header
        className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4"
        style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}
      >
        <div className="pt-0.5">
          <div className="text-[13px] font-semibold text-white">
            {WEDDING.ceremony}
          </div>
          <div className="mt-0.5 text-[11px] text-white/60">
            {WEDDING.dateShort}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="transition-transform active:scale-[0.97]">
            <Glass w={50} h={36} radius={18}>
              <FilterIcon />
            </Glass>
          </button>
          <button type="button" className="transition-transform active:scale-[0.97]">
            <Glass w={66} h={36} radius={18}>
              <span className="text-[13px] font-semibold text-white">Select</span>
            </Glass>
          </button>
        </div>
      </header>

      {/* Bottom navigation + search */}
      <nav
        className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between pl-9 pr-[38px]"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 10px)" }}
      >
        <Glass w={158} h={51} radius={25.5} className="shrink-0">
          <div className="flex h-full w-full items-center px-[3px]">
            {/* Home — active */}
            <button type="button" className="transition-transform active:scale-[0.97]">
              <Glass w={79} h={45} radius={22} tint={ACTIVE_TINT}>
                <div className="flex flex-col items-center gap-0.5">
                  <HomeIcon color={ACCENT} />
                  <span className="text-[10px] font-semibold" style={{ color: ACCENT }}>
                    Home
                  </span>
                </div>
              </Glass>
            </button>
            {/* Collection */}
            <button
              type="button"
              className="flex flex-1 flex-col items-center gap-0.5 transition-transform active:scale-[0.97]"
            >
              <CollectionIcon />
              <span className="text-[10px] font-semibold text-white">Collections</span>
            </button>
          </div>
        </Glass>

        <button type="button" className="shrink-0 transition-transform active:scale-[0.97]">
          <Glass w={51} h={51} radius={25.5}>
            <SearchIcon />
          </Glass>
        </button>
      </nav>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={items}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
