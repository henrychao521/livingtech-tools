// 模組 1：Three.js 3D 線鋸機
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class ScrollSaw3D {
  constructor(container) {
    this.container = container;
    this.parts = {};
    this.partsList = [];
    this.bladeRunning = false;
    this.hovered = null;
    this.selected = null;
    this.init();
  }

  init() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 480;

    // Renderer（preserveDrawingBuffer 讓畫面能被 toDataURL/html2canvas 擷取）
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    // 漸層背景
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2; bgCanvas.height = 256;
    const bgCtx = bgCanvas.getContext('2d');
    const grad = bgCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#e8e8e8');
    grad.addColorStop(1, '#c8c8c8');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, 2, 256);
    const bgTex = new THREE.CanvasTexture(bgCanvas);
    bgTex.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = bgTex;

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    this.defaultCamPos = new THREE.Vector3(7, 5, 9);
    this.camera.position.copy(this.defaultCamPos);
    this.camera.lookAt(0, 2, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -8;
    sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0002;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffaa66, 0.3);
    fill.position.set(-5, 4, -3);
    this.scene.add(fill);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 格紋
    const grid = new THREE.GridHelper(20, 20, 0xaaaaaa, 0xcccccc);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // Build saw
    this.buildSaw();

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 2.2, 0);
    this.controls.minDistance = 4;
    this.controls.maxDistance = 22;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.8;

    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.renderer.domElement.addEventListener('pointermove', e => this.onPointerMove(e));
    this.renderer.domElement.addEventListener('click', e => this.onClick(e));

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  registerPart(mesh, id, name) {
    mesh.userData.partId = id;
    mesh.userData.partName = name;
    if (mesh.material) {
      mesh.userData.origColor = mesh.material.color?.clone();
      mesh.userData.origEmissive = mesh.material.emissive?.clone();
    }
    this.parts[id] = mesh;
    this.partsList.push(mesh);
  }

  registerGroup(group, id, name) {
    group.userData.partId = id;
    group.userData.partName = name;
    group.traverse(m => {
      if (m.isMesh) {
        m.userData.partId = id;
        m.userData.origColor = m.material.color?.clone();
        m.userData.origEmissive = m.material.emissive?.clone();
        this.partsList.push(m);
      }
    });
    this.parts[id] = group;
  }

  buildSaw() {
    // === 底座 ===
    const baseGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.55, metalness: 0.4 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.9, 3.5), baseMat);
    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    baseGroup.add(base);
    // 通風孔（凹槽）
    for (let i = 0; i < 5; i++) {
      const v = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.06, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      v.position.set(-2.4, 0.5, 1.6 - i * 0.08);
      baseGroup.add(v);
    }
    // 銘牌
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.5, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
    );
    plate.position.set(0, 0.5, 1.78);
    baseGroup.add(plate);
    // 銘牌文字（用 Canvas 貼圖）
    const plateLabel = makeTextPlane('SCROLL SAW', { color: '#FF7A00', font: 'bold 70px Inter, sans-serif', bg: '#111', w: 440, h: 100 });
    plateLabel.position.set(0, 0.5, 1.82);
    plateLabel.scale.set(2, 0.45, 1);
    baseGroup.add(plateLabel);
    this.scene.add(baseGroup);

    // === 工作台 ===
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xc5c5c5, metalness: 0.55, roughness: 0.35 });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.18, 48), tableMat);
    table.position.y = 1.85;
    table.castShadow = true;
    table.receiveShadow = true;
    this.registerPart(table, 'table', '工作台');
    this.scene.add(table);
    // 鋸縫
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    slot.position.set(0, 1.85, 0);
    this.scene.add(slot);

    // === 機身 ===
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFF7A00, roughness: 0.45, metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 1.6), bodyMat);
    body.position.set(0, 2.95, 0);
    body.castShadow = true;
    this.scene.add(body);
    // 螺絲
    [[-1.2, 3.7, 0.81], [1.2, 3.7, 0.81], [-1.2, 2.2, 0.81], [1.2, 2.2, 0.81]].forEach(p => {
      const s = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 })
      );
      s.rotation.x = Math.PI / 2;
      s.position.set(...p);
      this.scene.add(s);
    });

    // === 控制面板（嵌在機身右側）===
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.1, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.5 })
    );
    panel.position.set(0.6, 2.7, 0.82);
    this.scene.add(panel);

    // === 速度旋鈕 ===
    const dialGroup = new THREE.Group();
    const dialBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4 })
    );
    dialBase.rotation.x = Math.PI / 2;
    dialGroup.add(dialBase);
    const dialKnob = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.18, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    dialKnob.position.z = 0.04;
    dialGroup.add(dialKnob);
    dialGroup.position.set(0.6, 3.05, 0.85);
    this.registerGroup(dialGroup, 'speed', '調速鈕');
    this.scene.add(dialGroup);

    // === 數位顯示 ===
    const display = makeTextPlane('800', { color: '#3aff6a', font: 'bold 90px monospace', bg: '#0a2a0a', w: 320, h: 120 });
    display.position.set(0.6, 2.62, 0.85);
    display.scale.set(0.55, 0.21, 1);
    this.scene.add(display);

    // === 開關 ===
    const swOn = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x2EBD66, emissive: 0x114a22, emissiveIntensity: 0.8 })
    );
    swOn.position.set(0.45, 2.35, 0.85);
    this.registerPart(swOn, 'switch', '電源開關');
    this.scene.add(swOn);
    const swOff = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x5a1a1a, roughness: 0.3 })
    );
    swOff.position.set(0.75, 2.35, 0.85);
    swOff.userData.partId = 'switch';
    this.scene.add(swOff);
    this.partsList.push(swOff);

    // === 上臂 ===
    const armMat = new THREE.MeshStandardMaterial({ color: 0xFF8A1A, roughness: 0.45, metalness: 0.25 });
    // 用 Lathe 不對，用拉伸 + 倒角看起來更乾淨
    const armShape = new THREE.Shape();
    armShape.moveTo(-1.3, 0);
    armShape.lineTo(-1.3, 0.55);
    armShape.bezierCurveTo(-1.0, 0.95, 1.0, 0.95, 1.3, 0.55);
    armShape.lineTo(1.3, 0);
    armShape.lineTo(-1.3, 0);
    const armGeom = new THREE.ExtrudeGeometry(armShape, { depth: 1.4, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4 });
    armGeom.translate(0, 0, -0.7);
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(0, 4.0, 0);
    arm.castShadow = true;
    this.scene.add(arm);
    // HANLIN logo on arm
    const hanlinLogo = makeTextPlane('HANLIN', { color: '#fff', font: 'bold 100px Inter, sans-serif', bg: 'rgba(255,255,255,0.18)', w: 600, h: 120 });
    hanlinLogo.position.set(0, 4.35, 0.71);
    hanlinLogo.scale.set(1.8, 0.36, 1);
    this.scene.add(hanlinLogo);

    // === 鋸條 ===
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.85, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 })
    );
    blade.position.set(0, 2.9, 0);
    blade.castShadow = true;
    this.registerPart(blade, 'blade', '鋸條');
    this.scene.add(blade);

    // === 上夾頭 ===
    const upperChuck = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.18, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 })
    );
    upperChuck.position.set(0, 3.85, 0);
    upperChuck.castShadow = true;
    this.registerPart(upperChuck, 'upper-chuck', '上夾頭');
    this.scene.add(upperChuck);

    // === 下夾頭 ===
    const lowerChuck = upperChuck.clone();
    lowerChuck.material = upperChuck.material.clone();
    lowerChuck.position.y = 1.97;
    lowerChuck.userData = { ...upperChuck.userData, partId: 'lower-chuck', partName: '下夾頭', origColor: upperChuck.material.color.clone(), origEmissive: upperChuck.material.emissive?.clone() };
    this.parts['lower-chuck'] = lowerChuck;
    this.partsList.push(lowerChuck);
    this.scene.add(lowerChuck);

    // === 壓料桿 ===
    const holdGroup = new THREE.Group();
    const hMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.65, roughness: 0.35 });
    const hArm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), hMat);
    hArm.position.set(-0.7, 0, 0);
    holdGroup.add(hArm);
    const hVert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), hMat);
    hVert.position.set(-1.35, -0.35, 0);
    holdGroup.add(hVert);
    const hFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    hFoot.position.set(-1.35, -0.7, 0);
    holdGroup.add(hFoot);
    holdGroup.position.set(0.05, 3.15, 0.5);
    holdGroup.traverse(m => { if (m.isMesh) m.castShadow = true; });
    this.registerGroup(holdGroup, 'hold-down', '壓料桿');
    this.scene.add(holdGroup);

    // === 吹氣管 ===
    const tubeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.85, 3.4, 0.4),
      new THREE.Vector3(0.4, 3.1, 0.5),
      new THREE.Vector3(0.08, 2.6, 0.2)
    );
    const tubeGeom = new THREE.TubeGeometry(tubeCurve, 24, 0.04, 10, false);
    const tube = new THREE.Mesh(tubeGeom, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }));
    tube.castShadow = true;
    this.registerPart(tube, 'blower', '吹氣管');
    this.scene.add(tube);

    // === 編號標籤（浮在每個部位上方）===
    this.labels = {};
    const labelData = {
      blade: { pos: [0, 2.9, 0.3], num: 1 },
      'upper-chuck': { pos: [0, 3.85, 0.3], num: 2 },
      'lower-chuck': { pos: [0, 1.97, 0.3], num: 3 },
      table: { pos: [-2.5, 1.85, 0], num: 4 },
      'hold-down': { pos: [-1.35, 2.85, 0.5], num: 5 },
      blower: { pos: [0.5, 2.4, 0.6], num: 6 },
      speed: { pos: [0.6, 3.4, 0.85], num: 7 },
      switch: { pos: [0.6, 2.0, 0.85], num: 8 },
    };
    Object.entries(labelData).forEach(([id, d]) => {
      const sprite = makeNumberSprite(d.num);
      sprite.position.set(...d.pos);
      sprite.userData.partId = id;
      sprite.userData.isLabel = true;
      this.scene.add(sprite);
      this.labels[id] = sprite;
    });
  }

  onPointerMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.partsList, false);
    const next = intersects[0]?.object;
    if (next?.userData.partId !== this.hovered?.userData.partId) {
      this.unhighlight(this.hovered);
      this.hovered = next;
      if (next) this.highlight(next, 0x553300);
      this.renderer.domElement.style.cursor = next ? 'pointer' : 'grab';
    }
  }

  onClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    // 包含 sprite 標籤
    const allTargets = [...this.partsList, ...Object.values(this.labels || {})];
    const hits = this.raycaster.intersectObjects(allTargets, false);
    const hit = hits[0]?.object;
    if (hit?.userData.partId) {
      // 觸發 module1 的 render 函式
      if (window.module1RenderPart) window.module1RenderPart(hit.userData.partId);
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      this.flashPart(hit.userData.partId);
    }
  }

  flashPart(id) {
    const part = this.parts[id];
    if (!part) return;
    const meshes = [];
    if (part.isMesh) meshes.push(part);
    else part.traverse(m => { if (m.isMesh) meshes.push(m); });
    meshes.forEach(m => {
      if (!m.material.emissive) return;
      const orig = m.userData.origEmissive?.clone() || new THREE.Color(0x000000);
      m.material.emissive.setHex(0xff7a00);
      m.material.emissiveIntensity = 0.8;
      let t = 0;
      const flash = () => {
        t += 0.05;
        m.material.emissiveIntensity = 0.8 * (1 - t);
        if (t < 1) requestAnimationFrame(flash);
        else {
          m.material.emissive.copy(orig);
          m.material.emissiveIntensity = 1;
        }
      };
      flash();
    });
  }

  highlight(mesh, hex) {
    if (!mesh?.material?.emissive) return;
    mesh.material.emissive.setHex(hex);
  }

  unhighlight(mesh) {
    if (!mesh?.material?.emissive) return;
    const orig = mesh.userData.origEmissive;
    if (orig) mesh.material.emissive.copy(orig);
    else mesh.material.emissive.setHex(0x000000);
  }

  toggleAutoRotate() {
    this.controls.autoRotate = !this.controls.autoRotate;
    return this.controls.autoRotate;
  }

  resetView() {
    this.camera.position.copy(this.defaultCamPos);
    this.controls.target.set(0, 2.2, 0);
    this.controls.update();
  }

  toggleBlade() {
    this.bladeRunning = !this.bladeRunning;
    if (typeof SoundFX !== 'undefined') {
      if (this.bladeRunning) SoundFX.startSaw();
      else SoundFX.stopSaw();
    }
    return this.bladeRunning;
  }

  onResize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 480;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    if (this.bladeRunning && this.parts.blade) {
      const t = performance.now();
      this.parts.blade.position.y = 2.9 + Math.sin(t / 18) * 0.06;
    }
    // 標籤永遠面向鏡頭（sprite 內建，不需處理）
    this.renderer.render(this.scene, this.camera);
  }
}

