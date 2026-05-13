// 凸輪 Cam — 偏心橢圓凸輪 + 從動件 + 導桿
include <_common.scad>

// 凸輪（偏心橢圓）
color([0.08, 0.71, 0.65])
  rotate([90, 0, 0]) scale([1, 0.65, 1])
    cylinder(h = 8, r = 24, center = true);

// 中心軸
color([0.06, 0.46, 0.42])
  rotate([90, 0, 0]) cylinder(h = 12, r = 3.5, center = true);

// 從動件（圓盤底 + 桿）
color([0.86, 0.4, 0.2]) {
  // 底部圓盤（壓在凸輪上）
  translate([0, 0, 18]) rotate([90, 0, 0]) cylinder(h = 6, r = 7, center = true);
  // 直桿
  translate([-3, -3, 22]) cube([6, 6, 28]);
}

// 導向支架
color([0.28, 0.34, 0.43])
  translate([-10, -5, 38]) cube([20, 10, 4]);
