// 手電鑽 模組 5：故障圖鑑
const FAULTS = [
  {
    name: '過熱燒孔（Burnt Hole）',
    symptom: '孔壁焦黑、冒煙、有焦味，木材變色一圈。',
    cause: '轉速太高 + 進刀太慢 + 鑽頭鈍了。摩擦熱無法被木屑帶走。',
    fix: '1. 降低轉速（木材其實不用 2000 RPM，800–1500 即可）\n2. 增加進刀力（讓鑽頭「切」而不是「磨」）\n3. 換新鑽頭\n4. 每鑽 5–10mm 退鑽排屑',
    icon: '🔥',
    color: '#dc2626',
  },
  {
    name: '偏鑽（Bit Wander）',
    symptom: '孔位偏離畫好的十字標記，常見鑽歪一邊或起鑽就打滑。',
    cause: '起鑽時沒「點壓」直接全速、鑽頭沒對準、表面太硬太滑沒有預先打點。',
    fix: '1. 金屬鑽孔前用「中心衝」敲一個小凹點\n2. 起鑽時 10–20% 轉速、輕點壓讓鑽頭咬入\n3. 確認鑽頭與工件 90° 垂直\n4. 鑽頭尖確認沒磨損',
    icon: '↗',
    color: '#eab308',
  },
  {
    name: '卡鑽（Bit Bind）',
    symptom: '鑽頭突然停轉、手電鑽身體被「翻轉」甩動，鑽頭可能被夾住拔不出來。',
    cause: '進刀太猛、鐵屑塞滿螺旋槽、深孔沒退屑、單手操作無法穩住反作用力。',
    fix: '1. 立刻鬆開扳機停止\n2. 切到反轉（REV）慢速退出\n3. 每鑽 5–10mm 退鑽一次排屑\n4. 雙手握持讓身體吸收反作用力',
    icon: '⛔',
    color: '#7f1d1d',
  },
  {
    name: '木材毛邊（Splintering）',
    symptom: '鑽穿後底面有大片碎裂、毛邊翹起。',
    cause: '鑽穿瞬間支撐不足、底面沒墊廢板、進刀力太大。',
    fix: '1. 工件下方墊一塊「廢板」當犧牲層\n2. 鑽穿前最後 1–2mm 減小進刀力\n3. 改從正反兩面分別鑽到一半交會\n4. 用「Brad Point」尖頭木工鑽',
    icon: '🪵',
    color: '#a16207',
  },
  {
    name: '金屬毛邊（Burr）',
    symptom: '鑽穿金屬後孔緣有翻起的毛刺，徒手摸會割傷。',
    cause: '高速鋼鑽頭推穿瞬間扯起金屬。鑽完通常都會有。',
    fix: '1. 用 90° 倒角刀 countersink 或去毛刺刀（deburring tool）修整孔緣（首選）\n2. 沒有專用刀具時可用精細銼刀手動修角\n3. ⚠ 不建議用「大一號鑽頭代替倒角刀」——容易把孔徑擴大或產生新毛刺（業界僅在臨時情境用）\n4. 鑽鋁時加切削油從源頭減少毛邊',
    icon: '✂',
    color: '#94a3b8',
  },
  {
    name: '鑽頭斷裂（Bit Break）',
    symptom: '鑽頭從中段斷掉，部分卡在工件內取不出。',
    cause: '進刀過猛 + 卡鑽硬撐、鑽小直徑（<3mm）施力過大、低品質鑽頭。',
    fix: '1. 小直徑鑽頭要更輕進刀（重量自然下壓即可）\n2. 卡鑽時不要硬鑽，立刻反轉退出\n3. 卡在工件內的可用「斷鑽取出器」或反向鑽頭\n4. 換品質好的鑽頭（CO/Co鈷鋼或鈦塗層）',
    icon: '💥',
    color: '#991b1b',
  },
  {
    name: '孔徑過大（Oversized Hole）',
    symptom: '孔比鑽頭直徑大、孔壁不平整。',
    cause: '鑽頭沒鎖緊、起鑽時手電鑽晃動、鑽頭已彎曲。',
    fix: '1. 夾頭轉緊到聽見「咔咔咔」棘輪聲\n2. 雙手穩定握持，鑽頭與工件垂直\n3. 檢查鑽頭直線度（在玻璃上滾動看搖晃）\n4. 嚴重彎曲的鑽頭直接淘汰',
    icon: '⭕',
    color: '#0891b2',
  },
  {
    name: '燒鑽頭（Bit Tempering）',
    symptom: '鑽頭尖端變藍黑色，鑽不下去也回不去。',
    cause: '鑽金屬時轉速太高、沒加切削油（cooling lubricant）、連續鑽不退屑。',
    fix: '1. 鑽不鏽鋼：轉速降到 300–600 RPM\n2. 加切削油（machine cutting oil）或工程用機油\n3. 鑽 3–5mm 就退鑽散熱\n4. 燒過的鑽頭硬度永久下降，建議淘汰',
    icon: '🌡',
    color: '#dc2626',
  },
];

