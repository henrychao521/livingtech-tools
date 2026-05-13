// 螺旋 Screw — 螺絲（圓柱 + 螺紋 + 頭部）
include <_common.scad>

// 螺絲頭部（六角頭）
color([0.51, 0.09, 0.26])
  translate([0, 0, 24]) rotate([0, 0, 30])
    cylinder(h = 10, r = 14, $fn = 6);

// 軸身
color([0.86, 0.15, 0.46])
  cylinder(h = 50, r = 6, center = false);

// 螺紋（用 linear_extrude + twist 製作真實螺紋）
color([0.62, 0.08, 0.30])
  translate([0, 0, 0]) linear_extrude(height = 50, twist = 720, $fn = 60, slices = 60)
    translate([3, 0]) circle(r = 2.5, $fn = 8);
