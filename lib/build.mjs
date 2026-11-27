// story.json -> out/deck (reveal.js) and out/site (one page). Static folders, no CDN, open by double click.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {KIT, NAME, RUN, pkgDir, readJson, copyFile, rmrf} from './tools.mjs';
import {loadCatalog, byKind, wrapBlock} from './catalog.mjs';

const GSAP_PLUGINS = ['ScrollTrigger', 'SplitText', 'ScrambleTextPlugin', 'DrawSVGPlugin', 'MorphSVGPlugin', 'Flip', 'MotionPathPlugin', 'CustomEase', 'CustomBounce', 'CustomWiggle', 'TextPlugin', 'EasePack', 'Draggable', 'Observer', 'Physics2DPlugin', 'InertiaPlugin'];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

export function loadStory(projectDir) {
  const p = fs.existsSync(projectDir) && fs.statSync(projectDir).isFile() ? projectDir : path.join(projectDir, 'story.json');
  if (!fs.existsSync(p)) throw new Error('story.json not found in ' + projectDir + ' (run: ' + RUN + ' new <folder>)');
  const story = readJson(p);
  story.__dir = path.dirname(p);
  if (!Array.isArray(story.scenes) || !story.scenes.length) throw new Error('story.json needs "scenes": [ ... ]');
  story.scenes.forEach((s, i) => { if (!s.id) s.id = 's' + (i + 1); });
  // Windows: a path typed with back slashes still works, and the HTML always gets forward slashes
  const fix = (v) => (typeof v === 'string' && /\\/.test(v) && /\.[a-z0-9]{2,5}$/i.test(v) && fs.existsSync(path.join(story.__dir, v.split('\\').join('/'))) ? v.split('\\').join('/') : v);
  const walk = (o) => { for (const k of Object.keys(o)) { if (k === '__dir') continue; if (typeof o[k] === 'string') o[k] = fix(o[k]); else if (o[k] && typeof o[k] === 'object') walk(o[k]); } };
  walk(story);
  return story;
}

export function validateStory(story, cat) {
  const k = byKind(cat), errors = [], seen = new Set();
  story.scenes.forEach((s, i) => {
    const m = k[s.kind], where = 'scene ' + (i + 1) + ' (' + s.id + ')';
    if (seen.has(s.id)) errors.push(where + ': id "' + s.id + '" is used twice'); seen.add(s.id);
    if (!m) { errors.push(where + ': unknown kind "' + s.kind + '". Run `' + RUN + ' catalog` for the list.'); return; }
    if (m.status !== 'ok') errors.push(where + ': "' + s.kind + '" is ' + m.status + ' (' + (m.reasons || []).join('; ') + ')');
    for (const [name, spec] of Object.entries(m.props || {})) if (/^required/.test(String(spec)) && (s[name] == null || s[name] === '')) errors.push(where + ': "' + s.kind + '" needs "' + name + '" (' + spec + ')');
  });
  return errors;
}

function vendorFiles(metas, stage, scenes = []) {
  // only what the story uses is copied
  const files = [], scripts = [], styles = [];
  const pkgs = new Set();
  const add = (pkg, rel, as, kind = 'js') => { const d = pkgDir(pkg); if (!d) throw new Error('The package "' + pkg + '" is not installed. Run npm install in the kit folder.'); pkgs.add(pkg); files.push([path.join(d, rel), 'assets/vendor/' + as]); (kind === 'js' ? scripts : styles).push('assets/vendor/' + as); };
  if (stage === 'deck') { add('reveal.js', 'dist/reveal.css', 'reveal.css', 'css'); add('reveal.js', 'dist/reveal.js', 'reveal.js'); add('reveal.js', 'dist/plugin/notes.js', 'reveal-notes.js'); }
  if (stage === 'site') { add('lenis', 'dist/lenis.css', 'lenis.css', 'css'); add('lenis', 'dist/lenis.min.js', 'lenis.min.js'); }
  const types = new Set(metas.map((m) => m.source.type)), plugins = new Set();
  metas.forEach((m) => (m.source.uses || []).forEach((u) => { if (GSAP_PLUGINS.includes(u)) plugins.add(u); }));
  // a user's own HyperFrames block names its GSAP plugins in <script src>: copy those too
  for (const sc of scenes) if (typeof sc.data === 'string') for (const m of sc.data.matchAll(/<script[^>]+src=["'][^"']*\/([A-Za-z0-9]+)(?:\.min)?\.js["']/g)) if (GSAP_PLUGINS.includes(m[1])) plugins.add(m[1]);
  if (types.has('gsap') || types.has('hyperframes') || metas.some((m) => (m.source.uses || []).includes('gsap'))) {
    add('gsap', 'dist/gsap.min.js', 'gsap.min.js');
    for (const p of plugins) add('gsap', 'dist/' + p + '.min.js', p + '.min.js');
  }
  if (types.has('motion') || metas.some((m) => (m.source.uses || []).includes('motion'))) add('motion', 'dist/motion.js', 'motion.js');
  if (types.has('anime') || metas.some((m) => (m.source.uses || []).includes('animejs'))) add('animejs', 'dist/bundles/anime.umd.min.js', 'anime.umd.min.js');
  if (types.has('lottie') || metas.some((m) => (m.source.uses || []).includes('lottie-web'))) add('lottie-web', 'build/player/lottie_light.min.js', 'lottie_light.min.js');
  const three = metas.some((m) => (m.source.uses || []).includes('three'));
  if (three) { if (!pkgDir('three')) throw new Error('This story uses a three/* block and the package "three" is not installed. Run npm install in the kit folder.'); pkgs.add('three'); scripts.push('assets/vendor/cs-three.js'); }
  return {files, scripts, styles, pkgs: [...pkgs], three};
}

