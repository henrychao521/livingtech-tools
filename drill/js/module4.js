// 手電鑽 模組 4：鑽孔參數模擬
const PK = 'drill_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// 材料屬性
const MATERIALS = {
  wood: { name: '軟木', color: '#a16207', dust: '#92400e', maxRPM: 2000, idealBit: 'wood', hardness: 1, dustType: 'curl' },
  hardwood: { name: '硬木', color: '#78350f', dust: '#451a03', maxRPM: 1500, idealBit: 'wood', hardness: 2, dustType: 'curl' },
  plastic: { name: '塑膠', color: '#0891b2', dust: '#67e8f9', maxRPM: 1200, idealBit: 'hss', hardness: 1.5, dustType: 'strip' },
  aluminum: { name: '鋁', color: '#cbd5e1', dust: '#94a3b8', maxRPM: 1000, idealBit: 'hss', hardness: 2.5, dustType: 'spiral' },
  steel: { name: '不鏽鋼', color: '#475569', dust: '#94a3b8', maxRPM: 600, idealBit: 'hss', hardness: 4, dustType: 'spiral' },
};
const BIT_NAMES = { wood: '木工螺旋', hss: 'HSS 高速鋼', masonry: '磚石碳化鎢' };

const cv = document.getElementById('drill-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;

const $ = id => document.getElementById(id);

const els = {
  mat: $('material'), bit: $('bit-type'), dia: $('s-dia'), rpm: $('s-rpm'), feed: $('s-feed'), torque: $('s-torque'),
  vDia: $('v-dia'), vRpm: $('v-rpm'), vFeed: $('v-feed'), vTorque: $('v-torque'),
  eMatch: $('e-match'), eCut: $('e-cut'), eHeat: $('e-heat'), eBias: $('e-bias'),
  verdict: $('verdict'),
  start: $('btn-drill'), reset: $('btn-reset'),
};

const FEED_LABEL = ['', '極輕', '輕', '中', '重', '極重'];

let state = {
  drilling: false,
  holeDepth: 0,
  bitY: 100,
  chips: [],
  smoke: [],
  startTime: 0,
};

function readParams() {
  const m = MATERIALS[els.mat.value];
  const b = els.bit.value;
  const dia = parseFloat(els.dia.value);
  const rpm = parseInt(els.rpm.value);
  const feed = parseInt(els.feed.value);
  const torque = parseInt(els.torque.value);
  // 適配性
  let match = 'OK';
  if (b !== m.idealBit) {
    if (m.idealBit === 'hss' && b === 'wood') match = '✗ 木工鑽鑽金屬會崩刃';
    else if (m.idealBit === 'wood' && b === 'hss') match = '⚠ 可用但效率差';
    else if (b === 'masonry' && m.idealBit !== 'masonry') match = '✗ 磚石鑽不適合此材料';
    else match = '⚠ 不理想';
  }
  // 切削速度（RPM × 直徑）
  const sfm = rpm * dia * 0.262 / 100;
  const cutLabel = sfm < 5 ? '太慢' : sfm < 25 ? '理想' : '太快';
  // 過熱：高 RPM × 硬材料 × 大進刀
  const heatScore = (rpm / 2000) * m.hardness * (feed / 3) * (dia / 8);
  const heatLabel = heatScore < 0.8 ? '低' : heatScore < 1.5 ? '中' : heatScore < 2.5 ? '高' : '極高';
  // 偏鑽：低 RPM + 大直徑 + 重進刀 + 沒鎖緊
  const biasScore = (1 - rpm / 2000) * (feed / 5) * (dia / 13);
  const biasLabel = biasScore < 0.15 ? '低' : biasScore < 0.4 ? '中' : '高';
  return { m, b, dia, rpm, feed, torque, match, cutLabel, heatScore, heatLabel, biasScore, biasLabel };
}

function updateValueDisplays() {
  els.vDia.textContent = parseFloat(els.dia.value).toFixed(1) + ' mm';
  els.vRpm.textContent = els.rpm.value + ' RPM';
  els.vFeed.textContent = FEED_LABEL[parseInt(els.feed.value)];
  const t = parseInt(els.torque.value);
  els.vTorque.textContent = t === 0 ? '鑽孔模式 ⊕' : `第 ${t} 段`;
}

function updateEstimates() {
  const p = readParams();
  els.eMatch.textContent = p.match;
  els.eMatch.style.color = p.match === 'OK' ? '#22c55e' : p.match.includes('✗') ? '#dc2626' : '#eab308';
  els.eCut.textContent = p.cutLabel;
  els.eCut.style.color = p.cutLabel === '理想' ? '#22c55e' : '#eab308';
  els.eHeat.textContent = p.heatLabel;
  els.eHeat.style.color = p.heatLabel === '低' ? '#22c55e' : p.heatLabel === '中' ? '#eab308' : '#dc2626';
  els.eBias.textContent = p.biasLabel;
  els.eBias.style.color = p.biasLabel === '低' ? '#22c55e' : p.biasLabel === '中' ? '#eab308' : '#dc2626';
}

function drawScene() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  const p = readParams();

  // 工件
  const wood = { x: W/2 - 220, y: H - 180, w: 440, h: 90 };
  ctx.fillStyle = p.m.color;
  ctx.fillRect(wood.x, wood.y, wood.w, wood.h);
  // 工件紋理
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(wood.x, wood.y + i * 11 + 5);
    ctx.lineTo(wood.x + wood.w, wood.y + i * 11 + 5);
    ctx.stroke();
  }
  // 工作台
  ctx.fillStyle = '#374151';
  ctx.fillRect(wood.x - 30, wood.y + wood.h, wood.w + 60, 18);
  // 已鑽的孔
  if (state.holeDepth > 0) {
    ctx.fillStyle = '#000';
    const holeR = p.dia * 1.5;
    ctx.beginPath();
    ctx.ellipse(W/2, wood.y + 8, holeR, holeR * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 孔的深度（顯示為內部漸層）
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(W/2 - holeR, wood.y + 4, holeR * 2, Math.min(state.holeDepth, wood.h));
  }

  // 鑽頭
  const drillTipY = wood.y + Math.min(state.holeDepth, wood.h);
  const bitW = p.dia * 1.4;
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(W/2 - bitW/2, state.bitY, bitW, drillTipY - state.bitY - 8);
  // 螺旋紋
  if (state.drilling) {
    ctx.strokeStyle = 'rgba(0,0,0,.4)';
    for (let i = state.bitY; i < drillTipY - 8; i += 6) {
      const offset = (Date.now() / 30) % 12 - 6;
      ctx.beginPath();
      ctx.moveTo(W/2 - bitW/2, i + offset);
      ctx.lineTo(W/2 + bitW/2, i + offset + 6);
      ctx.stroke();
    }
  }
  // 鑽頭尖
  ctx.fillStyle = '#4b5563';
  ctx.beginPath();
  ctx.moveTo(W/2 - bitW/2, drillTipY - 10);
  ctx.lineTo(W/2 + bitW/2, drillTipY - 10);
  ctx.lineTo(W/2, drillTipY);
  ctx.closePath();
  ctx.fill();

  // 夾頭
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(W/2 - 24, state.bitY - 36, 48, 36);
  // 手電鑽本體（簡化）
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(W/2 - 60, state.bitY - 90, 120, 60);
  ctx.fillStyle = '#111827';
  ctx.fillRect(W/2 - 50, state.bitY - 84, 100, 8);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('CORDLESS DRILL', W/2, state.bitY - 78);

  // 木屑
  state.chips.forEach(c => {
    ctx.fillStyle = p.m.dust;
    if (p.m.dustType === 'curl') {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(c.x - c.r, c.y - 1, c.r * 2, 2);
    }
  });

  // 過熱煙霧
  state.smoke.forEach(s => {
    ctx.fillStyle = `rgba(150,150,150,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 訊息列
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 14px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`${p.m.name} · ${BIT_NAMES[p.b]} · ⌀${p.dia.toFixed(1)}mm · ${p.rpm} RPM`, 16, 28);
}

function tickSim() {
  if (!state.drilling) return;
  const p = readParams();
  // 移動鑽頭往下（速度受 feed 與適配性影響）
  const speedFactor = (p.feed / 3) * (p.match === 'OK' ? 1 : p.match.includes('✗') ? 0.2 : 0.6);
  state.bitY += 0.6 * speedFactor;
  state.holeDepth += 0.6 * speedFactor;

  // 產生木屑
  if (Math.random() < 0.4 * speedFactor) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    state.chips.push({
      x: W/2 + dir * (p.dia * 2 + Math.random() * 20),
      y: H - 180 + Math.random() * 10,
      r: 2 + Math.random() * 3,
      vy: -1 - Math.random() * 2,
      vx: dir * (1 + Math.random() * 2),
      life: 60,
    });
  }
  // 過熱煙霧
  if (p.heatScore > 1.2 && Math.random() < (p.heatScore - 1) * 0.3) {
    state.smoke.push({
      x: W/2 + (Math.random() - 0.5) * 20,
      y: H - 175,
      r: 4 + Math.random() * 4,
      alpha: 0.6,
      vy: -0.8,
    });
  }

  // 更新粒子
  state.chips = state.chips.filter(c => { c.x += c.vx; c.y += c.vy; c.vy += 0.1; c.life--; return c.life > 0; });
  state.smoke = state.smoke.filter(s => { s.y += s.vy; s.r += 0.2; s.alpha -= 0.015; return s.alpha > 0; });

  // 鑽穿後停止
  if (state.holeDepth >= 100) {
    state.drilling = false;
    showResult();
  }
}

function showResult() {
  const p = readParams();
  const dur = ((Date.now() - state.startTime) / 1000).toFixed(1);
  let level = 'good', msg = '';
  if (p.match.includes('✗')) {
    level = 'bad';
    msg = `❌ 失敗：${p.match}。鑽頭可能崩刃或無法切入。`;
  } else if (p.heatScore > 2 || p.biasScore > 0.5) {
    level = 'bad';
    const reasons = [];
    if (p.heatScore > 2) reasons.push('過熱燒孔');
    if (p.biasScore > 0.5) reasons.push('嚴重偏鑽');
    msg = `❌ 失敗：${reasons.join('、')}。需要調整轉速或進刀力。`;
  } else if (p.heatScore > 1.2 || p.biasScore > 0.3 || p.match !== 'OK' || p.cutLabel !== '理想') {
    level = 'warn';
    const issues = [];
    if (p.heatScore > 1.2) issues.push('有點熱');
    if (p.biasScore > 0.3) issues.push('略偏');
    if (p.match !== 'OK') issues.push('鑽頭非最佳');
    if (p.cutLabel !== '理想') issues.push(`轉速${p.cutLabel}`);
    msg = `⚠ 可接受但不理想：${issues.join('、')}。耗時 ${dur} 秒。`;
  } else {
    level = 'good';
    msg = `✓ 完美鑽孔！耗時 ${dur} 秒。轉速、進刀、鑽頭都對。`;
    const prog = loadP();
    prog.module4 = true;
    prog.module4_best = Math.min(prog.module4_best || 999, parseFloat(dur));
    saveP(prog);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
  }
  els.verdict.className = 'verdict ' + level;
  els.verdict.textContent = msg;
}

function loop() {
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

['mat', 'bit', 'dia', 'rpm', 'feed', 'torque'].forEach(k => els[k].addEventListener('input', () => { updateValueDisplays(); updateEstimates(); }));
els.start.addEventListener('click', startDrill);
els.reset.addEventListener('click', resetSim);

updateValueDisplays();
updateEstimates();
resetSim();
loop();
