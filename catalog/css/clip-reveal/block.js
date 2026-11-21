// Plain CSS @keyframes, no library: a portrait picture opens from a small circle to the full frame, the words slide in beside it.
export const css = `
.b-css-clip-reveal .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 2.2); }
.b-css-clip-reveal.flip .wrap { grid-template-columns: 1fr auto; }
.b-css-clip-reveal.flip .frame { order: 2; }
.b-css-clip-reveal .frame { position: relative; height: 100%; aspect-ratio: 4 / 5; max-width: 46cqw; }
.b-css-clip-reveal .pic { position: absolute; inset: 0; border-radius: var(--radius); overflow: hidden; background: #000;
  animation: b-cr-open 1.5s cubic-bezier(.65,0,.2,1) 0.1s both; }
.b-css-clip-reveal .pic > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: b-cr-settle 1.9s cubic-bezier(.16,1,.3,1) 0.1s both; }
.b-css-clip-reveal .edge { position: absolute; left: calc(var(--gap) * -0.5); top: 12%; bottom: 12%; width: 2px; background: var(--gold); transform-origin: 50% 0; animation: b-cr-edge 1s cubic-bezier(.16,1,.3,1) 1.0s both; }
.b-css-clip-reveal.flip .edge { left: auto; right: calc(var(--gap) * -0.5); }
.b-css-clip-reveal .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-css-clip-reveal .copy > * { animation: b-cr-slide 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-clip-reveal .copy > :nth-child(1) { animation-delay: 0.75s; }
.b-css-clip-reveal .copy > :nth-child(2) { animation-delay: 0.9s; }
.b-css-clip-reveal .copy > :nth-child(3) { animation-delay: 1.05s; }
.b-css-clip-reveal .cs-title { font-size: calc(var(--title) * 1.08); }
.b-css-clip-reveal .cs-lead { max-width: 18em; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .wrap { grid-template-columns: 1fr !important; grid-template-rows: auto auto; align-content: center; row-gap: calc(var(--gap) * 1.6); padding-top: calc(var(--pad) * 0.5 + var(--top)); }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .frame { order: 0 !important; height: 46cqh; aspect-ratio: auto; width: 100%; max-width: none; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .edge { left: 12%; right: 12%; top: auto; bottom: calc(var(--gap) * -0.7); width: auto; height: 2px; transform-origin: 0 50%; animation-name: b-cr-edge-x; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .copy { gap: calc(var(--gap) * 0.8); }
@keyframes b-cr-open { from { clip-path: circle(0% at 50% 38%); } to { clip-path: circle(125% at 50% 38%); } }
@keyframes b-cr-settle { from { transform: scale(1.08); } to { transform: none; } }
@keyframes b-cr-edge { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes b-cr-edge-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-cr-slide { from { opacity: 0; transform: translateX(46px); } to { opacity: 1; transform: none; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
export default function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  if (p.side === 'right') el.classList.add('flip');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 6, 0, 100)) : 40;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `<div class="wrap">
    <div class="frame"><div class="pic">${media}</div><i class="edge" aria-hidden="true"></i></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.text ? `<p class="cs-lead">${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const m = el.querySelector('.pic > *');
  if (p.face) cx.face(m, p.face);
  const clip = cx.fromWaapi(el);
  return isVideo ? cx.all(clip, cx.fromVideo(m)) : clip;
}
