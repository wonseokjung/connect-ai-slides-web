// Plain CSS @keyframes, no library: a very large outlined chapter number rises behind a mask, the title slides in beside it.
export const css = `
.b-css-outline-chapter .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0; display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 1.8); }
.b-css-outline-chapter .numbox { overflow: hidden; padding: 0 0.04em; }
.b-css-outline-chapter .num { display: block; font-size: min(62cqh, 34cqw); font-weight: var(--thin); line-height: 0.86; letter-spacing: -0.05em; color: var(--gold); -webkit-text-fill-color: transparent; -webkit-text-stroke: 2px var(--gold);
  animation: b-oc-rise 1.2s cubic-bezier(.16,1,.3,1) both; }
.b-css-outline-chapter .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-css-outline-chapter .copy > * { animation: b-oc-slide 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-outline-chapter .cs-kicker { animation-delay: 0.45s; }
.b-css-outline-chapter .cs-hero { font-size: calc(var(--hero) * 0.86); animation-delay: 0.58s; }
.b-css-outline-chapter .cs-rule { width: 100%; max-width: calc(var(--hero) * 3); animation: b-oc-rule 1.1s cubic-bezier(.16,1,.3,1) 0.85s both; }
.b-css-outline-chapter .cs-lead { animation-delay: 1.0s; max-width: 20em; }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .wrap { grid-template-columns: 1fr; align-content: center; row-gap: calc(var(--gap) * 1.2); padding-bottom: var(--pad); }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .num { font-size: min(34cqh, 62cqw); -webkit-text-stroke-width: 1.5px; }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .cs-hero { font-size: var(--hero); }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .copy { gap: calc(var(--gap) * 0.9); }
@keyframes b-oc-rise { from { transform: translateY(100%); } to { transform: none; } }
@keyframes b-oc-slide { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: none; } }
@keyframes b-oc-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <div class="numbox"><span class="num cs-num">${cx.esc(p.number)}</span></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.esc(p.title)}</h2>
      <i class="cs-rule"></i>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div>
  </div>`;
  return cx.fromWaapi(el);
}
