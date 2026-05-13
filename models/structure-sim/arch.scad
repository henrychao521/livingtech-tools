// 拱 Arch — 半圓拱 + 橋面
include <_common.scad>

// 半圓拱（用 difference 從大半圓減去小半圓得到拱殼）
color([0.78, 0.69, 0.50])
  rotate([90, 0, 0])
    linear_extrude(height = 14, center = true)
      difference() {
        translate([0, 0]) union() {
          // 外半圓
          intersection() {
            circle(r = 38);
            translate([0, -20]) square([80, 40], center = true);
          }
        }
        // 內半圓（鏤空）
        intersection() {
          circle(r = 28);
          translate([0, -20]) square([80, 40], center = true);
        }
      }

// 橋面（拱頂上方平台）
color([0.55, 0.45, 0.35])
  translate([-38, -7, 38]) cube([76, 14, 5]);

// 橋墩（兩側支撐底座）
color([0.45, 0.45, 0.45]) {
  translate([-44, -8, -18]) cube([8, 16, 18]);
  translate([36, -8, -18]) cube([8, 16, 18]);
}
