# -*- coding: utf-8 -*-
"""物件庫自動測試（python3 test_library.py）。

1. 獨立驗算：每個物件 6 個視圖的線條，和解析式射線區間算出的不連續處比對（verify_views.py），指標全部 ≥ 0.97。
2. 驗算器靈敏度（突變測試）：故意把正確線條改錯（虛線改實線、刪掉虛線、左右翻、上下翻、刪掉一條可見線），
   驗算器必須抓出來——證明第 1 項的「通過」不是因為驗算器太寬鬆。
3. 第三角法外框一致：俯視寬＝正視寬（長對正）、右側視高＝正視高（高平齊）、俯視深＝右側視寬（寬相等）。
4. 中心線：軸向對著觀察者的圓，十字中心線交點要落在某條圓形線（可見或隱藏）的圓心上。
"""
import json, os, sys, copy
import numpy as np
import objects as O
import os as _os
# 輸出位置：放在網站 repo 的 models/orthographic/library/src/ 時，輸出到上一層（library/）；在工作資料夾時輸出到 out/
_HERE = _os.path.dirname(_os.path.abspath(__file__))
OUTDIR = _os.environ.get('ORTHO_OUT') or (_os.path.dirname(_HERE) if _os.path.basename(_HERE) == 'src' else _os.path.join(_HERE, 'out'))
import verify_views as VV

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = json.load(open(os.path.join(OUTDIR, 'library.json')))
VIEWS6 = ('front', 'top', 'right', 'left', 'bottom', 'rear')
TH = 0.97
fails = []


def passed(m):
    return all(m[k] >= TH for k in ('vis_recall', 'vis_precision', 'hid_recall', 'hid_precision')) and m['extent_err'] <= 0.3


def mutate(v, kind):
    v = copy.deepcopy(v)
    b = v['box']
    if kind == 'hid2vis':
        v['vis'] += v['hid']; v['hid'] = []
    elif kind == 'nohid':
        v['hid'] = []
    elif kind in ('mirrorU', 'mirrorV'):
        i = 0 if kind == 'mirrorU' else 1
        c = b[i] + b[i + 2]
        for key in ('vis', 'hid', 'ctr'):
            for p in v[key]:
                for j in range(i, len(p), 2):
                    p[j] = c - p[j]
    elif kind == 'dropvis':
        # 刪掉最短的一條可見折線（通常是內部稜線）
        lens = [sum(np.hypot(np.diff(np.array(p[0::2])), np.diff(np.array(p[1::2])))) for p in v['vis']]
        v['vis'].pop(int(np.argmin(lens)))
    elif kind == 'vis2hid':
        lens = [sum(np.hypot(np.diff(np.array(p[0::2])), np.diff(np.array(p[1::2])))) for p in v['vis']]
        v['hid'].append(v['vis'].pop(int(np.argmin(lens))))
    return v


def raster_sig(v):
    """突變後若和原圖在 0.5 mm 格上完全一樣（例如對稱視圖左右翻），就不算有效突變。"""
    pts = []
    for key in ('vis', 'hid'):
        for p in v[key]:
            a = np.array(p, float).reshape(-1, 2)
            for (x1, y1), (x2, y2) in zip(a[:-1], a[1:]):
                n = max(2, int(np.hypot(x2 - x1, y2 - y1) / 2.5))
                for t in np.linspace(0, 1, n):
                    pts.append((key, round((x1 + (x2 - x1) * t) / 5), round((y1 + (y2 - y1) * t) / 5)))
    return frozenset(pts)


# ---- 1. 驗算 ----
print('== 1. 獨立驗算（解析射線區間 vs 網格投影）==')
worst = 1.0
nviews = 0
for o in O.LIB:
    r = VV.verify_object(o, LIB['objects'][o['id']])
    for vk, m in r.items():
        nviews += 1
        worst = min(worst, m['vis_recall'], m['vis_precision'], m['hid_recall'], m['hid_precision'])
        if not passed(m):
            fails.append('驗算未過 %s/%s %s' % (o['id'], vk, m))
