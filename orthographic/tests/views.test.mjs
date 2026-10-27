// 第 1、2 關的 SVG 標準視圖：要和 models/orthographic/*.scad 的實際立體一致（OpenSCAD 的 -Y 是正面），
// 並滿足「長對正、高平齊、寬相等」——三個視圖以同一比例尺、各自置中在同尺寸方格內。
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './_extract.mjs';
import { parse, body, lines, pts, vert, horiz, near } from './_svg.mjs';

const M = load();
const SIZES = [80, 90, 160];
const V = (type, s) => parse(M.svgView(type, s));
const B = (type, s) => body(V(type, s), M.VIEW_FG);

const ALL_TYPES = new Set();
for (const sh of Object.values(M.SHAPES)) ['front', 'side', 'top'].forEach(k => ALL_TYPES.add(sh[k]));
M.ROUND1.forEach(q => q.views.forEach(v => ALL_TYPES.add(v)));
M.ROUND2.forEach(q => { q.options.forEach(v => ALL_TYPES.add(v)); Object.values(q.known).forEach(v => ALL_TYPES.add(v)); });

test('所有用到的視圖類型都畫得出來（不是問號）', () => {
  for (const t of ALL_TYPES) {
    const svg = M.svgView(t, 80);
    assert.ok(!svg.includes('<text'), `${t} 落到預設的問號`);
    assert.ok(svg.includes(`fill="${M.VIEW_FG}"`), `${t} 沒有主體外形`);
  }
});

test('每個立體的三視圖：長對正、高平齊、寬相等，且置中', () => {
  for (const [name, sh] of Object.entries(M.SHAPES)) {
    for (const s of SIZES) {
      const f = B(sh.front, s), t = B(sh.top, s), d = B(sh.side, s);
      const msg = `${name} @${s}`;
      assert.ok(near(f.w, t.w), `${msg} 長對正：正視寬 ${f.w} ≠ 俯視寬 ${t.w}`);
      assert.ok(near(f.h, d.h), `${msg} 高平齊：正視高 ${f.h} ≠ 側視高 ${d.h}`);
      assert.ok(near(t.h, d.w), `${msg} 寬相等：俯視深 ${t.h} ≠ 側視寬 ${d.w}`);
      for (const b of [f, t, d]) {
        assert.ok(near(b.cx, s / 2) && near(b.cy, s / 2), `${msg} 沒有置中`);
        assert.ok(b.x0 >= 0 && b.y0 >= 0 && b.x1 <= s && b.y1 <= s, `${msg} 超出方格`);
      }
    }
  }
});

// 階梯塊與 L 型塊：正視 L 形的內角，要在俯視出現垂直可見線（長對正）、在側視出現水平可見線（高平齊）
for (const name of ['lblock', 'step']) {
  test(`${name}：俯視、側視畫出高低交界的可見線，位置與正視內角對齊`, () => {
    const sh = M.SHAPES[name];
    for (const s of SIZES) {
      const fe = V(sh.front, s), f = body(fe, M.VIEW_FG);
      assert.equal(f.el.tag, 'polygon');
      const inner = pts(f.el.a).filter(([x, y]) => x > f.x0 + 1e-6 && x < f.x1 - 1e-6 && y > f.y0 + 1e-6 && y < f.y1 - 1e-6);
      assert.equal(inner.length, 1, `${name} 正視應恰有一個內角`);
      const [ix, iy] = inner[0];
      const tv = lines(V(sh.top, s), 'visible').filter(vert);
      assert.equal(tv.length, 1, `${name} 俯視應有一條垂直可見線`);
      assert.ok(near(tv[0].x1, ix) && !tv[0].dashed);
      const t = B(sh.top, s);
      assert.ok(near(Math.min(tv[0].y1, tv[0].y2), t.y0) && near(Math.max(tv[0].y1, tv[0].y2), t.y1), '俯視分界線要貫穿全深');
      const sv = lines(V(sh.side, s), 'visible').filter(horiz);
      assert.equal(sv.length, 1, `${name} 側視應有一條水平可見線`);
      assert.ok(near(sv[0].y1, iy) && !sv[0].dashed);
      const d = B(sh.side, s);
      assert.ok(near(Math.min(sv[0].x1, sv[0].x2), d.x0) && near(Math.max(sv[0].x1, sv[0].x2), d.x1), '側視分界線要貫穿全寬');
    }
  });
}

