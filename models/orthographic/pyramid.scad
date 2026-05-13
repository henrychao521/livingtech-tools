// 金字塔（正四角錐）：底邊 70×70、高 70
include <_common.scad>

translate([0, 0, -35]) linear_extrude(height = 70, scale = 0)
  square([70, 70], center = true);
