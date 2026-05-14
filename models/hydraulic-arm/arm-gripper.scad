// 軸4：夾爪（兩指夾具）
include <_common.scad>

// 夾爪基座
color([0.40, 0.40, 0.43])
  translate([-12, -8, 0]) cube([24, 16, 16]);

// 腕關節圓柱
color([0.35, 0.35, 0.38])
  translate([0, 0, -12]) rotate([90, 0, 0]) cylinder(h = 16, r = 8, center = true);

// 左夾爪
color([0.50, 0.52, 0.55])
  translate([-20, -4, 10]) {
    cube([8, 8, 35]);
    // 爪尖（斜切）
    translate([0, 0, 35]) rotate([0, -15, 0]) cube([8, 8, 18]);
  }

// 右夾爪（對稱）
color([0.50, 0.52, 0.55])
  translate([12, -4, 10]) {
    cube([8, 8, 35]);
    translate([8, 0, 35]) rotate([0, 15, 0]) translate([-8, 0, 0]) cube([8, 8, 18]);
  }

// 夾爪內側橡膠墊（防滑）
color([0.15, 0.15, 0.15]) {
  translate([-12, -2, 12]) cube([2, 4, 30]);
  translate([10, -2, 12]) cube([2, 4, 30]);
}

// 針筒（夾爪控制）
color([0.70, 0.78, 0.85, 0.75])
  translate([0, 14, 0]) cylinder(h = 28, r = 5.5);
color([0.60, 0.60, 0.65])
  translate([0, 14, 28]) cylinder(h = 12, r = 2);

// 連桿（連接針筒和夾爪）
color([0.55, 0.56, 0.58]) {
  translate([-10, 6, 16]) rotate([30, 0, 30]) cube([3, 3, 18]);
  translate([7, 6, 16]) rotate([30, 0, -30]) cube([3, 3, 18]);
}
