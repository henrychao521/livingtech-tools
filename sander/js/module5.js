// 砂磨機 模組 5：故障圖鑑
const FAULTS = [
  { name: '燒焦痕（Burn Mark）', symptom: '工件表面出現黑色或褐色斑點，伴隨焦味。', cause: '工件停在砂帶某一點 > 2 秒，摩擦熱無法散去。粒度太細也容易燒焦（散熱差）。', fix: '1. 保持工件持續移動，不固定一點\n2. 加快進料速度\n3. 換較粗粒度\n4. 砂帶用久會變鈍，散熱差—換新砂帶', icon: '🔥', color: '#dc2626' },
  { name: '不均勻（Uneven Surface）', symptom: '工件表面有些地方很光滑、有些地方還很粗糙。', cause: '施力不均、工件沒平貼靠尺、移動速度時快時慢。', fix: '1. 用平穩的速度橫向移動工件\n2. 工件後緣平貼靠尺\n3. 大工件用兩手平均施力\n4. 用粉筆畫格子，磨到全部消失再進下一步', icon: '〰', color: '#eab308' },
  { name: '砂帶斷裂（Belt Break）', symptom: '砂帶突然「啪」一聲斷成兩段，從機台飛出。', cause: '張力過大、進料太猛超過砂帶承受力、砂帶有原始裂痕沒檢查。', fix: '1. 換砂帶時校正張力（按下中央約 5mm 為適中）\n2. 進料力均勻，不要重壓\n3. 安裝前檢查砂帶內側有無裂痕\n4. 砂帶有箭頭，方向必須對齊', icon: '✂', color: '#991b1b' },
  { name: '邊角磨圓（Rounded Edge）', symptom: '本來方方正正的工件，邊角被磨成圓弧形。', cause: '工件沒平貼靠尺、傾斜接觸砂帶、邊緣施力過大。', fix: '1. 工件後緣必須抵著靠尺\n2. 磨邊緣時要把工件抬起（不要在邊緣停留）\n3. 想要直角時用「平面磨」方式來回平移\n4. 想要圓角時才特意傾斜', icon: '⚪', color: '#eab308' },
  { name: '深紋未消（Deep Scratches）', symptom: '用 240 號磨完，表面還有像 80 號留下的深刻劃痕。', cause: '粒度跳級——從 80 號直接跳到 240 號，沒經過 120、180。粗粒留下的深紋細粒磨不掉。', fix: '1. 粒度循序漸進：60→80→120→180→240→320\n2. 每一級磨到看不到上一級的痕跡再進下一級\n3. 用斜光照射檢查表面紋路', icon: '〰', color: '#0891b2' },
  { name: '粉塵爆炸（Dust Explosion）', symptom: '砂磨房間發生爆炸或閃燃，可能造成人員受傷與設備損毀。', cause: '木屑粉達 40g/m³ 濃度遇火源（電火花、靜電、馬達電刷）。沒接集塵 + 通風不良 + 點火源。', fix: '1. 砂磨機必須接集塵器，這是強制要求\n2. 工坊保持通風\n3. 定期清掃地面與機台粉塵\n4. 工坊內禁火、禁吸菸\n5. 馬達使用「防爆型」（IECEx / ATEX 認證）', icon: '💥', color: '#dc2626' },
  { name: '塑料熔融（Plastic Melting）', symptom: '砂磨塑料時表面變黏、冒煙、聞到刺鼻味，砂帶被塑料糊住。', cause: '塑料熔點低（PVC 約 100°C，ABS 約 220°C），砂磨摩擦熱輕易達到。粒度太細也容易積熱。', fix: '1. 塑料用較粗粒度（120–180）短時間磨\n2. 加快進料速度\n3. 改用銼刀或刨刀處理\n4. PVC/ABS 高溫釋有毒氣，聞到味道立刻停', icon: '🌡', color: '#dc2626' },
  { name: '砂帶飛出（Belt Slip-off）', symptom: '砂帶從前後滾輪脫落，可能甩出機台外。', cause: '張力太鬆、砂帶尺寸不對、滾輪平行度跑掉。', fix: '1. 換完砂帶必校正張力\n2. 確認砂帶長度與寬度符合機台規格\n3. 慢速空轉觀察砂帶有沒有偏移，必要時調整追蹤旋鈕（tracking knob）\n4. 砂帶飛出時立刻拍緊急停止', icon: '✈', color: '#a16207' },
];

