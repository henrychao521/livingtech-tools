// 鉗類 Pliers — 紅色塑膠握把 + 鋼鉗口（尖嘴鉗）
include <_common.scad>

// 中央銷（樞軸）
color([0.18, 0.18, 0.18])
  rotate([90, 0, 0]) cylinder(h = 12, r = 4, center = true);

// 兩根鉗口（從中央銷往前延伸）
color([0.55, 0.55, 0.55]) {
  // 上鉗口
  translate([0, -3, 3]) rotate([0, 8, 0])
    linear_extrude(height = 4)
      polygon([[0, 0], [60, 1], [60, 4], [0, 8]]);
  // 下鉗口
  translate([0, -3, -7]) rotate([0, -8, 0])
    linear_extrude(height = 4)
      polygon([[0, 0], [60, 4], [60, 7], [0, 8]]);
}

// 兩根握把（從銷往後延伸 + 紅色塑膠套）
color([0.86, 0.15, 0.15]) {
  // 上握把（紅）
  translate([-3, -4, 5]) rotate([0, -20, 0])
    cube([55, 8, 5]);
  // 下握把
  translate([-3, -4, -10]) rotate([0, 20, 0])
    cube([55, 8, 5]);
}
