// 設計流程 模組 4：加權決策矩陣（學習單 ② 另有以基準方案比較的 Pugh 矩陣）
const CRITERIA = [
  { name: '功能性', weight: 5, A: 3, B: 5, C: 4 },
  { name: '價格（越便宜越高分）', weight: 4, A: 4, B: 2, C: 3 },
  { name: '美觀', weight: 3, A: 3, B: 5, C: 4 },
  { name: '耐用度', weight: 4, A: 4, B: 3, C: 4 },
  { name: '製造難度（越簡單越高分）', weight: 3, A: 5, B: 2, C: 3 },
  { name: '使用者學習成本', weight: 3, A: 5, B: 3, C: 4 },
];

const PK = 'dp_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const rowsEl = document.getElementById('rows');
CRITERIA.forEach((c, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td style="text-align:left;font-weight:600">${c.name}</td>
    <td><input type="number" min="1" max="5" data-r="${i}" data-c="w" value="${c.weight}"></td>
    <td><input type="number" min="1" max="5" data-r="${i}" data-c="A" value="${c.A}"></td>
    <td><input type="number" min="1" max="5" data-r="${i}" data-c="B" value="${c.B}"></td>
    <td><input type="number" min="1" max="5" data-r="${i}" data-c="C" value="${c.C}"></td>`;
  rowsEl.appendChild(tr);
});

function calc() {
  let A = 0, B = 0, C = 0;
  CRITERIA.forEach((c, i) => {
    const w = parseFloat(document.querySelector(`input[data-r="${i}"][data-c="w"]`).value) || 0;
    const a = parseFloat(document.querySelector(`input[data-r="${i}"][data-c="A"]`).value) || 0;
    const b = parseFloat(document.querySelector(`input[data-r="${i}"][data-c="B"]`).value) || 0;
    const ca = parseFloat(document.querySelector(`input[data-r="${i}"][data-c="C"]`).value) || 0;
    A += w * a; B += w * b; C += w * ca;
  });
  document.getElementById('ta').textContent = A;
  document.getElementById('tb').textContent = B;
  document.getElementById('tc').textContent = C;
  const max = Math.max(A, B, C);
  // 找出所有等於最高分的方案（可能並列），並把最高分欄位標亮
  const plans = [['ta', A, '方案 A 傳統升級'], ['tb', B, '方案 B 智慧電子'], ['tc', C, '方案 C 輕量人體工學']];
  plans.forEach(([id]) => document.getElementById(id).classList.remove('best'));
  const tops = plans.filter(([, s]) => s === max);
  tops.forEach(([id]) => document.getElementById(id).classList.add('best'));
  document.getElementById('verdict').className = 'verdict good';
  document.getElementById('verdict').textContent = tops.length > 1
    ? `⚖️ ${tops.map(t => t[2]).join(' 與 ')} 同分（${max} 分），請回頭檢視權重，或想想能否結合兩案的優點。`
    : `🏆 最佳方案：${tops[0][2]}（${max} 分）。實際決策還要考慮其他不可量化因素（如品牌策略、目標市場）。`;
}

// 學生第一次動手調整矩陣時才記為模組 4 完成（不在載入時就記）
rowsEl.addEventListener('input', () => {
  calc();
  const p = loadP(); if (!p.module4) { p.module4 = true; saveP(p); }
});
calc();
