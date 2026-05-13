// 槓桿 Lever — 一根桿件 + 三角支點 + 兩端重物
include <_common.scad>

module lever_bar() {
  // 主桿 100×8×6
  color([0.86, 0.15, 0.46])
    translate([-50, -3, 0]) cube([100, 6, 6]);
}

module fulcrum() {
  // 三角支點：底寬 20、高 18，在桿下方
  color([0.51, 0.09, 0.26])
    translate([0, -8, -18]) rotate([90, 0, 0])
      linear_extrude(height = 16)
        polygon([[-12, 0], [12, 0], [0, 18]]);
}

module weight(size = 12) {
  color([0.32, 0.08, 0.16])
    translate([-size/2, -size/2, 0]) cube([size, size, size]);
}

union() {
  lever_bar();
  fulcrum();
  // 阻力端（左）：較重
  translate([-40, 0, 6]) weight(16);
  // 施力端（右）：較輕但臂長
  translate([42, 0, 6]) weight(10);
}
