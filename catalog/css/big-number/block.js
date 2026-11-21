// Plain CSS @keyframes, no library: one very large thin number rises from behind a mask until it stands on a gold hairline,
// an outline copy of the same number slips out behind it, and the unit and one line come in beside it.
export const css = `
.b-css-big-number .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0 calc(var(--pad) * 0.8); display: grid; grid-template-columns: auto 1fr; align-items: end; align-content: center; column-gap: calc(var(--gap) * 1.5); }
.b-css-big-number .fig { position: relative; margin-bottom: -0.018em; font-size: min(84cqh, calc(118cqw / var(--n))); line-height: 0.8; font-weight: var(--thin); letter-spacing: -0.05em; white-space: nowrap; }
.b-css-big-number .box { clip-path: inset(-0.1em -0.1em 0.018em -0.1em); padding: 0 0.06em 0 0.01em; }
.b-css-big-number .num { display: block; color: var(--ink); animation: b-bn-rise 1.15s cubic-bezier(.16,1,.3,1) 0.15s both; }
.b-css-big-number .ghost { position: absolute; left: 0.01em; top: 0; color: transparent; -webkit-text-fill-color: transparent; -webkit-text-stroke: calc(var(--label) * 0.07) color-mix(in srgb, var(--gold) 72%, transparent); animation: b-bn-ghost 1s cubic-bezier(.16,1,.3,1) 0.7s both; }
.b-css-big-number .copy { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.62); padding-bottom: calc(var(--gap) * 0.95); min-width: 0; }
.b-css-big-number .copy > * { animation: b-bn-slide 0.85s cubic-bezier(.16,1,.3,1) both; }
.b-css-big-number .copy > :nth-child(1) { animation-delay: 0.7s; } .b-css-big-number .copy > :nth-child(2) { animation-delay: 0.82s; } .b-css-big-number .copy > :nth-child(3) { animation-delay: 0.94s; }
.b-css-big-number .unit { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.025em; line-height: 1; color: var(--gold2); }
.b-css-big-number .cs-lead { max-width: 15em; }
.b-css-big-number .line { grid-column: 1 / -1; display: block; height: 2px; margin-right: calc(var(--pad) * -1); background: var(--gold); transform-origin: 0 50%; animation: b-bn-line 1.1s cubic-bezier(.65,0,.35,1) 0.05s both; }
.b-css-big-number .long { grid-template-columns: 1fr; }
.b-css-big-number .long .fig { font-size: min(56cqh, calc(118cqw / var(--n))); }
.b-css-big-number .long .line { grid-row: 2; }
.b-css-big-number .long .copy { grid-row: 3; flex-direction: row; align-items: baseline; gap: calc(var(--gap) * 1.3); padding: calc(var(--gap) * 0.9) 0 0; }
.cs-frame[data-shape="tall"] .b-css-big-number .wrap { grid-template-columns: 1fr; padding: calc(var(--top) + var(--pad)) var(--pad) var(--pad); }
.cs-frame[data-shape="tall"] .b-css-big-number .fig { font-size: min(46cqh, calc(128cqw / var(--n))); }
.cs-frame[data-shape="tall"] .b-css-big-number .line { grid-row: 2; }
.cs-frame[data-shape="tall"] .b-css-big-number .copy { grid-row: 3; flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.9); padding: calc(var(--gap) * 1.6) 0 0; }
.cs-frame[data-shape="tall"] .b-css-big-number .unit { font-size: calc(var(--title) * 1.25); }
@keyframes b-bn-rise { from { transform: translateY(104%); opacity: 0; } 8% { opacity: 1; } to { transform: none; opacity: 1; } }
@keyframes b-bn-ghost { from { opacity: 0; transform: none; } to { opacity: 1; transform: translate(0.055em, -0.04em); } }
@keyframes b-bn-slide { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: none; } }
@keyframes b-bn-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so the adapter collects them at every seek.
export default function mount(el, p, cx) {
  const v = String(p.value == null ? '' : p.value).slice(0, 5), n = Math.max(1, v.length);
  el.innerHTML = `<div class="wrap${n > 2 ? ' long' : ''}" style="--n:${n}">
    <div class="fig"><span class="ghost cs-num" aria-hidden="true" data-deco>${cx.esc(v)}</span><div class="box"><span class="num cs-num">${cx.esc(v)}</span></div></div>
    <div class="copy">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.unit ? `<div class="unit">${cx.esc(p.unit)}</div>` : ''}${p.text ? `<p class="cs-lead">${cx.esc(p.text)}</p>` : ''}</div>
    <i class="line" aria-hidden="true"></i>
  </div>`;
  return cx.fromWaapi(el);
}
