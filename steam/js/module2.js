// 跨領域 STEAM 模組 2：排序演算法視覺化（不插電運算思維）
// 三種 O(n²) 排序以「錄製步驟」方式呈現，比較／交換次數為實際計數。

const PK = 'steam_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const ALGOS = [
  { id: 'bubble',    name: '氣泡排序', ico: '🫧', desc: '相鄰兩個比一比，大的往後推，像氣泡浮上來。' },
  { id: 'selection', name: '選擇排序', ico: '🎯', desc: '每一輪找出剩下最小的，放到最前面。' },
  { id: 'insertion', name: '插入排序', ico: '🃏', desc: '像整理撲克牌，把新牌插進已排好的位置。' },
];

let data = [], frames = [], idx = 0, algo = 'bubble', timer = null;
const seenAlgos = new Set(loadP().module2_seen || []);
const bestCmp = loadP().module2_best || {};

// ---------- 產生步驟 ----------
function record(a, hl, cmp, swp, note, sortedFrom) {
  frames.push({ a: [...a], hl: [...hl], cmp, swp, note, sortedFrom });
}

function buildFrames(src, kind) {
  const a = [...src]; frames = []; let cmp = 0, swp = 0;
  record(a, [], cmp, swp, '開始', a.length);

  if (kind === 'bubble') {
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - 1 - i; j++) {
        cmp++;
        record(a, [j, j + 1], cmp, swp, `比較 ${a[j]} 和 ${a[j + 1]}`, a.length - i);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]]; swp++;
          record(a, [j, j + 1], cmp, swp, `${a[j + 1]} > ${a[j]} → 交換`, a.length - i);
        }
      }
    }
  } else if (kind === 'selection') {
    for (let i = 0; i < a.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < a.length; j++) {
        cmp++;
        record(a, [m, j], cmp, swp, `目前最小是 ${a[m]}，比較 ${a[j]}`, i);
        if (a[j] < a[m]) m = j;
      }
      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]]; swp++;
        record(a, [i, m], cmp, swp, `把最小的 ${a[i]} 換到第 ${i + 1} 位`, i + 1);
      } else {
        record(a, [i], cmp, swp, `${a[i]} 已在正確位置`, i + 1);
      }
    }
  } else {
    for (let i = 1; i < a.length; i++) {
      const key = a[i]; let j = i - 1;
      record(a, [i], cmp, swp, `取出 ${key} 準備插入`, i);
      while (j >= 0) {
        cmp++;
        record(a, [j, j + 1], cmp, swp, `比較 ${a[j]} 和 ${key}`, i);
        if (a[j] > key) { a[j + 1] = a[j]; swp++; j--; record(a, [j + 1], cmp, swp, `${a[j + 1]} 往後移`, i); }
        else break;
      }
      a[j + 1] = key;
      record(a, [j + 1], cmp, swp, `${key} 插入定位`, i + 1);
    }
  }
  record(a, [], cmp, swp, '✅ 排序完成', 0);
  return { cmp, swp };
}

// ---------- 繪製 ----------
function render() {
  const f = frames[idx] || { a: data, hl: [], cmp: 0, swp: 0, note: '', sortedFrom: data.length };
  const max = Math.max(...f.a, 1);
  document.getElementById('arr').innerHTML = f.a.map((v, i) => {
    let cls = 'arr-bar';
    if (f.hl.includes(i)) cls += ' cmp';
    else if (idx === frames.length - 1) cls += ' done';
    else if (algo !== 'bubble' && i < (f.sortedFrom ?? 0)) cls += ' done';
    else if (algo === 'bubble' && i >= (f.sortedFrom ?? f.a.length)) cls += ' done';
    return `<div class="${cls}" style="height:${20 + v / max * 130}px">${v}</div>`;
  }).join('');
  document.getElementById('stepDesc').textContent = f.note;
  document.getElementById('cmpVal').textContent = f.cmp;
  document.getElementById('swpVal').textContent = f.swp;
  document.getElementById('stVal').textContent = `${idx} / ${frames.length - 1}`;

  const v = document.getElementById('verdict');
  if (idx >= frames.length - 1) {
    const a = ALGOS.find(x => x.id === algo);
    v.className = 'verdict good';
    v.textContent = `✅ ${a.name} 完成：共比較 ${f.cmp} 次、交換 ${f.swp} 次。`;
    if (!bestCmp[algo] || f.cmp < bestCmp[algo]) bestCmp[algo] = f.cmp;
    const p = loadP(); p.module2_best = bestCmp; saveP(p);
    check();
  } else {
    v.className = 'verdict warn';
    v.textContent = `執行中… 已比較 ${f.cmp} 次`;
  }
}

function renderAlgos() {
  document.getElementById('algPick').innerHTML = ALGOS.map(a =>
    `<button data-a="${a.id}" style="padding:10px 16px;border-radius:10px;font-weight:700;font-size:14px;
      border:2px solid ${a.id === algo ? '#6D28D9' : '#e2e8f0'};
      background:${a.id === algo ? '#EDE9FE' : '#fff'};color:${a.id === algo ? '#6D28D9' : '#334155'};cursor:pointer">
      ${a.ico} ${a.name}${seenAlgos.has(a.id) ? ' ✓' : ''}</button>`).join('')
    + `<div style="width:100%;font-size:13.5px;color:#64748b;margin-top:6px">${ALGOS.find(a => a.id === algo).desc}</div>`;
}

