import { type ReactNode } from "react";
import { useAppNav } from "./app-nav";
import { MAPS_URL, openMaps } from "../lib/maps";
import { openLink } from "../lib/link";
import { HOME } from "./SafariPage";
import {
  ENGAGEMENT_ADDRESS,
  ENGAGEMENT_DATE_LONG,
  ENGAGEMENT_HOSTS,
  ENGAGEMENT_TIME,
  ENGAGEMENT_VENUE,
} from "../components/calendarData";

// iOS link blue for tappable map / phone / Safari hints.
const LINK = "#007AFF";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

// iOS Notes paper — a warm near-white, not pure #fff.
const PAPER = "#FBFAF8";
// Dark glyph color on the white chrome pills (iOS label, slightly soft).
const GLYPH = "#3A3A3C";

// White "glass" pill that floats over the paper. iOS uses a thin material with a
// soft, low shadow — on the light paper it reads as a clean white capsule.
function Pill({
  children,
  onClick,
  className = "",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        "flex items-center justify-center rounded-full bg-white transition-transform active:scale-[0.96] " +
        className
      }
      style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {children}
    </button>
  );
}

// Chevron back (iOS bold, rounded joins).
function ChevronLeftIcon() {
  return (
    <svg width="13" height="22" viewBox="0 0 13 22" fill="none">
      <path
        d="M11 2L3 11l8 9"
        stroke={GLYPH}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Undo — counter-clockwise arrow curling back to the left.
function UndoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 9h11a5 5 0 0 1 0 10H9"
        stroke={GLYPH}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 5.5L4 9l3.5 3.5"
        stroke={GLYPH}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Share — iOS box with an up-arrow rising out of the top.
function ShareIcon() {
  return (
    <svg width="21" height="22" viewBox="0 0 24 26" fill="none">
      <path
        d="M12 2.5v13"
        stroke={GLYPH}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6l4-4 4 4"
        stroke={GLYPH}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5H5.5A1.5 1.5 0 0 0 4 12v9a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 21v-9a1.5 1.5 0 0 0-1.5-1.5H17"
        stroke={GLYPH}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// More — three filled dots.
function MoreIcon() {
  return (
    <svg width="22" height="6" viewBox="0 0 22 6" fill="none">
      <circle cx="3" cy="3" r="2.4" fill={GLYPH} />
      <circle cx="11" cy="3" r="2.4" fill={GLYPH} />
      <circle cx="19" cy="3" r="2.4" fill={GLYPH} />
    </svg>
  );
}

// Checklist — a checked row over an empty row (iOS toggle list).
function ChecklistIcon() {
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <circle cx="4" cy="4" r="3.4" stroke={GLYPH} strokeWidth="1.8" />
      <path
        d="M2.4 4l1.1 1.1L5.6 2.8"
        stroke={GLYPH}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 4h12" stroke={GLYPH} strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="15" r="3.4" stroke={GLYPH} strokeWidth="1.8" />
      <path d="M10 15h12" stroke={GLYPH} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Paperclip.
function PaperclipIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 24" fill="none">
      <path
        d="M16 7.5l-7.4 7.4a2.5 2.5 0 0 1-3.5-3.5l7.7-7.7a4.2 4.2 0 0 1 5.9 5.9l-7.8 7.8a6 6 0 0 1-8.5-8.5L9 2"
        stroke={GLYPH}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Markup — a fountain-pen nib inside a circle (iOS annotate).
function MarkupIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.2" stroke={GLYPH} strokeWidth="1.8" />
      <path
        d="M12 4.5l3 7.2-3 6-3-6 3-7.2z"
        stroke={GLYPH}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="1.1" fill={GLYPH} />
    </svg>
  );
}

// Compose — a square with a pencil (new note).
function ComposeIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 4H6a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 6 20h11a2.5 2.5 0 0 0 2.5-2.5v-5"
        stroke={GLYPH}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 3.2l3.3 3.3-8 8-3.6.3.3-3.6 8-8z"
        stroke={GLYPH}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotesPage() {
  const { close } = useAppNav();

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: PAPER, fontFamily: SF_STACK }}
    >
      {/* Top chrome — back on the left, undo + share/more on the right. */}
      <header
        className="flex items-center justify-between px-4"
        style={{ paddingTop: "calc(var(--safe-top) + 10px)" }}
      >
        <Pill onClick={close} aria-label="Back" className="h-[52px] w-[52px] pr-0.5">
          <ChevronLeftIcon />
        </Pill>

        <div className="flex items-center gap-3">
          <Pill aria-label="Undo" className="h-[52px] w-[52px]">
            <UndoIcon />
          </Pill>
          <div
            className="flex h-[52px] items-center gap-6 rounded-full bg-white px-6"
            style={{
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <button
              type="button"
              aria-label="Share"
              className="flex items-center transition-transform active:scale-[0.92]"
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              aria-label="More"
              className="flex items-center transition-transform active:scale-[0.92]"
            >
              <MoreIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Note body — wedding invite compiled for guests. */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-8 pt-6 text-[17px] leading-[1.55]"
        style={{ color: GLYPH }}
      >
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Tilak &amp; Godh Bharai · Ekansh &amp; Neha
        </h1>

        <p className="mt-3">
          With the blessings of Lord Ganesha, we cordially invite you and your family to
          our Tilak and Godh Bharai, an evening of rituals, marigolds and mithai.
        </p>

        <div className="mt-4 space-y-1.5">
          <p>🗓️ {ENGAGEMENT_DATE_LONG} · 🕖 {ENGAGEMENT_TIME}</p>
          <p>📍 {ENGAGEMENT_VENUE}</p>
          <p className="text-[15px] leading-snug">{ENGAGEMENT_ADDRESS}</p>
          <p>
            🗺️{" "}
            <button
              type="button"
              onClick={() => openMaps(MAPS_URL)}
              className="underline-offset-2 active:opacity-60"
              style={{ color: LINK }}
            >
              View engagement venue on Google Maps
            </button>
          </p>
          <p>👗 Indian festive: lehenga, sherwani, or your finest silk</p>
          <p>💌 With warm regards, {ENGAGEMENT_HOSTS}</p>
        </div>

        <p className="mt-5">
          We would be delighted to celebrate with you. Come for the rituals, stay for
          the mithai. ❤️
        </p>

        <p className="mt-5">
          👉{" "}
          <button
            type="button"
            onClick={() => openLink(HOME)}
            className="underline-offset-2 active:opacity-60"
            style={{ color: LINK }}
          >
            Open the invitation
          </button>{" "}
          for the full details, the venue map and the soundtrack.
        </p>
      </div>

      {/* Bottom toolbar — checklist / attach / markup, and compose. */}
      <footer
        className="flex items-center justify-between px-4 pt-2"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 12px)" }}
      >
        <div
          className="flex h-[54px] items-center gap-8 rounded-full bg-white px-7"
          style={{
            boxShadow: "0 4px 14px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="button"
            aria-label="Checklist"
            className="flex items-center transition-transform active:scale-[0.92]"
          >
            <ChecklistIcon />
          </button>
          <button
            type="button"
            aria-label="Attach"
            className="flex items-center transition-transform active:scale-[0.92]"
          >
            <PaperclipIcon />
          </button>
          <button
            type="button"
            aria-label="Markup"
            className="flex items-center transition-transform active:scale-[0.92]"
          >
            <MarkupIcon />
          </button>
        </div>

        <Pill aria-label="New note" className="h-[54px] w-[54px]">
          <ComposeIcon />
        </Pill>
      </footer>
    </div>
  );
}
