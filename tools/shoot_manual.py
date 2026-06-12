#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""教師手冊截圖產生器 — 對本機伺服器逐頁截圖到 assets/manual/。

用法:
  python3 -m http.server 8732   # 先在 repo 根目錄起伺服器
  python3 tools/shoot_manual.py [base_url]

需求: pip 版 playwright（python3 -c "from playwright.sync_api import sync_playwright"）。
模擬類頁面會先按「開始」鈕，截到運轉中的畫面。
"""
import sys
import re
import pathlib
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8732').rstrip('/')
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'manual'
OUT.mkdir(parents=True, exist_ok=True)

SKIP_DIRS = {'css', 'js', 'vendor', 'models', 'scripts', 'assets', 'tools'}
TOOLS = sorted(d.name for d in ROOT.iterdir()
               if d.is_dir() and (d / 'index.html').exists() and d.name not in SKIP_DIRS)

pages = [('m-home', '/index.html')]
for t in TOOLS:
    pages.append((f'm-{t}', f'/{t}/index.html'))
    pdir = ROOT / t / 'pages'
    if pdir.exists():
        for f in sorted(pdir.glob('*.html')):
            pages.append((f'm-{t}-{f.stem}', f'/{t}/pages/{f.name}'))

# 模擬頁的「開始」鈕（按了才看得到運轉畫面）。
# 注意: breadboard 的 #btn-power 是「通電送出答案」,未修錯就按會跳失敗視窗,不要自動按。
START_IDS = ['#btn-start', '#start-btn', '#g-solve-btn']

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page(viewport={'width': 1250, 'height': 840})
    ok = 0
    for name, path in pages:
        try:
            pg.goto(BASE + path, wait_until='networkidle', timeout=20000)
        except Exception:
            pg.goto(BASE + path, wait_until='domcontentloaded', timeout=20000)
        pg.wait_for_timeout(1500)
        if re.search(r'module\d|wire-stripping', name) and 'breadboard-module4' not in name:
            for sid in START_IDS:
                try:
                    el = pg.query_selector(sid)
                    if el and el.is_visible():
                        el.click()
                        pg.wait_for_timeout(2400)
                        break
                except Exception:
                    pass
        pg.screenshot(path=str(OUT / f'{name}.jpg'), type='jpeg', quality=72)
        ok += 1
    browser.close()
print(f'{ok} 張截圖完成 → {OUT}')
