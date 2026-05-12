// Onshape 模組 4：4 種建模方式 + 5 題形狀挑戰（動畫版）
const METHODS = [
  {
    id: 'extrude',
    name: 'Extrude（擠出）',
    icon: '⬆️',
    desc: '把 2D 草圖往垂直方向「拉高」變成 3D 物件。最基本、最常用的方法。',
    egs: '適合：方塊、棒材、文字立體化、平板類零件',
    svg: `<svg viewBox="0 0 140 140" data-anim="extrude">
      <defs>
        <linearGradient id="ext-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#7dd3fc"/>
          <stop offset="1" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <!-- 底面草圖 -->
      <rect class="ext-sketch" x="30" y="100" width="80" height="0" fill="url(#ext-g)" stroke="#075985" stroke-width="1.5"/>
      <!-- 頂面斜投影（3D 透視） -->
      <polygon class="ext-top" points="30,100 60,80 140,80 110,100" fill="#bae6fd" stroke="#075985" stroke-width="1.5" opacity="0"/>
      <polygon class="ext-side" points="110,100 140,80 140,100 110,100" fill="#0284c7" stroke="#075985" stroke-width="1.5" opacity="0"/>
      <!-- 草圖底線（dashed） -->
      <rect x="30" y="100" width="80" height="0" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 2" class="ext-base"/>
      <!-- 向上箭頭 -->
      <g class="ext-arrow" opacity="0">
        <line x1="120" y1="100" x2="120" y2="50" stroke="#dc2626" stroke-width="2"/>
        <polygon points="120,50 116,56 124,56" fill="#dc2626"/>
        <text x="125" y="78" font-size="9" fill="#dc2626" font-weight="700">擠出</text>
      </g>
      <text x="70" y="135" text-anchor="middle" font-size="10" fill="#075985">2D 草圖 → 3D 立體</text>
    </svg>`,
  },
  {
    id: 'revolve',
    name: 'Revolve（旋轉）',
    icon: '🔄',
    desc: '把 2D 輪廓繞一條軸旋轉一圈（或部分），形成對稱的旋轉體。',
    egs: '適合：杯子、瓶子、輪子、燈罩、任何「車床能做的」',
    svg: `<svg viewBox="0 0 140 140" data-anim="revolve">
      <!-- 旋轉軸 -->
      <line x1="70" y1="15" x2="70" y2="125" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/>
      <!-- 2D 輪廓（L 形馬克杯截面） -->
      <path class="rev-profile" d="M 70 25 L 95 25 L 100 45 L 92 85 L 95 110 L 70 110" fill="none" stroke="#7c3aed" stroke-width="2"/>
      <!-- 旋轉產生的 3D 杯體（橢圓堆疊） -->
      <g class="rev-3d" opacity="0">
        <ellipse cx="70" cy="25" rx="25" ry="6" fill="#a78bfa" stroke="#7c3aed" stroke-width="1"/>
        <path d="M 45 25 Q 35 65 45 110 L 95 110 Q 105 65 95 25 Z" fill="#c4b5fd" stroke="#7c3aed" stroke-width="1.2" opacity=".5"/>
        <ellipse cx="70" cy="110" rx="25" ry="6" fill="#a78bfa" stroke="#7c3aed" stroke-width="1"/>
      </g>
      <!-- 旋轉箭頭 -->
      <g class="rev-arc" opacity="0">
        <path d="M 95 70 A 25 8 0 1 1 45 70" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
        <polygon points="45,70 50,66 50,74" fill="#fbbf24"/>
      </g>
      <text x="70" y="135" text-anchor="middle" font-size="10" fill="#7c3aed">輪廓 → 繞軸旋轉</text>
    </svg>`,
  },
  {
    id: 'shell',
    name: 'Shell（薄殼）',
    icon: '🥃',
    desc: '把實心物件挖空，留下指定厚度的外殼。先做出實心，再 Shell 挖空。',
    egs: '適合：杯子（外形已有再挖內部）、容器、外殼',
    svg: `<svg viewBox="0 0 140 140" data-anim="shell">
      <!-- 實心方塊（前面、頂面、側面）-->
      <polygon class="shell-front" points="35,40 95,40 95,115 35,115" fill="#fbbf24" stroke="#92400e" stroke-width="1.5"/>
      <polygon class="shell-top" points="35,40 65,20 125,20 95,40" fill="#fde68a" stroke="#92400e" stroke-width="1.5"/>
      <polygon class="shell-side" points="95,40 125,20 125,95 95,115" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>
      <!-- 內部挖空 -->
      <polygon class="shell-hollow" points="42,46 88,46 118,26 65,26" fill="#fff" stroke="#92400e" stroke-dasharray="2 2" stroke-width="1" opacity="0"/>
      <polygon class="shell-inside" points="42,46 88,46 88,108 42,108" fill="#fff" stroke="#92400e" stroke-dasharray="2 2" stroke-width="1" opacity="0"/>
      <text x="70" y="135" text-anchor="middle" font-size="10" fill="#92400e">實心 → 挖空（保留 2mm 殼）</text>
    </svg>`,
  },
  {
    id: 'loft',
    name: 'Loft（疊層拉伸）',
    icon: '🌊',
    desc: '在多個平面分別畫不同輪廓的草圖，Loft 會把這些草圖「縫合」成漸變的 3D 形狀。',
    egs: '適合：花瓶（底圓→中方→頂圓）、船殼、流線造型',
    svg: `<svg viewBox="0 0 140 140" data-anim="loft">
      <!-- 上中下三個草圖輪廓（小圓、方、大圓）-->
      <circle class="loft-c1" cx="70" cy="25" r="12" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/>
      <rect class="loft-r" x="48" y="63" width="44" height="10" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/>
      <circle class="loft-c2" cx="70" cy="105" r="20" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/>
      <!-- 連接體（漸變外殼） -->
      <path class="loft-body" d="M 58 25 Q 45 50 48 68 L 48 68 Q 42 90 50 105 L 90 105 Q 98 90 92 68 L 92 68 Q 95 50 82 25 Z" fill="#86efac" stroke="#16A34A" stroke-width="1.5" opacity="0"/>
      <text x="70" y="135" text-anchor="middle" font-size="10" fill="#16A34A">多層草圖 → 漸變連接</text>
    </svg>`,
  },
];

