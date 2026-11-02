import { ChevronLeft, ChevronRight, Mic, Plus, Video } from "lucide-react";
import styles from "./messages.module.css";
import { EmojiText } from "./emoji";

const TEXT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

type Entry =
  | { kind: "date"; text: string }
  | { kind: "text"; side: "sent" | "received"; text: string; tapback?: string }
  | {
      kind: "image";
      side: "sent" | "received";
      src: string;
      alt: string;
      tapback?: string;
    };

// "sent" = Ekansh, "received" = Neha.
const THREAD: Entry[] = [
  { kind: "date", text: "Today 9:41" },
  { kind: "text", side: "received", text: "You awake? I keep re-reading the invitation 😅" },
  { kind: "text", side: "sent", text: "Same here. I've checked the date three times 🥰" },
  { kind: "text", side: "received", text: "Friday the 15th. It still doesn't feel real." },
  { kind: "text", side: "sent", text: "It will when the mandap goes up." },
  { kind: "text", side: "received", text: "Okay, look what I found for the cake table." },
  {
    kind: "image",
    side: "received",
    src: "/message.jpeg",
    alt: "Two cat wedding cake toppers",
  },
  {
    kind: "text",
    side: "received",
    text: "I'm obsessed. Look at her little bouquet 🥺",
    tapback: "❤️",
  },
  { kind: "text", side: "sent", text: "Okay, those are coming home with us 😄" },
  { kind: "text", side: "received", text: "Good. I was going to buy them anyway 🙈" },
  { kind: "text", side: "sent", text: "74 days. Not that I'm counting 😌" },
  {
    kind: "text",
    side: "received",
    text: "You are absolutely counting 🙈",
    tapback: "❤️",
  },
  { kind: "text", side: "sent", text: "Guilty. 15th January, 5 o'clock — be early 💛" },
  { kind: "text", side: "received", text: "I'll be there before the chairs are ✨" },
  { kind: "text", side: "sent", text: "That's my girl 🥰" },
];

// iOS contact monogram: initials on the system gray gradient (no photo).
const MONOGRAM_BG = "linear-gradient(#a5abb9, #858b98)";

const glassCircle =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-black shadow-[0_2px_10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-transform active:scale-95";

function TextBubble({
  side,
  text,
  tapback,
}: {
  side: "sent" | "received";
  text: string;
  tapback?: string;
}) {
  const sent = side === "sent";
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className="relative max-w-[75%]">
        <div
          className={`relative rounded-[20px] px-3.5 py-2 text-[16px] leading-[20px] ${
            sent
              ? `bg-[#0088ff] text-white ${styles.sentTail}`
              : `bg-[#cfd1d4] text-[#333] ${styles.recvTail}`
          }`}
          style={{ fontFamily: TEXT_STACK }}
        >
          <span className="relative z-10 block">
            <EmojiText>{text}</EmojiText>
          </span>
        </div>
        {tapback && (
          <span
            className="absolute -top-3 -right-1 z-20 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] leading-none shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            aria-label={`Reacted ${tapback}`}
          >
            <EmojiText>{tapback}</EmojiText>
          </span>
        )}
      </div>
    </div>
  );
}

function ImageBubble({
  side,
  src,
  alt,
  tapback,
}: {
  side: "sent" | "received";
  src: string;
  alt: string;
  tapback?: string;
}) {
  const sent = side === "sent";
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className="relative max-w-[75%]">
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="block w-[220px] max-w-full select-none rounded-[18px] object-cover"
          style={{ aspectRatio: "4 / 3" }}
        />
        {tapback && (
          <span
            className="absolute -top-3 -right-1 z-20 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] leading-none shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            aria-label={`Reacted ${tapback}`}
          >
            <EmojiText>{tapback}</EmojiText>
          </span>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="flex h-full w-full flex-col bg-white"
      style={{ fontFamily: TEXT_STACK }}
    >
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col">
        {/* Header */}
        <header
          className="relative z-10 shrink-0 border-b border-black/5 bg-white/70 backdrop-blur-xl"
          style={{ paddingTop: "calc(var(--safe-top) + 10px)" }}
        >
          <div className="relative flex items-start justify-between px-3 pb-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className={glassCircle}
              >
                <ChevronLeft size={24} strokeWidth={2.25} />
              </button>
            ) : (
              <div className="h-11 w-11" aria-hidden />
            )}

            {/* Centered avatar + name */}
            <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
              <div
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full text-[24px] font-semibold text-white select-none shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                style={{ background: MONOGRAM_BG }}
              >
                N
              </div>
              <div className="mt-1 flex items-center gap-0.5 text-[13px] font-medium text-black">
                <span>Neha</span>
                <ChevronRight size={13} strokeWidth={2.5} className="text-[#bcbcbc]" />
              </div>
            </div>

            <button type="button" aria-label="Video call" className={glassCircle}>
              <Video size={22} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
          {THREAD.map((e, i) => {
            if (e.kind === "date") {
              return (
                <div
                  key={i}
                  className="my-2.5 text-center text-[12px] font-medium text-[#8e8e93]"
                >
                  {e.text}
                </div>
              );
            }
            if (e.kind === "image") {
              return (
                <ImageBubble
                  key={i}
                  side={e.side}
                  src={e.src}
                  alt={e.alt}
                  tapback={e.tapback}
                />
              );
            }
            return (
              <TextBubble
                key={i}
                side={e.side}
                text={e.text}
                tapback={e.tapback}
              />
            );
          })}
        </main>

        {/* Input bar */}
        <footer
          className="shrink-0 px-3 pt-2"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 10px)" }}
        >
          <div className="flex items-center gap-2">
            <button type="button" aria-label="More" className={glassCircle}>
              <Plus size={24} strokeWidth={2.25} />
            </button>
            <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 backdrop-blur-xl">
              <span className="flex-1 text-[16px] text-[#bcbcbc]">iMessage</span>
              <Mic size={20} strokeWidth={2} className="text-[#cccccc]" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
