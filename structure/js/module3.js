// 橋樑工程師實驗室 模組 3：橋樑設計實驗室
// 依賴 solver.js（TrussSolver、generateBridge、drawTruss、MATERIALS、memberColor）
const PK = 'structure_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
function getGrade() { return loadP().grade || '7'; }

/* ════════════════════════════════════════════════════
   TAB 切換
════════════════════════════════════════════════════ */
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('panel-guided').style.display   = target === 'guided'   ? '' : 'none';
    document.getElementById('panel-advanced').style.display = target === 'advanced' ? '' : 'none';
  });
});

/* ════════════════════════════════════════════════════
   橋型說明資料（含 SVG 示意圖）
   座標系：viewBox="0 0 360 96"，4 格桁架，格寬 80px
   Bottom y=78，Top y=18，左邊距 10px
   底弦節點：L0(10),L1(90),L2(170),L3(250),L4(330)
   上弦節點（Pratt/Howe/K）：U1(90),U2(170),U3(250)
   上弦節點（Warren）：U1(50),U2(130),U3(210),U4(290)
════════════════════════════════════════════════════ */
const _SVG_NODES_STD = `<g fill="#fff" stroke="#0f766e" stroke-width="1.5">
  <circle cx="10" cy="78" r="4"/><circle cx="90" cy="78" r="4"/><circle cx="170" cy="78" r="4"/>
  <circle cx="250" cy="78" r="4"/><circle cx="330" cy="78" r="4"/>
  <circle cx="90" cy="18" r="4"/><circle cx="170" cy="18" r="4"/><circle cx="250" cy="18" r="4"/>
</g>`;
const _SVG_NODES_WRN = `<g fill="#fff" stroke="#0f766e" stroke-width="1.5">
  <circle cx="10" cy="78" r="4"/><circle cx="90" cy="78" r="4"/><circle cx="170" cy="78" r="4"/>
  <circle cx="250" cy="78" r="4"/><circle cx="330" cy="78" r="4"/>
  <circle cx="50" cy="18" r="4"/><circle cx="130" cy="18" r="4"/><circle cx="210" cy="18" r="4"/><circle cx="290" cy="18" r="4"/>
</g>`;
const _SVG_SUP = `<polygon points="10,78 2,93 18,93" fill="#0f766e"/>
<polygon points="330,78 322,93 338,93" fill="#0d9488"/>
<line x1="2" y1="94" x2="18" y2="94" stroke="#0f766e" stroke-width="2"/>
<line x1="322" y1="94" x2="338" y2="94" stroke="#0d9488" stroke-width="2"/>`;
const _SVG_CHORD_STD = `<line x1="10" y1="78" x2="330" y2="78" stroke="#0f766e" stroke-width="4"/>
<line x1="90" y1="18" x2="250" y2="18" stroke="#0f766e" stroke-width="4"/>
<line x1="10" y1="78" x2="90" y2="18" stroke="#0f766e" stroke-width="3"/>
<line x1="330" y1="78" x2="250" y2="18" stroke="#0f766e" stroke-width="3"/>`;

