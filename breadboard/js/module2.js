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
    explain: '同一直行 5 個洞（同數字、不同字母，如 a1-e1）內部金屬條相連。上半（a-e）與下半（f-j）被中央溝槽分開。'
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
    explain: '電解電容（圓柱形、有金屬殼）有極性：本體負極側印有色帶（−）標示，接腳長者為正極。接反會讓化學反應失控、內部氣體膨脹。陶瓷電容（像小盤子）才沒有極性。'
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

/* ── 真實事故案例參考面板 ──────────────────────────────── */
;(function () {
  const CARD_ACCIDENT = 'background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const CARD_RESEARCH = 'background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const CARD_GOV     = 'background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const TL = 'font-size:12px;color:#1d4ed8;text-decoration:underline;word-break:break-all';

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">⚠️ 真實事故案例參考</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">以下為麵包板與電子實驗相關的安全事故案例與研究資料。</p>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">💥 電解電容接反爆炸｜大學物理實驗室案例</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">電解電容（Electrolytic Capacitor）若極性接反，內部化學反應失控後會造成電容外殼鼓脹、碎裂，甚至爆炸並飛射金屬碎片。美國多所大學實驗室安全報告記錄過因電容極性接錯而造成學生眼部受傷的案例。這正是焊接與實驗課嚴格要求戴護目鏡的原因之一。電解電容外殼上的「−」標記與短腳必須辨別清楚。</p>
      <a href="https://www.nsc.org/home-safety/tools-we-use/laboratory-safety" target="_blank" rel="noopener noreferrer" style="${TL}">📄 參考來源：NSC（National Safety Council）— Laboratory Safety（英文）</a>
    </div>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">🔋 9V 電池短路起火｜金屬接觸兩極即可引燃</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">9V 電池的「頂帽式」正負極相距僅數毫米，一枚硬幣、髮夾或導線同時接觸兩極便能形成低阻抗短路，電池在數秒內開始發熱並可能引燃接觸物。美國消費品安全委員會（CPSC）有記錄多起因 9V 電池存放不當（與金屬物混放在抽屜或口袋中）引發的居家火災。在電子實驗中，連接電路前務必先完成佈線再接電源。</p>
      <a href="https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Batteries" target="_blank" rel="noopener noreferrer" style="${TL}">📄 參考來源：CPSC — Battery Safety（英文）</a>
    </div>

    <div style="${CARD_RESEARCH}">
      <div style="font-weight:700;color:#1e40af;margin-bottom:6px">✈️ FAA 追蹤：鋰電池短路——2006–2024 年 780+ 起航班事件</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">美國聯邦航空管理局（FAA）長期追蹤商業航班上的鋰電池過熱與起火事件。自 2006 至 2024 年，記錄在案的鋰電池（行動電源、筆電、相機電池）火情超過 780 起，<strong>短路</strong>是最常見的觸發原因。鋰電池的熱失控（Thermal Runaway）一旦發生，在數秒內即無法控制。電子實驗課中即便是小型 CR2032 鈕扣電池，短路後也能在 30 秒內燙傷人體組織。</p>
      <a href="https://www.faa.gov/hazmat/resources/lithium_batteries/incidents" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：FAA — Lithium Battery Incident Chart（英文）</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;margin-top:4px">※ 以上連結均為政府官方或研究機構文件，引用於教學安全佐證之用。</p>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();
