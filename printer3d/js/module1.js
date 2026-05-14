// 3D 印表機 模組 1：認識部件
const PARTS = {
  nozzle: { name: '噴嘴（Nozzle）', role: 'NOZZLE TIP', desc: '熔融塑料絲（filament）從噴嘴擠出的位置。標準孔徑 0.4mm，會影響細節度與列印速度。較細孔徑（0.2mm）細節好但慢；較大（0.6–0.8mm）速度快但粗糙。', fact: '噴嘴是耗材，會磨損。黃銅噴嘴印一般 PLA/PETG 建議 300–600 小時更換；硬化鋼噴嘴印含碳/含金屬磨料絲可延長至 1000+ 小時（All3DP）。' },
  hotend: { name: '加熱頭（Hot-End）', role: 'HEATER BLOCK', desc: '把絲線加熱到熔融狀態的金屬塊，內含加熱棒與熱敏電阻。常見溫度：PLA 190–220°C、PETG 230–250°C、ABS 240–260°C。', fact: '加熱頭旁邊一定要有散熱風扇，否則熱會傳到上方造成「堵料」。' },
  bed: { name: '加熱平台（Heated Bed）', role: 'HEATED BUILD PLATE', desc: '列印物件附著的平面。可加熱以幫助第一層附著（PLA 約 60°C，ABS 約 100°C）。表面材質：玻璃、PEI 板、磁性彈簧鋼板等。', fact: '熱床平整度是列印成功的最大關鍵。每次列印前都要校正。' },
  'x-axis': { name: 'X 軸（Carriage）', role: 'HORIZONTAL TRAVEL', desc: '帶動噴頭左右移動的橫桿。透過皮帶 + 步進馬達精確定位。', fact: 'X 軸皮帶鬆動會造成「Z 紋」（垂直波浪紋）瑕疵。' },
  'z-axis': { name: 'Z 軸（Vertical Lift）', role: 'LAYER HEIGHT', desc: '控制噴頭上下移動的螺桿（梯形螺桿或滾珠螺桿）。每列印完一層就上升一個「層厚」（通常 0.1–0.3mm）。', fact: 'Z 軸校正不準會讓首層過鬆（黏不住）或過緊（壓扁絲線堵住噴嘴）。' },
  extruder: { name: '擠出機（Extruder）', role: 'FILAMENT FEEDER', desc: '把絲線推進加熱頭的馬達 + 齒輪組。分兩種：直接式（Direct，在噴頭旁）和近端式（Bowden，馬達在框架上用管子送料）。', fact: '近端式速度快但回抽（避免漏料）效果差；直接式列印 PETG、TPU 等軟料較佳。' },
  filament: { name: '絲線（Filament）', role: 'PRINTING MATERIAL', desc: 'PLA 是最常見、最容易列印的材料（玉米澱粉製、低毒、低溫）。其他常見：PETG（耐用）、ABS（強度高但有毒煙）、TPU（軟性）。直徑 1.75mm 為主流。', fact: 'PLA 收到雜質或受潮會「啵啵」響、列印表面有氣泡。要密封防潮保存。' },
  lcd: { name: '控制面板 / LCD', role: 'CONTROL INTERFACE', desc: '顯示列印進度、溫度、剩餘時間。可手動調整溫度、Z 高度（baby step）、暫停 / 繼續、緊急停止。', fact: '緊急按下「停止」按鈕時，噴頭會停在當前位置，不會自動歸位，要手動移開避免熔毀模型。' },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'printer3d_progress_v1';
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
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)"><strong style="color:var(--accent)">💡 冷知識：</strong>${p.fact}</div>`;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncUI();
    const prog = loadP();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 所有部件都認識完畢！', 'good');
    }
    saveP(prog);
  }
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id));
}
document.querySelectorAll('.hotspot-group').forEach(g => g.addEventListener('click', () => render(g.dataset.id)));
document.querySelectorAll('.part-chip').forEach(c => c.addEventListener('click', () => render(c.dataset.id)));

