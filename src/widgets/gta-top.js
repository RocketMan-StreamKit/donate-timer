/**
 * GTA 6 Top-6 row builder shared by `gta_top_rotate.html` and `gta_top_list.html`.
 * Decorations per place follow the reference design:
 * #1 gold name, falling money, sparkles and a light running around the border;
 * #2 silver with police lights and flying dust; #3 bronze with floating "+REP"; #4–#6 plain.
 */
(function () {
  'use strict';

  /** Name and rank colors per place. */
  var NAME_COLORS = ['#ffd24a', '#BBBBBB', '#EE9C49', '#ffffff', '#ffffff', '#ffffff'];
  var RANK_COLORS = ['#ffd24a', '#BBBBBB', '#EE9C49', '#ff6aa6', '#ff6aa6', '#ff6aa6'];
  /** Rounded border path used by the #1 orbit light. */
  var ORBIT_PATH = "path('M3.75,1.25 H476.25 A2.5,2.5 0 0 1 478.75,3.75 V33.25 A2.5,2.5 0 0 1 476.25,35.75 H3.75 A2.5,2.5 0 0 1 1.25,33.25 V3.75 A2.5,2.5 0 0 1 3.75,1.25 Z')";
  /** #1 falling money: [left, width, color, duration, delay, label]. */
  var MONEY = [
    [34, 16, '#3fae4a', 2.2, 0, '$'], [70, 16, '#3fae4a', 3.2, -0.37, '$'], [112, 9, '#ffcc2a', 2.8, -0.74, ''],
    [150, 16, '#3fae4a', 2.3, -1.11, '$'], [196, 16, '#3fae4a', 3.3, -1.48, '$'], [238, 9, '#ffcc2a', 2.9, -1.85, ''],
    [282, 16, '#3fae4a', 2.5, -2.22, '$'], [330, 16, '#3fae4a', 3.5, -2.59, '$'], [372, 9, '#ffcc2a', 3.0, -2.96, ''],
    [410, 16, '#3fae4a', 2.6, -3.33, '$'], [448, 16, '#3fae4a', 2.2, -3.7, '$'], [92, 9, '#ffcc2a', 3.2, -4.07, ''],
    [300, 16, '#3fae4a', 2.8, -4.44, '$']
  ];
  /** #1 sparkles: [left, top, color, delay]. */
  var TWINKLE = [
    [180, 8, '#ffffff', 0], [262, 32, '#ffe9a0', 0.7], [330, 10, '#ffffff', 1.4], [398, 30, '#ffe9a0', 0.3],
    [440, 12, '#ffffff', 1.9], [120, 32, '#ffe9a0', 1.1], [300, 24, '#ffffff', 2.3]
  ];
  /** #3 "+REP" labels: [left, top]. */
  var REP = [[150, 22], [205, 8], [262, 26], [318, 10], [372, 24], [425, 8], [100, 10]];
  var STAR = '<polygon points="12,2 15,9 22,9.5 16.5,14.5 18.5,22 12,18 5.5,22 7.5,14.5 2,9.5 9,9" stroke="#000" stroke-width="1.6" stroke-linejoin="round" fill="';

  /**
   * Creates an element from HTML.
   * @param {string} html Markup with a single root.
   * @returns {HTMLElement} Element.
   */
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  /**
   * Six stars, `7 - place` of them filled.
   * @param {number} place 1..6.
   * @returns {string} Markup.
   */
  function stars(place) {
    var out = '';
    for (var i = 0; i < 6; i++) {
      var fill = i < 7 - place ? '#ffcc2a' : 'rgba(0,0,0,.4)';
      out += '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">' + STAR + fill + '"></polygon></svg>';
    }
    return '<div class="gta-stars">' + out + '</div>';
  }

  /**
   * Dashed inner border (#1 gold, #3 bronze pulsing).
   * @param {string} color Stroke color.
   * @param {boolean} pulse Animate opacity.
   * @returns {string} Markup.
   */
  function dashed(color, pulse) {
    return '<svg class="gta-dashed" aria-hidden="true" width="480" height="37" viewBox="0 0 480 37"' +
      (pulse ? ' style="animation:ringpulse 5s ease-in-out infinite"' : '') +
      '><rect x="1" y="1" width="478" height="35" rx="2" ry="2" fill="none" stroke="' + color +
      '" stroke-width="2" stroke-dasharray="2 2" shape-rendering="crispEdges"></rect></svg>';
  }

  /**
   * Background effects for a place.
   * @param {number} place 1..6.
   * @returns {string} Markup for the effect layer.
   */
  function effects(place) {
    var out = '';
    var i;
    if (place === 1) {
      for (i = 0; i < MONEY.length; i++) {
        var m = MONEY[i];
        var base = 'position:absolute;top:0;left:' + m[0] + 'px;width:' + m[1] + 'px;height:9px;box-sizing:border-box;opacity:0;animation:moneyfall ' + m[3] + 's linear ' + m[4] + 's infinite;';
        out += m[5]
          ? '<div style="' + base + 'border-radius:1px;background:#3fae4a;border:1px solid #1d6b2a;color:#d9ffd5;font:900 7px/7px Archivo,sans-serif;text-align:center">$</div>'
          : '<div style="' + base + 'border-radius:50%;background:#ffcc2a;border:1px solid #a87800"></div>';
      }
      for (i = 0; i < TWINKLE.length; i++) {
        var t = TWINKLE[i];
        out += '<div style="position:absolute;left:' + t[0] + 'px;top:' + t[1] + 'px;width:9px;height:9px;background:' + t[2] +
          ';clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);opacity:0;animation:twinkle 2.4s ease-in-out ' + t[3] + 's infinite"></div>';
      }
    } else if (place === 2) {
      var durs = [9.0, 10.6, 12.2, 13.8, 15.4];
      for (i = 0; i < 14; i++) {
        var size = i % 2 ? 3 : 2;
        out += '<div style="position:absolute;left:0;top:' + (16 + i) + 'px;width:' + size + 'px;height:' + size +
          'px;border-radius:50%;background:#d4d8df;opacity:0;animation:' + (i % 2 ? 'flyL' : 'flyR') + ' ' +
          durs[i % 5] + 's linear -' + (Math.round(i * 13.7) / 10) + 's infinite"></div>';
      }
    } else if (place === 3) {
      for (i = 0; i < REP.length; i++) {
        out += '<div style="position:absolute;left:' + REP[i][0] + 'px;top:' + REP[i][1] +
          'px;font-family:Archivo,sans-serif;font-weight:900;font-size:12px;letter-spacing:1px;color:#fff1a8;opacity:0;white-space:nowrap;' +
          'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;animation:repfloat 2.4s ease-out -' +
          (i * 0.34).toFixed(2) + 's infinite">+REP</div>';
      }
    }
    return out;
  }

  /**
   * #1 light running around the border (64 fading dots).
   * @returns {string} Markup.
   */
  function orbit() {
    var out = '';
    for (var i = 0; i < 64; i++) {
      var opacity = Math.max(0.001, 0.95 * Math.pow(1 - i / 64, 1.6)).toFixed(3);
      out += '<div style="position:absolute;left:0;top:0;width:3px;height:3px;background:#ffd24a;opacity:' + opacity +
        ';offset-path:' + ORBIT_PATH + ';offset-rotate:0deg;animation:orbit 5s linear ' + (-5 + i * 0.0196).toFixed(4) + 's infinite"></div>';
    }
    return out;
  }

  /**
   * #2 police lights.
   * @returns {string} Markup.
   */
  function sirens() {
    return '<div style="position:absolute;left:-90px;top:-32px;width:250px;height:101px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,40,40,.9),rgba(255,40,40,0));opacity:0;animation:sirenA 1.6s ease-in-out infinite"></div>' +
      '<div style="position:absolute;right:-90px;top:-32px;width:250px;height:101px;border-radius:50%;background:radial-gradient(closest-side,rgba(50,110,255,.9),rgba(50,110,255,0));opacity:0;animation:sirenB 1.6s ease-in-out infinite"></div>' +
      '<div style="position:absolute;inset:0;box-sizing:border-box;border:1.5px solid transparent;border-image:linear-gradient(90deg,#ff3b3b 0%,#ff3b3b 28%,rgba(255,59,59,0) 78%) 1;opacity:0;animation:sirenAo 1.6s ease-in-out infinite"></div>' +
      '<div style="position:absolute;inset:0;box-sizing:border-box;border:1.5px solid transparent;border-image:linear-gradient(90deg,rgba(59,123,255,0) 22%,#3b7bff 72%,#3b7bff 100%) 1;opacity:0;animation:sirenBo 1.6s ease-in-out infinite"></div>';
  }

  /**
   * Builds one Top-6 row.
   * @param {number} place 1..6.
   * @param {string} name Donor name.
   * @param {string} label Small caption under the stars.
   * @returns {HTMLElement} Row element.
   * @example GtaTop.row(1, 'Alex', 'Топ-6 донатеров');
   */
  function row(place, name, label) {
    var idx = Math.max(0, Math.min(5, place - 1));
    var nameStyle = 'color:' + NAME_COLORS[idx] + ';' + (place === 1 ? 'animation:goldglow 1.8s ease-in-out infinite;' : '');
    var node = el(
      '<div class="gta-row" role="group">' +
        (place === 1 ? dashed('#ffd24a', false) : place === 3 ? dashed('#EE9C49', true) : '') +
        (place === 2 ? sirens() : '') +
        '<div class="gta-row-inner">' +
          '<div class="gta-row-fx">' + effects(place) + '</div>' +
          '<div class="gta-row-grid">' +
            '<div>' + stars(place) + '<div class="gta-row-label gta-outline"></div></div>' +
            '<div class="gta-row-name' + (place === 1 ? '' : ' gta-outline') + '" style="' + nameStyle + '"></div>' +
            '<div class="gta-row-rank gta-outline" style="color:' + RANK_COLORS[idx] + '">#' + place + '</div>' +
          '</div>' +
        '</div>' +
        (place === 1 ? orbit() : '') +
      '</div>'
    );
    node.querySelector('.gta-row-label').textContent = label;
    node.querySelector('.gta-row-name').textContent = name;
    node.setAttribute('aria-label', '#' + place + ' ' + name);
    return node;
  }

  /**
   * Applies this widget's background fill from the snapshot (`meta.gta.bgAlpha[key]`).
   * @param {object} meta Snapshot meta.
   * @param {string} key `topRotate` or `topList`.
   */
  function applyBackground(meta, key) {
    var alpha = meta && meta.gta && meta.gta.bgAlpha ? meta.gta.bgAlpha[key] : undefined;
    if (typeof alpha === 'number') {
      document.documentElement.style.setProperty('--bg-a', String(alpha));
    }
  }

  window.GtaTop = { row: row, applyBackground: applyBackground };
})();