const CHALLENGES = [
  { shape: '🔩 螺絲（圓柱形+螺紋）', correct: 'revolve', why: '圓柱本體是旋轉對稱，最快的方式是用 Revolve 把 L 形截面繞中軸旋轉。' },
  { shape: '📦 收納盒（長方形有內部空間）', correct: 'shell', why: '先 Extrude 出實心長方體，再用 Shell 挖空（指定保留厚度）。' },
  { shape: '🏺 花瓶（底圓 → 中段方形 → 頂部六角形）', correct: 'loft', why: '不同截面之間的漸變，必用 Loft 連接多層草圖。' },
  { shape: '🪑 椅腳（截面均勻的細長條）', correct: 'extrude', why: '截面不變的條狀物，最簡單是用 Extrude 把矩形/圓形草圖往上拉。' },
  { shape: '☕ 馬克杯（圓柱外型 + 內凹 + 把手）', correct: 'revolve', why: '主體用 Revolve 一次完成圓柱+內凹（用 L 形截面）；把手另外 Extrude。也可先 Extrude 圓柱再 Shell — 但這需要兩步驟。' },
];

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

// 渲染 4 種方法 + 動畫
const mgrid = document.getElementById('method-grid');
METHODS.forEach(m => {
  const div = document.createElement('div');
  div.className = 'os-method';
  div.dataset.methodId = m.id;
  div.innerHTML = `
    <div class="os-method-icon">${m.icon}</div>
    <div style="text-align:center">${m.svg}</div>
    <h4>${m.name}</h4>
    <p>${m.desc}</p>
    <p class="os-method-egs">${m.egs}</p>
    <button class="m-replay" style="margin-top:8px;background:transparent;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;color:var(--text-soft)">▶ 重播動畫</button>
  `;
  mgrid.appendChild(div);
});

// === anime.js 動畫定義（簡化版：直接設 style + timeline） ===
function setStyle(el, props) {
  if (!el) return;
  for (const k in props) el.style[k] = props[k];
}

function playExtrude(svg) {
  if (typeof anime === 'undefined') return;
  const sketch = svg.querySelector('.ext-sketch');
  const top = svg.querySelector('.ext-top');
  const side = svg.querySelector('.ext-side');
  const base = svg.querySelector('.ext-base');
  const arrow = svg.querySelector('.ext-arrow');
  // Reset
  sketch.setAttribute('y', '100'); sketch.setAttribute('height', '0');
  base.setAttribute('width', '0'); base.setAttribute('height', '0.001');
  setStyle(top, { opacity: '0' });
  setStyle(side, { opacity: '0' });
  setStyle(arrow, { opacity: '0' });

  const tl = anime.timeline({ easing: 'easeInOutQuad' });
  tl.add({ targets: base, width: 80, duration: 500 })
    .add({ targets: arrow, opacity: 1, duration: 300 })
    .add({ targets: sketch, y: 80, height: 20, duration: 700 }, '-=100')
    .add({ targets: [top, side], opacity: 1, duration: 400 }, '-=300');
}

