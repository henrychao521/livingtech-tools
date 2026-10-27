// Onshape 模組 3：8 個步驟的示意畫面（程式繪製 SVG，不是截圖；初稿 Antigravity gemini-4-argon-high、修訂 claude-sonnet-5-5-high，Claude 驗收）
(function () {
  const FONT = "Noto Sans TC, PingFang TC, sans-serif";

  function wrapSvg(step, ariaLabel, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="${ariaLabel}">` +
      `<rect width="360" height="220" fill="#ffffff"/>` +
      body +
      `<circle cx="340" cy="18" r="13" fill="#0ea5e9" stroke="#ffffff" stroke-width="1.5"/>` +
      `<text x="340" y="23" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="bold" fill="#ffffff">${step}</text>` +
      `</svg>`;
  }

  function txt(x, y, str, opts = {}) {
    const size = opts.size || 12;
    const fill = opts.fill || "#0f172a";
    const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
    const weight = opts.bold ? ` font-weight="bold"` : "";
    const transform = opts.transform ? ` transform="${opts.transform}"` : "";
    return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}"${anchor}${weight}${transform}>${str}</text>`;
  }

  function callout(bx, by, bw, bh, label, lx1, ly1, lx2, ly2) {
    return `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#334155" stroke-width="0.8"/>` +
      `<circle cx="${lx2}" cy="${ly2}" r="2" fill="#f97316"/>` +
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="#ffffff" stroke="#334155" stroke-width="1"/>` +
      txt(bx + 6, by + 15, label, { size: 12, fill: "#0f172a" });
  }

  function noteLine(tx, ty, label, lx1, ly1, lx2, ly2, anchor) {
    return `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#334155" stroke-width="0.8"/>` +
      `<circle cx="${lx2}" cy="${ly2}" r="1.8" fill="#334155"/>` +
      txt(tx, ty, label, { size: 12, fill: "#0f172a", anchor });
  }

  function baseChrome(features, toolbarItems, highlightBtn, highlightFeat, highlightTab) {
    let s = `<rect x="0" y="0" width="360" height="22" fill="#334155"/>`;
    toolbarItems.forEach((it) => {
      s += `<rect x="${it.x - 4}" y="3" width="${it.w}" height="16" rx="2" fill="#475569"/>`;
      s += txt(it.x, 15, it.label, { size: 11, fill: "#ffffff" });
      if (highlightBtn === it.label) {
        s += `<rect x="${it.x - 6}" y="2" width="${it.w + 4}" height="18" rx="3" fill="none" stroke="#f97316" stroke-width="2"/>`;
      }
    });

    s += `<rect x="0" y="22" width="78" height="174" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>`;
    s += txt(10, 38, "Features", { size: 11, bold: true, fill: "#334155" });
    s += `<line x1="6" y1="43" x2="72" y2="43" stroke="#cbd5e1" stroke-width="1"/>`;

    features.forEach((f, idx) => {
      const fy = 58 + idx * 18;
      if (highlightFeat === f) {
        s += `<rect x="5" y="${fy - 12}" width="68" height="16" rx="2" fill="#ffedd5" stroke="#f97316" stroke-width="2"/>`;
      }
      s += txt(12, fy, f, { size: 11, fill: "#0f172a" });
    });

    s += `<rect x="0" y="196" width="360" height="24" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>`;
    s += `<rect x="82" y="197" width="88" height="22" rx="2" fill="#ffffff" stroke="#334155" stroke-width="1"/>`;
    s += txt(90, 212, "Part Studio 1", { size: 11, bold: true, fill: "#0f172a" });
    if (highlightTab) {
      s += `<rect x="80" y="195" width="92" height="24" rx="3" fill="none" stroke="#f97316" stroke-width="2"/>`;
    }
    return s;
  }

  // 三個基準平面以同一組等角軸繪製：原點 O=(220,115)
  // X 軸＝(+36,+18)、Y 軸＝(-36,+18)、Z 軸＝(0,-36)，每個平面邊長 2.4 單位、以原點為中心
  // Top＝XY 平面（水平）、Front＝XZ 平面、Right＝YZ 平面；三者兩兩相交在通過原點的軸線上
  function isoPlanes(topHighlight) {
    const topFill = topHighlight ? "#fed7aa" : "#e0f2fe";
    const topStroke = topHighlight ? "#f97316" : "#60a5fa";
    const topSW = topHighlight ? "2" : "1";
    return (
      `<polygon points="263,93 263,180 177,137 177,50" fill="#e0f2fe" fill-opacity="0.45" stroke="#60a5fa" stroke-width="1"/>` +
      `<polygon points="177,93 177,180 263,137 263,50" fill="#e0f2fe" fill-opacity="0.45" stroke="#60a5fa" stroke-width="1"/>` +
      `<polygon points="220,72 306,115 220,158 134,115" fill="${topFill}" fill-opacity="0.7" stroke="${topStroke}" stroke-width="${topSW}"/>` +
      `<circle cx="220" cy="115" r="3.5" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>` +
      txt(130, 119, "Top", { size: 11, fill: "#334155", anchor: "end" }) +
      txt(268, 176, "Front", { size: 11, fill: "#334155" }) +
      txt(268, 56, "Right", { size: 11, fill: "#334155" })
    );
  }

  // Step 1: 建立 Document
  const svg1 = wrapSvg(
    1,
    "步驟1：在文件清單頁點選 Create 並建立名為練習01的新文件",
    `<rect x="0" y="0" width="360" height="22" fill="#334155"/>` +
      txt(12, 15, "Documents", { size: 12, bold: true, fill: "#ffffff" }) +
      `<rect x="14" y="28" width="54" height="20" rx="3" fill="#0ea5e9" stroke="#334155" stroke-width="1"/>` +
      txt(23, 42, "Create", { size: 12, bold: true, fill: "#ffffff" }) +
      `<rect x="11" y="25" width="60" height="26" rx="4" fill="none" stroke="#f97316" stroke-width="2"/>` +
      `<rect x="14" y="50" width="78" height="40" rx="2" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>` +
      `<rect x="16" y="52" width="74" height="18" fill="#e0f2fe"/>` +
      txt(20, 65, "Document…", { size: 11, fill: "#0f172a" }) +
      txt(20, 83, "Folder…", { size: 11, fill: "#334155" }) +
      `<rect x="112" y="54" width="176" height="114" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.8"/>` +
      `<rect x="112" y="54" width="176" height="24" rx="4" fill="#f1f5f9" stroke="#334155" stroke-width="1"/>` +
      txt(122, 70, "New document", { size: 12, bold: true, fill: "#0f172a" }) +
      `<rect x="122" y="88" width="154" height="24" rx="2" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.6"/>` +
      txt(130, 104, "練習01", { size: 12, bold: true, fill: "#0f172a" }) +
      `<rect x="186" y="136" width="44" height="22" rx="3" fill="#e2e8f0" stroke="#334155" stroke-width="1"/>` +
      txt(192, 151, "Cancel", { size: 11, fill: "#334155" }) +
      `<rect x="236" y="136" width="40" height="22" rx="3" fill="#0ea5e9" stroke="#334155" stroke-width="1"/>` +
      txt(248, 151, "OK", { size: 12, bold: true, fill: "#ffffff" }) +
      callout(82, 26, 90, 22, "點選建立按鈕", 82, 37, 71, 37) +
      noteLine(14, 112, "選第一項", 70, 100, 84, 66) +
      noteLine(118, 194, "輸入檔案名稱", 155, 181, 165, 112) +
      noteLine(235, 194, "按 OK 完成", 262, 181, 256, 158)
  );

  // Step 2: 進入 Part Studio
  const svg2 = wrapSvg(
    2,
    "步驟2：進入 Part Studio 1 檢視左側特徵清單與三個垂直基準平面",
    baseChrome(
      ["Origin", "Top", "Front", "Right"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 52, label: "Extrude" }
      ],
      null,
      null,
      true
    ) +
      isoPlanes(false) +
      callout(182, 192, 98, 22, "零件設計分頁", 182, 203, 172, 205) +
      noteLine(86, 44, "特徵與基準面清單", 84, 40, 68, 68) +
      noteLine(290, 150, "三個基準面", 300, 140, 282, 120) +
      noteLine(90, 158, "中央為原點", 152, 154, 216, 117)
  );

  // Step 3: 選擇基準平面
  const svg3 = wrapSvg(
    3,
    "步驟3：在特徵清單點選 Top 基準平面使水平基準面亮起橘色",
    baseChrome(
      ["Origin", "Top", "Front", "Right"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 52, label: "Extrude" }
      ],
      null,
      "Top",
      false
    ) +
      isoPlanes(true) +
      callout(86, 62, 82, 22, "選 Top 平面", 86, 73, 73, 73) +
      noteLine(290, 150, "水平面亮橘", 300, 140, 282, 120) +
      noteLine(90, 172, "代表草圖平面", 142, 158, 182, 132)
  );

  // Step 4: 開草圖
  const svg4 = wrapSvg(
    4,
    "步驟4：點選工具列 Sketch 開啟草圖並按 N 轉正視角",
    baseChrome(
      ["Origin", "Top", "Front", "Right", "Sketch 1"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 34, label: "Line" },
        { x: 108, w: 98, label: "Corner rectangle" },
        { x: 214, w: 42, label: "Circle" }
      ],
      "Sketch",
      null,
      false
    ) +
      `<rect x="148" y="64" width="124" height="114" fill="#e0f2fe" fill-opacity="0.45" stroke="#0ea5e9" stroke-width="1.6"/>` +
      txt(154, 78, "Top", { size: 11, bold: true, fill: "#0ea5e9" }) +
      `<line x1="148" y1="121" x2="272" y2="121" stroke="#cbd5e1" stroke-width="1"/>` +
      `<line x1="210" y1="64" x2="210" y2="178" stroke="#cbd5e1" stroke-width="1"/>` +
      `<circle cx="210" cy="121" r="3.5" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>` +
      callout(84, 28, 88, 22, "點選進入草圖", 84, 38, 42, 20) +
      callout(276, 36, 68, 22, "按 N 轉正", 276, 48, 262, 64) +
      noteLine(178, 42, "出現草圖繪圖工具", 174, 38, 155, 20) +
      noteLine(162, 192, "平面轉正對齊視角", 210, 181, 210, 126)
  );

  // Step 5: 畫圖形
  const svg5 = wrapSvg(
    5,
    "步驟5：選取 Corner rectangle 從原點拉出藍色矩形草圖",
    baseChrome(
      ["Origin", "Top", "Front", "Right", "Sketch 1"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 34, label: "Line" },
        { x: 108, w: 98, label: "Corner rectangle" },
        { x: 214, w: 42, label: "Circle" },
        { x: 264, w: 62, label: "Dimension" }
      ],
      "Corner rectangle",
      null,
      false
    ) +
      `<rect x="132" y="54" width="168" height="128" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>` +
      `<rect x="164" y="84" width="88" height="68" fill="#e0f2fe" fill-opacity="0.45" stroke="#2563eb" stroke-width="2"/>` +
      `<circle cx="164" cy="152" r="3.5" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>` +
      `<circle cx="252" cy="84" r="3" fill="#2563eb"/>` +
      `<polygon points="252,84 257,97 261,93 266,99 268,97 263,91 267,89" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>` +
      callout(102, 27, 96, 22, "選對角矩形工具", 148, 27, 148, 20) +
      callout(232, 160, 114, 22, "藍色＝還沒定義完", 248, 160, 232, 152) +
      noteLine(86, 174, "第一點鎖在原點", 136, 162, 161, 153) +
      noteLine(238, 44, "游標拉到對角點", 268, 48, 254, 82)
  );

  // Step 6: 加限制條件＋標尺寸
  const svg6 = wrapSvg(
    6,
    "步驟6：使用 Dimension 標註長寬 50 使矩形變成全黑完全定義",
    baseChrome(
      ["Origin", "Top", "Front", "Right", "Sketch 1"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 34, label: "Line" },
        { x: 108, w: 98, label: "Corner rectangle" },
        { x: 214, w: 42, label: "Circle" },
        { x: 264, w: 62, label: "Dimension" }
      ],
      "Dimension",
      null,
      false
    ) +
      `<rect x="168" y="88" width="76" height="72" fill="#cbd5e1" fill-opacity="0.35" stroke="#0f172a" stroke-width="2"/>` +
      `<circle cx="168" cy="160" r="3.5" fill="#0f172a"/>` +
      `<line x1="168" y1="85" x2="168" y2="64" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="244" y1="85" x2="244" y2="64" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="168" y1="70" x2="244" y2="70" stroke="#334155" stroke-width="1"/>` +
      `<polygon points="168,70 175,67 175,73" fill="#334155"/>` +
      `<polygon points="244,70 237,67 237,73" fill="#334155"/>` +
      txt(206, 66, "50", { size: 12, bold: true, anchor: "middle", fill: "#0f172a" }) +
      `<line x1="165" y1="88" x2="144" y2="88" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="165" y1="160" x2="144" y2="160" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="150" y1="88" x2="150" y2="160" stroke="#334155" stroke-width="1"/>` +
      `<polygon points="150,88 147,95 153,95" fill="#334155"/>` +
      `<polygon points="150,160 147,153 153,153" fill="#334155"/>` +
      txt(144, 124, "50", { size: 12, bold: true, anchor: "middle", fill: "#0f172a", transform: "rotate(-90 144 124)" }) +
      callout(218, 27, 98, 22, "點選尺寸工具", 282, 27, 290, 20) +
      callout(244, 162, 102, 22, "全黑＝完全定義", 244, 172, 236, 160) +
      noteLine(86, 66, "標註長寬", 138, 63, 166, 70)
  );

  // Step 7: 退出草圖
  const svg7 = wrapSvg(
    7,
    "步驟7：點選繪圖區右上角綠色勾勾結束草圖並在清單產生 Sketch 1",
    baseChrome(
      ["Origin", "Top", "Front", "Right", "Sketch 1"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 52, label: "Extrude" }
      ],
      null,
      null,
      false
    ) +
      `<rect x="164" y="92" width="76" height="72" fill="#cbd5e1" fill-opacity="0.35" stroke="#0f172a" stroke-width="2"/>` +
      `<circle cx="164" cy="164" r="3.5" fill="#0f172a"/>` +
      `<line x1="164" y1="89" x2="164" y2="74" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="240" y1="89" x2="240" y2="74" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="164" y1="82" x2="240" y2="82" stroke="#334155" stroke-width="1"/>` +
      `<polygon points="164,82 171,79 171,85" fill="#334155"/>` +
      `<polygon points="240,82 233,79 233,85" fill="#334155"/>` +
      txt(202, 77, "50", { size: 11, anchor: "middle", fill: "#334155" }) +
      `<line x1="161" y1="92" x2="146" y2="92" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="161" y1="164" x2="146" y2="164" stroke="#334155" stroke-width="0.8"/>` +
      `<line x1="152" y1="92" x2="152" y2="164" stroke="#334155" stroke-width="1"/>` +
      `<polygon points="152,92 149,99 155,99" fill="#334155"/>` +
      `<polygon points="152,164 149,157 155,157" fill="#334155"/>` +
      txt(146, 128, "50", { size: 11, anchor: "middle", fill: "#334155", transform: "rotate(-90 146 128)" }) +
      `<rect x="220" y="28" width="90" height="26" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>` +
      txt(228, 45, "Sketch 1", { size: 11, bold: true, fill: "#0f172a" }) +
      `<circle cx="290" cy="41" r="9" fill="#16a34a"/>` +
      txt(290, 45, "✓", { size: 12, bold: true, anchor: "middle", fill: "#ffffff" }) +
      `<circle cx="290" cy="41" r="12" fill="none" stroke="#f97316" stroke-width="2"/>` +
      callout(248, 62, 92, 22, "按 ✓ 結束草圖", 290, 62, 290, 53) +
      noteLine(86, 112, "清單多一項", 84, 108, 66, 128) +
      noteLine(162, 190, "黑色線條維持定義", 202, 178, 202, 164)
  );

  // Step 8: 套用特徵（Extrude）
  const svg8 = wrapSvg(
    8,
    "步驟8：點選 Extrude 設定 Depth 10 mm 將草圖擠出成立體方塊",
    baseChrome(
      ["Origin", "Top", "Front", "Right", "Sketch 1", "Extrude 1"],
      [
        { x: 12, w: 46, label: "Sketch" },
        { x: 66, w: 52, label: "Extrude" }
      ],
      "Extrude",
      null,
      false
    ) +
      `<rect x="86" y="44" width="112" height="58" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.6"/>` +
      `<rect x="86" y="44" width="112" height="22" rx="4" fill="#f1f5f9" stroke="#334155" stroke-width="1"/>` +
      txt(92, 59, "Extrude", { size: 11, bold: true, fill: "#0f172a" }) +
      `<circle cx="170" cy="55" r="7" fill="#16a34a"/>` +
      txt(170, 59, "✓", { size: 11, bold: true, anchor: "middle", fill: "#ffffff" }) +
      txt(187, 59, "✗", { size: 11, bold: true, anchor: "middle", fill: "#dc2626" }) +
      `<rect x="92" y="72" width="100" height="22" rx="2" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1"/>` +
      txt(98, 87, "Depth 10 mm", { size: 11, bold: true, fill: "#0f172a" }) +
      `<polygon points="210,115 262,90 314,115 262,140" fill="#e0f2fe" stroke="#334155" stroke-width="1.8"/>` +
      `<polygon points="210,115 262,140 262,178 210,153" fill="#93c5fd" stroke="#334155" stroke-width="1.8"/>` +
      `<polygon points="262,140 314,115 314,153 262,178" fill="#60a5fa" stroke="#334155" stroke-width="1.8"/>` +
      `<line x1="262" y1="115" x2="262" y2="68" stroke="#f97316" stroke-width="2"/>` +
      `<polygon points="262,62 257,72 267,72" fill="#f97316"/>` +
      callout(214, 28, 88, 22, "點選擠出工具", 214, 39, 100, 20) +
      noteLine(90, 122, "輸入擠出厚度", 136, 108, 136, 92) +
      noteLine(86, 178, "產生立體特徵項", 84, 174, 66, 148) +
      noteLine(292, 181, "擠出成立體", 300, 167, 290, 152)
  );

  if (typeof window !== "undefined") {
    window.OS_M3_SCREENS = [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8];
  }
})();
