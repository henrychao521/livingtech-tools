// 三視圖 模組 1：概念動畫「玻璃盒投影與展開」（取代原本 AI 生成的示意影片）
// 物體放在玻璃盒中央，觀察者從盒外六個方向看；每一面玻璃上畫的是從那個方向看到的視圖
// （線條來自物件庫：OpenSCAD 實體正投影算出的可見線、隱藏線、中心線）。
// 接著以正面為基準把玻璃盒攤開：上面往上翻、下面往下翻、左右往兩側翻、後面跟著右面再翻一次
// → 攤平後就是第三角法的六視圖排列（俯視在上、仰視在下、左側視在左、右側視在右、後視在最右）。
// 座標：X 寬（向右）、Y 深（y=0 為正面、向後）、Z 高（向上），和物件庫一致。
import * as THREE from 'three';

const OV = window.OrthoViews, LIB = window.ORTHO_LIB;
const OBJ_ID = 'lhole';
const M = 10;   // 玻璃盒和物體的間距 mm
const VIEWS = {   // 畫面右 r、上 w、朝外（觀察者方向）t
  front: { r: [1, 0, 0], w: [0, 0, 1], t: [0, -1, 0] },
  top: { r: [1, 0, 0], w: [0, 1, 0], t: [0, 0, 1] },
  right: { r: [0, 1, 0], w: [0, 0, 1], t: [1, 0, 0] },
  left: { r: [0, -1, 0], w: [0, 0, 1], t: [-1, 0, 0] },
  bottom: { r: [1, 0, 0], w: [0, -1, 0], t: [0, 0, -1] },
  rear: { r: [-1, 0, 0], w: [0, 0, 1], t: [0, 1, 0] },
};
const STAGES = [
  [0.00, '① 把物體放進一個透明的玻璃盒，盒子的每一面都是投影面。'],
  [0.12, '② 觀察者站在盒外、視線垂直穿過玻璃（平行投影），把看到的輪廓描在玻璃上：看得到的畫實線，被擋住的畫虛線。'],
  [0.38, '③ 以正面那片玻璃為基準，把盒子攤開：上面往上翻、下面往下翻、左右往兩側翻，後面跟著右面再翻過去。'],
  [0.80, '④ 攤平後就是第三角法：俯視在正視正上方、右側視在正視正右方……視圖之間長對正、高平齊、寬相等。'],
];
const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const seg = (p, a, b) => ease((p - a) / (b - a));

