// 焊接平台 模組 3：焊接步驟教學
const STEPS = [
  {
    title: '開機加熱',
    anim: 'heat',
    desc: '插上電源、設定溫度，按下開關。焊錫廠商 Kester 的技術資料寫：烙鐵頭溫度含鉛錫最常用 315–343°C、無鉛錫 371–400°C<sup>[K]</sup>。指示燈閃爍代表加熱中，恆亮代表已達設定溫度可以開始焊接。',
    tip: '等待預熱的時間可以準備海綿、檢查電路板。',
    warn: null,
  },
  {
    title: '海綿沾水擰乾',
    anim: 'sponge',
    desc: '海綿要事先沾水並擰乾。白光（HAKKO）FX-888D 說明書：使用前海綿要先用水沾濕，以免損傷烙鐵頭<sup>[H1]</sup>。',
    tip: '判斷標準：用手指壓海綿不會滴水，但有濕潤感。',
    warn: null,
  },
  {
    title: '烙鐵頭上錫養護（Tinning）',
    anim: 'tinning',
    desc: '預熱完成後，先用焊錫絲輕輕點烙鐵頭，讓烙鐵頭表面均勻覆蓋一層薄錫。這層錫能幫助傳熱、防止氧化。',
    tip: '養護後的烙鐵頭應該是亮銀色。如果是黑色或灰色，要先用海綿擦掉氧化物再養護一次。',
    warn: '長時間沒上錫的烙鐵頭會「死頭」（永久氧化），就算清潔也救不回來。',
  },
  {
    title: '對齊接點',
    anim: 'align',
    desc: '把要焊接的元件腳穿過 PCB 的孔位，元件貼平板面。用電路板夾具固定，或把背面的腳稍微往外彎，讓翻面後元件不會掉；焊接時不要用手扶元件（腳和焊墊會被烙鐵加熱）。多出來的腳等焊點凝固後（步驟 8）再剪，剪的時候不要剪到焊點。',
    tip: '焊接前先把元件腳折成 45°（軸向元件），可以防止元件掉下來。',
    warn: null,
  },
  {
    title: '加熱接點',
    anim: 'heat-pad',
    desc: '烙鐵頭同時碰到焊墊（PCB 銅環）與元件腳，讓兩者一起加熱。注意是先加熱接點，不是直接加熱焊錫<sup>[K][H2]</sup>。',
    tip: '看上方剖面動畫：烙鐵頭從一側斜放，端面同時貼住焊墊與元件腳。',
    warn: '只用尖端碰觸接點會接觸面積太小，加熱不均，造成冷焊。',
  },
  {
    title: '送焊錫',
    anim: 'feed-solder',
    desc: '接點加熱後，從烙鐵的另一邊送焊錫絲到「焊墊或元件腳」上（不是碰烙鐵頭），讓接點的熱把焊錫熔化並流入接點<sup>[K]</sup>。',
    tip: '依 IPC-A-610 標準：焊錫應沿元件腳與焊墊形成「凹形 fillet」、潤濕角 < 90°，貼合銅環表面即可。送太多會堆成包住元件腳的過量錫，太少會缺錫。',
    warn: 'Kester 技術資料：不要把錫絲直接送到烙鐵頭上，會縮短烙鐵頭壽命<sup>[K]</sup>。',
  },
  {
    title: '抽錫絲',
    anim: 'remove-solder',
    desc: '焊錫流滿接點後，先抽走焊錫絲，但烙鐵頭還繼續停留。',
    tip: '抽錫絲是輕輕往後拉，不要拉斷在錫池裡。',
    warn: null,
  },
  {
    title: '移開烙鐵',
    anim: 'remove-iron',
    desc: '焊錫絲抽走後，烙鐵頭稍停讓焊錫流平，再沿著元件腳往上移開。烙鐵不要停留超過需要的時間<sup>[H3]</sup>。焊點凝固前不要移動元件，凝固後再剪掉多餘的元件腳。',
    tip: '完美焊點：表面光亮、凹面像火山錐、覆蓋整個銅環。',
    warn: '焊錫凝固前移動元件會造成「冷焊」，焊點霧霧的、易脫落。',
  },
];

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();
let currentStep = 0;

