// 新興科技 模組 1：AI 影像辨識模擬器
// 教學用規則模型：以拍攝條件計算「正確類別」信心衰減，並把剩餘機率分給易混淆類別。
// 目的是讓學生看見「條件 → 信心 → 判斷」的因果，不是模擬真實 CNN 的數值。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const CLASSES = ['貓', '狗', '杯子', '腳踏車'];

// 每個物體的易混淆權重（形狀相近者權重高）
const OBJECTS = [
  { id: '貓',     ico: '🐱', meta: '毛髮紋理・尖耳輪廓', confuse: { '狗': .70, '杯子': .18, '腳踏車': .12 } },
  { id: '狗',     ico: '🐶', meta: '四足輪廓・與貓相近', confuse: { '貓': .70, '杯子': .18, '腳踏車': .12 } },
  { id: '杯子',   ico: '☕', meta: '圓柱＋把手',        confuse: { '貓': .45, '狗': .32, '腳踏車': .23 } },
  { id: '腳踏車', ico: '🚲', meta: '雙圓＋直線骨架',    confuse: { '杯子': .42, '狗': .33, '貓': .25 } },
];

const state = { obj: '貓', bright: 60, occ: 0, rot: 0, noise: 0 };

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const barsEl = document.getElementById('bars');
const verdictEl = document.getElementById('verdict');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
const questsEl = document.getElementById('quests');

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_low',    text: '讓正確類別的信心掉到 50% 以下', hint: '試著同時調暗亮度並加上遮擋',
    test: (r) => r.trueScore < .50 },
  { id: 'q_wrong',  text: '造成一次「誤判」（最高分不是正確答案）', hint: '遮擋拉到 50% 以上通常就會翻盤',
    test: (r) => r.top !== state.obj },
  { id: 'q_robust', text: '在遮擋 ≥ 30% 的情況下，信心仍守住 65% 以上', hint: '遮擋擋不掉，就把其他條件救回來：亮度調回 60、旋轉與雜訊歸零',
    test: (r) => state.occ >= 30 && r.trueScore >= .65 },
];
const done = new Set(loadP().module1_quests || []);

// ---------- 推論（規則模擬） ----------
function infer() {
  const o = OBJECTS.find(x => x.id === state.obj);
  // 亮度：60 為理想，過亮或過暗都扣分
  const pBright = Math.abs(state.bright - 60) / 60 * 0.50;
  const pOcc    = (state.occ / 100) * 0.75;
  const pRot    = (state.rot / 180) * 0.30;
  const pNoise  = (state.noise / 100) * 0.42;

  let trueScore = 0.96 - (pBright + pOcc + pRot + pNoise);
  trueScore = Math.max(0.03, Math.min(0.98, trueScore));

  const rest = 1 - trueScore;
  const scores = { [state.obj]: trueScore };
  for (const [cls, w] of Object.entries(o.confuse)) scores[cls] = rest * w;

  // 正規化，避免浮點誤差
  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  for (const k in scores) scores[k] /= sum;

  const ranked = CLASSES.map(c => ({ cls: c, s: scores[c] || 0 })).sort((a, b) => b.s - a.s);
  return { scores, ranked, top: ranked[0].cls, trueScore: scores[state.obj] };
}

// ---------- 繪圖 ----------
function drawObject(g, id) {
  g.lineWidth = 4; g.strokeStyle = '#e2e8f0'; g.fillStyle = '#64748b';
  if (id === '貓' || id === '狗') {
    g.beginPath(); g.ellipse(0, 20, 62, 40, 0, 0, Math.PI * 2); g.fill();   // 身體
    g.beginPath(); g.arc(-52, -22, 30, 0, Math.PI * 2); g.fill();           // 頭
    g.beginPath();
    if (id === '貓') { g.moveTo(-74, -44); g.lineTo(-66, -74); g.lineTo(-50, -50); g.closePath();  // 尖耳
                       g.moveTo(-38, -48); g.lineTo(-28, -72); g.lineTo(-20, -44); g.closePath(); }
    else             { g.ellipse(-70, -40, 12, 20, -.4, 0, Math.PI * 2);                            // 垂耳
                       g.ellipse(-30, -40, 12, 20,  .4, 0, Math.PI * 2); }
    g.fill();
    g.beginPath(); g.moveTo(58, 8);                                          // 尾巴
    g.quadraticCurveTo(96, -20, id === '貓' ? 80 : 92, id === '貓' ? -56 : -18); g.stroke();
    g.fillStyle = '#0f172a';
    [[-62, -26], [-42, -26]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); });
    [-34, -6, 22, 46].forEach(x => { g.fillStyle = '#64748b'; g.fillRect(x, 52, 13, 30); }); // 腳
  } else if (id === '杯子') {
    g.fillRect(-46, -46, 88, 100);                                            // 杯身
    g.beginPath(); g.ellipse(-2, -46, 44, 13, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(56, 0, 26, -Math.PI / 2, Math.PI / 2); g.stroke();   // 把手
    g.fillStyle = '#334155'; g.beginPath(); g.ellipse(-2, -46, 34, 9, 0, 0, Math.PI * 2); g.fill();
  } else {
    g.beginPath(); g.arc(-52, 26, 34, 0, Math.PI * 2); g.stroke();            // 後輪
    g.beginPath(); g.arc(56, 26, 34, 0, Math.PI * 2); g.stroke();             // 前輪
    g.beginPath();
    g.moveTo(-52, 26); g.lineTo(-6, 26); g.lineTo(-22, -28); g.lineTo(-52, 26);
    g.moveTo(-6, 26); g.lineTo(22, -28); g.lineTo(-22, -28);
    g.moveTo(22, -28); g.lineTo(56, 26);
    g.stroke();
    g.beginPath(); g.moveTo(-36, -32); g.lineTo(-12, -32); g.stroke();        // 座墊
    g.beginPath(); g.moveTo(14, -40); g.lineTo(38, -40); g.stroke();          // 手把
  }
}

