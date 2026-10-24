// 殼結構 Shell — 穹頂（半球薄殼）
include <_common.scad>

// 主殼（半球，外殼用 difference 做出薄殼）
color([0.78, 0.69, 0.50])
  difference() {
    sphere(r = 32, $fn = 48);
    // 內挖（薄殼厚度 3）
    sphere(r = 29, $fn = 48);
    // 切掉 z < 0 的下半球（只留半球穹頂）
    translate([0, 0, -16]) cube([80, 80, 32], center = true);
  }

// 基座（圓形台基，頂面與穹頂底緣齊平 z = 0）
color([0.45, 0.45, 0.45])
  translate([0, 0, -1.5]) cylinder(h = 3, r = 34, center = true);
