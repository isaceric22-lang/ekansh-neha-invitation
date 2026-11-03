// Main promo video: boot → lock → home → 5 featured apps → thank-you.
// Usage: node scripts/promo-video/main.mjs [docs/demo/demo.mp4] [--preview] [--url=…]
import { createRecorder, parseArgs } from './lib.mjs';
import { SCENES, caption, outro } from './scenes.mjs';

const TOUR = ['lock', 'home', 'calendar', 'notes', 'photos', 'messages', 'wallet'];

const args = parseArgs();
const out = args.positional[0] ?? 'docs/demo/demo.mp4';
const h = await createRecorder({ out, url: args.url, preview: args.preview, start: 'boot' });

h.mark('intro');
await h.stage('fadeIn');
await h.stage('hero', {
  eyebrow: 'Open source',
  title: 'iPhone Wedding Invitation',
  sub: 'We turned our wedding invitation into an iPhone.',
});
await h.wait(2900);
await h.stage('heroOut');
await h.wait(250);
await h.stage('rise');
await h.stage('dots', TOUR.length);
await h.wait(900);
await h.releaseBoot(); // boot screen fades into the lock screen

for (const [i, key] of TOUR.entries()) {
  h.mark(key);
  await h.stage('caption', caption(key, i + 1));
  await SCENES[key].run(h);
}
await outro(h);
await h.finish();
