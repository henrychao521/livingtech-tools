// 楔形塊：三角柱（直角三角形拉伸）
// 截面：直角邊長 80、高度 50；深度 50
include <_common.scad>

translate([0, 0, -25]) linear_extrude(height = 50)
  polygon(points = [[-40, -25], [40, -25], [-40, 25]]);
