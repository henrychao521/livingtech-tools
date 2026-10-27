// 玻璃盒動畫幾何測試：node --test orthographic/tests/glassbox.test.mjs
// 不開瀏覽器：用 three.js 的數學（不需要 WebGL）建出和頁面同一份玻璃盒，檢查攤平後是不是第三角法排列、視圖有沒有翻轉。
// three.js 取自本機（環境變數 THREE_PATH，或 App 的 vendor_cdn 快取）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const threePath = process.env.THREE_PATH || '/Volumes/Work/ios-apps/LivingTechBooks/vendor_cdn/unpkg.com/three@0.160.0/build/three.module.js';
const haveThree = fs.existsSync(threePath);

async function load() {
  const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'models/orthographic/library/library-data.js'), 'utf8'), ctx);
  globalThis.window = { ORTHO_LIB: ctx.ORTHO_LIB };
  const src = fs.readFileSync(path.join(root, 'orthographic/js/module1-glassbox.js'), 'utf8')
    .replace("from 'three'", 'from ' + JSON.stringify(pathToFileURL(threePath).href));
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gb-')), 'gb.mjs');
  fs.writeFileSync(tmp, src);
  const mod = await import(pathToFileURL(tmp).href);
  const THREE = await import(pathToFileURL(threePath).href);
  return { mod, THREE, lib: ctx.ORTHO_LIB };
}

test('玻璃盒攤平後是第三角法六視圖排列，視圖不翻轉', { skip: !haveThree && '找不到 three.module.js' }, async () => {
  const { mod, THREE, lib } = await load();
  const o = lib.objects.lhole;
  const box = mod.buildBox(o, null);
  const M = 10;
  // 盒子關著：每面玻璃都在物體外 M 處
  box.setUnfold(0);
  for (const [k, P] of Object.entries(box.panels)) {
    const pos = P.mesh.geometry.attributes.position;
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(P.mesh.matrixWorld);
      assert.ok(Math.abs(v.dot(P.t) - P.c) < 1e-6, k + ' 關盒時不在投影面上');
    }
  }
  box.setUnfold(1);
  const cell = {};
  for (const [k, P] of Object.entries(box.panels)) {
    const pos = P.mesh.geometry.attributes.position;
    const pts = [0, 1, 2, 3].map(i => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(P.mesh.matrixWorld));
    pts.forEach(v => assert.ok(Math.abs(v.y + M) < 1e-6, k + ' 攤平後不在正面那片玻璃的平面上'));
    // 貼圖的 u 方向（頂點 0→1）要朝 +x、v 方向（頂點 0→3）要朝 +z：從正面看視圖不鏡像、不旋轉
    const du = pts[1].clone().sub(pts[0]).normalize(), dv = pts[3].clone().sub(pts[0]).normalize();
    assert.ok(du.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-6, k + ' 的視圖左右方向錯');
    assert.ok(dv.distanceTo(new THREE.Vector3(0, 0, 1)) < 1e-6, k + ' 的視圖上下方向錯');
    const xs = pts.map(p => p.x), zs = pts.map(p => p.z);
    cell[k] = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
  }
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  const F = cell.front;
  // 俯視在正上方、仰視在正下方（長對正）
  assert.ok(near(cell.top[0], F[0]) && near(cell.top[2], F[2]) && near(cell.top[1], F[3]), '俯視不在正視正上方');
  assert.ok(near(cell.bottom[0], F[0]) && near(cell.bottom[2], F[2]) && near(cell.bottom[3], F[1]), '仰視不在正視正下方');
  // 左右側視在兩旁（高平齊）、後視在右側視右邊
  assert.ok(near(cell.right[1], F[1]) && near(cell.right[3], F[3]) && near(cell.right[0], F[2]), '右側視不在正視正右方');
  assert.ok(near(cell.left[1], F[1]) && near(cell.left[3], F[3]) && near(cell.left[2], F[0]), '左側視不在正視正左方');
  assert.ok(near(cell.rear[1], F[1]) && near(cell.rear[3], F[3]) && near(cell.rear[0], cell.right[2]), '後視不在右側視右邊');
  // 寬相等：俯視的高（深度）＝右側視的寬
  assert.ok(near(cell.top[3] - cell.top[1], cell.right[2] - cell.right[0]), '寬不相等');
});
