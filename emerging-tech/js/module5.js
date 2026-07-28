// 新興科技 模組 5：穿戴式裝置 — PPG 準確度與資料歸屬
// 誤差模型為教學用示意：呈現「運動雜訊 > 配戴鬆緊 > 位置 > 末梢循環」的相對影響，
// 方向與公開文獻一致（動作偽影是 PPG 最大誤差來源），數值非特定產品實測。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const ACTIVITIES = [
  { id: 'rest',  ico: '🧘', name: '靜止',   hr: 72,  motion: 0.05, meta: '坐著不動' },
  { id: 'walk',  ico: '🚶', name: '走路',   hr: 105, motion: 0.35, meta: '規律擺動' },
  { id: 'run',   ico: '🏃', name: '跑步',   hr: 155, motion: 0.75, meta: '劇烈晃動' },
  { id: 'lift',  ico: '🏋️', name: '重量訓練', hr: 130, motion: 1.00, meta: '手腕彎曲＋肌肉緊繃，PPG 最難量' },
];

const DATA_MODES = [
  { id: 'local', ico: '📱', name: '只存在裝置本機', color: '#22c55e',
    pros: '資料不離身，外洩風險最低；沒有網路也能用。',
    cons: '換手機資料可能遺失；無法跨裝置分析長期趨勢。',
    risk: 1, note: '學校體育課的短期量測，這個設計通常就夠了。' },
  { id: 'cloud', ico: '☁️', name: '同步到廠商雲端', color: '#f59e0b',
    pros: '可跨裝置查看、長期趨勢分析、資料不會因換機遺失。',
    cons: '資料交由第三方保管，須信任其資安與隱私政策；帳號被盜即全部外洩。',
    risk: 3, note: '要看清楚：資料保存多久？可否要求刪除？是否用於訓練模型？' },
  { id: 'share', ico: '🔗', name: '雲端＋分享給第三方', color: '#ef4444',
    pros: '可串接保險優惠、健康管理服務、學校系統。',
    cons: '健康資料可能影響保費、錄取或評分；一旦轉出就很難追回控制權。',
    risk: 5, note: '這是風險最高的設計，通常需要「個別、明確、可撤回」的同意。' },
];

const state = { act: 'rest', fit: 55, pos: 70, tattoo: false, cold: false, dataMode: null };

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

// ---------- 誤差模型 ----------
function compute() {
  const a = ACTIVITIES.find(x => x.id === state.act);
  // 鬆緊：55 為理想，太鬆(0)光會漏、太緊(100)壓迫血流
  const fitPenalty = Math.abs(state.fit - 55) / 55;
  // 位置：越靠手臂上方越穩（腕骨上會滑動）
  const posPenalty = (100 - state.pos) / 100;

  // 動作偽影是主因；配戴不良會放大它。
  const motionTerm = a.motion * 9 * (1 + fitPenalty * 0.9 + posPenalty * 0.5);
  // 靜態因素（鬆緊／位置／刺青／末梢循環）在靜止時影響小，運動時才被放大
  const staticTerm = (fitPenalty * 4 + posPenalty * 2.5
                     + (state.tattoo ? 4 : 0) + (state.cold ? 2.5 : 0))
                     * (0.4 + a.motion * 0.6);

  let err = Math.max(0.4, motionTerm + staticTerm);
  const errPct = err / a.hr * 100;
  // 誤差方向：動作偽影常讓 PPG 低估或鎖到步頻，這裡以低估呈現
  const reading = Math.round(a.hr - err * 0.75);
  return { truth: a.hr, reading, err: Math.round(err), errPct, act: a };
}

// ---------- 波形繪製 ----------
function render(r) {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
  const midE = 90, midP = 215;
  const noise = r.act.motion * (1 + Math.abs(state.fit - 55) / 55);

  // ECG 基準（乾淨）
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.beginPath();
  const beatsE = r.truth / 60 * 4;              // 4 秒視窗
  for (let x = 0; x <= W; x++) {
    const t = x / W * 4, ph = (t * beatsE / 4 * r.truth / 60) % 1;
    let y = midE;
    if (ph < .06) y = midE - 42 * Math.sin(ph / .06 * Math.PI);
    else if (ph < .12) y = midE + 10 * Math.sin((ph - .06) / .06 * Math.PI);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // PPG（含雜訊）
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= W; x++) {
    const t = x / W * 4;
    const base = Math.sin(t * 2 * Math.PI * r.reading / 60) * 28;
    const artifact = noise * 26 * Math.sin(t * 2 * Math.PI * 2.7 + x * .05)
                   + noise * 14 * Math.sin(t * 2 * Math.PI * 5.3);
    const y = midP - base - artifact;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#22c55e'; ctx.fillText('胸帶 ECG（基準・電位訊號）', 12, 22);
  ctx.fillStyle = '#3b82f6'; ctx.fillText('手錶 PPG（光學訊號）', 12, midP - 78);
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif';
  ctx.fillText(noise > .5 ? '⚠ 動作偽影明顯，波峰難以辨識' : '訊號穩定，波峰清楚', 12, H - 10);
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_bad',  text: '製造出誤差 ≥ 20 bpm 的情況', hint: '重訓 + 錶帶太鬆最容易',
    test: (r) => r.err >= 20 },
  { id: 'q_good', text: '在「跑步」狀態下，把誤差壓到 10 bpm 以內', hint: '鬆緊調到適中、往手臂上方戴、排除刺青與冰冷',
    test: (r) => state.act === 'run' && r.err <= 10 },
  { id: 'q_data', text: '三種資料流向設計都看過，並理解其取捨', hint: '點選下方三張卡片',
    test: () => seenModes.size === 3 },
];
const done = new Set(loadP().module5_quests || []);
const seenModes = new Set(loadP().module5_modes || []);

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

