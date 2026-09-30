// 雷射切割 模組 2：RDWorks 九步驟排序
// 觸控裝置 HTML5 拖放不可靠，故同時提供 ▲▼ 按鈕作為主要操作方式。
const PK = 'laser_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const STEPS = [
  { id: 's1', t: '匯入圖檔', sub: 'AI / DXF / PLT 等向量格式',
    why: '雷切吃的是<strong>向量路徑</strong>，不是點陣圖。JPG、PNG 只能拿來雕刻，不能拿來切割——因為機器不知道要沿著哪條線走。' },
  { id: 's2', t: '確認圖面尺寸', sub: '對照板材實際大小',
    why: '不同軟體匯出的單位可能不一致（mm / inch / 像素）。先量一次，可以避免「圖看起來對、切出來大兩倍」。' },
  { id: 's3', t: '依加工方式建立圖層', sub: '用顏色區分切割／刻線／雕刻',
    why: 'RDWorks 用<strong>顏色</strong>來分圖層，每個顏色可以設定不同的速度與功率。沒分圖層就只能用同一組參數處理全部線條。' },
  { id: 's4', t: '設定各圖層的速度與功率', sub: '依材料與板厚查表或試切',
    why: '同一張圖上「要切斷的線」和「只要刻痕的線」需要完全不同的能量。這一步做完才知道會不會切透。' },
  { id: 's5', t: 'Preview 預覽加工路徑', sub: '看順序與空跑路徑',
    why: '預覽會顯示雷射實際會怎麼走。可以提早發現圖層順序錯誤（例如先切外框導致件掉下去）。' },
  { id: 's6', t: 'Download 傳送到控制器', sub: '把檔案送進機器',
    why: 'RDWorks 是先把整份工作下載到控制器再執行，不是即時連線。傳完之後電腦其實可以不用一直連著。' },
  { id: 's6b', t: '放置板材、對焦並設定原點', sub: '在機台上完成',
    why: '板材要放平；<strong>焦距</strong>對在材料表面，能量才集中，否則「參數明明對卻切不斷」。再把雷射頭移到板材上要開始的位置按<strong>定位（設原點）</strong>——後面的掃框和加工都以這個原點為準，沒設好就會切到板材外面。' },
  { id: 's7', t: 'Frame 掃框確認位置', sub: '雷射頭空走一圈範圍',
    why: '<strong>最常被跳過、也最不該跳過的一步。</strong>三秒鐘確認加工範圍在板材內，避免切到台面或切在空氣中。' },
  { id: 's8', t: '開始加工並全程留守', sub: '人不能離開',
    why: '雷切是明火風險作業。起火通常在幾秒內發生，人在旁邊才來得及按急停。' },
];

let order = [];
// 作答紀錄（js/sheet-log.js）：排序題（a／k 用步驟原始序號），記第一次按「檢查順序」排出的順序與檢查次數；
// 排對時送一筆，沒排對就離開頁面也會送
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'exercise', sendOnLeave: true, questions: [{
  key: 'order', t: 'order', stem: 'RDWorks 雷射切割九步驟排序', items: STEPS.map(s => s.t) }] });
const listEl = document.getElementById('steps');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');
let solved = !!loadP().module2;

function shuffle() {
  order = STEPS.map(s => s.id);
  // 確保打亂後不等於正解
  do { for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } }
  while (order.join() === STEPS.map(s => s.id).join());
  render();
}

function render(marks) {
  listEl.innerHTML = order.map((id, i) => {
    const s = STEPS.find(x => x.id === id);
    const cls = marks ? (marks[i] ? 'ok' : 'no') : '';
    return `<li class="step-item ${cls}" draggable="true" data-id="${id}" data-i="${i}">
      <span class="step-num">${i + 1}</span>
      <span style="flex:1"><span class="step-txt">${s.t}</span><br><span class="step-sub">${s.sub}</span></span>
      <span style="display:flex;flex-direction:column;gap:3px">
        <button class="mv" data-d="-1" data-i="${i}" aria-label="上移" style="border:1px solid #cbd5e1;background:#fff;border-radius:6px;width:32px;height:24px;cursor:pointer;font-size:11px">▲</button>
        <button class="mv" data-d="1" data-i="${i}" aria-label="下移" style="border:1px solid #cbd5e1;background:#fff;border-radius:6px;width:32px;height:24px;cursor:pointer;font-size:11px">▼</button>
      </span></li>`;
  }).join('');
}