const PROGRESS_KEY_S = 'solder_progress_v1';
function loadSolderProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || {}; } catch { return {}; }
}
function saveSolderProgress(p) {
  localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p));
}

const savedProg = loadSolderProgress();
if (savedProg.module3_seen) savedProg.module3_seen.forEach(i => seenSteps.add(i));
// 已完成過本模組：重新整理或回頭複習時，下一關維持解鎖
if (savedProg.module3) {
  document.getElementById('next-btn').style.opacity = 1;
  document.getElementById('next-btn').style.pointerEvents = 'auto';
}

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.dataset.idx = i;
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

const M3_SOURCES = `<details class="m3-src"><summary>出處</summary><ul>
  <li>[K] Kester，〈44 Flux-Cored Wire〉技術資料（Process Considerations）。</li>
  <li>[H1] 白光 HAKKO，FX-888D 使用說明書（Setup the iron holder、CAUTION）。</li>
  <li>[H2] 白光 HAKKO UK，烙鐵頭產品頁 Point soldering 說明（烙鐵頭同時接觸焊墊與通孔，再送錫形成平滑焊角）。</li>
  <li>[H3] 白光 HAKKO，980 型烙鐵資料頁（Do NOT leave the iron in contact with the joint any longer than necessary）。</li>
</ul></details>`;

