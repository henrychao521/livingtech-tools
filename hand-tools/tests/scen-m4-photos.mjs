// 模組 4：每個選項都有工具照片（「徒手按住」除外），照片都有出處，點選後仍正常判分
export default async (w, assert) => {
  const d = w.document;
  const btns = [...d.querySelectorAll('#quiz .choice')];
  assert.strictEqual(btns.length, 40, '10 題 × 4 選項');
  const credits = w.HT_PHOTO_CREDITS;
  for (const b of btns) {
    const imgs = [...b.querySelectorAll('.opt-fig img')];
    if (b.dataset.c === '徒手按住') { assert.strictEqual(imgs.length, 0); continue; }
    assert.ok(imgs.length >= 1, '缺照片：' + b.dataset.c);
    for (const im of imgs) { const k = im.getAttribute('src').match(/([a-z-]+)\.webp$/)[1]; assert.ok(credits[k], '缺出處：' + k); }
    assert.strictEqual(b.querySelector('.opt-label').textContent, b.dataset.c, '選項文字不變');
  }
  btns.find(b => b.dataset.q === '0' && b.dataset.c === '羊角鎚').click();
  assert.ok(d.querySelector('.quiz-item .feedback.success'), '答對要顯示正確回饋');
  assert.ok(d.querySelector('.photo-credits li'), '頁面要列照片出處');
};
