// anime.js v4 stagger on a grid: tiles cover the picture and fold away from the centre outwards, then the caption comes in.
export const css = `
.b-anime-grid-reveal .pic { position: absolute; left: 0; right: 0; top: 0; height: 72%; overflow: hidden; background: #000; }
.b-anime-grid-reveal .pic > img, .b-anime-grid-reveal .pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-anime-grid-reveal .tiles { position: absolute; inset: -1px; display: grid; grid-template-columns: repeat(var(--cols), 1fr); grid-template-rows: repeat(var(--rows), 1fr); }
.b-anime-grid-reveal .tiles i { display: block; background: var(--bg); outline: 1px solid var(--bg); will-change: transform, opacity; }
.b-anime-grid-reveal .cap { position: absolute; left: var(--pad); right: var(--pad); top: 72%; bottom: 0; display: grid; grid-template-columns: 1.15fr 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-anime-grid-reveal .l { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-anime-grid-reveal .cs-title { font-size: calc(var(--title) * 0.8); }
.b-anime-grid-reveal .r { display: flex; align-items: center; gap: var(--gap); }
.b-anime-grid-reveal .r i { flex: none; width: 1px; align-self: stretch; background: var(--gold); transform-origin: 50% 0; display: block; }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .pic { top: var(--top); height: 50%; }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .cap { top: calc(50% + var(--top)); grid-template-columns: 1fr; align-content: start; row-gap: var(--gap); padding-top: calc(var(--gap) * 1.4); }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .cs-title { font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  const A = cx.anime, tall = cx.shape === 'tall';
  const cols = tall ? 6 : 12, rows = tall ? 6 : 5;
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 10, 0, 100)) : 40;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `
    <div class="pic">${media}<div class="tiles" aria-hidden="true" style="--cols:${cols};--rows:${rows}">${'<i></i>'.repeat(cols * rows)}</div></div>
    <div class="cap">
      <div class="l">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      ${p.caption ? `<div class="r"><i></i><p class="cs-lead">${cx.esc(p.caption)}</p></div>` : ''}
    </div>`;
  const m = el.querySelector('.pic > img, .pic > video');
  if (p.face) cx.face(m, p.face);
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  // every tile is gone at the end (opacity 0, scale 0): nothing stays on the picture
  tl.add(el.querySelectorAll('.tiles i'), {scale: [1, 0], opacity: [{to: 1, duration: 0}, {to: 0, duration: 280, delay: 340}], duration: 620, ease: 'inOutQuad', delay: A.stagger(110, {grid: [cols, rows], from: 'center'})}, 150);
  const end = tl.duration;
  const head = el.querySelectorAll('.l > *');
  if (head.length) tl.add(head, {opacity: [0, 1], translateY: [22, 0], duration: 700, delay: A.stagger(100)}, end - 650);
  if (el.querySelector('.r')) { tl.add(el.querySelector('.r i'), {scaleY: [0, 1], duration: 700}, end - 450); tl.add(el.querySelector('.r p'), {opacity: [0, 1], translateX: [20, 0], duration: 700}, end - 350); }
  const clip = cx.fromAnime(tl);
  return isVideo ? cx.all(clip, cx.fromVideo(m)) : clip;
}
