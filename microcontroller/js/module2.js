// 微控制器 模組 2：感測器
const SENSORS = [
  { name: '光敏電阻 LDR', icon: '☀', type: '類比', desc: '光照強度越強電阻越小。常用於自動夜燈、街燈控制。' },
  { name: 'PIR 人體感測', icon: '👤', type: '數位', desc: '偵測紅外線變化判斷有人經過。自動門、走廊燈。' },
  { name: '超音波 HC-SR04', icon: '📡', type: '特殊', desc: '發射超音波測距 2cm-4m。避障機器人、停車測距。' },
  { name: 'DHT11 溫濕度', icon: '🌡', type: '特殊', desc: '單線數位傳輸溫度（±2°C）與濕度（±5%）。氣象站。' },
  { name: '可變電阻', icon: '🎛', type: '類比', desc: '手動旋轉產生 0-1023 值。音量旋鈕、調速器。' },
  { name: '土壤濕度', icon: '🪴', type: '類比', desc: '兩支電極測土壤導電性。自動灌溉系統。' },
  { name: '按鈕開關', icon: '🔘', type: '數位', desc: '按下接通、放開斷開。最簡單的數位輸入。' },
  { name: '霍爾磁感', icon: '🧲', type: '兩種都有', desc: '偵測磁場有無或強度。腳踏車速、磁鐵感應。' },
];

const PK = 'mc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const sg = document.getElementById('sensors');
SENSORS.forEach(s => {
  const c = document.createElement('div');
  c.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;border-left:4px solid ${s.type === '數位' ? '#6366F1' : s.type === '類比' ? '#16A34A' : '#CA8A04'}`;
  c.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-size:24px">${s.icon}</span><strong style="color:#4338CA;font-size:14px">${s.name}</strong></div>
    <span style="font-size:11px;color:${s.type === '數位' ? '#4338CA' : s.type === '類比' ? '#15803D' : '#CA8A04'};font-weight:700;background:${s.type === '數位' ? '#E0E7FF' : s.type === '類比' ? '#DCFCE7' : '#FEF3C7'};padding:2px 8px;border-radius:4px">${s.type}訊號</span>
    <p style="font-size:12px;color:#444;margin-top:6px">${s.desc}</p>`;
  sg.appendChild(c);
});

const QUIZ = [
  { q: '想偵測房間是否有人經過', ans: 'PIR', explain: 'PIR 人體感測偵測紅外線變化是人體感應最佳選擇。' },
  { q: '想做自動灌溉系統，何時要澆水', ans: '土壤濕度', explain: '土壤濕度感測器判斷土乾度決定澆水。' },
  { q: '想做機器人避免撞牆', ans: '超音波', explain: '超音波 HC-SR04 測前方距離，可作避障決策。' },
  { q: '想做氣象站記錄溫度濕度', ans: 'DHT11', explain: 'DHT11 一個感測器同時測溫度與濕度，最省引腳。' },
  { q: '想做自動夜燈天黑時亮起', ans: '光敏電阻', explain: '光敏電阻 LDR 偵測光亮度，配 if 判斷暗就亮燈。' },
  { q: '想做手動調整 LED 亮度', ans: '可變電阻', explain: '可變電阻配 analogRead + analogWrite 是 PWM 調光最簡作法。' },
  { q: '想計算腳踏車輪轉幾圈', ans: '霍爾磁感', explain: '輪上裝磁鐵 + 車架裝霍爾感測器，每轉一圈觸發一次。' },
  { q: '想做最簡單的開關控制', ans: '按鈕', explain: '按鈕是最基礎的數位輸入。digitalRead 讀按鈕狀態。' },
];

const quizEl = document.getElementById('quiz');
const allOpts = [...new Set(SENSORS.map(s => s.name.split(' ')[0]))];
let answered = new Set(); let correct = 0;
QUIZ.forEach((q, i) => {
  const opts = [q.ans, ...allOpts.filter(o => !q.ans.includes(o)).slice(0, 3)].sort(() => Math.random() - 0.5);
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
  div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
    <div class="choice-grid" style="grid-template-columns:repeat(4,1fr)">${opts.map(o => `<button class="choice" data-q="${i}" data-c="${o}">${o}</button>`).join('')}</div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans || QUIZ[i].ans.includes(b.dataset.c);
  const parent = b.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans || QUIZ[i].ans.includes(x.dataset.c)) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  document.getElementById('prog').textContent = `已答 ${answered.size} / ${QUIZ.length} 題`;
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module2 = true; p.module2_score = correct; saveP(p);
    document.getElementById('next-btn').style.opacity = 1; document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
