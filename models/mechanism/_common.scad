// mechanism 共用設定 + 齒輪 module
$fn = 60;

// 簡化齒輪：N 個齒、節圓半徑 r、齒高 h、齒寬 w
module simple_gear(N = 16, r = 20, h = 4, thick = 6) {
  union() {
    // 主圓盤
    cylinder(h = thick, r = r, center = true);
    // 齒（梯形）
    for (i = [0:N-1]) {
      rotate([0, 0, i * 360 / N])
        translate([r, 0, 0])
          linear_extrude(height = thick, center = true)
            polygon([[0, -2.4], [h, -1.4], [h, 1.4], [0, 2.4]]);
    }
    // 中心凸軸
    cylinder(h = thick * 1.4, r = r * 0.18, center = true);
  }
}
