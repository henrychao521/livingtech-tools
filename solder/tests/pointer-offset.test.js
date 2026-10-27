// node solder/tests/pointer-offset.test.js
// 觸控時烙鐵頭＝觸控點＋偏移（CSS 像素 左 24、上 72，依畫布縮放換算）；滑鼠、觸控筆不偏移；結果夾在畫布內
const assert = require('assert');
const P = require('../js/pointer-offset.js');
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, `${m}: ${a} ≠ ${b}`);
// iPhone 直式：畫布 760×500 顯示成 341×224.3 CSS 像素（393 寬 − 頁邊 16×2 − 外框 10×2）
const rect = { left: 26, top: 300, width: 341, height: 341 * 500 / 760 };
const cw = 760, ch = 500, s = cw / rect.width;
// 1. 觸控：頭部座標 = 觸控點 + 偏移
const ev = { clientX: 26 + 200, clientY: 300 + 150, pointerType: 'touch' };
const t = P.tipFromPointer(ev, rect, cw, ch);
near(t.fingerX, 200 * s, 'fingerX'); near(t.fingerY, 150 * s, 'fingerY');
near(t.x, (200 + P.OFFSETS.touch.dx) * s, 'touch tip x');
near(t.y, (150 + P.OFFSETS.touch.dy) * s, 'touch tip y');
assert.ok(t.offset, 'touch 要標記 offset');
// 偏移距離在 60–80 pt 之間（題目要求），而且在上方
const d = Math.hypot(P.OFFSETS.touch.dx, P.OFFSETS.touch.dy);
assert.ok(d >= 60 && d <= 80, `偏移距離 ${d}`);
assert.ok(P.OFFSETS.touch.dy < 0 && P.OFFSETS.touch.dx <= 0, '要在左上方');
// 2. 滑鼠：不偏移
const m = P.tipFromPointer({ ...ev, pointerType: 'mouse' }, rect, cw, ch);
near(m.x, 200 * s, 'mouse x'); near(m.y, 150 * s, 'mouse y'); assert.ok(!m.offset);
// 3. 觸控筆：不偏移
const pn = P.tipFromPointer({ ...ev, pointerType: 'pen' }, rect, cw, ch);
near(pn.x, m.x, 'pen x'); near(pn.y, m.y, 'pen y');
// 4. 觸控點太靠上：頭部夾在畫布內（y=0），不會跑出去
const top = P.tipFromPointer({ clientX: 26 + 10, clientY: 300 + 20, pointerType: 'touch' }, rect, cw, ch);
near(top.y, 0, 'clamp y'); near(top.x, 0, 'clamp x');
// 5. 要讓頭部碰到 L1 接點 (380,250)，手指要放在接點右下方，且手指仍在畫布範圍內
const fx = 380 / s - P.OFFSETS.touch.dx, fy = 250 / s - P.OFFSETS.touch.dy;
assert.ok(fy <= rect.height, `手指 y ${fy} 超出畫布高 ${rect.height}`);
const hit = P.tipFromPointer({ clientX: 26 + fx, clientY: 300 + fy, pointerType: 'touch' }, rect, cw, ch);
near(hit.x, 380, 'hit x'); near(hit.y, 250, 'hit y');
// 6. 所有關卡的接點都能用手指碰到（手指位置在畫布內）
for (const [x, y] of [[240, 250], [520, 250], [320, 220], [440, 280], [480, 250]]) {
  const fy2 = y / s - P.OFFSETS.touch.dy, fx2 = x / s - P.OFFSETS.touch.dx;
  assert.ok(fy2 <= rect.height && fx2 <= rect.width, `接點 (${x},${y}) 手指碰不到`);
}
console.log('pointer-offset: 全部通過');
