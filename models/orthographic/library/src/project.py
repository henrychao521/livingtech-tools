# -*- coding: utf-8 -*-
"""網格 → 正投影線圖（可見線／隱藏線／中心線）。

只用 STL 網格（OpenSCAD 產生）計算，不讀物件的解析定義——驗算由 verify_views.py 用另一種方法做。
步驟：
  1. 合併頂點、建邊→面對照表、算面法向量
  2. 依視向挑邊：稜線（兩面夾角 > 20°）＋輪廓邊（一面朝向觀察者、另一面背向）
  3. 投影到畫面座標 (u 右, v 上)，每條邊在與其他邊的交點、端點處切段
  4. 每小段取 3D 中點，朝觀察者發射線，打到任何三角形＝被遮住（隱藏線），否則可見
  5. 依所在直線分組做區間聯集；隱藏線扣掉與可見線重疊的部分（可見線優先）
"""
import numpy as np

# 視圖：畫面右方 r、上方 w、朝觀察者 t（r × w = t）
VIEWS = {
    'front':  dict(r=(1, 0, 0),  w=(0, 0, 1),  name='正視圖'),
    'top':    dict(r=(1, 0, 0),  w=(0, 1, 0),  name='俯視圖'),
    'right':  dict(r=(0, 1, 0),  w=(0, 0, 1),  name='右側視圖'),
    'left':   dict(r=(0, -1, 0), w=(0, 0, 1),  name='左側視圖'),
    'bottom': dict(r=(1, 0, 0),  w=(0, -1, 0), name='仰視圖'),
    'rear':   dict(r=(-1, 0, 0), w=(0, 0, 1),  name='後視圖'),
}
_s3 = 1 / np.sqrt(3)
# 等角圖：觀察者在右前上方（+x, -y, +z）
_t_iso = np.array([1, -1, 1]) * _s3
_r_iso = np.array([1, 1, 0]) / np.sqrt(2)
_w_iso = np.cross(_t_iso, _r_iso)
VIEWS['iso'] = dict(r=tuple(_r_iso), w=tuple(_w_iso), name='等角圖')
for k, v in VIEWS.items():
    r, w = np.array(v['r'], float), np.array(v['w'], float)
    v['t'] = tuple(np.cross(r, w))


def load_stl(path):
    """讀 ASCII 或二進位 STL，回傳 (頂點 N×3, 三角形 M×3 索引)。"""
    data = open(path, 'rb').read()
    if data[:5] == b'solid' and b'facet' in data[:300]:
        vals = []
        for line in data.decode('ascii', 'ignore').splitlines():
            s = line.strip()
            if s.startswith('vertex'):
                vals.append([float(x) for x in s.split()[1:4]])
        tri = np.array(vals, float).reshape(-1, 3, 3)
    else:
        n = int(np.frombuffer(data[80:84], '<u4')[0])
        rec = np.frombuffer(data[84:84 + n * 50], dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]))
        tri = rec['v'].astype(float)
    key = np.round(tri.reshape(-1, 3), 4)
    verts, inv = np.unique(key, axis=0, return_inverse=True)
    faces = inv.reshape(-1, 3)
    # 去掉退化三角形
    a, b, c = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
    area = np.linalg.norm(np.cross(b - a, c - a), axis=1)
    return verts, faces[area > 1e-9]


def write_binary_stl(path, verts, faces):
    tri = verts[faces].astype('<f4')
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    rec = np.zeros(len(faces), dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]))
    rec['n'] = n
    rec['v'] = tri
    with open(path, 'wb') as f:
        f.write(b'orthographic library (generated)'.ljust(80, b' '))
        f.write(np.array([len(faces)], '<u4').tobytes())
        f.write(rec.tobytes())


