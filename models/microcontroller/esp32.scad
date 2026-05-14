// ESP32 DevKit — 窄型開發板 + WiFi/藍牙天線
$fn = 32;

// PCB（深藍色窄長板）
color([0.05, 0.12, 0.45])
  translate([-14, -24, 0]) cube([28, 48, 1.5]);

// ESP32 主模組（黑色金屬屏蔽罩）
color([0.18, 0.18, 0.20])
  translate([-9, 4, 1.5]) cube([18, 14, 3]);
// 天線缺口（白色正面）
color([0.88, 0.88, 0.90])
  translate([-4, 16, 1.5]) cube([8, 6, 2]);

// USB Micro-B 接頭
color([0.72, 0.72, 0.75])
  translate([-4, 20, 1.5]) cube([8, 6, 5]);

// 重置按鈕（EN）
color([0.50, 0.08, 0.08])
  translate([-12, 14, 1.5]) cylinder(h = 4, r = 2.5);

// BOOT 按鈕
color([0.50, 0.08, 0.08])
  translate([12, 14, 1.5]) cylinder(h = 4, r = 2.5);

// CP2102 USB 轉串口晶片
color([0.15, 0.15, 0.18])
  translate([-5, -4, 1.5]) cube([10, 8, 2]);

// 電壓穩壓器
color([0.15, 0.15, 0.18])
  translate([-5, -14, 1.5]) cube([8, 6, 4]);

// 電容
color([0.10, 0.50, 0.20]) {
  translate([8, -10, 1.5]) cylinder(h = 6, r = 2);
  translate([8, -18, 1.5]) cylinder(h = 4, r = 1.5);
}

// 左側接頭（19 pin）
color([0.12, 0.12, 0.14])
  translate([-15, -23, 1.5]) cube([3, 46, 5]);
color([0.82, 0.82, 0.85])
  for (i = [0:18])
    translate([-15, -22 + i*2.5, 6.5]) cylinder(h = 6, r = 0.6);

// 右側接頭（19 pin）
color([0.12, 0.12, 0.14])
  translate([12, -23, 1.5]) cube([3, 46, 5]);
color([0.82, 0.82, 0.85])
  for (i = [0:18])
    translate([14.5, -22 + i*2.5, 6.5]) cylinder(h = 6, r = 0.6);

// 電源 LED（藍色）
color([0.10, 0.30, 0.90])
  translate([-11, -18, 1.5]) cylinder(h = 3, r = 1.2);
