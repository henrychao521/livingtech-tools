// Onshape 模組 5 草圖案例驗證：node onshape/tests/sketch-cases.test.js
// 用獨立的幾何與自由度計算核對：「錯誤版」真的有它宣稱的那個錯誤（而且只有那個），「正確版」真的封閉、不重疊、完全定義、尺寸與幾何一致。
'use strict';
const assert = require('assert');
const path = require('path');
const { CASES, render } = require(path.join(__dirname, '..', 'js', 'module5-sketches.js'));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const EPS = 1e-9;

function analyze(s) {
  const P = k => k === 'O' ? [0, 0] : s.pts[k];
  const segs = s.lines.filter(l => !l.construction).map(l => ({ id: l.id, a: P(l.a), b: P(l.b) }));
  const key = p => p[0].toFixed(6) + ',' + p[1].toFixed(6);
  // 端點度數（同座標＝同點）
  const deg = {};
  segs.forEach(g => { [g.a, g.b].forEach(p => { deg[key(p)] = (deg[key(p)] || 0) + 1; }); });
  // T 形接點（端點落在別條線內部）也算接上
  const onInterior = (p, g) => {
    const vx = g.b[0] - g.a[0], vy = g.b[1] - g.a[1];
    const cr = (p[0] - g.a[0]) * vy - (p[1] - g.a[1]) * vx;
    if (Math.abs(cr) > EPS) return false;
    const t = ((p[0] - g.a[0]) * vx + (p[1] - g.a[1]) * vy) / (vx * vx + vy * vy);
    return t > EPS && t < 1 - EPS;
  };
  const dangling = [];
  segs.forEach(g => [g.a, g.b].forEach(p => { if (deg[key(p)] === 1 && !segs.some(h => h !== g && onInterior(p, h))) dangling.push(p); }));
  // 最近的「差一點」端點距離
  let nearMiss = Infinity;
  for (let i = 0; i < dangling.length; i++) for (let j = i + 1; j < dangling.length; j++) nearMiss = Math.min(nearMiss, Math.hypot(dangling[i][0] - dangling[j][0], dangling[i][1] - dangling[j][1]));
  // 重疊（共線且區間重疊長度 > 0）
  let overlap = false;
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const g = segs[i], h = segs[j];
    const vx = g.b[0] - g.a[0], vy = g.b[1] - g.a[1];
    const c1 = (h.a[0] - g.a[0]) * vy - (h.a[1] - g.a[1]) * vx, c2 = (h.b[0] - g.a[0]) * vy - (h.b[1] - g.a[1]) * vx;
    if (Math.abs(c1) < EPS && Math.abs(c2) < EPS) {
      const L2 = vx * vx + vy * vy;
      const t1 = ((h.a[0] - g.a[0]) * vx + (h.a[1] - g.a[1]) * vy) / L2, t2 = ((h.b[0] - g.a[0]) * vx + (h.b[1] - g.a[1]) * vy) / L2;
      if (Math.min(1, Math.max(t1, t2)) - Math.max(0, Math.min(t1, t2)) > EPS) overlap = true;
    }
  }
  // 交叉（兩線內部互相穿過）
  let crossing = false;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const g = segs[i], h = segs[j];
    if (cross(g.a, g.b, h.a) * cross(g.a, g.b, h.b) < -EPS && cross(h.a, h.b, g.a) * cross(h.a, h.b, g.b) < -EPS) crossing = true;
  }
  // 封閉區域數（沒有重疊時用平面圖尤拉公式：有界面 F = E − V + C；先在交點、T 接點把線切開，再剪掉懸空的枝）
  let regions = null;
  if (!overlap) {
    const pts = [];
    const idx = p => { let k = pts.findIndex(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-7); if (k < 0) { pts.push(p); k = pts.length - 1; } return k; };
    const cuts = segs.map(g => [0, 1]);
    segs.forEach((g, i) => segs.forEach((h, j) => {
      if (i === j) return;
      [h.a, h.b].forEach(p => { if (onInterior(p, g)) { const vx = g.b[0] - g.a[0], vy = g.b[1] - g.a[1]; cuts[i].push(((p[0] - g.a[0]) * vx + (p[1] - g.a[1]) * vy) / (vx * vx + vy * vy)); } });
      const d = (g.b[0] - g.a[0]) * (h.b[1] - h.a[1]) - (g.b[1] - g.a[1]) * (h.b[0] - h.a[0]);
      if (Math.abs(d) > EPS) {
        const t = ((h.a[0] - g.a[0]) * (h.b[1] - h.a[1]) - (h.a[1] - g.a[1]) * (h.b[0] - h.a[0])) / d;
        const u = ((h.a[0] - g.a[0]) * (g.b[1] - g.a[1]) - (h.a[1] - g.a[1]) * (g.b[0] - g.a[0])) / d;
        if (t > EPS && t < 1 - EPS && u > EPS && u < 1 - EPS) cuts[i].push(t);
      }
    }));
    let E = [];
    segs.forEach((g, i) => { const ts = [...new Set(cuts[i].map(t => +t.toFixed(9)))].sort((a, b) => a - b); for (let k = 0; k + 1 < ts.length; k++) { const p = [g.a[0] + (g.b[0] - g.a[0]) * ts[k], g.a[1] + (g.b[1] - g.a[1]) * ts[k]], q = [g.a[0] + (g.b[0] - g.a[0]) * ts[k + 1], g.a[1] + (g.b[1] - g.a[1]) * ts[k + 1]]; E.push([idx(p), idx(q)]); } });
    // 剪懸空枝
    let changed = true;
    while (changed) { changed = false; const d = {}; E.forEach(([a, b]) => { d[a] = (d[a] || 0) + 1; d[b] = (d[b] || 0) + 1; }); const E2 = E.filter(([a, b]) => d[a] > 1 && d[b] > 1); if (E2.length !== E.length) { E = E2; changed = true; } }
    const V = new Set(E.flat());
    const par = {}; const find = x => par[x] === x ? x : (par[x] = find(par[x]));
    V.forEach(v => { par[v] = v; }); E.forEach(([a, b]) => { par[find(a)] = find(b); });
    const C = new Set([...V].map(find)).size;
    regions = E.length - V.size + C;
    // 圓是獨立的封閉迴圈（孔），不另算區域
  }
  // 自由度：每個點 2、每個圓半徑 1；限制條件扣除
  const vars = Object.keys(s.pts).length * 2 + s.circles.length;
  const W = { coin: 2, mid: 2, on: 1, h: 1, v: 1, hp: 1, vp: 1 };
  let rem = 0;
  s.cons.forEach(c => { assert.ok(W[c.t] != null, '未知限制條件 ' + c.t); rem += W[c.t]; });
  rem += s.dims.length;
  // 尺寸與幾何一致
  const conflicts = [];
  s.dims.forEach(d => {
    let meas;
    if (d.t === 'dx') meas = Math.abs(d.x2 - d.x1);
    else if (d.t === 'dy') meas = Math.abs(d.y2 - d.y1);
    else meas = 2 * s.circles.find(c => c.id === d.c).r;
    if (Math.abs(meas - d.val) > 1e-9) conflicts.push(d);
    // 尺寸端點要對到所參考的點
    if (d.t !== 'dia') d.refs.forEach((r, i) => {
      if (!s.pts[r]) return; // 參考的是線（例如超出的長線），略過
      const want = d.t === 'dx' ? s.pts[r][0] : s.pts[r][1];
      const got = d.t === 'dx' ? (i ? d.x2 : d.x1) : (i ? d.y2 : d.y1);
      assert.ok(Math.abs(want - got) < 1e-9, `尺寸端點對不到點 ${r}`);
    });
  });
  // 不重複標註：同樣兩個參考、同一方向只能有一個尺寸
  const sig = s.dims.map(d => d.t + ':' + [...d.refs].sort().join('-'));
  const dupDims = sig.length - new Set(sig).size;
  const anchored = s.cons.some(c => (c.t === 'coin' || c.t === 'on') && (c.p === 'O' || c.q === 'O'));
  const hasBlue = s.color === 'blue' || s.lines.some(l => l.color === 'blue');
  return { dangling: dangling.length, nearMiss, overlap, crossing, regions, dof: vars - rem, over: rem > vars, conflicts: conflicts.length, dupDims, anchored, hasBlue, color: s.color };
}

