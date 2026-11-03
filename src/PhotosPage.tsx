import { useMemo, useState } from "react";
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
  children?: React.ReactNode;
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
function CollectionIcon({ color = "white" }: { color?: string }) {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
      <rect x="4" y="0" width="13" height="13" rx="2.5" stroke={color} strokeWidth="1.6" />
      <rect x="1" y="3.5" width="13" height="13" rx="2.5" fill={color} />
    </svg>
  );
}

/**
 * The album is the drawn set again: cream paper, gold rules, single-colour line
 * art (sources in CREDITS.md). No photographs — a stock couple standing in for
 * Ekansh and Neha reads as strangers, and the drawn plates are the register this
 * invitation was designed around. Heights are masonry hints, not real pixels.
 */
const PHOTOS: { file: string; height: number }[] = [
  { file: "01.jpg", height: 560 }, // couple plate
  { file: "02.jpg", height: 330 }, // palanquin
  { file: "03.jpg", height: 560 }, // peacock feather
  { file: "04.jpg", height: 440 }, // gold mandala
  { file: "05.jpg", height: 330 }, // flower wreath
  { file: "06.jpg", height: 440 }, // ceremony
  { file: "07.jpg", height: 330 }, // baraat horse
  { file: "08.jpg", height: 300 }, // henna swirl
  { file: "09.jpg", height: 300 }, // diya
  { file: "10.jpg", height: 560 }, // ganesha
  { file: "11.jpg", height: 330 }, // peacock feather (maroon)
  { file: "12.jpg", height: 330 }, // henna vine
  { file: "13.jpg", height: 300 }, // henna flower
  { file: "14.jpg", height: 560 }, // ganesha mark
  // Weighted towards the couple and the ceremony, like the first page.
  { file: "15.jpg", height: 300 }, // the pair, wide
  { file: "16.jpg", height: 545 }, // garland exchange, gold on maroon
  { file: "17.jpg", height: 440 }, // the ceremony, full bleed
  { file: "18.jpg", height: 589 }, // the pair, tall gold plate
  { file: "19.jpg", height: 327 }, // baraat horse
  { file: "20.jpg", height: 589 }, // palanquin arriving
];

const CLIPS: { file: string; height: number }[] = [
  { file: "diya.mp4", height: 480 }, // diyas burning
  { file: "mandap.mp4", height: 300 }, // the mandap dressed
  { file: "hands.mp4", height: 300 }, // hands held, below the shoulders
];

type AlbumItem = {
  id: string;
  img: string;
  url: string;
  height: number;
  kind: "image" | "video";
  poster?: string;
};

/** Interleave the clips through the plates so the grid keeps moving. */
const ORDER: string[] = [
  "15.jpg",
  "16.jpg",
  "diya.mp4",
  "01.jpg",
  "17.jpg",
  "18.jpg",
  "hands.mp4",
  "03.jpg",
  "19.jpg",
  "20.jpg",
  "mandap.mp4",
  "06.jpg",
  "02.jpg",
  "04.jpg",
  "05.jpg",
  "07.jpg",
  "08.jpg",
  "09.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
  "13.jpg",
  "14.jpg",
];

const FAVOURITES = ["15.jpg", "16.jpg", "18.jpg", "01.jpg", "20.jpg", "17.jpg"];

function buildAlbum(): AlbumItem[] {
  const byFile = new Map<string, AlbumItem>();
  for (const p of PHOTOS) {
    byFile.set(p.file, {
      id: p.file,
      img: `/photos/${p.file}`,
      url: `/photos/${p.file}`,
      height: p.height,
      kind: "image",
    });
  }
  for (const c of CLIPS) {
    const poster = `/videos/${c.file.replace(/\.mp4$/, ".jpg")}`;
    byFile.set(c.file, {
      id: c.file,
      img: poster,
      url: `/videos/${c.file}`,
      poster,
      height: c.height,
      kind: "video",
    });
  }
  const ordered = ORDER.map((file) => byFile.get(file)).filter(
    (item): item is AlbumItem => Boolean(item)
  );
  // Anything not named in ORDER still shows up at the end.
  const seen = new Set(ordered.map((item) => item.id));
  return [...ordered, ...[...byFile.values()].filter((item) => !seen.has(item.id))];
}

type Filter = "all" | "photos" | "videos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photos", label: "Photos" },
  { key: "videos", label: "Videos" },
];

/** A 2x2 mosaic of the first four items, the way iOS draws an album cover. */
function MosaicCover({ items }: { items: AlbumItem[] }) {
  const tiles = items.slice(0, 4);
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px] bg-white/10">
      {tiles.map((item) => (
        <div
          key={item.id}
          className="bg-cover bg-center"
          style={{ backgroundImage: `url(${item.img})` }}
        />
      ))}
      {Array.from({ length: Math.max(0, 4 - tiles.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-white/10" />
      ))}
    </div>
  );
}

