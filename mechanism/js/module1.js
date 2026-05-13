// 機構運動 模組 1：6 種常見機構
const MECHS = [
  {
    id: 'crank',
    name: '曲柄滑塊機構 Crank-Slider',
    motion: '旋轉 ↔ 往復',
    principle: '驅動圓盤連動連桿，把圓周運動轉換成滑塊的直線往復運動（或反過來）。是內燃機活塞、縫紉機針、空氣壓縮機的核心。',
    examples: '汽車活塞、縫紉機、空氣壓縮機、衝床',
    viz: `<svg viewBox="0 0 240 100"><line x1="20" y1="60" x2="220" y2="60" stroke="#475569" stroke-width="2"/><circle cx="50" cy="60" r="22" fill="#CCFBF1" stroke="#14B8A6" stroke-width="3"/><circle cx="50" cy="60" r="5" fill="#0F766E"/><g><circle cx="72" cy="60" r="5" fill="#DC2626"><animateTransform attributeName="transform" type="rotate" from="0 50 60" to="360 50 60" dur="2.5s" repeatCount="indefinite"/></circle></g><line x1="72" y1="60" x2="170" y2="60" stroke="#0F766E" stroke-width="3"><animate attributeName="x1" values="72;50;28;50;72" dur="2.5s" repeatCount="indefinite"/><animate attributeName="y1" values="60;82;60;38;60" dur="2.5s" repeatCount="indefinite"/></line><rect x="160" y="50" width="20" height="20" fill="#14B8A6"><animate attributeName="x" values="160;145;160;180;160" dur="2.5s" repeatCount="indefinite"/></rect></svg>`,
  },
  {
    id: 'cam',
    name: '凸輪機構 Cam',
    motion: '旋轉 → 規律往復',
    principle: '凸輪是非圓形的旋轉件，從動件（follower）沿凸輪輪廓上下移動。凸輪輪廓形狀決定從動件的運動曲線（如等速、加速、停留）。',
    examples: '引擎進排氣門、自動鎖、印刷機、機械音樂盒',
    viz: `<svg viewBox="0 0 240 100"><g transform="translate(80,55)"><ellipse rx="32" ry="22" fill="#CCFBF1" stroke="#14B8A6" stroke-width="3"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></ellipse><circle r="6" fill="#0F766E"/></g><rect x="74" y="22" width="12" height="20" fill="#14B8A6"><animate attributeName="y" values="22;14;22;30;22" dur="3s" repeatCount="indefinite"/></rect><line x1="80" y1="22" x2="80" y2="6" stroke="#0F766E" stroke-width="3"/><rect x="140" y="20" width="80" height="6" fill="#475569"/><text x="170" y="80" font-size="9" fill="#0F766E" font-weight="700">從動件上下</text></svg>`,
  },
  {
    id: 'gear',
    name: '齒輪機構 Gear',
    motion: '旋轉 → 旋轉',
    principle: '兩個或多個帶齒的圓盤相互咬合，傳遞旋轉動力。齒數比決定速度比與扭力比——大齒輪驅動小齒輪 = 增速減力，反之 = 減速增力。',
    examples: '腳踏車變速、手錶、汽車變速箱、鐘樓',
    viz: `<svg viewBox="0 0 240 100"><g transform="translate(80,55)"><g><circle r="26" fill="#CCFBF1" stroke="#14B8A6" stroke-width="2"/><g fill="#14B8A6"><rect x="-3" y="-30" width="6" height="8"/><rect x="-3" y="22" width="6" height="8"/><rect x="-30" y="-3" width="8" height="6"/><rect x="22" y="-3" width="8" height="6"/><rect x="-23" y="-23" width="6" height="6" transform="rotate(45)"/><rect x="-23" y="17" width="6" height="6" transform="rotate(-45)"/><rect x="17" y="-23" width="6" height="6" transform="rotate(-45)"/><rect x="17" y="17" width="6" height="6" transform="rotate(45)"/></g><circle r="6" fill="#0F766E"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></g></g><g transform="translate(170,55)"><g><circle r="18" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/><g fill="#F59E0B"><rect x="-2" y="-22" width="4" height="6"/><rect x="-2" y="16" width="4" height="6"/><rect x="-22" y="-2" width="6" height="4"/><rect x="16" y="-2" width="6" height="4"/></g><circle r="4" fill="#92400E"/><animateTransform attributeName="transform" type="rotate" from="0" to="-540" dur="3s" repeatCount="indefinite"/></g></g></svg>`,
  },
  {
    id: 'fourbar',
    name: '四連桿機構 Four-Bar Linkage',
    motion: '旋轉 → 擺動',
    principle: '4 根桿件用 4 個轉動關節連成一個閉合迴路。輸入桿（驅動桿）旋轉，輸出桿（搖桿）做擺動。不同的桿長比例會產生不同的運動軌跡。',
    examples: '汽車雨刷、縫紉機壓腳、挖土機鏟臂、椅背調整',
    viz: `<svg viewBox="0 0 240 100"><line x1="40" y1="80" x2="200" y2="80" stroke="#475569" stroke-width="3"/><circle cx="40" cy="80" r="4" fill="#0F766E"/><circle cx="200" cy="80" r="4" fill="#0F766E"/><g><line x1="40" y1="80" x2="65" y2="35" stroke="#14B8A6" stroke-width="4" stroke-linecap="round"><animate attributeName="x2" values="65;40;15;40;65" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="35;30;55;90;35" dur="3s" repeatCount="indefinite"/></line><line x1="65" y1="35" x2="170" y2="30" stroke="#0F766E" stroke-width="4" stroke-linecap="round"><animate attributeName="x1" values="65;40;15;40;65" dur="3s" repeatCount="indefinite"/><animate attributeName="y1" values="35;30;55;90;35" dur="3s" repeatCount="indefinite"/><animate attributeName="x2" values="170;180;170;160;170" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="30;50;65;50;30" dur="3s" repeatCount="indefinite"/></line><line x1="170" y1="30" x2="200" y2="80" stroke="#14B8A6" stroke-width="4" stroke-linecap="round"><animate attributeName="x1" values="170;180;170;160;170" dur="3s" repeatCount="indefinite"/><animate attributeName="y1" values="30;50;65;50;30" dur="3s" repeatCount="indefinite"/></line></g></svg>`,
  },
  {
    id: 'ratchet',
    name: '棘輪機構 Ratchet',
    motion: '單向旋轉 / 間歇傳動',
    principle: '齒輪只能單向轉動——卡爪（pawl）防止反轉。轉動方向上有間歇式咔咔咔的鎖緊感。',
    examples: '扳手、絞盤、手錶上鏈、自行車後輪、千斤頂',
    viz: `<svg viewBox="0 0 240 100"><g transform="translate(120,55)"><g><circle r="28" fill="#CCFBF1" stroke="#14B8A6" stroke-width="2"/><g fill="#14B8A6"><polygon points="-3,-28 6,-26 0,-20"/><polygon points="25,-12 30,-3 21,-9"/><polygon points="25,12 18,9 28,3"/><polygon points="0,28 -6,20 6,20"/><polygon points="-25,12 -28,3 -18,9"/><polygon points="-25,-12 -18,-9 -28,-3"/></g><animateTransform attributeName="transform" type="rotate" values="0;60;60;120;120;180;180;240;240;300;300;360" dur="3.6s" repeatCount="indefinite" keyTimes="0;.083;.166;.249;.332;.415;.498;.581;.664;.747;.83;.913;1"/></g></g><line x1="148" y1="42" x2="166" y2="32" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/><circle cx="166" cy="32" r="4" fill="#DC2626"/></svg>`,
  },
  {
    id: 'belt',
    name: '皮帶 / 鏈條傳動 Belt & Chain',
    motion: '遠距旋轉傳遞',
    principle: '兩個輪靠皮帶或鏈條連接，遠距離傳遞旋轉動力。輪直徑比決定速度比。皮帶可滑動保護過載；鏈條無滑差但需潤滑。',
    examples: '腳踏車鏈條、汽車皮帶、輸送帶、印表機進紙',
    viz: `<svg viewBox="0 0 240 100"><circle cx="60" cy="55" r="28" fill="#CCFBF1" stroke="#14B8A6" stroke-width="3"/><circle cx="60" cy="55" r="6" fill="#0F766E"/><circle cx="180" cy="55" r="18" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3"/><circle cx="180" cy="55" r="4" fill="#92400E"/><path d="M 60 27 L 180 37 M 60 83 L 180 73" stroke="#1e293b" stroke-width="3"/><g><circle cx="60" cy="55" r="3" fill="#DC2626" transform="translate(0,-28)"><animateTransform attributeName="transform" type="rotate" from="0 60 55" to="360 60 55" dur="3s" repeatCount="indefinite"/></circle></g></svg>`,
  },
];

