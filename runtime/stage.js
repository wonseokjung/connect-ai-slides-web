/* connect-ai-slides-web runtime. MIT, CONNECT AI LAB.
 * One contract for every motion library: a block's mount() returns a seekable clip { dur, seek(t), steps }.
 * The stage (deck or site) decides when t moves: on slide enter, on click, on scroll, or frame by frame for recording.
 */
(function () {
  'use strict';
  var W = window, D = document;
  var CS = W.CS = W.CS || {};
  var blocks = {};          // kind -> { mount, css, meta }
  var Q = new URLSearchParams(location.search);
  CS.capturing = Q.has('capture');
  CS.reduced = !CS.capturing && W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (Q.has('reduced')) CS.reduced = true;

  CS.register = function (kind, mount, css, meta) {
    blocks[kind] = { mount: mount, css: css || '', meta: meta || {} };
  };
  CS.kinds = function () { return Object.keys(blocks); };
  CS.problems = [];        // things that went wrong while seeking (recording stops on these)

  // ---------- small helpers handed to blocks ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function spans(str, cls, by) {
    var parts = by === 'chars' ? Array.from(String(str)) : String(str).split(/(\s+)/);
    return parts.map(function (w) {
      if (/^\s+$/.test(w)) return by === 'chars' ? '<span class="' + cls + ' cs-sp">&nbsp;</span>' : ' ';
      if (w === '') return '';
      return '<span class="' + cls + '">' + esc(w) + '</span>';
    }).join('');
  }
  var eases = {
    out: function (x) { return 1 - Math.pow(1 - x, 3); },
    expo: function (x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); },
    inOut: function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    in: function (x) { return x * x * x; },
    lin: function (x) { return x; }
  };
  function prog(t, a, d, e) { return (eases[e || 'out'])(clamp((t - a) / (d || 1e-6), 0, 1)); }

  // ---------- adapters: every library becomes { dur, seek(t), steps } ----------
  function labelsToSteps(labels) {
    return Object.keys(labels || {}).filter(function (k) { return /^step/.test(k); }).map(function (k) { return labels[k]; }).sort(function (a, b) { return a - b; });
  }
  var A = {
    fromGsap: function (tl) {
      tl.pause(0);
      return { lib: 'gsap', dur: tl.duration(), steps: labelsToSteps(tl.labels), seek: function (t) { tl.time(clamp(t, 0, tl.duration()), false); }, dispose: function () { tl.kill(); } };
    },
    // Motion (motion.dev): controls from animate(); pass one or a list
    fromMotion: function (list, opt) {
      list = [].concat(list);
      list.forEach(function (c) { c.pause(); });
      var dur = (opt && opt.dur) || Math.max.apply(null, list.map(function (c) { return c.duration || 0; }));
      return { lib: 'motion', dur: dur, steps: (opt && opt.steps) || [], seek: function (t) { list.forEach(function (c) { c.time = clamp(t, 0, dur); }); }, dispose: function () { list.forEach(function (c) { c.cancel && c.cancel(); }); } };
    },
    // anime.js v4 timeline or animation (milliseconds inside)
    fromAnime: function (tl, opt) {
      tl.pause();
      // anime.js does not draw the "from" values of children that have not started yet: touch the end once, then go back to 0
      try { tl.seek(tl.duration); tl.seek(0); } catch (e) {}
      return { lib: 'anime', dur: tl.duration / 1000, steps: (opt && opt.steps) || [], seek: function (t) { tl.seek(clamp(t * 1000, 0, tl.duration)); }, dispose: function () { tl.revert && tl.revert(); } };
    },
    // lottie-web animation item
    fromLottie: function (anim, opt) {
      var fr = anim.frameRate || 30, n = anim.totalFrames || 1, at = (opt && opt.at) || 0, speed = (opt && opt.speed) || 1;
      return { lib: 'lottie', dur: at + n / fr / speed, steps: [], seek: function (t) { anim.goToAndStop(clamp((t - at) * fr * speed, 0, n - 1), true); }, dispose: function () { anim.destroy(); } };
    },
    // CSS @keyframes / Web Animations under el: paused and driven by currentTime
    fromWaapi: function (el, opt) {
      // collected again on every seek: the browser recreates CSS animations when a slide is hidden and shown
      function grab() { var l = el.getAnimations({ subtree: true }); l.forEach(function (a) { if (a.playState !== 'paused') a.pause(); }); return l; }
      var list = grab();
      var dur = (opt && opt.dur) || Math.max.apply(null, [0].concat(list.map(function (a) { var e = a.effect && a.effect.getComputedTiming().endTime; return isFinite(e) ? e / 1000 : 0; })));
      return { lib: 'css', dur: dur, steps: (opt && opt.steps) || [], seek: function (t) { var ms = clamp(t, 0, dur) * 1000; grab().forEach(function (a) { a.currentTime = ms; }); }, dispose: function () { el.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); } };
    },
    // <video>: plays by itself when live (muted loop), exact frame when recording
    fromVideo: function (v, opt) {
      opt = opt || {};
      v.muted = true; v.loop = opt.loop !== false; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      var started = false;
      return {
        lib: 'video', dur: opt.dur || 0, steps: [], media: v,
        seek: function (t, exact) {
          if (exact || CS.reduced) {
            var d = v.duration || 0, tt = (opt.from || 0) + (CS.reduced ? 0 : t);
            if (d) tt = v.loop ? tt % d : Math.min(tt, d - 0.05);
            if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
            return new Promise(function (res) {
              var done = false, timer = 0;
              var fin = function (why) { if (done) return; done = true; clearTimeout(timer); v.removeEventListener('seeked', shown); v.removeEventListener('error', onErr); v.removeEventListener('loadeddata', go); if (why) CS.problems.push('video ' + (v.currentSrc || v.src).split('/').pop() + ': ' + why); res(); };
              // after the seek, wait until that frame is really on screen
              var shown = function () { if (v.requestVideoFrameCallback && !D.hidden) { v.requestVideoFrameCallback(function () { fin(); }); setTimeout(function () { fin(); }, 300); } else fin(); };
              var onErr = function () { fin('could not be decoded'); };
              // setting the time it already has fires no "seeked", so that case goes straight to "shown"
              var go = function () { if (Math.abs(v.currentTime - tt) < 0.001) shown(); else { v.addEventListener('seeked', shown); v.currentTime = tt; } };
              v.addEventListener('error', onErr);
              if (v.error) return fin('could not be decoded');
              if (v.readyState >= 2) go(); else { v.addEventListener('loadeddata', go); if (v.networkState === 0 || v.preload === 'none') { v.preload = 'auto'; v.load(); } }
              timer = setTimeout(function () { fin(v.readyState < 2 ? 'did not load in time' : 'seek to ' + tt.toFixed(2) + ' s timed out'); }, 5000);
            });
          }
          if (t > 0 && !started) { started = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        },
        visible: function (on) { if (CS.capturing || CS.reduced || !started) return; if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); },
        dispose: function () { v.pause(); }
      };
    },
    // a plain function of time: fromFn(2.4, t => { ... })
    fromFn: function (dur, fn, opt) {
      return { lib: 'fn', dur: dur, steps: (opt && opt.steps) || [], seek: function (t, exact) { return fn(clamp(t, 0, dur), exact); } };
    },
    // several clips as one
    all: function () {
      var list = [].slice.call(arguments).filter(Boolean), steps = [];
      list.forEach(function (c) { (c.steps || []).forEach(function (s) { steps.push(s); }); });
      return {
        lib: list.map(function (c) { return c.lib; }).join('+'), dur: Math.max.apply(null, list.map(function (c) { return c.dur || 0; })), steps: steps.sort(function (a, b) { return a - b; }),
        seek: function (t, exact) { var ps = list.map(function (c) { return c.seek(c.lib === 'video' ? t : Math.min(t, c.dur), exact); }).filter(function (p) { return p && p.then; }); if (ps.length) return Promise.all(ps); },
        visible: function (on) { list.forEach(function (c) { c.visible && c.visible(on); }); },
        fit: function () { list.forEach(function (c) { c.fit && c.fit(); }); },
        ready: (function () { var r = list.map(function (c) { return c.ready; }).filter(Boolean); return r.length ? Promise.all(r) : null; })(),
        dispose: function () { list.forEach(function (c) { c.dispose && c.dispose(); }); }
      };
    },
    // a HyperFrames block (HTML + CSS + paused GSAP timeline) runs as it is, inside an iframe
    fromHyperframes: function (el, html, opt) {
      opt = opt || {};
      var cw = opt.canvas ? opt.canvas[0] : 1920, ch = opt.canvas ? opt.canvas[1] : 1080;
      var f = D.createElement('iframe');
      f.setAttribute('scrolling', 'no'); f.setAttribute('title', opt.title || 'motion block'); f.tabIndex = -1;
      f.style.cssText = 'border:0;background:transparent;position:absolute;left:50%;top:50%;width:' + cw + 'px;height:' + ch + 'px;transform-origin:50% 50%;pointer-events:none';
      // the folder of the page, without ?query and #hash (reveal.js writes the slide number into the hash)
      var base = D.baseURI.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
      var body = html.replace(/<template[^>]*>/i, '').replace(/<\/template>/i, '')
        .replace(/<script[^>]+src=["'][^"']*\/(gsap|[A-Za-z0-9]+Plugin|SplitText|Flip|CustomEase)(\.min)?\.js["'][^>]*><\/script>/g, function (m, n) { return '<script src="' + base + 'assets/vendor/' + n + '.min.js"><\/script>'; });
      var pre = '<script>window.__cs_text=' + JSON.stringify(opt.text || {}).replace(/</g, '\\u003c') + ';document.addEventListener("DOMContentLoaded",function(){});<\/script>';
      // our words go in before the block's own script runs (SplitText / scramble then work on our text)
      var inject = '<script>(function(){var t=window.__cs_text;for(var s in t){var n=document.querySelector(s);if(n&&t[s]!=null)n.textContent=t[s];}})();<\/script>';
      body = body.replace(/<script(?![^>]+src=)/i, inject + '<script');
      f.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><base href="' + base + '"><style>html,body{margin:0;background:transparent;overflow:hidden}</style>' + pre + '</head><body>' + body + '</body></html>';
      el.appendChild(f);
      var tl = null, want = 0, dur = opt.dur || 3;
      function fit() { var r = el.getBoundingClientRect(), k = innerScale(el); var s = Math.min(r.width / k / cw, r.height / k / ch) * (opt.scale || 1); f.style.transform = 'translate(-50%,-50%) scale(' + s + ')'; }
      var ready = new Promise(function (res) {
        f.addEventListener('load', function () {
          var w = f.contentWindow, tries = 0;
          (function poll() {
            var tls = w.__timelines || {}, k = Object.keys(tls)[0];
            if (k) { tl = tls[k]; tl.pause(); if (w.gsap) w.gsap.ticker.sleep && 0; tl.time(Math.min(want, tl.duration()), false); res(); }
            else if (tries++ < 100) setTimeout(poll, 30); else res();
          })();
        });
      });
      fit();
      return { lib: 'hyperframes', dur: dur, steps: [], ready: ready, fit: fit, seek: function (t) { want = clamp(t, 0, dur); if (tl) tl.time(Math.min(want, tl.duration()), false); else if (CS.capturing) return ready; }, dispose: function () { f.remove(); } };
    },
    // a Remotion composition through @remotion/player (bundled by the build into assets/remotion.js)
    fromRemotion: function (el, id, props, opt) {
      var R = W.CSRemotion && W.CSRemotion[id];
      if (!R) { el.innerHTML = '<div class="cs-missing">Remotion composition "' + esc(id) + '" was not bundled</div>'; return A.fromFn(1, function () {}); }
      var h = R.mount(el, props || {}, opt && opt.width ? { width: opt.width, height: opt.height } : null);
      var fps = R.fps, n = R.durationInFrames, at = (opt && opt.at) || 0;
      return { lib: 'remotion', dur: at + n / fps, steps: [], seek: function (t) { h.seek(clamp(Math.round((t - at) * fps), 0, n - 1)); if (CS.capturing) return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }, dispose: function () { h.unmount(); } };
    }
  };

  function innerScale(el) {       // how much an ancestor (reveal.js) scales us: layout px -> screen px
    var w = el.offsetWidth; if (!w) return 1; return el.getBoundingClientRect().width / w || 1;
  }

  // ---------- media with a face: text never goes on it ----------
  // face = [x, y, w, h] in 0..1 of the picture. Returns the face box in block px for object-fit: cover.
  function coverRect(boxW, boxH, mw, mh, posX, posY) {
    var s = Math.max(boxW / mw, boxH / mh), w = mw * s, h = mh * s;
    return { x: (boxW - w) * posX, y: (boxH - h) * posY, w: w, h: h, s: s };
  }

  // ---------- mount one block ----------
  var styleEl = null, cssDone = {};
  function addCss(kind, css) {
    if (!css || cssDone[kind]) return; cssDone[kind] = 1;
    if (!styleEl) { styleEl = D.createElement('style'); styleEl.id = 'cs-block-css'; D.head.appendChild(styleEl); }
    styleEl.appendChild(D.createTextNode(css + '\n'));
  }
  function cls(kind) { return 'b-' + kind.replace(/[^a-z0-9]+/gi, '-'); }

  // ---------- pro: the shared design system of the pro/* blocks (one header, one footer, one motion language) ----------
  var GREEK = { theta: 'θ', sigma: 'σ', alpha: 'α', beta: 'β', lambda: 'λ', mu: 'μ', pi: 'π', delta: 'Δ', sum: 'Σ' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  var pro = {
    // kicker + title, always at the same place on every slide: the first thing that makes a deck look designed
    head: function (p, o) {
      o = o || {}; var k = p.kicker, t = o.title === false ? '' : p.title;
      if (!k && !t) return '';
      return '<header class="pro-head">' + (k ? '<div class="pro-kicker"><i class="pro-tick"></i><span>' + esc(k) + '</span></div>' : '') + (t ? '<h2 class="pro-title">' + esc(t) + '</h2>' : '') + '</header>';
    },
    // brand + page number, deck only, decoration (it goes into the picture of the slide, not into a text box)
    foot: function (cx) {
      var st = cx.story || {}; if (cx.stage !== 'deck' || st.footer === false) return '';
      var name = (st.brand && st.brand.name) || st.title || '';
      return '<footer class="pro-foot" aria-hidden="true" data-deco><span class="pro-brand">' + esc(name) + '</span><i class="pro-hair"></i><span class="pro-page cs-num">' + (cx.index < 10 ? '0' : '') + cx.index + '</span></footer>';
    },
    // a formula in plain text: x1 -> x₁, theta -> θ, <= -> ≤, single letters in italic
    math: function (str) {
      var s = String(str == null ? '' : str).replace(/<=|≦/g, '≤').replace(/>=|≧/g, '≥').replace(/!=/g, '≠').replace(/->/g, '→').replace(/\*/g, '·');
      s = s.replace(/\b(theta|sigma|alpha|beta|lambda|mu|pi|delta)\b/gi, function (m) { return GREEK[m.toLowerCase()]; });
      s = s.replace(/([A-Za-zθσαβλμπ])(\d{1,3})(?![\d.])/g, function (m, a, d) { return a + d.split('').map(function (c) { return SUB[c]; }).join(''); });
      // a run of letters is a product of variables when it has small numbers inside (w₁x₁), is one letter, or 2-3 capitals (XW)
      return esc(s).replace(/[A-Za-zθσαβλμπ₀-₉]+/g, function (run) {
        var letters = run.replace(/[₀-₉]/g, '');
        if (!letters) return run;
        if (letters.length === 1 || /[₀-₉]/.test(run) && /^[A-Za-zθσαβλμπ]$/.test(run.split(/[₀-₉]+/).filter(Boolean)[0] || '') && run.split(/[₀-₉]+/).filter(Boolean).every(function (x) { return x.length === 1; }) || /^[A-Z]{2,3}$/.test(run)) {
          return run.replace(/([A-Za-zθσαβλμπ])([₀-₉]*)/g, '<span class="pro-var">$1$2</span>');
        }
        return run;
      });
    },
    // "1,200" "42%" "$3.5M" "3배" -> {n, dec, pre, suf}; null when it is not one number (a date, 1.2.3)
    num: function (v) {
      var m = /^([^\d\-]*?)(-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?)([^\d]*)$/.exec(String(v == null ? '' : v).trim());
      if (!m) return null;
      var n = +m[2].replace(/,/g, ''); if (!isFinite(n)) return null;
      return { n: n, dec: (m[2].split('.')[1] || '').length, comma: /,/.test(m[2]) || Math.abs(n) >= 10000, pre: m[1], suf: m[3] };
    },
    fmt: function (n, dec, comma) { var s = (+n).toFixed(dec || 0); if (comma) { var a = s.split('.'); a[0] = a[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = a.join('.'); } return s; },
    // the one motion language: rise and fade, lines that draw, numbers that count
    rise: function (tl, els, at, o) { o = o || {}; if (!els || (els.length === 0)) return tl; return tl.fromTo(els, { opacity: 0, y: o.y == null ? 30 : o.y }, { opacity: 1, y: 0, duration: o.d || 0.9, ease: o.ease || 'expo.out', stagger: o.stagger == null ? 0.08 : o.stagger }, at); },
    draw: function (tl, els, at, o) { o = o || {}; if (!els || els.length === 0) return tl; return tl.fromTo(els, { scaleX: 0 }, { scaleX: 1, duration: o.d || 1.0, ease: o.ease || 'expo.inOut', stagger: o.stagger == null ? 0.08 : o.stagger, transformOrigin: o.origin || '0% 50%' }, at); },
    headIn: function (tl, el, at) {
      at = at || 0; var k = el.querySelector('.pro-kicker'), t = el.querySelector('.pro-title'), tick = el.querySelector('.pro-tick'), f = el.querySelector('.pro-foot');
      if (tick) tl.fromTo(tick, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.out', transformOrigin: '0% 50%' }, at);
      if (k) tl.fromTo(k.querySelector('span'), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out' }, at + 0.1);
      if (t) tl.fromTo(t, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' }, at + 0.16);
      if (f) tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, at + 0.2);
      return (k || t) ? at + 0.45 : at;
    },
    count: function (tl, el, info, at, d) {
      if (!info) return tl; var o = { v: 0 };
      el.textContent = info.pre + pro.fmt(0, info.dec, info.comma) + info.suf;
      return tl.to(o, { v: info.n, duration: d || 1.4, ease: 'power3.out', onUpdate: function () { el.textContent = info.pre + pro.fmt(o.v, info.dec, info.comma) + info.suf; } }, at);
    },
    // words that rise out of their own line (a mask per word). gold: a word or a list of words to colour
    words: function (text, gold) {
      var g = [].concat(gold || []).filter(Boolean).map(String);
      var t = String(text == null ? '' : text), marks = [];
      g.forEach(function (w) { var i = t.indexOf(w); if (i >= 0) marks.push([i, i + w.length]); });
      var out = '', pos = 0;
      t.split(/(\s+)/).forEach(function (w) {
        var a = pos, b = pos + w.length; pos = b;
        if (/^\s+$/.test(w)) { out += ' '; return; } if (!w) return;
        var on = marks.some(function (m) { return a < m[1] && b > m[0]; });
        out += '<span class="pro-wm"><span class="pro-wi' + (on ? ' pro-gold' : '') + '">' + esc(w) + '</span></span>';
      });
      return out;
    },
    wordsIn: function (tl, root, at, o) { o = o || {}; var w = root.querySelectorAll('.pro-wi'); if (!w.length) return tl; return tl.fromTo(w, { yPercent: 108, opacity: 0 }, { yPercent: 0, opacity: 1, duration: o.d || 1.05, ease: 'expo.out', stagger: o.stagger == null ? Math.min(0.07, 0.9 / w.length) : o.stagger }, at); },
    // a picture or a clip that fills its box. Returns the html; pro.clip() joins its clock to the timeline
    media: function (p, cls, alt) {
      var src = p.src || ''; if (!src) return '';
      var pos = p.pos ? ' style="object-position:' + esc(p.pos) + '"' : '';
      return /\.(mp4|webm|mov)$/i.test(src)
        ? '<video class="' + cls + '" src="' + esc(src) + '"' + (p.poster ? ' poster="' + esc(p.poster) + '"' : '') + ' muted loop playsinline preload="auto" aria-label="' + esc(p.alt || alt || '') + '"' + pos + '></video>'
        : '<img class="' + cls + '" src="' + esc(src) + '" alt="' + esc(p.alt || alt || '') + '"' + pos + '>';
    },
    clip: function (cx, tl, el) { var g = A.fromGsap(tl), vs = [].slice.call(el.querySelectorAll('video')); return vs.length ? A.all.apply(null, [g].concat(vs.map(function (v) { return A.fromVideo(v); }))) : g; },
    // which side of a picture is free of the face: 'left' or 'right'
    freeSide: function (face, fallback) { if (!face) return fallback || 'left'; var c = face[0] + face[2] / 2; return c > 0.5 ? 'left' : 'right'; }
  };
  CS.pro = pro;

  // ---------- vis: the picture-first helpers of the v0.6 blocks (living shader light, 3D, time that keeps moving) ----------
  // colour of a CSS custom property as [r, g, b] in 0..1 (the look decides gold, ink and background)
  function cssRgb(el, name, fallback) {
    var probe = D.createElement('i'); probe.style.cssText = 'position:absolute;width:0;height:0;color:var(' + name + ',' + (fallback || '#000') + ')'; el.appendChild(probe);
    var c = parseColorFn(getComputedStyle(probe).color); probe.remove(); return [c[0] / 255, c[1] / 255, c[2] / 255];
  }
  function parseColorFn(s) { var m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) { var h = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(s || ''); return h ? [h[1] * 255, h[2] * 255, h[3] * 255] : [0, 0, 0]; } var p = m[1].split(/[ ,/]+/).map(parseFloat); return [p[0], p[1], p[2]]; }
  var GL_HEAD = 'precision highp float;\nuniform float u_t; uniform float u_p; uniform vec2 u_res; uniform vec3 u_gold; uniform vec3 u_gold2; uniform vec3 u_bg; uniform vec3 u_ink; uniform float u_light; uniform vec4 u_a; uniform vec4 u_b;\n' +
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\n' +
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}\n' +
    'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return v;}\n';
  var vis = {
    // a fragment shader that fills the block (behind everything). frag gets u_t (seconds), u_p (0..1 entrance), u_res,
    // u_gold / u_gold2 / u_bg / u_ink (from the look), u_light (1 on light looks), u_a / u_b (your own numbers).
    shader: function (el, frag, opt) {
      opt = opt || {};
      var host = opt.parent || el, c = D.createElement('canvas');
      c.className = 'vis-gl'; c.setAttribute('aria-hidden', 'true'); c.dataset.deco = '';
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
      host.insertBefore(c, host.firstChild);
      var gl = c.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: !!opt.alpha, antialias: false });
      var none = { canvas: c, draw: function () {}, dispose: function () {} };
      if (!gl) return none;
      function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('[vis.shader] ' + gl.getShaderInfoLog(s)); return null; } return s; }
      var vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}'), fs = sh(gl.FRAGMENT_SHADER, GL_HEAD + frag);
      if (!vs || !fs) return none;
      var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var U = {}; ['u_t', 'u_p', 'u_res', 'u_gold', 'u_gold2', 'u_bg', 'u_ink', 'u_light', 'u_a', 'u_b'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      var light = /look-(white|ivory|paper)/.test(D.body.className) ? 1 : 0;
      var col = { gold: cssRgb(el, '--gold', '#D6892A'), gold2: cssRgb(el, '--gold2', '#F2B45A'), bg: cssRgb(el, '--bg', '#0B0A08'), ink: cssRgb(el, '--ink', '#F4EFE6') };
      var scale = opt.scale || (CS.capturing ? 0.75 : 0.6);
      function size() { var w = Math.max(2, Math.round((el.offsetWidth || 960) * scale)), h = Math.max(2, Math.round((el.offsetHeight || 540) * scale)); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); } }
      return {
        canvas: c,
        draw: function (t, p, a, b) {
          if (gl.isContextLost()) return; size();
          gl.uniform1f(U.u_t, t); gl.uniform1f(U.u_p, p == null ? 1 : p); gl.uniform2f(U.u_res, c.width, c.height);
          gl.uniform3fv(U.u_gold, col.gold); gl.uniform3fv(U.u_gold2, col.gold2); gl.uniform3fv(U.u_bg, col.bg); gl.uniform3fv(U.u_ink, col.ink); gl.uniform1f(U.u_light, light);
          gl.uniform4fv(U.u_a, a || [0, 0, 0, 0]); gl.uniform4fv(U.u_b, b || [0, 0, 0, 0]);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        },
        dispose: function () { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); c.remove(); }
      };
    },
    // a connect-ai-three scene (the 6-7 lesson kit): spec in, render(t) out. Async (models load): use .ready.
    three: function (el, spec, opt) {
      opt = opt || {};
      var host = D.createElement('div'); host.className = 'vis-3d'; host.setAttribute('aria-hidden', 'true'); host.dataset.deco = '';
      host.style.cssText = 'position:absolute;inset:0;pointer-events:none' + (opt.style ? ';' + opt.style : '');
      (opt.parent || el).insertBefore(host, opt.before === false ? null : (opt.parent || el).firstChild);
      var canvas = D.createElement('canvas'); canvas.style.cssText = 'display:block;width:100%;height:100%'; host.appendChild(canvas);
      var stage = null, want = 0, dead = false;
      var out = { host: host, canvas: canvas, stage: null, ready: null, render: function (t) { want = t; if (stage) stage.render(t); }, dispose: function () { dead = true; if (stage) stage.dispose(); host.remove(); } };
      if (!W.CSThree) { console.error('[vis.three] the 3D stage is not in this page (assets/vendor/cs-three.js)'); out.ready = Promise.resolve(); return out; }
      var w = host.offsetWidth || el.offsetWidth || 1920, h = host.offsetHeight || el.offsetHeight || 1080;
      var pr = opt.pixelRatio || (CS.capturing ? 1 : Math.min(2, W.devicePixelRatio || 1));
      out.ready = W.CSThree.createStage(spec, { canvas: canvas, width: w, height: h, pixelRatio: pr, mode: 'video', transparent: opt.transparent !== false, assetBase: '', kitBase: 'assets/kit/' })
        .then(function (s) { if (dead) { s.dispose(); return; } stage = out.stage = s; s.render(want); })
        .catch(function (e) { console.error('[vis.three] ' + (e && e.message)); CS.problems.push('3D scene: ' + (e && e.message)); });
      out.resize = function () { if (!stage) return; var w2 = host.offsetWidth, h2 = host.offsetHeight; if (w2 && h2) { stage.resize(w2, h2); stage.render(want); } };
      return out;
    },
    // the clip of a picture-first block: a GSAP timeline for the entrance plus draw(t) for what keeps living (light,
    // a 3D camera). Recording: draw(t) is exact and runs on through the hold. Live: it keeps drifting while on screen.
    ambient: function (tl, el, draw, opt) {
      opt = opt || {};
      var g = A.fromGsap(tl), dur = opt.dur || g.dur;
      var vids = [].slice.call(el.querySelectorAll('video')).map(function (v) { return A.fromVideo(v); });
      var base = 0, t0 = 0, raf = 0, on = false, started = false, lastSeek = 0;
      var live = !CS.capturing && !CS.reduced;
      function loop(now) { raf = 0; if (!on) return; if (now - lastSeek > 30) draw(base + (now - t0) / 1000, false); raf = requestAnimationFrame(loop); }
      // a 3D stage loads after the first seek: draw the last asked time again once it is there (reduce motion seeks only once)
      if (opt.ready && opt.ready.then) opt.ready.then(function () { try { draw(base, false); } catch (e) {} }, function () {});
      return {
        lib: 'gsap+vis' + (vids.length ? '+video' : ''), dur: dur, steps: g.steps, free: true, ready: opt.ready || null,
        seek: function (t, exact) {
          g.seek(Math.min(t, g.dur)); base = t; t0 = lastSeek = performance.now();
          var ps = [], r = draw(t, !!exact); if (r && r.then) ps.push(r);
          vids.forEach(function (c) { var q = c.seek(t, exact); if (q && q.then) ps.push(q); });
          if (live && t > 0) { started = true; if (on && !raf) raf = requestAnimationFrame(loop); }
          return ps.length ? Promise.all(ps) : undefined;
        },
        visible: function (v) {
          on = v; vids.forEach(function (c) { c.visible && c.visible(v); });
          if (v && started && live && !raf) { t0 = performance.now(); raf = requestAnimationFrame(loop); }
          if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
        },
        fit: opt.fit || null,
        dispose: function () { on = false; if (raf) cancelAnimationFrame(raf); g.dispose(); vids.forEach(function (c) { c.dispose && c.dispose(); }); if (opt.dispose) opt.dispose(); }
      };
    },
    // the look of the deck as connect-ai-three colours (a 3D scene sits in the same light as the slide)
    palette: function (el) { var h = function (a) { return '#' + a.map(function (v) { return ('0' + Math.round(v * 255).toString(16)).slice(-2); }).join(''); }; return { gold: h(cssRgb(el, '--gold', '#D6892A')), gold2: h(cssRgb(el, '--gold2', '#F2B45A')), bg: h(cssRgb(el, '--bg', '#0B0A08')), ink: h(cssRgb(el, '--ink', '#F4EFE6')), light: /look-(white|ivory|paper)/.test(D.body.className) }; }
  };
  CS.vis = vis;

  CS.mount = function (frame, scene, stage, story) {
    var b = blocks[scene.kind];
    frame.innerHTML = '';
    var r = frame.getBoundingClientRect(), k = innerScale(frame) || 1;
    var w = r.width / k, h = r.height / k;
    var shape = w / h >= 1 ? 'wide' : 'tall';
    frame.className = 'cs-frame'; frame.dataset.stage = stage; frame.dataset.shape = shape; frame.dataset.kind = scene.kind;
    var el = D.createElement('div');
    el.className = 'cs-block ' + cls(scene.kind) + (scene.grain === false ? '' : ' cs-grain');
    frame.appendChild(el);
    if (!b) { el.innerHTML = '<div class="cs-missing">Unknown block "' + esc(scene.kind) + '"</div>'; return A.fromFn(0.5, function () {}); }
    addCss(scene.kind, b.css);
    var idx = (function () { var l = ((story && story.scenes) || []).filter(function (x) { return x.only !== (stage === 'deck' ? 'site' : 'deck'); }); var i = l.indexOf(scene); return { i: i < 0 ? 1 : i + 1, n: l.length || 1 }; })();
    var cx = Object.assign({
      stage: stage, shape: shape, w: w, h: h, look: (story && story.look) || 'connect', story: story || {}, meta: b.meta, pro: pro, vis: vis,
      index: idx.i, total: idx.n,
      gsap: W.gsap, motion: W.Motion, anime: W.anime, lottie: W.lottie,
      esc: esc, clamp: clamp, spans: spans, prog: prog, eases: eases, coverRect: coverRect,
      media: function (src) { return /^(https?:|data:|\/)/.test(src) ? src : src; },
      colors: (story && story.colors) || [],
      plugin: function () { var g = W.gsap, out = []; for (var i = 0; i < arguments.length; i++) { var p = W[arguments[i]]; if (!p) throw new Error('GSAP plugin not loaded: ' + arguments[i]); out.push(p); } g.registerPlugin.apply(g, out); return out; },
      // Web Animations API without a library: cx.wa(els, keyframes, {duration, delay, stagger, ease}) (seconds). Collect with cx.fromWaapi(el).
      wa: function (target, kf, o) {
        o = o || {}; var els = target.length != null && !target.tagName ? [].slice.call(target) : [target];
        return els.map(function (e, i) { var a = e.animate(kf, { duration: (o.duration || 0.8) * 1000, delay: ((o.delay || 0) + (o.stagger || 0) * i) * 1000, easing: o.ease || 'cubic-bezier(.16,1,.3,1)', fill: 'both' }); a.pause(); return a; });
      },
      reduced: CS.reduced, capturing: CS.capturing,
      // a person in a picture: cx.face(mediaEl, [x, y, w, h]) for the face, cx.face(mediaEl, box, 'body') for the body. Nothing may be drawn on either.
      face: function (media, box, what) { if (box) { el.__faces = (el.__faces || []).concat([{ el: media, box: box, what: what || 'face' }]); } }
    }, A);
    var clip;
    try { clip = b.mount(el, scene, cx) || A.fromFn(0.5, function () {}); }
    catch (e) { console.error('[connect-ai-slides-web] ' + scene.kind + ': ' + e.message); el.innerHTML = '<div class="cs-missing">' + esc(scene.kind) + ': ' + esc(e.message) + '</div>'; clip = A.fromFn(0.5, function () {}); clip.error = e.message; }
    clip.el = el; clip.frame = frame; clip.kind = scene.kind; clip.shape = shape;
    var p0 = clip.seek(CS.reduced ? clip.dur : 0, CS.capturing);
    clip.t = CS.reduced ? clip.dur : 0;
    return clip;
  };

  // ---------- live clock: play a clip from a to b ----------
  function Player() { this.raf = 0; }
  Player.prototype.play = function (clip, from, to, done) {
    var self = this; this.stop();
    if (CS.reduced || CS.capturing) { clip.seek(to, CS.capturing); clip.t = to; done && done(); return; }
    var t0 = performance.now();
    (function tick(now) {
      var t = Math.min(to, from + (now - t0) / 1000);
      clip.seek(t); clip.t = t;
      if (t < to) self.raf = requestAnimationFrame(tick); else { self.raf = 0; done && done(); }
    })(t0);
  };
  Player.prototype.stop = function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; };

  function stops(clip) { return (clip.steps || []).filter(function (s) { return s > 0.01 && s < clip.dur - 0.01; }).concat([clip.dur]); }


  // ---------- cinematic transitions between slides (deck). a = the frame that leaves, b = the frame that comes, p = 0..1 ----------
  // A pure function of p, so the live deck and a recording show the same in-between frames. Each kind once per deck, in this order.
  function ez(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eo(x) { return 1 - Math.pow(1 - x, 4); }
  function edge(b, on, css) { var e = b.parentNode.querySelector('.cs-tr-edge'); if (!on) { if (e) e.remove(); return; } if (!e) { e = D.createElement('i'); e.className = 'cs-tr-edge'; e.setAttribute('aria-hidden', 'true'); b.parentNode.appendChild(e); } e.style.cssText = css; }
  var TRANS = {
    // camera push: the old slide flies past the lens, the new one settles from a step back
    push: function (a, b, p) { var q = ez(p); a.style.transform = 'scale(' + (1 + 0.35 * q) + ')'; a.style.opacity = 1 - eo(Math.min(1, p * 1.6)); a.style.filter = 'blur(' + (10 * q) + 'px)'; b.style.transform = 'scale(' + (0.86 + 0.14 * eo(p)) + ')'; b.style.opacity = eo(Math.min(1, p * 1.4)); b.style.filter = 'blur(' + (8 * (1 - eo(p))) + 'px)'; },
    // mask wipe with a gold edge of light
    wipe: function (a, b, p) { var q = ez(p), x = 100 * (1 - q); b.style.clipPath = 'inset(0 0 0 ' + x + '%)'; a.style.transform = 'translateX(' + (-12 * q) + '%)'; a.style.filter = 'brightness(' + (1 - 0.6 * q) + ')'; edge(b, p < 1, 'left:' + x + '%;opacity:' + Math.sin(Math.PI * p)); },
    // depth parallax: the new slide slides in on three layers (back, title, body) at different speeds
    depth: function (a, b, p) { var q = ez(p); a.style.transform = 'translateX(' + (-38 * q) + '%) scale(' + (1 - 0.1 * q) + ')'; a.style.opacity = 1 - 0.75 * q; b.style.transform = 'translateX(' + (100 * (1 - q)) + '%)'; [].forEach.call(b.querySelectorAll('.pro-head, .vis-l1'), function (n) { n.style.transform = 'translateX(' + (30 * (1 - eo(p))) + '%)'; }); [].forEach.call(b.querySelectorAll('.pro-body, .vis-l2'), function (n) { n.style.transform = 'translateX(' + (60 * (1 - eo(p))) + '%)'; }); },
    // iris: a circle of light opens the new slide from the middle
    iris: function (a, b, p) { var q = ez(p); b.style.clipPath = 'circle(' + (q * 78) + '% at 50% 50%)'; a.style.transform = 'scale(' + (1 + 0.08 * q) + ')'; a.style.filter = 'brightness(' + (1 - 0.7 * q) + ')'; edge(b, p < 1, 'left:50%;top:50%;width:' + (q * 156) + 'vmax;height:' + (q * 156) + 'vmax;border-radius:50%;transform:translate(-50%,-50%);background:none;box-shadow:0 0 0 1.5px var(--gold2), 0 0 40px 6px color-mix(in srgb, var(--gold) 40%, transparent);opacity:' + Math.sin(Math.PI * p)); },
    // rise: the new slide comes up like a sheet, the old one sinks back into the dark
    rise: function (a, b, p) { var q = ez(p); b.style.transform = 'translateY(' + (100 * (1 - q)) + '%)'; b.style.boxShadow = '0 -40px 120px rgba(0,0,0,' + (0.5 * (1 - q)) + ')'; a.style.transform = 'translateY(' + (-14 * q) + '%) scale(' + (1 - 0.08 * q) + ')'; a.style.filter = 'brightness(' + (1 - 0.65 * q) + ')'; },
    // through: we fly through the old slide into the new one
    through: function (a, b, p) { var q = ez(p); a.style.transform = 'scale(' + (1 + 2.2 * q * q) + ')'; a.style.opacity = 1 - Math.min(1, p * 1.5); b.style.transform = 'scale(' + (0.55 + 0.45 * eo(p)) + ')'; b.style.opacity = eo(Math.min(1, p * 1.3)); b.style.borderRadius = (40 * (1 - eo(p))) + 'px'; },
    // slices: the new slide arrives in three bands, one after the other
    slice: function (a, b, p) { var s = [0, 0.15, 0.3].map(function (d) { return ez(Math.max(0, Math.min(1, (p - d) / 0.7))); }); b.style.clipPath = 'polygon(' + [[0, 0], [100 * s[0], 0], [100 * s[0], 33.4], [100 * s[1], 33.4], [100 * s[1], 66.7], [100 * s[2], 66.7], [100 * s[2], 100], [0, 100]].map(function (v) { return v[0] + '% ' + v[1] + '%'; }).join(',') + ')'; b.style.transform = 'translateX(' + (-6 * (1 - ez(p))) + '%)'; a.style.filter = 'brightness(' + (1 - 0.6 * ez(p)) + ')'; },
    // shutter: a horizontal slit of light opens top and bottom
    shutter: function (a, b, p) { var q = ez(p), y = 50 * (1 - q); b.style.clipPath = 'inset(' + y + '% 0 ' + y + '% 0)'; b.style.transform = 'scale(' + (1.08 - 0.08 * q) + ')'; a.style.transform = 'scale(' + (1 - 0.05 * q) + ')'; a.style.filter = 'brightness(' + (1 - 0.7 * q) + ')'; edge(b, p < 1, 'left:0;right:0;width:auto;height:1.5px;top:' + y + '%;opacity:' + Math.sin(Math.PI * p) + ';box-shadow:0 ' + (100 - 2 * y) * 10.8 + 'px 0 var(--gold2)'); }
  };
  var TRANS_ORDER = ['push', 'wipe', 'depth', 'iris', 'rise', 'through', 'slice', 'shutter'];
  CS.transitions = TRANS_ORDER.slice();
  function transReset(f) { if (!f) return; f.style.transform = f.style.opacity = f.style.filter = f.style.clipPath = f.style.boxShadow = f.style.borderRadius = ''; [].forEach.call(f.querySelectorAll('.pro-head, .pro-body, .vis-l1, .vis-l2'), function (n) { n.style.transform = ''; }); var e = f.parentNode && f.parentNode.querySelector('.cs-tr-edge'); if (e) e.remove(); }

  // =====================================================================
  //  DECK  (reveal.js is the engine: keys, touch, overview, speaker notes, print to PDF)
  // =====================================================================
  CS.deck = function (story) {
    var root = D.querySelector('.reveal .slides');
    var scenes = story.scenes.filter(function (s) { return s.only !== 'site'; });
    var print = /print-pdf/.test(location.search);
    D.documentElement.classList.add('cs-is-deck');
    D.body.classList.add('look-' + (story.look || 'connect'));
    scenes.forEach(function (s, i) {
      var sec = D.createElement('section');
      sec.dataset.scene = s.id || ('s' + (i + 1));
      sec.innerHTML = '<div class="cs-frame"></div>' + (s.notes ? '<aside class="notes">' + esc(s.notes) + '</aside>' : '');
      var n = (blocks[s.kind] && blocks[s.kind].meta.steps) || 0;   // real count is known after mount; fragments are fixed up then
      root.appendChild(sec);
    });
    var clips = [], player = new Player(), state = [];
    function ensure(i) {
      if (clips[i]) return clips[i];
      var sec = root.children[i];
      var clip = clips[i] = CS.mount(sec.querySelector('.cs-frame'), scenes[i], 'deck', story);
      var n = stops(clip).length - 1;
      for (var k = 0; k < n; k++) { var f = D.createElement('span'); f.className = 'fragment cs-step'; f.dataset.fragmentIndex = k; sec.appendChild(f); }
      state[i] = 0;
      return clip;
    }
    function shown(sec) { return sec.querySelectorAll('.cs-step.visible').length; }
    var R = W.Reveal;
    // "cinema" (default): our own transitions; any reveal.js name ("fade", "slide", "none") keeps reveal.js doing it
    var own = !story.transition || story.transition === 'cinema' || TRANS[story.transition];
    var TR = story.transitionTime || 1.0;
    function transKind(i) { var s = scenes[i] || {}; if (s.transition && TRANS[s.transition]) return s.transition; if (TRANS[story.transition]) return story.transition; return TRANS_ORDER[(i - 1) % TRANS_ORDER.length]; }
    var trRaf = 0, trPair = null;
    function trEnd() { if (trRaf) cancelAnimationFrame(trRaf); trRaf = 0; if (trPair) { trPair[0].classList.remove('cs-leave'); transReset(trPair[0].querySelector('.cs-frame')); transReset(trPair[1].querySelector('.cs-frame')); trPair = null; } }
    function trSet(ai, bi, p) {   // the frame of slide ai leaves, bi comes, at p (exact, for recording)
      var a = root.children[ai], b = root.children[bi];
      if (!trPair || trPair[0] !== a || trPair[1] !== b) { trEnd(); trPair = [a, b]; a.classList.add('cs-leave'); }
      TRANS[transKind(Math.max(ai, bi))](a.querySelector('.cs-frame'), b.querySelector('.cs-frame'), Math.max(0, Math.min(1, p)));
    }
    function trPlay(ai, bi) {
      trEnd(); if (!own || CS.reduced || CS.capturing || print || ai < 0 || ai === bi) return;
      var t0 = performance.now();
      (function tick(now) { var p = (now - t0) / 1000 / TR; if (p >= 1) { trEnd(); return; } trSet(ai, bi, p); trRaf = requestAnimationFrame(tick); })(t0);
    }
    var cfg = Object.assign({
      width: 1920, height: 1080, margin: 0, center: false, hash: true, controls: !CS.capturing, progress: !CS.capturing,
      transition: CS.capturing || CS.reduced || own ? 'none' : story.transition, transitionSpeed: 'fast', backgroundTransition: 'none',
      minScale: 0.1, maxScale: 4, slideNumber: false, help: true, pdfSeparateFragments: false, pdfMaxPagesPerSlide: 1,
      plugins: W.RevealNotes ? [W.RevealNotes] : []
    }, story.reveal || {});
    return R.initialize(cfg).then(function () {
      function enter(i, back) {
        var clip = ensure(i), sec = root.children[i];
        if (W.Reveal.sync && !clip.synced) { clip.synced = true; try { W.Reveal.syncFragments ? W.Reveal.syncFragments(sec) : 0; } catch (e) {} }
        var st = stops(clip), k = back ? st.length - 1 : shown(sec);
        state[i] = k;
        if (back || print) { player.stop(); clip.seek(clip.dur, CS.capturing); clip.t = clip.dur; }
        else player.play(clip, k > 0 ? st[k - 1] : 0, st[k]);
        clip.visible && clip.visible(true);
        // the next slide is mounted early so it never flashes
        if (i + 1 < scenes.length) setTimeout(function () { var nx = root.children[i + 1]; if (!clips[i + 1] && nx.offsetParent !== null) ensure(i + 1); }, 400);
      }
      R.on('slidechanged', function (e) {
        var prev = e.previousSlide ? [].indexOf.call(root.children, e.previousSlide) : -1;
        if (prev >= 0 && clips[prev] && clips[prev].visible) clips[prev].visible(false);
        enter(e.indexh, prev > e.indexh && shown(e.currentSlide) > 0);
        trPlay(prev, e.indexh);
      });
      R.on('fragmentshown', function (e) {
        var i = R.getIndices().h, clip = clips[i]; if (!clip || !e.fragment.classList.contains('cs-step')) return;
        var st = stops(clip), k = shown(root.children[i]); state[i] = k;
        player.play(clip, st[k - 1], st[k]);
      });
      R.on('fragmenthidden', function (e) {
        var i = R.getIndices().h, clip = clips[i]; if (!clip || !e.fragment.classList.contains('cs-step')) return;
        var st = stops(clip), k = shown(root.children[i]); state[i] = k;
        player.stop(); clip.seek(st[k]); clip.t = st[k];
      });
      R.on('resize', function () { clips.forEach(function (c) { c && c.fit && c.fit(); }); });
      if (print) { scenes.forEach(function (s, i) { var c = ensure(i); c.seek(c.dur, true); }); }
      else enter(R.getIndices().h, false);

      // --- recording / checking API: exact time, no real clock ---
      var HOLD = story.hold == null ? 1.1 : story.hold, sched = [], T = 0;
      CS.capture = {
        stage: 'deck', count: scenes.length, scenes: scenes,
        prepare: async function () {
          for (var i = 0; i < scenes.length; i++) { R.slide(i, 0); await raf2(); var c = ensure(i); if (c.ready) await c.ready; var d = c.dur + (scenes[i].hold == null ? HOLD : scenes[i].hold); sched[i] = { at: T, dur: d, clip: c }; T += d; }
          R.slide(0, 0); this.duration = T; this.schedule = sched.map(function (s, i) { return { i: i, at: s.at, dur: s.dur, clipDur: s.clip.dur, kind: scenes[i].kind, id: scenes[i].id || ('s' + (i + 1)), lib: s.clip.lib, stops: stops(s.clip), fragments: root.children[i].querySelectorAll('.cs-step').length, error: s.clip.error || null, mode: 'deck' }; });
          return { duration: T, schedule: this.schedule };
        },
        seek: async function (t) {
          var i = 0; while (i < sched.length - 1 && t >= sched[i].at + sched[i].dur) i++;
          if (R.getIndices().h !== i) { R.slide(i, 0); await raf2(); }
          var c = sched[i].clip, lt = t - sched[i].at, ps = [c.seek(c.free ? lt : Math.min(lt, c.dur), true)];
          if (own && i > 0 && lt < TR && !story.noTransitions) { var pc = sched[i - 1].clip; ps.push(pc.seek(pc.free ? sched[i - 1].dur + lt : pc.dur, true)); trSet(i - 1, i, lt / TR); } else trEnd();
          await Promise.all(ps); await raf1();
        },
        goto: async function (i, where) {   // where: 0..1 of the clip
          trEnd(); R.slide(i, 0); await raf2(); var c = ensure(i); if (c.ready) await c.ready;
          await c.seek(c.dur * (where == null ? 1 : where), true); await raf2(); return c.dur;
        },
        visit: async function (i) { trEnd(); R.slide(i, 0); await raf2(); var c = ensure(i); if (c.ready) await c.ready; await raf2(); return c.t; },   // like a person arriving, no seek
        clip: function (i) { return ensure(i); }
      };
      W.__cs_ready = true;
      return CS.capture;
    });
  };

  function raf1() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }
  function raf2() { return raf1().then(raf1); }

  // =====================================================================
  //  SITE  (one page: every scene is one screen; play when seen, or scrub with the scroll)
  // =====================================================================
  CS.site = function (story) {
    var main = D.querySelector('main.cs-site');
    var scenes = story.scenes.filter(function (s) { return s.only !== 'deck'; });
    D.documentElement.classList.add('cs-is-site');
    D.body.classList.add('look-' + (story.look || 'connect'));
    var secs = scenes.map(function (s, i) {
      var meta = (blocks[s.kind] && blocks[s.kind].meta) || {};
      var mode = (s.site && s.site.mode) || (meta.site && meta.site.mode) || 'play';
      var len = (s.site && s.site.len) || (meta.site && meta.site.len) || 1.5;
      var sec = D.createElement('section');
      sec.className = 'cs-screen'; sec.id = s.id || ('s' + (i + 1)); sec.dataset.mode = mode;
      if (mode === 'scrub') sec.style.setProperty('--len', len);
      sec.innerHTML = '<div class="cs-sticky"><div class="cs-frame"></div></div>';
      main.appendChild(sec);
      return { el: sec, scene: s, mode: mode, len: len, clip: null, startT: null, p: 0 };
    });
    function mountAll() {
      secs.forEach(function (x) {
        var keep = x.clip ? x.clip.t : 0;
        if (x.clip && x.clip.dispose) x.clip.dispose();
        x.clip = CS.mount(x.el.querySelector('.cs-frame'), x.scene, 'site', story);
        if (keep) { x.clip.seek(keep, CS.capturing); x.clip.t = keep; }
      });
    }
    mountAll();
    var bar = D.querySelector('.cs-progress i');
    var lenis = null;
    var touch = W.matchMedia && W.matchMedia('(pointer: coarse)').matches;     // phones keep their own scroll
    if (W.Lenis && !CS.capturing && !CS.reduced && !touch && story.smooth !== false) {
      lenis = new W.Lenis({ autoRaf: true, lerp: 0.11, anchors: true });
      CS.lenis = lenis;
    }
    var vh = function () { return W.innerHeight; };
    function frame(now, exact) {
      var H = vh(), ps = [];
      for (var i = 0; i < secs.length; i++) {
        var x = secs[i], r = x.el.getBoundingClientRect(), c = x.clip;
        var vis = r.bottom > 0 && r.top < H;
        if (c.visible && x.vis !== vis) { x.vis = vis; c.visible(vis); }
        if (CS.reduced) continue;
        var t;
        if (x.mode === 'scrub') {
          var span = Math.max(1, r.height - H);
          // the first 12 % of a pinned screen also plays while it slides in, so it is never empty
          var p = clamp(-r.top / span, 0, 1), lead = clamp((H - r.top) / H, 0, 1) * 0.12;
          t = c.dur * clamp(lead + p * 0.88, 0, 1);
          if (!exact) { x.p += (t - x.p) * 0.22; if (Math.abs(t - x.p) < 0.002) x.p = t; t = x.p; } else x.p = t;
        } else {
          var seen = clamp((Math.min(r.bottom, H) - Math.max(r.top, 0)) / Math.min(H, r.height), 0, 1);
          if (x.startT == null && seen >= 0.45) x.startT = now;
          if (!exact && x.startT != null && seen <= 0 && r.top > 0) x.startT = null;     // scrolled back above it: it will play again
          t = x.startT == null ? 0 : Math.min(c.dur, (now - x.startT) / 1000);
          if ((c.free || (c.lib && c.lib.indexOf('video') >= 0)) && x.startT != null) t = (now - x.startT) / 1000;
        }
        // recording only moves what is on screen (a screen is always seeked when it comes into view)
        if (vis || (!exact && Math.abs(t - c.t) > 0.001)) { var pr = c.seek(t, exact); if (pr && pr.then) ps.push(pr); c.t = t; }
      }
      if (bar) { var max = D.documentElement.scrollHeight - H; bar.style.transform = 'scaleX(' + (max > 0 ? clamp(W.scrollY / max, 0, 1) : 0) + ')'; }
      return ps.length ? Promise.all(ps) : null;
    }
    if (CS.reduced) secs.forEach(function (x) { x.clip.seek(x.clip.dur); x.clip.t = x.clip.dur; });
    if (!CS.capturing) {
      (function loop(now) { frame(now, false); requestAnimationFrame(loop); })(performance.now());
      var rz = 0, lastShape = W.innerWidth >= W.innerHeight;
      W.addEventListener('resize', function () {
        clearTimeout(rz); rz = setTimeout(function () {
          var s = W.innerWidth >= W.innerHeight;
          if (s !== lastShape) { lastShape = s; mountAll(); } else secs.forEach(function (x) { x.clip.fit && x.clip.fit(); });
        }, 180);
      });
    }

    // --- recording / checking API: a scroll path as a function of time ---
    var path = [], total = 0;
    CS.capture = {
      stage: 'site', count: secs.length, scenes: scenes,
      prepare: async function () {
        for (var i = 0; i < secs.length; i++) if (secs[i].clip.ready) await secs[i].clip.ready;
        var H = vh(), T = 0.4; path = []; var y = 0;
        secs.forEach(function (x, i) {
          var top = x.el.offsetTop, h = x.el.offsetHeight;
          if (i > 0) { path.push({ a: T, b: T + 1.0, y0: y, y1: top, ease: 'inOut' }); T += 1.0; y = top; }
          if (x.mode === 'scrub') {
            x.trigger = null; var d = Math.max(2.5, x.clip.dur * 1.05);
            path.push({ a: T, b: T + d, y0: top, y1: top + h - H, ease: 'lin' }); T += d; y = top + h - H; T += 0.5;
          } else { x.trigger = T - (i > 0 ? 0.42 : 0.3); T += Math.max(0.6, x.clip.dur - (i > 0 ? 0.42 : 0.3)) + (x.scene.hold == null ? 1.0 : x.scene.hold); }
          x.at = T;
        });
        total = T; this.duration = T;
        this.schedule = secs.map(function (x, i) { return { i: i, id: x.el.id, kind: x.scene.kind, mode: x.mode, len: x.len, trigger: x.trigger, end: x.at, clipDur: x.clip.dur, lib: x.clip.lib, stops: stops(x.clip), error: x.clip.error || null }; });
        return { duration: T, schedule: this.schedule };
      },
      seek: async function (t) {
        var y = 0;
        for (var i = 0; i < path.length; i++) { var s = path[i]; if (t >= s.b) y = s.y1; else if (t >= s.a) { y = s.y0 + (s.y1 - s.y0) * eases[s.ease]((t - s.a) / (s.b - s.a)); break; } else break; }
        W.scrollTo(0, Math.round(y));
        secs.forEach(function (x) { if (x.mode !== 'scrub') x.startT = t >= x.trigger ? x.trigger * 1000 : null; });
        var p = frame(t * 1000, true); if (p) await p; await raf1();
      },
      goto: async function (i, where) {
        var x = secs[i], H = vh(), c = x.clip; if (c.ready) await c.ready;
        var w = where == null ? 1 : where;
        if (x.mode === 'scrub') { W.scrollTo(0, Math.round(x.el.offsetTop + (x.el.offsetHeight - H) * clamp((w - 0.12) / 0.88, 0, 1))); secs.forEach(function (o) { o.startT = null; }); var p = frame(0, true); if (p) await p; }
        else { W.scrollTo(0, x.el.offsetTop); await c.seek(c.dur * w, true); c.t = c.dur * w; }
        await raf2(); return c.dur;
      },
      visit: async function (i) { var x = secs[i]; if (x.clip.ready) await x.clip.ready; W.scrollTo(0, x.mode === 'scrub' ? x.el.offsetTop + x.el.offsetHeight - vh() : x.el.offsetTop); await raf2(); return x.clip.t; },
      clip: function (i) { return secs[i].clip; }
    };
    W.__cs_ready = true;
    return CS.capture;
  };

  // =====================================================================
  //  measuring (used by `check`): what is really on screen
  // =====================================================================
  function lum(c) { var a = [c[0], c[1], c[2]].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function parseColor(s) { var m = /rgba?\(([^)]+)\)/.exec(s); if (!m) { var h = /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?/.exec(s || ''); return h ? [h[1] * 255, h[2] * 255, h[3] * 255, h[4] == null ? 1 : +h[4]] : [255, 255, 255, 1]; } var p = m[1].split(/[ ,/]+/).map(parseFloat); return [p[0], p[1], p[2], p[3] == null || isNaN(p[3]) ? 1 : p[3]]; }
  function frames() { return [].slice.call(D.querySelectorAll('.cs-frame')); }
  // same-origin documents inside a frame (HyperFrames blocks live in an iframe): [{doc, ox, oy, sc, host}]
  function innerDocs(root) {
    var out = [];
    [].forEach.call(root.querySelectorAll('iframe'), function (f) {
      try { var d = f.contentDocument; if (!d || !d.body) return; var r = f.getBoundingClientRect(), w = f.offsetWidth || r.width || 1; out.push({ doc: d, ox: r.left, oy: r.top, sc: r.width / w || 1, host: f }); } catch (e) {}
    });
    return out;
  }
  CS.measure = function (rootEl) {
    var root = rootEl || D.body, vw = W.innerWidth, vh = W.innerHeight, all = frames();
    var out = { texts: [], faces: [], shapes: [], taps: [], imgs: [], videos: [], frames: [], vw: vw, vh: vh, scrollW: D.documentElement.scrollWidth, problems: CS.problems.splice(0) };
    all.forEach(function (f, i) { var r = f.getBoundingClientRect(); out.frames.push({ i: i, kind: f.dataset.kind, x: r.left, y: r.top, w: r.width, h: r.height, onScreen: r.bottom > 1 && r.top < vh - 1 && r.right > 1 && r.left < vw - 1 && r.width > 0 }); });
    all.forEach(function (f, i) {
      var r = f.getBoundingClientRect(), area = Math.max(1, r.width * r.height), sum = 0;
      [].forEach.call(f.querySelectorAll('img,video,canvas,iframe,svg'), function (e) {
        if (e.closest('[aria-hidden="true"]') && e.tagName.toLowerCase() === 'svg' && e.getBoundingClientRect().width < 40) return;
        var q = e.getBoundingClientRect(), w = Math.min(q.right, r.right) - Math.max(q.left, r.left), h = Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top);
        if (w > 8 && h > 8) sum += w * h;
      });
      out.frames[i].pic = Math.min(1, sum / area);
    });
    function chainOpacity(el, stop) { var o = 1; while (el && el !== stop && el.nodeType === 1) { var cs = el.ownerDocument.defaultView.getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); el = el.parentElement; } return o; }
    // the nearest block box around a text: words of one paragraph share it, words that only overlap by accident do not
    var boxIds = new WeakMap(), boxN = 0;
    function boxOf(el, view) { var b = el; while (b && b.parentElement && /^inline/.test(view.getComputedStyle(b).display)) b = b.parentElement; if (!boxIds.has(b)) boxIds.set(b, ++boxN); return boxIds.get(b); }
    function walk(doc, base, T, hostFrame) {
      var view = doc.defaultView, walker = doc.createTreeWalker(base, NodeFilter.SHOW_TEXT, null), n;
      while ((n = walker.nextNode())) {
        var txt = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!txt) continue;
        var el = n.parentElement; if (!el || el.closest('script,style,noscript,template,.notes,[aria-hidden="true"],.cs-nav,.cs-skip,.cs-missing')) continue;
        var op = chainOpacity(el, doc.documentElement); if (hostFrame) op *= chainOpacity(T.host, D.documentElement); if (op < 0.05) continue;
        var rg = doc.createRange(); rg.selectNodeContents(n); var rects = rg.getClientRects(); if (!rects.length) continue;
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (var i = 0; i < rects.length; i++) { var r = rects[i]; if (r.width < 0.5 || r.height < 0.5) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
        if (x1 <= x0) continue;
        // what the ancestors let through (overflow: hidden / clip)
        var cx0 = x0, cy0 = y0, cx1 = x1, cy1 = y1, a = el;
        while (a && a.nodeType === 1) { var s = view.getComputedStyle(a); if (/(hidden|clip|scroll|auto)/.test(s.overflowX + s.overflowY) && a !== doc.documentElement && a !== doc.body) { var q = a.getBoundingClientRect(); cx0 = Math.max(cx0, q.left); cy0 = Math.max(cy0, q.top); cx1 = Math.min(cx1, q.right); cy1 = Math.min(cy1, q.bottom); } a = a.parentElement; }
        var area = (x1 - x0) * (y1 - y0), seen = Math.max(0, cx1 - cx0) * Math.max(0, cy1 - cy0);
        // a line's box is taller than its ink (room for accents and descenders): a tight mask may clip that room without touching a letter
        var lh = rects[0].height, iy0 = y0 + lh * 0.15, iy1 = y1 - lh * 0.14, inkCut = iy1 > iy0 ? 1 - Math.max(0, Math.min(cy1, iy1) - Math.max(cy0, iy0)) / (iy1 - iy0) : 0;
        var cs = view.getComputedStyle(el), clipText = (cs.webkitBackgroundClip || cs.backgroundClip) === 'text';
        var fill = cs.webkitTextFillColor || cs.color, fc = parseColor(fill), col = fc;
        var outline = false;
        if (fc[3] < 0.05) { if (clipText) { col = parseColor(cs.color); if (col[3] < 0.05) col = [255, 255, 255, 1]; el.setAttribute('data-cs-gradtext', ''); } else if (parseFloat(cs.webkitTextStrokeWidth) > 0) outline = true; else continue; }
        // how much the text is scaled on screen: the frame's own scale (reveal.js) is exact; an element that is scaled on top of that is measured itself
        var blk = hostFrame || el.closest('.cs-frame'), fi = blk ? all.indexOf(blk) : -1, sc = T.sc, k;
        var kf = hostFrame || !blk || !blk.offsetWidth ? 1 : blk.getBoundingClientRect().width / blk.offsetWidth;
        if (el.ownerSVGElement && el.getScreenCTM) { var mx = el.getScreenCTM(); k = mx ? Math.hypot(mx.a, mx.b) : kf; }
        else { var ow = el.offsetWidth || 0, oh = el.offsetHeight || 0, ke = kf; if (Math.max(ow, oh) >= 4) { var rr = el.getBoundingClientRect(); ke = ow >= oh ? rr.width / ow : rr.height / oh; } k = isFinite(ke) && ke > 0 && Math.abs(ke / kf - 1) >= 0.04 ? ke : kf; }
        out.texts.push({ text: txt.slice(0, 400), chars: txt.length, x: T.ox + x0 * sc, y: T.oy + y0 * sc, w: (x1 - x0) * sc, h: (y1 - y0) * sc, size: parseFloat(cs.fontSize) * k * sc, weight: parseInt(cs.fontWeight, 10) || 400,
          color: col.slice(0, 3), alpha: op * col[3], cut: area > 0 ? 1 - seen / area : 0, cutX: 1 - Math.max(0, cx1 - cx0) / (x1 - x0), cutY: inkCut, outline: outline, gradient: clipText && fc[3] < 0.05, deco: !!el.closest('[data-deco]'), tap: !!el.closest('a,button'), frame: fi, kind: blk ? blk.dataset.kind : '', box: boxOf(el, view) });
      }
    }
    walk(D, root, { ox: 0, oy: 0, sc: 1 }, null);
    all.forEach(function (f) { if (!root.contains(f)) return; innerDocs(f).forEach(function (T) { walk(T.doc, T.doc.body, T, f); }); });
    // faces declared by blocks
    [].forEach.call(root.querySelectorAll('.cs-block'), function (b) {
      (b.__faces || []).forEach(function (f) {
        var m = f.el, r = m.getBoundingClientRect(); if (r.width < 2 || !D.contains(m)) return;
        var mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, cs = getComputedStyle(m);
        var pos = cs.objectPosition.split(' ').map(function (v) { return parseFloat(v) / 100; });
        var cr = cs.objectFit === 'cover' ? coverRect(r.width, r.height, mw, mh, isNaN(pos[0]) ? 0.5 : pos[0], isNaN(pos[1]) ? 0.5 : pos[1]) : cs.objectFit === 'contain' ? (function () { var s = Math.min(r.width / mw, r.height / mh); return { x: (r.width - mw * s) / 2, y: (r.height - mh * s) / 2, w: mw * s, h: mh * s }; })() : { x: 0, y: 0, w: r.width, h: r.height };
        var fx = r.left + cr.x + f.box[0] * cr.w, fy = r.top + cr.y + f.box[1] * cr.h, fw = f.box[2] * cr.w, fh = f.box[3] * cr.h;
        // only the part of the face that is really shown (the picture box and its clipping parents)
        var X0 = Math.max(fx, r.left), Y0 = Math.max(fy, r.top), X1 = Math.min(fx + fw, r.right), Y1 = Math.min(fy + fh, r.bottom), a = m.parentElement;
        while (a && !a.classList.contains('cs-frame')) { var s = getComputedStyle(a); if (/(hidden|clip)/.test(s.overflowX + s.overflowY)) { var q = a.getBoundingClientRect(); X0 = Math.max(X0, q.left); Y0 = Math.max(Y0, q.top); X1 = Math.min(X1, q.right); Y1 = Math.min(Y1, q.bottom); } a = a.parentElement; }
        if (X1 > X0 && Y1 > Y0 && chainOpacity(m, D.documentElement) > 0.05) out.faces.push({ x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0, frame: all.indexOf(b.parentElement), media: m, what: f.what || 'face' });
      });
    });
    // anything painted that is not the picture itself, to test against faces
    out.faces.forEach(function (f) {
      var blk = all[f.frame]; if (!blk) return;
      [].forEach.call(blk.querySelectorAll('*'), function (e) {
        if (e === f.media || e.contains(f.media) || e.closest('[data-face-ok]')) return;
        var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || chainOpacity(e, D.documentElement) < 0.05) return;
        var tag = e.tagName.toLowerCase();
        var painted = (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseColor(cs.backgroundColor)[3] > 0.02) || cs.backgroundImage !== 'none' || (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || /^(path|line|circle|rect|ellipse|polyline|polygon|img|video|canvas)$/.test(tag);
        if (!painted) return;
        var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        var ix = Math.min(r.right, f.x + f.w) - Math.max(r.left, f.x), iy = Math.min(r.bottom, f.y + f.h) - Math.max(r.top, f.y);
        // a cover in the background colour that hides the picture is a reveal, not a graphic on the face (it must be gone at the end)
        var bgc = parseColor(cs.backgroundColor), fbg = parseColor(getComputedStyle(blk).backgroundColor);
        var cover = cs.backgroundImage === 'none' && bgc[3] > 0.98 && Math.abs(bgc[0] - fbg[0]) + Math.abs(bgc[1] - fbg[1]) + Math.abs(bgc[2] - fbg[2]) < 6 && !/^(path|line|circle|rect|ellipse|polyline|polygon|img|video|canvas)$/.test(tag);
        if (ix > 2 && iy > 2) out.shapes.push({ tag: tag, cls: String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).slice(0, 40), frame: f.frame, cover: cover });
      });
      delete f.media;
    });
    [].forEach.call(D.querySelectorAll('a[href],button'), function (a) { if (!root.contains(a) && !a.closest('.cs-nav')) return; var r = a.getBoundingClientRect(); if (r.width > 0 && r.bottom > 0 && r.top < vh && chainOpacity(a, D.documentElement) > 0.05) out.taps.push({ text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40), w: r.width, h: r.height, x: r.left, y: r.top, nav: !!a.closest('.cs-nav') }); });
    [].forEach.call(root.querySelectorAll('img'), function (im) { var b = im.closest('.cs-frame'); out.imgs.push({ src: (im.getAttribute('src') || '').slice(-60), alt: im.getAttribute('alt'), broken: im.complete && im.naturalWidth === 0, frame: b ? all.indexOf(b) : -1 }); });
    [].forEach.call(root.querySelectorAll('video'), function (v) { var b = v.closest('.cs-frame'); out.videos.push({ src: (v.getAttribute('src') || '').slice(-60), poster: !!v.getAttribute('poster'), broken: !!v.error, frame: b ? all.indexOf(b) : -1 }); });
    return out;
  };
  // hide every glyph but keep what is behind it, so a screenshot shows the real background under the text
  function hideCss(pre) {
    var off = '{transition:none!important;color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;text-decoration-color:transparent!important}';
    return pre + '*,' + pre + '*::before,' + pre + '*::after' + off + pre + 'svg text,' + pre + 'svg tspan{fill:transparent!important;stroke:transparent!important}' + pre + '[data-cs-gradtext]{background-image:none!important}';
  }
  CS.hideText = function (on) {
    var docs = [D]; frames().forEach(function (f) { innerDocs(f).forEach(function (T) { docs.push(T.doc); }); });
    docs.forEach(function (doc) {
      var e = doc.getElementById('cs-hide-text');
      if (on && !e) { e = doc.createElement('style'); e.id = 'cs-hide-text'; e.textContent = hideCss(doc === D ? '.cs-block ' : ''); (doc.head || doc.documentElement).appendChild(e); }
      if (!on && e) e.remove();
    });
  };
  // when is the screen readable? first time every glyph of the finished screen is (almost) fully opaque
  CS.readable = async function (i, step) {
    var c = CS.capture.clip(i); await CS.capture.goto(i, 1);
    var fr = c.frame, nodes = [], w = D.createTreeWalker(fr, NodeFilter.SHOW_TEXT, null), n;
    function op(el) { var o = 1; while (el && el !== fr) { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); el = el.parentElement; } return o; }
    while ((n = w.nextNode())) { if (!n.nodeValue.trim() || !n.parentElement || n.parentElement.closest('[aria-hidden="true"],[data-deco],style,script')) continue; var o = op(n.parentElement); if (o > 0.05) nodes.push({ el: n.parentElement, end: o }); }
    if (!nodes.length) return { t: 0, dur: c.dur, nodes: 0 };
    var dt = step || 0.1, t = 0, hit = c.dur;
    for (; t <= c.dur + 1e-6; t += dt) { await c.seek(Math.min(t, c.dur), c.lib.indexOf('video') >= 0 ? false : true); if (nodes.every(function (x) { return op(x.el) >= x.end * 0.9; })) { hit = Math.min(t, c.dur); break; } }
    await c.seek(c.dur, true);
    return { t: hit, dur: c.dur, nodes: nodes.length };
  };
  CS.lum = lum;
})();
