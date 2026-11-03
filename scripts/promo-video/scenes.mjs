// One scene per app. Each `run` starts from `start` and returns to the home
// screen (music starts on the lock screen and ends by unlocking), so scenes
// chain freely in a tour and also stand alone as single-app clips.
//
// Coordinates in `{ at: [x, y] }` are phone points inside the 440×956 frame.

const FOLDER = { at: [132, 300] };
const FOLDER_BACKDROP = { at: [220, 800] };

async function openFromFolder(h, label) {
  await h.tap(FOLDER);
  await h.wait(900);
  await h.tap({ label });
}

async function closeFolder(h) {
  await h.tap(FOLDER_BACKDROP);
  await h.wait(800);
}

export const SCENES = {
  // ── featured in the main video ────────────────────────────────────────
  lock: {
    start: 'lock',
    label: 'Lock Screen',
    title: 'It all starts on the lock screen',
    sub: 'Hit play and the wedding playlist starts. The phone unlocks on its own.',
    async run(h) {
      await h.wait(2300);
      await h.tap({ label: 'Phát' });
      await h.wait(1500);
    },
  },
  home: {
    start: 'home',
    label: 'Home Screen',
    title: 'Everything you need, at a glance',
    sub: 'Widgets for the schedule, the venue and the RSVP form.',
    async run(h) {
      await h.wait(2300);
    },
  },
  calendar: {
    start: 'home',
    label: 'Calendar',
    title: 'The plan for the day',
    sub: 'Tap an event to see when and where.',
    async run(h) {
      await h.wait(700);
      await h.tap({ text: 'Tiệc Cưới' });
      await h.wait(2300);
      await h.tap({ label: 'Quay lại' });
      await h.wait(900);
    },
  },
  notes: {
    start: 'home',
    label: 'Notes',
    title: 'The invite, written as a note',
    sub: 'A few words from us, plus the time, the place and how to get there.',
    async run(h) {
      await h.wait(600);
      await openFromFolder(h, 'Ghi chú');
      await h.wait(2800);
      await h.tap({ label: 'Quay lại' });
      await h.wait(800);
      await closeFolder(h);
    },
  },
  photos: {
    start: 'home',
    label: 'Photos',
    title: 'The wedding album',
    sub: 'Tap a photo to open it, swipe to see the next one.',
    async run(h) {
      await h.wait(500);
      await h.tap({ label: 'Ảnh' });
      await h.wait(1200);
      await h.scroll(640, 1300);
      await h.wait(250);
      await h.tap({ at: [330, 420] });
      await h.wait(1150);
      await h.drag([330, 480], [90, 470], 260);
      await h.wait(1150);
      await h.tap({ label: 'Đóng' });
      await h.wait(800);
      await h.tap({ label: 'Đóng' });
      await h.wait(900);
    },
  },
  messages: {
    start: 'home',
    label: 'Messages',
    title: 'A peek at the couple’s texts',
    sub: 'A sample thread. Rewrite it with your own.',
    async run(h) {
      await h.wait(500);
      await h.tap({ label: 'Tin nhắn' });
      await h.wait(2800);
      await h.tap({ label: 'Đóng' });
      await h.wait(900);
    },
  },
  wallet: {
    start: 'home',
    label: 'Wallet',
    title: 'Gifts, one scan away',
    sub: 'A Wallet pass for your bank QR code.',
    async run(h) {
      await h.wait(600);
      await openFromFolder(h, 'Ví');
      await h.wait(3400);
      await h.tap({ label: 'Đóng' });
      await h.wait(800);
      await closeFolder(h);
    },
  },

  // ── the rest of the phone ─────────────────────────────────────────────
  music: {
    start: 'lock',
    label: 'Music',
    title: 'A wedding playlist',
    sub: 'Royalty-free tracks, ready to play. Skip or scrub right from the lock screen.',
    async run(h) {
      await h.wait(1200);
      await h.tap({ label: 'Bài tiếp' });
      await h.settle(400); // let the new track's metadata (duration) load
      await h.wait(1500);
      await h.tap({ label: 'Bài tiếp' });
      await h.settle(400);
      await h.wait(1500);
      await h.tap({ selector: 'div.cursor-pointer.h-2' }); // seek to the middle
      await h.wait(1500);
      await h.drag([220, 936], [220, 430], 380); // swipe up to unlock
      await h.wait(1300);
    },
  },
  phone: {
    start: 'home',
    label: 'Phone',
    title: 'The call log tells the story',
    sub: 'Every call sorted out one more thing: the menu, the outfits, the photographer, the car.',
    async run(h) {
      await h.wait(500);
      await h.tap({ label: 'Điện thoại' });
      await h.wait(3600);
      await h.tap({ label: 'Đóng' });
      await h.wait(900);
    },
  },
  youtube: {
    start: 'home',
    label: 'YouTube',
    title: 'A wedding MV, built right in',
    sub: '“Lễ Đường” by Kai Đinh, on a YouTube page that looks the part.',
    async run(h) {
      await h.wait(500);
      await openFromFolder(h, 'YouTube');
      await h.wait(250);
      await h.settle(3500); // the embed loads over the network in real time
      await h.wait(1900);
      await h.scroll(280, 1100, [220, 760]);
      await h.wait(1000);
      await h.tap({ label: 'Đóng' });
      await h.wait(800);
      await closeFolder(h);
    },
  },
  settings: {
    start: 'home',
    label: 'Settings',
    title: 'Even Settings got some love',
    sub: 'The groom’s account, a Wi‑Fi called “lemdeptry”, and toggles that actually toggle.',
    async run(h) {
      await h.wait(500);
      await openFromFolder(h, 'Cài đặt');
      await h.wait(1500);
      await h.tap({ selector: 'button[aria-pressed]', first: true });
      await h.wait(1000);
      await h.scroll(330, 1100);
      await h.wait(900);
      await h.tap({ label: 'Đóng' });
      await h.wait(800);
      await closeFolder(h);
    },
  },
  calculator: {
    start: 'home',
    label: 'Calculator',
    title: 'Yes, the calculator works',
    sub: '50 × 2 = 100. Here’s to a hundred happy years.',
    async run(h) {
      await h.wait(500);
      await openFromFolder(h, 'Máy tính');
      await h.wait(1000);
      for (const key of ['5', '0', '×', '2', '=']) {
        await h.tap({ label: key }, { hold: 90 });
        await h.wait(260);
      }
      await h.wait(1500);
      await h.tap({ label: 'Đóng' });
      await h.wait(800);
      await closeFolder(h);
    },
  },
};

export const OUTRO = {
  n: 0,
  label: 'Open source',
  title: 'Thank you for coming.',
  sub: 'Make it yours: github.com/nguyenhuugiatri/iphone-wedding-invitation',
};

/** Numbered caption for a scene inside a multi-scene video. */
export const caption = (key, n) => {
  const { label, title, sub } = SCENES[key];
  return { n, label, title, sub };
};

// Pull the lock screen back down and sign off.
export async function outro(h) {
  h.mark('outro');
  await h.drag([220, 14], [220, 520], 420);
  await h.wait(200);
  await h.stage('caption', OUTRO);
  await h.wait(3200);
  await h.stage('fadeOut', 1000);
  await h.wait(1100);
}
