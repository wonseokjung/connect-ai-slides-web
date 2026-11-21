// Plain CSS @keyframes, no library: one large word, a light passes through it once, a line settles under it.
export const css = `
.b-css-light-sweep .word { font-size: calc(var(--hero) * 1.25); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 1; white-space: nowrap;
  background: linear-gradient(100deg, var(--ivory) 0%, var(--ivory) 38%, #fff 47%, var(--gold2) 50%, #fff 53%, var(--ivory) 62%, var(--ivory) 100%);
  background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: var(--ivory); -webkit-text-fill-color: transparent;
  animation: b-ls-sweep 1.9s cubic-bezier(.3,.1,.2,1) 0.25s both, b-ls-in 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-light-sweep .cs-kicker { animation: b-ls-fade 0.6s ease-out both; }
.b-css-light-sweep .cs-lead { animation: b-ls-up 0.8s cubic-bezier(.16,1,.3,1) 1.1s both; max-width: 22em; }
.b-css-light-sweep .cs-rule { animation: b-ls-rule 1s cubic-bezier(.16,1,.3,1) 0.8s both; width: calc(var(--hero) * 0.9); }
.cs-frame[data-shape="tall"] .b-css-light-sweep .word { font-size: var(--hero); white-space: normal; }
@keyframes b-ls-sweep { from { background-position: 100% 0; } to { background-position: 0% 0; } }
@keyframes b-ls-in { from { opacity: 0; transform: translateY(0.18em); letter-spacing: 0.02em; } to { opacity: 1; transform: none; letter-spacing: -0.04em; } }
@keyframes b-ls-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes b-ls-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes b-ls-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="word">${cx.esc(p.word)}</div>
    <i class="cs-rule" style="transform-origin:50% 50%"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  return cx.fromWaapi(el);
}
