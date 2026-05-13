// 三視圖 模組 4：3D ↔ 三視圖互動投影器（Three.js + OpenSCAD 模型）
// - 主視窗：PerspectiveCamera + OrbitControls，學生可拖曳旋轉真實 3D 物件
// - 三個小視窗：OrthographicCamera 從 +Z / -X / +Y 三個固定方向投影（CNS 3 第三角投影法）
// - 物件 mesh 由 OpenSCAD 參數化建模生成 STL，前端 STLLoader 載入
//   座標系：OpenSCAD 是 Z-up（建模時 Z 軸朝上），Three.js 預設 Y-up
//   → 載入後繞 X 軸旋轉 -90° 對齊（使 OpenSCAD 的 Z 變成 Three.js 的 Y）
// 依據：CNS 3《工程製圖》、ISO 128

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const INFOS = {
  cube:     '立方體：6 個面都一樣 = 三視圖都是相同的正方形（L = W = H）。',
  cylinder: '圓柱：正視 / 側視 = 矩形，俯視 = 圓形。曲面投影到平面會變成直線。',
  cone:     '圓錐：正視 / 側視 = 三角形，俯視 = 圓形（含尖點圓心）。',
  step:     '階梯塊：正視看出階梯輪廓（L 形），側視看高度，俯視看深度。',
  l:        'L 型塊：正視 = L 形，俯視 = 矩形，側視 = 矩形。是兩個方塊組合。',
  hole:     '孔板：圓孔軸垂直於正面。正視可看到圓孔的實線輪廓；側視與俯視因為孔軸與視線垂直，孔以兩條平行虛線表示貫穿（內部不可見）。',
  tslot:    'T 槽塊：俯視可看到 T 字形溝槽，正視顯示頂面截角，側視看出 T 槽剖面。',
  wedge:    '楔形塊：正視 = 三角形，俯視 = 矩形，側視 = 矩形（注意斜面的對應）。',
  bracket:  'L 角架：常見於支撐件。正視 = L 形，側視 = 直立矩形，俯視 = L 形（不同方位）。',
};

// ========== STL 載入工廠（OpenSCAD pipeline）==========
// 共 11 種物件的 STL 檔在 ../../models/orthographic/
// 物件名 → 對應檔名（與 .scad 同名）
const STL_NAMES = ['cube', 'cylinder', 'cone', 'sphere', 'step', 'lblock', 'l', 'hole', 'tslot', 'wedge', 'bracket', 'pyramid'];
const FILENAME_ALIAS = { l: 'lblock' };  // module5.html / module4.html 可能用 'l'，但檔名是 lblock

const stlLoader = new STLLoader();
const geometryCache = new Map();

function loadSTLGeometry(name) {
  const file = FILENAME_ALIAS[name] || name;
  if (geometryCache.has(file)) return Promise.resolve(geometryCache.get(file));
  return new Promise((resolve, reject) => {
    stlLoader.load(
      `../../models/orthographic/${file}.stl`,
      geo => {
        // OpenSCAD 預設 Z-up，Three.js 預設 Y-up → 繞 X 軸旋轉 -90°
        geo.rotateX(-Math.PI / 2);
        geo.computeBoundingBox();
        // 物件居中（OpenSCAD 中已大部分置中，這裡再 normalize 一次防呆）
        const bb = geo.boundingBox;
        const cx = (bb.min.x + bb.max.x) / 2;
        const cy = (bb.min.y + bb.max.y) / 2;
        const cz = (bb.min.z + bb.max.z) / 2;
        geo.translate(-cx, -cy, -cz);
        geo.computeVertexNormals();
        geometryCache.set(file, geo);
        resolve(geo);
      },
      undefined,
      err => reject(err)
    );
  });
}

// 物件工廠：載入 STL → 組合 mesh + 輪廓線
async function makeShape(name) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0x6366F1, flatShading: false, side: THREE.DoubleSide, shininess: 25 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x1E1B4B, linewidth: 1 });
  try {
    const geo = await loadSTLGeometry(name);
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    // 輪廓線（thresholdAngle 30° 隱藏平滑面上的邊）
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat);
    group.add(edges);
  } catch (e) {
    console.error('STL 載入失敗：', name, e);
    // fallback：顯示一個紅色立方體提示錯誤
    const fb = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    group.add(fb);
  }
  return group;
}

// ========== Viewport 建立 ==========
function makeViewport(container, isMain) {
  const w = container.clientWidth || 320;
  const h = container.clientHeight || 240;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0F172A);

  // 燈光
  const amb = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(80, 100, 120);
  scene.add(dir);

  let camera;
  if (isMain) {
    camera = new THREE.PerspectiveCamera(40, w / h, 1, 1000);
    camera.position.set(120, 90, 140);
    camera.lookAt(0, 0, 0);
  } else {
    // 正交相機 — 視野大小手動定（保持物件在框內）
    const size = 110;
    const aspect = w / h;
    camera = new THREE.OrthographicCamera(-size * aspect / 2, size * aspect / 2, size / 2, -size / 2, 1, 1000);
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  return { scene, camera, renderer, container, isMain, current: null };
}

