import { useState, type ReactNode } from "react";
import MediaSettingsPage from "./MediaSettingsPage";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

// iOS systemGroupedBackground (light) + secondary label gray.
const GROUPED_BG = "#F2F2F7";
const GRAY = "#8E8E93";

// ── Icon tile ─────────────────────────────────────────────────────────────
// iOS Settings glyph chip: 29×29 rounded square, gradient fill, white glyph.
function Tile({ gradient, children }: { gradient: string; children: ReactNode }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center text-white"
      style={{ width: 29, height: 29, borderRadius: 7, background: gradient }}
    >
      {children}
    </div>
  );
}

// White glyphs (stroke = currentColor = white). Kept simple, SF-like.
const Airplane = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 16.5v-2l-8-4.5V4.2a1.7 1.7 0 1 0-3.4 0V10l-8 4.5v2l8-2.3v4l-2.2 1.5v1.6L12 20l3.6 1.3v-1.6L13.4 18.2v-4l8.6 2.3z" />
  </svg>
);
const Wifi = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5C8 5 16 5 21 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 13C9.5 10 14.5 10 18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 16.3c1.8-1.4 4.2-1.4 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="19.3" r="1.4" fill="currentColor" />
  </svg>
);
const Bluetooth = () => (
  <svg width="13" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M7 7l10 10-5 4V3l5 4L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Bars = () => (
  <svg width="17" height="15" viewBox="0 0 24 22" fill="currentColor">
    <rect x="0" y="14" width="4" height="8" rx="1" />
    <rect x="6.5" y="9" width="4" height="13" rx="1" />
    <rect x="13" y="4" width="4" height="18" rx="1" />
    <rect x="19.5" y="0" width="4" height="22" rx="1" />
  </svg>
);
const Hotspot = () => (
  <svg width="18" height="14" viewBox="0 0 26 18" fill="none">
    <path d="M11 5H7a4 4 0 0 0 0 8h4M15 13h4a4 4 0 0 0 0-8h-4M9 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Battery = () => (
  <svg width="20" height="12" viewBox="0 0 26 14" fill="none">
    <rect x="1" y="1" width="21" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3" y="3" width="15" height="8" rx="1.5" fill="currentColor" />
    <rect x="23.5" y="4.5" width="2" height="5" rx="1" fill="currentColor" />
  </svg>
);
const Gear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M12 2.5l1.4 1.7 2.1-.7.8 2.1 2.2.3-.2 2.2 1.7 1.4-1.1 1.9 1.1 1.9-1.7 1.4.2 2.2-2.2.3-.8 2.1-2.1-.7L12 21.5l-1.4-1.7-2.1.7-.8-2.1-2.2-.3.2-2.2-1.7-1.4 1.1-1.9-1.1-1.9 1.7-1.4-.2-2.2 2.2-.3.8-2.1 2.1.7L12 2.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);
const Accessibility = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="4" r="2" />
    <path d="M4 7.5c2.5 1.3 5.2 1.9 8 1.9s5.5-.6 8-1.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 9v5m0 0l-3 7m3-7l3 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ActionBtn = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 12h9m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Sparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    <path d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6L15 17.5l2.6-.9.9-2.6z" />
  </svg>
);
const Camera = () => (
  <svg width="18" height="15" viewBox="0 0 24 20" fill="none">
    <path d="M3 6.5A2 2 0 0 1 5 4.5h1.2l1-1.5h5.6l1 1.5H21a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5z" fill="currentColor" />
    <circle cx="13" cy="11" r="3.2" fill="#fff" />
  </svg>
);
const Grid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="8" height="8" rx="2" />
    <rect x="14" y="2" width="8" height="8" rx="2" />
    <rect x="2" y="14" width="8" height="8" rx="2" />
    <rect x="14" y="14" width="8" height="8" rx="2" />
  </svg>
);
const Search = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.2" />
    <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
const Snow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
  </svg>
);
const Hourglass = () => (
  <svg width="15" height="17" viewBox="0 0 20 24" fill="currentColor">
    <path d="M3 2h14v1c0 4-3 6-5 7 2 1 5 3 5 7v3H3v-3c0-4 3-6 5-7-2-1-5-3-5-7V2z" />
    <path d="M3 1h14M3 23h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Hand = () => (
  <svg width="16" height="17" viewBox="0 0 22 24" fill="currentColor">
    <path d="M6 11V4.5a1.6 1.6 0 0 1 3.2 0V10m0 0V3a1.6 1.6 0 0 1 3.2 0v7m0 0V4.5a1.6 1.6 0 0 1 3.2 0V13c0 4.5-2.5 9-7 9-3.2 0-4.8-1.6-6.4-4.6L2.4 14a1.5 1.5 0 0 1 2.4-1.8L6 13.5" />
  </svg>
);

