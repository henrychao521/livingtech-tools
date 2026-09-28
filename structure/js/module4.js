// 橋樑工程師實驗室 模組 4：負載情境挑戰
const PK = 'structure_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

/* ── 6 道情境定義 ──────────────────────────────────────── */
const SCENARIOS = [
  {
    id: 's1', icon: '🚶', name: '行人天橋',
    desc: '市區人行陸橋，跨越交流道，跨度 12m。假設均布行人荷重換算為每節點 3kN（共 5 個內節點），採 Pratt 桁架。目標 SF ≥ 2.0。',
    bridgeType: 'pratt', span: 12, height: 2.5, loadPerNode: 3000, special: null,
    tip: '行人荷重：3 kPa × 1m 橋寬 × 節點間距 2m = 6kN/節點；橋面由左右兩片桁架共同支撐、各分擔一半，所以模擬的這一片桁架每個下弦節點承受 3kN。',
  },
  {
    id: 's2', icon: '🚛', name: '公路橋（卡車）',
    desc: '省道公路橋，跨度 16m，必須承受單台 200kN 重卡（移動荷重）。最不利位置：卡車在跨中。目標 SF ≥ 2.0。',
    bridgeType: 'howe', span: 16, height: 4, loadPerNode: 200000, special: 'truck', // 整台 200kN 集中在跨中節點
    tip: '移動荷重：卡車在跨中時，下弦桿中央受最大拉力。Howe 桁架的豎桿受拉、斜桿受壓。',
  },
  {
    id: 's3', icon: '🌀', name: '颱風橋',
    desc: '沿海公路橋，跨度 12m，除了自重與活載，颱風期間額外受水平風力（每節點 8kN）。目標 SF ≥ 2.0（荷重組合最不利）。',
    bridgeType: 'warren', span: 12, height: 3.5, loadPerNode: 50000, special: 'wind',
    tip: '風力為水平荷重（fx），與垂直重力疊加。Warren 桁架沒有豎桿，風力讓端斜桿受力複雜。',
  },
  {
    id: 's4', icon: '🌍', name: '地震橋',
    desc: '以水平地震係數 0.2g 簡化估算（實際係數依規範與橋址而定），橋樑慣性力 = 0.2 × 重量。跨度 10m，Warren 桁架，每節點垂直荷重 40kN，水平慣性力 = 0.2 × 40kN = 8kN。目標 SF ≥ 2.5。',
    bridgeType: 'warren', span: 10, height: 3, loadPerNode: 40000, special: 'earthquake',
    tip: '台灣位於板塊交界，橋樑須考慮 PGA=0.2g 的水平慣性力，垂直與水平荷重組合設計。',
  },
  {
    id: 's5', icon: '🚂', name: '鐵路橋',
    desc: '單線鐵路桁架橋，跨度 20m。機車 4 個軸重各 120kN（簡化假設），動態放大係數 1.3，有效荷重 = 120×1.3 = 156kN/軸；橋面由左右兩片桁架共同支撐，模擬的這一片每軸分擔 78kN。目標 SF ≥ 2.5。',
    // 每片桁架分擔一半軸重（同行人天橋 s1 的做法）；156kN 全壓在單片時鋼材 SF 只有約 2.67，最多一星
    bridgeType: 'pratt', span: 20, height: 5, loadPerNode: 156000 / 2, special: 'train',
    tip: '鐵路橋的衝擊荷重（Impact factor）將靜態軸重放大 1.3 倍；列車又重又集中，只有強度高的材料才撐得住足夠的安全餘裕。',
  },
  {
    id: 's6', icon: '🏆', name: '輕量設計競賽',
    desc: '目標：設計能承受 50kN 的 10m 跨度 Pratt 桁架，但材料重量要盡可能輕！SF ≥ 2.0 為通過，SF ≥ 3 且橋重 ≤ 120kg 為三星。',
    bridgeType: 'pratt', span: 10, height: 2.5, loadPerNode: 50000/5, special: 'lightweight',
    tip: '輕量設計：比較三種材料的橋重與 SF——密度越低越輕（木材 600、竹子 700、鋼 7850 kg/m³），但強度也不同，要在 SF ≥ 3 的前提下找最輕的。',
  },
];

// 輕量競賽三星的重量上限（kg）：可選材料中，SF ≥ 3 且最輕的是木材（約 113kg），竹子約 132kg、鋼約 1482kg
const LIGHTWEIGHT_MAX_KG = 120;

/* ── 初始化 ──────────────────────────────────────────────── */
const pp = loadP();
const starsMap = pp.module4_stars || {};
let currentSC = null;

