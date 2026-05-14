// 結構模擬器 模組 5：挑戰 + 失效圖鑑
const CHALLENGES = [
  { name: '紙拖鞋承重', icon: '🩴', desc: '只用 A4 紙與膠水，做一雙拖鞋承重 50 公斤（一個學生）。', tips: '1. 鞋底用「波浪紙」（瓦楞紙原理）抗壓\n2. 鞋面用三角形加固\n3. 重點是「分散應力」，不要集中受力\n4. 教學要點：學瓦楞紙結構與三角形剛度', target: '承重 ≥ 50kg' },
  { name: '紙桁架橋負重', icon: '🌉', desc: '只用 A4 紙與膠水，做一座跨距 40cm 的紙橋，承重越多越好。', tips: '1. 紙捲成圓管比平面紙條強 5–10 倍\n2. 桁架選 Pratt 或 Warren\n3. 上弦受壓要用粗管、下弦受張可用紙條\n4. 節點是弱點——三角夾片補強\n5. 教學要點：學桁架原理與材料形態優化', target: '承重 ≥ 5kg（橋自重 < 50g）' },
  { name: '結構塔高度挑戰', icon: '🏗', desc: '用義大利麵 + 棉花糖，30 分鐘內蓋一座最高的塔，頂端放一顆棉花糖。', tips: '1. 底部要寬大、重心要低\n2. 全部用三角形組合\n3. 棉花糖很重——頂端構造要輕\n4. 預留 5 分鐘做最後測試\n5. 教學要點：學重心、剛度與時間管理', target: '高度越高越好（穩定 10 秒）' },
];

const FAILURES = [
  { name: '挫屈（Buckling）', symptom: '壓桿在受力到達彈性極限「前」突然側向彎折。', cause: '細長壓桿的特有失效。長細比 L/r 越大越容易發生。', fix: '縮短壓桿、增加桿件斷面、改用中空管（紙管比紙條強）、加側向支撐。', icon: '╲', color: '#dc2626' },
  { name: '剪切（Shear Failure）', symptom: '節點處材料突然「滑開」，桿件分離。', cause: '剪力超過材料剪切強度。常見於膠水節點、釘子被剪斷。', fix: '增加膠水接合面積、改用螺絲、加金屬連接片。', icon: '✂', color: '#dc2626' },
  { name: '彎矩失效（Bending Failure）', symptom: '樑中央向下彎曲，上面壓裂或下面拉斷。', cause: '彎矩超過樑的抵抗矩。中央受力的桿件最易發生。', fix: '加深樑（深度比寬度有效）、用 I 型斷面、減小跨距、改桁架。', icon: '∩', color: '#eab308' },
  { name: '節點脫開（Joint Separation）', symptom: '桿件本身完好但節點處膠水裂開、釘子拔出。', cause: '節點強度不足（膠水面積太小、釘子數量不夠）。', fix: '增大膠水面積、用兩種以上接合方式（膠+釘）、加三角夾片補強。', icon: '⊞', color: '#0891b2' },
  { name: '塑性變形（Plastic Deformation）', symptom: '荷重移除後結構不能恢復原狀，永久彎曲。', cause: '應力超過材料降伏強度但未到極限強度。', fix: '降低設計荷重、加大斷面、選用更強材料。', icon: '〰', color: '#eab308' },
  { name: '共振（Resonance）', symptom: '結構在某頻率下震幅越來越大直到崩壞。', cause: '荷重頻率與結構自然頻率相同。塔科馬橋（Tacoma Narrows）就是經典案例。', fix: '改變結構形狀避開共振頻率、加阻尼器、避免規律振動荷重。', icon: '〰', color: '#7C3AED' },
  { name: '基礎沉陷（Foundation Settlement）', symptom: '結構本身完好但底部下陷或傾斜（如比薩斜塔）。', cause: '地基承載力不足、軟土層下陷、不均勻沉陷。', fix: '加深加大基礎、土壤改良、用樁基礎。', icon: '↓', color: '#a16207' },
  { name: '疲勞（Fatigue）', symptom: '結構承受小於降伏強度的反覆荷重，多年後突然斷裂。', cause: '反覆應力造成材料內部裂紋累積。橋樑、飛機翼是高風險。', fix: '定期檢測、避免應力集中（圓角而非直角）、選抗疲勞材料。', icon: '💔', color: '#dc2626' },
];

