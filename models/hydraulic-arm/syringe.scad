// 針筒（液壓缸） — 透明筒身 + 活塞 + 推桿
include <_common.scad>

// 筒身（外壁）
color([0.85, 0.92, 0.98, 0.8])
  difference() {
    cylinder(h = 80, r = 12);
    translate([0, 0, 5]) cylinder(h = 78, r = 9.5);
  }

// 筒底蓋
color([0.7, 0.75, 0.80])
  cylinder(h = 5, r = 12);

// 前端出水口
color([0.7, 0.75, 0.80])
  translate([0, 0, 80]) cylinder(h = 6, r = 5);
color([0.5, 0.55, 0.6])
  translate([0, 0, 86]) cylinder(h = 8, r = 2.5);

// 刻度線
color([0.3, 0.3, 0.3])
  for (i = [1:7])
    translate([-13, -0.5, 10 + i * 10]) cube([4, 1, 0.5]);

// 活塞（在筒內，橡膠黑色）
color([0.15, 0.15, 0.15])
  translate([0, 0, 28]) cylinder(h = 6, r = 9.4);

// 推桿
color([0.75, 0.75, 0.78])
  translate([0, 0, -50]) cylinder(h = 78, r = 3);

// 推桿手柄（T形）
color([0.2, 0.2, 0.22])
  translate([-18, -4, -52]) cube([36, 8, 5]);
