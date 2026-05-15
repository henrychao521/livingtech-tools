// 焊接平台 模組 3：焊接步驟教學
const STEPS = [
  {
    title: '開機加熱',
    anim: 'heat',
    desc: '插上電源、設定溫度（含鉛 320°C / 無鉛 360°C），按下開關。指示燈閃爍代表加熱中，恆亮代表已達設定溫度可以開始焊接。',
    tip: '預熱約 30–60 秒，學生可以利用這段時間準備海綿、檢查電路板。',
    warn: null,
  },
  {
    title: '海綿沾水擰乾',
    anim: 'sponge',
    desc: '海綿要事先沾水並擰乾（不要太濕也不能太乾）。太濕會讓烙鐵頭驟冷裂開，太乾無法清潔。',
    tip: '判斷標準：用手指壓海綿不會滴水，但有濕潤感。',
    warn: null,
  },
  {
    title: '烙鐵頭上錫養護（Tinning）',
    anim: 'tinning',
    desc: '預熱完成後，先用焊錫絲輕輕點烙鐵頭，讓烙鐵頭表面均勻覆蓋一層薄錫。這層錫能幫助傳熱、防止氧化。',
    tip: '養護後的烙鐵頭應該是亮銀色。如果是黑色或灰色，要先用海綿擦掉氧化物再養護一次。',
    warn: '長時間沒上錫的烙鐵頭會「死頭」（永久氧化），就算清潔也救不回來。',
  },
  {
    title: '對齊接點',
    anim: 'align',
    desc: '把要焊接的元件腳穿過 PCB 的孔位，從背面用一隻手扶住。元件腳要稍微留長（約 2mm），方便焊接後修剪。',
    tip: '焊接前先把元件腳折成 45°（軸向元件），可以防止元件掉下來。',
    warn: null,
  },
  {
    title: '加熱接點',
    anim: 'heat-pad',
    desc: '烙鐵頭側面（不是尖端）同時碰到 PCB 銅環與元件腳。讓兩者一起加熱約 1–2 秒。注意是先加熱接點，不是直接加熱焊錫。',
    tip: '正確的接觸方式：烙鐵頭傾斜 45°，碰觸面積最大，傳熱最快。',
    warn: '只用尖端碰觸接點會接觸面積太小，加熱不均，造成虛焊。',
  },
  {
    title: '送焊錫',
    anim: 'feed-solder',
    desc: '接點加熱 1–2 秒後，從另一邊送焊錫絲到「接點」上（注意：不是碰烙鐵頭，是碰接點），讓焊錫被熱熔化並流入接點。',
    tip: '依 IPC-A-610 標準：焊錫應沿元件腳與焊盤形成「凹形 fillet」、潤濕角 < 90°，貼合銅環表面即可。送太多會變球狀過量錫，太少會虛焊。',
    warn: '焊錫直接碰烙鐵頭會在烙鐵頭上累積成錫球，掉落造成短路。',
  },
  {
    title: '抽錫絲',
    anim: 'remove-solder',
    desc: '焊錫流滿接點後，先抽走焊錫絲，但烙鐵頭還繼續停留。',
    tip: '抽錫絲是輕輕往後拉，不要拉斷在錫池裡。',
    warn: null,
  },
  {
    title: '移開烙鐵',
    anim: 'remove-iron',
    desc: '焊錫絲抽走後，烙鐵頭再停留 0.5–1 秒讓焊錫完全潤濕，然後沿著元件腳「往上滑出」（不是直接拔開）。最後等焊點凝固再剪線。',
    tip: '完美焊點：表面光亮、形狀像火山錐、覆蓋整個銅環。約 5 秒內凝固。',
    warn: '焊錫凝固前移動元件會造成「冷焊」，焊點霧霧的、易脫落。',
  },
];

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();
let currentStep = 0;

const PROGRESS_KEY_S = 'solder_progress_v1';
function loadSolderProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || {}; } catch { return {}; }
}
function saveSolderProgress(p) {
  localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p));
}

const savedProg = loadSolderProgress();
if (savedProg.module3_seen) savedProg.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.dataset.idx = i;
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  currentStep = i;
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / 08</div>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p>${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '我已了解，下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / 8 步`;
  const prog = loadSolderProgress();
  prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 八個步驟都看完了，準備好進入模擬練習！', 'good');
  }
  saveSolderProgress(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}

