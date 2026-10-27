// 纜索懸吊 Cable / Suspension — 兩塔 + 下垂主纜（拋物線）+ 吊桿 + 橋面 + 錨碇
include <_common.scad>

TOWER_X = 27.5;   // 塔中心 x
TOWER_TOP = 32;   // 塔頂高度
SAG_Z = 12;       // 主纜跨中最低點高度
DECK_Z = -14;     // 橋面上表面高度

// 主纜高度（拋物線：塔頂 32、跨中 12）
function z_main(x) = SAG_Z + (TOWER_TOP - SAG_Z) * (x * x) / (TOWER_X * TOWER_X);

// 橋面
color([0.55, 0.45, 0.35])
  translate([-50, -5, -18]) cube([100, 10, 4]);

// 兩座塔
color([0.36, 0.42, 0.55]) {
  translate([-30, -3, -18]) cube([5, 6, 50]);
  translate([ 25, -3, -18]) cube([5, 6, 50]);
}

// 主纜（中跨：拋物線以短直段串成；邊跨：從塔頂拉到兩端錨碇）
color([0.16, 0.16, 0.16]) {
  for (x = [-TOWER_X : 2.5 : TOWER_X - 2.5]) {
    hull() {
      translate([x, 0, z_main(x)]) sphere(r = 1.5);
      translate([x + 2.5, 0, z_main(x + 2.5)]) sphere(r = 1.5);
    }
  }
  // 邊跨拉索（背索）到錨碇
  for (s = [-1, 1]) hull() {
    translate([s * TOWER_X, 0, TOWER_TOP]) sphere(r = 1.5);
    translate([s * 48, 0, DECK_Z]) sphere(r = 1.5);
  }
}

// 錨碇（兩端固定主纜的混凝土塊）
color([0.45, 0.45, 0.45])
  for (s = [-1, 1]) translate([s * 47 - 3, -5, -18]) cube([6, 10, 6]);

// 吊桿（垂直細桿從主纜吊住橋面；只受張力）
color([0.86, 0.25, 0.25])
  for (x = [-20, -10, 0, 10, 20]) {
    translate([x - 0.4, -0.4, DECK_Z]) cube([0.8, 0.8, z_main(x) - DECK_Z]);
  }
