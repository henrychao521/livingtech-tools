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
    // ============================================================
    // 重寫版線鋸機（依真實 Dremel/Excalibur/DeWalt 構造比例）
    //
    // 座標約定（左手座標系）:
    //   X：左右（+ 右）
    //   Y：高度（+ 上）
    //   Z：前後（+ 前/朝向觀眾）
    //
    // 結構（由後往前 / 由下往上）:
    //   Base + 馬達箱（位於後段，z = -1.0 ~ -0.2）
    //   ├ 下臂（horizontal arm）伸出至前方 z = +0.9
    //   ├ 工作台（小圓盤，位於下臂前端上方）
    //   ├ 立柱（vertical column，從馬達箱頂部向上）
    //   ├ 上懸臂（curved arm，從立柱頂部向前彎向工作台正上方）
    //   ├ 上下夾頭 + 鋸條（位於懸臂前端 / 工作台中央）
    //   ├ 壓料桿（從上懸臂前端垂下，緊鄰鋸條）
    //   └ 吹氣管（從上懸臂下方延伸至鋸條切割點）
    // ============================================================

    const ORANGE = 0xFF7A00;
    const ORANGE_LIGHT = 0xFF9933;
    const DARK_METAL = 0x2a2a2a;
    const TABLE_METAL = 0xc5c5c5;
    const BLADE_DARK = 0x1a1a1a;

    const matBody = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.45, metalness: 0.2 });
    const matBodyLight = new THREE.MeshStandardMaterial({ color: ORANGE_LIGHT, roughness: 0.45, metalness: 0.2 });
    const matBase = new THREE.MeshStandardMaterial({ color: DARK_METAL, roughness: 0.55, metalness: 0.4 });
    const matTable = new THREE.MeshStandardMaterial({ color: TABLE_METAL, metalness: 0.55, roughness: 0.35 });
    const matBlack = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.7, roughness: 0.3 });

    // ============================================================
    // 1. 底座（暗灰鑄鐵感）
    // ============================================================
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 3.2), matBase);
    base.position.set(0, 0.275, 0);
    base.castShadow = true; base.receiveShadow = true;
    this.scene.add(base);

    // 銘牌（前面）
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.32, 0.04), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    plate.position.set(0, 0.3, 1.62);
    this.scene.add(plate);
    const plateLabel = makeTextPlane('SCROLL SAW', { color: '#FF7A00', font: 'bold 70px Inter, sans-serif', bg: '#111', w: 440, h: 100 });
    plateLabel.position.set(0, 0.3, 1.64);
    plateLabel.scale.set(1.4, 0.28, 1);
    this.scene.add(plateLabel);

    // ============================================================
    // 2. 馬達箱（位於後段，較高的橘色塊）
    // ============================================================
    const motorBox = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.0, 1.5), matBody);
    motorBox.position.set(0, 1.55, -0.85);
    motorBox.castShadow = true;
    this.scene.add(motorBox);

    // 馬達箱頂部斜面（裝飾）
    const motorTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 1.3), matBodyLight);
    motorTop.position.set(0, 2.72, -0.85);
    this.scene.add(motorTop);

    // 通風孔（左右兩側）
    [-1.4, 1.4].forEach(x => {
      for (let i = 0; i < 6; i++) {
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.7), new THREE.MeshStandardMaterial({ color: 0x111 }));
        v.position.set(x, 1.0 + i * 0.18, -0.85);
        this.scene.add(v);
      }
    });

    // ============================================================
    // 3. 下臂（horizontal cantilever 從馬達箱底部向前延伸）
    // ============================================================
    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 2.2), matBodyLight);
    lowerArm.position.set(0, 0.78, 0.4);
    lowerArm.castShadow = true;
    this.scene.add(lowerArm);

    // 下臂前端的鋸條安裝口（黑色方塊）
    const lowerHousing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.3), matBlack);
    lowerHousing.position.set(0, 0.78, 1.5);
    this.scene.add(lowerHousing);

    // ============================================================
    // 4. 工作台（小圓盤，位於下臂前端正上方）
    // ============================================================
    const tableGroup = new THREE.Group();
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.12, 48), matTable);
    table.castShadow = true; table.receiveShadow = true;
    tableGroup.add(table);
    // 鋸縫
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.13, 0.6), new THREE.MeshStandardMaterial({ color: 0x222 }));
    slot.position.set(0, 0, 0);
    tableGroup.add(slot);
    // 邊緣傾角刻度條
    const tilt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.06), matBase);
    tilt.position.set(0.95, -0.18, 0);
    tableGroup.add(tilt);
    tableGroup.position.set(0, 1.05, 0.95);
    this.registerPart(table, 'table', '工作台');
    this.scene.add(tableGroup);

    // ============================================================
    // 5. 上懸臂（從馬達箱頂部向前彎曲延伸到鋸條上方）
    //    用 Catmull-Rom curve + TubeGeometry 做出有機曲線
    // ============================================================
    const armCurvePoints = [
      new THREE.Vector3(0, 2.9, -1.0),  // 起點：馬達箱頂後
      new THREE.Vector3(0, 3.4, -0.5),  // 上升段
      new THREE.Vector3(0, 3.55, 0.2),  // 弧頂
      new THREE.Vector3(0, 3.45, 0.7),  // 下彎
      new THREE.Vector3(0, 3.05, 1.0),  // 終點：上夾頭位置上方
    ];
    const armCurve = new THREE.CatmullRomCurve3(armCurvePoints);
    const armGeom = new THREE.TubeGeometry(armCurve, 32, 0.32, 12, false);
    const arm = new THREE.Mesh(armGeom, matBody);
    arm.castShadow = true;
    this.scene.add(arm);

    // 懸臂前端的鋸條安裝口
    const upperHousing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 0.3), matBlack);
    upperHousing.position.set(0, 2.85, 1.0);
    this.scene.add(upperHousing);

    // 製作標記（懸臂上方）
    const authorLogo = makeTextPlane('珩宇老師製作', { color: '#fff', font: 'bold 72px "Noto Sans TC", sans-serif', bg: 'rgba(255,255,255,0.18)', w: 720, h: 120 });
    authorLogo.position.set(0, 3.75, 0.2);
    authorLogo.rotation.x = -0.5;
    authorLogo.scale.set(1.6, 0.28, 1);
    this.scene.add(authorLogo);

    // ============================================================
    // 6. 鋸條（連接上下夾頭，垂直）
    // ============================================================
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.06), new THREE.MeshStandardMaterial({ color: BLADE_DARK, metalness: 0.9, roughness: 0.2 }));
    blade.position.set(0, 1.92, 1.0);
    blade.castShadow = true;
    this.registerPart(blade, 'blade', '鋸條');
    this.scene.add(blade);

    // 鋸齒紋路
    for (let i = 0; i < 16; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), matMetal);
      tooth.position.set(0.04, 1.2 + i * 0.09, 1.0);
      this.scene.add(tooth);
    }

    // ============================================================
    // 7. 上夾頭（在懸臂前端、下接鋸條頂端）
    // ============================================================
    const upperChuck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.22), matBlack);
    upperChuck.position.set(0, 2.68, 1.0);
    upperChuck.castShadow = true;
    this.registerPart(upperChuck, 'upper-chuck', '上夾頭');
    this.scene.add(upperChuck);
    // 夾頭螺絲
    const upperScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), matMetal);
    upperScrew.rotation.z = Math.PI / 2;
    upperScrew.position.set(0.18, 2.68, 1.0);
    this.scene.add(upperScrew);

    // ============================================================
    // 8. 下夾頭（位於工作台下方、下臂前端）
    // ============================================================
    const lowerChuck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.22), matBlack);
    lowerChuck.position.set(0, 1.16, 1.0);
    lowerChuck.castShadow = true;
    this.registerPart(lowerChuck, 'lower-chuck', '下夾頭');
    this.scene.add(lowerChuck);
    const lowerScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), matMetal);
    lowerScrew.rotation.z = Math.PI / 2;
    lowerScrew.position.set(0.18, 1.16, 1.0);
    this.scene.add(lowerScrew);

    // ============================================================
    // 9. 壓料桿（從上夾頭附近垂下，緊靠鋸條）
    // ============================================================
    const holdGroup = new THREE.Group();
    const matHold = new THREE.MeshStandardMaterial({ color: 0x666, metalness: 0.65, roughness: 0.35 });
    const hRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 12), matHold);
    hRod.position.set(0, -0.43, 0);
    holdGroup.add(hRod);
    const hFootGroup = new THREE.Group();
    const hFoot = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.18), new THREE.MeshStandardMaterial({ color: 0x4a4a4a }));
    hFootGroup.add(hFoot);
    // 壓料桿前端的弓形夾
    const hClip = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI), matHold);
    hClip.rotation.x = Math.PI;
    hClip.position.set(0, 0.04, 0);
    hFootGroup.add(hClip);
    hFootGroup.position.set(0, -0.9, 0);
    holdGroup.add(hFootGroup);
    holdGroup.position.set(0.18, 2.5, 1.0);
    holdGroup.traverse(m => { if (m.isMesh) m.castShadow = true; });
    this.registerGroup(holdGroup, 'hold-down', '壓料桿');
    this.scene.add(holdGroup);

    // ============================================================
    // 10. 吹氣管（從懸臂下方一條彈性管延伸到鋸條切割點）
    // ============================================================
    const tubeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.5, 2.6, 0.6),
      new THREE.Vector3(0.35, 2.35, 0.85),
      new THREE.Vector3(0.18, 1.85, 0.98)
    );
    const tubeGeom = new THREE.TubeGeometry(tubeCurve, 24, 0.04, 10, false);
    const tube = new THREE.Mesh(tubeGeom, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }));
    tube.castShadow = true;
    this.registerPart(tube, 'blower', '吹氣管');
    this.scene.add(tube);

    // ============================================================
    // 11. 控制面板（在馬達箱右側）
    // ============================================================
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.7), new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.5 }));
    panel.position.set(1.42, 1.85, -0.6);
    this.scene.add(panel);

    // 數位顯示
    const display = makeTextPlane('800', { color: '#3aff6a', font: 'bold 90px monospace', bg: '#0a2a0a', w: 320, h: 120 });
    display.position.set(1.45, 2.15, -0.6);
    display.rotation.y = Math.PI / 2;
    display.scale.set(0.42, 0.18, 1);
    this.scene.add(display);

    // 速度旋鈕
    const dialGroup = new THREE.Group();
    const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4 }));
    dialBase.rotation.z = Math.PI / 2;
    dialGroup.add(dialBase);
    const dialKnob = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.03), new THREE.MeshStandardMaterial({ color: 0x222 }));
    dialKnob.position.x = 0.04;
    dialGroup.add(dialKnob);
    dialGroup.position.set(1.45, 1.85, -0.6);
    this.registerGroup(dialGroup, 'speed', '調速鈕');
    this.scene.add(dialGroup);

    // 電源開關（綠色 ON / 紅色 OFF）
    const swOn = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.22), new THREE.MeshStandardMaterial({ color: 0x2EBD66, emissive: 0x114a22, emissiveIntensity: 0.8 }));
    swOn.position.set(1.45, 1.55, -0.45);
    this.registerPart(swOn, 'switch', '電源開關');
    this.scene.add(swOn);
    const swOff = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.22), new THREE.MeshStandardMaterial({ color: 0x5a1a1a, roughness: 0.3 }));
    swOff.position.set(1.45, 1.55, -0.75);
    swOff.userData.partId = 'switch';
    this.scene.add(swOff);
    this.partsList.push(swOff);

    // ============================================================
    // 12. 編號標籤（浮在每個部位上方）
    // ============================================================
    this.labels = {};
    const labelData = {
      blade: { pos: [0.25, 1.92, 1.2], num: 1 },
      'upper-chuck': { pos: [0.25, 2.68, 1.2], num: 2 },
      'lower-chuck': { pos: [0.25, 1.16, 1.2], num: 3 },
      table: { pos: [-1.6, 1.1, 0.95], num: 4 },
      'hold-down': { pos: [-0.4, 1.7, 1.1], num: 5 },
      blower: { pos: [0.5, 2.45, 0.85], num: 6 },
      speed: { pos: [1.7, 1.85, -0.6], num: 7 },
      switch: { pos: [1.7, 1.55, -0.45], num: 8 },
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
