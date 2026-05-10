// 3D 印表機 模組 4：切片參數模擬
const canvas = document.getElementById('printer-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const params = { model: 'benchy', layer: 0.2, infill: 20, speed: 60, temp: 200 };
let printState = { running: false, progress: 0, startTime: 0 };

// 模型形狀（簡化 2D 投影 + 高度）
const MODELS = {
  cube: { name: '立方體', width: 30, height: 30, layers: 150, volumeFactor: 1, color: '#06B6D4', shape: 'rect' },
  cylinder: { name: '圓柱', width: 30, height: 40, layers: 200, volumeFactor: 0.785, color: '#10B981', shape: 'circle' },
  benchy: { name: '3D Benchy', width: 60, height: 48, layers: 240, volumeFactor: 0.65, color: '#8B5CF6', shape: 'boat' },
  vase: { name: '花瓶', width: 40, height: 80, layers: 400, volumeFactor: 0.5, color: '#EC4899', shape: 'vase' },
};

function recalcEstimates() {
  const m = MODELS[params.model];
  // 計算層數 (height in mm / layer thickness)
  const layers = Math.round(m.height / params.layer);
  // 體積 (mm^3) = w*h*model factor
  const volume = m.width * m.width * m.height * m.volumeFactor * (params.infill / 100 + 0.3);
  // 重量 (PLA 密度約 1.24 g/cm³)
  const weight = volume * 1.24 / 1000;
  // 時間估算（分鐘）：路徑長 / 速度
  const time = (volume / 8) / params.speed * (1.5 - params.layer / 0.4 * 0.3); // 層越薄越久
  // 品質評分（綜合層厚 + 速度）
  const quality = Math.max(0, Math.min(100, 100 - (params.layer - 0.1) * 200 - (params.speed - 50) * 0.5 + (params.infill - 20) * 0.2));

  document.getElementById('e-layers').textContent = layers + ' 層';
  document.getElementById('e-weight').textContent = weight.toFixed(1) + ' g';
  const hours = Math.floor(time / 60);
  const mins = Math.round(time % 60);
  document.getElementById('e-time').textContent = hours > 0 ? `${hours} 時 ${mins} 分` : `${mins} 分`;
  const qualityEmoji = quality > 80 ? '⭐⭐⭐ 細緻' : quality > 60 ? '⭐⭐ 標準' : quality > 40 ? '⭐ 粗糙' : '⚠️ 過粗';
  document.getElementById('e-quality').textContent = qualityEmoji;
}

// === 滑桿 ===
['layer', 'infill', 'speed', 'temp'].forEach(key => {
  const slider = document.getElementById('s-' + key);
  const display = document.getElementById('v-' + key);
  slider.addEventListener('input', () => {
    params[key] = parseFloat(slider.value);
    if (key === 'layer') display.textContent = params[key].toFixed(2) + ' mm';
    else if (key === 'infill') display.textContent = params[key] + '%';
    else if (key === 'speed') display.textContent = params[key] + ' mm/s';
    else if (key === 'temp') display.textContent = params[key] + '°C';
    recalcEstimates();
  });
});
document.getElementById('model').addEventListener('change', e => {
  params.model = e.target.value;
  recalcEstimates();
});

// === 繪製 ===
function draw() {
  ctx.clearRect(0, 0, W, H);
  // 背景：3D 印表機列印視角
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1e293b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 列印床（紅色長方形）
  const bedY = H - 100;
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(80, bedY, W - 160, 30);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(80, bedY, W - 160, 6);
  ctx.fillStyle = '#fef2f2';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`HEATED BED ${params.temp >= 60 ? Math.round(params.temp * 0.3) : 25}°C`, W / 2, bedY + 22);

  // 模型輪廓 + 切片層
  drawModel();

  // X 軸與噴頭
  drawPrinter();

  // HUD
  drawHUD();
}

