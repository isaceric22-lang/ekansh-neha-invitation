import { openMaps } from "@/lib/maps";
import { ENGAGEMENT_VENUE } from "./calendarData";

interface LocationWidgetProps {
  street?: string;
  address?: string;
  photoSrc?: string;
  mapSrc?: string;
  /** Tap opens this URL in a new tab. */
  href?: string;
}

export function LocationWidget({
  street = ENGAGEMENT_VENUE,
  address = "Imperia Hall · Jhil Mil, Delhi",
  photoSrc = "/profile.jpg",
  mapSrc = "/map-tile.svg",
  href,
}: LocationWidgetProps) {
  return (
    <div
      onClick={
        href ? () => openMaps(href) : undefined
      }
      role={href ? "button" : undefined}
      aria-label={href ? `Open ${street} in Maps` : undefined}
      className={
        "relative h-[158px] w-[158px] overflow-hidden" +
        (href
          ? " cursor-pointer transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.97]"
          : "")
      }
      style={{
        borderRadius: 27,
        fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
        background: `center / cover no-repeat url('${mapSrc}')`,
      }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          right: 27,
          top: 64,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid #fff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(48, 247, 44, 0.32)",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute"
        style={{
          right: 16,
          top: 16,
          width: 62,
          height: 68,
          filter:
            "drop-shadow(0 0.85px 3px rgba(61,61,61,0.19)) drop-shadow(0 0.25px 1px rgba(61,61,61,0.04))",
        }}
      >
        <svg
          viewBox="0 0 62 68"
          width="62"
          height="68"
          style={{ display: "block" }}
        >
          <path
            fill="#fff"
            d="M31 0C13.88 0 0 13.88 0 31c0 14.43 9.85 26.55 23.2 30.04L31 68l7.8-6.96C52.15 57.55 62 45.43 62 31 62 13.88 48.12 0 31 0z"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 3,
            top: 3,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundImage: `url('${photoSrc}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: 64,
          background:
            "linear-gradient(to top, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 60%, rgba(255,255,255,0) 100%)",
          backdropFilter: "blur(12px) saturate(140%)",
          WebkitBackdropFilter: "blur(12px) saturate(140%)",
          maskImage:
            "linear-gradient(to top, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, #000 55%, transparent 100%)",
        }}
      />

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col"
        style={{ padding: "0 17px 16px 17px", gap: 2 }}
      >
        <div
          className="truncate text-black"
          style={{
            fontSize: 12.5,
            lineHeight: "16px",
            letterSpacing: -0.3,
            fontWeight: 600,
          }}
        >
          {street}
        </div>
        <div
          className="truncate text-black"
          style={{
            fontSize: 10.5,
            lineHeight: "16px",
            letterSpacing: -0.3,
            fontWeight: 400,
          }}
        >
          {address}
        </div>
      </div>
    </div>
  );
}
