// 新興科技 模組 3：VR / AR / MR / XR 分類判斷
// 依據 Milgram & Kishino (1994) 虛實連續體分類。

const PK = 'et_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const TYPES = [
  { id: 'AR', ico: '📱', name: 'AR 擴增實境', color: '#06B6D4',
    key: '看得到真實環境，虛擬資訊「疊」在上面，但兩者不會互動。',
    ex: '手機鏡頭上的導航箭頭、濾鏡貼圖、掃描課本跳出 3D 模型。' },
  { id: 'MR', ico: '🪟', name: 'MR 混合實境', color: '#F59E0B',
    key: '虛擬物件能「認得」真實空間，會被桌子擋住、會放在桌面上，可雙向互動。',
    ex: '虛擬螢幕固定在真實牆上、虛擬球滾到真實沙發後被遮住。' },
  { id: 'VR', ico: '🥽', name: 'VR 虛擬實境', color: '#a78bfa',
    key: '完全遮蔽真實視野，看到的一切都是電腦生成。',
    ex: '戴上頭盔進入虛擬教室、飛行模擬訓練。' },
  { id: 'XR', ico: '🌐', name: 'XR 延展實境', color: '#64748b',
    key: '不是某一種，而是 VR/AR/MR 的「總稱」，用在泛指整個領域時。',
    ex: '「學校要採購 XR 教學設備」——沒有指定哪一種。' },
];

const QUESTIONS = [
  { q: '用平板掃描課本上的圖片，螢幕跳出一隻可旋轉觀察的 3D 恐龍，恐龍浮在畫面上，不會被課本邊緣遮住。', a: 'AR' },
  { q: '戴上頭盔後看不到教室，眼前是一座完整的虛擬工廠，可以走動參觀產線。', a: 'VR' },
  { q: '戴上透視頭盔，虛擬的說明標籤「貼」在真實機台上；走到機台後方時，標籤會被機台正確遮住。', a: 'MR' },
  { q: '手機相機開啟後，畫面上出現往前走的箭頭指引方向，箭頭永遠浮在畫面正中央上方。', a: 'AR' },
  { q: '教育部公文寫「補助學校建置延展實境教學設備」，未指定是頭戴式或手持式。', a: 'XR' },
  { q: '虛擬寵物被放在真實的桌面上，你把手伸過去，牠會躲開，走到桌緣會停住不會掉下去。', a: 'MR' },
  { q: '在完全黑暗的頭盔中進行消防逃生演練，四周的煙霧、火場、樓梯全部由電腦生成。', a: 'VR' },
  { q: '一份研究報告比較「各類 XR 裝置的市場趨勢」，內容同時涵蓋頭戴顯示器與手機擴增應用。', a: 'XR' },
];

const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
const saved = loadP();
const answered = new Map(Object.entries(saved.module3_ans || {}));

// ---------- 說明卡 ----------
document.getElementById('xrCards').innerHTML = TYPES.map(t => `
  <div class="xr-card" style="border-color:${t.color}33">
    <span class="xr-icon">${t.ico}</span>
    <h4 style="color:${t.color}">${t.name}</h4>
    <p><strong>判斷關鍵：</strong>${t.key}</p>
    <p style="margin-top:6px;color:#64748b"><strong>例子：</strong>${t.ex}</p>
  </div>`).join('');

// ---------- 測驗 ----------
const quizEl = document.getElementById('quiz');

function renderQuiz() {
  quizEl.innerHTML = QUESTIONS.map((item, i) => {
    const picked = answered.get(String(i));
    const correct = picked === item.a;
    return `<div style="background:#f8fafc;border-radius:12px;padding:14px 16px;margin-bottom:12px;
        border-left:4px solid ${picked ? (correct ? '#22c55e' : '#ef4444') : '#cbd5e1'}">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">
        <span style="color:var(--primary-dark)">Q${i + 1}.</span> ${item.q}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${TYPES.map(t => {
          const on = picked === t.id;
          const isAns = t.id === item.a;
          let bg = '#fff', bd = '#e2e8f0', fg = '#334155';
          if (picked) {
            if (isAns) { bg = '#dcfce7'; bd = '#22c55e'; fg = '#15803d'; }
            else if (on) { bg = '#fee2e2'; bd = '#ef4444'; fg = '#b91c1c'; }
          }
          return `<button data-q="${i}" data-t="${t.id}" ${picked ? 'disabled' : ''}
            style="padding:8px 14px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${fg};
            font-weight:700;font-size:13px;cursor:${picked ? 'default' : 'pointer'}">${t.ico} ${t.id}</button>`;
        }).join('')}
      </div>
      ${picked ? `<div style="margin-top:10px;font-size:13px;color:${correct ? '#15803d' : '#b91c1c'}">
        ${correct ? '✅ 正確！' : `❌ 正確答案是 ${item.a}。`}
        ${TYPES.find(t => t.id === item.a).key}</div>` : ''}
    </div>`;
  }).join('');
  updateProg();
}

function updateProg() {
  let right = 0;
  answered.forEach((v, k) => { if (v === QUESTIONS[+k].a) right++; });
  progEl.textContent = `配對 ${answered.size} / ${QUESTIONS.length}　答對 ${right}`;
  if (answered.size === QUESTIONS.length) {
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
  }
}

quizEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-q]'); if (!b || b.disabled) return;
  const qi = b.dataset.q, pick = b.dataset.t;
  if (answered.has(qi)) return;
  answered.set(qi, pick);

  const p = loadP();
  p.module3_ans = Object.fromEntries(answered);
  const allDone = answered.size === QUESTIONS.length;
  if (allDone) p.module3 = true;
  saveP(p);

  const ok = pick === QUESTIONS[+qi].a;
  if (typeof SoundFX !== 'undefined') ok ? SoundFX.pop() : SoundFX.pop();
  if (typeof showToast === 'function') showToast(ok ? '✅ 答對了' : '❌ 再看一次判斷關鍵', ok ? 'good' : '');
  if (allDone) {
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 八題全部完成！', 'good');
  }
  renderQuiz();
});

renderQuiz();
