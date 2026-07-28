// 機電整合 模組 3：循跡自走車 PD 調校模擬器
// 物理模型：差速驅動運動學 + 一階馬達響應延遲 + 轉速飽和 + 5 顆離散感測器。
// 常數經全參數空間窮舉驗證（見 VERIFICATION.md）：
//   - Kd=0 時 v≥100 無解 → 想跑快必須自己發現 D 項
//   - Kp 太低過不了彎、速度太高光靠 P 穩不住 → 調校張力真實存在

const PK = 'mecha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// ---------- 已驗證常數 ----------
const L = 170, R = 95, HW = 9;                 // 直線長 / 半圓半徑 / 線半寬
const PERIM = 2 * L + 2 * Math.PI * R;
const WB = 26, FWD = 20, OFFS = [-22, -11, 0, 11, 22];
const DT = 0.04, LOSTLIM = 12, VMAX = 185, TAU = 0.30, TIMEOUT = 45;

// ---------- 幾何 ----------
function distSeg(x, y) {
  if (x < -L / 2) return Math.hypot(x + L / 2, y);
  if (x > L / 2) return Math.hypot(x - L / 2, y);
  return Math.abs(y);
}
const distLine = (x, y) => Math.abs(distSeg(x, y) - R);
function arcS(x, y) {
  if (x >= -L / 2 && x <= L / 2) return y < 0 ? (x + L / 2) : (L + Math.PI * R + (L / 2 - x));
  if (x > L / 2) { const a = Math.atan2(y, x - L / 2); return L + R * (a + Math.PI / 2); }
  let a = Math.atan2(y, x + L / 2); if (a < 0) a += 2 * Math.PI;
  return 2 * L + Math.PI * R + R * (a - Math.PI / 2);
}

// ---------- 狀態 ----------
const params = { kp: 0.10, kd: 0.000, v: 80 };
let car = null, running = false, raf = null, acc = 0, lastTs = 0;

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const nextBtn = document.getElementById('next-btn'), progEl = document.getElementById('prog');

function newCar() {
  return { x: -L / 2, y: -R, th: 0, pe: 0, lost: 0, prog: 0, ps: 0, t: 0,
           al: params.v, ar: params.v, zig: 0, pes: 0, sensors: [0,0,0,0,0], e: 0,
           done: false, failed: false, why: '' };
}

// ---------- 單步物理 ----------
function step(c) {
  let sum = 0, cnt = 0;
  c.sensors = OFFS.map(off => {
    const sx = c.x + FWD * Math.cos(c.th) - off * Math.sin(c.th);
    const sy = c.y + FWD * Math.sin(c.th) + off * Math.cos(c.th);
    const on = distLine(sx, sy) < HW ? 1 : 0;
    if (on) { sum += off; cnt++; }
    return on;
  });

  let e;
  if (cnt === 0) {
    c.lost++;
    if (c.lost > LOSTLIM) { c.failed = true; c.why = '脫線'; return; }
    e = c.pe;
  } else { c.lost = 0; e = sum / cnt; }
  c.e = e;

  if (e !== 0) { const s = Math.sign(e); if (s * c.pes < 0) c.zig++; c.pes = s; }

  const om = params.kp * e + params.kd * (e - c.pe) / DT;
  c.pe = e;

  let cl = params.v - om * WB / 2, cr = params.v + om * WB / 2;
  cl = Math.max(-VMAX, Math.min(VMAX, cl));
  cr = Math.max(-VMAX, Math.min(VMAX, cr));
  c.al += (cl - c.al) * (DT / TAU);          // 馬達響應延遲
  c.ar += (cr - c.ar) * (DT / TAU);

  const v = (c.al + c.ar) / 2, w = (c.ar - c.al) / WB;
  c.x += v * Math.cos(c.th) * DT;
  c.y += v * Math.sin(c.th) * DT;
  c.th += w * DT;
  c.t += DT;

  const s2 = arcS(c.x, c.y);
  let d = s2 - c.ps;
  if (d < -PERIM / 2) d += PERIM;
  if (d > PERIM / 2) d -= PERIM;
  c.prog += d; c.ps = s2;

  if (c.prog >= PERIM) { c.done = true; return; }
  if (c.t > TIMEOUT) { c.failed = true; c.why = '逾時'; }
}

