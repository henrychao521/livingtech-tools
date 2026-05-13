// 張弦／張拉 Tensile — 帳篷型張拉膜（中央桅杆 + 邊緣張力索 + 膜）
include <_common.scad>

// 中央桅杆
color([0.36, 0.42, 0.55])
  cylinder(h = 50, r = 2, center = true);

// 頂端球節點
color([0.16, 0.16, 0.16])
  translate([0, 0, 25]) sphere(r = 3);

// 4 個邊緣錨點 + 張力索（從桅杆頂往外下方拉）
color([0.86, 0.25, 0.25])
  for (a = [0, 90, 180, 270]) {
    rotate([0, 0, a]) {
      // 錨點
      translate([35, 0, -25]) cube([4, 4, 4], center = true);
      // 索
      hull() {
        translate([0, 0, 25]) sphere(r = 0.5);
        translate([35, 0, -25]) sphere(r = 0.5);
      }
    }
  }

// 膜（用 4 個三角面組成的稜柱錐示意）
color([0.95, 0.95, 0.95, 0.7])
  for (a = [0, 90, 180, 270]) {
    rotate([0, 0, a])
      polyhedron(
        points = [[0, 0, 25], [35, 0, -25], [0, 35, -25], [0, 0, -10]],
        faces = [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]]
      );
  }
