// L 角架：典型機械支撐件
// 從上方看：L 形截面（垂直邊 + 水平邊）；深度 40，含補強三角肋
include <_common.scad>

union() {
  // L 形主體（從正視角度看是 L）
  translate([0, 0, -20]) linear_extrude(height = 40)
    polygon(points = [
      [-30, -30], [30, -30], [30, -15], [-15, -15], [-15, 30], [-30, 30]
    ]);
  // 補強肋：L 內角的小三角片
  translate([-15, -15, -2]) rotate([0, -90, 0])
    linear_extrude(height = 2)
      polygon(points = [[0, 0], [15, 0], [0, 15]]);
  translate([-15, -15, 0]) rotate([0, -90, 0])
    linear_extrude(height = 2)
      polygon(points = [[0, 0], [15, 0], [0, 15]]);
}
