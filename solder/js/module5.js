// 焊接平台 模組 5：焊點品質鑑定 + 錯誤圖鑑
const JOINT_TYPES = [
  {
    id: 'good',
    name: '✓ 完美焊點',
    quality: 'good',
    desc: '表面光亮、形狀像火山錐、覆蓋整個銅環。錫量飽滿不過量，與元件腳和銅環無縫接合。',
    cause: '溫度適中（350°C 左右）+ 加熱時間 1.5 秒 + 適量送錫 + 烙鐵停留 0.5 秒移開。',
    fix: '這就是目標！繼續維持。',
  },
  {
    id: 'cold',
    name: '✗ 冷焊（虛焊）',
    quality: 'bad',
    desc: '表面顆粒狀、霧霧的不光亮。焊錫沒有真正「潤濕」銅環，輕碰就脫落。',
    cause: '加熱時間不足、溫度太低、銅環有氧化層、焊錫凝固前移動了元件。',
    fix: '用吸錫器或銅辮子吸掉 → 清潔銅環 → 重新焊接，這次要等加熱 1.5 秒以上再送錫。',
  },
  {
    id: 'bridge',
    name: '✗ 連錫（短路橋）',
    quality: 'bad',
    desc: '兩個或多個焊點被錫連在一起，造成電路短路。',
    cause: '送錫量太多、焊點間距太近沒分開焊、烙鐵滑移碰到旁邊接點。',
    fix: '用吸錫器吸掉多餘錫 → 或者用乾淨烙鐵頭把錫帶走 → 必要時用銅辮子。',
  },
  {
    id: 'over',
    name: '✗ 過量錫',
    quality: 'bad',
    desc: '焊點變成大圓球，看不到下方的元件腳形狀。容易遮住標示、影響後續維修。',
    cause: '送錫絲時間太久、烙鐵停留過久。',
    fix: '加熱焊點熔化錫 → 用吸錫器吸走多餘部分 → 再次送少量錫補回。',
  },
  {
    id: 'insufficient',
    name: '✗ 缺錫',
    quality: 'bad',
    desc: '焊錫量不夠，看到銅環露出。元件雖然固定，但接觸面積太小，受震動容易斷。',
    cause: '送錫絲太短就抽走、銅環被氧化拒錫。',
    fix: '重新加熱該點 → 補送少量錫直到飽滿成錐形。',
  },
  {
    id: 'burnt',
    name: '✗ 燒焦 PCB',
    quality: 'bad',
    desc: '焊點周圍 PCB 顏色變深褐或焦黑，銅環可能起皮翹起。',
    cause: '烙鐵停留時間超過 4 秒、溫度設定過高（> 400°C）。',
    fix: '已燒焦的 PCB 銅箔可能永久損壞，需要評估是否重做整塊板。下次注意「停留 1–2 秒」。',
  },
  {
    id: 'ball',
    name: '✗ 錫珠飛散',
    quality: 'bad',
    desc: '焊點周圍有小顆錫珠散落。可能造成短路或滾入電路其他位置。',
    cause: '助焊劑揮發時噴濺、溫度過高、海綿太濕讓烙鐵頭爆裂錫。',
    fix: '用毛刷或吸錫筆清除散落錫珠 → 檢查是否有黏在元件腳上的小錫珠 → 確認海綿不要太濕。',
  },
  {
    id: 'lifted',
    name: '✗ 元件浮起',
    quality: 'bad',
    desc: '元件本體沒貼緊 PCB，焊接後元件腳留長、歪斜。',
    cause: '焊接前沒按住元件、焊錫凝固前鬆手、元件腳太短沒對準孔位。',
    fix: '加熱焊點熔化錫 → 用鑷子壓住元件 → 等錫完全凝固再放開（約 5 秒）。',
  },
  {
    id: 'tilted',
    name: '✗ 潤濕不全（Partial Wetting）',
    quality: 'bad',
    desc: '焊錫只覆蓋銅環的一邊，潤濕角 > 90°（IPC-A-610 不接受等級）。雖然能通電但結構不穩。',
    cause: '加熱不夠均勻、單側送錫、銅環氧化、焊錫流動性不足。',
    fix: '加熱焊點熔化 → 補送少量焊錫並讓助焊劑活化 → 確保熱量均勻分布到整圈銅環，潤濕角降到 < 90°。',
  },
];

