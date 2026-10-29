import { useEffect, useId, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useCustomMedia } from "./custom-media";
import { parseYouTubeId } from "../lib/youtube";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

const GROUPED_BG = "#F2F2F7";
const GRAY = "#8E8E93";
const BLUE = "#007AFF";
const RED = "#FF3B30";

function Card({ children }: { children: ReactNode }) {
  return <div className="mx-4 overflow-hidden rounded-[10px] bg-white">{children}</div>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="mx-8 mb-2 mt-6 text-[13px] font-normal uppercase tracking-[0.02em]"
      style={{ color: GRAY }}
    >
      {children}
    </h2>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <p className="mx-8 mt-2 text-[13px] leading-snug" style={{ color: GRAY }}>
      {children}
    </p>
  );
}

/** A blue pill that opens the native file picker. */
function UploadButton({
  label,
  accept,
  multiple = true,
  onFiles,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-[9px] text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
      style={{ background: BLUE }}
    >
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = event.currentTarget.files;
          event.currentTarget.value = "";
          if (files?.length) onFiles(files);
        }}
      />
    </label>
  );
}

export default function MediaSettingsPage({ onBack }: { onBack: () => void }) {
  const {
    ready,
    photos,
    photoUrls,
    video,
    addPhotos,
    removePhoto,
    clearAllPhotos,
    setVideo,
  } = useCustomMedia();

  const [error, setError] = useState("");
  const [videoInput, setVideoInput] = useState(video.id);
  const [videoTitle, setVideoTitle] = useState(video.title);
  const [videoError, setVideoError] = useState("");
  const [videoSaved, setVideoSaved] = useState(false);

  useEffect(() => {
    setVideoInput(video.id);
    setVideoTitle(video.title);
  }, [video.id, video.title]);

  const handlePhotos = async (files: FileList) => {
    setError("");
    try {
      await addPhotos(files);
    } catch {
      setError(
        "Could not save those files. Try fewer or smaller files. Videos use a lot of storage."
      );
    }
  };

  const saveVideo = async () => {
    const raw = videoInput.trim();
    setVideoSaved(false);
    if (!raw) {
      await setVideo({ id: "", title: "" });
      setVideoError("");
      setVideoSaved(true);
      return;
    }
    const id = parseYouTubeId(raw);
    if (!id) {
      setVideoError("Paste a valid YouTube link, share link, or video ID.");
      return;
    }
    await setVideo({ id, title: videoTitle.trim() });
    setVideoError("");
    setVideoSaved(true);
  };

  const resetVideo = async () => {
    setVideoInput("");
    setVideoTitle("");
    setVideoError("");
    await setVideo({ id: "", title: "" });
    setVideoSaved(true);
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{
        background: GROUPED_BG,
        fontFamily: SF_STACK,
        paddingBottom: "calc(var(--safe-bottom) + 32px)",
      }}
    >
      <div style={{ paddingTop: "calc(var(--safe-top) + 64px)" }}>
        <button
          type="button"
          onClick={onBack}
          className="ml-4 flex items-center gap-0.5 text-[17px] transition-opacity active:opacity-60"
          style={{ color: BLUE }}
        >
          <svg width="11" height="18" viewBox="0 0 11 18" fill="none" aria-hidden>
            <path
              d="M9.5 1.5L2 9l7.5 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Settings
        </button>
        <h1 className="px-5 text-[34px] font-bold tracking-tight text-black">
          Invitation Media
        </h1>
      </div>

      {/* Device-local warning */}
      <div className="mx-4 mt-4 rounded-[10px] bg-white px-4 py-3">
        <p className="text-[15px] leading-snug text-black">
          Uploads here are saved in this browser only. They are perfect for previewing your
          own photos and videos.
        </p>
        <p className="mt-2 text-[13px] leading-snug" style={{ color: GRAY }}>
          To show them to guests, copy the files into <b>public/photos</b> (or update the
          list in <b>PhotosPage.tsx</b>), then redeploy. See <b>README.md</b>.
        </p>
      </div>

      {!ready && (
        <p className="mx-8 mt-4 text-[13px]" style={{ color: GRAY }}>
          Loading saved media…
        </p>
      )}

      {error && (
        <p className="mx-8 mt-4 text-[13px] leading-snug" style={{ color: RED }}>
          {error}
        </p>
      )}

      {/* Photos & videos */}
      <SectionTitle>Photos &amp; Videos</SectionTitle>
      <Card>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[17px] text-black">Gallery</p>
            <p className="mt-0.5 text-[13px]" style={{ color: GRAY }}>
              {photos.length
                ? `${photos.length} uploaded item${photos.length === 1 ? "" : "s"}`
                : "Using the built-in sample gallery"}
            </p>
          </div>
          <UploadButton
            label="Upload"
            accept="image/*,video/*"
            onFiles={handlePhotos}
          />
        </div>

        {photos.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-1 px-4 pb-4">
              {photos.map((photo) => {
                const src = photoUrls[photo.id];
                return (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-md bg-black/10"
                  >
                    {src && photo.kind === "video" ? (
                      <video
                        src={src}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : src ? (
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void removePhoto(photo.id)}
                      aria-label={`Remove ${photo.name}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
                    >
                      <X size={13} strokeWidth={3} />
                    </button>
                    {photo.kind === "video" && (
                      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        VIDEO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => void clearAllPhotos()}
              className="w-full border-t-[0.5px] border-black/10 py-3 text-[17px]"
              style={{ color: RED }}
            >
              Remove All Photos &amp; Videos
            </button>
          </>
        )}
      </Card>
      <Footer>
        JPG, PNG, HEIC, MP4, and MOV are supported. Videos may take a moment to save.
      </Footer>

      {/* Featured video */}
      <SectionTitle>Featured YouTube Video</SectionTitle>
      <Card>
        <div className="px-4 py-3">
          <label className="block text-[13px] font-medium" style={{ color: GRAY }}>
            YouTube link or video ID
          </label>
          <input
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://youtu.be/…"
            value={videoInput}
            onChange={(event) => {
              setVideoInput(event.target.value);
              setVideoError("");
              setVideoSaved(false);
            }}
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-[16px] text-black outline-none focus:border-[#007AFF]"
          />

          <label className="mt-4 block text-[13px] font-medium" style={{ color: GRAY }}>
            Video title
          </label>
          <input
            type="text"
            placeholder="Our wedding film"
            value={videoTitle}
            onChange={(event) => {
              setVideoTitle(event.target.value);
              setVideoSaved(false);
            }}
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-[16px] text-black outline-none focus:border-[#007AFF]"
          />

          {videoError && (
            <p className="mt-2 text-[13px] leading-snug" style={{ color: RED }}>
              {videoError}
            </p>
          )}
          {videoSaved && !videoError && (
            <p className="mt-2 text-[13px]" style={{ color: "#34C759" }}>
              Saved on this device.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveVideo()}
              className="inline-flex items-center justify-center rounded-full px-5 py-[9px] text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
              style={{ background: BLUE }}
            >
              Save Video
            </button>
            {(video.id || videoInput || videoTitle) && (
              <button
                type="button"
                onClick={() => void resetVideo()}
                className="text-[15px]"
                style={{ color: BLUE }}
              >
                Use demo video
              </button>
            )}
          </div>

          <p className="mt-3 text-[12px]" style={{ color: GRAY }}>
            {video.id
              ? "The YouTube app is showing your custom video."
              : "The YouTube app is showing the built-in demo video."}
          </p>
        </div>
      </Card>
      <Footer>
        The video must be public or unlisted. Private videos cannot be embedded.
      </Footer>
    </div>
  );
}
