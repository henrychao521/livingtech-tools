// 模組 4：Canvas 切割模擬器（升級版：粒子、聲音、燃燒、振動）
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// 鋸條（固定位置，畫面中央）
const BLADE_X = 380;
const BLADE_Y = 250;

const LEVELS = {
  L1: {
    name: 'L1 直線切割',
    desc: '沿水平直線切 240px（約 12cm）',
    path: [[0, 0], [240, 0]],
    tolerance: 14,
  },
  L2: {
    name: 'L2 轉角切割',
    desc: '直線 + 90°轉角',
    path: [[0, 0], [120, 0], [120, 120]],
    tolerance: 16,
  },
  L3: {
    name: 'L3 曲線切割',
    desc: 'S 形曲線',
    path: (() => {
      const pts = [];
      for (let t = 0; t <= 100; t++) {
        const x = t * 2.4;
        const y = 60 * Math.sin(t * Math.PI / 25);
        pts.push([x, y]);
      }
      return pts;
    })(),
    tolerance: 18,
  },
  L4: {
    name: 'L4 內挖切割',
    desc: '從中間點切出方形（先鑽孔再穿鋸條的手順見模組 3）',
    path: [[0, 0], [120, 0], [120, 120], [0, 120], [0, 0]],
    tolerance: 16,
  },
  L5: {
    name: 'L5 綜合圖形',
    desc: '愛心輪廓',
    path: (() => {
      const pts = [];
      for (let t = 0; t <= 100; t++) {
        const a = t * Math.PI * 2 / 100;
        const x = 80 * Math.sin(a);
        const y = -(13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a)) * 4;
        pts.push([x + 80, y + 60]);
      }
      return pts;
    })(),
    tolerance: 20,
  },
};

let state = null;
let rafId = null;

// 粒子系統（木屑）
const particles = [];

