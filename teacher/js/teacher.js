// 教師後台 — 進度彙整、匯出匯入

// === 工具設定 ===
const TOOLS = [
  { id: 'scrollsaw', name: '線鋸機', emoji: '🪚', key: 'scrollsaw_progress_v1', color: '#FF7A00', url: '../scrollsaw/' },
  { id: 'solder', name: '電烙鐵', emoji: '🔥', key: 'solder_progress_v1', color: '#DC2626', url: '../solder/' },
  { id: 'breadboard', name: '麵包板', emoji: '🔌', key: 'breadboard_progress_v1', color: '#16A34A', url: '../breadboard/' },
  { id: 'printer3d', name: '3D 印表機', emoji: '🖨️', key: 'printer3d_progress_v1', color: '#0891B2', url: '../printer3d/' },
  { id: 'frc', name: 'FRC 機器人', emoji: '🤖', key: 'frc_progress_v1', color: '#0066B3', url: '../frc/' },
];

// === 分頁切換 ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.tab === tab));
  });
});

// === 計算單一工具進度百分比 ===
function calcToolProgress(toolKey) {
  let p; try { p = JSON.parse(localStorage.getItem(toolKey)) || {}; } catch { p = {}; }
  let completed = 0, total = 5; // 5 個模組
  if (p.module1) completed++;
  if (p.module2 || p.safetyPassed) completed++;
  if (p.module3) completed++;
  if (p.module4_levels) {
    const stars = Object.values(p.module4_levels).reduce((a, b) => a + b, 0);
    if (stars > 0) completed++;
  } else if (p.module4) completed++;
  if (p.module5) completed++;

  const stars = p.module4_levels ? Object.values(p.module4_levels).reduce((a, b) => a + b, 0) : 0;
  const maxStars = p.module4_levels ? Object.keys(p.module4_levels).length * 3 : 15;

  // 補充模組（目前僅 breadboard 有「剝線基本功」3 關）
  const extras = [];
  if (p.wire_stripping) {
    const lvls = ['L1', 'L2', 'L3'].filter(k => p.wire_stripping[k]).length;
    extras.push({ label: '剝線基本功', done: lvls, total: 3 });
  }

  return { completed, total, percent: Math.round(completed / total * 100), stars, maxStars, extras, raw: p };
}

