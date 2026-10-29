import { type ReactNode } from "react";
import { motion } from "framer-motion";
import GlassSurface from "../components/GlassSurface";

/* ── iOS palette (sampled from Figma node 29:893) ─────────────────── */
const GRAY = "#8E8E93"; // secondary label
const RED = "#FF383C"; // missed call
const BLUE = "#0088FF"; // tint
const BTN_GRAY = "#F2F2F7"; // audio-call button bg (systemGray6)
const DIVIDER = "rgba(60,60,67,0.10)";

const SF =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, sans-serif';

/* ── data ─────────────────────────────────────────────────────────── */
type Recent = {
  name: string;
  phone: string;
  missed?: boolean;
  unread?: boolean;
  subtitle?: string;
  note?: string;
  time: string;
  action: "phone" | "video";
};
const RECENTS: Recent[] = [
  { name: "Ekansh", phone: "093••••••", note: "Finalize restaurant menu", time: "9:22", action: "phone" },
  {
    name: "Neha", phone: "076••••••", missed: true, unread: true,
    note: "Finalize engagement attire & vest", time: "9:21", action: "phone",
  },
  { name: "Neha", phone: "076••••••", subtitle: "FaceTime Video", time: "8:15", action: "video" },
  {
    name: "Ekansh", phone: "093••••••", missed: true, unread: true,
    note: "Finalize engagement photographer", time: "Yesterday", action: "phone",
  },
  { name: "Ekansh", phone: "093••••••", subtitle: "FaceTime Video", time: "Yesterday", action: "video" },
  { name: "Neha", phone: "076••••••", note: "Finalize engagement car", time: "Yesterday", action: "phone" },
  { name: "Neha", phone: "076••••••", note: "Finalize engagement invitation", time: "Yesterday", action: "phone" },
  { name: "Ekansh", phone: "093••••••", subtitle: "093 ••• ••••", time: "Yesterday", action: "phone" },
];

