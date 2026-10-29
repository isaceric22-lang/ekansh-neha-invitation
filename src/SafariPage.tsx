import { useState } from "react";
import InvitationPage from "./InvitationPage";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

/** The invitation is a page inside Safari, not a Google Form in a new tab. */
export const INVITATION_URL = "ekansh-neha.invitation";
export const HOME = INVITATION_URL;

function displayUrl(url: string) {
  if (url === INVITATION_URL) return INVITATION_URL;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (
    trimmed === INVITATION_URL ||
    /^(https?:\/\/)?(www\.)?ekansh-neha\.invitation\/?$/i.test(trimmed)
  ) {
    return INVITATION_URL;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!trimmed.includes(".")) return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
  return `https://${trimmed}`;
}

const IconBack = () => (
  <svg width="11" height="18" viewBox="0 0 11 18" fill="none" aria-hidden>
    <path
      d="M0 8.90039C0 8.64404 0.0922852 8.4082 0.287109 8.22363L8.41846 0.266602C8.59277 0.0922852 8.81836 0 9.08496 0C9.61816 0 10.0283 0.399902 10.0283 0.933105C10.0283 1.18945 9.91553 1.42529 9.75146 1.59961L2.28662 8.90039L9.75146 16.2012C9.91553 16.3755 10.0283 16.6011 10.0283 16.8677C10.0283 17.4009 9.61816 17.8008 9.08496 17.8008C8.81836 17.8008 8.59277 17.7085 8.41846 17.5239L0.287109 9.57715C0.0922852 9.38232 0 9.15674 0 8.90039Z"
      fill="currentColor"
    />
  </svg>
);

const IconReadingList = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M2.29932 0H13.5884C15.2817 0 15.8877 0.73877 15.8877 2.34912V6.20898C15.8877 7.81934 15.2817 8.55811 13.5884 8.55811H2.29932C0.605957 8.55811 0 7.81934 0 6.20898V2.34912C0 0.73877 0.605957 0 2.29932 0ZM1.33643 6.25049C1.33643 6.98926 1.57715 7.31299 2.30762 7.31299H13.5801C14.3105 7.31299 14.5513 6.98926 14.5513 6.25049V2.30762C14.5513 1.56885 14.3105 1.24512 13.5801 1.24512H2.30762C1.57715 1.24512 1.33643 1.56885 1.33643 2.30762V6.25049ZM1.95898 11.1646C1.95898 11.6626 1.56055 12.0527 1.0542 12.0527C0.564453 12.0527 0.166016 11.6626 0.166016 11.1646C0.166016 10.6748 0.564453 10.2681 1.0542 10.2681C1.56055 10.2681 1.95898 10.6748 1.95898 11.1646ZM15.5889 11.1646C15.5889 11.5298 15.29 11.812 14.8833 11.812H3.71045C3.30371 11.812 3.00488 11.5298 3.00488 11.1646C3.00488 10.7993 3.30371 10.5254 3.71045 10.5254H14.8833C15.29 10.5254 15.5889 10.7993 15.5889 11.1646ZM1.95898 14.4185C1.95898 14.9165 1.56055 15.3149 1.0542 15.3149C0.564453 15.3149 0.166016 14.9165 0.166016 14.4185C0.166016 13.9287 0.564453 13.5137 1.0542 13.5137C1.56055 13.5137 1.95898 13.9287 1.95898 14.4185ZM15.5889 14.4185C15.5889 14.7837 15.29 15.0659 14.8833 15.0659H3.71045C3.30371 15.0659 3.00488 14.7837 3.00488 14.4185C3.00488 14.0532 3.30371 13.7793 3.71045 13.7793H14.8833C15.29 13.7793 15.5889 14.0532 15.5889 14.4185Z"
      fill="currentColor"
    />
  </svg>
);

