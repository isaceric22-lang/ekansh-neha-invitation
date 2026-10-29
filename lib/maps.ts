/**
 * Universal Google Maps search for the engagement venue:
 * The SK Wedding Bells, Imperia Hall, Jhil Mil Industrial Area, Delhi.
 *
 * The Maps URLs API form is used so it works on desktop and hands off to the
 * Google Maps app on mobile when installed.
 * https://developers.google.com/maps/documentation/urls/get-started
 */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=The+SK+Wedding+Bells%2C+Imperia+Hall%2C+B-17%2C+Jhil+Mil+Industrial+Area%2C+Delhi+110095";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ reports a desktop "Macintosh" UA; detect it via touch points.
  return /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Mobile: navigate in the same tab so iOS/Android hand off to the Google Maps
 * app. Desktop: open a new browser tab.
 */
export function openMaps(url: string = MAPS_URL): void {
  if (isMobile()) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
