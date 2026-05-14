// 軸3：小臂（前臂）— 肘關節 + 小臂
include <_common.scad>

// 肘關節
color([0.40, 0.40, 0.43]) {
  rotate([90, 0, 0]) cylinder(h = 20, r = 10, center = true);
  color([0.15, 0.15, 0.15]) rotate([90, 0, 0]) cylinder(h = 22, r = 4, center = true);
}

// 小臂本體（略細）
color([0.52, 0.54, 0.57])
  translate([-7, -6, 0]) cube([14, 12, 70]);

// 加強肋
color([0.47, 0.48, 0.51]) {
  translate([-9, -3, 5]) cube([2, 6, 60]);
  translate([7, -3, 5]) cube([2, 6, 60]);
}

// 腕關節（末端）
color([0.40, 0.40, 0.43])
  translate([0, 0, 70]) {
    rotate([90, 0, 0]) cylinder(h = 16, r = 8, center = true);
    color([0.15, 0.15, 0.15]) rotate([90, 0, 0]) cylinder(h = 18, r = 3.5, center = true);
  }

// 針筒（肘控制）
color([0.70, 0.78, 0.85, 0.75])
  translate([0, 18, 15]) cylinder(h = 38, r = 6);
color([0.60, 0.60, 0.65])
  translate([0, 18, 53]) cylinder(h = 14, r = 2.2);
