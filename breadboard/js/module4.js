// 麵包板平台 模組 4：電路找錯與修正
const canvas = document.getElementById('bb-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// 麵包板定位
const BB = {
  x: 60, y: 100,
  w: 640, h: 280,
  // 橫列間距
  rowSpace: 18,
  // 直行間距
  colSpace: 32,
  cols: 18,
  // 分段式電源軌的斷點：第 8 與第 9 直行之間（正、負兩條軌都斷開）
  railBreakAfter: 8,
};

// === 麵包板連通規則 ===
// 孔位寫成 [橫列, 直行]，橫列用 'rail+'、'rail-'（上電源軌）、'a'–'e'（上半區）、'f'–'j'（下半區）
// ・中間區：同一直行的 a–e 五孔相連；f–j 五孔相連；中央溝槽兩側互不相連
// ・電源軌：整條橫向相連；分段式麵包板在斷點兩側不相連，要靠跨接跳線
// 電池 + 接上電源軌 + 的第 0 孔，電池 − 接上電源軌 − 的第 0 孔
const BAT_POS = ['rail+', 0];
const BAT_NEG = ['rail-', 0];

function stripOf(hole, railBroken) {
  const [row, col] = hole;
  if (row === 'rail+' || row === 'rail-') {
    const side = railBroken ? (col <= BB.railBreakAfter ? 'L' : 'R') : '';
    return row + side;
  }
  if ('abcde'.includes(row)) return 'T' + col;   // 上半區第 col 直行
  if ('fghij'.includes(row)) return 'B' + col;   // 下半區第 col 直行
  return row + col;
}

// 元件建構函式
const wire = (color, a, b, id) => ({ type: 'wire', color, a, b, id });
const resistor = (a, b, id) => ({ type: 'resistor', a, b, id });
// LED：a 為左腳、b 為右腳；flipped=false 時長腳（+）在 a
const led = (a, b, id, flipped = false) => ({ type: 'led', a, b, id, flipped });
const pushSwitch = (a, b, id) => ({ type: 'switch', a, b, id });

// 一組標準「電阻＋LED」支路：電源跳線插第 c 直行，電阻 b 列跨 c→c+3，LED 長腳插 c+3、短腳插 c+4，接地跳線插 c+4
function branch(c, suffix = '') {
  return [
    wire('red', ['rail+', c], ['a', c], 'vcc' + suffix),
    resistor(['b', c], ['b', c + 3], 'r' + suffix),
    led(['e', c + 3], ['e', c + 4], 'led' + suffix),
    wire('black', ['a', c + 4], ['rail-', c + 4], 'gnd' + suffix),
  ];
}

// 關卡定義 — 每關有「初始狀態」「需要的修正」「目標」
const LEVELS = {
  L1: {
    name: 'L1 加入電阻',
    goal: '電路缺少限流電阻：黃色跳線把電源直接接到 LED 長腳，LED 會燒掉。請點擊紅圈位置，把這條跳線換成 220Ω 電阻保護 LED。',
    initial: {
      parts: [
        wire('red', ['rail+', 4], ['a', 4], 'vcc'),
        wire('yellow', ['b', 4], ['b', 7], 'direct'),    // 應該是電阻的位置，卻直接用跳線
        led(['e', 7], ['e', 8], 'led'),
        wire('black', ['a', 8], ['rail-', 8], 'gnd'),
      ],
    },
    fix: 'resistor',
    hotspot: { col: 5.5, row: 'b' },
  },
  L2: {
    name: 'L2 修正 LED 方向',
    goal: 'LED 接反了不會亮。請點擊 LED 把它翻面。',
    initial: {
      parts: [
        wire('red', ['rail+', 4], ['a', 4], 'vcc'),
        resistor(['b', 4], ['b', 7], 'r'),
        led(['e', 7], ['e', 8], 'led', true),            // 短腳（−）插在電阻那一直行
        wire('black', ['a', 8], ['rail-', 8], 'gnd'),
      ],
    },
    fix: 'flip-led',
    hotspot: { col: 7.5, row: 'led' },
  },
  L3: {
    name: 'L3 跨接電源軌',
    goal: '這塊麵包板的電源軌在中間有斷點（紅 + 軌和黑 − 軌都斷開），電池接在左半段，右側電路拿不到電也回不了電池。請點擊紅圈處加入跨接跳線（紅線接 + 軌、黑線接 − 軌）。',
    initial: {
      railBroken: true,
      parts: branch(11),
    },
    fix: 'rail-bridge',
    hotspot: { col: 8.5, row: 'rails' },
  },
  L4: {
    name: 'L4 並聯兩顆 LED',
    goal: '加入第二顆 LED + 第二顆 220Ω 電阻（每顆 LED 各串一個電阻），兩顆都要亮。請點擊空槽完成。⚠ 兩顆 LED 共用一顆電阻是錯誤教法（current hogging：因順向電壓差異，電流不會均分，會造成一顆過亮另一顆暗或燒毀）。',
    initial: {
      parts: branch(2, '1'),
    },
    fix: 'led2',
    needLeds: 2,
    hotspot: { col: 12, row: 'c' },
  },
  L5: {
    name: 'L5 加入開關',
    goal: '電源到電阻之間缺了一段（b2 與 b4 之間），LED 不會亮。請點擊紅圈處放入按鈕開關，按下時 LED 才亮。',
    initial: {
      parts: [
        wire('red', ['rail+', 2], ['a', 2], 'vcc'),
        resistor(['c', 4], ['c', 7], 'r'),
        led(['e', 7], ['e', 8], 'led'),
        wire('black', ['a', 8], ['rail-', 8], 'gnd'),
      ],
    },
    fix: 'switch',
    hotspot: { col: 3, row: 'b' },
    needsButton: true,
  },
};

// === 電路判定（依接線資料推導，不寫死結果）===
// 回傳 { leds: {id: 'lit'|'burnt'|'off'}, paths: [[{part, from, to}]], short }
function simulate(config, switchPressed) {
  const rb = !!config.railBroken;
  const S = h => stripOf(h, rb);
  const start = S(BAT_POS), target = S(BAT_NEG);
  // 可通過的「邊」：跳線、電阻雙向；LED 只能由長腳（+）流向短腳（−）；開關按下才通
  const edges = [];
  config.parts.forEach(p => {
    if (p.type === 'switch' && !switchPressed) return;
    if (p.type === 'led') {
      const an = p.flipped ? p.b : p.a, ca = p.flipped ? p.a : p.b;
      edges.push({ part: p, from: an, to: ca });
    } else {
      edges.push({ part: p, from: p.a, to: p.b });
      edges.push({ part: p, from: p.b, to: p.a });
    }
  });
  // 零電阻導體（跳線、按下的開關）連起來的直行群組 → 判斷 LED 兩腳是否被短接
  const zeroParent = {};
  const find = x => (zeroParent[x] === undefined || zeroParent[x] === x) ? x : (zeroParent[x] = find(zeroParent[x]));
  config.parts.forEach(p => {
    if (p.type === 'wire' || (p.type === 'switch' && switchPressed)) {
      const ra = find(S(p.a)), rbb = find(S(p.b));
      if (ra !== rbb) zeroParent[ra] = rbb;
    }
  });

  const paths = [];
  const visited = new Set([start]);
  (function dfs(strip, trail) {
    if (strip === target) { paths.push(trail.slice()); return; }
    edges.forEach(e => {
      if (S(e.from) !== strip) return;
      const next = S(e.to);
      if (visited.has(next)) return;          // 同一直行兩腳（自我迴圈）或已走過
      visited.add(next); trail.push(e);
      dfs(next, trail);
      trail.pop(); visited.delete(next);
    });
  })(start, []);

  const leds = {};
  config.parts.filter(p => p.type === 'led').forEach(p => { leds[p.id] = 'off'; });
  let short = false;
  paths.forEach(path => {
    const hasR = path.some(e => e.part.type === 'resistor');
    const ledsOnPath = path.filter(e => e.part.type === 'led').map(e => e.part);
    if (!hasR && ledsOnPath.length === 0) short = true;   // 電池正負極直接接通
    ledsOnPath.forEach(p => {
      if (find(S(p.a)) === find(S(p.b))) return;           // 兩腳被導線短接 → 電流繞過 LED
      if (!hasR) leds[p.id] = 'burnt';
      else if (leds[p.id] !== 'burnt') leds[p.id] = 'lit';
    });
  });
  return { leds, paths, short };
}

// 關卡是否完成：至少 needLeds 顆 LED、全部正常點亮、沒有短路；有開關的關卡另需「放開時不亮」
function levelPassed(config, switchPressed, needLeds = 1) {
  const allLit = r => Object.keys(r.leds).length >= needLeds && Object.values(r.leds).every(s => s === 'lit') && !r.short;
  const on = simulate(config, switchPressed);
  if (!allLit(on)) return false;
  if (config.parts.some(p => p.type === 'switch')) {
    const off = simulate(config, false);
    return switchPressed && Object.values(off.leds).every(s => s === 'off');
  }
  return true;
}

let state = null;

const PROGRESS_KEY_BB = 'breadboard_progress_v1';
function loadBBProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || { module4_levels: {} }; } catch { return { module4_levels: {} }; }
}
function saveBBProgress(p) { localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p)); }

