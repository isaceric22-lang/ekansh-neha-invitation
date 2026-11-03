/**
 * Extra album pages, weighted towards the couple and the ceremony the way the
 * first page is: the pair, the garland exchange, the baraat, the palanquin.
 *
 * Same recipe as prepare-assets.mjs — cream paper, gold double rule, line art
 * recoloured to a single ink — so the new pages sit inside the existing set.
 * Sources are the cached Pixabay files in `.tools/art` (see CREDITS.md).
 *
 *   node scripts/prepare-couple-plates.mjs
 */
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ART = path.join(ROOT, ".tools", "art");
const PUBLIC = path.join(ROOT, "public");

const CREAM = "#FBF3E5";
const CREAM_DEEP = "#F3E4CB";
const MAROON = "#4A1223";
const PLUM = "#2B0A14";
const GOLD = "#C99A4A";
const GOLD_LIGHT = "#E8C173";
const INK = "#3B1022";

async function recolour(source, ink) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(ink.slice(i, i + 2), 16));
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    // Spend the first ~18 levels on nothing: the source JPEG's paper is never
    // pure white, and amplifying it printed a faint grey box on every plate.
    const rawInk = 255 - Math.min(data[i], data[i + 1], data[i + 2]);
    const inkAlpha = Math.max(0, rawInk - 18) / (255 - 18);
    const base = data[i + 3];
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.min(255, Math.round(base * inkAlpha * 1.6));
  }
  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

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

async function page({ src, file, width, height, mode, tone = "cream", ink = GOLD }) {
  const source = path.join(ART, src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);
  const inset = Math.round(Math.min(width, height) * 0.035);
  const frame = Buffer.from(frameSvg(width, height, inset, tone === "maroon"));

  let art;
  let left;
  let top;

  if (mode === "print") {
    const plateW = width - inset * 2;
    const plateH = height - inset * 2;
    art = await sharp(source)
      .rotate()
      .resize({ width: plateW, height: plateH, fit: "cover", position: "attention" })
      .toBuffer();
    left = inset;
    top = inset;
  } else {
    const box =
      Math.min(width, height) - inset * 2 - Math.round(Math.min(width, height) * 0.14);
    art = await sharp(await recolour(source, ink))
      .resize({
        width: box,
        height: box,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const meta = await sharp(art).metadata();
    left = Math.round((width - meta.width) / 2);
    top = Math.round((height - meta.height) / 2);
  }

  const base = await sharp(Buffer.from(plateSvg(width, height, tone))).png().toBuffer();
  await sharp(base)
    .composite([{ input: art, left, top }, { input: frame }])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toFile(path.join(PUBLIC, "photos", file));
  console.log("  ✓", file);
}

const COUPLE = "wedding-dress-6161116_1280.png";
const CEREMONY = "traditional-wedding-ceremony-6161131_1280.png";
const PALANQUIN = "wedding-7333870_1280.png";
const HORSE = "horse-7333877_1280.png";

const PLATES = [
  // The pair, wide and airborne — the same drawing as page one, recomposed.
  { src: COUPLE, file: "15.jpg", width: 1200, height: 820, mode: "line", tone: "cream", ink: INK },
  // The garland exchange, in gold on maroon.
  { src: CEREMONY, file: "16.jpg", width: 1200, height: 1500, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  // The same ceremony as a full-bleed painting.
  { src: CEREMONY, file: "17.jpg", width: 1100, height: 1100, mode: "print" },
  // The pair again, this time as a tall gold plate.
  { src: COUPLE, file: "18.jpg", width: 1000, height: 1350, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  // The baraat horse, gold on maroon.
  { src: HORSE, file: "19.jpg", width: 1200, height: 900, mode: "line", tone: "maroon", ink: GOLD_LIGHT },
  // The palanquin arriving, tall, on cream.
  { src: PALANQUIN, file: "20.jpg", width: 1000, height: 1350, mode: "line", tone: "cream", ink: INK },
];

for (const item of PLATES) await page(item);
console.log("Done.");
