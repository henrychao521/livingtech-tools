# -*- coding: utf-8 -*-
"""Blender 渲染的 <id>-iso.png → <id>-iso.webp（網頁用，品質 82）。用法：python3 iso_webp.py [輸出資料夾]"""
import glob, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else (os.path.dirname(HERE) if os.path.basename(HERE) == 'src' else os.path.join(HERE, 'out'))
tot = 0
for f in sorted(glob.glob(os.path.join(OUT, '*-iso.png'))):
    im = Image.open(f)
    w = f[:-4] + '.webp'
    im.save(w, 'WEBP', quality=82, method=6)
    tot += os.path.getsize(w)
print('webp', len(glob.glob(os.path.join(OUT, '*-iso.webp'))), '%.0f KB' % (tot / 1024))
