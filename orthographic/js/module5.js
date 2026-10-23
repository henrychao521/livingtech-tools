// 三視圖 模組 5：Projection Game — 三輪闖關
// Round 1: 視圖 → 物件配對（SVG 全靜態）
// Round 2: 缺失視圖補完（SVG 全靜態）
// Round 3: 方塊堆疊建構（Three.js 互動 + 即時投影比對）
// 設計參考：eGrove Spatial Vis Training、Projection Game 類教育軟體
//          CNS 3《工程製圖》第三角投影法

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// =============================================================
// SVG 視圖繪製工具（Round 1 / Round 2 用）
// =============================================================
const VIEW_BG = '#1E293B', VIEW_FG = '#A5B4FC', VIEW_EDGE = '#3730A3', VIEW_DASH = '#94A3B8';
// 視圖類型依 models/orthographic/*.scad 的實際立體（OpenSCAD 的 -Y 為正面）與比例繪製；
// 三個視圖同一比例尺、各自置中在同尺寸方格 → 第三角法排列時自然「長對正、高平齊、寬相等」。
const SHAPES = {
  cube:      { label: '立方體', front: 'square', side: 'square', top: 'square', iso: 'cube' },
  cylinder:  { label: '圓柱',   front: 'rect',   side: 'rect',   top: 'circle', iso: 'cylinder' },
  cone:      { label: '圓錐',   front: 'triangle', side: 'triangle', top: 'circle-dot', iso: 'cone' },
  sphere:    { label: '球體',   front: 'circle', side: 'circle', top: 'circle', iso: 'sphere' },
  lblock:    { label: 'L 型塊', front: 'l-shape', side: 'rect-tall-split', top: 'rect-split', iso: 'lblock' },
  step:      { label: '階梯塊', front: 'step-l', side: 'rect-tall-split-half', top: 'rect-split-half', iso: 'step' },
  hole:      { label: '帶圓孔板', front: 'rect-circle-hole', side: 'square-dash-horiz', top: 'rect-dash-vert', iso: 'hole' },
  tslot:     { label: 'T 槽塊', front: 'tslot-front', side: 'tslot-side', top: 'tslot-top', iso: 'tslot' },
  bracket:   { label: 'L 角架', front: 'bracket-front', side: 'bracket-side', top: 'l-thin', iso: 'bracket' },
  pyramid:   { label: '金字塔', front: 'triangle', side: 'triangle', top: 'square-diag', iso: 'pyramid' },
};

