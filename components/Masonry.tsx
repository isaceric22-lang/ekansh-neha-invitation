// Adapted from React Bits (https://reactbits.dev), © David Haz.
// MIT + Commons Clause: fine to use inside an app or site, but not to sell or
// redistribute the component on its own. Full notice in CREDITS.md.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
  kind?: 'image' | 'video';
  /** Still frame shown before a video's metadata loads. */
  poster?: string;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  onItemClick?: (id: string) => void;
}

// Skeleton fill shown in a card's slot before its image reveals — reads as a
// placeholder (iOS Photos dark) instead of letting the black page bg show as a
// gap. See PhotosPage's bg-black container.
const SKELETON = '#2a2a2c';

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick
}) => {
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  // Track which images have finished loading, by id — so each card reveals its
  // image the moment that image is ready, instead of waiting for the whole set.
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  // Column count tracks the measured container width (phone frame), not the
  // window — `matchMedia` would read the desktop viewport and overflow the frame.
  const columns = width >= 1500 ? 5 : width >= 1000 ? 4 : width >= 600 ? 3 : width >= 400 ? 2 : 1;

  useEffect(() => {
    let cancelled = false;
    items.forEach(item => {
      // Videos have no cheap "Image()" probe; reveal them once metadata is
      // available (or immediately, since the element itself is the preview).
      if (item.kind === 'video') {
        setLoadedIds(prev => {
          if (prev.has(item.id)) return prev;
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
        return;
      }
      const img = new Image();
      img.src = item.img;
      img.onload = img.onerror = () => {
        if (cancelled) return;
        setLoadedIds(prev => {
          if (prev.has(item.id)) return prev;
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
      };
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const gap = 3;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const containerHeight = useMemo(
    () => grid.reduce((max, item) => Math.max(max, item.y + item.h), 0),
    [grid]
  );

  // Cards that have been placed at least once — first placement is instant
  // (gsap.set) so nothing flashes at the origin; later layout changes tween.
  const placedIds = useRef<Set<string>>(new Set());
  // Images that have played their reveal, so a relayout doesn't re-fade them.
  const revealedIds = useRef<Set<string>>(new Set());

  // Layout pass: position/size every card. ALWAYS authoritative and never
  // delayed, so it can't be stomped by a stale, staggered entrance tween — the
  // race that previously left cards frozen at an old column count.
  useLayoutEffect(() => {
    if (!width) return;
    grid.forEach(item => {
      const selector = `[data-key="${item.id}"]`;
      const pos = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (placedIds.current.has(item.id)) {
        gsap.to(selector, { ...pos, duration, ease, overwrite: 'auto' });
      } else {
        gsap.set(selector, pos);
        placedIds.current.add(item.id);
      }
    });
  }, [grid, width, duration, ease]);

  // Reveal pass: fade/scale each image in PLACE once it loads. Touches only the
  // inner image's opacity/transform (composite-only — no paint) so it can't
  // corrupt layout no matter when it fires, and stays cheap even with many
  // cards revealing at once. Stagger is capped so a late batch can't leave a
  // card invisible (skeleton-only) for seconds.
  useLayoutEffect(() => {
    if (!width) return;
    let revealCount = 0;
    grid.forEach(item => {
      if (!loadedIds.has(item.id) || revealedIds.current.has(item.id)) return;
      const selector = `[data-key="${item.id}"] .masonry-img`;
      gsap.fromTo(
        selector,
        { opacity: 0, ...(blurToFocus && { scale: 1.06 }) },
        {
          opacity: 1,
          ...(blurToFocus && { scale: 1 }),
          duration: 0.6,
          ease: 'power3.out',
          delay: Math.min(revealCount, 8) * stagger
        }
      );
      revealCount++;
      revealedIds.current.add(item.id);
    });
  }, [loadedIds, grid, width, stagger, blurToFocus]);

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: containerHeight }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute box-content overflow-hidden"
          style={{ willChange: 'transform', background: SKELETON }}
          onClick={() =>
            onItemClick ? onItemClick(item.id) : window.open(item.url, '_blank', 'noopener')
          }
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          {item.kind === 'video' ? (
            <video
              src={item.img}
              poster={item.poster}
              muted
              playsInline
              preload="metadata"
              className="masonry-img relative h-full w-full object-cover"
              style={{ opacity: 0 }}
            />
          ) : (
            <div
              className="masonry-img relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.img})`, opacity: 0 }}
            />
          )}
          {item.kind === 'video' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
                  <path d="M15 8.13a1 1 0 0 1 0 1.74l-12 7A1 1 0 0 1 1.5 16V2A1 1 0 0 1 3 1.13l12 7Z" />
                </svg>
              </div>
            </div>
          )}
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
        </div>
      ))}
    </div>
  );
};

export default Masonry;