const PK = 'drill_progress_v1';
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
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:${f.color}">查看排除方法 →</summary>
      <pre style="white-space:pre-wrap;font-size:12.5px;color:#444;margin-top:6px;font-family:inherit;line-height:1.7">${f.fix}</pre>
    </details>`;
  grid.appendChild(card);
});

// 互動診斷小測驗
const QUIZ_CASES = [
  {
    visual: `<svg viewBox="0 0 120 100"><rect x="10" y="40" width="100" height="40" fill="#a16207"/><ellipse cx="60" cy="60" rx="14" ry="4" fill="#1e293b"/><circle cx="60" cy="60" r="22" fill="rgba(0,0,0,.4)"/><text x="60" y="90" text-anchor="middle" font-size="8" fill="#444">A: 木材表面孔周一圈焦黑</text></svg>`,
    options: ['過熱燒孔', '偏鑽', '毛邊'],
    correct: 0,
    explain: '焦黑一圈 = 過熱燒孔。轉速太高 + 進刀太慢的典型症狀。要降速、增加進刀、換新鑽頭。',
  },
  {
    visual: `<svg viewBox="0 0 120 100"><rect x="10" y="40" width="100" height="40" fill="#9ca3af"/><ellipse cx="80" cy="60" rx="12" ry="4" fill="#000"/><line x1="40" y1="60" x2="68" y2="60" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 2"/><text x="40" y="60" font-size="8" fill="#dc2626">↑原本目標</text><text x="60" y="92" text-anchor="middle" font-size="8" fill="#444">B: 金屬孔位偏離標記 8mm</text></svg>`,
    options: ['燒鑽頭', '孔徑過大', '偏鑽'],
    correct: 2,
    explain: '位置偏離鉛筆標記 = 偏鑽。起鑽時沒打中心衝、起鑽轉速太高、鑽頭沒對準 90° 都會造成。',
  },
  {
    visual: `<svg viewBox="0 0 120 100"><rect x="10" y="40" width="100" height="40" fill="#a16207"/><ellipse cx="60" cy="60" rx="12" ry="4" fill="#1e293b"/><g fill="#92400e"><path d="M 48 80 L 52 88 L 56 82 Z"/><path d="M 60 80 L 64 90 L 68 82 Z"/><path d="M 72 80 L 76 86 L 78 80 Z"/></g><text x="60" y="98" text-anchor="middle" font-size="8" fill="#444">C: 木材底面大片碎裂翹起</text></svg>`,
    options: ['卡鑽', '毛邊（底面爆裂）', '孔徑過大'],
    correct: 1,
    explain: '鑽穿瞬間底面碎裂 = 毛邊。要在工件下方墊「廢板」當犧牲層，或從正反兩面分別鑽到一半。',
  },
  {
    visual: `<svg viewBox="0 0 120 100"><rect x="10" y="40" width="100" height="40" fill="#475569"/><ellipse cx="60" cy="60" rx="12" ry="4" fill="#000"/><rect x="50" y="44" width="20" height="6" fill="#1e3a8a"/><circle cx="60" cy="47" r="6" fill="#1e3a8a"/><text x="60" y="95" text-anchor="middle" font-size="8" fill="#444">D: 不鏽鋼鑽頭尖變藍黑色</text></svg>`,
    options: ['過熱燒孔', '鑽頭斷裂', '燒鑽頭'],
    correct: 2,
    explain: '鑽頭尖變藍黑色 = 燒鑽頭（tempering）。鑽不鏽鋼轉速要降到 300–600 RPM 並加切削油。燒過的鑽頭硬度永久下降，建議淘汰。',
  },
  {
    visual: `<svg viewBox="0 0 120 100"><rect x="10" y="40" width="100" height="40" fill="#a16207"/><circle cx="60" cy="60" r="18" fill="#000"/><text x="60" y="60" text-anchor="middle" font-size="20">⛔</text><text x="60" y="92" text-anchor="middle" font-size="8" fill="#444">E: 鑽頭卡住、手電鑽身體被翻轉</text></svg>`,
    options: ['毛邊', '卡鑽', '偏鑽'],
    correct: 1,
    explain: '鑽頭被夾住 + 工具反向旋轉 = 卡鑽。立即鬆開扳機 → 切反轉 → 退出。下次要更頻繁退屑、減小進刀力、雙手握持。',
  },
];

const quizEl = document.getElementById('calib-quiz');
let quizScore = 0;
let answered = new Set();
QUIZ_CASES.forEach((c, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <div style="display:flex;gap:14px;align-items:center">
      <div style="width:120px;flex-shrink:0">${c.visual}</div>
      <div style="flex:1">
        <p style="font-size:13px;color:#666;margin-bottom:6px"><strong>案例 ${i + 1}：</strong>哪一種故障？</p>
        <div class="choice-grid">${c.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
        <div class="feedback-slot"></div>
      </div>
    </div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  const c = parseInt(btn.dataset.c);
  if (answered.has(i)) return;
  const correct = c === QUIZ_CASES[i].correct;
  const parent = btn.closest('.scenario, div');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ_CASES[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ_CASES[i].explain}</div>`;
  if (correct) {
    quizScore++;
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.error();
  }
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
