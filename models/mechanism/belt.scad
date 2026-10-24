// 皮帶輪 Belt Drive — 兩個皮帶輪 + 皮帶
include <_common.scad>

// 大皮帶輪（左）
color([0.08, 0.71, 0.65]) {
  translate([-25, 0, 0]) rotate([90, 0, 0])
    difference() {
      cylinder(h = 8, r = 22, center = true);
      // V 型槽
      cylinder(h = 4, r = 19, center = true);
    }
}
// 大輪軸
color([0.06, 0.46, 0.42])
  translate([-25, 0, 0]) rotate([90, 0, 0]) cylinder(h = 12, r = 3, center = true);

// 小皮帶輪（右）
color([0.86, 0.4, 0.2]) {
  translate([28, 0, 0]) rotate([90, 0, 0])
    difference() {
      cylinder(h = 8, r = 12, center = true);
      cylinder(h = 4, r = 9, center = true);
    }
}
// 小輪軸
color([0.62, 0.27, 0.12])
  translate([28, 0, 0]) rotate([90, 0, 0]) cylinder(h = 12, r = 2.5, center = true);

// 皮帶：兩輪外切線 + 包覆兩輪的弧，用 2D hull 相減做成封閉環帶（厚 3、寬 4，嵌在 V 槽內）
// 大輪 r=22 @ x=-25、小輪 r=12 @ x=28；外環 = 輪半徑 + 1，內環 = 輪半徑 − 2（陷入槽內）
color([0.16, 0.16, 0.16])
  rotate([90, 0, 0]) linear_extrude(height = 4, center = true)
    difference() {
      hull() { translate([-25, 0]) circle(r = 23); translate([28, 0]) circle(r = 13); }
      hull() { translate([-25, 0]) circle(r = 20); translate([28, 0]) circle(r = 10); }
    }
