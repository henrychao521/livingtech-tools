// 用 web/ortho-views.js（網站實際用的繪圖器）把每個物件畫成第三角法三視圖／六視圖 SVG
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
// 在網站 repo（models/orthographic/library/src/）時輸出到 library/；在工作資料夾時輸出到 out/
const OUT = process.env.ORTHO_OUT || (path.basename(here) === 'src' ? path.dirname(here) : path.join(here, 'out'));
const OVJS = process.env.ORTHO_VIEWS_JS || (path.basename(here) === 'src' ? path.resolve(here, '../../../../orthographic/js/ortho-views.js') : path.join(here, 'web/ortho-views.js'));
const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(OUT, 'library-data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(OVJS, 'utf8'), ctx);
const OV = ctx.OrthoViews, L = ctx.ORTHO_LIB;
fs.mkdirSync(path.join(OUT, 'svg'), { recursive: true });
for (const id of L.order) {
  const o = L.objects[id];
  const v = o.views;
  fs.writeFileSync(path.join(OUT, `svg/${id}-three.svg`), OV.svgLayout({ front: v.front, top: v.top, right: v.right }, 'three', { maxWidth: 420, title: o.name + ' 三視圖' }));
  fs.writeFileSync(path.join(OUT, `svg/${id}-six.svg`), OV.svgLayout(v, 'six', { maxWidth: 640, title: o.name + ' 六視圖' }));
}
console.log('svg', L.order.length * 2);
