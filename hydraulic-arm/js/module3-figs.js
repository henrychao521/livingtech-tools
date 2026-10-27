// 液壓手臂 模組 3：8 個製作步驟的說明圖（程式繪製 SVG；初稿由 Antigravity gemini-4-argon-high 依規格產生，Gemini Flash 看圖審稿後由 Claude 修正圖 3、4、6、7、8）
(function () {
  const FONT = "Noto Sans TC, PingFang TC, sans-serif";
  const DARK = "#334155";
  const TEXT = "#0f172a";
  const CARD = "#e8d5b5";
  const SYR = "#e0f2fe";
  const WATER = "#60a5fa";
  const RED_W = "#f87171";
  const METAL = "#cbd5e1";
  const ACCENT = "#0284c7";
  const OK = "#16a34a";
  const NG = "#dc2626";

  function badge(step) {
    return (
      `<circle cx="336" cy="22" r="13" fill="${ACCENT}"/>` +
      `<text x="336" y="27" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="bold" fill="#ffffff">${step}</text>`
    );
  }

  function leader(px, py, ex, ey, tx, ty, label, anchor = "middle", color = TEXT) {
    return (
      `<circle cx="${px}" cy="${py}" r="1.8" fill="${DARK}"/>` +
      `<line x1="${px}" y1="${py}" x2="${ex}" y2="${ey}" stroke="${DARK}" stroke-width="0.8"/>` +
      `<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="${FONT}" font-size="12" fill="${color}">${label}</text>`
    );
  }

  function syringeH(x, y, fillW = 0, waterColor = RED_W, plungerOut = 18) {
    const bw = 44;
    const bh = 12;
    const my = y + bh / 2;
    const px = x + 6 + fillW;
    const endX = px + plungerOut;
    return (
      `<rect x="${x}" y="${my - 2}" width="6" height="4" fill="${SYR}" stroke="${DARK}" stroke-width="1.2"/>` +
      `<rect x="${x + 6}" y="${y}" width="${bw}" height="${bh}" rx="1.5" fill="${SYR}" stroke="${DARK}" stroke-width="1.6"/>` +
      (fillW > 0
        ? `<rect x="${x + 7}" y="${y + 1.5}" width="${fillW}" height="${bh - 3}" fill="${waterColor}"/>`
        : "") +
      `<rect x="${px}" y="${y + 1.5}" width="3" height="${bh - 3}" fill="${DARK}"/>` +
      `<line x1="${px + 3}" y1="${my}" x2="${endX}" y2="${my}" stroke="${METAL}" stroke-width="3"/>` +
      `<line x1="${px + 3}" y1="${my}" x2="${endX}" y2="${my}" stroke="${DARK}" stroke-width="1"/>` +
      `<rect x="${endX}" y="${y + 1}" width="3.5" height="${bh - 2}" rx="1" fill="${METAL}" stroke="${DARK}" stroke-width="1.2"/>` +
      `<line x1="${x + 16}" y1="${y}" x2="${x + 16}" y2="${y + 4}" stroke="${DARK}" stroke-width="1"/>` +
      `<line x1="${x + 26}" y1="${y}" x2="${x + 26}" y2="${y + 4}" stroke="${DARK}" stroke-width="1"/>` +
      `<line x1="${x + 36}" y1="${y}" x2="${x + 36}" y2="${y + 4}" stroke="${DARK}" stroke-width="1"/>`
    );
  }

  window.HA_M3_FIGS = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟一：液壓手臂材料準備俯視平鋪圖">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="24" y="26" width="116" height="66" rx="2" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="24" y="92" width="116" height="8" fill="${CARD}" stroke="${DARK}" stroke-width="1.2"/>
      <path d="M 26 96 Q 30 92 34 96 T 42 96 T 50 96 T 58 96 T 66 96 T 74 96 T 82 96 T 90 96 T 98 96 T 106 96 T 114 96 T 122 96 T 130 96 T 138 96" fill="none" stroke="${DARK}" stroke-width="1"/>
      <rect x="158" y="28" width="142" height="36" rx="3" fill="none" stroke="${METAL}" stroke-width="1" stroke-dasharray="3,3"/>
      ${syringeH(164, 31, 0, RED_W, 24)}
      ${syringeH(164, 48, 0, RED_W, 24)}
      <rect x="158" y="68" width="142" height="36" rx="3" fill="none" stroke="${METAL}" stroke-width="1" stroke-dasharray="3,3"/>
      ${syringeH(164, 71, 0, RED_W, 24)}
      ${syringeH(164, 88, 0, RED_W, 24)}
      <ellipse cx="68" cy="158" rx="32" ry="18" fill="none" stroke="${DARK}" stroke-width="5"/>
      <ellipse cx="68" cy="158" rx="32" ry="18" fill="none" stroke="${SYR}" stroke-width="3"/>
      <ellipse cx="68" cy="158" rx="22" ry="12" fill="none" stroke="${DARK}" stroke-width="5"/>
      <ellipse cx="68" cy="158" rx="22" ry="12" fill="none" stroke="${SYR}" stroke-width="3"/>
      <path d="M 36 158 C 26 162, 22 170, 20 176" fill="none" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 36 158 C 26 162, 22 170, 20 176" fill="none" stroke="${SYR}" stroke-width="3" stroke-linecap="round"/>
      <g>
        <circle cx="138" cy="148" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
        <line x1="138" y1="152.5" x2="134" y2="167" stroke="${METAL}" stroke-width="2"/>
        <line x1="138" y1="152.5" x2="142" y2="167" stroke="${METAL}" stroke-width="2"/>
        <circle cx="155" cy="145" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
        <line x1="155" y1="149.5" x2="151" y2="165" stroke="${METAL}" stroke-width="2"/>
        <line x1="155" y1="149.5" x2="159" y2="165" stroke="${METAL}" stroke-width="2"/>
        <circle cx="172" cy="150" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
        <line x1="172" y1="154.5" x2="168" y2="169" stroke="${METAL}" stroke-width="2"/>
        <line x1="172" y1="154.5" x2="176" y2="169" stroke="${METAL}" stroke-width="2"/>
      </g>
      <rect x="196" y="138" width="80" height="14" fill="${METAL}" stroke="${DARK}" stroke-width="1.6"/>
      <path d="M 204 138 V 143 M 212 138 V 143 M 220 138 V 143 M 228 138 V 143 M 236 138 V 143 M 244 138 V 143 M 252 138 V 143 M 260 138 V 143 M 268 138 V 143" stroke="${DARK}" stroke-width="1"/>
      <rect x="198" y="160" width="52" height="12" rx="2" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.6"/>
      <polygon points="250,161 268,161 260,171 250,171" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <polygon points="296,130 336,130 332,178 300,178" fill="${SYR}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="298,144 334,144 331,176 301,176" fill="${RED_W}" stroke="${DARK}" stroke-width="1"/>
      ${leader(78, 100, 78, 113, 78, 125, "瓦楞紙板（波浪芯）", "middle")}
      ${leader(220, 28, 220, 16, 224, 21, "針筒 ×4（兩組）", "start")}
      ${leader(68, 176, 68, 194, 68, 206, "透明軟管", "middle")}
      ${leader(155, 168, 155, 194, 155, 206, "兩腳釘", "middle")}
      ${leader(235, 172, 235, 194, 235, 206, "美工刀、鋼尺", "middle")}
      ${leader(316, 178, 316, 194, 316, 206, "紅色水", "middle")}
      ${badge(1)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟二：在瓦楞紙板上依尺寸排版並沿鋼尺裁切骨架">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="20" y="26" width="286" height="156" rx="2" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="32" y="38" width="82" height="82" fill="none" stroke="${DARK}" stroke-width="1.6" stroke-dasharray="5,3"/>
      <rect x="128" y="38" width="162" height="26" fill="none" stroke="${DARK}" stroke-width="1.6" stroke-dasharray="5,3"/>
      <rect x="128" y="74" width="124" height="26" fill="none" stroke="${DARK}" stroke-width="1.6" stroke-dasharray="5,3"/>
      <rect x="128" y="110" width="54" height="18" fill="none" stroke="${DARK}" stroke-width="1.6" stroke-dasharray="5,3"/>
      <rect x="192" y="110" width="54" height="18" fill="none" stroke="${DARK}" stroke-width="1.6" stroke-dasharray="5,3"/>
      <rect x="122" y="146" width="174" height="16" fill="${METAL}" stroke="${DARK}" stroke-width="1.6"/>
      <path d="M 132 146 V 152 M 144 146 V 152 M 156 146 V 152 M 168 146 V 152 M 180 146 V 152 M 192 146 V 152 M 204 146 V 152 M 216 146 V 152 M 228 146 V 152 M 240 146 V 152 M 252 146 V 152 M 264 146 V 152 M 276 146 V 152 M 288 146 V 152" stroke="${DARK}" stroke-width="1"/>
      <polygon points="205,146 218,137 223,144 210,146" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <polygon points="218,137 264,113 270,123 223,144" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.6"/>
      <line x1="160" y1="142" x2="196" y2="142" stroke="${ACCENT}" stroke-width="1.6"/>
      <polygon points="196,139 202,142 196,145" fill="${ACCENT}"/>
      ${leader(208, 38, 208, 22, 208, 18, "大臂 200×30", "middle")}
      ${leader(244, 87, 226, 87, 136, 91, "小臂 150×30", "start")}
      ${leader(73, 120, 73, 192, 70, 205, "基座 100×100", "middle")}
      ${leader(155, 128, 168, 192, 172, 205, "夾爪 60×20", "middle")}
      ${leader(242, 154, 275, 192, 278, 205, "美工刀沿鋼尺裁切", "middle")}
      ${badge(2)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟三：在大臂紙板兩端畫十字記號並用錐子鑽軸孔">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="26" y="110" width="206" height="44" rx="8" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <line x1="42" y1="132" x2="70" y2="132" stroke="${ACCENT}" stroke-width="1.2"/>
      <line x1="56" y1="118" x2="56" y2="146" stroke="${ACCENT}" stroke-width="1.2"/>
      <circle cx="56" cy="132" r="5" fill="#ffffff" stroke="${DARK}" stroke-width="1.6"/>
      <line x1="190" y1="132" x2="218" y2="132" stroke="${ACCENT}" stroke-width="1.2"/>
      <line x1="204" y1="118" x2="204" y2="146" stroke="${ACCENT}" stroke-width="1.2"/>
      <circle cx="204" cy="132" r="4" fill="#ffffff" stroke="${DARK}" stroke-width="1.6"/>
      <polygon points="204,132 178,86 185,82" fill="${METAL}" stroke="${DARK}" stroke-width="1.6"/>
      <polygon points="175,88 187,80 161,36 147,44" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.8"/>
      <line x1="208" y1="128" x2="258" y2="88" stroke="${ACCENT}" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="208" y1="136" x2="258" y2="132" stroke="${ACCENT}" stroke-width="1" stroke-dasharray="4,3"/>
      <circle cx="294" cy="110" r="40" fill="${CARD}" stroke="${ACCENT}" stroke-width="1.8"/>
      <line x1="264" y1="110" x2="324" y2="110" stroke="${ACCENT}" stroke-width="1"/>
      <line x1="294" y1="80" x2="294" y2="140" stroke="${ACCENT}" stroke-width="1"/>
      <circle cx="294" cy="110" r="14" fill="#ffffff" stroke="${DARK}" stroke-width="1.8"/>
      <line x1="280" y1="110" x2="308" y2="110" stroke="${DARK}" stroke-width="1.4"/>
      <polygon points="280,110 285,107 285,113" fill="${DARK}"/>
      <polygon points="308,110 303,107 303,113" fill="${DARK}"/>
      ${leader(56, 118, 56, 72, 56, 64, "十字記號定位", "middle")}
      ${leader(168, 62, 124, 42, 120, 45, "錐子刺穿引孔", "end")}
      ${leader(294, 150, 294, 168, 292, 180, "孔徑 4 mm", "middle")}
      ${leader(130, 154, 130, 186, 130, 200, "大臂紙板兩端", "middle")}
      ${badge(3)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟四：用兩腳釘穿過兩片紙板軸孔並撐開腳片組裝可轉動關節">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="28" y="88" width="96" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="134" y="88" width="54" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="54" y="104" width="70" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="134" y="104" width="76" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <path d="M 117 88 A 12 9 0 0 1 141 88 Z" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="125" y="88" width="4" height="32" fill="${METAL}" stroke="${DARK}" stroke-width="1.2"/>
      <rect x="129" y="88" width="4" height="32" fill="${METAL}" stroke="${DARK}" stroke-width="1.2"/>
      <rect x="98" y="118" width="28" height="4" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <rect x="132" y="118" width="28" height="4" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <path d="M 118 134 Q 106 134 102 125" fill="none" stroke="${ACCENT}" stroke-width="1.6"/>
      <polygon points="99,127 102,121 105,126" fill="${ACCENT}"/>
      <path d="M 140 134 Q 152 134 156 125" fill="none" stroke="${ACCENT}" stroke-width="1.6"/>
      <polygon points="153,126 156,121 159,127" fill="${ACCENT}"/>
      <rect x="234" y="108" width="96" height="22" rx="6" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="244,116 312,62 324,78 256,132" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <circle cx="252" cy="119" r="5.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.6"/>
      <path d="M 322 76 A 48 48 0 0 1 334 112" fill="none" stroke="${ACCENT}" stroke-width="1.8"/>
      <polygon points="319,79 321,72 326,76" fill="${ACCENT}"/>
      <polygon points="331,110 334,117 337,110" fill="${ACCENT}"/>
      ${leader(134, 82, 150, 62, 152, 60, "兩腳釘穿過", "start")}
      ${leader(64, 88, 55, 68, 55, 60, "兩片紙板疊合", "middle")}
      ${leader(129, 122, 110, 176, 110, 190, "背面腳片撐開壓平", "middle")}
      ${leader(330, 96, 295, 176, 290, 190, "關節可轉動", "middle")}
      ${badge(4)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟五：安裝從動端針筒，筒身固定於底座、推桿接大臂並預留力臂">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="30" y="168" width="230" height="16" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="52" y="74" width="22" height="94" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="56,78 266,30 271,48 61,96" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <circle cx="63" cy="86" r="5.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.8"/>
      <circle cx="146" cy="67" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.6"/>
      <line x1="146" y1="67" x2="170" y2="108" stroke="${METAL}" stroke-width="4"/>
      <line x1="146" y1="67" x2="170" y2="108" stroke="${DARK}" stroke-width="1.2"/>
      <polygon points="164,111 176,104 206,156 194,163" fill="${SYR}" stroke="${DARK}" stroke-width="1.6"/>
      <polygon points="172,122 182,116 204,154 194,160" fill="${RED_W}"/>
      <ellipse cx="200" cy="164" rx="14" ry="5" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <line x1="63" y1="86" x2="56" y2="54" stroke="${ACCENT}" stroke-width="1" stroke-dasharray="3,2"/>
      <line x1="146" y1="67" x2="139" y2="35" stroke="${ACCENT}" stroke-width="1" stroke-dasharray="3,2"/>
      <line x1="58" y1="58" x2="140" y2="39" stroke="${ACCENT}" stroke-width="1.6"/>
      <polygon points="58,58 64,54 65,60" fill="${ACCENT}"/>
      <polygon points="140,39 133,38 135,44" fill="${ACCENT}"/>
      ${leader(63, 86, 38, 118, 38, 132, "肩部關節", "middle")}
      ${leader(99, 48, 100, 26, 100, 20, "力臂 d", "middle", ACCENT)}
      ${leader(146, 67, 232, 67, 236, 70, "推桿接大臂支點", "start")}
      ${leader(200, 162, 242, 138, 246, 142, "熱熔膠筒身固定", "start")}
      ${badge(5)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟六：以大弧度軟管連接主動針筒與從動針筒，避免折死角">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="20" y="140" width="92" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      ${syringeH(28, 122, 24, RED_W, 18)}
      <rect x="216" y="122" width="84" height="12" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="228" y="64" width="16" height="58" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="228,72 308,46 312,58 232,84" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <circle cx="236" cy="76" r="4" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
      
      <path d="M 28 128 C 18 42, 198 42, 240 116" fill="none" stroke="${DARK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M 28 128 C 18 42, 198 42, 240 116" fill="none" stroke="${RED_W}" stroke-width="4" stroke-linecap="round"/>
      <g transform="translate(240 116) rotate(-53.1)">${syringeH(0, -6, 20, RED_W, 40)}</g>
      <circle cx="240" cy="116" r="3" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.2"/>
      <circle cx="282" cy="60" r="3" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.2"/>
      <rect x="210" y="144" width="138" height="66" rx="4" fill="#ffffff" stroke="${DARK}" stroke-width="1.4"/>
      <polyline points="226,200 272,168 318,200" fill="none" stroke="${DARK}" stroke-width="6" stroke-linejoin="miter"/>
      <polyline points="226,200 272,168 318,200" fill="none" stroke="${RED_W}" stroke-width="3" stroke-linejoin="miter"/>
      <line x1="266" y1="163" x2="278" y2="173" stroke="${NG}" stroke-width="1.6"/>
      ${leader(66, 154, 66, 182, 66, 196, "控制台主動針筒", "middle")}
      ${leader(262, 88, 300, 96, 300, 110, "手臂端從動針筒", "middle")}
      ${leader(118, 62, 145, 28, 145, 22, "✓ 軟管保持大弧度", "middle", OK)}
      ${leader(272, 168, 280, 160, 280, 158, "✗ 折死角阻塞", "middle", NG)}
      ${badge(6)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟七：充水排氣三步驟，吸滿水、推至管末冒出水、從動針筒推到底再接回">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="14" y="18" width="98" height="128" rx="4" fill="#ffffff" stroke="${METAL}" stroke-width="1.2"/>
      <polygon points="44,98 82,98 78,138 48,138" fill="${SYR}" stroke="${DARK}" stroke-width="1.6"/>
      <polygon points="46,108 80,108 77,136 49,136" fill="${RED_W}"/>
      <rect x="57" y="56" width="12" height="44" fill="${SYR}" stroke="${DARK}" stroke-width="1.6"/>
      <rect x="58.5" y="70" width="9" height="29" fill="${RED_W}"/>
      <line x1="63" y1="70" x2="63" y2="44" stroke="${METAL}" stroke-width="3"/>
      <rect x="57" y="42" width="12" height="3" fill="${METAL}" stroke="${DARK}" stroke-width="1.2"/>
      <path d="M 80 76 V 54" fill="none" stroke="${ACCENT}" stroke-width="1.6"/>
      <polygon points="77,56 80,50 83,56" fill="${ACCENT}"/>
      <rect x="120" y="18" width="102" height="128" rx="4" fill="#ffffff" stroke="${METAL}" stroke-width="1.2"/>
      ${syringeH(128, 96, 26, RED_W, 14)}
      <path d="M 128 102 C 122 68, 178 64, 198 86" fill="none" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 128 102 C 122 68, 178 64, 198 86" fill="none" stroke="${RED_W}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="203" cy="94" r="3" fill="${RED_W}" stroke="${DARK}" stroke-width="1"/>
      <circle cx="208" cy="103" r="2.5" fill="${RED_W}" stroke="${DARK}" stroke-width="1"/>
      <rect x="230" y="18" width="116" height="128" rx="4" fill="#ffffff" stroke="${METAL}" stroke-width="1.2"/>
      <path d="M 238 112 C 238 82, 256 82, 268 96" fill="none" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 238 112 C 238 82, 256 82, 268 96" fill="none" stroke="${RED_W}" stroke-width="2.6" stroke-linecap="round"/>
      ${syringeH(268, 90, 2, RED_W, 44)}
      <rect x="14" y="154" width="332" height="54" rx="4" fill="#ffffff" stroke="${DARK}" stroke-width="1.4"/>
      ${syringeH(36, 175, 34, RED_W, 14)}
      <circle cx="56" cy="181" r="3.2" fill="#ffffff" stroke="${DARK}" stroke-width="1"/>
      <circle cx="66" cy="180" r="2.6" fill="#ffffff" stroke="${DARK}" stroke-width="1"/>
      <circle cx="74" cy="182" r="3" fill="#ffffff" stroke="${DARK}" stroke-width="1"/>
      ${leader(63, 42, 63, 38, 64, 36, "① 針筒吸滿水", "middle")}
      ${leader(203, 91, 175, 42, 175, 36, "② 管末冒出水", "middle")}
      ${leader(290, 90, 288, 42, 288, 36, "③ 推到底接回", "middle")}
      ${leader(74, 182, 194, 182, 202, 186, "✗ 有空氣會軟", "start", NG)}
      ${badge(7)}
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="步驟八：液壓手臂夾持50g瓶子搬移20cm並檢查是否漏水卡住回彈">
      <rect width="360" height="220" fill="#ffffff"/>
      <rect x="22" y="142" width="88" height="14" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="42" y="78" width="18" height="64" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="48,80 142,40 147,54 53,94" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <polygon points="142,40 222,72 217,86 137,54" fill="${CARD}" stroke="${DARK}" stroke-width="1.8"/>
      <circle cx="51" cy="86" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
      <circle cx="142" cy="48" r="4.5" fill="${ACCENT}" stroke="${DARK}" stroke-width="1.4"/>
      <g transform="translate(78 142) rotate(-70.1)">${syringeH(0, -6, 20, RED_W, 47)}</g>
      <circle cx="78" cy="142" r="2.6" fill="${ACCENT}" stroke="${DARK}" stroke-width="1"/>
      <circle cx="104" cy="70" r="2.6" fill="${ACCENT}" stroke="${DARK}" stroke-width="1"/>
      <g transform="translate(112 54) rotate(5.4)">${syringeH(0, -6, 14, RED_W, 41)}</g>
      <circle cx="112" cy="54" r="2.6" fill="${ACCENT}" stroke="${DARK}" stroke-width="1"/>
      <circle cx="176" cy="60" r="2.6" fill="${ACCENT}" stroke="${DARK}" stroke-width="1"/>
      ${syringeH(132, 146, 30, RED_W, 30)}
      <path d="M 132 152 C 112 166, 88 160, 78 146" fill="none" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M 132 152 C 112 166, 88 160, 78 146" fill="none" stroke="${RED_W}" stroke-width="2" stroke-linecap="round"/>
      ${syringeH(132, 126, 30, RED_W, 30)}
      <path d="M 132 132 C 118 120, 100 84, 112 54" fill="none" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M 132 132 C 118 120, 100 84, 112 54" fill="none" stroke="${RED_W}" stroke-width="2" stroke-linecap="round"/>
      ${leader(196, 142, 206, 142, 210, 146, "主動針筒（每軸一支）", "start")}
      <path d="M 220 74 L 236 68 L 236 76 M 220 84 L 236 92 L 236 84" fill="none" stroke="${DARK}" stroke-width="2"/>
      <rect x="234" y="60" width="14" height="8" fill="${METAL}" stroke="${DARK}" stroke-width="1.4"/>
      <rect x="230" y="68" width="22" height="38" rx="3" fill="${SYR}" stroke="${DARK}" stroke-width="1.8"/>
      <rect x="318" y="68" width="22" height="38" rx="3" fill="none" stroke="${METAL}" stroke-width="1.4" stroke-dasharray="4,3"/>
      <line x1="242" y1="124" x2="328" y2="124" stroke="${ACCENT}" stroke-width="1.8"/>
      <polygon points="242,124 248,120 248,128" fill="${ACCENT}"/>
      <polygon points="328,124 322,120 322,128" fill="${ACCENT}"/>
      <rect x="24" y="172" width="312" height="34" rx="4" fill="${SYR}" stroke="${ACCENT}" stroke-width="1.6"/>
      <rect x="42" y="182" width="14" height="14" rx="2" fill="#ffffff" stroke="${DARK}" stroke-width="1.4"/>
      
      ${leader(142, 48, 142, 26, 142, 22, "完整液壓手臂", "middle")}
      ${leader(241, 60, 243, 42, 243, 38, "瓶子 50 g", "middle")}
      ${leader(285, 124, 288, 148, 288, 160, "搬移 20 cm", "middle", ACCENT)}
      ${leader(56, 189, 106, 189, 114, 195, "漏水？卡住？回彈？", "start")}
      ${badge(8)}
    </svg>`
  ];
})();
