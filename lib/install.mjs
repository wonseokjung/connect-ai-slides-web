// Skill installer: copies skill/ into each agent's skills folder. Only a folder copy; agent settings are not touched.
// Same installer as connect-ai-motion, connect-ai-writer and connect-ai-video-motion (CONNECT AI LAB, MIT): marker file, no symlinks on
// the path, remove only our own folder, and a kit copy that stays (the runtime) so the skill never points into the npx cache.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {KIT_NAME, KIT, REPO} from './name.mjs';

const MARKER = '.connect-ai-slides-web.json';
export const VERSION = JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8')).version;

// ---------- the runtime: a copy of the kit that stays ----------
// npx keeps its download in a cache folder that npm may clean at any time. install-skill copies the kit to
// ~/.connect-ai/connect-ai-slides-web/<version>/ (or $CONNECT_AI_HOME/...), installs the exact dependency versions of
// npm-shrinkwrap.json there with `npm ci --omit=dev`, and the skill calls that folder's bin/cli.mjs by its full path.
export const runtimeRoot = ({home = os.homedir(), env = process.env} = {}) => path.join(env.CONNECT_AI_HOME || path.join(home, '.connect-ai'), KIT_NAME);
export const inNpxCache = (dir) => /[\\/]_npx[\\/]/.test(dir);
const sha = (f) => (fs.existsSync(f) ? crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16) : '');

