/**
 * Universal Google Maps search for the wedding venue:
 * The Grandeur by Lavanya banquet, Ashok Vihar, Delhi.
 *
 * The Maps URLs API form is used so it works on desktop and hands off to the
 * Google Maps app on mobile when installed.
 * https://developers.google.com/maps/documentation/urls/get-started
 */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=The+Grandeur+by+Lavanya+banquet%2C+A-15%2C+Mahatma+Gandhi+Rd%2C+Wazirpur+Industrial+Area%2C+Ashok+Vihar%2C+Delhi+110052";

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
