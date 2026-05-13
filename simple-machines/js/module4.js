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
  ctx.fillText(`${load}kg`, startX, beamY - lw/2 - 2);
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
  ctx.fillText(`${force.toFixed(1)}kg`, startX + beamLen, fy - 8);
  // 力臂尺度
  ctx.strokeStyle = '#0891B2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, beamY + 60);
  ctx.lineTo(pivotX, beamY + 60);
  ctx.stroke();
  ctx.font = '700 12px Inter';
  ctx.fillStyle = '#0891B2';
  ctx.fillText(`阻力臂 ${loadArm.toFixed(1)}m`, (startX + pivotX) / 2, beamY + 80);
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
  // 上方架構
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(cx - 140, 80, 280, 16);
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 6, 60, 12, 22);
  // 上方滑輪們
  for (let i = 0; i < Math.ceil(ropes / 2); i++) {
    ctx.fillStyle = '#FCE7F3';
    ctx.strokeStyle = '#DB2777';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx - 40 + i * 40, 110, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DB2777';
    ctx.beginPath();
    ctx.arc(cx - 40 + i * 40, 110, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // 重物
  const lw = Math.max(70, Math.min(120, load / 5));
  ctx.fillStyle = '#831843';
  ctx.fillRect(cx - lw/2, 320, lw, 60);
  ctx.fillStyle = '#fff';
  ctx.font = '800 16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${load}kg`, cx, 357);
  // 動滑輪（在重物上）
  if (ropes > 1) {
    ctx.fillStyle = '#FCE7F3';
    ctx.strokeStyle = '#DB2777';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, 300, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // 繩子
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < ropes; i++) {
    const x = cx - (ropes - 1) * 18 / 2 + i * 18;
    ctx.beginPath();
    ctx.moveTo(x, 110);
    ctx.lineTo(x, ropes > 1 ? 300 : 320);
    ctx.stroke();
  }
  // 施力端
  const px = cx + 100;
  ctx.strokeStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(px, 110);
  ctx.lineTo(px, 400);
  ctx.stroke();
  ctx.fillStyle = '#16A34A';
  ctx.font = '800 16px Inter';
  ctx.fillText(`拉力 ${force.toFixed(1)}kg`, px, 430);
  ctx.font = '700 12px Inter';
  ctx.fillStyle = '#9D174D';
  ctx.fillText(`MA = ${ma} 段繩 = ${ma} 倍`, cx, 460);
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
  const apexX = 100;
  const baseX = 700;
  const apexY = baseY - (baseX - apexX) * Math.tan(rad);
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
  // 物體
  const objCX = (apexX + baseX) / 2 + 50;
  const objCY = baseY - (baseX - objCX) * Math.tan(rad);
  ctx.save();
  ctx.translate(objCX, objCY);
  ctx.rotate(-rad);
  ctx.fillStyle = '#831843';
  ctx.fillRect(-30, -40, 60, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${load}kg`, 0, -22);
  ctx.restore();
  // 施力箭頭（沿斜面方向）
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(baseX + 50, apexY + 50);
  ctx.lineTo(baseX - 30, apexY + (baseX - 30 - apexX) * Math.tan(rad) / (baseX - apexX) * 0 + apexY);
  // 簡化箭頭
  ctx.stroke();
  // 角度標示
  ctx.font = '800 16px Inter';
  ctx.fillStyle = '#DB2777';
  ctx.fillText(`${angle}°`, baseX - 50, baseY - 12);
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
  ctx.fillText(`高 ${height}m`, baseX + 60, (baseY + apexY) / 2);
  ctx.fillStyle = '#9D174D';
  ctx.font = '800 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`需 ${force.toFixed(1)}kg 推力`, 30, 50);
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
  $('e-force').textContent = r.force.toFixed(1) + ' kg';
  $('e-dist').textContent = r.effortDist.toFixed(2) + ' m';
  const energyLoad = r.load * r.loadDist;
  const energyForce = r.force * r.effortDist;
  $('e-energy').textContent = `${energyLoad.toFixed(0)} ≈ ${energyForce.toFixed(0)} kg·m`;
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
    if (id === 'load') $('v-load').textContent = el.value + ' kg';
    if (id === 'pivot') $('v-pivot').textContent = el.value < 40 ? `左側 ${el.value}%` : el.value > 60 ? `右側 ${el.value}%` : '中央';
    if (id === 'pload') $('v-pload').textContent = el.value + ' kg';
    if (id === 'rope') $('v-rope').textContent = el.value + ' 段';
    if (id === 'iload') $('v-iload').textContent = el.value + ' kg';
    if (id === 'angle') $('v-angle').textContent = el.value + '°';
    if (id === 'height') $('v-height').textContent = el.value + ' m';
    update();
  });
});
update();
