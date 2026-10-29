function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ reports a desktop "Macintosh" UA; detect it via touch points.
  return /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Open an external link the way iOS expects from a tapped widget.
 *
 * Mobile: navigate in the same tab so the OS can hand off to the relevant app
 * and to avoid pop-up blockers. Desktop: open a new browser tab.
 */
export function openLink(url: string): void {
  if (isMobile()) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
