# -*- coding: utf-8 -*-
"""獨立驗算：不用網格、不用投影器，直接由物件的解析定義（凸基本體＋聯集／差集）算射線區間，
得到每個像素沿視線的「進入／離開實體」深度，再從深度圖找出應該有線的位置，和 library.json 的線條比對。

  可見線應在：第一層深度的不連續處（有／無實體交界、深度跳動、面的折線）
  隱藏線應在：任一層的不連續處，但不在可見線上
指標（每個視圖）：
  vis_recall    應有可見線的像素，有被畫出的可見線覆蓋的比例
  vis_precision 畫出的可見線像素，落在應有可見線處的比例
  hid_recall    應有隱藏線的像素，有被畫出的隱藏線（或可見線，可見優先）覆蓋的比例
  hid_precision 畫出的隱藏線像素，落在「任一層不連續且非可見線」處的比例
用法：python3 verify_views.py [out/library.json]   → 印出表格並寫 out/verify_report.json
"""
import json, os, sys
import numpy as np
import objects as O
import os as _os
# 輸出位置：放在網站 repo 的 models/orthographic/library/src/ 時，輸出到上一層（library/）；在工作資料夾時輸出到 out/
_HERE = _os.path.dirname(_os.path.abspath(__file__))
OUTDIR = _os.environ.get('ORTHO_OUT') or (_os.path.dirname(_HERE) if _os.path.basename(_HERE) == 'src' else _os.path.join(_HERE, 'out'))

PX = 0.25          # 像素大小 mm
SHIFT = 0.0371     # 像素中心刻意偏移，避免射線剛好貼著面
# 視圖：射線方向的座標軸、朝觀察者的正負號、畫面 u、v 對應的 (座標軸, 正負)
VIEW_AX = {
    'front':  dict(k=1, toward=-1, u=(0, 1), v=(2, 1)),
    'rear':   dict(k=1, toward=+1, u=(0, -1), v=(2, 1)),
    'top':    dict(k=2, toward=+1, u=(0, 1), v=(1, 1)),
    'bottom': dict(k=2, toward=-1, u=(0, 1), v=(1, -1)),
    'right':  dict(k=0, toward=+1, u=(1, 1), v=(2, 1)),
    'left':   dict(k=0, toward=-1, u=(1, -1), v=(2, 1)),
}


def prim_interval(p, k, X):
    """X：R×3 射線上的點（第 k 座標不用）。回傳沿第 k 軸的 (lo, hi)，空的為 NaN。"""
    R = len(X)
    lo = np.full(R, np.nan); hi = np.full(R, np.nan)
    if p.kind == 'box':
        ok = np.ones(R, bool)
        for a in range(3):
            if a != k:
                ok &= (X[:, a] > p.lo[a]) & (X[:, a] < p.hi[a])
        lo[ok], hi[ok] = p.lo[k], p.hi[k]
        return lo, hi
    ai = O.AX[p.axis]
    oth = [a for a in range(3) if a != ai]
    if p.kind == 'cyl':
        if k == ai:
            d2 = (X[:, oth[0]] - p.c[0]) ** 2 + (X[:, oth[1]] - p.c[1]) ** 2
            ok = d2 < p.r ** 2
            lo[ok], hi[ok] = p.a0, p.a1
        else:
            m = [a for a in oth if a != k][0]
            cm = p.c[oth.index(m)]; ck = p.c[oth.index(k)]
            ok = (X[:, ai] > p.a0) & (X[:, ai] < p.a1) & (np.abs(X[:, m] - cm) < p.r)
            h = np.sqrt(np.clip(p.r ** 2 - (X[:, m] - cm) ** 2, 0, None))
            lo[ok], hi[ok] = ck - h[ok], ck + h[ok]
        return lo, hi
    # prism：凸多邊形
    poly = np.array(p.poly, float)
    area = 0.5 * np.sum(poly[:, 0] * np.roll(poly[:, 1], -1) - np.roll(poly[:, 0], -1) * poly[:, 1])
    if area < 0:
        poly = poly[::-1]
    nxt = np.roll(poly, -1, axis=0)
    # 半平面：對每條邊，內側滿足 cross(e, p - a) >= 0
    if k == ai:
        P2 = X[:, oth]
        ok = np.ones(R, bool)
        for a, b in zip(poly, nxt):
            e = b - a
            ok &= (e[0] * (P2[:, 1] - a[1]) - e[1] * (P2[:, 0] - a[0])) > 0
        lo[ok], hi[ok] = p.a0, p.a1
        return lo, hi
    m = [a for a in oth if a != k][0]
    ik, im = oth.index(k), oth.index(m)
    ok = (X[:, ai] > p.a0) & (X[:, ai] < p.a1)
    tlo = np.full(R, -np.inf); thi = np.full(R, np.inf)
    for a, b in zip(poly, nxt):
        e = b - a
        # 點 q：q[ik]=s（沿射線）、q[im]=X[:, m]；cross = e[0]*(q1-a1) - e[1]*(q0-a0) >= 0
        # 寫成 A*s + B >= 0
        if ik == 0:
            A = -e[1]; B = e[0] * (X[:, m] - a[1]) + e[1] * a[0]
        else:
            A = e[0]; B = -e[0] * a[1] - e[1] * (X[:, m] - a[0])
        if abs(A) < 1e-12:
            ok &= B > 0
        elif A > 0:
            tlo = np.maximum(tlo, -B / A)
        else:
            thi = np.minimum(thi, -B / A)
    ok &= thi > tlo
    lo[ok], hi[ok] = tlo[ok], thi[ok]
    return lo, hi


