/**
 * The album clips.
 *
 * Real stock footage this time — diyas burning, the mandap dressed, a couple's
 * hands — all framed so no face is in shot, because a stranger's face has no
 * business in someone else's wedding invitation. Each clip carries music: the
 * soft piano from `public/music` is muxed under the picture with fades, so the
 * video tiles play a real moment with sound instead of a silent camera push.
 *
 * Sources are the cached stock files in `.tools/stock/videos` (gitignored);
 * outputs in `public/videos` are committed, so a deploy never runs this.
 *
 *   node scripts/prepare-videos.mjs
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STOCK = path.join(ROOT, ".tools", "stock", "videos");
const PUBLIC = path.join(ROOT, "public");

const FFMPEG =
  process.env.FFMPEG_PATH ??
  path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg.exe");

/** Soft piano, long enough to loop under every clip. */
const MUSIC = path.join(PUBLIC, "music", "canon-in-d.mp3");

const CLIPS = [
  {
    // Mehendi being drawn on a bride's hand, strings of marigold behind.
    src: "15455199.mp4",
    file: "mehendi.mp4",
    width: 720,
    height: 1000,
    start: 1.2,
    seconds: 8,
    audioStart: 4,
  },
  {
    // The ring going on, two pairs of hands over a beaded blouse.
    src: "38359912.mp4",
    file: "rings.mp4",
    width: 720,
    height: 1000,
    start: 0.8,
    seconds: 8,
    audioStart: 26,
  },
  {
    // Ganpati dressed in marigold and silver on the puja chowki.
    src: "39543337.mp4",
    file: "ganesh.mp4",
    width: 720,
    height: 1000,
    start: 1,
    seconds: 8,
    audioStart: 48,
  },
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

function clip(def) {
  const source = path.join(STOCK, def.src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);
  if (!existsSync(MUSIC)) throw new Error(`Missing music: ${MUSIC}`);

  const target = path.join(PUBLIC, "videos", def.file);
  const fadeOutAt = Math.max(def.seconds - 1.4, 0);

  run(FFMPEG, [
    "-y", "-v", "error",
    // Picture: trim the source to the moment we want.
    "-ss", String(def.start), "-t", String(def.seconds), "-i", source,
    // Sound: the same piano under every clip, from a different bar each time.
    "-stream_loop", "-1", "-ss", String(def.audioStart), "-i", MUSIC,
    "-map", "0:v:0", "-map", "1:a:0",
    "-vf",
    [
      // Cover-then-crop: scaling by width alone leaves a 16:9 source a pixel or
      // two short of the target height, and crop then rejects the frame.
      `scale=${def.width}:${def.height}:force_original_aspect_ratio=increase:flags=lanczos`,
      `crop=${def.width}:${def.height}`,
      // A gentle warm lift so stock footage sits beside the cream plates.
      "eq=saturation=1.06:contrast=1.05:brightness=0.01",
      "vignette=PI/6",
    ].join(","),
    "-af", `volume=0.45,afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOutAt}:d=1.4`,
    "-t", String(def.seconds),
    "-c:v", "libx264", "-preset", "slow", "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
    "-movflags", "+faststart",
    target,
  ]);

  run(FFMPEG, [
    "-y", "-v", "error",
    "-ss", "0.6", "-i", target,
    "-frames:v", "1", "-q:v", "4",
    target.replace(/\.mp4$/, ".jpg"),
  ]);

  console.log("  ✓", def.file, "+ poster + music");
}

async function main() {
  await mkdir(path.join(PUBLIC, "videos"), { recursive: true });
  console.log("Clips");
  for (const def of CLIPS) clip(def);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