const PK = 'struct_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cg = document.getElementById('chal-grid');
CHALLENGES.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;border-left:5px solid #1D4ED8';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:30px">${c.icon}</span><h4 style="margin:0;color:#1E3A8A">${c.name}</h4></div>
    <p style="font-size:13px;color:#444;margin:6px 0">${c.desc}</p>
    <p style="font-size:12.5px;color:#1D4ED8;font-weight:700;margin:6px 0">🎯 ${c.target}</p>
    <details><summary style="cursor:pointer;font-size:13px;font-weight:700;color:#1D4ED8">設計秘訣 →</summary><pre style="white-space:pre-wrap;font-size:12.5px;color:#444;margin-top:6px;font-family:inherit;line-height:1.7">${c.tips}</pre></details>`;
  cg.appendChild(card);
});

const fg = document.getElementById('fail-grid');
FAILURES.forEach(f => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid ${f.color}`;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:24px;color:${f.color}">${f.icon}</span><h4 style="margin:0;font-size:15px;color:${f.color}">${f.name}</h4></div>
    <p style="font-size:13px;color:#444;margin:4px 0"><strong>症狀：</strong>${f.symptom}</p>
    <p style="font-size:13px;color:#666;margin:4px 0"><strong>原因：</strong>${f.cause}</p>
    <details><summary style="cursor:pointer;font-size:13px;font-weight:700;color:${f.color}">預防方法 →</summary><p style="font-size:12.5px;color:#444;margin-top:6px;line-height:1.7">${f.fix}</p></details>`;
  fg.appendChild(card);
});

const QUIZ = [
  { situation: '一根長 40cm 的紙條當壓桿，加壓 200g 時還沒到紙的拉伸強度就突然向側面彎成 S 形。', options: ['挫屈', '彎矩失效', '節點脫開'], correct: 0, explain: '挫屈。細長壓桿的特有失效——壓力到極限「前」就側彎。要改用紙管（中空圓管抗壓強 10 倍）或縮短長度。' },
  { situation: '紙橋中央承重時，下方先看到紙裂開，上方看到紙皺起，最後從中央折斷。', options: ['剪切', '彎矩失效', '挫屈'], correct: 1, explain: '彎矩失效。中央受力樑的典型——下方受張、上方受壓。要加深樑（高度比寬度有效）或改成桁架。' },
  { situation: '紙橋的桿件完好，但兩根桿子相交的位置膠水裂開，整座橋散架。', options: ['挫屈', '塑性變形', '節點脫開'], correct: 2, explain: '節點脫開。膠水接合面積太小造成。要增大膠水面積，或加三角夾片補強，或加釘子。' },
  { situation: '結構塔做完後 30 分鐘，重心慢慢往一邊歪倒。', options: ['基礎沉陷', '共振', '疲勞'], correct: 0, explain: '基礎沉陷或重心不穩。實際結構是地基不均勻沉陷（如比薩斜塔），紙塔則是黏合慢慢變形。' },
  { situation: '橋樑在交通震動下使用 50 年後突然斷裂，平時看不出異狀。', options: ['剪切', '疲勞', '塑性變形'], correct: 1, explain: '疲勞。反覆應力造成內部裂紋累積，最後突然斷。橋、飛機翼、機械軸都是高風險，要定期檢測。' },
];

const quizEl = document.getElementById('calib-quiz');
let answered = new Set();
let quizScore = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
  div.innerHTML = `
    <p style="font-size:14px;color:#444;margin-bottom:6px"><strong>情境 ${i + 1}：</strong>${q.situation}</p>
    <div class="choice-grid">${q.options.map((o, j) => `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const correct = parseInt(btn.dataset.c) === QUIZ[i].correct;
  const parent = btn.closest('div');
  parent.querySelectorAll('.choice').forEach((b, k) => {
    b.disabled = true;
    if (k === QUIZ[i].correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}" style="margin-top:8px">${correct ? '✓' : '✗'} ${QUIZ[i].explain}</div>`;
  if (correct) { quizScore++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    const p = loadP();
    p.module5 = true;
    p.module5_quiz_score = quizScore;
    saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 完成！${quizScore} / ${QUIZ.length} 答對`, 'good');
  }
}));