// SVG 視圖元件：給定 viewType + size，回傳 SVG 字串
// 線型以 data-k 標示：visible 可見線（實線）、hidden 隱藏線（虛線）、center 中心線（細鏈線）
function svgView(type, size = 80) {
  const s = size, c = s / 2, pad = s * 0.12, L = s - pad * 2;
  const W = s, H = s;
  const fill = VIEW_FG, stroke = VIEW_EDGE;
  const inner = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="${stroke}" stroke-width="0.7" stroke-dasharray="2 2" opacity="0.4"/>`;
  // 以 L 為長邊、置中的外框：wr、hr 為寬、高相對 L 的比例
  const box = (wr, hr) => { const w = wr * L, h = hr * L; return { x0: c - w / 2, y0: c - h / 2, w, h }; };
  const rectOf = b => `<rect x="${b.x0}" y="${b.y0}" width="${b.w}" height="${b.h}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const poly = p => `<polygon points="${p.map(q => q.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const vis = (x1, y1, x2, y2) => `<line data-k="visible" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5"/>`;
  const hid = (x1, y1, x2, y2) => `<line data-k="hidden" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
  const ctr = (x1, y1, x2, y2) => `<line data-k="center" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.8" stroke-dasharray="6 2 1 2"/>`;
  // L 形外形：豎臂寬 arm、低段高 low（皆為比例），豎臂在左
  const lPoly = (b, arm, low) => poly([[b.x0, b.y0], [b.x0 + b.w * arm, b.y0], [b.x0 + b.w * arm, b.y0 + b.h * (1 - low)],
    [b.x0 + b.w, b.y0 + b.h * (1 - low)], [b.x0 + b.w, b.y0 + b.h], [b.x0, b.y0 + b.h]]);
  const holeR = L * 36 / 160;   // 帶圓孔板：Ø36 / 寬 80

  function shape() {
    switch (type) {
      case 'square':
        return `<rect x="${pad}" y="${pad}" width="${s - pad * 2}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect':
        return `<rect x="${pad}" y="${pad * 1.8}" width="${s - pad * 2}" height="${s - pad * 3.6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect-tall':
        return `<rect x="${pad * 1.8}" y="${pad}" width="${s - pad * 3.6}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'circle':
        return `<circle cx="${c}" cy="${c}" r="${(s - pad * 2) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'circle-dot':
        return `<circle cx="${c}" cy="${c}" r="${(s - pad * 2) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><circle cx="${c}" cy="${c}" r="2" fill="${stroke}"/>`;
      case 'triangle':
        return `<polygon points="${c},${pad} ${s - pad},${s - pad} ${pad},${s - pad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 't-shape':
        return `<polygon points="${pad},${pad} ${s - pad},${pad} ${s - pad},${pad + (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${pad + (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${s - pad} ${c - (s - pad * 2) * 0.15},${s - pad} ${c - (s - pad * 2) * 0.15},${pad + (s - pad * 2) * 0.4} ${pad},${pad + (s - pad * 2) * 0.4}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'square-diag':
        return `<rect x="${pad}" y="${pad}" width="${s - pad * 2}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="${pad}" y1="${pad}" x2="${s - pad}" y2="${s - pad}" stroke="${stroke}" stroke-width="1"/><line x1="${pad}" y1="${s - pad}" x2="${s - pad}" y2="${pad}" stroke="${stroke}" stroke-width="1"/><circle cx="${c}" cy="${c}" r="2.5" fill="${stroke}"/>`;

      // L 型塊（寬 90 × 深 40 × 高 60；左高臂寬 30、右低座高 30）
      case 'l-shape': { const b = box(1, 2 / 3); return lPoly(b, 1 / 3, 1 / 2); }
      case 'rect-split': { const b = box(1, 4 / 9); const x = b.x0 + b.w / 3; return rectOf(b) + vis(x, b.y0, x, b.y0 + b.h); }
      case 'rect-tall-split': { const b = box(4 / 9, 2 / 3); const y = b.y0 + b.h / 2; return rectOf(b) + vis(b.x0, y, b.x0 + b.w, y); }
      // 階梯塊（寬 80 × 深 40 × 高 60；上層在左半）
      case 'step-l': { const b = box(1, 3 / 4); return lPoly(b, 1 / 2, 1 / 2); }
      case 'rect-split-half': { const b = box(1, 1 / 2); const x = b.x0 + b.w / 2; return rectOf(b) + vis(x, b.y0, x, b.y0 + b.h); }
      case 'rect-tall-split-half': { const b = box(1 / 2, 3 / 4); const y = b.y0 + b.h / 2; return rectOf(b) + vis(b.x0, y, b.x0 + b.w, y); }
      // 帶圓孔板（寬 80 × 深 50 × 高 50，Ø36 孔前後貫穿）
      case 'rect-circle-hole': {
        const b = box(1, 5 / 8), r = holeR;
        return rectOf(b) + `<circle cx="${c}" cy="${c}" r="${r}" fill="${VIEW_BG}" stroke="${stroke}" stroke-width="1.5"/>` +
          ctr(c - r - 4, c, c + r + 4, c) + ctr(c, c - r - 4, c, c + r + 4);
      }
      case 'rect-dash-vert': {   // 俯視：孔的左右邊界
        const b = box(1, 5 / 8), r = holeR;
        return rectOf(b) + hid(c - r, b.y0, c - r, b.y0 + b.h) + hid(c + r, b.y0, c + r, b.y0 + b.h) + ctr(c, b.y0 - 4, c, b.y0 + b.h + 4);
      }
      case 'square-dash-horiz': {   // 右側視：孔的上下邊界
        const b = box(5 / 8, 5 / 8), r = holeR;
        return rectOf(b) + hid(b.x0, c - r, b.x0 + b.w, c - r) + hid(b.x0, c + r, b.x0 + b.w, c + r) + ctr(b.x0 - 4, c, b.x0 + b.w + 4, c);
      }
      // L 角架（寬 60 × 深 60 × 高 40；俯視 L 形，豎腳在左、橫腳在前，腳厚 1/4）
      case 'bracket-front': { const b = box(1, 2 / 3); const x = b.x0 + b.w / 4; return rectOf(b) + hid(x, b.y0, x, b.y0 + b.h); }
      case 'bracket-side': { const b = box(1, 2 / 3); const x = b.x0 + b.w / 4; return rectOf(b) + vis(x, b.y0, x, b.y0 + b.h); }
      case 'l-thin': { const b = box(1, 1); return lPoly(b, 1 / 4, 1 / 4); }
      // T 槽塊（寬 80 × 深 30 × 高 60；頂面 T 形槽深一半，橫槽在後方並從背面穿出）
      case 'tslot-front': {
        const b = box(1, 3 / 4), yb = b.y0 + b.h / 2, X = k => b.x0 + b.w * k / 8;
        return rectOf(b) + [1, 3, 5, 7].map(k => hid(X(k), b.y0, X(k), yb)).join('') + hid(X(1), yb, X(7), yb);
      }
      case 'tslot-side': {
        const b = box(3 / 8, 3 / 4), yb = b.y0 + b.h / 2, x1 = b.x0 + b.w / 6, x2 = b.x0 + b.w * 2 / 3;
        return rectOf(b) + hid(x1, b.y0, x1, yb) + hid(x2, b.y0, x2, yb) + hid(x1, yb, b.x0 + b.w, yb);
      }
      case 'tslot-top': {
        const b = box(1, 3 / 8), X = k => b.x0 + b.w * k / 8, y1 = b.y0 + b.h / 3, y2 = b.y0 + b.h * 5 / 6;
        const p = [[X(1), b.y0], [X(1), y1], [X(3), y1], [X(3), y2], [X(5), y2], [X(5), y1], [X(7), y1], [X(7), b.y0]];
        return rectOf(b) + `<polyline data-k="visible" points="${p.map(q => q.join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
      }
      default:
        return `<text x="${c}" y="${c}" text-anchor="middle" font-size="10" fill="${stroke}">?</text>`;
    }
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background:${VIEW_BG};border-radius:4px">${inner}${shape()}</svg>`;
}

// 等角預覽：改用 OpenSCAD 預渲 PNG（精準等角投影 30°/30°/90° + 真實光影）
// 路徑 models/orthographic/<name>-iso.png（由 scripts/build_models.sh 編譯產出）
// type → 對應 .scad 檔名映射；M5 用的 type 與檔案命名不完全一致，這裡做別名表
const ISO_FILE_MAP = { l: 'lblock' };  // 例：題目用 'l' 但檔名是 'lblock'

function svgIso(type, size = 100) {
  const file = ISO_FILE_MAP[type] || type;
  // 用 <img> 嵌入 PNG，外面再包一層 <svg> 保持原 API 介面（同尺寸、可內嵌）
  return `<img src="../../models/orthographic/${file}-iso.png" width="${size}" height="${size}" style="background:#1E293B;border-radius:4px;display:block;margin:0 auto" alt="${type}" loading="lazy">`;
}

// =============================================================
// 共用：題目骨架
// =============================================================
// 選項顯示前隨機排列（Fisher–Yates）；判分看 data-o 的內容，不看位置
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const state = { score: 0, total: 0, answered: { 1: new Set(), 2: new Set(), 3: new Set() } };

function updateScore() {
  document.getElementById('score').textContent = state.score;
}

function markCorrect(round, qid) {
  if (state.answered[round].has(qid)) return;
  state.answered[round].add(qid);
  state.score++;
  updateScore();
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  const p = loadP(); p.module5 = true; p.module5_score = state.score; saveP(p);
  // 通關全部 → 慶祝
  if (state.score >= state.total) {
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 全部過關！${state.score} / ${state.total}`, 'good');
  }
}

function markWrong() {
  if (typeof SoundFX !== 'undefined') SoundFX.error();
}

// 第三角法排列：俯視在正視上方、右側視在正視右方（長對正、高平齊）
// cells = { front, side, top }：各格內容（SVG 或「?」方塊）的 HTML
function tpLayout(cells) {
  const cell = (k, label) => `<div class="view-cell tp-${k}">${cells[k]}<div class="view-cell-label">${label}</div></div>`;
  return `<div class="tp-grid" role="group" aria-label="第三角法三視圖">
        ${cell('top', '俯視 TOP')}
        <div class="tp-note">第三角法<br>俯視在上<br>右側視在右</div>
        ${cell('front', '正視 FRONT')}
        ${cell('side', '右側視 RIGHT')}
      </div>`;
}

// =============================================================
// Round 1: 視圖 → 物件配對
// =============================================================
const ROUND1 = [
  { ans: 'cube',     views: ['square','square','square'],         options: ['cube','cylinder','sphere','pyramid'],  expl: '三個視圖都是正方形 → 立方體（六面相等）。' },
  { ans: 'cylinder', views: ['rect','rect','circle'],             options: ['cylinder','cube','cone','sphere'],     expl: '俯視 = 圓 + 正視 / 側視 = 矩形 → 圓柱。' },
  { ans: 'cone',     views: ['triangle','triangle','circle-dot'], options: ['cone','pyramid','cylinder','sphere'],  expl: '俯視帶中心點（圓錐尖）+ 正視 / 側視為三角形 → 圓錐。' },
  { ans: 'lblock',   views: ['l-shape','rect-tall-split','rect-split'], options: ['lblock','tslot','bracket','cube'],     expl: '正視 = L 形；俯視 = 矩形加一條垂直分界線（高段頂面與低段頂面的交界，和正視的內角長對正）；右側視 = 矩形加一條水平分界線（低段頂面的高度，和正視內角高平齊）→ L 型塊（高低兩個方塊相連）。' },
  { ans: 'hole',     views: ['rect-circle-hole','square-dash-horiz','rect-dash-vert'], options: ['hole','tslot','step','cylinder'], expl: '正視 = 矩形含實線圓（孔口）；右側視 = 兩條水平虛線（孔的上下邊界，和圓孔高平齊）；俯視 = 兩條垂直虛線（孔的左右邊界，和圓孔長對正）；細鏈線是孔的中心線 → 帶圓孔板。' },
];

function buildRound1() {
  const root = document.getElementById('round-1');
  root.innerHTML = '<p style="font-size:13.5px;color:#475569;margin-bottom:14px">給你依第三角法排好的三視圖（俯視在正視上方、右側視在正視右方），從 4 個 3D 物件中選對的一個。<span class="hint-toggle" onclick="this.nextElementSibling.style.display=\'inline\';this.style.display=\'none\'">💡 顯示提示</span><span style="display:none;margin-left:8px;color:#64748B">「對齊規則」：長對正：正視長 = 俯視長；高平齊：正視高 = 側視高；寬相等：俯視的深度 = 側視的寬度（俯視下緣、側視左緣都是物體前方）。</span></p>';
  ROUND1.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${i + 1} / ${ROUND1.length}</span>
        <span style="font-size:12px;color:#94A3B8">視圖 → 物件</span>
      </div>
      ${tpLayout({ front: svgView(q.views[0], 90), side: svgView(q.views[1], 90), top: svgView(q.views[2], 90) })}
      <p class="qprompt">這是什麼 3D 物件？</p>
      <div class="opt-grid">
        ${shuffled(q.options).map(o => `<div class="opt-cell" data-o="${o}" tabindex="0" role="button" aria-label="${SHAPES[o].label}">${svgIso(o, 90)}<div class="opt-label">${SHAPES[o].label}</div></div>`).join('')}
      </div>
      <div class="feedback-slot"></div>
    `;
    root.appendChild(card);
    card.querySelectorAll('.opt-cell').forEach(opt => {
      opt.addEventListener('click', () => {
        if (card.querySelector('.opt-cell.correct') || card.querySelector('.opt-cell.wrong.disabled')) return;
        const ok = opt.dataset.o === q.ans;
        ortLog('r1q' + i, q.options.indexOf(opt.dataset.o));
        card.querySelectorAll('.opt-cell').forEach(x => {
          x.classList.add('disabled');
          if (x.dataset.o === q.ans) x.classList.add('correct');
          if (x === opt && !ok) x.classList.add('wrong');
        });
        // 重答（答錯後按「再試一次」）答對只顯示解析、不計分
        const retried = card.dataset.retry === '1';
        card.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓' : '✗'} ${ok && retried ? '答對了（重答不計分）' : ''}${q.expl}</div>` +
          (ok ? '' : '<button type="button" class="retry-btn" style="margin-top:8px;font-size:13px;padding:5px 12px;border-radius:6px;border:1px solid #4F46E5;background:#fff;color:#4F46E5;cursor:pointer">↻ 再試一次（不計分）</button>');
        if (ok && !retried) markCorrect(1, i);
        else if (!ok) {
          markWrong();
          card.querySelector('.retry-btn').addEventListener('click', () => {
            card.dataset.retry = '1';
            card.querySelectorAll('.opt-cell').forEach(x => x.classList.remove('disabled', 'correct', 'wrong'));
            card.querySelector('.feedback-slot').innerHTML = '';
          });
        }
      });
      // 鍵盤操作：Enter / 空白鍵等同點選
      opt.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
      });
    });
  });
}

// =============================================================
// Round 2: 缺失視圖補完
// =============================================================
const ROUND2 = [
  { shape: 'cube',     missing: 'side',  known: { front: 'square', top: 'square' }, options: ['square','rect','circle','triangle'], expl: '立方體六面相等 → 三個視圖都是相同正方形。' },
  { shape: 'cylinder', missing: 'top',   known: { front: 'rect',   side: 'rect' },  options: ['circle','square','triangle','rect'],  expl: '圓柱的軸向 = 上下方向 → 俯視 = 圓形。' },
  { shape: 'lblock',   missing: 'front', known: { side: 'rect-tall-split', top: 'rect-split' }, options: ['l-shape','rect','t-shape','triangle'], expl: '俯視的垂直分界線和右側視的水平分界線，告訴你頂面有高低兩段：高段在左、低段在右，低段高度在側視分界線的位置 → 正視 = L 形。' },
  { shape: 'cone',     missing: 'top',   known: { front: 'triangle', side: 'triangle' }, options: ['circle-dot','circle','triangle','square'], expl: '圓錐俯視 = 圓 + 中央一個尖點（從正上方看尖端）。' },
];

const VIEW_KEY = { front: '正視', side: '右側視', top: '俯視' };
const MISSING_CELL = '<div class="tp-missing">?</div>';

function buildRound2() {
  const root = document.getElementById('round-2');
  root.innerHTML = '<p style="font-size:13.5px;color:#475569;margin-bottom:14px">給你 3D 物件 + 兩個視圖（第三角法排列），從 4 個選項中選出缺失的第三視圖。</p>';
  ROUND2.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    const knownFirst = Object.keys(q.known)[0];
    const knownSecond = Object.keys(q.known)[1];
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${i + 1} / ${ROUND2.length}</span>
        <span style="font-size:12px;color:#94A3B8">補缺失視圖</span>
      </div>
      <div class="r2-layout">
        <div class="r2-iso">
          ${svgIso(q.shape, 100)}
          <div style="color:#FBBF24;font-size:11px;font-family:Inter;margin-top:4px">3D 物件</div>
        </div>
        ${tpLayout({
          front: q.known.front ? svgView(q.known.front, 80) : MISSING_CELL,
          side:  q.known.side  ? svgView(q.known.side, 80)  : MISSING_CELL,
          top:   q.known.top   ? svgView(q.known.top, 80)   : MISSING_CELL,
        })}
      </div>
      <p class="qprompt" style="margin-top:14px">缺失的 <strong style="color:#4F46E5">${VIEW_KEY[q.missing]}</strong> 是哪一個？</p>
      <div class="opt-grid">
        ${shuffled(q.options).map(o => `<div class="opt-cell" data-o="${o}" tabindex="0" role="button" aria-label="選項">${svgView(o, 80)}</div>`).join('')}
      </div>
      <div class="feedback-slot"></div>
    `;
    root.appendChild(card);
    const ansSvg = SHAPES[q.shape][q.missing];
    card.querySelectorAll('.opt-cell').forEach(opt => {
      opt.addEventListener('click', () => {
        if (card.querySelector('.opt-cell.correct') || card.querySelector('.opt-cell.wrong.disabled')) return;
        const ok = opt.dataset.o === ansSvg;
        ortLog('r2q' + i, q.options.indexOf(opt.dataset.o));
        card.querySelectorAll('.opt-cell').forEach(x => {
          x.classList.add('disabled');
          if (x.dataset.o === ansSvg) x.classList.add('correct');
          if (x === opt && !ok) x.classList.add('wrong');
        });
        // 重答（答錯後按「再試一次」）答對只顯示解析、不計分
        const retried = card.dataset.retry === '1';
        card.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓' : '✗'} ${ok && retried ? '答對了（重答不計分）' : ''}${q.expl}</div>` +
          (ok ? '' : '<button type="button" class="retry-btn" style="margin-top:8px;font-size:13px;padding:5px 12px;border-radius:6px;border:1px solid #4F46E5;background:#fff;color:#4F46E5;cursor:pointer">↻ 再試一次（不計分）</button>');
        if (ok && !retried) markCorrect(2, i);
        else if (!ok) {
          markWrong();
          card.querySelector('.retry-btn').addEventListener('click', () => {
            card.dataset.retry = '1';
            card.querySelectorAll('.opt-cell').forEach(x => x.classList.remove('disabled', 'correct', 'wrong'));
            card.querySelector('.feedback-slot').innerHTML = '';
          });
        }
      });
      // 鍵盤操作：Enter / 空白鍵等同點選
      opt.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
      });
    });
  });
}

