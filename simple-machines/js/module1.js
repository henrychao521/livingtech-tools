// 簡單機械 模組 1：6 種簡單機械
// 立體圖：OpenSCAD 參數化建模渲染（路徑 ../../models/simple-machines/<id>-iso.png）
const MACHINES = [
  {
    id: 'lever',
    name: '槓桿 Lever',
    principle: '一根剛性桿件圍繞「支點」轉動。施力與阻力分別作用在桿的兩側（或同側）。',
    formula: 'MA = 施力臂 ÷ 阻力臂',
    examples: '剪刀、開瓶器、撬棍、釣魚竿、翹翹板',
  },
  {
    id: 'pulley',
    name: '滑輪 Pulley',
    principle: '繞線輪改變力的方向（單滑輪）或減小施力（動滑輪）。',
    formula: 'MA = 支持重物的繩段數',
    examples: '升降機、起重機、旗桿、窗簾繩、健身房器械',
  },
  {
    id: 'wheel-axle',
    name: '輪軸 Wheel & Axle',
    principle: '同軸上一大輪+一小軸。大輪轉一圈，小軸也轉一圈，但力的比例＝半徑比。',
    formula: 'MA = 輪半徑 ÷ 軸半徑',
    examples: '方向盤、門把手、螺絲起子、腳踏車踏板、絞盤',
  },
  {
    id: 'inclined-plane',
    name: '斜面 Inclined Plane',
    principle: '把物體沿斜面推上去比直接舉起省力——但要走更遠的距離。能量守恆。',
    formula: 'MA = 斜面長度 ÷ 斜面高度',
    examples: '樓梯、無障礙坡道、卡車卸貨板、滑水道、地下停車場',
  },
  {
    id: 'wedge',
    name: '楔形 Wedge',
    principle: '兩個斜面相對組成（如三角形），把橫向力轉成側向力——劈開、切割、固定。',
    formula: 'MA = 楔形長度 ÷ 楔形厚度',
    examples: '斧頭、菜刀、釘子、鑿子、滑鼠固定楔',
  },
  {
    id: 'screw',
    name: '螺旋 Screw',
    principle: '把「斜面」捲在圓柱上。轉一圈讓物體上升一個「螺距」——以圓周距離換高度。',
    formula: 'MA = 2π × 螺絲半徑 ÷ 螺距（理論值；實際受螺紋摩擦影響，效率約 30–60%）',
    examples: '螺絲、燈泡、瓶蓋、千斤頂、阿基米德螺旋抽水機',
  },
];

// 立體圖 viz 統一用 OpenSCAD PNG（從 .scad 參數化建模渲染而來）
MACHINES.forEach(m => {
  m.viz = `<img src="../../models/simple-machines/${m.id}-iso.png" alt="${m.name}" style="width:100%;height:100%;object-fit:contain;background:#1E293B;border-radius:6px;display:block" loading="lazy">`;
});

const PK = 'sm_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('sm-grid');
const progressEl = document.getElementById('progress-text');
const nextBtn = document.getElementById('next-btn');

MACHINES.forEach(m => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #DB2777;${seen.has(m.id) ? 'background:#FCE7F3' : ''}`;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <div style="width:90px;height:90px;flex-shrink:0">${m.viz}</div>
      <h4 style="margin:0;color:#9D174D;font-size:16px">${m.name}</h4>
    </div>
    <p style="font-size:13px;color:#444;margin:6px 0"><strong>原理：</strong>${m.principle}</p>
    <p style="font-size:12.5px;color:#DB2777;font-family:var(--font-mono);font-weight:700;background:#FCE7F3;padding:6px 10px;border-radius:6px;margin:8px 0">${m.formula}</p>
    <p style="font-size:12.5px;color:#666"><strong>生活範例：</strong>${m.examples}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      card.style.background = '#FCE7F3';
      progressEl.textContent = `已認識 ${seen.size} / 6 種`;
      const p = loadP();
      p.module1_seen = Array.from(seen);
      if (seen.size === 6) {
        p.module1 = true;
        nextBtn.style.opacity = 1;
        nextBtn.style.pointerEvents = 'auto';
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        showToast('🎉 6 種簡單機械認識完畢！', 'good');
      } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});

progressEl.textContent = `已認識 ${seen.size} / 6 種`;
if (seen.size === 6) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