const BRIDGE_INFO = {
  pratt: {
    title: '普拉特桁架 Pratt Truss',
    year: '1844 年 Thomas Pratt 發明 ／ 適合跨度 15–75m',
    features: [
      '豎桿受<b style="color:#dc2626">壓力</b>（紅），斜桿受<b style="color:#2563eb">張力</b>（藍）',
      '斜桿只受拉力，可做得又細又長，不怕挫曲',
      '左半斜桿向右上傾 ↗，右半向左上傾 ↖',
      '台灣鐵路橋、早期公路橋最常見的形式',
    ],
    svg: `<svg viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style="width:100%">
${_SVG_CHORD_STD}
<!-- 豎桿（紅=壓力） -->
<line x1="90" y1="18" x2="90" y2="78" stroke="#dc2626" stroke-width="3"/>
<line x1="170" y1="18" x2="170" y2="78" stroke="#dc2626" stroke-width="3"/>
<line x1="250" y1="18" x2="250" y2="78" stroke="#dc2626" stroke-width="3"/>
<!-- 斜桿（藍=張力，左↗右↖） -->
<line x1="90" y1="78" x2="170" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<line x1="250" y1="78" x2="170" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<!-- 標籤 -->
<text x="129" y="13" text-anchor="middle" font-size="9.5" fill="#dc2626" font-family="Inter,sans-serif" font-weight="700">豎桿＝壓</text>
<text x="88" y="60" text-anchor="middle" font-size="9.5" fill="#2563eb" font-family="Inter,sans-serif" font-weight="700">斜桿＝拉</text>
${_SVG_NODES_STD}${_SVG_SUP}</svg>`,
  },
  howe: {
    title: '豪氏桁架 Howe Truss',
    year: '1840 年 William Howe 設計 ／ 早期鐵路橋主流',
    features: [
      '豎桿受<b style="color:#2563eb">張力</b>（藍），斜桿受<b style="color:#dc2626">壓力</b>（紅）',
      '歷史上組合鐵製豎桿（耐拉）+ 木製斜桿（耐壓）',
      '左半斜桿向左上傾 ↖，右半向右上傾 ↗（與 Pratt 相反）',
      '壓力斜桿需較大截面積以防挫曲，現今較少使用',
    ],
    svg: `<svg viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style="width:100%">
${_SVG_CHORD_STD}
<!-- 豎桿（藍=張力） -->
<line x1="90" y1="18" x2="90" y2="78" stroke="#2563eb" stroke-width="3"/>
<line x1="170" y1="18" x2="170" y2="78" stroke="#2563eb" stroke-width="3"/>
<line x1="250" y1="18" x2="250" y2="78" stroke="#2563eb" stroke-width="3"/>
<!-- 斜桿（紅=壓力，左↖右↗，方向與 Pratt 相反） -->
<line x1="170" y1="78" x2="90" y2="18" stroke="#dc2626" stroke-width="2.5"/>
<line x1="170" y1="78" x2="250" y2="18" stroke="#dc2626" stroke-width="2.5"/>
<!-- 標籤 -->
<text x="129" y="13" text-anchor="middle" font-size="9.5" fill="#2563eb" font-family="Inter,sans-serif" font-weight="700">豎桿＝拉</text>
<text x="130" y="60" text-anchor="middle" font-size="9.5" fill="#dc2626" font-family="Inter,sans-serif" font-weight="700">斜桿＝壓</text>
${_SVG_NODES_STD}${_SVG_SUP}</svg>`,
  },
  warren: {
    title: '華倫桁架 Warren Truss',
    year: '1848 年 James Warren 發明 ／ 現代公路橋主流',
    features: [
      '<b>無豎桿</b>，上弦節點位於下弦節點<b>中點</b>位置',
      '斜桿交替受<b style="color:#2563eb">拉</b>（藍）/<b style="color:#dc2626">壓</b>（紅）',
      '桿件數量少，結構輕盈、外觀通透簡潔',
      '台灣省道橋、人行陸橋廣泛採用',
    ],
    svg: `<svg viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style="width:100%">
<!-- 下弦 -->
<line x1="10" y1="78" x2="330" y2="78" stroke="#0f766e" stroke-width="4"/>
<!-- 上弦（上弦節點在下弦節點中點） -->
<line x1="50" y1="18" x2="290" y2="18" stroke="#0f766e" stroke-width="4"/>
<!-- 端斜桿 -->
<line x1="10" y1="78" x2="50" y2="18" stroke="#0f766e" stroke-width="3"/>
<line x1="330" y1="78" x2="290" y2="18" stroke="#0f766e" stroke-width="3"/>
<!-- zigzag 斜桿：壓(紅)↘ 和 拉(藍)↗ 交替 -->
<line x1="50" y1="18" x2="90" y2="78" stroke="#dc2626" stroke-width="2.5"/>
<line x1="90" y1="78" x2="130" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<line x1="130" y1="18" x2="170" y2="78" stroke="#dc2626" stroke-width="2.5"/>
<line x1="170" y1="78" x2="210" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<line x1="210" y1="18" x2="250" y2="78" stroke="#dc2626" stroke-width="2.5"/>
<line x1="250" y1="78" x2="290" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<!-- 標籤 -->
<text x="180" y="54" text-anchor="middle" font-size="9.5" fill="#555" font-family="Inter,sans-serif" font-weight="700">無豎桿</text>
${_SVG_NODES_WRN}${_SVG_SUP}</svg>`,
  },
  k: {
    title: 'K 型桁架 K-Truss',
    year: '適合大跨度（50m+）深桁架橋樑',
    features: [
      '每個底弦節點 Lᵢ 向<b>左右兩側</b>各伸出一根斜桿',
      '豎桿加上雙向斜桿在面板上形成 K 字形',
      '有效縮短壓力桿件的挫曲長度，適合重荷重',
      '桿件多、節點計算複雜，現代以電腦輔助設計',
    ],
    svg: `<svg viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style="width:100%">
${_SVG_CHORD_STD}
<!-- 豎桿（teal=中性） -->
<line x1="90" y1="18" x2="90" y2="78" stroke="#0d9488" stroke-width="3"/>
<line x1="170" y1="18" x2="170" y2="78" stroke="#0d9488" stroke-width="3"/>
<line x1="250" y1="18" x2="250" y2="78" stroke="#0d9488" stroke-width="3"/>
<!-- 右斜桿 DRᵢ：Lᵢ→U(i+1)（藍=拉） -->
<line x1="90" y1="78" x2="170" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<line x1="170" y1="78" x2="250" y2="18" stroke="#2563eb" stroke-width="2.5"/>
<!-- 左斜桿 DLᵢ：Lᵢ→U(i-1)（紅=壓，虛線區別） -->
<line x1="170" y1="78" x2="90" y2="18" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5,3"/>
<line x1="250" y1="78" x2="170" y2="18" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5,3"/>
<!-- K 標示 -->
<text x="130" y="54" text-anchor="middle" font-size="13" fill="#7c3aed" font-family="Inter,sans-serif" font-weight="900">K</text>
<text x="214" y="54" text-anchor="middle" font-size="13" fill="#7c3aed" font-family="Inter,sans-serif" font-weight="900">K</text>
${_SVG_NODES_STD}${_SVG_SUP}</svg>`,
  },
  simply: {
    title: '簡支梁橋 Simply Supported Beam',
    year: '最基本橋型 ／ 短跨度（< 15m）首選',
    features: [
      '上緣受<b style="color:#dc2626">壓力</b>，下緣受<b style="color:#2563eb">張力</b>（彎矩效應）',
      '結構最簡單，施工快速，成本最低',
      '跨度受限於梁深比（span/depth ≤ 20）',
      '跨度越大需越深的梁，效率不如桁架橋',
    ],
    svg: `<svg viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style="width:100%">
<!-- 梁體 -->
<rect x="15" y="26" width="330" height="42" rx="5" fill="#e0f2fe" stroke="#0f766e" stroke-width="2"/>
<!-- 上緣壓力 -->
<rect x="15" y="26" width="330" height="11" rx="5" fill="#dc2626" opacity=".22"/>
<text x="180" y="36" text-anchor="middle" font-size="9.5" fill="#dc2626" font-family="Inter,sans-serif" font-weight="700">上緣 ＝ 壓力</text>
<!-- 下緣張力 -->
<rect x="15" y="57" width="330" height="11" rx="5" fill="#2563eb" opacity=".22"/>
<text x="180" y="67" text-anchor="middle" font-size="9.5" fill="#2563eb" font-family="Inter,sans-serif" font-weight="700">下緣 ＝ 張力</text>
<!-- 中性軸 -->
<line x1="15" y1="47" x2="345" y2="47" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6,3"/>
<text x="349" y="50" font-size="8" fill="#94a3b8" font-family="Inter,sans-serif">N.A.</text>
<!-- 彎矩圖（拋物線） -->
<path d="M15,80 Q180,93 345,80" stroke="#f59e0b" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
<text x="180" y="95" text-anchor="middle" font-size="8.5" fill="#b45309" font-family="Inter,sans-serif" font-weight="600">彎矩圖（跨中最大）</text>
<!-- 集中荷重箭頭 -->
<line x1="180" y1="10" x2="180" y2="24" stroke="#dc2626" stroke-width="2.5"/>
<polygon points="180,26 174,16 186,16" fill="#dc2626"/>
<text x="180" y="8" text-anchor="middle" font-size="9" fill="#dc2626" font-family="Inter,sans-serif" font-weight="700">P</text>
<!-- 支承 -->
<polygon points="15,68 7,82 23,82" fill="#0f766e"/>
<polygon points="345,68 337,82 353,82" fill="#0d9488"/>
<line x1="7" y1="83" x2="23" y2="83" stroke="#0f766e" stroke-width="2"/>
<line x1="337" y1="83" x2="353" y2="83" stroke="#0d9488" stroke-width="2"/>
</svg>`,
  },
};

