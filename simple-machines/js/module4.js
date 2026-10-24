// 簡單機械 模組 4：模擬器
const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cv = document.getElementById('sm-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);

let mode = 'lever';

function drawLever() {
  const load = parseInt($('s-load').value);
  const pivot = parseInt($('s-pivot').value);
  const beamLen = 600;
  const beamY = 280;
  const startX = 80;
  const pivotX = startX + (beamLen * pivot / 100);
  // 計算
  const loadArm = (pivotX - startX) / 100; // m
  const effortArm = (startX + beamLen - pivotX) / 100;
  const ma = effortArm / loadArm;
  const force = load / ma;
  // 桿
  ctx.strokeStyle = '#DB2777';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(startX, beamY);
  ctx.lineTo(startX + beamLen, beamY);
  ctx.stroke();
  // 支點
  ctx.fillStyle = '#9D174D';
  ctx.beginPath();
  ctx.moveTo(pivotX - 14, beamY + 4);
  ctx.lineTo(pivotX + 14, beamY + 4);
  ctx.lineTo(pivotX, beamY + 36);
  ctx.closePath();
  ctx.fill();
  // 抗力（重物）
  const lw = Math.max(40, Math.min(80, load / 8));
  ctx.fillStyle = '#831843';
  ctx.fillRect(startX - lw/2, beamY - lw - 4, lw, lw);
  ctx.fillStyle = '#fff';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${load} kgw`, startX, beamY - lw/2 - 2);
  // 施力箭頭
  const fy = beamY - 80;
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(startX + beamLen, fy);
  ctx.lineTo(startX + beamLen, beamY - 8);
  ctx.stroke();
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(startX + beamLen, beamY - 4);
  ctx.lineTo(startX + beamLen - 8, beamY - 14);
  ctx.lineTo(startX + beamLen + 8, beamY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.font = '800 13px Inter';
  ctx.fillText(`${force.toFixed(1)} kgw`, startX + beamLen, fy - 8);
  // 力臂尺度
  ctx.strokeStyle = '#0891B2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, beamY + 60);
  ctx.lineTo(pivotX, beamY + 60);
  ctx.stroke();
  ctx.font = '700 12px Inter';
  ctx.fillStyle = '#0891B2';
  ctx.fillText(`抗力臂 ${loadArm.toFixed(1)}m`, (startX + pivotX) / 2, beamY + 80);
  ctx.strokeStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(pivotX, beamY + 60);
  ctx.lineTo(startX + beamLen, beamY + 60);
  ctx.stroke();
  ctx.fillStyle = '#16A34A';
  ctx.fillText(`施力臂 ${effortArm.toFixed(1)}m`, (pivotX + startX + beamLen) / 2, beamY + 80);
  return { ma, force, load, loadDist: 1.0, effortDist: ma * 1.0 };
}

function drawPulley() {
  const load = parseInt($('s-pload').value);
  const ropes = parseInt($('s-rope').value);
  const ma = ropes;
  const force = load / ma;
  const cx = W / 2;
  // 繩路幾何：n 段「支撐重物的繩」+ 1 段「施力繩」= n+1 條垂直繩段，由左到右排列。
  // 相鄰兩條繩段交替在「上方繞定滑輪」或「下方繞動滑輪」相接：
  //   最右邊（施力繩 ↔ 最後一段支撐繩）一定在上方繞定滑輪，往左依序下、上、下…
  //   最左邊那條繩的自由端：n 為奇數時固定在動滑輪組（下方）、n 為偶數時固定在橫梁（上方）
  // 定滑輪數 = ceil(n/2)、動滑輪數 = floor(n/2)；n = 1 就是單一定滑輪（只改變方向）
  const n = ropes;
  const R = 16;              // 滑輪繩槽半徑（相鄰繩段間距 = 2R）
  const yBeam = 80, yTop = 130, yBot = 300, yHand = 440;
  const x0 = cx - n * R;     // 第 0 條繩段的 x；第 i 條在 x0 + 2R·i
  const X = i => x0 + 2 * R * i;
  const topAt = i => (n - i) % 2 === 1;   // 第 i、i+1 條之間的連接在上方（定滑輪）？
  const hangerY = yBot + R + 6;           // 動滑輪組吊架 / 重物掛點
  // 上方橫梁 + 掛架
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(cx - 160, yBeam, 320, 16);
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 6, yBeam - 20, 12, 20);
  // 定滑輪吊耳、動滑輪吊架（先畫，讓繩子蓋在上面）
  ctx.fillStyle = '#6b7280';
  for (let i = 0; i < n; i++) {
    const xm = X(i) + R;
    if (topAt(i)) ctx.fillRect(xm - 3, yBeam + 16, 6, yTop - yBeam - 16);
    else ctx.fillRect(xm - 3, yBot, 6, hangerY - yBot);
  }
  // 繩子：垂直段
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    let top = yTop, bot = yBot;
    if (i === 0) { if (n % 2 === 0) top = yBeam + 16; else bot = hangerY; } // 繩頭固定在橫梁 / 動滑輪組
    if (i === n) bot = yHand;                                                // 施力端垂到手
    if (n === 1) bot = i === 0 ? hangerY : yHand;                            // 單定滑輪：左邊直接吊重物
    ctx.moveTo(X(i), top);
    ctx.lineTo(X(i), bot);
  }
  // 繩子：繞滑輪的半圓
  for (let i = 0; i < n; i++) {
    const xm = X(i) + R;
    if (topAt(i)) { ctx.moveTo(X(i), yTop); ctx.arc(xm, yTop, R, Math.PI, 2 * Math.PI); }
    else { ctx.moveTo(X(i + 1), yBot); ctx.arc(xm, yBot, R, 0, Math.PI); }
  }
  ctx.stroke();
  // 滑輪本體（半徑略小於繩槽，繩子看起來卡在輪緣）
  const drawWheel = (x, y) => {
    ctx.fillStyle = '#FCE7F3';
    ctx.strokeStyle = '#DB2777';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, R - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DB2777';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  for (let i = 0; i < n; i++) {
    const xm = X(i) + R;
    if (topAt(i)) drawWheel(xm, yTop); else drawWheel(xm, yBot);
  }
  // 支撐繩段編號（只標支撐重物的 n 段，施力繩不算）
  ctx.fillStyle = '#86efac';
  ctx.font = '700 11px Inter';
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) ctx.fillText(String(i + 1), X(i) - 9, (yTop + yBot) / 2);
  // 重物（吊在動滑輪組／第 0 條繩正下方）
  const lw = Math.max(70, Math.min(120, load / 5));
  const loadCX = n === 1 ? X(0) : (X(0) + X(n - 1)) / 2;
  const loadTop = hangerY;
  ctx.fillStyle = '#831843';
  if (n > 1) ctx.fillRect(X(0) - R - 2, hangerY - 6, X(n - 1) - X(0) + 2 * R + 4, 6); // 動滑輪組吊架橫桿
  ctx.fillRect(loadCX - lw / 2, loadTop, lw, 56);
  ctx.fillStyle = '#fff';
  ctx.font = '800 16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${load} kgw`, loadCX, loadTop + 34);
  // 施力端（向下拉的箭頭 + 數值）
  const px = X(n);
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(px, yHand + 12);
  ctx.lineTo(px - 7, yHand - 2);
  ctx.lineTo(px + 7, yHand - 2);
  ctx.closePath();
  ctx.fill();
  ctx.font = '800 16px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`拉力 ${force.toFixed(1)} kgw`, px + 14, yHand + 6);
  ctx.font = '700 12px Inter';
  ctx.fillStyle = '#9D174D';
  ctx.textAlign = 'center';
  ctx.fillText(`MA = 支撐重物的繩段數 = ${ma} 段 = ${ma} 倍`, cx, 482);
  return { ma, force, load, loadDist: 1.0, effortDist: ma * 1.0 };
}

