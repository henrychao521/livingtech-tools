// 電烙鐵 Soldering Iron — 握把 + 加熱芯 + 烙鐵頭
$fn = 40;

// 握把（藍色塑膠）
color([0.12, 0.30, 0.68])
  cylinder(h = 90, r1 = 14, r2 = 10);

// 防滑紋
color([0.08, 0.20, 0.52])
  for (z = [10, 20, 30, 40, 50, 60, 70])
    translate([0, 0, z]) difference() {
      cylinder(h = 5, r = 10.5);
      translate([0, 0, -1]) cylinder(h = 7, r = 9);
    }

// 握把前端蓋（金屬環）
color([0.65, 0.65, 0.68]) {
  translate([0, 0, 88]) cylinder(h = 6, r = 11);
  translate([0, 0, 93]) cylinder(h = 4, r = 9);
}

// 加熱元件殼（銀灰）
color([0.72, 0.73, 0.75])
  translate([0, 0, 97]) cylinder(h = 35, r = 7);

// 加熱套筒（黑色陶瓷）
color([0.18, 0.18, 0.20])
  translate([0, 0, 130]) cylinder(h = 12, r = 5.5);

// 烙鐵頭（銅色，刀形）
color([0.75, 0.50, 0.18]) {
  translate([0, 0, 142]) cylinder(h = 15, r = 4);
  translate([-4, -1.5, 157]) cube([8, 3, 12]);
  // 刀口斜面
  translate([-4, -1.5, 169]) rotate([-25, 0, 0]) cube([8, 3, 6]);
}

// 電源線（從底部引出）
color([0.12, 0.12, 0.14])
  translate([0, 0, -30]) cylinder(h = 32, r = 4);
color([0.08, 0.08, 0.10])
  translate([0, 0, -60]) cylinder(h = 32, r = 3.5);

// 溫度調節旋鈕（握把側面）
color([0.85, 0.85, 0.88])
  translate([12, 0, 40]) rotate([0, 90, 0]) cylinder(h = 8, r = 6);
