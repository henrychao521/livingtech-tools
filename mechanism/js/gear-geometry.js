// 漸開線正齒輪幾何（模組 4 齒輪組用；同一支檔案也給 node 測試 require）
// 標準全齒深：壓力角 20°、齒冠 1m、齒根 1.25m。兩齒輪模數相同，中心距 a = m(z1+z2)/2。
// 齒形：基圓以上是漸開線，基圓以下用徑向直線接到齒根圓（簡化，不畫齒根圓角）。
(function (root) {
  'use strict';
  const inv = phi => Math.tan(phi) - phi;

  // 回傳齒輪外形多邊形（齒輪自己的座標系，第 0 齒的中心線在 +x 軸），以及各圓半徑
  // backlash：圓周方向總背隙（mm）；每個齒輪各分一半，讓兩齒輪齒面不會剛好重疊
  function gearOutline(z, m, opts) {
    opts = opts || {};
    const alpha = (opts.pressureAngle || 20) * Math.PI / 180;
    const backlash = opts.backlash != null ? opts.backlash : 0.04 * m;
    const n = opts.flankPts || 10;
    const rp = m * z / 2, rb = rp * Math.cos(alpha), ra = rp + m, rf = rp - 1.25 * m;
    // 節圓上的半齒厚（角度）：標準齒厚 πm/2，扣掉一半背隙
    const psi = (Math.PI * m / 2 - backlash / 2) / (2 * rp);
    const flank = []; // 齒中心線一側（+角度側）的 [r, 角度] 由齒根往齒頂
    const rStart = Math.max(rb, rf);
    if (rf < rb) flank.push([rf, psi + inv(alpha)]);   // 基圓以下：徑向直線
    for (let k = 0; k <= n; k++) {
      const r = rStart + (ra - rStart) * k / n;
      const phi = Math.acos(Math.min(1, rb / r));
      flank.push([r, psi + inv(alpha) - inv(phi)]);
    }
    const tipHalf = flank[flank.length - 1][1];
    if (tipHalf <= 0) throw new Error('齒頂變尖（齒數太少）');
    const pts = [];
    const pitchAng = 2 * Math.PI / z;
    for (let i = 0; i < z; i++) {
      const c = i * pitchAng;
      // 右側齒面（角度 c − θ），由齒根到齒頂
      for (let k = 0; k < flank.length; k++) { const [r, t] = flank[k]; pts.push([r * Math.cos(c - t), r * Math.sin(c - t)]); }
      // 齒頂圓弧
      const tipSteps = 3;
      for (let k = 1; k < tipSteps; k++) { const t = -tipHalf + 2 * tipHalf * k / tipSteps; pts.push([ra * Math.cos(c + t), ra * Math.sin(c + t)]); }
      // 左側齒面（角度 c + θ），由齒頂到齒根
      for (let k = flank.length - 1; k >= 0; k--) { const [r, t] = flank[k]; pts.push([r * Math.cos(c + t), r * Math.sin(c + t)]); }
      // 齒根圓弧到下一齒
      const a0 = c + flank[0][1], a1 = c + pitchAng - flank[0][1];
      const rootSteps = 3;
      for (let k = 1; k < rootSteps; k++) { const t = a0 + (a1 - a0) * k / rootSteps; pts.push([rf * Math.cos(t), rf * Math.sin(t)]); }
    }
    return { z, m, rp, rb, ra, rf, alpha, backlash, pts };
  }

  // 嚙合相位：主動輪（中心在原點）轉 θ1，從動輪（中心在 +x 方向距離 a 處）要轉的角度
  // θ1＝0 時主動輪第 0 齒正對從動輪，從動輪必須以「齒槽」對著它：從動輪齒的位置是 θ2＋2πk/z2，
  // 指向主動輪的方向是 π，所以 θ2(0) = π + π/z2（從齒偏移半個齒距＝半個周節）。轉速比 z1/z2、方向相反。
  function drivenAngle(theta1, z1, z2) { return -theta1 * z1 / z2 + Math.PI + Math.PI / z2; }
  function centerDistance(m, z1, z2) { return m * (z1 + z2) / 2; }
  // 接觸比（> 1 才會一對齒還沒離開、下一對已接上）
  function contactRatio(g1, g2) {
    const a = centerDistance(g1.m, g1.z, g2.z);
    return (Math.sqrt(g1.ra ** 2 - g1.rb ** 2) + Math.sqrt(g2.ra ** 2 - g2.rb ** 2) - a * Math.sin(g1.alpha)) / (Math.PI * g1.m * Math.cos(g1.alpha));
  }
  function transform(pts, ang, dx, dy) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return pts.map(([x, y]) => [x * c - y * s + dx, x * s + y * c + dy]);
  }

  const api = { inv, gearOutline, drivenAngle, centerDistance, contactRatio, transform };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GearGeom = api;
})(typeof window !== 'undefined' ? window : globalThis);
