import type { CustomVideo, StoredPhoto, StoredTrack } from "./types";

const DB_NAME = "iphone-invitation-media";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tracks")) {
        db.createObjectStore("tracks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = action(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

async function safely<T>(fallback: T, task: () => Promise<T>): Promise<T> {
  if (!hasIndexedDb()) return fallback;
  try {
    return await task();
  } catch {
    return fallback;
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAllPhotos(): Promise<StoredPhoto[]> {
  return safely([], () => run<StoredPhoto[]>("photos", "readonly", (s) => s.getAll()));
}

export function putPhoto(photo: StoredPhoto): Promise<IDBValidKey> {
  return safely("" as IDBValidKey, () => run<IDBValidKey>("photos", "readwrite", (s) => s.put(photo)));
}

export function deletePhoto(id: string): Promise<undefined> {
  return safely(undefined, () => run<undefined>("photos", "readwrite", (s) => s.delete(id)));
}

export function clearPhotos(): Promise<undefined> {
  return safely(undefined, () => run<undefined>("photos", "readwrite", (s) => s.clear()));
}

export function getAllTracks(): Promise<StoredTrack[]> {
  return safely([], () => run<StoredTrack[]>("tracks", "readonly", (s) => s.getAll()));
}

export function putTrack(track: StoredTrack): Promise<IDBValidKey> {
  return safely("" as IDBValidKey, () => run<IDBValidKey>("tracks", "readwrite", (s) => s.put(track)));
}

export function deleteTrack(id: string): Promise<undefined> {
  return safely(undefined, () => run<undefined>("tracks", "readwrite", (s) => s.delete(id)));
}

export function clearTracks(): Promise<undefined> {
  return safely(undefined, () => run<undefined>("tracks", "readwrite", (s) => s.clear()));
}

export function getSetting<T>(key: string): Promise<T | undefined> {
  return safely(undefined, () => run<T | undefined>("settings", "readonly", (s) => s.get(key)));
}

export function setSetting<T>(key: string, value: T): Promise<IDBValidKey> {
  return safely("" as IDBValidKey, () => run<IDBValidKey>("settings", "readwrite", (s) => s.put(value, key)));
}

export type { CustomVideo };
