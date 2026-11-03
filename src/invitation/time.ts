// Time is stored as one instant (Delhi, 5:00 PM on 15 January 2027) and every
// surface renders it in the visitor's own zone. Nothing here reads the server's
// clock: the site is a static build on Vercel, so "now" is always the browser's.
import { useEffect, useState } from "react";
import { WEDDING } from "./data";

/** The ceremony's start and end, as instants. Never re-parsed from strings. */
export const WEDDING_START = new Date(WEDDING.startISO);
export const WEDDING_END = new Date(WEDDING.endISO);

/** The venue's zone — the clock the invitation is written in. */
export const VENUE_ZONE = "Asia/Kolkata";

/** The visitor's zone, resolved once per call from their own browser. */
export function visitorZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "5:00 PM" in a named zone, so a US visitor sees the instant, not Delhi's. */
export function timeInZone(date: Date, zone: string = visitorZone()): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: zone,
  }).format(date);
}

/** "IST", "EST", "GMT+5:30" — enough to keep a converted time honest. */
export function zoneName(date: Date, zone: string = visitorZone()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? zone;
}

function ymd(date: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

/**
 * Whole calendar days from today to the wedding, in the visitor's own calendar.
 * Comparing date triples through UTC midnights keeps it DST-proof: the count does
 * not jump by an hour in March, and someone in California and someone in Delhi
 * both get the number of sleeps they actually have.
 */
export function daysUntilWedding(now: Date = new Date()): number {
  const zone = visitorZone();
  const today = ymd(now, zone);
  const wedding = ymd(WEDDING_START, zone);
  const from = Date.UTC(today.year, today.month - 1, today.day);
  const to = Date.UTC(wedding.year, wedding.month - 1, wedding.day);
  return Math.round((to - from) / 86_400_000);
}

/** A live clock: re-renders on an interval and whenever the tab is looked at. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    const onVisible = () => {
      if (!document.hidden) setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}

/** "5:00 PM IST" — the ceremony's own clock, unchanged for everyone. */
export function venueStartLabel(): string {
  return `${timeInZone(WEDDING_START, VENUE_ZONE)} IST`;
}

/** The same instant in the visitor's clock, or null when they are already in India. */
export function localStartLabel(): string | null {
  const zone = visitorZone();
  if (zone === VENUE_ZONE) return null;
  return `${timeInZone(WEDDING_START, zone)} ${zoneName(WEDDING_START, zone)}`;
}
