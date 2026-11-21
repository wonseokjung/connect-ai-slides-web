// record: the deck playing by itself, the website scrolling, and the same on a phone, as mp4.
// Every frame is seeked to its exact time and then captured, so nothing is dropped. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {findFfmpeg} from './tools.mjs';
import {build} from './build.mjs';
import {openBrowser, closeBrowser, openStage, recordStage, stillsOf, contactSheet, ffmpeg, FRAMES} from './shoot.mjs';

export const NO_FFMPEG = 'ffmpeg was not found, so no video can be written. Install it (macOS: `brew install ffmpeg`, Windows: `winget install ffmpeg`, Linux: your package manager) or set CONNECT_AI_FFMPEG to its path. The deck and the site themselves do not need it.';

// one stage, cut into time segments that are recorded by several pages at once and joined without re-encoding
export async function recordFrame(browser, outRoot, frameName, outFile, {fps = 30, jobs = 2, from = 0, to = null, scaleTo = null, crf = 17, onProgress = null} = {}) {
  if (!findFfmpeg()) throw new Error(NO_FFMPEG);
  const first = await openStage(browser, outRoot, frameName);
  const end = to == null ? first.plan.duration : to, total = Math.max(1, Math.round((end - from) * fps));
  const n = Math.max(1, Math.min(jobs, Math.ceil(total / (fps * 4))));       // no point splitting under 4 s
  const per = Math.ceil(total / n), parts = [], tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-rec-'));
  let doneFrames = 0;
  // a page in a background tab gets no animation frames, so every extra job has a browser of its own
  const stages = [first], extra = [];
  try {
    for (let j = 1; j < n; j++) { const br = await openBrowser(); extra.push(br); stages.push(await openStage(br, outRoot, frameName)); }
    await Promise.all(stages.map((st, j) => {
      const a = j * per, b = Math.min(total, a + per); if (a >= b) return null;
      const file = path.join(tmp, `part${String(j).padStart(2, '0')}.mp4`); parts[j] = file;
      return recordStage(st, file, {fps, from: from + a / fps, to: from + b / fps, scaleTo, crf, onProgress: onProgress ? () => { doneFrames += 30; onProgress(Math.min(doneFrames, total), total); } : null});
    }));
    fs.mkdirSync(path.dirname(outFile), {recursive: true});
    const list = parts.filter(Boolean);
    if (list.length === 1) fs.copyFileSync(list[0], outFile);
    else {
      const txt = path.join(tmp, 'list.txt');
      fs.writeFileSync(txt, list.map((p) => `file '${p.split(path.sep).join('/').replace(/'/g, "'\\''")}'`).join('\n'));
      ffmpeg(['-f', 'concat', '-safe', '0', '-i', txt, '-c', 'copy', '-movflags', '+faststart', outFile]);
    }
    return {file: outFile, frames: total, seconds: total / fps, jobs: list.length, plan: first.plan, log: first.log};
  } finally {
    for (const st of stages) await st.page.close().catch(() => {});
    for (const br of extra) await closeBrowser(br);
    fs.rmSync(tmp, {recursive: true, force: true});
  }
}

export async function record(projectDir, opts = {}) {
  const frames = opts.frames && opts.frames.length ? opts.frames : ['deck', 'site'];
  if (!findFfmpeg() && !opts.sheetOnly) throw new Error(NO_FFMPEG);
  const b = opts.built || await build(projectDir, {stages: [...new Set(frames.map((f) => FRAMES[f].stage))]});
  const browser = opts.browser || await openBrowser();
  const out = {files: [], sheets: []};
  try {
    for (const f of frames) {
      if (opts.sheetOnly) { out.sheets.push(await sheetOf(browser, b.out, f)); continue; }
      const file = path.join(b.out, f + '.mp4');
      const r = await recordFrame(browser, b.out, f, file, {fps: opts.fps || 30, jobs: opts.jobs || 2, crf: opts.crf || 17, onProgress: opts.onProgress ? (a, n) => opts.onProgress(f, a, n) : null});
      out.files.push({frame: f, file, seconds: r.seconds, frames: r.frames, width: FRAMES[f].w * FRAMES[f].dpr, height: FRAMES[f].h * FRAMES[f].dpr});
      if (opts.sheet) out.sheets.push(await sheetOf(browser, b.out, f));
    }
  } finally { if (!opts.browser) await closeBrowser(browser); }
  return {...out, out: b.out};
}

// one still per scene (the finished screen), as a contact sheet
export async function sheetOf(browser, outRoot, f, {where = [1]} = {}) {
  const st = await openStage(browser, outRoot, f);
  try {
    const dir = path.join(outRoot, 'stills');
    const stills = await stillsOf(st, dir, {where});
    const sheet = path.join(outRoot, `sheet_${f}.jpg`);
    if (!findFfmpeg()) return dir;      // no ffmpeg: the stills themselves are the result
    contactSheet(stills.map((s) => ({file: s.file, caption: `${s.i + 1} ${s.kind}${where.length > 1 ? ' @' + s.where : ''}`})), sheet, f === 'phone' ? {cols: Math.min(8, stills.length), cellW: 234, cellH: 506} : {cols: Math.min(4, stills.length), cellW: 640, cellH: f === 'deck' ? 360 : 400});
    return sheet;
  } finally { await st.page.close().catch(() => {}); }
}

// one catalog block as a short clip (the gallery uses it): scene i of an open deck page, held a moment at the end
export async function recordBlock(st, i, outFile, {fps = 30, size = [960, 540], crf = 20} = {}) {
  const s = st.plan.schedule[i];
  return recordStage(st, outFile, {fps, from: s.at, to: s.at + s.dur, scaleTo: size, crf});
}