function drawModel() {
  const m = MODELS[params.model];
  const cx = W / 2;
  const baseY = H - 100;
  // 縮放（顯示在畫面中合理大小）
  const scale = 4;
  const w = m.width * scale;
  const h = m.height * scale;
  const left = cx - w / 2;
  const top = baseY - h;

  // 計算列印進度的層
  const totalLayers = Math.round(m.height / params.layer);
  const visibleLayers = printState.running ? Math.floor(totalLayers * printState.progress) : totalLayers;
  const layerH = h / totalLayers;

  // 繪製每層（從下往上）
  for (let i = 0; i < visibleLayers; i++) {
    const layerY = baseY - (i + 1) * layerH;
    const ratio = i / totalLayers;
    // 形狀
    let layerLeft = left, layerW = w;
    if (m.shape === 'circle') {
      // 圓柱不變
    } else if (m.shape === 'vase') {
      // 花瓶：中間粗，上下細
      const profile = 0.6 + 0.5 * Math.sin(ratio * Math.PI);
      layerW = w * profile;
      layerLeft = cx - layerW / 2;
    } else if (m.shape === 'boat') {
      // 船：底部寬上部窄
      const profile = ratio < 0.5 ? 1 : 1 - (ratio - 0.5) * 0.7;
      layerW = w * profile;
      layerLeft = cx - layerW / 2;
    }
    // 顏色：略有層感
    const alpha = 0.85 + (i % 2) * 0.1;
    ctx.fillStyle = m.color + (Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    if (m.shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(cx, layerY + layerH / 2, w / 2, layerH * .7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(layerLeft, layerY, layerW, layerH + 0.5);
    }
    // 層分界線
    if (params.layer > 0.15) {
      ctx.strokeStyle = 'rgba(0,0,0,.2)';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(layerLeft, layerY);
      ctx.lineTo(layerLeft + layerW, layerY);
      ctx.stroke();
    }
  }

  // 填充紋理（內部）
  if (visibleLayers > 5 && params.infill > 0 && params.infill < 100) {
    ctx.strokeStyle = `rgba(255,255,255,${params.infill / 200})`;
    ctx.lineWidth = .5;
    const step = Math.max(8, 30 - params.infill / 4);
    const visibleH = visibleLayers * layerH;
    for (let x = left; x < left + w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + visibleH, baseY - visibleH);
      ctx.stroke();
    }
    for (let x = left; x < left + w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - visibleH, baseY - visibleH);
      ctx.stroke();
    }
  }

  // 正在列印的層（高亮）
  if (printState.running && visibleLayers < totalLayers) {
    const currentY = baseY - (visibleLayers + 1) * layerH;
    ctx.fillStyle = '#fbbf24';
    if (m.shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(cx, currentY + layerH / 2, w / 2, layerH * .8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(left, currentY, w, layerH + 1);
    }
    // 閃爍光暈
    const glow = ctx.createRadialGradient(cx, currentY, 0, cx, currentY, 60);
    glow.addColorStop(0, 'rgba(251,191,36,.5)');
    glow.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 80, currentY - 20, 160, 30);
  }
}

function drawPrinter() {
  // X 軸框架（橫桿）
  const armY = printState.running ? H - 100 - (MODELS[params.model].height * 4 * (printState.progress + 0.05)) : 80;
  ctx.fillStyle = '#475569';
  ctx.fillRect(60, armY, W - 120, 8);
  // 噴頭
  const m = MODELS[params.model];
  const time = performance.now() / 100;
  const noseX = printState.running ? W / 2 + Math.sin(time / 5) * (m.width * 2) : W / 2;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(noseX - 18, armY + 8, 36, 36);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(noseX - 16, armY + 12, 32, 12);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(params.temp + '°C', noseX, armY + 21);
  // 噴嘴
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(noseX - 5, armY + 44);
  ctx.lineTo(noseX + 5, armY + 44);
  ctx.lineTo(noseX, armY + 54);
  ctx.closePath();
  ctx.fill();
  // 列印中的絲線
  if (printState.running) {
    ctx.strokeStyle = MODELS[params.model].color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(noseX, armY + 54);
    ctx.lineTo(noseX, armY + 54 + 4);
    ctx.stroke();
  }
}

function drawHUD() {
  // 進度條（頂部）
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(0, 0, W, 38);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Inter';
  ctx.textAlign = 'left';
  if (printState.running) {
    ctx.fillText(`▶ PRINTING ${MODELS[params.model].name} ${Math.round(printState.progress * 100)}%`, 16, 25);
  } else if (printState.progress >= 1) {
    ctx.fillText(`✓ COMPLETE`, 16, 25);
  } else {
    ctx.fillText(`READY ${MODELS[params.model].name}`, 16, 25);
  }
  // 進度條
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(W - 220, 12, 200, 14);
  ctx.fillStyle = '#06B6D4';
  ctx.fillRect(W - 220, 12, 200 * printState.progress, 14);
}

function loop() {
  if (printState.running) {
    // 列印速度依速度參數
    const m = MODELS[params.model];
    const totalTimeMs = (m.height / params.layer) * (60 / params.speed) * 200;
    const elapsed = performance.now() - printState.startTime;
    printState.progress = Math.min(1, elapsed / totalTimeMs);
    if (printState.progress >= 1) {
      printState.running = false;
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const PK = 'printer3d_progress_v1';
      let p; try { p = JSON.parse(localStorage.getItem(PK)) || {}; } catch { p = {}; }
      p.module4 = true;
      p.module4_levels = p.module4_levels || {};
      p.module4_levels[params.model] = 3;
      localStorage.setItem(PK, JSON.stringify(p));
      showToast('🎉 列印完成！', 'good');
    }
  }
  draw();
  requestAnimationFrame(loop);
}

document.getElementById('btn-print').onclick = () => {
  if (printState.running) return;
  printState.running = true;
  printState.progress = 0;
  printState.startTime = performance.now();
  if (typeof SoundFX !== 'undefined') SoundFX.click();
};
document.getElementById('btn-reset').onclick = () => {
  printState.running = false;
  printState.progress = 0;
};

recalcEstimates();
loop();
