// 簡單機械 模組 1：6 種簡單機械
const MACHINES = [
  {
    id: 'lever',
    name: '槓桿 Lever',
    principle: '一根剛性桿件圍繞「支點」轉動。施力與阻力分別作用在桿的兩側（或同側）。',
    formula: 'MA = 施力臂 ÷ 阻力臂',
    examples: '剪刀、開瓶器、撬棍、釣魚竿、翹翹板',
    viz: '<svg viewBox="0 0 200 100"><rect x="20" y="50" width="160" height="6" fill="#DB2777"/><polygon points="95,56 115,56 105,75" fill="#9D174D"/><rect x="20" y="30" width="30" height="20" fill="#831843"/><line x1="170" y1="20" x2="170" y2="50" stroke="#16A34A" stroke-width="3" marker-end="url(#a1)"/><defs><marker id="a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#16A34A"/></marker></defs></svg>',
  },
  {
    id: 'pulley',
    name: '滑輪 Pulley',
    principle: '繞線輪改變力的方向（單滑輪）或減小施力（動滑輪）。',
    formula: 'MA = 支持重物的繩段數',
    examples: '升降機、起重機、旗桿、窗簾繩、健身房器械',
    viz: '<svg viewBox="0 0 200 100"><circle cx="100" cy="30" r="18" fill="#FCE7F3" stroke="#DB2777" stroke-width="3"/><circle cx="100" cy="30" r="6" fill="#DB2777"/><line x1="85" y1="30" x2="85" y2="80" stroke="#16A34A" stroke-width="2"/><line x1="115" y1="30" x2="115" y2="80" stroke="#16A34A" stroke-width="2"/><rect x="95" y="80" width="40" height="14" fill="#831843"/><line x1="65" y1="80" x2="65" y2="90" stroke="#16A34A" stroke-width="3" marker-end="url(#a2)"/><defs><marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#16A34A"/></marker></defs></svg>',
  },
  {
    id: 'wheel-axle',
    name: '輪軸 Wheel & Axle',
    principle: '同軸上一大輪+一小軸。大輪轉一圈，小軸也轉一圈，但力的比例＝半徑比。',
    formula: 'MA = 輪半徑 ÷ 軸半徑',
    examples: '方向盤、門把手、螺絲起子、腳踏車踏板、絞盤',
    viz: '<svg viewBox="0 0 200 100"><circle cx="100" cy="50" r="35" fill="#FCE7F3" stroke="#DB2777" stroke-width="3"/><circle cx="100" cy="50" r="12" fill="#9D174D"/><line x1="100" y1="15" x2="100" y2="85" stroke="#DB2777" stroke-width="1"/><line x1="65" y1="50" x2="135" y2="50" stroke="#DB2777" stroke-width="1"/><text x="100" y="53" text-anchor="middle" font-size="8" fill="#fff" font-weight="700">軸</text></svg>',
  },
  {
    id: 'inclined-plane',
    name: '斜面 Inclined Plane',
    principle: '把物體沿斜面推上去比直接舉起省力——但要走更遠的距離。能量守恆。',
    formula: 'MA = 斜面長度 ÷ 斜面高度',
    examples: '樓梯、無障礙坡道、卡車卸貨板、滑水道、地下停車場',
    viz: '<svg viewBox="0 0 200 100"><polygon points="20,85 180,85 180,30" fill="#FCE7F3" stroke="#DB2777" stroke-width="3"/><rect x="120" y="50" width="20" height="14" fill="#831843" transform="rotate(-19 130 57)"/><line x1="180" y1="85" x2="180" y2="35" stroke="#0891B2" stroke-width="1.5" stroke-dasharray="3 2"/><text x="190" y="60" font-size="9" fill="#0891B2" font-weight="700">高 h</text><text x="100" y="98" text-anchor="middle" font-size="9" fill="#0891B2" font-weight="700">長 L</text></svg>',
  },
  {
    id: 'wedge',
    name: '楔形 Wedge',
    principle: '兩個斜面相對組成（如三角形），把橫向力轉成側向力——劈開、切割、固定。',
    formula: 'MA = 楔形長度 ÷ 楔形厚度',
    examples: '斧頭、菜刀、釘子、鑿子、滑鼠固定楔',
    viz: '<svg viewBox="0 0 200 100"><polygon points="40,80 160,80 100,20" fill="#FCE7F3" stroke="#DB2777" stroke-width="3"/><polygon points="100,20 160,80 40,80" fill="none" stroke="#DB2777" stroke-width="3"/><line x1="100" y1="10" x2="100" y2="18" stroke="#16A34A" stroke-width="3" marker-end="url(#aw)"/><defs><marker id="aw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#16A34A"/></marker></defs><line x1="35" y1="80" x2="25" y2="80" stroke="#DC2626" stroke-width="3" marker-end="url(#awl)"/><line x1="175" y1="80" x2="165" y2="80" stroke="#DC2626" stroke-width="3" marker-start="url(#awl2)"/><defs><marker id="awl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#DC2626"/></marker><marker id="awl2" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 10 0 L 0 5 L 10 10 z" fill="#DC2626"/></marker></defs></svg>',
  },
  {
    id: 'screw',
    name: '螺旋 Screw',
    principle: '把「斜面」捲在圓柱上。轉一圈讓物體上升一個「螺距」——以圓周距離換高度。',
    formula: 'MA = 2π × 螺絲半徑 ÷ 螺距',
    examples: '螺絲、燈泡、瓶蓋、千斤頂、阿基米德螺旋抽水機',
    viz: '<svg viewBox="0 0 200 100"><rect x="80" y="20" width="40" height="60" fill="#FCE7F3" stroke="#DB2777" stroke-width="2"/><path d="M 80 30 L 120 35 M 80 40 L 120 45 M 80 50 L 120 55 M 80 60 L 120 65 M 80 70 L 120 75" stroke="#9D174D" stroke-width="2"/><polygon points="80,80 120,80 100,95" fill="#DB2777"/></svg>',
  },
];

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
      <div style="width:80px;height:50px">${m.viz}</div>
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
