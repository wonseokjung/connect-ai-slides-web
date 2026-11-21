// Motion (motion.dev): a picture or video in a rounded window springs in, the title and caption follow beside it.
export const css = `
.b-motion-media-card .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.72 + var(--top)) var(--pad) calc(var(--pad) * 0.72); display: grid; grid-template-columns: 1.5fr 1fr; align-items: center; column-gap: calc(var(--gap) * 1.6); }
.b-motion-media-card.flip .wrap { grid-template-columns: 1fr 1.5fr; }
.b-motion-media-card.flip .win { order: 2; }
.b-motion-media-card .win { display: flex; flex-direction: column; background: var(--bg2); will-change: transform, opacity; transform-origin: 50% 60%; }
.b-motion-media-card .bar { flex: none; height: calc(var(--label) * 2); display: flex; align-items: center; gap: calc(var(--label) * 0.4); padding: 0 calc(var(--label) * 0.9); border-bottom: 1px solid var(--line); }
.b-motion-media-card .bar i { width: calc(var(--label) * 0.42); height: calc(var(--label) * 0.42); border-radius: 50%; background: var(--line); display: block; }
.b-motion-media-card .bar i:first-child { background: var(--gold); }
.b-motion-media-card .pic { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #000; }
.b-motion-media-card .pic > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-motion-media-card .copy { display: flex; flex-direction: column; gap: var(--gap); }
.b-motion-media-card .cs-title { font-size: calc(var(--title) * 0.92); }
.cs-frame[data-shape="tall"] .b-motion-media-card .wrap { grid-template-columns: 1fr !important; align-content: center; row-gap: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-motion-media-card .win { order: 0 !important; }
.cs-frame[data-shape="tall"] .b-motion-media-card .pic { aspect-ratio: 4 / 3; }
.cs-frame[data-shape="tall"] .b-motion-media-card .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-motion-media-card .copy { gap: calc(var(--gap) * 0.8); }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  if (p.side === 'right') el.classList.add('flip');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 8, 0, 100)) : 50;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `<div class="wrap">
    <figure class="win cs-shot"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div><div class="pic">${media}</div></figure>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.title ? '<i class="cs-rule"></i>' : ''}
      ${p.caption ? `<p class="cs-lead">${cx.esc(p.caption)}</p>` : ''}
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.pic > *');
  if (p.face) cx.face(m, p.face);
  const list = [
    animate(q('.win'), {opacity: [0, 1]}, {duration: 0.35, delay: 0.1, ease: 'easeOut'}),
    animate(q('.win'), {scale: [0.82, 1], y: [80, 0], rotate: [-2.5, 0]}, {type: 'spring', bounce: 0.3, visualDuration: 0.7, delay: 0.1}),
    animate(el.querySelectorAll('.copy > *:not(.cs-rule)'), {opacity: [0, 1], x: [p.side === 'right' ? -28 : 28, 0]}, {duration: 0.7, delay: stagger(0.13, {startDelay: 0.6}), ease: [0.16, 1, 0.3, 1]}),
  ];
  if (q('.cs-rule')) list.push(animate(q('.cs-rule'), {scaleX: [0, 1]}, {duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1]}));
  const text = cx.fromMotion(list, {dur: 1.9});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}
