// 砂磨機 模組 1：認識部件
const PARTS = {
  belt: { name: '砂帶（Sanding Belt）', role: 'BELT SANDER ABRASIVE', desc: '套在前後兩個滾輪上的環形砂紙帶。常見規格 75×457mm / 100×610mm。粒度（grit）數字越小越粗：60 號粗磨、120 號中磨、240 號細磨、320 號精修。', fact: '砂帶方向有箭頭印在內側——裝錯方向砂粒會被反向拉脫，磨削效率降到一半且砂帶很快壞。' },
  disc: { name: '砂盤（Sanding Disc）', role: 'DISC SANDER ABRASIVE', desc: '圓盤狀砂紙，貼在金屬轉盤上。盤式砂磨機切削力比帶式大，適合快速去料、平面修整、邊角倒角。使用前先空轉觀察旋轉方向，工件只能放在「向下旋轉」那一側才不會被甩起（多數逆時針機型為左半邊；依教室機台實際方向為準）。', fact: '盤式砂磨「往下轉那側才能磨」是鐵則：放到向上旋轉那側，工件會被砂盤甩飛。' },
  motor: { name: '馬達（Motor）', role: 'POWER UNIT', desc: '常見 250–550W，透過 V 型皮帶帶動砂帶滾輪或砂盤轉軸。連續使用 15 分鐘以上要讓馬達休息，避免過熱。', fact: '聞到焦味或砂帶轉速下降 = 馬達過熱。立刻停機開蓋散熱，不要繼續用。' },
  fence: { name: '靠尺（Fence / Miter Gauge）', role: 'WORKPIECE GUIDE', desc: '工作面後方的金屬導向板，提供工件穩定支撐。可調角度（0°/45°/90°）做斜角倒角。靠尺與砂帶之間應保持極小間隙（< 2mm）避免工件被夾入。', fact: '工件必須平貼靠尺，這樣磨出來才會平直。沒貼靠尺 → 工件會在砂帶上「跳舞」，磨出來歪斜不平。' },
  switch: { name: '電源開關（On/Off Switch）', role: 'POWER CONTROL', desc: '機台前方的綠色 ON 按鈕，紅色 OFF 按鈕。多數機台採「拍板式」開關蓋——拍下即停機，方便緊急時不假思索直接拍。', fact: '操作前先用一手「懸在拍板上方」，意外發生時不用看就能拍下停機。' },
  dust: { name: '集塵口（Dust Collection Port）', role: 'DUST EVACUATION', desc: '砂磨會產生大量粉塵——木屑粉、塑料粉、金屬粉。集塵口連接工坊吸塵器或集塵桶，是「粉塵爆炸防範」的核心。', fact: '⚠ 木屑粉達一定濃度（40g/m³）遇火源會爆炸。集塵連接不是選項，是必要設備。' },
  tension: { name: '砂帶張力調整（Belt Tension）', role: 'BELT ADJUSTER', desc: '帶式砂磨機側面的調整旋鈕，控制前後滾輪間距以調整砂帶張力。張力太鬆砂帶會滑脫飛出，張力太緊砂帶壽命會減半。', fact: '正確張力：徒手按砂帶中央，能下壓約 5mm 且不會晃動。換新砂帶後通常要重新調整。' },
  stop: { name: '緊急停止（Emergency Stop）', role: 'E-STOP', desc: '大紅色按鈕，遇到工件飛起、衣物捲入、煙霧等緊急狀況時，用手掌拍下立即斷電。多數機台有「鎖定式」設計——拍下後要拉起才能重新啟動。', fact: '緊急停止位置學生應該背得出來——遇到狀況不用思考、直接伸手拍。' },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'sander_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || { module1_seen: [] }; } catch { return { module1_seen: [] }; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const sp = loadP();
if (sp.module1_seen) sp.module1_seen.forEach(id => seenSet.add(id));

Object.entries(PARTS).forEach(([id, p], i) => {
  const c = document.createElement('span');
  c.className = 'part-chip';
  if (seenSet.has(id)) c.classList.add('seen');
  c.dataset.id = id;
  c.textContent = `${i + 1}. ${p.name.split('（')[0]}`;
  checklistEl.appendChild(c);
});

function syncUI() {
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('seen', seenSet.has(g.dataset.id)));
  progressEl.textContent = `已認識 ${seenSet.size} / ${totalParts} 個部件`;
  if (seenSet.size === totalParts) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
}
syncUI();

