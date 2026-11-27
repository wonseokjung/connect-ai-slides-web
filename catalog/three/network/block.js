// three/network: a neural network as a real 3D object. Layers of glossy spheres stand in depth, every neighbouring
// pair is joined by a thin fibre, and light travels the fibres layer to layer while the camera slowly circles in.
// Node names and layer names are real text that ride their spheres. Everything is a function of t.
export const css = `
.b-three-network { overflow: hidden; }
.b-three-network canvas.tn-gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; z-index: 0; }
.b-three-network .tn-labs { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.b-three-network .tn-n { position: absolute; left: 0; top: 0; font-family: var(--serif); font-size: calc(var(--lead) * 0.95); color: var(--ink); white-space: nowrap; }
.b-three-network .tn-n.out { color: var(--gold2); }
.b-three-network .tn-l { position: absolute; left: 0; top: 0; transform: translate(-50%, 0); font-size: calc(var(--label) * 1.3); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); white-space: nowrap; }
.b-three-network .tn-nt { position: absolute; left: var(--pad); bottom: calc(var(--pad) * 0.9); z-index: 1; font-size: calc(var(--body) * 0.8); color: var(--dim); }
.b-three-network .pro-wrap { pointer-events: none; }
.cs-frame[data-shape="tall"] .b-three-network .tn-n { font-size: var(--label); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const layers = (p.layers || []).slice(0, 5).map((l) => {
    const names = Array.isArray(l.nodes) ? l.nodes.map(String).slice(0, 7) : null;
    const n = names ? names.length : Math.max(1, Math.min(7, +l.nodes || 3));
    return {label: l.label || '', n, names};
  });
  const L = layers.length || 1;
  el.innerHTML = `<div class="tn-labs" aria-hidden="false">${layers.map((l, i) => `${(l.names || []).map((nm, j) => `<span class="tn-n${i === L - 1 ? ' out' : ''}" data-l="${i}" data-j="${j}">${P.math(nm)}</span>`).join('')}${l.label ? `<span class="tn-l" data-l="${i}">${esc(l.label)}</span>` : ''}`).join('')}</div>
    <div class="pro-wrap">${P.head(p)}<div class="pro-body"></div>${P.foot(cx)}</div>${p.note ? `<p class="tn-nt">${esc(p.note)}</p>` : ''}`;
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  P.rise(tl, el.querySelector('.tn-nt'), t0 + 1.6, {y: 10});
  const ENT = t0 + 0.1, LAYER = 0.32, EDGES = ENT + L * LAYER + 0.2, PULSE = EDGES + 0.6, END = PULSE + 0.8;
  tl.to({}, {duration: 0.01}, END);
  const T = window.CSThree && window.CSThree.THREE;
  const nl = [...el.querySelectorAll('.tn-n')], ll = [...el.querySelectorAll('.tn-l')];
  if (!T) { nl.concat(ll).forEach((x) => { x.style.position = 'static'; }); return cx.vis.ambient(tl, el, () => {}, {}); }
  const pal = cx.vis.palette(el), light = pal.light;
  const W = el.offsetWidth || cx.w, H = el.offsetHeight || cx.h;
  const canvas = document.createElement('canvas'); canvas.className = 'tn-gl'; canvas.setAttribute('aria-hidden', 'true'); canvas.dataset.deco = '';
  el.insertBefore(canvas, el.firstChild);
  const renderer = new T.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(cx.capturing ? 1 : Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = light ? 1.05 : 1.15;
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const disp = [];
  const keep = (x) => { disp.push(x); return x; };
  // a small studio for reflections: a dark room with three soft panels (gold, warm white, cool)
  const room = new T.Scene();
  const rg = keep(new T.BoxGeometry(1, 1, 1));
  const roomBox = new T.Mesh(rg, keep(new T.MeshBasicMaterial({color: light ? 0xb8ab96 : 0x0a0908, side: T.BackSide}))); roomBox.scale.set(20, 12, 20); room.add(roomBox);
  [[0xffe2b8, 3.2, [-5, 4, 6], [6, 3, 0.2]], [new T.Color(pal.gold).getHex(), 2.4, [6, 2, -5], [5, 4, 0.2]], [0xbcd0e6, 0.9, [0, -5, 2], [8, 0.3, 4]]].forEach(([c, k, pos, sc]) => { const m = new T.Mesh(rg, keep(new T.MeshBasicMaterial({color: new T.Color(c).multiplyScalar(k)}))); m.position.set(...pos); m.scale.set(...sc); m.lookAt(0, 0, 0); room.add(m); });
  const pm = new T.PMREMGenerator(renderer); const envRT = pm.fromScene(room, 0.03); scene.environment = envRT.texture; pm.dispose(); disp.push(envRT);
  const key = new T.DirectionalLight(0xfff0dc, light ? 2.2 : 2.6); key.position.set(-4, 6, 7); scene.add(key);
  const rim = new T.PointLight(new T.Color(pal.gold2), 40, 30, 1.6); rim.position.set(5, 3, -5); scene.add(rim);
  // layout: layers left to right (a phone: top to bottom), nodes across, a little depth for parallax
  const GAP = tall ? 2.6 : 5.0, NG = tall ? 1.55 : 1.4, R = tall ? 0.42 : 0.52;
  const maxN = Math.max(...layers.map((l) => l.n));
  const pos = layers.map((l, i) => Array.from({length: l.n}, (_, j) => {
    const a = (i - (L - 1) / 2) * GAP, b = ((l.n - 1) / 2 - j) * NG, z = Math.sin(i * 1.7 + j * 2.3) * 0.35;
    return tall ? new T.Vector3(-b, -a, z) : new T.Vector3(a, b, z);
  }));
  const sg = keep(new T.SphereGeometry(R, 64, 40));
  const mGlass = keep(light ? new T.MeshPhysicalMaterial({color: 0xf3ece0, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15, emissive: new T.Color(pal.gold), emissiveIntensity: 0})
    : new T.MeshPhysicalMaterial({color: 0x5a4630, roughness: 0.22, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.22, emissive: new T.Color(pal.gold), emissiveIntensity: 0}));
  const mGold = keep(new T.MeshPhysicalMaterial({color: new T.Color(pal.gold2), roughness: 0.3, metalness: 1, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: new T.Color(pal.gold), emissiveIntensity: 0.15}));
  const nodes = layers.map((l, i) => pos[i].map((v) => { const mat = i === L - 1 ? mGold.clone() : mGlass.clone(); keep(mat); const m = new T.Mesh(sg, mat); m.position.copy(v); scene.add(m); return m; }));
  // fibres: one segment per neighbouring pair, colour per vertex so a fibre brightens while light runs in it
  const pairs = [];
  for (let i = 0; i < L - 1; i++) for (let a = 0; a < layers[i].n; a++) for (let b = 0; b < layers[i + 1].n; b++) pairs.push({i, a, b, A: pos[i][a], B: pos[i + 1][b]});
  const eg = keep(new T.BufferGeometry());
  const ep = new Float32Array(pairs.length * 6), ec = new Float32Array(pairs.length * 6);
  pairs.forEach((q, k) => { ep.set([q.A.x, q.A.y, q.A.z, q.B.x, q.B.y, q.B.z], k * 6); });
  eg.setAttribute('position', new T.BufferAttribute(ep, 3)); eg.setAttribute('color', new T.BufferAttribute(ec, 3));
  const em = keep(new T.LineBasicMaterial({vertexColors: true, transparent: true, opacity: 1, blending: light ? T.NormalBlending : T.AdditiveBlending, depthWrite: false}));
  const edges = new T.LineSegments(eg, em); scene.add(edges);
  // light in the fibre: a bright head and a fading tail, as sprites with a soft round texture (made here, no file)
  const tc = document.createElement('canvas'); tc.width = tc.height = 128; const g2 = tc.getContext('2d');
  const gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,248,232,1)'); gr.addColorStop(0.18, 'rgba(255,214,150,0.9)'); gr.addColorStop(0.45, 'rgba(214,137,42,0.35)'); gr.addColorStop(1, 'rgba(214,137,42,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128);
  const tex = keep(new T.CanvasTexture(tc)); tex.colorSpace = T.SRGBColorSpace;
  const TRAIL = 9, WAVES = 2;
  const spMat = keep(new T.SpriteMaterial({map: tex, blending: light ? T.NormalBlending : T.AdditiveBlending, depthWrite: false, transparent: true}));
  const sprites = [];
  for (let w = 0; w < WAVES; w++) pairs.forEach((q, k) => { for (let s = 0; s < TRAIL; s++) { const m = spMat.clone(); keep(m); const sp = new T.Sprite(m); sp.visible = false; scene.add(sp); sprites.push({sp, k, w, s}); } });
  const halos = nodes.map((arr) => arr.map((m) => { const hm = spMat.clone(); keep(hm); const h = new T.Sprite(hm); h.visible = false; scene.add(h); return h; }));
  const hsh = (i) => { const x = Math.sin(i * 12.9898 + 7.7) * 43758.5453; return x - Math.floor(x); };
  const jit = pairs.map((_, k) => hsh(k) * 0.22);
  // camera: fits the network, circles slowly and pushes in
  const cam = new T.PerspectiveCamera(30, W / H, 0.1, 200);
  const spanX = tall ? (maxN - 1) * NG + R * 4 : (L - 1) * GAP + R * 4, spanY = tall ? (L - 1) * GAP + R * 4 : (maxN - 1) * NG + R * 4;
  const vt = Math.tan((cam.fov * Math.PI) / 360), ht = vt * (W / H);
  const D = Math.max(spanX / (2 * ht * (tall ? 0.78 : 0.9)), spanY / (2 * vt * (tall ? 0.62 : 0.6)));
  // the network sits in the body area under the title: shift the picture down
  const headEl = el.querySelector('.pro-head'), k0 = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1;
  const headB = headEl ? (headEl.getBoundingClientRect().bottom - el.getBoundingClientRect().top) / k0 : H * 0.2;
  const footEl = el.querySelector('.pro-foot'); const footH = footEl ? (el.getBoundingClientRect().bottom - footEl.getBoundingClientRect().top) / k0 + 36 : H * 0.12;
  const padX = headEl ? (headEl.getBoundingClientRect().left - el.getBoundingClientRect().left) / k0 : 24;
  const dy = Math.max(0, headB * 0.5 - (tall ? 0 : H * 0.02));
  cam.setViewOffset(W, H, 0, -dy, W, H);
  const bgC = new T.Color(pal.bg), v = new T.Vector3(), base = new T.Color(light ? pal.gold : pal.gold), dimC = new T.Color(light ? 0x6b5a40 : 0x8f6a2e);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), eo = (x) => 1 - Math.pow(1 - x, 3), eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const HOP = 0.85, C = Math.max(1, L - 1) + 0.6;
  function render(t) {
    // camera
    const push = eo(clamp((t - t0 + 0.4) / 3.2, 0, 1)), ang = -0.42 + 0.3 * push + 0.035 * Math.max(0, t - END), el2 = 0.18 - 0.06 * push;
    const dist = D * (1.28 - 0.28 * push);
    cam.position.set(Math.sin(ang) * Math.cos(el2) * dist, Math.sin(el2) * dist, Math.cos(ang) * Math.cos(el2) * dist);
    cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    // nodes rise in, layer by layer; a node glows when light arrives
    const glow = layers.map((l) => new Array(l.n).fill(0));
    const g = (t - PULSE) / HOP;
    nodes.forEach((arr, i) => arr.forEach((m, j) => { const e = eo(clamp((t - ENT - i * LAYER - j * 0.05) / 0.8, 0, 1)); m.scale.setScalar(0.001 + e); m.position.copy(pos[i][j]); if (tall) m.position.x -= (1 - e) * 0; m.position.y += (1 - e) * (tall ? 0 : -1.2); m.position.z += (1 - e) * 2.5; }));
    // fibres and their light
    const heat = new Float32Array(pairs.length);
    sprites.forEach((o) => {
      const q = pairs[o.k];
      let u = -1;
      if (t >= PULSE) { const gw = g + o.w * (C / WAVES), cyc = gw - Math.floor(gw / C) * C; u = cyc - q.i - jit[o.k]; }
      const f = u - o.s * 0.028;
      if (u < 0 || f < 0 || f > 1) { o.sp.visible = false; return; }
      const fe = eio(f);
      v.copy(q.A).lerp(q.B, fe); o.sp.position.copy(v); o.sp.visible = true;
      const sz = (o.s === 0 ? 0.8 : 0.5 - o.s * 0.04) * R * 2.2; o.sp.scale.set(sz, sz, 1);
      o.sp.material.opacity = (o.s === 0 ? 1 : 0.62 - o.s * 0.062) * Math.min(1, (t - PULSE) / 0.5) * (light ? 0.85 : 1);
      if (o.s === 0) { heat[o.k] = Math.max(heat[o.k], Math.sin(Math.PI * f)); if (f > 0.86) glow[q.i + 1][q.b] = Math.max(glow[q.i + 1][q.b], (f - 0.86) / 0.14); if (f < 0.14) glow[q.i][q.a] = Math.max(glow[q.i][q.a], 1 - f / 0.14); }
    });
    pairs.forEach((q, k) => {
      const d = eo(clamp((t - EDGES - q.i * 0.18 - jit[k] * 0.8) / 0.7, 0, 1));
      ep[k * 6 + 3] = q.A.x + (q.B.x - q.A.x) * d; ep[k * 6 + 4] = q.A.y + (q.B.y - q.A.y) * d; ep[k * 6 + 5] = q.A.z + (q.B.z - q.A.z) * d;
      const hk = Math.min(1, heat[k]);
      let c, a;
      if (light) { c = bgC.clone().lerp(dimC, d > 0 ? 0.42 : 0).lerp(base, hk * 0.9); a = 1; } else { c = dimC.clone().lerp(base, hk); a = (d > 0 ? 0.42 : 0) + hk * 0.7; }
      for (let s = 0; s < 2; s++) { ec[k * 6 + s * 3] = c.r * a; ec[k * 6 + s * 3 + 1] = c.g * a; ec[k * 6 + s * 3 + 2] = c.b * a; }
    });
    eg.attributes.position.needsUpdate = true;
    if (light) em.opacity = 1;
    eg.attributes.color.needsUpdate = true;
    nodes.forEach((arr, i) => arr.forEach((m, j) => { const gl = glow[i][j]; m.material.emissiveIntensity = (i === L - 1 ? 0.15 : light ? 0 : 0.07) + gl * (light ? 0.35 : 0.8); const h = halos[i][j]; h.visible = gl > 0.01; h.position.copy(m.position); const hs = R * (3.2 + 1.4 * gl); h.scale.set(hs, hs, 1); h.material.opacity = gl * (light ? 0.35 : 0.55); }));
    renderer.render(scene, cam);
    // labels ride their spheres
    const sp = (p3) => { v.copy(p3).project(cam); return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]; };
    const up = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
    const rpx = (m) => { const a = sp(m.position); const b = sp(v.copy(m.position).addScaledVector(up, R * m.scale.x)); return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    nl.forEach((s) => {
      const i = +s.dataset.l, j = +s.dataset.j, m = nodes[i][j], [x, y] = sp(m.position), r = rpx(m) + 10;
      let tr;
      if (tall) tr = `translate(${x}px, ${y + r}px) translate(-50%, 0)`;
      else if (i === 0) tr = `translate(${x - r}px, ${y}px) translate(-100%, -50%)`;
      else if (i === L - 1) tr = `translate(${x + r}px, ${y}px) translate(0, -50%)`;
      else tr = `translate(${x + r * 0.8}px, ${y - r * 0.8}px) translate(0, -100%)`;
      s.style.transform = tr; s.style.opacity = clamp((t - ENT - i * LAYER - 0.3) / 0.5, 0, 1);
    });
    // layer names share one line under (wide) or one column right of (tall) the network
    const anc = nodes.map((arr) => { if (tall) { const ys = arr.map((m) => sp(m.position)[1]); return [0, Math.min(...ys) - rpx(arr[0]) - 6]; } const m = arr[arr.length - 1], [x, y] = sp(m.position); return [x, y + rpx(m)]; });
    const lineY = Math.min(H - footH, Math.max(...anc.map((a) => a[1])) + (nl.length && tall ? 0 : 0) + 18);
    ll.forEach((s) => {
      const i = +s.dataset.l, [x, y] = anc[i];
      s.style.transform = tall ? `translate(${padX}px, ${y}px) translate(0, -100%)` : `translate(${x}px, ${lineY}px) translate(-50%, 0)`;
      s.style.opacity = clamp((t - ENT - i * LAYER - 0.45) / 0.5, 0, 1);
    });
  }
  render(0);
  return cx.vis.ambient(tl, el, render, {dur: END, dispose: () => { disp.forEach((d) => d.dispose && d.dispose()); renderer.dispose(); renderer.forceContextLoss(); }});
}