function render(r) {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  // 亮度（以覆蓋層模擬曝光）
  ctx.save();
  ctx.translate(W / 2, H / 2 - 10);
  ctx.rotate(state.rot * Math.PI / 180);
  ctx.scale(1.25, 1.25);
  drawObject(ctx, state.obj);
  ctx.restore();

  if (state.bright < 60) {
    ctx.fillStyle = `rgba(0,0,0,${(60 - state.bright) / 60 * 0.82})`; ctx.fillRect(0, 0, W, H);
  } else if (state.bright > 60) {
    ctx.fillStyle = `rgba(255,255,255,${(state.bright - 60) / 40 * 0.72})`; ctx.fillRect(0, 0, W, H);
  }

  // 遮擋
  if (state.occ > 0) {
    const w = W * (state.occ / 100);
    ctx.fillStyle = '#0b1220'; ctx.fillRect(W - w, 0, w, H);
    ctx.strokeStyle = '#F59E0B'; ctx.setLineDash([8, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W - w, 0); ctx.lineTo(W - w, H); ctx.stroke(); ctx.setLineDash([]);
  }

  // 雜訊
  if (state.noise > 0) {
    const n = Math.floor(state.noise * 26);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255 | 0},${Math.random() * 255 | 0},${Math.random() * 255 | 0},.55)`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
  }

  // 辨識框
  const ok = r.top === state.obj;
  const color = !ok ? '#ef4444' : (r.trueScore >= .7 ? '#22c55e' : '#eab308');
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash([12, 7]);
  ctx.strokeRect(W / 2 - 130, H / 2 - 130, 260, 250); ctx.setLineDash([]);
  ctx.fillStyle = color; ctx.fillRect(W / 2 - 130, H / 2 - 152, 168, 22);
  ctx.fillStyle = '#0f172a'; ctx.font = '700 13px Inter, sans-serif';
  ctx.fillText(`${r.top}  ${(r.ranked[0].s * 100).toFixed(1)}%`, W / 2 - 122, H / 2 - 136);
}

function renderBars(r) {
  barsEl.innerHTML = r.ranked.map((x, i) => `
    <div class="conf-row ${i === 0 ? 'top' : ''}">
      <div class="conf-label">${x.cls}${x.cls === state.obj ? ' ✓' : ''}</div>
      <div class="conf-track"><div class="conf-fill" style="width:${(x.s * 100).toFixed(1)}%"></div></div>
      <div class="conf-pct">${(x.s * 100).toFixed(1)}%</div>
    </div>`).join('');

  const ok = r.top === state.obj;
  if (!ok) {
    verdictEl.className = 'verdict bad';
    verdictEl.textContent = `❌ 誤判：模型認為這是「${r.top}」，但正確答案是「${state.obj}」`;
  } else if (r.trueScore < .5) {
    verdictEl.className = 'verdict warn';
    verdictEl.textContent = `⚠️ 答對了，但信心只有 ${(r.trueScore * 100).toFixed(1)}%——實務上通常會被門檻擋掉，要求重拍`;
  } else if (r.trueScore < .8) {
    verdictEl.className = 'verdict warn';
    verdictEl.textContent = `🟡 辨識正確，信心 ${(r.trueScore * 100).toFixed(1)}%：可用，但條件已經在變差`;
  } else {
    verdictEl.className = 'verdict good';
    verdictEl.textContent = `✅ 辨識正確，信心 ${(r.trueScore * 100).toFixed(1)}%`;
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

function checkQuests(r) {
  let newly = false;
  QUESTS.forEach(q => {
    if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; }
  });
  if (!newly) return;
  const p = loadP(); p.module1_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module1 = true;
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 三個挑戰都完成了！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p);
  renderQuests();
}

function update() {
  const r = infer();
  render(r); renderBars(r); checkQuests(r);
}

// ---------- 綁定 ----------
document.getElementById('objPick').innerHTML = OBJECTS.map(o =>
  `<div class="pick ${o.id === state.obj ? 'on' : ''}" data-obj="${o.id}">
     <span class="pick-ico">${o.ico}</span><div class="pick-name">${o.id}</div>
     <div class="pick-meta">${o.meta}</div></div>`).join('');

document.getElementById('objPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.obj = el.dataset.obj;
  document.querySelectorAll('#objPick .pick').forEach(p => p.classList.toggle('on', p === el));
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

const SLIDERS = [
  ['sBright', 'vBright', 'bright', v => v],
  ['sOcc',    'vOcc',    'occ',    v => v + '%'],
  ['sRot',    'vRot',    'rot',    v => v + '°'],
  ['sNoise',  'vNoise',  'noise',  v => v],
];
SLIDERS.forEach(([sid, vid, key, fmt]) => {
  const s = document.getElementById(sid), v = document.getElementById(vid);
  s.addEventListener('input', () => {
    state[key] = +s.value; v.textContent = fmt(s.value); update();
  });
});

document.getElementById('reset').addEventListener('click', () => {
  state.bright = 60; state.occ = 0; state.rot = 0; state.noise = 0;
  document.getElementById('sBright').value = 60; document.getElementById('vBright').textContent = '60';
  document.getElementById('sOcc').value = 0;     document.getElementById('vOcc').textContent = '0%';
  document.getElementById('sRot').value = 0;     document.getElementById('vRot').textContent = '0°';
  document.getElementById('sNoise').value = 0;   document.getElementById('vNoise').textContent = '0';
  update();
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
