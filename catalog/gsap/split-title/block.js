// GSAP SplitText: the headline rises letter by letter out of a blur, a gold rule draws, the line under it fades up.
export const css = `
.b-gsap-split-title .cs-hero { overflow: visible; }
.b-gsap-split-title .ch { display: inline-block; will-change: transform, opacity, filter; }
.b-gsap-split-title .cs-rule { width: calc(var(--hero) * 1.1); }
.b-gsap-split-title .cs-lead { max-width: 24em; }
`;
export default function mount(el, p, cx) {
  const [SplitText] = cx.plugin('SplitText');
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="cs-hero">${cx.esc(p.title)}</h2>
    <i class="cs-rule"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const g = cx.gsap, q = (s) => el.querySelector(s);
  const split = new SplitText(q('.cs-hero'), {type: 'words,chars', charsClass: 'ch', wordsClass: 'cs-w'});
  const tl = g.timeline({paused: true});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -24}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(split.chars, {opacity: 0, yPercent: 60, filter: 'blur(14px)'}, {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: {each: 0.028}}, 0.15);
  tl.fromTo(q('.cs-rule'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.7);
  if (q('.cs-lead')) tl.fromTo(q('.cs-lead'), {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.0);
  return cx.fromGsap(tl);
}
