// 作答紀錄（送到老師的 Google 試算表）— 四個教學平台共用同一份 sheet-log.js
// 規格：classroom-sheets/SPEC.md 第 1–3 節
//
// 用法（各測驗在自己的 JS 裡）：
//   const SLQ = window.SheetLog && SheetLog.quiz({
//     kind: 'quiz',                         // quiz | game | exercise | worksheet
//     questions: [{ key: 's0', t: 'scenario', stem: '題幹', options: ['A 文字', 'B 文字'], answer: 1 }, ...]
//   });
//   SLQ && SLQ.answer('s0', 原始選項序號);   // 畫面有洗牌也要換回原始資料順序
//   SLQ && SLQ.finish({ score: 80, max: 100 });   // 一份作答完成時送出一筆（同一份只送一次）
//   SLQ && SLQ.reset();                     // 重新挑戰＝新的一份作答（新的 sid）
//
// endpoint 空字串＝完全不送、不顯示班級座號小元件與告知文字；題目登記（給 build_items.py 抽題庫）照常。
(function () {
  'use strict';
  if (window.SheetLog) return;

  var CFG = { platform: '', endpoint: '', token: '' };
  var QKEY = 'sheet-log-queue', QMAX = 50, SKEY = 'sheet-log-who';
  var NOTICE = '完成測驗後，各題對錯與所選答案會送給老師，用來分析題目品質；若你填了班級座號，也會一起送出。';
  var bank = [], bankIds = {}, sessions = [], flushing = false, direct = Promise.resolve();
  var widgetWanted = false, widgetBuilt = false;

  // ---------- 小工具 ----------
  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim();
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function clip(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }

  // 與 Python json.dumps(obj, ensure_ascii=False, sort_keys=True) 相同的字串（指紋要和 build_items.py 一致）
  function canon(v) {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) return '[' + v.map(canon).join(', ') + ']';
    if (typeof v === 'object') {
      return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ': ' + canon(v[k]); }).join(', ') + '}';
    }
    if (typeof v === 'number') return String(v);
    return JSON.stringify(v);
  }

  // SHA-1（同步版；crypto.subtle 在 http 非 localhost 不能用，自己算）
  function sha1(str) {
    var bytes = unescape(encodeURIComponent(str)), n = bytes.length, i, j;
    var words = [];
    for (i = 0; i < n; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    words[n >> 2] |= 0x80 << (24 - (n % 4) * 8);
    words[(((n + 8) >> 6) + 1) * 16 - 1] = n * 8;
    var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0, w = new Array(80);
    for (i = 0; i < words.length; i += 16) {
      var a = h0, b = h1, c = h2, d = h3, e = h4;
      for (j = 0; j < 80; j++) {
        if (j < 16) w[j] = words[i + j] | 0;
        else { var x = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16]; w[j] = (x << 1) | (x >>> 31); }
        var f, k;
        if (j < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
        else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
        else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
        else { f = b ^ c ^ d; k = 0xCA62C1D6; }
        var t = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
        e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    return [h0, h1, h2, h3, h4].map(function (v) { return ('0000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }

  function newSid() {
    try {
      var c = window.crypto || window.msCrypto, b = new Uint8Array(16), h = '';
      c.getRandomValues(b);
      for (var i = 0; i < b.length; i++) h += ('0' + b[i].toString(16)).slice(-2);
      return h;
    } catch (e) { return ''; }
  }

  // 頁面代號：/drill/pages/module3.html → drill/module3；/drill/index.html → drill/index
  function pageId() {
    var segs = location.pathname.split('/').filter(Boolean);
    var file = (segs.length && /\.html?$/i.test(segs[segs.length - 1])) ? segs.pop().replace(/\.html?$/i, '') : 'index';
    var tool;
    if (segs.length && segs[segs.length - 1] === 'pages') { segs.pop(); tool = segs.pop() || 'root'; }
    else tool = segs.length ? segs[segs.length - 1] : 'root';
    if (document.body && document.body.dataset && document.body.dataset.sheetRoot === '1') tool = 'root';
    return clip((tool + '/' + file).replace(/[^A-Za-z0-9_./-]/g, '-'), 80);
  }
  // 題號前綴：drill/module3 → drill.m3
  function qPrefix(page) {
    var p = page.split('/');
    return p[0] + '.' + (p[1] || '').replace(/^module(\d+)$/, 'm$1');
  }

  // ---------- 題目登記 ----------
  var T_OK = { single: 1, tf: 1, order: 1, scenario: 1, match: 1, code: 1, game: 1, other: 1 };
  function makeDef(page, prefix, d) {
    var t = T_OK[d.t] ? d.t : 'single';
    var q = clip(prefix + '.' + d.key, 40).replace(/[^A-Za-z0-9_.:-]/g, '-');
    var stem = norm(d.stem), options = null, items = null, k = '';
    if (t === 'order') {
      items = (d.items || []).map(norm);
      k = items.map(function (_, i) { return i + 1; }).join('>');
    } else if (t === 'tf') {
      k = d.answer ? '正確' : '錯誤';
    } else if (t === 'game') {
      k = 'pass';
    } else if (d.options) {
      options = d.options.map(norm);
      k = typeof d.answer === 'number' && d.answer >= 0 ? letter(d.answer) : '';
    } else {
      k = d.answer == null ? '' : clip(norm(d.answer), 40);
    }
    var h = sha1(canon({ type: t, stem: stem, options: options, answer: k, items: items })).slice(0, 8);
    var def = { q: q, h: h, t: t, page: page, stem: stem, options: {}, answer: k, items: items || [] };
    if (options) options.forEach(function (o, i) { def.options[letter(i)] = o; });
    if (!bankIds[q]) { bankIds[q] = 1; bank.push(def); }
    return { def: def, src: d };
  }

  function Session(opts) {
    this.page = opts.page || pageId();
    this.kind = /^(quiz|game|exercise|worksheet)$/.test(opts.kind) ? opts.kind : 'quiz';
    this.prefix = opts.prefix || qPrefix(this.page);
    this.sendOnLeave = !!opts.sendOnLeave;
    this.defs = {}; this.order = [];
    var self = this;
    (opts.questions || []).forEach(function (d) { self.add(d); });
    this.reset();
    sessions.push(this);
    wantWidget();
  }
  Session.prototype.add = function (d) {
    if (this.defs[d.key]) return this.defs[d.key].def;
    var x = makeDef(this.page, this.prefix, d);
    this.defs[d.key] = x; this.order.push(d.key);
    return x.def;
  };
  Session.prototype.reset = function () {
    this.sid = newSid(); this.ans = {}; this.sent = false; this.t0 = Date.now();
  };
  Session.prototype.has = function (key) { return !!this.ans[key]; };
  // value：選擇題＝原始選項序號、是非＝true/false、排序＝使用者排出的原始序號陣列（0 起算）、遊戲＝是否過關
  // extra.ok 可覆寫對錯（例如多個可接受答案、數值題）
  Session.prototype.answer = function (key, value, extra) {
    var x = this.defs[key];
    if (!x) return;
    var d = x.def, s = x.src, a, ok;
    if (d.t === 'order') {
      a = (value || []).map(function (i) { return i + 1; }).join('>');
      ok = a === d.answer;
    } else if (d.t === 'tf') {
      a = value ? '正確' : '錯誤'; ok = a === d.answer;
    } else if (d.t === 'game') {
      a = value ? 'pass' : 'fail'; ok = !!value;
    } else if (s.options) {
      a = typeof value === 'number' && value >= 0 ? letter(value) : clip(norm(value), 40);
      ok = a === d.answer || (s.alt || []).some(function (i) { return letter(i) === a; });
    } else {
      a = clip(norm(value), 40); ok = a === d.answer;
    }
    if (extra && typeof extra.ok === 'boolean') ok = extra.ok;
    var r = this.ans[key];
    if (r) { if (!r.solved) { r.tries = Math.min(99, r.tries + 1); if (ok) r.solved = true; } return ok; }
    this.ans[key] = { a: clip(a, 40), ok: ok ? 1 : 0, tries: 1, solved: ok };
    if (extra && extra.tries > 1) this.ans[key].tries = Math.min(99, Math.floor(extra.tries));
    return ok;
  };
  Session.prototype.count = function () { return Object.keys(this.ans).length; };
  Session.prototype.finish = function (meta) {
    if (this.sent) return false;
    var self = this, items = [];
    this.order.forEach(function (key) {
      var r = self.ans[key]; if (!r) return;
      var d = self.defs[key].def;
      var it = { q: d.q, h: d.h, t: d.t, ok: r.ok, a: r.a, k: clip(d.answer, 40) };
      if (r.tries > 1) it.tries = r.tries;
      items.push(it);
    });
    if (!items.length) return false;
    this.sent = true;
    var m = {}, sec = Math.round((Date.now() - this.t0) / 1000);
    if (meta && typeof meta.score === 'number' && isFinite(meta.score)) m.score = meta.score;
    if (meta && typeof meta.max === 'number' && isFinite(meta.max)) m.max = meta.max;
    if (sec > 0 && sec < 86400) m.sec = sec;
    for (var i = 0; i < items.length; i += 40) {   // 超過 40 題分批（實際上目前沒有這麼長的測驗）
      send({ sid: i === 0 ? this.sid : newSid(), page: this.page, kind: this.kind, items: items.slice(i, i + 40), meta: m });
    }
    return true;
  };

  // ---------- 送出與佇列 ----------
  function who() {
    try {
      var o = JSON.parse(sessionStorage.getItem(SKEY) || 'null');
      if (o && typeof o.c === 'string' && typeof o.s === 'string' && o.c && o.s) return o;
    } catch (e) { /* 無痕等情況 */ }
    return null;
  }
  function qRead() {
    try {
      var a = JSON.parse(localStorage.getItem(QKEY) || '[]');
      return Array.isArray(a) ? a.filter(function (x) { return typeof x === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function qWrite(a) {
    try {
      if (a.length) localStorage.setItem(QKEY, JSON.stringify(a.slice(-QMAX)));
      else localStorage.removeItem(QKEY);
    } catch (e) { /* 存不了就算了 */ }
  }
  function post(body) {
    // no-cors＋text/plain：不觸發 CORS 預檢；讀不到回應，沒有網路錯誤就當作送達（伺服器端同一 sid 只收一次）
    try {
      return fetch(CFG.endpoint, { method: 'POST', mode: 'no-cors', keepalive: body.length < 60000,
        headers: { 'Content-Type': 'text/plain' }, body: body });
    } catch (e) { return Promise.reject(e); }
  }
  function flush() {
    if (!CFG.endpoint || flushing || !window.fetch) return;
    var q = qRead();
    if (!q.length) return;
    flushing = true;
    var body = q[0];
    post(body).then(function () {
      qWrite(qRead().filter(function (x) { return x !== body; }));
      flushing = false; flush();
    }, function () { flushing = false; });
  }
  function enqueue(body) {
    var q = qRead();
    q.push(body); qWrite(q);
    if (qRead().indexOf(body) < 0) {   // 無法寫入佇列：直接送一次
      direct = direct.then(function () { return post(body); }).then(null, function () {});
      return;
    }
    flush();
  }
  function send(rec) {
    if (!CFG.endpoint || !rec || !rec.items || !rec.items.length) return false;
    var body = {
      v: 1, platform: CFG.platform, token: CFG.token || '',
      sid: rec.sid || newSid(), page: clip(rec.page || pageId(), 80),
      kind: rec.kind || 'quiz', 'class': '', seat: '',
      items: rec.items.slice(0, 40)
    };
    var w = who();
    if (w) { body['class'] = w.c; body.seat = w.s; }
    if (rec.meta && Object.keys(rec.meta).length) body.meta = rec.meta;
    if (!body.sid) return false;
    enqueue(JSON.stringify(body));
    return true;
  }

  // ---------- 班級座號小元件 ----------
  function toHalf(s) {
    return String(s || '').replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/　/g, ' ').trim();
  }
  function wantWidget() {
    widgetWanted = true;
    if (document.readyState === 'loading') return;   // DOMContentLoaded 時再建
    buildWidget();
  }
  function buildWidget() {
    if (widgetBuilt || !widgetWanted || !CFG.endpoint || !document.body) return;
    widgetBuilt = true;
    var st = document.createElement('style');
    st.textContent =
      '.slw{position:fixed;right:84px;bottom:28px;z-index:90;font-family:var(--font-sans,system-ui,sans-serif)}' +
      '.slw-btn{background:#fff;border:1px solid var(--border,#e5e7eb);box-shadow:0 4px 14px rgba(0,0,0,.12);border-radius:999px;padding:9px 14px;font-size:13.5px;cursor:pointer;color:#1f2937;min-height:40px}' +
      '.slw-btn:focus-visible,.slw-panel button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}' +
      '.slw-panel{position:absolute;right:0;bottom:50px;width:280px;max-width:calc(100vw - 32px);background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.18);padding:14px;font-size:13.5px;color:#1f2937;line-height:1.6}' +
      '.slw-panel h4{margin:0 0 6px;font-size:15px}' +
      '.slw-row{display:flex;gap:8px;margin:8px 0}' +
      '.slw-row label{flex:1;display:flex;flex-direction:column;font-size:12.5px;color:#475569;gap:3px}' +
      '.slw-row input{font-size:16px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px;width:100%;box-sizing:border-box}' +
      '.slw-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}' +
      '.slw-act button{border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;padding:6px 12px;font-size:13.5px;cursor:pointer;min-height:36px}' +
      '.slw-act .slw-save{background:#2563eb;border-color:#2563eb;color:#fff}' +
      '.slw-err{color:#b91c1c;font-size:12.5px;min-height:18px}' +
      '.slw-note{font-size:12px;color:#64748b;margin-top:8px}' +
      '.sl-notice{font-size:12px;color:#64748b;margin:10px auto 0;max-width:820px;padding:0 16px;line-height:1.7}' +
      '@media (max-width:600px){.slw{right:80px;bottom:30px}.slw-btn{padding:8px 11px;font-size:12.5px}}' +
      '@media print{.slw{display:none}}';
    document.head.appendChild(st);

    var box = document.createElement('div');
    box.className = 'slw';
    box.innerHTML =
      '<button type="button" class="slw-btn" aria-expanded="false" aria-controls="slw-panel"></button>' +
      '<div class="slw-panel" id="slw-panel" role="dialog" aria-label="填班級座號" hidden>' +
      '<h4>📝 班級座號（可以不填）</h4>' +
      '<div class="slw-row"><label>班級<input class="slw-c" inputmode="text" maxlength="10" placeholder="例如 801" autocomplete="off"></label>' +
      '<label>座號<input class="slw-s" inputmode="numeric" maxlength="4" placeholder="例如 12" autocomplete="off"></label></div>' +
      '<div class="slw-err" aria-live="polite"></div>' +
      '<div class="slw-act"><button type="button" class="slw-save">儲存</button><button type="button" class="slw-clear">清除</button><button type="button" class="slw-close">關閉</button></div>' +
      '<p class="slw-note">' + NOTICE + '<br>不填也可以，作答一樣會送出，只是老師不知道是誰。關掉這個分頁就會自動清掉。</p>' +
      '</div>';
    document.body.appendChild(box);
    var btn = box.querySelector('.slw-btn'), panel = box.querySelector('.slw-panel');
    var ci = box.querySelector('.slw-c'), si = box.querySelector('.slw-s'), err = box.querySelector('.slw-err');
    function label() {
      var w = who();
      btn.textContent = w ? '📝 ' + w.c + ' 班 ' + w.s + ' 號（修改）' : '📝 填班級座號（選填）';
    }
    function open(v) {
      panel.hidden = !v; btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      if (v) { var w = who(); ci.value = w ? w.c : ''; si.value = w ? w.s : ''; err.textContent = ''; ci.focus(); }
    }
    btn.addEventListener('click', function () { open(panel.hidden); });
    box.querySelector('.slw-close').addEventListener('click', function () { open(false); btn.focus(); });
    box.querySelector('.slw-clear').addEventListener('click', function () {
      try { sessionStorage.removeItem(SKEY); } catch (e) { /* */ }
      ci.value = ''; si.value = ''; err.textContent = '已清除，之後的作答不會帶班級座號。'; label();
    });
    box.querySelector('.slw-save').addEventListener('click', function () {
      var c = toHalf(ci.value).replace(/\s+/g, ''), s = toHalf(si.value).replace(/\s+/g, '');
      if (!c && !s) { box.querySelector('.slw-clear').click(); return; }
      if (!c || !s) { err.textContent = '班級和座號要一起填，或是兩個都不填。'; return; }
      if (!/^[0-9A-Za-z一-鿿][0-9A-Za-z一-鿿-]{0,9}$/.test(c)) { err.textContent = '班級請填 1 到 10 個中文、英文或數字，例如 801。'; return; }
      if (!/^\d{1,4}$/.test(s)) { err.textContent = '座號請只填數字，例如 12。'; return; }
      try { sessionStorage.setItem(SKEY, JSON.stringify({ c: c, s: String(parseInt(s, 10)) })); }
      catch (e) { err.textContent = '這個瀏覽器不能暫存（可能是無痕模式），這次就不帶班級座號。'; return; }
      label(); open(false); btn.focus();
    });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); btn.focus(); } });
    label();

    // 告知文字：頁尾（main.js 會自動補 footer）；沒有 footer 就放在頁面最下方
    var note = document.createElement('p');
    note.className = 'sl-notice';
    note.textContent = '📝 作答紀錄：' + NOTICE;
    var ft = document.querySelector('footer');
    if (ft) ft.insertBefore(note, ft.firstChild); else document.body.appendChild(note);
  }

  // ---------- 對外 ----------
  function init(o) {
    o = o || {};
    if (typeof o.platform === 'string') CFG.platform = o.platform;
    if (typeof o.endpoint === 'string') CFG.endpoint = o.endpoint.trim();
    if (typeof o.token === 'string') CFG.token = o.token;
    flush();
    buildWidget();
  }

  window.SheetLog = {
    init: init,
    send: send,
    quiz: function (opts) { return new Session(opts || {}); },
    bank: function () { return JSON.parse(JSON.stringify(bank)); },
    pageId: pageId,
    letter: letter,
    // 共用轉換：SCENARIOS 陣列（{q, a, b, c…, correct:'a'}）→ 題目定義
    fromScenarios: function (list, prefix, t) {
      return list.map(function (s, i) {
        var keys = ['a', 'b', 'c', 'd', 'e', 'f'].filter(function (k) { return s[k] != null; });
        return { key: (prefix || 's') + (s.id != null ? s.id : i), t: t || 'scenario', stem: s.q,
          options: keys.map(function (k) { return s[k]; }), answer: keys.indexOf(s.correct) };
      });
    },
    _debug: { sha1: sha1, canon: canon, norm: norm, queue: qRead, sessions: sessions, config: function () { return CFG; } }
  };

  window.addEventListener('online', flush);
  window.addEventListener('pagehide', function () {
    sessions.forEach(function (s) { if (s.sendOnLeave && !s.sent && s.count()) s.finish(); });
  });
  document.addEventListener('DOMContentLoaded', buildWidget);
  if (window.SHEET_CONFIG) init(window.SHEET_CONFIG);
})();
