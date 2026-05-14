// BBC micro:bit v2 — PCB + LED 矩陣 + 按鈕 + 邊緣接頭
$fn = 32;

// PCB（主體，紅色）
color([0.80, 0.10, 0.12])
  translate([-25, -18, 0]) cube([50, 36, 1.5]);

// LED 5×5 矩陣（黃色點陣）
color([0.95, 0.82, 0.10])
  for (x = [0:4]) for (y = [0:4])
    translate([-10 + x*5, 2 + y*5, 1.5]) cylinder(h = 2.5, r = 1.8);

// 按鈕 A（左）
color([0.20, 0.20, 0.25])
  translate([-22, 4, 1.5]) cylinder(h = 4, r = 4);
color([0.85, 0.85, 0.90])
  translate([-22, 4, 5.5]) cylinder(h = 2, r = 3);

// 按鈕 B（右）
color([0.20, 0.20, 0.25])
  translate([22, 4, 1.5]) cylinder(h = 4, r = 4);
color([0.85, 0.85, 0.90])
  translate([22, 4, 5.5]) cylinder(h = 2, r = 3);

// nRF52833 主晶片（藍色 QFN）
color([0.20, 0.40, 0.75])
  translate([-6, -14, 1.5]) cube([12, 10, 2]);

// USB Micro-B 接頭
color([0.70, 0.70, 0.73])
  translate([-4, 14, 1.5]) cube([8, 6, 5]);

// 邊緣金手指 + 大環孔（底部）
color([0.80, 0.72, 0.20]) {
  // P0, P1, P2 大環孔
  for (x = [-18, 0, 18])
    translate([x, -16, 0]) cylinder(h = 1.5, r = 4);
  // 小接頭
  for (x = [-12, -8, 8, 12])
    translate([x-1, -17, 0]) cube([2, 3, 1.5]);
  // GND、3V 環孔
  translate([-24, -16, 0]) cylinder(h = 1.5, r = 3);
  translate([24, -16, 0]) cylinder(h = 1.5, r = 3);
}

// 指南針/加速度計晶片（小方塊）
color([0.15, 0.15, 0.18])
  translate([8, -12, 1.5]) cube([5, 5, 2]);

// 麥克風（正面黑色圓）
color([0.10, 0.10, 0.12])
  translate([-20, -8, 1.5]) cylinder(h = 2, r = 2.5);