/* ── icons (inline so we control fill / match SF Symbols) ─────────── */
function PhoneFill({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}
function VideoFill({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <rect x="2.5" y="6" width="12.5" height="12" rx="3.2" />
      <path d="M16.5 10.2l4.2-2.4c.5-.3 1.1.07 1.1.64v7.1c0 .57-.6.94-1.1.64l-4.2-2.4z" />
    </svg>
  );
}
function ArrowOut({ color = GRAY }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 16L16 8M16 8H9.5M16 8V14.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowMissed({ color = GRAY }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 8L8 16M8 16H14.5M8 16V9.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FilterIcon({ color = "#1c1c1e" }: { color?: string }) {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden>
      <line x1="1" y1="2" x2="19" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="19" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="10" x2="19" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon({ color = BLUE, size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ContactsIcon({ color = "#333", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 19.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6c0 .8-.7 1.5-1.5 1.5H6c-.8 0-1.5-.7-1.5-1.5z" />
    </svg>
  );
}
function KeypadIcon({ color = "#333", size = 20 }: { color?: string; size?: number }) {
  const dots = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ r, c })));
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill={color} aria-hidden>
      {dots.map(({ r, c }) => (
        <circle key={`${r}-${c}`} cx={3 + c * 8} cy={3 + r * 8} r="2.4" />
      ))}
    </svg>
  );
}
function SearchIcon({ color = "#1c1c1e", size = 21 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="7" stroke={color} strokeWidth="2.2" />
      <path d="M16 16l4.5 4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── pieces ───────────────────────────────────────────────────────── */
const tap = { whileTap: { scale: 0.96 }, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const } };

// Hand off to the OS: `tel:` opens the native dialer (mobile + desktop browsers),
// `facetime:` starts a FaceTime video call on Apple devices.
function placeCall(action: "phone" | "video", phone: string) {
  const scheme = action === "video" ? "facetime" : "tel";
  window.location.href = `${scheme}:${phone.replace(/\s/g, "")}`;
}

function ActionButton({ action, onPress }: { action: "phone" | "video"; onPress: () => void }) {
  const isVideo = action === "video";
  return (
    <motion.button
      type="button"
      onClick={onPress}
      className="flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-full"
      style={{ background: isVideo ? BLUE : BTN_GRAY }}
      {...tap}
      aria-label={isVideo ? "FaceTime" : "Call"}
    >
      {isVideo ? <VideoFill size={20} color="#fff" /> : <PhoneFill size={20} color={BLUE} />}
    </motion.button>
  );
}

function RecentRow({ r, last }: { r: Recent; last: boolean }) {
  const call = () => placeCall(r.action, r.phone);
  return (
    <div>
      <div className="flex items-center gap-3 py-[9px]">
        <motion.button
          type="button"
          onClick={call}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          {...tap}
        >
        {/* iOS contact monogram: initial on the system gray gradient (no photo). */}
        <div
          aria-hidden
          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full text-[21px] font-semibold text-white select-none"
          style={{ background: "linear-gradient(#a5abb9, #858b98)" }}
        >
          {r.name.charAt(0)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {r.unread && <span className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: BLUE }} />}
              <span
                className="truncate text-[16px] font-semibold leading-tight"
                style={{ color: r.missed ? RED : "#000" }}
              >
                {r.name}
              </span>
            </div>
            <span className="shrink-0 text-[13px] font-medium" style={{ color: GRAY }}>
              {r.time}
            </span>
          </div>
          <div className="flex items-start gap-1" style={{ color: GRAY }}>
            <span className="mt-[2px] shrink-0">{r.missed ? <ArrowMissed /> : <ArrowOut />}</span>
            <span className="text-[13px] font-medium leading-[1.25] line-clamp-2">
              {r.subtitle ?? r.note}
            </span>
          </div>
        </div>
        </motion.button>
        <ActionButton action={r.action} onPress={call} />
      </div>
      {!last && <div className="h-px" style={{ background: DIVIDER, marginLeft: 62 }} />}
    </div>
  );
}

/* ── tab bar ──────────────────────────────────────────────────────── */
// Light liquid-glass tint sat over GlassSurface (mirrors PhotosPage's Glass):
// a low base opacity lets the glass distortion show through, with the tint on top.
const LIGHT_TINT = "rgba(255,255,255,0.5)";

// GlassSurface needs a fixed size; we stack a light tint + content on top so the
// chrome reads as a frosted-white pill over the white Phone page.
function Glass({
  w,
  h,
  radius,
  tint = LIGHT_TINT,
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

function TabBar() {
  return (
    <div className="pointer-events-auto absolute bottom-0 left-1/2 z-20 -translate-x-1/2" style={{ paddingBottom: "calc(var(--safe-bottom) + 14px)" }}>
      <div className="flex items-center gap-[13px]">
        {/* main pill */}
        <Glass w={244} h={55} radius={27.5}>
          <div className="flex h-full w-full items-center pl-[3px] pr-3">
            {/* active: Calls */}
            <motion.button type="button" className="relative flex h-[49px] w-[79px] flex-col items-center justify-center gap-[2px] rounded-[24px] bg-white shadow-sm" {...tap}>
              <ClockIcon size={20} />
              <span className="text-[10px] font-semibold leading-none" style={{ color: BLUE }}>Calls</span>
              <span className="absolute -right-[2px] top-[2px] flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "#FF3B30" }}>2</span>
            </motion.button>
            <motion.button type="button" className="flex flex-1 flex-col items-center justify-center gap-[3px]" {...tap}>
              <ContactsIcon size={21} />
              <span className="text-[9px] font-semibold leading-none text-[#333]">Contacts</span>
            </motion.button>
            <motion.button type="button" className="flex flex-1 flex-col items-center justify-center gap-[4px]" {...tap}>
              <KeypadIcon size={19} />
              <span className="text-[9px] font-semibold leading-none text-[#333]">Keypad</span>
            </motion.button>
          </div>
        </Glass>
        {/* search */}
        <Glass w={55} h={55} radius={27.5}>
          <motion.button type="button" className="flex h-full w-full items-center justify-center" {...tap} aria-label="Search">
            <SearchIcon />
          </motion.button>
        </Glass>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */
export default function PhonePage() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white" style={{ fontFamily: SF }}>
      {/* header */}
      <div
        className="absolute inset-x-0 top-0 z-20 bg-white px-5"
        style={{ paddingTop: "calc(var(--safe-top) + 10px)", paddingBottom: 8 }}
      >
        <div className="relative flex h-11 items-center justify-end">
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-black">Calls</span>
          <motion.button type="button" className="relative h-9 w-9" {...tap} aria-label="Filter">
            <Glass w={36} h={36} radius={18}>
              <FilterIcon />
            </Glass>
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold text-white" style={{ background: BLUE }}>2</span>
          </motion.button>
        </div>
      </div>

      {/* scroll area */}
      <div
        className="absolute inset-0 overflow-y-auto px-5"
        style={{
          paddingTop: "calc(var(--safe-top) + 64px)",
          paddingBottom: "calc(var(--safe-bottom) + 110px)",
        }}
      >
        {/* recents */}
        <h2 className="mb-1 text-[22px] font-bold text-black">Recents</h2>
        <div>
          {RECENTS.map((r, i) => (
            <RecentRow key={i} r={r} last={i === RECENTS.length - 1} />
          ))}
        </div>
      </div>

      {/* bottom white fade so list dissolves under the tab bar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[150px]"
        style={{ background: "linear-gradient(to top, #fff 35%, rgba(255,255,255,0))" }}
      />

      <TabBar />
    </div>
  );
}
