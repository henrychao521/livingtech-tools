// 橋樑工程師實驗室 模組 5：歷史橋樑失敗案例 + 診斷測驗
const PK = 'structure_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

/* ── 8 件歷史案例 ──────────────────────────────────────── */
const CASES = [
  {
    id: 'tacoma', name: '塔科馬海峽吊橋', year: 1940, country: '🇺🇸 美國',
    failType: 'vibration', failLabel: '空氣動力共振',
    summary: '1940年開通後僅 4 個月，橋面在 64km/h 的風中開始扭曲震盪，最終崩塌落入海中。',
    detail: `<p>塔科馬海峽吊橋（Tacoma Narrows Bridge）開通日期 1940.07.01，崩塌日期 1940.11.07——只有 4 個月壽命。</p>
      <p>失敗原因：設計工程師 Leon Moisseiff 把橋面設計得太「薄」（固體實心板），風速 64km/h 時橋面開始以「扭轉」模式共振，振幅越來越大，最終桿件斷裂落水。</p>
      <p><strong>物理機制（顫振 Flutter）：</strong>橋面受側風產生升力，升力引發旋轉，旋轉改變攻角再產生更大升力——正回饋迴路讓振幅指數成長。這與飛機機翼失速不同，是純粹的空氣彈性問題。</p>
      <p><strong>事後改善：</strong>現代吊橋橋面改用「箱型截面」（box girder），側面設計成流線型或格柵型，讓側風能穿透，不產生旋轉升力。台灣高雄斜張橋的橋面剖面也考慮了這個問題。</p>`,
    lesson: '橋樑設計必須考慮動力效應（風振、地震）而非只考慮靜態荷重。',
  },
  {
    id: 'quebec', name: '魁北克大橋', year: 1907, country: '🇨🇦 加拿大',
    failType: 'buckling', failLabel: '壓桿挫屈（設計錯誤）',
    summary: '1907 年建設中橋樑突然崩塌，75 名工人罹難。原因是主桿件截面積設計不足，壓力超過挫屈極限。',
    detail: `<p>魁北克大橋（Quebec Bridge）是世界上跨度最大的懸臂桁架橋，跨度 549m。1907 年第一次建設時，建設中突然崩塌，75 名工人罹難；1916 年第二次建設時，中間箱型桁架吊裝落水，又有 13 人罹難。歷經兩次災難才於 1917 年完工。</p>
      <p><strong>主要原因：</strong>設計工程師 Theodore Cooper 錯誤計算了懸臂桿件（lower chord near pier）的實際重量，低估了約 10%。當施工時桿件重量累積到超過設計值，靠近橋墩的受壓下弦桿開始挫屈（側向彎折），瞬間引發連鎖崩塌。</p>
      <p><strong>工程教訓：</strong>1. 計算誤差在大型結構中會指數放大；2. 壓桿（compression member）的挫屈臨界力必須有足夠安全係數；3. 獨立的第三方審查（peer review）至關重要。</p>
      <p>加拿大工程師學會從此以魁北克橋的鐵片製作「工程師戒指（Iron Ring）」，提醒工程師對公眾安全的責任。</p>`,
    lesson: '壓桿設計必須計算挫屈臨界力（Euler 公式），並進行獨立審查。',
  },
  {
    id: 'silver', name: '銀橋', year: 1967, country: '🇺🇸 美國',
    failType: 'fatigue', failLabel: '腐蝕疲勞（眼板裂縫）',
    summary: '1967年12月，俄亥俄州銀橋在尖峰時段突然崩塌，46人罹難。原因是關鍵眼板銷孔因腐蝕疲勞產生裂縫，SF由3降至不足1。',
    detail: `<p>Point Pleasant Bridge（俗稱銀橋，Silver Bridge）建於 1928 年，1967.12.15 崩塌，46 人罹難，9 輛車跌落俄亥俄河。事後調查耗時 2 年才找到真正原因。</p>
      <p><strong>主要原因：</strong>懸吊鏈的眼板（eyebar，一種傳力連接件）在銷孔（pin hole）處，因設計時允許應力集中，加上 40 年的腐蝕環境（氯離子 + 水 + 交通振動）產生微裂縫，裂縫擴展到臨界長度後在一瞬間斷裂，整條鏈失效，引發連鎖倒塌。</p>
      <p><strong>工程教訓：</strong>1. 疲勞（fatigue）壽命與應力幅（stress range）和循環次數有關，需設計疲勞壽命；2. 腐蝕會大幅加速疲勞裂縫成長；3. 橋樑需要定期檢查（尤其是關鍵節點連接件）；4. 「冗餘設計」（redundancy）——任何單一桿件斷裂不應引發整體倒塌。</p>
      <p>此事故促使美國建立「國家橋樑檢查計畫（NBIP）」，要求每 2 年強制定期檢查所有公路橋。</p>`,
    lesson: '腐蝕+疲勞的組合比單一因素危險得多。冗餘設計和定期檢查缺一不可。',
  },
  {
    id: 'i35w', name: 'I-35W 明尼蘇達橋', year: 2007, country: '🇺🇸 美國',
    failType: 'design', failLabel: '節點板太薄（設計監督失誤）',
    summary: '2007年8月，明尼蘇達州 I-35W 橋在尖峰車流中突然崩塌，13 人罹難，145 人受傷。根本原因是1960年代設計的節點鋼板比規定薄了一半。',
    detail: `<p>I-35W 密西西比河橋（Minneapolis）建於 1967 年，2007.08.01 晚間 6:05 崩塌——尖峰時段、橋上正在施工，堆放額外重量（混凝土攪拌機、護欄材料）。</p>
      <p><strong>主要原因：</strong>NTSB 調查確認，原設計圖上的節點板（gusset plate，連接多根桿件的鋼板）厚度計算有誤——設計值應為 1 英寸（25.4mm），但實際建造只有 0.5 英寸（12.7mm）。這個設計錯誤在 1967 年被審查漏過，2001、2004年的橋樑定期檢查也未發現（沒有詳細重新計算）。2007 年施工加載重是壓垮駱駝的最後一根稻草。</p>
      <p><strong>工程教訓：</strong>1. 節點板（gusset plate）是多桿件力匯集點，應力集中嚴重，是最需要審查的部位；2. 定期檢查應包含「結構分析重算」而非只有目視；3. 臨時施工荷重應納入結構評估。</p>`,
    lesson: '隱藏的設計錯誤可能潛伏數十年，定期重新計算結構安全性和目視檢查同樣重要。',
  },
  {
    id: 'sungsu', name: '聖水大橋', year: 1994, country: '🇰🇷 韓國',
    failType: 'fatigue', failLabel: '疲勞斷裂（維護不足）',
    summary: '1994年10月，首爾聖水大橋中央桁架突然墜落，32人罹難。原因是懸吊構件因疲勞裂縫斷裂，事前已有腐蝕跡象但遭忽視。',
    detail: `<p>聖水大橋（성수대교）建於 1979 年，是橫跨漢江的主要幹道。1994.10.21 早上 7:38，橋中央一段（48m）突然墜落漢江，16 部車跌落，32 人罹難。</p>
      <p><strong>主要原因：</strong>連接上弦桿和橋面桁架的懸吊桿件（hanger）因施工品質不足（焊接接頭有缺陷）加上 15 年使用期間的疲勞循環，裂縫從焊接缺陷處擴展。事前已有橋面裂縫、滲水等警告訊號，但未進行詳細調查或修繕。</p>
      <p><strong>工程教訓：</strong>1. 施工品質控制（QC）——焊接檢查不合格就不能驗收；2. 維護不是「可選項」，是結構壽命的保障；3. 公眾可見的劣化（滲水、裂縫）往往是更嚴重內部問題的外部訊號。</p>
      <p>此事故促使韓國全面重新檢查全國橋樑，次年（1995）三豐百貨崩塌更引爆社會對建築安全的全面反省。</p>`,
    lesson: '可見的劣化跡象（滲水、裂縫）是緊急警訊，絕不能忽視，必須立即停用並工程評估。',
  },
  {
    id: 'fiu', name: 'FIU 行人天橋', year: 2018, country: '🇺🇸 美國',
    failType: 'buckling', failLabel: '施工失誤（早拆支撐）',
    summary: '2018年3月，佛羅里達國際大學新建行人橋在安裝中崩塌，6人罹難。原因是施工方在未得到結構師確認下收緊端拉索，引發主桁架壓力破壞。',
    detail: `<p>FIU 行人天橋（Florida International University Pedestrian Bridge）是一座創新設計的預鑄混凝土桁架橋，2018.03.15 進行「就位後調整」作業，施工方對斜桿拉索進行張拉，當晚橋面崩塌落於馬路，正在等候紅綠燈的 8 輛車被壓，6 人罹難。</p>
      <p><strong>主要原因：</strong>1. 施工方在未通知結構工程師的情況下對斜桿張拉，改變了結構內力分配；2. 北端某桁架節點受壓超過混凝土極限而崩碎；3. 就在崩塌前，結構工程師（MCM）雖已接到施工人員電話詢問裂縫問題，但沒有建議立即停用橋下道路。</p>
      <p><strong>工程教訓：</strong>1. 施工中任何結構調整必須有工程師書面授權；2. 一旦發現裂縫，應立即疏散並進行工程評估；3. 創新工法需要更謹慎的施工監控計畫。</p>`,
    lesson: '施工過程中的任何結構調整，都需要結構工程師的書面授權和確認，不能憑施工人員判斷。',
  },
  {
    id: 'jiji', name: '集集大橋（台灣）', year: 1999, country: '🇹🇼 台灣',
    failType: 'earthquake', failLabel: '地震損毀（橋墩剪力破壞）',
    summary: '1999年921集集大地震（M7.3），南投集集大橋多個橋墩發生「剪力破壞」，橋樑部分傾斜崩塌，成為台灣橋樑耐震設計改革的關鍵案例。',
    detail: `<p>集集大橋橫跨濁水溪，是南投的重要幹道。1999.09.21 凌晨 1:47 集集大地震（Mw=7.3，震央在集集附近），大橋多處橋墩發生「剪力破壞」——橋墩剪筋（箍筋）間距過大，無法約束混凝土在地震時不崩解，引發橋柱斷裂傾斜。</p>
      <p><strong>主要原因：</strong>1. 舊版設計規範（1981年以前）未充分考慮台灣地震強度，箍筋間距規定過鬆；2. 橋墩高度較高（柱細長比大），在水平地震力下剪力需求高；3. 舊橋未進行耐震補強。</p>
      <p><strong>事後改善：</strong>台灣於2000年大幅修訂橋樑耐震設計規範，要求舊橋進行耐震評估並補強（加碳纖維包覆或外加鋼板）。新建橋樑採用「能量耗散設計」——允許部分構件在大地震下塑性鉸，但整體不崩塌。</p>`,
    lesson: '台灣每座橋都必須進行耐震設計。舊橋的耐震補強（retrofit）是工程上不可省略的公共安全投資。',
  },
  {
    id: 'gaoping', name: '高屏大橋斷裂（台灣）', year: 2000, country: '🇹🇼 台灣',
    failType: 'fatigue', failLabel: '超重車輛 + 洪水沖刷（沖蝕破壞）',
    summary: '2000年颱風後，高屏大橋（西拉雅大橋）其中一段突然倒塌，超重砂石車是主因之一。台灣橋基沖刷問題在此後成為重要研究課題。',
    detail: `<p>高屏大橋（後改名西拉雅大橋）位於高雄高屏溪，2000年8月颱風後河川高水位期間，橋段突然崩塌。調查顯示有多重原因交疊：</p>
      <p><strong>主要原因：</strong>1. 颱風帶來的高流量洪水產生「沖刷效應」（scour）——高流速水流把橋墩基礎周圍的土壤帶走，使橋墩失去支撐；2. 長期超重砂石車通行（設計載重20噸，實際可能達50-60噸），加速疲勞損傷；3. 基礎深度可能不足（設計時未充分預測洪水時的沖刷深度）。</p>
      <p><strong>工程教訓：</strong>1. 「橋基沖刷」（Bridge Scour）是台灣橋樑最常見的失效原因，颱風季節必須加強監測；2. 超重車管制執法至關重要；3. 橋墩基礎應設計得夠深，或採用鋼板護面（如有需要）。</p>
      <p>此後台灣公路總局對全台橋樑進行「沖刷評估」，高風險橋樑加裝沖刷感應器或進行基礎補強。</p>`,
    lesson: '台灣河川坡陡水急，颱風時沖刷力是普通流量的百倍以上。橋基沖刷是台灣最常見的橋樑失效原因。',
  },
];

