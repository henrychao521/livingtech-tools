// 能源系統 模組 2：能量轉換
const FORMS = [
  { name: '動能', icon: '🏃', desc: '物體運動時擁有的能量。E_k = ½mv²。' },
  { name: '熱能', icon: '🔥', desc: '物質內部分子振動產生。溫度高 = 分子動能高。' },
  { name: '電能', icon: '⚡', desc: '電荷流動產生的能量。可長距傳輸、易轉換。' },
  { name: '光能', icon: '💡', desc: '電磁波形式的能量。可見光、紅外線、紫外線都是。' },
  { name: '化學能', icon: '🧪', desc: '儲存在化學鍵中的能量。電池、食物、燃料皆是。' },
  { name: '位能', icon: '⛰', desc: '物體因位置擁有的能量。高處水、拉開的弓、壓縮的彈簧。' },
];
const QUIZ = [
  { q: '燃煤發電廠', chain: '化學能 → 熱能 → 動能 → 電能' },
  { q: '太陽能板', chain: '光能 → 電能' },
  { q: '水力發電廠', chain: '位能 → 動能 → 電能' },
  { q: '風力發電', chain: '動能 → 電能' },
  { q: '電燈泡', chain: '電能 → 光能 + 熱能' },
  { q: '人類運動消耗食物', chain: '化學能 → 動能 + 熱能' },
  { q: '電池供電給手機', chain: '化學能 → 電能' },
  { q: '微波爐加熱食物', chain: '電能 → 光能（微波）→ 熱能' },
  { q: '車輛煞車', chain: '動能 → 熱能（摩擦）' },
  { q: '電動車充電與行駛', chain: '電能 → 化學能（電池）→ 電能 → 動能' },
];
const PK = 'energy_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const fg = document.getElementById('forms');
FORMS.forEach(f => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;border-left:4px solid #CA8A04';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:26px">${f.icon}</span><h4 style="margin:0;color:#854D0E;font-size:15px">${f.name}</h4></div><p style="font-size:13px;color:#444">${f.desc}</p>`;
  fg.appendChild(c);
});

const quizEl = document.getElementById('quiz');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
const allChoices = [...new Set(QUIZ.map(q => q.chain))];
let answered = new Set();
let correct = 0;
QUIZ.forEach((q, i) => {
  const choices = [q.chain, ...allChoices.filter(c => c !== q.chain).slice(0, 3)].sort(() => Math.random() - 0.5);
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q} 的能量轉換是？</p>
    <div class="choice-grid" style="grid-template-columns:1fr 1fr">${choices.map(c => `<button class="choice" data-q="${i}" data-c="${c}" style="text-align:left;padding:8px 12px;font-size:12.5px">${c}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const ok = btn.dataset.c === QUIZ[i].chain;
  const parent = btn.closest('div');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === QUIZ[i].chain) b.classList.add('correct');
    if (b === btn && !ok) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}" style="margin-top:8px">${ok ? '✓' : '✗'} 能量轉換：${QUIZ[i].chain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module2 = true; p.module2_score = correct; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${correct} / ${QUIZ.length} 答對`, 'good');
  }
}));
