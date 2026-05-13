// 基本手工具 模組 1：10 種工具
const TOOLS = [
  { id: 'hammer', name: '鎚子 Hammer', icon: '🔨',
    types: '羊角錘（一般 + 拔釘）、橡膠鎚（不傷工件）、銅鎚（金屬加工）、釘鎚（小釘）',
    use: '釘釘子、敲打、拆解、整形',
    tip: '握握把末端揮動，靠手腕力（不是手臂）。釘前先用尖嘴鉗夾住釘子定位。',
    risk: '敲到手指——握工件的手要遠離釘點。釘子彈飛——戴護目鏡。' },
  { id: 'driver', name: '螺絲起子 Screwdriver', icon: '🪛',
    types: '一字（slot）、十字（Phillips）、星型（Torx）、內六角（Hex）',
    use: '鎖緊或鬆開螺絲',
    tip: '十字螺絲一定要選對尺寸（PH1 / PH2 / PH3）。太大太小都會崩牙。',
    risk: '崩牙螺絲拆不出來——選對尺寸。手滑刺到手——另一手扶穩工件。' },
  { id: 'saw', name: '手鋸 Saw', icon: '🪚',
    types: '線鋸（曲線）、夾背鋸（直線精確）、鋼鋸（金屬）、十字鋸（粗略木工）',
    use: '切割木材、塑膠、金屬',
    tip: '推鋸時施力、拉回時放鬆。長鋸用全臂、短鋸用前臂。',
    risk: '鋸子滑掉割手——工件夾緊、起鋸位置用拇指扶住鋸條（離齒一段）。' },
  { id: 'file', name: '銼刀 File', icon: '〰',
    types: '平銼（大面）、半圓銼（凹面）、圓銼（孔內）、三角銼（內角）、什錦銼（細工）',
    use: '修整毛邊、修整圓弧、調整孔徑',
    tip: '銼刀只能「推著用」（單向）！回拉時要抬起銼刀，否則銼齒會被磨鈍。',
    risk: '銼刀沒柄的尖端會刺手——必須有木柄。粉塵吸入——戴口罩。' },
  { id: 'pliers', name: '鉗子 Pliers', icon: '🦞',
    types: '尖嘴鉗（夾小物）、斜口鉗（剪線）、老虎鉗（夾握）、剝線鉗（電線剝皮）、壓接鉗（端子）',
    use: '夾、剪、彎、剝、壓',
    tip: '剝線鉗的孔徑要對應電線規格（AWG #）。斜口鉗不能拿來剪硬鋼絲（會崩刃）。',
    risk: '剪線時碎片噴出——側著剪、戴護目鏡。' },
  { id: 'wrench', name: '扳手 Wrench', icon: '🔧',
    types: '開口扳手、梅花扳手、活動扳手（adjustable）、套筒扳手（拆汽車）、六角扳手（家具）',
    use: '鎖緊或鬆開螺帽、螺栓',
    tip: '梅花扳手 6 點接觸比開口扳手 2 點接觸不易打滑。活動扳手要把調整輪轉緊。',
    risk: '扳手滑脫撞到關節——施力方向「拉」而不是「推」較安全。' },
  { id: 'measure', name: '量測工具 Measuring', icon: '📏',
    types: '直尺（30cm）、捲尺（5-10m）、角尺（90°）、游標卡尺（精密 0.02mm）、量角器',
    use: '量長度、檢查直角、量孔徑',
    tip: '量測前先把工件邊緣對齊「0」刻度。游標卡尺看主刻度後再對副尺對齊線。',
    risk: '量錯尺寸=做廢——量兩次、切一次（Measure twice, cut once）。' },
  { id: 'cutter', name: '刀具 Knife', icon: '🔪',
    types: '美工刀（換刀片）、雕刻刀（木工）、剪刀（紙/布）、線刀（細紋）',
    use: '切紙、切薄板、削除毛邊、雕刻',
    tip: '美工刀刀片變鈍要折一段（內附折刀工具）。切割時尺壓緊、刀子貼尺。',
    risk: '美工刀割傷是教室第一大傷害——刀刃方向遠離身體、用切割墊。' },
  { id: 'clamp', name: '夾具 Clamps', icon: '🗜',
    types: 'C 型夾、F 型夾、檯虎鉗（bench vise）、彈簧夾、皮帶夾',
    use: '固定工件做後續加工（鋸、銼、鑽、磨）',
    tip: '夾木工件要墊軟材（如薄木片）防止夾痕。施力到工件不動但別過緊夾扁。',
    risk: '沒夾穩工件做加工——工件飛出傷人。這是最該避免的事。' },
  { id: 'punch', name: '敲擊與起釘工具 Punch', icon: '🛠',
    types: '中心衝（鑽前打點）、起釘器（拔釘）、衝子（trim打孔）、橡膠墊',
    use: '在金屬上打點、拔釘、敲入精細位置',
    tip: '中心衝鑽金屬前必用——讓鑽頭不偏鑽。起釘器配鎚子拔釘比羊角錘省力。',
    risk: '敲擊時手指要離擊點 5cm 以上。' },
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
    <p style="font-size:12px;color:#dc2626"><strong>⚠ 風險：</strong>${t.risk}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(t.id)) {
      seen.add(t.id); card.style.background = '#F1F5F9';
      progEl.textContent = `已認識 ${seen.size} / 10 種`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 10) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 10 種手工具都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 10 種`;
if (seen.size === 10) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