function renderAnim(type) {
  const anims = {
    heat: `
      <svg viewBox="0 0 400 240" style="width:80%;max-width:340px">
        <rect x="120" y="80" width="160" height="120" rx="6" fill="#374151"/>
        <rect x="135" y="95" width="130" height="40" rx="3" fill="#0a2a0a"/>
        <text x="200" y="120" text-anchor="middle" fill="#3aff6a" font-size="20" font-family="monospace" font-weight="700">
          <animate attributeName="opacity" values="1;.3;1" dur="0.6s" repeatCount="indefinite"/>
          350°C
        </text>
        <circle cx="160" cy="160" r="8" fill="#fbbf24">
          <animate attributeName="opacity" values="1;.3;1" dur="0.6s" repeatCount="indefinite"/>
        </circle>
        <text x="180" y="165" font-size="11" fill="#fff" font-family="Inter,sans-serif">加熱中</text>
        <rect x="220" y="155" width="40" height="14" rx="2" fill="#22c55e"/>
        <text x="240" y="166" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">ON</text>
      </svg>`,

    sponge: `
      <svg viewBox="0 0 400 240" style="width:80%;max-width:340px">
        <rect x="80" y="120" width="240" height="80" rx="6" fill="#9ca3af"/>
        <rect x="90" y="125" width="220" height="60" rx="4" fill="#fbbf24" opacity=".7"/>
        <text x="200" y="160" text-anchor="middle" fill="#1f2937" font-size="16" font-weight="700" font-family="Inter,sans-serif">SPONGE</text>
        <!-- 水滴 -->
        <ellipse cx="160" cy="100" rx="6" ry="9" fill="#3b82f6"><animate attributeName="cy" values="100;130;100" dur="2s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="240" cy="100" rx="5" ry="8" fill="#3b82f6"><animate attributeName="cy" values="100;130;100" dur="2.3s" repeatCount="indefinite"/></ellipse>
        <text x="200" y="220" text-anchor="middle" font-size="13" fill="#444" font-family="Noto Sans TC,sans-serif">沾水後擰乾，保持濕潤</text>
      </svg>`,

    tinning: `
      <svg viewBox="0 0 400 240" style="width:90%">
        <!-- 烙鐵頭 -->
        <g transform="translate(120,120)">
          <rect x="0" y="-12" width="60" height="24" rx="2" fill="#9ca3af"/>
          <polygon points="60,-12 90,0 60,12" fill="#f59e0b"/>
          <!-- 高光發亮 -->
          <ellipse cx="80" cy="0" rx="14" ry="10" fill="#fbbf24" opacity=".7">
            <animate attributeName="opacity" values=".4;.9;.4" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
        </g>
        <!-- 焊錫絲 -->
        <line x1="280" y1="60" x2="220" y2="120" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
        <text x="290" y="56" font-size="11" fill="#666" font-family="Noto Sans TC,sans-serif">焊錫絲輕點</text>
        <!-- 銀色錫覆蓋 -->
        <ellipse cx="200" cy="120" rx="20" ry="10" fill="rgba(192,192,192,.7)">
          <animate attributeName="rx" values="0;25;25" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <text x="200" y="200" text-anchor="middle" font-size="13" fill="#444" font-family="Noto Sans TC,sans-serif">烙鐵頭表面均勻覆錫 → 亮銀色</text>
      </svg>`,

    align: `
      <svg viewBox="0 0 400 240" style="width:90%">
        <!-- PCB 板 -->
        <rect x="60" y="100" width="280" height="100" fill="#22c55e" rx="3"/>
        <!-- 焊盤孔 -->
        <circle cx="120" cy="150" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="120" cy="150" r="4" fill="#1f2937"/>
        <circle cx="200" cy="150" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="200" cy="150" r="4" fill="#1f2937"/>
        <circle cx="280" cy="150" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="280" cy="150" r="4" fill="#1f2937"/>
        <!-- 元件腳穿過 -->
        <line x1="120" y1="60" x2="120" y2="170" stroke="#9ca3af" stroke-width="3"/>
        <line x1="280" y1="60" x2="280" y2="170" stroke="#9ca3af" stroke-width="3"/>
        <!-- 元件本體 -->
        <rect x="100" y="40" width="200" height="20" rx="10" fill="#dc2626"/>
        <text x="200" y="54" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">RESISTOR</text>
        <!-- 標示 -->
        <line x1="120" y1="180" x2="100" y2="220" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="80" y="225" font-size="10" fill="#1b6e3a" font-family="Noto Sans TC,sans-serif">留 2mm 修剪空間</text>
      </svg>`,

    'heat-pad': `
      <svg viewBox="0 0 400 240" style="width:90%">
        <!-- PCB -->
        <rect x="60" y="120" width="280" height="80" fill="#22c55e" rx="3"/>
        <circle cx="200" cy="160" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <line x1="200" y1="80" x2="200" y2="180" stroke="#9ca3af" stroke-width="3"/>
        <!-- 烙鐵頭 45° 接觸 -->
        <g transform="translate(160,80) rotate(45)">
          <rect x="0" y="-10" width="60" height="20" rx="2" fill="#9ca3af"/>
          <polygon points="60,-10 80,0 60,10" fill="#f59e0b"/>
        </g>
        <!-- 熱傳導動畫 -->
        <circle cx="200" cy="160" r="5" fill="rgba(255,100,0,.8)">
          <animate attributeName="r" values="5;25;5" dur="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <!-- 標示 -->
        <text x="200" y="220" text-anchor="middle" font-size="13" fill="#444" font-family="Noto Sans TC,sans-serif">烙鐵頭 45° 同時碰銅環與元件腳，停留 1–2 秒</text>
      </svg>`,

    'feed-solder': `
      <svg viewBox="0 0 400 240" style="width:90%">
        <!-- PCB -->
        <rect x="60" y="120" width="280" height="80" fill="#22c55e" rx="3"/>
        <circle cx="200" cy="160" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <line x1="200" y1="80" x2="200" y2="180" stroke="#9ca3af" stroke-width="3"/>
        <!-- 烙鐵 -->
        <g transform="translate(60,80) rotate(35)">
          <rect x="0" y="-10" width="60" height="20" rx="2" fill="#9ca3af"/>
          <polygon points="60,-10 80,0 60,10" fill="#f59e0b"/>
        </g>
        <!-- 焊錫絲 -->
        <line x1="320" y1="60" x2="220" y2="155" stroke="#9ca3af" stroke-width="3" stroke-linecap="round">
          <animate attributeName="x2" values="280;220;220" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="120;155;155" dur="2s" repeatCount="indefinite"/>
        </line>
        <text x="320" y="55" font-size="11" fill="#666" font-family="Noto Sans TC,sans-serif" text-anchor="end">焊錫絲</text>
        <!-- 焊錫流動 -->
        <ellipse cx="200" cy="160" rx="0" ry="0" fill="rgba(192,192,192,.9)">
          <animate attributeName="rx" values="0;14;14" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="0;10;10" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <text x="200" y="220" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="700" font-family="Noto Sans TC,sans-serif">焊錫碰「接點」不是碰烙鐵</text>
      </svg>`,

    'remove-solder': `
      <svg viewBox="0 0 400 240" style="width:90%">
        <rect x="60" y="120" width="280" height="80" fill="#22c55e" rx="3"/>
        <circle cx="200" cy="160" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <line x1="200" y1="80" x2="200" y2="180" stroke="#9ca3af" stroke-width="3"/>
        <!-- 烙鐵還在 -->
        <g transform="translate(60,80) rotate(35)">
          <rect x="0" y="-10" width="60" height="20" rx="2" fill="#9ca3af"/>
          <polygon points="60,-10 80,0 60,10" fill="#f59e0b"/>
        </g>
        <!-- 焊錫絲收回 -->
        <line x1="320" y1="60" x2="280" y2="100" stroke="#9ca3af" stroke-width="3" stroke-linecap="round">
          <animate attributeName="x2" values="220;320;320" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="155;60;60" dur="2s" repeatCount="indefinite"/>
        </line>
        <!-- 飽滿錫球 -->
        <ellipse cx="200" cy="158" rx="12" ry="10" fill="rgba(180,180,180,.95)"/>
        <text x="200" y="220" text-anchor="middle" font-size="13" fill="#444" font-family="Noto Sans TC,sans-serif">先抽焊錫，烙鐵頭還停留</text>
      </svg>`,

    'remove-iron': `
      <svg viewBox="0 0 400 240" style="width:90%">
        <rect x="60" y="120" width="280" height="80" fill="#22c55e" rx="3"/>
        <circle cx="200" cy="160" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <line x1="200" y1="80" x2="200" y2="180" stroke="#9ca3af" stroke-width="3"/>
        <!-- 完美錐形焊點 -->
        <path d="M 188 160 Q 200 140 212 160" fill="rgba(192,192,192,.95)" stroke="#6b7280" stroke-width=".5"/>
        <ellipse cx="200" cy="142" rx="3" ry="2" fill="rgba(255,255,255,.6)"/>
        <!-- 烙鐵移開動畫（往上滑）-->
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -60; 0 -60" dur="2s" repeatCount="indefinite"/>
          <g transform="translate(170,90) rotate(35)">
            <rect x="0" y="-10" width="60" height="20" rx="2" fill="#9ca3af"/>
            <polygon points="60,-10 80,0 60,10" fill="#f59e0b"/>
          </g>
        </g>
        <text x="200" y="220" text-anchor="middle" font-size="13" fill="#1b6e3a" font-weight="700" font-family="Noto Sans TC,sans-serif">沿元件腳往上滑出，留下亮錐形焊點</text>
      </svg>`,
  };
  return anims[type] || '';
}

