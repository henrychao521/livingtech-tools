#!/usr/bin/env python3
"""依 git 差異自動提升 HTML 引用資產的 ?v= 版本號（快取破除）。

用法：
    python3 tools/bump_asset_versions.py [基準分支，預設 origin/main] [--dry-run]

做法：
1. 取「基準分支...HEAD」之間改過的 .js / .css / .glb（排除 tests/）。
2. 掃描所有受版控的 .html，找 src= / href= / data-src= 的相對路徑引用，
   解析成專案內路徑；若指向改過的資產，就改版本號。
3. 同一個資產在所有頁面統一成「目前最大版本 + 1」（沒有 ?v= 的視為 1）。
   data-src 只寫檔名的（例如 model-viewer 切換按鈕），以同頁 model-viewer 的資料夾解析。
"""
import os
import re
import subprocess
import sys
from collections import defaultdict

ROOT = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
BASE = args[0] if args else 'origin/main'
DRY = '--dry-run' in sys.argv

changed = subprocess.check_output(
    ['git', 'diff', '--name-only', f'{BASE}...HEAD'], cwd=ROOT, text=True).split()
changed = {p for p in changed
           if re.search(r'\.(js|css|glb)$', p) and '/tests/' not in p and os.path.exists(os.path.join(ROOT, p))}

html_files = subprocess.check_output(['git', 'ls-files', '*.html'], cwd=ROOT, text=True).split()
ATTR = re.compile(r'''\b(src|href|data-src)=(["'])([^"'#]+?)(?:\?v=(\d+))?\2''')


def resolve(html_rel, ref, attr, text):
    if re.match(r'^(https?:)?//|^data:|^mailto:', ref):
        return None
    base = os.path.dirname(html_rel)
    if attr == 'data-src' and '/' not in ref and ref.endswith('.glb'):
        m = re.search(r'<model-viewer[^>]*\bsrc="([^"?]+)/[^"/?]+\.glb', text)
        if m:
            base = os.path.join(base, m.group(1))
    return os.path.normpath(os.path.join(base, ref))


# 第一輪：收集每個改過資產目前的最大版本
refs = defaultdict(list)
maxver = defaultdict(lambda: 1)
for h in html_files:
    text = open(os.path.join(ROOT, h), encoding='utf-8').read()
    for m in ATTR.finditer(text):
        p = resolve(h, m.group(3), m.group(1), text)
        if p in changed:
            v = int(m.group(4)) if m.group(4) else 1
            maxver[p] = max(maxver[p], v)
            refs[p].append(h)

newver = {p: maxver[p] + 1 for p in refs}

# 第二輪：改寫
edited = 0
for h in html_files:
    path = os.path.join(ROOT, h)
    text = open(path, encoding='utf-8').read()

    def sub(m):
        p = resolve(h, m.group(3), m.group(1), text)
        if p not in newver:
            return m.group(0)
        q = m.group(2)
        return f'{m.group(1)}={q}{m.group(3)}?v={newver[p]}{q}'

    new = ATTR.sub(sub, text)
    if new != text:
        edited += 1
        if not DRY:
            open(path, 'w', encoding='utf-8').write(new)

for p in sorted(newver):
    print(f'{p}: v{maxver[p]} -> v{newver[p]}  ({len(refs[p])} 處引用)')
unref = sorted(changed - set(refs))
if unref:
    print('\n改過但沒有 HTML 直接引用（請人工確認是否經由其他方式載入）：')
    for p in unref:
        print('  ' + p)
print(f'\n{"（試跑）" if DRY else ""}改寫 HTML 檔數：{edited}')
