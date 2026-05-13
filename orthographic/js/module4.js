// 三視圖 模組 4：3D ↔ 三視圖互動投影器（Three.js）
// - 主視窗：PerspectiveCamera + OrbitControls，學生可拖曳旋轉真實 3D 物件
// - 三個小視窗：OrthographicCamera 從 +Y / +X / +Z 三個固定方向投影（CNS 3 第三角投影法）
// - 切換物件時，4 個 scene 共用同一個 group 建構（每個 scene 有自己的 mesh clone）
// 依據：CNS 3《工程製圖》、ISO 128

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// ========== 物件工廠 ==========
// 所有物件外接尺寸控制在 ~80 mm 立方內，方便相機固定縮放
function makeShape(name) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0x6366F1, flatShading: true, side: THREE.DoubleSide });
  const matDark = new THREE.MeshPhongMaterial({ color: 0x4338CA, flatShading: true });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x1E1B4B, linewidth: 1 });

  function addBoxWithEdges(w, h, d, ox = 0, oy = 0, oz = 0, m = mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(ox, oy, oz);
    group.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    edges.position.copy(mesh.position);
    group.add(edges);
  }

  function addCylinderWithEdges(rTop, rBot, h, segs, ox = 0, oy = 0, oz = 0, m = mat) {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(ox, oy, oz);
    group.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), edgeMat);
    edges.position.copy(mesh.position);
    group.add(edges);
  }

  switch (name) {
    case 'cube':
      addBoxWithEdges(60, 60, 60);
      break;
    case 'cylinder':
      addCylinderWithEdges(30, 30, 70, 48);
      break;
    case 'cone':
      addCylinderWithEdges(0, 35, 70, 48);
      break;
    case 'step':
      // 下層大塊（80×30×60）+ 上層小塊（40×30×60），靠左對齊
      addBoxWithEdges(80, 30, 60, 0, -15, 0);
      addBoxWithEdges(40, 30, 60, -20, 15, 0);
      break;
    case 'l':
      // L 型：直立矩形（30×80×40）+ 水平矩形（60×30×40）
      addBoxWithEdges(30, 80, 40, -15, 0, 0);
      addBoxWithEdges(60, 30, 40, 15, -25, 0);
      break;
    case 'hole': {
      // 真正的圓孔板：用 Shape + holes + ExtrudeGeometry
      const w = 80, h = 50, d = 50, hole = 18;
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, -h / 2);
      shape.lineTo( w / 2, -h / 2);
      shape.lineTo( w / 2,  h / 2);
      shape.lineTo(-w / 2,  h / 2);
      shape.closePath();
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, hole, 0, Math.PI * 2, false);
      shape.holes.push(holePath);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 32 });
      geo.translate(0, 0, -d / 2); // 居中
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 6), edgeMat);
      group.add(edges);
      break;
    }
    case 'tslot': {
      // T 槽塊：底板（80×40×60）+ T 字形溝槽兩側殘餘
      // 用三個 box 模擬：左、右各一個高 box，中間下半有 T 字
      // 簡化：底板 + 上方左右兩個小塊，中間留 T 形空隙
      addBoxWithEdges(80, 30, 60, 0, -15, 0);          // 底板
      addBoxWithEdges(25, 30, 60, -27.5, 15, 0);        // 左上塊
      addBoxWithEdges(25, 30, 60,  27.5, 15, 0);        // 右上塊
      addBoxWithEdges(20, 15, 60,  0,   22.5, 0);       // 中央上方覆蓋（T 字頂橫）
      break;
    }
    case 'wedge': {
      // 楔形塊：三角柱 — 用 ExtrudeGeometry
      const shape = new THREE.Shape();
      shape.moveTo(-40, -25);
      shape.lineTo(40, -25);
      shape.lineTo(-40, 25);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 50, bevelEnabled: false });
      geo.translate(0, 0, -25);
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), edgeMat);
      group.add(edges);
      break;
    }
    case 'bracket': {
      // L 角架：L 形 ExtrudeGeometry
      const shape = new THREE.Shape();
      shape.moveTo(-30, -30);
      shape.lineTo(30, -30);
      shape.lineTo(30, -15);
      shape.lineTo(-15, -15);
      shape.lineTo(-15, 30);
      shape.lineTo(-30, 30);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 40, bevelEnabled: false });
      geo.translate(0, 0, -20);
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), edgeMat);
      group.add(edges);
      break;
    }
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

function setShape(name) {
  currentShape = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.s === name));
  document.getElementById('info').textContent = INFOS[name];

  // 從 4 個 scene 移除舊 group，加入新 group（每個 scene 都要獨立 group，因為 mesh 不能跨 scene 共享 parent）
  [mainVP, frontVP, sideVP, topVP].forEach(vp => {
    if (vp.current) {
      vp.scene.remove(vp.current);
      vp.current.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    const g = makeShape(name);
    vp.scene.add(g);
    vp.current = g;
  });

  const p = loadP();
  p.module4 = true;
  p[`module4_${name}`] = true;
  saveP(p);
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