/* ── 診斷測驗題目 ───────────────────────────────────────── */
const QUIZ = [
  { q: '塔科馬海峽吊橋（1940）崩塌的根本原因是什麼？', a: '橋太重，支承力不足', b: '空氣動力顫振（flutter）——橋面在風中產生旋轉共振', correct: 'b', explain: '塔科馬橋的失敗是空氣彈性問題：橋面受側風產生升力→旋轉→再產生更大升力，正回饋讓振幅指數成長。現代橋樑用格柵橋面或流線型箱型橋面防止此問題。' },
  { q: '魁北克大橋（1907）為何在建設中崩塌？', a: '工人人為破壞', b: '壓桿挫屈：下弦桿承受的重量超過設計值，導致側向彎折崩潰', correct: 'b', explain: '設計師低估了自重 10%，當桿件重量累積超過設計值，靠近橋墩的主壓桿發生挫屈（側向彎折），瞬間引發整體連鎖倒塌。此後加拿大工程師以橋的鐵片製作「工程師戒指」銘記教訓。' },
  { q: '銀橋（1967）崩塌是什麼失效模式？', a: '地震損毀', b: '腐蝕疲勞：眼板銷孔處的微裂縫擴展到臨界長度後瞬間斷裂', correct: 'b', explain: '銀橋的眼板在 40 年間因腐蝕環境（水+氯離子+交通振動）產生疲勞裂縫，裂縫達到臨界值後突然脆斷。此事件促使美國立法強制每 2 年全面橋樑安全檢查。' },
  { q: 'I-35W 橋（2007）調查發現最根本的原因是什麼？', a: '鋼材品質不良', b: '節點板（gusset plate）厚度設計錯誤——只有規定厚度的一半，潛伏 40 年', correct: 'b', explain: 'NTSB 確認節點板設計值為 1 英寸但只建了 0.5 英寸。這個錯誤在 1967 年建橋時的審查漏過，2001、2004 年的定期檢查也未發現（未重新計算）。施工臨時荷重成了壓垮駱駝的最後一根稻草。' },
  { q: '聖水大橋（1994）崩塌前已有哪些警告訊號？', a: '完全沒有任何跡象，突然發生', b: '橋面裂縫、滲水等外部劣化跡象早已存在，但未進行詳細調查', correct: 'b', explain: '聖水大橋崩塌前已有可見的裂縫與滲水——這些是疲勞損傷擴大的外部訊號。維護人員雖記錄了這些缺陷，但未採取緊急措施停用或詳細評估。' },
  { q: 'FIU 行人天橋（2018）崩塌的直接原因是什麼？', a: '颱風引發共振', b: '施工方在未授權的情況下張拉斜桿拉索，改變了結構內力，引發節點壓壞', correct: 'b', explain: 'FIU 橋的施工方未通知結構師就調整斜桿張力，引發關鍵節點超載崩碎。就在崩塌前，施工方雖已發現裂縫並電詢工程師，但橋下道路未及時封閉。任何施工調整都必須工程師書面授權。' },
  { q: '台灣集集大橋（1999）在地震中發生的失效模式為何？', a: '橋面因強風而共振', b: '橋墩剪力破壞：箍筋間距太大，地震水平力超過橋墩抗剪能力', correct: 'b', explain: '舊版規範的橋墩箍筋（剪力筋）間距過大，無法約束混凝土在地震時不崩解。地震水平力遠超橋墩抗剪設計值，橋柱剪力破壞後整座橋傾斜。此後台灣大幅修訂耐震設計規範。' },
  { q: '台灣橋樑最常見的失效原因是什麼（根據高屏大橋等案例）？', a: '颱風強風直接吹倒', b: '橋基沖刷（Bridge Scour）——颱風洪水把橋墩基礎周圍土壤帶走', correct: 'b', explain: '台灣河川坡陡水急，颱風時流量可達平日百倍以上。高流速水流將橋墩周圍砂土帶走（沖刷效應），使橋墩失去基礎支撐而傾斜崩塌。這是台灣橋樑最常見的失效原因，需要在颱風季加強監測。' },
];

