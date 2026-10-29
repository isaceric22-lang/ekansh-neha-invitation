import { useMemo, useState } from "react";
import { useMusic } from "./music";
import {
  WEDDING,
  ytThumb,
  ytWatchUrl,
  type Song,
} from "./invitation/data";
import { openLink } from "../lib/link";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const RED = "#FF0033";

function YouTubeMark() {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="grid h-[26px] w-[37px] place-items-center rounded-[8px]"
        style={{ background: RED }}
      >
        <svg width="13" height="14" viewBox="0 0 12 13" fill="white" aria-hidden>
          <path d="M11.4 5.6a1 1 0 0 1 0 1.8l-9.6 5.4A1 1 0 0 1 .3 12V1a1 1 0 0 1 1.5-.9l9.6 5.5Z" />
        </svg>
      </div>
      <span className="text-[20px] font-bold tracking-[-0.055em] text-white">YouTube</span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.7" stroke="white" strokeWidth="2" />
      <path d="M15.6 15.6L21 21" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CastIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 18h.01M3 21c3 0 5-2 5-5M3 15c5 0 8 3 8 8" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayTriangle({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.08} viewBox="0 0 12 13" fill="currentColor" aria-hidden>
      <path d="M11.4 5.6a1 1 0 0 1 0 1.8l-9.6 5.4A1 1 0 0 1 .3 12V1a1 1 0 0 1 1.5-.9l9.6 5.5Z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="22" height="24" viewBox="0 0 18 20" fill="currentColor" aria-hidden>
      <rect x="1" y="0" width="5" height="20" rx="1.6" />
      <rect x="12" y="0" width="5" height="20" rx="1.6" />
    </svg>
  );
}

