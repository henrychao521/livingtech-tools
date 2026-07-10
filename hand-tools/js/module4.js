// 基本手工具 模組 4：任務選工具
// 設計原則：選項不在標籤中暴露答案（移除「依 AWG 規格」「4mm」「對的尺寸」等提示詞）；
// 每題答案搭配 explain 解釋為什麼其他選項不適合。
// 來源編號對應 hand-tools 頁尾「資料來源」區。
const QUIZ = [
  { task: '把鐵釘從木板上拔出來', icon: '⚒',
    ans: '羊角錘',
    options: ['羊角錘', '橡膠槌', '尖嘴鉗', '一字螺絲起子'],
    explain: '只有「羊角錘」的爪部設計可以卡住釘頭往後一壓拔出，是這個任務的標準工具。橡膠槌只能敲、沒有爪；尖嘴鉗夾力與槓桿不足；用一字起子當槓桿撬釘會傷及刀頭與木材表面。',
    cite: '[1]' },

  { task: '鎖一顆十字（Phillips）螺絲', icon: '🪛',
    ans: '十字螺絲起子',
    options: ['一字螺絲起子', '十字螺絲起子', '六角扳手', '尖嘴鉗'],
    explain: '十字螺絲必須用十字起子，並依螺絲頭的「凹槽尺寸」選 PH0–PH3（一般電器類最常見 PH2）。一字起子勉強塞進十字螺絲會崩牙；六角扳手與鉗類不適用十字頭。',
    cite: '[1][7]' },

  { task: '在 0.5 mm 鋁板上切出形狀', icon: '✂',
    ans: '鋼鋸 / 金工剪',
    options: ['線鋸', '鋼鋸 / 金工剪', '美工刀', '鎚子'],
    explain: '0.5 mm 鋁板薄而韌，鋼鋸或金工剪都可以。線鋸主要用於木材（鋸條間距與齒形不適合金屬）；美工刀切不動金屬；鎚子無法用於切割。',
    cite: '[1][3]' },

  { task: '把金屬零件的孔徑稍微擴大 0.5 mm', icon: '🪒',
    ans: '圓銼刀',
    options: ['平銼刀', '半圓銼刀', '圓銼刀', '三角銼刀'],
    explain: '圓形孔擴孔要用「圓銼刀」——形狀貼合孔壁、孔形不變。平銼與三角銼會把孔銼出角度；半圓銼只適合大圓弧內側修整。',
    cite: '[4]' },

  { task: '剝開電線外皮（不傷銅線）', icon: '🔌',
    ans: '剝線鉗',
    options: ['尖嘴鉗', '剝線鉗', '美工刀', '斜口鉗'],
    explain: '剝線鉗有依電線線徑（AWG / mm²）對應的剝線孔——能夾住外皮而不切到銅線。用美工刀或斜口鉗剝皮容易切到銅、降低導電性與機械強度；尖嘴鉗則沒有剝皮專用刃口。',
    cite: '[1][2]' },

  { task: '鎖一顆 M6 內六角螺絲', icon: '🔧',
    ans: '六角扳手',
    options: ['一字螺絲起子', '六角扳手', '活動扳手', '梅花扳手'],
    explain: '「內六角」螺絲頭凹槽是六角形，必須用六角扳手（Allen key）；尺寸依螺絲規格選 — M6 一般對應 5 mm（M5 對應 4 mm，ISO 4762）。一字起子與外側扳手無法咬合內六角凹槽。',
    cite: '[1][7]' },

  { task: '量測一個小金屬塊外徑 12.5 mm 是否符合圖面', icon: '📏',
    ans: '游標卡尺',
    options: ['直尺', '捲尺', '游標卡尺', '角尺'],
    explain: '0.1 mm 級的尺寸需要游標卡尺（解析度可達 0.02 mm）。直尺最小刻度通常為 1 mm，誤差過大；捲尺更粗；角尺只能量直角。',
    cite: '[2]' },

  { task: '在木板畫好的線上精準切割直線', icon: '🪚',
    ans: '夾背鋸',
    options: ['線鋸', '夾背鋸', '鋼鋸', '美工刀'],
    explain: '夾背鋸（back saw）背部加了金屬條防止鋸條彎曲，切直線最穩定。線鋸用於曲線；鋼鋸主要用於金屬，齒形不適合精細木工直線。',
    cite: '[1][3]' },

  { task: '用美工刀切割厚紙板', icon: '🔪',
    ans: '美工刀 + 鋼尺 + 切割墊',
    options: ['只用美工刀（徒手扶紙）', '美工刀 + 鋼尺 + 切割墊', '剪刀', '雕刻刀'],
    explain: '厚紙板要直線、要安全、要保護桌面：鋼尺壓住確保直線、切割墊保護桌面與延長刀片壽命、利刃才好切。三件套缺一不可——徒手扶紙最常被滑刀割傷。',
    cite: '[2]' },

  { task: '把一塊 30 mm 小金屬零件牢牢固定，準備銼修', icon: '🧷',
    ans: '檯虎鉗（bench vise）',
    options: ['C 型夾夾在桌邊', '檯虎鉗（bench vise）', '尖嘴鉗手持', '徒手按住'],
    explain: '小金屬件銼修需要極穩、且工件高度要適合站姿——檯虎鉗鎖在工作台正面、夾力大、有高度，是這個任務的標準解。C 型夾可用但夾在桌邊高度過低、工件凸出易碰膝。鉗子與徒手皆無法承受銼修力。',
    cite: '[2][8]' },
];

const PK = 'ht_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const quizEl = document.getElementById('quiz');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
let answered = new Set(); let correct = 0;

QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:8px"><span style="font-size:24px">${q.icon}</span> <strong>任務 ${i + 1}：</strong>${q.task}</p>
    <div class="choice-grid" style="grid-template-columns:1fr 1fr">${q.options.map(o => `<button class="choice" data-q="${i}" data-c="${o}" style="text-align:left;font-size:12.5px">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('div');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}<br><span style="font-size:11px;color:#94a3b8">📚 參考：${QUIZ[i].cite}（見頁尾資料來源）</span></div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module4 = true; p.module4_score = correct; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
