// 斜面 Inclined Plane — 直角三角形拉伸 + 物體在斜面上
include <_common.scad>

// 斜面本體（直角三角形）
// 直角邊：底長 80、高 35；深度 40
color([0.86, 0.15, 0.46])
  translate([0, 0, -20]) linear_extrude(height = 40)
    polygon([[-40, 0], [40, 0], [-40, 35]]);

// 物體（方塊放在斜面上往下半）
color([0.32, 0.08, 0.16])
  translate([-25, -10, 7])
    rotate([0, -atan(35/80), 0])   // 對齊斜面斜率
      cube([16, 20, 16]);
