// 機構運動 模組 3：創意機構卡片製作 8 步驟
const STEPS = [
  { title: '決定卡片主題與動作', desc: '想清楚卡片要表達什麼故事？需要什麼動作？\n• 動物張嘴吃東西 → 用四連桿\n• 太陽從地平面升起 → 用曲柄滑塊\n• 鳥拍翅膀 → 用凸輪 + 槓桿\n• 車子來回開 → 用曲柄滑塊', tip: '先想動作再選機構，不是反過來。' },
  { title: '選擇機構類型', desc: '依動作需求挑機構：\n• 旋轉 → 旋轉：齒輪、皮帶\n• 旋轉 → 往復：曲柄滑塊\n• 旋轉 → 規律上下：凸輪\n• 旋轉 → 擺動：四連桿\n• 單向限制：棘輪', tip: '翰林附件 3-5（連桿/凸輪/曲柄）已附紙模，挑選後直接剪。' },
  { title: '繪製機構草圖', desc: '在紙上畫出機構各部件相對位置：\n• 標出每個樞軸（pivot）位置\n• 標出運動範圍（如連桿擺動角度）\n• 標出機構與卡片畫面的整合方式', tip: '用「動態箭頭」標出每個部件的運動方向。' },
  { title: '裁切卡片基板與機構紙模', desc: '材料：\n• A4 厚紙板 × 2（卡片本體前後）\n• A4 普通紙（機構紙模，建議列印翰林附件）\n• 兩腳釘（brad）數枚\n• 美工刀、切割墊、尺、鉛筆', tip: '裁切時用尺壓住，刀子要利。一刀切深比多次淺切整齊。' },
  { title: '在卡片基板鑽軸孔', desc: '依草圖位置，用「打孔器」或「圖釘」在卡片基板鑽 2–4 個軸孔（給兩腳釘穿過去）。\n孔徑要剛好讓兩腳釘穿過但不會晃。', tip: '量兩次、鑽一次。位置錯了卡片就廢了。' },
  { title: '組裝機構部件', desc: '把機構部件用兩腳釘穿過軸孔組裝：\n• 連桿 → 兩端各一個樞軸\n• 凸輪 → 中心軸 + 從動件接觸點\n• 曲柄 → 圓盤 + 滑塊軌道\n組裝後手動測試動作是否順暢。', tip: '兩腳釘不要鎖太緊——要讓部件能轉動。' },
  { title: '畫上卡片畫面', desc: '依機構動作畫上故事：\n• 動的部件畫上「會動的角色」（鳥、車、人）\n• 靜的部件畫上「背景」（風景、建築）\n• 整合好機構不要露出來。', tip: '可用「窗孔」設計：靜的部分挖洞，動的部分從洞後面探出。' },
  { title: '測試與分享', desc: '完成後：\n• 來回操作 20 次，確認機構不會卡住或脫落\n• 邀請同學試玩\n• 紀錄哪裡動作不順、為什麼\n• 第二版可以做更複雜的機構（如雙連桿、凸輪+槓桿組合）', tip: '失敗的機構卡片比成功的更有教學價值——記下為什麼壞掉。' },
];

const PK = 'mech_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const nextBtn = document.getElementById('next-btn');
const seenSteps = new Set((loadP().module3_seen) || []);

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item' + (i === 0 ? ' active' : '') + (seenSteps.has(i) ? ' seen' : '');
  item.innerHTML = `<div class="step-num">${i + 1}</div><div class="step-info"><h5>${s.title}</h5></div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  const s = STEPS[i];
  document.querySelectorAll('.step-item').forEach((el, k) => el.classList.toggle('active', k === i));
  stepDetailEl.innerHTML = `
    <span class="step-step">STEP ${i + 1} / ${STEPS.length}</span>
    <h3>${s.title}</h3>
    <p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>
    ${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:18px">
      ${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}
      ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成全部步驟 ✓</span>'}
    </div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP();
    p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) {
      p.module3 = true;
      nextBtn.style.opacity = 1;
      nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 步驟全部完成！', 'good');
    }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;

if (typeof SequencePuzzle === 'function') {
  SequencePuzzle({
    mountId: 'seq-puzzle',
    items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })),
    onPass: () => {
      const p = loadP(); p.module3_puzzle = true; saveP(p);
      showToast('🧩 排序測驗通過！', 'good');
    }
  });
}
