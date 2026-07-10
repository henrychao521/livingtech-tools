// 機構運動 模組 2：4 種運動類型
const MOTIONS = [
  {
    id: 'rotation',
    name: '旋轉運動 Rotation',
    desc: '物體繞固定軸做圓周運動。動力傳遞最常見的形式——馬達、引擎、輪子都是。',
    examples: '齒輪、風扇、輪子、皮帶輪、地球自轉',
    viz: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="25" fill="none" stroke="#14B8A6" stroke-width="3" stroke-dasharray="3 2"/><circle cx="40" cy="15" r="5" fill="#DC2626"><animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="2s" repeatCount="indefinite"/></circle><circle cx="40" cy="40" r="3" fill="#0F766E"/></svg>`,
  },
  {
    id: 'reciprocating',
    name: '往復運動 Reciprocating',
    desc: '物體沿直線在兩個位置間來回。「往復」就是「重複往來」——前進後退、上下移動。',
    examples: '活塞、縫紉機針、衝床、鋸子來回切',
    viz: `<svg viewBox="0 0 80 80"><line x1="10" y1="40" x2="70" y2="40" stroke="#475569" stroke-width="2" stroke-dasharray="3 2"/><rect x="35" y="30" width="20" height="20" fill="#14B8A6"><animate attributeName="x" values="15;55;15" dur="1.5s" repeatCount="indefinite"/></rect></svg>`,
  },
  {
    id: 'oscillating',
    name: '擺動運動 Oscillating',
    desc: '物體繞固定軸在一個角度範圍內來回擺動（非完整旋轉）。和往復不同：擺動是「圓弧」軌跡。',
    examples: '時鐘鐘擺、鞦韆、汽車雨刷、節拍器',
    viz: `<svg viewBox="0 0 80 80"><circle cx="40" cy="20" r="3" fill="#0F766E"/><g transform-origin="40 20"><line x1="40" y1="20" x2="40" y2="60" stroke="#14B8A6" stroke-width="3"/><circle cx="40" cy="60" r="6" fill="#DC2626"/><animateTransform attributeName="transform" type="rotate" values="-30;30;-30" dur="2s" repeatCount="indefinite"/></g></svg>`,
  },
  {
    id: 'intermittent',
    name: '間歇運動 Intermittent',
    desc: '運動與停頓交替——動 → 停 → 動 → 停。電影膠片過格、自動鎖、計數器都用這種運動。',
    examples: '電影膠片、石英鐘秒針、棘輪扳手、計數器',
    viz: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="25" fill="none" stroke="#14B8A6" stroke-width="3" stroke-dasharray="3 2"/><circle cx="40" cy="15" r="5" fill="#DC2626"><animateTransform attributeName="transform" type="rotate" values="0;60;60;120;120;180;180;240;240;300;300;360" dur="3s" repeatCount="indefinite" keyTimes="0;.1;.25;.35;.5;.6;.75;.85;1;1;1;1"/></circle><circle cx="40" cy="40" r="3" fill="#0F766E"/></svg>`,
  },
];

const PK = 'mech_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('motion-grid');
MOTIONS.forEach(m => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;border-left:5px solid #14B8A6';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <div style="width:60px;height:60px;background:#0f172a;border-radius:8px">${m.viz}</div>
      <h4 style="margin:0;color:#0F766E">${m.name}</h4>
    </div>
    <p style="font-size:13px;color:#444;margin:6px 0">${m.desc}</p>
    <p style="font-size:12.5px;color:#666"><strong>範例：</strong>${m.examples}</p>`;
  grid.appendChild(card);
});

const QUIZ = [
  { q: '電風扇葉片', ans: 'rotation', explain: '葉片繞馬達軸做圓周運動 = 旋轉。' },
  { q: '時鐘的鐘擺', ans: 'oscillating', explain: '左右擺動但不轉一圈 = 擺動。' },
  { q: '縫紉機的針上下動', ans: 'reciprocating', explain: '針沿直線上下來回 = 往復。' },
  { q: '石英鐘錶秒針一秒跳一格', ans: 'intermittent', explain: '動一下停一下 = 間歇。' },
  { q: '汽車輪子轉動', ans: 'rotation', explain: '繞軸做圓周運動 = 旋轉。' },
  { q: '汽車雨刷擺動', ans: 'oscillating', explain: '在角度範圍內左右擺 = 擺動。' },
  { q: '引擎活塞', ans: 'reciprocating', explain: '在氣缸內上下直線運動 = 往復。' },
  { q: '電影膠片每秒 24 格切換', ans: 'intermittent', explain: '動停動停 = 間歇。' },
];

const quizEl = document.getElementById('quiz');
const progText = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
let answered = new Set();
let quizCorrect = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q} 屬於</p>
    <div class="choice-grid" style="grid-template-columns:repeat(4,1fr)">${MOTIONS.map(m => `<button class="choice" data-q="${i}" data-c="${m.id}">${m.name.split(' ')[0]}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const correct = btn.dataset.c === QUIZ[i].ans;
  const parent = btn.closest('div');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === QUIZ[i].ans) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ[i].explain}</div>`;
  if (correct) { quizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progText.textContent = `已答 ${answered.size}/${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP();
    p.module2 = true;
    p.module2_score = quizCorrect;
    saveP(p);
    nextBtn.style.opacity = 1;
    nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${quizCorrect} / ${QUIZ.length} 答對`, 'good');
  }
}));