// 設定正交相機從特定方向看
function aimOrthoCamera(camera, axis) {
  // axis: 'front' = +Y → 觀者站在 +Y 處看向 -Y（其實工程上「正視」是從 +X 看向 -X）
  // CNS 3 慣例：
  //   - 正視 = 從觀者前方往後看（一般定義為 -Z 方向看 +Z 面，這裡用 +Z 為正視方向）
  //   - 俯視 = 從上往下看（+Y → -Y）
  //   - 側視 = 從左方往右看（-X → +X）—— 「左視圖」放右邊（第三角投影）
  // 但實作上對於 Three.js 預設座標（Y 向上、Z 向觀者）：
  //   - 正視 = camera 在 (0, 0, R)，看 (0, 0, 0)，up = (0, 1, 0)
  //   - 俯視 = camera 在 (0, R, 0)，看 (0, 0, 0)，up = (0, 0, -1)
  //   - 側視（左視）= camera 在 (-R, 0, 0)，看 (0, 0, 0)，up = (0, 1, 0)
  const R = 200;
  if (axis === 'front') {
    camera.position.set(0, 0, R);
    camera.up.set(0, 1, 0);
  } else if (axis === 'top') {
    camera.position.set(0, R, 0);
    camera.up.set(0, 0, -1);
  } else if (axis === 'side') {
    camera.position.set(-R, 0, 0);
    camera.up.set(0, 1, 0);
  }
  camera.lookAt(0, 0, 0);
}

// ========== 初始化 ==========
const mainVP = makeViewport(document.getElementById('vp-main'), true);
const frontVP = makeViewport(document.getElementById('vp-front'), false);
const sideVP = makeViewport(document.getElementById('vp-side'), false);
const topVP = makeViewport(document.getElementById('vp-top'), false);

aimOrthoCamera(frontVP.camera, 'front');
aimOrthoCamera(sideVP.camera, 'side');
aimOrthoCamera(topVP.camera, 'top');

// 主視窗加 OrbitControls + 座標軸輔助
const controls = new OrbitControls(mainVP.camera, mainVP.renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 80;
controls.maxDistance = 400;
const axesHelper = new THREE.AxesHelper(60);
mainVP.scene.add(axesHelper);

// 三視圖加格線
function addGridFloor(scene, axis) {
  const grid = new THREE.GridHelper(160, 8, 0x334155, 0x1E293B);
  if (axis === 'front') grid.rotation.x = Math.PI / 2; // 在 XY 平面
  else if (axis === 'side') grid.rotation.z = Math.PI / 2; // 在 YZ 平面
  // top 視角的 grid 預設就是 XZ 平面（不變）
  scene.add(grid);
}
addGridFloor(frontVP.scene, 'front');
addGridFloor(sideVP.scene, 'side');
addGridFloor(topVP.scene, 'top');

// ========== 切換物件 ==========
let currentShape = 'cube';
let loadingShape = false;

async function setShape(name) {
  if (loadingShape) return;
  loadingShape = true;
  currentShape = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.s === name));
  document.getElementById('info').textContent = INFOS[name] || '';

  // 從 4 個 scene 移除舊 group。注意：geometry 是共用快取，不要 dispose！
  // 只移除 mesh / line，不 dispose geometry
  [mainVP, frontVP, sideVP, topVP].forEach(vp => {
    if (vp.current) {
      vp.scene.remove(vp.current);
      vp.current.traverse(o => {
        if (o.material) o.material.dispose();
      });
    }
  });

  // 平行載入 4 個 group（共用 STL geometry cache 後其實只第 1 次需要 fetch）
  const groups = await Promise.all([makeShape(name), makeShape(name), makeShape(name), makeShape(name)]);
  [mainVP, frontVP, sideVP, topVP].forEach((vp, i) => {
    vp.scene.add(groups[i]);
    vp.current = groups[i];
  });

  const p = loadP();
  p.module4 = true;
  p[`module4_${name}`] = true;
  saveP(p);
  loadingShape = false;
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setShape(t.dataset.s)));

document.getElementById('btn-reset').addEventListener('click', () => {
  mainVP.camera.position.set(120, 90, 140);
  mainVP.camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
});

// ========== 渲染迴圈 ==========
function render() {
  controls.update();
  [mainVP, frontVP, sideVP, topVP].forEach(vp => {
    vp.renderer.render(vp.scene, vp.camera);
  });
  requestAnimationFrame(render);
}

// 視窗 resize 處理
function onResize() {
  [mainVP, frontVP, sideVP, topVP].forEach(vp => {
    const w = vp.container.clientWidth;
    const h = vp.container.clientHeight;
    if (vp.isMain) {
      vp.camera.aspect = w / h;
      vp.camera.updateProjectionMatrix();
    } else {
      const size = 110;
      const aspect = w / h;
      vp.camera.left = -size * aspect / 2;
      vp.camera.right = size * aspect / 2;
      vp.camera.top = size / 2;
      vp.camera.bottom = -size / 2;
      vp.camera.updateProjectionMatrix();
    }
    vp.renderer.setSize(w, h);
  });
}
window.addEventListener('resize', onResize);

setShape('cube');
render();
