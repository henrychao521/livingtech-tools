// 基本手工具 模組 5：保養與維護 + 工作流程模擬器
// 來源編號對應 hand-tools 頁尾「資料來源」區。
const MAINT = [
  { name: '清潔', icon: '🧹', target: '所有工具',
    method: '每次使用後用毛刷掃屑、乾布擦汗液 / 油汙。金屬工具不要用水洗（會生鏽）。鋸子的齒間要清木屑。',
    why: '汗液中的鹽分與木屑會加速金屬生鏽、卡住鋸齒。',
    cite: '[5][6]' },

  { name: '上油防鏽', icon: '🛢', target: '金屬工具（鉸鏈、刀刃、螺紋等金屬接觸面）',
    method: '每月用「3 in 1 油」或「縫紉機油」塗一層薄油即可。台灣潮濕季節（4–9 月）建議每週檢查。鉸鏈位置上油可保持靈活轉動。',
    why: '形成油膜阻隔水分與氧氣接觸金屬，明顯延長工具壽命。',
    cite: '[5]' },

  { name: '磨刃 / 換刃', icon: '⚔', target: '美工刀（換刃片）、雕刻刀（磨刀石）、鋸（送專業磨）；銼刀齒不可重磨',
    method: '美工刀：把刀片伸出 1 格，用內附折斷器或刀套底部金屬槽折斷舊刃（請勿徒手折）；嚴重缺角整片換新。雕刻刀：用磨刀石（油石）順著原刃角單向磨。鋸：齒形磨耗或變形應送專業鋸刃店重整。',
    why: '鈍刀切要施力大、易滑掉——「鈍刀比利刀危險」。銼刀齒部經熱處理硬化，磨平後無法重磨，只能更換<sup>[4]</sup>。',
    cite: '[2][4]' },

  { name: '鬆緊調整', icon: '🔧', target: '螺絲起子、鉗子、扳手鉸鏈',
    method: '鉸鏈鬆掉用六角扳手或專用螺絲微調；活動扳手的調節螺絲卡死可用 WD-40 噴一下後再轉。',
    why: '鬆動的工具會在使力時打滑——失控可能傷人或傷工件。',
    cite: '[1][7]' },

  { name: '修補握把', icon: '🪵', target: '鎚子、銼刀、雕刻刀的木柄',
    method: '木柄輕微裂痕用木膠（白膠或環氧）灌入再夾緊 24 小時。嚴重碎裂或鎚頭與柄已產生鬆動 → 直接換柄，不可繼續使用。',
    why: '裂柄或鬆動的鎚頭使用中可能整顆飛出——是工坊重大事故之一。',
    cite: '[1][8]' },

  { name: '收納分類', icon: '📦', target: '所有工具',
    method: '「影子板」（shadow board）：在工具牆上畫工具輪廓，每件有固定位置。或用工具盒分隔。',
    why: '一眼能看出「少了哪件工具」——也方便下一個使用者找工具。',
    cite: '[8]' },

  { name: '防潮處理', icon: '🌫', target: '台灣 4–9 月梅雨季 / 夏天高濕度',
    method: '工具箱放乾燥劑（矽膠包）。長期不用的金屬工具上厚一層油用塑膠袋密封。',
    why: '台灣全年平均相對濕度約 75–80%——金屬工具放在通風差的櫃內，幾週就可能出現浮鏽。',
    cite: '[5]' },

  { name: '報廢判斷', icon: '🚮', target: '所有工具',
    method: '出現以下情況應立即停用並送修或汰換：\n• 鎚柄出現裂痕（依勞安規範，任何裂痕都應停用）\n• 鋸齒明顯缺損（影響切割線品質）\n• 螺絲起子刀頭歪斜或圓滑（已無法咬合）\n• 鉗子鉸鏈鬆到夾不住目標物\n• 銼刀齒磨平（手摸無刺感，已無切削力）',
    why: '勉強用損壞工具是事故源——汰換成本遠低於受傷成本。',
    cite: '[1][8]' },
];

