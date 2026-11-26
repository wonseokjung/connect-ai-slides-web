// pro/network: nodes in layers, hairline edges draw left to right, then gold signals travel through.
export const css = `
.b-pro-network .pro-body { display: grid; grid-template-rows: minmax(0, 1fr) auto auto; gap: calc(var(--gap) * 0.5); }
.b-pro-network .net { position: relative; min-height: 0; margin: 0.6em 6%; font-size: var(--body); }
.b-pro-network svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-pro-network .ed { stroke: color-mix(in srgb, var(--ink) 34%, transparent); stroke-width: 1.4; vector-effect: non-scaling-stroke; }
.b-pro-network .nd { position: absolute; width: 3em; height: 3em; margin: -1.5em 0 0 -1.5em; border-radius: 50%; border: 1.5px solid var(--gold2); background: var(--bg); display: grid; place-items: center; font-size: var(--body); color: var(--ink); }
.b-pro-network .nd.mid { border-color: color-mix(in srgb, var(--ink) 55%, transparent); }
.b-pro-network .nd span { font-size: 1.05em; }
.b-pro-network .sg { position: absolute; width: 0.55em; height: 0.55em; margin: -0.275em 0 0 -0.275em; border-radius: 50%; background: var(--gold2); font-size: var(--body); box-shadow: 0 0 0.9em color-mix(in srgb, var(--gold2) 70%, transparent); }
.b-pro-network .ls { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); margin: 0 calc(6% - 2em); }
.b-pro-network .lb { text-align: center; font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--dim); }
.b-pro-network .ls .lb:first-child { text-align: left; } .b-pro-network .ls .lb:last-child { text-align: right; }
.b-pro-network .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-network .nd { font-size: var(--label); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const layers = (p.layers || []).slice(0, 5).map((L) => { const names = Array.isArray(L.nodes) ? L.nodes.slice(0, 6).map(String) : Array.from({length: Math.max(1, Math.min(6, +L.nodes || 2))}, () => ''); return {label: L.label || '', names}; });
  const n = layers.length;
  el.style.setProperty('--n', n || 1);
  const lx = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const ly = (k, m) => (m === 1 ? 50 : 8 + (k / (m - 1)) * 84);
  const nodes = layers.map((L, i) => L.names.map((nm, k) => ({x: lx(i), y: ly(k, L.names.length), nm, i})));
  const edges = []; for (let i = 0; i < n - 1; i++) for (const a of nodes[i]) for (const b of nodes[i + 1]) edges.push({a, b, i});
  // one signal per node of the first layer, following a fixed path (no randomness): node k -> k mod next layer -> ...
  const paths = (nodes[0] || []).map((st, k) => { const pts = [st]; for (let i = 1; i < n; i++) pts.push(nodes[i][(k + i) % nodes[i].length]); return pts; });
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:55%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="net"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${edges.map((e) => `<line class="ed l${e.i}" x1="${e.a.x}" y1="${e.a.y}" x2="${e.b.x}" y2="${e.b.y}"/>`).join('')}</svg>
      ${paths.map(() => '<i class="sg" aria-hidden="true"></i>').join('')}
      ${nodes.flat().map((d) => `<div class="nd${d.i > 0 && d.i < n - 1 ? ' mid' : ''} L${d.i}" style="left:${d.x}%;top:${d.y}%">${d.nm ? `<span>${P.math(d.nm)}</span>` : ''}</div>`).join('')}
    </div>
    <div class="ls">${layers.map((L) => `<div class="lb">${cx.esc(L.label)}</div>`).join('')}</div>
    ${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  for (let i = 0; i < n; i++) {
    const at = t + i * 0.42;
    tl.fromTo(el.querySelectorAll('.nd.L' + i), {scale: 0, opacity: 0}, {scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.05}, at);
    tl.fromTo(el.querySelectorAll('.lb')[i], {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.6, ease: 'expo.out'}, at + 0.1);
    if (i < n - 1) tl.fromTo(el.querySelectorAll('.ed.l' + i), {opacity: 0}, {opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.01}, at + 0.25);
  }
  const s0 = t + n * 0.42 + 0.2, leg = 0.55;
  el.querySelectorAll('.sg').forEach((sg, k) => {
    const pts = paths[k];
    tl.set(sg, {left: pts[0].x + '%', top: pts[0].y + '%', opacity: 0}, 0);
    tl.to(sg, {opacity: 1, duration: 0.15}, s0 + k * 0.08);
    for (let j = 1; j < pts.length; j++) tl.to(sg, {left: pts[j].x + '%', top: pts[j].y + '%', duration: leg, ease: 'power1.inOut'}, s0 + k * 0.08 + (j - 1) * leg);
    tl.to(sg, {opacity: 0, duration: 0.3}, s0 + k * 0.08 + (pts.length - 1) * leg);
  });
  const fin = s0 + (paths.length ? (paths.length - 1) * 0.08 + (n - 1) * leg : 0);
  if (n > 1) tl.fromTo(el.querySelectorAll('.nd.L' + (n - 1)), {backgroundColor: 'rgba(0,0,0,0)'}, {backgroundColor: 'color-mix(in srgb, var(--gold) 28%, var(--bg))', duration: 0.5, stagger: 0.05}, fin - 0.1);
  P.rise(tl, el.querySelector('.nt'), fin, {y: 10});
  return P.clip(cx, tl, el);
}
