// Types for media the couple uploads from the in-app customizer.
// Uploads live in IndexedDB on the current device; to publish to guests,
// replace the files in public/photos and public/music and redeploy.

export type MediaKind = "image" | "video";

export type StoredPhoto = {
  id: string;
  name: string;
  mime: string;
  kind: MediaKind;
  blob: Blob;
  createdAt: number;
};

export type StoredTrack = {
  id: string;
  name: string;
  title: string;
  artist: string;
  blob: Blob;
  createdAt: number;
};

export type CustomVideo = {
  /** YouTube video id, or "" for the built-in demo video. */
  id: string;
  title: string;
};
