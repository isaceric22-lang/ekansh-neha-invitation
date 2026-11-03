import { Navigation } from "lucide-react";
import { MAPS_URL, openMaps } from "../lib/maps";
import { VENUE_MAP_EMBED, WEDDING } from "./invitation/data";
import { localStartLabel } from "./invitation/time";

/** Delhi's 5:00 PM in the reader's own clock, when that differs. */
const LOCAL_START = localStartLabel();

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

/**
 * The Map app. A live Google Maps embed is the map itself; the illustrated
 * tile underneath is only a fallback for slow/offline loads. Directions still
 * hands off to Google Maps, which is where real routing belongs.
 */
export default function MapsPage() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ fontFamily: SF_STACK, background: "#EDE9E0" }}
    >
      {/* Offline/slow-load fallback, visible until the iframe paints. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/map-tile.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <iframe
        src={VENUE_MAP_EMBED}
        title={`Map showing ${WEDDING.venue}`}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />

      {/* Soft top scrim so the status bar and close button stay legible. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[120px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0))",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white/95 px-5 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" aria-hidden />
        <div className="text-[20px] font-semibold leading-tight text-[#1c1c1e]">
          {WEDDING.venue}
        </div>
        <div className="mt-0.5 text-[13px] text-[#6b6b70]">
          {WEDDING.hall} · {WEDDING.weekday}, {WEDDING.dateShort} · {WEDDING.time}
          {LOCAL_START && ` · ${LOCAL_START} your time`}
        </div>
        <div className="mt-2 text-[14px] leading-[19px] text-[#3a3a3c]">
          {WEDDING.address}
        </div>

        <button
          type="button"
          onClick={() => openMaps(MAPS_URL)}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0088ff] text-[16px] font-semibold text-white transition-transform active:scale-[0.98]"
        >
          <Navigation size={19} strokeWidth={2.2} />
          Directions
        </button>
        <p className="mt-2 text-center text-[11.5px] leading-[15px] text-[#8e8e93]">
          Directions opens Google Maps for the real route.
        </p>
      </div>
    </div>
  );
}
