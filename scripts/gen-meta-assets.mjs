// Generate production metadata assets into public/:
//   - og-image.jpg        1200x630, cover-cropped from the home wallpaper (focus on the couple)
//   - apple-touch-icon.png 180x180, logo on a white field (iOS masks corners)
//   - icon-192.png / icon-512.png  maskable PWA icons (logo within the 80% safe zone)
//   - favicon-32.png / favicon-16.png  transparent PNG fallbacks for the browser tab
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(import.meta.dirname, "..", "public");
const BG = { r: 255, g: 255, b: 255, alpha: 1 }; // white field behind the heart

const svg = await readFile(join(PUBLIC, "favicon.svg"));

// Render the logo crisply at a given pixel height (preserves the 48:46 aspect).
async function logo(heightPx) {
  return sharp(svg, { density: 384 })
    .resize({ height: heightPx })
    .png()
    .toBuffer();
}

// Logo centered on a solid square. `fraction` = logo height / canvas (safe zone for maskable).
async function icon(size, fraction, out) {
  const buf = await logo(Math.round(size * fraction));
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: buf, gravity: "center" }])
    .png()
    .toFile(join(PUBLIC, out));
  console.log("✓", out);
}

// Transparent square tab favicon — logo centered, no background field.
async function tabIcon(size, out) {
  const buf = await logo(Math.round(size * 0.92));
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: buf, gravity: "center" }])
    .png()
    .toFile(join(PUBLIC, out));
  console.log("✓", out);
}

await icon(512, 0.6, "icon-512.png");      // maskable: logo within ~80% safe zone
await icon(192, 0.6, "icon-192.png");
await icon(180, 0.66, "apple-touch-icon.png"); // iOS home-screen icon
await tabIcon(32, "favicon-32.png");
await tabIcon(16, "favicon-16.png");

// The wallpaper is a tall portrait; sharp's "attention" crop keeps the most
// salient region (the couple) inside the 1200x630 share preview.
await sharp(join(PUBLIC, "wallpaper-home.jpeg"))
  .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(PUBLIC, "og-image.jpg"));
console.log("✓ og-image.jpg");
