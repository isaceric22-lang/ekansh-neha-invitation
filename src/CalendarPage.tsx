import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useAppNav } from "./app-nav";
import {
  CALENDAR_DATE,
  CALENDAR_BACK_LABEL,
  CALENDAR_NAME,
  type CalendarEvent,
} from "../components/calendarData";

/* ── iOS palette ──────────────────────────────────────────────────── */
const BG = "#F2F2F7"; // systemGroupedBackground (light)
const LABEL = "#000000";
const SECONDARY = "#8E8E93"; // secondary label
const SELECTOR = "#C4C4C6"; // up/down chevron tint

const SF =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const tap = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const },
};

/* ── icons ────────────────────────────────────────────────────────── */
function ChevronLeftIcon() {
  return (
    <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden>
      <path
        d="M9.5 2L2.5 9.5l7 7.5"
        stroke={LABEL}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Up/down chevron pair used by iOS for tappable pickers.
function SelectorIcon() {
  return (
    <svg width="13" height="22" viewBox="0 0 13 22" fill="none" aria-hidden>
      <path
        d="M3.5 8.5L6.5 5l3 3.5"
        stroke={SELECTOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 13.5l3 3.5 3-3.5"
        stroke={SELECTOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── pieces ───────────────────────────────────────────────────────── */
// Floating white capsule used for the header buttons (chevron-back, Edit).
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
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        "flex items-center justify-center rounded-full bg-white " + className
      }
      style={{
        boxShadow: "0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
      }}
      {...tap}
    >
      {children}
    </motion.button>
  );
}

// A grouped-list row card (white, large radius) with a left label and a
// right-aligned value + optional trailing chevron picker.
function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between bg-white px-[18px]"
      style={{ height: 64, borderRadius: 22 }}
    >
      <span
        className="text-[19px] font-normal"
        style={{ color: LABEL }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */
export default function CalendarPage({ event }: { event: CalendarEvent }) {
  const { close } = useAppNav();
  const startTime = event.time.split("–")[0]; // detail shows the start time

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: BG, fontFamily: SF }}
    >
      {/* header */}
      <div
        className="absolute inset-x-0 top-0 z-20 px-4"
        style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
      >
        <div className="flex items-center justify-between">
          <Pill
            onClick={close}
            aria-label="Back"
            className="h-[46px] gap-1 pl-3 pr-4"
          >
            <ChevronLeftIcon />
            <span className="text-[19px] font-normal" style={{ color: LABEL }}>
              {CALENDAR_BACK_LABEL}
            </span>
          </Pill>
          <Pill aria-label="Edit" className="h-[46px] px-5">
            <span className="text-[19px] font-normal" style={{ color: LABEL }}>
              Edit
            </span>
          </Pill>
        </div>
      </div>

      {/* scroll body */}
      <div
        className="absolute inset-0 overflow-y-auto px-4"
        style={{
          paddingTop: "calc(var(--safe-top) + 76px)",
          paddingBottom: "calc(var(--safe-bottom) + 110px)",
        }}
      >
        {/* event heading */}
        <h1
          className="mb-3 text-[30px] font-bold leading-[1.1]"
          style={{ color: LABEL }}
        >
          {event.title}
        </h1>
        <p className="text-[18px] font-normal" style={{ color: LABEL }}>
          {CALENDAR_DATE}
        </p>
        <p className="mt-0.5 text-[18px] font-normal" style={{ color: SECONDARY }}>
          {startTime}
        </p>

        {/* location */}
        <p className="mt-3 text-[18px] font-normal" style={{ color: LABEL }}>
          {event.locationName}
        </p>
        {event.locationAddress && (
          <p className="mt-0.5 text-[16px] font-normal" style={{ color: SECONDARY }}>
            {event.locationAddress}
          </p>
        )}

        {/* grouped rows */}
        <div className="mt-7 flex flex-col gap-4">
          <Row label="Calendar">
            <span
              className="h-[15px] w-[15px] rounded-full"
              style={{ background: event.indicatorColor }}
            />
            <span className="text-[19px]" style={{ color: SECONDARY }}>
              {CALENDAR_NAME}
            </span>
            <SelectorIcon />
          </Row>
          <Row label="Notification">
            <span className="text-[19px]" style={{ color: SECONDARY }}>
              30 minutes ago
            </span>
            <SelectorIcon />
          </Row>
        </div>
      </div>
    </div>
  );
}
