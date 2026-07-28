// 跨領域 STEAM 模組 3：聲音 — 頻率／振幅／泛音
// 泛音配方採用各波形的標準傅立葉級數（方波僅奇次諧波 1/n、鋸齒全諧波 1/n、三角波奇次 1/n²）。

const PK = 'steam_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const SOUND_SPEED = 343;   // m/s @20°C
const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// 泛音配方：[諧波次數, 相對振幅]
const TIMBRES = [
  { id: 'sine', ico: '〰️', name: '純音（正弦）', meta: '只有基頻，最單純',
    harm: [[1, 1]] },
  { id: 'square', ico: '⬛', name: '方波', meta: '奇次諧波・電子感',
    harm: [[1, 1], [3, 1 / 3], [5, 1 / 5], [7, 1 / 7], [9, 1 / 9], [11, 1 / 11]] },
  { id: 'saw', ico: '🪚', name: '鋸齒波', meta: '全諧波・明亮如弦樂',
    harm: [[1, 1], [2, 1 / 2], [3, 1 / 3], [4, 1 / 4], [5, 1 / 5], [6, 1 / 6], [7, 1 / 7], [8, 1 / 8]] },
  { id: 'tri', ico: '📐', name: '三角波', meta: '奇次衰減快・柔和似笛',
    harm: [[1, 1], [3, 1 / 9], [5, 1 / 25], [7, 1 / 49], [9, 1 / 81]] },
];

const state = { f: 440, a: 60, timbre: 'sine' };
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let audioCtx = null;

// ---------- 音名換算 ----------
function noteName(f) {
  // A4 = 440 Hz，MIDI 69
  const midi = Math.round(69 + 12 * Math.log2(f / 440));
  const name = NOTES[((midi % 12) + 12) % 12];
  const oct = Math.floor(midi / 12) - 1;
  const exact = 440 * Math.pow(2, (midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(f / exact));
  return { label: name + oct, cents, exact };
}

// ---------- 合成波形 ----------
function sample(t) {
  const T = TIMBRES.find(x => x.id === state.timbre);
  let v = 0, norm = 0;
  T.harm.forEach(([n, amp]) => { v += amp * Math.sin(2 * Math.PI * state.f * n * t); norm += amp; });
  return v / norm;
}

function draw() {
  const W = cv.width, H = cv.height, mid = H / 2;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  // 中線與格線
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

  // 顯示固定 3 個週期，讓「頻率變高＝波變密」不會超出畫面
  const periods = 3, dur = periods / state.f;
  const amp = (state.a / 100) * (H / 2 - 22);

  ctx.strokeStyle = '#EC4899'; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let x = 0; x <= W; x++) {
    const t = (x / W) * dur;
    const y = mid - sample(t) * amp;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 一個週期的標示
  const pw = W / periods;
  ctx.strokeStyle = '#8B5CF6'; ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pw, 14); ctx.lineTo(pw, H - 14); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#8B5CF6'; ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('← 一個週期 →', pw / 2, 22);

  ctx.textAlign = 'left'; ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif';
  ctx.fillText(`${state.f} Hz ・ 畫面顯示 ${periods} 個週期`, 12, H - 10);
}

function update() {
  const n = noteName(state.f);
  document.getElementById('vF').textContent = state.f + ' Hz';
  document.getElementById('vA').textContent = state.a + '%';
  document.getElementById('noteVal').textContent = n.label + (Math.abs(n.cents) > 8 ? ` (${n.cents > 0 ? '+' : ''}${n.cents}¢)` : '');
  document.getElementById('perVal').textContent = (1000 / state.f).toFixed(2) + ' ms';
  document.getElementById('wlVal').textContent = (SOUND_SPEED / state.f * 100).toFixed(0) + ' cm';

  const v = document.getElementById('verdict');
  const T = TIMBRES.find(x => x.id === state.timbre);
  if (state.a === 0) { v.className = 'verdict warn'; v.textContent = '🔇 振幅為 0：波形變成一條直線，也就是沒有聲音。'; }
  else { v.className = 'verdict good';
    v.textContent = `目前：${state.f} Hz（約 ${n.label}）・${T.name}，含 ${T.harm.length} 個諧波。振幅只改變高度（響度），不改變波的疏密（音高）。`; }

  draw(); check();
}

// ---------- 播放 ----------
function play() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const T = TIMBRES.find(x => x.id === state.timbre);
    const now = audioCtx.currentTime, dur = 2;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime((state.a / 100) * 0.22, now + 0.05);
    master.gain.setValueAtTime((state.a / 100) * 0.22, now + dur - 0.15);
    master.gain.linearRampToValueAtTime(0, now + dur);
    master.connect(audioCtx.destination);

    const norm = T.harm.reduce((s, [, a]) => s + a, 0);
    T.harm.forEach(([n, a]) => {
      if (state.f * n > 18000) return;           // 超出可聽範圍就不加，避免刺耳
      const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = state.f * n;
      g.gain.value = a / norm;
      osc.connect(g); g.connect(master);
      osc.start(now); osc.stop(now + dur);
    });
    played = true;
    const p = loadP(); p.module3_played = true; saveP(p);
    check();
  } catch (e) {
    const v = document.getElementById('verdict');
    v.className = 'verdict bad';
    v.textContent = '⚠️ 這個瀏覽器無法播放音訊，但波形觀察與計算仍可正常使用。';
  }
}

