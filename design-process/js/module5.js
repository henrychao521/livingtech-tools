// 設計流程 模組 5：8 個經典案例
const CASES = [
  { name: 'iPhone (2007)', icon: '📱', year: 2007, problem: '當時手機鍵盤大、UI 醜、上網慢、相機糟。', insight: 'Jobs：「人們不知道自己想要什麼，要給他們看到才知道。」', solution: '電容觸控螢幕（無實體鍵盤）+ App Store 生態系 + 簡潔 UI + iPod 整合', impact: '改變整個手機產業、創造 App 經濟、智慧手機標準範本' },
  { name: 'Dyson 吸塵器', icon: '🧹', year: 1993, problem: 'James Dyson 對傳統吸塵器集塵袋會塞住、吸力下降很煩。', insight: '在木材廠看到「氣旋分離」原理 → 為何不用在吸塵器？', solution: '無集塵袋設計 + 雙氣旋分離技術 + 5127 個原型反覆測試 5 年', impact: '創造 Dyson 公司、氣旋吸塵成為高階吸塵器標準' },
  { name: 'Airbnb', icon: '🏠', year: 2008, problem: '舊金山設計師付不出房租 + 旅館太貴。', insight: '人有空房、人需要便宜住宿——為何不媒合？', solution: '線上平台 + 房東自助 + 雙向評價系統 + 信任機制', impact: '改變旅遊住宿產業、創造共享經濟、迫使旅館業轉型' },
  { name: 'Tesla Model S', icon: '⚡', year: 2012, problem: '當時電動車醜、慢、續航差，被認為「玩具車」。', insight: 'Musk：電動車要先做「跑車」改變印象，再做平價版。', solution: '高端 sedan 設計 + 大電池長續航 + 自動駕駛 + OTA 軟體更新', impact: '推動全球車廠電動化、改變汽車業遊戲規則' },
  { name: 'IKEA 平裝家具', icon: '🛋', year: 1956, problem: '家具大、運費貴、放不進小公寓。', insight: '工人組裝桌子時想到：「如果腿可拆下來呢？」', solution: '所有家具拆解平裝 + 客戶自行組裝（DIY）+ 樣品屋展示', impact: '創造全球最大家具品牌、開創 DIY 家具文化' },
  { name: 'Post-it 便利貼', icon: '📒', year: 1968, problem: '3M 化學家發明了「不黏」的膠水，公司覺得沒用。', insight: '一位同事在教會唱詩本書籤老掉——「不太黏的膠水剛好！」', solution: '可重複黏貼、不傷紙、各種顏色尺寸的便條紙', impact: '原本「失敗的產品」變成 3M 最賺錢的單品之一，全球辦公室必備' },
  { name: 'Square 行動刷卡機', icon: '💳', year: 2009, problem: '小商家用不起傳統信用卡刷卡機（昂貴+合約綁定）。', insight: 'Jack Dorsey 朋友賣玻璃花瓶因不能刷卡而損失 2000 美元交易。', solution: '插耳機孔的小白方塊 + 免費 App + 2.75% 手續費（無月費）', impact: '改變小商家收款方式、創造 fintech 新賽道、市值千億' },
  { name: 'Google 搜尋', icon: '🔍', year: 1998, problem: '90 年代搜尋引擎排序很爛——關鍵字塞最多的網站排前。', insight: 'Page 與 Brin：學術論文「被引用次數」可衡量重要性。', solution: 'PageRank 演算法 - 看「多少網站連結到這頁」決定排名', impact: '創造 Google、改變網路導航方式、催生 SEO 產業' },
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
    <p style="font-size:13px;color:#16A34A"><strong>🏆 影響：</strong>${c.impact}</p>`;
  cases.appendChild(card);
});
const p = loadP(); p.module5 = true; saveP(p);
