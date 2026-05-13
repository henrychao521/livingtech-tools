// 基本手工具 模組 4：任務選工具
const QUIZ = [
  { task: '把鐵釘從木板上拔出來', icon: '⚒', ans: '羊角錘', options: ['羊角錘', '橡膠錘', '釘鎚', '銅鎚'], explain: '羊角錘的「羊角」（爪部）就是設計來拔釘用的——卡住釘頭往後一壓就拔出。其他鎚子沒有爪部。' },
  { task: '鎖一顆十字（Phillips）螺絲', icon: '🪛', ans: '十字螺絲起子（對的尺寸）', options: ['一字螺絲起子', '十字螺絲起子（對的尺寸）', '六角扳手', '尖嘴鉗'], explain: '十字螺絲必須用十字起子，且尺寸要對（PH0/PH1/PH2/PH3）。一字起子勉強塞進十字螺絲會崩牙。' },
  { task: '在 0.5mm 鋁板上切出形狀', icon: '✂', ans: '鋼鋸 / 金工剪', options: ['線鋸', '鋼鋸 / 金工剪', '美工刀', '鎚子'], explain: '0.5mm 鋁板薄，鋼鋸或金工剪都可以。線鋸主要用於木材；美工刀切不動金屬。' },
  { task: '把金屬零件孔徑稍微擴大 0.5mm', icon: '〰', ans: '圓銼刀', options: ['平銼刀', '半圓銼刀', '圓銼刀', '三角銼刀'], explain: '圓形孔內擴大要用圓銼刀——形狀貼合孔壁。其他形狀銼會傷孔。' },
  { task: '剝開電線外皮（不傷銅線）', icon: '🔌', ans: '剝線鉗（依 AWG 規格）', options: ['尖嘴鉗', '剝線鉗（依 AWG 規格）', '美工刀', '斜口鉗'], explain: '剝線鉗有對應電線規格的孔——精確只夾外皮、不傷銅線。其他工具會傷到銅。' },
  { task: '鎖一顆 M6 內六角螺絲', icon: '🔧', ans: '六角扳手 4mm', options: ['一字螺絲起子', '六角扳手 4mm', '活動扳手', '梅花扳手'], explain: 'M6 內六角螺絲對應 4mm 六角扳手。內六角設計就是要用六角扳手鎖。' },
  { task: '量測一個方塊的對角線長度', icon: '📏', ans: '游標卡尺', options: ['直尺', '捲尺', '游標卡尺', '角尺'], explain: '對角線需要精度——游標卡尺可量到 0.02mm。直尺勉強可用但誤差大；角尺只能量直角。' },
  { task: '在木板畫好的線上精準切割直線', icon: '🪚', ans: '夾背鋸', options: ['線鋸', '夾背鋸', '鋼鋸', '美工刀'], explain: '夾背鋸（back saw）背部加了金屬條防止彎曲，切直線最精準。線鋸用於曲線；鋼鋸用於金屬。' },
  { task: '用美工刀切割厚紙板', icon: '🔪', ans: '美工刀 + 鋼尺 + 切割墊', options: ['只用美工刀', '美工刀 + 鋼尺 + 切割墊', '剪刀', '雕刻刀'], explain: '美工刀要配 3 件套：鋼尺壓住確保直線、切割墊保護桌面、利刀片才好切。三缺一安全性與品質都打折。' },
  { task: '把小金屬零件固定做後續加工', icon: '🗜', ans: '檯虎鉗（bench vise）', options: ['C 型夾', '檯虎鉗（bench vise）', '尖嘴鉗', '徒手按'], explain: '檯虎鉗夾力大且固定到桌上——金屬加工首選。C 型夾適合大平面工件。尖嘴鉗夾力不夠。徒手絕對不行。' },
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
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
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
