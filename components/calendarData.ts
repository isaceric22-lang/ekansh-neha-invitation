// Shared source of truth for the Calendar widget (home screen), the Calendar
// app's event-detail screen and the Notes invitation. Editing here updates all
// of them; names, dates and the venue live in src/invitation/data.ts.

import { WEDDING } from "../src/invitation/data";

export interface CalendarEvent {
  title: string;
  /** Start time shown in the widget and detail screen. */
  time: string;
  indicatorColor: string;
  bgColor: string;
  titleColor: string;
  timeColor: string;
  /** Venue, shown on the detail screen. */
  locationName: string;
  locationAddress: string;
}

export const CALENDAR_WEEKDAY = WEDDING.weekday.toUpperCase();
export const CALENDAR_DAY = WEDDING.day;

/** Full date line shown on the event-detail screen. */
export const CALENDAR_DATE = WEDDING.dateLong;
/** Back-button label — the event's day. */
export const CALENDAR_BACK_LABEL = "19 Nov";
/** Name of the calendar these events live in (shown in the "Calendar" row). */
export const CALENDAR_NAME = "Engagement";

export const ENGAGEMENT_DATE = WEDDING.dateLong;
export const ENGAGEMENT_DATE_LONG = WEDDING.dateLong;
export const ENGAGEMENT_TIME = WEDDING.time.replace(" onwards", "");
export const ENGAGEMENT_VENUE = WEDDING.venue;
export const ENGAGEMENT_ADDRESS = WEDDING.address;
export const ENGAGEMENT_HOSTS = WEDDING.hosts;

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    title: WEDDING.ceremony,
    time: ENGAGEMENT_TIME,
    indicatorColor: "#E8A317",
    bgColor: "#FEF4DF",
    titleColor: "#6B4A12",
    timeColor: "#A9761A",
    locationName: `${WEDDING.venue}, ${WEDDING.hall}`,
    locationAddress: WEDDING.address,
  },
];
