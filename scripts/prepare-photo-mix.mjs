/**
 * The album is a mix of drawn plates and real photographs.
 *
 * Real frames are not dropped in raw: each one is printed inside the same
 * cream plate and double gold rule the illustrated pages use, with a light
 * warm wash and vignette, so a photograph and a line drawing can sit next to
 * each other without the set looking stitched together.
 *
 * Two album clips are camera moves over real frames (see CLIPS below); the
 * three drawn clips are produced by prepare-assets.mjs.
 *
 * Sources live in `.tools/real` (gitignored). Outputs in `public/` are
 * committed, so a deploy never needs this script.
 *
 *   node scripts/prepare-photo-mix.mjs
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SRC = path.join(ROOT, ".tools", "real");

const CREAM = "#FBF3E5";
const CREAM_DEEP = "#F3E4CB";
const GOLD = "#C99A4A";
const GOLD_LIGHT = "#E8C173";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

/** Paper the photograph is printed on. */
function plateSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#FDF9F0"/>
        <stop offset=".6" stop-color="${CREAM}"/>
        <stop offset="1" stop-color="${CREAM_DEEP}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#p)"/>
  </svg>`;
}

/** Gold hairline + inner rule around the print. */
function frameSvg(w, h, inset) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
      fill="none" stroke="${GOLD}" stroke-width="1.6" opacity="0.7"/>
    <rect x="${inset + 6}" y="${inset + 6}" width="${w - inset * 2 - 12}" height="${h - inset * 2 - 12}"
      fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>
  </svg>`;
}

/** Warm wash + corner vignette so a photo reads like a printed plate. */
function washSvg(w, h, inset) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="v" cx="50%" cy="45%" r="76%">
        <stop offset="0" stop-color="#2B0A14" stop-opacity="0"/>
        <stop offset=".68" stop-color="#2B0A14" stop-opacity="0.1"/>
        <stop offset="1" stop-color="#2B0A14" stop-opacity="0.38"/>
      </radialGradient>
      <linearGradient id="w" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="${GOLD_LIGHT}" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#8A5A22" stop-opacity="0.08"/>
      </linearGradient>
    </defs>
    <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="url(#w)"/>
    <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="url(#v)"/>
  </svg>`;
}

/** One photograph printed as an album page. */
async function photoPlate({ src, file, width, height, position = "attention" }) {
  const source = path.join(SRC, src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);
  const inset = Math.round(Math.min(width, height) * 0.045);
  const printW = width - inset * 2;
  const printH = height - inset * 2;

  const print = await sharp(source)
    .rotate()
    // Stock punch is dialled back so the photograph sits beside gold ink
    // instead of shouting over it.
    .modulate({ saturation: 0.92, brightness: 0.99 })
    .resize({ width: printW, height: printH, fit: "cover", position })
    .toBuffer();

  await sharp(Buffer.from(plateSvg(width, height)))
    .composite([
      { input: print, left: inset, top: inset },
      { input: Buffer.from(washSvg(width, height, inset)), left: 0, top: 0 },
      { input: Buffer.from(frameSvg(width, height, inset)), left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toFile(path.join(PUBLIC, "photos", file));
  console.log("  ✓", file);
}

/** A slow camera move across a real frame, with its poster. */
async function clip({ src, file, width, height, seconds, zoom, pan }) {
  const FPS = 30;
  const frames = Math.round(seconds * FPS);
  const target = path.join(PUBLIC, "videos", file);
  run(FFMPEG, [
    "-y", "-v", "error",
    "-loop", "1", "-framerate", String(FPS), "-t", String(seconds),
    "-i", path.join(SRC, src),
    "-vf",
    [
      // 3x upscale first: zoompan steps whole pixels, so on a small source the
      // push would judder. At 3x the steps land well under one output pixel.
      "scale=iw*3:-2:flags=lanczos",
      `zoompan=z='1.02+${zoom}*on/${frames}':` +
        `x='(iw-iw/zoom)*0.5+${pan}*iw*on/${frames}':` +
        `y='(ih-ih/zoom)*0.5':d=1:s=${width}x${height}:fps=${FPS}`,
      "eq=saturation=0.94:contrast=1.02",
    ].join(","),
    "-t", String(seconds),
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
  console.log("  ✓", file, "+ poster");
}

const FFMPEG =
  process.env.FFMPEG_PATH ??
  path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg.exe");

const PHOTOS = [
  // Atmosphere and props first: they sit beside the drawings without asking
  // anyone to recognise a face.
  { src: "07.jpeg", file: "real-01.jpg", width: 1200, height: 900 },
  { src: "11.jpeg", file: "real-02.jpg", width: 1200, height: 1600 },
  { src: "15.jpeg", file: "real-03.jpg", width: 1200, height: 1600 },
  { src: "01.jpeg", file: "real-04.jpg", width: 1200, height: 1600 },
  { src: "16.jpeg", file: "real-05.jpg", width: 1200, height: 900, position: "top" },
  { src: "03.jpeg", file: "real-06.jpg", width: 1200, height: 900 },
];

const CLIPS = [
  { src: "07.jpeg", file: "venue.mp4", width: 720, height: 900, seconds: 7, zoom: 0.16, pan: 0.02 },
  { src: "16.jpeg", file: "bride.mp4", width: 720, height: 760, seconds: 6, zoom: 0.2, pan: -0.02 },
];

async function main() {
  await mkdir(path.join(PUBLIC, "photos"), { recursive: true });
  await mkdir(path.join(PUBLIC, "videos"), { recursive: true });
  console.log("Real plates");
  for (const item of PHOTOS) await photoPlate(item);
  console.log("Real clips");
  for (const item of CLIPS) await clip(item);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
