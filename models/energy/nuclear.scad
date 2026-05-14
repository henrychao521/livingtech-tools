// 核能電廠 Nuclear Plant — 圓頂反應爐 + 冷卻塔
$fn = 48;

// 地面
color([0.55, 0.56, 0.54])
  translate([-90, -55, 0]) cube([180, 110, 5]);

// 反應爐建物（圓柱 + 半球穹頂）
color([0.75, 0.76, 0.78]) {
  cylinder(h = 60, r = 32);
  translate([0, 0, 60]) sphere(r = 32);
}

// 反應爐建物窗帶
color([0.50, 0.52, 0.55])
  translate([0, 0, 30]) difference() {
    cylinder(h = 8, r = 33);
    translate([0, 0, -1]) cylinder(h = 10, r = 31);
  }

// 輔助廠房
color([0.62, 0.63, 0.65])
  translate([35, -25, 5]) cube([45, 50, 35]);

// 冷卻塔（雙曲線雙座）
for (tx = [-60, -30])
  color([0.70, 0.71, 0.73])
    translate([tx, -45, 5]) {
      cylinder(h = 75, r1 = 22, r2 = 10);
      translate([0, 0, 75]) cylinder(h = 8, r1 = 10, r2 = 12);
      // 蒸汽
      color([0.93, 0.94, 0.96, 0.5])
        translate([0, 0, 83]) cylinder(h = 40, r1 = 12, r2 = 30);
    }

// 安全圍阻（外環護牆示意）
color([0.58, 0.59, 0.62])
  difference() {
    cylinder(h = 15, r = 42);
    translate([0, 0, -1]) cylinder(h = 17, r = 38);
  }

// 防護圍欄
color([0.42, 0.42, 0.45])
  difference() {
    translate([-92, -57, 0]) cube([184, 114, 6]);
    translate([-88, -53, -1]) cube([176, 106, 8]);
  }
