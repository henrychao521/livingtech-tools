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

// 皮帶（用厚的長方體 + 兩端切角的方式簡化；外切兩輪頂部與底部）
// 兩輪頂端切線高度約等於 (R1+R2)/2 + ε
color([0.16, 0.16, 0.16]) {
  // 上半皮帶（從大輪上方拉到小輪上方，簡化為長方體）
  translate([-25, -2.5, 19]) cube([53, 5, 3]);
  // 下半皮帶
  translate([-25, -2.5, -22]) cube([53, 5, 3]);
  // 連接段（弧形太複雜，用斜面三角形示意）
  // 左端
  translate([-46, -2.5, -22]) rotate([0, 30, 0]) cube([3, 5, 44]);
  // 右端
  translate([39, -2.5, -22]) rotate([0, -30, 0]) cube([3, 5, 44]);
}
