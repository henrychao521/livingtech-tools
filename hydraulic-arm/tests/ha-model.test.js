// 液壓手臂物理模型驗證：node hydraulic-arm/tests/ha-model.test.js
// 檢查：推/拉方向、每對只動一個關節、範圍上下限、體積守恆（等徑行程相等、不等徑行程比＝截面積反比）、空氣造成空推。
// 體積守恆用「獨立算法」對帳：直接由內徑重算截面積，不用模型裡的 area。
'use strict';
const assert = require('assert');
const path = require('path');
const H = require(path.join(__dirname, '..', 'js', 'ha-model.js'));

let pass = 0;
function ok(cond, msg) { assert.ok(cond, msg); pass++; }
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}：${a} vs ${b}`);
const areaOf = id => Math.PI * (id / 2) ** 2; // 獨立重算

// 1. 連桿三角形在整個行程都成立（|a−b| < L < a+b），角度連續、單調
const Sstroke = H.SYRINGES[H.SLAVE_ML].stroke;
H.JOINTS.forEach((j, i) => {
  let prev = null, dirSign = null;
  for (let k = 0; k <= 200; k++) {
    const x = Sstroke * k / 200;
    const L = j.L0 + x;
    ok(L > Math.abs(j.a - j.b) + 5 && L < j.a + j.b - 5, `${j.key} 三角形成立且留 5 mm 餘裕 x=${x.toFixed(1)}`);
    const ang = H.jointAngle(i, x);
    ok(Number.isFinite(ang), `${j.key} 角度有限`);
    if (prev !== null) {
      const s = Math.sign(ang - prev);
      ok(s !== 0, `${j.key} 嚴格單調`);
      if (dirSign === null) dirSign = s; else ok(s === dirSign, `${j.key} 單調方向一致`);
    }
    prev = ang;
  }
});

// 1b. 裝得出來：全縮回時的銷釘距離不能比針筒本身短
H.JOINTS.forEach(j => ok(j.L0 >= H.SLAVE_LEN0, `${j.key} L0=${j.L0} ≥ 針筒全縮回長度 ${H.SLAVE_LEN0}`));

// 2. 推→伸出、拉→縮回，且關節往說明文字寫的方向轉
const expectDir = { base: +1, shoulder: +1, elbow: -1, gripper: -1 }; // 讀數變化方向（伸出時）：基座左轉＋、大臂抬高＋、下彎角變小、張開角變小
[5, 10, 20].forEach(ml => {
  const arm = H.createArm({ masterMl: ml });
  H.JOINTS.forEach((j, i) => {
    const lim = arm.pushLimits(i);
    const mid = (lim.min + lim.max) / 2;
    arm.setPush(i, mid);
    const x0 = arm.axes[i].xs, p0 = arm.pose();
    const before = [p0.yaw, p0.shoulder, p0.bend, p0.alpha];
    arm.setPush(i, mid + 2);                              // 推 2 mm
    const x1 = arm.axes[i].xs, p1 = arm.pose();
    const after = [p1.yaw, p1.shoulder, p1.bend, p1.alpha];
    ok(x1 > x0, `${ml}ml ${j.key} 推→從動伸出`);
    ok(Math.sign(after[i] - before[i]) === expectDir[j.key], `${ml}ml ${j.key} 伸出時關節方向`);
    // 3. 每對只動一個關節
    before.forEach((v, k) => { if (k !== i) near(after[k], v, 1e-9, `${ml}ml 推第 ${i + 1} 對時第 ${k + 1} 軸不動`); });
    arm.setPush(i, mid - 2);                              // 拉
    ok(arm.axes[i].xs < x1, `${ml}ml ${j.key} 拉→從動縮回`);
  });
});

// 4. 體積守恆（無空氣）：主動擠出體積＝從動吸入體積；行程比＝截面積反比（用內徑獨立重算）
const report = [];
[5, 10, 20].forEach(ml => {
  const arm = H.createArm({ masterMl: ml });
  const Am = areaOf(H.SYRINGES[ml].id), As = areaOf(H.SYRINGES[H.SLAVE_ML].id);
  const i = 1;
  const lim = arm.pushLimits(i);
  let prevPush = arm.axes[i].push, prevXs = arm.axes[i].xs;
  for (let k = 1; k <= 50; k++) {
    const target = lim.min + (lim.max - lim.min) * (0.5 + 0.5 * Math.sin(k * 1.7)); // 來回亂推
    arm.setPush(i, target);
    const dPush = arm.axes[i].push - prevPush, dXs = arm.axes[i].xs - prevXs;
    near(Am * dPush, As * dXs, 1e-6, `${ml}ml 每一步 A主Δx主＝A從Δx從`);
    prevPush = arm.axes[i].push; prevXs = arm.axes[i].xs;
  }
  // 整段行程
  arm.setPush(i, lim.min); const xa = arm.axes[i].xs, pa = arm.axes[i].push;
  arm.setPush(i, lim.max); const xb = arm.axes[i].xs, pb = arm.axes[i].push;
  const ratio = (xb - xa) / (pb - pa);
  near(ratio, Am / As, 1e-9, `${ml}ml 行程比＝截面積反比`);
  if (ml === H.SLAVE_ML) near(xb - xa, pb - pa, 1e-9, '等徑針筒行程相等');
  report.push(`主動 ${ml} ml：主動行程 ${(pb - pa).toFixed(2)} mm → 從動行程 ${(xb - xa).toFixed(2)} mm（比 ${ratio.toFixed(4)}，A主/A從＝${(Am / As).toFixed(4)}）`);
});

// 5. 上下限：推超過 → 被擋在從動行程上限；拉超過 → 被擋在從動全縮回；角度落在範圍內
[5, 10, 20].forEach(ml => {
  const arm = H.createArm({ masterMl: ml });
  H.JOINTS.forEach((j, i) => {
    let r = arm.setPush(i, 999);
    ok(r.limited, `${ml}ml ${j.key} 推過頭會被擋`);
    const xsMax = arm.axes[i].xs;
    ok(xsMax <= arm.axes[i].xsMax + 1e-9 && xsMax <= Sstroke + 1e-9, `${ml}ml ${j.key} 不超過從動行程`);
    ok(arm.axes[i].push <= H.SYRINGES[ml].stroke + 1e-9, `${ml}ml ${j.key} 不超過主動行程`);
    r = arm.setPush(i, -999);
    ok(r.limited && arm.axes[i].xs >= -1e-9, `${ml}ml ${j.key} 拉過頭會被擋、不會變負`);
  });
});
// 主動 5 ml 的水只夠從動 10 ml 走約一半：5000/165.1 ≈ 30.3 mm
{
  const arm = H.createArm({ masterMl: 5 });
  arm.setPush(1, 999);
  near(arm.axes[1].xs, 5000 / areaOf(14.5), 0.2, '5 ml 主動只能推出約 30 mm 從動行程');
}
// 夾爪兩爪尖相碰就停
{
  const arm = H.createArm({ masterMl: 10 });
  arm.setPush(3, 999);
  const p = arm.pose();
  ok(p.gap >= -1e-6 && p.gap < 0.5, `夾爪合到爪尖相碰為止（間隙 ${p.gap.toFixed(3)} mm）`);
}
// 角度範圍
const ranges = H.JOINTS.map((j, i) => [H.jointAngle(i, 0), H.jointAngle(i, Sstroke)]);
near(ranges[0][0], -ranges[0][1], 0.2, '基座左右對稱');
ok(Math.abs(ranges[0][0]) < 90, '基座轉不到一整圈（< ±90°）');
ok(ranges[1][0] > -30 && ranges[1][1] < 90, '大臂仰角合理');

// 6. 空氣：換方向時有一段空推；體積帳用「推入量×A主」與「伸出量×A從」直接對帳（不用模型裡的 vAir）
{
  const air = 1500, dead = air / 2;
  const Am = areaOf(14.5), As = areaOf(14.5);
  const arm = H.createArm({ masterMl: 10, air });
  ok(arm.fill + air + dead <= Math.min(H.SYRINGES[10].ml, 10) * 1000 + 1e-6, '有空氣：水＋空氣＋空推空間不超過針筒容量');
  const i = 2;
  const lim = arm.pushLimits(i);
  const mid = (lim.min + lim.max) / 2;
  arm.setPush(i, mid);
  arm.setPush(i, mid + 3);                     // 先往推的方向推，空氣被壓縮到底
  const xs1 = arm.axes[i].xs;
  arm.setPush(i, arm.axes[i].push - 2);        // 換方向拉 2 mm（< 空推量 dead/A主 ≈ 4.5 mm）
  near(arm.axes[i].xs, xs1, 1e-9, '有空氣：換方向的前 2 mm 從動端不動');
  // 獨立對帳：主動端擠出的水量 − 從動端吸入的水量，只能落在 ±空推量內
  for (let k = 0; k < 40; k++) {
    arm.setPush(i, lim.min + (lim.max - lim.min) * (0.5 + 0.5 * Math.sin(k * 2.3)));
    const out = Am * (arm.axes[i].push - arm.p0), inn = As * arm.axes[i].xs;
    ok(Math.abs(out - inn) <= dead + 1e-6, `有空氣：體積差 ${(out - inn).toFixed(1)} 在 ±${dead} 內`);
  }
  // 拉到底能完全縮回（空氣被拉開）
  arm.setPush(i, 999); arm.setPush(i, -999);
  near(arm.axes[i].xs, 0, 1e-9, '有空氣：主動拉到底，從動端仍能完全縮回');
  // 有空氣時從動端到不了全行程（空氣佔掉容量）
  arm.setPush(i, 999);
  ok(arm.axes[i].xs < H.SYRINGES[10].stroke - 1, '有空氣：從動端伸不到全行程');
  // 無空氣時同樣動作，從動端會立刻跟著動
  const arm2 = H.createArm({ masterMl: 10 });
  arm2.setPush(i, mid + 1); const xs2 = arm2.axes[i].xs;
  arm2.setPush(i, mid - 1);
  ok(arm2.axes[i].xs < xs2 - 1, '無空氣：換方向立刻跟著動');
}
// 6b. 充水量與起始位置
[5, 10, 20].forEach(ml => {
  const arm = H.createArm({ masterMl: ml });
  const capM = areaOf(H.SYRINGES[ml].id) * H.SYRINGES[ml].stroke, capS = areaOf(14.5) * H.SYRINGES[10].stroke;
  ok(arm.fill <= capM + 1e-6 && arm.fill <= capS + 1e-6, `${ml}ml 水量不超過兩支針筒的容量`);
  near(arm.axes[0].push, arm.p0, 1e-9, `${ml}ml 起始：從動全縮回時主動在 p0`);
  near(arm.axes[0].xs, 0, 1e-9, `${ml}ml 起始從動全縮回`);
});
// 6c. 夾爪擋停：夾到東西上限縮小、取消後回到爪尖相碰的機械上限
{
  const arm = H.createArm({ masterMl: 10 });
  const xMech = H.extForAngle(3, H.JAW.alphaMin);
  near(arm.axes[3].xsMax, xMech, 1e-9, '夾爪預設上限＝爪尖相碰');
  const xBottle = H.extForAngle(3, H.alphaForGap(32));
  arm.setGripStop(xBottle); arm.setPush(3, 999);
  near(arm.pose().gap, 32, 1e-6, '夾到 32 mm 寬的東西就停在 32 mm');
  arm.setGripStop(null);
  near(arm.axes[3].xsMax, xMech, 1e-9, '取消後回到機械上限，不會變成整個行程');
  arm.setPush(3, 999);
  ok(arm.pose().gap > -1e-6, '取消後再推也不會讓兩爪互相穿過');
}

// 7. 任務可以完成（主動 10 ml、20 ml）：瓶子在右前方（基座讀數 −35°，右轉為負）、目標在左前方（+35°）
{
  let found = null;
  for (let a = 0; a <= Sstroke && !found; a += 0.5) for (let b = 0; b <= Sstroke && !found; b += 0.5) {
    const p = H.pose([H.extForAngle(0, -35), a, b, 0]); // 瓶子在右前方 35°
    const G = { r: p.W.r + 38 * Math.cos(p.foreAbs * H.DEG), z: p.W.z + 38 * Math.sin(p.foreAbs * H.DEG) };
    if (p.foreAbs <= -45 && Math.abs(G.r - 230) < 3 && G.z > 15 && G.z < 50) found = { a, b, p, G };
  }
  ok(found, '瓶子位置搆得到（夾爪朝下）');
  near(H.jointAngle(0, H.extForAngle(0, 35)), 35, 0.01, '目標方向（左 35°）在基座範圍內');
  // 主動針筒容量是否夠完成任務：要能把基座從 −35° 轉到 +35°
  [5, 10, 20].forEach(ml => {
    const arm = H.createArm({ masterMl: ml });
    arm.setPush(0, 999); const yMax = arm.pose().yaw;
    arm.setPush(0, -999); const yMin = arm.pose().yaw;
    const can = yMin <= -35 && yMax >= 35;
    if (ml >= 10) ok(can, `${ml}ml 主動針筒可以完成任務`);
    else ok(!can, '5 ml 主動針筒轉不到左邊目標（頁面上有說明）');
    report.push(`主動 ${ml} ml：基座可轉 ${yMin.toFixed(1)}° ～ ${yMax.toFixed(1)}°`);
  });
  report.push(`抓瓶姿勢範例：大臂 ${found.p.shoulder.toFixed(1)}°、小臂下彎 ${found.p.bend.toFixed(1)}°、抓取點 r=${found.G.r.toFixed(1)} z=${found.G.z.toFixed(1)}`);
}

console.log(report.join('\n'));
console.log(`ha-model：${pass} 項檢查全部通過`);
