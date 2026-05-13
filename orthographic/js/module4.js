// 三視圖 模組 4：3D ↔ 三視圖模擬器
const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cv = document.getElementById('ort-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);

let shape = 'cube';
let rotY = 0;

const INFOS = {
  cube: '立方體：6 個面都一樣 = 三視圖都是正方形。',
  cylinder: '圓柱：正視/側視 = 矩形 ・ 俯視 = 圓形。',
  step: '階梯塊：正視看「L」、側視看矩形、俯視看 L 反轉。虛線顯示背後輪廓。',
  l: 'L 型塊：兩個方塊組合。正視 / 俯視 / 側視都是 L 但旋向不同。',
  hole: '孔板：圓孔在正視看是兩條虛線、俯視看是圓、側視看是虛線。',
  cone: '圓錐：正視/側視 = 三角形 ・ 俯視 = 圓形 + 中心點。',
};

function drawShape3D(cx, cy, s) {
  // 等角投影簡化
  const r = rotY;
  const cos = Math.cos(r), sin = Math.sin(r);

  if (s === 'cube') {
    const size = 60;
    // 等角投影
    const front = [[-size, -size], [size, -size], [size, size], [-size, size]];
    const back = front.map(p => [p[0] + size * 0.5, p[1] - size * 0.5]);
    // 後面
    ctx.fillStyle = '#A5B4FC';
    ctx.beginPath();
    ctx.moveTo(cx + back[0][0], cy + back[0][1]);
    ctx.lineTo(cx + back[1][0], cy + back[1][1]);
    ctx.lineTo(cx + back[2][0], cy + back[2][1]);
    ctx.lineTo(cx + back[3][0], cy + back[3][1]);
    ctx.closePath();
    ctx.fill();
    // 連線
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + front[i][0], cy + front[i][1]);
      ctx.lineTo(cx + back[i][0], cy + back[i][1]);
      ctx.stroke();
    }
    // 前面
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
  } else if (s === 'cylinder') {
    const r = 60, h = 100;
    // 圓柱前後
    ctx.fillStyle = '#A5B4FC';
    ctx.fillRect(cx - r, cy - h/2, r * 2, h);
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.ellipse(cx, cy - h/2, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy - h/2, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - h/2);
    ctx.lineTo(cx - r, cy + h/2);
    ctx.moveTo(cx + r, cy - h/2);
    ctx.lineTo(cx + r, cy + h/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + h/2, r, r * 0.3, 0, 0, Math.PI);
    ctx.stroke();
  } else if (s === 'step') {
    // 階梯塊
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(cx - 60, cy - 20, 120, 50);
    ctx.fillStyle = '#818CF8';
    ctx.fillRect(cx - 60, cy - 60, 60, 50);
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 60, cy - 60, 60, 50);
    ctx.strokeRect(cx - 60, cy - 20, 120, 50);
    // 等角延伸
    ctx.fillStyle = '#A5B4FC';
    ctx.beginPath();
    ctx.moveTo(cx + 60, cy - 20);
    ctx.lineTo(cx + 90, cy - 50);
    ctx.lineTo(cx + 90, cy);
    ctx.lineTo(cx + 60, cy + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (s === 'l') {
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 50);
    ctx.lineTo(cx - 50, cy + 50);
    ctx.lineTo(cx + 50, cy + 50);
    ctx.lineTo(cx + 50, cy + 10);
    ctx.lineTo(cx - 10, cy + 10);
    ctx.lineTo(cx - 10, cy - 50);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (s === 'hole') {
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(cx - 70, cy - 40, 140, 80);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 70, cy - 40, 140, 80);
  } else if (s === 'cone') {
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx + 50, cy + 60);
    ctx.lineTo(cx - 50, cy + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3730A3';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 60, 50, 12, 0, 0, Math.PI);
    ctx.stroke();
  }
}

