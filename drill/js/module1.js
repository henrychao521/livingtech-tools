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
