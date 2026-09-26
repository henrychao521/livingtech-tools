// 結構模擬器 模組 4：桁架受力模擬器
const PK = 'struct_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cv = document.getElementById('struct-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);
const els = {
  span: $('s-span'), height: $('s-height'), load: $('s-load'), pos: $('s-pos'),
  vSpan: $('v-span'), vHeight: $('v-height'), vLoad: $('v-load'), vPos: $('v-pos'),
  eTens: $('e-tens'), eComp: $('e-comp'), eReact: $('e-react'), eDefl: $('e-defl'),
  verdict: $('verdict'), start: $('btn-load'), reset: $('btn-reset'),
};

let trussType = 'pratt';
let loaded = false;
let animProgress = 0;

function generateTruss(type, span, height, panels = 6) {
  // Warren 用奇數節間（5 格），上弦才有正中央的節點可以放置中荷重，桿件數也最少
  if (type === 'warren') panels = 5;
  const cx = W / 2, cy = 350;
  const halfSpan = span / 2;
  const panelW = span / panels;
  const nodes = [];
  // 下弦節點（索引 0 ～ panels；0 為鉸支承、panels 為滾支承）
  for (let i = 0; i <= panels; i++) nodes.push({ x: cx - halfSpan + i * panelW, y: cy, fixed: i === 0 || i === panels });
  const members = [];
  // 下弦
  for (let i = 0; i < panels; i++) members.push({ a: i, b: i + 1, type: 'bot' });

  if (type === 'warren') {
    // Warren：上弦節點在每個節間的正中央，沒有豎桿，斜桿「/ \ / \」交替
    for (let i = 0; i < panels; i++) nodes.push({ x: cx - halfSpan + (i + 0.5) * panelW, y: cy - height });
    const T = i => panels + 1 + i; // 第 i 個上弦節點
    for (let i = 0; i < panels - 1; i++) members.push({ a: T(i), b: T(i + 1), type: 'top' });
    for (let i = 0; i < panels; i++) {
      members.push({ a: i, b: T(i), type: i === 0 ? 'end' : 'diag' });                 // 往右上
      members.push({ a: T(i), b: i + 1, type: i === panels - 1 ? 'end' : 'diag' });     // 往右下
    }
    return { nodes, members };
  }

  // Pratt／Howe：上弦節點在下弦節點正上方（索引 panels+1 起）
  for (let i = 1; i < panels; i++) nodes.push({ x: cx - halfSpan + i * panelW, y: cy - height });
  const T = i => panels + i; // 在下弦節點 i 正上方的上弦節點
  // 上弦
  for (let i = 1; i < panels - 1; i++) members.push({ a: T(i), b: T(i + 1), type: 'top' });
  // 端斜桿（從支承斜上到上弦，對稱荷重下受壓）
  members.push({ a: 0, b: T(1), type: 'end' });
  members.push({ a: panels, b: T(panels - 1), type: 'end' });
  // 豎桿
  for (let i = 1; i < panels; i++) members.push({ a: i, b: T(i), type: 'vert' });
  // 斜桿
  const mid = panels / 2;
  for (let i = 1; i < panels; i++) {
    if (type === 'pratt') {
      // Pratt：斜桿由上弦往跨中向下傾「\ \ / /」→ 斜桿受張、豎桿受壓
      if (i < mid) members.push({ a: T(i), b: i + 1, type: 'diag' });
      else if (i > mid) members.push({ a: T(i), b: i - 1, type: 'diag' });
    } else {
      // Howe：斜桿由下弦往跨中向上升「/ / \ \」→ 斜桿受壓、豎桿受張
      if (i < mid) members.push({ a: i, b: T(i + 1), type: 'diag' });
      else if (i > mid) members.push({ a: i, b: T(i - 1), type: 'diag' });
    }
  }
  return { nodes, members };
}

