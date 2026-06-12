// 機構運動 模組 4：三合一機構模擬器
const PK = 'mech_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cv = document.getElementById('mech-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);

let mode = 'crank';
let angle = 0;
const SPEEDS = [0, 0.01, 0.025, 0.04, 0.06, 0.085];

function drawCrank() {
  const r = parseInt($('s-r').value);
  const l = parseInt($('s-l').value);
  const speed = parseInt($('s-speed').value);
  angle += SPEEDS[speed];
  const cx = 180, cy = 250;
  // 機架線
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, cy);
  ctx.lineTo(720, cy);
  ctx.stroke();
  // 曲柄圓盤
  ctx.fillStyle = '#CCFBF1';
  ctx.strokeStyle = '#14B8A6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F766E';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  // 曲柄銷
  const px = cx + r * Math.cos(angle);
  const py = cy + r * Math.sin(angle);
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();
  // 連桿
  // 計算滑塊位置（滑塊在水平軌道上）
  const dx = px - cx;
  const slidedx = Math.sqrt(l * l - py * py + 2 * py * cy - cy * cy);
  let sx = cx + dx + slidedx; // 簡化
  // 用正確公式
  const a = Math.cos(angle) * r;
  const b = Math.sqrt(l * l - Math.pow(r * Math.sin(angle), 2));
  sx = cx + a + b;
  // 連桿
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(sx, cy);
  ctx.stroke();
  // 滑塊
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(sx - 25, cy - 25, 50, 50);
  // 滑軌
  ctx.strokeStyle = '#64748b';
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + r + 20, cy - 30);
  ctx.lineTo(W - 40, cy - 30);
  ctx.moveTo(cx + r + 20, cy + 30);
  ctx.lineTo(W - 40, cy + 30);
  ctx.stroke();
  ctx.setLineDash([]);
  // 軌道顯示
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`角度 ${(angle * 180 / Math.PI % 360).toFixed(0)}°`, 16, 30);
  ctx.fillText(`滑塊位置 x = R cos θ + √(L² - R²sin²θ)`, 16, 55);
  ctx.fillText(`= ${(sx - cx).toFixed(1)} px`, 16, 80);
  // 行程指示
  ctx.fillStyle = '#DC2626';
  ctx.fillText(`行程 = 2R = ${2 * r} px`, 16, 110);
}

function drawCam() {
  const ecc = parseFloat($('s-ecc').value);
  const speed = parseInt($('s-cspeed').value);
  angle += SPEEDS[speed];
  const cx = 280, cy = 250;
  // 旋轉的凸輪（橢圓）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const a = 100;
  const b = 100 * (1 - ecc);
  ctx.fillStyle = '#CCFBF1';
  ctx.strokeStyle = '#14B8A6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F766E';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 從動件位置：凸輪上方接觸點的 Y
  // 旋轉橢圓上方點到中心的最大距離
  // 公式：r(θ) = a·b / √(a²sin²θ + b²cos²θ) - 簡化用上方
  // 此處用簡化模型：垂直線與旋轉橢圓的交點
  // 從動件接觸 Y 座標：找凸輪輪廓最上方點
  // 簡化：a 和 b 旋轉後在垂直方向的投影
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const top = Math.sqrt(a * a * sa * sa + b * b * ca * ca);
  const followerY = cy - top - 20;
  // 從動件
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(cx - 12, followerY, 24, 20);
  // 從動件桿
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, followerY);
  ctx.lineTo(cx, 50);
  ctx.stroke();
  // 上方支架
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 50, 30, 100, 14);
  // 軌道
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`凸輪角 ${(angle * 180 / Math.PI % 360).toFixed(0)}°`, 16, 30);
  ctx.fillText(`偏心率 ${ecc.toFixed(2)} （越大上下幅度越大）`, 16, 55);
  ctx.fillText(`從動件位置 = ${(cy - followerY).toFixed(1)} px`, 16, 80);
}

function drawGear() {
  const n1 = parseInt($('s-n1').value);
  const n2 = parseInt($('s-n2').value);
  angle += 0.02;
  const cx1 = 220, cy1 = 250;
  const r1 = 80;
  const r2 = 80 * n2 / n1;
  const cx2 = cx1 + r1 + r2 + 4;
  const cy2 = cy1;

  function drawGearShape(cx, cy, r, teeth, rot, color, edge) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const tx = Math.cos(a) * r;
      const ty = Math.sin(a) * r;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(a);
      ctx.fillRect(-2, 0, 4, 10);
      ctx.restore();
    }
    ctx.fillStyle = '#0F766E';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    // 旋轉指示線
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawGearShape(cx1, cy1, r1, n1, angle, '#CCFBF1', '#14B8A6');
  drawGearShape(cx2, cy2, r2, n2, -angle * (n1 / n2), '#FEF3C7', '#F59E0B');
  // 標籤
  ctx.fillStyle = '#0F766E';
  ctx.font = '700 14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`大齒輪 N₁=${n1}`, cx1, cy1 + r1 + 30);
  ctx.fillStyle = '#92400E';
  ctx.fillText(`小齒輪 N₂=${n2}`, cx2, cy2 + r2 + 25);
  // 計算
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`齒數比 N₁:N₂ = ${n1}:${n2}`, 16, 30);
  ctx.fillText(`速度比 ω₂/ω₁ = ${(n1 / n2).toFixed(2)} 倍`, 16, 55);
  ctx.fillText(`扭力比 T₂/T₁ = ${(n2 / n1).toFixed(2)} 倍`, 16, 80);
  ctx.fillStyle = '#DC2626';
  ctx.fillText(n1 > n2 ? '→ 增速減扭' : '→ 減速增扭', 16, 105);
}

function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  if (mode === 'crank') {
    drawCrank();
    $('info').textContent = '運動類型：圓周旋轉 → 直線往復';
    $('info2').textContent = `R=${$('s-r').value}px, L=${$('s-l').value}px`;
  } else if (mode === 'cam') {
    drawCam();
    $('info').textContent = '運動類型：圓周旋轉 → 規律抬升 / 落下';
    $('info2').textContent = `偏心率=${$('s-ecc').value}`;
  } else if (mode === 'gear') {
    drawGear();
    $('info').textContent = '運動類型：旋轉動力傳遞與變速';
    $('info2').textContent = `${$('s-n1').value}:${$('s-n2').value} 齒比`;
  }
  requestAnimationFrame(loop);
}

document.querySelectorAll('.mech-tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.mech-tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  mode = t.dataset.m;
  angle = 0;
  document.getElementById('crank-controls').style.display = mode === 'crank' ? '' : 'none';
  document.getElementById('cam-controls').style.display = mode === 'cam' ? '' : 'none';
  document.getElementById('gear-controls').style.display = mode === 'gear' ? '' : 'none';
  const p = loadP();
  p.module4 = true;
  saveP(p);
}));

['r', 'l', 'speed', 'ecc', 'cspeed', 'n1', 'n2'].forEach(id => {
  const el = $(`s-${id}`);
  if (el) el.addEventListener('input', () => {
    const v = el.value;
    const lbl = $(`v-${id}`);
    if (lbl) {
      if (id === 'speed' || id === 'cspeed') lbl.textContent = ['', '極慢', '慢', '中', '快', '極快'][v];
      else if (id === 'ecc') lbl.textContent = parseFloat(v).toFixed(2);
      else if (id === 'r' || id === 'l') lbl.textContent = v + ' px';
      else lbl.textContent = v;
    }
  });
});
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});