// 內燃機 ICE Engine — 直列四缸引擎示意
$fn = 40;

// 引擎缸體（灰鑄鐵）
color([0.42, 0.42, 0.45])
  translate([-30, -20, 0]) cube([60, 40, 50]);

// 四個汽缸頭
color([0.38, 0.38, 0.40])
  for (x = [-20, -6, 8, 22])
    translate([x-6, -18, 50]) cube([12, 36, 20]);

// 活塞（四個）
color([0.68, 0.70, 0.72])
  for (x = [-20, -6, 8, 22])
    translate([x, 0, 15]) cylinder(h = 20, r = 5.5);

// 曲軸（橫向）
color([0.55, 0.56, 0.58])
  translate([-34, 0, 5]) rotate([0, 90, 0]) cylinder(h = 68, r = 4);

// 飛輪
color([0.35, 0.35, 0.38])
  translate([34, 0, 10]) rotate([0, 90, 0]) {
    cylinder(h = 8, r = 20);
    cylinder(h = 10, r = 6);
  }

// 正時蓋（左側）
color([0.30, 0.30, 0.33])
  translate([-36, -22, 10]) cube([8, 44, 50]);

// 進氣歧管（右側進氣，紫色）
color([0.40, 0.18, 0.55])
  translate([30, -12, 40]) cube([22, 24, 15]);
color([0.38, 0.16, 0.50])
  for (x = [-18, -6, 6, 18])
    translate([30, x, 55]) rotate([0, 90, 0]) cylinder(h = 18, r = 3);

// 排氣管（左側，橘色）
color([0.70, 0.30, 0.08])
  translate([-54, -12, 30]) cube([20, 24, 10]);
color([0.65, 0.28, 0.06])
  for (x = [-8, 0, 8])
    translate([-54, x, 30]) rotate([0, 90, 0]) cylinder(h = 16, r = 2.5);

// 機油底殼（底部，黑色）
color([0.12, 0.12, 0.14])
  translate([-32, -22, -15]) cube([64, 44, 16]);

// 冷卻水管
color([0.10, 0.45, 0.75])
  translate([-22, 20, 55]) cube([44, 4, 10]);
