// 砂磨機 模組 4：粒度與表面模擬
const PK = 'sander_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const GRITS = [60, 80, 120, 180, 240, 320];
// 每粒度對應的 Ra 值（μm，估算）
const GRIT_RA = { 60: 15, 80: 10, 120: 6, 180: 3, 240: 1.5, 320: 0.8 };
const MATERIALS = {
  softwood: { name: '軟木', color: '#fde68a', burnColor: '#451a03', hardness: 1, idealGrit: [80, 180] },
  hardwood: { name: '硬木', color: '#d4a373', burnColor: '#1c0f02', hardness: 1.8, idealGrit: [120, 240] },
  plastic: { name: '塑膠', color: '#67e8f9', burnColor: '#0c4a6e', hardness: 1.2, idealGrit: [180, 320] },
  aluminum: { name: '鋁', color: '#cbd5e1', burnColor: '#475569', hardness: 2.5, idealGrit: [180, 320] },
};

const cv = document.getElementById('sander-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);
const els = {
  mat: $('material'), grit: $('s-grit'), feed: $('s-feed'), time: $('s-time'),
  vGrit: $('v-grit'), vFeed: $('v-feed'), vTime: $('v-time'),
  eRemove: $('e-remove'), eRa: $('e-ra'), eHeat: $('e-heat'), eNext: $('e-next'),
  verdict: $('verdict'),
  start: $('btn-sand'), reset: $('btn-reset'),
};

const FEED_LABELS = ['', '極慢', '慢', '中', '快', '極快'];
let state = {
  sanding: false,
  beltOffset: 0,
  workpieceX: 200,
  dust: [],
  smoke: [],
  surface: 1.0, // 0 = smooth, 1 = rough
  burned: false,
  startTime: 0,
};

function calc() {
  const m = MATERIALS[els.mat.value];
  const gi = parseInt(els.grit.value);
  const grit = GRITS[gi];
  const feed = parseInt(els.feed.value);
  const time = parseInt(els.time.value);
  const baseRa = GRIT_RA[grit];
  const ra = baseRa.toFixed(1);
  // 去料量：粗粒度 × 時間 × 進料速度
  const remove = Math.round((1 / (gi + 1)) * time * feed * 30) / 10;
  // 過熱：時間長 + 進料慢 + 硬材料
  const heatScore = (time / 5) * (1 / (feed / 3)) * m.hardness;
  const heatLabel = heatScore < 0.7 ? '低' : heatScore < 1.3 ? '中' : heatScore < 2.0 ? '高' : '極高';
  // 下一級粒度建議
  let nextGrit = '已是最細';
  if (gi < GRITS.length - 1) nextGrit = `下一級用 ${GRITS[gi + 1]} 號`;
  return { m, grit, gi, feed, time, ra, remove, heatScore, heatLabel, nextGrit };
}

function updateValueDisplays() {
  els.vGrit.textContent = `${GRITS[els.grit.value]} 號`;
  els.vFeed.textContent = FEED_LABELS[parseInt(els.feed.value)];
  els.vTime.textContent = `${els.time.value} 秒`;
  document.querySelectorAll('.grit-cell').forEach(c => c.classList.toggle('active', parseInt(c.dataset.g) === parseInt(els.grit.value)));
}
function updateEstimates() {
  const r = calc();
  els.eRemove.textContent = `${r.remove} mm`;
  els.eRa.textContent = `${r.ra} μm`;
  els.eHeat.textContent = r.heatLabel;
  els.eHeat.style.color = r.heatLabel === '低' ? '#22c55e' : r.heatLabel === '中' ? '#eab308' : '#dc2626';
  els.eNext.textContent = r.nextGrit;
}

function drawScene() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  const r = calc();

  // 砂帶與滾輪
  const beltY = 220;
  const wheelR = 60;
  // 左輪
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.arc(150, beltY, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(150, beltY, 12, 0, Math.PI * 2);
  ctx.fill();
  // 右輪
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.arc(610, beltY, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(610, beltY, 12, 0, Math.PI * 2);
  ctx.fill();
  // 砂帶（含粒度感）
  const gritSize = 4 - r.gi * 0.5;
  ctx.fillStyle = '#92400e';
  ctx.fillRect(150, beltY - wheelR, 460, 12);
  ctx.fillRect(150, beltY + wheelR - 12, 460, 12);
  // 砂粒紋理（移動）
  if (state.sanding) state.beltOffset = (state.beltOffset + r.feed) % 14;
  ctx.fillStyle = '#451a03';
  for (let x = 150 - 14 + state.beltOffset; x < 610; x += 14) {
    ctx.beginPath();
    ctx.arc(x, beltY - wheelR + 6, gritSize, 0, Math.PI * 2);
    ctx.fill();
  }
  // 工作面
  ctx.fillStyle = '#5b21b6';
  ctx.fillRect(150, beltY - wheelR - 8, 460, 8);

  // 工件
  const wpX = state.workpieceX;
  const wpY = beltY - wheelR - 25;
  ctx.fillStyle = state.burned ? r.m.burnColor : r.m.color;
  ctx.fillRect(wpX, wpY, 100, 20);
  // 工件表面紋理（粗糙感）
  ctx.strokeStyle = `rgba(0,0,0,${state.surface * 0.5})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(wpX + i * 18, wpY + 2 + Math.sin(i) * state.surface * 3);
    ctx.lineTo(wpX + i * 18, wpY + 18 + Math.cos(i) * state.surface * 3);
    ctx.stroke();
  }

  // 靠尺
  ctx.fillStyle = '#5b21b6';
  ctx.fillRect(150, wpY - 30, 460, 18);

  // 粉塵粒子
  state.dust.forEach(d => {
    ctx.fillStyle = `rgba(146,64,14,${d.alpha})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
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
  ctx.fillStyle = '#A78BFA';
  ctx.font = '700 13px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`${r.m.name} · ${r.grit} 號 · ${FEED_LABELS[r.feed]}速 · ${r.time}s · Ra ${r.ra}μm`, 14, 32);
}

function tickSim() {
  if (!state.sanding) return;
  const r = calc();
  // 工件移動
  state.workpieceX += r.feed * 0.4;
  // 表面變光滑（Ra 越小越光滑）
  state.surface = Math.max(0, state.surface - (1 / (r.gi + 1)) * 0.005);
  // 產生粉塵
  if (Math.random() < 0.5) {
    state.dust.push({
      x: state.workpieceX + Math.random() * 100,
      y: 220 - 60 - 15,
      r: 1.5 + Math.random() * 2,
      vy: -1 - Math.random() * 2,
      vx: (Math.random() - 0.5) * 3,
      alpha: 0.7,
    });
  }
  // 過熱
  if (r.heatScore > 1.3 && Math.random() < (r.heatScore - 1) * 0.3) {
    state.smoke.push({
      x: state.workpieceX + 50,
      y: 220 - 60 - 25,
      r: 4 + Math.random() * 4,
      alpha: 0.7,
      vy: -0.8,
    });
    if (r.heatScore > 1.8 && Math.random() < 0.05) state.burned = true;
  }
  // 粒子更新
  state.dust = state.dust.filter(d => { d.x += d.vx; d.y += d.vy; d.alpha -= 0.015; return d.alpha > 0; });
  state.smoke = state.smoke.filter(s => { s.y += s.vy; s.r += 0.2; s.alpha -= 0.012; return s.alpha > 0; });

  // 結束條件
  if (state.workpieceX > 500 || (Date.now() - state.startTime) / 1000 > r.time) {
    state.sanding = false;
    showResult();
  }
}

function showResult() {
  const r = calc();
  let level = 'good', msg = '';
  if (state.burned) {
    level = 'bad';
    msg = `❌ 工件焦黑！接觸時間太長 / 進料太慢，表面已燒毀無法救。應該${r.feed < 3 ? '加快進料' : '縮短接觸時間'}。`;
  } else if (r.heatScore > 1.5) {
    level = 'bad';
    msg = `⚠ 過熱嚴重，工件溫度過高。實際操作會燒焦或退火。降低接觸時間或加快進料。`;
  } else if (r.gi === 0 || r.gi >= 5) {
    level = 'warn';
    msg = `⚠ 粒度極端：${r.grit < 80 ? '太粗、表面留深紋' : '太細、磨削效率低'}。建議中間粒度。表面 Ra = ${r.ra}μm。`;
  } else if (r.gi >= r.m.idealGrit[0]/GRITS[r.gi] && r.heatScore < 1.0) {
    level = 'good';
    msg = `✓ 砂磨完美！表面 Ra = ${r.ra}μm，過熱風險${r.heatLabel}。建議下一步：${r.nextGrit}。`;
    const prog = loadP();
    prog.module4 = true;
    saveP(prog);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
  } else {
    level = 'warn';
    msg = `⚠ 可接受但不理想。表面 Ra = ${r.ra}μm。建議：${r.nextGrit}。`;
  }
  els.verdict.className = 'verdict ' + level;
  els.verdict.textContent = msg;
}

function loop() {
  tickSim();
  drawScene();
  requestAnimationFrame(loop);
}

function startSand() {
  state.sanding = true;
  state.workpieceX = 180;
  state.surface = 1.0;
  state.burned = false;
  state.dust = [];
  state.smoke = [];
  state.startTime = Date.now();
  els.verdict.className = 'verdict warn';
  els.verdict.textContent = '⚙ 砂磨中...';
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
}
function resetSim() {
  state.sanding = false;
  state.workpieceX = 200;
  state.surface = 1.0;
  state.burned = false;
  state.dust = [];
  state.smoke = [];
  els.verdict.className = 'verdict warn';
  els.verdict.textContent = '點「開始砂磨」看結果';
}

['mat', 'grit', 'feed', 'time'].forEach(k => els[k].addEventListener('input', () => { updateValueDisplays(); updateEstimates(); }));
document.querySelectorAll('.grit-cell').forEach(c => c.addEventListener('click', () => {
  els.grit.value = c.dataset.g;
  updateValueDisplays(); updateEstimates();
}));
els.start.addEventListener('click', startSand);
els.reset.addEventListener('click', resetSim);

updateValueDisplays();
updateEstimates();
resetSim();
loop();
