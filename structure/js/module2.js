// 橋樑工程師實驗室 模組 2：材料與安全係數
const PK = 'structure_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
function getGrade() { return loadP().grade || '7'; }

let matScore = 0, sfScore = 0, ppeScore = 0;
const PTS_PER_SF = 10;

/* ── 材料資料 ──────────────────────────────────────────── */
const MATERIALS_INFO = {
  steel: {
    name: '鋼 Steel', color: '#64748b',
    desc: '現代橋樑的主力材料。高強度、高剛性、可焊接、可塑性佳。唯一缺點：需要定期防鏽塗裝，且自重大。E=200GPa 意味著受力後幾乎不變形。',
    pros: ['高降伏強度（250MPa）', '拉壓均優', '可焊接成各種形狀', '回收率 100%'],
    cons: ['容易銹蝕（需塗裝）', '自重大（7850 kg/m³）', '高溫下強度急降（600°C 後折半）'],
  },
  wood: {
    name: '木材 Wood', color: '#a16207',
    desc: '傳統橋樑與小型木棧橋的選材。有紋理（順紋強、橫紋弱），受壓容易挫屈，受拉有裂縫風險。輕量且加工容易，但需防腐處理。',
    pros: ['輕量（600 kg/m³）', '加工容易', '低碳排（固碳材料）', '地震阻尼佳'],
    cons: ['順紋受拉可、橫紋受拉差', '受壓長桿易挫屈', '腐朽・蟲害風險', '強度差異大（需測試）'],
  },
  bamboo: {
    name: '竹子 Bamboo', color: '#65a30d',
    desc: '台灣傳統竹橋的材料，也是現代低碳工程的明星。重量對強度比（比強度）甚至高於鋼！但連接節點難處理，不適合大跨度。',
    pros: ['高比強度（80MPa / 700kg/m³）', '快速生長（3 年可收穫）', '天然外觀'],
    cons: ['節點連接困難', '壓桿細長易挫屈', '吸水後強度下降', '難以標準化'],
  },
  concrete: {
    name: '混凝土 Concrete', color: '#78716c',
    desc: '抗壓極強（25MPa）但幾乎不能承受張力（抗張只有 1~2MPa）。必須配合鋼筋（RC）或預力（PC）才能用於橋樑。造價低、耐久性高。',
    pros: ['抗壓強（25MPa）', '耐久（50年以上）', '造價低', '防火性佳'],
    cons: ['幾乎無法抗張力', '自重極大（2400kg/m³）', '裂縫後難修復', '施工需模版'],
  },
};

// 關卡 1：材料表點擊
let matSeenSet = new Set(loadP().m2_materials || []);
let matDone = false;

document.querySelectorAll('#material-table tbody tr').forEach(tr => {
  tr.addEventListener('click', () => {
    const id = tr.dataset.id;
    const m = MATERIALS_INFO[id];
    if (!m) return;
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    const infoEl = document.getElementById('material-info');
    infoEl.style.display = 'block';
    infoEl.innerHTML = `
      <h3 style="color:${m.color}">${m.name}</h3>
      <p class="desc" style="font-size:14px;color:var(--text-soft);line-height:1.7;margin-top:8px">${m.desc}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
        <div style="background:#dcfce7;border-radius:10px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:#15803d;margin-bottom:6px">✅ 優點</div>
          ${m.pros.map(p => `<div style="font-size:13px;color:#15803d">• ${p}</div>`).join('')}
        </div>
        <div style="background:#fee2e2;border-radius:10px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:6px">⚠ 缺點</div>
          ${m.cons.map(c => `<div style="font-size:13px;color:#991b1b">• ${c}</div>`).join('')}
        </div>
      </div>
    `;
    if (!matSeenSet.has(id)) {
      matSeenSet.add(id);
      tr.style.background = 'var(--primary-light)';
      const pp = loadP(); pp.m2_materials = Array.from(matSeenSet); saveP(pp);
      if (matSeenSet.size === 4 && !matDone) {
        matDone = true;
        matScore = 10;
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        document.getElementById('material-feedback').innerHTML = '<div class="feedback success" style="margin-top:8px">✅ 四種材料全部了解！+10 分</div>';
        updateScore();
        showToast('🎉 材料特性全掌握！', 'good');
      }
    }
  });
});

