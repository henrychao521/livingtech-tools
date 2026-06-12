// 焊接平台 模組 4：Canvas 焊接模擬器
const canvas = document.getElementById('solder-canvas');
const ctx = canvas.getContext('2d');

// 關卡定義
const LEVELS = {
  L1: {
    name: 'L1 單點焊接',
    desc: '最基本練習：1 個焊點',
    pads: [{ x: 380, y: 250 }],
  },
  L2: {
    name: 'L2 多點直線',
    desc: '3 個排成直線的焊點',
    pads: [
      { x: 280, y: 250 },
      { x: 380, y: 250 },
      { x: 480, y: 250 },
    ],
  },
  L3: {
    name: 'L3 排針焊接',
    desc: '5 個密集排針',
    pads: [
      { x: 240, y: 250 }, { x: 310, y: 250 }, { x: 380, y: 250 },
      { x: 450, y: 250 }, { x: 520, y: 250 },
    ],
  },
  L4: {
    name: 'L4 SMD 微焊',
    desc: '4 個 SMD 小焊點',
    pads: [
      { x: 320, y: 220, smd: true }, { x: 320, y: 280, smd: true },
      { x: 440, y: 220, smd: true }, { x: 440, y: 280, smd: true },
    ],
  },
  L5: {
    name: 'L5 修正錯誤焊',
    desc: '3 個焊點：先吸掉預設的虛焊，再重新焊好',
    pads: [
      { x: 280, y: 250, defective: 'cold' },
      { x: 380, y: 250, defective: 'bridge' },
      { x: 480, y: 250 },
    ],
  },
};

// === 狀態 ===
const state = {
  levelId: 'L1',
  level: LEVELS.L1,
  ironTemp: 25,         // 烙鐵溫度（從 25°C 加熱到 350°C）
  ironTargetTemp: 350,
  ironHeatRate: 75,     // 每秒升溫（°C/s）：約 4 秒就緒，保留「烙鐵要先加熱」的概念但不讓學生乾等
  ironX: 200,
  ironY: 100,
  ironVisible: false,
  pressing: false,      // 按住中
  joints: [],           // 已完成的焊點
  particles: [],
  contactStart: null,   // 接觸接點起始時間
  contactPad: null,
  feedingStart: null,
  finished: false,
  startedAt: null,
};

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

const PROGRESS_KEY_S = 'solder_progress_v1';
function loadSolderProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || { module4_levels: {} }; } catch { return { module4_levels: {} }; }
}
function saveSolderProgress(p) { localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p)); }

// === 初始化關卡 ===
function initLevel(lvlId) {
  state.levelId = lvlId;
  state.level = LEVELS[lvlId];
  state.joints = state.level.pads.map(p => ({
    x: p.x, y: p.y,
    smd: p.smd || false,
    defective: p.defective || null,
    status: p.defective ? 'defective' : 'empty', // empty / heating / soldered / over / cold / bridge
    heatTime: 0,
    solderAmount: 0,
  }));
  state.ironTemp = 25;
  state.ironVisible = false;
  state.particles = [];
  state.finished = false;
  state.startedAt = null;
  state.contactStart = null;
  state.contactPad = null;
  state.readyShown = false;

  document.getElementById('level-display').textContent = lvlId;
  document.getElementById('joint-count').textContent = `0 / ${state.level.pads.length}`;
  document.getElementById('sim-overlay').textContent = `${state.level.name}：${state.level.desc} ｜ 按「開始焊接」`;
  draw();
}

