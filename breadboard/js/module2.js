// 麵包板平台 模組 2：安全闖關
const SCENARIOS = [
  {
    q: 'LED 接到電源前，最重要的是？',
    a: '確認 LED 方向（長腳接正、短腳接負）並串聯電阻',
    b: '直接把 LED 兩腳跨接到電池兩極',
    correct: 'a',
    explain: 'LED 沒有電阻保護會被電流燒毀。沒有方向也不會發光。串電阻 + 認方向是不變的兩個原則。'
  },
  {
    q: '電池正極不小心直接連到負極會發生什麼？',
    a: '電池會發熱、變形，甚至爆炸',
    b: '沒事，電池會自動斷電',
    correct: 'a',
    explain: '這就是「短路」。電池內部沒有電阻擋住電流，瞬間大電流會讓電池過熱。要立刻拔掉電源並通報老師。'
  },
  {
    q: '電路接好但 LED 不亮，第一步該做什麼？',
    a: '增加電池數量',
    b: '檢查極性、跳線是否插穩、有沒有插錯行',
    correct: 'b',
    explain: '90% 的故障都是接線錯誤。應系統性檢查每一段：電源 → 電阻 → LED → 回到電源。增加電池會燒掉元件。'
  },
  {
    q: '麵包板的 a1-b1-c1-d1-e1 之間：',
    a: '互相連通（金屬條相連）',
    b: '互相獨立',
    correct: 'a',
    explain: '同一行（橫向 5 個洞）內部金屬條相連。a 行到 e 行是一組，f 行到 j 行是另一組（被中央溝槽分開）。'
  },
  {
    q: '修改電路前應該？',
    a: '直接拔元件',
    b: '先斷電源（拆掉電池或關開關）',
    correct: 'b',
    explain: '帶電操作可能造成短路、電擊（雖然 5V 對人安全但會燒元件）。養成「斷電才動電路」的習慣。'
  },
  {
    q: '兩顆電池的正極要連到 LED，常用的接法是？',
    a: '兩個正極都用紅線連到正電源軌上',
    b: '混用紅黑線只要連對極性即可',
    correct: 'a',
    explain: '建立顏色慣例：紅 = + / 黑 = − / 其他 = 訊號。長期養成這習慣後，電路除錯變得很容易。'
  },
  {
    q: '電阻插反方向會怎樣？',
    a: '電阻會燒掉',
    b: '電阻沒有方向，正反一樣',
    correct: 'b',
    explain: '電阻沒有極性，正反都行。但 LED、二極體、電容（極性電容）有極性，插反有可能燒毀。'
  },
  {
    q: '看到電子元件冒煙、變色、變形，立刻怎麼做？',
    a: '繼續觀察看看會不會自己好',
    b: '立刻斷電源，等冷卻後再檢查',
    correct: 'b',
    explain: '冒煙是內部結構毀損的訊號。斷電 → 通風 → 等冷卻 → 找出原因（通常是短路或元件規格不對）→ 換新元件。'
  },
  {
    q: '電容（capacitor）有極性的那種，正極接錯會？',
    a: '只是不工作而已',
    b: '電容會鼓起，嚴重時爆炸',
    correct: 'b',
    explain: '電解電容（圓柱形、有金屬殼）有極性，腳上會標 + 或 −。接反會讓化學反應失控、內部氣體膨脹。陶瓷電容（像小盤子）才沒有極性。'
  },
  {
    q: '所有元件的負極（地、GND）應該連到哪？',
    a: '麵包板的負電源軌（−）',
    b: '隨便找個沒用到的洞',
    correct: 'a',
    explain: '負電源軌是整個電路的「共同地」，所有元件回流都到這。共地是電子電路的基本原則。'
  },
];

let scenarioScore = 0;
const PROGRESS_KEY_BB = 'breadboard_progress_v1';
function loadBBProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || {}; } catch { return {}; }
}
function saveBBProgress(p) {
  localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p));
}

function renderScenarios() {
  const list = document.getElementById('scenario-list');
  SCENARIOS.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'scenario';
    div.innerHTML = `
      <h4>${s.q}</h4>
      <div class="choice-grid">
        <button class="choice" data-q="${i}" data-c="a">A. ${s.a}</button>
        <button class="choice" data-q="${i}" data-c="b">B. ${s.b}</button>
      </div>
      <div class="feedback-slot"></div>
    `;
    list.appendChild(div);
  });
  list.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => answer(btn)));
}

const answered = new Set();
function answer(btn) {
  const i = parseInt(btn.dataset.q);
  const choice = btn.dataset.c;
  if (answered.has(i)) return;
  const s = SCENARIOS[i];
  const correct = choice === s.correct;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === s.correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML =
    `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓ 答對！' : '✗ 不正確。'} ${s.explain}</div>`;
  if (correct) {
    scenarioScore += 10;
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  document.getElementById('score-display').textContent = scenarioScore;
  document.getElementById('progress-bar').style.width = scenarioScore + '%';
  if (answered.size === SCENARIOS.length) {
    const result = document.getElementById('scenario-result');
    if (scenarioScore >= 90) {
      result.innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${scenarioScore} 分通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const prog = loadBBProgress();
      prog.module2 = true; prog.safetyPassed = true;
      saveBBProgress(prog);
    } else {
      result.innerHTML = `<div class="feedback error" style="margin-top:20px">${scenarioScore} 分，未達 90 分。請重新整理頁面再挑戰。</div>`;
    }
  }
}
renderScenarios();
