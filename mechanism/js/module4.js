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
  const cx = 140, cy = 230;
  // 機架線
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, cy);
  ctx.lineTo(720, cy);
  ctx.stroke();
  // 曲柄銷的圓形軌跡（虛線）＋曲柄桿
  ctx.strokeStyle = 'rgba(20,184,166,.6)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#0F766E';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  // 曲柄銷
  const px = cx + r * Math.cos(angle);
  const py = cy + r * Math.sin(angle);
  ctx.strokeStyle = '#14B8A6';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();
  // 計算滑塊位置（滑塊在水平軌道上）：x = R cos θ + √(L² − R² sin² θ)
  const a = Math.cos(angle) * r;
  const b = Math.sqrt(l * l - Math.pow(r * Math.sin(angle), 2));
  const sx = cx + a + b;
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
  const railX0 = cx + l - r - 30;           // 滑塊最左邊的位置（θ = 180°）
  const railX1 = Math.min(W - 10, cx + l + r + 30);
  ctx.moveTo(railX0, cy - 30);
  ctx.lineTo(railX1, cy - 30);
  ctx.moveTo(railX0, cy + 30);
  ctx.lineTo(railX1, cy + 30);
  ctx.stroke();
  ctx.setLineDash([]);
  // 軌道顯示
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 20px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`曲柄角 θ = ${(angle * 180 / Math.PI % 360).toFixed(0)}°`, 16, 30);
  ctx.fillText(`滑塊 x = R cos θ + √(L² − R²sin²θ) = ${(sx - cx).toFixed(1)} px`, 16, 58);
  // 行程指示
  ctx.fillStyle = '#F87171';
  ctx.fillText(`行程 = 2R = ${2 * r} px`, 16, 86);
  drawCrankTrace((sx - cx - l) / r, Math.cos(angle));
}

// 滑塊位移–時間曲線（實線），並以虛線疊上正弦參考（R cos θ）：L 越長兩條越貼近
const crankTrace = [];
const TRACE_N = 330;
function drawCrankTrace(d, ref) {
  crankTrace.push({ d, ref });
  if (crankTrace.length > TRACE_N) crankTrace.shift();
  const x0 = 60, x1 = W - 40, yMid = 430, amp = 40;
  const step = (x1 - x0) / (TRACE_N - 1);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0, yMid); ctx.lineTo(x1, yMid);
  ctx.moveTo(x0, yMid - amp - 8); ctx.lineTo(x0, yMid + amp + 8);
  ctx.stroke();
  const plot = (key, color, dash) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dash);
    ctx.beginPath();
    crankTrace.forEach((p, i) => {
      const y = yMid - p[key] * amp;
      if (i === 0) ctx.moveTo(x0, y); else ctx.lineTo(x0 + i * step, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  };
  plot('ref', '#64748b', [5, 4]);
  plot('d', '#14B8A6', []);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 17px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('滑塊位移–時間（實線）　正弦參考（虛線）', x0 + 6, yMid - amp - 14);
}

// 凸輪：橢圓凸輪＋平底從動件（從動件只能上下滑）。平底從動件的高度＝凸輪在垂直方向的最大伸展量，
// 接觸點會左右移動，所以平底要夠寬。橢圓每轉一圈從動件上下 2 次，升程＝長半軸 − 短半軸。
function drawCam() {
  const k = parseFloat($('s-ecc').value);
  const speed = parseInt($('s-cspeed').value);
  angle += SPEEDS[speed];
  const cx = 300, cy = 300;
  const a = 100, b = 100 * (1 - k);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#CCFBF1'; ctx.strokeStyle = '#14B8A6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(a * 0.8, 0); ctx.stroke();
  ctx.fillStyle = '#0F766E'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const h = Math.sqrt(a * a * sa * sa + b * b * ca * ca);        // 垂直方向最大伸展
  const xc = -(a * a - b * b) * sa * ca / h;                       // 接觸點水平位置
  const faceW = 2 * ((a * a - b * b) / (a + b)) + 40;              // 平底寬度（涵蓋接觸點左右移動範圍）
  const faceY = cy - h;
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(cx - faceW / 2, faceY - 14, faceW, 14);
  ctx.strokeStyle = '#0F766E'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx, faceY - 14); ctx.lineTo(cx, 60); ctx.stroke();
  // 導套
  ctx.fillStyle = '#475569'; ctx.fillRect(cx - 22, 70, 14, 50); ctx.fillRect(cx + 8, 70, 14, 50);
  // 接觸點
  ctx.fillStyle = '#F43F5E'; ctx.beginPath(); ctx.arc(cx + xc, faceY, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 20px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`凸輪角 ${(angle * 180 / Math.PI % 360).toFixed(0)}°`, 470, 40);
  ctx.fillText(`升程 = 長半軸 − 短半軸`, 470, 70);
  ctx.fillText(`　　 = ${a} − ${b.toFixed(0)} = ${(a - b).toFixed(0)} px`, 470, 98);
  ctx.fillText(`從動件高度 ${h.toFixed(0)} px`, 470, 128);
  ctx.fillStyle = '#94a3b8'; ctx.font = '600 17px "Noto Sans TC", sans-serif';
  ctx.fillText('橢圓凸輪轉一圈，從動件上下 2 次', 470, 160);
  ctx.fillText('紅點＝接觸點（會左右移動）', 470, 186);
}

