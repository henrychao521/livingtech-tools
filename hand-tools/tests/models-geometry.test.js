// node hand-tools/tests/models-geometry.test.js
// 從 models/hand-tools/*.stl（OpenSCAD 輸出）獨立檢查容易畫錯的外形：鋸齒方向、捲尺鉤頭、美工刀推鈕與刀尖、中心衝錐角、C 型夾螺桿
const fs = require('fs'), path = require('path'), assert = require('assert');
const M = path.join(__dirname, '../../models/hand-tools');
const V = n => [...fs.readFileSync(path.join(M, n + '.stl'), 'utf8').matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].map(m => m.slice(1).map(Number));
// 夾背鋸（推切）：齒尖靠近每齒的鋸尖側（x 小的那側），握把在 +x
const saw = V('saw');
const tips = [...new Set(saw.filter(p => Math.abs(p[2] + 6) < 0.01 && p[0] < 125).map(p => +p[0].toFixed(2)))].sort((a, b) => a - b);
const handleMin = Math.min(...saw.filter(p => p[0] > 125).map(p => p[0]));
assert.ok(handleMin > 120, '握把在 +x');
for (const t of tips) { const base = Math.floor(t / 8) * 8; assert.ok(t - base < 2, `齒尖 ${t} 要靠鋸尖側（推切）`); }
// 捲尺：鉤頭在尺帶末端向下（低於殼底 z=0）
const tape = V('measure');
const low = tape.filter(p => p[2] < -3);
assert.ok(low.length && low.every(p => p[0] < -58), '鉤頭向下且在尺帶末端');
// 美工刀：刀尖（最前端）在刃側（+y），推鈕在背脊（-y 面外）
const knife = V('knife');
const tip = knife.reduce((a, b) => (b[0] > a[0] ? b : a));
assert.ok(tip[1] > 5, `刀尖 ${tip} 要在刃側`);
assert.ok(knife.some(p => p[0] > 19 && p[0] < 31 && p[1] < -8), '推鈕在 -y 背脊');
// 中心衝：錐尖約 90°（高 = 底半徑）
const punch = V('punch');
const zmin = Math.min(...punch.map(p => p[2]));
const cone = punch.filter(p => Math.abs(p[2] - (zmin + 4)) < 1e-6).map(p => Math.hypot(p[0], p[1]));
assert.ok(Math.abs(Math.max(...cone) - 4) < 0.05, '錐高 4 時底半徑 4（90°）');
// C 型夾：螺桿穿出上臂（上臂頂 z=38），T 形手把在上臂上方
const clamp = V('clamp');
assert.ok(Math.max(...clamp.map(p => p[2])) >= 48.9, '螺桿與 T 形手把要在上臂上方');
console.log('models-geometry: 全部通過');
