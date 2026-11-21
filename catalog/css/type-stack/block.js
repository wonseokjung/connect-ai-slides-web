// Plain CSS @keyframes, no library: short lines come in from the left and the right in turn and stack like stairs; one of them is gold.
export const css = `
.b-css-type-stack .stack { display: flex; flex-direction: column; }
.b-css-type-stack .ln { position: relative; padding: calc(var(--gap) * 0.42) 0; }
.b-css-type-stack .ln::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--line); transform-origin: 0 50%; animation: b-ts-rule 1s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 0.22s + 0.1s); }
.b-css-type-stack .ln:nth-child(even)::before { transform-origin: 100% 50%; }
.b-css-type-stack .tx { display: block; font-size: calc(var(--hero) * 0.86 * var(--k, 1)); font-weight: var(--thin); letter-spacing: -0.035em; line-height: 1.04; color: var(--ink); margin-left: calc(var(--i) * 7cqw);
  animation: b-ts-left 1s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 0.22s + 0.2s); }
.b-css-type-stack .ln:nth-child(even) .tx { animation-name: b-ts-right; }
.b-css-type-stack .ln.on .tx { color: var(--gold2); }
.b-css-type-stack .cs-kicker { animation: b-ts-fade 0.6s ease-out both; margin-bottom: calc(var(--gap) * -0.3); }
.cs-frame[data-shape="tall"] .b-css-type-stack .tx { margin-left: calc(var(--i) * 4cqw); font-size: calc(var(--hero) * 0.92 * var(--k, 1)); }
@keyframes b-ts-left { from { opacity: 0; transform: translateX(-14cqw); } to { opacity: 1; transform: none; } }
@keyframes b-ts-right { from { opacity: 0; transform: translateX(14cqw); } to { opacity: 1; transform: none; } }
@keyframes b-ts-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-ts-fade { from { opacity: 0; } to { opacity: 1; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
export default function mount(el, p, cx) {
  const lines = (p.lines || []).slice(0, 4), gold = p.gold == null ? lines.length : Number(p.gold);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="stack" style="--k:${lines.length > 3 ? 0.78 : 1}">${lines.map((t, i) => `<div class="ln${i + 1 === gold ? ' on' : ''}" style="--i:${i}"><span class="tx">${cx.esc(t)}</span></div>`).join('')}</div>
  </div>`;
  return cx.fromWaapi(el);
}
