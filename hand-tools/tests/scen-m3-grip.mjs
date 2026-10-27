// 模組 3：10 張握姿卡、每張有示意圖與佔位文字（清單編號）；照片不存在時顯示佔位框
export default async (w, assert) => {
  const cards = w.document.querySelectorAll('#grip-grid .grip-card');
  assert.strictEqual(cards.length, 10, '握姿卡數量');
  cards.forEach((c, i) => {
    const no = 'H-' + String(i + 1).padStart(2, '0');
    assert.ok(c.textContent.includes(`握姿照片待補（清單編號 ${no}）`), no + ' 佔位文字');
    assert.ok(c.textContent.includes('示意，待換實拍'), no + ' 示意標記');
    assert.ok(c.querySelector('.grip-ph svg'), no + ' 示意圖');
    assert.ok(/assets\/grip\/[a-z-]+\.jpg$/.test(c.querySelector('.grip-ph code').textContent), no + ' 檔名');
    assert.strictEqual(c.querySelector('img'), null, no + ' 照片未列入 AVAILABLE 時不載入（避免 404）');
  });
};