function initLevel(lvlId) {
  const lvl = LEVELS[lvlId];
  state = {
    levelId: lvlId,
    level: lvl,
    fixed: false,
    powered: false,
    smoking: false,
    switchPressed: false,
    config: JSON.parse(JSON.stringify(lvl.initial)),
  };
  document.getElementById('level-display').textContent = lvlId;
  document.getElementById('goal-text').textContent = lvl.goal;
  document.getElementById('sim-overlay').textContent = lvl.goal;
  draw();
}

// === 繪製 ===
function colX(col) { return BB.x + 30 + col * BB.colSpace; }
function rowY_top(letter) {
  const offsets = { rail_p: 0, rail_n: 18, a: 50, b: 68, c: 86, d: 104, e: 122 };
  return BB.y + offsets[letter];
}
function rowY_bot(letter) {
  const offsets = { f: 158, g: 176, h: 194, i: 212, j: 230, rail_p: 260, rail_n: 278 };
  return BB.y + offsets[letter];
}
function holeY(letter) {
  if (letter === 'rail+') return rowY_top('rail_p');
  if (letter === 'rail-') return rowY_top('rail_n');
  if (letter === 'rail+_b') return rowY_bot('rail_p');
  if (letter === 'rail-_b') return rowY_bot('rail_n');
  return 'abcde'.includes(letter) ? rowY_top(letter) : rowY_bot(letter);
}
function holeXY(hole) { return { x: colX(hole[1]), y: holeY(hole[0]) }; }
function ledBodyY(p) { return holeY(p.a[0]) - 20; }

