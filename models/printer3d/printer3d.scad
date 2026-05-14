// FDM 3D 印表機 (Ender-3 style)
$fn = 32;

// 底座框架（黑色 V-slot 鋁型材）
color([0.15, 0.15, 0.17]) {
  // 底部水平框
  translate([-80, -80, 0]) cube([160, 8, 8]);   // 前框
  translate([-80, 72, 0]) cube([160, 8, 8]);    // 後框
  translate([-80, -80, 0]) cube([8, 160, 8]);   // 左框
  translate([72, -80, 0]) cube([8, 160, 8]);    // 右框
}

// 垂直立柱（兩根）
color([0.18, 0.18, 0.20]) {
  translate([-80, -80, 0]) cube([8, 8, 250]);
  translate([72, -80, 0]) cube([8, 8, 250]);
}

// 頂部橫樑
color([0.15, 0.15, 0.17])
  translate([-80, -80, 244]) cube([160, 8, 8]);

// 熱床（加熱平台，黑色彈簧鋼板）
color([0.20, 0.20, 0.22])
  translate([-65, -65, 30]) cube([130, 130, 4]);
// 熱床 PEI 面
color([0.30, 0.28, 0.25])
  translate([-63, -63, 34]) cube([126, 126, 1.5]);
// 熱床 4 角彈簧
color([0.55, 0.55, 0.58])
  for (x = [-55, 55]) for (y = [-55, 55])
    translate([x, y, 10]) cylinder(h = 22, r = 4);

// X 軸橫樑
color([0.18, 0.18, 0.20])
  translate([-80, -10, 130]) cube([160, 8, 8]);

// 列印頭 + 噴嘴（Bowden style）
color([0.28, 0.28, 0.30])
  translate([-10, -8, 138]) cube([20, 16, 30]);
// 加熱塊
color([0.75, 0.52, 0.10])
  translate([-6, -5, 130]) cube([12, 10, 12]);
// 噴嘴
color([0.65, 0.50, 0.08])
  translate([-2, -1, 120]) cube([4, 2, 12]);
// 散熱風扇
color([0.22, 0.22, 0.25])
  translate([-14, -14, 148]) cube([12, 12, 12]);
// 吹風扇
color([0.22, 0.22, 0.25])
  translate([4, -14, 138]) cube([12, 8, 10]);

// 耗材線圈（右後方）
color([0.85, 0.30, 0.30]) {
  translate([78, 40, 100]) {
    difference() {
      cylinder(h = 30, r = 40);
      translate([0, 0, -1]) cylinder(h = 32, r = 30);
    }
    difference() {
      cylinder(h = 30, r = 42);
      translate([0, 0, -1]) cylinder(h = 32, r = 40);
    }
  }
}

// 列印中的物件（小方塊，白色）
color([0.96, 0.96, 0.96])
  translate([-8, -8, 35]) cube([16, 16, 25]);
color([0.90, 0.90, 0.92])
  for (z = [35, 40, 45, 50, 55])
    translate([-8, -8, z]) cube([16, 16, 1]);

// 電源供應器（左下）
color([0.12, 0.12, 0.14])
  translate([-78, -78, 8]) cube([40, 25, 30]);

// 控制主板（右下）
color([0.06, 0.22, 0.06])
  translate([38, -78, 8]) cube([34, 30, 4]);
