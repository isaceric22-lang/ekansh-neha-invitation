import { useRef } from "react";
import AppFolder, { type FolderChild } from "./AppFolder";
import PhotosPage from "./PhotosPage";
import NotesPage from "./NotesPage";
import CalculatorPage from "./CalculatorPage";
import RishtaPage from "./RishtaPage";
import YouTubePage from "./YouTubePage";
import SettingsPage from "./SettingsPage";
import CalendarPage from "./CalendarPage";
import { CalendarWidget } from "../components/CalendarWidget";
import {
  CALENDAR_EVENTS,
  type CalendarEvent,
} from "../components/calendarData";
import { LocationWidget } from "../components/LocationWidget";
import { SafariWidget } from "../components/SafariWidget";
import Dock from "../components/Dock";
import { AppNavProvider, useAppOpener, type AppDef } from "./app-nav";
import { MAPS_URL } from "../lib/maps";
import SafariPage from "./SafariPage";

// Each tapped event opens the Calendar app showing that event's detail.
// Opened from a widget (not an icon) → no landing-icon morph.
const calendarAppForEvent = (event: CalendarEvent): AppDef => ({
  key: "calendar",
  iconSrc: "/icons/calendar.png",
  render: () => <CalendarPage event={event} />,
  chrome: { closeButton: "none" },
  hideIcon: true,
});

const ITEMS: FolderChild[] = [
  {
    key: "calendar",
    label: "Calendar",
    iconSrc: "/icons/calendar.png",
    app: <CalendarPage event={CALENDAR_EVENTS[0]} />,
    chrome: { closeButton: "none" },
  },
  { key: "map", label: "Map", iconSrc: "/icons/map.svg", href: MAPS_URL },
  {
    key: "notes",
    label: "Notes",
    iconSrc: "/icons/notes.svg",
    app: <NotesPage />,
    chrome: { closeButton: "none" },
  },
  {
    key: "photos",
    label: "Photos",
    iconSrc: "/icons/photos.svg",
    app: <PhotosPage />,
  },
  {
    key: "youtube",
    label: "YouTube",
    iconSrc: "/icons/youtube.png",
    app: <YouTubePage />,
    background: "#000000",
  },
  {
    key: "rishta",
    label: "Rishta",
    iconSrc: "/icons/rishta.png",
    app: <RishtaPage />,
    background: "#FBF3E5",
  },
  {
    key: "calculator",
    label: "Calculator",
    iconSrc: "/icons/calculator.png",
    app: <CalculatorPage />,
    background: "#000000",
  },
  {
    key: "settings",
    label: "Settings",
    iconSrc: "/icons/settings.png",
    app: <SettingsPage />,
    background: "#F2F2F7",
  },
];

const BG_OFFSET_Y = 72;

// Tappable Calendar widget: tapping an event row morphs the whole widget into
// the Calendar app for that event. The widget stays mounted (no self-hide), so
// the modal cleanly reveals it again as it collapses back on close.
// Tappable Safari widget: the whole card becomes the invitation page.
function SafariInvitationWidget() {
  const openApp = useAppOpener();
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} style={{ borderRadius: 27, overflow: "hidden" }}>
      <SafariWidget
        onClick={() => {
          const el = rootRef.current;
          if (!el) return;
          openApp(
            {
              key: "invitation",
              iconSrc: "/icons/safari.png",
              render: () => <SafariPage />,
              hideIcon: true,
            },
            el
          );
        }}
      />
    </div>
  );
}

function CalendarWidgetButton() {
  const openApp = useAppOpener();
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} style={{ borderRadius: 27, overflow: "hidden" }}>
      <CalendarWidget
        onEventClick={(i) => {
          const el = rootRef.current;
          if (el) openApp(calendarAppForEvent(CALENDAR_EVENTS[i]), el);
        }}
      />
    </div>
  );
}

export default function IosAppFolder() {
  const extra = Math.abs(BG_OFFSET_Y) * 2;
  return (
    <AppNavProvider>
      <div className="fixed inset-0 font-sans overflow-hidden">
        <div
          className="absolute left-0 right-0 bg-cover bg-no-repeat"
          style={{
            [BG_OFFSET_Y >= 0 ? "top" : "bottom"]: 0,
            height: `calc(100% + ${extra}px)`,
            backgroundPosition:
              BG_OFFSET_Y >= 0 ? "center top" : "center bottom",
            backgroundImage: "url('/wallpaper-home.jpg')",
          }}
        />
        <div
          className="relative mx-auto grid pt-12"
          style={{
            gridTemplateColumns: "repeat(4, 71px)",
            gap: "16px",
            width: "fit-content",
          }}
        >
          <div className="col-span-2 row-span-2">
            <CalendarWidgetButton />
          </div>
          <div className="col-span-2 row-span-2">
            <LocationWidget href={MAPS_URL} />
          </div>
          <div className="col-span-2 row-span-2">
            <AppFolder title="Apps" items={ITEMS} />
          </div>
          <div className="col-span-2 row-span-2">
            <SafariInvitationWidget />
          </div>
        </div>
        <Dock />
      </div>
    </AppNavProvider>
  );
}
