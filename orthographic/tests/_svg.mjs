// 解析 svgView 產生的 SVG 字串：抓出主體外形、可見線、隱藏線、中心線，供幾何驗證。
export function parse(svg) {
  const els = [];
  const re = /<(rect|polygon|polyline|circle|line|path|text)\b([^>]*)\/?>/g;
  let m;
  while ((m = re.exec(svg))) {
    const a = {};
    m[2].replace(/([\w-]+)="([^"]*)"/g, (_, k, v) => { a[k] = v; });
    els.push({ tag: m[1], a });
  }
  return els;
}
const num = v => parseFloat(v);
export function pts(a) {
  return a.points.trim().split(/\s+/).map(p => p.split(',').map(Number));
}
export function bboxOf(e) {
  const a = e.a;
  if (e.tag === 'rect') return { x0: num(a.x), y0: num(a.y), x1: num(a.x) + num(a.width), y1: num(a.y) + num(a.height) };
  if (e.tag === 'circle') return { x0: num(a.cx) - num(a.r), y0: num(a.cy) - num(a.r), x1: num(a.cx) + num(a.r), y1: num(a.cy) + num(a.r) };
  if (e.tag === 'polygon' || e.tag === 'polyline') {
    const p = pts(a); const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  }
  return null;
}
// 主體：第一個以前景色填滿的元素
export function body(els, fg) {
  const e = els.find(x => x.a.fill === fg);
  if (!e) throw new Error('找不到主體外形');
  const b = bboxOf(e);
  return { el: e, ...b, w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 };
}
export function lines(els, kind) {
  return els.filter(e => e.tag === 'line' && e.a['data-k'] === kind)
    .map(e => ({ x1: num(e.a.x1), y1: num(e.a.y1), x2: num(e.a.x2), y2: num(e.a.y2), dashed: 'stroke-dasharray' in e.a }));
}
export const vert = l => Math.abs(l.x1 - l.x2) < 1e-6;
export const horiz = l => Math.abs(l.y1 - l.y2) < 1e-6;
export const near = (a, b, eps = 0.05) => Math.abs(a - b) <= eps;