def ray_boundaries(solid, view, lo3, hi3):
    """回傳 (U, Vv, B)：B 為 (nv, nu, M) 的深度（由近到遠，NaN 補齊）。"""
    A = VIEW_AX[view]
    k = A['k']
    (au, su), (av, sv) = A['u'], A['v']
    umin, umax = sorted([su * lo3[au], su * hi3[au]])
    vmin, vmax = sorted([sv * lo3[av], sv * hi3[av]])
    pad = 2.0
    us = np.arange(umin - pad, umax + pad, PX) + SHIFT
    vs = np.arange(vmin - pad, vmax + pad, PX) + SHIFT
    UU, VV = np.meshgrid(us, vs)
    R = UU.size
    X = np.zeros((R, 3))
    X[:, au] = su * UU.ravel()
    X[:, av] = sv * VV.ravel()
    prims = solid.add + solid.cut
    los, his = [], []
    for p in prims:
        l, h = prim_interval(p, k, X)
        los.append(l); his.append(h)
    los = np.stack(los, 1); his = np.stack(his, 1)
    cand = np.concatenate([los, his], 1)
    cand = np.sort(np.where(np.isnan(cand), np.inf, cand), 1)
    mids = (cand[:, :-1] + cand[:, 1:]) / 2
    nadd = len(solid.add)
    inside_add = np.zeros(mids.shape, bool)
    inside_cut = np.zeros(mids.shape, bool)
    for i in range(len(prims)):
        inn = (mids > los[:, i:i + 1]) & (mids < his[:, i:i + 1])
        inn &= ~np.isnan(los[:, i:i + 1])
        if i < nadd:
            inside_add |= inn
        else:
            inside_cut |= inn
    inside = inside_add & ~inside_cut
    inside = np.where(np.isfinite(mids), inside, False)
    # 邊界：inside 改變處
    padded = np.concatenate([np.zeros((R, 1), bool), inside, np.zeros((R, 1), bool)], 1)
    change = padded[:, 1:] != padded[:, :-1]      # 對應 cand 的每個值
    bvals = np.where(change, cand, np.nan)
    # 深度＝朝觀察者的反方向：toward=+1 時深度 = -座標
    depth = -A['toward'] * bvals
    depth = np.sort(np.where(np.isnan(depth), np.inf, depth), 1)
    M = int(np.isfinite(depth).sum(1).max())
    depth = depth[:, :max(M, 1)]
    depth[~np.isfinite(depth)] = np.nan
    return us, vs, depth.reshape(len(vs), len(us), -1)


def _is_jump(d, axis):
    """相鄰像素深度差 d（沿 axis 的成對差）。是「跳動」的條件：大於 3 像素，且大於前後一對差值較小者的 3 倍
    （平面上的台階：前後差值≈0；曲面靠近輪廓處很陡但前後差值相近，不算跳動）。"""
    big = np.nan_to_num(d, nan=np.inf)
    if axis == 0:
        prev = np.vstack([np.full((1, d.shape[1]), np.inf), big[:-1]])
        nxt = np.vstack([big[1:], np.full((1, d.shape[1]), np.inf)])
    else:
        prev = np.hstack([np.full((d.shape[0], 1), np.inf), big[:, :-1]])
        nxt = np.hstack([big[:, 1:], np.full((d.shape[0], 1), np.inf)])
    return (d > 3 * PX) & (d > 3 * np.minimum(prev, nxt))


