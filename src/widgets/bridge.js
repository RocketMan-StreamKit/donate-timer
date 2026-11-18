/**
 * Donate Timer widget bridge.
 *
 * The widget pages are ports of the desktop Donate Timer overlays, which polled text files
 * (`timer.txt`, `rate.txt`, `blink.flag`, …) from a local HTTP server. This script keeps a live
 * snapshot of those "files" (Socket.IO push with HTTP polling fallback) and answers the pages'
 * XMLHttpRequest / fetch calls from it, so the original widget code runs unchanged.
 *
 * Load it first in `<head>`: `<script src="bridge.js"></script>`.
 */
(function () {
  'use strict';

  /** Path segments: `/addon_static/{addonId}/widgets/{page}.html`. */
  var parts = window.location.pathname.split('/').filter(Boolean);
  /** Addon id taken from the URL. */
  var addonId = decodeURIComponent(parts[1] || 'donate-timer');
  /** Frontend token from `?token=`. */
  var token = new URLSearchParams(window.location.search).get('token') || '';
  /** `?sound=0` mutes widget sounds. */
  var soundAllowed = new URLSearchParams(window.location.search).get('sound') !== '0';
  /** Base URL of the addon HTTP endpoints. */
  var apiBase = window.location.origin + '/addon/' + encodeURIComponent(addonId);

  /** Emulated file names served from the snapshot. */
  var KNOWN = {
    'timer.txt': 1,
    'rate.txt': 1,
    'title.txt': 1,
    'blink.flag': 1,
    'donation_alert.txt': 1,
    'logs.txt': 1,
    'on_air.txt': 1,
    'total_donations_rub.txt': 1,
    'top5_marathon_inline.txt': 1,
    'top5_marathon_list.txt': 1,
    'marathon_time_goal.txt': 1,
    'marathon_widget_accent.txt': 1,
    'donation_goal.json': 1,
    'bonus_rate.json': 1
  };

  /** Latest snapshot `{ files, meta }` or null before the first load. */
  var snapshot = null;
  /** Callbacks waiting for the first snapshot. */
  var waiters = [];
  /** Snapshot listeners registered via `DonateTimerBridge.on`. */
  var listeners = [];
  /** True while the Socket.IO connection is up. */
  var socketUp = false;

  /**
   * Resolves a request URL to a known file name, or null.
   * @param {string} url Request URL.
   * @returns {string|null} File name.
   * @example knownFile('timer.txt?t=1'); // 'timer.txt'
   */
  function knownFile(url) {
    try {
      var u = new URL(String(url), window.location.href);
      if (u.origin !== window.location.origin) return null;
      var name = u.pathname.split('/').pop() || '';
      return KNOWN[name] ? name : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Stores a snapshot and notifies listeners.
   * @param {{files: Object, meta: Object}} next Snapshot from the worker.
   * @example applySnapshot(data);
   */
  function applySnapshot(next) {
    if (!next || typeof next !== 'object' || !next.files) return;
    snapshot = next;
    if (next.meta) {
      window.DT_CURRENCY = next.meta.currency;
      window.DT_CURRENCY_SYMBOL = next.meta.symbol;
      var marks = document.querySelectorAll('[data-dt-currency-symbol]');
      for (var i = 0; i < marks.length; i++) marks[i].textContent = next.meta.symbol;
    }
    var pending = waiters;
    waiters = [];
    for (var w = 0; w < pending.length; w++) pending[w]();
    for (var l = 0; l < listeners.length; l++) {
      try {
        listeners[l](snapshot);
      } catch (e) {}
    }
  }

  /**
   * Runs a callback once a snapshot is available.
   * @param {Function} fn Callback.
   * @example whenReady(function () { ... });
   */
  function whenReady(fn) {
    if (snapshot) fn();
    else waiters.push(fn);
  }

  /**
   * Reads one emulated file.
   * @param {string} name File name.
   * @returns {{status: number, text: string}} Fake response.
   * @example readFile('timer.txt').text; // '01:00:00'
   */
  function readFile(name) {
    var value = snapshot && snapshot.files ? snapshot.files[name] : null;
    if (value === null || value === undefined) return { status: 404, text: '' };
    return { status: 200, text: String(value) };
  }

  /**
   * Polls the snapshot endpoint (fallback when the socket is down).
   * @example poll();
   */
  function poll() {
    var xhr = new RealXHR();
    xhr.open('GET', apiBase + '/snapshot?token=' + encodeURIComponent(token) + '&_=' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try {
          applySnapshot(JSON.parse(xhr.responseText));
        } catch (e) {}
      }
    };
    xhr.send();
  }

  /**
   * Connects to the worker Socket.IO namespace when the client library is available.
   * @example connectSocket();
   */
  function connectSocket() {
    if (typeof window.io !== 'function') return;
    var socket = window.io(window.location.origin + '/addon/' + encodeURIComponent(addonId) + '/live', {
      path: '/addon/socket.io',
      transports: ['websocket', 'polling']
    });
    socket.on('connect', function () {
      socketUp = true;
    });
    socket.on('disconnect', function () {
      socketUp = false;
    });
    socket.on('snapshot', applySnapshot);
  }

  var RealXHR = window.XMLHttpRequest;
  var realFetch = window.fetch ? window.fetch.bind(window) : null;

  /**
   * XMLHttpRequest replacement: known files come from the snapshot, everything else is real.
   * @constructor
   */
  function BridgeXHR() {
    this._real = null;
    this._file = null;
    this._listeners = {};
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.responseText = '';
    this.response = '';
    this.responseType = '';
    this.onreadystatechange = null;
    this.onload = null;
    this.onerror = null;
    this.onloadend = null;
    this.timeout = 0;
  }

  BridgeXHR.prototype.open = function (method, url) {
    var file = String(method || 'GET').toUpperCase() === 'GET' ? knownFile(url) : null;
    if (file) {
      this._file = file;
      this.readyState = 1;
      return;
    }
    var self = this;
    var real = new RealXHR();
    this._real = real;
    real.onreadystatechange = function () {
      self.readyState = real.readyState;
      self.status = real.status;
      self.statusText = real.statusText;
      if (real.readyState === 4) {
        self.responseText = real.responseType === '' || real.responseType === 'text' ? real.responseText : '';
        self.response = real.response;
      }
      self._fire('readystatechange');
      if (real.readyState === 4) {
        self._fire(real.status ? 'load' : 'error');
        self._fire('loadend');
      }
    };
    real.open.apply(real, arguments);
  };

  BridgeXHR.prototype.setRequestHeader = function (name, value) {
    if (this._real) this._real.setRequestHeader(name, value);
  };

  BridgeXHR.prototype.getResponseHeader = function (name) {
    return this._real ? this._real.getResponseHeader(name) : null;
  };

  BridgeXHR.prototype.getAllResponseHeaders = function () {
    return this._real ? this._real.getAllResponseHeaders() : '';
  };

  BridgeXHR.prototype.overrideMimeType = function (mime) {
    if (this._real) this._real.overrideMimeType(mime);
  };

  BridgeXHR.prototype.abort = function () {
    if (this._real) this._real.abort();
  };

  BridgeXHR.prototype.addEventListener = function (type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  };

  BridgeXHR.prototype.removeEventListener = function (type, fn) {
    var list = this._listeners[type] || [];
    var idx = list.indexOf(fn);
    if (idx >= 0) list.splice(idx, 1);
  };

  BridgeXHR.prototype._fire = function (type) {
    var handler = this['on' + type];
    var evt = { type: type, target: this, currentTarget: this };
    if (typeof handler === 'function') {
      try {
        handler.call(this, evt);
      } catch (e) {
        setTimeout(function () { throw e; });
      }
    }
    var list = (this._listeners[type] || []).slice();
    for (var i = 0; i < list.length; i++) {
      try {
        list[i].call(this, evt);
      } catch (e) {}
    }
  };

  BridgeXHR.prototype.send = function (body) {
    if (this._real) {
      if (this.responseType) this._real.responseType = this.responseType;
      this._real.send(body);
      return;
    }
    var self = this;
    whenReady(function () {
      setTimeout(function () {
        var res = readFile(self._file);
        self.readyState = 4;
        self.status = res.status;
        self.statusText = res.status === 200 ? 'OK' : 'Not Found';
        self.responseText = res.text;
        self.response = res.text;
        self._fire('readystatechange');
        self._fire('load');
        self._fire('loadend');
      }, 0);
    });
  };

  window.XMLHttpRequest = BridgeXHR;

  if (realFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : input && input.url;
      var file = knownFile(url);
      if (!file) return realFetch(input, init);
      var method = String((init && init.method) || 'GET').toUpperCase();
      if (method !== 'GET') {
        // The desktop widgets "clear" donation_alert.txt with PUT; alerts expire on the worker side.
        return Promise.resolve(new Response('', { status: 200 }));
      }
      return new Promise(function (resolve) {
        whenReady(function () {
          var res = readFile(file);
          resolve(new Response(res.text, { status: res.status }));
        });
      });
    };
  }

  /**
   * Plays the bonus window sounds (open jingle + countdown bomb) in this page.
   * The desktop app played them on the PC; here OBS captures the browser source audio.
   * @example DonateTimerBridge.enableBonusSounds();
   */
  function enableBonusSounds() {
    if (!soundAllowed) return;
    /** Seconds left when the bomb clip starts (clip hit lands as the widget explodes). */
    var BOMB_START_AT = 45.1 - 0.25;
    var bomb = new Audio('../sounds/bomb_timer.mp3');
    bomb.preload = 'auto';
    var armedFor = null;
    var lastEndsAt = null;
    var initialized = false;

    function bonusData() {
      try {
        return JSON.parse(readFile('bonus_rate.json').text || '{}');
      } catch (e) {
        return {};
      }
    }

    function volume() {
      var v = snapshot && snapshot.meta && snapshot.meta.sounds ? Number(snapshot.meta.sounds.volume) : 80;
      return Math.max(0, Math.min(1, (isFinite(v) ? v : 80) / 100));
    }

    function stopBomb() {
      try {
        bomb.pause();
        bomb.currentTime = 0;
      } catch (e) {}
    }

    function check() {
      if (!snapshot) return;
      var sounds = (snapshot.meta && snapshot.meta.sounds) || {};
      var data = bonusData();
      var endsAt = data.active && data.ends_at ? Number(data.ends_at) : null;
      var now = Date.now() / 1000;

      if (initialized && endsAt && endsAt !== lastEndsAt && sounds.openUrl) {
        try {
          var jingle = new Audio(sounds.openUrl);
          jingle.volume = volume();
          jingle.play().catch(function () {});
        } catch (e) {}
      }
      lastEndsAt = endsAt;
      initialized = true;

      if (!endsAt) {
        // Early stop cuts the clip; a window that simply ran out keeps the tail.
        if (armedFor !== null && now < armedFor) stopBomb();
        if (armedFor !== null && now >= armedFor + 10) armedFor = null;
        return;
      }
      if (!sounds.bomb) {
        if (armedFor !== null) stopBomb();
        armedFor = null;
        return;
      }
      if (armedFor !== null && armedFor !== endsAt) {
        stopBomb();
        armedFor = null;
      }
      var left = endsAt - now;
      if (armedFor === null && left > 0 && left <= BOMB_START_AT) {
        armedFor = endsAt;
        try {
          bomb.volume = volume();
          bomb.currentTime = Math.max(0, BOMB_START_AT - left);
          bomb.play().catch(function () {});
        } catch (e) {}
      }
    }

    setInterval(check, 100);
  }

  window.DonateTimerBridge = {
    /** Latest snapshot or null. */
    get snapshot() {
      return snapshot;
    },
    /**
     * Subscribes to snapshot updates.
     * @param {Function} fn Callback receiving the snapshot.
     */
    on: function (fn) {
      listeners.push(fn);
      if (snapshot) fn(snapshot);
    },
    enableBonusSounds: enableBonusSounds
  };

  poll();
  setInterval(function () {
    if (!socketUp) poll();
  }, 1000);
  setInterval(poll, 10000);

  var io = document.createElement('script');
  io.src = 'https://cdn.socket.io/4.8.3/socket.io.min.js';
  io.async = true;
  io.onload = connectSocket;
  (document.head || document.documentElement).appendChild(io);
})();
