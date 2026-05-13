// 帶圓孔板：80×50×50，中央貫穿 Ø36 圓孔（孔軸 = Z）
include <_common.scad>

difference() {
  translate([-40, -25, -25]) cube([80, 50, 50]);
  // 孔軸沿 Z 軸貫穿
  translate([0, 0, -30]) cylinder(h = 60, r = 18, $fn = $fn);
}
