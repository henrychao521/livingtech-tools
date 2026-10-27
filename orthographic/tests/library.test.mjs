// 物件庫、繪圖器、模組 5 題庫的測試：node --test orthographic/tests/
// （視圖線條本身的正確性由 models/orthographic/library/src/test_library.py 用另一種方法驗算，見該資料夾 README）
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBank } from '../../models/orthographic/library/src/quizcheck.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const R = p => path.join(root, p);
function load(extra = []) {
  const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['models/orthographic/library/library-data.js', 'orthographic/js/ortho-views.js', ...extra]) vm.runInContext(fs.readFileSync(R(f), 'utf8'), ctx);
  return ctx;
}
const ctx = load(['orthographic/js/ortho-bank.js']);
const L = ctx.ORTHO_LIB, OV = ctx.OrthoViews;

test('物件庫：18 個物件，每個都有六視圖＋等角圖、STL、等角渲染', () => {
  assert.equal(L.order.length, 18);
  for (const id of L.order) {
    const o = L.objects[id];
    for (const k of ['front', 'top', 'right', 'left', 'bottom', 'rear', 'iso']) assert.ok(o.views[k] && o.views[k].vis.length, `${id} 缺 ${k}`);
    assert.ok(fs.existsSync(R(`models/orthographic/library/${id}.stl`)), id + '.stl');
    assert.ok(fs.existsSync(R(`models/orthographic/library/${id}-iso.webp`)), id + '-iso.webp');
  }
});

test('外框一致：長對正、高平齊、寬相等（六個視圖）', () => {
  for (const id of L.order) {
    const V = L.objects[id].views, w = k => V[k].box[2] - V[k].box[0], h = k => V[k].box[3] - V[k].box[1];
    assert.ok(w('front') === w('top') && w('top') === w('bottom') && w('bottom') === w('rear'), id + ' 長對正');
    assert.ok(h('front') === h('right') && h('right') === h('left') && h('left') === h('rear'), id + ' 高平齊');
    assert.ok(h('top') === w('right') && w('right') === w('left') && w('left') === h('bottom'), id + ' 寬相等');
  }
});

/* 從 SVG 抓每個視圖群組的線條範圍（獨立於排版程式的算法） */
function groupExtents(svg) {
  const out = {};
  for (const m of svg.matchAll(/<g data-view="(\w+)">(.*?)<\/g>/g)) {
    const nums = [...m[2].matchAll(/data-k="visible" d="([^"]+)"/g)].flatMap(x => [...x[1].matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(p => [+p[1], +p[2]]));
    out[m[1]] = [Math.min(...nums.map(p => p[0])), Math.min(...nums.map(p => p[1])), Math.max(...nums.map(p => p[0])), Math.max(...nums.map(p => p[1]))];
  }
  return out;
}
test('第三角法排版：俯視在正視正上方、右側視在正右方、仰視在下、左側視在左、後視在右側視右邊', () => {
  for (const id of L.order) {
    const e = groupExtents(OV.svgLayout(L.objects[id].views, 'six', { maxWidth: 600 }));
    const F = e.front, near = (a, b) => Math.abs(a - b) <= 0.6;
    assert.ok(near(e.top[0], F[0]) && near(e.top[2], F[2]) && e.top[3] < F[1], id + ' 俯視');
    assert.ok(near(e.bottom[0], F[0]) && near(e.bottom[2], F[2]) && e.bottom[1] > F[3], id + ' 仰視');
    assert.ok(near(e.right[1], F[1]) && near(e.right[3], F[3]) && e.right[0] > F[2], id + ' 右側視');
    assert.ok(near(e.left[1], F[1]) && near(e.left[3], F[3]) && e.left[2] < F[0], id + ' 左側視');
    assert.ok(near(e.rear[1], F[1]) && near(e.rear[3], F[3]) && e.rear[0] > e.right[2], id + ' 後視');
    assert.ok(near(e.top[3] - e.top[1], e.right[2] - e.right[0]), id + ' 寬相等');
  }
});

test('線型：可見線實線、隱藏線虛線、中心線鏈線（四段式 dasharray）', () => {
  const svg = OV.svgLayout(L.objects.bracket.views, 'three', { maxWidth: 400 });
  assert.match(svg, /data-k="visible"[^>]*stroke-linecap="round"/);
  assert.doesNotMatch(svg.match(/<path data-k="visible"[^>]*>/)[0], /dasharray/);
  assert.match(svg, /data-k="hidden"[^>]*stroke-dasharray="[\d.]+ [\d.]+"/);
  assert.match(svg, /data-k="center"[^>]*stroke-dasharray="[\d.]+ [\d.]+ [\d.]+ [\d.]+"/);
  const w = k => +svg.match(new RegExp(`data-k="${k}"[^>]*stroke-width="([\\d.]+)"`))[1];
  assert.ok(w('visible') > w('hidden') && w('hidden') > w('center'), '粗 > 中 > 細');
});

test('模組 5 第 1、2 回合：每一題的正解只對應一個選項', () => {
  const fails = [...checkBank(OV, 'round1', ctx.ORTHO_BANK_M5.round1, () => {}), ...checkBank(OV, 'round2', ctx.ORTHO_BANK_M5.round2, () => {})];
  assert.deepEqual(fails, []);
  assert.equal(ctx.ORTHO_BANK_M5.round1.length, 6);
  assert.equal(ctx.ORTHO_BANK_M5.round2.length, 6);
});

test('檢查器本身抓得到錯（反向題庫每題都要被判不合格）', () => {
  const neg = load(['models/orthographic/library/src/quiz_neg_bank.js']);
  neg.ORTHO_QUIZ_NEG.forEach((q, i) => assert.ok(checkBank(neg.OrthoViews, 'neg', [q], () => {}).length > 0, `反向第 ${i + 1} 題沒被抓到`));
});

test('模組 3：8 張步驟示意圖都在', () => {
  for (let i = 1; i <= 8; i++) {
    const s = fs.readFileSync(R(`orthographic/assets/steps/step${i}.svg`), 'utf8');
    assert.match(s, /^<svg [^>]*viewBox="0 0 \d+ \d+"/);
  }
});