class Mesh:
    def __init__(self, verts, faces):
        self.v, self.f = verts, faces
        a, b, c = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
        n = np.cross(b - a, c - a)
        self.n = n / np.linalg.norm(n, axis=1, keepdims=True)
        self.scale = float(np.ptp(verts, axis=0).max())
        edges = {}
        for fi, (i, j, k) in enumerate(faces):
            for p, q in ((i, j), (j, k), (k, i)):
                key = (p, q) if p < q else (q, p)
                edges.setdefault(key, []).append(fi)
        self.edges = edges
        self.tri = np.stack([a, b, c], axis=1)

    def candidate_edges(self, t, crease_deg=20.0):
        t = np.asarray(t, float)
        cos_th = np.cos(np.radians(crease_deg))
        out = []
        for (p, q), fs in self.edges.items():
            if len(fs) != 2:
                out.append((p, q)); continue
            n1, n2 = self.n[fs[0]], self.n[fs[1]]
            if np.dot(n1, n2) < cos_th:
                out.append((p, q)); continue
            d1, d2 = np.dot(n1, t), np.dot(n2, t)
            c1 = 0 if abs(d1) < 1e-6 else (1 if d1 > 0 else -1)
            c2 = 0 if abs(d2) < 1e-6 else (1 if d2 > 0 else -1)
            if c1 != c2:
                out.append((p, q))
        return out

    def occluded(self, pts, t):
        """pts（K×3）沿 t 方向往觀察者射出，是否打到任何三角形。"""
        t = np.asarray(t, float)
        eps = 1e-5 * self.scale
        v0, v1, v2 = self.tri[:, 0], self.tri[:, 1], self.tri[:, 2]
        e1, e2 = v1 - v0, v2 - v0
        h = np.cross(t, e2)
        det = np.einsum('ij,ij->i', e1, h)
        ok = np.abs(det) > 1e-12
        e1, e2, v0, h, det = e1[ok], e2[ok], v0[ok], h[ok], det[ok]
        inv = 1.0 / det
        res = np.zeros(len(pts), bool)
        for s in range(0, len(pts), 256):
            P = pts[s:s + 256]
            sv = P[:, None, :] - v0[None, :, :]
            u = np.einsum('kij,ij->ki', sv, h) * inv
            q = np.cross(sv, e1[None, :, :])
            vv = np.einsum('j,kij->ki', t, q) * inv
            tt = np.einsum('ij,kij->ki', e2, q) * inv
            tol = 1e-7
            hit = (u >= -tol) & (vv >= -tol) & (u + vv <= 1 + tol) & (tt > eps)
            res[s:s + 256] = hit.any(axis=1)
        return res


def _split_params(P, Q, tol):
    """P、Q：E×2 線段端點（2D）。回傳每段的切點參數列表（含 0、1）。"""
    E = len(P)
    D = Q - P
    splits = [[0.0, 1.0] for _ in range(E)]
    L2 = np.einsum('ij,ij->i', D, D)
    for i in range(E):
        if L2[i] < tol * tol:
            continue
        d = D[i]
        # 與其他線段的真交點
        r = P - P[i]          # E×2
        den = d[0] * D[:, 1] - d[1] * D[:, 0]
        with np.errstate(divide='ignore', invalid='ignore'):
            s = (r[:, 0] * D[:, 1] - r[:, 1] * D[:, 0]) / den
            u = (r[:, 0] * d[1] - r[:, 1] * d[0]) / den
        ok = (np.abs(den) > 1e-12) & (s > 1e-9) & (s < 1 - 1e-9) & (u > -1e-9) & (u < 1 + 1e-9)
        splits[i].extend(s[ok].tolist())
        # 其他線段端點落在本線段上（T 形接點、共線重疊）
        for X in (P, Q):
            w = X - P[i]
            s2 = (w @ d) / L2[i]
            dist = np.abs(w[:, 0] * d[1] - w[:, 1] * d[0]) / np.sqrt(L2[i])
            ok2 = (dist < tol) & (s2 > 1e-9) & (s2 < 1 - 1e-9)
            splits[i].extend(s2[ok2].tolist())
    return [sorted(set(np.round(sp, 9))) for sp in splits]


