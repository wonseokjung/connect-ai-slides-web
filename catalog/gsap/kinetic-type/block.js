// GSAP: three to five words take the whole screen one after another (mask rise, wipe, weight and tracking change, drop),
// then all of them settle into one lockup: lines of different sizes, each as wide as the block, and one word turns gold.
// Type sizes are computed from the frame (cqw / cqh), so every word fills the width on a slide, a web screen and a phone.
export const css = `
.b-gsap-kinetic-type .kk { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .stage { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6 + var(--label) * 2.5); bottom: calc(var(--pad) * 0.62); }
.b-gsap-kinetic-type .stage.nok { top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .w { position: absolute; left: 50%; top: 50%; white-space: nowrap; font-size: 10cqw; font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.86; color: var(--ink); opacity: 0; }
.b-gsap-kinetic-type .m { display: block; padding: 0.16em 0.08em; margin: -0.16em -0.08em; overflow: hidden; }
.b-gsap-kinetic-type .g { display: block; will-change: transform; }
.b-gsap-kinetic-type .cs-rule { position: absolute; }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words || []).slice(0, 5).map(String), n = words.length;
  const gi = p.gold == null ? n - 1 : typeof p.gold === 'number' ? p.gold - 1 : words.indexOf(String(p.gold));
  el.innerHTML = `${p.kicker ? `<div class="kk cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="stage${p.kicker ? '' : ' nok'}">${words.map((w) => `<span class="w"><span class="m"><span class="g">${cx.esc(w)}</span></span></span>`).join('')}<i class="cs-rule" aria-hidden="true"></i></div>`;
  const q = (s) => el.querySelector(s), stage = q('.stage'), ws = [...el.querySelectorAll('.w')], rule = q('.cs-rule');
  const LH = 0.86, GAP = 0.26;
  let tl = null, cur = 0, lock = [];
  function lay() {
    const W = el.clientWidth, H = el.clientHeight, SW = stage.clientWidth, SH = stage.clientHeight; if (!W || !SW || !n) return false;
    // how wide each word is per 1 px of type, then the size at which it fills the stage
    const ratio = ws.map((w) => { w.style.fontSize = '10cqw'; return w.offsetWidth / (parseFloat(getComputedStyle(w).fontSize) || 1); });
    ws.forEach((w, i) => { w.style.fontSize = `min(${((SW / W) * 100 / ratio[i]).toFixed(3)}cqw, ${((SH / H) * 100 / 0.92).toFixed(3)}cqh)`; });
    const solo = ws.map((w) => parseFloat(getComputedStyle(w).fontSize));
    // the lockup: try every way to break the words into lines, keep the one that covers the most of the stage
    let best = null;
    for (let mask = 0; mask < 1 << (n - 1); mask++) {
      const lines = [[0]]; for (let i = 1; i < n; i++) { if ((mask >> (i - 1)) & 1) lines.push([i]); else lines[lines.length - 1].push(i); }
      const rs = lines.map((l) => l.reduce((s, i) => s + ratio[i], 0) + GAP * (l.length - 1)), inv = rs.reduce((s, r) => s + 1 / r, 0);
      const wl = Math.min(SW, SH / (LH * inv)), area = wl * wl * LH * inv;
      if (!best || area > best.area * 1.001) best = {lines, rs, wl, area, h: wl * LH * inv};
    }
    const x0 = (SW - best.wl) / 2; let y = (SH - best.h) / 2;
    best.lines.forEach((l, k) => {
      const fs = best.wl / best.rs[k]; let x = x0;
      l.forEach((i) => { const wpx = ratio[i] * fs; lock[i] = {x: x + wpx / 2 - SW / 2, y: y + (fs * LH) / 2 - SH / 2, scale: fs / solo[i], line: k}; x += wpx + GAP * fs; });
      y += fs * LH;
    });
    rule.style.left = x0 + 'px'; rule.style.top = Math.min(SH + (el.clientHeight - stage.offsetTop - SH) * 0.5, y + SH * 0.035) + 'px';
    return true;
  }
  function make() {
    if (tl) tl.kill();
    g.set([...ws, ...el.querySelectorAll('.m, .g, .kk, .cs-rule')], {clearProps: 'transform,opacity,clipPath,color,letterSpacing,fontWeight,x,y,scale,xPercent,yPercent'});
    lay();
    const thin = parseInt(getComputedStyle(ws[0] || el).fontWeight, 10) || 200, gold = getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A';
    g.set(ws, {xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: 0});
    tl = g.timeline({paused: true});
    if (q('.kk')) tl.fromTo(q('.kk'), {opacity: 0, x: -18}, {opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'}, 0);
    const slot = cx.clamp(2.3 / n, 0.5, 0.7), di = Math.min(0.46, slot * 0.74), S0 = 0.05, TL = S0 + slot * n;
    ws.forEach((w, k) => {
      const m = w.querySelector('.m'), gl = w.querySelector('.g'), S = S0 + slot * k, O = S + slot - 0.03, last = k === n - 1, kind = k % 4;
      tl.set(w, {opacity: 1}, S);
      // in
      if (kind === 0) { tl.fromTo(gl, {yPercent: 140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S); tl.fromTo(gl, {letterSpacing: '0.1em'}, {letterSpacing: '-0.04em', duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 1) { tl.fromTo(m, {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: di, ease: 'power3.inOut'}, S); tl.fromTo(gl, {xPercent: -5}, {xPercent: 0, duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 2) { tl.fromTo(gl, {opacity: 0}, {opacity: 1, duration: 0.14, ease: 'none'}, S); tl.fromTo(gl, {scale: 1.16, fontWeight: 700}, {scale: 1, fontWeight: thin, duration: di + 0.1, ease: 'expo.out'}, S); }
      else tl.fromTo(gl, {yPercent: -140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S);
      if (last) { tl.to(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale, duration: 0.42, ease: 'expo.inOut'}, TL - 0.06); return; }
      // out, then wait at its place in the lockup and rise there
      if (kind === 0) tl.to(gl, {yPercent: -140, duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 1) tl.to(m, {clipPath: 'inset(0% 0% 0% 100%)', duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 2) tl.to(gl, {opacity: 0, scale: 0.94, duration: 0.18, ease: 'power1.in'}, O);
      else tl.to(gl, {yPercent: 140, duration: 0.2, ease: 'power2.in'}, O);
      tl.set(w, {opacity: 0}, O + 0.21);
      const R = TL + 0.15 + 0.05 * lock[k].line;
      tl.set(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale}, TL);
      tl.set(m, {clipPath: 'inset(0% 0% 0% 0%)'}, TL);
      tl.set(w, {opacity: 1}, R);
      tl.fromTo(gl, {yPercent: 140, opacity: 1, scale: 1, xPercent: 0}, {yPercent: 0, opacity: 1, scale: 1, xPercent: 0, duration: 0.42, ease: 'expo.out', immediateRender: false}, R);
    });
    if (gi >= 0 && ws[gi]) tl.to(ws[gi].querySelector('.g'), {color: gold, duration: 0.3, ease: 'power1.out'}, TL + 0.3);
    tl.fromTo(rule, {scaleX: 0}, {scaleX: 1, duration: 0.5, ease: 'power3.out'}, TL + 0.12);
    tl.to({}, {duration: 0.01}, TL + 0.61);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}