function showBridgeInfo(type) {
  const info = BRIDGE_INFO[type];
  const card = document.getElementById('bridge-info-card');
  if (!info) { card.style.display = 'none'; return; }
  document.getElementById('bic-title').textContent = info.title;
  document.getElementById('bic-year').textContent = info.year;
  document.getElementById('bic-features').innerHTML = info.features.map(f => `<li>${f}</li>`).join('');
  document.getElementById('bic-svg').innerHTML = info.svg;
  card.style.display = '';
}

/* ════════════════════════════════════════════════════
   基礎模式（Guided）
════════════════════════════════════════════════════ */
const guidedCanvas = document.getElementById('guided-canvas');
const guidedCtx    = guidedCanvas.getContext('2d');
let guidedTruss    = null;
let guidedResult   = null;
let currentBridgeType = 'pratt';

// 橋型切換
document.querySelectorAll('#bridge-type-tabs .bridge-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bridge-type-tabs .bridge-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentBridgeType = btn.dataset.type;
    guidedResult = null;
    document.getElementById('fem-results').innerHTML = '<span style="color:var(--text-muted);font-size:13px">求解後顯示</span>';
    document.getElementById('g-collapse-btn').style.opacity = '.4';
    document.getElementById('g-collapse-btn').style.pointerEvents = 'none';
    document.getElementById('guided-canvas-hint').style.display = '';
    guidedCtx.clearRect(0, 0, guidedCanvas.width, guidedCanvas.height);
    showBridgeInfo(currentBridgeType);
  });
});
// 頁面載入時顯示預設橋型說明
showBridgeInfo('pratt');

// 求解按鈕
document.getElementById('g-solve-btn').addEventListener('click', guidedSolve);

