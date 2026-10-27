// 不開瀏覽器的頁面冒煙測試（jsdom）：載入頁面、依序執行本地 script、再跑情境檢查，收集錯誤。
// 用法：JSDOM_FROM=/Volumes/Work/_tmp_node/ node <工具>/tests/smoke.mjs <網站根> <頁面相對路徑> [情境檔.mjs]
// 情境檔 export default async (window, assert) => {...}
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url'; import vm from 'node:vm'; import assert from 'node:assert';
const require = createRequire(process.env.JSDOM_FROM ? path.join(process.env.JSDOM_FROM, 'x.js') : import.meta.url);
const { JSDOM, VirtualConsole } = require('jsdom');
const [root, rel, scen] = process.argv.slice(2);
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { const m = (e.stack || e.message).split('\n')[0]; if (!/Could not parse CSS|Not implemented: (HTMLMediaElement|window\.scrollTo)/.test(m)) errors.push('jsdom: ' + m); });
vc.on('error', (...a) => errors.push('console.error: ' + a.map(String).join(' ').slice(0, 200)));
const html = fs.readFileSync(path.join(root, rel), 'utf8');
const url = 'http://localhost/' + rel;
const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;
let raf = 0;
w.requestAnimationFrame = cb => { raf++; setTimeout(() => cb(raf * 16), 16); return raf; };
w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
const calls = [];
w.HTMLCanvasElement.prototype.getContext = function () {
  return new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop() {} }) : (typeof k === 'string' && /^(fillStyle|strokeStyle|lineWidth|font|lineCap|lineJoin|globalAlpha|textAlign|textBaseline)$/.test(k) ? '' : (...a) => { calls.push([k, a]); }), set: () => true });
};
w.__canvasCalls = calls;
w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
w.showToast = () => {}; w.SoundFX = new Proxy({}, { get: () => () => {} });
w.onerror = (m) => { errors.push('onerror: ' + m); };
const ctx = dom.getInternalVMContext();
function run(code, name) { try { vm.runInContext(code, ctx, { filename: name }); } catch (e) { errors.push(name + ': ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
for (const s of [...w.document.querySelectorAll('script')]) {
  const src = s.getAttribute('src');
  if (!src) { if (s.type !== 'module' && !/gtag|dataLayer/.test(s.textContent)) run(s.textContent, rel + '#inline'); continue; }
  if (/^https?:/.test(src)) continue;
  const p = path.join(path.dirname(path.join(root, rel)), src.split('?')[0]);
  if (!fs.existsSync(p)) { errors.push('找不到 script ' + src); continue; }
  run(fs.readFileSync(p, 'utf8'), src);
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
await new Promise(r => setTimeout(r, 300));
if (scen) {
  try { await (await import(pathToFileURL(path.resolve(scen)).href)).default(w, assert); }
  catch (e) { errors.push('情境: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
}
// 圖片路徑都要存在（相對路徑）
for (const img of [...w.document.querySelectorAll('img[src]')]) {
  const src = img.getAttribute('src');
  if (/^(https?:|data:)/.test(src) || img.dataset.optional === '1') continue;
  const p = path.join(path.dirname(path.join(root, rel)), src.split('?')[0]);
  if (!fs.existsSync(p)) errors.push('圖片不存在 ' + src);
}
if (errors.length) { console.log('✗ ' + rel + '\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('✓ ' + rel);
process.exit(0);
