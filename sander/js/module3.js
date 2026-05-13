// 砂磨機 模組 3：操作流程
const STEPS = [
  { title: '穿戴護具', desc: '護目鏡（防屑彈飛）、N95 等級口罩（防超細粉塵）。長髮綁起、寬鬆袖口塞好。\n⚠ 禁戴布手套——同所有電動機具。', tip: '砂磨粉塵粒徑可達 PM2.5 等級，戴一般紗布口罩擋不住。要用 N95 或工業級防塵口罩。', warn: '木屑粉吸入會引起木工肺（hypersensitivity pneumonitis）。', anim: 'ppe' },
  { title: '選擇砂帶 / 砂盤粒度', desc: '依工件狀態選粒度：\n• 60–80 號：粗磨、去料快\n• 120 號：中磨\n• 180–240 號：細磨\n• 320 號以上：精修拋光\n\n通則：循序漸進，不能跳級（80 → 直接 240 號會留下深紋）。', tip: '油漆前磨到 180–240 號表面就足夠；上漆後磨 320 號去毛邊。', warn: null, anim: 'grit' },
  { title: '檢查砂帶 / 砂盤狀態', desc: '裝砂帶前確認：\n• 砂帶內側「箭頭方向」對齊滾輪轉向\n• 砂帶無裂痕、無脫粒\n• 張力適當（按下中央能下壓 5mm）\n• 砂盤平整、無凹陷', tip: '砂帶方向錯誤是新手最常見錯誤——裝完先慢速空轉看會不會偏移。', warn: '砂帶有裂痕一定要換新，繼續用會在運轉中斷裂飛出。', anim: 'belt-check' },
  { title: '接上集塵', desc: '把集塵口連接到工坊吸塵器或集塵桶。確認連接緊密、軟管沒摺彎、集塵桶尚有容量。\n⚠ 這一步不可省略——粉塵爆炸與木工肺都由此防範。', tip: '集塵桶滿 70% 就要清空，太滿會降低吸力。', warn: '沒接集塵不可以使用砂磨機。', anim: 'dust' },
  { title: '工件就位、用靠尺支撐', desc: '把工件放上工作面，後方平貼「靠尺」（fence）。靠尺可調 0°/45°/90° 做斜角修整。小工件（< 5cm）用木夾或推板（push block）固定，不可徒手捏。', tip: '盤式砂磨記得：工件只能放在「砂盤向下旋轉」那一側，通常是右半邊。', warn: '小工件徒手捏是擦傷事故主因。', anim: 'fence' },
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