function guidedSolve() {
  const material = document.getElementById('g-material').value;
  const span     = parseFloat(document.getElementById('g-span').value)   || 12;
  const height   = parseFloat(document.getElementById('g-height').value) || 3;
  const loadKN   = parseFloat(document.getElementById('g-load').value)   || 100;

  guidedTruss = generateBridge(currentBridgeType, span, height, material);
  // 覆蓋荷重
  const panels = guidedTruss.nodes.filter(n => n.id.startsWith('L')).length - 1;
  guidedTruss.loads = [];
  for (let i = 1; i < panels; i++) {
    guidedTruss.loads.push({ nodeId: `L${i}`, fx: 0, fy: -(loadKN * 1000) / (panels - 1) });
  }

  const solver = new TrussSolver(guidedTruss);
  guidedResult = solver.solve();

  document.getElementById('guided-canvas-hint').style.display = 'none';

  if (!guidedResult.ok) {
    document.getElementById('fem-results').innerHTML = `<div class="feedback error">⚠ ${guidedResult.error}</div>`;
    return;
  }

  drawTruss(guidedCtx, guidedCanvas.width, guidedCanvas.height, guidedTruss, guidedResult, null);

  // 顯示結果面板
  const forces = Object.values(guidedResult.memberForces);
  const maxTens = Math.max(...forces.filter(f => f > 0), 0) / 1000;
  const maxComp = Math.min(...forces.filter(f => f < 0), 0) / 1000;
  const sfs = Object.values(guidedResult.safetyFactors).filter(sf => isFinite(sf));
  const minSF = sfs.length ? Math.min(...sfs) : Infinity;
  const mat = MATERIALS[material];
  const totalWeight = guidedTruss.members.reduce((sum, m) => {
    const ni = guidedTruss.nodes.find(n => n.id === m.n1Id);
    const nj = guidedTruss.nodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) return sum;
    const L = Math.sqrt((nj.x-ni.x)**2 + (nj.y-ni.y)**2);
    return sum + L * DEFAULT_AREA * mat.density;
  }, 0);

  const sfColor  = minSF < 1.5 ? '#f97316' : minSF < 2 ? '#ca8a04' : '#16a34a';
  const sfLabel  = minSF < 1.5 ? '❌ 危險' : minSF < 2 ? '⚠ 偏低' : '✅ 安全';

  document.getElementById('fem-results').innerHTML = `
    <div class="fem-stat"><span class="label">最大張力</span><span class="value tension">${maxTens.toFixed(1)} kN</span></div>
    <div class="fem-stat"><span class="label">最大壓力</span><span class="value compression">${Math.abs(maxComp).toFixed(1)} kN</span></div>
    <div class="fem-stat"><span class="label">最小安全係數</span><span class="value" style="color:${sfColor}">${isFinite(minSF) ? minSF.toFixed(2) : '∞'} ${sfLabel}</span></div>
    <div class="fem-stat"><span class="label">估計重量</span><span class="value">${(totalWeight).toFixed(0)} kg</span></div>
    <div class="fem-stat"><span class="label">材料</span><span class="value">${mat.name}</span></div>
  `;

  // 年級說明
  const notes = {
    '7': `桿件顏色：藍=張力、紅=壓力。SF=${isFinite(minSF) ? minSF.toFixed(1) : '∞'}，大於 2 才安全。`,
    '8': `FEM 求解完成。最小 SF=${isFinite(minSF) ? minSF.toFixed(2) : '∞'}；材料用量 ${totalWeight.toFixed(0)}kg。`,
    '9': `σ_max = F_max / A = ${Math.max(maxTens, Math.abs(maxComp)).toFixed(0)}kN / ${(DEFAULT_AREA*1e4).toFixed(0)}cm² = ${(Math.max(maxTens, Math.abs(maxComp))*1000/DEFAULT_AREA/1e6).toFixed(1)} MPa`,
    'T': `DSM求解：${guidedTruss.nodes.length} nodes, ${guidedTruss.members.length} members, DOF=${guidedTruss.nodes.length*2}`
  };
  const noteEl = document.getElementById('g-grade-note');
  noteEl.textContent = notes[getGrade()] || notes['7'];

  // 啟用崩塌按鈕
  document.getElementById('g-collapse-btn').style.opacity = '1';
  document.getElementById('g-collapse-btn').style.pointerEvents = 'auto';

  // 儲存進度
  const pp = loadP(); pp.module3_guided = true; saveP(pp);
  if (typeof SoundFX !== 'undefined') SoundFX.unlock();
}

/* ── Matter.js 崩塌動畫 ────────────────────────────────── */
document.getElementById('g-collapse-btn').addEventListener('click', () => {
  if (!guidedResult || !guidedTruss) return;
  triggerCollapse(guidedCanvas, guidedTruss, guidedResult);
});

