$fn = 48;
// 鑽床 Drill Press — 基座 + 立柱 + 工作台 + 頭部 + 主軸
// 座標：立柱在原點、+Z 向上、-Y 為機台正面；主軸軸線在立柱前方 y = -95
// （2026-10 修正：原版主軸、夾頭、鑽頭與工作台都和立柱同軸，鑽頭藏在立柱裡；
//   實際鑽床的頭部與工作台都從立柱向前伸出，鑽頭在工作台上方）
include <_common.scad>

SPX = -95;   // 主軸軸線的 y 座標（立柱前方）

// ── 基座（鑄鐵底座，向前延伸）
color([0.28, 0.28, 0.30])
  translate([-70, -140, 0]) cube([140, 190, 18]);
// 底座加強筋
color([0.22, 0.22, 0.24])
  for (x = [-40, 0, 40])
    translate([x-3, -138, 4]) cube([6, 186, 14]);

// ── 立柱（圓柱形，頂到皮帶箱蓋下）
color([0.35, 0.35, 0.38])
  translate([0, 0, 18]) cylinder(h = 492, r = 18);

// ── 工作台（可調高度；套環抱住立柱，台面向前伸出到主軸正下方）
color([0.32, 0.32, 0.35])
  translate([0, 0, 196]) cylinder(h = 24, r = 30);          // 立柱套環
color([0.40, 0.40, 0.43])
  translate([-80, -170, 200]) cube([160, 150, 16]);          // 台面 y: -170 ~ -20
// T 槽（前後向）
color([0.30, 0.30, 0.33])
  for (x = [-50, -25, 0, 25, 50])
    translate([x-2, -169, 212]) cube([4, 148, 4]);
// 工作台高度／旋轉鎖緊把手（套環右側）
color([0.18, 0.18, 0.20])
  translate([28, 0, 208]) rotate([0, 90, 0]) cylinder(h = 30, r = 4);

// ── 頭部機殼（抱住立柱、向前伸到主軸）
color([0.25, 0.27, 0.30])
  translate([0, 0, 430]) cylinder(h = 80, r = 52);           // 立柱套環
color([0.30, 0.32, 0.35])
  translate([-45, -125, 435]) cube([90, 165, 70]);           // 機殼 y: -125 ~ 40

// 馬達（頭部後方、立柱後側）
color([0.22, 0.22, 0.25])
  translate([0, 75, 445]) cylinder(h = 65, r = 35);

// 皮帶保護蓋（蓋住前方主軸皮帶輪與後方馬達皮帶輪）
color([0.38, 0.40, 0.43])
  translate([-32, -127, 505]) cube([64, 240, 10]);

// ── 主軸套筒（quill）與主軸
color([0.55, 0.57, 0.60])
  translate([0, SPX, 350]) cylinder(h = 85, r = 12);
color([0.70, 0.72, 0.75])
  translate([0, SPX, 320]) cylinder(h = 32, r = 8);

// 深度限位環（套筒上）＋ 限位桿
color([0.50, 0.52, 0.55])
  translate([0, SPX, 425]) difference() {
    cylinder(h = 10, r = 18);
    translate([0, 0, -1]) cylinder(h = 12, r = 12);
  }
color([0.50, 0.52, 0.55])
  translate([-24, SPX, 380]) cylinder(h = 56, r = 2.5);
color([0.40, 0.42, 0.45])
  translate([-24, SPX, 402]) cylinder(h = 5, r = 5, $fn = 6);

// ── 夾頭（鑰匙式 keyed chuck）
color([0.75, 0.77, 0.80])
  translate([0, SPX, 320]) cylinder(h = 30, r = 14);
color([0.65, 0.67, 0.70])
  translate([0, SPX, 312]) cylinder(h = 8, r1 = 10, r2 = 14);
// 三爪標示線
color([0.50, 0.52, 0.55])
  for (a = [0, 120, 240])
    rotate([0, 0, a]) translate([8, SPX - 1, 322]) cube([6, 2, 26]);
// 夾頭鑰匙孔（三個，鎖緊後要拔鑰匙）
color([0.10, 0.10, 0.12])
  for (a = [0, 120, 240])
    translate([0, SPX, 335]) rotate([0, 0, a]) rotate([0, 90, 0]) cylinder(h = 15, r = 2.5);

// ── 鑽頭（HSS），尖端在工作台上方
color([0.60, 0.62, 0.65])
  translate([0, SPX, 270]) cylinder(h = 44, r = 4);
color([0.50, 0.52, 0.55])
  translate([0, SPX, 260]) cylinder(h = 10, r1 = 0, r2 = 4);

// ── 進刀手柄（頭部右側的輪轂 + 三支放射狀手柄，在 Y-Z 平面轉動）
color([0.30, 0.32, 0.35])
  translate([45, SPX, 395]) rotate([0, 90, 0]) cylinder(h = 14, r = 12);
color([0.18, 0.18, 0.20])
  for (a = [0, 120, 240])
    translate([59, SPX, 395]) rotate([a, 0, 0]) {
      cylinder(h = 70, r = 5);
      translate([0, 0, 70]) sphere(r = 8);
    }

// ── 緊急停止鈕（頭部正面右側，大紅色）
color([0.85, 0.08, 0.08])
  translate([25, -125, 470]) rotate([90, 0, 0]) cylinder(h = 12, r = 12);
color([0.60, 0.06, 0.06])
  translate([25, -137, 470]) rotate([90, 0, 0]) cylinder(h = 5, r = 12);

// 電源開關（頭部正面左側）
color([0.10, 0.10, 0.12])
  translate([-40, -130, 460]) cube([16, 5, 22]);
color([0.12, 0.85, 0.30])
  translate([-37, -131, 474]) cube([10, 2, 5]);