function playRevolve(svg) {
  if (typeof anime === 'undefined') return;
  const profile = svg.querySelector('.rev-profile');
  const body3d = svg.querySelector('.rev-3d');
  const arc = svg.querySelector('.rev-arc');
  setStyle(profile, { opacity: '1' });
  setStyle(body3d, { opacity: '0' });
  setStyle(arc, { opacity: '0' });

  const tl = anime.timeline({ easing: 'easeInOutQuad' });
  tl.add({ targets: arc, opacity: 1, duration: 400 })
    .add({ targets: profile, opacity: 0.3, duration: 600 })
    .add({ targets: body3d, opacity: 1, duration: 800 }, '-=400');
}

function playShell(svg) {
  if (typeof anime === 'undefined') return;
  const hollow = svg.querySelector('.shell-hollow');
  const inside = svg.querySelector('.shell-inside');
  setStyle(hollow, { opacity: '0' });
  setStyle(inside, { opacity: '0' });

  const tl = anime.timeline({ easing: 'easeInOutQuad' });
  tl.add({ duration: 800, targets: hollow, opacity: 0 })   // 等待 0.8s 顯示實心
    .add({ targets: hollow, opacity: 1, duration: 600 })
    .add({ targets: inside, opacity: 0.85, duration: 500 });
}

function playLoft(svg) {
  if (typeof anime === 'undefined') return;
  const c1 = svg.querySelector('.loft-c1');
  const r = svg.querySelector('.loft-r');
  const c2 = svg.querySelector('.loft-c2');
  const body = svg.querySelector('.loft-body');
  [c1, r, c2, body].forEach(e => setStyle(e, { opacity: '0' }));

  const tl = anime.timeline({ easing: 'easeInOutQuad' });
  tl.add({ targets: c1, opacity: 1, duration: 300 })
    .add({ targets: r, opacity: 1, duration: 300 })
    .add({ targets: c2, opacity: 1, duration: 300 })
    .add({ targets: body, opacity: 0.8, duration: 800 });
}

const PLAYERS = { extrude: playExtrude, revolve: playRevolve, shell: playShell, loft: playLoft };

function playFor(card) {
  const id = card.dataset.methodId;
  const svg = card.querySelector('svg[data-anim]');
  const fn = PLAYERS[id];
  if (fn && svg) fn(svg);
}

// IntersectionObserver 進入視窗自動播放
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      playFor(e.target);
      if (!e.target.dataset.played) e.target.dataset.played = '1';
    }
  });
}, { threshold: 0.5 });
mgrid.querySelectorAll('.os-method').forEach(card => io.observe(card));

// 重播按鈕
mgrid.querySelectorAll('.m-replay').forEach(btn => {
  btn.addEventListener('click', () => playFor(btn.closest('.os-method')));
});

// 5 題挑戰
let answered = 0, correct = 0;
const quizDiv = document.getElementById('model-quiz');
CHALLENGES.forEach((c, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:16px;margin:0 0 12px">${i + 1}. 目標形狀：<span style="color:var(--primary-dark)">${c.shape}</span></h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px">
      ${METHODS.map(m => `<button class="m-opt" data-q="${i}" data-pick="${m.id}" style="background:#fafafa;border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600">${m.icon} ${m.name.split('（')[0]}</button>`).join('')}
    </div>
    <div class="m-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  quizDiv.appendChild(div);
});

const answeredSet = new Set();
quizDiv.querySelectorAll('.m-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answeredSet.has(qIdx)) return;
    answeredSet.add(qIdx);
    const pick = btn.dataset.pick;
    const ch = CHALLENGES[qIdx];
    const isRight = pick === ch.correct;
    if (isRight) correct++;
    answered++;

    quizDiv.querySelectorAll(`.m-opt[data-q="${qIdx}"]`).forEach(b => {
      b.style.cursor = 'default';
      const p = b.dataset.pick;
      if (p === pick) {
        b.style.background = isRight ? '#dcfce7' : '#fee2e2';
        b.style.borderColor = isRight ? '#16A34A' : '#dc2626';
      } else if (p === ch.correct) {
        b.style.background = '#ecfdf5';
        b.style.borderColor = '#16A34A';
      }
    });

    const fb = quizDiv.querySelector(`.m-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓ 答對！' : '✗ 不是最佳選擇'} ${ch.why}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    document.getElementById('quiz-progress').textContent = `挑戰 ${answered} / 5（答對 ${correct}）`;

    if (answered === CHALLENGES.length) {
      if (correct >= 4) {
        progress.module4 = true;
        progress.module4_score = correct;
        localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
        if (typeof showToast === 'function') showToast(`🏆 模組 4 通過！答對 ${correct}/5`, 'good');
      }
    }
  });
});
