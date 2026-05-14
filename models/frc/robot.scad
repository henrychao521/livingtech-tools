// FRC 競賽機器人 — 底盤 + 升降臂 + 夾爪
$fn = 40;

// 底盤（鋁型材框架）
color([0.55, 0.56, 0.60]) {
  translate([-55, -40, 0]) cube([110, 8, 8]);   // 前
  translate([-55, 32, 0]) cube([110, 8, 8]);    // 後
  translate([-55, -40, 0]) cube([8, 80, 8]);    // 左
  translate([47, -40, 0]) cube([8, 80, 8]);     // 右
  // 橫樑
  translate([-20, -40, 0]) cube([8, 80, 8]);
  translate([12, -40, 0]) cube([8, 80, 8]);
}

// 輪子（六輪驅動，NEO 馬達）
color([0.20, 0.20, 0.22])
  for (x = [-42, -10, 40]) for (y = [-44, 36])
    translate([x, y, 4]) rotate([90, 0, 0]) cylinder(h = 8, r = 14, center = true);
// 輪轂（橘色）
color([0.90, 0.45, 0.05])
  for (x = [-42, -10, 40]) for (y = [-44, 36])
    translate([x, y, 4]) rotate([90, 0, 0]) cylinder(h = 6, r = 6, center = true);

// 機器人主框（碳纖維板，深灰）
color([0.22, 0.22, 0.25])
  translate([-50, -35, 8]) cube([100, 70, 4]);

// 電池（LiFePO4，黑色矩形）
color([0.12, 0.12, 0.14])
  translate([-15, -15, 12]) cube([30, 30, 18]);
color([0.90, 0.08, 0.08])
  translate([-10, 15, 16]) cube([8, 4, 8]);
color([0.08, 0.08, 0.90])
  translate([2, 15, 16]) cube([8, 4, 8]);

// 機器人控制器 RoboRIO（藍色）
color([0.15, 0.35, 0.70])
  translate([15, -30, 12]) cube([32, 24, 12]);

// 升降臂（垂直，橘色 C-channel）
color([0.90, 0.45, 0.05]) {
  translate([40, -5, 12]) cube([8, 10, 80]);
  translate([-48, -5, 12]) cube([8, 10, 80]);
  // 橫樑連接
  translate([-48, -5, 88]) cube([96, 10, 8]);
}

// 夾爪（頂部）
color([0.55, 0.56, 0.60]) {
  translate([-20, -8, 96]) cube([40, 16, 8]);
  // 夾爪臂
  translate([-20, -18, 96]) cube([8, 10, 20]);
  translate([12, -18, 96]) cube([8, 10, 20]);
  translate([-20, 8, 96]) cube([8, 10, 20]);
  translate([12, 8, 96]) cube([8, 10, 20]);
}

// FRC 號碼牌（紅隊）
color([0.88, 0.10, 0.10])
  translate([-50, -35, 12]) cube([100, 3, 30]);
color([0.95, 0.95, 0.95])
  translate([-20, -36, 22]) cube([40, 1, 18]);

// 電纜（橘色 CAN bus）
color([0.88, 0.50, 0.05])
  for (z = [15, 25, 35])
    translate([-48, 0, z]) rotate([0, 90, 0]) cylinder(h = 28, r = 1.5);