const IconReload = () => (
  <svg width="17" height="19" viewBox="0 0 17 19" fill="none" aria-hidden>
    <path
      d="M8.4668 18.7017C3.79346 18.7017 0 14.9082 0 10.2349C0 6.10938 2.94678 2.67285 6.86475 1.91748V0.74707C6.86475 0.149414 7.27148 0 7.73633 0.32373L10.376 2.18311C10.7578 2.45703 10.7495 2.85547 10.376 3.12109L7.72803 4.98047C7.27148 5.2959 6.86475 5.14648 6.86475 4.55713V3.36182C3.73535 4.08398 1.41113 6.88135 1.41113 10.2349C1.41113 14.1362 4.56543 17.2905 8.4668 17.2905C12.3682 17.2905 15.5225 14.1362 15.5225 10.2349C15.5225 7.86914 14.3604 5.78564 12.6006 4.52393C12.2603 4.2666 12.1523 3.87646 12.3599 3.52783C12.5674 3.1958 13.0405 3.09619 13.4058 3.37842C15.5474 4.92236 16.9336 7.3877 16.9336 10.2349C16.9336 14.9082 13.1401 18.7017 8.4668 18.7017Z"
      fill="currentColor"
    />
  </svg>
);

const IconShare = () => (
  <svg width="18" height="19" viewBox="0 0 24 26" fill="none" aria-hidden>
    <path d="M12 2.5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M7 10.5H5.5A1.5 1.5 0 0 0 4 12v9a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 21v-9a1.5 1.5 0 0 0-1.5-1.5H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const glassCircle =
  "flex h-[49px] w-[49px] shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/50 text-black shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-transform active:scale-95";

export default function SafariPage() {
  const [history, setHistory] = useState<string[]>([INVITATION_URL]);
  const [frameKey, setFrameKey] = useState(0);
  const [draft, setDraft] = useState(displayUrl(INVITATION_URL));
  const [shared, setShared] = useState(false);

  const current = history[history.length - 1];
  const showingInvitation = current === INVITATION_URL;

  const navigate = (input: string) => {
    const url = normalizeUrl(input);
    if (!url || url === current) return;
    setHistory((h) => [...h, url]);
    setDraft(displayUrl(url));
  };

  const back = () =>
    setHistory((h) => {
      if (h.length <= 1) return h;
      const next = h.slice(0, -1);
      setDraft(displayUrl(next[next.length - 1]));
      return next;
    });

  const refresh = () => setFrameKey((k) => k + 1);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ekansh & Neha · Tilak & Godh Bharai", url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1600);
      }
    } catch {
      // Share sheet dismissed.
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-white"
      style={{ fontFamily: SF_STACK }}
    >
      {showingInvitation ? (
        <div className="absolute inset-0 overflow-y-auto" key={frameKey}>
          <InvitationPage />
          <div style={{ height: "calc(var(--safe-bottom) + 86px)" }} />
        </div>
      ) : (
        <iframe
          key={`${current}#${frameKey}`}
          src={current}
          title="Safari"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {/* Floating glass toolbar */}
      <div
        className="absolute inset-x-0 bottom-0 z-10"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 8px)" }}
      >
        <div className="flex w-full items-center justify-center gap-2 px-[17px]">
          <button
            type="button"
            onClick={back}
            disabled={history.length <= 1}
            aria-label="Back"
            className={`${glassCircle} disabled:opacity-40`}
          >
            <IconBack />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(draft);
              (e.currentTarget.querySelector("input") as HTMLInputElement)?.blur();
            }}
            className="flex h-[49px] w-[213px] items-center gap-2 rounded-full border border-white/80 bg-white/50 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          >
            <span className="shrink-0 text-black/70">
              <IconReadingList />
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setDraft(displayUrl(current))}
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Address"
              className="min-w-0 flex-1 bg-transparent text-center text-[14px] text-black outline-none placeholder:text-black/40"
              placeholder="Search or enter website"
            />
            <button
              type="button"
              onClick={refresh}
              aria-label="Reload"
              className="shrink-0 text-black transition-transform active:scale-90"
            >
              <IconReload />
            </button>
          </form>

          <button
            type="button"
            onClick={share}
            aria-label={shared ? "Link copied" : "Share"}
            className={glassCircle}
          >
            <IconShare />
          </button>
        </div>
      </div>
    </div>
  );
}