// 節點法求解：每個節點 ΣFx = 0、ΣFy = 0，連同 3 個支承反力
// （左端鉸支承 Rx、Ry，右端滾支承 Ry）組成線性方程組，用高斯消去求出每根桿的軸力。
// 回傳 { forces, reactions, rank }；forces[i] 以「張力為正」表示。
function solveTruss(nodes, members, loads) {
  const n = nodes.length, m = members.length;
  const last = nodes.reduce((k, nd, i) => (nd.fixed ? i : k), 0);
  const cols = m + 3;
  const A = Array.from({ length: 2 * n }, () => new Array(cols + 1).fill(0));
  members.forEach((mb, j) => {
    const p = nodes[mb.a], q = nodes[mb.b];
    const L = Math.hypot(q.x - p.x, q.y - p.y);
    const ux = (q.x - p.x) / L, uy = (q.y - p.y) / L;
    // 張力把節點拉向桿件另一端
    A[2 * mb.a][j] += ux; A[2 * mb.a + 1][j] += uy;
    A[2 * mb.b][j] -= ux; A[2 * mb.b + 1][j] -= uy;
  });
  // 支承反力（畫布座標 y 向下，反力向上 = −y）
  A[0][m] = 1;             // 左支承 Rx
  A[1][m + 1] = -1;        // 左支承 Ry（向上為正）
  A[2 * last + 1][m + 2] = -1; // 右支承 Ry（向上為正）
  // 外力移到右側：Σ(桿力) + 反力 + 外力 = 0
  loads.forEach(ld => { A[2 * ld.node][cols] -= ld.fx || 0; A[2 * ld.node + 1][cols] -= ld.fy || 0; });
  // 高斯消去（部分樞軸）
  let rank = 0;
  const pivCol = [];
  for (let c = 0; c < cols && rank < A.length; c++) {
    let best = rank;
    for (let r = rank + 1; r < A.length; r++) if (Math.abs(A[r][c]) > Math.abs(A[best][c])) best = r;
    if (Math.abs(A[best][c]) < 1e-9) continue;
    [A[rank], A[best]] = [A[best], A[rank]];
    for (let r = 0; r < A.length; r++) {
      if (r === rank) continue;
      const f = A[r][c] / A[rank][c];
      if (f) for (let k = c; k <= cols; k++) A[r][k] -= f * A[rank][k];
    }
    pivCol.push(c);
    rank++;
  }
  const x = new Array(cols).fill(0);
  pivCol.forEach((c, r) => { x[c] = A[r][cols] / A[r][c]; });
  return { forces: x.slice(0, m), reactions: { lx: x[m], ly: x[m + 1], ry: x[m + 2] }, rank, needed: 2 * n };
}

function analyzeForces(truss, loadN, loadPosPercent) {
  const { nodes, members } = truss;
  const last = nodes.reduce((k, nd, i) => (nd.fixed ? i : k), 0);
  const span = nodes[last].x - nodes[0].x;
  // 荷重放在最接近拉桿位置的上弦節點
  const loadX = nodes[0].x + span * (loadPosPercent / 100);
  let loadNode = last + 1;
  let minD = Infinity;
  nodes.forEach((n, i) => { if (i > last && Math.abs(n.x - loadX) < minD) { minD = Math.abs(n.x - loadX); loadNode = i; } });
  // 以節點法實際求解（畫布 y 向下，所以向下的荷重是 +y）
  const sol = solveTruss(nodes, members, [{ node: loadNode, fy: loadN }]);
  return members.map((m, i) => {
    const n1 = nodes[m.a], n2 = nodes[m.b];
    const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
    // 畫面慣例：force < 0 = 張力（紅）、force > 0 = 壓力（藍）
    const t = sol.forces[i];
    const force = Math.abs(t) < 1e-6 ? 0 : -t;
    return { ...m, force, len };
  });
}

