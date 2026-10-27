// 風力發電機 Wind Turbine — 三葉片水平軸式
// 座標：Z 向上；轉子軸沿 Y 軸（葉片朝 -Y 迎風），葉片在 XZ 平面內旋轉
$fn = 48;

// 基座（混凝土圓柱）
color([0.75, 0.74, 0.72])
  cylinder(h = 30, r = 20);

// 塔柱（白色鋼塔，略錐形）
color([0.92, 0.93, 0.94])
  cylinder(h = 200, r1 = 12, r2 = 6);

// 機艙（nacelle，灰白色箱體）
color([0.88, 0.89, 0.91])
  translate([0, -14, 200]) {
    hull() {
      translate([-8, 0, 0]) cube([16, 28, 18]);
      translate([0, 14, 22]) cylinder(h = 1, r = 8);
    }
  }

// 輪轂（hub，圓柱，沿 -Y 伸出機艙前方）
color([0.82, 0.83, 0.85])
  translate([0, -14, 210]) rotate([90, 0, 0]) cylinder(h = 10, r = 8);

// 整流罩（spinner，輪轂前端的圓錐）
color([0.82, 0.83, 0.85])
  translate([0, -24, 210]) rotate([90, 0, 0]) cylinder(h = 8, r1 = 8, r2 = 2);

// 三片葉片（120° 間隔）
// 先平移到輪轂中心，再繞轉子軸（Y 軸）旋轉，葉片本身沿徑向（+Z）擠出；
// 剖面橢圓長軸在旋轉面內（翼弦）、短軸沿轉軸方向（葉片厚度），向葉尖漸縮並略帶扭轉
for (a = [0, 120, 240])
  translate([0, -20, 210]) rotate([0, a, 0])
    color([0.93, 0.94, 0.96])
      linear_extrude(height = 90, scale = [0.35, 0.5], twist = -10)
        ellipse(7, 2.2);

module ellipse(rx, ry) {
  scale([rx, ry]) circle(1);
}
