// 雷射切割 模組 4：參數試切模擬器
// 模型：線能量 E = 功率(W) / 速度(mm/s)  [J/mm]；切透門檻 th = k × 板厚。
// k 值由 80W 機台的建議參數反推校準（木板3mm 20mm/s 65%、壓克力3mm 17.5mm/s 60%、
// MDF3mm 15mm/s 65% 三組皆精確落在 E/th = 1.00），詳見 VERIFICATION.md。
// 這是教學用示意模型，呈現趨勢與相對關係，實務仍須試切。

const PK = 'laser_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const MAX_W = 80;   // 機台額定功率
const MATS = [
  { id: 'wood',    ico: '🪵', name: '合板',      k: 0.87, burn: 1.9, col: '#B45309', char: '#3F2410', meta: '最常用' },
  { id: 'acrylic', ico: '💎', name: '壓克力',    k: 0.91, burn: 2.2, col: '#7DD3FC', char: '#0C4A6E', meta: '切面會亮' },
  { id: 'mdf',     ico: '🟫', name: 'MDF 密迪板', k: 1.16, burn: 1.8, col: '#A16207', char: '#292014', meta: '較密、要更多能量' },
  { id: 'card',    ico: '📦', name: '厚紙板',    k: 0.22, burn: 2.6, col: '#D6BC97', char: '#4A3520', meta: '極易燒，功率要小' },
];

const state = { mat: 'wood', t: 3, v: 20, p: 65, mode: 'cut' };
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

function evaluate() {
  const m = MATS.find(x => x.id === state.mat);
  const E = (state.p / 100 * MAX_W) / state.v;
  const th = m.k * state.t;
  const r = E / th;
  let level;
  if (r < 0.55) level = 'mark';         // 只留痕跡
  else if (r < 0.9) level = 'partial';  // 深痕未斷
  else if (r <= 1.45) level = 'clean';  // 剛好切透
  else if (r <= m.burn) level = 'burn';  // 切透但焦黑
  else level = 'fire';                   // 碳化/起火風險
  return { m, E, th, r, level };
}