test('lblock 與 step 的比例與模型一致（L 型塊豎臂 1/3、階梯塊上層 1/2；低段高 1/2）', () => {
  for (const [name, arm] of [['lblock', 1 / 3], ['step', 1 / 2]]) {
    const f = B(M.SHAPES[name].front, 160);
    const [ix, iy] = pts(f.el.a).filter(([x, y]) => x > f.x0 + 1e-6 && x < f.x1 - 1e-6 && y > f.y0 + 1e-6 && y < f.y1 - 1e-6)[0];
    assert.ok(near((ix - f.x0) / f.w, arm, 0.01), `${name} 豎臂比例`);
    assert.ok(near((iy - f.y0) / f.h, 0.5, 0.01), `${name} 低段高度比例`);
  }
  // 外形比例（寬:深:高）：lblock 90:40:60、step 80:40:60
  for (const [name, W, D, H] of [['lblock', 90, 40, 60], ['step', 80, 40, 60]]) {
    const f = B(M.SHAPES[name].front, 160), t = B(M.SHAPES[name].top, 160);
    assert.ok(near(f.h / f.w, H / W, 0.01) && near(t.h / t.w, D / W, 0.01), `${name} 外形比例`);
  }
});

test('帶圓孔板：隱藏線間距 = 孔徑、對齊孔心、隨尺寸縮放；有中心線', () => {
  const sh = M.SHAPES.hole;
  let ratio = null;
  for (const s of SIZES) {
    const fe = V(sh.front, s);
    const hole = fe.filter(e => e.tag === 'circle').map(e => ({ cx: +e.a.cx, cy: +e.a.cy, r: +e.a.r })).filter(c => c.r > 3);
    assert.equal(hole.length, 1, '正視應有一個孔');
    const { cx, cy, r } = hole[0];
    if (ratio === null) ratio = r / s; else assert.ok(near(r / s, ratio, 1e-6), '孔徑要隨尺寸縮放');
    const tv = lines(V(sh.top, s), 'hidden').filter(vert).map(l => l.x1).sort((a, b) => a - b);
    assert.equal(tv.length, 2); assert.ok(near(tv[0], cx - r) && near(tv[1], cx + r), `俯視虛線 ${tv} vs 孔 ${cx}±${r}`);
    const sv = lines(V(sh.side, s), 'hidden').filter(horiz).map(l => l.y1).sort((a, b) => a - b);
    assert.equal(sv.length, 2); assert.ok(near(sv[0], cy - r) && near(sv[1], cy + r), `側視虛線 ${sv} vs 孔 ${cy}±${r}`);
    for (const l of [...lines(V(sh.top, s), 'hidden'), ...lines(V(sh.side, s), 'hidden')]) assert.ok(l.dashed);
    for (const v of [sh.front, sh.top, sh.side]) assert.ok(lines(V(v, s), 'center').length >= 1, `${v} 缺中心線`);
    // 外形 80:50:50、孔徑 36
    const f = B(sh.front, s);
    assert.ok(near(f.h / f.w, 50 / 80, 0.01) && near(2 * r / f.w, 36 / 80, 0.01), '帶圓孔板比例');
  }
});

test('L 角架：正視有內角隱藏線、側視有前臂交界可見線、俯視 L 形腳厚 1/4', () => {
  const sh = M.SHAPES.bracket;
  for (const s of SIZES) {
    const f = B(sh.front, s), d = B(sh.side, s), t = B(sh.top, s);
    const fh = lines(V(sh.front, s), 'hidden').filter(vert);
    assert.equal(fh.length, 1); assert.ok(fh[0].dashed && near(fh[0].x1, f.x0 + f.w / 4));
    const sv = lines(V(sh.side, s), 'visible').filter(vert);
    assert.equal(sv.length, 1); assert.ok(!sv[0].dashed && near(sv[0].x1, d.x0 + d.w / 4));
    assert.equal(t.el.tag, 'polygon');
    const p = pts(t.el.a); assert.equal(p.length, 6);
    // 豎腳在左（x0..x0+w/4）、橫腳在前（下方 y1-h/4..y1）
    assert.ok(p.some(([x, y]) => near(x, t.x0 + t.w / 4) && near(y, t.y1 - t.h / 4)), '俯視內角位置');
    assert.ok(near(f.h / f.w, 40 / 60, 0.01) && near(t.h / t.w, 1, 0.01), '角架比例 60:60:40');
  }
});

