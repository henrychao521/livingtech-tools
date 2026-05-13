// 圓柱（直徑 60、高 70，兩端做小導角）
include <_common.scad>

H = 70;
R = 30;
C = CHAMFER;

translate([0, 0, -H / 2]) hull() {
  translate([0, 0, C]) cylinder(h = H - 2 * C, r = R, $fn = $fn);
  cylinder(h = 0.01, r = R - C, $fn = $fn);
  translate([0, 0, H - 0.01]) cylinder(h = 0.01, r = R - C, $fn = $fn);
}
