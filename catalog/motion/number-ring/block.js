// Motion (motion.dev): a thin ring draws up to a share of the circle while the number in the middle counts with it.
export const css = `
.b-motion-number-ring .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.72 + var(--top)) var(--pad) calc(var(--pad) * 0.72); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-motion-number-ring .ring { position: relative; height: min(64cqh, 40cqw); aspect-ratio: 1; }
.b-motion-number-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transform: rotate(-90deg); }
.b-motion-number-ring .track { fill: none; stroke: var(--line); stroke-width: 1; }
.b-motion-number-ring .inner { fill: none; stroke: var(--faint); stroke-width: 0.5; stroke-dasharray: 0.6 3; }
.b-motion-number-ring .arc { fill: none; stroke: var(--gold); stroke-width: 2.4; stroke-linecap: round; }
.b-motion-number-ring .mid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5em; text-align: center; }
.b-motion-number-ring .val { font-size: calc(var(--hero) * 1.05); font-weight: var(--thin); letter-spacing: -0.05em; line-height: 0.9; color: var(--ink); }
.b-motion-number-ring .unit { font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); max-width: 12em; line-height: 1.3; }
.b-motion-number-ring .copy { display: flex; flex-direction: column; gap: var(--gap); }
.b-motion-number-ring .cs-title { max-width: 11em; }
.b-motion-number-ring .cs-text { max-width: 22em; }
.cs-frame[data-shape="tall"] .b-motion-number-ring .wrap { grid-template-columns: 1fr; grid-template-rows: auto auto; justify-items: center; align-content: center; row-gap: calc(var(--gap) * 1.6); }
.cs-frame[data-shape="tall"] .b-motion-number-ring .ring { height: auto; width: min(72cqw, 44cqh); }
.cs-frame[data-shape="tall"] .b-motion-number-ring .copy { align-items: center; text-align: center; gap: calc(var(--gap) * 0.8); }
`;
export default function mount(el, p, cx) {
  const {animate} = cx.motion;
  const v = cx.clamp(Number(p.value) || 0, 0, 100), show = p.show == null ? v : Number(p.show), dec = String(show).includes('.') ? 1 : 0;
  el.innerHTML = `<div class="wrap">
    <div class="ring">
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="track" cx="100" cy="100" r="94"/><circle class="inner" cx="100" cy="100" r="84"/><circle class="arc" cx="100" cy="100" r="94" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>
      <div class="mid"><div class="val cs-num">${dec ? show.toFixed(1) : show}</div>${p.unit ? `<div class="unit">${cx.esc(p.unit)}</div>` : ''}</div>
    </div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.label ? `<h2 class="cs-title">${cx.esc(p.label)}</h2>` : ''}
      ${p.text ? `<p class="cs-text">${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), val = q('.val'), t0 = 0.3, d = 1.5;
  const list = [
    animate(q('.ring'), {opacity: [0, 1], scale: [0.9, 1]}, {duration: 0.7, ease: [0.16, 1, 0.3, 1]}),
    animate(q('.arc'), {strokeDashoffset: [1, 1 - v / 100]}, {duration: d, delay: t0, ease: [0.3, 0, 0.1, 1]}),
    animate(el.querySelectorAll('.copy > *'), {opacity: [0, 1], x: [26, 0]}, {duration: 0.7, delay: cx.motion.stagger(0.12, {startDelay: 0.55}), ease: [0.16, 1, 0.3, 1]}),
  ];
  if (q('.unit')) list.push(animate(q('.unit'), {opacity: [0, 1]}, {duration: 0.6, delay: t0 + 0.5}));
  const ease = (x) => { const c = cx.motion.cubicBezier ? cx.motion.cubicBezier(0.3, 0, 0.1, 1) : null; return c ? c(x) : cx.eases.inOut(x); };
  const num = cx.fromFn(t0 + d, (t) => { const n = show * ease(cx.clamp((t - t0) / d, 0, 1)); val.textContent = dec ? n.toFixed(1) : String(Math.round(n)); });
  return cx.all(cx.fromMotion(list, {dur: t0 + d + 0.2}), num);
}
