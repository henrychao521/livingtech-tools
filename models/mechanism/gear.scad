// 齒輪組 Gear Pair — 兩個嚙合齒輪
include <_common.scad>

// 大齒輪（N1 = 24 齒，r = 28）
translate([-22, 0, 0]) rotate([90, 0, 0])
  color([0.08, 0.71, 0.65]) simple_gear(N = 24, r = 28, h = 4, thick = 8);

// 小齒輪（N2 = 12 齒，r = 14；嚙合到大齒輪右側）
// 兩齒輪節圓相切：圓心距 = r1 + r2 = 28 + 14 = 42
translate([20, 0, 0]) rotate([90, 0, 360/12/2])  // 偏轉半齒 = 12 齒的 15° / 2 ≈ 7.5°
  color([0.86, 0.4, 0.2]) simple_gear(N = 12, r = 14, h = 4, thick = 8);