function draw() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  // 地面
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 400, W, H);

  const span = parseInt(els.span.value);
  const height = parseInt(els.height.value);
  const loadN = parseInt(els.load.value);
  const loadPos = parseInt(els.pos.value);
  const truss = generateTruss(trussType, span, height);
  let forces = [];

  // 桁架繪製
  if (loaded) {
    forces = analyzeForces(truss, loadN, loadPos);
    // 變形（簡化視覺：下弦中央下沉）
    const defl = loadN / 20 * animProgress;
    const right = truss.nodes.reduce((k, nd, i) => (nd.fixed ? i : k), 0);
    const cx0 = (truss.nodes[0].x + truss.nodes[right].x) / 2, half0 = (truss.nodes[right].x - truss.nodes[0].x) / 2;
    truss.nodes.forEach(n => {
      if (n.fixed) return;
      const distFromCenter = Math.abs(n.x - cx0) / half0;
      n.y += defl * (1 - distFromCenter) * 0.4;
    });
  }

  // 畫桿件
  truss.members.forEach((m, i) => {
    const n1 = truss.nodes[m.a], n2 = truss.nodes[m.b];
    if (!n1 || !n2) return;
    let stroke = '#9ca3af';
    let strokeW = 3;
    if (loaded && forces[i]) {
      const f = forces[i].force;
      strokeW = 2 + Math.min(6, Math.abs(f) / 50);
      stroke = f < 0 ? '#dc2626' : '#1E40AF'; // 負=張力（紅）正=壓力（藍）
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeW;
    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();
  });

  // 畫節點
  truss.nodes.forEach((n, i) => {
    ctx.fillStyle = n.fixed ? '#fbbf24' : '#DBEAFE';
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.fixed ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // 支承
  truss.nodes.filter(n => n.fixed).forEach(n => {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(n.x - 12, n.y + 14);
    ctx.lineTo(n.x + 12, n.y + 14);
    ctx.lineTo(n.x, n.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(n.x - 12 + i * 6, n.y + 16);
      ctx.lineTo(n.x - 8 + i * 6, n.y + 22);
      ctx.stroke();
    }
  });

  // 荷重箭頭
  if (loaded) {
    const right = truss.nodes.reduce((k, nd, i) => (nd.fixed ? i : k), 0);
    const span0 = truss.nodes[right].x - truss.nodes[0].x;
    const loadX = truss.nodes[0].x + span0 * (loadPos / 100);
    const topNodes = truss.nodes.slice(right + 1);
    let loadY = truss.nodes[0].y - height;
    if (topNodes.length) loadY = topNodes[0].y;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(loadX, loadY - 60);
    ctx.lineTo(loadX, loadY - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(loadX, loadY - 4);
    ctx.lineTo(loadX - 8, loadY - 14);
    ctx.lineTo(loadX + 8, loadY - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.font = '700 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${loadN}N`, loadX, loadY - 70);
  }

  // 圖例
  ctx.fillStyle = '#A78BFA';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('— 張力', 16, 30);
  ctx.fillStyle = '#1E40AF';
  ctx.fillText('— 壓力', 16, 50);
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('— 未受力', 16, 70);

  return forces;
}

function updateEstimates(forces) {
  if (!forces || forces.length === 0) return;
  const tens = forces.filter(f => f.force < 0).map(f => -f.force);
  const comp = forces.filter(f => f.force > 0).map(f => f.force);
  const loadN = parseInt(els.load.value);
  els.eTens.textContent = tens.length ? Math.max(...tens).toFixed(1) + ' N' : '0 N';
  els.eComp.textContent = comp.length ? Math.max(...comp).toFixed(1) + ' N' : '0 N';
  els.eReact.textContent = (loadN / 2).toFixed(1) + ' N × 2';
  els.eDefl.textContent = (loadN / 20).toFixed(1) + ' px';
}

function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  if (loaded && animProgress < 1) animProgress = Math.min(1, animProgress + 0.02);
  const forces = draw();
  if (loaded) updateEstimates(forces);
  requestAnimationFrame(loop);
}

function updateVals() {
  els.vSpan.textContent = els.span.value + ' px';
  els.vHeight.textContent = els.height.value + ' px';
  els.vLoad.textContent = els.load.value + ' N';
  els.vPos.textContent = els.pos.value === '50' ? '中央' : (els.pos.value < 50 ? `左側 ${els.pos.value}%` : `右側 ${els.pos.value}%`);
}
['span', 'height', 'load', 'pos'].forEach(k => els[k].addEventListener('input', () => { updateVals(); animProgress = 0; }));
document.querySelectorAll('.truss-preset').forEach(p => p.addEventListener('click', () => {
  document.querySelectorAll('.truss-preset').forEach(x => x.classList.remove('active'));
  p.classList.add('active');
  trussType = p.dataset.type;
  animProgress = 0;
}));

els.start.addEventListener('click', () => {
  loaded = true;
  animProgress = 0;
  els.verdict.className = 'verdict good';
  els.verdict.textContent = `✓ 已施加 ${els.load.value}N 荷重。觀察紅色=張力、藍色=壓力。`;
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  const p = loadP(); p.module4 = true; saveP(p);
});
els.reset.addEventListener('click', () => {
  loaded = false;
  animProgress = 0;
  els.verdict.className = 'verdict warn';
  els.verdict.textContent = '點「施加荷重」看結果';
});

updateVals();
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});