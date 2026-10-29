import { createContext } from "react";
import type { CustomVideo, StoredPhoto, StoredTrack } from "./types";

export type MediaContextValue = {
  ready: boolean;
  photos: StoredPhoto[];
  tracks: StoredTrack[];
  /** Object URLs for the photo/video blobs, keyed by id. */
  photoUrls: Record<string, string>;
  /** Object URLs for the audio blobs, keyed by id. */
  trackUrls: Record<string, string>;
  video: CustomVideo;
  addPhotos: (files: FileList | File[]) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
  clearAllPhotos: () => Promise<void>;
  addTracks: (files: FileList | File[]) => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
  clearAllTracks: () => Promise<void>;
  setVideo: (video: CustomVideo) => Promise<void>;
};

export const MediaContext = createContext<MediaContextValue | null>(null);
