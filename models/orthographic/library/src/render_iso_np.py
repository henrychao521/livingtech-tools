# -*- coding: utf-8 -*-
"""等角圖（3D 縮圖）程式繪製：numpy z-buffer 正交投影＋Lambert 明暗，疊上物件庫算出的等角可見線（和三視圖同一個投影器）。
相機與 library.json 的 iso 視圖相同：從右前上方 (+x,-y,+z) 看。正面前方畫橘色箭頭＝正視方向。
輸出 <id>-iso.png（透明背景）與 <id>-iso.webp。用法：python3 render_iso_np.py [輸出資料夾]"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
import project as P
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else (os.path.dirname(HERE) if os.path.basename(HERE) == 'src' else os.path.join(HERE, 'out'))
W, H, SS = 480, 400, 3
V = P.VIEWS['iso']; r, w, t = (np.array(V[k], float) for k in ('r', 'w', 't'))
LIGHT = np.array([0.3, -0.9, 1.5]); LIGHT /= np.linalg.norm(LIGHT)
BASE = np.array([165, 180, 252]) / 255.0
lib = json.load(open(os.path.join(OUT, 'library.json')))
for oid in lib['order']:
    verts, faces = P.load_stl(os.path.join(OUT, oid + '.stl'))
    lo, hi = verts.min(0), verts.max(0)
    L = max(16.0, (hi[1] - lo[1]) * 0.5)
    ax, az = (lo[0] + hi[0]) / 2, lo[2] + (hi[2] - lo[2]) * 0.35
    a_tail = np.array([ax, lo[1] - 4 - L, az]); a_tip = np.array([ax, lo[1] - 3, az])
    pts = np.vstack([verts, a_tail, a_tip])
    U, Wv = pts @ r, pts @ w
    umin, umax, vmin, vmax = U.min(), U.max(), Wv.min(), Wv.max()
    s = min((W * 0.88) / (umax - umin), (H * 0.88) / (vmax - vmin)) * SS
    cx, cy = (umin + umax) / 2, (vmin + vmax) / 2
    X = lambda u: (u - cx) * s + W * SS / 2
    Y = lambda v: H * SS / 2 - (v - cy) * s
    Ws, Hs = W * SS, H * SS
    zbuf = np.full((Hs, Ws), np.inf); col = np.zeros((Hs, Ws, 4))
    tri = verts[faces]
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]); n /= np.linalg.norm(n, axis=1, keepdims=True)
    for k in np.nonzero(n @ t > 1e-6)[0]:
        T = tri[k]; px = X(T @ r); py = Y(T @ w); d = -(T @ t)
        x0, x1 = int(max(px.min(), 0)), int(min(px.max() + 1, Ws)); y0, y1 = int(max(py.min(), 0)), int(min(py.max() + 1, Hs))
        if x1 <= x0 or y1 <= y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        den = (py[1] - py[2]) * (px[0] - px[2]) + (px[2] - px[1]) * (py[0] - py[2])
        if abs(den) < 1e-12: continue
        l0 = ((py[1] - py[2]) * (gx - px[2]) + (px[2] - px[1]) * (gy - py[2])) / den
        l1 = ((py[2] - py[0]) * (gx - px[2]) + (px[0] - px[2]) * (gy - py[2])) / den
        l2 = 1 - l0 - l1
        inside = (l0 >= -1e-6) & (l1 >= -1e-6) & (l2 >= -1e-6)
        z = l0 * d[0] + l1 * d[1] + l2 * d[2]
        sub = zbuf[y0:y1, x0:x1]; upd = inside & (z < sub)
        sub[upd] = z[upd]
        shade = 0.55 + 0.45 * max(0.0, float(n[k] @ LIGHT))
        col[y0:y1, x0:x1][upd] = np.append(np.clip(BASE * shade, 0, 1), 1.0)
    img = Image.fromarray((col * 255).astype(np.uint8), 'RGBA')
    dr = ImageDraw.Draw(img)
    for pl in lib['objects'][oid]['views']['iso']['vis']:
        q = np.array(pl, float).reshape(-1, 2) / 10.0
        dr.line([(X(a), Y(b)) for a, b in q], fill=(30, 27, 75, 255), width=int(1.6 * SS), joint='curve')
    # 正視方向箭頭
    tx, ty = X(a_tail @ r), Y(a_tail @ w); hx, hy = X(a_tip @ r), Y(a_tip @ w)
    dvec = np.array([hx - tx, hy - ty]); dl = np.linalg.norm(dvec); dvec /= dl; nvec = np.array([-dvec[1], dvec[0]])
    head = 0.38 * dl; base = np.array([hx, hy]) - dvec * head
    dr.line([(tx, ty), tuple(base)], fill=(249, 115, 22, 255), width=int(3.2 * SS))
    dr.polygon([(hx, hy), tuple(base + nvec * head * 0.55), tuple(base - nvec * head * 0.55)], fill=(249, 115, 22, 255))
    img = img.resize((W, H), Image.LANCZOS)
    img.save(os.path.join(OUT, oid + '-iso.png'))
    img.save(os.path.join(OUT, oid + '-iso.webp'), 'WEBP', quality=82, method=6)
print('iso', len(lib['order']), '%.0f KB webp' % (sum(os.path.getsize(os.path.join(OUT, i + '-iso.webp')) for i in lib['order']) / 1024))
