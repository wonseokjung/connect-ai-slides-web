// Two pictures or clips side by side, edge to edge: a thin gold line is drawn down the middle and the two halves open away from it.
// Each half has its own label under the picture; a small title sits above. For "the same thing in two places" and for comparisons.
// Nothing is drawn on the pictures. On a phone the halves are stacked.
export const css = `
.b-kit-split-film .wrap { position: absolute; inset: 0; padding-top: var(--top); display: grid; grid-template-rows: auto minmax(0, 1fr); }
.b-kit-split-film .hd { display: flex; align-items: baseline; justify-content: space-between; gap: var(--gap); padding: calc(var(--pad) * 0.36) calc(var(--pad) * 0.56) calc(var(--pad) * 0.3); }
.b-kit-split-film .cs-kicker { letter-spacing: 0.3em; }
.b-kit-split-film .hd h2 { font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.1; color: var(--ink); text-align: right; text-wrap: balance; }
.b-kit-split-film .pair { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); min-height: 0; }
.b-kit-split-film .half { display: grid; grid-template-rows: minmax(0, 1fr) auto; min-width: 0; min-height: 0; }
.b-kit-split-film .m { position: relative; overflow: hidden; background: #000; will-change: clip-path; }
.b-kit-split-film .m > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-kit-split-film .mid { display: block; width: 2px; background: var(--gold); transform-origin: 50% 0; }
.b-kit-split-film .cap { padding: calc(var(--pad) * 0.3) calc(var(--pad) * 0.56) calc(var(--pad) * 0.4); display: grid; grid-template-columns: auto 1fr; align-items: baseline; column-gap: calc(var(--gap) * 0.6); row-gap: calc(var(--gap) * 0.16); }
.b-kit-split-film .cap .n { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); }
.b-kit-split-film .cap .l { font-size: calc(var(--lead) * 1.1); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.1; color: var(--ink); }
.b-kit-split-film .cap .d { grid-column: 2; font-size: calc(var(--body) * 0.8); line-height: 1.34; color: var(--dim); }
.cs-frame[data-stage="deck"] .b-kit-split-film .cs-kicker { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-stage="site"] .b-kit-split-film .cap .d { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-split-film .hd { flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.4); padding: calc(var(--pad) * 0.7) var(--pad) calc(var(--pad) * 0.7); }
.cs-frame[data-shape="tall"] .b-kit-split-film .hd h2 { text-align: left; font-size: calc(var(--lead) * 1.3); }
.cs-frame[data-shape="tall"] .b-kit-split-film .pair { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr); }
.cs-frame[data-shape="tall"] .b-kit-split-film .mid { width: 100%; height: 2px; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-split-film .cap { padding: calc(var(--pad) * 0.5) var(--pad) calc(var(--pad) * 0.7); }
`;
export default function mount(el, p, cx) {
  const tall = cx.shape === 'tall', sides = [p.left || {}, p.right || {}];
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 6, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || it.label || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.label || 'Picture')}" style="object-position:${pos(it)}">`);
  const half = (it, i) => `<div class="half"><div class="m">${tag(it)}</div><div class="cap"><span class="n cs-num">0${i + 1}</span><span class="l">${cx.esc(it.label || '')}</span>${it.text ? `<span class="d">${cx.esc(it.text)}</span>` : ''}</div></div>`;
  el.innerHTML = `<div class="wrap">
    <div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : '<span></span>'}${p.title ? `<h2>${cx.esc(p.title)}</h2>` : ''}</div>
    <div class="pair">${half(sides[0], 0)}<i class="mid" aria-hidden="true"></i>${half(sides[1], 1)}</div>
  </div>`;
  const q = (s) => el.querySelector(s), ms = Array.from(el.querySelectorAll('.m')), media = ms.map((m) => m.firstElementChild), caps = Array.from(el.querySelectorAll('.cap'));
  sides.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(media[i], it.face); if (Array.isArray(it.body)) cx.face(media[i], it.body, 'body'); });
  cx.wa(el.querySelectorAll('.hd > *'), [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.1, stagger: 0.12});
  // the line first, then both halves open away from it
  cx.wa(q('.mid'), [{transform: tall ? 'scaleX(0)' : 'scaleY(0)'}, {transform: 'none'}], {duration: 1.0, delay: 0.15, ease: 'cubic-bezier(.6,0,.2,1)'});
  const from = tall ? ['inset(100% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] : ['inset(0% 0% 0% 100%)', 'inset(0% 100% 0% 0%)'];
  ms.forEach((m, i) => {
    cx.wa(m, [{clipPath: from[i]}, {clipPath: 'inset(0% 0% 0% 0%)'}], {duration: 1.15, delay: 0.5 + i * 0.12, ease: 'cubic-bezier(.7,0,.15,1)'});
    if (!Array.isArray(sides[i].face)) cx.wa(media[i], [{transform: 'scale(1.1)'}, {transform: 'scale(1)'}], {duration: 1.6, delay: 0.5 + i * 0.12});
  });
  caps.forEach((c, i) => cx.wa(c.children, [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 1.2 + i * 0.18, stagger: 0.08}));
  const clip = cx.fromWaapi(el);
  const vids = media.filter((m) => m.tagName === 'VIDEO').map((v) => cx.fromVideo(v));
  return vids.length ? cx.all.apply(null, [clip].concat(vids)) : clip;
}