// 渲染圖鑑
const galleryEl = document.getElementById('joint-gallery');
JOINT_TYPES.forEach(j => {
  const card = document.createElement('div');
  card.className = 'error-card' + (j.quality === 'good' ? ' good' : '');
  card.innerHTML = `
    <div class="err-visual">${renderJointSVG(j.id)}</div>
    <span class="err-tag">${j.quality === 'good' ? '正確示範' : '常見錯誤'}</span>
    <h4>${j.name}</h4>
    <p>${j.desc}</p>
    <div style="font-size:12px;color:var(--text-muted);margin:8px 0;line-height:1.6">
      <strong style="color:#a72d2d">原因：</strong>${j.cause}
    </div>
    <div class="err-fix">
      <strong>修正方法：</strong>${j.fix}
    </div>
  `;
  galleryEl.appendChild(card);
});

function renderJointSVG(id) {
  const renderers = {
    good: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <defs>
          <linearGradient id="goodG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#f0f0f0"/>
            <stop offset=".5" stop-color="#a0a0a0"/>
            <stop offset="1" stop-color="#404040"/>
          </linearGradient>
        </defs>
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <ellipse cx="100" cy="78" rx="14" ry="9" fill="url(#goodG)" stroke="#404040" stroke-width=".8"/>
        <ellipse cx="96" cy="74" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
      </svg>`,
    cold: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <circle cx="100" cy="78" r="11" fill="#888"/>
        <circle cx="95" cy="74" r="1.2" fill="#444"/>
        <circle cx="103" cy="76" r="1" fill="#444"/>
        <circle cx="98" cy="80" r="1.3" fill="#444"/>
        <circle cx="105" cy="82" r="1" fill="#444"/>
        <circle cx="93" cy="80" r="1.1" fill="#444"/>
      </svg>`,
    bridge: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="80" cy="80" r="11" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <circle cx="120" cy="80" r="11" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="80" y1="20" x2="80" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <line x1="120" y1="20" x2="120" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <ellipse cx="100" cy="78" rx="32" ry="11" fill="#888" stroke="#404040" stroke-width=".8"/>
        <text x="100" y="115" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC,sans-serif">⚡短路</text>
      </svg>`,
    over: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <circle cx="100" cy="75" r="20" fill="#888" stroke="#404040" stroke-width=".8"/>
        <ellipse cx="93" cy="69" rx="5" ry="3" fill="rgba(255,255,255,.4)"/>
      </svg>`,
    insufficient: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <ellipse cx="100" cy="80" rx="6" ry="4" fill="#888"/>
      </svg>`,
    burnt: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="22" fill="#5a3a1a" opacity=".7"/>
        <circle cx="100" cy="80" r="14" fill="#1f1108" stroke="#0a0a0a" stroke-width="1"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <text x="100" y="115" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC,sans-serif">PCB 已損壞</text>
      </svg>`,
    ball: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <ellipse cx="100" cy="78" rx="11" ry="8" fill="#888"/>
        <!-- 散落錫珠 -->
        <circle cx="60" cy="100" r="3" fill="#888"/>
        <circle cx="75" cy="105" r="2" fill="#888"/>
        <circle cx="135" cy="100" r="2.5" fill="#888"/>
        <circle cx="150" cy="105" r="2" fill="#888"/>
        <circle cx="125" cy="92" r="1.5" fill="#888"/>
        <circle cx="175" cy="98" r="2" fill="#888"/>
      </svg>`,
    lifted: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="35" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <!-- 元件浮起、傾斜 -->
        <rect x="65" y="20" width="70" height="14" fill="#dc2626" transform="rotate(-8 100 27)"/>
        <ellipse cx="100" cy="78" rx="11" ry="6" fill="#888"/>
        <text x="100" y="115" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC,sans-serif">元件未貼板</text>
      </svg>`,
    tilted: () => `
      <svg viewBox="0 0 200 140" style="width:80%">
        <rect x="10" y="60" width="180" height="60" fill="#16a34a" rx="2"/>
        <circle cx="100" cy="80" r="14" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke="#9ca3af" stroke-width="3"/>
        <!-- 只覆蓋一邊 -->
        <path d="M 86 80 Q 92 70 100 78 L 100 86 L 86 86 Z" fill="#888" stroke="#404040" stroke-width=".8"/>
      </svg>`,
  };
  return renderers[id]?.() || '';
}

// === 判讀挑戰 ===
const QUIZ = [
  { id: 'good', q: '這個焊點屬於？' },
  { id: 'cold', q: '焊點表面顆粒霧面，這是？' },
  { id: 'bridge', q: '兩個焊點被錫連在一起，這是？' },
  { id: 'over', q: '焊錫變成大圓球，這是？' },
  { id: 'good', q: '錐形飽滿、表面光亮，這是？' },
  { id: 'burnt', q: 'PCB 焊點周圍焦黑，這是？' },
  { id: 'ball', q: '焊點周圍散落小錫珠，這是？' },
  { id: 'tilted', q: '焊錫只覆蓋銅環一邊、潤濕角 > 90°，這是？' },
  { id: 'insufficient', q: '焊錫太少、看到銅環露出，這是？' },
  { id: 'lifted', q: '元件本體歪斜、沒貼板，這是？' },
];