function renderExplain() {
  document.getElementById('explain').innerHTML = STEPS.map((s, i) => `
    <div style="background:#f8fafc;border-radius:10px;padding:13px 15px;margin-bottom:9px;border-left:4px solid #E11D48">
      <div style="font-weight:800;font-size:14px;color:#9F1239">${i + 1}. ${s.t}</div>
      <div style="font-size:13.5px;color:#475569;line-height:1.7;margin-top:4px">${s.why}</div>
    </div>`).join('');
}

function checkOrder() {
  const correct = STEPS.map(s => s.id);
  const marks = order.map((id, i) => id === correct[i]);
  const nRight = marks.filter(Boolean).length;
  if (SLQ) { SLQ.answer('order', order.map(id => STEPS.findIndex(s => s.id === id))); if (nRight === STEPS.length) SLQ.finish(); }
  render(marks);
  const v = document.getElementById('verdict');
  if (nRight === STEPS.length) {
    v.className = 'verdict good';
    v.textContent = '✅ 全部正確！下方已解鎖每一步的說明。';
    solved = true;
    const p = loadP(); p.module2 = true; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    renderExplain();
    progEl.textContent = '排序 ✓ 完成';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 順序正確！', 'good');
  } else {
    v.className = 'verdict bad';
    v.innerHTML = `❌ 對了 ${nRight} / ${STEPS.length} 步（綠色是位置正確的）。想一想：<strong>要先有圖，還是先設參數？傳送之前該不該先預覽？</strong>`;
    progEl.textContent = `排序 ${nRight} / ${STEPS.length}`;
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
  }
}

// ---------- 按鈕移動（觸控主要方式） ----------
listEl.addEventListener('click', e => {
  const b = e.target.closest('button.mv'); if (!b) return;
  const i = +b.dataset.i, d = +b.dataset.d, j = i + d;
  if (j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  render();
});

// ---------- 拖曳（桌機） ----------
let dragId = null;
listEl.addEventListener('dragstart', e => {
  const li = e.target.closest('.step-item'); if (!li) return;
  dragId = li.dataset.id; li.classList.add('dragging');
});
listEl.addEventListener('dragend', () => {
  // 拖曳途中只搬 DOM 節點，放開後再依 DOM 順序更新 order 並重繪（更新序號與 data-i）
  if (!dragId) return;
  dragId = null;
  order = Array.from(listEl.querySelectorAll('.step-item')).map(el => el.dataset.id);
  render();
});
listEl.addEventListener('drop', e => e.preventDefault());
listEl.addEventListener('dragover', e => {
  e.preventDefault();
  const li = e.target.closest('.step-item'); if (!li || !dragId) return;
  const dragEl = listEl.querySelector('.step-item.dragging');
  if (!dragEl || dragEl === li) return;
  const items = Array.from(listEl.children);
  // 被拖的在目標下方 → 插到目標前；在上方 → 插到目標後
  if (items.indexOf(dragEl) > items.indexOf(li)) listEl.insertBefore(dragEl, li);
  else listEl.insertBefore(dragEl, li.nextSibling);
});

document.getElementById('checkBtn').addEventListener('click', checkOrder);
document.getElementById('shuffleBtn').addEventListener('click', () => {
  shuffle();
  document.getElementById('verdict').className = 'verdict warn';
  document.getElementById('verdict').textContent = '排好之後按「檢查順序」';
});

shuffle();
if (solved) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; renderExplain(); progEl.textContent = '排序 ✓ 完成'; }
