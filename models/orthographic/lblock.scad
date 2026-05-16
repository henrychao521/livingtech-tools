// L 型塊：正視(XZ) = L 形，俯視(XY) = 矩形，側視(YZ) = 直立矩形
// 豎臂(left tall) + 底座(right low)，兩者 Y 深度相同
include <_common.scad>

union() {
  // 豎臂：x∈[-30,0]  z∈[0,60]  y∈[-20,20]  → 正視左側高臂
  translate([-30, -20, 0]) cube([30, 40, 60]);
  // 底座：x∈[0,60]   z∈[0,30]  y∈[-20,20]  → 正視右側低座
  translate([0, -20, 0]) cube([60, 40, 30]);
}
