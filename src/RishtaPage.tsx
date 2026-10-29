import { openLink } from "../lib/link";
import { googleCalendarUrl, MAPS_URL, WEDDING } from "./invitation/data";

const SERIF = 'Georgia, "Times New Roman", serif';
const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const GOLD = "#C99A4A";
const GOLD_LIGHT = "#F3DFB4";
const MAROON = "#4A1223";
const CREAM = "#FBF3E5";
const INK = "#3A2018";

function Monogram({ initial, label }: { initial: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid h-[64px] w-[64px] place-items-center rounded-full"
        style={{
          background: "linear-gradient(145deg, #FFF8E8, #F1DFC0)",
          border: `1px solid ${GOLD}`,
          boxShadow: "0 4px 14px rgba(74,18,35,0.12)",
          fontFamily: SERIF,
          fontSize: 28,
          color: MAROON,
        }}
      >
        {initial}
      </div>
      <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "#8A6A58" }}>
        {label}
      </span>
    </div>
  );
}

function SectionTitle({ children, note }: { children: string; note?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <h2
        className="text-[20px] leading-tight"
        style={{ fontFamily: SERIF, color: MAROON }}
      >
        {children}
      </h2>
      {note && (
        <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "#A08472" }}>
          {note}
        </span>
      )}
    </div>
  );
}

/** How the evening unfolds — useful for guests, no invented family to-dos. */
const EVENING = [
  {
    time: "7:00 PM",
    title: "Tilak & welcome",
    detail:
      "The groom's family applies the tilak and offers their blessings, with dhol, shehnai and a very full house.",
  },
  {
    time: "7:45 PM",
    title: "Godh Bharai",
    detail:
      "The women of the family fill the bride's lap with gifts, sweets and blessings: songs, laughter and a little happy chaos.",
  },
  {
    time: "8:30 PM",
    title: "Dinner",
    detail:
      "A North Indian spread: chaat, kebabs, dal, warm rotis and far too much mithai.",
  },
  {
    time: "9:30 PM",
    title: "Portraits & music",
    detail:
      "Family photos by the stage, then the dance floor opens for the cousins.",
  },
];

