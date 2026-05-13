// 纜索懸吊 Cable / Suspension — 兩塔 + 主纜 + 吊桿 + 橋面
include <_common.scad>

// 橋面
color([0.55, 0.45, 0.35])
  translate([-50, -5, -18]) cube([100, 10, 4]);

// 兩座塔
color([0.36, 0.42, 0.55]) {
  translate([-30, -3, -18]) cube([5, 6, 50]);
  translate([25, -3, -18]) cube([5, 6, 50]);
  // 塔頂橫梁
  translate([-30, -3, 28]) cube([5, 6, 4]);
  translate([25, -3, 28]) cube([5, 6, 4]);
}

// 主纜（簡化為兩段直線：左塔頂 → 中央低點 → 右塔頂）
color([0.16, 0.16, 0.16]) {
  // 主纜左半（從左塔頂下垂到中央）
  hull() {
    translate([-27.5, 0, 32]) sphere(r = 1.5);
    translate([0, 0, 12]) sphere(r = 1.5);
  }
  // 主纜右半
  hull() {
    translate([0, 0, 12]) sphere(r = 1.5);
    translate([27.5, 0, 32]) sphere(r = 1.5);
  }
}

// 吊桿（垂直細線從主纜到橋面）
color([0.86, 0.25, 0.25])
  for (x = [-20, -10, 0, 10, 20]) {
    // 主纜在 x 位置的高度（拋物線近似）
    z_main = 12 + (x*x) * 0.025;
    translate([x - 0.4, -0.4, -14]) cube([0.8, 0.8, z_main + 14]);
  }
