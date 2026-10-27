// Arduino UNO — PCB + 接頭 + 晶片
$fn = 32;

// PCB 板（藍色）
color([0.05, 0.25, 0.65])
  translate([-27, -35, 0]) cube([54, 70, 2]);

// PCB 輪廓裁角（左下角）
color([0.05, 0.25, 0.65])
  translate([-27, 30, 0]) cube([10, 6, 2]);

// 主晶片 ATmega328P（黑色 DIP）
color([0.12, 0.12, 0.14])
  translate([-6, -8, 2]) cube([12, 18, 4]);
// 晶片接腳
color([0.70, 0.70, 0.72])
  for (i = [0:6])
    translate([-8, -7 + i*2.5, 0]) cube([2, 1, 2]);
color([0.70, 0.70, 0.72])
  for (i = [0:6])
    translate([6, -7 + i*2.5, 0]) cube([2, 1, 2]);

// USB Type-B 接口（銀灰）
color([0.75, 0.75, 0.78])
  translate([-7, 28, 2]) cube([14, 12, 10]);
color([0.60, 0.60, 0.65])
  translate([-5, 38, 4]) cube([10, 4, 6]);

// 電源 DC 插座（黑色圓筒）
color([0.12, 0.12, 0.14])
  translate([-24, 26, 2]) cylinder(h = 10, r = 6);

// 電晶體（晶振）
color([0.75, 0.76, 0.78])
  translate([10, -4, 2]) cube([5, 8, 5]);

// 數位 I/O 接頭（黑色排針，沿長邊、與 USB 邊垂直；D0–D13、GND、AREF 共 16 pin）
color([0.12, 0.12, 0.14])
  translate([21, -31, 2]) cube([5, 41, 6]);
color([0.85, 0.85, 0.88])
  for (i = [0:15])
    translate([23.5, -29 + i*2.5, 7]) cylinder(h = 8, r = 1);

// 電源接頭（另一長邊、靠 USB／DC 端；IOREF、RESET、3.3V、5V、GND、GND、Vin）
color([0.12, 0.12, 0.14])
  translate([-26, -2, 2]) cube([5, 20, 6]);
color([0.85, 0.85, 0.88])
  for (i = [0:7])
    translate([-23.5, 0 + i*2.5, 7]) cylinder(h = 8, r = 1);

// 類比輸入接頭（同一長邊、遠離 USB 端；A0–A5）
color([0.12, 0.12, 0.14])
  translate([-26, -31, 2]) cube([5, 16, 6]);
color([0.85, 0.85, 0.88])
  for (i = [0:5])
    translate([-23.5, -29 + i*2.5, 7]) cylinder(h = 8, r = 1);

// 電容（圓柱）
color([0.10, 0.50, 0.20])
  translate([16, 10, 2]) cylinder(h = 12, r = 4);
color([0.10, 0.50, 0.20])
  translate([16, -2, 2]) cylinder(h = 8, r = 3);

// 電源 LED（紅）
color([0.90, 0.10, 0.10])
  translate([-16, 16, 2]) cylinder(h = 4, r = 1.5);

// TX/RX LED（綠）
color([0.10, 0.85, 0.20])
  translate([-12, 16, 2]) cylinder(h = 4, r = 1.5);
color([0.10, 0.85, 0.20])
  translate([-8, 16, 2]) cylinder(h = 4, r = 1.5);

// 重置按鈕
color([0.82, 0.08, 0.08])
  translate([-16, 4, 2]) cube([6, 6, 4]);

// 電壓穩壓器
color([0.15, 0.15, 0.18])
  translate([18, 16, 2]) cube([8, 6, 6]);