const PK = 'sander_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('error-grid');
FAULTS.forEach((f, i) => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px;border-left:5px solid ${f.color}`;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:28px">${f.icon}</span>
      <h4 style="margin:0;font-size:16px;color:${f.color}">${f.name}</h4>
    </div>
    <p style="font-size:13px;color:#444;margin:6px 0"><strong>症狀：</strong>${f.symptom}</p>
    <p style="font-size:13px;color:#666;margin:6px 0"><strong>原因：</strong>${f.cause}</p>
    <details style="margin-top:8px">
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:${f.color}">查看預防方法 →</summary>
      <pre style="white-space:pre-wrap;font-size:12.5px;color:#444;margin-top:6px;font-family:inherit;line-height:1.7">${f.fix}</pre>
    </details>`;
  grid.appendChild(card);
});

const QUIZ_CASES = [
  { situation: '同學用 80 號粗砂帶磨完木板，立刻換 240 號磨，但表面還是有深紋。', options: ['粒度跳級', '燒焦痕', '邊角磨圓'], correct: 0, explain: '粒度跳級。從 80 號直接跳到 240 號，中間沒經過 120、180——細砂磨不掉粗砂留下的深紋。正確順序：80 → 120 → 180 → 240。' },
  { situation: '木板磨到中段時，工件表面突然出現一塊黑色斑點，聞到焦味。', options: ['粉塵爆炸', '燒焦痕', '塑料熔融'], correct: 1, explain: '燒焦痕。工件在砂帶某一點停留太久，摩擦熱無法散去。要保持持續移動、加快進料速度。' },
  { situation: '正在砂磨，砂帶突然「啪」一聲斷成兩段飛出，差點打到隔壁同學。', options: ['砂帶飛出', '砂帶斷裂', '邊角磨圓'], correct: 1, explain: '砂帶斷裂。張力過大、進料太猛、砂帶有原始裂痕都會造成。換砂帶時要校正張力，安裝前檢查裂痕。' },
  { situation: '砂磨 PVC 塑料邊緣時，表面變黏、冒煙、有刺鼻味。', options: ['燒焦痕', '不均勻', '塑料熔融'], correct: 2, explain: '塑料熔融。PVC 受熱會釋放氯化氫毒氣。立刻停機、開窗通風、戴口罩離開現場。塑料用較粗粒度短時間磨。' },
  { situation: '工件磨完後本來該是直角的邊緣變成圓弧形。', options: ['燒焦痕', '深紋未消', '邊角磨圓'], correct: 2, explain: '邊角磨圓。工件沒平貼靠尺、邊緣施力過大造成。磨邊緣時要把工件抬起，不要在邊緣停留；想保直角用平移方式磨。' },
  { situation: '同學用 60 號砂帶磨完木板後，跳過 120、180，直接換 240 號磨，但工件表面還是有像被粗砂抓過的深刻痕跡。', options: ['砂帶飛出', '深紋未消', '邊角磨圓'], correct: 1, explain: '深紋未消。粒度跳級——60 號粗粒留下的深痕，240 號細粒根本磨不到。正確順序：60 → 80 → 120 → 180 → 240，每一級要磨到看不到上一級的紋路才換下一級。' },
  { situation: '砂磨木板時，同學把工件固定在砂帶某一點持續施壓，約 3 秒後表面出現棕黑色焦斑，聞到焦味。', options: ['不均勻', '燒焦痕', '塑料熔融'], correct: 1, explain: '燒焦痕。工件固定停留超過 2 秒，摩擦熱無法散去直接燒焦木材。砂磨時工件必須持續橫向移動，讓熱量分散在整個工件面。' },
  { situation: '使用隨機軌道式砂磨機時，同學在木板同一個圓形區域靜止了約 4 秒，之後發現那個區域出現圓弧刮痕和焦黑點。', options: ['邊角磨圓', '砂帶斷裂', '過熱燒焦（靜止過久）'], correct: 2, explain: '過熱燒焦。隨機軌道式砂盤有自轉+公轉雙軌跡，靜止超過 2–3 秒，高速旋轉的砂盤會在同一區域反覆刻出圓弧刮痕並燒焦木材。操作時必須持續移動砂盤。' },
];

const quizEl = document.getElementById('calib-quiz');
let quizScore = 0;
let answered = new Set();
QUIZ_CASES.forEach((c, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;color:#444;margin-bottom:6px"><strong>情境 ${i + 1}：</strong>${c.situation}</p>
    <div class="choice-grid">${c.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  const c = parseInt(btn.dataset.c);
  if (answered.has(i)) return;
  const correct = c === QUIZ_CASES[i].correct;
  const parent = btn.closest('div');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ_CASES[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ_CASES[i].explain}</div>`;
  if (correct) { quizScore++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ_CASES.length) {
    const p = loadP();
    p.module5 = true;
    p.module5_quiz_score = quizScore;
    saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成診斷！${quizScore} / ${QUIZ_CASES.length} 答對`, 'good');
  }
}));