function draw() {
  ctx.clearRect(0, 0, W, H);
  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fafafa');
  bg.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 麵包板
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(BB.x, BB.y, BB.w, BB.h);
  ctx.restore();
  ctx.strokeStyle = '#a89770';
  ctx.lineWidth = 2;
  ctx.strokeRect(BB.x, BB.y, BB.w, BB.h);

  // 上電源軌
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BB.x + 20, rowY_top('rail_p')); ctx.lineTo(BB.x + BB.w - 20, rowY_top('rail_p')); ctx.stroke();
  ctx.strokeStyle = '#1a1a1a';
  ctx.beginPath(); ctx.moveTo(BB.x + 20, rowY_top('rail_n')); ctx.lineTo(BB.x + BB.w - 20, rowY_top('rail_n')); ctx.stroke();
  // 下電源軌
  ctx.strokeStyle = '#dc2626';
  ctx.beginPath(); ctx.moveTo(BB.x + 20, rowY_bot('rail_p')); ctx.lineTo(BB.x + BB.w - 20, rowY_bot('rail_p')); ctx.stroke();
  ctx.strokeStyle = '#1a1a1a';
  ctx.beginPath(); ctx.moveTo(BB.x + 20, rowY_bot('rail_n')); ctx.lineTo(BB.x + BB.w - 20, rowY_bot('rail_n')); ctx.stroke();

  // 中央溝槽
  ctx.strokeStyle = '#a89770'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(BB.x, BB.y + 140); ctx.lineTo(BB.x + BB.w, BB.y + 140); ctx.stroke();

  // 電源軌斷點（分段式麵包板：正、負兩條軌都斷開；跨接跳線補上後斷點仍在，只是被跳線接通）
  if (state.config.railBroken) {
    const gx = (colX(BB.railBreakAfter) + colX(BB.railBreakAfter + 1)) / 2;
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(gx - 9, rowY_top('rail_p') - 6, 18, 30);
    ctx.fillStyle = '#a89770';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('斷點', gx, rowY_top('rail_n') + 18);
  }

  // 洞洞
  ctx.fillStyle = '#666';
  for (let col = 0; col < BB.cols; col++) {
    const x = colX(col);
    [rowY_top('rail_p'), rowY_top('rail_n')].forEach(y => { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); });
    ['a', 'b', 'c', 'd', 'e'].forEach(r => { ctx.beginPath(); ctx.arc(x, rowY_top(r), 1.8, 0, Math.PI * 2); ctx.fill(); });
    ['f', 'g', 'h', 'i', 'j'].forEach(r => { ctx.beginPath(); ctx.arc(x, rowY_bot(r), 1.8, 0, Math.PI * 2); ctx.fill(); });
    [rowY_bot('rail_p'), rowY_bot('rail_n')].forEach(y => { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); });
  }
  // 橫列字母與直行編號
  ctx.fillStyle = '#a89770';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'center';
  ['a', 'b', 'c', 'd', 'e'].forEach(r => ctx.fillText(r, BB.x + 12, rowY_top(r) + 3));
  ['f', 'g', 'h', 'i', 'j'].forEach(r => ctx.fillText(r, BB.x + 12, rowY_bot(r) + 3));
  for (let col = 0; col < BB.cols; col += 2) ctx.fillText(String(col), colX(col), BB.y + BB.h + 14);

  const sim = state.powered ? simulate(state.config, state.switchPressed) : null;

  // 繪製跳線
  state.config.parts.filter(p => p.type === 'wire').forEach(p => drawWire(p));

  // 繪製電池盒（左側）
  drawBattery(BB.x - 50, BB.y + 130);

  // 繪製元件
  state.config.parts.forEach(p => {
    if (p.type === 'resistor') drawResistor(p);
    else if (p.type === 'switch') drawSwitch(p, state.switchPressed);
    else if (p.type === 'led') drawLED(p, sim ? sim.leds[p.id] : 'off');
  });

  // 繪製紅圈提示（未修正時）
  if (!state.fixed) drawHotspot();

  // 通電動畫：沿實際導通的路徑
  if (sim) drawCurrentFlow(sim);

  // 冒煙特效（沒有限流電阻就通電）
  if (state.smoking) drawSmoke(sim);
}