const QUIZ_OPTIONS_MAP = {};
JOINT_TYPES.forEach(j => { QUIZ_OPTIONS_MAP[j.id] = j.name.replace(/^[✓✗]\s*/, ''); });

const quizContainer = document.getElementById('quiz-container');
let quizScore = 0;
const quizAnswered = new Set();

QUIZ.forEach((q, i) => {
  // 取 4 個選項：1 正確 + 3 隨機錯誤
  const wrongIds = JOINT_TYPES.filter(j => j.id !== q.id).map(j => j.id);
  shuffle(wrongIds);
  const optionIds = [q.id, ...wrongIds.slice(0, 3)];
  shuffle(optionIds);

  const div = document.createElement('div');
  div.className = 'scenario';
  div.innerHTML = `
    <h4>Q${i + 1}. ${q.q}</h4>
    <div style="background:#0f1419;border-radius:8px;padding:14px;margin:12px 0;text-align:center">
      ${renderJointSVG(q.id)}
    </div>
    <div class="choice-grid" style="grid-template-columns:1fr 1fr">
      ${optionIds.map(id => `<button class="choice" data-q="${i}" data-id="${id}">${QUIZ_OPTIONS_MAP[id]}</button>`).join('')}
    </div>
    <div class="feedback-slot"></div>
  `;
  quizContainer.appendChild(div);
});

quizContainer.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => answerQuiz(btn));
});

function answerQuiz(btn) {
  const i = parseInt(btn.dataset.q);
  const id = btn.dataset.id;
  if (quizAnswered.has(i)) return;
  const correct = id === QUIZ[i].id;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.id === QUIZ[i].id) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  const correctName = QUIZ_OPTIONS_MAP[QUIZ[i].id];
  parent.querySelector('.feedback-slot').innerHTML =
    `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓ 答對！' : `✗ 不正確，正確答案是「${correctName}」`}</div>`;
  if (correct) {
    quizScore += 10;
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  quizAnswered.add(i);
  if (quizAnswered.size === QUIZ.length) showQuizResult();
}

