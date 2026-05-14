// 手電鑽 模組 3：鑽孔流程
const STEPS = [
  { title: '穿戴護具', desc: '護目鏡（防鐵屑/木屑彈飛）、口罩（防 MDF/塑料粉塵）、不戴手套（手套容易被夾頭捲入更危險）。長髮綁起、寬鬆袖口塞好、項鍊摘下。', tip: '護目鏡要選包覆型，普通眼鏡擋不住側面飛屑。', warn: '戴布手套是手電鑽操作的禁忌——比沒戴更危險。', anim: 'ppe' },
  { title: '選對鑽頭', desc: '木材 → 木工螺旋鑽頭（含中心尖）\n金屬 → 高速鋼（HSS）鑽頭\n磚石 → 碳化鎢磚石鑽頭\n大孔（>10mm）→ 階梯鑽或開孔器\n小心：鑽頭直徑不能超過夾頭規格（10/13mm）。', tip: '不確定材料時，用磁鐵測：吸住＝鐵製金屬、不吸＝鋁/銅/塑膠。', warn: null, anim: 'bit' },
  { title: '裝鑽頭、鎖緊夾頭', desc: '先確認電池拆下或保險開關鎖定。把鑽頭插入夾頭三爪中心 → 一手握機身、另一手轉緊夾頭環，直到聽見連續「咔咔咔」棘輪聲——表示鎖到最緊。', tip: '裝完搖一搖鑽頭確認不會晃動。', warn: '沒鎖到「咔咔」聲不算夾緊，鑽頭會在工件內甩飛。', anim: 'chuck' },
  { title: '設定扭力與模式', desc: '鑽孔 → 把扭力環轉到「鑽頭符號」（離合器鎖死）\n鎖螺絲 → 中低段（4–10），讓離合器在到位時自動跳脫\n正反轉開關確認在「FWD（正轉）」位置。', tip: '鎖石膏板 2–4、實木 12–18、混凝土壁釘 18+。', warn: null, anim: 'torque' },
  { title: '標位置、固定工件', desc: '用鉛筆在鑽孔位置畫「十字」。金屬鑽孔可用中心衝（central punch）敲一個小凹點，防止偏鑽。工件必須用 C 型夾或老虎鉗固定在工作台上，下方墊廢板防止鑽穿桌面。', tip: '雙手鑽孔時，工件絕對不能用手或膝蓋壓——一定要夾。', warn: '工件不固定是最常見的傷害來源。', anim: 'mark' },
  { title: '起鑽：點壓 + 慢速', desc: '雙手握姿勢就位（主手扳機、輔手扶機身前段）。鑽頭垂直對準鉛筆十字、輕輕點下開機（10–20% 扭力）讓鑽頭咬入材料。咬入後再逐漸加深扣扳機加速。', tip: '鑽頭必須與工件「90°垂直」——歪斜會偏鑽或斷頭。', warn: null, anim: 'start' },
  { title: '鑽孔：穩定進刀、定時退屑', desc: '保持垂直、穩定進刀（不要太用力推，讓鑽頭自己切）。每鑽 5–10mm 退鑽一次清理鐵屑（pecking）。深孔或硬材料更頻繁退屑。聽到「轉速突然下降」就是進刀太猛。', tip: '木材鑽出來是「捲花」狀，金屬是「螺旋狀屑」，磚石是「粉末」——順利時的訊號。', warn: '進刀過快會折斷鑽頭、燒馬達。', anim: 'drill' },
  { title: '退鑽 ＆ 收工', desc: '鑽穿後鬆開扳機 → 等鑽頭完全停止 → 反轉退出（保持垂直）。檢查孔徑是否符合需求，必要時用大一號鑽頭擴孔或用銼刀修毛邊。最後：拆電池 → 拆鑽頭 → 鑽頭歸位 → 清理工作台。', tip: '鑽完馬上把鑽頭從夾頭取下，避免下次別人誤觸扳機。', warn: '剛鑽完的金屬鑽頭很燙（200°C+），冷卻 1–2 分鐘再徒手摸。', anim: 'finish' },
];

