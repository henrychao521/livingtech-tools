// 刀類 Knife — 美工刀（黃色塑膠柄 + 銀色刀片）
include <_common.scad>

// 黃色塑膠刀身
color([0.95, 0.75, 0.10])
  translate([-3, -7, 0]) cube([100, 14, 8]);

// 滑動鈕（橘色小方塊）
color([0.95, 0.45, 0.10])
  translate([20, -8, 4]) cube([6, 16, 3]);

// 刀片（伸出右端的 trapezoid 銀色片）
color([0.85, 0.85, 0.85])
  translate([90, -0.5, 1]) {
    // 刀身斜面
    linear_extrude(height = 1)
      polygon([[0, -2], [30, -1], [30, 1], [0, 2]]);
    // 刀刃（更尖）
    translate([30, 0, 0]) linear_extrude(height = 1)
      polygon([[0, -1], [10, 0], [0, 1]]);
  }
