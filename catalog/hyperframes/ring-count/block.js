// A HyperFrames block (HTML + CSS + a paused GSAP timeline), played as it is inside an iframe:
// a gold ring closes around a number that counts up to yours (GSAP DrawSVG + snap), the unit and one line slide in.
// On a phone the same file gets a few extra CSS lines so the words go under the ring.
const TALL = `[data-composition-id="ring-count"] { width: 560px; height: 800px; }
[data-composition-id="ring-count"] .ring { left: 80px; } [data-composition-id="ring-count"] .num { left: 80px; }
[data-composition-id="ring-count"] .side { left: 30px; right: 30px; top: 440px; bottom: 0; justify-content: flex-start; align-items: center; text-align: center; }
[data-composition-id="ring-count"] .unit { font-size: 50px; text-indent: 0.26em; } [data-composition-id="ring-count"] .label { font-size: 40px; }
[data-composition-id="ring-count"] .rule { transform-origin: 50% 50%; }`;
export default function mount(el, p, cx) {
  const tall = cx.shape === 'tall';
  const html = tall ? cx.meta.data['block.html'].replace('</style>', TALL + '</style>') : cx.meta.data['block.html'];
  return cx.fromHyperframes(el, html, {canvas: tall ? [560, 800] : [1000, 420], dur: 1.9, scale: tall ? 0.9 : 0.78,
    text: {'.num': String(Math.round(Number(p.value) || 0)), '.unit': p.unit || '', '.label': p.label || ''}, title: (p.value || '') + ' ' + (p.unit || '')});
}
