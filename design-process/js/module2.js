// 設計流程 模組 2：市場調查 6 方法
const METHODS = [
  { id: 'survey', name: '問卷調查', icon: '📋', when: '需要大量資料、量化結果', pros: '樣本可達上千人、可統計分析', cons: '深度有限、誠實度依問題設計', example: '想知道全校 30% 學生有什麼共同習慣' },
  { id: 'interview', name: '深度訪談', icon: '🎙', when: '需要深入了解動機、故事', pros: '可挖到深層需求、靈活提問', cons: '耗時（每人 1 小時）、樣本少', example: '了解某學生為何不愛用某 App' },
  { id: 'observe', name: '直接觀察', icon: '👀', when: '使用者「說的」和「做的」不同時', pros: '看到真實行為、發現未被說的需求', cons: '可能被觀察影響（霍桑效應）', example: '看媽媽們在超市如何選嬰兒奶粉' },
  { id: 'compete', name: '競品分析', icon: '🔬', when: '想了解市場既有解法的優劣', pros: '快速、可看市場趨勢、學競品好處', cons: '只能看到「現在的」、未來預測難', example: '比較 iPhone（蘋果）、Samsung（三星）、Pixel（Google）三款手機的各種功能' },
  { id: 'focus', name: '焦點團體', icon: '👥', when: '想看群體討論的觀點碰撞', pros: '一次 6-8 人、可激盪深度討論', cons: '可能被主導者帶風向、需要主持人', example: '請 8 位媽媽討論「最理想的兒童書桌」' },
  { id: 'data', name: '次級資料', icon: '📊', when: '預算少、時間緊', pros: '免費、政府/學術資料量大', cons: '可能過時、不一定對應你的問題', example: '從教育部統計處下載學生上網時數資料' },
];

const PK = 'dp_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('grid');
METHODS.forEach(m => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;border-left:5px solid #9333EA';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:26px">${m.icon}</span><h4 style="margin:0;color:#6B21A8;font-size:15px">${m.name}</h4></div>
    <p style="font-size:12.5px;color:#9333EA;font-weight:700;background:#F3E8FF;padding:5px 10px;border-radius:5px;margin:6px 0">${m.when}</p>
    <p style="font-size:12px;color:#16A34A"><strong>優：</strong>${m.pros}</p>
    <p style="font-size:12px;color:#dc2626"><strong>缺：</strong>${m.cons}</p>
    <p style="font-size:12px;color:#666"><strong>例：</strong>${m.example}</p>`;
  grid.appendChild(c);
});

const QUIZ = [
  { q: '想知道全班最受歡迎的 3 種顏色', ans: 'survey', explain: '問卷最快——一張問卷 30 人 5 分鐘搞定。' },
  { q: '想了解為什麼有些人不買某品牌手機', ans: 'interview', explain: '深度訪談——「為什麼」要挖很深，問卷只能看表象。' },
  { q: '想知道老人家如何使用 App，不打擾他們', ans: 'observe', explain: '直接觀察——老人說的話和做的事常不同，看實際操作最準。' },
  { q: '想設計新運動 App，看市面上競品有什麼功能', ans: 'compete', explain: '競品分析——把 iPhone 內建的「健康」App、Strava、Nike Run Club 這幾個現成的運動紀錄 App 拿來比一比。' },
  { q: '想討論「理想的兒童學習桌」設計，引發深度討論', ans: 'focus', explain: '焦點團體——8 位家長一起討論會比訪談激出更多想法。' },
  { q: '預算少，想知道台灣青少年運動習慣統計', ans: 'data', explain: '次級資料——體育署、教育部都有現成資料免費下載。' },
  { q: '想知道學生有多少時間使用社群媒體', ans: 'survey', explain: '問卷——量化資料適合此問題。' },
  { q: '想看視障者實際怎麼操作智慧手機，在旁邊看、不打擾', ans: 'observe', explain: '直接觀察——他們的使用方式可能完全意料外，親眼看實際操作最準。' },
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
    <div class="choice-grid" style="grid-template-columns:repeat(auto-fit,minmax(96px,1fr))">${METHODS.map(m => `<button class="choice" data-q="${i}" data-c="${m.id}" style="font-size:11px;padding:6px 4px">${m.name}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

// 通過門檻：8 題至少答對 6 題；未達門檻時只重做答錯的題目
const PASS = 6;
const result = {};          // 題號 → true/false（目前這一輪的對錯）
let firstScore = null;      // 第一次答完的分數，存給老師看
const retrySlot = document.createElement('div');
quizEl.after(retrySlot);

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
  if (typeof SoundFX !== 'undefined') { ok ? SoundFX.success() : SoundFX.error(); }
  result[i] = ok;
  answered.add(i);
  correct = Object.values(result).filter(Boolean).length;
  progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) finishRound();
}));

function finishRound() {
  const p = loadP();
  if (firstScore === null) { firstScore = correct; p.module2_score = firstScore; }
  if (correct >= PASS) {
    p.module2 = true; saveP(p);
    retrySlot.innerHTML = '';
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對，過關！`, 'good');
    return;
  }
  saveP(p);
  const wrong = QUIZ.map((_, i) => i).filter(i => !result[i]);
  retrySlot.innerHTML = `<div class="feedback error" style="margin-top:10px">這一輪答對 ${correct}/${QUIZ.length} 題，要答對 ${PASS} 題才能進下一關。先看上面每題的說明，再重做答錯的 ${wrong.length} 題。
    <button class="btn btn-primary" id="retry-btn" style="margin-left:8px;padding:4px 14px">重做錯題</button></div>`;
  showToast(`答對 ${correct}/${QUIZ.length}，重做錯題再過關`, 'bad');
  document.getElementById('retry-btn').addEventListener('click', () => {
    wrong.forEach(i => {
      answered.delete(i); delete result[i];
      const item = quizEl.querySelectorAll('.quiz-item')[i];
      item.querySelectorAll('.choice').forEach(x => { x.disabled = false; x.classList.remove('correct', 'wrong'); });
      item.querySelector('.feedback-slot').innerHTML = '';
    });
    retrySlot.innerHTML = '';
    progEl.textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
    quizEl.querySelectorAll('.quiz-item')[wrong[0]].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
// 從模組 3 按「上一關」回來複習時，已完成就直接解鎖下一關（不必重答 8 題）
if (loadP().module2) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
