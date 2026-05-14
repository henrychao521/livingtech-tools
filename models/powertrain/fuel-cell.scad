// 燃料電池 Fuel Cell Stack + 氫氣瓶
$fn = 40;

// 燃料電池堆（PEM stack，矩形層疊）
color([0.20, 0.35, 0.60])
  translate([-25, -20, 0]) cube([50, 40, 60]);
// 電池層分格
color([0.15, 0.28, 0.50])
  for (z = [0:5:60])
    translate([-26, -21, z]) cube([52, 42, 1]);

// 端板（兩端，灰色）
color([0.55, 0.56, 0.58]) {
  translate([-27, -22, -5]) cube([54, 44, 6]);
  translate([-27, -22, 60]) cube([54, 44, 6]);
}

// 正負極接線
color([0.85, 0.08, 0.08])
  translate([-10, 22, 65]) cylinder(h = 14, r = 5);
color([0.12, 0.12, 0.14])
  translate([10, 22, 65]) cylinder(h = 14, r = 5);

// 氫氣輸入管（藍色）
color([0.10, 0.45, 0.80])
  translate([25, 0, 20]) rotate([0, 90, 0]) cylinder(h = 20, r = 3);

// 空氣（氧氣）輸入口
color([0.55, 0.56, 0.58])
  translate([25, -10, 40]) rotate([0, 90, 0]) cylinder(h = 20, r = 4);

// 水輸出口
color([0.30, 0.60, 0.85])
  translate([25, 10, 10]) rotate([0, 90, 0]) cylinder(h = 20, r = 2.5);

// 氫氣瓶（右側）
color([0.48, 0.50, 0.55])
  translate([60, 0, 20]) {
    cylinder(h = 80, r = 14);
    translate([0, 0, 80]) sphere(r = 14);
    translate([0, 0, -15]) sphere(r = 14);
  }
// 氫氣瓶閥門
color([0.72, 0.73, 0.75])
  translate([60, 0, 100]) {
    cylinder(h = 12, r = 6);
    rotate([90, 0, 0]) translate([0, 0, -8]) cylinder(h = 16, r = 3);
  }

// 連接管線
color([0.10, 0.45, 0.80])
  translate([46, 0, 50]) rotate([0, 90, 0]) cylinder(h = 16, r = 2);
