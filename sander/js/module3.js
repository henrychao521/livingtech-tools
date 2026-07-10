// 砂磨機 模組 3：操作流程
const STEPS = [
  { title: '穿戴護具', desc: '護目鏡（防屑彈飛）、N95 等級口罩（防超細粉塵）。長髮綁起、寬鬆袖口塞好。\n⚠ 禁戴布手套——同所有電動機具。', tip: '砂磨粉塵粒徑可達 PM2.5 等級，戴一般紗布口罩擋不住。要用 N95 或工業級防塵口罩。', warn: '木屑粉吸入會引起木工肺（hypersensitivity pneumonitis）。', anim: 'ppe' },
  { title: '選擇砂帶 / 砂盤粒度', desc: '依工件狀態選粒度：\n• 60–80 號：粗磨、去料快\n• 120 號：中磨\n• 180–240 號：細磨\n• 320 號以上：精修拋光\n\n通則：循序漸進，不能跳級（80 → 直接 240 號會留下深紋）。', tip: '油漆前磨到 180–240 號表面就足夠；上漆後磨 320 號去毛邊。', warn: null, anim: 'grit' },
  { title: '檢查砂帶 / 砂盤狀態', desc: '裝砂帶前確認：\n• 砂帶內側「箭頭方向」對齊滾輪轉向\n• 砂帶無裂痕、無脫粒\n• 張力適當（按下中央能下壓 5mm）\n• 砂盤平整、無凹陷', tip: '砂帶方向錯誤是新手最常見錯誤——裝完先慢速空轉看會不會偏移。', warn: '砂帶有裂痕一定要換新，繼續用會在運轉中斷裂飛出。', anim: 'belt-check' },
  { title: '接上集塵', desc: '把集塵口連接到工坊吸塵器或集塵桶。確認連接緊密、軟管沒摺彎、集塵桶尚有容量。\n⚠ 這一步不可省略——粉塵爆炸與木工肺都由此防範。', tip: '集塵桶滿 70% 就要清空，太滿會降低吸力。', warn: '沒接集塵不可以使用砂磨機。', anim: 'dust' },
  { title: '工件就位、用靠尺支撐', desc: '把工件放上工作面，後方平貼「靠尺」（fence）。靠尺可調 0°/45°/90° 做斜角修整。小工件（< 5cm）用木夾或推板（push block）固定，不可徒手捏。', tip: '盤式砂磨記得：先空轉觀察旋轉方向，工件只能放在「砂盤向下旋轉」那一側（多數逆時針機型為左半邊；依教室機台實際方向為準）。', warn: '小工件徒手捏是擦傷事故主因。', anim: 'fence' },
  { title: '開機 → 等砂帶穩定 → 接觸工件', desc: '1. 按下 ON 按鈕\n2. 等砂帶/砂盤達到穩定轉速（約 3 秒）\n3. 工件「平」貼工作面、後緣抵靠尺\n4. 緩慢推向砂帶 / 砂盤接觸點\n5. 接觸瞬間有輕微振動是正常的', tip: '不要在砂帶轉動前就把工件壓上去——靜止砂帶被工件卡住可能燒馬達。', warn: null, anim: 'start' },
  { title: '均勻施力、持續移動', desc: '砂磨核心原則：「持續移動，分散熱量」。\n• 工件以平穩速度橫向移動，覆蓋整個工件面\n• 施力均勻，不要某一點重壓\n• 每磨 3–5 秒抬起檢查\n• 若聞到焦味或工件變熱，立刻離開砂帶散熱', tip: '一直停在同一點 > 2 秒，木材就會焦黑、塑料會熔融。', warn: '停留不動會燒焦工件、退火金屬、熔毀塑料。', anim: 'feed' },
  { title: '離開砂帶 → 停機 → 清潔', desc: '1. 工件先離開砂帶（不要直接關機，慣性可能扯動工件）\n2. 按 OFF，等砂帶完全停止（約 5–10 秒）\n3. 用毛刷或吸塵器清理機台粉塵\n4. 必要時換下砂帶歸位（高粒度的繼續用、磨損的丟棄）\n5. 清地面、關集塵桶', tip: '剛磨完的工件表面可能很燙（特別是金屬），冷卻 30 秒再徒手摸。', warn: '殘留粉塵是下次塵爆的火種。', anim: 'finish' },
];

