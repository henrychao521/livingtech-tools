// 機電整合 模組 4：超音波測距的盲區與失效
// 模型重點：min/max 量程、斜面反射失效、吸音材質、音速隨溫度變化造成的系統性誤差。
// 音速公式 c = 331.3 + 0.606·T (m/s) 為標準近似式。

const PK = 'mecha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const D_MIN = 2, D_MAX = 400;          // 典型 HC-SR04 量程 (cm)
const BEAM = 15;                       // 半波束角(度)

const MATERIALS = [
  { id: 'wall',  ico: '🧱', name: '硬牆／木板', refl: 1.00, meta: '反射良好' },
  { id: 'cloth', ico: '🧺', name: '布料／海綿', refl: 0.35, meta: '吸音，回音弱' },
  { id: 'glass', ico: '🪟', name: '玻璃／光滑面', refl: 0.85, meta: '斜放時幾乎全反射走' },
  { id: 'mesh',  ico: '🕸️', name: '網狀／柵欄', refl: 0.45, meta: '聲波會穿過去' },
];

const state = { d: 40, ang: 0, t: 20, mat: 'wall' };
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

function measure() {
  const m = MATERIALS.find(x => x.id === state.mat);
  // 有效回音強度：材質反射率 × 斜角衰減 × 距離衰減
  const angFactor = state.ang <= BEAM ? 1 : Math.max(0, Math.cos((state.ang - BEAM) * Math.PI / 180) ** 3);
  const distFactor = Math.max(0.15, 1 - state.d / (D_MAX * 1.25));
  const glassPenalty = (m.id === 'glass' && state.ang > 20) ? 0.15 : 1;
  const echo = m.refl * angFactor * distFactor * glassPenalty;

  let fail = null;
  if (state.d < D_MIN) fail = '盲區';
  else if (state.d > D_MAX) fail = '超出量程';
  else if (echo < 0.12) fail = '回音太弱';

  if (fail) return { fail, meas: 0, real: state.d, err: null, echo };

  // 感測器實際量到的是回音時間 t = 2d / c_實際；
  // 程式卻用寫死的 20°C 音速換算 → d_量測 = t · c_假設 / 2 = d · (c_假設 / c_實際)
  // 因此低溫（聲速慢、回音晚）會高估距離，高溫則低估。
  const cReal = 331.3 + 0.606 * state.t;
  const cAssumed = 331.3 + 0.606 * 20;
  const meas = state.d * (cAssumed / cReal);
  return { fail: null, meas: +meas.toFixed(1), real: state.d, err: +(meas - state.d).toFixed(1), echo };
}

