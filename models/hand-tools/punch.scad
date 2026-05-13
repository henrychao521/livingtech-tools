// 衝具 Punch — 中心衝（圓柱身 + 滾花握把 + 尖頭）
include <_common.scad>

// 握把（粗滾花）
color([0.55, 0.55, 0.58]) {
  cylinder(h = 50, r = 7);
  // 滾花紋（簡化為一圈圈淺溝）
}
// 端蓋
color([0.30, 0.30, 0.30])
  translate([0, 0, 50]) cylinder(h = 4, r = 8);

// 中段細圓柱
color([0.7, 0.7, 0.72])
  translate([0, 0, -30]) cylinder(h = 30, r = 4);

// 尖頭（圓錐）
color([0.30, 0.30, 0.30])
  translate([0, 0, -40]) cylinder(h = 10, r1 = 0, r2 = 4);