// === 鍵盤 / 指針（滑鼠＋觸控筆＋手指） ===
function aimIron(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * (canvas.width / rect.width)));
  mouseY = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * (canvas.height / rect.height)));
}
canvas.addEventListener('pointermove', aimIron);
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  aimIron(e);
  // 觸控不在 pointerdown 送錫（手指一碰就餵錫會造成大量誤判冷焊），改用「送錫」鈕
  if (e.pointerType === 'mouse') state.pressing = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
});
canvas.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') state.pressing = false; });
canvas.addEventListener('pointercancel', () => { state.pressing = false; });
canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') state.pressing = false; });
window.addEventListener('keydown', e => {
  if (e.code === 'Space') { state.pressing = true; e.preventDefault(); }
});
window.addEventListener('keyup', e => {
  if (e.code === 'Space') { state.pressing = false; e.preventDefault(); }
});
// 「送錫」鈕：平板按住即送錫；桌機也可用（等同按住空白鍵）
const feedBtn = document.getElementById('btn-feed');
if (feedBtn) {
  feedBtn.addEventListener('pointerdown', e => {
    e.preventDefault();
    state.pressing = true;
    feedBtn.classList.add('feeding');
    try { feedBtn.setPointerCapture(e.pointerId); } catch (_) {}
  });
  ['pointerup', 'pointercancel'].forEach(ev => feedBtn.addEventListener(ev, () => {
    state.pressing = false;
    feedBtn.classList.remove('feeding');
  }));
  feedBtn.addEventListener('contextmenu', e => e.preventDefault());
}

// === 主迴圈 ===
function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  // 烙鐵溫度上升
  if (state.ironTemp < state.ironTargetTemp) {
    state.ironTemp = Math.min(state.ironTargetTemp, state.ironTemp + state.ironHeatRate / 60);
  }
  document.getElementById('temp-display').textContent = Math.round(state.ironTemp) + '°C';
  const tempEl = document.getElementById('temp-display');
  if (state.ironTemp >= 320) tempEl.classList.replace('heating', 'ready');
  else { tempEl.classList.add('heating'); tempEl.classList.remove('ready'); }

  document.getElementById('iron-state').textContent = state.ironTemp >= 320 ? '已就緒' : '加熱中';

  // 烙鐵到溫的瞬間更新畫面提示（原本停留在「等溫度達 320°C」不會變）
  if (state.ironTemp >= 320 && state.startedAt && !state.readyShown) {
    state.readyShown = true;
    document.getElementById('sim-overlay').textContent = '✓ 烙鐵已就緒｜移到接點加熱 ~1 秒，再按住送錫';
  }

  if (!state.startedAt || state.finished) return;
  if (state.ironTemp < 320) return; // 還沒熱好

  // 檢測烙鐵是否接觸接點
  let touching = null;
  for (const j of state.joints) {
    if (j.status === 'soldered' || j.status === 'over') continue;
    const dx = mouseX - j.x;
    const dy = mouseY - j.y;
    const r = j.smd ? 18 : 22;
    if (Math.hypot(dx, dy) < r) { touching = j; break; }
  }

  if (touching && touching !== state.contactPad) {
    state.contactPad = touching;
    state.contactStart = performance.now();
  } else if (!touching) {
    state.contactPad = null;
    state.contactStart = null;
  }

  // 接觸時持續加熱接點
  if (state.contactPad) {
    const elapsed = (performance.now() - state.contactStart) / 1000;
    state.contactPad.heatTime = elapsed;

    // 噴小煙
    if (Math.random() < 0.3) {
      state.particles.push({
        x: state.contactPad.x + (Math.random() - 0.5) * 8,
        y: state.contactPad.y - 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1,
        size: 2 + Math.random() * 3,
        color: `rgba(180,180,180,`,
      });
    }

    // 接觸時按住送錫
    if (state.pressing) {
      // 必須先加熱 0.8 秒以上才能送錫（不能直接碰錫絲到冷接點）
      if (elapsed >= 0.8) {
        state.contactPad.solderAmount = Math.min(2, state.contactPad.solderAmount + 0.025);

        // 噴橘色火花
        if (Math.random() < 0.5) {
          state.particles.push({
            x: state.contactPad.x + (Math.random() - 0.5) * 6,
            y: state.contactPad.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2 - 1,
            life: 1,
            size: 1 + Math.random() * 1.5,
            color: '#fbbf24',
          });
        }
      } else {
        // 太早送錫 → 標記為冷焊
        if (state.contactPad.solderAmount === 0) state.contactPad.solderAmount = 0.001;
      }
    }
  }

  // 評估接點狀態
  state.joints.forEach(j => {
    if (j.status === 'empty' && j.solderAmount > 0) {
      // 焊接中，未完成
      if (j.heatTime > 0.3 && !state.contactPad) {
        // 烙鐵離開了，定型
        if (j.solderAmount < 0.3) j.status = 'cold';
        else if (j.solderAmount > 1.5) j.status = 'over';
        else j.status = 'soldered';
        j.heatTime = j.solderAmount > 1.4 ? 4 + (j.solderAmount - 1.4) * 5 : 0;

        if (j.status === 'soldered') {
          if (typeof SoundFX !== 'undefined') SoundFX.success();
        } else if (typeof SoundFX !== 'undefined') {
          SoundFX.warn();
        }
      }
    }

    // 過熱（接點停留太久 > 4 秒）
    if (j === state.contactPad && j.heatTime > 4) {
      j.status = 'burnt';
    }

    // 修正模式：吸掉之前的不良焊接
    if (j.defective && state.contactPad === j && state.pressing && state.contactPad.heatTime > 1.5) {
      j.defective = null;
      j.status = 'empty';
      j.solderAmount = 0;
      showToast('已吸除不良焊錫，可以重新焊', 'good');
    }
  });

  // 粒子更新
  state.particles = state.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 0.02;
    return p.life > 0;
  });

  // 完成度判定
  const allDone = state.joints.every(j =>
    j.status === 'soldered' || j.status === 'cold' || j.status === 'over' || j.status === 'burnt'
  );
  const goodCount = state.joints.filter(j => j.status === 'soldered').length;
  document.getElementById('joint-count').textContent = `${goodCount} / ${state.level.pads.length}`;
  if (allDone) state.finished = true;
}

