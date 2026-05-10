// 模組 1：認識線鋸機
const PARTS = {
  blade: {
    name: '鋸條（Blade）',
    role: 'CORE CUTTING TOOL',
    desc: '線鋸機最關鍵的耗材。鋸齒方向必須朝下，安裝時需先確認齒朝向工作台。常見規格依齒數（TPI）區分：齒數越多越細緻、越少越快速。切割厚木板時應使用粗齒（10–15 TPI），薄木或精細圖案則用細齒（18–25 TPI）。',
    fact: '一條 5 吋鋸條約有 60–125 個鋸齒，每分鐘往復 800–1700 次。'
  },
  'upper-chuck': {
    name: '上夾頭（Upper Chuck）',
    role: 'TOP BLADE HOLDER',
    desc: '配合下夾頭把鋸條張緊。安裝鋸條時先鎖下夾頭、再鎖上夾頭，最後用張力桿調整適當張力。鋸條張力不足會導致切線歪斜或斷裂。',
    fact: '彈鋸條時若發出「叮」清亮聲，代表張力適中。'
  },
  'lower-chuck': {
    name: '下夾頭（Lower Chuck）',
    role: 'BOTTOM BLADE HOLDER',
    desc: '位於工作台下方，是安裝鋸條的起點。對於初學者，下夾頭較難對準，請務必由老師檢查後再上鎖。',
    fact: '下夾頭距離工作台只有約 5mm，是視線最受限的部位。'
  },
  table: {
    name: '工作台（Table）',
    role: 'WORK SURFACE',
    desc: '提供平整的切割面。可調整 0–45° 傾斜角度做斜切。中間的細縫稱為「鋸縫」，是鋸條穿過的位置；木板靠近鋸縫時要特別小心。',
    fact: '工作台通常是鑄鐵製，重量約 4–8 公斤，提供穩定性。'
  },
  'hold-down': {
    name: '壓料桿（Hold-down）',
    role: 'BOARD STABILIZER',
    desc: '一個固定在機身、可調高度的塑膠或金屬腳座，輕壓在木板上方。壓料桿能避免鋸條上下運動時把木板「彈起來」，是初學者最容易忽略卻最重要的安全配件。',
    fact: '90% 的「木板震彈」事故都是壓料桿沒裝好造成的。'
  },
  blower: {
    name: '吹氣管（Dust Blower）',
    role: 'DUST CLEARING TUBE',
    desc: '一條可彎折的小軟管，對準切割點吹開木屑，讓你隨時看清切割線。木屑若堆積會擋住視線，導致切線歪斜。',
    fact: '吹氣管的氣源來自鋸條上下震動產生的氣壓，免額外電源。'
  },
  speed: {
    name: '調速鈕（Speed Dial）',
    role: 'SPEED CONTROL',
    desc: '依木材軟硬與厚度調整速度。一般原則：木材越厚越硬 → 速度越慢；薄板與曲線切割可調快。初學者建議從中速開始練習。',
    fact: '常見範圍：400–1700 SPM（每分鐘往復數）。'
  },
  switch: {
    name: '電源開關（Power Switch）',
    role: 'POWER SWITCH',
    desc: '操作前最後一個步驟才打開；切割完畢一定要先「等鋸條完全停止」再離開機台。緊急情況下用手肘或膝蓋撞擊紅色急停鈕（部分機型才有）。',
    fact: '紅色 OFF 鈕通常設計得比 ON 鈕更大、更突出，方便緊急按下。'
  },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;

const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

// 載入既有進度
const savedProg = loadProgress();
if (savedProg.module1_seen) {
  savedProg.module1_seen.forEach(id => seenSet.add(id));
}

// 初始化 chip 列表
Object.entries(PARTS).forEach(([id, p], i) => {
  const chip = document.createElement('span');
  chip.className = 'part-chip';
  if (seenSet.has(id)) chip.classList.add('seen');
  chip.dataset.id = id;
  chip.textContent = `${i + 1}. ${p.name.split('（')[0]}`;
  checklistEl.appendChild(chip);
});

// 同步已看過的部位 UI
function syncSeenUI() {
  document.querySelectorAll('.hotspot-group').forEach(g => {
    const seen = seenSet.has(g.dataset.id);
    g.querySelector('.hotspot').classList.toggle('seen', seen);
  });
  progressEl.textContent = `已認識 ${seenSet.size} / ${totalParts} 個部位`;
  if (seenSet.size === totalParts) {
    nextBtn.style.opacity = 1;
    nextBtn.style.pointerEvents = 'auto';
  }
}
syncSeenUI();

function render(id) {
  const p = PARTS[id];
  if (!p) return;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  infoEl.innerHTML = `
    <h3>${p.name}</h3>
    <p class="role">${p.role}</p>
    <p class="desc">${p.desc}</p>
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)">
      <strong style="color:var(--accent)">💡 冷知識：</strong>${p.fact}
    </div>
  `;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncSeenUI();
    if (seenSet.size === totalParts) {
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 所有部位都認識完畢！可以前往下一關', 'good');
      const prog = loadProgress();
      prog.module1 = true;
      prog.module1_seen = Array.from(seenSet);
      saveProgress(prog);
    } else {
      const prog = loadProgress();
      prog.module1_seen = Array.from(seenSet);
      saveProgress(prog);
    }
  }
  document.querySelectorAll('.hotspot-group').forEach(g => {
    g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id);
  });
}

document.querySelectorAll('.hotspot-group').forEach(g => {
  g.addEventListener('click', () => render(g.dataset.id));
});

document.querySelectorAll('.part-chip').forEach(c => {
  c.addEventListener('click', () => render(c.dataset.id));
});
