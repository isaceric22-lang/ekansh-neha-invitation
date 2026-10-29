/**
 * Fetches and prepares the stock photography and video used by the invitation.
 *
 * Source: Pexels (https://www.pexels.com/license/) — free to use, no attribution
 * required. Downloads are cached in `.tools/stock`; the processed files in
 * `public/` are committed, so Vercel never needs this script.
 *
 *   pnpm run assets
 *
 * Videos need ffmpeg. Set FFMPEG_PATH, or install ffmpeg-static in `.tools`.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CACHE = path.join(ROOT, ".tools", "stock");
const FULL = path.join(CACHE, "full");

const FFMPEG =
  process.env.FFMPEG_PATH ??
  [
    path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg"),
  ].find((candidate) => existsSync(candidate)) ??
  "ffmpeg";

async function fetchPhoto(id) {
  const file = path.join(FULL, `${id}.jpg`);
  if (existsSync(file)) return file;
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Photo ${id}: HTTP ${response.status}`);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
}

async function fetchVideo(id) {
  const file = path.join(CACHE, "videos", `${id}.mp4`);
  if (existsSync(file)) return file;
  await mkdir(path.dirname(file), { recursive: true });
  const response = await fetch(`https://www.pexels.com/download/video/${id}/`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Video ${id}: HTTP ${response.status}`);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

/** The gallery. Each entry is cropped to a fixed shape for a balanced masonry. */
const GALLERY = [
  // North Indian bridal back view: long maroon dupatta, choora and kaleere.
  { id: "39083731", file: "01.jpg", crop: [1200, 1600] },
  { id: "2583902", file: "02.jpg", crop: [1200, 900] },
  { id: "29998307", file: "03.jpg", crop: [1200, 1600] },
  { id: "31002035", file: "04.jpg", crop: [1000, 1000] },
  { id: "8887298", file: "05.jpg", crop: [1200, 900] },
  { id: "8818664", file: "06.jpg", crop: [1000, 1000] },
  { id: "18016520", file: "07.jpg", crop: [1200, 900] },
  { id: "39820649", file: "08.jpg", crop: [1200, 800] },
  { id: "13032900", file: "09.jpg", crop: [1200, 800] },
  { id: "33350745", file: "10.jpg", crop: [1200, 1600] },
  // Interlocked hands with mehndi and a sherwani cuff — no faces.
  { id: "18098651", file: "11.jpg", crop: [1200, 900] },
  { id: "28886325", file: "12.jpg", crop: [1200, 900] },
  { id: "10143686", file: "13.jpg", crop: [1200, 800] },
  // The couple from behind at a North Indian ceremony — no faces, all ritual.
  { id: "13146927", file: "14.jpg", crop: [1200, 1600] },
];

async function cropPhoto(id, size, file, { quality = 82, position = "centre" } = {}) {
  const source = await fetchPhoto(id);
  await sharp(source)
    .rotate()
    .resize({ width: size[0], height: size[1], fit: "cover", position })
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toFile(path.join(PUBLIC, file));
  console.log("  ✓", file);
}

async function preparePhotos() {
  console.log("Gallery");
  await mkdir(path.join(PUBLIC, "photos"), { recursive: true });
  for (const item of GALLERY) {
    await cropPhoto(item.id, item.crop, `photos/${item.file}`);
  }

  console.log("Wallpapers & widgets");
  await cropPhoto("39083731", [1170, 2532], "wallpaper-lock.jpg", { quality: 80 });
  // Home wallpaper: diya bokeh, softly blurred and dimmed so the iOS widgets
  // and labels stay perfectly legible on top of it.
  const homeSource = await fetchPhoto("8887298");
  {
    const { width = 0, height = 0 } = await sharp(homeSource).metadata();
    const cropWidth = Math.round((height * 1170) / 2532);
    await sharp(homeSource)
      .extract({
        // Frame the diya on the left, away from the hand on the right.
        left: Math.min(190, Math.max(0, width - cropWidth)),
        top: 0,
        width: Math.min(cropWidth, width),
        height,
      })
      .resize(1170, 2532, { fit: "cover" })
      .blur(9)
      .modulate({ brightness: 0.58, saturation: 1.05 })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(PUBLIC, "wallpaper-home.jpg"));
    console.log("  ✓ wallpaper-home.jpg");
  }
  await cropPhoto("18016520", [512, 512], "profile.jpg", { quality: 84, position: "attention" });
  await cropPhoto("39820649", [1000, 1000], "reading-list.jpg", { quality: 82 });
  await cropPhoto("8819214", [900, 620], "message.jpg", { quality: 82 });
}

