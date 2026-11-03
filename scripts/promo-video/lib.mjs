// Shared recorder for the promo videos: boots the app on a virtual clock,
// wraps it in the stage (stage.js) and pipes every frame into ffmpeg.
//
// Needs puppeteer-core (not in package.json), Google Chrome and ffmpeg:
//   pnpm add -D puppeteer-core
//   pnpm exec vite --config scripts/promo-video/vite.config.mjs --port 5199
//   node scripts/promo-video/main.mjs            # docs/demo/demo.mp4
//   node scripts/promo-video/apps.mjs            # docs/demo/apps/*, apps.mp4
//
// vt-inject.js freezes the page clock (rAF, timers, Date, CSS/WAAPI animations,
// <audio>) and advances it exactly 1/FPS per captured frame, so the output is
// perfectly smooth no matter how slow rendering is.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const here = import.meta.dirname;
export const REPO = path.resolve(here, '../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HELD_ASSET = '/map-tile.svg'; // gates the boot screen

export function parseArgs(argv = process.argv.slice(2)) {
  const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=');
  return {
    positional: argv.filter((a) => !a.startsWith('--')),
    url: opt('url', 'http://localhost:5199/'),
    only: opt('only', '').split(',').filter(Boolean),
    preview: argv.includes('--preview'),
  };
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/**
 * start: 'boot' → phone hidden, boot screen held until h.releaseBoot();
 *        'lock' → phone in place on the lock screen;
 *        'home' → phone in place, already unlocked.
 */
export async function createRecorder({ out, url, preview = false, start = 'home', crf = 14 }) {
  const FPS = preview ? 30 : 60;
  const DT = 1000 / FPS;
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text().slice(0, 300)));

  await page.emulateTimezone('Asia/Ho_Chi_Minh');
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(fs.readFileSync(path.join(here, 'vt-inject.js'), 'utf8'));

  // Hold one critical boot asset so the Apple boot screen stays up until the
  // phone has risen into frame.
  const held = [];
  let bootReleased = start !== 'boot';
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (!bootReleased && new URL(req.url()).pathname === HELD_ASSET) held.push(req);
    else req.continue();
  });

  await page.goto(url, { waitUntil: 'networkidle2' });
  // Vite may full-reload right after the first visit (dep optimization); give
  // it a moment, then wait for whichever document ends up mounted.
  await new Promise((r) => setTimeout(r, 1000));
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0);
  await page.evaluate(() => document.fonts.ready);

  // Warm the image cache so nothing pops in mid-shot.
  const albumFiles = [...fs.readFileSync(path.join(REPO, 'src/PhotosPage.tsx'), 'utf8').matchAll(/file: "([^"]+)"/g)].map((m) => m[1]);
  const warm = [
    '/wallpaper-lock.jpeg', '/wallpaper-home.jpeg', '/message.jpeg', '/gift-qr.png', '/profile.jpeg',
    '/reading-list.jpeg', '/map-tile.svg', ...albumFiles.map((f) => `/photos/${f}`),
  ].filter((s) => bootReleased || !s.endsWith(HELD_ASSET));
  await page.evaluate(async (all) => {
    await Promise.all(all.map((src) => new Promise((res) => {
      const i = new Image();
      i.onload = i.onerror = () => i.decode().catch(() => {}).then(res);
      i.src = src;
    })));
  }, warm);

  await page.evaluate(fs.readFileSync(path.join(here, 'stage.js'), 'utf8'));
  await new Promise((r) => setTimeout(r, 300));

  const cdp = await page.createCDPSession();
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'slow', '-crf', preview ? '23' : String(crf),
    '-tune', 'film', '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p',
    '-color_range', 'tv', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-colorspace', 'bt709', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  let frames = 0;
  const markers = [];
  const t0 = Date.now();

  const h = {
    page, FPS,
    stage: (fn, ...a) => page.evaluate((fn, a) => window.__stage[fn](...a), fn, a),

    /** Advance one frame; capture unless `capture` is false (setup work). */
    async frame(capture = true) {
      await page.evaluate((dt) => window.__vt.step(dt), DT);
      if (!capture) return;
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95 });
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) {
        await new Promise((r) => ff.stdin.once('drain', r));
      }
      frames++;
      if (frames % 180 === 0) process.stdout.write(`  ${(frames / FPS).toFixed(1)}s\n`);
    },
    async wait(ms) {
      const n = Math.round(ms / DT);
      for (let i = 0; i < n; i++) await h.frame();
    },
    /** Advance the clock without recording (off-camera setup). */
    async idle(ms) {
      const n = Math.round(ms / DT);
      for (let i = 0; i < n; i++) await h.frame(false);
    },
    /** Advance off-camera until `pred` (evaluated in the page) holds. */
    async idleUntil(pred, maxMs = 8000) {
      for (let t = 0; t < maxMs; t += DT) {
        if (await page.evaluate(pred)) return;
        await h.frame(false);
      }
      throw new Error(`idleUntil timed out: ${pred}`);
    },
    /** Real-time pause with the page clock frozen (network, iframes, media metadata). */
    settle: (ms) => new Promise((r) => setTimeout(r, ms)),
    mark(name) {
      markers.push({ name, t: +(frames / FPS).toFixed(3) });
    },

    async releaseBoot() {
      bootReleased = true;
      held.splice(0).forEach((r) => r.continue());
      await h.settle(600);
    },

    // Resolve a target to page coords. Only the topmost, on-screen match counts.
    async find(q) {
      const p = await page.evaluate((q) => {
        const root = document.getElementById('root').getBoundingClientRect();
        if (q.at) return { x: root.left + q.at[0], y: root.top + q.at[1] };
        let els;
        if (q.label) {
          els = [...document.querySelectorAll('[aria-label], img[alt]')].filter(
            (e) => (e.getAttribute('aria-label') ?? e.getAttribute('alt')) === q.label,
          );
        } else if (q.selector) {
          els = [...document.querySelectorAll(q.selector)];
        } else {
          els = [...document.querySelectorAll('button, a, [role=button]')].filter((e) =>
            (e.innerText ?? '').trim().startsWith(q.text),
          );
        }
        // Later DOM = painted on top, so prefer the last match unless asked.
        for (const e of q.first ? els : els.reverse()) {
          const b = e.getBoundingClientRect();
          if (b.width < 4 || b.bottom < root.top || b.top > root.bottom) continue;
          const x = b.left + b.width / 2, y = b.top + b.height / 2;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === e || e.contains(hit) || hit.contains(e))) return { x, y };
        }
        return null;
      }, q);
      if (!p) throw new Error(`target not found: ${JSON.stringify(q)}`);
      return p;
    },

    async tap(q, { hold = 110 } = {}) {
      const { x, y } = await h.find(q);
      await h.stage('touchDown', x, y);
      await h.wait(70);
      await page.mouse.move(x, y);
      await page.mouse.down();
      await h.wait(hold);
      await page.mouse.up();
      await h.stage('touchUp');
      await page.mouse.move(1, 1);
    },

    /** Tap without the touch indicator or recording (off-camera setup). */
    async silentTap(q) {
      const { x, y } = await h.find(q);
      await page.mouse.click(x, y);
      await page.mouse.move(1, 1);
    },

    // Finger drag from `a` to `b` (phone coords) over `ms`.
    async drag(a, b, ms) {
      const A = await h.find({ at: a });
      const B = await h.find({ at: b });
      await h.stage('touchDown', A.x, A.y);
      await h.wait(60);
      await page.mouse.move(A.x, A.y);
      await page.mouse.down();
      const n = Math.round(ms / DT);
      for (let i = 1; i <= n; i++) {
        const t = easeInOut(i / n);
        const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
        await page.mouse.move(x, y);
        await h.stage('touchMove', x, y);
        await h.frame();
      }
      await page.mouse.up();
      await h.stage('touchUp');
      await page.mouse.move(1, 1);
    },

    // Flick-scroll the main scroller: short finger swipe, then iOS-like deceleration.
    async scroll(dy, ms, at = [260, 700]) {
      await page.evaluate(() => {
        const root = document.getElementById('root');
        const cands = [...root.querySelectorAll('*')].filter((e) => {
          const s = getComputedStyle(e);
          const b = e.getBoundingClientRect();
          return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 40 && b.height > 200;
        });
        cands.sort((a, b) => b.scrollHeight - a.scrollHeight);
        window.__scroller = cands[0];
        window.__scrollStart = cands[0]?.scrollTop ?? 0;
      });
      const P = await h.find({ at });
      const swipe = Math.sign(dy) * 260;
      await h.stage('touchDown', P.x, P.y);
      await h.wait(50);
      const n = Math.round(ms / DT);
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        if (t <= 0.22) await h.stage('touchMove', P.x, P.y - swipe * easeInOut(t / 0.22));
        else if (t - 1 / n <= 0.22) await h.stage('touchUp');
        await page.evaluate((v) => {
          if (window.__scroller) window.__scroller.scrollTop = window.__scrollStart + v;
        }, dy * easeOutCubic(t));
        await h.frame();
      }
    },

    async finish() {
      ff.stdin.end();
      await new Promise((r) => ff.on('close', r));
      await browser.close();
      console.log(`done: ${frames} frames (${(frames / FPS).toFixed(1)}s) in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${out}`);
      return markers;
    },
  };

  // Off-camera setup for clips that open straight on the lock or home screen.
  if (start !== 'boot') {
    await h.stage('place');
    const booted = () => !document.querySelector('.z-\\[30000\\]'); // BootScreen gone
    await h.idleUntil(booted);
    await h.idle(300);
    if (start === 'home') {
      await h.silentTap({ at: [220, 200] }); // tapping the lock screen unlocks
      await h.idle(1300);
    }
  }
  return h;
}
