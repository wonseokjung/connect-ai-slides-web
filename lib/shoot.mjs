// Open a built deck or site in headless Chrome and drive it by exact time. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, spawnSync} from 'node:child_process';
import {fileUrl, findFfmpeg, openBrowser, closeBrowser} from './tools.mjs';

export const FRAMES = {
  deck: {stage: 'deck', w: 1920, h: 1080, dpr: 1, mobile: false, label: 'deck 1920x1080'},
  site: {stage: 'site', w: 1440, h: 900, dpr: 1, mobile: false, label: 'web 1440x900'},
  phone: {stage: 'site', w: 390, h: 844, dpr: 2, mobile: true, label: 'phone 390x844'},
};

export async function openStage(browser, outRoot, frameName, extra = {}) {
  const fr = {...FRAMES[frameName], ...extra};
  const index = path.join(outRoot, fr.stage, 'index.html');
  if (!fs.existsSync(index)) throw new Error('not built: ' + index);
  const page = await browser.newPage();
  await page.setViewport({width: fr.w, height: fr.h, deviceScaleFactor: fr.dpr, isMobile: fr.mobile, hasTouch: fr.mobile});
  const log = {errors: [], external: [], failed: []};
  page.on('pageerror', (e) => log.errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  // nothing leaves this computer while we look: a request to the internet is recorded and stopped
  await page.setRequestInterception(true);
  page.on('request', (r) => { const u = r.url(); if (/^(https?|wss?):/.test(u)) { log.external.push(u); r.abort().catch(() => {}); } else r.continue().catch(() => {}); });
  page.on('requestfailed', (r) => { const u = r.url(); if (!/^https?:/.test(u)) log.failed.push(u.replace(/^.*\/out\//, 'out/')); });
  await page.goto(fileUrl(index) + '?capture=1' + (extra.query || ''), {waitUntil: 'load'});
  try { await page.waitForFunction('window.__cs_ready === true', {timeout: 30000}); }
  catch { await page.close(); throw new Error('The ' + fr.stage + ' page did not start' + (log.errors.length ? ': ' + log.errors[0] : '') + '. Run build again; if it stays, run `doctor`.'); }
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const plan = await page.evaluate(() => CS.capture.prepare());
  return {page, plan, log, frame: fr, name: frameName};
}

// what a phone asks for when the page opens: every file requested until the browser's load event, from disk
// (no cache, no compression: the real download over a server that compresses is smaller). Videos are counted
// apart: a video streams, the page does not wait for it.
export async function firstScreen(browser, outRoot, frameName = 'phone') {
  const fr = FRAMES[frameName];
  const index = path.join(outRoot, fr.stage, 'index.html');
  const page = await browser.newPage();
  try {
    await page.setViewport({width: fr.w, height: fr.h, deviceScaleFactor: fr.dpr, isMobile: fr.mobile, hasTouch: fr.mobile});
    await page.setCacheEnabled(false);
    const seen = new Set();
    let loaded = false;
    await page.setRequestInterception(true);
    page.on('request', (r) => { const u = r.url(); if (/^(https?|wss?):/.test(u)) { r.abort().catch(() => {}); return; } if (!loaded && u.startsWith('file:')) seen.add(u.split(/[?#]/)[0]); r.continue().catch(() => {}); });
    await page.goto(fileUrl(index), {waitUntil: 'load', timeout: 60000});
    loaded = true;
    const files = [...seen].map((u) => { try { const f = fileURLToPath(u); return {f, size: fs.statSync(f).size}; } catch { return null; } }).filter(Boolean);
    const isVid = (f) => /\.(mp4|webm|mov|m4v)$/i.test(f);
    const kinds = {};
    for (const x of files) if (!isVid(x.f)) { const k = /\.(js|mjs)$/i.test(x.f) ? 'scripts' : /\.css$/i.test(x.f) ? 'styles' : /\.(woff2?|ttf|otf)$/i.test(x.f) ? 'fonts' : /\.(json)$/i.test(x.f) ? 'animation data' : /\.html?$/i.test(x.f) ? 'page' : 'pictures'; kinds[k] = (kinds[k] || 0) + x.size; }
    const bytes = files.filter((x) => !isVid(x.f)).reduce((a, x) => a + x.size, 0);
    return {bytes, files: files.length, videos: files.filter((x) => isVid(x.f)).length, kinds};
  } finally { await page.close().catch(() => {}); }
}

export function ffmpeg(args, opts = {}) {
  const exe = findFfmpeg();
  if (!exe) throw new Error('ffmpeg not found. Install ffmpeg, or set CONNECT_AI_FFMPEG.');
  const r = spawnSync(exe, ['-v', 'error', '-y', ...args], {encoding: 'utf8', ...opts, shell: false, windowsHide: true});
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + (r.stderr || '').slice(-600));
  return r;
}

// frames of one stage -> mp4 (h264, yuv420p, bt709, faststart). Exact seek per frame, nothing is dropped.
export async function recordStage(st, outFile, {fps = 30, from = 0, to = null, scaleTo = null, onProgress = null, crf = 17} = {}) {
  const exe = findFfmpeg(); if (!exe) throw new Error('ffmpeg not found. Install ffmpeg, or set CONNECT_AI_FFMPEG.');
  const end = to == null ? st.plan.duration : to, n = Math.max(1, Math.round((end - from) * fps));
  const W = st.frame.w * st.frame.dpr, H = st.frame.h * st.frame.dpr;
  // screenshots are full-range JPEG; players (QuickTime, phones) want limited-range yuv420p
  let vf = (scaleTo ? `scale=${scaleTo[0]}:${scaleTo[1]}:flags=lanczos:` : 'scale=') + 'in_range=pc:out_range=tv,format=yuv420p';
  if (!scaleTo && (W % 2 || H % 2)) vf = 'crop=trunc(iw/2)*2:trunc(ih/2)*2,' + vf;
  fs.mkdirSync(path.dirname(outFile), {recursive: true});
  const ff = spawn(exe, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-color_range', 'tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', '-an', outFile], {stdio: ['pipe', 'ignore', 'pipe'], shell: false, windowsHide: true});
  let err = ''; ff.stderr.on('data', (d) => (err += d));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg: ' + err.slice(-500))))));
  // every frame is seeked, checked and captured; a frame that cannot be made stops the recording (no silent gaps)
  const stop = (msg) => { try { ff.stdin.destroy(); ff.kill(); } catch {} done.catch(() => {}); fs.rmSync(outFile, {force: true}); return new Error(msg); };
  for (let f = 0; f < n; f++) {
    const t = from + f / fps;
    let problems, buf;
    try { problems = await st.page.evaluate(async (t) => { await CS.capture.seek(t); return CS.problems.length ? CS.problems.slice() : null; }, t); }
    catch (e) { throw stop(`Recording stopped at ${t.toFixed(2)} s: the page could not be moved to that time (${String(e.message).split('\n')[0]}).`); }
    if (problems) throw stop(`Recording stopped at ${t.toFixed(2)} s: ${problems[0]}. Nothing was written, so there is no clip with missing frames.`);
    try { buf = await st.page.screenshot({type: 'jpeg', quality: 93, optimizeForSpeed: true}); }
    catch (e) { throw stop(`Recording stopped at ${t.toFixed(2)} s: the frame could not be captured (${String(e.message).split('\n')[0]}).`); }
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (onProgress && f % 30 === 0) onProgress(f, n);
  }
  ff.stdin.end(); await done;
  return {frames: n, seconds: n / fps, file: outFile};
}

// stills -> one contact sheet with a caption under each
export function contactSheet(items, outFile, {cols = 4, cellW = 480, cellH = 270, title = ''} = {}) {
  // items: [{file, caption}]
  const dir = path.dirname(outFile), tmp = path.join(dir, '.sheet_' + process.pid);
  fs.mkdirSync(tmp, {recursive: true});
  const font = ['/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/Supplemental/Arial.ttf', 'C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'].find((f) => fs.existsSync(f));
  items.forEach((it, i) => {
    const cap = String(it.caption || '').replace(/[':\\%]/g, ' ').slice(0, 60);
    const draw = font ? `,drawtext=fontfile='${font.replace(/:/g, '\\:')}':text='${cap}':x=12:y=h-26:fontsize=17:fontcolor=0xEBE2D2` : '';
    ffmpeg(['-i', it.file, '-vf', `scale=${cellW}:${cellH}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${cellW}:${cellH + 34}:(ow-iw)/2:0:color=0x0B0A08${draw}`, '-frames:v', '1', path.join(tmp, String(i).padStart(4, '0') + '.png')]);
  });
  const rows = Math.ceil(items.length / cols);
  ffmpeg(['-framerate', '1', '-i', path.join(tmp, '%04d.png'), '-vf', `tile=${cols}x${rows}:padding=6:margin=6:color=0x0B0A08`, '-frames:v', '1', '-q:v', '3', outFile]);
  fs.rmSync(tmp, {recursive: true, force: true});
  return outFile;
}

export async function stillsOf(st, dir, {where = [1], prefix = '', type = 'png', only = null} = {}) {
  fs.mkdirSync(dir, {recursive: true});
  const out = [];
  for (let i = 0; i < st.plan.schedule.length; i++) for (const w of where) {
    if (only && !only.includes(i)) continue;
    await st.page.evaluate((i, w) => CS.capture.goto(i, w), i, w);
    const file = path.join(dir, `${prefix}${st.name}_${String(i + 1).padStart(2, '0')}_${Math.round(w * 100)}.${type === 'jpeg' ? 'jpg' : 'png'}`);
    await st.page.screenshot(type === 'jpeg' ? {path: file, type: 'jpeg', quality: 90} : {path: file, type: 'png'});
    out.push({file, i, where: w, kind: st.plan.schedule[i].kind, id: st.plan.schedule[i].id});
  }
  return out;
}
export {openBrowser, closeBrowser};
