/**
 * Fetches and prepares the artwork used by the invitation.
 *
 * Source: Pixabay (https://pixabay.com/service/license-summary/) — free for
 * commercial use, no attribution required. Every file is a vector illustration
 * or digital painting, never a photograph, so the album looks illustrated
 * rather than stocked.
 *
 * Downloads are cached in `.tools/art`; the processed files in `public/` are
 * committed, so Vercel never needs this script.
 *
 *   pnpm run assets
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CACHE = path.join(ROOT, ".tools", "art");

const CREAM = "#FBF3E5";
const CREAM_DEEP = "#F3E4CB";
const MAROON = "#4A1223";
const PLUM = "#2B0A14";
const GOLD = "#C99A4A";
const GOLD_LIGHT = "#E8C173";
const INK = "#3B1022";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

async function download(url) {
  const file = path.join(CACHE, path.basename(new URL(url).pathname));
  if (existsSync(file)) return file;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
}

/**
 * Turns line art on white (or on transparency) into a single-colour plate:
 * alpha comes from the ink, so the drawing can sit on cream or maroon.
 */
async function recolour(source, ink) {
  const meta = await sharp(source).metadata();
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(ink.slice(i, i + 2), 16));
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    // Distance from white along the darkest channel keeps coloured inks
    // (gold, blue) as strong as black ones.
    const inkAlpha = 255 - Math.min(data[i], data[i + 1], data[i + 2]);
    const base = meta.hasAlpha ? data[i + 3] : 255;
    const alpha = Math.min(255, Math.round(((base * inkAlpha) / 255) * 1.45));
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = alpha;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

/** Paper + frame the artwork sits on. Every page reads like an album plate. */
function plateSvg(w, h, tone) {
  const dark = tone === "maroon";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="0.3" y2="1">
        ${
          dark
            ? `<stop offset="0" stop-color="#5B1830"/><stop offset=".55" stop-color="${MAROON}"/><stop offset="1" stop-color="${PLUM}"/>`
            : `<stop offset="0" stop-color="#FDF9F0"/><stop offset=".6" stop-color="${CREAM}"/><stop offset="1" stop-color="${CREAM_DEEP}"/>`
        }
      </linearGradient>
      <radialGradient id="g" cx="50%" cy="38%" r="72%">
        <stop offset="0" stop-color="${GOLD_LIGHT}" stop-opacity="${dark ? 0.14 : 0.18}"/>
        <stop offset="1" stop-color="${GOLD_LIGHT}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#p)"/>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
  </svg>`;
}

function frameSvg(w, h, inset, dark) {
  const line = dark ? GOLD : "rgba(201,154,74,0.55)";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
      fill="none" stroke="${line}" stroke-width="1.6" opacity="0.8"/>
    <rect x="${inset + 7}" y="${inset + 7}" width="${w - inset * 2 - 14}" height="${h - inset * 2 - 14}"
      fill="none" stroke="${line}" stroke-width="0.7" opacity="0.45"/>
  </svg>`;
}

/**
 * One gallery page.
 *  mode "print": a full-bleed illustration inside a cream margin.
 *  mode "line":  single-colour line art centred on a cream or maroon plate.
 */
