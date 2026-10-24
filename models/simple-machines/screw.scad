// 螺旋 Screw — 螺絲（圓柱 + 螺紋 + 頭部）
include <_common.scad>

// 螺絲頭部（六角頭，在軸的頂端 z = 50～60；舊版放在 z = 24 的軸中段）
color([0.51, 0.09, 0.26])
  translate([0, 0, 50]) rotate([0, 0, 30])
    cylinder(h = 10, r = 14, $fn = 6);

// 軸身
color([0.86, 0.15, 0.46])
  cylinder(h = 50, r = 6, center = false);

// 螺紋（用 linear_extrude + twist 製作真實螺紋）
// 螺紋截面圓心偏移 6（= 軸半徑），螺紋凸出軸面 2.5；twist 1800° = 5 圈，螺距 10
// 舊版偏移 3、半徑 2.5 → 最外緣 5.5 < 軸半徑 6，螺紋整個埋在軸裡看不到
color([0.62, 0.08, 0.30])
  linear_extrude(height = 50, twist = 1800, $fn = 60, slices = 200)
    translate([6, 0]) circle(r = 2.5, $fn = 8);
