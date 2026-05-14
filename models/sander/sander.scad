// 帶盤式砂磨機 Belt & Disc Sander — 橫向帶式 + 直立圓盤
include <_common.scad>

// 機台底座
color([0.28, 0.28, 0.30])
  translate([-80, -45, 0]) cube([200, 90, 18]);

// 馬達殼（後方）
color([0.22, 0.24, 0.26])
  translate([-80, -38, 18]) cube([70, 76, 65]);
color([0.18, 0.20, 0.22])
  translate([-45, -38, 83]) cylinder(h = 12, r = 38);

// 帶式砂磨機台面（水平）
color([0.35, 0.35, 0.38])
  translate([-8, -40, 40]) cube([90, 80, 10]);

// 前滾輪
color([0.55, 0.55, 0.58])
  translate([70, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 16, center = true);

// 後滾輪
color([0.55, 0.55, 0.58])
  translate([0, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 16, center = true);

// 砂帶（環形，米黃色）
color([0.88, 0.78, 0.55])
  hull() {
    translate([0, 0, 50]) rotate([90, 0, 0]) cylinder(h = 56, r = 17, center = true);
    translate([70, 0, 50]) rotate([90, 0, 0]) cylinder(h = 56, r = 17, center = true);
  }

// 靠尺（後方）
color([0.45, 0.45, 0.48])
  translate([-6, -30, 68]) cube([78, 2, 30]);

// 砂帶張力調整旋鈕（側面）
color([0.40, 0.42, 0.45])
  translate([35, -42, 50]) rotate([90, 0, 0]) cylinder(h = 8, r = 8);

// 盤式砂磨機（直立圓盤，右側）
color([0.35, 0.35, 0.38])
  translate([120, 0, 0]) cylinder(h = 80, r = 10); // 轉軸

// 圓盤背板
color([0.30, 0.30, 0.33])
  translate([120, 0, 80]) cylinder(h = 5, r = 70);

// 砂盤（正面，紅棕色砂紙）
color([0.65, 0.35, 0.20])
  translate([120, 0, 85]) cylinder(h = 3, r = 68);

// 砂盤靠尺（水平）
color([0.45, 0.45, 0.48])
  translate([55, -38, 18]) cube([65, 76, 8]);

// 集塵口（左側）
color([0.28, 0.28, 0.30])
  translate([-82, -15, 30]) rotate([0, 90, 0]) cylinder(h = 15, r = 12);

// 開關（綠色 ON / 紅色 OFF）
color([0.08, 0.70, 0.18])
  translate([-40, -44, 38]) cylinder(h = 10, r = 8);
color([0.85, 0.08, 0.08])
  translate([-60, -44, 38]) cylinder(h = 10, r = 8);
