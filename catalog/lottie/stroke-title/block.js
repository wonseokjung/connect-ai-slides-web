// Lottie (lottie-web): a large line emblem (two open arcs, five ticks, one marker) draws beside a title.
export const css = `
.b-lottie-stroke-title .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 1.5); }
.b-lottie-stroke-title .emblem { width: min(calc(var(--hero) * 2.7), 30cqw); aspect-ratio: 1; margin-left: calc(var(--hero) * -0.25); }
.b-lottie-stroke-title .emblem svg { display: block; }
.b-lottie-stroke-title .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-lottie-stroke-title .cs-hero { font-size: calc(var(--hero) * 0.92); }
.b-lottie-stroke-title .cs-w { margin-right: 0.2em; }
.b-lottie-stroke-title .cs-lead { max-width: 22em; }
.cs-frame[data-shape="tall"] .b-lottie-stroke-title .wrap { grid-template-columns: 1fr; align-content: center; row-gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-lottie-stroke-title .emblem { width: 52cqw; margin-left: -5cqw; }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <div class="emblem" aria-hidden="true"></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div>
  </div>`;
  const anim = cx.lottie.loadAnimation({container: el.querySelector('.emblem'), renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(cx.meta.data['anim.json']))});
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.45 + 0.08 * ws.length;
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, transform: 'translateX(-16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.3});
  cx.wa(ws, [{opacity: 0, transform: 'translateY(0.35em) rotate(2deg)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: 0.45, stagger: 0.08});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  return cx.all(cx.fromWaapi(q('.copy')), cx.fromLottie(anim, {at: 0.05, speed: 1}));
}
