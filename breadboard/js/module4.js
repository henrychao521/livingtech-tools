// 麵包板平台 模組 4：電路找錯與修正
const canvas = document.getElementById('bb-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// 麵包板定位
const BB = {
  x: 60, y: 100,
  w: 640, h: 280,
  // 行間距
  rowSpace: 18,
  // 列間距
  colSpace: 32,
  cols: 18,
};

// 關卡定義 — 每關有「初始狀態」「需要的修正」「目標」
const LEVELS = {
  L1: {
    name: 'L1 加入電阻',
    goal: '電路缺少限流電阻，LED 會燒掉。請點擊紅圈位置，加入 220Ω 電阻保護 LED。',
    initial: {
      battery: { row: 0, col: 0 },           // 電池接電源軌左端
      led: { col: 12, flipped: false },      // LED 在 col 12
      wires: [
        { from: ['rail+', 8], to: ['mid', 8, 'b'] },     // 電源到中間區
        { from: ['mid', 12, 'b'], to: ['rail-', 12] },   // LED 短腳到地
      ],
      missing: ['resistor'],
    },
    fix: 'resistor',
  },
  L2: {
    name: 'L2 修正 LED 方向',
    goal: 'LED 接反了不會亮。請點擊 LED 把它翻面。',
    initial: {
      battery: { row: 0, col: 0 },
      resistor: { col: 8 },
      led: { col: 12, flipped: true },
      wires: [
        { from: ['rail+', 4], to: ['mid', 4, 'b'] },
        { from: ['mid', 12, 'b'], to: ['rail-', 12] },
      ],
    },
    fix: 'flip-led',
  },
  L3: {
    name: 'L3 跨接電源軌',
    goal: '麵包板電源軌中間有斷點，右側 LED 拿不到電。請點擊紅圈處加入跨接跳線。',
    initial: {
      battery: { row: 0, col: 0 },
      resistor: { col: 14 },                  // 電阻在右側
      led: { col: 17, flipped: false },
      wires: [
        { from: ['rail+', 11], to: ['mid', 14, 'b'] },
        { from: ['mid', 17, 'b'], to: ['rail-', 17] },
      ],
      // 電源軌中間斷點在 col 9-10
      railBroken: true,
      missing: ['rail-bridge'],
    },
    fix: 'rail-bridge',
  },
  L4: {
    name: 'L4 並聯兩顆 LED',
    goal: '加入第二顆 LED + 第二顆 220Ω 電阻（每顆 LED 各串一個電阻）。請點擊空槽完成。⚠ 兩顆 LED 共用一顆電阻是錯誤教法（current hogging：因正向電壓差異，電流不會均分，會造成一顆過亮另一顆暗或燒毀）。',
    initial: {
      battery: { row: 0, col: 0 },
      resistor: { col: 8 },
      led: { col: 12, flipped: false },
      wires: [
        { from: ['rail+', 4], to: ['mid', 4, 'b'] },
        { from: ['mid', 12, 'b'], to: ['rail-', 12] },
      ],
      missing: ['led2'],
    },
    fix: 'led2',
  },
  L5: {
    name: 'L5 加入開關',
    goal: '加入按鈕開關，按下時 LED 才亮。請點擊紅圈處放入開關。',
    initial: {
      battery: { row: 0, col: 0 },
      resistor: { col: 8 },
      led: { col: 14, flipped: false },
      wires: [
        { from: ['rail+', 4], to: ['mid', 4, 'b'] },
        { from: ['mid', 14, 'b'], to: ['rail-', 14] },
      ],
      missing: ['switch'],
    },
    fix: 'switch',
    needsButton: true,
  },
};

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
  if (['rail+'].includes(letter)) return rowY_top('rail_p');
  if (['rail-'].includes(letter)) return rowY_top('rail_n');
  if (['rail+_b'].includes(letter)) return rowY_bot('rail_p');
  if (['rail-_b'].includes(letter)) return rowY_bot('rail_n');
  return rowY_top(letter) || rowY_bot(letter);
}

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

  // 電源軌斷點（如果 L3 還沒修）
  if (state.level.initial.railBroken && !state.fixed) {
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(BB.x + 290, rowY_top('rail_p') - 8, 20, 30);
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

  // 繪製跳線
  state.config.wires.forEach(w => drawWire(w));

  // 繪製電池盒（左側）
  drawBattery(BB.x - 50, BB.y + 130);

  // 繪製電阻
  if (state.config.resistor) drawResistor(colX(state.config.resistor.col));
  if (state.config.resistor2) drawResistor(colX(state.config.resistor2.col));

  // 繪製 LED
  if (state.config.led) drawLED(colX(state.config.led.col), state.config.led.flipped);
  if (state.config.led2) drawLED(colX(state.config.led2.col), state.config.led2.flipped);

  // 繪製電源軌跨接
  if (state.config.railBridge) {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(BB.x + 300, rowY_top('rail_p') - 20, 18, 0.2 * Math.PI, 0.8 * Math.PI, true);
    ctx.stroke();
  }

  // 繪製開關
  if (state.config.switch) {
    drawSwitch(colX(state.config.switch.col), state.switchPressed);
  }

  // 繪製紅圈提示（未修正時）
  if (!state.fixed) drawHotspot();

  // 通電動畫
  if (state.powered && state.fixed) drawCurrentFlow();

  // 冒煙特效（未修正就通電）
  if (state.smoking) drawSmoke();
}

