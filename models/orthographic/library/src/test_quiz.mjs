// 命令列：node test_quiz.mjs <library-data.js> <ortho-views.js> <題庫.js...>
// 題庫裡所有 ORTHO_QUIZ*／ORTHO_BANK* 開頭的全域變數都會檢查；檔名含 neg 的題庫是反向測試（必須全部被抓出來）。
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
import { checkBank } from './quizcheck.mjs';
const [libFile, ovFile, ...bankFiles] = process.argv.slice(2);
let bad = 0, total = 0;
for (const bf of bankFiles) {
  const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  for (const f of [libFile, ovFile, bf]) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
  const neg = /neg/.test(path.basename(bf));
  for (const [k, v] of Object.entries(ctx)) {
    if (!/^ORTHO_(QUIZ|BANK)/.test(k)) continue;
    const banks = Array.isArray(v) ? { [k]: v } : Object.fromEntries(Object.entries(v).filter(([, b]) => Array.isArray(b)).map(([s, b]) => [k + '.' + s, b]));
    for (const [name, bank] of Object.entries(banks)) {
      if (neg) {
        // 反向測試：每一題都必須至少有一個錯誤被抓到
        bank.forEach((q, i) => { total++; const f = checkBank(ctx.OrthoViews, name + '#' + (i + 1), [q], () => {}); if (!f.length) { bad++; console.log('  ✗ 反向測試沒抓到', name, i + 1); } });
        console.log(`== ${name}（反向測試）：${bank.length} 題全部要被抓出來 ==`);
      } else {
        total += bank.length;
        bad += checkBank(ctx.OrthoViews, name, bank).length;
      }
    }
  }
}
console.log(`\n檢查 ${total} 題，${bad ? '未通過 ' + bad + ' 項' : '全部通過'}`);
process.exit(bad ? 1 : 0);