const totalEl = document.getElementById('total-stars-display');
function updateTotalStars() {
  const total = Object.values(starsMap).reduce((s, v) => s + v, 0);
  totalEl.textContent = `⭐ × ${total} / 18`;
}
updateTotalStars();

// 建立情境卡片
const grid = document.getElementById('scenario-grid');
SCENARIOS.forEach(sc => {
  const stars = starsMap[sc.id] || 0;
  const card = document.createElement('div');
  card.className = 'scenario-card' + (stars > 0 ? ' solved' : '');
  card.innerHTML = `
    <div class="sc-icon">${sc.icon}</div>
    <h4>${sc.name}</h4>
    <p>${sc.desc.substring(0,60)}…</p>
    <div class="stars-row">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
  `;
  card.addEventListener('click', () => openScenario(sc));
  grid.appendChild(card);
});

function openScenario(sc) {
  currentSC = sc;
  document.getElementById('scenario-detail').style.display = '';
  document.getElementById('sc-title').textContent = `${sc.icon} ${sc.name}`;
  document.getElementById('sc-desc').innerHTML = `${sc.desc}<br><br><strong style="color:var(--primary-dark)">💡 工程知識：</strong>${sc.tip}`;
  document.getElementById('sc-results').innerHTML = '<span style="color:var(--text-muted);font-size:13px">點擊「計算 FEM」</span>';
  document.getElementById('sc-verdict').innerHTML = '';
  document.getElementById('sc-star-display').textContent = '';
  const scCtx = document.getElementById('sc-canvas').getContext('2d');
  scCtx.clearRect(0, 0, 580, 320);

  // 滾動到詳情
  document.getElementById('scenario-detail').scrollIntoView({ behavior:'smooth', block:'start' });
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
}

/* ── FEM 求解 ──────────────────────────────────────────── */
document.getElementById('sc-solve-btn').addEventListener('click', solveScenario);

