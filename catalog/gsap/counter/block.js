// GSAP: a very large number counts up to its value while a thin ruler slides under it.
export const css = `
.b-gsap-counter .row { display: flex; align-items: baseline; gap: 0.12em; font-size: calc(var(--hero) * 2.1); line-height: 0.84; }
.b-gsap-counter .num { font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-counter .unit { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--gold2); line-height: 1; }
.b-gsap-counter .cs-lead { max-width: 22em; }
.b-gsap-counter .ruler { position: relative; height: calc(var(--label) * 2.4); overflow: hidden; margin-top: calc(var(--gap) * 0.4);
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(90deg, #000 0%, #000 70%, transparent 100%); }
.b-gsap-counter .ticks { position: absolute; left: 0; bottom: 0; width: 260%; height: 100%;
  background-image: linear-gradient(90deg, var(--gold) 0 2px, transparent 2px), linear-gradient(90deg, var(--line) 0 1px, transparent 1px);
  background-size: calc(var(--label) * 6) 100%, calc(var(--label) * 0.6) 46%; background-repeat: repeat-x; background-position: 0 100%, 0 100%; opacity: 0.9; }
.b-gsap-counter .pin { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gold2); }
.cs-frame[data-shape="tall"] .b-gsap-counter .row { flex-wrap: wrap; font-size: calc(var(--hero) * 2.4); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, value = Number(p.value) || 0, from = Number(p.from) || 0, dec = Math.max(0, p.decimals | 0);
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="row"><span class="num cs-num">${fmt(from)}</span>${p.unit ? `<span class="unit">${cx.esc(p.unit)}</span>` : ''}</div>
    ${p.label ? `<p class="cs-lead">${cx.esc(p.label)}</p>` : ''}
    <div class="ruler" aria-hidden="true"><div class="ticks"></div><i class="pin"></i></div>
  </div>`;
  const q = (s) => el.querySelector(s), num = q('.num'), o = {v: from};
  const tl = g.timeline({paused: true, onUpdate: () => { num.textContent = fmt(o.v); }});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(num, {opacity: 0, filter: 'blur(18px)', y: 40}, {opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.7, ease: 'expo.out'}, 0.1);
  tl.to(o, {v: value, duration: 1.7, ease: 'power3.out'}, 0.2);
  tl.fromTo(q('.ruler'), {opacity: 0}, {opacity: 1, duration: 0.5, ease: 'power1.out'}, 0.15);
  tl.fromTo(q('.ticks'), {xPercent: 0}, {xPercent: -38, duration: 1.75, ease: 'power3.out'}, 0.2);
  if (q('.unit')) tl.fromTo(q('.unit'), {opacity: 0, x: -16}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0.7);
  if (q('.cs-lead')) tl.fromTo(q('.cs-lead'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.2);
  return cx.fromGsap(tl);
}
