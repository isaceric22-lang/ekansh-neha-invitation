import { useEffect, useState } from "react";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';
// Rounded face for the playful, sến copy on the pass.
const SF_ROUNDED =
  'ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif';

// Cheesy one-liners that crossfade under the QR. Pure decoration.
const SWEET_LINES = [
  "Quẹt nhẹ thôi, tình mình đậm sâu",
  "Tiền mừng nhỏ nhỏ, thương nhau to to",
  "Một chút yêu thương gửi cô dâu chú rể",
  "Mừng cưới đôi trẻ, trăm năm hạnh phúc",
  "Cảm ơn vì đã thương tụi mình",
];

// A few hearts drift up across the dark backdrop. Positions/speeds are fixed so
// the layout is stable on every render (no per-render randomness).
const HEARTS = [
  { left: "14%", size: 18, delay: 0, dur: 10, drift: -12 },
  { left: "38%", size: 22, delay: 3.2, dur: 9, drift: 10 },
  { left: "66%", size: 16, delay: 1.6, dur: 12, drift: -10 },
  { left: "88%", size: 20, delay: 5.0, dur: 11, drift: 12 },
];

export default function WalletPage() {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setLine((i) => (i + 1) % SWEET_LINES.length),
      3200
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ fontFamily: SF_STACK }}
    >
      {/* Romantic dark backdrop: deep rose vignette over black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, #3a1426 0%, #1a0a13 45%, #000 100%)",
        }}
      />

      {/* Floating hearts drifting upward. */}
      <div className="pointer-events-none absolute inset-0">
        {HEARTS.map((h, i) => (
          <span
            key={i}
            className="absolute bottom-[-40px] will-change-transform"
            style={{
              left: h.left,
              fontSize: h.size,
              animation: `wp-float ${h.dur}s ${h.delay}s cubic-bezier(0.4,0,0.2,1) infinite`,
              // Custom prop read by the keyframes for a gentle sideways sway.
              ["--drift" as string]: `${h.drift}px`,
            }}
          >
            💗
          </span>
        ))}
      </div>

      {/* Centered Wallet pass. */}
      <div
        className="absolute inset-0 flex items-center justify-center px-6"
        style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
      >
        <div
          className="group relative w-full max-w-[330px] cursor-default transition-transform duration-200 active:scale-[0.98]"
          style={{ animation: "wp-bob 6s ease-in-out infinite" }}
        >
          {/* The pass card. */}
          <div
            className="relative overflow-hidden rounded-[26px]"
            style={{
              background:
                "linear-gradient(155deg, #FF5C9A 0%, #FF7FB0 42%, #FFA9C9 100%)",
              boxShadow:
                "0 22px 60px rgba(255,92,154,0.35), 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            {/* Glossy top highlight for the candy/glass feel. */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0))",
              }}
            />

            {/* Header: pass label + couple. */}
            <div className="relative px-6 pt-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                Ví · Mừng cưới
              </span>

              <h1
                className="mt-3 text-[34px] font-bold leading-none text-white"
                style={{ fontFamily: SF_ROUNDED, textShadow: "0 1px 8px rgba(0,0,0,0.12)" }}
              >
                Trí <span className="opacity-90">&amp;</span> Như
              </h1>
              <p className="mt-1.5 text-[13px] font-semibold text-white/90">
                14.06.2026 · Hộp lì xì hạnh phúc
              </p>
            </div>

            {/* Ticket perforation with side notches (boarding-pass cut). */}
            <div className="relative mt-5 h-[22px]">
              <div
                className="absolute left-5 right-5 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/55"
              />
              <span
                className="absolute left-[-11px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full"
                style={{ background: "#120710" }}
              />
              <span
                className="absolute right-[-11px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full"
                style={{ background: "#120710" }}
              />
            </div>

            {/* QR panel — the real centerpiece. */}
            <div className="relative px-6 pb-6 pt-1">
              <div
                className="mx-auto w-fit rounded-[20px] bg-white p-3"
                style={{ boxShadow: "0 8px 22px rgba(0,0,0,0.18)" }}
              >
                <img
                  src="/gift-qr.png"
                  alt="Mã QR mừng cưới"
                  className="block h-[210px] w-[210px] rounded-[12px] object-contain"
                />
              </div>

              <p className="mt-4 text-center text-[14px] font-bold text-white">
                Quét mã để mừng cưới đôi trẻ
              </p>

              {/* Crossfading sến caption. */}
              <div className="mt-1 flex h-[20px] items-center justify-center">
                <span
                  key={line}
                  className="text-center text-[12.5px] font-medium text-white/90"
                  style={{ animation: "wp-fade 3.2s ease-in-out" }}
                >
                  {SWEET_LINES[line]}
                </span>
              </div>
            </div>
          </div>

          {/* Little caption under the card. */}
          <p className="mt-5 text-center text-[12px] font-medium text-white/55">
            Sự hiện diện của bạn đã là món quà quý nhất
          </p>
        </div>
      </div>

      {/* Keyframes scoped to this page. */}
      <style>{`
        @keyframes wp-float {
          0%   { transform: translate(0, 0) scale(0.9); opacity: 0; }
          12%  { opacity: 0.9; }
          88%  { opacity: 0.9; }
          100% { transform: translate(var(--drift), -108vh) scale(1.1); opacity: 0; }
        }
        @keyframes wp-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes wp-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          14%  { opacity: 1; transform: translateY(0); }
          86%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .group, span[style*="wp-float"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