function spawnSawdust(intensity = 1) {
  for (let i = 0; i < intensity * 2; i++) {
    particles.push({
      x: BLADE_X + (Math.random() - 0.5) * 8,
      y: BLADE_Y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      life: 1,
      size: 1 + Math.random() * 2,
      color: ['#FFB066', '#D85F00', '#E89958', '#FFD9B3'][Math.floor(Math.random() * 4)],
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // 重力
    p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function initState(levelId) {
  if (typeof SoundFX !== 'undefined') SoundFX.stopSaw();
  const lvl = LEVELS[levelId];
  state = {
    levelId,
    level: lvl,
    boardX: BLADE_X - lvl.path[0][0] - 40,
    boardY: BLADE_Y - lvl.path[0][1] - 40,
    boardW: 320,
    boardH: 220,
    pathBBox: getBBox(lvl.path),
    cutPoints: [],
    targetIdx: 0,
    started: false,
    paused: false,
    done: false,
    failed: false,
    lastMoveTime: null,
    speedSamples: [],
    errors: 0,
    overspeedCount: 0,
    pathProgress: 0,
    maxOffset: 0,
    burning: 0, // 燒焦程度 0~1
    pathOffset: [40, 40],
  };
  const bb = state.pathBBox;
  state.boardW = Math.max(280, bb.w + 80);
  state.boardH = Math.max(160, bb.h + 80);
  state.boardX = BLADE_X - lvl.path[0][0] - 40;
  state.boardY = BLADE_Y - lvl.path[0][1] - 40;

  particles.length = 0;
  draw();
  updateUI();
  document.getElementById('sim-overlay').textContent = `${lvl.name}：${lvl.desc} ｜ 按「開始切割」`;
}

function getBBox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pts.forEach(([x, y]) => {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  });
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTable();
  if (!state) return;
  drawBoard();
  updateParticles();
  drawParticles();
  drawBlade();
  drawHUD();
}

function drawTable() {
  // 工作台底色（漸層）
  const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 500);
  grad.addColorStop(0, '#f0eee0');
  grad.addColorStop(1, '#d8d4c0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 細格紋
  ctx.strokeStyle = 'rgba(0,0,0,.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // 鋸縫（中央兩條金屬線）
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(BLADE_X - 20, BLADE_Y);
  ctx.lineTo(BLADE_X + 20, BLADE_Y);
  ctx.stroke();
}

function drawBoard() {
  const { boardX, boardY, boardW, boardH, pathOffset, level, cutPoints, burning } = state;

  ctx.save();
  ctx.translate(boardX, boardY);

  // 木板陰影
  ctx.shadowColor = 'rgba(0,0,0,.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // 木板底色（精緻木紋）
  const grad = ctx.createLinearGradient(0, 0, boardW, boardH);
  grad.addColorStop(0, '#e8c896');
  grad.addColorStop(.3, '#d8b378');
  grad.addColorStop(.7, '#c89a5e');
  grad.addColorStop(1, '#b8895a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, boardW, boardH);

  ctx.shadowColor = 'transparent';

  // 木紋（更多更細緻）
  ctx.strokeStyle = 'rgba(80,40,10,.18)';
  ctx.lineWidth = .8;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    const yBase = (boardH / 12) * i + 8;
    ctx.moveTo(0, yBase);
    ctx.bezierCurveTo(
      boardW * .25, yBase + Math.sin(i * 1.7) * 4,
      boardW * .65, yBase + Math.cos(i * 2.3) * 5,
      boardW, yBase + Math.sin(i * 1.1) * 3
    );
    ctx.stroke();
  }
  // 結紋（少量小圓圈）
  ctx.fillStyle = 'rgba(80,40,10,.1)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(
      30 + i * (boardW / 5),
      40 + (i % 2) * 80,
      6 + i * 1.5, 3, 0.3 * i, 0, Math.PI * 2
    );
    ctx.fill();
  }

  // 切割線（虛線目標）
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  level.path.forEach(([x, y], i) => {
    const px = x + pathOffset[0];
    const py = y + pathOffset[1];
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // 起點記號（綠色脈衝）
  const start = level.path[0];
  const sx = start[0] + pathOffset[0], sy = start[1] + pathOffset[1];
  if (cutPoints.length === 0) {
    ctx.strokeStyle = '#2EBD66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pulseR = 8 + Math.sin(performance.now() / 200) * 4;
    ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#2EBD66';
  ctx.beginPath();
  ctx.arc(sx, sy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '600 10px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('起', sx, sy + 3);

  // 終點記號
  const end = level.path[level.path.length - 1];
  ctx.fillStyle = '#E14A4A';
  ctx.beginPath();
  ctx.arc(end[0] + pathOffset[0], end[1] + pathOffset[1], 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('終', end[0] + pathOffset[0], end[1] + pathOffset[1] + 3);

  // 切割軌跡（外光暈 + 切口黑線 + 燒焦）
  if (cutPoints.length > 1) {
    // 外光暈（橘黃，模擬熱）
    ctx.strokeStyle = `rgba(255, ${180 - burning * 100}, 100, ${0.4 + burning * 0.3})`;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    cutPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 切口黑線
    ctx.strokeStyle = burning > 0.5 ? '#1a1a1a' : `rgba(40,20,5,${0.85 + burning * 0.15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    cutPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 燒焦痕跡（深褐）
    if (burning > 0.3) {
      ctx.strokeStyle = `rgba(50,25,10,${burning * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      cutPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }

  ctx.restore();

  // 木板邊框
  ctx.strokeStyle = 'rgba(0,0,0,.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(boardX, boardY, boardW, boardH);
}

function drawBlade() {
  const t = performance.now();
  const isRunning = state && state.started && !state.paused && !state.done && !state.failed;

  // 上夾頭
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(BLADE_X - 18, BLADE_Y - 130, 36, 18);
  ctx.fillStyle = '#666';
  ctx.fillRect(BLADE_X - 16, BLADE_Y - 128, 32, 3);

  // 鋸條（細節：齒、震動）
  const vibrate = isRunning ? Math.sin(t / 25) * 2 : 0;
  ctx.save();
  ctx.translate(0, vibrate);
  // 鋸條本體
  const bladeGrad = ctx.createLinearGradient(BLADE_X - 3, 0, BLADE_X + 3, 0);
  bladeGrad.addColorStop(0, '#888');
  bladeGrad.addColorStop(.5, '#fff');
  bladeGrad.addColorStop(1, '#333');
  ctx.fillStyle = bladeGrad;
  ctx.fillRect(BLADE_X - 3, BLADE_Y - 110, 6, 220);
  // 鋸齒
  ctx.fillStyle = '#222';
  for (let y = BLADE_Y - 100; y < BLADE_Y + 100; y += 8) {
    ctx.beginPath();
    ctx.moveTo(BLADE_X - 3, y);
    ctx.lineTo(BLADE_X - 5, y + 3);
    ctx.lineTo(BLADE_X - 3, y + 6);
    ctx.fill();
  }
  // 運轉熱光（正在切時）
  if (isRunning && state.cutPoints && state.cutPoints.length > 1) {
    const heat = Math.min(1, state.burning + 0.3);
    ctx.shadowColor = `rgba(255, ${150 - heat * 80}, 0, ${heat})`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255, 200, 100, ${heat * 0.5})`;
    ctx.beginPath();
    ctx.arc(BLADE_X, BLADE_Y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  ctx.restore();

  // 下夾頭
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(BLADE_X - 18, BLADE_Y + 110, 36, 18);

  // 鋸條中心點
  ctx.fillStyle = '#FF7A00';
  ctx.beginPath();
  ctx.arc(BLADE_X, BLADE_Y, 3, 0, Math.PI * 2);
  ctx.fill();

  // 危險警示動畫（過快時整個閃紅）
  if (state && state.overspeedCount > 15) {
    ctx.strokeStyle = `rgba(225,74,74,${0.4 + Math.sin(t / 100) * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(BLADE_X, BLADE_Y, 30, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHUD() {
  if (!state || !state.started) return;
  const speed = recentSpeed();
  // 速度過快邊緣警告紅
  if (speed > 240) {
    const alpha = 0.1 + Math.sin(performance.now() / 100) * 0.08;
    ctx.fillStyle = `rgba(225,74,74,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `rgba(225,74,74,${0.6 + Math.sin(performance.now() / 100) * 0.4})`;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  }
}

function getBladeOnBoard() {
  return {
    x: BLADE_X - state.boardX,
    y: BLADE_Y - state.boardY,
  };
}

function distanceToPath(px, py) {
  const path = state.level.path.map(([x, y]) => [x + state.pathOffset[0], y + state.pathOffset[1]]);
  let best = Infinity;
  let bestSegIdx = 0;
  let bestT = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i];
    const [bx, by] = path[i + 1];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t, cy = ay + dy * t;
    const d = Math.hypot(px - cx, py - cy);
    if (d < best) {
      best = d;
      bestSegIdx = i;
      bestT = t;
    }
  }
  return { dist: best, segIdx: bestSegIdx, t: bestT };
}

function recentSpeed() {
  if (state.speedSamples.length === 0) return 0;
  const recent = state.speedSamples.slice(-10);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

let dragging = false;
let lastX = 0, lastY = 0;

canvas.addEventListener('pointerdown', e => {
  if (!state || !state.started || state.done || state.failed) return;
  dragging = true;
  canvas.classList.add('dragging');
  const rect = canvas.getBoundingClientRect();
  lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
  lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
  state.lastMoveTime = performance.now();
});

canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const dx = x - lastX;
  const dy = y - lastY;
  state.boardX += dx;
  state.boardY += dy;
  const now = performance.now();
  const dt = now - (state.lastMoveTime || now);
  if (dt > 0) {
    const dist = Math.hypot(dx, dy);
    const speed = (dist / dt) * 1000;
    state.speedSamples.push(speed);
    if (state.speedSamples.length > 60) state.speedSamples.shift();
    // 鋸條聲音速度跟隨
    if (typeof SoundFX !== 'undefined') {
      const normSpeed = Math.min(1, speed / 200);
      SoundFX.setSawSpeed(normSpeed);
    }
    // 有移動 → 噴木屑
    if (dist > 1) spawnSawdust(Math.min(3, dist / 4));
  }
  state.lastMoveTime = now;
  const blade = getBladeOnBoard();
  state.cutPoints.push({ x: blade.x, y: blade.y });
  if (state.cutPoints.length > 5000) state.cutPoints.shift();

  const { dist: d, segIdx, t } = distanceToPath(blade.x, blade.y);
  state.maxOffset = Math.max(state.maxOffset, d);
  const totalSeg = state.level.path.length - 1;
  state.pathProgress = Math.min(1, (segIdx + t) / totalSeg);

  if (d > state.level.tolerance) {
    state.errors++;
    state.burning = Math.min(1, state.burning + 0.005);
    if (state.errors > 80) { fail('偏離切割線太多，鋸條夾住斷裂！'); return; }
  } else {
    state.burning = Math.max(0, state.burning - 0.003);
  }

  const sp = recentSpeed();
  if (sp > 240) {
    state.overspeedCount++;
    state.burning = Math.min(1, state.burning + 0.01);
    if (state.overspeedCount > 30) { fail('推進速度過快，鋸條斷裂！'); return; }
    if (state.overspeedCount === 1) {
      showToast('⚠ 速度過快！放慢一點', 'warn');
      if (typeof SoundFX !== 'undefined') SoundFX.warn();
    }
  } else {
    state.overspeedCount = Math.max(0, state.overspeedCount - 1);
  }

  if (state.pathProgress >= 0.97) { succeed(); return; }

  lastX = x; lastY = y;
  updateUI();
});

['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
  canvas.addEventListener(ev, () => {
    dragging = false;
    canvas.classList.remove('dragging');
    if (typeof SoundFX !== 'undefined') SoundFX.setSawSpeed(0);
  });
});

function updateUI() {
  if (!state) return;
  const blade = getBladeOnBoard();
  const d = distanceToPath(blade.x, blade.y).dist;
  const offsetMM = Math.max(0, d - 2).toFixed(1);
  const offEl = document.getElementById('m-offset');
  offEl.textContent = `${offsetMM} mm`;
  offEl.className = 'v ' + (d < 6 ? 'good' : d < state.level.tolerance ? 'warn' : 'bad');

  const sp = recentSpeed();
  const spEl = document.getElementById('m-speed');
  if (sp < 30) { spEl.textContent = '靜止'; spEl.className = 'v'; }
  else if (sp < 120) { spEl.textContent = '理想'; spEl.className = 'v good'; }
  else if (sp < 240) { spEl.textContent = '偏快'; spEl.className = 'v warn'; }
  else { spEl.textContent = '過快！'; spEl.className = 'v bad'; }

  document.getElementById('m-progress').textContent = Math.round(state.pathProgress * 100) + '%';
  document.getElementById('m-errors').textContent = state.errors;
  document.getElementById('speed-indicator').innerHTML = `速度：<span style="font-weight:700">${Math.round(sp)} px/s</span>`;
}

function succeed() {
  state.done = true;
  if (typeof SoundFX !== 'undefined') SoundFX.stopSaw();
  cancelAnimationFrame(rafId);

  const offsetScore = Math.max(0, 1 - state.maxOffset / (state.level.tolerance * 2));
  const speedScore = Math.max(0, 1 - state.overspeedCount / 50);
  const errorScore = Math.max(0, 1 - state.errors / 100);
  const total = (offsetScore * 0.5 + speedScore * 0.25 + errorScore * 0.25);
  const stars = total > 0.85 ? 3 : total > 0.6 ? 2 : 1;

  const prog = loadProgress();
  prog.module4_levels[state.levelId] = Math.max(prog.module4_levels[state.levelId] || 0, stars);
  saveProgress(prog);
  document.getElementById('star-' + state.levelId).textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  if (typeof SoundFX !== 'undefined') {
    if (stars === 3) SoundFX.win();
    else SoundFX.star(stars);
  }

  showResult(true, stars, {
    '最大偏移': state.maxOffset.toFixed(1) + ' px',
    '失誤次數': state.errors,
    '超速時間': state.overspeedCount + ' 幀',
    '完成度': Math.round(state.pathProgress * 100) + '%',
  });
}

function fail(reason) {
  state.failed = true;
  if (typeof SoundFX !== 'undefined') {
    SoundFX.stopSaw();
    SoundFX.error();
  }
  cancelAnimationFrame(rafId);
  // 噴大量木屑表示斷裂
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: BLADE_X + (Math.random() - 0.5) * 20,
      y: BLADE_Y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 6 - 2,
      life: 1.5,
      size: 1 + Math.random() * 3,
      color: ['#222', '#444', '#666'][Math.floor(Math.random() * 3)],
    });
  }
  setTimeout(() => showResult(false, 0, { '失敗原因': reason }), 600);
}

function showResult(success, stars, detail) {
  const modal = document.getElementById('result-modal');
  document.getElementById('r-title').textContent = success ? '🎉 關卡完成！' : '😵 切割失敗';
  document.getElementById('r-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  document.getElementById('r-stars').style.color = success ? '#FFB400' : '#999';
  const detailEl = document.getElementById('r-detail');
  detailEl.innerHTML = Object.entries(detail).map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  modal.classList.add('show');
}

document.getElementById('r-retry').onclick = () => {
  document.getElementById('result-modal').classList.remove('show');
  initState(state.levelId);
};
document.getElementById('r-next').onclick = () => {
  document.getElementById('result-modal').classList.remove('show');
  const order = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const idx = order.indexOf(state.levelId);
  const nextLvl = order[Math.min(order.length - 1, idx + 1)];
  document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b.dataset.lvl === nextLvl));
  initState(nextLvl);
};

document.getElementById('btn-start').onclick = () => {
  if (!state) return;
  state.started = true;
  state.lastMoveTime = performance.now();
  document.getElementById('sim-overlay').textContent = '切割中…拖曳木板沿切割線前進';
  if (typeof SoundFX !== 'undefined') {
    SoundFX.click();
    SoundFX.startSaw();
  }
  loop();
};
document.getElementById('btn-reset').onclick = () => {
  if (typeof SoundFX !== 'undefined') {
    SoundFX.stopSaw();
    SoundFX.click();
  }
  initState(state.levelId);
};
document.getElementById('btn-stop').onclick = () => {
  if (state) state.paused = true;
  if (typeof SoundFX !== 'undefined') SoundFX.stopSaw();
  document.getElementById('sim-overlay').textContent = '已停止 — 按重置或開始';
};

document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    initState(btn.dataset.lvl);
  });
});

function loop() {
  draw();
  rafId = requestAnimationFrame(loop);
}

const prog = loadProgress();
Object.entries(prog.module4_levels || {}).forEach(([k, s]) => {
  const el = document.getElementById('star-' + k);
  if (el) el.textContent = '★'.repeat(s) + '☆'.repeat(3 - s);
});

initState('L1');
loop();
