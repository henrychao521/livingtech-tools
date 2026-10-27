// ESP32 DevKit — 窄型開發板 + WiFi/藍牙天線
$fn = 32;

// PCB（深藍色窄長板）
color([0.05, 0.12, 0.45])
  translate([-14, -24, 0]) cube([28, 48, 1.5]);

// ESP32 主模組（黑色金屬屏蔽罩）— 位在天線端
color([0.18, 0.18, 0.20])
  translate([-9, -20, 1.5]) cube([18, 14, 3]);
// PCB 天線區（白色，模組尾端、略伸出板緣）
color([0.88, 0.88, 0.90])
  translate([-4, -25, 1.5]) cube([8, 6, 2]);

// USB Micro-B 接頭（與天線相對的另一端）
color([0.72, 0.72, 0.75])
  translate([-4, 19, 1.5]) cube([8, 6, 5]);

// EN（重置）按鈕 — USB 端左側
color([0.50, 0.08, 0.08])
  translate([-9, 14, 1.5]) cylinder(h = 4, r = 2.5);

// BOOT 按鈕 — USB 端右側
color([0.50, 0.08, 0.08])
  translate([9, 14, 1.5]) cylinder(h = 4, r = 2.5);

// CP2102 USB 轉串口晶片（靠 USB 端）
color([0.15, 0.15, 0.18])
  translate([-5, 4, 1.5]) cube([10, 8, 2]);

// 電壓穩壓器（AMS1117，板中段）
color([0.15, 0.15, 0.18])
  translate([-5, -4, 1.5]) cube([8, 6, 4]);

// 電容
color([0.10, 0.50, 0.20]) {
  translate([8, 0, 1.5]) cylinder(h = 6, r = 2);
  translate([8, 8, 1.5]) cylinder(h = 4, r = 1.5);
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
  translate([-9, 2, 1.5]) cylinder(h = 3, r = 1.2);
