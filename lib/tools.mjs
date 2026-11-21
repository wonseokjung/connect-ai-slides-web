// Shared helpers: paths, Chrome and ffmpeg lookup, tiny PNG reader. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

export const KIT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const NAME = 'connect-ai-slides-web';
const require = createRequire(import.meta.url);

const OPTIONAL = ['remotion', '@remotion/player', '@remotion/renderer', 'react', 'react-dom', 'esbuild'];
export function pkgDir(name) {
  if (process.env.CONNECT_AI_NO_OPTIONAL && OPTIONAL.includes(name)) return null;      // tests: behave as after `npm install --omit=optional`
  // a dependency's folder, wherever npm put it (next to the kit or hoisted above it)
  let d = KIT;
  for (let i = 0; i < 8; i++) {
    const p = path.join(d, 'node_modules', name, 'package.json');
    if (fs.existsSync(p)) return path.dirname(p);
    const up = path.dirname(d); if (up === d) break; d = up;
  }
  try { return path.dirname(require.resolve(name + '/package.json')); } catch { return null; }
}
export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const fileUrl = (p) => pathToFileURL(p).href;
export function say(...a) { console.log(...a); }
export function fail(msg) { console.error('\n  ' + msg + '\n'); process.exit(1); }

export function findChrome() {
  const env = process.env.CONNECT_AI_CHROME || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env && fs.existsSync(env)) return env;
  const home = os.homedir(), list = [];
  if (process.platform === 'darwin') {
    for (const base of ['/Applications', path.join(home, 'Applications')]) list.push(
      base + '/Google Chrome.app/Contents/MacOS/Google Chrome', base + '/Chromium.app/Contents/MacOS/Chromium',
      base + '/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', base + '/Brave Browser.app/Contents/MacOS/Brave Browser', base + '/Arc.app/Contents/MacOS/Arc');
  } else if (process.platform === 'win32') {
    for (const base of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean)) list.push(
      path.join(base, 'Google/Chrome/Application/chrome.exe'), path.join(base, 'Microsoft/Edge/Application/msedge.exe'), path.join(base, 'Chromium/Application/chrome.exe'));
  } else {
    for (const n of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) { const r = spawnSync('which', [n], {encoding: 'utf8'}); if (r.status === 0 && r.stdout.trim()) list.push(r.stdout.trim()); }
  }
  // Remotion's own headless shell, if a Remotion project is nearby (the lesson 2 kit downloads it)
  const shells = [];
  let d = process.cwd();
  for (const start of [KIT, d]) { let x = start; for (let i = 0; i < 6; i++) { shells.push(path.join(x, 'node_modules/.remotion/chrome-headless-shell')); const up = path.dirname(x); if (up === x) break; x = up; } }
  for (const s of shells) { if (!fs.existsSync(s)) continue; for (const plat of fs.readdirSync(s)) { const dir = path.join(s, plat); if (!fs.statSync(dir).isDirectory()) continue; for (const sub of fs.readdirSync(dir)) { const exe = path.join(dir, sub, process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell'); if (fs.existsSync(exe)) list.push(exe); } } }
  return list.find((p) => fs.existsSync(p)) || null;
}

export function findFfmpeg() {
  const env = process.env.CONNECT_AI_FFMPEG;
  if (env && fs.existsSync(env)) return env;
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['ffmpeg'], {encoding: 'utf8'});
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split(/\r?\n/)[0];
  // the ffmpeg that ships inside Remotion (@remotion/compositor-*)
  const scope = pkgDir('@remotion/renderer'); if (scope) {
    const dir = path.dirname(scope);
    for (const n of fs.readdirSync(dir)) if (n.startsWith('compositor-')) { const exe = path.join(dir, n, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'); if (fs.existsSync(exe)) return exe; }
  }
  return null;
}

export async function openBrowser(opts = {}) {
  const exe = findChrome();
  if (!exe) fail('No Chrome found. Install Google Chrome (or Edge / Chromium), or set CONNECT_AI_CHROME to a Chrome binary.');
  const {default: puppeteer} = await import('puppeteer-core');
  return puppeteer.launch({
    executablePath: exe, headless: opts.headless === false ? false : (/headless-shell/.test(exe) ? 'shell' : true),
    args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--mute-audio', ...(opts.args || [])],
    defaultViewport: null, protocolTimeout: 120000,
  });
}

// close a browser we opened; if Chrome does not answer in 5 s, end our own child process
export async function closeBrowser(br) {
  if (!br) return;
  let t; const proc = br.process && br.process();
  try { await Promise.race([br.close(), new Promise((_, rej) => { t = setTimeout(() => rej(new Error('slow')), 5000); })]); }
  catch { try { proc && proc.kill('SIGKILL'); } catch {} }
  finally { clearTimeout(t); }
}

// 8-bit RGB / RGBA PNG -> {w, h, ch, data}. Enough for our own screenshots.
export function readPng(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || (ct !== 2 && ct !== 6) || d[12] !== 0) throw new Error('unsupported PNG'); }
    else if (type === 'IDAT') idat.push(d); else if (type === 'IEND') break;
    p += 12 + len;
  }
  const ch = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), st = w * ch, out = Buffer.alloc(st * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], row = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)), o = y * st;
    for (let x = 0; x < st; x++) {
      const a = x >= ch ? out[o + x - ch] : 0, b = y ? out[o - st + x] : 0, c = x >= ch && y ? out[o - st + x - ch] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[o + x] = v & 255;
    }
  }
  return {w, h, ch, data: out};
}
export function copyFile(src, dst) { fs.mkdirSync(path.dirname(dst), {recursive: true}); fs.copyFileSync(src, dst); }
export function rmrf(p) { fs.rmSync(p, {recursive: true, force: true}); }
