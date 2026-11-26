// pro/statement: a large thin sentence, word by word; gold words get a hairline under them that draws itself.
export const css = `
.b-pro-statement .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.9); }
.b-pro-statement .st-t { font-size: calc(var(--title) * 0.95); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.12; color: var(--ink); max-width: 84%; text-wrap: balance; }
.b-pro-statement .st-t.mid { font-size: calc(var(--title) * 0.84); }
.b-pro-statement .st-t.long { font-size: calc(var(--title) * 0.7); max-width: 90%; }
.b-pro-statement .st-t.short { font-size: calc(var(--title) * 1.45); letter-spacing: -0.04em; line-height: 1.04; }
.b-pro-statement .st-t .pro-gold { position: relative; }
.b-pro-statement .st-ul { position: absolute; left: 0; right: 0; bottom: 0.02em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-statement .st-by { display: flex; align-items: center; gap: 1em; font-size: var(--label); letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }
.b-pro-statement .st-by i { display: block; width: 3em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-pro-statement .st-t { max-width: 100%; font-size: calc(var(--title) * 0.9); }
.cs-frame[data-shape="tall"] .b-pro-statement .st-t.long { font-size: calc(var(--title) * 0.7); }
.cs-frame[data-shape="tall"] .b-pro-statement .st-t.short { font-size: calc(var(--title) * 1.05); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, n = String(p.text || '').length, ko = /[가-힣]/.test(p.text || '');
  const size = n > (ko ? 44 : 80) ? ' long' : n > (ko ? 24 : 44) ? ' mid' : n <= (ko ? 18 : 28) ? ' short' : '';
  el.innerHTML = `<i class="pro-glow" style="--gx:12%;--gy:88%"></i><div class="pro-wrap">${P.head({kicker: p.kicker, title: p.title})}<div class="pro-body">
    <p class="st-t${size}">${P.words(p.text, p.gold)}</p>
    ${p.by ? `<div class="st-by"><i></i><span>${cx.esc(p.by)}</span></div>` : ''}
  </div>${P.foot(cx)}</div>`;
  el.querySelectorAll('.st-t .pro-wm .pro-gold').forEach((g) => { const u = document.createElement('i'); u.className = 'st-ul'; u.setAttribute('aria-hidden', 'true'); g.parentNode.style.position = 'relative'; g.parentNode.appendChild(u); });
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  P.wordsIn(tl, q('.st-t'), t0 + 0.05);
  const ul = el.querySelectorAll('.st-ul');
  if (ul.length) tl.fromTo(ul, {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.inOut', stagger: 0.05}, t0 + 0.95);
  if (q('.st-by')) { tl.fromTo(q('.st-by i'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, t0 + 1.0); P.rise(tl, q('.st-by span'), t0 + 1.1, {y: 10}); }
  return P.clip(cx, tl, el);
}
