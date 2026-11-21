// GSAP: one or two very large words fill the width of the frame and their letters are windows: a clip runs inside the letter shapes.
// The letters come out of a blur one after another (GSAP stagger from the centre) and a line of text settles under them.
// How: the clip lies under a layer in the background colour whose letters are white, blended with "darken" (the white lets the clip through).
// For result clips and graphics. Do not use a clip that shows a person's face: the letters would cut it up.
export const css = `
.b-gsap-video-in-type .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.62 + var(--top)) calc(var(--pad) * 0.36) calc(var(--pad) * 0.62); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.5); }
.b-gsap-video-in-type .top, .b-gsap-video-in-type .low { display: flex; align-items: baseline; justify-content: space-between; gap: var(--gap); padding: 0 calc(var(--pad) * 0.64); }
.b-gsap-video-in-type .win { position: relative; isolation: isolate; }
.b-gsap-video-in-type .vid { position: absolute; inset: 0; overflow: hidden; background: var(--gold); }
.b-gsap-video-in-type .vid > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-gsap-video-in-type .mask { position: relative; margin: -1px; padding: 3cqh 1.6cqw 3cqh; display: flex; flex-direction: column; align-items: center; background: var(--bg); mix-blend-mode: darken; }
.look-paper .b-gsap-video-in-type .mask { mix-blend-mode: lighten; }
.b-gsap-video-in-type .word { display: block; white-space: nowrap; color: #fff; font-family: "Avenir Next Condensed", "Helvetica Neue Condensed", "DIN Condensed", Bahnschrift, "Arial Narrow", Impact, var(--sans); font-stretch: condensed;
  font-weight: 800; font-size: calc(var(--hero) * var(--fit, 1)); line-height: 0.9; letter-spacing: -0.012em; padding-top: 0.03em; text-transform: uppercase; }
.look-paper .b-gsap-video-in-type .word { color: #000; }
.b-gsap-video-in-type .cs-c { will-change: transform, opacity, filter; }
.b-gsap-video-in-type .rule { display: block; height: 2px; background: var(--gold); transform-origin: 0 50%; margin: 0 calc(var(--pad) * 0.64) calc(var(--gap) * 0.4); }
.b-gsap-video-in-type .low .cs-lead { color: var(--ink); font-size: calc(var(--lead) * 1.1); font-weight: var(--thin); }
.b-gsap-video-in-type .low .cs-label { text-align: right; }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .wrap { padding-left: calc(var(--pad) * 0.3); padding-right: calc(var(--pad) * 0.3); gap: calc(var(--gap) * 0.7); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .top, .cs-frame[data-shape="tall"] .b-gsap-video-in-type .low { padding: 0 calc(var(--pad) * 0.7); flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.6); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .rule { margin: 0 calc(var(--pad) * 0.7) calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .low .cs-label { text-align: left; }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  let lines = [].concat(p.word || p.words || '').map((w) => String(w)).filter(Boolean).slice(0, 2);
  const full = lines.join(' ');
  // on a phone one long word is set in two rows, so the letters stay large enough to see the clip
  if (cx.shape === 'tall' && lines.length === 1) { const ch = Array.from(lines[0]); if (ch.length >= 5) { const h = Math.ceil(ch.length / 2); lines = [ch.slice(0, h).join(''), ch.slice(h).join('')]; } }
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Clip inside the letters')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Picture inside the letters')}">`;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.tag ? `<div class="top">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : '<span></span>'}${p.tag ? `<div class="cs-label">${cx.esc(p.tag)}</div>` : ''}</div>` : ''}
    <div class="win"><div class="vid">${media}</div><h2 class="mask" aria-label="${cx.esc(full)}">${lines.map((w) => `<span class="word">${cx.spans(w, 'cs-c', 'chars')}</span>`).join('')}</h2></div>
    <i class="rule" aria-hidden="true"></i>
    ${p.sub || p.note ? `<div class="low">${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : '<span></span>'}${p.note ? `<span class="cs-label">${cx.esc(p.note)}</span>` : ''}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), all = (s) => [...el.querySelectorAll(s)], m = q('.vid > *'), words = all('.word'), wrap = q('.wrap'), win = q('.win');
  // every word is set as wide as the frame; the type size follows from that (and is held back if the words would get too tall)
  const fit = () => {
    const cs = getComputedStyle(wrap), ms = getComputedStyle(q('.mask')), room = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(ms.paddingLeft) - parseFloat(ms.paddingRight);
    if (!(room > 0)) return;
    words.forEach((w) => w.style.setProperty('--fit', 1));
    const fits = words.map((w) => room / Math.max(1, w.scrollWidth));
    words.forEach((w, i) => w.style.setProperty('--fit', fits[i].toFixed(4)));
    const tall = win.offsetHeight, most = wrap.clientHeight * (cx.shape === 'tall' ? 0.6 : 0.64);
    if (tall > most) words.forEach((w, i) => w.style.setProperty('--fit', (fits[i] * most / tall).toFixed(4)));
  };
  fit();
  const tl = g.timeline({paused: true});
  const cs = all('.cs-c');
  tl.fromTo(cs, {opacity: 0, filter: 'blur(0.045em)', scale: 1.16, yPercent: 6}, {opacity: 1, filter: 'blur(0em)', scale: 1, yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: {each: 0.07, from: 'center'}}, 0.1);
  tl.fromTo(m, {scale: 1.1}, {scale: 1, duration: 2.6, ease: 'power2.out'}, 0);
  if (q('.top')) tl.fromTo(all('.top > *'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0.25);
  tl.fromTo(q('.rule'), {scaleX: 0}, {scaleX: 1, duration: 1.0, ease: 'expo.out'}, 1.0);
  if (q('.low')) tl.fromTo(all('.low > *'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12}, 1.25);
  const clip = Object.assign(cx.fromGsap(tl), {fit});
  if (!isVideo) return clip;
  return Object.assign(cx.all(clip, cx.fromVideo(m)), {fit});
}
