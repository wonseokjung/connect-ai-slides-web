// GSAP: a large media stage that stays in place while the pictures change. Every step wipes the next picture or clip in
// with a different mask, the one before sinks back, and the number, the title and the line beside it change with it.
// On a slide every click is one step; on a web page the screen stays pinned and the scroll moves through the pictures.
// A video item plays only while it is the one on show. Nothing is drawn on the pictures.
export const css = `
.b-gsap-pin-showcase .stage { position: absolute; top: 0; bottom: 0; right: 0; width: 69%; overflow: hidden; background: #000; }
.b-gsap-pin-showcase .layer { position: absolute; inset: 0; overflow: hidden; will-change: clip-path, transform, opacity; }
.b-gsap-pin-showcase .layer > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-gsap-pin-showcase .side { position: absolute; top: var(--top); bottom: 0; left: 0; width: 31%; padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.9) calc(var(--pad) * 0.62) calc(var(--pad) * 0.56); display: flex; flex-direction: column; justify-content: space-between; gap: var(--gap); }
.b-gsap-pin-showcase .hd { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-gsap-pin-showcase .cs-kicker { letter-spacing: 0.3em; }
.b-gsap-pin-showcase .hd .t { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.3; }
.b-gsap-pin-showcase .mid { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.6); }
.b-gsap-pin-showcase .numrow { display: flex; align-items: flex-end; gap: 0.5em; }
.b-gsap-pin-showcase .nums { display: grid; overflow: hidden; font-size: calc(var(--hero) * 1.2); line-height: 0.84; padding: 0.02em 0 0.04em; }
.b-gsap-pin-showcase .nb { grid-area: 1 / 1; font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-pin-showcase .of { font-size: calc(var(--label) * 1.1); letter-spacing: 0.2em; color: var(--gold2); padding-bottom: 0.7em; white-space: nowrap; }
.b-gsap-pin-showcase .bar { display: block; height: 1px; width: 100%; background: var(--gold); transform-origin: 0 50%; }
.b-gsap-pin-showcase .txs { display: grid; }
.b-gsap-pin-showcase .tx { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); align-self: start; }
.b-gsap-pin-showcase .tx .lb { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.54); font-weight: var(--light); letter-spacing: -0.02em; line-height: 1.08; color: var(--ink); text-wrap: balance; }
.b-gsap-pin-showcase .tx p { font-size: calc(var(--body) * 0.86); line-height: 1.36; color: var(--dim); text-wrap: pretty; }
.b-gsap-pin-showcase .prog { display: flex; gap: calc(var(--gap) * 0.24); align-items: center; }
.b-gsap-pin-showcase .seg { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-pin-showcase .seg i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-stage="deck"] .b-gsap-pin-showcase .cs-kicker, .cs-frame[data-stage="deck"] .b-gsap-pin-showcase .tx .lb { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .stage { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 72cqw; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .side { top: calc(72cqw + var(--top)); width: auto; right: 0; padding: calc(var(--pad) * 0.9) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd { order: -2; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd .t { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .prog { order: -1; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .nums { font-size: calc(var(--hero) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx p { font-size: var(--body); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, items = (p.items || []).slice(0, 5), n = items.length, tall = cx.shape === 'tall';
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 8, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || it.title || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.title || 'Picture')}" style="object-position:${pos(it)}">`);
  const two = (i) => String(i).padStart(2, '0');
  el.innerHTML = `
    <div class="stage">${items.map((it) => `<div class="layer" data-face-ok>${tag(it)}</div>`).join('')}</div>
    <div class="side">
      ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<p class="t">${cx.esc(p.title)}</p>` : ''}</div>` : '<span></span>'}
      <div class="mid">
        <div class="numrow"><div class="nums cs-num">${items.map((_, i) => `<span class="nb">${two(i + 1)}</span>`).join('')}</div><span class="of cs-num">/ ${two(n)}</span></div>
        <i class="bar" aria-hidden="true"></i>
        <div class="txs">${items.map((it) => `<div class="tx">${it.label ? `<div class="lb">${cx.esc(it.label)}</div>` : ''}<h3>${cx.esc(it.title || '')}</h3>${it.text ? `<p>${cx.esc(it.text)}</p>` : ''}</div>`).join('')}</div>
      </div>
      <div class="prog" aria-hidden="true">${items.map(() => '<span class="seg"><i></i></span>').join('')}</div>
    </div>`;
  const all = (s) => Array.from(el.querySelectorAll(s)), layers = all('.layer'), media = layers.map((l) => l.firstElementChild), nbs = all('.nb'), txs = all('.tx'), segs = all('.seg i');
  items.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(media[i], it.face); if (Array.isArray(it.body)) cx.face(media[i], it.body, 'body'); });
  // one mask per step, never the same twice in a row: from the right, from below, a slanted edge, an opening circle
  const wipes = [
    ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    ['polygon(130% 0%, 130% 0%, 100% 100%, 100% 100%)', 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)'],
    ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
  ];
  const first = 1.6, each = 1.5, total = first + each * (n - 1);
  const starts = items.map((_, i) => (i ? first + each * (i - 1) : 0));
  const grow = (i) => (Array.isArray(items[i].face) ? 1 : 1.12);      // a person is never shown larger than the picture
  const tl = g.timeline({paused: true});
  g.set(layers.slice(1), {visibility: 'hidden'}); g.set(nbs, {opacity: 0}); g.set(txs, {opacity: 0});
  if (el.querySelector('.hd')) tl.fromTo(el.querySelector('.hd'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, 0.1);
  tl.fromTo(layers[0], {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut'}, 0);
  tl.fromTo(media[0], {scale: grow(0)}, {scale: 1, duration: 1.6, ease: 'power3.out'}, 0);
  tl.fromTo(nbs[0], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.8, ease: 'expo.out'}, 0.35);
  tl.fromTo(el.querySelector('.of'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.5);
  tl.fromTo(el.querySelector('.bar'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0.45);
  tl.fromTo(txs[0], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 0.55);
  tl.fromTo(el.querySelector('.prog'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.3);
  tl.to(segs[0], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, 0.5);
  for (let i = 1; i < n; i++) {
    const T = starts[i], w = wipes[(i - 1) % wipes.length];
    tl.addLabel('step' + i, T);
    tl.set(layers[i], {visibility: 'visible'}, T);
    tl.fromTo(layers[i], {clipPath: w[0]}, {clipPath: w[1], duration: 1.0, ease: 'expo.inOut'}, T);
    tl.fromTo(media[i], {scale: grow(i)}, {scale: 1, duration: 1.3, ease: 'power3.out'}, T + 0.1);
    tl.to(layers[i - 1], {scale: 0.9, opacity: 0.3, duration: 0.95, ease: 'power2.inOut'}, T);
    tl.set(layers[i - 1], {visibility: 'hidden'}, T + 1.02);
    tl.to(nbs[i - 1], {opacity: 0, yPercent: -60, duration: 0.4, ease: 'power2.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, y: -22, duration: 0.35, ease: 'power2.in'}, T);
    tl.fromTo(nbs[i], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.7, ease: 'expo.out'}, T + 0.32);
    tl.fromTo(txs[i], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, T + 0.42);
    tl.to(segs[i], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, T + 0.3);
  }
  tl.to({}, {duration: 0.01}, total - 0.01);
  // video items: only the one on show runs; when recording, the exact frame
  const vids = media.map((m) => (m.tagName === 'VIDEO' ? m : null));
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || /[?&]reduced/.test(location.search);
  let on = true, cur = 0;
  const run = () => vids.forEach((v, i) => { if (!v) return; if (on && !calm && i === cur) { if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } } else if (!v.paused) v.pause(); });
  const film = cx.fromFn(total, (t, exact) => {
    let k = 0; for (let i = 1; i < n; i++) if (t >= starts[i] + 0.05) k = i;
    cur = k;
    const v = vids[k];
    if (exact) {
      vids.forEach((x) => { if (x && !x.paused) x.pause(); });
      if (!v || v.error) return;
      const d = v.duration || 0; let tt = Math.max(0, t - starts[k]); if (d) tt = tt % d;
      if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
      return new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; });
    }
    if (t > 0) run();
  });
  const clip = cx.all(cx.fromGsap(tl), film);
  const waits = vids.filter((v) => v && v.readyState < 2).map((v) => new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); }));
  return Object.assign(clip, {ready: waits.length ? Promise.all(waits) : null, visible: (v) => { on = v; run(); }, dispose: () => { vids.forEach((v) => v && v.pause()); tl.kill(); }});
}
