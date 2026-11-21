// GSAP: two tilted bands of large words run in opposite directions behind a quiet panel with one line of text.
export const css = `
.b-gsap-marquee-band .bands { position: absolute; inset: 0; overflow: hidden; }
.b-gsap-marquee-band .band { position: absolute; left: -15%; width: 130%; transform: rotate(-5deg); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 0.16em 0; font-size: calc(var(--hero) * 0.78); overflow: hidden; }
.b-gsap-marquee-band .b1 { top: 13%; }
.b-gsap-marquee-band .b2 { bottom: 11%; }
.b-gsap-marquee-band .in { display: flex; align-items: center; width: max-content; white-space: nowrap; font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1; color: color-mix(in srgb, var(--ivory) 26%, transparent); }
.b-gsap-marquee-band .in i { display: block; flex: none; width: 0.5em; height: 2px; margin: 0 0.34em; background: var(--gold); }
.b-gsap-marquee-band .mid { position: absolute; inset: 0; display: grid; place-items: center; padding: var(--pad); }
.b-gsap-marquee-band .panel { display: flex; flex-direction: column; align-items: center; text-align: center; gap: calc(var(--gap) * 0.6); padding: calc(var(--gap) * 1.3) calc(var(--gap) * 1.9); background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius); max-width: 78%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .band { font-size: calc(var(--hero) * 1.05); left: -30%; width: 160%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .b1 { top: 14%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .b2 { bottom: 9%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .panel { max-width: 100%; padding: calc(var(--gap) * 1.4) calc(var(--gap) * 1.1); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words && p.words.length ? p.words : String(p.title || '').split(/\s+/)).slice(0, 6).map(String);
  const run = (off) => Array.from({length: 4}, () => words.map((_, i) => `<span>${cx.esc(words[(i + off) % words.length])}</span><i></i>`).join('')).join('');
  el.innerHTML = `
    <div class="bands" aria-hidden="true" data-deco><div class="band b1"><div class="in">${run(0)}</div></div><div class="band b2"><div class="in">${run(Math.ceil(words.length / 2))}</div></div></div>
    <div class="mid"><div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-title">${cx.esc(p.title)}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div></div>`;
  const q = (s) => el.querySelector(s), tl = g.timeline({paused: true}), D = 4;
  tl.fromTo(el.querySelectorAll('.band'), {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.15}, 0);
  tl.fromTo(q('.b1 .in'), {xPercent: -2}, {xPercent: -24, duration: D, ease: 'none'}, 0);
  tl.fromTo(q('.b2 .in'), {xPercent: -30}, {xPercent: -8, duration: D, ease: 'none'}, 0);
  tl.fromTo(q('.panel'), {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out'}, 0.3);
  tl.fromTo(q('.panel').children, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12}, 0.55);
  return cx.fromGsap(tl);
}