def _line_key(a, b, qa=1e-4, qo=2e-3):
    d = b - a
    ang = np.arctan2(d[1], d[0]) % np.pi
    if ang > np.pi - 1e-6:
        ang = 0.0
    n = np.array([-np.sin(ang), np.cos(ang)])
    off = float(n @ a)
    return (round(ang / qa), round(off / qo)), ang


def _union(iv):
    iv = sorted(iv)
    out = []
    for a, b in iv:
        if out and a <= out[-1][1] + 1e-6:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def _subtract(iv, cut):
    res = []
    for a, b in iv:
        segs = [[a, b]]
        for c, d in cut:
            nxt = []
            for x, y in segs:
                if d <= x + 1e-6 or c >= y - 1e-6:
                    nxt.append([x, y])
                else:
                    if c > x + 1e-6:
                        nxt.append([x, c])
                    if d < y - 1e-6:
                        nxt.append([d, y])
            segs = nxt
        res.extend(segs)
    return res


def project(mesh, view, with_hidden=True):
    """回傳 {'vis': [segs], 'hid': [segs]}，seg = (u1, v1, u2, v2)，單位 mm。"""
    V = VIEWS[view]
    r, w, t = (np.array(V[k], float) for k in ('r', 'w', 't'))
    cand = mesh.candidate_edges(t)
    A3 = mesh.v[[p for p, q in cand]]
    B3 = mesh.v[[q for p, q in cand]]
    A2 = np.stack([A3 @ r, A3 @ w], 1)
    B2 = np.stack([B3 @ r, B3 @ w], 1)
    keep = np.linalg.norm(B2 - A2, axis=1) > 1e-4
    A3, B3, A2, B2 = A3[keep], B3[keep], A2[keep], B2[keep]
    tol = 1e-4 * mesh.scale
    splits = _split_params(A2, B2, tol)
    sub = []   # (i, s0, s1)
    for i, sp in enumerate(splits):
        for s0, s1 in zip(sp[:-1], sp[1:]):
            if (s1 - s0) * np.linalg.norm(B2[i] - A2[i]) > 1e-5:
                sub.append((i, s0, s1))
    idx = np.array([s[0] for s in sub])
    sm = np.array([(s[1] + s[2]) / 2 for s in sub])
    mid3 = A3[idx] + (B3[idx] - A3[idx]) * sm[:, None]
    hidden = mesh.occluded(mid3, t)
    groups = {}
    for (i, s0, s1), hflag in zip(sub, hidden):
        a = A2[i] + (B2[i] - A2[i]) * s0
        b = A2[i] + (B2[i] - A2[i]) * s1
        key, ang = _line_key(A2[i], B2[i])
        g = groups.setdefault(key, dict(ang=ang, p0=A2[i].copy(), vis=[], hid=[]))
        d = np.array([np.cos(g['ang']), np.sin(g['ang'])])
        ta, tb = float((a - g['p0']) @ d), float((b - g['p0']) @ d)
        (g['hid'] if hflag else g['vis']).append((min(ta, tb), max(ta, tb)))
    out = {'vis': [], 'hid': []}
    for g in groups.values():
        d = np.array([np.cos(g['ang']), np.sin(g['ang'])])
        vis = _union(g['vis'])
        hid = _subtract(_union(g['hid']), vis) if with_hidden else []
        for kind, iv in (('vis', vis), ('hid', hid)):
            for a, b in iv:
                if b - a < 0.05:
                    continue
                pa, pb = g['p0'] + d * a, g['p0'] + d * b
                out[kind].append((pa[0], pa[1], pb[0], pb[1]))
    return out


