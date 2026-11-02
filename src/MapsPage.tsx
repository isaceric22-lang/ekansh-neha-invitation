import { MapPin, Navigation } from "lucide-react";
import { MAPS_URL, openMaps } from "../lib/maps";
import { WEDDING } from "./invitation/data";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

/**
 * The Map app. The tile is our own illustration, so the screen works offline and
 * never depends on a Maps API key; Directions hands off to Google Maps, which is
 * where real routing belongs.
 */
export default function MapsPage() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ fontFamily: SF_STACK, background: "#EDE9E0" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/map-tile.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Venue pin, sitting above the sheet. */}
      <div className="absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <div className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1c1c1e] shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
          {WEDDING.venue}
        </div>
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#C99A4A] shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
          <MapPin size={20} strokeWidth={2.4} className="text-white" />
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-black/25 blur-[1px]" />
      </div>

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
          Illustrated map. Directions opens your maps app for the real route.
        </p>
      </div>
    </div>
  );
}