// three/* blocks: the connect-ai-three stage + three.js, bundled once per kit version into a classic script (cached)
async function threeBundle(outFile) {
  const src = path.join(KIT, 'runtime/three');
  const h = crypto.createHash('sha1');
  const walk = (d) => { for (const n of fs.readdirSync(d).sort()) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) walk(p); else h.update(n + fs.statSync(p).size + ':' + fs.statSync(p).mtimeMs); } };
  walk(src); h.update(readJson(path.join(pkgDir('three'), 'package.json')).version);
  const cache = path.join(os.tmpdir(), 'connect-ai-slides-web-three-' + h.digest('hex').slice(0, 12) + '.js');
  if (!fs.existsSync(cache)) {
    if (!pkgDir('esbuild')) throw new Error('This story uses a three/* block, which is bundled with the optional package "esbuild". Run `npm install` without --omit=optional in the kit folder, or use a block from another source.');
    const esbuild = await import('esbuild');
    await esbuild.build({entryPoints: [path.join(src, 'entry.js')], bundle: true, format: 'iife', minify: true, outfile: cache + '.tmp.js', logLevel: 'silent', loader: {'.json': 'json'}, nodePaths: [path.join(KIT, 'node_modules'), path.dirname(pkgDir('three'))], legalComments: 'none', banner: {js: '/* three.js (MIT, Three.js Authors) + connect-ai-three stage (MIT, CONNECT AI LAB) + CAL Sans / CAL Serif typeface data (SIL OFL 1.1, from Pretendard and Cormorant Garamond). Licences: assets/vendor/licenses */'}});
    fs.renameSync(cache + '.tmp.js', cache);
  }
  copyFile(cache, outFile);
}

// a 3D model a scene points at goes into the page as data, so the deck opens by double click (file:// cannot fetch)
const MODEL = /\.(glb)$/i;
function inlineModels(v, dir) {
  if (typeof v === 'string') { if (MODEL.test(v) && !/^(https?:|data:)/.test(v)) { const p = path.join(dir, v); if (fs.existsSync(p)) return 'data:model/gltf-binary;base64,' + fs.readFileSync(p).toString('base64'); } return v; }
  if (Array.isArray(v)) return v.map((x) => inlineModels(x, dir));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = k === '__dir' ? x : inlineModels(x, dir); return o; }
  return v;
}

// every library copied into the folder travels with its licence text
function writeLicenses(pkgs, outDir) {
  const dir = path.join(outDir, 'assets/vendor/licenses'); fs.mkdirSync(dir, {recursive: true});
  const lines = ['Libraries copied into assets/vendor by ' + NAME + ' (only the ones this page uses).', ''];
  for (const name of pkgs) {
    const d = pkgDir(name); if (!d) continue;
    const pj = readJson(path.join(d, 'package.json'));
    const lic = typeof pj.license === 'string' ? pj.license : JSON.stringify(pj.license || 'see package');
    const f = fs.readdirSync(d).find((n) => /^(licen[sc]e|copying)(\.|$)/i.test(n));
    const safe = name.replace(/[^a-z0-9.-]+/gi, '_');
    if (f) fs.copyFileSync(path.join(d, f), path.join(dir, safe + '.txt'));
    else fs.writeFileSync(path.join(dir, safe + '.txt'), name + ' ' + pj.version + '\nLicense: ' + lic + '\n' + (pj.homepage || '') + '\n');
    lines.push(`${name} ${pj.version}: ${lic}${pj.homepage ? ' (' + pj.homepage + ')' : ''}`);
  }
  fs.writeFileSync(path.join(dir, 'README.txt'), lines.join('\n') + '\n');
}

