// 液壓系統 Hydraulic System — 油壓缸 + 幫浦 + 油箱
$fn = 40;

// 油箱（矩形，藍灰）
color([0.25, 0.35, 0.52])
  translate([-50, -25, 0]) cube([40, 50, 30]);
// 油箱加油口
color([0.55, 0.56, 0.58])
  translate([-38, 0, 30]) cylinder(h = 8, r = 5);
// 油位視窗（透明）
color([0.40, 0.60, 0.80, 0.6])
  translate([-49, -10, 5]) cube([2, 20, 18]);

// 液壓幫浦（圓柱，灰色）
color([0.45, 0.46, 0.48])
  translate([-8, 0, 5]) cylinder(h = 30, r = 18);
color([0.38, 0.39, 0.42])
  translate([-8, 0, 35]) cylinder(h = 8, r = 20);
// 幫浦入口
color([0.55, 0.56, 0.58])
  translate([-8, 18, 15]) rotate([90, 0, 0]) cylinder(h = 20, r = 4);
// 幫浦出口（高壓）
color([0.70, 0.52, 0.10])
  translate([-8, -18, 15]) rotate([90, 0, 0]) cylinder(h = 8, r = 4);

// 高壓油管
color([0.70, 0.52, 0.10])
  translate([-8, -24, 18]) rotate([0, 90, 0]) cylinder(h = 30, r = 3);
color([0.70, 0.52, 0.10])
  translate([22, -24, 8]) cube([3, 3, 12]);

// 油壓缸（主要執行元件）
color([0.55, 0.56, 0.58])
  translate([25, -12, 0]) cube([60, 24, 20]);

// 活塞桿（伸出）
color([0.75, 0.76, 0.78])
  translate([85, 0, 5]) rotate([0, 90, 0]) cylinder(h = 40, r = 6);

// 活塞端蓋
color([0.42, 0.42, 0.45]) {
  translate([25, -14, -2]) cube([12, 28, 24]);
  translate([82, -14, -2]) cube([5, 28, 24]);
}

// 回油管（低壓，藍色）
color([0.15, 0.38, 0.72])
  translate([28, 14, 10]) rotate([0, -90, 90]) cylinder(h = 80, r = 2.5);

// 安全閥
color([0.85, 0.08, 0.08])
  translate([5, -28, 18]) cylinder(h = 12, r = 5);
color([0.70, 0.06, 0.06])
  translate([5, -28, 30]) cylinder(h = 6, r = 5);
