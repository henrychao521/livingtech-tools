// 簡單機械 模組 3：MA 計算練習
const PROBLEMS = [
  {
    title: '題 1：撬棍移動石頭（第一類槓桿）',
    desc: '一根 1.5 m 撬棍，支點離石頭 0.3 m。石頭重 90 kgw（公斤重）。需要施力多少 kgw 才能撬起？',
    hint: 'MA = 施力臂 ÷ 抗力臂（施力臂 = 棍長 − 抗力臂）\n施力 = 抗力 ÷ MA',
    formula: 'MA = 施力臂 ÷ 抗力臂 = 1.2 ÷ 0.3 = 4 倍\n施力 = 抗力 ÷ MA = 90 ÷ 4 = 22.5 kgw',
    inputs: [{ label: '機械利益 MA', name: 'ma', ans: 4, unit: '倍' }, { label: '所需施力', name: 'f', ans: 22.5, unit: 'kgw' }],
    tolerance: 0.5,
  },
  {
    title: '題 2：滑輪組吊重物',
    desc: '一組動滑輪 + 定滑輪的滑輪組，繩子有 3 段支撐重物。要吊起重 60 kgw 的機具需要多大力氣？要拉繩子幾公尺才能讓機具上升 1 公尺？',
    hint: 'MA = 支撐重物的繩段數\n施力 = 抗力 ÷ MA\n拉繩距離 = 重物上升距離 × MA',
    formula: 'MA = 支撐繩段數 = 3 倍\n施力 = 60 ÷ 3 = 20 kgw\n拉繩距離 = 1 × 3 = 3 m',
    inputs: [{ label: 'MA', name: 'ma', ans: 3, unit: '倍' }, { label: '所需施力', name: 'f', ans: 20, unit: 'kgw' }, { label: '拉繩距離（機具升 1m）', name: 'd', ans: 3, unit: 'm' }],
    tolerance: 0.2,
  },
  {
    title: '題 3：斜面推上卡車',
    desc: '重 200 kgw 的貨物要推上卡車，車尾離地 1 m。斜面長 5 m。需要多大施力？',
    hint: 'MA = 斜面長度 ÷ 斜面高度\n施力 = 抗力 ÷ MA',
    formula: 'MA = 斜面長度 ÷ 斜面高度 = 5 ÷ 1 = 5 倍\n施力 = 200 ÷ 5 = 40 kgw',
    inputs: [{ label: 'MA', name: 'ma', ans: 5, unit: '倍' }, { label: '所需施力', name: 'f', ans: 40, unit: 'kgw' }],
    tolerance: 0.5,
  },
  {
    title: '題 4：方向盤輪軸',
    desc: '方向盤半徑 20 cm，轉向柱半徑 2 cm。轉方向盤施力 5 kgw，轉向柱（軸）上的力多少？',
    hint: 'MA = 輪半徑 ÷ 軸半徑\n軸上力 = 輪上施力 × MA',
    formula: 'MA = 輪半徑 ÷ 軸半徑 = 20 ÷ 2 = 10 倍\n軸上力 = 5 × 10 = 50 kgw',
    inputs: [{ label: 'MA', name: 'ma', ans: 10, unit: '倍' }, { label: '軸上力', name: 'f', ans: 50, unit: 'kgw' }],
    tolerance: 0.5,
  },
  {
    title: '題 5：開瓶器（第二類槓桿）',
    desc: '開紅酒用的侍酒師開瓶器，從支點到抗力（軟木塞）3 cm，從支點到施力（握把端）18 cm。軟木塞的抗力是 30 kgw，需要多大施力？',
    hint: 'MA = 施力臂 ÷ 抗力臂\n施力 = 抗力 ÷ MA',
    formula: 'MA = 18 ÷ 3 = 6 倍\n施力 = 30 ÷ 6 = 5 kgw',
    inputs: [{ label: 'MA', name: 'ma', ans: 6, unit: '倍' }, { label: '所需施力', name: 'f', ans: 5, unit: 'kgw' }],
    tolerance: 0.3,
  },
  {
    title: '題 6：螺絲千斤頂',
    desc: '螺絲千斤頂手柄長 30 cm，螺距 5 mm。轉手柄施 10 kgw 的力，可以舉起多重？（忽略摩擦）',
    hint: 'MA = 手柄轉一圈的距離 ÷ 螺距 = 2π × 手柄長 ÷ 螺距（注意單位要一致）\n可舉起重量 = 施力 × MA',
    formula: 'MA = 2π × 手柄長 ÷ 螺距 = 2 × 3.14 × 30 ÷ 0.5 ≈ 377 倍\n可舉起 = 10 × 377 = 3770 kgw',
    // MA 與重量數量級差很多，各欄位用自己的容許誤差（MA ±2、重量 ±20）
    inputs: [{ label: 'MA（取整數）', name: 'ma', ans: 377, unit: '倍', tolerance: 2 }, { label: '可舉起重量', name: 'f', ans: 3770, unit: 'kgw', tolerance: 20 }],
    tolerance: 20,
  },
];