function drawWire(w) {
  const [fromType, fromCol] = w.from;
  const [toType, toCol] = w.to;
  let x1, y1, x2, y2;
  if (fromType === 'rail+') { x1 = colX(fromCol); y1 = rowY_top('rail_p'); }
  else if (fromType === 'rail-') { x1 = colX(fromCol); y1 = rowY_top('rail_n'); }
  else if (fromType === 'mid') { x1 = colX(fromCol); y1 = rowY_top(w.from[2]); }
  if (toType === 'rail+') { x2 = colX(toCol); y2 = rowY_top('rail_p'); }
  else if (toType === 'rail-') { x2 = colX(toCol); y2 = rowY_top('rail_n'); }
  else if (toType === 'mid') { x2 = colX(toCol); y2 = rowY_top(w.to[2]); }

  const isGround = w.to[0] === 'rail-' || w.from[0] === 'rail-';
  ctx.strokeStyle = isGround ? '#1a1a1a' : '#dc2626';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  // 略微弧度
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 12;
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
  // 端點
  ctx.fillStyle = isGround ? '#1a1a1a' : '#dc2626';
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
  // 連到電源軌
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 22, y - 6); ctx.lineTo(BB.x + 30, rowY_top('rail_p')); ctx.stroke();
  ctx.strokeStyle = '#1a1a1a';
  ctx.beginPath(); ctx.moveTo(x + 22, y + 6); ctx.lineTo(BB.x + 30, rowY_top('rail_n')); ctx.stroke();
}

function drawResistor(x) {
  const y = (rowY_top('e') + rowY_bot('f')) / 2;
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 22, y - 8, 44, 16);
  ctx.strokeRect(x - 22, y - 8, 44, 16);
  // 色環
  ctx.fillStyle = '#dc2626'; ctx.fillRect(x - 14, y - 8, 3, 16);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 9, y - 8, 3, 16);
  ctx.fillStyle = '#92400e'; ctx.fillRect(x - 2, y - 8, 3, 16);
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 22, rowY_top('e')); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 22, y); ctx.lineTo(x + 22, rowY_bot('f')); ctx.stroke();
}

function drawLED(x, flipped) {
  const yTop = rowY_bot('f') + 6;
  const yBody = yTop + 12;
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 5, yTop); ctx.lineTo(x - 5, rowY_bot('f')); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 5, yTop); ctx.lineTo(x + 5, rowY_bot('f')); ctx.stroke();
  // 燈泡
  const isLit = state.powered && state.fixed && !flipped && (!state.config.switch || state.switchPressed);
  ctx.fillStyle = isLit ? '#22c55e' : (flipped ? '#7f1d1d' : '#ef4444');
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
  // 標示 + / -
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(flipped ? '−' : '+', x - 5, yTop - 4);
  ctx.fillText(flipped ? '+' : '−', x + 5, yTop - 4);
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

function drawSwitch(x, pressed) {
  const y = (rowY_top('e') + rowY_bot('f')) / 2;
  ctx.fillStyle = pressed ? '#16a34a' : '#374151';
  ctx.fillRect(x - 16, y - 12, 32, 24);
  ctx.fillStyle = pressed ? '#15803d' : '#1f2937';
  ctx.fillRect(x - 14, y - 10, 28, 20);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(pressed ? 'ON' : 'OFF', x, y + 3);
  // 接腳
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 8, y + 12); ctx.lineTo(x - 8, rowY_bot('f')); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 8, y - 12); ctx.lineTo(x + 8, rowY_top('e')); ctx.stroke();
}

