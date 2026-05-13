// 動力與運輸 模組 2：運輸分類
const CATS = [
  { id: 'land', icon: '🚗', name: '陸上運輸', desc: '在地面或軌道上行駛。速度範圍最廣（步行 5 km/h 到高鐵 300 km/h）。',
    vehicles: '汽車、機車、腳踏車、火車、高鐵、輕軌、捷運、卡車、巴士', co2: '燃油車 ~150g CO₂/km/人' },
  { id: 'water', icon: '🚢', name: '海上運輸', desc: '靠浮力（船）或氣墊（氣墊船）行駛。是「最節能的運送方式」（每噸貨）。',
    vehicles: '油輪、貨輪、客船、潛艇、漁船、遊艇、帆船、水翼船', co2: '貨輪 ~10g CO₂/km/噸（陸運的 1/10）' },
  { id: 'air', icon: '✈', name: '空中運輸', desc: '靠機翼升力或旋翼推力飛行。速度最快但能耗最高、碳排最重。',
    vehicles: '客機、戰鬥機、直升機、無人機、飛船、滑翔翼', co2: '客機 ~250g CO₂/km/人（陸運 2 倍）' },
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
  { v: '高鐵', a: 'land' }, { v: '油輪', a: 'water' }, { v: '直升機', a: 'air' },
  { v: '貨輪', a: 'water' }, { v: '卡車', a: 'land' }, { v: '無人機', a: 'air' },
  { v: '捷運', a: 'land' }, { v: '潛艇', a: 'water' }, { v: '滑翔翼', a: 'air' },
  { v: '腳踏車', a: 'land' },
];
const quizEl = document.getElementById('quiz');
const nextBtn = document.getElementById('next-btn');
const progEl = document.getElementById('prog');
let answered = new Set();
let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
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
  const parent = b.closest('div');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].a) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${CATS.find(c=>c.id===QUIZ[i].a).name}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module2 = true; p.module2_score = correct; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
