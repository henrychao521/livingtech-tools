// 模組 4：觸控拖曳時，烙鐵頭畫在觸控點左上方；滑鼠時就在游標上
export default async (w, assert) => {
  const cv = w.document.getElementById('solder-canvas');
  cv.getBoundingClientRect = () => ({ left: 26, top: 300, width: 341, height: 224.34, right: 367, bottom: 524.34 });
  w.document.getElementById('btn-start').click();
  const s = 760 / 341;
  const fire = (type, x, y, pt) => { const e = new w.Event(type, { bubbles: true }); Object.assign(e, { clientX: x, clientY: y, pointerType: pt, pointerId: 1, preventDefault() {} }); cv.dispatchEvent(e); };
  fire('pointerdown', 26 + 200, 300 + 150, 'touch');
  fire('pointermove', 26 + 200, 300 + 150, 'touch');
  await new Promise(r => setTimeout(r, 120));
  // 找最後一次 drawIron 的 translate（握柄平移到烙鐵頭）
  const tr = w.__canvasCalls.filter(c => c[0] === 'translate').map(c => c[1]);
  const last = tr[tr.length - 1];
  assert.ok(last, '沒有畫烙鐵');
  assert.ok(Math.abs(last[0] - (200 - 24) * s) < 0.01 && Math.abs(last[1] - (150 - 72) * s) < 0.01, `觸控頭部位置 ${last}`);
  assert.ok(w.__canvasCalls.some(c => c[0] === 'drawImage'), '觸控時要畫放大鏡');
  fire('pointerup', 26 + 200, 300 + 150, 'touch');
  w.__canvasCalls.length = 0;
  fire('pointermove', 26 + 100, 300 + 100, 'mouse');
  await new Promise(r => setTimeout(r, 120));
  const tr2 = w.__canvasCalls.filter(c => c[0] === 'translate').map(c => c[1]);
  const l2 = tr2[tr2.length - 1];
  assert.ok(Math.abs(l2[0] - 100 * s) < 0.01 && Math.abs(l2[1] - 100 * s) < 0.01, `滑鼠頭部位置 ${l2}`);
  assert.ok(!w.__canvasCalls.some(c => c[0] === 'drawImage'), '滑鼠不畫放大鏡');
};
