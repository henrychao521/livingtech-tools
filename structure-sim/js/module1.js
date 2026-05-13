// 結構模擬器 模組 1：認識結構元素 + 內力
const PARTS = {
  node: { name: '節點（Node / Joint）', role: 'CONNECTION POINT', desc: '結構中桿件交會的點。節點可以是「鉸接」（允許旋轉，桿件只承受軸力）或「剛接」（不允許旋轉，可傳遞彎矩）。桁架的節點都是鉸接。', fact: '節點是結構的「弱點」——多數結構失效都從節點開始（焊點裂、釘子鬆、銷孔變形）。' },
  member: { name: '桿件（Member）', role: 'STRUCTURAL ELEMENT', desc: '連接兩個節點的桿狀構件。桁架的桿件只承受「軸力」（張力或壓力）。桿件被命名常依角色：上弦、下弦、豎桿、斜桿。', fact: '桿件越長越容易「挫屈」（buckling）失效——細長的壓桿要設計得短或加支撐。' },
  support: { name: '支承（Support）', role: 'BOUNDARY CONDITION', desc: '結構與地面或其他固定物的連接點，提供反作用力。常見三種：滾支（roller，只擋垂直力）、鉸支（pin，擋兩個方向）、固定端（fixed，全部擋住含旋轉）。', fact: '橋通常一邊鉸支、一邊滾支，讓結構可隨溫度膨脹收縮——固定兩端會把橋熱漲冷縮的力放大十倍。' },
  tension: { name: '張力（Tension）', role: 'AXIAL PULLING', desc: '把桿件「拉長」的內力。受拉桿件兩端的力是「往外拉」。材料受張力時會延伸變細。鋼、鋁、繩索都很擅長受張力。', fact: '張力沒有「挫屈」問題——桿件多長都能承受設計值的張力。但要小心節點被拉脫。' },
  compression: { name: '壓力（Compression）', role: 'AXIAL PUSHING', desc: '把桿件「壓短」的內力。受壓桿件兩端的力是「往內推」。混凝土、磚塊、實心木頭很擅長受壓。', fact: '壓桿可能會「挫屈」（突然側向彎折）——這發生在壓力到達臨界值之前，是壓桿的最大威脅。長細比 L/r 越大越容易挫屈。' },
  shear: { name: '剪力（Shear）', role: 'PERPENDICULAR FORCE', desc: '把材料「上下錯開」的力。想像用剪刀剪紙——一邊往上一邊往下就是剪力。樑承受橫向荷重時，內部就有剪力。', fact: '剪力會讓材料「滑開」——剪刀就是利用剪力。釘子、螺栓、銷主要承受剪力。' },
  bending: { name: '彎矩（Bending Moment）', role: 'ROTATIONAL FORCE', desc: '讓桿件「彎曲」的內力。樑承受橫向荷重時，靠近荷重的內部會「上拉下壓」——這就是彎矩造成的應力分布。', fact: 'I 型樑就是針對彎矩優化的——上下翼緣抗拉抗壓、中間腹板抗剪。比同樣重量的實心方桿強 5 倍。' },
  torsion: { name: '扭力（Torsion）', role: 'TWISTING FORCE', desc: '讓桿件「扭轉」的內力。轉動方向盤時方向機柱受扭力。汽車傳動軸是受扭力的代表元件。', fact: '圓管比實心圓桿抗扭強——這就是為何腳踏車車架、傳動軸都用「中空管」。' },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'struct_progress_v1';
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
  progressEl.textContent = `已認識 ${seenSet.size} / ${totalParts} 項`;
  if (seenSet.size === totalParts) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
}
syncUI();

function render(id) {
  const p = PARTS[id];
  if (!p) return;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  infoEl.innerHTML = `<h3>${p.name}</h3><p class="role">${p.role}</p><p class="desc">${p.desc}</p>
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)"><strong style="color:var(--accent)">💡 重點：</strong>${p.fact}</div>`;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncUI();
    const prog = loadP();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 個概念認識完畢！', 'good');
    }
    saveP(prog);
  }
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id));
}
document.querySelectorAll('.hotspot-group').forEach(g => g.addEventListener('click', () => render(g.dataset.id)));
document.querySelectorAll('.part-chip').forEach(c => c.addEventListener('click', () => render(c.dataset.id)));
