// 砂磨機 模組 1：認識部件
const PARTS = {
  belt: { name: '砂帶（Sanding Belt）', role: 'BELT SANDER ABRASIVE', desc: '套在前後兩個滾輪上的環形砂紙帶。常見規格 75×457mm / 100×610mm。粒度（grit）數字越小越粗：60 號粗磨、120 號中磨、240 號細磨、320 號精修。', fact: '砂帶方向有箭頭印在內側——裝錯方向砂粒會被反向拉脫，磨削效率降到一半且砂帶很快壞。' },
  disc: { name: '砂盤（Sanding Disc）', role: 'DISC SANDER ABRASIVE', desc: '圓盤狀砂紙，貼在金屬轉盤上。盤式砂磨機切削力比帶式大，適合快速去料、平面修整、邊角倒角。圓盤靠右半邊向下旋轉——工件必須放在「向下旋轉」那側才不會被甩起。', fact: '盤式砂磨「往下轉那側才能磨」是鐵則：左半邊是向上轉，工件放上去會被砂盤甩飛。' },
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
