// 結構模擬器 模組 2：6 種結構類型 + 測驗
const TYPES = [
  { id: 'truss', name: '桁架 Truss', principle: '由三角形組成。所有桿件只受軸力（張力/壓力），沒有彎矩。三角形是唯一不會變形的多邊形——這是桁架最強之處。', uses: '橋梁、屋頂、塔架、起重機臂', example: 'Eiffel Tower 艾菲爾鐵塔 / Forth Rail Bridge', viz: 'truss' },
  { id: 'arch', name: '拱 Arch', principle: '彎曲形狀把垂直荷重轉換成「沿拱身的壓力」。整體只受壓不受拉，適合磚石、混凝土等不耐拉的材料。', uses: '橋梁、洞穴、城門、教堂', example: 'Pont du Gard 羅馬輸水道 / Sydney Harbour Bridge', viz: 'arch' },
  { id: 'cable', name: '纜索懸吊 Cable / Suspension', principle: '用鋼纜把橋面「吊」起來。鋼纜純受張力——張力構件不會挫曲，可以做超長跨距。', uses: '長跨距橋梁、纜車、屋頂', example: 'Golden Gate Bridge 金門大橋 / Akashi Kaikyō Bridge', viz: 'cable' },
  { id: 'frame', name: '框架 Frame', principle: '由樑（橫）+ 柱（直）組成，節點為剛接。可承受垂直、水平、彎矩多種力——適合需要大空間且開窗的建築。', uses: '高樓、住宅、體育館', example: 'Taipei 101 / Burj Khalifa 哈里發塔', viz: 'frame' },
  { id: 'shell', name: '殼結構 Shell', principle: '薄而曲的面，靠形狀承力——蛋殼原理。應力分布在整個殼面上，材料用量極少卻很強。', uses: '體育館屋頂、貝殼、頭骨、汽車車身', example: 'Sydney Opera House 雪梨歌劇院 / Pantheon 萬神殿圓頂', viz: 'shell' },
  { id: 'tensile', name: '張拉結構 Tensile', principle: '用纖維、薄膜、纜索組成的純張力結構。沒有壓桿，所以可以非常輕。形狀依張力分布動態確定。', uses: '帳篷、體育場屋頂、雕塑', example: 'Munich Olympic Stadium 慕尼黑奧運場 / Denver Airport', viz: 'tensile' },
];

// 立體圖：OpenSCAD 參數化建模 → STL → 等角 PNG
// 6 個 .scad 檔在 models/structure-sim/，由 scripts/build_models.sh 自動編譯
const VIZ_NAMES = ['truss', 'arch', 'cable', 'frame', 'shell', 'tensile'];
const VIZ = Object.fromEntries(VIZ_NAMES.map(n => [
  n,
  `<img src="../../models/structure-sim/${n}-iso.png" alt="${n}" style="width:100%;height:140px;object-fit:contain;background:#1E293B;border-radius:8px;display:block" loading="lazy">`
]));

const PK = 'struct_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const seenTypes = new Set((loadP().module2_seen) || []);
const tg = document.getElementById('type-grid');
TYPES.forEach(t => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;transition:all .2s';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:80px;height:50px">${VIZ[t.viz]}</div>
      <h4 style="margin:0;color:#1E3A8A;font-size:15px">${t.name}</h4>
    </div>
    <p style="font-size:12.5px;color:#555;margin:4px 0"><strong>原理：</strong>${t.principle}</p>
    <p style="font-size:12px;color:#666;margin:4px 0"><strong>用途：</strong>${t.uses}</p>
    <p style="font-size:11.5px;color:#888"><strong>例子：</strong>${t.example}</p>`;
  card.addEventListener('click', () => {
    seenTypes.add(t.id);
    card.style.borderColor = '#1D4ED8';
    card.style.background = '#DBEAFE';
    syncTypes();
  });
  if (seenTypes.has(t.id)) { card.style.borderColor = '#1D4ED8'; card.style.background = '#DBEAFE'; }
  tg.appendChild(card);
});

function syncTypes() {
  const p = loadP();
  p.module2_seen = Array.from(seenTypes);
  saveP(p);
  updateQuizProg();
}

// 結構類型測驗
const QUIZ = [
  { q: '艾菲爾鐵塔（Eiffel Tower）', ans: 'truss', explain: '整座塔由熟鐵桿件交錯成無數三角形（格構），桿件主要受張力或壓力——這是桁架。' },
  { q: '羅馬鬥獸場拱門', ans: 'arch', explain: '一圈圈半圓形開口把上方的重量沿著弧形往兩側「壓」下去，石材只受壓——這是拱。' },
  { q: '金門大橋（Golden Gate）', ans: 'cable', explain: '兩座高塔之間掛著主纜，再用吊索把橋面吊起來，主纜只受張力——這是纜索懸吊（懸索橋）。' },
  { q: 'Taipei 101', ans: 'frame', explain: '由巨柱與各層的樑組成、節點剛接的骨架，能同時抵抗重力、風力與地震的側向力——這是框架。（它的巨柱之間還有斜撐與外伸桁架加強。）' },
  { q: '雪梨歌劇院屋頂', ans: 'shell', explain: '屋頂是一片片彎曲的薄殼，靠「曲面形狀」把力分散到整個面上——這是殼結構。' },
  { q: '帳篷', ans: 'tensile', explain: '布面與營繩都被拉緊、只受張力，靠營柱撐起形狀——這是張拉結構。' },
  { q: '木橋桁架', ans: 'truss', explain: '木條組成一個接一個的三角形，桿件只受軸力（張力或壓力）——這是桁架。' },
  { q: '萬神殿圓頂', ans: 'shell', explain: '混凝土圓頂是彎曲的連續曲面，重量沿曲面分散往下傳——這是殼結構（圓頂可以想成拱繞中心轉一圈）。' },
];
const quizEl = document.getElementById('quiz');
// 作答紀錄（js/sheet-log.js）：全部答完送一筆
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: QUIZ.map((q, i) => ({ key: 'q' + i, t: 'single', stem: q.q + ' 屬於哪一種結構？', options: TYPES.map(t => t.name), answer: TYPES.findIndex(t => t.id === q.ans) })) });
let answered = new Set();
let quizCorrect = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
    <div class="choice-grid" style="grid-template-columns:repeat(3,1fr)">
      ${TYPES.map(t => `<button class="choice" data-q="${i}" data-c="${t.id}">${t.name.split(' ')[0]}</button>`).join('')}
    </div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const q = QUIZ[i];
  const correct = btn.dataset.c === q.ans;
  if (SLQ) SLQ.answer('q' + i, TYPES.findIndex(t => t.id === btn.dataset.c));
  const parent = btn.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === q.ans) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  const ansName = TYPES.find(t => t.id === q.ans).name;
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓ 正確' : `✗ 正確答案：${ansName}`}<br><span style="font-size:13px">${q.explain}</span></div>`;
  if (correct) { quizCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  updateQuizProg();
  if (answered.size === QUIZ.length) {
    if (SLQ) SLQ.finish({ score: quizCorrect, max: QUIZ.length });
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

function updateQuizProg() {
  document.getElementById('quiz-prog').textContent = `類型 ${seenTypes.size}/6 ・ 測驗 ${answered.size}/${QUIZ.length}`;
}
updateQuizProg();
// 已通關過（localStorage 有紀錄）→ 重新整理或重新進入時直接解鎖下一關
if (loadP().module2) {
  document.getElementById('next-btn').style.opacity = 1;
  document.getElementById('next-btn').style.pointerEvents = 'auto';
}
