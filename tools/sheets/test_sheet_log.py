#!/usr/bin/env python3
"""作答紀錄端到端測試（只用本機假 endpoint，絕不連正式 Google 網址）。

  python3 tools/sheets/test_sheet_log.py

- 本機開兩個伺服器：網站（靜態檔）＋假 endpoint（記下收到的 POST 內容）
- sheet-config.js 由 Playwright 攔截改成指向假 endpoint（repo 裡的設定檔不動，仍是空字串）
- 外部網址全部擋掉
測項：endpoint 空時完全不送也不顯示；情境題＋護具遊戲題（線鋸機）、洗牌選項池換回原始順序＋班級座號（能源）、
排序題（麵包板）、是非題（三視圖）、離線佇列補送（機構）；每筆都對照 assets/sheet-items.json 的代號與指紋。
"""
import functools, http.server, json, re, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BANK = {q["q"]: q for q in json.loads((ROOT / "assets/sheet-items.json").read_text(encoding="utf-8"))["questions"]}
RECEIVED = []
FAILS = []


def check(cond, msg):
    print(("  ✓ " if cond else "  ✗ ") + msg)
    if not cond:
        FAILS.append(msg)


class Site(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class FakeEndpoint(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", 0))).decode("utf-8")
        RECEIVED.append({"ctype": self.headers.get("Content-Type"), "body": json.loads(body)})
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write("教學平台紀錄接收端運作中（平台：livingtech）".encode())


def start(handler):
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, f"http://127.0.0.1:{s.server_address[1]}"


def validate(rec, page, n_items):
    """SPEC 第 1 節格式＋題號／指紋對照題庫。"""
    b = rec["body"]
    check(rec["ctype"].startswith("text/plain"), f"{page}：Content-Type 是 text/plain")
    check(b["v"] == 1 and b["platform"] == "livingtech" and b["token"] == "", f"{page}：v／platform／token 正確")
    check(bool(re.fullmatch(r"[0-9a-f]{32}", b["sid"])), f"{page}：sid 是 32 碼小寫 16 進位")
    check(b["page"] == page, f"{page}：page＝{b['page']}")
    check(len(b["items"]) == n_items, f"{page}：{len(b['items'])} 題（預期 {n_items}）")
    for it in b["items"]:
        q = BANK.get(it["q"])
        if not q:
            check(False, f"{it['q']} 不在 sheet-items.json")
            continue
        if it["h"] != q["h"] or it["t"] != q["t"] or it["k"] != q["answer"]:
            check(False, f"{it['q']} 指紋／題型／正解和題庫不一致")
        if it["ok"] != (1 if it["a"] == it["k"] else 0) and it["t"] not in ("other",):
            check(False, f"{it['q']} ok 與 a／k 不一致（a={it['a']} k={it['k']} ok={it['ok']}）")
        if q["options"] and it["a"] not in q["options"]:
            check(False, f"{it['q']} 選項代號 {it['a']} 不在題庫選項裡")
    return b


def main():
    site, base = start(functools.partial(Site, directory=str(ROOT)))
    fake, endpoint = start(FakeEndpoint)
    cfg_on = f"window.SHEET_CONFIG = {{ platform: 'livingtech', endpoint: '{endpoint}/exec', token: '' }};"
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")

        def new_ctx(endpoint_on):
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            ctx.route("**/*", lambda r: r.continue_() if r.request.url.startswith((base, endpoint)) else r.abort())
            if endpoint_on:
                ctx.route(f"{base}/js/sheet-config.js*", lambda r: r.fulfill(
                    status=200, content_type="application/javascript", body=cfg_on))
            return ctx

        def open_page(ctx, rel):
            p = ctx.new_page()
            errs = []
            p.on("pageerror", lambda e: errs.append(str(e)))
            p.goto(f"{base}/{rel}", wait_until="load")
            p.wait_for_timeout(300)
            p._errs = errs
            return p

        def wait_received(p, n, ms=4000):
            # 用 page.wait_for_timeout 等（Playwright 的攔截規則要在它的事件迴圈裡才會放行請求，不能用 sleep）
            for _ in range(ms // 100):
                if len(RECEIVED) >= n:
                    return
                p.wait_for_timeout(100)

        # ── 1. endpoint 空字串：完全不送、不顯示 ──
        print("1. endpoint 空字串（repo 預設設定）")
        ctx = new_ctx(False)
        p = open_page(ctx, "mechanism/pages/module2.html")
        check(p.locator(".slw").count() == 0 and p.locator(".sl-notice").count() == 0, "不顯示班級座號小元件與告知文字")
        p.evaluate("() => document.querySelectorAll('#quiz .quiz-item').forEach(d => d.querySelector('.choice').click())")
        p.wait_for_timeout(800)
        check(len(RECEIVED) == 0, "作答完成後假 endpoint 沒收到任何資料")
        check(p.evaluate("() => localStorage.getItem('sheet-log-queue')") is None, "佇列沒有寫入")
        check(len(p.evaluate("() => SheetLog.bank()")) == 8, "題目仍照常登記（給 build_items.py）")
        check(not p._errs, "沒有 JS 錯誤")
        ctx.close()

        # ── 2. 線鋸機安全闖關：護具遊戲題＋7 題情境題，不填班級座號 ──
        print("2. 線鋸機模組 2（game＋scenario，不填班級座號）")
        ctx = new_ctx(True)
        p = open_page(ctx, "scrollsaw/pages/module2.html")
        check(p.locator(".slw-btn").count() == 1 and "選填" in p.locator(".slw-btn").inner_text(), "顯示「填班級座號（選填）」")
        check("各題對錯與所選答案會送給老師" in p.locator(".sl-notice").inner_text(), "頁尾顯示告知文字")
        p.evaluate("""() => {
          const drop = (id, acc) => { document.querySelector(`.draggable[data-id="${id}"]`).click();
                                      document.querySelector(`.dropzone[data-accept="${acc}"]`).click(); };
          drop('gloves', 'goggles');                      // 放錯一次（手套）→ 失誤 1
          ['goggles', 'hairtie', 'apron', 'closed-shoes'].forEach(id => drop(id, id));
        }""")
        p.wait_for_timeout(300)
        # 情境題：第 1 題故意選錯，其餘選正解
        p.evaluate("""() => SCENARIOS.forEach((s, i) => {
          const pick = i === 0 ? (s.correct === 'a' ? 'b' : 'a') : s.correct;
          document.querySelector(`.choice[data-q="${i}"][data-c="${pick}"]`).click(); })""")
        wait_received(p, 1)
        check(len(RECEIVED) == 1, "作答完成送出 1 筆")
        if RECEIVED:
            b = validate(RECEIVED[-1], "scrollsaw/module2", 8)
            check(b["class"] == "" and b["seat"] == "", "沒填班級座號時 class／seat 為空")
            ppe = b["items"][0]
            check(ppe["q"] == "scrollsaw.m2.ppe" and ppe["ok"] == 0 and ppe["a"] == "fail" and ppe.get("tries") == 2,
                  f"護具遊戲題：放錯一次 → ok=0、a=fail、tries=2（{ppe}）")
            s0 = b["items"][1]
            check(s0["ok"] == 0 and s0["a"] != s0["k"], f"情境題第 1 題選錯被記成錯（a={s0['a']} k={s0['k']}）")
            check(all(it["ok"] == 1 for it in b["items"][2:]), "其餘 6 題記為答對")
            check(b.get("meta", {}).get("max") == 100 and isinstance(b["meta"].get("sec"), int), f"meta：{b.get('meta')}")
        check(p.evaluate("() => localStorage.getItem('sheet-log-queue')") is None, "送達後佇列清空")
        check(not p._errs, "沒有 JS 錯誤")

        # ── 3. 能源模組 2：選項每題洗牌、只抽 4 個 → 代號換回原始 10 條轉換鏈順序；填班級座號 ──
        print("3. 能源模組 2（single，選項洗牌換回原始順序，填班級座號）")
        p = open_page(ctx, "energy/pages/module2.html")
        p.click(".slw-btn")
        p.fill(".slw-c", "８０１")         # 全形要轉半形
        p.fill(".slw-s", "１２")
        p.click(".slw-save")
        check("801 班 12 號" in p.locator(".slw-btn").inner_text(), "小元件顯示「801 班 12 號」")
        expect = p.evaluate("""() => {
          const out = [];
          document.querySelectorAll('#quiz .quiz-item').forEach((div, i) => {
            const btns = [...div.querySelectorAll('.choice')];
            const b = btns[btns.length - 1];                // 每題點畫面上最後一個選項
            out.push(String.fromCharCode(65 + allChoices.indexOf(b.dataset.c)));
            b.click();
          });
          return out; }""")
        wait_received(p, 2)
        if len(RECEIVED) >= 2:
            b = validate(RECEIVED[-1], "energy/module2", 10)
            got = [it["a"] for it in b["items"]]
            check(got == expect, f"選項代號＝原始順序（畫面點的 {expect[:4]}… ＝ 紀錄 {got[:4]}…）")
            check(b["class"] == "801" and b["seat"] == "12", f"班級座號只在填寫後帶入：{b['class']}／{b['seat']}")
        # 清除後就不帶
        p.click(".slw-btn"); p.click(".slw-clear"); p.click(".slw-close")
        check("選填" in p.locator(".slw-btn").inner_text(), "清除後回到「填班級座號（選填）」")
        check(p.evaluate("() => sessionStorage.getItem('sheet-log-who')") is None, "清除後 sessionStorage 已刪")

        # ── 4. 麵包板模組 3：共用排序拼圖（order），先交錯的、再排對 ──
        print("4. 麵包板模組 3（order，SequencePuzzle 共用元件）")
        p = open_page(ctx, "breadboard/pages/module3.html")
        first = p.evaluate("() => [...document.querySelectorAll('#seq-puzzle .sp-item')].map(li => +li.dataset.orig)")
        if first == sorted(first):   # 萬一洗出來剛好是正解，先交換前兩個
            p.click("#seq-puzzle .sp-item:nth-child(1) .sp-down")
            first = p.evaluate("() => [...document.querySelectorAll('#seq-puzzle .sp-item')].map(li => +li.dataset.orig)")
        p.click("#seq-puzzle .sp-check")                    # 第一次：錯
        p.wait_for_timeout(1700)
        # 用 ▲ 按鈕做泡沫排序排回正確順序
        for _ in range(60):
            order = p.evaluate("() => [...document.querySelectorAll('#seq-puzzle .sp-item')].map(li => +li.dataset.orig)")
            bad = next((i for i in range(1, len(order)) if order[i] < order[i - 1]), None)
            if bad is None:
                break
            p.click(f"#seq-puzzle .sp-item:nth-child({bad + 1}) .sp-up")
        p.click("#seq-puzzle .sp-check")                    # 第二次：對 → 送出
        n_before = len(RECEIVED)
        wait_received(p, n_before + 1)
        rec = [r for r in RECEIVED if r["body"]["page"] == "breadboard/module3"]
        check(len(rec) == 1, "排對時送出 1 筆")
        if rec:
            b = validate(rec[-1], "breadboard/module3", 1)
            it = b["items"][0]
            check(it["a"] == ">".join(str(i + 1) for i in first), f"a＝第一次檢查時的步驟序號（{it['a']}）")
            check(it["k"] == ">".join(str(i + 1) for i in range(len(first))) and it["ok"] == 0 and it.get("tries") == 2,
                  f"k＝正確序號、ok=0、tries=2（{it}）")
            check(b["class"] == "" and b["seat"] == "", "清除班級座號後不再帶入")

        # ── 5. 三視圖模組 3：是非題 ──
        print("5. 三視圖模組 3（tf）")
        p = open_page(ctx, "orthographic/pages/module3.html")
        p.evaluate("() => document.querySelectorAll('#dim-quiz .choice[data-v=\"true\"]').forEach(b => b.click())")
        p.wait_for_timeout(800)
        rec = [r for r in RECEIVED if r["body"]["page"] == "orthographic/module3" and r["body"]["items"][0]["t"] == "tf"]
        check(len(rec) == 1, "4 題答完送出 1 筆")
        if rec:
            b = validate(rec[-1], "orthographic/module3", 4)
            check([it["a"] for it in b["items"]] == ["正確"] * 4 and [it["ok"] for it in b["items"]] == [1, 0, 1, 1],
                  "a 全為「正確」，第 2 題（重複標註）記錯")
        check(not p._errs, "沒有 JS 錯誤")

        # ── 6. 離線佇列：送不出去時存在 localStorage，重新開頁補送 ──
        print("6. 機構模組 2（離線 → 佇列 → 下次開頁補送）")
        n0 = len(RECEIVED)
        ctx.route(f"{endpoint}/**", lambda r: r.abort("internetdisconnected"))
        p = open_page(ctx, "mechanism/pages/module2.html")
        p.evaluate("() => document.querySelectorAll('#quiz .quiz-item').forEach(d => d.querySelector('.choice').click())")
        p.wait_for_timeout(1000)
        q = p.evaluate("() => JSON.parse(localStorage.getItem('sheet-log-queue') || '[]')")
        check(len(q) == 1 and len(RECEIVED) == n0, f"送不出去：佇列留 {len(q)} 筆，endpoint 沒收到")
        ctx.unroute(f"{endpoint}/**")
        p2 = open_page(ctx, "index.html")                  # 開任何一頁（首頁沒有測驗）就會補送
        wait_received(p2, n0 + 1)
        check(len(RECEIVED) == n0 + 1, "重新開頁後補送成功")
        check(p2.evaluate("() => localStorage.getItem('sheet-log-queue')") is None, "補送後佇列清空")
        if len(RECEIVED) == n0 + 1:
            b = validate(RECEIVED[-1], "mechanism/module2", 8)
            check(b["sid"] == json.loads(q[0])["sid"], "補送的是同一筆（sid 相同）")
        check(p2.locator(".slw").count() == 0, "沒有測驗的頁面不顯示班級座號小元件")
        sids = [r["body"]["sid"] for r in RECEIVED]
        check(len(sids) == len(set(sids)), f"共收到 {len(sids)} 筆，sid 都不重複")
        ctx.close()
        browser.close()
    site.shutdown(); fake.shutdown()
    print(f"\n{'全部通過' if not FAILS else f'{len(FAILS)} 項失敗'}（假 endpoint 共收到 {len(RECEIVED)} 筆）")
    (Path(__file__).parent / "last_test_received.json").write_text(
        json.dumps([r["body"] for r in RECEIVED], ensure_ascii=False, indent=1), encoding="utf-8") if "--dump" in sys.argv else None
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    main()
