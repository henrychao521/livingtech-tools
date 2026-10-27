// 齒輪嚙合數值驗證：node mechanism/tests/gear-mesh.test.js
// 對每組齒數，在主動輪轉過一個齒距內取多個轉角（另加任意大角度），把兩個齒輪外形多邊形放到嚙合位置，檢查：
//  1. 不重疊：任一齒輪的頂點都不在另一齒輪內，兩外形的邊也不相交
//  2. 有在嚙合：每個轉角的最小間隙 > 0 且 < 0.15m（太大代表齒沒有接觸、只是飄著）
//  3. 齒對齒槽：主動輪齒中心線對準連心線時，從動輪在連心線上是齒槽中心（不是齒頂撞齒頂）
//  4. 接觸比 > 1.1
// 點在多邊形內、線段相交、點到線段距離都在本檔獨立實作，不用 gear-geometry.js 的函式。
'use strict';
const assert = require('assert');
const path = require('path');
const G = require(path.join(__dirname, '..', 'js', 'gear-geometry.js'));

function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function segDist(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
}
function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
function segX(a, b, c, d) { return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0; }

const m = 6; // 任意模數（結果以 m 為單位回報）
const PAIRS = [[12, 10], [12, 12], [12, 40], [14, 28], [18, 18], [20, 12], [24, 12], [17, 31], [30, 45], [40, 16], [48, 24], [13, 37], [25, 25]];
let checks = 0;
const rows = [];
for (const [z1, z2] of PAIRS) {
  const g1 = G.gearOutline(z1, m), g2 = G.gearOutline(z2, m);
  const a = G.centerDistance(m, z1, z2);
  // 獨立核對：中心距＝兩節圓半徑和
  assert.ok(Math.abs(a - (g1.rp + g2.rp)) < 1e-9); checks++;
  const cr = G.contactRatio(g1, g2);
  assert.ok(cr > 1.1, `z${z1}/${z2} 接觸比 ${cr}`); checks++;
  // 只取靠近嚙合區（x 在 a/2 附近 ±2m）的點與邊加速
  const zone = p => Math.abs(p[0] - g1.rp) < 3 * m && Math.abs(p[1]) < 4 * m;
  let minGap = Infinity, maxOfMin = 0;
  const samples = [];
  for (let k = 0; k < 48; k++) samples.push(2 * Math.PI / z1 * k / 48);
  for (let k = 0; k < 12; k++) samples.push(1.234 * k + 0.37);
  for (const t1 of samples) {
    const P1 = G.transform(g1.pts, t1, 0, 0);
    const P2 = G.transform(g2.pts, G.drivenAngle(t1, z1, z2), a, 0);
    const Z1 = P1.filter(zone), Z2 = P2.filter(zone);
    for (const p of Z2) { assert.ok(!inside(p, P1), `z${z1}/${z2} θ=${t1.toFixed(3)} 從動輪頂點進到主動輪裡`); checks++; }
    for (const p of Z1) { assert.ok(!inside(p, P2), `z${z1}/${z2} θ=${t1.toFixed(3)} 主動輪頂點進到從動輪裡`); checks++; }
    const E1 = [], E2 = [];
    for (let i = 0; i < P1.length; i++) { const e = [P1[i], P1[(i + 1) % P1.length]]; if (zone(e[0]) || zone(e[1])) E1.push(e); }
    for (let i = 0; i < P2.length; i++) { const e = [P2[i], P2[(i + 1) % P2.length]]; if (zone(e[0]) || zone(e[1])) E2.push(e); }
    for (const [p, q] of E1) for (const [r, s] of E2) { assert.ok(!segX(p, q, r, s), `z${z1}/${z2} θ=${t1.toFixed(3)} 齒廓相交`); checks++; }
    let gap = Infinity;
    for (const p of Z2) for (const [r, s] of E1) gap = Math.min(gap, segDist(p, r, s));
    for (const p of Z1) for (const [r, s] of E2) gap = Math.min(gap, segDist(p, r, s));
    minGap = Math.min(minGap, gap); maxOfMin = Math.max(maxOfMin, gap);
  }
  assert.ok(minGap > 0, `z${z1}/${z2} 最小間隙要 > 0`); checks++;
  assert.ok(maxOfMin < 0.15 * m, `z${z1}/${z2} 每個轉角都要有齒在接觸附近（最大的最小間隙 ${(maxOfMin / m).toFixed(3)}m）`); checks++;
  // 齒對齒槽：θ1=0 時主動輪齒在 0°，從動輪在 180° 方向應為齒槽中心＝兩側最近的齒各差半個齒距
  const t2 = G.drivenAngle(0, z1, z2);
  let best = Infinity;
  for (let k = 0; k < z2; k++) {
    const ang = t2 + 2 * Math.PI * k / z2;
    let d = ((ang - Math.PI) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    best = Math.min(best, Math.abs(d));
  }
  assert.ok(Math.abs(best - Math.PI / z2) < 1e-9, `z${z1}/${z2} 從動輪在連心線上要是齒槽中心`); checks++;
  // 轉速比：從動輪角速度 = −z1/z2 倍（數值微分）
  const w = (G.drivenAngle(0.01, z1, z2) - G.drivenAngle(0, z1, z2)) / 0.01;
  assert.ok(Math.abs(w + z1 / z2) < 1e-9); checks++;
  rows.push(`z1=${String(z1).padStart(2)} z2=${String(z2).padStart(2)}  中心距 ${(a / m).toFixed(1)}m  接觸比 ${cr.toFixed(2)}  最小間隙 ${(minGap / m).toFixed(4)}m  最大的最小間隙 ${(maxOfMin / m).toFixed(4)}m`);
}

// 對照：舊版畫法（齒根圓半徑 r1=80、r2=80·N2/N1，節圓 r+5）兩輪的周節不一樣，轉一陣子齒就會撞在一起
const old = (n1, n2) => { const p1 = 2 * Math.PI * 85 / n1, p2 = 2 * Math.PI * (80 * n2 / n1 + 5) / n2; return Math.abs(p1 - p2); };
rows.push(`舊版 24/12 齒的周節差 ${old(24, 12).toFixed(2)} px／齒（新版 0）`);
console.log(rows.join('\n'));
console.log(`gear-mesh：${checks} 項檢查全部通過`);
