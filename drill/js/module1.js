// 手電鑽 模組 1：認識部件
const PARTS = {
  trigger: { name: '扳機（Trigger / Variable Speed）', role: 'SPEED CONTROL', desc: '控制鑽頭轉速的關鍵元件。輕扣慢轉、深扣全速。多數型號為「無段變速」（0–2000 RPM）：可從零開始穩定加速，方便起鑽不打滑。', fact: '起鑽一定要「輕扣」慢速定位後再加速，直接全速會打滑、偏鑽、傷工件。' },
  reverse: { name: '正反轉開關（Forward / Reverse）', role: 'DIRECTION SWITCH', desc: '位於扳機正上方的撥桿。FWD（正轉）= 鎖緊、鑽孔；REV（反轉）= 退鑽、拆螺絲。中間位置為「鎖定」可防止誤觸扳機。', fact: '反轉除了退鑽，也能在鑽頭卡住時「微抖」鬆開——但要先停機、雙手扶穩再切換。' },
  torque: { name: '扭力環 / 離合器（Torque Collar）', role: 'CLUTCH SELECTOR', desc: '位於夾頭後方，可旋轉的環圈。刻度 1–20+ 段代表離合器跳脫的扭力大小：數字越大，鎖入越深。最後的「鑽頭符號」表示鎖死不跳脫（純鑽孔用）。', fact: '鎖石膏板 2–4、薄板 6–10、實木 12–18、鑽孔模式關閉離合器。鎖螺絲時設對扭力可避免崩牙或斷頭。' },
  chuck: { name: '夾頭（Keyless Chuck）', role: 'BIT HOLDER', desc: '夾持鑽頭的金屬機構。新型多為「免鑰匙夾頭」：手轉前環即可鬆緊三爪。常見規格 10mm / 13mm（可夾的最大鑽頭直徑）。', fact: '夾頭要轉到「咔咔咔」聽到聲音才算真正夾緊。沒夾緊鑽頭會在工件裡甩動造成偏鑽或飛出。' },
  bit: { name: '鑽頭（Drill Bit）', role: 'CUTTING EDGE', desc: '實際切削材料的部分。常見三類：高速鋼（HSS）鑽金屬與塑料、木工螺旋鑽頭（含中心尖）鑽木材、磚石鑽頭（碳化鎢頭）鑽磚牆。直徑通常 1.5–13mm。', fact: '鑽頭鈍了會「燒黑」、出粉變少。木工鑽鑽金屬會立刻崩刃；磚石鑽鑽木材會很慢且燒焦。選錯鑽頭比沒戴護目鏡危險。' },
  battery: { name: '電池組（Battery Pack）', role: 'POWER SOURCE', desc: '可拆式鋰電池，常見規格 18V 5Ah（亦有 12V/20V/40V）。電量指示燈顯示剩餘電量。連續鑽硬材或大孔時電池會發燙——要讓它休息。', fact: '鋰電池儲存時請放在 40–60% 電量（不要充滿也不要放光），可延長壽命到 800+ 次充放電循環。' },
  motor: { name: '馬達（Brushless Motor）', role: 'POWER UNIT', desc: '提供旋轉動力的電動機。新型多為「無刷馬達」（BLDC）：扭力大、發熱少、壽命長。後方有散熱孔，使用時不要堵住。', fact: '長時間連續鑽會讓馬達過熱觸發保護（自動停轉）。聞到燒焦味要立刻停止、放在通風處 5–10 分鐘。' },
  grip: { name: '握把（Pistol Grip）', role: 'ERGONOMIC HANDLE', desc: '槍型把手，含防滑橡膠紋理。正確握法：主手握把、食指放扳機、虎口頂頭部。另一手托機身前段（夾頭後方）—— 切勿單手操作。', fact: '雙手握的姿勢能在鑽頭突然卡住時用身體吸收反作用力，避免手電鑽「翻轉甩飛」。' },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'drill_progress_v1';
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

// ========================
// 鑽頭選擇器（模組 1 延伸互動）- 擴充版 6 種鑽頭
// ========================
;(function() {
  const BITS = [
    {
      id: 'hss', name: 'HSS 高速鋼', color: '#6b7280',
      material: '金屬 · 塑膠 · 木材（應急）',
      rpm: '高速（≤ 2000 RPM）', tip: '118° 磨尖',
      desc: '最通用的鑽頭。尖端 118° 切削角，鑽鋼鐵、鋁、銅、塑膠都適合。鑽木材不如木工鑽頭精確，但能應急。刀刃呈螺旋排屑槽。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg/320px-HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg', caption: 'HSS 鑽頭正在鑽削鋁板（施加切削液）', page: 'https://commons.wikimedia.org/wiki/File:HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg', license: 'CC BY-SA 3.0 · Wikimedia Commons' },
      svg: `<rect x="10" y="42" width="140" height="16" rx="2" fill="#9ca3af"/>
        <g stroke="#4b5563" stroke-width="1" opacity=".7">
          <line x1="18" y1="42" x2="23" y2="58"/><line x1="30" y1="42" x2="35" y2="58"/>
          <line x1="42" y1="42" x2="47" y2="58"/><line x1="54" y1="42" x2="59" y2="58"/>
          <line x1="66" y1="42" x2="71" y2="58"/><line x1="78" y1="42" x2="83" y2="58"/>
          <line x1="90" y1="42" x2="95" y2="58"/><line x1="102" y1="42" x2="107" y2="58"/>
          <line x1="114" y1="42" x2="119" y2="58"/><line x1="126" y1="42" x2="131" y2="58"/>
        </g>
        <polygon points="150,42 168,50 150,58" fill="#374151"/>
        <line x1="164" y1="42" x2="168" y2="50" stroke="#1f2937" stroke-width="1.5"/>
        <line x1="164" y1="58" x2="168" y2="50" stroke="#1f2937" stroke-width="1.5"/>
        <text x="85" y="78" text-anchor="middle" font-size="9" fill="#9ca3af" font-family="Inter">118° 標準角 · 通用刀刃</text>`
    },
    {
      id: 'wood', name: '木工螺旋', color: '#a16207',
      material: '木材 · 夾板 · MDF',
      rpm: '中低速（500–1500 RPM）', tip: '中心尖（定位針）',
      desc: '最前端有細長定位尖，起鑽零偏移。螺旋刀翼設計，快速切削木纖維並把木屑往外排。深孔木材鑽孔首選。鑽金屬會馬上崩刃。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Group_of_drill_bits.jpg/320px-Group_of_drill_bits.jpg', caption: '各式鑽頭組合：左側螺旋型即為木工用鑽頭', page: 'https://commons.wikimedia.org/wiki/File:Group_of_drill_bits.jpg', license: 'CC BY-SA 3.0 · Mo7amedsalim / Wikimedia Commons' },
      svg: `<rect x="10" y="44" width="130" height="12" rx="2" fill="#a16207"/>
        <path d="M 10 44 Q 28 37 46 44 Q 64 51 82 44 Q 100 37 118 44 Q 130 48 130 50" stroke="#78350f" stroke-width="2" fill="none"/>
        <path d="M 10 56 Q 28 49 46 56 Q 64 63 82 56 Q 100 49 118 56 Q 130 52 130 50" stroke="#78350f" stroke-width="2" fill="none"/>
        <polygon points="130,44 150,50 130,56" fill="#78350f"/>
        <line x1="150" y1="50" x2="158" y2="50" stroke="#78350f" stroke-width="2"/>
        <circle cx="162" cy="50" r="4" fill="none" stroke="#92400e" stroke-width="1.5"/>
        <polygon points="162,44 168,50 162,56" fill="#92400e"/>
        <text x="85" y="78" text-anchor="middle" font-size="9" fill="#a16207" font-family="Inter">中心尖定位 · 螺旋刀翼排屑</text>`
    },
    {
      id: 'masonry', name: '碳化鎢磚石', color: '#78716c',
      material: '磚牆 · 混凝土 · 磁磚',
      rpm: '低速（300–600 RPM）', tip: '壓製碳化鎢硬頭',
      desc: '前端為壓製燒結碳化鎢（YG8），硬度極高。配電鎚模式（旋轉＋衝擊）才能有效打磚牆。鑽木材或金屬完全無效，且尖頭會快速崩裂。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Schlagbohrer_f%C3%BCr_Mauerwerk_18mm_Durchmesser%2C_Masonry_bit_1671.JPG/200px-Schlagbohrer_f%C3%BCr_Mauerwerk_18mm_Durchmesser%2C_Masonry_bit_1671.JPG', caption: '18mm 磚石鑽頭：前端淡黃色即為碳化鎢硬頭', page: 'https://commons.wikimedia.org/wiki/File:Schlagbohrer_f%C3%BCr_Mauerwerk_18mm_Durchmesser,_Masonry_bit_1671.JPG', license: 'CC BY-SA 3.0 · Hedwig Storch / Wikimedia Commons' },
      svg: `<rect x="10" y="44" width="120" height="12" rx="2" fill="#78716c"/>
        <polygon points="130,41 150,44 150,56 130,59" fill="#a8a29e"/>
        <rect x="132" y="44" width="16" height="12" fill="#d4d4aa"/>
        <polygon points="150,44 168,50 150,56" fill="#c4b5a0"/>
        <line x1="136" y1="48" x2="146" y2="48" stroke="#92400e" stroke-width="1"/>
        <line x1="136" y1="52" x2="146" y2="52" stroke="#92400e" stroke-width="1"/>
        <text x="85" y="78" text-anchor="middle" font-size="9" fill="#78716c" font-family="Inter">碳化鎢硬頭 · 配衝擊模式</text>`
    },
    {
      id: 'spade', name: '鏟形鑽頭', color: '#0369a1',
      material: '木材 · 夾板（大孔專用 20–50mm）',
      rpm: '中速（600–1200 RPM）', tip: '中心尖 + 兩翼鏟刃',
      desc: '前端有銳利中心定位尖，兩側寬扁鏟刃，適合在木材上快速鑽出大孔（20–50mm）。不適合金屬，孔邊較粗糙，但速度快、價格低。常用於走線孔、管道穿孔。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Spade_drill_bit.jpg/320px-Spade_drill_bit.jpg', caption: '鏟形鑽頭（Spade/Paddle bit）：可見中心尖與兩側寬鏟刃', page: 'https://commons.wikimedia.org/wiki/File:Spade_drill_bit.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="8" y="43" width="100" height="14" rx="2" fill="#0369a1"/>
        <rect x="108" y="33" width="34" height="34" rx="1" fill="#0284c7"/>
        <polygon points="142,47 158,50 142,53" fill="#0c4a6e"/>
        <line x1="108" y1="33" x2="118" y2="43" stroke="#0c4a6e" stroke-width="2"/>
        <line x1="108" y1="67" x2="118" y2="57" stroke="#0c4a6e" stroke-width="2"/>
        <line x1="122" y1="33" x2="122" y2="67" stroke="#0284c7" stroke-width="1" opacity=".5"/>
        <line x1="134" y1="33" x2="134" y2="67" stroke="#0284c7" stroke-width="1" opacity=".3"/>
        <text x="85" y="80" text-anchor="middle" font-size="9" fill="#0369a1" font-family="Inter">鏟刃寬頭 · 木材大孔 20–50mm</text>`
    },
    {
      id: 'forstner', name: '平底鑽頭', color: '#7c3aed',
      material: '木材 · 夾板（鉸鏈槽 / 平底盲孔）',
      rpm: '低速（200–800 RPM）', tip: '環形切刃 + 中心尖',
      desc: '外圍環形刀刃先切圓周、中心尖定位，切出完美平底盲孔。最常用於安裝鉸鏈的圓槽（35mm Blum 型）和木塞孔。轉速必須低，否則焦黑燒損材料。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Forstner_Bit.jpg/320px-Forstner_Bit.jpg', caption: '平底鑽頭（Forstner bit）：環形外刃與中心尖清晰可見', page: 'https://commons.wikimedia.org/wiki/File:Forstner_Bit.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="8" y="44" width="90" height="12" rx="2" fill="#7c3aed"/>
        <rect x="98" y="37" width="42" height="26" rx="2" fill="#6d28d9"/>
        <rect x="138" y="37" width="4" height="26" fill="#4c1d95"/>
        <g stroke="#4c1d95" stroke-width="1.5">
          <line x1="140" y1="37" x2="138" y2="43"/>
          <line x1="140" y1="46" x2="138" y2="52"/>
          <line x1="140" y1="55" x2="138" y2="61"/>
          <line x1="140" y1="63" x2="138" y2="63"/>
        </g>
        <polygon points="138,47 145,50 138,53" fill="#4c1d95"/>
        <text x="85" y="80" text-anchor="middle" font-size="9" fill="#7c3aed" font-family="Inter">環形刀刃 · 完美平底盲孔</text>`
    },
    {
      id: 'countersink', name: '埋頭鑽', color: '#b45309',
      material: '木材 · 金屬 · 塑膠（螺絲沉頭槽）',
      rpm: '中速（600–1500 RPM）', tip: '錐形複合切刃（82°/90°）',
      desc: '同時完成導孔（中心細鑽）＋錐形擴孔，讓螺絲頭完全沉入材料表面形成「埋頭」效果。廣泛用於木材、鋁板和塑膠，讓結合面平整美觀不突出。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Countersink_bit.jpg/320px-Countersink_bit.jpg', caption: '埋頭鑽（Countersink bit）：錐形切刃讓螺絲頭齊平埋入', page: 'https://commons.wikimedia.org/wiki/File:Countersink_bit.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="8" y="44" width="90" height="12" rx="2" fill="#b45309"/>
        <polygon points="98,36 144,50 98,64" fill="#92400e"/>
        <line x1="108" y1="39" x2="140" y2="50" stroke="#78350f" stroke-width="1.2" opacity=".8"/>
        <line x1="108" y1="61" x2="140" y2="50" stroke="#78350f" stroke-width="1.2" opacity=".8"/>
        <polygon points="144,47 158,50 144,53" fill="#451a03"/>
        <text x="85" y="80" text-anchor="middle" font-size="9" fill="#b45309" font-family="Inter">錐形切刃 82° · 螺絲頭埋入齊平</text>`
    }
  ];

  const MAT = [
    { mat: '松木 / 軟木', bit: 'wood', rpm: '1200–2000', note: '順紋鑽，輕鬆排屑' },
    { mat: '硬木 / 合板', bit: 'wood', rpm: '800–1500', note: '深孔定時退屑' },
    { mat: 'MDF 密集板', bit: 'hss', rpm: '1000–2000', note: '粉塵多，戴口罩' },
    { mat: '鋼板 / 鐵管', bit: 'hss', rpm: '300–700', note: '加切削液降溫' },
    { mat: '鋁 / 銅', bit: 'hss', rpm: '600–1500', note: '可加機油冷卻' },
    { mat: '塑膠 / 壓克力', bit: 'hss', rpm: '600–1200', note: '慢速防龜裂' },
    { mat: '磚牆 / 混凝土', bit: 'masonry', rpm: '300–600', note: '配電鎚衝擊模式' },
    { mat: '木材大孔 >20mm', bit: 'spade', rpm: '600–1200', note: '低速防木材撕裂' },
    { mat: '鉸鏈槽 / 圓盲孔', bit: 'forstner', rpm: '200–800', note: '必須極低速，防焦黑' },
    { mat: '螺絲埋頭槽', bit: 'countersink', rpm: '600–1500', note: '一鑽搞定導孔+錐槽' },
  ];
  const BC = { hss: '#6b7280', wood: '#a16207', masonry: '#78716c', spade: '#0369a1', forstner: '#7c3aed', countersink: '#b45309' };
  const BN = { hss: 'HSS', wood: '木工', masonry: '磚石', spade: '鏟形', forstner: '平底', countersink: '埋頭' };

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🔩 鑽頭圖鑑</h3>
    <p class="muted" style="margin-bottom:16px">點擊 6 種鑽頭，查看剖面構造、適用材料與實物照片；下方速查表幫助快速選刀。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${BITS.map(b => `<button data-bit="${b.id}" style="flex:1;min-width:100px;padding:9px 6px;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;font-weight:700;font-size:12px;transition:all .2s;font-family:inherit;color:#374151">${b.name}</button>`).join('')}
    </div>
    <div id="drill-bit-detail" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選上方鑽頭類型查看詳情</p>
    </div>
    <h4 style="margin:22px 0 10px;font-size:14px;font-weight:700">📊 材料 × 鑽頭速查表</h4>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:var(--accent,#F59E0B);color:#fff">
          <th style="padding:8px 12px;text-align:left">材料</th>
          <th style="padding:8px 12px;text-align:left">鑽頭</th>
          <th style="padding:8px 12px;text-align:left">RPM 參考</th>
          <th style="padding:8px 12px;text-align:left">操作備註</th>
        </tr></thead>
        <tbody>${MAT.map((r, i) => `<tr style="background:${i%2?'#f8fafc':'#fff'}">
          <td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f1f5f9">${r.mat}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="background:${BC[r.bit]};color:#fff;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700">${BN[r.bit]}</span></td>
          <td style="padding:8px 12px;font-family:Inter,monospace;border-bottom:1px solid #f1f5f9">${r.rpm}</td>
          <td style="padding:8px 12px;color:#64748b;border-bottom:1px solid #f1f5f9">${r.note}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  sec.querySelectorAll('[data-bit]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('[data-bit]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; b.style.color='#374151'; });
      btn.style.background = 'var(--accent,#F59E0B)';
      btn.style.borderColor = 'var(--accent,#F59E0B)';
      btn.style.color = '#fff';
      const bit = BITS.find(b => b.id === btn.dataset.bit);
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      document.getElementById('drill-bit-detail').innerHTML = `
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
          <svg viewBox="0 0 180 90" style="width:180px;height:90px;flex-shrink:0;background:#1e293b;border-radius:8px;padding:4px">${bit.svg}</svg>
          <div style="flex:1;min-width:180px">
            <h4 style="margin:0 0 8px;font-size:15px">${bit.name}</h4>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;margin-bottom:10px">
              <span style="color:#64748b">適用材料</span><strong>${bit.material}</strong>
              <span style="color:#64748b">建議轉速</span><strong>${bit.rpm}</strong>
              <span style="color:#64748b">尖端特徵</span><strong>${bit.tip}</strong>
            </div>
            <p style="font-size:13px;color:#64748b;margin:0;line-height:1.6">${bit.desc}</p>
          </div>
        </div>
        <div style="margin-top:14px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;background:#f1f5f9;border-radius:10px;padding:12px">
          <img src="${bit.photo.url}" alt="${bit.photo.caption}" style="width:160px;height:auto;border-radius:6px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">
          <div style="flex:1;min-width:120px">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#374151">📷 實物照片</p>
            <p style="margin:0 0 6px;font-size:12px;color:#64748b">${bit.photo.caption}</p>
            <a href="${bit.photo.page}" target="_blank" rel="noopener" style="font-size:11px;color:#6366f1">🔗 ${bit.photo.license}</a>
          </div>
        </div>`;
    });
  });
})();