function drawIncline() {
  const load = parseInt($('s-iload').value);
  const angle = parseInt($('s-angle').value);
  const height = parseFloat($('s-height').value);
  const rad = angle * Math.PI / 180;
  const length = height / Math.sin(rad);
  const ma = length / height;
  const force = load / ma;
  const baseY = 380;
  const baseX = 700;
  // 底邊依角度縮放，讓斜面頂點最高只到 y=50，不會衝出畫布（5° 時底邊 600、60° 時約 190）
  const base = Math.min(600, 330 / Math.tan(rad));
  const apexX = baseX - base;
  const apexY = baseY - base * Math.tan(rad);
  // 斜面三角形
  ctx.fillStyle = '#FCE7F3';
  ctx.strokeStyle = '#DB2777';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(apexX, baseY);
  ctx.lineTo(baseX, baseY);
  ctx.lineTo(baseX, apexY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 物體（放在斜面 55% 處）
  const objCX = apexX + base * 0.55;
  const objCY = baseY - (objCX - apexX) * Math.tan(rad);
  ctx.save();
  ctx.translate(objCX, objCY);
  ctx.rotate(-rad);
  ctx.fillStyle = '#831843';
  ctx.fillRect(-30, -40, 60, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${load} kgw`, 0, -22);
  // 施力箭頭（沿斜面往上，方向 (cos θ, −sin θ)；在旋轉後的座標系就是 +x 方向）
  ctx.strokeStyle = '#16A34A';
  ctx.fillStyle = '#16A34A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(34, -25);
  ctx.lineTo(96, -25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(110, -25);
  ctx.lineTo(94, -33);
  ctx.lineTo(94, -17);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // 角度標示（坡度角在斜面底端的頂點：畫角弧，數字寫在底邊下方）
  ctx.strokeStyle = '#DB2777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(apexX, baseY, 28, -rad, 0);
  ctx.stroke();
  ctx.font = '800 16px Inter';
  ctx.fillStyle = '#DB2777';
  ctx.textAlign = 'center';
  ctx.fillText(`${angle}°`, apexX + 30, baseY + 24);
  // 高度標示
  ctx.strokeStyle = '#0891B2';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(baseX + 20, baseY);
  ctx.lineTo(baseX + 20, apexY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#0891B2';
  ctx.font = '700 12px Inter';
  // 文字轉 90° 貼著高度虛線直寫（x = baseX + 36），不再以畫布右緣 x=760 為中心被切掉一半
  ctx.save();
  ctx.translate(baseX + 36, (baseY + apexY) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`高 ${height}m`, 0, 0);
  ctx.restore();
  ctx.fillStyle = '#9D174D';
  ctx.font = '800 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`需 ${force.toFixed(1)} kgw 推力`, 30, 50);
  ctx.fillText(`需走 ${length.toFixed(2)}m 距離`, 30, 75);
  return { ma, force, load, loadDist: height, effortDist: length };
}

function update() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  let r;
  if (mode === 'lever') r = drawLever();
  else if (mode === 'pulley') r = drawPulley();
  else if (mode === 'incline') r = drawIncline();
  // 更新數據
  $('e-ma').textContent = r.ma.toFixed(2) + ' 倍';
  $('e-force').textContent = r.force.toFixed(1) + ' kgw';
  $('e-dist').textContent = r.effortDist.toFixed(2) + ' m';
  const energyLoad = r.load * r.loadDist;
  const energyForce = r.force * r.effortDist;
  $('e-energy').textContent = `${energyLoad.toFixed(0)} ≈ ${energyForce.toFixed(0)} kgw·m`;
}

function switchMode(m) {
  mode = m;
  document.querySelectorAll('.machine-tab').forEach(t => t.classList.toggle('active', t.dataset.m === m));
  document.getElementById('lever-controls').style.display = m === 'lever' ? '' : 'none';
  document.getElementById('pulley-controls').style.display = m === 'pulley' ? '' : 'none';
  document.getElementById('incline-controls').style.display = m === 'incline' ? '' : 'none';
  update();
  const p = loadP();
  p.module4 = true;
  p[`module4_${m}_tried`] = true;
  saveP(p);
}

document.querySelectorAll('.machine-tab').forEach(t => t.addEventListener('click', () => switchMode(t.dataset.m)));

['load', 'pivot', 'pload', 'rope', 'iload', 'angle', 'height'].forEach(id => {
  const el = $(`s-${id}`);
  if (el) el.addEventListener('input', () => {
    if (id === 'load') $('v-load').textContent = el.value + ' kgw';
    if (id === 'pivot') $('v-pivot').textContent = el.value < 40 ? `左側 ${el.value}%` : el.value > 60 ? `右側 ${el.value}%` : '中央';
    if (id === 'pload') $('v-pload').textContent = el.value + ' kgw';
    if (id === 'rope') $('v-rope').textContent = el.value + ' 段';
    if (id === 'iload') $('v-iload').textContent = el.value + ' kgw';
    if (id === 'angle') $('v-angle').textContent = el.value + '°';
    if (id === 'height') $('v-height').textContent = el.value + ' m';
    update();
  });
});
update();
