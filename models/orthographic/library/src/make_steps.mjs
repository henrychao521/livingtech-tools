// 模組 3「8 步驟視圖繪製」每一步的示意圖：node make_steps.mjs [物件 id]
// 依物件庫的真實線條，逐步累加：新加的內容用藍色，前幾步已完成的用黑色，輔助線用淺灰。
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
// 在網站 repo（models/orthographic/library/src/）時輸出到 library/；在工作資料夾時輸出到 out/
const OUT = process.env.ORTHO_OUT || (path.basename(here) === 'src' ? path.dirname(here) : path.join(here, 'out'));
const OVJS = process.env.ORTHO_VIEWS_JS || (path.basename(here) === 'src' ? path.resolve(here, '../../../../orthographic/js/ortho-views.js') : path.join(here, 'web/ortho-views.js'));
const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(OUT, 'library-data.js'), 'utf8'), ctx);
const L = ctx.ORTHO_LIB;
const ID = process.argv[2] || 'bracket';
const O = L.objects[ID], V = O.views;
const S = 2.3 / 10;            // px / 0.1mm
const GAP = 180;               // 0.1mm
const PAD = 26;
const [W, D, H] = [V.front.box[2] - V.front.box[0], V.top.box[3] - V.top.box[1], V.front.box[3] - V.front.box[1]];
const fx = PAD + 34, fy = PAD + 20 + (D + GAP) * S;          // 正視左上
const box = {
  front: [fx, fy, W * S, H * S],
  top: [fx, fy - (GAP + D) * S, W * S, D * S],
  right: [fx + (W + GAP) * S, fy, D * S, H * S],
};
const CW = Math.ceil(fx + (W + GAP + D) * S + PAD + 30), CH = Math.ceil(fy + H * S + PAD + 46);
const C = { done: '#111827', now: '#2563EB', aux: '#CBD5E1', note: '#B45309' };
const f1 = x => Math.round(x * 10) / 10;
const FONT = 'font-family="PingFang TC,Noto Sans TC,sans-serif" stroke="#fff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round"';

function viewPath(k, polys) {
  const b = V[k].box, [ox, oy] = box[k];
  return polys.map(p => { let d = ''; for (let i = 0; i < p.length; i += 2) d += (i ? 'L' : 'M') + f1(ox + (p[i] - b[0]) * S) + ' ' + f1(oy + (b[3] - p[i + 1]) * S); return d; }).join('');
}
const vis = (k, col) => `<path d="${viewPath(k, V[k].vis)}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
const hid = (k, col) => V[k].hid.length ? `<path d="${viewPath(k, V[k].hid)}" fill="none" stroke="${col}" stroke-width="1.3" stroke-dasharray="5 3"/>` : '';
const ctr = (k, col) => V[k].ctr.length ? `<path d="${viewPath(k, V[k].ctr)}" fill="none" stroke="${col}" stroke-width="0.9" stroke-dasharray="13 3 2 3"/>` : '';
const frame = k => { const [x, y, w, h] = box[k]; return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${C.aux}" stroke-width="1"/>`; };
const label = (k, txt, col = '#334155') => { const [x, y, w, h] = box[k]; return `<text x="${f1(x + w / 2)}" y="${f1(y + h + 16)}" text-anchor="middle" font-size="12" font-weight="700" fill="${col}" ${FONT}>${txt}</text>`; };
const mx0 = box.right[0], my0 = box.top[1] + box.top[3];   // 45° 線起點（正視右上角外的交點）
const miter = col => `<line x1="${f1(mx0 - 6)}" y1="${f1(my0 + 6)}" x2="${f1(mx0 + D * S + 8)}" y2="${f1(my0 - D * S - 8)}" stroke="${col}" stroke-width="1" stroke-dasharray="6 3"/>`;

