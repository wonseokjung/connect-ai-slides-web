// Writes the kit's own Lottie files (catalog/lottie/<block>/anim.json): plain shape layers, brand colours, thin strokes. CC0.
// Run: node tools/make-lottie.mjs. Any Lottie .json from After Effects (Bodymovin) or LottieFiles plays the same way (lottie/player).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const KIT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).concat(1);
const GOLD = rgb('#D6892A'), GOLD2 = rgb('#F2B45A'), IVORY = rgb('#EBE2D2');
const st = (v) => ({a: 0, k: v});
const key = (pairs, ease = [0.16, 1]) => ({a: 1, k: pairs.map(([t, s], i) => (i < pairs.length - 1 ? {t, s: [].concat(s), i: {x: [0.3], y: [ease[1]]}, o: {x: [ease[0]], y: [0]}} : {t, s: [].concat(s)}))});
const tr = (extra = {}) => ({ty: 'tr', p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0), nm: 'Transform', ...extra});
const stroke = (c, w, o = st(100)) => ({ty: 'st', c: st(c), o, w: st(w), lc: 2, lj: 2, ml: 4, nm: 'Stroke'});
const fill = (c, o = st(100)) => ({ty: 'fl', c: st(c), o, r: 1, nm: 'Fill'});
const trim = (e, s = st(0)) => ({ty: 'tm', s, e, o: st(0), m: 1, nm: 'Trim'});
const layer = (ind, nm, shapes, ks = {}, op = 90) => ({ddd: 0, ind, ty: 4, nm, sr: 1, ks: {o: st(100), r: st(0), p: st([200, 200, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks}, ao: 0, shapes, ip: 0, op, st: 0, bm: 0});
const anim = (nm, op, layers) => ({v: '5.7.4', fr: 30, ip: 0, op, w: 400, h: 400, nm, ddd: 0, assets: [], layers});
const ellipse = (d, p = [0, 0]) => ({ty: 'el', d: 1, s: st([d, d]), p: st(p), nm: 'Ellipse'});
const pathOf = (v) => ({ty: 'sh', ks: st({i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: false}), nm: 'Path'});
const group = (nm, ...it) => ({ty: 'gr', nm, it});

// block folder -> animation
const files = {
  // a tick inside a ring: lottie/check-list
  'check-list': anim('gold-check', 75, [
    layer(1, 'tick', [{ty: 'gr', nm: 'tick', it: [pathOf([[-62, 4], [-18, 46], [70, -46]]), trim(key([[16, 0], [38, 100]])), stroke(IVORY, 12), tr()]}], {}, 75),
    layer(2, 'ring', [{ty: 'gr', nm: 'ring', it: [ellipse(300), trim(key([[0, 0], [26, 100]])), stroke(GOLD, 5), tr()]}], {r: st(-90)}, 75),
    layer(3, 'halo', [{ty: 'gr', nm: 'halo', it: [ellipse(300), stroke(GOLD, 2, key([[24, 0], [30, 60], [60, 0]])), tr({s: key([[24, [100, 100]], [60, [128, 128]]])})]}], {}, 75),
  ]),
  // three arcs draw on their orbits, turn and settle; a small core appears: lottie/player
  'player': anim('orbit-settle', 90, [
    layer(1, 'bead', [group('bead', ellipse(20, [0, -100]), fill(GOLD2), tr())], {r: key([[6, -140], [80, 150]], [0.2, 1]), o: key([[6, 0], [16, 100]])}, 90),
    layer(2, 'core dot', [group('dot', ellipse(14), fill(IVORY), tr())], {s: key([[46, [0, 0, 100]], [66, [100, 100, 100]]])}, 90),
    layer(3, 'core ring', [group('ring', ellipse(66), stroke(GOLD, 2.5), tr())], {s: key([[36, [0, 0, 100]], [62, [100, 100, 100]]])}, 90),
    layer(4, 'arc gold', [group('arc', ellipse(290), trim(key([[6, 0], [48, 34]])), stroke(GOLD, 6), tr())], {r: key([[4, -200], [82, 40]], [0.2, 1])}, 90),
    layer(5, 'arc ivory', [group('arc', ellipse(200), trim(key([[14, 0], [56, 24]])), stroke(IVORY, 3, st(80)), tr())], {r: key([[10, 150], [80, -50]], [0.2, 1])}, 90),
    layer(6, 'arc far', [group('arc', ellipse(356), trim(key([[20, 0], [62, 13]])), stroke(GOLD2, 2, st(75)), tr())], {r: key([[16, -60], [86, 120]], [0.2, 1])}, 90),
    layer(7, 'track outer', [group('track', ellipse(290), trim(key([[0, 0], [30, 100]])), stroke(IVORY, 1.5, st(20)), tr())], {r: st(-90)}, 90),
    layer(8, 'track inner', [group('track', ellipse(200), trim(key([[8, 0], [38, 100]])), stroke(IVORY, 1.5, st(14)), tr())], {r: st(90)}, 90),
  ]),
  // a large open arc, a thinner one inside, five ticks and a marker: lottie/stroke-title
  'stroke-title': anim('arc-mark', 66, [
    layer(1, 'marker', [group('marker', ellipse(24, [0, -165]), fill(GOLD2), tr())], {r: st(118), s: key([[30, [0, 0, 100]], [42, [130, 130, 100]], [52, [100, 100, 100]]])}, 66),
    ...[0, 1, 2, 3, 4].map((i) => layer(2 + i, 'tick' + i, [group('tick', pathOf([[0, -183], [0, -199]]), trim(key([[16 + i * 4, 0], [26 + i * 4, 100]])), stroke(IVORY, 2.5, st(85)), tr())], {r: st(-64 + i * 22)}, 66)),
    layer(7, 'arc big', [group('arc', ellipse(330), trim(key([[0, 0], [36, 62]])), stroke(GOLD, 4.5), tr())], {r: st(-105)}, 66),
    layer(8, 'arc thin', [group('arc', ellipse(250), trim(key([[8, 0], [44, 44]])), stroke(IVORY, 2, st(70)), tr())], {r: st(96)}, 66),
  ]),
};

for (const [folder, j] of Object.entries(files)) {
  const d = path.join(KIT, 'catalog', 'lottie', folder);
  fs.mkdirSync(d, {recursive: true});
  fs.writeFileSync(path.join(d, 'anim.json'), JSON.stringify(j));
  console.log(path.join('catalog', 'lottie', folder, 'anim.json'));
}
