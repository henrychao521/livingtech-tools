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
  });
});

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

advCanvas.addEventListener('mousedown', e => {
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
    if (nd) { moveNode = nd; isDragging = true; }
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

advCanvas.addEventListener('mousemove', e => {
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

advCanvas.addEventListener('mouseup', () => { isDragging = false; moveNode = null; updateAdvStats(); });

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