// ---------- 繪圖：板材側面剖視 ----------
function draw(res) {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const m = res.m;
  const slabW = 520, slabX = (W - slabW) / 2;
  const pxPerMm = 18;
  const slabH = state.t * pxPerMm;
  const slabY = H / 2 - slabH / 2 + 14;

  // 蜂巢工作台
  ctx.fillStyle = '#0b1220'; ctx.fillRect(slabX - 40, slabY + slabH, slabW + 80, 26);
  ctx.fillStyle = '#1e293b';
  for (let x = slabX - 30; x < slabX + slabW + 40; x += 22) {
    ctx.beginPath(); ctx.arc(x, slabY + slabH + 13, 6, 0, Math.PI * 2); ctx.fill();
  }

  const cutX = slabX + slabW / 2;
  const kerfTop = 9, kerfBot = 4;                     // 切縫上寬下窄（雷射錐形）
  const depth = Math.min(1, res.r) * slabH;
  const through = res.r >= 0.9;

  // 板材本體
  ctx.fillStyle = m.col;
  if (through) {
    ctx.fillRect(slabX, slabY, (slabW / 2) - kerfTop / 2, slabH);
    ctx.fillRect(cutX + kerfTop / 2, slabY, (slabW / 2) - kerfTop / 2, slabH);
  } else {
    ctx.fillRect(slabX, slabY, slabW, slabH);
    // 切縫凹槽
    ctx.fillStyle = '#0b1220';
    ctx.beginPath();
    ctx.moveTo(cutX - kerfTop / 2, slabY);
    ctx.lineTo(cutX + kerfTop / 2, slabY);
    ctx.lineTo(cutX + kerfBot / 2, slabY + depth);
    ctx.lineTo(cutX - kerfBot / 2, slabY + depth);
    ctx.closePath(); ctx.fill();
  }

  // 焦黑程度（依超出量）
  const over = Math.max(0, res.r - 1.2);
  if (over > 0) {
    const spread = Math.min(46, over * 34);
    const g = ctx.createLinearGradient(cutX - spread, 0, cutX + spread, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(.5, m.char);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(.92, .35 + over * .4);
    ctx.fillStyle = g; ctx.fillRect(cutX - spread, slabY, spread * 2, slabH);
    ctx.globalAlpha = 1;
  }

  // 板材上下緣
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(slabX, slabY); ctx.lineTo(slabX + slabW, slabY); ctx.stroke();

  // 雷射頭與光束
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(cutX - 17, slabY - 82, 34, 40);
  ctx.fillStyle = '#64748b';
  ctx.beginPath(); ctx.moveTo(cutX - 9, slabY - 42); ctx.lineTo(cutX + 9, slabY - 42);
  ctx.lineTo(cutX + 4, slabY - 26); ctx.lineTo(cutX - 4, slabY - 26); ctx.closePath(); ctx.fill();
  const beam = ctx.createLinearGradient(0, slabY - 26, 0, slabY + depth);
  beam.addColorStop(0, 'rgba(239,68,68,.95)'); beam.addColorStop(1, 'rgba(252,165,165,.25)');
  ctx.strokeStyle = beam; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cutX, slabY - 26); ctx.lineTo(cutX, slabY + (through ? slabH : depth)); ctx.stroke();

  // 火焰/煙
  if (res.level === 'fire') {
    ctx.fillStyle = 'rgba(251,146,60,.85)';
    for (let i = 0; i < 7; i++) {
      const fx = cutX + (Math.random() - .5) * 34, fy = slabY - Math.random() * 34;
      ctx.beginPath(); ctx.arc(fx, fy, 3 + Math.random() * 5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (res.level === 'burn') {
    ctx.fillStyle = 'rgba(148,163,184,.5)';
    for (let i = 0; i < 5; i++) {
      const fx = cutX + (Math.random() - .5) * 26, fy = slabY - Math.random() * 26;
      ctx.beginPath(); ctx.arc(fx, fy, 3 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 標註
  ctx.font = '700 12px Inter, sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'left';
  ctx.fillText(`${res.m.name}　${state.t} mm　${state.v} mm/s　${state.p}%`, 14, 22);
  ctx.textAlign = 'right';
  ctx.fillText('板材側面剖視圖', W - 14, 22);

  // 厚度標尺
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(slabX - 16, slabY); ctx.lineTo(slabX - 16, slabY + slabH); ctx.stroke();
  ctx.textAlign = 'right'; ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif';
  ctx.fillText(state.t + 'mm', slabX - 22, slabY + slabH / 2 + 4);
}

// ---------- 更新 ----------
const VERDICTS = {
  mark:    { cls: 'bad',  txt: r => `❌ 只在表面留下痕跡（能量僅需求的 ${(r * 100).toFixed(0)}%）。當雕刻可以，當切割完全不行。` },
  partial: { cls: 'bad',  txt: r => `❌ 切痕很深但沒斷（${(r * 100).toFixed(0)}%）。用手一折會裂開、邊緣毛躁——這是最浪費時間的狀態，因為看起來快成功了。` },
  clean:   { cls: 'good', txt: r => `✅ 剛好切透，邊緣乾淨（${(r * 100).toFixed(0)}%）。這就是你要找的參數。` },
  burn:    { cls: 'warn', txt: r => `🟡 切透了，但能量過多（${(r * 100).toFixed(0)}%）：切縫變寬、兩側焦黑、有煙燻味，壓克力還會霧化。` },
  fire:    { cls: 'bad',  txt: r => `🔥 能量嚴重過量（${(r * 100).toFixed(0)}%）：材料碳化、可能起火。<strong>絕對不能離開機器</strong>。` },
};

function update() {
  const res = evaluate();
  draw(res);
  document.getElementById('eVal').textContent = res.E.toFixed(2) + ' J/mm';
  document.getElementById('thVal').textContent = res.th.toFixed(2) + ' J/mm';
  document.getElementById('rVal').textContent = (res.r * 100).toFixed(0) + ' %';

  const v = document.getElementById('verdict');
  const d = VERDICTS[res.level];
  v.className = 'verdict ' + d.cls;
  v.innerHTML = d.txt(res.r);

  if (state.mode === 'engrave' && res.r >= 0.9) {
    v.className = 'verdict bad';
    v.innerHTML = `⚠️ 你選的是<strong>雕刻</strong>，但這組參數已經把板子切透了——雕刻的能量應該遠低於切透門檻。`;
  }
  check(res);
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_clean', text: '把 3 mm 合板「剛好切透、邊緣乾淨」', hint: '說明書的起點：約 20 mm/s、65%',
    test: (r) => state.mat === 'wood' && state.t === 3 && r.level === 'clean' },
  { id: 'q_under', text: '做出「切痕很深但沒斷」的失敗狀態', hint: '把速度調快一點，或功率降一點',
    test: (r) => r.level === 'partial' },
  { id: 'q_burn',  text: '做出「切透但邊緣焦黑」', hint: '速度調得很慢，或功率拉滿',
    test: (r) => r.level === 'burn' || r.level === 'fire' },
  { id: 'q_thick', text: '挑戰厚板：把 5 mm 的 MDF 也乾淨切透', hint: 'MDF 比合板密，同樣厚度要更多能量',
    test: (r) => state.mat === 'mdf' && state.t === 5 && r.level === 'clean' },
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

function check(res) {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(res)) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module4_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module4 = true;
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 四個挑戰都完成了！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p); renderQuests();
}

// ---------- 綁定 ----------
function renderMats() {
  document.getElementById('matPick').innerHTML = MATS.map(m =>
    `<div class="pick ${m.id === state.mat ? 'on' : ''}" data-m="${m.id}">
      <span class="pick-ico">${m.ico}</span><div class="pick-name">${m.name}</div>
      <div class="pick-meta">${m.meta}</div></div>`).join('');
}
renderMats();

document.getElementById('matPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.mat = el.dataset.m; renderMats();
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

const sV = document.getElementById('sV'), sP = document.getElementById('sP'), sT = document.getElementById('sT');
sT.addEventListener('input', () => { state.t = +sT.value; document.getElementById('vT').textContent = state.t + ' mm'; update(); });
sV.addEventListener('input', () => { state.v = +sV.value; document.getElementById('vV').textContent = state.v + ' mm/s'; update(); });
sP.addEventListener('input', () => { state.p = +sP.value; document.getElementById('vP').textContent = state.p + ' %'; update(); });

document.getElementById('modePick').addEventListener('click', e => {
  const b = e.target.closest('button[data-m]'); if (!b) return;
  state.mode = b.dataset.m;
  document.querySelectorAll('#modePick button').forEach(x => {
    const on = x === b;
    x.className = 'btn ' + (on ? 'btn-primary' : 'btn-ghost');
    x.style.flex = '1';
  });
  // 切換模式時調整速度範圍（雕刻速度遠高於切割）
  if (state.mode === 'engrave') {
    sV.min = 100; sV.max = 500; sV.step = 10;
    if (state.v < 100) { state.v = 300; sV.value = 300; }
    sP.max = 60; if (state.p > 60) { state.p = 20; sP.value = 20; }
  } else {
    sV.min = 5; sV.max = 60; sV.step = 1;
    if (state.v > 60) { state.v = 20; sV.value = 20; }
    sP.max = 100;
  }
  document.getElementById('vV').textContent = state.v + ' mm/s';
  document.getElementById('vP').textContent = state.p + ' %';
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
update();