// 齒輪組：漸開線齒形（gear-geometry.js），兩輪模數相同、中心距 = m(N₁+N₂)/2，從動輪錯開半個齒距讓齒對齒槽
const gearCache = {};
function gearPath(z, m) {
  const key = z + ':' + m.toFixed(3);
  if (!gearCache[key]) {
    const g = GearGeom.gearOutline(z, m);
    const p = new Path2D();
    g.pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y));
    p.closePath();
    gearCache[key] = { g, p };
  }
  return gearCache[key];
}
function drawGear() {
  const n1 = parseInt($('s-n1').value);
  const n2 = parseInt($('s-n2').value);
  angle += 0.012;
  // 模數依畫面寬度決定（兩輪永遠同一個模數）
  const m = Math.min(9, 640 / (n1 + n2 + 2), 400 / (Math.max(n1, n2) + 2));
  const a = GearGeom.centerDistance(m, n1, n2);
  const G1 = gearPath(n1, m), G2 = gearPath(n2, m);
  const cy = 280;
  const cx1 = (W - (G1.g.ra + a + G2.g.ra)) / 2 + G1.g.ra;
  const cx2 = cx1 + a;
  const th1 = angle, th2 = GearGeom.drivenAngle(angle, n1, n2);
  function one(G, cx, rot, fill, edge) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 2;
    ctx.fill(G.p); ctx.stroke(G.p);
    // 節圓（虛線）
    ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(15,23,42,.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, G.g.rp, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // 軸與旋轉指示線（指向第 0 齒中心）
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(G.g.rf * 0.8, 0); ctx.stroke();
    ctx.fillStyle = '#0F766E'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  one(G1, cx1, th1, '#CCFBF1', '#0F766E');
  one(G2, cx2, th2, '#FEF3C7', '#B45309');
  // 連心線與節點
  ctx.strokeStyle = 'rgba(148,163,184,.8)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(cx1, cy); ctx.lineTo(cx2, cy); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#F43F5E'; ctx.beginPath(); ctx.arc(cx1 + G1.g.rp, cy, 4, 0, Math.PI * 2); ctx.fill();
  // 標籤
  ctx.font = '700 19px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5EEAD4';
  ctx.fillText(`主動輪 N₁=${n1}`, cx1, Math.min(H - 12, cy + G1.g.ra + 26));
  ctx.fillStyle = '#FCD34D';
  ctx.fillText(`從動輪 N₂=${n2}`, cx2, Math.min(H - 12, cy + G2.g.ra + 26));
  ctx.fillStyle = '#14B8A6';
  ctx.font = '700 20px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`齒輪比 i = N₂/N₁ = ${n2}/${n1} = ${(n2 / n1).toFixed(2)}`, 16, 30);
  ctx.fillText(`速度比 ω₂/ω₁ = ${(n1 / n2).toFixed(2)}　扭力比 T₂/T₁ = ${(n2 / n1).toFixed(2)}`, 16, 58);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 17px "Noto Sans TC", sans-serif';
  ctx.fillText(`同模數 m，中心距 = m(N₁+N₂)/2；齒對齒槽、紅點＝節點`, 16, 84);
  ctx.fillStyle = '#F87171';
  ctx.font = '700 19px "Noto Sans TC", sans-serif';
  ctx.fillText(n1 === n2 ? '→ 等速、只改變方向' : n1 > n2 ? '→ 增速減扭（從動輪轉得快）' : '→ 減速增扭（從動輪轉得慢）', 16, 110);
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
    $('info2').textContent = `扁度 k=${$('s-ecc').value}`;
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
  crankTrace.length = 0;
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