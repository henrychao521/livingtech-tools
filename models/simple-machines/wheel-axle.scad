// 輪軸 Wheel & Axle — 大輪 + 小軸（同軸），如方向盤
include <_common.scad>

// 大輪（厚圓盤）
color([0.86, 0.15, 0.46])
  difference() {
    rotate([90, 0, 0]) cylinder(h = 6, r = 35, center = true);
    // 內部減重圓圈
    rotate([90, 0, 0]) cylinder(h = 8, r = 28, center = true);
  }

// 輪輻（4 條，從中央輻射）
color([0.86, 0.15, 0.46])
  for (a = [0, 90, 180, 270])
    rotate([0, a, 0])
      translate([-2, -3, -29])
        cube([4, 6, 23]);

// 中央軸套
color([0.51, 0.09, 0.26])
  rotate([90, 0, 0]) cylinder(h = 8, r = 7, center = true);

// 小軸（穿出兩側）
color([0.32, 0.08, 0.16])
  rotate([90, 0, 0]) cylinder(h = 30, r = 3.5, center = true);