test('T 槽塊：正視、側視以虛線畫出槽（槽深一半），俯視畫出 T 形槽口；三視圖互相對齊', () => {
  const sh = M.SHAPES.tslot;
  for (const s of SIZES) {
    const f = B(sh.front, s), d = B(sh.side, s), t = B(sh.top, s);
    assert.ok(near(f.h / f.w, 60 / 80, 0.01) && near(t.h / t.w, 30 / 80, 0.01), 'T 槽塊比例 80:30:60');
    const fl = lines(V(sh.front, s), 'hidden');
    fl.forEach(l => assert.ok(l.dashed));
    const fx = fl.filter(vert).map(l => (l.x1 - f.x0) / f.w).sort((a, b) => a - b);
    assert.deepEqual(fx.map(v => +v.toFixed(3)), [1 / 8, 3 / 8, 5 / 8, 7 / 8].map(v => +v.toFixed(3)), '正視虛線 x 位置');
    const ffloor = fl.filter(horiz);
    assert.equal(ffloor.length, 1); assert.ok(near(ffloor[0].y1, f.y0 + f.h / 2), '正視槽底在一半高');
    const sl = lines(V(sh.side, s), 'hidden');
    sl.forEach(l => assert.ok(l.dashed));
    const sx = sl.filter(vert).map(l => (l.x1 - d.x0) / d.w).sort((a, b) => a - b);
    assert.deepEqual(sx.map(v => +v.toFixed(3)), [1 / 6, 2 / 3].map(v => +v.toFixed(3)), '側視虛線（前方在左）');
    const sfloor = sl.filter(horiz);
    assert.equal(sfloor.length, 1); assert.ok(near(sfloor[0].y1, ffloor[0].y1), '高平齊：槽底同高');
    assert.ok(near(Math.max(sfloor[0].x1, sfloor[0].x2), d.x1), '槽從背面穿出：側視槽底虛線延伸到右緣（後方）');
    const te = V(sh.top, s);
    const pl = te.filter(e => e.tag === 'polyline' && e.a['data-k'] === 'visible');
    assert.equal(pl.length, 1, '俯視要有一條 T 形槽口可見線');
    const exp = [[1 / 8, 0], [1 / 8, 1 / 3], [3 / 8, 1 / 3], [3 / 8, 5 / 6], [5 / 8, 5 / 6], [5 / 8, 1 / 3], [7 / 8, 1 / 3], [7 / 8, 0]]
      .map(([u, v]) => [t.x0 + u * t.w, t.y0 + v * t.h]);
    const got = pts(pl[0].a);
    assert.equal(got.length, 8);
    got.forEach((p, i) => assert.ok(near(p[0], exp[i][0]) && near(p[1], exp[i][1]), `俯視槽口第 ${i} 點 ${p} 應為 ${exp[i]}`));
    // 寬相等：俯視由下往上量的深度 = 側視由左往右量的深度
    assert.ok(near((t.y1 - (t.y0 + 5 / 6 * t.h)) / t.h, sx[0]) && near((t.y1 - (t.y0 + t.h / 3)) / t.h, sx[1]));
    assert.ok(near(f.h, d.h), '高平齊');
  }
});

test('第 1 關：題目視圖 = 標準答案視圖，選項中只有一個立體的三視圖相同', () => {
  for (const q of M.ROUND1) {
    const S = M.SHAPES[q.ans];
    assert.deepEqual([...q.views], [S.front, S.side, S.top], `${q.ans} 題目視圖與 SHAPES 不一致`);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.options.includes(q.ans));
    const key = o => [M.SHAPES[o].front, M.SHAPES[o].side, M.SHAPES[o].top].join('|');
    const hits = q.options.filter(o => key(o) === key(q.ans));
    assert.deepEqual([...hits], [q.ans], `${q.ans} 題有其他選項三視圖相同：${hits}`);
  }
});

test('第 2 關：已知視圖與 SHAPES 一致，四個選項畫出來都不同，恰一個正確', () => {
  for (const q of M.ROUND2) {
    const S = M.SHAPES[q.shape];
    for (const [k, v] of Object.entries(q.known)) assert.equal(v, S[k], `${q.shape} 已知 ${k}`);
    assert.ok(!(q.missing in q.known));
    assert.equal(new Set(q.options).size, q.options.length);
    assert.equal(new Set(q.options.map(o => M.svgView(o, 80))).size, q.options.length, '有兩個選項畫出來一樣');
    assert.equal(q.options.filter(o => o === S[q.missing]).length, 1, `${q.shape} 缺 ${q.missing} 的正解不在選項或重複`);
  }
});
