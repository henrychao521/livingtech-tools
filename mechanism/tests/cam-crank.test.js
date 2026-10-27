// 凸輪、曲柄滑塊公式驗證：node mechanism/tests/cam-crank.test.js
// module4.js 用的封閉公式 vs. 暴力數值解（獨立算法）。
'use strict';
const assert = require('assert');
let n = 0;
// 1. 平底從動件：高度＝旋轉橢圓在垂直方向的最大伸展 h，接觸點水平位置 xc；平底寬度要涵蓋所有 xc
for (const k of [0.1, 0.3, 0.5, 0.7, 0.9]) {
  const a = 100, b = 100 * (1 - k);
  const faceW = 2 * ((a * a - b * b) / (a + b)) + 40;
  let maxXc = 0;
  for (let i = 0; i < 360; i++) {
    const th = i * Math.PI / 180, ca = Math.cos(th), sa = Math.sin(th);
    const h = Math.sqrt(a * a * sa * sa + b * b * ca * ca);
    const xc = -(a * a - b * b) * sa * ca / h;
    // 暴力：橢圓上 7200 點旋轉後找 y 最小（畫面上方，canvas y 向下）
    let best = { y: Infinity, x: 0 };
    for (let t = 0; t < 7200; t++) {
      const u = t * Math.PI / 3600, x0 = a * Math.cos(u), y0 = b * Math.sin(u);
      const x = x0 * ca - y0 * sa, y = x0 * sa + y0 * ca;
      if (y < best.y) best = { y, x };
    }
    assert.ok(Math.abs(-best.y - h) < 0.01, `k=${k} θ=${i} 高度`); n++;
    assert.ok(Math.abs(best.x - xc) < 0.5, `k=${k} θ=${i} 接觸點 ${best.x} vs ${xc}`); n++;
    maxXc = Math.max(maxXc, Math.abs(xc));
  }
  assert.ok(faceW / 2 > maxXc + 5, `k=${k} 平底寬度 ${faceW} 要涵蓋接觸點 ±${maxXc.toFixed(1)}`); n++;
  // 升程＝a−b，一圈兩次
  console.log(`凸輪 k=${k}：升程 ${(a - b).toFixed(0)}，接觸點最大偏移 ${maxXc.toFixed(1)}，平底半寬 ${(faceW / 2).toFixed(1)}`);
}
// 2. 曲柄滑塊：x = R cosθ + √(L² − R² sin²θ) 與「連桿長度＝L」的幾何條件一致；行程＝2R；滑塊不撞曲柄軸
for (const R of [20, 50, 80]) for (const L of [120, 160, 240]) {
  let xmin = Infinity, xmax = -Infinity;
  for (let i = 0; i < 720; i++) {
    const th = i * Math.PI / 360;
    const x = R * Math.cos(th) + Math.sqrt(L * L - R * R * Math.sin(th) ** 2);
    const px = R * Math.cos(th), py = R * Math.sin(th);
    assert.ok(Math.abs(Math.hypot(x - px, 0 - py) - L) < 1e-9); n++;
    xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
  }
  assert.ok(Math.abs((xmax - xmin) - 2 * R) < 1e-6, '行程 2R'); n++;
  assert.ok(xmin - 25 > 10, `R=${R} L=${L} 滑塊（半寬 25）不碰到曲柄軸`); n++;
}
console.log(`cam-crank：${n} 項檢查全部通過`);
