// 曲柄滑塊 Crank-Slider — 圓盤 + 銷 + 連桿 + 滑塊 + 滑軌
include <_common.scad>

// 機架（底板）
color([0.28, 0.34, 0.43])
  translate([-50, -3, -12]) cube([120, 6, 4]);

// 驅動圓盤
color([0.08, 0.71, 0.65])
  translate([-30, 0, 0]) rotate([90, 0, 0]) cylinder(h = 6, r = 18, center = true);

// 圓盤中心軸
color([0.06, 0.46, 0.42])
  translate([-30, 0, 0]) rotate([90, 0, 0]) cylinder(h = 10, r = 4, center = true);

// 曲柄銷（紅色，在圓盤右側偏置 = 死點位置）
color([0.86, 0.15, 0.15])
  translate([-15, 0, 0]) rotate([90, 0, 0]) cylinder(h = 8, r = 3, center = true);

// 連桿（從銷連到滑塊）
color([0.06, 0.46, 0.42])
  translate([10, -1.5, -2]) cube([35, 3, 4]);

// 滑塊
color([0.08, 0.71, 0.65])
  translate([45, -7, -7]) cube([14, 14, 14]);

// 滑軌（虛擬延伸標示，灰底）
color([0.4, 0.45, 0.5])
  translate([20, -10, -12]) cube([55, 20, 2]);
