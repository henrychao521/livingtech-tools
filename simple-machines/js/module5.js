// 簡單機械 模組 5：生活應用
const ITEMS = [
  { name: '剪刀', icon: '✂', machine: '槓桿（第一類）×2', analysis: '兩根第一類槓桿共用一個支點。手指施力小、距離長；刀刃前端力大、距離短。' },
  { name: '筷子', icon: '🥢', machine: '槓桿（第三類）', analysis: '拇指根部夾住筷子的地方是支點、手指在中段施力、筷尖夾住的食物是抗力——施力在中間，是第三類槓桿。費力但筷尖移動大、夾得精準。' },
  { name: '指甲剪', icon: '💅', machine: '槓桿（第二類） + 楔形', analysis: '壓柄是第二類槓桿（前端插銷是支點、中間凸點壓刀片是抗力、尾端手壓施力）；刀口在最前端，兩片刀刃是相對的楔形。' },
  { name: '螺絲起子', icon: '🪛', machine: '輪軸', analysis: '握把是「輪」、軸是螺絲頭。粗握把扭力大，省力轉動細螺絲。' },
  { name: '腳踏車', icon: '🚲', machine: '輪軸 + 槓桿 + 鏈輪（齒輪）傳動', analysis: '輪子是大輪、踏板曲柄是力臂（槓桿）、變速器有齒輪輪軸、煞車是槓桿。' },
  { name: '樓梯', icon: '🪜', machine: '斜面', analysis: '把樓層的高度分散成多個小台階，每一步只需克服小高度。比直接爬牆省力。' },
  { name: '無障礙坡道', icon: '♿', machine: '斜面', analysis: '與樓梯同原理但無台階，輪椅、推車適用。坡度越緩 MA 越大。' },
  { name: '斧頭', icon: '🪓', machine: '楔形 + 槓桿', analysis: '斧頭刃是楔形劈開木材；握把是第三類槓桿放大揮動的速度。' },
  { name: '寶特瓶蓋', icon: '🥤', machine: '螺旋', analysis: '瓶蓋內螺紋與瓶口外螺紋配對。轉動圓周距離換成上下移動，密封容器。' },
  { name: '阿基米德螺旋抽水機', icon: '💧', machine: '螺旋', analysis: '管中螺旋桿轉動時，水沿螺旋向上「爬」。古埃及就用來灌溉農田。' },
  { name: '健身房滑輪訓練機', icon: '🏋', machine: '滑輪組', analysis: '透過滑輪改變力方向 + 動滑輪省力。可選不同重量片 + 不同滑輪段數。' },
  { name: '門把', icon: '🚪', machine: '輪軸', analysis: '門把外圈是大輪，內部轉軸是小軸。手轉門把的力小但距離長，內軸力大距離短才能轉動門栓。' },
];

const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const grid = document.getElementById('item-grid');
ITEMS.forEach(it => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid #DB2777';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-size:30px">${it.icon}</span>
      <h4 style="margin:0;color:#9D174D">${it.name}</h4>
    </div>
    <p style="font-size:13px;color:#DB2777;font-weight:700;background:#FCE7F3;padding:6px 10px;border-radius:6px;margin:6px 0">${it.machine}</p>
    <p style="font-size:13px;color:#666">${it.analysis}</p>`;
  grid.appendChild(card);
});

const QUIZ = [
  { name: '螺絲', icon: '🔩', options: ['螺旋', '楔形', '槓桿'], correct: 0, explain: '螺絲是「斜面捲在圓柱上」——典型的螺旋。' },
  { name: '滑梯', icon: '🛝', options: ['楔形', '斜面', '滑輪'], correct: 1, explain: '滑梯是斜面，把高度轉成水平距離。' },
  { name: '釣魚竿', icon: '🎣', options: ['槓桿（第一類）', '滑輪', '槓桿（第三類）'], correct: 2, explain: '一手壓住竿尾當支點、另一手在前方提竿施力、竿尖的魚是抗力——施力在中間，是第三類。' },
  { name: '木工手搖螺旋鑽（前端有螺紋導尖）', icon: '🪵', options: ['螺旋', '楔形', '輪軸'], correct: 0, explain: '前端的螺紋導尖像螺絲一樣咬進木頭，每轉一圈就把鑽頭往內拉一個螺距——這是螺旋原理。（對照：一般電鑽用的麻花鑽不同，外圍的螺旋槽主要是把切屑往外排，真正切削的是刃口的楔形，往下鑽進要靠你施加的推力。）' },
  { name: '旋轉門把（喇叭鎖）', icon: '🚪', options: ['槓桿', '輪軸', '滑輪'], correct: 1, explain: '門把是輪軸——外圈大、內軸小，用大半徑省力轉動門栓。' },
  { name: '門擋', icon: '🪨', options: ['斜面', '槓桿', '楔形'], correct: 2, explain: '門擋是楔形——把門縫間距插滿，靠摩擦力鎖死。' },
  { name: '帆船的桅杆繩索', icon: '⛵', options: ['滑輪', '槓桿', '輪軸'], correct: 0, explain: '升降帆都用滑輪——改變力方向（往下拉繩 = 帆往上升）。' },
  { name: '鋸子的鋸齒', icon: '🪚', options: ['螺旋', '楔形', '輪軸'], correct: 1, explain: '每一個鋸齒都是楔形——切入材料把它剝開。' },
];

const quizEl = document.getElementById('quiz');
// 作答紀錄（js/sheet-log.js）：全部答完送一筆
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: QUIZ.map((q, i) => ({
  key: 'q' + i, t: 'single', stem: q.name + ' 主要使用哪種簡單機械？', options: q.options, answer: q.correct })) });
let answered = new Set();
let quizCorrect = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.classList.add('quiz-item');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;margin-bottom:6px"><strong>${q.icon} 題 ${i + 1}：</strong>${q.name} 主要使用哪種簡單機械？</p>
    <div class="choice-grid">${q.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const correct = parseInt(btn.dataset.c) === QUIZ[i].correct;
  if (SLQ) SLQ.answer('q' + i, parseInt(btn.dataset.c));
  const parent = btn.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓ 正確' : '✗'} ${QUIZ[i].explain}</div>`;
  if (correct) { quizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    if (SLQ) SLQ.finish({ score: quizCorrect, max: QUIZ.length });
    const p = loadP();
    p.module5 = true;
    p.module5_quiz_score = quizCorrect;
    saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${quizCorrect} / ${QUIZ.length} 答對`, 'good');
  }
}));
