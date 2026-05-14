// 軸1：基座旋轉底座
include <_common.scad>

// 底板
color([0.35, 0.35, 0.38])
  cylinder(h = 8, r = 40);

// 旋轉環（中間環）
color([0.50, 0.50, 0.53])
  translate([0, 0, 8])
  difference() {
    cylinder(h = 14, r = 32);
    translate([0, 0, -1]) cylinder(h = 16, r = 22);
  }

// 上部旋轉台
color([0.40, 0.40, 0.43])
  translate([0, 0, 22]) cylinder(h = 10, r = 24);

// 旋轉軸承示意（黃色環）
color([0.85, 0.65, 0.10])
  translate([0, 0, 8])
  difference() {
    cylinder(h = 14, r = 33);
    translate([0, 0, -1]) cylinder(h = 16, r = 31);
  }

// 上臂底座凸台
color([0.45, 0.45, 0.48])
  translate([0, 0, 32]) cylinder(h = 20, r = 14);

// 兩側肩關節耳片
color([0.40, 0.40, 0.43]) {
  translate([-20, -8, 45]) cube([40, 16, 15]);
  // 耳孔
  translate([0, 0, 52]) rotate([90, 0, 0])
    color([0.15, 0.15, 0.15]) cylinder(h = 20, r = 5, center = true);
}

// 針筒固定座（左側）
color([0.30, 0.30, 0.33])
  translate([-38, -5, 15]) cube([12, 10, 18]);
