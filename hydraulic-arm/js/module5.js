// 液壓手臂 模組 5：工業應用
const APPS = [
  { name: '挖土機', icon: '🚜', force: '5-20 噸', pressure: '350 bar', desc: '4 個主油壓缸控制大臂、小臂、鏟斗、迴轉，可以挖深 6m。操作員推一個小桿就操控全部。' },
  { name: '堆高機', icon: '📦', force: '1-50 噸', pressure: '200 bar', desc: '油壓缸推動桅杆與貨叉升降，可舉到 6m 高。輪胎也是油壓動力轉向（power steering）。' },
  { name: '汽車剎車', icon: '🚗', force: '500-2000N', pressure: '50 bar', desc: '踩剎車踏板 → 主缸壓力推 4 個輪上的卡鉗 → 夾住碟盤。腳力放大 16-30 倍。' },
  { name: '挖鼻車（垃圾車）', icon: '🗑', force: '~500kg 壓縮', pressure: '180 bar', desc: '後方液壓缸把垃圾推壓進車廂，可壓縮 4-6 倍。每天清晨各社區巷弄都見得到。' },
  { name: '千斤頂', icon: '⬆', force: '1-50 噸', pressure: '500 bar', desc: '小活塞反覆壓動 → 把油打進大活塞 → 舉起車輛。手按 200N 變成舉 1000kg。' },
  { name: '飛機起落架', icon: '✈', force: '巨大', pressure: '210 bar', desc: '油壓系統收放起落架、控制襟翼、操作方向舵。波音 747 有 4 個獨立液壓迴路備援。' },
  { name: '油壓椅', icon: '🪑', force: '~150kg', pressure: '1 bar', desc: '辦公椅高度調整用「氣壓棒」（油氣混合）。按按鈕鬆閥 → 體重壓下椅子降；起身按 → 彈簧+氣壓推上升。' },
  { name: '射出成型機', icon: '🏭', force: '50-5000 噸', pressure: '150 bar', desc: '把塑膠射進模具的核心力量。大型機可達 5000 噸夾模力。台灣是全球射出機強國。' },
];

const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const grid = document.getElementById('apps');
APPS.forEach(a => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid #0284C7';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:28px">${a.icon}</span><h4 style="margin:0;color:#075985;font-size:15px">${a.name}</h4></div>
    <p style="font-size:12.5px;color:#0284C7;font-weight:700;background:#E0F2FE;padding:5px 10px;border-radius:5px;margin:6px 0">力：${a.force} ・ 壓力：${a.pressure}</p>
    <p style="font-size:13px;color:#444">${a.desc}</p>`;
  grid.appendChild(c);
});
const p = loadP(); p.module5 = true; saveP(p);
