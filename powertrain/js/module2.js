// 動力與運輸 模組 2：運輸分類
const CATS = [
  { id: 'land', icon: '🚗', name: '陸上運輸', desc: '在地面或軌道上行駛。速度範圍最廣（步行 5 km/h 到高鐵 300 km/h）。',
    vehicles: '汽車、機車、腳踏車、火車、高鐵、輕軌、捷運、卡車、巴士', co2: '燃油車 ~150g CO₂/km/人' },
  { id: 'water', icon: '🚢', name: '海上運輸', desc: '靠浮力（船）或氣墊（氣墊船）行駛。是「最節能的運送方式」（每噸貨）。',
    vehicles: '油輪、貨輪、客船、潛艇、漁船、遊艇、帆船、水翼船、氣墊船', co2: '大型貨輪 ~10–25g CO₂/km/噸（卡車約 100g CO₂/km/噸，貨輪只有其 1/4～1/10）' },
  { id: 'air', icon: '✈', name: '空中運輸', desc: '靠機翼升力或旋翼推力飛行。速度最快但能耗最高、碳排最重。',
    vehicles: '客機、戰鬥機、直升機、無人機、飛船、滑翔翼', co2: '客機 ~250g CO₂/km/人（約為燃油車的 1.7 倍）' },
];

const PK = 'pt_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('grid');
CATS.forEach(c => {
  const d = document.createElement('div');
  d.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;border-left:5px solid #EA580C';
  d.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:36px">${c.icon}</span><h4 style="margin:0;color:#9A3412">${c.name}</h4></div>
    <p style="font-size:13px;color:#444">${c.desc}</p>
    <p style="font-size:12.5px;color:#666;margin:6px 0"><strong>常見載具：</strong>${c.vehicles}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>CO₂：</strong>${c.co2}</p>`;
  grid.appendChild(d);
});

const QUIZ = [
  { v: '高鐵', a: 'land', explain: '在地面軌道上行駛，再快也是陸上運輸。' },
  { v: '油輪', a: 'water', explain: '靠浮力在海上航行，專門載運原油。' },
  { v: '直升機', a: 'air', explain: '沒有固定機翼，但靠旋翼推力飛在空中，一樣是空中運輸。' },
  { v: '貨輪', a: 'water', explain: '靠浮力航行，是每噸貨最節能的運送方式。' },
  { v: '卡車', a: 'land', explain: '在道路上行駛的載貨車輛。' },
  { v: '無人機', a: 'air', explain: '機上沒有人，但同樣靠旋翼或機翼在空中飛行。' },
  { v: '捷運', a: 'land', explain: '就算有一段在地底下，仍是在軌道上行駛的陸上運輸。' },
  { v: '潛艇', a: 'water', explain: '可以潛到水面下，但仍在水中航行，屬於海上運輸。' },
  { v: '滑翔翼', a: 'air', explain: '沒有引擎，靠機翼的升力在空中滑翔，仍是空中運輸。' },
  { v: '腳踏車', a: 'land', explain: '靠人力在地面上行駛。' },
];
const quizEl = document.getElementById('quiz');
// 作答紀錄（js/sheet-log.js）：全部答完送一筆
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: QUIZ.map((q, i) => ({ key: 'q' + i, t: 'single', stem: q.v + ' 屬於哪一類運輸？', options: CATS.map(c => c.name), answer: CATS.findIndex(c => c.id === q.a) })) });
const nextBtn = document.getElementById('next-btn');
const progEl = document.getElementById('prog');
let answered = new Set();
let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.classList.add('quiz-item');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.v} 屬於</p>
    <div class="choice-grid" style="grid-template-columns:repeat(3,1fr)">${CATS.map(c => `<button class="choice" data-q="${i}" data-c="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});
quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].a;
  if (SLQ) SLQ.answer('q' + i, CATS.findIndex(c => c.id === b.dataset.c));
  const parent = b.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].a) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${CATS.find(c=>c.id===QUIZ[i].a).name} — ${QUIZ[i].explain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    if (SLQ) SLQ.finish({ score: correct, max: QUIZ.length });
    const p = loadP(); p.module2 = true; p.module2_score = correct; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
