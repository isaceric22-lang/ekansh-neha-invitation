/**
 * The three album clips.
 *
 * They are camera moves over real wedding photographs chosen for *not* showing
 * a face — the venue chairs, the cake, the lit decor — and each frame is pushed
 * through a warm duotone so people and props read as shapes. No drawn clips, so
 * the video tiles share the register of the photographs they sit beside.
 *
 * The slow push matters more than the grade: the source is upscaled 3x first
 * because zoompan steps whole pixels, and on a small source that judders.
 *
 * Sources live in `.tools/real` (gitignored); the outputs in `public/videos`
 * are committed, so a deploy never runs this script.
 *
 *   node scripts/prepare-clips.mjs
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SRC = path.join(ROOT, ".tools", "real");

const FFMPEG =
  process.env.FFMPEG_PATH ??
  path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg.exe");

const FPS = 30;

const CLIPS = [
  // Face-free: rows of chairs waiting under the trees.
  { src: "15.jpeg", file: "venue.mp4", width: 720, height: 900, seconds: 7, zoom: 0.18, pan: 0.02 },
  // Face-free: the cake, fruit and peonies.
  { src: "11.jpeg", file: "cake.mp4", width: 720, height: 900, seconds: 6, zoom: 0.14, pan: -0.02 },
  // Face-free: the bouquet — eucalyptus, gypsophila, white peonies.
  { src: "06.jpeg", file: "bouquet.mp4", width: 720, height: 800, seconds: 7, zoom: 0.18, pan: 0.015 },
];

/**
 * Warm duotone: maroon (#3B1022) in the shadows, gold (#E8C173) in the
 * highlights, via a per-channel curve after desaturating. One pass, no
 * intermediate file, and it flattens faces into shapes.
 */
const DUOTONE =
  "format=gray,eq=contrast=1.22:brightness=-0.04," +
  "curves=r='0/0.23 0.5/0.62 1/0.91':" +
  "g='0/0.06 0.5/0.38 1/0.76':" +
  "b='0/0.13 0.5/0.27 1/0.45'";

/**
 * No stills any more: the album is the drawn plate set, so the clips are the
 * only photographed material, and they stay face-free.
 */
const STILLS = [];

function still(def) {
  const source = path.join(SRC, def.src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);
  run(FFMPEG, [
    "-y", "-v", "error",
    "-i", source,
    "-vf",
    [
      `scale=${def.width}:-2:flags=lanczos`,
      `crop=${def.width}:${def.height}`,
      DUOTONE,
      "vignette=PI/5",
    ].join(","),
    "-frames:v", "1", "-q:v", "3",
    path.join(PUBLIC, "photos", def.file),
  ]);
  console.log("  ✓", def.file);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

function clip(clipDef) {
  const source = path.join(SRC, clipDef.src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);
  const target = path.join(PUBLIC, "videos", clipDef.file);
  const frames = Math.round(clipDef.seconds * FPS);

  run(FFMPEG, [
    "-y", "-v", "error",
    "-loop", "1", "-framerate", String(FPS), "-t", String(clipDef.seconds),
    "-i", source,
    "-vf",
    [
      "scale=iw*3:-2:flags=lanczos",
      `zoompan=z='1.02+${clipDef.zoom}*on/${frames}':` +
        `x='(iw-iw/zoom)*0.5+${clipDef.pan}*iw*on/${frames}':` +
        `y='(ih-ih/zoom)*0.5':d=1:s=${clipDef.width}x${clipDef.height}:fps=${FPS}`,
      DUOTONE,
      "vignette=PI/5",
    ].join(","),
    "-t", String(clipDef.seconds),
    "-c:v", "libx264", "-preset", "slow", "-crf", "23",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    target,
  ]);

  run(FFMPEG, [
    "-y", "-v", "error",
    "-ss", "0.2", "-i", target,
    "-frames:v", "1", "-q:v", "4",
    target.replace(/\.mp4$/, ".jpg"),
  ]);
  console.log("  ✓", clipDef.file, "+ poster");
}

async function main() {
  await mkdir(path.join(PUBLIC, "videos"), { recursive: true });
  await mkdir(path.join(PUBLIC, "photos"), { recursive: true });
  console.log("Clips");
  for (const item of CLIPS) clip(item);
  console.log("Stills");
  for (const item of STILLS) still(item);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