const WIRE_COLORS = { red: '#dc2626', black: '#1a1a1a', yellow: '#eab308' };
function drawWire(p) {
  const { x: x1, y: y1 } = holeXY(p.a);
  const { x: x2, y: y2 } = holeXY(p.b);
  const color = WIRE_COLORS[p.color] || '#dc2626';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  // 略微弧度（直的跳線往右彎，橫的往上拱）
  const vertical = x1 === x2;
  const mx = (x1 + x2) / 2 + (vertical ? 10 : 0);
  const my = (y1 + y2) / 2 - (vertical ? 0 : 12);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
  // 端點
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x1, y1, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x2, y2, 3, 0, Math.PI * 2); ctx.fill();
}

function drawBattery(x, y) {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 24, y - 16, 48, 32);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - 22, y - 14, 18, 28);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 4, y - 14, 18, 28);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('+', x - 13, y + 4);
  ctx.fillText('−', x + 13, y + 4);
  // 連到電源軌（第 0 孔）
  const pos = holeXY(BAT_POS), neg = holeXY(BAT_NEG);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 22, y - 6); ctx.lineTo(pos.x, pos.y); ctx.stroke();
  ctx.strokeStyle = '#1a1a1a';
  ctx.beginPath(); ctx.moveTo(x + 22, y + 6); ctx.lineTo(neg.x, neg.y); ctx.stroke();
}
const BAT_TERM = { pos: { x: BB.x - 28, y: BB.y + 124 }, neg: { x: BB.x - 28, y: BB.y + 136 } };

