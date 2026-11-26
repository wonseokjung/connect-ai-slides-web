// Writes docs/index.html (the catalog page) from a gallery run and a demo project.
// node tools/make-docs.mjs --gallery <gallery project> --demo <demo project> [--demo-ko <demo project>] [--montage file.mp4]
// The page is one static file plus docs/clips, docs/stills and docs/demo. No CDN. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {KIT, NAME, readJson, findFfmpeg} from '../lib/tools.mjs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {eyesAvailable, measureEyes, eyeVerdict} from '../lib/eyes.mjs';

const args = process.argv.slice(2), flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const G = path.resolve(flag('--gallery')), DEMO = flag('--demo') ? path.resolve(flag('--demo')) : null, MONT = flag('--montage') ? path.resolve(flag('--montage')) : null;
const DOCS = path.join(KIT, 'docs');
const g = readJson(path.join(G, 'gallery.json'));
const pkg = readJson(path.join(KIT, 'package.json'));
const ff = findFfmpeg();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const cp = (a, b) => { fs.mkdirSync(path.dirname(b), {recursive: true}); fs.copyFileSync(a, b); };
const small = (src, dst, w) => { fs.mkdirSync(path.dirname(dst), {recursive: true}); const r = spawnSync(ff, ['-v', 'error', '-y', '-i', src, '-vf', `scale=${w}:-2:flags=lanczos`, '-q:v', '4', dst]); if (r.status !== 0) fs.copyFileSync(src, dst); };

