// L 角架（角鐵）：L 形截面沿 Z 軸延伸
// 俯視(XY→XZ in Three.js) = L 形 ✓
// 正視(XZ→XY in Three.js) = 矩形 ✓
// 側視(YZ)                 = 矩形 ✓
include <_common.scad>

translate([0, 0, -20]) linear_extrude(height = 40)
  polygon(points = [
    [-30, -30],   // bottom-left
    [ 30, -30],   // bottom-right
    [ 30, -15],   // inner bottom-right
    [-15, -15],   // inner corner
    [-15,  30],   // inner top
    [-30,  30]    // top-left
  ]);