// === 繪製 ===
function draw() {
  // 背景（深綠 PCB 桌面感）
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 600);
  grad.addColorStop(0, '#0a3d1f');
  grad.addColorStop(1, '#052614');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // PCB 板
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.4)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(80, 180, canvas.width - 160, 140);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#15803d';
  ctx.fillRect(80, 180, canvas.width - 160, 8);
  // 走線
  ctx.strokeStyle = 'rgba(255,200,100,.3)';
  ctx.lineWidth = 1.5;
  state.joints.forEach((j, i) => {
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(state.joints[i - 1].x, state.joints[i - 1].y + (j.smd ? 15 : 30));
      ctx.lineTo(j.x, j.y + (j.smd ? 15 : 30));
      ctx.stroke();
    }
  });
  ctx.restore();

  // 焊盤（接點）
  state.joints.forEach(j => drawPad(j));

  // 元件腳（一般焊點才有，SMD 沒有）
  state.joints.forEach(j => {
    if (j.smd) return;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(j.x, j.y - 70);
    ctx.lineTo(j.x, j.y);
    ctx.stroke();
  });

  // 元件本體（橫桿）
  if (!state.joints[0]?.smd && state.joints.length > 1) {
    const xs = state.joints.map(j => j.x);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(minX - 14, state.joints[0].y - 90, maxX - minX + 28, 22);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMPONENT', (minX + maxX) / 2, state.joints[0].y - 75);
  } else if (!state.joints[0]?.smd) {
    // 單點：方形元件
    const j = state.joints[0];
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(j.x - 30, j.y - 90, 60, 22);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LED', j.x, j.y - 75);
  }

  // 粒子（煙、火花）
  state.particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color === 'rgba(180,180,180,' ? `rgba(180,180,180,${p.life * .5})` : p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // 烙鐵（跟隨滑鼠）＋ 錫絲（另一手，從右下伸入）
  if (state.ironVisible) {
    drawIron(mouseX, mouseY);
    drawSolderWire(mouseX, mouseY);
  }
}