function solveScenario() {
  if (!currentSC) return;
  const sc = currentSC;
  const material = document.getElementById('sc-material').value;
  const mat = MATERIALS[material];

  // 生成橋樑
  const truss = generateBridge(sc.bridgeType, sc.span, sc.height, material);

  // 修改荷重（依情境）
  const panels = truss.nodes.filter(n => n.id.startsWith('L')).length - 1;
  truss.loads = [];

  if (sc.special === 'wind' || sc.special === 'earthquake') {
    // 水平 + 垂直組合荷重；地震水平慣性力 = 0.2g × 垂直荷重
    const WIND_FX = sc.special === 'wind' ? 8000 : 0.2 * sc.loadPerNode; // N/節點
    for (let i = 1; i < panels; i++) {
      truss.loads.push({ nodeId: `L${i}`, fx: WIND_FX, fy: -sc.loadPerNode });
    }
  } else if (sc.special === 'truck') {
    // 單台卡車停在跨中（最不利位置）：整台重量集中在中央節點
    truss.loads.push({ nodeId: `L${Math.round(panels / 2)}`, fx: 0, fy: -sc.loadPerNode });
  } else if (sc.special === 'train') {
    // 4 個軸重在跨中附近節點
    const axes = [1, 2, panels-2, panels-1].filter(i => i >= 1 && i < panels);
    axes.forEach(i => truss.loads.push({ nodeId: `L${i}`, fx: 0, fy: -sc.loadPerNode }));
  } else {
    // 均布荷重
    for (let i = 1; i < panels; i++) {
      truss.loads.push({ nodeId: `L${i}`, fx: 0, fy: -sc.loadPerNode });
    }
  }

  const solver = new TrussSolver(truss);
  const result = solver.solve();

  const scCanvas = document.getElementById('sc-canvas');
  const scCtx = scCanvas.getContext('2d');

  if (!result.ok) {
    document.getElementById('sc-results').innerHTML = `<div class="feedback error">⚠ ${result.error}</div>`;
    return;
  }

  drawTruss(scCtx, scCanvas.width, scCanvas.height, truss, result, null);

  // 計算指標
  const forces = Object.values(result.memberForces);
  const maxTens = Math.max(...forces.filter(f => f > 0), 0) / 1000;
  const maxComp = Math.abs(Math.min(...forces.filter(f => f < 0), 0)) / 1000;
  const sfs = Object.values(result.safetyFactors).filter(sf => isFinite(sf));
  const minSF = sfs.length ? Math.min(...sfs) : Infinity;
  const totalWeight = truss.members.reduce((sum, m) => {
    const ni = truss.nodes.find(n => n.id === m.n1Id);
    const nj = truss.nodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) return sum;
    const L = Math.sqrt((nj.x-ni.x)**2+(nj.y-ni.y)**2);
    return sum + L * DEFAULT_AREA * mat.density;
  }, 0);

  document.getElementById('sc-results').innerHTML = `
    <div class="fem-stat"><span class="label">最大張力</span><span class="value tension">${maxTens.toFixed(1)} kN</span></div>
    <div class="fem-stat"><span class="label">最大壓力</span><span class="value compression">${maxComp.toFixed(1)} kN</span></div>
    <div class="fem-stat"><span class="label">最小 SF</span><span class="value" style="color:${minSF<2?'#dc2626':minSF<2.5?'#ca8a04':'#16a34a'}">${isFinite(minSF)?minSF.toFixed(2):'∞'}</span></div>
    <div class="fem-stat"><span class="label">橋重</span><span class="value">${totalWeight.toFixed(0)} kg</span></div>
    <div class="fem-stat"><span class="label">材料</span><span class="value">${mat.name}</span></div>
  `;

  // 評星
  let stars = 0;
  const sfThreshold = sc.special === 'earthquake' || sc.special === 'train' ? 2.5 : 2.0;
  // 星級以通過門檻為基準往上加：二星 +0.5、三星 +1.0（地震、鐵路門檻 2.5，否則一過關就是二星）
  const sf2 = sfThreshold + 0.5, sf3 = sfThreshold + 1.0;
  if (minSF >= sfThreshold) stars = 1;
  if (minSF >= sf2) stars = 2;
  // 三星另需 SF ≥ sf3；輕量競賽另外要求橋重 ≤ LIGHTWEIGHT_MAX_KG
  const isLight = sc.special === 'lightweight';
  if (minSF >= sf3 && (!isLight || totalWeight <= LIGHTWEIGHT_MAX_KG)) stars = 3;

  let verdictHtml = '';
  if (stars === 0) {
    verdictHtml = `<div class="feedback error">❌ SF=${isFinite(minSF)?minSF.toFixed(2):'∞'} < ${sfThreshold}，未通過。嘗試換鋼材或增大桁高。</div>`;
  } else if (stars === 1) {
    verdictHtml = `<div class="feedback success">⭐ 通過！SF=${minSF.toFixed(2)} ≥ ${sfThreshold}。</div>`;
  } else if (stars === 2) {
    const heavyNote = isLight && minSF >= sf3 ? `但橋重 ${totalWeight.toFixed(0)}kg 超過 ${LIGHTWEIGHT_MAX_KG}kg，換更輕的材料試試。` : '';
    verdictHtml = `<div class="feedback success">⭐⭐ 優秀！SF=${minSF.toFixed(2)} ≥ ${sf2.toFixed(1)}。${heavyNote}</div>`;
  } else {
    verdictHtml = isLight
      ? `<div class="feedback success">⭐⭐⭐ 完美！SF=${minSF.toFixed(2)} ≥ ${sf3.toFixed(1)}、橋重 ${totalWeight.toFixed(0)}kg，輕量設計！</div>`
      : `<div class="feedback success">⭐⭐⭐ 完美！SF=${minSF.toFixed(2)} ≥ ${sf3.toFixed(1)}。</div>`;
  }
  document.getElementById('sc-verdict').innerHTML = verdictHtml;
  document.getElementById('sc-star-display').textContent = '⭐'.repeat(stars) + '☆'.repeat(3-stars);

  // 儲存最高星級
  if (!starsMap[sc.id] || stars > starsMap[sc.id]) {
    starsMap[sc.id] = stars;
    // 教師後台與首頁讀的是 module4_levels，存成 module4_stars 會讓星數完全不顯示
    const p = loadP(); p.module4_levels = starsMap; p.module4_stars = starsMap; saveP(p);
    updateTotalStars();
    // 更新卡片
    const cards = document.querySelectorAll('.scenario-card');
    const idx = SCENARIOS.findIndex(s => s.id === sc.id);
    if (cards[idx]) {
      cards[idx].querySelector('.stars-row').innerHTML = '⭐'.repeat(stars)+'☆'.repeat(3-stars);
      if (stars > 0) cards[idx].classList.add('solved');
    }
    if (typeof SoundFX !== 'undefined') (stars === 3 ? SoundFX.win : SoundFX.success)();
  }

  // M4 通過條件：至少 6 個情境全部至少 1 星
  const solved = SCENARIOS.filter(s => (starsMap[s.id]||0) >= 1).length;
  if (solved >= 6) {
    const pp2 = loadP(); pp2.module4 = true; saveP(pp2);
    showToast('🏆 6 道情境全部通關！', 'good');
  }
}
