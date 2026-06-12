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
let bottlePos = { x: 330, y: 380 };
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

  // 大臂——仰角約定：0°=水平向右、正值抬升（原本的 sin/cos 方向顛倒,0° 時手臂會插進地板）
  const sx = baseX, sy = baseY - 32;
  const elev1 = a2 * Math.PI / 180;
  const ex = sx + armLen1 * Math.cos(elev1);
  const ey = sy - armLen1 * Math.sin(elev1);
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

  // 小臂——相對大臂的彎曲角:90°=順著大臂延伸,小於 90° 往下彎、大於 90° 往上翹
  const elev2 = elev1 + (a3 - 90) * Math.PI / 180;
  const fx = ex + armLen2 * Math.cos(elev2);
  const fy = ey - armLen2 * Math.sin(elev2);
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

  drawSyringes();
}

// 對應實體「針筒液壓手臂」教具：每一軸就是一支主針筒，拉滑桿＝推拉活塞。
// 讓學生把模擬器的 4 個滑桿直接對應到實作時手上的 4 支針筒。
function drawSyringes() {
  const axes = [
    { label: '①基座', el: $('s1'), color: '#f87171' },
    { label: '②大臂', el: $('s2'), color: '#fb923c' },
    { label: '③小臂', el: $('s3'), color: '#38bdf8' },
    { label: '④夾爪', el: $('s4'), color: '#4ade80' },
  ];
  const bw = 20, bh = 70, gapX = 50;
  const x0 = W - 210, y0 = 42;
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 11px "Noto Sans TC"';
  ctx.textAlign = 'center';
  ctx.fillText('💉 實體針筒對應（滑桿＝推活塞）', x0 + gapX * 1.5 + bw / 2, y0 + bh + 40);
  axes.forEach((ax, i) => {
    const v = parseFloat(ax.el.value), mn = parseFloat(ax.el.min), mx = parseFloat(ax.el.max);
    const norm = (v - mn) / ((mx - mn) || 1);
    const x = x0 + i * gapX;
    // 液體（活塞推入越多，筒內液體越少＝被壓去出口）
    const inner = bh - 8;
    const liquidH = (1 - norm) * (inner - 14) + 10;
    const py = y0 + bh - 3 - liquidH; // 活塞盤位置
    ctx.fillStyle = ax.color;
    ctx.globalAlpha = .8;
    ctx.fillRect(x + 2, py, bw - 4, liquidH);
    ctx.globalAlpha = 1;
    // 筒身（半透明）
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x, y0, bw, bh, 4); ctx.fill(); ctx.stroke();
    // 出口嘴
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + bw / 2 - 2, y0 + bh, 4, 7);
    // 活塞盤＋推桿＋拇指板（推入越多，拇指板越貼近筒口）
    const padY = y0 - 8 - (1 - norm) * 30;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 1.5, py - 5, bw - 3, 5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + bw / 2 - 2.5, padY + 4, 5, Math.max(4, py - padY - 4));
    ctx.fillRect(x + bw / 2 - 8, padY, 16, 5);
    // 標籤
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px "Noto Sans TC"';
    ctx.textAlign = 'center';
    ctx.fillText(ax.label, x + bw / 2, y0 + bh + 22);
  });
  ctx.restore();
}

function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  draw();
  requestAnimationFrame(loop);
}

document.querySelectorAll('input').forEach(i => i.addEventListener('input', () => {}));
$('btn-reset').addEventListener('click', () => {
  $('s1').value = 0; $('s2').value = 45; $('s3').value = 90; $('s4').value = 30;
  bottleHeld = false;
  bottlePos = { x: 330, y: 380 };
});
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});