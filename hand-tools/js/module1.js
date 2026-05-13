// 基本手工具 模組 1：10 種工具家族
// 來源：[1] 翰林版國中生活科技 1上 K3；[2] 勞動部職業安全衛生署《手工具作業安全衛生指引》；
//        [3] Stanley Hand Tool Care Guide；[4] Lee Valley《Files & Rasps Care》
const TOOLS = [
  { id: 'hammer', name: '鎚類 Hammers', icon: '🔨',
    types: '羊角錘 claw hammer（敲釘＋拔釘）、橡膠槌 mallet（不傷工件）、銅頭錘 copper（金屬整形）、釘頭錘 nail hammer（小釘）',
    use: '釘釘子、敲打、輕度整形',
    tip: '握握把末端揮動，靠手腕力（不是手臂）。釘前可用尖嘴鉗或定釘器夾住釘子定位，避免敲到手指。',
    risk: '敲到手指——握工件的手要遠離釘點。釘子彈飛——戴護目鏡。',
    cite: '[1][2]' },

  { id: 'driver', name: '螺絲起子 Screwdrivers', icon: '🪛',
    types: '一字 slot、十字 Phillips（PH0–PH3）、星型 Torx、內六角 Hex',
    use: '鎖緊或鬆開螺絲',
    tip: '十字螺絲要選對尺寸（PH0–PH3）。太大太小都會崩牙。鎖前確認刀頭穩穩卡進螺絲頭。',
    risk: '崩牙螺絲拆不出來——選對尺寸。手滑刺到手——另一手扶穩工件。',
    cite: '[1][7]' },

  { id: 'saw', name: '鋸類 Saws', icon: '🪚',
    types: '線鋸（曲線）、夾背鋸 back saw（直線精準）、鋼鋸 hacksaw（金屬）、橫切鋸 crosscut（粗略木工）',
    use: '切割木材、塑膠、薄金屬',
    tip: '推鋸時施力、拉回時放鬆。長鋸用全臂、短鋸用前臂。起鋸時用拇指扶住鋸條（離鋸齒一段）。',
    risk: '鋸子滑掉割手——工件必須夾緊、起鋸位置用拇指扶住鋸條離齒一段距離。',
    cite: '[1][3]' },

  { id: 'file', name: '銼刀 Files', icon: '🪒',
    types: '平銼（大面）、半圓銼（凹面）、圓銼（孔內）、三角銼（內角）、什錦銼（細工）',
    use: '修整毛邊、修整圓弧、調整孔徑',
    tip: '銼刀只能「推著用」（單向）——回拉時要抬起銼刀，否則銼齒會被磨鈍<sup>[4]</sup>。',
    risk: '銼刀無柄的尖端（莖部）會刺手——必須有木柄。粉塵吸入——戴口罩。',
    cite: '[2][4]' },

  { id: 'pliers', name: '鉗類 Pliers', icon: '🗜️',
    types: '尖嘴鉗（夾小物）、斜口鉗（剪線）、老虎鉗（夾握）、剝線鉗（電線剝皮）、壓接鉗（端子）',
    use: '夾、剪、彎、剝、壓',
    tip: '剝線鉗的孔徑要對應電線規格（依 AWG / mm² 線徑分類）。斜口鉗不能拿來剪硬鋼絲（會崩刃）。',
    risk: '剪線時碎片噴出——側著剪、戴護目鏡。',
    cite: '[1][2]' },

  { id: 'wrench', name: '扳手 Wrenches', icon: '🔧',
    types: '開口扳手 open-end、梅花扳手 box-end、活動扳手 adjustable、套筒扳手 socket、六角扳手 hex（家具）',
    use: '鎖緊或鬆開螺帽、螺栓',
    tip: '梅花扳手 6 點接觸比開口扳手 2 點接觸不易打滑。活動扳手要把調整輪轉到夾緊；施力時讓固定鉗口承受主要力<sup>[7]</sup>。',
    risk: '扳手滑脫撞到關節——施力方向「拉」而不是「推」較安全。',
    cite: '[1][7]' },

  { id: 'measure', name: '量測工具 Measuring', icon: '📏',
    types: '直尺（30 cm）、捲尺（3–5 m）、角尺 try square（90°）、游標卡尺 caliper（精密 0.02 mm）、量角器',
    use: '量長度、檢查直角、量孔徑',
    tip: '量測前先把工件邊緣對齊「0」刻度。游標卡尺看主刻度後再對副尺對齊線。',
    risk: '量錯尺寸 = 做廢——「量兩次、切一次」（Measure twice, cut once）<sup>[2]</sup>。',
    cite: '[2]' },

  { id: 'cutter', name: '刀類 Knives', icon: '🔪',
    types: '美工刀 utility knife（可換／可折刀片）、雕刻刀（木工）、剪刀（紙／布）、線刀（細紋）',
    use: '切紙、切薄板、削除毛邊、雕刻',
    tip: '美工刀刀片變鈍時，把刀片伸出一格、用內附折斷器或刀套底部的金屬槽折斷（請勿徒手折）；嚴重缺角應整片換新<sup>[2]</sup>。切割時鋼尺壓緊、刀子貼尺、刀面遠離身體。',
    risk: '美工刀割傷是教室最常見的小傷害——刀刃方向遠離扶工件的手、用切割墊保護桌面。',
    cite: '[2]' },

  { id: 'clamp', name: '夾具 Clamps & Vise', icon: '🧷',
    types: 'C 型夾、F 型夾、檯虎鉗 bench vise、彈簧夾、皮帶夾',
    use: '固定工件做後續加工（鋸、銼、鑽、磨）',
    tip: '夾木工件要墊軟材（薄木片）防止夾痕。施力到「工件不動」即可，過緊會壓扁工件或留壓痕。',
    risk: '沒夾穩工件做加工——工件飛出傷人。所有切削加工的工件都應確實固定<sup>[2][8]</sup>。',
    cite: '[2][8]' },

  { id: 'punch', name: '衝具 Punches', icon: '🎯',
    types: '中心衝 center punch（鑽前打點）、衝棒 pin punch（敲入定位銷）、起釘衝 nail set（埋頭釘）、樣衝 prick punch（劃線交點）',
    use: '在金屬上打點定位、敲入或敲出銷子、把釘頭打入木材表面下',
    tip: '中心衝在鑽金屬孔前必用——讓鑽頭起鑽不偏滑。衝棒配橡膠槌敲銷比羊角錘更精準。',
    risk: '敲擊時握工件的手指要離擊點 5 cm 以上；衝具尖端使用後請保護收納，避免散落工作台。',
    cite: '[1][3]' },
];

const PK = 'ht_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

TOOLS.forEach(t => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;border-left:5px solid #64748B;${seen.has(t.id) ? 'background:#F1F5F9' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:30px">${t.icon}</span><h4 style="margin:0;color:#334155">${t.name}</h4></div>
    <p style="font-size:12.5px;color:#666;margin:4px 0"><strong>類型：</strong>${t.types}</p>
    <p style="font-size:12.5px;color:#666;margin:4px 0"><strong>用途：</strong>${t.use}</p>
    <p style="font-size:12px;color:#16A34A;background:#DCFCE7;padding:6px 10px;border-radius:5px;margin:6px 0"><strong>💡 訣竅：</strong>${t.tip}</p>
    <p style="font-size:12px;color:#dc2626"><strong>⚠ 風險：</strong>${t.risk}</p>
    <p style="font-size:11px;color:#94a3b8;margin-top:4px"><strong>📚 參考：</strong>${t.cite}（見頁尾資料來源）</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(t.id)) {
      seen.add(t.id); card.style.background = '#F1F5F9';
      progEl.textContent = `已認識 ${seen.size} / 10 種`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 10) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 10 種手工具家族都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 10 種`;
if (seen.size === 10) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
