// 共用：資料來源 / 延伸閱讀 footer 注入
// 用法：在任何 <body data-tool="energy"> 的頁面引入 main.js 即可自動掛上對應的 footer。
// 若頁面已存在 .sources-section（如 hand-tools 已 hardcode），則跳過避免重複。

window.SOURCES = {
  // ---------- 共用平台來源（每個工具都會包含的基底）----------
  _platform: [
    { tag: 'CURR', text: '教育部《十二年國教課程綱要 — 自然科學領域・科技領域》。生 J-A2「工具機具與材料的選用」、生 J-B3「設計與製作能力」。', url: 'https://cirn.moe.edu.tw/' },
    { tag: 'HLE',  text: '翰林版《國中生活科技》1上–3下（K0–K5 各章節對應實作）。', url: 'https://www.hle.com.tw/' },
  ],

  // ---------- 19 個工具 ----------
  scrollsaw: [
    { tag: 'OSHA', text: 'U.S. OSHA 29 CFR 1910.213《Woodworking Machinery Requirements》— 線鋸機防護裝置規範。', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.213' },
    { tag: 'CNS',  text: 'CNS 8050《手工金屬鋸條》（與線鋸鋸條尺寸／齒形對應）。', url: 'https://www.cnsonline.com.tw/' },
    { tag: 'WIKI', text: 'Wikimedia Commons 公開授權圖片（CC BY-SA / Public Domain）；完整 attribution 見平台 LICENSE_IMAGES.md。', url: 'https://commons.wikimedia.org/' },
  ],

  solder: [
    { tag: 'IPC',  text: 'IPC-A-610H《Acceptability of Electronic Assemblies》— 焊點品質判讀標準（良好焊點外觀、橋接、冷焊、虛焊等）。', url: 'https://www.ipc.org/' },
    { tag: 'OSHA', text: 'Illinois DRS《Soldering Safety》、MIT EHS《Soldering and Brazing》— 通風、護目鏡、含鉛錫處理。', url: 'https://ehs.mit.edu/workplace-safety/' },
    { tag: 'IEC',  text: 'IEC 60068-2-20《Test T: Soldering》— 烙鐵溫度與焊點測試方法。含鉛錫共晶熔點 183 °C。', url: 'https://webstore.iec.ch/' },
    { tag: 'HAKKO', text: 'Hakko《FX-888D Soldering Station User Manual》— 推薦工作溫度 320–360 °C。', url: 'https://www.hakko.com/' },
  ],

  breadboard: [
    { tag: 'IPC',  text: 'IPC-A-620《Acceptability of Cable and Wire Harness Assemblies》— 剝線、壓接、銅線可接受刻痕標準。', url: 'https://www.ipc.org/' },
    { tag: 'ARDU', text: 'Arduino 官方教學《Breadboard Anatomy》— 麵包板內部金屬條與孔位電氣連接原理。', url: 'https://docs.arduino.cc/' },
    { tag: 'AWG',  text: 'NEC NFPA 70《American Wire Gauge》線徑對照表（含 22 AWG / 24 AWG 安全電流）。', url: 'https://www.nfpa.org/' },
  ],

  printer3d: [
    { tag: 'PRUSA', text: 'Prusa Research《PrusaSlicer Knowledge Base》、Prusament TDS（PLA 密度 1.24 g/cm³、列印溫度 215 °C）。', url: 'https://help.prusa3d.com/' },
    { tag: 'ALL3DP', text: 'All3DP《3D Printer Nozzle Wear & Replacement Guide》（2023）— 黃銅噴嘴典型壽命估算（約 300–600 小時，依列材與磨耗）。', url: 'https://all3dp.com/' },
    { tag: 'CREAL', text: 'Creality《Ender-3 / Ender-3 V2 User Manual》— 工作參數預設值。', url: 'https://www.creality.com/' },
  ],

  frc: [
    { tag: 'FIRST', text: 'FIRST Robotics Competition Game Manual（每年度更新）、官方統計頁。', url: 'https://www.firstinspires.org/robotics/frc' },
    { tag: 'WPILIB', text: 'WPILib Docs（FRC 標準函式庫）— 程式設計、PID、Path Planning 教學。', url: 'https://docs.wpilib.org/' },
    { tag: 'CTRE',  text: 'CTR-Electronics / NI《RoboRIO 2 Datasheet》— 控制器規格與接線。', url: 'https://store.ctr-electronics.com/' },
  ],

  steam: [
    { tag: 'IEEE', text: 'IEEE 754 與 ASCII (ANSI X3.4) 標準 — 位元組、字元編碼與數值表示的基礎。', url: 'https://www.unicode.org/charts/' },
    { tag: 'UNI',  text: 'Unicode Consortium《UTF-8 編碼規範》— 中文字為何需要 2–4 個位元組。', url: 'https://www.unicode.org/faq/utf_bom.html' },
    { tag: 'CS',   text: 'CS Unplugged（University of Canterbury, CC BY-NC-SA）— 不插電運算思維教學法，二進位與排序網路等活動的國際參考。', url: 'https://www.csunplugged.org/' },
    { tag: 'ALGO', text: 'Cormen et al.《Introduction to Algorithms》— 氣泡／選擇／插入排序的比較次數與 O(n²) 分析。', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { tag: 'ISO',  text: 'ISO 16《Acoustics — Standard tuning frequency》— A4 = 440 Hz 標準音高。', url: 'https://www.iso.org/standard/3601.html' },
    { tag: 'PHYS', text: 'OpenStax《College Physics》— 聲波、傅立葉合成與薄透鏡公式 1/f = 1/dₒ + 1/dᵢ、放大率 m = −dᵢ/dₒ。', url: 'https://openstax.org/details/books/college-physics-2e' },
    { tag: 'CURR', text: '教育部十二年國教課程綱要 — 資 J-A2 運算思維與問題解決、自然 Ea 波動與光、數學 N 數與量。', url: 'https://cirn.moe.edu.tw/' },
  ],

  lasercut: [
    { tag: 'THESIS', text: '趙珩宇（2019）《科技╱自造教室的雷射切割機之細懸浮微粒研究》，國立臺灣師範大學科技應用與人力資源發展學系碩士論文（指導教授：林坤誼）。實測臺北市兩所學校雷切機：密集板雕刻 PM2.5 平均 856.95 μg/m³、壓克力 210.45 μg/m³，皆遠高於環保署 35 μg/m³ 標準；加工後需超過一分鐘才降回安全值。', url: 'https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/login?o=dnclcdr&s=id=%22107NTNU5036036%22.&searchmode=basic' },
    { tag: 'CHAS', text: 'Munoz, A., Schmidt, J., Suffet, I.H.M., & Tsai, C.S.-J. (2023)《Characterization of Emissions from Carbon Dioxide Laser Cutting Acrylic Plastics》, Journal of Chemical Health & Safety — 60 W CO₂ 切壓克力逸散 10–420 nm 奈米顆粒；排煙可抽走氣體但擋不住開蓋瞬間的顆粒，建議切完後延長排煙時間再開蓋。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10369487/' },
    { tag: 'AAQR', text: 'Aerosol and Air Quality Research (2024)《Respirable Particles and Gas Contaminants Emissions from a Desktop Laser Cutter and Engraver》— 桌上型雷切機的可呼吸性顆粒與氣態污染物排放，並評估通風控制成效。', url: 'https://aaqr.org/articles/aaqr-24-02-oa-0032' },
    { tag: 'OSHA', text: 'U.S. OSHA / ANSI Z136.1《Safe Use of Lasers》— 雷射分級與工程控制（連鎖裝置、外殼、警示標示）。', url: 'https://www.osha.gov/laser-hazards' },
    { tag: 'CNS',  text: 'CNS 15448 / IEC 60825-1《雷射產品之安全》— 雷射產品分級與防護要求。', url: 'https://www.cnsonline.com.tw/' },
    { tag: 'NIOSH', text: 'NIOSH《Control of Smoke From Laser/Electric Arc Surgical Procedures》與雷射加工排煙建議 — 加工煙塵（LGAC）之危害與局部排氣需求。', url: 'https://www.cdc.gov/niosh/' },
    { tag: 'PVC',  text: '美國 EPA / 各國職衛資料：含氯高分子（PVC）熱裂解會產生氯化氫（HCl）與戴奧辛類化合物，為雷切禁用材料之依據。', url: 'https://www.epa.gov/' },
    { tag: 'HLE',  text: '趙珩宇《雷射切割課程》教學文（livingtech.education, 2017）— 七步驟流程與三種加工方式的課堂實作紀錄。', url: 'https://livingtech.education/2017/02/07/%E9%9B%B7%E5%B0%84%E5%88%87%E5%89%B2%E8%AA%B2%E7%A8%8B/' },
    { tag: 'CURR', text: '教育部十二年國教科技領域課程綱要 — 生 A-IV-1 材料與加工方法、生 P-IV-4 設計與製作流程。', url: 'https://cirn.moe.edu.tw/' },
  ],

  mechatronics: [
    { tag: 'ARDU', text: 'Arduino 官方文件《PWM》《analogWrite()》與 Motor Shield 教學 — 馬達調速與驅動器接法。', url: 'https://docs.arduino.cc/learn/microcontrollers/analog-output/' },
    { tag: 'NIST', text: 'NIST／標準大氣模型《Speed of Sound in Air》— 音速隨溫度變化 c ≈ 331.3 + 0.606·T (m/s)，本模組溫度誤差計算依據。', url: 'https://www.nist.gov/' },
    { tag: 'CTRL', text: 'Åström & Murray《Feedback Systems: An Introduction for Scientists and Engineers》(Princeton, 開放取用) — 比例／微分控制與過度增益振盪的理論依據。', url: 'https://www.cds.caltech.edu/~murray/amwiki/' },
    { tag: 'HCSR', text: 'HC-SR04 超音波模組 Datasheet — 量程約 2–400 cm、波束角約 15°、盲區與時序規格。', url: 'https://www.handsontec.com/dataspecs/HC-SR04-Ultrasonic.pdf' },
    { tag: 'IPC',  text: 'IPC-A-620《Acceptability of Cable and Wire Harness Assemblies》— 接線與壓接品質，對應除錯章節的接觸不良判讀。', url: 'https://www.ipc.org/' },
    { tag: 'CURR', text: '教育部十二年國教科技領域課程綱要 — 生 J-B3 設計與製作能力、3 下統整專題「自動化裝置」。', url: 'https://cirn.moe.edu.tw/' },
  ],

  'emerging-tech': [
    { tag: 'NIST', text: 'NIST《Face Recognition Vendor Test (FRVT)》與 FpVTE 指紋評測報告 — 生物辨識 FAR／FRR／EER 的標準定義與實測方法。本模組分布為教學示意值，非廠商實測數據。', url: 'https://www.nist.gov/programs-projects/face-technology-evaluations-frvt' },
    { tag: 'ISO',  text: 'ISO/IEC 19795-1《Biometric performance testing and reporting》— 誤接受率、誤拒絕率與等錯誤率的量測與報告規範。', url: 'https://www.iso.org/standard/73515.html' },
    { tag: 'PDPA', text: '中華民國《個人資料保護法》— 生物特徵屬個人資料，蒐集處理須符合特定目的與當事人同意等要件。', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021' },
    { tag: 'AIRMF', text: 'NIST AI 100-1《AI Risk Management Framework》— AI 系統的可靠性、公平性與情境限制（模型只在其訓練分布內可靠）。', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
    { tag: 'MILG', text: 'Milgram & Kishino《A Taxonomy of Mixed Reality Visual Displays》(1994) — 虛實連續體（Reality–Virtuality Continuum），VR／AR／MR 分類的原始依據。', url: 'https://search.ieice.org/bin/summary.php?id=e77-d_12_1321' },
    { tag: 'ASHRAE', text: 'ASHRAE Standard 55《Thermal Environmental Conditions for Human Occupancy》— 室內舒適溫濕度範圍，作為節能控制策略的舒適度底線。', url: 'https://www.ashrae.org/technical-resources/bookstore/standard-55-thermal-environmental-conditions-for-human-occupancy' },
    { tag: 'EBA',  text: '經濟部能源署《能源統計手冊》與建築節能相關指引 — 空調與照明耗電占比、節能措施效益估算依據。', url: 'https://www.esist.org.tw/' },
    { tag: 'CURR', text: '教育部十二年國教科技領域課程綱要 — 生 J-C3 新興科技對社會的影響、資 J-A2 運算思維與科技應用。', url: 'https://cirn.moe.edu.tw/' },
  ],

  onshape: [
    { tag: 'OS',   text: 'Onshape Learning Center 官方學習資源（Sketch、Feature、Assembly、Drawings）。', url: 'https://learn.onshape.com/' },
    { tag: 'CAD',  text: '趙珩宇《Onshape 3D 雲端建模教學》（YouTube 播放清單，珩宇老師頻道）。', url: 'https://www.youtube.com/@henrychao521' },
  ],

  drill: [
    { tag: 'OSHA', text: 'U.S. OSHA 29 CFR 1910.243《Portable Powered Tools》— 手電鑽防護與使用規範。', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.243' },
    { tag: 'MMS',  text: '《Machinery\'s Handbook》Industrial Press — 鑽孔切削速度 SFM 公式與材料對照表（軟木 200–500、鋁 200–300、鋼 30–80）。', url: 'https://industrialpress.com/' },
    { tag: 'OSHA-D', text: 'U.S. OSHA Hand and Power Tools booklet（OSHA 3080）— 手持動力工具一般安全規範。', url: 'https://www.osha.gov/Publications/OSHA3080/osha3080.html' },
  ],

  'drill-press': [
    { tag: 'OSHA', text: 'U.S. OSHA 29 CFR 1910.212《General Requirements for All Machines》— 機座、護罩、緊急停機。', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.212' },
    { tag: 'MMS',  text: '《Machinery\'s Handbook》— 鑽床主軸 SFM 公式與皮帶段位轉速對應。', url: 'https://industrialpress.com/' },
    { tag: 'POW',  text: 'Powermatic / JET 鑽床操作手冊（皮帶段位 vs RPM 對照表）。', url: 'https://www.powermatic.com/' },
  ],

  sander: [
    { tag: 'OSHA', text: 'U.S. OSHA 29 CFR 1910.243(c) — 砂輪與砂帶機防護裝置；OSHA Combustible Dust 標準（粉塵爆炸防範）。', url: 'https://www.osha.gov/combustible-dust' },
    { tag: 'ISO',  text: 'ISO 4287:1997《Geometrical Product Specifications — Surface texture》— Ra 粗糙度量測標準。', url: 'https://www.iso.org/standard/10132.html' },
    { tag: 'FAO',  text: 'FPInnovations / FAO 木材加工指南 — 不同砂紙號數對應的表面粗糙度 Ra 估算值。', url: 'https://fpinnovations.ca/' },
  ],

  'structure-sim': [
    { tag: 'CNS',  text: 'CNS 560《建築用熱軋鋼板》、AISC《Steel Construction Manual》— 桁架構件規格與容許應力。', url: 'https://www.cnsonline.com.tw/' },
    { tag: 'TEXT', text: 'Beer & Johnston《Mechanics of Materials》— 桁架方法、節點法、截面法。', url: 'https://www.mheducation.com/' },
    { tag: 'BRIDG', text: '美國 ASCE《Bridge Engineering Handbook》— Pratt / Warren / Howe 桁架的歷史與適用情境。', url: 'https://ascelibrary.org/' },
  ],

  'simple-machines': [
    { tag: 'TEXT', text: 'Hibbeler《Engineering Mechanics: Statics》— 槓桿三類、滑輪、輪軸、斜面、楔形、螺旋的機械優勢 MA 推導。', url: 'https://www.pearson.com/' },
    { tag: 'PHYS', text: 'OpenStax《College Physics》— 摩擦力對螺旋實際 MA 的影響（理論 vs 實際效率 60–70%）。', url: 'https://openstax.org/' },
  ],

  mechanism: [
    { tag: 'TEXT', text: 'Norton《Design of Machinery》— 曲柄滑塊、四連桿、凸輪、齒輪傳動的幾何與運動學。', url: 'https://www.mheducation.com/' },
    { tag: 'AGMA', text: 'AGMA / ANSI 齒輪標準（齒輪比、模數、壓力角）。', url: 'https://www.agma.org/' },
  ],

  energy: [
    { tag: 'EBA',  text: '經濟部能源署《能源統計月報》（台灣各能源類型發電量、佔比）。', url: 'https://www.esist.org.tw/' },
    { tag: 'TPC',  text: '台灣電力公司《年報》與《供電資訊》— 燃煤／燃氣／核能／再生能源發電組合。', url: 'https://www.taipower.com.tw/' },
    { tag: 'IEA',  text: 'International Energy Agency《Global Energy Review》、《Renewables 2024》— 各能源發電效率與 CO₂ 排放係數。', url: 'https://www.iea.org/' },
    { tag: 'EPA',  text: '環境部《溫室氣體排放係數管理表》— 台灣電力排放係數（gCO₂e/kWh）。', url: 'https://ghgregistry.moenv.gov.tw/' },
  ],

  powertrain: [
    { tag: 'EPA',  text: 'U.S. EPA Fuel Economy Guide（fueleconomy.gov）— 各車型油耗 L/100km 與電耗 kWh/100km。', url: 'https://www.fueleconomy.gov/' },
    { tag: 'IEA-EV', text: 'IEA《Global EV Outlook 2024》— 電動車整體效率（電池→輪 ~85–90%）。', url: 'https://www.iea.org/reports/global-ev-outlook-2024' },
    { tag: 'EBA-T', text: '經濟部能源署《車輛能源消耗指南》、《電動車耗電量資料庫》。', url: 'https://www.energy-efficiency.org.tw/' },
    { tag: 'MOTC', text: '交通部運輸研究所《道路擁擠成本研究》、《道路交通安全統計》。', url: 'https://www.iot.gov.tw/' },
  ],

  'hydraulic-arm': [
    { tag: 'ISO',  text: 'ISO 4413《Hydraulic Fluid Power — General Rules》— 液壓系統設計與安全規範。', url: 'https://www.iso.org/standard/45657.html' },
    { tag: 'TEXT', text: 'Esposito《Fluid Power with Applications》— 帕斯卡定律與液壓缸推力計算。', url: 'https://www.pearson.com/' },
    { tag: 'HLE-A', text: '翰林版生活科技附件 3《液壓手臂製作》紙模 + 注射器組件清單。', url: 'https://www.hle.com.tw/' },
  ],

  microcontroller: [
    { tag: 'ARDU', text: 'Arduino 官方文件 docs.arduino.cc — UNO R3 / R4 規格、引腳定義、I/O 電壓。', url: 'https://docs.arduino.cc/' },
    { tag: 'MBIT', text: 'Microsoft micro:bit 官方文件 microbit.org — V2 板卡感測器、MakeCode 編輯器。', url: 'https://microbit.org/' },
    { tag: 'ESP',  text: 'Espressif《ESP32 Technical Reference Manual》— 雙核心、Wi-Fi/BLE、GPIO 規格。', url: 'https://www.espressif.com/' },
    { tag: 'HCSR', text: 'HC-SR04 超音波感測器 Datasheet — 頻率 40 kHz、量測距離 2 cm–4 m、誤差 ±3 mm。', url: 'https://www.handsontec.com/dataspecs/HC-SR04-Ultrasonic.pdf' },
  ],

  orthographic: [
    { tag: 'CNS',  text: 'CNS 3《工程製圖》— 第三角投影法、視圖排列、線條型式。', url: 'https://www.cnsonline.com.tw/' },
    { tag: 'ISO',  text: 'ISO 128《Technical drawings — General principles of presentation》。', url: 'https://www.iso.org/standard/29842.html' },
    { tag: 'TEXT', text: '林昭智《工程圖學》、Bertoline《Fundamentals of Graphics Communication》。', url: '' },
  ],

  'design-process': [
    { tag: 'IDEO', text: 'IDEO Design Kit《The Field Guide to Human-Centered Design》— 同理／定義／發想／原型／測試五階段。', url: 'https://www.designkit.org/' },
    { tag: 'STAN', text: 'Stanford d.school《Design Thinking Bootleg》— 設計思考工具卡與決策矩陣（Pugh Matrix）。', url: 'https://dschool.stanford.edu/resources' },
    { tag: 'BIOS', text: '各案例之原廠歷史頁面與當事人自傳（見每張案例卡片底部「📚 來源」欄）。', url: '' },
  ],

  'hand-tools': [
    { tag: 'OSHA', text: '勞動部職業安全衛生署《手工具作業安全衛生指引》與 OSHA 29 CFR 1910.244。', url: 'https://www.osha.gov.tw/' },
    { tag: 'CURR', text: '教育部國民及學前教育署《十二年國教課程綱要》生 J-A2、生 J-B3。', url: 'https://cirn.moe.edu.tw/' },
    { tag: 'HLE',  text: '翰林版《國中生活科技 1 上》K3「設計與製作的基礎」。', url: 'https://www.hle.com.tw/' },
    { tag: 'STAN', text: 'Stanley Black & Decker《Hand Tool Care & Maintenance Guide》。', url: 'https://www.stanleyblackanddecker.com/' },
    { tag: 'LV',   text: 'Lee Valley Tools《Files & Rasps Care》— 銼刀單向使用與保養。', url: 'https://www.leevalley.com/en-ca/learn/articles/files-and-rasps' },
    { tag: 'ANSI', text: 'ANSI/ASME B107 系列扳手規範、北星牌《手工具圖鑑》。', url: 'https://www.asme.org/' },
    { tag: 'ILOSH', text: '勞動部職業安全衛生研究所 ILOSH《校園實習工場安全管理手冊》— 影子板與工具報廢管理。', url: 'https://www.ilosh.gov.tw/' },
  ],
};

// 把工具的來源清單渲染成標準的 dark footer block
function _renderSourcesBlock(toolId) {
  const lib = window.SOURCES[toolId];
  if (!lib || !lib.length) return null;
  const platform = window.SOURCES._platform || [];
  const all = [...lib, ...platform];

  const section = document.createElement('section');
  section.className = 'sources-section';
  section.style.cssText = 'background:#0F172A;color:#CBD5E1;padding:28px 22px;margin:36px auto;border-radius:14px;font-size:13px;line-height:1.8;max-width:1200px';

  const li = all.map((s, i) => {
    const linkText = s.url
      ? `<a href="${s.url}" target="_blank" rel="noopener" style="color:#93C5FD;text-decoration:none">${s.text}</a>`
      : s.text;
    return `<li id="src-${toolId}-${i + 1}" style="margin-bottom:6px"><span style="display:inline-block;min-width:54px;background:#1E293B;color:#FBBF24;font-family:Inter,sans-serif;font-size:10.5px;padding:1px 8px;border-radius:4px;margin-right:8px;text-align:center;letter-spacing:.05em">${s.tag}</span>${linkText}</li>`;
  }).join('');

  section.innerHTML = `
    <details>
      <summary style="cursor:pointer;font-size:15px;font-weight:700;color:#FBBF24;list-style:none">📚 資料來源與延伸閱讀（點此展開 ${all.length} 條）</summary>
      <ol style="padding-left:0;margin-top:14px;list-style:none">${li}</ol>
      <p style="margin-top:14px;font-size:12px;color:#64748B">📝 教學內容為「教師示範用簡化版」，實際操作仍應以教師現場示範、廠商隨機文件、勞安署正式規範為準。對任何內容有疑慮，歡迎開 <a href="https://github.com/henrychao521/livingtech-tools/issues" target="_blank" rel="noopener" style="color:#93C5FD">GitHub Issue</a>。</p>
    </details>
  `;
  return section;
}

// 自動掛載：DOM ready 後，根據 <body data-tool="xxx"> 注入對應的 footer
document.addEventListener('DOMContentLoaded', () => {
  const toolId = document.body.dataset.tool;
  if (!toolId) return;
  // 若頁面已有 .sources-section（如 hand-tools 已 hardcode），跳過避免重複
  if (document.querySelector('.sources-section')) return;
  const section = _renderSourcesBlock(toolId);
  if (!section) return;
  const main = document.querySelector('main');
  if (main) {
    main.appendChild(section);
  } else {
    document.body.appendChild(section);
  }
});
