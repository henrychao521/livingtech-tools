// 三視圖 模組 4：3D ↔ 三視圖互動投影器（2026-10-27 改版）
// - 上方大的 3D 視窗：物件庫的實體（OpenSCAD → STL），OrbitControls 拖曳旋轉、雙指縮放；鏡頭自動框住整個物體（手機直式也看得到全貌）
// - 下方：同一個物體的第三角法三視圖／六視圖，線條由 3D 模型正投影計算（可見線、隱藏線、中心線），
//   不是即時算圖的剪影——所以看得到虛線與中心線。
// 座標：物件庫 X 寬、Y 深（y=0 為正面）、Z 高；Three.js 鏡頭 up 設成 +Z，不旋轉模型。
// 依據：CNS 3《工程製圖》、ISO 128（線型）、ISO 5456-2（第三角法）
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const OV = window.OrthoViews, LIB = window.ORTHO_LIB;
const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { try { localStorage.setItem(PK, JSON.stringify(p)); } catch { /* 無痕模式 */ } }

const LEVELS = { 1: '基礎', 2: '進階', 3: '挑戰', 4: '綜合' };
const HINTS = {
  block: '三個視圖都是矩形：正視 60×30、俯視 60×40、右側視 40×30，沒有內部線條。',
  lblock: '正視是 L 形；俯視在立板和底座交界有一條實線（和正視的內角長對正）；右側視在高 15 有一條實線（底座頂面，高平齊）。',
  step3: '正視是三階梯；俯視兩條垂直實線、右側視兩條水平實線（每個台階的交界都看得到）。切到「六視圖」看看：左側視圖的這兩條線變成虛線。',
  tee: '正視是倒 T；俯視兩條垂直實線是立板兩側。右側視只有一條水平實線——和 L 形塊的右側視一模一樣，所以只看一個視圖不能確定形狀。',
  notch: '正視是凹字形（槽前後貫穿，直接看得到）；俯視兩條垂直實線是槽壁；右側視看不到槽，用一條水平虛線表示槽底。',
  chamfer: '右側視是五邊形，缺角在左上——右側視的左邊是物體正面，所以斜面在前上方。正視在高 20、俯視在離正面 15 處各有一條實線，是斜面和正面、頂面的交線。',
  ramp: '正視就是斜坡的真實輪廓；俯視在 x=20 有一條實線（平頂和斜面的交線）；右側視在高 15 有一條實線，上面那一塊是斜面。',
  holeplate: '俯視是圓（孔口看得到）；正視、右側視用兩條虛線表示孔壁；細鏈線是孔的中心線，在俯視圖畫成十字。',
  vblock: '正視直接看到 V 形槽；俯視三條實線是槽口兩邊和槽底；右側視看不到槽，一條水平虛線是槽底。',
  tslot: '正視直接看到 T 形槽；俯視只看得到窄的槽口（實線），下面較寬的槽被擋住（虛線）；右側視兩條水平虛線是寬槽的上下面。',
  dovetail: '正視看到上窄下寬的鳩尾槽；俯視的槽口是實線，較寬的槽底兩側是虛線；右側視一條水平虛線是槽底。',
  cbore: '俯視兩個同心圓：大圓是沉頭、小圓是貫穿孔。正視、右側視的虛線上寬下窄，表示沉頭在頂面。',
  cylstack: '俯視三個同心圓（下層圓柱、上層圓柱、孔）；圓柱在正視、右側視變成矩形，中心線畫在軸上，孔用虛線。',
  bracket: '正視看得到立板的圓孔（實線圓），底板的孔被擋住是虛線；俯視看得到底板兩個孔，立板的孔是虛線；右側視是 L 形，兩種孔都是虛線。',
  lhole: '正視是 L 形，立板裡的水平虛線是左右貫穿的孔；右側視看得到這個孔的圓；俯視右邊的圓是底座的垂直孔。',
  slotplate: '俯視是長圓孔（兩個半圓＋兩條直線），中心線沿長度一條、兩端圓心各一條；正視的虛線是長孔兩端，右側視的虛線是長孔兩側。',
  boss: '俯視：凸台、中心孔、四角四個小孔都是圓；正視、右側視：凸台是矩形，中心孔從凸台頂一路貫穿到底（虛線），四角小孔也是虛線。',
  rib: '正視是 L 形加一條斜線（肋板的斜邊）；俯視的兩條水平實線是肋板兩側；右側視看得到肋板斜面，兩條直線是肋板兩側。',
};

/* ---- 3D 視窗 ---- */
const host = document.getElementById('vp-main');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
host.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', '可旋轉的 3D 物件');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0F172A);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(60, -120, 160); scene.add(dl);
const dl2 = new THREE.DirectionalLight(0xffffff, 0.35); dl2.position.set(-80, 60, 40); scene.add(dl2);
const camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);
camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
const group = new THREE.Group(); scene.add(group);
const grid = new THREE.GridHelper(200, 20, 0x334155, 0x1E293B); grid.rotation.x = Math.PI / 2; scene.add(grid);

