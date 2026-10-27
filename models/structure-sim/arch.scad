// 拱 Arch — 半圓拱（開口向下）+ 拱上立柱 + 橋面
include <_common.scad>

R_OUT = 38;  // 拱外半徑（拱頂高度）
R_IN  = 28;  // 拱內半徑（拱厚 10）

// 半圓拱（從大半圓減去小半圓得到拱殼；取 y ≥ 0 的上半圓，旋轉後成為開口向下的拱）
color([0.78, 0.69, 0.50])
  rotate([90, 0, 0])
    linear_extrude(height = 14, center = true)
      difference() {
        intersection() {
          circle(r = R_OUT);
          translate([0, 20]) square([80, 40], center = true);
        }
        intersection() {
          circle(r = R_IN);
          translate([0, 20]) square([80, 40], center = true);
        }
      }

// 拱上立柱（spandrel）：把橋面重量傳到拱身，拱身再把力「壓」向兩側橋台
color([0.55, 0.45, 0.35])
  for (x = [-32, -20, 20, 32]) {
    z0 = sqrt(R_OUT * R_OUT - x * x) - 1;  // 拱外緣高度
    translate([x - 1.5, -6, z0]) cube([3, 12, R_OUT - z0]);
  }

// 橋面（拱頂上方平台）
color([0.55, 0.45, 0.35])
  translate([-38, -7, R_OUT]) cube([76, 14, 5]);

// 橋台（兩側支撐底座，接在拱腳正下方，承受拱的垂直力與水平推力）
color([0.45, 0.45, 0.45]) {
  translate([-40, -8, -18]) cube([14, 16, 18]);
  translate([ 26, -8, -18]) cube([14, 16, 18]);
}
