// eyes: are the eyes of the person in a picture open, and on the camera? Works where face landmarks exist:
// macOS with Swift (Apple Vision). Anywhere else the check says it was skipped. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {KIT} from './tools.mjs';

export const EYES = {closed: 0.17, open: 0.2, down: 0.57};
let swift;
export function eyesAvailable() {
  if (process.env.CONNECT_AI_NO_EYES) return false;
  if (swift !== undefined) return !!swift;
  swift = null;
  if (process.platform !== 'darwin') return false;
  const r = spawnSync('xcrun', ['--find', 'swift'], {encoding: 'utf8', shell: false});
  if (r.status === 0 && r.stdout.trim() && fs.existsSync(r.stdout.trim())) swift = r.stdout.trim();
  return !!swift;
}
// files: pictures (jpg / png). Returns {file: {faces, open, py} | {error}}; an empty object when it cannot run.
export function measureEyes(files) {
  const list = [...new Set(files)].filter((f) => /\.(jpe?g|png|webp|heic|tiff?)$/i.test(f) && fs.existsSync(f));
  if (!list.length || !eyesAvailable()) return {};
  const out = {};
  for (let i = 0; i < list.length; i += 40) {
    const r = spawnSync(swift, [path.join(KIT, 'tools', 'eyes.swift'), ...list.slice(i, i + 40)], {encoding: 'utf8', timeout: 120000, shell: false});
    if (r.status !== 0) return out;
    for (const line of r.stdout.split('\n')) { if (!line.startsWith('{')) continue; try { const j = JSON.parse(line); out[j.file] = j; } catch {} }
  }
  return out;
}
// what one measurement means: 'closed', 'half' (a blink), 'down', 'ok', or null when there is no face to judge
export function eyeVerdict(m) {
  if (!m || m.error || !m.faces || !(m.open >= 0)) return null;
  if (m.open < EYES.closed) return 'closed';
  if (m.open < EYES.open) return 'half';
  if (m.py >= 0 && m.py < EYES.down) return 'down';
  return 'ok';
}
