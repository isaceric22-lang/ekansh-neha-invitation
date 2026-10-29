import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MusicContext } from "./context";
import type { MusicTrack } from "./types";
import { PLAYLIST } from "../invitation/data";
import { useCustomMedia } from "../custom-media";
import { loadYouTubeApi } from "./loadYouTubeApi";

const PLAYER_DOM_ID = "invitation-youtube-audio";

/**
 * One YouTube player for the whole invitation.
 *
 * The lock-screen widget and the YouTube app are two faces of the same engine,
 * so starting a song in either place is guaranteed to stop the other — there is
 * no second audio element that can overlap. Nothing is re-hosted: the songs
 * stream from the couple's YouTube playlist.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const { video } = useCustomMedia();

  const playlist = useMemo<MusicTrack[]>(() => {
    if (!video.id) return PLAYLIST;
    return [
      ...PLAYLIST,
      {
        id: video.id,
        title: video.title.trim() || "Our featured film",
        artist: "Our pick",
        film: "Featured",
        mood: "Our film",
      },
    ];
  }, [video.id, video.title]);

  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  const playerRef = useRef<YT.Player | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const startedRef = useRef(false);
  const playingRef = useRef(false);
  const pendingRef = useRef<number | null>(null);

  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let player: YT.Player | null = null;
    let mount: HTMLDivElement | null = null;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;

        // Build the mount node ourselves: the API replaces it with an iframe,
        // which React must not try to reconcile or remove.
        mount = document.createElement("div");
        mount.id = PLAYER_DOM_ID;
        hostRef.current.appendChild(mount);

        player = new YT.Player(mount, {
          width: 1,
          height: 1,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              target.setVolume(72);
              const pending = pendingRef.current;
              pendingRef.current = null;
              if (pending !== null) {
                const song = playlistRef.current[pending];
                if (song) target.loadVideoById(song.id);
              }
            },
            onStateChange: ({ data }) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              const YT = window.YT;
              if (!YT) return;
              if (data === 1) {
                playingRef.current = true;
                startedRef.current = true;
                setPlaying(true);
                setStarted(true);
                setError("");
              } else if (data === 2) {
                playingRef.current = false;
                setPlaying(false);
              } else if (data === 0) {
                const len = playlistRef.current.length;
                if (len) {
                  const next = (indexRef.current + 1) % len;
                  indexRef.current = next;
                  setIndex(next);
                  playerRef.current?.loadVideoById(playlistRef.current[next].id);
                }
              }
            },
            onError: () => {
              playingRef.current = false;
              setPlaying(false);
              setError("This song can't play inside the invitation. Try another one.");
            },
          },
        });

        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          setError("YouTube didn't load. Check your connection and try again.");
        }
      });

    return () => {
      cancelled = true;
      pendingRef.current = null;
      playerRef.current = null;
      try {
        player?.destroy();
      } catch {
        // The iframe may already be gone; nothing else to release.
      }
      mount?.remove();
    };
  }, []);

  // Keep the progress bar moving without re-rendering the whole app on every
  // animation frame.
  useEffect(() => {
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !startedRef.current) return;
      try {
        const time = player.getCurrentTime();
        const total = player.getDuration();
        setCurrentTime(Number.isFinite(time) ? time : 0);
        setDuration(Number.isFinite(total) ? total : 0);
      } catch {
        // Player is between states; wait for the next tick.
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const startAt = useCallback((nextIndex: number) => {
    const list = playlistRef.current;
    if (!list.length) return;
    const next = ((nextIndex % list.length) + list.length) % list.length;

    indexRef.current = next;
    setIndex(next);
    startedRef.current = true;
    playingRef.current = true;
    setStarted(true);
    setPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setError("");

    const player = playerRef.current;
    if (player?.loadVideoById) {
      player.loadVideoById(list[next].id);
      player.playVideo();
    } else {
      pendingRef.current = next;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!startedRef.current) {
      startAt(indexRef.current);
      return;
    }
    const player = playerRef.current;
    if (playingRef.current) {
      player?.pauseVideo();
      playingRef.current = false;
      setPlaying(false);
    } else {
      player?.playVideo();
      playingRef.current = true;
      setPlaying(true);
    }
  }, [startAt]);

  const prev = useCallback(() => startAt(indexRef.current - 1), [startAt]);
  const next = useCallback(() => startAt(indexRef.current + 1), [startAt]);
  const select = useCallback((i: number) => startAt(i), [startAt]);

  const seek = useCallback((ratio: number) => {
    const player = playerRef.current;
    if (!player) return;
    const total = player.getDuration();
    if (!Number.isFinite(total) || total <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    player.seekTo(clamped * total, true);
    setCurrentTime(clamped * total);
  }, []);

  const track = playlist[index] ?? playlist[0];

  return (
    <MusicContext.Provider
      value={{
        playlist,
        track,
        index,
        started,
        playing,
        currentTime,
        duration,
        error,
        togglePlay,
        prev,
        next,
        select,
        seek,
      }}
    >
      {children}
      {/* Offscreen player: audio only, never a floating video over the phone. */}
      <div
        aria-hidden
        className="pointer-events-none fixed overflow-hidden"
        style={{ left: 0, bottom: 0, width: 2, height: 2, opacity: 0.01, zIndex: -1 }}
      >
        <div ref={hostRef} />
      </div>
    </MusicContext.Provider>
  );
}
