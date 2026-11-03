// Stage overlay for the promo video: background, device bezel, captions,
// touch indicator. All motion is CSS transitions, so the virtual clock in
// vt-inject.js drives it frame-exactly alongside the app itself.
(() => {
  if (window.__stage) return;

  const W = 1920, H = 1080;
  const PHONE_W = 440, PHONE_H = 956;
  const CAP_X = 250, CAP_W = 720;
  const PHONE_X = 1200, PHONE_Y = Math.round((H - PHONE_H) / 2);
  const BEZEL = 13;
  const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const FONT = '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
  const ACCENT = '#FF9EC2';

  const css = `
    html, body { background: #000 !important; overflow: hidden !important; }
    body { display: block !important; }
    #root {
      position: absolute !important;
      left: ${PHONE_X}px !important; top: ${PHONE_Y}px !important;
      box-shadow: none !important; z-index: 3;
      transition: transform 1200ms ${EASE_OUT};
    }
    .stg-rise { transform: translateZ(0) translateY(${H}px) !important; }
    #stg-bg {
      position: fixed; inset: -120px; z-index: 0;
      background: url('/wallpaper-lock.jpeg') center 40% / cover no-repeat;
      filter: blur(70px) saturate(1.15) brightness(0.42);
      transform: scale(1.08);
      transition: opacity 900ms ${EASE}, transform 9000ms linear;
    }
    #stg-vignette {
      position: fixed; inset: 0; z-index: 1; pointer-events: none;
      background:
        radial-gradient(60% 70% at 66% 50%, rgba(255,158,194,0.10) 0%, rgba(0,0,0,0) 60%),
        radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%);
    }
    #stg-bezel {
      position: absolute; z-index: 2;
      left: ${PHONE_X - BEZEL}px; top: ${PHONE_Y - BEZEL}px;
      width: ${PHONE_W + BEZEL * 2}px; height: ${PHONE_H + BEZEL * 2}px;
      border-radius: ${56 + BEZEL}px;
      background: #050505;
      box-shadow:
        0 0 0 1.5px #3b3b3f,
        0 0 0 3px #1a1a1c,
        inset 0 0 0 1px rgba(255,255,255,0.06),
        0 40px 90px rgba(0,0,0,0.55),
        0 10px 30px rgba(0,0,0,0.35);
      transition: transform 1200ms ${EASE_OUT};
    }
    #stg-bezel i {
      position: absolute; width: 4px; border-radius: 2px;
      background: linear-gradient(90deg, #2c2c2e, #4a4a4e);
    }
    #stg-cap {
      position: absolute; z-index: 4; left: ${CAP_X}px; top: 0; bottom: 0;
      width: ${CAP_W}px; font-family: ${FONT}; color: #fff;
      -webkit-font-smoothing: antialiased;
    }
    .stg-block {
      position: absolute; left: 0; right: 0; top: 50%;
      transform: translateY(calc(-50% + 18px)); opacity: 0; filter: blur(10px);
      transition: opacity 520ms ${EASE}, transform 700ms ${EASE_OUT}, filter 520ms ${EASE};
    }
    .stg-block.in { opacity: 1; transform: translateY(-50%); filter: blur(0); }
    .stg-block.out {
      opacity: 0; transform: translateY(calc(-50% - 14px)); filter: blur(8px);
      transition: opacity 280ms ${EASE}, transform 320ms ${EASE}, filter 280ms ${EASE};
    }
    .stg-eyebrow {
      font-size: 19px; font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; color: ${ACCENT}; margin-bottom: 20px;
      display: flex; align-items: center; gap: 14px;
    }
    .stg-eyebrow b { font-weight: 700; font-variant-numeric: tabular-nums; }
    .stg-eyebrow .sep { width: 28px; height: 1.5px; background: ${ACCENT}; opacity: 0.6; }
    .stg-title {
      font-size: 72px; font-weight: 700; line-height: 1.06;
      letter-spacing: -0.025em; text-wrap: balance;
    }
    .stg-sub {
      margin-top: 24px; font-size: 28px; font-weight: 400; line-height: 1.42;
      letter-spacing: -0.005em; color: rgba(255,255,255,0.66); max-width: 640px;
      text-wrap: pretty;
    }
    #stg-dots {
      position: absolute; z-index: 4; left: ${CAP_X}px; bottom: 120px;
      display: flex; gap: 10px; align-items: center;
      opacity: 0; transition: opacity 500ms ${EASE};
    }
    #stg-dots span {
      height: 8px; width: 8px; border-radius: 4px; background: rgba(255,255,255,0.28);
      transition: width 450ms ${EASE_OUT}, background-color 450ms ${EASE};
    }
    #stg-dots span.on { width: 30px; background: rgba(255,255,255,0.92); }
    #stg-hero {
      position: absolute; z-index: 5; inset: 0; display: grid; place-items: center;
      text-align: center; font-family: ${FONT}; color: #fff; pointer-events: none;
      -webkit-font-smoothing: antialiased;
    }
    #stg-hero .inner {
      opacity: 0; transform: translateY(24px) scale(0.985); filter: blur(12px);
      transition: opacity 900ms ${EASE}, transform 1200ms ${EASE_OUT}, filter 900ms ${EASE};
    }
    #stg-hero.in .inner { opacity: 1; transform: none; filter: blur(0); }
    #stg-hero.out .inner {
      opacity: 0; transform: translateY(-30px) scale(0.98); filter: blur(10px);
      transition: opacity 450ms ${EASE}, transform 600ms ${EASE}, filter 450ms ${EASE};
    }
    #stg-hero .eyebrow {
      font-size: 22px; font-weight: 600; letter-spacing: 0.22em; color: ${ACCENT};
      text-transform: uppercase;
    }
    #stg-hero .title {
      margin-top: 18px; font-size: 168px; font-weight: 700; letter-spacing: -0.04em;
      line-height: 1; background: linear-gradient(180deg, #fff 30%, #ffd3e3 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      padding: 0 0.06em 0.08em;
    }
    #stg-hero .sub {
      margin-top: 26px; font-size: 34px; font-weight: 400; color: rgba(255,255,255,0.72);
      letter-spacing: -0.005em;
    }
    #stg-touch {
      position: absolute; z-index: 30000; width: 50px; height: 50px; margin: -25px 0 0 -25px;
      border-radius: 50%; pointer-events: none;
      background: rgba(255,255,255,0.34);
      box-shadow: 0 0 0 2px rgba(255,255,255,0.75), 0 4px 18px rgba(0,0,0,0.28);
      opacity: 0; transform: scale(0.6);
      transition: opacity 140ms ${EASE}, transform 180ms ${EASE};
    }
    #stg-touch.down { opacity: 1; transform: scale(1); }
    #stg-touch.up {
      opacity: 0; transform: scale(1.35);
      transition: opacity 320ms ${EASE}, transform 360ms ${EASE};
    }
    #stg-touch.drag { transition: opacity 140ms ${EASE}, transform 180ms ${EASE}; }
    #stg-fade {
      position: fixed; inset: 0; z-index: 40000; background: #000; pointer-events: none;
      opacity: 1; transition: opacity 900ms ${EASE};
    }
  `;

  const el = (tag, attrs = {}, html = '') => {
    const e = document.createElement(tag);
    Object.assign(e, attrs);
    if (html) e.innerHTML = html;
    return e;
  };
  const reflow = (e) => void e.getBoundingClientRect();

  document.head.appendChild(el('style', { id: 'stg-style' }, css));
  const root = document.getElementById('root');
  const bg = el('div', { id: 'stg-bg' });
  const vig = el('div', { id: 'stg-vignette' });
  const bezel = el('div', { id: 'stg-bezel' });
  // Side buttons: action + volume on the left, power on the right.
  bezel.innerHTML = `
    <i style="left:-5px; top:180px; height:34px"></i>
    <i style="left:-5px; top:250px; height:62px"></i>
    <i style="left:-5px; top:330px; height:62px"></i>
    <i style="right:-5px; top:280px; height:100px"></i>`;
  const cap = el('div', { id: 'stg-cap' });
  const dots = el('div', { id: 'stg-dots' });
  const hero = el('div', { id: 'stg-hero' });
  const touch = el('div', { id: 'stg-touch' });
  const fade = el('div', { id: 'stg-fade' });
  document.body.prepend(bg, vig, bezel);
  document.body.append(cap, dots, hero, touch, fade);

  // Phone starts below the frame; rise() brings it up.
  root.style.transition = 'none';
  root.classList.add('stg-rise');
  bezel.style.transform = `translateY(${H}px)`;
  reflow(root);
  root.style.transition = '';

  let current = null;
  let dotEls = [];

  const stage = {
    fadeIn() {
      reflow(fade);
      fade.style.opacity = '0';
      bg.style.transform = 'scale(1.0)';
    },
    fadeOut(ms = 900) {
      fade.style.transition = `opacity ${ms}ms ${EASE}`;
      fade.style.opacity = '1';
    },
    hero({ eyebrow, title, sub, size }) {
      hero.className = '';
      hero.innerHTML = `<div class="inner">
        <div class="eyebrow">${eyebrow}</div>
        <div class="title"${size ? ` style="font-size:${size}px"` : ''}>${title}</div>
        <div class="sub">${sub}</div></div>`;
      reflow(hero);
      hero.classList.add('in');
    },
    heroOut() {
      hero.classList.remove('in');
      hero.classList.add('out');
    },
    place() {
      root.style.transition = 'none';
      bezel.style.transition = 'none';
      root.classList.remove('stg-rise');
      bezel.style.transform = 'translateY(0)';
      reflow(root);
      root.style.transition = '';
      bezel.style.transition = '';
    },
    hide() {
      root.style.transition = 'none';
      bezel.style.transition = 'none';
      root.classList.add('stg-rise');
      bezel.style.transform = `translateY(${H}px)`;
      reflow(root);
      root.style.transition = '';
      bezel.style.transition = '';
    },
    rise() {
      root.classList.remove('stg-rise');
      bezel.style.transform = 'translateY(0)';
    },
    dots(n) {
      dots.innerHTML = '';
      dotEls = Array.from({ length: n }, () => dots.appendChild(el('span')));
    },
    caption({ n, label, title, sub }) {
      if (current) {
        const old = current;
        old.classList.remove('in');
        old.classList.add('out');
        setTimeout(() => old.remove(), 400);
      }
      const eyebrow = n
        ? `<b>${String(n).padStart(2, '0')}</b><span class="sep"></span>${label}`
        : label;
      const block = el('div', { className: 'stg-block' }, `
        <div class="stg-eyebrow">${eyebrow}</div>
        <div class="stg-title">${title}</div>
        ${sub ? `<div class="stg-sub">${sub}</div>` : ''}`);
      cap.appendChild(block);
      current = block;
      // Let the outgoing block clear before the new one rises in.
      setTimeout(() => {
        reflow(block);
        block.classList.add('in');
      }, current && cap.children.length > 1 ? 220 : 0);
      dots.style.opacity = n ? '1' : '0';
      dotEls.forEach((d, i) => d.classList.toggle('on', i === n - 1));
    },
    touchDown(x, y) {
      touch.className = '';
      touch.style.left = `${x}px`;
      touch.style.top = `${y}px`;
      reflow(touch);
      touch.classList.add('down');
    },
    touchMove(x, y) {
      touch.style.left = `${x}px`;
      touch.style.top = `${y}px`;
    },
    touchUp() {
      touch.classList.remove('down');
      touch.classList.add('up');
    },
  };
  window.__stage = stage;
})();
