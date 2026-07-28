// 新興科技 模組 2：生物辨識 — FAR / FRR 門檻權衡
// 以常態分布模擬「本人」與「他人」的比對分數，計算誤接受率與誤拒絕率。
// 分布參數為教學用示意值（可分辨性 虹膜 > 指紋 > 人臉），非特定產品實測數據。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const MODALITIES = [
  { id: 'fp',   name: '指紋',   ico: '👆', mi: 30, mg: 72, sd: 10,
    meta: '接觸式・成本低', note: '手濕、脫皮、破皮會讓本人分數下降' },
  { id: 'iris', name: '虹膜',   ico: '👁️', mi: 25, mg: 85, sd: 8,
    meta: '非接觸・可分辨性最高', note: '設備較貴，需配合距離與光線' },
  { id: 'face', name: '人臉',   ico: '🙂', mi: 38, mg: 68, sd: 13,
    meta: '最方便・重疊最多', note: '角度、口罩、光線、雙胞胎都會影響' },
];

const state = { mod: 'fp', th: 55 };

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');
const questsEl = document.getElementById('quests');

// ---------- 常態分布工具 ----------
// Abramowitz & Stegun 7.1.26 誤差函數近似
function erf(x) {
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const a1 = .254829592, a2 = -.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = .3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return s * y;
}
const cdf = (x, mu, sd) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)));
const pdf = (x, mu, sd) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

function rates(m, th) {
  const far = 1 - cdf(th, m.mi, m.sd);   // 他人分數 ≥ 門檻 → 誤接受
  const frr = cdf(th, m.mg, m.sd);       // 本人分數 < 門檻 → 誤拒絕
  return { far, frr };
}
function findEER(m) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2, r = rates(m, mid);
    if (r.far > r.frr) lo = mid; else hi = mid;
  }
  const th = (lo + hi) / 2;
  return { th, eer: (rates(m, th).far + rates(m, th).frr) / 2 };
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_eer',  text: '把門檻調到接近 EER 點（FAR 與 FRR 相差 1 個百分點以內）',
    hint: '看兩個數字什麼時候最接近', test: (r) => Math.abs(r.far - r.frr) < .01 },
  { id: 'q_safe', text: '讓 FAR 低於 0.1%（幾乎不會放錯人）',
    hint: '門檻往右拉，但注意 FRR 會付出什麼代價', test: (r) => r.far < .001 },
  { id: 'q_cmp',  text: '三種生物特徵都看過一輪，比較它們的 EER',
    hint: '點上方卡片切換', test: () => seenMods.size === 3 },
];
const done = new Set(loadP().module2_quests || []);
const seenMods = new Set(loadP().module2_seen || ['fp']);