/* ── 功能旋鈕互動展示台 ──────────────────────────────── */
;(function () {
  const CS = 'background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px';
  const BS = 'padding:7px 10px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;border:2px solid #e2e8f0;background:#f8fafc;color:#374151;transition:all .2s';
  const BSA = 'background:var(--accent,#F59E0B);border-color:var(--accent,#F59E0B);color:#fff';

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="margin-bottom:6px">🎛️ 功能旋鈕互動展示台</h3>
    <p class="muted" style="margin-bottom:18px">點擊或切換各控制件，觀察手電鑽如何回應。</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

      <div style="${CS}">
        <div style="font-weight:700;font-size:14px">① 扭力環（離合器）</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap" id="torq-btns">
          ${[1,5,10,15,'🔩'].map(t=>`<button data-t="${t}" style="${BS};flex:1">${t}</button>`).join('')}
        </div>
        <svg viewBox="0 0 180 112" style="width:100%;background:#1e293b;border-radius:8px">
          <rect x="20" y="64" width="140" height="38" rx="3" fill="#a16207"/>
          <g opacity=".25"><line x1="20" y1="73" x2="160" y2="73" stroke="#fff" stroke-width="1"/><line x1="20" y1="82" x2="160" y2="82" stroke="#fff" stroke-width="1"/><line x1="20" y1="91" x2="160" y2="91" stroke="#fff" stroke-width="1"/></g>
          <rect x="87" y="64" width="6" height="38" fill="#78350f"/>
          <line x1="20" y1="64" x2="160" y2="64" stroke="#fbbf24" stroke-width="1.5"/>
          <g id="torq-screw">
            <rect x="83" y="46" width="14" height="5" rx="1" fill="#94a3b8"/>
            <line x1="90" y1="46" x2="90" y2="50" stroke="#64748b" stroke-width="2"/>
            <rect x="88" y="51" width="4" height="14" fill="#94a3b8"/>
            <line x1="86" y1="54" x2="92" y2="58" stroke="#64748b" stroke-width=".8"/>
            <line x1="86" y1="59" x2="92" y2="63" stroke="#64748b" stroke-width=".8"/>
          </g>
          <g id="torq-clutch" display="none">
            <circle cx="90" cy="57" r="20" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5 3"/>
            <text x="90" y="18" text-anchor="middle" font-size="9" fill="#fbbf24" font-family="Inter">⚡ 跳脫！</text>
          </g>
          <text id="torq-lock" x="90" y="18" text-anchor="middle" font-size="9" fill="#ef4444" font-family="Inter,sans-serif" display="none">🔒 離合器鎖死</text>
        </svg>
        <p id="torq-note" style="font-size:12px;color:#64748b;min-height:30px">← 點選扭力數值查看螺絲深度</p>
      </div>

      <div style="${CS}">
        <div style="font-weight:700;font-size:14px">② 速度板機（無段變速）</div>
        <div style="display:flex;gap:8px">
          <button id="speed-press" style="${BS};flex:1">👇 按住板機</button>
          <button id="speed-release" style="${BS};flex:1">✋ 放開板機</button>
        </div>
        <svg viewBox="0 0 180 112" style="width:100%;background:#1e293b;border-radius:8px">
          <path d="M 25 82 A 65 65 0 0 1 155 82" fill="none" stroke="#334155" stroke-width="18" stroke-linecap="round"/>
          <path id="speed-arc" d="M 25 82 A 65 65 0 0 1 155 82" fill="none" stroke="#f97316" stroke-width="18" stroke-linecap="round" stroke-dasharray="0 204"/>
          <text x="22" y="98" font-size="8" fill="#475569" font-family="Inter">0</text>
          <text x="85" y="28" text-anchor="middle" font-size="8" fill="#475569" font-family="Inter">1000</text>
          <text x="148" y="98" font-size="8" fill="#475569" font-family="Inter">2K</text>
          <line id="speed-needle" x1="90" y1="82" x2="25" y2="82" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="90" cy="82" r="14" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <circle cx="90" cy="82" r="5" fill="#374151"/>
          <line id="chuck-line" x1="90" y1="68" x2="90" y2="82" stroke="#fbbf24" stroke-width="2"/>
          <text id="speed-rpm" x="90" y="108" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="Inter">0 RPM</text>
        </svg>
        <p id="speed-note" style="font-size:12px;color:#64748b;min-height:30px">← 按住板機可無段加速至 2000 RPM</p>
      </div>

      <div style="${CS}">
        <div style="font-weight:700;font-size:14px">③ 正逆轉開關（F/R）</div>
        <button id="rev-toggle" style="${BS};width:100%">切換方向（目前：🟢 FWD 正轉）</button>
        <svg viewBox="0 0 180 112" style="width:100%;background:#1e293b;border-radius:8px">
          <circle cx="90" cy="58" r="32" fill="#374151" stroke="#475569" stroke-width="2"/>
          <circle cx="90" cy="58" r="9" fill="#1e293b"/>
          <g id="rev-fwd">
            <path d="M 68 34 A 30 30 0 1 1 112 34" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
            <polygon points="114,27 118,40 106,37" fill="#22c55e"/>
          </g>
          <g id="rev-rev" display="none">
            <path d="M 112 34 A 30 30 0 1 0 68 34" fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>
            <polygon points="66,27 62,40 74,37" fill="#f97316"/>
          </g>
          <text id="rev-lbl" x="90" y="62" text-anchor="middle" font-size="12" fill="#22c55e" font-family="Inter,sans-serif" font-weight="800">FWD</text>
          <text id="rev-use" x="90" y="106" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="Inter">鑽孔 / 鎖螺絲</text>
        </svg>
        <p id="rev-note" style="font-size:12px;color:#64748b;min-height:30px">FWD：鑽孔、鎖螺絲。REV：退鑽、拆螺絲。</p>
      </div>

      <div style="${CS}">
        <div style="font-weight:700;font-size:14px">④ 模式選擇</div>
        <div style="display:flex;gap:5px">
          <button data-mode="drill" style="${BS};flex:1;font-size:11px">🔩 鑽孔</button>
          <button data-mode="driver" style="${BS};flex:1;font-size:11px">🪛 起子</button>
          <button data-mode="hammer" style="${BS};flex:1;font-size:11px">⚡ 電鎚</button>
        </div>
        <svg id="mode-svg" viewBox="0 0 180 112" style="width:100%;background:#1e293b;border-radius:8px">
          <text x="90" y="60" text-anchor="middle" font-size="11" fill="#64748b" font-family="Noto Sans TC,sans-serif">← 選擇操作模式</text>
        </svg>
        <p id="mode-note" style="font-size:12px;color:#64748b;min-height:30px">依材料與任務選擇正確模式。</p>
      </div>

    </div>
  `;

  const nav2 = document.querySelector('.module-nav-bottom');
  if (nav2) nav2.parentNode.insertBefore(sec, nav2);

  /* ① 扭力環 */
  const TORQ_D = { '1': 0, '5': 10, '10': 22, '15': 34, '🔩': 46 };
  const TORQ_N = {
    '1':  '扭力 1：石膏板 / 薄板——離合器立即跳脫，防螺絲穿頭崩牙。',
    '5':  '扭力 5：薄夾板——中等扭力鎖入，一般薄板螺絲適用。',
    '10': '扭力 10：實木——深度鎖入，適合結構木螺絲。',
    '15': '扭力 15：硬木 / 厚板——高阻力場景，到位後跳脫。',
    '🔩': '🔩 鑽孔模式：離合器完全鎖死，全力輸出，純鑽孔用（不跳脫）。',
  };
  sec.querySelectorAll('#torq-btns [data-t]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('#torq-btns [data-t]').forEach(b => { b.style.cssText = BS; b.style.flex = '1'; });
      btn.style.cssText = BS + ';' + BSA; btn.style.flex = '1';
      const t = btn.dataset.t;
      const d = TORQ_D[t] ?? 0;
      const screw = document.getElementById('torq-screw');
      if (screw) screw.setAttribute('transform', `translate(0,${d})`);
      const clutch = document.getElementById('torq-clutch');
      if (clutch) clutch.setAttribute('display', t === '🔩' ? 'none' : 'inline');
      const lock = document.getElementById('torq-lock');
      if (lock) lock.setAttribute('display', t === '🔩' ? 'inline' : 'none');
      const note = document.getElementById('torq-note');
      if (note) note.textContent = TORQ_N[t] || '';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    });
  });

  /* ② 速度板機 */
  let rpm = 0, speedTimer = null, chkAng = 0;
  function updateSpeed() {
    const r = rpm / 2000;
    const needle = document.getElementById('speed-needle');
    if (needle) needle.setAttribute('transform', `rotate(${-90 + r * 180} 90 82)`);
    const arc = document.getElementById('speed-arc');
    if (arc) arc.setAttribute('stroke-dasharray', `${r * 204} 204`);
    const rpmTxt = document.getElementById('speed-rpm');
    if (rpmTxt) rpmTxt.textContent = `${Math.round(rpm)} RPM`;
    chkAng = (chkAng + r * 22) % 360;
    const cl = document.getElementById('chuck-line');
    if (cl) cl.setAttribute('transform', `rotate(${chkAng} 90 82)`);
  }
  sec.querySelector('#speed-press')?.addEventListener('click', () => {
    if (speedTimer) return;
    speedTimer = setInterval(() => { rpm = Math.min(2000, rpm + 120); updateSpeed(); if (rpm >= 2000) clearInterval(speedTimer); }, 50);
    const n = document.getElementById('speed-note');
    if (n) n.textContent = '板機扣得越深，轉速越高；到底全速 2000 RPM。';
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  });
  sec.querySelector('#speed-release')?.addEventListener('click', () => {
    clearInterval(speedTimer); speedTimer = null;
    const d = setInterval(() => { rpm = Math.max(0, rpm - 160); updateSpeed(); if (rpm <= 0) clearInterval(d); }, 40);
    const n = document.getElementById('speed-note');
    if (n) n.textContent = '放開板機後馬達立即減速停轉（無段變速優勢：隨時精準控制）。';
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  });

  /* ③ 正逆轉 */
  let isRev = false;
  sec.querySelector('#rev-toggle')?.addEventListener('click', () => {
    isRev = !isRev;
    document.getElementById('rev-fwd')?.setAttribute('display', isRev ? 'none' : 'inline');
    document.getElementById('rev-rev')?.setAttribute('display', isRev ? 'inline' : 'none');
    const lbl = document.getElementById('rev-lbl');
    const use = document.getElementById('rev-use');
    const btn = sec.querySelector('#rev-toggle');
    if (isRev) {
      if (lbl) { lbl.textContent = 'REV'; lbl.setAttribute('fill', '#f97316'); }
      if (use) use.textContent = '退鑽 / 拆螺絲';
      if (btn) btn.textContent = '切換方向（目前：🟠 REV 反轉）';
      document.getElementById('rev-note').textContent = 'REV（反轉）：退出卡住的鑽頭，或拆卸螺絲。中間位置可鎖定扳機防誤觸。';
    } else {
      if (lbl) { lbl.textContent = 'FWD'; lbl.setAttribute('fill', '#22c55e'); }
      if (use) use.textContent = '鑽孔 / 鎖螺絲';
      if (btn) btn.textContent = '切換方向（目前：🟢 FWD 正轉）';
      document.getElementById('rev-note').textContent = 'FWD（正轉）：鑽孔 / 鎖螺絲。REV（反轉）：退鑽 / 拆螺絲。';
    }
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  });

  /* ④ 模式選擇 */
  const MODE_SVG = {
    drill: `<rect x="82" y="20" width="16" height="36" rx="2" fill="#9ca3af"/>
      <polygon points="82,56 98,56 90,72" fill="#6b7280"/>
      <path d="M 55 48 A 38 38 0 0 1 125 48" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6 3"/>
      <path d="M 125 48 A 38 38 0 0 1 55 48" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6 3"/>
      <polygon points="55,41 49,52 62,50" fill="#22c55e"/>
      <polygon points="125,55 131,44 118,46" fill="#22c55e"/>
      <rect x="22" y="84" width="136" height="18" rx="2" fill="#a16207"/>
      <text x="90" y="108" text-anchor="middle" font-size="9" fill="#22c55e" font-family="Inter">連續旋轉 · 木材/金屬鑽孔</text>`,
    driver: `<rect x="86" y="22" width="8" height="36" rx="1" fill="#9ca3af"/>
      <rect x="80" y="56" width="20" height="5" rx="1" fill="#6b7280"/>
      <path d="M 58 46 A 34 34 0 0 1 122 46" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
      <polygon points="58,39 52,50 65,48" fill="#3b82f6"/>
      <circle cx="90" cy="48" r="24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="90" y="22" text-anchor="middle" font-size="8" fill="#fbbf24" font-family="Inter">離合器限扭跳脫</text>
      <rect x="22" y="84" width="136" height="18" rx="2" fill="#a16207"/>
      <rect x="87" y="61" width="6" height="23" fill="#94a3b8"/>
      <text x="90" y="108" text-anchor="middle" font-size="9" fill="#3b82f6" font-family="Inter">旋轉 + 限扭跳脫 · 鎖螺絲</text>`,
    hammer: `<rect x="86" y="18" width="8" height="32" rx="1" fill="#9ca3af"/>
      <polygon points="82,50 98,50 90,64" fill="#6b7280"/>
      <g stroke="#ef4444" stroke-width="2.5"><polyline points="64,22 72,30 64,38 72,46"/><polyline points="116,22 108,30 116,38 108,46"/></g>
      <path d="M 60 44 A 32 32 0 0 1 120 44" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="5 3"/>
      <polygon points="60,37 54,48 67,46" fill="#f97316"/>
      <rect x="22" y="84" width="136" height="18" rx="2" fill="#6b7280"/>
      <g opacity=".5"><line x1="48" y1="88" x2="48" y2="98" stroke="#9ca3af" stroke-width="1"/><line x1="90" y1="88" x2="90" y2="98" stroke="#9ca3af" stroke-width="1"/><line x1="132" y1="88" x2="132" y2="98" stroke="#9ca3af" stroke-width="1"/></g>
      <text x="90" y="108" text-anchor="middle" font-size="9" fill="#ef4444" font-family="Inter">旋轉+衝擊 · 磚牆混凝土</text>`,
  };
  const MODE_NOTE = {
    drill:  '鑽孔模式（🔩）：連續旋轉，無衝擊。扭力環轉到鑽頭圖示 = 離合器鎖死，全力輸出。適合木材、金屬、塑膠。',
    driver: '起子模式：旋轉鎖螺絲，到達設定扭力後「咔」一聲跳脫自動停止，防止螺絲頭擰爛。',
    hammer: '電鎚模式（⚡）：旋轉 + 高頻軸向衝擊，專為混凝土、磚牆設計。必須搭配碳化鎢磚石鑽頭，切勿用於磁磚（龜裂）。',
  };
  sec.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('[data-mode]').forEach(b => { b.style.cssText = BS; b.style.flex = '1'; b.style.fontSize = '11px'; });
      btn.style.cssText = BS + ';' + BSA; btn.style.flex = '1'; btn.style.fontSize = '11px';
      const m = btn.dataset.mode;
      const sv = document.getElementById('mode-svg');
      if (sv && MODE_SVG[m]) sv.innerHTML = MODE_SVG[m];
      const mn = document.getElementById('mode-note');
      if (mn) mn.textContent = MODE_NOTE[m] || '';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    });
  });

})();
