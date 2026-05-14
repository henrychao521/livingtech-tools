// 鑽床 Drill Press — 立柱 + 工作台 + 頭部 + 主軸
include <_common.scad>

// 基座（鑄鐵底座）
color([0.28, 0.28, 0.30])
  translate([-70, -50, 0]) cube([140, 100, 18]);
// 底座加強筋
color([0.22, 0.22, 0.24])
  for (x = [-40, 0, 40])
    translate([x-3, -48, 4]) cube([6, 96, 14]);

// 立柱（圓柱形）
color([0.35, 0.35, 0.38])
  translate([0, 0, 18]) cylinder(h = 500, r = 18);

// 工作台（可調高度）
color([0.40, 0.40, 0.43])
  translate([-80, -55, 200]) cube([160, 110, 16]);
// T 槽（工作台面）
color([0.30, 0.30, 0.33])
  for (x = [-50, -25, 0, 25, 50])
    translate([x-2, -54, 214]) cube([4, 108, 4]);
// 工作台固定環
color([0.32, 0.32, 0.35])
  translate([0, 0, 200]) cylinder(h = 20, r = 28);

// 頭部機殼
color([0.30, 0.32, 0.35])
  translate([-55, -40, 430]) cube([110, 80, 80]);
color([0.25, 0.27, 0.30])
  translate([0, 0, 430]) cylinder(h = 80, r = 52);

// 馬達殼（圓形）
color([0.22, 0.22, 0.25])
  translate([0, -42, 450]) cylinder(h = 60, r = 35);

// 皮帶保護蓋
color([0.38, 0.40, 0.43])
  translate([-30, -42, 510]) cube([60, 70, 10]);

// 主軸（從頭部向下）
color([0.70, 0.72, 0.75])
  translate([0, 0, 365]) cylinder(h = 70, r = 8);
// 主軸套筒
color([0.55, 0.57, 0.60])
  translate([0, 0, 350]) cylinder(h = 85, r = 12);

// 夾頭（keyway chuck）
color([0.75, 0.77, 0.80])
  translate([0, 0, 340]) cylinder(h = 30, r = 14);
// 三爪標示線
color([0.50, 0.52, 0.55])
  for (a = [0, 120, 240])
    rotate([0, 0, a]) translate([8, -1, 342]) cube([6, 2, 26]);

// 鑽頭（HSS）
color([0.60, 0.62, 0.65])
  translate([0, 0, 290]) cylinder(h = 52, r1 = 4.5, r2 = 3);
color([0.50, 0.52, 0.55])
  translate([0, 0, 280]) cylinder(h = 12, r1 = 3, r2 = 0);

// 進刀手柄（三支，放射狀）
color([0.18, 0.18, 0.20])
  for (a = [0, 120, 240])
    rotate([0, 0, a]) {
      translate([0, 0, 395]) rotate([0, 90, 0]) cylinder(h = 70, r = 5);
      translate([65, 0, 395]) sphere(r = 8);
    }

// 深度限位環
color([0.50, 0.52, 0.55])
  translate([0, 0, 425]) difference() {
    cylinder(h = 10, r = 18);
    translate([0, 0, -1]) cylinder(h = 12, r = 12);
  }

// 緊急停止鈕（大紅色）
color([0.85, 0.08, 0.08])
  translate([30, 42, 450]) cylinder(h = 12, r = 12);
color([0.60, 0.06, 0.06])
  translate([30, 42, 462]) cylinder(h = 5, r = 12);
