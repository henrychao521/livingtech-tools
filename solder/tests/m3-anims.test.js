// node solder/tests/m3-anims.test.js
// 獨立計算模組 3 剖面動畫的幾何：烙鐵頭端面同時碰焊墊與元件腳、錫絲在對側碰焊墊與元件腳、兩者不相碰、
// 焊角是凹面、步驟 7 先移開錫絲而烙鐵不動、步驟 8 沒有錫絲；每張 SVG 都能解析。
const assert = require('assert');
global.window = {};
require('../js/module3-anims.js');
const A = window.SOLDER_M3_ANIMS, G = window.SOLDER_M3_GEOM;
const PAD_Y = 146, LEAD_L = 197, LEAD_R = 203;
const rot = (tx, ty, deg, lx, ly) => { const r = deg * Math.PI / 180; return [tx + lx * Math.cos(r) - ly * Math.sin(r), ty + lx * Math.sin(r) + ly * Math.cos(r)]; };
const num = (s, re) => { const m = s.match(re); assert.ok(m, re); return m.slice(1).map(Number); };
// 1. 烙鐵頭端面兩角：一角在焊墊上緣、一角在元件腳左側面（誤差 0.3）
const heat = A['heat-pad'];
const [itx, ity] = num(heat, /translate\(([\d.]+),([\d.]+)\) rotate\(45\)/);
const [ex, ey] = num(heat, /points="([\d.]+),-([\d.]+) /); // 端面 (ex, ±ey)
const c1 = rot(itx, ity, 45, ex, -ey), c2 = rot(itx, ity, 45, ex, ey);
const onLead = Math.abs(c1[0] - LEAD_L) < 0.3 && c1[1] < PAD_Y;
const onPad = Math.abs(c2[1] - PAD_Y) < 0.3 && c2[0] < LEAD_L;
assert.ok(onLead, `烙鐵頭上角 ${c1} 要貼元件腳左面`);
assert.ok(onPad, `烙鐵頭下角 ${c2} 要貼焊墊上緣`);
// 2. 錫絲端面：在元件腳右側（烙鐵的對側），一角貼焊墊、一角貼元件腳右面
const feed = A['feed-solder'];
const [wx, wy] = num(feed, /translate\(([\d.]+),([\d.]+)\) rotate\(135\)/);
const [, wr] = num(feed, /rotate\(135\)">\s*<rect x="-160" y="-([\d.]+)" width="160" height="([\d.]+)"/);
const w1 = rot(wx, wy, 135, 0, -wr / 2), w2 = rot(wx, wy, 135, 0, wr / 2);
const ws = [w1, w2].sort((a, b) => a[0] - b[0]);
assert.ok(Math.abs(ws[0][0] - LEAD_R) < 0.3 && ws[0][1] < PAD_Y, `錫絲左角 ${ws[0]} 要貼元件腳右面`);
assert.ok(Math.abs(ws[1][1] - PAD_Y) < 0.3 && ws[1][0] > LEAD_R, `錫絲右角 ${ws[1]} 要貼焊墊`);
assert.ok(wx > 200 && itx < 200, '錫絲與烙鐵分在元件腳兩側');
// 錫絲與烙鐵頭最近距離 > 4（不碰烙鐵頭）
assert.ok(Math.min(...[w1, w2].map(w => Math.min(Math.hypot(w[0] - c1[0], w[1] - c1[1]), Math.hypot(w[0] - c2[0], w[1] - c2[1])))) > 4, '錫絲不能碰烙鐵頭');
// 3. 焊角是凹面：二次曲線控制點在「焊墊上緣與元件腳」的轉角
const m = G.FULL.match(/M([\d.]+),146 Q197,146 197,([\d.]+) L203,[\d.]+ Q203,146 ([\d.]+),146 Z/);
assert.ok(m, '焊角路徑格式');
assert.ok(+m[1] < LEAD_L && +m[3] > LEAD_R && +m[2] < PAD_Y, '焊角在焊墊上展開、沿腳爬升');
// 凹面：曲線中點在弦（焊墊端點到腳上端點連線）的內側（靠轉角）
const l = +m[1], top = +m[2];
const mid = [0.25 * l + 0.5 * 197 + 0.25 * 197, 0.25 * 146 + 0.5 * 146 + 0.25 * top];
const chordMid = [(l + 197) / 2, (146 + top) / 2];
assert.ok(mid[0] > chordMid[0] && mid[1] > chordMid[1], '焊角要凹（往轉角內縮），不是凸包');
// 送錫動畫：焊角由小變大
assert.ok(feed.includes(`values="${G.SMALL};${G.SMALL};${G.FULL};${G.FULL}"`), '送錫時焊角要長大');
// 4. 順序：步驟 7 錫絲移開、烙鐵沒有動畫；步驟 8 沒有錫絲、烙鐵移開
const rs = A['remove-solder'], ri = A['remove-iron'];
assert.ok(/values="0,0;50,-50;50,-50"[\s\S]*rotate\(135\)/.test(rs), '步驟 7 錫絲往右上移開');
assert.ok(!/animateTransform[^>]*>\s*<g transform="translate\([\d.]+,[\d.]+\) rotate\(45\)/.test(rs), '步驟 7 烙鐵不動');
assert.ok(!/rotate\(135\)/.test(ri), '步驟 8 不再有錫絲');
assert.ok(/values="0,0;0,0;-40,-40;-40,-40"[^>]*>\s*<animate attributeName="opacity" values="1;1;0;0"[^>]*>\s*<g transform="translate\([\d.]+,[\d.]+\) rotate\(45\)/.test(ri), '步驟 8 烙鐵往左上移開並淡出');
// 進度條畫在最上層（不被烙鐵蓋住）：seq 出現在烙鐵之後
for (const k of ['heat-pad', 'feed-solder', 'remove-solder', 'remove-iron']) assert.ok(A[k].lastIndexOf('rotate(45)') < A[k].indexOf('① 加熱焊墊與腳'), k + ' 進度條要在烙鐵上層');
// 5. 每張 SVG 結構完整（標籤配對、viewBox、aria-label）
for (const [k, s] of Object.entries(A)) {
  assert.ok(s.startsWith('<svg viewBox="0 0 400 240" role="img" aria-label="'), k + ' 開頭');
  const stack = [];
  for (const t of s.match(/<\/?[a-zA-Z][^>]*>/g)) {
    if (t.endsWith('/>')) continue;
    const name = t.match(/^<\/?([a-zA-Z]+)/)[1];
    if (t[1] === '/') assert.strictEqual(stack.pop(), name, k + ' 標籤沒配對：' + name); else stack.push(name);
  }
  assert.strictEqual(stack.length, 0, k + ' 有未關閉的標籤 ' + stack);
}
console.log('m3-anims: 全部通過');