print('  %d 個視圖，最差指標 %.4f' % (nviews, worst))

# ---- 2. 突變測試 ----
print('== 2. 驗算器靈敏度（突變測試）==')
tot = det = 0
missed = []
for o in O.LIB:
    rec = LIB['objects'][o['id']]
    for vk in VIEWS6:
        v = rec['views'][vk]
        base = raster_sig(v)
        kinds = ['mirrorU', 'mirrorV']
        if v['hid']:
            kinds += ['hid2vis', 'nohid']
        if len(v['vis']) > 1:
            kinds += ['dropvis', 'vis2hid']
        for k in kinds:
            mv = mutate(v, k)
            if raster_sig(mv) == base:
                continue  # 對稱視圖翻轉後一樣，不算
            rec2 = dict(rec, views=dict(rec['views'], **{vk: mv}))
            m = VV.verify_object(o, rec2, views=(vk,))[vk]
            tot += 1
            if passed(m):
                missed.append('%s/%s/%s' % (o['id'], vk, k))
            else:
                det += 1
print('  有效突變 %d 個，抓到 %d 個（%.1f%%）' % (tot, det, 100.0 * det / max(tot, 1)))
if missed:
    print('  沒抓到：', ', '.join(missed[:20]))
    fails.append('突變沒抓到 %d 個' % len(missed))

# ---- 3. 外框一致 ----
print('== 3. 第三角法外框一致（長對正、高平齊、寬相等）==')
bad = 0
for oid, rec in LIB['objects'].items():
    V = rec['views']
    W = lambda k: V[k]['box'][2] - V[k]['box'][0]
    H = lambda k: V[k]['box'][3] - V[k]['box'][1]
    checks = [W('front') == W('top') == W('bottom') == W('rear'), H('front') == H('right') == H('left') == H('rear'),
              H('top') == W('right') == W('left') == H('bottom')]
    if not all(checks):
        bad += 1; fails.append('外框不一致 ' + oid)
print('  %d 個物件，不一致 %d' % (len(LIB['objects']), bad))

# ---- 4. 中心線 ----
print('== 4. 圓的十字中心線落在圓心 ==')
nc = okc = 0
for oid, rec in LIB['objects'].items():
    for vk in VIEWS6:
        v = rec['views'][vk]
        crosses = []
        hs = [c for c in v['ctr'] if c[1] == c[3]]
        vs_ = [c for c in v['ctr'] if c[0] == c[2]]
        for h in hs:
            for vv in vs_:
                cx, cy = vv[0], h[1]
                if min(h[0], h[2]) < cx < max(h[0], h[2]) and min(vv[1], vv[3]) < cy < max(vv[1], vv[3]):
                    crosses.append((cx, cy))
        polys = [np.array(p, float).reshape(-1, 2) for p in v['vis'] + v['hid']]

        def on_arc(cx, cy):
            """交點是否為某條折線上一段圓弧的圓心：至少 8 個頂點與它等距（±0.2 mm）。"""
            for a in polys:
                if len(a) < 8:
                    continue
                d = np.round(np.hypot(a[:, 0] - cx, a[:, 1] - cy) / 2)
                vals, cnt = np.unique(d, return_counts=True)
                if cnt.max() >= 8 and vals[cnt.argmax()] > 0:
                    return True
            return False
        for cx, cy in crosses:
            nc += 1
            if on_arc(cx, cy):
                okc += 1
            else:
                fails.append('中心線交點不在圓心 %s/%s (%s,%s)' % (oid, vk, cx, cy))
print('  十字中心線 %d 個，落在圓心 %d 個' % (nc, okc))

print()
if fails:
    print('未通過：')
    for f in fails[:30]:
        print(' -', f)
    sys.exit(1)
print('全部通過')
