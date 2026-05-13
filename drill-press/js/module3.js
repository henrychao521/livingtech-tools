// 鑽床 模組 3：操作流程
const STEPS = [
  { title: '穿戴護具、整理服儀', desc: '護目鏡（防鐵屑彈飛）、口罩（防粉塵）。長髮綁起、寬鬆袖口塞好、項鍊摘下。\n⚠ 鑽床操作禁戴布手套——手套會被夾頭捲入比沒戴更危險。', tip: '護目鏡要選包覆型，普通眼鏡擋不住側面飛屑。', warn: '禁戴布手套是鑽床操作鐵則。', anim: 'ppe' },
  { title: '選鑽頭、裝入夾頭', desc: '依材料選對鑽頭：木 → 木工螺旋；金屬 → HSS。鑽頭直徑不能超過夾頭規格。\n把鑽頭插入夾頭三爪中心約 70–80% 深，用「鑰匙」鎖三個齒輪孔各一次（讓夾爪平均施力）。', tip: '夾頭三個孔都要鎖一遍，只鎖一個會偏心。', warn: null, anim: 'install' },
  { title: '⚠ 拔下夾頭鑰匙', desc: '裝完鑽頭、鎖緊後，**必須**把夾頭鑰匙拔下並放回工具盒。沒拔下鑰匙就開機，鑰匙會以高速甩飛——是鑽床最常見的傷害事故。', tip: '養成「鎖完馬上拔」的肌肉記憶，不要分心。', warn: '沒拔鑰匙絕對不能開機。', anim: 'key' },
  { title: '依直徑與材料設定轉速', desc: '打開皮帶箱蓋（先確認電源在 OFF）→ 把皮帶移到對應的皮帶輪段位 → 蓋回。\n通則：直徑越大、材料越硬 → 轉速越慢。\n參考：木材 8mm 約 2000 RPM、鋼板 8mm 約 600 RPM。', tip: '機台側邊或皮帶箱蓋內常印有「轉速表」可以對照。', warn: '皮帶換位前一定要拔插頭或斷電。', anim: 'speed' },
  { title: '工件夾上工作檯', desc: '把工件放在工作檯上，**必須**用以下方式之一固定：\n• 機台老虎鉗（machine vise）\n• C 型夾固定到 T 槽\n• 大型工件直接螺絲鎖工作檯\n\n工件下方墊「廢木板」當犧牲層，避免鑽穿工作檯。', tip: '小工件絕對不能徒手按——一定要夾住。', warn: '徒手按工件是鑽床最常見事故來源。', anim: 'clamp' },
  { title: '調整工作檯高度', desc: '鬆開工作檯後方的鎖具，搖動高度調整桿讓鑽頭尖距工件約 5cm（足夠下降鑽孔的空間）。調好再鎖緊。\n大型工件可能需要把工作檯轉到旁邊、用基座當工作面。', tip: '鑽頭與工件接觸時，主軸應該還能再下降至少 5–8cm。', warn: null, anim: 'height' },
  { title: '開機 → 對位 → 進刀鑽孔', desc: '1. 開電源、主軸開始轉動\n2. 觀察是否有異常震動或聲音\n3. 順時針旋轉進刀手柄，鑽頭緩慢下降\n4. 鑽頭接觸工件後輕推進刀（不要猛力）\n5. 深孔或硬料每鑽 5mm 退鑽一次排屑', tip: '聽聲音判斷：穩定的「呼呼聲」= 正常；「咯咯聲」或「叫聲」= 進刀太猛或鑽頭鈍。', warn: null, anim: 'drill' },
  { title: '退鑽 → 停機 → 清理收工', desc: '1. 鑽穿後逆時針旋轉手柄，鑽頭完全上升\n2. 關電源、等主軸完全停止（約 5–10 秒）\n3. 用毛刷清掉鐵屑（不可徒手撥）\n4. 鬆夾頭、取下鑽頭歸位\n5. 把夾頭鑰匙放回工具盒\n6. 工作檯擦乾淨', tip: '剛鑽完的金屬鑽頭很燙（200°C+），冷卻 1 分鐘再徒手摸。', warn: '主軸停止前不可伸手清理。', anim: 'finish' },
];

