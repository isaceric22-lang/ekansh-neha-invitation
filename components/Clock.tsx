import { useEffect, useState } from "react";

interface ClockProps {
  time?: string;
  fontSize?: number | string;
}

function formatNow() {
  const d = new Date();
  // 12-hour clock, the way iOS shows it — no leading zero on the hour.
  const hours = d.getHours() % 12 || 12;
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${mm}`;
}

export function Clock({
  time,
  fontSize = "clamp(80px, 22cqw, 312px)",
}: ClockProps) {
  const [now, setNow] = useState(time ?? formatNow());

  useEffect(() => {
    if (time) return;
    const id = setInterval(() => setNow(formatNow()), 1000);
    return () => clearInterval(id);
  }, [time]);

  const value = time ?? now;

  return (
    <div
      className="inline-block"
      style={{
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
        fontWeight: 500,
        fontSize,
        lineHeight: 1.21,
        letterSpacing: 0,
        color: "#ffffff",
        textShadow:
          "0 2px 8px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.22)",
      }}
    >
      {value}
    </div>
  );
}