/* ── 狀態初始化 ──────────────────────────────────────────── */
const p5 = loadP();
const readSet = new Set(p5.m5_read || []);
let quizScore = 0;
const quizAnswered = new Set();

function syncProgress() {
  const done = readSet.size;
  document.getElementById('case-read-count').textContent = done;
  document.getElementById('progress-bar').style.width = Math.min(100, done / 8 * 100) + '%';
}
syncProgress();

/* ── 案例卡片 ────────────────────────────────────────────── */
const caseGrid = document.getElementById('case-grid');
CASES.forEach(c => {
  const card = document.createElement('div');
  card.className = 'case-card';
  card.innerHTML = `
    <div class="case-bar ${c.failType}"></div>
    <div class="case-body">
      <h4>${c.name}</h4>
      <div class="case-meta">${c.year} 年 ・ ${c.country}</div>
      <p>${c.summary}</p>
      <span class="case-tag ${c.failType}">${c.failLabel}</span>
      ${readSet.has(c.id) ? '<span class="case-tag" style="background:#dcfce7;color:#15803d">✓ 已讀</span>' : ''}
    </div>
  `;
  card.addEventListener('click', () => openCase(c, card));
  caseGrid.appendChild(card);
});

function openCase(c, card) {
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  const detailEl = document.getElementById('case-detail');
  const contentEl = document.getElementById('case-detail-content');

  detailEl.style.display = '';
  contentEl.innerHTML = `
    <h3 style="color:var(--primary-dark)">${c.name} <span style="font-size:14px;font-weight:500;color:var(--text-muted)">${c.year} ・ ${c.country}</span></h3>
    <span class="case-tag ${c.failType}" style="margin-bottom:12px;display:inline-block">${c.failLabel}</span>
    ${c.detail}
    <div class="fact-box" style="margin-top:16px">
      <strong style="color:var(--accent)">🔑 核心教訓：</strong>${c.lesson}
    </div>
  `;
  detailEl.scrollIntoView({ behavior:'smooth', block:'start' });

  if (!readSet.has(c.id)) {
    readSet.add(c.id);
    card.querySelector('.case-body').insertAdjacentHTML('beforeend', '<span class="case-tag" style="background:#dcfce7;color:#15803d">✓ 已讀</span>');
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    const pp = loadP(); pp.m5_read = Array.from(readSet); saveP(pp);
    syncProgress();
    if (readSet.size === 8) showToast('📚 8 件案例全部閱讀完畢！', 'good');
  }
}

