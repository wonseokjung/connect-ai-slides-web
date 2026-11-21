// GSAP ScrambleText: a heading, then short tags that switch on one by one as rounded chips, each decoding from random letters.
export const css = `
.b-gsap-scramble-tags .chips { display: flex; flex-wrap: wrap; gap: calc(var(--gap) * 0.6); }
.b-gsap-scramble-tags .chip { display: inline-flex; align-items: center; gap: 0.7em; padding: 0.46em 1.05em 0.46em 0.85em; border: 1px solid var(--line); border-radius: 999px; background: var(--card); font-size: var(--lead); color: var(--ink); line-height: 1.1; white-space: nowrap; }
.b-gsap-scramble-tags .ix { font-size: var(--label); letter-spacing: 0.18em; color: var(--gold2); }
.b-gsap-scramble-tags .tx { position: relative; display: inline-block; }
.b-gsap-scramble-tags .gh { visibility: hidden; }
.b-gsap-scramble-tags .sc { position: absolute; left: 0; top: 0; white-space: nowrap; }
.b-gsap-scramble-tags .cs-lead { max-width: 26em; }
.cs-frame[data-shape="tall"] .b-gsap-scramble-tags .chips { flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.7); }
`;
export default function mount(el, p, cx) {
  cx.plugin('ScrambleTextPlugin');
  const tags = (p.tags || []).slice(0, 5).map(String);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ul class="chips">${tags.map((t, i) => `<li class="chip"><span class="ix cs-num">${String(i + 1).padStart(2, '0')}</span><span class="tx"><span class="gh" aria-hidden="true" data-deco>${cx.esc(t)}</span><span class="sc"></span></span></li>`).join('')}</ul>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const g = cx.gsap, tl = g.timeline({paused: true});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  const t0 = head.length ? 0.55 : 0.1, each = 0.36;
  el.querySelectorAll('.chip').forEach((chip, i) => {
    const at = t0 + each * i;
    tl.fromTo(chip, {opacity: 0, scale: 0.92, borderColor: 'rgba(214,137,42,0.9)'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out'}, at);
    tl.to(chip, {borderColor: 'rgba(235,226,210,0.18)', duration: 0.6, ease: 'power1.out'}, at + 0.55);
    tl.to(chip.querySelector('.sc'), {duration: 0.6, ease: 'none', scrambleText: {text: tags[i], chars: 'upperCase', speed: 0.55, revealDelay: 0.12}}, at + 0.05);
  });
  if (el.querySelector('.cs-lead')) tl.fromTo(el.querySelector('.cs-lead'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, t0 + each * tags.length + 0.2);
  return cx.fromGsap(tl);
}
