// Your own HyperFrames block: one HTML file with CSS and a paused GSAP timeline in window.__timelines.
// Give "src": the build puts the file into the page (a page opened by double click cannot fetch it). The stage only moves its timeline.
// Without src the kit's own block plays, which is a good file to copy and change.
const TALL = `[data-composition-id="note-card"] { width: 760px; height: 760px; padding: 50px 46px; }
[data-composition-id="note-card"] .hf-title { font-size: 104px; white-space: normal; } [data-composition-id="note-card"] .hf-sub { font-size: 42px; } [data-composition-id="note-card"] .hf-kicker { font-size: 30px; letter-spacing: 0.28em; }`;
export default function mount(el, p, cx) {
  const own = typeof p.data === 'string' && p.data, tall = cx.shape === 'tall';
  const text = own ? (p.text && typeof p.text === 'object' ? p.text : {}) : {'.hf-title': p.title || 'HTML and a timeline', '.hf-sub': p.caption || '', '.hf-kicker': p.kicker || 'HyperFrames block'};
  const html = own || (tall ? cx.meta.data['block.html'].replace('</style>', TALL + '</style>') : cx.meta.data['block.html']);
  return cx.fromHyperframes(el, html, {canvas: own ? p.canvas || [1920, 1080] : tall ? [760, 760] : [1600, 560], dur: Number(p.dur) || (own ? 3 : 2.2),
    scale: p.scale || (tall ? 0.9 : 0.8), text, title: p.title || 'HyperFrames block'});
}
