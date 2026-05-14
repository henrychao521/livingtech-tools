// 化石燃料電廠 Fossil Fuel Plant — 冷卻塔 + 煙囪 + 廠房
$fn = 48;

// 地面基座
color([0.55, 0.54, 0.52])
  translate([-80, -50, 0]) cube([160, 100, 5]);

// 主廠房（矩形灰色建物）
color([0.52, 0.52, 0.55])
  translate([-50, -30, 5]) cube([80, 60, 50]);

// 廠房屋頂設備
color([0.45, 0.45, 0.48])
  translate([-40, -20, 55]) cube([60, 40, 12]);

// 煙囪（圓形高柱）
color([0.62, 0.62, 0.65])
  translate([40, 10, 5]) cylinder(h = 110, r1 = 8, r2 = 5);

// 煙霧（白色半透明）
color([0.92, 0.92, 0.95, 0.6]) {
  translate([40, 10, 115]) cylinder(h = 20, r1 = 5, r2 = 14);
  translate([40, 10, 135]) cylinder(h = 30, r1 = 14, r2 = 25);
}

// 冷卻塔（雙曲線形）
color([0.68, 0.68, 0.70])
  translate([-70, 0, 5]) {
    cylinder(h = 70, r1 = 30, r2 = 12);
    translate([0, 0, 70]) cylinder(h = 10, r1 = 12, r2 = 14);
  }

// 輸電線塔
color([0.45, 0.45, 0.48]) {
  translate([60, -20, 5]) {
    cylinder(h = 50, r = 1.5);
    translate([-12, 0, 40]) cube([24, 2, 2]);
    translate([-10, 0, 30]) cube([20, 2, 2]);
  }
}

// 圍牆
color([0.48, 0.48, 0.50])
  difference() {
    translate([-82, -52, 0]) cube([164, 104, 8]);
    translate([-78, -48, -1]) cube([156, 96, 10]);
  }
