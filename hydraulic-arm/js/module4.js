// 液壓手臂 模組 4：4 軸控制
const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const cv = document.getElementById('ha-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);

const armLen1 = 130; // 大臂
const armLen2 = 110; // 小臂

let bottleHeld = false;
let bottlePos = { x: 120, y: 380 };
const targetPos = { x: 640, y: 380 };

function draw() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  // 地面
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 420, W, H);

  const a1 = parseFloat($('s1').value);
  const a2 = parseFloat($('s2').value);
  const a3 = parseFloat($('s3').value);
  const g = parseFloat($('s4').value);
  $('v1').textContent = a1 + '°';
  $('v2').textContent = a2 + '°';
  $('v3').textContent = a3 + '°';
  $('v4').textContent = g + ' mm';

  // 基座
  const baseX = W / 2 + a1 * 2.5;
  const baseY = 400;
  ctx.fillStyle = '#075985';
  ctx.fillRect(baseX - 50, baseY - 30, 100, 30);
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(baseX - 40, baseY - 38, 80, 12);

  // 大臂
  const sx = baseX, sy = baseY - 32;
  const a2rad = -a2 * Math.PI / 180;
  const ex = sx + armLen1 * Math.sin(a2rad);
  const ey = sy + armLen1 * Math.cos(a2rad);
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.fillStyle = '#075985';
  ctx.beginPath();
  ctx.arc(sx, sy, 12, 0, Math.PI * 2);
  ctx.fill();

  // 小臂
  const a3total = a2rad + (a3 - 90) * Math.PI / 180;
  const fx = ex + armLen2 * Math.sin(a3total);
  const fy = ey + armLen2 * Math.cos(a3total);
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(fx, fy);
  ctx.stroke();
  ctx.fillStyle = '#075985';
  ctx.beginPath();
  ctx.arc(ex, ey, 10, 0, Math.PI * 2);
  ctx.fill();

  // 夾爪
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 5;
  const grpO = g / 2;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx - grpO, fy + 25);
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx + grpO, fy + 25);
  ctx.stroke();

  // 目標位置（綠色）
  ctx.fillStyle = 'rgba(34,197,94,.3)';
  ctx.beginPath();
  ctx.arc(targetPos.x, targetPos.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(targetPos.x, targetPos.y, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#22c55e';
  ctx.font = '700 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('目標', targetPos.x, targetPos.y - 35);

  // 瓶子
  if (bottleHeld) {
    bottlePos.x = fx;
    bottlePos.y = fy + 25;
  }
  // 檢查抓取
  const distToBottle = Math.hypot(fx - bottlePos.x, (fy + 25) - bottlePos.y);
  if (!bottleHeld && distToBottle < 20 && g <= 35) {
    bottleHeld = true;
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  } else if (bottleHeld && g > 40) {
    bottleHeld = false;
    bottlePos.y = 380;
  }

  ctx.fillStyle = '#84CC16';
  ctx.fillRect(bottlePos.x - 12, bottlePos.y - 30, 24, 35);
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(bottlePos.x - 6, bottlePos.y - 36, 12, 8);

  // 檢查目標
  const distToTarget = Math.hypot(bottlePos.x - targetPos.x, bottlePos.y - targetPos.y);
  if (distToTarget < 25 && !bottleHeld) {
    $('verdict').className = 'verdict good';
    $('verdict').textContent = '🏆 成功！瓶子搬到目標位置。';
    const p = loadP(); p.module4 = true; p.module4_target = true; saveP(p);
  } else if (bottleHeld) {
    $('verdict').className = 'verdict good';
    $('verdict').textContent = '✓ 抓住瓶子！把它移到目標位置。';
  } else {
    $('verdict').className = 'verdict warn';
    $('verdict').textContent = '🎯 把夾爪對準瓶子，再夾起來移過去。';
  }

  // 狀態
  ctx.fillStyle = '#0EA5E9';
  ctx.font = '700 13px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`末端位置：(${fx.toFixed(0)}, ${fy.toFixed(0)})`, 14, 30);
  ctx.fillText(`夾爪狀態：${bottleHeld ? '🟢 抓住' : '⚪ 未抓'}`, 14, 55);
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

document.querySelectorAll('input').forEach(i => i.addEventListener('input', () => {}));
$('btn-reset').addEventListener('click', () => {
  $('s1').value = 0; $('s2').value = 45; $('s3').value = 90; $('s4').value = 30;
  bottleHeld = false;
  bottlePos = { x: 120, y: 380 };
});
loop();
