// structure-sim 共用設定
$fn = 40;

// 桿件：從點 a 到點 b 畫一個圓柱桿
module rod(a, b, r = 1.5) {
  v = b - a;
  L = norm(v);
  // 計算旋轉到 v 方向的角度
  ay = atan2(sqrt(v[0]*v[0] + v[1]*v[1]), v[2]);
  az = atan2(v[1], v[0]);
  translate(a) rotate([0, ay, az]) cylinder(h = L, r = r);
}
