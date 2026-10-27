// 帶盤式砂磨機 Belt & Disc Sander — 橫向帶式 + 直立圓盤
include <_common.scad>

// 機台底座（右側延長，承載直立砂盤與其工作台）
color([0.28, 0.28, 0.30])
  translate([-80, -45, 0]) cube([250, 90, 18]);

// 馬達殼（後方）
color([0.22, 0.24, 0.26])
  translate([-80, -38, 18]) cube([70, 76, 65]);
color([0.18, 0.20, 0.22])
  translate([-45, -38, 83]) cylinder(h = 12, r = 38);

// 滾輪支架（連接馬達殼與兩滾輪，位於砂帶下段內側）
color([0.35, 0.35, 0.38])
  translate([-12, -12, 18]) cube([87, 24, 15]);

// 前滾輪 / 後滾輪（在砂帶內側）
color([0.55, 0.55, 0.58]) {
  translate([70, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 15, center = true);
  translate([0, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 15, center = true);
}

// 砂帶（中空環形帶，米黃色；上段頂面 z≈67 為磨削面）
color([0.88, 0.78, 0.55])
  difference() {
    hull() {
      translate([0, 0, 50]) rotate([90, 0, 0]) cylinder(h = 56, r = 17, center = true);
      translate([70, 0, 50]) rotate([90, 0, 0]) cylinder(h = 56, r = 17, center = true);
    }
    hull() {
      translate([0, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 15.5, center = true);
      translate([70, 0, 50]) rotate([90, 0, 0]) cylinder(h = 60, r = 15.5, center = true);
    }
  }

// 壓板（在砂帶上段「背面」托住砂帶，使磨削面平整）
color([0.35, 0.35, 0.38])
  translate([0, -28, 58]) cube([70, 56, 7]);

// 靠尺（砂帶前緣，與砂帶走向平行、高於磨削面）
color([0.45, 0.45, 0.48])
  translate([-6, -30, 68]) cube([78, 2, 30]);

// 砂帶張力調整旋鈕（側面）
color([0.40, 0.42, 0.45])
  translate([35, -42, 50]) rotate([90, 0, 0]) cylinder(h = 8, r = 8);

// 盤式砂磨機（直立圓盤，右側，盤面朝 +X 面向操作者）
// 立柱 + 水平轉軸
color([0.30, 0.30, 0.33])
  translate([110, -12, 18]) cube([24, 24, 60]);
color([0.35, 0.35, 0.38])
  translate([120, 0, 75]) rotate([0, 90, 0]) cylinder(h = 14, r = 8);

// 圓盤背板（直立）
color([0.30, 0.30, 0.33])
  translate([134, 0, 75]) rotate([0, 90, 0]) cylinder(h = 5, r = 50);

// 砂盤（正面，紅棕色砂紙）
color([0.65, 0.35, 0.20])
  translate([139, 0, 75]) rotate([0, 90, 0]) cylinder(h = 3, r = 48);

// 砂盤工作台（水平，貼在砂盤正前方、略低於盤心；工件放在向下旋轉的那一側）
color([0.45, 0.45, 0.48])
  translate([142, -40, 66]) cube([28, 80, 6]);
color([0.30, 0.30, 0.33])
  translate([150, -8, 18]) cube([16, 16, 48]);

// 集塵口（左側，自馬達殼伸出）
color([0.28, 0.28, 0.30])
  translate([-95, -15, 30]) rotate([0, 90, 0]) cylinder(h = 16, r = 12);

// 開關（綠色 ON / 紅色 OFF）
color([0.08, 0.70, 0.18])
  translate([-40, -44, 38]) cylinder(h = 10, r = 8);
color([0.85, 0.08, 0.08])
  translate([-60, -44, 38]) cylinder(h = 10, r = 8);
