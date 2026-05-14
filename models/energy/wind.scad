// 風力發電機 Wind Turbine — 三葉片水平軸式
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

// 輪轂（hub，圓形）
color([0.82, 0.83, 0.85])
  translate([0, -14, 210]) rotate([90, 0, 0]) cylinder(h = 10, r = 8);

// 三片葉片（120° 間隔）
for (a = [0, 120, 240])
  rotate([0, a, 0]) translate([0, -14, 210]) rotate([90, 0, 0]) {
    color([0.93, 0.94, 0.96])
      linear_extrude(height = 90, scale = [0.2, 0.4], twist = -10)
        ellipse(20, 8);
  }

module ellipse(rx, ry) {
  scale([rx, ry]) circle(1);
}
