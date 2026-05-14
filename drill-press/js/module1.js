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
