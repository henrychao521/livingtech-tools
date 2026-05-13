// 設計流程 模組 4：Pugh 決策矩陣
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
  const winner = A === max ? '方案 A 傳統升級' : B === max ? '方案 B 智慧電子' : '方案 C 輕量人體工學';
  document.getElementById('verdict').className = 'verdict good';
  document.getElementById('verdict').textContent = `🏆 最佳方案：${winner}（${max} 分）。實際決策還要考慮其他不可量化因素（如品牌策略、目標市場）。`;
  const p = loadP(); p.module4 = true; saveP(p);
}

rowsEl.addEventListener('input', calc);
calc();