function triggerCollapse(canvas, truss, result) {
  if (typeof Matter === 'undefined') {
    alert('Matter.js 尚未載入，請確認網路連線後重新整理。');
    return;
  }
  if (typeof SoundFX !== 'undefined') SoundFX.error();

  const { Engine, Render, Runner, World, Bodies, Body, Constraint, Events } = Matter;
  const W = canvas.width, H = canvas.height;

  // 計算縮放（與 drawTruss 一致）
  const nodes = truss.nodes;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => { minX=Math.min(minX,n.x); maxX=Math.max(maxX,n.x); minY=Math.min(minY,n.y); maxY=Math.max(maxY,n.y); });
  const sc = Math.min(W*0.82/(maxX-minX||1), H*0.70/(maxY-minY||1));
  const offX = (W - (maxX-minX)*sc) / 2 - minX*sc;
  const ty = y => H*0.85 - y*sc;
  const tx = x => x*sc + offX;

  const engine = Engine.create({ gravity: { y: 0.5 } });
  const world  = engine.world;

  // 節點 → Matter Body（小圓）
  const bodyMap = {};
  nodes.forEach(n => {
    const b = Bodies.circle(tx(n.x), ty(n.y), 5, {
      isStatic: truss.supports?.some(s => s.nodeId === n.id) || false,
      restitution: 0.3, friction: 0.3,
    });
    World.add(world, b);
    bodyMap[n.id] = b;
  });

  // 地板
  World.add(world, Bodies.rectangle(W/2, H+20, W, 40, { isStatic: true }));

  // 桿件 → Constraint（安全的桿件）或 不加（不安全的桿件）
  const constraints = [];
  truss.members.forEach(m => {
    const sf = result.safetyFactors[m.id];
    const safe = sf && sf >= 1.5;
    if (safe) {
      const c = Constraint.create({
        bodyA: bodyMap[m.n1Id], bodyB: bodyMap[m.n2Id],
        stiffness: 1, damping: 0.1,
        render: { lineWidth: 2, strokeStyle: '#0d9488' },
      });
      World.add(world, c);
      constraints.push({ c, memberId: m.id });
    }
  });

  // 在 Canvas 上覆蓋 Matter.js 渲染
  const overlay = document.getElementById('guided-collapse-overlay');
  overlay.classList.add('active');

  // 手動繪製循環（不用 Matter Render，直接在原 canvas 上畫）
  let frame = 0;
  const FRAMES = 120; // 2秒 @ 60fps
  function tick() {
    Engine.update(engine, 1000/60);
    const ctx = guidedCtx;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // 畫約束線（剩餘桿件）
    constraints.forEach(({ c }) => {
      if (!c.bodyA || !c.bodyB) return;
      ctx.beginPath();
      ctx.moveTo(c.bodyA.position.x, c.bodyA.position.y);
      ctx.lineTo(c.bodyB.position.x, c.bodyB.position.y);
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // 畫節點
    Object.values(bodyMap).forEach(b => {
      ctx.beginPath();
      ctx.arc(b.position.x, b.position.y, 5, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });

    frame++;
    if (frame < FRAMES) {
      requestAnimationFrame(tick);
    } else {
      // 清理 Matter
      World.clear(world);
      Engine.clear(engine);
      overlay.classList.remove('active');
      // 重繪靜態桁架
      drawTruss(guidedCtx, W, H, truss, result, null);
      showToast('💥 崩塌測試完成！安全係數不足的桿件會先斷裂。', 'warn');
    }
  }
  tick();
}

/* ════════════════════════════════════════════════════
   進階挑戰（Free Design）
════════════════════════════════════════════════════ */
const CHALLENGES = [
  { id: 'c1', name: '市區人行天橋', span: '8m', load: '30kN', budget: '$5,000', desc: '跨度 8m，承受 30kN 行人荷重，預算 $5,000（鋼 $1/kg）', targetSpan: 8, targetLoad: 30000, maxCost: 5000 },
  { id: 'c2', name: '公路橋', span: '12m', load: '100kN', budget: '$10,000', desc: '跨度 12m，承受 100kN 卡車荷重，需含颱風側風力', targetSpan: 12, targetLoad: 100000, maxCost: 10000 },
  { id: 'c3', name: '最輕量競賽', span: '6m', load: '20kN', budget: '無限制', desc: '跨度 6m，承受 20kN，目標設計最輕的安全橋', targetSpan: 6, targetLoad: 20000, maxCost: Infinity },
  { id: 'c4', name: '紙橋模擬', span: '4m', load: '5kN', budget: '$1,000', desc: '模擬班級紙橋比賽：4m跨度，目標承 5kN，材料費最省', targetSpan: 4, targetLoad: 5000, maxCost: 1000 },
];

let currentChallenge = CHALLENGES[0];
const challengeGrid = document.getElementById('challenge-grid');
CHALLENGES.forEach(c => {
  const card = document.createElement('div');
  card.className = 'challenge-card' + (c.id === 'c1' ? ' active' : '');
  card.innerHTML = `<h5>${c.name}</h5><p>${c.desc}</p>`;
  card.addEventListener('click', () => {
    document.querySelectorAll('.challenge-card').forEach(cc => cc.classList.remove('active'));
    card.classList.add('active');
    currentChallenge = c;
    advClear();
  });
  challengeGrid.appendChild(card);
});

/* ── 進階畫板 ──────────────────────────────────────────── */
const advCanvas = document.getElementById('adv-canvas');
const advCtx    = advCanvas.getContext('2d');
const ADV_W = advCanvas.width, ADV_H = advCanvas.height;
const GRID = 40; // 像素格距（1格 = 0.5m 在 8m跨度下）

let advNodes   = [];
let advMembers = [];
let advResult  = null;
let activeTool = 'node';
let selectedNode   = null; // 新增桿件時第一個點
let moveNode   = null; // 正在拖動的節點
let isDragging = false;

// 工具列
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTool = btn.dataset.tool;
    selectedNode = null;
    moveNode = null;
  });
});

