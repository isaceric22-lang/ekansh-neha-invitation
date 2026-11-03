// Virtual-time runtime, injected before any page script runs.
// The page clock only moves when the recorder calls __vt.step(ms), so every
// captured frame is exactly 1/60s apart regardless of how slow rendering is.
(() => {
  // Only the app frame is virtualized; embedded iframes (Google Form, YouTube)
  // keep real time so they can load while the recorder waits.
  if (window.__vt || window.top !== window) return;
  const nativePerfNow = performance.now.bind(performance);
  const RealDate = Date;
  const T0 = nativePerfNow();
  // Lock-screen clock shows the wedding day at the iconic 09:41.
  const DATE_BASE = new RealDate(2026, 5, 14, 9, 41, 0).getTime();

  let vt = 0; // ms since injection
  const now = () => T0 + vt;

  // ── clock ────────────────────────────────────────────────────────────
  performance.now = () => now();
  class VDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(DATE_BASE + vt);
      else super(...args);
    }
    static now() {
      return DATE_BASE + vt;
    }
  }
  VDate.parse = RealDate.parse;
  VDate.UTC = RealDate.UTC;
  window.Date = VDate;

  // ── timers ───────────────────────────────────────────────────────────
  let timerSeq = 1;
  const timers = new Map(); // id -> {due, fn, args, interval}
  window.setTimeout = (fn, delay = 0, ...args) => {
    const id = timerSeq++;
    timers.set(id, { due: vt + Math.max(0, +delay || 0), fn, args, interval: null });
    return id;
  };
  window.setInterval = (fn, delay = 0, ...args) => {
    const id = timerSeq++;
    const iv = Math.max(1, +delay || 0);
    timers.set(id, { due: vt + iv, fn, args, interval: iv });
    return id;
  };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);

  // ── rAF ──────────────────────────────────────────────────────────────
  let rafSeq = 1;
  let rafQueue = new Map();
  window.requestAnimationFrame = (cb) => {
    const id = rafSeq++;
    rafQueue.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => rafQueue.delete(id);

  // ── Web Animations (CSS transitions/animations + WAAPI) ─────────────
  const tracked = new WeakMap(); // Animation -> {start, done}
  const origAnimate = Element.prototype.animate;
  Element.prototype.animate = function (...a) {
    const anim = origAnimate.apply(this, a);
    tracked.set(anim, { start: vt, done: false });
    anim.pause();
    return anim;
  };

  function syncAnimations() {
    for (const anim of document.getAnimations()) {
      let s = tracked.get(anim);
      if (!s) {
        // getAnimations() flushes styles, so untracked ones were created just now.
        s = { start: vt, done: false };
        tracked.set(anim, s);
      }
      if (s.done) continue;
      const timing = anim.effect?.getComputedTiming?.();
      const rate = anim.playbackRate || 1;
      const t = Math.max(0, (vt - s.start) * rate);
      const end = timing ? timing.endTime : Infinity;
      if (Number.isFinite(end) && t >= end) {
        s.done = true;
        try { anim.finish(); } catch { /* ignore */ }
        continue;
      }
      if (anim.playState !== 'paused') anim.pause();
      anim.currentTime = t;
    }
  }

  // ── media: fake playback on the virtual clock (no real audio) ────────
  const mediaState = new WeakMap(); // el -> {playingSince|null, base}
  const ms = (el) => {
    let s = mediaState.get(el);
    if (!s) { s = { since: null, base: 0 }; mediaState.set(el, s); }
    return s;
  };
  const ctDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  const playingMedia = new Set();
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    get() {
      const s = ms(this);
      return s.since == null ? s.base : s.base + (vt - s.since) / 1000;
    },
    set(v) {
      const s = ms(this);
      s.base = +v || 0;
      if (s.since != null) s.since = vt;
      try { ctDesc.set.call(this, v); } catch { /* ignore */ }
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get() { return ms(this).since == null; },
  });
  HTMLMediaElement.prototype.play = function () {
    const s = ms(this);
    if (s.since == null) {
      s.since = vt;
      playingMedia.add(this);
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
    }
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function () {
    const s = ms(this);
    if (s.since != null) {
      s.base += (vt - s.since) / 1000;
      s.since = null;
      playingMedia.delete(this);
      this.dispatchEvent(new Event('pause'));
    }
  };
  // A new src restarts the virtual playhead (playing state carries over).
  document.addEventListener('loadstart', (e) => {
    if (!(e.target instanceof HTMLMediaElement)) return;
    const s = ms(e.target);
    s.base = 0;
    if (s.since != null) s.since = vt;
  }, true);
  let lastMediaTick = 0;

  // ── stepping ─────────────────────────────────────────────────────────
  function runTimersUpTo(target) {
    for (let guard = 0; guard < 10000; guard++) {
      let nextId = null, next = null;
      for (const [id, t] of timers) {
        if (t.due <= target && (next === null || t.due < next.due)) { next = t; nextId = id; }
      }
      if (!next) break;
      vt = Math.max(vt, next.due);
      if (next.interval != null) next.due += next.interval;
      else timers.delete(nextId);
      try {
        typeof next.fn === 'function' ? next.fn(...next.args) : (0, eval)(next.fn);
      } catch (e) { console.error(e); }
    }
    vt = target;
  }

  function step(dt) {
    runTimersUpTo(vt + dt);
    if (vt - lastMediaTick >= 250) {
      lastMediaTick = vt;
      for (const el of playingMedia) el.dispatchEvent(new Event('timeupdate'));
    }
    const q = rafQueue;
    rafQueue = new Map();
    const ts = now();
    for (const cb of q.values()) {
      try { cb(ts); } catch (e) { console.error(e); }
    }
    syncAnimations();
  }

  window.__vt = {
    step,
    // Re-sync animations after DOM changes made outside a step (e.g. clicks).
    sync: () => syncAnimations(),
    get time() { return vt; },
  };
})();
