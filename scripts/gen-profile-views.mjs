// Generates assets/profile-views.svg from the live komarev profile-view count.
// Run by .github/workflows/profile-views.yml every 6h (and on demand).
// Locally you can pin a number: `COUNT=166 node scripts/gen-profile-views.mjs`.
import { writeFileSync } from 'node:fs';

const USERNAME = 'Sumitkr28';
const SINCE = '2024';
const TRACK_W = 470;                       // px, must match the <rect> track width below
const MILESTONES = [250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

async function getCount() {
  if (process.env.COUNT) return parseInt(process.env.COUNT, 10);
  const url = `https://komarev.com/ghpvc/?username=${USERNAME}&style=flat`;
  const res = await fetch(url, { headers: { 'User-Agent': 'profile-views-svg-action' } });
  if (!res.ok) throw new Error(`komarev returned ${res.status}`);
  const svg = await res.text();
  // The count is the last numeric <text> node in komarev's badge SVG.
  const nums = [...svg.matchAll(/>\s*([\d,]+)\s*<\/text>/g)]
    .map((m) => parseInt(m[1].replace(/[^\d]/g, ''), 10))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) throw new Error('could not parse view count from komarev SVG');
  return nums[nums.length - 1];
}

function buildSvg(count) {
  const goal = MILESTONES.find((m) => m > count) ?? Math.ceil((count + 1) / 100000) * 100000;
  const pct = Math.max(0.02, Math.min(1, count / goal));
  const barW = Math.round(pct * TRACK_W);
  const countFmt = count.toLocaleString('en-US');

  return `<svg width="880" height="64" viewBox="0 0 880 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Profile views: ${countFmt} (since ${SINCE})">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#bb86fc"/>
      <stop offset="1" stop-color="#d8b9ff"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      .lbl{font-family:'JetBrains Mono','IBM Plex Mono',ui-monospace,'Courier New',monospace}
      .num{font-family:'IBM Plex Sans',-apple-system,'Segoe UI',sans-serif}
      @keyframes pulse{0%,100%{opacity:.8}50%{opacity:1}}
      .eye{animation:pulse 2.6s ease-in-out infinite}
    </style>
  </defs>

  <rect x="1" y="1" width="878" height="62" rx="16" fill="#0d1117" stroke="#1f2630" stroke-width="1.5"/>

  <g class="eye" transform="translate(24,21) scale(1.35)" fill="#bb86fc" filter="url(#glow)">
    <path d="M8 2C4.5 2 1.7 4.1.5 7.3a1 1 0 0 0 0 .7C1.7 11.9 4.5 14 8 14s6.3-2.1 7.5-5.3a1 1 0 0 0 0-.7C14.3 4.1 11.5 2 8 2Zm0 9.5A3.5 3.5 0 1 1 8 4.5a3.5 3.5 0 0 1 0 7Zm0-1.7A1.8 1.8 0 1 0 8 6.2a1.8 1.8 0 0 0 0 3.6Z"/>
  </g>

  <text class="lbl" x="58" y="37" font-size="13" letter-spacing="2.2" fill="#8b949e">PROFILE VIEWS</text>
  <text class="num" x="206" y="39" font-size="22" font-weight="700" fill="#f0f6fc">${countFmt}</text>

  <rect x="302" y="27" width="${TRACK_W}" height="10" rx="5" fill="#21262d"/>
  <rect x="302" y="27" width="${barW}" height="10" rx="5" fill="url(#bar)" filter="url(#glow)"/>

  <text class="lbl" x="858" y="36" font-size="11" letter-spacing="1" fill="#6e7681" text-anchor="end">since ${SINCE}</text>
</svg>
`;
}

const count = await getCount();
writeFileSync(new URL('../assets/profile-views.svg', import.meta.url), buildSvg(count));
console.log(`profile-views.svg updated — count = ${count}`);
