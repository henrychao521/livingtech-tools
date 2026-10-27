// 模組 2：四件正確配備都能放到對應位置、場景出現對應圖形，錯誤物品顯示說明書／法規理由
import fs from 'node:fs';
export default async (w, assert) => {
  const d = w.document;
  const pick = id => d.querySelector(`.draggable[data-id="${id}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const zone = acc => d.querySelector(`.svg-dropzone[data-accept="${acc}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  pick('paper'); zone('iron-stand');
  assert.ok(/HAKKO/.test(d.getElementById('dressup-feedback').textContent), '錯誤物品要顯示說明書理由');
  for (const id of ['goggles', 'apron', 'ventilation', 'iron-stand']) { pick(id); zone(id); assert.ok(d.querySelector('.equip-' + id), id + ' 沒出現在場景'); }
  assert.strictEqual(d.querySelectorAll('.draggable.placed').length, 4);
  if (process.env.M2_SVG_OUT) fs.writeFileSync(process.env.M2_SVG_OUT, d.querySelector('#scene svg').outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1080" ').replace(/opacity="0"/g, 'opacity="1"'));
};