export default function PhotosPage() {
  const { photos: uploadedPhotos, photoUrls } = useCustomMedia();
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<"home" | "collections">("home");
  const [viewer, setViewer] = useState<{ ids: string[]; index: number } | null>(null);

  const album = useMemo<AlbumItem[]>(() => {
    const uploaded = uploadedPhotos
      .map((photo) => ({
        id: photo.id,
        img: photoUrls[photo.id] ?? "",
        url: photoUrls[photo.id] ?? "",
        height: 900,
        kind: photo.kind ?? ("image" as const),
      }))
      .filter((item) => item.img);
    return uploaded.length ? (uploaded as AlbumItem[]) : buildAlbum();
  }, [uploadedPhotos, photoUrls]);

  const visible = useMemo(
    () =>
      album.filter((item) =>
        filter === "all"
          ? true
          : filter === "photos"
            ? item.kind === "image"
            : item.kind === "video"
      ),
    [album, filter]
  );

  const byId = useMemo(
    () => new Map(album.map((item) => [item.id, item])),
    [album]
  );

  // Recents mirrors what is on screen; the other two are fixed sets.
  const collections = useMemo(
    () => [
      { key: "recents", title: "Recents", items: visible },
      { key: "videos", title: "Videos", items: album.filter((i) => i.kind === "video") },
      {
        key: "favourites",
        title: "Favourites",
        items: FAVOURITES.map((id) => byId.get(id)).filter(
          (item): item is AlbumItem => Boolean(item)
        ),
      },
    ],
    [album, byId, visible]
  );

  const openAt = (ids: string[], id: string) => {
    const list = ids.filter((key) => byId.has(key));
    const index = Math.max(0, list.indexOf(id));
    setViewer({ ids: list.length ? list : ids, index });
  };

  const openCollection = (items: AlbumItem[]) => {
    if (!items.length) return;
    setViewer({ ids: items.map((item) => item.id), index: 0 });
  };

  const viewerPhotos = viewer
    ? (viewer.ids.map((id) => byId.get(id)).filter(Boolean) as AlbumItem[])
    : [];

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
      style={{ fontFamily: SF_STACK }}
    >
      {/* Scrollable content — runs under the floating chrome. */}
      <div className="h-full w-full overflow-y-auto">
        {tab === "home" ? (
          <Masonry
            // Remount per filter: the grid keeps per-card GSAP state, and a
            // filtered list is a different grid, not a relayout of the same one.
            key={filter}
            items={visible}
            blurToFocus
            scaleOnHover={false}
            colorShiftOnHover={false}
            onItemClick={(id) => openAt(visible.map((item) => item.id), id)}
          />
        ) : (
          <div
            className="grid grid-cols-2 gap-4 px-4"
            style={{ paddingTop: "calc(var(--safe-top) + 96px)" }}
          >
            {collections.map((collection) => (
              <button
                key={collection.key}
                type="button"
                onClick={() => openCollection(collection.items)}
                className="text-left transition-transform active:scale-[0.98]"
              >
                <div className="aspect-square overflow-hidden rounded-[14px]">
                  <MosaicCover items={collection.items} />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[14px] font-medium text-white">
                    {collection.title}
                  </span>
                  <span className="shrink-0 text-[12px] text-white/50">
                    {collection.items.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
        <div style={{ height: "calc(var(--safe-bottom) + 92px)" }} />
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

      {/* Header: title + a filter that actually filters. */}
      <header
        className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4"
        style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}
      >
        {/* Clear of the floating close button: it sits over the top-left 51px,
            so the title starts after it instead of underneath it. */}
        <div className="pt-0.5 pl-[62px]">
          <div className="text-[13px] font-semibold text-white">
            {WEDDING.ceremony}
          </div>
          <div className="mt-0.5 text-[11px] text-white/60">
            {WEDDING.dateShort}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/15 p-1 backdrop-blur-xl">
          {FILTERS.map((option) => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                aria-pressed={active}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? "white" : "transparent",
                  color: active ? "#0B0B0C" : "rgba(255,255,255,0.85)",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Bottom navigation: both tabs work, and there is no dead control. */}
      <nav
        className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 10px)" }}
      >
        <Glass w={158} h={51} radius={25.5} className="shrink-0">
          <div className="flex h-full w-full items-center px-[3px]">
            <button
              type="button"
              onClick={() => setTab("home")}
              aria-pressed={tab === "home"}
              className="transition-transform active:scale-[0.97]"
            >
              <Glass w={79} h={45} radius={22} tint={tab === "home" ? ACTIVE_TINT : "transparent"}>
                <div className="flex flex-col items-center gap-0.5">
                  <HomeIcon color={tab === "home" ? ACCENT : "white"} />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: tab === "home" ? ACCENT : "white" }}
                  >
                    Home
                  </span>
                </div>
              </Glass>
            </button>
            <button
              type="button"
              onClick={() => setTab("collections")}
              aria-pressed={tab === "collections"}
              className="flex flex-1 flex-col items-center gap-0.5 transition-transform active:scale-[0.97]"
            >
              <CollectionIcon color={tab === "collections" ? ACCENT : "white"} />
              <span
                className="text-[10px] font-semibold"
                style={{ color: tab === "collections" ? ACCENT : "white" }}
              >
                Collections
              </span>
            </button>
          </div>
        </Glass>
      </nav>

      <AnimatePresence>
        {viewer && viewerPhotos.length > 0 && (
          <PhotoLightbox
            photos={viewerPhotos}
            index={Math.min(viewer.index, viewerPhotos.length - 1)}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