function mediaFiles(story) {
  const out = new Set();
  const walk = (v) => { if (typeof v === 'string') { if (v.length < 300 && !/^(https?:|data:|#|mailto:)/.test(v) && /\.[a-z0-9]{2,5}$/i.test(v)) { const p = path.join(story.__dir, v); if (!/\.(json|tsx?|jsx?|glb)$/i.test(v) && fs.existsSync(p) && fs.statSync(p).isFile()) out.add(v); } } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k !== '__dir') walk(x); }); };
  walk(story.scenes); walk(story.brand || {});
  return [...out];
}

async function remotionBundle(story, metas, outFile) {
  const items = [];
  story.scenes.forEach((s) => {
    const m = metas.find((x) => x.kind === s.kind); if (!m || m.source.type !== 'remotion') return;
    const comp = s.component ? path.resolve(story.__dir, s.component) : path.join(m.dir, m.component);
    const id = s.component ? 'user:' + s.component : m.kind;
    const d = s.component ? {} : m;   // your own component does not inherit the built-in one's size
    if (!items.find((i) => i.id === id)) items.push({id, comp, fps: s.fps || d.fps || 30, durationInFrames: s.durationInFrames || d.durationInFrames || 90, width: s.width || d.width || 1920, height: s.height || d.height || 1080});
  });
  if (!items.length) return false;
  for (const i of items) if (!fs.existsSync(i.comp)) throw new Error('Remotion component not found: ' + i.comp);
  for (const need of ['remotion', '@remotion/player', 'react', 'react-dom', 'esbuild']) if (!pkgDir(need)) throw new Error('This story uses a remotion/* block, and the optional package "' + need + '" is not installed. Run `npm install` without --omit=optional in the kit folder, or use a block from another source.');
  const esbuild = await import('esbuild');
  const entry = [
    `import React from 'react'; import {createRoot} from 'react-dom/client'; import {flushSync} from 'react-dom'; import {Player} from '@remotion/player';`,
    ...items.map((i, n) => `import C${n} from ${JSON.stringify(i.comp.split(path.sep).join('/'))};`),
    `const reg = window.CSRemotion = window.CSRemotion || {};`,
    `function make(id, Comp, cfg) { reg[id] = Object.assign({}, cfg, { mount(el, props, size) { const W = (size && size.width) || cfg.width, H = (size && size.height) || cfg.height; const ref = React.createRef(); const host = document.createElement('div'); host.style.cssText = 'position:absolute;inset:0'; el.appendChild(host); const root = createRoot(host); let want = 0;
      flushSync(() => root.render(React.createElement(Player, { ref, component: Comp, inputProps: props, durationInFrames: cfg.durationInFrames, fps: cfg.fps, compositionWidth: W, compositionHeight: H, style: { width: '100%', height: '100%' }, controls: false, autoPlay: false, loop: false, clickToPlay: false, spaceKeyToPlayOrPause: false, doubleClickToFullscreen: false, acknowledgeRemotionLicense: true })));
      return { seek(f) { want = f; if (ref.current) ref.current.seekTo(f); }, unmount() { root.unmount(); host.remove(); } }; } }); }`,
    ...items.map((i, n) => `make(${JSON.stringify(i.id)}, C${n}, ${JSON.stringify({fps: i.fps, durationInFrames: i.durationInFrames, width: i.width, height: i.height})});`),
  ].join('\n');
  await esbuild.build({
    stdin: {contents: entry, resolveDir: KIT, loader: 'tsx'}, bundle: true, format: 'iife', minify: true, outfile: outFile, logLevel: 'silent',
    define: {'process.env.NODE_ENV': '"production"'}, jsx: 'automatic', nodePaths: [path.join(KIT, 'node_modules'), path.dirname(KIT), path.dirname(pkgDir('remotion'))], legalComments: 'none',
  });
  return true;
}

// the words of one scene, in reading order (used for the no-JavaScript text, PDF text layer and PPTX alt text)
export function sceneText(s) {
  const bits = [];
  const walk = (v, k) => { if (typeof v === 'string') { if (!/\.(mp4|webm|mov|jpg|jpeg|png|webp|svg|json|tsx|html)$/i.test(v) && !['kind', 'id', 'only', 'side', 'mode', 'href', 'component', 'icon', 'shape', 'notes', 'alt'].includes(k) && !/^(https?:|#|mailto:)/.test(v)) bits.push(v); } else if (Array.isArray(v)) v.forEach((x) => walk(x, k)); else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => { if (!['site', 'deck', 'face', 'colors', 'data', 'props'].includes(kk)) walk(x, kk); }); };
  walk(s, '');
  return bits;
}
function plainText(story) {
  // the words of the story as plain HTML: for search engines and readers without JavaScript
  const rows = [];
  for (const s of story.scenes) { const bits = sceneText(s); if (bits.length) rows.push('<section><h2>' + esc(bits[0]) + '</h2>' + bits.slice(1).map((x) => '<p>' + esc(x) + '</p>').join('') + '</section>'); }
  return rows.join('\n');
}

// a scene that points at the user's own Lottie file or HyperFrames block: the file goes into the page as data
function inlineData(scene, dir) {
  const src = scene.src || scene.html;
  if (typeof src !== 'string' || scene.data) return scene;
  const p = path.join(dir, src);
  if (/^lottie\//.test(scene.kind) && /\.json$/i.test(src)) { if (!fs.existsSync(p)) throw new Error('scene "' + scene.id + '": Lottie file not found: ' + src); try { return {...scene, data: JSON.parse(fs.readFileSync(p, 'utf8'))}; } catch (e) { throw new Error('scene "' + scene.id + '": ' + src + ' is not a valid Lottie JSON (' + e.message + ')'); } }
  if (/^hyperframes\//.test(scene.kind) && /\.html?$/i.test(src)) { if (!fs.existsSync(p)) throw new Error('scene "' + scene.id + '": HyperFrames block not found: ' + src); return {...scene, data: fs.readFileSync(p, 'utf8')}; }
  return scene;
}

export async function build(projectDir, opts = {}) {
  const story = opts.story || loadStory(projectDir);
  const extra = [...(story.blocks || []).map((b) => path.resolve(story.__dir, b)), ...(opts.extraCatalog || [])];
  for (const e of extra) if (!fs.existsSync(e)) throw new Error('story.json "blocks" points at a folder that does not exist: ' + e);
  const cat = opts.catalog || loadCatalog(extra);
  const errors = validateStory(story, cat);
  if (errors.length) { const e = new Error('story.json has problems:\n  - ' + errors.join('\n  - ')); e.problems = errors; throw e; }
  const k = byKind(cat);
  // a page that is embedded live must really be in the project (a clip or a poster would hide the gap until you present)
  for (const sc of story.scenes) if (typeof sc.src === 'string' && /\.html?$/i.test(sc.src) && !/^hyperframes\//.test(sc.kind) && !/^(https?:|data:)/.test(sc.src) && !fs.existsSync(path.join(story.__dir, sc.src))) { const e = new Error('story.json has problems:\n  - scene "' + sc.id + '": the page "' + sc.src + '" was not found. Paths are relative to the story folder.'); e.problems = ['scene "' + sc.id + '": the page "' + sc.src + '" was not found. Paths are relative to the story folder.']; throw e; }
  // a 3D model must really be there (it goes into the page as data; a missing one would leave an empty stage)
  for (const sc of story.scenes) for (const v of [sc.model, sc.src]) if (typeof v === 'string' && MODEL.test(v) && !/^(https?:|data:)/.test(v) && !fs.existsSync(path.join(story.__dir, v))) { const msg = 'scene "' + sc.id + '": the 3D model "' + v + '" was not found. Paths are relative to the story folder.'; const e = new Error('story.json has problems:\n  - ' + msg); e.problems = [msg]; throw e; }
  const outRoot = opts.out || path.join(story.__dir, 'out');
  const stages = opts.stages || ['deck', 'site'];
  const result = {};
  for (const stage of stages) {
    const scenes = story.scenes.filter((s) => s.only !== (stage === 'deck' ? 'site' : 'deck'));
    const metas = [...new Set(scenes.map((s) => k[s.kind]))];
    const out = path.join(outRoot, stage);
    rmrf(out); fs.mkdirSync(path.join(out, 'assets/vendor'), {recursive: true});
    const v = vendorFiles(metas, stage, scenes.map((sc) => inlineData(sc, story.__dir)));
    for (const [src, rel] of v.files) copyFile(src, path.join(out, rel));
    writeLicenses(v.pkgs, out);
    if (v.three) { await threeBundle(path.join(out, 'assets/vendor/cs-three.js')); fs.copyFileSync(path.join(KIT, 'licenses/fonts-OFL.txt'), path.join(out, 'assets/vendor/licenses/CAL-fonts-OFL.txt')); }
    copyFile(path.join(KIT, 'runtime/stage.js'), path.join(out, 'assets/stage.js'));
    copyFile(path.join(KIT, 'runtime/look.css'), path.join(out, 'assets/look.css'));
    fs.writeFileSync(path.join(out, 'assets/blocks.js'), metas.map(wrapBlock).join('\n'));
    const hasRemotion = await remotionBundle({...story, scenes}, metas, path.join(out, 'assets/remotion.js'));
    for (const m of mediaFiles({...story, scenes})) copyFile(path.join(story.__dir, m), path.join(out, m));
    const pub = {...story, scenes: scenes.map((sc) => inlineModels(inlineData(sc, story.__dir), story.__dir))}; delete pub.__dir; delete pub.blocks;
    const json = JSON.stringify(pub).replace(/</g, '\\u003c');
    const title = esc(story.title || 'Untitled'), desc = esc(story.description || '');
    const look = 'look-' + (story.look || 'connect');
    const colors = (story.colors || []).slice(0, 3).map((c, i) => '--c' + (i + 1) + ':' + c).join(';');
    const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
${desc ? `<meta name="description" content="${desc}">\n<meta property="og:description" content="${desc}">` : ''}
<meta property="og:title" content="${title}">
<meta name="theme-color" content="${({paper: '#F3EEE3', white: '#FAFAF7', ivory: '#F2ECE1', night: '#101216'})[story.look] || '#0B0A08'}">
<meta name="generator" content="${NAME}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230B0A08'/%3E%3Cpath d='M8 21h16' stroke='%23D6892A' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E">
${v.styles.map((s) => `<link rel="stylesheet" href="${s}">`).join('\n')}
<link rel="stylesheet" href="assets/look.css">
${colors ? `<style>.cs-body{${colors}}</style>` : ''}`;
    const scripts = [...v.scripts, 'assets/stage.js', 'assets/blocks.js', ...(hasRemotion ? ['assets/remotion.js'] : [])].map((s) => `<script src="${s}"></script>`).join('\n');
    let html;
    if (stage === 'deck') {
      html = `<!doctype html>
<html lang="${esc(story.lang || 'en')}">
<head>
${head}
</head>
<body class="cs-body cs-deck ${look}">
<div class="reveal"><div class="slides"></div></div>
<noscript>${plainText({...story, scenes})}</noscript>
${scripts}
<script>CS.deck(${json});</script>
</body>
</html>
`;
    } else {
      const brand = story.brand || {};
      const links = (brand.links || []).map((l, i, a) => `<a href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}${i === a.length - 1 && l.cta !== false ? ' class="cs-cta"' : ''}>${esc(l.label)}</a>`).join('');
      html = `<!doctype html>
<html lang="${esc(story.lang || 'en')}">
<head>
${head}
</head>
<body class="cs-body cs-site-body ${look}">
<a class="cs-skip" href="#${esc(scenes[0].id)}">Skip to content</a>
<div class="cs-progress" aria-hidden="true"><i></i></div>
<header class="cs-nav">${brand.name ? `<a class="cs-brand" href="#${esc(scenes[0].id)}">${esc(brand.name)}</a>` : '<span></span>'}<nav aria-label="Links">${links}</nav></header>
<main class="cs-site"></main>
<noscript>${plainText({...story, scenes})}</noscript>
${scripts}
<script>CS.site(${json});</script>
</body>
</html>
`;
    }
    fs.writeFileSync(path.join(out, 'index.html'), html);
    fs.writeFileSync(path.join(out, 'README.txt'), stage === 'deck'
      ? `${story.title || 'Deck'}\n\nOpen index.html in a browser (double click). No server, no internet needed.\nKeys: arrows or space = next, S = speaker notes, O or Esc = overview, F = full screen.\nMade with ${NAME}. Licences of the libraries in assets/vendor are in assets/vendor/licenses.\n`
      : `${story.title || 'Site'}\n\nOpen index.html in a browser (double click), or upload this whole folder to any static host.\nMade with ${NAME}. Licences of the libraries in assets/vendor are in assets/vendor/licenses.\n`);
    result[stage] = {dir: out, index: path.join(out, 'index.html'), scenes: scenes.length, kinds: metas.map((m) => m.kind)};
  }
  return {story, out: outRoot, catalog: cat, ...result};
}