function parseSTL(buf) {
  const dv = new DataView(buf), n = dv.getUint32(80, true), pos = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) for (let j = 0; j < 9; j++) pos[i * 9 + j] = dv.getFloat32(84 + i * 50 + 12 + j * 4, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/* 每面玻璃的貼圖：淡藍玻璃＋視圖線條＋名稱 */
function panelTexture(viewKey, uRange, vRange) {
  const v = LIB.objects[OBJ_ID].views[viewKey];
  const pxmm = 6, W = Math.round((uRange[1] - uRange[0]) * pxmm), H = Math.round((vRange[1] - vRange[0]) * pxmm);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(191,219,254,0.55)'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(37,99,235,0.9)'; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4);
  const X = u => (u / 10 - uRange[0]) * pxmm, Y = w => H - (w / 10 - vRange[0]) * pxmm;
  const draw = (polys, width, dash) => {
    g.lineWidth = width; g.setLineDash(dash); g.strokeStyle = '#0F172A'; g.lineCap = dash.length ? 'butt' : 'round'; g.lineJoin = 'round';
    polys.forEach(p => { g.beginPath(); for (let i = 0; i < p.length; i += 2) (i ? g.lineTo : g.moveTo).call(g, X(p[i]), Y(p[i + 1])); g.stroke(); });
  };
  draw(v.ctr, 2, [26, 6, 4, 6]);
  draw(v.hid, 3.2, [13, 8]);
  draw(v.vis, 6, []);
  g.setLineDash([]);
  g.font = '700 30px "PingFang TC","Noto Sans TC",sans-serif';
  g.fillStyle = '#1D4ED8';
  g.fillText(OV.NAMES[viewKey], 12, 38);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* 玻璃盒：六面玻璃、鉸鏈、投射線。不碰 DOM／WebGL（測試 tests/glassbox.test.mjs 直接呼叫）。
 * setUnfold(k)：k=0 盒子關著，k=1 完全攤平。 */
export function buildBox(o, makeTex) {
  const lo = [0, 0, 0], hi = o.size.slice();
  const root = new THREE.Group();
  const corners = [];
  for (const x of [lo[0], hi[0]]) for (const y of [lo[1], hi[1]]) for (const z of [lo[2], hi[2]]) corners.push(new THREE.Vector3(x, y, z));
  const panels = {};
  for (const [k, V] of Object.entries(VIEWS)) {
    const r = v3(V.r), w = v3(V.w), t = v3(V.t);
    const us = corners.map(p => p.dot(r)), ws = corners.map(p => p.dot(w)), ts = corners.map(p => p.dot(t));
    const uR = [Math.min(...us) - M, Math.max(...us) + M], vR = [Math.min(...ws) - M, Math.max(...ws) + M];
    const c = Math.max(...ts) + M;
    const P = (u, vv) => t.clone().multiplyScalar(c).add(r.clone().multiplyScalar(u)).add(w.clone().multiplyScalar(vv));
    const q = [P(uR[0], vR[0]), P(uR[1], vR[0]), P(uR[1], vR[1]), P(uR[0], vR[1])];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(q.flatMap(p => [p.x, p.y, p.z]), 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const mat = new THREE.MeshBasicMaterial({ map: makeTex ? makeTex(k, uR, vR) : null, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    panels[k] = { mesh, mat, t, c, r, w, uR, vR };
  }
  /* 鉸鏈：子面繞著和父面的共同邊旋轉 90°，軸＝t_子 × t_父（把子面的法向轉到父面的法向） */
  function hinge(child, parent) {
    const tc = panels[child].t, tp = panels[parent].t;
    const point = tp.clone().multiplyScalar(panels[parent].c).add(tc.clone().multiplyScalar(panels[child].c));
    const axis = tc.clone().cross(tp).normalize();
    const pivot = new THREE.Group();
    pivot.position.copy(point);
    panels[child].mesh.position.copy(point.clone().negate());
    pivot.add(panels[child].mesh);
    return { pivot, axis, point };
  }
  root.add(panels.front.mesh);
  const H = {};
  for (const k of ['top', 'bottom', 'left', 'right']) { H[k] = hinge(k, 'front'); root.add(H[k].pivot); }
  /* 後面接在右面上：先把後面掛在「右面的鉸鏈」底下，再繞右後邊翻 */
  H.rear = hinge('rear', 'right');
  H.rear.pivot.position.sub(H.right.point);
  H.right.pivot.add(H.rear.pivot);

  /* 投射線：物體外框 8 個角垂直射到正面、上面、右面 */
  const rayPos = [];
  for (const k of ['front', 'top', 'right']) {
    const t = panels[k].t, c = panels[k].c;
    corners.forEach(p => { const d = c - p.dot(t); rayPos.push(p.x, p.y, p.z, p.x + t.x * d, p.y + t.y * d, p.z + t.z * d); });
  }
  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayPos, 3));
  const rayMat = new THREE.LineDashedMaterial({ color: 0xEA580C, dashSize: 2.5, gapSize: 2, transparent: true, opacity: 0 });
  const rays = new THREE.LineSegments(rayGeo, rayMat); rays.computeLineDistances(); root.add(rays);

  function setUnfold(k) {
    for (const key of ['top', 'bottom', 'left', 'right', 'rear']) H[key].pivot.quaternion.setFromAxisAngle(H[key].axis, k * Math.PI / 2);
    root.updateMatrixWorld(true);
  }
  return { root, panels, H, rays, rayMat, corners, setUnfold };
}

export function initGlassBox(host) {
  const o = LIB.objects[OBJ_ID];
  const lo = [0, 0, 0], hi = o.size.slice();
  const canvas = host.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#F8FAFC');
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(30, -80, 110); scene.add(sun);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 3000);
  camera.up.set(0, 0, 1);

  /* 物體 */
  const objGroup = new THREE.Group(); scene.add(objGroup);
  const objMat = new THREE.MeshLambertMaterial({ color: 0x8B9CF5, transparent: true, opacity: 1 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x1E1B4B, transparent: true, opacity: 1 });
  fetch('../../models/orthographic/library/' + OBJ_ID + '.stl').then(r => r.arrayBuffer()).then(buf => {
    const geo = parseSTL(buf);
    objGroup.add(new THREE.Mesh(geo, objMat));
    objGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edgeMat));
  }).catch(e => console.error('玻璃盒動畫：模型載入失敗', e));

  const box = buildBox(o, (k, uR, vR) => panelTexture(k, uR, vR));
  const { panels, H, rays, rayMat, corners } = box;
  scene.add(box.root);

  /* 鏡頭：等角方向 → 正前方；畫面範圍由物體盒 → 攤平後的六視圖 */
  const ctr0 = new THREE.Vector3((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2);
  const Wd = hi[0] - lo[0] + 2 * M, Dd = hi[1] - lo[1] + 2 * M, Hd = hi[2] - lo[2] + 2 * M;
  let six = true;
  function finalFrame() {
    const x0 = lo[0] - M - (six ? Dd : 0), x1 = hi[0] + M + Dd + (six ? Wd : 0);
    const z0 = lo[2] - M - (six ? Dd : 0), z1 = hi[2] + M + Dd;
    return { c: new THREE.Vector3((x0 + x1) / 2, -M, (z0 + z1) / 2), w: x1 - x0, h: z1 - z0 };
  }
  const isoDir = new THREE.Vector3(1.1, -1.5, 1.05).normalize();
  const frontDir = new THREE.Vector3(0, -1, 0);
  let p = 0, playing = true, last = 0;
  function frame() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    const a = cw / ch;
    const ff = finalFrame();
    const kc = seg(p, 0.8, 1.0), ku = seg(p, 0.38, 0.8);
    const dir = isoDir.clone().lerp(frontDir, kc).normalize();
    const target = ctr0.clone().lerp(ff.c, kc);
    camera.position.copy(target).addScaledVector(dir, 600);
    camera.lookAt(target);
    /* 初始：框住玻璃盒；攤開過程逐步放大到攤平後的範圍（直式畫面以寬度為準） */
    const h0 = 0.5 * Math.hypot(Wd, Dd, Hd) * 1.05 * Math.max(1, 1 / a);
    const h1 = Math.max(ff.h / 2, ff.w / 2 / a) * 1.06;
    const hh = h0 + (Math.max(h1, h0) - h0) * Math.max(ku, kc);
    camera.left = -hh * a; camera.right = hh * a; camera.top = hh; camera.bottom = -hh;
    camera.updateProjectionMatrix();
    const kp = seg(p, 0.12, 0.3);
    for (const k of Object.keys(VIEWS)) {
      const on = six || ['front', 'top', 'right'].includes(k);
      panels[k].mesh.visible = on;
      panels[k].mat.opacity = 0.92 * kp;
    }
    rayMat.opacity = 0.9 * kp * (1 - seg(p, 0.33, 0.42));
    rays.visible = rayMat.opacity > 0.01;
    box.setUnfold(ku);
    objMat.opacity = 1 - 0.85 * kc; edgeMat.opacity = 1 - 0.85 * kc;
    objGroup.visible = objMat.opacity > 0.05;
    renderer.render(scene, camera);
  }
  const slider = host.querySelector('input[type=range]');
  const playBtn = host.querySelector('[data-act=play]');
  const caption = host.querySelector('.gb-caption');
  function sync() {
    slider.value = Math.round(p * 1000);
    playBtn.textContent = playing ? '⏸ 暫停' : (p >= 1 ? '↺ 重播' : '▶ 播放');
    let txt = STAGES[0][1]; STAGES.forEach(s => { if (p >= s[0]) txt = s[1]; });
    if (caption.textContent !== txt) caption.textContent = txt;
  }
  function loop(ts) {
    if (playing) {
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      p = Math.min(1, p + dt / 14);   // 全程約 14 秒
      if (p >= 1) playing = false;
    }
    last = ts;
    frame(); sync();
    requestAnimationFrame(loop);
  }
  slider.addEventListener('input', () => { p = slider.value / 1000; playing = false; });
  playBtn.addEventListener('click', () => { if (p >= 1) p = 0; playing = !playing; last = 0; });
  host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    six = b.dataset.mode === 'six';
    host.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
  }));
  /* 捲到畫面外就暫停，節省電力；回到畫面再自動播 */
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) playing = false;
  })).observe(canvas);
  requestAnimationFrame(loop);
  return { setProgress(x) { p = x; playing = false; } };
}

const host = typeof document !== 'undefined' && document.getElementById('glassbox');
if (host && window.ORTHO_LIB && window.OrthoViews) window.__glassbox = initGlassBox(host);