// ---------- 八度表 ----------
function buildOctTable() {
  const rows = [];
  for (let i = -3; i <= 3; i++) {
    const f = 440 * Math.pow(2, i);
    rows.push({ oct: i, f, note: noteName(f).label });
  }
  document.getElementById('octTable').innerHTML = `
    <thead><tr style="background:#f1f5f9">
      <th style="padding:9px;text-align:left;border-bottom:2px solid #cbd5e1">音名</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">頻率</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">與 A4 的比例</th>
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">波長</th>
    </tr></thead><tbody>
    ${rows.map(r => `<tr style="${r.oct === 0 ? 'background:#EDE9FE;font-weight:700' : ''}">
      <td style="padding:9px;border-bottom:1px solid #e2e8f0">${r.note}</td>
      <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${r.f.toFixed(1)} Hz</td>
      <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${r.oct === 0 ? '1×' : (r.oct > 0 ? `${Math.pow(2, r.oct)}×` : `1/${Math.pow(2, -r.oct)}×`)}</td>
      <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${(SOUND_SPEED / r.f * 100).toFixed(0)} cm</td>
    </tr>`).join('')}</tbody>`;
}

// ---------- 挑戰 ----------
let played = loadP().module3_played || false;
const seenTimbres = new Set(loadP().module3_timbres || ['sine']);
const QUESTS = [
  { id: 'q_play', text: '播放一次聲音', hint: '記得先把裝置音量調小', test: () => played },
  { id: 'q_oct',  text: '找到高八度：把頻率調成 880 Hz，確認音名同樣是 A', hint: '可直接按「↑ 高八度」',
    test: () => Math.abs(state.f - 880) <= 5 },
  { id: 'q_tim',  text: '四種音色都看過波形', hint: '點右邊四張卡片', test: () => seenTimbres.size === 4 },
  { id: 'q_amp',  text: '證明「振幅只改響度、不改音高」：把振幅調到最大與最小，觀察波的疏密沒變',
    hint: '把振幅拉到 0 再拉到 100', test: () => ampMin && ampMax },
];
let ampMin = loadP().module3_ampMin || false, ampMax = loadP().module3_ampMax || false;
const done = new Set(loadP().module3_quests || []);

function renderQuests() {
  document.getElementById('quests').innerHTML = QUESTS.map(q => {
    const d = done.has(q.id);
    return `<li style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;
      background:${d ? '#dcfce7' : '#f8fafc'};border-left:4px solid ${d ? '#22c55e' : '#cbd5e1'}">
      <span style="font-size:18px">${d ? '✅' : '⬜'}</span>
      <div><div style="font-weight:700;font-size:14px;color:${d ? '#15803d' : '#1e293b'}">${q.text}</div>
      <div style="font-size:12.5px;color:#64748b;margin-top:2px">💡 ${q.hint}</div></div></li>`;
  }).join('');
  document.getElementById('prog').textContent = `挑戰完成 ${done.size} / ${QUESTS.length}`;
}

function check() {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test()) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module3_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 四個挑戰都完成了！', 'good');
  } else if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  saveP(p); renderQuests();
}

// ---------- 綁定 ----------
function renderTimbres() {
  document.getElementById('timbrePick').innerHTML = TIMBRES.map(t =>
    `<div class="pick ${t.id === state.timbre ? 'on' : ''}" data-t="${t.id}">
      <span class="pick-ico">${t.ico}</span><div class="pick-name" style="font-size:13px">${t.name}</div>
      <div class="pick-meta">${t.meta}</div></div>`).join('');
}
renderTimbres();

document.getElementById('timbrePick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  state.timbre = el.dataset.t; seenTimbres.add(state.timbre);
  const p = loadP(); p.module3_timbres = Array.from(seenTimbres); saveP(p);
  renderTimbres(); update();
});
document.getElementById('sF').addEventListener('input', e => { state.f = +e.target.value; update(); });
document.getElementById('sA').addEventListener('input', e => {
  state.a = +e.target.value;
  if (state.a === 0) ampMin = true;
  if (state.a === 100) ampMax = true;
  const p = loadP(); p.module3_ampMin = ampMin; p.module3_ampMax = ampMax; saveP(p);
  update();
});
document.getElementById('play').addEventListener('click', play);
document.getElementById('octUp').addEventListener('click', () => {
  state.f = Math.min(1760, state.f * 2);
  document.getElementById('sF').value = state.f;
  update();
});

buildOctTable(); renderQuests();
if (done.size === QUESTS.length) {
  document.getElementById('next-btn').style.opacity = 1;
  document.getElementById('next-btn').style.pointerEvents = 'auto';
}
update();
