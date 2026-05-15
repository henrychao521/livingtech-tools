// 鑽床 模組 1：認識部件
const PARTS = {
  spindle: { name: '主軸（Spindle）', role: 'ROTATION SHAFT', desc: '由皮帶驅動的垂直旋轉軸，下端鎖夾頭。主軸上下位置由進刀手柄控制，可精準達到 90° 垂直鑽孔——這是鑽床和手電鑽最大差別。', fact: '主軸轉速由皮帶輪位置決定，常見有 5 段（如 500/720/1100/1700/2400 RPM）。鑽鋼用最低、鑽木用最高。' },
  chuck: { name: '夾頭（Keyed Chuck）', role: 'BIT HOLDER', desc: '鑽床多為「鑰匙式夾頭」（chuck key），用 T 型小工具旋轉鎖緊三爪。可鎖到比免鑰匙式更緊，適合大直徑鑽孔。', fact: '⚠ 開機前一定要把夾頭鑰匙拔下！沒拔的鑰匙會被甩飛——是鑽床最危險的事故之一。' },
  table: { name: '工作檯（Table）', role: 'WORK PLATFORM', desc: '放工件的鑄鐵平台。可上下調整高度（鬆開後方鎖具搖動）、也可向左右傾斜做斜角鑽孔。表面有「T 槽」可裝機台老虎鉗或夾具。', fact: '工件下方必須墊木塊（犧牲層），避免鑽穿後把工作檯也鑽出洞。' },
  feed: { name: '進刀手柄（Feed Handle）', role: 'DOWNFEED CONTROL', desc: '3 支放射狀手柄，控制主軸下降進行鑽孔。順時針旋轉 = 下降進刀、逆時針 = 上升退鑽。多數鑽床有「進刀深度限位環」可設定鑽孔深度。', fact: '進刀力要均勻，不能突然用力——突然壓會讓鑽頭斷裂或工件彈起。' },
  motor: { name: '馬達（Motor）', role: 'POWER UNIT', desc: '位於頭部後方的電動機，常見 250–550W。透過皮帶把動力傳到主軸。長時間連續運轉會發熱——要讓馬達休息。', fact: '聞到焦味或聽到異音要立刻停機。馬達燒了維修費可能比機台還貴。' },
  belt: { name: '皮帶與皮帶輪（Belt & Pulley）', role: 'SPEED TRANSMISSION', desc: '透過 V 型皮帶在馬達與主軸的「階梯式皮帶輪」間傳動。把皮帶移到不同的皮帶輪組合，就改變主軸轉速。', fact: '更換皮帶位置前必須斷電。皮帶位置高 = 低速大扭力（鑽鋼）、皮帶位置低 = 高速（鑽木）。' },
  stop: { name: '緊急停止鈕（Emergency Stop）', role: 'E-STOP', desc: '大紅色按鈕，遇到危險時用手掌「拍下去」就能立刻切斷電源。多數鑽床的開關蓋是「拍下停、拉開啟」的設計。', fact: '操作前先確認緊急停止鈕的位置，意外時不用思考、直接拍。' },
  column: { name: '立柱（Column）', role: 'MAIN PILLAR', desc: '機台主結構，由鑄鐵或鋼管製成，連接基座、工作檯與頭部。立柱的剛性決定了鑽孔精度——便宜的機台搖晃會造成偏鑽。', fact: '工作檯的高度與旋轉位置都鎖在立柱上。要調整時先鬆開鎖具，調好再鎖緊。' },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'dpress_progress_v1';
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
// 皮帶輪轉速計算機（模組 1 延伸互動）
// ========================
(function() {
  const POSITIONS = [
    { pos: 1, rpm: 500,  label: '最低速 — 大扭力', color: '#dc2626', mat: '厚鋼板 / 硬鐵', tip: '鑽大孔徑硬金屬，務必加切削液降溫' },
    { pos: 2, rpm: 720,  label: '低速',             color: '#f97316', mat: '薄鋼 / 不鏽鋼', tip: '金屬鑽孔常用，兼顧速度與扭力' },
    { pos: 3, rpm: 1100, label: '中速',             color: '#eab308', mat: '鋁 / 銅 / 塑膠', tip: '有色金屬與硬塑膠首選，加少許機油' },
    { pos: 4, rpm: 1700, label: '中高速',           color: '#22c55e', mat: '合板 / 硬木',   tip: '木材常用段，排屑順暢，深孔定時退屑' },
    { pos: 5, rpm: 2400, label: '最高速',           color: '#06b6d4', mat: '軟木 / MDF',    tip: '小直徑 + 軟材，列印用小孔最快' },
  ];

  // Spindle pulley radii for each position (larger r = lower belt = higher RPM)
  const spRadii = { 1: [22, 16, 10, 5], 2: [18, 13, 8, 4], 3: [15, 11, 7, 3], 4: [12, 9, 6, 3], 5: [10, 7, 4, 2] };

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'belt-rpm';
  sec.innerHTML = `
    <h3>⚙️ 皮帶輪轉速計算機</h3>
    <p class="muted" style="margin-bottom:16px">鑽床轉速由皮帶在「階梯式皮帶輪」的位置決定。點選段位查看對應 RPM 與適用材料。</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-bottom:18px;flex-wrap:wrap">
      ${POSITIONS.map(p => `<button data-pos="${p.pos}" style="padding:12px 18px;border:3px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;font-weight:900;font-size:16px;font-family:Inter,sans-serif;transition:all .2s;color:#374151;min-width:54px">P${p.pos}</button>`).join('')}
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div id="belt-rpm-result" style="flex:1;min-width:200px;background:#0f172a;border-radius:12px;padding:22px;min-height:130px">
        <p style="color:#94a3b8;margin:20px 0;font-size:13px;text-align:center">👆 點選 P1–P5 皮帶段位</p>
      </div>
      <svg viewBox="0 0 200 180" style="width:180px;height:160px;flex-shrink:0">
        <rect x="20" y="10" width="160" height="160" rx="8" fill="#1e293b"/>
        <text x="100" y="26" text-anchor="middle" font-size="10" fill="#64748b" font-weight="700" font-family="Inter">皮帶箱（內部俯視）</text>
        <!-- 馬達皮帶輪（左，4 階梯圓環） -->
        <g transform="translate(65,95)">
          <circle r="30" fill="#374151" stroke="#64748b" stroke-width="1.5"/>
          <circle r="23" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
          <circle r="15" fill="#334155" stroke="#64748b" stroke-width="1"/>
          <circle r="8" fill="#1e293b" stroke="#94a3b8" stroke-width="0.5"/>
          <circle r="3" fill="#64748b"/>
          <text x="0" y="4" text-anchor="middle" font-size="8" fill="#94a3b8" font-weight="700" font-family="Inter">馬達</text>
        </g>
        <!-- 主軸皮帶輪（右，變換大小） -->
        <g transform="translate(148,95)" id="sp-pulley">
          <circle id="sp-r1" r="20" fill="#374151" stroke="#64748b" stroke-width="1.5"/>
          <circle id="sp-r2" r="13" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
          <circle id="sp-r3" r="7" fill="#334155" stroke="#64748b" stroke-width="1"/>
          <circle id="sp-r4" r="3" fill="#1e293b"/>
          <text x="0" y="4" text-anchor="middle" font-size="8" fill="#94a3b8" font-weight="700" font-family="Inter">主軸</text>
        </g>
        <!-- 皮帶（兩條平行線） -->
        <line id="belt-line1" x1="95" y1="75" x2="128" y2="75" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
        <line id="belt-line2" x1="95" y1="115" x2="128" y2="115" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
      </svg>
    </div>
    <!-- 實物參考 -->
    <div style="margin-top:14px;display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;background:#f1f5f9;border-radius:10px;padding:12px">
      <div style="flex:1;min-width:200px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#374151">📖 皮帶換位操作參考</p>
        <p style="margin:0 0 6px;font-size:12px;color:#64748b">實際換位步驟：斷電 → 開皮帶箱蓋 → 鬆緊輪 → 移帶 → 重新上緊 → 蓋好箱蓋。換位前後一定要確認電源在 OFF。</p>
        <a href="https://www.instructables.com/How-to-Change-the-Speed-of-a-Drill-Press/" target="_blank" rel="noopener" style="font-size:11px;color:#6366f1">🔗 Instructables — How to Change the Speed of a Drill Press（附圖說明）</a>
      </div>
    </div>
    <!-- 材料×RPM 速查表 -->
    <h4 style="margin:22px 0 10px;font-size:14px;font-weight:700">📊 材料 × 轉速速查表</h4>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:var(--accent,#0891b2);color:#fff">
          <th style="padding:8px 12px;text-align:left">材料</th>
          <th style="padding:8px 12px;text-align:left">鑽頭直徑</th>
          <th style="padding:8px 12px;text-align:left">建議 RPM</th>
          <th style="padding:8px 12px;text-align:left">皮帶位置</th>
        </tr></thead>
        <tbody>${[
          { mat: '軟木 / 松木', dia: '≤ 10mm', rpm: '1700–2400', pos: 'P4–P5', bg: '#fff' },
          { mat: '硬木 / 合板', dia: '≤ 12mm', rpm: '1100–1700', pos: 'P3–P4', bg: '#f8fafc' },
          { mat: 'MDF 密集板', dia: '≤ 12mm', rpm: '1100–2400', pos: 'P3–P5', bg: '#fff' },
          { mat: '鋁 / 銅',    dia: '≤ 8mm',  rpm: '1100–1700', pos: 'P3–P4', bg: '#f8fafc' },
          { mat: '薄鋼板',     dia: '≤ 6mm',  rpm: '500–720',   pos: 'P1–P2', bg: '#fff' },
          { mat: '厚鋼板',     dia: '≤ 10mm', rpm: '500',        pos: 'P1',    bg: '#f8fafc' },
          { mat: '塑膠 / 壓克力', dia: '≤ 10mm', rpm: '720–1100', pos: 'P2–P3', bg: '#fff' },
        ].map(r => `<tr style="background:${r.bg}">
          <td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f1f5f9">${r.mat}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-family:Inter,monospace">${r.dia}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-family:Inter,monospace">${r.rpm}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>${r.pos}</strong></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  // Belt Y positions based on which step/layer the belt is on
  const beltY = { 1: [65, 125], 2: [72, 118], 3: [80, 110], 4: [87, 103], 5: [92, 98] };

  sec.querySelectorAll('[data-pos]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('[data-pos]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; b.style.color='#374151'; });
      const pos = POSITIONS.find(p => p.pos === parseInt(btn.dataset.pos));
      btn.style.background = pos.color;
      btn.style.borderColor = pos.color;
      btn.style.color = '#fff';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      document.getElementById('belt-rpm-result').innerHTML = `
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:46px;font-weight:900;font-family:Inter,monospace;color:${pos.color};line-height:1">${pos.rpm}</div>
          <div style="font-size:14px;color:#94a3b8;margin-top:4px">RPM — ${pos.label}</div>
        </div>
        <div style="background:rgba(255,255,255,.07);border-radius:8px;padding:10px;text-align:left">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8">適用材料</p>
          <p style="margin:0 0 8px;font-size:15px;color:#fff;font-weight:600">${pos.mat}</p>
          <p style="margin:0;font-size:12px;color:#94a3b8">${pos.tip}</p>
        </div>`;
      const [y1, y2] = beltY[pos.pos];
      const b1 = document.getElementById('belt-line1');
      const b2 = document.getElementById('belt-line2');
      if (b1) { b1.setAttribute('y1', y1); b1.setAttribute('y2', y1); b1.setAttribute('stroke', pos.color); }
      if (b2) { b2.setAttribute('y1', y2); b2.setAttribute('y2', y2); b2.setAttribute('stroke', pos.color); }
      // Adjust spindle radii to reflect which gear is active
      const r = spRadii[pos.pos];
      ['sp-r1','sp-r2','sp-r3','sp-r4'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('r', r[i]);
      });
    });
  });
})();