function draw(r) {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const originX = 70, originY = H / 2;
  const scale = (W - 150) / D_MAX;
  const objX = originX + Math.min(state.d, D_MAX) * scale;

  // 感測器
  ctx.fillStyle = '#334155'; ctx.fillRect(originX - 34, originY - 26, 34, 52);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(originX - 17, originY - 13, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(originX - 17, originY + 13, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('T', originX - 17, originY - 10); ctx.fillText('R', originX - 17, originY + 16);

  // 波束
  const beamLen = Math.min(state.d, D_MAX) * scale;
  const spread = Math.tan(BEAM * Math.PI / 180) * beamLen;
  ctx.fillStyle = r.fail ? 'rgba(239,68,68,.10)' : 'rgba(6,182,212,.14)';
  ctx.beginPath(); ctx.moveTo(originX, originY);
  ctx.lineTo(originX + beamLen, originY - spread);
  ctx.lineTo(originX + beamLen, originY + spread);
  ctx.closePath(); ctx.fill();

  // 盲區
  ctx.fillStyle = 'rgba(239,68,68,.28)';
  ctx.fillRect(originX, originY - 46, D_MIN * scale + 3, 92);

  // 障礙物（依傾角旋轉）
  ctx.save();
  ctx.translate(objX, originY); ctx.rotate(-state.ang * Math.PI / 180);
  const m = MATERIALS.find(x => x.id === state.mat);
  ctx.fillStyle = r.fail ? '#7f1d1d' : '#64748b';
  ctx.fillRect(-6, -52, 12, 104);
  ctx.restore();
  ctx.fillStyle = '#e2e8f0'; ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(m.ico + ' ' + m.name, objX, originY + 76);

  // 標尺
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(originX, originY + 96); ctx.lineTo(objX, originY + 96); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(state.d + ' cm', (originX + objX) / 2, originY + 112);

  // 結果
  ctx.textAlign = 'left'; ctx.font = '700 14px Inter, sans-serif';
  if (r.fail) { ctx.fillStyle = '#ef4444'; ctx.fillText(`✗ 量測失敗：${r.fail} → 程式收到 0`, 16, 28); }
  else { ctx.fillStyle = '#22c55e'; ctx.fillText(`✓ 回報 ${r.meas} cm`, 16, 28); }
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif';
  ctx.fillText(`回音強度 ${(r.echo * 100).toFixed(0)}%`, 16, 46);
  ctx.fillStyle = '#ef4444'; ctx.fillText('盲區', originX + 4, originY - 52);
}

const QUESTS = [
  { id: 'q_blind', text: '讓障礙物落進盲區，看程式收到什麼', hint: '距離拉到 2 cm 以內',
    test: (r) => r.fail === '盲區' },
  { id: 'q_angle', text: '物體明明在前面，卻因為角度而量不到', hint: '把傾角調大，或選玻璃這種光滑面',
    test: (r) => r.fail === '回音太弱' && state.ang >= 30 },
  { id: 'q_temp',  text: '在同一距離下，因溫度造成 3 cm 以上的誤差', hint: '距離拉遠一點，再把溫度調到極端',
    test: (r) => !r.fail && Math.abs(r.err) >= 3 },
];
const done = new Set(loadP().module4_quests || []);

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

function update() {
  const r = measure();
  draw(r);
  document.getElementById('realVal').textContent = r.real + ' cm';
  document.getElementById('measVal').textContent = r.fail ? '0 (失敗)' : r.meas + ' cm';
  document.getElementById('errVal').textContent = r.fail ? '—' : (r.err > 0 ? '+' : '') + r.err + ' cm';

  const v = document.getElementById('verdict');
  if (r.fail === '盲區') { v.className = 'verdict bad'; v.textContent = '❌ 物體太近，落在盲區內：發射與接收時間重疊，感測器根本收不到有效回音，程式會拿到 0。'; }
  else if (r.fail === '超出量程') { v.className = 'verdict bad'; v.textContent = '❌ 超出最大量程：回音已經衰減到收不到，同樣回報 0——這時「0」代表的是「很遠」而不是「很近」。'; }
  else if (r.fail === '回音太弱') { v.className = 'verdict bad'; v.textContent = '❌ 有物體但量不到：聲波被斜面反射到別的方向、或被材質吸收了。這是超音波最典型的失效。'; }
  else if (Math.abs(r.err) >= 3) { v.className = 'verdict warn'; v.textContent = `🟡 量得到，但誤差 ${r.err} cm：程式裡的音速常數是以 20°C 計算，溫度差越多、距離越遠，誤差越大。`; }
  else { v.className = 'verdict good'; v.textContent = `✅ 量測正常，誤差 ${r.err} cm，可放心使用。`; }

  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  if (newly) {
    const p = loadP(); p.module4_quests = Array.from(done);
    if (done.size === QUESTS.length) {
      p.module4 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      if (typeof showToast === 'function') showToast('🎉 三個挑戰都完成了！', 'good');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
    }
    saveP(p); renderQuests();
  }
}

function renderMat() {
  document.getElementById('matPick').innerHTML = MATERIALS.map(m =>
    `<div class="pick ${m.id === state.mat ? 'on' : ''}" data-m="${m.id}">
      <span class="pick-ico">${m.ico}</span><div class="pick-name" style="font-size:13px">${m.name}</div>
      <div class="pick-meta">${m.meta}</div></div>`).join('');
}
renderMat();

document.getElementById('matPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.mat = el.dataset.m; renderMat();
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});
document.getElementById('sD').addEventListener('input', e => {
  state.d = +e.target.value; document.getElementById('vD').textContent = state.d + ' cm'; update();
});
document.getElementById('sA').addEventListener('input', e => {
  state.ang = +e.target.value; document.getElementById('vA').textContent = state.ang + '°'; update();
});
document.getElementById('sT').addEventListener('input', e => {
  state.t = +e.target.value; document.getElementById('vT').textContent = state.t + ' °C'; update();
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
