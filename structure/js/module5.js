// 橋梁工程師實驗室 模組 5：歷史橋梁失敗案例 + 診斷測驗
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
      <p>失敗原因：設計工程師 Leon Moisseiff 把原案 7.6 m 深的加勁桁架換成只有 2.4 m 高的實腹鈑梁（plate girder），橋面又窄又淺、太柔軟，風速 64km/h 時橋面開始以「扭轉」模式共振，振幅越來越大，最終桿件斷裂落水。</p>
      <p><strong>物理機制（顫振 Flutter）：</strong>橋面受側風產生升力，升力引發旋轉，旋轉改變攻角再產生更大升力——正回饋迴路讓振幅指數成長。這與飛機機翼失速不同，是純粹的空氣彈性問題。</p>
      <p><strong>事後改善：</strong>現代吊橋橋面改用「箱型截面」（box girder），側面設計成流線型或格柵型，讓側風能穿透，不產生旋轉升力。台灣高雄斜張橋的橋面剖面也考慮了這個問題。</p>`,
    lesson: '橋梁設計必須考慮動力效應（風振、地震）而非只考慮靜態荷重。',
  },
  {
    id: 'quebec', name: '魁北克大橋', year: 1907, country: '🇨🇦 加拿大',
    failType: 'buckling', failLabel: '壓桿挫曲（設計錯誤）',
    summary: '1907 年建設中橋梁突然崩塌，75 名工人罹難。原因是主桿件截面積設計不足，壓力超過挫曲極限。',
    detail: `<p>魁北克大橋（Quebec Bridge）是世界上跨度最大的懸臂桁架橋，跨度 549m。1907 年第一次建設時，建設中突然崩塌，75 名工人罹難；1916 年第二次建設時，中間箱型桁架吊裝落水，又有 13 人罹難。歷經兩次災難才於 1917 年完工。</p>
      <p><strong>主要原因：</strong>顧問工程師 Theodore Cooper 為了省下深水橋墩的費用，把主跨從約 488 m 加長到 549 m，卻沒有要求重算自重；實際自重明顯超過設計值。施工時桿件重量累積，靠近橋墩的受壓下弦桿（A9L）開始挫曲（側向彎折），瞬間引發連鎖崩塌。</p>
      <p><strong>工程教訓：</strong>1. 計算誤差在大型結構中會指數放大；2. 壓桿（compression member）的挫曲臨界力必須有足夠安全係數；3. 獨立的第三方審查（peer review）至關重要。</p>
      <p>加拿大自 1925 年起以「工程師召喚儀式」頒發鐵戒（Iron Ring）。常有人說鐵戒是用魁北克橋的殘鐵打造，其實不是，但儀式的精神正是記取這類事故、提醒工程師對公眾安全的責任。</p>`,
    lesson: '壓桿設計必須計算挫曲臨界力（Euler 公式），並進行獨立審查。',
  },
  {
    id: 'silver', name: '銀橋', year: 1967, country: '🇺🇸 美國',
    failType: 'fatigue', failLabel: '腐蝕疲勞（眼板裂縫）',
    summary: '1967年12月，俄亥俄州銀橋在尖峰時段突然崩塌，46人罹難。原因是關鍵眼板銷孔因腐蝕疲勞產生裂縫，SF由3降至不足1。',
    detail: `<p>Point Pleasant Bridge（俗稱銀橋，Silver Bridge）建於 1928 年，1967.12.15 崩塌，46 人罹難，橋上 37 輛車中有 31 輛隨橋墜落（多數落入俄亥俄河）。事後調查耗時 2 年才找到真正原因。</p>
      <p><strong>主要原因：</strong>懸吊鏈的眼板（eyebar，一種傳力連接件）在銷孔（pin hole）處，因設計時允許應力集中，加上 40 年的腐蝕環境（氯離子 + 水 + 交通振動）產生微裂縫，裂縫擴展到臨界長度後在一瞬間斷裂，整條鏈失效，引發連鎖倒塌。</p>
      <p><strong>工程教訓：</strong>1. 疲勞（fatigue）壽命與應力幅（stress range）和循環次數有關，需設計疲勞壽命；2. 腐蝕會大幅加速疲勞裂縫成長；3. 橋梁需要定期檢查（尤其是關鍵節點連接件）；4. 「冗餘設計」（redundancy）——任何單一桿件斷裂不應引發整體倒塌。</p>
      <p>此事故促使美國建立「國家橋梁檢查計畫（NBIP）」，要求每 2 年強制定期檢查所有公路橋。</p>`,
    lesson: '腐蝕+疲勞的組合比單一因素危險得多。冗餘設計和定期檢查缺一不可。',
  },
  {
    id: 'i35w', name: 'I-35W 明尼蘇達橋', year: 2007, country: '🇺🇸 美國',
    failType: 'design', failLabel: '節點板太薄（設計監督失誤）',
    summary: '2007年8月，明尼蘇達州 I-35W 橋在尖峰車流中突然崩塌，13 人罹難，145 人受傷。根本原因是1960年代設計的節點鋼板比規定薄了一半。',
    detail: `<p>I-35W 密西西比河橋（Minneapolis）建於 1967 年，2007.08.01 晚間 6:05 崩塌——尖峰時段、橋上正在施工，堆放額外重量（混凝土攪拌機、護欄材料）。</p>
      <p><strong>主要原因：</strong>NTSB 調查確認，原設計圖上的節點板（gusset plate，連接多根桿件的鋼板）厚度計算有誤——設計值應為 1 英寸（25.4mm），但實際建造只有 0.5 英寸（12.7mm）。這個設計錯誤在 1967 年被審查漏過，2001、2004年的橋梁定期檢查也未發現（沒有詳細重新計算）。2007 年施工加載重是壓垮駱駝的最後一根稻草。</p>
      <p><strong>工程教訓：</strong>1. 節點板（gusset plate）是多桿件力匯集點，應力集中嚴重，是最需要審查的部位；2. 定期檢查應包含「結構分析重算」而非只有目視；3. 臨時施工荷重應納入結構評估。</p>`,
    lesson: '隱藏的設計錯誤可能潛伏數十年，定期重新計算結構安全性和目視檢查同樣重要。',
  },
  {
    id: 'sungsu', name: '聖水大橋', year: 1994, country: '🇰🇷 韓國',
    failType: 'fatigue', failLabel: '疲勞斷裂（維護不足）',
    summary: '1994年10月，首爾聖水大橋中央桁架突然墜落，32人罹難。原因是懸吊構件因疲勞裂縫斷裂，事前已有腐蝕跡象但遭忽視。',
    detail: `<p>聖水大橋（성수대교）建於 1979 年，是橫跨漢江的主要幹道。1994.10.21 早上 7:38，橋中央一段（48m）突然墜落漢江，6 部車（含一輛 16 號公車）跌落，32 人罹難。</p>
      <p><strong>主要原因：</strong>連接上弦桿和橋面桁架的懸吊桿件（hanger）因施工品質不足（焊接接頭有缺陷）加上 15 年使用期間的疲勞循環，裂縫從焊接缺陷處擴展。事前已有橋面裂縫、滲水等警告訊號，但未進行詳細調查或修繕。</p>
      <p><strong>工程教訓：</strong>1. 施工品質控制（QC）——焊接檢查不合格就不能驗收；2. 維護不是「可選項」，是結構壽命的保障；3. 公眾可見的劣化（滲水、裂縫）往往是更嚴重內部問題的外部訊號。</p>
      <p>此事故促使韓國全面重新檢查全國橋梁，次年（1995）三豐百貨崩塌更引爆社會對建築安全的全面反省。</p>`,
    lesson: '可見的劣化跡象（滲水、裂縫）是緊急警訊，絕不能忽視，必須立即停用並工程評估。',
  },
  {
    id: 'fiu', name: 'FIU 行人天橋', year: 2018, country: '🇺🇸 美國',
    failType: 'design', failLabel: '設計錯誤＋節點剪力破壞',
    summary: '2018年3月，佛羅里達國際大學興建中的行人橋在施工時崩塌，6人罹難。NTSB 調查認定主因是設計單位算錯關鍵節點的受力與抗剪能力。',
    detail: `<p>FIU 行人天橋（Florida International University Pedestrian Bridge）是一座預鑄混凝土桁架橋，主跨吊裝就位 5 天後，於 2018.03.15 下午 1:46 崩塌，落在底下仍有車輛通行的八線道馬路上，8 輛車被壓，1 名工人與 5 名用路人罹難。</p>
      <p><strong>主要原因（NTSB 調查結論）：</strong>1. 設計單位 FIGG 在北端 11、12 號桿件與橋面交會的節點，把受力算得太小、抗剪能力算得太大——實際需求幾乎是計算值的兩倍，節點最後發生剪力破壞；2. 節點出現越來越大的裂縫後，FIGG 的設計工程師仍判斷沒有安全疑慮，並提出「重新張拉 11 號斜桿預力鋼棒」的修補方案，也沒有請獨立工程師審查；崩塌時承包商 MCM 正依這個方案施工；3. 同案的獨立審查（Louis Berger）不確實；裂縫擴大時各單位都沒有停工，橋下道路也只封閉部分車道。</p>
      <p><strong>工程教訓：</strong>1. 多根桿件匯集的節點是最需要仔細計算與獨立審查的地方；2. 一旦發現結構裂縫，應立即停工、封閉下方道路並進行工程評估；3. 修補方案本身也是設計變更，同樣需要獨立審查。</p>`,
    lesson: '設計計算錯誤加上對裂縫警訊的誤判會致命：發現裂縫就該停工、封路，修補方案也要經過獨立審查。',
  },
  {
    id: 'wuxi', name: '台 3 線烏溪橋（台灣）', year: 1999, country: '🇹🇼 台灣',
    failType: 'earthquake', failLabel: '地震損毀（斷層錯動＋橋墩剪力破壞）',
    summary: '1999年921集集大地震（芮氏規模 ML 7.3），車籠埔斷層的地表破裂線直接穿過台 3 線烏溪橋，霧峰端兩跨落橋，南下線 P1～P5 橋墩柱嚴重剪力裂損，成為台灣橋梁耐震檢討的重要案例。',
    detail: `<p>烏溪橋位於省道台 3 線，跨越烏溪、連接台中霧峰與南投草屯，全長約 624.5 公尺、共 18 跨，上部結構是預力混凝土 I 型梁；北上線約在民國 50 年代完工，南下線在民國 72 年（1983 年）完工。1999.09.21 凌晨 1:47 集集大地震，車籠埔斷層的地表破裂線從 P2 與 P3 橋墩之間穿過，垂直錯動約 1.5 公尺。</p>
      <p><strong>震害情形（國家地震工程研究中心勘災資料）：</strong>1. 北上線靠霧峰端第 1、2 跨上部結構落橋，一輛行經的旅行車隨橋面滑落橋下；2. 南下線靠霧峰端多跨橋面下陷、向西傾斜；3. 南下線 P1～P5 橋墩柱嚴重「剪力裂損」——混凝土破碎、鋼筋拉斷，P3 沉箱基礎也開裂。</p>
      <p><strong>主要原因：</strong>1. 斷層直接通過橋址，地面本身錯開，是任何橋都很難承受的情況；2. 舊橋墩依當年的規範設計，事後耐震評估發現橋墩底部塑性鉸區的「圍束箍筋」（包住主筋、防止混凝土在地震中崩散的橫向鋼筋）不符現行規範，韌性不足，強烈搖晃時容易發生剪力破壞。</p>
      <p><strong>事後重建：</strong>霧峰端上、下部結構全部改建；草屯端保留較完好的橋墩，上部結構改成較輕的連續鋼梁，並加裝高阻尼橡膠支承墊（隔減震，降低傳到橋墩的地震力），依交通部《公路橋梁耐震設計規範》做韌性設計、加長防落長度；保留的舊橋墩再做耐震評估與補強（RC 包覆、鋼鈑包覆、碳纖維包覆等）。新橋於 2001 年 3 月完工通車。</p>
      <p style="font-size:12.5px;color:var(--text-muted)">資料來源：<a href="https://www.ncree.org/921_bridge_project/BridgeData/%E7%83%8F%E6%BA%AA%E6%A9%8B/%E7%83%8F%E6%BA%AA%E6%A9%8B%E9%9C%87%E5%AE%B3%E6%83%85%E6%B3%81.htm" target="_blank" rel="noopener">國家地震工程研究中心〈烏溪橋震害情況〉</a>；<a href="https://www.ceci.org.tw/book/58/ch58_2.htm" target="_blank" rel="noopener">中華顧問工程司〈台三線烏溪橋之重建設計及後續補強設計〉</a></p>`,
    lesson: '斷層經過的地方要盡量避開或特別設計；舊橋墩的箍筋不足會讓橋在大地震中剪力破壞。台灣的橋都必須做耐震設計，舊橋的耐震補強（retrofit）是不可省略的公共安全投資。',
  },
  {
    id: 'gaoping', name: '高屏大橋斷裂（台灣）', year: 2000, country: '🇹🇼 台灣',
    failType: 'scour', failLabel: '河床下降＋洪水沖刷（橋基失去支撐）',
    summary: '2000年8月碧利斯颱風後，高屏大橋 P22 橋墩下陷倒塌，約百公尺橋面落入高屏溪，17 輛汽機車墜落、22 人輕重傷。關鍵原因是長年砂石濫採使河床下降、基樁裸露，再遭洪水沖刷。',
    detail: `<p>第二代高屏大橋 1978 年通車，橫跨高屏溪連接高雄與屏東。2000.08.27 下午，受碧利斯颱風及之後的降雨影響，P22 橋墩下陷倒塌，P21～P23 之間的橋面崩落溪中，17 輛汽機車墜落、22 人輕重傷。</p>
      <p><strong>主要原因（工程會調查與監察院糾正報告）：</strong>1. 砂石超限濫採（包括盜採），1975～1995 年間橋址附近河床平均下降約 8 公尺，橋墩基樁大量裸露——這種靠摩擦力承載的基樁埋在土裡的長度變短，承載力大幅下降；2. 倒塌的 P22 樁長只有 18 公尺，河道深槽又從原設計的 P25～P29 移到 P22 附近，且 P22 只有蛇籠保護，成為弱點；3. 颱風洪水持續沖刷橋基，最後橋墩沉陷，引發斷橋。</p>
      <p><strong>工程教訓：</strong>1. 「橋基沖刷」（Bridge Scour）是台灣河川橋梁的重大威脅，河床高程要長期監測；2. 砂石開採必須管制，河床下降會直接吃掉基礎的承載力；3. 橋墩基礎設計要預留河道變遷與沖刷深度，並做好保護工。</p>
      <p>事後公路總局全面普檢省道橋梁，34 座受損橋梁列入重建及改善計畫；交通部並於 2011 年訂頒《橋基保護工設計規範》。</p>`,
    lesson: '河床下降和洪水沖刷會讓橋墩「腳下的土」消失。管制砂石開採、監測河床、做好橋基保護，是台灣橋梁安全的關鍵。',
  },
];

/* ── 診斷測驗題目 ───────────────────────────────────────── */
const QUIZ = [
  { q: '塔科馬海峽吊橋（1940）崩塌的根本原因是什麼？', a: '橋太重，支承力不足', b: '空氣動力顫振（flutter）——橋面在風中產生旋轉共振', correct: 'b', explain: '塔科馬橋的失敗是空氣彈性問題：橋面受側風產生升力→旋轉→再產生更大升力，正回饋讓振幅指數成長。現代橋梁用格柵橋面或流線型箱型橋面防止此問題。' },
  { q: '魁北克大橋（1907）為何在建設中崩塌？', a: '工人人為破壞', b: '壓桿挫曲：下弦桿承受的重量超過設計值，導致側向彎折崩潰', correct: 'b', explain: '主跨加長後沒有重算自重，實際自重明顯超過設計值；當桿件重量累積超過設計值，靠近橋墩的主壓桿發生挫曲（側向彎折），瞬間引發整體連鎖倒塌。加拿大工程師的鐵戒儀式就是在記取這類教訓（鐵戒用魁北克橋殘鐵打造是常見的誤傳）。' },
  { q: '銀橋（1967）崩塌是什麼失效模式？', a: '地震損毀', b: '腐蝕疲勞：眼板銷孔處的微裂縫擴展到臨界長度後瞬間斷裂', correct: 'b', explain: '銀橋的眼板在 40 年間因腐蝕環境（水+氯離子+交通振動）產生疲勞裂縫，裂縫達到臨界值後突然脆斷。此事件促使美國立法強制每 2 年全面橋梁安全檢查。' },
  { q: 'I-35W 橋（2007）調查發現最根本的原因是什麼？', a: '鋼材品質不良', b: '節點板（gusset plate）厚度設計錯誤——只有規定厚度的一半，潛伏 40 年', correct: 'b', explain: 'NTSB 確認節點板設計值為 1 英寸但只建了 0.5 英寸。這個錯誤在 1967 年建橋時的審查漏過，2001、2004 年的定期檢查也未發現（未重新計算）。施工臨時荷重成了壓垮駱駝的最後一根稻草。' },
  { q: '聖水大橋（1994）崩塌前已有哪些警告訊號？', a: '完全沒有任何跡象，突然發生', b: '橋面裂縫、滲水等外部劣化跡象早已存在，但未進行詳細調查', correct: 'b', explain: '聖水大橋崩塌前已有可見的裂縫與滲水——這些是疲勞損傷擴大的外部訊號。維護人員雖記錄了這些缺陷，但未採取緊急措施停用或詳細評估。' },
  { q: 'FIU 行人天橋（2018）崩塌的主要原因是什麼（NTSB 調查結論）？', a: '颱風引發共振', b: '設計單位算錯關鍵節點的受力與抗剪能力，節點裂縫擴大後發生剪力破壞', correct: 'b', explain: 'NTSB 認定主因是設計單位 FIGG 對 11／12 號桿件節點的荷重與抗剪能力計算錯誤。裂縫出現後，設計工程師仍判斷無安全疑慮，並提出重新張拉斜桿預力鋼棒的修補方案；承包商施工時橋就崩塌了，橋下道路也沒有全面封閉。發現裂縫就應停工、封路，修補方案也要經過獨立審查。' },
  { q: '921 集集大地震時，台 3 線烏溪橋南下線的橋墩發生了哪一種失效？', a: '橋面因強風而共振', b: '橋墩剪力破壞：舊橋墩的圍束箍筋不足，地震水平力超過橋墩的抗剪與變形能力', correct: 'b', explain: '烏溪橋南下線 P1～P5 橋墩柱嚴重剪力裂損、混凝土破碎、鋼筋拉斷（斷層也直接穿過橋址造成落橋）。事後評估發現舊橋墩塑性鉸區的圍束箍筋不符現行規範——箍筋就是包住混凝土、讓它在地震中不崩散的「腰帶」。' },
  { q: '台灣橋梁最常見的失效原因是什麼（根據高屏大橋等案例）？', a: '颱風強風直接吹倒', b: '橋基沖刷（Bridge Scour）——颱風洪水把橋墩基礎周圍土壤帶走', correct: 'b', explain: '高屏大橋附近河床因砂石濫採下降約 8 公尺，基樁早已裸露；颱風洪水再把橋墩周圍砂土帶走（沖刷效應），P22 橋墩失去支撐而沉陷斷橋。管制採砂、監測河床高程、做好橋基保護工，是台灣河川橋梁的重點。' },
];

/* ── 狀態初始化 ──────────────────────────────────────────── */
const p5 = loadP();
// 只計目前存在的案例（舊版的 jiji 案例已改為烏溪橋，避免舊紀錄讓已讀數超過 8）
const readSet = new Set((p5.m5_read || []).filter(id => CASES.some(c => c.id === id)));
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
      resultDiv.innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${quizScore} 分！橋梁失效案例診斷通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const pp = loadP(); pp.module5 = true; saveP(pp);
    } else {
      resultDiv.innerHTML = `<div class="feedback error" style="margin-top:20px">${quizScore} 分，請重新閱讀案例再作答。</div>`;
    }
  }
}));