function drawResistor(p) {
  // 橫躺在同一橫列，兩腳插在兩個不同直行的孔上
  const a = holeXY(p.a), b = holeXY(p.b);
  const x = (a.x + b.x) / 2, y = a.y;
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath(); ctx.arc(a.x, a.y, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2); ctx.fill();
  // 本體
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 22, y - 8, 44, 16);
  ctx.strokeRect(x - 22, y - 8, 44, 16);
  // 色環：紅紅棕 = 220Ω
  ctx.fillStyle = '#dc2626'; ctx.fillRect(x - 14, y - 8, 3, 16);
  ctx.fillStyle = '#dc2626'; ctx.fillRect(x - 9, y - 8, 3, 16);
  ctx.fillStyle = '#92400e'; ctx.fillRect(x - 2, y - 8, 3, 16);
}

function drawLED(p, status) {
  // 兩腳插在同一橫列、相鄰兩個直行；燈泡本體畫在兩腳上方
  const a = holeXY(p.a), b = holeXY(p.b);
  const x = (a.x + b.x) / 2;
  const yBody = ledBodyY(p);
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 5, yBody + 8); ctx.lineTo(a.x, a.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 5, yBody + 8); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath(); ctx.arc(a.x, a.y, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2); ctx.fill();
  // 燈泡
  const isLit = status === 'lit';
  const burnt = status === 'burnt';
  ctx.fillStyle = isLit ? '#22c55e' : burnt ? '#3f3f46' : (p.flipped ? '#7f1d1d' : '#ef4444');
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, yBody, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.beginPath();
  ctx.arc(x - 3, yBody - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  // 標示 + / −（標在孔位下方）
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(p.flipped ? '−' : '+', a.x, a.y + 13);
  ctx.fillText(p.flipped ? '+' : '−', b.x, b.y + 13);
  // 發光光暈
  if (isLit) {
    const glow = ctx.createRadialGradient(x, yBody, 0, x, yBody, 30);
    glow.addColorStop(0, 'rgba(34,197,94,.6)');
    glow.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, yBody, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSwitch(p, pressed) {
  const a = holeXY(p.a), b = holeXY(p.b);
  const x = (a.x + b.x) / 2, y = a.y;
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.fillStyle = pressed ? '#16a34a' : '#374151';
  ctx.fillRect(x - 16, y - 12, 32, 24);
  ctx.fillStyle = pressed ? '#15803d' : '#1f2937';
  ctx.fillRect(x - 14, y - 10, 28, 20);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(pressed ? 'ON' : 'OFF', x, y + 3);
}

function hotspotXY() {
  const h = state.level.hotspot;
  const x = colX(h.col);
  let y;
  if (h.row === 'rails') y = (rowY_top('rail_p') + rowY_top('rail_n')) / 2;
  else if (h.row === 'led') y = ledBodyY(state.config.parts.find(p => p.type === 'led'));
  else y = holeY(h.row);
  return { x, y };
}

function drawHotspot() {
  // 紅圈閃爍提示
  const t = performance.now() / 400;
  const pulse = 1 + Math.sin(t) * 0.2;
  const { x, y } = hotspotXY();
  ctx.strokeStyle = `rgba(220, 38, 38, ${0.7 + Math.sin(t) * 0.3})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 24 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  // 內小圓
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // 點擊提示
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('點我', x, y + 3);
}

// 把判定找到的導通路徑轉成畫面上的折線：
// 電池 + → 沿電源軌橫走 → 跳線 → 沿直行上下走（同一直行才相連）→ 元件 → … → 電源軌 − → 電池 −
function flowPolyline(path) {
  const pts = [BAT_TERM.pos, holeXY(BAT_POS)];
  path.forEach(e => {
    pts.push(holeXY(e.from));   // 在同一條金屬條內移動（直行為垂直、電源軌為水平）
    pts.push(holeXY(e.to));     // 穿過元件或跳線
  });
  pts.push(holeXY(BAT_NEG), BAT_TERM.neg);
  return pts;
}

function drawCurrentFlow(sim) {
  const t = performance.now() / 80;
  const flow = (t % 100) / 100;
  ctx.fillStyle = '#22c55e';
  // 只畫有正常點亮 LED 的路徑（燒毀、短路另以冒煙表示）
  sim.paths
    .filter(path => path.some(e => e.part.type === 'resistor') && path.some(e => e.part.type === 'led' && sim.leds[e.part.id] === 'lit'))
    .forEach(path => {
      const pts = flowPolyline(path);
      let totalLen = 0;
      const segs = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
        segs.push({ len, start: totalLen });
        totalLen += len;
      }
      // 畫 8 個流動點
      for (let i = 0; i < 8; i++) {
        const dist = ((flow + i / 8) % 1) * totalLen;
        for (let j = 0; j < segs.length; j++) {
          if (segs[j].len > 0 && dist >= segs[j].start && dist < segs[j].start + segs[j].len) {
            const localP = (dist - segs[j].start) / segs[j].len;
            ctx.beginPath();
            ctx.arc(pts[j].x + (pts[j + 1].x - pts[j].x) * localP, pts[j].y + (pts[j + 1].y - pts[j].y) * localP, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }
      }
    });
}

function drawSmoke(sim) {
  const t = performance.now() / 60;
  const burnt = state.config.parts.find(p => p.type === 'led' && sim && sim.leds[p.id] === 'burnt');
  const x = burnt ? (holeXY(burnt.a).x + holeXY(burnt.b).x) / 2 : 300;
  const y0 = burnt ? ledBodyY(burnt) : rowY_top('c');
  for (let i = 0; i < 5; i++) {
    const offset = (t + i * 30) % 100;
    ctx.fillStyle = `rgba(80,80,80,${0.7 - offset / 100})`;
    ctx.beginPath();
    ctx.arc(x + Math.sin(t / 10 + i) * 8, y0 - offset, 6 + offset / 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// === 點擊偵測 ===
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (W / rect.width);
  const y = (e.clientY - rect.top) * (H / rect.height);
  if (state.fixed) {
    // 已修正：測試開關
    const sw = state.config.parts.find(p => p.type === 'switch');
    if (sw) {
      const sx = (holeXY(sw.a).x + holeXY(sw.b).x) / 2;
      const sy = holeXY(sw.a).y;
      if (Math.hypot(x - sx, y - sy) < 22) {
        state.switchPressed = !state.switchPressed;
        if (typeof SoundFX !== 'undefined') SoundFX.click();
      }
    }
    return;
  }
  // 檢查點擊位置
  const hs = hotspotXY();
  if (Math.hypot(x - hs.x, y - hs.y) < 28) {
    applyFix();
  }
});

// 每一關的修正：直接改接線資料，判定與動畫都由修正後的接線重新推導
const FIXES = {
  // 把「直接接 LED 的跳線」換成 220Ω 電阻（同樣兩個孔位）
  resistor(config) {
    const i = config.parts.findIndex(p => p.id === 'direct');
    const w = config.parts[i];
    config.parts.splice(i, 1, resistor(w.a, w.b, 'r'));
  },
  'flip-led'(config) {
    config.parts.find(p => p.type === 'led').flipped = false;
  },
  // 斷點兩側各補一條跨接跳線：紅線接 + 軌、黑線接 − 軌
  'rail-bridge'(config) {
    const c = BB.railBreakAfter;
    config.parts.push(
      wire('red', ['rail+', c], ['rail+', c + 1], 'bridge+'),
      wire('black', ['rail-', c], ['rail-', c + 1], 'bridge-'),
    );
  },
  // ⚠ 兩 LED 並聯時必須各串一顆電阻（避免 current hogging）：第二條支路含自己的電源、接地跳線
  led2(config) {
    config.parts.push(...branch(10, '2'));
  },
  // 開關接在 b2（電源跳線那一直行）與 b4（電阻那一直行）之間
  switch(config) {
    config.parts.push(pushSwitch(['b', 2], ['b', 4], 'sw'));
  },
};

function applyFix() {
  FIXES[state.level.fix](state.config);
  state.fixed = true;
  state.smoking = false;
  state.powered = false;
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  showToast('✓ 修正完成！按「通電測試」看 LED 是否點亮', 'good');
  document.getElementById('sim-overlay').textContent = '按「通電測試」看 LED 是否點亮';
}

// === 控制按鈕 ===
document.getElementById('btn-power').onclick = () => {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  state.powered = true;
  const sim = simulate(state.config, state.switchPressed);
  const ledStates = Object.values(sim.leds);
  // 沒有限流電阻（或正負極直接接通）→ 冒煙
  if (sim.short || ledStates.includes('burnt')) {
    state.smoking = true;
    if (typeof SoundFX !== 'undefined') SoundFX.error();
    setTimeout(() => {
      showResult(0, { '結果': sim.short ? '電源短路！' : 'LED 燒掉了（電流沒有經過限流電阻）', '建議': '先修正紅圈處再通電' });
    }, 1500);
    return;
  }
  if (levelPassed(state.config, state.switchPressed, state.level.needLeds)) {
    // 成功
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    setTimeout(() => {
      const stars = 3;
      const prog = loadBBProgress();
      prog.module4_levels = prog.module4_levels || {};
      prog.module4_levels[state.levelId] = Math.max(prog.module4_levels[state.levelId] || 0, stars);
      saveBBProgress(prog);
      document.getElementById('star-' + state.levelId).textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      showResult(stars, { 'LED 狀態': '✓ 點亮成功', '電路': '正常運作' });
    }, 800);
    return;
  }
  // L5 需要按開關
  if (state.fixed && state.config.parts.some(p => p.type === 'switch') && !state.switchPressed) {
    showToast('別忘了按開關才會亮！', 'warn');
    return;
  }
  // 迴路不完整或 LED 反接 → 不亮
  if (typeof SoundFX !== 'undefined') SoundFX.error();
  const litCount = ledStates.filter(s => s === 'lit').length;
  setTimeout(() => {
    showResult(0, {
      '結果': litCount > 0 ? `只有 ${litCount} 顆 LED 亮，還沒完成`
        : state.config.parts.some(p => p.type === 'led' && p.flipped) ? 'LED 不亮：LED 接反，電流過不去'
        : 'LED 不亮：電流沒有完整的迴路',
      '建議': '先修正紅圈處再通電',
    });
  }, 1200);
};

document.getElementById('btn-reset').onclick = () => {
  initLevel(state.levelId);
};

document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    initLevel(btn.dataset.lvl);
  });
});

function showResult(stars, detail) {
  const modal = document.getElementById('result-modal');
  document.getElementById('r-title').textContent = stars > 0 ? '🎉 過關！' : '😵 電路失敗';
  document.getElementById('r-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  document.getElementById('r-stars').style.color = stars > 0 ? '#FFB400' : '#999';
  document.getElementById('r-detail').innerHTML = Object.entries(detail).map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  modal.classList.add('show');
}

document.getElementById('r-retry').onclick = () => {
  document.getElementById('result-modal').classList.remove('show');
  initLevel(state.levelId);
};
document.getElementById('r-next').onclick = () => {
  document.getElementById('result-modal').classList.remove('show');
  const order = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const i = order.indexOf(state.levelId);
  const next = order[Math.min(order.length - 1, i + 1)];
  document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b.dataset.lvl === next));
  initLevel(next);
};

// 載入星等
const _prog = loadBBProgress();
Object.entries(_prog.module4_levels || {}).forEach(([k, s]) => {
  const el = document.getElementById('star-' + k);
  if (el) el.textContent = '★'.repeat(s) + '☆'.repeat(3 - s);
});

initLevel('L1');
function loop() {
  if (document.hidden) { window.__rafPaused = true; return; } draw(); requestAnimationFrame(loop); }
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});