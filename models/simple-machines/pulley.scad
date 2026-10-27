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

// 繩索：繞過輪頂後從兩側（槽底 r = 19）垂下——左邊吊重物、右邊是施力端
color([0.09, 0.64, 0.29]) {
  // 繞輪頂的半圈（在 V 槽內）
  rotate([90, 0, 0]) rotate_extrude(angle = 180) translate([19, 0]) circle(r = 0.8);
  // 左邊垂吊到重物
  translate([-19.4, -0.4, -25]) cube([0.8, 0.8, 25]);
  // 右邊施力端（往下拉）
  translate([18.6, -0.4, -32]) cube([0.8, 0.8, 32]);
}
// 施力端握把（示意拉繩的手）
color([0.09, 0.64, 0.29])
  translate([15, -2, -36]) cube([8, 4, 4]);

// 重物（吊在左側繩索正下方，x 中心 −19）
color([0.32, 0.08, 0.16])
  translate([-31, -8, -38]) cube([24, 16, 13]);
