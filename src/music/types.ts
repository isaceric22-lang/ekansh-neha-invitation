import type { Song } from "../invitation/data";

export type MusicTrack = Song;

export type MusicApi = {
  playlist: MusicTrack[];
  track: MusicTrack;
  index: number;
  /** True once the user has started the soundtrack. */
  started: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  error: string;
  togglePlay: () => void;
  prev: () => void;
  next: () => void;
  /** Play a specific playlist row (used by the YouTube app). */
  select: (index: number) => void;
  /** ratio is 0..1 of the current track's duration. */
  seek: (ratio: number) => void;
};
