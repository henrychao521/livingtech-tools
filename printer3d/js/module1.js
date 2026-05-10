// 3D 印表機 模組 1：認識部件
const PARTS = {
  nozzle: { name: '噴嘴（Nozzle）', role: 'NOZZLE TIP', desc: '熔融塑料從噴嘴擠出的位置。標準孔徑 0.4mm，會影響細節度與列印速度。較細孔徑（0.2mm）細節好但慢；較大（0.6–0.8mm）速度快但粗糙。', fact: '噴嘴是耗材，會磨損。列印金屬絲（含 PLA）約 1000+ 小時就要換。' },
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
