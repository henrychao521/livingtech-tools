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
// 鑽頭選擇器（模組 1 延伸互動）
// ========================
(function() {
  const BITS = [
    {
      id: 'hss', name: '高速鋼（HSS）', color: '#6b7280',
      material: '金屬 · 塑膠 · 木材（應急）',
      rpm: '高速（≤ 2000 RPM）', tip: '118° 磨尖',
      desc: '最通用的鑽頭。尖端 118° 切削角，鑽鋼鐵、鋁、銅、塑膠都適合。鑽木材不如木工鑽頭精確，但能應急。刀刃呈螺旋排屑槽。',
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
      id: 'masonry', name: '碳化鎢（磚石）', color: '#78716c',
      material: '磚牆 · 混凝土 · 磁磚',
      rpm: '低速（300–600 RPM）', tip: '壓製碳化鎢硬頭',
      desc: '前端為壓製燒結碳化鎢（YG8），硬度極高。配電鎚模式（旋轉＋衝擊）才能有效打磚牆。鑽木材或金屬完全無效，且尖頭會快速崩裂。',
      svg: `<rect x="10" y="44" width="120" height="12" rx="2" fill="#78716c"/>
        <polygon points="130,41 150,44 150,56 130,59" fill="#a8a29e"/>
        <rect x="132" y="44" width="16" height="12" fill="#d4d4aa"/>
        <polygon points="150,44 168,50 150,56" fill="#c4b5a0"/>
        <line x1="136" y1="48" x2="146" y2="48" stroke="#92400e" stroke-width="1"/>
        <line x1="136" y1="52" x2="146" y2="52" stroke="#92400e" stroke-width="1"/>
        <text x="85" y="78" text-anchor="middle" font-size="9" fill="#78716c" font-family="Inter">碳化鎢硬頭 · 配衝擊模式</text>`
    }
  ];

  const MAT = [
    { mat: '松木 / 軟木', bit: 'wood', rpm: '1200–2000', note: '順紋鑽' },
    { mat: '硬木 / 合板', bit: 'wood', rpm: '800–1500', note: '深孔定時退屑' },
    { mat: 'MDF 密集板', bit: 'hss', rpm: '1000–2000', note: '粉塵多，戴口罩' },
    { mat: '鋼板 / 鐵管', bit: 'hss', rpm: '300–700', note: '加切削液降溫' },
    { mat: '鋁 / 銅', bit: 'hss', rpm: '600–1500', note: '可加機油冷卻' },
    { mat: '塑膠 / 壓克力', bit: 'hss', rpm: '600–1200', note: '慢速防龜裂' },
    { mat: '磚牆 / 混凝土', bit: 'masonry', rpm: '300–600', note: '配電鎚衝擊模式' },
  ];
  const BC = { hss: '#6b7280', wood: '#a16207', masonry: '#78716c' };
  const BN = { hss: 'HSS', wood: '木工', masonry: '磚石' };

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🔩 鑽頭選擇器</h3>
    <p class="muted" style="margin-bottom:16px">點擊三種鑽頭，查看截面構造與適用材料；下方速查表幫助快速選刀。</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
      ${BITS.map(b => `<button data-bit="${b.id}" style="flex:1;min-width:110px;padding:10px 8px;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;font-weight:700;font-size:13px;transition:all .2s;font-family:inherit;color:#374151">${b.name}</button>`).join('')}
    </div>
    <div id="drill-bit-detail" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選上方鑽頭類型查看詳情</p>
    </div>
    <h4 style="margin:22px 0 10px;font-size:14px;font-weight:700">📊 材料 × 鑽頭速查表</h4>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:var(--accent,#7C3AED);color:#fff">
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
      btn.style.background = 'var(--accent,#7C3AED)';
      btn.style.borderColor = 'var(--accent,#7C3AED)';
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
        </div>`;
    });
  });
})();