/* ── 鑽頭圖鑑（6 種）──────────────────────────────────── */
;(function () {
  const BITS = [
    {
      id: 'hss', name: 'HSS 高速鋼', color: '#6b7280',
      material: '鋼板 · 不鏽鋼 · 鋁 · 塑膠',
      belt: 'P1–P2（500–720 RPM）', tip: '118° 磨尖螺旋刃',
      desc: '最通用的金屬鑽頭，螺旋排屑槽讓切屑順暢排出。鑽鐵/鋼時建議加切削油冷卻降溫，延長鑽頭壽命。不適合木材（缺少中心定位尖）。',
      note: '鑽鋼必須用切削油，否則鑽頭在數分鐘內即因過熱而退火失硬。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg/320px-HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg', caption: 'HSS 鑽頭鑽削鋁材（施切削液）', page: 'https://commons.wikimedia.org/wiki/File:HSS_Twist_Drill_into_Aluminium_with_Lubricant.jpg', license: 'CC BY-SA 3.0 · Wikimedia Commons' },
      svg: `<rect x="10" y="43" width="140" height="14" rx="2" fill="#9ca3af"/>
        <g stroke="#4b5563" stroke-width="1" opacity=".7">
          <line x1="18" y1="43" x2="23" y2="57"/><line x1="30" y1="43" x2="35" y2="57"/>
          <line x1="42" y1="43" x2="47" y2="57"/><line x1="54" y1="43" x2="59" y2="57"/>
          <line x1="66" y1="43" x2="71" y2="57"/><line x1="78" y1="43" x2="83" y2="57"/>
          <line x1="90" y1="43" x2="95" y2="57"/><line x1="102" y1="43" x2="107" y2="57"/>
          <line x1="114" y1="43" x2="119" y2="57"/><line x1="126" y1="43" x2="131" y2="57"/>
        </g>
        <polygon points="150,43 170,50 150,57" fill="#4b5563"/>`,
    },
    {
      id: 'wood', name: '木工螺旋鑽頭', color: '#a16207',
      material: '木材 · 合板 · MDF',
      belt: 'P4–P5（1700–2400 RPM）', tip: '中心定位尖 + 螺旋刃',
      desc: '前端有銳利的中心定位尖，確保不偏鑽；外緣切刃先劃破木纖維，螺旋槽快速排出木屑。木材鑽孔首選，孔邊緣整潔。',
      note: '木工鑽頭遇金屬會立刻崩刃——材料混用前務必確認鑽頭種類。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Spade_bit.jpg/320px-Spade_bit.jpg', caption: '木工鑽頭（帶中心尖）', page: 'https://commons.wikimedia.org/wiki/File:Spade_bit.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="10" y="44" width="140" height="12" rx="2" fill="#d97706"/>
        <circle cx="155" cy="50" r="3" fill="#fbbf24"/>
        <polygon points="150,44 172,50 150,56" fill="#92400e"/>
        <line x1="152" y1="50" x2="172" y2="50" stroke="#fbbf24" stroke-width="1.5"/>`,
    },
    {
      id: 'masonry', name: '磚石碳化鎢鑽頭', color: '#57534e',
      material: '磚牆 · 混凝土 · 砂漿',
      belt: 'P1–P2（500–720 RPM）', tip: '壓製碳化鎢箭形頭',
      desc: '尖端為燒結碳化鎢（YG8），硬度極高，在鑽床上配合手動進刀對磚牆緩慢研磨穿孔。鑽床不具衝擊模式，效率不如電鎚鑽，但孔形更精確。',
      note: '鑽床無電鎚衝擊功能，磚石鑽頭鑽硬混凝土時效率有限，建議先用電鎚鑽預鑽再精修。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Hammer_drill_bits.jpg/320px-Hammer_drill_bits.jpg', caption: '磚石碳化鎢鑽頭組', page: 'https://commons.wikimedia.org/wiki/File:Hammer_drill_bits.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="10" y="44" width="140" height="12" rx="2" fill="#78716c"/>
        <polygon points="150,40 170,50 150,60" fill="#44403c"/>
        <polygon points="155,46 168,50 155,54" fill="#a8a29e"/>`,
    },
    {
      id: 'forstner', name: 'Forstner 平底鑽', color: '#7c3aed',
      material: '木材 · 夾板（鉸鏈槽 / 平底盲孔）',
      belt: 'P1–P2（500–720 RPM，必須低速）', tip: '環形切刃 + 中心定位尖',
      desc: '鑽床限定的高精度鑽頭。圓形切刃先劃破木纖維邊緣，底面完全平整——鉸鏈安裝座、榫孔等需要精確盲孔深度的場合不可取代。直徑常見 10–50mm。',
      note: '大直徑（>25mm）必須極低速（P1），否則側刃過熱焦黑；鑽孔中途暫停數次讓鑽頭冷卻。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Forstner_Bits.jpg/320px-Forstner_Bits.jpg', caption: 'Forstner 平底鑽頭組（多尺寸）', page: 'https://commons.wikimedia.org/wiki/File:Forstner_Bits.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="10" y="46" width="120" height="8" rx="2" fill="#8b5cf6"/>
        <rect x="130" y="34" width="28" height="32" rx="2" fill="#7c3aed"/>
        <rect x="133" y="37" width="4" height="26" fill="#a78bfa"/>
        <rect x="151" y="37" width="4" height="26" fill="#a78bfa"/>
        <line x1="144" y1="66" x2="144" y2="72" stroke="#5b21b6" stroke-width="3"/>
        <polygon points="140,72 148,72 144,78" fill="#5b21b6"/>`,
    },
    {
      id: 'step', name: '階梯鑽（Step Drill）', color: '#0369a1',
      material: '薄金屬板 · 鋁板 · 薄塑膠（多尺寸一次完成）',
      belt: 'P2–P3（720–1100 RPM）', tip: '錐形多階梯切刃',
      desc: '錐形鑽頭，每個台階對應一個孔徑（如 4/6/8/10/12mm）。在薄板上一支鑽頭就能完成多種孔徑，不需換鑽頭。鑽床固定進刀深度讓每個尺寸精確可控。',
      note: '階梯鑽只適合薄板（≤5mm），厚板上台階會打滑無法精確定位。進刀到目標台階即停，不要繼續往下。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Step_drill_bit.jpg/320px-Step_drill_bit.jpg', caption: '階梯鑽頭（單支多孔徑）', page: 'https://commons.wikimedia.org/wiki/File:Step_drill_bit.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="10" y="48" width="80" height="4" rx="1" fill="#0ea5e9"/>
        <polygon points="90,42 106,50 90,58" fill="#0369a1"/>
        <polygon points="106,44 118,50 106,56" fill="#0369a1"/>
        <polygon points="118,46 128,50 118,54" fill="#0369a1"/>
        <polygon points="128,47 136,50 128,53" fill="#0369a1"/>
        <polygon points="136,48 142,50 136,52" fill="#0284c7"/>
        <polygon points="142,49 147,50 142,51" fill="#0284c7"/>`,
    },
    {
      id: 'holesaw', name: '開孔器（Hole Saw）', color: '#b45309',
      material: '木板 · 石膏板 · 薄金屬（大孔 20–150mm）',
      belt: 'P1（500 RPM，最低速）', tip: '圓筒鋸齒 + 中心導鑽',
      desc: '圓形鋸齒筒切出大孔，中心有導鑽先定位。適合開關盒孔、管道穿牆孔等大直徑場合。鑽床固定了主軸方向，孔形比手持更圓更正。鑽木用雙金屬鋸齒，鑽金屬需加切削油。',
      note: '開孔器重量大、直徑大，鑽床才能安全操作。手電鑽開大孔容易偏轉傷人，建議在鑽床上進行。鑽完後先停機，再用起子撬出圓木塞。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hole_Saw_bits.jpg/320px-Hole_Saw_bits.jpg', caption: '開孔器（多尺寸）及導鑽', page: 'https://commons.wikimedia.org/wiki/File:Hole_Saw_bits.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="78" y1="50" x2="110" y2="50" stroke="#d97706" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="110,45 118,50 110,55" fill="#92400e"/>
        <ellipse cx="46" cy="50" rx="36" ry="22" fill="none" stroke="#b45309" stroke-width="6"/>
        <rect x="44" y="28" width="4" height="4" fill="#b45309"/>
        <rect x="44" y="68" width="4" height="4" fill="#b45309"/>
        <rect x="20" y="48" width="4" height="4" fill="#b45309"/>`,
    },
  ];

  const MAT = [
    { mat: '軟木 / 松木',   bit: 'wood',     belt: 'P4–P5', note: '高速快鑽，退屑頻繁' },
    { mat: '硬木 / 橡木',   bit: 'wood',     belt: 'P3–P4', note: '中速，分段退屑' },
    { mat: 'MDF 密集板',    bit: 'wood',     belt: 'P3–P5', note: '粉塵多，戴口罩' },
    { mat: '鋁 / 銅',       bit: 'hss',      belt: 'P2–P3', note: '可加機油，減少黏刃' },
    { mat: '薄鋼板 ≤3mm',   bit: 'hss',      belt: 'P1–P2', note: '必加切削油' },
    { mat: '厚鋼板 >3mm',   bit: 'hss',      belt: 'P1',    note: '最低速+大量切削油' },
    { mat: '塑膠 / 壓克力', bit: 'hss',      belt: 'P2–P3', note: '慢進刀防破裂' },
    { mat: '磚牆 / 砂漿',   bit: 'masonry',  belt: 'P1–P2', note: '無衝擊，純研磨' },
    { mat: '鉸鏈槽（盲孔）',bit: 'forstner', belt: 'P1–P2', note: '必須極低速+限位環' },
    { mat: '薄板多孔徑',    bit: 'step',     belt: 'P2–P3', note: '薄板限定（≤5mm）' },
    { mat: '管道穿牆大孔',  bit: 'holesaw',  belt: 'P1',    note: '最低速，鑽金屬加油' },
  ];

  const BN = { hss:'高速鋼', wood:'木工', masonry:'磚石', forstner:'平底', step:'階梯', holesaw:'開孔器' };
  const BC = { hss:'#6b7280', wood:'#a16207', masonry:'#57534e', forstner:'#7c3aed', step:'#0369a1', holesaw:'#b45309' };

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🔩 鑽頭圖鑑 <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px">點選查看詳細規格</span></h3>
    <p class="muted" style="margin-bottom:16px">鑽床比手電鑽更常搭配特殊鑽頭，選對鑽頭直接影響孔的品質與安全。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" id="dp-bit-tabs">
      ${BITS.map(b => `<button data-bit="${b.id}" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-weight:700;font-size:13px;transition:all .2s;color:#374151">${b.name}</button>`).join('')}
    </div>
    <div id="dp-bit-detail" style="background:#f8fafc;border-radius:12px;padding:18px;min-height:140px">
      <p style="color:#94a3b8;text-align:center;margin-top:24px">👆 點選上方鑽頭查看規格</p>
    </div>
    <h4 style="margin:22px 0 10px;font-size:14px;font-weight:700">📊 材料 × 鑽頭 × 皮帶段位速查</h4>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:var(--accent,#0891b2);color:#fff">
          <th style="padding:8px 12px;text-align:left">材料</th>
          <th style="padding:8px 12px;text-align:left">推薦鑽頭</th>
          <th style="padding:8px 12px;text-align:left">皮帶段位</th>
          <th style="padding:8px 12px;text-align:left">備注</th>
        </tr></thead>
        <tbody>${MAT.map((r, i) => `<tr style="background:${i%2?'#f8fafc':'#fff'}">
          <td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f1f5f9">${r.mat}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="background:${BC[r.bit]};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:700">${BN[r.bit]}</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-family:Inter,monospace;font-weight:700">${r.belt}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:12px">${r.note}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const detail = document.getElementById('dp-bit-detail');
  document.querySelectorAll('#dp-bit-tabs [data-bit]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dp-bit-tabs [data-bit]').forEach(b => {
        b.style.background = '#fff'; b.style.borderColor = '#e2e8f0'; b.style.color = '#374151';
      });
      const b = BITS.find(x => x.id === btn.dataset.bit);
      btn.style.background = b.color; btn.style.borderColor = b.color; btn.style.color = '#fff';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      detail.innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
          <div style="flex:1;min-width:220px">
            <h4 style="margin:0 0 4px;color:${b.color};font-size:17px">${b.name}</h4>
            <p style="margin:0 0 10px;font-size:12px;color:#64748b;font-weight:700;letter-spacing:.05em">${b.tip}</p>
            <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
              <span style="background:${b.color}18;color:${b.color};border-radius:6px;padding:3px 10px;font-size:12px;font-weight:700">📐 ${b.material}</span>
              <span style="background:#0f172a;color:#fff;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:700;font-family:Inter">⚙ ${b.belt}</span>
            </div>
            <p style="font-size:13px;color:#374151;margin:0 0 10px;line-height:1.7">${b.desc}</p>
            <div style="background:#fff7ed;border-left:3px solid #f97316;border-radius:6px;padding:10px 12px;font-size:12px;color:#92400e"><strong>⚠ 注意：</strong>${b.note}</div>
          </div>
          <div style="width:180px;flex-shrink:0">
            <svg viewBox="0 0 180 100" style="width:100%;border-radius:8px;background:#1e293b">${b.svg}</svg>
            <div style="margin-top:8px;border-radius:8px;overflow:hidden;background:#f1f5f9">
              <img src="${b.photo.url}" alt="${b.photo.caption}" style="width:100%;display:block;max-height:120px;object-fit:cover" onerror="this.style.display='none'">
              <p style="font-size:10px;color:#94a3b8;margin:4px 6px;line-height:1.4">${b.photo.caption}<br><a href="${b.photo.page}" target="_blank" rel="noopener" style="color:#3b82f6">${b.photo.license}</a></p>
            </div>
          </div>
        </div>`;
    });
  });
})();

