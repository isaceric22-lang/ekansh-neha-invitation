import GlassSurface from "./GlassSurface";
import MessagesPage from "../src/MessagesPage";
import PhonePage from "../src/PhonePage";
import SafariPage from "../src/SafariPage";
import PhotosPage from "../src/PhotosPage";
import { useAppIcon, type AppDef } from "../src/app-nav";

// Full-page apps bring their own chrome (default: no title, floating close).
const DOCK_APPS: AppDef[] = [
  { key: "Phone", iconSrc: "/icons/phone.png", render: () => <PhonePage /> },
  { key: "Messages", iconSrc: "/icons/mess.png", render: () => <MessagesPage /> },
  // Toolbar back = iframe history; floating close exits the app.
  { key: "Safari", iconSrc: "/icons/safari.png", render: () => <SafariPage /> },
  { key: "Photos", iconSrc: "/icons/photos.svg", render: () => <PhotosPage /> },
];

// English accessible names for the dock apps (keys stay as internal ids).
const DOCK_LABELS: Record<string, string> = {
  Phone: "Phone",
  Messages: "Messages",
  Safari: "Safari",
  Photos: "Photos",
};

function DockIcon({ app }: { app: AppDef }) {
  const { onClick, img } = useAppIcon(app);
  const label = DOCK_LABELS[app.key] ?? app.key;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="transition-transform active:scale-95"
    >
      <img
        {...img}
        src={app.iconSrc}
        alt={label}
        draggable={false}
        className="h-16 w-16"
      />
    </button>
  );
}

// Matches Figma node 27:323 — 368×103, radius 38, dark glass, 64px icons.
export default function Dock() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-10"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
    >
      <GlassSurface
        width={368}
        height={103}
        borderRadius={38}
        blur={20}
        backgroundOpacity={0}
      >
        {/* Dark glass tint to match Figma (black ~0.2 overlay) */}
        <div className="absolute inset-0 rounded-[inherit] bg-black/20 pointer-events-none" />
        <div className="relative flex h-full w-full items-center justify-between px-[11px]">
          {DOCK_APPS.map((app) => (
            <DockIcon key={app.key} app={app} />
          ))}
        </div>
      </GlassSurface>
    </div>
  );
}