export default function RishtaPage() {

  return (
    <div
      className="relative h-full w-full overflow-y-auto"
      style={{
        background: CREAM,
        fontFamily: SF_STACK,
        paddingBottom: "calc(var(--safe-bottom) + 34px)",
      }}
    >
      {/* Letterpress header */}
      <header
        className="relative overflow-hidden px-5 pb-10"
        style={{
          paddingTop: "calc(var(--safe-top) + 72px)",
          background: `linear-gradient(160deg, #6B1C36 0%, ${MAROON} 58%, #2A0812 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-10 h-[220px] w-[220px] rounded-full"
          style={{ border: `1px solid ${GOLD}`, opacity: 0.22 }}
        />
        <div
          className="pointer-events-none absolute -right-4 top-16 h-[130px] w-[130px] rounded-full"
          style={{ border: `1px solid ${GOLD}`, opacity: 0.16 }}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em]" style={{ color: GOLD_LIGHT }}>
          The match file
        </p>
        <h1
          className="mt-2 text-[42px] leading-[0.95]"
          style={{ fontFamily: SERIF, color: "#FFF9EC", letterSpacing: "-0.02em" }}
        >
          Rishta
        </h1>
        <p className="mt-3 max-w-[280px] text-[13px] leading-[1.5] text-white/70">
          Two families introduced us. We took it from there. Everything the
          family needs for {WEDDING.ceremony}, in one place.
        </p>
        <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD_LIGHT }}>
          <span>{WEDDING.names}</span>
          <span className="h-px w-8" style={{ background: GOLD }} />
          <span>19 · 11 · 2026</span>
        </div>
      </header>

      {/* Couple card */}
      <div
        className="relative mx-4 -mt-6 rounded-[22px] px-5 pb-5 pt-6"
        style={{
          background: "#FFFDF8",
          boxShadow: "0 18px 40px rgba(74,18,35,0.14), 0 2px 6px rgba(74,18,35,0.06)",
          border: "1px solid rgba(201,154,74,0.35)",
        }}
      >
        <div className="flex items-center justify-between">
          <Monogram initial={WEDDING.groom.charAt(0)} label="The groom" />
          <div className="flex flex-col items-center gap-1">
            <svg width="46" height="30" viewBox="0 0 46 30" fill="none" aria-hidden>
              <circle cx="17" cy="15" r="11" stroke={GOLD} strokeWidth="1.6" />
              <circle cx="29" cy="15" r="11" stroke={GOLD} strokeWidth="1.6" />
            </svg>
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "#A08472" }}>
              Said yes
            </span>
          </div>
          <Monogram initial={WEDDING.bride.charAt(0)} label="The bride" />
        </div>

        <div className="my-5 h-px w-full" style={{ background: "rgba(201,154,74,0.3)" }} />

        <p
          className="text-center text-[21px] leading-snug"
          style={{ fontFamily: SERIF, color: MAROON }}
        >
          {WEDDING.groom} <span style={{ color: GOLD }}>&amp;</span> {WEDDING.bride}
        </p>
        <p className="mt-1 text-center text-[12px]" style={{ color: "#8A6A58" }}>
          {WEDDING.ceremony} · {WEDDING.dateLong}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { value: "36/36", label: "Guna milan" },
            { value: "2", label: "Families" },
            { value: "1", label: "Big yes" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl px-2 py-2.5"
              style={{ background: "#F8EDDA" }}
            >
              <p className="text-[17px]" style={{ fontFamily: SERIF, color: MAROON }}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.1em]" style={{ color: "#8A6A58" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* The details */}
      <section className="mx-4 mt-7">
        <SectionTitle note="Save the date">The invitation, at a glance</SectionTitle>
        <div
          className="overflow-hidden rounded-[18px]"
          style={{ background: "#FFFDF8", border: "1px solid rgba(201,154,74,0.28)" }}
        >
          {[
            ["Ceremony", WEDDING.ceremony],
            ["Date", WEDDING.dateLong],
            ["Time", WEDDING.time],
            ["Venue", `${WEDDING.venue}, ${WEDDING.hall}`],
            ["Address", WEDDING.address],
            ["Hosted by", WEDDING.hosts],
            ["Dress code", "Indian festive: lehenga, sherwani, or your finest silk"],
          ].map(([label, value], i, all) => (
            <div
              key={label}
              className="flex gap-3 px-4 py-3"
              style={{ borderBottom: i === all.length - 1 ? "none" : "1px solid rgba(74,18,35,0.07)" }}
            >
              <span className="w-[76px] shrink-0 text-[11px] uppercase tracking-[0.08em]" style={{ color: "#A08472" }}>
                {label}
              </span>
              <span className="text-[13.5px] leading-[1.45]" style={{ color: INK }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => openLink(googleCalendarUrl())}
            className="flex-1 rounded-full py-3 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: MAROON }}
          >
            Add to calendar
          </button>
          <button
            type="button"
            onClick={() => openLink(MAPS_URL)}
            className="flex-1 rounded-full py-3 text-[13px] font-semibold transition-transform active:scale-[0.98]"
            style={{ border: `1px solid ${GOLD}`, color: MAROON, background: "#FFFDF8" }}
          >
            Open in Maps
          </button>
        </div>
      </section>

      {/* The evening */}
      <section className="mx-4 mt-7">
        <SectionTitle note="19 Nov">The evening, in order</SectionTitle>
        <div
          className="rounded-[18px] px-4 py-4"
          style={{ background: "#FFFDF8", border: "1px solid rgba(201,154,74,0.28)" }}
        >
          {EVENING.map((item, i) => (
            <div key={item.time} className="flex gap-3">
              <div className="flex w-[58px] shrink-0 flex-col items-end">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-[0.04em]"
                  style={{ color: MAROON }}
                >
                  {item.time}
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.1em]" style={{ color: "#A08472" }}>
                  IST
                </span>
              </div>

              <div className="relative flex w-[14px] shrink-0 justify-center">
                {i !== EVENING.length - 1 && (
                  <span
                    className="absolute top-[9px] h-[calc(100%+22px)] w-px"
                    style={{ background: "rgba(201,154,74,0.35)" }}
                  />
                )}
                <span
                  className="relative mt-[4px] h-[9px] w-[9px] rounded-full"
                  style={{ background: GOLD, boxShadow: "0 0 0 3px rgba(201,154,74,0.16)" }}
                />
              </div>

              <div className={i === EVENING.length - 1 ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-5"}>
                <p className="text-[14px] leading-tight" style={{ color: INK }}>
                  {item.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-[1.5]" style={{ color: "#9B8270" }}>
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The yes */}
      <section className="mx-4 mt-7">
        <div
          className="relative overflow-hidden rounded-[18px] px-5 py-6 text-center"
          style={{ background: "#F6E7CF", border: `1px solid ${GOLD}` }}
        >
          <div
            className="pointer-events-none absolute inset-x-3 inset-y-3 rounded-[13px]"
            style={{ border: "1px solid rgba(201,154,74,0.4)" }}
          />
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#8A6A58" }}>
            With the blessings of Lord Ganesha
          </p>
          <p
            className="mx-auto mt-3 max-w-[250px] text-[22px] leading-[1.25]"
            style={{ fontFamily: SERIF, color: MAROON }}
          >
            Arranged by our families. Chosen by us.
          </p>
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "#7A5A48" }}>
            We would be so happy to have you with us in Delhi for the Tilak and
            the Godh Bharai. Come for the rituals, stay for the mithai.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "#8A6A58" }}>
            <span className="h-px w-6" style={{ background: GOLD }} />
            {WEDDING.hashtag}
            <span className="h-px w-6" style={{ background: GOLD }} />
          </div>
        </div>
      </section>
    </div>
  );
}
