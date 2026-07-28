// 新興科技 模組 6：群體公平性
// 兩群體有不同的「可分辨性」與「本人比例(基本比率)」，同時檢查三種公平定義。
// 常數經整數滑桿全空間窮舉驗證（見 VERIFICATION.md）：
//   達成「相同誤拒率」時通過率仍差 21.3pp；達成「相同通過率」時誤拒率仍差 28.6pp
// 注意：本模組**不宣稱三者數學上不可能同時成立**——窮舉顯示在退化區（門檻極低、
// 幾乎全部放行）確實可以同時成立，只是系統已失去鑑別力。教學重點放在「取捨真實存在」。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const GROUPS = {
  A: { name: 'A 群', color: '#2563EB', mi: 28, mg: 78, sd: 9,  base: 0.70,
       note: '訓練照片多、拍攝條件好 → 分得清楚；本人比例高' },
  B: { name: 'B 群', color: '#DB2777', mi: 34, mg: 68, sd: 14, base: 0.40,
       note: '訓練照片少 → 分布重疊多；外來訪客比例高' },
};

const state = { tA: 55, tB: 55, lock: true };

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const nextBtn = document.getElementById('next-btn'), progEl = document.getElementById('prog');

// ---------- 統計 ----------
function erf(x) {
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const a1 = .254829592, a2 = -.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = .3275911;
  const t = 1 / (1 + p * x);
  return s * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
}
const cdf = (x, mu, sd) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)));
const pdf = (x, mu, sd) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

function rates(g, t) {
  const far = 1 - cdf(t, g.mi, g.sd);
  const frr = cdf(t, g.mg, g.sd);
  const pass = g.base * (1 - frr) + (1 - g.base) * far;   // 整體通過率（含本人與他人）
  return { far, frr, pass };
}

function evaluate() {
  const a = rates(GROUPS.A, state.tA), b = rates(GROUPS.B, state.tB);
  return {
    a, b,
    dFrr: Math.abs(a.frr - b.frr),
    dPass: Math.abs(a.pass - b.pass),
    eqTreat: state.tA === state.tB,
    eqOpp: Math.abs(a.frr - b.frr) < 0.02,
    eqParity: Math.abs(a.pass - b.pass) < 0.02,
    usable: a.far < 0.10 && b.far < 0.10,
  };
}

// ---------- 繪圖 ----------
function drawGroup(g, t, y0, h, label) {
  const W = cv.width, padL = 54, padR = 16;
  const pw = W - padL - padR;
  const X = v => padL + (v / 100) * pw;
  const maxY = pdf(g.mg, g.mg, g.sd) * 1.15;
  const Y = v => y0 + h - (v / maxY) * h;

  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, y0 + h); ctx.lineTo(W - padR, y0 + h); ctx.stroke();

  const curve = (mu, fill, stroke) => {
    ctx.beginPath();
    for (let v = 0; v <= 100; v += .5) { const yy = Y(pdf(v, mu, g.sd)); v === 0 ? ctx.moveTo(X(v), yy) : ctx.lineTo(X(v), yy); }
    ctx.lineTo(X(100), y0 + h); ctx.lineTo(X(0), y0 + h); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath();
    for (let v = 0; v <= 100; v += .5) { const yy = Y(pdf(v, mu, g.sd)); v === 0 ? ctx.moveTo(X(v), yy) : ctx.lineTo(X(v), yy); }
    ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
  };
  curve(g.mi, 'rgba(239,68,68,.28)', '#ef4444');
  curve(g.mg, 'rgba(34,197,94,.28)', '#22c55e');

  ctx.strokeStyle = g.color; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(X(t), y0 - 2); ctx.lineTo(X(t), y0 + h); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = g.color; ctx.fillRect(X(t) - 17, y0 - 16, 34, 14);
  ctx.fillStyle = '#fff'; ctx.font = '700 10px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(t, X(t), y0 - 6);

  ctx.textAlign = 'left'; ctx.font = '800 13px Inter, sans-serif'; ctx.fillStyle = g.color;
  ctx.fillText(label, 6, y0 + 12);
  ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
  ctx.fillText(`本人 ${(g.base * 100).toFixed(0)}%`, 6, y0 + 26);
}

function draw() {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
  drawGroup(GROUPS.A, state.tA, 28, 140, 'A 群');
  drawGroup(GROUPS.B, state.tB, 210, 140, 'B 群');

  ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#22c55e'; ctx.fillText('■ 本人', 60, 20);
  ctx.fillStyle = '#ef4444'; ctx.fillText('■ 他人', 118, 20);
  ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('比對相似度分數 →', W / 2, H - 4);
}