// 報廢情境：依 OSHA 1910.244 與職安署指引「破損工具立即停用」原則調整
const QUIZ = [
  { sit: '鎚子木柄出現 3 cm 細裂痕，敲擊時稍有晃動', ans: 'replace',
    explain: '應報廢/換柄。依勞安署與 OSHA 指引，鎚柄任何裂痕都應立即停用，因為敲擊時鎚頭可能整顆飛出造成嚴重傷害。木膠修補僅適用於「無敲擊負荷」的工具（如刀柄）。',
    cite: '[1][3][8]' },

  { sit: '銼刀齒嚴重磨平（手摸無刺感，光滑）', ans: 'replace',
    explain: '報廢。銼齒經熱處理硬化，磨平後無法重磨（強行重磨會破壞硬度與齒形）。繼續用只是浪費時間、磨不動。',
    cite: '[4]' },

  { sit: '螺絲起子刀頭歪斜約 30°', ans: 'replace',
    explain: '報廢。歪斜的刀頭鎖螺絲必崩牙、轉鬆螺帽易打滑、傷工件也傷人。',
    cite: '[1][7]' },

  { sit: '尖嘴鉗鉸鏈卡卡轉不順，鉗口本身完好', ans: 'repair',
    explain: '可修：噴 WD-40 鬆動後上油即可。鉸鏈本身沒壞、只是缺潤滑。',
    cite: '[5]' },

  { sit: '鋼鋸框架有 5° 輕微彎曲，鋸條尚可張緊', ans: 'repair',
    explain: '可修：鋼鋸框是「可微調」的設計，用檯虎鉗夾緊輕敲回正、確認張力螺絲仍能上緊即可繼續用。若彎曲超過 10° 或張力螺絲已滑牙則應汰換。',
    cite: '[3]' },
];

