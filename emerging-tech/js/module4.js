// 新興科技 模組 4：物聯網 × 綠建築 24 小時能源模擬
// 模型為教學用簡化版：以典型上學日的室外溫度、日照、人員在室曲線，
// 比較「全時開啟」基準與「感測器驅動控制」的耗電差異，並計算舒適度違規時數。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// ---------- 環境曲線（典型夏季上學日） ----------
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const outdoorT = HOURS.map(h => 24 + 8 * Math.sin((h - 9) / 24 * 2 * Math.PI));      // 約 16–32 °C，14 時最熱
const daylight = HOURS.map(h => (h < 6 || h > 18) ? 0 : Math.round(100 * Math.sin((h - 6) / 12 * Math.PI)));
const occupancy = HOURS.map(h => (h >= 8 && h <= 16) ? (h === 12 ? 0.3 : 1) : 0);    // 午休人少

const AC_ON_HOURS = HOURS.filter(h => h >= 8 && h <= 17);
const T_SET = 26, T_HOT = 30, LUX_NEED = 40;
const T_ECO = 31, LUX_DIM = 25;   // 積極策略門檻（會踩到舒適底線）

// ---------- 感測器 ----------
const SENSORS = [
  { id: 'temp',  ico: '🌡️', name: '溫度感測器',   cost: 300,  meta: '解鎖：溫控空調' },
  { id: 'pir',   ico: '🚶', name: '人體紅外線',   cost: 450,  meta: '解鎖：無人自動關閉' },
  { id: 'lux',   ico: '☀️', name: '照度感測器',   cost: 380,  meta: '解鎖：日光調光' },
  { id: 'power', ico: '⚡', name: '電流感測器',   cost: 600,  meta: '解鎖：用電監看（不直接省電）' },
];

// ---------- 控制策略 ----------
const RULES = [
  { id: 'r_pir',  need: 'pir',  label: '無人關閉：偵測不到人時，空調與照明全關', desc: '午休與課後自動斷電。安全牌，省最多。' },
  { id: 'r_temp', need: 'temp', label: '溫控空調：室外低於 26°C 才不開空調', desc: '只在涼爽時段關機，不影響舒適。' },
  { id: 'r_eco',  need: 'temp', label: '⚡ 弱冷模式：室外低於 31°C 都不開空調', desc: '積極節能，但最熱的時段可能讓人受不了。啟用時會覆蓋上一條。' },
  { id: 'r_lux',  need: 'lux',  label: '日光調光：自然光充足（照度 ≥ 40）時關電燈', desc: '照度達標才關，看得清楚。' },
  { id: 'r_dim',  need: 'lux',  label: '⚡ 深度調光：照度 ≥ 25 就關電燈', desc: '省更多，但陰天或早晚可能太暗。啟用時會覆蓋上一條。' },
];

const state = { sensors: new Set(loadP().module4_sensors || []), rules: new Set(loadP().module4_rules || []) };

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

