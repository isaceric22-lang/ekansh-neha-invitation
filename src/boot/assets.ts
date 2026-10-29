// Critical resources shown on the lock screen + home screen at first paint.
// Album photos (public/photos/) load lazily when Photos opens, so they are
// intentionally excluded here — booting waits only on what the user sees first.
export const CRITICAL_ASSETS: readonly string[] = [
  // Wallpapers
  "/wallpaper-lock.jpg", // lock screen
  "/wallpaper-home.jpg", // home screen

  // Lock-screen controls
  "/icons/lock-flashlight.svg",
  "/icons/lock-camera.svg",

  // Home folder icons
  "/icons/calendar.png",
  "/icons/map.svg",
  "/icons/notes.svg",
  "/icons/photos.svg",
  "/icons/youtube.png",
  "/icons/rishta.png",
  "/icons/calculator.png",
  "/icons/settings.png",

  // Dock icons
  "/icons/phone.png",
  "/icons/mess.png",
  "/icons/safari.png",

  // Widgets
  "/profile.jpg",
  "/map-tile.svg",
];
