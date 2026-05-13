// 手鋸 Saw — 木柄 + 鋸條（帶齒）
include <_common.scad>

// 鋸條（薄長方體）
color([0.7, 0.7, 0.72])
  translate([0, -0.4, 0]) cube([130, 0.8, 18]);

// 鋸齒（沿底邊一排小三角形）
color([0.55, 0.55, 0.55])
  for (i = [0:30])
    translate([i * 4, -0.5, 0])
      rotate([0, 0, 90])
        linear_extrude(height = 1) polygon([[-2, 0], [0, 3], [2, 0]]);

// 鋸條與握把連接 backbone（鋼條加固）
color([0.30, 0.30, 0.30])
  translate([0, -1, 16]) cube([130, 2, 3]);

// D 形木柄
color([0.55, 0.27, 0.13]) {
  // 握把外框
  translate([135, 0, 9]) rotate([90, 0, 0])
    difference() {
      cylinder(h = 14, r = 22, center = true);
      cylinder(h = 16, r = 14, center = true);
    }
  // 握把連接座
  translate([130, -3, -2]) cube([12, 6, 22]);
}