// 快捷鍵
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const keyMap = { 'n': 'node', 'm': 'member', 's': 'move', 'N': 'node', 'M': 'member', 'S': 'move' };
  if (keyMap[e.key]) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${keyMap[e.key]}`).classList.add('active');
    activeTool = keyMap[e.key];
    selectedNode = null;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tool-delete').classList.add('active');
    activeTool = 'delete';
  }
});

function advClear() {
  advNodes = []; advMembers = []; advResult = null; selectedNode = null;
  redrawAdv();
  updateAdvStats();
}
document.getElementById('adv-clear-btn').addEventListener('click', advClear);

// 像素 → 世界座標（m）
function px2m(px, py) {
  const s = currentChallenge.targetSpan;
  const scaleX = ADV_W * 0.85 / s;
  const scaleY = ADV_H * 0.65 / 4; // 假設高度 4m 為顯示範圍
  const offX = ADV_W * 0.075;
  const offY = ADV_H * 0.85;
  return { x: (px - offX) / scaleX, y: (offY - py) / scaleY };
}
function m2px(mx, my) {
  const s = currentChallenge.targetSpan;
  const scaleX = ADV_W * 0.85 / s;
  const scaleY = ADV_H * 0.65 / 4;
  const offX = ADV_W * 0.075;
  const offY = ADV_H * 0.85;
  return { x: mx * scaleX + offX, y: offY - my * scaleY };
}

// 對齊到格點（0.25m 精度）
function snapToGrid(wx, wy) {
  const SNAP = 0.25;
  return { x: Math.round(wx/SNAP)*SNAP, y: Math.max(0, Math.round(wy/SNAP)*SNAP) };
}

function findNodeNear(px, py, radius = 14) {
  for (const n of advNodes) {
    const p = m2px(n.x, n.y);
    const d = Math.sqrt((p.x-px)**2 + (p.y-py)**2);
    if (d <= radius) return n;
  }
  return null;
}
function findMemberNear(px, py, radius = 8) {
  for (const m of advMembers) {
    const ni = advNodes.find(n => n.id === m.n1Id);
    const nj = advNodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) continue;
    const pi = m2px(ni.x, ni.y), pj = m2px(nj.x, nj.y);
    // 點到線段距離
    const dx = pj.x-pi.x, dy = pj.y-pi.y;
    const L2 = dx*dx+dy*dy;
    if (L2 < 1) continue;
    const t = Math.max(0, Math.min(1, ((px-pi.x)*dx+(py-pi.y)*dy)/L2));
    const cx = pi.x+t*dx, cy = pi.y+t*dy;
    if (Math.sqrt((px-cx)**2+(py-cy)**2) < radius) return m;
  }
  return null;
}

let nodeIdCounter = 0;
let memberIdCounter = 0;

advCanvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  const rect = advCanvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (ADV_W / rect.width);
  const py = (e.clientY - rect.top)  * (ADV_H / rect.height);
  const world = px2m(px, py);
  const snapped = snapToGrid(world.x, world.y);

  if (activeTool === 'node') {
    // 避免重疊節點
    const existing = findNodeNear(px, py);
    if (!existing) {
      advNodes.push({ id: `N${nodeIdCounter++}`, x: snapped.x, y: snapped.y });
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      advResult = null;
      updateAdvStats();
    }
  } else if (activeTool === 'member') {
    const nd = findNodeNear(px, py);
    if (nd) {
      if (!selectedNode) {
        selectedNode = nd;
      } else if (selectedNode.id !== nd.id) {
        // 避免重複桿件
        const exists = advMembers.some(m =>
          (m.n1Id === selectedNode.id && m.n2Id === nd.id) ||
          (m.n1Id === nd.id && m.n2Id === selectedNode.id)
        );
        if (!exists) {
          const mat = MATERIALS[document.getElementById('adv-material').value];
          advMembers.push({ id: `M${memberIdCounter++}`, n1Id: selectedNode.id, n2Id: nd.id,
            E: mat.E, A: DEFAULT_AREA, yieldStress: mat.yieldStress });
          if (typeof SoundFX !== 'undefined') SoundFX.click();
        }
        selectedNode = null;
        advResult = null;
        updateAdvStats();
      }
    }
  } else if (activeTool === 'move') {
    const nd = findNodeNear(px, py);
    if (nd) {
      moveNode = nd; isDragging = true;
      try { advCanvas.setPointerCapture(e.pointerId); } catch (_) {}
    }
  } else if (activeTool === 'delete') {
    const nd = findNodeNear(px, py);
    if (nd) {
      advNodes = advNodes.filter(n => n.id !== nd.id);
      advMembers = advMembers.filter(m => m.n1Id !== nd.id && m.n2Id !== nd.id);
      advResult = null; updateAdvStats();
      if (typeof SoundFX !== 'undefined') SoundFX.error();
    } else {
      const mb = findMemberNear(px, py);
      if (mb) {
        advMembers = advMembers.filter(m => m.id !== mb.id);
        advResult = null; updateAdvStats();
        if (typeof SoundFX !== 'undefined') SoundFX.error();
      }
    }
  }
  redrawAdv();
});

advCanvas.addEventListener('pointermove', e => {
  if (activeTool === 'move' && isDragging && moveNode) {
    const rect = advCanvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (ADV_W / rect.width);
    const py = (e.clientY - rect.top)  * (ADV_H / rect.height);
    const world = px2m(px, py);
    const snapped = snapToGrid(world.x, world.y);
    moveNode.x = Math.max(0, Math.min(currentChallenge.targetSpan, snapped.x));
    moveNode.y = Math.max(0, snapped.y);
    advResult = null;
    redrawAdv();
  }
});

['pointerup', 'pointercancel'].forEach(ev =>
  advCanvas.addEventListener(ev, () => { isDragging = false; moveNode = null; updateAdvStats(); }));

function redrawAdv() {
  advCtx.clearRect(0, 0, ADV_W, ADV_H);
  advCtx.fillStyle = '#0f172a';
  advCtx.fillRect(0, 0, ADV_W, ADV_H);

  // 格線
  advCtx.strokeStyle = '#1e293b';
  advCtx.lineWidth = 1;
  const s = currentChallenge.targetSpan;
  for (let gx = 0; gx <= s; gx += 0.5) {
    const p = m2px(gx, 0);
    advCtx.beginPath(); advCtx.moveTo(p.x, 0); advCtx.lineTo(p.x, ADV_H); advCtx.stroke();
  }
  for (let gy = 0; gy <= 4; gy += 0.5) {
    const p = m2px(0, gy);
    advCtx.beginPath(); advCtx.moveTo(0, p.y); advCtx.lineTo(ADV_W, p.y); advCtx.stroke();
  }

  // 地面線
  const ground = m2px(0, 0);
  advCtx.strokeStyle = '#475569';
  advCtx.lineWidth = 2;
  advCtx.beginPath(); advCtx.moveTo(0, ground.y); advCtx.lineTo(ADV_W, ground.y); advCtx.stroke();

  // 尺寸標記
  const p0 = m2px(0, 0), ps = m2px(s, 0);
  advCtx.fillStyle = '#94a3b8'; advCtx.font = '11px Inter,sans-serif'; advCtx.textAlign = 'center';
  advCtx.fillText(`跨度 ${s}m`, (p0.x+ps.x)/2, ground.y+22);
  advCtx.fillText('0', p0.x, ground.y+22);
  advCtx.fillText(`${s}m`, ps.x, ground.y+22);

  // 桿件
  advMembers.forEach(m => {
    const ni = advNodes.find(n => n.id === m.n1Id);
    const nj = advNodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) return;
    const pi = m2px(ni.x, ni.y), pj = m2px(nj.x, nj.y);
    const force = advResult?.memberForces?.[m.id] ?? 0;
    const sf    = advResult?.safetyFactors?.[m.id];
    const color = advResult ? memberColor(force, sf) : '#64748b';
    advCtx.beginPath();
    advCtx.moveTo(pi.x, pi.y); advCtx.lineTo(pj.x, pj.y);
    advCtx.strokeStyle = color; advCtx.lineWidth = 3; advCtx.stroke();
    if (advResult) {
      const mx = (pi.x+pj.x)/2, my = (pi.y+pj.y)/2;
      advCtx.fillStyle = color; advCtx.font = 'bold 10px Inter';
      advCtx.textAlign = 'center'; advCtx.textBaseline = 'middle';
      advCtx.fillText(`${(force/1000).toFixed(1)}kN`, mx, my-9);
    }
  });

  // 節點
  advNodes.forEach(n => {
    const p = m2px(n.x, n.y);
    const isSel = selectedNode?.id === n.id;
    // 支承標記（y=0 視為支承候選）
    const isSupport = n.y < 0.1;
    advCtx.beginPath();
    advCtx.arc(p.x, p.y, isSel ? 8 : 6, 0, Math.PI*2);
    advCtx.fillStyle = isSel ? '#f59e0b' : (isSupport ? '#0d9488' : '#fff');
    advCtx.fill();
    advCtx.strokeStyle = '#1e293b'; advCtx.lineWidth = 2; advCtx.stroke();
    advCtx.fillStyle = '#94a3b8'; advCtx.font = '9px Inter'; advCtx.textAlign = 'center';
    advCtx.fillText(`(${n.x.toFixed(1)},${n.y.toFixed(1)})`, p.x, p.y-12);
  });
}

// FEM 求解
document.getElementById('adv-solve-btn').addEventListener('click', () => {
  if (advNodes.length < 2) {
    showToast('至少需要 2 個節點才能求解', 'warn'); return;
  }
  if (advMembers.length < 1) {
    showToast('至少需要 1 根桿件才能求解', 'warn'); return;
  }
  // 自動指定支承：y=0 的最左和最右節點
  const bottomNodes = advNodes.filter(n => n.y < 0.1).sort((a,b) => a.x-b.x);
  if (bottomNodes.length < 2) {
    showToast('請在底部（y=0）至少放 2 個節點作為支承', 'warn'); return;
  }
  const pinNode    = bottomNodes[0];
  const rollerNode = bottomNodes[bottomNodes.length - 1];

  // 荷重：在頂部節點均布
  const topNodes = advNodes.filter(n => n.y > 0.5).sort((a,b) => a.x-b.x);
  const loads = topNodes.length > 0
    ? topNodes.map(nd => ({ nodeId: nd.id, fx: 0, fy: -currentChallenge.targetLoad / topNodes.length }))
    : [{ nodeId: advNodes[Math.floor(advNodes.length/2)].id, fx: 0, fy: -currentChallenge.targetLoad }];

  const supports = [
    { nodeId: pinNode.id, fixX: true, fixY: true },
    { nodeId: rollerNode.id, fixX: false, fixY: true },
  ];

  const solver = new TrussSolver({ nodes: advNodes, members: advMembers, loads, supports });
  advResult = solver.solve();

  if (!advResult.ok) {
    showToast(`求解失敗：${advResult.error}`, 'warn');
    advResult = null; return;
  }
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  redrawAdv();
  updateAdvStats();

  // 儲存進度
  const sfs = Object.values(advResult.safetyFactors).filter(sf => isFinite(sf));
  const minSF = sfs.length ? Math.min(...sfs) : 0;
  if (minSF >= 2) {
    const pp = loadP();
    pp.module3_advanced_star = Math.max(pp.module3_advanced_star||0, minSF >= 3 ? 3 : 2);
    saveP(pp);
  }
});

function updateAdvStats() {
  document.getElementById('adv-nodes').textContent = advNodes.length;
  document.getElementById('adv-members').textContent = advMembers.length;

  if (!advResult) {
    document.getElementById('adv-weight').textContent  = '— kg';
    document.getElementById('adv-sf').textContent      = '—';
    document.getElementById('adv-max-tens').textContent = '— kN';
    document.getElementById('adv-max-comp').textContent = '— kN';
    document.getElementById('adv-verdict').innerHTML = '';
    return;
  }

  const mat = MATERIALS[document.getElementById('adv-material').value];
  const totalWeight = advMembers.reduce((sum, m) => {
    const ni = advNodes.find(n => n.id === m.n1Id);
    const nj = advNodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) return sum;
    const L = Math.sqrt((nj.x-ni.x)**2 + (nj.y-ni.y)**2);
    return sum + L * DEFAULT_AREA * mat.density;
  }, 0);

  const forces = Object.values(advResult.memberForces);
  const maxTens = Math.max(...forces.filter(f => f > 0), 0) / 1000;
  const maxComp = Math.abs(Math.min(...forces.filter(f => f < 0), 0)) / 1000;
  const sfs = Object.values(advResult.safetyFactors).filter(sf => isFinite(sf));
  const minSF = sfs.length ? Math.min(...sfs) : Infinity;

  document.getElementById('adv-weight').textContent   = `${totalWeight.toFixed(0)} kg`;
  document.getElementById('adv-sf').textContent       = isFinite(minSF) ? minSF.toFixed(2) : '∞';
  document.getElementById('adv-sf').style.color       = minSF < 1.5 ? '#f97316' : minSF < 2 ? '#ca8a04' : '#16a34a';
  document.getElementById('adv-max-tens').textContent = `${maxTens.toFixed(1)} kN`;
  document.getElementById('adv-max-comp').textContent = `${maxComp.toFixed(1)} kN`;

  let verdict = '';
  if (!isFinite(minSF) || minSF < 1) {
    verdict = `<div class="feedback error">❌ 結構不穩定或 SF < 1，請加桿件或支承。</div>`;
  } else if (minSF < 2) {
    verdict = `<div class="feedback warn">⚠ SF=${minSF.toFixed(2)} < 2.0，未達安全標準。</div>`;
  } else {
    verdict = `<div class="feedback success">✅ SF=${minSF.toFixed(2)} ≥ 2.0，結構安全！重量 ${totalWeight.toFixed(0)}kg</div>`;
  }
  document.getElementById('adv-verdict').innerHTML = verdict;
  redrawAdv();
}

// 初始繪製
redrawAdv();