// =============================================================
// Round 3: 方塊堆疊建構（Three.js + 即時投影比對）
// =============================================================
const GRID = 3; // 3×3×3 立方網格
// 目標：用 3D voxel 陣列定義「應該長什麼樣」
// 陣列 voxels[x][y][z] = 1 表示該位置有方塊
const ROUND3 = [
  {
    label: 'L 型塊（兩塊組合）',
    target: (() => {
      const v = makeEmptyGrid();
      // 底排沿 x 一條長條（x=0..2 / y=0 / z=0）+ 左端往上立起兩格（x=0 / y=1、2 / z=0）
      // → 正視看到 L 形，共 5 格
      for (let x = 0; x < 3; x++) v[x][0][0] = 1;
      v[0][1][0] = 1; v[0][2][0] = 1;
      return v;
    })(),
    hint: 'L 型塊：底排一條長條 + 一邊往上立起兩格。',
  },
  {
    label: 'T 形塊（俯視看像 T）',
    target: (() => {
      const v = makeEmptyGrid();
      // 底層 1×3 + 中間往前突出 1×2
      for (let x = 0; x < 3; x++) v[x][0][0] = 1;
      v[1][0][1] = 1; v[1][0][2] = 1;
      return v;
    })(),
    hint: '從俯視看像「T」字形，全部都在底層（y=0）。',
  },
];

