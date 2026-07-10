// 鑽床 模組 4：轉速選配模擬
const PK = 'dpress_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// 5 段皮帶對應 RPM
const BELT_RPM = { 1: 500, 2: 720, 3: 1100, 4: 1700, 5: 2400 };

// 材料屬性（理想 SFM 範圍）
const MATERIALS = {
  wood: { name: '軟木', color: '#a16207', dust: '#92400e', idealSFM: [200, 500], hardness: 1, needOil: false },
  hardwood: { name: '硬木', color: '#78350f', dust: '#451a03', idealSFM: [150, 350], hardness: 1.8, needOil: false },
  aluminum: { name: '鋁', color: '#cbd5e1', dust: '#94a3b8', idealSFM: [200, 400], hardness: 2.5, needOil: true },
  steel: { name: '不鏽鋼', color: '#475569', dust: '#94a3b8', idealSFM: [30, 80], hardness: 4, needOil: true },
};

const cv = document.getElementById('dpress-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);
const els = {
  mat: $('material'), dia: $('s-dia'), belt: $('s-belt'),
  vDia: $('v-dia'), vBelt: $('v-belt'), vRec: $('v-recommend'),
  eSfm: $('e-sfm'), eCut: $('e-cut'), eHeat: $('e-heat'), eOil: $('e-oil'),
  verdict: $('verdict'),
  start: $('btn-drill'), reset: $('btn-reset'),
};

let state = {
  drilling: false,
  bitY: 80,
  holeDepth: 0,
  chips: [],
  smoke: [],
  startTime: 0,
};

function calc() {
  const m = MATERIALS[els.mat.value];
  const dia = parseFloat(els.dia.value);
  const belt = parseInt(els.belt.value);
  const rpm = BELT_RPM[belt];
  // SFM = RPM × dia(inches) × π / 12 — but use mm 簡化
  const sfm = Math.round(rpm * (dia / 25.4) * Math.PI / 12);
  const ideal = m.idealSFM;
  // 推薦轉速：用理想 SFM 的中位
  const idealMid = (ideal[0] + ideal[1]) / 2;
  const recRpm = Math.round(idealMid * 12 / Math.PI / (dia / 25.4));
  const bestBelt = Object.entries(BELT_RPM).reduce((best, [b, r]) => Math.abs(r - recRpm) < Math.abs(BELT_RPM[best] - recRpm) ? parseInt(b) : best, 3);
  let cutLabel = 'OK';
  if (sfm < ideal[0] * 0.6) cutLabel = '太慢';
  else if (sfm > ideal[1] * 1.4) cutLabel = '太快';
  else if (sfm < ideal[0] || sfm > ideal[1]) cutLabel = '可接受';
  else cutLabel = '理想';
  // 過熱：SFM 過高 + 硬材料
  const heatScore = Math.max(0, (sfm - ideal[1]) / ideal[1]) * m.hardness;
  const heatLabel = heatScore < 0.3 ? '低' : heatScore < 0.8 ? '中' : '高';
  return { m, dia, belt, rpm, sfm, ideal, cutLabel, heatScore, heatLabel, bestBelt, recRpm };
}

function updateValueDisplays() {
  els.vDia.textContent = els.dia.value + ' mm';
  els.vBelt.textContent = `第 ${els.belt.value} 段（${BELT_RPM[els.belt.value]} RPM）`;
  document.querySelectorAll('.speed-cell').forEach(c => c.classList.toggle('active', parseInt(c.dataset.b) === parseInt(els.belt.value)));
}

function updateEstimates() {
  const r = calc();
  els.vRec.textContent = `第 ${r.bestBelt} 段（${BELT_RPM[r.bestBelt]} RPM）`;
  els.vRec.style.color = r.bestBelt === r.belt ? '#22c55e' : '#eab308';
  els.eSfm.textContent = `${r.sfm} ft/min`;
  els.eCut.textContent = r.cutLabel;
  els.eCut.style.color = r.cutLabel === '理想' ? '#22c55e' : r.cutLabel === '可接受' ? '#eab308' : '#dc2626';
  els.eHeat.textContent = r.heatLabel;
  els.eHeat.style.color = r.heatLabel === '低' ? '#22c55e' : r.heatLabel === '中' ? '#eab308' : '#dc2626';
  els.eOil.textContent = r.m.needOil ? '需要（金屬鑽孔）' : '不需要';
  els.eOil.style.color = r.m.needOil ? '#eab308' : '#22c55e';
}

function drawScene() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  const r = calc();
  // 立柱
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(W/2 + 80, 50, 24, H - 100);
  // 工作台
  ctx.fillStyle = '#14532D';
  ctx.fillRect(W/2 - 180, H - 200, 360, 28);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(W/2 - 180, H - 202, 360, 6);
  // 工件
  ctx.fillStyle = r.m.color;
  ctx.fillRect(W/2 - 90, H - 220, 180, 18);
  // 已鑽的孔
  if (state.holeDepth > 0) {
    ctx.fillStyle = '#000';
    const hr = r.dia * 0.8;
    ctx.beginPath();
    ctx.ellipse(W/2, H - 213, hr, hr * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(W/2 - hr, H - 218, hr * 2, Math.min(state.holeDepth, 18));
  }
  // 主軸
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(W/2 - 8, 80, 16, state.bitY - 80);
  // 夾頭
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(W/2 - 18, state.bitY, 36, 40);
  // 鑽頭
  const bitW = r.dia * 1.2;
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(W/2 - bitW/2, state.bitY + 40, bitW, H - 218 - (state.bitY + 40) + state.holeDepth);
  ctx.beginPath();
  ctx.moveTo(W/2 - bitW/2, H - 218 + state.holeDepth);
  ctx.lineTo(W/2 + bitW/2, H - 218 + state.holeDepth);
  ctx.lineTo(W/2, H - 210 + state.holeDepth);
  ctx.closePath();
  ctx.fillStyle = '#4b5563';
  ctx.fill();
  // 機身（頭部）
  ctx.fillStyle = '#15803D';
  ctx.fillRect(W/2 - 100, 30, 200, 60);
  ctx.fillStyle = '#22c55e';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`${r.rpm} RPM · BELT ${r.belt}`, W/2, 65);

  // 木屑
  state.chips.forEach(c => {
    ctx.fillStyle = r.m.dust;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
  // 過熱煙霧
  state.smoke.forEach(s => {
    ctx.fillStyle = `rgba(150,150,150,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  // 訊息列
  ctx.fillStyle = '#22c55e';
  ctx.font = '700 13px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`${r.m.name} · ⌀${r.dia}mm · SFM ${r.sfm} · ${r.cutLabel}`, 14, 24);
}

function tickSim() {
  if (!state.drilling) return;
  const r = calc();
  const speedFactor = r.cutLabel === '理想' ? 1 : r.cutLabel === '可接受' ? 0.7 : r.cutLabel === '太快' ? 0.4 : 0.3;
  state.bitY += 0.5 * speedFactor;
  state.holeDepth += 0.5 * speedFactor;

  if (Math.random() < 0.4 * speedFactor) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    state.chips.push({
      x: W/2 + dir * (r.dia * 1.5 + Math.random() * 16),
      y: H - 215 + Math.random() * 8,
      r: 2 + Math.random() * 3,
      vy: -1 - Math.random() * 2,
      vx: dir * (1 + Math.random() * 2),
      life: 60,
    });
  }
  if (r.heatScore > 0.5 && Math.random() < r.heatScore * 0.3) {
    state.smoke.push({
      x: W/2 + (Math.random() - 0.5) * 18,
      y: H - 210,
      r: 3 + Math.random() * 3,
      alpha: 0.6,
      vy: -0.7,
    });
  }
  state.chips = state.chips.filter(c => { c.x += c.vx; c.y += c.vy; c.vy += 0.1; c.life--; return c.life > 0; });
  state.smoke = state.smoke.filter(s => { s.y += s.vy; s.r += 0.2; s.alpha -= 0.015; return s.alpha > 0; });

  if (state.holeDepth >= 18) {
    state.drilling = false;
    showResult();
  }
}

function showResult() {
  const r = calc();
  const dur = ((Date.now() - state.startTime) / 1000).toFixed(1);
  let level = 'good', msg = '';
  if (r.cutLabel === '太快' && r.heatScore > 0.8) {
    level = 'bad';
    msg = `❌ 轉速太高造成過熱燒孔。${r.m.name} 應該用第 ${r.bestBelt} 段（${BELT_RPM[r.bestBelt]} RPM）。`;
  } else if (r.cutLabel === '太慢') {
    level = 'bad';
    msg = `❌ 轉速太低，切削效率差、鑽頭容易卡。應該調到第 ${r.bestBelt} 段。`;
  } else if (r.cutLabel !== '理想' || (r.m.needOil && !r.m.needOil)) {
    level = 'warn';
    msg = `⚠ 可接受但不理想（SFM ${r.sfm}，理想 ${r.ideal[0]}–${r.ideal[1]}）。耗時 ${dur} 秒。`;
  } else {
    level = 'good';
    msg = `✓ 完美鑽孔！SFM ${r.sfm} 在理想範圍。耗時 ${dur} 秒。${r.m.needOil ? '提醒：實際操作金屬鑽孔要加切削油。' : ''}`;
    const prog = loadP();
    prog.module4 = true;
    saveP(prog);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
  }
  els.verdict.className = 'verdict ' + level;
  els.verdict.textContent = msg;
}

function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  tickSim();
  drawScene();
  requestAnimationFrame(loop);
}

function startDrill() {
  state.drilling = true;
  state.bitY = 100;
  state.holeDepth = 0;
  state.chips = [];
  state.smoke = [];
  state.startTime = Date.now();
  els.verdict.className = 'verdict warn';
  els.verdict.textContent = '⚙ 鑽孔中...';
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
}
function resetSim() {
  state.drilling = false;
  state.bitY = 100;
  state.holeDepth = 0;
  state.chips = [];
  state.smoke = [];
  els.verdict.className = 'verdict warn';
  els.verdict.textContent = '點「開始鑽孔」看結果';
}

['mat', 'dia', 'belt'].forEach(k => els[k].addEventListener('input', () => { updateValueDisplays(); updateEstimates(); }));
document.querySelectorAll('.speed-cell').forEach(c => c.addEventListener('click', () => {
  els.belt.value = c.dataset.b;
  updateValueDisplays(); updateEstimates();
}));
els.start.addEventListener('click', startDrill);
els.reset.addEventListener('click', resetSim);

updateValueDisplays();
updateEstimates();
resetSim();
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});