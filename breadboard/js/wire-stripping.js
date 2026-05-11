// 補充模組：導線處理（剝線）模擬器 v2
// 雙模式：剝線鉗（正規）/ 斜口鉗+尖嘴鉗（應急）
// 判定依據：IPC-A-620 三項離散結果（銅芯刻痕、外皮端平整、露出長度）
// 不再用「咬合深度百分比」，改用壓力控制 + 多次轉位咬合（nibble around）
(function() {
  const PROG_KEY = 'breadboard_progress_v1';
  const SUB_KEY  = 'wire_stripping';

  // === 關卡定義（線徑 = 物理屬性） ===
  const LEVELS = [
    {
      id: 'L1',
      name: '22 AWG 一般單芯線',
      gauge: 22,
      coreColor: '#FFA94D',
      coreShine: '#FFD699',
      insColor: '#dc2626',
      insColor2: '#7f1d1d',
      coreR: 5,
      insR: 12,
      strands: 1,
      lenWindow: [5, 9],
      stripperHole: 22,
      cutterPressureWindow: [38, 70],
      hint: '建議：剝線鉗 → 對到 22 AWG 孔／兩鉗 → 壓力中等（約 40–70 區段），多次輕咬',
    },
    {
      id: 'L2',
      name: '18 AWG 粗線（電源線）',
      gauge: 18,
      coreColor: '#FFA94D',
      coreShine: '#FFD699',
      insColor: '#1e40af',
      insColor2: '#1e3a8a',
      coreR: 8,
      insR: 17,
      strands: 1,
      lenWindow: [5, 9],
      stripperHole: 18,
      cutterPressureWindow: [48, 80],
      hint: '建議：剝線鉗 → 對到 18 AWG 孔／兩鉗 → 外皮較厚，壓力需略提高',
    },
    {
      id: 'L3',
      name: '多芯絞線（22 AWG / 7 股）',
      gauge: 22,
      coreColor: '#FFD080',
      coreShine: '#FFE6B3',
      insColor: '#16A34A',
      insColor2: '#14532d',
      coreR: 7,
      insR: 13,
      strands: 7,
      lenWindow: [5, 9],
      stripperHole: 22,
      cutterPressureWindow: [35, 65],
      hint: '建議：剝線鉗 → 對到 22 AWG 孔／兩鉗 → 多芯線易斷股，壓力寧偏輕',
    },
  ];

  const GAUGE_HOLES = [24, 22, 20, 18];

  // === 狀態 ===
  let currentMode = 'stripper';
  let currentLevel = 0;
  let attempts = 0;
  let cleared = new Set();             // 'L1' / 'L2' / 'L3'（不分模式，任一通過即計）
  let isAnimating = false;

  // 模式狀態
  let stripperGauge = 22;              // 使用者選的剝線鉗孔
  let nibbles = [];                    // 兩鉗模式累積的咬合 [{pressure, angle}]
  const NIBBLE_MAX = 4;

  // === 進度 ===
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

  // === SVG 舞台 ===
  function buildStage(opts = {}) {
    const svg = document.getElementById('ws-stage-svg');
    if (!svg) return;
    const W = 760, H = 240;
    const cy = H / 2;
    const wireStartX = 80;
    const wireEndX = 720;
    const lvl = LEVELS[currentLevel];
    const lenMm = opts.lenMm ?? 6;
    const stripPx = lenMm * 8;
    const cutX = wireStartX + stripPx;

    let html = '';

    // === defs ===
    html += `<defs>
      <linearGradient id="ws-ins-${currentLevel}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${lvl.insColor}"/>
        <stop offset=".5" stop-color="${lvl.insColor}"/>
        <stop offset="1" stop-color="${lvl.insColor2}"/>
      </linearGradient>
      <linearGradient id="ws-core-${currentLevel}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${lvl.coreShine}"/>
        <stop offset=".5" stop-color="${lvl.coreColor}"/>
        <stop offset="1" stop-color="#cc7a26"/>
      </linearGradient>
      <linearGradient id="ws-tool-h" x1="0" x2="0" y1="0" y2="1">
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

    // 刻度尺
    html += `<g opacity=".25">`;
    for (let mm = 0; mm <= 14; mm++) {
      const x = wireStartX + mm * 8;
      const tall = mm % 5 === 0;
      html += `<line x1="${x}" y1="${cy + lvl.insR + 16}" x2="${x}" y2="${cy + lvl.insR + (tall ? 26 : 20)}" stroke="#333" stroke-width="${tall ? 1 : 0.5}"/>`;
      if (mm % 5 === 0) html += `<text x="${x}" y="${cy + lvl.insR + 42}" font-size="10" fill="#666" text-anchor="middle">${mm}mm</text>`;
    }
    html += `</g>`;

    // 銅芯
    if (lvl.strands === 1) {
      html += `<rect x="${wireStartX}" y="${cy - lvl.coreR}" width="${wireEndX - wireStartX}" height="${lvl.coreR * 2}" rx="${lvl.coreR}" fill="url(#ws-core-${currentLevel})" id="ws-core"/>`;
      html += `<rect x="${wireStartX}" y="${cy - lvl.coreR}" width="${wireEndX - wireStartX}" height="2" fill="#fff" opacity=".3"/>`;
    } else {
      const sR = lvl.coreR / 2.3;
      for (let i = 0; i < lvl.strands; i++) {
        const offset = (i - (lvl.strands - 1) / 2) * (sR * 1.3);
        html += `<rect x="${wireStartX}" y="${cy + offset - sR}" width="${wireEndX - wireStartX}" height="${sR * 2}" rx="${sR}" fill="url(#ws-core-${currentLevel})" opacity=".95"/>`;
      }
      html += `<g id="ws-core"></g>`;
    }

    // 外皮（從切口往右）
    html += `<g id="ws-insulation">
      <rect x="${cutX}" y="${cy - lvl.insR}" width="${wireEndX - cutX}" height="${lvl.insR * 2}" rx="${lvl.insR}" fill="url(#ws-ins-${currentLevel})" filter="url(#ws-shadow)"/>
      <rect x="${cutX}" y="${cy - lvl.insR + 2}" width="${wireEndX - cutX}" height="3" fill="#fff" opacity=".25"/>
    </g>`;

    // 脫落預備（隱藏）
    html += `<g id="ws-stripped" style="display:none">
      <rect x="${wireStartX}" y="${cy - lvl.insR}" width="${stripPx}" height="${lvl.insR * 2}" rx="${lvl.insR}" fill="url(#ws-ins-${currentLevel})" opacity=".6"/>
    </g>`;

    // 切口標線
    html += `<g id="ws-cut-mark">
      <line x1="${cutX}" y1="${cy - lvl.insR - 2}" x2="${cutX}" y2="${cy + lvl.insR + 2}" stroke="#000" stroke-width="0.8" opacity=".5"/>
    </g>`;

    // 工具圖：剝線鉗或斜口鉗（依模式）
    if (currentMode === 'stripper') {
      html += drawStripper(cutX, cy, lvl);
    } else {
      html += drawCutter(cutX, cy, lvl);
    }

    // 量距標示
    html += `<g id="ws-length-indicator" opacity=".7">
      <line x1="${wireStartX}" y1="${cy - lvl.insR - 28}" x2="${cutX}" y2="${cy - lvl.insR - 28}" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="${wireStartX}" y1="${cy - lvl.insR - 32}" x2="${wireStartX}" y2="${cy - lvl.insR - 24}" stroke="#16A34A" stroke-width="1.5"/>
      <line x1="${cutX}" y1="${cy - lvl.insR - 32}" x2="${cutX}" y2="${cy - lvl.insR - 24}" stroke="#16A34A" stroke-width="1.5"/>
      <text x="${(wireStartX + cutX) / 2}" y="${cy - lvl.insR - 36}" font-size="11" fill="#16A34A" text-anchor="middle" font-weight="600">${lenMm.toFixed(1)} mm</text>
    </g>`;

    // 線徑標籤
    html += `<text x="${wireEndX - 6}" y="${cy + lvl.insR + 60}" font-size="11" fill="#666" text-anchor="end">線徑：${lvl.name}</text>`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = html;
  }

  function drawStripper(cx, cy, lvl) {
    // 剝線鉗：把柄 + 4 個刻度孔 + 一個對到電線的有效孔
    const handleTop = 12;
    const bodyTop = 34;
    const bodyBot = cy - lvl.insR - 4;
    const holeY = (bodyTop + bodyBot) / 2;
    const span = 60;
    const correctIdx = GAUGE_HOLES.indexOf(lvl.stripperHole);
    const selIdx = GAUGE_HOLES.indexOf(stripperGauge);
    let html = `<g id="ws-stripper">
      <path d="M ${cx - span} ${handleTop} L ${cx - 12} ${bodyTop} L ${cx + 12} ${bodyTop} L ${cx + span} ${handleTop} L ${cx + span - 6} ${handleTop - 4} L ${cx - span + 6} ${handleTop - 4} Z" fill="url(#ws-tool-h)" stroke="#475569" stroke-width="1.5" filter="url(#ws-shadow)"/>
      <rect x="${cx - 26}" y="${bodyTop}" width="52" height="${bodyBot - bodyTop}" rx="3" fill="#475569" stroke="#1f2937"/>
      <text x="${cx + span + 6}" y="${handleTop + 4}" font-size="11" fill="#475569" font-weight="600">剝線鉗</text>`;
    // 4 個刻度孔
    GAUGE_HOLES.forEach((g, i) => {
      const hx = cx - 18 + i * 12;
      const r = 5 - (i * 0.8);    // 孔越往右越大（24 小 → 18 大），這裡顯示時 24→r=5? 改：24 最小、18 最大
      // GAUGE_HOLES=[24,22,20,18]，i=0..3，r 應 = 3.0, 3.8, 4.6, 5.4
      const rr = 3 + i * 0.8;
      const isCorrect = (g === lvl.stripperHole);
      const isSel = (g === stripperGauge);
      html += `<circle cx="${hx}" cy="${holeY}" r="${rr}" fill="${isSel ? '#fbbf24' : '#1f2937'}" stroke="${isCorrect ? '#16A34A' : 'none'}" stroke-width="${isCorrect ? 1.5 : 0}"/>`;
      html += `<text x="${hx}" y="${holeY + rr + 11}" font-size="7" fill="#cbd5e1" text-anchor="middle">${g}</text>`;
    });
    // 標示：選中的孔對到電線
    if (selIdx >= 0) {
      const hx = cx - 18 + selIdx * 12;
      html += `<line x1="${hx}" y1="${bodyBot}" x2="${cx}" y2="${cy - lvl.insR}" stroke="#fbbf24" stroke-width="1" stroke-dasharray="2 2" opacity=".7"/>`;
    }
    html += `</g>`;
    return html;
  }

  function drawCutter(cx, cy, lvl) {
    // 斜口鉗：兩片刃從上方下來。角度 = 當前 nibble 角度
    const angle = nibbles.length === 0 ? 0 : (nibbles.length * 90) % 360;
    const handleTop = 12;
    const tipY = cy - lvl.insR - 1;
    const spread = 30;
    return `<g id="ws-cutter" transform="rotate(${angle * 0.15} ${cx} ${cy})">
      <path d="M ${cx - spread} ${handleTop} L ${cx - 2} ${tipY} L ${cx + 2} ${tipY} L ${cx + spread} ${handleTop} L ${cx + spread - 6} ${handleTop - 4} L ${cx - spread + 6} ${handleTop - 4} Z" fill="url(#ws-tool-h)" stroke="#475569" stroke-width="1.5" filter="url(#ws-shadow)"/>
      <line x1="${cx - 2.5}" y1="${tipY}" x2="${cx + 2.5}" y2="${tipY}" stroke="#fbbf24" stroke-width="1.5"/>
      <circle cx="${cx}" cy="${tipY - 14}" r="3" fill="#1f2937"/>
      <text x="${cx + spread + 6}" y="${handleTop + 4}" font-size="11" fill="#475569" font-weight="600">斜口鉗</text>
      ${nibbles.length > 0 ? `<text x="${cx}" y="${handleTop - 8}" font-size="11" fill="#92400e" text-anchor="middle" font-weight="700">咬合 ${nibbles.length}/${NIBBLE_MAX}</text>` : ''}
    </g>`;
  }

  // === 判定 ===
  // 回傳：{ ok, checks: {nick, edge, length}, reason }
  function evaluateStripper() {
    const lvl = LEVELS[currentLevel];
    const lenMm = parseFloat(document.getElementById('ws-length-slider').value);

    const checks = { nick: null, edge: null, length: null };

    // 1. 孔對不對（決定刻痕與端面平整）
    if (stripperGauge === lvl.stripperHole) {
      checks.nick = 'pass';
      checks.edge = 'pass';
    } else if (stripperGauge < lvl.stripperHole) {
      // 孔比線徑小 → 切到銅芯
      checks.nick = 'fail-nick';
      checks.edge = 'pass';
    } else {
      // 孔比線徑大 → 夾不住、外皮被推回去
      checks.nick = 'pass';
      checks.edge = 'fail-loose';
    }

    // 2. 長度
    if (lenMm < lvl.lenWindow[0]) checks.length = 'fail-short';
    else if (lenMm > lvl.lenWindow[1]) checks.length = 'fail-long';
    else checks.length = 'pass';

    const ok = Object.values(checks).every(v => v === 'pass');
    return { ok, checks, lenMm };
  }

  function evaluateCutter() {
    const lvl = LEVELS[currentLevel];
    const lenMm = parseFloat(document.getElementById('ws-length-slider').value);
    const checks = { nick: null, edge: null, length: null };

    // 1. 刻痕：看最高壓力（任何一咬過深 = 整段報廢）
    const maxP = nibbles.length ? Math.max(...nibbles.map(n => n.pressure)) : 0;
    const minP = nibbles.length ? Math.min(...nibbles.map(n => n.pressure)) : 100;
    const [pMin, pMax] = lvl.cutterPressureWindow;

    if (maxP > pMax + 15) checks.nick = 'fail-severe';      // 銅芯斷裂
    else if (maxP > pMax)  checks.nick = 'fail-nick';        // 刻痕 > 10%
    else if (lvl.strands > 1 && maxP > pMax - 5) checks.nick = 'warn-strand'; // 多芯斷股風險
    else checks.nick = 'pass';

    // 2. 端面平整：看「最弱的一咬有沒有破皮」+ 咬合次數
    if (minP < pMin - 10) checks.edge = 'fail-uncut';        // 有一咬太輕 → 外皮沒切斷
    else if (minP < pMin) checks.edge = 'warn-uneven';       // 邊緣不齊整
    else if (nibbles.length < 3) checks.edge = 'fail-fewer'; // 咬不到 3 次
    else checks.edge = 'pass';

    // 3. 長度
    if (lenMm < lvl.lenWindow[0]) checks.length = 'fail-short';
    else if (lenMm > lvl.lenWindow[1]) checks.length = 'fail-long';
    else checks.length = 'pass';

    const ok = Object.values(checks).every(v => v === 'pass' || v === 'warn-strand');
    return { ok, checks, lenMm, maxP, minP };
  }

  function checkLabel(key, status, lvl) {
    const labels = {
      nick: {
        'pass': { icon: '✓', text: '銅芯無刻痕（IPC 合格）', cls: 'ok' },
        'warn-strand': { icon: '⚠', text: '銅芯輕微刻痕（< 10%，多芯有斷股風險）', cls: 'warn' },
        'fail-nick': { icon: '✗', text: '銅芯刻痕 ≥ 10% 直徑（IPC 不合格）', cls: 'bad' },
        'fail-severe': { icon: '✗', text: '銅芯被切斷', cls: 'bad' },
      },
      edge: {
        'pass': { icon: '✓', text: '外皮端面平整', cls: 'ok' },
        'warn-uneven': { icon: '⚠', text: '外皮端面略不齊整', cls: 'warn' },
        'fail-uncut': { icon: '✗', text: '外皮未完全切斷，拉不下來', cls: 'bad' },
        'fail-fewer': { icon: '✗', text: `咬合次數不足（${nibbles.length}/3，端面不平整）`, cls: 'bad' },
        'fail-loose': { icon: '✗', text: '孔太大夾不住，外皮被推回', cls: 'bad' },
      },
      length: {
        'pass': { icon: '✓', text: `露出長度合宜（${lvl.lenWindow[0]}–${lvl.lenWindow[1]}mm）`, cls: 'ok' },
        'fail-short': { icon: '✗', text: `露出太短（< ${lvl.lenWindow[0]}mm，接觸不良）`, cls: 'bad' },
        'fail-long': { icon: '✗', text: `露出太長（> ${lvl.lenWindow[1]}mm，易短路）`, cls: 'bad' },
      },
    };
    return labels[key][status] || { icon: '?', text: '未知', cls: 'bad' };
  }

  // === 動畫 ===
  function playPullAnimation(result) {
    isAnimating = true;
    const svg = document.getElementById('ws-stage-svg');
    const insulation = svg.querySelector('#ws-insulation');
    const stripped = svg.querySelector('#ws-stripped');
    const core = svg.querySelector('#ws-core');
    const cutMark = svg.querySelector('#ws-cut-mark');
    const tool = svg.querySelector(currentMode === 'stripper' ? '#ws-stripper' : '#ws-cutter');

    if (tool) {
      tool.style.transition = 'transform .3s ease-out, opacity .3s';
      tool.style.transform = 'translateY(-30px)';
      tool.style.opacity = '.3';
    }

    setTimeout(() => {
      // 三類結果動畫
      if (result.checks.edge === 'fail-uncut' || result.checks.edge === 'fail-loose') {
        // 外皮沒切斷 → 整條被拉走再彈回
        [insulation, core, cutMark].forEach(g => {
          if (!g) return;
          g.style.transition = 'transform .55s ease-out';
          g.style.transform = 'translateX(60px)';
        });
        setTimeout(() => {
          [insulation, core, cutMark].forEach(g => {
            if (!g) return;
            g.style.transition = 'transform .35s cubic-bezier(.5,1.8,.6,1)';
            g.style.transform = 'translateX(0)';
          });
        }, 600);
      } else if (result.checks.nick === 'fail-severe') {
        // 銅芯斷裂
        if (core) {
          core.style.transition = 'transform .4s ease-out';
          core.style.transform = 'translateX(30px)';
        }
        setTimeout(() => {
          const cutX = 80 + result.lenMm * 8;
          const ns = 'http://www.w3.org/2000/svg';
          const g = document.createElementNS(ns, 'g');
          g.innerHTML = `<line x1="${cutX}" y1="80" x2="${cutX}" y2="160" stroke="#dc2626" stroke-width="3"/>
            <text x="${cutX + 8}" y="76" font-size="13" fill="#dc2626" font-weight="700">✗ 銅芯斷裂</text>`;
          svg.appendChild(g);
        }, 350);
      } else if (result.checks.nick === 'fail-nick' || result.checks.nick === 'warn-strand') {
        // 刻痕 / 斷股
        stripped.style.display = '';
        stripped.style.transition = 'transform .55s ease-out, opacity .55s';
        stripped.style.transform = 'translateX(-40px)';
        stripped.style.opacity = '0';
        setTimeout(() => {
          const cutX = 80 + result.lenMm * 8;
          const ns = 'http://www.w3.org/2000/svg';
          const g = document.createElementNS(ns, 'g');
          const lvl = LEVELS[currentLevel];
          if (lvl.strands === 1) {
            g.innerHTML = `<path d="M ${cutX - 8} 116 L ${cutX} 124 L ${cutX + 8} 116" stroke="#dc2626" stroke-width="1.8" fill="none"/>
              <text x="${cutX + 12}" y="100" font-size="11" fill="#dc2626" font-weight="700">⚠ 銅芯刻痕</text>`;
          } else {
            g.innerHTML = `<line x1="${cutX - 10}" y1="118" x2="${cutX + 8}" y2="113" stroke="#dc2626" stroke-width="2"/>
              <text x="${cutX + 12}" y="100" font-size="11" fill="#dc2626" font-weight="700">⚠ 多芯斷股</text>`;
          }
          svg.appendChild(g);
        }, 250);
      } else {
        // 成功：外皮乾淨脫落
        stripped.style.display = '';
        stripped.style.transition = 'transform .6s ease-out, opacity .6s';
        stripped.style.transform = 'translateX(-50px)';
        stripped.style.opacity = '0';
        if (core) core.setAttribute('filter', 'drop-shadow(0 0 4px #FFD699)');
      }

      setTimeout(() => showResult(result), 750);
    }, 300);
  }

  // === 結果 UI ===
  function showResult(r) {
    const el = document.getElementById('ws-result');
    const lvl = LEVELS[currentLevel];
    const checksHtml = ['nick', 'edge', 'length'].map(k => {
      const lab = checkLabel(k, r.checks[k], lvl);
      return `<div class="ws-result-check ${lab.cls}">${lab.icon} ${lab.text}</div>`;
    }).join('');

    if (r.ok) {
      el.className = 'ws-result show win';
      el.innerHTML = `<h4>🎉 通過 IPC-A-620 工藝檢查</h4>
        <p style="margin:4px 0;font-size:13px">露出長度 ${r.lenMm.toFixed(1)}mm</p>
        <div class="ws-result-checks">${checksHtml}</div>`;
      if (!cleared.has(lvl.id)) {
        cleared.add(lvl.id);
        saveProgress(lvl.id);
        updateProgressUI();
        if (typeof playSuccess === 'function') playSuccess();
        if (typeof showToast === 'function') showToast(`🏆 ${lvl.id} 通關！`, 'good');
      }
    } else {
      el.className = 'ws-result show lose';
      el.innerHTML = `<h4>❌ 未達 IPC-A-620 標準</h4>
        <p style="margin:4px 0;font-size:13px">露出長度 ${r.lenMm.toFixed(1)}mm　・　提示：${lvl.hint}</p>
        <div class="ws-result-checks">${checksHtml}</div>`;
      if (typeof playError === 'function') playError();
    }
    isAnimating = false;
  }

  function updateProgressUI() {
    const pill = document.getElementById('ws-progress-pill');
    if (pill) pill.textContent = `已通關 ${cleared.size} / 3`;
    document.querySelectorAll('.ws-level-tab').forEach((tab, i) => {
      tab.classList.toggle('cleared', cleared.has(LEVELS[i].id));
    });
  }

  // === 控制面板渲染 ===
  function renderControls() {
    const wrap = document.getElementById('ws-controls');
    if (!wrap) return;
    const lenSlider = `
      <div class="ws-control-block">
        <h5>① 量距：露出長度 mm</h5>
        <input type="range" min="2" max="14" value="6" step="0.5" class="ws-slider" id="ws-length-slider">
        <div class="ws-readout"><span>2mm</span><strong id="ws-length-val">6.0 mm</strong><span>14mm</span></div>
      </div>`;
    if (currentMode === 'stripper') {
      wrap.innerHTML = lenSlider + `
        <div class="ws-control-block">
          <h5>② 對號入座：選擇剝線孔</h5>
          <div class="ws-gauge-grid" id="ws-gauge-grid">
            ${GAUGE_HOLES.map(g => `<button class="ws-gauge-btn ${g === stripperGauge ? 'active' : ''}" data-gauge="${g}"><span class="ws-hole"></span>${g} AWG</button>`).join('')}
          </div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.5">電線線徑：<strong>${LEVELS[currentLevel].gauge} AWG</strong>（需對到相同孔）</p>
        </div>`;
    } else {
      wrap.innerHTML = lenSlider + `
        <div class="ws-control-block">
          <h5>② 咬合壓力（每次咬合）</h5>
          <input type="range" min="0" max="100" value="50" class="ws-slider" id="ws-pressure-slider">
          <div class="ws-readout"><span>太輕</span><strong id="ws-pressure-val">50</strong><span>太重</span></div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">提示：每次咬合可調整壓力，太輕沒切到外皮、太重會傷到銅芯。</p>
        </div>
        <div class="ws-control-block">
          <h5>③ 已咬合次數（需 3–4 次繞一圈）</h5>
          <div class="ws-nibble-track" id="ws-nibble-track">
            ${Array.from({length: NIBBLE_MAX}, (_, i) => `<span class="ws-nibble-dot" data-idx="${i}">${i + 1}</span>`).join('')}
          </div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">每按「咬一下」自動轉 90°，最多 4 次。至少 3 次才能拉。</p>
        </div>`;
    }
    bindControlEvents();
  }

  function renderActions() {
    const wrap = document.getElementById('ws-actions');
    if (!wrap) return;
    if (currentMode === 'stripper') {
      wrap.innerHTML = `
        <button class="ws-btn-pri" id="ws-btn-act">夾合並順軸直拉</button>
        <button class="ws-btn-reset" id="ws-btn-reset">重新嘗試</button>`;
    } else {
      const canPull = nibbles.length >= 3;
      wrap.innerHTML = `
        <button class="ws-btn-nibble" id="ws-btn-nibble" ${nibbles.length >= NIBBLE_MAX ? 'disabled' : ''}>✂️ 咬一下（轉 90°）</button>
        <button class="ws-btn-pri" id="ws-btn-act" ${canPull ? '' : 'disabled'}>順軸直拉</button>
        <button class="ws-btn-reset" id="ws-btn-reset">重新嘗試</button>`;
    }
    bindActionEvents();
  }

  function bindControlEvents() {
    const lenSlider = document.getElementById('ws-length-slider');
    if (lenSlider) lenSlider.addEventListener('input', () => {
      document.getElementById('ws-length-val').textContent = parseFloat(lenSlider.value).toFixed(1) + ' mm';
      buildStage({ lenMm: parseFloat(lenSlider.value) });
    });
    const pSlider = document.getElementById('ws-pressure-slider');
    if (pSlider) pSlider.addEventListener('input', () => {
      document.getElementById('ws-pressure-val').textContent = pSlider.value;
    });
    document.querySelectorAll('.ws-gauge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        stripperGauge = parseInt(btn.dataset.gauge, 10);
        document.querySelectorAll('.ws-gauge-btn').forEach(b => b.classList.toggle('active', b === btn));
        buildStage({ lenMm: parseFloat(document.getElementById('ws-length-slider').value) });
      });
    });
  }

  function bindActionEvents() {
    const actBtn = document.getElementById('ws-btn-act');
    if (actBtn) actBtn.addEventListener('click', () => {
      if (isAnimating) return;
      attempts++;
      document.getElementById('ws-attempts').textContent = `嘗試次數：${attempts}`;
      const r = currentMode === 'stripper' ? evaluateStripper() : evaluateCutter();
      playPullAnimation(r);
    });
    const resetBtn = document.getElementById('ws-btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetCurrentTry);
    const nibBtn = document.getElementById('ws-btn-nibble');
    if (nibBtn) nibBtn.addEventListener('click', doNibble);
  }

  function doNibble() {
    if (nibbles.length >= NIBBLE_MAX) return;
    const p = parseInt(document.getElementById('ws-pressure-slider').value, 10);
    const angle = nibbles.length * 90;
    nibbles.push({ pressure: p, angle });
    // 顯示這次咬合狀態
    const lvl = LEVELS[currentLevel];
    const [pMin, pMax] = lvl.cutterPressureWindow;
    let status = 'done';
    if (p > pMax + 15 || p < pMin - 10) status = 'bad';
    else if (p > pMax || p < pMin) status = 'warn';
    const dot = document.querySelector(`.ws-nibble-dot[data-idx="${nibbles.length - 1}"]`);
    if (dot) {
      dot.classList.add(status);
      dot.textContent = status === 'bad' ? '✗' : status === 'warn' ? '⚠' : '✓';
    }
    buildStage({ lenMm: parseFloat(document.getElementById('ws-length-slider').value) });
    renderActions();
    if (typeof SoundFX !== 'undefined') SoundFX.click?.();
  }

  function resetCurrentTry() {
    nibbles = [];
    document.getElementById('ws-result').className = 'ws-result';
    renderControls();
    renderActions();
    buildStage({ lenMm: 6 });
  }

  function switchMode(mode) {
    currentMode = mode;
    nibbles = [];
    attempts = 0;
    stripperGauge = 22;
    document.getElementById('ws-attempts').textContent = `嘗試次數：0`;
    document.querySelectorAll('.ws-mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    const info = document.getElementById('ws-mode-info');
    if (info) {
      info.innerHTML = mode === 'stripper'
        ? `<strong>剝線鉗（正規）：</strong>選對線徑孔 → 量距 → 夾合 → 順軸直拉。判定依 IPC-A-620 三項結果。`
        : `<strong>兩鉗組合（應急）：</strong>量距 → 控制壓力多次輕咬（轉 90° × 3-4 次）→ 順軸直拉。<strong>不能旋轉 360°</strong>。`;
    }
    document.getElementById('ws-result').className = 'ws-result';
    renderControls();
    renderActions();
    buildStage({ lenMm: 6 });
  }

  function switchLevel(level) {
    currentLevel = level;
    nibbles = [];
    attempts = 0;
    stripperGauge = LEVELS[level].stripperHole;
    document.getElementById('ws-attempts').textContent = `嘗試次數：0`;
    document.querySelectorAll('.ws-level-tab').forEach((tab, i) => tab.classList.toggle('active', i === level));
    document.getElementById('ws-result').className = 'ws-result';
    renderControls();
    renderActions();
    buildStage({ lenMm: 6 });
  }

  // === 初始化 ===
  function init() {
    if (!document.getElementById('ws-stage-svg')) return;
    loadProgress();
    updateProgressUI();

    document.querySelectorAll('.ws-mode-tab').forEach(t => t.addEventListener('click', () => switchMode(t.dataset.mode)));
    document.querySelectorAll('.ws-level-tab').forEach(t => t.addEventListener('click', () => switchLevel(parseInt(t.dataset.level, 10))));

    switchMode('stripper');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