/* ── 安全係數（SF）闖關題目 ─────────────────────────────── */
const SF_SCENARIOS = [
  { q: '一根鋼桿設計承受 50kN，實驗到 120kN 才破壞，安全係數是多少？是否符合橋樑 SF≥2.0 規定？', a: '1.2，不符合', b: '2.4，符合！SF = 120/50 = 2.4', correct: 'b', explain: 'SF = 失效載重 / 設計載重 = 120kN / 50kN = 2.4。大於 2.0，符合基本規定。SF 越高越安全，但材料用量也越多。' },
  { q: '木橋設計承載 10kN，破壞試驗到 18kN。SF = 1.8，是否可以開放給行人通行？', a: '1.8 < 2.0，不安全，不應開放', b: '差一點，稍微加固就好了', correct: 'a', explain: 'SF < 2.0 在橋樑設計中不合格。即使只差 0.2，也代表結構可靠性不足。必須重新設計或限制使用載重，而非「差一點就算了」。' },
  { q: '橋桿鋼材 25 年後因腐蝕，有效截面積從 40cm² 減少到 28cm²。原本 SF=2.6，腐蝕後 SF 約多少？', a: '仍然 2.6，沒影響', b: '約 1.82，已低於安全值', correct: 'b', explain: 'SF 與截面積成正比（強度 = 降伏應力 × 面積）。28/40 = 0.7，SF 降為 2.6×0.7 ≈ 1.82 < 2.0。這就是 Silver Bridge 的悲劇——眼板腐蝕讓 SF 從設計值大幅下降。' },
  { q: '橋樑設計地震係數 0.2g（台灣規定），工程師想省錢把 SF 從 2.5 降到 1.8，選擇輕量材料。這樣做可以嗎？', a: '不行！SF<2 在地震國家更危險', b: '可以，輕量代表地震力也更小', correct: 'a', explain: '台灣是地震高風險區，橋樑必須同時考慮靜載（dead load）和活載（live load，含地震）。SF降到1.8代表地震時幾乎沒有安全餘量。正確做法是在輕量化同時維持足夠 SF。' },
  { q: '設計師用竹子橋桿（降伏強度 80MPa），截面積 6cm²，承受最大軸力 30kN。SF 是多少？', a: '約 1.6，不安全', b: '約 1.6，但竹橋可以例外', correct: 'a', explain: '強度 = 80MPa × 0.0006m² = 48kN，SF = 48/30 ≈ 1.6 < 2.0。竹子並不在例外規範內——如果要用竹橋，必須增大截面積或降低設計載重，使 SF ≥ 2.0。' },
  { q: '一座人行天橋 SF=3.0，工程師說「可以再省一點」，把 SF 降到 2.1。這是合理的節省嗎？', a: '合理，2.1 仍符合 SF≥2 規定', b: '要看具體情況，考慮維護成本和使用年限', correct: 'b', explain: 'SF=2.1 技術上符合規定，但過低的 SF 代表未來若有腐蝕、超重使用、地震，安全餘量快速消耗。優秀的工程師會用生命週期成本分析（初建費 vs 維護費 vs 意外損失）來決定合理的 SF。' },
  { q: '台灣颱風期間橋樑同時承受行人、車輛和強風荷重，SF 設計值應該如何考量？', a: '只要靜載達到 SF=2 即可', b: '應以組合載重設計，各工況都需達 SF≥2', correct: 'b', explain: '台灣規範採「載重組合設計法」：靜載 DL + 活載 LL + 颱風側風力 WL，每種組合都必須 SF≥2（或配合折減因數）。只考慮靜載是不夠的——颱風時 WL 可能與 LL 同向疊加。' },
  { q: '混凝土橋墩設計抗壓強度 25MPa，承受壓力 8MPa，SF = 25/8 = 3.125。但混凝土幾乎不能受張力，這時需要？', a: '不用管，SF 已足夠', b: '加入鋼筋（RC）抵抗張力，避免拉力區開裂', correct: 'b', explain: '混凝土抗張強度僅有抗壓的 1/10。如果橋墩有任何彎矩（如地震橫向力），就會在橋墩側面產生張力而開裂。鋼筋混凝土（RC）就是讓鋼筋負責抗張，混凝土負責抗壓。' },
  { q: '一根橋桿截面積 8cm²，鋼材降伏強度 250MPa，最大受力 140kN。這根桿安全嗎？', a: '安全，SF = 250×8×10⁻⁴ / 0.14 = 1.43…不安全！', b: '安全，因為 140kN 看起來不大', correct: 'a', explain: 'SF = 強度 / 力 = (250MPa × 0.0008m²) / 140kN = 200kN / 140kN = 1.43 < 2.0。即使選項文字看起來很複雜，計算結果告訴你不安全——這就是為什麼工程師不能「看感覺」，必須算 SF。' },
  { q: '安全係數 SF 代表什麼？工程師為什麼不直接把 SF 設計成 1.0（恰好不壞）就好？', a: '因為規定要大於 1.0，只是法規要求', b: 'SF 反映材料變異、預測誤差、意外超載的保險——世界上沒有完美的計算', correct: 'b', explain: 'SF > 1 是對「不確定性」的緩衝：材料強度有統計分布（可能低於平均）、載重預測不精準、施工可能有瑕疵、老化會降低強度。SF=2 代表即使實際強度只有設計值的 50%，橋仍然安全。' },
];