function makeEmptyGrid() {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => Array(GRID).fill(0)));
}

function buildRound3() {
  const root = document.getElementById('round-3');
  root.innerHTML = `
    <p style="font-size:13.5px;color:#475569;margin-bottom:14px">這是這個模組最 game 的關卡！在 3×3×3 網格內，<strong>左鍵</strong>點空格加方塊、<strong>右鍵</strong>移除方塊，目標是讓三個視圖完全符合右下角的「目標」。比對 100% 才過關。</p>
    <div id="r3-content"></div>
  `;
  const content = document.getElementById('r3-content');

  ROUND3.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${qi + 1} / ${ROUND3.length}</span>
        <span style="font-size:12px;color:#94A3B8">${q.label}</span>
      </div>
      <div class="stack-game">
        <div class="stack-layout">
          <div class="stack-3d" id="stk3d-${qi}">
            <div style="position:absolute;top:8px;left:10px;font-size:11px;color:#FBBF24;font-weight:700;z-index:2">🎮 建構區（拖曳旋轉相機；點方塊位置加 / 減）</div>
          </div>
          <div class="stack-views">
            <div class="stack-view">
              <div><div class="vlabel">正視</div><canvas id="stk-cur-front-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-front-${qi}" width="64" height="64"></canvas></div>
            </div>
            <div class="stack-view">
              <div><div class="vlabel">右側視</div><canvas id="stk-cur-side-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-side-${qi}" width="64" height="64"></canvas></div>
            </div>
            <div class="stack-view">
              <div><div class="vlabel">俯視</div><canvas id="stk-cur-top-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-top-${qi}" width="64" height="64"></canvas></div>
            </div>
          </div>
        </div>
        <div class="stack-toolbar">
          <span style="color:#FBBF24;font-weight:700;align-self:center">提示：${q.hint}</span>
          <span style="flex:1"></span>
          <button class="mode-btn active" data-act="mode-add" data-q="${qi}" title="點擊格子放方塊（桌機也可直接左鍵）">➕ 加方塊</button>
          <button class="mode-btn" data-act="mode-del" data-q="${qi}" title="點擊方塊移除（桌機也可直接右鍵）">➖ 刪方塊</button>
          <button class="danger" data-act="clear" data-q="${qi}">🗑 清空</button>
          <button data-act="hint" data-q="${qi}">💡 自動完成（放棄）</button>
        </div>
        <div style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px"><span>視圖比對：<strong id="stk-match-${qi}">0%</strong></span><span id="stk-status-${qi}" style="color:#FBBF24">繼續堆方塊...</span></div>
          <div class="match-bar"><div class="match-bar-fill" id="stk-bar-${qi}" style="width:0%"></div></div>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot" style="background:#6366F1"></span>已放置方塊</div>
            <div class="legend-item"><span class="legend-dot" style="background:#16A34A"></span>目標視圖</div>
            <div class="legend-item"><span class="legend-dot" style="background:#dc2626"></span>差異區域</div>
          </div>
        </div>
      </div>
    `;
    content.appendChild(card);
    initStackGame(qi, q);
  });
}

// 把 3D voxel grid 投影到 2D silhouette（CNS 第三角法，與 3D 相機一致：相機在 +Z 前方、y 向上）
// 回傳「畫面方向」的陣列：out[0] 畫在最上面一列、out[r][0] 畫在最左欄
//   'front' 正視：從 +Z 看，x 向右、y 向上
//   'top'   俯視：從 +Y 往下看，x 向右、後方（z=0）在上、前緣（z 大）在下 → 放在正視上方時前緣貼著正視
//   'side'  右側視：從 +X 看，前方（z 大）在左、後方在右、y 向上 → 放在正視右方
function projectGrid(grid, axis) {
  const n = grid.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      for (let z = 0; z < n; z++) {
        if (grid[x][y][z]) {
          if (axis === 'front') out[n - 1 - y][x] = 1;
          else if (axis === 'side') out[n - 1 - y][n - 1 - z] = 1;
          else if (axis === 'top') out[z][x] = 1;
        }
      }
    }
  }
  return out;
}

// 把 2D silhouette grid 繪製到 canvas
function drawSilhouette(cv, grid2d, color = '#6366F1', diffMask = null) {
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, W, H);
  const n = grid2d.length;
  const cell = Math.floor(Math.min(W, H) / (n + 1));
  const ox = (W - cell * n) / 2, oy = (H - cell * n) / 2;
  // grid2d 已是畫面方向（projectGrid 處理過各視圖的上下左右），這裡照列直接畫
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const v = grid2d[row][col];
      if (v) {
        ctx.fillStyle = (diffMask && diffMask[row][col]) ? '#dc2626' : color;
        ctx.fillRect(ox + col * cell, oy + row * cell, cell - 1, cell - 1);
      }
      // 格線
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(ox + col * cell, oy + row * cell, cell, cell);
    }
  }
}

// 計算兩個 silhouette 的匹配度 0~1
function calcMatch(a, b) {
  const n = a.length;
  let same = 0, total = n * n;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (a[r][c] === b[r][c]) same++;
  return same / total;
}

// 計算差異 mask（標出 a 比 b 多的格子，紅色顯示）
function calcDiff(a, b) {
  const n = a.length;
  const diff = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (a[r][c] !== b[r][c]) diff[r][c] = 1;
  return diff;
}

// 初始化單一方塊堆疊遊戲
function initStackGame(qi, q) {
  const container = document.getElementById(`stk3d-${qi}`);
  const W = container.clientWidth || 400, H = container.clientHeight || 380;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1E293B);

  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(50, 80, 60);
  scene.add(dir);

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 500);
  camera.position.set(70, 60, 90);
  camera.lookAt(15, 15, 15);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(15, 15, 15);

  // 底層格盤
  const gridGroup = new THREE.Group();
  const cellSize = 10;
  const offset = (GRID - 1) / 2;
  // 繪製 voxel 範圍框（半透明）
  const wireMat = new THREE.LineBasicMaterial({ color: 0x4338CA, opacity: 0.4, transparent: true });
  for (let x = 0; x <= GRID; x++) {
    for (let z = 0; z <= GRID; z++) {
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x * cellSize, 0, z * cellSize), new THREE.Vector3(x * cellSize, GRID * cellSize, z * cellSize)]);
      gridGroup.add(new THREE.Line(geom, wireMat));
    }
  }
  // 底面格線
  const floorGeo = new THREE.PlaneGeometry(GRID * cellSize, GRID * cellSize, GRID, GRID);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x0F172A, transparent: true, opacity: 0.5 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(GRID * cellSize / 2, 0, GRID * cellSize / 2);
  scene.add(floor);
  const floorEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(GRID * cellSize, GRID * cellSize, GRID, GRID), 0), new THREE.LineBasicMaterial({ color: 0x334155 }));
  floorEdges.rotation.x = -Math.PI / 2;
  floorEdges.position.copy(floor.position);
  scene.add(floorEdges);
  scene.add(gridGroup);

  // ghost 方塊（hover 預覽）
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0.35 });
  const ghost = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.96, cellSize * 0.96, cellSize * 0.96), ghostMat);
  ghost.visible = false;
  scene.add(ghost);

  // 玩家方塊集合
  const userGrid = makeEmptyGrid();
  const blockMat = new THREE.MeshPhongMaterial({ color: 0x6366F1, flatShading: true });
  const blockMeshes = {}; // key: 'x,y,z' → mesh

  function addBlock(x, y, z) {
    if (userGrid[x][y][z]) return;
    userGrid[x][y][z] = 1;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.96, cellSize * 0.96, cellSize * 0.96), blockMat);
    mesh.position.set(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, z * cellSize + cellSize / 2);
    scene.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0x1E1B4B }));
    edges.position.copy(mesh.position);
    scene.add(edges);
    blockMeshes[`${x},${y},${z}`] = { mesh, edges };
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    updateViews();
  }

  function removeBlock(x, y, z) {
    if (!userGrid[x][y][z]) return;
    userGrid[x][y][z] = 0;
    const obj = blockMeshes[`${x},${y},${z}`];
    if (obj) {
      scene.remove(obj.mesh);
      scene.remove(obj.edges);
      delete blockMeshes[`${x},${y},${z}`];
    }
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    updateViews();
  }

  // 按過「自動完成（放棄）」的題目就不再計分；按「清空」重新開始則恢復計分
  let gaveUp = false;
  function clearAll() {
    gaveUp = false;   // 清空＝重新開始；放棄後自己重新堆對仍可過關
    for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) for (let z = 0; z < GRID; z++) {
      if (userGrid[x][y][z]) removeBlock(x, y, z);
    }
  }

  function fillTarget() {
    clearAll();
    gaveUp = true;   // 要在 clearAll() 之後設，否則會被清掉
    for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) for (let z = 0; z < GRID; z++) {
      if (q.target[x][y][z]) addBlock(x, y, z);
    }
  }

  // 預先繪製目標三視圖
  drawSilhouette(document.getElementById(`stk-tgt-front-${qi}`), projectGrid(q.target, 'front'), '#16A34A');
  drawSilhouette(document.getElementById(`stk-tgt-side-${qi}`),  projectGrid(q.target, 'side'),  '#16A34A');
  drawSilhouette(document.getElementById(`stk-tgt-top-${qi}`),   projectGrid(q.target, 'top'),   '#16A34A');

  function updateViews() {
    const f = projectGrid(userGrid, 'front');
    const s = projectGrid(userGrid, 'side');
    const t = projectGrid(userGrid, 'top');
    const tf = projectGrid(q.target, 'front');
    const ts = projectGrid(q.target, 'side');
    const tt = projectGrid(q.target, 'top');
    drawSilhouette(document.getElementById(`stk-cur-front-${qi}`), f, '#6366F1', calcDiff(f, tf));
    drawSilhouette(document.getElementById(`stk-cur-side-${qi}`), s, '#6366F1', calcDiff(s, ts));
    drawSilhouette(document.getElementById(`stk-cur-top-${qi}`), t, '#6366F1', calcDiff(t, tt));
    // 比對：三個視圖平均匹配度
    const m = (calcMatch(f, tf) + calcMatch(s, ts) + calcMatch(t, tt)) / 3;
    const pct = Math.round(m * 100);
    document.getElementById(`stk-match-${qi}`).textContent = pct + '%';
    document.getElementById(`stk-bar-${qi}`).style.width = pct + '%';
    const statusEl = document.getElementById(`stk-status-${qi}`);
    if (pct === 100 && SLQ && !SLQ.has('r3q' + qi)) ortLog('r3q' + qi, !gaveUp);
    if (pct === 100 && gaveUp) {
      statusEl.textContent = '已自動完成（放棄，不計分）';
      statusEl.style.color = '#94A3B8';
    } else if (pct === 100) {
      statusEl.textContent = '🎉 完美匹配！過關！';
      statusEl.style.color = '#16A34A';
      markCorrect(3, qi);
    } else if (pct >= 70) {
      statusEl.textContent = '👍 接近了，調整看看';
      statusEl.style.color = '#FBBF24';
    } else {
      statusEl.textContent = '繼續堆方塊...';
      statusEl.style.color = '#94A3B8';
    }
  }

  // 點擊偵測：raycast 到 grid 平面或現有方塊
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getMouse(e) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  function pickCell(e) {
    getMouse(e);
    raycaster.setFromCamera(mouse, camera);
    // 先找現有方塊
    const blockObjs = Object.values(blockMeshes).map(b => b.mesh);
    const blockHits = raycaster.intersectObjects(blockObjs);
    if (blockHits.length) {
      const m = blockHits[0].object;
      const x = Math.floor(m.position.x / cellSize);
      const y = Math.floor(m.position.y / cellSize);
      const z = Math.floor(m.position.z / cellSize);
      const normal = blockHits[0].face.normal.clone();
      return { exist: true, x, y, z, normalX: Math.round(normal.x), normalY: Math.round(normal.y), normalZ: Math.round(normal.z) };
    }
    // 再找底面（floor）
    const floorHits = raycaster.intersectObject(floor);
    if (floorHits.length) {
      const p = floorHits[0].point;
      const x = Math.floor(p.x / cellSize);
      const z = Math.floor(p.z / cellSize);
      if (x < 0 || x >= GRID || z < 0 || z >= GRID) return null;
      return { exist: false, x, y: 0, z };
    }
    return null;
  }

  renderer.domElement.addEventListener('mousemove', e => {
    if (buildMode === 'del') { ghost.visible = false; return; }
    const hit = pickCell(e);
    if (!hit) { ghost.visible = false; return; }
    let x = hit.x, y = hit.y, z = hit.z;
    if (hit.exist) {
      // 在點擊面外側放新方塊
      x += hit.normalX; y += hit.normalY; z += hit.normalZ;
    }
    if (x < 0 || x >= GRID || y < 0 || y >= GRID || z < 0 || z >= GRID || userGrid[x][y][z]) {
      ghost.visible = false;
      return;
    }
    ghost.visible = true;
    ghost.position.set(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, z * cellSize + cellSize / 2);
  });

  // 指針點擊（滑鼠＋觸控通用）：用位移門檻區分「點一下」與「拖曳旋轉視角」。
  // 桌機保留左鍵加、右鍵刪；平板用 ➕/➖ 模式鈕切換後點擊。
  let buildMode = 'add';
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', e => {
    downAt = { x: e.clientX, y: e.clientY, button: e.button, t: performance.now() };
  });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    const isTap = moved < 8 && (performance.now() - downAt.t) < 600;
    const btn = downAt.button;
    downAt = null;
    if (!isTap) return; // 拖曳 → 交給 OrbitControls 旋轉
    const hit = pickCell(e);
    if (!hit) return;
    if (btn === 2 || buildMode === 'del') {
      if (hit.exist) removeBlock(hit.x, hit.y, hit.z);
    } else {
      let x = hit.x, y = hit.y, z = hit.z;
      if (hit.exist) { x += hit.normalX; y += hit.normalY; z += hit.normalZ; }
      if (x < 0 || x >= GRID || y < 0 || y >= GRID || z < 0 || z >= GRID) return;
      addBlock(x, y, z);
    }
  });
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

  // 工具列按鈕
  document.querySelector(`button[data-act="clear"][data-q="${qi}"]`).addEventListener('click', clearAll);
  document.querySelector(`button[data-act="hint"][data-q="${qi}"]`).addEventListener('click', fillTarget);
  const modeAddBtn = document.querySelector(`button[data-act="mode-add"][data-q="${qi}"]`);
  const modeDelBtn = document.querySelector(`button[data-act="mode-del"][data-q="${qi}"]`);
  function setBuildMode(m) {
    buildMode = m;
    modeAddBtn.classList.toggle('active', m === 'add');
    modeDelBtn.classList.toggle('active', m === 'del');
    if (m === 'del') ghost.visible = false; // 刪除模式不顯示放置預覽
  }
  modeAddBtn.addEventListener('click', () => setBuildMode('add'));
  modeDelBtn.addEventListener('click', () => setBuildMode('del'));

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
  updateViews(); // 初始化時也算一次（即使全空也要顯示目標）
}

// =============================================================
// Tab 切換 + 初始化
// =============================================================
function switchRound(r) {
  document.querySelectorAll('.round-tab').forEach(t => t.classList.toggle('active', t.dataset.r == r));
  document.querySelectorAll('.round-content').forEach(c => c.style.display = 'none');
  document.getElementById('round-' + r).style.display = 'block';
}
document.querySelectorAll('.round-tab').forEach(t => t.addEventListener('click', () => switchRound(t.dataset.r)));

state.total = ROUND1.length + ROUND2.length + ROUND3.length;
// 作答紀錄（js/sheet-log.js）：三回合合成一份（第 1、2 回合是看圖選擇題，答錯可再試，記第一次選的答案與嘗試次數；
// 第 3 回合堆方塊算遊戲題，完美匹配＝過關、按「自動完成（放棄）」＝未過關）。全部做完送一筆，中途離開也會送已做的部分
const ORT_VIEW_NAMES = { square: '正方形', rect: '長方形', circle: '圓形', triangle: '三角形', 'circle-dot': '圓形＋中心點',
  'l-shape': 'L 形', 't-shape': 'T 形', 'rect-tall': '直立長方形', 'rect-split': '長方形＋垂直分界線',
  'rect-tall-split': '直立長方形＋水平分界線', 'rect-circle-hole': '長方形＋圓孔',
  'square-dash-horiz': '正方形＋兩條水平虛線', 'rect-dash-vert': '長方形＋兩條垂直虛線' };
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'game', sendOnLeave: true, questions: [
  ...ROUND1.map((q, i) => ({ key: 'r1q' + i, t: 'single', stem: '看正視、右側視、俯視，這是什麼 3D 物件？（' + q.views.map(v => ORT_VIEW_NAMES[v] || v).join('／') + '）',
    options: q.options.map(o => SHAPES[o].label), answer: q.options.indexOf(q.ans) })),
  ...ROUND2.map((q, i) => ({ key: 'r2q' + i, t: 'single', stem: SHAPES[q.shape].label + ' 缺失的' + VIEW_KEY[q.missing] + '是哪一個？',
    options: q.options.map(o => ORT_VIEW_NAMES[o] || o), answer: q.options.indexOf(SHAPES[q.shape][q.missing]) })),
  ...ROUND3.map((q, i) => ({ key: 'r3q' + i, t: 'game', stem: '方塊堆疊：' + q.label + '（三視圖完全符合目標）' })),
] });
function ortLog(key, v) { if (!SLQ) return; SLQ.answer(key, v); if (SLQ.count() === state.total) SLQ.finish({ score: state.score, max: state.total }); }
document.getElementById('total').textContent = state.total;
buildRound1();
buildRound2();
buildRound3();
