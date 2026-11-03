/**
 * Stickers for the Messages thread.
 *
 * They are the same gold line art the invitation is built from, cut out on
 * transparency so the thread can drop one in the way iMessage drops a sticker:
 * no bubble, no caption, just a shape that says the thing. Sources come from the
 * Pixabay line art cached in `.tools/art` (see CREDITS.md).
 *
 *   node scripts/prepare-stickers.mjs
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ART = path.join(ROOT, ".tools", "art");
const PUBLIC = path.join(ROOT, "public");

const GOLD = "#E8C173";

const STICKERS = [
  { src: "diya-7333876_1280.png", file: "diya.png" },
  { src: "peacock-feather-5829502_1280.png", file: "peacock.png" },
  { src: "mandala-7461931_1280.png", file: "mandala.png" },
];

/**
 * Line art in, gold cut-out out: alpha comes from the ink, so whatever paper the
 * source sat on disappears and only the drawing is left to place over a chat.
 */
async function sticker({ src, file }) {
  const source = path.join(ART, src);
  if (!existsSync(source)) throw new Error(`Missing source: ${source}`);

  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b] = [1, 3, 5].map((i) => parseInt(GOLD.slice(i, i + 2), 16));
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < data.length; i += 4) {
    // Distance from white along the darkest channel keeps coloured inks solid.
    const ink = 255 - Math.min(data[i], data[i + 1], data[i + 2]);
    const base = data[i + 3];
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.min(255, Math.round(((base * ink) / 255) * 1.35));
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize({ width: 640, height: 640, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, "stickers", file));

  console.log("  ✓", file);
}

async function main() {
  await mkdir(path.join(PUBLIC, "stickers"), { recursive: true });
  console.log("Stickers");
  for (const item of STICKERS) await sticker(item);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
