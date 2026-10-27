// Onshape 模組 5：草圖錯誤案例（資料＋繪圖）。同一支檔案給 node 測試 require（tests/sketch-cases.test.js 檢查拓樸與自由度）。
//
// 繪圖規則（依 ISO 128 線型、ISO 129-1 尺寸標註）：
//   粗實線＝草圖輪廓（顏色依 Onshape：藍＝未完全定義、黑＝完全定義、紅＝過度定義／衝突）
//   細實線＝尺寸線、延伸線、引線；延伸線與輪廓留小間隙、超出尺寸線約 2 mm
//   細鏈線（長劃—點）＝中心線、對稱線；Onshape 畫面上的構造線是淡色虛線
//   細虛線＝隱藏線（3D 圖）
//   尺寸：封閉實心箭頭（夾角約 30°），數字寫在尺寸線上方、與尺寸線平行；垂直尺寸由右側讀；單位 mm 不寫；孔標 ⌀
//   限制條件小方塊：灰底黑符號＝正常、紅底白符號＝有問題（Onshape 說明：Black on gray means well-defined. White on red indicates a problem.）
(function (root) {
  'use strict';

  // ---------- 案例資料（單位 mm；原點 O 在 (0,0)） ----------
  // pts：點；lines：線段（端點用點名，同名＝重合）；circles；cons：限制條件；dims：尺寸
  // color：每個圖元在 Onshape 會顯示的顏色（測試會核對和自由度計算一致）
  const BASE = () => ({
    pts: { A: [0, 0], B: [60, 0], C: [60, 40], D: [0, 40], H: [40, 20] },
    lines: [{ id: 'AB', a: 'A', b: 'B' }, { id: 'BC', a: 'B', b: 'C' }, { id: 'CD', a: 'C', b: 'D' }, { id: 'DA', a: 'D', b: 'A' }],
    circles: [{ id: 'h', c: 'H', r: 6 }],
    cons: [{ t: 'coin', p: 'A', q: 'O' }, { t: 'h', l: 'AB' }, { t: 'h', l: 'CD' }, { t: 'v', l: 'BC' }, { t: 'v', l: 'DA' }],
    // 尺寸（明確幾何，單位 mm）：dx 量水平距離 x1→x2，延伸線從 y=r1、y=r2 出發，尺寸線在 y=at；dy 同理（延伸線從 x=r1、x=r2 出發，尺寸線在 x=at）
    // c2：第二條延伸線是孔的中心線延長：輪廓內畫細鏈線（中心線），出了輪廓（r2）才接細實線延伸線；refs：這個尺寸約束的是哪些點（給自由度計算用）
    dims: [
      { t: 'dx', x1: 0, x2: 60, r1: 0, r2: 0, at: -15, val: 60, refs: ['A', 'B'] },
      { t: 'dx', x1: 0, x2: 40, r1: 0, r2: 0, at: -8, val: 40, c2: true, refs: ['A', 'H'] },
      { t: 'dy', y1: 0, y2: 40, r1: 0, r2: 0, at: -15, val: 40, refs: ['A', 'D'] },
      { t: 'dy', y1: 0, y2: 20, r1: 0, r2: 0, at: -8, val: 20, c2: true, refs: ['A', 'H'] },
      { t: 'dia', c: 'h', val: 12, refs: ['h'] },
    ],
    color: 'black',
  });
  const clone = o => JSON.parse(JSON.stringify(o));
  function variant(fn) { const s = BASE(); fn(s); return s; }

  const CASES = [
    {
      id: 'open', name: '輪廓沒有封閉（少一段線）',
      symptom: '擠出（Extrude）時點不到這塊區域；Onshape 的 Profile inspector 會標出沒有封閉的迴圈。線全部是黑色也一樣——「完全定義」不等於「封閉」。',
      cause: '最上面那條邊沒畫，四邊形只剩三邊。',
      fix: '補上缺的線段，兩端點分別接到 C、D（重合），直到出現封閉區域。',
      bad: variant(s => {
        s.lines = s.lines.filter(l => l.id !== 'CD');
        s.cons = s.cons.filter(c => c.l !== 'CD');
        s.cons.push({ t: 'hp', p: 'C', q: 'D' });     // C、D 兩點水平對齊（點對點的水平限制）→ 仍然全黑
        s.callouts = [{ at: [30, 40], r: 9, text: '這裡少一條線', tx: 30, ty: 52 }];
      }),
      good: BASE(),
    },
    {
      id: 'gap', name: '端點沒有重合（留了小縫）',
      symptom: '看起來是封閉的四邊形，卻選不到區域；右邊和上面兩條線還是藍色，拖得動。',
      cause: '畫最後一條線時沒有吸附到起點，兩個端點差了約 0.6 mm，少了「重合（Coincident）」。',
      fix: '把兩個端點拖到一起，或選兩點加「重合（Coincident）」限制條件。',
      bad: variant(s => {
        s.pts.D2 = [0.6, 40];                       // CD 的終點沒接到 D
        s.lines = s.lines.map(l => l.id === 'CD' ? { id: 'CD', a: 'C', b: 'D2', color: 'blue' } : l.id === 'BC' ? Object.assign(l, { color: 'blue' }) : l);
        // 只有 BC、CD 兩條還拖得動（C 的高度、D2 的位置沒被約束），其他線是黑的
        s.magnify = { at: [0, 40], zoom: 8, text: '放大 8 倍：差 0.6' };
        s.callouts = [{ at: [0, 40], r: 6, text: '縫在這裡', tx: 0, ty: 52 }];
      }),
      good: variant(s => { s.glyphs = [{ t: 'coin', at: [0, 40], dx: 7, dy: 7 }]; }),
    },
    {
      id: 'overlap', name: '重疊線（同一邊畫了兩次）',
      symptom: '上緣有兩條線疊在一起，多出來那條沒有約束（藍色）；區域判斷變亂，擠出或之後修改常出錯。',
      cause: '重畫線段時沒有先刪掉舊線，或複製貼上後疊在原處。',
      fix: '框選那一段，刪掉多出來的那條線，只留一條。',
      bad: variant(s => {
        s.pts.X1 = [12, 40]; s.pts.X2 = [44, 40];
        s.lines.push({ id: 'X', a: 'X1', b: 'X2', overlapDraw: true, color: 'blue' });
        s.callouts = [{ at: [28, 40], r: 10, text: '兩條線疊在一起（圖中略為錯開才看得到）', tx: 30, ty: 53 }];
      }),
      good: BASE(),
    },
    {
      id: 'construction', name: '輔助線沒設成構造線',
      symptom: '中間那條對稱用的線把板子切成左右兩塊區域，擠出時只選到一半，或兩塊變成分開的面。',
      cause: '對稱線、定位線是用一般線段畫的，Onshape 會把它當成輪廓的一部分。',
      fix: '選取那條線，切換成構造線（Construction，快捷鍵 Q），它就不會切開區域。',
      bad: variant(s => {
        s.pts.M1 = [30, 0]; s.pts.M2 = [30, 40];
        s.lines.push({ id: 'M', a: 'M1', b: 'M2' });
        s.cons.push({ t: 'mid', p: 'M1', l: 'AB' }, { t: 'mid', p: 'M2', l: 'CD' });
        s.callouts = [{ at: [30, 20], r: 8, text: '這條是一般線，把區域切成兩塊', tx: 30, ty: 52 }];
      }),
      good: variant(s => {
        s.pts.M1 = [30, 0]; s.pts.M2 = [30, 40];
        s.lines.push({ id: 'M', a: 'M1', b: 'M2', construction: true });
        s.cons.push({ t: 'mid', p: 'M1', l: 'AB' }, { t: 'mid', p: 'M2', l: 'CD' });
      }),
    },
    {
      id: 'overshoot', name: '交點沒有修剪（線段超出）',
      symptom: '角落多出兩小段「尾巴」，那兩條線是藍色、拖得動（尾巴長度沒有被定義）；草圖不乾淨，之後修改容易出錯。',
      cause: '用兩條長線交叉畫出角落，沒有把超出的部分修剪掉。',
      fix: '用修剪（Trim）點掉超出的尾巴，讓兩條線在角落共用同一個端點。',
      bad: variant(s => {
        s.pts.P1 = [-6, 0]; s.pts.P2 = [0, -6];
        delete s.pts.A;
        s.lines = [{ id: 'AB', a: 'P1', b: 'B', color: 'blue' }, { id: 'BC', a: 'B', b: 'C' }, { id: 'CD', a: 'C', b: 'D' }, { id: 'DA', a: 'D', b: 'P2', color: 'blue' }];
        s.cons = [{ t: 'on', p: 'O', l: 'AB' }, { t: 'on', p: 'O', l: 'DA' }, { t: 'h', l: 'AB' }, { t: 'h', l: 'CD' }, { t: 'v', l: 'BC' }, { t: 'v', l: 'DA' }];
        s.dims = [
          { t: 'dx', x1: 0, x2: 60, r1: -6, r2: 0, at: -15, val: 60, refs: ['DA', 'B'] },
          { t: 'dx', x1: 0, x2: 40, r1: -6, r2: 0, at: -8, val: 40, c2: true, refs: ['DA', 'H'] },
          { t: 'dy', y1: 0, y2: 40, r1: -6, r2: 0, at: -15, val: 40, refs: ['AB', 'D'] },
          { t: 'dy', y1: 0, y2: 20, r1: -6, r2: 0, at: -8, val: 20, c2: true, refs: ['AB', 'H'] },
          { t: 'dia', c: 'h', val: 12, refs: ['h'] },
        ];
        // 超出的長度沒有尺寸 → AB、DA 兩條還拖得動（藍）
        s.callouts = [{ at: [-2, -2], r: 7, text: '角落超出的尾巴', tx: 6, ty: 54 }];
      }),
      good: BASE(),
    },
    {
      id: 'under', name: '限制條件不足（未完全定義）',
      symptom: '線是藍色，用滑鼠一拖形狀就變；整塊也沒有固定在原點上。',
      cause: '只標了寬度，沒有標高度與孔的上下位置，角點也沒有和原點重合。',
      fix: '角點加「重合」到原點，補上高度 40 與孔的位置 20，直到全部變黑。',
      bad: variant(s => {
        for (const k in s.pts) { s.pts[k] = [s.pts[k][0] + 12, s.pts[k][1] + 9]; }
        s.cons = s.cons.filter(c => c.t !== 'coin');
        s.dims = [
          { t: 'dx', x1: 12, x2: 72, r1: 9, r2: 9, at: -6, val: 60, refs: ['A', 'B'] },
          { t: 'dx', x1: 12, x2: 52, r1: 9, r2: 9, at: 1, val: 40, c2: true, refs: ['A', 'H'] },
          { t: 'dia', c: 'h', val: 12, refs: ['h'] },
        ];
        s.color = 'blue';
        s.callouts = [{ at: [12, 9], r: 6, text: '角點沒有接到原點', tx: -2, ty: 58 }];
      }),
      good: BASE(),
    },
    {
      id: 'over', name: '過度限制條件（尺寸互相衝突）',
      symptom: '線和限制條件符號變成紅色（紅底白符號），Onshape 無法同時滿足所有條件。',
      cause: '矩形上下邊已經用「水平」「垂直」限制成一樣長，又在上緣另外標了 50，和下緣的 60 互相衝突。',
      fix: '刪掉多餘的那個尺寸（上緣 50）；同一個長度只標一次。',
      bad: variant(s => {
        s.dims.push({ t: 'dx', x1: 0, x2: 60, r1: 40, r2: 40, at: 48, val: 50, conflict: true, refs: ['D', 'C'] });
        s.color = 'red';
        s.glyphs = [{ t: 'h', at: [30, 40], dx: 14, dy: -8, problem: true }, { t: 'h', at: [30, 0], dx: 14, dy: 7, problem: true }];
      }),
      good: BASE(),
    },
    {
      id: 'wrong-plane', name: '選錯基準平面',
      symptom: '本來要做一塊平放的底板，擠出來卻變成直立的板子。',
      cause: '草圖畫在 Front（前）平面，擠出方向就變成水平方向。',
      fix: '在特徵樹的草圖按右鍵 → Edit，點草圖平面欄位，改選 Top（上）平面。',
      plane: true,
    },
  ];

  // ---------- 繪圖 ----------
  const K = 2.4;                        // 每 mm 幾個 viewBox 單位
  const OX = 64, OY = 148;              // 原點在 viewBox 的位置
  const VB = [0, 0, 260, 200];
  const THICK = 1.6, THIN = 0.7;        // 線寬比 2:1（ISO 128）
  const TXT = 9.5;                      // 尺寸數字字高
  const AR = 5, AW = 1.35;              // 箭頭長、半寬（夾角約 30°）
  const GAP = 1.4, OVER = 4.8;          // 延伸線間隙、超出量
  const COLORS = { black: '#111827', blue: '#2563eb', red: '#dc2626' };
  const FONT = 'font-family="Noto Sans TC, PingFang TC, sans-serif"';
  const X = x => +(OX + x * K).toFixed(2), Y = y => +(OY - y * K).toFixed(2);
  const f = v => +(+v).toFixed(2);
  const CENTER_DASH = `${f(THIN * 22)} ${f(THIN * 3.5)} ${f(THIN * 0.6)} ${f(THIN * 3.5)}`; // 長劃—點（ISO 04.1）
  const HIDDEN_DASH = `${f(THIN * 8)} ${f(THIN * 3.5)}`;                                     // 虛線（ISO 02.1）

  function arrow(x, y, dx, dy, color) {      // 箭尖在 (x,y)，指向 (dx,dy)
    const L = Math.hypot(dx, dy); const ux = dx / L, uy = dy / L;
    const bx = x - ux * AR, by = y - uy * AR;
    return `<path d="M${f(x)} ${f(y)}L${f(bx - uy * AW)} ${f(by + ux * AW)}L${f(bx + uy * AW)} ${f(by - ux * AW)}Z" fill="${color}"/>`;
  }
  function tline(x1, y1, x2, y2, color, extra) {
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${color}" stroke-width="${THIN}"${extra || ''}/>`;
  }
  // 水平尺寸（量 x 方向距離）；off<0 畫在下方
  function dimX(x1, x2, yRef1, yRef2, yDim, text, color, ext1Center, ext2Center) {
    let s = '';
    const dir = yDim > (yRef1 + yRef2) / 2 ? 1 : -1;
    // 延伸線：從輪廓留間隙開始，超出尺寸線 OVER；若是孔的中心線延伸，從孔邊外開始畫細實線
    s += tline(x1, yRef1 + dir * (ext1Center ? 0 : GAP), x1, yDim + dir * OVER, color);
    s += tline(x2, yRef2 + dir * (ext2Center ? 0 : GAP), x2, yDim + dir * OVER, color);
    s += tline(x1, yDim, x2, yDim, color);
    s += arrow(x1, yDim, -1, 0, color) + arrow(x2, yDim, 1, 0, color);
    s += `<text x="${f((x1 + x2) / 2)}" y="${f(yDim - 1.6)}" font-size="${TXT}" text-anchor="middle" fill="${color}" ${FONT}>${text}</text>`;
    return s;
  }
  // 垂直尺寸（量 y 方向距離）；數字由右側讀（逆時針轉 90°，寫在尺寸線左側）
  function dimY(y1, y2, xRef1, xRef2, xDim, text, color, ext1Center, ext2Center) {
    let s = '';
    const dir = xDim > (xRef1 + xRef2) / 2 ? 1 : -1;
    s += tline(xRef1 + dir * (ext1Center ? 0 : GAP), y1, xDim + dir * OVER, y1, color);
    s += tline(xRef2 + dir * (ext2Center ? 0 : GAP), y2, xDim + dir * OVER, y2, color);
    s += tline(xDim, y1, xDim, y2, color);
    s += arrow(xDim, y1, 0, y1 > y2 ? 1 : -1, color) + arrow(xDim, y2, 0, y2 > y1 ? 1 : -1, color);
    const cy = (y1 + y2) / 2;
    s += `<text x="${f(xDim - 1.6)}" y="${f(cy)}" font-size="${TXT}" text-anchor="middle" fill="${color}" transform="rotate(-90 ${f(xDim - 1.6)} ${f(cy)})" ${FONT}>${text}</text>`;
    return s;
  }
  function glyph(t, x, y, problem) {
    const bg = problem ? '#dc2626' : '#e5e7eb', fg = problem ? '#ffffff' : '#111827', bd = problem ? '#991b1b' : '#9ca3af';
    let sym = '';
    if (t === 'h') sym = `<line x1="${f(x - 3)}" y1="${f(y)}" x2="${f(x + 3)}" y2="${f(y)}" stroke="${fg}" stroke-width="1.3"/>`;
    if (t === 'v') sym = `<line x1="${f(x)}" y1="${f(y - 3)}" x2="${f(x)}" y2="${f(y + 3)}" stroke="${fg}" stroke-width="1.3"/>`;
    if (t === 'coin') sym = `<circle cx="${f(x)}" cy="${f(y)}" r="1.9" fill="${fg}"/>`;
    if (t === 'mid') sym = `<line x1="${f(x - 3)}" y1="${f(y)}" x2="${f(x + 3)}" y2="${f(y)}" stroke="${fg}" stroke-width="1"/><circle cx="${f(x)}" cy="${f(y)}" r="1.5" fill="${fg}"/>`;
    return `<rect x="${f(x - 4.5)}" y="${f(y - 4.5)}" width="9" height="9" rx="1.8" fill="${bg}" stroke="${bd}" stroke-width="0.6"/>${sym}`;
  }
  function originMark() {
    return `<circle cx="${OX}" cy="${OY}" r="2.6" fill="none" stroke="#6b7280" stroke-width="${THIN}"/><circle cx="${OX}" cy="${OY}" r="0.9" fill="#6b7280"/>`;
  }
  function centerMark(cx, cy, r) {
    const e = r + 3 * K;
    const da = ` stroke-dasharray="${CENTER_DASH}"`;
    // 從圓心往兩側對稱畫，讓長劃落在圓心交叉處
    return tline(cx, cy, cx + e, cy, '#374151', da) + tline(cx, cy, cx - e, cy, '#374151', da) +
      tline(cx, cy, cx, cy + e, '#374151', da) + tline(cx, cy, cx, cy - e, '#374151', da);
  }

  // 由案例資料畫一張草圖（which：'bad' 或 'good'）；opts.quiz：不畫說明文字（測驗用）
  function render(c, which, opts) {
    opts = opts || {};
    if (c.plane) return renderPlane(which === 'good', opts);
    const s = c[which];
    const P = n => n === 'O' ? [0, 0] : s.pts[n];
    const col = COLORS[s.color] || COLORS.black;
    const dimCol = '#374151';
    let g = '';
    // 封閉區域淡色（示意）：基本矩形四邊都在、且無縫時才上色；有一般中線時分兩塊上色
    const closed = ['open', 'gap', 'overshoot'].indexOf(c.id) < 0 || which === 'good';
    if (closed) {
      const pa = s.pts.A || [0, 0], pc = s.pts.C;
      const split = s.lines.some(l => l.id === 'M' && !l.construction);
      if (split) {
        g += `<rect x="${X(pa[0])}" y="${Y(pc[1])}" width="${f(30 * K)}" height="${f(40 * K)}" fill="#bfdbfe" fill-opacity=".55"/>`;
        g += `<rect x="${X(pa[0] + 30)}" y="${Y(pc[1])}" width="${f(30 * K)}" height="${f(40 * K)}" fill="#fde68a" fill-opacity=".55"/>`;
      } else {
        g += `<rect x="${X(pa[0])}" y="${Y(pc[1])}" width="${f((pc[0] - pa[0]) * K)}" height="${f((pc[1] - pa[1]) * K)}" fill="#dbeafe" fill-opacity=".6"/>`;
      }
    }
    g += originMark();
    // 孔的中心線（細鏈線，超出孔 3 mm）
    s.circles.forEach(ci => { const [x, y] = P(ci.c); g += centerMark(X(x), Y(y), ci.r * K); });
    // 尺寸
    s.dims.forEach(d => {
      if (!d.c2) return;
      const [hx, hy] = P(d.refs[1]);
      const da = ` stroke-dasharray="${CENTER_DASH}"`;
      if (d.t === 'dx') g += tline(X(hx), Y(hy), X(hx), Y(d.r2), '#374151', da);
      else g += tline(X(hx), Y(hy), X(d.r2), Y(hy), '#374151', da);
    });
    s.dims.forEach(d => {
      const dc = d.conflict ? COLORS.red : dimCol;
      if (d.t === 'dx') g += dimX(X(d.x1), X(d.x2), Y(d.r1), Y(d.r2), Y(d.at), d.val, dc, false, d.c2);
      else if (d.t === 'dy') g += dimY(Y(d.y1), Y(d.y2), X(d.r1), X(d.r2), X(d.at), d.val, dc, false, d.c2);
      else if (d.t === 'dia') {
        const ci = s.circles.find(cc => cc.id === d.c); const [x, y] = P(ci.c);
        const cx = X(x), cy = Y(y), r = ci.r * K, a = -Math.PI / 4;
        const ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a);
        const kx = ex + 13, ky = ey - 13;
        // 引線方向通過圓心，箭頭由外指向圓周；數字寫在水平引線上方
        g += tline(ex, ey, kx, ky, dimCol) + tline(kx, ky, kx + 20, ky, dimCol) + arrow(ex, ey, -Math.cos(a), -Math.sin(a), dimCol);
        g += `<text x="${f(kx + 10)}" y="${f(ky - 1.6)}" font-size="${TXT}" text-anchor="middle" fill="${dimCol}" ${FONT}>⌀${d.val}</text>`;
      }
    });
    // 輪廓（粗實線）與構造線
    s.lines.forEach(l => {
      const a = P(l.a), b = P(l.b);
      if (l.construction) {
        g += `<line x1="${X(a[0])}" y1="${Y(a[1]) + 6}" x2="${X(b[0])}" y2="${Y(b[1]) - 6}" stroke="#6b7280" stroke-width="${THIN}" stroke-dasharray="${CENTER_DASH}"/>`;
        return;
      }
      const lc = l.color ? COLORS[l.color] : col;
      const off = l.overlapDraw ? -2.2 : 0;
      g += `<line x1="${X(a[0])}" y1="${f(Y(a[1]) + off)}" x2="${X(b[0])}" y2="${f(Y(b[1]) + off)}" stroke="${lc}" stroke-width="${THICK}" stroke-linecap="round"/>`;
    });
    s.circles.forEach(ci => { const [x, y] = P(ci.c); g += `<circle cx="${X(x)}" cy="${Y(y)}" r="${f(ci.r * K)}" fill="#ffffff" stroke="${col}" stroke-width="${THICK}"/>`; });
    // 端點（線段的端點畫小點，未封閉的端點畫空心圈）
    const deg = {};
    s.lines.filter(l => !l.construction).forEach(l => { deg[l.a] = (deg[l.a] || 0) + 1; deg[l.b] = (deg[l.b] || 0) + 1; });
    Object.keys(deg).forEach(n => {
      const [x, y] = P(n);
      if (deg[n] === 1 && !opts.noDots) g += `<circle cx="${X(x)}" cy="${Y(y)}" r="1.9" fill="#ffffff" stroke="${col}" stroke-width="0.9"/>`;
    });
    (s.glyphs || []).forEach(gl => { g += glyph(gl.t, X(gl.at[0]) + gl.dx, Y(gl.at[1]) + gl.dy, gl.problem); });
    // 放大圈
    if (s.magnify) {
      const mx = 226, my = 30, R = 24, z = s.magnify.zoom;
      const [ax, ay] = s.magnify.at;
      const T = (x, y) => [mx + (x - ax) * K * z / 2.4 * 0.5, my - (y - ay) * K * z / 2.4 * 0.5];
      const d2 = s.pts.D2, dd = s.pts.D;
      let inner = '';
      const seg = (p, q) => { const [x1, y1] = T(p[0], p[1]), [x2, y2] = T(q[0], q[1]); inner += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="2.2" stroke-linecap="round"/>`; };
      seg(d2, [d2[0] + 10, d2[1]]); seg(dd, [dd[0], dd[1] - 10]);
      const [g1x, g1y] = T(d2[0], d2[1]), [g2x, g2y] = T(dd[0], dd[1]);
      inner += `<circle cx="${f(g1x)}" cy="${f(g1y)}" r="2" fill="#fff" stroke="${col}"/><circle cx="${f(g2x)}" cy="${f(g2y)}" r="2" fill="#fff" stroke="${col}"/>`;
      g += `<defs><clipPath id="mag-${c.id}"><circle cx="${mx}" cy="${my}" r="${R}"/></clipPath></defs>`;
      g += `<circle cx="${mx}" cy="${my}" r="${R}" fill="#ffffff" stroke="#9ca3af" stroke-width="1"/><g clip-path="url(#mag-${c.id})">${inner}</g>`;
      g += tline(X(ax) + 4, Y(ay) - 4, mx - R * 0.72, my + R * 0.7, '#9ca3af');
      if (!opts.quiz) g += `<text x="${mx - R - 6}" y="${my + 4}" font-size="9" text-anchor="end" fill="#b91c1c" ${FONT}>${s.magnify.text}</text>`;
    }
    if (!opts.quiz) (s.callouts || []).forEach(co => {
      g += `<circle cx="${X(co.at[0])}" cy="${Y(co.at[1])}" r="${f(co.r * K)}" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="3 2"/>`;
      g += `<text x="${X(co.tx)}" y="${Y(co.ty)}" font-size="9.5" text-anchor="middle" fill="#b91c1c" font-weight="700" ${FONT}>${co.text}</text>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB.join(' ')}" role="img" aria-label="${c.name}（${which === 'good' ? '正確' : '錯誤'}）">` +
      `<rect width="${VB[2]}" height="${VB[3]}" fill="#ffffff"/>${g}</svg>`;
  }

  // 選錯平面：等角圖。可見邊＝粗實線、隱藏邊＝細虛線；三個基準平面用細實線方框
  function renderPlane(good, opts) {
    // 2026-10 審查：原本視線來自 (+x,+y,+z)，等於從背後看，Front 平面跑到右邊、Right 平面跑到左邊；
    // 改成 Onshape 預設等角視角，視線來自 (+x,−y,+z)：Front（XZ）在左前、Right（YZ）在右
    const S = 1.0, cx = 70, cy = 120, c30 = Math.cos(Math.PI / 6), s30 = 0.5;
    const pj = (x, y, z) => [f(cx + (x + y) * c30 * S), f(cy + (x - y) * s30 * S - z * S)];
    let g = '';
    const poly = (pts, attrs) => `<polygon points="${pts.map(p => pj(...p).join(',')).join(' ')}" ${attrs}/>`;
    const L = 70;
    g += poly([[0, 0, 0], [L, 0, 0], [L, L, 0], [0, L, 0]], 'fill="#93c5fd" fill-opacity=".18" stroke="#60a5fa" stroke-width="0.7"');        // Top (XY)
    g += poly([[0, 0, 0], [L, 0, 0], [L, 0, L], [0, 0, L]], 'fill="#fcd34d" fill-opacity=".14" stroke="#f59e0b" stroke-width="0.7"');        // Front (XZ)
    g += poly([[0, 0, 0], [0, L, 0], [0, L, L], [0, 0, L]], 'fill="#c4b5fd" fill-opacity=".14" stroke="#8b5cf6" stroke-width="0.7"');        // Right (YZ)
    const lab = (p, t, col) => { const [x, y] = pj(...p); return `<text x="${x}" y="${y}" font-size="9" fill="${col}" text-anchor="middle" ${FONT}>${t}</text>`; };
    g += lab([L + 4, L / 2 + 14, 0], 'Top（上）', '#1d4ed8') + lab([L / 2, -4, L + 6], 'Front（前）', '#b45309') + lab([-6, L / 2, L + 4], 'Right（右）', '#6d28d9');
    // 零件：60×40×10 的板
    const box = good ? [0, 60, 0, 40, 0, 10] : [0, 60, 0, 10, 0, 40];
    const [x0, x1, y0, y1, z0, z1] = box;
    const V = (i, j, k) => [[x0, x1][i], [y0, y1][j], [z0, z1][k]];
    const edges = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { edges.push([V(i, j, 0), V(i, j, 1), i, j, null]); }
    for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) { edges.push([V(i, 0, k), V(i, 1, k), i, null, k]); }
    for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) { edges.push([V(0, j, k), V(1, j, k), null, j, k]); }
    // 視線來自 (+x,−y,+z)：離視線最遠的角點是 (x0,y1,z0)，和它相連的三條邊被擋住
    edges.forEach(([a, b, i, j, k]) => {
      const hidden = (i === 0 || i === null) && (j === 1 || j === null) && (k === 0 || k === null);
      const [ax, ay] = pj(...a), [bx, by] = pj(...b);
      g += hidden
        ? `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#111827" stroke-width="${THIN}" stroke-dasharray="${HIDDEN_DASH}"/>`
        : `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#111827" stroke-width="${THICK}" stroke-linecap="round"/>`;
    });
    // 可見面淡色
    g = poly([V(0, 0, 1), V(1, 0, 1), V(1, 1, 1), V(0, 1, 1)], 'fill="#dbeafe" fill-opacity=".8"') +
        poly([V(1, 0, 0), V(1, 1, 0), V(1, 1, 1), V(1, 0, 1)], 'fill="#bfdbfe" fill-opacity=".8"') +
        poly([V(0, 0, 0), V(1, 0, 0), V(1, 0, 1), V(0, 0, 1)], 'fill="#93c5fd" fill-opacity=".8"') + g;   // 可見面：z1、x1、y0（法向量與視線 (1,−1,1) 內積 > 0）
    // 原點
    const [ox, oy] = pj(0, 0, 0);
    g += `<circle cx="${ox}" cy="${oy}" r="2.4" fill="none" stroke="#6b7280" stroke-width="${THIN}"/>`;
    if (!opts.quiz) g += `<text x="130" y="194" font-size="10" text-anchor="middle" fill="${good ? '#15803d' : '#b91c1c'}" font-weight="700" ${FONT}>${good ? '草圖在 Top 平面 → 平放的底板 ✓' : '草圖在 Front 平面 → 板子站起來了 ✗'}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" role="img" aria-label="選錯基準平面（${good ? '正確' : '錯誤'}）"><rect width="260" height="200" fill="#ffffff"/>${g}</svg>`;
  }

  // 圖例：線型與 Onshape 顏色
  function legend() {
    const row = (y, el, t) => `${el}<text x="58" y="${y + 3.5}" font-size="9.5" fill="#111827" ${FONT}>${t}</text>`;
    const ln = (y, attrs) => `<line x1="8" y1="${y}" x2="50" y2="${y}" ${attrs}/>`;
    let g = '';
    g += row(12, ln(12, `stroke="#111827" stroke-width="${THICK}"`), '粗實線：輪廓（黑＝完全定義）');
    g += row(28, ln(28, `stroke="#2563eb" stroke-width="${THICK}"`), '藍色：未完全定義（拖得動）');
    g += row(44, ln(44, `stroke="#dc2626" stroke-width="${THICK}"`), '紅色：過度定義／衝突');
    g += row(60, tline(8, 60, 50, 60, '#374151') + arrow(8, 60, -1, 0, '#374151') + arrow(50, 60, 1, 0, '#374151'), '細實線＋箭頭：尺寸線、延伸線');
    g += row(76, ln(76, `stroke="#374151" stroke-width="${THIN}" stroke-dasharray="${CENTER_DASH}"`), '細鏈線：中心線、對稱線');
    g += row(92, ln(92, `stroke="#111827" stroke-width="${THIN}" stroke-dasharray="${HIDDEN_DASH}"`), '細虛線：隱藏線（3D 圖）');
    g += row(108, glyph('h', 18, 108) + glyph('v', 30, 108) + glyph('coin', 42, 108), '限制條件：水平、垂直、重合');
    g += row(124, glyph('h', 18, 124, true), '紅底白符號：這個限制條件有衝突');
    g += row(140, `<circle cx="29" cy="140" r="2.6" fill="none" stroke="#6b7280" stroke-width="${THIN}"/><circle cx="29" cy="140" r="0.9" fill="#6b7280"/>`, '原點　（尺寸單位 mm，不另寫）');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 150" role="img" aria-label="圖例"><rect width="260" height="150" fill="#ffffff"/>${g}</svg>`;
  }

  const api = { CASES, render, legend, K, OX, OY, BASE, clone };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SketchCases = api;
})(typeof window !== 'undefined' ? window : globalThis);