function renderAnim(type) {
  const anims = {
    ppe: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <ellipse cx="200" cy="200" rx="80" ry="8" fill="rgba(0,0,0,.1)"/>
      <circle cx="200" cy="100" r="50" fill="#fde68a"/>
      <rect x="160" y="85" width="80" height="20" rx="4" fill="rgba(100,200,255,.4)" stroke="#0891b2" stroke-width="2"/>
      <path d="M 165 115 Q 200 130 235 115 L 230 135 Q 200 142 170 135 Z" fill="#fff" stroke="#aaa"/>
      <g transform="translate(80,150)">
        <rect x="-20" y="0" width="40" height="50" rx="5" fill="#fff" stroke="#dc2626" stroke-width="2"/>
        <text x="0" y="32" text-anchor="middle" font-size="22" font-weight="900" fill="#dc2626">✗</text>
        <text x="0" y="68" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">禁戴手套</text>
      </g>
      <text x="200" y="210" text-anchor="middle" font-size="11" fill="#444">護目鏡、口罩、綁頭髮，禁戴手套</text>
    </svg>`,
    install: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <rect x="-30" y="-30" width="60" height="60" rx="3" fill="#9ca3af"/>
        <circle cx="-20" cy="-22" r="4" fill="#0f172a"/>
        <circle cx="20" cy="-22" r="4" fill="#0f172a"/>
        <circle cx="0" cy="22" r="4" fill="#0f172a"/>
        <polygon points="-22,30 22,30 12,55 -12,55" fill="#6b7280"/>
        <rect x="-3" y="55" width="6" height="40" fill="#6b7280"/>
        <polygon points="-3,95 3,95 0,105" fill="#374151"/>
        <!-- 鑰匙 -->
        <g transform="translate(45,-22) rotate(15)">
          <rect x="0" y="-2" width="30" height="4" fill="#fbbf24"/>
          <circle cx="32" cy="0" r="4" fill="#fbbf24"/>
        </g>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">三個齒輪孔各鎖一遍，平均施力</text>
    </svg>`,
    key: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <rect x="-25" y="-30" width="50" height="50" rx="3" fill="#9ca3af"/>
        <circle cx="-15" cy="-22" r="3" fill="#0f172a"/>
        <!-- 鑰匙拔下、放到旁邊 -->
        <g transform="translate(80,-10)">
          <rect x="-15" y="-2" width="30" height="4" fill="#fbbf24"/>
          <circle cx="-18" cy="0" r="4" fill="#fbbf24"/>
        </g>
        <!-- 箭頭 -->
        <path d="M 35 -22 Q 55 -10 70 -10" stroke="#22c55e" stroke-width="2.5" fill="none"/>
        <polygon points="70,-10 64,-14 64,-6" fill="#22c55e"/>
        <text x="50" y="-30" text-anchor="middle" font-size="9" fill="#22c55e" font-weight="700">拔下歸位</text>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444" font-weight="700" fill="#dc2626">⚠ 開機前必拔！</text>
    </svg>`,
    speed: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="100" y="60" width="200" height="120" rx="6" fill="#1e293b"/>
      <g transform="translate(150,120)"><circle r="22" fill="#9ca3af"/><circle r="6" fill="#0f172a"/></g>
      <g transform="translate(250,120)"><circle r="18" fill="#9ca3af"/><circle r="5" fill="#0f172a"/></g>
      <path d="M 172 100 L 232 100 M 172 140 L 232 140" stroke="#0f172a" stroke-width="4"/>
      <g font-size="9" font-family="Inter" font-weight="700">
        <text x="305" y="90" fill="#22c55e">2400 RPM (木)</text>
        <text x="305" y="110" fill="#22c55e">1700 RPM</text>
        <text x="305" y="130" fill="#22c55e">1100 RPM</text>
        <text x="305" y="150" fill="#22c55e">720 RPM</text>
        <text x="305" y="170" fill="#dc2626">500 RPM (鋼)</text>
      </g>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">皮帶位置決定主軸轉速</text>
    </svg>`,
    clamp: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="120" width="280" height="50" fill="#14532D"/>
      <rect x="60" y="118" width="280" height="6" fill="#22c55e"/>
      <rect x="130" y="100" width="140" height="22" fill="#a16207"/>
      <!-- 機台老虎鉗 -->
      <g>
        <rect x="100" y="100" width="30" height="40" fill="#475569"/>
        <rect x="270" y="100" width="30" height="40" fill="#475569"/>
        <circle cx="115" cy="120" r="6" fill="#0f172a"/>
        <circle cx="285" cy="120" r="6" fill="#0f172a"/>
      </g>
      <!-- 廢木板 -->
      <rect x="130" y="122" width="140" height="8" fill="#92400e" opacity=".7"/>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">工件鎖入機台老虎鉗，下墊犧牲層</text>
    </svg>`,
    height: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="190" y="20" width="20" height="180" fill="#9ca3af"/>
      <rect x="120" y="80" width="160" height="20" fill="#14532D"/>
      <path d="M 280 90 L 300 90 L 295 75 M 280 90 L 300 90 L 295 105" stroke="#22c55e" stroke-width="2" fill="none"/>
      <text x="310" y="93" font-size="11" fill="#22c55e" font-weight="700">調高度</text>
      <rect x="170" y="50" width="60" height="20" fill="#6b7280"/>
      <polygon points="195,70 205,70 200,80" fill="#374151"/>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">鑽頭尖距工件約 5cm</text>
    </svg>`,
    drill: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="80" y="120" width="240" height="50" fill="#a16207"/>
      <ellipse cx="200" cy="140" rx="6" ry="3" fill="#000"/>
      <rect x="194" y="80" width="12" height="50" fill="#6b7280"/>
      <polygon points="194,130 206,130 200,140" fill="#374151"/>
      <line x1="200" y1="60" x2="200" y2="80" stroke="#22c55e" stroke-width="3" marker-end="url(#arrd)"/>
      <defs><marker id="arrd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
      <text x="200" y="50" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">穩定進刀</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">緩慢進刀、每 5mm 退屑</text>
    </svg>`,
    finish: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="80" y="120" width="240" height="50" fill="#a16207"/>
      <ellipse cx="200" cy="145" rx="8" ry="4" fill="#1e293b"/>
      <rect x="194" y="40" width="12" height="40" fill="#6b7280"/>
      <polygon points="194,80 206,80 200,90" fill="#374151"/>
      <path d="M 180 60 Q 200 50 220 60" stroke="#0891b2" stroke-width="2" fill="none"/>
      <text x="200" y="45" text-anchor="middle" font-size="10" fill="#0891b2" font-weight="700">退鑽</text>
      <text x="320" y="160" font-size="20" fill="#22c55e">✓</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">退鑽 → 停機 → 清理 → 拔鑰匙歸位</text>
    </svg>`,
  };
  return anims[type] || '';
}

const PK = 'dpress_progress_v1';
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
