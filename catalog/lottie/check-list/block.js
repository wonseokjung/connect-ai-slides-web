// Lottie (lottie-web): a short list; a gold check draws in front of each line, one after another.
export const css = `
.b-lottie-check-list ul { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); }
.b-lottie-check-list li { display: flex; align-items: center; gap: calc(var(--gap) * 0.7); font-size: var(--lead); color: var(--ink); line-height: 1.2; }
.b-lottie-check-list .ck { flex: none; width: calc(var(--lead) * 1.9); height: calc(var(--lead) * 1.9); }
.b-lottie-check-list .tx { opacity: 0; }
`;
export default function mount(el, p, cx) {
  const items = (p.items || []).slice(0, 5);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ul>${items.map((t) => `<li><span class="ck" aria-hidden="true"></span><span class="tx">${cx.esc(t)}</span></li>`).join('')}</ul>
  </div>`;
  const clips = [], gap = 0.55, t0 = 0.5;
  el.querySelectorAll('li').forEach((li, i) => {
    const anim = cx.lottie.loadAnimation({container: li.querySelector('.ck'), renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(cx.meta.data['anim.json']))});
    clips.push(cx.fromLottie(anim, {at: t0 + gap * i, speed: 1.6}));
    cx.wa(li.querySelector('.tx'), [{opacity: 0, transform: 'translateX(-14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: t0 + gap * i + 0.12});
  });
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, stagger: 0.1});
  const clip = cx.all(cx.fromWaapi(el), ...clips);
  if (p.click !== false) clip.steps = items.slice(1).map((_, i) => t0 + gap * (i + 1) - 0.02);
  return clip;
}
