// 焊接平台 模組 3：八個步驟的示意動畫（本站繪製）
// 步驟 4–8 用「通孔焊點側視剖面」：電路板翻面、元件在下面、元件腳穿過鍍通孔凸出焊接面；
// 烙鐵頭從左上同時碰焊墊與元件腳，焊錫絲從右上（烙鐵的對側）送到焊墊／元件腳上，不碰烙鐵頭；
// 焊錫沿腳形成凹面（火山形）焊點；先移開焊錫、再移開烙鐵。
// 依據：Kester 44 Flux-Cored Wire 技術資料（先加熱焊墊與元件腳、錫絲送到焊墊或元件腳而不是烙鐵頭；
// 烙鐵頭溫度含鉛常用 315–343°C、無鉛 371–400°C）、HAKKO 點焊說明（烙鐵頭同時接觸焊墊與通孔、送錫形成平滑焊角）。
// 動畫快慢只是示意，不代表實際秒數。
(function () {
  const F = 'font-family="Noto Sans TC,sans-serif"';
  const DEFS = `<defs>
    <linearGradient id="m3Tip" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e5e7eb"/><stop offset=".45" stop-color="#9ca3af"/><stop offset="1" stop-color="#4b5563"/></linearGradient>
    <linearGradient id="m3Shaft" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset=".5" stop-color="#a1a1aa"/><stop offset="1" stop-color="#52525b"/></linearGradient>
    <linearGradient id="m3Cu" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6b26b"/><stop offset="1" stop-color="#b45309"/></linearGradient>
    <linearGradient id="m3Sn" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".55" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
    <linearGradient id="m3Lead" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset=".5" stop-color="#f1f5f9"/><stop offset="1" stop-color="#9ca3af"/></linearGradient>
    <radialGradient id="m3Heat"><stop offset="0" stop-color="rgba(255,120,0,.55)"/><stop offset="1" stop-color="rgba(255,120,0,0)"/></radialGradient>
  </defs>`;
  const svg = (body, label) => `<svg viewBox="0 0 400 240" role="img" aria-label="${label}" style="width:100%;max-width:400px;height:100%">${DEFS}${body}</svg>`;
  // 小標籤：文字＋引線
  const tag = (x, y, tx, ty, t, anchor = 'start') =>
    `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty + (ty < y ? 3 : -11)}" stroke="#475569" stroke-width="1"/>` +
    `<text x="${tx}" y="${ty}" font-size="12" fill="#1f2937" text-anchor="${anchor}" ${F}>${t}</text>`;

  // ── 剖面基本場景：電路板（翻面，焊接面朝上）、鍍通孔、上下焊墊、元件與元件腳 ──
  // 焊墊上緣 y=146；元件腳 x 197–203；通孔 x 193–207
  function board(leadAnim = '') {
    return `
      <rect x="30" y="150" width="340" height="20" fill="#c8b98a"/>
      <rect x="30" y="147" width="150" height="3" fill="#15803d"/><rect x="220" y="147" width="150" height="3" fill="#15803d"/>
      <rect x="30" y="170" width="150" height="3" fill="#15803d"/><rect x="220" y="170" width="150" height="3" fill="#15803d"/>
      <rect x="180" y="146" width="13" height="4" fill="url(#m3Cu)"/><rect x="207" y="146" width="13" height="4" fill="url(#m3Cu)"/>
      <rect x="180" y="170" width="13" height="4" fill="url(#m3Cu)"/><rect x="207" y="170" width="13" height="4" fill="url(#m3Cu)"/>
      <rect x="191" y="146" width="2" height="28" fill="#b45309"/><rect x="207" y="146" width="2" height="28" fill="#b45309"/>
      <rect x="193" y="150" width="14" height="20" fill="#f8fafc" opacity=".55"/>
      <g>${leadAnim}
        <rect x="197" y="124" width="6" height="66" fill="url(#m3Lead)"/>
        <rect x="168" y="186" width="64" height="34" rx="6" fill="#1e3a8a"/>
        <rect x="168" y="186" width="64" height="7" rx="3" fill="#334155"/>
        <rect x="222" y="190" width="6" height="26" fill="#cbd5e1" opacity=".6"/>
      </g>`;
  }
  // 烙鐵（從左上 45° 伸入）：tx,ty＝烙鐵頭端點；扁平端面同時碰焊墊上緣與元件腳左側
  function iron(tx = 192.6, ty = 141.6, extra = '') {
    return `<g transform="translate(${tx},${ty}) rotate(45)">${extra}
      <polygon points="3,-3.2 3,3.2 -30,8.5 -30,-8.5" fill="url(#m3Tip)" stroke="#374151" stroke-width=".6"/>
      <rect x="-95" y="-8.5" width="65" height="17" fill="url(#m3Shaft)" stroke="#52525b" stroke-width=".6"/>
      <rect x="-145" y="-14" width="50" height="28" rx="8" fill="#1d4ed8"/>
    </g>`;
  }
  // 焊錫絲（從右上 45° 伸入）：wx,wy＝錫絲末端
  function wire(wx, wy) {
    return `<g transform="translate(${wx},${wy}) rotate(135)">
      <rect x="-160" y="-2.6" width="160" height="5.2" rx="2.6" fill="#9ca3af"/>
      <rect x="-160" y="-1.6" width="160" height="1.2" fill="#f1f5f9"/>
    </g>`;
  }
  // 凹面焊角：h＝沿腳爬升高度、w＝在焊墊上展開寬度（0–1）
  function fillet(w, h) {
    const l = 197 - 17 * w, r = 203 + 17 * w, top = 146 - h;
    return `M${l.toFixed(1)},146 Q197,146 197,${top.toFixed(1)} L203,${top.toFixed(1)} Q203,146 ${r.toFixed(1)},146 Z`;
  }
  const FULL = fillet(1, 13), SMALL = fillet(0.1, 1);
  const holeFill = (op = 1) => `<g opacity="${op}"><rect x="193" y="146" width="4" height="28" fill="url(#m3Sn)"/><rect x="203" y="146" width="4" height="28" fill="url(#m3Sn)"/></g>`;
  // 四步驟進度條
  function seq(active) {
    const names = ['① 加熱焊墊與腳', '② 對側送錫', '③ 先移開焊錫', '④ 再移開烙鐵'];
    return names.map((n, i) => `<g transform="translate(${8 + i * 97},6)"><rect width="92" height="20" rx="10" fill="${i === active ? '#dc2626' : '#e2e8f0'}"/>` +
      `<text x="46" y="14" font-size="11" text-anchor="middle" fill="${i === active ? '#fff' : '#64748b'}" font-weight="700" ${F}>${n}</text></g>`).join('');
  }
  const heatGlow = `<circle cx="200" cy="146" r="26" fill="url(#m3Heat)"><animate attributeName="r" values="18;30;18" dur="1.6s" repeatCount="indefinite"/></circle>`;

  const A = {};
  // 1. 開機加熱：控溫焊台
  A.heat = svg(`
    <rect x="70" y="70" width="170" height="120" rx="10" fill="#334155"/>
    <rect x="70" y="70" width="170" height="16" rx="8" fill="#475569"/>
    <rect x="88" y="98" width="110" height="46" rx="4" fill="#0b1f0b"/>
    <text x="143" y="131" text-anchor="middle" fill="#4ade80" font-size="28" font-family="monospace" font-weight="700">330</text>
    <text x="190" y="112" fill="#4ade80" font-size="11" font-family="monospace">°C</text>
    <circle cx="222" cy="112" r="6" fill="#f59e0b"><animate attributeName="opacity" values="1;.2;1" dur="0.8s" repeatCount="indefinite"/></circle>
    <text x="222" y="134" text-anchor="middle" fill="#e2e8f0" font-size="10" ${F}>加熱中</text>
    <rect x="96" y="156" width="26" height="18" rx="4" fill="#64748b"/><text x="109" y="169" text-anchor="middle" fill="#fff" font-size="12">▲</text>
    <rect x="130" y="156" width="26" height="18" rx="4" fill="#64748b"/><text x="143" y="169" text-anchor="middle" fill="#fff" font-size="12">▼</text>
    <rect x="198" y="156" width="30" height="18" rx="4" fill="#16a34a"/><text x="213" y="169" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">ON</text>
    <path d="M240 150 C 290 150, 330 80, 378 87" stroke="#111827" stroke-width="5" fill="none"/>
    <rect x="270" y="192" width="80" height="16" rx="4" fill="#27272a"/><rect x="260" y="204" width="100" height="8" rx="2" fill="#18181b"/>
    <ellipse cx="300.0" cy="190.0" rx="11" ry="4" transform="rotate(38 300.0 190.0)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="305.5" cy="182.8" rx="11" ry="4" transform="rotate(38 305.5 182.8)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="311.0" cy="175.6" rx="11" ry="4" transform="rotate(38 311.0 175.6)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="316.5" cy="168.4" rx="11" ry="4" transform="rotate(38 316.5 168.4)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="322.0" cy="161.2" rx="11" ry="4" transform="rotate(38 322.0 161.2)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="327.5" cy="154.0" rx="11" ry="4" transform="rotate(38 327.5 154.0)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="333.0" cy="146.8" rx="11" ry="4" transform="rotate(38 333.0 146.8)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="338.5" cy="139.6" rx="11" ry="4" transform="rotate(38 338.5 139.6)" fill="none" stroke="#9ca3af" stroke-width="2"/><ellipse cx="344.0" cy="132.4" rx="11" ry="4" transform="rotate(38 344.0 132.4)" fill="none" stroke="#9ca3af" stroke-width="2"/>
    <g transform="translate(348,126) rotate(-52)"><rect x="0" y="-11" width="50" height="22" rx="8" fill="#1d4ed8"/><rect x="-14" y="-6" width="14" height="12" fill="url(#m3Shaft)"/></g>
    <text x="310" y="232" text-anchor="middle" font-size="11" fill="#334155" ${F}>烙鐵頭朝下插在烙鐵架</text>
    <text x="150" y="214" text-anchor="middle" font-size="12" fill="#334155" ${F}>設定溫度，等指示燈由閃爍轉為恆亮</text>
    <text x="155" y="60" text-anchor="middle" font-size="12" fill="#334155" ${F}>含鉛錫常用 315–343°C、無鉛錫 371–400°C（Kester）</text>`, '控溫焊台加熱中，顯示設定溫度');

  // 2. 海綿沾水擰乾：烙鐵架上的清潔海綿
  A.sponge = svg(`
    <rect x="60" y="170" width="280" height="30" rx="6" fill="#374151"/>
    <rect x="80" y="150" width="240" height="24" rx="4" fill="#4b5563"/>
    <rect x="92" y="122" width="216" height="32" rx="5" fill="#eab308"/>
    <g fill="#ca8a04" opacity=".7">${Array.from({ length: 36 }, (_, i) => `<circle cx="${100 + (i % 12) * 18 + (i > 11 && i < 24 ? 9 : 0)}" cy="${130 + Math.floor(i / 12) * 9}" r="2"/>`).join('')}</g>
    <rect x="190" y="124" width="20" height="28" rx="3" fill="#a16207"/>
    <ellipse cx="200" cy="96" rx="5" ry="7" fill="#3b82f6"><animate attributeName="cy" values="70;118;118" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="2.2s" repeatCount="indefinite"/></ellipse>
    <text x="200" y="48" text-anchor="middle" font-size="13" fill="#1f2937" ${F}>海綿先沾水、擰到不滴水再放回烙鐵架</text>
    <text x="200" y="222" text-anchor="middle" font-size="12" fill="#475569" ${F}>HAKKO 說明書：使用前海綿要先用水沾濕，以免損傷烙鐵頭</text>`, '烙鐵架上的清潔海綿沾濕');

  // 3. 上錫：扁平（一字）烙鐵頭側視，錫絲碰烙鐵頭端面，表面包一層亮銀色錫
  A.tinning = svg(`
    <g transform="translate(70,120)">
      <rect x="-60" y="-16" width="70" height="32" rx="8" fill="#1d4ed8"/>
      <rect x="10" y="-9" width="120" height="18" fill="url(#m3Shaft)"/>
      <polygon points="130,-9 130,9 190,3 190,-3" fill="#4b5563"/>
      <polygon points="150,-7 150,7 190,3 190,-3" fill="url(#m3Sn)" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.35;.7;1" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <ellipse cx="190" cy="0" rx="4" ry="4.5" fill="#e2e8f0" opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.35;.6;1" dur="3s" repeatCount="indefinite"/></ellipse>
    </g>
    <g><animateTransform attributeName="transform" type="translate" values="40,-40;0,0;0,0;40,-40" keyTimes="0;.3;.7;1" dur="3s" repeatCount="indefinite"/>${wire(262, 112)}</g>
    <text x="150" y="168" text-anchor="middle" font-size="12" fill="#334155" ${F}>烙鐵頭（一字／扁平）</text>
    <text x="336" y="128" text-anchor="middle" font-size="12" fill="#334155" ${F}>焊錫絲</text>
    <text x="200" y="215" text-anchor="middle" font-size="12" fill="#334155" ${F}>上錫後烙鐵頭前端應呈亮銀色</text>`, '扁平烙鐵頭上錫');

  // 4. 對齊接點：電路板翻面，元件腳從下方穿過鍍通孔
  A.align = svg(`
    ${board('<animateTransform attributeName="transform" type="translate" values="0,46;0,0;0,0" keyTimes="0;.5;1" dur="3s" repeatCount="indefinite"/>')}
    ${tag(203, 132, 270, 104, '元件腳凸出焊接面')}
    ${tag(185, 148, 92, 120, '焊墊（銅）', 'start')}
    ${tag(208, 160, 270, 140, '鍍通孔')}
    ${tag(60, 170, 24, 236, '電路板（翻面，焊接面朝上）')}
    ${tag(232, 200, 300, 222, '元件在另一面')}`, '元件腳穿過鍍通孔');

  // 5. 加熱接點：烙鐵頭同時碰焊墊與元件腳
  A['heat-pad'] = svg(`${board()}${heatGlow}
    <g><animateTransform attributeName="transform" type="translate" values="-50,-50;0,0;0,0" keyTimes="0;.25;1" dur="3s" repeatCount="indefinite"/>${iron()}</g>
    ${tag(203, 128, 262, 90, '元件腳')}
    ${tag(214, 148, 262, 128, '焊墊')}
    ${tag(130, 80, 40, 60, '烙鐵頭', 'start')}
    <text x="200" y="232" text-anchor="middle" font-size="12" fill="#334155" ${F}>烙鐵頭同時接觸焊墊與元件腳，兩者一起加熱</text>
    ${seq(0)}`, '烙鐵頭同時加熱焊墊與元件腳');

  // 6. 送焊錫：錫絲從對側碰焊墊／元件腳，焊錫熔化沿腳爬升成凹面
  A['feed-solder'] = svg(`${board()}${heatGlow}
    ${holeFill(0)}<g><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.3;.7;1" dur="3.2s" repeatCount="indefinite"/>${holeFill()}</g>
    <path d="${SMALL}" fill="url(#m3Sn)"><animate attributeName="d" values="${SMALL};${SMALL};${FULL};${FULL}" keyTimes="0;.25;.8;1" dur="3.2s" repeatCount="indefinite"/></path>
    ${iron()}
    <g><animateTransform attributeName="transform" type="translate" values="30,-30;0,0;-2,2;-2,2" keyTimes="0;.25;.8;1" dur="3.2s" repeatCount="indefinite"/>${wire(204.8, 144.2)}</g>
    ${tag(262, 92, 392, 64, '焊錫絲（從對側送）', 'end')}
    ${tag(130, 80, 40, 60, '烙鐵頭', 'start')}
    <text x="200" y="232" text-anchor="middle" font-size="12" fill="#334155" ${F}>錫絲碰焊墊與元件腳，不是碰烙鐵頭</text>
    ${seq(1)}`, '焊錫絲從烙鐵對側送到焊墊與元件腳上');

  // 7. 抽錫絲：焊錫量夠了，先移開焊錫絲，烙鐵仍停留
  A['remove-solder'] = svg(`${board()}${heatGlow}${holeFill()}
    <path d="${FULL}" fill="url(#m3Sn)"/>
    ${iron()}
    <g><animateTransform attributeName="transform" type="translate" values="0,0;50,-50;50,-50" keyTimes="0;.4;1" dur="3s" repeatCount="indefinite"/>${wire(204.8, 144.2)}</g>
    ${tag(197, 138, 92, 120, '凹面焊角', 'start')}
    <text x="200" y="232" text-anchor="middle" font-size="12" fill="#334155" ${F}>先移開焊錫絲，烙鐵頭還在讓焊錫流平</text>
    ${seq(2)}`, '先移開焊錫絲，烙鐵仍停留');

  // 8. 移開烙鐵：烙鐵最後離開，留下光亮的凹面（火山形）焊點
  A['remove-iron'] = svg(`${board()}${holeFill()}
    <path d="${FULL}" fill="url(#m3Sn)"/>
    <path d="M186,144 Q195,143 196,136" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>
    <g><animateTransform attributeName="transform" type="translate" values="0,0;0,0;-40,-40;-40,-40" keyTimes="0;.2;.5;1" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.25;.55;1" dur="3s" repeatCount="indefinite"/>${iron()}</g>
    ${tag(212, 140, 262, 112, '光亮、凹面（火山形）')}
    ${tag(218, 147, 262, 132, '焊錫覆蓋整個焊墊')}
    <text x="200" y="232" text-anchor="middle" font-size="12" fill="#334155" ${F}>最後移開烙鐵；焊錫凝固前不要碰元件</text>
    ${seq(3)}`, '最後移開烙鐵，留下凹面焊點');

  window.SOLDER_M3_ANIMS = A;
  window.SOLDER_M3_GEOM = { fillet, FULL, SMALL };
})();
