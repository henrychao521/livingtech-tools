$fn = 48;
// 手電鑽 Cordless Drill — 槍型機身 + 電池 + 夾頭 + 鑽頭
// 座標：+X 為鑽頭方向（前）、+Z 向上；馬達殼水平、握把向下、電池在握把底
// （2026-10 修正：原版把握把、馬達殼、夾頭全部疊在同一條 Z 軸上，變成直棒型，不是槍型）
include <_common.scad>

// ── 馬達殼（黃色主體，水平放置、略呈前細後粗）
color([0.95, 0.62, 0.05])
  hull() {
    translate([-90, 0, 0]) rotate([0, 90, 0]) cylinder(h = 1, r = 32);  // 後端
    translate([ 39, 0, 0]) rotate([0, 90, 0]) cylinder(h = 1, r = 28);  // 前端（接扭力環）
  }

// 馬達後端黑色蓋
color([0.18, 0.18, 0.20])
  translate([-100, 0, 0]) rotate([0, 90, 0]) cylinder(h = 11, r = 30);

// 散熱孔（機身兩側）
color([0.08, 0.08, 0.10])
  for (i = [0:4]) {
    translate([-80 + i*12, -33, -20]) cube([3, 3, 40]);
    translate([-80 + i*12,  30, -20]) cube([3, 3, 40]);
  }

// 品牌標籤（機身頂部黑色條）
color([0.08, 0.08, 0.10])
  intersection() {
    translate([-70, 0, 0]) rotate([0, 90, 0]) cylinder(h = 70, r = 32.5);
    translate([-70, -20, 20]) cube([70, 40, 20]);
  }

// ── 握把（在機身後半段下方，略向後傾）
// z 由 -28（接機身）到 -115（接電池）；pad 用來做凸出的防滑環
module grip_slice(z, pad = 0) {
  t = (-28 - z) / 87;
  translate([-48 - 14*t - pad, -16 - t - pad, z])
    cube([44 - 4*t + 2*pad, 32 + 2*t + 2*pad, 2]);
}
color([0.92, 0.58, 0.04])
  hull() { grip_slice(-28); grip_slice(-115); }

// 防滑橡膠環
color([0.12, 0.12, 0.15])
  for (z = [-50, -65, -80, -95]) grip_slice(z, 0.8);

// 扳機（握把前緣、機身正下方，食指位置）
color([0.12, 0.12, 0.15])
  translate([-14, -8, -62]) cube([14, 16, 26]);

// 正反轉撥桿（扳機正上方、貫穿握把，兩側各凸出）
color([0.10, 0.10, 0.12])
  translate([-24, -22, -37]) cube([12, 44, 5]);

// ── 電池組（握把底部，前後都比握把寬）
color([0.10, 0.10, 0.12])
  translate([-85, -24, -150]) cube([80, 48, 36]);
color([0.95, 0.62, 0.05])
  translate([-83, -22, -152]) cube([76, 44, 3]);
// 電量指示燈（電池側面）
color([0.12, 0.85, 0.30])
  for (i = [0:2])
    translate([-30 + i*8, -25, -140]) cube([5, 2, 8]);

// ── 扭力調整環（機身前端，黑色外環 + 黃色內芯）
color([0.08, 0.08, 0.10])
  translate([40, 0, 0]) rotate([0, 90, 0]) difference() {
    cylinder(h = 14, r = 27);
    translate([0, 0, -1]) cylinder(h = 16, r = 20);
  }
color([0.95, 0.62, 0.05])
  translate([40, 0, 0]) rotate([0, 90, 0]) cylinder(h = 14, r = 20);
// 刻度點（繞 X 軸一圈）
color([0.95, 0.62, 0.05])
  for (a = [0 : 30 : 330])
    rotate([a, 0, 0]) translate([47, 0, 26.3]) sphere(r = 1.6);

// ── 齒輪箱頸部 + 夾頭（keyless chuck）
color([0.55, 0.55, 0.58])
  translate([54, 0, 0]) rotate([0, 90, 0]) cylinder(h = 8, r1 = 22, r2 = 16);
color([0.78, 0.78, 0.80])
  translate([62, 0, 0]) rotate([0, 90, 0]) cylinder(h = 36, r = 15);
color([0.68, 0.68, 0.70])
  translate([98, 0, 0]) rotate([0, 90, 0]) cylinder(h = 10, r1 = 15, r2 = 10);
// 夾頭滾花環
color([0.45, 0.45, 0.50])
  for (x = [66, 74, 82, 90])
    translate([x, 0, 0]) rotate([0, 90, 0]) cylinder(h = 1.5, r = 15.5);

// ── HSS 鑽頭（沿 +X 伸出）
color([0.68, 0.70, 0.72])
  translate([108, 0, 0]) rotate([0, 90, 0]) cylinder(h = 55, r = 3.5);
// 鑽頭刃溝（螺旋示意）
color([0.45, 0.45, 0.50])
  for (a = [0, 180])
    rotate([a, 0, 0]) translate([110, 0, 2.8]) rotate([0, 90, 0]) cylinder(h = 50, r = 1);
// 尖頭
color([0.55, 0.55, 0.60])
  translate([163, 0, 0]) rotate([0, 90, 0]) cylinder(h = 8, r1 = 3.5, r2 = 0);

// LED 工作燈（機身前端下方、扳機正上方，照向鑽頭）
color([1.0, 0.95, 0.7, 0.9])
  translate([41, 0, -20]) sphere(r = 4);
