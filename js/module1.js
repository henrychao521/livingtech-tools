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

// === Wikimedia Commons 授權圖片 ===
// 所有圖片已下載至 assets/wiki-photos/，每張附完整 attribution
// 授權詳見根目錄 LICENSE_IMAGES.md
const PHOTOS = [
  {
    id: 'operation',
    title: '操作中的線鋸機',
    desc: '工匠使用線鋸機切割木板的工作畫面，可看出操作姿勢。',
    relatedPart: '操作姿勢',
    localPath: 'Scroll_saw.jpg',
    author: 'Agashi5859',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scroll_saw.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    id: 'dremel',
    title: 'Dremel 桌上型線鋸機',
    desc: '小型家用電動線鋸機，與課堂教學機台尺寸相近。',
    relatedPart: '現代機型',
    localPath: 'Scroll_saw_-_Dremel.jpg',
    author: 'Scott Ehardt',
    license: '公有領域 (Public Domain)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scroll_saw_-_Dremel.jpg',
    licenseUrl: 'https://en.wikipedia.org/wiki/Public_domain',
  },
  {
    id: 'delta-industrial',
    title: 'Delta 40-560 工業級線鋸機',
    desc: '展示於博物館的工業等級機台，整體結構與課堂機型一致，比例更大。',
    relatedPart: '工業機型',
    localPath: 'AGPIConvention2018Delta40-560ScrollSaw.jpg',
    author: 'DanielPenfield',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:AGPIConvention2018Delta40-560ScrollSaw.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    id: 'power-coping',
    title: '電磁式電動線鋸機',
    desc: '採用電磁推動的線鋸機，可看清完整工作台、夾頭與機身結構。',
    relatedPart: '整機解剖',
    localPath: 'Power_coping_saw_01.jpg',
    author: 'Alessio Sbarbaro',
    license: 'CC BY-SA 3.0 / GFDL',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Power_coping_saw_01.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    id: 'blade-closeup',
    title: '鋸條近照',
    desc: '單一線鋸鋸條，可清楚看見鋸齒紋路與粗細。',
    relatedPart: '鋸條',
    localPath: 'Scrollsaw_blade.JPG',
    author: 'Angelsharum',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scrollsaw_blade.JPG',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    id: 'upper-chuck-closeup',
    title: '上夾頭結構特寫',
    desc: 'Central Machinery 線鋸機上夾頭，可見彈簧鋼片與固定螺絲。',
    relatedPart: '上夾頭',
    localPath: 'Upper_Blade_Holder.JPG',
    author: 'Jstapko',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Upper_Blade_Holder.JPG',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    id: 'historical',
    title: '古董手動線鋸機（約 1900 年）',
    desc: '攝於大鍵琴製作工坊內，腳踏式古董機台，可對照看現代電動機型的演進。',
    relatedPart: '歷史對照',
    localPath: 'Dekupiersaege_scroll_saw.jpg',
    author: 'Eva Kröcher (EvaK)',
    license: 'CC BY-SA 2.5 / GFDL',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dekupiersaege_scroll_saw.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/',
  },
];

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;

const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const savedProg = loadProgress();
if (savedProg.module1_seen) {
  savedProg.module1_seen.forEach(id => seenSet.add(id));
}

Object.entries(PARTS).forEach(([id, p], i) => {
  const chip = document.createElement('span');
  chip.className = 'part-chip';
  if (seenSet.has(id)) chip.classList.add('seen');
  chip.dataset.id = id;
  chip.textContent = `${i + 1}. ${p.name.split('（')[0]}`;
  checklistEl.appendChild(chip);
});

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

// 把 render 暴露給 3D 模組使用
window.module1RenderPart = render;

document.querySelectorAll('.hotspot-group').forEach(g => {
  g.addEventListener('click', () => render(g.dataset.id));
});

document.querySelectorAll('.part-chip').forEach(c => {
  c.addEventListener('click', () => render(c.dataset.id));
});

// === 視角分頁切換 ===
const tabs = document.querySelectorAll('.view-tab');
const panes = document.querySelectorAll('.view-pane');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const view = tab.dataset.view;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    panes.forEach(p => p.classList.toggle('active', p.dataset.pane === view));
  });
});

// === 渲染照片相簿 ===
// 注意：照片放在 /assets/wiki-photos/，pages/module1.html 在 /pages/，所以相對路徑要回上一層
function buildLocalUrl(filename) {
  return `../assets/wiki-photos/${filename}`;
}

function renderPhotos() {
  const grid = document.getElementById('photo-grid');
  if (!grid || grid.dataset.rendered === '1') return;
  grid.dataset.rendered = '1';

  // 授權說明 banner
  const banner = document.createElement('div');
  banner.className = 'attribution-banner';
  banner.style.gridColumn = '1 / -1';
  banner.innerHTML = `
    <strong>📸 圖片來源</strong>　以下 ${PHOTOS.length} 張實物照片皆取自 <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>（已下載至本平台伺服器，避免外部連結失效）。
    多數採 <strong>CC BY-SA</strong>（創用 CC 姓名標示-相同方式分享）授權，部分為公有領域。
    依授權條款，本平台保留作者署名與授權連結；下游再使用須維持相同授權並標註原作者。
    完整 attribution 清單見 <a href="../LICENSE_IMAGES.md" target="_blank" rel="noopener">LICENSE_IMAGES.md</a>。
  `;
  grid.appendChild(banner);

  PHOTOS.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    const url = buildLocalUrl(photo.localPath);
    card.innerHTML = `
      <img class="photo-img" src="${url}" alt="${photo.title}" loading="lazy">
      <span class="photo-tag">${photo.relatedPart}</span>
      <div class="photo-meta">
        <div class="photo-title">${photo.title}</div>
        <div class="photo-desc">${photo.desc}</div>
        <div class="photo-attribution">
          📷 <strong>${photo.author}</strong>　／　${photo.license}
          <br>
          <a href="${photo.sourceUrl}" target="_blank" rel="noopener">原始檔案 →</a>
          <a href="${photo.licenseUrl}" target="_blank" rel="noopener">授權條款 →</a>
        </div>
      </div>
    `;
    card.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      openLightbox(url, photo);
    });
    grid.appendChild(card);
  });
}

function openLightbox(url, photo) {
  let modal = document.querySelector('.photo-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'photo-modal';
    document.body.appendChild(modal);
    modal.addEventListener('click', () => modal.classList.remove('show'));
  }
  modal.innerHTML = `
    <img src="${url}" alt="${photo.title}">
    <div class="photo-modal-caption">
      <strong>${photo.title}</strong>　／　📷 ${photo.author}　／　${photo.license}
      <br><a href="${photo.sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">查看原始來源 →</a>
    </div>
  `;
  modal.classList.add('show');
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
}

renderPhotos();
