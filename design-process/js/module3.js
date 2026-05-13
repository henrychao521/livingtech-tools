// 設計流程 模組 3：9 個發想工具
const TOOLS = [
  { name: '腦力激盪 Brainstorming', icon: '🧠', use: '快速產生大量點子', rule: '不批評、求量、歡迎瘋狂、組合他人想法、視覺化',
    example: '5 人 30 分鐘可產出 100+ 個點子。「設計新書包」可能想到：磁吸帶、太陽能板、防雨袋、會發光、藍牙喇叭...' },
  { name: 'SCAMPER 七法', icon: '🔧', use: '改良既有產品', rule: 'S 替換 / C 結合 / A 適應 / M 修改 / P 用途 / E 消除 / R 反向',
    example: '改良傳統雨傘：S 把布換成自動烘乾材質、C 結合 LED 照明、M 改 360° 設計、E 消除骨架（智慧薄膜雨衣）' },
  { name: '心智圖 Mind Map', icon: '🌳', use: '展開議題的所有面向', rule: '中央寫主題 → 放射主分支 → 每分支再分子分支',
    example: '中央：學生書包 → 分支：使用情境（上下學/體育課）、痛點（重、悶）、材料（防水/輕量）、智慧化（GPS/RFID）' },
  { name: '6 頂思考帽', icon: '🎩', use: '從多角度評估點子', rule: '白（事實）/ 紅（情感）/ 黑（風險）/ 黃（優點）/ 綠（創意）/ 藍（流程）',
    example: '評估「電動滑板車」：白 = 速度 25km/h、紅 = 帥/酷、黑 = 失控危險、黃 = 環保便利、綠 = 加 AR 導航、藍 = 先試做原型' },
  { name: 'How Might We... HMW', icon: '❓', use: '把問題轉成可行的設計問題', rule: 'How（如何）+ Might（可能）+ We（我們）= 我們可能如何做出 [產品] 來解決 [問題]',
    example: '原問題：「學生書包太重」→ HMW：「我們可能如何減輕學生上下學的負擔同時保持便利？」（範圍更廣、解法空間大）' },
  { name: 'Crazy 8 速繪', icon: '✏', use: '快速產出 8 個視覺概念', rule: 'A4 紙折 8 格 → 每格 1 分鐘 → 8 分鐘畫 8 個不同概念',
    example: '時間壓力強迫不思考細節、只畫核心 idea。後期可挑 2-3 個延伸成完整草圖。' },
  { name: '反向思考', icon: '🔄', use: '打破慣性思維', rule: '把問題反過來問：要達到 X，我們可以怎麼做？→ 要破壞 X，怎麼做？',
    example: '原：如何讓學生「不」忘記帶傘？→ 反向：如何讓學生「故意」忘傘？→ 反推 → 設計「傘自己會跟著人」（RFID 提醒、藍牙連手機）' },
  { name: '類比思考 Analogy', icon: '🔍', use: '從其他領域借靈感', rule: '看其他行業/物種如何解決類似問題',
    example: '想設計防滑鞋：類比壁虎腳（奈米粗糙表面）→ 蜘蛛腳（剛毛吸附）→ 章魚吸盤 → 創意防滑系統。' },
  { name: '使用者旅程圖', icon: '🗺', use: '從使用者角度看完整體驗', rule: '把使用一個產品從接觸→使用→丟棄的所有「節點」畫出來',
    example: '搭捷運：1.到站 → 2.買票 → 3.進站 → 4.等車 → 5.上車 → 6.車內 → 7.下車 → 8.出站。每節點可能有痛點待解決。' },
];

const PK = 'dp_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module3_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

TOOLS.forEach((t, i) => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;border-left:5px solid #9333EA;${seen.has(i) ? 'background:#F3E8FF' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:28px">${t.icon}</span><h4 style="margin:0;color:#6B21A8;font-size:15px">${t.name}</h4></div>
    <p style="font-size:12.5px;color:#9333EA;font-weight:700;background:#F3E8FF;padding:5px 10px;border-radius:5px"><strong>用途：</strong>${t.use}</p>
    <p style="font-size:12.5px;color:#666;margin:6px 0"><strong>規則：</strong>${t.rule}</p>
    <p style="font-size:12px;color:#444"><strong>範例：</strong>${t.example}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(i)) {
      seen.add(i); card.style.background = '#F3E8FF';
      progEl.textContent = `已認識 ${seen.size} / 9 種`;
      const p = loadP(); p.module3_seen = Array.from(seen);
      if (seen.size === 9) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 9 個工具都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 9 種`;
if (seen.size === 9) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
