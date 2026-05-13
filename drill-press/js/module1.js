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
