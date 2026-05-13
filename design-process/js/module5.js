// 設計流程 模組 5：8 個經典案例
// 各案例皆以原廠／公司官方歷史頁面或當事人自傳為主要來源；下方 source 欄位列出每個案例的出處
const CASES = [
  { name: 'iPhone (2007)', icon: '📱', year: 2007, problem: '當時手機鍵盤大、UI 不直覺、上網慢、相機糟。', insight: 'Steve Jobs 在 Stanford 演講與 2007 Macworld Keynote 中強調：好的設計要為使用者預想未來需求。', solution: '電容觸控螢幕（無實體鍵盤）+ App Store 生態系 + 簡潔 UI + iPod 整合', impact: '改變整個手機產業、創造 App 經濟、智慧手機標準範本', source: 'Apple 2007 Macworld Keynote；Walter Isaacson《Steve Jobs》傳記（2011）' },
  { name: 'Dyson 吸塵器 DC01', icon: '🧹', year: 1993, problem: 'James Dyson 觀察到傳統集塵袋會逐漸阻塞而使吸力衰退。', insight: '在自家附近的鋸木場看到「氣旋分離塵屑」的工業原理 → 為何不能縮小用於家用吸塵器？', solution: '無集塵袋設計 + 雙氣旋分離技術；歷時 5 年、超過 5,000 個原型（Dyson 自傳記載為 5,127 個）反覆迭代', impact: '創造 Dyson 公司、氣旋吸塵成為高階吸塵器標準', source: 'James Dyson《Against the Odds: An Autobiography》（1997）；Dyson 官方公司歷史頁面' },
  { name: 'Airbnb', icon: '🏠', year: 2008, problem: '舊金山設計師付不出房租 + 設計大會期間飯店一房難求。', insight: '創辦人 Brian Chesky 與 Joe Gebbia：自家空房有需求—為何不媒合？最早的服務名稱即「AirBed & Breakfast」。', solution: '線上平台 + 房東自助 + 雙向評價系統 + 信任機制', impact: '改變旅遊住宿產業、創造共享經濟、迫使旅館業轉型', source: 'Leigh Gallagher《The Airbnb Story》（2017）；Airbnb 官方 newsroom 公司簡介' },
  { name: 'Tesla Model S', icon: '⚡', year: 2012, problem: '當時電動車多為小型代步車，被視為「玩具」，續航與性能不被高階消費者接受。', insight: 'Elon Musk 在 2006 年 Master Plan 一文揭示策略：先做高價跑車（Roadster）建立品牌，再分階段下放成平價車（Model 3）。', solution: '高端 sedan 設計 + 大容量鋰電池長續航 + Autopilot + OTA 軟體更新', impact: '推動全球車廠電動化、改變汽車業遊戲規則', source: 'Tesla blog: "The Secret Tesla Motors Master Plan"（2006）；Ashlee Vance《Elon Musk》傳記（2015）' },
  { name: 'IKEA 平裝家具', icon: '🛋', year: 1956, problem: '家具體積大、運輸成本高、難放進公寓電梯。', insight: 'IKEA 員工 Gillis Lundgren 為了把桌子塞進汽車而拆下桌腳——啟發了「平裝（flat pack）」概念。', solution: '所有家具拆解平裝 + 客戶自行組裝（DIY）+ 樣品屋展示', impact: '創造全球最大家具品牌、開創 DIY 家具文化', source: 'IKEA 官方歷史頁面（ikea.com/about-ikea/our-heritage）；Ingvar Kamprad《The Testament of a Furniture Dealer》' },
  { name: 'Post-it 便利貼', icon: '📒', year: 1968, problem: '3M 化學家 Spencer Silver 1968 年發明了一種低黏性、可重複貼撕的膠水，但起初看不出商業用途。', insight: '6 年後（1974），同公司 Art Fry 在教會合唱練習時希望讚美詩集裡的書籤不會掉出來——想到 Silver 的膠水恰好可用。', solution: '可重複黏貼、不傷紙、各種顏色尺寸的便條紙；正式上市於 1980 年。', impact: '原本「失敗的產品」變成 3M 最知名的辦公文具之一', source: '3M 官方歷史頁面《The Post-it Note Story》；Smithsonian Magazine 報導' },
  { name: 'Square 行動刷卡機', icon: '💳', year: 2009, problem: '小商家用不起傳統信用卡刷卡機（昂貴+合約綁定）。', insight: 'Jack Dorsey 朋友 Jim McKelvey 是玻璃藝術家，因不能刷卡而錯失一筆 2,000 美元交易——兩人決定打造「人人可用」的刷卡裝置。', solution: '插耳機孔的小白方塊 + 免費 App + 2.75% 手續費（無月費）', impact: '改變小商家收款方式、創造 fintech 新賽道', source: 'Square / Block 官方 newsroom；Bloomberg Businessweek 2014 年專題報導' },
  { name: 'Google 搜尋（PageRank）', icon: '🔍', year: 1998, problem: '1990 年代主流搜尋引擎以「關鍵字密度」排序，內容農場容易作弊。', insight: 'Stanford 博士生 Larry Page 與 Sergey Brin：學術論文以「被引用次數」評估重要性—為何不用在網頁排名？', solution: 'PageRank 演算法—依「多少高權重網站連結到這頁」決定排名', impact: '創造 Google、改變網路導航方式、催生 SEO 產業', source: 'Page & Brin《The Anatomy of a Large-Scale Hypertextual Web Search Engine》Stanford 1998 論文；Google 官方公司歷史' },
];

const PK = 'dp_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cases = document.getElementById('cases');
CASES.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;border-left:5px solid #9333EA';
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:36px">${c.icon}</span><div><h4 style="margin:0;color:#6B21A8">${c.name}</h4><span style="font-size:11px;color:#666">${c.year}</span></div></div>
    <p style="font-size:13px;color:#444"><strong style="color:#dc2626">❌ 問題：</strong>${c.problem}</p>
    <p style="font-size:13px;color:#444"><strong style="color:#F59E0B">💡 洞察：</strong>${c.insight}</p>
    <p style="font-size:13px;color:#444"><strong style="color:#9333EA">🎯 解法：</strong>${c.solution}</p>
    <p style="font-size:13px;color:#16A34A"><strong>🏆 影響：</strong>${c.impact}</p>
    ${c.source ? `<p style="font-size:11px;color:#94a3b8;margin-top:6px;border-top:1px dashed #E5E7EB;padding-top:6px"><strong>📚 來源：</strong>${c.source}</p>` : ''}`;
  cases.appendChild(card);
});
const p = loadP(); p.module5 = true; saveP(p);
