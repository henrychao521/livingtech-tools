// 3D 印表機 模組 5：故障排除圖鑑
const ERRORS = [
  { id: 'warping', name: '翹邊（Warping）', symptom: '物件邊角從熱床翹起', cause: '首層降溫太快收縮、熱床溫度不足、熱床不平、底面太小', fix: '提高熱床溫度 5–10°C、用裙邊（brim）加大底面、加封閉外殼（防風）、使用 PEI 膠帶或膠水增加附著' },
  { id: 'spaghetti', name: '義大利麵（Spaghetti）', symptom: '列印中物件掉了，噴頭在空中亂噴絲', cause: '首層沒附著好就繼續列印 / 列印中物件被撞掉', fix: '立刻停止列印！清除所有絲線、重新校正熱床、檢查首層附著是否確實' },
  { id: 'splitting', name: '層分離（Layer Splitting）', symptom: '列印物件中間裂開、層與層之間分離', cause: '溫度不夠（層間黏不牢）、列印速度太快、絲線受潮、風扇太強', fix: '提高噴頭溫度 5–10°C、降低速度、絲線烘乾 4 小時、降低風扇強度' },
  { id: 'under', name: '欠擠出（Under-extrusion）', symptom: '物件表面有縫、層不滿、像啃過的餅乾', cause: '噴嘴堵料、絲線打滑、絲線受潮、流量設定太低', fix: '冷拉清噴嘴、檢查擠出機齒輪有沒有打滑磨損、烘乾絲線、流量調至 100% 或微調' },
  { id: 'over', name: '過擠出（Over-extrusion）', symptom: '表面凸凹、有絲線堆積、邊緣鼓起', cause: '流量設定太高、層厚過薄', fix: '流量降至 95%、檢查層厚是否合理（建議 0.15–0.25mm）' },
  { id: 'stringing', name: '牽絲（Stringing）', symptom: '兩個物件之間有細絲、表面有蜘蛛網狀絲線', cause: '回抽不足、列印溫度過高、絲線受潮', fix: '增加回抽距離（5–8mm）、降低溫度 5°C、烘乾絲線' },
  { id: 'bridging', name: '橋接失敗（Bridging）', symptom: '懸空部位下垂、不平整', cause: '橋接距離太長、風扇不足、橋接速度太快', fix: '加支撐結構、開風扇 100%、橋接速度降至 30–50mm/s' },
  { id: 'zbanding', name: 'Z 紋（Z-banding）', symptom: '物件表面有規律的水平條紋', cause: 'Z 軸絲桿不直 / 偏心、Z 軸馬達失步、列印溫度不穩', fix: '檢查 Z 軸絲桿、潤滑滑軌、確認熱床溫度穩定（電源功率充足）' },
];

