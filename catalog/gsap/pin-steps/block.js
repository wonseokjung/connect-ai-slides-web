// GSAP: a very large step number on one side, the words on the other; both are swapped step by step and a progress line fills.
// On a slide every click is one step; on a web page the screen stays pinned and the scroll moves through the steps.
export const css = `
.b-gsap-pin-steps .body { display: grid; grid-template-columns: 0.72fr 1.28fr; align-items: center; gap: calc(var(--gap) * 1.6); }
.b-gsap-pin-steps .nums { display: grid; overflow: hidden; font-size: calc(var(--hero) * 2.5); line-height: 0.86; padding: 0.04em 0; }
.b-gsap-pin-steps .nb { grid-area: 1 / 1; font-weight: var(--thin); letter-spacing: -0.06em; color: var(--ink); }
.b-gsap-pin-steps .txs { display: grid; }
.b-gsap-pin-steps .tx { grid-area: 1 / 1; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.6); }
.b-gsap-pin-steps .cs-lead { max-width: 19em; }
.b-gsap-pin-steps .prog { display: flex; gap: calc(var(--gap) * 0.4); align-items: center; }
.b-gsap-pin-steps .seg { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-pin-steps .seg i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.b-gsap-pin-steps .of { font-size: var(--label); letter-spacing: 0.22em; color: var(--dim); white-space: nowrap; }
.cs-frame[data-shape="tall"] .b-gsap-pin-steps .body { grid-template-columns: 1fr; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-gsap-pin-steps .nums { font-size: calc(var(--hero) * 2.6); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, steps = (p.steps || []).slice(0, 6), n = steps.length;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<p class="cs-lead" style="margin-top:0.5em">${cx.esc(p.title)}</p>` : ''}</div>` : ''}
    <div class="body">
      <div class="nums cs-num">${steps.map((_, i) => `<span class="nb">${String(i + 1).padStart(2, '0')}</span>`).join('')}</div>
      <div class="txs">${steps.map((s) => `<div class="tx"><h3 class="cs-title">${cx.esc(s.title || s)}</h3>${s.text ? `<p class="cs-lead">${cx.esc(s.text)}</p>` : ''}</div>`).join('')}</div>
    </div>
    <div class="prog" aria-hidden="true">${steps.map(() => '<span class="seg"><i></i></span>').join('')}<span class="of cs-num">${String(n).padStart(2, '0')} steps</span></div>
  </div>`;
  const nbs = el.querySelectorAll('.nb'), txs = el.querySelectorAll('.tx'), segs = el.querySelectorAll('.seg i');
  const tl = g.timeline({paused: true});
  g.set(nbs, {opacity: 0}); g.set(txs, {opacity: 0});
  if (el.querySelector('.hd')) tl.fromTo(el.querySelector('.hd'), {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(el.querySelector('.prog'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.1);
  tl.fromTo(nbs[0], {opacity: 0, yPercent: 45}, {opacity: 1, yPercent: 0, duration: 0.8, ease: 'expo.out'}, 0.15);
  tl.fromTo(txs[0], {opacity: 0, x: 40}, {opacity: 1, x: 0, duration: 0.7, ease: 'power3.out'}, 0.3);
  tl.to(segs[0], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, 0.3);
  const first = 1.5, each = 1.5;
  for (let i = 1; i < n; i++) {
    const T = first + each * (i - 1);
    tl.addLabel('step' + i, T);
    tl.to(nbs[i - 1], {opacity: 0, yPercent: -45, duration: 0.45, ease: 'power2.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, x: -40, duration: 0.4, ease: 'power2.in'}, T);
    tl.fromTo(nbs[i], {opacity: 0, yPercent: 45}, {opacity: 1, yPercent: 0, duration: 0.75, ease: 'expo.out'}, T + 0.3);
    tl.fromTo(txs[i], {opacity: 0, x: 40}, {opacity: 1, x: 0, duration: 0.65, ease: 'power3.out'}, T + 0.4);
    tl.to(segs[i], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, T + 0.3);
  }
  tl.to({}, {duration: 0.01}, first + each * (n - 1) - 0.2);
  return cx.fromGsap(tl);
}
