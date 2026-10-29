import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MediaContext } from "./context";
import type { MediaContextValue } from "./context";
import {
  clearPhotos,
  clearTracks,
  deletePhoto,
  deleteTrack,
  getAllPhotos,
  getAllTracks,
  getSetting,
  newId,
  putPhoto,
  putTrack,
  setSetting,
} from "./db";
import type { CustomVideo, StoredPhoto, StoredTrack } from "./types";

const DEFAULT_VIDEO: CustomVideo = { id: "", title: "" };

function titleFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const cleaned = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Uploaded track";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isMediaFile(file: File): boolean {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

export function MediaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [tracks, setTracks] = useState<StoredTrack[]>([]);
  const [video, setVideoState] = useState<CustomVideo>(DEFAULT_VIDEO);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [trackUrls, setTrackUrls] = useState<Record<string, string>>({});

  // Load whatever was uploaded on this device before.
  useEffect(() => {
    let alive = true;
    Promise.all([getAllPhotos(), getAllTracks(), getSetting<CustomVideo>("video")])
      .then(([storedPhotos, storedTracks, storedVideo]) => {
        if (!alive) return;
        setPhotos([...storedPhotos].sort((a, b) => a.createdAt - b.createdAt));
        setTracks([...storedTracks].sort((a, b) => a.createdAt - b.createdAt));
        if (storedVideo) setVideoState(storedVideo);
      })
      .finally(() => {
        if (alive) {
          setReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // Build/revoke object URLs as the stored blobs change.
  useEffect(() => {
    setPhotoUrls((prev) => {
      const next: Record<string, string> = {};
      for (const photo of photos) {
        next[photo.id] = prev[photo.id] ?? URL.createObjectURL(photo.blob);
      }
      for (const id of Object.keys(prev)) {
        if (!next[id]) URL.revokeObjectURL(prev[id]);
      }
      return next;
    });
  }, [photos]);

  useEffect(() => {
    setTrackUrls((prev) => {
      const next: Record<string, string> = {};
      for (const track of tracks) {
        next[track.id] = prev[track.id] ?? URL.createObjectURL(track.blob);
      }
      for (const id of Object.keys(prev)) {
        if (!next[id]) URL.revokeObjectURL(prev[id]);
      }
      return next;
    });
  }, [tracks]);

  const addPhotos = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter(isMediaFile);
    if (!list.length) return;
    const stored: StoredPhoto[] = list.map((file) => ({
      id: newId(),
      name: file.name,
      mime: file.type,
      kind: file.type.startsWith("video/") ? "video" : "image",
      blob: file,
      createdAt: Date.now() + Math.random(),
    }));
    await Promise.all(stored.map((photo) => putPhoto(photo)));
    setPhotos((prev) => [...prev, ...stored]);
  }, []);

  const removePhoto = useCallback(async (id: string) => {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }, []);

  const clearAllPhotos = useCallback(async () => {
    await clearPhotos();
    setPhotos([]);
  }, []);

  const addTracks = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("audio/"));
    if (!list.length) return;
    const stored: StoredTrack[] = list.map((file) => ({
      id: newId(),
      name: file.name,
      title: titleFromFilename(file.name),
      artist: "Uploaded track",
      blob: file,
      createdAt: Date.now() + Math.random(),
    }));
    await Promise.all(stored.map((track) => putTrack(track)));
    setTracks((prev) => [...prev, ...stored]);
  }, []);

  const removeTrack = useCallback(async (id: string) => {
    await deleteTrack(id);
    setTracks((prev) => prev.filter((track) => track.id !== id));
  }, []);

  const clearAllTracks = useCallback(async () => {
    await clearTracks();
    setTracks([]);
  }, []);

  const setVideo = useCallback(async (next: CustomVideo) => {
    setVideoState(next);
    await setSetting("video", next);
  }, []);

  const value = useMemo<MediaContextValue>(
    () => ({
      ready,
      photos,
      tracks,
      photoUrls,
      trackUrls,
      video,
      addPhotos,
      removePhoto,
      clearAllPhotos,
      addTracks,
      removeTrack,
      clearAllTracks,
      setVideo,
    }),
    [
      ready,
      photos,
      tracks,
      photoUrls,
      trackUrls,
      video,
      addPhotos,
      removePhoto,
      clearAllPhotos,
      addTracks,
      removeTrack,
      clearAllTracks,
      setVideo,
    ]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}
