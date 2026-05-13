// 四連桿 Four-bar Linkage — 4 根桿件 + 4 個 pivot
include <_common.scad>

// 機架（固定桿）
color([0.28, 0.34, 0.43])
  translate([-40, -3, -25]) cube([80, 6, 4]);

// 左 pivot（固定）
color([0.4, 0.4, 0.4])
  translate([-30, 0, -22]) rotate([90, 0, 0]) cylinder(h = 8, r = 3, center = true);

// 右 pivot（固定）
color([0.4, 0.4, 0.4])
  translate([30, 0, -22]) rotate([90, 0, 0]) cylinder(h = 8, r = 3, center = true);

// 左輸入連桿（從左 pivot 往上 + 偏左）
color([0.08, 0.71, 0.65])
  translate([-30, 0, -22]) rotate([0, 30, 0])
    translate([-2.5, -2.5, 0]) cube([5, 5, 30]);

// 右輸出連桿（從右 pivot 往上 + 偏右）
color([0.08, 0.71, 0.65])
  translate([30, 0, -22]) rotate([0, -25, 0])
    translate([-2.5, -2.5, 0]) cube([5, 5, 35]);

// 上連桿（連接兩根動桿頂部）
// 左頂端位置：(-30 + 30*sin30°, 0, -22 + 30*cos30°) ≈ (-15, 0, 4)
// 右頂端位置：(30 - 35*sin25°, 0, -22 + 35*cos25°) ≈ (15, 0, 9.7)
color([0.86, 0.4, 0.2]) {
  // 連結桿（簡化為水平桿）
  translate([-18, -2, 8]) cube([36, 4, 5]);
  // 兩端 pivot
  translate([-15, 0, 6]) rotate([90, 0, 0]) cylinder(h = 6, r = 2.5, center = true);
  translate([15, 0, 8]) rotate([90, 0, 0]) cylinder(h = 6, r = 2.5, center = true);
}
