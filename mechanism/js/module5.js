// 機構運動 模組 5：生活應用
const APPS = [
  { name: '蒸汽機', icon: '🚂', mech: '曲柄滑塊', analysis: '蒸汽推動活塞往復 → 連桿 + 曲柄 → 旋轉驅動火車輪。1769 年 James Watt 改良。' },
  { name: '縫紉機', icon: '🪡', mech: '曲柄滑塊 + 凸輪', analysis: '腳踏輪/馬達旋轉 → 曲柄滑塊把旋轉變針的上下運動 + 凸輪控制壓腳與送布。' },
  { name: '汽車雨刷', icon: '🚗', mech: '四連桿', analysis: '電動馬達旋轉 → 四連桿把旋轉變雨刷的擺動。兩支雨刷有不同的擺動範圍。' },
  { name: '汽車引擎', icon: '🛢', mech: '曲柄滑塊 + 凸輪 + 齒輪', analysis: '活塞往復（曲柄滑塊）→ 飛輪旋轉 → 變速箱齒輪 → 車輪。凸輪軸控制進排氣門。' },
  { name: '門吸 / 門擋', icon: '🚪', mech: '棘輪', analysis: '門打開時棘輪只允許向開的方向轉。需要關時要先解除卡爪。' },
  { name: '腳踏車變速器', icon: '🚲', mech: '齒輪 + 鏈條', analysis: '前後齒輪比改變—小前/大後 = 上坡輕鬆但速度慢；大前/小後 = 平地速度快但起步重。' },
  { name: '手錶機芯', icon: '⌚', mech: '齒輪 + 棘輪', analysis: '主發條儲能 → 多級齒輪減速 → 棘輪控制間歇釋放 → 秒/分/時針規律走動。' },
  { name: '直立鋼琴擊弦', icon: '🎹', mech: '槓桿 + 四連桿', analysis: '按下琴鍵 → 多段槓桿放大力量 → 連桿把擊槌「丟」向琴弦 → 立刻彈回（不擋阻尼）。' },
  { name: '挖土機鏟臂', icon: '🚜', mech: '液壓 + 四連桿', analysis: '液壓缸推連桿，把直線運動轉成大臂、小臂、鏟斗的擺動。3 組四連桿串聯。' },
  { name: '腳踏車後輪飛輪', icon: '⚙', mech: '棘輪', analysis: '踩踏板 = 鏈條帶飛輪 = 飛輪帶後輪。不踩時飛輪空轉、後輪繼續滑行（單向）。' },
];

const PK = 'mech_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('app-grid');
APPS.forEach(a => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid #14B8A6';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-size:28px">${a.icon}</span>
      <h4 style="margin:0;color:#0F766E;font-size:15px">${a.name}</h4>
    </div>
    <p style="font-size:13px;color:#0F766E;font-weight:700;background:#CCFBF1;padding:5px 10px;border-radius:5px;margin:6px 0">${a.mech}</p>
    <p style="font-size:13px;color:#666">${a.analysis}</p>`;
  grid.appendChild(card);
});

const QUIZ = [
  { q: '節拍器（metronome）做左右擺動', options: ['擺動運動', '往復運動', '旋轉運動'], correct: 0, explain: '繞固定軸做角度範圍內來回 = 擺動。和直線往復不同。' },
  { q: '電動鋸的鋸條快速上下動', options: ['旋轉運動', '往復運動', '間歇運動'], correct: 1, explain: '沿直線上下來回 = 往復。馬達旋轉透過曲柄滑塊變成此運動。' },
  { q: '汽車冷氣壓縮機', options: ['齒輪', '凸輪', '曲柄滑塊'], correct: 2, explain: '活塞在氣缸內壓縮冷媒 = 曲柄滑塊機構，把皮帶輪旋轉變成活塞往復。' },
  { q: '石英鐘錶的秒針一秒跳一格', options: ['旋轉運動', '間歇運動', '擺動運動'], correct: 1, explain: '動停動停 = 間歇。石英鐘錶用步進馬達一秒推一步實現（機械錶秒針則是連續掃動）。' },
  { q: '挖土機的鏟斗開合', options: ['凸輪', '螺旋', '四連桿'], correct: 2, explain: '液壓缸推連桿做出弧形軌跡 = 四連桿機構。' },
  { q: '電風扇葉片旋轉送風', options: ['擺動運動', '往復運動', '旋轉運動'], correct: 2, explain: '繞馬達軸做圓周運動 = 純旋轉。注意：搖頭風扇的「左右擺頭」才是擺動。' },
  { q: '腳踏車鏈條傳動', options: ['齒輪', '鏈條（皮帶族）', '曲柄滑塊'], correct: 1, explain: '前後齒盤用鏈條連接傳動 = 鏈條機構。鏈條無滑差，特別適合腳踏車。' },
  { q: '塑膠射出成型機把塑料推進模具', options: ['凸輪', '曲柄滑塊 / 螺桿', '四連桿'], correct: 1, explain: '螺桿旋轉推進塑料 + 油壓缸推進整組 = 螺桿（螺旋）+ 曲柄滑塊組合。' },
  { q: '【計算】主動輪 20 齒、從動輪 60 齒，這組齒輪的齒輪比是多少？', options: ['1/3', '3', '80'], correct: 1, explain: '齒輪比 = 從動輪齒數 ÷ 主動輪齒數 = 60 ÷ 20 = 3。從動輪轉速變成 1/3（減速），但扭力約放大 3 倍。' },
  { q: '【計算】馬達轉速 3000 RPM，接上齒輪比 5 的減速箱，輸出轉速是多少？', options: ['15000 RPM', '3000 RPM', '600 RPM'], correct: 2, explain: '減速箱把轉速除以齒輪比：3000 ÷ 5 = 600 RPM。轉速變慢，換來輸出扭力約放大 5 倍。' },
  { q: '【觀念】騎腳踏車上陡坡想踩得省力，該怎麼選齒輪組合？', options: ['大前齒盤 / 小後齒輪：快但費力', '小前齒盤 / 大後齒輪：慢但省力（大齒輪比）', '齒輪比不影響省不省力'], correct: 1, explain: '爬坡要的是「慢但大力矩」：小前齒盤配大後齒輪 = 大齒輪比（大減速比），後輪轉得慢、但同樣腳力換來更大扭力，上坡輕鬆。平地衝刺才用大前/小後。' },
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
