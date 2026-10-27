// 楔形塊：三角柱（直角三角形拉伸）
// 截面立在 XZ 平面（直角邊：底 80、高 50），沿 Y 拉伸深度 50
// → 正視(XZ) = 直角三角形（左高、斜面往右下）；俯視(XY) = 矩形；側視(YZ) = 矩形
// （舊版把截面放在 XY 水平面，變成俯視才是三角形，與模組 4 說明不符）
include <_common.scad>

rotate([90, 0, 0]) linear_extrude(height = 50, center = true)
  polygon(points = [[-40, -25], [40, -25], [-40, 25]]);
