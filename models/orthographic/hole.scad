// 帶圓孔板：80×50×50，中央貫穿 Ø36 圓孔（孔軸 = Y，前後穿透）
// 正視(XZ) = 矩形含實線圓，側視(YZ) = 矩形含水平虛線，俯視(XY) = 矩形含垂直虛線
include <_common.scad>

difference() {
  // 外框：80 寬 × 50 深 × 50 高，已置中
  translate([-40, -25, -25]) cube([80, 50, 50]);
  // 圓孔：沿 Y 軸（OpenSCAD 前後方向）貫穿，→ 正視方向看到圓形
  rotate([90, 0, 0]) cylinder(h = 60, r = 18, center = true, $fn = $fn);
}
