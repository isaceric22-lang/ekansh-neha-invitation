import { useEffect, useState } from "react";
import { timeInZone, visitorZone } from "../src/invitation/time";

interface ClockProps {
  time?: string;
  fontSize?: number | string;
}

function formatNow() {
  // Formatted in the visitor's resolved zone rather than the build machine's:
  // Vercel bakes the markup, the browser knows what time it is where it is.
  // 12-hour, the way iOS shows it — no leading zero on the hour, no AM/PM.
  return timeInZone(new Date(), visitorZone()).replace(/\s?[AP]M$/i, "");
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