// ---------- 表格與公平指標 ----------
function render(r) {
  const pct = v => (v * 100).toFixed(1) + '%';
  document.getElementById('tbl').innerHTML = `
    <thead><tr style="background:#f1f5f9">
      <th style="padding:9px;text-align:left;border-bottom:2px solid #cbd5e1">群體</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">門檻</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">誤接受 FAR</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">誤拒絕 FRR</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">整體通過率</th>
    </tr></thead><tbody>
    ${[['A', r.a], ['B', r.b]].map(([k, x]) => {
      const g = GROUPS[k];
      return `<tr>
        <td style="padding:9px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${g.color}">${g.name}
          <div style="font-size:11.5px;color:#94a3b8;font-weight:400">${g.note}</div></td>
        <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${k === 'A' ? state.tA : state.tB}</td>
        <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace;color:${x.far > 0.10 ? '#dc2626' : '#334155'}">${pct(x.far)}</td>
        <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${pct(x.frr)}</td>
        <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${pct(x.pass)}</td>
      </tr>`;
    }).join('')}
    <tr style="background:#FFFBEB">
      <td style="padding:9px;font-weight:700;color:#92400E">兩群差距</td>
      <td style="padding:9px"></td><td style="padding:9px"></td>
      <td style="padding:9px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:#B45309">${(r.dFrr * 100).toFixed(1)} pp</td>
      <td style="padding:9px;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:#B45309">${(r.dPass * 100).toFixed(1)} pp</td>
    </tr></tbody>`;

  const defs = [
    { ok: r.eqTreat, name: '① 相同對待', sub: '兩群用同一個門檻',
      detail: r.eqTreat ? '兩群門檻相同' : `門檻差 ${Math.abs(state.tA - state.tB)}` },
    { ok: r.eqOpp, name: '② 相同誤拒率', sub: '本人被擋在門外的機率一致',
      detail: `誤拒率差 ${(r.dFrr * 100).toFixed(1)} pp` },
    { ok: r.eqParity, name: '③ 相同通過率', sub: '兩群整體通過比例一致',
      detail: `通過率差 ${(r.dPass * 100).toFixed(1)} pp` },
  ];
  document.getElementById('fairness').innerHTML = defs.map(d => `
    <div style="border-radius:12px;padding:14px;border-left:4px solid ${d.ok ? '#22c55e' : '#cbd5e1'};
      background:${d.ok ? '#dcfce7' : '#f8fafc'}">
      <div style="font-weight:800;font-size:14px;color:${d.ok ? '#15803d' : '#475569'}">${d.ok ? '✅' : '⬜'} ${d.name}</div>
      <div style="font-size:12.5px;color:#64748b;margin:4px 0 6px">${d.sub}</div>
      <div style="font-size:13px;font-weight:700;color:${d.ok ? '#15803d' : '#b91c1c'}">${d.detail}</div>
    </div>`).join('');

  const n = [r.eqTreat, r.eqOpp, r.eqParity].filter(Boolean).length;
  const v = document.getElementById('verdict');
  if (!r.usable) {
    v.className = 'verdict bad';
    v.textContent = `⚠️ 目前有群體的誤接受率超過 10%（放太多人進來），這個設定即使「公平」也不能用——公平必須建立在系統本來就有效的前提上。`;
  } else if (n === 3) {
    v.className = 'verdict good';
    v.textContent = '✅ 三個定義同時成立！請看上表確認誤接受率是否仍在可接受範圍——如果是，恭喜你找到一個難得的平衡點。';
  } else if (n === 2) {
    v.className = 'verdict warn';
    v.textContent = `🟡 三個裡滿足了 2 個。注意剩下那一個差多少——這就是取捨的代價。`;
  } else {
    v.className = 'verdict warn';
    v.textContent = `目前滿足 ${n} / 3 個定義。試著調整看看，你會發現修好一個常常會打破另一個。`;
  }
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_gap', text: '用相同門檻，做出兩群誤拒率相差 15 個百分點以上的情況',
    hint: '把共用門檻往右調（約 54 以上）——這證明「一視同仁」不等於「結果一樣」',
    test: (r) => r.eqTreat && r.dFrr >= 0.15 },
  { id: 'q_opp', text: '在系統仍可用（兩群 FAR < 10%）的前提下，讓兩群誤拒率差距小於 2 個百分點',
    hint: '取消「相同門檻」，分別調整。做到之後請看通過率差了多少',
    test: (r) => r.usable && r.eqOpp },
  { id: 'q_parity', text: '同樣在系統可用的前提下，改成讓兩群通過率差距小於 2 個百分點',
    hint: '做到之後回頭看誤拒率——它會拉得更開',
    test: (r) => r.usable && r.eqParity },
  { id: 'q_degen', text: '把門檻降到兩群通過率都超過 90%，看看誤接受率變成多少',
    hint: '兩邊門檻都拉到很低。這會讓數字變好看，但系統還有用嗎？',
    test: (r) => r.a.pass > 0.90 && r.b.pass > 0.90 },
];
const done = new Set(loadP().module6_quests || []);

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

function check(r) {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module6_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module6 = true;
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 六個模組全部完成！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p); renderQuests();
}

function update() {
  const r = evaluate();
  draw(); render(r); check(r);
}

// ---------- 綁定 ----------
const sA = document.getElementById('sA'), sB = document.getElementById('sB');
const vA = document.getElementById('vA'), vB = document.getElementById('vB');
const lock = document.getElementById('lock');

function syncFrom(which) {
  if (state.lock) {
    const t = which === 'A' ? state.tA : state.tB;
    state.tA = t; state.tB = t;
    sA.value = t; sB.value = t;
  }
  vA.textContent = state.tA; vB.textContent = state.tB;
  update();
}
sA.addEventListener('input', () => { state.tA = +sA.value; syncFrom('A'); });
sB.addEventListener('input', () => { state.tB = +sB.value; syncFrom('B'); });
lock.addEventListener('change', () => {
  state.lock = lock.checked;
  sB.disabled = false;
  if (state.lock) { state.tB = state.tA; sB.value = state.tA; }
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  syncFrom('A');
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