async function page({
  url,
  file,
  width,
  height,
  mode,
  tone = "cream",
  ink = GOLD,
  quality = 84,
  inset = Math.round(Math.min(width, height) * 0.035),
}) {
  const source = await download(url);
  const frame = Buffer.from(frameSvg(width, height, inset, tone === "maroon"));

  let art;
  let left;
  let top;
  if (mode === "fit") {
    const box = Math.round(Math.min(width, height) * 0.9);
    art = await sharp(source)
      .rotate()
      .modulate({ saturation: 1.25 })
      .resize({ width: box, height: box, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const meta = await sharp(art).metadata();
    left = Math.round((width - meta.width) / 2);
    top = Math.round((height - meta.height) / 2);
  } else if (mode === "print") {
    const plateW = width - inset * 2;
    const plateH = height - inset * 2;
    art = await sharp(source)
      .rotate()
      .resize({ width: plateW, height: plateH, fit: "cover", position: "attention" })
      .toBuffer();
    left = inset;
    top = inset;
  } else {
    const box = Math.min(width, height) - inset * 2 - Math.round(Math.min(width, height) * 0.14);
    art = await sharp(await recolour(source, ink))
      .resize({ width: box, height: box, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const meta = await sharp(art).metadata();
    left = Math.round((width - meta.width) / 2);
    top = Math.round((height - meta.height) / 2);
  }

  const base = await sharp(Buffer.from(plateSvg(width, height, tone))).png().toBuffer();
  await sharp(base)
    .composite([
      { input: art, left, top },
      { input: frame },
    ])
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toFile(path.join(PUBLIC, file));
  console.log("  ✓", file);
}

/** A tall wallpaper: gradient, oversized motif, vignette. */
async function wallpaper({ url, file, tone = "maroon", ink = GOLD, brightness = 0.86, blur = 0, scale = 0.78, y = 0.5 }) {
  const w = 1170;
  const h = 2532;
  const source = await download(url);
  const art = await sharp(await recolour(source, ink))
    .resize({ width: Math.round(w * scale), height: Math.round(w * scale), fit: "inside" })
    .toBuffer();
  let layer = art;
  const scaled = await sharp(layer).metadata();
  if (scaled.width > w || scaled.height > h) {
    // Oversized motifs are cropped to the frame instead of shrunk.
    const cropW = Math.min(scaled.width, w);
    const cropH = Math.min(scaled.height, h);
    layer = await sharp(layer)
      .extract({
        left: Math.round((scaled.width - cropW) / 2),
        top: Math.max(0, Math.round((scaled.height - cropH) * y)),
        width: cropW,
        height: cropH,
      })
      .toBuffer();
  }
  if (blur) layer = await sharp(layer).blur(blur).toBuffer();
  const meta = await sharp(layer).metadata();
  const vignette = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <defs><radialGradient id="v" cx="50%" cy="42%" r="78%">
         <stop offset="0" stop-color="#000" stop-opacity="0"/>
         <stop offset=".62" stop-color="#000" stop-opacity="0.18"/>
         <stop offset="1" stop-color="#000" stop-opacity="0.62"/>
       </radialGradient></defs>
       <rect width="${w}" height="${h}" fill="url(#v)"/>
     </svg>`
  );
  await sharp(Buffer.from(plateSvg(w, h, tone)))
    .composite([
      { input: layer, left: Math.round((w - meta.width) / 2), top: Math.round((h - meta.height) * y), blend: "over" },
      { input: vignette },
    ])
    .modulate({ brightness })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(path.join(PUBLIC, file));
  console.log("  ✓", file);
}

const FFMPEG =
  process.env.FFMPEG_PATH ??
  path.join(ROOT, ".tools", "ffmpeg", "node_modules", "ffmpeg-static", "ffmpeg.exe");

const ART = {
  couple:
    "https://cdn.pixabay.com/photo/2021/04/08/09/13/wedding-dress-6161116_1280.png",
  feather:
    "https://cdn.pixabay.com/photo/2015/04/21/14/42/peacock-feather-733347_1280.png",
  swirl:
    "https://cdn.pixabay.com/photo/2013/09/12/21/37/henna-181789_1280.png",
  vine:
    "https://cdn.pixabay.com/photo/2013/09/12/21/37/henna-181791_1280.png",
  mandala:
    "https://cdn.pixabay.com/photo/2022/09/17/23/12/mandala-7461931_1280.png",
  wreath:
    "https://cdn.pixabay.com/photo/2019/11/07/22/45/watercolour-flowers-4610095_1280.png",
  // Gold line-art series: palanquin, baraat horse, ceremony, diya.
  palki:
    "https://cdn.pixabay.com/photo/2022/07/20/10/16/wedding-7333870_1280.png",
  horse:
    "https://cdn.pixabay.com/photo/2022/07/20/10/17/horse-7333877_1280.png",
  ceremony:
    "https://cdn.pixabay.com/photo/2021/04/08/09/23/traditional-wedding-ceremony-6161131_1280.png",
  diya:
    "https://cdn.pixabay.com/photo/2022/07/20/10/17/diya-7333876_1280.png",
  // Black ink ornaments, recoloured to suit the plate.
  peacock:
    "https://cdn.pixabay.com/photo/2020/12/13/22/06/peacock-feather-5829502_1280.png",
  henna:
    "https://cdn.pixabay.com/photo/2013/09/12/21/37/henna-181795_1280.png",
  ganeshaLine:
    "https://cdn.pixabay.com/photo/2018/04/20/12/45/divinity-3335905_1280.png",
  ganeshaMark:
    "https://cdn.pixabay.com/photo/2013/07/13/13/25/ganesha-161002_1280.png",
};

/** The album, in order. Heights are masonry hints, not real pixel heights. */
const GALLERY = [
  { art: "couple", file: "01.jpg", width: 1200, height: 1600, mode: "line", tone: "cream", ink: INK },
  { art: "palki", file: "02.jpg", width: 1200, height: 900, mode: "line", tone: "cream", ink: INK },
  { art: "feather", file: "03.jpg", width: 1200, height: 1600, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  { art: "mandala", file: "04.jpg", width: 1000, height: 1000, mode: "print" },
  { art: "wreath", file: "05.jpg", width: 1200, height: 900, mode: "fit" },
  { art: "ceremony", file: "06.jpg", width: 1000, height: 1000, mode: "line", tone: "cream", ink: INK },
  { art: "horse", file: "07.jpg", width: 1200, height: 900, mode: "line", tone: "cream", ink: INK },
  { art: "swirl", file: "08.jpg", width: 1200, height: 900, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  { art: "diya", file: "09.jpg", width: 1200, height: 900, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  { art: "ganeshaLine", file: "10.jpg", width: 1200, height: 1600, mode: "line", tone: "cream", ink: INK },
  { art: "peacock", file: "11.jpg", width: 1200, height: 900, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  { art: "vine", file: "12.jpg", width: 1200, height: 900, mode: "line", tone: "cream", ink: INK },
  { art: "henna", file: "13.jpg", width: 1200, height: 900, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  { art: "ganeshaMark", file: "14.jpg", width: 1200, height: 1600, mode: "line", tone: "cream", ink: INK },
];

async function prepareGallery() {
  console.log("Album");
  await mkdir(path.join(PUBLIC, "photos"), { recursive: true });
  for (const item of GALLERY) {
    await page({ url: ART[item.art], ink: GOLD, ...item, file: `photos/${item.file}` });
  }
}

/**
 * Short loops for the album: a slow push into a plate, so the video tiles show
 * motion without dropping stock footage into an illustrated set.
 */
async function prepareClips() {
  console.log("Clips");
  await mkdir(path.join(PUBLIC, "videos"), { recursive: true });
  const clips = [
    { src: "photos/02.jpg", file: "palki.mp4", height: 900 },
    { src: "photos/09.jpg", file: "diya.mp4", height: 700 },
    { src: "photos/13.jpg", file: "henna.mp4", height: 1100 },
  ];
  for (const clip of clips) {
    const target = path.join(PUBLIC, "videos", clip.file);
    run(FFMPEG, [
      "-y", "-v", "error",
      "-loop", "1", "-t", "5",
      "-i", path.join(PUBLIC, clip.src),
      "-vf",
      `scale=1600:-2,zoompan=z='min(zoom+0.00055,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=720x${clip.height}:fps=24`,
      "-t", "5",
      "-c:v", "libx264", "-preset", "medium", "-crf", "27",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      target,
    ]);
    run(FFMPEG, [
      "-y", "-v", "error",
      "-ss", "0.2", "-i", target,
      "-frames:v", "1", "-q:v", "4",
      target.replace(/\.mp4$/, ".jpg"),
    ]);
    console.log("  ✓", clip.file, "+ poster");
  }
}

async function prepareWallpapers() {
  console.log("Wallpapers");
  // Lock screen: a quiet palanquin etching, dimmed under the clock.
  await wallpaper({ url: ART.palki, file: "wallpaper-lock.jpg", brightness: 0.8, scale: 0.64, y: 0.36 });
  // Home screen: a large, soft mandala so icons and labels stay legible.
  await wallpaper({ url: ART.henna, file: "wallpaper-home.jpg", scale: 1.28, y: 0.34, blur: 7, brightness: 0.4 });
}

async function prepareWidgets() {
  console.log("Widgets");
  const inset = 34;
  // Safari widget: the palanquin plate, cropped square.
  await page({ url: ART.palki, file: "reading-list.jpg", width: 1000, height: 1000, mode: "line", tone: "maroon", inset });
  // Messages attachment: a lit diya plate.
  await page({ url: ART.diya, file: "message.jpg", width: 900, height: 620, mode: "line", tone: "maroon", inset });
  // Map widget pin: the couple plate, scaled down to a circular crop.
  const mark = await sharp(await recolour(await download(ART.couple), INK))
    .resize({ width: 400, height: 400, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const markMeta = await sharp(mark).metadata();
  await sharp(Buffer.from(plateSvg(512, 512, "cream")))
    .composite([
      {
        input: mark,
        left: Math.round((512 - markMeta.width) / 2),
        top: Math.round((512 - markMeta.height) / 2),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(PUBLIC, "profile.jpg"));
  console.log("  ✓ profile.jpg");
}

async function prepareGanesha() {
  console.log("Ganesha");
  // A drawn mark, not a photograph: gold line art on deep maroon, so it holds
  // up as a circular enamel badge on the lock screen and in the invitation.
  const size = 900;
  const art = await sharp(await recolour(await download(ART.ganeshaMark), "#EBCB8B"))
    .resize({ width: 660, height: 660, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const meta = await sharp(art).metadata();
  await sharp(Buffer.from(plateSvg(size, size, "maroon")))
    .composite([
      { input: art, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
             <circle cx="450" cy="450" r="352" fill="none" stroke="#E8C173" stroke-width="4" opacity="0.75"/>
             <circle cx="450" cy="450" r="374" fill="none" stroke="#E8C173" stroke-width="1.6" opacity="0.4"/>
           </svg>`
        ),
      },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
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
    <text x="256" y="168" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="74" font-weight="700" fill="#E0393E" letter-spacing="2">JAN</text>
    <text x="256" y="388" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="228" font-weight="300" fill="#1C1C1E">15</text>
  </svg>`;
  await sharp(Buffer.from(calendar)).png().toFile(path.join(PUBLIC, "icons", "calendar.png"));
  console.log("  ✓ icons/calendar.png");
}

async function prepareOg() {
  const line = await sharp(await recolour(await download(ART.couple), INK))
    .resize({ width: 420, height: 500, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const lineMeta = await sharp(line).metadata();
  const art = await sharp(Buffer.from(plateSvg(560, 630, "cream")))
    .composite([
      {
        input: line,
        left: Math.round((560 - lineMeta.width) / 2),
        top: Math.round((630 - lineMeta.height) / 2),
      },
    ])
    .toBuffer();
  const paper = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="#FDF9F0"/><stop offset="1" stop-color="#F0DFC0"/>
      </linearGradient>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FBF3E5" stop-opacity="1"/>
        <stop offset="1" stop-color="#FBF3E5" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#paper)"/>
  </svg>`;
  const texture = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect x="700" y="0" width="180" height="630" fill="url(#fade)"/>
    <rect x="26" y="26" width="1148" height="578" fill="none" stroke="#C99A4A" stroke-width="2" opacity=".55"/>
    <rect x="33" y="33" width="1134" height="564" fill="none" stroke="#C99A4A" stroke-width="0.8" opacity=".35"/>
    <text x="76" y="170" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" letter-spacing="5" fill="#A0785C">WITH THE BLESSINGS OF LORD GANESHA</text>
    <text x="76" y="286" font-family="Georgia, 'Times New Roman', serif" font-size="80" fill="#4A1223">Ekansh &amp; Neha</text>
    <text x="76" y="348" font-family="Georgia, 'Times New Roman', serif" font-size="33" letter-spacing="2" fill="#A0785C">Wedding</text>
    <text x="76" y="436" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="25" fill="#3B2219">Friday, 15 January 2027 · 5:00 PM</text>
    <text x="76" y="474" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="20" fill="#7B6455">The Grandeur by Lavanya, Banquet Hall · Delhi</text>
    <text x="76" y="556" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="15" letter-spacing="4" fill="#C99A4A">UNLOCK THE INVITATION</text>
    <defs><linearGradient id="fade2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBF3E5" stop-opacity="1"/><stop offset="1" stop-color="#FBF3E5" stop-opacity="0"/></linearGradient></defs>
  </svg>`;
  await sharp(Buffer.from(paper))
    .composite([
      { input: art, left: 700, top: 0 },
      { input: Buffer.from(texture.replace('fill="url(#fade)"', 'fill="url(#fade2)"')), left: 0, top: 0 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(PUBLIC, "og-image.jpg"));
  console.log("  ✓ og-image.jpg");
}

async function main() {
  await mkdir(path.join(PUBLIC, "icons"), { recursive: true });
  await prepareGallery();
  await prepareClips();
  await prepareWallpapers();
  await prepareWidgets();
  await prepareGanesha();
  await prepareIcons();
  await prepareOg();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
