import { useState } from "react";
import { ChevronLeft, ChevronRight, Mic, Plus, Video } from "lucide-react";
import styles from "./messages.module.css";
import { EmojiText } from "./emoji";

const TEXT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

type Entry =
  | { kind: "date"; text: string }
  | { kind: "text"; side: "sent" | "received"; text: string; tapback?: string }
  | {
      kind: "sticker";
      side: "sent" | "received";
      src: string;
      alt: string;
      /** A sticker is dropped on, not aligned — a few degrees off square. */
      rotate?: number;
      tapback?: string;
    };

// "sent" = Ekansh, "received" = Neha.
const THREAD: Entry[] = [
  { kind: "date", text: "Today 9:41" },
  { kind: "text", side: "received", text: "Ekansh. EKANSH. Are you awake 😅" },
  { kind: "text", side: "sent", text: "Up. What happened?" },
  {
    kind: "text",
    side: "received",
    text: "Nothing happened. I just found my dupatta for the 15th 🙈",
  },
  { kind: "text", side: "sent", text: "The one with the gold border?" },
  { kind: "text", side: "received", text: "That one. I might have teared up a little." },
  {
    kind: "sticker",
    side: "received",
    src: "/stickers/baby.svg",
    alt: "Baby sticker",
    rotate: 5,
  },
  {
    kind: "text",
    side: "sent",
    text: "You're going to have me crying before the baraat even starts 😭",
  },
  { kind: "text", side: "received", text: "Good. That's the plan ✨" },
  {
    kind: "text",
    side: "sent",
    text: "Five o'clock on a Friday, though. Who plans these things 😌",
  },
  {
    kind: "text",
    side: "received",
    text: "We do. And you'd do it again at five in the morning 💛",
  },
  { kind: "text", side: "sent", text: "I would.", tapback: "❤️" },
  {
    kind: "sticker",
    side: "sent",
    src: "/stickers/panda.svg",
    alt: "Panda sticker",
    rotate: -5,
  },
  { kind: "text", side: "received", text: "73 days. Not that either of us is counting." },
  { kind: "text", side: "received", text: "Okay, I'm counting 🙈", tapback: "❤️" },
  { kind: "text", side: "sent", text: "Same. Be early 💛" },
  { kind: "text", side: "received", text: "I'll be there before the chairs are 🥰" },
];

// iOS contact monogram: initials on the system gray gradient (no photo).
const MONOGRAM_BG = "linear-gradient(#a5abb9, #858b98)";

const glassCircle =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-black shadow-[0_2px_10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-transform active:scale-95";

function Tapback({ emoji }: { emoji: string }) {
  return (
    <span
      className="absolute -top-2 -right-1 z-20 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] leading-none shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
      aria-label={`Reacted ${emoji}`}
    >
      <EmojiText>{emoji}</EmojiText>
    </span>
  );
}

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
        {tapback && <Tapback emoji={tapback} />}
      </div>
    </div>
  );
}

/**
 * A sticker: no bubble, no tail, no caption — it lands over the thread the way a
 * sticker does in a real conversation, standing in for the feeling rather than
 * being the subject of a message.
 */
function Sticker({
  side,
  src,
  alt,
  rotate = 0,
  tapback,
}: {
  side: "sent" | "received";
  src: string;
  alt: string;
  rotate?: number;
  tapback?: string;
}) {
  const sent = side === "sent";
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className="relative" style={{ width: 118, height: 118 }}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full select-none object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
          style={{ transform: `rotate(${rotate}deg)` }}
        />
        {tapback && <Tapback emoji={tapback} />}
      </div>
    </div>
  );
}

export default function MessagesPage({ onBack }: { onBack?: () => void }) {
  // iOS keeps the big contact block in the thread and lifts a compact avatar and
  // name into the nav bar once that block has scrolled away, so the header still
  // says who you are talking to without pinning the whole block.
  const [collapsed, setCollapsed] = useState(false);

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

            <button type="button" aria-label="Video call" className={glassCircle}>
              <Video size={22} strokeWidth={2} />
            </button>

            {/* Compact contact in the nav bar, revealed as the thread scrolls. */}
            <div
              aria-hidden={!collapsed}
              className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center transition-opacity duration-200"
              style={{ opacity: collapsed ? 1 : 0 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold text-white select-none"
                style={{ background: MONOGRAM_BG }}
              >
                N
              </div>
              <span className="mt-px text-[11px] font-medium text-black">Neha</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main
          className="flex-1 overflow-y-auto px-4 pt-3 pb-2"
          onScroll={(event) => setCollapsed(event.currentTarget.scrollTop > 56)}
        >
          {/* The big contact block sits at the top of the thread and scrolls with
              it; the nav bar picks up the compact version once this is out of
              view, the way Messages does it. */}
          <div className="mb-3 flex flex-col items-center">
            <div
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-full text-[26px] font-semibold text-white select-none shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
              style={{ background: MONOGRAM_BG }}
            >
              N
            </div>
            <div className="mt-1.5 flex items-center gap-0.5 text-[13px] font-medium text-black">
              <span>Neha</span>
              <ChevronRight size={13} strokeWidth={2.5} className="text-[#bcbcbc]" />
            </div>
          </div>
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
            if (e.kind === "sticker") {
              return (
                <Sticker
                  key={i}
                  side={e.side}
                  src={e.src}
                  alt={e.alt}
                  rotate={e.rotate}
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
