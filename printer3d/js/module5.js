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
    // 翹邊：扁平物件邊角從紅色熱床翹起，可看出層紋與彎曲弧度
    warping: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-w" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-w" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#67e8f9"/><stop offset=".5" stop-color="#06b6d4"/><stop offset="1" stop-color="#0e7490"/>
        </linearGradient>
      </defs>
      <!-- 熱床（含陰影）-->
      <ellipse cx="100" cy="105" rx="95" ry="4" fill="rgba(0,0,0,.2)"/>
      <rect x="10" y="78" width="180" height="22" fill="url(#bedG-w)"/>
      <rect x="10" y="76" width="180" height="4" fill="#ef4444"/>
      <!-- 翹起的方板（左邊翹起厲害、右邊翹起較輕）-->
      <path d="M 20 78 Q 24 56 38 52 L 70 52 L 130 52 L 162 52 Q 176 55 180 78 Z" fill="url(#objG-w)" stroke="#0e7490" stroke-width="1"/>
      <!-- 層紋 -->
      <path d="M 22 60 Q 26 56 40 56 L 160 56 Q 174 56 178 60" stroke="rgba(0,0,0,.25)" stroke-width=".6" fill="none"/>
      <path d="M 21 65 Q 25 62 40 62 L 160 62 Q 175 62 179 65" stroke="rgba(0,0,0,.18)" stroke-width=".5" fill="none"/>
      <path d="M 18 73 L 182 73" stroke="rgba(0,0,0,.15)" stroke-width=".4"/>
      <!-- 翹起區明亮邊緣 -->
      <line x1="20" y1="78" x2="38" y2="52" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
      <line x1="180" y1="78" x2="162" y2="52" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
      <!-- 翹起角縫隙（紅標示）-->
      <path d="M 20 78 L 38 52 L 38 78 Z" fill="rgba(254,243,199,.5)" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 1"/>
      <path d="M 180 78 L 162 52 L 162 78 Z" fill="rgba(254,243,199,.5)" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 1"/>
      <!-- 標籤 -->
      <text x="22" y="44" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 翹起</text>
      <text x="142" y="44" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 翹起</text>
      <text x="100" y="18" text-anchor="middle" font-size="9" fill="#7f1d1d" font-family="Noto Sans TC">邊角脫離熱床</text>
    </svg>`,

    // 義大利麵：物件脫離後噴頭在空中亂噴，產生雜亂纏繞的絲線堆
    spaghetti: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-s" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
      </defs>
      <!-- 熱床 -->
      <ellipse cx="100" cy="108" rx="95" ry="4" fill="rgba(0,0,0,.2)"/>
      <rect x="10" y="98" width="180" height="14" fill="url(#bedG-s)"/>
      <rect x="10" y="96" width="180" height="3" fill="#ef4444"/>
      <!-- 噴頭組 -->
      <rect x="86" y="14" width="28" height="18" rx="2" fill="#0f172a"/>
      <rect x="89" y="16" width="22" height="6" fill="#dc2626"/>
      <text x="100" y="22" text-anchor="middle" font-size="6" fill="#fff" font-weight="700">200°C</text>
      <polygon points="94,32 106,32 100,42" fill="#fbbf24"/>
      <!-- 紊亂絲線堆（多條交錯曲線，不同深淺）-->
      <g fill="none" stroke-linecap="round">
        <path d="M 100 42 C 130 50 150 70 158 95 C 138 80 110 92 100 95 C 80 92 60 78 38 95 C 50 70 75 50 100 42" stroke="#06b6d4" stroke-width="2" opacity=".85"/>
        <path d="M 100 42 C 75 55 50 65 32 86 C 60 78 85 88 100 96 C 115 88 140 78 168 86 C 150 65 125 55 100 42" stroke="#06b6d4" stroke-width="1.8" opacity=".7"/>
        <path d="M 100 50 C 85 60 70 75 60 88 C 80 80 100 92 120 88 C 130 75 115 60 100 50" stroke="#0891b2" stroke-width="1.5" opacity=".8"/>
        <path d="M 95 55 C 80 70 65 80 50 92" stroke="#22d3ee" stroke-width="1.3" opacity=".6"/>
        <path d="M 105 55 C 120 70 135 80 150 92" stroke="#22d3ee" stroke-width="1.3" opacity=".6"/>
        <path d="M 100 45 Q 90 60 85 75 Q 95 85 100 95" stroke="#0e7490" stroke-width="1.2" opacity=".75"/>
      </g>
      <!-- 末端突出的小圈 -->
      <circle cx="38" cy="92" r="2.5" fill="#06b6d4" opacity=".7"/>
      <circle cx="160" cy="92" r="2.5" fill="#06b6d4" opacity=".7"/>
      <text x="100" y="11" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 物件脫離 → 空中亂噴</text>
    </svg>`,

    // 層分離：高物件中段有清楚的水平裂縫，可見裂縫深度與層紋
    splitting: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-sp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-sp" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#a78bfa"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <!-- 熱床 -->
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-sp)"/>
      <!-- 物件上半（多層紋）-->
      <rect x="65" y="16" width="70" height="40" fill="url(#objG-sp)"/>
      <g stroke="#5b21b6" stroke-width=".5" opacity=".5">
        <line x1="65" y1="22" x2="135" y2="22"/>
        <line x1="65" y1="28" x2="135" y2="28"/>
        <line x1="65" y1="34" x2="135" y2="34"/>
        <line x1="65" y1="40" x2="135" y2="40"/>
        <line x1="65" y1="46" x2="135" y2="46"/>
        <line x1="65" y1="52" x2="135" y2="52"/>
      </g>
      <!-- 上半邊框 -->
      <rect x="65" y="16" width="70" height="40" fill="none" stroke="#5b21b6"/>
      <!-- 裂縫（含深色陰影模擬「看穿」）-->
      <rect x="65" y="56" width="70" height="8" fill="#1e1b4b"/>
      <path d="M 65 60 L 135 60" stroke="#0f0a2e" stroke-width="1"/>
      <!-- 物件下半 -->
      <rect x="65" y="64" width="70" height="36" fill="url(#objG-sp)"/>
      <g stroke="#5b21b6" stroke-width=".5" opacity=".5">
        <line x1="65" y1="70" x2="135" y2="70"/>
        <line x1="65" y1="76" x2="135" y2="76"/>
        <line x1="65" y1="82" x2="135" y2="82"/>
        <line x1="65" y1="88" x2="135" y2="88"/>
        <line x1="65" y1="94" x2="135" y2="94"/>
      </g>
      <rect x="65" y="64" width="70" height="36" fill="none" stroke="#5b21b6"/>
      <!-- 標示 -->
      <path d="M 140 60 L 152 60" stroke="#dc2626" stroke-width="1.5"/>
      <text x="158" y="64" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">裂縫</text>
      <text x="100" y="11" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 層間分離</text>
    </svg>`,

    // 欠擠出：物件表面有許多縫隙，像是「啃過的餅乾」
    under: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-u" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-u" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-u)"/>
      <!-- 物件外框 -->
      <rect x="40" y="22" width="120" height="78" fill="url(#objG-u)"/>
      <rect x="40" y="22" width="120" height="78" fill="none" stroke="#5b21b6"/>
      <!-- 大量隨機縫隙（像 SP 拼湊起來的層）-->
      <g fill="#fef3c7" stroke="#92400e" stroke-width=".3">
        <rect x="46" y="30" width="20" height="4"/>
        <rect x="76" y="30" width="48" height="4"/>
        <rect x="138" y="30" width="14" height="4"/>
        <rect x="46" y="40" width="35" height="4"/>
        <rect x="92" y="40" width="22" height="4"/>
        <rect x="122" y="40" width="30" height="4"/>
        <rect x="46" y="50" width="60" height="4"/>
        <rect x="118" y="50" width="32" height="4"/>
        <rect x="46" y="60" width="18" height="4"/>
        <rect x="72" y="60" width="48" height="4"/>
        <rect x="130" y="60" width="22" height="4"/>
        <rect x="46" y="70" width="44" height="4"/>
        <rect x="100" y="70" width="20" height="4"/>
        <rect x="130" y="70" width="22" height="4"/>
        <rect x="46" y="80" width="28" height="4"/>
        <rect x="84" y="80" width="38" height="4"/>
        <rect x="132" y="80" width="20" height="4"/>
        <rect x="46" y="90" width="20" height="4"/>
        <rect x="76" y="90" width="48" height="4"/>
        <rect x="134" y="90" width="18" height="4"/>
      </g>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 表面有縫、層不滿</text>
    </svg>`,

    // 過擠出：物件表面凸凹不平，有絲線堆積
    over: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-o" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-o" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-o)"/>
      <!-- 不規則凸起的物件 -->
      <path d="M 40 100 L 40 60
        Q 44 50 50 60 Q 56 48 62 58 Q 70 46 78 60 Q 84 50 90 58 Q 98 44 106 60 Q 114 48 120 58 Q 128 50 134 60 Q 142 46 150 60 Q 156 50 160 58 L 160 100 Z" fill="url(#objG-o)" stroke="#5b21b6"/>
      <!-- 額外堆積的絲線 -->
      <g fill="#8b5cf6" opacity=".9">
        <ellipse cx="60" cy="65" rx="6" ry="3"/>
        <ellipse cx="100" cy="62" rx="8" ry="3"/>
        <ellipse cx="135" cy="66" rx="7" ry="3"/>
        <ellipse cx="78" cy="72" rx="5" ry="2.5"/>
        <ellipse cx="120" cy="74" rx="6" ry="2.5"/>
      </g>
      <!-- 表面層紋 -->
      <line x1="40" y1="80" x2="160" y2="80" stroke="#5b21b6" stroke-width=".4" opacity=".5"/>
      <line x1="40" y1="90" x2="160" y2="90" stroke="#5b21b6" stroke-width=".4" opacity=".5"/>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 表面凸起堆料</text>
    </svg>`,

    // 牽絲：兩個物件之間蜘蛛網狀絲線（粗細不一、有些垂下）
    stringing: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-st" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-st" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-st)"/>
      <!-- 兩個物件 -->
      <rect x="30" y="50" width="35" height="50" fill="url(#objG-st)" stroke="#5b21b6"/>
      <rect x="135" y="50" width="35" height="50" fill="url(#objG-st)" stroke="#5b21b6"/>
      <!-- 層紋 -->
      <g stroke="#5b21b6" stroke-width=".5" opacity=".4">
        <line x1="30" y1="60" x2="65" y2="60"/>
        <line x1="30" y1="70" x2="65" y2="70"/>
        <line x1="30" y1="80" x2="65" y2="80"/>
        <line x1="30" y1="90" x2="65" y2="90"/>
        <line x1="135" y1="60" x2="170" y2="60"/>
        <line x1="135" y1="70" x2="170" y2="70"/>
        <line x1="135" y1="80" x2="170" y2="80"/>
        <line x1="135" y1="90" x2="170" y2="90"/>
      </g>
      <!-- 細絲（蜘蛛網狀，部分下垂）-->
      <g fill="none" stroke="#06b6d4" stroke-linecap="round">
        <path d="M 65 53 Q 100 56 135 53" stroke-width=".5"/>
        <path d="M 65 58 Q 100 64 135 56" stroke-width=".5"/>
        <path d="M 65 63 Q 100 70 135 60" stroke-width=".4"/>
        <path d="M 65 68 Q 100 76 135 64" stroke-width=".5"/>
        <path d="M 65 73 Q 100 82 135 68" stroke-width=".4"/>
        <path d="M 65 78 Q 100 86 135 72" stroke-width=".5"/>
        <path d="M 65 83 Q 100 90 135 78" stroke-width=".4"/>
        <path d="M 65 90 Q 100 95 135 86" stroke-width=".5"/>
        <!-- 一些更粗的 -->
        <path d="M 65 55 Q 100 60 135 55" stroke-width="1" opacity=".8"/>
        <path d="M 65 75 Q 100 84 135 70" stroke-width="1" opacity=".7"/>
      </g>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 蜘蛛網狀牽絲</text>
    </svg>`,

    // 橋接失敗：兩柱間的橋下垂、不平整
    bridging: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-b" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="objG-b" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-b)"/>
      <!-- 兩支柱 -->
      <rect x="25" y="38" width="32" height="62" fill="url(#objG-b)" stroke="#5b21b6"/>
      <rect x="143" y="38" width="32" height="62" fill="url(#objG-b)" stroke="#5b21b6"/>
      <!-- 柱層紋 -->
      <g stroke="#5b21b6" stroke-width=".5" opacity=".4">
        <line x1="25" y1="50" x2="57" y2="50"/>
        <line x1="25" y1="65" x2="57" y2="65"/>
        <line x1="25" y1="80" x2="57" y2="80"/>
        <line x1="143" y1="50" x2="175" y2="50"/>
        <line x1="143" y1="65" x2="175" y2="65"/>
        <line x1="143" y1="80" x2="175" y2="80"/>
      </g>
      <!-- 下垂的橋（上凹、下凸更明顯）-->
      <path d="M 57 40 Q 100 78 143 40 L 143 50 Q 100 88 57 50 Z" fill="url(#objG-b)" stroke="#5b21b6"/>
      <!-- 橋層紋（下垂感）-->
      <path d="M 57 44 Q 100 82 143 44" stroke="#5b21b6" stroke-width=".4" opacity=".5" fill="none"/>
      <path d="M 57 48 Q 100 85 143 48" stroke="#5b21b6" stroke-width=".4" opacity=".5" fill="none"/>
      <!-- 標示下垂 -->
      <path d="M 100 30 L 100 60" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 1"/>
      <polygon points="97,58 103,58 100,64" fill="#dc2626"/>
      <text x="105" y="42" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">下垂</text>
      <text x="100" y="14" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 橋接面下垂</text>
    </svg>`,

    // Z 紋：圓柱物件表面規則水平條紋
    zbanding: `<svg viewBox="0 0 200 120" style="width:90%">
      <defs>
        <linearGradient id="bedG-z" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
        </linearGradient>
        <linearGradient id="cylG-z" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#6d28d9"/><stop offset=".3" stop-color="#a78bfa"/><stop offset=".6" stop-color="#a78bfa"/><stop offset="1" stop-color="#5b21b6"/>
        </linearGradient>
      </defs>
      <rect x="10" y="100" width="180" height="14" fill="url(#bedG-z)"/>
      <!-- 圓柱（用漸層模擬曲面）-->
      <ellipse cx="100" cy="22" rx="42" ry="6" fill="#c4b5fd" stroke="#5b21b6"/>
      <rect x="58" y="22" width="84" height="78" fill="url(#cylG-z)"/>
      <ellipse cx="100" cy="100" rx="42" ry="6" fill="#5b21b6"/>
      <rect x="58" y="22" width="84" height="78" fill="none" stroke="#5b21b6"/>
      <!-- Z 紋（規則明暗條紋，模擬螺桿失步）-->
      <g>
        <rect x="58" y="28" width="84" height="3" fill="rgba(0,0,0,.25)"/>
        <rect x="58" y="36" width="84" height="3" fill="rgba(255,255,255,.2)"/>
        <rect x="58" y="44" width="84" height="3" fill="rgba(0,0,0,.25)"/>
        <rect x="58" y="52" width="84" height="3" fill="rgba(255,255,255,.2)"/>
        <rect x="58" y="60" width="84" height="3" fill="rgba(0,0,0,.25)"/>
        <rect x="58" y="68" width="84" height="3" fill="rgba(255,255,255,.2)"/>
        <rect x="58" y="76" width="84" height="3" fill="rgba(0,0,0,.25)"/>
        <rect x="58" y="84" width="84" height="3" fill="rgba(255,255,255,.2)"/>
        <rect x="58" y="92" width="84" height="3" fill="rgba(0,0,0,.25)"/>
      </g>
      <!-- 標尺示意條紋間距 -->
      <line x1="148" y1="28" x2="148" y2="92" stroke="#dc2626" stroke-width=".8"/>
      <text x="152" y="36" font-size="8" fill="#dc2626" font-family="Inter">8mm</text>
      <text x="152" y="48" font-size="8" fill="#dc2626" font-family="Inter">8mm</text>
      <text x="152" y="60" font-size="8" fill="#dc2626" font-family="Inter">↕</text>
      <text x="100" y="13" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 規律明暗條紋</text>
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