const PK = 'ht_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const mEl = document.getElementById('maint');
MAINT.forEach(m => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;border-left:5px solid #64748B';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:26px">${m.icon}</span><h4 style="margin:0;color:#334155;font-size:15px">${m.name}</h4></div>
    <p style="font-size:12px;color:#64748B;font-weight:700;background:#F1F5F9;padding:5px 10px;border-radius:5px;margin:6px 0">適用：${m.target}</p>
    <p style="font-size:12.5px;color:#444;margin:6px 0">${m.method.replace(/\n/g, '<br>')}</p>
    <p style="font-size:12px;color:#666"><strong>為什麼：</strong>${m.why}</p>
    <p style="font-size:11px;color:#94a3b8;margin-top:4px">📚 參考：${m.cite}（見頁尾資料來源）</p>`;
  mEl.appendChild(c);
});

const quizEl = document.getElementById('quiz');
let answered = new Set(); let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
  div.innerHTML = `<p style="font-size:13.5px;margin-bottom:6px"><strong>情境 ${i + 1}：</strong>${q.sit}</p>
    <div class="choice-grid" style="grid-template-columns:1fr 1fr"><button class="choice" data-q="${i}" data-c="repair">🔧 可修復繼續用</button><button class="choice" data-q="${i}" data-c="replace">🚮 應該報廢</button></div>
    <div class="feedback-slot"></div>`;
  quizEl.appendChild(div);
});

quizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  const i = parseInt(b.dataset.q);
  if (answered.has(i)) return;
  const ok = b.dataset.c === QUIZ[i].ans;
  const parent = b.closest('.quiz-item');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}<br><span style="font-size:11px;color:#94a3b8">📚 參考：${QUIZ[i].cite}（見頁尾資料來源）</span></div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module5 = true; p.module5_score = correct; saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));

// =====================================================================
// 🧪 Canvas 互動：「收工保養工作流程」模擬
// 學生把 4 個保養動作卡（清潔／上油／檢查歸位／影子板）拖到時間軸正確順序。
// 同時要避免「先上油再擦汗液」等順序錯誤。
// =====================================================================
const wfCanvas = document.getElementById('workflow-canvas');
if (wfCanvas && wfCanvas.getContext) {
  const ctx = wfCanvas.getContext('2d');
  const W = wfCanvas.width = wfCanvas.clientWidth || 720;
  const H = wfCanvas.height = 280;

  // 正確順序：1. 清潔 → 2. 檢查 → 3. 上油（金屬工具）→ 4. 歸位影子板
  const STEPS_DEF = [
    { id: 'clean',   label: '🧹 用毛刷與乾布清掉木屑、汗液與油汙', correct: 0, color: '#0EA5E9' },
    { id: 'inspect', label: '🔍 檢查鎚柄、銼齒、刀頭、鉸鏈狀態',   correct: 1, color: '#10B981' },
    { id: 'oil',     label: '🛢 金屬接觸面薄薄上一層防鏽油',       correct: 2, color: '#F59E0B' },
    { id: 'shadow',  label: '📦 歸位到影子板（shadow board）原位',  correct: 3, color: '#8B5CF6' },
  ];

  let cards = STEPS_DEF.map((s, i) => ({ ...s, current: i, dragging: false }));
  // 初始隨機打亂
  cards.sort(() => Math.random() - 0.5).forEach((c, i) => c.current = i);

  function slotX(i) { return 60 + i * ((W - 120) / 4); }
  function slotW() { return (W - 120) / 4 - 12; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // 時間軸底
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(40, 40, W - 80, 4);
    for (let i = 0; i < 4; i++) {
      const x = slotX(i);
      // slot
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x, 60, slotW(), 160, 12);
      ctx.fill(); ctx.stroke();
      // step number
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`步驟 ${i + 1}`, x + slotW() / 2, 80);
    }
    // cards on slots
    cards.forEach(c => {
      if (c.dragging) return;
      const x = slotX(c.current);
      drawCard(c, x + 4, 95, slotW() - 8, 110);
    });
    // dragging card on top
    cards.forEach(c => {
      if (c.dragging) drawCard(c, c.dx, c.dy, slotW() - 8, 110);
    });
    // result hint
    const allCorrect = cards.every(c => c.current === c.correct);
    if (allCorrect) {
      ctx.fillStyle = '#16A34A';
      ctx.font = '700 16px Inter, "Noto Sans TC"';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 順序正確！清潔 → 檢查 → 上油 → 歸位', W / 2, 250);
      if (!wfCanvas.dataset.passed) {
        wfCanvas.dataset.passed = '1';
        const p = loadP(); p.module5_workflow = true; saveP(p);
        if (typeof SoundFX !== 'undefined') SoundFX.win();
      }
    }
  }

  function drawCard(c, x, y, w, h) {
    ctx.fillStyle = c.color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '600 12.5px "Noto Sans TC", Inter';
    ctx.textAlign = 'left';
    // 自動換行
    const lines = wrap(c.label, w - 16, ctx);
    lines.forEach((line, i) => ctx.fillText(line, x + 8, y + 26 + i * 18));
  }

  function wrap(text, maxW, c) {
    const out = [];
    let buf = '';
    for (const ch of text) {
      if (c.measureText(buf + ch).width > maxW) { out.push(buf); buf = ch; }
      else buf += ch;
    }
    if (buf) out.push(buf);
    return out.slice(0, 5);
  }

  function pick(mx, my) {
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i];
      const x = slotX(c.current) + 4;
      const w = slotW() - 8;
      if (mx >= x && mx <= x + w && my >= 95 && my <= 95 + 110) return c;
    }
    return null;
  }

  function swapToSlot(card, slot) {
    const occupant = cards.find(c => c !== card && c.current === slot);
    if (occupant) occupant.current = card.current;
    card.current = slot;
  }

  // mouse
  wfCanvas.addEventListener('mousedown', e => {
    const r = wfCanvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (W / r.width);
    const my = (e.clientY - r.top) * (H / r.height);
    const c = pick(mx, my);
    if (c) { c.dragging = true; c.dx = mx - (slotW() - 8) / 2; c.dy = my - 55; draw(); }
  });
  wfCanvas.addEventListener('mousemove', e => {
    const r = wfCanvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (W / r.width);
    const my = (e.clientY - r.top) * (H / r.height);
    const c = cards.find(x => x.dragging);
    if (c) { c.dx = mx - (slotW() - 8) / 2; c.dy = my - 55; draw(); }
  });
  wfCanvas.addEventListener('mouseup', e => {
    const r = wfCanvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (W / r.width);
    const c = cards.find(x => x.dragging);
    if (c) {
      let target = -1;
      for (let i = 0; i < 4; i++) {
        if (mx >= slotX(i) && mx <= slotX(i) + slotW()) { target = i; break; }
      }
      if (target >= 0) swapToSlot(c, target);
      c.dragging = false;
      draw();
    }
  });
  // touch
  wfCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    const r = wfCanvas.getBoundingClientRect();
    const mx = (t.clientX - r.left) * (W / r.width);
    const my = (t.clientY - r.top) * (H / r.height);
    const c = pick(mx, my);
    if (c) { c.dragging = true; c.dx = mx - (slotW() - 8) / 2; c.dy = my - 55; draw(); }
  }, { passive: false });
  wfCanvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const r = wfCanvas.getBoundingClientRect();
    const mx = (t.clientX - r.left) * (W / r.width);
    const my = (t.clientY - r.top) * (H / r.height);
    const c = cards.find(x => x.dragging);
    if (c) { c.dx = mx - (slotW() - 8) / 2; c.dy = my - 55; draw(); }
  }, { passive: false });
  wfCanvas.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const r = wfCanvas.getBoundingClientRect();
    const mx = (t.clientX - r.left) * (W / r.width);
    const c = cards.find(x => x.dragging);
    if (c) {
      let target = -1;
      for (let i = 0; i < 4; i++) {
        if (mx >= slotX(i) && mx <= slotX(i) + slotW()) { target = i; break; }
      }
      if (target >= 0) swapToSlot(c, target);
      c.dragging = false;
      draw();
    }
  });

  // roundRect polyfill (older Safari)
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  draw();
}
