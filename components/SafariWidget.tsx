import { openLink } from "@/lib/link";

interface SafariWidgetProps {
  /** Header label next to the Safari compass. */
  label?: string;
  /** Main article-style title (clamped to 3 lines). */
  title?: string;
  /** Website / domain line shown under the title. */
  website?: string;
  /** Background image behind the dark gradient. */
  imageSrc?: string;
  /** Tap opens this URL. */
  href?: string;
  /** Or handle the tap in-app (e.g. open the invitation page in Safari). */
  onClick?: () => void;
}

export function SafariWidget({
  label = "Safari",
  title = "The Invitation",
  website = "ekansh-neha.invitation",
  imageSrc = "/reading-list.jpg",
  href,
  onClick,
}: SafariWidgetProps) {
  const handleClick = onClick ?? (href ? () => openLink(href) : undefined);
  return (
    <div
      onClick={handleClick}
      role={handleClick ? "button" : undefined}
      tabIndex={handleClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!handleClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={handleClick ? `Open ${title}` : undefined}
      className={
        "relative h-[158px] w-[158px] overflow-hidden" +
        (handleClick
          ? " cursor-pointer transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.97]"
          : "")
      }
      style={{
        borderRadius: 27,
        fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
        background: `center / cover no-repeat url('${imageSrc}')`,
      }}
    >
      {/* Dark gradient overlay so white text stays legible over any photo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Header: Safari compass + label */}
      <div
        className="pointer-events-none absolute flex items-center"
        style={{ left: 17, top: 20, gap: 5 }}
      >
        <svg viewBox="0 0 17 17" width="17" height="17" style={{ display: "block" }}>
          <path
            fill="#fff"
            fillRule="nonzero"
            d="M 8.25 16.5 C 12.7632 16.5 16.5 12.7551 16.5 8.25 C 16.5 3.7368 12.7551 0 8.2419 0 C 3.7368 0 0 3.7368 0 8.25 C 0 12.7551 3.7449 16.5 8.25 16.5 Z M 8.25 15.125 C 4.4324 15.125 1.3831 12.0676 1.3831 8.25 C 1.3831 4.4324 4.4243 1.375 8.2419 1.375 C 12.0595 1.375 15.125 4.4324 15.125 8.25 C 15.125 12.0676 12.0676 15.125 8.25 15.125 Z M 4.861 12.3264 L 9.5037 10.0618 C 9.7625 9.9324 9.9404 9.7544 10.0698 9.5037 L 12.3264 4.8691 C 12.5852 4.3191 12.1889 3.8904 11.6228 4.1735 L 6.9963 6.4301 C 6.7456 6.5434 6.5757 6.7132 6.4382 6.9882 L 4.1654 11.6309 C 3.9066 12.1647 4.3272 12.5852 4.861 12.3264 Z M 8.25 9.2449 C 7.7 9.2449 7.2632 8.8 7.2632 8.2581 C 7.2632 7.7081 7.7 7.2632 8.25 7.2632 C 8.8 7.2632 9.2449 7.7081 9.2449 8.2581 C 9.2449 8.8 8.8 9.2449 8.25 9.2449 Z"
          />
        </svg>
        <span
          style={{
            fontSize: 13,
            lineHeight: "16px",
            fontWeight: 500,
            color: "#fff",
          }}
        >
          {label}
        </span>
      </div>

      {/* Article title + website, bottom-aligned */}
      <div
        className="absolute flex flex-col"
        style={{
          left: 17,
          top: 54,
          width: 124,
          height: 84,
          justifyContent: "flex-end",
          gap: 7,
        }}
      >
        <div
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 16,
            lineHeight: "20px",
            letterSpacing: -0.35,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {title}
        </div>
        <div
          className="truncate"
          style={{
            fontSize: 11.5,
            lineHeight: "14px",
            letterSpacing: -0.1,
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {website}
        </div>
      </div>
    </div>
  );
}