// ---------- 繪圖 ----------
function render() {
  const m = MODALITIES.find(x => x.id === state.mod);
  const W = cv.width, H = cv.height, pad = { l: 46, r: 16, t: 18, b: 34 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const X = v => pad.l + (v / 100) * pw;
  const maxY = pdf(m.mg, m.mg, m.sd) * 1.12;
  const Y = v => pad.t + ph - (v / maxY) * ph;

  // 格線
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
  for (let v = 0; v <= 100; v += 20) {
    ctx.beginPath(); ctx.moveTo(X(v), pad.t); ctx.lineTo(X(v), pad.t + ph); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText(v, X(v), H - 12);
  }
  ctx.textAlign = 'center'; ctx.fillText('比對相似度分數', W / 2, H - 1);

  // 曲線
  const curve = (mu, fill, stroke) => {
    ctx.beginPath();
    for (let v = 0; v <= 100; v += .5) { const y = Y(pdf(v, mu, m.sd)); v === 0 ? ctx.moveTo(X(v), y) : ctx.lineTo(X(v), y); }
    ctx.lineTo(X(100), pad.t + ph); ctx.lineTo(X(0), pad.t + ph); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath();
    for (let v = 0; v <= 100; v += .5) { const y = Y(pdf(v, mu, m.sd)); v === 0 ? ctx.moveTo(X(v), y) : ctx.lineTo(X(v), y); }
    ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke();
  };
  curve(m.mi, 'rgba(239,68,68,.32)', '#ef4444');   // 他人
  curve(m.mg, 'rgba(34,197,94,.32)', '#22c55e');   // 本人

  // 門檻線
  ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(X(state.th), pad.t - 4); ctx.lineTo(X(state.th), pad.t + ph); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#06B6D4'; ctx.fillRect(X(state.th) - 20, pad.t - 18, 40, 15);
  ctx.fillStyle = '#0f172a'; ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(state.th, X(state.th), pad.t - 7);

  // 圖例
  ctx.textAlign = 'left'; ctx.font = '700 12px Inter, sans-serif';
  ctx.fillStyle = '#22c55e'; ctx.fillText('■ 本人', pad.l + 8, pad.t + 16);
  ctx.fillStyle = '#ef4444'; ctx.fillText('■ 他人', pad.l + 68, pad.t + 16);
}

function update() {
  const m = MODALITIES.find(x => x.id === state.mod);
  const r = rates(m, state.th);
  const e = findEER(m);
  render();

  const pct = v => v >= .01 ? (v * 100).toFixed(2) + '%' : v >= .0001 ? (v * 100).toFixed(3) + '%' : (v * 100).toExponential(1) + '%';
  document.getElementById('far').textContent = pct(r.far);
  document.getElementById('frr').textContent = pct(r.frr);
  document.getElementById('eer').textContent = (e.eer * 100).toFixed(2) + '%';

  // 情境換算
  const dailyGenuine = 1000 * 2, dailyImpostor = 50;
  const rejects = dailyGenuine * r.frr, accepts = dailyImpostor * r.far;
  document.getElementById('scenario').innerHTML = `
    <div style="background:#fffbeb;border-radius:12px;padding:14px">
      <div style="font-size:13px;color:#92400e;font-weight:700">本人被擋在門外</div>
      <div style="font-size:24px;font-weight:900;color:#d97706;font-family:'JetBrains Mono',monospace">${rejects.toFixed(1)} 次／天</div>
      <div style="font-size:12px;color:#78350f">約 ${(rejects * 20).toFixed(0)} 次／學期（20 天估）</div>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:14px">
      <div style="font-size:13px;color:#991b1b;font-weight:700">外人被誤放進校</div>
      <div style="font-size:24px;font-weight:900;color:#dc2626;font-family:'JetBrains Mono',monospace">${accepts.toFixed(2)} 次／天</div>
      <div style="font-size:12px;color:#7f1d1d">約 ${(accepts * 20).toFixed(1)} 次／學期</div>
    </div>`;

  const sv = document.getElementById('scVerdict');
  if (r.far < .001 && r.frr < .05) { sv.className = 'verdict good'; sv.textContent = '✅ 平衡不錯：幾乎不放錯人，本人也很少被擋。'; }
  else if (r.far >= .01) { sv.className = 'verdict bad'; sv.textContent = `❌ 門檻太寬鬆：每天約有 ${accepts.toFixed(1)} 次外人被誤放，門禁形同虛設。`; }
  else if (r.frr >= .15) { sv.className = 'verdict bad'; sv.textContent = `❌ 門檻太嚴格：每天約 ${rejects.toFixed(0)} 人次被擋在門外，會塞爆校門口。`; }
  else { sv.className = 'verdict warn'; sv.textContent = '🟡 可用，但仍有一邊的代價偏高——想想你的場域比較怕哪一種錯。'; }

  // 挑戰
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  if (newly) {
    const p = loadP(); p.module2_quests = Array.from(done);
    if (done.size === QUESTS.length) {
      p.module2 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      if (typeof showToast === 'function') showToast('🎉 三個挑戰都完成了！', 'good');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
    }
    saveP(p); renderQuests();
  }
}

function renderQuests() {
  questsEl.innerHTML = QUESTS.map(q => {
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
function renderPick() {
  document.getElementById('modPick').innerHTML = MODALITIES.map(m => {
    const e = findEER(m);
    return `<div class="pick ${m.id === state.mod ? 'on' : ''}" data-mod="${m.id}">
      <span class="pick-ico">${m.ico}</span><div class="pick-name">${m.name}</div>
      <div class="pick-meta">${m.meta}<br>EER ${(e.eer * 100).toFixed(2)}%</div>
      <div class="pick-meta" style="color:#94a3b8;margin-top:4px">${m.note}</div></div>`;
  }).join('');
}
renderPick();

document.getElementById('modPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.mod = el.dataset.mod; seenMods.add(state.mod);
  const p = loadP(); p.module2_seen = Array.from(seenMods); saveP(p);
  renderPick();
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

const sTh = document.getElementById('sTh'), vTh = document.getElementById('vTh');
sTh.addEventListener('input', () => { state.th = +sTh.value; vTh.textContent = sTh.value; update(); });

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