function renderFailureSVG(id) {
  const SVGs = {
    warping: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="80" width="180" height="20" fill="#7f1d1d"/>
      <rect x="10" y="78" width="180" height="4" fill="#dc2626"/>
      <!-- 翹起的物件 -->
      <path d="M 30 78 Q 35 55 50 50 L 150 50 Q 165 55 170 78 Z" fill="#06b6d4" stroke="#0e7490" stroke-width="1"/>
      <!-- 層紋 -->
      <line x1="35" y1="62" x2="165" y2="62" stroke="rgba(0,0,0,.2)"/>
      <line x1="36" y1="70" x2="164" y2="70" stroke="rgba(0,0,0,.2)"/>
      <!-- 翹起角 -->
      <path d="M 30 78 Q 35 55 50 50 L 50 78 Z" fill="rgba(220,38,38,.4)" stroke="#dc2626" stroke-width="1.5"/>
      <path d="M 170 78 Q 165 55 150 50 L 150 78 Z" fill="rgba(220,38,38,.4)" stroke="#dc2626" stroke-width="1.5"/>
      <text x="30" y="40" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 翹起</text>
      <text x="135" y="40" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 翹起</text>
    </svg>`,

    spaghetti: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 噴頭 -->
      <rect x="90" y="20" width="20" height="20" fill="#1e293b"/>
      <polygon points="95,40 105,40 100,48" fill="#fbbf24"/>
      <!-- 散亂的絲線 -->
      <path d="M 100 48 Q 30 50 25 95 Q 50 70 100 90 Q 150 60 175 95 Q 130 80 100 48" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity=".85"/>
      <path d="M 100 48 Q 70 70 50 80 Q 80 95 120 78 Q 140 60 100 48" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity=".7"/>
      <path d="M 100 48 Q 130 80 160 95" fill="none" stroke="#06b6d4" stroke-width="1.5"/>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 物件脫離 → 空噴</text>
    </svg>`,

    splitting: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 上層 -->
      <rect x="60" y="20" width="80" height="34" fill="#8b5cf6" stroke="#5b21b6"/>
      <line x1="60" y1="32" x2="140" y2="32" stroke="rgba(0,0,0,.2)"/>
      <line x1="60" y1="44" x2="140" y2="44" stroke="rgba(0,0,0,.2)"/>
      <!-- 裂縫 -->
      <rect x="60" y="54" width="80" height="6" fill="#fef3c7" stroke="#dc2626" stroke-dasharray="3 2"/>
      <text x="100" y="60" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">⇆ 裂開</text>
      <!-- 下層 -->
      <rect x="60" y="60" width="80" height="40" fill="#8b5cf6" stroke="#5b21b6"/>
      <line x1="60" y1="72" x2="140" y2="72" stroke="rgba(0,0,0,.2)"/>
      <line x1="60" y1="84" x2="140" y2="84" stroke="rgba(0,0,0,.2)"/>
    </svg>`,

    under: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <rect x="40" y="30" width="120" height="70" fill="#8b5cf6" stroke="#5b21b6"/>
      <!-- 縫隙 -->
      <line x1="50" y1="42" x2="78" y2="42" stroke="#fef3c7" stroke-width="3"/>
      <line x1="90" y1="42" x2="150" y2="42" stroke="#fef3c7" stroke-width="3"/>
      <line x1="50" y1="56" x2="100" y2="56" stroke="#fef3c7" stroke-width="3"/>
      <line x1="115" y1="56" x2="150" y2="56" stroke="#fef3c7" stroke-width="3"/>
      <line x1="50" y1="70" x2="130" y2="70" stroke="#fef3c7" stroke-width="3"/>
      <line x1="50" y1="84" x2="80" y2="84" stroke="#fef3c7" stroke-width="3"/>
      <line x1="95" y1="84" x2="150" y2="84" stroke="#fef3c7" stroke-width="3"/>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 層中有縫隙</text>
    </svg>`,

    over: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 凸凹不平的物件 -->
      <path d="M 40 100 L 40 50 Q 50 30 60 50 Q 70 35 80 50 Q 90 30 100 50 Q 110 35 120 50 Q 130 30 140 50 Q 150 35 160 50 L 160 100 Z" fill="#8b5cf6" stroke="#5b21b6"/>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 表面凸起堆料</text>
    </svg>`,

    stringing: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 兩個物件 -->
      <rect x="30" y="55" width="40" height="45" fill="#8b5cf6" stroke="#5b21b6"/>
      <rect x="130" y="55" width="40" height="45" fill="#8b5cf6" stroke="#5b21b6"/>
      <!-- 蜘蛛網絲 -->
      <line x1="70" y1="58" x2="130" y2="58" stroke="#06b6d4" stroke-width=".8"/>
      <line x1="70" y1="64" x2="130" y2="62" stroke="#06b6d4" stroke-width=".8"/>
      <line x1="70" y1="70" x2="130" y2="68" stroke="#06b6d4" stroke-width=".8"/>
      <line x1="70" y1="76" x2="130" y2="74" stroke="#06b6d4" stroke-width=".8"/>
      <line x1="70" y1="82" x2="130" y2="78" stroke="#06b6d4" stroke-width=".8"/>
      <line x1="70" y1="88" x2="130" y2="84" stroke="#06b6d4" stroke-width=".8"/>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 細絲跨接兩物件</text>
    </svg>`,

    bridging: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 兩支柱 -->
      <rect x="30" y="40" width="30" height="60" fill="#8b5cf6" stroke="#5b21b6"/>
      <rect x="140" y="40" width="30" height="60" fill="#8b5cf6" stroke="#5b21b6"/>
      <!-- 下垂的橋 -->
      <path d="M 60 42 Q 100 75 140 42 L 140 50 Q 100 80 60 50 Z" fill="#8b5cf6" stroke="#5b21b6"/>
      <line x1="100" y1="68" x2="100" y2="78" stroke="#dc2626" stroke-width="1.5" marker-end="url(#arr)"/>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 橋接下垂</text>
    </svg>`,

    zbanding: `<svg viewBox="0 0 200 120" style="width:90%">
      <rect x="10" y="100" width="180" height="14" fill="#7f1d1d"/>
      <!-- 圓柱有 Z 紋 -->
      <ellipse cx="100" cy="22" rx="45" ry="6" fill="#a78bfa" stroke="#5b21b6"/>
      <rect x="55" y="22" width="90" height="78" fill="#8b5cf6" stroke="#5b21b6"/>
      <!-- Z 紋（規則波浪）-->
      <g stroke="#5b21b6" stroke-width="1" opacity=".7">
        <path d="M 55 32 Q 100 35 145 32" fill="none"/>
        <path d="M 55 44 Q 100 47 145 44" fill="none"/>
        <path d="M 55 56 Q 100 59 145 56" fill="none"/>
        <path d="M 55 68 Q 100 71 145 68" fill="none"/>
        <path d="M 55 80 Q 100 83 145 80" fill="none"/>
        <path d="M 55 92 Q 100 95 145 92" fill="none"/>
      </g>
      <ellipse cx="100" cy="22" rx="45" ry="6" fill="none" stroke="#5b21b6"/>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 規律水平條紋</text>
    </svg>`,
  };
  return SVGs[id] || `<span style="font-size:48px">⚠️</span>`;
}

const grid = document.getElementById('error-grid');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;transition:all .25s';
  card.innerHTML = `
    <div style="height:140px;background:linear-gradient(180deg,#e0f2fe,#cffafe);border-radius:10px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;padding:8px">
      ${renderFailureSVG(e.id)}
    </div>
    <span style="display:inline-block;font-size:11px;background:var(--danger-light);color:var(--danger);padding:3px 10px;border-radius:999px;font-weight:700;margin-bottom:8px">常見錯誤</span>
    <h4 style="font-size:16px;margin-bottom:6px">${e.name}</h4>
    <p style="font-size:13px;color:var(--text-soft);line-height:1.65;margin-bottom:8px"><strong>症狀：</strong>${e.symptom}</p>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;line-height:1.6"><strong style="color:#a72d2d">原因：</strong>${e.cause}</p>
    <div style="font-size:12px;color:var(--accent);background:var(--accent-light);padding:8px 10px;border-radius:8px;border-left:3px solid var(--accent);line-height:1.6"><strong style="color:#5b21b6">解法：</strong>${e.fix}</div>
  `;
  grid.appendChild(card);
});

const PK = 'printer3d_progress_v1';
let p; try { p = JSON.parse(localStorage.getItem(PK)) || {}; } catch { p = {}; }
p.module5 = true;
localStorage.setItem(PK, JSON.stringify(p));
