// 螺絲起子 Screwdriver — 紅色塑膠握把 + 鋼軸 + 十字頭
include <_common.scad>

// 握把（紅色塑膠，腰鼓形）
color([0.86, 0.15, 0.15])
  hull() {
    cylinder(h = 0.1, r = 11);
    translate([0, 0, 20]) cylinder(h = 0.1, r = 15);
    translate([0, 0, 50]) cylinder(h = 0.1, r = 13);
  }

// 握把端蓋
color([0.7, 0.1, 0.1])
  translate([0, 0, -2]) cylinder(h = 4, r = 10);

// 鋼軸
color([0.7, 0.7, 0.7])
  translate([0, 0, 50]) cylinder(h = 60, r = 4);

// 十字頭（PH2 簡化）
color([0.55, 0.55, 0.55])
  translate([0, 0, 108]) {
    cube([6, 1.2, 6], center = true);
    cube([1.2, 6, 6], center = true);
  }
