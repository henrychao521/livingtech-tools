// 烙鐵頭外形（本站繪製）：依白光 HAKKO T18 系列型錄的型號命名與外形比例，畫「正面看寬面」與「側面看厚度」兩個視圖。
// 座標單位 mm：x 為沿烙鐵頭軸向（0 = 錐面起點，往右到端點），y 為離軸心距離；套筒外徑約 6.5 mm。
// 每種外形用輪廓點描述（上緣 top、下緣 bottom，皆由左到右），tinned＝上錫工作面起點（x）。
(function (root) {
  const R = 3.25; // 套筒半徑
  const TIPS = {
    // B 型：圓錐，端點圓角 R0.5
    conical: { code: 'B', views: [
      { name: '側視', top: [[0, R], [4, R], [17.5, 0.5], [18, 0]], bottom: [[0, -R], [4, -R], [17.5, -0.5], [18, 0]], tinned: 15 },
      { name: '端視', round: 0.5 } ] },
    // I 型：細長針尖 R0.2
    micro: { code: 'I', views: [
      { name: '側視', top: [[0, R], [3, R], [10, 1.1], [21.8, 0.2], [22, 0]], bottom: [[0, -R], [3, -R], [10, -1.1], [21.8, -0.2], [22, 0]], tinned: 18 },
      { name: '端視', round: 0.2 } ] },
    // D 型：一字（扁平），寬面看寬 2.4 mm、側面看厚 0.8 mm，端面平
    chisel: { code: 'D', views: [
      { name: '正視（寬面）', top: [[0, R], [4, R], [15, 1.2], [18, 1.2]], bottom: [[0, -R], [4, -R], [15, -1.2], [18, -1.2]], tinned: 14.5 },
      { name: '側視（厚度）', top: [[0, R], [4, R], [16, 0.6], [18, 0.4]], bottom: [[0, -R], [4, -R], [16, -0.6], [18, -0.4]], tinned: 14.5 } ] },
    // C 型：斜切（馬蹄形），圓柱 ⌀2 mm 末端斜切 45°，斜面朝上是工作面；從上方看，斜面的正投影是 ⌀2 的圓（與圓柱兩側輪廓相切），外輪廓末端是半圓
    bevel: { code: 'C', views: [
      { name: '側視（斜面朝上）', top: [[0, R], [4, R], [11, 1], [17, 1]], bottom: [[0, -R], [4, -R], [11, -1], [19, -1]], tinned: 16, bevel: [[17, 1], [19, -1]] },
      { name: '俯視（從上看斜面）', top: [[0, R], [4, R], [11, 1], [18, 1], [18.5, 0.87], [18.87, 0.5], [19.0, 0.0]], bottom: [[0, -R], [4, -R], [11, -1], [18, -1], [18.5, -0.87], [18.87, -0.5], [19.0, -0.0]], tinned: 16, ellipse: [18, 0, 1, 1] } ] },
    // K 型：刀型，寬面像小刀（刃在下緣、端部 45° 斜切），側面看是薄刃
    knife: { code: 'K', views: [
      { name: '正視（寬面）', top: [[0, R], [4, R], [10, 2.2], [17, 2.2], [19, 0.2]], bottom: [[0, -R], [4, -R], [10, -2.6], [19, -2.6], [19, 0.2]], tinned: 13, edge: [[13, -2.6], [19, -2.6]] },
      { name: '側視（刃厚）', top: [[0, R], [4, R], [10, 0.9], [19, 0.9]], bottom: [[0, -R], [4, -R], [10, -0.9], [16, -0.9], [19, 0.1]], tinned: 13 } ] },
  };

  // 單一視圖 → SVG 片段。ox, oy：軸線左端位置（px）；s：每 mm 幾 px
  function viewSvg(v, ox, oy, s, uid) {
    const X = x => (ox + x * s).toFixed(1), Y = y => (oy - y * s).toFixed(1);
    const shank = `<rect x="${(ox - 5 * s).toFixed(1)}" y="${Y(R)}" width="${(5 * s).toFixed(1)}" height="${(2 * R * s).toFixed(1)}" fill="url(#tsShank)"/>`;
    if (v.round != null) {
      // 端視：從尖端方向看，同心圓（套筒外徑＋尖端圓角）
      return `<circle cx="${X(4)}" cy="${oy}" r="${(R * s).toFixed(1)}" fill="url(#tsEnd)" stroke="#52525b" stroke-width=".8"/>` +
        `<circle cx="${X(4)}" cy="${oy}" r="${(R * s * 0.55).toFixed(1)}" fill="none" stroke="#71717a" stroke-width=".6"/>` +
        `<circle cx="${X(4)}" cy="${oy}" r="${Math.max(1.5, v.round * s).toFixed(1)}" fill="#e2e8f0" stroke="#64748b" stroke-width=".6"/>`;
    }
    const pts = v.top.concat(v.bottom.slice().reverse());
    const d = 'M' + pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' L') + ' Z';
    const clip = `tsClip${uid}`;
    let out = shank +
      `<clipPath id="${clip}"><path d="${d}"/></clipPath>` +
      `<path d="${d}" fill="url(#tsIron)" stroke="#3f3f46" stroke-width=".8"/>` +
      `<rect clip-path="url(#${clip})" x="${X(v.tinned)}" y="${Y(R + 1)}" width="${(10 * s).toFixed(1)}" height="${(2 * (R + 1) * s).toFixed(1)}" fill="url(#tsTin)"/>` +
      `<path d="${d}" fill="none" stroke="#3f3f46" stroke-width=".8"/>`;
    if (v.bevel) out += `<line x1="${X(v.bevel[0][0])}" y1="${Y(v.bevel[0][1])}" x2="${X(v.bevel[1][0])}" y2="${Y(v.bevel[1][1])}" stroke="#f8fafc" stroke-width="2.2"/>`;
    if (v.ellipse) out += `<ellipse cx="${X(v.ellipse[0])}" cy="${Y(v.ellipse[1])}" rx="${(v.ellipse[2] * s).toFixed(1)}" ry="${(v.ellipse[3] * s).toFixed(1)}" fill="#ffffff" stroke="#475569" stroke-width="1"/>`;
    if (v.edge) out += `<line x1="${X(v.edge[0][0])}" y1="${Y(v.edge[0][1])}" x2="${X(v.edge[1][0])}" y2="${Y(v.edge[1][1])}" stroke="#f8fafc" stroke-width="1.6"/>`;
    return out;
  }
  const DEFS = `<defs>
    <linearGradient id="tsShank" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4f4f5"/><stop offset=".35" stop-color="#d4d4d8"/><stop offset=".7" stop-color="#a1a1aa"/><stop offset="1" stop-color="#71717a"/></linearGradient>
    <linearGradient id="tsIron" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a1a1aa"/><stop offset=".4" stop-color="#71717a"/><stop offset="1" stop-color="#3f3f46"/></linearGradient>
    <linearGradient id="tsTin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
    <radialGradient id="tsEnd"><stop offset="0" stop-color="#d4d4d8"/><stop offset="1" stop-color="#71717a"/></radialGradient>
  </defs>`;
  // 一種烙鐵頭的完整圖：兩個視圖上下排列＋5 mm 比例尺。viewBox 0 0 240 150
  function tipSvg(id) {
    const t = TIPS[id]; if (!t) return '';
    const s = 7.2, F = 'font-family="Noto Sans TC,sans-serif"';
    let body = DEFS;
    // 視圖名稱放在圖的上方（不壓在金屬套筒上）
    t.views.forEach((v, i) => {
      const oy = 44 + i * 64;
      body += `<text x="8" y="${oy - R * s - 5}" font-size="11" fill="#e2e8f0" font-weight="700" ${F}>${v.name}</text>`;
      body += viewSvg(v, 46, oy, s, id + i);
    });
    body += `<line x1="178" y1="146" x2="${178 + 5 * s}" y2="146" stroke="#e2e8f0" stroke-width="1.5"/><text x="${178 + 5 * s - 18}" y="141" font-size="9" fill="#e2e8f0" ${F}>5 mm</text>`;
    body += `<text x="8" y="147" font-size="9.5" fill="#cbd5e1" ${F}>亮銀色＝上錫工作面</text>`;
    return `<svg viewBox="0 0 240 152" role="img" aria-label="${t.code} 型烙鐵頭外形">${body}</svg>`;
  }
  const api = { TIPS, tipSvg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SolderTips = api;
})(typeof window !== 'undefined' ? window : this);
