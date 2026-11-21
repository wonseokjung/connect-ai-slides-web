// A wall of pictures and clips: one or two large tiles and several small ones fill the whole frame.
// The tiles open one after another, each from its own side, and every picture keeps pushing in very slowly.
// The title lives in a tile of its own, never on a picture. One tile (or more) can be a video. Two columns on a phone.
export const css = `
.b-kit-mosaic .wall { position: absolute; inset: 0; padding: calc(var(--gap) * 0.26); display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr)); gap: calc(var(--gap) * 0.26); }
.b-kit-mosaic .tile { position: relative; overflow: hidden; border-radius: calc(var(--radius) * 0.22); background: #000; min-width: 0; min-height: 0; will-change: clip-path; box-shadow: 0 0 0 1px var(--line); }
.b-kit-mosaic .tile > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-kit-mosaic .words { position: relative; min-width: 0; min-height: 0; padding: calc(var(--gap) * 0.5) calc(var(--gap) * 0.9); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.36); }
.b-kit-mosaic .words .line { display: block; width: calc(var(--title) * 0.9); height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-mosaic .words .cs-kicker { letter-spacing: 0.3em; }
.b-kit-mosaic .words h2 { font-size: calc(var(--title) * 0.62); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.02; color: var(--ink); text-wrap: balance; }
.b-kit-mosaic .words p { font-size: calc(var(--body) * 0.8); line-height: 1.34; color: var(--dim); text-wrap: pretty; }
.cs-frame[data-stage="deck"] .b-kit-mosaic .words .cs-kicker { font-size: calc(var(--label) * 0.82); }
.cs-frame[data-stage="site"] .b-kit-mosaic .words p { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .wall { top: var(--top); grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(8, minmax(0, 1fr)); padding: calc(var(--gap) * 0.5); gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .words { padding: 0 calc(var(--pad) * 0.6); gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .words h2 { font-size: calc(var(--title) * 0.86); }
`;
// tiles on a 12 x 6 grid as [column, row, columns, rows]; the last entry is the tile for the words
const WIDE = {
  3: [[1, 1, 8, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  4: [[1, 1, 5, 6], [6, 1, 3, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  5: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  6: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 4, 2], [9, 3, 4, 2]],
  7: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 2, 2], [11, 5, 2, 2], [9, 3, 4, 2]],
  8: [[1, 1, 5, 4], [1, 5, 2, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 2, 2], [11, 5, 2, 2], [3, 5, 3, 2], [9, 3, 4, 2]],
};
// the phone wall: 2 columns x 8 rows, the first picture and the words are full width
const TALL = {
  3: [[1, 1, 2, 2], [1, 5, 1, 4], [2, 5, 1, 4], [1, 3, 2, 2]],
  4: [[1, 1, 2, 2], [1, 5, 1, 4], [2, 5, 1, 2], [2, 7, 1, 2], [1, 3, 2, 2]],
  5: [[1, 1, 2, 2], [1, 5, 1, 3], [2, 5, 1, 2], [2, 7, 1, 2], [1, 8, 1, 1], [1, 3, 2, 2]],
  6: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 2], [2, 7, 1, 2], [1, 3, 2, 2]],
  7: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 1], [2, 7, 1, 2], [1, 8, 1, 1], [1, 3, 2, 2]],
  8: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 1], [2, 7, 1, 1], [2, 8, 1, 1], [1, 8, 1, 1], [1, 3, 2, 2]],
};
export default function mount(el, p, cx) {
  const items = (p.items || []).map((it) => (typeof it === 'string' ? {src: it} : it)).slice(0, 8), n = cx.clamp(items.length, 3, 8), tall = cx.shape === 'tall';
  const lay = (tall ? TALL : WIDE)[n], area = (a) => `grid-area:${a[1]} / ${a[0]} / span ${a[3]} / span ${a[2]}`;
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 6, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || 'Picture')}" style="object-position:${pos(it)}">`);
  el.innerHTML = `<div class="wall">
    ${items.slice(0, n).map((it, i) => `<div class="tile" style="${area(lay[i])}">${tag(it)}</div>`).join('')}
    <div class="words" style="${area(lay[n])}">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2>${cx.esc(p.title)}</h2>` : ''}
      <i class="line" aria-hidden="true"></i>
      ${p.text ? `<p>${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const tiles = Array.from(el.querySelectorAll('.tile')), media = tiles.map((t) => t.firstElementChild);
  const from = ['inset(0% 100% 0% 0%)', 'inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 100%)', 'inset(0% 0% 100% 0%)'];
  const each = 0.12, t0 = 0.1, open = 0.95, total = t0 + each * (n - 1) + open + 0.75;
  tiles.forEach((t, i) => {
    const d = t0 + each * i, person = Array.isArray(items[i].face);
    if (person) { cx.face(media[i], items[i].face); if (Array.isArray(items[i].body)) cx.face(media[i], items[i].body, 'body'); }
    cx.wa(t, [{clipPath: from[i % 4]}, {clipPath: 'inset(0% 0% 0% 0%)'}], {duration: open, delay: d, ease: 'cubic-bezier(.7,0,.15,1)'});
    // settles as the tile opens, then keeps pushing in by 2 % until the end (a person is never shown larger than the picture)
    if (!person) cx.wa(media[i], [{transform: 'scale(1.09)', easing: 'cubic-bezier(.16,1,.3,1)'}, {transform: 'scale(1)', offset: 0.45, easing: 'linear'}, {transform: 'scale(1.02)'}], {duration: total - d, delay: d, ease: 'linear'});
  });
  const tw = t0 + each * Math.min(n, 4);
  const w = el.querySelectorAll('.words > :not(.line)');
  cx.wa(w, [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: tw, stagger: 0.12});
  cx.wa(el.querySelector('.line'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.8, delay: tw + 0.2});
  const clip = cx.fromWaapi(el, {dur: total});
  const vids = media.filter((m) => m.tagName === 'VIDEO').map((v) => cx.fromVideo(v));
  return vids.length ? cx.all.apply(null, [clip].concat(vids)) : clip;
}