function renderAnim(type) {
  const anims = {
    ppe: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <ellipse cx="200" cy="200" rx="80" ry="8" fill="rgba(0,0,0,.1)"/>
      <circle cx="200" cy="100" r="50" fill="#fde68a"/>
      <rect x="160" y="85" width="80" height="20" rx="4" fill="rgba(100,200,255,.4)" stroke="#0891b2" stroke-width="2"/>
      <!-- N95 口罩 -->
      <path d="M 165 115 Q 200 135 235 115 L 232 145 Q 200 152 168 145 Z" fill="#fff" stroke="#7C3AED" stroke-width="2"/>
      <text x="200" y="140" text-anchor="middle" font-size="9" fill="#7C3AED" font-weight="800">N95</text>
      <text x="200" y="210" text-anchor="middle" font-size="11" fill="#444">N95 防塵口罩 + 護目鏡，禁戴手套</text>
    </svg>`,
    grit: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g font-size="11" font-weight="700" font-family="Inter">
        <rect x="40" y="80" width="50" height="50" fill="#a16207"/><text x="65" y="148" text-anchor="middle">60</text><text x="65" y="162" text-anchor="middle" fill="#666" font-size="9">粗磨</text>
        <rect x="105" y="80" width="50" height="50" fill="#92400e"/><text x="130" y="148" text-anchor="middle">120</text><text x="130" y="162" text-anchor="middle" fill="#666" font-size="9">中磨</text>
        <rect x="170" y="80" width="50" height="50" fill="#78350f"/><text x="195" y="148" text-anchor="middle">180</text><text x="195" y="162" text-anchor="middle" fill="#666" font-size="9">細磨</text>
        <rect x="235" y="80" width="50" height="50" fill="#451a03"/><text x="260" y="148" text-anchor="middle">240</text><text x="260" y="162" text-anchor="middle" fill="#666" font-size="9">精修</text>
        <rect x="300" y="80" width="50" height="50" fill="#1c0f02"/><text x="325" y="148" text-anchor="middle">320</text><text x="325" y="162" text-anchor="middle" fill="#666" font-size="9">拋光</text>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">循序漸進，不能跳級</text>
    </svg>`,
    'belt-check': `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <circle cx="140" cy="110" r="40" fill="#9ca3af"/><circle cx="260" cy="110" r="40" fill="#9ca3af"/>
      <path d="M 140 70 L 260 70 L 260 78 L 140 78 Z" fill="#92400e"/>
      <path d="M 140 142 L 260 142 L 260 150 L 140 150 Z" fill="#92400e"/>
      <!-- 箭頭 -->
      <polygon points="195,76 207,72 195,68" fill="#fff"/>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">⚠ 砂帶箭頭方向必須對齊轉向</text>
    </svg>`,
    dust: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="80" y="100" width="60" height="60" rx="4" fill="#7C3AED"/>
      <circle cx="110" cy="130" r="14" fill="#0f172a"/>
      <circle cx="110" cy="130" r="8" fill="#A78BFA"/>
      <!-- 軟管 -->
      <path d="M 140 130 Q 200 130 250 130" stroke="#5b21b6" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M 140 130 Q 200 130 250 130" stroke="#7C3AED" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="4 3"/>
      <!-- 吸塵器 -->
      <rect x="250" y="110" width="80" height="50" rx="8" fill="#1e293b"/>
      <text x="290" y="138" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">VAC</text>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">集塵連接是粉塵爆炸防範核心</text>
    </svg>`,
    fence: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="50" y="120" width="300" height="10" fill="#7C3AED"/>
      <rect x="50" y="80" width="300" height="40" fill="#5b21b6"/>
      <rect x="120" y="105" width="120" height="20" fill="#a16207"/>
      <text x="180" y="118" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">工件</text>
      <text x="200" y="100" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">FENCE 靠尺</text>
      <path d="M 180 130 L 180 90" stroke="#22c55e" stroke-width="2" stroke-dasharray="3 2"/>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">工件平貼靠尺才不會歪斜</text>
    </svg>`,
    start: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <circle cx="140" cy="110" r="40" fill="#9ca3af"/><circle cx="260" cy="110" r="40" fill="#9ca3af"/>
      <path d="M 140 70 L 260 70 L 260 78 L 140 78 Z" fill="#92400e"/>
      <path d="M 140 142 L 260 142 L 260 150 L 140 150 Z" fill="#92400e"/>
      <rect x="180" y="50" width="40" height="20" fill="#a16207"/>
      <line x1="200" y1="40" x2="200" y2="50" stroke="#22c55e" stroke-width="2" marker-end="url(#sars)"/>
      <defs><marker id="sars" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
      <text x="200" y="34" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">緩慢接觸</text>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">等砂帶穩定後再緩慢接觸工件</text>
    </svg>`,
    feed: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="100" width="280" height="20" fill="#92400e"/>
      <rect x="180" y="80" width="40" height="20" fill="#a16207"/>
      <line x1="140" y1="70" x2="180" y2="90" stroke="#22c55e" stroke-width="2.5" marker-end="url(#fars)"/>
      <line x1="220" y1="90" x2="260" y2="70" stroke="#22c55e" stroke-width="2.5" marker-end="url(#fars2)"/>
      <defs>
        <marker id="fars" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker>
        <marker id="fars2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker>
      </defs>
      <text x="200" y="60" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">持續橫向移動</text>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">不可固定一點，要持續移動</text>
    </svg>`,
    finish: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="100" width="280" height="20" fill="#92400e"/>
      <rect x="180" y="50" width="40" height="20" fill="#a16207"/>
      <text x="200" y="40" text-anchor="middle" font-size="10" fill="#0891b2" font-weight="700">先離開砂帶</text>
      <text x="300" y="160" font-size="22" fill="#22c55e">✓</text>
      <!-- 毛刷清理 -->
      <g transform="translate(120,150)">
        <rect x="-3" y="0" width="6" height="20" fill="#92400e"/>
        <path d="M -8 18 L 8 18 L 6 26 L -6 26 Z" fill="#1e293b"/>
        <line x1="-6" y1="26" x2="-7" y2="32" stroke="#1e293b"/>
        <line x1="0" y1="26" x2="0" y2="32" stroke="#1e293b"/>
        <line x1="6" y1="26" x2="7" y2="32" stroke="#1e293b"/>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">離開砂帶 → 停機 → 清潔 → 收工</text>
    </svg>`,
  };
  return anims[type] || '';
}

const PK = 'sander_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const nextBtn = document.getElementById('next-btn');
const seenSteps = new Set((loadP().module3_seen) || []);
let current = 0;

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item' + (i === 0 ? ' active' : '') + (seenSteps.has(i) ? ' seen' : '');
  item.innerHTML = `<div class="step-num">${i + 1}</div><div class="step-info"><h5>${s.title}</h5></div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  current = i;
  const s = STEPS[i];
  document.querySelectorAll('.step-item').forEach((el, k) => el.classList.toggle('active', k === i));
  stepDetailEl.innerHTML = `
    <span class="step-step">STEP ${i + 1} / ${STEPS.length}</span>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>
    ${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}
    ${s.warn ? `<div class="step-warn"><strong>⚠ 注意：</strong>${s.warn}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:18px">
      ${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}
      ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成全部步驟 ✓</span>'}
    </div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP();
    p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) {
      p.module3 = true;
      nextBtn.style.opacity = 1;
      nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 步驟全部完成！', 'good');
    }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;

if (typeof SequencePuzzle === 'function') {
  SequencePuzzle({
    mountId: 'seq-puzzle',
    items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })),
    onPass: () => {
      const p = loadP(); p.module3_puzzle = true; saveP(p);
      showToast('🧩 排序測驗通過！', 'good');
    }
  });
}

