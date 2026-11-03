// App showcase videos: one short clip per app + a tour of the rest of the phone.
// Usage: node scripts/promo-video/apps.mjs [--only=music,phone,tour] [--preview] [--url=…]
//   clips → docs/demo/apps/<app>.mp4 + <app>.gif (phone only, for README)
//   tour  → docs/demo/apps.mp4
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRecorder, parseArgs, REPO } from './lib.mjs';
import { SCENES, caption, outro } from './scenes.mjs';

// Apps the main video doesn't cover. Any SCENES key works with --only.
const REST = ['music', 'phone', 'youtube', 'settings', 'calculator'];

const args = parseArgs();
const jobs = args.only.length ? args.only : [...REST, 'tour'];
const DEMO = path.join(REPO, 'docs/demo');

// Phone-only GIF: crop the device out of the 1080p frame.
function toGif(src, dst) {
  const vf = 'crop=480:1004:1180:38,fps=15,scale=360:-1:flags=lanczos,split[a][b];' +
    '[a]palettegen=max_colors=192:stats_mode=diff[p];' +
    '[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle';
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', vf, '-loop', '0', dst], { stdio: 'inherit' });
}

async function clip(key) {
  const scene = SCENES[key];
  const out = path.join(DEMO, 'apps', `${key}.mp4`);
  const h = await createRecorder({ out, url: args.url, preview: args.preview, start: scene.start, crf: 18 });
  await h.stage('fadeIn');
  await h.wait(250);
  await h.stage('caption', { n: 0, label: scene.label, title: scene.title, sub: scene.sub });
  await h.wait(600);
  await scene.run(h);
  await h.wait(300);
  await h.stage('fadeOut', 700);
  await h.wait(800);
  await h.finish();
  if (!args.preview) toGif(out, out.replace(/\.mp4$/, '.gif'));
}

async function tour() {
  const out = path.join(DEMO, 'apps.mp4');
  const h = await createRecorder({ out, url: args.url, preview: args.preview, start: 'lock', crf: 18 });
  await h.stage('hide');
  await h.stage('fadeIn');
  await h.stage('hero', {
    eyebrow: 'iPhone Wedding Invitation',
    title: 'And there’s more…',
    sub: 'Music, Phone, YouTube, Settings, Calculator. Go ahead, tap any of them.',
  });
  await h.wait(2700);
  await h.stage('heroOut');
  await h.wait(250);
  await h.stage('rise');
  await h.stage('dots', REST.length);
  await h.wait(1100);
  for (const [i, key] of REST.entries()) {
    h.mark(key);
    await h.stage('caption', caption(key, i + 1));
    await SCENES[key].run(h);
  }
  await outro(h);
  await h.finish();
}

for (const job of jobs) {
  console.log(`▶ ${job}`);
  if (job === 'tour') await tour();
  else if (SCENES[job]) await clip(job);
  else throw new Error(`unknown job: ${job} (scenes: ${Object.keys(SCENES).join(', ')}, tour)`);
}
