// 物理模擬實驗室 — 每支動畫 2 題觀念選擇題
// physics 未列入教師後台 TOOLS 清單，故僅做頁內完成徽章（localStorage 供徽章跨次保留）。
const PK = 'physics_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// key 對應 index.html 各 .sim-card 的 data-sim
const QUIZ = [
  { sim: 'bounce', q: '球每次反彈都比上一次低，主要原因是？', options: ['重力愈來愈強', '非彈性碰撞把部分力學能耗散成熱與聲音', '球愈跳愈重'], correct: 1, explain: '重力沒有變。球與地面是非彈性碰撞，每次碰撞都把一部分力學能耗散成熱、聲音與形變，能回彈的能量變少，高度自然愈來愈低。' },
  { sim: 'bounce', q: '如果球與地面是「完全彈性碰撞」（理想狀況），反彈高度會？', options: ['回到原來放開的高度', '愈彈愈高', '還是愈彈愈低'], correct: 0, explain: '完全彈性碰撞力學能守恆、不耗散，動能全部保留，球會回到原高度。現實中做不到，所以真實的球一定愈彈愈低。' },
  { sim: 'projectile', q: '同樣初速、忽略空氣阻力，哪個發射角度射程最遠？', options: ['35°', '45°', '55°'], correct: 1, explain: '45° 時水平速度與滯空時間的乘積最大，射程最遠。35° 與 55° 互為「互補角」，射程一樣但都比 45° 短。' },
  { sim: 'projectile', q: '拋體飛行中（忽略空氣阻力），水平方向的運動是？', options: ['等速運動', '等加速運動', '愈飛愈慢'], correct: 0, explain: '忽略空阻時水平方向沒有任何力，依慣性維持等速；只有垂直方向受重力做等加速運動。兩者合成就是拋物線。' },
  { sim: 'pendulum', q: '單擺的週期主要由什麼決定？', options: ['擺錘的質量', '擺長與重力加速度', '放開的力氣大小'], correct: 1, explain: '週期 T ≈ 2π√(L/g)，只跟擺長 L 和重力加速度 g 有關。這就是單擺等時性，也是擺鐘可以計時的原理。' },
  { sim: 'pendulum', q: '把擺錘換成兩倍重（擺長不變、小角度），週期會？', options: ['變成兩倍', '變成一半', '不變'], correct: 2, explain: '週期公式裡沒有質量——重的擺錘受力較大但慣性也較大，兩者抵消，週期不變。' },
  { sim: 'circular', q: '等速圓周運動的小球，速率固定，它有加速度嗎？', options: ['沒有，速率沒變就沒加速度', '有，因為速度「方向」一直在變（向心加速度）', '只有轉快時才有'], correct: 1, explain: '速度是有方向的量。方向一直在變，速度就一直在變，所以有加速度——方向指向圓心，稱為向心加速度，由向心力提供。' },
  { sim: 'circular', q: '若繩子突然斷掉（向心力消失），球會往哪個方向飛？', options: ['沿半徑向外飛出', '沿當時的切線方向直線飛出', '繼續繞圓圈'], correct: 1, explain: '失去向心力後沒有力再改變方向，依慣性沿「當下速度方向」＝圓的切線方向做直線運動。甩鏈球就是這樣出手的。' },
  { sim: 'freefall', q: '大球和小球從同高度同時放開會同時落地，原因是？', options: ['重力加速度 g 與質量無關', '空氣把輕的球往下推', '兩球剛好一樣重'], correct: 0, explain: '重的球受力大但慣性也大，加速度都是同一個 g（約 9.8 m/s²），所以忽略空氣阻力時輕重物體下落一樣快。伽利略的斜塔實驗講的就是這件事。' },
  { sim: 'freefall', q: '在抽成真空的管子裡，讓羽毛和鐵球同時落下，結果是？', options: ['鐵球先落地', '羽毛先落地', '兩者同時落地'], correct: 2, explain: '真空中沒有空氣阻力，羽毛和鐵球的加速度同為 g，同時落地。平常羽毛飄比較慢，是空氣阻力造成的，不是重力偏心。' },
  { sim: 'momentum', q: '等質量的正向彈性碰撞：移動球撞上靜止球後，移動球會？', options: ['自己停下來，速度全部交給對方', '反彈回去', '兩球黏在一起前進'], correct: 0, explain: '等質量彈性碰撞會「交換速度」：入射球停下、靜止球以原速度前進。同時滿足動量守恆與動能守恆。牛頓擺就是連續版的示範。' },
  { sim: 'momentum', q: '關於碰撞的守恆，下列哪個說法正確？', options: ['只有彈性碰撞動量才守恆', '不論彈性或非彈性碰撞，動量都守恆；但只有彈性碰撞動能不損失', '非彈性碰撞連動量都不守恆'], correct: 1, explain: '只要沒有外力，任何碰撞動量都守恆。差別在動能：彈性碰撞動能保留，非彈性碰撞才會把部分動能耗散成熱與聲音。' },
];

const TOTAL = QUIZ.length;
const badgeEl = document.getElementById('quiz-badge');
function renderBadge(score) {
  badgeEl.innerHTML = `<div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border-radius:14px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 14px rgba(14,165,233,.3)">
    <span style="font-size:32px">🏅</span>
    <div><strong style="font-size:16px">觀念挑戰完成徽章</strong><br><span style="font-size:13px;opacity:.9">12 題全部作答完成${typeof score === 'number' ? `，最近一次答對 ${score} / ${TOTAL} 題` : ''}</span></div>
  </div>`;
}

// 依 data-sim 把題目插進對應動畫卡片
QUIZ.forEach((q, i) => {
  const card = document.querySelector(`.sim-card[data-sim="${q.sim}"]`);
  if (!card) return;
  const div = document.createElement('div');
  div.className = 'sim-quiz';
  div.style.cssText = 'border-top:1px dashed #e2e8f0;margin-top:10px;padding-top:10px';
  div.innerHTML = `
    <p style="font-size:13.5px;margin-bottom:6px"><strong>觀念題：</strong>${q.q}</p>
    <div class="choice-grid">${q.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  card.appendChild(div);
});

let answered = new Set();
let quizCorrect = 0;
document.querySelectorAll('.sim-card .choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const correct = parseInt(btn.dataset.c) === QUIZ[i].correct;
  const parent = btn.closest('.sim-quiz');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ[i].explain}</div>`;
  if (correct) quizCorrect++;
  answered.add(i);
  if (answered.size === TOTAL) {
    const p = loadP();
    p.quiz_done = true;
    p.quiz_score = quizCorrect;
    saveP(p);
    renderBadge(quizCorrect);
    badgeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}));

// 上次已完成 → 直接顯示徽章（題目仍可再練習）
const saved = loadP();
if (saved.quiz_done) renderBadge(saved.quiz_score);
