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
  translate([0, 0, 50]) cylinder(h = 55, r = 4);

// 十字頭（PH2 簡化）：2026-10 修正：原本是平頭十字方塊；PH 刀頭是往前收尖的十字（四片翼從軸徑收到尖端）
color([0.55, 0.55, 0.55])
  for (a = [0, 90]) rotate([0, 0, a])
    hull() {
      translate([0, 0, 104]) cube([8, 1.8, 0.2], center = true);
      translate([0, 0, 117]) cube([0.8, 1.2, 0.2], center = true);
    }