function selectStep(i) {
  currentStep = i;
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / 08</div>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p class="m3-anim-cap">示意動畫，本站繪製；動畫快慢不代表實際秒數。</p>
    <p>${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    ${/<sup>\[/.test(s.desc + s.tip + (s.warn || '')) ? M3_SOURCES : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '我已了解，下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / 8 步`;
  const prog = loadSolderProgress();
  prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 八個步驟都看完了，準備好進入模擬練習！', 'good');
  }
  saveSolderProgress(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}

// 動畫在 js/module3-anims.js（本站繪製；步驟 4–8 為通孔焊點側視剖面）
function renderAnim(type) {
  return (window.SOLDER_M3_ANIMS && window.SOLDER_M3_ANIMS[type]) || '';
}

selectStep(0);
window.selectStep = selectStep;
window.markDone = markDone;

// === 步驟排序拼圖 ===
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的步驟排回正確順序',
    onComplete: () => {
      try {
        const k = 'solder_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module3_puzzle = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    }
  });
}

/* ── 溫度感知與焊點判讀測驗 ──────────────────────────────── */
;(function () {
  const TQ = [
    {
      situation: '烙鐵設定 250°C，焊接含鉛錫（Sn63Pb37，熔點 183°C）時焊錫依然無法流動，你認為原因是？',
      options: [
        '溫度超過熔點，焊錫應該會流動，可能是焊錫有問題',
        '250°C 雖超熔點，但接觸冷接點後溫度快速下降，熱容量不足以充分潤濕接點',
        '焊錫成分比例不正確，換一種牌子就好'
      ],
      correct: 1,
      explain: '正確！烙鐵頭接觸冷接點後溫度會驟降，250°C 的熱容量不足以快速加熱接點。建議使用 320–360°C，才能讓接點快速升溫、焊錫充分潤濕，避免焊錫在流動前就重新凝固造成冷焊。'
    },
    {
      situation: '焊接 0402 SMD 超小元件時，你把烙鐵調到 430°C，認為高溫縮短接觸時間、元件更安全。這個做法正確嗎？',
      options: [
        '正確，高溫縮短焊接時間，元件受熱更少、更安全',
        '錯誤，430°C 瞬間過熱反而更容易燒損 SMD 元件和 PCB 焊墊銅箔',
        '溫度不影響焊接品質，重點是進錫速度'
      ],
      correct: 1,
      explain: '錯誤做法！對小型 SMD 元件，高溫非常危險。430°C 接觸瞬間就能讓電容、二極體等元件過熱失效，或使 PCB 銅箔脫落（Delamination）。正確做法：維持一般工作溫度（含鉛錫約 320°C，不超過 360°C）+ 快速手法（1–2 秒完成焊接）。'
    },
    {
      situation: '焊接後烙鐵頭表面出現深褐色氧化層，你拿砂紙把氧化層磨掉，覺得這樣比海綿更徹底。對嗎？',
      options: [
        '對，砂紙比海綿更能徹底清除氧化，效果更好',
        '不對，砂紙會磨掉烙鐵頭的保護鍍層，使其更快氧化，應用濕海綿擦後立刻上錫',
        '可以，只要磨輕一點、不磨太深就沒問題'
      ],
      correct: 1,
      explain: '千萬不可用砂紙！烙鐵頭有特殊保護鍍層（通常是鍍鐵），磨掉後銅芯直接暴露，氧化速度會更快，最終造成「死頭」。正確做法：濕海綿輕擦 → 立刻上錫（Tinning）隔絕氧氣。'
    },
    {
      situation: '焊完的焊點表面光亮，但凸起成一大包、把元件腳整個包住，看不到錐形 fillet 與腳的輪廓。這代表什麼問題？',
      options: [
        '完美焊點！光亮就是品質好的表現',
        '過量焊錫（Excess Solder），是相鄰焊點短路的潛在風險，不符合 IPC-A-610 標準',
        '焊錫成分不對，應換成無鉛焊錫'
      ],
      correct: 1,
      explain: '凸起包住元件腳的焊點代表焊錫過量，無法形成凹形 fillet（潤濕角 < 90°）反而堆成一大包。這是不良焊點，容易觸碰相鄰焊墊造成短路（Solder Bridge）。應重新加熱讓多餘焊錫流走，或用吸錫線吸除後補焊。'
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🌡️ 溫度感知與焊點判讀測驗</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">焊接溫度與技術細節密切相關。從以下情境中選出正確判斷，培養溫度直覺與焊點鑑別能力。</p>
    <div id="temp-quiz-list"></div>
    <div id="temp-quiz-result" style="margin-top:12px"></div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const container = document.getElementById('temp-quiz-list');
  let tqScore = 0;
  const tqAnswered = new Set();
  // 作答紀錄（js/sheet-log.js）：4 題答完送一筆
  const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: TQ.map((q, i) => ({
    key: 'temp' + i, t: 'scenario', stem: q.situation, options: q.options, answer: q.correct })) });

  TQ.forEach((q, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:12px';
    div.innerHTML = `
      <p style="font-size:14px;color:#1e293b;margin:0 0 12px"><strong>情境 ${i + 1}：</strong>${q.situation}</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${q.options.map((o, j) => `<button class="tq-btn" data-q="${i}" data-c="${j}"
          style="text-align:left;padding:10px 14px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s;line-height:1.5">
          <strong style="color:#475569">${String.fromCharCode(65 + j)}.</strong> ${o}
        </button>`).join('')}
      </div>
      <div class="tq-feedback" style="margin-top:10px"></div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('.tq-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#f1f5f9'; });
    btn.addEventListener('mouseleave', () => { if (!btn.disabled && btn.style.borderColor === 'rgb(203, 213, 225)') btn.style.background = '#f8fafc'; });
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.q);
      const c = parseInt(btn.dataset.c);
      if (tqAnswered.has(i)) return;
      tqAnswered.add(i);
      const correct = c === TQ[i].correct;
      if (SLQ) SLQ.answer('temp' + i, c);
      // .tq-feedback 在卡片層，而 closest('div[style]') 會停在選項的 flex 容器，
      // 於是 fb.innerHTML 每次都丟例外，測驗不計分也不顯示解說。
      let parent = btn.parentElement;
      while (parent && !parent.querySelector('.tq-feedback')) parent = parent.parentElement;
      if (!parent) return;
      parent.querySelectorAll('.tq-btn').forEach((b, k) => {
        b.disabled = true;
        b.style.cursor = 'default';
        if (k === TQ[i].correct) {
          b.style.background = '#dcfce7';
          b.style.borderColor = '#16a34a';
          b.style.color = '#15803d';
        }
        if (b === btn && !correct) {
          b.style.background = '#fee2e2';
          b.style.borderColor = '#dc2626';
          b.style.color = '#b91c1c';
        }
      });
      const fb = parent.querySelector('.tq-feedback');
      const style = correct
        ? 'background:#f0fdf4;border:1px solid #86efac;color:#15803d'
        : 'background:#fff7ed;border:1px solid #fdba74;color:#9a3412';
      fb.innerHTML = `<div style="padding:10px 14px;border-radius:8px;font-size:13px;line-height:1.7;${style}">
        ${correct ? '✓ 正確！' : '✗ 不對。'} ${TQ[i].explain}
      </div>`;
      if (correct) { tqScore++; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
      else if (typeof SoundFX !== 'undefined') SoundFX.error();

      if (tqAnswered.size === TQ.length) {
        if (SLQ) SLQ.finish({ score: tqScore, max: TQ.length });
        const result = document.getElementById('temp-quiz-result');
        const pct = Math.round(tqScore / TQ.length * 100);
        const pass = pct >= 75;
        result.innerHTML = `<div style="padding:16px 20px;border-radius:12px;text-align:center;font-size:15px;margin-top:4px;${pass
          ? 'background:#f0fdf4;border:2px solid #22c55e;color:#15803d'
          : 'background:#fff7ed;border:2px solid #f97316;color:#9a3412'}">
          ${pass ? '🌡️ 溫度感知測驗通過！' : '📖 再複習一次操作步驟再挑戰！'}&ensp;<strong>${tqScore} / ${TQ.length} 答對（${pct}%）</strong>
        </div>`;
        if (pass) {
          if (typeof SoundFX !== 'undefined') SoundFX.win();
          try {
            const k = 'solder_progress_v1';
            const p = JSON.parse(localStorage.getItem(k)) || {};
            p.module3_tempquiz = true;
            localStorage.setItem(k, JSON.stringify(p));
          } catch (e) {}
          if (typeof showToast === 'function') showToast('🌡️ 溫度感知測驗通過！', 'good');
        }
      }
    });
  });
})();

/* ── 拆焊：焊錯了怎麼救 ──────────────────────────────── */
;(function () {
  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'desolder-guide';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🧯 拆焊：焊錯了怎麼救</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">焊錯位置、錫橋短路、冷焊要重焊——都不用慌。把錫「請」下來的工具有兩種：吸錫器與吸錫線。模組 4 的 L5 關卡（修正錯誤焊）就是在練這件事。</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px">
        <h4 style="margin:0 0 10px;font-size:15px;color:#1e293b">💉 吸錫器（四步）</h4>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.9">
          <li><strong>加熱焊點至錫熔</strong>：烙鐵頭貼住要拆的焊點，等焊錫完全熔成亮液態。</li>
          <li><strong>吸嘴貼上</strong>：先把吸錫器活塞壓下卡住，吸嘴貼緊熔化的焊點旁。</li>
          <li><strong>按下釋放鈕吸走</strong>：「啵」一聲，熔錫瞬間被吸進管內。</li>
          <li><strong>檢查孔位</strong>：孔位應乾淨透光、元件腳能鬆動。沒吸乾淨就補一點新錫再吸一次。</li>
        </ol>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px">
        <h4 style="margin:0 0 10px;font-size:15px;color:#1e293b">🎗️ 吸錫線（三步）</h4>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.9">
          <li><strong>線壓在焊點上</strong>：把吸錫線（銅編織線）平放蓋住要拆的焊點。</li>
          <li><strong>烙鐵隔著吸錫線加熱</strong>：烙鐵頭壓在吸錫線上，熱量穿過吸錫線熔化下方焊錫。</li>
          <li><strong>錫被吸入編織線</strong>：毛細作用讓熔錫「爬」進編織線，吸錫線變銀色就成功了。用過的段落剪掉。</li>
        </ol>
      </div>
    </div>
    <div style="margin-top:12px;padding:10px 14px;background:#fff7ed;border-left:3px solid #f97316;border-radius:6px;font-size:13px;color:#9a3412;line-height:1.7">
      <strong>⚠ RoHS 無鉛焊錫提醒：</strong>無鉛焊錫（RoHS，例如老師示範用的 SAC305）熔點比含鉛錫（Sn63Pb37）高，拆焊時需要略高的溫度（約 360°C）與更久的加熱時間，別以為「加熱兩秒還沒熔」是工具壞了。
    </div>
    <div style="margin-top:10px;padding:10px 14px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:6px;font-size:13px;color:#15803d;line-height:1.7">
      <strong>💡 拆完之後：</strong>孔位清乾淨、銅環沒受損，就可以照前面八個步驟重新焊一次。拆焊不是失敗，是每個焊接高手都會的「後悔藥」。
    </div>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();
