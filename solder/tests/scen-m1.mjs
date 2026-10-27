// 模組 1：部位點選後顯示說明（有照片的部位帶照片）；烙鐵頭圖鑑 5 種都畫得出外形；不再有重複的焊點放大鏡與保養四步驟
export default async (w, assert) => {
  const d = w.document;
  d.querySelector('.hotspot-group[data-id="stand"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.ok(d.querySelector('#parts-info .part-photo img'), '烙鐵架要附實物照片');
  for (const id of ['conical', 'chisel', 'bevel', 'knife', 'micro']) {
    d.querySelector(`#tip-tabs [data-tip="${id}"]`).click();
    const svg = d.querySelector('#tip-detail svg.tip-figure');
    assert.ok(svg && svg.querySelectorAll('path, circle').length >= 3, id + ' 外形圖');
    assert.ok(!/°C/.test(d.getElementById('tip-detail').textContent), id + ' 不再列沒有出處的溫度');
  }
  assert.ok(!d.getElementById('solder-quality'), '焊點放大鏡已移到模組 5');
  assert.ok(!d.getElementById('tinning-practice'), '保養四步驟已併入模組 3');
  assert.ok(!/object-fit:cover/.test(d.body.innerHTML), '照片不可裁切');
  assert.strictEqual(d.getElementById('iron-svg').getAttribute('viewBox'), '0 128 600 352');
};
