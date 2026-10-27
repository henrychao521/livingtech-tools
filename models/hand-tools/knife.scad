// 刀類 Knife — 美工刀（黃色塑膠柄 + 銀色刀片）
include <_common.scad>

// 黃色塑膠刀身
color([0.95, 0.75, 0.10])
  translate([-3, -7, 0]) cube([100, 14, 8]);

// 滑動鈕（橘色小方塊）
color([0.95, 0.45, 0.10])
  translate([20, -8, 4]) cube([6, 16, 3]);

// 刀片（折刀式梯形刀片，從刀身前端伸出；刀尖在前下方、刃口為斜邊）
color([0.85, 0.85, 0.85])
  translate([95, 0, 3.5])
    linear_extrude(height = 1)
      polygon([[0, -6], [0, 6], [12, 6], [24, -6]]);