// ── Chevron ───────────────────────────────────────────────────────────────
function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="#C4C4C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── iOS toggle ────────────────────────────────────────────────────────────
function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="relative shrink-0 rounded-full p-[2px] transition-colors duration-200"
      style={{ width: 51, height: 31, background: on ? "#34C759" : "#E9E9EA" }}
      aria-pressed={on}
    >
      <div
        className="rounded-full bg-white"
        style={{
          width: 27,
          height: 27,
          boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)",
          transform: on ? "translateX(20px)" : "translateX(0)",
          transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </button>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────
type RowProps = {
  icon: ReactNode;
  label: string;
  note?: string;
  detail?: boolean;
  toggle?: boolean;
  toggleOn?: boolean;
  disabled?: boolean;
  last?: boolean;
  onClick?: () => void;
};

function Row({
  icon,
  label,
  note,
  detail,
  toggle,
  toggleOn,
  disabled,
  last,
  onClick,
}: RowProps) {
  return (
    <div
      className={
        "flex items-center pl-4" +
        (onClick && !disabled ? " cursor-pointer active:bg-black/5" : "")
      }
      style={{ opacity: disabled ? 0.4 : 1 }}
      onClick={disabled ? undefined : onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick || disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {icon}
      <div
        className="ml-3 flex flex-1 items-center py-[11px] pr-4"
        style={{ borderBottom: last ? "none" : "0.5px solid rgba(60,60,67,0.15)" }}
      >
        <span className="text-[17px] leading-tight text-black">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          {note && <span className="text-[17px]" style={{ color: GRAY }}>{note}</span>}
          {toggle ? <Toggle defaultOn={toggleOn} /> : detail ? <Chevron /> : null}
        </div>
      </div>
    </div>
  );
}

// ── Group ─────────────────────────────────────────────────────────────────
function Group({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 mt-[35px] overflow-hidden rounded-[10px] bg-white">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [view, setView] = useState<"root" | "media">("root");

  if (view === "media") {
    return <MediaSettingsPage onBack={() => setView("root")} />;
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{ background: GROUPED_BG, fontFamily: SF_STACK }}
    >
      {/* Large title — sits below the floating close button. */}
      <h1
        className="px-5 text-[34px] font-bold tracking-tight text-black"
        style={{ paddingTop: "calc(var(--safe-top) + 64px)" }}
      >
        Settings
      </h1>

      {/* Account row */}
      <div className="mx-4 mt-4 overflow-hidden rounded-[10px] bg-white">
        <div className="flex items-center gap-4 px-4 py-3">
          <div
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[28px] font-semibold text-white"
            style={{ background: "linear-gradient(#a5abb9, #858b98)" }}
          >
            E
          </div>
          <div className="flex-1">
            <div className="text-[21px] font-semibold leading-tight text-black">
              Ekansh &amp; Neha
            </div>
            <div className="mt-0.5 text-[14px]" style={{ color: GRAY }}>
              Tilak &amp; Godh Bharai · 19 November 2026
            </div>
          </div>
          <Chevron />
        </div>
      </div>

      {/* Invitation media — upload photos, videos, music, and the featured video. */}
      <Group>
        <Row
          icon={<Tile gradient="linear-gradient(#ff6482,#ff2d55)"><Camera /></Tile>}
          label="Invitation Media"
          note="Photos & videos"
          detail
          last
          onClick={() => setView("media")}
        />
      </Group>

      {/* Connectivity */}
      <Group>
        <Row icon={<Tile gradient="linear-gradient(#f8b250,#f79407)"><Airplane /></Tile>} label="Airplane Mode" toggle />
        <Row icon={<Tile gradient="linear-gradient(#489bfd,#2b77f4)"><Wifi /></Tile>} label="Wi-Fi" note="Connected" detail />
        <Row icon={<Tile gradient="linear-gradient(#459cfa,#2d7afc)"><Bluetooth /></Tile>} label="Bluetooth" note="On" detail />
        <Row icon={<Tile gradient="linear-gradient(#6fdc83,#3ec75d)"><Bars /></Tile>} label="Cellular" note="Off" detail />
        <Row icon={<Tile gradient="linear-gradient(#6fdc83,#3ec75d)"><Hotspot /></Tile>} label="Personal Hotspot" note="Off" detail disabled />
        <Row icon={<Tile gradient="linear-gradient(#6fdc83,#3ec75d)"><Battery /></Tile>} label="Battery" detail last />
      </Group>

      {/* General cluster */}
      <Group>
        <Row icon={<Tile gradient="linear-gradient(#afafb4,#8e8e93)"><Gear /></Tile>} label="General" detail />
        <Row icon={<Tile gradient="linear-gradient(#43a6ff,#0288ff)"><Accessibility /></Tile>} label="Accessibility" detail />
        <Row icon={<Tile gradient="linear-gradient(#43a6ff,#0288ff)"><ActionBtn /></Tile>} label="Action Button" detail />
        <Row icon={<Tile gradient="linear-gradient(#f9a432,#e193fb)"><Sparkle /></Tile>} label="Apple Intelligence & Siri" detail />
        <Row icon={<Tile gradient="linear-gradient(#afafb4,#8e8e93)"><Camera /></Tile>} label="Camera" detail />
        <Row icon={<Tile gradient="linear-gradient(#43a6ff,#0288ff)"><Grid /></Tile>} label="Home Screen & App Library" detail />
        <Row icon={<Tile gradient="linear-gradient(#afafb4,#8e8e93)"><Search /></Tile>} label="Search" detail />
        <Row icon={<Tile gradient="#000"><Snow /></Tile>} label="StandBy" detail last />
      </Group>

      {/* Screen Time */}
      <Group>
        <Row icon={<Tile gradient="linear-gradient(#887dff,#6055f5)"><Hourglass /></Tile>} label="Screen Time" detail last />
      </Group>

      {/* Privacy */}
      <Group>
        <Row icon={<Tile gradient="linear-gradient(#43a6ff,#0288ff)"><Hand /></Tile>} label="Privacy & Security" detail last />
      </Group>

      {/* Footer search bar */}
      <div className="sticky bottom-0 px-4" style={{ paddingBottom: "calc(var(--safe-bottom) + 12px)", paddingTop: 8 }}>
        <div
          className="flex items-center gap-2 rounded-[12px] px-3 py-[10px]"
          style={{
            background: "rgba(118,118,128,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span style={{ color: GRAY }}>
            <Search />
          </span>
          <span className="text-[17px]" style={{ color: GRAY }}>Search</span>
        </div>
      </div>
    </div>
  );
}
