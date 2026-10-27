// 麵包板 Breadboard + 元件
// 2026-10 審查修正：孔洞改為 2.54 mm 標準間距、溝槽兩側各 5 列（a–e / f–j）、
// 電源軌加孔（每 5 孔一組）、LED／電阻／跳線插在孔位上（原本 LED 與一列孔落在溝槽裡、跳線懸空）
$fn = 32;

pitch = 2.54;          // 孔距（業界標準 0.1"）
cols  = 40;            // 直行數（板寬 110 mm 放得下 40 行）
x0    = -(cols - 1) / 2 * pitch;   // 第 1 直行的 x
function cx(c) = x0 + c * pitch;   // 第 c 直行（0 起算）的 x 座標
// 溝槽 y ∈ [-3, 3]；上半區 5 列從 y=5 起、下半區鏡射
function ry(r) = 5 + r * pitch;    // 第 r 列（0=靠溝槽那列）離溝槽側的 y

// 麵包板主體（白色）
color([0.92, 0.92, 0.94])
  translate([-55, -38, 0]) cube([110, 76, 8]);

// 電源軌色線（上下對稱：外側紅＋、內側藍−）
color([0.88, 0.15, 0.15])
  for (y = [-36, 31])
    translate([-52, y, 7]) cube([104, 5, 1.5]);
color([0.15, 0.20, 0.82])
  for (y = [-28, 23])
    translate([-52, y, 7]) cube([104, 5, 1.5]);

// 中間區孔洞：溝槽兩側各 5 列（a–e、f–j），同一直行 5 孔內部相連
color([0.55, 0.55, 0.58])
  for (c = [0 : cols - 1]) for (r = [0 : 4]) for (s = [-1, 1])
    translate([cx(c), s * ry(r), 8]) cylinder(h = 2, r = 0.5);

// 電源軌孔洞：每 5 孔一組、組間留空（對應實物的分段）
color([0.55, 0.55, 0.58])
  for (c = [0 : cols - 1]) if (c % 6 != 5)
    for (y = [-33.5, -25.5, 25.5, 33.5])
      translate([cx(c), y, 8]) cylinder(h = 2, r = 0.5);

// 中間分隔槽（深灰）
color([0.42, 0.42, 0.44])
  translate([-52, -3, 7]) cube([104, 6, 2]);

// ── 示範電路：＋軌 → LED → 220Ω 電阻 → −軌 ───────────────────

// LED（紅色）：兩腳插在上半區相鄰兩直行（第 11、12 直行，第 2 列），不同直行才不會短路
led_x = (cx(11) + cx(12)) / 2;
led_y = ry(1);
color([0.92, 0.10, 0.10])
  translate([led_x, led_y, 8]) cylinder(h = 8, r = 2.5);
color([0.92, 0.10, 0.10, 0.5])
  translate([led_x, led_y, 14]) sphere(r = 3.5);
// LED 接腳
color([0.72, 0.72, 0.75]) {
  translate([cx(11), led_y, 0]) cylinder(h = 9, r = 0.5);
  translate([cx(12), led_y, 0]) cylinder(h = 9, r = 0.5);
}

// 電阻（米色本體 + 紅紅棕 = 220Ω 色環）：跨溝槽插在第 17 直行，上下各一腳
res_x = cx(17);
res_leg = ry(1);   // 兩腳 y = ±7.54
color([0.91, 0.78, 0.60])
  translate([res_x, 0, 8]) rotate([90, 0, 0]) cylinder(h = 11, r = 2.5, center = true);
color([0.82, 0.08, 0.08])  // 色環 1：紅（2）
  translate([res_x, 3, 8]) rotate([90, 0, 0]) cylinder(h = 1.2, r = 2.6, center = true);
color([0.82, 0.08, 0.08])  // 色環 2：紅（2）
  translate([res_x, 1, 8]) rotate([90, 0, 0]) cylinder(h = 1.2, r = 2.6, center = true);
color([0.45, 0.25, 0.08])  // 色環 3：棕（×10）
  translate([res_x, -1, 8]) rotate([90, 0, 0]) cylinder(h = 1.2, r = 2.6, center = true);
color([0.85, 0.70, 0.20])  // 色環 4：金（±5%）
  translate([res_x, -3.8, 8]) rotate([90, 0, 0]) cylinder(h = 1.2, r = 2.6, center = true);
// 電阻接腳（本體端 → 彎下插孔）
color([0.72, 0.72, 0.75]) {
  translate([res_x, 0, 8]) rotate([90, 0, 0]) cylinder(h = 2 * res_leg, r = 0.4, center = true);
  translate([res_x,  res_leg, 0]) cylinder(h = 8, r = 0.5);
  translate([res_x, -res_leg, 0]) cylinder(h = 8, r = 0.5);
}

// 跳線：兩端插孔、中間拱起（而不是懸空的直棒）
module jumper(x1, y1, x2, y2, c, h = 6) {
  color(c) {
    translate([x1, y1, 8]) cylinder(h = h, r = 0.6);
    translate([x2, y2, 8]) cylinder(h = h, r = 0.6);
    hull() {
      translate([x1, y1, 8 + h]) sphere(r = 0.7);
      translate([x2, y2, 8 + h]) sphere(r = 0.7);
    }
  }
}
// 紅：上側＋軌 → LED 長腳所在直行（第 12 直行）
jumper(cx(12), 33.5, cx(12), ry(4), [0.85, 0.15, 0.15]);
// 綠：LED 另一腳直行（第 11 直行）→ 電阻上腳直行（第 17 直行）
jumper(cx(11), ry(3), cx(17), ry(3), [0.10, 0.78, 0.20], h = 9);
// 藍：電阻下腳直行（第 17 直行，下半區）→ 下側−軌
jumper(cx(17), -ry(4), cx(18), -25.5, [0.10, 0.20, 0.85]);

// Arduino Nano（迷你版，深藍 PCB）：跨在溝槽上，兩排腳分別落在上下半區
color([0.05, 0.15, 0.55])
  translate([15, -8, 8]) cube([18, 16, 1.5]);
color([0.10, 0.10, 0.12])
  translate([17, -4, 9.5]) cube([8, 8, 3]);
// USB
color([0.70, 0.70, 0.73])
  translate([32, 0, 9.5]) cube([6, 5, 4]);
