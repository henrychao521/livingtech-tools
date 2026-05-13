// 夾具 Clamp — C 型夾
include <_common.scad>

// C 形主體（用 difference 從矩形挖出 U 型）
color([0.55, 0.55, 0.58])
  difference() {
    // 外形 C
    union() {
      // 上臂
      translate([0, -3, 32]) cube([55, 6, 6]);
      // 下臂
      translate([0, -3, 0]) cube([55, 6, 6]);
      // 背柱
      translate([0, -3, 0]) cube([6, 6, 38]);
    }
  }

// 螺絲桿（從上臂往下旋）
color([0.4, 0.4, 0.4]) {
  translate([45, 0, 18]) cylinder(h = 18, r = 2.5);
  // 螺紋示意（用一堆環）
  for (i = [0:7]) translate([45, 0, 18 + i*2]) rotate([90, 0, 0]) cylinder(h = 0.5, r = 3, center = true);
}

// T 形手把
color([0.18, 0.18, 0.18])
  translate([45, -12, 36]) cube([3, 24, 3]);

// 夾頭（壓在物件上）
color([0.30, 0.30, 0.30])
  translate([42, -5, 14]) cube([6, 10, 4]);