function drawHotspot() {
  // 紅圈閃爍提示
  const t = performance.now() / 400;
  const pulse = 1 + Math.sin(t) * 0.2;
  let x, y;
  switch (state.level.fix) {
    case 'resistor':
      x = colX(8); y = (rowY_top('e') + rowY_bot('f')) / 2; break;
    case 'flip-led':
      x = colX(state.config.led.col); y = rowY_bot('f') + 18; break;
    case 'rail-bridge':
      x = BB.x + 300; y = rowY_top('rail_p') - 14; break;
    case 'led2':
      x = colX(15); y = rowY_bot('f') + 18; break;
    case 'switch':
      x = colX(11); y = (rowY_top('e') + rowY_bot('f')) / 2; break;
  }
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

function drawCurrentFlow() {
  // 沿實際電路路徑畫電流（電池+ → +軌 → 電阻 → LED → −軌 → 電池−）
  const t = performance.now() / 80;
  const flow = (t % 100) / 100;
  ctx.fillStyle = '#22c55e';
  // 6 個關鍵節點，電流沿這條多段折線循環
  const ledCol = state.config.led ? state.config.led.col : 12;
  const resCol = state.config.resistor ? state.config.resistor.col : 8;
  const path = [
    { x: BB.x + 20, y: rowY_top('rail_p') },              // 電池 + 出
    { x: colX(resCol), y: rowY_top('rail_p') },           // 沿 +軌到電阻
    { x: colX(resCol), y: rowY_top('e') },                // 進電阻上端
    { x: colX(resCol), y: rowY_bot('f') },                // 穿電阻到下端
    { x: colX(ledCol), y: rowY_bot('f') },                // 到 LED（如同欄則為同點）
    { x: colX(ledCol), y: rowY_top('e') },                // 經 LED 到上半
    { x: colX(ledCol), y: rowY_top('rail_n') },           // 到 −軌
    { x: BB.x + 20, y: rowY_top('rail_n') },              // 回電池 −
  ];
  // 計算路徑總長
  let totalLen = 0;
  const segs = [];
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    const len = Math.hypot(dx, dy);
    segs.push({ len, start: totalLen });
    totalLen += len;
  }
  // 畫 4 個流動點
  for (let i = 0; i < 4; i++) {
    const p = (flow + i / 4) % 1;
    const dist = p * totalLen;
    for (let j = 0; j < segs.length; j++) {
      if (dist >= segs[j].start && dist < segs[j].start + segs[j].len) {
        const localP = (dist - segs[j].start) / segs[j].len;
        const x = path[j].x + (path[j + 1].x - path[j].x) * localP;
        const y = path[j].y + (path[j + 1].y - path[j].y) * localP;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }
}

function drawSmoke() {
  const t = performance.now() / 60;
  const x = state.config.led ? colX(state.config.led.col) : 300;
  for (let i = 0; i < 5; i++) {
    const offset = (t + i * 30) % 100;
    ctx.fillStyle = `rgba(80,80,80,${0.7 - offset / 100})`;
    ctx.beginPath();
    ctx.arc(x + Math.sin(t / 10 + i) * 8, rowY_bot('f') + 18 - offset, 6 + offset / 8, 0, Math.PI * 2);
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
    if (state.config.switch) {
      const sx = colX(state.config.switch.col);
      const sy = (rowY_top('e') + rowY_bot('f')) / 2;
      if (Math.hypot(x - sx, y - sy) < 22) {
        state.switchPressed = !state.switchPressed;
        if (typeof SoundFX !== 'undefined') SoundFX.click();
      }
    }
    return;
  }
  // 檢查點擊位置
  let hotspotX, hotspotY;
  switch (state.level.fix) {
    case 'resistor': hotspotX = colX(8); hotspotY = (rowY_top('e') + rowY_bot('f')) / 2; break;
    case 'flip-led': hotspotX = colX(state.config.led.col); hotspotY = rowY_bot('f') + 18; break;
    case 'rail-bridge': hotspotX = BB.x + 300; hotspotY = rowY_top('rail_p') - 14; break;
    case 'led2': hotspotX = colX(15); hotspotY = rowY_bot('f') + 18; break;
    case 'switch': hotspotX = colX(11); hotspotY = (rowY_top('e') + rowY_bot('f')) / 2; break;
  }
  if (Math.hypot(x - hotspotX, y - hotspotY) < 28) {
    applyFix();
  }
});

function applyFix() {
  switch (state.level.fix) {
    case 'resistor':
      state.config.resistor = { col: 8 };
      break;
    case 'flip-led':
      state.config.led.flipped = false;
      break;
    case 'rail-bridge':
      state.config.railBridge = true;
      break;
    case 'led2':
      // ⚠ 修正：兩 LED 並聯時必須各串一顆電阻（避免 current hogging）
      state.config.led2 = { col: 15, flipped: false };
      state.config.resistor2 = { col: 13 };
      break;
    case 'switch':
      state.config.switch = { col: 11 };
      break;
  }
  state.fixed = true;
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  showToast('✓ 修正完成！按「通電測試」看 LED 是否點亮', 'good');
  document.getElementById('sim-overlay').textContent = '按「通電測試」看 LED 是否點亮';
}

// === 控制按鈕 ===
document.getElementById('btn-power').onclick = () => {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  if (!state.fixed) {
    // 未修正就通電 → 冒煙
    state.smoking = true;
    state.powered = true;
    if (typeof SoundFX !== 'undefined') SoundFX.error();
    setTimeout(() => {
      showResult(0, { '結果': '電路有錯！LED 燒掉或不亮', '建議': '先修正紅圈處再通電' });
    }, 1500);
    return;
  }
  state.powered = true;
  // L5 需要按開關
  if (state.config.switch && !state.switchPressed) {
    showToast('別忘了按開關才會亮！', 'warn');
    return;
  }
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
function loop() { draw(); requestAnimationFrame(loop); }
loop();