/* ── 診斷測驗 ────────────────────────────────────────────── */
const quizList = document.getElementById('quiz-list');
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'scenario';
  div.innerHTML = `<h4>${i+1}. ${q.q}</h4>
    <div class="choice-grid">
      <button class="choice" data-q="${i}" data-c="a">A. ${q.a}</button>
      <button class="choice" data-q="${i}" data-c="b">B. ${q.b}</button>
    </div>
    <div class="feedback-slot"></div>`;
  quizList.appendChild(div);
});

quizList.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (quizAnswered.has(i)) return;
  const q = QUIZ[i];
  const correct = btn.dataset.c === q.correct;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === q.correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓' : '✗'} ${q.explain}</div>`;
  if (correct) { quizScore += 10; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  else if (typeof SoundFX !== 'undefined') SoundFX.error();
  quizAnswered.add(i);

  if (quizAnswered.size === QUIZ.length) {
    const resultDiv = document.getElementById('quiz-result');
    if (quizScore >= 60) {
      resultDiv.innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${quizScore} 分！橋樑失效案例診斷通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const pp = loadP(); pp.module5 = true; saveP(pp);
    } else {
      resultDiv.innerHTML = `<div class="feedback error" style="margin-top:20px">${quizScore} 分，請重新閱讀案例再作答。</div>`;
    }
  }
}));