function drawView(cx, cy, s, view) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 60, cy - 60, 120, 120);
  ctx.strokeStyle = '#3730A3';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 60, cy - 60, 120, 120);

  ctx.fillStyle = '#E0E7FF';
  ctx.strokeStyle = '#3730A3';
  ctx.lineWidth = 2;

  if (s === 'cube') {
    ctx.fillRect(cx - 35, cy - 35, 70, 70);
    ctx.strokeRect(cx - 35, cy - 35, 70, 70);
  } else if (s === 'cylinder') {
    if (view === 'top') {
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy);
      ctx.lineTo(cx + 35, cy);
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(cx, cy + 35);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillRect(cx - 35, cy - 35, 70, 70);
      ctx.strokeRect(cx - 35, cy - 35, 70, 70);
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 38);
      ctx.lineTo(cx, cy + 38);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (s === 'step') {
    if (view === 'front') {
      // L shape
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 40);
      ctx.lineTo(cx - 40, cy + 40);
      ctx.lineTo(cx + 40, cy + 40);
      ctx.lineTo(cx + 40, cy + 5);
      ctx.lineTo(cx - 10, cy + 5);
      ctx.lineTo(cx - 10, cy - 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (view === 'side') {
      ctx.fillRect(cx - 35, cy - 40, 70, 80);
      ctx.strokeRect(cx - 35, cy - 40, 70, 80);
    } else if (view === 'top') {
      ctx.fillRect(cx - 40, cy - 35, 80, 70);
      ctx.strokeRect(cx - 40, cy - 35, 80, 70);
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 35);
      ctx.lineTo(cx - 10, cy + 35);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (s === 'l') {
    if (view === 'front' || view === 'side') {
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 35);
      ctx.lineTo(cx - 35, cy + 35);
      ctx.lineTo(cx + 35, cy + 35);
      ctx.lineTo(cx + 35, cy + 10);
      ctx.lineTo(cx - 10, cy + 10);
      ctx.lineTo(cx - 10, cy - 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(cx - 35, cy - 25, 70, 50);
      ctx.strokeRect(cx - 35, cy - 25, 70, 50);
    }
  } else if (s === 'hole') {
    ctx.fillRect(cx - 40, cy - 25, 80, 50);
    ctx.strokeRect(cx - 40, cy - 25, 80, 50);
    if (view === 'top') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 25);
      ctx.lineTo(cx - 12, cy + 25);
      ctx.moveTo(cx + 12, cy - 25);
      ctx.lineTo(cx + 12, cy + 25);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (s === 'cone') {
    if (view === 'top') {
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3730A3';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 40);
      ctx.lineTo(cx + 35, cy + 35);
      ctx.lineTo(cx - 35, cy + 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#3730A3';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(view === 'front' ? '正視' : view === 'side' ? '側視（右）' : '俯視', cx, cy + 80);
}

function draw() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);

  // 3D 物件（左上）
  ctx.fillStyle = '#3730A3';
  ctx.font = '800 14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('3D 物件', 180, 30);
  drawShape3D(180, 130, shape);

  // 正視（右上）
  drawView(560, 100, shape, 'front');
  // 側視（右上右）
  // 俯視（中下）
  drawView(560, 280, shape, 'side');
  drawView(380, 380, shape, 'top');

  // 對齊線
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(380, 60);
  ctx.lineTo(380, 320);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(440, 100);
  ctx.lineTo(660, 100);
  ctx.stroke();
  ctx.setLineDash([]);

  // 標題
  ctx.fillStyle = '#fff';
  ctx.font = '800 16px Inter';
  ctx.fillText('▶ 觀察三視圖與 3D 物件的對應', W/2, 480);
}

function setShape(s) {
  shape = s;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.s === s));
  $('info').textContent = INFOS[s];
  draw();
  const p = loadP(); p.module4 = true; p[`module4_${s}`] = true; saveP(p);
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setShape(t.dataset.s)));
setShape('cube');
