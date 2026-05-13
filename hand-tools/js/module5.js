// 基本手工具 模組 5：保養與維護
const MAINT = [
  { name: '清潔', icon: '🧹', target: '所有工具',
    method: '每次使用後用毛刷掃屑、乾布擦汗液 / 油汙。金屬工具不要用水洗（會生鏽）。鋸子的齒間要清木屑。',
    why: '汗液中的鹽分是金屬生鏽催化劑。日積月累的木屑會讓鋸子卡頓。' },
  { name: '上油防鏽', icon: '🛢', target: '金屬工具（特別是鉸鏈、刀刃、絞牙）',
    method: '每月用「3 in 1 油」或「縫紉機油」塗一層薄油。台灣潮濕地區建議每週。鉸鏈位置上油可保持靈活。',
    why: '生鏽會降低工具壽命 50%。上油形成水分隔離層。' },
  { name: '磨刀', icon: '⚔', target: '美工刀、雕刻刀、鋸子、銼刀（不能磨）',
    method: '美工刀刀片折斷凹槽折掉一段就好。雕刻刀用磨刀石（油石）順方向磨。鋸子要送專業鋸刃店磨。',
    why: '鈍刀切要施力大、易滑掉——「鈍刀比利刀危險」。' },
  { name: '鬆緊調整', icon: '🔧', target: '螺絲起子、鉗子、扳手鉸鏈',
    method: '鉸鏈鬆掉用六角扳手調緊。活動扳手的調節螺絲卡死可用 WD-40 噴一下。',
    why: '鬆動的工具會在使力時打滑——失控傷人。' },
  { name: '修補握把', icon: '🪵', target: '鎚子、銼刀、雕刻刀的木柄',
    method: '木柄裂痕用木膠（白膠或環氧）灌入再夾緊 24 小時。嚴重碎裂直接換柄。',
    why: '裂柄鎚頭使用中可能整顆飛出——是工坊重大事故。' },
  { name: '收納分類', icon: '📦', target: '所有工具',
    method: '「影子板」（shadow board）：在工具牆上畫工具輪廓，每件有固定位置。或用工具盒分隔。',
    why: '一眼能看出「少了哪件工具」——也方便下一個使用者找工具。' },
  { name: '防潮處理', icon: '🌫', target: '台灣 4-9 月梅雨季 / 夏天',
    method: '工具箱放乾燥劑（矽膠包）。長期不用的工具上厚一層油用塑膠袋密封。',
    why: '台灣潮濕年均濕度 80%——金屬工具放 1 個月就生鏽。' },
  { name: '報廢判斷', icon: '🚮', target: '所有工具',
    method: '損壞超過修復成本就報廢：\n• 鎚柄裂 50% 以上\n• 鋸齒掉 5 個以上\n• 螺絲起子刀頭歪斜不能調整\n• 鉗子鉸鏈鬆到夾不住\n• 銼刀齒磨平超過 50%',
    why: '勉強用損壞工具是事故源——汰換成本遠低於受傷成本。' },
];

const QUIZ = [
  { sit: '鎚子木柄出現 3cm 的細裂痕，敲擊還算穩', ans: 'repair', explain: '可修：用木膠灌縫 + 環氧加固後可繼續用。但要密切觀察，再裂就報廢。' },
  { sit: '銼刀齒嚴重磨平（看光滑）', ans: 'replace', explain: '報廢。銼齒無法重磨（要熱處理工藝）——磨平的銼刀只是廢鐵，浪費時間。' },
  { sit: '螺絲起子刀頭歪斜 30°', ans: 'replace', explain: '報廢。歪斜的起子鎖螺絲必崩牙、轉鬆螺帽易打滑、傷工件也傷人。' },
  { sit: '尖嘴鉗鉸鏈卡卡轉不順', ans: 'repair', explain: '可修：噴 WD-40 鬆動後上油即可。鉸鏈本身沒壞、只是缺潤滑。' },
  { sit: '鋼鋸框架有 5° 彎曲', ans: 'repair', explain: '可修：用檯虎鉗夾緊輕敲回正。鋼鋸框是「可微調」的設計。' },
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
    <p style="font-size:12px;color:#666"><strong>為什麼：</strong>${m.why}</p>`;
  mEl.appendChild(c);
});

const quizEl = document.getElementById('quiz');
let answered = new Set(); let correct = 0;
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
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
  const parent = b.closest('div');
  parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.c === QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok?'success':'error'}" style="margin-top:6px">${ok?'✓':'✗'} ${QUIZ[i].explain}</div>`;
  if (ok) { correct++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  if (answered.size === QUIZ.length) {
    const p = loadP(); p.module5 = true; p.module5_score = correct; saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 ${correct}/${QUIZ.length} 答對`, 'good');
  }
}));
