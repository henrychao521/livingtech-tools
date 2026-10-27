// 測驗正解唯一性檢查（給 test_quiz.mjs 命令列與 orthographic/tests/library.test.mjs 共用）
// 題型：
//   view 題    ：options[0] 的簽章＝題目物件該視圖的簽章；其他選項都不同；選項兩兩不同且肉眼看得出差異
//   triplet 題 ：options[0] 三個視圖都等於真實視圖；其他選項恰有一個視圖錯；選項兩兩不同
//   object 題  ：（視圖→物件）其他物件至少有一個視圖和正解物件不同 → 答案唯一
//   missing 題 ：（補缺失視圖）同 view 題，另外檢查題目給的兩個視圖確實是 obj 的
// 簽章＝線段集合（0.5 mm 量化）＋外框尺寸；「肉眼看得出」＝點陣（0.5 mm 格、±1 格容差）差異 ≥ 20 格。
function raster(v) {
  const s = new Set(); const b = v.box;
  for (const [k, arr] of [['v', v.vis], ['h', v.hid]]) for (const p of arr) for (let i = 0; i + 3 < p.length; i += 2) {
    const [x1, y1, x2, y2] = [p[i], p[i + 1], p[i + 2], p[i + 3]];
    const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2.5));
    for (let j = 0; j <= n; j++) s.add(k + Math.round((x1 + (x2 - x1) * j / n - b[0]) / 5) + ',' + Math.round((y1 + (y2 - y1) * j / n - b[1]) / 5));
  }
  s.add('box' + Math.round((b[2] - b[0]) / 5) + 'x' + Math.round((b[3] - b[1]) / 5));
  return s;
}
function rdiff(a, b) {   // a 有、b 附近（±1 格、同線型）沒有的點數，雙向相加
  const near = (S, key) => { const k = key[0]; if (k === 'b') return S.has(key); const [x, y] = key.slice(1).split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (S.has(k + (x + dx) + ',' + (y + dy))) return true; return false; };
  let d = 0; for (const k of a) if (!near(b, k)) d++; for (const k of b) if (!near(a, k)) d++; return d;
}

export function checkBank(OV, name, bank, log = console.log) {
  const sigOf = spec => OV.signature(OV.viewOf(spec));
  const visiblyDifferent = (s1, s2) => rdiff(raster(OV.viewOf(s1)), raster(OV.viewOf(s2))) >= 20;
  const fails = [];
  const fail = m => { fails.push(m); log('  ✗ ' + m); };
  log(`== ${name}：${bank.length} 題 ==`);
  bank.forEach((q, qi) => {
    const tag = `${name} 第 ${qi + 1} 題（${q.type}${q.obj ? ' ' + q.obj : ''}${q.ans ? ' ' + q.ans : ''}）`;
    const before = fails.length;
    if (q.type === 'view' || q.type === 'missing') {
      const truth = { obj: q.obj, view: q.view };
      const sigs = q.options.map(sigOf);
      if (sigs[0] !== sigOf(truth)) fail(`${tag}：正解和真實視圖不同`);
      q.options.forEach((o, i) => { if (i && sigs[i] === sigOf(truth)) fail(`${tag}：選項 ${i} 也等於正解`); });
      for (let i = 0; i < sigs.length; i++) for (let j = i + 1; j < sigs.length; j++) {
        if (sigs[i] === sigs[j]) fail(`${tag}：選項 ${i}、${j} 相同`);
        else if (!visiblyDifferent(q.options[i], q.options[j])) fail(`${tag}：選項 ${i}、${j} 差異太小`);
      }
      if (q.type === 'missing') for (const k of Object.keys(q.known || {})) {
        if (sigOf(q.known[k]) !== sigOf({ obj: q.obj, view: k })) fail(`${tag}：已知的 ${k} 不是 ${q.obj} 的 ${k}`);
      }
    } else if (q.type === 'triplet') {
      const keys = ['front', 'top', 'right'];
      const truth = keys.map(k => sigOf({ obj: q.obj, view: k })).join('#');
      const tri = q.options.map(o => keys.map(k => sigOf(o[k])).join('#'));
      if (tri[0] !== truth) fail(`${tag}：正解組合和真實三視圖不同`);
      tri.forEach((t, i) => { if (i && t === truth) fail(`${tag}：選項 ${i} 也完全正確`); });
      for (let i = 0; i < tri.length; i++) for (let j = i + 1; j < tri.length; j++) if (tri[i] === tri[j]) fail(`${tag}：選項 ${i}、${j} 相同`);
      q.options.forEach((o, i) => { if (!i) return; const bad = keys.filter(k => sigOf(o[k]) !== sigOf({ obj: q.obj, view: k }));
        if (bad.length !== 1) fail(`${tag}：干擾選項 ${i} 應恰有一個視圖錯（實際 ${bad.length}）`);
        else if (!visiblyDifferent(o[bad[0]], { obj: q.obj, view: bad[0] })) fail(`${tag}：干擾選項 ${i} 的錯誤太不明顯`); });
    } else if (q.type === 'object') {
      const keys = q.views || ['front', 'top', 'right'];
      const given = keys.map(k => sigOf({ obj: q.ans, view: k })).join('#');
      if (q.options[0] !== q.ans) fail(`${tag}：options[0] 應為正解物件`);
      const seen = new Set();
      q.options.forEach((id, i) => {
        if (seen.has(id)) fail(`${tag}：選項重複 ${id}`); seen.add(id);
        const s = keys.map(k => sigOf({ obj: id, view: k })).join('#');
        if (i && s === given) fail(`${tag}：物件 ${id} 的三視圖和正解一樣，答案不唯一`);
      });
    } else fail(`${tag}：未知題型`);
    if (fails.length === before) log('  ✓ ' + tag);
  });
  return fails;
}