function uniq(arr) { return [...new Set(arr.map(x => Math.round(x)))].sort((a, b) => a - b); }
// 投影線只拉「特徵點」：直線端點；圓弧（點很多的折線）只取左右、上下極點
const ptsOf = (k, kinds = ['vis']) => kinds.flatMap(t => V[k][t]).flatMap(p => {
  const o = []; for (let i = 0; i < p.length; i += 2) o.push([p[i], p[i + 1]]);
  if (o.length <= 12) return o;
  const xs = o.map(q => q[0]), ys = o.map(q => q[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return [[Math.min(...xs), cy], [Math.max(...xs), cy], [cx, Math.min(...ys)], [cx, Math.max(...ys)]];
});
function projVertical(col) {        // 長對正：正視 → 俯視的垂直投影線
  const xs = uniq(ptsOf('front').map(p => p[0]).concat(ptsOf('top').map(p => p[0])));
  const b = V.front.box;
  return xs.map(x => { const X = f1(box.front[0] + (x - b[0]) * S); return `<line x1="${X}" y1="${f1(box.front[1] - 2)}" x2="${X}" y2="${f1(box.top[1] + box.top[3] + 2)}" stroke="${col}" stroke-width="0.8"/>`; }).join('');
}
function projHorizontal(col) {      // 高平齊：正視 → 右側視的水平投影線
  const b = V.front.box;
  const zs = uniq(ptsOf('front').map(p => p[1]).concat(ptsOf('right').map(p => p[1])));
  return zs.map(z => { const Y = f1(box.front[1] + (b[3] - z) * S); return `<line x1="${f1(box.front[0] + box.front[2] + 2)}" y1="${Y}" x2="${f1(box.right[0] - 2)}" y2="${Y}" stroke="${col}" stroke-width="0.8"/>`; }).join('');
}
function projMiter(col) {           // 寬相等：俯視 → 45° 線 → 右側視
  const b = V.top.box;
  const ys = uniq(ptsOf('top').map(p => p[1]));
  return ys.map(y => { const d = y - b[1]; const Y = f1(box.top[1] + (b[3] - y) * S); const X = f1(box.right[0] + d * S);
    return `<path d="M${f1(box.top[0] + box.top[2] + 2)} ${Y}L${X} ${Y}L${X} ${f1(box.right[1] - 2)}" fill="none" stroke="${col}" stroke-width="0.8"/>`; }).join('');
}
function iso(col) {                 // 等角圖（物件庫 iso 視圖的可見線）＋正視方向箭頭
  const v = V.iso, b = v.box, sc = 2.6 / 10;
  const w = (b[2] - b[0]) * sc, h = (b[3] - b[1]) * sc;
  const ox = (CW - w) / 2 + 30, oy = (CH - h) / 2 - 6;
  const d = v.vis.map(p => { let s = ''; for (let i = 0; i < p.length; i += 2) s += (i ? 'L' : 'M') + f1(ox + (p[i] - b[0]) * sc) + ' ' + f1(oy + (b[3] - p[i + 1]) * sc); return s; }).join('');
  // 正視方向箭頭：3D 點 (x 中央, y 由 -28 到 -6, z 高度 35%)，用等角基底投影
  const r = [1 / Math.SQRT2, 1 / Math.SQRT2, 0], ww = [-1 / Math.sqrt(6), 1 / Math.sqrt(6), 2 / Math.sqrt(6)];
  const P = (x, y, z) => [ox + ((x * r[0] + y * r[1] + z * r[2]) * 10 - b[0]) * sc, oy + (b[3] - (x * ww[0] + y * ww[1] + z * ww[2]) * 10) * sc];
  const bx = (O.size[0]) / 2, zz = O.size[2] * 0.35;
  const [a1, a2] = [P(bx, -30, zz), P(bx, -7, zz)];
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>` +
    `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#EA580C"/></marker></defs>` +
    `<line x1="${f1(a1[0])}" y1="${f1(a1[1])}" x2="${f1(a2[0])}" y2="${f1(a2[1])}" stroke="#EA580C" stroke-width="2.4" marker-end="url(#ah)"/>` +
    `<text x="${f1(a1[0] - 4)}" y="${f1(a1[1] + 16)}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#EA580C" ${FONT}>正視方向</text>` +
    `<text x="${PAD}" y="${PAD}" font-size="12.5" font-weight="700" fill="${C.note}" ${FONT}>最大尺寸：寬 ${O.size[0]}、深 ${O.size[1]}、高 ${O.size[2]}</text>` +
    `<text x="${PAD}" y="${PAD + 18}" font-size="12.5" font-weight="700" fill="${C.note}" ${FONT}>特徵：立板 1 個圓孔、底板 2 個圓孔</text>`;
}
function alignNotes() {
  const [tx, ty, tw, th] = box.top, [fx_, fy_, fw, fh] = box.front, [rx, ry, rw, rh] = box.right;
  const t = (x, y, s, anchor = 'middle') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${C.now}" ${FONT}>${s}</text>`;
  const L2 = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${C.now}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
  return L2(fx_, ty, fx_, fy_ + fh) + L2(fx_ + fw, ty, fx_ + fw, fy_ + fh) + t(fx_ + fw / 2, ty + th + 12, '↕ 長對正') +
    L2(fx_, fy_, rx + rw, fy_) + L2(fx_, fy_ + fh, rx + rw, fy_ + fh) + t(rx + rw + 4, fy_ + fh / 2 + 4, '高平齊', 'start') +
    t(rx + rw / 2, ty + th / 2, '寬相等', 'middle');
}
function dims() {
  const out = []; const col = C.now;
  const arrow = `<defs><marker id="da" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="${col}"/></marker></defs>`;
  const dimH = (x1, x2, y, txt, ext0) => `<line x1="${f1(x1)}" y1="${f1(ext0)}" x2="${f1(x1)}" y2="${f1(y + 4)}" stroke="${col}" stroke-width="0.7"/><line x1="${f1(x2)}" y1="${f1(ext0)}" x2="${f1(x2)}" y2="${f1(y + 4)}" stroke="${col}" stroke-width="0.7"/>` +
    `<line x1="${f1(x1)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y)}" stroke="${col}" stroke-width="0.8" marker-start="url(#da)" marker-end="url(#da)"/><text x="${f1((x1 + x2) / 2)}" y="${f1(y - 3)}" text-anchor="middle" font-size="11" font-weight="700" fill="${col}" font-family="Inter,sans-serif">${txt}</text>`;
  const dimV = (y1, y2, x, txt, ext0) => `<line x1="${f1(ext0)}" y1="${f1(y1)}" x2="${f1(x - 4)}" y2="${f1(y1)}" stroke="${col}" stroke-width="0.7"/><line x1="${f1(ext0)}" y1="${f1(y2)}" x2="${f1(x - 4)}" y2="${f1(y2)}" stroke="${col}" stroke-width="0.7"/>` +
    `<line x1="${f1(x)}" y1="${f1(y1)}" x2="${f1(x)}" y2="${f1(y2)}" stroke="${col}" stroke-width="0.8" marker-start="url(#da)" marker-end="url(#da)"/><text x="${f1(x - 4)}" y="${f1((y1 + y2) / 2)}" text-anchor="middle" font-size="11" font-weight="700" fill="${col}" font-family="Inter,sans-serif" transform="rotate(-90 ${f1(x - 4)} ${f1((y1 + y2) / 2)})">${txt}</text>`;
  const [fx_, fy_, fw, fh] = box.front, [rx, ry, rw, rh] = box.right;
  out.push(arrow);
  out.push(dimH(fx_, fx_ + fw, fy_ + fh + 26, String(O.size[0]), fy_ + fh + 3));
  out.push(dimV(fy_, fy_ + fh, fx_ - 16, String(O.size[2]), fx_ - 3));
  out.push(dimH(rx, rx + rw, ry + rh + 26, String(O.size[1]), ry + rh + 3));
  if (ID === 'bracket') {
    const z10 = fy_ + fh - 100 * S;   // 底板厚 10
    out.push(dimV(z10, fy_ + fh, rx + rw + 16, '10', rx + rw + 3));
    const cz = fy_ + fh - 300 * S;   // 立板孔中心高 30
    out.push(dimV(cz, fy_ + fh, fx_ - 36, '30', fx_ - 3));
    const cx = fx_ + 300 * S;
    out.push(`<line x1="${f1(cx + 70 * S * 0.71)}" y1="${f1(cz - 70 * S * 0.71)}" x2="${f1(cx + 120 * S + 28)}" y2="${f1(cz - 120 * S - 6)}" stroke="${col}" stroke-width="0.8" marker-start="url(#da)"/><text x="${f1(cx + 120 * S + 30)}" y="${f1(cz - 120 * S - 8)}" font-size="11" font-weight="700" fill="${col}" font-family="Inter,sans-serif">⌀14</text>`);
    const [tx, ty, tw, th] = box.top;
    const hx = tx + 450 * S, hy = ty + th - 150 * S;
    out.push(`<line x1="${f1(hx + 50 * S * 0.71)}" y1="${f1(hy - 50 * S * 0.71)}" x2="${f1(tx + tw + 8)}" y2="${f1(ty - 6)}" stroke="${col}" stroke-width="0.8" marker-start="url(#da)"/><text x="${f1(tx + tw + 10)}" y="${f1(ty - 8)}" font-size="11" font-weight="700" fill="${col}" font-family="Inter,sans-serif">2×⌀10</text>`);
  }
  return out.join('');
}

const STEPS = [
  () => iso(C.now),
  () => frame('top') + frame('front') + frame('right') + miter(C.now) + `<text x="${f1(mx0 + D * S * 0.5 + 10)}" y="${f1(my0 - D * S * 0.5 + 14)}" font-size="11" fill="${C.now}" ${FONT}>45° 線</text>` +
        ['top', 'front', 'right'].map(k => `<rect x="${f1(box[k][0])}" y="${f1(box[k][1])}" width="${f1(box[k][2])}" height="${f1(box[k][3])}" fill="none" stroke="${C.now}" stroke-width="1" stroke-dasharray="3 3"/>`).join(''),
  () => frame('top') + frame('right') + miter(C.aux) + vis('front', C.now) + label('front', '正視圖', C.now),
  () => frame('right') + miter(C.aux) + vis('front', C.done) + projVertical(C.aux) + vis('top', C.now) + label('front', '正視圖') + label('top', '俯視圖', C.now),
  () => miter(C.aux) + vis('front', C.done) + vis('top', C.done) + projHorizontal(C.aux) + projMiter(C.aux) + vis('right', C.now) + label('front', '正視圖') + label('top', '俯視圖') + label('right', '右側視圖', C.now),
  () => miter(C.aux) + vis('front', C.done) + vis('top', C.done) + vis('right', C.done) + alignNotes() + label('front', '正視圖') + label('top', '俯視圖') + label('right', '右側視圖'),
  () => ['front', 'top', 'right'].map(k => vis(k, C.done) + hid(k, C.now) + ctr(k, C.now) + label(k, { front: '正視圖', top: '俯視圖', right: '右側視圖' }[k])).join(''),
  () => ['front', 'top', 'right'].map(k => vis(k, C.done) + hid(k, C.done) + ctr(k, C.done)).join('') + dims(),
];
const outDir = process.env.STEPS_OUT || (path.basename(here) === 'src' ? path.resolve(here, '../../../../orthographic/assets/steps') : path.join(OUT, 'steps'));
fs.mkdirSync(outDir, { recursive: true });
STEPS.forEach((fn, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="步驟 ${i + 1} 示意圖"><rect width="100%" height="100%" fill="#fff"/>${fn()}</svg>`;
  fs.writeFileSync(path.join(outDir, `step${i + 1}.svg`), svg);
});
console.log('steps', STEPS.length, CW + 'x' + CH);
