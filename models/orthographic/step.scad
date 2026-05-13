// 階梯塊：下層 80×30×60 + 上層 40×30×60（靠左對齊），邊緣導角
include <_common.scad>

union() {
  // 下層
  translate([-40, -30, -30]) cube([80, 30, 60]);
  // 上層
  translate([-40, 0, -30]) cube([40, 30, 60]);
}
