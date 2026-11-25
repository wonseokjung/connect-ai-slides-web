// A very small XML reader for the parts of a .pptx we read (slides, layouts, notes, rels). No dependency, no DTD,
// no entities beyond the five standard ones and numeric ones. Good enough for Office Open XML, not a general parser.
// MIT, CONNECT AI LAB.

const ENT = {lt: '<', gt: '>', amp: '&', quot: '"', apos: "'"};
export const unent = (s) => String(s).replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return ''; } }
  return ENT[e.toLowerCase()] ?? m;
});

// node = {n: 'p:sp', a: {attr: value}, c: [child nodes or text strings]}
export function parseXml(src) {
  const root = {n: '#root', a: {}, c: []};
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<!DOCTYPE[^>]*>|<\/([^\s>]+)\s*>|<([^\s/>]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[1] != null) top.c.push(m[1]);
    else if (m[2]) { // closing tag: pop to the matching name (tolerant of a stray tag)
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].n === m[2]) { stack.length = i; break; }
    } else if (m[3]) {
      const node = {n: m[3], a: {}, c: []};
      for (const am of (m[4] || '').matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) node.a[am[1]] = unent(am[2] ?? am[3] ?? '');
      top.c.push(node);
      if (!m[5]) stack.push(node);
    } else if (m[6] != null && top !== root) top.c.push(unent(m[6]));
  }
  return root;
}

export const kids = (node, name) => (node ? node.c.filter((c) => typeof c === 'object' && (!name || c.n === name)) : []);
export const kid = (node, name) => kids(node, name)[0] || null;
// first / all descendants with this name (depth first, document order)
export function find(node, name) {
  if (!node) return null;
  for (const c of node.c) if (typeof c === 'object') { if (c.n === name) return c; const f = find(c, name); if (f) return f; }
  return null;
}
export function findAll(node, name, out = []) {
  if (!node) return out;
  for (const c of node.c) if (typeof c === 'object') { if (c.n === name) out.push(c); findAll(c, name, out); }
  return out;
}
// all text under a node (a:t / m:t / dgm text), in order
export function textOf(node) {
  if (!node) return '';
  let s = '';
  for (const c of node.c) s += typeof c === 'string' ? '' : c.n === 'a:t' || c.n === 'm:t' ? c.c.filter((x) => typeof x === 'string').join('') : c.n === 'a:br' ? '\n' : textOf(c);
  return s;
}
