// 機電整合 模組 2：循跡感測器二值化
// 示意模型：反射讀值 = f(表面反射率, 離地高度, 環境光)，呈現影響方向與相對大小。

const PK = 'mecha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const SURFACES = [
  { id: 'ideal', ico: '⬛', name: '霧面黑膠帶 / 白紙', kb: 0.08, kw: 0.90, meta: '標準組合，對比最好' },
  { id: 'gloss', ico: '✨', name: '亮面黑膠帶 / 白紙', kb: 0.26, kw: 0.90, meta: '亮面會鏡射，黑線讀值偏高' },
  { id: 'wood',  ico: '🪵', name: '霧面黑膠帶 / 木質桌面', kb: 0.08, kw: 0.55, meta: '底色偏暗，對比縮小' },
  { id: 'gray',  ico: '🩶', name: '深灰線 / 淺灰地板', kb: 0.34, kw: 0.62, meta: '最難分辨的組合' },
];

const state = { surf: 'ideal', amb: 40, h: 5, th: 500 };
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

// 讀值模型：高度偏離最佳值(5mm)會衰減訊號；環境光抬高整體底線並壓縮動態範圍
function reading(k) {
  const hPen = Math.min(1, Math.abs(state.h - 5) / 12);        // 0~1
  const signal = k * (1 - hPen * 0.55);                        // 高度不對 → 訊號變弱
  const ambLift = state.amb / 100 * 0.42;                      // 環境光整體抬升
  const compress = 1 - state.amb / 100 * 0.35;                 // 動態範圍被壓縮
  const val = (signal * compress + ambLift) * 1023;
  return Math.max(0, Math.min(1023, Math.round(val)));
}

function compute() {
  const s = SURFACES.find(x => x.id === state.surf);
  const black = reading(s.kb), white = reading(s.kw);
  const gap = white - black;
  const okBlack = black < state.th;    // 黑線應判為「有線」
  const okWhite = white >= state.th;   // 白底應判為「無線」
  return { black, white, gap, okBlack, okWhite, correct: okBlack && okWhite, surf: s };
}

function draw(r) {
  const W = cv.width, H = cv.height, pad = { l: 56, r: 20, t: 26, b: 40 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const Y = v => pad.t + ph - (v / 1023) * ph;

  // 刻度
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'right';
  for (let v = 0; v <= 1023; v += 256) {
    ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(W - pad.r, Y(v)); ctx.stroke();
    ctx.fillText(v, pad.l - 8, Y(v) + 4);
  }
  ctx.save(); ctx.translate(16, H / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center'; ctx.fillText('類比讀值', 0, 0); ctx.restore();

  // 兩根長條
  const bw = 110, gapX = 90;
  const x1 = pad.l + gapX, x2 = pad.l + gapX + bw + gapX;

  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
  ctx.fillRect(x1, Y(r.black), bw, pad.t + ph - Y(r.black));
  ctx.strokeRect(x1, Y(r.black), bw, pad.t + ph - Y(r.black));

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x2, Y(r.white), bw, pad.t + ph - Y(r.white));

  ctx.textAlign = 'center'; ctx.font = '700 13px Inter, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('黑線上', x1 + bw / 2, H - 18);
  ctx.fillText('白底上', x2 + bw / 2, H - 18);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '900 15px "JetBrains Mono", monospace';
  ctx.fillText(r.black, x1 + bw / 2, Y(r.black) - 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(r.white, x2 + bw / 2, Y(r.white) + 20);

  // 閾值線
  ctx.strokeStyle = '#F97316'; ctx.lineWidth = 3; ctx.setLineDash([9, 6]);
  ctx.beginPath(); ctx.moveTo(pad.l, Y(state.th)); ctx.lineTo(W - pad.r, Y(state.th)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#F97316'; ctx.fillRect(W - pad.r - 74, Y(state.th) - 11, 72, 20);
  ctx.fillStyle = '#0f172a'; ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('閾值 ' + state.th, W - pad.r - 38, Y(state.th) + 3);

  // 判讀標記
  ctx.font = '900 14px Inter, sans-serif';
  ctx.fillStyle = r.okBlack ? '#22c55e' : '#ef4444';
  ctx.fillText(r.okBlack ? '✓ 判為黑線' : '✗ 誤判成白底', x1 + bw / 2, pad.t - 8);
  ctx.fillStyle = r.okWhite ? '#22c55e' : '#ef4444';
  ctx.fillText(r.okWhite ? '✓ 判為白底' : '✗ 誤判成黑線', x2 + bw / 2, pad.t - 8);
}

const QUESTS = [
  { id: 'q_ok',   text: '在「亮面黑膠帶」組合下，仍讓兩邊都判讀正確', hint: '亮面會讓黑線讀值變高，閾值要往上調',
    test: (r) => state.surf === 'gloss' && r.correct },
  { id: 'q_fail', text: '製造一次誤判（任一邊判錯）', hint: '把閾值拉到極端，或試試最難的深灰組合',
    test: (r) => !r.correct },
  { id: 'q_hard', text: '在「深灰線／淺灰地板」下找到可行的閾值', hint: '分離度很小，閾值必須剛好落在兩個讀值之間',
    test: (r) => state.surf === 'gray' && r.correct },
];
const done = new Set(loadP().module2_quests || []);

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
  const r = compute();
  draw(r);
  document.getElementById('blackVal').textContent = r.black;
  document.getElementById('whiteVal').textContent = r.white;
  document.getElementById('gapVal').textContent = r.gap;

  const v = document.getElementById('verdict');
  if (!r.correct) {
    v.className = 'verdict bad';
    v.textContent = !r.okBlack
      ? '❌ 黑線被判成白底：閾值太低，車子會以為自己脫線。'
      : '❌ 白底被判成黑線：閾值太高，車子會到處都看到線。';
  } else if (r.gap < 300) {
    v.className = 'verdict warn';
    v.textContent = `🟡 判讀正確，但分離度只有 ${r.gap}——稍微晃動或換個場地就會出錯，實務上很危險。`;
  } else {
    v.className = 'verdict good';
    v.textContent = `✅ 判讀正確，分離度 ${r.gap}，有足夠的容錯空間。`;
  }

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

function renderSurf() {
  document.getElementById('surfPick').innerHTML = SURFACES.map(s =>
    `<div class="pick ${s.id === state.surf ? 'on' : ''}" data-s="${s.id}">
      <span class="pick-ico">${s.ico}</span><div class="pick-name" style="font-size:13px">${s.name}</div>
      <div class="pick-meta">${s.meta}</div></div>`).join('');
}
renderSurf();

document.getElementById('surfPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.surf = el.dataset.s; renderSurf();
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

const ambLabel = v => v < 20 ? '昏暗' : v < 55 ? '正常' : v < 80 ? '明亮' : '陽光直射';
document.getElementById('sAmb').addEventListener('input', e => {
  state.amb = +e.target.value; document.getElementById('vAmb').textContent = ambLabel(state.amb); update();
});
document.getElementById('sH').addEventListener('input', e => {
  state.h = +e.target.value; document.getElementById('vH').textContent = state.h + ' mm'; update();
});
document.getElementById('sTh').addEventListener('input', e => {
  state.th = +e.target.value; document.getElementById('vTh').textContent = state.th; update();
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