function reset(newData) {
  clearInterval(timer); timer = null;
  document.getElementById('auto').textContent = '⏩ 自動播放';
  if (newData) data = Array.from({ length: 8 }, () => 5 + Math.floor(Math.random() * 95));
  buildFrames(data, algo); idx = 0; render();
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_all',  text: '三種排序法都跑完至少一次', hint: '切換上方按鈕，各跑一次到底',
    test: () => seenAlgos.size === 3 },
  { id: 'q_cmp',  text: '觀察到「交換次數」最少的那一種', hint: '選擇排序每輪最多只換一次',
    test: () => seenAlgos.has('selection') },
  { id: 'q_step', text: '用單步模式走過至少 15 步，看清楚每一次比較', hint: '按「單步」慢慢看',
    test: () => stepCount >= 15 },
  { id: 'q_grow', text: '看懂成長表：資料量翻倍時比較次數大約變成幾倍', hint: '往下捲看表格（約 4 倍）',
    test: () => growthSeen },
];
const done = new Set(loadP().module2_quests || []);
let stepCount = loadP().module2_steps || 0;
let growthSeen = false;

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
  const p = loadP(); p.module2_quests = Array.from(done); p.module2_steps = stepCount;
  if (done.size === QUESTS.length) {
    p.module2 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 四個挑戰都完成了！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p); renderQuests();
}

// ---------- 成長表（實測平均） ----------
// 注意：這裡必須用「只計數、不錄影格」的版本。
// 若直接呼叫 buildFrames() 會覆寫全域 frames，而且會為每次比較配置一個影格物件
// （2400 次排序 × 最多數千步 ≈ 上千萬個物件），足以讓瀏覽器卡死。
function countCompares(src, kind) {
  const a = [...src]; let cmp = 0;
  if (kind === 'bubble') {
    for (let i = 0; i < a.length - 1; i++)
      for (let j = 0; j < a.length - 1 - i; j++) {
        cmp++; if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
  } else if (kind === 'selection') {
    for (let i = 0; i < a.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < a.length; j++) { cmp++; if (a[j] < a[m]) m = j; }
      if (m !== i) [a[i], a[m]] = [a[m], a[i]];
    }
  } else {
    for (let i = 1; i < a.length; i++) {
      const key = a[i]; let j = i - 1;
      while (j >= 0) { cmp++; if (a[j] > key) { a[j + 1] = a[j]; j--; } else break; }
      a[j + 1] = key;
    }
  }
  return cmp;
}

function buildGrowth() {
  const sizes = [8, 16, 32, 64];
  const TRIALS = 60;
  const rows = sizes.map(n => {
    const avg = { bubble: 0, selection: 0, insertion: 0 };
    for (let t = 0; t < TRIALS; t++) {
      const arr = Array.from({ length: n }, () => Math.random() * 1000 | 0);
      ALGOS.forEach(a => { avg[a.id] += countCompares(arr, a.id); });
    }
    ALGOS.forEach(a => avg[a.id] = Math.round(avg[a.id] / TRIALS));
    return { n, ...avg };
  });
  document.getElementById('growth').innerHTML = `
    <thead><tr style="background:#f1f5f9">
      <th style="padding:9px;text-align:left;border-bottom:2px solid #cbd5e1">資料量 n</th>
      ${ALGOS.map(a => `<th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">${a.ico} ${a.name}</th>`).join('')}
      <th style="padding:9px;text-align:right;border-bottom:2px solid #cbd5e1">n²</th>
    </tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td style="padding:9px;border-bottom:1px solid #e2e8f0;font-weight:700">${r.n}</td>
      ${ALGOS.map(a => `<td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">
        ${r[a.id]}${i > 0 ? `<span style="color:#94a3b8;font-size:11px"> (×${(r[a.id] / rows[i - 1][a.id]).toFixed(1)})</span>` : ''}</td>`).join('')}
      <td style="padding:9px;text-align:right;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-family:'JetBrains Mono',monospace">${r.n * r.n}</td>
    </tr>`).join('')}
    </tbody>`;
  // 捲到表格即視為看過
  const obs = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { growthSeen = true; check(); obs.disconnect(); }
  }, { threshold: .4 });
  obs.observe(document.getElementById('growth'));
}

// ---------- 綁定 ----------
document.getElementById('algPick').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  algo = b.dataset.a; renderAlgos(); reset(false);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
});
document.getElementById('step').addEventListener('click', () => {
  if (idx < frames.length - 1) { idx++; stepCount++; render();
    const p = loadP(); p.module2_steps = stepCount; saveP(p); check(); }
});
document.getElementById('auto').addEventListener('click', () => {
  if (timer) { clearInterval(timer); timer = null; document.getElementById('auto').textContent = '⏩ 自動播放'; return; }
  document.getElementById('auto').textContent = '⏸ 暫停';
  timer = setInterval(() => {
    if (idx >= frames.length - 1) {
      clearInterval(timer); timer = null;
      document.getElementById('auto').textContent = '⏩ 自動播放';
      seenAlgos.add(algo);
      const p = loadP(); p.module2_seen = Array.from(seenAlgos); saveP(p);
      renderAlgos(); check(); return;
    }
    idx++; render();
  }, 160);
});
document.getElementById('shuffle').addEventListener('click', () => reset(true));
document.getElementById('reset').addEventListener('click', () => reset(false));

renderAlgos(); renderQuests();
if (done.size === QUESTS.length) {
  document.getElementById('next-btn').style.opacity = 1;
  document.getElementById('next-btn').style.pointerEvents = 'auto';
}
reset(true);
buildGrowth();
