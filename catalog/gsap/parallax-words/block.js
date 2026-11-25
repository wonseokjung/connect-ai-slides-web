// GSAP: three rows of very large outlined words drift at different speeds behind one clear sentence.
export const css = `
.b-gsap-parallax-words .rows { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: calc(var(--top) + 3.5cqh) 0 3.5cqh; overflow: hidden; }
.b-gsap-parallax-words .row { width: max-content; white-space: nowrap; font-size: calc(var(--hero) * 1.5); line-height: 1; font-weight: var(--light); letter-spacing: -0.02em; color: transparent; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1.5px var(--line); }
.b-gsap-parallax-words .row.g { -webkit-text-stroke-color: color-mix(in srgb, var(--gold) 60%, transparent); }
.b-gsap-parallax-words .row span { margin-right: 0.32em; }
.b-gsap-parallax-words .mid { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: var(--pad); }
.b-gsap-parallax-words .panel { display: flex; flex-direction: column; align-items: center; gap: calc(var(--gap) * 0.7); padding: 2.2em 3.2em; background: radial-gradient(closest-side, var(--bg) 58%, transparent 100%); }
.b-gsap-parallax-words .cs-title { font-size: calc(var(--title) * 1.18); max-width: 12em; }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .row { font-size: calc(var(--hero) * 1.7); }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .mid { padding: 0; }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .panel { width: 100%; padding: 3em var(--pad); background: linear-gradient(180deg, transparent 0%, var(--bg) 22%, var(--bg) 78%, transparent 100%); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words && p.words.length ? p.words : String(p.text || '').split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter((w) => w.length > 1).sort((a, b) => b.length - a.length).slice(0, 3)).slice(0, 3);
  if (!words.length) words.push(String(p.text || '').trim() || ' ');
  while (words.length < 3) words.push(words[words.length - 1]);
  const row = (w, cls) => `<div class="row ${cls}">${Array.from({length: 9}, () => `<span>${cx.esc(w)}</span>`).join('')}</div>`;
  el.innerHTML = `
    <div class="rows" aria-hidden="true" data-deco>${row(words[0], '')}${row(words[1], 'g')}${row(words[2], '')}</div>
    <div class="mid"><div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <p class="cs-title">${cx.spans(p.text, 'cs-w')}</p>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div></div>`;
  const rows = el.querySelectorAll('.row'), tl = g.timeline({paused: true}), D = 4;
  tl.fromTo(rows, {opacity: 0}, {opacity: 1, duration: 0.8, ease: 'power1.out', stagger: 0.12}, 0);
  tl.fromTo(rows[0], {xPercent: -4}, {xPercent: -30, duration: D, ease: 'none'}, 0);
  tl.fromTo(rows[1], {xPercent: -38}, {xPercent: -10, duration: D, ease: 'none'}, 0);
  tl.fromTo(rows[2], {xPercent: -12}, {xPercent: -46, duration: D, ease: 'none'}, 0);
  if (el.querySelector('.cs-kicker')) tl.fromTo(el.querySelector('.cs-kicker'), {opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em', duration: 0.8, ease: 'power3.out'}, 0.25);
  tl.fromTo(el.querySelectorAll('.cs-w'), {opacity: 0, yPercent: 70, filter: 'blur(12px)'}, {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', stagger: 0.07}, 0.4);
  if (el.querySelector('.cs-lead')) tl.fromTo(el.querySelector('.cs-lead'), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.3);
  return cx.fromGsap(tl);
}