def disc_flags(B, layer=None):
    """B：(nv, nu, M)。回傳旗標（nv, nu）。layer=0 只看第一層；None 看所有層。"""
    nv, nu, M = B.shape
    cnt = np.sum(np.isfinite(B), 2)
    flags = np.zeros((nv, nu), bool)
    jump = 3 * PX
    layers = [0] if layer == 0 else range(M)
    for axis in (0, 1):
        sl_a = (slice(None, -1), slice(None)) if axis == 0 else (slice(None), slice(None, -1))
        sl_b = (slice(1, None), slice(None)) if axis == 0 else (slice(None), slice(1, None))
        if layer == 0:
            ea = cnt[sl_a] > 0; eb = cnt[sl_b] > 0
            f = ea != eb
            both = ea & eb
            d = np.abs(B[sl_a][..., 0] - B[sl_b][..., 0])
            f |= both & _is_jump(d, axis)
        else:
            f = cnt[sl_a] != cnt[sl_b]
            same = ~f
            for L in layers:
                a, b = B[sl_a][..., L], B[sl_b][..., L]
                ok = same & np.isfinite(a) & np.isfinite(b)
                f |= ok & _is_jump(np.abs(a - b), axis)
        flags[sl_a] |= f
        flags[sl_b] |= f
        # 折線：二階差分大、但兩側 2 格外都平直（排除曲面）
        for L in layers:
            D = B[..., L]
            if axis == 0:
                d2 = D[2:, :] - 2 * D[1:-1, :] + D[:-2, :]
            else:
                d2 = D[:, 2:] - 2 * D[:, 1:-1] + D[:, :-2]
            if layer is None:
                cs = cnt[1:-1, :] if axis == 0 else cnt[:, 1:-1]
                c0 = cnt[:-2, :] if axis == 0 else cnt[:, :-2]
                c2 = cnt[2:, :] if axis == 0 else cnt[:, 2:]
                d2 = np.where((cs == c0) & (cs == c2), d2, 0)
            a2 = np.abs(np.nan_to_num(d2, nan=0.0))
            big = (a2 > 0.25 * PX) & (a2 < jump)
            flat = a2 < 0.05 * PX
            # 兩側相隔 2 格處要平直
            if axis == 0:
                fl = np.zeros_like(big)
                fl[2:-2, :] = big[2:-2, :] & flat[:-4, :] & flat[4:, :]
                flags[1:-1, :] |= fl
            else:
                fl = np.zeros_like(big)
                fl[:, 2:-2] = big[:, 2:-2] & flat[:, :-4] & flat[:, 4:]
                flags[:, 1:-1] |= fl
    return flags


def raster_lines(polys, us, vs, radius=0.75 * PX):
    """把折線（0.1 mm 整數，攤平）畫到像素格：像素中心距線段 ≤ radius 即標記。"""
    mask = np.zeros((len(vs), len(us)), bool)
    u0, v0 = us[0], vs[0]
    for pl in polys:
        pts = np.array(pl, float).reshape(-1, 2) / 10.0
        for (x1, y1), (x2, y2) in zip(pts[:-1], pts[1:]):
            i0 = max(int((min(x1, x2) - radius - u0) / PX) - 1, 0)
            i1 = min(int((max(x1, x2) + radius - u0) / PX) + 2, len(us))
            j0 = max(int((min(y1, y2) - radius - v0) / PX) - 1, 0)
            j1 = min(int((max(y1, y2) + radius - v0) / PX) + 2, len(vs))
            if i1 <= i0 or j1 <= j0:
                continue
            gu, gv = np.meshgrid(us[i0:i1], vs[j0:j1])
            dx, dy = x2 - x1, y2 - y1
            L2 = dx * dx + dy * dy
            t = np.clip(((gu - x1) * dx + (gv - y1) * dy) / L2, 0, 1) if L2 > 0 else 0
            d = np.hypot(gu - (x1 + t * dx), gv - (y1 + t * dy))
            mask[j0:j1, i0:i1] |= d <= radius
    return mask


def dilate(m, r=1):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out


def ratio(a, b):
    return 1.0 if a == 0 and b == 0 else (a / b if b else 0.0)


