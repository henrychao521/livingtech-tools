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

// 螺絲桿（穿過上臂往下旋）：2026-10 修正：原本螺桿頂端停在上臂裡、T 形手把埋在上臂內
color([0.4, 0.4, 0.4]) {
  translate([45, 0, 18]) cylinder(h = 32, r = 2.5);
  // 螺紋示意（用一堆環）
  for (i = [0:6]) translate([45, 0, 20 + i*2]) cylinder(h = 0.5, r = 3, center = true);
}

// T 形手把（在上臂上方，橫穿螺桿頂端）
color([0.18, 0.18, 0.18])
  translate([43.5, -12, 46]) cube([3, 24, 3]);

// 夾頭（壓在物件上）
color([0.30, 0.30, 0.30])
  translate([42, -5, 14]) cube([6, 10, 4]);