const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const pb = document.getElementById('problems');
const progText = document.getElementById('prog-text');
const nextBtn = document.getElementById('next-btn');
let done = new Set((loadP().module3_done) || []);
// 評量設計：答錯第 1 次只標出哪一格不對＋提示公式；答錯第 2 次（或按「看詳解」）才公布正解與完整算式
const MAX_TRIES = 2;
const tries = PROBLEMS.map(() => 0);
const revealed = new Set();
// 作答紀錄（js/sheet-log.js）：計算題每一格算一題（t=other，a＝第一次填的數字、k＝正解，誤差內算對），
// 記第一次的答案與嘗試次數；全部格子都作答過時送一筆，沒做完就離開頁面也會送已作答的部分
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'exercise', sendOnLeave: true, questions: PROBLEMS.flatMap((p, i) =>
  p.inputs.map(inp => ({ key: 'p' + i + '.' + inp.name, t: 'other', stem: p.desc + '（求' + inp.label + '，單位 ' + inp.unit + '）', answer: String(inp.ans) }))) });
const SL_TOTAL = PROBLEMS.reduce((n, p) => n + p.inputs.length, 0);
PROBLEMS.forEach((p, i) => {
  const div = document.createElement('div');
  div.className = 'mc-prob';
  div.innerHTML = `
    <h4>${p.title}</h4>
    <p style="font-size:13.5px;color:#444;margin-bottom:10px">${p.desc}</p>
    <div class="mc-input">
      ${p.inputs.map((inp, j) => `<label style="font-size:13px">${inp.label}：<input type="number" data-q="${i}" data-i="${j}" step="0.1"> ${inp.unit}</label>`).join('')}
      <button data-q="${i}" data-act="check">檢查</button>
      <button data-q="${i}" data-act="giveup" class="mc-giveup">看詳解</button>
    </div>
    <details><summary style="cursor:pointer;font-size:12.5px;color:#DB2777;font-weight:700">查看公式（只有代數式）→</summary><pre class="formula" style="white-space:pre-wrap">${p.hint}</pre></details>
    <div class="mc-result" id="r${i}" style="display:none"></div>
    <div class="mc-solution" id="s${i}" style="display:none"><div style="font-size:12.5px;color:#9D174D;font-weight:700">完整算式</div><pre class="formula" style="white-space:pre-wrap">${p.formula}</pre></div>`;
  pb.appendChild(div);
});

function showSolution(i) {
  revealed.add(i);
  document.getElementById(`s${i}`).style.display = 'block';
}

pb.querySelectorAll('button[data-act="giveup"]').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  const p = PROBLEMS[i];
  if (SLQ) p.inputs.forEach(inp => { if (!SLQ.has('p' + i + '.' + inp.name)) SLQ.answer('p' + i + '.' + inp.name, '看詳解', { ok: false }); });
  const r = document.getElementById(`r${i}`);
  r.style.display = 'block';
  r.className = 'mc-result bad';
  r.textContent = '正確答案：' + p.inputs.map(inp => `${inp.label} ${inp.ans}${inp.unit}`).join('；') + '（看過詳解後，把答案自己算一次再按「檢查」就算完成）';
  showSolution(i);
}));

pb.querySelectorAll('button[data-act="check"]').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  const p = PROBLEMS[i];
  const inputs = pb.querySelectorAll(`input[data-q="${i}"]`);
  let allOK = true;
  let wrongs = [];
  inputs.forEach((inp, j) => {
    const ans = p.inputs[j].ans;
    const v = parseFloat(inp.value);
    const tol = p.inputs[j].tolerance ?? p.tolerance;
    const ok = !isNaN(v) && Math.abs(v - ans) <= tol;
    inp.style.borderColor = ok ? '#22c55e' : '#dc2626';
    if (SLQ) SLQ.answer('p' + i + '.' + p.inputs[j].name, inp.value.trim() || '（空白）', { ok });
    if (!ok) { allOK = false; wrongs.push(j); }
  });
  const r = document.getElementById(`r${i}`);
  r.style.display = 'block';
  if (allOK) {
    r.className = 'mc-result good';
    r.textContent = '✓ 正確！MA 公式運用得很好。';
    showSolution(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    done.add(i);
    const prog = loadP();
    prog.module3_done = Array.from(done);
    if (done.size === PROBLEMS.length) {
      prog.module3 = true;
      nextBtn.style.opacity = 1;
      nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      showToast('🎓 6 題全部答對！', 'good');
    }
    saveP(prog);
  } else {
    tries[i]++;
    r.className = 'mc-result bad';
    const names = wrongs.map(j => p.inputs[j].label).join('、');
    if (tries[i] < MAX_TRIES && !revealed.has(i)) {
      r.textContent = `✗ ${names} 不對。提示：先打開「查看公式」，確認代入的數字與單位，再算一次（還有 ${MAX_TRIES - tries[i]} 次機會才公布答案）。`;
    } else {
      r.textContent = '✗ 正確答案：' + wrongs.map(j => `${p.inputs[j].label} ${p.inputs[j].ans}${p.inputs[j].unit}`).join('；') + '。對照下面的完整算式，找出哪一步算錯。';
      showSolution(i);
    }
    if (typeof SoundFX !== 'undefined') SoundFX.error();
  }
  progText.textContent = `已答 ${done.size}/${PROBLEMS.length} 題`;
  if (SLQ && SLQ.count() === SL_TOTAL) SLQ.finish();
}));
progText.textContent = `已答 ${done.size}/${PROBLEMS.length} 題`;
if (done.size === PROBLEMS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
