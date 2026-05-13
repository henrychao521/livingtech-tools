// L 型塊：直立 30×80×40 + 水平 60×30×40
include <_common.scad>

union() {
  // 直立桿
  translate([-30, -40, -20]) cube([30, 80, 40]);
  // 水平底
  translate([0, -40, -20]) cube([60, 30, 40]);
}