for (const d of ['clips', 'stills']) fs.rmSync(path.join(DOCS, d), {recursive: true, force: true});
const items = g.items.map((it) => {
  const id = it.kind.replace('/', '-');
  // the card preview is about 400 px wide: a 720 px copy is plenty
  if (it.clip) { const dst = path.join(DOCS, 'clips', id + '.mp4'); fs.mkdirSync(path.dirname(dst), {recursive: true}); const r = spawnSync(ff, ['-v', 'error', '-y', '-i', path.join(G, it.clip), '-vf', 'scale=720:-2:flags=lanczos', '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dst]); if (r.status !== 0) cp(path.join(G, it.clip), dst); }
  const st = {};
  for (const [f, rel] of Object.entries(it.stills || {})) { const dst = path.join(DOCS, 'stills', `${id}_${f}.jpg`); small(path.join(G, rel), dst, f === 'phone' ? 390 : 960); st[f] = `stills/${id}_${f}.jpg`; }
  const line = JSON.stringify({kind: it.kind, ...it.example});
  return {kind: it.kind, id, title: it.title, use: it.use, src: it.source.type, lib: it.source.package || '', lic: it.license, dur: it.dur ? +it.dur.toFixed(1) : null, steps: it.steps || 0, mode: (it.site && it.site.mode) || 'play', desc: it.description, lead: it.lead || '', props: it.props, line, clip: it.clip ? `clips/${id}.mp4` : null, st};
});

// the live gallery (every block in one deck and one page) and the demo
const live = {};
for (const stage of ['deck', 'site']) { const s = path.join(G, 'out', stage); if (fs.existsSync(s)) { fs.rmSync(path.join(DOCS, 'live', stage), {recursive: true, force: true}); fs.cpSync(s, path.join(DOCS, 'live', stage), {recursive: true}); live[stage] = `live/${stage}/index.html`; } }
// demo projects: --demo <project> (and --demo-ko <project>, any number of --demo-<lang>)
const DEMOS = [];
for (let i = 0; i < args.length; i++) { const m = /^--demo(?:-([a-z]{2}))?$/.exec(args[i]); if (m && args[i + 1]) DEMOS.push({lang: m[1] || 'en', dir: path.resolve(args[i + 1])}); }
const enc = (src, dst, vf, crf) => { fs.mkdirSync(path.dirname(dst), {recursive: true}); const r = spawnSync(ff, ['-v', 'error', '-y', '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-g', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dst]); return r.status === 0; };
// a poster is the first frame people see: when a face is in it, pick a moment with open eyes (macOS Vision, same rule as check)
const posterOf = async (video, dst, times) => {
  const tries = [];
  for (const t of times) { const f = dst.replace(/\.jpg$/, `_${t}.jpg`); const r = spawnSync(ff, ['-v', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '4', f]); if (r.status === 0) tries.push(f); }
  let pick = tries[0];
  if (eyesAvailable() && tries.length) { const m = await measureEyes(tries); pick = tries.find((f) => { const x = m[f] || (m.get && m.get(f)); return !x || !x.faces || eyeVerdict(x) === 'ok'; }) || tries[0]; }
  if (pick) fs.renameSync(pick, dst); for (const f of tries) if (f !== pick) fs.rmSync(f, {force: true});
  return !!pick;
};
const demos = [];
fs.rmSync(path.join(DOCS, 'demo'), {recursive: true, force: true});
for (const {lang, dir} of DEMOS) {
  const o = path.join(dir, 'out'), rel = `demo/${lang}`, D = path.join(DOCS, 'demo', lang), d = {lang};
  for (const stage of ['deck', 'site']) if (fs.existsSync(path.join(o, stage))) { fs.cpSync(path.join(o, stage), path.join(D, stage), {recursive: true}); d[stage] = `${rel}/${stage}/index.html`; }
  // the recordings are 1920x1080 and 780x1688 at high quality: a lighter copy is enough on the page
  // the first language carries every file; the others carry what differs to look at (deck and phone recordings, the PDF) and their live deck and site
  const first = !demos.length;
  if (fs.existsSync(path.join(o, 'deck.mp4')) && enc(path.join(o, 'deck.mp4'), path.join(D, 'deck.mp4'), 'scale=1120:-2:flags=lanczos', 31)) d['deck.mp4'] = `${rel}/deck.mp4`;
  if (first && fs.existsSync(path.join(o, 'site.mp4')) && enc(path.join(o, 'site.mp4'), path.join(D, 'site.mp4'), 'scale=1120:-2:flags=lanczos', 31)) d['site.mp4'] = `${rel}/site.mp4`;
  if (fs.existsSync(path.join(o, 'phone.mp4')) && enc(path.join(o, 'phone.mp4'), path.join(D, 'phone.mp4'), 'scale=432:-2:flags=lanczos', 31)) d['phone.mp4'] = `${rel}/phone.mp4`;
  for (const f of first ? ['deck.pdf', 'deck.pptx', 'report.md'] : ['deck.pdf', 'report.md']) if (fs.existsSync(path.join(o, f))) { cp(path.join(o, f), path.join(D, f)); d[f] = `${rel}/${f}`; }
  cp(path.join(dir, 'story.json'), path.join(D, 'story.json')); d.story = `${rel}/story.json`;
  for (const f of ['deck.mp4', 'site.mp4', 'phone.mp4']) if (d[f] && await posterOf(path.join(o, f), path.join(D, f.replace('.mp4', '_poster.jpg')), [1.2, 2.0, 2.6, 3.2, 4.0, 5.0])) d[f + ':poster'] = `${rel}/${f.replace('.mp4', '_poster.jpg')}`;
  demos.push(d);
}
const demo = demos[0] || {};
if (MONT && fs.existsSync(MONT)) { cp(MONT, path.join(DOCS, 'demo', 'montage.mp4')); demo.montage = 'demo/montage.mp4'; const webp = MONT.replace(/\.mp4$/i, '.webp'); if (fs.existsSync(webp)) cp(webp, path.join(DOCS, 'demo', 'montage.webp')); /* the README shows the webp */ if (await posterOf(MONT, path.join(DOCS, 'demo', 'montage_poster.jpg'), [2.5, 2.0, 1.5, 3.5])) demo['montage:poster'] = 'demo/montage_poster.jpg'; }

// every built stage carries its own media/ folder; on the page they share one, so the same clip is stored once
const SHARED = path.join(DOCS, 'media');
fs.rmSync(SHARED, {recursive: true, force: true});
const stageDirs = [...['deck', 'site'].map((s) => path.join(DOCS, 'live', s)), ...demos.flatMap((d) => ['deck', 'site'].map((s) => path.join(DOCS, 'demo', d.lang, s)))].filter((s) => fs.existsSync(path.join(s, 'media')));
const seen = new Map();
for (const s of stageDirs) {
  const map = {};
  for (const f of fs.readdirSync(path.join(s, 'media'))) {
    const src = path.join(s, 'media', f), buf = fs.readFileSync(src), h = createHash('sha1').update(buf).digest('hex').slice(0, 10);
    let name = seen.get(h);
    if (!name) { name = fs.existsSync(path.join(SHARED, f)) ? f.replace(/(\.[^.]+)$/, `-${h.slice(0, 6)}$1`) : f; fs.mkdirSync(SHARED, {recursive: true}); fs.writeFileSync(path.join(SHARED, name), buf); seen.set(h, name); }
    map[f] = name;
  }
  const up = path.relative(s, SHARED).split(path.sep).join('/');
  const ix = path.join(s, 'index.html');
  fs.writeFileSync(ix, fs.readFileSync(ix, 'utf8').replace(/(["'(\s=])media\/([A-Za-z0-9_.\-]+)/g, (all, pre, f) => map[f] ? `${pre}${up}/${map[f]}` : all));
  fs.rmSync(path.join(s, 'media'), {recursive: true, force: true});
}
// people clips in the shared folder are re-encoded lighter for the page (the kit's own out/ keeps the full quality)
for (const f of fs.existsSync(SHARED) ? fs.readdirSync(SHARED) : []) {
  const p = path.join(SHARED, f); if (!/\.mp4$/i.test(f) || fs.statSync(p).size < 400e3) continue;
  const tmp = p.replace(/\.mp4$/, '.tmp.mp4');
  const r = spawnSync(ff, ['-v', 'error', '-y', '-i', p, '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', tmp]);
  if (r.status === 0 && fs.statSync(tmp).size < fs.statSync(p).size) fs.renameSync(tmp, p); else fs.rmSync(tmp, {force: true});
}

const ORDER = ['kit', 'gsap', 'motion', 'anime', 'css', 'lottie', 'hyperframes', 'remotion', 'clip'];
items.sort((a, b) => (ORDER.indexOf(a.src) - ORDER.indexOf(b.src)) || a.kind.localeCompare(b.kind));
const sources = ORDER.filter((s) => items.some((i) => i.src === s)), uses = [...new Set(items.map((i) => i.use))].sort((a, b) => items.filter((i) => i.use === b).length - items.filter((i) => i.use === a).length);
const SRC_NAME = {kit: 'Kit (no library)', gsap: 'GSAP', motion: 'Motion', anime: 'anime.js', css: 'CSS', lottie: 'Lottie', hyperframes: 'HyperFrames', remotion: 'Remotion', clip: 'Video clip'};
const count = items.length;
const REPO = 'https://github.com/wonseokjung/connect-ai-slides-web', YT = 'https://www.youtube.com/@CONNECT-AI-LAB', SITE = 'https://www.aicitybuilders.com';
const PROMPT = `Use connect-ai-slides-web to make a deck and a one-page website about: <my topic>.\nUse only the facts I give you: <facts, names, links>.\nShow me the scene list first. After my OK, write story.json, build, run check and fix every error.\nThen show me the three sheets (deck, web, phone).`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${NAME}: one story, a deck and a website | Open source by CONNECT AI LAB</title>
<meta name="description" content="Tell your coding agent the story. Get a deck you present and a website that moves, from the same story, checked on the real screen. ${count} motion blocks from GSAP, Motion, anime.js, Lottie, CSS, HyperFrames and Remotion.">
<meta property="og:title" content="${NAME}: one story, a deck and a website">
<meta property="og:description" content="Open source by CONNECT AI LAB. ${count} motion blocks, one seekable contract, a check that measures the real screen.">
<meta name="theme-color" content="#0B0A08">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230B0A08'/%3E%3Cpath d='M8 21h16' stroke='%23D6892A' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E">
<style>
:root { --bg: #0B0A08; --bg2: #14110D; --ink: #F6F3EC; --ivory: #EBE2D2; --dim: rgba(235,226,210,.66); --faint: rgba(235,226,210,.14); --line: rgba(235,226,210,.18); --gold: #D6892A; --gold2: #F2B45A; --card: rgba(255,255,255,.04);
  --sans: "Inter", "Pretendard", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif; --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
* { box-sizing: border-box; }
html { background: var(--bg); scroll-behavior: smooth; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--sans); font-weight: 300; line-height: 1.5; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
body::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .09; mix-blend-mode: overlay; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
a { color: inherit; }
.wrap { position: relative; z-index: 1; max-width: 1320px; margin: 0 auto; padding: 0 clamp(16px, 4.4vw, 56px); }
header.top { position: sticky; top: 0; z-index: 20; background: linear-gradient(180deg, rgba(11,10,8,.92), rgba(11,10,8,.6) 70%, rgba(11,10,8,0)); }
header.top .wrap { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.brand { font-size: 12.5px; font-weight: 500; letter-spacing: .36em; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; min-height: 44px; }
header nav { display: flex; gap: clamp(4px, 2vw, 26px); align-items: center; }
header nav a { font-size: 14px; color: var(--ivory); text-decoration: none; padding: 12px 6px; min-height: 44px; display: inline-flex; align-items: center; }
header nav a:hover { color: var(--gold2); }
.kicker { font-size: clamp(11.5px, .95vw, 14px); font-weight: 400; letter-spacing: .34em; text-transform: uppercase; color: var(--gold2); }
h1 { font-size: clamp(40px, 7.4vw, 116px); font-weight: 200; letter-spacing: -.035em; line-height: .98; margin: .28em 0 .3em; text-wrap: balance; }
h1 em { font-style: normal; color: var(--gold2); }
h2 { font-size: clamp(30px, 4.2vw, 64px); font-weight: 200; letter-spacing: -.028em; line-height: 1.04; margin: .3em 0 .45em; text-wrap: balance; }
.lead { font-size: clamp(18px, 1.7vw, 26px); color: var(--ivory); max-width: 34em; text-wrap: pretty; }
.text { font-size: clamp(16px, 1.15vw, 18px); color: var(--dim); max-width: 44em; }
.hero { padding-top: clamp(28px, 6vw, 84px); padding-bottom: clamp(36px, 5vw, 72px); }
.hero .w { display: inline-block; opacity: 0; filter: blur(14px); transform: translateY(.22em); animation: wd .8s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes wd { to { opacity: 1; filter: blur(0); transform: none; } }
@media (prefers-reduced-motion: reduce) { .hero .w { animation: none; opacity: 1; filter: none; transform: none; } html { scroll-behavior: auto; } }
.cmd { margin-top: clamp(22px, 2.4vw, 34px); display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.code { display: flex; align-items: center; gap: 14px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 6px 6px 6px 18px; font-family: var(--mono); font-size: clamp(13.5px, 1.15vw, 17px); color: var(--ink); min-height: 52px; max-width: 100%; }
.code code { white-space: nowrap; overflow-x: auto; scrollbar-width: none; }
.code code::-webkit-scrollbar { display: none; }
.code .p { color: var(--gold2); user-select: none; margin-right: -6px; }
button.copy { flex: none; font: 500 13px var(--sans); letter-spacing: .04em; color: #14100A; background: var(--gold2); border: 0; border-radius: 10px; min-height: 40px; min-width: 76px; padding: 0 14px; cursor: pointer; transition: background .2s; }
button.copy:hover { background: #FFD08A; }
button.copy.ghost { background: transparent; color: var(--ivory); border: 1px solid var(--line); }
button.copy.ghost:hover { border-color: var(--gold2); color: var(--gold2); }
button.copy:focus-visible, a:focus-visible, .chip:focus-visible { outline: 2px solid var(--gold2); outline-offset: 3px; }
.btn { display: inline-flex; align-items: center; min-height: 52px; padding: 0 22px; border-radius: 14px; border: 1px solid var(--line); text-decoration: none; font-size: 15px; color: var(--ivory); }
.btn:hover { border-color: var(--gold2); color: var(--gold2); }
.facts { display: flex; flex-wrap: wrap; gap: 10px 34px; margin-top: clamp(22px, 2.6vw, 38px); }
.facts div { font-size: clamp(14px, 1.1vw, 16.5px); color: var(--ivory); letter-spacing: .02em; }
.facts b { font-weight: 200; font-size: clamp(30px, 3vw, 44px); color: var(--ink); letter-spacing: -.03em; margin-right: 10px; font-variant-numeric: tabular-nums; }
.shot { border-radius: clamp(12px, 1.5vw, 22px); overflow: hidden; border: 1px solid var(--line); background: #000; box-shadow: 0 30px 90px rgba(0,0,0,.5); }
.shot video, .shot img { display: block; width: 100%; height: auto; }
.montage { margin-top: clamp(22px, 2.6vw, 40px); margin-bottom: clamp(22px, 2.6vw, 40px); }
.hero h1 { font-size: clamp(36px, 5.6vw, 88px); }
.lang { margin-top: 18px; }
.demo[hidden] { display: none; }
section { padding: clamp(48px, 7vw, 110px) 0; border-top: 1px solid var(--faint); }
.mma { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: clamp(12px, 2vw, 28px); align-items: center; margin-top: clamp(22px, 3vw, 44px); }
.mma .col { display: flex; flex-direction: column; gap: 8px; }
.mma .pill { border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; font-size: 14.5px; color: var(--ivory); background: var(--card); }
.mma .pill small { display: block; color: var(--dim); font-size: 12.5px; }
.mma .core { border: 1px solid var(--gold); border-radius: 18px; padding: clamp(16px, 2vw, 28px); text-align: center; }
.mma .core b { display: block; font-weight: 200; font-size: clamp(22px, 2.2vw, 32px); letter-spacing: -.02em; }
.mma .core code { font-family: var(--mono); font-size: 13.5px; color: var(--gold2); }
.mma .arrow { width: clamp(18px, 3vw, 46px); height: 1px; background: var(--gold); position: relative; }
.mma .arrow::after { content: ""; position: absolute; right: 0; top: -3px; width: 7px; height: 7px; border-top: 1px solid var(--gold); border-right: 1px solid var(--gold); transform: rotate(45deg); }
@media (max-width: 860px) { .mma { grid-template-columns: 1fr; } .mma .arrow { width: 1px; height: 26px; margin: 0 auto; } .mma .arrow::after { right: -3px; top: auto; bottom: 0; transform: rotate(135deg); } .mma .col { display: grid; grid-template-columns: 1fr 1fr; } }
.demo { display: grid; grid-template-columns: minmax(0, 1.78fr) minmax(0, 1.78fr) minmax(0, .46fr); gap: clamp(14px, 2vw, 28px); margin-top: clamp(22px, 3vw, 44px); align-items: start; }
.demo figure { margin: 0; }
.demo figcaption { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: baseline; font-size: 14.5px; color: var(--dim); }
.demo figcaption b { font-weight: 400; color: var(--ink); letter-spacing: .16em; text-transform: uppercase; font-size: 12.5px; }
.demo figcaption a { color: var(--gold2); text-decoration: none; padding: 12px 0; display: inline-flex; align-items: center; min-height: 44px; }
.demo figcaption a:hover { text-decoration: underline; }
.demo.two { grid-template-columns: minmax(0, 1.78fr) minmax(0, .46fr); max-width: 1000px; }
@media (max-width: 900px) { .demo, .demo.two { grid-template-columns: 1fr; } .demo .ph { max-width: 240px; } }
.tools { display: flex; flex-wrap: wrap; gap: 8px; margin: clamp(18px, 2.4vw, 30px) 0 8px; }
.chip { font: 400 13.5px var(--sans); letter-spacing: .02em; color: var(--ivory); background: transparent; border: 1px solid var(--line); border-radius: 999px; min-height: 40px; padding: 0 15px; cursor: pointer; }
.chip[aria-pressed="true"] { background: var(--gold2); color: #14100A; border-color: var(--gold2); }
.chip small { opacity: .7; margin-left: 6px; font-variant-numeric: tabular-nums; }
.row-label { font-size: 11.5px; letter-spacing: .28em; text-transform: uppercase; color: var(--dim); margin: 18px 0 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: clamp(14px, 1.8vw, 24px); margin-top: clamp(18px, 2.4vw, 30px); }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
.card .view { position: relative; aspect-ratio: 16 / 9; background: #000; }
.card .view video, .card .view img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; display: block; }
.card .view img.alt { display: none; background: #0B0A08; }
.card[data-v="site"] .view img.site, .card[data-v="phone"] .view img.phone { display: block; }
.card[data-v="site"] .view video, .card[data-v="phone"] .view video { visibility: hidden; }
.card .tabs { position: absolute; right: 8px; top: 8px; display: flex; gap: 4px; z-index: 2; }
.card .tabs button { font: 500 11px var(--sans); letter-spacing: .08em; text-transform: uppercase; color: var(--ivory); background: rgba(11,10,8,.72); border: 1px solid var(--line); border-radius: 8px; min-height: 34px; padding: 0 9px; cursor: pointer; }
.card .tabs button[aria-pressed="true"] { color: #14100A; background: var(--gold2); border-color: var(--gold2); }
.card .body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
.card .kind { font-family: var(--mono); font-size: 14.5px; color: var(--ink); word-break: break-all; }
.card .meta { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; border: 1px solid var(--line); border-radius: 6px; padding: 3px 7px; color: var(--dim); }
.tag.g { color: var(--gold2); border-color: rgba(242,180,90,.45); }
.card p { margin: 0; font-size: 14.5px; color: var(--dim); line-height: 1.45; }
.card .props { font-family: var(--mono); font-size: 12px; color: var(--dim); line-height: 1.5; }
.card .props b { color: var(--ivory); font-weight: 400; }
.card .act { display: flex; gap: 8px; margin-top: auto; padding-top: 8px; }
.card .act button { flex: 1; min-height: 44px; }
pre.block { margin: 14px 0 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; font-family: var(--mono); font-size: 13.5px; line-height: 1.6; color: var(--ivory); white-space: pre-wrap; word-break: break-word; position: relative; }
pre.block .err { color: #F0A08C; } pre.block .adv { color: var(--gold2); } pre.block .ok { color: #9CC8A4; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(18px, 3vw, 48px); align-items: start; }
@media (max-width: 860px) { .two { grid-template-columns: 1fr; } }
.steps { counter-reset: s; display: grid; gap: 22px; margin-top: 10px; }
.steps > div { counter-increment: s; }
.steps h3 { margin: 0 0 6px; font-size: 19px; font-weight: 300; }
.steps h3::before { content: "0" counter(s); font-size: 12.5px; letter-spacing: .2em; color: var(--gold2); margin-right: 12px; }
.pre-wrap { position: relative; }
.pre-wrap button.copy { position: absolute; right: 10px; top: 10px; }
.pre-wrap pre.block { padding-right: 104px; }
@media (max-width: 600px) { header.top .wrap { height: 56px; } .brand { font-size: 11.5px; letter-spacing: .28em; white-space: nowrap; } header nav a.opt { display: none; } .code { font-size: 12.5px; gap: 8px; padding-left: 12px; } .code button.copy { min-width: 62px; padding: 0 10px; } }
@media (pointer: coarse) { .card .tabs button { min-height: 44px; padding: 0 12px; } }
.note { font-size: 13.5px; color: var(--dim); border-left: 2px solid var(--gold); padding: 2px 0 2px 14px; margin-top: 18px; max-width: 60em; }
footer { border-top: 1px solid var(--faint); padding: 44px 0 64px; font-size: 14px; color: var(--dim); }
footer .wrap { display: flex; flex-wrap: wrap; gap: 14px 30px; justify-content: space-between; align-items: center; }
footer a { color: var(--ivory); text-decoration: none; padding: 10px 0; display: inline-block; }
footer a:hover { color: var(--gold2); }
.sr { position: absolute; left: -9999px; }
#toast { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%) translateY(20px); background: var(--gold2); color: #14100A; font: 500 14px var(--sans); padding: 10px 18px; border-radius: 999px; opacity: 0; transition: opacity .2s, transform .2s; z-index: 50; pointer-events: none; }
#toast.on { opacity: 1; transform: translateX(-50%); }
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a class="brand" href="${YT}" target="_blank" rel="noopener">CONNECT AI LAB</a>
  <nav aria-label="Links"><a class="opt" href="#catalog">Catalog</a><a href="${YT}" target="_blank" rel="noopener">YouTube</a><a href="${SITE}" target="_blank" rel="noopener">Courses</a><a class="opt" href="${REPO}" target="_blank" rel="noopener">GitHub</a></nav>
</div></header>

<main>
<div class="wrap hero">
  <div class="kicker">Open source by CONNECT AI LAB</div>
  <h1 aria-label="One story. A deck and a website.">${'One story. A deck and a'.split(' ').map((w, i) => `<span class="w" style="animation-delay:${(0.1 + i * 0.07).toFixed(2)}s">${w}</span>`).join(' ')} <span class="w" style="animation-delay:.6s"><em>website.</em></span></h1>
  <div class="cmd">
    <div class="code"><span class="p">$</span><code id="npx">npx ${NAME} demo</code><button class="copy" data-copy="#npx">Copy</button></div>
    <a class="btn" href="#demo">See the demo</a>
  </div>
  ${demo.montage ? `<div class="shot montage"><video src="${demo.montage}" poster="${demo['montage:poster'] || ''}" muted loop playsinline autoplay preload="metadata" aria-label="The same story as a deck in English and a website on a phone in Korean"></video></div>` : ''}
  <p class="lead">Tell your coding agent the story. You get a deck you present in the browser and a one-page website that moves as you scroll, from the same story, checked on the real screen.</p>
  <div class="facts"><div><b>${count}</b>motion blocks</div><div><b>${items.filter((i) => i.lead === 'picture').length}</b>led by a picture</div><div><b>${sources.length}</b>sources, one contract</div><div><b>3</b>screens measured: slide, web, phone</div></div>
</div>

<section><div class="wrap">
  <div class="kicker">What it is for</div>
  <h2>Motion graphics, on things that are not video</h2>
  <p class="text">Every motion library speaks its own language. This kit wraps each of them in one small contract, a block that can be seeked to any moment, so the same block plays on a slide when you click, on a web page when you scroll, and frame by frame when you record. It does not replace the libraries. It makes them work together.</p>
  <div class="mma" role="img" aria-label="Seven motion sources become one seekable block. One story file becomes a deck and a website. A check, a recorder and exports work on both.">
    <div class="col">${[['GSAP', 'SplitText, DrawSVG, MorphSVG, Flip, MotionPath'], ['Motion', 'springs, stagger'], ['anime.js', 'timelines, drawables'], ['Lottie', 'After Effects files'], ['CSS', '@keyframes, no library'], ['HyperFrames', 'HTML blocks, as they are'], ['Remotion', 'compositions, live'], ['Yours', 'block.js, video clips']].map(([a, b]) => `<div class="pill">${a}<small>${b}</small></div>`).join('')}</div>
    <div class="arrow"></div>
    <div class="core"><b>one seekable block</b><code>{ dur, seek(t), steps }</code><p class="text" style="margin:12px auto 0;font-size:14.5px">one line in story.json</p></div>
    <div class="arrow"></div>
    <div class="col">${[['Deck', 'reveal.js: keys, notes, steps on click'], ['Website', 'Lenis scroll: play when seen, or scrub'], ['Check', 'type size, contrast, words, motion, faces'], ['Record', 'mp4, exact frame by frame'], ['Export', 'PDF and PPTX']].map(([a, b]) => `<div class="pill">${a}<small>${b}</small></div>`).join('')}</div>
  </div>
</div></section>

${demos.length ? `<section id="demo"><div class="wrap">
  <div class="kicker">The demo</div>
  <h2>CONNECT AI LAB, told twice</h2>
  <p class="text">One story.json about CONNECT AI LAB, AI Mentor Jay, the free weeknight class and the Visual Vibe Coding course, in ${demos.length > 1 ? 'English and Korean' : 'one language'}. The deck and the website were built from it in one command. The footage is the author's own; the text never sits on his face, his eyes are open on every first frame, and the check enforces both.</p>
  ${demos.length > 1 ? `<div class="tools lang" role="group" aria-label="Language">${demos.map((d, i) => `<button class="chip" data-lang="${d.lang}" aria-pressed="${i ? 'false' : 'true'}">${({en: 'English', ko: '한국어'})[d.lang] || d.lang}</button>`).join('')}</div>` : ''}
  ${demos.map((d, i) => `<div class="demo${d['site.mp4'] ? '' : ' two'}" data-lang="${d.lang}"${i ? ' hidden' : ''}${d.lang === 'ko' ? ' lang="ko"' : ''}>
    ${d['deck.mp4'] ? `<figure><div class="shot"><video src="${d['deck.mp4']}" poster="${d['deck.mp4:poster'] || ''}" muted loop playsinline controls preload="none"></video></div><figcaption><b>Deck</b>${d.deck ? `<a href="${d.deck}">Open the live deck</a>` : ''}${d['deck.pdf'] ? `<a href="${d['deck.pdf']}">PDF</a>` : ''}${d['deck.pptx'] ? `<a href="${d['deck.pptx']}">PPTX</a>` : ''}${!d['site.mp4'] && d.site ? `<a href="${d.site}">Open the live website</a>` : ''}<a href="${d.story}">story.json</a></figcaption></figure>` : ''}
    ${d['site.mp4'] ? `<figure><div class="shot"><video src="${d['site.mp4']}" poster="${d['site.mp4:poster'] || ''}" muted loop playsinline controls preload="none"></video></div><figcaption><b>Website</b>${d.site ? `<a href="${d.site}">Open the live website</a>` : ''}${d['report.md'] ? `<a href="${d['report.md']}">Check report</a>` : ''}</figcaption></figure>` : ''}
    ${d['phone.mp4'] ? `<figure class="ph"><div class="shot"><video src="${d['phone.mp4']}" poster="${d['phone.mp4:poster'] || ''}" muted loop playsinline controls preload="none"></video></div><figcaption><b>Phone</b></figcaption></figure>` : ''}
  </div>`).join('\n  ')}
</div></section>` : ''}

<section id="catalog"><div class="wrap">
  <div class="kicker">Catalog</div>
  <h2>${count} blocks, each one line</h2>
  <p class="text">Every clip below is the real block, recorded from the browser. Switch a card to Web or Phone to see the same block in the other frames. Copy the line into <code style="font-family:var(--mono);color:var(--gold2)">story.json</code>, or copy the prompt and give it to your agent.${live.deck ? ` All of them live: <a href="${live.deck}" style="color:var(--gold2)">as a deck</a>${live.site ? ` and <a href="${live.site}" style="color:var(--gold2)">as one long page</a>` : ''}.` : ''}</p>
  <div class="row-label" id="l-src">Source</div>
  <div class="tools" role="group" aria-labelledby="l-src"><button class="chip" data-f="src" data-v="" aria-pressed="true">All<small>${count}</small></button>${sources.map((s) => `<button class="chip" data-f="src" data-v="${s}" aria-pressed="false">${esc(SRC_NAME[s] || s)}<small>${items.filter((i) => i.src === s).length}</small></button>`).join('')}</div>
  <div class="row-label" id="l-use">Use</div>
  <div class="tools" role="group" aria-labelledby="l-use"><button class="chip" data-f="use" data-v="" aria-pressed="true">Any</button>${uses.map((u) => `<button class="chip" data-f="use" data-v="${u}" aria-pressed="false">${u}<small>${items.filter((i) => i.use === u).length}</small></button>`).join('')}</div>
  <div class="row-label" id="l-lead">Lead</div>
  <div class="tools" role="group" aria-labelledby="l-lead"><button class="chip" data-f="lead" data-v="" aria-pressed="true">Any</button><button class="chip" data-f="lead" data-v="picture" aria-pressed="false">Picture first<small>${items.filter((i) => i.lead === 'picture').length}</small></button><button class="chip" data-f="lead" data-v="type" aria-pressed="false">Type first<small>${items.filter((i) => i.lead === 'type').length}</small></button></div>
  <div class="grid" id="grid">
  ${items.map((it) => `<article class="card" data-src="${it.src}" data-use="${it.use}" data-lead="${it.lead || ''}" data-v="deck">
    <div class="view">
      ${it.clip ? `<video data-src="${it.clip}" poster="${it.st.deck || ''}" muted loop playsinline preload="none" aria-label="${esc(it.title)}"></video>` : `<img src="${it.st.deck || ''}" alt="${esc(it.title)}" loading="lazy">`}
      ${it.st.site ? `<img class="alt site" data-src="${it.st.site}" alt="${esc(it.title)} on a web page" loading="lazy">` : ''}${it.st.phone ? `<img class="alt phone" data-src="${it.st.phone}" alt="${esc(it.title)} on a phone" loading="lazy">` : ''}
      <div class="tabs"><button data-v="deck" aria-pressed="true">Slide</button>${it.st.site ? '<button data-v="site" aria-pressed="false">Web</button>' : ''}${it.st.phone ? '<button data-v="phone" aria-pressed="false">Phone</button>' : ''}</div>
    </div>
    <div class="body">
      <div class="kind">${esc(it.kind)}</div>
      <div class="meta"><span class="tag g">${esc(it.use)}</span><span class="tag">${esc(SRC_NAME[it.src] || it.src)}</span>${it.dur ? `<span class="tag">${it.dur} s</span>` : ''}${it.steps > 0 ? `<span class="tag">${it.steps + 1} clicks</span>` : ''}${it.mode === 'scrub' ? '<span class="tag">scroll scrub</span>' : ''}<span class="tag">${esc(it.lic)}</span></div>
      <p>${esc(it.desc)}</p>
      <div class="props">${Object.entries(it.props || {}).map(([k, v]) => `<b>${esc(k)}</b>${/^required/.test(v) ? '*' : ''}`).join(' · ')}</div>
      <div class="act"><button class="copy ghost" data-text="${esc(it.line)}">Copy line</button><button class="copy" data-text="${esc(`In my connect-ai-slides-web project, add a scene with the block "${it.kind}" (${it.title}: ${it.desc.split('. ')[0]}). Fill its props from what I tell you: <my words>. Example line: ${it.line} Then run build and check, and fix what the report says.`)}">Copy prompt</button></div>
    </div>
  </article>`).join('\n  ')}
  </div>
</div></section>

<section><div class="wrap two">
  <div>
    <div class="kicker">The check</div>
    <h2>It measures the real screen</h2>
    <p class="text">The check opens your deck and your website in a real browser at three sizes and reports in sentences: what, where, and how to fix it. Type size, contrast against the pixels under the text, words per screen, time until the text is readable, anything cut off, anything on a face or a body, closed eyes on a poster or a first frame (macOS), three text-only screens in a row, phone width, tap targets, missing files, requests to the internet.</p>
    <p class="note">The check emulates a projector slide and a phone. It is not your room and not your phone: look at both before you present.</p>
  </div>
  <div>
    <pre class="block"><span class="err">ERROR</span>  scene 12 "gsap-compare-wipe" (gsap/compare-wipe, deck): 47 words on one slide. A slide carries one message: keep up to 28, move the rest to "notes" or split the scene in two.
<span class="err">ERROR</span>  scene 26 "hyperframes-scramble-title" (hyperframes/scramble-title, phone): the text "CHAPTER 02" is 9 px on a 390 px phone. Shorten it or use a block with fewer columns.
<span class="adv">advice</span> scene 6 "purpose" (kit/quote-film, deck): 34 words on one slide. Under 28 is easier to take in while you talk.
<span class="ok">check: PASS (0 errors, 11 advice)</span>
eye check: 16 pictures of people measured (poster, first frame, finished screen), 16 with open eyes on the camera</pre>
    <p class="text" style="font-size:13.5px;margin-top:10px">Real lines from this kit's own runs: the first two were found in two catalog examples (then fixed), the rest are the English demo above.</p>
  </div>
</div></section>

<section id="use"><div class="wrap two">
  <div>
    <div class="kicker">Use it</div>
    <h2>Three ways in</h2>
    <div class="steps">
      <div><h3>Try the sample</h3><div class="pre-wrap"><pre class="block" id="c1">git clone ${REPO}.git
cd ${NAME}
npm install
npx ${NAME} demo</pre><button class="copy ghost" data-copy="#c1">Copy</button></div><p class="text" style="font-size:14.5px;margin-top:8px">Node.js 18 or newer and Chrome (or Edge). The sample builds a deck and a website, checks them and prints where they are.</p></div>
      <div><h3>Teach your agent</h3><div class="pre-wrap"><pre class="block" id="c2">npx ${NAME} install-skill</pre><button class="copy ghost" data-copy="#c2">Copy</button></div><p class="text" style="font-size:14.5px;margin-top:8px">Claude Code, Codex and other coding agents then know the catalog, the rules and the order: outline, story, build, check, look.</p></div>
      <div><h3>Ask in your own words</h3><div class="pre-wrap"><pre class="block" id="c3">${esc(PROMPT)}</pre><button class="copy ghost" data-copy="#c3">Copy</button></div></div>
    </div>
  </div>
  <div>
    <div class="kicker">Good to know</div>
    <h2>Licences, plainly</h2>
    <p class="text">The kit is MIT. The deck engine (reveal.js), the scroll (Lenis), Motion, anime.js and lottie-web are MIT. Two sources are free to use but are not open-source licences:</p>
    <p class="note"><b style="font-weight:400;color:var(--ivory)">GSAP</b> uses GreenSock's standard no-charge licence. Free, including commercial use and all plugins. It is only loaded by the <code style="font-family:var(--mono)">gsap/*</code> and <code style="font-family:var(--mono)">hyperframes/*</code> blocks.</p>
    <p class="note"><b style="font-weight:400;color:var(--ivory)">Remotion</b> is free for individuals, companies of up to three people and non-profits; larger companies need a Remotion company licence. It is optional and only used by the <code style="font-family:var(--mono)">remotion/*</code> blocks.</p>
    <p class="text" style="margin-top:18px">Your output is a static folder with no CDN: the libraries your story uses are copied into it with their licence texts. PPTX and PDF hold the finished screen of each slide and the speaker notes; the motion lives in the HTML deck.</p>
    <p class="text">Want a design that is not here? A block is one small file: <a href="BLOCKS.md" style="color:var(--gold2)">write your own</a>.</p>
  </div>
</div></section>
</main>

<footer><div class="wrap">
  <div><span class="brand">CONNECT AI LAB</span><br>AI education for everyone. ${NAME} ${pkg.version}, MIT.</div>
  <nav aria-label="Footer"><a href="${YT}" target="_blank" rel="noopener">YouTube: CONNECT AI LAB</a> &nbsp;·&nbsp; <a href="${SITE}" target="_blank" rel="noopener">Courses: aicitybuilders.com</a> &nbsp;·&nbsp; <a href="${REPO}" target="_blank" rel="noopener">GitHub</a></nav>
</div></footer>
<div id="toast" role="status" aria-live="polite">Copied</div>
<script>
(function () {
  var toast = document.getElementById('toast'), tt;
  function say(m) { toast.textContent = m; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 1400); }
  function copy(text) {
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); say('Copied'); } catch (e) { say('Select and copy'); } ta.remove(); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { say('Copied'); }, fallback); else fallback();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('copy')) { var t = b.dataset.text || (document.querySelector(b.dataset.copy) || {}).textContent || ''; copy(t.trim()); return; }
    if (b.dataset.lang) {
      document.querySelectorAll('.chip[data-lang]').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      document.querySelectorAll('.demo[data-lang]').forEach(function (d) { var show = d.dataset.lang === b.dataset.lang; d.hidden = !show; if (!show) d.querySelectorAll('video').forEach(function (v) { v.pause(); }); });
      return;
    }
    if (b.classList.contains('chip')) {
      var f = b.dataset.f; document.querySelectorAll('.chip[data-f="' + f + '"]').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      var on = function (k) { return document.querySelector('.chip[data-f="' + k + '"][aria-pressed="true"]').dataset.v; }, src = on('src'), use = on('use'), lead = on('lead');
      document.querySelectorAll('#grid .card').forEach(function (c) { c.hidden = (src && c.dataset.src !== src) || (use && c.dataset.use !== use) || (lead && c.dataset.lead !== lead); });
      return;
    }
    var card = b.closest('.card'); if (card && b.dataset.v) {
      card.dataset.v = b.dataset.v; card.querySelectorAll('.tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var im = card.querySelector('img.' + b.dataset.v); if (im && !im.src && im.dataset.src) im.src = im.dataset.src;
    }
  });
  // clips load and play only while they are on screen
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { var v = en.target; if (en.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { rootMargin: '120px' });
    document.querySelectorAll('.card video').forEach(function (v) { io.observe(v); });
  } else document.querySelectorAll('.card video').forEach(function (v) { v.controls = true; v.src = v.dataset.src; });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(DOCS, 'index.html'), html);
const size = (d) => { let n = 0; const w = (p) => { for (const f of fs.readdirSync(p, {withFileTypes: true})) { const q = path.join(p, f.name); if (f.isDirectory()) w(q); else n += fs.statSync(q).size; } }; if (fs.existsSync(d)) w(d); return (n / 1e6).toFixed(1) + ' MB'; };
console.log(`docs/index.html: ${count} blocks (${items.filter((i) => i.lead === 'picture').length} led by a picture), ${sources.length} sources, ${demos.length} demo languages. clips ${size(path.join(DOCS, 'clips'))}, stills ${size(path.join(DOCS, 'stills'))}, demo ${size(path.join(DOCS, 'demo'))}, live ${size(path.join(DOCS, 'live'))}, shared media ${size(SHARED)}, all ${size(DOCS)}`);
