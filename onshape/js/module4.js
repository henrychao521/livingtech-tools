// Onshape 模組 4：4 種建模方式 + 5 題形狀挑戰
const METHODS = [
  {
    id: 'extrude',
    name: 'Extrude（擠出）',
    icon: '⬆️',
    desc: '把 2D 草圖往垂直方向「拉高」變成 3D 物件。最基本、最常用的方法。',
    egs: '適合：方塊、棒材、文字立體化、平板類零件',
    svg: `<svg viewBox="0 0 120 120"><defs><linearGradient id="ext-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs><rect x="20" y="20" width="60" height="40" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 2"/><polygon points="20,60 20,90 40,100 80,100 80,60 40,50" fill="url(#ext-g)" stroke="#075985"/><line x1="40" y1="50" x2="20" y2="60" stroke="#075985"/><line x1="80" y1="60" x2="40" y2="50" stroke="#075985"/><line x1="40" y1="50" x2="40" y2="100" stroke="#075985" stroke-dasharray="2 1" opacity=".5"/><path d="M 90 70 L 90 95" stroke="#dc2626" stroke-width="2"/><polygon points="90,95 86,90 94,90" fill="#dc2626"/></svg>`,
  },
  {
    id: 'revolve',
    name: 'Revolve（旋轉）',
    icon: '🔄',
    desc: '把 2D 輪廓繞一條軸旋轉一圈（或部分），形成對稱的旋轉體。',
    egs: '適合：杯子、瓶子、輪子、燈罩、任何「車床能做的」',
    svg: `<svg viewBox="0 0 120 120"><line x1="60" y1="10" x2="60" y2="110" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M 60 25 L 80 25 L 85 45 L 78 75 L 80 95 L 60 95 Z" fill="none" stroke="#7c3aed" stroke-width="1.5"/><ellipse cx="60" cy="25" rx="20" ry="6" fill="#a78bfa" opacity=".5"/><ellipse cx="60" cy="55" rx="25" ry="7" fill="#7c3aed" opacity=".4"/><ellipse cx="60" cy="95" rx="20" ry="6" fill="#a78bfa" opacity=".5"/><path d="M 35 25 Q 30 60 35 95 L 85 95 Q 90 60 85 25" fill="#a78bfa" opacity=".3"/></svg>`,
  },
  {
    id: 'shell',
    name: 'Shell（薄殼）',
    icon: '🥃',
    desc: '把實心物件挖空，留下指定厚度的外殼。先做出實心，再 Shell 挖空。',
    egs: '適合：杯子（外形已有再挖內部）、容器、外殼',
    svg: `<svg viewBox="0 0 120 120"><path d="M 30 30 L 90 30 L 88 100 L 32 100 Z" fill="#fbbf24" stroke="#92400e"/><path d="M 36 36 L 84 36 L 82 94 L 38 94 Z" fill="#fff" stroke="#92400e" stroke-dasharray="3 2"/><text x="60" y="115" text-anchor="middle" font-size="9" fill="#92400e" font-weight="700">厚度 = 2mm</text></svg>`,
  },
  {
    id: 'loft',
    name: 'Loft（疊層拉伸）',
    icon: '🌊',
    desc: '在多個平面分別畫不同輪廓的草圖，Loft 會把這些草圖「縫合」成漸變的 3D 形狀。',
    egs: '適合：花瓶（底圓→中方→頂圓）、船殼、流線造型',
    svg: `<svg viewBox="0 0 120 120"><circle cx="60" cy="25" r="12" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/><rect x="42" y="56" width="36" height="8" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/><circle cx="60" cy="95" r="18" fill="none" stroke="#16A34A" stroke-width="1.5" stroke-dasharray="2 1"/><path d="M 48 25 Q 35 55 42 95 M 72 25 Q 85 55 78 95" stroke="#16A34A" stroke-width="2" fill="none"/><path d="M 48 25 Q 42 55 42 95 L 78 95 Q 78 55 72 25 Z" fill="#86efac" opacity=".3"/></svg>`,
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

// 渲染 4 種方法
const mgrid = document.getElementById('method-grid');
METHODS.forEach(m => {
  const div = document.createElement('div');
  div.className = 'os-method';
  div.innerHTML = `
    <div class="os-method-icon">${m.icon}</div>
    <div style="text-align:center">${m.svg}</div>
    <h4>${m.name}</h4>
    <p>${m.desc}</p>
    <p class="os-method-egs">${m.egs}</p>
  `;
  mgrid.appendChild(div);
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