// ---------- 模擬 ----------
function simulate(useRules) {
  let kwh = 0, discomfort = 0;
  const trace = [];
  for (const h of HOURS) {
    const inAcWindow = AC_ON_HOURS.includes(h);
    let ac = inAcWindow, light = inAcWindow;

    if (useRules) {
      if (state.rules.has('r_pir') && occupancy[h] === 0) { ac = false; light = false; }
      // 積極策略覆蓋保守策略
      if (state.rules.has('r_eco')) { if (outdoorT[h] < T_ECO) ac = false; }
      else if (state.rules.has('r_temp')) { if (outdoorT[h] < T_SET) ac = false; }
      if (state.rules.has('r_dim')) { if (daylight[h] >= LUX_DIM) light = false; }
      else if (state.rules.has('r_lux')) { if (daylight[h] >= LUX_NEED) light = false; }
    }

    // 耗電：空調隨室外溫度上升而變重
    const acKwh = ac ? 0.45 + 0.55 * Math.max(0, outdoorT[h] - T_SET) : 0;
    const liKwh = light ? 0.50 : 0;
    kwh += acKwh + liKwh;

    // 舒適度：有人時太熱或太暗才算違規
    if (occupancy[h] > 0) {
      if (!ac && outdoorT[h] > T_HOT) discomfort++;
      if (!light && daylight[h] < LUX_NEED) discomfort++;
    }
    trace.push({ h, ac, light, kwh: acKwh + liKwh });
  }
  return { kwh, discomfort, trace };
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_save30', text: '讓總用電比基準省下 30% 以上', hint: '無人關閉的效果最大',
    test: (r) => r.savePct >= 30 },
  { id: 'q_comfort', text: '省下 30% 以上，且舒適度違規為 0', hint: '別在有人又熱的時段關掉空調',
    test: (r) => r.savePct >= 30 && r.discomfort === 0 },
  { id: 'q_lean', text: '只用 2 個感測器就省下 25% 以上', hint: '想想哪兩個 CP 值最高',
    test: (r) => state.sensors.size <= 2 && r.savePct >= 25 },
];
const done = new Set(loadP().module4_quests || []);

// ---------- 繪圖 ----------
function render(sim, base) {
  const W = cv.width, H = cv.height, pad = { l: 44, r: 14, t: 38, b: 40 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const maxK = Math.max(...base.trace.map(t => t.kwh), 1);
  const bw = pw / 24;
  const X = h => pad.l + h * bw;
  const Y = k => pad.t + ph - (k / maxK) * ph;

  // 在室背景
  HOURS.forEach(h => {
    if (occupancy[h] > 0) { ctx.fillStyle = 'rgba(6,182,212,.10)'; ctx.fillRect(X(h), pad.t, bw, ph); }
  });

  // 基準（灰）
  base.trace.forEach(t => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(X(t.h) + 2, Y(t.kwh), bw - 4, pad.t + ph - Y(t.kwh));
  });
  // 實際（綠）
  sim.trace.forEach(t => {
    if (t.kwh <= 0) return;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(X(t.h) + 2, Y(t.kwh), bw - 4, pad.t + ph - Y(t.kwh));
  });

  // 違規標記
  HOURS.forEach(h => {
    const t = sim.trace[h];
    if (occupancy[h] > 0 && ((!t.ac && outdoorT[h] > T_HOT) || (!t.light && daylight[h] < LUX_NEED))) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(X(h) + bw / 2, pad.t + ph + 12, 4, 0, Math.PI * 2); ctx.fill();
    }
  });

  // 軸
  ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
  HOURS.forEach(h => { if (h % 3 === 0) ctx.fillText(h, X(h) + bw / 2, H - 22); });
  ctx.fillText('時（0–23）', W / 2, H - 6);
  ctx.textAlign = 'left'; ctx.fillText('kWh', 6, pad.t - 6);

  // 圖例
  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#475569'; ctx.fillText('■ 基準全開', pad.l, 20);
  ctx.fillStyle = '#10b981'; ctx.fillText('■ 你的策略', pad.l + 84, 20);
  ctx.fillStyle = 'rgba(6,182,212,.55)'; ctx.fillText('■ 有人時段', pad.l + 172, 20);
  ctx.fillStyle = '#ef4444'; ctx.fillText('● 舒適違規', pad.l + 258, 20);
}