function render(id) {
  const p = PARTS[id];
  if (!p) return;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  infoEl.innerHTML = `<h3>${p.name}</h3><p class="role">${p.role}</p><p class="desc">${p.desc}</p>
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)"><strong style="color:var(--accent)">💡 操作要點：</strong>${p.fact}</div>`;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncUI();
    const prog = loadP();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 個部件都認識完畢！', 'good');
    }
    saveP(prog);
  }
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id));
}
document.querySelectorAll('.hotspot-group').forEach(g => g.addEventListener('click', () => render(g.dataset.id)));
document.querySelectorAll('.part-chip').forEach(c => c.addEventListener('click', () => render(c.dataset.id)));

/* ── 磨料種類圖鑑 ──────────────────────────────────────── */
;(function () {
  const ABRASIVES = [
    {
      id: 'al2o3', name: '氧化鋁', en: 'Aluminum Oxide (Al₂O₃)', color: '#6b7280', hv: 2000,
      grit: '60–320', materials: '木材 · 金屬 · 塑料', tag: '⭐ 最通用',
      note: '最普遍的磨料，適合木工、金屬加工和塑料。耐磨且性價比高，是教室砂磨機的預設選擇。',
      warn: '磨不鏽鋼效率偏低，改用氧化鋯效率更高。',
      svgGrains: `<circle cx="20" cy="25" r="8" fill="#9ca3af"/><circle cx="42" cy="18" r="10" fill="#6b7280"/><circle cx="62" cy="28" r="7" fill="#9ca3af"/><circle cx="80" cy="16" r="9" fill="#6b7280"/><circle cx="100" cy="24" r="6" fill="#9ca3af"/><circle cx="118" cy="20" r="8" fill="#6b7280"/>`,
    },
    {
      id: 'sic', name: '碳化矽', en: 'Silicon Carbide (SiC)', color: '#1e293b', hv: 2500,
      grit: '80–400', materials: '玻璃 · 陶瓷 · 石材 · 非鐵金屬',  tag: '⚡ 最鋒利',
      note: '硬度僅次於鑽石，磨粒極為鋒利。常用於磨玻璃、陶瓷、石材或矽、鍺等半導體材料。',
      warn: '磨粒脆、耗損快；不適合磨鐵金屬（會與鐵反應降低效率）。',
      svgGrains: `<polygon points="20,30 28,10 36,30" fill="#334155"/><polygon points="50,28 58,8 66,28" fill="#1e293b"/><polygon points="78,32 86,12 94,32" fill="#334155"/><polygon points="106,26 114,6 122,26" fill="#1e293b"/>`,
    },
    {
      id: 'zirconia', name: '氧化鋯鋁', en: 'Zirconia Alumina (ZrO₂)', color: '#b45309', hv: 2200,
      grit: '36–120', materials: '鋼鐵 · 不鏽鋼 · 重工業去料', tag: '💪 最耐用',
      note: '氧化鋯與氧化鋁的複合磨料，特點是「自銳性」——磨粒破碎時自動產生新的鋒利切削面，壽命比純氧化鋁長 3–5 倍。',
      warn: '價格較高，粗粒號為主（36–120），精細表面加工效果不及氧化鋁。',
      svgGrains: `<rect x="12" y="15" width="18" height="18" rx="2" fill="#d97706" transform="rotate(15 21 24)"/><rect x="44" y="12" width="20" height="20" rx="2" fill="#b45309" transform="rotate(-10 54 22)"/><rect x="76" y="16" width="17" height="17" rx="2" fill="#d97706" transform="rotate(25 84 24)"/><rect x="106" y="13" width="19" height="19" rx="2" fill="#b45309" transform="rotate(-5 115 22)"/>`,
    },
    {
      id: 'garnet', name: '石榴石', en: 'Garnet (Almandite)', color: '#9f1239', hv: 1200,
      grit: '80–220', materials: '木材精修（木工專用）', tag: '🌿 木工精修',
      note: '天然礦物磨料，磨粒為不規則貝殼形，切削時磨削感非常「細膩」，特別適合木材最後幾道精修拋光，漆面前的最後磨光。',
      warn: '硬度低於其他磨料，不適合磨金屬——金屬表面硬度會使石榴石磨粒快速磨平失效。',
      svgGrains: `<ellipse cx="22" cy="24" rx="10" ry="7" fill="#be123c" transform="rotate(20 22 24)"/><ellipse cx="48" cy="20" rx="12" ry="8" fill="#9f1239" transform="rotate(-15 48 20)"/><ellipse cx="76" cy="26" rx="9" ry="6" fill="#be123c" transform="rotate(30 76 26)"/><ellipse cx="104" cy="21" rx="11" ry="7" fill="#9f1239" transform="rotate(-5 104 21)"/>`,
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🔬 磨料種類圖鑑</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:14px">砂紙的磨削效果取決於磨料種類。選對磨料才能事半功倍，選錯則浪費耗材甚至損傷工件。</p>
    <div id="abr-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"></div>
    <div id="abr-detail" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px"></div>
    <div style="margin-top:18px;overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f1f5f9">
          <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0">磨料</th>
          <th style="padding:8px 10px;border:1px solid #e2e8f0">硬度 HV</th>
          <th style="padding:8px 10px;border:1px solid #e2e8f0">常見粒度</th>
          <th style="padding:8px 10px;border:1px solid #e2e8f0">最佳材料</th>
          <th style="padding:8px 10px;border:1px solid #e2e8f0">禁用場合</th>
        </tr></thead>
        <tbody>
          <tr><td style="padding:7px 10px;border:1px solid #e2e8f0"><strong style="color:#6b7280">氧化鋁</strong></td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">2000</td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">60–320</td><td style="padding:7px 10px;border:1px solid #e2e8f0">木材、金屬、塑料</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#dc2626">不鏽鋼效率低</td></tr>
          <tr style="background:#f8fafc"><td style="padding:7px 10px;border:1px solid #e2e8f0"><strong style="color:#1e293b">碳化矽</strong></td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">2500</td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">80–400</td><td style="padding:7px 10px;border:1px solid #e2e8f0">玻璃、陶瓷、石材</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#dc2626">禁磨鐵金屬</td></tr>
          <tr><td style="padding:7px 10px;border:1px solid #e2e8f0"><strong style="color:#b45309">氧化鋯鋁</strong></td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">2200</td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">36–120</td><td style="padding:7px 10px;border:1px solid #e2e8f0">鋼鐵、不鏽鋼</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#dc2626">精細加工不適合</td></tr>
          <tr style="background:#f8fafc"><td style="padding:7px 10px;border:1px solid #e2e8f0"><strong style="color:#9f1239">石榴石</strong></td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">1200</td><td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center">80–220</td><td style="padding:7px 10px;border:1px solid #e2e8f0">木材精修</td><td style="padding:7px 10px;border:1px solid #e2e8f0;color:#dc2626">禁磨任何金屬</td></tr>
        </tbody>
      </table>
    </div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const tabsEl = document.getElementById('abr-tabs');
  const detailEl = document.getElementById('abr-detail');

  ABRASIVES.forEach(a => {
    const btn = document.createElement('button');
    btn.dataset.abr = a.id;
    btn.style.cssText = `padding:8px 14px;border-radius:8px;border:2px solid ${a.color};background:#fff;color:${a.color};font-weight:700;font-size:13px;cursor:pointer;transition:all .15s`;
    btn.textContent = a.name;
    btn.addEventListener('click', () => showAbr(a.id));
    tabsEl.appendChild(btn);
  });

  function showAbr(id) {
    const a = ABRASIVES.find(x => x.id === id);
    tabsEl.querySelectorAll('button').forEach(b => {
      const active = b.dataset.abr === id;
      const aa = ABRASIVES.find(x => x.id === b.dataset.abr);
      b.style.background = active ? aa.color : '#fff';
      b.style.color = active ? '#fff' : aa.color;
    });
    detailEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap">
        <div>
          <svg viewBox="0 0 140 44" style="width:140px;height:44px;border:1px solid #e2e8f0;border-radius:6px;background:#fff">
            <text x="4" y="40" font-size="9" fill="#94a3b8" font-family="Inter,sans-serif">磨粒示意</text>
            ${a.svgGrains}
          </svg>
          <div style="margin-top:8px">
            <div style="font-size:12px;color:#64748b;margin-bottom:4px">硬度 HV</div>
            <div style="height:8px;background:#e2e8f0;border-radius:4px;width:140px">
              <div style="height:8px;background:${a.color};border-radius:4px;width:${Math.round(a.hv/2500*140)}px"></div>
            </div>
            <div style="font-size:12px;color:${a.color};font-weight:700;margin-top:2px">${a.hv.toLocaleString()} HV</div>
          </div>
        </div>
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <h4 style="margin:0;color:${a.color}">${a.name}</h4>
            <span style="background:${a.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">${a.tag}</span>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 8px">${a.en}</p>
          <div style="margin-bottom:8px"><strong style="font-size:13px">適用材料：</strong><span style="font-size:13px;color:#374151">${a.materials}</span></div>
          <div style="margin-bottom:8px"><strong style="font-size:13px">常見粒度：</strong><span style="font-size:13px;color:#374151">${a.grit} 號</span></div>
          <p style="font-size:13px;color:#374151;line-height:1.7;margin:0 0 6px">${a.note}</p>
          <div style="padding:8px 12px;background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;font-size:12px;color:#9a3412"><strong>⚠ 注意：</strong>${a.warn}</div>
        </div>
      </div>
    `;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  }

  // 預設選中氧化鋁
  showAbr('al2o3');
})();

/* ── 機型圖鑑 + 安全說明 ──────────────────────────────── */
;(function () {
  const TYPES = [
    {
      id: 'belt', name: '帶式砂磨機', en: 'Belt Sander', color: '#7C3AED',
      photo: { url: '../assets/img/belt-sander.jpg', credit: 'CC0 · Arp，Wikimedia Commons', link: 'https://commons.wikimedia.org/wiki/File:Bandslijpmachine_hobbykwaliteit_(Westfalia).jpg' },
      desc: '使用環形砂帶套在前後兩個滾輪上，砂帶持續單向移動。去料速度最快，適合大面積平面磨削、去漆、整平。',
      specs: '砂帶規格：75×457mm 或 100×610mm；轉速：600–1800 m/min',
      safety: [
        { c:'#dc2626', t:'砂帶內側有箭頭方向印記，必須對齊滾輪旋轉方向安裝——裝反砂粒反向受力，砂帶壽命砍半且容易斷裂飛出。' },
        { c:'#dc2626', t:'工件必須持續橫向移動，不可停在同一點超過 2 秒——摩擦熱會立刻燒焦木材。' },
        { c:'#f97316', t:'砂帶張力：按下砂帶中央能下壓約 5mm 為正確。太鬆易飛出，太緊縮短壽命。' },
        { c:'#0891b2', t:'小工件（< 5cm）必須使用推板（push block）或木夾固定，不可徒手捏著磨。' },
      ],
    },
    {
      id: 'disc', name: '盤式砂磨機', en: 'Disc Sander', color: '#dc2626',
      photo: { url: '../assets/img/disc-sander.jpg', credit: 'CC BY-SA 3.0 · Vishwin60，Wikimedia Commons', link: 'https://commons.wikimedia.org/wiki/File:Disc_sander.JPG' },
      desc: '圓盤狀砂紙貼在金屬轉盤上高速旋轉。切削力比帶式大，最適合工件端面整平、倒角、快速去料。常與帶式組合成「帶盤式砂磨機」。',
      specs: '砂盤直徑：200–300mm；轉速：1400–3600 RPM',
      safety: [
        { c:'#dc2626', t:'⚠ 核心規則：先空轉觀察旋轉方向，工件只能放在砂盤「向下旋轉」那一側（多數逆時針機型為左半邊；依教室機台實際方向為準）！放到向上旋轉側，工件會瞬間被甩起飛出。' },
        { c:'#dc2626', t:'工件後緣必須平貼靠尺（fence），不可懸空或傾斜。' },
        { c:'#f97316', t:'砂盤外緣線速度最高，越靠外緣磨削越快、發熱越多，工件不要在外緣停留過久。' },
        { c:'#0891b2', t:'砂紙盤用黏膠固定，老化後易剝落——定期檢查砂紙是否有翹起或脫落。' },
      ],
    },
    {
      id: 'orbital', name: '隨機軌道式砂磨機', en: 'Random Orbital Sander', color: '#059669',
      photo: { url: '../assets/img/orbital-sander.jpg', credit: 'CC BY 2.0 · Mark Hunter，Wikimedia Commons', link: 'https://commons.wikimedia.org/wiki/File:Makita_BO5041_Random_Orbit_Sander_(6169160923).jpg' },
      desc: '圓形砂盤同時進行自轉與公轉（橢圓軌跡），雙軌跡使每次接觸路徑不同，避免留下規律性刮痕。適合最終精修、上漆前處理，也是最適合初學者的砂磨機。',
      specs: '砂盤直徑：125mm 或 150mm；轉速：4000–12000 OPM（軌道/分）',
      safety: [
        { c:'#dc2626', t:'砂盤靜止在同一位置超過 2 秒即會燒焦工件，並留下圓弧形刮痕。操作時必須持續移動砂盤。' },
        { c:'#f97316', t:'砂盤有鉤環式（Velcro）固定，使用前確認砂紙已完全貼合，沒有翹邊。' },
        { c:'#0891b2', t:'砂盤有集塵孔——必須對齊砂紙的集塵孔，才能有效吸除粉塵。' },
        { c:'#0891b2', t:'雙手輕握機器即可，不需要施力下壓——機器本身重量足夠，過度施壓會降低軌道運動效果。' },
      ],
    },
    {
      id: 'spindle', name: '主軸式（鼓式）砂磨機', en: 'Spindle / Drum Sander', color: '#b45309',
      photo: { url: null, credit: '主軸式示意圖（Wikimedia Commons 無授權近代照片）', link: null },
      desc: '垂直立式砂鼓（drum）高速旋轉，可額外加上「震盪」（oscillating）上下往返運動以均勻分散磨損。專門用於磨削工件的「內弧面」（圓形孔、曲線內側），是其他砂磨機無法替代的機型。',
      specs: '砂鼓直徑：13–76mm（多組可換）；轉速：1700–2000 RPM',
      safety: [
        { c:'#dc2626', t:'砂鼓直徑必須略小於工件內弧直徑——砂鼓太大會卡住，太小接觸面不夠無法磨。' },
        { c:'#dc2626', t:'工件必須持續沿弧面緩慢移動，不可停留。砂鼓靜止接觸超過 2 秒即燒焦木材。' },
        { c:'#f97316', t:'工件要從右向左均勻移動（逆砂鼓旋轉方向進料），砂鼓才不會「咬住」工件。' },
        { c:'#0891b2', t:'換砂鼓套（sleeve）前必須斷電，且確認螺帽鎖緊——鬆動的砂鼓套在高速下可能飛出。' },
      ],
    },
  ];

  const COMPARE = [
    { label: '磨削方式', vals: ['單向直線', '圓形旋轉', '橢圓軌跡（自轉+公轉）', '垂直旋轉±震盪'] },
    { label: '適合工件形狀', vals: ['大面積平面', '端面 · 直邊 · 倒角', '各種平面 · 精修', '內弧面 · 曲線內側'] },
    { label: '可磨內弧', vals: ['❌', '❌', '❌', '✅ 專用'] },
    { label: '粉塵管理', vals: ['需接外部吸塵', '需接外部吸塵', '內建集塵袋', '需接外部吸塵'] },
    { label: '教室常見度', vals: ['⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐'] },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🏭 砂磨機機型圖鑑</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">不同機型各有擅長場合，也各有獨特的操作安全要點。點選卡片查看詳情。</p>
    <div id="mtype-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:20px"></div>
    <div id="mtype-detail" style="display:none;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px"></div>
    <h4 style="margin-bottom:10px;color:#374151">機型橫向比較</h4>
    <div style="overflow-x:auto">
      <table id="mtype-compare" style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
        <thead><tr style="background:#f1f5f9">
          <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0">項目</th>
          ${TYPES.map(t => `<th style="padding:8px 10px;border:1px solid #e2e8f0;color:${t.color}">${t.name}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${COMPARE.map((r, ri) => `<tr style="${ri % 2 ? 'background:#f8fafc' : ''}">
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-weight:600;color:#374151">${r.label}</td>
            ${r.vals.map(v => `<td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:center;font-size:12px">${v}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const grid = document.getElementById('mtype-grid');
  const detail = document.getElementById('mtype-detail');

  TYPES.forEach(t => {
    const card = document.createElement('div');
    card.dataset.mtype = t.id;
    card.style.cssText = `background:#fff;border:2px solid #e2e8f0;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s`;
    const photoHtml = t.photo.url
      ? `<img src="${t.photo.url}" alt="${t.name}" style="width:100%;height:140px;object-fit:cover" onerror="this.style.display='none'">`
      : `<svg viewBox="0 0 200 130" style="width:200px;height:130px">
          <rect x="20" y="82" width="160" height="8" rx="2" fill="#94a3b8"/>
          <rect x="82" y="18" width="36" height="64" rx="10" fill="${t.color}" opacity=".85"/>
          <line x1="89" y1="20" x2="89" y2="80" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>
          <line x1="96" y1="20" x2="96" y2="80" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>
          <line x1="103" y1="20" x2="103" y2="80" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>
          <line x1="110" y1="20" x2="110" y2="80" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>
          <path d="M 40 62 Q 82 42 82 62 L 82 78 Q 82 92 40 80 Z" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
          <text x="128" y="52" font-size="20" fill="${t.color}">↕</text>
          <text x="122" y="66" font-size="9" fill="${t.color}" font-weight="700" font-family="Noto Sans TC,sans-serif">震盪旋轉</text>
          <text x="100" y="116" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="Noto Sans TC,sans-serif">主軸式示意圖</text>
        </svg>`;
    const creditHtml = t.photo.link
      ? `<a href="${t.photo.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:block;font-size:10px;color:#94a3b8;padding:2px 8px;text-decoration:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">📷 ${t.photo.credit}</a>`
      : `<div style="font-size:10px;color:#94a3b8;padding:2px 8px">🎨 ${t.photo.credit}</div>`;
    card.innerHTML = `
      <div style="height:140px;overflow:hidden;background:#f1f5f9;display:flex;align-items:center;justify-content:center">
        ${photoHtml}
      </div>
      ${creditHtml}
      <div style="padding:12px 14px">
        <div style="font-weight:700;color:${t.color};font-size:15px;margin-bottom:3px">${t.name}</div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${t.en}</div>
        <p style="font-size:12px;color:#64748b;line-height:1.5;margin:0 0 10px">${t.desc.substring(0, 60)}…</p>
        <div style="display:flex;gap:6px">
          <span style="flex:1;text-align:center;padding:5px 0;background:${t.color};color:#fff;border-radius:6px;font-size:12px;font-weight:700">查看詳情 →</span>
          <a href="module3.html#machine-sim-anchor" onclick="event.stopPropagation()" style="padding:5px 10px;border:1px solid ${t.color};color:${t.color};border-radius:6px;font-size:12px;cursor:pointer;text-decoration:none;display:flex;align-items:center">操作模擬 →</a>
        </div>
      </div>`;
    card.addEventListener('click', () => showType(t.id));
    grid.appendChild(card);
  });

  function showType(id) {
    const t = TYPES.find(x => x.id === id);
    grid.querySelectorAll('[data-mtype]').forEach(c => {
      const active = c.dataset.mtype === id;
      const ct = TYPES.find(x => x.id === c.dataset.mtype);
      c.style.borderColor = active ? ct.color : '#e2e8f0';
      c.style.boxShadow = active ? `0 0 0 3px ${ct.color}33` : 'none';
    });
    detail.style.display = 'block';
    detail.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <h4 style="margin:0;color:${t.color};font-size:16px">${t.name}</h4>
        <span style="font-size:12px;color:#94a3b8">${t.en}</span>
      </div>
      <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:10px">${t.desc}</p>
      <p style="font-size:12px;color:#64748b;margin-bottom:12px"><strong>規格：</strong>${t.specs}</p>
      <h5 style="margin:0 0 8px;color:#1e293b">安全操作要點：</h5>
      ${t.safety.map(s => `<div style="padding:8px 12px;border-left:3px solid ${s.c};border-radius:4px;background:#fff;margin-bottom:6px;font-size:13px;color:#374151;line-height:1.6">${s.t}</div>`).join('')}
    `;
    detail.scrollIntoView({ behavior:'smooth', block:'nearest' });
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  }
})();