function showQuizResult() {
  const result = document.getElementById('quiz-result');
  const stars = quizScore >= 90 ? 3 : quizScore >= 70 ? 2 : quizScore > 0 ? 1 : 0;
  if (typeof SoundFX !== 'undefined') {
    if (stars === 3) SoundFX.win();
    else if (stars > 0) SoundFX.star(stars);
  }
  result.innerHTML = `
    <div class="unlock-banner" style="margin-top:24px">
      <h3>判讀挑戰結束！</h3>
      <p>你答對 ${quizScore / 10} / ${QUIZ.length} 題　${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</p>
      <p style="margin-top:8px;font-size:14px;opacity:.92">最終分數：<strong style="font-size:22px">${quizScore}</strong> / 100</p>
    </div>
  `;

  const PROGRESS_KEY_S = 'solder_progress_v1';
  let p; try { p = JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || {}; } catch { p = {}; }
  p.module5 = true;
  p.module5_score = quizScore;
  localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p));
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// 互動：PCB 焊點找碴
// 給一張 PCB SVG，6 個焊點裡有 4 個有問題，找出來
// ============================================================
(function PCBHotspotHunt() {
  const root = document.getElementById('pcb-hunt');
  if (!root) return;

  // PCB SVG（綠色基板 + 6 個焊點，部分有問題）
  const pcbSVG = `
    <svg viewBox="0 0 600 320" style="width:100%;max-width:680px;display:block;margin:0 auto">
      <defs>
        <linearGradient id="pcbG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#22c55e"/>
          <stop offset="1" stop-color="#15803d"/>
        </linearGradient>
      </defs>
      <!-- PCB 基板 -->
      <rect x="20" y="20" width="560" height="280" rx="8" fill="url(#pcbG)" stroke="#14532d" stroke-width="2"/>
      <!-- 銅線軌跡 -->
      <g stroke="#fbbf24" stroke-width="2.5" fill="none" opacity=".75">
        <path d="M 100 100 L 300 100 L 300 200 L 500 200"/>
        <path d="M 100 200 L 200 200 L 200 100"/>
        <path d="M 400 100 L 400 200"/>
        <path d="M 500 100 L 500 200"/>
      </g>
      <!-- 元件本體（電阻、LED、IC）-->
      <g>
        <!-- IC -->
        <rect x="260" y="135" width="80" height="30" rx="3" fill="#0a0a0a" stroke="#374151"/>
        <text x="300" y="154" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="Inter">IC1</text>
        <!-- 電阻 -->
        <rect x="150" y="145" width="36" height="10" rx="2" fill="#e7c89a" stroke="#7c4a14"/>
        <rect x="158" y="145" width="2" height="10" fill="#dc2626"/>
        <rect x="163" y="145" width="2" height="10" fill="#dc2626"/>
        <rect x="170" y="145" width="2" height="10" fill="#92400e"/>
        <!-- LED -->
        <circle cx="450" cy="150" r="14" fill="#ef4444" opacity=".85" stroke="#7f1d1d"/>
        <ellipse cx="446" cy="146" rx="4" ry="3" fill="rgba(255,255,255,.5)"/>
      </g>
      <!-- 焊點 1：完美焊點（光亮錐形）✓ -->
      <g transform="translate(100,100)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse rx="11" ry="8" fill="#c0c0c0"/>
        <ellipse cx="-3" cy="-3" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
        <circle r="4" fill="#0a0a0a"/>
      </g>
      <!-- 焊點 2：冷焊（霧面顆粒）✗ -->
      <g transform="translate(100,200)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <circle r="12" fill="#888"/>
        <circle cx="-3" cy="-2" r="1.2" fill="#444"/>
        <circle cx="3" cy="-3" r="1" fill="#444"/>
        <circle cx="0" cy="3" r="1.3" fill="#444"/>
        <circle cx="-4" cy="3" r="1" fill="#444"/>
        <circle cx="5" cy="2" r="1.1" fill="#444"/>
      </g>
      <!-- 焊點 3：完美焊點 ✓ -->
      <g transform="translate(200,100)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse rx="11" ry="8" fill="#c0c0c0"/>
        <ellipse cx="-3" cy="-3" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
        <circle r="4" fill="#0a0a0a"/>
      </g>
      <!-- 焊點 4：過量錫（大圓球）✗ -->
      <g transform="translate(200,200)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <circle r="18" fill="#888" stroke="#404040"/>
        <ellipse cx="-5" cy="-5" rx="4" ry="3" fill="rgba(255,255,255,.4)"/>
      </g>
      <!-- 焊點 5：連錫（橫向連到 IC 腳）✗ -->
      <g>
        <g transform="translate(400,100)">
          <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
          <ellipse rx="11" ry="8" fill="#888"/>
        </g>
        <g transform="translate(500,100)">
          <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
          <ellipse rx="11" ry="8" fill="#888"/>
        </g>
        <ellipse cx="450" cy="100" rx="55" ry="11" fill="#888" stroke="#404040"/>
      </g>
      <!-- 焊點 6：完美 ✓ -->
      <g transform="translate(400,200)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse rx="11" ry="8" fill="#c0c0c0"/>
        <ellipse cx="-3" cy="-3" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
      </g>
      <!-- 焊點 7：缺錫（看到銅環）✗ -->
      <g transform="translate(500,200)">
        <circle r="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse rx="6" ry="4" fill="#888"/>
      </g>
      <!-- 邊框 -->
      <rect x="20" y="20" width="560" height="280" rx="8" fill="none" stroke="#14532d" stroke-width="2"/>
    </svg>
  `;

  // 熱點定義（位置以圖內百分比，r=熱點半徑百分比）
  const hotspots = [
    // 良好焊點不算熱點，所以這裡只列「壞」焊點
    { x: 16.7, y: 62.5, r: 8, label: '冷焊（虛焊）', explanation: '表面顆粒霧狀，焊錫沒潤濕銅環。重新加熱 + 補錫，並確認接點完全熱起來再送錫。' },
    { x: 33.3, y: 62.5, r: 8, label: '過量錫（球狀）', explanation: '錫量太多形成大球，看不到元件腳。用吸錫器吸除多餘錫，再補少量錫成錐形。' },
    { x: 75, y: 31.25, r: 12, label: '連錫（短路橋）', explanation: '兩個焊點被錫黏在一起，造成短路。用吸錫器或乾淨烙鐵頭把多餘錫帶走。' },
    { x: 83.3, y: 62.5, r: 8, label: '缺錫', explanation: '錫量不足，看到銅環露出。重新加熱補送少量錫直到飽滿成錐形。' },
  ];

  Interactions.HotspotHunt({
    container: root,
    imageHTML: pcbSVG,
    hotspots,
    instruction: '點出 PCB 上的 4 個焊接錯誤（共 7 個焊點，3 個正確）',
    onAllFound: () => {
      try {
        const k = 'solder_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module5_pcb_hunt = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 PCB 焊點找碴全通過！', 'good');
    },
  });
})();