async function prepareGanesha() {
  console.log("Ganesha");
  // A sharp crop of the idol at the decorated pandal, framed on the face and
  // crown. This is the image used for the invitation mark and the unlock
  // ceremony, so it needs to hold up when scaled up.
  const source = await fetchPhoto("33350745");
  await sharp(source)
    .extract({ left: 560, top: 1480, width: 700, height: 700 })
    .resize({ width: 900, height: 900 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(PUBLIC, "ganesha.jpg"));
  console.log("  ✓ ganesha.jpg");
}

async function prepareIcons() {
  console.log("Icons");
  const size = 512;
  const iconBg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2=".4" y2="1">
        <stop offset="0" stop-color="#5B1830"/><stop offset=".55" stop-color="#3B1022"/><stop offset="1" stop-color="#1C0812"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="35%" r="70%">
        <stop offset="0" stop-color="#FFD98A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="112" fill="url(#bg)"/>
    <rect width="${size}" height="${size}" rx="112" fill="url(#glow)"/>
    <circle cx="256" cy="250" r="176" fill="none" stroke="#E8C173" stroke-width="6" opacity=".85"/>
    <circle cx="256" cy="250" r="196" fill="none" stroke="#E8C173" stroke-width="2" opacity=".35"/>
  </svg>`;
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="352" height="352"><circle cx="176" cy="176" r="176" fill="#fff"/></svg>`;
  const ganesha = await sharp(path.join(PUBLIC, "ganesha.jpg"))
    .resize(352, 352, { fit: "cover" })
    .composite([{ input: Buffer.from(mask), blend: "dest-in" }])
    .png()
    .toBuffer();

  const rituals = await sharp(Buffer.from(iconBg))
    .composite([{ input: ganesha, left: 80, top: 74 }])
    .png()
    .toBuffer();

  for (const [file, width] of [
    ["icon-512.png", 512],
    ["icon-192.png", 192],
    ["apple-touch-icon.png", 180],
    ["favicon-32.png", 32],
    ["favicon-16.png", 16],
  ]) {
    await sharp(rituals).resize(width).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, file));
    console.log("  ✓", file);
  }

  const rishta = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <defs>
      <linearGradient id="rb" x1="0" y1="0" x2=".5" y2="1">
        <stop offset="0" stop-color="#6B1C36"/><stop offset=".55" stop-color="#43101F"/><stop offset="1" stop-color="#240811"/>
      </linearGradient>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F7E3B0"/><stop offset=".5" stop-color="#D9AE62"/><stop offset="1" stop-color="#B8863B"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="114" fill="url(#rb)"/>
    <circle cx="256" cy="244" r="176" fill="none" stroke="url(#rg)" stroke-width="1.5" opacity=".38"/>
    <circle cx="212" cy="252" r="72" fill="none" stroke="url(#rg)" stroke-width="17"/>
    <circle cx="300" cy="252" r="72" fill="none" stroke="url(#rg)" stroke-width="17" opacity=".78"/>
    <path d="M256 118l7 20 20 7-20 7-7 20-7-20-20-7 20-7 7-20Z" fill="#F7E3B0"/>
  </svg>`;
  await sharp(Buffer.from(rishta)).png().toFile(path.join(PUBLIC, "icons", "rishta.png"));
  console.log("  ✓ icons/rishta.png");

  const calendar = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" rx="114" fill="#FCFBF8"/>
    <rect x="1" y="1" width="510" height="510" rx="113" fill="none" stroke="#E6E1D7" stroke-width="2"/>
    <text x="256" y="168" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="74" font-weight="700" fill="#E0393E" letter-spacing="2">NOV</text>
    <text x="256" y="388" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="228" font-weight="300" fill="#1C1C1E">19</text>
  </svg>`;
  await sharp(Buffer.from(calendar)).png().toFile(path.join(PUBLIC, "icons", "calendar.png"));
  console.log("  ✓ icons/calendar.png");
}

