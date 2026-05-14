// 電動馬達 + 電池包 EV Powertrain
$fn = 48;

// 電池包（扁平矩形，藍灰）
color([0.20, 0.28, 0.45])
  translate([-70, -35, -10]) cube([140, 70, 20]);
// 電池模組格線
color([0.15, 0.22, 0.38])
  for (x = [0:5])
    translate([-68 + x*23, -33, -9]) cube([21, 66, 18]);
// 電池接頭
color([0.80, 0.72, 0.20])
  translate([-65, 35, 0]) cube([130, 4, 4]);

// BLDC 馬達（圓柱形，橘色）
color([0.90, 0.45, 0.05])
  translate([0, 0, 10]) cylinder(h = 60, r = 35);
// 馬達散熱鰭片
color([0.80, 0.38, 0.04])
  for (a = [0:30:360])
    rotate([0, 0, a]) translate([33, -2, 10]) cube([4, 4, 60]);

// 馬達前端蓋
color([0.75, 0.76, 0.78])
  translate([0, 0, 70]) cylinder(h = 8, r = 36);

// 輸出軸
color([0.65, 0.66, 0.68])
  translate([0, 0, 78]) cylinder(h = 30, r = 8);

// 電機控制器 PCU（黑色盒子）
color([0.15, 0.15, 0.18])
  translate([-50, 40, 10]) cube([50, 30, 40]);
// PCU 接線
color([0.80, 0.08, 0.10])
  translate([-45, 70, 30]) cylinder(h = 12, r = 4);
color([0.10, 0.75, 0.15])
  translate([-35, 70, 30]) cylinder(h = 12, r = 4);
color([0.10, 0.10, 0.75])
  translate([-25, 70, 30]) cylinder(h = 12, r = 4);

// 三相電纜（連接馬達與 PCU）
color([0.12, 0.12, 0.14])
  for (dy = [-4, 0, 4])
    translate([-48, dy, 30]) rotate([0, 90, 0]) cylinder(h = 28, r = 2);
