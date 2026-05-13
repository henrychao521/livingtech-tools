// 扳手 Wrench — 開口扳手（鋼製）
include <_common.scad>

// 主桿（細長矩形）
color([0.55, 0.55, 0.58])
  translate([-6, -3, 0]) cube([100, 6, 6]);

// 末端開口頭（U 形）
color([0.55, 0.55, 0.58])
  translate([90, -10, 0]) {
    difference() {
      // 外輪廓
      cube([22, 20, 6]);
      // 開口槽（U 形）
      translate([8, 8, -1]) cube([16, 12, 8]);
      // 六角內部模糊（讓開口看起來像 U + 兩側內凹）
    }
  }

// 另一端梅花頭（圓環）
color([0.55, 0.55, 0.58])
  translate([0, 0, 3])
    difference() {
      cylinder(h = 6, r = 12, center = true);
      cylinder(h = 8, r = 8, center = true, $fn = 6);   // 內六角
    }
