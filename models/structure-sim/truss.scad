// 桁架 Truss — Pratt 型（5 個三角形組成的橋桁架）
include <_common.scad>

color([0.36, 0.42, 0.55]) {
  // 下弦（底）4 段
  for (i = [-2:2]) translate([i * 20 - 1.5, -2.5, -15]) cube([23, 5, 3]);
  // 上弦（頂）3 段
  for (i = [-1.5:1.5]) translate([i * 20 - 1.5, -2.5, 12]) cube([23, 5, 3]);
  // 垂直桿（豎桿）— Pratt 特徵：受壓
  for (x = [-40, -20, 0, 20, 40]) translate([x - 1.5, -2.5, -15]) cube([3, 5, 30]);
  // 斜桿（V 形指向中心，Pratt 特徵：受張）
  for (x = [-40, -20, 0, 20]) {
    translate([x, 0, -15])
      rotate([0, atan2(30, 20), 0])
        translate([-1.5, -2.5, 0]) cube([3, 5, sqrt(20*20 + 30*30)]);
  }
}

// 中央懸吊重物
color([0.86, 0.25, 0.25])
  translate([-7, -7, -28]) cube([14, 14, 10]);
