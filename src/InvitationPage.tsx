import { openLink } from "../lib/link";
import {
  googleCalendarUrl,
  MAPS_URL,
  WEDDING,
} from "./invitation/data";

const SERIF = 'Georgia, "Times New Roman", serif';
const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const MAROON = "#4A1223";
const GOLD = "#C99A4A";
const CREAM = "#FCF7ED";
const INK = "#3B2219";

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={GOLD} strokeWidth="1.2" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <span className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#A0785C" }}>
        {label}
      </p>
      <p className="mt-1.5 text-[13px] leading-[1.45]" style={{ color: INK }}>
        {children}
      </p>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <div
      className="min-h-full w-full"
      style={{ background: CREAM, fontFamily: SF_STACK, color: INK }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 pb-9 pt-10 text-center"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, #6B1C36 0%, #4A1223 48%, #2B0A14 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[-90px] h-[300px] w-[300px] -translate-x-1/2 rounded-full"
          style={{ border: "1px solid rgba(201,154,74,0.28)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-40px] h-[210px] w-[210px] -translate-x-1/2 rounded-full"
          style={{ border: "1px solid rgba(201,154,74,0.2)" }}
        />

        <div className="relative mx-auto h-[76px] w-[76px]">
          <div
            className="absolute inset-0 rounded-full p-[2px]"
            style={{ background: `linear-gradient(150deg, ${GOLD}, #F7E6BC, ${GOLD})` }}
          >
            <img
              src="/ganesha.jpg"
              alt="Lord Ganesha"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>

        <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: "#E7CB94" }}>
          {WEDDING.blessing}
        </p>

        <h1
          className="mt-3 text-[44px] leading-[0.98] tracking-[-0.02em]"
          style={{ fontFamily: SERIF, color: "#FFFAF0" }}
        >
          {WEDDING.groom}
          <span className="mx-2" style={{ color: GOLD }}>
            &amp;
          </span>
          {WEDDING.bride}
        </h1>

        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: "#E7CB94" }}>
          {WEDDING.ceremony}
        </p>

        <div className="mt-5 inline-flex flex-col items-center gap-1 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 backdrop-blur-sm">
          <p className="text-[14px] text-white/95">{WEDDING.dateLong}</p>
          <p className="text-[12px] text-white/65">
            {WEDDING.time} · {WEDDING.hall}
          </p>
        </div>

        <p className="mt-4 text-[12px] text-white/65">
          {WEDDING.venue}, Delhi
        </p>
      </div>

      {/* Invitation note */}
      <div className="px-6 pt-8 text-center">
        <Ornament />
        <p
          className="mx-auto mt-5 max-w-[300px] text-[24px] leading-[1.32]"
          style={{ fontFamily: SERIF, color: MAROON }}
        >
          Please join us for the Tilak and the Godh Bharai.
        </p>
        <p className="mx-auto mt-3 max-w-[290px] text-[12.5px] leading-[1.65]" style={{ color: "#7B6455" }}>
          Two families, one auspicious evening. Come for the rituals, the
          marigolds and the mithai, and leave with our blessings.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em]" style={{ color: "#A0785C" }}>
          Hosted with love by
        </p>
        <p className="mt-1 text-[12.5px]" style={{ color: INK }}>
          {WEDDING.hosts}
        </p>
      </div>

      {/* Details */}
      <div className="mx-5 mt-8 rounded-[20px] border px-4 py-5" style={{ borderColor: "rgba(201,154,74,0.4)", background: "#FFFDF8" }}>
        <div className="grid grid-cols-2 gap-y-5">
          <Detail label="Date">{WEDDING.dateLong}</Detail>
          <Detail label="Time">{WEDDING.time}</Detail>
          <Detail label="Venue">
            {WEDDING.venue}
            <br />
            {WEDDING.hall}
          </Detail>
          <Detail label="Nearest metro">Jhil Mil</Detail>
        </div>

        <div className="my-5 h-px w-full" style={{ background: "rgba(74,18,35,0.08)" }} />

        <p className="text-center text-[11.5px] leading-relaxed" style={{ color: "#7B6455" }}>
          {WEDDING.address}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openLink(googleCalendarUrl())}
            className="w-full rounded-full py-3 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: MAROON }}
          >
            Add to calendar
          </button>
          <button
            type="button"
            onClick={() => openLink(MAPS_URL)}
            className="w-full rounded-full border py-3 text-[13px] font-semibold transition-transform active:scale-[0.98]"
            style={{ borderColor: GOLD, color: MAROON, background: "transparent" }}
          >
            Get directions
          </button>
        </div>
      </div>

      {/* Ceremonies */}
      <div className="px-5 pt-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#A0785C" }}>
          The evening
        </p>
        <div className="mt-4 space-y-3">
          <div
            className="rounded-[18px] border p-4"
            style={{ borderColor: "rgba(201,154,74,0.35)", background: "#FFFDF8" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[21px]" style={{ fontFamily: SERIF, color: MAROON }}>
                Tilak
              </h2>
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "#A0785C" }}>
                From 7:00 PM
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: "#7B6455" }}>
              The groom's family applies the tilak and offers their blessings:
              the formal seal on the match, celebrated with the whole family.
            </p>
          </div>

          <div
            className="rounded-[18px] border p-4"
            style={{ borderColor: "rgba(201,154,74,0.35)", background: "#FFFDF8" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[21px]" style={{ fontFamily: SERIF, color: MAROON }}>
                Godh Bharai
              </h2>
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "#A0785C" }}>
                From 7:00 PM
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: "#7B6455" }}>
              The women of the family fill the lap with gifts, sweets and
              blessings for the bride's new beginning: songs, laughter and a
              little happy chaos.
            </p>
          </div>
        </div>
      </div>

      {/* Good to know */}
      <div className="mx-5 mt-8 rounded-[18px] px-4 py-4" style={{ background: "#F5E8D2" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8A6A50" }}>
          Good to know
        </p>
        <ul className="mt-3 space-y-2 text-[12.5px] leading-snug" style={{ color: "#6E5545" }}>
          <li>· Indian festive: lehenga, sherwani, or your finest silk.</li>
          <li>· The venue is behind Jhil Mil metro station; parking is limited.</li>
          <li>· Carry a little warmth. Delhi gets cool after sunset in November.</li>
        </ul>
      </div>

      {/* Closing */}
      <div className="px-6 pb-10 pt-9 text-center">
        <Ornament />
        <p
          className="mx-auto mt-5 max-w-[270px] text-[26px] leading-[1.3]"
          style={{ fontFamily: SERIF, color: MAROON }}
        >
          We can't wait to celebrate with you.
        </p>
        <p className="mt-3 text-[12px] uppercase tracking-[0.2em]" style={{ color: "#A0785C" }}>
          {WEDDING.hashtag}
        </p>
        <p className="mt-6 text-[11px] leading-relaxed" style={{ color: "#9B8270" }}>
          {WEDDING.blessing}
          <br />
          {WEDDING.names} · 19 November 2026
        </p>
      </div>
    </div>
  );
}
