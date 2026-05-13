// 三視圖 模組 5：判讀挑戰
const QUIZ = [
  { hint: '正視 = 正方形 ・ 俯視 = 正方形 ・ 側視 = 正方形', ans: '立方體', options: ['立方體', '長方體', '圓柱', '圓錐'], explain: '三個視圖都是相同正方形 → 立方體（六面相等）。' },
  { hint: '正視 = 矩形 ・ 俯視 = 圓形 ・ 側視 = 矩形', ans: '圓柱', options: ['圓柱', '球', '圓錐', '立方體'], explain: '俯視是圓 + 側視矩形 = 圓柱。圓錐俯視也是圓但側視會是三角形。' },
  { hint: '正視 = 三角形 ・ 俯視 = 圓形 + 中心點 ・ 側視 = 三角形', ans: '圓錐', options: ['圓錐', '圓柱', '金字塔', '球'], explain: '俯視中心點 = 圓錐的尖端。三角形側視 = 從側面看圓錐的輪廓。' },
  { hint: '正視 = 圓形 ・ 俯視 = 圓形 ・ 側視 = 圓形', ans: '球', options: ['球', '圓柱', '立方體', '圓錐'], explain: '三視圖都是相同圓形 = 球體（每個方向看都一樣）。' },
  { hint: '正視 = L 形 ・ 俯視 = 矩形 ・ 側視 = 矩形', ans: 'L 型塊', options: ['L 型塊', '階梯塊', '長方體', '凹槽塊'], explain: 'L 形正視 + 矩形俯視 = 標準 L 型塊。階梯塊俯視也會看到階梯線。' },
  { hint: '正視 = 矩形含「兩條虛線」 ・ 俯視 = 矩形含「圓」 ・ 側視 = 矩形含「兩條虛線」', ans: '帶圓孔的板', options: ['帶圓孔的板', '帶方孔的板', '兩個方塊', '半圓板'], explain: '兩個視圖虛線 + 一個視圖圓 = 「貫穿孔」的圓板。虛線代表看不見的孔壁。' },
  { hint: '正視 = T 形 ・ 俯視 = T 形 ・ 側視 = T 形', ans: '十字形塊', options: ['十字形塊', 'T 型塊', '正方形塊', '凸字塊'], explain: '三個視圖都 T 形 → 三個方向都有突出 = 十字形塊。' },
  { hint: '正視 = 矩形 + 內部弧形虛線 ・ 俯視 = 矩形 + 半圓 ・ 側視 = 矩形', ans: '半圓凹槽塊', options: ['半圓凹槽塊', '帶圓孔塊', '凹槽塊', '半圓柱'], explain: '俯視半圓 + 內部虛線弧 = 從上面挖的半圓凹槽。常見於滑軌、機械零件。' },
];

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const quizEl = document.getElementById('quiz');
const progEl = document.getElementById('prog');
let answered = new Set(); let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;border-left:5px solid #4F46E5';
  div.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="background:#4F46E5;color:#fff;padding:4px 10px;border-radius:6px;font-weight:700;font-size:13px">題 ${i + 1}</span></div>
    <p style="font-size:14px;color:#3730A3;background:#E0E7FF;padding:10px;border-radius:8px;margin-bottom:10px"><strong>線索：</strong>${q.hint}</p>
    <p style="font-size:13.5px;color:#444;margin-bottom:6px">這是什麼 3D 物件？</p>
    <div class="choice-grid" style="grid-template-columns:repeat(4,1fr)">${q.options.map(o => `<button class="choice" data-q="${i}" data-c="${o}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('div');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:8px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module5 = true; p.module5_score = correct; saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
