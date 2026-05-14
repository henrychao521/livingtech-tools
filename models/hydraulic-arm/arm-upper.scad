// 軸2：大臂（上臂）— 肩關節 + 連桿
include <_common.scad>

// 肩關節圓盤
color([0.40, 0.40, 0.43]) {
  rotate([90, 0, 0]) cylinder(h = 16, r = 14, center = true);
  // 關節孔
  color([0.15, 0.15, 0.15]) rotate([90, 0, 0]) cylinder(h = 18, r = 5, center = true);
}

// 大臂本體（矩形截面）
color([0.50, 0.52, 0.55])
  translate([-10, -8, 0]) cube([20, 16, 90]);

// 加強肋（兩側）
color([0.45, 0.46, 0.49]) {
  translate([-12, -4, 10]) cube([2, 8, 70]);
  translate([10, -4, 10]) cube([2, 8, 70]);
}

// 肘關節（上端）
color([0.40, 0.40, 0.43])
  translate([0, 0, 90]) {
    rotate([90, 0, 0]) cylinder(h = 20, r = 10, center = true);
    color([0.15, 0.15, 0.15]) rotate([90, 0, 0]) cylinder(h = 22, r = 4, center = true);
  }

// 針筒接耳（上端）
color([0.35, 0.35, 0.38]) {
  translate([-6, 8, 60]) cube([12, 14, 8]);
  translate([-6, -22, 60]) cube([12, 14, 8]);
}

// 針筒（液壓缸）
color([0.70, 0.78, 0.85, 0.75])
  translate([0, 22, 20]) rotate([0, 0, 0]) cylinder(h = 50, r = 7);
color([0.60, 0.60, 0.65])
  translate([0, 22, 70]) cylinder(h = 20, r = 2.5);
