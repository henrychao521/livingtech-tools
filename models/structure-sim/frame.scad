// 框架 Frame — 樑+柱組成的高樓結構（3 層 × 2 柱）
include <_common.scad>

color([0.36, 0.42, 0.55]) {
  // 4 根角柱（前後左右各一）— 簡化 2 根
  for (x = [-22, 22]) for (y = [-12, 12]) {
    translate([x - 2.5, y - 2.5, -30]) cube([5, 5, 60]);
  }
  // 3 層樑（X 方向，4 條 per 層）
  for (z = [-28, -8, 12, 32]) {
    // 沿 X 方向的兩條樑
    translate([-22, -12, z]) cube([44, 5, 4]);
    translate([-22, 7, z]) cube([44, 5, 4]);
    // 沿 Y 方向的兩條樑
    translate([-22, -12, z]) cube([5, 24, 4]);
    translate([17, -12, z]) cube([5, 24, 4]);
  }
}

// 樓板（半透明示意）
color([0.86, 0.6, 0.3, 0.6]) {
  translate([-22, -12, -28]) cube([44, 24, 1]);
  translate([-22, -12, -8]) cube([44, 24, 1]);
  translate([-22, -12, 12]) cube([44, 24, 1]);
}
