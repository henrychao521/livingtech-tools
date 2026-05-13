// 液壓手臂 模組 3：製作 8 步驟
const STEPS = [
  { title: '材料準備', desc: '基本材料：\n• 厚紙板（4mm 瓦楞紙板）2 張\n• 注射針筒 10ml 或 20ml × 8 支\n• 矽膠管或軟塑膠管（內徑 4mm）約 2m\n• 兩腳釘（M4 brad）× 16-20 枚\n• 美工刀、切割墊、尺、雙面膠、熱熔膠\n• 水（紅墨水可看清流向）', tip: '針筒要選玻璃光滑無漏氣的——測試方法：堵住針嘴，按到底放手會自動回彈。' },
  { title: '裁切骨架', desc: '依設計圖裁切：\n• 基座：100×100mm 兩片黏成 8mm 厚\n• 大臂：200×30mm 兩片\n• 小臂：150×30mm 兩片\n• 夾爪：60×20mm 兩片\n• 連接片若干', tip: '裁切時尺壓緊、刀利。圓角先用打孔器打小孔再連線比較好切。' },
  { title: '鑽軸孔與兩腳釘', desc: '在所有關節位置鑽 4mm 孔（兩腳釘穿過去）。位置：\n• 基座頂 + 大臂底（一對）\n• 大臂頂 + 小臂底（一對）\n• 小臂頂 + 夾爪根（兩對）\n• 油壓缸固定點 × 8', tip: '用打孔器或圖釘鑽——位置先量兩次標記再打孔，孔位錯整支廢。' },
  { title: '組裝關節', desc: '用兩腳釘把骨架穿起來。順序：\n1. 基座 + 大臂\n2. 大臂 + 小臂\n3. 小臂 + 夾爪雙片\n組裝完徒手測試每個關節都能順暢轉動，不能太緊。', tip: '太緊的關節用美工刀稍微擴孔。太鬆的用雙面膠補墊片。' },
  { title: '安裝油壓缸（針筒）', desc: '每軸需要兩個針筒：一個固定到「控制台」、一個固定到「手臂上」。針筒固定方式：\n• 用熱熔膠把針筒身體黏到骨架\n• 活塞桿頂端用熱熔膠或膠帶連到下一節（推/拉那邊）\n固定要牢，但活塞還能順暢進出。', tip: '針筒位置要遠離關節 → 槓桿放大力臂，省力。靠近關節要更多力。' },
  { title: '連接油管', desc: '矽膠管把控制端針筒與手臂端針筒連接。\n切管長度約 30-50cm。\n用熱熔膠或束帶把管固定到骨架上整齊走線。', tip: '油管不要彎死角——會堵住流動。圓弧大轉彎或留 S 形緩衝。' },
  { title: '充水排氣', desc: '排氣是液壓最關鍵步驟！\n1. 把所有針筒推到底\n2. 拆下手臂端針筒，控制端拉滿水\n3. 控制端推水進入油管 → 從另一端冒水時馬上接上手臂端針筒\n4. 重複所有 4 軸\n空氣可壓縮 → 沒排乾淨，按了會「軟軟的」沒力。', tip: '可用紅色食用色素混水 → 流動方向看得清楚，也比較好排氣。' },
  { title: '校正與測試', desc: '完成後測試 4 軸：\n• 推每個控制針筒，看對應軸是否正確動作\n• 動作會不會卡住、漏水、回彈太慢\n• 夾爪能否抓起 50g 的瓶子？\n• 4 軸組合操作能否把瓶子搬 20cm？\n校正：調整針筒固定位置改變動作幅度。', tip: '抓 50g 瓶子是基本門檻。能做到「精準放回原位」才是真實作能力。' },
];

const PK = 'ha_progress_v1';
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
  stepDetailEl.innerHTML = `<span class="step-step">STEP ${i + 1} / ${STEPS.length}</span><h3>${s.title}</h3><p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}<div style="display:flex;gap:8px;margin-top:18px">${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成 ✓</span>'}</div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP(); p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 8 步完成！', 'good'); }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
if (typeof SequencePuzzle === 'function') SequencePuzzle({ mountId: 'seq-puzzle', items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })), onPass: () => { const p = loadP(); p.module3_puzzle = true; saveP(p); showToast('🧩 通過！', 'good'); } });
