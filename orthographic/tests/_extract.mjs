// 從 module5.js 抽出純邏輯宣告（不載入 three.js、不碰 DOM），放進 vm 執行，供 node 測試使用。
// 依名稱找「行首的 const NAME / function NAME」，用括號配對抓到宣告結尾。
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MODULE5 = process.env.ORTHO_MODULE5 || path.join(HERE, '..', 'js', 'module5.js');

// 抓到宣告開頭後逐行延長，直到 vm 能編譯為止——不必自寫 parser，樣板字串也不怕。
function grabSafe(src, name) {
  const re = new RegExp(`^(const|let|function)\\s+${name}\\b`, 'm');
  const m = re.exec(src);
  if (!m) throw new Error(`module5.js 找不到宣告：${name}`);
  const lines = src.slice(m.index).split('\n');
  let acc = '';
  for (let k = 0; k < lines.length; k++) {
    acc += lines[k] + '\n';
    try { new vm.Script(acc); return acc; } catch { /* 還沒結束 */ }
  }
  throw new Error(`宣告未結束：${name}`);
}

// 2026-10-27：第 1、2 回合改用物件庫（ortho-bank.js、ortho-views.js），由 library.test.mjs 測；這裡只抽第 3 回合的純邏輯
const GRAB = ['GRID', 'makeEmptyGrid', 'projectGrid', 'calcMatch', 'calcDiff', 'ROUND3'];
export const NAMES = ['GRID', 'makeEmptyGrid', 'projectGrid', 'calcMatch', 'calcDiff', 'ROUND3'];

export function load(extra = []) {
  const src = fs.readFileSync(MODULE5, 'utf8');
  const seen = new Set();
  const parts = [];
  for (const n of [...GRAB, ...extra]) {
    const code = grabSafe(src, n);
    if (!seen.has(code)) { seen.add(code); parts.push(code); }
  }
  // 函式宣告會提升；const 依序宣告，ROUND3 用到的 makeEmptyGrid 是函式，沒問題
  const body = parts.join('\n') + '\nthis.__out = { ' + [...NAMES, ...extra].join(', ') + ' };';
  const ctx = { Array, Math, Object, JSON, Set };
  vm.createContext(ctx);
  vm.runInContext(body, ctx, { filename: 'module5-pure.js' });
  return ctx.__out;
}
