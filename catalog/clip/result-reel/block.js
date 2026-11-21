// A reel of result clips: one plays large (about 70 % of the slide), the others wait as stills in small frames beside it.
// Every step the large clip and the next one trade places. One click per clip on a slide; on a web page the scroll moves through the reel and winds the film.
// Nothing is drawn on the pictures: the labels stand under them.
export const css = `
.b-clip-result-reel .wrap { position: absolute; inset: calc(var(--pad) * 0.42 + var(--top)) calc(var(--pad) * 0.5) calc(var(--pad) * 0.42); margin: 0 auto; max-width: calc(((100cqh - var(--top) - var(--pad) * 0.84 - var(--title) * 1.62) * 1.7778 + var(--gap) * 0.8) / (1 - var(--sidef, 0.235)));
  display: grid; grid-template-columns: minmax(0, 1fr) calc(var(--sidef, 0.235) * 100%); grid-template-rows: auto auto; column-gap: calc(var(--gap) * 0.8); row-gap: calc(var(--gap) * 0.56); align-content: center; }
.b-clip-result-reel .slot { display: block; width: 100%; aspect-ratio: 16 / 9; }
.b-clip-result-reel .side { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); min-width: 0; }
.b-clip-result-reel .cell { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.26); min-width: 0; }
.b-clip-result-reel .mini { display: grid; }
.b-clip-result-reel .mini span { grid-area: 1 / 1; font-size: var(--label); letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.b-clip-result-reel .caps { display: grid; align-content: start; min-width: 0; }
.b-clip-result-reel .cp { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.24); }
.b-clip-result-reel .cp .cs-title { font-size: calc(var(--title) * 0.62); }
.b-clip-result-reel .count { display: flex; flex-direction: column; justify-content: flex-start; gap: calc(var(--gap) * 0.4); min-width: 0; }
.b-clip-result-reel .count .n { display: flex; align-items: baseline; gap: 0.3em; font-size: calc(var(--title) * 0.62); font-weight: var(--thin); letter-spacing: -0.02em; line-height: 1.04; color: var(--ink); margin-top: calc(var(--label) * 1.3 + var(--gap) * 0.24); }
.b-clip-result-reel .count .n small { font-size: var(--label); letter-spacing: 0.14em; color: var(--dim); }
.b-clip-result-reel .segs { display: flex; gap: 0.5em; }
.b-clip-result-reel .segs b { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-clip-result-reel .segs b i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.b-clip-result-reel .tile { position: absolute; left: 0; top: 0; overflow: hidden; background: #000; border-radius: calc(var(--radius) * 0.5); border: 1px solid var(--line); will-change: transform, width, height; }
.b-clip-result-reel .tile > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .wrap { inset: calc(var(--pad) * 0.7 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.8); max-width: none; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto auto; row-gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .side { flex-direction: row; grid-row: 3; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .cell { flex: 1 1 0; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .caps { grid-row: 2; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .count { grid-row: 4; flex-direction: row; align-items: center; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .count .n { margin-top: 0; font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .segs { flex: 1; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .cp .cs-title { font-size: calc(var(--title) * 0.86); }
`;
export default function mount(el, p, cx) {
  const items = (p.items || []).slice(0, 4), n = items.length, G = window.CS || {};
  const seg = cx.clamp(Number(p.seconds) || 2, 1.2, 4), T = (k) => 0.2 + k * seg, dur = T(n), pad2 = (k) => String(k).padStart(2, '0');
  const isV = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  el.innerHTML = `<div class="wrap">
    <i class="slot big" aria-hidden="true"></i>
    <div class="side">${items.slice(1).map((_, j) => `<div class="cell"><i class="slot sm" aria-hidden="true"></i><div class="mini">${[j + 1, j].map((c) => `<span data-c="${c}">${cx.esc(items[c].label || items[c].title || '')}</span>`).join('')}</div></div>`).join('')}</div>
    <div class="caps">${items.map((it) => `<div class="cp">${it.label ? `<div class="cs-kicker">${cx.esc(it.label)}</div>` : ''}${it.title ? `<h3 class="cs-title">${cx.esc(it.title)}</h3>` : ''}</div>`).join('')}</div>
    <div class="count" aria-hidden="true"><div class="n cs-num"><span class="now">01</span><small>/ ${pad2(n)}</small></div><div class="segs">${items.map(() => '<b><i></i></b>').join('')}</div></div>
    ${items.map((it, i) => `<div class="tile">${isV(it.src)
      ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted playsinline preload="auto" aria-label="${cx.esc(it.alt || it.title || it.label || 'Result clip ' + (i + 1))}"></video>`
      : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.title || it.label || 'Result ' + (i + 1))}">`}</div>`).join('')}
  </div>`;
  const all = (s) => [...el.querySelectorAll(s)], wrap = el.querySelector('.wrap');
  if (n > 3) wrap.style.setProperty('--sidef', 0.157);      // three small frames must fit beside the large one
  const tiles = all('.tile'), big = el.querySelector('.slot.big'), sms = all('.slot.sm'), caps = all('.cp'), minis = all('.mini'), fills = all('.segs i'), now = el.querySelector('.now');
  const vids = tiles.map((t) => t.querySelector('video'));
  const want = [];      // the video time every clip should show
  vids.forEach((v, i) => { if (!v) return; v.muted = true; v.loop = true; v.addEventListener('loadedmetadata', () => { if (v.paused && want[i] > 0.04 && Math.abs(v.currentTime - want[i]) > 0.04) v.currentTime = want[i]; }); });
  // where the frames are (layout px inside .wrap); measured again when the frame changes size
  let R = null;
  const rect = (s) => { let x = 0, y = 0, e = s; while (e && e !== wrap) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y, s.offsetWidth, s.offsetHeight]; };
  const measure = () => { R = {big: rect(big), sm: sms.map(rect)}; };
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const mode = () => (cx.stage === 'deck' && !G.reduced ? 'live' : 'wind');
  const film = cx.fromFn(dur, (t, exact) => {
    if (!R || !R.big[2]) measure();
    const eIn = (k) => (k <= 0 ? 1 : k >= n ? 0 : cx.prog(t, T(k) + 0.16, 0.84, 'inOut')), eOut = (k) => (k <= 0 ? 1 : k >= n ? 0 : cx.prog(t, T(k), 0.8, 'inOut'));     // how far swap k has gone: the large clip leaves first, the next one follows
    let cur = 0; for (let k = 1; k < n; k++) if (t >= T(k) + 0.45) cur = k;
    tiles.forEach((tile, i) => {
      const start = i === 0 ? R.big : R.sm[i - 1], back = i < n - 1 ? R.sm[i] : R.big, a = eIn(i), b = eOut(i + 1);
      const r = mix(mix(start, R.big, a), back, b), inn = cx.prog(t, 0.05 + i * 0.12, 0.8, 'out');
      tile.style.width = r[2].toFixed(2) + 'px'; tile.style.height = r[3].toFixed(2) + 'px';
      tile.style.transform = 'translate3d(' + r[0].toFixed(2) + 'px,' + (r[1] + (1 - inn) * 40).toFixed(2) + 'px,0)';
      tile.style.opacity = inn; tile.style.zIndex = (a > 0 && a < 1) || (i === cur && b === 0) ? 3 : b > 0 && b < 1 ? 2 : 1;
    });
    caps.forEach((c, i) => { const a = (i === 0 ? cx.prog(t, 0.35, 0.6, 'out') : cx.prog(t, T(i) + 0.4, 0.5, 'out')), b = i < n - 1 ? cx.prog(t, T(i + 1), 0.3, 'lin') : 0; c.style.opacity = a * (1 - b); c.style.transform = 'translateY(' + ((1 - a) * 18 - b * 10).toFixed(1) + 'px)'; c.style.visibility = a * (1 - b) > 0.01 ? '' : 'hidden'; });
    minis.forEach((m, j) => { const sw = cx.prog(t, T(j + 1), 0.3, 'lin'), inn = cx.prog(t, 0.5 + j * 0.12, 0.6, 'out'), bk = cx.prog(t, T(j + 1) + 0.55, 0.4, 'out'); m.children[0].style.opacity = inn * (1 - sw); m.children[1].style.opacity = bk; });
    fills.forEach((f, i) => { f.style.transform = 'scaleX(' + (i === 0 ? cx.prog(t, 0.3, 0.7, 'out') : cx.prog(t, T(i) + 0.3, 0.7, 'out')) + ')'; });
    now.textContent = pad2(cur + 1);
    // film: the large clip runs, the others hold a still
    const md = exact ? 'exact' : mode(), waits = [];
    vids.forEach((v, i) => {
      if (!v) return;
      const at = Number(items[i].at) || 0, a0 = i === 0 ? 0.2 : T(i) + 0.3, a1 = i < n - 1 ? T(i + 1) + 0.3 : dur, active = t >= a0 && (t < a1 || i === n - 1);
      let tt = at + cx.clamp(t - a0, 0, a1 - a0); const d = v.duration || 0; if (d && tt >= d - 0.02) tt = tt % d;
      want[i] = tt;
      if (md === 'live') {
        if (active) { if (v.paused) { if (t - a0 < 0.3 && Math.abs(v.currentTime - tt) > 0.3) v.currentTime = tt; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } }
        else { if (!v.paused) v.pause(); if (t < a0 && Math.abs(v.currentTime - at) > 0.04) v.currentTime = at; }
        return;
      }
      if (!v.paused) v.pause();
      if (v.error || v.readyState < 1) return;
      if (md === 'exact') {
        if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
        waits.push(new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; }));
      } else if (Math.abs(v.currentTime - tt) > 0.04 && !v.seeking) v.currentTime = tt;      // the scroll winds the film
    });
    if (waits.length) return Promise.all(waits);
  }, {steps: Array.from({length: Math.max(0, n - 1)}, (_, k) => T(k + 1))});
  const pending = vids.filter((v) => v && v.readyState < 2);
  const ready = pending.length ? Promise.all(pending.map((v) => new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); }))) : null;
  return Object.assign(film, {lib: 'fn', ready, fit: () => { measure(); },
    visible: (on) => { if (!on) vids.forEach((v) => { if (v && !v.paused) v.pause(); }); },
    dispose: () => vids.forEach((v) => v && v.pause())});
}