const sfList = document.getElementById('sf-list');
const sfAnswered = new Set();

SF_SCENARIOS.forEach((s, i) => {
  const div = document.createElement('div');
  div.className = 'scenario';
  div.innerHTML = `<h4>${i+1}. ${s.q}</h4>
    <div class="choice-grid">
      <button class="choice" data-q="${i}" data-c="a">A. ${s.a}</button>
      <button class="choice" data-q="${i}" data-c="b">B. ${s.b}</button>
    </div>
    <div class="feedback-slot"></div>`;
  sfList.appendChild(div);
});

sfList.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (sfAnswered.has(i)) return;
  const s = SF_SCENARIOS[i];
  const correct = btn.dataset.c === s.correct;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === s.correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓' : '✗'} ${s.explain}</div>`;
  if (correct) { sfScore += PTS_PER_SF; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  else if (typeof SoundFX !== 'undefined') SoundFX.error();
  sfAnswered.add(i);
  updateScore();

  if (sfAnswered.size === SF_SCENARIOS.length) {
    const total = matScore + sfScore + ppeScore;
    const resultDiv = document.getElementById('sf-result');
    if (total >= 100) {
      resultDiv.innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${total} 分！安全係數觀念掌握優秀！</strong></div>`;
    } else {
      resultDiv.innerHTML = `<div class="feedback error" style="margin-top:20px">${total} 分，未達 100 分，請重新整理再挑戰。</div>`;
    }
    checkUnlock();
  }
}));

// 年級說明
const gradeNote = document.getElementById('sf-grade-note');
const g = loadP().grade || '7';
const notes = {
  '7': 'SF 安全係數：就是「幾倍保險」的意思。蓋橋至少要 2 倍，才算安全。',
  '8': 'SF = 失效載重 / 設計載重。SF ≥ 2.0 是台灣橋樑設計基本要求（CNS 規範）。',
  '9': 'SF 源於容許應力設計法（ASD）。現代也用載重抵抗係數設計法（LRFD），以機率統計取代固定 SF。',
  'T': '教師提示：題目答案設計讓學生透過計算驗證 SF，避免憑感覺選答案。可搭配計算機讓學生驗算。',
};
gradeNote.textContent = notes[g] || notes['7'];
if (!notes[g]) gradeNote.classList.add('hidden');

/* ── 分數更新 ──────────────────────────────────────────── */
function updateScore() {
  const total = matScore + sfScore + ppeScore;
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = Math.min(100, total / 1.4) + '%';
}

function checkUnlock() {
  const total = matScore + sfScore + ppeScore;
  if (total >= 100 && ppeScore >= 30) {
    document.getElementById('unlock').classList.remove('hidden');
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    const pp = loadP(); pp.module2 = true; saveP(pp);
  }
}

/* ── PPE 拖放系統 ──────────────────────────────────────── */
;(function() {
  const PPE_WRONG = {
    'st-slippers': '⚠ 拖鞋在工地無法保護腳趾，踩到鋼筋或重物會嚴重受傷！應穿鋼頭安全鞋。',
    'st-earphone': '⚠ 耳機會遮蔽起重機警報、叫聲等危險訊號，是工地大忌。',
    'st-scarf': '⚠ 寬鬆圍巾在工地可能被機械捲入，或擋住視線造成跌落危險。',
  };
  const PPE_VISUALS = {
    'st-helmet': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'sv-helmet');
      g.innerHTML = `<g transform="translate(80,42)">
        <ellipse cx="30" cy="14" rx="30" ry="18" fill="#f59e0b"/>
        <ellipse cx="30" cy="20" rx="30" ry="7" fill="#fbbf24"/>
        <rect x="6" y="22" width="48" height="5" rx="2" fill="#fbbf24"/>
        <rect x="10" y="2" width="8" height="6" rx="2" fill="#fbbf24"/>
      </g>`;
      return g;
    },
    'st-goggles': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'sv-goggles');
      g.innerHTML = `<g transform="translate(84,90)">
        <ellipse cx="14" cy="12" rx="12" ry="8" fill="#1a1a1a" opacity=".8"/>
        <ellipse cx="38" cy="12" rx="12" ry="8" fill="#1a1a1a" opacity=".8"/>
        <line x1="26" y1="12" x2="26" y2="12" stroke="#1a1a1a" stroke-width="3"/>
        <ellipse cx="14" cy="12" rx="9" ry="5.5" fill="rgba(135,206,250,.55)"/>
        <ellipse cx="38" cy="12" rx="9" ry="5.5" fill="rgba(135,206,250,.55)"/>
      </g>`;
      return g;
    },
    'st-harness': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'sv-harness');
      g.innerHTML = `<g transform="translate(80,160)">
        <rect x="0" y="0" width="60" height="8" rx="3" fill="#dc2626"/>
        <rect x="24" y="0" width="12" height="30" rx="3" fill="#dc2626"/>
        <rect x="0" y="30" width="60" height="8" rx="3" fill="#dc2626"/>
        <text x="30" y="24" text-anchor="middle" font-size="7" fill="#fff" font-weight="800" font-family="Noto Sans TC,sans-serif">安全帶</text>
      </g>`;
      return g;
    },
  };

  const ppeSvg = document.getElementById('ppe-svg');
  const items = document.querySelectorAll('#ppe-items .draggable');
  const zones = document.querySelectorAll('#ppe-scene .svg-dropzone');
  let dragged = null, ppeDone = 0;

  zones.forEach(z => {
    z.addEventListener('mouseenter', () => { if (!z.classList.contains('filled')) z.setAttribute('stroke','#0d9488'); });
    z.addEventListener('mouseleave', () => { if (!z.classList.contains('filled')) z.setAttribute('stroke','#cbd5e1'); });
  });

  items.forEach(item => {
    item.addEventListener('dragstart', e => { dragged = item; e.dataTransfer.effectAllowed = 'move'; if (typeof SoundFX !== 'undefined') SoundFX.click(); });
    item.addEventListener('click', () => {
      if (item.classList.contains('placed')) return;
      items.forEach(i => i.style.outline = '');
      item.style.outline = '3px solid #0d9488';
      dragged = item;
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.setAttribute('stroke','#0d9488'); zone.setAttribute('stroke-width','3'); zone.setAttribute('fill','rgba(13,148,136,.1)'); });
    zone.addEventListener('dragleave', () => { if (!zone.classList.contains('filled')) { zone.setAttribute('stroke','#cbd5e1'); zone.setAttribute('stroke-width','1.5'); zone.setAttribute('fill','transparent'); } });
    zone.addEventListener('drop', e => { e.preventDefault(); handleDrop(zone); });
    zone.addEventListener('click', () => { if (dragged) handleDrop(zone); });
  });

  function handleDrop(zone) {
    if (!dragged) return;
    const accept = zone.dataset.accept;
    const id = dragged.dataset.id;
    const correct = dragged.dataset.correct === '1';
    if (id === accept && correct) {
      zone.classList.add('filled');
      zone.setAttribute('stroke','#16a34a'); zone.setAttribute('stroke-width','2'); zone.setAttribute('fill','rgba(22,163,74,.1)');
      dragged.classList.add('placed'); dragged.style.outline = '';
      ppeScore += 10;
      const vFn = PPE_VISUALS[id];
      if (vFn) ppeSvg.appendChild(vFn());
      if (typeof SoundFX !== 'undefined') SoundFX.success();
      ppeDone++;
      showFb('✓ 正確！', 'success');
      updateScore();
      if (ppeDone >= 3) {
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        document.getElementById('ppe-feedback').innerHTML = `<div class="feedback success">🎉 工地護具配置完成！</div>`;
        checkUnlock();
      }
    } else if (correct) {
      if (typeof SoundFX !== 'undefined') SoundFX.warn();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      showFb(`位置不對，請拖到「${zone.dataset.label}」區域`, 'error');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.error();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      showFb(PPE_WRONG[id] || '這個物品不適合帶入工地！', 'error');
    }
    dragged = null;
  }

  function showFb(msg, type) {
    const fb = document.getElementById('ppe-feedback');
    fb.innerHTML = `<div class="feedback ${type}" style="margin-top:8px">${msg}</div>`;
    setTimeout(() => { if (fb.innerHTML.includes(msg)) fb.innerHTML = ''; }, 4000);
  }
})();
