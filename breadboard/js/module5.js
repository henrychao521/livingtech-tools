// 麵包板平台 模組 5：故障排除圖鑑
const ERRORS = [
  {
    id: 'no-resistor',
    name: 'LED 沒接電阻就上電',
    symptom: '通電瞬間 LED 變很亮然後永遠變暗（燒掉）',
    cause: '5V 直接驅動 LED 而沒有電阻限流。LED 內部 PN 接面瞬間燒毀。',
    fix: '永遠在 LED 串聯一顆 220Ω 以上電阻。LED 已燒毀的話只能換新。',
    icon: '🔥',
  },
  {
    id: 'led-reversed',
    name: 'LED 反接',
    symptom: 'LED 沒亮但其他正常',
    cause: 'LED 是二極體，只允許電流從正極（長腳）流向負極（短腳）。反接電流不通。',
    fix: '把 LED 拔起來翻轉 180° 再插回去。長腳那邊應該接電阻側。',
    icon: '🔄',
  },
  {
    id: 'wrong-row',
    name: '元件腳插同一行',
    symptom: '元件腳互相短路 / 電阻或 LED 沒作用',
    cause: '麵包板同行（a-e 或 f-j 同 row）內部相連。例如 LED 兩腳都插在 a5，等於把 LED 兩腳直接接在一起 = 短路。',
    fix: '每個元件腳要插在不同行（不同 row 數字）。例如 LED 兩腳插 a5 和 a6（同列不同行）。',
    icon: '↔️',
  },
  {
    id: 'rail-broken',
    name: '電源軌斷點未跨接',
    symptom: '左側電路正常，右側 LED 不亮',
    cause: '大型麵包板（830 點）的電源軌中央有實體斷點，左半 與 右半其實是分開的金屬條。',
    fix: '在斷點兩側用同色跳線跨接（紅軌跨紅、黑軌跨黑）。',
    icon: '✂️',
  },
  {
    id: 'short-circuit',
    name: '正負極直接短路',
    symptom: '電池發燙、變形、電源燈狂閃，元件可能燒毀',
    cause: '一條跳線把 + 軌直接連到 − 軌（中間沒有任何負載）。電流瞬間衝到最大。',
    fix: '立刻拔電池！檢查所有跳線：每條紅線都應接到負載（電阻、LED 等）才轉到地。',
    icon: '⚡',
  },
  {
    id: 'loose-wire',
    name: '跳線沒插緊',
    symptom: '時好時壞，動到麵包板就斷電',
    cause: '跳線插得太淺，沒接觸到內部金屬簧片。',
    fix: '每條線都壓到底，插到聽到「卡」聲。線芯彎曲的話用斜口鉗剪斷重剝。',
    icon: '🤏',
  },
  {
    id: 'wrong-resistor',
    name: '電阻值太大',
    symptom: 'LED 很暗或完全不亮',
    cause: '誤用 10kΩ 取代 220Ω。電阻太大導致電流不足以點亮 LED（電流 < 1mA）。',
    fix: '檢查色環：紅紅棕 = 220Ω。常見錯誤：紅黑橙 = 20kΩ。換用正確阻值。',
    icon: '🎨',
  },
  {
    id: 'cap-reversed',
    name: '電解電容反接',
    symptom: '電容鼓起、漏液、爆炸',
    cause: '電解電容（圓柱型有金屬殼）有極性。長腳是正極（+），短腳是負極（−）。反接會讓內部化學反應失控。',
    fix: '立刻斷電！電容已鼓起的不能再用，要換新。陶瓷電容（小盤狀）才沒有極性。',
    icon: '💥',
  },
];

const grid = document.getElementById('error-gallery');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.className = 'bb-error-card';
  card.innerHTML = `
    <div class="visual"><span style="font-size:60px">${e.icon}</span></div>
    <span class="err-tag" style="display:inline-block;font-size:11px;background:var(--danger-light);color:var(--danger);padding:3px 10px;border-radius:999px;font-weight:700;margin-bottom:8px">常見錯誤</span>
    <h4 style="font-size:16px;margin-bottom:6px">${e.name}</h4>
    <p style="font-size:13px;color:var(--text-soft);line-height:1.65;margin-bottom:8px"><strong>症狀：</strong>${e.symptom}</p>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;line-height:1.6"><strong style="color:#a72d2d">原因：</strong>${e.cause}</p>
    <div class="err-fix" style="font-size:12px;color:var(--accent);background:var(--accent-light);padding:8px 10px;border-radius:8px;border-left:3px solid var(--accent);line-height:1.6">
      <strong style="color:#1f4798">解法：</strong>${e.fix}
    </div>
  `;
  grid.appendChild(card);
});

// 標記模組 5 完成
const PROGRESS_KEY_BB = 'breadboard_progress_v1';
let p; try { p = JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || {}; } catch { p = {}; }
p.module5 = true;
localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p));
