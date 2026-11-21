// anime.js v4: the letters of one large line rise like a wave from the centre outwards while the tracking closes in.
export const css = `
.b-anime-letter-wave .word { font-size: calc(var(--hero) * 1.12 * var(--fit, 1)); font-weight: var(--thin); line-height: 1.02; color: var(--ink); letter-spacing: -0.03em; max-width: 100%; }
.b-anime-letter-wave .wd { display: inline-block; white-space: nowrap; margin: 0 0.05em; }
.b-anime-letter-wave .ch { display: inline-block; will-change: transform, opacity; }
.b-anime-letter-wave .cs-rule { width: calc(var(--hero) * 1.6); transform-origin: 50% 50%; }
.b-anime-letter-wave .cs-lead { max-width: 24em; }
.cs-frame[data-shape="tall"] .b-anime-letter-wave .word { font-size: calc(var(--hero) * var(--fit, 1)); }
.cs-frame[data-shape="tall"] .b-anime-letter-wave .cs-rule { width: calc(var(--hero) * 1.2); }
`;
export default function mount(el, p, cx) {
  const A = cx.anime;
  const html = String(p.word).split(/\s+/).map((w) => `<span class="wd">${Array.from(w).map((c) => `<span class="ch">${cx.esc(c)}</span>`).join('')}</span>`).join(' ');
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="word" aria-label="${cx.esc(p.word)}">${html}</h2>
    <i class="cs-rule"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), chars = el.querySelectorAll('.ch');
  // keep the line on one row when a slightly smaller size is enough (down to 62 %); a longer line wraps between words
  const word = q('.word'), room = word.parentElement.clientWidth - 2 * parseFloat(getComputedStyle(word.parentElement).paddingLeft);
  word.style.whiteSpace = 'nowrap';
  const need = word.scrollWidth;
  if (need > room) { const k = room / need; if (k >= 0.62) word.style.setProperty('--fit', (k * 0.985).toFixed(3)); else word.style.whiteSpace = ''; }
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  if (q('.cs-kicker')) tl.add(q('.cs-kicker'), {opacity: [0, 1], translateY: [14, 0], duration: 600}, 0);
  tl.add(chars, {translateY: ['0.9em', '0em'], rotate: [14, 0], opacity: [0, 1], duration: 1000, ease: 'outBack(1.6)', delay: A.stagger(42, {from: 'center'})}, 150);
  tl.add(q('.word'), {letterSpacing: ['0.16em', '-0.03em'], duration: 1500, ease: 'outQuart'}, 150);
  const end = 150 + 42 * (chars.length / 2) + 600;
  tl.add(q('.cs-rule'), {scaleX: [0, 1], duration: 900}, end - 250);
  if (q('.cs-lead')) tl.add(q('.cs-lead'), {opacity: [0, 1], translateY: [18, 0], duration: 700}, end);
  return cx.fromAnime(tl);
}
