// wrong on purpose: one line that never wraps, so it is cut off on a phone
export const css = `.b-test-wide-row .row { font-size: var(--lead); white-space: nowrap; color: var(--ink); }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><div class="row">This single line does not wrap and is wider than a phone can show</div></div>`;
  return cx.fromFn(0.5, () => {});
}
