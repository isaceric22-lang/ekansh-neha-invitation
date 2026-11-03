// Dev server for recording: the app's own config with HMR off, so edits
// elsewhere in the repo can't reload the page mid-take.
//   pnpm exec vite --config scripts/promo-video/vite.config.mjs --port 5199
import base from '../../vite.config.ts';

export default { ...base, server: { ...base.server, hmr: false } };
