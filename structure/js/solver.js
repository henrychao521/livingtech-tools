/**
 * solver.js — 直接剛度法（Direct Stiffness Method）2D 桁架求解器
 * 教育用途：純原生 JS，無外部依賴，節點數 ≤ 30，< 1ms 求解
 *
 * 公開介面：
 *   const solver = new TrussSolver({ nodes, members, loads, supports });
 *   const result = solver.solve();
 *
 * nodes:    [{ id, x, y }]                          座標單位：m
 * members:  [{ id, n1Id, n2Id, E, A, yieldStress }] E in Pa, A in m², yieldStress in Pa
 * loads:    [{ nodeId, fx, fy }]                     力單位：N（向下為負）
 * supports: [{ nodeId, fixX, fixY }]                 true = 固定該方向自由度
 *
 * returns:
 *   { ok, displacements, memberForces, reactions, safetyFactors, error }
 *   memberForces[id]    = N  (正 = 張力, 負 = 壓力)
 *   safetyFactors[id]   = yieldStress * A / |force|  (>2 安全, <1 失效)
 *   displacements[dof]  = m  (全域自由度向量)
 */

class TrussSolver {
  constructor({ nodes, members, loads, supports }) {
    this.nodes    = nodes;
    this.members  = members;
    this.loads    = loads;
    this.supports = supports;
  }

  solve() {
    const { nodes, members, loads, supports } = this;
    const n = nodes.length;
    const DOF = 2 * n; // 每節點 2 個自由度 (x, y)

    // 建立節點 id → index 映射
    const nodeIdx = {};
    nodes.forEach((nd, i) => { nodeIdx[nd.id] = i; });

    // 1. 組裝全域剛度矩陣 K (DOF × DOF)
    const K = Array.from({ length: DOF }, () => new Array(DOF).fill(0));

    const memberData = {};
    for (const m of members) {
      const i = nodeIdx[m.n1Id];
      const j = nodeIdx[m.n2Id];
      const ni = nodes[i], nj = nodes[j];
      const dx = nj.x - ni.x, dy = nj.y - ni.y;
      const L = Math.sqrt(dx * dx + dy * dy);
      if (L < 1e-10) continue;
      const c = dx / L, s = dy / L;
      const EA_L = (m.E * m.A) / L;

      // 局部剛度貢獻 (4×4 → 散布至全域)
      const cc = c * c, ss = s * s, cs = c * s;
      const ke = [
        [ cc,  cs, -cc, -cs],
        [ cs,  ss, -cs, -ss],
        [-cc, -cs,  cc,  cs],
        [-cs, -ss,  cs,  ss],
      ];
      const dofs = [2*i, 2*i+1, 2*j, 2*j+1];
      for (let r = 0; r < 4; r++) {
        for (let col = 0; col < 4; col++) {
          K[dofs[r]][dofs[col]] += EA_L * ke[r][col];
        }
      }
      memberData[m.id] = { i, j, L, c, s, EA_L, E: m.E, A: m.A, yieldStress: m.yieldStress || 250e6 };
    }

    // 2. 組裝載重向量 F
    const F = new Array(DOF).fill(0);
    for (const ld of loads) {
      const i = nodeIdx[ld.nodeId];
      if (i === undefined) continue;
      F[2*i]   += ld.fx || 0;
      F[2*i+1] += ld.fy || 0;
    }

    // 3. 套用支承條件（消去固定自由度）
    const fixedDOFs = new Set();
    for (const sp of supports) {
      const i = nodeIdx[sp.nodeId];
      if (i === undefined) continue;
      if (sp.fixX) fixedDOFs.add(2*i);
      if (sp.fixY) fixedDOFs.add(2*i+1);
    }

    // 縮減矩陣（移除固定 DOF）
    const freeDOFs = [];
    for (let d = 0; d < DOF; d++) { if (!fixedDOFs.has(d)) freeDOFs.push(d); }
    const nr = freeDOFs.length;
    const Kr = freeDOFs.map(r => freeDOFs.map(c => K[r][c]));
    const Fr = freeDOFs.map(r => F[r]);

    // 4. Gauss 消去法求解 Kr * dr = Fr
    const aug = Kr.map((row, i) => [...row, Fr[i]]);
    for (let col = 0; col < nr; col++) {
      // 主元素選取（部分主元）
      let maxRow = col;
      for (let row = col + 1; row < nr; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      }
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      const pivot = aug[col][col];
      if (Math.abs(pivot) < 1e-14) {
        return { ok: false, error: '剛度矩陣奇異（結構不穩定或缺少支承）' };
      }
      for (let row = col + 1; row < nr; row++) {
        const factor = aug[row][col] / pivot;
        for (let c2 = col; c2 <= nr; c2++) {
          aug[row][c2] -= factor * aug[col][c2];
        }
      }
    }
    // 回代
    const dr = new Array(nr).fill(0);
    for (let row = nr - 1; row >= 0; row--) {
      let sum = aug[row][nr];
      for (let c2 = row + 1; c2 < nr; c2++) sum -= aug[row][c2] * dr[c2];
      dr[row] = sum / aug[row][row];
    }

    // 5. 全域位移向量
    const d = new Array(DOF).fill(0);
    freeDOFs.forEach((dof, k) => { d[dof] = dr[k]; });

    // 6. 計算桿件軸力與安全係數
    const memberForces = {};
    const safetyFactors = {};
    for (const m of members) {
      const { i, j, L, c, s, EA_L, A, yieldStress } = memberData[m.id] || {};
      if (!memberData[m.id]) continue;
      const u1 = d[2*i], v1 = d[2*i+1], u2 = d[2*j], v2 = d[2*j+1];
      // 軸向延伸量 = (u2-u1)*c + (v2-v1)*s
      const deltaL = (u2 - u1) * c + (v2 - v1) * s;
      const force = EA_L * L * deltaL / L; // = EA/L * deltaL
      // 等同 force = EA_L * deltaL（EA_L = EA/L，deltaL 為相對位移投影）
      const axialForce = EA_L * ((u2 - u1) * c + (v2 - v1) * s);
      memberForces[m.id] = axialForce;
      const stress = Math.abs(axialForce) / A;
      safetyFactors[m.id] = stress > 1e-6 ? yieldStress / stress : Infinity;
    }

    // 7. 計算支承反力
    const reactions = {};
    for (const sp of supports) {
      const i = nodeIdx[sp.nodeId];
      if (i === undefined) continue;
      let Rx = 0, Ry = 0;
      for (let c2 = 0; c2 < DOF; c2++) {
        Rx += K[2*i][c2] * d[c2];
        Ry += K[2*i+1][c2] * d[c2];
      }
      reactions[sp.nodeId] = { Rx: Rx - (F[2*i] || 0), Ry: Ry - (F[2*i+1] || 0) };
    }

    return { ok: true, displacements: d, memberForces, reactions, safetyFactors };
  }
}

