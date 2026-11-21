// anime.js v4: labels travel along two thin rings around a word in the middle, slow down and stop where they can be read.
export const css = `
.b-anime-orbit { --rx1: 26cqw; --ry1: 25cqh; --rx2: 36cqw; --ry2: 36cqh; }
.b-anime-orbit .kick { position: absolute; left: var(--pad); top: calc(var(--pad) * 0.62 + var(--top)); }
.b-anime-orbit .space { position: absolute; left: 0; right: 0; top: var(--top); bottom: 0; }
.b-anime-orbit .ring { position: absolute; left: 50%; top: 50%; translate: -50% -50%; border: 1px solid var(--line); border-radius: 50%; }
.b-anime-orbit .ring.a { width: calc(var(--rx1) * 2); height: calc(var(--ry1) * 2); }
.b-anime-orbit .ring.b { width: calc(var(--rx2) * 2); height: calc(var(--ry2) * 2); border-style: dashed; border-color: var(--faint); }
.b-anime-orbit .core { position: absolute; left: 50%; top: 50%; translate: -50% -50%; max-width: calc(var(--rx1) * 1.5); text-align: center; font-size: calc(var(--title) * 0.86); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.02; color: var(--ink); text-wrap: balance; }
.b-anime-orbit .lab { position: absolute; --a: 0; --rx: var(--rx1); --ry: var(--ry1); left: calc(50% + cos(calc(var(--a) * 1deg)) * var(--rx)); top: calc(50% + sin(calc(var(--a) * 1deg)) * var(--ry)); translate: -50% -50%;
  display: flex; align-items: center; gap: 0.5em; padding: 0.42em 1em 0.46em 0.8em; border-radius: 999px; background: var(--bg2); border: 1px solid var(--line); font-size: var(--lead); line-height: 1.1; color: var(--ivory); white-space: nowrap; }
.b-anime-orbit .lab.o { --rx: var(--rx2); --ry: var(--ry2); }
.b-anime-orbit .lab i { width: 0.34em; height: 0.34em; border-radius: 50%; background: var(--gold2); display: block; flex: none; }
.cs-frame[data-shape="tall"] .b-anime-orbit { --rx1: 27cqw; --ry1: 21cqh; --rx2: 27cqw; --ry2: 33cqh; }
.cs-frame[data-shape="tall"] .b-anime-orbit .ring.b { width: calc(var(--rx1) * 2.5); }
.cs-frame[data-shape="tall"] .b-anime-orbit .core { font-size: var(--title); max-width: 46cqw; }
.cs-frame[data-shape="tall"] .b-anime-orbit .lab { font-size: var(--body); padding: 0.4em 0.85em 0.44em 0.7em; }
`;
export default function mount(el, p, cx) {
  const A = cx.anime, tall = cx.shape === 'tall';
  const labels = (p.labels || []).slice(0, 6), n = labels.length;
  // final angles: spread around the ellipse; on a wide frame nothing sits straight above or below the word
  const start = tall ? -90 : -90 + 180 / n;
  const ang = labels.map((_, i) => start + (360 / n) * i);
  const outer = (i) => (tall ? Math.abs(Math.sin((ang[i] * Math.PI) / 180)) > 0.9 : n > 4 && Math.abs(Math.cos((ang[i] * Math.PI) / 180)) > 0.7);
  el.innerHTML = `
    ${p.kicker ? `<div class="kick cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="space">
      <span class="ring a" aria-hidden="true"></span><span class="ring b" aria-hidden="true"></span>
      <div class="core">${cx.esc(p.center || '')}</div>
      ${labels.map((t, i) => `<div class="lab${outer(i) ? ' o' : ''}" style="--a:${ang[i]}"><i></i>${cx.esc(t)}</div>`).join('')}
    </div>`;
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  if (el.querySelector('.kick')) tl.add(el.querySelector('.kick'), {opacity: [0, 1], duration: 600}, 0);
  tl.add(el.querySelector('.core'), {opacity: [0, 1], scale: [0.86, 1], duration: 900}, 100);
  tl.add(el.querySelectorAll('.ring'), {opacity: [0, 1], scale: [0.7, 1], duration: 1100, delay: A.stagger(140)}, 200);
  el.querySelectorAll('.lab').forEach((lab, i) => {
    tl.add(lab, {'--a': [ang[i] - 150, ang[i]], duration: 1700, ease: 'outQuart'}, 400 + i * 110);
    tl.add(lab, {opacity: [0, 1], duration: 500, ease: 'outQuad'}, 400 + i * 110);
  });
  return cx.fromAnime(tl);
}
