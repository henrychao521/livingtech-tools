// 棘輪 Ratchet — 帶斜齒輪盤 + 卡爪（pawl）防反
include <_common.scad>

// 棘輪盤（24 個斜齒）
N = 24;
R = 26;
TOOTH = 4;
color([0.08, 0.71, 0.65])
  rotate([90, 0, 0])
    union() {
      cylinder(h = 6, r = R, center = true);
      // 斜齒（單向傾斜）
      for (i = [0:N-1]) {
        rotate([0, 0, i * 360 / N])
          translate([R, 0, 0])
            linear_extrude(height = 6, center = true)
              polygon([[0, -3], [TOOTH, -2.5], [TOOTH, 0]]);  // 斜面+垂直面 = 單向齒
      }
    }

// 中心軸
color([0.06, 0.46, 0.42])
  rotate([90, 0, 0]) cylinder(h = 10, r = 4, center = true);

// 卡爪 pawl（壓在齒上方）
color([0.86, 0.15, 0.15]) {
  // 卡爪本體
  translate([R - 2, -2, 1])
    rotate([0, 30, 0])
      cube([3, 4, 18]);
}
// 卡爪 pivot（固定點，棘輪斜上方）
color([0.32, 0.32, 0.32])
  translate([R + 6, 0, 18]) rotate([90, 0, 0]) cylinder(h = 6, r = 2, center = true);

// 卡爪彈簧（簡化用一段斜線）
color([0.5, 0.5, 0.5])
  translate([R + 1, -1, 15]) rotate([0, 30, 0]) cube([2, 2, 6]);
