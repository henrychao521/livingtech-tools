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
  const cx = W / 2, cy = 350;
  const halfSpan = span / 2;
  const panelW = span / panels;
  const nodes = [];
  // 下弦節點
  for (let i = 0; i <= panels; i++) nodes.push({ x: cx - halfSpan + i * panelW, y: cy, fixed: i === 0 || i === panels });
  // 上弦節點
  for (let i = 1; i < panels; i++) nodes.push({ x: cx - halfSpan + i * panelW, y: cy - height });
  const members = [];
  // 下弦
  for (let i = 0; i < panels; i++) members.push({ a: i, b: i + 1, type: 'bot' });
  // 上弦
  for (let i = 0; i < panels - 2; i++) members.push({ a: panels + 1 + i, b: panels + 2 + i, type: 'top' });
  // 端斜桿
  members.push({ a: 0, b: panels + 1, type: 'end' });
  members.push({ a: panels, b: panels * 2 - 1, type: 'end' });
  // 豎桿與斜桿（依 type 改變）
  for (let i = 1; i < panels; i++) {
    members.push({ a: i, b: panels + i, type: 'vert' });
  }
  if (type === 'pratt') {
    for (let i = 1; i < panels; i++) {
      const isLeft = i < panels / 2;
      const top = panels + i;
      if (isLeft) members.push({ a: i, b: top + 1, type: 'diag' });
      else if (i > panels / 2) members.push({ a: i, b: top - 1, type: 'diag' });
    }
  } else if (type === 'howe') {
    for (let i = 1; i < panels; i++) {
      const isLeft = i < panels / 2;
      const top = panels + i;
      if (isLeft) members.push({ a: i + 1, b: top, type: 'diag' });
      else if (i > panels / 2) members.push({ a: i - 1, b: top, type: 'diag' });
    }
  } else if (type === 'warren') {
    for (let i = 1; i < panels; i++) {
      const top = panels + i;
      if (i % 2 === 1) members.push({ a: i, b: top - 1 < panels + 1 ? 0 : top - 1, type: 'diag' });
      else members.push({ a: i, b: top + 1 >= panels * 2 ? panels : top + 1, type: 'diag' });
    }
  }
  return { nodes, members };
}

function analyzeForces(truss, loadN, loadPosPercent) {
  const { nodes, members } = truss;
  const span = nodes[6].x - nodes[0].x;
  // 簡化：假設荷重集中於頂弦中央或可移動位置
  const loadX = nodes[0].x + span * (loadPosPercent / 100);
  // 找最接近 loadX 的上弦節點
  const topNodes = nodes.slice(7);
  let loadNode = 0;
  let minD = Infinity;
  topNodes.forEach((n, i) => { if (Math.abs(n.x - loadX) < minD) { minD = Math.abs(n.x - loadX); loadNode = i + 7; } });
  // 支承反力（簡化：對中點對稱時左右各分一半）
  const a = (nodes[loadNode].x - nodes[0].x) / span;
  const reactL = loadN * (1 - a);
  const reactR = loadN * a;
  // 簡化每根桿的力（教學用近似值）
  return members.map((m, i) => {
    const n1 = nodes[m.a], n2 = nodes[m.b];
    const dx = n2.x - n1.x, dy = n2.y - n1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    let force = 0;
    // 簡化分配：依桿類型估算
    if (m.type === 'bot') force = -loadN * span / (4 * (nodes[7].y - nodes[0].y) * -1); // 下弦張力
    else if (m.type === 'top') force = loadN * span / (4 * (nodes[0].y - nodes[7].y)); // 上弦壓力
    else if (m.type === 'end') force = -loadN * 0.7; // 端斜桿張力
    else if (m.type === 'vert') force = loadN * 0.3 * (trussType === 'pratt' ? -1 : 1);
    else if (m.type === 'diag') force = loadN * 0.5 * (trussType === 'pratt' ? 1 : -1);
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
    truss.nodes.forEach((n, i) => {
      if (!n.fixed && i <= 6) {
        const distFromCenter = Math.abs(i - 3) / 3;
        n.y += defl * (1 - distFromCenter) * 0.4;
      } else if (i > 6) {
        const idx = i - 7;
        const distFromCenter = Math.abs(idx - 2) / 2;
        n.y += defl * (1 - distFromCenter) * 0.4;
      }
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
    const span0 = truss.nodes[6].x - truss.nodes[0].x;
    const loadX = truss.nodes[0].x + span0 * (loadPos / 100);
    const topNodes = truss.nodes.slice(7);
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
