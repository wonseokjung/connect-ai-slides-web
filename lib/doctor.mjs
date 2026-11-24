// doctor: is this computer ready? Node, a Chrome to measure and record with, ffmpeg for video, the optional Remotion part.
import fs from 'node:fs';
import path from 'node:path';
import {NAME, pkgDir, findChrome, findFfmpeg, readJson} from './tools.mjs';
import {loadCatalog} from './catalog.mjs';

export async function doctor(log = console.log) {
  let ok = true;
  const line = (state, what, how = '') => { log(`  ${state === true ? 'ok  ' : state === false ? 'MISS' : '--  '} ${what}${state !== true && how ? '  -> ' + how : ''}`); if (state === false) ok = false; };
  const major = +process.versions.node.split('.')[0];
  const minor = +process.versions.node.split('.')[1];
  line(major > 18 || (major === 18 && minor >= 18), `Node ${process.versions.node}`, 'install Node 18.18 or newer (the LTS) from nodejs.org');
  for (const [name, why] of [['reveal.js', 'the deck'], ['lenis', 'the website scroll'], ['gsap', 'gsap/* blocks'], ['motion', 'motion/* blocks'], ['animejs', 'anime/* blocks'], ['lottie-web', 'lottie/* blocks'], ['pptxgenjs', 'ppt and export --pptx'], ['jszip', 'PowerPoint timing (clips start by themselves, words fade in)'], ['puppeteer-core', 'check, record, export']]) {
    const d = pkgDir(name); line(!!d, `${name}${d ? ' ' + readJson(path.join(d, 'package.json')).version : ''} (${why})`, 'run npm install in the kit folder');
  }
  const chrome = findChrome();
  line(!!chrome, chrome ? `Chrome: ${chrome}` : 'Chrome (for check, record, export)', 'install Google Chrome, Edge or Chromium, or set CONNECT_AI_CHROME');
  const ff = findFfmpeg();
  line(ff ? true : null, ff ? `ffmpeg: ${ff}` : 'ffmpeg (for the motion clips inside the PowerPoint file, record and the sheets)', 'install ffmpeg or set CONNECT_AI_FFMPEG; without it the PowerPoint file has still pictures behind the words');
  const rem = ['remotion', '@remotion/player', 'react', 'react-dom', 'esbuild'].map((n) => pkgDir(n));
  const rv = rem[0] ? readJson(path.join(rem[0], 'package.json')).version : null;
  line(rem.every(Boolean) ? true : null, rem.every(Boolean) ? `Remotion ${rv} (optional: remotion/* blocks; Remotion License)` : 'Remotion (optional: only remotion/* blocks need it)', 'npm install without --omit=optional if you want remotion/* blocks');
  const cat = loadCatalog();
  const good = cat.filter((m) => m.status === 'ok' && !m.errors.length), bad = cat.filter((m) => m.errors.length);
  line(bad.length === 0, `catalog: ${good.length} blocks ready${cat.length - good.length ? ', ' + (cat.length - good.length) + ' not usable' : ''}`, bad.length ? bad[0].kind + ': ' + bad[0].errors[0] : '');
  log(ok ? `Ready. Try: npx ${NAME} demo` : 'Fix the MISS lines, then run doctor again.');
  return ok;
}