function renderAnim(type) {
  const anims = {
    ppe: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <ellipse cx="200" cy="200" rx="80" ry="8" fill="rgba(0,0,0,.1)"/>
      <!-- 頭 -->
      <circle cx="200" cy="100" r="50" fill="#fde68a"/>
      <!-- 護目鏡 -->
      <rect x="160" y="85" width="80" height="20" rx="4" fill="rgba(100,200,255,.4)" stroke="#0891b2" stroke-width="2"/>
      <line x1="200" y1="95" x2="200" y2="105" stroke="#0891b2" stroke-width="2"/>
      <!-- 口罩 -->
      <path d="M 165 115 Q 200 130 235 115 L 230 135 Q 200 142 170 135 Z" fill="#fff" stroke="#aaa"/>
      <!-- X 戴手套（禁止） -->
      <g transform="translate(80,150)">
        <rect x="-20" y="0" width="40" height="50" rx="5" fill="#fff" stroke="#dc2626" stroke-width="2"/>
        <text x="0" y="30" text-anchor="middle" font-size="20" font-weight="900" fill="#dc2626">✗</text>
        <text x="0" y="68" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">禁戴手套</text>
      </g>
      <text x="200" y="210" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">護目鏡、口罩、綁頭髮，不戴手套</text>
    </svg>`,
    bit: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 三種鑽頭並排 -->
      <g transform="translate(80,100)">
        <!-- 木工 -->
        <rect x="-30" y="-3" width="50" height="6" fill="#a16207"/>
        <polygon points="20,-3 35,0 20,3" fill="#92400e"/>
        <circle cx="33" cy="0" r="2" fill="#fbbf24"/>
        <text x="-5" y="22" text-anchor="middle" font-size="10" fill="#92400e" font-weight="700">木工</text>
      </g>
      <g transform="translate(200,100)">
        <!-- HSS -->
        <rect x="-30" y="-3" width="50" height="6" fill="#9ca3af"/>
        <g stroke="#4b5563" stroke-width="0.5"><line x1="-28" y1="-3" x2="-25" y2="3"/><line x1="-20" y1="-3" x2="-17" y2="3"/><line x1="-12" y1="-3" x2="-9" y2="3"/><line x1="-4" y1="-3" x2="-1" y2="3"/><line x1="4" y1="-3" x2="7" y2="3"/><line x1="12" y1="-3" x2="15" y2="3"/></g>
        <polygon points="20,-3 32,0 20,3" fill="#4b5563"/>
        <text x="-5" y="22" text-anchor="middle" font-size="10" fill="#4b5563" font-weight="700">HSS 金屬</text>
      </g>
      <g transform="translate(320,100)">
        <!-- 磚石 -->
        <rect x="-30" y="-3" width="50" height="6" fill="#78716c"/>
        <polygon points="20,-5 30,-2 30,2 20,5" fill="#a8a29e"/>
        <text x="-5" y="22" text-anchor="middle" font-size="10" fill="#78716c" font-weight="700">磚石</text>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">不同材料用不同鑽頭，選錯會崩刃</text>
    </svg>`,
    chuck: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <!-- 夾頭 -->
        <rect x="-40" y="-30" width="60" height="60" rx="4" fill="#9ca3af"/>
        <g stroke="#4b5563" stroke-width="1.2"><line x1="-35" y1="-25" x2="15" y2="-25"/><line x1="-35" y1="-15" x2="15" y2="-15"/><line x1="-35" y1="-5" x2="15" y2="-5"/><line x1="-35" y1="5" x2="15" y2="5"/><line x1="-35" y1="15" x2="15" y2="15"/><line x1="-35" y1="25" x2="15" y2="25"/></g>
        <!-- 鑽頭 -->
        <rect x="20" y="-3" width="50" height="6" fill="#6b7280"/>
        <polygon points="70,-3 84,0 70,3" fill="#374151"/>
        <!-- 旋轉箭頭 -->
        <path d="M -20 -40 Q 5 -55 25 -40" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round" marker-end="url(#arrowg)"/>
        <defs><marker id="arrowg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
        <text x="-7" y="-50" text-anchor="middle" font-size="9" fill="#22c55e" font-weight="700">轉緊到「咔咔」</text>
      </g>
      <text x="200" y="195" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">必須聽到棘輪聲才算鎖到最緊</text>
    </svg>`,
    torque: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <circle r="60" fill="#fef3c7" stroke="#F59E0B" stroke-width="3"/>
        <circle r="42" fill="#fff"/>
        <!-- 刻度 -->
        <g font-size="9" font-weight="700" fill="#92400e" font-family="Inter">
          <text x="0" y="-46" text-anchor="middle">10</text>
          <text x="48" y="3" text-anchor="middle">5</text>
          <text x="58" y="3" text-anchor="middle">⊕</text>
          <text x="-48" y="3" text-anchor="middle">15</text>
          <text x="0" y="55" text-anchor="middle">1</text>
        </g>
        <!-- 指針 -->
        <line x1="0" y1="0" x2="0" y2="-32" stroke="#dc2626" stroke-width="3" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" values="0;90;180;270;360" dur="6s" repeatCount="indefinite"/>
        </line>
        <circle r="3" fill="#dc2626"/>
      </g>
      <text x="200" y="195" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">扭力環旋轉選對段位，避免崩牙或斷螺絲</text>
    </svg>`,
    mark: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 工件 -->
      <rect x="50" y="100" width="300" height="50" fill="#a16207"/>
      <!-- 十字標記 -->
      <line x1="190" y1="115" x2="210" y2="115" stroke="#dc2626" stroke-width="2"/>
      <line x1="200" y1="105" x2="200" y2="125" stroke="#dc2626" stroke-width="2"/>
      <!-- C 型夾 -->
      <g transform="translate(80,90)">
        <rect x="0" y="0" width="6" height="80" fill="#475569"/>
        <rect x="-15" y="0" width="20" height="10" fill="#475569"/>
        <rect x="-15" y="68" width="20" height="10" fill="#475569"/>
        <circle cx="-10" cy="73" r="6" fill="#1e293b"/>
      </g>
      <text x="200" y="185" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">畫十字、夾緊工件、墊廢板</text>
    </svg>`,
    start: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 工件 -->
      <rect x="60" y="140" width="280" height="40" fill="#a16207"/>
      <!-- 鑽頭垂直對齊 -->
      <g transform="translate(200,100)">
        <rect x="-3" y="0" width="6" height="40" fill="#6b7280"/>
        <polygon points="-3,40 3,40 0,48" fill="#374151"/>
      </g>
      <!-- 90 度標記 -->
      <path d="M 215 132 L 215 140 L 223 140" stroke="#22c55e" stroke-width="2" fill="none"/>
      <text x="240" y="138" font-size="11" fill="#22c55e" font-weight="800">90°</text>
      <!-- 力箭頭 -->
      <line x1="200" y1="60" x2="200" y2="90" stroke="#dc2626" stroke-width="2.5" marker-end="url(#arrows1)"/>
      <defs><marker id="arrows1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626"/></marker></defs>
      <text x="200" y="55" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700">輕點壓</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">90° 垂直、輕扣慢速</text>
    </svg>`,
    drill: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="100" width="280" height="60" fill="#a16207"/>
      <!-- 已鑽的孔 -->
      <ellipse cx="200" cy="130" rx="8" ry="14" fill="#1e293b"/>
      <!-- 鑽頭在孔內 -->
      <g transform="translate(200,80)">
        <rect x="-3" y="0" width="6" height="50" fill="#6b7280"/>
        <polygon points="-3,50 3,50 0,58" fill="#374151"/>
      </g>
      <!-- 木屑捲花 -->
      <g fill="#92400e" opacity=".8">
        <circle cx="220" cy="110" r="3"/>
        <circle cx="230" cy="115" r="2.5"/>
        <circle cx="180" cy="108" r="3"/>
        <circle cx="170" cy="114" r="2"/>
      </g>
      <!-- 進刀箭頭 -->
      <line x1="200" y1="60" x2="200" y2="78" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arrowd)"/>
      <defs><marker id="arrowd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
      <text x="200" y="55" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">穩定進刀</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">穩定推進，定時退屑（pecking）</text>
    </svg>`,
    finish: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="100" width="280" height="60" fill="#a16207"/>
      <!-- 完成的乾淨孔 -->
      <ellipse cx="200" cy="130" rx="10" ry="20" fill="#1e293b"/>
      <!-- 反轉箭頭 -->
      <g transform="translate(140,70)">
        <path d="M -20 0 Q 0 -20 20 0" stroke="#0891b2" stroke-width="2.5" fill="none"/>
        <polygon points="20,0 14,-6 22,-2" fill="#0891b2"/>
        <text x="0" y="20" text-anchor="middle" font-size="9" fill="#0891b2" font-weight="700">REV 反轉</text>
      </g>
      <text x="280" y="40" text-anchor="middle" font-size="22">✓</text>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">反轉退出、拆電池、清工作台</text>
    </svg>`,
  };
  return anims[type] || '';
}