// 材料常數資料庫（供 module3/4 使用）
const MATERIALS = {
  steel:    { name: '鋼', E: 200e9, yieldStress: 250e6, density: 7850, color: '#94a3b8' },
  wood:     { name: '木材', E: 12e9,  yieldStress: 30e6,  density: 600,  color: '#a16207' },
  bamboo:   { name: '竹子', E: 17e9,  yieldStress: 80e6,  density: 700,  color: '#65a30d' },
  concrete: { name: '混凝土', E: 30e9, yieldStress: 25e6, density: 2400, color: '#78716c' },
};

// 斷面積預設值（教學用）
const DEFAULT_AREA = 0.004; // 0.004 m² ≈ 64mm × 64mm

/**
 * 顏色對應：
 *   力 > threshold → 張力（藍）
 *   力 < -threshold → 壓力（紅）
 *   其他 → 零力（灰）
 */
function memberColor(force, sf) {
  if (sf !== undefined && sf < 1.5) return '#f97316'; // 危險（橘）
  if (Math.abs(force) < 1) return '#94a3b8';          // 零力
  return force > 0 ? '#2563eb' : '#dc2626';            // 張力藍 / 壓力紅
}

/**
 * 從節點座標自動生成 5 種預設橋型
 * @param {string} type 'simply'|'pratt'|'howe'|'warren'|'k'
 * @param {number} span 跨度（m）
 * @param {number} height 桁高（m）
 * @param {string} material 材料 key
 * @returns { nodes, members, loads, supports }
 */
