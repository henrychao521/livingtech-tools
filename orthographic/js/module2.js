// 三視圖 模組 2：4 種視圖類型
const TYPES = [
  { id: 'ortho', name: '三視圖（正投影）', use: '工程製造、機械圖、家具圖', pros: '尺寸精確、好標註、製造業通用', cons: '不夠直觀、需訓練才能判讀',
    viz: '<svg viewBox="0 0 200 100"><rect x="20" y="20" width="40" height="40" fill="#E0E7FF" stroke="#3730A3"/><rect x="80" y="20" width="40" height="40" fill="#E0E7FF" stroke="#3730A3"/><rect x="20" y="70" width="40" height="20" fill="#E0E7FF" stroke="#3730A3"/></svg>' },
  { id: 'iso', name: '等角圖 Isometric', use: 'IKEA 組裝說明書、簡報示意', pros: '簡單立體、所有平行邊保持比例', cons: '會有透視假象、看起來像「歪的方塊」',
    viz: '<svg viewBox="0 0 200 100"><polygon points="60,30 120,30 140,50 80,50" fill="#A5B4FC" stroke="#3730A3"/><polygon points="60,30 60,80 80,90 80,50" fill="#818CF8" stroke="#3730A3"/><polygon points="120,30 120,80 140,90 140,50" fill="#6366F1" stroke="#3730A3"/></svg>' },
  { id: 'oblique', name: '斜視圖 Oblique', use: '快速手繪示意、教學圖', pros: '正面保持原比例、繪製簡單', cons: '看起來會「拉長」失真',
    viz: '<svg viewBox="0 0 200 100"><rect x="40" y="30" width="60" height="40" fill="#A5B4FC" stroke="#3730A3"/><polygon points="100,30 130,15 130,55 100,70" fill="#6366F1" stroke="#3730A3"/><polygon points="40,30 70,15 130,15 100,30" fill="#818CF8" stroke="#3730A3"/></svg>' },
  { id: 'persp', name: '透視圖 Perspective', use: '建築設計、產品渲染、視覺效果', pros: '最接近人眼所見、視覺真實', cons: '不能直接量測、複雜度高',
    viz: '<svg viewBox="0 0 200 100"><polygon points="40,30 130,40 150,55 30,50" fill="#A5B4FC" stroke="#3730A3"/><polygon points="40,30 30,50 30,85 40,80" fill="#818CF8" stroke="#3730A3"/><polygon points="130,40 150,55 150,75 130,80" fill="#6366F1" stroke="#3730A3"/></svg>' },
];

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('grid');
TYPES.forEach(t => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid #4F46E5';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:80px">${t.viz}</div><h4 style="margin:0;color:#3730A3;font-size:15px">${t.name}</h4></div>
    <p style="font-size:12.5px;color:#666"><strong>用途：</strong>${t.use}</p>
    <p style="font-size:12px;color:#16A34A"><strong>優：</strong>${t.pros}</p>
    <p style="font-size:12px;color:#dc2626"><strong>缺：</strong>${t.cons}</p>`;
  grid.appendChild(c);
});

const QUIZ = [
  { q: 'IKEA 組裝說明書多用哪種視圖？', ans: 'iso', explain: '等角圖最常用 — 既能看立體、又能標準化生產。' },
  { q: '機械零件加工圖該用哪種？', ans: 'ortho', explain: '三視圖必須的 — 製造業要精確尺寸、加工資訊。' },
  { q: '建築師畫給客戶看的外觀效果圖？', ans: 'persp', explain: '透視圖最接近人眼所見 — 賣房子才感人。' },
  { q: '老師快速畫黑板示意圖？', ans: 'oblique', explain: '斜視圖最快 — 正面保持原比例、向後拉一斜線就是。' },
  { q: '汽車設計師畫車身造型？', ans: 'persp', explain: '透視圖 — 設計造型要看視覺感受。' },
  { q: '工廠技工要按圖製造零件？', ans: 'ortho', explain: '三視圖 — 製造業唯一能精確標尺寸的視圖。' },
  { q: 'LEGO 組裝手冊？', ans: 'iso', explain: '等角圖 — 簡單立體、可看清每塊位置。' },
  { q: '玩具產品包裝盒插圖？', ans: 'persp', explain: '透視圖 — 視覺效果最佳，吸引消費者。' },
];

const quizEl = document.getElementById('quiz');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
let answered = new Set(); let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
    <div class="choice-grid" style="grid-template-columns:repeat(4,1fr)">${TYPES.map(t => `<button class="choice" data-q="${i}" data-c="${t.id}">${t.name.split(' ')[0].replace('（正投影）', '')}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
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