const PK = 'drill_progress_v1';
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

// ========================
// 扭力環計算機（模組 3 延伸互動）
// ========================
(function() {
  const MATERIALS = [
    { id: 'drywall', name: '石膏板', icon: '🧱', range: [1, 3], note: '最輕扭力，避免螺絲穿頭損壞板材' },
    { id: 'thin',    name: '薄夾板 ≤12mm', icon: '🪵', range: [4, 7], note: '中低扭力，到位後離合器自動跳脫' },
    { id: 'hard',    name: '硬木 / 厚板', icon: '🌲', range: [10, 16], note: '中高扭力，硬材阻力大需要更多轉矩' },
    { id: 'concrete',name: '混凝土壁釘', icon: '🪨', range: [18, 20], note: '最高扭力，螺絲要先敲入導孔' },
    { id: 'drill',   name: '純鑽孔模式', icon: '⚙️', range: [21, 21], note: '轉到「⊕ 鑽頭符號」鎖死離合器，專用於鑽孔' },
  ];
  const SCREWS = [
    { id: 'small', name: 'M3 / 細螺絲', mod: -1 },
    { id: 'mid',   name: 'M4–M5 / 標準', mod: 0 },
    { id: 'large', name: 'M6+ / 粗牙', mod: 2 },
  ];

  let selMat = null, selScrew = null;

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'torque-calc';
  sec.innerHTML = `
    <h3>⚙️ 扭力環計算機</h3>
    <p class="muted" style="margin-bottom:18px">依材料與螺絲大小，找到適合的扭力環刻度，避免崩牙或螺絲斷頭。</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div>
        <p style="font-weight:700;margin:0 0 10px;font-size:13px">① 選擇材料</p>
        <div style="display:flex;flex-direction:column;gap:6px" id="torq-mat-btns">
          ${MATERIALS.map(m => `<button data-mat="${m.id}" style="padding:9px 12px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-size:13px;text-align:left;font-family:inherit;transition:all .2s">${m.icon} ${m.name}</button>`).join('')}
        </div>
      </div>
      <div>
        <p style="font-weight:700;margin:0 0 10px;font-size:13px">② 選擇螺絲規格</p>
        <div style="display:flex;flex-direction:column;gap:6px" id="torq-screw-btns">
          ${SCREWS.map(s => `<button data-screw="${s.id}" style="padding:9px 12px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-size:13px;text-align:left;font-family:inherit;transition:all .2s">${s.name}</button>`).join('')}
        </div>
      </div>
    </div>
    <div id="torque-result" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px;text-align:center;min-height:90px">
      <p style="color:#94a3b8;margin:8px 0">👆 選擇材料與螺絲後即可看到建議刻度</p>
    </div>`;

  const seqSec = document.querySelector('#seq-puzzle')?.closest('section') || document.querySelector('.module-nav-bottom');
  if (seqSec && seqSec.parentNode) seqSec.parentNode.insertBefore(sec, seqSec);

  function calcTorque() {
    if (!selMat || !selScrew) return;
    const mat = MATERIALS.find(m => m.id === selMat);
    const screw = SCREWS.find(s => s.id === selScrew);
    const isDrill = mat.id === 'drill';
    let low = isDrill ? 21 : Math.max(1, mat.range[0] + screw.mod);
    let high = isDrill ? 21 : Math.min(20, mat.range[1] + screw.mod);
    const rangeLabel = isDrill ? '⊕ 鑽頭符號' : `${low}–${high}`;
    // Needle angle: map 1-21 to -130° to +130°
    const mid = isDrill ? 20 : (low + high) / 2;
    const angle = -130 + (mid / 21) * 260;
    const rad = angle * Math.PI / 180;
    const nx = (60 + 28 * Math.sin(rad)).toFixed(1);
    const ny = (60 - 28 * Math.cos(rad)).toFixed(1);
    document.getElementById('torque-result').innerHTML = `
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center">
        <svg viewBox="0 0 120 90" style="width:110px;height:85px;flex-shrink:0">
          <circle cx="60" cy="60" r="52" fill="#1e293b"/>
          <circle cx="60" cy="60" r="45" fill="#fef3c7" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="60" cy="60" r="28" fill="#1e293b"/>
          <g font-size="8" font-weight="700" fill="#92400e" font-family="Inter">
            <text x="60" y="20" text-anchor="middle">10</text>
            <text x="100" y="64" text-anchor="middle">5</text>
            <text x="20" y="64" text-anchor="middle">15</text>
            <text x="60" y="105" text-anchor="middle">1</text>
            <text x="108" y="64" text-anchor="middle" fill="#fff">⊕</text>
          </g>
          <line x1="60" y1="60" x2="${nx}" y2="${ny}" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="60" r="5" fill="#dc2626"/>
        </svg>
        <div style="text-align:left;max-width:220px">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b">建議扭力環刻度</p>
          <p style="margin:0 0 10px;font-size:${isDrill?'18':'26'}px;font-weight:900;color:var(--accent,#7C3AED)">${rangeLabel}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#64748b">${mat.icon} ${mat.name} × ${screw.name}</p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.5">${mat.note}</p>
        </div>
      </div>`;
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  }

  document.getElementById('torq-mat-btns').querySelectorAll('[data-mat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('torq-mat-btns').querySelectorAll('[data-mat]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; });
      btn.style.background = 'var(--accent-light,#ede9fe)'; btn.style.borderColor = 'var(--accent,#7C3AED)';
      selMat = btn.dataset.mat; calcTorque();
    });
  });
  document.getElementById('torq-screw-btns').querySelectorAll('[data-screw]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('torq-screw-btns').querySelectorAll('[data-screw]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; });
      btn.style.background = 'var(--accent-light,#ede9fe)'; btn.style.borderColor = 'var(--accent,#7C3AED)';
      selScrew = btn.dataset.screw; calcTorque();
    });
  });
})();

// 排序拼圖
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