// 錫絲：模擬真實焊接的雙手技法——左手烙鐵、右手送錫。
// 平時懸在接點旁待命，按住送錫且接點夠熱時才頂上去（對應 M3 教的「烙鐵先到、錫絲後到」）
function drawSolderWire(tx, ty) {
  const feeding = state.pressing && state.contactPad && state.ironTemp >= 320;
  const dirX = 0.82, dirY = 0.57;             // 從右下方 35° 角伸入
  const gap = feeding ? 1 : 24;               // 送錫時碰到接點，否則保持距離
  const tipX = tx + dirX * gap;
  const tipY = ty + dirY * gap;
  const endX = tipX + dirX * 170;
  const endY = tipY + dirY * 170;

  // 錫絲本體（銀灰、微高光）
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(endX, endY); ctx.stroke();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(tipX - 0.8, tipY - 1.2); ctx.lineTo(endX - 0.8, endY - 1.2); ctx.stroke();

  if (feeding) {
    // 接觸端熔融的小錫珠
    const melt = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 7);
    melt.addColorStop(0, '#f3f4f6');
    melt.addColorStop(.6, '#9ca3af');
    melt.addColorStop(1, 'rgba(156,163,175,0)');
    ctx.fillStyle = melt;
    ctx.beginPath(); ctx.arc(tipX, tipY, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPad(j) {
  // 銅環
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  if (j.smd) {
    ctx.fillRect(j.x - 12, j.y - 8, 24, 16);
    ctx.strokeRect(j.x - 12, j.y - 8, 24, 16);
  } else {
    ctx.beginPath();
    ctx.arc(j.x, j.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 中心孔
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 加熱光暈（接觸中）
  if (j === state.contactPad && state.ironTemp >= 320) {
    const intensity = Math.min(1, j.heatTime / 1.5);
    const glow = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, 30);
    glow.addColorStop(0, `rgba(255, 100, 0, ${0.6 * intensity})`);
    glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(j.x, j.y, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // 焊點外觀
  drawJoint(j);
}

function drawJoint(j) {
  if (j.solderAmount === 0 && !j.defective) return;

  const status = j.defective || j.status;
  ctx.save();
  switch (status) {
    case 'soldered': // 完美焊點：飽滿錐形 + 高光
      drawShinyCone(j.x, j.y, j.smd ? 10 : 14, j.smd ? 6 : 9);
      break;
    case 'cold': // 冷焊：表面顆粒、暗淡
      drawColdJoint(j.x, j.y, j.smd ? 9 : 12);
      break;
    case 'over': // 過量錫：圓球
      drawOverSolder(j.x, j.y, j.smd ? 14 : 18);
      break;
    case 'burnt': // 燒焦
      drawBurnt(j.x, j.y, j.smd ? 12 : 16);
      break;
    case 'bridge': // 連錫
      drawBridge(j.x, j.y);
      break;
    case 'defective':
    default: // 焊接中
      const r = (j.smd ? 8 : 11) + j.solderAmount * 4;
      ctx.fillStyle = `rgba(192,192,192,${0.7 + j.solderAmount * 0.15})`;
      ctx.beginPath();
      ctx.arc(j.x, j.y, r, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

function drawShinyCone(x, y, w, h) {
  // 漸層錐形
  const grad = ctx.createRadialGradient(x - w/3, y - h/2, 1, x, y, w);
  grad.addColorStop(0, '#f0f0f0');
  grad.addColorStop(.5, '#a0a0a0');
  grad.addColorStop(1, '#606060');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath();
  ctx.ellipse(x - w/3, y - h/3, w/4, h/5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 邊緣
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = .8;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawColdJoint(x, y, r) {
  // 顆粒霧面
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // 顆粒紋理（隨機點）
  ctx.fillStyle = 'rgba(60,60,60,.5)';
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * r * 0.8;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOverSolder(x, y, r) {
  // 大球狀
  const grad = ctx.createRadialGradient(x - r/3, y - r/3, 1, x, y, r);
  grad.addColorStop(0, '#d0d0d0');
  grad.addColorStop(1, '#505050');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#303030';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBurnt(x, y, r) {
  // 焦黃焦黑
  const grad = ctx.createRadialGradient(x, y, 1, x, y, r * 1.5);
  grad.addColorStop(0, '#1a1a1a');
  grad.addColorStop(.4, '#8b4513');
  grad.addColorStop(1, 'rgba(139,69,19,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(x, y, r * .6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBridge(x, y) {
  // 連錫：把這個點與下一個點連起來
  const idx = state.joints.findIndex(j => j.x === x && j.y === y);
  const next = state.joints[idx + 1];
  if (!next) {
    drawShinyCone(x, y, 12, 8);
    return;
  }
  // 大坨錫覆蓋兩個點
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.ellipse((x + next.x) / 2, y, Math.abs(next.x - x) / 2 + 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#404040';
  ctx.stroke();
  // 標籤
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('連錫!', (x + next.x) / 2, y - 18);
}

function drawIron(x, y) {
  const dx = x - 0;
  // 假設烙鐵從左上方來
  const angle = Math.atan2(y - 60, x - 0);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // 握柄
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-180, -15, 130, 30);
  // 烙鐵頭金屬段
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(-50, -10, 30, 20);
  // 烙鐵頭橘紅
  const tipGrad = ctx.createLinearGradient(-20, 0, 5, 0);
  tipGrad.addColorStop(0, '#fbbf24');
  tipGrad.addColorStop(.5, '#f59e0b');
  tipGrad.addColorStop(1, '#dc2626');
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(-20, -8);
  ctx.lineTo(0, 0);
  ctx.lineTo(-20, 8);
  ctx.closePath();
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.fillRect(-20, -6, 18, 2);
  // 加熱光暈
  if (state.ironTemp >= 320) {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    glow.addColorStop(0, 'rgba(255, 100, 0, .5)');
    glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// === 控制按鈕 ===
document.getElementById('btn-start').onclick = () => {
  state.startedAt = performance.now();
  state.ironVisible = true;
  document.getElementById('sim-overlay').textContent = '開始焊接！等溫度達 320°C';
  if (typeof SoundFX !== 'undefined') SoundFX.click();
};
document.getElementById('btn-reset').onclick = () => {
  initLevel(state.levelId);
  if (typeof SoundFX !== 'undefined') SoundFX.click();
};
document.getElementById('btn-finish').onclick = () => {
  evaluate();
};

document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    initLevel(btn.dataset.lvl);
  });
});

function evaluate() {
  if (!state.startedAt) {
    showToast('請先按「開始焊接」', 'warn');
    return;
  }
  const total = state.joints.length;
  const good = state.joints.filter(j => j.status === 'soldered').length;
  const cold = state.joints.filter(j => j.status === 'cold').length;
  const over = state.joints.filter(j => j.status === 'over').length;
  const burnt = state.joints.filter(j => j.status === 'burnt').length;
  const empty = state.joints.filter(j => j.status === 'empty' && j.solderAmount === 0).length;

  const ratio = good / total;
  const stars = ratio >= 0.95 ? 3 : ratio >= 0.66 ? 2 : ratio > 0 ? 1 : 0;

  const prog = loadSolderProgress();
  prog.module4_levels = prog.module4_levels || {};
  prog.module4_levels[state.levelId] = Math.max(prog.module4_levels[state.levelId] || 0, stars);
  saveSolderProgress(prog);
  document.getElementById('star-' + state.levelId).textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  if (typeof SoundFX !== 'undefined') {
    if (stars === 3) SoundFX.win();
    else if (stars > 0) SoundFX.star(stars);
    else SoundFX.error();
  }

  const detail = {
    '完美焊點': `${good} / ${total}`,
  };
  if (cold) detail['冷焊（虛焊）'] = cold;
  if (over) detail['過量錫'] = over;
  if (burnt) detail['燒焦 PCB'] = burnt;
  if (empty) detail['漏焊'] = empty;

  showResult(stars, detail);
}

function showResult(stars, detail) {
  const modal = document.getElementById('result-modal');
  document.getElementById('r-title').textContent = stars === 3 ? '🎉 完美焊接！' : stars > 0 ? '焊接完成（可優化）' : '😵 焊接失敗';
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
  const idx = order.indexOf(state.levelId);
  const next = order[Math.min(order.length - 1, idx + 1)];
  document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b.dataset.lvl === next));
  initLevel(next);
};

// 載入星等
const prog = loadSolderProgress();
Object.entries(prog.module4_levels || {}).forEach(([k, s]) => {
  const el = document.getElementById('star-' + k);
  if (el) el.textContent = '★'.repeat(s) + '☆'.repeat(3 - s);
});

initLevel('L1');
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});