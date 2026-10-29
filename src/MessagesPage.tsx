import { ChevronLeft, ChevronRight, Mic, Plus, Video } from "lucide-react";
import styles from "./messages.module.css";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

type Entry =
  | { kind: "date"; text: string }
  | { kind: "text"; side: "sent" | "received"; text: string; tapback?: string }
  | { kind: "image"; side: "sent" | "received"; src: string };

// "sent" = Ekansh, "received" = Neha. Sample conversation — swap in your own.
const THREAD: Entry[] = [
  { kind: "date", text: "Today 9:41" },
  { kind: "text", side: "received", text: "Hey, is the invitation done yet?" },
  { kind: "text", side: "sent", text: "Done, I made the whole iPhone thing" },
  { kind: "text", side: "received", text: "Wow, who thought of that 😳" },
  { kind: "image", side: "received", src: "/message.jpg" },
  { kind: "text", side: "received", text: "The Tilak thali is packed for Thursday", tapback: "❤️" },
  { kind: "text", side: "sent", text: "Perfect. See you at 7" },
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
        >
          <span className="relative z-10 block">{text}</span>
        </div>
        {tapback && (
          <span className="absolute -top-3 -right-1 z-20 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#cfd1d4] text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            {tapback}
          </span>
        )}
      </div>
    </div>
  );
}

function ImageBubble({ side, src }: { side: "sent" | "received"; src: string }) {
  const sent = side === "sent";
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className={`relative max-w-[75%] ${sent ? styles.sentTail : styles.recvTail}`}>
        <img
          src={src}
          alt="Attachment"
          draggable={false}
          className="relative z-10 block w-[200px] rounded-[18px] object-cover select-none"
        />
      </div>
    </div>
  );
}

export default function MessagesPage({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="flex h-full w-full flex-col bg-white"
      style={{ fontFamily: SF_STACK }}
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
              return <ImageBubble key={i} side={e.side} src={e.src} />;
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