// 立體圖 viz 統一改用 OpenSCAD PNG（從 .scad 參數化建模渲染）
// 保留原 SVG 動畫 viz 在 .vizAnim 欄位（M4 模擬器可用，本模組 M1 用靜態立體圖）
MECHS.forEach(m => {
  m.vizAnim = m.viz;
  m.viz = `<img src="../../models/mechanism/${m.id}-iso.png" alt="${m.name}" style="width:100%;height:140px;object-fit:contain;background:#1E293B;border-radius:8px;display:block" loading="lazy">`;
});

const PK = 'mech_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);

const grid = document.getElementById('mech-grid');
const progressEl = document.getElementById('progress-text');
const nextBtn = document.getElementById('next-btn');

MECHS.forEach(m => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #14B8A6;${seen.has(m.id) ? 'background:#CCFBF1' : ''}`;
  card.innerHTML = `
    <h4 style="margin:0 0 10px;color:#0F766E">${m.name}</h4>
    <div style="background:#0f172a;border-radius:10px;padding:8px;margin-bottom:10px">${m.viz}</div>
    <p style="font-size:13px;color:#0F766E;font-weight:700;background:#CCFBF1;padding:5px 10px;border-radius:5px;display:inline-block;margin:5px 0">運動：${m.motion}</p>
    <p style="font-size:13px;color:#444;margin:6px 0"><strong>原理：</strong>${m.principle}</p>
    <p style="font-size:12.5px;color:#666"><strong>範例：</strong>${m.examples}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      card.style.background = '#CCFBF1';
      progressEl.textContent = `已認識 ${seen.size} / 6 種`;
      const p = loadP();
      p.module1_seen = Array.from(seen);
      if (seen.size === 6) {
        p.module1 = true;
        nextBtn.style.opacity = 1;
        nextBtn.style.pointerEvents = 'auto';
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        showToast('🎉 6 種機構認識完畢！', 'good');
      } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});

progressEl.textContent = `已認識 ${seen.size} / 6 種`;
if (seen.size === 6) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