// npm itself, started by node with an argument list (no shell, also on Windows where npm is a .cmd file)
export function npmCli({env = process.env, execPath = process.execPath} = {}) {
  const dir = path.dirname(execPath);
  const cand = [env.npm_execpath && /npm-cli\.js$/.test(env.npm_execpath) ? env.npm_execpath : '',
    env.npm_execpath ? path.join(path.dirname(env.npm_execpath), 'npm-cli.js') : '',
    path.join(dir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(dir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')].filter(Boolean);
  return cand.find((f) => fs.existsSync(f)) || null;
}
function defaultNpm(args, {cwd}) {
  const cli = npmCli();
  // on Windows npm without its npm-cli.js is a .cmd file, which Node does not start without a shell: say so instead
  if (!cli && process.platform === 'win32') return {code: 1, out: 'npm error could not find npm-cli.js next to node.exe; run install-skill from a normal Node.js install (nodejs.org) or with npx'};
  const r = cli
    ? spawnSync(process.execPath, [cli, ...args], {cwd, encoding: 'utf8', timeout: 15 * 60 * 1000, shell: false, windowsHide: true})
    : spawnSync('npm', args, {cwd, encoding: 'utf8', timeout: 15 * 60 * 1000, shell: false, windowsHide: true});
  return {code: r.error ? 1 : r.status, out: ((r.stdout || '') + (r.stderr || '') + (r.error ? r.error.message : '')).trim()};
}

// the runtime folder is only ever cleaned when it is a real folder (no link on the way) that is empty or ours
function ownRuntimeDir(dir, top) {
  for (let d = dir; ; d = path.dirname(d)) {
    if (fs.existsSync(d) && fs.lstatSync(d).isSymbolicLink()) throw new Error(`${d} is a link: install-skill does not write through links. Remove it or set CONNECT_AI_HOME to another folder.`);
    if (d === top || path.dirname(d) === d) break;
  }
  if (!fs.existsSync(dir)) return;
  if (!fs.lstatSync(dir).isDirectory()) throw new Error(`${dir} is a file, not the runtime folder. Move it away first.`);
  const items = fs.readdirSync(dir);
  let ours = items.includes('.runtime.json') || items.includes('.runtime-making');
  if (!ours && items.includes('package.json')) { try { ours = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name === KIT_NAME; } catch {} }
  if (items.length && !ours) throw new Error(`${dir} holds files that are not this kit. Nothing was removed; move them away first.`);
}

export function installRuntime({home = os.homedir(), env = process.env, kit = KIT, npm = defaultNpm, log = console.log, dryRun = false} = {}) {
  const dir = path.join(runtimeRoot({home, env}), VERSION);
  const bin = path.join(dir, 'bin', 'cli.mjs');
  if (dryRun) { log(`  runtime: ${dir}  (dry run)`); return {dir, bin, dry: true}; }
  if (path.resolve(kit) === path.resolve(dir)) return {dir, bin};
  const pkg = JSON.parse(fs.readFileSync(path.join(kit, 'package.json'), 'utf8'));
  const lock = ['npm-shrinkwrap.json', 'package-lock.json'].map((f) => path.join(kit, f)).find((f) => fs.existsSync(f));
  const keepModules = !!lock && fs.existsSync(path.join(dir, 'node_modules')) && sha(path.join(dir, path.basename(lock))) === sha(lock) && fs.existsSync(path.join(dir, '.runtime.json'));
  ownRuntimeDir(dir, env.CONNECT_AI_HOME ? path.resolve(env.CONNECT_AI_HOME) : home);
  // a half-made copy (stopped while npm was running) has no .runtime.json: it is made again
  for (const e of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (!(keepModules && e === 'node_modules')) fs.rmSync(path.join(dir, e), {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, '.runtime-making'), KIT_NAME + '\n');
  for (const f of [...new Set([...(pkg.files || []).filter((x) => !x.startsWith('!')), 'package.json'])]) {
    const src = path.join(kit, f.replace(/\/$/, ''));
    if (!fs.existsSync(src)) continue;
    const d = path.join(dir, f.replace(/\/$/, ''));
    if (fs.statSync(src).isDirectory()) copyDir(src, d);
    else { fs.mkdirSync(path.dirname(d), {recursive: true}); fs.copyFileSync(src, d); }
  }
  if (lock) fs.copyFileSync(lock, path.join(dir, path.basename(lock)));
  if (!keepModules) {
    const args = lock ? ['ci', '--omit=dev', '--no-audit', '--no-fund', '--prefer-offline'] : ['install', '--omit=dev', '--no-audit', '--no-fund', '--prefer-offline'];
    log(`  runtime: ${dir}`);
    log(`    npm ${args[0]} --omit=dev (the motion libraries and PptxGenJS, once for this version)...`);
    const r = npm(args, {cwd: dir});
    if (r.code !== 0) {
      fs.rmSync(dir, {recursive: true, force: true});
      const why = String(r.out).split('\n').filter((l) => /npm (error|ERR)/.test(l)).slice(0, 3).join(' ') || String(r.out).split('\n').slice(-4).join(' ');
      throw new Error(`npm ${args[0]} in ${dir} failed: ${why}`);
    }
  } else log(`  runtime: ${dir}  (already there)`);
  fs.rmSync(path.join(dir, '.runtime-making'), {force: true});
  fs.writeFileSync(path.join(dir, '.runtime.json'), JSON.stringify({package: KIT_NAME, version: VERSION, from: inNpxCache(kit) ? 'npx' : 'folder', made: new Date().toISOString()}, null, 2) + '\n');
  return {dir, bin};
}

// the skill file says where the kit lives on THIS computer, so the agent never depends on the npx cache
export function pinSkill(skillMd, {bin, fallback, kit}) {
  const block = `<!-- connect-ai-slides-web:runtime -->\nOn this computer the kit is the folder \`${kit}\` (\`<kit>\` below) and its CLI runs as \`node ${JSON.stringify(bin)}\`. If that file is gone, use \`${fallback}\` instead of \`node <kit>/bin/cli.mjs\`.\n<!-- /connect-ai-slides-web:runtime -->`;
  const re = /<!-- connect-ai-slides-web:runtime -->[\s\S]*?<!-- \/connect-ai-slides-web:runtime -->/;
  return re.test(skillMd) ? skillMd.replace(re, () => block) : skillMd;
}

export function agentTable({home = os.homedir(), env = process.env} = {}) {
  const claude = env.CLAUDE_CONFIG_DIR || path.join(home, '.claude');
  const codex = env.CODEX_HOME || path.join(home, '.codex');
  const shared = path.join(home, '.agents', 'skills');
  return [
    {key: 'claude', label: 'Claude Code', detect: [claude], skills: path.join(claude, 'skills')},
    {key: 'codex', label: 'Codex', detect: [codex, path.join(shared, KIT_NAME, MARKER)], skills: shared},
    {key: 'antigravity', label: 'Antigravity', detect: [path.join(home, '.gemini', 'config'), path.join(home, '.gemini', 'antigravity'), path.join(home, '.antigravity')], skills: path.join(home, '.gemini', 'config', 'skills')},
    {key: 'cursor', label: 'Cursor', detect: [path.join(home, '.cursor')], skills: path.join(home, '.cursor', 'skills')},
    {key: 'gemini', label: 'Gemini CLI', detect: [path.join(home, '.gemini', 'settings.json')], skills: shared},
  ];
}
const exists = (p) => {
  try { fs.lstatSync(p); return true; } catch { return false; }
};
const isLink = (p) => {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
};
function linkOnPath(dest, home) {
  let p = path.resolve(dest);
  const stop = path.resolve(home);
  for (let i = 0; i < 12 && p !== stop && p !== path.dirname(p); i++) {
    if (isLink(p)) return p;
    p = path.dirname(p);
  }
  return '';
}
const mine = (dir) => {
  try { return JSON.parse(fs.readFileSync(path.join(dir, MARKER), 'utf8')).package === KIT_NAME; } catch { return false; }
};
function copyDir(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  let n = 0;
  for (const e of fs.readdirSync(src, {withFileTypes: true})) {
    if (e.name === '.DS_Store') continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) n += copyDir(s, d);
    else if (e.isFile()) { fs.copyFileSync(s, d); n++; }
  }
  return n;
}

function targets({agent = 'all', dir = null, project = false, home = os.homedir(), env = process.env} = {}) {
  const table = agentTable({home, env});
  let picked = [];
  if (dir) picked.push({label: 'folder you gave', skills: path.resolve(dir)});
  if (project) picked.push({label: 'this project', skills: path.join(process.cwd(), '.claude', 'skills')});
  if (!picked.length) {
    // an agent counts when its folder is there, or when our skill is already in its skills folder (an update)
    let keys = agent === 'all' ? table.filter((a) => a.detect.some(exists) || exists(path.join(a.skills, KIT_NAME, MARKER))).map((a) => a.key) : agent.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const unknown = agent === 'all' ? [] : keys.filter((k) => !table.some((a) => a.key === k));
    if (unknown.length) throw new Error(`unknown agent: ${unknown.join(', ')}. Use ${table.map((a) => a.key).join(', ')}, or --dir <folder>.`);
    if (agent === 'all' && !keys.length) {
      // Fresh computer: no agent folder yet (e.g. Antigravity just installed). Use the agent that is running us,
      // or else the three folders a beginner most likely has. Only our own folder is created, nothing else is touched.
      const caller = env.CLAUDECODE ? 'claude' : Object.keys(env).some((k) => k.startsWith('CODEX_')) ? 'codex'
        : Object.keys(env).some((k) => /^ANTIGRAVITY|^GEMINI_CLI/.test(k)) ? 'antigravity' : '';
      keys = caller ? [caller] : ['antigravity', 'claude', 'codex'];
    }
    picked = keys.map((k) => table.find((a) => a.key === k)).filter(Boolean);
  }
  const merged = [];
  for (const p of picked) {
    const hit = merged.find((m) => m.skills === p.skills);
    if (hit) hit.label += ', ' + p.label;
    else merged.push({...p});
  }
  return merged.map((m) => ({...m, dest: path.join(m.skills, KIT_NAME)}));
}

export function installSkill({agent, dir, project, dryRun, log = console.log, home = os.homedir(), env = process.env, runtime = true, npm, kit = KIT} = {}) {
  const ver = VERSION;
  const list = targets({agent, dir, project, home, env});
  if (!list.length) { log('No agent found. Use --agent claude|codex|antigravity|cursor or --dir <folder>.'); return list; }
  // --no-runtime: the skill points at this kit folder as it is (a clone you keep), no copy is made
  const rt = runtime ? installRuntime({home, env, kit, npm, log, dryRun}) : {dir: kit, bin: path.join(kit, 'bin', 'cli.mjs')};
  const fallback = `npx -y github:${REPO}`;     // not on npm yet: the GitHub copy
  for (const t of list) {
    let action = !exists(t.dest) ? 'install' : mine(t.dest) ? 'update' : 'skip';
    if (linkOnPath(t.dest, home)) action = 'blocked';
    log(`  ${t.label}: ${t.dest}  ${action}${action === 'skip' ? ' (another folder with this name is there)' : action === 'blocked' ? ' (symbolic link on the path, not touched)' : ''}`);
    t.action = action;
    if (dryRun || action === 'skip' || action === 'blocked') continue;
    if (action === 'update') fs.rmSync(t.dest, {recursive: true, force: true});
    let n = copyDir(path.join(kit, 'skill'), t.dest);
    if (fs.existsSync(path.join(kit, 'NOTICE.md'))) { fs.copyFileSync(path.join(kit, 'NOTICE.md'), path.join(t.dest, 'NOTICE.md')); n++; }
    if (fs.existsSync(path.join(kit, 'docs', 'BLOCKS.md'))) { fs.copyFileSync(path.join(kit, 'docs', 'BLOCKS.md'), path.join(t.dest, 'BLOCKS.md')); n++; }
    const skillMd = path.join(t.dest, 'SKILL.md');
    fs.writeFileSync(skillMd, pinSkill(fs.readFileSync(skillMd, 'utf8'), {bin: rt.bin, fallback, kit: rt.dir}));
    fs.writeFileSync(path.join(t.dest, MARKER), JSON.stringify({package: KIT_NAME, version: ver, kit: rt.dir, bin: rt.bin, installedAt: new Date().toISOString(), run: `node ${JSON.stringify(rt.bin)}`, fallback}, null, 2) + '\n');
    log(`    ${n} file${n === 1 ? '' : 's'} (the skill your agent reads)`);
    t.done = true;
  }
  return list;
}

export function removeSkill({agent, dir, project, dryRun, log = console.log, home = os.homedir(), env = process.env} = {}) {
  for (const t of targets({agent, dir, project, home, env})) {
    if (!exists(t.dest)) continue;
    const ok = mine(t.dest) && !linkOnPath(t.dest, home);
    log(`  ${t.dest}  ${ok ? 'remove' : 'keep (not ours)'}`);
    if (ok && !dryRun) fs.rmSync(t.dest, {recursive: true, force: true});
  }
}
