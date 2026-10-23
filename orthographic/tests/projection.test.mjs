// 第 3 關方塊堆疊：投影方向必須符合 CNS 第三角法，且與 3D 相機（在 +Z 前方）一致。
// 約定：projectGrid 回傳「畫面方向」的 2D 陣列，第 0 列畫在最上面。
//   正視：從 +Z 看，x 向右、y 向上
//   俯視：從 +Y 往下看，x 向右、前緣（z 大）在下方
//   右側視：從 +X 看，前方（z 大）在左、y 向上
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './_extract.mjs';

const M = load();
const T = Object.fromEntries(M.ROUND3.map(q => [q.label.startsWith('L') ? 'L' : 'T', q.target]));

test('L 型塊目標的三視圖', () => {
  assert.deepEqual(M.projectGrid(T.L, 'front'), [[1, 0, 0], [1, 0, 0], [1, 1, 1]]);
  // 全部方塊在 z=0（最後排）→ 俯視畫在最上列（後方）
  assert.deepEqual(M.projectGrid(T.L, 'top'), [[1, 1, 1], [0, 0, 0], [0, 0, 0]]);
  // 右側視前方在左 → z=0（後方）落在最右欄
  assert.deepEqual(M.projectGrid(T.L, 'side'), [[0, 0, 1], [0, 0, 1], [0, 0, 1]]);
});

test('T 形塊目標的三視圖（俯視是正立的 T）', () => {
  assert.deepEqual(M.projectGrid(T.T, 'front'), [[0, 0, 0], [0, 0, 0], [1, 1, 1]]);
  assert.deepEqual(M.projectGrid(T.T, 'top'), [[1, 1, 1], [0, 1, 0], [0, 1, 0]]);
  assert.deepEqual(M.projectGrid(T.T, 'side'), [[0, 0, 0], [0, 0, 0], [1, 1, 1]]);
});

test('單一方塊的方向：前、右、上各放一顆', () => {
  const g = M.makeEmptyGrid();
  g[2][0][2] = 1;                       // 右(x=2)、底(y=0)、前(z=2)
  assert.deepEqual(M.projectGrid(g, 'front'), [[0, 0, 0], [0, 0, 0], [0, 0, 1]]);
  assert.deepEqual(M.projectGrid(g, 'top'), [[0, 0, 0], [0, 0, 0], [0, 0, 1]]);   // 前緣在下、右在右
  assert.deepEqual(M.projectGrid(g, 'side'), [[0, 0, 0], [0, 0, 0], [1, 0, 0]]);  // 前方在左
});

test('第三角法的對齊：俯視的欄 = 正視的欄（長對正）；側視的列 = 正視的列（高平齊）', () => {
  for (let k = 0; k < 200; k++) {
    const g = M.makeEmptyGrid();
    const x = k % 3, y = (k >> 2) % 3, z = (k >> 4) % 3;
    g[x][y][z] = 1;
    const f = M.projectGrid(g, 'front'), t = M.projectGrid(g, 'top'), s = M.projectGrid(g, 'side');
    const col = a => a.findIndex(r => r.some(Boolean)) < 0 ? -1 : a.flat().indexOf(1) % 3;
    const row = a => Math.floor(a.flat().indexOf(1) / 3);
    assert.equal(col(f), col(t));
    assert.equal(row(f), row(s));
    // 寬相等：俯視由上往下的列序（後→前）= 側視由右往左的欄序（後→前）
    assert.equal(row(t), 2 - col(s));
  }
});

test('目標解答唯一：三視圖都相同的堆法只有目標本身（在三個投影都亮的格子裡窮舉）', () => {
  // 解答由三個剪影限制；檢查「三視圖相同但方塊數不同或位置不同」的反例是否存在（體積 ≤ 目標體積）
  for (const [name, tgt] of Object.entries(T)) {
    const cells = [];
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) cells.push([x, y, z]);
    const tf = M.projectGrid(tgt, 'front'), tt = M.projectGrid(tgt, 'top'), ts = M.projectGrid(tgt, 'side');
    // 可能有方塊的格子：三個投影都要亮
    const allowed = cells.filter(([x, y, z]) => {
      const g = M.makeEmptyGrid(); g[x][y][z] = 1;
      const ok = (a, b) => a.every((r, i) => r.every((v, j) => !v || b[i][j]));
      return ok(M.projectGrid(g, 'front'), tf) && ok(M.projectGrid(g, 'top'), tt) && ok(M.projectGrid(g, 'side'), ts);
    });
    let sols = 0;
    for (let mask = 1; mask < (1 << allowed.length); mask++) {
      const g = M.makeEmptyGrid();
      allowed.forEach(([x, y, z], i) => { if (mask & (1 << i)) g[x][y][z] = 1; });
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      if (same(M.projectGrid(g, 'front'), tf) && same(M.projectGrid(g, 'top'), tt) && same(M.projectGrid(g, 'side'), ts)) sols++;
    }
    assert.equal(sols, 1, `${name} 目標有 ${sols} 種堆法符合`);
  }
});

test('放棄後按「清空」會恢復計分（gaveUp 由 clearAll 重置，fillTarget 在 clearAll 之後才設）', async () => {
  const fs = await import('node:fs');
  const { MODULE5 } = await import('./_extract.mjs');
  const src = fs.readFileSync(MODULE5, 'utf8');
  const clear = src.slice(src.indexOf('function clearAll()'), src.indexOf('function fillTarget()'));
  assert.match(clear, /gaveUp\s*=\s*false/);
  const fill = src.slice(src.indexOf('function fillTarget()'));
  assert.ok(fill.indexOf('clearAll()') < fill.indexOf('gaveUp = true'), 'fillTarget 要先 clearAll() 再設 gaveUp = true');
  assert.ok(src.indexOf('let gaveUp') < src.indexOf('function clearAll()'), 'gaveUp 要在 clearAll 之前宣告');
});