// ---------- 繪圖 ----------
function trackPath(g) {
  g.beginPath();
  g.moveTo(-L / 2, -R);
  g.lineTo(L / 2, -R);
  g.arc(L / 2, 0, R, -Math.PI / 2, Math.PI / 2);
  g.lineTo(-L / 2, R);
  g.arc(-L / 2, 0, R, Math.PI / 2, 3 * Math.PI / 2);
  g.closePath();
}

function draw() {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(1.08, 1.08);

  // 賽道底（膠帶）
  ctx.lineWidth = HW * 2; ctx.strokeStyle = '#0b1220'; ctx.lineCap = 'round';
  trackPath(ctx); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = '#334155'; ctx.setLineDash([8, 8]);
  trackPath(ctx); ctx.stroke(); ctx.setLineDash([]);

  // 起點線
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-L / 2, -R - 16); ctx.lineTo(-L / 2, -R + 16); ctx.stroke();

  const c = car;
  if (c) {
    ctx.save();
    ctx.translate(c.x, c.y); ctx.rotate(c.th);
    // 車體
    ctx.fillStyle = c.failed ? '#7f1d1d' : (c.done ? '#166534' : '#F97316');
    ctx.fillRect(-16, -13, 32, 26);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -17, 8, 6); ctx.fillRect(4, -17, 8, 6);
    ctx.fillRect(-12, 11, 8, 6);  ctx.fillRect(4, 11, 8, 6);
    // 感測器
    c.sensors.forEach((on, i) => {
      ctx.fillStyle = on ? '#FDE047' : '#475569';
      ctx.beginPath(); ctx.arc(FWD, -OFFS[i], 3.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  ctx.restore();

  // 狀態文字
  ctx.font = '700 13px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Kp ${params.kp.toFixed(2)}   Kd ${params.kd.toFixed(3)}   v ${params.v}`, 14, 24);
  if (c && (c.done || c.failed)) {
    ctx.font = '900 26px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = c.done ? '#22c55e' : '#ef4444';
    ctx.fillText(c.done ? `✓ 完成一圈  ${c.t.toFixed(2)} s` : `✗ ${c.why}`, cv.width / 2, 46);
  }
}

// ---------- HUD ----------
function updateHUD() {
  const c = car;
  document.getElementById('tVal').textContent = (c ? c.t : 0).toFixed(2) + ' s';
  document.getElementById('pVal').textContent = Math.min(100, Math.round((c ? c.prog : 0) / PERIM * 100)) + ' %';
  document.getElementById('eVal').textContent = c ? c.e.toFixed(1) : '0';
  document.getElementById('zVal').textContent = c ? c.zig : 0;
  document.getElementById('leds').innerHTML = OFFS.map((o, i) =>
    `<div class="sensor-led ${c && c.sensors[i] ? 'on' : ''}">S${i + 1}</div>`).join('');
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_lap',  text: '讓車子完整跑完一圈', hint: 'Kp 太小過不了彎；先用預設速度 80 試試',
    test: (r) => r.done },
  { id: 'q_fast', text: '在 12 秒內完成一圈', hint: '把基礎速度往上調，但要同時穩得住',
    test: (r) => r.done && r.t <= 12 },
  { id: 'q_pd',   text: '在基礎速度 ≥ 100 的情況下完成一圈', hint: '光靠 Kp 在高速下會穩不住——試著加入 Kd',
    test: (r) => r.done && r.v >= 100 },
];
const done = new Set(loadP().module3_quests || []);
let best = loadP().module3_best ?? null;

function renderQuests() {
  document.getElementById('quests').innerHTML = QUESTS.map(q => {
    const d = done.has(q.id);
    return `<li style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;
      background:${d ? '#dcfce7' : '#f8fafc'};border-left:4px solid ${d ? '#22c55e' : '#cbd5e1'}">
      <span style="font-size:18px">${d ? '✅' : '⬜'}</span>
      <div><div style="font-weight:700;font-size:14px;color:${d ? '#15803d' : '#1e293b'}">${q.text}</div>
      <div style="font-size:12.5px;color:#64748b;margin-top:2px">💡 ${q.hint}</div></div></li>`;
  }).join('');
  progEl.textContent = `挑戰完成 ${done.size} / ${QUESTS.length}`;
  document.getElementById('best').textContent = best == null ? '—' : best.toFixed(2) + ' s';
}

function finish() {
  running = false;
  document.getElementById('run').textContent = '▶ 再跑一次';
  const c = car;
  const r = { done: c.done, t: c.t, v: params.v, zig: c.zig };
  const v = document.getElementById('verdict');

  if (c.done) {
    if (best == null || c.t < best) best = c.t;
    if (c.zig > 25) { v.className = 'verdict warn'; v.textContent = `🟡 跑完了（${c.t.toFixed(2)} s），但蛇行 ${c.zig} 次——加一點 Kd 會更順，也會更快。`; }
    else { v.className = 'verdict good'; v.textContent = `✅ 完成一圈！${c.t.toFixed(2)} 秒，蛇行 ${c.zig} 次。`; }
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
  } else if (c.why === '脫線') {
    v.className = 'verdict bad';
    v.textContent = c.zig > 12
      ? `❌ 蛇行後脫線（跑到 ${Math.round(c.prog / PERIM * 100)}%）：修正過頭了，加 Kd 或降 Kp。`
      : `❌ 在彎道脫線（跑到 ${Math.round(c.prog / PERIM * 100)}%）：修正不夠，調高 Kp 或降低速度。`;
  } else {
    v.className = 'verdict bad';
    v.textContent = `❌ 逾時未完成（跑到 ${Math.round(c.prog / PERIM * 100)}%）：速度太低或一直在原地修正。`;
  }

  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  const p = loadP();
  p.module3_best = best;
  if (newly) {
    p.module3_quests = Array.from(done);
    if (done.size === QUESTS.length) {
      p.module3 = true;
      nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
      if (typeof showToast === 'function') showToast('🎉 三個挑戰都完成了！', 'good');
    } else if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p);
  renderQuests();
  draw(); updateHUD();
}

// ---------- 動畫迴圈 ----------
function loop(ts) {
  if (!running) return;
  if (!lastTs) lastTs = ts;
  acc += Math.min(0.1, (ts - lastTs) / 1000);
  lastTs = ts;
  while (acc >= DT) {
    step(car); acc -= DT;
    if (car.done || car.failed) { draw(); updateHUD(); finish(); return; }
  }
  draw(); updateHUD();
  raf = requestAnimationFrame(loop);
}

function start() {
  if (raf) cancelAnimationFrame(raf);
  car = newCar(); running = true; acc = 0; lastTs = 0;
  document.getElementById('run').textContent = '⏸ 跑動中…';
  document.getElementById('verdict').className = 'verdict warn';
  document.getElementById('verdict').textContent = '車子跑動中…';
  raf = requestAnimationFrame(loop);
}

function reset() {
  if (raf) cancelAnimationFrame(raf);
  running = false; car = newCar(); car.sensors = [0,0,0,0,0];
  document.getElementById('run').textContent = '▶ 開始跑';
  document.getElementById('verdict').className = 'verdict warn';
  document.getElementById('verdict').textContent = '按「開始跑」試試看目前的參數';
  draw(); updateHUD();
}

// ---------- 綁定 ----------
document.getElementById('run').addEventListener('click', start);
document.getElementById('reset').addEventListener('click', reset);

const sKp = document.getElementById('sKp'), sKd = document.getElementById('sKd'), sV = document.getElementById('sV');
sKp.addEventListener('input', () => { params.kp = +sKp.value / 100; document.getElementById('vKp').textContent = params.kp.toFixed(2); draw(); });
sKd.addEventListener('input', () => { params.kd = +sKd.value / 1000; document.getElementById('vKd').textContent = params.kd.toFixed(3); draw(); });
sV.addEventListener('input',  () => { params.v  = +sV.value;         document.getElementById('vV').textContent  = params.v; draw(); });

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
reset();
