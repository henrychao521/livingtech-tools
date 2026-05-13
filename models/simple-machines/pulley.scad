// 滑輪 Pulley — 繞線輪 + 軸 + 支撐架 + 繩索 + 重物
include <_common.scad>

// 滑輪（圓盤帶凹槽）
color([0.86, 0.15, 0.46])
  difference() {
    rotate([90, 0, 0]) cylinder(h = 8, r = 22, center = true);
    // 中央凹槽（讓繩索定位）
    rotate([90, 0, 0]) cylinder(h = 4, r = 19, center = true);
  }

// 中心軸
color([0.62, 0.08, 0.30])
  rotate([90, 0, 0]) cylinder(h = 14, r = 4, center = true);

// 支撐架（橋型框架）
color([0.51, 0.09, 0.26]) {
  // 頂橫梁
  translate([-25, -3, 22]) cube([50, 6, 4]);
  // 左豎桿
  translate([-25, -3, 0]) cube([4, 6, 22]);
  // 右豎桿
  translate([21, -3, 0]) cube([4, 6, 22]);
}

// 繩索（兩條垂直線）
color([0.09, 0.64, 0.29]) {
  translate([-19, 0, -25]) rotate([90, 0, 0]) cylinder(h = 1, r = 0.8, center = true);
  // 左邊垂吊到重物
  translate([-19, -0.4, -25]) cube([0.8, 0.8, 25]);
  translate([19, -0.4, -25]) cube([0.8, 0.8, 25]);
}

// 重物（吊在繩索下方）
color([0.32, 0.08, 0.16])
  translate([-12, -8, -38]) cube([24, 16, 13]);
