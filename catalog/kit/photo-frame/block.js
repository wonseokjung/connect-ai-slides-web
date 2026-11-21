// A screen recording or a result picture, shown large in a rounded glass window with a thin window bar. The picture grows 2 % very slowly; a caption sits under it.
export const css = `
.b-kit-photo-frame .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) calc(var(--pad) * 0.75) calc(var(--pad) * 0.4); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.65); }
.b-kit-photo-frame .win { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.b-kit-photo-frame .bar { flex: none; display: flex; align-items: center; gap: 0.55em; height: 2.1em; padding: 0 1.1em; font-size: var(--label); background: var(--bg2); border-bottom: 1px solid var(--line); }
.b-kit-photo-frame .bar i { display: block; width: 0.6em; height: 0.6em; border-radius: 50%; border: 1px solid var(--dim); }
.b-kit-photo-frame .bar b { flex: 1; height: 1px; margin-left: 0.9em; background: var(--line); }
.b-kit-photo-frame .view { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #000; }
.b-kit-photo-frame .view > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; transform-origin: 50% 30%; }
.b-kit-photo-frame .cap { flex: none; display: flex; align-items: baseline; gap: calc(var(--gap) * 0.8); }
.b-kit-photo-frame .cap .cs-kicker { flex: none; }
.b-kit-photo-frame .cap .tx { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .wrap { padding-left: var(--pad); padding-right: var(--pad); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .win { flex: none; aspect-ratio: 16 / 10.4; }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .cap { flex-direction: column; gap: calc(var(--gap) * 0.5); }
`;
export default function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.caption || 'Screen recording')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.caption || 'Picture of the result')}">`;
  el.innerHTML = `<div class="wrap">
    <div class="win cs-shot">
      <div class="bar" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
      <div class="view">${tag}</div>
    </div>
    ${p.caption || p.kicker ? `<div class="cap">${p.kicker ? `<span class="cs-kicker">${cx.esc(p.kicker)}</span>` : ''}${p.caption ? `<span class="tx">${cx.esc(p.caption)}</span>` : ''}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.view > *'), dur = 2.8;
  cx.wa(q('.win'), [{opacity: 0, transform: 'translateY(48px) scale(0.965)'}, {opacity: 1, transform: 'none'}], {duration: 1.1});
  cx.wa(m, [{transform: 'scale(1)'}, {transform: 'scale(1.02)'}], {duration: dur, ease: 'linear'});
  cx.wa(el.querySelectorAll('.cap > *'), [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.75, stagger: 0.12});
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}