// ---------- 更新 ----------
function update() {
  // 移除沒有感測器支援的策略
  RULES.forEach(r => { if (!state.sensors.has(r.need)) state.rules.delete(r.id); });

  const base = simulate(false);
  const sim = simulate(true);
  const savePct = base.kwh > 0 ? (1 - sim.kwh / base.kwh) * 100 : 0;
  const r = { savePct, discomfort: sim.discomfort, kwh: sim.kwh };

  render(sim, base);
  document.getElementById('base').textContent = base.kwh.toFixed(1) + ' kWh';
  document.getElementById('used').textContent = sim.kwh.toFixed(1) + ' kWh';
  document.getElementById('save').textContent = savePct.toFixed(1) + '%';
  document.getElementById('disc').textContent = sim.discomfort + ' 小時';

  const v = document.getElementById('verdict');
  if (sim.discomfort > 0 && savePct >= 30) { v.className = 'verdict warn'; v.textContent = `🟡 省得多，但有 ${sim.discomfort} 小時讓在室的人不舒服——節能不能犧牲基本舒適。`; }
  else if (sim.discomfort > 0) { v.className = 'verdict bad'; v.textContent = `❌ 既沒省多少，又造成 ${sim.discomfort} 小時不適，策略要重想。`; }
  else if (savePct >= 30) { v.className = 'verdict good'; v.textContent = `✅ 很好！省下 ${savePct.toFixed(1)}% 且完全沒有影響舒適度。`; }
  else if (savePct > 0) { v.className = 'verdict warn'; v.textContent = `🟡 有省到 ${savePct.toFixed(1)}%，但還有空間——試試再加一個策略。`; }
  else { v.className = 'verdict bad'; v.textContent = '❌ 目前和「全時開啟」一樣耗電：先裝感測器，再啟用策略。'; }

  // 成本
  let cost = 0; state.sensors.forEach(id => cost += SENSORS.find(s => s.id === id).cost);
  document.getElementById('sensorCount').textContent = state.sensors.size;
  document.getElementById('sensorCost').textContent = 'NT$ ' + cost.toLocaleString();

  // 挑戰
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  const p = loadP();
  p.module4_sensors = Array.from(state.sensors);
  p.module4_rules = Array.from(state.rules);
  if (newly) {
    p.module4_quests = Array.from(done);
    if (done.size === QUESTS.length) {
      p.module4 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      if (typeof showToast === 'function') showToast('🎉 三個挑戰都完成了！', 'good');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
    }
  }
  saveP(p);
  renderQuests(); renderRules();
}

function renderSensors() {
  document.getElementById('sensorPick').innerHTML = SENSORS.map(s =>
    `<div class="pick ${state.sensors.has(s.id) ? 'on' : ''}" data-s="${s.id}">
      <span class="pick-ico">${s.ico}</span><div class="pick-name">${s.name}</div>
      <div class="pick-meta">NT$ ${s.cost}<br>${s.meta}</div></div>`).join('');
}

function renderRules() {
  document.getElementById('rules').innerHTML = RULES.map(r => {
    const avail = state.sensors.has(r.need);
    const on = state.rules.has(r.id);
    const sn = SENSORS.find(s => s.id === r.need).name;
    return `<label style="display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:10px;
      background:${avail ? (on ? '#ecfdf5' : '#f8fafc') : '#f1f5f9'};
      border-left:4px solid ${on ? '#10b981' : '#cbd5e1'};opacity:${avail ? 1 : .55};
      cursor:${avail ? 'pointer' : 'not-allowed'}">
      <input type="checkbox" data-r="${r.id}" ${on ? 'checked' : ''} ${avail ? '' : 'disabled'} style="margin-top:3px;width:18px;height:18px">
      <div><div style="font-weight:700;font-size:14px">${r.label}</div>
      <div style="font-size:12.5px;color:#64748b;margin-top:2px">${r.desc}
      ${avail ? '' : `　<span style="color:#dc2626">⚠ 需先裝設「${sn}」</span>`}</div></div></label>`;
  }).join('');
}

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
}

// ---------- 綁定 ----------
document.getElementById('sensorPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  const id = el.dataset.s;
  state.sensors.has(id) ? state.sensors.delete(id) : state.sensors.add(id);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderSensors(); update();
});

document.getElementById('rules').addEventListener('change', e => {
  const cb = e.target.closest('input[data-r]'); if (!cb) return;
  cb.checked ? state.rules.add(cb.dataset.r) : state.rules.delete(cb.dataset.r);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

renderSensors();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
