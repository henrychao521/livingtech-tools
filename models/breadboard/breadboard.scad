// 麵包板 Breadboard + 元件
$fn = 32;

// 麵包板主體（白色）
color([0.92, 0.92, 0.94])
  translate([-55, -38, 0]) cube([110, 76, 8]);

// 電源軌（左右，紅＋藍）
color([0.88, 0.15, 0.15])
  for (y = [-36, 28])
    translate([-52, y, 7]) cube([104, 5, 1.5]);
color([0.15, 0.20, 0.82])
  for (y = [-28, 22])
    translate([-52, y, 7]) cube([104, 5, 1.5]);

// 孔洞（5 欄 × 63 列）
color([0.55, 0.55, 0.58])
  for (col = [0:4]) for (row = [0:62])
    translate([-44 + row*1.4, -18 + col*9, 8]) cylinder(h = 2, r = 0.5);

// 中間分隔槽（深灰）
color([0.42, 0.42, 0.44])
  translate([-52, -3, 7]) cube([104, 6, 2]);

// LED（紅色）
color([0.92, 0.10, 0.10])
  translate([-20, 0, 8]) cylinder(h = 8, r = 2.5);
color([0.92, 0.10, 0.10, 0.5])
  translate([-20, 0, 14]) sphere(r = 3.5);
// LED 引腳
color([0.72, 0.72, 0.75]) {
  translate([-21.5, 0, 0]) cylinder(h = 9, r = 0.5);
  translate([-18.5, 0, 0]) cylinder(h = 9, r = 0.5);
}

// 電阻（棕色）
color([0.55, 0.32, 0.08])
  translate([-5, 0, 8]) rotate([90, 0, 0]) cylinder(h = 14, r = 2.5, center = true);
color([0.88, 0.88, 0.15])  // 色環1
  translate([-5, -4, 8]) rotate([90, 0, 0]) cylinder(h = 1.5, r = 2.6, center = true);
color([0.82, 0.08, 0.08])  // 色環2
  translate([-5, -1, 8]) rotate([90, 0, 0]) cylinder(h = 1.5, r = 2.6, center = true);
// 電阻引腳
color([0.72, 0.72, 0.75]) {
  translate([-5, -8, 0]) cylinder(h = 9, r = 0.5);
  translate([-5, 8, 0]) cylinder(h = 9, r = 0.5);
}

// 跳線（多色）
color([0.85, 0.15, 0.15])
  translate([-40, 0, 9]) rotate([0, 45, 0]) cube([2, 1.5, 20]);
color([0.10, 0.78, 0.20])
  translate([-10, -10, 9]) rotate([0, 30, 90]) cube([2, 1.5, 24]);
color([0.10, 0.20, 0.85])
  translate([5, 10, 9]) rotate([0, -20, 45]) cube([2, 1.5, 18]);

// Arduino Nano（迷你版，深藍 PCB）
color([0.05, 0.15, 0.55])
  translate([15, -8, 8]) cube([18, 16, 1.5]);
color([0.10, 0.10, 0.12])
  translate([17, -4, 9.5]) cube([8, 8, 3]);
// USB
color([0.70, 0.70, 0.73])
  translate([32, 0, 9.5]) cube([6, 5, 4]);