// === 工具：文字平面 ===
function makeTextPlane(text, opts) {
  const canvas = document.createElement('canvas');
  canvas.width = opts.w || 256;
  canvas.height = opts.h || 64;
  const ctx = canvas.getContext('2d');
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = opts.color || '#fff';
  ctx.font = opts.font || 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
}

// === 工具：編號圓徽（Sprite）===
function makeNumberSprite(num) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // 圓
  ctx.beginPath();
  ctx.arc(64, 64, 50, 0, Math.PI * 2);
  ctx.fillStyle = '#FF7A00';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  // 數字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 70px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), 64, 70);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.55, 0.55, 1);
  sprite.renderOrder = 999;
  return sprite;
}

// === 初始化 ===
let saw3D = null;
let initialized = false;
function init3D() {
  if (initialized) return;
  initialized = true;
  const stage = document.getElementById('three-stage');
  const loader = document.getElementById('three-loader');
  if (!stage) return;

  // 等到 view-pane 變成 active 才有寬高
  if (stage.clientWidth === 0) {
    requestAnimationFrame(init3D);
    initialized = false;
    return;
  }

  saw3D = new ScrollSaw3D(stage);
  if (loader) loader.style.display = 'none';

  // 控制按鈕
  document.getElementById('three-rotate-toggle').onclick = () => {
    const on = saw3D.toggleAutoRotate();
    document.getElementById('three-rotate-icon').textContent = on ? '⏸' : '▶';
  };
  document.getElementById('three-reset-view').onclick = () => saw3D.resetView();
  document.getElementById('three-blade-toggle').onclick = (e) => {
    const running = saw3D.toggleBlade();
    e.currentTarget.innerHTML = running ? '⏹ 停止鋸條' : '▶ 啟動鋸條';
  };
}

// 監聽分頁切換：當 3D 分頁變 active 才初始化
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const pane = document.querySelector('[data-pane="3d"]');
    if (pane && pane.classList.contains('active') && !initialized) {
      setTimeout(init3D, 50);
    }
  });
  document.querySelectorAll('.view-pane').forEach(p => {
    observer.observe(p, { attributes: true, attributeFilter: ['class'] });
  });
});