def chain(segs, nd=2):
    """把首尾相接的線段串成折線（減少資料量；虛線沿折線連續）。"""
    def k(x, y):
        return (round(x, nd), round(y, nd))
    adj = {}
    for i, (x1, y1, x2, y2) in enumerate(segs):
        adj.setdefault(k(x1, y1), []).append(i)
        adj.setdefault(k(x2, y2), []).append(i)
    used = [False] * len(segs)
    lines = []

    def other(i, p):
        x1, y1, x2, y2 = segs[i]
        return k(x2, y2) if k(x1, y1) == p else k(x1, y1)

    # 從端點（度數≠2）開始串，再處理封閉環
    starts = [p for p, l in adj.items() if len(l) != 2] + list(adj.keys())
    for p0 in starts:
        for i0 in adj[p0]:
            if used[i0]:
                continue
            pts = [p0]
            i, p = i0, p0
            while True:
                used[i] = True
                q = other(i, p)
                pts.append(q)
                nxt = [j for j in adj[q] if not used[j]]
                if len(adj[q]) != 2 or not nxt:
                    break
                i, p = nxt[0], q
            lines.append(pts)
    return lines


def center_lines(solid, view, bbox, ext=3.0):
    """依物件定義中的圓柱（凸台、孔）產生中心線（細鏈線）。"""
    V = VIEWS[view]
    r, w, t = (np.array(V[k], float) for k in ('r', 'w', 't'))
    AXV = {'x': np.array([1., 0, 0]), 'y': np.array([0., 1, 0]), 'z': np.array([0., 0, 1])}
    lo, hi = bbox
    segs = []
    cyls = [p for p in solid.add + solid.cut if p.kind == 'cyl']
    # 同軸者合併（取最大半徑、最長範圍）
    groups = {}
    for c in cyls:
        key = (c.axis, round(c.c[0], 3), round(c.c[1], 3))
        g = groups.setdefault(key, dict(r=0, a0=1e9, a1=-1e9, cyl=c))
        g['r'] = max(g['r'], c.r)
        g['a0'] = min(g['a0'], c.a0)
        g['a1'] = max(g['a1'], c.a1)
    for (axis, c0, c1), g in groups.items():
        ai = 'xyz'.index(axis)
        oth = [i for i in range(3) if i != ai]
        a0 = max(g['a0'], lo[ai]); a1 = min(g['a1'], hi[ai])
        P0 = np.zeros(3); P0[oth[0]] = c0; P0[oth[1]] = c1
        av = AXV[axis]
        if abs(abs(av @ t) - 1) < 1e-9:      # 軸向對著觀察者：十字中心線
            cu, cv = P0 @ r, P0 @ w
            L = g['r'] + ext
            segs.append((cu - L, cv, cu + L, cv))
            segs.append((cu, cv - L, cu, cv + L))
        elif abs(av @ t) < 1e-9:              # 軸與視線垂直：一條沿軸的中心線
            A = P0 + av * (a0 - ext); B = P0 + av * (a1 + ext)
            segs.append((A @ r, A @ w, B @ r, B @ w))
    segs.extend(solid.extra_center.get(view, []))
    # 共線且重疊的中心線合併（例如長圓孔兩端的十字＋沿長度的中心線 → 一條）
    groups2 = {}
    for s in segs:
        a, b = np.array(s[:2]), np.array(s[2:])
        key, ang = _line_key(a, b)
        g = groups2.setdefault(key, dict(ang=ang, p0=a, iv=[]))
        d = np.array([np.cos(ang), np.sin(ang)])
        ta, tb = float((a - g['p0']) @ d), float((b - g['p0']) @ d)
        g['iv'].append((min(ta, tb), max(ta, tb)))
    out = []
    for g in groups2.values():
        d = np.array([np.cos(g['ang']), np.sin(g['ang'])])
        for a, b in _union(g['iv']):
            pa, pb = g['p0'] + d * a, g['p0'] + d * b
            out.append((pa[0], pa[1], pb[0], pb[1]))
    return out