// ========================
// 列印失敗圖鑑（模組 1 延伸互動）
// ========================
(function() {
  const FAILS = [
    {
      id: 'warp', name: '翹曲（Warping）', icon: '↗', color: '#dc2626',
      svg: `<rect x="30" y="128" width="240" height="45" fill="#16a34a"/>
        <path d="M 30 128 Q 80 108 140 124 Q 200 136 270 110" stroke="#dc2626" stroke-width="3.5" fill="none" stroke-dasharray="6 3"/>
        <path d="M 30 128 L 30 152 L 95 152 Q 78 128 30 128 Z" fill="#86efac" opacity=".6"/>
        <text x="150" y="96" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="700">角落翹起脫離熱床</text>
        <line x1="150" y1="100" x2="200" y2="115" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/>`,
      cause: '熱床溫度不足 / 材料冷卻過快收縮 / 首層沒壓實。ABS 收縮率約 0.8%，翹曲最嚴重；PLA 約 0.3%，較輕微。',
      fix: '① 熱床升溫（PLA: 60°C, ABS: 100°C） ② 塗固體膠棒或噴 ABS 汁 ③ 切片加 Brim（裙邊） ④ 降低散熱風扇轉速 ⑤ 使用封閉式機箱印 ABS'
    },
    {
      id: 'string', name: '拉絲（Stringing）', icon: '〰', color: '#d97706',
      svg: `<rect x="80" y="75" width="38" height="100" fill="#64748b"/>
        <rect x="182" y="55" width="38" height="120" fill="#64748b"/>
        <path d="M 118 128 Q 160 118 182 113" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 2"/>
        <path d="M 118 140 Q 163 127 182 122" stroke="#fbbf24" stroke-width="1" stroke-dasharray="2 3"/>
        <path d="M 118 114 Q 155 106 182 103" stroke="#fbbf24" stroke-width="0.8" stroke-dasharray="2 4"/>
        <path d="M 118 152 Q 165 140 182 135" stroke="#fde68a" stroke-width="0.6" stroke-dasharray="2 5"/>
        <text x="150" y="45" text-anchor="middle" font-size="12" fill="#d97706" font-weight="700">空中牽出細絲</text>`,
      cause: '噴頭移動時絲料從噴嘴漏出，在空中拉出細絲。通常是列印溫度過高或「回抽（retraction）」設定不足。',
      fix: '① 降低列印溫度 5–10°C ② 增大回抽距離（Bowden 管: 4–7mm；直接式: 1–2mm） ③ 增加回抽速度（40–60 mm/s） ④ 增加移頭速度'
    },
    {
      id: 'shift', name: '層位移（Layer Shift）', icon: '↔', color: '#7c3aed',
      svg: `<rect x="80" y="148" width="130" height="28" fill="#475569"/>
        <rect x="80" y="118" width="130" height="28" fill="#64748b"/>
        <rect x="126" y="88" width="130" height="28" fill="#94a3b8"/>
        <rect x="126" y="58" width="130" height="28" fill="#cbd5e1"/>
        <line x1="80" y1="148" x2="126" y2="88" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 3"/>
        <line x1="210" y1="148" x2="256" y2="88" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 3"/>
        <text x="155" y="45" text-anchor="middle" font-size="12" fill="#7c3aed" font-weight="700">每層偏移一段距離</text>`,
      cause: '步進馬達「失步」— 皮帶過鬆 / 加速度太高 / 列印中撞到物件 / 馬達電流不足。',
      fix: '① 鎖緊或更換 X/Y 皮帶 ② 降低加速度（Acceleration: 2000→1000 mm/s²） ③ 降低列印速度 ④ 確認運動軸沒有異物阻礙'
    },
    {
      id: 'firstlayer', name: '首層不附著', icon: '✕', color: '#0891b2',
      svg: `<rect x="30" y="148" width="240" height="25" fill="#16a34a"/>
        <g stroke="#0891b2" stroke-width="2" fill="#bfdbfe" fill-opacity=".5">
          <ellipse cx="75" cy="147" rx="20" ry="7"/>
          <ellipse cx="125" cy="145" rx="18" ry="6"/>
          <ellipse cx="178" cy="148" rx="22" ry="8"/>
          <ellipse cx="232" cy="146" rx="17" ry="6"/>
        </g>
        <text x="150" y="130" text-anchor="middle" font-size="12" fill="#0891b2" font-weight="700">絲料浮起、未壓實</text>`,
      cause: 'Z 軸原點偏高，噴頭離熱床太遠，首層沒被壓入表面。熱床不平整 / Baby Step 未調整 / 首層速度過快。',
      fix: '① 重新 Auto Level 或手動校正床平 ② Baby Step Z 微調 −0.05mm 直到首層壓扁如紙 ③ 首層速度降到 15–20 mm/s ④ 確認熱床溫度到位'
    }
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'print-fail-gallery';
  sec.innerHTML = `
    <h3>📋 列印失敗圖鑑</h3>
    <p class="muted" style="margin-bottom:16px">點擊每種失敗模式，查看成因分析與修復步驟。識別缺陷是提升列印成功率的關鍵能力。</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:18px">
      ${FAILS.map(f => `<button data-fail="${f.id}" style="padding:14px 8px;border:2px solid #e2e8f0;border-radius:12px;cursor:pointer;background:#fff;text-align:center;font-size:12px;font-weight:700;font-family:inherit;transition:all .2s;color:#374151">
        <div style="font-size:22px;margin-bottom:6px">${f.icon}</div>
        <div>${f.name}</div>
      </button>`).join('')}
    </div>
    <div id="fail-detail" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選失敗類型查看成因與修復</p>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  sec.querySelectorAll('[data-fail]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('[data-fail]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; b.style.color='#374151'; });
      const f = FAILS.find(x => x.id === btn.dataset.fail);
      btn.style.background = f.color; btn.style.borderColor = f.color; btn.style.color = '#fff';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      document.getElementById('fail-detail').innerHTML = `
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
          <svg viewBox="0 0 300 180" style="width:220px;height:132px;flex-shrink:0;background:#0f172a;border-radius:8px">${f.svg}</svg>
          <div style="flex:1;min-width:200px">
            <h4 style="margin:0 0 10px;font-size:15px;color:${f.color}">${f.name}</h4>
            <div style="margin-bottom:12px">
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#64748b">🔍 成因</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#374151">${f.cause}</p>
            </div>
            <div style="background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:10px 12px">
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#16a34a">🔧 修復步驟</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#374151">${f.fix}</p>
            </div>
          </div>
        </div>`;
    });
  });
})();
