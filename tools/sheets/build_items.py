#!/usr/bin/env python3
"""產生 assets/sheet-items.json（給老師試算表「匯入最新題庫」用）。

做法：題目寫在各教具的 JS 裡（很多是組字串、洗牌、從資料陣列 map 出來的），靜態解析不穩；
所以用 Playwright 開本機伺服器上的每一頁，讀 js/sheet-log.js 在頁面載入時登記的題目（SheetLog.bank()）。
題目代號、指紋都是前端送出時用的同一份資料，不會有「題庫和作答紀錄對不起來」的問題。
另外用 Python 依 SPEC 第 2 節重算一次指紋（SHA-1 前 8 碼），和前端算的逐題比對，不一致就中止。

用法：python3 tools/sheets/build_items.py            （自動開 http.server，跑完關掉）
      python3 tools/sheets/build_items.py --check    （只比對、不寫檔；題庫和現有檔案不同時回傳 1）
外部網址一律擋掉，只放行載入函式庫的公開 CDN（ALLOW_CDN；三視圖模組 5 要 three.js 才跑得起來），不送任何資料。
"""
import datetime, functools, hashlib, http.server, json, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "sheet-items.json"
PLATFORM = "livingtech"
ALLOW_CDN = ("https://unpkg.com/", "https://cdn.jsdelivr.net/npm/", "https://cdnjs.cloudflare.com/")
# 題目要在點開分頁後才登記的頁面：頁面 → 依序要點的元素
EXTRA_CLICKS = {
    "sander/pages/module3.html": ['[data-tab="disc"]'],
}


def q_hash(q):
    """與 EMT build.py 的 q_hash 同法：type、stem、options、answer、items 的 JSON 做 SHA-1 取前 8 碼。"""
    opts = q["options"]
    core = {"type": q["t"], "stem": q["stem"],
            "options": [opts[k] for k in sorted(opts)] if opts else None,
            "answer": q["answer"], "items": q["items"] or None}
    return hashlib.sha1(json.dumps(core, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:8]


def pages():
    skip = {"vendor", ".git", "node_modules", "tools", "assets"}
    return sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*.html")
                  if not (set(p.relative_to(ROOT).parts) & skip))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def collect(base):
    found, errors = {}, []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")   # 用系統的 Chrome（本機沒裝 Playwright 自帶瀏覽器）
        ctx = browser.new_context()
        ok = (base,) + ALLOW_CDN
        ctx.route("**/*", lambda r: r.continue_() if r.request.url.startswith(ok) and r.request.method == "GET" or r.request.url.startswith(base) else r.abort())
        for rel in pages():
            page = ctx.new_page()
            page.on("pageerror", lambda e, rel=rel: errors.append(f"{rel}: {e}"))
            bank = None
            for attempt in range(3):   # 偶爾頁面還沒跑完 script 就被讀，重試
                page.goto(f"{base}/{rel}", wait_until="load", timeout=30000)
                page.wait_for_timeout(400 + attempt * 800)
                for sel in EXTRA_CLICKS.get(rel, []):
                    page.click(sel)
                    page.wait_for_timeout(200)
                bank = page.evaluate("() => window.SheetLog ? SheetLog.bank() : null")
                if bank is not None:
                    break
            if bank is None:
                errors.append(f"{rel}: 沒有載入 sheet-log.js")
            for q in bank or []:
                if q["q"] in found and found[q["q"]] != q:
                    errors.append(f"{rel}: 題目代號 {q['q']} 在不同頁面內容不同")
                found.setdefault(q["q"], q)
            page.close()
        browser.close()
    return list(found.values()), errors


def main():
    check = "--check" in sys.argv
    httpd = serve()
    try:
        items, errors = collect(f"http://127.0.0.1:{httpd.server_address[1]}")
    finally:
        httpd.shutdown()
    bad = [q["q"] for q in items if q_hash(q) != q["h"]]
    if bad:
        errors.append("前端指紋與 Python 重算不一致：" + ", ".join(bad[:10]))
    if errors:
        print("\n".join(errors), file=sys.stderr)
        sys.exit(2)
    items.sort(key=lambda q: (q["page"], q["q"]))
    for q in items:
        q["options"] = q["options"] or {}
        q["items"] = q["items"] or []
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if check:
        same = old.get("questions") == items
        print(f"{len(items)} 題；{'與現有檔案相同' if same else '和現有檔案不同，請重新產生'}")
        sys.exit(0 if same else 1)
    version = old.get("version") if old.get("questions") == items else datetime.date.today().isoformat()
    data = {"platform": PLATFORM, "version": version, "count": len(items), "questions": items}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    by_t = {}
    for q in items:
        by_t[q["t"]] = by_t.get(q["t"], 0) + 1
    print(f"寫入 {OUT.relative_to(ROOT)}：{len(items)} 題，{len({q['page'] for q in items})} 頁；題型 {by_t}")


if __name__ == "__main__":
    main()
