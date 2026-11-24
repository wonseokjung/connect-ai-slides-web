// Runs inside the deck page (headless Chrome). Reads the words of one slide at its finished state as text boxes:
// where each line sits, its runs (colour, size, weight, italic, letter spacing) and the alignment, so the PPTX can
// carry the same words as real, editable text. Then it marks those words so the "plate" (the slide without its words)
// can be captured as a picture and as a clip. MIT, CONNECT AI LAB.
/* eslint-disable no-var */
window.__csPageText = function (i) {
  var D = document;
  var sec = D.querySelector('.reveal .slides').children[i];
  var frame = sec.querySelector('.cs-frame') || sec;
  var sr = sec.getBoundingClientRect();
  var k = sr.width / 1920 || 1;                  // reveal.js scale of the 1920x1080 slide
  var X = function (v) { return (v - sr.left) / k; }, Y = function (v) { return (v - sr.top) / k; };

  function cs(el) { return getComputedStyle(el); }
  function alphaOf(el) {                          // opacity of the element and every parent up to the slide
    var a = 1;
    for (var e = el; e && e !== sec.parentNode; e = e.parentElement) {
      var s = cs(e);
      if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse') return 0;
      a *= +s.opacity;
    }
    return a;
  }
  function rgba(str) {
    var m = /rgba?\(([^)]+)\)/.exec(str || '');
    if (!m) return null;
    var p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
    return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1};
  }
  function hex(c) { return [c.r, c.g, c.b].map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function inkOf(el, s) {                         // the colour the letters are really painted in
    if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') {
      var g = rgba(s.backgroundImage); if (g) return g;
    }
    var f = rgba(s.webkitTextFillColor);
    if (f && f.a > 0.02) return f;
    return rgba(s.color);
  }
  function single(el) { return !/\s/.test((el.textContent || '').trim()); }
  // the element that holds one box of text: the nearest real block, skipping the little wrappers text animations make
  function boxOf(el) {
    var e = el;
    while (e && e !== frame) {
      var s = cs(e), d = s.display;
      var inline = /^inline/.test(d) || d === 'contents';
      var wrapper = (d === 'inline-block' || d === 'inline-flex' || d === 'block' || d === 'flex') && single(e) && e.parentElement && /flex|grid/.test(cs(e.parentElement).display) && e.parentElement.children.length > 1;
      if (/^inline-(block|flex|grid)$/.test(d) && single(e)) inline = true;
      if (!inline && !wrapper) return e;
      e = e.parentElement;
    }
    return frame;
  }
  function scaleOf(el) {
    var r = el.getBoundingClientRect();
    if (el.offsetHeight > 0 && r.height > 0) return r.height / el.offsetHeight / k;
    if (el.offsetWidth > 0 && r.width > 0) return r.width / el.offsetWidth / k;
    return 1;
  }
  function caseOf(t, s) { return s.textTransform === 'uppercase' ? t.toUpperCase() : s.textTransform === 'lowercase' ? t.toLowerCase() : t; }

  var groups = [], byBox = new Map(), hidden = [];
  var walker = D.createTreeWalker(frame, NodeFilter.SHOW_TEXT), n;
  var range = D.createRange();
  while ((n = walker.nextNode())) {
    var el = n.parentElement;
    if (!el || el.closest('script,style,aside.notes,noscript,template,iframe,video,audio,canvas')) continue;
    var inSvg = !!el.closest('svg');
    var s = cs(el);
    var a = alphaOf(el);
    var ink = inkOf(el, s);
    if (!ink) continue;
    var strokeOnly = (ink.a < 0.05) && parseFloat(s.webkitTextStrokeWidth || '0') > 0;
    if (inSvg) {                                  // svg <text>: its paint is "fill"
      var fill = rgba(s.fill); if (!fill) continue;
      ink = fill;
      var m = el.getScreenCTM && el.getScreenCTM(); if (m && (Math.abs(m.b) > 0.01 || Math.abs(m.c) > 0.01)) continue;   // turned text stays in the picture
    }
    if (strokeOnly || a * ink.a < 0.05) continue;   // outline-only or invisible letters stay in the picture
    var box = inSvg ? (el.closest('text') || el) : boxOf(el);
    var g = byBox.get(box);
    var data = n.data;
    if (!data.trim() && !g) continue;
    if (!g) { g = {box: box, chars: [], svg: inSvg}; byBox.set(box, g); groups.push(g); }
    var sc = scaleOf(el);
    var fs = parseFloat(s.fontSize) * sc;
    var lh = s.lineHeight === 'normal' ? fs * 1.2 : parseFloat(s.lineHeight) * sc;
    var style = {
      color: hex(ink), alpha: Math.max(0, Math.min(1, a * ink.a)), size: fs, weight: +s.fontWeight || 400,
      italic: s.fontStyle === 'italic' || s.fontStyle === 'oblique', spacing: (parseFloat(s.letterSpacing) || 0) * sc, lh: lh,
      family: s.fontFamily, el: el
    };
    var text = caseOf(data, s);
    for (var c = 0; c < data.length; c++) {
      var ch = text[c] === undefined ? data[c] : text[c];
      if (/[\n\r\t]/.test(ch)) ch = ' ';
      range.setStart(n, c); range.setEnd(n, c + 1);
      var rs = range.getClientRects(), r = rs.length ? rs[0] : null;
      if (r && (r.width === 0 && r.height === 0)) r = null;
      g.chars.push({ch: ch, r: r ? {x: X(r.left), y: Y(r.top), w: r.width / k, h: r.height / k} : null, st: style});
    }
    if (hidden.indexOf(el) < 0) hidden.push(el);
  }

  var out = [];
  groups.forEach(function (g, gi) {
    var cs0 = g.chars.filter(function (c) { return c.r && c.ch.trim(); });
    if (!cs0.length) return;
    // inside the slide only
    cs0 = cs0.filter(function (c) { return c.r.x + c.r.w > 0 && c.r.x < 1920 && c.r.y + c.r.h > 0 && c.r.y < 1080; });
    if (!cs0.length) return;
    // lines: letters whose middles sit at the same height
    var lines = [];
    g.chars.forEach(function (c) {
      if (!c.r) { if (lines.length) lines[lines.length - 1].chars.push(c); return; }
      var mid = c.r.y + c.r.h / 2, L = lines[lines.length - 1];
      if (L && Math.abs(mid - L.mid) < Math.max(6, c.r.h * 0.45)) { L.chars.push(c); return; }
      var hit = null;
      for (var q = 0; q < lines.length; q++) if (Math.abs(mid - lines[q].mid) < Math.max(6, c.r.h * 0.45)) hit = lines[q];
      if (hit && !c.ch.trim()) { hit.chars.push(c); return; }
      if (hit) { hit.chars.push(c); return; }
      lines.push({mid: mid, chars: [c]});
    });
    lines.sort(function (a, b) { return a.mid - b.mid; });
    lines.forEach(function (L) {
      var vis = L.chars.filter(function (c) { return c.r && c.ch.trim(); });
      L.x0 = Math.min.apply(null, vis.map(function (c) { return c.r.x; }));
      L.x1 = Math.max.apply(null, vis.map(function (c) { return c.r.x + c.r.w; }));
      L.y0 = Math.min.apply(null, vis.map(function (c) { return c.r.y; }));
      L.y1 = Math.max.apply(null, vis.map(function (c) { return c.r.y + c.r.h; }));
      // trim the spaces at both ends of a line
      while (L.chars.length && !L.chars[0].ch.trim()) L.chars.shift();
      while (L.chars.length && !L.chars[L.chars.length - 1].ch.trim()) L.chars.pop();
    });
    lines = lines.filter(function (L) { return L.chars.length; });
    if (!lines.length) return;
    // words set apart by a margin instead of a space (split-text wrappers): put the space back where the gap is
    // clearly wider than the usual gap between letters of that line
    lines.forEach(function (L) {
      var vis = [], gaps = [];
      L.chars.forEach(function (c, ix) { if (c.r && c.ch.trim()) vis.push(ix); });
      for (var q = 1; q < vis.length; q++) { var a = L.chars[vis[q - 1]], b = L.chars[vis[q]]; gaps.push(b.r.x - (a.r.x + a.r.w)); }
      if (!gaps.length) return;
      var sorted = gaps.slice().sort(function (x, y) { return x - y; }), med = sorted[Math.floor(sorted.length / 2)];
      for (var q2 = vis.length - 1; q2 >= 1; q2--) {
        var i0 = vis[q2 - 1], i1 = vis[q2], A = L.chars[i0], B = L.chars[i1];
        var between = L.chars.slice(i0 + 1, i1).some(function (c) { return !c.ch.trim(); });
        if (!between && B.r.x - (A.r.x + A.r.w) > med + 0.18 * Math.max(A.st.size, B.st.size)) L.chars.splice(i1, 0, {ch: ' ', r: null, st: A.st});
      }
    });
    // the biggest letters set the line height
    var main = cs0.reduce(function (a, c) { return c.st.size > a.st.size ? c : a; }, cs0[0]).st;
    var gaps = [];
    for (var q = 1; q < lines.length; q++) gaps.push(lines[q].mid - lines[q - 1].mid);
    gaps.sort(function (a, b) { return a - b; });
    var lh = gaps.length ? gaps[Math.floor(gaps.length / 2)] : main.lh;
    if (!(lh > 0)) lh = main.size * 1.2;
    var x0 = Math.min.apply(null, lines.map(function (L) { return L.x0; })), x1 = Math.max.apply(null, lines.map(function (L) { return L.x1; }));
    var y0 = lines[0].y0, y1 = lines[lines.length - 1].y1;
    // alignment: what the block says, or what the lines show
    var ta = g.svg ? (cs(g.box).textAnchor === 'middle' ? 'center' : cs(g.box).textAnchor === 'end' ? 'right' : 'left') : cs(g.box).textAlign;
    var align = /center/.test(ta) ? 'center' : /right|end/.test(ta) ? 'right' : 'left';
    if (lines.length > 1 && !g.svg) {
      var mids = lines.map(function (L) { return (L.x0 + L.x1) / 2; }), lefts = lines.map(function (L) { return L.x0; }), rights = lines.map(function (L) { return L.x1; });
      var spread = function (v) { return Math.max.apply(null, v) - Math.min.apply(null, v); };
      if (spread(lefts) < 4) align = 'left'; else if (spread(rights) < 4) align = 'right'; else if (spread(mids) < 6) align = 'center';
    }
    var tag = 'g' + i + '_' + gi;
    (g.box.nodeType === 1 ? g.box : frame).setAttribute('data-cs-pptx', tag);
    out.push({
      tag: tag, svg: g.svg, align: align, x: x0, y: y0, w: x1 - x0, h: y1 - y0, lh: lh, firstH: lines[0].y1 - lines[0].y0,
      size: main.size, weight: main.weight, family: main.family,
      lines: lines.map(function (L) {
        var runs = [];
        L.chars.forEach(function (c) {
          var st = c.st, last = runs[runs.length - 1];
          var key = [st.color, st.alpha.toFixed(2), Math.round(st.size), st.weight, st.italic, st.spacing.toFixed(1), st.family].join('|');
          if (last && last.key === key) last.text += c.ch;
          else runs.push({key: key, text: c.ch, color: st.color, alpha: st.alpha, size: st.size, weight: st.weight, italic: st.italic, spacing: st.spacing, family: st.family});
        });
        runs.forEach(function (r) { r.text = r.text.replace(/ {2,}/g, ' '); delete r.key; });
        // letters spread by an animation (each letter moved, not letter-spacing): measure the line as plain text and
        // put the difference into the spacing, so the line is as wide in PowerPoint as on the slide
        var probe = D.createElement('span');
        probe.style.cssText = 'position:absolute;left:-99999px;top:0;white-space:pre;visibility:hidden';
        runs.forEach(function (r) {
          var q = D.createElement('span');
          q.textContent = r.text;
          q.style.cssText = 'font-family:' + r.family + ';font-size:' + r.size + 'px;font-weight:' + r.weight + ';font-style:' + (r.italic ? 'italic' : 'normal') + ';letter-spacing:' + r.spacing + 'px';
          probe.appendChild(q);
        });
        D.body.appendChild(probe);
        var natural = probe.getBoundingClientRect().width, real = L.x1 - L.x0, count = runs.reduce(function (a, r) { return a + r.text.length; }, 0);
        probe.remove();
        if (count > 1 && natural > 0 && real > natural * 1.04) {
          var extra = (real - natural) / (count - 1);
          runs.forEach(function (r) { r.spacing += extra; });
        }
        runs.forEach(function (r) { delete r.family; });
        return {x0: L.x0, x1: L.x1, y0: L.y0, y1: L.y1, runs: runs};
      })
    });
  });
  // mark the words so the plate can be captured without them
  hidden.forEach(function (el) { el.setAttribute('data-cs-hide', el.closest('svg') ? 'svg' : '1'); });
  if (!D.getElementById('cs-hide-style')) {
    var st = D.createElement('style'); st.id = 'cs-hide-style';
    st.textContent = '[data-cs-hide="1"],[data-cs-hide="1"] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke-color:transparent!important;text-decoration-color:transparent!important}' +
      '[data-cs-bgtext]{background-image:none!important}' +
      '[data-cs-hide="svg"]{fill:transparent!important;stroke:transparent!important}';
    D.head.appendChild(st);
  }
  // gradient letters (background-clip: text) keep their gradient as a box once the fill is transparent: drop it
  hidden.forEach(function (el) { var s = cs(el); if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') el.setAttribute('data-cs-bgtext', ''); });
  return out;
};

window.__csPageTextShow = function () {
  var st = document.getElementById('cs-hide-style'); if (st) st.remove();
  [].forEach.call(document.querySelectorAll('[data-cs-hide],[data-cs-bgtext]'), function (el) { el.removeAttribute('data-cs-hide'); el.removeAttribute('data-cs-bgtext'); });
};

// how visible each measured box is right now (0..1): the mean opacity of its letters' elements
window.__csAlpha = function (tags) {
  function alphaOf(el) {
    var a = 1;
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden') return 0;
      a *= +s.opacity;
      if (e.classList && e.classList.contains('cs-frame')) break;
    }
    return a;
  }
  return tags.map(function (t) {
    var box = document.querySelector('[data-cs-pptx="' + t + '"]');
    if (!box) return 1;
    var els = [].slice.call(box.querySelectorAll('[data-cs-hide]'));
    if (box.hasAttribute('data-cs-hide')) els.push(box);
    if (!els.length) return alphaOf(box);
    var sum = 0; els.forEach(function (e) { sum += alphaOf(e); });
    return sum / els.length;
  });
};
