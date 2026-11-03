/**
 * Quote cards and cute cards for the album.
 *
 * The drawn plates are the atmosphere; they are not the whole album. These are
 * the pages that speak: five notes in the invitation's own cream-and-gold, set in
 * a serif the way a printed card would be, and three soft cream cards built from
 * the same Twemoji set the Messages thread uses — a panda, a teddy and a baby,
 * with hearts around them, because a wedding album is allowed to be cute.
 *
 *   node scripts/prepare-note-plates.mjs
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "photos");
const EMOJI = path.join(ROOT, "public", "emoji");
const STICKERS = path.join(ROOT, "public", "stickers");

const W = 1000;
const H = 1300;
const INK = "#4A1223";
const GOLD = "#C9A227";

const QUOTES = [
  { file: "q1.jpg", lines: ["Two hearts,", "one promise."] },
  { file: "q2.jpg", lines: ["Saath chalta rahe", "saari umar."] },
  { file: "q3.jpg", lines: ["You are my", "favourite hello."] },
  { file: "q4.jpg", lines: ["Forever begins", "on the fifteenth."] },
  { file: "q5.jpg", lines: ["My person,", "my forever."] },
];

const CUTE = [
  { file: "c1.jpg", big: path.join(STICKERS, "panda.svg"), small: path.join(EMOJI, "2764.svg") },
  { file: "c2.jpg", big: path.join(STICKERS, "teddy.svg"), small: path.join(EMOJI, "2728.svg") },
  { file: "c3.jpg", big: path.join(STICKERS, "baby.svg"), small: path.join(EMOJI, "1f970.svg") },
  { file: "c4.jpg", big: path.join(EMOJI, "1f48d.svg"), small: path.join(EMOJI, "2764.svg") },
];

function plate(from = "#FDF7EC", to = "#F5E7D1") {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="44" y="44" width="${W - 88}" height="${H - 88}" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity="0.5"/>
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.28"/>
</svg>`);
}

/** A thin rule with a diamond in the middle, the way a card separates its blocks. */
function ornament(y) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="40">
  <line x1="${W / 2 - 120}" y1="20" x2="${W / 2 - 18}" y2="20" stroke="${GOLD}" stroke-width="1.2" opacity="0.7"/>
  <line x1="${W / 2 + 18}" y1="20" x2="${W / 2 + 120}" y2="20" stroke="${GOLD}" stroke-width="1.2" opacity="0.7"/>
  <rect x="${W / 2 - 7}" y="13" width="14" height="14" transform="rotate(45 ${W / 2} 20)" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity="0.85"/>
</svg>`);
}

function quoteText(lines) {
  const size = lines.some((line) => line.length > 18) ? 54 : 66;
  const lineHeight = size * 1.42;
  const start = H / 2 - ((lines.length - 1) * lineHeight) / 2;
  const body = lines
    .map((line, index) => {
      const y = start + index * lineHeight;
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" letter-spacing="1.5" fill="${INK}">${escapeXml(line)}</text>`;
    })
    .join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}
  <text x="${W / 2}" y="${H - 170}" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="8" fill="${GOLD}">EKANSH · NEHA</text>
</svg>`);
}

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function raster(file, size) {
  return sharp(file, { density: 600 }).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function quoteCard(def) {
  await sharp(plate()).composite([
    { input: quoteText(def.lines), top: 0, left: 0 },
    { input: ornament(0), top: Math.round(H / 2 - 150), left: 0 },
    { input: ornament(0), top: Math.round(H / 2 + 110), left: 0 },
  ]).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, def.file));
  console.log("  ✓", def.file);
}

async function cuteCard(def) {
  if (!existsSync(def.big)) {
    console.warn("  – skipped", def.file, "(missing", path.basename(def.big) + ")");
    return;
  }
  const big = await raster(def.big, 360);
  const layers = [{ input: big, top: Math.round(H / 2 - 200), left: Math.round(W / 2 - 180) }];
  if (existsSync(def.small)) {
    layers.push({ input: await raster(def.small, 130), top: Math.round(H / 2 - 240), left: Math.round(W / 2 + 120) });
    layers.push({ input: await raster(def.small, 92), top: Math.round(H / 2 + 130), left: Math.round(W / 2 - 230) });
  }
  await sharp(plate("#FFF9F0", "#F7EAD8"))
    .composite(layers)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, def.file));
  console.log("  ✓", def.file);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("Quote cards");
  for (const def of QUOTES) await quoteCard(def);
  console.log("Cute cards");
  for (const def of CUTE) await cuteCard(def);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
