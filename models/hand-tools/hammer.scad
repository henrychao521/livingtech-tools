// 羊角錘 Claw Hammer — 木柄 + 鋼錘頭 + 爪部
include <_common.scad>

// 木柄（圓柱）
color([0.55, 0.27, 0.13])
  cylinder(h = 90, r1 = 7, r2 = 9, center = false);

// 錘頭主體（鋼）
color([0.45, 0.45, 0.45])
  translate([-12, -8, 88]) cube([34, 16, 16]);

// 打擊面（前端方塊）
color([0.30, 0.30, 0.30])
  translate([22, -8, 88]) cube([8, 16, 16]);

// 羊角爪（後方分叉）
color([0.45, 0.45, 0.45])
  translate([-20, -6, 88]) {
    // V 形爪（用兩個傾斜薄塊）
    rotate([0, -25, 0]) cube([16, 5, 5]);
    translate([0, 7, 0]) rotate([0, -25, 0]) cube([16, 5, 5]);
    // 爪根
    cube([8, 12, 16]);
  }
