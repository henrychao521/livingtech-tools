// 基本手工具 模組 3：各工具握姿（實拍待補）
// 每張卡先顯示程式繪製的簡化示意（工具外形＋手的位置），標「示意，待換實拍」；
// 實拍照片放到 hand-tools/assets/grip/ 對應檔名後，頁面自動改顯示照片（<img> 載入失敗才退回示意圖）。
// 握姿重點取自本平台模組 1 各工具「訣竅／風險」與模組 3 步驟 4、5（出處編號見頁尾資料來源），不另加未查證的說法。
// 待補素材清單：docs/待補素材清單.md（由 tools/ 產生，與本檔資料同源）
(function (root) {
  const GRIPS = [
    { no: 'H-01', id: 'hammer', tool: '羊角錘', img: 'hammer-grip-side.jpg', video: 'hammer-swing-side.mp4', sec: 6, angle: '側面（與鎚子揮動的平面垂直），鏡頭與工作台同高',
      grip: '握握把末端；輕敲小釘以手腕為主，一般釘釘子由手肘帶動前臂揮動，手腕保持穩定、對準釘頭', other: '扶釘的手遠離釘點，或用尖嘴鉗夾住釘子定位',
      safety: '戴護目鏡（釘子可能彈飛）', cite: '[1][4]' },
    { no: 'H-02', id: 'driver', tool: '螺絲起子', img: 'driver-grip-side.jpg', angle: '側面斜上方 45°，看得到刀頭卡進螺絲頭',
      grip: '握握把中段（控制好），刀頭要穩穩卡進螺絲頭再轉動', other: '扶穩工件，手指不要在刀頭前方',
      safety: '選對刀頭種類與尺寸（PH0–PH3），避免崩牙打滑', cite: '[4][7]' },
    { no: 'H-03', id: 'backsaw', tool: '夾背鋸（日式拉切／西式推切）', img: 'backsaw-grip-side.jpg', video: 'backsaw-stroke-side.mp4', sec: 8, angle: '側面，鏡頭對準鋸條平面；另拍一張俯視看起鋸拇指位置',
      grip: '握把手；長鋸用全臂、短鋸用前臂帶動', other: '起鋸時用拇指側面扶住鋸條，離鋸齒一段距離',
      safety: '工件先用夾具夾緊；依鋸子種類在推或拉時施力', cite: '[3][4]' },
    { no: 'H-04', id: 'hacksaw', tool: '鋼鋸', img: 'hacksaw-grip-side.jpg', video: 'hacksaw-stroke-side.mp4', sec: 8, angle: '側面，工件夾在檯虎鉗上，鏡頭與鋸弓同平面',
      grip: '一手握把手、另一手扶鋸弓前端；推時施力、拉回放鬆', other: '扶鋸弓前端的手在鋸弓上，不碰鋸條',
      safety: '工件夾緊在檯虎鉗；鋸條鋸齒朝前（推切）', cite: '[3][4]' },
    { no: 'H-05', id: 'coping', tool: '線鋸（弓形）', img: 'coping-saw-grip-front.jpg', angle: '正面稍高，看得到鋸條與工件上的線',
      grip: '握把手，鋸條垂直工件上下運動', other: '工件先夾緊（見步驟 3），扶工件的手遠離鋸條',
      safety: '看鋸條齒向判斷推切或拉切（鋸齒朝把手就是拉切）', cite: '[3][4]' },
    { no: 'H-06', id: 'file', tool: '銼刀', img: 'file-grip-side.jpg', video: 'file-stroke-side.mp4', sec: 6, angle: '側面，工件夾在檯虎鉗上',
      grip: '一手握柄、另一手扶壓銼刀前端', other: '工件夾在檯虎鉗上，不用手拿工件',
      safety: '只推著銼（單向），回拉時抬起；銼刀一定要裝柄', cite: '[1][6]' },
    { no: 'H-07', id: 'pliers', tool: '鉗子（尖嘴鉗、斜口鉗）', img: 'pliers-grip-top.jpg', angle: '俯視，手與鉗子都入鏡',
      grip: '握把手中段（控制好）', other: '剪線時側著剪（碎片不朝人）',
      safety: '剪線時側著剪、戴護目鏡；斜口鉗不剪硬鋼絲', cite: '[1][4]' },
    { no: 'H-08', id: 'knife', tool: '美工刀＋鋼尺', img: 'knife-ruler-grip-top.jpg', angle: '俯視，鋼尺、兩隻手、切割墊都入鏡',
      grip: '握刀的手靠近刀刃處（精細），刀子貼著鋼尺、往遠離身體的方向切', other: '壓緊鋼尺，手指不要伸到刀子要走的那一側',
      safety: '刀刃方向遠離扶工件的手；下面墊切割墊', cite: '[1]' },
    { no: 'H-09', id: 'wrench', tool: '扳手', img: 'wrench-grip-side.jpg', angle: '側面，看得到施力方向',
      grip: '握扳手柄，朝自己「拉」而不是推', other: '不要放在扳手可能滑脫的路徑上',
      safety: '活動扳手先把調整輪轉到夾緊；梅花扳手比開口扳手不易打滑', cite: '[4][7]' },
    { no: 'H-10', id: 'punch', tool: '中心衝＋鎚子', img: 'punch-grip-side.jpg', angle: '側面，鏡頭與工件同高',
      grip: '一手握衝具、衝尖對準記號；另一手握鎚子（握法同 H-01），用圓頭鎚等金屬鎚敲擊', other: '握工件的手指離擊點 5 cm 以上',
      safety: '不要用橡膠槌敲衝具；用完衝尖要保護收納', cite: '[3][4]' },
  ];

  // ── 簡化示意：工具外形（灰）＋手（米色連指手套輪廓）＋箭頭。viewBox 0 0 240 120 ──
  const F = 'font-family="Noto Sans TC,sans-serif"';
  const mitt = (x, y, rot, label) => `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M-14,-18 Q-16,-30 -4,-30 L14,-30 Q22,-30 22,-20 L22,14 Q22,24 12,24 L-6,24 Q-16,24 -16,14 Z" fill="#fde2c4" stroke="#b07a4f" stroke-width="1.6"/>
      <path d="M-16,-6 Q-30,-8 -28,6 Q-26,14 -16,10" fill="#fde2c4" stroke="#b07a4f" stroke-width="1.6"/>
      ${label ? `<text x="0" y="40" font-size="10" text-anchor="middle" fill="#7c4a22" ${F} transform="rotate(${-rot})">${label}</text>` : ''}</g>`;
  const arrow = (x1, y1, x2, y2, c = '#dc2626') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.5" marker-end="url(#gArr)"/>`;
  const DEFS = `<defs><marker id="gArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626"/></marker></defs>`;
  const T = '#64748b', W = '#a16207';
  const SKETCH = {
    hammer: `<rect x="20" y="62" width="150" height="12" rx="5" fill="${W}"/><rect x="166" y="34" width="20" height="64" rx="3" fill="${T}"/>
      ${mitt(46, 68, 0, '握末端')}${arrow(150, 22, 196, 40)}`,
    driver: `<rect x="20" y="52" width="70" height="30" rx="12" fill="#dc2626"/><rect x="90" y="63" width="100" height="8" fill="#94a3b8"/><rect x="190" y="61" width="12" height="12" fill="${T}"/>
      ${mitt(56, 66, 0, '握握把')}<path d="M40 30 a14 6 0 1 0 28 0" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#gArr)"/>`,
    backsaw: `<polygon points="20,50 170,50 170,92 20,92" fill="#cbd5e1"/><rect x="20" y="44" width="150" height="8" fill="${T}"/>
      <path d="M20,92 ${Array.from({ length: 25 }, (_, i) => `L${26 + i * 6},${i % 2 ? 92 : 97}`).join(' ')} L170,92" fill="#94a3b8"/>
      <path d="M170 42 L212 42 L218 96 L170 96 Z" fill="${W}"/>${mitt(196, 70, 0, '握把手')}<circle cx="34" cy="86" r="7" fill="#fde2c4" stroke="#b07a4f"/><text x="34" y="114" font-size="10" text-anchor="middle" fill="#7c4a22" ${F}>拇指扶鋸條（離齒）</text>`,
    hacksaw: `<path d="M30 40 L190 40 L190 86 M30 40 L30 86" fill="none" stroke="${T}" stroke-width="6"/><line x1="30" y1="80" x2="190" y2="80" stroke="#94a3b8" stroke-width="4"/>
      <path d="M190 40 L222 48 L222 92 L196 92 Z" fill="#1e3a8a"/>${mitt(210, 72, 0, '握把手')}${mitt(36, 30, 0, '扶前端')}${arrow(150, 106, 90, 106)}<text x="120" y="102" font-size="10" text-anchor="middle" fill="#dc2626" ${F}>推時施力</text>`,
    coping: `<path d="M40 24 L40 96 M40 24 L170 24 L170 96" fill="none" stroke="${T}" stroke-width="6"/><line x1="40" y1="94" x2="170" y2="94" stroke="#94a3b8" stroke-width="2"/>
      <rect x="160" y="96" width="20" height="22" rx="4" fill="${W}"/>${mitt(170, 100, 0, '')}<text x="206" y="112" font-size="10" fill="#7c4a22" ${F}>握把手</text>`,
    file: `<rect x="20" y="56" width="56" height="22" rx="9" fill="${W}"/><polygon points="76,58 210,62 210,72 76,76" fill="#94a3b8"/>
      ${Array.from({ length: 18 }, (_, i) => `<line x1="${82 + i * 7}" y1="59" x2="${78 + i * 7}" y2="75" stroke="#64748b"/>`).join('')}
      ${mitt(46, 66, 0, '握柄')}${mitt(188, 46, 0, '扶壓前端')}${arrow(90, 104, 170, 104)}<text x="130" y="100" font-size="10" text-anchor="middle" fill="#dc2626" ${F}>只推不拉</text>`,
    pliers: `<path d="M20 50 L120 62 L210 54 L210 60 L120 68 Z" fill="${T}"/><path d="M20 84 L120 72 L210 66 L210 72 L120 78 Z" fill="${T}"/>
      <path d="M20 46 L110 60 L110 66 L20 56 Z M20 88 L110 74 L110 80 L20 96 Z" fill="#dc2626"/><circle cx="120" cy="69" r="5" fill="#334155"/>${mitt(62, 72, 0, '握把手中段')}`,
    knife: `<rect x="10" y="30" width="220" height="30" fill="#e2e8f0" stroke="#94a3b8"/>${Array.from({ length: 21 }, (_, i) => `<line x1="${14 + i * 10}" y1="30" x2="${14 + i * 10}" y2="${i % 5 ? 36 : 40}" stroke="#64748b"/>`).join('')}
      <rect x="10" y="62" width="220" height="46" fill="#bbf7d0" opacity=".6"/>${mitt(110, 46, 0, '')}<text x="140" y="24" font-size="10" fill="#7c4a22" ${F}>壓緊鋼尺</text>
      <rect x="196" y="70" width="44" height="12" rx="3" fill="#facc15" transform="rotate(-8 196 70)"/>${arrow(200, 96, 60, 96)}<text x="130" y="116" font-size="10" text-anchor="middle" fill="#dc2626" ${F}>刀貼尺、往遠離身體方向切</text>`,
    wrench: `<rect x="40" y="60" width="150" height="14" rx="6" fill="${T}"/><circle cx="40" cy="67" r="20" fill="${T}"/><circle cx="40" cy="67" r="9" fill="#f8fafc"/>
      ${mitt(172, 66, 0, '握柄端')}${arrow(196, 30, 196, 104)}<text x="210" y="70" font-size="10" fill="#dc2626" ${F}>拉</text>`,
    punch: `<rect x="96" y="30" width="18" height="60" rx="3" fill="#94a3b8"/><polygon points="96,90 114,90 105,104" fill="${T}"/><rect x="20" y="104" width="200" height="12" fill="#cbd5e1"/>
      ${mitt(86, 62, 0, '')}<text x="30" y="58" font-size="10" fill="#7c4a22" ${F}>握衝具</text><rect x="150" y="14" width="60" height="14" rx="3" fill="${T}"/><rect x="176" y="28" width="8" height="40" fill="${W}"/>${arrow(160, 40, 120, 32)}`,
  };
  function sketch(id) {
    return `<svg viewBox="0 0 240 120" role="img" aria-label="握姿簡化示意">${DEFS}<rect width="240" height="120" fill="#f8fafc"/>${SKETCH[id] || ''}</svg>`;
  }
  const BASE = '../assets/grip/';
  function card(g) {
    const ph = `<div class="grip-ph" data-for="${g.no}">${sketch(g.id)}<p><strong>握姿照片待補（清單編號 ${g.no}）</strong><br>示意，待換實拍｜檔名 <code>hand-tools/assets/grip/${g.img}</code></p></div>`;
    const vid = g.video ? `<video class="grip-video" controls muted playsinline preload="metadata" hidden><source src="${BASE + g.video}" type="video/mp4"></video>` : '';
    return `<div class="grip-card" id="grip-${g.id}">
      <h4>${g.no}　${g.tool}</h4>
      <div class="grip-fig"><img src="${BASE + g.img}" alt="${g.tool}握姿實拍" data-optional="1" loading="lazy" hidden>${ph}</div>${vid}
      <ul><li><strong>握：</strong>${g.grip}</li><li><strong>另一手：</strong>${g.other}</li><li><strong>安全：</strong>${g.safety}</li></ul>
      <p class="grip-cite">📚 參考：${g.cite}（見頁尾資料來源）</p></div>`;
  }
  // 照片存在就顯示照片、隱藏示意；影片存在才顯示播放器
  function wire(scope) {
    scope.querySelectorAll('.grip-fig img').forEach(img => {
      const ph = img.nextElementSibling;
      const ok = () => { if (img.naturalWidth > 0) { img.hidden = false; ph.hidden = true; } };
      img.addEventListener('load', ok); img.addEventListener('error', () => { img.hidden = true; ph.hidden = false; });
      if (img.complete) ok();
    });
    scope.querySelectorAll('video.grip-video').forEach(v => {
      v.addEventListener('loadedmetadata', () => { v.hidden = false; });
      const s = v.querySelector('source'); if (s) s.addEventListener('error', () => { v.hidden = true; });
    });
  }
  function mount(container) {
    container.innerHTML = GRIPS.map(card).join('');
    wire(container);
  }
  const api = { GRIPS, sketch, card, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HTGrip = api;
})(typeof window !== 'undefined' ? window : this);
