// 3D 印表機 模組 5：故障排除圖鑑
const ERRORS = [
  { icon: '🌋', name: '翹邊（Warping）', symptom: '物件邊角從熱床翹起', cause: '首層降溫太快收縮、熱床溫度不足、熱床不平、底面太小', fix: '提高熱床溫度 5–10°C、用裙邊（brim）加大底面、加封閉外殼（防風）、使用 PEI 膠帶或膠水增加附著' },
  { icon: '🍝', name: '義大利麵（Spaghetti）', symptom: '列印中物件掉了，噴頭在空中亂噴絲', cause: '首層沒附著好就繼續列印 / 列印中物件被撞掉', fix: '立刻停止列印！清除所有絲線、重新校正熱床、檢查首層附著是否確實' },
  { icon: '📏', name: '層分離（Layer Splitting）', symptom: '列印物件中間裂開、層與層之間分離', cause: '溫度不夠（層間黏不牢）、列印速度太快、絲線受潮、風扇太強', fix: '提高噴頭溫度 5–10°C、降低速度、絲線烘乾 4 小時、降低風扇強度' },
  { icon: '🍫', name: '欠擠出（Under-extrusion）', symptom: '物件表面有縫、層不滿、像啃過的餅乾', cause: '噴嘴堵料、絲線打滑、絲線受潮、流量設定太低', fix: '冷拉清噴嘴、檢查擠出機齒輪有沒有打滑磨損、烘乾絲線、流量調至 100% 或微調' },
  { icon: '🍓', name: '過擠出（Over-extrusion）', symptom: '表面凸凹、有絲線堆積、邊緣鼓起', cause: '流量設定太高、層厚過薄', fix: '流量降至 95%、檢查層厚是否合理（建議 0.15–0.25mm）' },
  { icon: '🕸️', name: '牽絲（Stringing）', symptom: '兩個物件之間有細絲、表面有蜘蛛網狀絲線', cause: '回抽不足、列印溫度過高、絲線受潮', fix: '增加回抽距離（5–8mm）、降低溫度 5°C、烘乾絲線' },
  { icon: '🏝️', name: '橋接失敗（Bridging）', symptom: '懸空部位下垂、不平整', cause: '橋接距離太長、風扇不足、橋接速度太快', fix: '加支撐結構、開風扇 100%、橋接速度降至 30–50mm/s' },
  { icon: '🦴', name: 'Z 紋（Z-banding）', symptom: '物件表面有規律的水平條紋', cause: 'Z 軸絲桿不直 / 偏心、Z 軸馬達失步、列印溫度不穩', fix: '檢查 Z 軸絲桿、潤滑滑軌、確認熱床溫度穩定（電源功率充足）' },
];

const grid = document.getElementById('error-grid');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;transition:all .25s';
  card.innerHTML = `
    <div style="height:120px;background:linear-gradient(180deg,#e0f2fe,#bfdbfe);border-radius:10px;margin-bottom:12px;display:flex;align-items:center;justify-content:center">
      <span style="font-size:60px">${e.icon}</span>
    </div>
    <span style="display:inline-block;font-size:11px;background:var(--danger-light);color:var(--danger);padding:3px 10px;border-radius:999px;font-weight:700;margin-bottom:8px">常見錯誤</span>
    <h4 style="font-size:16px;margin-bottom:6px">${e.name}</h4>
    <p style="font-size:13px;color:var(--text-soft);line-height:1.65;margin-bottom:8px"><strong>症狀：</strong>${e.symptom}</p>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;line-height:1.6"><strong style="color:#a72d2d">原因：</strong>${e.cause}</p>
    <div style="font-size:12px;color:var(--accent);background:var(--accent-light);padding:8px 10px;border-radius:8px;border-left:3px solid var(--accent);line-height:1.6"><strong style="color:#5b21b6">解法：</strong>${e.fix}</div>
  `;
  grid.appendChild(card);
});

const PK = 'printer3d_progress_v1';
let p; try { p = JSON.parse(localStorage.getItem(PK)) || {}; } catch { p = {}; }
p.module5 = true;
localStorage.setItem(PK, JSON.stringify(p));