function checkQuests(r) {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module5_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module5 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 五個模組全部完成！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p); renderQuests();
}

// ---------- 更新 ----------
function update() {
  const r = compute();
  render(r);
  document.getElementById('truth').textContent = r.truth + ' bpm';
  document.getElementById('reading').textContent = r.reading + ' bpm';
  document.getElementById('err').textContent = r.err + ' bpm';

  const v = document.getElementById('verdict');
  if (r.err <= 5) { v.className = 'verdict good'; v.textContent = `✅ 誤差 ${r.err} bpm（${r.errPct.toFixed(1)}%）：可信賴，適合用來判讀運動強度。`; }
  else if (r.err <= 12) { v.className = 'verdict warn'; v.textContent = `🟡 誤差 ${r.err} bpm（${r.errPct.toFixed(1)}%）：看趨勢還行，但不該拿來當精確數據。`; }
  else { v.className = 'verdict bad'; v.textContent = `❌ 誤差 ${r.err} bpm（${r.errPct.toFixed(1)}%）：讀值已不可靠——若用它評分會很不公平。`; }

  checkQuests(r);
}

// ---------- 綁定 ----------
document.getElementById('actPick').innerHTML = ACTIVITIES.map(a =>
  `<div class="pick ${a.id === state.act ? 'on' : ''}" data-a="${a.id}">
    <span class="pick-ico">${a.ico}</span><div class="pick-name">${a.name}</div>
    <div class="pick-meta">${a.hr} bpm<br>${a.meta}</div></div>`).join('');

document.getElementById('actPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.act = el.dataset.a;
  document.querySelectorAll('#actPick .pick').forEach(p => p.classList.toggle('on', p === el));
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

const fitLabel = v => v < 25 ? '太鬆' : v < 45 ? '偏鬆' : v < 68 ? '適中' : v < 85 ? '偏緊' : '太緊';
const posLabel = v => v < 30 ? '壓在腕骨' : v < 60 ? '腕骨附近' : '腕骨上方';

document.getElementById('sFit').addEventListener('input', e => {
  state.fit = +e.target.value; document.getElementById('vFit').textContent = fitLabel(state.fit); update();
});
document.getElementById('sPos').addEventListener('input', e => {
  state.pos = +e.target.value; document.getElementById('vPos').textContent = posLabel(state.pos); update();
});
document.getElementById('cTattoo').addEventListener('change', e => { state.tattoo = e.target.checked; update(); });
document.getElementById('cCold').addEventListener('change', e => { state.cold = e.target.checked; update(); });

// 資料流向
function renderData() {
  document.getElementById('dataPick').innerHTML = DATA_MODES.map(m =>
    `<div class="xr-card ${state.dataMode === m.id ? 'sel' : ''}" data-d="${m.id}" style="border-color:${m.color}55">
      <span class="xr-icon">${m.ico}</span>
      <h4 style="color:${m.color}">${m.name}</h4>
      <p>風險等級 ${'●'.repeat(m.risk)}${'○'.repeat(5 - m.risk)}</p></div>`).join('');
}
renderData();

document.getElementById('dataPick').addEventListener('click', e => {
  const el = e.target.closest('.xr-card'); if (!el) return;
  state.dataMode = el.dataset.d; seenModes.add(state.dataMode);
  const p = loadP(); p.module5_modes = Array.from(seenModes); saveP(p);
  renderData();
  const m = DATA_MODES.find(x => x.id === state.dataMode);
  document.getElementById('dataDetail').innerHTML = `
    <div style="background:#f8fafc;border-radius:12px;padding:16px;border-left:4px solid ${m.color}">
      <div style="font-weight:800;color:${m.color};margin-bottom:8px">${m.ico} ${m.name}</div>
      <p style="font-size:14px;margin:4px 0"><strong style="color:#15803d">優點：</strong>${m.pros}</p>
      <p style="font-size:14px;margin:4px 0"><strong style="color:#b91c1c">代價：</strong>${m.cons}</p>
      <p style="font-size:13.5px;color:#475569;margin-top:8px">💡 ${m.note}</p>
    </div>`;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