selectStep(0);
window.selectStep = selectStep;
window.markDone = markDone;

// === 步驟排序拼圖 ===
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的步驟排回正確順序',
    onComplete: () => {
      try {
        const k = 'solder_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module3_puzzle = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    }
  });
}

/* ── 溫度感知與焊點判讀測驗 ──────────────────────────────── */
;(function () {
  const TQ = [
    {
      situation: '烙鐵設定 250°C，焊接含鉛錫（Sn63Pb37，熔點 183°C）時焊錫依然無法流動，你認為原因是？',
      options: [
        '溫度超過熔點，焊錫應該會流動，可能是焊錫有問題',
        '250°C 雖超熔點，但接觸冷接點後溫度快速下降，熱容量不足以充分潤濕接點',
        '焊錫成分比例不正確，換一種牌子就好'
      ],
      correct: 1,
      explain: '正確！烙鐵頭接觸冷接點後溫度會驟降，250°C 的熱容量不足以快速加熱接點。建議使用 320–360°C，才能讓接點快速升溫、焊錫充分潤濕，避免焊錫在流動前就重新凝固造成虛焊。'
    },
    {
      situation: '焊接 0402 SMD 超小元件時，你把烙鐵調到 430°C，認為高溫縮短接觸時間、元件更安全。這個做法正確嗎？',
      options: [
        '正確，高溫縮短焊接時間，元件受熱更少、更安全',
        '錯誤，430°C 瞬間過熱反而更容易燒損 SMD 元件和 PCB 焊盤覆銅',
        '溫度不影響焊接品質，重點是進錫速度'
      ],
      correct: 1,
      explain: '錯誤做法！對小型 SMD 元件，高溫非常危險。430°C 接觸瞬間就能讓電容、二極體等元件過熱失效，或使 PCB 銅箔脫落（Delamination）。正確做法：維持 320–360°C + 快速手法（1–2 秒完成焊接）。'
    },
    {
      situation: '焊接後烙鐵頭表面出現深褐色氧化層，你拿砂紙把氧化層磨掉，覺得這樣比海綿更徹底。對嗎？',
      options: [
        '對，砂紙比海綿更能徹底清除氧化，效果更好',
        '不對，砂紙會磨掉烙鐵頭的保護鍍層，使其更快氧化，應用濕海綿擦後立刻上錫',
        '可以，只要磨輕一點、不磨太深就沒問題'
      ],
      correct: 1,
      explain: '千萬不可用砂紙！烙鐵頭有特殊保護鍍層（通常是鍍鐵），磨掉後銅芯直接暴露，氧化速度會更快，最終造成「死頭」。正確做法：濕海綿輕擦 → 立刻上錫（Tinning）隔絕氧氣。'
    },
    {
      situation: '焊完的焊點表面光亮，但呈圓球狀隆起，元件腳周圍沒有錐形 fillet 包覆。這代表什麼問題？',
      options: [
        '完美焊點！光亮就是品質好的表現',
        '過量焊錫（Solder Ball），是相鄰焊點短路的潛在風險，不符合 IPC-A-610 標準',
        '焊錫成分不對，應換成無鉛焊錫'
      ],
      correct: 1,
      explain: '球狀焊點代表焊錫過量，無法形成凹形 fillet（潤濕角 < 90°）反而堆積成球。這是不良焊點，容易觸碰相鄰焊盤造成短路（Solder Bridge）。應重新加熱讓多餘焊錫流走，或用吸錫線吸除後補焊。'
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🌡️ 溫度感知與焊點判讀測驗</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">焊接溫度與技術細節密切相關。從以下情境中選出正確判斷，培養溫度直覺與焊點鑑別能力。</p>
    <div id="temp-quiz-list"></div>
    <div id="temp-quiz-result" style="margin-top:12px"></div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const container = document.getElementById('temp-quiz-list');
  let tqScore = 0;
  const tqAnswered = new Set();

  TQ.forEach((q, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:12px';
    div.innerHTML = `
      <p style="font-size:14px;color:#1e293b;margin:0 0 12px"><strong>情境 ${i + 1}：</strong>${q.situation}</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${q.options.map((o, j) => `<button class="tq-btn" data-q="${i}" data-c="${j}"
          style="text-align:left;padding:10px 14px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s;line-height:1.5">
          <strong style="color:#475569">${String.fromCharCode(65 + j)}.</strong> ${o}
        </button>`).join('')}
      </div>
      <div class="tq-feedback" style="margin-top:10px"></div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('.tq-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#f1f5f9'; });
    btn.addEventListener('mouseleave', () => { if (!btn.disabled && btn.style.borderColor === 'rgb(203, 213, 225)') btn.style.background = '#f8fafc'; });
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.q);
      const c = parseInt(btn.dataset.c);
      if (tqAnswered.has(i)) return;
      tqAnswered.add(i);
      const correct = c === TQ[i].correct;
      const parent = btn.closest('div[style]');
      parent.querySelectorAll('.tq-btn').forEach((b, k) => {
        b.disabled = true;
        b.style.cursor = 'default';
        if (k === TQ[i].correct) {
          b.style.background = '#dcfce7';
          b.style.borderColor = '#16a34a';
          b.style.color = '#15803d';
        }
        if (b === btn && !correct) {
          b.style.background = '#fee2e2';
          b.style.borderColor = '#dc2626';
          b.style.color = '#b91c1c';
        }
      });
      const fb = parent.querySelector('.tq-feedback');
      const style = correct
        ? 'background:#f0fdf4;border:1px solid #86efac;color:#15803d'
        : 'background:#fff7ed;border:1px solid #fdba74;color:#9a3412';
      fb.innerHTML = `<div style="padding:10px 14px;border-radius:8px;font-size:13px;line-height:1.7;${style}">
        ${correct ? '✓ 正確！' : '✗ 不對。'} ${TQ[i].explain}
      </div>`;
      if (correct) { tqScore++; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
      else if (typeof SoundFX !== 'undefined') SoundFX.error();

      if (tqAnswered.size === TQ.length) {
        const result = document.getElementById('temp-quiz-result');
        const pct = Math.round(tqScore / TQ.length * 100);
        const pass = pct >= 75;
        result.innerHTML = `<div style="padding:16px 20px;border-radius:12px;text-align:center;font-size:15px;margin-top:4px;${pass
          ? 'background:#f0fdf4;border:2px solid #22c55e;color:#15803d'
          : 'background:#fff7ed;border:2px solid #f97316;color:#9a3412'}">
          ${pass ? '🌡️ 溫度感知測驗通過！' : '📖 再複習一次操作步驟再挑戰！'}&ensp;<strong>${tqScore} / ${TQ.length} 答對（${pct}%）</strong>
        </div>`;
        if (pass) {
          if (typeof SoundFX !== 'undefined') SoundFX.win();
          try {
            const k = 'solder_progress_v1';
            const p = JSON.parse(localStorage.getItem(k)) || {};
            p.module3_tempquiz = true;
            localStorage.setItem(k, JSON.stringify(p));
          } catch (e) {}
          if (typeof showToast === 'function') showToast('🌡️ 溫度感知測驗通過！', 'good');
        }
      }
    });
  });
})();
