// 動力與運輸 模組 5：社會與環境
const ISSUES = [
  { icon: '🚦', name: '塞車成本', cat: '經濟', desc: '台北市平均通勤 35 分鐘塞車耗 1 小時。一年塞車經濟損失估 6000 億元，佔 GDP 3%。' },
  { icon: '💨', name: '空氣汙染', cat: '環境', desc: '機動車排放 NOx 與 PM2.5 是都市空汙最大來源。台灣道路致癌風險中等以上佔 28%。' },
  { icon: '🌡', name: '氣候變遷', cat: '環境', desc: '運輸佔全球 CO₂ 排放 24%。每加 1 公升汽油排 2.3 公斤 CO₂。全球暖化加速。' },
  { icon: '🏥', name: '交通事故', cat: '社會', desc: '台灣每年道路死亡約 3000 人、傷 50 萬人。年輕族群（18-24）死亡率最高。' },
  { icon: '🏙', name: '都市規劃', cat: '社會', desc: '汽車為中心的城市 → 寬馬路、停車場多。改為公共運輸 + 步行 → 街道恢復人本尺度。' },
  { icon: '⚡', name: '能源依賴', cat: '經濟', desc: '台灣 99% 石油靠進口（中東 + 美洲）。油價漲跌直接衝擊物價與經濟。' },
  { icon: '🔇', name: '噪音汙染', cat: '環境', desc: '機車 < 75 dB、汽車 < 75 dB、卡車 < 80 dB 是法規。實際路邊噪音常超標。' },
  { icon: '🏚', name: '不公平性', cat: '社會', desc: '機動車道擴張壓縮人行道與單車道。沒車的人（孩童、老人、貧困）權益受損。' },
  { icon: '🔋', name: '電動化轉型', cat: '科技', desc: '2035 年歐盟、加州禁售燃油車。台灣計畫 2040 年全面電動。電網要先升級。' },
  { icon: '🚇', name: '公共運輸', cat: '解方', desc: '捷運每人公里碳排比汽車少 80%。台北捷運每天運送 200 萬人次。是減碳關鍵。' },
];

const PK = 'pt_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const CAT_COLORS = { '經濟': '#CA8A04', '環境': '#16A34A', '社會': '#1D4ED8', '科技': '#7C3AED', '解方': '#0EA5E9' };

const issuesEl = document.getElementById('issues');
ISSUES.forEach(i => {
  const c = document.createElement('div');
  c.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;border-left:5px solid ${CAT_COLORS[i.cat]}`;
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:28px">${i.icon}</span><div><h4 style="margin:0;color:${CAT_COLORS[i.cat]};font-size:15px">${i.name}</h4><span style="font-size:11px;color:#666">${i.cat}面向</span></div></div><p style="font-size:13px;color:#444">${i.desc}</p>`;
  issuesEl.appendChild(c);
});

const QUIZ = [
  { q: '台北市每年塞車造成 GDP 損失 3%', ans: '經濟', explain: '塞車的時間損失轉換成金錢就是經濟議題。' },
  { q: '機車排放的 PM2.5 影響市民呼吸健康', ans: '環境', explain: 'PM2.5 是空汙議題 = 環境面向。' },
  { q: '每年 3000 人死於車禍', ans: '社會', explain: '生命安全與公共福祉是社會面向。' },
  { q: '汽車中心都市 → 沒車的人不便', ans: '社會', explain: '公平性 = 社會議題。' },
  { q: '電動車取代燃油車的市場轉型', ans: '科技', explain: '產業與技術轉型 = 科技/經濟面向。' },
  { q: '搭捷運比開車減少 80% 碳排', ans: '解方', explain: '公共運輸是運輸碳排的解決方案。' },
];

const quizEl = document.getElementById('quiz');
let answered = new Set();
let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
    <div class="choice-grid" style="grid-template-columns:repeat(5,1fr)">${Object.keys(CAT_COLORS).map(c => `<button class="choice" data-q="${i}" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});
quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('div');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].ans}面向 — ${QUIZ[i].explain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module5 = true; p.module5_score = correct; saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
