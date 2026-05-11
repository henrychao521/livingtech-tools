// 補充模組：剝線基本功模擬器
// 三關卡：22 AWG 一般線 / 18 AWG 粗線 / 多芯絞線
// 核心機制：咬合深度 vs. 線徑窗口 → 拉開動畫 → win/lose 判定
(function() {
  const PROG_KEY = 'breadboard_progress_v1';
  const SUB_KEY  = 'wire_stripping';

  // 三關設定
  const LEVELS = [
    {
      id: 'L1',
      name: '22 AWG 一般單芯線',
      coreColor: '#FFA94D',     // 銅
      coreShine: '#FFD699',
      insColor: '#dc2626',       // 紅外皮
      insColor2: '#7f1d1d',
      coreR: 6,                  // 線芯半徑（SVG px）
      insR: 14,                  // 外皮半徑
      strands: 1,
      depthWindow: [58, 82],     // 最佳咬合深度區間 %
      lengthWindow: [7, 10],     // 最佳量距 mm
      hint: '一般跳線。建議咬合深度約 60–80%，量距 7–10mm。'
    },
    {
      id: 'L2',
      name: '18 AWG 粗線（電源線）',
      coreColor: '#FFA94D',
      coreShine: '#FFD699',
      insColor: '#1e40af',       // 藍外皮
      insColor2: '#1e3a8a',
      coreR: 9,
      insR: 19,                  // 外皮較厚
      strands: 1,
      depthWindow: [68, 88],     // 要咬更深才能穿透厚外皮
      lengthWindow: [8, 11],
      hint: '粗外皮要咬深一點。建議深度約 70–85%，量距 8–11mm。'
    },
    {
      id: 'L3',
      name: '多芯絞線（柔軟跳線）',
      coreColor: '#FFD080',
      coreShine: '#FFE6B3',
      insColor: '#16A34A',       // 綠外皮
      insColor2: '#14532d',
      coreR: 7,
      insR: 15,
      strands: 7,                // 7 芯絞線
      depthWindow: [55, 78],     // 多芯較好剝
      lengthWindow: [7, 10],
      hint: '多芯線比較寬鬆。但拉的時候絞線會略微展開，要小心。'
    }
  ];

  let currentLevel = 0;
  let attempts = 0;
  let cleared = new Set();
  let isPulling = false;

  // === 進度載入 ===
  function loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(PROG_KEY)) || {};
      const sub = p[SUB_KEY] || {};
      ['L1','L2','L3'].forEach(id => { if (sub[id]) cleared.add(id); });
    } catch (e) {}
  }
  function saveProgress(levelId) {
    try {
      const p = JSON.parse(localStorage.getItem(PROG_KEY)) || {};
      if (!p[SUB_KEY]) p[SUB_KEY] = {};
      p[SUB_KEY][levelId] = true;
      p[SUB_KEY].lastUpdated = new Date().toISOString();
      localStorage.setItem(PROG_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  // === SVG 繪製：靜態舞台 ===
  // 舞台尺寸 760×240
  // 電線水平放置，左端伸出 = 要剝掉的部分，右端被尖嘴鉗夾住
  // 中央：斜口鉗咬合位置
  function buildStage(level, opts = {}) {
    const svg = document.getElementById('ws-stage-svg');
    if (!svg) return;
    const W = 760, H = 240;
    const cy = H / 2;
    const wireStartX = 80;
    const wireEndX = 720;
    const lvl = LEVELS[level];
    const stripLengthMm = opts.lengthMm ?? 8;
    const depth = opts.depth ?? 50;

    // 將 mm 映射到舞台像素（4mm = 24px, 14mm = 84px，比例 1mm=6px）
    const stripPx = stripLengthMm * 8;
    const cutX = wireStartX + stripPx;          // 切口位置（左起 stripPx）

    // 咬合深度 = 0% → 完全沒咬到外皮上緣
    // 咬合深度 = 100% → 鉗刃尖端碰到外皮底（也就是切斷整條線）
    // 60–85%（依關卡 depthWindow）= 穿透外皮但不傷銅芯
    const bladeTipY = cy - lvl.insR + (lvl.insR * 2) * (depth / 100);

    // === 開始繪製 ===
    let html = '';

    // 漸層定義
    html += `<defs>
      <linearGradient id="ws-ins-${level}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${lvl.insColor}"/>
        <stop offset=".5" stop-color="${lvl.insColor}"/>
        <stop offset="1" stop-color="${lvl.insColor2}"/>
      </linearGradient>
      <linearGradient id="ws-core-${level}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${lvl.coreShine}"/>
        <stop offset=".5" stop-color="${lvl.coreColor}"/>
        <stop offset="1" stop-color="#cc7a26"/>
      </linearGradient>
      <linearGradient id="ws-plier-h" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#94a3b8"/>
        <stop offset="1" stop-color="#475569"/>
      </linearGradient>
      <filter id="ws-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="3"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // 背景：刻度尺
    html += `<g opacity=".25">`;
    for (let mm = 0; mm <= 14; mm++) {
      const x = wireStartX + mm * 8;
      const tall = mm % 5 === 0;
      html += `<line x1="${x}" y1="${cy + lvl.insR + 16}" x2="${x}" y2="${cy + lvl.insR + (tall ? 26 : 20)}" stroke="#333" stroke-width="${tall ? 1 : 0.5}"/>`;
      if (mm % 5 === 0) html += `<text x="${x}" y="${cy + lvl.insR + 42}" font-size="10" fill="#666" text-anchor="middle">${mm}mm</text>`;
    }
    html += `</g>`;

    // 電線：外皮（從 cutX 開始）+ 內芯（從 wireStartX 開始）
    // 銅芯（背景，全長）
    if (lvl.strands === 1) {
      html += `<rect x="${wireStartX}" y="${cy - lvl.coreR}" width="${wireEndX - wireStartX}" height="${lvl.coreR * 2}" rx="${lvl.coreR}" fill="url(#ws-core-${level})" id="ws-core"/>`;
      // 銅芯光澤
      html += `<rect x="${wireStartX}" y="${cy - lvl.coreR}" width="${wireEndX - wireStartX}" height="3" fill="#fff" opacity=".3"/>`;
    } else {
      // 多芯絞線
      const sR = lvl.coreR / 2.2;
      for (let i = 0; i < lvl.strands; i++) {
        const offset = (i - (lvl.strands - 1) / 2) * (sR * 1.4);
        html += `<rect x="${wireStartX}" y="${cy + offset - sR}" width="${wireEndX - wireStartX}" height="${sR * 2}" rx="${sR}" fill="url(#ws-core-${level})" opacity=".95"/>`;
      }
      html += `<g id="ws-core"></g>`;
    }

    // 外皮（從切口往右）
    html += `<g id="ws-insulation">
      <rect x="${cutX}" y="${cy - lvl.insR}" width="${wireEndX - cutX}" height="${lvl.insR * 2}" rx="${lvl.insR}" fill="url(#ws-ins-${level})" filter="url(#ws-shadow)"/>
      <rect x="${cutX}" y="${cy - lvl.insR + 2}" width="${wireEndX - cutX}" height="3" fill="#fff" opacity=".25"/>
    </g>`;

    // 左側脫落的外皮預備（藏起來，動畫時顯示）
    html += `<g id="ws-stripped" style="display:none">
      <rect x="${wireStartX}" y="${cy - lvl.insR}" width="${stripPx}" height="${lvl.insR * 2}" rx="${lvl.insR}" fill="url(#ws-ins-${level})" opacity=".6"/>
    </g>`;

    // 切口處顯示「刀痕」
    html += `<g id="ws-cut-mark">
      <line x1="${cutX}" y1="${cy - lvl.insR - 2}" x2="${cutX}" y2="${cy + lvl.insR + 2}" stroke="#000" stroke-width="0.8" opacity=".5"/>
    </g>`;

    // 斜口鉗（從上方下來）
    html += drawCutter(cutX, bladeTipY, cy, lvl, depth);

    // 尖嘴鉗（在右端）— 拉的時候才顯示
    html += `<g id="ws-pliers" opacity="0">
      ${drawPliers(wireEndX, cy, lvl)}
    </g>`;

    // 量距標示線
    html += `<g id="ws-length-indicator" opacity=".7">
      <line x1="${wireStartX}" y1="${cy - lvl.insR - 28}" x2="${cutX}" y2="${cy - lvl.insR - 28}" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="${wireStartX}" y1="${cy - lvl.insR - 32}" x2="${wireStartX}" y2="${cy - lvl.insR - 24}" stroke="#16A34A" stroke-width="1.5"/>
      <line x1="${cutX}" y1="${cy - lvl.insR - 32}" x2="${cutX}" y2="${cy - lvl.insR - 24}" stroke="#16A34A" stroke-width="1.5"/>
      <text x="${(wireStartX + cutX) / 2}" y="${cy - lvl.insR - 36}" font-size="11" fill="#16A34A" text-anchor="middle" font-weight="600">${stripLengthMm.toFixed(1)} mm</text>
    </g>`;

    // 線徑標示
    html += `<text x="${wireEndX - 6}" y="${cy + lvl.insR + 60}" font-size="11" fill="#666" text-anchor="end">線徑：${lvl.name}</text>`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = html;
  }

  function drawCutter(cx, tipY, cy, lvl, depth) {
    // 兩片刀刃，從上方夾下來。tipY 是刀刃尖端 y 座標
    // 開合角度由深度決定（深度越大，刀刃越聚集到中線）
    const handleTopY = 12;
    const bladeBaseY = 30;
    const spread = 30 + (1 - depth / 100) * 20;     // 把柄上端的張開幅度
    const tipSpread = 2;                              // 刀刃尖端永遠靠近中線
    const color = depth > 95 ? '#dc2626' : '#475569';
    return `<g id="ws-cutter">
      <!-- 把柄 -->
      <path d="M ${cx - spread} ${handleTopY} L ${cx - tipSpread} ${tipY} L ${cx + tipSpread} ${tipY} L ${cx + spread} ${handleTopY} L ${cx + spread - 8} ${handleTopY - 4} L ${cx - spread + 8} ${handleTopY - 4} Z" fill="url(#ws-plier-h)" stroke="${color}" stroke-width="1.5" filter="url(#ws-shadow)"/>
      <!-- 刀口 -->
      <line x1="${cx - tipSpread - 0.5}" y1="${tipY}" x2="${cx + tipSpread + 0.5}" y2="${tipY}" stroke="#fbbf24" stroke-width="1.5"/>
      <!-- 鉸鏈 -->
      <circle cx="${cx}" cy="${bladeBaseY + 16}" r="3" fill="#1f2937" stroke="#fbbf24" stroke-width="0.8"/>
      <!-- 標籤 -->
      <text x="${cx + spread + 6}" y="${handleTopY + 4}" font-size="11" fill="#475569" font-weight="600">斜口鉗</text>
    </g>`;
  }

  function drawPliers(rightX, cy, lvl) {
    // 尖嘴鉗從右側水平伸入，夾住電線右端
    const x = rightX;
    const len = 60;
    return `
      <path d="M ${x + 6} ${cy - 8} L ${x + len} ${cy - 12} L ${x + len + 14} ${cy - 14} L ${x + len + 14} ${cy + 14} L ${x + len} ${cy + 12} L ${x + 6} ${cy + 8} Z" fill="url(#ws-plier-h)" stroke="#475569" stroke-width="1.5" filter="url(#ws-shadow)"/>
      <line x1="${x + 6}" y1="${cy - 6}" x2="${x + 6}" y2="${cy + 6}" stroke="#fbbf24" stroke-width="2"/>
      <text x="${x + len + 18}" y="${cy + 4}" font-size="11" fill="#475569" font-weight="600">尖嘴鉗</text>
    `;
  }

  // === 判定邏輯 ===
  function evaluate(level, depth, lengthMm) {
    const lvl = LEVELS[level];
    const [dMin, dMax] = lvl.depthWindow;
    const [lMin, lMax] = lvl.lengthWindow;

    // 深度判定
    let depthVerdict;
    if (depth < dMin - 8) depthVerdict = 'too-shallow-severe';
    else if (depth < dMin) depthVerdict = 'too-shallow';
    else if (depth <= dMax) depthVerdict = 'good';
    else if (depth <= dMax + 8) depthVerdict = 'too-deep';
    else depthVerdict = 'too-deep-severe';

    // 量距判定
    let lengthVerdict;
    if (lengthMm < lMin) lengthVerdict = 'too-short';
    else if (lengthMm <= lMax) lengthVerdict = 'good';
    else lengthVerdict = 'too-long';

    // 綜合
    const win = depthVerdict === 'good' && lengthVerdict === 'good';

    return { win, depthVerdict, lengthVerdict, depth, lengthMm };
  }

  function verdictReason(r) {
    const parts = [];
    if (r.depthVerdict === 'too-shallow-severe') parts.push('咬合深度太淺，外皮完全沒切開');
    else if (r.depthVerdict === 'too-shallow') parts.push('咬合深度不夠，外皮只切了一半');
    else if (r.depthVerdict === 'too-deep') parts.push('咬合太深，銅芯有明顯刻痕');
    else if (r.depthVerdict === 'too-deep-severe') parts.push('咬合太深，銅芯被切斷');

    if (r.lengthVerdict === 'too-short') parts.push('量距太短（不足 ' + LEVELS[currentLevel].lengthWindow[0] + 'mm），插麵包板會接觸不良');
    else if (r.lengthVerdict === 'too-long') parts.push('量距太長（超過 ' + LEVELS[currentLevel].lengthWindow[1] + 'mm），銅芯外露太多易短路');

    return parts.join('；') + '。';
  }

  // === 拉開動畫 ===
  function playPullAnimation(result) {
    isPulling = true;
    const svg = document.getElementById('ws-stage-svg');
    const insulation = svg.querySelector('#ws-insulation');
    const stripped = svg.querySelector('#ws-stripped');
    const pliers = svg.querySelector('#ws-pliers');
    const cutter = svg.querySelector('#ws-cutter');
    const core = svg.querySelector('#ws-core');
    const cutMark = svg.querySelector('#ws-cut-mark');

    // 1) 尖嘴鉗滑入
    pliers.style.transition = 'transform .25s ease-out, opacity .25s';
    pliers.style.transform = 'translateX(-40px)';
    pliers.style.opacity = '1';

    // 2) 斜口鉗淡出（已咬完）
    if (cutter) {
      cutter.style.transition = 'opacity .2s';
      cutter.style.opacity = '.35';
    }

    setTimeout(() => {
      // 3) 根據結果播放不同動畫
      if (result.depthVerdict === 'too-shallow-severe' || result.depthVerdict === 'too-shallow') {
        // 外皮沒穿透 → 整條線被拉走（外皮 + 銅芯一起向右移動）
        const grp = [insulation, core, cutMark];
        grp.forEach(g => {
          if (!g) return;
          g.style.transition = 'transform .6s ease-out';
          g.style.transform = 'translateX(60px)';
        });
        setTimeout(() => {
          // 接著彈回（拉不開）
          grp.forEach(g => {
            if (!g) return;
            g.style.transition = 'transform .35s cubic-bezier(.5,1.8,.6,1)';
            g.style.transform = 'translateX(0)';
          });
        }, 650);
      } else if (result.depthVerdict === 'good') {
        // 外皮乾淨脫落 → 左半段外皮向左滑出（成功）
        stripped.style.display = '';
        stripped.style.transition = 'transform .6s ease-out, opacity .6s';
        stripped.style.transform = 'translateX(-50px)';
        stripped.style.opacity = '0';
        // 露出銅芯亮光
        if (core) core.setAttribute('filter', 'drop-shadow(0 0 4px #FFD699)');
      } else {
        // 太深 → 銅芯斷裂或刻痕
        if (core) {
          core.style.transition = 'transform .5s ease-out';
          core.style.transform = 'translateX(40px)';
          if (result.depthVerdict === 'too-deep-severe') {
            // 銅芯完全斷掉
            setTimeout(() => {
              const cutSvg = svg.querySelector('#ws-stage-svg, svg') || svg;
              const breakLine = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              breakLine.innerHTML = `<line x1="${getCutX()}" y1="80" x2="${getCutX()}" y2="160" stroke="#dc2626" stroke-width="3"/>
                <text x="${getCutX() + 8}" y="76" font-size="13" fill="#dc2626" font-weight="700">✗ 銅芯斷裂</text>`;
              svg.appendChild(breakLine);
            }, 350);
          } else {
            // 有刻痕
            const m = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            m.innerHTML = `<path d="M ${getCutX() - 4} 116 L ${getCutX()} 124 L ${getCutX() + 4} 116" stroke="#dc2626" stroke-width="1.5" fill="none"/>
              <text x="${getCutX() + 6}" y="105" font-size="11" fill="#dc2626" font-weight="700">⚠ 銅芯刻痕</text>`;
            svg.appendChild(m);
          }
        }
      }

      // 顯示結果區塊
      setTimeout(() => showResult(result), 800);
    }, 280);
  }

  function getCutX() {
    const lenSlider = document.getElementById('ws-length-slider');
    return 80 + parseFloat(lenSlider.value) * 8;
  }

  // === UI 控制 ===
  function showResult(r) {
    const el = document.getElementById('ws-result');
    if (r.win) {
      el.className = 'ws-result show win';
      el.innerHTML = `<h4>🎉 完美！外皮乾淨脫落，銅芯無傷。</h4>
        <p>深度 ${r.depth}%（目標 ${LEVELS[currentLevel].depthWindow[0]}–${LEVELS[currentLevel].depthWindow[1]}%）／量距 ${r.lengthMm.toFixed(1)}mm（目標 ${LEVELS[currentLevel].lengthWindow[0]}–${LEVELS[currentLevel].lengthWindow[1]}mm）</p>`;
      if (!cleared.has(LEVELS[currentLevel].id)) {
        cleared.add(LEVELS[currentLevel].id);
        saveProgress(LEVELS[currentLevel].id);
        updateProgressUI();
        if (typeof playSuccess === 'function') playSuccess();
        if (typeof showToast === 'function') showToast(`🏆 ${LEVELS[currentLevel].id} 通關！`, 'good');
      }
    } else {
      el.className = 'ws-result show lose';
      el.innerHTML = `<h4>❌ 失敗：${verdictReason(r)}</h4>
        <p>深度 ${r.depth}%（目標 ${LEVELS[currentLevel].depthWindow[0]}–${LEVELS[currentLevel].depthWindow[1]}%）／量距 ${r.lengthMm.toFixed(1)}mm（目標 ${LEVELS[currentLevel].lengthWindow[0]}–${LEVELS[currentLevel].lengthWindow[1]}mm）<br>💡 提示：${LEVELS[currentLevel].hint}</p>`;
      if (typeof playError === 'function') playError();
    }
    isPulling = false;
  }

  function updateProgressUI() {
    const pill = document.getElementById('ws-progress-pill');
    if (pill) pill.textContent = `已通關 ${cleared.size} / 3`;
    document.querySelectorAll('.ws-level-tab').forEach((tab, i) => {
      tab.classList.toggle('cleared', cleared.has(LEVELS[i].id));
    });
  }

  function resetStage(redraw = true) {
    const depth = parseInt(document.getElementById('ws-depth-slider').value, 10);
    const len = parseFloat(document.getElementById('ws-length-slider').value);
    document.getElementById('ws-depth-val').textContent = depth + ' %';
    document.getElementById('ws-length-val').textContent = len.toFixed(1) + ' mm';
    document.getElementById('ws-result').className = 'ws-result';
    if (redraw) buildStage(currentLevel, { depth, lengthMm: len });
  }

  function switchLevel(level) {
    currentLevel = level;
    attempts = 0;
    document.getElementById('ws-attempts').textContent = `嘗試次數：0`;
    document.querySelectorAll('.ws-level-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === level);
    });
    // 預設值
    document.getElementById('ws-depth-slider').value = 50;
    document.getElementById('ws-length-slider').value = 8;
    resetStage(true);
  }

  function attemptPull() {
    if (isPulling) return;
    const depth = parseInt(document.getElementById('ws-depth-slider').value, 10);
    const len = parseFloat(document.getElementById('ws-length-slider').value);
    attempts++;
    document.getElementById('ws-attempts').textContent = `嘗試次數：${attempts}`;
    const r = evaluate(currentLevel, depth, len);
    playPullAnimation(r);
  }

  // === 初始化 ===
  function init() {
    if (!document.getElementById('ws-stage-svg')) return;
    loadProgress();
    updateProgressUI();

    // 等級切換
    document.querySelectorAll('.ws-level-tab').forEach(tab => {
      tab.addEventListener('click', () => switchLevel(parseInt(tab.dataset.level, 10)));
    });
    // 滑桿
    document.getElementById('ws-depth-slider').addEventListener('input', () => resetStage(true));
    document.getElementById('ws-length-slider').addEventListener('input', () => resetStage(true));
    // 按鈕
    document.getElementById('ws-btn-pull').addEventListener('click', attemptPull);
    document.getElementById('ws-btn-reset').addEventListener('click', () => {
      document.getElementById('ws-depth-slider').value = 50;
      document.getElementById('ws-length-slider').value = 8;
      resetStage(true);
    });

    // 首次繪製
    switchLevel(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
