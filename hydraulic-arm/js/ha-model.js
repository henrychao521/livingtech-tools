// 液壓手臂物理模型（模組 4 用；同一支檔案也給 node 測試 require）
// 單位：長度 mm、體積 mm³（1 ml = 1000 mm³）、角度度數。
//
// 教室的針筒液壓手臂：每一軸是一「對」針筒——主動針筒在操作者手上，從動針筒裝在手臂上，
// 中間一條水管連通。水幾乎不可壓縮，所以
//   主動端推出去的水體積 = 從動端吸進來的水體積  →  A主 × Δx主 = A從 × Δx從
// 推主動針筒 → 從動針筒伸出；拉主動針筒 → 從動針筒縮回。每一對只接一個關節。
// 從動針筒兩端用銷釘接在「前一節」與「後一節」上，和關節中心構成三角形（a、b 兩邊固定，第三邊＝針筒長 L），
// 針筒伸長 → 三角形在關節處的夾角 φ 變大 → 關節轉動。行程有上下限，所以關節角度也有上下限。
(function (root) {
  'use strict';
  const DEG = Math.PI / 180;

  // 常見塑膠針筒約值（內徑各廠牌略有差異，實作時請自己量）
  function syr(ml, id) {
    const area = Math.PI * id * id / 4;
    return { ml, id, area, stroke: ml * 1000 / area };
  }
  const SYRINGES = { 5: syr(5, 12.5), 10: syr(10, 14.5), 20: syr(20, 19.1) };
  const SLAVE_ML = 10; // 手臂上的從動針筒一律 10 ml（固定座已依它的長度做好）

  // 四個關節的三角形連桿參數：a＝關節到「前一節」銷釘、b＝關節到「後一節」銷釘、L0＝針筒全縮時銷釘到銷釘長度
  // toAngle：把夾角 φ 換成這個關節對外的角度讀數
  // 10 ml 從動針筒全縮回時，兩端銷釘之間的長度約 95 mm（筒身約 80 mm＋推桿頭與固定耳；實作時量自己的針筒）
  const SLAVE_LEN0 = 95;
  // 四個關節的三角形連桿參數：a＝關節到「前一節」銷釘、b＝關節到「後一節」銷釘、L0＝針筒全縮時銷釘到銷釘長度（≥ 95）
  // toAngle：把夾角 φ 換成這個關節對外的角度讀數
  const JOINTS = [
    { key: 'base', name: '基座旋轉', a: 120, b: 45, L0: 95, unit: '°',
      desc: '從動針筒平放在底板上（固定端離轉軸 120 mm），推動轉盤上的槓桿（半徑 45 mm）',
      dir: '伸出 → 手臂向左轉（俯視逆時針）' },
    { key: 'shoulder', name: '大臂升降', a: 75, b: 100, L0: 105, unit: '°',
      desc: '從動針筒下端接底座立柱（肩關節下方 75 mm），上端接大臂（離肩關節 100 mm）',
      dir: '伸出 → 大臂抬高', toAngle: phi => phi - 90 },
    { key: 'elbow', name: '小臂彎伸', a: 100, b: 65, L0: 95, unit: '°',
      desc: '從動針筒沿大臂裝（離肘關節 100 mm），推桿接小臂（離肘關節 65 mm）',
      dir: '伸出 → 小臂伸直（往上抬）', toAngle: phi => 180 - phi },   // 讀數＝小臂相對大臂往下彎幾度
    { key: 'gripper', name: '夾爪開合', a: 120, b: 45, L0: 95, unit: '°',
      desc: '從動針筒沿小臂裝（離夾爪鉸鏈 120 mm），推桿接夾爪槓桿（45 mm），兩爪用齒輪同步',
      dir: '伸出 → 夾爪合起' },
  ];
  // 夾爪：爪長 60、兩鉸鏈相距 16；爪尖碰在一起的角度就是機械下限
  const JAW = { len: 60, halfGap: 8 };
  JAW.alphaMin = -Math.asin(JAW.halfGap / JAW.len) / DEG; // ≈ −7.66°（兩爪尖相碰）

  function phiFromLength(j, L) {
    const c = (j.a * j.a + j.b * j.b - L * L) / (2 * j.a * j.b);
    if (c <= -1 || c >= 1) return NaN; // 三角形不成立（設計錯誤，測試會抓）
    return Math.acos(c) / DEG;
  }
  function lengthFromPhi(j, phi) {
    return Math.sqrt(j.a * j.a + j.b * j.b - 2 * j.a * j.b * Math.cos(phi * DEG));
  }
  // 基座：讀數以行程中點為 0（左右對稱）；夾爪：全縮回時每片爪張開 50°，伸出時槓桿轉多少、爪就合多少
  {
    const S = 1000 * SLAVE_ML / (Math.PI * 14.5 * 14.5 / 4);
    const jb = JOINTS[0], jg = JOINTS[3];
    const mid = (phiFromLength(jb, jb.L0) + phiFromLength(jb, jb.L0 + S)) / 2;
    jb.toAngle = phi => phi - mid;
    const g0 = phiFromLength(jg, jg.L0);
    jg.toAngle = phi => 50 - (phi - g0);
  }
  // 從動針筒伸出量 x（0～行程）→ 關節讀數
  function jointAngle(i, x) { const j = JOINTS[i]; return j.toAngle(phiFromLength(j, j.L0 + x)); }
  // 關節讀數 → 需要的伸出量（反解，用二分法；toAngle 皆為 φ 的單調函數）
  function extForAngle(i, ang) {
    const S = SYRINGES[SLAVE_ML].stroke;
    let lo = 0, hi = S;
    const inc = jointAngle(i, S) > jointAngle(i, 0);
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      const v = jointAngle(i, mid);
      if ((v < ang) === inc) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  // 夾爪張開角 α → 兩爪尖距離
  function jawGap(alpha) { return 2 * (JAW.halfGap + JAW.len * Math.sin(alpha * DEG)); }
  function alphaForGap(gap) { return Math.asin((gap / 2 - JAW.halfGap) / JAW.len) / DEG; }

  // 手臂尺寸（側視，mm）：肩關節高 90、大臂 200、小臂 150、夾爪長 60
  const ARM = { shoulderH: 90, upper: 200, fore: 150, grip: JAW.len };

  // 一支手臂的狀態。opts.masterMl：控制台主動針筒規格（5/10/20）；opts.air：每一對管內殘留空氣體積（mm³，0＝排乾淨）
  function createArm(opts) {
    opts = opts || {};
    const masterMl = opts.masterMl || 10;
    const M = SYRINGES[masterMl], Sl = SYRINGES[SLAVE_ML];
    const air = opts.air || 0;           // 殘留空氣：要先被壓縮或拉開，從動端才會動
    const dead = air * 0.5;              // 推／拉換向時，空氣被壓縮（或拉開）吃掉的體積（約一半，示意值）
    // 充水量：主動端「全拉出」時從動端「全縮回」，總水量取兩者容量較小的一邊（避免從動端被推出筒外）
    // 有殘留空氣時，空氣佔掉一部分容量，水要少裝一點；再多留「空推量」的空間，主動端才能多拉一段把空氣拉開、讓從動端完全縮回
    const fill = Math.min(M.area * M.stroke, Sl.area * Sl.stroke) - air - dead;
    // 主動針筒的起始推入量：從動端全縮回時，水（和空氣）全部在主動針筒裡；大針筒或有空氣時只裝一部分，所以一開始就推進了一段
    const p0 = M.stroke - (fill + air) / M.area;
    const jawMech = extForAngle(3, JAW.alphaMin);   // 兩爪尖相碰時的伸出量（機械上限）
    const axes = JOINTS.map((j, i) => ({
      i, push: p0,            // 主動針筒推入量 mm（0＝活塞全拉出）
      vDisp: 0,               // 主動端推出去的水體積 mm³
      vSlave: 0,              // 從動端吸進的水體積 mm³（＝A從 × 伸出量）
      vAir: 0,                // 空氣被壓縮（正）或拉開（負）的體積 mm³
      xs: 0,                  // 從動針筒伸出量 mm
      xsMax: Sl.stroke,       // 從動端可伸出上限（行程，或夾爪夾到東西時更小）
      xsMin: 0,
    }));
    const arm = {
      masterMl, master: M, slave: Sl, fill, p0, air, dead, axes,
      // 主動針筒最多能推多少（水不可壓縮：從動端到底，主動端就推不動）
      pushLimits(i) {
        const ax = axes[i];
        const maxBySlave = p0 + (Sl.area * ax.xsMax + dead) / M.area;
        const minBySlave = p0 + (Sl.area * ax.xsMin - dead) / M.area;
        return { min: Math.max(0, minBySlave), max: Math.min(M.stroke, maxBySlave) };
      },
      // 設定主動針筒推入量；回傳實際值與是否被擋住
      setPush(i, p) {
        const ax = axes[i];
        const lim = arm.pushLimits(i);
        const want = p;
        p = Math.max(lim.min, Math.min(lim.max, p));
        ax.push = p;
        ax.vDisp = M.area * (p - p0);
        // 空氣：主動端推出的體積，先填補空氣的壓縮量，超過 ±dead 的部分才進到從動端
        let vs = ax.vSlave;
        if (ax.vDisp - vs > dead) vs = ax.vDisp - dead;
        else if (ax.vDisp - vs < -dead) vs = ax.vDisp + dead;
        vs = Math.max(Sl.area * ax.xsMin, Math.min(Sl.area * ax.xsMax, vs));
        ax.vSlave = vs;
        ax.vAir = ax.vDisp - vs;
        ax.xs = vs / Sl.area;
        return { push: p, limited: Math.abs(want - p) > 1e-6, lim };
      },
      // 直接擺到某個從動伸出量（起始姿勢用；空氣不受壓）
      place(i, xs) {
        const ax = axes[i];
        xs = Math.max(0, Math.min(xs, ax.xsMax, (M.area * (M.stroke - p0) - dead) / Sl.area)); // 水不夠時擺不到那麼遠
        ax.xs = xs; ax.vSlave = Sl.area * xs; ax.vAir = 0;
        ax.vDisp = ax.vSlave; ax.push = p0 + ax.vDisp / M.area;
      },
      // 讓夾爪在夾到東西時停住：從動端伸出上限縮小；傳 null 取消（回到「兩爪尖相碰」的機械上限）
      // 夾到的東西只會擋住「繼續合」，不會把已經合的爪推開，所以這裡不回頭改目前的伸出量
      setGripStop(xObj) { axes[3].xsMax = Math.min(Sl.stroke, jawMech, xObj == null ? Infinity : xObj); },
      pose() { return pose(axes.map(a => a.xs)); },
    };
    arm.setGripStop(null);
    return arm;
  }

  // 由四個從動針筒伸出量算出手臂姿態（側視座標：r＝離底座軸心水平距離，z＝高度）
  function pose(xs) {
    const yaw = jointAngle(0, xs[0]);
    const sh = jointAngle(1, xs[1]);
    const bend = jointAngle(2, xs[2]);
    const alpha = jointAngle(3, xs[3]);
    const S = { r: 0, z: ARM.shoulderH };
    const E = { r: S.r + ARM.upper * Math.cos(sh * DEG), z: S.z + ARM.upper * Math.sin(sh * DEG) };
    const foreAbs = sh - bend; // 小臂絕對角度
    const Wr = { r: E.r + ARM.fore * Math.cos(foreAbs * DEG), z: E.z + ARM.fore * Math.sin(foreAbs * DEG) };
    const T = { r: Wr.r + ARM.grip * Math.cos(foreAbs * DEG), z: Wr.z + ARM.grip * Math.sin(foreAbs * DEG) };
    return { yaw, shoulder: sh, bend, foreAbs, alpha, gap: jawGap(alpha), S, E, W: Wr, T };
  }

  const api = { DEG, SYRINGES, SLAVE_ML, SLAVE_LEN0, JOINTS, JAW, ARM, phiFromLength, lengthFromPhi, jointAngle, extForAngle, jawGap, alphaForGap, createArm, pose };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HAModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
