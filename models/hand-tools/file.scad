// 銼刀 File — 木柄 + 銼齒鋼身（平銼）
include <_common.scad>

// 木柄（圓錐握把）
color([0.62, 0.27, 0.12])
  cylinder(h = 50, r1 = 11, r2 = 9, $fn = 32);

// 莖部（鋼）
color([0.55, 0.55, 0.55])
  translate([0, 0, 50]) cylinder(h = 6, r = 5);

// 銼身（長方形，帶銼齒紋）
color([0.65, 0.65, 0.7]) {
  translate([-6, -4, 56]) cube([12, 8, 90]);
}
// 銼齒（淺溝紋一排）
color([0.45, 0.45, 0.50])
  for (i = [0:20]) translate([-6, -4.05, 60 + i*4]) cube([12, 0.5, 1.2]);
// 尖端
color([0.55, 0.55, 0.55])
  translate([0, 0, 146]) cylinder(h = 6, r1 = 5, r2 = 2);