function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-white"
          style={{
            height: 12,
            animation: `eq 900ms ease-in-out ${i * 140}ms infinite alternate`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}

function formatTime(sec: number) {
  const safe = Number.isFinite(sec) && sec > 0 ? sec : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const FILTERS: { label: string; moods: Song["mood"][] }[] = [
  { label: "All", moods: [] },
  { label: "Romantic", moods: ["Soft romantic", "Classic love", "Big feelings"] },
  { label: "Sangeet", moods: ["Sangeet", "Bridal entry"] },
];

function Row({
  song,
  active,
  playing,
  onSelect,
}: {
  song: Song;
  active: boolean;
  playing: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors active:bg-white/5"
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      <div
        className="relative aspect-video w-[132px] shrink-0 overflow-hidden rounded-[9px] bg-[#272727]"
        style={{ boxShadow: active ? `0 0 0 2px ${RED}` : undefined }}
      >
        <img
          src={ytThumb(song.id, "mq")}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {active && (
          <span className="absolute inset-0 grid place-items-center bg-black/35">
            {playing ? <PauseGlyph /> : <PlayTriangle size={20} />}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="line-clamp-2 text-[14px] font-medium leading-[1.25] text-white">
          {song.title}
        </p>
        <p className="mt-1 truncate text-[12px] text-white/55">{song.artist}</p>
        <p className="mt-1 truncate text-[11px] text-white/40">
          {song.film} · {song.mood}
        </p>
      </div>
      {active && <span className="pt-2">{playing ? <Equalizer /> : null}</span>}
    </button>
  );
}

export default function YouTubePage() {
  const {
    playlist,
    track,
    index,
    playing,
    currentTime,
    duration,
    error,
    togglePlay,
    select,
    seek,
  } = useMusic();

  const [filter, setFilter] = useState("All");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => {
    const moods = FILTERS.find((f) => f.label === filter)?.moods ?? [];
    return playlist
      .map((song, i) => ({ song, i }))
      .filter(({ song }) => !moods.length || moods.includes(song.mood));
  }, [filter, playlist]);

  const share = async () => {
    const url = ytWatchUrl(track.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: track.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // The share sheet was dismissed — no need to surface an error.
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-y-auto bg-[#0F0F0F] text-white"
      style={{
        fontFamily: SF_STACK,
        paddingBottom: "calc(var(--safe-bottom) + 26px)",
      }}
    >
      <style>{`@keyframes eq { from { transform: scaleY(0.3) } to { transform: scaleY(1) } }`}</style>

      <header
        className="flex items-center justify-between pl-[78px] pr-4"
        style={{ paddingTop: "calc(var(--safe-top) + 11px)" }}
      >
        <YouTubeMark />
        <div className="flex items-center gap-4 pr-1 text-white/90">
          <button type="button" aria-label="Cast to TV" className="active:opacity-60">
            <CastIcon />
          </button>
          <button type="button" aria-label="Search" className="active:opacity-60">
            <SearchIcon />
          </button>
        </div>
      </header>

      {/* Player */}
      <div className="relative mt-2 aspect-video w-full overflow-hidden bg-black">
        <img
          src={ytThumb(track.id, "hq")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur">
          <PlayTriangle size={8} />
          Now playing
        </div>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause song" : "Play song"}
          className="absolute inset-0 grid place-items-center"
        >
          <span
            className="grid h-[64px] w-[64px] place-items-center rounded-full bg-black/45 text-white shadow-[0_6px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform active:scale-90"
            style={{ border: "1px solid rgba(255,255,255,0.35)" }}
          >
            {playing ? <PauseGlyph /> : <PlayTriangle size={24} />}
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-white">{track.title}</p>
              <p className="truncate text-[12px] text-white/70">{track.artist}</p>
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-white/75">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width);
            }}
            className="h-[3px] w-full cursor-pointer rounded-full bg-white/30"
            role="slider"
            aria-label="Song progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={duration ? Math.round((currentTime / duration) * 100) : 0}
            tabIndex={0}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                background: RED,
              }}
            />
          </div>
        </div>
      </div>

      {/* Song heading + actions */}
      <div className="px-4 pt-3">
        <h1 className="text-[18px] font-semibold leading-snug text-white">
          {track.title} · {WEDDING.names}
        </h1>
        <p className="mt-1 text-[12px] text-white/55">
          {track.artist} · {track.film}
        </p>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-[13px] font-medium active:scale-95"
            style={{ color: liked ? RED : "white" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} aria-hidden>
              <path
                d="M12 20.2l-1.5-1.4C5.4 14.2 2.4 11.5 2.4 8.2A5.2 5.2 0 0 1 7.7 3c1.6 0 3.1.7 4.3 2A5.7 5.7 0 0 1 16.3 3a5.2 5.2 0 0 1 5.3 5.2c0 3.3-3 6-8.1 10.6L12 20.2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {liked ? "Liked" : "Like"}
          </button>
          <button
            type="button"
            onClick={share}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-[13px] font-medium active:scale-95"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
            {copied ? "Link copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={() => openLink(ytWatchUrl(track.id))}
            className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-black active:scale-95"
            style={{ background: "white" }}
          >
            Open in YouTube
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-[#3A1216] px-3 py-2 text-[12px] leading-snug text-[#FFB4B4]">
            {error}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mt-2 flex gap-2 overflow-x-auto px-4 py-2">
        {FILTERS.map((f) => {
          const active = filter === f.label;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.label)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: active ? "white" : "#272727",
                color: active ? "#0F0F0F" : "white",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between px-4 pb-1 pt-2">
        <h2 className="text-[15px] font-semibold text-white">
          {filter === "All" ? "Up next" : `${filter} songs`}
        </h2>
        <span className="text-[12px] text-white/45">{visible.length} songs</span>
      </div>

      <div className="pb-3">
        {visible.map(({ song, i }) => (
          <Row
            key={`${song.id}-${i}`}
            song={song}
            active={i === index}
            playing={playing}
            onSelect={() => select(i)}
          />
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
}
