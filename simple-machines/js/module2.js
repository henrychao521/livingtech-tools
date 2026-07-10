// 簡單機械 模組 2：槓桿三類
const CLASSES = [
  {
    id: 'first',
    name: '第一類槓桿',
    desc: '支點在中間（施力與抗力分別在支點兩側）。可以省力或費力，看力臂比例。',
    layout: '施力 — 支點 — 抗力',
    examples: '剪刀、翹翹板、撬棍、釘拔、釣魚竿（單手版）',
    feature: '功能多樣：力臂可省力或省距離',
    viz: `<svg viewBox="0 0 240 100"><rect x="20" y="50" width="200" height="6" fill="#DB2777"/><polygon points="115,56 135,56 125,75" fill="#9D174D"/><rect x="20" y="30" width="30" height="20" fill="#831843"/><line x1="200" y1="20" x2="200" y2="50" stroke="#16A34A" stroke-width="3"/><polygon points="200,50 196,42 204,42" fill="#16A34A"/><text x="35" y="22" font-size="10" fill="#831843" font-weight="700">抗力</text><text x="125" y="92" text-anchor="middle" font-size="10" fill="#9D174D" font-weight="700">支點</text><text x="200" y="12" text-anchor="middle" font-size="10" fill="#16A34A" font-weight="700">施力</text></svg>`,
  },
  {
    id: 'second',
    name: '第二類槓桿',
    desc: '抗力在中間（支點在一端、施力在另一端）。永遠省力，但施力距離長。',
    layout: '施力 — 抗力 — 支點',
    examples: '手推車、開瓶器、堅果鉗、訂書機、獨輪手推車',
    feature: '永遠省力（MA > 1）',
    viz: `<svg viewBox="0 0 240 100"><rect x="20" y="50" width="200" height="6" fill="#DB2777"/><polygon points="20,40 38,40 30,68" fill="#9D174D"/><rect x="100" y="30" width="40" height="20" fill="#831843"/><line x1="210" y1="20" x2="210" y2="50" stroke="#16A34A" stroke-width="3"/><polygon points="210,50 206,42 214,42" fill="#16A34A"/><text x="120" y="22" text-anchor="middle" font-size="10" fill="#831843" font-weight="700">抗力</text><text x="30" y="85" text-anchor="middle" font-size="10" fill="#9D174D" font-weight="700">支點</text><text x="210" y="12" text-anchor="middle" font-size="10" fill="#16A34A" font-weight="700">施力</text></svg>`,
  },
  {
    id: 'third',
    name: '第三類槓桿',
    desc: '施力在中間（支點在一端、抗力在另一端）。永遠費力，但換來精準操控與動作放大。',
    layout: '支點 — 施力 — 抗力',
    examples: '鑷子、釣竿（雙手版）、釘書機、人類手臂、掃帚',
    feature: '永遠費力（MA < 1），但動作放大',
    viz: `<svg viewBox="0 0 240 100"><rect x="20" y="50" width="200" height="6" fill="#DB2777"/><polygon points="20,40 38,40 30,68" fill="#9D174D"/><line x1="115" y1="20" x2="115" y2="50" stroke="#16A34A" stroke-width="3"/><polygon points="115,50 111,42 119,42" fill="#16A34A"/><rect x="200" y="30" width="30" height="20" fill="#831843"/><text x="30" y="85" text-anchor="middle" font-size="10" fill="#9D174D" font-weight="700">支點</text><text x="115" y="12" text-anchor="middle" font-size="10" fill="#16A34A" font-weight="700">施力</text><text x="215" y="22" text-anchor="middle" font-size="10" fill="#831843" font-weight="700">抗力</text></svg>`,
  },
];

const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seenClasses = new Set((loadP().module2_seen) || []);

const cg = document.getElementById('class-grid');
CLASSES.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #DB2777;${seenClasses.has(c.id) ? 'background:#FCE7F3' : ''}`;
  card.innerHTML = `
    <h4 style="margin:0 0 10px;color:#9D174D">${c.name}</h4>
    <div style="margin-bottom:10px">${c.viz}</div>
    <p style="font-size:13px;color:#444"><strong>佈局：</strong>${c.layout}</p>
    <p style="font-size:13px;color:#444"><strong>原理：</strong>${c.desc}</p>
    <p style="font-size:12.5px;color:#DB2777;font-weight:700;background:#FCE7F3;padding:6px 10px;border-radius:6px">${c.feature}</p>
    <p style="font-size:12.5px;color:#666"><strong>範例：</strong>${c.examples}</p>`;
  card.addEventListener('click', () => {
    if (!seenClasses.has(c.id)) {
      seenClasses.add(c.id);
      card.style.background = '#FCE7F3';
      const p = loadP();
      p.module2_seen = Array.from(seenClasses);
      saveP(p);
      updateProgress();
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    }
  });
  cg.appendChild(card);
});

const QUIZ = [
  { tool: '剪刀', ans: 'first' },
  { tool: '釘拔（榔頭背面拔釘）', ans: 'first' },
  { tool: '翹翹板', ans: 'first' },
  { tool: '手推車', ans: 'second' },
  { tool: '開瓶器（開酒瓶用，槓桿頂壓蓋）', ans: 'second' },
  { tool: '堅果鉗', ans: 'second' },
  { tool: '鑷子', ans: 'third' },
  { tool: '釣魚竿（雙手握）', ans: 'third' },
  { tool: '人類手臂彎舉', ans: 'third' },
];

const quizEl = document.getElementById('quiz');
let answered = new Set();
let quizCorrect = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.classList.add('quiz-item');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.tool} 屬於</p>
    <div class="choice-grid">${CLASSES.map(c => `<button class="choice" data-q="${i}" data-c="${c.id}">${c.name}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const q = QUIZ[i];
  const correct = btn.dataset.c === q.ans;
  const parent = btn.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === q.ans) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  const ansName = CLASSES.find(c => c.id === q.ans).name;
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓ 正確' : `✗ 正確答案：${ansName}`}</div>`;
  if (correct) { quizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  updateProgress();
  if (answered.size === QUIZ.length) {
    const p = loadP();
    p.module2 = true;
    p.module2_score = quizCorrect;
    saveP(p);
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${quizCorrect} / ${QUIZ.length} 答對`, 'good');
  }
}));

function updateProgress() {
  document.getElementById('quiz-progress').textContent = `類型 ${seenClasses.size}/3 ・ 題目 ${answered.size}/${QUIZ.length}`;
}
updateProgress();
