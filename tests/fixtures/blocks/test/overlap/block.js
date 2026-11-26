// wrong on purpose: two boxes of words on the same spot (a layout that collapsed)
export const css = `.b-test-overlap .ov { position: absolute; left: 10%; top: 40%; font-size: var(--title); color: var(--ink); }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<p class="ov">${cx.esc(p.text || 'First line')}</p><p class="ov">Second line here</p>`;
  return cx.fromFn(0.5, () => {});
}