/* ── 四種砂磨機操作模擬器 ──────────────────────────────── */
;(function () {
  // ── 共用工具 ──
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── 外殼注入 ──
  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'machine-sim-anchor';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🎮 四種砂磨機操作模擬</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:14px">選擇機型，依照提示完成操作模擬，體會各機型的操作手感與安全要點。</p>
    <div id="msim-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <button class="msim-tab" data-tab="belt"    style="padding:8px 16px;border-radius:8px;border:2px solid #7C3AED;background:#7C3AED;color:#fff;font-weight:700;font-size:13px;cursor:pointer">帶式砂磨機</button>
      <button class="msim-tab" data-tab="disc"    style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;background:#fff;color:#64748b;font-weight:700;font-size:13px;cursor:pointer">盤式砂磨機</button>
      <button class="msim-tab" data-tab="orbital" style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;background:#fff;color:#64748b;font-weight:700;font-size:13px;cursor:pointer">隨機軌道式</button>
      <button class="msim-tab" data-tab="spindle" style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;background:#fff;color:#64748b;font-weight:700;font-size:13px;cursor:pointer">主軸/鼓式</button>
    </div>
    <div id="msim-content"></div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  // 從 module1 機型圖鑑點「操作模擬 →」跳轉時，自動滾動到本區塊
  if (window.location.hash === '#machine-sim-anchor') {
    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }

  const tabColors = { belt:'#7C3AED', disc:'#dc2626', orbital:'#059669', spindle:'#b45309' };
  const tabs = document.querySelectorAll('.msim-tab');
  let activeTab = 'belt';
  let orbitalRAF = null;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      if (orbitalRAF) { cancelAnimationFrame(orbitalRAF); orbitalRAF = null; }
      activeTab = btn.dataset.tab;
      tabs.forEach(b => {
        const c = tabColors[b.dataset.tab];
        const on = b.dataset.tab === activeTab;
        b.style.background = on ? c : '#fff';
        b.style.color = on ? '#fff' : '#64748b';
        b.style.borderColor = on ? c : '#e2e8f0';
      });
      renderTab(activeTab);
      if (typeof SoundFX !== 'undefined') SoundFX.click();
    });
  });

  function renderTab(t) {
    const el = document.getElementById('msim-content');
    if (t === 'belt')    buildBelt(el);
    if (t === 'disc')    buildDisc(el);
    if (t === 'orbital') buildOrbital(el);
    if (t === 'spindle') buildSpindle(el);
  }

  // ══════════════════════════════════════════════════════
  // TAB 1：帶式砂磨機
  // ══════════════════════════════════════════════════════
  function buildBelt(el) {
    el.innerHTML = `
      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">
        <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">⚠ 砂帶方向箭頭必須對齊滾輪轉向</span>
        <span style="background:#f97316;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">⚠ 不可停留同一點 &gt; 2 秒</span>
        <span style="background:#0891b2;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">小工件必須用推板</span>
      </div>
      <canvas id="belt-canvas" width="520" height="280" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block"></canvas>
      <div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap">
        <button id="belt-slow" style="padding:8px 18px;border-radius:8px;border:2px solid #7C3AED;color:#7C3AED;background:#fff;font-weight:700;font-size:14px;cursor:pointer">← 減速</button>
        <div style="flex:1;text-align:center;font-size:13px;color:#374151">進料速度：<strong id="belt-speed-label">正常</strong></div>
        <button id="belt-fast" style="padding:8px 18px;border-radius:8px;border:2px solid #7C3AED;color:#7C3AED;background:#fff;font-weight:700;font-size:14px;cursor:pointer">加速 →</button>
        <button id="belt-start" style="padding:8px 20px;border-radius:8px;border:none;background:#7C3AED;color:#fff;font-weight:700;font-size:14px;cursor:pointer">開始磨削</button>
        <button id="belt-reset" style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;color:#64748b;background:#fff;font-weight:700;font-size:13px;cursor:pointer">重置</button>
      </div>
      <div id="belt-result" style="margin-top:10px"></div>
    `;
    const canvas = document.getElementById('belt-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let speed = 1.2; // 0.3–3.0
    let beltOffset = 0;
    let workX = W - 20;
    let heat = 0;
    let stage = 'idle'; // idle | running | done_good | done_burn | done_rough
    let dustP = [];
    let rafId = null;
    let burnAlpha = 0;
    let bumpAnim = 0;

    function getSpeedLabel() {
      if (speed < 0.8) return '太慢（燒焦風險）';
      if (speed > 2.0) return '太快（表面不均）';
      return '正常 ✓';
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // 背景
      ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, W, H);
      // 地板
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, 220, W, 60);
      // 立柱
      ctx.fillStyle = '#374151'; ctx.fillRect(30, 40, 20, 200);
      // 機台底座
      rr(ctx, 20, 220, 480, 18, 4); ctx.fillStyle = '#1f2937'; ctx.fill();

      // 滾輪
      const R = 34;
      [100, 400].forEach(cx => {
        ctx.beginPath(); ctx.arc(cx, 130, R, 0, Math.PI * 2);
        ctx.fillStyle = '#6b7280'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, 130, R - 8, 0, Math.PI * 2);
        ctx.fillStyle = '#4b5563'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, 130, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#9ca3af'; ctx.fill();
      });

      // 砂帶（上/下）
      ctx.save();
      ctx.beginPath(); ctx.rect(100, 96, 300, 70); ctx.clip();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(100, 96, 300, 8);
      ctx.fillRect(100, 156, 300, 8);
      // 砂帶紋理
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
      for (let x = (beltOffset % 16) - 16; x < 300; x += 16) {
        ctx.beginPath(); ctx.moveTo(100 + x, 96); ctx.lineTo(100 + x + 8, 96); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(100 + x, 164); ctx.lineTo(100 + x + 8, 164); ctx.stroke();
      }
      ctx.restore();

      // 熱量指示條（右上）
      const hx = W - 70, hy = 30, hh = 140;
      rr(ctx, hx, hy, 24, hh, 4); ctx.fillStyle = '#e2e8f0'; ctx.fill();
      const fillH = Math.round(heat * hh);
      const hColor = heat < 0.5 ? '#22c55e' : heat < 0.8 ? '#f97316' : '#dc2626';
      rr(ctx, hx, hy + hh - fillH, 24, fillH, 4); ctx.fillStyle = hColor; ctx.fill();
      ctx.fillStyle = '#374151'; ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('熱量', hx + 12, hy + hh + 14);
      ctx.fillText(Math.round(heat * 100) + '%', hx + 12, hy - 6);

      // 集塵管道
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(400, 130); ctx.lineTo(440, 100); ctx.lineTo(480, 100); ctx.stroke();
      ctx.fillStyle = '#f97316'; ctx.font = '9px Noto Sans TC,sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('集塵', 482, 103);

      // 工件
      if (workX < W) {
        const wW = 160, wH = 40;
        const wx = Math.min(workX, 420 - wW);
        // 燒焦效果
        ctx.fillStyle = '#a16207'; rr(ctx, wx, 158, wW, wH, 3); ctx.fill();
        if (burnAlpha > 0 && speed < 0.8) {
          ctx.fillStyle = `rgba(30,0,0,${Math.min(1, burnAlpha)})`;
          rr(ctx, wx + wW * 0.2, 158, wW * 0.6, wH, 3); ctx.fill();
        }
        if (speed > 2.0 && stage === 'running') {
          // 鋸齒紋
          ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
          for (let xi = wx; xi < wx + wW; xi += 8) {
            ctx.beginPath(); ctx.moveTo(xi, 158); ctx.lineTo(xi + 4, 162); ctx.lineTo(xi + 8, 158); ctx.stroke();
          }
        }
        // 工件紋路
        ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
        for (let yi = 163; yi < 163 + wH - 6; yi += 5) {
          ctx.beginPath(); ctx.moveTo(wx, yi); ctx.lineTo(wx + wW, yi); ctx.stroke();
        }
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
        rr(ctx, wx, 158, wW, wH, 3); ctx.stroke();
      }

      // 粉塵
      dustP.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,130,50,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.a -= 0.015;
        if (p.a <= 0) dustP.splice(i, 1);
      });

      // 狀態文字
      if (stage === 'idle') {
        ctx.fillStyle = '#64748b'; ctx.font = '14px Noto Sans TC,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('調整進料速度，然後按「開始磨削」', W / 2, 260);
      }
    }

    function tick() {
      if (stage !== 'running') return;
      beltOffset += 3;
      workX -= speed;
      heat = Math.max(0, Math.min(1, heat + (speed < 0.8 ? 0.008 : speed > 2.0 ? 0.002 : -0.004)));
      if (speed < 0.8) burnAlpha += 0.012;
      // 粉塵生成
      if (Math.random() < 0.3 + speed * 0.1) {
        dustP.push({ x: Math.max(100, Math.min(400, W - workX - 80)), y: 155,
          vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2 - 1,
          r: Math.random() * 2.5 + 0.5, a: 0.9 });
      }
      draw();
      if (workX < -30) {
        // 判定
        if (heat > 0.7 || burnAlpha > 0.6) endBelt('burn');
        else if (speed > 2.0) endBelt('rough');
        else endBelt('good');
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    function endBelt(result) {
      stage = 'done_' + result;
      const res = document.getElementById('belt-result');
      if (result === 'good') {
        res.innerHTML = `<div style="padding:12px 16px;background:#f0fdf4;border:2px solid #22c55e;border-radius:8px;color:#15803d;font-weight:700">✓ 進料速度正確！工件表面光滑，熱量控制良好。</div>`;
        if (typeof SoundFX !== 'undefined') SoundFX.win();
        const p = loadP(); p.module3_belt = true; saveP(p);
        showToast('🏅 帶式砂磨模擬通過！', 'good');
      } else if (result === 'burn') {
        res.innerHTML = `<div style="padding:12px 16px;background:#fef2f2;border:2px solid #dc2626;border-radius:8px;color:#b91c1c;font-weight:700">✗ 進料太慢！工件停留過久，熱量累積燒焦木材。加快移動速度！</div>`;
        if (typeof SoundFX !== 'undefined') SoundFX.error();
      } else {
        res.innerHTML = `<div style="padding:12px 16px;background:#fff7ed;border:2px solid #f97316;border-radius:8px;color:#c2410c;font-weight:700">✗ 進料太快！工件移動過快，表面產生不均勻鋸齒紋。放慢速度！</div>`;
        if (typeof SoundFX !== 'undefined') SoundFX.error();
      }
    }

    document.getElementById('belt-start').addEventListener('click', () => {
      if (stage === 'running') return;
      stage = 'running'; workX = W - 20; heat = 0; burnAlpha = 0; dustP = [];
      document.getElementById('belt-result').innerHTML = '';
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    });
    document.getElementById('belt-reset').addEventListener('click', () => {
      if (rafId) cancelAnimationFrame(rafId);
      stage = 'idle'; workX = W - 20; heat = 0; burnAlpha = 0; dustP = []; speed = 1.2;
      document.getElementById('belt-speed-label').textContent = getSpeedLabel();
      document.getElementById('belt-result').innerHTML = '';
      draw();
    });
    document.getElementById('belt-slow').addEventListener('click', () => {
      speed = Math.max(0.3, speed - 0.3);
      document.getElementById('belt-speed-label').textContent = getSpeedLabel();
    });
    document.getElementById('belt-fast').addEventListener('click', () => {
      speed = Math.min(3.0, speed + 0.3);
      document.getElementById('belt-speed-label').textContent = getSpeedLabel();
    });

    draw();
  }

  // ══════════════════════════════════════════════════════
  // TAB 2：盤式砂磨機
  // ══════════════════════════════════════════════════════
  function buildDisc(el) {
    el.innerHTML = `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">
        <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">⚠ 先空轉觀察旋轉方向，工件只能放在「向下旋轉」那一側！</span>
        <span style="background:#f97316;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">工件後緣必須平貼靠尺</span>
        <span style="background:#0891b2;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">小工件用推板</span>
      </div>
      <p style="font-size:13px;color:#374151;margin-bottom:8px">本模擬機型的向下旋轉側為右半邊。點擊砂盤的<strong style="color:#16a34a">右半邊（綠色，向下旋轉）</strong>或<strong style="color:#dc2626">左半邊（紅色，向上旋轉）</strong>放置工件，觀察結果。<br><span style="color:#b91c1c">實際機台的旋轉方向可能不同（多數逆時針機型的向下旋轉側為左半邊）——務必先空轉觀察，依教室機台實際方向為準。</span></p>
      <canvas id="disc-canvas" width="480" height="340" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block;cursor:pointer"></canvas>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button id="disc-reset" style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;color:#64748b;background:#fff;font-weight:700;font-size:13px;cursor:pointer">重置再試</button>
        <div id="disc-hint" style="flex:1;font-size:13px;color:#64748b;padding:8px 0">點擊砂盤任意半側放置工件 →</div>
      </div>
      <div id="disc-result" style="margin-top:10px"></div>
    `;
    const canvas = document.getElementById('disc-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = 170, R = 130;
    let discAngle = 0;
    let discStage = 'idle'; // idle | correct | wrong | done
    let workPiece = { x: 0, y: 0, vy: 0, alpha: 1, show: false, side: '' };
    let sparkP = [];
    let rafId2;

    function drawDisc() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H);

      // 工作台
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, H - 60, W, 60);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, H - 60, W, 2);

      // 靠尺
      ctx.fillStyle = '#7C3AED'; ctx.fillRect(CX - 4, CY + 10, 8, H - CY - 70);
      ctx.fillStyle = '#374151'; ctx.font = '10px Noto Sans TC,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('靠尺', CX, H - 48);

      // 砂盤
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(discAngle);
      // 底盤
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = '#374151'; ctx.fill();
      // 紋理放射線
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
      }
      ctx.restore();

      // 半側覆蓋（不旋轉）
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, R, -Math.PI / 2, Math.PI / 2); ctx.closePath();
      ctx.fillStyle = 'rgba(22,163,74,.25)'; ctx.fill();
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, R, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
      ctx.fillStyle = 'rgba(220,38,38,.25)'; ctx.fill();
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();

      // 中心螺絲
      ctx.beginPath(); ctx.arc(CX, CY, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#9ca3af'; ctx.fill();
      ctx.beginPath(); ctx.arc(CX, CY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1f2937'; ctx.fill();

      // 旋轉方向箭頭 + 標籤
      const arrowFn = (cx, cy, side) => {
        ctx.font = 'bold 11px Noto Sans TC,sans-serif'; ctx.textAlign = 'center';
        if (side === 'left') {
          ctx.fillStyle = '#dc2626';
          ctx.fillText('⬆ 向上旋轉', cx - R * 0.55, cy - R * 0.45);
          ctx.fillText('⚠ 禁止放工件', cx - R * 0.55, cy - R * 0.28);
        } else {
          ctx.fillStyle = '#16a34a';
          ctx.fillText('⬇ 向下旋轉', cx + R * 0.55, cy - R * 0.45);
          ctx.fillText('✓ 安全側', cx + R * 0.55, cy - R * 0.28);
        }
      };
      arrowFn(CX, CY, 'left');
      arrowFn(CX, CY, 'right');

      // 工件
      if (workPiece.show) {
        ctx.globalAlpha = Math.max(0, workPiece.alpha);
        ctx.fillStyle = '#a16207';
        rr(ctx, workPiece.x, workPiece.y, 60, 24, 4); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
        rr(ctx, workPiece.x, workPiece.y, 60, 24, 4); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 火花
      sparkP.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250,204,21,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.a -= 0.04;
        if (p.a <= 0) sparkP.splice(i, 1);
      });

      if (discStage === 'idle') {
        ctx.fillStyle = '#64748b'; ctx.font = '13px Noto Sans TC,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('← 點擊左側或右側放置工件 →', CX, H - 15);
      }
    }

    function discLoop() {
      discAngle += 0.04;
      if (discStage === 'correct') {
        // 火花（正確：往右下噴）
        if (Math.random() < 0.5) sparkP.push({ x: CX + R * 0.5 + (Math.random() - .5) * 20, y: CY + 20, vx: Math.random() * 2, vy: Math.random() + 0.5, r: 2, a: 0.9 });
        if (sparkP.length > 30) sparkP.splice(0, 5);
      }
      if (discStage === 'wrong') {
        workPiece.y += workPiece.vy;
        workPiece.vy -= 1.2;
        workPiece.alpha -= 0.025;
        if (workPiece.alpha <= 0) { workPiece.show = false; discStage = 'done_wrong'; }
      }
      drawDisc();
      rafId2 = requestAnimationFrame(discLoop);
    }

    canvas.addEventListener('click', e => {
      if (discStage !== 'idle') return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);
      const dx = mx - CX, dy = my - CY;
      if (dx * dx + dy * dy > R * R) return;
      const side = dx >= 0 ? 'right' : 'left';
      workPiece.show = true;
      workPiece.alpha = 1;
      workPiece.x = side === 'right' ? CX + 30 : CX - 90;
      workPiece.y = CY + 10;
      workPiece.vy = 0;
      workPiece.side = side;
      const res = document.getElementById('disc-result');
      if (side === 'right') {
        discStage = 'correct';
        res.innerHTML = `<div style="padding:12px 16px;background:#f0fdf4;border:2px solid #22c55e;border-radius:8px;color:#15803d;font-weight:700">✓ 正確！工件放在向下旋轉側，被砂盤壓住並穩定磨削，火花朝下噴出。</div>`;
        if (typeof SoundFX !== 'undefined') SoundFX.win();
        const p = loadP(); p.module3_disc = true; saveP(p);
        showToast('🏅 盤式砂磨模擬通過！', 'good');
      } else {
        discStage = 'wrong';
        res.innerHTML = `<div style="padding:12px 16px;background:#fef2f2;border:2px solid #dc2626;border-radius:8px;color:#b91c1c;font-weight:700">✗ 危險！放在向上旋轉側的工件瞬間被砂盤「甩起」！這是最嚴重的盤式砂磨操作錯誤。</div>`;
        if (typeof SoundFX !== 'undefined') SoundFX.error();
      }
    });

    document.getElementById('disc-reset').addEventListener('click', () => {
      discStage = 'idle'; workPiece.show = false; sparkP = [];
      document.getElementById('disc-result').innerHTML = '';
      document.getElementById('disc-hint').textContent = '點擊砂盤任意半側放置工件 →';
    });

    discLoop();
    if (orbitalRAF === null) orbitalRAF = rafId2; // 讓外層能 cancel
  }

  // ══════════════════════════════════════════════════════
  // TAB 3：隨機軌道式砂磨機
  // ══════════════════════════════════════════════════════
  function buildOrbital(el) {
    el.innerHTML = `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">
        <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">⚠ 靜止 &gt; 2 秒即燒焦！</span>
        <span style="background:#059669;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">在木材表面持續移動砂盤</span>
        <span style="background:#0891b2;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">雙手輕握，不需要施力下壓</span>
      </div>
      <p style="font-size:13px;color:#374151;margin-bottom:8px">在木板上拖曳移動圓形砂盤（滑鼠/觸控），均勻覆蓋整個表面。靜止超過 2 秒會開始燒焦！</p>
      <canvas id="orb-canvas" width="480" height="280" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block;cursor:crosshair"></canvas>
      <div style="margin-top:8px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <div style="font-size:13px;color:#374151">覆蓋率：<strong id="orb-coverage">0%</strong></div>
        <div style="flex:1;height:10px;background:#e2e8f0;border-radius:5px"><div id="orb-bar" style="height:10px;background:#059669;border-radius:5px;width:0;transition:width .3s"></div></div>
        <button id="orb-reset" style="padding:7px 14px;border-radius:8px;border:2px solid #e2e8f0;color:#64748b;background:#fff;font-weight:700;font-size:13px;cursor:pointer">重置</button>
      </div>
      <div id="orb-result" style="margin-top:10px"></div>
    `;
    const canvas = document.getElementById('orb-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const BOARD_X = 40, BOARD_Y = 30, BOARD_W = W - 80, BOARD_H = H - 60;
    const PAD_R = 40;

    // 覆蓋 bitmap
    const CELL = 10;
    const COLS = Math.ceil(BOARD_W / CELL), ROWS = Math.ceil(BOARD_H / CELL);
    const covered = new Uint8Array(COLS * ROWS);
    const burned = new Uint8Array(COLS * ROWS); // 0=正常 1=燒焦
    let sander = { x: -200, y: -200 };
    let stillTimer = 0;
    let heatMap = new Float32Array(COLS * ROWS);
    let orbAngle = 0;
    let orbOffset = { x: 0, y: 0 };
    let active = false;
    let done = false;

    function cellIdx(px, py) {
      const cx = Math.floor((px - BOARD_X) / CELL);
      const cy = Math.floor((py - BOARD_Y) / CELL);
      if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return -1;
      return cy * COLS + cx;
    }

    function coverUnder(x, y) {
      for (let dy = -PAD_R; dy <= PAD_R; dy += CELL) {
        for (let dx = -PAD_R; dx <= PAD_R; dx += CELL) {
          if (dx * dx + dy * dy > PAD_R * PAD_R) continue;
          const idx = cellIdx(x + dx, y + dy);
          if (idx < 0) continue;
          covered[idx] = 1;
          heatMap[idx] = Math.min(1, heatMap[idx] + 0.03);
          if (heatMap[idx] > 0.85) burned[idx] = 1;
        }
      }
    }

    function coolDown() {
      for (let i = 0; i < heatMap.length; i++) {
        heatMap[i] = Math.max(0, heatMap[i] - 0.002);
      }
    }

    function calcCoverage() {
      let n = 0;
      const total = covered.reduce((s, v) => s + 1, 0); // all cells
      const cov = covered.reduce((s, v) => s + v, 0);
      return Math.round(cov / total * 100);
    }

    function hasBurn() { return burned.some(v => v > 0); }

    function drawBoard() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, W, H);
      // 木板底色
      ctx.fillStyle = '#a16207';
      rr(ctx, BOARD_X, BOARD_Y, BOARD_W, BOARD_H, 6); ctx.fill();
      // 繪製覆蓋和熱力
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c;
          const px = BOARD_X + c * CELL, py = BOARD_Y + r * CELL;
          if (burned[idx]) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(px, py, CELL, CELL);
          } else if (covered[idx]) {
            const light = Math.min(1, covered[idx] * 0.6 + 0.3);
            const h = Math.round(heatMap[idx] * 255);
            ctx.fillStyle = `rgba(${100 + h},${70},0,${light * 0.55})`;
            ctx.fillRect(px, py, CELL, CELL);
          }
        }
      }
      // 木板邊框
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2;
      rr(ctx, BOARD_X, BOARD_Y, BOARD_W, BOARD_H, 6); ctx.stroke();
      // 砂盤（軌道圖示）
      if (sander.x > 0) {
        orbAngle += 0.15;
        orbOffset.x = Math.cos(orbAngle) * 12;
        orbOffset.y = Math.sin(orbAngle) * 8;
        const sx = sander.x + orbOffset.x, sy = sander.y + orbOffset.y;
        ctx.beginPath(); ctx.arc(sx, sy, PAD_R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124,58,237,.25)'; ctx.fill();
        ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 2.5; ctx.stroke();
        // 集塵孔
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath(); ctx.arc(sx + Math.cos(a + orbAngle) * (PAD_R * 0.55), sy + Math.sin(a + orbAngle) * (PAD_R * 0.55), 3, 0, Math.PI * 2);
          ctx.fillStyle = '#7C3AED'; ctx.fill();
        }
        // 靜止警告
        if (stillTimer > 60) {
          const heat = Math.min(1, (stillTimer - 60) / 90);
          ctx.beginPath(); ctx.arc(sx, sy, PAD_R + 6 + heat * 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220,38,38,${heat * 0.8})`; ctx.lineWidth = 3; ctx.stroke();
        }
      }
      // 標籤
      ctx.fillStyle = '#64748b'; ctx.font = '11px Noto Sans TC,sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('木板表面（移動砂盤均勻覆蓋）', BOARD_X + 6, BOARD_Y + 15);
    }

    function orbLoop() {
      if (active && !done) {
        stillTimer++;
        if (stillTimer > 150) { // >2.5秒靜止 → 燒焦
          coverUnder(sander.x, sander.y);
        }
        coolDown();
      }
      drawBoard();
      const cov = calcCoverage();
      document.getElementById('orb-coverage').textContent = cov + '%';
      document.getElementById('orb-bar').style.width = cov + '%';
      if (!done && cov >= 75 && active) {
        done = true;
        const burnOk = !hasBurn();
        const res = document.getElementById('orb-result');
        if (burnOk) {
          res.innerHTML = `<div style="padding:12px 16px;background:#f0fdf4;border:2px solid #22c55e;border-radius:8px;color:#15803d;font-weight:700">✓ 覆蓋率 ${cov}%，無燒焦！隨機軌道式砂磨機操作通過。</div>`;
          if (typeof SoundFX !== 'undefined') SoundFX.win();
          const p = loadP(); p.module3_orbital = true; saveP(p);
          showToast('🏅 隨機軌道式模擬通過！', 'good');
        } else {
          res.innerHTML = `<div style="padding:12px 16px;background:#fff7ed;border:2px solid #f97316;border-radius:8px;color:#c2410c;font-weight:700">⚠ 覆蓋率 ${cov}%，但有燒焦點（黑色區域）。靜止過久造成。請重置再試！</div>`;
          if (typeof SoundFX !== 'undefined') SoundFX.error();
        }
      }
      orbitalRAF = requestAnimationFrame(orbLoop);
    }

    function moveHandler(e) {
      if (done) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      let cx, cy;
      if (e.touches) { cx = (e.touches[0].clientX - rect.left) * scaleX; cy = (e.touches[0].clientY - rect.top) * scaleY; }
      else { cx = (e.clientX - rect.left) * scaleX; cy = (e.clientY - rect.top) * scaleY; }
      if (cx !== sander.x || cy !== sander.y) { stillTimer = 0; active = true; }
      sander.x = cx; sander.y = cy;
      coverUnder(cx, cy);
    }

    canvas.addEventListener('pointermove', moveHandler);
    canvas.addEventListener('touchmove', e => { e.preventDefault(); moveHandler(e); }, { passive: false });

    document.getElementById('orb-reset').addEventListener('click', () => {
      covered.fill(0); burned.fill(0); heatMap.fill(0);
      sander = { x: -200, y: -200 };
      stillTimer = 0; active = false; done = false;
      document.getElementById('orb-coverage').textContent = '0%';
      document.getElementById('orb-bar').style.width = '0';
      document.getElementById('orb-result').innerHTML = '';
    });

    orbLoop();
  }

  // ══════════════════════════════════════════════════════
  // TAB 4：主軸/鼓式砂磨機
  // ══════════════════════════════════════════════════════
  function buildSpindle(el) {
    const spSteps = [
      {
        title: '步驟 1 ／ 選擇砂鼓直徑',
        svg: `<svg viewBox="0 0 380 200" style="width:100%;max-width:380px">
          <rect x="40" y="40" width="300" height="130" rx="6" fill="#f1f5f9"/>
          <ellipse cx="150" cy="105" rx="30" ry="80" fill="#9ca3af" stroke="#6b7280" stroke-width="2"/>
          <ellipse cx="150" cy="105" rx="22" ry="72" fill="#6b7280"/>
          <path d="M 200 50 Q 260 50 260 105 Q 260 160 200 160" fill="none" stroke="#a16207" stroke-width="12" stroke-linecap="round"/>
          <text x="235" y="108" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">工件內弧</text>
          <line x1="150" y1="25" x2="150" y2="45" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2"/>
          <line x1="200" y1="25" x2="200" y2="48" stroke="#a16207" stroke-width="2" stroke-dasharray="3 2"/>
          <line x1="150" y1="25" x2="200" y2="25" stroke="#64748b" stroke-width="1.5"/>
          <text x="175" y="20" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">砂鼓 &lt; 工件內弧</text>
          <text x="150" y="195" text-anchor="middle" font-size="11" fill="#374151" font-family="Noto Sans TC">砂鼓直徑必須略小於工件內弧直徑</text>
        </svg>`,
        tip: '如果砂鼓太大放不進工件內弧，更換較小尺寸的砂鼓套（sleeve）。砂鼓組通常附多個直徑。',
        warn: '砂鼓太小（接觸面不夠）或太大（卡住）都無法有效磨削。'
      },
      {
        title: '步驟 2 ／ 工件弧面接觸砂鼓',
        svg: `<svg viewBox="0 0 380 200" style="width:100%;max-width:380px">
          <rect x="20" y="20" width="340" height="160" rx="6" fill="#f1f5f9"/>
          <ellipse cx="190" cy="100" rx="28" ry="76" fill="#9ca3af" stroke="#6b7280" stroke-width="2"/>
          <ellipse cx="190" cy="100" rx="20" ry="68" fill="#6b7280"/>
          <!-- 工件從右進入 -->
          <path d="M 250 40 Q 320 40 320 100 Q 320 160 250 160" fill="none" stroke="#a16207" stroke-width="14" stroke-linecap="round"/>
          <!-- 箭頭（從右向左） -->
          <line x1="310" y1="100" x2="240" y2="100" stroke="#22c55e" stroke-width="3" marker-end="url(#spArr)"/>
          <defs><marker id="spArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
          <text x="280" y="88" font-size="10" fill="#22c55e" font-weight="700" text-anchor="middle">由右向左進料</text>
          <text x="190" y="190" text-anchor="middle" font-size="11" fill="#374151" font-family="Noto Sans TC">工件弧面輕觸砂鼓，由右向左均勻移動</text>
        </svg>`,
        tip: '進料方向應與砂鼓旋轉方向相逆，砂鼓才不會「咬住」工件造成突然扯入。',
        warn: '不可以用力把工件壓向砂鼓——輕觸即可，讓砂鼓自己切削。'
      },
      {
        title: '步驟 3 ／ 持續移動，禁止靜止',
        svg: `<svg viewBox="0 0 380 200" style="width:100%;max-width:380px">
          <rect x="20" y="20" width="340" height="160" rx="6" fill="#fef2f2"/>
          <ellipse cx="190" cy="100" rx="28" ry="76" fill="#9ca3af" stroke="#6b7280" stroke-width="2"/>
          <ellipse cx="190" cy="100" rx="20" ry="68" fill="#6b7280"/>
          <!-- 停止的工件 -->
          <path d="M 240 50 Q 300 50 300 100 Q 300 160 240 160" fill="none" stroke="#a16207" stroke-width="14" stroke-linecap="round"/>
          <!-- X 符號 + 燒焦 -->
          <circle cx="220" cy="100" r="22" fill="rgba(220,38,38,.15)" stroke="#dc2626" stroke-width="2"/>
          <line x1="208" y1="88" x2="232" y2="112" stroke="#dc2626" stroke-width="3"/>
          <line x1="232" y1="88" x2="208" y2="112" stroke="#dc2626" stroke-width="3"/>
          <!-- 焦黑點 -->
          <ellipse cx="218" cy="100" rx="6" ry="14" fill="rgba(0,0,0,.6)"/>
          <text x="190" y="190" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">靜止超過 2 秒 → 燒焦！</text>
        </svg>`,
        tip: '每次磨完一段弧面後，移開工件休息 3–5 秒讓砂鼓散熱，再繼續。',
        warn: '主軸砂鼓轉速高、接觸面積小，靜止燒焦比帶式砂磨更快。'
      },
      {
        title: '步驟 4 ／ 離開砂鼓再停機',
        svg: `<svg viewBox="0 0 380 200" style="width:100%;max-width:380px">
          <rect x="20" y="20" width="340" height="160" rx="6" fill="#f0fdf4"/>
          <ellipse cx="150" cy="100" rx="28" ry="76" fill="#9ca3af" stroke="#6b7280" stroke-width="2"/>
          <ellipse cx="150" cy="100" rx="20" ry="68" fill="#6b7280"/>
          <!-- 工件已移開 -->
          <path d="M 240 50 Q 300 50 300 100 Q 300 160 240 160" fill="none" stroke="#a16207" stroke-width="14" stroke-linecap="round" opacity=".4"/>
          <!-- 箭頭離開 -->
          <line x1="215" y1="100" x2="275" y2="100" stroke="#22c55e" stroke-width="3" marker-end="url(#spArr2)"/>
          <defs><marker id="spArr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
          <text x="245" y="88" font-size="10" fill="#22c55e" font-weight="700" text-anchor="middle">先移開工件</text>
          <!-- 電源按鈕 -->
          <circle cx="330" cy="90" r="20" fill="#dc2626"/>
          <text x="330" y="95" text-anchor="middle" font-size="14" fill="#fff">⏻</text>
          <text x="330" y="118" text-anchor="middle" font-size="9" fill="#374151">再停機</text>
          <text x="190" y="190" text-anchor="middle" font-size="11" fill="#15803d" font-weight="700" font-family="Noto Sans TC">工件先移開 → 再按停機 → 等停止 → 清潔</text>
        </svg>`,
        tip: '砂鼓慣性轉動期間不可觸摸，等完全靜止後才能換砂鼓套或清潔。',
        warn: null
      }
    ];

    const spQuiz = [
      { q: '砂鼓直徑應比工件內弧直徑...', opts: ['大一些（壓入弧面）', '小一些（能深入弧面）', '完全相同'], correct: 1, explain: '砂鼓必須略小於工件內弧。太大放不進去，太小接觸面不足效率差。' },
      { q: '操作主軸式砂磨機時，工件應該...', opts: ['固定在砂鼓上不動（接觸穩定）', '持續沿弧面移動，不可停留超過 2 秒', '快速前後往返，靠速度散熱'], correct: 1, explain: '必須持續移動。靜止超過 2 秒摩擦熱無法散去，立即燒焦木材。' },
    ];

    let spStep = 0;
    let spQuizIdx = 0;
    let spQuizAnswered = 0;
    let spQuizCorrect = 0;
    let spQuizDone = false;

    function renderSpStep() {
      const s = spSteps[spStep];
      el.querySelector('#sp-step-title').textContent = s.title;
      el.querySelector('#sp-step-svg').innerHTML = s.svg;
      el.querySelector('#sp-step-tip').textContent = s.tip;
      el.querySelector('#sp-step-warn').innerHTML = s.warn ? `<div style="padding:8px 12px;background:#fef2f2;border-left:3px solid #dc2626;border-radius:4px;font-size:12px;color:#b91c1c"><strong>⚠ 注意：</strong>${s.warn}</div>` : '';
      el.querySelector('#sp-prev').disabled = spStep === 0;
      el.querySelector('#sp-next').textContent = spStep === spSteps.length - 1 ? '進入測驗 →' : '下一步 →';
      el.querySelector('#sp-step-num').textContent = `${spStep + 1} / ${spSteps.length}`;
    }

    function renderSpQuiz() {
      const qEl = el.querySelector('#sp-quiz-area');
      if (spQuizIdx >= spQuiz.length) {
        qEl.innerHTML = spQuizDone ? '' : '';
        return;
      }
      const q = spQuiz[spQuizIdx];
      qEl.innerHTML = `
        <p style="font-size:14px;color:#1e293b;font-weight:600;margin-bottom:10px">測驗 ${spQuizIdx + 1}／2：${q.q}</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${q.opts.map((o, i) => `<button class="sp-ans" data-idx="${i}" style="padding:9px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer;text-align:left">
            <strong style="color:#475569">${String.fromCharCode(65 + i)}.</strong> ${o}
          </button>`).join('')}
        </div>
        <div id="sp-q-fb" style="margin-top:8px"></div>
      `;
      qEl.querySelectorAll('.sp-ans').forEach(btn => {
        btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#f1f5f9'; });
        btn.addEventListener('mouseleave', () => { if (!btn.disabled && !btn.classList.contains('sp-chosen')) btn.style.background = '#f8fafc'; });
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          const correct = idx === q.correct;
          qEl.querySelectorAll('.sp-ans').forEach((b, k) => {
            b.disabled = true;
            if (k === q.correct) { b.style.background = '#dcfce7'; b.style.borderColor = '#16a34a'; }
            if (b === btn && !correct) { b.style.background = '#fee2e2'; b.style.borderColor = '#dc2626'; }
          });
          const fb = qEl.querySelector('#sp-q-fb');
          fb.innerHTML = `<div style="padding:8px 12px;border-radius:6px;font-size:13px;line-height:1.6;${correct ? 'background:#f0fdf4;color:#15803d' : 'background:#fff7ed;color:#9a3412'}">
            ${correct ? '✓ 正確！' : '✗ 不對。'} ${q.explain}
          </div>`;
          if (correct) { spQuizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
          else if (typeof SoundFX !== 'undefined') SoundFX.error();
          spQuizAnswered++;
          setTimeout(() => {
            spQuizIdx++;
            if (spQuizIdx >= spQuiz.length) {
              spQuizDone = true;
              const pass = spQuizCorrect === spQuiz.length;
              qEl.innerHTML = `<div style="padding:14px 18px;border-radius:10px;text-align:center;${pass ? 'background:#f0fdf4;border:2px solid #22c55e;color:#15803d' : 'background:#fff7ed;border:2px solid #f97316;color:#9a3412'}">
                ${pass ? '🏆 主軸砂磨測驗通過！' : '📖 再複習一次步驟再挑戰！'} <strong>${spQuizCorrect} / ${spQuiz.length}</strong>
              </div>`;
              if (pass) {
                if (typeof SoundFX !== 'undefined') SoundFX.win();
                const p = loadP(); p.module3_spindle = true; saveP(p);
                showToast('🏅 主軸砂磨模擬通過！', 'good');
              }
            } else renderSpQuiz();
          }, 1200);
        });
      });
    }

    el.innerHTML = `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">
        <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">⚠ 靜止即燒焦</span>
        <span style="background:#b45309;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">砂鼓直徑 &lt; 工件內弧</span>
        <span style="background:#0891b2;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">由右向左進料</span>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 id="sp-step-title" style="margin:0;font-size:15px;color:#374151"></h4>
          <span id="sp-step-num" style="font-size:12px;color:#94a3b8"></span>
        </div>
        <div id="sp-step-svg" style="text-align:center;margin-bottom:10px"></div>
        <div style="padding:8px 12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:4px;font-size:12px;color:#15803d;margin-bottom:6px"><strong>💡 </strong><span id="sp-step-tip"></span></div>
        <div id="sp-step-warn"></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button id="sp-prev" style="padding:8px 16px;border-radius:8px;border:2px solid #e2e8f0;color:#64748b;background:#fff;font-weight:700;cursor:pointer">← 上一步</button>
          <button id="sp-next" style="padding:8px 20px;border-radius:8px;border:none;background:#b45309;color:#fff;font-weight:700;cursor:pointer">下一步 →</button>
        </div>
      </div>
      <div id="sp-quiz-section" style="display:none;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <h4 style="margin:0 0 12px;color:#374151">🎯 操作測驗</h4>
        <div id="sp-quiz-area"></div>
      </div>
    `;

    el.querySelector('#sp-prev').addEventListener('click', () => { if (spStep > 0) { spStep--; renderSpStep(); } });
    el.querySelector('#sp-next').addEventListener('click', () => {
      if (spStep < spSteps.length - 1) { spStep++; renderSpStep(); }
      else {
        el.querySelector('#sp-quiz-section').style.display = 'block';
        el.querySelector('#sp-quiz-section').scrollIntoView({ behavior:'smooth', block:'nearest' });
        renderSpQuiz();
      }
    });

    renderSpStep();
  }

  // 初始顯示帶式
  renderTab('belt');
})();