function generateBridge(type, span, height, material = 'steel') {
  const mat = MATERIALS[material];
  const E = mat.E, A = DEFAULT_AREA, y = mat.yieldStress;
  const panels = type === 'simply' ? 1 : 6;
  const panelW = span / panels;
  const nodes = [], members = [];

  // 下弦節點 (y=0)
  for (let i = 0; i <= panels; i++) {
    nodes.push({ id: `L${i}`, x: i * panelW, y: 0 });
  }

  if (type === 'simply') {
    // 簡支梁：就一根水平桿
    members.push({ id: 'M0', n1Id: 'L0', n2Id: 'L1', E, A, yieldStress: y });
    const loads = [{ nodeId: 'L0', fx: 0, fy: 0 }]; // 無外載（展示用）
    return {
      nodes,
      members,
      loads: [{ nodeId: 'L0', fx: 0, fy: -50000 }],
      supports: [{ nodeId: 'L0', fixX: true, fixY: true }, { nodeId: 'L1', fixX: false, fixY: true }],
    };
  }

  // 上弦節點 (y = height)
  for (let i = 1; i < panels; i++) {
    nodes.push({ id: `U${i}`, x: i * panelW, y: height });
  }
  const topStart = panels + 1; // index of U1 in nodes[]

  // 下弦桿
  for (let i = 0; i < panels; i++) members.push({ id: `B${i}`, n1Id: `L${i}`, n2Id: `L${i+1}`, E, A, yieldStress: y });
  // 上弦桿
  for (let i = 1; i < panels - 1; i++) members.push({ id: `T${i}`, n1Id: `U${i}`, n2Id: `U${i+1}`, E, A, yieldStress: y });
  // 端斜桿
  members.push({ id: 'E0', n1Id: 'L0', n2Id: 'U1', E, A, yieldStress: y });
  members.push({ id: 'E1', n1Id: `L${panels}`, n2Id: `U${panels-1}`, E, A, yieldStress: y });

  if (type === 'pratt') {
    // 豎桿 + V形斜桿（斜桿受拉）
    for (let i = 1; i < panels; i++) {
      members.push({ id: `V${i}`, n1Id: `L${i}`, n2Id: `U${i}`, E, A, yieldStress: y });
    }
    for (let i = 1; i < panels - 1; i++) {
      const left = i < panels / 2;
      if (left) members.push({ id: `D${i}`, n1Id: `L${i}`, n2Id: `U${i+1}`, E, A, yieldStress: y });
      else      members.push({ id: `D${i}`, n1Id: `L${i+1}`, n2Id: `U${i}`, E, A, yieldStress: y });
    }
  } else if (type === 'howe') {
    // 豎桿 + 反V斜桿（斜桿受壓）
    for (let i = 1; i < panels; i++) {
      members.push({ id: `V${i}`, n1Id: `L${i}`, n2Id: `U${i}`, E, A, yieldStress: y });
    }
    for (let i = 1; i < panels - 1; i++) {
      const left = i < panels / 2;
      if (left) members.push({ id: `D${i}`, n1Id: `L${i+1}`, n2Id: `U${i}`, E, A, yieldStress: y });
      else      members.push({ id: `D${i}`, n1Id: `L${i}`, n2Id: `U${i+1}`, E, A, yieldStress: y });
    }
  } else if (type === 'warren') {
    // 無豎桿，等腰三角形斜桿
    for (let i = 0; i < panels - 1; i++) {
      if (i % 2 === 0) members.push({ id: `D${i}`, n1Id: `L${i+1}`, n2Id: `U${i+1}`, E, A, yieldStress: y });
      else             members.push({ id: `D${i}`, n1Id: `U${i}`,   n2Id: `L${i+1}`, E, A, yieldStress: y });
    }
  } else if (type === 'k') {
    // K型桁架：豎桿 + K形斜桿（深桁架）
    for (let i = 1; i < panels; i++) {
      members.push({ id: `V${i}`, n1Id: `L${i}`, n2Id: `U${i}`, E, A, yieldStress: y });
    }
    for (let i = 1; i < panels; i++) {
      if (i < panels) members.push({ id: `DL${i}`, n1Id: `L${i}`, n2Id: `U${i <= 1 ? 1 : i-1}`, E, A: A*0.8, yieldStress: y });
      if (i < panels - 1) members.push({ id: `DR${i}`, n1Id: `L${i}`, n2Id: `U${i+1}`, E, A: A*0.8, yieldStress: y });
    }
  }

  // 均布荷重：在每個下弦內部節點施加集中力
  const loads = [];
  const totalLoad = -100000; // 100 kN 向下
  for (let i = 1; i < panels; i++) {
    loads.push({ nodeId: `L${i}`, fx: 0, fy: totalLoad / (panels - 1) });
  }

  const supports = [
    { nodeId: 'L0',       fixX: true,  fixY: true  }, // 鉸支承
    { nodeId: `L${panels}`, fixX: false, fixY: true }, // 滾支承
  ];

  return { nodes, members, loads, supports };
}

