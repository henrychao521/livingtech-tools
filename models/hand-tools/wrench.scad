// 扳手 Wrench — 開口扳手（鋼製）
include <_common.scad>

// 主桿（細長矩形）
color([0.55, 0.55, 0.58])
  translate([-6, -3, 0]) cube([100, 6, 6]);

// 末端開口頭（U 形）：2026-10 修正：開口頭與柄成 15°（一般開口扳手的偏角）
color([0.55, 0.55, 0.58])
  translate([90, 0, 0]) rotate([0, 0, 15]) translate([0, -10, 0]) {
    difference() {
      // 外輪廓
      cube([22, 20, 6]);
      // 開口槽（U 形，置中、只向 +X 端開口）
      translate([10, 4, -1]) cube([14, 12, 8]);
      // 六角內部模糊（讓開口看起來像 U + 兩側內凹）
    }
  }

// 另一端梅花頭（圓環）：2026-10 修正：內孔改成 12 角（兩個錯開 30° 的六角形聯集），原本是單一六角
color([0.55, 0.55, 0.58])
  translate([0, 0, 3])
    difference() {
      cylinder(h = 6, r = 12, center = true);
      for (a = [0, 30]) rotate([0, 0, a]) cylinder(h = 8, r = 8, center = true, $fn = 6);
    }