async function prepareOg() {
  const base = await sharp(await fetchPhoto("39083731"))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.7, saturation: 0.95 })
    .toBuffer();
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1B0712" stop-opacity=".94"/>
        <stop offset=".62" stop-color="#1B0712" stop-opacity=".72"/>
        <stop offset="1" stop-color="#1B0712" stop-opacity=".25"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2=".4" y2="1">
        <stop offset="0" stop-color="#F8E8BC"/><stop offset="1" stop-color="#C99A4A"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#fade)"/>
    <rect x="28" y="28" width="1144" height="574" rx="26" fill="none" stroke="#E8C173" stroke-width="1.6" opacity=".55"/>
    <text x="80" y="172" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="17" letter-spacing="5" fill="#E8C173">WITH THE BLESSINGS OF LORD GANESHA</text>
    <text x="80" y="288" font-family="Georgia, 'Times New Roman', serif" font-size="82" fill="#FCF3DF">Ekansh &amp; Neha</text>
    <text x="80" y="354" font-family="Georgia, 'Times New Roman', serif" font-size="35" letter-spacing="2" fill="#E8C173">Tilak &amp; Godh Bharai</text>
    <text x="80" y="442" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="25" fill="#F3DFC2">Thursday, 19 November 2026 · 7:00 PM</text>
    <text x="80" y="482" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="20" fill="#D9BE9A">The SK Wedding Bells, Imperia Hall · Delhi</text>
    <text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" letter-spacing="4" fill="#C99A4A">UNLOCK THE INVITATION</text>
  </svg>`;
  await sharp(base)
    .composite([{ input: Buffer.from(overlay) }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(PUBLIC, "og-image.jpg"));
  console.log("  ✓ og-image.jpg");
}

const VIDEOS = [
  // The bride's hennaed hands and chooda — North Indian, faces deliberately out of frame.
  { id: "27180421", file: "hands.mp4", width: 960, seconds: 4 },
  // Mehndi being applied against a marigold backdrop.
  { id: "15455199", file: "mehndi.mp4", width: 720, seconds: 6, crop: "crop=1080:1350:0:260" },
  // Rows of diyas in the dark.
  { id: "11758612", file: "diyas.mp4", width: 540, seconds: 6 },
];

async function prepareVideos() {
  console.log("Videos");
  await mkdir(path.join(PUBLIC, "videos"), { recursive: true });
  for (const item of VIDEOS) {
    const source = await fetchVideo(item.id);
    const target = path.join(PUBLIC, "videos", item.file);
    run(FFMPEG, [
      "-y",
      "-v", "error",
      "-ss", "0",
      "-t", String(item.seconds),
      "-i", source,
      "-an",
      "-vf", item.crop ? `${item.crop},scale=${item.width}:-2` : `scale=${item.width}:-2`,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "28",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      target,
    ]);
    const poster = target.replace(/\.mp4$/, ".jpg");
    run(FFMPEG, [
      "-y", "-v", "error",
      "-ss", "1",
      "-i", target,
      "-frames:v", "1",
      "-vf", `scale=${item.width}:-2`,
      "-q:v", "4",
      poster,
    ]);
    console.log("  ✓", item.file, "+ poster");
  }
}

async function main() {
  await mkdir(FULL, { recursive: true });
  await mkdir(path.join(PUBLIC, "icons"), { recursive: true });
  await preparePhotos();
  await prepareGanesha();
  await prepareIcons();
  await prepareOg();
  await prepareVideos();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
