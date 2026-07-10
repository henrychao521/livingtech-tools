// 簡單機械 模組 3：MA 計算練習
const PROBLEMS = [
  {
    title: '題 1：撬棍移動石頭（第一類槓桿）',
    desc: '一根 1.5 m 撬棍，支點離石頭 0.3 m。石頭 90 kg。需要施力多少 kg 才能撬起？',
    formula: 'MA = 施力臂 ÷ 阻力臂 = 1.2 ÷ 0.3 = 4 倍\n施力 = 抗力 ÷ MA = 90 ÷ 4 = 22.5 kg',
    inputs: [{ label: '機械利益 MA', name: 'ma', ans: 4, unit: '倍' }, { label: '所需施力', name: 'f', ans: 22.5, unit: 'kg' }],
    tolerance: 0.5,
  },
  {
    title: '題 2：滑輪組吊重物',
    desc: '一組動滑輪 + 定滑輪的滑輪組，繩子有 3 段支撐重物。要吊起 60 kg 機具需要多大力氣？要拉繩子幾公尺才能讓機具上升 1 公尺？',
    formula: 'MA = 支撐繩段數 = 3 倍\n施力 = 60 ÷ 3 = 20 kg\n拉繩距離 = 1 × 3 = 3 m',
    inputs: [{ label: 'MA', name: 'ma', ans: 3, unit: '倍' }, { label: '所需施力', name: 'f', ans: 20, unit: 'kg' }, { label: '拉繩距離（機具升 1m）', name: 'd', ans: 3, unit: 'm' }],
    tolerance: 0.2,
  },
  {
    title: '題 3：斜面推上卡車',
    desc: '貨物 200 kg 要推上卡車，車尾離地 1 m。斜面長 5 m。需要多大施力？',
    formula: 'MA = 斜面長度 ÷ 斜面高度 = 5 ÷ 1 = 5 倍\n施力 = 200 ÷ 5 = 40 kg',
    inputs: [{ label: 'MA', name: 'ma', ans: 5, unit: '倍' }, { label: '所需施力', name: 'f', ans: 40, unit: 'kg' }],
    tolerance: 0.5,
  },
  {
    title: '題 4：方向盤輪軸',
    desc: '方向盤半徑 20 cm，轉向柱半徑 2 cm。轉方向盤施力 5 kg，轉向柱（軸）上的力多少？',
    formula: 'MA = 輪半徑 ÷ 軸半徑 = 20 ÷ 2 = 10 倍\n軸上力 = 5 × 10 = 50 kg',
    inputs: [{ label: 'MA', name: 'ma', ans: 10, unit: '倍' }, { label: '軸上力', name: 'f', ans: 50, unit: 'kg' }],
    tolerance: 0.5,
  },
  {
    title: '題 5：開瓶器（第二類槓桿）',
    desc: '開酒瓶用的酒侍開瓶器，從支點到抗力（瓶蓋）3 cm，從支點到施力（握把端）18 cm。要拔出 30 kg 力的瓶蓋，需要多大施力？',
    formula: 'MA = 18 ÷ 3 = 6 倍\n施力 = 30 ÷ 6 = 5 kg',
    inputs: [{ label: 'MA', name: 'ma', ans: 6, unit: '倍' }, { label: '所需施力', name: 'f', ans: 5, unit: 'kg' }],
    tolerance: 0.3,
  },
  {
    title: '題 6：螺絲千斤頂',
    desc: '螺絲千斤頂手柄長 30 cm，螺距 5 mm。轉一圈手柄施 10 kg 力，可以舉起多重？（忽略摩擦）',
    formula: 'MA = 2π × 手柄長 ÷ 螺距 = 2 × 3.14 × 30 ÷ 0.5 ≈ 377 倍\n可舉起 = 10 × 377 = 3770 kg',
    inputs: [{ label: 'MA（取整數）', name: 'ma', ans: 377, unit: '倍' }, { label: '可舉起重量', name: 'f', ans: 3770, unit: 'kg' }],
    tolerance: 50,
  },
];

const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const pb = document.getElementById('problems');
const progText = document.getElementById('prog-text');
const nextBtn = document.getElementById('next-btn');
let done = new Set((loadP().module3_done) || []);
PROBLEMS.forEach((p, i) => {
  const div = document.createElement('div');
  div.className = 'mc-prob';
  div.innerHTML = `
    <h4>${p.title}</h4>
    <p style="font-size:13.5px;color:#444;margin-bottom:10px">${p.desc}</p>
    <div class="mc-input">
      ${p.inputs.map((inp, j) => `<label style="font-size:13px">${inp.label}：<input type="number" data-q="${i}" data-i="${j}" step="0.1"> ${inp.unit}</label>`).join('')}
      <button data-q="${i}">檢查</button>
    </div>
    <details><summary style="cursor:pointer;font-size:12.5px;color:#DB2777;font-weight:700">查看公式 →</summary><pre class="formula" style="white-space:pre-wrap">${p.formula}</pre></details>
    <div class="mc-result" id="r${i}" style="display:none"></div>`;
  pb.appendChild(div);
});

pb.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  const p = PROBLEMS[i];
  const inputs = pb.querySelectorAll(`input[data-q="${i}"]`);
  let allOK = true;
  let wrongs = [];
  inputs.forEach((inp, j) => {
    const ans = p.inputs[j].ans;
    const v = parseFloat(inp.value);
    if (isNaN(v) || Math.abs(v - ans) > p.tolerance) {
      allOK = false;
      wrongs.push(`${p.inputs[j].label}：正確答案 ${ans}${p.inputs[j].unit}`);
    }
  });
  const r = document.getElementById(`r${i}`);
  r.style.display = 'block';
  if (allOK) {
    r.className = 'mc-result good';
    r.textContent = '✓ 正確！MA 公式運用得很好。';
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
    r.className = 'mc-result bad';
    r.textContent = '✗ ' + wrongs.join('；');
    if (typeof SoundFX !== 'undefined') SoundFX.error();
  }
  progText.textContent = `已答 ${done.size}/${PROBLEMS.length} 題`;
}));
progText.textContent = `已答 ${done.size}/${PROBLEMS.length} 題`;
if (done.size === PROBLEMS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
