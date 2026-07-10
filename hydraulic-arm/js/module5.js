// 液壓手臂 模組 5：工業應用
const APPS = [
  { name: '挖土機', icon: '🚜', force: '5-20 噸', pressure: '350 bar', desc: '4 個主油壓缸控制大臂、小臂、鏟斗、迴轉，可以挖深 6m。操作員推一個小桿就操控全部。' },
  { name: '堆高機', icon: '📦', force: '1-50 噸', pressure: '200 bar', desc: '油壓缸推動桅杆與貨叉升降，可舉到 6m 高。輪胎也是油壓動力轉向（power steering）。' },
  { name: '汽車煞車', icon: '🚗', force: '500-2000N', pressure: '50 bar', desc: '踩煞車踏板 → 主缸壓力推 4 個輪上的卡鉗 → 夾住碟盤。腳力放大 16-30 倍。' },
  { name: '壓縮式垃圾車', icon: '🗑', force: '~500kg 壓縮', pressure: '180 bar', desc: '後方液壓缸把垃圾推壓進車廂，可壓縮 4-6 倍。每天清晨各社區巷弄都見得到。' },
  { name: '千斤頂', icon: '⬆', force: '1-50 噸', pressure: '500 bar', desc: '小活塞反覆壓動 → 把油打進大活塞 → 舉起車輛。手按 200N 變成舉 1000kg。' },
  { name: '飛機起落架', icon: '✈', force: '巨大', pressure: '210 bar', desc: '油壓系統收放起落架、控制襟翼、操作方向舵。波音 747 有 4 個獨立液壓迴路備援。' },
  { name: '氣壓升降椅', icon: '🪑', force: '~150kg', pressure: '內充氮氣約 60–100 bar', desc: '辦公椅高度調整用「氣壓棒」（油氣混合）。按按鈕鬆閥 → 體重壓下椅子降；起身按 → 彈簧+氣壓推上升。' },
  { name: '射出成型機', icon: '🏭', force: '50-5000 噸', pressure: '150 bar', desc: '把塑膠射進模具的核心力量。大型機可達 5000 噸夾模力。台灣是全球射出機強國。' },
];

const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const grid = document.getElementById('apps');
APPS.forEach(a => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid #0284C7';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:28px">${a.icon}</span><h4 style="margin:0;color:#075985;font-size:15px">${a.name}</h4></div>
    <p style="font-size:12.5px;color:#0284C7;font-weight:700;background:#E0F2FE;padding:5px 10px;border-radius:5px;margin:6px 0">力：${a.force} ・ 壓力：${a.pressure}</p>
    <p style="font-size:13px;color:#444">${a.desc}</p>`;
  grid.appendChild(c);
});
// === 帕斯卡定律計算測驗（三題都作答才標記 module5 完成） ===
const QUIZ = [
  { q: '【計算】小活塞面積 2 cm²，施力 10 N。液體壓力是多少？大活塞面積 20 cm²，輸出力是多少？', options: ['壓力 5 N/cm²，輸出力 100 N', '壓力 20 N/cm²，輸出力 400 N', '壓力 5 N/cm²，輸出力 10 N'], correct: 0, explain: '壓力 = 力 ÷ 面積 = 10 N ÷ 2 cm² = 5 N/cm²。帕斯卡定律：壓力處處相等，所以大活塞輸出力 = 5 N/cm² × 20 cm² = 100 N。面積放大 10 倍，力也放大 10 倍。' },
  { q: '【計算】要用大活塞（面積 30 cm²）抬起 300 N 的重物，小活塞面積 3 cm²，最少要在小活塞上施力多少？', options: ['3 N', '30 N', '3000 N'], correct: 1, explain: '需要的壓力 = 300 N ÷ 30 cm² = 10 N/cm²。小活塞施力 = 10 N/cm² × 3 cm² = 30 N。面積比 30:3 = 10 倍，所以施力只要重物的 1/10。' },
  { q: '【觀念】液壓系統把力放大 10 倍，那小活塞移動的距離要是大活塞的幾倍？', options: ['1/10 倍（小活塞動得比較少）', '1 倍（兩邊一樣）', '10 倍（小活塞要多推 10 倍距離）'], correct: 2, explain: '功守恆：小活塞的功 = 大活塞的功（F×d 相等）。力放大 10 倍，距離就要付出 10 倍——液壓「省力不省功」。這也是千斤頂要反覆壓很多下的原因。' },
];

const quizEl = document.getElementById('quiz');
let answered = new Set();
let quizCorrect = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
    <div class="choice-grid">${q.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const correct = parseInt(btn.dataset.c) === QUIZ[i].correct;
  const parent = btn.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ[i].explain}</div>`;
  if (correct) { quizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    const p = loadP();
    p.module5 = true;
    p.module5_quiz_score = quizCorrect;
    saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${quizCorrect} / ${QUIZ.length} 答對`, 'good');
  }
}));