/**
 * 在 Canvas 上繪製桁架（含 FEM 結果著色）
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W canvas width
 * @param {number} H canvas height
 * @param {{ nodes, members }} truss
 * @param {{ memberForces, safetyFactors }} result — null = 未求解
 * @param {string|null} selectedMemberId
 */
function drawTruss(ctx, W, H, truss, result, selectedMemberId) {
  const { nodes, members } = truss;

  // 計算 bounding box → 置中縮放
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
  });
  const pw = W * 0.82, ph = H * 0.70;
  const scaleX = (maxX - minX) < 1e-6 ? 1 : pw / (maxX - minX);
  const scaleY = (maxY - minY) < 1e-6 ? 1 : ph / (maxY - minY);
  const sc = Math.min(scaleX, scaleY);
  const offX = (W - (maxX - minX) * sc) / 2 - minX * sc;
  const offY = H * 0.85 - maxY * sc; // 底部留空

  const tx = x => x * sc + offX;
  const ty = y => H * 0.85 - y * sc; // Y 軸翻轉（螢幕 y 向下）

  ctx.clearRect(0, 0, W, H);

  // 桿件
  members.forEach(m => {
    const ni = nodes.find(n => n.id === m.n1Id);
    const nj = nodes.find(n => n.id === m.n2Id);
    if (!ni || !nj) return;

    const force = result?.memberForces?.[m.id] ?? 0;
    const sf    = result?.safetyFactors?.[m.id];
    const color = result ? memberColor(force, sf) : '#64748b';
    const thick = m.id === selectedMemberId ? 5 : (Math.abs(force) > 1000 ? 3 : 2);

    ctx.beginPath();
    ctx.moveTo(tx(ni.x), ty(ni.y));
    ctx.lineTo(tx(nj.x), ty(nj.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = thick;
    ctx.stroke();

    // 力標籤
    if (result) {
      const mx = (tx(ni.x) + tx(nj.x)) / 2;
      const my = (ty(ni.y) + ty(nj.y)) / 2;
      const kN = (force / 1000).toFixed(1);
      ctx.fillStyle = color;
      ctx.font = 'bold 10px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${force > 0 ? '+' : ''}${kN}kN`, mx, my - 8);
    }
  });

  // 節點
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(tx(n.x), ty(n.y), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 支承符號
  const drawPin = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 16);
    ctx.lineTo(x + 10, y + 16);
    ctx.closePath();
    ctx.fillStyle = '#0f766e';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 18);
    ctx.lineTo(x + 12, y + 18);
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const drawRoller = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 16);
    ctx.lineTo(x + 10, y + 16);
    ctx.closePath();
    ctx.fillStyle = '#0d9488';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 8, y + 20, 3, 0, Math.PI * 2);
    ctx.arc(x,     y + 20, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, y + 20, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0d9488';
    ctx.fill();
  };

  if (truss.supports) {
    truss.supports.forEach((sp, i) => {
      const nd = nodes.find(n => n.id === sp.nodeId);
      if (!nd) return;
      if (sp.fixX && sp.fixY) drawPin(tx(nd.x), ty(nd.y) + 5);
      else                     drawRoller(tx(nd.x), ty(nd.y) + 5);
    });
  }

  // 載重箭頭
  if (truss.loads) {
    truss.loads.forEach(ld => {
      const nd = nodes.find(n => n.id === ld.nodeId);
      if (!nd || !ld.fy || Math.abs(ld.fy) < 1) return;
      const x0 = tx(nd.x), y0 = ty(nd.y);
      const len = 32;
      ctx.beginPath();
      ctx.moveTo(x0, y0 - len);
      ctx.lineTo(x0, y0 - 6);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0 - 6, y0 - 14);
      ctx.lineTo(x0, y0 - 4);
      ctx.lineTo(x0 + 6, y0 - 14);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      const kN = Math.abs(ld.fy / 1000).toFixed(0);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${kN}kN`, x0, y0 - len - 8);
    });
  }
}