// === 渲染本機進度 ===
function renderLocalProgress() {
  const container = document.getElementById('local-progress');
  let html = `<div class="student-table"><table><thead><tr><th>工具</th><th>已完成模組</th><th>進度</th><th>★ 總星數</th><th>動作</th></tr></thead><tbody>`;
  TOOLS.forEach(t => {
    const p = calcToolProgress(t.key);
    const extras = (p.extras || []).map(e =>
      `<div style="font-size:11px;color:var(--text-muted);margin-top:3px">補充・${e.label} ${e.done}/${e.total}</div>`
    ).join('');
    html += `<tr>
      <td><span class="tool-cell" style="color:${t.color}">${t.emoji} ${t.name}</span></td>
      <td>${p.completed} / ${p.total}${extras}</td>
      <td><span class="progress-cell"><span class="progress-cell-fill" style="width:${p.percent}%"></span></span>${p.percent}%</td>
      <td><span class="stars-cell">★</span> ${p.stars} / ${p.maxStars}</td>
      <td><a href="${t.url}" style="color:var(--primary);font-weight:600">前往 →</a></td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}
renderLocalProgress();

// === 匯出本機進度 JSON ===
window.exportProgressJSON = function() {
  const data = {
    exportTime: new Date().toISOString(),
    platform: 'livingtech-tools',
    tools: {},
  };
  TOOLS.forEach(t => {
    let p; try { p = JSON.parse(localStorage.getItem(t.key)); } catch {}
    if (p) data.tools[t.id] = p;
  });
  const studentName = prompt('請輸入學生姓名（或班級_座號_姓名，如「701_15_王小明」）：', '');
  if (!studentName) return;
  data.studentName = studentName;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${studentName.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  alert('進度已匯出。把這個 JSON 檔交給老師即可。');
};

// === 匯入個人進度 ===
window.importProgressJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.tools) throw new Error('格式不對');
      Object.entries(data.tools).forEach(([toolId, prog]) => {
        const tool = TOOLS.find(t => t.id === toolId);
        if (tool) localStorage.setItem(tool.key, JSON.stringify(prog));
      });
      alert(`✓ 匯入完成（${data.studentName || '未具名'}）`);
      renderLocalProgress();
    } catch (err) {
      alert('檔案格式錯誤：' + err.message);
    }
  };
  reader.readAsText(file);
};

// === 清除本機進度 ===
window.clearLocalProgress = function() {
  if (!confirm('確定要清除本機所有進度嗎？此操作無法復原。')) return;
  TOOLS.forEach(t => localStorage.removeItem(t.key));
  alert('已清除');
  renderLocalProgress();
};

// === 班級檔案上傳 ===
const uploadZone = document.getElementById('upload-zone');
const uploadInput = document.getElementById('upload-input');
const classData = []; // { studentName, tools: {scrollsaw: {...}, ...} }

uploadZone.addEventListener('click', () => uploadInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('over');
  handleFiles(e.dataTransfer.files);
});
uploadInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
  let processed = 0;
  Array.from(files).forEach(file => {
    if (!file.name.endsWith('.json')) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        // 從檔名取出學生資訊（如果 JSON 沒有）
        if (!data.studentName) data.studentName = file.name.replace('.json', '');
        // 替換重複的學生
        const existingIdx = classData.findIndex(d => d.studentName === data.studentName);
        if (existingIdx >= 0) classData[existingIdx] = data;
        else classData.push(data);
        processed++;
        if (processed === files.length) renderClassResult();
      } catch (err) {
        console.error('Parse failed:', file.name, err);
        processed++;
      }
    };
    reader.readAsText(file);
  });
}

function renderClassResult() {
  const result = document.getElementById('class-result');
  if (classData.length === 0) {
    result.innerHTML = '';
    return;
  }
  // 排序：按學生名（如果是 班_座_名 格式會自動排序）
  classData.sort((a, b) => a.studentName.localeCompare(b.studentName));

  // 統計
  const stats = TOOLS.map(t => {
    const counts = { count: 0, totalCompleted: 0, totalStars: 0 };
    classData.forEach(d => {
      if (d.tools && d.tools[t.id]) {
        counts.count++;
        const p = computeFromRaw(d.tools[t.id]);
        counts.totalCompleted += p.completed;
        counts.totalStars += p.stars;
      }
    });
    return { tool: t, ...counts };
  });

  let html = `<h4 style="margin-top:30px;margin-bottom:12px">班級統計（${classData.length} 位學生）</h4>`;
  html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px">`;
  stats.forEach(s => {
    if (s.count === 0) return;
    const avgComplete = (s.totalCompleted / s.count).toFixed(1);
    const avgStars = (s.totalStars / s.count).toFixed(1);
    html += `<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:24px">${s.tool.emoji}</span><strong style="color:${s.tool.color}">${s.tool.name}</strong></div>
      <div style="font-size:12px;color:var(--text-muted)">使用人數：${s.count} / ${classData.length}</div>
      <div style="font-size:12px;color:var(--text-muted)">平均完成：${avgComplete} / 5 模組</div>
      <div style="font-size:12px;color:var(--text-muted)">平均星數：★${avgStars}</div>
    </div>`;
  });
  html += '</div>';

  // 個人表
  html += `<h4 style="margin-bottom:12px">個別進度</h4><div class="student-table"><table><thead><tr><th>學生</th>`;
  TOOLS.forEach(t => html += `<th style="color:${t.color}">${t.emoji} ${t.name}</th>`);
  html += `<th>總計</th></tr></thead><tbody>`;
  classData.forEach(d => {
    html += `<tr><td><strong>${d.studentName}</strong></td>`;
    let totalComplete = 0, totalStars = 0;
    TOOLS.forEach(t => {
      const raw = d.tools && d.tools[t.id];
      if (!raw) {
        html += `<td style="color:var(--text-light)">—</td>`;
      } else {
        const p = computeFromRaw(raw);
        totalComplete += p.completed;
        totalStars += p.stars;
        html += `<td><span class="progress-cell"><span class="progress-cell-fill" style="width:${p.percent}%"></span></span>${p.completed}/${p.total} ★${p.stars}</td>`;
      }
    });
    html += `<td><strong>${totalComplete}/20 模組　★${totalStars}</strong></td></tr>`;
  });
  html += '</tbody></table></div>';

  result.innerHTML = html;
}

function computeFromRaw(p) {
  let completed = 0;
  if (p.module1) completed++;
  if (p.module2 || p.safetyPassed) completed++;
  if (p.module3) completed++;
  if (p.module4_levels) {
    const stars = Object.values(p.module4_levels).reduce((a, b) => a + b, 0);
    if (stars > 0) completed++;
  } else if (p.module4) completed++;
  if (p.module5) completed++;
  const stars = p.module4_levels ? Object.values(p.module4_levels).reduce((a, b) => a + b, 0) : 0;
  return { completed, total: 5, percent: Math.round(completed / 5 * 100), stars };
}

// === 匯出班級 CSV ===
window.exportClassCSV = function() {
  if (classData.length === 0) {
    alert('請先在「班級彙整」分頁上傳學生 JSON 檔。');
    return;
  }
  const rows = [['學生'].concat(TOOLS.flatMap(t => [`${t.name}-完成模組`, `${t.name}-星數`]))];
  classData.forEach(d => {
    const row = [d.studentName];
    TOOLS.forEach(t => {
      const raw = d.tools && d.tools[t.id];
      if (!raw) { row.push('—', '—'); return; }
      const p = computeFromRaw(raw);
      row.push(p.completed, p.stars);
    });
    rows.push(row);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  // 加 BOM 讓 Excel 正確顯示中文
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `班級進度_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

// === 教學資源卡 ===
const RESOURCE_DESC = {
  scrollsaw:  '木工基礎工具：認識線鋸機、安全操作、切割路徑模擬、創作挑戰。',
  solder:     '電子焊接：烙鐵結構、5 種焊接姿勢、潤濕原理、9 種焊點品質鑑定。',
  breadboard: '電路入門：麵包板連通邏輯、5 關修錯模擬、故障圖鑑＋補充剝線基本功。',
  printer3d:  '加減成型：FDM 工作流程、切片參數模擬、校正立方體診斷、故障排除。',
  frc:        'FRC 機器人工程：254 隊伍案例、工程設計流程、策略模擬、工程筆記範本。',
};
const resourceGrid = document.getElementById('resource-grid');
TOOLS.forEach(t => {
  const card = document.createElement('div');
  card.className = 'resource-card';
  card.innerHTML = `
    <div class="res-icon">${t.emoji}</div>
    <h4>${t.name}</h4>
    <p>${RESOURCE_DESC[t.id] || '5 模組教學資源、課程銜接、學生答題情境分析。'}</p>
    <a href="${t.url}" style="color:${t.color};font-weight:600;font-size:13px">前往 ${t.name} 平台 →</a>
  `;
  resourceGrid.appendChild(card);
});