const report = [];
for (const c of CASES) {
  if (c.plane) {
    const b = render(c, 'bad'), g = render(c, 'good');
    ok(/stroke-dasharray/.test(b) && /stroke-dasharray/.test(g), '3D 圖有隱藏線（虛線）');
    // Onshape 預設等角視角（視線來自 +x、−y、+z）：Front 平面在前下方、Right 平面在後上方；隱藏線剛好 3 條
    for (const svg of [b, g]) {
      const ly = t => +new RegExp('<text x="[\\d.]+" y="([\\d.]+)"[^>]*>' + t).exec(svg)[1];
      ok(ly('Front（前）') > ly('Right（右）'), 'Front 平面標籤在 Right 平面標籤下方（靠近觀看者）');
      ok((svg.match(/stroke-dasharray/g) || []).length === 3, '隱藏邊 3 條');
    }
    continue;
  }
  const G = analyze(c.good), B = analyze(c.bad);
  // 正確版：封閉成 1 個區域、沒有懸空端點、沒有重疊與交叉、完全定義、尺寸一致、不重複、有定位到原點、全黑
  ok(G.regions === 1, `${c.id} 正確版要剛好 1 個封閉區域（${G.regions}）`);
  ok(G.dangling === 0 && !G.overlap && !G.crossing, `${c.id} 正確版沒有懸空端點、重疊、交叉`);
  ok(G.dof === 0 && !G.over, `${c.id} 正確版完全定義（自由度 ${G.dof}）`);
  ok(G.conflicts === 0 && G.dupDims === 0 && G.anchored, `${c.id} 正確版尺寸一致、不重複、有接原點`);
  ok(G.color === 'black' && !G.hasBlue, `${c.id} 正確版畫成黑色`);
  // 顏色和自由度一致（錯誤版）
  ok(B.over ? B.color === 'red' : B.dof > 0 ? B.hasBlue : (B.color === 'black' && !B.hasBlue), `${c.id} 錯誤版顏色與自由度一致（dof ${B.dof}, ${B.color}）`);
  // 錯誤版確實有它宣稱的錯
  const expect = {
    open: () => B.regions === 0 && B.dangling === 2 && B.dof === 0,
    gap: () => B.regions === 0 && B.dangling === 2 && B.nearMiss > 0 && B.nearMiss < 1 && B.dof > 0,
    overlap: () => B.overlap,
    construction: () => B.regions === 2 && B.dof === 0,
    overshoot: () => B.crossing && B.dangling === 2 && B.regions === 1,
    under: () => B.dof > 0 && !B.anchored && B.regions === 1 && B.dangling === 0,
    over: () => B.over && B.conflicts === 1 && B.regions === 1,
  }[c.id];
  ok(expect && expect(), `${c.id} 錯誤版要真的有這個錯：${JSON.stringify(B)}`);
  report.push(`${c.id.padEnd(12)} 錯誤版：區域 ${B.regions} 懸空端點 ${B.dangling} 重疊 ${B.overlap} 交叉 ${B.crossing} 自由度 ${B.over ? '過度' : B.dof} 衝突尺寸 ${B.conflicts}｜正確版：區域 ${G.regions} 自由度 ${G.dof}`);
  // 畫得出來、是合法 SVG 片段（有 viewBox、尺寸數字個數＝尺寸數）
  ['bad', 'good'].forEach(w => {
    const svg = render(c, w);
    const nums = (svg.match(/<text[^>]*font-size="9.5"[^>]*>[^<]*<\/text>/g) || []).length;
    ok(/^<svg[^>]+viewBox="0 0 260 200"/.test(svg), 'svg');
    ok(nums >= c[w].dims.length, `${c.id} ${w} 每個尺寸都有數字`);
  });
}
console.log(report.join('\n'));
console.log(`sketch-cases：${n} 項檢查全部通過`);
