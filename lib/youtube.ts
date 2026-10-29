/**
 * Accepts a YouTube URL, short link, share link, raw ID, or embed URL and
 * returns the 11-character video id. Returns "" when nothing usable is found.
 */
export function parseYouTubeId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return "";
  }

  if (url.hostname === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").slice(0, 11);
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  }

  const fromQuery = url.searchParams.get("v");
  if (fromQuery && /^[A-Za-z0-9_-]{11}$/.test(fromQuery)) return fromQuery;

  const parts = url.pathname.split("/").filter(Boolean);
  const marker = parts.findIndex((part) =>
    ["embed", "shorts", "live", "v"].includes(part)
  );
  if (marker >= 0 && parts[marker + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[marker + 1])) {
    return parts[marker + 1];
  }

  return "";
}
