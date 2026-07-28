// 機電整合 模組 1：系統組成與馬達選用
const PK = 'mecha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const MOTORS = [
  { id: 'dc', ico: '🔄', name: '直流馬達 (DC)', color: '#F97316',
    ctrl: 'PWM 調速，需搭配 H 橋驅動器（如 L298N、TB6612）才能正反轉',
    pros: '便宜、扭力大、轉速高、接線簡單',
    cons: '不知道自己轉到哪裡（無位置回授）、低速不穩',
    use: '自走車的驅動輪、風扇、抽水馬達',
    tip: '想知道走了多遠，要另外加編碼器（encoder）。' },
  { id: 'servo', ico: '📐', name: '伺服馬達 (Servo)', color: '#0EA5E9',
    ctrl: '送 PWM 脈波寬度指定角度（常見 0°–180°），內建位置回授',
    pros: '可精準指定角度、體積小、接線只要三條',
    cons: '一般型角度受限、扭力有限、不適合連續驅動',
    use: '機械手臂關節、超音波感測器的旋轉雲台、夾爪',
    tip: '「360° 連續旋轉伺服」是改裝版，送的是速度不是角度。' },
  { id: 'stepper', ico: '🔢', name: '步進馬達 (Stepper)', color: '#8B5CF6',
    ctrl: '依脈波一步一步轉（如每步 1.8°），需專用驅動器（A4988、ULN2003）',
    pros: '不需回授就能精準定位、低速扭力大、可停住不動',
    cons: '高速會失步、耗電、較重較貴、會發熱',
    use: '3D 印表機與雷切機的軸、掃描平台、精密送料',
    tip: '失步時馬達不會告訴你——這是為什麼印表機要先歸零（homing）。' },
];

const QUESTIONS = [
  { q: '自走車的兩顆驅動輪，需要能持續轉動、有足夠扭力推動車體，不需要知道精確角度。', a: 'dc' },
  { q: '要讓超音波感測器左右擺頭掃描，必須精準轉到 0°、90°、180° 三個位置。', a: 'servo' },
  { q: '3D 印表機的 X 軸要移動到指定座標，且中途停下時必須固定住不被外力推動。', a: 'stepper' },
];

const seen = new Set(loadP().module1_seen || []);
const answered = new Map(Object.entries(loadP().module1_ans || {}));
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

function renderMotors() {
  document.getElementById('motorPick').innerHTML = MOTORS.map(m =>
    `<div class="pick ${seen.has(m.id) ? 'on' : ''}" data-m="${m.id}">
      <span class="pick-ico">${m.ico}</span><div class="pick-name">${m.name}</div>
      <div class="pick-meta">${seen.has(m.id) ? '✓ 已認識' : '點我看細節'}</div></div>`).join('');
}

function renderQuiz() {
  document.getElementById('quiz').innerHTML = QUESTIONS.map((item, i) => {
    const picked = answered.get(String(i));
    const correct = picked === item.a;
    return `<div style="background:#f8fafc;border-radius:12px;padding:14px 16px;margin-bottom:12px;
        border-left:4px solid ${picked ? (correct ? '#22c55e' : '#ef4444') : '#cbd5e1'}">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">
        <span style="color:var(--primary-dark)">情境 ${i + 1}.</span> ${item.q}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${MOTORS.map(m => {
          const on = picked === m.id, isAns = m.id === item.a;
          let bg = '#fff', bd = '#e2e8f0', fg = '#334155';
          if (picked) {
            if (isAns) { bg = '#dcfce7'; bd = '#22c55e'; fg = '#15803d'; }
            else if (on) { bg = '#fee2e2'; bd = '#ef4444'; fg = '#b91c1c'; }
          }
          return `<button data-q="${i}" data-m="${m.id}" ${picked ? 'disabled' : ''}
            style="padding:8px 14px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${fg};
            font-weight:700;font-size:13px;cursor:${picked ? 'default' : 'pointer'}">${m.ico} ${m.name}</button>`;
        }).join('')}
      </div>
      ${picked ? `<div style="margin-top:10px;font-size:13px;color:${correct ? '#15803d' : '#b91c1c'}">
        ${correct ? '✅ 正確！' : `❌ 正確答案是 ${MOTORS.find(m => m.id === item.a).name}。`}
        ${MOTORS.find(m => m.id === item.a).use}</div>` : ''}
    </div>`;
  }).join('');
}

function updateProg() {
  const total = seen.size + answered.size;
  progEl.textContent = `進度 ${total} / 6`;
  if (seen.size === 3 && answered.size === 3) {
    const p = loadP(); p.module1 = true; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
  }
}

document.getElementById('motorPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  const m = MOTORS.find(x => x.id === el.dataset.m);
  if (!seen.has(m.id)) {
    seen.add(m.id);
    const p = loadP(); p.module1_seen = Array.from(seen); saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  }
  document.getElementById('motorDetail').innerHTML = `
    <div style="background:#f8fafc;border-radius:12px;padding:16px;border-left:4px solid ${m.color}">
      <div style="font-weight:800;color:${m.color};margin-bottom:8px;font-size:16px">${m.ico} ${m.name}</div>
      <p style="font-size:14px;margin:4px 0"><strong>怎麼控制：</strong>${m.ctrl}</p>
      <p style="font-size:14px;margin:4px 0"><strong style="color:#15803d">優點：</strong>${m.pros}</p>
      <p style="font-size:14px;margin:4px 0"><strong style="color:#b91c1c">限制：</strong>${m.cons}</p>
      <p style="font-size:14px;margin:4px 0"><strong>典型用途：</strong>${m.use}</p>
      <p style="font-size:13.5px;color:#475569;margin-top:8px">💡 ${m.tip}</p>
    </div>`;
  renderMotors(); updateProg();
});

document.getElementById('quiz').addEventListener('click', e => {
  const b = e.target.closest('button[data-q]'); if (!b || b.disabled) return;
  const qi = b.dataset.q; if (answered.has(qi)) return;
  answered.set(qi, b.dataset.m);
  const p = loadP(); p.module1_ans = Object.fromEntries(answered); saveP(p);
  const ok = b.dataset.m === QUESTIONS[+qi].a;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  if (typeof showToast === 'function') showToast(ok ? '✅ 答對了' : '❌ 再想想它需要什麼特性', ok ? 'good' : '');
  renderQuiz(); updateProg();
});

renderMotors(); renderQuiz(); updateProg();
if (seen.size === 3 && answered.size === 3) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