/* ── 鑽床機型圖鑑 ─────────────────────────────────────── */
;(function () {
  const TYPES = [
    {
      id: 'benchtop',
      name: '桌上式鑽床',
      en: 'Benchtop Drill Press',
      icon: '🏫',
      color: '#0891b2',
      desc: '放置在工作台上的小型鑽床，高度約 60–80cm，馬達 250–370W。結構輕巧，移動方便，適合教室與家庭工坊。台灣國中生活科技課最常見的機型。',
      specs: [
        { k: '主軸方向', v: '垂直' },
        { k: '馬達功率', v: '250–370W' },
        { k: '最大鑽孔', v: '約 13–16mm（金屬）' },
        { k: '轉速段位', v: '通常 5 段' },
      ],
      bestFor: '教室教學、小工件、木材與薄金屬',
      warn: '高度較低，加工大型工件前先確認工作台能升降到合適高度。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Drill_press_01.jpg/320px-Drill_press_01.jpg', caption: '典型桌上式鑽床', license: 'CC BY-SA · Wikimedia Commons', page: 'https://commons.wikimedia.org/wiki/File:Drill_press_01.jpg' },
    },
    {
      id: 'floorstanding',
      name: '立式鑽床（落地式）',
      en: 'Floor-standing Column Drill Press',
      icon: '🏭',
      color: '#16a34a',
      desc: '直立在地面的全尺寸鑽床，高度 150–180cm，馬達 370–750W 以上。工作台可大幅上下移動，能容納較大的工件。職業訓練中心、技高工廠常見。',
      specs: [
        { k: '主軸方向', v: '垂直' },
        { k: '馬達功率', v: '370–750W+' },
        { k: '最大鑽孔', v: '約 16–32mm（金屬）' },
        { k: '轉速段位', v: '通常 5–12 段' },
      ],
      bestFor: '大型工件、職業訓練、工廠批量加工',
      warn: '機台重量達 50–120kg，搬移需要多人協作；緊急停止鈕一定要確認位置。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Drillpress.jpg/240px-Drillpress.jpg', caption: '落地式立式鑽床', license: 'CC BY-SA · Wikimedia Commons', page: 'https://commons.wikimedia.org/wiki/File:Drillpress.jpg' },
    },
    {
      id: 'horizontal',
      name: '臥式鑽床',
      en: 'Horizontal Drill Press',
      icon: '↔️',
      color: '#7c3aed',
      desc: '主軸水平放置，鑽頭從工件側面進刀。適合在軸材、長棒、圓管側面鑽孔，也用於加工需要水平孔的零件（如機械配件、門栓孔）。',
      specs: [
        { k: '主軸方向', v: '水平' },
        { k: '進刀方向', v: '左右（水平）' },
        { k: '特殊優勢', v: '長料側鑽不受重力干擾' },
        { k: '常見場合', v: '機械加工廠' },
      ],
      bestFor: '軸材側面孔、圓管穿孔、機械零件加工',
      warn: '工件必須水平夾緊，垂直重力不會幫助定位，固定工件更需謹慎。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Horizontal_boring_machine.jpg/320px-Horizontal_boring_machine.jpg', caption: '臥式鑽孔機（水平主軸）', license: 'CC BY-SA · Wikimedia Commons', page: 'https://commons.wikimedia.org/wiki/File:Horizontal_boring_machine.jpg' },
    },
    {
      id: 'radialarm',
      name: '搖臂鑽床',
      en: 'Radial Arm Drill Press',
      icon: '🔄',
      color: '#ea580c',
      desc: '主軸安裝在可以橫向移動的懸臂上，懸臂本身也能繞立柱旋轉。可以在不移動工件的情況下，讓鑽頭定位到大型板材的任意位置鑽孔，適合需要多孔定位的大型加工。',
      specs: [
        { k: '主軸方向', v: '垂直（可調角度）' },
        { k: '臂長',     v: '通常 600–2000mm' },
        { k: '特殊優勢', v: '鑽頭可橫移，工件不動' },
        { k: '常見場合', v: '大型工廠、鋼鐵加工' },
      ],
      bestFor: '大型板材多孔加工、工件不易搬移的場合',
      warn: '懸臂旋轉前必須先鎖緊，主軸未到定位就開機是危險操作。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Radial_Drilling_Machine.jpg/320px-Radial_Drilling_Machine.jpg', caption: '工業用搖臂鑽床', license: 'CC BY-SA · Wikimedia Commons', page: 'https://commons.wikimedia.org/wiki/File:Radial_Drilling_Machine.jpg' },
    },
    {
      id: 'mortiser',
      name: '腳鑿機（方鑿機）',
      en: 'Mortising Machine / Mortiser',
      icon: '⬛',
      color: '#92400e',
      desc: '鑽床的木工專用變型。刀具是「方形空心鑿」套著圓形鑽頭——鑽頭先鑽圓孔，空心鑿同步將四個角修成方形，一次完成方形孔（榫眼）。是傳統木工榫接結構的關鍵機器。',
      specs: [
        { k: '刀具型式', v: '方形空心鑿 + 內置鑽頭' },
        { k: '加工形式', v: '方形孔（榫眼）' },
        { k: '常見尺寸', v: '6mm / 9mm / 12mm / 16mm 方鑿' },
        { k: '常見場合', v: '木工教室、家具工廠' },
      ],
      bestFor: '木工榫眼、抽屜滑軌槽、木框架榫接',
      warn: '方鑿刀具必須成對更換（鑿 + 鑽頭），尺寸不匹配會導致刀具斷裂。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bench_mortiser.jpg/320px-Bench_mortiser.jpg', caption: '桌上型腳鑿機（方鑿機）', license: 'CC BY-SA · Wikimedia Commons', page: 'https://commons.wikimedia.org/wiki/File:Bench_mortiser.jpg' },
    },
  ];

  const COMPARE = [
    { label: '主軸方向',   vals: ['垂直', '垂直', '水平', '垂直(可調)', '垂直'] },
    { label: '機台位置',   vals: ['桌上', '落地', '落地', '落地', '桌上/落地'] },
    { label: '教室常見',   vals: ['⭐⭐⭐', '⭐⭐', '☆', '☆', '⭐（木工課）'] },
    { label: '最大工件',   vals: ['小', '中∼大', '長料側鑽', '大型板材', '木材'] },
    { label: '特殊功能',   vals: ['通用基礎', '大扭力', '側面鑽孔', '多孔定位', '方形榫眼'] },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';

  const cardsHtml = TYPES.map(t => `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;border-top:4px solid ${t.color}">
      <div style="height:140px;overflow:hidden;background:#f1f5f9;display:flex;align-items:center;justify-content:center">
        <img src="${t.photo.url}" alt="${t.photo.caption}"
          style="width:100%;height:140px;object-fit:cover;display:block"
          onerror="this.parentElement.innerHTML='<span style=font-size:48px>${t.icon}</span>'">
      </div>
      <div style="padding:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:20px">${t.icon}</span>
          <div>
            <h4 style="margin:0;font-size:15px;color:${t.color}">${t.name}</h4>
            <p style="margin:0;font-size:11px;color:#94a3b8;font-style:italic">${t.en}</p>
          </div>
        </div>
        <p style="font-size:12px;color:#374151;margin:0 0 10px;line-height:1.6">${t.desc}</p>
        <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">
          ${t.specs.map(s => `<div style="display:flex;gap:6px;font-size:11px"><span style="color:#94a3b8;min-width:64px">${s.k}</span><span style="color:#374151;font-weight:600">${s.v}</span></div>`).join('')}
        </div>
        <div style="background:${t.color}12;border-radius:6px;padding:6px 10px;font-size:11px;color:${t.color};font-weight:700;margin-bottom:6px">✓ 最適合：${t.bestFor}</div>
        <div style="background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;padding:5px 8px;font-size:11px;color:#92400e">⚠ ${t.warn}</div>
        <p style="font-size:10px;color:#94a3b8;margin:6px 0 0;text-align:right"><a href="${t.photo.page}" target="_blank" rel="noopener" style="color:#3b82f6">${t.photo.license}</a></p>
      </div>
    </div>`).join('');

  const compareHtml = `
    <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0;margin-top:20px">
      <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:560px">
        <thead><tr style="background:var(--accent,#0891b2);color:#fff">
          <th style="padding:8px 12px;text-align:left">比較項目</th>
          ${TYPES.map(t => `<th style="padding:8px 10px;text-align:center">${t.name}</th>`).join('')}
        </tr></thead>
        <tbody>${COMPARE.map((r, i) => `<tr style="background:${i%2?'#f8fafc':'#fff'}">
          <td style="padding:8px 12px;font-weight:700;color:#374151;border-bottom:1px solid #f1f5f9">${r.label}</td>
          ${r.vals.map(v => `<td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f1f5f9;color:#374151">${v}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table>
    </div>`;

  sec.innerHTML = `
    <h3>🏭 鑽床機型圖鑑 <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px">5 種類型比較</span></h3>
    <p class="muted" style="margin-bottom:16px">鑽床依設計用途分為多種類型。教室最常見的是桌上式，但了解各型別有助於接觸不同場合的機具。</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
      ${cardsHtml}
    </div>
    ${compareHtml}`;

  if (nav) nav.parentNode.insertBefore(sec, nav);
})();
