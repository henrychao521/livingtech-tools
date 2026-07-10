// 鑽床 模組 5：事故圖鑑
const FAULTS = [
  { name: '夾頭鑰匙甩飛（Chuck Key Ejection）', symptom: '開機瞬間鑰匙以高速飛出，可能擊中眼睛、臉部或周圍同學。', cause: '裝完鑽頭後沒拔下夾頭鑰匙就開機。', fix: '養成肌肉記憶：「鎖完馬上拔」。多數新款鑽床有「彈簧式自彈出鑰匙」設計強制提醒。', icon: '🗝', color: '#dc2626' },
  { name: '工件飛起（Workpiece Ejection）', symptom: '鑽孔中工件被鑽頭咬住高速旋轉，從工作台飛出傷人。', cause: '工件沒固定（徒手按）、小工件用手按、夾具沒鎖緊。', fix: '所有工件必須用機台老虎鉗或 C 型夾固定到工作台。小工件特別容易被甩飛。', icon: '✈', color: '#dc2626' },
  { name: '鑽頭斷裂（Bit Breakage）', symptom: '鑽頭斷成兩半，部分卡在工件內取不出。', cause: '進刀過猛 + 卡屑硬撐、轉速不對、鑽頭已彎曲或鈍。', fix: '進刀力要均勻、深孔頻繁退屑（pecking）、定期檢查鑽頭直線度、太硬材料減速。', icon: '💥', color: '#991b1b' },
  { name: '過熱燒孔（Burnt Hole）', symptom: '孔壁焦黑、冒煙、有焦味。', cause: '轉速太高（鑽鋼用高速）、沒退屑、進刀太慢只摩擦不切削。', fix: '依材料設定轉速：鋼用低速 + 切削油、木用高速。每鑽 5mm 退屑。', icon: '🔥', color: '#dc2626' },
  { name: '偏鑽（Bit Walk）', symptom: '孔位偏離標記、孔形成橢圓而非圓形。', cause: '工件沒平放（下方有屑）、鑽頭沒對準鉛筆十字、皮帶鬆動造成主軸搖晃。', fix: '工件下方清乾淨再放、起鑽前用中心衝打點、定期檢查皮帶張力。', icon: '↗', color: '#eab308' },
  { name: '鑽穿工作台（Table Damage）', symptom: '鑽穿工件後鑽頭直接打到工作台，留下永久傷痕。', cause: '工件下方沒墊犧牲層、進刀深度沒設限位。', fix: '永遠在工件下墊「廢木板」、用「進刀深度限位環」設定鑽到工件厚度 +2mm 自動停。', icon: '🪛', color: '#a16207' },
  { name: '皮帶打滑（Belt Slip）', symptom: '主軸轉速突然下降、聞到橡膠焦味、皮帶箱發出尖叫聲。', cause: '皮帶鬆動、進刀太猛超出皮帶傳力、皮帶磨損。', fix: '停機 → 等冷卻 → 打開皮帶箱檢查張力（壓 1cm 是正常）→ 必要時更換皮帶。', icon: '⚙', color: '#eab308' },
  { name: '夾頭沒鎖緊（Chuck Loose）', symptom: '鑽頭在夾頭中甩動、孔徑變大、鑽頭可能飛出。', cause: '只鎖了夾頭三個齒輪孔之一、鑽頭沒插到底、鑽頭柄沾油滑動。', fix: '三個齒輪孔都要用鑰匙鎖一遍，平均施力。安裝前清潔鑽頭柄。鎖完搖一搖確認不晃動。', icon: '⭕', color: '#0891b2' },
];

const PK = 'dpress_progress_v1';
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
  { situation: '同學裝完鑽頭、按下開關，「咚！」鑰匙以高速彈飛擦過耳邊。', options: ['夾頭鑰匙甩飛', '鑽頭飛出', '皮帶打滑'], correct: 0, explain: '鑰匙甩飛——鑽床第一守則：開機前必拔下夾頭鑰匙。' },
  { situation: '鑽小金屬片時老師沒注意，學生用左手按住工件。鑽下去後工件突然旋轉飛起。', options: ['偏鑽', '工件飛起', '鑽穿桌面'], correct: 1, explain: '工件飛起——小工件絕對不能徒手按，必須用機台老虎鉗。' },
  { situation: '鑽 8mm 不鏽鋼，學生看皮帶在最高速段位，鑽下去後孔周冒煙、有焦味。', options: ['鑽頭斷裂', '皮帶打滑', '過熱燒孔'], correct: 2, explain: '過熱燒孔——鋼要用最低速 + 切削油，學生用了最高速。' },
  { situation: '鑽完 5mm 木板後鑽頭繼續下降，工作台多了一道凹痕。', options: ['偏鑽', '鑽穿桌面', '鑽頭斷裂'], correct: 1, explain: '鑽穿桌面——工件下方沒墊犧牲層、進刀深度沒設限位環。' },
  { situation: '深孔鑽到一半，鑽頭突然「啪」一聲斷成兩半，半截卡在工件內。', options: ['夾頭沒鎖緊', '鑽頭斷裂', '皮帶打滑'], correct: 1, explain: '鑽頭斷裂——進刀太猛、沒退屑、鑽頭已鈍。深孔每 5mm 要退鑽一次排屑。' },
  { situation: '在 P1 最低速鑽厚鋼板，同學進刀太猛，忽然聽到皮帶箱發出刺耳的尖叫聲，主軸轉速明顯下降。', options: ['偏鑽', '皮帶打滑', '過熱燒孔'], correct: 1, explain: '皮帶打滑——進刀力超過皮帶的摩擦傳力極限，皮帶在皮帶輪上打滑，產生尖叫聲。應停機 → 等冷卻 → 檢查皮帶張力。進刀必須均勻輕緩，讓鑽頭自己切。' },
  { situation: '要在光滑的不鏽鋼板上鑽孔，學生沒有先打中心衝就直接下鑽。鑽頭起鑽時在金屬表面滑動了 3mm，最終孔位偏移目標。', options: ['夾頭沒鎖緊', '鑽穿桌面', '偏鑽（Bit Walk）'], correct: 2, explain: '偏鑽（Bit Walk）——光滑金屬面對鑽尖沒有阻力，起鑽時鑽頭會在表面滑行。鑽金屬前必須先用中心衝（Center Punch）在標記點敲一個小凹點，鑽尖才有定位點。' },
  { situation: '裝完 10mm 鑽頭後，同學只用夾頭鑰匙轉了一個齒輪孔就開始鑽孔。鑽孔過程中發現孔徑變大，鑽頭在夾頭中出現甩動。', options: ['鑽頭斷裂', '夾頭沒鎖緊', '工件飛起'], correct: 1, explain: '夾頭沒鎖緊——鑰匙式夾頭有三個齒輪孔（三爪各一個），每個孔都要轉鎖一遍才能讓三爪平均施力夾緊鑽頭。只鎖一個孔會讓鑽頭偏心甩動，孔變大、精度差，嚴重時鑽頭飛出。' },
];

const quizEl = document.getElementById('calib-quiz');
let quizScore = 0;
let answered = new Set();
QUIZ_CASES.forEach((c, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
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
  const parent = btn.closest('.quiz-item');
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