const geoCache = new Map();
function loadGeo(id) {
  if (!geoCache.has(id)) geoCache.set(id, fetch('../../models/orthographic/library/' + id + '.stl?v=1')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    .then(buf => {
      const dv = new DataView(buf), n = dv.getUint32(80, true), pos = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) for (let j = 0; j < 9; j++) pos[i * 9 + j] = dv.getFloat32(84 + i * 50 + 12 + j * 4, true);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.computeVertexNormals(); g.computeBoundingBox();
      return g;
    }));
  return geoCache.get(id);
}
let fit = { c: new THREE.Vector3(), r: 60 };
function frameCamera(reset) {
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const dist = fit.r / Math.sin(Math.min(vf, hf) / 2) * 1.04;
  controls.minDistance = dist * 0.45; controls.maxDistance = dist * 2.2;
  if (reset) {
    const dir = new THREE.Vector3(1.0, -1.45, 0.95).normalize();
    controls.target.copy(fit.c);
    camera.position.copy(fit.c).addScaledVector(dir, dist);
  } else {
    const d = camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).addScaledVector(d.normalize(), dist);
  }
  controls.update();
}
let token = 0;
async function show3D(id) {
  const my = ++token;
  let geo;
  try { geo = await loadGeo(id); } catch (e) { console.error('STL 載入失敗', id, e); return; }
  if (my !== token) return;
  group.clear();
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x8B9CF5, shininess: 25, side: THREE.DoubleSide })));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), new THREE.LineBasicMaterial({ color: 0x1E1B4B })));
  const bb = geo.boundingBox, c = new THREE.Vector3(), s = new THREE.Vector3();
  bb.getCenter(c); bb.getSize(s);
  /* 正視方向箭頭（橘色）：在正面前方，指向 +Y */
  const L = Math.max(16, s.y * 0.5);
  group.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(c.x, bb.min.y - L - 5, bb.min.z + s.z * 0.35), L, 0xF97316, L * 0.35, L * 0.22));
  grid.position.set(c.x, c.y, bb.min.z - 0.05);
  const lo = bb.min.clone(); lo.y -= L + 5;
  const box = new THREE.Box3(lo, bb.max.clone());
  fit = { c: box.getCenter(new THREE.Vector3()), r: box.getSize(new THREE.Vector3()).length() / 2 };
  frameCamera(true);
}

/* ---- 三視圖／六視圖（物件庫線條） ---- */
let cur = 'lblock', mode = 'three';
const viewsHost = document.getElementById('m4-views');
function drawViews() {
  const o = LIB.objects[cur];
  const w = Math.max(260, Math.min(640, viewsHost.clientWidth || 340));
  const v = mode === 'six' ? o.views : { front: o.views.front, top: o.views.top, right: o.views.right };
  viewsHost.innerHTML = OV.svgLayout(v, mode, { maxWidth: w, maxHeight: mode === 'six' ? 560 : 520,
    projLines: document.getElementById('m4-proj').checked && mode === 'three', title: o.name + (mode === 'six' ? '的六視圖' : '的三視圖') });
}
function setShape(id) {
  cur = id;
  document.querySelectorAll('.m4-obj').forEach(b => b.classList.toggle('active', b.dataset.s === id));
  const o = LIB.objects[id];
  document.getElementById('info').innerHTML = `<strong>${o.name}</strong>（${LEVELS[o.level]}，寬 ${o.size[0]}、深 ${o.size[1]}、高 ${o.size[2]} mm）：${o.desc}<br><span style="color:#1E1B4B">👀 ${HINTS[id] || ''}</span>`;
  show3D(id); drawViews();
  const p = loadP(); p.module4 = true; p['module4_' + id] = true; saveP(p);
}

/* 物件選單：依難度分組 */
(function buildPicker() {
  const wrap = document.getElementById('m4-picker');
  wrap.innerHTML = [1, 2, 3, 4].map(lv => `<div class="m4-lv"><span class="m4-lv-t lv${lv}">${LEVELS[lv]}</span>` +
    LIB.order.filter(id => LIB.objects[id].level === lv).map(id => `<button type="button" class="m4-obj" data-s="${id}">${LIB.objects[id].name}</button>`).join('') + '</div>').join('');
  wrap.querySelectorAll('.m4-obj').forEach(b => b.addEventListener('click', () => { setShape(b.dataset.s); if (typeof SoundFX !== 'undefined') SoundFX.click(); }));
})();
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
  mode = b.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
  drawViews();
}));
document.getElementById('m4-proj').addEventListener('change', drawViews);
document.getElementById('btn-reset').addEventListener('click', () => frameCamera(true));

let rsT = 0;
window.addEventListener('resize', () => { frameCamera(false); clearTimeout(rsT); rsT = setTimeout(drawViews, 120); });
function render() {
  if (document.hidden) { window.__rafPaused = true; return; }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; render(); }
});
setShape(cur);
render();
