(function (global) {
  'use strict';

  var VALID = ['orange', 'purple', 'green', 'blue', 'red', 'pink', 'yellow', 'lime', 'navy', 'gray'];
  var DURATION_MS = 1050;
  var pollTimer = null;
  var animFrame = null;
  var currentName = null;
  var currentCss = null;
  var animatingTo = null;

  var PALETTES = {
    orange: { gold: '#f6b34a', gold2: '#ffcf7a', accent: '#f6b34a', accentDark: '#7b5925' },
    purple: { gold: '#c084fc', gold2: '#e9d5ff', accent: '#c084fc', accentDark: '#60427e' },
    green: { gold: '#4ade80', gold2: '#bbf7d0', accent: '#4ade80', accentDark: '#256f40' },
    blue: { gold: '#38bdf8', gold2: '#bae6fd', accent: '#38bdf8', accentDark: '#1c5e7c' },
    red: { gold: '#FF3232', gold2: '#FFB3B3', accent: '#FF3232', accentDark: '#7f1919' },
    pink: { gold: '#FF5F87', gold2: '#FFB0C8', accent: '#FF5F87', accentDark: '#7f2f43' },
    yellow: { gold: '#FFE600', gold2: '#FFF566', accent: '#FFE600', accentDark: '#7f7300' },
    lime: { gold: '#CDFF5F', gold2: '#E8FFA5', accent: '#CDFF5F', accentDark: '#667f2f' },
    navy: { gold: '#5F65FF', gold2: '#B8BBFF', accent: '#5F65FF', accentDark: '#2f327f' },
    gray: { gold: '#484848', gold2: '#A8A8A8', accent: '#A8A8A8', accentDark: '#545454' }
  };

  function getFileText(path) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path + '?t=' + Date.now(), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) resolve(xhr.responseText);
          else reject(xhr.status);
        }
      };
      xhr.send();
    });
  }

  function normalizeAccent(text) {
    var v = String(text || '').trim().toLowerCase();
    return VALID.indexOf(v) >= 0 ? v : 'orange';
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(function (c) { return c + c; }).join('');
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  function rgbToHex(r, g, b) {
    function part(v) {
      var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? '0' + s : s;
    }
    return '#' + part(r) + part(g) + part(b);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpHex(fromHex, toHex, t) {
    var a = hexToRgb(fromHex);
    var b = hexToRgb(toHex);
    return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
  }

  function paletteToCss(palette) {
    var g = hexToRgb(palette.gold);
    var g2 = hexToRgb(palette.gold2);
    return {
      gold: palette.gold,
      gold2: palette.gold2,
      goldRgb: g[0] + ',' + g[1] + ',' + g[2],
      gold2Rgb: g2[0] + ',' + g2[1] + ',' + g2[2],
      accent: palette.accent || palette.gold,
      accentDark: palette.accentDark
    };
  }

  function applyCssPalette(cssPalette) {
    var root = document.documentElement;
    root.style.setProperty('--gold', cssPalette.gold);
    root.style.setProperty('--gold2', cssPalette.gold2);
    root.style.setProperty('--gold-rgb', cssPalette.goldRgb);
    root.style.setProperty('--gold2-rgb', cssPalette.gold2Rgb);
    root.style.setProperty('--accent', cssPalette.accent);
    root.style.setProperty('--accent-dark', cssPalette.accentDark);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function lerpCss(start, end, t) {
    return {
      gold: lerpHex(start.gold, end.gold, t),
      gold2: lerpHex(start.gold2, end.gold2, t),
      goldRgb: [
        Math.round(lerp(parseInt(start.goldRgb.split(',')[0], 10), parseInt(end.goldRgb.split(',')[0], 10), t)),
        Math.round(lerp(parseInt(start.goldRgb.split(',')[1], 10), parseInt(end.goldRgb.split(',')[1], 10), t)),
        Math.round(lerp(parseInt(start.goldRgb.split(',')[2], 10), parseInt(end.goldRgb.split(',')[2], 10), t))
      ].join(','),
      gold2Rgb: [
        Math.round(lerp(parseInt(start.gold2Rgb.split(',')[0], 10), parseInt(end.gold2Rgb.split(',')[0], 10), t)),
        Math.round(lerp(parseInt(start.gold2Rgb.split(',')[1], 10), parseInt(end.gold2Rgb.split(',')[1], 10), t)),
        Math.round(lerp(parseInt(start.gold2Rgb.split(',')[2], 10), parseInt(end.gold2Rgb.split(',')[2], 10), t))
      ].join(','),
      accent: lerpHex(start.accent, end.accent, t),
      accentDark: lerpHex(start.accentDark, end.accentDark, t)
    };
  }

  function applyAccentInstant(name) {
    var palette = PALETTES[name] || PALETTES.orange;
    currentName = name;
    animatingTo = null;
    currentCss = paletteToCss(palette);
    document.documentElement.setAttribute('data-accent', name);
    applyCssPalette(currentCss);
  }

  function animateAccentTo(name) {
    if (name === currentName) return;
    if (name === animatingTo) return;

    var target = PALETTES[name] || PALETTES.orange;
    var end = paletteToCss(target);
    var start = currentCss ? {
      gold: currentCss.gold,
      gold2: currentCss.gold2,
      goldRgb: currentCss.goldRgb,
      gold2Rgb: currentCss.gold2Rgb,
      accent: currentCss.accent,
      accentDark: currentCss.accentDark
    } : end;
    var t0 = performance.now();

    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }

    animatingTo = name;
    document.documentElement.setAttribute('data-accent', name);

    function step(now) {
      var t = Math.min(1, (now - t0) / DURATION_MS);
      var css = lerpCss(start, end, easeInOut(t));
      currentCss = css;
      applyCssPalette(css);
      if (t < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        currentName = name;
        animatingTo = null;
        currentCss = end;
        applyCssPalette(end);
        animFrame = null;
      }
    }

    requestAnimationFrame(step);
  }

  async function readAccentName() {
    var raw = await getFileText('marathon_widget_accent.txt');
    return normalizeAccent(raw);
  }

  async function syncAccent() {
    try {
      var next = await readAccentName();
      if (next === currentName || next === animatingTo) return;
      animateAccentTo(next);
    } catch (e) {}
  }

  function start(intervalMs) {
    var interval = intervalMs || 900;
    if (pollTimer) clearInterval(pollTimer);
    readAccentName().then(function (name) {
      applyAccentInstant(name);
      syncAccent();
      pollTimer = setInterval(syncAccent, interval);
    }).catch(function () {
      applyAccentInstant('orange');
      pollTimer = setInterval(syncAccent, interval);
    });
  }

  global.MarathonAccent = { start: start };
})(window);