def verify_object(o, rec, views=('front', 'top', 'right', 'left', 'bottom', 'rear')):
    solid = o['solid']
    # 解析外框：由加的基本體估（只用來決定像素範圍）
    lo3 = np.array([1e9] * 3); hi3 = np.array([-1e9] * 3)
    for p in solid.add:
        if p.kind == 'box':
            lo3 = np.minimum(lo3, p.lo); hi3 = np.maximum(hi3, p.hi)
        else:
            ai = O.AX[p.axis]; oth = [a for a in range(3) if a != ai]
            if p.kind == 'cyl':
                for j, a in enumerate(oth):
                    lo3[a] = min(lo3[a], p.c[j] - p.r); hi3[a] = max(hi3[a], p.c[j] + p.r)
            else:
                pts = np.array(p.poly)
                for j, a in enumerate(oth):
                    lo3[a] = min(lo3[a], pts[:, j].min()); hi3[a] = max(hi3[a], pts[:, j].max())
            lo3[ai] = min(lo3[ai], p.a0); hi3[ai] = max(hi3[ai], p.a1)
    res = {}
    for vk in views:
        us, vs, B = ray_boundaries(solid, vk, lo3, hi3)
        vis_exp = disc_flags(B, 0)
        all_exp = disc_flags(B, None) | vis_exp
        hid_exp = all_exp & ~dilate(vis_exp, 2)
        V = rec['views'][vk]
        dv = raster_lines(V['vis'], us, vs)
        dh = raster_lines(V['hid'], us, vs)
        r = dict(
            vis_recall=ratio((vis_exp & dilate(dv, 1)).sum(), vis_exp.sum()),
            vis_precision=ratio((dv & dilate(vis_exp, 1)).sum(), dv.sum()),
            hid_recall=ratio((hid_exp & dilate(dv | dh, 1)).sum(), hid_exp.sum()),
            hid_precision=ratio((dh & dilate(all_exp, 1)).sum(), dh.sum()),
            hid_px=int(dh.sum()), hid_exp_px=int(hid_exp.sum()),
        )
        # 外框：畫出的線條範圍要等於實體投影範圍（±0.2 mm）
        filled = np.isfinite(B[..., 0])
        jj, ii = np.nonzero(filled)
        ext = [us[ii.min()], vs[jj.min()], us[ii.max()], vs[jj.max()]]
        allpts = np.concatenate([np.array(pl, float).reshape(-1, 2) for pl in V['vis']]) / 10.0
        dext = [allpts[:, 0].min(), allpts[:, 1].min(), allpts[:, 0].max(), allpts[:, 1].max()]
        r['extent_err'] = float(max(abs(a - b) for a, b in zip(ext, dext)))
        res[vk] = {k: (round(float(v), 4) if isinstance(v, float) else v) for k, v in r.items()}
    return res


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUTDIR, 'library.json')
    lib = json.load(open(path))
    report = {}
    worst = dict(vis_recall=1, vis_precision=1, hid_recall=1, hid_precision=1, extent_err=0)
    for o in O.LIB:
        if o['id'] not in lib['objects']:
            continue
        r = verify_object(o, lib['objects'][o['id']])
        report[o['id']] = r
        for vk, m in r.items():
            flag = ''
            for key in ('vis_recall', 'vis_precision', 'hid_recall', 'hid_precision'):
                worst[key] = min(worst[key], m[key])
                if m[key] < 0.97:
                    flag += ' <' + key
            worst['extent_err'] = max(worst['extent_err'], m['extent_err'])
            if m['extent_err'] > 0.3:
                flag += ' <extent'
            print('%-10s %-6s 可見 召回%.3f 精確%.3f｜隱藏 召回%.3f 精確%.3f（%d/%d px）外框誤差 %.2f%s' % (
                o['id'], vk, m['vis_recall'], m['vis_precision'], m['hid_recall'], m['hid_precision'],
                m['hid_px'], m['hid_exp_px'], m['extent_err'], flag))
    report['_worst'] = worst
    json.dump(report, open(os.path.join(OUTDIR, 'verify_report.json'), 'w'), ensure_ascii=False, indent=1)
    print('最差值：', worst)
    ok = all(worst[k] >= 0.97 for k in ('vis_recall', 'vis_precision', 'hid_recall', 'hid_precision')) and worst['extent_err'] <= 0.3
    print('結果：', '通過' if ok else '未通過')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
