// 手電鑽 Cordless Drill — 槍型機身 + 電池 + 夾頭 + 鑽頭
include <_common.scad>

// 馬達殼（黃色主體）
color([0.95, 0.62, 0.05])
  hull() {
    translate([-30, -15, 40]) cube([80, 30, 1]);
    translate([-28, -13, 150]) cube([76, 26, 1]);
  }

// 馬達後端黑色蓋
color([0.18, 0.18, 0.20])
  translate([-30, -15, 140]) cube([80, 30, 15]);

// 散熱孔
color([0.08, 0.08, 0.10])
  for (i = [0:4])
    translate([-15 + i*14, -16, 55]) cube([3, 2, 70]);

// 品牌標籤
color([0.08, 0.08, 0.10])
  translate([-28, 15, 90]) cube([76, 2, 16]);

// 手柄（握把）
color([0.92, 0.58, 0.04])
  hull() {
    translate([-10, -13, 0]) cube([20, 26, 1]);
    translate([-12, -14, 40]) cube([24, 28, 1]);
  }

// 防滑橡膠紋
color([0.12, 0.12, 0.15])
  for (z = [10, 20, 30])
    translate([-11, -14, z]) cube([22, 1, 2]);

// 扳機
color([0.12, 0.12, 0.15])
  translate([-5, 13, 15]) cube([10, 6, 18]);

// 正反轉撥桿
color([0.10, 0.10, 0.12])
  translate([-12, -2, 35]) cube([24, 4, 5]);

// 電池組（底部）
color([0.10, 0.10, 0.12])
  translate([-18, -15, -40]) cube([36, 30, 42]);
color([0.95, 0.62, 0.05])
  translate([-16, -13, -42]) cube([32, 26, 5]);
// 電量指示燈
color([0.12, 0.85, 0.30])
  for (i = [0:2])
    translate([-10 + i*7, -14, -30]) cube([5, 2, 8]);

// 夾頭（keyless chuck）
color([0.78, 0.78, 0.80])
  translate([0, 0, 155]) cylinder(h = 28, r = 13);
color([0.55, 0.55, 0.58])
  translate([0, 0, 183]) cylinder(h = 8, r = 10);

// 扭力調整環
color([0.08, 0.08, 0.10]) {
  translate([0, 0, 145]) difference() {
    cylinder(h = 12, r = 16);
    translate([0, 0, -1]) cylinder(h = 14, r = 12);
  }
}
// 刻度點
color([0.95, 0.62, 0.05])
  for (a = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330])
    rotate([0, 0, a]) translate([14, 0, 148]) cylinder(h = 3, r = 1.5);

// HSS 鑽頭
color([0.68, 0.70, 0.72])
  translate([0, 0, 191]) cylinder(h = 55, r1 = 3.5, r2 = 2.5);
// 鑽頭刃溝（螺旋示意）
color([0.45, 0.45, 0.50])
  for (a = [0, 180])
    rotate([0, 0, a]) translate([2.8, 0, 191]) cylinder(h = 50, r = 1);
// 尖頭
color([0.55, 0.55, 0.60])
  translate([0, 0, 246]) cylinder(h = 10, r1 = 2.5, r2 = 0);

// LED 燈（在夾頭前方底部）
color([1.0, 0.95, 0.7, 0.9])
  translate([10, 10, 155]) sphere(r = 4);
